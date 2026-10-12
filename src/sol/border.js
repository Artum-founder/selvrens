// The electrified border: how Selvrens floats on the SOL ground and bonds with other pieces.
//
// Standalone by default: no bonds, nothing leaves. An admin can add a bond to another origin
// (for example https://opensol.earth) with a direction:
//   one-way-out  : Selvrens sends counts and events out, accepts nothing in
//   two-way      : also answers ping and summary requests, and may receive account offers (the person must accept)
//   pass-through : reserved for when Selvrens sits between two pieces and lets data travel on
// A bond can be lifted for repair (it stays, but nothing flows) and only cut on purpose.
// Messages use window.postMessage with an exact target origin, so nothing reaches anyone else.
import { getState, update, storageWorks, SCHEMA, addAccounts } from "../core/store.js";
import { on, emit } from "../core/bus.js";
import { summary } from "../core/analysis.js";
import { cachedCatalogue } from "../core/leaks.js";
import { uid, debounce, domainOf } from "../core/util.js";
import { lookup } from "../data/services.js";

export const PIECE = { id: "selvrens", version: "0.2.0", spec: "sol-piece/0.1-draft" };
const ENV = (type, payload) => ({ sol: "0.1", piece: PIECE.id, type, payload });

const bonds = () => getState().settings.bonds || [];
const active = () => (getState().settings.lifted ? [] : bonds().filter((b) => b.state === "bonded"));

function peer() {
  if (window.parent && window.parent !== window) return window.parent;
  if (window.opener) return window.opener;
  return null;
}

function send(type, payload, flow, onlyOrigin) {
  const target = peer();
  if (!target) return 0;
  let n = 0;
  for (const b of active()) {
    if (onlyOrigin && b.origin !== onlyOrigin) continue;
    if (flow && !(b.flows || []).includes(flow)) continue;
    try { target.postMessage(ENV(type, payload), b.origin); n++; } catch {}
  }
  return n;
}

export function health() {
  const checks = [];
  checks.push({ id: "storage", ok: storageWorks(), detail: storageWorks() ? "localStorage ok" : "localStorage unavailable: nothing is kept after this visit" });
  checks.push({ id: "crypto", ok: !!(window.crypto && crypto.subtle), detail: "Web Crypto for hashing and locked exports" });
  checks.push({ id: "schema", ok: getState().schema === SCHEMA, detail: `schema ${getState().schema}` });
  const bad = bonds().filter((b) => !/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(b.origin) || !["one-way-out", "two-way", "pass-through"].includes(b.direction));
  checks.push({ id: "bonds", ok: bad.length === 0, detail: `${bonds().length} bond(s), ${bad.length} invalid${getState().settings.lifted ? ", all lifted for repair" : ""}` });
  const cat = cachedCatalogue();
  const age = cat ? Math.round((Date.now() - new Date(cat.fetchedAt).getTime()) / 86400000) : null;
  checks.push({ id: "catalogue", ok: !!cat, detail: cat ? `breach catalogue ${cat.breaches.length} entries, ${age} day(s) old` : "breach catalogue not loaded yet" });
  return { piece: PIECE.id, version: PIECE.version, ok: checks.every((c) => c.ok || c.id === "catalogue"), checks };
}

// Admin actions
export function addBond(origin, direction, flows) {
  let o;
  try { o = new URL(origin).origin; } catch { throw new Error("origin"); }
  if (!o.startsWith("https://")) throw new Error("https");
  update((s) => s.settings.bonds.push({ id: uid(), origin: o, direction, flows: flows.length ? flows : ["summary"], state: "bonded", createdAt: new Date().toISOString() }), "sol.bond.added");
}
export function setBondState(id, state) {
  update((s) => { const b = s.settings.bonds.find((x) => x.id === id); if (b) b.state = state; }, "sol.bond.state", { id, state });
}
export function cutBond(id) {
  update((s) => (s.settings.bonds = s.settings.bonds.filter((x) => x.id !== id)), "sol.bond.cut", { id });
}
export function liftAll(lifted) {
  update((s) => (s.settings.lifted = !!lifted), "sol.lift", { lifted });
}

// Pending offers from bonded pieces wait here until the person accepts or declines.
export const offers = [];
export function acceptOffer(i) {
  const o = offers.splice(i, 1)[0];
  if (!o) return { added: 0, merged: 0 };
  const list = o.accounts.slice(0, 2000).map((x) => {
    const d = domainOf(x.domain || x.url || "");
    const svc = lookup(d);
    return { id: uid(), domain: d, url: x.url || "", login: x.login || "", service: x.service || svc.name, category: svc.category, source: `sol:${o.from}` };
  }).filter((x) => x.domain);
  const res = addAccounts(list, `sol:${o.from}`);
  emit("sol.offers");
  return res;
}
export function declineOffer(i) { offers.splice(i, 1); emit("sol.offers"); }

function onMessage(ev) {
  const b = active().find((x) => x.origin === ev.origin);
  if (!b) return; // not bonded, or lifted: ignore silently
  const m = ev.data;
  if (!m || m.sol !== "0.1" || typeof m.type !== "string") return;
  if (b.direction === "one-way-out") return; // nothing comes in on a one-way bond
  if (m.type === "selvrens.ping") return send("selvrens.pong", health(), null, ev.origin);
  if (m.type === "selvrens.summary.request") return send("selvrens.summary", summary(), null, ev.origin);
  if (m.type === "selvrens.accounts.offer" && b.direction === "two-way") {
    const accounts = Array.isArray(m.payload?.accounts) ? m.payload.accounts : [];
    if (!accounts.length) return;
    offers.push({ from: ev.origin, accounts, at: new Date().toISOString() });
    emit("sol.offers");
  }
}

export function startBorder() {
  window.addEventListener("message", onMessage);
  const pushSummary = debounce(() => send("selvrens.summary", summary(), "summary"), 800);
  on("state.changed", pushSummary);
  on("*", (payload, topic) => {
    if (topic === "state.changed" || topic.startsWith("sol.")) return;
    const count = payload && typeof payload.count === "number" ? payload.count : undefined;
    send("selvrens.event", { topic, at: new Date().toISOString(), count }, "events");
  });
  // A same-origin handle for inspection and for the future SOL ground.
  window.SOLPiece = Object.freeze({ id: PIECE.id, version: PIECE.version, spec: PIECE.spec, health, bonds: () => bonds().map((b) => ({ ...b })) });
}
