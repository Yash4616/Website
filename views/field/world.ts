import type { FieldNode, Site } from "@/content/site";
import { allNodes, monthIndex } from "@/content/format";
import { NODE, WORLD } from "./config";

/**
 * The Field is a plot. X is the layer of the stack, Y is time. This module
 * turns the content object into plotted positions, axis ticks and edges.
 * World y grows downwards (screen convention), so later months are negative.
 */

export type WorldNode = {
  id: string;
  index: number;
  node: FieldNode;
  x: number;
  y: number;
  radius: number;
  /** World y where this node's duration span ends, or null for a point in time. */
  spanY: number | null;
  /** Fraction of the ring to draw. Below 1 only for unfinished work with a task count. */
  arc: number;
};

export type WorldEdge = {
  a: number;
  b: number;
  weight: number;
  skills: string[];
};

export type Tick = { pos: number; label: string; major: boolean };

export type World = {
  site: Site;
  nodes: WorldNode[];
  edges: WorldEdge[];
  byId: Map<string, WorldNode>;
  axisX: number;
  axisY: number;
  topY: number;
  rightX: number;
  xTicks: Tick[];
  yTicks: Tick[];
  layerW: number;
  monthH: number;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** `aspect` is height over width of the area the plot should fill. */
export function buildWorld(site: Site, aspect: number): World {
  const origin = site.field.origin;
  const nodes = allNodes(site);
  const [originYear, originMonth] = site.field.origin.split("-").map(Number);
  const lastMonth = monthIndex(site.field.until, origin);
  const layerW = WORLD.layerW;
  const spanLayers = site.field.layers.length - 0.5 + 0.6;
  const monthH = Math.min(
    WORLD.maxMonthH,
    Math.max(WORLD.minMonthH, (layerW * spanLayers * aspect) / (lastMonth + 0.5)),
  );
  const asOf = monthIndex(site.field.asOf, origin);

  const worldNodes: WorldNode[] = nodes.map((node, index) => {
    const start = monthIndex(node.plot.start, origin);
    const end =
      node.plot.end === null ? null : node.plot.end === "present" ? asOf : monthIndex(node.plot.end, origin);
    let arc = 1;
    if (node.kind === "instrument" && node.bench.kind === "face") {
      arc = node.bench.progress.done / node.bench.progress.total;
    }
    return {
      id: node.id,
      index,
      node,
      x: node.plot.layer * layerW,
      y: -start * monthH,
      radius: NODE.radius[node.kind],
      spanY: end === null || end === start ? null : -end * monthH,
      arc,
    };
  });

  // A skill most nodes share (Python) says nothing about how two nodes relate,
  // so only skills held by at most half the nodes draw an edge.
  const holders = new Map<string, number>();
  for (const wn of worldNodes) for (const k of wn.node.skills) holders.set(k, (holders.get(k) ?? 0) + 1);
  const distinctive = (k: string) => (holders.get(k) ?? 0) <= worldNodes.length / 2;
  const edges: WorldEdge[] = [];
  for (let a = 0; a < worldNodes.length; a++) {
    for (let b = a + 1; b < worldNodes.length; b++) {
      const shared = worldNodes[a].node.skills.filter(
        (s) => distinctive(s) && worldNodes[b].node.skills.includes(s),
      );
      if (shared.length > 0) edges.push({ a, b, weight: shared.length, skills: shared });
    }
  }
  edges.sort((p, q) => q.weight - p.weight);
  // Keep the graph readable: an edge stays if the pair shares 2 or more
  // distinctive skills, or if it is the strongest link either node has.
  const best = new Map<number, WorldEdge>();
  for (const e of edges) {
    if (!best.has(e.a)) best.set(e.a, e);
    if (!best.has(e.b)) best.set(e.b, e);
  }
  const kept = edges.filter((e) => e.weight >= 2 || best.get(e.a) === e || best.get(e.b) === e);
  edges.length = 0;
  edges.push(...kept);

  const axisX = -0.6 * layerW;
  const axisY = 0;
  const topY = -(lastMonth + 0.5) * monthH;
  const rightX = (site.field.layers.length - 0.5) * layerW;

  const xTicks: Tick[] = site.field.layers.map((label, i) => ({
    pos: i * layerW,
    label,
    major: true,
  }));

  const yTicks: Tick[] = [];
  for (let m = 0; m <= lastMonth; m += 3) {
    const monthOfYear = (originMonth - 1 + m) % 12;
    const year = originYear + Math.floor((originMonth - 1 + m) / 12);
    const major = monthOfYear === 0;
    yTicks.push({ pos: -m * monthH, label: major ? String(year) : MONTH_NAMES[monthOfYear], major });
  }

  return {
    site,
    nodes: worldNodes,
    edges,
    byId: new Map(worldNodes.map((n) => [n.id, n])),
    axisX,
    axisY,
    topY,
    rightX,
    xTicks,
    yTicks,
    layerW,
    monthH,
    bounds: {
      minX: axisX,
      minY: topY,
      maxX: rightX,
      maxY: axisY,
    },
  };
}

/** The neighbour of `from` that lies most directly in a direction. */
export function nearestInDirection(
  world: World,
  from: WorldNode,
  dx: number,
  dy: number,
): WorldNode | null {
  let best: WorldNode | null = null;
  let bestCost = Infinity;
  for (const candidate of world.nodes) {
    if (candidate === from) continue;
    // Normalise by the plot's own scale so a month and a layer count alike.
    const vx = (candidate.x - from.x) / world.layerW;
    const vy = (candidate.y - from.y) / (world.monthH * 4);
    const along = vx * dx + vy * dy;
    if (along <= 0.02) continue;
    const across = Math.abs(vx * dy - vy * dx);
    const cost = along + across * 2.2;
    if (cost < bestCost) {
      bestCost = cost;
      best = candidate;
    }
  }
  return best;
}
