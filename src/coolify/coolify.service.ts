import { Injectable, Logger, HttpException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import {
  Application,
  CreateApplicationDto,
  UpdateApplicationDto,
  DeleteApplicationParams,
  ListApplicationsParams,
  GetApplicationLogsParams,
  ApplicationEnvironmentVariable,
  Database,
  CreateDatabaseDto,
  UpdateDatabaseDto,
  DeleteDatabaseParams,
  ListDatabasesParams,
  CreateDatabaseBackupDto,
  Service,
  CreateServiceDto,
  DeleteServiceParams,
  ListServicesParams,
  Server,
  CreateServerDto,
  UpdateServerDto,
  ListServersParams,
  Deployment,
  ListDeploymentsParams,
  Team,
  TeamMember,
  Project,
  CreateProjectDto,
  UpdateProjectDto,
} from './interfaces';

@Injectable()
export class CoolifyService implements OnModuleInit {
  private readonly logger = new Logger(CoolifyService.name);
  private client!: AxiosInstance;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const baseURL = this.configService.get<string>('coolify.baseUrl');
    const apiToken = this.configService.get<string>('coolify.apiToken');
    const timeout = this.configService.get<number>('coolify.timeout');
    const maxRetries = this.configService.get<number>('coolify.maxRetries');

    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Retry logic with exponential backoff
    axiosRetry(this.client, {
      retries: maxRetries,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429 || // Rate limit
          (error.response?.status ?? 0) >= 500 // Server errors
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        this.logger.warn(
          `Retry ${retryCount}/${maxRetries} for ${requestConfig.method?.toUpperCase()} ${requestConfig.url}: ${error.message}`,
        );
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        this.logger.error('Request Error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `API Response: ${response.status} ${response.config.url}`,
        );
        return response;
      },
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      },
    );

    this.logger.log('Coolify API client initialized');
  }

  private handleApiError(error: AxiosError): never {
    if (error.response) {
      const { status, data } = error.response;
      this.logger.error(
        `API Error ${status}: ${error.config?.url}`,
        JSON.stringify(data),
      );

      const message =
        typeof data === 'object' && data !== null && 'message' in data
          ? (data as { message: string }).message
          : 'Coolify API Error';

      throw new HttpException(message, status);
    } else if (error.request) {
      this.logger.error('No response from Coolify API', error.message);
      throw new HttpException('No response from Coolify API', 503);
    } else {
      this.logger.error('API Request Error', error.message);
      throw new HttpException(error.message, 500);
    }
  }

  // ==================== APPLICATIONS ====================

  async listApplications(
    params?: ListApplicationsParams,
  ): Promise<Application[]> {
    const response = await this.client.get<Application[]>('/applications', {
      params,
    });
    return response.data;
  }

  async createApplication(data: CreateApplicationDto): Promise<Application> {
    const response = await this.client.post<Application>('/applications', data);
    return response.data;
  }

  async getApplication(uuid: string): Promise<Application> {
    const response = await this.client.get<Application>(
      `/applications/${uuid}`,
    );
    return response.data;
  }

  async updateApplication(
    uuid: string,
    data: UpdateApplicationDto,
  ): Promise<Application> {
    const response = await this.client.patch<Application>(
      `/applications/${uuid}`,
      data,
    );
    return response.data;
  }

  async deleteApplication(
    uuid: string,
    params?: DeleteApplicationParams,
  ): Promise<void> {
    await this.client.delete(`/applications/${uuid}`, { params });
  }

  async startApplication(uuid: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/applications/${uuid}/start`,
    );
    return response.data;
  }

  async stopApplication(uuid: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/applications/${uuid}/stop`,
    );
    return response.data;
  }

  async restartApplication(uuid: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/applications/${uuid}/restart`,
    );
    return response.data;
  }

  async deployApplication(
    uuid: string,
    forceRebuild = false,
  ): Promise<Deployment> {
    const response = await this.client.post<Deployment>(
      `/applications/${uuid}/deploy`,
      {
        force_rebuild: forceRebuild,
      },
    );
    return response.data;
  }

  async getApplicationLogs(
    uuid: string,
    params?: GetApplicationLogsParams,
  ): Promise<string> {
    const response = await this.client.get<string>(
      `/applications/${uuid}/logs`,
      { params },
    );
    return response.data;
  }

  // Application Environment Variables
  async listApplicationEnvs(
    uuid: string,
  ): Promise<ApplicationEnvironmentVariable[]> {
    const response = await this.client.get<ApplicationEnvironmentVariable[]>(
      `/applications/${uuid}/envs`,
    );
    return response.data;
  }

  async createApplicationEnv(
    uuid: string,
    data: Omit<ApplicationEnvironmentVariable, 'id' | 'uuid'>,
  ): Promise<ApplicationEnvironmentVariable> {
    const response = await this.client.post<ApplicationEnvironmentVariable>(
      `/applications/${uuid}/envs`,
      data,
    );
    return response.data;
  }

  async updateApplicationEnv(
    uuid: string,
    envUuid: string,
    data: Partial<ApplicationEnvironmentVariable>,
  ): Promise<ApplicationEnvironmentVariable> {
    const response = await this.client.patch<ApplicationEnvironmentVariable>(
      `/applications/${uuid}/envs/${envUuid}`,
      data,
    );
    return response.data;
  }

  async deleteApplicationEnv(uuid: string, envUuid: string): Promise<void> {
    await this.client.delete(`/applications/${uuid}/envs/${envUuid}`);
  }

  async bulkUpdateApplicationEnvs(
    uuid: string,
    variables: Omit<ApplicationEnvironmentVariable, 'id' | 'uuid'>[],
  ): Promise<ApplicationEnvironmentVariable[]> {
    const response = await this.client.patch<ApplicationEnvironmentVariable[]>(
      `/applications/${uuid}/envs/bulk`,
      { variables },
    );
    return response.data;
  }

  // ==================== DATABASES ====================

  async listDatabases(params?: ListDatabasesParams): Promise<Database[]> {
    const response = await this.client.get<Database[]>('/databases', {
      params,
    });
    return response.data;
  }

  async createDatabase(data: CreateDatabaseDto): Promise<Database> {
    const response = await this.client.post<Database>('/databases', data);
    return response.data;
  }

  async getDatabase(uuid: string): Promise<Database> {
    const response = await this.client.get<Database>(`/databases/${uuid}`);
    return response.data;
  }

  async updateDatabase(
    uuid: string,
    data: UpdateDatabaseDto,
  ): Promise<Database> {
    const response = await this.client.patch<Database>(
      `/databases/${uuid}`,
      data,
    );
    return response.data;
  }

  async deleteDatabase(
    uuid: string,
    params?: DeleteDatabaseParams,
  ): Promise<void> {
    await this.client.delete(`/databases/${uuid}`, { params });
  }

  async startDatabase(uuid: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/databases/${uuid}/start`,
    );
    return response.data;
  }

  async stopDatabase(uuid: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/databases/${uuid}/stop`,
    );
    return response.data;
  }

  async restartDatabase(uuid: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/databases/${uuid}/restart`,
    );
    return response.data;
  }

  // Database Backups
  async listDatabaseBackups(databaseUuid: string): Promise<unknown[]> {
    const response = await this.client.get(
      `/databases/${databaseUuid}/backups`,
    );
    return response.data;
  }

  async createDatabaseBackup(
    databaseUuid: string,
    data: CreateDatabaseBackupDto,
  ): Promise<unknown> {
    const response = await this.client.post(
      `/databases/${databaseUuid}/backups`,
      data,
    );
    return response.data;
  }

  async getDatabaseBackup(
    databaseUuid: string,
    backupUuid: string,
  ): Promise<unknown> {
    const response = await this.client.get(
      `/databases/${databaseUuid}/backups/${backupUuid}`,
    );
    return response.data;
  }

  async updateDatabaseBackup(
    databaseUuid: string,
    backupUuid: string,
    data: Partial<CreateDatabaseBackupDto>,
  ): Promise<unknown> {
    const response = await this.client.patch(
      `/databases/${databaseUuid}/backups/${backupUuid}`,
      data,
    );
    return response.data;
  }

  async deleteDatabaseBackup(
    databaseUuid: string,
    backupUuid: string,
  ): Promise<void> {
    await this.client.delete(
      `/databases/${databaseUuid}/backups/${backupUuid}`,
    );
  }

  async triggerDatabaseBackupExecution(
    databaseUuid: string,
    backupUuid: string,
  ): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/databases/${databaseUuid}/backups/${backupUuid}/execute`,
    );
    return response.data;
  }

  // ==================== SERVICES ====================

  async listServices(params?: ListServicesParams): Promise<Service[]> {
    const response = await this.client.get<Service[]>('/services', { params });
    return response.data;
  }

  async createService(data: CreateServiceDto): Promise<Service> {
    const response = await this.client.post<Service>('/services', data);
    return response.data;
  }

  async getService(uuid: string): Promise<Service> {
    const response = await this.client.get<Service>(`/services/${uuid}`);
    return response.data;
  }

  async deleteService(
    uuid: string,
    params?: DeleteServiceParams,
  ): Promise<void> {
    await this.client.delete(`/services/${uuid}`, { params });
  }

  async startService(uuid: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/services/${uuid}/start`,
    );
    return response.data;
  }

  async stopService(uuid: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/services/${uuid}/stop`,
    );
    return response.data;
  }

  async restartService(uuid: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/services/${uuid}/restart`,
    );
    return response.data;
  }

  // ==================== SERVERS ====================

  async listServers(params?: ListServersParams): Promise<Server[]> {
    const response = await this.client.get<Server[]>('/servers', { params });
    return response.data;
  }

  async createServer(data: CreateServerDto): Promise<Server> {
    const response = await this.client.post<Server>('/servers', data);
    return response.data;
  }

  async getServer(uuid: string): Promise<Server> {
    const response = await this.client.get<Server>(`/servers/${uuid}`);
    return response.data;
  }

  async updateServer(uuid: string, data: UpdateServerDto): Promise<Server> {
    const response = await this.client.patch<Server>(`/servers/${uuid}`, data);
    return response.data;
  }

  async deleteServer(uuid: string): Promise<void> {
    await this.client.delete(`/servers/${uuid}`);
  }

  async validateServer(uuid: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/servers/${uuid}/validate`,
    );
    return response.data;
  }

  async getServerDomains(uuid: string): Promise<unknown[]> {
    const response = await this.client.get(`/servers/${uuid}/domains`);
    return response.data;
  }

  async getServerResources(uuid: string): Promise<unknown> {
    const response = await this.client.get(`/servers/${uuid}/resources`);
    return response.data;
  }

  // ==================== DEPLOYMENTS ====================

  async listDeployments(params?: ListDeploymentsParams): Promise<Deployment[]> {
    const response = await this.client.get<Deployment[]>('/deployments', {
      params,
    });
    return response.data;
  }

  async listDeploymentsByApplication(
    applicationUuid: string,
  ): Promise<Deployment[]> {
    const response = await this.client.get<Deployment[]>(
      `/applications/${applicationUuid}/deployments`,
    );
    return response.data;
  }

  async getDeployment(uuid: string): Promise<Deployment> {
    const response = await this.client.get<Deployment>(`/deployments/${uuid}`);
    return response.data;
  }

  // ==================== TEAMS ====================

  async getCurrentTeam(): Promise<Team> {
    const response = await this.client.get<Team>('/teams/current');
    return response.data;
  }

  async listTeams(): Promise<Team[]> {
    const response = await this.client.get<Team[]>('/teams');
    return response.data;
  }

  async getTeam(teamId: number): Promise<Team> {
    const response = await this.client.get<Team>(`/teams/${teamId}`);
    return response.data;
  }

  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    const response = await this.client.get<TeamMember[]>(
      `/teams/${teamId}/members`,
    );
    return response.data;
  }

  // ==================== PROJECTS ====================

  async listProjects(): Promise<Project[]> {
    const response = await this.client.get<Project[]>('/projects');
    return response.data;
  }

  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await this.client.post<Project>('/projects', data);
    return response.data;
  }

  async getProject(uuid: string): Promise<Project> {
    const response = await this.client.get<Project>(`/projects/${uuid}`);
    return response.data;
  }

  async updateProject(uuid: string, data: UpdateProjectDto): Promise<Project> {
    const response = await this.client.patch<Project>(
      `/projects/${uuid}`,
      data,
    );
    return response.data;
  }

  async deleteProject(uuid: string): Promise<void> {
    await this.client.delete(`/projects/${uuid}`);
  }

  // ==================== SYSTEM ====================

  async getVersion(): Promise<{ version: string }> {
    const response = await this.client.get<{ version: string }>('/version');
    return response.data;
  }

  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get<{ status: string }>('/health');
    return response.data;
  }
}
