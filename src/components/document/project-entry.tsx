import Link from 'next/link';
import { type ProjectEntry as ProjectEntryType } from '@/types';
import { DocumentFigure } from '@/components/document/figures';

/**
 * A project is an article in the document, deliberately not a card. The row
 * order, source text, metrics, and limitations all come from config.ts.
 */
export function ProjectEntry({
  project,
  index,
  figureStart,
  showFigures = true,
}: {
  project: ProjectEntryType;
  index: number;
  figureStart: number;
  showFigures?: boolean;
}) {
  return (
    <article aria-labelledby={`${project.id}-title`} className="col-wide py-10 first:pt-2">
      <header className="border-b border-rule pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-data text-accent" aria-hidden="true">
              [{index}]
            </span>
            <h3 id={`${project.id}-title`} className="text-heading uppercase">
              {project.name}
            </h3>
          </div>
          <p className="label">{project.languages.join(' · ')}</p>
        </div>
      </header>

      <div className="max-w-[68ch] pt-5">
        <p>{project.summary}</p>
      </div>

      <table className="spec-table mt-7" aria-label={`${project.name} technical specification`}>
        <tbody>
          {project.spec.map((row) => (
            <tr key={row.label}>
              <td className="spec-key">{row.label}</td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showFigures
        ? project.figures.map((figure, figureIndex) => (
            <DocumentFigure
              key={`${project.id}-${figure.kind}-${figureIndex}`}
              figure={figure}
              number={figureStart + figureIndex}
            />
          ))
        : null}

      {project.limitations ? (
        <div className="mt-7 border-l border-rule-strong pl-4">
          <h4 className="label text-accent">Limitations</h4>
          <p className="mt-2 text-note text-ink-2">{project.limitations}</p>
        </div>
      ) : null}

      <nav aria-label={`${project.name} links`} className="mt-7 flex flex-wrap gap-x-6 gap-y-3 font-mono text-data uppercase tracking-[0.08em]">
        <Link href={`/projects/${project.id}`}>→ Case study</Link>
        <a href={project.links.repository} target="_blank" rel="noreferrer">
          → Repository
        </a>
        {project.links.demo ? (
          <a href={project.links.demo} target="_blank" rel="noreferrer">
            → Live document
          </a>
        ) : null}
      </nav>
    </article>
  );
}

export default ProjectEntry;
