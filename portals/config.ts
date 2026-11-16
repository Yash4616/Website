/** Tuning for portals and benches. Motion settings only: every fact comes from the content object. */
export const PORTAL = {
  /** Count-up of the headline reading. */
  countMs: 900,
  /** Pull a sheet this far down to close it, in px. */
  swipeClose: 110,
  /** Pinch to this fraction of the starting span to close. */
  pinchClose: 0.7,
  /** Horizontal travel that steps the story, in px. */
  swipeStep: 48,
};

/** Bars and needles spring between measured values. */
export const BENCH_SPRING = { omega: 11, zeta: 0.78 };

/** One trip of the query particle through the retrieval pipeline. */
export const PIPELINE_SECONDS = 2.6;

/** One cycle of the grading loop schematic. */
export const GRADING_SECONDS = 7.5;

/** The face study cycles expressions at this interval until one is chosen. */
export const FACE_CYCLE_MS = 2600;
export const FACE_BLINK_MS = 3900;

/** Padding either side of the compression data, in ratio units. */
export const COMPRESSION_PAD = 0.04;
