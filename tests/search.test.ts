import assert from "node:assert/strict";
import { test } from "node:test";
import { site } from "@/content/site";
import { Bm25Index, MATCH_THRESHOLD, tokenize } from "@/lib/bm25";
import { buildWorld, nearestInDirection } from "@/views/field/world";

const index = new Bm25Index(site);
const top = (q: string) => index.search(q).hits[0]?.id;

test("tokenize lowercases, strips accents, drops stop words and plural s", () => {
  assert.deepEqual(tokenize("The Résumé of Yash"), ["resume"]);
  assert.deepEqual(tokenize("tokens and queries"), ["token", "query"]);
  assert.deepEqual(tokenize("the of", true), ["the", "of"]);
});

test("a query finds the project it describes", () => {
  assert.equal(top("recall "), "rag");
  assert.equal(top("rust tokenizer "), "tokenizer");
  assert.equal(top("dynamo "), "pytorch");
  assert.equal(top("continual learning "), "oracle");
  assert.ok(index.search("hire email ").hits.some((h) => h.id === "contact"));
  assert.ok(index.search("university degree ").hits.some((h) => h.id === "background"));
});

test("the word being typed matches as a prefix", () => {
  assert.equal(top("tokeni"), "tokenizer");
});

test("results are sorted and every hit clears the threshold", () => {
  const { hits, ranked } = index.search("python model evaluation ");
  assert.ok(hits.length > 0);
  for (let i = 1; i < ranked.length; i++) assert.ok(ranked[i - 1].score >= ranked[i].score);
  for (const h of hits) assert.ok(h.score >= MATCH_THRESHOLD);
});

test("a question the site cannot answer is refused, with a nearest node", () => {
  const outcome = index.search("what is your favourite food");
  assert.equal(outcome.hits.length, 0);
  assert.ok(outcome.nearest);
  assert.equal(index.search("   ").hits.length, 0);
});

test("the plot holds every node, and edges join real nodes", () => {
  const world = buildWorld(site, 0.6);
  assert.equal(world.nodes.length, site.instruments.length + site.satellites.length + 2);
  for (const e of world.edges) {
    assert.ok(world.nodes[e.a] && world.nodes[e.b] && e.a !== e.b);
    assert.ok(e.skills.length > 0);
  }
  for (const n of world.nodes) {
    assert.ok(n.x >= world.bounds.minX && n.x <= world.bounds.maxX, `${n.id} x in bounds`);
    assert.ok(n.y >= world.bounds.minY && n.y <= world.bounds.maxY, `${n.id} y in bounds`);
  }
});

test("arrow keys can reach every node from some other node", () => {
  const world = buildWorld(site, 0.6);
  const reached = new Set<string>();
  for (const from of world.nodes) {
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const next = nearestInDirection(world, from, dx, dy);
      if (next) {
        assert.notEqual(next.id, from.id);
        reached.add(next.id);
      }
    }
  }
  assert.equal(reached.size, world.nodes.length);
});
