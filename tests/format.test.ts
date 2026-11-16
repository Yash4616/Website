import assert from "node:assert/strict";
import { test } from "node:test";
import { belowPercent, briefAnchor, fmt, monthIndex, readingText, standingText, topPercentText } from "@/content/format";

test("fmt groups thousands and fixes decimals", () => {
  assert.equal(fmt(0), "0");
  assert.equal(fmt(24286), "24,286");
  assert.equal(fmt(1234567.891, 2), "1,234,567.89");
  assert.equal(fmt(0.94, 2), "0.94");
  assert.equal(fmt(0.9, 3), "0.900");
});

test("readingText appends the suffix", () => {
  assert.equal(readingText({ value: 60, decimals: 0, suffix: "+" }), "60+");
  assert.equal(readingText({ value: 0.942, decimals: 3, suffix: "" }), "0.942");
});

test("a standing never reads better than it was", () => {
  // 219 of 570 is 38.4%: rounded up to 39, never down to 38.
  assert.equal(topPercentText({ rank: 219, teams: 570 }), "top 39%");
  assert.equal(topPercentText({ rank: 1, teams: 1000 }), "top 1%");
  assert.equal(topPercentText({ rank: 570, teams: 570 }), "top 100%");
  // The mirror figure rounds down, so the two never claim more than the whole field.
  assert.equal(belowPercent({ rank: 219, teams: 570 }), 61);
  for (const [rank, teams] of [
    [219, 570],
    [130, 232],
    [1, 3],
    [7, 9],
  ]) {
    assert.ok(belowPercent({ rank, teams }) <= ((teams - rank) / teams) * 100);
    assert.ok(Math.ceil((rank / teams) * 100) >= (rank / teams) * 100);
  }
});

test("an unranked entry says so", () => {
  assert.equal(standingText({ rank: null, teams: 4185 }), "Unranked");
  assert.equal(topPercentText({ rank: null, teams: 4185 }), "4,185 teams");
  assert.equal(standingText({ rank: 3081, teams: 3947 }), "3,081 of 3,947");
});

test("monthIndex counts months from the origin", () => {
  assert.equal(monthIndex("2025-01", "2025-01"), 0);
  assert.equal(monthIndex("2026-11", "2025-01"), 22);
  assert.equal(monthIndex("2024-12", "2025-01"), -1);
});

test("stations map to their Brief sections", () => {
  assert.equal(briefAnchor("background"), "education");
  assert.equal(briefAnchor("contact"), "contact");
  assert.equal(briefAnchor("rag"), "rag");
});
