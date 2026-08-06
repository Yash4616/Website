/**
 * First Load JS budget gate — MASTER_PLAN.md §9.5, §11.1.
 *
 * Exits non-zero when any route's First Load JS exceeds 300 KB gzipped. Wired
 * into the per-stage quality gate from Stage 1 onward so a regression surfaces
 * the moment it appears rather than at Stage 8, when it is expensive to unwind.
 *
 * It reads the build that already happened (.next/app-build-manifest.json) and
 * gzips each chunk to measure it — the same quantity Next prints in its build
 * table — so it costs no second build.
 *
 * Run: npm run build && npm run perf:budget
 */
import { readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BUDGET_KB = 300;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NEXT_DIR = join(ROOT, '.next');
const MANIFEST = join(NEXT_DIR, 'app-build-manifest.json');

if (!existsSync(MANIFEST)) {
  console.error(
    `✗ ${MANIFEST} not found.\n  Run \`npm run build\` before \`npm run perf:budget\`.`
  );
  process.exit(1);
}

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));

/** Gzipped byte size of one built asset, memoised across routes that share it. */
const sizeCache = new Map();
async function gzipSize(file) {
  if (sizeCache.has(file)) return sizeCache.get(file);

  const path = join(NEXT_DIR, file);
  let size = 0;
  try {
    await stat(path);
    size = gzipSync(await readFile(path)).length;
  } catch {
    size = 0; // Asset not on disk (e.g. dev-only entry) — contributes nothing.
  }
  sizeCache.set(file, size);
  return size;
}

const results = [];
for (const [route, files] of Object.entries(manifest.pages ?? {})) {
  const jsFiles = [...new Set(files)].filter((file) => file.endsWith('.js'));
  let total = 0;
  for (const file of jsFiles) total += await gzipSize(file);
  results.push({ route, kb: total / 1024, chunks: jsFiles.length });
}

if (results.length === 0) {
  console.error('✗ No routes found in app-build-manifest.json — nothing to check.');
  process.exit(1);
}

results.sort((a, b) => b.kb - a.kb);

const width = Math.max(...results.map((r) => r.route.length), 'Route'.length);
console.log(`\nFirst Load JS (gzipped) — budget ${BUDGET_KB} KB\n`);
console.log(`  ${'Route'.padEnd(width)}   ${'Size'.padStart(10)}   Chunks`);
console.log(`  ${'-'.repeat(width)}   ${'-'.repeat(10)}   ------`);

for (const { route, kb, chunks } of results) {
  const flag = kb > BUDGET_KB ? '✗' : '✓';
  console.log(
    `${flag} ${route.padEnd(width)}   ${`${kb.toFixed(1)} KB`.padStart(10)}   ${chunks}`
  );
}

const worst = results[0];
const over = results.filter((r) => r.kb > BUDGET_KB);

console.log('');
if (over.length > 0) {
  console.error(
    `✗ BUDGET EXCEEDED — ${over.length} route(s) over ${BUDGET_KB} KB.\n` +
      `  Worst: ${worst.route} at ${worst.kb.toFixed(1)} KB (+${(worst.kb - BUDGET_KB).toFixed(1)} KB).\n` +
      `  Find the offender with: ANALYZE=true npm run build`
  );
  process.exit(1);
}

console.log(
  `✓ All ${results.length} route(s) within budget. ` +
    `Worst: ${worst.route} at ${worst.kb.toFixed(1)} KB ` +
    `(${(BUDGET_KB - worst.kb).toFixed(1)} KB headroom).`
);
