import type { DocSection } from '@/types';

/**
 * The section-header pattern — REBUILD.md §2.2, §2.3, §5.
 *
 *   01 /  │  SELECTED WORK
 *   ──────┴──────────────────────────────────
 *
 * The mark sits in the left margin track in mono accent; the title in the
 * measure. A 2px `--rule-strong` divider opens each section — the one deliberate
 * exception to "no borders thicker than 1px" (§2.3).
 *
 * Server component. Ships no JavaScript.
 */
export function Section({
  section,
  children,
}: {
  section: DocSection;
  children?: React.ReactNode;
}) {
  const headingId = `${section.id}-heading`;

  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      className="doc-grid scroll-mt-12 pt-24"
    >
      <hr className="rule-strong section-rule col-full mb-6" />

      <div className="col-margin">
        {/* Decorative apparatus. The heading carries the accessible name —
            "01 slash" read before every title is noise. */}
        <span className="section-mark" aria-hidden="true">
          {section.mark} /
        </span>
      </div>

      <h2 id={headingId} className="section-heading col-measure text-title uppercase tracking-[-0.01em]">
        <span>{section.title}</span>
      </h2>

      {children}
    </section>
  );
}

export default Section;
