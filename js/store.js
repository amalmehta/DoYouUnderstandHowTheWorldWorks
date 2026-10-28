// Everything stays in this browser. Exports are plain JSON files the user keeps.

export const APP_ID = "DoYouUnderstandHowTheWorldWorks";
export const FORMAT_VERSION = 1;
const KEY = "dyuhtww.v1";

export const DEFAULT_SETTINGS = { theme: "system", motion: "system", shuffle: true };

export function emptyState() {
  return { attempts: [], inProgress: null, settings: { ...DEFAULT_SETTINGS } };
}

export function load(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return emptyState();
    const data = JSON.parse(raw);
    return {
      attempts: Array.isArray(data.attempts) ? data.attempts.filter(isAttempt) : [],
      inProgress: data.inProgress ?? null,
      settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
    };
  } catch (e) {
    console.warn("[store] could not read saved data, starting fresh", e);
    return emptyState();
  }
}

export function save(state, storage = globalThis.localStorage) {
  try {
    storage?.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn("[store] could not save", e);
    return false;
  }
}

function isAnswer(a) {
  return a && typeof a.id === "string" && typeof a.correct === "boolean" &&
    typeof a.p === "number" && a.p >= 0.5 && a.p <= 1;
}

export function isAttempt(t) {
  return t && typeof t.id === "string" && typeof t.date === "string" &&
    !Number.isNaN(Date.parse(t.date)) && Array.isArray(t.answers) &&
    t.answers.length > 0 && t.answers.every(isAnswer);
}

export function exportData(state) {
  return JSON.stringify({ app: APP_ID, version: FORMAT_VERSION, exported: new Date().toISOString(), attempts: state.attempts }, null, 2);
}

// Returns { attempts, added, skipped } or throws an Error with a plain message.
export function importData(text, existing = []) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error("That file isn’t valid JSON. Use a file exported from this page."); }
  if (!data || data.app !== APP_ID || !Array.isArray(data.attempts)) {
    throw new Error("That file wasn’t exported from this page, so there’s nothing to import.");
  }
  if (data.version > FORMAT_VERSION) throw new Error("That file comes from a newer version of this page.");
  const seen = new Set(existing.map((t) => t.id));
  const attempts = [...existing];
  let added = 0, skipped = 0;
  for (const t of data.attempts) {
    if (!isAttempt(t) || seen.has(t.id)) { skipped++; continue; }
    seen.add(t.id); attempts.push(t); added++;
  }
  attempts.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  return { attempts, added, skipped };
}
