import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../infra/prisma/prisma.service.js';

/**
 * Actions worth recording. A closed union rather than free text, so a typo cannot create
 * a silent second category that no report ever counts.
 */
export type AuditAction =
  | 'PRIZE_REDEEMED'
  | 'DRAW_EXECUTED'
  | 'MAILING_EXPORTED'
  | 'PERSONAL_DATA_EXPORTED'
  | 'ACCOUNT_ANONYMIZED'
  | 'CODES_DISPENSED'
  | 'CODE_VOIDED'
  | 'CONTEST_UPDATED';

export interface AuditEntry {
  /** Who acted. For a till, the synthetic account the API key maps to. */
  userId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

/**
 * Append-only trail of sensitive actions.
 *
 * Required twice over: by GDPR accountability (article 5.2 — being able to demonstrate
 * compliance, not merely claim it) and by the bailiff's oversight of the contest, who
 * must be able to establish after the fact who handed out which prize and who ran the
 * draw.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records an entry. Never throws.
   *
   * A failed audit write must not roll back the business action that succeeded: refusing
   * to hand a customer their prize because a log row could not be inserted is the wrong
   * trade-off. The failure is logged at error level so it surfaces in Grafana, which is
   * where a vanishing audit trail should be noticed.
   */
  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId ?? null,
          metadata: (entry.metadata ?? null) as never,
          ip: entry.ip ?? null,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to write audit entry ${entry.action} on ${entry.entity}:${entry.entityId ?? '-'}`,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }
}
