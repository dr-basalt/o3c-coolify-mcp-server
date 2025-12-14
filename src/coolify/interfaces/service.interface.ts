export interface Service {
  uuid: string;
  name: string;
  description?: string;
  type: string;
  status?: string;
  fqdn?: string;
  project_uuid?: string;
  server_uuid?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateServiceDto {
  type: string;
  name: string;
  server_uuid: string;
  project_uuid: string;
  description?: string;
  docker_compose?: string;
  instant_deploy?: boolean;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
}

export interface DeleteServiceParams {
  delete_configurations?: boolean;
  delete_volumes?: boolean;
  docker_cleanup?: boolean;
}

export interface ListServicesParams {
  page?: number;
  per_page?: number;
}
