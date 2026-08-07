import Link from 'next/link';
import { PageFrame } from '@/components/document/page-frame';

export default function NotFound() {
  return (
    <>
      <PageFrame />
      <main id="main" className="doc-grid min-h-screen pt-24">
        <section className="col-measure self-start border-t-2 border-rule-strong pt-6" aria-labelledby="not-found-title">
          <p className="section-mark">ERR. 404 /</p>
          <h1 id="not-found-title" className="mt-4 text-title">Record not found</h1>
          <p className="mt-4 max-w-[52ch] text-ink-2">The requested document does not exist at this address.</p>
          <Link href="/" className="mt-8 inline-block font-mono text-data uppercase tracking-[0.08em]">← Return to index</Link>
        </section>
      </main>
    </>
  );
}
