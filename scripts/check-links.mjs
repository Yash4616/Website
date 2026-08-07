/**
 * Build-time link checker — REBUILD.md §8.8, and part of the §11 gate.
 *
 * "A dead GitHub link on a portfolio is a small disaster and completely
 *  preventable. Add a script that resolves every URL in config.ts and fails the
 *  build on a non-200."
 *
 * Reads the URLs out of the config source rather than importing it, so the
 * check has no TypeScript/bundler dependency and runs standalone in CI.
 *
 * HEAD first, falling back to GET — some hosts (GitHub among them) answer HEAD
 * with 403 or 405 while serving GET fine, and failing the build on that would
 * be a false alarm that teaches everyone to ignore the check.
 */
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG = join(ROOT, 'src', 'data', 'config.ts');
const TIMEOUT_MS = 15000;

const source = await readFile(CONFIG, 'utf8');

// Resolve the template-literal repository URLs by substituting the constants.
const ghMatch = /const GH = '([^']+)'/.exec(source);
const siteMatch = /const SITE_URL = '([^']+)'/.exec(source);
const GH = ghMatch?.[1] ?? '';
const SITE_URL = siteMatch?.[1] ?? '';

const urls = new Set();

for (const [, raw] of source.matchAll(/'(https?:\/\/[^']+)'/g)) urls.add(raw);
for (const [, path] of source.matchAll(/`\$\{GH\}(\/[^`]*)`/g)) urls.add(GH + path);
if (SITE_URL) urls.add(SITE_URL);
if (GH) urls.add(GH);

const list = [...urls].sort();
if (list.length === 0) {
  console.error('✗ No URLs found in config.ts — the checker is not reading it correctly.');
  process.exit(1);
}

async function attempt(url) {
  for (const method of ['HEAD', 'GET']) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'yash.systems link-checker' },
      });
      clearTimeout(timer);
      if (res.ok) return { ok: true, status: res.status, method };
      // Retry with GET when HEAD is refused rather than genuinely missing.
      if (method === 'HEAD' && [403, 405, 501].includes(res.status)) continue;
      return { ok: false, status: res.status, method };
    } catch (error) {
      clearTimeout(timer);
      if (method === 'GET') return { ok: false, status: String(error.name || error), method };
    }
  }
  return { ok: false, status: 'unreachable', method: 'GET' };
}

/**
 * Retry once on a network-level failure. Firing every URL at once made GitHub
 * time out the profile page, and a gate that fails at random is a gate everyone
 * learns to ignore. A genuine 404 returns a status and is not retried.
 */
async function probe(url) {
  const first = await attempt(url);
  if (first.ok || typeof first.status === 'number') return first;
  await new Promise((r) => setTimeout(r, 1000));
  return attempt(url);
}

/** Bounded concurrency, for the same reason. */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await fn(items[index]);
      }
    })
  );
  return results;
}

console.log(`Checking ${list.length} URLs from src/data/config.ts\n`);

const results = await mapLimit(list, 4, async (url) => ({ url, ...(await probe(url)) }));

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? '✓' : '✗'} ${String(r.status).padEnd(12)} ${r.url}`);
}

console.log('');
if (failed > 0) {
  console.error(`✗ ${failed} of ${results.length} URLs did not resolve.`);
  process.exit(1);
}
console.log(`✓ All ${results.length} URLs resolve.`);
