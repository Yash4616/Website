'use client';

import { useCallback, useEffect, useState } from 'react';
import Loader from '@/components/features/loader';
import Cursor from '@/components/features/cursor';

export const BOOT_KEY = 'yash:booted';

/**
 * Loader gate + cursor mount — MASTER_PLAN.md §7 Stage 2.
 *
 * ── Why there is no SSR flash, in either direction ───────────────────────────
 * A `mounted` check alone only solves half the problem. It stops the loader
 * flashing on a *return* visit, but introduces a flash of bare content before
 * the loader appears on a *first* visit, because nothing renders until an effect
 * has run. Both are visible, and the second is worse.
 *
 * So the server always renders the loader — first visits are correct with zero
 * client work — and the return-visit case is handled *before first paint* by a
 * tiny blocking script in <head> (see layout.tsx) that sets `data-booted="1"` on
 * <html>. A CSS rule keyed off that attribute hides the loader, so on a return
 * visit it never paints a single frame. The effect below then unmounts it.
 *
 * Net result: server HTML and first client render are always identical, so there
 * is no hydration mismatch, and neither visit path shows a flash.
 *
 * ── Why this is at the root rather than in page.tsx ──────────────────────────
 * §7 Stage 2 asks for the gate in page.tsx and the cursor "at root". Those two
 * want the same `isLoaded` value, and splitting them would mean context or a
 * custom event for one boolean. Mounting both here keeps it to one piece of
 * state and makes the cursor work on /projects/[slug] as well. Flagged for
 * approval in the Stage 2 report.
 */
export function BootGate({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    // Return visit: unmount the loader immediately. It is already invisible via
    // the pre-paint CSS rule, so nothing flickers here.
    try {
      if (window.sessionStorage.getItem(BOOT_KEY) === '1') setBooted(true);
    } catch {
      // Private-mode sessionStorage can throw. Playing the loader is the safe
      // fallback — an extra boot sequence beats a broken page.
    }
  }, []);

  const handleDone = useCallback(() => {
    try {
      window.sessionStorage.setItem(BOOT_KEY, '1');
    } catch {
      /* Non-fatal: the loader simply replays next navigation. */
    }
    document.documentElement.setAttribute('data-booted', '1');
    setBooted(true);
  }, []);

  return (
    <>
      {/*
        Content is always in the DOM and fully visible in CSS terms — the loader
        merely sits on top of it at a higher z-index. Nothing here is
        `opacity: 0` or `visibility: hidden`, both of which would disqualify the
        hero <h1> as an LCP candidate and hand LCP to the loader (§11.1).
      */}
      {children}

      {!booted && <Loader onDone={handleDone} />}
      {booted && <Cursor />}
    </>
  );
}

export default BootGate;
