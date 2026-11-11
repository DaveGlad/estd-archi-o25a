import { ImageResponse } from 'next/og';

export const alt =
  'Le Grand Jeu Thé Tip Top, 100 % des tickets sont gagnants';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="20" fill="#185b37"/>
  <g transform="rotate(-15 20 20)">
    <path d="M20 6.2C28.4 12.4 28.4 27.6 20 33.8C11.6 27.6 11.6 12.4 20 6.2Z" fill="#fdfcf8"/>
    <path d="M20 31.6V8.4" stroke="#185b37" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M20 26.3C17.9 25.5 16.3 24.2 15.4 22.2" stroke="#185b37" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M20 26.3C22.1 25.5 23.7 24.2 24.6 22.2" stroke="#185b37" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M20 20.4C18.2 19.7 17 18.6 16.3 16.9" stroke="#185b37" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M20 20.4C21.8 19.7 23 18.6 23.7 16.9" stroke="#185b37" stroke-width="1.1" stroke-linecap="round"/>
  </g>
</svg>`;

/**
 * Social sharing image, generated on the fly in the brand colours.
 *
 * Generated rather than a static asset: a hand-made PNG would be a second place to update
 * every time the contest dates or the brand change, and the one that silently goes stale.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#fcfaf4',
          padding: 72,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img
            width={72}
            height={72}
            alt=""
            src={`data:image/svg+xml;base64,${Buffer.from(MARK).toString('base64')}`}
          />
          <div
            style={{
              fontSize: 30,
              color: '#18221b',
              fontWeight: 600,
              letterSpacing: 3,
            }}
          >
            THÉ TIP TOP
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, color: '#18221b', lineHeight: 1.05 }}>
            100 % des tickets
          </div>
          <div style={{ fontSize: 76, color: '#18221b', lineHeight: 1.05 }}>
            sont gagnants.
          </div>
          <div style={{ fontSize: 76, color: '#7f4a00', lineHeight: 1.05 }}>
            Le vôtre aussi.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 26,
            color: '#5b675e',
          }}
        >
          <div style={{ display: 'flex' }}>
            Ouverture de notre 10ᵉ boutique à Nice
          </div>
          <div style={{ display: 'flex' }}>500 000 codes en jeu</div>
        </div>
      </div>
    ),
    size
  );
}
