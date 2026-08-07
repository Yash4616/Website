'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Loader from '@/components/features/loader';
import Cursor from '@/components/features/cursor';

export const BOOT_KEY = 'yash:booted';
const HOME_PATH = '/';

/**
 * True when the loader actually played this document load. Consumed by the hero
 * to decide whether to run its own entrance (A25) — when the loader ran, the
 * loader's split-reveal IS the entrance and the hero must render in its final
 * composed state so the <h1> paints immediately and owns LCP.
 */
const LoaderRanContext = createContext(false);
export const useLoaderRan = () => useContext(LoaderRanContext);

/**
 * Loader gate + cursor mount — MASTER_PLAN.md §7 Stage 2, amended by A23/A24.
 *
 * ── A23: the loader is home-only ─────────────────────────────────────────────
 * The boot sequence runs only for a fresh document load of "/". Someone opening
 * /projects/tokenizer arrived from a shared link with specific intent; making
 * them sit through a ceremony — or hunt for the skip — is friction at exactly
 * the wrong moment. Any non-home entry marks the session booted without ever
 * painting a line, so navigating to the home page afterwards does not trigger it
 * either.
 *
 * `booted` is seeded once from a lazy initialiser and never recomputed from
 * `pathname`. That is what makes client-side navigation inert: soft-navigating
 * to "/" does not remount this component, and even if it did, the session key
 * would already be set.
 *
 * ── A24: why there is no SSR flash, in either direction ──────────────────────
 * A `mounted` check alone only moves the flash — it stops the loader appearing
 * on a return visit but introduces a flash of bare content before the loader on
 * a first visit, because nothing renders until an effect runs.
 *
 * Instead: for a home route the server renders the loader (first visits are
 * correct with zero client work), and the return-visit case is handled *before
 * first paint* by a blocking script in <head> (see layout.tsx) that sets
 * `data-booted="1"`, which a CSS rule keys off. For non-home routes the loader
 * is never rendered at all — `usePathname()` resolves during SSR, so the server
 * and the client agree without any need to hide anything.
 */
export function BootGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === HOME_PATH;

  // Seeded once. Non-home entry points start already-booted.
  const [booted, setBooted] = useState(!isHome);

  // Whether the loader is actually going to play this document load.
  const [loaderRan] = useState(() => {
    if (!isHome) return false;
    if (typeof window === 'undefined') return true; // SSR renders the home loader.
    try {
      return window.sessionStorage.getItem(BOOT_KEY) !== '1';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!isHome) {
      // Entered somewhere other than the front door: mark the session booted so
      // a later navigation home stays quiet. Nothing is painted.
      try {
        window.sessionStorage.setItem(BOOT_KEY, '1');
      } catch {
        /* Private mode — harmless, the loader simply may play later. */
      }
      document.documentElement.setAttribute('data-booted', '1');
      return;
    }

    // Home, return visit: unmount the loader immediately. It is already
    // invisible via the pre-paint CSS rule, so nothing flickers.
    try {
      if (window.sessionStorage.getItem(BOOT_KEY) === '1') setBooted(true);
    } catch {
      // Private-mode sessionStorage can throw. Playing the loader is the safe
      // fallback — an extra boot sequence beats a broken page.
    }
  }, [isHome]);

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
    <LoaderRanContext.Provider value={loaderRan}>
      {/*
        Content is always in the DOM and fully visible in CSS terms — the loader
        merely sits on top of it at a higher z-index. Nothing here is
        `opacity: 0` or `visibility: hidden`, both of which would disqualify the
        hero <h1> as an LCP candidate and hand LCP to the loader (§11.1).
      */}
      {children}

      {isHome && !booted && <Loader onDone={handleDone} />}
      {booted && <Cursor />}
    </LoaderRanContext.Provider>
  );
}

export default BootGate;
