import { z } from "zod";
import { data } from "./data";
import { allNodes, findInstrument, findNode } from "./format";

/**
 * The schema for the single content object, and the validated object itself.
 * Both renderers (Brief and Field) read from here. No component may contain a
 * fact as a literal: add it to content/data.ts, then render it. Every number
 * comes from the facts block of the build brief or from the project's own
 * docs in C:Dev (each file in content/work/ names its source).
 *
 * Server code imports `site` from this module. Client code imports types
 * from here (erased at build) and the plain object from content/client.ts.
 */

/* ------------------------------------------------------------------ schema */

const Month = z.string().regex(/^\d{4}-\d{2}$/);

const LinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const ReadingSchema = z.object({
  value: z.number(),
  decimals: z.number().int().min(0),
  suffix: z.string(),
  /** What the number measures, e.g. "recall@5". */
  label: z.string().min(1),
  /** Sample size or the comparison that frames the number. */
  sample: z.string().min(1),
  source: z.string().min(1),
  /** Right-hand end of the gauge scale. */
  scaleMax: z.number().positive(),
  scaleLabel: z.string().min(1),
});

const PlotSchema = z.object({
  /** X: layer of the stack. 0 is below Python, 4 is the product surface. */
  layer: z.number().min(-1).max(5),
  /** Y: when the work started. */
  start: Month,
  /** When it ended. "present" for ongoing work, null for a single month. */
  end: z.union([Month, z.literal("present"), z.null()]),
});

const PiecesSchema = z.array(z.string().min(1)).min(1);

const NodeBase = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  name: z.string().min(1),
  /** Short name for the overview zoom level. */
  short: z.string().min(1),
  period: z.string().min(1),
  status: z.string().min(1),
  plot: PlotSchema,
  /** Drawn from person.skills. Nodes that share a skill are joined by an edge. */
  skills: z.array(z.string()),
  sentence: z.string().min(1),
});

const SpecRow = z.object({ k: z.string().min(1), v: z.string().min(1) });

const StorySchema = z.object({
  problem: z.string().min(1),
  approach: z.string().min(1),
  result: z.string().min(1),
});

const RetrievalMetrics = z.object({
  r1: z.number(),
  r3: z.number(),
  r5: z.number(),
  r10: z.number(),
  mrr: z.number(),
  ndcg10: z.number(),
});

const GenerationMetrics = z.object({
  faithfulness: z.number(),
  relevancy: z.number(),
  contextPrecision: z.number(),
  contextRecall: z.number(),
  refused: z.number().int(),
  unanswerable: z.number().int(),
});

const RagBench = z.object({
  kind: z.literal("retrieval"),
  title: z.string(),
  n: z.number().int(),
  decimals: z.number().int(),
  metrics: z.array(
    z.object({
      key: RetrievalMetrics.keyof(),
      label: z.string(),
      onBench: z.boolean(),
    }),
  ),
  generationLabels: z.array(
    z.object({
      key: z.enum([
        "faithfulness",
        "relevancy",
        "contextPrecision",
        "contextRecall",
      ]),
      label: z.string(),
    }),
  ),
  stages: z.array(z.object({ id: z.string(), label: z.string() })),
  configs: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      shipped: z.boolean(),
      stages: z.array(z.string()),
      retrieval: RetrievalMetrics,
      generation: GenerationMetrics.nullable(),
    }),
  ),
  topOneNote: z.string(),
  refusalLabel: z.string(),
  refusalMissing: z.string(),
});

const TokenizerBench = z.object({
  kind: z.literal("compression"),
  title: z.string(),
  baseline: z.number(),
  baselineLabel: z.string(),
  decimals: z.number().int(),
  axisNote: z.string(),
  languages: z.array(
    z.object({
      name: z.string(),
      ratio: z.number(),
      group: z.enum(["code", "text"]),
    }),
  ),
  sample: PiecesSchema,
  sampleNote: z.string(),
});

const PytorchBench = z.object({
  kind: z.literal("diff"),
  title: z.string(),
  base: z.string(),
  fn: z.string(),
  method: z.string(),
  cpython: z.string(),
  fields: z.array(z.string()),
  beforeLabel: z.string(),
  afterLabel: z.string(),
  beforeNote: z.string(),
  afterNote: z.string(),
  subclassLabel: z.string(),
  inheritLabel: z.string(),
  composeLabel: z.string(),
});

const CodeneuronBench = z.object({
  kind: z.literal("grading"),
  title: z.string(),
  questions: z.number().int(),
  criteria: z.number().int(),
  attempts: z.number().int(),
  stages: z.array(z.object({ id: z.string(), label: z.string(), note: z.string() })),
  loopNote: z.string(),
  services: z.array(
    z.object({ id: z.string(), label: z.string(), note: z.string() }),
  ),
  boundaryNote: z.string(),
  credit: z.string(),
});

const AristaBench = z.object({
  kind: z.literal("face"),
  title: z.string(),
  studyNote: z.string(),
  shader: z.object({
    min: z.number(),
    max: z.number(),
    budget: z.number(),
    decimals: z.number().int(),
    unit: z.string(),
    label: z.string(),
  }),
  reaction: z.object({
    value: z.number(),
    budget: z.number(),
    unit: z.string(),
    label: z.string(),
  }),
  progress: z.object({ done: z.number().int(), total: z.number().int(), label: z.string() }),
  expressions: z.array(z.object({ id: z.string(), label: z.string() })),
});

/**
 * A generic comparison bench: one or more groups of recorded values, each
 * group drawn as springing bars on its own stated axis.
 */
const CompareBench = z.object({
  kind: z.literal("compare"),
  title: z.string(),
  groups: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        caption: z.string(),
        /** Left end of the axis. Stated on screen whenever it is not zero. */
        floor: z.number(),
        ceiling: z.number(),
        decimals: z.number().int().min(0),
        suffix: z.string(),
        bars: z
          .array(
            z.object({
              label: z.string(),
              value: z.number(),
              /** The bar the group is about: drawn in ink, the rest in grey. */
              emphasis: z.boolean(),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

const BenchSchema = z.discriminatedUnion("kind", [
  RagBench,
  TokenizerBench,
  PytorchBench,
  CodeneuronBench,
  AristaBench,
  CompareBench,
]);

/** One entry in a competition record, such as a Kaggle leaderboard standing. */
const CompetitionSchema = z
  .object({
    name: z.string().min(1),
    /** Short name for chart labels. */
    short: z.string().min(1),
    kind: z.string().min(1),
    /** Null when the entry has no ranked result. */
    rank: z.number().int().positive().nullable(),
    teams: z.number().int().positive(),
    /** Null when the rank is final; otherwise says what the rank is. */
    standingNote: z.string().nullable(),
    note: z.string(),
  })
  .refine((c) => c.rank === null || c.rank <= c.teams, { message: "rank cannot exceed the number of teams" });

const InstrumentSchema = NodeBase.extend({
  kind: z.literal("instrument"),
  pieces: PiecesSchema,
  what: z.string().min(1),
  stack: z.array(z.string()),
  reading: ReadingSchema,
  limitation: z.string().min(1),
  finding: z.string().nullable(),
  story: StorySchema,
  spec: z.array(SpecRow),
  links: z.array(LinkSchema),
  bench: BenchSchema,
  /** A record of entries, listed in full wherever the project is shown. */
  competitions: z.array(CompetitionSchema).optional(),
}).refine((n) => n.pieces.join("") === n.name, {
  message: "pieces must join to the name exactly",
});

const SatelliteSchema = NodeBase.extend({
  kind: z.literal("satellite"),
  context: z.string().nullable(),
  reading: ReadingSchema,
  limitation: z.string().min(1),
});

const StationSchema = NodeBase.extend({
  kind: z.literal("station"),
});

const PrSchema = z.object({
  repo: z.enum(["pytorch", "huggingface", "kubernetes"]),
  number: z.string().regex(/^#\d+$/),
  area: z.string(),
  title: z.string().min(1),
  status: z.enum(["merged", "open", "withdrawn"]),
  statusNote: z.string(),
  detail: z.string(),
  href: z.string().nullable(),
});

const SiteSchema = z.object({
  url: z.string().url(),
  person: z
    .object({
      name: z.string(),
      namePieces: PiecesSchema,
      title: z.string(),
      line: z.string(),
      rule: z.string(),
      rulePieces: PiecesSchema,
      availability: z.string(),
      availabilityDetail: z.string(),
      availabilityShort: z.string(),
      email: z.string().email(),
      resume: z.string().startsWith("/"),
      links: z.array(LinkSchema),
      proofs: z.array(
        z.object({
          value: z.number(),
          decimals: z.number().int(),
          suffix: z.string(),
          text: z.string(),
        }),
      ),
      education: z.object({
        degree: z.string(),
        school: z.string(),
        years: z.string(),
        grade: z.string(),
        graduates: z.string(),
        certifications: z.string(),
      }),
      skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
    })
    .refine((p) => p.namePieces.join("") === p.name, {
      message: "namePieces must join to the name exactly",
    })
    .refine((p) => p.rulePieces.join("") === p.rule, {
      message: "rulePieces must join to the rule exactly",
    }),
  field: z.object({
    /** Month at the origin of the time axis. */
    origin: Month,
    /** Month that "present" resolves to when a span is drawn. */
    asOf: Month,
    /** Last month drawn on the time axis. */
    until: Month,
    xTitle: z.string(),
    yTitle: z.string(),
    layers: z.array(z.string()),
    hint: z.string(),
    hintTouch: z.string(),
    queryPrompt: z.string(),
    refusal: z.string(),
    lensNote: z.string(),
  }),
  labels: z.object({
    reading: z.string(),
    limitation: z.string(),
    finding: z.string(),
    benchNote: z.string(),
    beats: z.object({
      problem: z.string(),
      approach: z.string(),
      result: z.string(),
      limitation: z.string(),
    }),
  }),
  instruments: z.array(InstrumentSchema),
  satellites: z.array(SatelliteSchema),
  stations: z.object({ background: StationSchema, contact: StationSchema }),
  openSource: z.object({
    summary: z.string(),
    projects: z.object({ pytorch: z.string(), huggingface: z.string(), kubernetes: z.string() }),
    prs: z.array(PrSchema),
  }),
});

/* ----------------------------------------------------------------- exports */

/** Throws at build time, naming the field, if content/data.ts breaks the schema. */
export const site = SiteSchema.parse(data);

export type Site = z.infer<typeof SiteSchema>;
/** The authoring shape of the whole object, for content/data.ts. */
export type SiteInput = z.input<typeof SiteSchema>;
export type Instrument = z.infer<typeof InstrumentSchema>;
export type Satellite = z.infer<typeof SatelliteSchema>;
export type Station = z.infer<typeof StationSchema>;
export type FieldNode = Instrument | Satellite | Station;
export type Reading = z.infer<typeof ReadingSchema>;
export type Pr = z.infer<typeof PrSchema>;
export type Competition = z.infer<typeof CompetitionSchema>;
export type Bench = z.infer<typeof BenchSchema>;
export type RagBenchData = z.infer<typeof RagBench>;
export type TokenizerBenchData = z.infer<typeof TokenizerBench>;
export type PytorchBenchData = z.infer<typeof PytorchBench>;
export type CodeneuronBenchData = z.infer<typeof CodeneuronBench>;
export type CompareBenchData = z.infer<typeof CompareBench>;
/** The authoring shape of one project, for the files in content/work/. */
export type InstrumentInput = z.input<typeof InstrumentSchema>;
export type AristaBenchData = z.infer<typeof AristaBench>;

export * from "./format";

export const instruments: Instrument[] = site.instruments;
export const satellites: Satellite[] = site.satellites;
export const stations: Station[] = [site.stations.background, site.stations.contact];
export const nodes: FieldNode[] = allNodes(site);

export function instrumentBySlug(slug: string): Instrument | undefined {
  return findInstrument(site, slug);
}

export function nodeById(id: string): FieldNode | undefined {
  return findNode(site, id);
}
