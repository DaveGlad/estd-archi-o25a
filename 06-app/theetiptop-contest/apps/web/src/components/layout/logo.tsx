import { cn } from '../../lib/utils';

/**
 * Identité visuelle de Thé Tip Top.
 *
 * La marque est une feuille de thé inscrite dans un disque. Elle est
 * construite géométriquement plutôt que dessinée à main levée : la feuille
 * est une vésica symétrique, la nervure centrale suit son axe, et les
 * nervures secondaires se répartissent par paires. L'ensemble est incliné
 * de 15 degrés pour éviter la raideur d'un axe strictement vertical.
 *
 * Contraintes tenues :
 * - lisible à 16 px, la nervure la plus fine reste au-dessus du demi-pixel ;
 * - déclinable en une seule couleur pour la gravure et le fax ;
 * - hérite de la couleur du texte, donc pas de seconde version pour le
 *   fond sombre ;
 * - aucune image bitmap, donc net à toutes les densités d'écran.
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
 * Logotype complet. Le nom est composé en capitales espacées plutôt qu'en
 * casse mixte : à cette taille, la capitale tient mieux la ligne et donne
 * à la marque une assise que le bas-de-casse ne lui donnait pas.
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
