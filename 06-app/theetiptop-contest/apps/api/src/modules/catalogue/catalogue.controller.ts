import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ContestDto, PrizeDto, StoreDto } from '@theetiptop-contest/shared';

import { Public } from '../../common/decorators/public.decorator.js';
import { CatalogueService } from './catalogue.service.js';

/**
 * Public catalogue of the contest.
 *
 * Entirely `@Public()`: these are the pages search engines have to be able to read, and
 * SEO is an explicit requirement of the brief. An endpoint behind a session would be
 * invisible to a crawler, and the public pages are server-rendered from exactly these
 * three routes.
 */
@ApiTags('catalogue')
@Controller()
export class CatalogueController {
  constructor(private readonly catalogue: CatalogueService) {}

  @Public()
  @Get('contest')
  @ApiOperation({
    summary: 'Le jeu-concours en cours',
    description:
      'Dates, seuil de participation, volume de codes, huissier. `isOpen` est calculé par le serveur : l’horloge du navigateur du visiteur n’est pas une référence.',
  })
  getContest(): Promise<ContestDto> {
    return this.catalogue.getCurrentContest();
  }

  @Public()
  @Get('prizes')
  @ApiOperation({
    summary: 'Les lots à gagner',
    description:
      'Les 5 lots répartis sur les 500 000 codes, avec leur pourcentage cible, plus le gros lot tiré au sort à la clôture.',
  })
  listPrizes(): Promise<PrizeDto[]> {
    return this.catalogue.listPrizes();
  }

  @Public()
  @Get('stores')
  @ApiOperation({
    summary: 'Les boutiques Thé Tip Top',
    description:
      'Les 10 points de vente actifs, du plus récemment ouvert au plus ancien. `isNew` marque la boutique de Nice, dont l’ouverture motive le jeu.',
  })
  @ApiOkResponse({ description: 'Liste des boutiques actives.' })
  listStores(): Promise<StoreDto[]> {
    return this.catalogue.listStores();
  }
}
