#!/bin/bash
set -e

echo "Validating environment configuration..."

# Required variables
REQUIRED_VARS=(
  "COOLIFY_BASE_URL"
  "COOLIFY_API_TOKEN"
)

# Check if .env file exists
if [ -f .env ]; then
  source .env
elif [ -f ../.env ]; then
  source ../.env
fi

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "Error: Missing required environment variables:"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  echo ""
  echo "Please set these variables in your .env file or environment"
  exit 1
fi

# Validate COOLIFY_BASE_URL format
if [[ ! "$COOLIFY_BASE_URL" =~ ^https?:// ]]; then
  echo "Error: COOLIFY_BASE_URL must start with http:// or https://"
  exit 1
fi

# Validate API token length
if [ ${#COOLIFY_API_TOKEN} -lt 10 ]; then
  echo "Warning: COOLIFY_API_TOKEN seems too short. Make sure it's valid."
fi

echo "Environment configuration is valid!"
echo ""
echo "Configuration:"
echo "  COOLIFY_BASE_URL: $COOLIFY_BASE_URL"
echo "  COOLIFY_API_TOKEN: ${COOLIFY_API_TOKEN:0:10}..."
