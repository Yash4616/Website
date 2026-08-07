import { siteConfig } from '@/data/config';

/**
 * Masthead — REBUILD.md §5. "Set as a spec-sheet header, not a hero. No image,
 * no CTA row, no scroll hint. Real content sits above the fold."
 *
 * Name in Archivo Expanded 700 via the width axis loaded in layout.tsx; every
 * other line mono, 11px, uppercase, `--ink-3`. One hairline.
 *
 * §8.3 — the availability line is here because the previous build never said
 * what Yash was looking for, and a recruiter who cannot tell whether you want a
 * 2027 new-grad role or freelance work moves on rather than guessing.
 *
 * The revision date is generated at build (§7/9), never hardcoded, so it cannot
 * claim a freshness the document does not have.
 */
export function Masthead() {
  const { name, role, institution, availability, revision } = siteConfig.masthead;

  const now = new Date();
  const iso = now.toISOString().slice(0, 10);
  const stamp = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  return (
    <header className="doc-grid pt-24">
      <div className="col-measure">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h1
            className="text-display uppercase"
            style={{ fontStretch: '125%', fontWeight: 700 }}
          >
            {name}
          </h1>
          <p className="label">
            {revision} ·{' '}
            <time dateTime={iso}>{stamp}</time>
          </p>
        </div>

        <hr className="rule-strong mt-6" />

        <div className="mt-4 flex flex-wrap justify-between gap-x-8 gap-y-1">
          <p className="label">{role}</p>
          <div className="text-right">
            <p className="label">{institution}</p>
            <p className="label mt-1 text-accent">{availability}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Masthead;
