import { MAGNETIC } from "@/views/field/config";
import { animate, reducedMotion } from "./anim";
import { stepSpring, type Spring } from "@/views/field/physics";
import { STEP } from "@/views/field/config";

/**
 * Magnetic controls: within 80 px a control translates up to 6 px toward
 * the pointer, and settles back on a spring when it leaves. Only in the
 * Field view, only for a fine pointer, never under reduced motion.
 */

type Item = { el: HTMLElement; x: Spring; y: Spring; tx: number; ty: number };

const items = new Set<Item>();
let px = -1e4;
let py = -1e4;
let listening = false;
let running = false;
let acc = 0;

function enabled(): boolean {
  return (
    document.documentElement.dataset.view === "field" &&
    !reducedMotion() &&
    window.matchMedia("(pointer: fine)").matches
  );
}

function retarget(): void {
  const on = enabled();
  for (const it of items) {
    if (!on || !it.el.isConnected) {
      it.tx = 0;
      it.ty = 0;
      continue;
    }
    const r = it.el.getBoundingClientRect();
    // Measure against the resting box, not the displaced one.
    const left = r.left - it.x.x;
    const top = r.top - it.y.x;
    const cx = left + r.width / 2;
    const cy = top + r.height / 2;
    const dx = Math.max(left - px, 0, px - (left + r.width));
    const dy = Math.max(top - py, 0, py - (top + r.height));
    const d = Math.hypot(dx, dy);
    if (d < MAGNETIC.radius) {
      const vx = px - cx;
      const vy = py - cy;
      const len = Math.hypot(vx, vy) || 1;
      const pull = MAGNETIC.pull * (1 - d / MAGNETIC.radius);
      it.tx = (vx / len) * pull * Math.min(1, len / 12);
      it.ty = (vy / len) * pull * Math.min(1, len / 12);
    } else {
      it.tx = 0;
      it.ty = 0;
    }
  }
}

function tick(dt: number): boolean {
  acc += dt;
  let moving = false;
  while (acc >= STEP) {
    acc -= STEP;
    for (const it of items) {
      stepSpring(it.x, it.tx, MAGNETIC.omega, MAGNETIC.zeta, STEP);
      stepSpring(it.y, it.ty, MAGNETIC.omega, MAGNETIC.zeta, STEP);
    }
  }
  for (const it of items) {
    const still =
      Math.abs(it.x.x - it.tx) < 0.02 &&
      Math.abs(it.y.x - it.ty) < 0.02 &&
      Math.abs(it.x.v) < 0.2 &&
      Math.abs(it.y.v) < 0.2;
    if (still && it.tx === 0 && it.ty === 0) {
      it.x.x = it.y.x = it.x.v = it.y.v = 0;
      it.el.style.transform = "";
    } else {
      moving = true;
      it.el.style.transform = `translate(${it.x.x.toFixed(2)}px, ${it.y.x.toFixed(2)}px)`;
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

function onMove(e: PointerEvent): void {
  if (e.pointerType !== "mouse") return;
  px = e.clientX;
  py = e.clientY;
  retarget();
  wake();
}

function onLeave(): void {
  px = py = -1e4;
  retarget();
  wake();
}

export function magnetise(el: HTMLElement): () => void {
  const item: Item = { el, x: { x: 0, v: 0 }, y: { x: 0, v: 0 }, tx: 0, ty: 0 };
  items.add(item);
  if (!listening) {
    listening = true;
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
  }
  return () => {
    items.delete(item);
    el.style.transform = "";
  };
}
