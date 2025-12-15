import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../utils/logger.js";
import type { ServerConfig } from "../server.js";
import { randomUUID } from "crypto";
import { createMcpServer } from "../server.js";

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

  // Store Streamable HTTP transports
  const streamableTransports = new Map<string, StreamableHTTPServerTransport>();

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "healthy",
      transport: "sse+streamable",
      sseSessions: sessions.size,
      streamableSessions: streamableTransports.size,
      uptime: process.uptime(),
    });
  });

  // MCP info endpoint
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      name: "coolify-mcp-server",
      version: "1.0.0",
      transports: ["sse", "streamable-http"],
      endpoints: {
        sse: "/sse",
        messages: "/messages",
        mcp: "/mcp",
        health: "/health",
      },
    });
  });

  // ============ SSE Transport ============

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

  // Messages endpoint - clients send messages here (for SSE)
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

  // ============ Streamable HTTP Transport ============

  // Handle POST on /sse for Streamable HTTP clients that POST to the SSE URL
  app.post("/sse", async (req: Request, res: Response) => {
    await handleStreamableRequest(req, res, config);
  });

  // Main MCP endpoint for Streamable HTTP
  app.post("/mcp", async (req: Request, res: Response) => {
    await handleStreamableRequest(req, res, config);
  });

  // Handle GET requests for SSE streams on /mcp (for server-initiated messages)
  app.get("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string;

    if (!sessionId || !streamableTransports.has(sessionId)) {
      res.status(400).json({
        error: "Invalid or missing session ID",
      });
      return;
    }

    const transport = streamableTransports.get(sessionId)!;
    await transport.handleRequest(req, res);
  });

  // Handle DELETE requests for session termination
  app.delete("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string;

    if (!sessionId || !streamableTransports.has(sessionId)) {
      res.status(404).json({
        error: "Session not found",
      });
      return;
    }

    const transport = streamableTransports.get(sessionId)!;
    await transport.close();
    streamableTransports.delete(sessionId);

    res.status(200).json({ message: "Session terminated" });
    logger.info({ sessionId }, "Streamable session terminated by client");
  });

  async function handleStreamableRequest(req: Request, res: Response, config: ServerConfig) {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && streamableTransports.has(sessionId)) {
      // Reuse existing transport for this session
      transport = streamableTransports.get(sessionId)!;
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New session - create transport and a new server instance
      const newSessionId = randomUUID();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
        onsessioninitialized: (id) => {
          streamableTransports.set(id, transport);
          logger.info({ sessionId: id }, "New streamable session initialized");
        },
      });

      // Clean up on close
      transport.onclose = () => {
        streamableTransports.delete(newSessionId);
        logger.info({ sessionId: newSessionId }, "Streamable session closed");
      };

      // Create a new server instance for this session
      const newServer = createMcpServer(config);
      await newServer.connect(transport);
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
  }

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ error: err }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
  });

  // Start the server
  const httpServer = app.listen(config.port, config.host, () => {
    logger.info(
      { host: config.host, port: config.port, transport: "sse+streamable" },
      "MCP Server listening"
    );
    console.log(`\n🚀 Coolify MCP Server running at http://${config.host}:${config.port}`);
    console.log(`   Supports both SSE and Streamable HTTP transports:`);
    console.log(`   - SSE: GET /sse + POST /messages`);
    console.log(`   - Streamable HTTP: POST /mcp or POST /sse`);
    console.log(`   - Health check: /health\n`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info("Shutting down server...");

    // Close all SSE sessions
    for (const [sessionId] of sessions) {
      sessions.delete(sessionId);
    }

    // Close all streamable transports
    for (const [sessionId, transport] of streamableTransports) {
      await transport.close();
      streamableTransports.delete(sessionId);
    }

    await server.close();
    httpServer.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
