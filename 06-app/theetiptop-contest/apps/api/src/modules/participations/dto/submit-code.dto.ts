import { ApiProperty } from '@nestjs/swagger';
import type { SubmitCodeInput } from '@theetiptop-contest/shared';
import { IsString, MaxLength } from 'class-validator';

/**
 * Body of `POST /v1/participations`.
 *
 * Validation here is deliberately loose: it only rejects what is not a plausible string
 * at all. The 10-character check is NOT done by the pipe, because a malformed code is a
 * business outcome of use case UC-01 (`{ outcome: 'INVALID_FORMAT' }`) and not a protocol
 * error. Letting the pipe answer 400 would force the front end to parse error bodies back
 * into the result union — see the comment on `ParticipationsController.submit`.
 *
 * `MaxLength(32)` is the one hard guard: it stops a megabyte of text being normalised and
 * regex-tested before being rejected.
 */
export class SubmitCodeDto implements SubmitCodeInput {
  @ApiProperty({
    description:
      'Le code imprimé sur le ticket de caisse : 10 caractères alphanumériques. La casse et les espaces de bordure sont normalisés par l’API.',
    example: 'A7K2M9QX41',
    maxLength: 32,
  })
  @IsString()
  @MaxLength(32)
  code!: string;
}
