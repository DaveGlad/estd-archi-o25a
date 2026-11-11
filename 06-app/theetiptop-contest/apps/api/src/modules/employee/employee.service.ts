import { Injectable, Logger } from '@nestjs/common';
import { CODE_PATTERN, type CustomerSearchResultDto, type ParticipationDto } from '@theetiptop-contest/shared';

import { AuditService } from '../../common/audit/audit.service.js';
import type { AuthenticatedUser } from '../../common/auth-context.js';
import {
  ConflictException,
  DomainException,
  ForbiddenException,
  NotFoundException,
} from '../../common/exceptions/domain.exception.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { RedisService } from '../../infra/redis/redis.service.js';
import { PARTICIPATION_INCLUDE, toParticipationDto } from '../participations/participations.mapper.js';
import type { RedeemPrizeDto } from './dto/redeem-prize.dto.js';

/**
 * Requirement 7 of the brief: "allow in-store employees to view a customer's prizes in
 * order to hand them over and mark the prize as redeemed".
 */
@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  /** Two characters minimum, so an empty or one-letter query does not match the whole base. */
  private static readonly MIN_QUERY_LENGTH = 2;

  /** The employee has one customer in front of them; a longer list is noise, not help. */
  private static readonly MAX_RESULTS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly audit: AuditService
  ) {}

  /**
   * Finds customers by email fragment, name fragment, or exact ticket code.
   *
   * Written as raw SQL rather than through the Prisma query builder, deliberately. The
   * search has to be an unanchored substring match — the employee types a fragment of what
   * the customer tells them — and that is only indexable through the `pg_trgm` GIN indexes
   * added in `20261111070019_add_trgm_customer_search_indexes`. Those indexes are built on
   * `lower(email)` and on `lower(firstName || ' ' || lastName)`; Prisma's
   * `mode: 'insensitive'` emits `ILIKE "email"`, which does not match an index on an
   * expression and would fall back to a sequential scan over the whole table.
   *
   * Parameterised with `$queryRaw` tagged-template interpolation, so the fragment is bound
   * rather than concatenated: no SQL injection surface.
   */
  private async findCustomerIds(rawQuery: string): Promise<string[]> {
    const query = rawQuery.trim();
    if (query.length < EmployeeService.MIN_QUERY_LENGTH) return [];

    // An exact ticket code is the unambiguous case: the customer hands over the receipt.
    // Resolved through the unique index instead of the trigram search.
    if (CODE_PATTERN.test(query.toUpperCase())) {
      const participation = await this.prisma.participation.findFirst({
        where: { ticketCode: { code: query.toUpperCase() } },
        select: { userId: true },
      });
      return participation ? [participation.userId] : [];
    }

    const pattern = `%${query.toLowerCase()}%`;

    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "User"
      WHERE "role" = 'CUSTOMER'
        AND "anonymizedAt" IS NULL
        AND (
          lower("email") LIKE ${pattern}
          OR lower("firstName" || ' ' || "lastName") LIKE ${pattern}
        )
      ORDER BY "createdAt" DESC
      LIMIT ${EmployeeService.MAX_RESULTS}
    `;

    return rows.map((row) => row.id);
  }

  /**
   * Customer search for the in-store screen.
   *
   * Anonymised accounts are excluded: there is nobody left to hand a prize to, and
   * surfacing them would expose that an account was erased.
   */
  async searchCustomers(query: string): Promise<CustomerSearchResultDto[]> {
    const ids = await this.findCustomerIds(query);
    if (ids.length === 0) return [];

    const customers = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      include: { participations: { include: PARTICIPATION_INCLUDE, orderBy: { createdAt: 'desc' } } },
    });

    // Re-ordered to the ranking the search returned: `findMany ... IN (...)` makes no
    // ordering guarantee, and the search already decided what is most relevant.
    const byId = new Map(customers.map((customer) => [customer.id, customer]));

    return ids
      .map((id) => byId.get(id))
      .filter((customer): customer is NonNullable<typeof customer> => customer !== undefined)
      .map((customer) => ({
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        prizesToClaim: customer.participations.filter(
          (participation) => participation.prizeStatus === 'TO_CLAIM'
        ).length,
        participations: customer.participations.map(toParticipationDto),
      }));
  }

  /** One customer's file, for the prize handover screen. */
  async getCustomer(customerId: string): Promise<CustomerSearchResultDto> {
    const customer = await this.prisma.user.findFirst({
      where: { id: customerId, role: 'CUSTOMER' },
      include: { participations: { include: PARTICIPATION_INCLUDE, orderBy: { createdAt: 'desc' } } },
    });

    if (!customer) throw new NotFoundException('Customer', customerId);

    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      prizesToClaim: customer.participations.filter(
        (participation) => participation.prizeStatus === 'TO_CLAIM'
      ).length,
      participations: customer.participations.map(toParticipationDto),
    };
  }

  /**
   * Resolves which store the handover is recorded against.
   *
   * An EMPLOYEE is pinned to their own store: letting them record a handover at another
   * branch would make the per-store figures meaningless and remove the traceability the
   * whole point of the record is to provide. An ADMIN may name any store, because an
   * administrator settling a dispute has to be able to record what actually happened.
   */
  private async resolveStoreId(actor: AuthenticatedUser, requested: string | undefined): Promise<string | null> {
    if (actor.role === 'ADMIN') {
      if (!requested) return null;
      const store = await this.prisma.store.findUnique({ where: { id: requested }, select: { id: true } });
      if (!store) throw new NotFoundException('Store', requested);
      return store.id;
    }

    if (!actor.storeId) {
      throw new DomainException(
        'EMPLOYEE_WITHOUT_STORE',
        'Votre compte employé n’est rattaché à aucune boutique. Contactez un administrateur.'
      );
    }

    if (requested && requested !== actor.storeId) {
      throw new ForbiddenException(
        'Vous ne pouvez enregistrer une remise que pour votre propre boutique.'
      );
    }

    return actor.storeId;
  }

  /**
   * Marks a prize as handed over.
   *
   * The compare-and-swap is the same pattern as playing a code: `updateMany ... WHERE
   * prizeStatus = 'TO_CLAIM'`. Two employees scanning the same customer at two tills, or
   * one employee double-clicking, both end up with one of the two transactions seeing
   * `count === 0` and getting a clean conflict instead of two handovers of one prize.
   *
   * The unique constraint on `PrizeRedemption.participationId` is the second line of
   * defence, and the one that holds regardless of application logic.
   */
  async redeemPrize(actor: AuthenticatedUser, input: RedeemPrizeDto, ip: string | undefined): Promise<ParticipationDto> {
    const participation = await this.prisma.participation.findUnique({
      where: { id: input.participationId },
      include: { redemption: { select: { id: true } } },
    });

    if (!participation) throw new NotFoundException('Participation', input.participationId);

    if (participation.prizeStatus === 'REDEEMED' || participation.redemption) {
      throw new ConflictException('ALREADY_REDEEMED', 'Ce lot a déjà été remis au client.');
    }

    if (participation.prizeStatus === 'EXPIRED') {
      throw new ConflictException(
        'CLAIM_WINDOW_CLOSED',
        'Le délai de réclamation de ce lot est dépassé.',
        { claimDeadline: participation.claimDeadline.toISOString() }
      );
    }

    // Checked against the deadline stored on the participation, not against the contest:
    // the deadline enforceable on a customer is the one in force on the day they played.
    if (participation.claimDeadline < new Date()) {
      throw new ConflictException(
        'CLAIM_WINDOW_CLOSED',
        'Le délai de réclamation de ce lot est dépassé.',
        { claimDeadline: participation.claimDeadline.toISOString() }
      );
    }

    const storeId = await this.resolveStoreId(actor, input.storeId);

    if (input.channel === 'IN_STORE' && !storeId) {
      throw new DomainException(
        'STORE_REQUIRED',
        'Une remise en boutique doit indiquer la boutique concernée.'
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.participation.updateMany({
        where: { id: participation.id, prizeStatus: 'TO_CLAIM' },
        data: { prizeStatus: 'REDEEMED' },
      });

      if (claimed.count === 0) {
        throw new ConflictException('ALREADY_REDEEMED', 'Ce lot a déjà été remis au client.');
      }

      await tx.prizeRedemption.create({
        data: {
          participationId: participation.id,
          issuedById: actor.id,
          // Null for an online claim: the brief allows claiming online, where no store
          // is involved.
          storeId: input.channel === 'IN_STORE' ? storeId : null,
          channel: input.channel,
          note: input.note ?? null,
        },
      });

      return tx.participation.findUniqueOrThrow({
        where: { id: participation.id },
        include: PARTICIPATION_INCLUDE,
      });
    });

    await this.audit.record({
      userId: actor.id,
      action: 'PRIZE_REDEEMED',
      entity: 'Participation',
      entityId: participation.id,
      metadata: { channel: input.channel, storeId, customerId: participation.userId },
      ip,
    });

    await this.redis.invalidate('stats:*');

    this.logger.log(`Prize of participation ${participation.id} handed over by ${actor.id}`);

    return toParticipationDto(updated);
  }
}
