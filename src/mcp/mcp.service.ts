import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { CoolifyService } from '../coolify/coolify.service';
import {
  ApplicationTools,
  ApplicationSchemas,
  DatabaseTools,
  DatabaseSchemas,
  ServiceTools,
  ServiceSchemas,
  ServerTools,
  ServerSchemas,
  DeploymentTools,
  DeploymentSchemas,
  TeamTools,
  TeamSchemas,
  ProjectSchemas,
  SystemTools,
} from './tools';

@Injectable()
export class McpService implements OnModuleInit {
  private readonly logger = new Logger(McpService.name);
  private server!: Server;

  constructor(
    private coolifyService: CoolifyService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const serverName = this.configService.get<string>('mcp.serverName');
    const version = this.configService.get<string>('mcp.version');

    this.server = new Server(
      {
        name: serverName || 'coolify-mcp-server',
        version: version || '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.registerHandlers();
    await this.startServer();
  }

  private registerHandlers() {
    // List Tools Handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        ...ApplicationTools,
        ...DatabaseTools,
        ...ServiceTools,
        ...ServerTools,
        ...DeploymentTools,
        ...TeamTools,
        ...SystemTools,
      ],
    }));

    // Call Tool Handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        this.logger.log(`Executing tool: ${name}`);
        this.logger.debug(`Tool arguments: ${JSON.stringify(args)}`);

        const result = await this.executeTool(name, args || {});

        return {
          content: [
            {
              type: 'text' as const,
              text:
                typeof result === 'string'
                  ? result
                  : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Error executing tool ${name}: ${errorMessage}`);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async executeTool(name: string, args: Record<string, unknown>) {
    // Application tools
    if (name === 'coolify_list_applications') {
      const validated = ApplicationSchemas.list.parse(args);
      return await this.coolifyService.listApplications(validated);
    }

    if (name === 'coolify_create_application') {
      const validated = ApplicationSchemas.create.parse(args);
      const result = await this.coolifyService.createApplication(validated);
      return { message: 'Application created successfully!', ...result };
    }

    if (name === 'coolify_get_application') {
      const validated = ApplicationSchemas.get.parse(args);
      return await this.coolifyService.getApplication(validated.uuid);
    }

    if (name === 'coolify_update_application') {
      const validated = ApplicationSchemas.update.parse(args);
      const { uuid, ...data } = validated;
      const result = await this.coolifyService.updateApplication(uuid, data);
      return { message: 'Application updated successfully!', ...result };
    }

    if (name === 'coolify_delete_application') {
      const validated = ApplicationSchemas.delete.parse(args);
      const { uuid, ...params } = validated;
      await this.coolifyService.deleteApplication(uuid, params);
      return { message: `Application ${uuid} deleted successfully!` };
    }

    if (name === 'coolify_start_application') {
      const validated = ApplicationSchemas.start.parse(args);
      await this.coolifyService.startApplication(validated.uuid);
      return { message: `Application ${validated.uuid} started successfully!` };
    }

    if (name === 'coolify_stop_application') {
      const validated = ApplicationSchemas.stop.parse(args);
      await this.coolifyService.stopApplication(validated.uuid);
      return { message: `Application ${validated.uuid} stopped successfully!` };
    }

    if (name === 'coolify_restart_application') {
      const validated = ApplicationSchemas.restart.parse(args);
      await this.coolifyService.restartApplication(validated.uuid);
      return {
        message: `Application ${validated.uuid} restarted successfully!`,
      };
    }

    if (name === 'coolify_deploy_application') {
      const validated = ApplicationSchemas.deploy.parse(args);
      const result = await this.coolifyService.deployApplication(
        validated.uuid,
        validated.force_rebuild,
      );
      return { message: 'Deployment triggered successfully!', ...result };
    }

    if (name === 'coolify_get_application_logs') {
      const validated = ApplicationSchemas.logs.parse(args);
      const { uuid, ...params } = validated;
      return await this.coolifyService.getApplicationLogs(uuid, params);
    }

    if (name === 'coolify_list_application_envs') {
      const validated = ApplicationSchemas.listEnvs.parse(args);
      return await this.coolifyService.listApplicationEnvs(validated.uuid);
    }

    if (name === 'coolify_create_application_env') {
      const validated = ApplicationSchemas.createEnv.parse(args);
      const { uuid, ...data } = validated;
      const result = await this.coolifyService.createApplicationEnv(uuid, data);
      return {
        message: 'Environment variable created successfully!',
        ...result,
      };
    }

    if (name === 'coolify_bulk_update_application_envs') {
      const validated = ApplicationSchemas.bulkUpdateEnvs.parse(args);
      const result = await this.coolifyService.bulkUpdateApplicationEnvs(
        validated.uuid,
        validated.variables,
      );
      return {
        message: 'Environment variables updated successfully!',
        ...result,
      };
    }

    if (name === 'coolify_delete_application_env') {
      const validated = ApplicationSchemas.deleteEnv.parse(args);
      await this.coolifyService.deleteApplicationEnv(
        validated.uuid,
        validated.env_uuid,
      );
      return {
        message: `Environment variable ${validated.env_uuid} deleted successfully!`,
      };
    }

    // Database tools
    if (name === 'coolify_list_databases') {
      const validated = DatabaseSchemas.list.parse(args);
      return await this.coolifyService.listDatabases(validated);
    }

    if (name === 'coolify_create_database') {
      const validated = DatabaseSchemas.create.parse(args);
      const result = await this.coolifyService.createDatabase(validated);
      return { message: 'Database created successfully!', ...result };
    }

    if (name === 'coolify_get_database') {
      const validated = DatabaseSchemas.get.parse(args);
      return await this.coolifyService.getDatabase(validated.uuid);
    }

    if (name === 'coolify_update_database') {
      const validated = DatabaseSchemas.update.parse(args);
      const { uuid, ...data } = validated;
      const result = await this.coolifyService.updateDatabase(uuid, data);
      return { message: 'Database updated successfully!', ...result };
    }

    if (name === 'coolify_delete_database') {
      const validated = DatabaseSchemas.delete.parse(args);
      const { uuid, ...params } = validated;
      await this.coolifyService.deleteDatabase(uuid, params);
      return { message: `Database ${uuid} deleted successfully!` };
    }

    if (name === 'coolify_start_database') {
      const validated = DatabaseSchemas.start.parse(args);
      await this.coolifyService.startDatabase(validated.uuid);
      return { message: `Database ${validated.uuid} started successfully!` };
    }

    if (name === 'coolify_stop_database') {
      const validated = DatabaseSchemas.stop.parse(args);
      await this.coolifyService.stopDatabase(validated.uuid);
      return { message: `Database ${validated.uuid} stopped successfully!` };
    }

    if (name === 'coolify_restart_database') {
      const validated = DatabaseSchemas.restart.parse(args);
      await this.coolifyService.restartDatabase(validated.uuid);
      return { message: `Database ${validated.uuid} restarted successfully!` };
    }

    // Database backup tools
    if (name === 'coolify_list_database_backups') {
      const validated = DatabaseSchemas.listBackups.parse(args);
      return await this.coolifyService.listDatabaseBackups(
        validated.database_uuid,
      );
    }

    if (name === 'coolify_create_database_backup') {
      const validated = DatabaseSchemas.createBackup.parse(args);
      const { database_uuid, ...data } = validated;
      const result = await this.coolifyService.createDatabaseBackup(
        database_uuid,
        data,
      );
      return { message: 'Backup configuration created successfully!', ...result };
    }

    if (name === 'coolify_get_database_backup') {
      const validated = DatabaseSchemas.getBackup.parse(args);
      return await this.coolifyService.getDatabaseBackup(
        validated.database_uuid,
        validated.backup_uuid,
      );
    }

    if (name === 'coolify_update_database_backup') {
      const validated = DatabaseSchemas.updateBackup.parse(args);
      const { database_uuid, backup_uuid, ...data } = validated;
      const result = await this.coolifyService.updateDatabaseBackup(
        database_uuid,
        backup_uuid,
        data,
      );
      return { message: 'Backup configuration updated successfully!', ...result };
    }

    if (name === 'coolify_delete_database_backup') {
      const validated = DatabaseSchemas.deleteBackup.parse(args);
      await this.coolifyService.deleteDatabaseBackup(
        validated.database_uuid,
        validated.backup_uuid,
      );
      return {
        message: `Backup ${validated.backup_uuid} deleted successfully!`,
      };
    }

    if (name === 'coolify_trigger_database_backup') {
      const validated = DatabaseSchemas.triggerBackup.parse(args);
      await this.coolifyService.triggerDatabaseBackupExecution(
        validated.database_uuid,
        validated.backup_uuid,
      );
      return {
        message: `Backup ${validated.backup_uuid} triggered successfully!`,
      };
    }

    // Service tools
    if (name === 'coolify_list_services') {
      const validated = ServiceSchemas.list.parse(args);
      return await this.coolifyService.listServices(validated);
    }

    if (name === 'coolify_create_service') {
      const validated = ServiceSchemas.create.parse(args);
      const result = await this.coolifyService.createService(validated);
      return { message: 'Service created successfully!', ...result };
    }

    if (name === 'coolify_get_service') {
      const validated = ServiceSchemas.get.parse(args);
      return await this.coolifyService.getService(validated.uuid);
    }

    if (name === 'coolify_delete_service') {
      const validated = ServiceSchemas.delete.parse(args);
      const { uuid, ...params } = validated;
      await this.coolifyService.deleteService(uuid, params);
      return { message: `Service ${uuid} deleted successfully!` };
    }

    if (name === 'coolify_start_service') {
      const validated = ServiceSchemas.start.parse(args);
      await this.coolifyService.startService(validated.uuid);
      return { message: `Service ${validated.uuid} started successfully!` };
    }

    if (name === 'coolify_stop_service') {
      const validated = ServiceSchemas.stop.parse(args);
      await this.coolifyService.stopService(validated.uuid);
      return { message: `Service ${validated.uuid} stopped successfully!` };
    }

    if (name === 'coolify_restart_service') {
      const validated = ServiceSchemas.restart.parse(args);
      await this.coolifyService.restartService(validated.uuid);
      return { message: `Service ${validated.uuid} restarted successfully!` };
    }

    // Server tools
    if (name === 'coolify_list_servers') {
      const validated = ServerSchemas.list.parse(args);
      return await this.coolifyService.listServers(validated);
    }

    if (name === 'coolify_create_server') {
      const validated = ServerSchemas.create.parse(args);
      const result = await this.coolifyService.createServer(validated);
      return { message: 'Server created successfully!', ...result };
    }

    if (name === 'coolify_get_server') {
      const validated = ServerSchemas.get.parse(args);
      return await this.coolifyService.getServer(validated.uuid);
    }

    if (name === 'coolify_update_server') {
      const validated = ServerSchemas.update.parse(args);
      const { uuid, ...data } = validated;
      const result = await this.coolifyService.updateServer(uuid, data);
      return { message: 'Server updated successfully!', ...result };
    }

    if (name === 'coolify_delete_server') {
      const validated = ServerSchemas.delete.parse(args);
      await this.coolifyService.deleteServer(validated.uuid);
      return { message: `Server ${validated.uuid} deleted successfully!` };
    }

    if (name === 'coolify_validate_server') {
      const validated = ServerSchemas.validate.parse(args);
      const result = await this.coolifyService.validateServer(validated.uuid);
      return { message: 'Server validation triggered!', ...result };
    }

    if (name === 'coolify_get_server_domains') {
      const validated = ServerSchemas.getDomains.parse(args);
      return await this.coolifyService.getServerDomains(validated.uuid);
    }

    if (name === 'coolify_get_server_resources') {
      const validated = ServerSchemas.getResources.parse(args);
      return await this.coolifyService.getServerResources(validated.uuid);
    }

    // Deployment tools
    if (name === 'coolify_list_deployments') {
      const validated = DeploymentSchemas.list.parse(args);
      return await this.coolifyService.listDeployments(validated);
    }

    if (name === 'coolify_list_deployments_by_application') {
      const validated = DeploymentSchemas.listByApplication.parse(args);
      return await this.coolifyService.listDeploymentsByApplication(
        validated.application_uuid,
      );
    }

    if (name === 'coolify_get_deployment') {
      const validated = DeploymentSchemas.get.parse(args);
      return await this.coolifyService.getDeployment(validated.uuid);
    }

    // Team tools
    if (name === 'coolify_get_current_team') {
      return await this.coolifyService.getCurrentTeam();
    }

    if (name === 'coolify_list_teams') {
      return await this.coolifyService.listTeams();
    }

    if (name === 'coolify_get_team') {
      const validated = TeamSchemas.get.parse(args);
      return await this.coolifyService.getTeam(validated.team_id);
    }

    if (name === 'coolify_get_team_members') {
      const validated = TeamSchemas.getMembers.parse(args);
      return await this.coolifyService.getTeamMembers(validated.team_id);
    }

    // Project tools
    if (name === 'coolify_list_projects') {
      return await this.coolifyService.listProjects();
    }

    if (name === 'coolify_create_project') {
      const validated = ProjectSchemas.create.parse(args);
      const result = await this.coolifyService.createProject(validated);
      return { message: 'Project created successfully!', ...result };
    }

    if (name === 'coolify_get_project') {
      const validated = ProjectSchemas.get.parse(args);
      return await this.coolifyService.getProject(validated.uuid);
    }

    if (name === 'coolify_update_project') {
      const validated = ProjectSchemas.update.parse(args);
      const { uuid, ...data } = validated;
      const result = await this.coolifyService.updateProject(uuid, data);
      return { message: 'Project updated successfully!', ...result };
    }

    if (name === 'coolify_delete_project') {
      const validated = ProjectSchemas.delete.parse(args);
      await this.coolifyService.deleteProject(validated.uuid);
      return { message: `Project ${validated.uuid} deleted successfully!` };
    }

    // System tools
    if (name === 'coolify_get_version') {
      return await this.coolifyService.getVersion();
    }

    if (name === 'coolify_health_check') {
      return await this.coolifyService.healthCheck();
    }

    throw new Error(`Unknown tool: ${name}`);
  }

  private async startServer() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.log('MCP Server started and listening on stdio');
  }
}
