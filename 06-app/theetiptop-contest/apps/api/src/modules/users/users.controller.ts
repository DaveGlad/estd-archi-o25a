import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PersonalDataExport, UserDto } from '@theetiptop-contest/shared';
import type { Request, Response } from 'express';

import type { AuthenticatedUser } from '../../common/auth-context.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { RegisterDto } from './dto/register.dto.js';
import { UpdateConsentDto, UpdateProfileDto } from './dto/update-profile.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Inscription par formulaire',
    description: [
      'Crée un compte client et ouvre immédiatement la session : le cookie de session est posé dans la réponse, le client n’a pas à se reconnecter après s’être inscrit.',
      '',
      'Trois règles sont appliquées ici et non par Better Auth :',
      '- **majorité** : le règlement réserve le jeu aux personnes de 18 ans et plus ;',
      '- **acceptation obligatoire** du règlement du jeu et des conditions générales ;',
      '- **horodatage des consentements côté serveur**, seule preuve opposable.',
      '',
      'L’inscription par Google et par Facebook passe, elle, par `/api/auth/sign-in/social`.',
    ].join('\n'),
  })
  async register(@Body() body: RegisterDto, @Res() response: Response): Promise<void> {
    const { user, authResponse } = await this.users.register(body);

    // Forwards Better Auth's `Set-Cookie` onto the Express response. `getSetCookie()`
    // returns the header as an array, which matters: a single joined string would be one
    // malformed cookie rather than several valid ones.
    const cookies = authResponse.headers.getSetCookie();
    if (cookies.length > 0) response.setHeader('set-cookie', cookies);

    response.status(HttpStatus.CREATED).json(user);
  }

  @ApiCookieAuth('better-auth.session_token')
  @Get('me')
  @ApiOperation({ summary: 'Mon compte' })
  getMe(@CurrentUser() user: AuthenticatedUser): Promise<UserDto> {
    return this.users.getMe(user.id);
  }

  @ApiCookieAuth('better-auth.session_token')
  @Patch('me')
  @ApiOperation({
    summary: 'Modifier mon profil',
    description:
      'Les champs absents sont laissés tels quels ; `null` efface la valeur. L’adresse électronique, le rôle et la boutique de rattachement ne sont pas modifiables ici.',
  })
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateProfileDto
  ): Promise<UserDto> {
    return this.users.updateProfile(user.id, body);
  }

  @ApiCookieAuth('better-auth.session_token')
  @Patch('me/consent')
  @ApiOperation({
    summary: 'Donner ou retirer mon consentement commercial',
    description:
      'Sur un point d’entrée distinct du profil : le retrait doit être aussi simple que le consentement, article 7.3 du RGPD.',
  })
  updateConsent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateConsentDto
  ): Promise<UserDto> {
    return this.users.updateConsent(user, body);
  }

  @ApiCookieAuth('better-auth.session_token')
  @Get('me/data-export')
  @ApiOperation({
    summary: 'Exporter mes données personnelles',
    description:
      'Droit à la portabilité, article 20 du RGPD. Compte, participations et consentements horodatés. L’empreinte d’adresse IP conservée pour l’anti-fraude en est volontairement exclue.',
  })
  exportData(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ): Promise<PersonalDataExport> {
    return this.users.exportPersonalData(user, request.ip);
  }

  @ApiCookieAuth('better-auth.session_token')
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer mon compte',
    description: [
      'Droit à l’effacement, article 17 du RGPD, mis en œuvre par **anonymisation et non par suppression**.',
      '',
      'Les données identifiantes sont effacées et les sessions révoquées ; les participations sont conservées sous une identité anonymisée. Justification : l’article 17.3 autorise la conservation nécessaire au respect d’une obligation légale et à la constatation de droits, et un jeu-concours contrôlé par un huissier en relève — sans les participations, la répartition 60/20/10/6/4 % ne serait plus démontrable et un lot remis ne serait plus prouvable.',
      '',
      'Détaillé dans le cahier de légalité, partie H du cahier des charges.',
    ].join('\n'),
  })
  anonymize(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ): Promise<{ anonymizedAt: string }> {
    return this.users.anonymize(user, request.ip);
  }
}
