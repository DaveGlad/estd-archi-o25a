import { Injectable } from '@nestjs/common';
import { AGE_RANGES, type AgeRange, type Gender, type StatsDto } from '@theetiptop-contest/shared';

import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { RedisService } from '../../infra/redis/redis.service.js';
import { CatalogueService } from '../catalogue/catalogue.service.js';

/** Row shapes of the raw aggregation queries. */
interface PrizeRow {
  prizeId: string;
  prizeLabel: string;
  won: number;
  redeemed: number;
}
interface GenderRow {
  gender: Gender;
  count: number;
}
interface AgeRow {
  range: AgeRange;
  count: number;
}
interface StoreRow {
  storeId: string;
  storeName: string;
  codesUsed: number;
}
interface DailyRow {
  day: string;
  count: number;
}

/**
 * Administrator dashboard. Requirement 6 of the brief, word for word:
 *
 *   "number of tickets supplied, number of tickets used, number of prizes already won,
 *    statistics on winners in terms of gender, age, etc."
 *
 * Most of the aggregations are written as raw SQL rather than through the Prisma query
 * builder. Three of them cannot be expressed by it at all — bucketing an age computed from
 * a birth date, a zero-filled daily series, and a conditional count — and the others are
 * written the same way so the whole dashboard is one consistent set of queries rather than
 * a mix a reader has to switch between.
 *
 * All of it behind a Redis cache. A dozen aggregations over 500,000 codes on every page
 * load is exactly the avoidable cost the eco-design commitment of the specification is
 * about, and a dashboard an administrator opens a few times a day does not need
 * second-by-second figures.
 */
@Injectable()
export class StatsService {
  /**
   * Two minutes.
   *
   * Short enough that an administrator who hands over a prize and refreshes sees it;
   * long enough to absorb a page that is reloaded while being read. The cache is also
   * invalidated outright on the two events that move the figures — a new participation and
   * a prize handover — so the TTL is a backstop rather than the mechanism.
   */
  private static readonly CACHE_TTL_SECONDS = 120;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly catalogue: CatalogueService
  ) {}

  async getDashboard(): Promise<StatsDto> {
    const contest = await this.catalogue.getCurrentContestEntity();

    return this.redis.getOrSet(
      `stats:dashboard:${contest.id}`,
      StatsService.CACHE_TTL_SECONDS,
      () => this.computeDashboard(contest.id, contest.startsAt, contest.endsAt)
    );
  }

  private async computeDashboard(contestId: string, startsAt: Date, endsAt: Date): Promise<StatsDto> {
    // Run concurrently: they are independent reads, and the dashboard's latency is the
    // slowest of them rather than their sum.
    const [
      codesIssued,
      codesDispensed,
      codesUsed,
      participants,
      prizesRedeemed,
      prizesExpired,
      marketingOptIn,
      byPrize,
      byGender,
      byAgeRange,
      byStore,
      dailyParticipations,
    ] = await Promise.all([
      this.prisma.ticketCode.count({ where: { contestId } }),

      // Dispensed means "handed to a customer at some point", which stays true once the
      // code is played. Counting `status = 'DISPENSED'` would make the figure fall as
      // customers play, which is not what "tickets supplied" means.
      this.prisma.ticketCode.count({ where: { contestId, dispensedAt: { not: null } } }),

      this.prisma.ticketCode.count({ where: { contestId, status: 'USED' } }),

      // Distinct participants, not participations. This is also the pool the grand prize
      // is drawn from, and the brief is explicit that the number of entries a customer
      // holds does not increase their chances.
      this.prisma.participation
        .findMany({ select: { userId: true }, distinct: ['userId'] })
        .then((rows) => rows.length),

      this.prisma.participation.count({ where: { prizeStatus: 'REDEEMED' } }),
      this.prisma.participation.count({ where: { prizeStatus: 'EXPIRED' } }),

      this.prisma.user.count({
        where: { marketingConsent: true, role: 'CUSTOMER', anonymizedAt: null },
      }),

      this.aggregateByPrize(contestId),
      this.aggregateByGender(),
      this.aggregateByAgeRange(),
      this.aggregateByStore(),
      this.aggregateDaily(startsAt, endsAt),
    ]);

    return {
      codesIssued,
      codesDispensed,
      codesUsed,
      participants,
      prizesRedeemed,
      prizesExpired,
      marketingOptIn,
      byPrize,
      byGender,
      byAgeRange,
      byStore,
      dailyParticipations,
      computedAt: new Date().toISOString(),
    };
  }

  /**
   * Prizes won and handed over, per prize.
   *
   * `COUNT(...) FILTER (WHERE ...)` rather than two queries or a sum of CASE: one pass
   * over the join, and the intent reads directly. Every count is cast to `int` because
   * PostgreSQL returns `bigint` for COUNT, which Prisma surfaces as a JavaScript `BigInt`
   * that `JSON.stringify` then refuses to serialise.
   */
  private aggregateByPrize(contestId: string): Promise<PrizeRow[]> {
    return this.prisma.$queryRaw<PrizeRow[]>`
      SELECT
        pr."id"    AS "prizeId",
        pr."label" AS "prizeLabel",
        (COUNT(pa."id"))::int AS "won",
        (COUNT(pa."id") FILTER (WHERE pa."prizeStatus" = 'REDEEMED'))::int AS "redeemed"
      FROM "Prize" pr
      LEFT JOIN "TicketCode" tc ON tc."prizeId" = pr."id"
      LEFT JOIN "Participation" pa ON pa."ticketCodeId" = tc."id"
      WHERE pr."contestId" = ${contestId}
        AND pr."type" = 'TICKET_PRIZE'
      GROUP BY pr."id", pr."label", pr."rank"
      ORDER BY pr."rank" ASC
    `;
  }

  /** Winners by gender. Counted on distinct participants, so playing ten codes counts once. */
  private aggregateByGender(): Promise<GenderRow[]> {
    return this.prisma.$queryRaw<GenderRow[]>`
      SELECT u."gender" AS "gender", (COUNT(DISTINCT u."id"))::int AS "count"
      FROM "User" u
      INNER JOIN "Participation" p ON p."userId" = u."id"
      GROUP BY u."gender"
      ORDER BY "count" DESC
    `;
  }

  /**
   * Winners by age bracket.
   *
   * The age is computed from the birth date at query time, never stored: a stored age is
   * wrong within a year, and GDPR minimisation argues for keeping the one fact that stays
   * true. Customers with no birth date — the OAuth path, where no provider supplies one —
   * are excluded rather than bucketed, because inventing a bracket for them would skew the
   * very statistic the brief asks for.
   *
   * The bracket boundaries are declared once in `AGE_RANGE_BOUNDS` on the shared package;
   * the CASE below mirrors them, and the Vitest integration test asserts the two agree.
   */
  private async aggregateByAgeRange(): Promise<AgeRow[]> {
    const rows = await this.prisma.$queryRaw<AgeRow[]>`
      SELECT
        CASE
          WHEN "ageYears" BETWEEN 18 AND 24 THEN '18-24'
          WHEN "ageYears" BETWEEN 25 AND 34 THEN '25-34'
          WHEN "ageYears" BETWEEN 35 AND 44 THEN '35-44'
          WHEN "ageYears" BETWEEN 45 AND 54 THEN '45-54'
          WHEN "ageYears" BETWEEN 55 AND 64 THEN '55-64'
          WHEN "ageYears" >= 65 THEN '65+'
          ELSE NULL
        END AS "range",
        (COUNT(*))::int AS "count"
      FROM (
        SELECT DISTINCT u."id", (date_part('year', age(u."birthDate")))::int AS "ageYears"
        FROM "User" u
        INNER JOIN "Participation" p ON p."userId" = u."id"
        WHERE u."birthDate" IS NOT NULL
      ) AS aged
      GROUP BY 1
      HAVING
        CASE
          WHEN "ageYears" BETWEEN 18 AND 24 THEN '18-24'
          WHEN "ageYears" BETWEEN 25 AND 34 THEN '25-34'
          WHEN "ageYears" BETWEEN 35 AND 44 THEN '35-44'
          WHEN "ageYears" BETWEEN 45 AND 54 THEN '45-54'
          WHEN "ageYears" BETWEEN 55 AND 64 THEN '55-64'
          WHEN "ageYears" >= 65 THEN '65+'
          ELSE NULL
        END IS NOT NULL
    `;

    // Returned in the canonical bracket order with the empty brackets at zero: a bar chart
    // with a missing category reads as a different chart, not as a zero.
    const byRange = new Map(rows.map((row) => [row.range, row.count]));
    return AGE_RANGES.map((range) => ({ range, count: byRange.get(range) ?? 0 }));
  }

  /**
   * Codes played, per store.
   *
   * Only computable because `TicketCode` records which store dispensed it — the field
   * added alongside the till endpoints. A `LEFT JOIN` so a store that has sold nothing
   * still appears at zero rather than vanishing from the chart.
   */
  private aggregateByStore(): Promise<StoreRow[]> {
    return this.prisma.$queryRaw<StoreRow[]>`
      SELECT
        s."id"   AS "storeId",
        s."name" AS "storeName",
        (COUNT(tc."id") FILTER (WHERE tc."status" = 'USED'))::int AS "codesUsed"
      FROM "Store" s
      LEFT JOIN "TicketCode" tc ON tc."storeId" = s."id"
      WHERE s."active" = true
      GROUP BY s."id", s."name"
      ORDER BY "codesUsed" DESC, s."name" ASC
    `;
  }

  /**
   * Participation curve over the contest window.
   *
   * `generate_series` produces every day of the window and the LEFT JOIN fills the counts,
   * so a day with no participation comes back as zero instead of being absent. A line
   * chart that silently skips a day draws a straight segment across it and tells the
   * administrator the opposite of what happened.
   *
   * Capped at the earlier of the closing date and today: plotting empty days into the
   * future would make the curve look like a collapse.
   */
  private aggregateDaily(startsAt: Date, endsAt: Date): Promise<DailyRow[]> {
    return this.prisma.$queryRaw<DailyRow[]>`
      SELECT
        to_char(series."day", 'DD/MM') AS "day",
        (COUNT(p."id"))::int AS "count"
      FROM generate_series(
        date_trunc('day', ${startsAt}::timestamp),
        LEAST(date_trunc('day', ${endsAt}::timestamp), date_trunc('day', now())),
        interval '1 day'
      ) AS series("day")
      LEFT JOIN "Participation" p
        ON date_trunc('day', p."createdAt") = series."day"
      GROUP BY series."day"
      ORDER BY series."day" ASC
    `;
  }
}
