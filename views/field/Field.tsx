"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { FieldNode, Site } from "@/content/site";
import { allNodes, findInstrument, fmt, readingText } from "@/content/format";
import { easeOutCubic } from "@/lib/anim";
import { Bm25Index } from "@/lib/bm25";
import { initialTier } from "@/lib/governor";
import { getPerWord, registerKinetic, setPerWord, subscribePerWord } from "@/lib/kinetic";
import { magnetise } from "@/lib/magnetic";
import { track } from "@/lib/track";
import {
  closePortal,
  getPortal,
  getServerPortal,
  onFly,
  openPortal,
  setPlateCompact,
  subscribePortal,
} from "@/lib/nav";
import { prefersReducedMotion, tripField } from "@/lib/view";
import { FieldEngine } from "./engine";
import "./field.css";

const Portal = dynamic(() => import("@/portals/Portal"), { ssr: false });

const MAX_BEAMS = 6;

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}

function describe(node: FieldNode): string {
  if (node.kind === "station") return `${node.name}. ${node.sentence} Opens a card.`;
  const reading = `${readingText(node.reading)} ${node.reading.label}`;
  const action = node.kind === "instrument" ? "Opens the project." : "Opens a card.";
  return `${node.name}. Reading: ${reading}. Limitation: ${node.limitation} ${action}`;
}

export default function Field({ site, active }: { site: Site; active: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const queryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef<FieldEngine | null>(null);
  const anchorsRef = useRef(new Map<string, HTMLElement>());
  const lastPortal = useRef<string | null>(null);

  const portal = useSyncExternalStore(subscribePortal, getPortal, getServerPortal);
  const perWord = useSyncExternalStore(subscribePerWord, getPerWord, () => false);
  const [card, setCard] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [queryOpen, setQueryOpen] = useState(false);
  const [explored, setExplored] = useState(false);
  const [ready, setReady] = useState(false);

  const nodes = useMemo(() => allNodes(site), [site]);
  const index = useMemo(() => new Bm25Index(site), [site]);
  const outcome = useMemo(() => (query.trim() ? index.search(query) : null), [index, query]);
  const instrument = portal ? findInstrument(site, portal) : undefined;
  const cardNode = card ? nodes.find((n) => n.id === card) : undefined;
  const nameOf = useCallback((id: string) => nodes.find((n) => n.id === id)?.name ?? id, [nodes]);

  /* ---------------------------------------------------------------- engine */

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const style = getComputedStyle(document.documentElement);
    const fonts = {
      sans: style.getPropertyValue("--font-archivo").trim() || "sans-serif",
      mono: style.getPropertyValue("--font-plex-mono").trim() || "monospace",
    };
    const counters = [...document.querySelectorAll<HTMLElement>(".plate [data-count]")];
    const kinds = new Map(allNodes(site).map((n) => [n.id, n.kind]));

    let engine: FieldEngine;
    try {
      engine = new FieldEngine({
        site,
        canvas,
        host,
        anchors: anchorsRef.current,
        fonts,
        tier: "A",
        reducedMotion: prefersReducedMotion(),
        callbacks: {
          onActivate: (id) => {
            if (kinds.get(id) === "instrument") {
              setCard(null);
              openPortal(id);
            } else {
              setCard(id);
            }
          },
          onBackground: () => setCard(null),
          onInteract: () => {
            setExplored(true);
            if (window.innerWidth < 761) setPlateCompact(true);
          },
          onOpening: (progress) => {
            // Readings count up to their real values, then rest on them exactly.
            const t = easeOutCubic(progress * 1.2);
            for (const el of counters) {
              const value = Number(el.dataset.value);
              const decimals = Number(el.dataset.decimals);
              el.textContent = `${fmt(progress >= 1 ? value : value * t, decimals)}${el.dataset.suffix ?? ""}`;
            }
          },
          onTier: (tier) => {
            if (tier === "C") tripField();
            else setPerWord(true);
          },
        },
      });
    } catch {
      // No usable WebGL2 context: Tier C is the Brief view.
      tripField();
      return;
    }
    engineRef.current = engine;
    const tier = initialTier(engine.gpuName());
    engine.setStartTier(tier);
    setPerWord(tier !== "A");

    let cancelled = false;
    const wanted = [`600 15px ${fonts.sans}`, `400 12px ${fonts.sans}`, `500 13px ${fonts.mono}`, `400 11px ${fonts.mono}`];
    const loaded = Promise.all(wanted.map((f) => document.fonts.load(f))).catch(() => undefined);
    const timeout = new Promise((resolve) => window.setTimeout(resolve, 1500));
    Promise.race([loaded, timeout]).then(() => {
      if (cancelled) return;
      engine.setPortal(getPortal());
      engine.start();
      document.documentElement.dataset.fieldReady = "";
      setReady(true);
    });

    const offFly = onFly((id) => {
      setCard(null);
      engine.flyToNode(id);
    });

    return () => {
      cancelled = true;
      offFly();
      engine.destroy();
      engineRef.current = null;
    };
  }, [site]);

  useEffect(() => {
    engineRef.current?.setActive(active);
  }, [active, ready]);

  useEffect(() => {
    engineRef.current?.setPortal(portal);
    const previous = lastPortal.current;
    lastPortal.current = portal;
    // Coming back out of a portal, focus returns to the node that opened it.
    if (previous && !portal) anchorsRef.current.get(previous)?.focus({ preventScroll: true });
  }, [portal]);

  /* Free area and obstacles: where the plot may sit, and what labels must avoid. */
  useEffect(() => {
    if (!ready || !active) return;
    const plate = document.querySelector<HTMLElement>(".plate");
    const toggle = document.querySelector<HTMLElement>(".view-toggle");
    const measure = () => {
      const engine = engineRef.current;
      const host = hostRef.current;
      if (!engine || !host) return;
      const hr = host.getBoundingClientRect();
      // Not laid out yet (a background tab): wait for the observer to report a real size.
      if (hr.width < 2 || hr.height < 2) return;
      const narrow = hr.width < 761;
      const obstacles: [number, number, number, number][] = [];
      const pad = 8;
      const pr = plate?.getBoundingClientRect();
      for (const el of [plate, toggle, queryRef.current]) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.width > 0) obstacles.push([r.left - hr.left - pad, r.top - hr.top - pad, r.right - hr.left + pad, r.bottom - hr.top + pad]);
      }
      const plateRight = pr && pr.width > 0 ? pr.right - hr.left : 0;
      const plateBottom = pr && pr.width > 0 ? pr.bottom - hr.top : 0;
      const insets = narrow
        ? { top: plateBottom + 34, right: 40, bottom: 184, left: 54 }
        : { top: 76, right: 72, bottom: 152, left: plateRight + 92 };
      engine.setInsets(insets, obstacles);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (plate) observer.observe(plate);
    // The stage too: a tab opened in the background can report a zero-sized
    // stage at first, which measures as a phone and fits the plot under the plate.
    if (hostRef.current) observer.observe(hostRef.current);
    const onVisible = () => {
      if (!document.hidden) measure();
    };
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ready, active]);

  /* Query beams run from the query line to each matching node. */
  useEffect(() => {
    const engine = engineRef.current;
    const host = hostRef.current;
    const block = queryRef.current;
    if (!engine || !host || !block) return;
    if (!queryOpen || !outcome || outcome.hits.length === 0) {
      engine.setHits([], null);
      return;
    }
    const hr = host.getBoundingClientRect();
    const fr = block.getBoundingClientRect();
    engine.setHits(outcome.hits.slice(0, MAX_BEAMS), {
      x: fr.left + fr.width / 2 - hr.left,
      y: fr.top - hr.top,
    });
  }, [outcome, queryOpen, ready]);

  /* Kinetic type on the plate, and magnetic controls. */
  useEffect(() => {
    if (!active) return;
    const name = document.querySelector<HTMLElement>(".plate [data-kinetic]");
    return name ? registerKinetic(name, false) : undefined;
  }, [active, perWord]);

  useEffect(() => {
    if (!active) return;
    const offs = [...document.querySelectorAll<HTMLElement>("[data-magnetic]")].map(magnetise);
    return () => offs.forEach((off) => off());
  }, [active, card, portal]);

  /* -------------------------------------------------------------- keyboard */

  const closeQuery = useCallback(() => {
    setQuery("");
    setQueryOpen(false);
    inputRef.current?.blur();
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === "Escape") {
        // Esc steps back out, one level at a time.
        if (getPortal()) closePortal();
        else if (card) setCard(null);
        else if (queryOpen) closeQuery();
        else engineRef.current?.stepOut();
        return;
      }
      if (getPortal() || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      engineRef.current?.skipOpening();
      if (e.key === "/") {
        e.preventDefault();
        setQueryOpen(true);
        inputRef.current?.focus();
        return;
      }
      // Typing anywhere starts a query. B is reserved for the view switch.
      if (e.key.length === 1 && /[a-z0-9]/i.test(e.key) && e.key.toLowerCase() !== "b") {
        e.preventDefault();
        setQuery((q) => q + e.key);
        setQueryOpen(true);
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, card, queryOpen, closeQuery]);

  const goTo = useCallback(
    (id: string) => {
      closeQuery();
      setCard(null);
      engineRef.current?.flyToNode(id);
      anchorsRef.current.get(id)?.focus({ preventScroll: true });
    },
    [closeQuery],
  );

  const activate = useCallback(
    (node: FieldNode) => {
      engineRef.current?.skipOpening();
      if (node.kind === "instrument") {
        setCard(null);
        openPortal(node.id);
      } else {
        setCard(node.id);
      }
    },
    [],
  );

  const onAnchorKey = (e: React.KeyboardEvent, id: string) => {
    const dir: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const d = dir[e.key];
    if (!d) return;
    e.preventDefault();
    const next = engineRef.current?.neighbour(id, d[0], d[1]);
    if (next) anchorsRef.current.get(next)?.focus({ preventScroll: true });
  };

  const setAnchor = (id: string) => (el: HTMLElement | null) => {
    if (el) anchorsRef.current.set(id, el);
    else anchorsRef.current.delete(id);
  };

  /* ------------------------------------------------------------ announcing */

  let announcement = "";
  let refusal: string | null = null;
  if (queryOpen && outcome) {
    if (outcome.hits.length > 0) {
      const top = outcome.hits[0];
      const n = outcome.hits.length;
      announcement = `${n} ${n === 1 ? "match" : "matches"}. Top: ${nameOf(top.id)}, score ${top.score.toFixed(2)}. Press Enter to fly there.`;
    } else {
      refusal = site.field.refusal.replace("{name}", outcome.nearest ? nameOf(outcome.nearest) : nameOf(nodes[0].id));
      announcement = refusal;
    }
  }

  const receded = Boolean(instrument);

  return (
    <>
      <div className="stage" data-receded={receded ? "" : undefined} inert={receded}>
        <div className="host" ref={hostRef}>
          <canvas ref={canvasRef} className="field-canvas" aria-hidden="true" />
          <nav className="anchors" aria-label="Instruments on the Field">
            {nodes.map((node) =>
              node.kind === "instrument" ? (
                <a
                  key={node.id}
                  ref={setAnchor(node.id)}
                  href={`/work/${node.id}`}
                  className="anchor"
                  data-kind={node.kind}
                  aria-label={describe(node)}
                  onClick={(e) => {
                    e.preventDefault();
                    activate(node);
                  }}
                  onFocus={() => engineRef.current?.setFocus(node.id)}
                  onBlur={() => engineRef.current?.setFocus(null)}
                  onKeyDown={(e) => onAnchorKey(e, node.id)}
                />
              ) : (
                <button
                  key={node.id}
                  ref={setAnchor(node.id)}
                  type="button"
                  className="anchor"
                  data-kind={node.kind}
                  aria-label={describe(node)}
                  onClick={() => activate(node)}
                  onFocus={() => engineRef.current?.setFocus(node.id)}
                  onBlur={() => engineRef.current?.setFocus(null)}
                  onKeyDown={(e) => onAnchorKey(e, node.id)}
                />
              ),
            )}
          </nav>
        </div>

        <p className="hint" data-gone={explored ? "" : undefined} aria-hidden={explored}>
          <span className="hint-fine">{site.field.hint}</span>
          <span className="hint-coarse">{site.field.hintTouch}</span>
        </p>

        <div className="query" ref={queryRef} data-open={queryOpen ? "" : undefined}>
          {queryOpen && outcome ? (
            <div className="query-results">
              {outcome.hits.length > 0 ? (
                <ol>
                  {outcome.hits.slice(0, MAX_BEAMS).map((hit, i) => (
                    <li key={hit.id} data-top={i === 0 ? "" : undefined}>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => goTo(hit.id)}>
                        <span>{nameOf(hit.id)}</span>
                        <span className="score">{hit.score.toFixed(2)}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="refusal">{refusal}</p>
              )}
            </div>
          ) : null}
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const top = outcome?.hits[0];
              // The node reached, never the words typed.
              if (top) track("search", { result: top.id });
              else if (query.trim()) track("search-refused");
              if (top) goTo(top.id);
            }}
          >
            <label htmlFor="field-query">
              <span className="slash" aria-hidden="true">
                /
              </span>
              <span className="sr-only">{site.field.queryPrompt}</span>
            </label>
            <input
              ref={inputRef}
              id="field-query"
              type="text"
              inputMode="search"
              enterKeyHint="go"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder={site.field.queryPrompt}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setQueryOpen(true);
              }}
              onFocus={() => {
                setQueryOpen(true);
                engineRef.current?.skipOpening();
              }}
              onBlur={() => {
                if (!query.trim()) setQueryOpen(false);
              }}
            />
          </form>
        </div>
        <p className="sr-only" aria-live="polite" role="status">
          {announcement}
        </p>

        {cardNode && cardNode.kind !== "instrument" ? (
          <aside className="card" role="dialog" aria-label={cardNode.name}>
            <div className="card-head">
              <h2>{cardNode.name}</h2>
              <button type="button" className="card-close" onClick={() => setCard(null)} aria-label="Close">
                Close
              </button>
            </div>
            {cardNode.kind === "satellite" ? (
              <>
                <p className="card-meta">
                  {cardNode.context ? `${cardNode.context}, ` : ""}
                  {cardNode.period}, {cardNode.status}
                </p>
                <p>{cardNode.sentence}</p>
                <dl className="pair">
                  <div>
                    <dt>{site.labels.reading}</dt>
                    <dd>
                      <span className="fig">{readingText(cardNode.reading)}</span>
                      {cardNode.reading.label}
                      <span className="sub">{cardNode.reading.sample}</span>
                      <span className="sub">{cardNode.reading.source}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>{site.labels.limitation}</dt>
                    <dd className="lim">{cardNode.limitation}</dd>
                  </div>
                </dl>
              </>
            ) : cardNode.id === "contact" ? (
              <>
                <p className="card-lede">{site.person.availability}</p>
                <p className="card-meta">{site.person.availabilityDetail}</p>
                <div className="card-actions">
                  <a className="btn btn-cta" href={site.person.resume} download data-magnetic="">
                    Download résumé
                  </a>
                  <a className="btn" href={`mailto:${site.person.email}`} data-magnetic="">
                    Email
                  </a>
                  {site.person.links.map((l) => (
                    <a key={l.href} className="btn" href={l.href} rel="noopener" data-magnetic="">
                      {l.label}
                    </a>
                  ))}
                </div>
                <p className="card-meta">{site.person.email}</p>
              </>
            ) : (
              <>
                <p className="card-lede">{site.person.education.degree}</p>
                <p className="card-meta">
                  {site.person.education.school}. {site.person.education.years}. {site.person.education.grade}.{" "}
                  {site.person.education.graduates}.
                </p>
                <p className="card-meta">{site.person.education.certifications}</p>
                <dl className="card-skills">
                  {site.person.skills.map((s) => (
                    <div key={s.group}>
                      <dt>{s.group}</dt>
                      <dd>{s.items.join(", ")}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </aside>
        ) : null}
      </div>

      {instrument ? <Portal key={instrument.id} site={site} node={instrument} onClose={closePortal} /> : null}
    </>
  );
}
