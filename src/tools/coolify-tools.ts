import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CoolifyClient, CoolifyConfig } from "../api/coolify-client.js";
import { logger } from "../utils/logger.js";

export function registerCoolifyTools(
  server: McpServer,
  config: CoolifyConfig
): void {
  const client = new CoolifyClient(config);

  // ============ Health & Info Tools ============

  server.tool(
    "coolify_health_check",
    "Check Coolify API health status",
    {},
    async () => {
      try {
        const result = await client.healthCheck();
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Health check failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_get_version",
    "Get Coolify version information",
    {},
    async () => {
      try {
        const result = await client.getVersion();
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Get version failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  // ============ Application Tools ============

  server.tool(
    "coolify_list_applications",
    "List all applications in Coolify",
    {},
    async () => {
      try {
        const apps = await client.listApplications();
        return {
          content: [{ type: "text", text: JSON.stringify(apps, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "List applications failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_get_application",
    "Get details of a specific application",
    {
      uuid: z.string().describe("The UUID of the application"),
    },
    async ({ uuid }) => {
      try {
        const app = await client.getApplication(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(app, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Get application failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_create_application",
    "Create a new application in Coolify",
    {
      project_uuid: z.string().describe("The UUID of the project"),
      server_uuid: z.string().describe("The UUID of the server"),
      type: z.string().describe("Application type (e.g., 'public', 'private-gh', 'dockerfile')"),
      name: z.string().describe("Name of the application"),
      environment_name: z.string().optional().describe("Environment name (default: production)"),
      description: z.string().optional().describe("Description of the application"),
      git_repository: z.string().optional().describe("Git repository URL"),
      git_branch: z.string().optional().describe("Git branch name"),
      build_pack: z.string().optional().describe("Build pack to use"),
      ports_exposes: z.string().optional().describe("Ports to expose (e.g., '3000')"),
    },
    async (args) => {
      try {
        const app = await client.createApplication(args);
        return {
          content: [{ type: "text", text: JSON.stringify(app, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Create application failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_deploy_application",
    "Deploy an application",
    {
      uuid: z.string().describe("The UUID of the application"),
      force: z.boolean().optional().describe("Force deployment"),
    },
    async ({ uuid, force }) => {
      try {
        const result = await client.deployApplication(uuid, force);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Deploy application failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_start_application",
    "Start an application",
    {
      uuid: z.string().describe("The UUID of the application"),
    },
    async ({ uuid }) => {
      try {
        const result = await client.startApplication(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Start application failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_stop_application",
    "Stop an application",
    {
      uuid: z.string().describe("The UUID of the application"),
    },
    async ({ uuid }) => {
      try {
        const result = await client.stopApplication(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Stop application failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_restart_application",
    "Restart an application",
    {
      uuid: z.string().describe("The UUID of the application"),
    },
    async ({ uuid }) => {
      try {
        const result = await client.restartApplication(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Restart application failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_delete_application",
    "Delete an application",
    {
      uuid: z.string().describe("The UUID of the application"),
    },
    async ({ uuid }) => {
      try {
        await client.deleteApplication(uuid);
        return {
          content: [{ type: "text", text: `Application ${uuid} deleted successfully` }],
        };
      } catch (error) {
        logger.error({ error }, "Delete application failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_get_application_logs",
    "Get logs for an application",
    {
      uuid: z.string().describe("The UUID of the application"),
    },
    async ({ uuid }) => {
      try {
        const result = await client.getApplicationLogs(uuid);
        return {
          content: [{ type: "text", text: result.logs || "No logs available" }],
        };
      } catch (error) {
        logger.error({ error }, "Get application logs failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_get_application_envs",
    "Get environment variables for an application",
    {
      uuid: z.string().describe("The UUID of the application"),
    },
    async ({ uuid }) => {
      try {
        const envs = await client.getApplicationEnvs(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(envs, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Get application envs failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_update_application_envs",
    "Update environment variables for an application",
    {
      uuid: z.string().describe("The UUID of the application"),
      envs: z.record(z.string()).describe("Environment variables as key-value pairs"),
    },
    async ({ uuid, envs }) => {
      try {
        const result = await client.updateApplicationEnvs(uuid, envs);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Update application envs failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  // ============ Server Tools ============

  server.tool(
    "coolify_list_servers",
    "List all servers in Coolify",
    {},
    async () => {
      try {
        const servers = await client.listServers();
        return {
          content: [{ type: "text", text: JSON.stringify(servers, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "List servers failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_get_server",
    "Get details of a specific server",
    {
      uuid: z.string().describe("The UUID of the server"),
    },
    async ({ uuid }) => {
      try {
        const server = await client.getServer(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(server, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Get server failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_get_server_resources",
    "Get resources on a specific server",
    {
      uuid: z.string().describe("The UUID of the server"),
    },
    async ({ uuid }) => {
      try {
        const resources = await client.getServerResources(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(resources, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Get server resources failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_validate_server",
    "Validate server connection",
    {
      uuid: z.string().describe("The UUID of the server"),
    },
    async ({ uuid }) => {
      try {
        const result = await client.validateServer(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Validate server failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  // ============ Project Tools ============

  server.tool(
    "coolify_list_projects",
    "List all projects in Coolify",
    {},
    async () => {
      try {
        const projects = await client.listProjects();
        return {
          content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "List projects failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_get_project",
    "Get details of a specific project",
    {
      uuid: z.string().describe("The UUID of the project"),
    },
    async ({ uuid }) => {
      try {
        const project = await client.getProject(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Get project failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_create_project",
    "Create a new project in Coolify",
    {
      name: z.string().describe("Name of the project"),
      description: z.string().optional().describe("Description of the project"),
    },
    async (args) => {
      try {
        const project = await client.createProject(args);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Create project failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_delete_project",
    "Delete a project",
    {
      uuid: z.string().describe("The UUID of the project"),
    },
    async ({ uuid }) => {
      try {
        await client.deleteProject(uuid);
        return {
          content: [{ type: "text", text: `Project ${uuid} deleted successfully` }],
        };
      } catch (error) {
        logger.error({ error }, "Delete project failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  // ============ Database Tools ============

  server.tool(
    "coolify_list_databases",
    "List all databases in Coolify",
    {},
    async () => {
      try {
        const databases = await client.listDatabases();
        return {
          content: [{ type: "text", text: JSON.stringify(databases, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "List databases failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_get_database",
    "Get details of a specific database",
    {
      uuid: z.string().describe("The UUID of the database"),
    },
    async ({ uuid }) => {
      try {
        const database = await client.getDatabase(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(database, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Get database failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_create_database",
    "Create a new database in Coolify",
    {
      project_uuid: z.string().describe("The UUID of the project"),
      server_uuid: z.string().describe("The UUID of the server"),
      type: z.string().describe("Database type (e.g., 'postgresql', 'mysql', 'mongodb', 'redis')"),
      name: z.string().describe("Name of the database"),
      environment_name: z.string().optional().describe("Environment name"),
      description: z.string().optional().describe("Description of the database"),
    },
    async (args) => {
      try {
        const database = await client.createDatabase(args);
        return {
          content: [{ type: "text", text: JSON.stringify(database, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Create database failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_start_database",
    "Start a database",
    {
      uuid: z.string().describe("The UUID of the database"),
    },
    async ({ uuid }) => {
      try {
        const result = await client.startDatabase(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Start database failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_stop_database",
    "Stop a database",
    {
      uuid: z.string().describe("The UUID of the database"),
    },
    async ({ uuid }) => {
      try {
        const result = await client.stopDatabase(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Stop database failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_restart_database",
    "Restart a database",
    {
      uuid: z.string().describe("The UUID of the database"),
    },
    async ({ uuid }) => {
      try {
        const result = await client.restartDatabase(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Restart database failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_delete_database",
    "Delete a database",
    {
      uuid: z.string().describe("The UUID of the database"),
    },
    async ({ uuid }) => {
      try {
        await client.deleteDatabase(uuid);
        return {
          content: [{ type: "text", text: `Database ${uuid} deleted successfully` }],
        };
      } catch (error) {
        logger.error({ error }, "Delete database failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  // ============ Service Tools ============

  server.tool(
    "coolify_list_services",
    "List all services in Coolify",
    {},
    async () => {
      try {
        const services = await client.listServices();
        return {
          content: [{ type: "text", text: JSON.stringify(services, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "List services failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_get_service",
    "Get details of a specific service",
    {
      uuid: z.string().describe("The UUID of the service"),
    },
    async ({ uuid }) => {
      try {
        const service = await client.getService(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(service, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Get service failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_start_service",
    "Start a service",
    {
      uuid: z.string().describe("The UUID of the service"),
    },
    async ({ uuid }) => {
      try {
        const result = await client.startService(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Start service failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_stop_service",
    "Stop a service",
    {
      uuid: z.string().describe("The UUID of the service"),
    },
    async ({ uuid }) => {
      try {
        const result = await client.stopService(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Stop service failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_restart_service",
    "Restart a service",
    {
      uuid: z.string().describe("The UUID of the service"),
    },
    async ({ uuid }) => {
      try {
        const result = await client.restartService(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Restart service failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_delete_service",
    "Delete a service",
    {
      uuid: z.string().describe("The UUID of the service"),
    },
    async ({ uuid }) => {
      try {
        await client.deleteService(uuid);
        return {
          content: [{ type: "text", text: `Service ${uuid} deleted successfully` }],
        };
      } catch (error) {
        logger.error({ error }, "Delete service failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  // ============ Deployment Tools ============

  server.tool(
    "coolify_list_deployments",
    "List all deployments in Coolify",
    {},
    async () => {
      try {
        const deployments = await client.listDeployments();
        return {
          content: [{ type: "text", text: JSON.stringify(deployments, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "List deployments failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_get_deployment",
    "Get details of a specific deployment",
    {
      uuid: z.string().describe("The UUID of the deployment"),
    },
    async ({ uuid }) => {
      try {
        const deployment = await client.getDeployment(uuid);
        return {
          content: [{ type: "text", text: JSON.stringify(deployment, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Get deployment failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_deploy_by_tag",
    "Deploy all resources with a specific tag",
    {
      tag: z.string().describe("The tag to deploy"),
      force: z.boolean().optional().describe("Force deployment"),
    },
    async ({ tag, force }) => {
      try {
        const result = await client.deployByTag(tag, force);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Deploy by tag failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  // ============ Team Tools ============

  server.tool(
    "coolify_list_teams",
    "List all teams",
    {},
    async () => {
      try {
        const teams = await client.listTeams();
        return {
          content: [{ type: "text", text: JSON.stringify(teams, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "List teams failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_get_current_team",
    "Get the current team",
    {},
    async () => {
      try {
        const team = await client.getCurrentTeam();
        return {
          content: [{ type: "text", text: JSON.stringify(team, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Get current team failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "coolify_get_team_members",
    "Get members of the current team",
    {},
    async () => {
      try {
        const members = await client.getTeamMembers();
        return {
          content: [{ type: "text", text: JSON.stringify(members, null, 2) }],
        };
      } catch (error) {
        logger.error({ error }, "Get team members failed");
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  logger.info("Registered 40+ Coolify MCP tools");
}
