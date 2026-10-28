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
