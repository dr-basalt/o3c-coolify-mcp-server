import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const isStdio = process.argv.includes("stdio");

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isProduction || isStdio
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
  // When using stdio transport, we must not log to stdout
  // as it would interfere with MCP protocol
  enabled: !isStdio || process.env.LOG_FILE !== undefined,
});

// For stdio mode, optionally log to a file
if (isStdio && process.env.LOG_FILE) {
  const fileLogger = pino(pino.destination(process.env.LOG_FILE));
  Object.assign(logger, fileLogger);
}
