import { Module } from '@nestjs/common';
import { McpService } from './mcp.service';
import { CoolifyModule } from '../coolify/coolify.module';

@Module({
  imports: [CoolifyModule],
  providers: [McpService],
  exports: [McpService],
})
export class McpModule {}
