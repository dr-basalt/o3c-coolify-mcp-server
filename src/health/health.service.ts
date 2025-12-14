import { Injectable, Logger } from '@nestjs/common';
import { CoolifyService } from '../coolify/coolify.service';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  coolify: 'connected' | 'disconnected' | 'unknown';
  version?: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private coolifyService: CoolifyService) {}

  async check(): Promise<HealthStatus> {
    const memoryUsage = process.memoryUsage();

    const status: HealthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
      },
      coolify: 'unknown',
    };

    try {
      const versionInfo = await this.coolifyService.getVersion();
      status.coolify = 'connected';
      status.version = versionInfo.version;
    } catch (error) {
      this.logger.warn('Coolify health check failed', error);
      status.coolify = 'disconnected';
      status.status = 'degraded';
    }

    return status;
  }

  async isHealthy(): Promise<boolean> {
    const status = await this.check();
    return status.status === 'ok';
  }
}
