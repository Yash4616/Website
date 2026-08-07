'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from 'ogl';
import { useIsMobile } from '@/hooks/use-media-query';
import { useMotionSafe } from '@/hooks/use-motion-safe';
import { useInViewRaf } from '@/hooks/use-in-view-raf';

/**
 * Neural particle field — MASTER_PLAN.md §7 Stage 3b. OGL only (D1).
 *
 * MAIN THREAD ONLY. The OffscreenCanvas + Web Worker migration (§9.2) is a
 * separate, deliberately isolated step: debugging "does the shader work" and
 * "does the worker transfer work" at the same time is miserable.
 *
 * ── §9.6 rule 3: zero allocations inside the loop ────────────────────────────
 * Every typed array, and every scratch value, is created once in `setup()` and
 * mutated in place thereafter. The render loop below does only scalar maths and
 * indexed typed-array writes — no object literals, no `new`, no array methods
 * that allocate, no closures. A single `new Float32Array()` per frame is a GC
 * stutter every few seconds, which reads as random jank nobody can reproduce.
 *
 * ── Topology ─────────────────────────────────────────────────────────────────
 * Link recomputation is O(n²) and is the expensive part, so it runs every 3rd
 * frame and caches the resulting pair list. Positions still update every frame
 * from that cache, so motion stays smooth while topology lags imperceptibly.
 * Comparisons use squared distances — no sqrt in the inner loop — and the scan
 * hard-breaks at MAX_LINKS.
 */

const DESKTOP = { count: 220, maxLinks: 900, attraction: true } as const;
const MOBILE = { count: 90, maxLinks: 300, attraction: false } as const;

const LINK_DIST = 1.5;
const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
const TOPOLOGY_EVERY = 3;
const SPHERE_RADIUS = 4;
const DRIFT_AMPLITUDE = 0.35;
const ATTRACT_RADIUS_SQ = 2 * 2;
const ATTRACT_LERP = 0.02;
const CAMERA_Z = 5;
const FOV = 75;

const POINT_VERT = /* glsl */ `
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 4.0 * (1.0 / -mv.z) * 6.0;
    gl_Position = projectionMatrix * mv;
  }
`;

const POINT_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    float glow = smoothstep(0.5, 0.15, d) * 0.5;  // cheap fake bloom (D1/D2)
    gl_FragColor = vec4(uColor, core * 0.6 + glow);
  }
`;

const LINE_VERT = /* glsl */ `
  attribute vec3 position;
  attribute float alpha;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying float vAlpha;
  void main() {
    vAlpha = alpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uColor, vAlpha * 0.35);
  }
`;

/** Detect WebGL without leaking a context (browsers cap at ~16). */
function webglAvailable(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl =
      probe.getContext('webgl') ||
      probe.getContext('experimental-webgl');
    if (!gl) return false;
    (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** No-WebGL / crash fallback (§7 Stage 3b). Pure CSS, costs nothing. */
function GradientMeshFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-[-10%] top-[-20%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(0,240,255,0.12),transparent_70%)]" />
      <div className="absolute bottom-[-25%] right-[-10%] h-[75vh] w-[75vh] rounded-full bg-[radial-gradient(circle,rgba(138,43,226,0.14),transparent_70%)]" />
      <div className="dot-grid absolute inset-0 opacity-40" />
    </div>
  );
}

export function NeuralCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { prefersReduced } = useMotionSafe();

  const [failed, setFailed] = useState(false);
  // Everything the frame callback needs, in one mutable box so the callback
  // identity never changes and the loop never re-subscribes.
  const sceneRef = useRef<{
    render: (timeMs: number) => void;
    dispose: () => void;
  } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!webglAvailable()) {
      setFailed(true);
      return;
    }

    // §12.2 — mobile is a genuinely lighter SCENE, not the same scene at a lower
    // DPR: fewer particles, fewer links, and no pointer attraction at all.
    const profile = isMobile ? MOBILE : DESKTOP;
    const COUNT = profile.count;
    const MAX_LINKS = profile.maxLinks;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio, 1.5),
      });
    } catch {
      setFailed(true);
      return;
    }

    const gl = renderer.gl;
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.display = 'block';
    host.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: FOV, near: 0.1, far: 100 });
    camera.position.set(0, 0, CAMERA_Z);
    const scene = new Transform();

    // ── Preallocated state. Nothing below is ever reallocated. ────────────────
    const positions = new Float32Array(COUNT * 3);
    const home = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);

    const linePositions = new Float32Array(MAX_LINKS * 2 * 3);
    const lineAlphas = new Float32Array(MAX_LINKS * 2);
    // Cached topology: particle index pairs plus the alpha for each pair.
    const linkPairs = new Int32Array(MAX_LINKS * 2);
    const linkAlpha = new Float32Array(MAX_LINKS);
    let linkCount = 0;

    // Golden-spiral distribution so the sphere has no visible poles or seams.
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const i3 = i * 3;
      home[i3] = Math.cos(theta) * radiusAtY * SPHERE_RADIUS;
      home[i3 + 1] = y * SPHERE_RADIUS;
      home[i3 + 2] = Math.sin(theta) * radiusAtY * SPHERE_RADIUS;
      positions[i3] = home[i3];
      positions[i3 + 1] = home[i3 + 1];
      positions[i3 + 2] = home[i3 + 2];
      seeds[i3] = Math.random() * Math.PI * 2;
      seeds[i3 + 1] = Math.random() * Math.PI * 2;
      seeds[i3 + 2] = Math.random() * Math.PI * 2;
      speeds[i] = 0.25 + Math.random() * 0.35;
    }

    const pointGeometry = new Geometry(gl, {
      position: { size: 3, data: positions, usage: gl.DYNAMIC_DRAW },
    });
    const pointProgram = new Program(gl, {
      vertex: POINT_VERT,
      fragment: POINT_FRAG,
      transparent: true,
      depthTest: false,
      uniforms: { uColor: { value: [0, 0.94, 1] } },
    });
    const points = new Mesh(gl, {
      mode: gl.POINTS,
      geometry: pointGeometry,
      program: pointProgram,
    });
    points.setParent(scene);

    const lineGeometry = new Geometry(gl, {
      position: { size: 3, data: linePositions, usage: gl.DYNAMIC_DRAW },
      alpha: { size: 1, data: lineAlphas, usage: gl.DYNAMIC_DRAW },
    });
    const lineProgram = new Program(gl, {
      vertex: LINE_VERT,
      fragment: LINE_FRAG,
      transparent: true,
      depthTest: false,
      uniforms: { uColor: { value: [0, 0.94, 1] } },
    });
    const lines = new Mesh(gl, {
      mode: gl.LINES,
      geometry: lineGeometry,
      program: lineProgram,
    });
    lines.setParent(scene);

    // ── Pointer state (scalars, never objects) ────────────────────────────────
    let pointerNdcX = 0;
    let pointerNdcY = 0;
    let attractStrength = 0; // eased to 0 when the pointer leaves
    let pointerInside = false;
    let frameIndex = 0;
    let viewHalfHeight = 1;
    let viewHalfWidth = 1;

    const resize = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
      viewHalfHeight = Math.tan((FOV / 2) * (Math.PI / 180)) * CAMERA_Z;
      viewHalfWidth = viewHalfHeight * (width / height);
    };
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointerNdcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdcY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      pointerInside = true;
    };
    const onPointerLeave = () => {
      pointerInside = false;
    };

    window.addEventListener('resize', resize, { passive: true });
    if (profile.attraction) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onPointerLeave);
    }

    const recomputeTopology = () => {
      linkCount = 0;
      outer: for (let a = 0; a < COUNT; a++) {
        const a3 = a * 3;
        const ax = positions[a3];
        const ay = positions[a3 + 1];
        const az = positions[a3 + 2];
        for (let b = a + 1; b < COUNT; b++) {
          const b3 = b * 3;
          const dx = ax - positions[b3];
          const dy = ay - positions[b3 + 1];
          const dz = az - positions[b3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz; // squared only — no sqrt
          if (distSq > LINK_DIST_SQ) continue;

          const pair = linkCount * 2;
          linkPairs[pair] = a;
          linkPairs[pair + 1] = b;
          linkAlpha[linkCount] = 1 - Math.sqrt(distSq) / LINK_DIST;
          linkCount++;
          if (linkCount >= MAX_LINKS) break outer; // hard cap
        }
      }
    };

    const render = (timeMs: number) => {
      const t = timeMs * 0.001;

      // 1. Drift — organic, non-repeating, applied on top of the rest position.
      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        const speed = speeds[i];
        positions[i3] = home[i3] + Math.sin(t * speed + seeds[i3]) * DRIFT_AMPLITUDE;
        positions[i3 + 1] =
          home[i3 + 1] + Math.sin(t * speed + seeds[i3 + 1]) * DRIFT_AMPLITUDE;
        positions[i3 + 2] =
          home[i3 + 2] + Math.sin(t * speed + seeds[i3 + 2]) * DRIFT_AMPLITUDE;
      }

      // 2. Pointer attraction (desktop only). Strength eases to zero on leave.
      if (profile.attraction) {
        attractStrength += ((pointerInside ? 1 : 0) - attractStrength) * 0.08;
        if (attractStrength > 0.001) {
          const targetX = pointerNdcX * viewHalfWidth;
          const targetY = pointerNdcY * viewHalfHeight;
          const lerp = ATTRACT_LERP * attractStrength;
          for (let i = 0; i < COUNT; i++) {
            const i3 = i * 3;
            const dx = targetX - positions[i3];
            const dy = targetY - positions[i3 + 1];
            const dz = -positions[i3 + 2];
            if (dx * dx + dy * dy + dz * dz > ATTRACT_RADIUS_SQ) continue;
            positions[i3] += dx * lerp;
            positions[i3 + 1] += dy * lerp;
            positions[i3 + 2] += dz * lerp;
          }
        }
      }

      // 3. Topology every 3rd frame; positions still refresh every frame below.
      if (frameIndex % TOPOLOGY_EVERY === 0) recomputeTopology();

      // 4. Upload.
      for (let k = 0; k < linkCount; k++) {
        const a3 = linkPairs[k * 2] * 3;
        const b3 = linkPairs[k * 2 + 1] * 3;
        const v = k * 6;
        linePositions[v] = positions[a3];
        linePositions[v + 1] = positions[a3 + 1];
        linePositions[v + 2] = positions[a3 + 2];
        linePositions[v + 3] = positions[b3];
        linePositions[v + 4] = positions[b3 + 1];
        linePositions[v + 5] = positions[b3 + 2];
        const alpha = linkAlpha[k];
        lineAlphas[k * 2] = alpha;
        lineAlphas[k * 2 + 1] = alpha;
      }

      pointGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.alpha.needsUpdate = true;
      lineGeometry.drawRange.count = linkCount * 2;

      // 5. Parallax — eased toward the pointer, transform only.
      scene.rotation.y += (pointerNdcX * 0.1 - scene.rotation.y) * 0.05;
      scene.rotation.x += (pointerNdcY * 0.06 - scene.rotation.x) * 0.05;

      renderer.render({ scene, camera });
      frameIndex++;
    };

    const dispose = () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      // §9.6 rule 2 — browsers cap live contexts at ~16; leaking them kills the
      // page after a handful of soft navigations.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };

    sceneRef.current = { render, dispose };

    // Reduced motion: one static frame, then nothing (§4.5, §3.5).
    if (prefersReduced) render(0);

    return () => {
      dispose();
      sceneRef.current = null;
    };
  }, [isMobile, prefersReduced]);

  // Stable identity — reads through the ref so the RAF gate never re-subscribes.
  const frame = useCallback((timeMs: number) => {
    sceneRef.current?.render(timeMs);
  }, []);

  useInViewRaf(hostRef, frame, { enabled: !failed && !prefersReduced });

  if (failed) return <GradientMeshFallback />;

  return (
    <>
      <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />
      {/* §3.5 — every canvas gets an sr-only sibling describing it. */}
      <span className="sr-only">
        A slowly drifting three-dimensional field of glowing nodes connected by
        faint lines, evoking a neural network. Decorative.
      </span>
    </>
  );
}

export default NeuralCanvas;
