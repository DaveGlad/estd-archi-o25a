/**
 * Decorative elements of the home page.
 *
 * All purely visual: every one carries `aria-hidden` and adds nothing to the document
 * outline, so a screen reader walks straight past them.
 *
 * Drawn as inline SVG rather than images. That avoids a network request each, stays sharp
 * at every screen density, and follows the light or dark theme automatically because the
 * shapes inherit the current colour — three things a PNG would each need a workaround for.
 */

/** Fine grain over the background, which keeps it from reading as a perfect digital flat. */
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

/** Stylised tea leaf, taken from the logo, used as a watermark. */
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

/** Curls of steam, above the grand prize block. */
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
