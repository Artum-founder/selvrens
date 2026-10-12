// Local-only state. Everything lives in this browser's localStorage under one key.
// Nothing here is ever sent to a server.
import { emit } from "./bus.js";

const KEY = "selvrens:v1";
export const SCHEMA = 1;

export const VIS_FIELDS = ["name", "photo", "bio", "location", "birthday", "work", "phone", "email", "links", "posts", "network", "tagged"];

const fresh = () => ({
  schema: SCHEMA,
  createdAt: new Date().toISOString(),
  profile: { names: "", usernames: "", emails: "", phones: "" },
  accounts: [],
  checks: { email: [] },      // results of email breach checks the user ran
  done: { guides: {}, optout: [], finders: [], download: [], ai: [] },
  settings: { lang: null, theme: null, bonds: [], lifted: false },
});

let storageOK = true;
let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const s = JSON.parse(raw);
    return migrate(s);
  } catch {
    storageOK = false;
    return fresh();
  }
}

function migrate(s) {
  const base = fresh();
  const out = { ...base, ...s };
  out.profile = { ...base.profile, ...(s.profile || {}) };
  out.checks = { ...base.checks, ...(s.checks || {}) };
  out.done = { ...base.done, ...(s.done || {}) };
  out.settings = { ...base.settings, ...(s.settings || {}) };
  out.accounts = Array.isArray(s.accounts) ? s.accounts.map(normalizeAccount) : [];
  out.schema = SCHEMA;
  return out;
}

export function normalizeAccount(a) {
  const vis = {};
  for (const f of VIS_FIELDS) vis[f] = !!(a.vis && a.vis[f]);
  return {
    id: a.id,
    service: String(a.service || a.domain || "").slice(0, 120),
    domain: String(a.domain || "").slice(0, 120),
    url: String(a.url || "").slice(0, 500),
    login: String(a.login || "").slice(0, 200),
    category: a.category || "other",
    source: a.source || "manual",
    created: a.created || null,
    lastUsed: a.lastUsed || null,
    status: ["unknown", "keep", "cleanup", "delete", "deleted"].includes(a.status) ? a.status : "unknown",
    notes: String(a.notes || "").slice(0, 2000),
    pwned: Number.isFinite(a.pwned) ? a.pwned : null,       // times the saved password appears in known leaks (checked at import), never the password itself
    reuse: a.reuse || null,                                   // random group label shared by accounts that used the same password at import
    vis,
    visChecked: !!a.visChecked,
    addedAt: a.addedAt || new Date().toISOString(),
    updatedAt: a.updatedAt || new Date().toISOString(),
  };
}

export function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    storageOK = true;
  } catch {
    storageOK = false;
  }
}

export const getState = () => state;
export const storageWorks = () => storageOK;

export function update(fn, topic = "state.changed", payload) {
  fn(state);
  persist();
  emit(topic, payload);
  if (topic !== "state.changed") emit("state.changed");
}

export function replaceState(next) {
  state = migrate(next || {});
  persist();
  emit("state.replaced");
  emit("state.changed");
}

export function wipe() {
  try { localStorage.removeItem(KEY); localStorage.removeItem("selvrens:breaches"); } catch {}
  state = fresh();
  emit("state.replaced");
  emit("state.changed");
}

// Language and theme
export function getLang() {
  if (state.settings.lang) return state.settings.lang;
  const nav = (navigator.language || "nb").toLowerCase();
  return /^(nb|nn|no|da|sv)/.test(nav) ? "no" : "en";
}
export function setLang(l) { update((s) => (s.settings.lang = l), "settings.lang"); }
export function setTheme(t) { update((s) => (s.settings.theme = t), "settings.theme"); }

// Accounts
export function findDuplicate(a) {
  const login = (a.login || "").toLowerCase();
  const via = login.startsWith("via ");
  return state.accounts.find((x) => {
    const same = a.domain ? x.domain === a.domain : !x.domain && x.service.toLowerCase() === a.service.toLowerCase();
    if (!same) return false;
    // "via Google" style entries merge into any existing account at the same service
    return via || (x.login || "").toLowerCase() === login || (x.login || "").toLowerCase().startsWith("via ");
  });
}

export function addAccounts(list, source) {
  let added = 0, merged = 0;
  update((s) => {
    for (const raw of list) {
      const a = normalizeAccount({ ...raw, source: raw.source || source });
      const dup = findDuplicate(a);
      if (dup) {
        // keep the richer record: fill gaps, keep the worst leak count
        if (!dup.url && a.url) dup.url = a.url;
        if ((dup.login || "").toLowerCase().startsWith("via ") && a.login && !a.login.toLowerCase().startsWith("via ")) dup.login = a.login;
        if (!dup.created && a.created) dup.created = a.created;
        if (a.lastUsed && (!dup.lastUsed || a.lastUsed > dup.lastUsed)) dup.lastUsed = a.lastUsed;
        if (a.pwned != null) dup.pwned = Math.max(dup.pwned || 0, a.pwned);
        if (a.reuse && !dup.reuse) dup.reuse = a.reuse;
        dup.updatedAt = new Date().toISOString();
        merged++;
      } else {
        s.accounts.push(a);
        added++;
      }
    }
  }, "accounts.added", { source });
  return { added, merged };
}

export function patchAccount(id, patch) {
  update((s) => {
    const a = s.accounts.find((x) => x.id === id);
    if (!a) return;
    Object.assign(a, patch, { updatedAt: new Date().toISOString() });
  }, "account.changed", { id, keys: Object.keys(patch) });
}

export function removeAccount(id) {
  update((s) => (s.accounts = s.accounts.filter((x) => x.id !== id)), "account.removed", { id });
}
