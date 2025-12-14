import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../utils/logger.js";
import type { ServerConfig } from "../server.js";
import { randomUUID } from "crypto";

export async function startStreamableTransport(
  server: McpServer,
  config: ServerConfig
): Promise<void> {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }));
  app.use(express.json());

  // Store transports by session ID for stateful mode
  const transports = new Map<string, StreamableHTTPServerTransport>();

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "healthy",
      transport: "streamable",
      sessions: transports.size,
      uptime: process.uptime(),
    });
  });

  // MCP info endpoint
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      name: "coolify-mcp-server",
      version: "1.0.0",
      transport: "streamable-http",
      endpoints: {
        mcp: "/mcp",
        health: "/health",
      },
    });
  });

  // Main MCP endpoint - handles all MCP communication
  app.post("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports.has(sessionId)) {
      // Reuse existing transport for this session
      transport = transports.get(sessionId)!;
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New session - create transport
      const newSessionId = randomUUID();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
        onsessioninitialized: (id) => {
          transports.set(id, transport);
          logger.info({ sessionId: id }, "New streamable session initialized");
        },
      });

      // Clean up on close
      transport.onclose = () => {
        const id = newSessionId;
        transports.delete(id);
        logger.info({ sessionId: id }, "Streamable session closed");
      };

      // Connect to server
      await server.connect(transport);
    } else {
      // Invalid request - no session ID and not an initialize request
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32600,
          message: "Bad Request: No valid session ID provided and not an initialize request",
        },
        id: null,
      });
      return;
    }

    // Handle the request
    await transport.handleRequest(req, res);
  });

  // Handle GET requests for SSE streams (for server-initiated messages)
  app.get("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string;

    if (!sessionId || !transports.has(sessionId)) {
      res.status(400).json({
        error: "Invalid or missing session ID",
      });
      return;
    }

    const transport = transports.get(sessionId)!;
    await transport.handleRequest(req, res);
  });

  // Handle DELETE requests for session termination
  app.delete("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string;

    if (!sessionId || !transports.has(sessionId)) {
      res.status(404).json({
        error: "Session not found",
      });
      return;
    }

    const transport = transports.get(sessionId)!;
    await transport.close();
    transports.delete(sessionId);

    res.status(200).json({ message: "Session terminated" });
    logger.info({ sessionId }, "Session terminated by client");
  });

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ error: err }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
  });

  // Start the server
  const httpServer = app.listen(config.port, config.host, () => {
    logger.info(
      { host: config.host, port: config.port, transport: "streamable" },
      "MCP Streamable HTTP Server listening"
    );
    console.log(`\n🚀 Coolify MCP Server (Streamable HTTP) running at http://${config.host}:${config.port}`);
    console.log(`   - MCP endpoint: http://${config.host}:${config.port}/mcp`);
    console.log(`   - Health check: http://${config.host}:${config.port}/health\n`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info("Shutting down Streamable HTTP server...");

    // Close all transports
    for (const [sessionId, transport] of transports) {
      await transport.close();
      transports.delete(sessionId);
    }

    await server.close();
    httpServer.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
