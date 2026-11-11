import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminParticipationDto,
  Paginated,
  ParticipationDto,
  SubmitCodeResult,
} from '@theetiptop-contest/shared';
import type { Request } from 'express';

import type { AuthenticatedUser } from '../../common/auth-context.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { ListParticipationsDto } from './dto/list-participations.dto.js';
import { SubmitCodeDto } from './dto/submit-code.dto.js';
import { ParticipationsService } from './participations.service.js';

@ApiTags('participations')
@ApiCookieAuth('better-auth.session_token')
@Controller('participations')
export class ParticipationsController {
  constructor(private readonly participations: ParticipationsService) {}

  /**
   * Returns **HTTP 200 for all six outcomes**, as a discriminated union on `outcome`.
   *
   * Unusual, and deliberate. "Tell me what my code is worth" has six normal answers: the
   * customer won, the code was mistyped, it does not exist, it was already played, the
   * contest has closed, or they have tried too often. None of those is a protocol error —
   * every one of them is a screen the front end renders. Mapping them onto 400/404/409/429
   * would mean the client has to branch on status, parse error bodies back into a union,
   * and keep that mapping in sync with the API by hand.
   *
   * The front end was mocked against exactly this union before the API existed
   * (`SubmitCodeResult` in `@theetiptop-contest/shared`), and the compiler checks both
   * sides against it.
   */
  @Roles('CUSTOMER')
  @Post()
  @ApiOperation({
    summary: 'Jouer un code de ticket de caisse',
    description: [
      'Cas d’utilisation UC-01. **Répond 200 pour les six issues possibles**, discriminées par le champ `outcome` :',
      '',
      '| `outcome` | Signification |',
      '|---|---|',
      '| `WON` | Code valide : la participation est créée et le lot révélé |',
      '| `INVALID_FORMAT` | La saisie ne fait pas 10 caractères alphanumériques |',
      '| `UNKNOWN_CODE` | Le code n’existe pas pour ce jeu |',
      '| `ALREADY_USED` | Le code a déjà été joué, avec la date et un indicateur « par vous-même » |',
      '| `CONTEST_CLOSED` | La saisie est fermée : avant `startsAt`, ou après `claimDeadline` |',
      '| `RATE_LIMITED` | Trop de tentatives, avec le délai d’attente en minutes |',
      '',
      'Le lot n’est **pas tiré au sort ici** : il a été figé à la génération des 500 000 codes, ce qui est ce qui garantit la répartition 60/20/10/6/4 %.',
    ].join('\n'),
  })
  @ApiOkResponse({
    description: 'Issue de la participation, discriminée par `outcome`.',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            outcome: { type: 'string', enum: ['WON'] },
            participation: { type: 'object' },
            prize: { type: 'object' },
          },
        },
        {
          type: 'object',
          properties: {
            outcome: {
              type: 'string',
              enum: ['INVALID_FORMAT', 'UNKNOWN_CODE', 'ALREADY_USED', 'CONTEST_CLOSED', 'RATE_LIMITED'],
            },
          },
        },
      ],
    },
  })
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SubmitCodeDto,
    @Req() request: Request
  ): Promise<SubmitCodeResult> {
    // `request.ip` is the client address resolved by Express using `trust proxy`, set in
    // main.ts. Without that setting every participation would record the reverse proxy.
    return this.participations.submitCode(user, body.code, request.ip);
  }

  @Roles('ADMIN')
  @Get()
  @ApiOperation({
    summary: 'Lister les participations',
    description: [
      'Liste administrateur, paginée et filtrable : recherche libre sur le nom, l’adresse électronique ou un code de ticket exact, filtre par statut du lot et par lot.',
      '',
      'Paginée parce que c’est la seule collection du système sans plafond naturel : 500 000 codes, donc jusqu’à 500 000 participations. Un point d’entrée qui les renverrait toutes finirait par expirer sur l’écran le plus consulté du back-office.',
      '',
      'Le bloc client est volontairement minimal : ni date de naissance, ni code postal, ni préférence commerciale. La minimisation RGPD s’applique à un écran interne comme à un export.',
    ].join('\n'),
  })
  list(@Query() query: ListParticipationsDto): Promise<Paginated<AdminParticipationDto>> {
    return this.participations.listForAdmin(query);
  }

  @Roles('CUSTOMER')
  @Get('mine')
  @ApiOperation({
    summary: 'Mes gains',
    description:
      'Historique des participations du client connecté, du plus récent au plus ancien. Requirement 5 du sujet.',
  })
  listMine(@CurrentUser() user: AuthenticatedUser): Promise<ParticipationDto[]> {
    return this.participations.listMine(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Détail d’un gain',
    description:
      'Accessible à son propriétaire, ainsi qu’aux employés de boutique et aux administrateurs : l’employé en a besoin pour remettre le lot.',
  })
  getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ): Promise<ParticipationDto> {
    return this.participations.getOne(user, id);
  }
}
