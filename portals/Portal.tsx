"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Instrument, Reading, Site } from "@/content/site";
import { fmt, readingText, tablesFor } from "@/content/format";
import { CompetitionList } from "@/components/CompetitionList";
import { animate, easeOutCubic, reducedMotion } from "@/lib/anim";
import { portalToBriefRow, scrollToBriefRow } from "@/lib/nav";
import { setView } from "@/lib/view";
import { Kinetic } from "@/views/field/Kinetic";
import { PORTAL } from "./config";
import { AristaBench } from "./arista";
import { CodeneuronBench } from "./codeneuron";
import { CompareBench } from "./compare";
import { PytorchBench } from "./pytorch";
import { RagBench } from "./rag";
import { TokenizerBench } from "./tokenizer";
import "./portal.css";

type Props = { site: Site; node: Instrument; onClose: () => void };

/**
 * A portal: one instrument on its own bench. The anatomy is the same for
 * every project: the reading, the story in four beats, one interactive
 * bench, and the specification.
 */
export default function Portal({ site, node, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  const beats = [
    { label: site.labels.beats.problem, text: node.story.problem },
    { label: site.labels.beats.approach, text: node.story.approach },
    { label: site.labels.beats.result, text: node.story.result },
    { label: site.labels.beats.limitation, text: node.limitation },
  ];
  const step = useCallback((delta: number) => {
    setBeat((b) => Math.min(beats.length - 1, Math.max(0, b + delta)));
  }, [beats.length]);

  useEffect(() => {
    headingRef.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
  }, []);

  /* Arrow keys step the story, unless a control that uses arrows has focus. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, [role="radiogroup"], [role="tablist"]')) return;
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  /* Touch: pull the sheet down to close it, or pinch in to step back out. */
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const touches = new Map<number, { x: number; y: number }>();
    let startY = 0;
    let pulling = false;
    let pinchStart = 0;
    const span = () => {
      const [a, b] = [...touches.values()];
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 1) {
        startY = e.clientY;
        pulling = sheet.scrollTop <= 0;
      } else if (touches.size === 2) {
        pulling = false;
        sheet.style.transform = "";
        pinchStart = span();
      }
    };
    const move = (e: PointerEvent) => {
      if (!touches.has(e.pointerId)) return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2 && pinchStart > 0 && span() / pinchStart < PORTAL.pinchClose) {
        pinchStart = 0;
        onClose();
        return;
      }
      if (pulling && touches.size === 1) {
        const dy = e.clientY - startY;
        if (dy > 0 && sheet.scrollTop <= 0) sheet.style.transform = `translateY(${dy * 0.6}px)`;
        else if (dy < 0) pulling = false;
      }
    };
    const up = (e: PointerEvent) => {
      if (!touches.has(e.pointerId)) return;
      touches.delete(e.pointerId);
      if (pulling && e.clientY - startY > PORTAL.swipeClose) {
        pulling = false;
        onClose();
        return;
      }
      pulling = false;
      sheet.style.transform = "";
    };
    sheet.addEventListener("pointerdown", down);
    sheet.addEventListener("pointermove", move);
    sheet.addEventListener("pointerup", up);
    sheet.addEventListener("pointercancel", up);
    return () => {
      sheet.removeEventListener("pointerdown", down);
      sheet.removeEventListener("pointermove", move);
      sheet.removeEventListener("pointerup", up);
      sheet.removeEventListener("pointercancel", up);
    };
  }, [onClose]);

  const tables = tablesFor(node);
  const bench = node.bench;

  return (
    <div className="portal" role="region" aria-label={`${node.name}, project bench`}>
      <div className="portal-sheet" ref={sheetRef}>
        <div className="portal-grip" aria-hidden="true" />
        <div className="portal-inner">
          <nav className="portal-nav" aria-label="Portal">
            <button type="button" className="portal-back" onClick={onClose}>
              Back to the Field <kbd>Esc</kbd>
            </button>
            <a
              className="portal-brief"
              href={`/#${node.id}`}
              onClick={(e) => {
                e.preventDefault();
                setView("brief");
                portalToBriefRow(node.id);
                scrollToBriefRow(node.id);
              }}
            >
              Read as Brief
            </a>
          </nav>

          <header className="portal-head" ref={headingRef}>
            <p className="portal-meta">
              <span>{node.period}</span>
              <span className="portal-status" data-status={node.status}>
                {node.status}
              </span>
            </p>
            <Kinetic as="h1" pieces={node.pieces} fringe className="portal-title" />
            <p className="portal-what">{node.what}</p>
          </header>

          <div className="portal-grid">
            <div className="portal-left">
              <Gauge reading={node.reading} label={site.labels.reading} />
              <section className="story" aria-label="Story">
                <div className="story-tabs" role="tablist" aria-label="Story beats">
                  {beats.map((b, i) => (
                    <button
                      key={b.label}
                      type="button"
                      role="tab"
                      id={`beat-tab-${i}`}
                      aria-selected={i === beat}
                      aria-controls="beat-panel"
                      tabIndex={i === beat ? 0 : -1}
                      onClick={() => setBeat(i)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                          e.preventDefault();
                          const next = Math.min(beats.length - 1, Math.max(0, beat + (e.key === "ArrowRight" ? 1 : -1)));
                          setBeat(next);
                          const tab = document.getElementById(`beat-tab-${next}`);
                          tab?.focus();
                        }
                      }}
                    >
                      <span className="beat-n">{i + 1}</span>
                      {b.label}
                    </button>
                  ))}
                </div>
                <StoryPanel text={beats[beat].text} index={beat} onSwipe={step} />
                {node.finding ? (
                  <p className="finding">
                    <span>{site.labels.finding}</span>
                    {node.finding}
                  </p>
                ) : null}
              </section>
            </div>

            <section className="bench" aria-labelledby="bench-title">
              <div className="bench-head">
                <h2 id="bench-title">{bench.title}</h2>
                <p className="bench-note">{site.labels.benchNote}</p>
              </div>
              {bench.kind === "retrieval" ? <RagBench bench={bench} /> : null}
              {bench.kind === "compression" ? <TokenizerBench bench={bench} /> : null}
              {bench.kind === "diff" ? (
                <PytorchBench bench={bench} prs={site.openSource.prs.filter((p) => p.repo === "pytorch")} />
              ) : null}
              {bench.kind === "grading" ? <CodeneuronBench bench={bench} /> : null}
              {bench.kind === "face" ? <AristaBench bench={bench} /> : null}
              {bench.kind === "compare" ? <CompareBench bench={bench} /> : null}
            </section>
          </div>

          {node.competitions ? (
            <section className="spec" aria-labelledby="record-title">
              <h2 id="record-title">Every entry</h2>
              <CompetitionList entries={node.competitions} />
            </section>
          ) : null}

          <section className="spec" aria-labelledby="spec-title">
            <h2 id="spec-title">Specification</h2>
            <dl className="facts">
              {node.spec.map((s) => (
                <div key={s.k}>
                  <dt>{s.k}</dt>
                  <dd>{s.v}</dd>
                </div>
              ))}
            </dl>
            {tables.map((t) => (
              <div className="table-wrap" key={t.caption}>
                <table className="data">
                  <caption>{t.caption}</caption>
                  <thead>
                    <tr>
                      {t.columns.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((r) => (
                      <tr key={r[0]}>
                        {r.map((cell, i) =>
                          i === 0 ? (
                            <th key={i} scope="row">
                              {cell}
                            </th>
                          ) : (
                            <td key={i}>{cell}</td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <p className="row-links">
              {node.links.map((l) => (
                <a key={l.href} href={l.href} rel="noopener" target="_blank">
                  {l.label}
                </a>
              ))}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

/** The headline reading as a gauge that counts up to its real value. */
function Gauge({ reading, label }: { reading: Reading; label: string }) {
  const figRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const frac = Math.min(1, reading.value / reading.scaleMax);

  useEffect(() => {
    const fig = figRef.current;
    const bar = barRef.current;
    if (!fig || !bar || reducedMotion()) return;
    const start = performance.now();
    return animate((_, now) => {
      const p = Math.min(1, (now - start) / PORTAL.countMs);
      const t = easeOutCubic(p);
      fig.textContent = p >= 1 ? readingText(reading) : `${fmt(reading.value * t, reading.decimals)}${reading.suffix}`;
      bar.style.transform = `scaleX(${frac * t})`;
      return p < 1;
    });
  }, [reading, frac]);

  return (
    <figure className="gauge">
      <figcaption className="gauge-cap">{label}</figcaption>
      <p className="gauge-fig">
        <span ref={figRef}>{readingText(reading)}</span>
      </p>
      <p className="gauge-label">{reading.label}</p>
      <div className="gauge-scale" aria-hidden="true">
        <div className="gauge-track">
          <div className="gauge-bar" ref={barRef} style={{ transform: `scaleX(${frac})` }} />
        </div>
        <div className="gauge-ends">
          <span>{fmt(0)}</span>
          <span>{reading.scaleLabel}</span>
        </div>
      </div>
      <p className="gauge-sample">{reading.sample}</p>
      <p className="gauge-source">{reading.source}</p>
    </figure>
  );
}

function StoryPanel({ text, index, onSwipe }: { text: string; index: number; onSwipe: (d: number) => void }) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return (
    <div
      className="story-panel"
      role="tabpanel"
      id="beat-panel"
      aria-labelledby={`beat-tab-${index}`}
      data-limitation={index === 3 ? "" : undefined}
      onPointerDown={(e) => {
        if (e.pointerType === "touch") start.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const s = start.current;
        start.current = null;
        if (!s) return;
        const dx = e.clientX - s.x;
        if (Math.abs(dx) > PORTAL.swipeStep && Math.abs(dx) > Math.abs(e.clientY - s.y)) onSwipe(dx < 0 ? 1 : -1);
      }}
    >
      <p key={index}>{text}</p>
    </div>
  );
}
