# O3C Coolify MCP Server

A Model Context Protocol (MCP) server for interacting with Coolify API. Deployable as a web service supporting **SSE**, **Streamable HTTP**, or **stdio** transports.

## Features

- **40+ MCP Tools** for complete Coolify API coverage
- **Multiple Transports**: stdio, SSE, Streamable HTTP
- **Web Service Ready**: Deploy as a standalone HTTP service
- **Container Ready**: Docker, Kubernetes, Coolify, Kubero, Dokploy compatible
- **Production Ready**: Health checks, logging, graceful shutdown

## Quick Start

### Environment Variables

```bash
# Required
COOLIFY_API_URL=https://your-coolify-instance.com
COOLIFY_API_TOKEN=your-api-token

# Optional
PORT=3000
HOST=0.0.0.0
TRANSPORT=sse  # sse, streamable, or stdio
LOG_LEVEL=info
CORS_ORIGIN=*
```

### Run with Docker

```bash
# Using docker-compose
docker-compose up -d

# Or build and run directly
docker build -t coolify-mcp-server .
docker run -p 3000:3000 \
  -e COOLIFY_API_URL=https://coolify.example.com \
  -e COOLIFY_API_TOKEN=your-token \
  coolify-mcp-server
```

### Run with Node.js

```bash
# Install dependencies
npm install

# Build
npm run build

# Run SSE server (default)
npm start

# Run with specific transport
npm run start:sse        # HTTP + SSE
npm run start:streamable # Streamable HTTP
npm run start:stdio      # stdio for local MCP clients
```

## API Endpoints

### SSE Transport (default)
- `GET /` - Server info
- `GET /health` - Health check
- `GET /sse` - SSE connection endpoint
- `POST /messages?sessionId=<id>` - Send messages

### Streamable HTTP Transport
- `GET /` - Server info
- `GET /health` - Health check
- `POST /mcp` - MCP messages endpoint
- `GET /mcp` - SSE stream (with session ID)
- `DELETE /mcp` - Terminate session

## Available MCP Tools

### Applications
- `coolify_list_applications` - List all applications
- `coolify_get_application` - Get application details
- `coolify_create_application` - Create new application
- `coolify_deploy_application` - Deploy application
- `coolify_start_application` - Start application
- `coolify_stop_application` - Stop application
- `coolify_restart_application` - Restart application
- `coolify_delete_application` - Delete application
- `coolify_get_application_logs` - Get application logs
- `coolify_get_application_envs` - Get environment variables
- `coolify_update_application_envs` - Update environment variables

### Servers
- `coolify_list_servers` - List all servers
- `coolify_get_server` - Get server details
- `coolify_get_server_resources` - Get server resources
- `coolify_validate_server` - Validate server connection

### Projects
- `coolify_list_projects` - List all projects
- `coolify_get_project` - Get project details
- `coolify_create_project` - Create new project
- `coolify_delete_project` - Delete project

### Databases
- `coolify_list_databases` - List all databases
- `coolify_get_database` - Get database details
- `coolify_create_database` - Create new database
- `coolify_start_database` - Start database
- `coolify_stop_database` - Stop database
- `coolify_restart_database` - Restart database
- `coolify_delete_database` - Delete database

### Services
- `coolify_list_services` - List all services
- `coolify_get_service` - Get service details
- `coolify_start_service` - Start service
- `coolify_stop_service` - Stop service
- `coolify_restart_service` - Restart service
- `coolify_delete_service` - Delete service

### Deployments
- `coolify_list_deployments` - List all deployments
- `coolify_get_deployment` - Get deployment details
- `coolify_deploy_by_tag` - Deploy by tag

### Teams
- `coolify_list_teams` - List all teams
- `coolify_get_current_team` - Get current team
- `coolify_get_team_members` - Get team members

### System
- `coolify_health_check` - Check API health
- `coolify_get_version` - Get Coolify version

## Deployment

### Coolify

1. Create a new application in Coolify
2. Set source to this repository
3. Configure environment variables
4. Deploy!

### Kubero

```yaml
# kubero.yaml
apiVersion: application.kubero.dev/v1alpha1
kind: KuberoApp
metadata:
  name: coolify-mcp-server
spec:
  image:
    repository: ghcr.io/o3c/coolify-mcp-server
    tag: latest
  port: 3000
  envVars:
    - name: COOLIFY_API_URL
      value: "https://coolify.example.com"
    - name: COOLIFY_API_TOKEN
      valueFrom:
        secretKeyRef:
          name: coolify-secrets
          key: api-token
```

### Dokploy

1. Create new application
2. Select Docker/Git source
3. Configure environment variables
4. Deploy

### Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/deployment.yaml

# Update secrets
kubectl create secret generic coolify-mcp-secrets \
  --from-literal=COOLIFY_API_URL=https://coolify.example.com \
  --from-literal=COOLIFY_API_TOKEN=your-token \
  -n mcp-server
```

## Using with AI Agents

### Claude Desktop (stdio)

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["-y", "o3c-coolify-mcp-server", "--transport", "stdio"],
      "env": {
        "COOLIFY_API_URL": "https://coolify.example.com",
        "COOLIFY_API_TOKEN": "your-token"
      }
    }
  }
}
```

### Remote MCP Client (SSE)

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const transport = new SSEClientTransport(
  new URL("http://localhost:3000/sse")
);

const client = new Client({
  name: "my-client",
  version: "1.0.0",
});

await client.connect(transport);

// List applications
const result = await client.callTool({
  name: "coolify_list_applications",
  arguments: {},
});
```

## License

MIT
