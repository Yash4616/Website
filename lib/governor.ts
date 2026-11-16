/**
 * The frame governor. It watches frame time over a rolling window of 60
 * frames. When the 95th percentile exceeds 20 ms the Field drops one tier:
 * A (full lens pass) to B (half-resolution lens pass, lower pixel ratio) to
 * C (the Brief view). It never steps back up in the same session.
 */

export type Tier = "A" | "B" | "C";

const TIER_KEY = "field.tier";

export class Governor {
  private samples: Float32Array;
  private sorted: Float32Array;
  private count = 0;
  private cursor = 0;
  private skip: number;

  constructor(
    private window = 60,
    private limitMs = 20,
    private warmup = 40,
  ) {
    this.samples = new Float32Array(window);
    this.sorted = new Float32Array(window);
    this.skip = warmup;
  }

  /** Forget the window, for example after a tier change or a pause. */
  reset(warmup = this.warmup): void {
    this.count = 0;
    this.cursor = 0;
    this.skip = warmup;
  }

  /** Record one frame. Returns true when the tier should drop. */
  push(frameMs: number): boolean {
    if (this.skip > 0) {
      this.skip--;
      return false;
    }
    this.samples[this.cursor] = frameMs;
    this.cursor = (this.cursor + 1) % this.window;
    if (this.count < this.window) this.count++;
    if (this.count < this.window) return false;
    return this.p95() > this.limitMs;
  }

  p95(): number {
    if (this.count === 0) return 0;
    this.sorted.set(this.samples);
    const view = this.sorted.subarray(0, this.count).sort();
    return view[Math.min(this.count - 1, Math.ceil(this.count * 0.95) - 1)];
  }
}

/** The lowest tier this session has been dropped to, if any. */
export function sessionTier(): Tier | null {
  try {
    const t = sessionStorage.getItem(TIER_KEY);
    return t === "B" || t === "C" ? t : null;
  } catch {
    return null;
  }
}

export function rememberTier(tier: Tier): void {
  try {
    sessionStorage.setItem(TIER_KEY, tier);
  } catch {
    // Without storage the drop still holds for this page.
  }
}

/** Starting tier: B for touch devices, small screens and integrated or software GPUs. */
export function initialTier(gpu: string): Tier {
  const floor = sessionTier();
  if (floor) return floor;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  const weakGpu = /swiftshader|llvmpipe|software|intel(?!.*arc)|mali|adreno|powervr/i.test(gpu);
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  return coarse || small || weakGpu || fewCores ? "B" : "A";
}
