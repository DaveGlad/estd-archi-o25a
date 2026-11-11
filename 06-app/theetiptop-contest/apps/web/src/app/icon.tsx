import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/**
 * Favicon, drawn from the same geometry as the site logo, so a change to the brand
 * propagates here without a second file to remember.
 *
 * The colours are hard-coded rather than taken from the theme: this renders on the server,
 * outside any browser, with no access to the CSS custom properties.
 */
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

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <img
          width={64}
          height={64}
          alt=""
          src={`data:image/svg+xml;base64,${Buffer.from(MARK).toString('base64')}`}
        />
      </div>
    ),
    size
  );
}
