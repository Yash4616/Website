'use client';

import { useReducedMotion } from 'framer-motion';

/**
 * The single place motion policy is decided (§4.5).
 *
 * Wraps Framer Motion's own `useReducedMotion` so every component asks the same
 * question the same way. When motion is reduced:
 *   - animations resolve instantly to their final state
 *   - particle fields render one static frame
 *   - orbits stop rotating
 *   - the loader shortens to 600 ms
 *
 * `useReducedMotion` returns `null` before the media query resolves; that is
 * normalised to `false` here so callers never have to handle three states.
 */
export function useMotionSafe() {
  const prefersReduced = useReducedMotion() ?? false;

  return {
    /** True when the visitor has NOT asked for reduced motion — animate freely. */
    motionSafe: !prefersReduced,
    /** True when the visitor HAS asked for reduced motion. */
    prefersReduced,
    /**
     * Collapses any transition to instant under reduced motion.
     * `transition={instant(SPRING_SMOOTH)}`
     */
    instant: <T,>(transition: T): T | { duration: number } =>
      prefersReduced ? { duration: 0 } : transition,
  };
}
