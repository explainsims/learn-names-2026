// One-off script to rasterize public/icon-source.svg into the PNG
// variants the PWA manifest, iOS, and the favicon reference. Re-run
// with `node scripts/generate-icons.mjs` whenever the source changes.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '..', 'public');
const svg = readFileSync(join(publicDir, 'icon-source.svg'));

const targets = [
  { file: 'icon-192.png',          size: 192 },
  { file: 'icon-512.png',          size: 512 },
  { file: 'icon-maskable-512.png', size: 512 },
  { file: 'apple-touch-icon.png',  size: 180 },
  { file: 'favicon-32.png',        size: 32  },
];

for (const { file, size } of targets) {
  await sharp(svg).resize(size, size).png().toFile(join(publicDir, file));
  console.log(`generated ${file} (${size}x${size})`);
}
