/**
 * Concept retenu pour l'identité visuelle : la feuille et la tasse réunies
 * dans un même trait, dans un cartouche inspiré des boîtes à thé.
 * Le logo est vectoriel et hérite de la couleur du texte, ce qui le rend
 * utilisable sur fond clair comme sur fond sombre sans seconde version.
 */
export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" role="img" aria-label="Thé Tip Top">
        <rect x="1" y="1" width="30" height="30" rx="9" className="fill-primary" />
        <path
          d="M10 21.5c0-4.6 3.2-8.4 8-9.5-1 4.9-4 8.3-8 9.5Z"
          className="fill-accent"
        />
        <path
          d="M9 21.5h13a5.5 5.5 0 0 1-5.5 5.5h-2A5.5 5.5 0 0 1 9 21.5Z"
          className="fill-primary-fg"
          opacity="0.92"
        />
        <path
          d="M22 22.5h1.4a2.6 2.6 0 0 1 0 5.2H21"
          className="stroke-primary-fg"
          strokeWidth="1.4"
          fill="none"
          opacity="0.92"
        />
      </svg>
      {withWordmark && (
        <span className="font-serif text-lg leading-none font-semibold">
          Thé Tip Top
        </span>
      )}
    </span>
  );
}
