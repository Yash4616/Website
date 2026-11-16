import { STEP, TYPE } from "@/views/field/config";
import { stepSpring, type Spring } from "@/views/field/physics";
import { animate, reducedMotion } from "./anim";

/**
 * Kinetic typography. A headline is an array of pieces (word and sub-word
 * splits). Pointer velocity applies an impulse to each piece within 160 px,
 * so the line parts along piece boundaries and skews with the motion, then
 * returns on a spring (about 12 rad/s, damping ratio 0.7). At rest every
 * transform is removed and the type is set exactly as the browser lays it out.
 *
 * Headings marked for fringing also get a chromatic offset through an SVG
 * filter while the pointer moves over them, scaled by pointer speed and
 * capped at 3 px.
 */

type Piece = { el: HTMLElement; x: Spring; y: Spring; skew: Spring };

type Line = {
  el: HTMLElement;
  pieces: Piece[];
  fringe: boolean;
  /** Smoothed signed fringe offset in px. */
  fringeX: number;
  hovering: boolean;
  filterOn: boolean;
};

const lines = new Set<Line>();
let listening = false;
let running = false;
let acc = 0;
let lastX = 0;
let lastY = 0;
let lastT = 0;
let fringeOffset: SVGFEOffsetElement[] = [];

const FALLOFF = TYPE.falloff;

let perWord = false;
const tierListeners = new Set<() => void>();

function onMove(e: PointerEvent): void {
  const now = e.timeStamp || performance.now();
  const dt = Math.max(4, now - lastT) / 1000;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  const fresh = now - lastT < 120;
  lastT = now;
  if (!fresh) return;

  let vx = dx / dt;
  let vy = dy / dt;
  const speed = Math.hypot(vx, vy);
  if (speed > TYPE.maxSpeed) {
    vx *= TYPE.maxSpeed / speed;
    vy *= TYPE.maxSpeed / speed;
  }
  const s = Math.min(speed, TYPE.maxSpeed);
  let touched = false;

  for (const line of lines) {
    if (!line.el.isConnected) continue;
    const r = line.el.getBoundingClientRect();
    if (r.width === 0) continue;
    const over =
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    line.hovering = over;
    if (line.fringe && over) {
      const target = Math.sign(vx || 1) * Math.min(3, (s / TYPE.maxSpeed) * 3);
      line.fringeX = Math.abs(target) > Math.abs(line.fringeX) ? target : line.fringeX;
      touched = true;
    }
    if (
      e.clientX < r.left - FALLOFF ||
      e.clientX > r.right + FALLOFF ||
      e.clientY < r.top - FALLOFF ||
      e.clientY > r.bottom + FALLOFF
    ) {
      continue;
    }
    for (const p of line.pieces) {
      // offsetLeft and offsetTop ignore transforms: they are the resting position.
      const left = r.left + p.el.offsetLeft;
      const top = r.top + p.el.offsetTop;
      const w = p.el.offsetWidth;
      const h = p.el.offsetHeight;
      const ddx = Math.max(left - e.clientX, 0, e.clientX - (left + w));
      const ddy = Math.max(top - e.clientY, 0, e.clientY - (top + h));
      const d = Math.hypot(ddx, ddy);
      if (d >= FALLOFF) continue;
      const f = 1 - d / FALLOFF;
      // Pieces either side of the pointer part away from it, and everything
      // is carried a little in the direction of travel.
      const side = Math.sign(left + w / 2 - e.clientX) || 1;
      p.x.v += (side * s * 0.11 + vx * 0.06) * f * f;
      p.y.v += vy * 0.03 * f * f;
      p.skew.v += (-vx / TYPE.maxSpeed) * 70 * f;
      touched = true;
    }
  }
  if (touched) wake();
}

function clamp(sp: Spring, max: number): void {
  if (sp.x > max) {
    sp.x = max;
    sp.v = Math.min(sp.v, 0);
  } else if (sp.x < -max) {
    sp.x = -max;
    sp.v = Math.max(sp.v, 0);
  }
}

function tick(dt: number): boolean {
  acc += dt;
  while (acc >= STEP) {
    acc -= STEP;
    for (const line of lines) {
      for (const p of line.pieces) {
        stepSpring(p.x, 0, TYPE.omega, TYPE.zeta, STEP);
        stepSpring(p.y, 0, TYPE.omega, TYPE.zeta, STEP);
        stepSpring(p.skew, 0, TYPE.omega, TYPE.zeta, STEP);
        clamp(p.x, TYPE.maxShift);
        clamp(p.y, TYPE.maxShift * 0.4);
        clamp(p.skew, TYPE.maxSkew);
      }
    }
  }
  let moving = false;
  for (const line of lines) {
    for (const p of line.pieces) {
      const still =
        Math.abs(p.x.x) < 0.05 &&
        Math.abs(p.y.x) < 0.05 &&
        Math.abs(p.skew.x) < 0.05 &&
        Math.abs(p.x.v) < 0.5 &&
        Math.abs(p.skew.v) < 0.5;
      if (still) {
        p.x.x = p.x.v = p.y.x = p.y.v = p.skew.x = p.skew.v = 0;
        if (p.el.style.transform) p.el.style.transform = "";
      } else {
        moving = true;
        p.el.style.transform = `translate(${p.x.x.toFixed(2)}px, ${p.y.x.toFixed(2)}px) skewX(${p.skew.x.toFixed(2)}deg)`;
      }
    }
    if (line.fringe) {
      line.fringeX *= Math.exp(-dt * 7);
      if (Math.abs(line.fringeX) < 0.06) line.fringeX = 0;
      const on = line.fringeX !== 0;
      if (on) {
        moving = true;
        for (const off of fringeOffset) {
          const sign = off.dataset.channel === "r" ? -1 : 1;
          off.setAttribute("dx", (sign * line.fringeX).toFixed(2));
        }
      }
      if (on !== line.filterOn) {
        line.filterOn = on;
        line.el.style.filter = on ? "url(#fringe)" : "";
      }
    }
  }
  running = moving;
  return moving;
}

function wake(): void {
  if (running) return;
  running = true;
  acc = 0;
  animate(tick);
}

/** Start reacting to the pointer. Returns a function that stops. */
export function registerKinetic(el: HTMLElement, fringe: boolean): () => void {
  if (reducedMotion()) return () => {};
  const selector = perWord ? "[data-word]" : "[data-piece]";
  const pieces: Piece[] = [...el.querySelectorAll<HTMLElement>(selector)].map((p) => ({
    el: p,
    x: { x: 0, v: 0 },
    y: { x: 0, v: 0 },
    skew: { x: 0, v: 0 },
  }));
  const line: Line = { el, pieces, fringe, fringeX: 0, hovering: false, filterOn: false };
  lines.add(line);
  if (fringe) {
    fringeOffset = [...document.querySelectorAll<SVGFEOffsetElement>("#fringe feOffset")];
  }
  if (!listening) {
    listening = true;
    window.addEventListener("pointermove", onMove, { passive: true });
  }
  return () => {
    lines.delete(line);
    for (const p of pieces) p.el.style.transform = "";
    el.style.filter = "";
  };
}

/* Tier B sets type per word instead of per piece. */

export function setPerWord(on: boolean): void {
  if (on === perWord) return;
  perWord = on;
  tierListeners.forEach((l) => l());
}

export function getPerWord(): boolean {
  return perWord;
}

export function subscribePerWord(l: () => void): () => void {
  tierListeners.add(l);
  return () => tierListeners.delete(l);
}
