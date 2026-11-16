import type { Site } from "@/content/site";
import { Governor, rememberTier, type Tier } from "@/lib/governor";
import { Camera, type Insets } from "./camera";
import { CAMERA, COLOR, GOVERNOR, LENS, NODE, OPENING_SECONDS, STEP } from "./config";
import { LabelAtlas, type Fonts } from "./labels";
import { Lens } from "./lens";
import { body, Clock, stepBodies, type Body, type Coupling } from "./physics";
import {
  Batch,
  LINE_STRIDE,
  pushLine,
  pushShape,
  pushSprite,
  Renderer,
  SHAPE_KIND,
  SHAPE_STRIDE,
  SPRITE_STRIDE,
  type Frame,
} from "./renderer";
import { buildWorld, nearestInDirection, type World, type WorldNode } from "./world";

/**
 * The Field engine: input, camera, physics, label placement and the frame
 * loop. It owns no React state. The component above it passes DOM elements
 * in and receives a few callbacks.
 */

export type Hit = { id: string; score: number };

export type EngineCallbacks = {
  /** A node was clicked, tapped, or zoomed into. */
  onActivate: (id: string) => void;
  /** Empty plane was clicked. */
  onBackground: () => void;
  /** First pointer, wheel or key input. */
  onInteract: () => void;
  /** Opening sequence progress, 0 to 1. */
  onOpening: (progress: number) => void;
  /** The governor dropped a tier. "C" means: leave for the Brief view. */
  onTier: (tier: Tier) => void;
};

export type EngineOptions = {
  site: Site;
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  anchors: Map<string, HTMLElement>;
  fonts: Fonts;
  tier: Tier;
  reducedMotion: boolean;
  callbacks: EngineCallbacks;
};

type LabelState = {
  alpha: [number, number];
  ox: [number, number];
  oy: [number, number];
  cand: [number, number];
  /** Variant chosen this frame: 0 name, 1 full, -1 none. */
  chosen: number;
};

type Rect = [number, number, number, number];

const VARIANT_KEYS = ["name", "full"] as const;

function approach(current: number, target: number, rate: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}

function overlaps(a: Rect, b: Rect): boolean {
  return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
}

function smooth(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

export class FieldEngine {
  private canvas: HTMLCanvasElement;
  private host: HTMLElement;
  private anchors: Map<string, HTMLElement>;
  private fonts: Fonts;
  private cb: EngineCallbacks;

  private renderer: Renderer;
  private atlas = new LabelAtlas();
  private camera = new Camera();
  private lens = new Lens();
  private clock = new Clock();
  private governor = new Governor(GOVERNOR.window, GOVERNOR.limitMs, GOVERNOR.warmupFrames);

  private site: Site;
  private world: World;
  private aspect = 1;
  private bodies: Body[] = [];
  private couplings: Coupling[] = [];
  private labels: LabelState[] = [];
  private order: number[] = [];
  private px: Float32Array = new Float32Array(0);
  private py: Float32Array = new Float32Array(0);
  private beam: Float32Array = new Float32Array(0);
  private scores: Float32Array = new Float32Array(0);
  /** How far each node's measured layer has faded in under the glass, 0 to 1. */
  private lensFade: Float32Array = new Float32Array(0);
  private anchorCache: string[] = [];

  private lines = new Batch(LINE_STRIDE, 96);
  private aShapes = new Batch(SHAPE_STRIDE, 16);
  private aSprites = new Batch(SPRITE_STRIDE, 96);
  private bShapes = new Batch(SHAPE_STRIDE, 16);
  private bSprites = new Batch(SPRITE_STRIDE, 96);

  private width = 1;
  private height = 1;
  private dpr = 1;
  private tier: Tier;
  private reduced: boolean;
  private coarse = false;

  private insets: Insets = { top: 64, right: 56, bottom: 96, left: 72 };
  private obstacles: Rect[] = [];
  private fitZoom = 0.4;
  private userMoved = false;

  private active = false;
  private running = false;
  private raf = 0;
  private lastT = 0;
  private frameDt = 1 / 60;
  private streak = 0;
  private ready = false;
  private destroyed = false;

  private open = 0;
  private opening = false;
  private tickAlpha = 0;

  private portal: string | null = null;
  private focusId: string | null = null;
  private hoverIndex = -1;
  private lensIndex = -1;
  private hits: Hit[] = [];
  private beamOrigin: { x: number; y: number } | null = null;
  private zoomArmed = true;
  private interacted = false;

  // Pointer state
  private pointers = new Map<number, { x: number; y: number }>();
  private mode: "idle" | "pan" | "node" | "pinch" | "loupe" = "idle";
  private downX = 0;
  private downY = 0;
  private downT = 0;
  private downNode = -1;
  private moved = false;
  private lastX = 0;
  private lastY = 0;
  private lastMoveT = 0;
  private velX = 0;
  private velY = 0;
  private pinchDist = 0;
  private pinchX = 0;
  private pinchY = 0;
  private holdTimer = 0;
  private pointerInside = false;

  private resizeObserver: ResizeObserver;
  private cleanup: (() => void)[] = [];

  constructor(options: EngineOptions) {
    this.site = options.site;
    this.canvas = options.canvas;
    this.host = options.host;
    this.anchors = options.anchors;
    this.fonts = options.fonts;
    this.cb = options.callbacks;
    this.tier = options.tier;
    this.reduced = options.reducedMotion;
    this.coarse = window.matchMedia("(pointer: coarse)").matches;

    this.renderer = new Renderer(this.canvas);
    // After a lost GPU context returns, one frame redraws everything.
    this.renderer.onRestore = () => this.wake();
    this.renderer.onFail = () => {
      this.sleep();
      this.cb.onTier("C");
    };
    this.lens.enabled = !this.reduced;
    this.camera.instant = this.reduced;

    const rect = this.host.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.aspect = this.freeAspect();
    this.world = buildWorld(this.site, this.aspect);
    this.adoptWorld();
    this.applySize();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.host);
    this.bind();
  }

  /* ------------------------------------------------------------ lifecycle */

  gpuName(): string {
    return this.renderer.gpuName();
  }

  /** Set the starting tier before start(). Later changes only come from the governor. */
  setStartTier(tier: Tier): void {
    this.tier = tier;
    this.applySize();
  }

  get currentTier(): Tier {
    return this.tier;
  }

  /** Call once fonts are loaded: draws the labels and starts the opening. */
  start(): void {
    this.atlas.build(this.world, this.fonts, this.dpr);
    this.ready = true;
    this.fit(true);
    if (this.portal) this.diveTo(this.portal, true);
    if (this.reduced || this.portal) {
      this.open = 1;
      this.cb.onOpening(1);
    } else {
      this.open = 0;
      this.opening = true;
    }
    this.wake();
  }

  setActive(active: boolean): void {
    if (active === this.active) return;
    this.active = active;
    if (active) {
      this.onResize();
      this.wake();
    } else {
      this.sleep();
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.sleep();
    window.clearTimeout(this.holdTimer);
    this.resizeObserver.disconnect();
    this.cleanup.forEach((fn) => fn());
    this.renderer.destroy();
  }

  private adoptWorld(): void {
    const n = this.world.nodes.length;
    const previous = this.bodies;
    this.bodies = this.world.nodes.map((_, i) => previous[i] ?? body());
    this.couplings = this.world.edges.map((e) => ({ a: e.a, b: e.b, weight: Math.min(2, e.weight) }));
    if (this.labels.length !== n) {
      this.labels = this.world.nodes.map(() => ({
        alpha: [0, 0],
        ox: [0, 0],
        oy: [0, 0],
        cand: [-1, -1],
        chosen: -1,
      }));
      this.px = new Float32Array(n);
      this.py = new Float32Array(n);
      this.beam = new Float32Array(n);
      this.scores = new Float32Array(n);
      this.lensFade = new Float32Array(n);
      this.anchorCache = new Array(n).fill("");
    }
    const rank = { instrument: 0, station: 1, satellite: 2 } as const;
    this.order = this.world.nodes
      .map((wn) => wn.index)
      .sort((p, q) => rank[this.world.nodes[p].node.kind] - rank[this.world.nodes[q].node.kind] || p - q);
  }

  private applySize(): void {
    const cap = this.tier === "A" ? 2 : 1.5;
    this.dpr = Math.min(window.devicePixelRatio || 1, cap);
    this.renderer.resize(this.width, this.height, this.dpr);
    // The lens layer stays at full resolution in every tier: it only draws the
    // square under the glass, and its text has to be read. Tier B saves elsewhere.
    this.renderer.setLensScale(1);
    this.camera.resize(this.width, this.height);
  }

  private onResize(): void {
    if (this.destroyed) return;
    const rect = this.host.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const dprBefore = this.dpr;
    this.width = rect.width;
    this.height = rect.height;
    this.applySize();
    this.reshape();
    if (this.ready && dprBefore !== this.dpr) {
      this.atlas.build(this.world, this.fonts, this.dpr);
    }
    if (this.ready) {
      if (this.portal) this.diveTo(this.portal, true);
      else if (!this.userMoved) this.fit(true);
      else this.computeFitZoom();
    }
    this.wake();
  }

  /** Drop to a lower tier. Called by the governor, never upwards. */
  private applyTier(tier: Tier): void {
    this.tier = tier;
    rememberTier(tier);
    this.cb.onTier(tier);
    if (tier === "C") return;
    this.applySize();
    this.atlas.build(this.world, this.fonts, this.dpr);
    this.governor.reset();
  }

  /* ------------------------------------------------------------- controls */

  setInsets(insets: Insets, obstacles: Rect[]): void {
    this.insets = insets;
    this.obstacles = obstacles;
    this.reshape();
    if (this.ready && !this.userMoved && !this.portal) this.fit(!this.interacted);
    this.wake();
  }

  /** Height over width of the screen area left free for the plot. */
  private freeAspect(): number {
    const w = Math.max(120, this.width - this.insets.left - this.insets.right);
    const h = Math.max(120, this.height - this.insets.top - this.insets.bottom);
    return h / w;
  }

  /**
   * Re-plot when the free area changes shape, so the overview keeps filling
   * it. Only while the visitor has not moved the camera: the plot must not
   * shift under them.
   */
  private reshape(): void {
    const aspect = this.freeAspect();
    if (this.userMoved || this.portal || Math.abs(aspect - this.aspect) / this.aspect < 0.05) return;
    this.aspect = aspect;
    this.world = buildWorld(this.site, aspect);
    this.adoptWorld();
  }

  private freeCentre(): { x: number; y: number } {
    return {
      x: (this.insets.left + this.width - this.insets.right) / 2,
      y: (this.insets.top + this.height - this.insets.bottom) / 2,
    };
  }

  private computeFitZoom(): number {
    const b = this.world.bounds;
    const availW = Math.max(120, this.width - this.insets.left - this.insets.right);
    const availH = Math.max(120, this.height - this.insets.top - this.insets.bottom);
    this.fitZoom = Math.min(availW / (b.maxX - b.minX), availH / (b.maxY - b.minY), CAMERA.focusZoom);
    this.camera.minZoom = this.fitZoom * 0.75;
    return this.fitZoom;
  }

  fit(immediate = false): void {
    this.computeFitZoom();
    this.camera.fit(this.world.bounds, this.insets, immediate);
    this.userMoved = false;
    this.wake();
  }

  /** Esc: step back out to the overview. Returns false when already there. */
  stepOut(): boolean {
    if (!this.userMoved && Math.abs(this.camera.targetZoom - this.fitZoom) < 0.01) return false;
    this.fit();
    return true;
  }

  flyToNode(id: string, zoomIn = true): void {
    const wn = this.world.byId.get(id);
    if (!wn) return;
    const c = this.freeCentre();
    const zoom = zoomIn
      ? Math.max(this.camera.targetZoom, CAMERA.focusZoom)
      : Math.min(this.camera.targetZoom, CAMERA.portalZoom * 0.9);
    this.camera.flyToScreen(wn.x, wn.y, c.x, c.y, zoom);
    this.userMoved = true;
    this.zoomArmed = false;
    this.wake();
  }

  /** Keyboard focus moved to a node: keep it in view. */
  setFocus(id: string | null): void {
    this.focusId = id;
    if (id) {
      const wn = this.world.byId.get(id);
      if (wn) {
        const sx = this.camera.toScreenX(wn.x);
        const sy = this.camera.toScreenY(wn.y);
        const m = 70;
        const outside =
          sx < this.insets.left - 20 + m ||
          sx > this.width - this.insets.right - m ||
          sy < this.insets.top - 20 + m ||
          sy > this.height - this.insets.bottom - m;
        if (outside) this.flyToNode(id, false);
      }
    }
    this.wake();
  }

  neighbour(id: string, dx: number, dy: number): string | null {
    const from = this.world.byId.get(id);
    if (!from) return null;
    return nearestInDirection(this.world, from, dx, dy)?.id ?? null;
  }

  setPortal(id: string | null): void {
    if (id === this.portal) return;
    if (id) {
      this.diveTo(id, !this.ready || !this.active);
    } else {
      const from = this.portal;
      this.portal = null;
      this.camera.maxZoom = CAMERA.maxZoom;
      const wn = from ? this.world.byId.get(from) : undefined;
      if (wn) {
        const c = this.freeCentre();
        this.camera.flyToScreen(wn.x, wn.y, c.x, c.y, CAMERA.focusZoom);
        this.userMoved = true;
      }
    }
    this.wake();
  }

  private diveTo(id: string, immediate: boolean): void {
    const wn = this.world.byId.get(id);
    if (!wn) return;
    this.portal = id;
    this.lens.show(false);
    this.camera.flyTo(wn.x, wn.y, CAMERA.diveZoom);
    if (immediate) this.camera.jump();
    this.zoomArmed = false;
  }

  /** Query results: beams are drawn from the origin to each matching node. */
  setHits(hits: Hit[], origin: { x: number; y: number } | null): void {
    this.hits = hits;
    this.beamOrigin = origin;
    this.wake();
  }

  /* ---------------------------------------------------------------- input */

  private bind(): void {
    const host = this.host;
    const on = <K extends keyof HTMLElementEventMap>(
      type: K,
      handler: (e: HTMLElementEventMap[K]) => void,
      options?: AddEventListenerOptions,
    ) => {
      host.addEventListener(type, handler, options);
      this.cleanup.push(() => host.removeEventListener(type, handler, options));
    };

    on("pointerdown", (e) => this.onDown(e));
    on("pointermove", (e) => this.onMove(e));
    on("pointerup", (e) => this.onUp(e));
    on("pointercancel", (e) => this.onUp(e, true));
    on("pointerleave", (e) => {
      if (e.pointerType === "mouse") {
        this.pointerInside = false;
        this.hoverIndex = -1;
        this.lens.show(false);
        this.clearMagnets();
        this.wake();
      }
    });
    on("wheel", (e) => this.onWheel(e), { passive: false });
    on("contextmenu", (e) => {
      if (this.mode === "loupe" || this.coarse) e.preventDefault();
    });
    // Focus can try to scroll the host. The camera owns movement, not scroll.
    on("scroll", () => {
      host.scrollTop = 0;
      host.scrollLeft = 0;
    });

    const onVisibility = () => {
      if (document.hidden) this.sleep();
      else this.wake();
    };
    document.addEventListener("visibilitychange", onVisibility);
    this.cleanup.push(() => document.removeEventListener("visibilitychange", onVisibility));
  }

  private local(e: PointerEvent | WheelEvent): { x: number; y: number } {
    const rect = this.host.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private touch(): void {
    if (!this.interacted) {
      this.interacted = true;
      this.cb.onInteract();
    }
    this.skipOpening();
  }

  /** Any input ends the opening sequence at once. */
  skipOpening(): void {
    if (this.opening) {
      this.opening = false;
      this.open = 1;
      this.cb.onOpening(1);
      this.wake();
    }
  }

  private hitTest(x: number, y: number): number {
    let best = -1;
    let bestD = Infinity;
    const nodes = this.world.nodes;
    for (let i = 0; i < nodes.length; i++) {
      const reach = Math.max(nodes[i].radius + NODE.hitPad, this.coarse ? 24 : 15);
      const d = Math.hypot(this.px[i] - x, this.py[i] - y);
      if (d < reach && d < bestD) {
        best = i;
        bestD = d;
      }
    }
    return best;
  }

  private onDown(e: PointerEvent): void {
    if (this.portal) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    this.touch();
    const p = this.local(e);
    this.pointers.set(e.pointerId, p);
    try {
      this.host.setPointerCapture(e.pointerId);
    } catch {
      // Capture can fail for synthetic events; dragging still works inside the host.
    }
    window.clearTimeout(this.holdTimer);

    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.mode = "pinch";
      this.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      this.pinchX = (a.x + b.x) / 2;
      this.pinchY = (a.y + b.y) / 2;
      this.lens.show(false);
      this.releaseNode();
      return;
    }
    if (this.pointers.size > 2) return;

    this.downX = this.lastX = p.x;
    this.downY = this.lastY = p.y;
    this.downT = this.lastMoveT = performance.now();
    this.velX = this.velY = 0;
    this.moved = false;
    this.downNode = this.hitTest(p.x, p.y);
    this.mode = this.downNode >= 0 ? "node" : "pan";

    if (e.pointerType !== "mouse" && !this.reduced) {
      // Press and hold: the lens becomes a loupe drawn above the finger.
      this.holdTimer = window.setTimeout(() => {
        if (this.moved || this.pointers.size !== 1) return;
        this.mode = "loupe";
        this.releaseNode();
        this.lens.moveTo(this.lastX, this.lastY - LENS.loupeLift, true);
        this.lens.show(true);
        this.wake();
      }, LENS.holdMs);
    }
    this.wake();
  }

  private onMove(e: PointerEvent): void {
    const p = this.local(e);
    const now = performance.now();
    const isMouse = e.pointerType === "mouse";

    if (isMouse && this.pointers.size === 0) {
      // Hover: the lens follows, nodes lean toward the pointer.
      this.pointerInside = true;
      const dt = Math.max(1, now - this.lastMoveT) / 1000;
      const speed = Math.hypot(p.x - this.lastX, p.y - this.lastY) / dt;
      this.lastX = p.x;
      this.lastY = p.y;
      this.lastMoveT = now;
      if (!this.portal) {
        this.lens.feedSpeed(speed);
        this.lens.moveTo(p.x, p.y);
        this.lens.show(true);
        const hover = this.hitTest(p.x, p.y);
        if (hover !== this.hoverIndex) {
          this.hoverIndex = hover;
          this.host.style.cursor = hover >= 0 ? "pointer" : "";
        }
      }
      this.wake();
      return;
    }

    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.set(e.pointerId, p);

    if (this.mode === "pinch" && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      if (this.pinchDist > 0) {
        this.camera.panBy(cx - this.pinchX, cy - this.pinchY);
        this.camera.zoomAt(cx, cy, dist / this.pinchDist, CAMERA.portalZoom * 1.08);
        this.camera.jump();
        this.userMoved = true;
        this.checkZoomOpen(cx, cy);
      }
      this.pinchDist = dist;
      this.pinchX = cx;
      this.pinchY = cy;
      this.wake();
      return;
    }

    const dx = p.x - this.lastX;
    const dy = p.y - this.lastY;
    const dt = Math.max(1, now - this.lastMoveT) / 1000;
    this.lastX = p.x;
    this.lastY = p.y;
    this.lastMoveT = now;
    // Smoothed release velocity, px/s.
    this.velX = this.velX * 0.6 + (dx / dt) * 0.4;
    this.velY = this.velY * 0.6 + (dy / dt) * 0.4;

    if (!this.moved && Math.hypot(p.x - this.downX, p.y - this.downY) > (isMouse ? 4 : 8)) {
      this.moved = true;
      window.clearTimeout(this.holdTimer);
    }

    if (this.mode === "loupe") {
      this.lens.feedSpeed(Math.hypot(dx, dy) / dt);
      this.lens.moveTo(p.x, p.y - LENS.loupeLift);
    } else if (this.mode === "pan" && this.moved) {
      this.camera.panBy(dx, dy);
      this.userMoved = true;
      if (isMouse) {
        this.lens.feedSpeed(Math.hypot(dx, dy) / dt);
        this.lens.moveTo(p.x, p.y);
      }
    } else if (this.mode === "node" && this.moved && this.downNode >= 0) {
      const wn = this.world.nodes[this.downNode];
      const b = this.bodies[this.downNode];
      b.pinned = true;
      b.ox = this.camera.toWorldX(p.x) - wn.x;
      b.oy = this.camera.toWorldY(p.y) - wn.y;
      if (isMouse) this.lens.moveTo(p.x, p.y);
    }
    this.wake();
  }

  private releaseNode(): void {
    if (this.downNode >= 0) this.bodies[this.downNode].pinned = false;
  }

  private onUp(e: PointerEvent, cancelled = false): void {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.delete(e.pointerId);
    window.clearTimeout(this.holdTimer);
    const mode = this.mode;

    if (mode === "pinch") {
      if (this.pointers.size < 2) {
        this.mode = "idle";
        this.pinchDist = 0;
        // Whichever finger stays down must not become a pan with a jump.
        this.pointers.clear();
      }
      this.wake();
      return;
    }

    this.mode = "idle";
    if (mode === "loupe") {
      this.lens.show(false);
    } else if (mode === "node") {
      this.releaseNode();
      if (!this.moved && !cancelled && this.downNode >= 0) {
        this.cb.onActivate(this.world.nodes[this.downNode].id);
      }
    } else if (mode === "pan") {
      if (!this.moved && !cancelled) {
        this.cb.onBackground();
      } else if (!cancelled && !this.reduced) {
        const stale = performance.now() - this.lastMoveT > 80;
        const vx = stale ? 0 : this.velX;
        const vy = stale ? 0 : this.velY;
        if (e.pointerType !== "mouse") this.snapAfterThrow(vx, vy);
        else if (Math.hypot(vx, vy) > 60) this.camera.throwBy(vx, vy);
      }
    }
    this.downNode = -1;
    this.wake();
  }

  /** Touch: a release glides on, then settles on the nearest node. */
  private snapAfterThrow(vx: number, vy: number): void {
    const z = this.camera.zoom;
    const c = this.freeCentre();
    // Where the free-area centre will be looking once the throw has decayed.
    const wx = this.camera.toWorldX(c.x) - (vx / z) * CAMERA.throwSeconds;
    const wy = this.camera.toWorldY(c.y) - (vy / z) * CAMERA.throwSeconds;
    let best: WorldNode | null = null;
    let bestD = Infinity;
    for (const wn of this.world.nodes) {
      const d = Math.hypot(wn.x - wx, wn.y - wy) * z;
      if (d < bestD) {
        bestD = d;
        best = wn;
      }
    }
    // At the overview everything is in view already; snapping would only fight the user.
    const zoomedIn = this.camera.targetZoom > this.fitZoom * 1.25;
    if (best && zoomedIn && bestD < Math.min(this.width, this.height) * 0.45) {
      this.camera.flyToScreen(best.x, best.y, c.x, c.y, this.camera.targetZoom);
    } else if (Math.hypot(vx, vy) > 60) {
      this.camera.throwBy(vx, vy);
    }
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    if (this.portal) return;
    this.touch();
    const p = this.local(e);
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? this.height : 1;
    // A trackpad pinch arrives as ctrl+wheel with small deltas.
    const gain = e.ctrlKey ? 5 : 1;
    const factor = Math.exp(-e.deltaY * unit * CAMERA.zoomWheel * gain);
    this.camera.zoomAt(p.x, p.y, factor, CAMERA.portalZoom * 1.08);
    this.userMoved = true;
    if (factor > 1) this.checkZoomOpen(p.x, p.y);
    this.wake();
  }

  /** Zooming past about 2.4x on a node opens it. */
  private checkZoomOpen(x: number, y: number): void {
    const target = this.camera.targetZoom;
    if (target < CAMERA.portalZoom * 0.85) {
      this.zoomArmed = true;
      return;
    }
    if (!this.zoomArmed || target < CAMERA.portalZoom) return;
    let best = -1;
    let bestD = 200;
    for (let i = 0; i < this.world.nodes.length; i++) {
      const d = Math.hypot(this.px[i] - x, this.py[i] - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best >= 0) {
      this.zoomArmed = false;
      this.cb.onActivate(this.world.nodes[best].id);
    }
  }

  private clearMagnets(): void {
    for (const b of this.bodies) {
      b.mx = 0;
      b.my = 0;
    }
  }

  /* ----------------------------------------------------------- frame loop */

  wake(): void {
    if (this.running || !this.active || !this.ready || this.destroyed || document.hidden) return;
    this.running = true;
    this.lastT = performance.now();
    this.streak = 0;
    this.clock.reset();
    this.raf = requestAnimationFrame(this.tick);
  }

  private sleep(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private tick = (t: number): void => {
    if (!this.running) return;
    const dt = Math.min(0.1, Math.max(0, (t - this.lastT) / 1000));
    this.lastT = t;
    this.frameDt = dt || 1 / 60;
    this.streak++;

    // The governor only counts frames from an unbroken run.
    if (this.streak > 2 && this.tier !== "C" && this.governor.push(dt * 1000)) {
      const next: Tier = this.tier === "A" ? "B" : "C";
      this.applyTier(next);
      if (next === "C") {
        this.sleep();
        return;
      }
    }

    let moving = false;
    if (this.opening) {
      this.open = Math.min(1, this.open + dt / OPENING_SECONDS);
      this.cb.onOpening(this.open);
      if (this.open >= 1) this.opening = false;
      moving = true;
    }

    this.updateMagnets();
    const steps = this.clock.advance(dt);
    let cameraMoving = false;
    let bodiesMoving = false;
    let lensMoving = false;
    for (let i = 0; i < steps; i++) {
      cameraMoving = this.camera.step(STEP);
      bodiesMoving = stepBodies(this.bodies, this.couplings, STEP);
      lensMoving = this.lens.step(STEP);
    }
    if (steps === 0) moving = true;
    moving = moving || cameraMoving || bodiesMoving || lensMoving;

    const animating = this.draw();
    this.placeAnchors();

    const hidden = this.portal !== null && !cameraMoving;
    if ((moving || animating || this.mode !== "idle") && !hidden) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      this.running = false;
    }
  };

  /** The pointer is a weak magnet: within 140 px a node leans by at most 12 px. */
  private updateMagnets(): void {
    const z = this.camera.zoom;
    const on = this.pointerInside && !this.reduced && !this.portal && this.mode !== "pan";
    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      if (!on) {
        b.mx = 0;
        b.my = 0;
        continue;
      }
      const wn = this.world.nodes[i];
      const dx = this.lastX - this.camera.toScreenX(wn.x);
      const dy = this.lastY - this.camera.toScreenY(wn.y);
      const d = Math.hypot(dx, dy);
      if (d < NODE.magnetRadius && d > 0.5) {
        const lean = NODE.magnetLean * (1 - d / NODE.magnetRadius) * Math.min(1, d / NODE.magnetLean);
        b.mx = ((dx / d) * lean) / z;
        b.my = ((dy / d) * lean) / z;
      } else {
        b.mx = 0;
        b.my = 0;
      }
    }
  }

  private snap(v: number): number {
    return Math.round(v * this.dpr) / this.dpr;
  }

  private candidate(variant: number, c: number, w: number, h: number, r: number): [number, number] {
    if (variant === 0) {
      if (c === 0) return [r + 8, -h / 2];
      if (c === 1) return [-w / 2, r + 6];
      if (c === 2) return [-w / 2, -r - 6 - h];
      return [-r - 8 - w, -h / 2];
    }
    if (c === 0) return [r + 10, -11];
    if (c === 1) return [-r, r + 8];
    if (c === 2) return [-r - 10 - w, -11];
    return [-r, -r - 8 - h];
  }

  /** Choose a label variant and position per node so that nothing collides. */
  private placeLabels(level: number): void {
    const nodes = this.world.nodes;
    const placed: Rect[] = [];
    const pad = 3;
    const first = this.focusId ? this.world.byId.get(this.focusId)?.index ?? -1 : this.hoverIndex;
    const order = first >= 0 ? [first, ...this.order.filter((i) => i !== first)] : this.order;

    for (const i of order) {
      const wn = nodes[i];
      const st = this.labels[i];
      const x = this.px[i];
      const y = this.py[i];
      st.chosen = -1;
      if (x < -80 || x > this.width + 80 || y < -80 || y > this.height + 80) continue;

      const variants = level === 1 ? [1, 0] : [0];
      search: for (const variant of variants) {
        const entry = this.atlas.get(`${wn.id}:${VARIANT_KEYS[variant]}`);
        if (!entry) continue;
        const tries = st.cand[variant] >= 0 ? [st.cand[variant], 0, 1, 2, 3] : [0, 1, 2, 3];
        for (const c of tries) {
          const [dx, dy] = this.candidate(variant, c, entry.w, entry.h, wn.radius);
          const rect: Rect = [x + dx - pad, y + dy - pad, x + dx + entry.w + pad, y + dy + entry.h + pad];
          // A label must sit fully on screen.
          let free = rect[0] >= 2 && rect[2] <= this.width - 2 && rect[1] >= 2 && rect[3] <= this.height - 2;
          for (const p of placed) {
            if (!free) break;
            if (overlaps(rect, p)) {
              free = false;
              break;
            }
          }
          if (free) {
            for (const o of this.obstacles) {
              if (overlaps(rect, o)) {
                free = false;
                break;
              }
            }
          }
          if (free) {
            for (let j = 0; j < nodes.length; j++) {
              if (j === i) continue;
              const r = nodes[j].radius + 3;
              if (overlaps(rect, [this.px[j] - r, this.py[j] - r, this.px[j] + r, this.py[j] + r])) {
                free = false;
                break;
              }
            }
          }
          if (free) {
            st.chosen = variant;
            if (st.cand[variant] !== c) {
              st.cand[variant] = c;
              // A label that is not showing yet starts in place instead of sliding in.
              if (st.alpha[variant] < 0.05) {
                st.ox[variant] = dx;
                st.oy[variant] = dy;
              }
            }
            placed.push(rect);
            break search;
          }
        }
      }
    }
  }

  private nodeIn(i: number): number {
    if (this.open >= 1) return 1;
    const n = this.world.nodes.length;
    return smooth((this.open - 0.25 - 0.45 * (i / n)) / 0.3);
  }

  /** Build the batches for this frame and render. Returns true while animating. */
  private draw(): boolean {
    const cam = this.camera;
    const world = this.world;
    const nodes = world.nodes;
    const z = cam.zoom;
    const dt = this.frameDt;
    const w = this.width;
    const h = this.height;
    let animating = false;

    this.lines.reset();
    this.aShapes.reset();
    this.aSprites.reset();
    this.bShapes.reset();
    this.bSprites.reset();

    for (let i = 0; i < nodes.length; i++) {
      this.px[i] = cam.toScreenX(nodes[i].x + this.bodies[i].ox);
      this.py[i] = cam.toScreenY(nodes[i].y + this.bodies[i].oy);
    }

    const level = z >= CAMERA.neighbourhoodZoom ? 1 : 0;
    const lensOn = this.lens.visible && !this.portal;

    // The node under the lens flips to its measured layer.
    let lensIndex = -1;
    if (lensOn) {
      let bestD = LENS.radius * 0.8;
      for (let i = 0; i < nodes.length; i++) {
        const d = Math.hypot(this.px[i] - this.lens.x, this.py[i] - this.lens.y);
        if (d < bestD) {
          bestD = d;
          lensIndex = i;
        }
      }
    }
    this.lensIndex = lensIndex;

    // The measured layer fades in under the glass rather than switching, and
    // the plotted labels it replaces fade out by the same amount.
    let lensCover = 0;
    for (let i = 0; i < nodes.length; i++) {
      const target = i === lensIndex ? 1 : 0;
      if (Math.abs(this.lensFade[i] - target) > 0.01) {
        this.lensFade[i] = approach(this.lensFade[i], target, 12, dt);
        animating = true;
      } else {
        this.lensFade[i] = target;
      }
      // A sum, not a max: one readout fading out while the next fades in
      // adds to 1, so nothing else flickers through mid-swap.
      lensCover = Math.min(1, lensCover + this.lensFade[i]);
    }

    /* Axes: ticks and tick labels. Labels stay on screen when the axis leaves it. */
    const axisSX = cam.toScreenX(world.axisX);
    const axisSY = cam.toScreenY(world.axisY);
    const openTicks = smooth(this.open * 2 - 0.4);
    const xLabelY = Math.min(axisSY + 9, h - this.insets.bottom + 34);
    const yLabelRight = Math.max(axisSX - 9, 44);
    const tickTarget = level === 1 ? 1 : 0;
    if (Math.abs(this.tickAlpha - tickTarget) > 0.01) {
      this.tickAlpha = approach(this.tickAlpha, tickTarget, 9, dt);
      animating = true;
    } else {
      this.tickAlpha = tickTarget;
    }

    // Layer names are long; on a narrow screen a name that would touch its
    // neighbour is left out rather than overprinted.
    let xLabelRight = -Infinity;
    world.xTicks.forEach((t, i) => {
      const sx = cam.toScreenX(t.pos);
      if (sx < -100 || sx > w + 100) return;
      pushLine(this.lines, sx, axisSY, sx, axisSY + 5, 0.5, COLOR.muted, 0.8 * openTicks);
      const e = this.atlas.get(`x:${i}`);
      if (!e) return;
      const lx = this.snap(Math.min(w - e.w - 4, Math.max(4, sx - e.w / 2)));
      if (lx < xLabelRight + 10) return;
      xLabelRight = lx + e.w;
      const ly = this.snap(xLabelY);
      pushSprite(this.aSprites, lx, ly, e.w, e.h, e.u0, e.v0, e.u1, e.v1, openTicks);
      if (lensOn) pushSprite(this.bSprites, lx, ly, e.w, e.h, e.u0, e.v0, e.u1, e.v1, 1);
    });
    world.yTicks.forEach((t, i) => {
      const sy = cam.toScreenY(t.pos);
      if (sy < -40 || sy > h + 40) return;
      const alpha = (t.major ? 1 : this.tickAlpha) * openTicks;
      pushLine(this.lines, axisSX - (t.major ? 6 : 4), sy, axisSX, sy, 0.5, COLOR.muted, 0.8 * openTicks);
      const e = this.atlas.get(`y:${i}`);
      if (!e || alpha <= 0.01) return;
      const lx = this.snap(yLabelRight - e.w);
      const ly = this.snap(sy - e.h / 2);
      pushSprite(this.aSprites, lx, ly, e.w, e.h, e.u0, e.v0, e.u1, e.v1, alpha);
      if (lensOn) pushSprite(this.bSprites, lx, ly, e.w, e.h, e.u0, e.v0, e.u1, e.v1, alpha);
    });
    const xt = this.atlas.get("xt");
    if (xt) {
      const lx = this.snap(Math.min(cam.toScreenX(world.rightX) - xt.w, w - xt.w - 12));
      pushSprite(this.aSprites, lx, this.snap(xLabelY + 17), xt.w, xt.h, xt.u0, xt.v0, xt.u1, xt.v1, openTicks);
    }
    const yt = this.atlas.get("yt");
    if (yt) {
      const ly = this.snap(Math.max(cam.toScreenY(world.topY) - yt.h - 6, this.insets.top - 30));
      pushSprite(this.aSprites, this.snap(yLabelRight - yt.w), ly, yt.w, yt.h, yt.u0, yt.v0, yt.u1, yt.v1, openTicks);
    }

    /* Edges: nodes that share a skill. Tier B draws only the strongest. */
    const edgeLimit = this.tier === "A" ? world.edges.length : Math.min(5, world.edges.length);
    for (let k = 0; k < edgeLimit; k++) {
      const e = world.edges[k];
      const alpha = 0.2 * Math.min(this.nodeIn(e.a), this.nodeIn(e.b));
      pushLine(this.lines, this.px[e.a], this.py[e.a], this.px[e.b], this.py[e.b], 0.5, COLOR.muted, alpha);
    }

    /* Duration spans: from the start of the work to its end. */
    for (let i = 0; i < nodes.length; i++) {
      const wn = nodes[i];
      if (wn.spanY === null) continue;
      const alpha = this.nodeIn(i);
      const isCta = wn.id === "contact";
      const color = isCta ? COLOR.signal : COLOR.muted;
      const x = this.px[i];
      const y0 = this.py[i] - wn.radius - 2;
      const y1 = cam.toScreenY(wn.spanY + this.bodies[i].oy);
      if (y1 < y0) {
        pushLine(this.lines, x, y0, x, y1, 0.5, color, (isCta ? 0.9 : 0.6) * alpha);
        // A closed cap marks finished work. Ongoing work is left open.
        if (wn.node.plot.end !== "present") {
          pushLine(this.lines, x - 4, y1, x + 4, y1, 0.5, color, (isCta ? 0.9 : 0.6) * alpha);
        }
      }
    }

    /* Query beams, each labelled with its score. */
    const origin = this.beamOrigin;
    this.scores.fill(0);
    for (const hit of this.hits) {
      const wn = world.byId.get(hit.id);
      if (wn) this.scores[wn.index] = hit.score;
    }
    const topId = this.hits.length > 0 ? this.hits[0].id : null;
    for (let i = 0; i < nodes.length; i++) {
      const target = origin && this.scores[i] > 0 ? 1 : 0;
      if (Math.abs(this.beam[i] - target) > 0.01) {
        this.beam[i] = approach(this.beam[i], target, 14, dt);
        animating = true;
      } else {
        this.beam[i] = target;
      }
      if (this.beam[i] <= 0.01 || !origin || this.scores[i] <= 0) continue;
      const top = nodes[i].id === topId;
      const color = top ? COLOR.signal : COLOR.ink;
      const t = this.beam[i];
      const ex = origin.x + (this.px[i] - origin.x) * t;
      const ey = origin.y + (this.py[i] - origin.y) * t;
      pushLine(this.lines, origin.x, origin.y, ex, ey, top ? 0.75 : 0.5, color, (top ? 0.95 : 0.4) * t);
      const text = this.scores[i].toFixed(2);
      const adv = this.atlas.glyphAdvance;
      let gx = this.px[i] - (text.length * adv) / 2;
      const gy = this.py[i] - nodes[i].radius - 24;
      for (const ch of text) {
        const g = this.atlas.get(`g:${top ? "s" : "i"}:${ch}`);
        if (g) pushSprite(this.aSprites, this.snap(gx), this.snap(gy), g.w, g.h, g.u0, g.v0, g.u1, g.v1, t);
        gx += adv;
      }
    }

    /* Node glyphs. */
    for (let i = 0; i < nodes.length; i++) {
      const wn = nodes[i];
      const alpha = this.nodeIn(i);
      const kind = SHAPE_KIND[wn.node.kind];
      const mark = wn.id === topId && origin ? this.beam[i] : 0;
      const color = wn.id === "contact" ? COLOR.signal : COLOR.ink;
      pushShape(this.aShapes, this.px[i], this.py[i], wn.radius, kind, wn.arc, mark, color, alpha);
      // Under the glass, the measured layer holds one node's readout and nothing else.
      const keep = 1 - lensCover;
      if (lensOn && keep > 0.01) {
        pushShape(this.bShapes, this.px[i], this.py[i], wn.radius, kind, wn.arc, 0, color, alpha * keep);
      }
    }

    /* Labels: semantic zoom, with collision avoidance. */
    this.placeLabels(level);
    for (let i = 0; i < nodes.length; i++) {
      const wn = nodes[i];
      const st = this.labels[i];
      const appear = this.nodeIn(i);
      for (let v = 0; v < 2; v++) {
        const target = st.chosen === v ? 1 : 0;
        if (Math.abs(st.alpha[v] - target) > 0.01) {
          st.alpha[v] = approach(st.alpha[v], target, 11, dt);
          animating = true;
        } else {
          st.alpha[v] = target;
        }
        if (st.alpha[v] <= 0.01) continue;
        const entry = this.atlas.get(`${wn.id}:${VARIANT_KEYS[v]}`);
        if (!entry) continue;
        if (st.cand[v] >= 0) {
          const [tx, ty] = this.candidate(v, st.cand[v], entry.w, entry.h, wn.radius);
          if (Math.abs(st.ox[v] - tx) > 0.3 || Math.abs(st.oy[v] - ty) > 0.3) {
            st.ox[v] = approach(st.ox[v], tx, 13, dt);
            st.oy[v] = approach(st.oy[v], ty, 13, dt);
            animating = true;
          } else {
            st.ox[v] = tx;
            st.oy[v] = ty;
          }
        }
        const lx = this.snap(this.px[i] + st.ox[v]);
        const ly = this.snap(this.py[i] + st.oy[v]);
        const alpha = st.alpha[v] * appear;
        pushSprite(this.aSprites, lx, ly, entry.w, entry.h, entry.u0, entry.v0, entry.u1, entry.v1, alpha);
        // Under the lens, a node's measured layer replaces every other label.
        if (lensOn && lensCover < 0.99) {
          pushSprite(this.bSprites, lx, ly, entry.w, entry.h, entry.u0, entry.v0, entry.u1, entry.v1, alpha * (1 - lensCover));
        }
      }
    }

    // The readout sits on the node, not the glass, so sliding the lens over a
    // node reveals it through the dome instead of carrying a card around.
    for (let i = 0; lensOn && i < nodes.length; i++) {
      const fade = this.lensFade[i];
      if (fade <= 0.01) continue;
      const entry = this.atlas.get(`${nodes[i].id}:lens`);
      if (!entry) continue;
      pushSprite(
        this.bSprites,
        this.snap(this.px[i] - entry.w / 2),
        this.snap(this.py[i] - entry.h / 2),
        entry.w, entry.h, entry.u0, entry.v0, entry.u1, entry.v1, fade,
      );
    }

    this.renderer.syncAtlas(this.atlas);
    const frame: Frame = {
      width: w,
      height: h,
      camX: cam.x,
      camY: cam.y,
      zoom: z,
      open: this.open,
      spacing: [world.layerW / 4, world.monthH, world.layerW, world.monthH * 3],
      axis: [world.axisX, world.axisY, world.rightX - world.axisX, world.axisY - world.topY],
      lines: this.lines,
      a: { shapes: this.aShapes, sprites: this.aSprites },
      b: { shapes: this.bShapes, sprites: this.bSprites },
      lens: lensOn
        ? { x: this.lens.x, y: this.lens.y, strength: this.lens.strength, dispersion: this.lens.dispersion }
        : null,
    };
    this.renderer.render(frame);
    return animating;
  }

  /** Keep each node's focusable DOM counterpart over its glyph. */
  private placeAnchors(): void {
    const nodes = this.world.nodes;
    for (let i = 0; i < nodes.length; i++) {
      const el = this.anchors.get(nodes[i].id);
      if (!el) continue;
      // Clamped to the viewport so that focusing one never scrolls the page.
      const x = Math.min(this.width - 24, Math.max(24, this.px[i]));
      const y = Math.min(this.height - 24, Math.max(24, this.py[i]));
      const value = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      if (value !== this.anchorCache[i]) {
        this.anchorCache[i] = value;
        el.style.transform = value;
      }
    }
  }

  /** Screen position of a node, for DOM overlays that hang off it. */
  screenOf(id: string): { x: number; y: number } | null {
    const wn = this.world.byId.get(id);
    if (!wn) return null;
    return { x: this.px[wn.index], y: this.py[wn.index] };
  }

  /** Which node the lens is on, if any. */
  get lensNode(): string | null {
    return this.lensIndex >= 0 ? this.world.nodes[this.lensIndex].id : null;
  }
}
