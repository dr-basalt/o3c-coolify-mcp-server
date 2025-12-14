import { z } from 'zod';

export const ConfigSchema = z.object({
  // Server Config
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Coolify API Config
  COOLIFY_BASE_URL: z
    .string()
    .url()
    .describe('Coolify API base URL (e.g., https://app.coolify.io/api/v1)'),
  COOLIFY_API_TOKEN: z.string().min(1).describe('Coolify API Bearer token'),
  COOLIFY_TIMEOUT_MS: z.coerce.number().default(30000),
  COOLIFY_MAX_RETRIES: z.coerce.number().default(3),

  // MCP Server Config
  MCP_SERVER_NAME: z.string().default('coolify-mcp-server'),
  MCP_SERVER_VERSION: z.string().default('1.0.0'),

  // Security
  API_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 min
  API_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Monitoring
  ENABLE_PROMETHEUS: z.coerce.boolean().default(true),
  ENABLE_HEALTH_CHECK: z.coerce.boolean().default(true),

  // Feature Flags
  ENABLE_CACHE: z.coerce.boolean().default(true),
  CACHE_TTL_SECONDS: z.coerce.number().default(300),
});

export type Config = z.infer<typeof ConfigSchema>;

export function validateConfig(config: Record<string, unknown>): Config {
  const result = ConfigSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new Error(`Configuration validation failed:\n${errors}`);
  }

  return result.data;
}
