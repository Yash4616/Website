import type { ModelCard as ModelCardData, Project } from '@/types';

/**
 * The HuggingFace-style model card (§8.1/S1).
 *
 * A4 — this is ONE component rendered on TWO surfaces: the Stage 6 expanded
 * dialog and the /projects/[slug] permalink page. Stage 6 adds the S2 training
 * curve sparklines and the S3 confusion matrix *here*, and both surfaces gain
 * them at once. Do not fork this into a second component.
 *
 * Every row branches on null. A field the repo never stated is omitted entirely
 * rather than rendered as "N/A" or backfilled with a plausible default (D8).
 *
 * On §5.1: the spec labels below are schema labels for the ModelCard type, not
 * content — they do not change when Yash adds a project, so they stay with the
 * component rather than bloating config.ts.
 */

interface SpecRow {
  label: string;
  value: string;
}

function buildSpecRows(card: ModelCardData): SpecRow[] {
  const rows: SpecRow[] = [{ label: 'Architecture', value: card.architecture }];

  if (card.params) rows.push({ label: 'Parameters', value: card.params });
  rows.push({ label: 'Dataset', value: card.dataset });
  if (card.hardware) rows.push({ label: 'Hardware', value: card.hardware });
  if (card.epochs !== null) rows.push({ label: 'Epochs', value: String(card.epochs) });
  if (card.optimizer) rows.push({ label: 'Optimizer', value: card.optimizer });
  if (card.augmentation.length > 0) {
    rows.push({ label: 'Augmentation', value: card.augmentation.join(' · ') });
  }

  return rows;
}

export function ModelCard({ project }: { project: Project }) {
  const card = project.modelCard;
  if (!card) return null;

  const specRows = buildSpecRows(card);

  return (
    <div className="flex flex-col gap-8">
      {/* Spec table */}
      <section aria-labelledby={`${project.id}-spec`}>
        <h3
          id={`${project.id}-spec`}
          className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-accent"
        >
          Specification
        </h3>
        <dl className="mt-4 divide-y divide-edge-subtle border-y border-edge-subtle">
          {specRows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[160px_1fr] sm:gap-4"
            >
              <dt className="font-mono text-xs uppercase tracking-wider text-content-muted">
                {row.label}
              </dt>
              <dd className="font-mono text-sm text-content-secondary">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Metrics */}
      <section aria-labelledby={`${project.id}-metrics`}>
        <h3
          id={`${project.id}-metrics`}
          className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-accent"
        >
          Results
        </h3>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {card.metrics.map((metric) => (
            <li
              key={metric.label}
              className="glass-solid flex flex-col gap-1 px-4 py-3"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-content-muted">
                {metric.label}
              </span>
              <span className="font-mono text-lg text-content-primary">
                {metric.value}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/*
        The limitations line is the whole point of a model card. Nobody fakes
        humility about their own work — which is exactly why it reads as real.
      */}
      <section aria-labelledby={`${project.id}-limitations`}>
        <h3
          id={`${project.id}-limitations`}
          className="font-mono text-xs uppercase tracking-[0.3em] text-amber-accent"
        >
          Limitations
        </h3>
        <p className="mt-4 border-l-2 border-amber-accent/40 pl-4 text-sm leading-relaxed text-content-secondary">
          {card.limitations}
        </p>
      </section>
    </div>
  );
}

export default ModelCard;
