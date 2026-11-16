import assert from "node:assert/strict";
import { test } from "node:test";
import { site as clientSite } from "@/content/client";
import { instruments, nodes, site } from "@/content/site";

test("the content passes its schema, and the client reads the same object", () => {
  // content/client.ts hands the unparsed object to the browser. That is only
  // sound while parsing changes nothing: no defaults, no transforms.
  assert.deepEqual(clientSite, site);
});

test("node ids are unique and usable as URL slugs", () => {
  const ids = nodes.map((n) => n.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z-]+$/);
});

test("kinetic pieces spell the text they animate", () => {
  assert.equal(site.person.namePieces.join(""), site.person.name);
  assert.equal(site.person.rulePieces.join(""), site.person.rule);
  for (const i of instruments) assert.equal(i.pieces.join(""), i.name, i.id);
});

test("the open-source summary agrees with the list under it", () => {
  const { prs, summary } = site.openSource;
  const count = (status: string) => prs.filter((p) => p.status === status).length;
  const projects = new Set(prs.map((p) => p.repo)).size;
  assert.equal(
    summary,
    `${prs.length} PRs across ${projects} projects: ${count("merged")} merged, ${count("open")} open, ${count("withdrawn")} withdrawn.`,
  );
});

test("the first proof agrees with the merged PyTorch PRs listed", () => {
  const merged = site.openSource.prs.filter((p) => p.repo === "pytorch" && p.status === "merged").length;
  const proof = site.person.proofs.find((p) => /merged PRs in PyTorch/.test(p.text));
  assert.ok(proof, "a proof about merged PyTorch PRs");
  assert.equal(proof.value, merged);
});

test("merged and open PRs link to the PR they name", () => {
  for (const pr of site.openSource.prs) {
    if (pr.status === "withdrawn") continue;
    assert.ok(pr.href, `${pr.number} has a link`);
    assert.ok(pr.href.endsWith(`/pull/${pr.number.slice(1)}`), `${pr.number} links to itself`);
  }
});

test("every plotted month lies on the time axis", () => {
  const { origin, until, asOf } = site.field;
  assert.ok(origin <= asOf && asOf <= until);
  for (const n of nodes) {
    assert.ok(n.plot.start >= origin && n.plot.start <= until, `${n.id} starts on the axis`);
    const end = n.plot.end;
    if (end && end !== "present") assert.ok(end >= n.plot.start && end <= until, `${n.id} ends on the axis`);
    assert.ok(n.plot.layer <= site.field.layers.length - 0.5, `${n.id} sits on a layer`);
  }
});

test("each reading fits on its own gauge", () => {
  for (const i of instruments) assert.ok(i.reading.value <= i.reading.scaleMax, i.id);
});
