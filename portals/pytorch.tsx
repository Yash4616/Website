"use client";

import { useEffect, useRef, useState } from "react";
import type { Pr, PytorchBenchData } from "@/content/site";
import { springTo } from "./springs";

/* Class diagram geometry, in SVG units. Before (t = 0) and after (t = 1). */
const W = 540;
const H = 300;
const BOX_W = 204;
const BOX_H = 34;
const FIELD_H = 20;
const LAYOUT = {
  base: { before: [168, 20], after: [168, 20] },
  fn: { before: [168, 122], after: [24, 214] },
  method: { before: [168, 224], after: [312, 122] },
} as const;

type Box = { x: number; y: number; w: number; h: number };

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function place(key: keyof typeof LAYOUT, t: number, extra = 0): Box {
  const l = LAYOUT[key];
  return { x: lerp(l.before[0], l.after[0], t), y: lerp(l.before[1], l.after[1], t), w: BOX_W, h: BOX_H + extra };
}

/** Arrow from the top-centre of `from` to the bottom-centre of `to`. */
function link(from: Box, to: Box): { x1: number; y1: number; x2: number; y2: number } {
  return { x1: from.x + from.w / 2, y1: from.y, x2: to.x + to.w / 2, y2: to.y + to.h };
}

/**
 * Diff bench: Dynamo's method variable before and after PR #193593. Before,
 * it subclassed the function variable. After, it inherits the base and
 * composes its function, as CPython's bound method does.
 */
export function PytorchBench({ bench, prs }: { bench: PytorchBenchData; prs: Pr[] }) {
  const [after, setAfter] = useState(true);
  const [t, setT] = useState(1);
  const spring = useRef([{ x: 1, v: 0 }]);

  useEffect(() => springTo(spring.current, [after ? 1 : 0], ([v]) => setT(v)), [after]);

  const tc = Math.min(1, Math.max(0, t));
  const fieldsH = FIELD_H * bench.fields.length * tc;
  const base = place("base", tc);
  const fn = place("fn", tc);
  const method = place("method", tc, fieldsH);
  const sub = link(method, fn);
  const inherit = link(method, base);
  const fnUp = link(fn, base);
  // Composition: from the side of the method box to the function box.
  const comp = {
    x1: method.x,
    y1: method.y + BOX_H + fieldsH / 2,
    x2: fn.x + fn.w,
    y2: fn.y + fn.h / 2,
  };

  return (
    <div className="diff">
      <div className="switches" role="radiogroup" aria-label="Class structure">
        {[false, true].map((v) => (
          <button
            key={String(v)}
            type="button"
            role="radio"
            aria-checked={after === v}
            tabIndex={after === v ? 0 : -1}
            onClick={() => setAfter(v)}
            onKeyDown={(e) => {
              if (e.key.startsWith("Arrow")) {
                e.preventDefault();
                setAfter(!after);
                (e.currentTarget.parentElement?.children[after ? 0 : 1] as HTMLElement | undefined)?.focus();
              }
            }}
          >
            {v ? bench.afterLabel : bench.beforeLabel}
          </button>
        ))}
      </div>

      <svg className="uml" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={after ? bench.afterNote : bench.beforeNote}>
        <defs>
          <marker id="tri" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto-start-reverse">
            <path d="M1 1 L11 6 L1 11 Z" className="uml-tri" />
          </marker>
          <marker id="dia" viewBox="0 0 16 10" refX="1" refY="5" markerWidth="16" markerHeight="10" orient="auto-start-reverse">
            <path d="M1 5 L8 1 L15 5 L8 9 Z" className="uml-dia" />
          </marker>
        </defs>

        <line {...fnUp} className="uml-edge" markerEnd="url(#tri)" />
        <g opacity={1 - tc}>
          <line {...sub} className="uml-edge" markerEnd="url(#tri)" />
          <text x={(sub.x1 + sub.x2) / 2 + 8} y={(sub.y1 + sub.y2) / 2 + 4} className="uml-note">
            {bench.subclassLabel}
          </text>
        </g>
        <g opacity={tc}>
          <polyline
            points={`${inherit.x1},${inherit.y1} ${inherit.x1},${inherit.y2 + 30} ${inherit.x2 + 40},${inherit.y2 + 30} ${inherit.x2 + 40},${inherit.y2}`}
            className="uml-edge"
            fill="none"
            markerEnd="url(#tri)"
          />
          <text x={inherit.x1 + 8} y={inherit.y2 + 24} className="uml-note">
            {bench.inheritLabel}
          </text>
          <polyline
            points={`${comp.x1},${comp.y1} ${comp.x1 - 30},${comp.y1} ${comp.x1 - 30},${comp.y2} ${comp.x2},${comp.y2}`}
            className="uml-edge"
            fill="none"
            markerStart="url(#dia)"
          />
          <text x={comp.x2 + 8} y={comp.y2 + 20} className="uml-note">
            {bench.composeLabel} {bench.fields[0]}
          </text>
          <text x={method.x + method.w} y={method.y + method.h + 18} textAnchor="end" className="uml-note">
            mirrors {bench.cpython}
          </text>
        </g>

        {[
          { b: base, label: bench.base, key: "base" },
          { b: fn, label: bench.fn, key: "fn" },
          { b: method, label: bench.method, key: "method" },
        ].map(({ b, label, key }) => (
          <g key={key} className={key === "method" ? "uml-box focus" : "uml-box"}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={2} />
            <text x={b.x + 12} y={b.y + 22}>
              {label}
            </text>
            {key === "method" && tc > 0.02 ? (
              <g opacity={tc}>
                <line x1={b.x} x2={b.x + b.w} y1={b.y + BOX_H} y2={b.y + BOX_H} className="uml-div" />
                {bench.fields.map((f, i) => (
                  <text key={f} x={b.x + 12} y={b.y + BOX_H + FIELD_H * (i + 1) - 6} className="uml-field">
                    {f}
                  </text>
                ))}
              </g>
            ) : null}
          </g>
        ))}
      </svg>
      <p className="bench-caption">{after ? bench.afterNote : bench.beforeNote}</p>

      <ul className="prs-cards">
        {prs.map((pr) => (
          <li key={pr.number} data-status={pr.status}>
            <p className="pr-card-head">
              {pr.href ? (
                <a href={pr.href} rel="noopener" target="_blank">
                  {pr.number}
                </a>
              ) : (
                <span>{pr.number}</span>
              )}
              <span className="area">{pr.area}</span>
              <span className="status" data-status={pr.status}>
                {pr.statusNote}
              </span>
            </p>
            <p className="pr-card-title">{pr.title}</p>
            {pr.detail ? <p className="pr-card-detail">{pr.detail}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
