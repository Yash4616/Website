import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';
import { siteConfig, getProjectById } from '@/data/config';
import { ModelCard } from '@/components/features/model-card';

/**
 * Per-project permalink (A3).
 *
 * Kept — and rewired to config.ts — rather than deleted with the other duplicate
 * routes, because a per-project URL is shareable and gives real SEO surface for
 * the cost of one generateStaticParams. The `/about`, `/contact`, and `/projects`
 * index routes were removed; those genuinely duplicated the single-page anchors.
 *
 * A5 — this page also carries the `SoftwareSourceCode` half of §8.1/S5, which
 * comes free once the route exists. The `/llms.txt` half still lands in Stage 8.
 */

export function generateStaticParams() {
  return siteConfig.projects.map((project) => ({ slug: project.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectById(slug);

  if (!project) return { title: 'Project Not Found' };

  const url = `${siteConfig.meta.url}/projects/${project.id}`;

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: project.title,
      description: project.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectById(slug);

  if (!project) notFound();

  // §8.1/S5 — a SoftwareSourceCode node per project, so an agent reading this
  // page gets the curated version instead of scraping animated DOM.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.title,
    description: project.description,
    codeRepository: project.links.github,
    url: `${siteConfig.meta.url}/projects/${project.id}`,
    ...(project.language ? { programmingLanguage: project.language } : {}),
    ...(project.architecture ? { about: project.architecture } : {}),
    keywords: project.tags.join(', '),
    author: {
      '@type': 'Person',
      name: siteConfig.hero.name,
      url: siteConfig.meta.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="px-6 pb-24 pt-28 md:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-content-muted transition-colors hover:text-cyan-accent"
          >
            <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to projects
          </Link>

          <header className="mt-10">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-accent">
              {project.category.replace(/-/g, ' ')}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-content-primary md:text-5xl">
              {project.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-content-secondary">
              {project.description}
            </p>
          </header>

          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technology stack">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-edge px-3 py-1 font-mono text-xs text-content-secondary"
              >
                {tech}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-cyan-accent px-6 py-3 text-sm text-content-primary transition-all hover:bg-cyan-accent/10 hover:shadow-glow-cyan"
            >
              <FaGithub className="h-4 w-4" aria-hidden="true" />
              View code
            </Link>
            {project.links.demo ? (
              <Link
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-edge bg-white/5 px-6 py-3 text-sm text-content-primary transition-colors hover:border-edge-hover"
              >
                <FiExternalLink className="h-4 w-4" aria-hidden="true" />
                Live demo
              </Link>
            ) : null}
          </div>

          {project.modelCard ? (
            <div className="mt-16">
              <ModelCard project={project} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
