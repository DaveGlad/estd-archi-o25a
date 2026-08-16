import { ImageResponse } from 'next/og';

export const alt =
  'Le Grand Jeu Thé Tip Top, 100 % des tickets sont gagnants';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Image de partage générée à la volée, aux couleurs de la charte.
 * Elle évite d'avoir à maintenir un visuel statique en parallèle du site.
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#185b37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fdfcf8',
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            T
          </div>
          <div style={{ fontSize: 30, color: '#18221b', fontWeight: 600 }}>
            Thé Tip Top
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
