#!/bin/bash

HEALTH_URL=${1:-http://localhost:3000/health}
MAX_RETRIES=30
RETRY_DELAY=2

echo "Checking server health at $HEALTH_URL..."

for i in $(seq 1 $MAX_RETRIES); do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")

  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "Server is healthy!"
    echo ""
    curl -s "$HEALTH_URL" | python3 -m json.tool 2>/dev/null || curl -s "$HEALTH_URL"
    exit 0
  fi

  echo "Attempt $i/$MAX_RETRIES: Server not ready (HTTP $HTTP_STATUS). Retrying in ${RETRY_DELAY}s..."
  sleep $RETRY_DELAY
done

echo "Server health check failed after $MAX_RETRIES attempts"
exit 1
