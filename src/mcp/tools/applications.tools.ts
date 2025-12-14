import { z } from 'zod';

// Validation Schemas
export const ListApplicationsSchema = z.object({
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
});

export const CreateApplicationSchema = z.object({
  name: z.string().min(1).max(255),
  project_uuid: z.string().uuid(),
  server_uuid: z.string().uuid(),
  git_repository: z.string().url().optional(),
  git_branch: z.string().optional(),
  build_pack: z
    .enum(['nixpacks', 'dockerfile', 'docker_image', 'static'])
    .optional(),
  ports_exposes: z.string().optional(),
  install_command: z.string().optional(),
  build_command: z.string().optional(),
  start_command: z.string().optional(),
  base_directory: z.string().optional(),
  publish_directory: z.string().optional(),
  environment_variables: z.record(z.string()).optional(),
  instant_deploy: z.boolean().default(false),
});

export const GetApplicationSchema = z.object({
  uuid: z.string().uuid(),
});

export const UpdateApplicationSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  fqdn: z.string().optional(),
  git_repository: z.string().url().optional(),
  git_branch: z.string().optional(),
  build_pack: z
    .enum(['nixpacks', 'dockerfile', 'docker_image', 'static'])
    .optional(),
  ports_exposes: z.string().optional(),
  install_command: z.string().optional(),
  build_command: z.string().optional(),
  start_command: z.string().optional(),
  base_directory: z.string().optional(),
  publish_directory: z.string().optional(),
});

export const DeleteApplicationSchema = z.object({
  uuid: z.string().uuid(),
  delete_configurations: z.boolean().default(true),
  delete_volumes: z.boolean().default(false),
  docker_cleanup: z.boolean().default(true),
});

export const StartApplicationSchema = z.object({
  uuid: z.string().uuid(),
});

export const StopApplicationSchema = z.object({
  uuid: z.string().uuid(),
});

export const RestartApplicationSchema = z.object({
  uuid: z.string().uuid(),
});

export const DeployApplicationSchema = z.object({
  uuid: z.string().uuid(),
  force_rebuild: z.boolean().default(false),
});

export const GetApplicationLogsSchema = z.object({
  uuid: z.string().uuid(),
  since: z.string().optional(),
  until: z.string().optional(),
  tail: z.number().min(1).max(1000).default(100),
});

export const ListApplicationEnvsSchema = z.object({
  uuid: z.string().uuid(),
});

export const CreateApplicationEnvSchema = z.object({
  uuid: z.string().uuid(),
  key: z.string().min(1),
  value: z.string(),
  is_build_time: z.boolean().default(false),
  is_preview: z.boolean().default(false),
  is_secret: z.boolean().default(false),
});

export const BulkUpdateApplicationEnvsSchema = z.object({
  uuid: z.string().uuid(),
  variables: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
      is_build_time: z.boolean().optional(),
      is_preview: z.boolean().optional(),
      is_secret: z.boolean().optional(),
    }),
  ),
});

export const DeleteApplicationEnvSchema = z.object({
  uuid: z.string().uuid(),
  env_uuid: z.string().uuid(),
});

// Tool Definitions
export const ApplicationTools = [
  {
    name: 'coolify_list_applications',
    description:
      'List all applications managed by Coolify with optional pagination',
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
    name: 'coolify_create_application',
    description:
      'Create a new application in Coolify with Git repository or Docker image',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Application name' },
        project_uuid: {
          type: 'string',
          description: 'Project UUID where app will be created',
        },
        server_uuid: {
          type: 'string',
          description: 'Server UUID where app will be deployed',
        },
        git_repository: {
          type: 'string',
          description: 'Git repository URL (optional)',
        },
        git_branch: { type: 'string', description: 'Git branch (default: main)' },
        build_pack: {
          type: 'string',
          enum: ['nixpacks', 'dockerfile', 'docker_image', 'static'],
          description: 'Build pack type (default: nixpacks)',
        },
        ports_exposes: {
          type: 'string',
          description: 'Exposed ports (e.g., "3000,8080")',
        },
        install_command: { type: 'string', description: 'Install command' },
        build_command: { type: 'string', description: 'Build command' },
        start_command: { type: 'string', description: 'Start command' },
        base_directory: { type: 'string', description: 'Base directory in repo' },
        publish_directory: {
          type: 'string',
          description: 'Static site publish directory',
        },
        environment_variables: {
          type: 'object',
          description: 'Environment variables key-value pairs',
        },
        instant_deploy: {
          type: 'boolean',
          description: 'Deploy immediately after creation',
        },
      },
      required: ['name', 'project_uuid', 'server_uuid'],
    },
  },
  {
    name: 'coolify_get_application',
    description: 'Get detailed information about a specific application',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Application UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_update_application',
    description: 'Update an existing application configuration',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Application UUID' },
        name: { type: 'string', description: 'New application name' },
        description: { type: 'string', description: 'Application description' },
        fqdn: { type: 'string', description: 'Fully qualified domain name' },
        git_repository: { type: 'string', description: 'Git repository URL' },
        git_branch: { type: 'string', description: 'New Git branch' },
        build_pack: {
          type: 'string',
          enum: ['nixpacks', 'dockerfile', 'docker_image', 'static'],
          description: 'Build pack type',
        },
        ports_exposes: { type: 'string', description: 'Exposed ports' },
        install_command: { type: 'string', description: 'Install command' },
        build_command: { type: 'string', description: 'New build command' },
        start_command: { type: 'string', description: 'New start command' },
        base_directory: { type: 'string', description: 'Base directory' },
        publish_directory: { type: 'string', description: 'Publish directory' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_delete_application',
    description: 'Delete an application with cleanup options',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Application UUID' },
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
    name: 'coolify_start_application',
    description: 'Start a stopped application',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Application UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_stop_application',
    description: 'Stop a running application',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Application UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_restart_application',
    description: 'Restart an application',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Application UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_deploy_application',
    description: 'Trigger a new deployment for an application',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Application UUID' },
        force_rebuild: {
          type: 'boolean',
          description: 'Force complete rebuild (default: false)',
        },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_get_application_logs',
    description: 'Get application logs with optional filtering',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Application UUID' },
        since: {
          type: 'string',
          description: 'Show logs since timestamp (ISO 8601)',
        },
        until: {
          type: 'string',
          description: 'Show logs until timestamp (ISO 8601)',
        },
        tail: {
          type: 'number',
          description: 'Number of lines to tail (default: 100, max: 1000)',
        },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_list_application_envs',
    description: 'List all environment variables for an application',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Application UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_create_application_env',
    description: 'Create or update an environment variable for an application',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Application UUID' },
        key: { type: 'string', description: 'Environment variable key' },
        value: { type: 'string', description: 'Environment variable value' },
        is_build_time: {
          type: 'boolean',
          description: 'Available during build time (default: false)',
        },
        is_preview: {
          type: 'boolean',
          description: 'Available for preview deployments (default: false)',
        },
        is_secret: {
          type: 'boolean',
          description: 'Mark as secret (hidden in UI, default: false)',
        },
      },
      required: ['uuid', 'key', 'value'],
    },
  },
  {
    name: 'coolify_bulk_update_application_envs',
    description: 'Bulk update multiple environment variables at once',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Application UUID' },
        variables: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
              is_build_time: { type: 'boolean' },
              is_preview: { type: 'boolean' },
              is_secret: { type: 'boolean' },
            },
            required: ['key', 'value'],
          },
          description: 'Array of environment variables to create/update',
        },
      },
      required: ['uuid', 'variables'],
    },
  },
  {
    name: 'coolify_delete_application_env',
    description: 'Delete an environment variable from an application',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Application UUID' },
        env_uuid: {
          type: 'string',
          description: 'Environment variable UUID to delete',
        },
      },
      required: ['uuid', 'env_uuid'],
    },
  },
];

// Export validation schemas
export const ApplicationSchemas = {
  list: ListApplicationsSchema,
  create: CreateApplicationSchema,
  get: GetApplicationSchema,
  update: UpdateApplicationSchema,
  delete: DeleteApplicationSchema,
  start: StartApplicationSchema,
  stop: StopApplicationSchema,
  restart: RestartApplicationSchema,
  deploy: DeployApplicationSchema,
  logs: GetApplicationLogsSchema,
  listEnvs: ListApplicationEnvsSchema,
  createEnv: CreateApplicationEnvSchema,
  bulkUpdateEnvs: BulkUpdateApplicationEnvsSchema,
  deleteEnv: DeleteApplicationEnvSchema,
};
