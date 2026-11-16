"use client";

import { Analytics } from "@vercel/analytics/next";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Site } from "@/content/site";
import { readingText } from "@/content/format";
import {
  bindRouter,
  flyTo,
  getPlateCompact,
  getPortal,
  getServerPlateCompact,
  portalToBriefRow,
  scrollToBriefRow,
  setPlateCompact,
  subscribePlate,
} from "@/lib/nav";
import {
  fieldSupported,
  getServerView,
  getView,
  reapplyView,
  setView,
  subscribeView,
  tripField,
  type View,
} from "@/lib/view";
import { optedOut, track, trackLinks } from "@/lib/track";
import { Boundary } from "./Boundary";
import { Pieces } from "./Pieces";

// The Field and the palette are separate chunks, and each brings the content
// object with it. Neither loads in the Brief view until it is asked for.
const Field = dynamic(() => import("@/views/field/FieldEntry"), { ssr: false });
const CommandPalette = dynamic(() => import("./PaletteEntry"), { ssr: false });

// The head script has already chosen the view by the time this module runs.
// When it chose the Field, fetch the Field's chunk now, in parallel with
// hydration, instead of after the first render asks for it.
if (typeof document !== "undefined" && document.documentElement.dataset.view === "field") {
  void import("@/views/field/FieldEntry").catch(() => undefined);
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}

/** The Brief row the reader is looking at, if they have scrolled into the work. */
function currentBriefNode(): string | null {
  if (window.scrollY < 160) return null;
  const y = window.innerHeight * 0.38;
  for (const el of document.querySelectorAll<HTMLElement>(".brief-root [data-node]")) {
    if (el.offsetParent === null) continue;
    const r = el.getBoundingClientRect();
    if (r.top <= y && r.bottom >= y) return el.dataset.node ?? null;
  }
  return null;
}

export function Shell({ person }: { person: Site["person"] }) {
  const router = useRouter();
  const view = useSyncExternalStore(subscribeView, getView, getServerView);
  const compact = useSyncExternalStore(subscribePlate, getPlateCompact, getServerPlateCompact);
  const [fieldMounted, setFieldMounted] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const briefScroll = useRef(0);
  const noteTimer = useRef(0);

  // Once the Field has been shown it stays mounted, so switching back is instant.
  if (view === "field" && !fieldMounted) setFieldMounted(true);

  useLayoutEffect(() => {
    reapplyView();
  }, []);

  useEffect(() => {
    bindRouter(router);
  }, [router]);

  // Analytics events: which view the visit opened in, and clicks on the résumé, email and outbound links.
  useEffect(() => {
    track("view-start", { view: getView() });
    return trackLinks(person.resume);
  }, [person.resume]);

  const switchTo = useCallback((next: View) => {
    if (next === getView()) return;
    if (next === "brief") {
      track("view-switch", { to: "brief" });
      const slug = getPortal();
      setView("brief");
      if (slug) {
        // Leaving a portal for the Brief lands on that project's row.
        portalToBriefRow(slug);
        scrollToBriefRow(slug);
      } else {
        const y = briefScroll.current;
        requestAnimationFrame(() => window.scrollTo(0, y));
      }
      return;
    }
    if (!fieldSupported()) {
      setNote("The Field needs WebGL2 and a steady frame rate on this device. Showing the Brief view.");
      window.clearTimeout(noteTimer.current);
      noteTimer.current = window.setTimeout(() => setNote(null), 5000);
      return;
    }
    // And the reverse: the camera flies to the instrument that was being read.
    const id = currentBriefNode();
    briefScroll.current = window.scrollY;
    track("view-switch", { to: "field" });
    setView("field");
    if (id && !getPortal()) flyTo(id);
  }, []);

  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const togglePalette = useCallback(() => setPaletteOpen((open) => !open), []);

  useEffect(() => {
    if (paletteOpen) track("palette-open");
  }, [paletteOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
        return;
      }
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "b" && !isTyping(e.target)) {
        e.preventDefault();
        switchTo(getView() === "field" ? "brief" : "field");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [switchTo, togglePalette]);

  return (
    <>
      {/* Page views, on Vercel only. A visitor who has opted out of tracking is dropped. */}
      <Analytics beforeSend={(event) => (optedOut() ? null : event)} />
      <div className="view-toggle" role="group" aria-label="Menu and view" data-magnetic="">
        {/* The command palette was keyboard-only (Ctrl+K), so nobody on a phone could reach it. */}
        <button
          type="button"
          className="palette-open"
          aria-haspopup="dialog"
          aria-expanded={paletteOpen}
          aria-keyshortcuts="Control+K Meta+K"
          title="Search and commands (Ctrl+K)"
          onClick={togglePalette}
        >
          Menu
        </button>
        <button
          type="button"
          data-opt="field"
          aria-pressed={view === "field"}
          onClick={() => switchTo("field")}
        >
          Field
        </button>
        <button
          type="button"
          data-opt="brief"
          aria-pressed={view === "brief"}
          onClick={() => switchTo("brief")}
        >
          Brief
        </button>
      </div>
      {note ? (
        <p className="view-note" role="status">
          {note}
        </p>
      ) : null}

      <div className="field-root">
        <header className="plate" data-compact={compact ? "" : undefined}>
          <div className="plate-top">
            <h1 className="plate-name kinetic" data-kinetic="">
              <Pieces pieces={person.namePieces} />
            </h1>
            <button
              type="button"
              className="plate-fold"
              aria-expanded={!compact}
              aria-controls="plate-more"
              onClick={() => setPlateCompact(!compact)}
            >
              {compact ? "Proofs" : "Hide"}
            </button>
          </div>
          <div className="plate-more" id="plate-more">
            <p className="plate-title">
              {person.title}. {person.line}
            </p>
            <p className="plate-avail">{person.availability}</p>
            <ul className="plate-proofs" aria-label="Three proofs">
              {person.proofs.map((p) => (
                <li key={p.text}>
                  <span
                    className="fig"
                    data-count=""
                    data-value={p.value}
                    data-decimals={p.decimals}
                    data-suffix={p.suffix}
                  >
                    {readingText(p)}
                  </span>
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="plate-actions">
            <a className="btn btn-cta" href={person.resume} download data-magnetic="">
              Download résumé
            </a>
            <a className="btn" href={`mailto:${person.email}`} data-magnetic="">
              Email
            </a>
          </div>
        </header>
        {fieldMounted ? (
          // If the Field throws, or its chunk cannot be fetched, fall back to the Brief.
          <Boundary onError={tripField}>
            <Field active={view === "field"} />
          </Boundary>
        ) : null}
      </div>

      {paletteOpen ? (
        <Boundary key="palette" onError={closePalette}>
          <CommandPalette view={view} onSwitch={switchTo} onClose={closePalette} />
        </Boundary>
      ) : null}
    </>
  );
}
