/**
 * Tuning constants for the Field. These are instrument settings, not facts:
 * every fact lives in content/site.ts.
 */

export const COLOR = {
  bg: [13 / 255, 14 / 255, 15 / 255] as const,
  ink: [233 / 255, 230 / 255, 223 / 255] as const,
  muted: [139 / 255, 135 / 255, 127 / 255] as const,
  rule: [42 / 255, 43 / 255, 44 / 255] as const,
  signal: [255 / 255, 90 / 255, 31 / 255] as const,
};

export const CSS_COLOR = {
  bg: "#0d0e0f",
  ink: "#e9e6df",
  muted: "#8b877f",
  rule: "#2a2b2c",
  signal: "#ff5a1f",
};

/** Fixed physics step: 120 Hz, semi-implicit Euler. */
export const STEP = 1 / 120;

export const CAMERA = {
  omega: 9, // rad/s, critically damped
  zoomWheel: 0.0016,
  maxZoom: 2.6,
  /** Zooming past this on a node opens it. */
  portalZoom: 2.4,
  /** Below this the Field shows names only. */
  neighbourhoodZoom: 0.62,
  /** Zoom used when flying to a node. */
  focusZoom: 1.05,
  diveZoom: 3.4,
  throwSeconds: 0.22,
};

export const NODE = {
  omega: 6,
  zeta: 0.8,
  edgeOmega: 3,
  magnetRadius: 140, // px
  magnetLean: 12, // px
  radius: { instrument: 11, satellite: 5, station: 8 },
  hitPad: 10,
};

export const LENS = {
  radius: 120, // px
  omega: 14,
  dispersionRest: 0.002,
  dispersionSpeed: 0.006,
  /** How far the dome bends light at the rim, as a fraction of the radius. */
  bend: 0.13,
  holdMs: 380,
  loupeLift: 150, // px above the finger
};

export const TYPE = {
  omega: 12,
  zeta: 0.7,
  maxSpeed: 2000, // px/s
  falloff: 160, // px
  maxShift: 26, // px
  maxSkew: 12, // deg
};

export const MAGNETIC = {
  radius: 80, // px
  pull: 6, // px
  omega: 16,
  zeta: 0.75,
};

export const OPENING_SECONDS = 1.2;

export const GOVERNOR = {
  window: 60,
  limitMs: 20,
  warmupFrames: 40,
};

/**
 * World units. A layer is a fixed width; the height of a month is chosen so
 * that the whole plot has the same proportions as the free area of the
 * screen, which lets the overview fill a phone as well as a desktop.
 */
export const WORLD = {
  layerW: 440,
  minMonthH: 30,
  maxMonthH: 110,
};
