import type { AuthProvider, UserDto } from '@theetiptop-contest/shared';

import { toDateOnlyOrNull, toIso, toIsoOrNull } from '../../common/mapping.js';
import type { AccountModel, UserModel } from '../../generated/prisma/models.js';

export type UserWithAccounts = UserModel & {
  accounts: Pick<AccountModel, 'providerId'>[];
};

/**
 * Which method the customer actually signed up with.
 *
 * Derived rather than stored: the authoritative fact is the row in `Account`, and a
 * duplicated column on `User` would be one more thing to keep in sync. A customer who
 * linked both a password and Google has two rows; `credential` wins, because that is the
 * one that still works if the provider's application is suspended.
 */
function resolveProvider(accounts: Pick<AccountModel, 'providerId'>[]): AuthProvider {
  const providerIds = accounts.map((account) => account.providerId);

  if (providerIds.includes('credential')) return 'credential';
  if (providerIds.includes('google')) return 'google';
  if (providerIds.includes('facebook')) return 'facebook';

  // A user with no account row at all: only reachable for a seeded record, and
  // `credential` is the honest answer since no provider is involved.
  return 'credential';
}

export function toUserDto(user: UserWithAccounts): UserDto {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    gender: user.gender,
    birthDate: toDateOnlyOrNull(user.birthDate),
    postalCode: user.postalCode,
    marketingConsent: user.marketingConsent,
    marketingConsentAt: toIsoOrNull(user.marketingConsentAt),
    termsAcceptedAt: toIsoOrNull(user.termsAcceptedAt),
    contestRulesAcceptedAt: toIsoOrNull(user.contestRulesAcceptedAt),
    createdAt: toIso(user.createdAt),
    storeId: user.storeId,
    provider: resolveProvider(user.accounts),
    // `anonymizedAt`, `deletedAt` and the password hash are deliberately not exposed.
  };
}

/** Prisma `include` matching `UserWithAccounts`. */
export const USER_INCLUDE = {
  accounts: { select: { providerId: true } },
} as const;
