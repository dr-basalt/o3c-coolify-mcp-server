import { z } from 'zod';

const DatabaseTypeEnum = z.enum([
  'postgresql',
  'mysql',
  'mariadb',
  'mongodb',
  'redis',
  'keydb',
  'dragonfly',
  'clickhouse',
]);

// Validation Schemas
export const ListDatabasesSchema = z.object({
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
});

export const CreateDatabaseSchema = z.object({
  type: DatabaseTypeEnum,
  name: z.string().min(1).max(255),
  server_uuid: z.string().uuid(),
  project_uuid: z.string().uuid(),
  description: z.string().optional(),
  image: z.string().optional(),
  instant_deploy: z.boolean().default(false),
  // PostgreSQL specific
  postgres_user: z.string().optional(),
  postgres_password: z.string().optional(),
  postgres_db: z.string().optional(),
  // MySQL/MariaDB specific
  mysql_root_password: z.string().optional(),
  mysql_user: z.string().optional(),
  mysql_password: z.string().optional(),
  mysql_database: z.string().optional(),
  // MongoDB specific
  mongo_initdb_root_username: z.string().optional(),
  mongo_initdb_root_password: z.string().optional(),
  mongo_initdb_database: z.string().optional(),
  // Redis specific
  redis_password: z.string().optional(),
});

export const GetDatabaseSchema = z.object({
  uuid: z.string().uuid(),
});

export const UpdateDatabaseSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const DeleteDatabaseSchema = z.object({
  uuid: z.string().uuid(),
  delete_configurations: z.boolean().default(true),
  delete_volumes: z.boolean().default(false),
  docker_cleanup: z.boolean().default(true),
});

export const StartDatabaseSchema = z.object({
  uuid: z.string().uuid(),
});

export const StopDatabaseSchema = z.object({
  uuid: z.string().uuid(),
});

export const RestartDatabaseSchema = z.object({
  uuid: z.string().uuid(),
});

// Backup schemas
export const ListDatabaseBackupsSchema = z.object({
  database_uuid: z.string().uuid(),
});

export const CreateDatabaseBackupSchema = z.object({
  database_uuid: z.string().uuid(),
  frequency: z.string().optional(),
  save_count: z.number().min(1).optional(),
  s3_storage_uuid: z.string().uuid().optional(),
  enabled: z.boolean().default(true),
});

export const GetDatabaseBackupSchema = z.object({
  database_uuid: z.string().uuid(),
  backup_uuid: z.string().uuid(),
});

export const UpdateDatabaseBackupSchema = z.object({
  database_uuid: z.string().uuid(),
  backup_uuid: z.string().uuid(),
  frequency: z.string().optional(),
  save_count: z.number().min(1).optional(),
  s3_storage_uuid: z.string().uuid().optional(),
  enabled: z.boolean().optional(),
});

export const DeleteDatabaseBackupSchema = z.object({
  database_uuid: z.string().uuid(),
  backup_uuid: z.string().uuid(),
});

export const TriggerDatabaseBackupSchema = z.object({
  database_uuid: z.string().uuid(),
  backup_uuid: z.string().uuid(),
});

// Tool Definitions
export const DatabaseTools = [
  {
    name: 'coolify_list_databases',
    description:
      'List all databases managed by Coolify with optional pagination',
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
    name: 'coolify_create_database',
    description:
      'Create a new database in Coolify (PostgreSQL, MySQL, MariaDB, MongoDB, Redis, etc.)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        type: {
          type: 'string',
          enum: [
            'postgresql',
            'mysql',
            'mariadb',
            'mongodb',
            'redis',
            'keydb',
            'dragonfly',
            'clickhouse',
          ],
          description: 'Database type',
        },
        name: { type: 'string', description: 'Database name' },
        server_uuid: {
          type: 'string',
          description: 'Server UUID where database will be deployed',
        },
        project_uuid: {
          type: 'string',
          description: 'Project UUID where database will be created',
        },
        description: { type: 'string', description: 'Database description' },
        image: {
          type: 'string',
          description: 'Custom Docker image (optional)',
        },
        instant_deploy: {
          type: 'boolean',
          description: 'Deploy immediately after creation',
        },
        postgres_user: {
          type: 'string',
          description: 'PostgreSQL user (PostgreSQL only)',
        },
        postgres_password: {
          type: 'string',
          description: 'PostgreSQL password (PostgreSQL only)',
        },
        postgres_db: {
          type: 'string',
          description: 'PostgreSQL database name (PostgreSQL only)',
        },
        mysql_root_password: {
          type: 'string',
          description: 'MySQL root password (MySQL/MariaDB only)',
        },
        mysql_user: {
          type: 'string',
          description: 'MySQL user (MySQL/MariaDB only)',
        },
        mysql_password: {
          type: 'string',
          description: 'MySQL password (MySQL/MariaDB only)',
        },
        mysql_database: {
          type: 'string',
          description: 'MySQL database name (MySQL/MariaDB only)',
        },
        mongo_initdb_root_username: {
          type: 'string',
          description: 'MongoDB root username (MongoDB only)',
        },
        mongo_initdb_root_password: {
          type: 'string',
          description: 'MongoDB root password (MongoDB only)',
        },
        mongo_initdb_database: {
          type: 'string',
          description: 'MongoDB database name (MongoDB only)',
        },
        redis_password: {
          type: 'string',
          description: 'Redis password (Redis only)',
        },
      },
      required: ['type', 'name', 'server_uuid', 'project_uuid'],
    },
  },
  {
    name: 'coolify_get_database',
    description: 'Get detailed information about a specific database',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Database UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_update_database',
    description: 'Update an existing database configuration',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Database UUID' },
        name: { type: 'string', description: 'New database name' },
        description: { type: 'string', description: 'Database description' },
        image: { type: 'string', description: 'Docker image' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_delete_database',
    description: 'Delete a database with cleanup options',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Database UUID' },
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
    name: 'coolify_start_database',
    description: 'Start a stopped database',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Database UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_stop_database',
    description: 'Stop a running database',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Database UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_restart_database',
    description: 'Restart a database',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Database UUID' },
      },
      required: ['uuid'],
    },
  },
  // Backup tools
  {
    name: 'coolify_list_database_backups',
    description: 'List all backups configured for a database',
    inputSchema: {
      type: 'object' as const,
      properties: {
        database_uuid: { type: 'string', description: 'Database UUID' },
      },
      required: ['database_uuid'],
    },
  },
  {
    name: 'coolify_create_database_backup',
    description: 'Create a new backup configuration for a database',
    inputSchema: {
      type: 'object' as const,
      properties: {
        database_uuid: { type: 'string', description: 'Database UUID' },
        frequency: {
          type: 'string',
          description: 'Cron expression for backup frequency',
        },
        save_count: {
          type: 'number',
          description: 'Number of backups to retain',
        },
        s3_storage_uuid: {
          type: 'string',
          description: 'S3 storage UUID for remote backups',
        },
        enabled: { type: 'boolean', description: 'Enable/disable backup' },
      },
      required: ['database_uuid'],
    },
  },
  {
    name: 'coolify_get_database_backup',
    description: 'Get details of a specific backup configuration',
    inputSchema: {
      type: 'object' as const,
      properties: {
        database_uuid: { type: 'string', description: 'Database UUID' },
        backup_uuid: { type: 'string', description: 'Backup UUID' },
      },
      required: ['database_uuid', 'backup_uuid'],
    },
  },
  {
    name: 'coolify_update_database_backup',
    description: 'Update a backup configuration',
    inputSchema: {
      type: 'object' as const,
      properties: {
        database_uuid: { type: 'string', description: 'Database UUID' },
        backup_uuid: { type: 'string', description: 'Backup UUID' },
        frequency: { type: 'string', description: 'Cron expression' },
        save_count: { type: 'number', description: 'Number of backups to retain' },
        s3_storage_uuid: { type: 'string', description: 'S3 storage UUID' },
        enabled: { type: 'boolean', description: 'Enable/disable backup' },
      },
      required: ['database_uuid', 'backup_uuid'],
    },
  },
  {
    name: 'coolify_delete_database_backup',
    description: 'Delete a backup configuration',
    inputSchema: {
      type: 'object' as const,
      properties: {
        database_uuid: { type: 'string', description: 'Database UUID' },
        backup_uuid: { type: 'string', description: 'Backup UUID' },
      },
      required: ['database_uuid', 'backup_uuid'],
    },
  },
  {
    name: 'coolify_trigger_database_backup',
    description: 'Manually trigger a backup execution',
    inputSchema: {
      type: 'object' as const,
      properties: {
        database_uuid: { type: 'string', description: 'Database UUID' },
        backup_uuid: { type: 'string', description: 'Backup UUID' },
      },
      required: ['database_uuid', 'backup_uuid'],
    },
  },
];

// Export validation schemas
export const DatabaseSchemas = {
  list: ListDatabasesSchema,
  create: CreateDatabaseSchema,
  get: GetDatabaseSchema,
  update: UpdateDatabaseSchema,
  delete: DeleteDatabaseSchema,
  start: StartDatabaseSchema,
  stop: StopDatabaseSchema,
  restart: RestartDatabaseSchema,
  listBackups: ListDatabaseBackupsSchema,
  createBackup: CreateDatabaseBackupSchema,
  getBackup: GetDatabaseBackupSchema,
  updateBackup: UpdateDatabaseBackupSchema,
  deleteBackup: DeleteDatabaseBackupSchema,
  triggerBackup: TriggerDatabaseBackupSchema,
};
