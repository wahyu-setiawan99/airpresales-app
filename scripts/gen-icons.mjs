// One-off: rasterize the SVG icons into the PNGs the PWA manifest needs.
// Run with: node scripts/gen-icons.mjs
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const icon = readFileSync(join(pub, 'icon.svg'))
const maskable = readFileSync(join(pub, 'icon-maskable.svg'))

const jobs = [
  [icon, 192, 'pwa-192x192.png'],
  [icon, 512, 'pwa-512x512.png'],
  [icon, 180, 'apple-touch-icon.png'],
  [icon, 64, 'favicon-64.png'],
  [maskable, 512, 'pwa-maskable-512x512.png'],
]

for (const [src, size, name] of jobs) {
  await sharp(src).resize(size, size).png().toFile(join(pub, name))
  console.log('  ✓', name)
}
console.log('Icons generated.')
