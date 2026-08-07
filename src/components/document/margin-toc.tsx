'use client';

import { useEffect, useState } from 'react';
import type { DocSection } from '@/types';

/**
 * Margin table of contents — REBUILD.md §7/2.
 *
 * "Persistent, IntersectionObserver-driven, accent-marks the current section.
 *  How a long document behaves."
 *
 * The only client component in the page shell, and it exists for one integer:
 * which section is current. Everything else about it is static markup, so the
 * JavaScript cost is an observer and a `useState`.
 *
 * ── Why a rootMargin instead of a threshold ─────────────────────────────────
 * Thresholds fire on how much of an element is visible, which behaves badly for
 * sections of wildly different heights — a short section can never reach 40%
 * visibility while a tall one is always over it. Instead this collapses the
 * viewport to a band near the top and marks whichever section occupies it,
 * which is what a reader actually perceives as "where I am".
 *
 * Hidden below `lg`, where the margin track collapses and there is nowhere for
 * it to live. It is `aria-hidden` there rather than unmounted, so the markup
 * stays identical between server and client.
 */
export function MarginToc({ sections }: { sections: DocSection[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      // A band across the upper third of the viewport.
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Sections" className="margin-toc">
      <ol>
        {sections.map((section) => {
          const isActive = activeId === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? 'true' : undefined}
                data-active={isActive ? '' : undefined}
              >
                <span aria-hidden="true">{section.mark}</span>
                <span>{section.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default MarginToc;
