import { test } from "node:test";
import assert from "node:assert/strict";
import { ITEMS, DOMAINS } from "../js/items.js";

test("24 items, 6 per domain, unique ids", () => {
  assert.equal(ITEMS.length, 24);
  assert.equal(new Set(ITEMS.map((i) => i.id)).size, 24);
  for (const d of Object.keys(DOMAINS)) assert.equal(ITEMS.filter((i) => i.domain === d).length, 6, d);
});

test("every item has two distinct options, an explanation and an https source", () => {
  for (const i of ITEMS) {
    assert.equal(i.options.length, 2, i.id);
    assert.notEqual(i.options[0], i.options[1], i.id);
    for (const f of ["prompt", "why", "principle"]) assert.ok(i[f]?.length > 10, `${i.id}.${f}`);
    assert.match(i.source.url, /^https:\/\//, i.id);
    assert.ok(i.source.label.length > 5, i.id);
  }
});

test("second look: 6 evidence items, 3 strong and 3 weak, each sourced", () => {
  const ev = ITEMS.filter((i) => i.evidence);
  assert.equal(ev.length, 6);
  assert.equal(ev.filter((i) => i.evidence.kind === "strong").length, 3);
  assert.equal(ev.filter((i) => i.evidence.kind === "weak").length, 3);
  for (const i of ev) {
    assert.ok(i.evidence.text.length > 30 && i.evidence.lesson.length > 20, i.id);
    assert.match(i.evidence.source.url, /^https:\/\//, i.id);
  }
});

test("retired items keep older attempts readable and never clash with current ids", async () => {
  const { RETIRED } = await import("../js/items-retired.js");
  const { readFileSync } = await import("node:fs");
  const live = new Set(ITEMS.map((i) => i.id));
  for (const r of RETIRED) assert.ok(!live.has(r.id), r.id);
  const known = new Set([...live, ...RETIRED.map((r) => r.id)]);
  const old = JSON.parse(readFileSync(new URL("./sample-data/v1-items.json", import.meta.url)));
  for (const t of old.attempts) for (const a of t.answers) assert.ok(known.has(a.id), a.id);
});
