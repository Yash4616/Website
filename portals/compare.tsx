"use client";

import { useEffect, useRef, useState } from "react";
import type { CompareBenchData } from "@/content/site";
import { fmt } from "@/content/format";
import { springTo } from "./springs";

/**
 * Comparison bench: groups of recorded values, each drawn as bars on the
 * group's own axis. Switching groups springs every bar up from the axis.
 * When an axis does not start at zero, the caption says where it starts.
 */
export function CompareBench({ bench }: { bench: CompareBenchData }) {
  const [sel, setSel] = useState(0);
  const group = bench.groups[sel];
  const fills = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const span = group.ceiling - group.floor;
    const targets = group.bars.map((b) => Math.min(1, Math.max(0, (b.value - group.floor) / span)));
    const springs = targets.map(() => ({ x: 0, v: 0 }));
    return springTo(springs, targets, (values) => {
      values.forEach((v, i) => {
        const el = fills.current[i];
        if (el) el.style.transform = `scaleX(${Math.max(0, v)})`;
      });
    });
  }, [group]);

  return (
    <div className="cmp">
      {bench.groups.length > 1 ? (
        <div className="switches" role="radiogroup" aria-label="Measurement">
          {bench.groups.map((g, i) => (
            <button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={i === sel}
              tabIndex={i === sel ? 0 : -1}
              onClick={() => setSel(i)}
              onKeyDown={(e) => {
                if (e.key.startsWith("Arrow")) {
                  e.preventDefault();
                  const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
                  const next = (sel + d + bench.groups.length) % bench.groups.length;
                  setSel(next);
                  (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
                }
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="cmp-rows" role="table" aria-label={`${group.label}. ${group.caption}`} key={group.id}>
        {group.bars.map((b, i) => (
          <div className="cmp-row" role="row" key={b.label} data-emphasis={b.emphasis ? "" : undefined}>
            <span className="cmp-label" role="rowheader">
              {b.label}
            </span>
            <span className="cmp-track" aria-hidden="true">
              <span
                className="cmp-fill"
                ref={(el) => {
                  fills.current[i] = el;
                }}
              />
            </span>
            <span className="cmp-value" role="cell">
              {fmt(b.value, group.decimals)}
              {group.suffix}
            </span>
          </div>
        ))}
      </div>
      <p className="bench-caption">{group.caption}</p>
    </div>
  );
}
