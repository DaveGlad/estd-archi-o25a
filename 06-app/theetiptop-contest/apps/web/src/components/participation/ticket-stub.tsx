import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * Talon de ticket de caisse.
 *
 * Le joueur arrive avec un ticket dans la main. Plutôt que de lui présenter
 * un formulaire de plus, on lui présente l'objet qu'il tient déjà : même
 * proportions, même perforation, même composition en caractères à chasse
 * fixe. C'est le seul élément de l'interface qui ne pourrait pas être
 * transposé tel quel à un autre projet.
 *
 * La perforation est obtenue par deux encoches en couleur de fond posées de
 * part et d'autre du filet pointillé. Elles suivent donc le thème sans
 * retouche.
 */
export function TicketStub({
  header,
  children,
  footer,
  tone = 'default',
}: {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  tone?: 'default' | 'won';
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[14px] border border-border',
        tone === 'won' ? 'bg-surface' : 'bg-surface'
      )}
    >
      {/* Souche supérieure */}
      <div
        className={cn(
          'px-6 pt-5 pb-4 sm:px-8',
          tone === 'won' ? 'bg-primary text-primary-fg' : 'bg-muted/50'
        )}
      >
        {header}
      </div>

      {/* Perforation */}
      <div className="relative h-0">
        <span
          aria-hidden="true"
          className="absolute -top-[9px] -left-[9px] size-[18px] rounded-full bg-bg"
        />
        <span
          aria-hidden="true"
          className="absolute -top-[9px] -right-[9px] size-[18px] rounded-full bg-bg"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-5 top-0 border-t border-dashed border-border"
        />
      </div>

      <div className="px-6 py-7 sm:px-8">{children}</div>

      {footer && (
        <div className="border-t border-border bg-muted/35 px-6 py-4 sm:px-8">
          {footer}
        </div>
      )}
    </div>
  );
}

/** Ligne d'entête composée comme un ticket : libellé à gauche, valeur à droite. */
export function StubLine({
  label,
  value,
  strong,
}: {
  label: string;
  value: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-mono text-[11.5px] leading-[1.6] tracking-[0.08em] uppercase opacity-70">
        {label}
      </span>
      <span
        className={cn(
          'font-mono text-[12.5px] leading-[1.6] tabular-nums',
          strong && 'font-semibold'
        )}
      >
        {value}
      </span>
    </div>
  );
}
