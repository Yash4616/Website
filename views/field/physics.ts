import { NODE, STEP } from "./config";

/**
 * A small hand-written integrator. Everything that moves in the Field (the
 * camera, the lens, the nodes, the type) is a damped spring advanced with
 * semi-implicit Euler at a fixed 120 Hz step, so motion is identical at any
 * display refresh rate.
 */

export type Spring = { x: number; v: number };

export function spring(x = 0): Spring {
  return { x, v: 0 };
}

/** One semi-implicit Euler step: velocity first, then position. */
export function stepSpring(s: Spring, target: number, omega: number, zeta: number, dt: number): void {
  const accel = -omega * omega * (s.x - target) - 2 * zeta * omega * s.v;
  s.v += accel * dt;
  s.x += s.v * dt;
}

export function settled(s: Spring, target: number, eps = 0.01): boolean {
  return Math.abs(s.x - target) < eps && Math.abs(s.v) < eps * 10;
}

/** Turns variable frame time into a whole number of fixed steps. */
export class Clock {
  private acc = 0;

  /** Returns how many fixed steps to run for this frame. */
  advance(dt: number): number {
    // A long frame (a hidden tab, a breakpoint) must not become a burst of steps.
    this.acc += Math.min(dt, 0.1);
    const steps = Math.floor(this.acc / STEP);
    this.acc -= steps * STEP;
    return steps;
  }

  reset(): void {
    this.acc = 0;
  }
}

/* ------------------------------------------------------------------ bodies */

export type Body = {
  /** Offset from the plotted position, in world units. */
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  /** Lean target from the pointer magnet, in world units. */
  mx: number;
  my: number;
  pinned: boolean;
};

export type Coupling = { a: number; b: number; weight: number };

export function body(): Body {
  return { ox: 0, oy: 0, vx: 0, vy: 0, mx: 0, my: 0, pinned: false };
}

/**
 * Each node is a body on a spring to its plotted position. Edges couple the
 * displacement of neighbours, so dragging one node tugs the nodes that share a
 * skill with it. Returns true while anything is still moving.
 */
export function stepBodies(bodies: Body[], couplings: Coupling[], dt: number): boolean {
  const k = NODE.omega * NODE.omega;
  const c = 2 * NODE.zeta * NODE.omega;
  const ke = NODE.edgeOmega * NODE.edgeOmega;
  const n = bodies.length;
  const ax = new Float32Array(n);
  const ay = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    ax[i] = -k * (b.ox - b.mx) - c * b.vx;
    ay[i] = -k * (b.oy - b.my) - c * b.vy;
  }
  for (const e of couplings) {
    const p = bodies[e.a];
    const q = bodies[e.b];
    const fx = ke * e.weight * (q.ox - p.ox);
    const fy = ke * e.weight * (q.oy - p.oy);
    ax[e.a] += fx;
    ay[e.a] += fy;
    ax[e.b] -= fx;
    ay[e.b] -= fy;
  }

  let moving = false;
  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    if (b.pinned) {
      b.vx = 0;
      b.vy = 0;
      moving = true;
      continue;
    }
    b.vx += ax[i] * dt;
    b.vy += ay[i] * dt;
    b.ox += b.vx * dt;
    b.oy += b.vy * dt;
    if (
      Math.abs(b.vx) > 0.02 ||
      Math.abs(b.vy) > 0.02 ||
      Math.abs(b.ox - b.mx) > 0.02 ||
      Math.abs(b.oy - b.my) > 0.02
    ) {
      moving = true;
    }
  }
  return moving;
}
