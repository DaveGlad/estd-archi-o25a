import { describe, expect, it } from 'vitest';
import type { MailingExportRow } from '@theetiptop-contest/shared';

import { ExportService } from './export.service';

/**
 * CSV rendering of the mailing export.
 *
 * The service is instantiated with stub collaborators: `toCsv` is pure, and the two it
 * does depend on — Prisma and the audit log — are only used by the query half of the
 * service. Wiring a real database in to test string escaping would make a fast test slow
 * and a deterministic one flaky.
 */
function createService(): ExportService {
  return new ExportService(
    {} as never, // PrismaService: unused by toCsv
    {} as never // AuditService: unused by toCsv
  );
}

function row(overrides: Partial<MailingExportRow> = {}): MailingExportRow {
  return {
    email: 'camille.rousseau@example.fr',
    firstName: 'Camille',
    lastName: 'Rousseau',
    consentedAt: '2026-11-05T14:02:00.000Z',
    ageRange: '35-44',
    participationCount: 3,
    ...overrides,
  };
}

describe('mailing export, CSV rendering', () => {
  /**
   * Splits without `trim()`.
   *
   * `String.prototype.trim()` strips U+FEFF — the byte-order mark is part of the
   * ECMAScript WhiteSpace production — so trimming first would silently remove the very
   * thing half of these assertions are about.
   */
  const lines = (csv: string): string[] => csv.split('\r\n').filter((line) => line !== '');

  it('writes a header and one line per contact', () => {
    const csv = createService().toCsv([row(), row({ email: 'theo@example.fr' })]);

    expect(lines(csv)).toHaveLength(3); // header + 2 rows
    expect(lines(csv)[0]).toBe(
      '\ufeffemail;prenom;nom;consentement_le;tranche_age;nombre_participations'
    );
  });

  it('separates fields with a semicolon, for Excel on a French locale', () => {
    const csv = createService().toCsv([row()]);
    expect(csv).toContain('camille.rousseau@example.fr;Camille;Rousseau;');
  });

  it('starts with a UTF-8 BOM, so Excel does not mangle accented names', () => {
    // Without it, Excel reads the file as Latin-1 and "Leïla" becomes "LeÃ¯la".
    expect(createService().toCsv([])).toMatch(/^\ufeff/);
  });

  it('uses CRLF line endings, as RFC 4180 specifies', () => {
    const csv = createService().toCsv([row()]);
    expect(csv).toContain('\r\n');
    expect(csv.includes('\n\n')).toBe(false);
  });

  describe('CSV quoting', () => {
    it('quotes a field containing the separator', () => {
      const csv = createService().toCsv([row({ lastName: 'Rousseau; Dupont' })]);
      expect(csv).toContain('"Rousseau; Dupont"');
    });

    it('doubles an inner quote', () => {
      const csv = createService().toCsv([row({ firstName: 'Jean "Jeannot"' })]);
      expect(csv).toContain('"Jean ""Jeannot"""');
    });

    it('quotes a field containing a newline', () => {
      const csv = createService().toCsv([row({ lastName: 'Rousseau\nDupont' })]);
      expect(csv).toContain('"Rousseau\nDupont"');
    });
  });

  /**
   * The security half of the escaping, and the reason it is tested at all.
   *
   * A field starting with `=`, `+`, `-`, `@`, a tab or a carriage return is read as a
   * formula by Excel and LibreOffice. A customer who registers under the name
   * `=cmd|' /c calc'!A1` turns the marketing export into code execution on the machine of
   * whoever opens it. This is the one place in the application where customer-supplied
   * text reaches a file somebody else opens, so it is the one place that has to be right.
   */
  describe('formula injection', () => {
    const dangerous = [
      ['=', '=1+1'],
      ['+', '+1+1'],
      ['-', '-1+1'],
      ['@', '@SUM(A1)'],
      ['tab', '\tinjected'],
      ['carriage return', '\rinjected'],
    ] as const;

    it.each(dangerous)('neutralises a %s prefix with an apostrophe', (_label, value) => {
      const csv = createService().toCsv([row({ firstName: value })]);

      // The apostrophe forces the cell to be read as text. It appears either bare or
      // inside the quoting added for a control character.
      expect(csv).toMatch(/[;"]'/);
      expect(csv).not.toMatch(new RegExp(`;${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    });

    it('neutralises the classic command-injection payload', () => {
      const payload = `=cmd|' /c calc'!A1`;
      const csv = createService().toCsv([row({ lastName: payload })]);

      expect(csv).toContain(`'${payload}`);
    });

    it('leaves an ordinary name untouched', () => {
      const csv = createService().toCsv([row({ firstName: 'Camille', lastName: 'Rousseau' })]);

      expect(csv).toContain(';Camille;Rousseau;');
      expect(csv).not.toContain("'Camille");
    });
  });

  it('renders an empty base as a header alone', () => {
    expect(lines(createService().toCsv([]))).toHaveLength(1);
  });
});
