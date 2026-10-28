import { ITEMS, DOMAINS } from "./items.js";
import { RETIRED } from "./items-retired.js";
import { CONFIDENCE, score, headline, maxSE, guessCheck, secondLook, MOVE_CUTOFFS } from "./scoring.js";
import { load, save, exportData, importData } from "./store.js";

const REPO = "https://github.com/amalmehta/DoYouUnderstandHowTheWorldWorks";
// Retired items stay findable so older attempts still show their questions.
const ITEM_BY_ID = Object.fromEntries([...RETIRED, ...ITEMS].map((i) => [i.id, i]));
const DOMAIN_ORDER = ["health", "politics", "work", "people"];

let state = load();
const $ = (s, el = document) => el.querySelector(s);
const view = $("#view");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const pct = (x) => `${Math.round(x * 100)}%`;
const persist = () => { if (!save(state)) toast("Couldn’t save in this browser (private mode?). Export to keep your results."); };

// ── Small helpers ───────────────────────────────────────────────────
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("on"), 3200);
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Interleave domains so you never get six of one kind in a row.
function itemOrder() {
  const pools = DOMAIN_ORDER.map((d) => shuffled(ITEMS.filter((i) => i.domain === d)));
  const first = shuffled(pools.map((_, k) => k));
  const order = [];
  while (pools.some((p) => p.length)) for (const k of first) if (pools[k].length) order.push(pools[k].pop().id);
  return order;
}

const chip = (d) => `<span class="chip dc-${d}">${esc(DOMAINS[d].name)}</span>`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// ── Routing ────────────────────────────────────────────────────────
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
window.addEventListener("hashchange", render);

function render() {
  const [route, arg] = location.hash.replace(/^#/, "").split("/");
  if (route === "item" && state.inProgress) return renderItem();
  if (route === "results") return renderResults(arg);
  if (route === "history") return renderHistory();
  return renderHome();
}

function mount(html) {
  view.innerHTML = `<div class="screen">${html}</div>`;
  window.scrollTo({ top: 0 });
}

// ── Home ───────────────────────────────────────────────────────────
function renderHome() {
  const ip = state.inProgress;
  const last = state.attempts.at(-1);
  const lastScore = last && score(last.answers).overall;
  mount(`
    <section class="hero">
      <h1>Do you understand how the world works?</h1>
      <p class="lede">24 plain questions about how health, money, government and people actually work. Pick what you think is true, then say how sure you are. At the end you’ll see where your confidence matched reality, how you respond to new evidence, and the source behind every answer.</p>
      <div class="cta">
        ${ip
          ? `<button class="primary big" data-act="resume">Resume · question ${ip.answers.length + 1} of ${ip.order.length}</button>
             <button class="ghost" data-act="restart">Start over</button>`
          : `<button class="primary big" data-act="start">Start <kbd>↵</kbd></button>`}
        <span class="meta">About 10 minutes · answers stay in this browser</span>
      </div>
    </section>

    <div class="steps">
      <div class="step"><svg viewBox="0 0 24 24"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/></svg>
        <b>Choose</b><span>Two answers per question. One is backed by research or official data.</span></div>
      <div class="step"><svg viewBox="0 0 24 24"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
        <b>Say how sure</b><span>From “Guessing” (50%) to “Certain” (95%). This is what gets measured.</span></div>
      <div class="step"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        <b>See your calibration</b><span>Whether “80% sure” really meant right 8 times in 10.</span></div>
    </div>

    ${lastScore ? `
      <div class="card">
        <div class="sample"><div class="label">Your last attempt · ${esc(fmtDate(last.date))}</div></div>
        <p style="font-family:var(--serif);font-size:20px;margin-bottom:12px">${esc(headline(lastScore))}</p>
        <button data-go-to="#results/${esc(last.id)}">See results</button>
      </div>` : `
      <div class="card sample">
        <div class="label"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>What a question looks like (example, not in the test)</div>
        <p style="font-family:var(--serif);font-size:20px">Which country has more people: Nigeria or Russia?</p>
        <p class="hint" style="margin:0">You’d pick one, then tap how sure you are. Why it matters: being right isn’t the whole story. Someone who is right 70% of the time and knows it can be trusted more than someone right 80% of the time who always says “certain”.</p>
      </div>`}

    <div class="domains-legend">${DOMAIN_ORDER.map(chip).join("")}</div>
  `);
}

function startAttempt() {
  const order = itemOrder();
  const flip = Object.fromEntries(order.map((id) => [id, state.settings.shuffle ? Math.random() < 0.5 : false]));
  state.inProgress = { id: `a${Date.now().toString(36)}`, started: new Date().toISOString(), order, flip, guess: null, answers: [] };
  persist();
  go("#item");
}

// ── Item ───────────────────────────────────────────────────────────
// One in-progress attempt has three phases: guess → 24 questions → second look.
let pending = null; // { choice } for the item on screen
let shownAt = 0;
const confLabel = (p) => CONFIDENCE.find((c) => Math.abs(c.p - p) < 1e-9)?.label ?? pct(p);

function phase(ip) {
  if (!Number.isInteger(ip.guess)) return "guess";
  return ip.answers.length < ip.order.length ? "main" : "second";
}

function renderItem() {
  const ip = state.inProgress;
  const ph = phase(ip);
  if (ph === "guess") return renderGuess();
  if (ph === "main") {
    const item = ITEM_BY_ID[ip.order[ip.answers.length]];
    if (!item) { ip.order.splice(ip.answers.length, 1); persist(); return renderItem(); } // removed from the bank since
    return renderQuestion(item, ip.answers.length, ip.order.length);
  }
  if (!ip.second) {
    ip.second = { order: shuffled(ip.answers.filter((a) => ITEM_BY_ID[a.id]?.evidence).map((a) => a.id)), entries: [] };
    persist();
  }
  const j = ip.second.entries.length;
  if (j >= ip.second.order.length) return finishAttempt();
  const item = ITEM_BY_ID[ip.second.order[j]];
  const first = ip.answers.find((a) => a.id === item.id);
  return renderQuestion(item, j, ip.second.order.length, first);
}

function renderGuess() {
  const n = state.inProgress.order.length;
  mount(`
    <div class="progress" aria-hidden="true"><i style="width:0"></i></div>
    <div class="item-top"><span class="chip">Before you start</span><span>Reality check 1 of 3</span></div>
    <p class="prompt">How many of the ${n} questions do you think you’ll get right?</p>
    <form class="guess" data-form="guess">
      <input id="guess" name="guess" type="number" inputmode="numeric" min="0" max="${n}" step="1" required placeholder="0–${n}" aria-label="Your guess">
      <button class="primary big">Start</button>
    </form>
    <p class="hint">Picking at random would get about ${Math.round(n / 2)}. At the end you’ll see your guess next to your real score.</p>
  `);
  $("#guess").focus();
}

// first: the answer given in the main round, when this is a second look
function renderQuestion(item, k, total, first) {
  const ip = state.inProgress;
  const shown = ip.flip[item.id] ? [1, 0] : [0, 1];
  const second = Boolean(first);
  pending = null;
  shownAt = performance.now();
  const progress = second ? 1 : k / total;
  mount(`
    <div class="progress" aria-hidden="true"><i style="width:${progress * 100}%"></i></div>
    <div class="item-top">${second ? `<span class="chip">Second look</span>` : chip(item.domain)}<span>${k + 1} / ${total}</span></div>
    ${second && k === 0 ? `<p class="hint">Six of your answers again, each with one new piece of information. Keep your answer or change it; your first answers still decide your main score.</p>` : ""}
    <p class="prompt">${esc(item.prompt)}</p>
    ${second ? `
      <p class="first-ans">Your first answer: “${esc(item.options[first.choice])}” · ${esc(confLabel(first.p))}</p>
      <div class="newinfo"><div class="k">New information</div><p>${esc(item.evidence.text)}</p><div class="src">${esc(item.evidence.source.label)}</div></div>` : ""}
    <div class="options" role="group" aria-label="Answers">
      ${shown.map((oi, n) => `<button class="opt" data-choice="${oi}" aria-pressed="false"><kbd>${"AB"[n]}</kbd><span>${esc(item.options[oi])}</span></button>`).join("")}
    </div>
    <div class="conf" aria-hidden="true">
      <p>How sure are you${second ? " now" : ""}?</p>
      <div class="row4">${CONFIDENCE.map((c) => `<button data-conf="${c.p}" tabindex="-1"><b>${pct(c.p)}</b><span>${c.label} <kbd>${c.key}</kbd></span></button>`).join("")}</div>
    </div>
    <div class="item-nav">
      <button class="ghost" data-act="back"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>Previous</button>
      <span>${second ? "Answers are revealed next" : "Answers are revealed at the end"}</span>
    </div>
  `);
}

function choose(choice) {
  pending = { choice };
  view.querySelectorAll(".opt").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.choice === choice)));
  const conf = $(".conf", view);
  conf.classList.add("on");
  conf.removeAttribute("aria-hidden");
  conf.querySelectorAll("button").forEach((b) => b.removeAttribute("tabindex"));
}

function confide(p) {
  if (!pending) return;
  const ip = state.inProgress;
  $(`.conf [data-conf="${p}"]`, view)?.setAttribute("aria-pressed", "true");
  if (phase(ip) === "main") {
    const item = ITEM_BY_ID[ip.order[ip.answers.length]];
    ip.answers.push({ id: item.id, domain: item.domain, choice: pending.choice, correct: pending.choice === 0, p, ms: Math.round(performance.now() - shownAt) });
  } else {
    const id = ip.second.order[ip.second.entries.length];
    const first = ip.answers.find((a) => a.id === id);
    ip.second.entries.push({ id, kind: ITEM_BY_ID[id].evidence.kind, before: { choice: first.choice, p: first.p }, after: { choice: pending.choice, p } });
  }
  pending = null;
  persist();
  setTimeout(renderItem, 140); // let the pressed state show before moving on
}

function setGuess(value) {
  const n = state.inProgress.order.length;
  const g = Number(value);
  if (value === "" || !Number.isInteger(g) || g < 0 || g > n) return toast(`Enter a whole number from 0 to ${n}.`);
  state.inProgress.guess = g;
  persist();
  renderItem();
}

function back() {
  const ip = state.inProgress;
  if (!ip) return;
  const ph = phase(ip);
  if (ph === "second" && ip.second?.entries.length) ip.second.entries.pop();
  else if (ip.answers.length) { ip.answers.pop(); delete ip.second; }
  else if (ph !== "guess") ip.guess = null;
  else return;
  persist();
  renderItem();
}

function finishAttempt() {
  const ip = state.inProgress;
  const attempt = { id: ip.id, date: new Date().toISOString(), started: ip.started, guess: ip.guess, answers: ip.answers, secondLook: ip.second?.entries ?? [] };
  state.attempts.push(attempt);
  state.inProgress = null;
  persist();
  location.replace(`#results/${attempt.id}`);
}

// ── Results ────────────────────────────────────────────────────────
function chartSVG(buckets) {
  const W = 360, H = 280, L = 44, R = 14, T = 14, B = 40;
  const x = (p) => L + ((p - 0.45) / 0.55) * (W - L - R);
  const y = (r) => T + (1 - r) * (H - T - B);
  const pts = buckets.filter((b) => b.n);
  const grid = [0, 0.25, 0.5, 0.75, 1].map((r) => `<line class="axis" x1="${L}" x2="${W - R}" y1="${y(r)}" y2="${y(r)}" opacity=".6"/><text x="${L - 8}" y="${y(r) + 4}" text-anchor="end">${r * 100}%</text>`).join("");
  const xt = CONFIDENCE.map((c) => `<text x="${x(c.p)}" y="${H - B + 18}" text-anchor="middle">${pct(c.p)}</text>`).join("");
  const line = pts.length > 1 ? `<polyline class="you" points="${pts.map((b) => `${x(b.p)},${y(b.rate)}`).join(" ")}"/>` : "";
  const dots = pts.map((b) => `<circle class="dot" cx="${x(b.p)}" cy="${y(b.rate)}" r="${4 + Math.sqrt(b.n) * 1.6}"><title>${b.label}: ${b.correct} of ${b.n} right</title></circle><text class="dot-label" x="${x(b.p) + 10}" y="${y(b.rate) - 8}">${b.correct}/${b.n}</text>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Calibration chart: share right at each confidence level">
    ${grid}${xt}
    <text x="${(L + W - R) / 2}" y="${H - 4}" text-anchor="middle">How sure you said you were</text>
    <line class="ideal" x1="${x(0.5)}" y1="${y(0.5)}" x2="${x(0.95)}" y2="${y(0.95)}"/>
    <text x="${x(0.95) - 4}" y="${y(0.95) - 8}" text-anchor="end">perfect calibration</text>
    ${line}${dots}</svg>`;
}

function reviewItem(a, open) {
  const item = ITEM_BY_ID[a.id];
  if (!item) return "";
  const conf = CONFIDENCE.find((c) => Math.abs(c.p - a.p) < 1e-9);
  return `<details class="review" ${open ? "open" : ""}>
    <summary><span class="mark ${a.correct ? "ok" : "no"}">${a.correct ? "✓" : "✗"}</span>
      <span class="q">${esc(item.prompt)}</span><span class="yours">${conf ? esc(conf.label) : pct(a.p)}</span></summary>
    <div class="body">
      <p>${a.correct ? "You chose" : "You chose"} “${esc(item.options[a.choice] ?? "?")}”.${a.correct ? "" : ` The answer is <span class="ans">“${esc(item.options[0])}”</span>.`}</p>
      <p>${esc(item.why)}</p>
      <p class="principle">${esc(item.principle)}</p>
      <p class="src">Source: <a href="${esc(item.source.url)}" target="_blank" rel="noopener">${esc(item.source.label)}</a>${item.illustrative ? `<span class="badge">numbers are illustrative</span>` : ""}</p>
    </div></details>`;
}

const movedText = (x) => (x === null ? "—" : x < 0 ? `moved away (${Math.round(-x * 100)}%)` : `moved ${Math.round(x * 100)}% of the way`);
const bar = (x) => `<div class="meter"><i style="width:${Math.max(0, x ?? 0) * 100}%"></i></div>`;

function realityChecks(attempt, s) {
  const o = s.overall;
  const g = guessCheck(attempt.guess, o.correct, o.n);
  const sure = attempt.answers.filter((a) => a.p >= 0.8);
  const expectedWrong = sure.reduce((t, a) => t + (1 - a.p), 0);
  const sl = attempt.secondLook?.length ? secondLook(attempt.secondLook) : null;
  return `<section class="block">
    <h2>Reality checks</h2>
    <p class="hint">Three ways of asking whether your picture of the world matches the world. Each describes what you did; none is a diagnosis.</p>
    <div class="checks">
      ${g ? `<div class="check"><span class="k">Your guess</span><b>${g.guess} → ${g.correct}</b>
        <span>You guessed ${g.guess} of ${g.n} right and got ${g.correct}. ${esc(g.text)}.</span></div>` : ""}
      <div class="check"><span class="k">Sure but wrong</span>${sure.length
        ? `<b>${s.sureButWrong.length} of ${sure.length}</b>
        <span>answers you rated Fairly sure or Certain were wrong. Your own confidence predicted about ${Math.round(expectedWrong)}.</span>`
        : `<b>—</b><span>You didn’t rate any answer Fairly sure or Certain, so there’s nothing to check here.</span>`}</div>
      ${sl ? `<div class="check"><span class="k">Second look</span>
        <div class="mini"><span>Strong evidence: ${movedText(sl.strong)}</span>${bar(sl.strong)}</div>
        <div class="mini weak"><span>Weak evidence: ${movedText(sl.weak)}</span>${bar(sl.weak)}</div>
        <span>${esc(sl.text)}</span></div>` : ""}
    </div>
    <details class="fold">
      <summary>What these mean, and how they can mislead</summary>
      <p style="margin-top:12px"><b>Your guess.</b> A guess well above your score means your sense of what you know runs ahead of what you know. It’s one number from one sitting: a few lucky or unlucky coin-flip answers move your score by 2–3, so only a miss of more than about ${Math.round(Math.sqrt(0.25 * o.n))} counts.</p>
      <p><b>Sure but wrong.</b> If you say “80% sure” five times, about one should be wrong. Adding up (1 − confidence) over your sure answers gives how many misses your own confidence predicted. Many more than that is the clearest sign of holding beliefs more firmly than the evidence allows.</p>
      <p><b>Second look.</b> Think of a good judge: a fingerprint should change their mind, a rumour shouldn’t. Three pieces of new information were strong (randomised trials, official data, repeated studies) and pointed to the right answer. Three were real but weak (opinion polls, an older and coarser study, a true fact about a later stage) and pointed to the wrong one. “Moved 60% of the way” means you closed 60% of the gap between your first answer and the most you could have agreed with the evidence.</p>
      <p>Moving for both kinds suggests deferring to whatever you’re shown; moving for neither suggests sticking to a first answer. The cut-offs (${MOVE_CUTOFFS.strong * 100}% for strong, ${MOVE_CUTOFFS.weak * 100}% for weak) were chosen by hand, not validated, and with three items each a single answer can change the pattern.</p>
      <p class="hint">General rule to reuse: weigh new information by how it was produced, not by whether it agrees with you.</p>
    </details>
  </section>`;
}

function secondLookReview(attempt) {
  if (!attempt.secondLook?.length) return "";
  const rows = secondLook(attempt.secondLook).rows.map((r) => {
    const item = ITEM_BY_ID[r.id];
    if (!item?.evidence) return "";
    const ev = item.evidence;
    return `<details class="review">
      <summary><span class="mark ${ev.kind === "strong" ? "ok" : "no"}">${ev.kind === "strong" ? "S" : "W"}</span>
        <span class="q">${esc(item.prompt)}</span><span class="yours">${r.switched ? "changed" : "kept"}</span></summary>
      <div class="body">
        <p>First: “${esc(item.options[r.before.choice])}” (${esc(confLabel(r.before.p))}). Then: “${esc(item.options[r.after.choice])}” (${esc(confLabel(r.after.p))}).</p>
        <p>New information: ${esc(ev.text)}</p>
        <p class="principle">${ev.kind === "strong" ? "Strong evidence, pointing to the right answer." : "Weak evidence, pointing to the wrong answer."} ${esc(ev.lesson)}</p>
        <p class="src">Source: <a href="${esc(ev.source.url)}" target="_blank" rel="noopener">${esc(ev.source.label)}</a></p>
      </div></details>`;
  }).join("");
  return `<section class="block"><h2>Second look, answer by answer</h2>
    <p class="hint">S = strong evidence, W = weak evidence.</p>${rows}</section>`;
}

function renderResults(id) {
  const attempt = state.attempts.find((t) => t.id === id) ?? state.attempts.at(-1);
  if (!attempt) return renderHome();
  const s = score(attempt.answers);
  const o = s.overall;
  const se = maxSE(o.n);
  const wrongSure = attempt.answers.filter((a) => s.sureButWrong.includes(a.id));
  const rest = attempt.answers.filter((a) => !s.sureButWrong.includes(a.id));
  const domainRows = DOMAIN_ORDER.filter((d) => s.domains[d]).map((d) => {
    const ds = s.domains[d];
    return `<div class="domain-row dc-${d}">
      <div>${chip(d)}</div>
      <div><div class="meter" title="${ds.correct} of ${ds.n} right; ${pct(ds.meanConf)} sure on average"><i style="width:${ds.accuracy * 100}%"></i><u style="left:calc(${ds.meanConf * 100}% - 1px)"></u></div>
      <div class="v">${ds.correct} of ${ds.n} right · ${pct(ds.meanConf)} sure · ${esc(ds.verdict.text)}</div></div></div>`;
  }).join("");

  mount(`
    <div class="result-head">
      <div class="hint">${esc(fmtDate(attempt.date))} · ${o.n} answers</div>
      <h1>${esc(headline(o))}</h1>
      <p style="color:var(--ink-2)">${esc(o.verdict.text)}. With ${o.n} questions, a gap under about ${Math.round(se * 100)} points could be luck.</p>
    </div>

    <div class="stats">
      <div class="stat"><b>${o.correct}/${o.n}</b><span>right (${pct(o.accuracy)})</span></div>
      <div class="stat"><b>${pct(o.meanConf)}</b><span>average confidence</span></div>
      <div class="stat"><b>${o.gap > 0 ? "+" : ""}${Math.round(o.gap * 100)}</b><span>gap in points (+ = overconfident)</span></div>
    </div>

    <div class="card chart-card">
      ${chartSVG(s.buckets)}
      <div class="chart-notes">
        <p><b>How to read it.</b> Each dot is one confidence level. If you were perfectly calibrated, every dot would sit on the dashed line: right 80% of the time when you said “Fairly sure”.</p>
        <p>Dots <b>below</b> the line mean you were less often right than you felt (overconfident). Above it, you knew more than you thought.</p>
        <p>The fraction beside each dot is how many you got right out of how many. A dot built on 2 answers can jump a long way by chance.</p>
      </div>
    </div>

    ${realityChecks(attempt, s)}

    <section class="block">
      <h2>By domain</h2>
      <div class="legend-line"><span><i></i>share right</span><span><u></u>how sure you were on average</span></div>
      ${domainRows}
      <p class="hint" style="margin-top:10px">Six questions per domain is few: a domain needs a gap of about ${Math.round(maxSE(6) * 100)} points before it means much.</p>
    </section>

    ${wrongSure.length ? `<section class="block"><h2>Sure but wrong (${wrongSure.length})</h2>
      <p class="hint">Answers you rated “Fairly sure” or “Certain” that were wrong. These are where your picture of the world is most out of date.</p>
      ${wrongSure.map((a) => reviewItem(a, true)).join("")}</section>` : ""}

    ${secondLookReview(attempt)}

    <section class="block"><h2>${wrongSure.length ? "Everything else" : "All answers"}</h2>
      ${rest.map((a) => reviewItem(a, false)).join("")}</section>

    <details class="fold card" style="margin-top:28px">
      <summary>How it’s scored</summary>
      <p style="margin-top:14px"><b>Calibration</b> means your confidence matches how often you’re right. A weather forecaster is well calibrated if it rains on about 70% of the days they say “70% chance of rain”.</p>
      <p><b>The gap</b> is your average confidence minus the share you got right. To judge whether it’s real or luck, compare it with the largest possible standard error (how much a score of ${o.n} coin-flip-like questions wobbles by chance):</p>
      <div class="eq" data-tex="\\text{SE} = \\sqrt{\\dfrac{0.25}{n}}">SE = √(0.25 / n)</div>
      <ul class="eq-defs"><li><i>n</i>: number of questions answered (here ${o.n}, so SE ≈ ${Math.round(se * 100)} points)</li></ul>
      <p>A gap within 1 SE is called noise, 1–2 SE “probably”, beyond 2 SE “clearly”.</p>
      <p><b>The Brier score</b> rewards being both right and appropriately sure:</p>
      <div class="eq" data-tex="B = \\frac{1}{n}\\sum_{i=1}^{n} \\left(p_i - o_i\\right)^2">B = (1/n) Σ (pᵢ − oᵢ)²</div>
      <ul class="eq-defs"><li><i>p<sub>i</sub></i>: how sure you were of your answer to question <i>i</i> (0.5 to 0.95)</li><li><i>o<sub>i</sub></i>: 1 if that answer was right, 0 if wrong</li></ul>
      <p>In words: the average squared distance between your confidence and what happened. 0 is perfect; always saying “Guessing” gives 0.25. Worked example: “Certain” and right costs (0.95 − 1)² = 0.0025; “Certain” and wrong costs (0.95 − 0)² ≈ 0.90.</p>
      <p>Your Brier score: <b>${o.brier.toFixed(3)}</b> (lower is better).</p>
      <p class="hint">General rule to reuse: before trusting a difference between two numbers, ask how much it would move by chance alone.</p>
    </details>

    <div class="end-actions">
      <button class="primary" data-act="start">Take it again</button>
      <button data-act="export">Export results</button>
      <button class="ghost" data-go-to="#history">All attempts</button>
    </div>
    <p class="hint" style="margin-top:14px">Retakes use the same 24 questions, so a second score partly measures memory.</p>
  `);
  typeset();
}

function typeset() {
  const run = () => view.querySelectorAll(".eq[data-tex]").forEach((el) => {
    try { window.katex.render(el.dataset.tex, el, { displayMode: true, throwOnError: false }); } catch {}
  });
  if (window.katex) run(); else window.addEventListener("load", run, { once: true });
}

// ── History ────────────────────────────────────────────────────────
function renderHistory() {
  const rows = [...state.attempts].reverse().map((t) => {
    const o = score(t.answers).overall;
    return `<div class="hist-row" data-go-to="#results/${esc(t.id)}" tabindex="0" role="link">
      <div><div class="when">${esc(fmtDate(t.date))}</div><div class="sub">${esc(o.verdict.text)}</div></div>
      <div class="sub">${o.correct}/${o.n} right</div>
      <div class="sub">${o.gap > 0 ? "+" : ""}${Math.round(o.gap * 100)} pts</div></div>`;
  }).join("");
  mount(`
    <h1>Past attempts</h1>
    <div class="hist-actions">
      <button data-act="upload"><svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>Upload</button>
      <button data-act="export" ${state.attempts.length ? "" : "disabled"}><svg viewBox="0 0 24 24"><path d="M12 4v12M7 11l5 5 5-5M4 20h16"/></svg>Export</button>
    </div>
    ${rows || `<div class="empty card">
      <svg viewBox="0 0 120 90"><circle cx="50" cy="45" r="30"/><ellipse cx="50" cy="45" rx="12" ry="30"/><path d="M20 38h60M20 52h60"/><circle cx="88" cy="66" r="12"/><path d="M84 62a4 4 0 1 1 6 3c-1 .8-2 1.5-2 3"/></svg>
      <p>No attempts yet. Take the test once and it will show up here, or drop a file you exported earlier anywhere on this page.</p>
      <button class="primary" data-act="start">Start the test</button></div>`}
    <p class="hint">Upload accepts a file exported from this page. You can also drag it anywhere onto the window or paste it with ⌘V.</p>
  `);
}

// ── Import / export ────────────────────────────────────────────────
function doExport() {
  if (!state.attempts.length) return toast("Nothing to export yet.");
  const blob = new Blob([exportData(state)], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `World Works results ${new Date().toISOString().slice(0, 10)}.json` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function doImport(text) {
  try {
    const r = importData(text, state.attempts);
    state.attempts = r.attempts;
    persist();
    toast(r.added ? `Imported ${r.added} attempt${r.added > 1 ? "s" : ""}${r.skipped ? ` (${r.skipped} already here or unreadable)` : ""}.` : "Nothing new in that file: every attempt is already here.");
    if (location.hash.startsWith("#history") || !location.hash) render();
  } catch (e) { toast(e.message); }
}

const readFile = (f) => f.text().then(doImport).catch(() => toast("Couldn’t read that file."));
$("#file-input").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) readFile(f); e.target.value = ""; });

let dragDepth = 0;
const veil = $("#drop-veil");
window.addEventListener("dragenter", (e) => { if (e.dataTransfer?.types.includes("Files")) { dragDepth++; veil.classList.add("on"); } });
window.addEventListener("dragleave", () => { if (--dragDepth <= 0) { dragDepth = 0; veil.classList.remove("on"); } });
window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => {
  e.preventDefault(); dragDepth = 0; veil.classList.remove("on");
  const f = e.dataTransfer?.files[0]; if (f) readFile(f);
});
window.addEventListener("paste", (e) => {
  if (e.target.closest?.("textarea, input")) return;
  const f = e.clipboardData?.files[0];
  if (f) { e.preventDefault(); return readFile(f); }
  const text = e.clipboardData?.getData("text") || "";
  if (text.trim().startsWith("{") && text.includes("DoYouUnderstandHowTheWorldWorks")) { e.preventDefault(); doImport(text); }
});

// ── Settings & feedback ────────────────────────────────────────────
const settingsDlg = $("#settings");
function applySettings() {
  const root = document.documentElement;
  if (state.settings.theme === "system") delete root.dataset.theme; else root.dataset.theme = state.settings.theme;
  if (state.settings.motion === "reduce") root.dataset.motion = "reduce"; else delete root.dataset.motion;
}
function openSettings() {
  const f = settingsDlg.querySelector("form");
  f.theme.value = state.settings.theme;
  f.motion.value = state.settings.motion;
  f.shuffle.checked = state.settings.shuffle;
  if (!settingsDlg.open) settingsDlg.showModal();
}
settingsDlg.addEventListener("change", (e) => {
  const f = e.currentTarget.querySelector("form");
  state.settings = { theme: f.theme.value, motion: f.motion.value, shuffle: f.shuffle.checked };
  applySettings();
  persist();
});
$("#open-settings").addEventListener("click", openSettings);

const fbDlg = $("#feedback");
$("#feedback-tab").addEventListener("click", () => fbDlg.showModal());

document.addEventListener("submit", (e) => {
  if (e.target.dataset.form !== "guess") return;
  e.preventDefault();
  setGuess(e.target.guess.value);
});

// ── One click/keyboard handler for the whole page ──────────────────
document.addEventListener("click", (e) => {
  const t = e.target.closest("button, [data-go-to], [data-go]");
  if (!t) return;
  if (t.dataset.go) return go(`#${t.dataset.go === "home" ? "" : t.dataset.go}`);
  if (t.dataset.goTo) return go(t.dataset.goTo);
  if (t.dataset.choice !== undefined) return choose(+t.dataset.choice);
  if (t.dataset.conf) return confide(+t.dataset.conf);
  switch (t.dataset.act) {
    case "start": return startAttempt();
    case "resume": return go("#item");
    case "restart": state.inProgress = null; persist(); return startAttempt();
    case "back": return back();
    case "export": return doExport();
    case "upload": return $("#file-input").click();
    case "wipe":
      if (confirm("Delete every saved attempt in this browser? Export first if you want a copy. This can’t be undone.")) {
        state.attempts = []; state.inProgress = null; persist(); settingsDlg.close(); go("#"); toast("All data deleted.");
      }
      return;
    case "send": {
      const text = fbDlg.querySelector("textarea").value.trim();
      const open = () => window.open(`${REPO}/issues/new?title=${encodeURIComponent("Feedback")}`, "_blank", "noopener");
      if (!text) { toast("Write something first."); return; }
      navigator.clipboard?.writeText(text).then(() => { toast("Copied. Paste it into the issue."); open(); }, () => { toast("Couldn’t copy. Select the text and copy it yourself."); });
      fbDlg.close();
      return;
    }
  }
});

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === ",") { e.preventDefault(); return openSettings(); }
  if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector("dialog[open]")) return;
  if (e.target.closest?.("textarea, input, select")) return;
  const route = location.hash.replace(/^#/, "").split("/")[0];
  if (route === "item" && state.inProgress) {
    const k = e.key.toLowerCase();
    if (k === "a" || k === "b") {
      const btn = view.querySelectorAll(".opt")[k === "a" ? 0 : 1];
      if (btn) choose(+btn.dataset.choice);
    } else if (pending && /^[1-4]$/.test(k)) confide(CONFIDENCE[+k - 1].p);
    else if (k === "backspace") back();
    return;
  }
  if (e.key === "Enter" && !route && !e.target.closest?.("button")) state.inProgress ? go("#item") : startAttempt();
  if (e.key.toLowerCase() === "h" && route !== "history") go("#history");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.classList?.contains("hist-row")) go(e.target.dataset.goTo);
});

// ── Launch ─────────────────────────────────────────────────────────
applySettings();
document.body.classList.add("launch");
setTimeout(() => { document.body.classList.remove("launch"); $("#splash")?.remove(); }, 1100);
render();
