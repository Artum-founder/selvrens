// GET /api/breaches
// The public catalogue of known breaches from Have I Been Pwned (CC BY 4.0), trimmed and cached at the edge.
// Nothing personal is sent or stored.
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "method" });
  try {
    const r = await fetch("https://haveibeenpwned.com/api/v3/breaches", { headers: { "user-agent": "selvrens.no" } });
    if (!r.ok) return res.status(502).json({ error: "upstream", status: r.status });
    const all = await r.json();
    const breaches = all.map((b) => ({
      n: b.Name, t: b.Title, d: b.Domain || "", bd: b.BreachDate, pc: b.PwnCount,
      dc: b.DataClasses || [], v: !!b.IsVerified, f: !!b.IsFabricated, s: !!b.IsSensitive, sp: !!b.IsSpamList,
    }));
    res.setHeader("cache-control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json({ at: new Date().toISOString(), source: "haveibeenpwned.com (CC BY 4.0)", breaches });
  } catch {
    return res.status(502).json({ error: "upstream" });
  }
}
