import { cn } from '../lib/utils';

/**
 * Thé Tip Top brand mark.
 *
 * A tea leaf inscribed in a disc, built geometrically rather than drawn freehand: the leaf
 * is a symmetrical vesica, the midrib follows its axis, and the secondary veins are laid
 * out in pairs. The whole thing is tilted 15 degrees, which removes the stiffness of a
 * strictly vertical axis.
 *
 * Constraints it meets:
 *  - legible at 16 px — the thinnest vein stays above half a pixel;
 *  - reducible to a single colour, for engraving and for a fax;
 *  - inherits the text colour, so there is no second version for the dark theme;
 *  - no bitmap, so it stays sharp at every screen density.
 */

type MarkVariant = 'solid' | 'outline' | 'mono';

export function LogoMark({
  className,
  variant = 'solid',
}: {
  className?: string;
  variant?: MarkVariant;
}) {
  const leaf =
    'M20 6.2C28.4 12.4 28.4 27.6 20 33.8C11.6 27.6 11.6 12.4 20 6.2Z';

  const veins = [
    'M20 31.6V8.4',
    'M20 26.3C17.9 25.5 16.3 24.2 15.4 22.2',
    'M20 26.3C22.1 25.5 23.7 24.2 24.6 22.2',
    'M20 20.4C18.2 19.7 17 18.6 16.3 16.9',
    'M20 20.4C21.8 19.7 23 18.6 23.7 16.9',
  ];

  return (
    <svg
      viewBox="0 0 40 40"
      className={cn('shrink-0', className)}
      role="img"
      aria-label="Thé Tip Top"
      fill="none"
    >
      {variant === 'solid' && <circle cx="20" cy="20" r="19" className="fill-primary" />}
      {variant === 'outline' && (
        <circle
          cx="20"
          cy="20"
          r="18.25"
          className="stroke-current"
          strokeWidth="1.5"
        />
      )}
      {variant === 'mono' && (
        <circle cx="20" cy="20" r="19" fill="currentColor" />
      )}

      <g transform="rotate(-15 20 20)">
        <path
          d={leaf}
          className={
            variant === 'outline'
              ? 'fill-none stroke-current'
              : 'fill-primary-fg stroke-none'
          }
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity={variant === 'outline' ? 1 : 0.96}
        />
        {veins.map((d, index) => (
          <path
            key={d}
            d={d}
            className={
              variant === 'outline' ? 'stroke-current' : 'stroke-primary'
            }
            strokeWidth={index === 0 ? 1.3 : 1.1}
            strokeLinecap="round"
            opacity={variant === 'outline' ? 0.55 : 0.85}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * Full logotype.
 *
 * The name is set in spaced capitals rather than mixed case: at this size capitals hold
 * the line better and give the mark a footing that lower case did not.
 */
export function Logo({
  className,
  withWordmark = true,
  size = 'md',
}: {
  className?: string;
  withWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const marks = { sm: 'size-7', md: 'size-9', lg: 'size-12' };
  const words = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <LogoMark className={marks[size]} />
      {withWordmark && (
        <span
          className={cn(
            'font-serif leading-none font-semibold tracking-[0.1em] uppercase',
            words[size]
          )}
        >
          Thé Tip Top
        </span>
      )}
    </span>
  );
}
