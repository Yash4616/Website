import { siteConfig } from '@/data/config';
import { Masthead } from '@/components/document/masthead';
import { Summary } from '@/components/document/summary';
import { Section } from '@/components/document/section';
import { NotesList } from '@/components/document/notes';
import { MarginToc } from '@/components/document/margin-toc';
import { PageFrame } from '@/components/document/page-frame';
import { SelectedWork } from '@/components/document/selected-work';
import { Methods } from '@/components/document/methods';
import { Background } from '@/components/document/background';
import { Contact } from '@/components/document/contact';
import { NoteIndex } from '@/components/document/note-index';
import { Colophon } from '@/components/document/colophon';
import { KeyboardNavigation } from '@/components/document/keyboard-navigation';
import { getNotes } from '@/lib/notes';

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
export default async function Home() {
  const noteDocuments = await getNotes();
  return (
    <>
      <PageFrame />
      <MarginToc sections={siteConfig.sections} />
      <KeyboardNavigation ids={siteConfig.sections.map((section) => section.id)} />

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

        {siteConfig.sections.map((section) => {
          let body: React.ReactNode = null;
          if (section.id === 'selected-work') body = <SelectedWork />;
          if (section.id === 'methods') body = <Methods />;
          if (section.id === 'background') body = <Background />;
          if (section.id === 'notes') body = <NoteIndex notes={noteDocuments} />;
          if (section.id === 'correspondence') body = <Contact />;
          return <Section key={section.id} section={section}>{body}</Section>;
        })}

        <NotesList />
        <Colophon />
      </main>
    </>
  );
}
