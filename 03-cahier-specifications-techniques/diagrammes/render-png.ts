/**
 * Renders every `*.svg` of this folder to a PNG fit for insertion in the document.
 *
 *   cd 06-app/theetiptop-contest
 *   npx tsx ../../03-cahier-specifications-techniques/diagrammes/render-png.ts
 *
 * Chromium rather than a dedicated converter, because the project already carries
 * Playwright for its functional suite. Adding `rsvg`, `cairosvg` or Inkscape to turn
 * seven files into seven images would be a new dependency on every machine that has to
 * rebuild the dossier, for a job the browser already does correctly.
 *
 * `deviceScaleFactor: 2` is what makes the text readable once the figure is scaled down
 * to the width of an A4 page. At 1 the lines survive and the 10 px labels turn to mush.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { chromium } from 'playwright';

const HERE = dirname(fileURLToPath(import.meta.url));

function dimensions(svg: string): { width: number; height: number } {
  const w = svg.match(/width="(\d+(?:\.\d+)?)"/);
  const h = svg.match(/height="(\d+(?:\.\d+)?)"/);
  if (!w || !h) throw new Error('SVG without explicit width and height');
  return { width: Math.ceil(Number(w[1])), height: Math.ceil(Number(h[1])) };
}

async function main(): Promise<void> {
  const files = readdirSync(HERE).filter((f) => f.endsWith('.svg')).sort();
  if (files.length === 0) {
    console.error('Aucun SVG. Lancer d\'abord: python3 generate.py');
    process.exit(1);
  }

  const browser = await chromium.launch();
  try {
    for (const file of files) {
      const svg = readFileSync(join(HERE, file), 'utf8');
      const { width, height } = dimensions(svg);

      const page = await browser.newPage({
        viewport: { width, height },
        deviceScaleFactor: 2,
      });
      await page.goto(pathToFileURL(join(HERE, file)).href);
      const out = join(HERE, file.replace(/\.svg$/, '.png'));
      await page.screenshot({ path: out, fullPage: false });
      await page.close();

      console.log(`  ${file.replace(/\.svg$/, '.png').padEnd(30)} ${width} x ${height} px`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
