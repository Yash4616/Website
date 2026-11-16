/**
 * Which renderer is on screen: the Field or the Brief.
 *
 * The decision is made before first paint by an inline script (VIEW_SCRIPT)
 * that sets data-view on <html>. CSS does the actual swap, so a switch is one
 * attribute write: no reload, no layout work in React.
 */

export type View = "field" | "brief";

const VIEW_KEY = "field.view";
const TRIP_KEY = "field.tripped";

declare global {
  interface Window {
    __view?: View;
  }
}

/**
 * Runs in <head>, before paint. Order of precedence:
 * 1. ?view=brief forces Brief (and ?view=field asks for the Field).
 * 2. A remembered choice.
 * 3. Brief when reduced motion or Save-Data is set, WebGL2 is missing, or the
 *    frame governor tripped earlier in this session. Otherwise Field.
 */
export const VIEW_SCRIPT = `(function(){var d=document.documentElement,v="brief";try{var q=new URLSearchParams(location.search).get("view"),s=null,t=false;try{s=localStorage.getItem("${VIEW_KEY}")}catch(e){}try{t=sessionStorage.getItem("${TRIP_KEY}")==="1"}catch(e){}var c=navigator.connection,ok=!!window.WebGL2RenderingContext&&!t,calm=matchMedia("(prefers-reduced-motion: reduce)").matches||!!(c&&c.saveData);if(q==="brief")v="brief";else if(q==="field")v=ok?"field":"brief";else if(s==="brief")v="brief";else if(s==="field")v=ok?"field":"brief";else v=ok&&!calm?"field":"brief"}catch(e){v="brief"}d.setAttribute("data-view",v);window.__view=v})()`;

const listeners = new Set<() => void>();
let current: View | null = null;

export function getView(): View {
  if (current === null) {
    current =
      window.__view ?? (document.documentElement.dataset.view === "field" ? "field" : "brief");
  }
  return current;
}

export function getServerView(): View {
  return "brief";
}

export function subscribeView(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** React's dev-mode remount clears attributes it does not own. Put ours back. */
export function reapplyView(): void {
  document.documentElement.dataset.view = getView();
}

export function setView(next: View, remember = true): void {
  if (next === "field" && !fieldSupported()) return;
  current = next;
  window.__view = next;
  document.documentElement.dataset.view = next;
  if (remember) {
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Storage can be blocked. The choice then lasts for this page only.
    }
  }
  listeners.forEach((l) => l());
}

export function fieldTripped(): boolean {
  try {
    return sessionStorage.getItem(TRIP_KEY) === "1";
  } catch {
    return false;
  }
}

export function fieldSupported(): boolean {
  return typeof window !== "undefined" && "WebGL2RenderingContext" in window && !fieldTripped();
}

/** Called by the frame governor, or when WebGL2 fails to start. Tier C is the Brief view. */
export function tripField(): void {
  try {
    sessionStorage.setItem(TRIP_KEY, "1");
  } catch {
    // Without storage the trip still holds until the next reload.
  }
  setView("brief", false);
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
