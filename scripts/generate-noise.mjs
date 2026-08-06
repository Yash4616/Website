/**
 * Bakes the grain texture to a tiled 128×128 PNG (MASTER_PLAN.md §4.2, §9.1 item 3).
 *
 * A full-viewport `feTurbulence` is rasterized by the CPU on every paint and can
 * cost several milliseconds per frame on mobile. A tiled PNG is the identical
 * grain for ~2 KB and is effectively free.
 *
 * The noise is 4-octave value noise on a lattice whose grid sizes all divide 128
 * (8/16/32/64), and lattice lookups wrap modulo the grid — so the result tiles
 * seamlessly with `background-repeat: repeat` and shows no visible seam.
 *
 * Run: node scripts/generate-noise.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SIZE = 128;
const OCTAVES = 4;
const BASE_GRID = 8;
/** Mid-grey is the neutral point for `mix-blend-mode: overlay`. */
const CENTER = 128;
const SPREAD = 110;

/** Deterministic PRNG so the texture is identical on every machine and rebuild. */
function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smoothstep = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/** Value noise on a `grid × grid` periodic lattice, sampled at 128×128. */
function octave(grid, random) {
  const lattice = new Float32Array(grid * grid);
  for (let i = 0; i < lattice.length; i++) lattice[i] = random();

  const at = (x, y) => lattice[(y % grid) * grid + (x % grid)];
  const out = new Float32Array(SIZE * SIZE);
  const cell = SIZE / grid;

  for (let y = 0; y < SIZE; y++) {
    const gy = Math.floor(y / cell);
    const fy = smoothstep((y % cell) / cell);
    for (let x = 0; x < SIZE; x++) {
      const gx = Math.floor(x / cell);
      const fx = smoothstep((x % cell) / cell);

      const top = lerp(at(gx, gy), at(gx + 1, gy), fx);
      const bottom = lerp(at(gx, gy + 1), at(gx + 1, gy + 1), fx);
      out[y * SIZE + x] = lerp(top, bottom, fy);
    }
  }
  return out;
}

const random = mulberry32(0x5eed);
const field = new Float32Array(SIZE * SIZE);
let totalAmplitude = 0;

for (let o = 0; o < OCTAVES; o++) {
  const amplitude = 1 / 2 ** o;
  const layer = octave(BASE_GRID * 2 ** o, random);
  for (let i = 0; i < field.length; i++) field[i] += layer[i] * amplitude;
  totalAmplitude += amplitude;
}

const pixels = Buffer.alloc(SIZE * SIZE * 4);
for (let i = 0; i < field.length; i++) {
  const value = Math.round(CENTER + (field[i] / totalAmplitude - 0.5) * SPREAD);
  const clamped = Math.max(0, Math.min(255, value));
  pixels[i * 4] = clamped;
  pixels[i * 4 + 1] = clamped;
  pixels[i * 4 + 2] = clamped;
  pixels[i * 4 + 3] = 255;
}

const outPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'assets',
  'images',
  'noise.png'
);

await sharp(pixels, { raw: { width: SIZE, height: SIZE, channels: 4 } })
  // Quantised to 16 greys: at 3% opacity under `overlay` the banding is not
  // perceivable, and it roughly halves the file.
  .png({ compressionLevel: 9, palette: true, colours: 16 })
  .toFile(outPath);

console.log(`noise.png written → ${outPath}`);
