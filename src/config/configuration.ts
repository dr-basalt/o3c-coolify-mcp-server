import { validateConfig } from './validation.schema';

export default () => {
  const config = validateConfig(process.env);

  return {
    nodeEnv: config.NODE_ENV,
    port: config.PORT,
    logLevel: config.LOG_LEVEL,

    coolify: {
      baseUrl: config.COOLIFY_BASE_URL,
      apiToken: config.COOLIFY_API_TOKEN,
      timeout: config.COOLIFY_TIMEOUT_MS,
      maxRetries: config.COOLIFY_MAX_RETRIES,
    },

    mcp: {
      serverName: config.MCP_SERVER_NAME,
      version: config.MCP_SERVER_VERSION,
    },

    security: {
      rateLimitWindowMs: config.API_RATE_LIMIT_WINDOW_MS,
      rateLimitMaxRequests: config.API_RATE_LIMIT_MAX_REQUESTS,
    },

    monitoring: {
      enablePrometheus: config.ENABLE_PROMETHEUS,
      enableHealthCheck: config.ENABLE_HEALTH_CHECK,
    },

    cache: {
      enabled: config.ENABLE_CACHE,
      ttlSeconds: config.CACHE_TTL_SECONDS,
    },
  };
};

export type AppConfig = ReturnType<typeof import('./configuration').default>;
