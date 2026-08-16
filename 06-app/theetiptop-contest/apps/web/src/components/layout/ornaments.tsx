/**
 * Éléments décoratifs de la page d'accueil.
 *
 * Tous sont purement visuels : ils sont marqués aria-hidden et n'ajoutent
 * aucun contenu au fil du document. Ils sont dessinés en SVG plutôt qu'en
 * image, ce qui évite une requête réseau, reste net à toutes les densités
 * d'écran et suit automatiquement le thème clair ou sombre.
 */

/** Grain fin appliqué au fond, pour éviter l'aplat numérique parfait. */
export function Grain() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full opacity-[0.035] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen"
    >
      <filter id="grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

/** Feuille de thé stylisée, reprise du logo, en filigrane. */
export function LeafOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      aria-hidden="true"
      className={className}
      fill="none"
      strokeLinecap="round"
    >
      <path
        d="M100 232C100 232 8 176 8 96C8 44 48 8 100 8C152 8 192 44 192 96C192 176 100 232 100 232Z"
        className="stroke-accent"
        strokeWidth="1.5"
        opacity="0.35"
      />
      <path
        d="M100 224V56"
        className="stroke-accent"
        strokeWidth="1.5"
        opacity="0.45"
      />
      {[80, 108, 136, 164].map((y, index) => (
        <g key={y} opacity={0.4 - index * 0.06}>
          <path
            d={`M100 ${y}C100 ${y} 74 ${y - 8} 56 ${y + 18}`}
            className="stroke-accent"
            strokeWidth="1.5"
          />
          <path
            d={`M100 ${y}C100 ${y} 126 ${y - 8} 144 ${y + 18}`}
            className="stroke-accent"
            strokeWidth="1.5"
          />
        </g>
      ))}
    </svg>
  );
}

/** Volutes de vapeur, au-dessus du bloc du gros lot. */
export function SteamOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      aria-hidden="true"
      className={className}
      fill="none"
      strokeLinecap="round"
    >
      {[0, 34, 68].map((x, index) => (
        <path
          key={x}
          d={`M${20 + x} 74C${20 + x} 60 ${8 + x} 56 ${8 + x} 42C${8 + x} 28 ${20 + x} 24 ${20 + x} 10`}
          stroke="currentColor"
          strokeWidth="2"
          opacity={0.5 - index * 0.12}
        />
      ))}
    </svg>
  );
}
