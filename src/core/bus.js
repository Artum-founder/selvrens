// The piece's inner event bus. Modules publish here; the SOL border (src/sol/border.js)
// listens and forwards only what an active bond allows.
const subs = new Map();

export function on(topic, fn) {
  if (!subs.has(topic)) subs.set(topic, new Set());
  subs.get(topic).add(fn);
  return () => subs.get(topic)?.delete(fn);
}

export function emit(topic, payload) {
  for (const key of [topic, "*"]) {
    const set = subs.get(key);
    if (!set) continue;
    for (const fn of set) {
      try { fn(payload, topic); } catch (e) { console.warn("[selvrens bus]", topic, e); }
    }
  }
}
