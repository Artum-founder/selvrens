// Shared helpers for the email checks. The address is used for one upstream request and never logged or stored.
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

// A tiny per-instance rate limit: enough to stop casual abuse without keeping any record of who asked.
const hits = new Map();
export function limited(req, max = 8, windowMs = 60000) {
  const key = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

export function readEmail(req) {
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const email = String(body?.email || "").trim().toLowerCase();
  return EMAIL.test(email) ? email : null;
}

export function noStore(res) {
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-robots-tag", "noindex");
}
