import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { StatsDto } from '@theetiptop-contest/shared';

import { Roles } from '../../common/decorators/roles.decorator.js';
import { StatsService } from './stats.service.js';

@ApiTags('admin')
@ApiCookieAuth('better-auth.session_token')
@Roles('ADMIN')
@Controller('admin/stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get()
  @ApiOperation({
    summary: 'Tableau de bord administrateur',
    description: [
      'Couvre mot pour mot les statistiques listées par le sujet : nombre de tickets fournis, nombre de tickets utilisés, nombre de lots déjà gagnés, répartition des gagnants par sexe et par âge.',
      '',
      '- `participants` compte les **participants distincts**, pas les participations : c’est aussi l’assiette du tirage du gros lot.',
      '- `byAgeRange` calcule l’âge depuis la date de naissance à chaque lecture ; les clients sans date de naissance, cas des inscriptions Google et Facebook, sont exclus plutôt que rangés arbitrairement.',
      '- `byStore` n’est calculable que parce que chaque code enregistre la boutique qui l’a imprimé.',
      '',
      'Agrégats mis en cache 2 minutes dans Redis, et invalidés à chaque participation et à chaque remise de lot.',
    ].join('\n'),
  })
  getDashboard(): Promise<StatsDto> {
    return this.stats.getDashboard();
  }
}
