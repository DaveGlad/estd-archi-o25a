import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { CustomerSearchResultDto, ParticipationDto } from '@theetiptop-contest/shared';
import type { Request } from 'express';

import type { AuthenticatedUser } from '../../common/auth-context.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RedeemPrizeDto } from './dto/redeem-prize.dto.js';
import { EmployeeService } from './employee.service.js';

/**
 * In-store employee back office.
 *
 * `@Roles('EMPLOYEE', 'ADMIN')` at class level: both are listed explicitly rather than
 * relying on a role hierarchy. `RolesGuard` has none on purpose — an administrator being
 * implicitly an employee is how an admin-only endpoint ends up reachable by a till
 * employee after a refactor. Here an administrator genuinely needs access, to settle a
 * dispute, so the role is named.
 */
@ApiTags('employee')
@ApiCookieAuth('better-auth.session_token')
@Roles('EMPLOYEE', 'ADMIN')
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employee: EmployeeService) {}

  @Get('customers')
  @ApiOperation({
    summary: 'Rechercher un client',
    description: [
      'Recherche par fragment d’adresse électronique, fragment de nom, ou **code de ticket exact**.',
      '',
      'Appuyée sur les index trigrammes `pg_trgm` : une recherche de sous-chaîne non ancrée n’est pas indexable par un B-tree, et un balayage séquentiel de la table clients ferait attendre l’employé pendant que la file s’allonge. C’est la solution retenue à la place d’Elasticsearch, écarté parce que non open source depuis la version 7.11 — voir `DECISIONS.md` § 3.',
      '',
      'Les comptes anonymisés sont exclus : il n’y a plus personne à qui remettre un lot.',
    ].join('\n'),
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: '2 caractères minimum. 10 résultats au maximum.',
    example: 'rousseau',
  })
  search(@Query('q') query = ''): Promise<CustomerSearchResultDto[]> {
    return this.employee.searchCustomers(query);
  }

  @Get('customers/:id')
  @ApiOperation({
    summary: 'Fiche d’un client',
    description: 'Ses participations et les lots qui lui restent à retirer.',
  })
  getCustomer(@Param('id') id: string): Promise<CustomerSearchResultDto> {
    return this.employee.getCustomer(id);
  }

  @Post('redemptions')
  @ApiOperation({
    summary: 'Marquer un lot comme remis',
    description: [
      'Enregistre la remise effective d’un lot au client, en boutique ou en ligne.',
      '',
      'Opération tracée : l’identité de l’employé, la boutique et l’horodatage sont conservés, et une ligne est écrite au journal d’audit. C’est ce qui permet d’établir après coup qui a remis quoi, ce que réclament à la fois la responsabilité RGPD et le contrôle de l’huissier.',
      '',
      'Un employé ne peut enregistrer une remise que pour **sa** boutique. Seul un administrateur peut en désigner une autre.',
      '',
      'Répond `409 ALREADY_REDEEMED` si le lot a déjà été remis, `409 CLAIM_WINDOW_CLOSED` si le délai de réclamation est dépassé.',
    ].join('\n'),
  })
  redeem(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() body: RedeemPrizeDto,
    @Req() request: Request
  ): Promise<ParticipationDto> {
    return this.employee.redeemPrize(actor, body, request.ip);
  }
}
