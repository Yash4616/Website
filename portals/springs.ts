import { animate, reducedMotion } from "@/lib/anim";
import { STEP } from "@/views/field/config";
import { stepSpring, type Spring } from "@/views/field/physics";
import { BENCH_SPRING } from "./config";

/**
 * Move a set of springs to new targets and write each frame to the DOM.
 * Values only ever travel between measured numbers; the readout text always
 * shows the measured target, never an in-between value.
 */
export function springTo(springs: Spring[], targets: number[], write: (values: number[]) => void): () => void {
  if (reducedMotion()) {
    springs.forEach((s, i) => {
      s.x = targets[i];
      s.v = 0;
    });
    write(targets);
    return () => {};
  }
  let acc = 0;
  return animate((dt) => {
    acc += dt;
    while (acc >= STEP) {
      acc -= STEP;
      springs.forEach((s, i) => stepSpring(s, targets[i], BENCH_SPRING.omega, BENCH_SPRING.zeta, STEP));
    }
    const settled = springs.every((s, i) => Math.abs(s.x - targets[i]) < 0.0005 && Math.abs(s.v) < 0.005);
    if (settled) springs.forEach((s, i) => ((s.x = targets[i]), (s.v = 0)));
    write(springs.map((s) => s.x));
    return !settled;
  });
}

/** Run a looping animation only while an element is on screen and motion is allowed. */
export function whileVisible(el: Element, start: () => () => void): () => void {
  if (reducedMotion()) return () => {};
  let stop: (() => void) | null = null;
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !stop) stop = start();
    else if (!entry.isIntersecting && stop) {
      stop();
      stop = null;
    }
  });
  observer.observe(el);
  return () => {
    observer.disconnect();
    stop?.();
  };
}

/** Point at a fraction t along a polyline. */
export function along(points: [number, number][], t: number): [number, number] {
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const l = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    lengths.push(l);
    total += l;
  }
  let d = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i] || i === lengths.length - 1) {
      const f = lengths[i] === 0 ? 0 : Math.min(1, d / lengths[i]);
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * f,
        points[i][1] + (points[i + 1][1] - points[i][1]) * f,
      ];
    }
    d -= lengths[i];
  }
  return points[points.length - 1];
}
