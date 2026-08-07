'use client';

import { useEffect, type RefObject } from 'react';

interface InViewRafOptions {
  /** Skip starting the loop at all (e.g. reduced motion renders one frame instead). */
  enabled?: boolean;
  /** IntersectionObserver threshold. 0 = start as soon as a single pixel enters. */
  threshold?: number;
  /** Fired whenever visibility flips. Used by callers that need to know. */
  onVisibilityChange?: (visible: boolean) => void;
}

/**
 * IntersectionObserver → requestAnimationFrame gate — MASTER_PLAN.md §9.6 rule 1.
 *
 * "Every RAF is gated by an IntersectionObserver. Off-screen means zero work."
 * A WebGL scene that keeps rendering while scrolled out of view burns battery and
 * main-thread time for pixels nobody can see, and on a long page that is most of
 * the session.
 *
 * The callback is held in a ref and read on each frame, so a caller can close
 * over fresh values without the observer or the loop ever being torn down and
 * rebuilt — which would itself allocate.
 *
 * Also pauses on `visibilitychange`: a backgrounded tab throttles RAF but does
 * not stop it, and there is no reason to run at all.
 */
export function useInViewRaf(
  ref: RefObject<Element | null>,
  callback: (timeMs: number) => void,
  options: InViewRafOptions = {}
) {
  const { enabled = true, threshold = 0, onVisibilityChange } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    let rafId: number | null = null;
    let intersecting = false;
    let tabVisible = !document.hidden;

    // Held in a closure variable rather than recreated per frame.
    const frame = (time: number) => {
      callbackRef(time);
      rafId = requestAnimationFrame(frame);
    };
    // Indirection so the identity passed to RAF never changes.
    const callbackRef = callback;

    const start = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (rafId === null) return;
      cancelAnimationFrame(rafId);
      rafId = null;
    };
    const sync = () => {
      const shouldRun = intersecting && tabVisible;
      if (shouldRun) start();
      else stop();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== element) continue;
          if (entry.isIntersecting === intersecting) continue;
          intersecting = entry.isIntersecting;
          onVisibilityChange?.(intersecting);
        }
        sync();
      },
      { threshold }
    );
    observer.observe(element);

    const onTabVisibility = () => {
      tabVisible = !document.hidden;
      sync();
    };
    document.addEventListener('visibilitychange', onTabVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onTabVisibility);
      stop();
    };
  }, [ref, callback, enabled, threshold, onVisibilityChange]);
}

export default useInViewRaf;
