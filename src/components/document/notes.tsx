import { siteConfig } from '@/data/config';

/**
 * The note system — REBUILD.md §5 (Notes & References), §7/4 (sidenotes).
 *
 * ── One record, two surfaces ─────────────────────────────────────────────────
 * A note is authored once in `config.ts`. `<NoteRef>` places the superscript
 * numeral in the text, `<MarginNote>` renders the body in the outer track, and
 * `<NotesList>` collects every note at the foot of the document with links back
 * to their references.
 *
 * Numbering is the array index. That is deliberate: a CSS counter renders a
 * numeral that is not in the DOM, so it cannot be linked to or announced, and a
 * render-time counter cannot be shared across a React server tree. Indexing the
 * config gives the same number in the margin, in the text, and in the collected
 * list, with no JavaScript and no counter state.
 *
 * ── Accessibility ────────────────────────────────────────────────────────────
 * The reference is a real anchor to the collected note, and the collected note
 * links back — so a screen-reader user can follow a note and return, which is
 * what `role="doc-noteref"` promises. §10 also requires sidenotes to be readable
 * in source order; `<MarginNote>` sits immediately after the paragraph it
 * annotates in the DOM, and the grid moves it right visually only.
 */

function noteIndex(id: string): number {
  const index = siteConfig.notes.findIndex((note) => note.id === id);
  if (index === -1) {
    // Fail loudly at build. A dangling note reference would otherwise ship as a
    // superscript pointing at nothing.
    throw new Error(
      `Unknown note id "${id}". Add it to siteConfig.notes or fix the reference.`
    );
  }
  return index;
}

/** The superscript numeral in the running text. */
export function NoteRef({ id }: { id: string }) {
  const number = noteIndex(id) + 1;
  return (
    <a
      id={`noteref-${id}`}
      href={`#note-${id}`}
      role="doc-noteref"
      aria-label={`Note ${number}`}
      className="note-ref"
    >
      {number}
    </a>
  );
}

/** The note body, in the outer track. Place directly after its paragraph. */
export function MarginNote({ id }: { id: string }) {
  const index = noteIndex(id);
  const note = siteConfig.notes[index];
  return (
    <aside className="col-sidenote" role="doc-footnote" aria-label={`Note ${index + 1}`}>
      <p className="text-note text-ink-2">
        <span className="note-num" aria-hidden="true">
          {index + 1}
        </span>
        {note.text}
      </p>
    </aside>
  );
}

/** Every note, collected at the foot of the document, each linking back. */
export function NotesList() {
  if (siteConfig.notes.length === 0) return null;

  return (
    <section aria-labelledby="notes-heading" className="doc-grid pt-20">
      <hr className="rule col-full mb-6" />
      <div className="col-margin">
        <span className="label">Notes</span>
      </div>
      <div className="col-measure">
        <h2 id="notes-heading" className="text-heading">
          Notes &amp; References
        </h2>
        <ol className="mt-5 space-y-4">
          {siteConfig.notes.map((note, index) => (
            <li key={note.id} id={`note-${note.id}`} className="flex gap-3 scroll-mt-8">
              <span
                className="shrink-0 font-mono text-data text-accent"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <p className="text-note text-ink-2">
                {note.text}{' '}
                <a
                  href={`#noteref-${note.id}`}
                  aria-label={`Back to note ${index + 1} reference`}
                  className="font-mono text-ink-3 no-underline hover:text-accent"
                >
                  ↩
                </a>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
