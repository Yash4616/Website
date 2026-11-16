/**
 * One shared requestAnimationFrame loop for the DOM-side motion (kinetic
 * type, magnetic controls, bench readouts). Each callback returns true while
 * it still has work, and the loop stops when none do.
 */

export type Tick = (dt: number, now: number) => boolean;

const ticks = new Set<Tick>();
let raf = 0;
let last = 0;

function frame(now: number): void {
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
  last = now;
  for (const fn of [...ticks]) {
    if (!fn(dt, now)) ticks.delete(fn);
  }
  raf = ticks.size > 0 ? requestAnimationFrame(frame) : 0;
}

/** Start (or keep) a callback running. Returns a function that stops it. */
export function animate(fn: Tick): () => void {
  ticks.add(fn);
  if (raf === 0) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  return () => {
    ticks.delete(fn);
  };
}

export function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Ease for count-ups: fast start, exact landing. */
export function easeOutCubic(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return 1 - (1 - c) ** 3;
}
