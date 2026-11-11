import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  PARTICIPATIONS_DEFAULT_PAGE_SIZE,
  PARTICIPATIONS_MAX_PAGE_SIZE,
  PRIZE_STATUS_VALUES,
  type ListParticipationsQuery,
  type PrizeStatus,
} from '@theetiptop-contest/shared';
import { IsIn, IsInt, IsOptional, IsString, Max, Min, MaxLength } from 'class-validator';

/** Query string of `GET /v1/participations`, the administrator's participant list. */
export class ListParticipationsDto implements ListParticipationsQuery {
  @ApiPropertyOptional({
    description: 'Recherche libre sur le nom, l’adresse électronique, ou un code de ticket exact.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @ApiPropertyOptional({ enum: PRIZE_STATUS_VALUES })
  @IsOptional()
  @IsIn(PRIZE_STATUS_VALUES)
  status?: PrizeStatus;

  @ApiPropertyOptional({ description: 'Filtrer sur un lot précis.' })
  @IsOptional()
  @IsString()
  prizeId?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    default: PARTICIPATIONS_DEFAULT_PAGE_SIZE,
    maximum: PARTICIPATIONS_MAX_PAGE_SIZE,
    description:
      'Plafonné : au-delà, une seule réponse coûte plus cher à produire et à transférer qu’une seconde requête.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(PARTICIPATIONS_MAX_PAGE_SIZE)
  pageSize?: number = PARTICIPATIONS_DEFAULT_PAGE_SIZE;
}
