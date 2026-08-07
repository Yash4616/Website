import { z } from 'zod';

/**
 * Config schema — REBUILD.md §6, §9.
 *
 * "Validate the config with a zod schema at build time so a malformed entry
 *  fails the build instead of shipping."
 *
 * The schema is the single source of truth for both validation and types; the
 * types in `src/types` are inferred from here. Declaring an interface alongside
 * a validator gives you two definitions that silently drift apart, and the one
 * that is wrong is always the one you trusted.
 *
 * The constraints below encode content rules, not just shapes:
 *   · `limitations` is required on any project carrying figures — §5 calls it
 *     "the single most credible element on the site", so a model entry without
 *     it should not build.
 *   · Star and fork counts are absent from the schema entirely. §6 says omit
 *     them rather than print zeros; leaving them unmodellable means they cannot
 *     creep back in.
 *   · URLs are validated as URLs, so a typo fails the build rather than
 *     shipping a dead link. `npm run check:links` then resolves them for real.
 */

const nonEmpty = z.string().trim().min(1);

export const specRowSchema = z.object({
  label: nonEmpty,
  value: nonEmpty,
});

export const depthSchema = z.enum(['Expert', 'Advanced', 'Proficient']);

export const methodSchema = z.object({
  name: nonEmpty,
  depth: depthSchema,
});

export const methodGroupSchema = z.object({
  label: nonEmpty,
  items: z.array(methodSchema).min(1),
});

export const barDatumSchema = z.object({
  label: nonEmpty,
  value: z.number().finite(),
  /** Comparison value — e.g. the reference implementation's score. */
  reference: z.number().finite().optional(),
  unit: z.string().optional(),
  /** Ratio as the repo states it, e.g. "1.06×". Never computed here. */
  note: z.string().optional(),
});

export const curveDataSchema = z
  .object({
    epoch: z.array(z.number()),
    trainLoss: z.array(z.number()),
    valAcc: z.array(z.number()),
  })
  // ≤48 points each (§6) and all three arrays the same length, or the figure
  // silently plots misaligned series.
  .refine((c) => c.epoch.length <= 48, { message: 'curve: downsample to ≤48 points' })
  .refine(
    (c) => c.epoch.length === c.trainLoss.length && c.epoch.length === c.valAcc.length,
    { message: 'curve: epoch, trainLoss and valAcc must be the same length' }
  );

export const matrixDataSchema = z
  .object({
    labels: z.array(nonEmpty),
    matrix: z.array(z.array(z.number())),
  })
  .refine((m) => m.matrix.length === m.labels.length, {
    message: 'matrix: row count must equal label count',
  })
  .refine((m) => m.matrix.every((row) => row.length === m.labels.length), {
    message: 'matrix: every row must be square against labels',
  });

export const figureSchema = z
  .object({
    kind: z.enum(['bar', 'curve', 'matrix']),
    /** Captions interpret, they do not label (§5, §7/3). */
    caption: nonEmpty,
    /** States what the figure SHOWS, not that it exists (§10). */
    alt: nonEmpty,
    xLabel: z.string().optional(),
    yLabel: z.string().optional(),
    bars: z.array(barDatumSchema).optional(),
    curve: curveDataSchema.optional(),
    matrix: matrixDataSchema.optional(),
  })
  .refine((f) => (f.kind === 'bar' ? Boolean(f.bars?.length) : true), {
    message: 'figure: kind "bar" requires bars',
  })
  .refine((f) => (f.kind === 'curve' ? Boolean(f.curve) : true), {
    message: 'figure: kind "curve" requires curve',
  })
  .refine((f) => (f.kind === 'matrix' ? Boolean(f.matrix) : true), {
    message: 'figure: kind "matrix" requires matrix',
  });

export const projectEntrySchema = z
  .object({
    /** Slug, also the /projects/[slug] param. */
    id: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be kebab-case'),
    name: nonEmpty,
    title: nonEmpty,
    /** The honest language list — never GitHub linguist's byte-count answer. */
    languages: z.array(nonEmpty).min(1),
    summary: nonEmpty,
    spec: z.array(specRowSchema).min(1),
    limitations: nonEmpty.nullable(),
    figures: z.array(figureSchema),
    links: z.object({
      repository: z.string().url(),
      demo: z.string().url().optional(),
    }),
    featured: z.boolean(),
  })
  .refine((p) => (p.figures.length > 0 ? p.limitations !== null : true), {
    message:
      'project: an entry with figures presents measured results and must state its limitations',
    path: ['limitations'],
  });

export const backgroundEntrySchema = z
  .object({
    qualification: nonEmpty,
    institution: nonEmpty,
    from: z.number().int(),
    to: z.number().int(),
    note: z.string().optional(),
  })
  .refine((b) => b.to >= b.from, { message: 'background: `to` precedes `from`' });

export const contactFactsSchema = z.object({
  email: z.string().email(),
  location: nonEmpty,
  /** §8.3 — the site must state plainly what Yash is looking for. */
  availability: nonEmpty,
});

export const externalLinkSchema = z.object({
  label: nonEmpty,
  href: z.string().url(),
});

export const docSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  /** Rendered as `01 /`. */
  mark: z.string().regex(/^\d{2}$/, 'section mark must be two digits'),
  title: nonEmpty,
});

/**
 * A note — REBUILD.md §5 "NOTES & REFERENCES", §7/4 sidenotes.
 *
 * One record serves both surfaces. On a wide screen the text appears in the
 * outer track beside its reference; at the foot of the document the same notes
 * are collected and linked back. Numbering is the array index, so it is
 * identical in both places and costs no JavaScript and no CSS counter.
 */
export const noteSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'note id must be kebab-case'),
  text: nonEmpty,
});

export const siteConfigSchema = z.object({
  meta: z.object({
    title: nonEmpty,
    description: nonEmpty,
    url: z.string().url(),
  }),
  masthead: z.object({
    name: nonEmpty,
    role: nonEmpty,
    institution: nonEmpty,
    /** §8.3 — one line stating what he wants. */
    availability: nonEmpty,
    revision: nonEmpty,
  }),
  /** A positioning statement, not a bio (§5). */
  summary: z.array(nonEmpty).min(1),
  sections: z.array(docSectionSchema).min(1),
  notes: z
    .array(noteSchema)
    .refine(
      (notes) => new Set(notes.map((n) => n.id)).size === notes.length,
      { message: 'notes: ids must be unique — they are anchor targets' }
    ),
  projects: z.array(projectEntrySchema).min(1),
  methods: z.array(methodGroupSchema).min(1),
  background: z.array(backgroundEntrySchema).min(1),
  contact: contactFactsSchema,
  links: z.array(externalLinkSchema).min(1),
  resumeUrl: nonEmpty,
  colophon: z.array(nonEmpty).min(1),
});

export type SpecRow = z.infer<typeof specRowSchema>;
export type Depth = z.infer<typeof depthSchema>;
export type Method = z.infer<typeof methodSchema>;
export type MethodGroup = z.infer<typeof methodGroupSchema>;
export type BarDatum = z.infer<typeof barDatumSchema>;
export type CurveData = z.infer<typeof curveDataSchema>;
export type MatrixData = z.infer<typeof matrixDataSchema>;
export type Figure = z.infer<typeof figureSchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type BackgroundEntry = z.infer<typeof backgroundEntrySchema>;
export type ContactFacts = z.infer<typeof contactFactsSchema>;
export type ExternalLink = z.infer<typeof externalLinkSchema>;
export type DocSection = z.infer<typeof docSectionSchema>;
export type Note = z.infer<typeof noteSchema>;
export type SiteConfig = z.infer<typeof siteConfigSchema>;

/**
 * Parses at module scope in `config.ts`, which means during `next build`.
 * A malformed entry throws with a field path and fails the build (§6, §9).
 */
export function validateConfig(input: unknown): SiteConfig {
  const result = siteConfigSchema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  · ${issue.path.join('.') || '(root)'} — ${issue.message}`)
      .join('\n');
    throw new Error(`siteConfig failed validation:\n${issues}`);
  }
  return result.data;
}
