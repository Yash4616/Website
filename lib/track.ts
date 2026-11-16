import { track as send } from "@vercel/analytics";

/**
 * Named events for Vercel Web Analytics. Page views are counted by the
 * <Analytics /> component in the shell; this file adds the handful of
 * actions worth knowing about (résumé, email, outbound links, view, search).
 *
 * Nothing is recorded until Web Analytics is enabled for the project in the
 * Vercel dashboard, and nothing is recorded off Vercel (local builds, other
 * hosts). Vercel sets no cookie, so the site needs no consent banner.
 */

export type EventData = Record<string, string | number | boolean>;

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

/** A visitor who has asked not to be tracked (Do Not Track, Global Privacy Control). */
export function optedOut(): boolean {
  return typeof navigator !== "undefined" && (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true);
}

/** Something happened on the current page. */
export function track(name: string, data?: EventData): void {
  if (optedOut() || typeof window === "undefined") return;
  // The <Analytics /> component creates this queue when it mounts, and an
  // event sent before then is silently lost (the first one, "view-start",
  // was). Create the same queue here if it is not there yet.
  const w = window as unknown as { va?: (...args: unknown[]) => void; vaq?: unknown[] };
  if (!w.va) {
    w.va = (...args: unknown[]) => {
      (w.vaq = w.vaq ?? []).push(args);
    };
  }
  send(name, data);
}

/**
 * Report clicks on the links that matter (résumé, email, outbound) without
 * touching each link: one listener on the document. Returns a function that
 * removes it.
 */
export function trackLinks(resumePath: string): () => void {
  const onClick = (e: MouseEvent) => {
    const a = e.target instanceof Element ? e.target.closest("a") : null;
    const href = a?.getAttribute("href");
    if (!a || !href) return;
    if (href === resumePath) {
      track("resume-download");
    } else if (href.startsWith("mailto:")) {
      track("email-click");
    } else if (/^https?:\/\//.test(href)) {
      try {
        const to = new URL(href);
        if (to.hostname !== location.hostname) track("outbound", { to: to.hostname + to.pathname });
      } catch {
        // Not a URL we can read: nothing to report.
      }
    }
  };
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
