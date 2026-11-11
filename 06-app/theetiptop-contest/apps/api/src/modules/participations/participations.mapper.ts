import type { ParticipationDto, RedemptionDto } from '@theetiptop-contest/shared';

import { toIso } from '../../common/mapping.js';
import { toPrizeDto } from '../catalogue/catalogue.mapper.js';
import type {
  ParticipationModel,
  PrizeModel,
  PrizeRedemptionModel,
  StoreModel,
  TicketCodeModel,
  UserModel,
} from '../../generated/prisma/models.js';

/**
 * Shape the service queries. Spelled out rather than inferred from the Prisma call so the
 * mapper cannot silently start depending on a relation a caller forgot to include —
 * which is how a `Cannot read properties of undefined` reaches production.
 */
export type ParticipationWithRelations = ParticipationModel & {
  ticketCode: TicketCodeModel & { prize: PrizeModel };
  redemption:
    | (PrizeRedemptionModel & {
        issuedBy: Pick<UserModel, 'firstName' | 'lastName'>;
        store: Pick<StoreModel, 'id' | 'name'> | null;
      })
    | null;
};

function toRedemptionDto(
  redemption: NonNullable<ParticipationWithRelations['redemption']>
): RedemptionDto {
  return {
    id: redemption.id,
    issuedByName: `${redemption.issuedBy.firstName} ${redemption.issuedBy.lastName}`,
    storeId: redemption.store?.id ?? null,
    storeName: redemption.store?.name ?? null,
    channel: redemption.channel,
    issuedAt: toIso(redemption.issuedAt),
  };
}

export function toParticipationDto(participation: ParticipationWithRelations): ParticipationDto {
  return {
    id: participation.id,
    userId: participation.userId,
    ticketCode: participation.ticketCode.code,
    prize: toPrizeDto(participation.ticketCode.prize),
    prizeStatus: participation.prizeStatus,
    claimDeadline: toIso(participation.claimDeadline),
    createdAt: toIso(participation.createdAt),
    redemption: participation.redemption ? toRedemptionDto(participation.redemption) : null,
    // `ipHash` is deliberately absent: it is an anti-fraud signal, not data the customer
    // asked for, and GDPR minimisation says it has no business leaving the server.
  };
}

/** Prisma `include` clause matching `ParticipationWithRelations`, so the two cannot drift. */
export const PARTICIPATION_INCLUDE = {
  ticketCode: { include: { prize: true } },
  redemption: {
    include: {
      issuedBy: { select: { firstName: true, lastName: true } },
      store: { select: { id: true, name: true } },
    },
  },
} as const;
