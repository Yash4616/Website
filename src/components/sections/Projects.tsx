'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaGithub, FaStar, FaCodeBranch } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { siteConfig } from '@/data/config';
import type { Project, ProjectCategory } from '@/types';

/**
 * STAGE 1 SCOPE: rewired from the deleted src/data/projects.ts to siteConfig,
 * and updated for the new Project type. The visual treatment is still the old
 * one — Stage 6 replaces this wholesale with the tilt cards, the layoutId filter
 * pill, and the expanded model-card dialog.
 *
 * Two rules from the plan are already honoured here because they are data
 * correctness, not styling, and shipping them later would mean shipping wrong
 * numbers in the meantime:
 *   A13  — the star/fork row is hidden when both counts are 0.
 *   AP-11 — a project with no real screenshot gets a designed gradient
 *           placeholder showing its architecture, never stock art.
 */

/** Formatting rule, not content — category slugs are the source of truth. */
function categoryLabel(category: ProjectCategory): string {
  if (category === 'nlp') return 'NLP';
  return category
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function ProjectPreview({ project }: { project: Project }) {
  if (project.image) {
    // Explicit dimensions rather than `fill` (§9.4). `fill` measures its parent,
    // and with `content-visibility: auto` on off-screen sections (§9.3) that
    // parent has no laid-out height yet — which next/image reports as a
    // height-0 warning on every load.
    return (
      <Image
        src={project.image}
        alt={project.title}
        width={1737}
        height={1029}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
      />
    );
  }

  // AP-11 — designed placeholder, never a stock image.
  return (
    <div className="dot-grid flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-accent/10 via-transparent to-violet-accent/10 px-4">
      <span className="text-center font-mono text-sm text-content-secondary">
        {project.architecture ?? project.stack[0]}
      </span>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const showCounts = project.stars > 0 || project.forks > 0;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden">
        <ProjectPreview project={project} />
      </div>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold">
            <Link href={`/projects/${project.id}`} className="hover:text-cyan-accent">
              {project.title}
            </Link>
          </h3>
          <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
            {categoryLabel(project.category)}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
          {project.stack.length > 3 && (
            <Badge variant="outline">+{project.stack.length - 3}</Badge>
          )}
        </div>

        {/* D8 — renders only when the repo verifiably states numbers. */}
        {project.metrics ? (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-cyan-accent">
            {project.metrics.map((metric) => (
              <span key={metric.label}>
                ▸ {metric.label} {metric.value}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex justify-between pt-0">
        {/* A13 — hidden entirely at 0/0 rather than rendering "⭐ 0 🍴 0". */}
        {showCounts ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <FaStar className="h-4 w-4 fill-current" aria-hidden="true" />
              {project.stars}
            </span>
            <span className="flex items-center gap-1">
              <FaCodeBranch className="h-4 w-4 fill-current" aria-hidden="true" />
              {project.forks}
            </span>
          </div>
        ) : (
          <span />
        )}

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={project.links.github} target="_blank" rel="noopener noreferrer">
              <FaGithub className="mr-1 h-4 w-4" aria-hidden="true" />
              Code
            </Link>
          </Button>
          {project.links.demo ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={project.links.demo} target="_blank" rel="noopener noreferrer">
                <FiExternalLink className="mr-1 h-4 w-4" aria-hidden="true" />
                Demo
              </Link>
            </Button>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState<'all' | ProjectCategory>('all');

  const categories = useMemo(() => {
    const present = Array.from(
      new Set(siteConfig.projects.map((project) => project.category))
    );
    return [
      { id: 'all' as const, name: 'All Projects' },
      ...present.map((category) => ({ id: category, name: categoryLabel(category) })),
    ];
  }, []);

  const visibleProjects = useMemo(
    () =>
      activeCategory === 'all'
        ? siteConfig.projects
        : siteConfig.projects.filter((project) => project.category === activeCategory),
    [activeCategory]
  );

  return (
    <section id="projects" className="w-full bg-muted/30 py-16 md:py-24">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A showcase of my work in AI, machine learning, and web development
          </p>
        </div>

        <Tabs
          value={activeCategory}
          onValueChange={(value) => setActiveCategory(value as 'all' | ProjectCategory)}
          className="w-full"
        >
          <div className="mb-8 flex justify-center overflow-x-auto pb-2">
            <TabsList className="flex flex-wrap justify-center">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="whitespace-nowrap px-2.5 py-1.5 text-sm"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeCategory} className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Link
            href={siteConfig.social[0].href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg">
              <FaGithub className="mr-2 h-5 w-5" aria-hidden="true" />
              View All Projects on GitHub
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
