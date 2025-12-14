import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { CoolifyModule } from './coolify/coolify.module';
import { McpModule } from './mcp/mcp.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    CoolifyModule,
    McpModule,
    HealthModule,
  ],
})
export class AppModule {}
