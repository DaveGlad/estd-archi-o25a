import { describe, expect, it } from 'vitest';

import { ageAt, toDateOnlyOrNull, toIso, toIsoOrNull, toNumberOrNull } from './mapping';

describe('date mapping', () => {
  it('serialises a Date to ISO 8601', () => {
    expect(toIso(new Date('2026-11-11T07:30:00.000Z'))).toBe('2026-11-11T07:30:00.000Z');
  });

  it('passes null and undefined through', () => {
    expect(toIsoOrNull(null)).toBeNull();
    expect(toIsoOrNull(undefined)).toBeNull();
  });

  it('truncates a date-only column to YYYY-MM-DD', () => {
    // `birthDate` is `@db.Date`: the time part is an artefact of the driver, not data, and
    // sending it to the front end invites a timezone bug in the age bracket.
    expect(toDateOnlyOrNull(new Date('1991-04-12T00:00:00.000Z'))).toBe('1991-04-12');
  });
});

describe('decimal mapping', () => {
  it('converts a Prisma Decimal to a number', () => {
    // Prisma returns `Decimal` for `@db.Decimal` columns, which serialises to a STRING in
    // JSON. The charts compare and sum these, so they have to cross the wire as numbers.
    const decimal = { toNumber: () => 60 };
    expect(toNumberOrNull(decimal)).toBe(60);
  });

  it('leaves a plain number alone', () => {
    expect(toNumberOrNull(20)).toBe(20);
  });

  it('preserves null, which means "not applicable" rather than zero', () => {
    // The grand prize has no target percentage. Zero would read as "0 % of the codes",
    // which is a different and wrong statement.
    expect(toNumberOrNull(null)).toBeNull();
    expect(toNumberOrNull(undefined)).toBeNull();
  });
});

/**
 * Age in whole years.
 *
 * Feeds two things that have to agree: the age brackets of the administrator dashboard,
 * and the adulthood check at sign-up. An off-by-one here either misfiles a winner or lets
 * a 17-year-old register the day before their birthday.
 */
describe('age computation', () => {
  const birth = new Date('2008-06-15T00:00:00.000Z');

  it('counts a completed year', () => {
    expect(ageAt(birth, new Date('2026-06-15T00:00:00.000Z'))).toBe(18);
  });

  it('does not count the year on the day before the birthday', () => {
    expect(ageAt(birth, new Date('2026-06-14T23:59:59.000Z'))).toBe(17);
  });

  it('counts it from the birthday onwards', () => {
    expect(ageAt(birth, new Date('2026-06-16T00:00:00.000Z'))).toBe(18);
  });

  it('handles a birthday later in the year', () => {
    expect(ageAt(new Date('2008-12-31T00:00:00.000Z'), new Date('2026-06-15T00:00:00.000Z'))).toBe(17);
  });

  it('handles a birthday earlier in the year', () => {
    expect(ageAt(new Date('2008-01-01T00:00:00.000Z'), new Date('2026-06-15T00:00:00.000Z'))).toBe(18);
  });

  it('handles a 29 February birth date in a non-leap year', () => {
    // Born on a leap day; on 28 February of a non-leap year the birthday has not occurred.
    const leapling = new Date('2008-02-29T00:00:00.000Z');
    expect(ageAt(leapling, new Date('2026-02-28T00:00:00.000Z'))).toBe(17);
    expect(ageAt(leapling, new Date('2026-03-01T00:00:00.000Z'))).toBe(18);
  });

  it('returns 0 on the day of birth', () => {
    expect(ageAt(birth, new Date('2008-06-15T12:00:00.000Z'))).toBe(0);
  });
});
