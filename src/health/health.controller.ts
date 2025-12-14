import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  async check(@Res() res: Response) {
    const health = await this.healthService.check();

    const statusCode = health.status === 'ok'
      ? HttpStatus.OK
      : health.status === 'degraded'
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json(health);
  }

  @Get('live')
  async liveness(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({ status: 'alive' });
  }

  @Get('ready')
  async readiness(@Res() res: Response) {
    const isHealthy = await this.healthService.isHealthy();

    if (isHealthy) {
      return res.status(HttpStatus.OK).json({ status: 'ready' });
    }

    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({ status: 'not ready' });
  }
}
