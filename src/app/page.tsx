import Link from 'next/link';
import { siteConfig } from '@/data/config';

/**
 * Placeholder. The document — masthead, summary, margin TOC, numbered sections
 * — is Stage 2 (REBUILD.md §11). Stage 1 delivers the design system, the ported
 * and validated data, and the specimen at /specimen for approval.
 *
 * Deliberately not a preview of the design, so nothing here has to be un-built.
 */
export default function Home() {
  return (
    <main id="main" className="doc-grid min-h-screen items-center py-24">
      <div className="col-measure">
        <p className="label">yash.systems · {siteConfig.masthead.revision}</p>
        <h1 className="mt-4 text-title">{siteConfig.masthead.name}</h1>
        <p className="mt-1 font-mono text-data text-ink-3">{siteConfig.masthead.role}</p>
        <hr className="rule-strong my-6" />
        <p className="max-w-[60ch] text-body text-ink-2">
          This document is being rebuilt. Stage 1 — fonts, colour tokens, three-track grid,
          grain, registration marks, and validated content — is complete and awaiting review.
        </p>
        <p className="mt-6 font-mono text-data">
          <Link href="/specimen">→ Typographic specimen</Link>
        </p>
      </div>
    </main>
  );
}
