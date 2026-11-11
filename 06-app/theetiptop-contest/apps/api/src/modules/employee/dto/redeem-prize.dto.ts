import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  REDEMPTION_CHANNEL_VALUES,
  type RedeemPrizeInput,
  type RedemptionChannel,
} from '@theetiptop-contest/shared';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Body of `POST /v1/employee/redemptions`: an employee hands a prize over. */
export class RedeemPrizeDto implements RedeemPrizeInput {
  @ApiProperty({ description: 'Identifiant de la participation dont le lot est remis.' })
  @IsString()
  @MinLength(1)
  participationId!: string;

  @ApiProperty({
    enum: REDEMPTION_CHANNEL_VALUES,
    description: 'Le sujet autorise la réclamation « en boutique ou en ligne ».',
  })
  @IsIn(REDEMPTION_CHANNEL_VALUES)
  channel!: RedemptionChannel;

  @ApiPropertyOptional({
    description:
      'Boutique de remise. Requis pour un canal `IN_STORE` ; déduit de la boutique de rattachement de l’employé si omis. Un employé ne peut pas remettre un lot au nom d’une autre boutique, seul un administrateur le peut.',
  })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiPropertyOptional({ description: 'Note libre, par exemple un lot remis en plusieurs fois.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
