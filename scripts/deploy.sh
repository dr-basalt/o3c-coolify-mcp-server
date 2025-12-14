#!/bin/bash
set -e

DEPLOYMENT_TARGET=${1:-docker}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Deploying Coolify MCP Server to $DEPLOYMENT_TARGET..."

case $DEPLOYMENT_TARGET in
  docker)
    echo "Deploying with Docker Compose..."
    cd "$PROJECT_ROOT/deploy/docker"
    docker-compose up -d --build
    echo "Deployment complete!"
    echo "Server running at http://localhost:3000"
    echo "Health check: http://localhost:3000/health"
    ;;

  kubernetes)
    echo "Deploying to Kubernetes with Helm..."
    cd "$PROJECT_ROOT/deploy/kubernetes/helm"

    # Check if values file exists
    if [ ! -f values-override.yaml ]; then
      echo "Warning: values-override.yaml not found"
      echo "Using default values. Please set coolify.baseUrl and coolify.apiToken"
    fi

    helm upgrade --install coolify-mcp-server . \
      --namespace coolify-mcp \
      --create-namespace \
      ${[ -f values-override.yaml ] && echo "-f values-override.yaml"} \
      --wait
    echo "Deployment complete!"
    ;;

  coolify)
    echo "Deploying to Coolify..."
    echo "Please use the Coolify web UI to deploy this application"
    echo "Configuration file: deploy/coolify/coolify.yaml"
    echo ""
    echo "Steps:"
    echo "  1. Add a new Application in Coolify"
    echo "  2. Connect your Git repository"
    echo "  3. Configure environment variables"
    echo "  4. Deploy"
    ;;

  kubero)
    echo "Deploying to Kubero..."
    kubectl apply -f "$PROJECT_ROOT/deploy/kubero/kubero.yaml"
    echo "Deployment complete!"
    ;;

  dokploy)
    echo "Deploying to Dokploy..."
    echo "Please use the Dokploy CLI or web UI"
    echo "Configuration file: deploy/dokploy/dokploy.yaml"
    ;;

  *)
    echo "Unknown deployment target: $DEPLOYMENT_TARGET"
    echo "Available targets: docker, kubernetes, coolify, kubero, dokploy"
    exit 1
    ;;
esac

echo ""
echo "Deployment information:"
echo "  Target: $DEPLOYMENT_TARGET"
echo "  Run './scripts/health-check.sh' to verify deployment"
