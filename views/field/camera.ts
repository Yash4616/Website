import { CAMERA } from "./config";
import { spring, stepSpring, type Spring } from "./physics";

/**
 * The Field camera. Position and log-zoom are critically damped springs
 * (about 9 rad/s). Zooming keeps the world point under the pointer fixed by
 * holding an anchor and deriving the position from the zoom while it settles.
 */

export type Insets = { top: number; right: number; bottom: number; left: number };

export class Camera {
  private sx: Spring = spring(0);
  private sy: Spring = spring(0);
  /** Natural log of the zoom, so equal wheel steps feel equal. */
  private sz: Spring = spring(0);
  private tx = 0;
  private ty = 0;
  private tz = 0;
  private anchor: { wx: number; wy: number; sx: number; sy: number } | null = null;

  width = 1;
  height = 1;
  minZoom = 0.1;
  maxZoom = CAMERA.maxZoom;
  /** When set, motion is instant: no flights. */
  instant = false;

  get x(): number {
    return this.sx.x;
  }
  get y(): number {
    return this.sy.x;
  }
  get zoom(): number {
    return Math.exp(this.sz.x);
  }
  get targetZoom(): number {
    return Math.exp(this.tz);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  toScreenX(wx: number): number {
    return (wx - this.sx.x) * this.zoom + this.width / 2;
  }
  toScreenY(wy: number): number {
    return (wy - this.sy.x) * this.zoom + this.height / 2;
  }
  toWorldX(px: number): number {
    return (px - this.width / 2) / this.zoom + this.sx.x;
  }
  toWorldY(py: number): number {
    return (py - this.height / 2) / this.zoom + this.sy.x;
  }

  /** Direct manipulation: the plane tracks the pointer exactly. */
  panBy(dxScreen: number, dyScreen: number): void {
    this.anchor = null;
    const z = this.zoom;
    this.sx.x -= dxScreen / z;
    this.sy.x -= dyScreen / z;
    this.sx.v = 0;
    this.sy.v = 0;
    this.tx = this.sx.x;
    this.ty = this.sy.x;
  }

  /** Inertia: carry the release velocity (screen px/s) into the target. */
  throwBy(vxScreen: number, vyScreen: number): void {
    this.anchor = null;
    const z = this.zoom;
    this.tx = this.sx.x - (vxScreen / z) * CAMERA.throwSeconds;
    this.ty = this.sy.x - (vyScreen / z) * CAMERA.throwSeconds;
    this.sx.v = -vxScreen / z;
    this.sy.v = -vyScreen / z;
  }

  /** Zoom by a factor, keeping the world point under (px, py) in place. */
  zoomAt(px: number, py: number, factor: number, max = this.maxZoom): void {
    const wx = this.toWorldX(px);
    const wy = this.toWorldY(py);
    const next = Math.min(max, Math.max(this.minZoom, this.targetZoom * factor));
    this.tz = Math.log(next);
    this.anchor = { wx, wy, sx: px, sy: py };
    this.tx = wx - (px - this.width / 2) / next;
    this.ty = wy - (py - this.height / 2) / next;
    if (this.instant) this.jump();
  }

  flyTo(wx: number, wy: number, zoom?: number): void {
    this.anchor = null;
    this.tx = wx;
    this.ty = wy;
    if (zoom !== undefined) this.tz = Math.log(zoom);
    if (this.instant) this.jump();
  }

  /** Aim the camera so a world point lands on a screen point. */
  flyToScreen(wx: number, wy: number, px: number, py: number, zoom: number): void {
    this.flyTo(wx - (px - this.width / 2) / zoom, wy - (py - this.height / 2) / zoom, zoom);
  }

  nudgeTarget(dx: number, dy: number): void {
    this.anchor = null;
    this.tx += dx;
    this.ty += dy;
  }

  /** Frame a world rectangle inside the viewport, minus screen-space insets. */
  fit(
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    insets: Insets,
    immediate = false,
  ): number {
    const availW = Math.max(120, this.width - insets.left - insets.right);
    const availH = Math.max(120, this.height - insets.top - insets.bottom);
    const zoom = Math.min(
      availW / (bounds.maxX - bounds.minX),
      availH / (bounds.maxY - bounds.minY),
      CAMERA.focusZoom,
    );
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    // Shift so the rectangle is centred in the free area, not the full viewport.
    const offX = (insets.left - insets.right) / 2 / zoom;
    const offY = (insets.top - insets.bottom) / 2 / zoom;
    this.flyTo(cx - offX, cy - offY, zoom);
    if (immediate) this.jump();
    return zoom;
  }

  jump(): void {
    this.anchor = null;
    this.sx.x = this.tx;
    this.sy.x = this.ty;
    this.sz.x = this.tz;
    this.sx.v = this.sy.v = this.sz.v = 0;
  }

  /** One fixed step. Returns true while the camera is still moving. */
  step(dt: number): boolean {
    stepSpring(this.sz, this.tz, CAMERA.omega, 1, dt);
    if (this.anchor) {
      const z = this.zoom;
      this.sx.x = this.anchor.wx - (this.anchor.sx - this.width / 2) / z;
      this.sy.x = this.anchor.wy - (this.anchor.sy - this.height / 2) / z;
      this.sx.v = this.sy.v = 0;
    } else {
      stepSpring(this.sx, this.tx, CAMERA.omega, 1, dt);
      stepSpring(this.sy, this.ty, CAMERA.omega, 1, dt);
    }
    const zoomDone = Math.abs(this.sz.x - this.tz) < 0.0005 && Math.abs(this.sz.v) < 0.005;
    const eps = 0.05 / this.zoom;
    const panDone =
      Math.abs(this.sx.x - this.tx) < eps &&
      Math.abs(this.sy.x - this.ty) < eps &&
      Math.abs(this.sx.v) < eps * 10 &&
      Math.abs(this.sy.v) < eps * 10;
    if (zoomDone && this.anchor) {
      this.anchor = null;
      this.sx.x = this.tx;
      this.sy.x = this.ty;
    }
    return !(zoomDone && panDone);
  }
}
