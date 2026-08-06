import type { Variants } from 'framer-motion';

/**
 * Shared motion language — MASTER_PLAN.md §3.4.
 *
 * Import from here. Ad-hoc spring numbers scattered through components are how a
 * site ends up with six slightly different "feels". Never use linear easing;
 * spring physics or a custom cubic-bezier only, 300–800 ms.
 */

export const SPRING_SMOOTH = { type: 'spring', stiffness: 100, damping: 30 } as const;
export const SPRING_SNAPPY = { type: 'spring', stiffness: 400, damping: 40 } as const;
export const SPRING_GENTLE = { type: 'spring', stiffness: 50, damping: 20 } as const;
export const SPRING_CURSOR_DOT = { type: 'spring', stiffness: 1000, damping: 50 } as const;
export const SPRING_CURSOR_RING = { type: 'spring', stiffness: 200, damping: 30 } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: SPRING_SMOOTH },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export const VIEWPORT = { once: true, margin: '-100px' } as const;
