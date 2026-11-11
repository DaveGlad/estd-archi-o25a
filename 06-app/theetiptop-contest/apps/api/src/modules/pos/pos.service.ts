import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import type { DispenseCodeResult, PosContestInfo } from '@theetiptop-contest/shared';

import { AuditService } from '../../common/audit/audit.service.js';
import type { ApiKeyConsumer } from '../../common/auth-context.js';
import {
  ConflictException,
  DomainException,
  NotFoundException,
} from '../../common/exceptions/domain.exception.js';
import { APP_CONFIG, type AppConfig } from '../../config/env.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { CatalogueService } from '../catalogue/catalogue.service.js';
import type { DispenseCodeDto, VoidCodeDto } from './dto/pos.dto.js';

/**
 * Requirement 8 of the brief: "make the API available to the store tills and to the
 * future e-commerce site".
 *
 * This module is the reason API v1 exists as a versioned, Swagger-documented REST API
 * rather than as a private back end for our own front ends. Two of its three consumers
 * are systems we do not write: the tills of the 10 stores, and an e-commerce site another
 * agency will build.
 *
 * ⚠️ The design rule that runs through the whole module: **a till is never told which
 * prize is behind the code it prints.** It has no business knowing, the customer must
 * discover it on the site, and a compromised till therefore cannot sort the winning
 * tickets out of the stack.
 */
@Injectable()
export class PosService {
  private readonly logger = new Logger(PosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly catalogue: CatalogueService,
    @Inject(APP_CONFIG) private readonly config: AppConfig
  ) {}

  /**
   * Audit entries need a `userId`, and a till is not a person.
   *
   * Rather than making the column nullable — which would weaken it for every human action
   * it records — the consumer's actions are attributed to the administrator account, with
   * the consumer name in the metadata. Honest and traceable: the log says "dispensed by
   * the till integration", not "dispensed by nobody".
   */
  private async resolveAuditActorId(): Promise<string | null> {
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    return admin?.id ?? null;
  }

  /** What a till needs in order to decide on its own whether to print a code. */
  async getContestInfo(): Promise<PosContestInfo> {
    const contest = await this.catalogue.getCurrentContestEntity();
    const now = new Date();

    const codesRemaining = await this.prisma.ticketCode.count({
      where: { contestId: contest.id, status: 'AVAILABLE' },
    });

    return {
      name: contest.name,
      isOpen: now >= contest.startsAt && now <= contest.endsAt,
      startsAt: contest.startsAt.toISOString(),
      endsAt: contest.endsAt.toISOString(),
      minimumPurchaseCents: contest.minimumPurchaseCents,
      codeLength: contest.codeLength,
      // Lets the operator see the pool draining and react before it runs dry.
      codesRemaining,
    };
  }

  /**
   * Hands one code out of the pool to a till.
   *
   * The whole operation is a single statement, and that is the point:
   *
   * ```sql
   * UPDATE "TicketCode" SET status = 'DISPENSED', ...
   * WHERE id = (SELECT id FROM "TicketCode"
   *             WHERE "contestId" = $1 AND status = 'AVAILABLE'
   *             LIMIT 1 FOR UPDATE SKIP LOCKED)
   * RETURNING code
   * ```
   *
   * `FOR UPDATE SKIP LOCKED` is the standard way to pop from a queue under concurrency:
   * ten tills ringing up a sale at the same instant each lock a different row and walk
   * away with a different code. Without `SKIP LOCKED` they would all queue behind the same
   * row and the ninth till would wait for the first eight. A read-then-write would be
   * worse still: two tills would print the same code on two receipts.
   *
   * **No `ORDER BY random()`.** Over 500,000 rows that is a sequential scan plus a sort,
   * on the hottest write path of the till integration. It is also unnecessary: the prize
   * behind each code was shuffled at generation time, so consecutive codes carry
   * independent prizes. Handing them out in whatever order the `(contestId, status)` index
   * yields leaks nothing — the randomness is in the prize mapping, not in the dispensing
   * order. Point to defend at the oral.
   */
  async dispenseCode(consumer: ApiKeyConsumer, input: DispenseCodeDto): Promise<DispenseCodeResult> {
    const contest = await this.catalogue.getCurrentContestEntity();
    const now = new Date();

    if (now < contest.startsAt || now > contest.endsAt) {
      throw new DomainException(
        'CONTEST_CLOSED',
        'Le jeu-concours n’accepte plus de participations : aucun code ne doit être imprimé.',
        HttpStatus.CONFLICT,
        { startsAt: contest.startsAt.toISOString(), endsAt: contest.endsAt.toISOString() }
      );
    }

    if (input.purchaseAmountCents < contest.minimumPurchaseCents) {
      throw new DomainException(
        'AMOUNT_BELOW_THRESHOLD',
        `Le montant doit atteindre ${(contest.minimumPurchaseCents / 100).toFixed(2)} € pour donner droit à un code.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
        { minimumPurchaseCents: contest.minimumPurchaseCents }
      );
    }

    let storeId: string | null = null;

    if (input.channel === 'IN_STORE') {
      if (!input.storeId) {
        throw new DomainException(
          'UNKNOWN_STORE',
          'Une distribution en boutique doit indiquer la boutique.',
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }

      const store = await this.prisma.store.findFirst({
        where: { id: input.storeId, active: true },
        select: { id: true },
      });

      if (!store) {
        throw new DomainException(
          'UNKNOWN_STORE',
          'Boutique inconnue ou inactive.',
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }

      storeId = store.id;
    }

    const dispensed = await this.prisma.$queryRaw<Array<{ code: string; dispensedAt: Date }>>`
      UPDATE "TicketCode"
      SET "status" = 'DISPENSED',
          "dispensedAt" = now(),
          "storeId" = ${storeId},
          "purchaseAmountCents" = ${input.purchaseAmountCents},
          "dispenseReference" = ${input.reference ?? null}
      WHERE "id" = (
        SELECT "id" FROM "TicketCode"
        WHERE "contestId" = ${contest.id}
          AND "status" = 'AVAILABLE'
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING "code", "dispensedAt"
    `;

    const row = dispensed[0];

    if (!row) {
      // The 500,000 codes are exhausted. A real possibility at the end of a successful
      // contest, and the till has to be told so it stops promising a code it cannot print.
      throw new ConflictException(
        'CODE_POOL_EXHAUSTED',
        'Tous les codes du jeu ont été distribués.'
      );
    }

    const actorId = await this.resolveAuditActorId();
    if (actorId) {
      await this.audit.record({
        userId: actorId,
        action: 'CODES_DISPENSED',
        entity: 'TicketCode',
        entityId: row.code,
        metadata: {
          consumer: consumer.name,
          channel: input.channel,
          storeId,
          purchaseAmountCents: input.purchaseAmountCents,
          reference: input.reference ?? null,
        },
      });
    }

    return {
      code: row.code,
      dispensedAt: row.dispensedAt.toISOString(),
      // Printed under the code on the receipt, so the customer knows where to play it.
      claimUrl: `${this.config.publicSiteUrl}/participer`,
      contestEndsAt: contest.endsAt.toISOString(),
    };
  }

  /**
   * Neutralises a code whose receipt was cancelled.
   *
   * Only a `DISPENSED` code can be voided. Refusing on `USED` is the important branch: once
   * a customer has played the code and seen their prize, cancelling the sale cannot take
   * the prize back — that is a commercial dispute, not a database operation, and silently
   * voiding a played code would erase a participation the bailiff has to be able to count.
   */
  async voidCode(consumer: ApiKeyConsumer, input: VoidCodeDto): Promise<{ code: string; status: string }> {
    const code = input.code.trim().toUpperCase();

    const ticketCode = await this.prisma.ticketCode.findUnique({
      where: { code },
      select: { id: true, status: true },
    });

    if (!ticketCode) throw new NotFoundException('TicketCode', code);

    if (ticketCode.status === 'USED') {
      throw new ConflictException(
        'CODE_ALREADY_PLAYED',
        'Ce code a déjà été joué par un client : il ne peut plus être neutralisé.'
      );
    }

    if (ticketCode.status === 'VOIDED') {
      throw new ConflictException('CODE_ALREADY_VOIDED', 'Ce code a déjà été neutralisé.');
    }

    if (ticketCode.status === 'AVAILABLE') {
      throw new ConflictException(
        'CODE_NOT_DISPENSED',
        'Ce code n’a jamais été distribué : il n’y a rien à annuler.'
      );
    }

    await this.prisma.ticketCode.update({
      where: { id: ticketCode.id },
      data: { status: 'VOIDED', voidedReason: input.reason },
    });

    const actorId = await this.resolveAuditActorId();
    if (actorId) {
      await this.audit.record({
        userId: actorId,
        action: 'CODE_VOIDED',
        entity: 'TicketCode',
        entityId: code,
        metadata: { consumer: consumer.name, reason: input.reason },
      });
    }

    this.logger.log(`Code ${code} voided by ${consumer.name}: ${input.reason}`);

    return { code, status: 'VOIDED' };
  }
}
