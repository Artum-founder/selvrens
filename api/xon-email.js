// POST /api/xon-email { email }
// Free email breach check through XposedOrNot (https://xposedornot.com). No key needed.
import { readEmail, limited, noStore } from "./_email.js";

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  if (limited(req)) return res.status(429).json({ error: "rate" });
  const email = readEmail(req);
  if (!email) return res.status(400).json({ error: "email" });
  try {
    const r = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`, { headers: { "user-agent": "selvrens.no" } });
    if (r.status === 404) return res.status(200).json({ breaches: [] });
    if (r.status === 429) return res.status(429).json({ error: "rate" });
    if (!r.ok) return res.status(502).json({ error: "upstream" });
    const j = await r.json();
    if (j && j.Error) return res.status(200).json({ breaches: [] });
    const raw = Array.isArray(j?.breaches) ? j.breaches.flat() : [];
    return res.status(200).json({ breaches: [...new Set(raw.map(String))] });
  } catch {
    return res.status(502).json({ error: "upstream" });
  }
}
