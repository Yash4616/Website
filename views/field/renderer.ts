import { COLOR, LENS } from "./config";
import { LENS_FRAGMENT } from "./lens";
import type { LabelAtlas } from "./labels";

/**
 * Raw WebGL2. Five small programs:
 *   grid    the graph-paper plane and the two axes, one full-screen quad
 *   line    edges, duration spans, ticks and query beams
 *   shape   node glyphs as signed distance fields
 *   sprite  labels from the atlas
 *   lens    the post-process pass (see lens.ts)
 *
 * The scene is drawn twice when the lens is up: layer A (the plot as
 * labelled) at full size, and layer B (the measured layer) scissored to the
 * lens. The lens pass composites the two.
 */

/* ----------------------------------------------------------------- batches */

export class Batch {
  data: Float32Array;
  length = 0;

  constructor(
    readonly stride: number,
    quads = 64,
  ) {
    this.data = new Float32Array(stride * 6 * quads);
  }

  reset(): void {
    this.length = 0;
  }

  get vertices(): number {
    return this.length / this.stride;
  }

  /** Reserve room for one quad and return the write offset. */
  quad(): number {
    const need = this.length + this.stride * 6;
    if (need > this.data.length) {
      const grown = new Float32Array(Math.max(need, this.data.length * 2));
      grown.set(this.data);
      this.data = grown;
    }
    const at = this.length;
    this.length = need;
    return at;
  }
}

export const LINE_STRIDE = 8;
export const SHAPE_STRIDE = 12;
export const SPRITE_STRIDE = 5;

const CORNERS = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];

export function pushLine(
  b: Batch,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  halfWidth: number,
  color: readonly [number, number, number],
  alpha: number,
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 0.001 || alpha <= 0.003) return;
  const ext = halfWidth + 1;
  const nx = (-dy / len) * ext;
  const ny = (dx / len) * ext;
  const at = b.quad();
  const d = b.data;
  for (let i = 0; i < 6; i++) {
    const along = CORNERS[i * 2];
    const side = CORNERS[i * 2 + 1] * 2 - 1;
    const o = at + i * LINE_STRIDE;
    d[o] = (along ? x2 : x1) + nx * side;
    d[o + 1] = (along ? y2 : y1) + ny * side;
    d[o + 2] = side * ext;
    d[o + 3] = halfWidth;
    d[o + 4] = color[0];
    d[o + 5] = color[1];
    d[o + 6] = color[2];
    d[o + 7] = alpha;
  }
}

export const SHAPE_KIND = { instrument: 0, satellite: 1, station: 2 } as const;

export function pushShape(
  b: Batch,
  cx: number,
  cy: number,
  radius: number,
  kind: number,
  arc: number,
  mark: number,
  color: readonly [number, number, number],
  alpha: number,
): void {
  if (alpha <= 0.003) return;
  const half = radius + 10;
  const at = b.quad();
  const d = b.data;
  for (let i = 0; i < 6; i++) {
    const lx = (CORNERS[i * 2] * 2 - 1) * half;
    const ly = (CORNERS[i * 2 + 1] * 2 - 1) * half;
    const o = at + i * SHAPE_STRIDE;
    d[o] = cx + lx;
    d[o + 1] = cy + ly;
    d[o + 2] = lx;
    d[o + 3] = ly;
    d[o + 4] = radius;
    d[o + 5] = kind;
    d[o + 6] = arc;
    d[o + 7] = mark;
    d[o + 8] = color[0];
    d[o + 9] = color[1];
    d[o + 10] = color[2];
    d[o + 11] = alpha;
  }
}

export function pushSprite(
  b: Batch,
  x: number,
  y: number,
  w: number,
  h: number,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  alpha: number,
): void {
  if (alpha <= 0.003) return;
  const at = b.quad();
  const d = b.data;
  for (let i = 0; i < 6; i++) {
    const cx = CORNERS[i * 2];
    const cy = CORNERS[i * 2 + 1];
    const o = at + i * SPRITE_STRIDE;
    d[o] = x + cx * w;
    d[o + 1] = y + cy * h;
    d[o + 2] = cx ? u1 : u0;
    d[o + 3] = cy ? v1 : v0;
    d[o + 4] = alpha;
  }
}

/* ----------------------------------------------------------------- shaders */

const VIEW = `
uniform vec2 u_view;
vec4 toClip(vec2 p) {
  return vec4(p.x / u_view.x * 2.0 - 1.0, 1.0 - p.y / u_view.y * 2.0, 0.0, 1.0);
}`;

const GRID_VS = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const GRID_FS = `#version 300 es
precision highp float;
uniform vec2 u_view;     // CSS px
uniform float u_px;      // framebuffer px per CSS px
uniform vec3 u_cam;      // x, y, zoom
uniform vec4 u_spacing;  // minor x, minor y, major x, major y, in world units
uniform vec4 u_axis;     // axis x, axis y, extent x, extent y
uniform float u_open;    // opening sequence, 0 to 1
uniform vec3 u_bg;
uniform vec3 u_rule;
uniform vec3 u_muted;
out vec4 o;

float rule(float w, float spacing, float zoom) {
  float d = abs(fract(w / spacing + 0.5) - 0.5) * spacing * zoom;
  return clamp(1.0 - d, 0.0, 1.0);
}

void main() {
  vec2 s = vec2(gl_FragCoord.x, u_view.y * u_px - gl_FragCoord.y) / u_px;
  float z = u_cam.z;
  vec2 w = (s - u_view * 0.5) / z + u_cam.xy;

  float minorFade = smoothstep(7.0, 18.0, min(u_spacing.x, u_spacing.y) * z);
  float minor = max(rule(w.x, u_spacing.x, z), rule(w.y, u_spacing.y, z)) * 0.42 * minorFade;
  float majorFade = smoothstep(10.0, 34.0, min(u_spacing.z, u_spacing.w) * z);
  float major = max(rule(w.x, u_spacing.z, z), rule(w.y, u_spacing.w, z)) * mix(0.5, 0.95, majorFade);
  float g = max(minor, major);

  // Opening: the rules draw outwards from the origin of the axes.
  vec2 rel = abs(w - u_axis.xy) / u_axis.zw;
  float reach = max(rel.x, rel.y);
  float front = u_open * 2.6;
  float reveal = u_open >= 1.0 ? 1.0 : 1.0 - smoothstep(front - 0.3, front, reach);

  vec3 col = mix(u_bg, u_rule, g * reveal);

  float ay = clamp(1.0 - abs(w.x - u_axis.x) * z, 0.0, 1.0) * step(w.y, u_axis.y + 0.5 / z);
  float ax = clamp(1.0 - abs(w.y - u_axis.y) * z, 0.0, 1.0) * step(u_axis.x - 0.5 / z, w.x);
  float axes = max(ax, ay) * clamp(u_open * 3.0, 0.0, 1.0);
  col = mix(col, u_muted, axes * 0.8);
  o = vec4(col, 1.0);
}`;

const LINE_VS = `#version 300 es
in vec2 a_pos;
in float a_dist;
in float a_half;
in vec4 a_color;
out float v_dist;
out float v_half;
out vec4 v_color;
${VIEW}
void main() {
  v_dist = a_dist;
  v_half = a_half;
  v_color = a_color;
  gl_Position = toClip(a_pos);
}`;

const LINE_FS = `#version 300 es
precision mediump float;
in float v_dist;
in float v_half;
in vec4 v_color;
out vec4 o;
void main() {
  float a = clamp(v_half + 0.5 - abs(v_dist), 0.0, 1.0) * v_color.a;
  o = vec4(v_color.rgb * a, a);
}`;

const SHAPE_VS = `#version 300 es
in vec2 a_pos;
in vec2 a_local;
in vec4 a_params;   // radius, kind, arc, mark
in vec4 a_color;
out vec2 v_local;
out vec4 v_params;
out vec4 v_color;
${VIEW}
void main() {
  v_local = a_local;
  v_params = a_params;
  v_color = a_color;
  gl_Position = toClip(a_pos);
}`;

const SHAPE_FS = `#version 300 es
precision highp float;
in vec2 v_local;
in vec4 v_params;
in vec4 v_color;
uniform vec3 u_bg;
uniform vec3 u_signal;
out vec4 o;
void main() {
  float radius = v_params.x;
  float kind = v_params.y;
  float d = length(v_local);
  float fill = 0.0;   // the glyph's own ground, so lines do not show through
  float ink = 0.0;
  if (kind < 0.5) {
    // Instrument: a ring and a core. The ring is drawn as far round as the
    // work is complete.
    float ring = clamp(1.3 - abs(d - radius), 0.0, 1.0);
    float ang = atan(v_local.x, -v_local.y);
    float t = (ang < 0.0 ? ang + 6.2831853 : ang) / 6.2831853;
    ring *= mix(0.3, 1.0, step(t, v_params.z));
    float core = clamp(radius * 0.34 + 0.5 - d, 0.0, 1.0);
    ink = max(ring, core);
    fill = clamp(radius + 0.5 - d, 0.0, 1.0);
  } else if (kind < 1.5) {
    // Satellite: a small disc.
    ink = clamp(radius + 0.5 - d, 0.0, 1.0);
    fill = ink;
  } else {
    // Station: a diamond outline.
    float dd = (abs(v_local.x) + abs(v_local.y)) * 0.7071;
    ink = clamp(1.3 - abs(dd - radius), 0.0, 1.0);
    fill = clamp(radius + 0.5 - dd, 0.0, 1.0);
  }
  vec3 col = mix(u_bg, v_color.rgb, ink);
  float a = max(fill, ink);
  float mark = clamp(1.3 - abs(d - (radius + 6.0)), 0.0, 1.0) * v_params.w;
  col = mix(col, u_signal, mark);
  a = max(a, mark) * v_color.a;
  o = vec4(col * a, a);
}`;

const SPRITE_VS = `#version 300 es
in vec2 a_pos;
in vec2 a_uv;
in float a_alpha;
out vec2 v_uv;
out float v_alpha;
${VIEW}
void main() {
  v_uv = a_uv;
  v_alpha = a_alpha;
  gl_Position = toClip(a_pos);
}`;

const SPRITE_FS = `#version 300 es
precision mediump float;
in vec2 v_uv;
in float v_alpha;
uniform sampler2D u_tex;
out vec4 o;
void main() { o = texture(u_tex, v_uv) * v_alpha; }`;

/* ---------------------------------------------------------------- renderer */

export type Layer = { shapes: Batch; sprites: Batch };

export type Frame = {
  width: number;
  height: number;
  camX: number;
  camY: number;
  zoom: number;
  open: number;
  spacing: [number, number, number, number];
  axis: [number, number, number, number];
  lines: Batch;
  a: Layer;
  b: Layer;
  lens: { x: number; y: number; strength: number; dispersion: number } | null;
};

type Program = {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  attribs: Record<string, number>;
};

type Target = { fbo: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };

export class Renderer {
  private gl: WebGL2RenderingContext;
  private grid!: Program;
  private line!: Program;
  private shape!: Program;
  private sprite!: Program;
  private lens!: Program;
  private quad!: WebGLBuffer;
  private dyn!: WebGLBuffer;
  private atlasTex!: WebGLTexture;
  private atlasVersion = -1;
  private targetA: Target | null = null;
  private targetB: Target | null = null;
  private pxW = 1;
  private pxH = 1;
  private dpr = 1;
  private lost = false;
  /** 1 for a full-resolution lens pass, 0.5 for half. */
  lensScale = 1;
  /** The GPU context came back after a loss: everything needs drawing again. */
  onRestore: (() => void) | null = null;
  /** The context came back but could not be rebuilt. */
  onFail: (() => void) | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    this.init();
    canvas.addEventListener("webglcontextlost", this.onLost);
    canvas.addEventListener("webglcontextrestored", this.onRestored);
  }

  // A browser can take the GPU context away at any time: a driver reset, a
  // laptop waking, a phone reclaiming memory from a background tab. Without
  // preventDefault the context never comes back and the canvas stays blank.
  private onLost = (e: Event): void => {
    e.preventDefault();
    this.lost = true;
  };

  private onRestored = (): void => {
    try {
      this.init();
    } catch {
      this.onFail?.();
      return;
    }
    this.lost = false;
    this.onRestore?.();
  };

  /** Create every GPU resource. Runs at start, and again when a lost context returns. */
  private init(): void {
    const gl = this.gl;
    // Anything from a previous context died with it.
    this.targetA = this.targetB = null;
    this.atlasVersion = -1;
    this.grid = this.link(GRID_VS, GRID_FS, ["a_pos"], [
      "u_view", "u_px", "u_cam", "u_spacing", "u_axis", "u_open", "u_bg", "u_rule", "u_muted",
    ]);
    this.line = this.link(LINE_VS, LINE_FS, ["a_pos", "a_dist", "a_half", "a_color"], ["u_view"]);
    this.shape = this.link(SHAPE_VS, SHAPE_FS, ["a_pos", "a_local", "a_params", "a_color"], [
      "u_view", "u_bg", "u_signal",
    ]);
    this.sprite = this.link(SPRITE_VS, SPRITE_FS, ["a_pos", "a_uv", "a_alpha"], ["u_view", "u_tex"]);
    this.lens = this.link(GRID_VS, LENS_FRAGMENT, ["a_pos"], [
      "u_a", "u_b", "u_res", "u_lens", "u_radius", "u_strength", "u_disp", "u_bend", "u_rule",
    ]);

    this.quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    this.dyn = gl.createBuffer()!;

    this.atlasTex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.atlasTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  /** A description of the GPU, used once to choose a starting tier. */
  gpuName(): string {
    const gl = this.gl;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return typeof name === "string" ? name : "";
  }

  private compile(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`Shader compile failed: ${gl.getShaderInfoLog(shader) ?? ""}`);
    }
    return shader;
  }

  private link(vs: string, fs: string, attribs: string[], uniforms: string[]): Program {
    const gl = this.gl;
    const program = gl.createProgram()!;
    gl.attachShader(program, this.compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program link failed: ${gl.getProgramInfoLog(program) ?? ""}`);
    }
    const p: Program = { program, uniforms: {}, attribs: {} };
    for (const a of attribs) p.attribs[a] = gl.getAttribLocation(program, a);
    for (const u of uniforms) p.uniforms[u] = gl.getUniformLocation(program, u);
    return p;
  }

  resize(cssW: number, cssH: number, dpr: number): void {
    this.dpr = dpr;
    this.pxW = Math.max(1, Math.round(cssW * dpr));
    this.pxH = Math.max(1, Math.round(cssH * dpr));
    if (this.canvas.width !== this.pxW || this.canvas.height !== this.pxH) {
      this.canvas.width = this.pxW;
      this.canvas.height = this.pxH;
    }
    this.dropTargets();
  }

  private dropTargets(): void {
    const gl = this.gl;
    for (const t of [this.targetA, this.targetB]) {
      if (!t) continue;
      gl.deleteFramebuffer(t.fbo);
      gl.deleteTexture(t.tex);
    }
    this.targetA = this.targetB = null;
  }

  private target(w: number, h: number): Target {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fbo, tex, w, h };
  }

  setLensScale(scale: number): void {
    if (scale === this.lensScale) return;
    this.lensScale = scale;
    this.dropTargets();
  }

  /** Upload the label atlas, but only when its pixels have changed. */
  syncAtlas(atlas: LabelAtlas): void {
    if (this.lost || atlas.version === this.atlasVersion) return;
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.atlasTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    this.atlasVersion = atlas.version;
  }

  private bindAttribs(p: Program, layout: [string, number][], stride: number): void {
    const gl = this.gl;
    let offset = 0;
    for (const [name, size] of layout) {
      const loc = p.attribs[name];
      if (loc >= 0) {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride * 4, offset * 4);
      }
      offset += size;
    }
  }

  private drawBatch(p: Program, batch: Batch, layout: [string, number][]): void {
    if (batch.length === 0) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dyn);
    gl.bufferData(gl.ARRAY_BUFFER, batch.data.subarray(0, batch.length), gl.DYNAMIC_DRAW);
    this.bindAttribs(p, layout, batch.stride);
    gl.drawArrays(gl.TRIANGLES, 0, batch.vertices);
  }

  private drawScene(f: Frame, layer: Layer, pxPerCss: number): void {
    const gl = this.gl;

    gl.useProgram(this.grid.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    this.bindAttribs(this.grid, [["a_pos", 2]], 2);
    const gu = this.grid.uniforms;
    gl.uniform2f(gu.u_view, f.width, f.height);
    gl.uniform1f(gu.u_px, pxPerCss);
    gl.uniform3f(gu.u_cam, f.camX, f.camY, f.zoom);
    gl.uniform4f(gu.u_spacing, ...f.spacing);
    gl.uniform4f(gu.u_axis, ...f.axis);
    gl.uniform1f(gu.u_open, f.open);
    gl.uniform3f(gu.u_bg, ...COLOR.bg);
    gl.uniform3f(gu.u_rule, ...COLOR.rule);
    gl.uniform3f(gu.u_muted, ...COLOR.muted);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.useProgram(this.line.program);
    gl.uniform2f(this.line.uniforms.u_view, f.width, f.height);
    this.drawBatch(this.line, f.lines, [["a_pos", 2], ["a_dist", 1], ["a_half", 1], ["a_color", 4]]);

    gl.useProgram(this.shape.program);
    gl.uniform2f(this.shape.uniforms.u_view, f.width, f.height);
    gl.uniform3f(this.shape.uniforms.u_bg, ...COLOR.bg);
    gl.uniform3f(this.shape.uniforms.u_signal, ...COLOR.signal);
    this.drawBatch(this.shape, layer.shapes, [["a_pos", 2], ["a_local", 2], ["a_params", 4], ["a_color", 4]]);

    gl.useProgram(this.sprite.program);
    gl.uniform2f(this.sprite.uniforms.u_view, f.width, f.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.atlasTex);
    gl.uniform1i(this.sprite.uniforms.u_tex, 0);
    this.drawBatch(this.sprite, layer.sprites, [["a_pos", 2], ["a_uv", 2], ["a_alpha", 1]]);
  }

  render(f: Frame): void {
    const gl = this.gl;
    if (this.lost) return;
    const lens = f.lens && f.lens.strength > 0.001 ? f.lens : null;

    if (!lens) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.pxW, this.pxH);
      gl.disable(gl.SCISSOR_TEST);
      this.drawScene(f, f.a, this.dpr);
      return;
    }

    if (!this.targetA) this.targetA = this.target(this.pxW, this.pxH);
    if (!this.targetB) {
      this.targetB = this.target(
        Math.max(1, Math.round(this.pxW * this.lensScale)),
        Math.max(1, Math.round(this.pxH * this.lensScale)),
      );
    }
    const A = this.targetA;
    const B = this.targetB;

    gl.bindFramebuffer(gl.FRAMEBUFFER, A.fbo);
    gl.viewport(0, 0, A.w, A.h);
    gl.disable(gl.SCISSOR_TEST);
    this.drawScene(f, f.a, this.dpr);

    // Layer B is only ever seen through the lens, so only draw that square.
    const bScale = this.dpr * this.lensScale;
    const r = (LENS.radius + 4) * bScale;
    const lx = lens.x * bScale;
    const ly = B.h - lens.y * bScale;
    gl.bindFramebuffer(gl.FRAMEBUFFER, B.fbo);
    gl.viewport(0, 0, B.w, B.h);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(Math.floor(lx - r), Math.floor(ly - r), Math.ceil(r * 2), Math.ceil(r * 2));
    this.drawScene(f, f.b, bScale);
    gl.disable(gl.SCISSOR_TEST);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.pxW, this.pxH);
    gl.useProgram(this.lens.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    this.bindAttribs(this.lens, [["a_pos", 2]], 2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, A.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, B.tex);
    const lu = this.lens.uniforms;
    gl.uniform1i(lu.u_a, 0);
    gl.uniform1i(lu.u_b, 1);
    gl.uniform2f(lu.u_res, this.pxW, this.pxH);
    gl.uniform2f(lu.u_lens, lens.x * this.dpr, this.pxH - lens.y * this.dpr);
    gl.uniform1f(lu.u_radius, LENS.radius * this.dpr);
    gl.uniform1f(lu.u_strength, lens.strength);
    gl.uniform1f(lu.u_disp, lens.dispersion);
    gl.uniform1f(lu.u_bend, LENS.bend);
    gl.uniform3f(lu.u_rule, ...COLOR.rule);
    gl.disable(gl.BLEND);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.enable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE0);
  }

  destroy(): void {
    // The context is left alive: a remount on the same canvas gets it back.
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
    this.onRestore = this.onFail = null;
    this.dropTargets();
  }
}
