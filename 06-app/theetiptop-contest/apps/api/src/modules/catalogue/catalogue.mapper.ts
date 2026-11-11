import type { ContestDto, PrizeDto, StoreDto } from '@theetiptop-contest/shared';

import { toDateOnlyOrNull, toIso, toIsoOrNull, toNumberOrNull } from '../../common/mapping.js';
import type { ContestModel, PrizeModel, StoreModel } from '../../generated/prisma/models.js';

/** The store whose opening is the reason for the contest; the front end highlights it. */
const NEW_STORE_NAME = 'Nice Vieille Ville';

export function toContestDto(contest: ContestModel, now: Date): ContestDto {
  return {
    id: contest.id,
    name: contest.name,
    slug: contest.slug,
    startsAt: toIso(contest.startsAt),
    endsAt: toIso(contest.endsAt),
    claimDeadline: toIso(contest.claimDeadline),
    minimumPurchaseCents: contest.minimumPurchaseCents,
    plannedCodeCount: contest.plannedCodeCount,
    codeLength: contest.codeLength,
    bailiffName: contest.bailiffName,
    rulesUrl: contest.rulesUrl,
    rulesFiledAt: toIsoOrNull(contest.rulesFiledAt),
    // Computed server-side: the browser's clock is the user's, and a client whose clock is
    // a day off would be told the contest is closed when it is not.
    isOpen: now >= contest.startsAt && now <= contest.endsAt,
  };
}

export function toPrizeDto(prize: PrizeModel): PrizeDto {
  return {
    id: prize.id,
    label: prize.label,
    description: prize.description,
    type: prize.type,
    valueCents: prize.valueCents,
    targetPercentage: toNumberOrNull(prize.targetPercentage),
    targetQuantity: prize.targetQuantity,
    rank: prize.rank,
  };
}

export function toStoreDto(store: StoreModel): StoreDto {
  return {
    id: store.id,
    name: store.name,
    address: store.address,
    postalCode: store.postalCode,
    city: store.city,
    phone: store.phone,
    openedAt: toDateOnlyOrNull(store.openedAt),
    isNew: store.name === NEW_STORE_NAME,
  };
}
