import type { FieldNode, Instrument, Site } from "./site";

/**
 * Helpers that read the content object. This module has no zod import, so
 * client components can use it without shipping the validator: the content
 * is validated once on the server and handed to the client as plain data.
 */

/** Thousands separators and fixed decimals, so figures set in tabular columns. */
export function fmt(value: number, decimals = 0): string {
  const [int, frac] = value.toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

export function readingText(r: { value: number; decimals: number; suffix: string }): string {
  return `${fmt(r.value, r.decimals)}${r.suffix}`;
}

type Standing = { rank: number | null; teams: number };

/** A competition standing as "219 of 570", or "Unranked". */
export function standingText(c: Standing): string {
  return c.rank === null ? "Unranked" : `${fmt(c.rank)} of ${fmt(c.teams)}`;
}

/**
 * "top 39%" for rank 219 of 570: rounded up, so it never reads better than
 * it was. An unranked entry gives its field size instead.
 */
export function topPercentText(c: Standing): string {
  return c.rank === null ? `${fmt(c.teams)} teams` : `top ${Math.ceil((c.rank / c.teams) * 100)}%`;
}

/** Share of the field that finished below, rounded down: the mirror of topPercentText. */
export function belowPercent(c: { rank: number; teams: number }): number {
  return Math.floor(((c.teams - c.rank) / c.teams) * 100);
}

/** Months since the origin of the time axis. */
export function monthIndex(month: string, origin: string): number {
  const [y, m] = month.split("-").map(Number);
  const [oy, om] = origin.split("-").map(Number);
  return (y - oy) * 12 + (m - om);
}

export function allNodes(site: Site): FieldNode[] {
  return [...site.instruments, ...site.satellites, site.stations.background, site.stations.contact];
}

export function findInstrument(site: Site, slug: string): Instrument | undefined {
  return site.instruments.find((i) => i.id === slug);
}

export function findNode(site: Site, id: string): FieldNode | undefined {
  return allNodes(site).find((n) => n.id === id);
}

/** Where a node lives in the Brief view. */
export function briefAnchor(id: string): string {
  if (id === "background") return "education";
  if (id === "contact") return "contact";
  return id;
}

export type DataTable = {
  caption: string;
  columns: string[];
  rows: string[][];
};

/** Full measurement tables, derived from the bench data so nothing is typed twice. */
export function tablesFor(instrument: Instrument): DataTable[] {
  const bench = instrument.bench;
  if (bench.kind === "retrieval") {
    const retrieval: DataTable = {
      caption: `Retrieval, n = ${bench.n}`,
      columns: ["Configuration", ...bench.metrics.map((m) => m.label)],
      rows: bench.configs.map((c) => [
        c.shipped ? `${c.label} (shipped)` : c.label,
        ...bench.metrics.map((m) => fmt(c.retrieval[m.key], bench.decimals)),
      ]),
    };
    const generation: DataTable = {
      caption: "Generation",
      columns: ["Configuration", ...bench.generationLabels.map((g) => g.label), "Refusals"],
      rows: bench.configs.flatMap((c) => {
        const g = c.generation;
        if (!g) return [];
        return [
          [
            c.shipped ? `${c.label} (shipped)` : c.label,
            ...bench.generationLabels.map((l) => fmt(g[l.key], bench.decimals)),
            `${g.refused}/${g.unanswerable}`,
          ],
        ];
      }),
    };
    return [retrieval, generation];
  }
  if (bench.kind === "compression") {
    return [
      {
        caption: bench.axisNote,
        columns: ["Language", "Bytes per token against o200k_base"],
        rows: bench.languages.map((l) => [l.name, `${fmt(l.ratio, bench.decimals)}x`]),
      },
    ];
  }
  if (bench.kind === "compare") {
    return bench.groups.map((g) => ({
      caption: `${g.label}. ${g.caption}`,
      columns: ["Measure", "Value"],
      rows: g.bars.map((b) => [b.label, `${fmt(b.value, g.decimals)}${g.suffix}`]),
    }));
  }
  return [];
}
