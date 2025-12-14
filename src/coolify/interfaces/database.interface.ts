export type DatabaseType =
  | 'postgresql'
  | 'mysql'
  | 'mariadb'
  | 'mongodb'
  | 'redis'
  | 'keydb'
  | 'dragonfly'
  | 'clickhouse';

export interface Database {
  uuid: string;
  name: string;
  description?: string;
  type: DatabaseType;
  status?: string;
  internal_db_url?: string;
  external_db_url?: string;
  project_uuid?: string;
  server_uuid?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDatabaseDto {
  type: DatabaseType;
  name: string;
  server_uuid: string;
  project_uuid: string;
  description?: string;
  image?: string;
  instant_deploy?: boolean;
  // PostgreSQL specific
  postgres_user?: string;
  postgres_password?: string;
  postgres_db?: string;
  // MySQL/MariaDB specific
  mysql_root_password?: string;
  mysql_user?: string;
  mysql_password?: string;
  mysql_database?: string;
  // MongoDB specific
  mongo_initdb_root_username?: string;
  mongo_initdb_root_password?: string;
  mongo_initdb_database?: string;
  // Redis specific
  redis_password?: string;
}

export interface UpdateDatabaseDto {
  name?: string;
  description?: string;
  image?: string;
}

export interface DeleteDatabaseParams {
  delete_configurations?: boolean;
  delete_volumes?: boolean;
  docker_cleanup?: boolean;
}

export interface ListDatabasesParams {
  page?: number;
  per_page?: number;
}

export interface DatabaseBackup {
  uuid: string;
  database_uuid: string;
  frequency?: string;
  save_count?: number;
  s3_storage_uuid?: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDatabaseBackupDto {
  frequency?: string;
  save_count?: number;
  s3_storage_uuid?: string;
  enabled?: boolean;
}
