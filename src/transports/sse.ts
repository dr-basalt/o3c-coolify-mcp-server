import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { logger } from "../utils/logger.js";
import type { ServerConfig } from "../server.js";

interface ActiveSession {
  transport: SSEServerTransport;
  createdAt: Date;
}

export async function startSseTransport(
  server: McpServer,
  config: ServerConfig
): Promise<void> {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for SSE compatibility
  }));
  app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }));
  app.use(express.json());

  // Store active SSE sessions
  const sessions = new Map<string, ActiveSession>();

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "healthy",
      transport: "sse",
      sessions: sessions.size,
      uptime: process.uptime(),
    });
  });

  // MCP info endpoint
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      name: "coolify-mcp-server",
      version: "1.0.0",
      transport: "sse",
      endpoints: {
        sse: "/sse",
        messages: "/messages",
        health: "/health",
      },
    });
  });

  // SSE endpoint - clients connect here to receive server messages
  app.get("/sse", async (req: Request, res: Response) => {
    logger.info({ ip: req.ip }, "New SSE connection");

    // Create SSE transport for this connection
    const transport = new SSEServerTransport("/messages", res);
    const sessionId = transport.sessionId;

    sessions.set(sessionId, {
      transport,
      createdAt: new Date(),
    });

    logger.info({ sessionId }, "SSE session created");

    // Handle client disconnect
    req.on("close", () => {
      sessions.delete(sessionId);
      logger.info({ sessionId }, "SSE session closed");
    });

    // Connect the transport to the server
    await server.connect(transport);
  });

  // Messages endpoint - clients send messages here
  app.post("/messages", async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      res.status(400).json({ error: "Missing sessionId query parameter" });
      return;
    }

    const session = sessions.get(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    try {
      await session.transport.handlePostMessage(req, res);
    } catch (error) {
      logger.error({ error, sessionId }, "Error handling message");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ error: err }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
  });

  // Start the server
  const httpServer = app.listen(config.port, config.host, () => {
    logger.info(
      { host: config.host, port: config.port, transport: "sse" },
      "MCP SSE Server listening"
    );
    console.log(`\n🚀 Coolify MCP Server (SSE) running at http://${config.host}:${config.port}`);
    console.log(`   - SSE endpoint: http://${config.host}:${config.port}/sse`);
    console.log(`   - Messages endpoint: http://${config.host}:${config.port}/messages`);
    console.log(`   - Health check: http://${config.host}:${config.port}/health\n`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info("Shutting down SSE server...");

    // Close all active sessions
    for (const [sessionId] of sessions) {
      sessions.delete(sessionId);
    }

    await server.close();
    httpServer.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
