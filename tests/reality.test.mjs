import { test } from "node:test";
import assert from "node:assert/strict";
import { guessCheck, secondLook } from "../js/scoring.js";

test("guess check thresholds (n = 24, SE ≈ 2.45)", () => {
  assert.equal(guessCheck(15, 13, 24).level, "close");
  assert.equal(guessCheck(17, 13, 24).level, "some");
  assert.equal(guessCheck(20, 13, 24).text, "Well above what you scored");
  assert.equal(guessCheck(5, 13, 24).text, "Well below what you scored");
  assert.equal(guessCheck(null, 13, 24), null);
});

const e = (kind, b, a) => ({ id: "x", kind, before: { choice: b[0], p: b[1] }, after: { choice: a[0], p: a[1] } });

test("weighs evidence: big move for strong, none for weak", () => {
  const r = secondLook([e("strong", [1, 0.8], [0, 0.8]), e("strong", [0, 0.5], [0, 0.95]), e("weak", [0, 0.8], [0, 0.8]), e("weak", [0, 0.65], [0, 0.65])]);
  assert.equal(r.pattern, "weighs");
  assert.ok(r.strong > 0.9);
  assert.equal(r.weak, 0);
});

test("defers: switches for weak evidence too", () => {
  const r = secondLook([e("strong", [1, 0.8], [0, 0.95]), e("weak", [0, 0.8], [1, 0.8])]);
  assert.equal(r.pattern, "defers");
  assert.equal(r.rows[1].switched, true);
});

test("sticks: no movement at all", () => {
  assert.equal(secondLook([e("strong", [1, 0.95], [1, 0.95]), e("weak", [0, 0.8], [0, 0.8])]).pattern, "sticks");
});

test("backwards: moves for weak, not strong", () => {
  assert.equal(secondLook([e("strong", [1, 0.8], [1, 0.8]), e("weak", [0, 0.95], [1, 0.65])]).pattern, "backwards");
});

test("no room to move is skipped, not penalised", () => {
  const r = secondLook([e("strong", [0, 0.95], [0, 0.95]), e("weak", [0, 0.8], [0, 0.8])]);
  assert.equal(r.nStrong, 0);
  assert.equal(r.pattern, "unknown");
});

test("moving against strong evidence is negative", () => {
  const r = secondLook([e("strong", [0, 0.65], [1, 0.65]), e("weak", [0, 0.8], [0, 0.8])]);
  assert.ok(r.strong < 0);
});

test("empty and malformed input", () => {
  assert.equal(secondLook().pattern, "unknown");
  assert.equal(secondLook([null, { kind: "weird" }]).rows.length, 0);
});
