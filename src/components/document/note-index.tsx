import Link from 'next/link';
import type { NoteDocument } from '@/lib/notes';

export function NoteIndex({ notes }: { notes: NoteDocument[] }) {
  if (notes.length === 0) return null;
  return (
    <div className="col-measure mt-8">
      <ol className="border-t border-rule">
        {notes.map((note, index) => (
          <li key={note.slug} className="border-b border-rule py-5">
            <article>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h3 className="text-heading">
                  <Link href={`/notes/${note.slug}`}>{note.title}</Link>
                </h3>
                <p className="label">[{String(index + 1).padStart(2, '0')}] · {note.status}</p>
              </div>
              <p className="mt-2 max-w-[60ch] text-note text-ink-2">{note.description}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default NoteIndex;
