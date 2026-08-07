import { mdxBlocks, type NoteDocument } from '@/lib/notes';

export function NoteArticle({ note }: { note: NoteDocument }) {
  const blocks = mdxBlocks(note.body);
  return (
    <article className="col-measure mt-8" aria-labelledby="note-title">
      <header className="border-b border-rule pb-6">
        <p className="label">Note · {note.status}</p>
        <h1 id="note-title" className="mt-3 text-title">{note.title}</h1>
        <p className="mt-3 text-note text-ink-2">
          <time dateTime={note.date}>{note.date}</time>
        </p>
      </header>
      <div className="note-prose pt-7">
        {blocks.map((block, index) => {
          if (block.kind === 'heading') return <h2 key={index}>{block.value}</h2>;
          if (block.kind === 'list') {
            const items = Array.isArray(block.value) ? block.value : [];
            return <ul key={index}>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
          }
          return <p key={index}>{block.value}</p>;
        })}
      </div>
    </article>
  );
}

export default NoteArticle;
