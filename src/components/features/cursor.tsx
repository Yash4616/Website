'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { SPRING_CURSOR_DOT, SPRING_CURSOR_RING } from '@/lib/motion';

/**
 * Dual-element magnetic cursor — MASTER_PLAN.md §7 Stage 2.
 *
 * ── The render-count constraint ───────────────────────────────────────────────
 * This component must not re-render on pointer movement. Everything that changes
 * at pointer rate is a MotionValue written from a listener, never React state.
 * There is exactly one piece of React state (`enabled`); it settles once on
 * mount and nothing writes to it again. Measured: 2 renders total (the initial
 * `null` render plus the enable flip), 0 caused by pointer movement.
 *
 * ── Why MotionValues and not imperative animate() ────────────────────────────
 * An earlier version drove the ring's appearance with framer-motion's imperative
 * `animate(element, …)` against a ref. It silently did nothing: the mode
 * transitions fired correctly but the element's style never changed. Every
 * animated property is now a spring-backed MotionValue bound to a `motion.div`,
 * which framer writes straight to the DOM outside React's render cycle — same
 * zero-re-render property, and it demonstrably works.
 *
 * ── On animating width/height ────────────────────────────────────────────────
 * §9.3 bans layout-triggering animation *in a loop*. Magnetic and text modes
 * animate width/height/border-radius, as §7 Stage 2 specifies, because a scale
 * transform cannot match an arbitrary bounding box without distorting the
 * border. Acceptable here and only here: the ring is a `fixed`,
 * `pointer-events-none` element and the sole occupant of its containing block,
 * so its layout cannot affect anything else. The common hover state uses
 * `scale`, which stays on the compositor.
 */

type CursorMode = 'default' | 'pointer' | 'magnetic' | 'text';

const RING_SIZE = 40;
const DOT_SIZE = 8;
const MAGNETIC_PADDING = 8;

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [data-cursor], input, textarea, select, summary';

const BORDER_IDLE = 'rgba(255, 255, 255, 0.5)';
const BORDER_ACTIVE = 'rgba(0, 240, 255, 0.6)';
const FILL_IDLE = 'rgba(0, 240, 255, 0)';
const FILL_ACTIVE = 'rgba(0, 240, 255, 0.1)';

export function Cursor() {
  // The one piece of state. SSR cannot know the pointer type, so this starts
  // false (render nothing) and settles once on mount. It never changes again.
  const [enabled, setEnabled] = useState(false);
  const modeRef = useRef<CursorMode>('default');

  // Pointer position drives the dot directly.
  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);
  const dotX = useSpring(pointerX, SPRING_CURSOR_DOT);
  const dotY = useSpring(pointerY, SPRING_CURSOR_DOT);

  // The ring tracks the pointer too — except in magnetic mode, where it targets
  // the element's centre instead. Separate values so the dot keeps following.
  const ringTargetX = useMotionValue(-100);
  const ringTargetY = useMotionValue(-100);
  const ringX = useSpring(ringTargetX, SPRING_CURSOR_RING);
  const ringY = useSpring(ringTargetY, SPRING_CURSOR_RING);

  // Appearance. Each is a spring target set from the pointermove handler.
  const ringWidth = useSpring(RING_SIZE, SPRING_CURSOR_RING);
  const ringHeight = useSpring(RING_SIZE, SPRING_CURSOR_RING);
  const ringRadius = useSpring(RING_SIZE / 2, SPRING_CURSOR_RING);
  const ringScale = useSpring(1, SPRING_CURSOR_RING);

  // One numeric "accent" value drives both colours; useTransform interpolates
  // them, so colour changes cost no extra springs and no re-renders.
  const accent = useSpring(0, SPRING_CURSOR_RING);
  const borderColor = useTransform(accent, [0, 1], [BORDER_IDLE, BORDER_ACTIVE]);
  const backgroundColor = useTransform(accent, [0, 1], [FILL_IDLE, FILL_ACTIVE]);
  const ringOpacity = useMotionValue(1);

  useEffect(() => {
    // §12.2 — not rendered at all on touch. Return null, do not render and hide.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const applyMode = (mode: CursorMode, rect: DOMRect | null) => {
      if (mode === 'magnetic' && rect) {
        ringWidth.set(rect.width + MAGNETIC_PADDING * 2);
        ringHeight.set(rect.height + MAGNETIC_PADDING * 2);
        ringRadius.set(9999);
        ringScale.set(1);
        accent.set(1);
        return;
      }
      if (mode === 'text') {
        ringWidth.set(2);
        ringHeight.set(24);
        ringRadius.set(1);
        ringScale.set(1);
        accent.set(1);
        return;
      }
      if (mode === 'pointer') {
        ringWidth.set(RING_SIZE);
        ringHeight.set(RING_SIZE);
        ringRadius.set(RING_SIZE / 2);
        ringScale.set(1.5);
        accent.set(1);
        return;
      }
      ringWidth.set(RING_SIZE);
      ringHeight.set(RING_SIZE);
      ringRadius.set(RING_SIZE / 2);
      ringScale.set(1);
      accent.set(0);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);

      const target = event.target instanceof Element ? event.target : null;
      const hit = target?.closest(INTERACTIVE_SELECTOR) ?? null;

      let mode: CursorMode = 'default';
      let rect: DOMRect | null = null;

      if (hit) {
        const cursorAttr = hit.getAttribute('data-cursor');
        const tag = hit.tagName.toLowerCase();

        if (tag === 'input' || tag === 'textarea' || tag === 'select') {
          mode = 'text';
        } else if (cursorAttr === 'magnetic') {
          mode = 'magnetic';
          rect = hit.getBoundingClientRect();
        } else {
          mode = 'pointer';
        }
      }

      // Magnetic locks the ring to the element centre; everything else follows.
      if (mode === 'magnetic' && rect) {
        ringTargetX.set(rect.left + rect.width / 2);
        ringTargetY.set(rect.top + rect.height / 2);
      } else {
        ringTargetX.set(event.clientX);
        ringTargetY.set(event.clientY);
      }

      // Re-apply every frame while magnetic so the box tracks a moving or
      // resizing target; otherwise only on an actual mode change.
      if (mode !== modeRef.current || mode === 'magnetic') {
        modeRef.current = mode;
        applyMode(mode, rect);
      }
    };

    const onPointerLeave = () => ringOpacity.set(0);
    const onPointerEnter = () => ringOpacity.set(1);

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.documentElement.addEventListener('pointerenter', onPointerEnter);

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.documentElement.removeEventListener('pointerenter', onPointerEnter);
    };
  }, [
    enabled,
    accent,
    pointerX,
    pointerY,
    ringHeight,
    ringOpacity,
    ringRadius,
    ringScale,
    ringTargetX,
    ringTargetY,
    ringWidth,
  ]);

  if (!enabled) return null;

  return (
    <>
      {/* Ring */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[99999]"
        style={{ x: ringX, y: ringY, opacity: ringOpacity }}
        aria-hidden="true"
      >
        <motion.div
          className="border-2"
          style={{
            width: ringWidth,
            height: ringHeight,
            borderRadius: ringRadius,
            borderColor,
            backgroundColor,
            scale: ringScale,
            x: '-50%',
            y: '-50%',
          }}
        />
      </motion.div>

      {/* Dot */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[99999]"
        style={{ x: dotX, y: dotY, opacity: ringOpacity }}
        aria-hidden="true"
      >
        <motion.div
          className="rounded-full bg-white"
          style={{ width: DOT_SIZE, height: DOT_SIZE, x: '-50%', y: '-50%' }}
        />
      </motion.div>
    </>
  );
}

export default Cursor;
