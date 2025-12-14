import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly registry: Registry;
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestTotal: Counter;
  private readonly mcpToolCalls: Counter;
  private readonly mcpToolErrors: Counter;

  constructor() {
    this.registry = new Registry();

    // Collect default Node.js metrics
    collectDefaultMetrics({ register: this.registry });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.mcpToolCalls = new Counter({
      name: 'mcp_tool_calls_total',
      help: 'Total number of MCP tool calls',
      labelNames: ['tool_name', 'status'],
      registers: [this.registry],
    });

    this.mcpToolErrors = new Counter({
      name: 'mcp_tool_errors_total',
      help: 'Total number of MCP tool errors',
      labelNames: ['tool_name', 'error_type'],
      registers: [this.registry],
    });
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.httpRequestDuration.observe(
      { method, route, status_code: String(statusCode) },
      duration,
    );
    this.httpRequestTotal.inc({ method, route, status_code: String(statusCode) });
  }

  recordMcpToolCall(toolName: string, status: 'success' | 'error') {
    this.mcpToolCalls.inc({ tool_name: toolName, status });
  }

  recordMcpToolError(toolName: string, errorType: string) {
    this.mcpToolErrors.inc({ tool_name: toolName, error_type: errorType });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
