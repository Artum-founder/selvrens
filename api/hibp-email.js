// POST /api/hibp-email { email }
// Official Have I Been Pwned check. Answers { enabled: false } until HIBP_API_KEY is set in the Vercel project.
// A key costs about USD 4.50 a month at https://haveibeenpwned.com/API/Key
import { readEmail, limited, noStore } from "./_email.js";

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const key = process.env.HIBP_API_KEY;
  if (!key) return res.status(200).json({ enabled: false });
  if (limited(req, 6)) return res.status(429).json({ error: "rate" });
  const email = readEmail(req);
  if (!email) return res.status(400).json({ error: "email" });
  try {
    const r = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=true`, {
      headers: { "hibp-api-key": key, "user-agent": "selvrens.no" },
    });
    if (r.status === 404) return res.status(200).json({ breaches: [] });
    if (r.status === 429) return res.status(429).json({ error: "rate" });
    if (!r.ok) return res.status(502).json({ error: "upstream" });
    const j = await r.json();
    return res.status(200).json({ breaches: (j || []).map((b) => b.Name) });
  } catch {
    return res.status(502).json({ error: "upstream" });
  }
}
