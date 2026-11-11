import { Module } from '@nestjs/common';

import { CatalogueModule } from '../catalogue/catalogue.module.js';
import { ParticipationsController } from './participations.controller.js';
import { ParticipationsService } from './participations.service.js';

@Module({
  imports: [CatalogueModule],
  controllers: [ParticipationsController],
  providers: [ParticipationsService],
  exports: [ParticipationsService],
})
export class ParticipationsModule {}
