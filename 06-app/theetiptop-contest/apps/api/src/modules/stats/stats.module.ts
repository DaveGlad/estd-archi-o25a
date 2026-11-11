import { Module } from '@nestjs/common';

import { CatalogueModule } from '../catalogue/catalogue.module.js';
import { StatsController } from './stats.controller.js';
import { StatsService } from './stats.service.js';

@Module({
  imports: [CatalogueModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
