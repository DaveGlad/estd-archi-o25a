/**
 * Helpers shared by the module mappers.
 *
 * Every module converts Prisma rows into the DTOs declared in
 * `@theetiptop-contest/shared` rather than returning rows directly. Three reasons:
 *   - a Prisma row carries columns no client should see (`password` on an account, the
 *     hashed IP on a participation, `anonymizedAt` on a user);
 *   - `Date` and `Decimal` do not survive JSON serialisation in a shape the front ends
 *     can rely on, so the conversion has to happen somewhere explicit;
 *   - a shared DTO is the contract the compiler checks across the API, the public site and
 *     the back office. Leaking rows would make a schema change a silent break.
 */

/** Prisma's Decimal, duck-typed so this file stays free of a Prisma import. */
interface DecimalLike {
  toNumber(): number;
}

export function toIso(value: Date): string {
  return value.toISOString();
}

export function toIsoOrNull(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

/** `YYYY-MM-DD`, for a column declared `@db.Date` where the time part is meaningless. */
export function toDateOnlyOrNull(value: Date | null | undefined): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

/**
 * Prisma returns `Decimal` for `@db.Decimal` columns, which serialises to a string in
 * JSON. The percentages are used in charts and comparisons, so they cross the wire as
 * numbers.
 */
export function toNumberOrNull(value: DecimalLike | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'number' ? value : value.toNumber();
}

/**
 * Age in whole years at a given instant.
 *
 * Computed from the birth date on every read rather than stored: a stored age is wrong
 * within a year, and GDPR minimisation argues for keeping the one fact that is true
 * (the birth date) rather than a derived one that rots.
 */
export function ageAt(birthDate: Date, instant: Date): number {
  let age = instant.getUTCFullYear() - birthDate.getUTCFullYear();

  const monthDelta = instant.getUTCMonth() - birthDate.getUTCMonth();
  const beforeBirthday =
    monthDelta < 0 || (monthDelta === 0 && instant.getUTCDate() < birthDate.getUTCDate());

  if (beforeBirthday) age -= 1;

  return age;
}
