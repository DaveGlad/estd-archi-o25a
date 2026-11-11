import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DispenseCodeInput, VoidCodeInput } from '@theetiptop-contest/shared';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

/** Body of `POST /v1/pos/codes/dispense`. */
export class DispenseCodeDto implements DispenseCodeInput {
  @ApiProperty({
    enum: ['IN_STORE', 'ONLINE'],
    description:
      '`IN_STORE` pour une caisse de boutique, `ONLINE` pour le futur site e-commerce. Détermine si `storeId` est requis.',
  })
  @IsIn(['IN_STORE', 'ONLINE'])
  channel!: 'IN_STORE' | 'ONLINE';

  @ApiProperty({
    description:
      'Montant du ticket ou de la facture, **en centimes**. Refusé sous le seuil du jeu. En centimes et non en euros : un montant en flottant finit par produire des écarts d’arrondi sur un seuil, et le seuil est une règle du règlement déposé.',
    example: 5490,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  // One million euros: an upper bound that rejects an obvious till keying error rather
  // than recording it as a sale.
  @Max(100_000_000)
  purchaseAmountCents!: number;

  @ApiPropertyOptional({
    description: 'Boutique qui imprime le ticket. Requis quand `channel = IN_STORE`.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  storeId?: string;

  @ApiPropertyOptional({
    description: 'Référence du ticket de caisse ou de la commande, pour le rapprochement comptable.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;
}

/** Body of `POST /v1/pos/codes/void`: receipt cancelled, the code was never handed over. */
export class VoidCodeDto implements VoidCodeInput {
  @ApiProperty({ example: 'A7K2M9QX41' })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  code!: string;

  @ApiProperty({
    description:
      'Motif de l’annulation. Obligatoire : un code neutralisé sans motif est indéfendable devant l’huissier, puisque c’est un ticket gagnant retiré du jeu.',
    example: 'Ticket annulé par le client avant encaissement',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
