import { z } from 'zod';

// Validation Schemas
export const ListServicesSchema = z.object({
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
});

export const CreateServiceSchema = z.object({
  type: z.string().min(1),
  name: z.string().min(1).max(255),
  server_uuid: z.string().uuid(),
  project_uuid: z.string().uuid(),
  description: z.string().optional(),
  docker_compose: z.string().optional(),
  instant_deploy: z.boolean().default(false),
});

export const GetServiceSchema = z.object({
  uuid: z.string().uuid(),
});

export const DeleteServiceSchema = z.object({
  uuid: z.string().uuid(),
  delete_configurations: z.boolean().default(true),
  delete_volumes: z.boolean().default(false),
  docker_cleanup: z.boolean().default(true),
});

export const StartServiceSchema = z.object({
  uuid: z.string().uuid(),
});

export const StopServiceSchema = z.object({
  uuid: z.string().uuid(),
});

export const RestartServiceSchema = z.object({
  uuid: z.string().uuid(),
});

// Tool Definitions
export const ServiceTools = [
  {
    name: 'coolify_list_services',
    description:
      'List all services managed by Coolify with optional pagination',
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
    name: 'coolify_create_service',
    description:
      'Create a new service in Coolify from the service catalog or docker-compose',
    inputSchema: {
      type: 'object' as const,
      properties: {
        type: {
          type: 'string',
          description:
            'Service type from Coolify catalog (e.g., plausible, grafana, minio)',
        },
        name: { type: 'string', description: 'Service name' },
        server_uuid: {
          type: 'string',
          description: 'Server UUID where service will be deployed',
        },
        project_uuid: {
          type: 'string',
          description: 'Project UUID where service will be created',
        },
        description: { type: 'string', description: 'Service description' },
        docker_compose: {
          type: 'string',
          description: 'Custom docker-compose.yml content (optional)',
        },
        instant_deploy: {
          type: 'boolean',
          description: 'Deploy immediately after creation',
        },
      },
      required: ['type', 'name', 'server_uuid', 'project_uuid'],
    },
  },
  {
    name: 'coolify_get_service',
    description: 'Get detailed information about a specific service',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Service UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_delete_service',
    description: 'Delete a service with cleanup options',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Service UUID' },
        delete_configurations: {
          type: 'boolean',
          description: 'Delete all configurations (default: true)',
        },
        delete_volumes: {
          type: 'boolean',
          description: 'Delete persistent volumes (default: false)',
        },
        docker_cleanup: {
          type: 'boolean',
          description: 'Clean up Docker resources (default: true)',
        },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_start_service',
    description: 'Start a stopped service',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Service UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_stop_service',
    description: 'Stop a running service',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Service UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_restart_service',
    description: 'Restart a service',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Service UUID' },
      },
      required: ['uuid'],
    },
  },
];

// Export validation schemas
export const ServiceSchemas = {
  list: ListServicesSchema,
  create: CreateServiceSchema,
  get: GetServiceSchema,
  delete: DeleteServiceSchema,
  start: StartServiceSchema,
  stop: StopServiceSchema,
  restart: RestartServiceSchema,
};
