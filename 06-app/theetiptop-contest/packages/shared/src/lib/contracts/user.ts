/** User domain contracts: sign-up, profile, GDPR consents. */

import type { AuthProvider, Gender, Role } from '../enums';

export interface UserDto {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role;
  gender: Gender;
  birthDate: string | null;
  postalCode: string | null;
  marketingConsent: boolean;
  marketingConsentAt: string | null;
  termsAcceptedAt: string | null;
  contestRulesAcceptedAt: string | null;
  createdAt: string;
  /** Set for in-store employees only. */
  storeId: string | null;
  /** Effective sign-up method, derived from the Better Auth account's `providerId`. */
  provider: AuthProvider;
}

/**
 * Sign-up payload for the classic form.
 *
 * `gender` and `birthDate` are required rather than optional: the brief explicitly asks
 * for statistics "in terms of gender, age", which only holds up if the data is collected
 * at sign-up. `UNDISCLOSED` stays available for a customer who declines to answer, which
 * preserves the choice without punching a hole in the statistic.
 */
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  /** `YYYY-MM-DD`. The API checks adulthood: the rules restrict the contest to adults. */
  birthDate: string;
  postalCode?: string;
  phone?: string;
  /** Acceptance of the contest rules. Must be true, otherwise sign-up is refused. */
  acceptContestRules: boolean;
  /** Acceptance of the terms of use. Must be true. */
  acceptTerms: boolean;
  /** Marketing consent, strictly optional: it alone feeds the mailing base. */
  marketingConsent: boolean;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  gender?: Gender;
  birthDate?: string | null;
  postalCode?: string | null;
}

export interface UpdateConsentInput {
  marketingConsent: boolean;
}

/**
 * Payload of the personal data export, GDPR article 20 (right to portability).
 * The shape is deliberately flat and human-readable.
 */
export interface PersonalDataExport {
  exportedAt: string;
  account: UserDto;
  participations: Array<{
    ticketCode: string;
    prizeLabel: string;
    prizeStatus: string;
    playedAt: string;
    claimDeadline: string;
    redeemedAt: string | null;
  }>;
  consents: Array<{ kind: string; granted: boolean; grantedAt: string | null }>;
}
