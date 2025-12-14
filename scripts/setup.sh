#!/bin/bash
set -e

echo "Setting up Coolify MCP Server..."

# Check Node.js version
REQUIRED_NODE_VERSION="20"
CURRENT_NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")

if [ "$CURRENT_NODE_VERSION" -lt "$REQUIRED_NODE_VERSION" ]; then
  echo "Error: Node.js version $REQUIRED_NODE_VERSION or higher is required"
  echo "Current version: $(node -v 2>/dev/null || echo 'not installed')"
  exit 1
fi

echo "Node.js version check passed (v$CURRENT_NODE_VERSION)"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Copy environment file if not exists
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
  echo "Please update .env with your Coolify credentials"
fi

# Build the project
echo "Building project..."
npm run build

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env with your Coolify API credentials"
echo "  2. Run 'npm start' to start the server"
echo "  3. Configure your AI assistant to connect to this MCP server"
