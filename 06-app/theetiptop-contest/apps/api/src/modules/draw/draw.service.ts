import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { BAILIFF_NAME, type DrawDto } from '@theetiptop-contest/shared';

import { AuditService } from '../../common/audit/audit.service.js';
import type { AuthenticatedUser } from '../../common/auth-context.js';
import { ConflictException, DomainException } from '../../common/exceptions/domain.exception.js';
import { toIso } from '../../common/mapping.js';
import { createSeededRandom } from '../../common/seeded-random.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { CatalogueService } from '../catalogue/catalogue.service.js';

/**
 * Grand prize draw: a year of tea, 360 EUR. Task A13 of the backlog.
 *
 * Two constraints from the brief to honour to the letter:
 *
 *   1. "The draws will of course be performed by your application on the server side."
 *      Nothing about this operation is reachable from a browser beyond triggering it, and
 *      the outcome is decided here.
 *
 *   2. "For the grand prize draw, the number of entries a customer has does not increase
 *      their chances of winning."
 *      So the pool is `SELECT DISTINCT userId FROM Participation` — the set of
 *      PARTICIPANTS, not the set of participations. A customer who played forty codes gets
 *      one ticket in this draw, exactly like a customer who played one. Drawing over
 *      participations would be the single easiest way to fail this requirement, and the
 *      difference is one `DISTINCT`.
 *
 * Replayable in front of Maître Arnaud Rick: the seed and the fingerprint of the ordered
 * participant list are both retained.
 */
@Injectable()
export class DrawService {
  private readonly logger = new Logger(DrawService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly catalogue: CatalogueService
  ) {}

  private async toDto(drawId: string): Promise<DrawDto> {
    const draw = await this.prisma.draw.findUniqueOrThrow({
      where: { id: drawId },
      include: {
        winner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return {
      id: draw.id,
      contestId: draw.contestId,
      executedAt: toIso(draw.executedAt),
      participantCount: draw.participantCount,
      seed: draw.seed,
      participantsFingerprint: draw.participantsFingerprint,
      winner: draw.winner
        ? {
            id: draw.winner.id,
            firstName: draw.winner.firstName,
            lastName: draw.winner.lastName,
            email: draw.winner.email,
          }
        : null,
      bailiffName: draw.bailiffName,
    };
  }

  /** The draw, if it has been run. The back office shows the result rather than the button. */
  async getDraw(): Promise<DrawDto | null> {
    const contest = await this.catalogue.getCurrentContestEntity();

    const draw = await this.prisma.draw.findFirst({
      where: { contestId: contest.id },
      orderBy: { executedAt: 'desc' },
    });

    return draw ? this.toDto(draw.id) : null;
  }

  /**
   * Runs the draw. Unique, irreversible, overseen by a bailiff.
   *
   * Refused in three cases, each a distinct `code` so the back office can explain itself:
   *   - `CONTEST_NOT_CLOSED`: the contest rules say the draw happens at closing. Drawing
   *     early would exclude everyone who plays in the remaining days.
   *   - `ALREADY_DRAWN`: a second draw would produce a second winner for one prize.
   *   - `NO_PARTICIPANT`: nothing to draw from.
   */
  async executeDraw(actor: AuthenticatedUser, ip: string | undefined): Promise<DrawDto> {
    const contest = await this.catalogue.getCurrentContestEntity();
    const now = new Date();

    if (now <= contest.endsAt) {
      throw new DomainException(
        'CONTEST_NOT_CLOSED',
        `Le tirage du gros lot n’a lieu qu’à la clôture du jeu, le ${contest.endsAt.toISOString().slice(0, 10)}.`,
        HttpStatus.CONFLICT,
        { endsAt: contest.endsAt.toISOString() }
      );
    }

    const existing = await this.prisma.draw.findFirst({ where: { contestId: contest.id } });
    if (existing) {
      throw new ConflictException(
        'ALREADY_DRAWN',
        'Le tirage du gros lot a déjà été effectué pour ce jeu.',
        { drawId: existing.id, executedAt: existing.executedAt.toISOString() }
      );
    }

    /**
     * The pool: one entry per participant.
     *
     * Ordered by `userId` rather than by participation date, on purpose. The fingerprint
     * below has to be reproducible by the bailiff from a database export, and a
     * chronological order would depend on timestamps that are not part of what is being
     * attested. Sorting on the primary key makes the list canonical.
     */
    const participants = await this.prisma.$queryRaw<Array<{ userId: string }>>`
      SELECT DISTINCT p."userId" AS "userId"
      FROM "Participation" p
      INNER JOIN "TicketCode" tc ON tc."id" = p."ticketCodeId"
      INNER JOIN "User" u ON u."id" = p."userId"
      WHERE tc."contestId" = ${contest.id}
        -- An anonymised account has nobody left to hand a year of tea to, and keeping it
        -- in the pool would mean a draw that can produce no winner.
        AND u."anonymizedAt" IS NULL
      ORDER BY p."userId" ASC
    `;

    if (participants.length === 0) {
      throw new DomainException(
        'NO_PARTICIPANT',
        'Aucun participant : le tirage ne peut pas avoir lieu.',
        HttpStatus.CONFLICT
      );
    }

    const participantIds = participants.map((row) => row.userId);

    // SHA-256 over the canonical list, with a separator so that concatenating two ids
    // cannot produce the same digest as one longer id.
    const fingerprint = createHash('sha256').update(participantIds.join('\n')).digest('hex');

    /**
     * The seed is generated here and STORED in `Draw.seed`, in clear.
     *
     * The opposite of the choice made for the code generation seed, and the difference is
     * the point. The generation seed stays secret because holding it lets you derive
     * 500,000 unplayed codes and the prize behind each. This seed describes an operation
     * that is already over: once the winner is recorded, knowing the seed buys an attacker
     * nothing and buys the bailiff the ability to recompute the draw from the stored
     * participant list and check it lands on the same person.
     */
    const seed = randomBytes(32).toString('hex');
    const random = createSeededRandom(seed);
    const winnerIndex = random.nextBelow(participantIds.length);
    const winnerId = participantIds[winnerIndex];

    const draw = await this.prisma.draw.create({
      data: {
        contestId: contest.id,
        participantCount: participantIds.length,
        seed,
        participantsFingerprint: fingerprint,
        winnerId,
        bailiffName: contest.bailiffName ?? BAILIFF_NAME,
      },
    });

    await this.audit.record({
      userId: actor.id,
      action: 'DRAW_EXECUTED',
      entity: 'Draw',
      entityId: draw.id,
      metadata: {
        participantCount: participantIds.length,
        winnerId,
        participantsFingerprint: fingerprint,
      },
      ip,
    });

    this.logger.log(
      `Grand prize draw ${draw.id}: winner ${winnerId} out of ${participantIds.length} participants`
    );

    return this.toDto(draw.id);
  }

  /**
   * Replays a recorded draw and checks it lands on the same winner.
   *
   * This is what makes "verifiable by the bailiff" a procedure rather than a claim: the
   * stored seed and the stored fingerprint are enough to recompute the result from the
   * current participant list. A mismatch on the fingerprint means the pool changed after
   * the draw; a mismatch on the winner with a matching fingerprint would mean the
   * generator is not the one that was used.
   */
  async verifyDraw(drawId: string): Promise<{
    fingerprintMatches: boolean;
    winnerMatches: boolean;
    recomputedWinnerId: string | null;
  }> {
    const draw = await this.prisma.draw.findUniqueOrThrow({ where: { id: drawId } });

    const participants = await this.prisma.$queryRaw<Array<{ userId: string }>>`
      SELECT DISTINCT p."userId" AS "userId"
      FROM "Participation" p
      INNER JOIN "TicketCode" tc ON tc."id" = p."ticketCodeId"
      INNER JOIN "User" u ON u."id" = p."userId"
      WHERE tc."contestId" = ${draw.contestId}
        AND u."anonymizedAt" IS NULL
      ORDER BY p."userId" ASC
    `;

    const participantIds = participants.map((row) => row.userId);
    const fingerprint = createHash('sha256').update(participantIds.join('\n')).digest('hex');

    const recomputedWinnerId =
      participantIds.length > 0
        ? participantIds[createSeededRandom(draw.seed).nextBelow(participantIds.length)]
        : null;

    return {
      fingerprintMatches: fingerprint === draw.participantsFingerprint,
      winnerMatches: recomputedWinnerId === draw.winnerId,
      recomputedWinnerId,
    };
  }
}
