import { siteConfig } from '@/data/config';
import { Masthead } from '@/components/document/masthead';
import { Summary } from '@/components/document/summary';
import { Section } from '@/components/document/section';
import { NotesList } from '@/components/document/notes';
import { MarginToc } from '@/components/document/margin-toc';
import { PageFrame } from '@/components/document/page-frame';

/**
 * The document shell — REBUILD.md §11, Stage 2.
 *
 * Section bodies are deliberately empty: 01 lands in Stage 3, 02 and 03 in
 * Stage 5, 04 in Stage 6, 05 in Stage 7. What ships here is the structure —
 * masthead, summary, margin TOC, the section-header pattern, the note system,
 * and the collected notes.
 *
 * A Server Component. `MarginToc` is the only client leaf on the page, and it
 * exists to track one integer.
 */
export default function Home() {
  return (
    <>
      <PageFrame />
      <MarginToc sections={siteConfig.sections} />

      <main id="main" className="relative pb-32">
        {/* §2.4/3 — the measurement grid, at 3% opacity. Structure you register
            without consciously seeing it. */}
        <div className="measure-grid" aria-hidden="true">
          <span style={{ left: '12%' }} />
          <span style={{ left: '30%' }} />
          <span style={{ left: '50%' }} />
          <span style={{ left: '70%' }} />
          <span style={{ left: '88%' }} />
        </div>

        <Masthead />
        <Summary />

        {siteConfig.sections.map((section) => (
          <Section key={section.id} section={section} />
        ))}

        <NotesList />
      </main>
    </>
  );
}
