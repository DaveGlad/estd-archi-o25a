import { Injectable, Logger } from '@nestjs/common';
import {
  AGE_RANGES,
  AGE_RANGE_BOUNDS,
  type AgeRange,
  type MailingExportRow,
} from '@theetiptop-contest/shared';

import { AuditService } from '../../common/audit/audit.service.js';
import type { AuthenticatedUser } from '../../common/auth-context.js';
import { ageAt } from '../../common/mapping.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';

/**
 * Requirement 6 of the brief: "allow the data to be exported for an emailing campaign".
 *
 * The whole module is one sentence of the brief and three GDPR constraints:
 *
 *   - **opt-in only.** `marketingConsent = true`, and nothing else. A contest entry is
 *     consent to play, not consent to be emailed about something else: article 7 requires
 *     consent to be specific, which is why the schema keeps the marketing consent separate
 *     from accepting the contest rules.
 *   - **minimised.** Email, name, consent date, an age bracket and a participation count.
 *     Not the phone number, not the postcode, not the exact birth date: the campaign needs
 *     to address and segment, not to hold a profile.
 *   - **traceable.** Every export writes an audit entry. An export is a copy of personal
 *     data leaving the system, and accountability means being able to say who took it and
 *     when.
 */
@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  private resolveAgeRange(birthDate: Date | null, now: Date): AgeRange | 'inconnu' {
    if (!birthDate) return 'inconnu';

    const age = ageAt(birthDate, now);

    // Resolved against the bounds declared in the shared package rather than a second
    // copy of the thresholds: the dashboard chart and this export must bucket identically,
    // otherwise the same customer lands in two different brackets in two reports.
    const match = AGE_RANGES.find((range) => {
      const { min, max } = AGE_RANGE_BOUNDS[range];
      return age >= min && (max === null || age <= max);
    });

    return match ?? 'inconnu';
  }

  async buildMailingRows(actor: AuthenticatedUser, ip: string | undefined): Promise<MailingExportRow[]> {
    const now = new Date();

    const customers = await this.prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        marketingConsent: true,
        // An anonymised account has had its email replaced by a placeholder on an
        // .invalid domain. Including it would mean a campaign bouncing on every send.
        anonymizedAt: null,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        marketingConsentAt: true,
        _count: { select: { participations: true } },
      },
      orderBy: { marketingConsentAt: 'asc' },
    });

    await this.audit.record({
      userId: actor.id,
      action: 'MAILING_EXPORTED',
      entity: 'User',
      metadata: { rowCount: customers.length },
      ip,
    });

    this.logger.log(`Mailing base exported by ${actor.id}: ${customers.length} row(s)`);

    return customers.map((customer) => ({
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      // Non-null in practice: the timestamp is written in the same statement as the flag.
      // Falling back to the epoch rather than to "now" keeps an anomaly visible in the
      // export instead of disguising it as a fresh consent.
      consentedAt: (customer.marketingConsentAt ?? new Date(0)).toISOString(),
      ageRange: this.resolveAgeRange(customer.birthDate, now),
      participationCount: customer._count.participations,
    }));
  }

  /**
   * Escapes one CSV field.
   *
   * Two separate problems, both handled here:
   *
   *   1. **CSV quoting.** A value containing the separator, a quote or a newline has to be
   *      wrapped in quotes with inner quotes doubled, or it shifts every following column.
   *
   *   2. **Formula injection.** A field starting with `=`, `+`, `-`, `@`, a tab or a
   *      carriage return is interpreted as a formula by Excel and LibreOffice. A customer
   *      who registers under the name `=cmd|' /c calc'!A1` turns our marketing export into
   *      code execution on the machine of whoever opens it. Prefixing with an apostrophe
   *      forces the cell to be read as text. This is not theoretical — it is the standard
   *      way spreadsheet exports are weaponised, and the one place in this application
   *      where customer-supplied text reaches a file somebody else opens.
   */
  private escapeCsvField(value: string): string {
    const neutralised = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

    return /[";\n\r]/.test(neutralised) ? `"${neutralised.replace(/"/g, '""')}"` : neutralised;
  }

  /**
   * Renders the rows as CSV.
   *
   * Semicolon separator and a UTF-8 BOM, both for the same reason: the file is opened in
   * Excel on a French locale. Excel there expects `;` as the list separator and, without
   * the BOM, reads UTF-8 as Latin-1 and turns every accented name into mojibake. A comma
   * separator and no BOM would be more canonical CSV and unusable by the person the export
   * is for.
   */
  toCsv(rows: MailingExportRow[]): string {
    const header = [
      'email',
      'prenom',
      'nom',
      'consentement_le',
      'tranche_age',
      'nombre_participations',
    ];

    const lines = rows.map((row) =>
      [
        row.email,
        row.firstName,
        row.lastName,
        row.consentedAt,
        row.ageRange,
        String(row.participationCount),
      ]
        .map((field) => this.escapeCsvField(field))
        .join(';')
    );

    // CRLF line endings: what the CSV specification (RFC 4180) asks for, and what Windows
    // tooling handles without surprises.
    // `\ufeff` rather than a literal BOM character: the literal is invisible in source
    // and silently lost by any tool that normalises the file.
    return `\ufeff${[header.join(';'), ...lines].join('\r\n')}\r\n`;
  }
}
