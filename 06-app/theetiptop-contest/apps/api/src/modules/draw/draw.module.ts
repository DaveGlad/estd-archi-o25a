import { Module } from '@nestjs/common';

import { CatalogueModule } from '../catalogue/catalogue.module.js';
import { DrawController } from './draw.controller.js';
import { DrawService } from './draw.service.js';

@Module({
  imports: [CatalogueModule],
  controllers: [DrawController],
  providers: [DrawService],
})
export class DrawModule {}
