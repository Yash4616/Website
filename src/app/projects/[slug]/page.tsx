import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectById, orderedProjects, siteConfig } from '@/data/config';
import { ProjectEntry } from '@/components/document/project-entry';
import { PageFrame } from '@/components/document/page-frame';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return siteConfig.projects.map((project) => ({ slug: project.id }));
}

function figureNumberFor(id: string) {
  let number = 1;
  for (const project of orderedProjects) {
    if (project.id === id) return number;
    number += project.figures.length;
  }
  return number;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectById(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Yash Gurjar`,
    description: project.summary,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      type: 'article',
      images: [{ url: `/projects/${project.id}/opengraph-image` }],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectById(slug);
  if (!project) notFound();
  const entryIndex = orderedProjects.findIndex((entry) => entry.id === project.id) + 1;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.title,
    description: project.summary,
    codeRepository: project.links.repository,
    programmingLanguage: project.languages,
    author: { '@type': 'Person', name: siteConfig.masthead.name, url: siteConfig.meta.url },
  };

  return (
    <>
      <PageFrame />
      <main id="main" className="relative pb-32">
        <header className="doc-grid pt-24">
          <div className="col-measure">
            <Link href="/#selected-work" className="label">← Selected work</Link>
            <h1 className="mt-8 text-title">{project.title}</h1>
          </div>
        </header>
        <section className="doc-grid pt-10" aria-labelledby={`${project.id}-detail-heading`}>
          <hr className="rule-strong col-full mb-6" />
          <div className="col-margin"><span className="section-mark">{String(entryIndex).padStart(2, '0')} /</span></div>
          <h2 id={`${project.id}-detail-heading`} className="col-measure text-heading uppercase">Technical record</h2>
          <ProjectEntry project={project} index={entryIndex} figureStart={figureNumberFor(project.id)} />
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </>
  );
}
