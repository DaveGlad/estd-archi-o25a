import { Module } from '@nestjs/common';

import { CatalogueModule } from '../catalogue/catalogue.module.js';
import { PosController } from './pos.controller.js';
import { PosService } from './pos.service.js';

@Module({
  imports: [CatalogueModule],
  controllers: [PosController],
  providers: [PosService],
})
export class PosModule {}
