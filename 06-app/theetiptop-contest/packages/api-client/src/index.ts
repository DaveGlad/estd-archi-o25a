/**
 * Typed client for API v1, shared by the public site and the back office.
 *
 * It has **no default entry point on purpose** — import one of the two subpaths:
 *
 *     import { getContest } from '@theetiptop-contest/api-client/server';
 *     import { signIn }     from '@theetiptop-contest/api-client/auth';
 *
 * The split is a hard boundary, not a convention. `/server` imports `next/headers`, which
 * makes it server-only by construction and keeps the internal Docker API address out of
 * the browser bundle; `/auth` is a `'use client'` module that has to run in the browser
 * because the OAuth flows end on a full-page redirect. A single barrel re-exporting both
 * would drag the server module into any client component that touched it, and Next would
 * fail the build — which is the good outcome, but a build error is a worse way to learn
 * about a boundary than not being able to cross it.
 *
 * Only the error type is re-exported here, since both sides need it.
 */

export { ApiError } from './lib/http';
export type { ApiErrorBody } from './lib/http';
