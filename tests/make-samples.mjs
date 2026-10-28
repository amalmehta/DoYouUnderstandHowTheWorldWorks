// Generates importable sample attempt files covering normal, edge and failure cases.
import { writeFileSync } from "node:fs";
import { ITEMS } from "../js/items.js";
import { APP_ID, FORMAT_VERSION } from "../js/store.js";

const dir = new URL("./sample-data/", import.meta.url);
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// p: confidence chooser; hit(p): probability of being right at that confidence
function attempt(id, date, pick, hit) {
  return { id, date, started: date, answers: ITEMS.map((it) => {
    const p = pick(it); const correct = rand() < hit(p, it);
    return { id: it.id, domain: it.domain, choice: correct ? 0 : 1, correct, p, ms: 4000 + Math.round(rand() * 9000) };
  }) };
}
const levels = [0.5, 0.65, 0.8, 0.95];
const file = (name, attempts) => writeFileSync(new URL(name, dir), JSON.stringify({ app: APP_ID, version: FORMAT_VERSION, exported: "2026-10-28T12:00:00Z", attempts }, null, 2));

file("calibrated.json", [attempt("s-cal", "2026-09-01T10:00:00Z", () => levels[Math.floor(rand() * 4)], (p) => p)]);
file("overconfident.json", [attempt("s-over", "2026-09-15T10:00:00Z", () => (rand() < 0.6 ? 0.95 : 0.8), () => 0.55)]);
file("underconfident.json", [attempt("s-under", "2026-10-01T10:00:00Z", () => (rand() < 0.6 ? 0.5 : 0.65), () => 0.92)]);
file("people-blind-spot.json", [attempt("s-people", "2026-10-20T10:00:00Z", () => 0.8, (p, it) => (it.domain === "people" ? 0.2 : 0.85))]);
file("history-three.json", [
  attempt("s-h1", "2026-07-01T10:00:00Z", () => 0.95, () => 0.6),
  attempt("s-h2", "2026-08-01T10:00:00Z", () => 0.8, () => 0.7),
  attempt("s-h3", "2026-09-01T10:00:00Z", () => levels[Math.floor(rand() * 4)], (p) => p),
]);
writeFileSync(new URL("corrupt.json", dir), '{"app": "DoYouUnderstandHowTheWorldWorks", "attempts": [');
writeFileSync(new URL("wrong-app.json", dir), JSON.stringify({ app: "SomethingElse", attempts: [] }));
console.log("sample files written");
