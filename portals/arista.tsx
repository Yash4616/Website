"use client";

import { useEffect, useRef, useState } from "react";
import type { AristaBenchData } from "@/content/site";
import { fmt } from "@/content/format";
import { animate, reducedMotion } from "@/lib/anim";
import { STEP } from "@/views/field/config";
import { stepSpring, type Spring } from "@/views/field/physics";
import { FACE_BLINK_MS, FACE_CYCLE_MS } from "./config";

/**
 * A simplified study of the face, written for this page: one SDF orb with
 * two capsule eyes, in a single full-screen-quad fragment shader. It is not
 * the production face and does not share its rig.
 */

const VS = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform vec2 u_look;
uniform float u_open;
uniform float u_glad;
uniform float u_tilt;
uniform vec3 u_bg;
uniform vec3 u_ink;
out vec4 o;

float capsule(vec2 p, float h, float r) {
  p.y -= clamp(p.y, -h, h);
  return length(p) - r;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float d = length(uv);
  float R = 0.34;
  float aa = 1.5 / u_res.y;
  float body = smoothstep(R + aa, R - aa, d);
  float halo = exp(-max(d - R, 0.0) * 22.0) * 0.28;
  // Brighter towards a light source up and to the left.
  float light = 0.78 + 0.22 * clamp(1.0 - length(uv - vec2(-0.1, 0.12)) / R, 0.0, 1.0);
  vec3 col = mix(u_bg, u_ink, halo);
  col = mix(col, u_ink * light, body);

  float eyes = 1e3;
  for (int i = 0; i < 2; i++) {
    float s = i == 0 ? -1.0 : 1.0;
    vec2 p = uv - vec2(s * 0.105, 0.03) - u_look * 0.06;
    p.y -= s * u_tilt * 0.018;
    float h = 0.048 * u_open;
    float e = capsule(p, h, 0.028 + 0.004 * u_tilt * (s * 0.5 + 0.5));
    // Glad: cut the eye from below, leaving an upturned arc.
    float cut = length(p - vec2(0.0, -0.062)) - 0.064;
    e = mix(e, max(e, -cut), u_glad);
    eyes = min(eyes, e);
  }
  float eyeMask = smoothstep(aa, -aa, eyes) * body;
  col = mix(col, u_bg, eyeMask);
  o = vec4(col, 1.0);
}`;

type Params = { open: number; glad: number; tilt: number };

/** Expression poses for the study. Presentation only. */
const POSES: Record<string, Params> = {
  neutral: { open: 1, glad: 0, tilt: 0 },
  glad: { open: 0.95, glad: 1, tilt: 0 },
  curious: { open: 1.2, glad: 0, tilt: 1 },
  sleepy: { open: 0.16, glad: 0, tilt: 0 },
};

const BG = [13 / 255, 14 / 255, 15 / 255];
const INK = [233 / 255, 230 / 255, 223 / 255];

function FaceStudy({ expression }: { expression: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef<Params>(POSES.neutral);

  useEffect(() => {
    target.current = POSES[expression] ?? POSES.neutral;
  }, [expression]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) return;
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("u_res");
    const uLook = u("u_look");
    const uOpen = u("u_open");
    const uGlad = u("u_glad");
    const uTilt = u("u_tilt");
    gl.uniform3f(u("u_bg"), BG[0], BG[1], BG[2]);
    gl.uniform3f(u("u_ink"), INK[0], INK[1], INK[2]);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();

    const s: Record<"lx" | "ly" | "open" | "glad" | "tilt", Spring> = {
      lx: { x: 0, v: 0 },
      ly: { x: 0, v: 0 },
      open: { x: 1, v: 0 },
      glad: { x: 0, v: 0 },
      tilt: { x: 0, v: 0 },
    };
    let look = [0, 0];
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width * 1.5);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height * 1.5);
      look = [Math.max(-1, Math.min(1, dx)), Math.max(-1, Math.min(1, -dy))];
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const draw = () => {
      gl.uniform2f(uLook, s.lx.x, s.ly.x);
      gl.uniform1f(uOpen, Math.max(0.04, s.open.x));
      gl.uniform1f(uGlad, Math.max(0, Math.min(1, s.glad.x)));
      gl.uniform1f(uTilt, s.tilt.x);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    if (reducedMotion()) {
      const p = target.current;
      s.open.x = p.open;
      s.glad.x = p.glad;
      s.tilt.x = p.tilt;
      draw();
      const id = window.setInterval(() => {
        const q = target.current;
        s.open.x = q.open;
        s.glad.x = q.glad;
        s.tilt.x = q.tilt;
        draw();
      }, 250);
      return () => {
        window.clearInterval(id);
        window.removeEventListener("pointermove", onMove);
      };
    }

    let acc = 0;
    let visible = true;
    const observer = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    observer.observe(canvas);
    let alive = true;
    const t0 = performance.now();
    animate((dt, now) => {
      if (!alive) return false;
      if (!visible || document.hidden) return true;
      const p = target.current;
      // A blink every few seconds: the lids close for a moment.
      const blinkPhase = ((now - t0) % FACE_BLINK_MS) / FACE_BLINK_MS;
      const blinking = blinkPhase > 0.96;
      acc += dt;
      while (acc >= STEP) {
        acc -= STEP;
        stepSpring(s.lx, look[0], 10, 0.8, STEP);
        stepSpring(s.ly, look[1], 10, 0.8, STEP);
        stepSpring(s.open, blinking ? 0.06 : p.open, blinking ? 40 : 14, 0.75, STEP);
        stepSpring(s.glad, p.glad, 12, 0.8, STEP);
        stepSpring(s.tilt, p.tilt, 12, 0.7, STEP);
      }
      draw();
      return true;
    });
    return () => {
      alive = false;
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="face" aria-hidden="true" />;
}

function Meter({
  from,
  to,
  max,
  label,
  value,
}: {
  from: number;
  to: number;
  max: number;
  label: string;
  value: string;
}) {
  return (
    <div className="meter">
      <p className="meter-head">
        <span>{label}</span>
        <span className="meter-value">{value}</span>
      </p>
      <span className="meter-track" aria-hidden="true">
        <span
          className="meter-fill"
          style={{ left: `${(from / max) * 100}%`, width: `${Math.max(0.6, ((to - from) / max) * 100)}%` }}
        />
      </span>
    </div>
  );
}

/**
 * Face bench: a simplified study of the orb, plus the recorded frame-time and
 * latency readings against their budgets. The project is in progress.
 */
export function AristaBench({ bench }: { bench: AristaBenchData }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [cycled, setCycled] = useState(0);
  const expression = chosen ?? bench.expressions[cycled % bench.expressions.length].id;
  const { shader, reaction, progress } = bench;

  useEffect(() => {
    if (chosen || reducedMotion()) return;
    const id = window.setInterval(() => setCycled((c) => c + 1), FACE_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [chosen]);

  return (
    <div className="arista">
      <div className="face-wrap">
        <FaceStudy expression={expression} />
        <div className="switches" role="radiogroup" aria-label="Expression">
          {bench.expressions.map((e) => (
            <button
              key={e.id}
              type="button"
              role="radio"
              aria-checked={expression === e.id}
              onClick={() => setChosen(e.id)}
            >
              {e.label}
            </button>
          ))}
        </div>
        <p className="bench-caption">{bench.studyNote}</p>
      </div>

      <div className="face-readings">
        <p className="in-progress">In progress</p>
        <Meter
          from={shader.min}
          to={shader.max}
          max={shader.budget}
          label={`${shader.label}, against a ${fmt(shader.budget)} ${shader.unit} budget`}
          value={`${fmt(shader.min, shader.decimals)} to ${fmt(shader.max, shader.decimals)} ${shader.unit}`}
        />
        <Meter
          from={0}
          to={reaction.value}
          max={reaction.budget}
          label={`${reaction.label}, against a ${fmt(reaction.budget)} ${reaction.unit} budget`}
          value={`${fmt(reaction.value)} ${reaction.unit}`}
        />
        <Meter
          from={0}
          to={progress.done}
          max={progress.total}
          label={progress.label}
          value={`${fmt(progress.done)} of ${fmt(progress.total)}`}
        />
      </div>
    </div>
  );
}
