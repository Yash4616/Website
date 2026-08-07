import { siteConfig } from '@/data/config';
import { NoteRef, MarginNote } from '@/components/document/notes';

/**
 * Summary — REBUILD.md §5.
 *
 * "Three or four sentences in first person, 18px, capped at 68ch. Not a bio —
 *  a positioning statement."
 *
 * §5 also says to write this last, once the document has told you what it
 * should say. The text in `config.ts` is a first pass and is flagged there for
 * rewriting at Stage 9.
 */
export function Summary() {
  return (
    <section aria-labelledby="summary-heading" className="doc-grid pt-12">
      <div className="col-margin">
        <h2 id="summary-heading" className="label">
          Summary
        </h2>
      </div>

      <div className="col-measure">
        {siteConfig.summary.map((paragraph, index) => (
          <p key={paragraph.slice(0, 24)} className={index === 0 ? '' : 'mt-4'}>
            {paragraph}
            {index === 0 ? <NoteRef id="measured-not-estimated" /> : null}
          </p>
        ))}
      </div>

      <MarginNote id="measured-not-estimated" />
    </section>
  );
}

export default Summary;
