import type { Role } from '@theetiptop-contest/shared';
import type { Request } from 'express';

/**
 * The caller, as resolved once per request by `SessionGuard`.
 *
 * Only what the authorisation rules and the audit log actually need. Deliberately not the
 * full user row: a guard that hands downstream code the whole record invites services to
 * read stale data off the request instead of querying it.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  /** Set for EMPLOYEE only; the store they may hand prizes out at. */
  storeId: string | null;
}

/**
 * A non-browser consumer of API v1 authenticated by key: a till, or the future
 * e-commerce site. Carries the consumer name so every dispensed code is attributable.
 */
export interface ApiKeyConsumer {
  name: string;
}

/**
 * Request augmented by the guards.
 *
 * An interface rather than a global `declare module 'express'` augmentation: the fields
 * only exist on routes that went through the guards, and an interface makes that visible
 * at the call site instead of pretending every Express request has a user.
 */
export interface AuthenticatedRequest extends Request {
  authUser?: AuthenticatedUser;
  apiKeyConsumer?: ApiKeyConsumer;
}
