'use client';

import { useEffect, useState } from 'react';

/**
 * SSR-safe media query hook.
 *
 * Returns `false` on the server and on first client paint, then settles to the
 * real value in an effect. That ordering is deliberate: it guarantees the server
 * and client render the same markup, so there is no hydration mismatch. Callers
 * that need the heavier desktop branch should therefore treat `false` as "not yet
 * known" and render the lighter branch first (§12.2 — mobile is the safe default).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** `< md` per §12.1 — the breakpoint every mobile adaptation in §12.2 keys off. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/** True on devices with no real hover — disables the custom cursor and tilt (§12.2). */
export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none)');
}
