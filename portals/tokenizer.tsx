"use client";

import type { TokenizerBenchData } from "@/content/site";
import { fmt } from "@/content/format";
import { Kinetic } from "@/views/field/Kinetic";
import { COMPRESSION_PAD } from "./config";

/**
 * Compression bench: bytes per token against o200k_base for each language,
 * drawn from a rule at 1.00x. Bars that fall short of the rule, Hindi and
 * Arabic, are drawn on the other side of it, at the same weight.
 */
export function TokenizerBench({ bench }: { bench: TokenizerBenchData }) {
  const ratios = bench.languages.map((l) => l.ratio);
  const lo = Math.min(...ratios, bench.baseline) - COMPRESSION_PAD;
  const hi = Math.max(...ratios, bench.baseline) + COMPRESSION_PAD;
  const x = (v: number) => ((v - lo) / (hi - lo)) * 100;
  const base = x(bench.baseline);
  const groups = [
    { id: "code", label: "Code", rows: bench.languages.filter((l) => l.group === "code") },
    { id: "text", label: "Natural language and maths", rows: bench.languages.filter((l) => l.group === "text") },
  ];
  const below = bench.languages.filter((l) => l.ratio < bench.baseline);

  return (
    <div className="tok">
      <p className="bench-caption">{bench.axisNote}</p>
      <div className="tok-chart">
        <div className="tok-rule" style={{ left: `calc(var(--tok-label) + (100% - var(--tok-label) - var(--tok-value)) * ${base / 100})` }}>
          <span>{bench.baselineLabel}</span>
        </div>
        {groups.map((g) => (
          <div key={g.id} className="tok-group" role="list" aria-label={g.label}>
            <p className="tok-group-label">{g.label}</p>
            {g.rows.map((l) => {
              const v = x(l.ratio);
              const short = l.ratio < bench.baseline;
              return (
                <div key={l.name} className="tok-row" role="listitem" data-short={short ? "" : undefined}>
                  <span className="tok-name">{l.name}</span>
                  <span className="tok-track">
                    <span
                      className="tok-bar"
                      style={{ left: `${Math.min(v, base)}%`, width: `${Math.abs(v - base)}%` }}
                    />
                  </span>
                  <span className="tok-value">{fmt(l.ratio, bench.decimals)}x</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="bench-caption">
        Short of the rule: {below.map((l) => `${l.name} ${fmt(l.ratio, bench.decimals)}x`).join(", ")}.
      </p>

      <div className="tok-sample">
        <Kinetic as="p" pieces={bench.sample} showBoundaries className="tok-sentence" />
        <p className="bench-caption">
          {bench.sample.length} pieces. {bench.sampleNote}
        </p>
      </div>
    </div>
  );
}
