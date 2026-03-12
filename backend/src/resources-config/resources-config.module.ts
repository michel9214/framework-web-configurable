import { Module } from '@nestjs/common';
import { ResourcesConfigController } from './resources-config.controller';
import { ResourcesConfigService } from './resources-config.service';

@Module({
  controllers: [ResourcesConfigController],
  providers: [ResourcesConfigService],
})
export class ResourcesConfigModule {}
