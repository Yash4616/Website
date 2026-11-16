import type { FieldNode, Site } from "@/content/site";
import { allNodes, readingText } from "@/content/format";

/**
 * A small BM25 index built in the browser from the content object. The Field
 * and the command palette both rank nodes with it. Scores are raw BM25
 * (k1 = 1.2, b = 0.75), shown to two decimals, the way a retrieval system
 * reports them.
 */

export type Result = { id: string; score: number };

export type SearchOutcome = {
  /** Every node with a score above zero, best first. */
  ranked: Result[];
  /** Nodes above the match threshold. Empty means: refuse. */
  hits: Result[];
  /** The closest node when nothing clears the threshold. */
  nearest: string | null;
};

const K1 = 1.2;
const B = 0.75;
/** Below this a node is not a match. One rare term matching once clears it. */
export const MATCH_THRESHOLD = 1.2;

const STOP = new Set(
  (
    "a an and are as at be by can could did do does for from had has have he her his how i if in into is it its " +
    "me my of on or our she so than that the their them then there these they this to too was we were what when " +
    "where which who why will with would you your yash about show tell give find any some all"
  ).split(" "),
);

function stem(t: string): string {
  if (t.length > 4 && t.endsWith("ies")) return `${t.slice(0, -3)}y`;
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}

export function tokenize(text: string, keepStop = false): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9+#]+/)
    .filter((t) => t.length > 0 && (keepStop || !STOP.has(t)))
    .map(stem);
}

type Doc = { id: string; tf: Map<string, number>; len: number; grams: Set<string> };

function trigrams(text: string): Set<string> {
  const s = ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
  const out = new Set<string>();
  for (let i = 0; i < s.length - 2; i++) out.add(s.slice(i, i + 3));
  return out;
}

function fieldsOf(site: Site, node: FieldNode): [string, number][] {
  const fields: [string, number][] = [
    [node.name, 3],
    [node.short, 2],
    [node.skills.join(" "), 2],
    [node.sentence, 1],
    [node.period, 1],
    [node.status, 1],
  ];
  if (node.kind === "instrument") {
    fields.push(
      [node.what, 1],
      [node.stack.join(" "), 1],
      [`${readingText(node.reading)} ${node.reading.label} ${node.reading.sample}`, 1],
      [node.limitation, 1],
      [node.finding ?? "", 1],
      [`${node.story.problem} ${node.story.approach} ${node.story.result}`, 1],
      [node.spec.map((r) => `${r.k} ${r.v}`).join(" "), 1],
      [node.bench.title, 1],
      [
        node.competitions
          ? `competition competitions leaderboard rank ${node.competitions.map((c) => `${c.name} ${c.kind} ${c.note}`).join(" ")}`
          : "",
        1,
      ],
    );
  } else if (node.kind === "satellite") {
    fields.push(
      [node.context ?? "", 1],
      [`${readingText(node.reading)} ${node.reading.label} ${node.reading.sample} ${node.reading.source}`, 1],
      [node.limitation, 1],
    );
  } else if (node.id === "background") {
    const e = site.person.education;
    fields.push(
      [`education ${e.degree} ${e.school} ${e.years} ${e.grade} ${e.graduates} university degree`, 2],
      [`certificates certification ${e.certifications}`, 1],
      [site.person.skills.map((s) => `${s.group} ${s.items.join(" ")}`).join(" "), 1],
    );
  } else if (node.id === "contact") {
    const p = site.person;
    fields.push(
      [`contact hire email résumé resume cv ${p.availability} ${p.availabilityDetail}`, 2],
      [p.links.map((l) => l.label).join(" "), 1],
    );
  }
  return fields;
}

export class Bm25Index {
  private docs: Doc[];
  private df = new Map<string, number>();
  private avgdl: number;
  private vocab: string[];

  constructor(site: Site) {
    this.docs = allNodes(site).map((node) => {
      const tf = new Map<string, number>();
      let len = 0;
      for (const [text, weight] of fieldsOf(site, node)) {
        for (const t of tokenize(text)) {
          tf.set(t, (tf.get(t) ?? 0) + weight);
          len += weight;
        }
      }
      return {
        id: node.id,
        tf,
        len,
        grams: trigrams(`${node.name} ${node.short} ${node.skills.join(" ")} ${node.sentence}`),
      };
    });
    for (const d of this.docs) {
      for (const t of d.tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
    }
    this.avgdl = this.docs.reduce((s, d) => s + d.len, 0) / Math.max(1, this.docs.length);
    this.vocab = [...this.df.keys()];
  }

  private idf(term: string): number {
    const n = this.df.get(term) ?? 0;
    const N = this.docs.length;
    return Math.log(1 + (N - n + 0.5) / (n + 0.5));
  }

  private termScore(doc: Doc, term: string): number {
    const tf = doc.tf.get(term) ?? 0;
    if (tf === 0) return 0;
    const norm = tf + K1 * (1 - B + (B * doc.len) / this.avgdl);
    return (this.idf(term) * tf * (K1 + 1)) / norm;
  }

  /**
   * Rank every node. While the last word is still being typed it also
   * matches as a prefix, so the ranking moves on every keystroke.
   */
  search(query: string): SearchOutcome {
    const terms = tokenize(query);
    const typing = query.length > 0 && !/\s$/.test(query);
    const rawLast = tokenize(query, true).at(-1) ?? "";
    const prefix = typing && rawLast.length >= 2 ? rawLast : "";
    const expansions = prefix
      ? this.vocab.filter((v) => v.startsWith(prefix) && v !== prefix).slice(0, 24)
      : [];
    const exact = new Set(terms);

    const ranked: Result[] = [];
    for (const doc of this.docs) {
      let score = 0;
      for (const t of exact) score += this.termScore(doc, t);
      if (expansions.length > 0 && !(exact.has(prefix) && (doc.tf.get(prefix) ?? 0) > 0)) {
        let best = 0;
        for (const v of expansions) best = Math.max(best, this.termScore(doc, v));
        score += best;
      }
      if (score > 0) ranked.push({ id: doc.id, score });
    }
    ranked.sort((a, b) => b.score - a.score);
    const hits = ranked.filter((r) => r.score >= MATCH_THRESHOLD);

    let nearest: string | null = ranked[0]?.id ?? null;
    if (nearest === null && query.trim().length > 0) {
      const q = trigrams(query);
      let bestSim = 0;
      for (const doc of this.docs) {
        let shared = 0;
        for (const g of q) if (doc.grams.has(g)) shared++;
        const sim = shared / (q.size + doc.grams.size - shared);
        if (sim > bestSim) {
          bestSim = sim;
          nearest = doc.id;
        }
      }
    }
    return { ranked, hits, nearest };
  }
}
