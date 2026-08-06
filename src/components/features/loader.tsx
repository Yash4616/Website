'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { siteConfig } from '@/data/config';
import { SPRING_SMOOTH } from '@/lib/motion';
import { useIsMobile } from '@/hooks/use-media-query';
import { useMotionSafe } from '@/hooks/use-motion-safe';

/**
 * Boot-up loader — MASTER_PLAN.md §7 Stage 2.
 *
 * Every line comes from `siteConfig.loader`; nothing user-facing is hardcoded
 * here (§5.1). The clock is a single requestAnimationFrame loop reading
 * `step.at`, not a chain of setTimeouts — one timer to cancel, and skipping is
 * a single flag rather than a dozen orphaned callbacks.
 *
 * SSR discipline (the thing that is easy to get wrong): on a return visit the
 * loader must render *nothing at all*, not "render then hide". The parent owns
 * that decision via a mounted check, so the server and the first client paint
 * always agree and there is no flash. See boot-gate.tsx.
 */

const EXIT_AT = 3.5; // seconds
const MOBILE_SCALE = 0.57; // §7 Stage 2 — compresses the sequence to ~2.0s
const REDUCED_HOLD_MS = 600; // §4.5 — final frame only, then fade

const BAR_CELLS = 10;
const FULL_BAR_CELLS = 41; // matches the DEPLOYED bar width in §5.6

/** Renders a progress value as block characters, e.g. ████████░░ */
function bar(progress: number, cells: number): string {
  const filled = Math.round((progress / 100) * cells);
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, cells - filled));
}

interface LoaderProps {
  onDone: () => void;
}

export function Loader({ onDone }: LoaderProps) {
  const isMobile = useIsMobile();
  const { prefersReduced } = useMotionSafe();

  const [visibleCount, setVisibleCount] = useState(0);
  const [exiting, setExiting] = useState(false);

  const steps = siteConfig.loader;
  const totalSteps = steps.length;

  // Kept in refs so the RAF loop never re-subscribes and never allocates (§9.6).
  const doneRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    // Stop the clock here, not just at unmount. Without this the RAF keeps
    // ticking after a skip and rewrites visibleCount from elapsed time —
    // visibly rewinding the completed sequence back to a partial one while the
    // exit animation plays.
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setExiting(true);
  }, []);

  /** Skip: any click or keypress ends the sequence immediately (§7 Stage 2). */
  const skip = useCallback(() => {
    if (doneRef.current) return;
    setVisibleCount(totalSteps);
    finish();
  }, [finish, totalSteps]);

  useEffect(() => {
    // Reduced motion: show the completed frame, hold briefly, then exit.
    if (prefersReduced) {
      setVisibleCount(totalSteps);
      const timer = window.setTimeout(finish, REDUCED_HOLD_MS);
      return () => window.clearTimeout(timer);
    }

    const scale = isMobile ? MOBILE_SCALE : 1;
    const start = performance.now();

    const tick = (now: number) => {
      // A skip may have landed between frames; the sequence is over.
      if (doneRef.current) return;

      const elapsed = (now - start) / 1000;

      let count = 0;
      for (let i = 0; i < totalSteps; i++) {
        if (elapsed >= steps[i].at * scale) count = i + 1;
        else break;
      }
      // Only touch state when the visible line count actually changes.
      setVisibleCount((previous) => (previous === count ? previous : count));

      if (elapsed >= EXIT_AT * scale) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [finish, isMobile, prefersReduced, steps, totalSteps]);

  /** Skip listeners. Passive where possible (§9.2). */
  useEffect(() => {
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip, { passive: true });
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [skip]);

  const shown = steps.slice(0, visibleCount);
  const isLast = (index: number) => index === totalSteps - 1;

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!exiting && (
        <motion.div
          key="loader"
          // `data-boot-loader` is the hook for the pre-paint hide rule in
          // globals.css. See boot-gate.tsx for why that exists.
          data-boot-loader=""
          className="fixed inset-0 z-[9998] font-mono"
          aria-label="System boot sequence"
        >
          {/*
            Two halves that split apart on exit, revealing the hero beneath.
            The hero is already in the DOM and painted behind this — it is only
            occluded, never hidden — so LCP resolves to the real <h1> (§11.1).
          */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-void"
            initial={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={prefersReduced ? { duration: 0.25 } : SPRING_SMOOTH}
          >
            <div className="scan-lines pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-cyan-accent/20" aria-hidden="true" />
          </motion.div>

          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-void"
            initial={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={prefersReduced ? { duration: 0.25 } : SPRING_SMOOTH}
          >
            <div className="scan-lines pointer-events-none absolute inset-0" aria-hidden="true" />
          </motion.div>

          {/* Output sits above both halves and fades as they part. */}
          <motion.div
            className="absolute inset-0 flex flex-col justify-center px-6 md:px-16"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div
              className="mx-auto w-full max-w-2xl text-left text-xs leading-relaxed text-cyan-accent sm:text-sm"
              aria-live="polite"
              aria-atomic="false"
            >
              {shown.map((step, index) => (
                <div key={`${step.at}-${step.text}`} className="whitespace-pre-wrap">
                  {isLast(index) && visibleCount === totalSteps ? (
                    <span>
                      {bar(100, FULL_BAR_CELLS)} {step.text}
                    </span>
                  ) : (
                    <span>
                      <span className="text-cyan-accent/50">{'> '}</span>
                      {step.text}
                      {step.progress !== undefined
                        ? ` ${bar(step.progress, BAR_CELLS)} ${step.progress}%`
                        : ''}
                      {step.done ? ' ✓' : ''}
                    </span>
                  )}
                </div>
              ))}
              {/* Caret on the active line. */}
              <span className="inline-block animate-blink text-cyan-accent" aria-hidden="true">
                █
              </span>
            </div>

            <p className="mx-auto mt-10 w-full max-w-2xl text-[11px] tracking-widest text-white/25">
              press any key to skip
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Loader;
