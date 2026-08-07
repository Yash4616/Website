/**
 * Document model — REBUILD.md §5.
 *
 * These types are inferred from the zod schema in `src/data/schema.ts` rather
 * than declared twice. A hand-written interface next to a validator is two
 * sources of truth that drift; §6 requires the config to fail the *build* when
 * malformed, so the schema has to be the authority and the types follow it.
 */
export type {
  SpecRow,
  Depth,
  Method,
  MethodGroup,
  BarDatum,
  CurveData,
  MatrixData,
  Figure,
  ProjectEntry,
  BackgroundEntry,
  ContactFacts,
  Correspondence,
  ExternalLink,
  DocSection,
  SiteConfig,
} from '@/data/schema';
