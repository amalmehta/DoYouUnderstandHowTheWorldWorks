import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { load, save, importData, exportData, emptyState } from "../js/store.js";

const sample = (n) => readFileSync(new URL(`./sample-data/${n}`, import.meta.url), "utf8");
const memory = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };

test("round trip through storage", () => {
  const s = memory(); const st = emptyState(); st.settings.theme = "dark";
  assert.ok(save(st, s));
  assert.equal(load(s).settings.theme, "dark");
});

test("corrupt storage starts fresh", () => {
  const s = memory(); s.setItem("dyuhtww.v1", "{nope");
  assert.deepEqual(load(s).attempts, []);
});

test("storage that throws (private mode) doesn't crash", () => {
  const bad = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("quota"); } };
  assert.deepEqual(load(bad).attempts, []);
  assert.equal(save(emptyState(), bad), false);
});

test("import good files, dedupe on re-import, sorted by date", () => {
  let r = importData(sample("history-three.json"));
  assert.equal(r.added, 3);
  r = importData(sample("calibrated.json"), r.attempts);
  assert.equal(r.attempts.length, 4);
  const again = importData(sample("calibrated.json"), r.attempts);
  assert.equal(again.added, 0); assert.equal(again.skipped, 1);
  const dates = again.attempts.map((t) => Date.parse(t.date));
  assert.deepEqual(dates, [...dates].sort((a, b) => a - b));
});

test("export then import is lossless", () => {
  const { attempts } = importData(sample("overconfident.json"));
  const back = importData(exportData({ attempts }));
  assert.deepEqual(back.attempts, attempts);
});

test("bad files fail with a plain message", () => {
  assert.throws(() => importData(sample("corrupt.json")), /isn’t valid JSON/);
  assert.throws(() => importData(sample("wrong-app.json")), /wasn’t exported from this page/);
  assert.throws(() => importData(JSON.stringify({ app: "DoYouUnderstandHowTheWorldWorks", version: 99, attempts: [] })), /newer version/);
  const r = importData(JSON.stringify({ app: "DoYouUnderstandHowTheWorldWorks", version: 1, attempts: [{ id: "x", date: "nope", answers: [] }] }));
  assert.equal(r.added, 0); assert.equal(r.skipped, 1);
});
