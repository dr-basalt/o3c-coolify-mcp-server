import { Module } from '@nestjs/common';
import { CoolifyService } from './coolify.service';

@Module({
  providers: [CoolifyService],
  exports: [CoolifyService],
})
export class CoolifyModule {}
