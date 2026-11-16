import { LENS, TYPE } from "./config";
import { spring, stepSpring, type Spring } from "./physics";

/**
 * The lens: a circular refractive dome that follows the pointer on a spring
 * (about 14 rad/s). It is drawn as a post-process pass over the Field's
 * framebuffer. Inside it the scene is the measured layer, bent by the dome,
 * with red, green and blue sampled at slightly different offsets. The
 * offset is driven by pointer speed, so the fringe is a reading of motion:
 *
 *   dispersion = 0.002 + 0.006 x normalised pointer speed   (fraction of radius)
 */

export const LENS_FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D u_a;      // the Field as plotted
uniform sampler2D u_b;      // the measured layer
uniform vec2 u_res;         // framebuffer size in px
uniform vec2 u_lens;        // lens centre in framebuffer px, origin bottom left
uniform float u_radius;     // px
uniform float u_strength;   // 0 hidden, 1 present
uniform float u_disp;       // fraction of radius
uniform float u_bend;       // fraction of radius
uniform vec3 u_rule;
out vec4 o;

void main() {
  vec2 p = gl_FragCoord.xy;
  vec4 base = texture(u_a, p / u_res);
  vec2 d = p - u_lens;
  float len = length(d);
  float r = len / u_radius;
  if (r >= 1.0 || u_strength <= 0.001) {
    o = base;
    return;
  }
  // A smooth dome whose slope grows as r^5: flat across the middle, so the
  // reading stays legible, and steep at the rim, where the light bends.
  float slope = r * r * r * r * r;
  vec2 dir = len > 0.0 ? d / len : vec2(0.0);
  vec2 q = p - dir * (u_bend * slope * u_radius);
  // Chromatic dispersion: each channel leaves the dome at its own angle, so
  // the split scales with the slope. u_disp is the brief's dispersion
  // offset; 4.0 is the rim gradient of a quartic dome.
  vec2 ca = dir * (u_disp * 4.0 * slope * u_radius);
  vec3 col = vec3(
    texture(u_b, (q - ca) / u_res).r,
    texture(u_b, q / u_res).g,
    texture(u_b, (q + ca) / u_res).b
  );
  float px = 1.0 / u_radius;
  float rim = smoothstep(1.0 - 3.0 * px, 1.0 - 1.5 * px, r);
  col = mix(col, u_rule * 1.9, rim * 0.7);
  float inside = 1.0 - smoothstep(1.0 - 1.5 * px, 1.0, r);
  o = vec4(mix(base.rgb, col, inside * u_strength), 1.0);
}`;

export class Lens {
  private sx: Spring = spring(0);
  private sy: Spring = spring(0);
  private ss: Spring = spring(0);
  private tx = 0;
  private ty = 0;
  private target = 0;
  /** Smoothed pointer speed, 0 to 1 of the clamp. */
  speed = 0;
  enabled = true;

  get x(): number {
    return this.sx.x;
  }
  get y(): number {
    return this.sy.x;
  }
  get strength(): number {
    return Math.max(0, Math.min(1, this.ss.x));
  }
  get dispersion(): number {
    return LENS.dispersionRest + LENS.dispersionSpeed * this.speed;
  }
  get visible(): boolean {
    return this.enabled && (this.target > 0 || this.ss.x > 0.004);
  }

  moveTo(x: number, y: number, snap = false): void {
    this.tx = x;
    this.ty = y;
    if (snap || this.ss.x < 0.02) {
      this.sx.x = x;
      this.sy.x = y;
      this.sx.v = this.sy.v = 0;
    }
  }

  show(on: boolean): void {
    this.target = on && this.enabled ? 1 : 0;
  }

  /** Feed a pointer speed sample in px/s. */
  feedSpeed(pxPerSecond: number): void {
    const n = Math.min(1, pxPerSecond / TYPE.maxSpeed);
    this.speed = Math.max(this.speed, n);
  }

  step(dt: number): boolean {
    stepSpring(this.sx, this.tx, LENS.omega, 1, dt);
    stepSpring(this.sy, this.ty, LENS.omega, 1, dt);
    stepSpring(this.ss, this.target, LENS.omega, 1, dt);
    this.speed *= Math.exp(-dt * 6);
    if (this.speed < 0.002) this.speed = 0;
    const moving =
      Math.abs(this.sx.x - this.tx) > 0.05 ||
      Math.abs(this.sy.x - this.ty) > 0.05 ||
      Math.abs(this.sx.v) > 0.5 ||
      Math.abs(this.sy.v) > 0.5 ||
      Math.abs(this.ss.x - this.target) > 0.003 ||
      this.speed > 0;
    return moving;
  }
}
