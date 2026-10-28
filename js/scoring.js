// Pure scoring functions: no DOM, no storage, so Node tests can import them.

export const CONFIDENCE = [
  { key: "1", p: 0.5,  label: "Guessing" },
  { key: "2", p: 0.65, label: "Leaning" },
  { key: "3", p: 0.8,  label: "Fairly sure" },
  { key: "4", p: 0.95, label: "Certain" },
];

// The largest standard error a proportion over n items can have (at 50%).
export const maxSE = (n) => (n > 0 ? Math.sqrt(0.25 / n) : Infinity);

// gap = mean confidence − accuracy, as a fraction. Positive = overconfident.
export function verdict(gap, n) {
  if (!n) return { level: "none", text: "No answers yet" };
  const se = maxSE(n);
  const size = Math.abs(gap);
  const dir = gap > 0 ? "overconfident" : "underconfident";
  if (size <= se) return { level: "noise", text: n < 10 ? "Too few items to tell" : "Within noise of well calibrated" };
  if (size <= 2 * se) return { level: "probably", dir, text: `Probably ${dir}` };
  return { level: "clearly", dir, text: `Clearly ${dir}` };
}

function summarise(list) {
  const n = list.length;
  if (!n) return { n: 0, correct: 0, accuracy: 0, meanConf: 0, gap: 0, brier: 0 };
  const correct = list.filter((a) => a.correct).length;
  const accuracy = correct / n;
  const meanConf = list.reduce((s, a) => s + a.p, 0) / n;
  const brier = list.reduce((s, a) => s + (a.p - (a.correct ? 1 : 0)) ** 2, 0) / n;
  return { n, correct, accuracy, meanConf, gap: meanConf - accuracy, brier };
}

// answers: [{ id, domain, correct: boolean, p: 0.5..0.95 }]
export function score(answers) {
  const valid = answers.filter((a) => a && typeof a.p === "number" && typeof a.correct === "boolean");
  const overall = summarise(valid);
  overall.verdict = verdict(overall.gap, overall.n);

  const buckets = CONFIDENCE.map((c) => {
    const inBucket = valid.filter((a) => Math.abs(a.p - c.p) < 1e-9);
    const s = summarise(inBucket);
    return { ...c, n: s.n, correct: s.correct, rate: s.n ? s.accuracy : null };
  });

  const domains = {};
  for (const a of valid) (domains[a.domain] ??= []).push(a);
  for (const k of Object.keys(domains)) {
    const s = summarise(domains[k]);
    domains[k] = { ...s, verdict: verdict(s.gap, s.n) };
  }

  const sureButWrong = valid.filter((a) => a.p >= 0.8 && !a.correct).map((a) => a.id);
  return { overall, buckets, domains, sureButWrong };
}

// One plain headline sentence for the results screen.
export function headline(overall) {
  if (!overall.n) return "No answers yet.";
  const conf = Math.round(overall.meanConf * 100);
  const acc = Math.round(overall.accuracy * 100);
  switch (overall.verdict.level) {
    case "noise": return `Your confidence matched your accuracy: ${conf}% sure on average, ${acc}% right.`;
    case "probably":
    case "clearly":
      return overall.verdict.dir === "overconfident"
        ? `You were sure more often than right: ${conf}% sure on average, ${acc}% right.`
        : `You knew more than you thought: ${conf}% sure on average, ${acc}% right.`;
    default: return "No answers yet.";
  }
}
