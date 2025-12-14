import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCoolifyTools } from "./tools/coolify-tools.js";
import { startStdioTransport } from "./transports/stdio.js";
import { startSseTransport } from "./transports/sse.js";
import { startStreamableTransport } from "./transports/streamable.js";
import { logger } from "./utils/logger.js";

export interface ServerConfig {
  transport: "stdio" | "sse" | "streamable";
  port: number;
  host: string;
  coolify: {
    apiUrl: string;
    apiToken: string;
  };
}

export function createMcpServer(config: ServerConfig): McpServer {
  const server = new McpServer({
    name: "coolify-mcp-server",
    version: "1.0.0",
  });

  // Register all Coolify tools
  registerCoolifyTools(server, config.coolify);

  logger.info("MCP Server created with Coolify tools registered");

  return server;
}

export async function startServer(config: ServerConfig): Promise<void> {
  const server = createMcpServer(config);

  switch (config.transport) {
    case "stdio":
      await startStdioTransport(server);
      break;
    case "sse":
      await startSseTransport(server, config);
      break;
    case "streamable":
      await startStreamableTransport(server, config);
      break;
    default:
      throw new Error(`Unknown transport: ${config.transport}`);
  }
}
