import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  CODE_PATTERN,
  PARTICIPATIONS_DEFAULT_PAGE_SIZE,
  PLAYABLE_CODE_STATUSES,
  type AdminParticipationDto,
  type AuthProvider,
  type Paginated,
  type ParticipationDto,
  type SubmitCodeResult,
} from '@theetiptop-contest/shared';

import type { AuthenticatedUser } from '../../common/auth-context.js';
import { ForbiddenException, NotFoundException } from '../../common/exceptions/domain.exception.js';
import { APP_CONFIG, type AppConfig } from '../../config/env.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { RedisService } from '../../infra/redis/redis.service.js';
import { CatalogueService } from '../catalogue/catalogue.service.js';
import type { ListParticipationsDto } from './dto/list-participations.dto.js';
import { toPrizeDto } from '../catalogue/catalogue.mapper.js';
import {
  PARTICIPATION_INCLUDE,
  toParticipationDto,
  type ParticipationWithRelations,
} from './participations.mapper.js';

/**
 * Use case UC-01: a customer submits the code printed on their receipt and discovers
 * their prize.
 *
 * The one operation that has to be exactly right. Two properties it must hold:
 *
 *   1. **The prize is read, never drawn.** It was frozen when the 500,000 codes were
 *      generated, which is what makes the 60/20/10/6/4% split a property of the data
 *      rather than of the traffic. See `prisma/generate-codes.ts`.
 *
 *   2. **A code can be played exactly once, by exactly one person.** Enforced by the
 *      database, not by application logic: see the compare-and-swap in `claimCode`.
 */
@Injectable()
export class ParticipationsService {
  private readonly logger = new Logger(ParticipationsService.name);

  /**
   * Rate limiting on code submission — the brute-force protection the brief's security
   * requirement calls for.
   *
   * Two windows, because they stop two different things:
   *
   *   - **per account**: 10 attempts per 10 minutes. A legitimate customer needs one
   *     receipt above 49 EUR per code, so ten submissions in ten minutes is already far
   *     beyond plausible use.
   *
   *   - **per IP**: 40 attempts per hour. The per-account limit alone is defeated by
   *     creating accounts; the per-IP window raises the cost of that.
   *
   * Both are generous on purpose. The code space is 3.6 x 10^15 (see BENCHMARK.md), so
   * brute force is not a realistic threat to begin with — the limiter exists to keep an
   * automated script from consuming the API, not to be the thing standing between an
   * attacker and the prizes. Locking out a real customer would be the worse failure, which
   * is also why the Redis limiter fails open.
   */
  private static readonly USER_LIMIT = 10;
  private static readonly USER_WINDOW_SECONDS = 600;
  private static readonly IP_LIMIT = 40;
  private static readonly IP_WINDOW_SECONDS = 3_600;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly catalogue: CatalogueService,
    @Inject(APP_CONFIG) private readonly config: AppConfig
  ) {}

  /**
   * Hashes a client IP for storage alongside the participation.
   *
   * Salted SHA-256. Without the salt, hashing an IPv4 address is reversible by brute
   * force in seconds — the whole space is 4 billion values, which is nothing. With the
   * salt the hash still supports the one thing it is for (spotting many participations
   * from one source) while holding no address in clear, which is what GDPR minimisation
   * requires.
   */
  private hashIp(ip: string | undefined): string | null {
    if (!ip) return null;
    return createHash('sha256').update(`${this.config.security.ipHashSalt}:${ip}`).digest('hex');
  }

  /**
   * Checks both rate limit windows.
   *
   * Returns the longest wait of the two, so a client told to come back in 12 minutes is
   * not refused again at minute 13 by the other window.
   */
  private async checkRateLimits(userId: string, ip: string | undefined): Promise<number> {
    const checks = [
      this.redis.consumeRateLimit(
        `rl:participation:user:${userId}`,
        ParticipationsService.USER_LIMIT,
        ParticipationsService.USER_WINDOW_SECONDS
      ),
    ];

    if (ip) {
      // The key holds the hashed IP, not the IP: Redis is a datastore like any other and
      // has no more business holding an address in clear than PostgreSQL does.
      checks.push(
        this.redis.consumeRateLimit(
          `rl:participation:ip:${this.hashIp(ip)}`,
          ParticipationsService.IP_LIMIT,
          ParticipationsService.IP_WINDOW_SECONDS
        )
      );
    }

    const verdicts = await Promise.all(checks);
    const blocked = verdicts.filter((verdict) => !verdict.allowed);

    return blocked.length === 0
      ? 0
      : Math.max(...blocked.map((verdict) => verdict.retryAfterSeconds));
  }

  /**
   * Claims the code and creates the participation, atomically.
   *
   * The compare-and-swap is `updateMany ... WHERE status IN (playable)`: PostgreSQL takes
   * a row lock, and only one of two concurrent transactions sees a non-zero count. The
   * loser gets `count === 0` and is told the code is already used.
   *
   * Why not read-then-write: between a `SELECT status` and the `UPDATE`, a second request
   * can pass the same check. A double click, a network retry or a script would then create
   * two participations for one code. The unique constraint on `Participation.ticketCodeId`
   * would catch that second insert, but as a 500 rather than a clean answer — the
   * conditional update turns the race into an ordinary outcome.
   */
  private async claimCode(
    ticketCodeId: string,
    userId: string,
    claimDeadline: Date,
    ipHash: string | null
  ): Promise<ParticipationWithRelations | null> {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.ticketCode.updateMany({
        where: { id: ticketCodeId, status: { in: [...PLAYABLE_CODE_STATUSES] } },
        data: { status: 'USED', usedAt: new Date() },
      });

      if (claimed.count === 0) return null;

      return tx.participation.create({
        data: { userId, ticketCodeId, claimDeadline, ipHash },
        include: PARTICIPATION_INCLUDE,
      });
    });
  }

  /**
   * The six outcomes below are returned with HTTP 200, as a discriminated union. See the
   * rationale on `ParticipationsController.submit`.
   */
  async submitCode(
    user: AuthenticatedUser,
    rawCode: string,
    ip: string | undefined
  ): Promise<SubmitCodeResult> {
    const code = rawCode.trim().toUpperCase();

    // 1. Format. Checked before anything else, so a typo costs neither a Redis round trip
    //    nor a database query.
    if (!CODE_PATTERN.test(code)) return { outcome: 'INVALID_FORMAT' };

    // 2. Rate limit. Before the lookup, since the point is to make attempts expensive.
    const retryAfterSeconds = await this.checkRateLimits(user.id, ip);
    if (retryAfterSeconds > 0) {
      return { outcome: 'RATE_LIMITED', retryInMinutes: Math.max(1, Math.ceil(retryAfterSeconds / 60)) };
    }

    // 3. Is the contest open. A code played after closing is refused even if it is valid:
    //    the contest rules filed with the bailiff set a 30-day window.
    const contest = await this.catalogue.getCurrentContestEntity();
    const now = new Date();
    if (now < contest.startsAt || now > contest.endsAt) {
      return { outcome: 'CONTEST_CLOSED', endsAt: contest.endsAt.toISOString() };
    }

    // 4. Does the code exist. Rides the unique index — 529 µs over 500,000 rows, measured
    //    in BENCHMARK.md.
    const ticketCode = await this.prisma.ticketCode.findUnique({
      where: { code },
      include: { prize: true, participation: { select: { userId: true } } },
    });

    if (!ticketCode || ticketCode.contestId !== contest.id) {
      return { outcome: 'UNKNOWN_CODE' };
    }

    // 5. Already played, or voided. Checked before attempting the claim so the common case
    //    gets a precise answer with the date; the claim below still re-checks, because
    //    between this read and that write a concurrent request may have won.
    if (!PLAYABLE_CODE_STATUSES.includes(ticketCode.status as never)) {
      return {
        outcome: 'ALREADY_USED',
        usedAt: (ticketCode.usedAt ?? ticketCode.createdAt).toISOString(),
        // Lets the front end point the customer at their own account instead of telling
        // them the code belongs to somebody else.
        byCurrentUser: ticketCode.participation?.userId === user.id,
      };
    }

    // 6. Claim it.
    const participation = await this.claimCode(
      ticketCode.id,
      user.id,
      contest.claimDeadline,
      this.hashIp(ip)
    );

    if (!participation) {
      // Lost the race against a concurrent submission of the same code.
      return {
        outcome: 'ALREADY_USED',
        usedAt: new Date().toISOString(),
        byCurrentUser: false,
      };
    }

    // The dashboard aggregates just became stale.
    await this.redis.invalidate('stats:*');

    this.logger.log(`Participation ${participation.id} created for user ${user.id}`);

    return {
      outcome: 'WON',
      participation: toParticipationDto(participation),
      prize: toPrizeDto(participation.ticketCode.prize),
    };
  }

  /** "My prizes", newest first. Requirement 5 of the brief. */
  async listMine(userId: string): Promise<ParticipationDto[]> {
    const participations = await this.prisma.participation.findMany({
      where: { userId },
      include: PARTICIPATION_INCLUDE,
      // Rides the `(userId, createdAt)` index: no sort step in the plan.
      orderBy: { createdAt: 'desc' },
    });

    return participations.map(toParticipationDto);
  }

  /**
   * One participation, for the prize detail screen.
   *
   * Ownership is checked rather than assumed: the id is a cuid and therefore unguessable,
   * but "hard to guess" is not an authorisation rule. An employee or an administrator may
   * read any participation — the employee has to, in order to hand the prize over.
   */
  async getOne(viewer: AuthenticatedUser, participationId: string): Promise<ParticipationDto> {
    const participation = await this.prisma.participation.findUnique({
      where: { id: participationId },
      include: PARTICIPATION_INCLUDE,
    });

    if (!participation) throw new NotFoundException('Participation', participationId);

    const isOwner = participation.userId === viewer.id;
    const isStaff = viewer.role === 'EMPLOYEE' || viewer.role === 'ADMIN';

    if (!isOwner && !isStaff) throw new ForbiddenException('This prize belongs to another customer');

    return toParticipationDto(participation);
  }

  /**
   * Administrator's participant list. Paginated, filterable.
   *
   * Paginated because it is the only collection in the system with no natural ceiling:
   * 500,000 codes means up to 500,000 participations, and an endpoint that returns them
   * all is one that eventually times out on the screen an administrator uses most.
   *
   * The free-text search covers the customer's name and email, plus an exact ticket code —
   * the three things an administrator has in front of them when somebody calls about a
   * prize. The name and email halves ride the same `pg_trgm` indexes the in-store employee
   * search uses.
   */
  async listForAdmin(query: ListParticipationsDto): Promise<Paginated<AdminParticipationDto>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = query.pageSize ?? PARTICIPATIONS_DEFAULT_PAGE_SIZE;

    const search = query.q?.trim();
    const isExactCode = search !== undefined && CODE_PATTERN.test(search.toUpperCase());

    const where = {
      ...(query.status ? { prizeStatus: query.status } : {}),
      ...(query.prizeId ? { ticketCode: { prizeId: query.prizeId } } : {}),
      ...(search && search.length >= 2
        ? {
            OR: [
              // An exact code is the unambiguous case and rides the unique index.
              ...(isExactCode ? [{ ticketCode: { code: search.toUpperCase() } }] : []),
              { user: { firstName: { contains: search, mode: 'insensitive' as const } } },
              { user: { lastName: { contains: search, mode: 'insensitive' as const } } },
              { user: { email: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    // Count and page fetched concurrently: the total is needed for the pager and is an
    // independent query, so waiting for one before starting the other doubles the latency.
    const [total, rows] = await Promise.all([
      this.prisma.participation.count({ where }),
      this.prisma.participation.findMany({
        where,
        include: {
          ticketCode: { include: { prize: { select: { id: true, label: true } } } },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              accounts: { select: { providerId: true } },
            },
          },
          redemption: { select: { issuedAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        ticketCode: row.ticketCode.code,
        prizeId: row.ticketCode.prize.id,
        prizeLabel: row.ticketCode.prize.label,
        prizeStatus: row.prizeStatus,
        claimDeadline: row.claimDeadline.toISOString(),
        createdAt: row.createdAt.toISOString(),
        redeemedAt: row.redemption?.issuedAt.toISOString() ?? null,
        customer: {
          id: row.user.id,
          firstName: row.user.firstName,
          lastName: row.user.lastName,
          email: row.user.email,
          provider: resolveProvider(row.user.accounts),
        },
      })),
      total,
      page,
      pageSize,
    };
  }
}

/**
 * Which sign-up method the customer used, derived from their account rows.
 *
 * Mirrors the helper in the users mapper. Duplicated rather than shared because the two
 * read different query shapes, and threading a common type through both would couple the
 * administrator list to the account module for four lines.
 */
function resolveProvider(accounts: Array<{ providerId: string }>): AuthProvider {
  const ids = accounts.map((account) => account.providerId);
  if (ids.includes('credential')) return 'credential';
  if (ids.includes('google')) return 'google';
  if (ids.includes('facebook')) return 'facebook';
  return 'credential';
}
