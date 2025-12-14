import { logger } from "../utils/logger.js";

export interface CoolifyConfig {
  apiUrl: string;
  apiToken: string;
}

export interface CoolifyApplication {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  fqdn?: string;
  status?: string;
  repository_project_id?: number;
  git_repository?: string;
  git_branch?: string;
  build_pack?: string;
  created_at: string;
  updated_at: string;
}

export interface CoolifyServer {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  ip: string;
  port?: number;
  user?: string;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CoolifyProject {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  environments?: CoolifyEnvironment[];
  created_at: string;
  updated_at: string;
}

export interface CoolifyEnvironment {
  id: number;
  uuid: string;
  name: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface CoolifyDatabase {
  id: number;
  uuid: string;
  name: string;
  type: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface CoolifyService {
  id: number;
  uuid: string;
  name: string;
  type: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface CoolifyDeployment {
  id: number;
  uuid: string;
  status: string;
  created_at: string;
  updated_at: string;
  logs?: string;
}

export interface DeploymentWebhookPayload {
  uuid: string;
  force?: boolean;
}

export class CoolifyClient {
  private baseUrl: string;
  private token: string;

  constructor(config: CoolifyConfig) {
    this.baseUrl = config.apiUrl.replace(/\/$/, "");
    this.token = config.apiToken;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    logger.debug({ method, url }, "Making Coolify API request");

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        { status: response.status, error: errorText },
        "Coolify API error"
      );
      throw new Error(`Coolify API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as T;
    return data;
  }

  // ============ Health & Version ============

  async healthCheck(): Promise<{ status: string }> {
    return this.request("GET", "/api/v1/healthcheck");
  }

  async getVersion(): Promise<{ version: string }> {
    return this.request("GET", "/api/v1/version");
  }

  // ============ Applications ============

  async listApplications(): Promise<CoolifyApplication[]> {
    return this.request("GET", "/api/v1/applications");
  }

  async getApplication(uuid: string): Promise<CoolifyApplication> {
    return this.request("GET", `/api/v1/applications/${uuid}`);
  }

  async createApplication(data: {
    project_uuid: string;
    environment_name?: string;
    server_uuid: string;
    destination_uuid?: string;
    type: string;
    name: string;
    description?: string;
    git_repository?: string;
    git_branch?: string;
    build_pack?: string;
    ports_exposes?: string;
    environment?: Record<string, string>;
  }): Promise<CoolifyApplication> {
    return this.request("POST", "/api/v1/applications", data);
  }

  async updateApplication(
    uuid: string,
    data: Partial<CoolifyApplication>
  ): Promise<CoolifyApplication> {
    return this.request("PATCH", `/api/v1/applications/${uuid}`, data);
  }

  async deleteApplication(uuid: string): Promise<void> {
    return this.request("DELETE", `/api/v1/applications/${uuid}`);
  }

  async deployApplication(uuid: string, force = false): Promise<{ message: string; deployment_uuid: string }> {
    return this.request("POST", `/api/v1/applications/${uuid}/deploy`, { force });
  }

  async restartApplication(uuid: string): Promise<{ message: string }> {
    return this.request("POST", `/api/v1/applications/${uuid}/restart`);
  }

  async stopApplication(uuid: string): Promise<{ message: string }> {
    return this.request("POST", `/api/v1/applications/${uuid}/stop`);
  }

  async startApplication(uuid: string): Promise<{ message: string }> {
    return this.request("POST", `/api/v1/applications/${uuid}/start`);
  }

  async getApplicationLogs(uuid: string): Promise<{ logs: string }> {
    return this.request("GET", `/api/v1/applications/${uuid}/logs`);
  }

  async getApplicationEnvs(uuid: string): Promise<Record<string, string>[]> {
    return this.request("GET", `/api/v1/applications/${uuid}/envs`);
  }

  async updateApplicationEnvs(
    uuid: string,
    envs: Record<string, string>
  ): Promise<{ message: string }> {
    return this.request("PATCH", `/api/v1/applications/${uuid}/envs`, envs);
  }

  // ============ Servers ============

  async listServers(): Promise<CoolifyServer[]> {
    return this.request("GET", "/api/v1/servers");
  }

  async getServer(uuid: string): Promise<CoolifyServer> {
    return this.request("GET", `/api/v1/servers/${uuid}`);
  }

  async getServerResources(uuid: string): Promise<unknown[]> {
    return this.request("GET", `/api/v1/servers/${uuid}/resources`);
  }

  async validateServer(uuid: string): Promise<{ message: string }> {
    return this.request("POST", `/api/v1/servers/${uuid}/validate`);
  }

  // ============ Projects ============

  async listProjects(): Promise<CoolifyProject[]> {
    return this.request("GET", "/api/v1/projects");
  }

  async getProject(uuid: string): Promise<CoolifyProject> {
    return this.request("GET", `/api/v1/projects/${uuid}`);
  }

  async createProject(data: {
    name: string;
    description?: string;
  }): Promise<CoolifyProject> {
    return this.request("POST", "/api/v1/projects", data);
  }

  async updateProject(
    uuid: string,
    data: Partial<CoolifyProject>
  ): Promise<CoolifyProject> {
    return this.request("PATCH", `/api/v1/projects/${uuid}`, data);
  }

  async deleteProject(uuid: string): Promise<void> {
    return this.request("DELETE", `/api/v1/projects/${uuid}`);
  }

  async getProjectEnvironment(
    projectUuid: string,
    envName: string
  ): Promise<CoolifyEnvironment> {
    return this.request(
      "GET",
      `/api/v1/projects/${projectUuid}/${envName}`
    );
  }

  // ============ Databases ============

  async listDatabases(): Promise<CoolifyDatabase[]> {
    return this.request("GET", "/api/v1/databases");
  }

  async getDatabase(uuid: string): Promise<CoolifyDatabase> {
    return this.request("GET", `/api/v1/databases/${uuid}`);
  }

  async createDatabase(data: {
    project_uuid: string;
    environment_name?: string;
    server_uuid: string;
    destination_uuid?: string;
    type: string;
    name: string;
    description?: string;
  }): Promise<CoolifyDatabase> {
    return this.request("POST", "/api/v1/databases", data);
  }

  async deleteDatabase(uuid: string): Promise<void> {
    return this.request("DELETE", `/api/v1/databases/${uuid}`);
  }

  async startDatabase(uuid: string): Promise<{ message: string }> {
    return this.request("POST", `/api/v1/databases/${uuid}/start`);
  }

  async stopDatabase(uuid: string): Promise<{ message: string }> {
    return this.request("POST", `/api/v1/databases/${uuid}/stop`);
  }

  async restartDatabase(uuid: string): Promise<{ message: string }> {
    return this.request("POST", `/api/v1/databases/${uuid}/restart`);
  }

  // ============ Services ============

  async listServices(): Promise<CoolifyService[]> {
    return this.request("GET", "/api/v1/services");
  }

  async getService(uuid: string): Promise<CoolifyService> {
    return this.request("GET", `/api/v1/services/${uuid}`);
  }

  async createService(data: {
    project_uuid: string;
    environment_name?: string;
    server_uuid: string;
    destination_uuid?: string;
    type: string;
    name: string;
    description?: string;
  }): Promise<CoolifyService> {
    return this.request("POST", "/api/v1/services", data);
  }

  async deleteService(uuid: string): Promise<void> {
    return this.request("DELETE", `/api/v1/services/${uuid}`);
  }

  async startService(uuid: string): Promise<{ message: string }> {
    return this.request("POST", `/api/v1/services/${uuid}/start`);
  }

  async stopService(uuid: string): Promise<{ message: string }> {
    return this.request("POST", `/api/v1/services/${uuid}/stop`);
  }

  async restartService(uuid: string): Promise<{ message: string }> {
    return this.request("POST", `/api/v1/services/${uuid}/restart`);
  }

  // ============ Deployments ============

  async listDeployments(): Promise<CoolifyDeployment[]> {
    return this.request("GET", "/api/v1/deployments");
  }

  async getDeployment(uuid: string): Promise<CoolifyDeployment> {
    return this.request("GET", `/api/v1/deployments/${uuid}`);
  }

  // ============ Teams ============

  async listTeams(): Promise<unknown[]> {
    return this.request("GET", "/api/v1/teams");
  }

  async getCurrentTeam(): Promise<unknown> {
    return this.request("GET", "/api/v1/teams/current");
  }

  async getTeamMembers(): Promise<unknown[]> {
    return this.request("GET", "/api/v1/teams/current/members");
  }

  // ============ Deploy Webhook ============

  async deployByTag(tag: string, force = false): Promise<{ message: string }> {
    return this.request("POST", `/api/v1/deploy?tag=${encodeURIComponent(tag)}&force=${force}`);
  }
}
