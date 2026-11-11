import { Controller, Get, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { DrawDto } from '@theetiptop-contest/shared';
import type { Request } from 'express';

import type { AuthenticatedUser } from '../../common/auth-context.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { DrawService } from './draw.service.js';

@ApiTags('admin')
@ApiCookieAuth('better-auth.session_token')
@Roles('ADMIN')
@Controller('admin/draw')
export class DrawController {
  constructor(private readonly draw: DrawService) {}

  @Get()
  @ApiOperation({
    summary: 'Le tirage du gros lot',
    description:
      'Renvoie `null` tant que le tirage n’a pas eu lieu. Le back-office affiche alors le bouton de tirage plutôt que le résultat.',
  })
  get(): Promise<DrawDto | null> {
    return this.draw.getDraw();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Effectuer le tirage du gros lot',
    description: [
      'Une année de thé, 360 €. Opération **unique et irréversible**, menée sous le contrôle de Maître Arnaud Rick.',
      '',
      'Deux exigences du sujet sont tenues ici à la lettre :',
      '',
      '1. le tirage est effectué **côté serveur** : rien n’en est reproductible depuis un navigateur ;',
      '2. **le nombre de participations n’augmente pas les chances** : l’assiette du tirage est `SELECT DISTINCT "userId"`, soit l’ensemble des **participants** et non celui des participations. Un client qui a joué quarante codes a une chance, exactement comme celui qui en a joué un.',
      '',
      'La graine et l’empreinte SHA-256 de la liste ordonnée des participants sont conservées, ce qui permet de rejouer et de vérifier le tirage après coup.',
      '',
      'Refus possibles : `409 CONTEST_NOT_CLOSED` avant la clôture, `409 ALREADY_DRAWN` si le tirage a déjà eu lieu, `409 NO_PARTICIPANT` s’il n’y a personne à tirer.',
    ].join('\n'),
  })
  execute(@CurrentUser() actor: AuthenticatedUser, @Req() request: Request): Promise<DrawDto> {
    return this.draw.executeDraw(actor, request.ip);
  }

  @Get(':id/verify')
  @ApiOperation({
    summary: 'Vérifier un tirage',
    description: [
      'Rejoue le tirage enregistré depuis sa graine et la liste actuelle des participants, et compare le résultat.',
      '',
      'C’est ce qui fait de « vérifiable par l’huissier » une procédure et non une affirmation :',
      '- `fingerprintMatches: false` signifie que l’assiette des participants a changé depuis le tirage ;',
      '- `winnerMatches: false` avec une empreinte conforme signifierait que le générateur utilisé n’est pas celui décrit.',
    ].join('\n'),
  })
  verify(@Param('id') id: string): Promise<{
    fingerprintMatches: boolean;
    winnerMatches: boolean;
    recomputedWinnerId: string | null;
  }> {
    return this.draw.verifyDraw(id);
  }
}
