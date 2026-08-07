import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageFrame } from '@/components/document/page-frame';
import { NoteArticle } from '@/components/document/note-article';
import { getNote, getNotes } from '@/lib/notes';
import { siteConfig } from '@/data/config';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getNotes()).map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const note = await getNote((await params).slug);
  if (!note) return {};
  return { title: `${note.title} — Yash Gurjar`, description: note.description, robots: note.status === 'draft' ? { index: false, follow: true } : undefined };
}

export default async function NotePage({ params }: PageProps) {
  const note = await getNote((await params).slug);
  if (!note) notFound();
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: note.title,
    description: note.description,
    datePublished: note.date,
    author: { '@type': 'Person', name: siteConfig.masthead.name, url: siteConfig.meta.url },
    mainEntityOfPage: `${siteConfig.meta.url}/notes/${note.slug}`,
  };
  return (
    <>
      <PageFrame />
      <main id="main" className="relative pb-32">
        <header className="doc-grid pt-24"><div className="col-measure"><Link href="/notes" className="label">← Notes</Link></div></header>
        <section className="doc-grid pt-8"><NoteArticle note={note} /></section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </>
  );
}
