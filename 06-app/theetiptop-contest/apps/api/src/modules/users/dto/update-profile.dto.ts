import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  GENDER_VALUES,
  type Gender,
  type UpdateConsentInput,
  type UpdateProfileInput,
} from '@theetiptop-contest/shared';
import {
  IsBoolean,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Editable profile fields.
 *
 * Notably absent: `email`, `role` and `storeId`. Changing an email is an identity change
 * that belongs to Better Auth's own verified flow; `role` and `storeId` are privileges,
 * and an endpoint a customer can call must not be able to grant them.
 *
 * `null` is meaningful on the nullable fields: it clears the value, which is how a
 * customer withdraws an optional piece of data without deleting their account — a GDPR
 * data-minimisation right in practice.
 */
export class UpdateProfileDto implements UpdateProfileInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @ApiPropertyOptional({ enum: GENDER_VALUES })
  @IsOptional()
  @IsIn(GENDER_VALUES)
  gender?: Gender;

  @ApiPropertyOptional({ nullable: true, example: '1991-04-12' })
  @IsOptional()
  @IsISO8601({ strict: true })
  birthDate?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '06000' })
  @IsOptional()
  @Matches(/^\d{5}$/)
  postalCode?: string | null;
}

/**
 * Marketing consent, on its own endpoint.
 *
 * Separate from the profile on purpose: withdrawal must be as easy as consent (GDPR
 * article 7.3), and burying it in a form that also asks for a first name is not that. It
 * is also the only field whose change the server timestamps.
 */
export class UpdateConsentDto implements UpdateConsentInput {
  @ApiPropertyOptional({
    description:
      '`true` ajoute le client à la base emailing opt-in, `false` l’en retire et efface l’horodatage du consentement.',
  })
  @IsBoolean()
  marketingConsent!: boolean;
}
