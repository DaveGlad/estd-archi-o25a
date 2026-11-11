import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import type { AuthenticatedUser } from '../../common/auth-context.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { ExportService } from './export.service.js';

@ApiTags('admin')
@ApiCookieAuth('better-auth.session_token')
@Roles('ADMIN')
@Controller('admin/export')
export class ExportController {
  constructor(private readonly exporter: ExportService) {}

  @Get('mailing')
  @ApiOperation({
    summary: 'Exporter la base emailing',
    description: [
      'Les clients ayant donné un **consentement commercial explicite**, et eux seuls.',
      '',
      'Données minimisées : adresse, prénom, nom, date de consentement, tranche d’âge, nombre de participations. Ni téléphone, ni code postal, ni date de naissance exacte — une campagne a besoin d’adresser et de segmenter, pas de détenir un profil.',
      '',
      'Chaque export écrit une ligne au journal d’audit : c’est une copie de données personnelles qui sort du système.',
      '',
      'Le CSV est produit avec un séparateur point-virgule et un BOM UTF-8, pour être ouvrable tel quel dans Excel en configuration française. Les champs commençant par `=`, `+`, `-` ou `@` sont neutralisés par une apostrophe : sans cela, un client inscrit sous un nom construit comme une formule transforme l’export en exécution de code sur le poste qui l’ouvre.',
    ].join('\n'),
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['csv', 'json'],
    description: 'Par défaut `csv`, le format attendu par les outils d’emailing.',
  })
  async mailing(
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
    @Res() response: Response,
    @Query('format') format: 'csv' | 'json' = 'csv'
  ): Promise<void> {
    const rows = await this.exporter.buildMailingRows(actor, request.ip);
    const stamp = new Date().toISOString().slice(0, 10);

    if (format === 'json') {
      response
        .status(200)
        .setHeader('Content-Disposition', `attachment; filename="base-emailing-${stamp}.json"`)
        .json(rows);
      return;
    }

    response
      .status(200)
      .setHeader('Content-Type', 'text/csv; charset=utf-8')
      .setHeader('Content-Disposition', `attachment; filename="base-emailing-${stamp}.csv"`)
      // An export of personal data has no business sitting in a proxy cache.
      .setHeader('Cache-Control', 'no-store')
      .send(this.exporter.toCsv(rows));
  }
}
