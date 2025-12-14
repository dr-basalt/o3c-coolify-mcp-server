export interface Server {
  uuid: string;
  name: string;
  description?: string;
  ip: string;
  port?: number;
  user?: string;
  private_key_uuid?: string;
  is_reachable?: boolean;
  is_usable?: boolean;
  validation_logs?: string;
  settings?: ServerSettings;
  created_at?: string;
  updated_at?: string;
}

export interface ServerSettings {
  is_build_server?: boolean;
  concurrent_builds?: number;
  dynamic_timeout?: number;
}

export interface CreateServerDto {
  name: string;
  description?: string;
  ip: string;
  port?: number;
  user?: string;
  private_key_uuid: string;
  instant_validate?: boolean;
}

export interface UpdateServerDto {
  name?: string;
  description?: string;
  ip?: string;
  port?: number;
  user?: string;
  private_key_uuid?: string;
}

export interface ListServersParams {
  page?: number;
  per_page?: number;
}

export interface ServerDomain {
  id: number;
  domain: string;
  ip?: string;
}

export interface ServerResources {
  applications: number;
  databases: number;
  services: number;
}
