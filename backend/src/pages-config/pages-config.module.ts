import { Module } from '@nestjs/common';
import { PagesConfigController } from './pages-config.controller';
import { PagesConfigService } from './pages-config.service';

@Module({
  controllers: [PagesConfigController],
  providers: [PagesConfigService],
})
export class PagesConfigModule {}
