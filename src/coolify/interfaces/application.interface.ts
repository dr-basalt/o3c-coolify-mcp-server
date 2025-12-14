export interface Application {
  uuid: string;
  name: string;
  description?: string;
  fqdn?: string;
  git_repository?: string;
  git_branch?: string;
  git_commit_sha?: string;
  build_pack?: 'nixpacks' | 'dockerfile' | 'docker_image' | 'static';
  ports_exposes?: string;
  install_command?: string;
  build_command?: string;
  start_command?: string;
  base_directory?: string;
  publish_directory?: string;
  docker_registry_image_name?: string;
  docker_registry_image_tag?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  project_uuid?: string;
  server_uuid?: string;
}

export interface ApplicationEnvironmentVariable {
  id?: number;
  uuid?: string;
  key: string;
  value: string;
  is_build_time?: boolean;
  is_preview?: boolean;
  is_secret?: boolean;
}

export interface CreateApplicationDto {
  name: string;
  project_uuid: string;
  server_uuid: string;
  git_repository?: string;
  git_branch?: string;
  build_pack?: 'nixpacks' | 'dockerfile' | 'docker_image' | 'static';
  ports_exposes?: string;
  install_command?: string;
  build_command?: string;
  start_command?: string;
  base_directory?: string;
  publish_directory?: string;
  environment_variables?: Record<string, string>;
  instant_deploy?: boolean;
}

export interface UpdateApplicationDto {
  name?: string;
  description?: string;
  fqdn?: string;
  git_repository?: string;
  git_branch?: string;
  build_pack?: 'nixpacks' | 'dockerfile' | 'docker_image' | 'static';
  ports_exposes?: string;
  install_command?: string;
  build_command?: string;
  start_command?: string;
  base_directory?: string;
  publish_directory?: string;
}

export interface DeleteApplicationParams {
  delete_configurations?: boolean;
  delete_volumes?: boolean;
  docker_cleanup?: boolean;
}

export interface ListApplicationsParams {
  page?: number;
  per_page?: number;
}

export interface GetApplicationLogsParams {
  since?: string;
  until?: string;
  tail?: number;
}
