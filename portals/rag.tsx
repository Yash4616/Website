"use client";

import { useEffect, useRef, useState } from "react";
import type { RagBenchData } from "@/content/site";
import { fmt } from "@/content/format";
import { animate } from "@/lib/anim";
import { PIPELINE_SECONDS } from "./config";
import { along, springTo, whileVisible } from "./springs";

/* Pipeline geometry, in SVG units. */
const W = 648;
const H = 150;
const NODE_W = 92;
const NODE_H = 30;
const POS: Record<string, [number, number]> = {
  query: [50, 75],
  dense: [162, 36],
  bm25: [162, 114],
  rrf: [278, 75],
  rerank: [386, 75],
  top5: [494, 75],
  answer: [598, 75],
};
const DIAL_R = 54;

/**
 * Retrieval bench: switch between the three configurations and watch the
 * recorded metrics move. Dense keeps the best R@1; hybrid + rerank wins R@5.
 */
export function RagBench({ bench }: { bench: RagBenchData }) {
  const shipped = Math.max(0, bench.configs.findIndex((c) => c.shipped));
  const [sel, setSel] = useState(shipped);
  const config = bench.configs[sel];
  const metrics = bench.metrics.filter((m) => m.onBench);
  // The shipped configuration is drawn first; springs carry every change after that.
  const initial = bench.configs[shipped];

  const fills = useRef<(HTMLDivElement | null)[]>([]);
  const springs = useRef(metrics.map((m) => ({ x: initial.retrieval[m.key], v: 0 })));
  const needle = useRef<SVGLineElement>(null);
  const needleSpring = useRef([{ x: refusalAngle(initial.generation), v: 0 }]);
  const pipeRef = useRef<SVGSVGElement>(null);
  const dots = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const targets = metrics.map((m) => config.retrieval[m.key]);
    return springTo(springs.current, targets, (values) => {
      values.forEach((v, i) => {
        const el = fills.current[i];
        if (el) el.style.transform = `scaleX(${v})`;
      });
    });
  }, [config, metrics]);

  useEffect(() => {
    const target = refusalAngle(config.generation);
    return springTo(needleSpring.current, [target], ([a]) => {
      needle.current?.setAttribute("transform", `rotate(${(a * 180).toFixed(2)} 0 0)`);
    });
  }, [config]);

  /* A query particle travels the stages this configuration uses. */
  const retrievers = config.stages.filter((s) => s === "dense" || s === "bm25");
  const rest = config.stages.filter((s) => s !== "dense" && s !== "bm25");
  const paths: [number, number][][] = retrievers.map((r) => {
    // A single retriever skips fusion and reranking: route above those stages.
    const bypass: [number, number][] =
      retrievers.length === 1 && rest[0] !== "rrf"
        ? [
            [POS.rrf[0], POS[r][1]],
            [POS.rerank[0], POS[r][1]],
          ]
        : [];
    return [POS.query, POS[r], ...bypass, ...rest.map((s) => POS[s])];
  });

  useEffect(() => {
    const svg = pipeRef.current;
    if (!svg) return;
    const pts = paths;
    return whileVisible(svg, () => {
      const t0 = performance.now();
      return animate((_, now) => {
        const t = ((now - t0) / 1000 / PIPELINE_SECONDS) % 1;
        pts.forEach((path, i) => {
          const dot = dots.current[i];
          if (!dot) return;
          const [x, y] = along(path, t);
          dot.setAttribute("cx", x.toFixed(1));
          dot.setAttribute("cy", y.toFixed(1));
          dot.setAttribute("opacity", t > 0.96 ? "0" : "1");
        });
        return true;
      });
    });
    // paths are derived from config
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const best = Object.fromEntries(
    metrics.map((m) => [
      m.key,
      bench.configs.reduce((b, c) => (c.retrieval[m.key] > b.retrieval[m.key] ? c : b)),
    ]),
  );
  const gen = config.generation;
  const segments = (gen ?? initial.generation)?.unanswerable ?? 0;
  const active = new Set(["query", ...config.stages]);
  const edges: [string, string][] = [
    ["query", "dense"],
    ["query", "bm25"],
    ["dense", "rrf"],
    ["bm25", "rrf"],
    ["rrf", "rerank"],
    ["rerank", "top5"],
    ["top5", "answer"],
  ];

  return (
    <div className="rag">
      <div className="switches" role="radiogroup" aria-label="Retrieval configuration">
        {bench.configs.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={i === sel}
            tabIndex={i === sel ? 0 : -1}
            onClick={() => setSel(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
                const next = (sel + d + bench.configs.length) % bench.configs.length;
                setSel(next);
                (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
              }
            }}
          >
            {c.label}
            {c.shipped ? <span className="shipped">shipped</span> : null}
          </button>
        ))}
      </div>

      <div className="bars" role="table" aria-label={`Retrieval metrics for ${config.label}, n = ${bench.n}`}>
        {metrics.map((m, i) => {
          const value = config.retrieval[m.key];
          const winner = best[m.key];
          const leads = winner.id === config.id;
          return (
            <div className="bar-row" role="row" key={m.key} data-leads={leads ? "" : undefined}>
              <span className="bar-label" role="rowheader">
                {m.label}
              </span>
              <span className="bar-track" role="cell" aria-label={fmt(value, bench.decimals)}>
                <span
                  className="bar-fill"
                  ref={(el) => {
                    fills.current[i] = el as HTMLDivElement | null;
                  }}
                  style={{ transform: `scaleX(${initial.retrieval[m.key]})` }}
                />
                <span
                  className="bar-best"
                  style={{ left: `${winner.retrieval[m.key] * 100}%` }}
                  title={`Best: ${winner.label}`}
                >
                  <span className="bar-best-label">
                    {leads ? "best" : `${winner.label} ${fmt(winner.retrieval[m.key], bench.decimals)}`}
                  </span>
                </span>
              </span>
              <span className="bar-value" role="cell">
                {fmt(value, bench.decimals)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="bench-caption">
        n = {bench.n}. {bench.topOneNote}
      </p>

      <div className="rag-lower">
        <figure className="dial">
          <svg viewBox={`${-DIAL_R - 8} ${-DIAL_R - 8} ${DIAL_R * 2 + 16} ${DIAL_R + 20}`} aria-hidden="true">
            {Array.from({ length: segments }, (_, i) => {
              const n = segments;
              const a0 = Math.PI + (Math.PI * i) / n + 0.04;
              const a1 = Math.PI + (Math.PI * (i + 1)) / n - 0.04;
              const lit = gen ? i < gen.refused : false;
              return (
                <path
                  key={i}
                  d={`M ${Math.cos(a0) * DIAL_R} ${Math.sin(a0) * DIAL_R} A ${DIAL_R} ${DIAL_R} 0 0 1 ${Math.cos(a1) * DIAL_R} ${Math.sin(a1) * DIAL_R}`}
                  className={lit ? "dial-seg lit" : "dial-seg"}
                />
              );
            })}
            <line
              ref={needle}
              x1={0}
              y1={0}
              x2={-DIAL_R + 10}
              y2={0}
              className="dial-needle"
              opacity={gen ? 1 : 0}
              transform={`rotate(${refusalAngle(initial.generation) * 180} 0 0)`}
            />
            <circle r={3} className="dial-hub" />
          </svg>
          <figcaption>
            <span className="dial-fig">{gen ? `${gen.refused}/${gen.unanswerable}` : "not measured"}</span>
            {bench.refusalLabel}
            {gen ? null : <span className="sub">{bench.refusalMissing}</span>}
          </figcaption>
        </figure>

        <dl className="gen">
          {bench.generationLabels.map((g) => (
            <div key={g.key}>
              <dt>{g.label}</dt>
              <dd>{gen ? fmt(gen[g.key], bench.decimals) : "not measured"}</dd>
            </div>
          ))}
        </dl>
      </div>

      <svg ref={pipeRef} className="pipeline" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Pipeline for ${config.label}: ${config.stages.map((s) => bench.stages.find((x) => x.id === s)?.label).join(", ")}`}>
        {edges.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={POS[a][0] + NODE_W / 2 - 4}
            y1={POS[a][1]}
            x2={POS[b][0] - NODE_W / 2 + 4}
            y2={POS[b][1]}
            className="pipe-edge"
          />
        ))}
        {paths.map((path, i) => (
          <polyline key={`p-${config.id}-${i}`} points={path.map((pt) => pt.join(",")).join(" ")} className="pipe-path" />
        ))}
        {Object.entries(POS).map(([id, [x, y]]) => {
          const label = id === "query" ? "query" : bench.stages.find((s) => s.id === id)?.label ?? id;
          return (
            <g key={id} className={active.has(id) ? "pipe-node on" : "pipe-node"}>
              <rect x={x - NODE_W / 2} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={2} />
              <text x={x} y={y + 4} textAnchor="middle">
                {label}
              </text>
            </g>
          );
        })}
        {paths.map((_, i) => (
          <circle
            key={`${config.id}-${i}`}
            r={4}
            className="pipe-dot"
            ref={(el) => {
              dots.current[i] = el;
            }}
            cx={POS.query[0]}
            cy={POS.query[1]}
          />
        ))}
      </svg>
    </div>
  );
}

/** Needle angle as a fraction of a half turn: refused over unanswerable. */
function refusalAngle(gen: RagBenchData["configs"][number]["generation"]): number {
  return gen ? gen.refused / gen.unanswerable : 0;
}
