# Coolify MCP Server

Model Context Protocol (MCP) server for complete Coolify infrastructure management. This server enables AI assistants (Claude, ChatGPT, etc.) to manage your Coolify infrastructure through natural language commands.

## Features

- **Complete API Coverage**: Applications, Databases, Services, Servers, Teams, Projects, Deployments
- **SCRUD Operations**: Search, Create, Read, Update, Delete for all resources
- **Multi-Platform Deployment**: Docker, Kubernetes, Coolify, Kubero, Dokploy
- **Production Ready**: Health checks, monitoring, error handling, rate limiting
- **Type Safe**: Full TypeScript with Zod validation
- **Auto-Configuration**: Environment-based configuration with validation

## Quick Start

### Prerequisites

- Node.js 20+
- Coolify instance with API access
- API token from Coolify (Settings > API)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/coolify-mcp-server
cd coolify-mcp-server

# Run setup
./scripts/setup.sh

# Configure environment
cp .env.example .env
# Edit .env with your Coolify credentials
```

### Configuration

Set the following environment variables in `.env`:

```env
COOLIFY_BASE_URL=https://your-coolify-instance.com/api/v1
COOLIFY_API_TOKEN=your_api_token_here
```

### Running

```bash
# Development
npm run start:dev

# Production
npm run build
npm start

# MCP mode (stdio)
npm start -- --mcp
```

## AI Assistant Configuration

### Claude Desktop

Add to your Claude Desktop configuration (`~/.claude/mcp_servers.json`):

```json
{
  "coolify": {
    "command": "node",
    "args": ["/path/to/coolify-mcp-server/dist/main.js", "--mcp"],
    "env": {
      "COOLIFY_BASE_URL": "https://your-instance.com/api/v1",
      "COOLIFY_API_TOKEN": "your_token"
    }
  }
}
```

### Other MCP-Compatible Clients

The server runs on stdio by default when using the `--mcp` flag. Configure your client to execute:

```bash
node /path/to/coolify-mcp-server/dist/main.js --mcp
```

## Available Tools

### Applications

| Tool | Description |
|------|-------------|
| `coolify_list_applications` | List all applications with pagination |
| `coolify_create_application` | Create a new application |
| `coolify_get_application` | Get application details |
| `coolify_update_application` | Update application configuration |
| `coolify_delete_application` | Delete an application |
| `coolify_start_application` | Start an application |
| `coolify_stop_application` | Stop an application |
| `coolify_restart_application` | Restart an application |
| `coolify_deploy_application` | Trigger deployment |
| `coolify_get_application_logs` | Get application logs |
| `coolify_list_application_envs` | List environment variables |
| `coolify_create_application_env` | Create environment variable |
| `coolify_bulk_update_application_envs` | Bulk update environment variables |
| `coolify_delete_application_env` | Delete environment variable |

### Databases

| Tool | Description |
|------|-------------|
| `coolify_list_databases` | List all databases |
| `coolify_create_database` | Create a new database |
| `coolify_get_database` | Get database details |
| `coolify_update_database` | Update database configuration |
| `coolify_delete_database` | Delete a database |
| `coolify_start_database` | Start a database |
| `coolify_stop_database` | Stop a database |
| `coolify_restart_database` | Restart a database |
| `coolify_list_database_backups` | List backup configurations |
| `coolify_create_database_backup` | Create backup configuration |
| `coolify_trigger_database_backup` | Trigger manual backup |

### Services

| Tool | Description |
|------|-------------|
| `coolify_list_services` | List all services |
| `coolify_create_service` | Create a new service |
| `coolify_get_service` | Get service details |
| `coolify_delete_service` | Delete a service |
| `coolify_start_service` | Start a service |
| `coolify_stop_service` | Stop a service |
| `coolify_restart_service` | Restart a service |

### Servers

| Tool | Description |
|------|-------------|
| `coolify_list_servers` | List all servers |
| `coolify_create_server` | Add a new server |
| `coolify_get_server` | Get server details |
| `coolify_update_server` | Update server configuration |
| `coolify_delete_server` | Remove a server |
| `coolify_validate_server` | Validate server connection |
| `coolify_get_server_domains` | Get server domains |
| `coolify_get_server_resources` | Get server resources |

### Deployments

| Tool | Description |
|------|-------------|
| `coolify_list_deployments` | List all deployments |
| `coolify_list_deployments_by_application` | List deployments for an app |
| `coolify_get_deployment` | Get deployment details |

### Teams & Projects

| Tool | Description |
|------|-------------|
| `coolify_get_current_team` | Get current team info |
| `coolify_list_teams` | List all teams |
| `coolify_get_team` | Get team details |
| `coolify_get_team_members` | Get team members |
| `coolify_list_projects` | List all projects |
| `coolify_create_project` | Create a new project |
| `coolify_get_project` | Get project details |
| `coolify_update_project` | Update project |
| `coolify_delete_project` | Delete project |

### System

| Tool | Description |
|------|-------------|
| `coolify_get_version` | Get Coolify version |
| `coolify_health_check` | Check API health |

## Deployment

### Docker

```bash
cd deploy/docker
docker-compose up -d
```

### Kubernetes (Helm)

```bash
cd deploy/kubernetes/helm
helm install coolify-mcp-server . \
  --set coolify.baseUrl=https://your-instance.com/api/v1 \
  --set coolify.apiToken=your_token
```

### Coolify

Deploy directly on Coolify using the configuration in `deploy/coolify/`.

### Kubero

```bash
kubectl apply -f deploy/kubero/kubero.yaml
```

## Health Checks

The server exposes health check endpoints when running in HTTP mode:

- `GET /health` - Full health status
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

## Development

```bash
# Install dependencies
npm ci

# Run in development mode
npm run start:dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | HTTP port (non-MCP mode) | `3000` |
| `LOG_LEVEL` | Log level | `info` |
| `COOLIFY_BASE_URL` | Coolify API URL | Required |
| `COOLIFY_API_TOKEN` | API token | Required |
| `COOLIFY_TIMEOUT_MS` | Request timeout | `30000` |
| `COOLIFY_MAX_RETRIES` | Max retry attempts | `3` |
| `MCP_SERVER_NAME` | Server name | `coolify-mcp-server` |
| `MCP_SERVER_VERSION` | Server version | `1.0.0` |

## License

MIT
