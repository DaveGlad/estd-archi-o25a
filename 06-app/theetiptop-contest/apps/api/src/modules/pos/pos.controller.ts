import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { DispenseCodeResult, PosContestInfo } from '@theetiptop-contest/shared';

import type { ApiKeyConsumer } from '../../common/auth-context.js';
import { ApiKeyConsumerOnly, CurrentConsumer } from '../../common/decorators/api-key.decorator.js';
import { DispenseCodeDto, VoidCodeDto } from './dto/pos.dto.js';
import { PosService } from './pos.service.js';

/**
 * Endpoints for the non-browser consumers of API v1.
 *
 * `@ApiKeyConsumerOnly()` at class level: these routes authenticate by key, never by
 * session. A till is not a person, has no browser and no cookie, and has to keep working
 * for months without anybody signing in. One revocable key per consumer means the
 * e-commerce integration can be cut off without taking the 10 stores down with it.
 */
@ApiTags('pos')
@ApiSecurity('api-key')
@ApiKeyConsumerOnly()
@Controller('pos')
export class PosController {
  constructor(private readonly pos: PosService) {}

  @Get('contest')
  @ApiOperation({
    summary: 'État du jeu, pour la caisse',
    description:
      'Ce qu’une caisse a besoin de savoir pour décider seule si elle doit imprimer un code, sans coder en dur les règles du jeu : fenêtre d’ouverture, seuil de montant, longueur du code, et nombre de codes encore distribuables.',
  })
  getContest(): Promise<PosContestInfo> {
    return this.pos.getContestInfo();
  }

  @Post('codes/dispense')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Obtenir un code à imprimer sur le ticket',
    description: [
      'Sort un code du pool des 500 000 et le marque comme distribué, en enregistrant la boutique, le montant et la référence du ticket.',
      '',
      '⚠️ **La réponse ne révèle jamais le lot associé au code.** La caisse n’a pas à le connaître et le client doit le découvrir sur le site : une caisse compromise ne permet donc pas de trier les tickets gagnants.',
      '',
      'Concurrence : la sortie du pool est un `UPDATE ... WHERE id = (SELECT ... FOR UPDATE SKIP LOCKED)`, soit un seul ordre SQL. Dix caisses qui encaissent au même instant repartent avec dix codes différents, et jamais deux fois le même.',
      '',
      'Refus possibles : `409 CONTEST_CLOSED`, `422 AMOUNT_BELOW_THRESHOLD`, `422 UNKNOWN_STORE`, `409 CODE_POOL_EXHAUSTED`.',
    ].join('\n'),
  })
  dispense(
    @CurrentConsumer() consumer: ApiKeyConsumer,
    @Body() body: DispenseCodeDto
  ): Promise<DispenseCodeResult> {
    return this.pos.dispenseCode(consumer, body);
  }

  @Post('codes/void')
  @ApiOperation({
    summary: 'Neutraliser un code dont le ticket a été annulé',
    description: [
      'Passe un code distribué à l’état `VOIDED` : il ne sera jamais jouable.',
      '',
      'Seul un code **distribué** peut être neutralisé. Un code déjà **joué** est refusé : le client a vu son lot, et annuler la vente ne reprend pas le lot — c’est un litige commercial, pas une opération de base de données. Neutraliser un code joué effacerait une participation que l’huissier doit pouvoir compter.',
      '',
      'Le motif est obligatoire : un ticket gagnant retiré du jeu sans justification est indéfendable devant l’huissier.',
    ].join('\n'),
  })
  void(
    @CurrentConsumer() consumer: ApiKeyConsumer,
    @Body() body: VoidCodeDto
  ): Promise<{ code: string; status: string }> {
    return this.pos.voidCode(consumer, body);
  }
}
