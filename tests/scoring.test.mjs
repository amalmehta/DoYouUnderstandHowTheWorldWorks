import { test } from "node:test";
import assert from "node:assert/strict";
import { score, verdict, maxSE, headline } from "../js/scoring.js";

const mk = (n, p, nCorrect, domain = "health") =>
  Array.from({ length: n }, (_, i) => ({ id: `x${i}`, domain, p, correct: i < nCorrect }));

test("perfectly calibrated: 80% sure, 80% right → noise", () => {
  const s = score(mk(20, 0.8, 16));
  assert.equal(s.overall.accuracy, 0.8);
  assert.ok(Math.abs(s.overall.gap) < 1e-9);
  assert.equal(s.overall.verdict.level, "noise");
});

test("overconfident: certain on 24, right on 12 → clearly overconfident", () => {
  const s = score(mk(24, 0.95, 12));
  assert.equal(s.overall.verdict.level, "clearly");
  assert.equal(s.overall.verdict.dir, "overconfident");
  assert.match(headline(s.overall), /sure more often than right/);
  assert.equal(s.sureButWrong.length, 12);
});

test("underconfident: guessing on 24, right on 22 → clearly underconfident", () => {
  const s = score(mk(24, 0.5, 22));
  assert.equal(s.overall.verdict.dir, "underconfident");
  assert.match(headline(s.overall), /knew more than you thought/);
});

test("verdict thresholds use max SE", () => {
  assert.ok(Math.abs(maxSE(25) - 0.1) < 1e-12);
  assert.equal(verdict(0.10, 25).level, "noise");
  assert.equal(verdict(0.15, 25).level, "probably");
  assert.equal(verdict(-0.25, 25).level, "clearly");
  assert.equal(verdict(0.1, 6).text, "Too few items to tell");
});

test("Brier score: known values", () => {
  assert.ok(Math.abs(score(mk(4, 0.5, 2)).overall.brier - 0.25) < 1e-12);
  assert.ok(Math.abs(score(mk(1, 0.95, 1)).overall.brier - 0.0025) < 1e-12);
  assert.ok(Math.abs(score(mk(1, 0.95, 0)).overall.brier - 0.9025) < 1e-12);
});

test("all right and all wrong", () => {
  assert.equal(score(mk(24, 0.95, 24)).overall.accuracy, 1);
  const w = score(mk(24, 0.95, 0));
  assert.equal(w.overall.accuracy, 0);
  assert.equal(w.overall.verdict.level, "clearly");
});

test("empty and malformed answers don't crash", () => {
  const s = score([]);
  assert.equal(s.overall.n, 0);
  assert.equal(headline(s.overall), "No answers yet.");
  assert.equal(score([null, { id: "a" }, { id: "b", p: "x", correct: true }]).overall.n, 0);
});

test("buckets and domains split correctly", () => {
  const s = score([...mk(6, 0.95, 3, "people"), ...mk(6, 0.65, 4, "work")]);
  const certain = s.buckets.find((b) => b.p === 0.95);
  assert.equal(certain.n, 6); assert.equal(certain.rate, 0.5);
  assert.equal(s.buckets.find((b) => b.p === 0.8).rate, null);
  assert.equal(s.domains.people.n, 6);
  assert.equal(s.domains.work.correct, 4);
});
