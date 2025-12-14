#!/usr/bin/env node
import { program } from "commander";
import { startServer } from "./server.js";
import { logger } from "./utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

program
  .name("coolify-mcp")
  .description("MCP Server for Coolify API - supports stdio, SSE, and streamable HTTP transports")
  .version("1.0.0")
  .option("-t, --transport <type>", "Transport type: stdio, sse, or streamable", "sse")
  .option("-p, --port <number>", "Port for HTTP server (SSE/Streamable)", "3000")
  .option("-h, --host <host>", "Host for HTTP server", "0.0.0.0")
  .option("--coolify-url <url>", "Coolify API URL", process.env.COOLIFY_API_URL)
  .option("--coolify-token <token>", "Coolify API Token", process.env.COOLIFY_API_TOKEN)
  .parse();

const options = program.opts();

async function main() {
  const transport = options.transport as "stdio" | "sse" | "streamable";
  const port = parseInt(options.port, 10);
  const host = options.host;

  const config = {
    transport,
    port,
    host,
    coolify: {
      apiUrl: options.coolifyUrl || process.env.COOLIFY_API_URL || "",
      apiToken: options.coolifyToken || process.env.COOLIFY_API_TOKEN || "",
    },
  };

  logger.info({ transport, port, host }, "Starting Coolify MCP Server");

  try {
    await startServer(config);
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}

main();
