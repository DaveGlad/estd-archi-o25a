import { Module } from '@nestjs/common';

import { CatalogueController } from './catalogue.controller.js';
import { CatalogueService } from './catalogue.service.js';

/**
 * Exports its service: resolving "the current contest" is needed by the participation,
 * till and draw modules, and duplicating that rule is how two of them end up disagreeing
 * about which contest is running.
 */
@Module({
  controllers: [CatalogueController],
  providers: [CatalogueService],
  exports: [CatalogueService],
})
export class CatalogueModule {}
