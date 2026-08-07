/**
 * Bakes the grain tile — REBUILD.md §2.4/1.
 *
 * "A baked 128×128 PNG tile at opacity 0.025, mix-blend-mode overlay, fixed.
 *  Bake it at build time — never a live feTurbulence filter, which is expensive
 *  to rasterise every paint."
 *
 * Written with Node's own zlib and a hand-rolled PNG encoder so the repo needs
 * no image dependency at all. `sharp` would pull ~30 MB of platform binaries to
 * produce one 128×128 greyscale tile.
 *
 * The noise is 4-octave value noise on lattices whose sizes all divide 128
 * (8/16/32/64), with lookups wrapped modulo the lattice — so the tile repeats
 * seamlessly with `background-repeat` and shows no seam or visible motif.
 *
 * Run: npm run generate:grain
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZE = 128;
const OCTAVES = 4;
const BASE_LATTICE = 8;
/** Mid-grey is the neutral point for `mix-blend-mode: overlay`. */
const CENTRE = 128;
const SPREAD = 116;

/** Deterministic PRNG — the tile is byte-identical on every machine and rebuild. */
function mulberry32(seed) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smoothstep = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/** One octave of periodic value noise, sampled to SIZE×SIZE. */
function octave(lattice, random) {
  const grid = new Float32Array(lattice * lattice);
  for (let i = 0; i < grid.length; i++) grid[i] = random();

  const at = (x, y) => grid[(y % lattice) * lattice + (x % lattice)];
  const out = new Float32Array(SIZE * SIZE);
  const cell = SIZE / lattice;

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

const random = mulberry32(0x1f5e5eed);
const field = new Float32Array(SIZE * SIZE);
let amplitudeTotal = 0;

for (let o = 0; o < OCTAVES; o++) {
  const amplitude = 1 / 2 ** o;
  const layer = octave(BASE_LATTICE * 2 ** o, random);
  for (let i = 0; i < field.length; i++) field[i] += layer[i] * amplitude;
  amplitudeTotal += amplitude;
}

/* ── Minimal PNG encoder: 8-bit greyscale, filter type 0 ──────────────────── */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 0; // colour type 0 = greyscale
ihdr[10] = 0; // deflate
ihdr[11] = 0; // adaptive filtering
ihdr[12] = 0; // no interlace

// Raw scanlines, each prefixed with filter byte 0 (None).
const raw = Buffer.alloc((SIZE + 1) * SIZE);
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE + 1)] = 0;
  for (let x = 0; x < SIZE; x++) {
    const v = Math.round(CENTRE + (field[y * SIZE + x] / amplitudeTotal - 0.5) * SPREAD);
    raw[y * (SIZE + 1) + 1 + x] = Math.max(0, Math.min(255, v));
  }
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'grain.png');
writeFileSync(outPath, png);

console.log(`grain.png — ${SIZE}×${SIZE}, ${png.length} bytes → ${outPath}`);
