import { z } from 'zod';

// Validation Schemas
export const ListServersSchema = z.object({
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
});

export const CreateServerSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  ip: z.string().ip(),
  port: z.number().min(1).max(65535).default(22),
  user: z.string().default('root'),
  private_key_uuid: z.string().uuid(),
  instant_validate: z.boolean().default(true),
});

export const GetServerSchema = z.object({
  uuid: z.string().uuid(),
});

export const UpdateServerSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  ip: z.string().ip().optional(),
  port: z.number().min(1).max(65535).optional(),
  user: z.string().optional(),
  private_key_uuid: z.string().uuid().optional(),
});

export const DeleteServerSchema = z.object({
  uuid: z.string().uuid(),
});

export const ValidateServerSchema = z.object({
  uuid: z.string().uuid(),
});

export const GetServerDomainsSchema = z.object({
  uuid: z.string().uuid(),
});

export const GetServerResourcesSchema = z.object({
  uuid: z.string().uuid(),
});

// Tool Definitions
export const ServerTools = [
  {
    name: 'coolify_list_servers',
    description: 'List all servers managed by Coolify with optional pagination',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        per_page: {
          type: 'number',
          description: 'Items per page (default: 20, max: 100)',
        },
      },
    },
  },
  {
    name: 'coolify_create_server',
    description: 'Add a new server to Coolify for deployment',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Server name' },
        description: { type: 'string', description: 'Server description' },
        ip: { type: 'string', description: 'Server IP address' },
        port: { type: 'number', description: 'SSH port (default: 22)' },
        user: { type: 'string', description: 'SSH user (default: root)' },
        private_key_uuid: {
          type: 'string',
          description: 'UUID of the private key for SSH authentication',
        },
        instant_validate: {
          type: 'boolean',
          description: 'Validate server connection immediately (default: true)',
        },
      },
      required: ['name', 'ip', 'private_key_uuid'],
    },
  },
  {
    name: 'coolify_get_server',
    description: 'Get detailed information about a specific server',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Server UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_update_server',
    description: 'Update an existing server configuration',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Server UUID' },
        name: { type: 'string', description: 'New server name' },
        description: { type: 'string', description: 'Server description' },
        ip: { type: 'string', description: 'Server IP address' },
        port: { type: 'number', description: 'SSH port' },
        user: { type: 'string', description: 'SSH user' },
        private_key_uuid: { type: 'string', description: 'Private key UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_delete_server',
    description: 'Remove a server from Coolify',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Server UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_validate_server',
    description: 'Validate server connection and configuration',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Server UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_get_server_domains',
    description: 'Get all domains configured on a server',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Server UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_get_server_resources',
    description:
      'Get all resources (applications, databases, services) deployed on a server',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Server UUID' },
      },
      required: ['uuid'],
    },
  },
];

// Export validation schemas
export const ServerSchemas = {
  list: ListServersSchema,
  create: CreateServerSchema,
  get: GetServerSchema,
  update: UpdateServerSchema,
  delete: DeleteServerSchema,
  validate: ValidateServerSchema,
  getDomains: GetServerDomainsSchema,
  getResources: GetServerResourcesSchema,
};
