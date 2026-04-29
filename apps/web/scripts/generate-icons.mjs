// Generates apple-touch-icon.png and og-default.png from inline SVG using sharp.
// Run once after design changes: `node scripts/generate-icons.mjs`
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = (p) => resolve(__dirname, '..', 'public', p);

// Brand colors (mirror site tokens)
const ACCENT = '#7a5af8';
const ACCENT_2 = '#22b6c8';
const INK = '#0a0a0a';
const PAPER = '#fafaf7';

// Wave-axes mark, scaled with viewBox 0 0 24 24
function markSvg({ stroke, axisOpacity = 0.4, dotFill }) {
  return `
    <g stroke-linecap="round" fill="none">
      <line x1="4" y1="20" x2="21" y2="20" stroke="${stroke}" stroke-width="1" opacity="${axisOpacity}" />
      <line x1="4" y1="20" x2="4" y2="3" stroke="${stroke}" stroke-width="1" opacity="${axisOpacity}" />
      <line x1="5" y1="9"  x2="16" y2="20" stroke="${stroke}" stroke-width="1.5" opacity="0.32" />
      <line x1="7" y1="6"  x2="18" y2="17" stroke="${stroke}" stroke-width="1.5" opacity="0.6" />
      <line x1="10" y1="3" x2="21" y2="14" stroke="${stroke}" stroke-width="1.6" />
      <circle cx="14.5" cy="7.5" r="1.6" fill="${dotFill ?? stroke}" stroke="none" />
    </g>
  `;
}

// Apple touch icon: 180x180, gradient backdrop, white mark inside
const appleSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${ACCENT}" />
      <stop offset="100%" stop-color="${ACCENT_2}" />
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="36" fill="url(#g)" />
  <svg x="22" y="22" width="136" height="136" viewBox="0 0 24 24">
    ${markSvg({ stroke: '#ffffff', axisOpacity: 0.55 })}
  </svg>
</svg>
`;

// OG image: 1200x630, paper background, mark on left, name/role on right
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${ACCENT}" />
      <stop offset="100%" stop-color="${ACCENT_2}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="${PAPER}" />
  <!-- subtle accent bar -->
  <rect x="0" y="0" width="8" height="630" fill="url(#g)" />

  <!-- Mark, ink color, top-left -->
  <svg x="80" y="80" width="120" height="120" viewBox="0 0 24 24">
    ${markSvg({ stroke: INK, axisOpacity: 0.4 })}
  </svg>

  <!-- Eyebrow -->
  <text x="80" y="290"
        font-family="ui-monospace, 'SF Mono', Menlo, monospace"
        font-size="22" letter-spacing="4"
        fill="${INK}" opacity="0.55">TSHOLOFELO SETATI</text>

  <!-- Title -->
  <text x="80" y="380"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="68" font-weight="600"
        fill="${INK}">AI strategy &amp; innovation</text>
  <text x="80" y="458"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="68" font-weight="600"
        fill="${INK}">economics.</text>

  <!-- Sub-line -->
  <text x="80" y="525"
        font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="26"
        fill="${INK}" opacity="0.7">Frontier technology, governance, and the economics of change.</text>

  <!-- URL -->
  <text x="80" y="585"
        font-family="ui-monospace, 'SF Mono', Menlo, monospace"
        font-size="22"
        fill="${INK}" opacity="0.5">tsholosetati.com</text>
</svg>
`;

async function render(svg, outPath, width) {
  const buf = Buffer.from(svg);
  await sharp(buf, { density: 384 })
    .resize({ width })
    .png()
    .toFile(out(outPath));
  console.log('  ✓', outPath);
}

console.log('Generating icons...');
await render(appleSvg, 'apple-touch-icon.png', 180);
await render(ogSvg, 'assets/og-default.png', 1200);
// Bonus: a 512px PWA icon
await render(appleSvg.replace(/width="180" height="180"/, 'width="512" height="512"').replace(/viewBox="0 0 180 180"/, 'viewBox="0 0 180 180"'), 'icon-512.png', 512);
console.log('Done.');
