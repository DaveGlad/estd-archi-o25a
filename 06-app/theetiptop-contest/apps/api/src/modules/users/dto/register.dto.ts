import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GENDER_VALUES, type Gender, type RegisterInput } from '@theetiptop-contest/shared';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Sign-up through the classic form. One of the three methods the brief mandates, next to
 * Google and Facebook OAuth.
 *
 * It goes through our own endpoint rather than straight to Better Auth's
 * `/api/auth/sign-up/email`, for three things only we can enforce:
 *   - the contest is restricted to adults, which means checking the birth date;
 *   - accepting the rules and the terms is mandatory, and refusing a sign-up without them
 *     is a business rule, not an auth-library concern;
 *   - the consent timestamps have to be stamped by the server. A timestamp a client sent
 *     is not proof of anything.
 */
export class RegisterDto implements RegisterInput {
  @ApiProperty({ example: 'camille.rousseau@example.fr' })
  @IsEmail({}, { message: 'L’adresse électronique n’est pas valide.' })
  @MaxLength(254) // RFC 5321 maximum
  email!: string;

  @ApiProperty({
    minLength: 12,
    description:
      '12 caractères minimum. Au-delà des 8 encore courants, conformément à la recommandation de l’ANSSI pour un compte protégé par un mot de passe seul.',
  })
  @IsString()
  @MinLength(12, { message: 'Le mot de passe doit comporter au moins 12 caractères.' })
  // Upper bound because the hash function is deliberately slow: without it, a megabyte
  // password turns sign-up into a denial of service against our own CPU.
  @MaxLength(128)
  password!: string;

  @ApiProperty({ example: 'Camille' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @ApiProperty({ example: 'Rousseau' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName!: string;

  @ApiProperty({
    enum: GENDER_VALUES,
    description:
      'Requis, car le sujet demande des statistiques « en termes de sexe ». `UNDISCLOSED` reste disponible pour qui refuse de répondre.',
  })
  @IsIn(GENDER_VALUES)
  gender!: Gender;

  @ApiProperty({
    example: '1991-04-12',
    description: 'Format AAAA-MM-JJ. L’API vérifie la majorité : le règlement réserve le jeu aux majeurs.',
  })
  @IsISO8601({ strict: true }, { message: 'La date de naissance doit être au format AAAA-MM-JJ.' })
  birthDate!: string;

  @ApiPropertyOptional({ example: '06000' })
  @IsOptional()
  @Matches(/^\d{5}$/, { message: 'Le code postal doit comporter 5 chiffres.' })
  postalCode?: string;

  @ApiPropertyOptional({ example: '06 12 34 56 78' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Acceptation du règlement du jeu. Obligatoirement `true`.',
  })
  @IsBoolean()
  @Equals(true, { message: 'L’acceptation du règlement du jeu est obligatoire.' })
  acceptContestRules!: boolean;

  @ApiProperty({ description: 'Acceptation des conditions générales. Obligatoirement `true`.' })
  @IsBoolean()
  @Equals(true, { message: 'L’acceptation des conditions générales est obligatoire.' })
  acceptTerms!: boolean;

  @ApiProperty({
    description:
      'Consentement commercial, strictement facultatif. Lui seul alimente la base emailing exportable par l’administrateur.',
  })
  @IsBoolean()
  marketingConsent!: boolean;
}
