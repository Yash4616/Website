"use client";

import { useEffect, useRef } from "react";
import type { CodeneuronBenchData } from "@/content/site";
import { animate } from "@/lib/anim";
import { GRADING_SECONDS } from "./config";
import { whileVisible } from "./springs";

/* Geometry, in SVG units. */
const LOOP_W = 560;
const LOOP_H = 236;
const COL_X = [92, 280, 468];
const ROW_Y0 = 54;
const ROW_DY = 34;
const PIP = 7;
const PIP_GAP = 3;

const NET_W = 560;
const NET_H = 168;
const SVC = { internet: [46, 112], frontend: [176, 112], api: [312, 112], runner: [470, 112] } as const;
const SVC_W = 104;
const SVC_H = 34;

/** Which question fails the critique in this schematic, so the refine path shows. */
const FAILS = 2;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function ease(v: number): number {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
}

/**
 * Grading loop: five question tokens are drafted, critiqued against five
 * criteria and refined. Beside it, the three isolated services, with a
 * request from the internet stopped at the code runner's boundary.
 */
export function CodeneuronBench({ bench }: { bench: CodeneuronBenchData }) {
  const loopRef = useRef<SVGSVGElement>(null);
  const tokens = useRef<(SVGGElement | null)[]>([]);
  const pips = useRef<(SVGRectElement | null)[][]>([]);
  const netRef = useRef<SVGSVGElement>(null);
  const packetOk = useRef<SVGCircleElement>(null);
  const packetBad = useRef<SVGCircleElement>(null);
  const stopMark = useRef<SVGGElement>(null);

  const questions = Array.from({ length: bench.questions }, (_, i) => i);
  const criteria = Array.from({ length: bench.criteria }, (_, i) => i);

  /* The loop schematic, as a function of cycle phase p in [0, 1). */
  useEffect(() => {
    const svg = loopRef.current;
    if (!svg) return;
    const draw = (p: number) => {
      questions.forEach((q) => {
        const g = tokens.current[q];
        if (!g) return;
        const stagger = q * 0.025;
        const toCritique = ease((p - 0.1 - stagger) / 0.14);
        let x = COL_X[0] + (COL_X[1] - COL_X[0]) * toCritique;
        const fails = q === FAILS;
        if (fails) {
          const toRefine = ease((p - 0.5) / 0.1);
          const back = ease((p - 0.68) / 0.1);
          x += (COL_X[2] - COL_X[1]) * (toRefine - back);
        }
        const appear = clamp01((p - stagger) / 0.06);
        g.setAttribute("transform", `translate(${x.toFixed(1)} ${ROW_Y0 + q * ROW_DY})`);
        g.setAttribute("opacity", appear.toFixed(2));
        criteria.forEach((c) => {
          const pip = pips.current[q]?.[c];
          if (!pip) return;
          const first = p > 0.28 + c * 0.035 + stagger;
          const rechecked = p > 0.8 + c * 0.02;
          let state = first ? "pass" : "";
          if (fails && first && c === criteria.length - 2) state = "fail";
          if (fails && p > 0.5 && p < 0.8) state = "";
          if (fails && rechecked) state = "pass";
          pip.setAttribute("class", `pip ${state}`);
        });
      });
    };
    draw(0.97);
    return whileVisible(svg, () => {
      const t0 = performance.now();
      return animate((_, now) => {
        draw((((now - t0) / 1000) / GRADING_SECONDS) % 1);
        return true;
      });
    });
    // questions and criteria derive from bench
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bench]);

  /* Two packets: one passes through the API to the runner, one is stopped. */
  useEffect(() => {
    const svg = netRef.current;
    if (!svg) return;
    const okPath: [number, number][] = [SVC.internet, SVC.frontend, SVC.api, SVC.runner].map(([x, y]) => [x, y]);
    const boundaryX = SVC.runner[0] - SVC_W / 2 - 14;
    const draw = (p: number) => {
      const a = clamp01(p / 0.6);
      const seg = Math.min(okPath.length - 2, Math.floor(a * (okPath.length - 1)));
      const f = a * (okPath.length - 1) - seg;
      const [x0, y0] = okPath[seg];
      const [x1, y1] = okPath[seg + 1];
      packetOk.current?.setAttribute("cx", (x0 + (x1 - x0) * f).toFixed(1));
      packetOk.current?.setAttribute("cy", (y0 + (y1 - y0) * f).toFixed(1));
      packetOk.current?.setAttribute("opacity", p < 0.62 ? "1" : "0");
      const b = clamp01(p / 0.45);
      const bx = SVC.internet[0] + (boundaryX - SVC.internet[0]) * b;
      packetBad.current?.setAttribute("cx", bx.toFixed(1));
      packetBad.current?.setAttribute("cy", "40");
      packetBad.current?.setAttribute("opacity", p < 0.8 ? "1" : "0");
      stopMark.current?.setAttribute("opacity", p > 0.44 && p < 0.9 ? "1" : "0.25");
    };
    draw(0.5);
    return whileVisible(svg, () => {
      const t0 = performance.now();
      return animate((_, now) => {
        draw((((now - t0) / 1000) / (GRADING_SECONDS / 2)) % 1);
        return true;
      });
    });
  }, [bench]);

  const boundaryX = SVC.runner[0] - SVC_W / 2 - 14;

  return (
    <div className="grading">
      <svg
        ref={loopRef}
        className="loop"
        viewBox={`0 0 ${LOOP_W} ${LOOP_H}`}
        role="img"
        aria-label={bench.stages.map((s) => `${s.label}: ${s.note}`).join(" ")}
      >
        {bench.stages.map((s, i) => (
          <g key={s.id}>
            <text x={COL_X[i]} y={22} textAnchor="middle" className="col-label">
              {s.label}
            </text>
            <line x1={COL_X[i]} x2={COL_X[i]} y1={32} y2={LOOP_H - 8} className="col-rule" />
          </g>
        ))}
        {questions.map((q) => (
          <g
            key={q}
            ref={(el) => {
              tokens.current[q] = el;
            }}
            className="qtoken"
          >
            <rect x={-44} y={-12} width={88} height={24} rx={12} />
            <text x={-30} y={4}>
              Q{q + 1}
            </text>
            {criteria.map((c) => (
              <rect
                key={c}
                ref={(el) => {
                  if (!pips.current[q]) pips.current[q] = [];
                  pips.current[q][c] = el;
                }}
                x={-8 + c * (PIP + PIP_GAP)}
                y={-PIP / 2}
                width={PIP}
                height={PIP}
                className="pip"
              />
            ))}
          </g>
        ))}
      </svg>
      <ol className="loop-notes">
        {bench.stages.map((s) => (
          <li key={s.id}>
            <span>{s.label}</span>
            {s.note}
          </li>
        ))}
      </ol>
      <p className="bench-caption">
        Answers get {bench.attempts} graded attempts. {bench.loopNote}
      </p>

      <svg
        ref={netRef}
        className="net"
        viewBox={`0 0 ${NET_W} ${NET_H}`}
        role="img"
        aria-label={`${bench.services.map((s) => `${s.label}: ${s.note}`).join(" ")} ${bench.boundaryNote}`}
      >
        <rect
          x={boundaryX}
          y={20}
          width={NET_W - boundaryX - 6}
          height={NET_H - 34}
          className="boundary"
        />
        <line x1={SVC.internet[0]} y1={40} x2={boundaryX} y2={40} className="net-edge faint" />
        <g ref={stopMark} className="stop">
          <line x1={boundaryX - 7} y1={33} x2={boundaryX + 7} y2={47} />
          <line x1={boundaryX - 7} y1={47} x2={boundaryX + 7} y2={33} />
        </g>
        {[
          [SVC.internet, SVC.frontend],
          [SVC.frontend, SVC.api],
          [SVC.api, SVC.runner],
        ].map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="net-edge" />
        ))}
        <g className="svc ghost">
          <rect x={SVC.internet[0] - 36} y={SVC.internet[1] - SVC_H / 2} width={72} height={SVC_H} rx={2} />
          <text x={SVC.internet[0]} y={SVC.internet[1] + 4} textAnchor="middle">
            internet
          </text>
        </g>
        {bench.services.map((s) => {
          const [x, y] = SVC[s.id as keyof typeof SVC] ?? [0, 0];
          return (
            <g key={s.id} className="svc">
              <rect x={x - SVC_W / 2} y={y - SVC_H / 2} width={SVC_W} height={SVC_H} rx={2} />
              <text x={x} y={y + 4} textAnchor="middle">
                {s.label}
              </text>
            </g>
          );
        })}
        <circle ref={packetOk} r={4} className="packet" cx={SVC.internet[0]} cy={SVC.internet[1]} />
        <circle ref={packetBad} r={4} className="packet bad" cx={SVC.internet[0]} cy={40} />
      </svg>
      <dl className="svc-notes">
        {bench.services.map((s) => (
          <div key={s.id}>
            <dt>{s.label}</dt>
            <dd>{s.note}</dd>
          </div>
        ))}
      </dl>
      <p className="bench-caption">{bench.boundaryNote}</p>
      <p className="credit">{bench.credit}</p>
    </div>
  );
}
