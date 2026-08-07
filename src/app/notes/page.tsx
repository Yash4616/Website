import type { Metadata } from 'next';
import { PageFrame } from '@/components/document/page-frame';
import { NoteIndex } from '@/components/document/note-index';
import { getNotes } from '@/lib/notes';

export const metadata: Metadata = {
  title: 'Notes — Yash Gurjar',
  description: 'Technical notes and writing by Yash Gurjar.',
};

export default async function NotesPage() {
  const notes = await getNotes();
  return (
    <>
      <PageFrame />
      <main id="main" className="relative pb-32">
        <header className="doc-grid pt-24">
          <div className="col-measure">
            <p className="label">04 / Notes</p>
            <h1 className="mt-3 text-title">Technical notes</h1>
          </div>
        </header>
        <section className="doc-grid pt-12" aria-label="Notes index"><NoteIndex notes={notes} /></section>
      </main>
    </>
  );
}
