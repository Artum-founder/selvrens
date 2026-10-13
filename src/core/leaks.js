// Leak checks. Three sources, all honest about what leaves the browser:
// 1. Pwned Passwords (k-anonymity): only the first 5 characters of a SHA-1 hash leave the browser.
// 2. Breach catalogue (public list of breached services, Have I Been Pwned, CC BY 4.0) via /api/breaches.
// 3. Email check: XposedOrNot (free), asked straight from the visitor's browser. Our server is not involved.

export async function sha1Hex(text) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

const rangeCache = new Map();
// Returns how many times this password appears in known leaks (0 = not found). Throws on network error.
export async function pwnedCount(password) {
  if (!password) return 0;
  const h = await sha1Hex(password);
  const prefix = h.slice(0, 5), suffix = h.slice(5);
  let body = rangeCache.get(prefix);
  if (!body) {
    const r = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { referrerPolicy: "no-referrer" });
    if (!r.ok) throw new Error("pwnedpasswords " + r.status);
    body = await r.text();
    rangeCache.set(prefix, body);
  }
  for (const line of body.split("\n")) {
    const [suf, count] = line.trim().split(":");
    if (suf === suffix) return Number(count) || 0;
  }
  return 0;
}

const CAT_KEY = "selvrens:breaches";
let catalogue = null;

export function cachedCatalogue() {
  if (catalogue) return catalogue;
  try {
    const raw = localStorage.getItem(CAT_KEY);
    if (raw) catalogue = JSON.parse(raw);
  } catch {}
  return catalogue;
}

export async function loadCatalogue(force = false) {
  const c = cachedCatalogue();
  const fresh = c && Date.now() - new Date(c.fetchedAt).getTime() < 3 * 24 * 3600 * 1000;
  if (c && fresh && !force) return c;
  const r = await fetch("/api/breaches", { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error("breaches " + r.status);
  const j = await r.json();
  catalogue = { fetchedAt: new Date().toISOString(), at: j.at, breaches: j.breaches || [] };
  try { localStorage.setItem(CAT_KEY, JSON.stringify(catalogue)); } catch {}
  return catalogue;
}

// Index breaches by domain for quick matching against the account list.
export function breachesByDomain(cat) {
  const map = new Map();
  if (!cat) return map;
  for (const b of cat.breaches) {
    if (!b.d || b.sp || b.f) continue; // skip spam lists and fabricated breaches
    const d = String(b.d).toLowerCase().replace(/^www\./, "");
    if (!map.has(d)) map.set(d, []);
    map.get(d).push(b);
  }
  for (const list of map.values()) list.sort((a, b) => (b.bd || "").localeCompare(a.bd || ""));
  return map;
}

export function breachByName(cat, name) {
  if (!cat || !name) return null;
  const n = String(name).toLowerCase();
  return cat.breaches.find((b) => b.n.toLowerCase() === n || (b.t || "").toLowerCase() === n) || null;
}

const XON = "https://api.xposedornot.com/v1/breach-analytics?email=";
const clip = (t, n) => { t = String(t || "").trim(); return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t; };

// Free check through XposedOrNot, with details for every breach the address is in.
// Asked directly from the browser, so each visitor has their own quota and nothing passes our server.
// Returns { ok, breaches: [names], details: [...], risk } or { ok:false, reason }.
export async function checkEmailXON(email) {
  let r;
  try { r = await fetch(XON + encodeURIComponent(email), { referrerPolicy: "no-referrer", credentials: "omit" }); }
  catch { return { ok: false, reason: "network" }; }
  if (r.status === 429) return { ok: false, reason: "rate" };
  if (r.status === 404) return { ok: true, breaches: [], details: [], risk: null };
  if (!r.ok) return { ok: false, reason: "error" };
  let j = null;
  try { j = await r.json(); } catch { return { ok: false, reason: "error" }; }
  const raw = j?.ExposedBreaches?.breaches_details;
  if (!Array.isArray(raw)) return { ok: true, breaches: [], details: [], risk: null };
  const details = raw.map((b) => ({
    n: String(b.breach || ""),
    d: String(b.domain || "").toLowerCase(),
    desc: clip(b.details, 420),
    ind: String(b.industry || ""),
    risk: String(b.password_risk || "unknown").toLowerCase(),
    data: String(b.xposed_data || "").split(";").map((x) => x.trim()).filter(Boolean),
    year: String(b.xposed_date || ""),
    rec: Number(b.xposed_records) || 0,
    v: String(b.verified || "").toLowerCase() === "yes",
  })).filter((b) => b.n);
  const m = j?.BreachMetrics?.risk?.[0];
  const risk = m ? { label: String(m.risk_label || ""), score: Number(m.risk_score) || 0 } : null;
  return { ok: true, breaches: details.map((b) => b.n), details, risk };
}

// How hard the leaked passwords are to read, as reported by XposedOrNot.
export const PW_RISK = {
  plaintext: { no: "Passordene lå åpent, uten beskyttelse.", en: "The passwords were stored openly, without protection.", lvl: 3 },
  easytocrack: { no: "Passordene var svakt beskyttet og lette å knekke.", en: "The passwords were weakly protected and easy to crack.", lvl: 2 },
  hardtocrack: { no: "Passordene var godt beskyttet, men bytt likevel.", en: "The passwords were well protected, but change them anyway.", lvl: 1 },
  unknown: { no: "Ukjent hvor godt passordene var beskyttet.", en: "Unknown how well the passwords were protected.", lvl: 1 },
};

// Data class names from the catalogue, in Norwegian. Others are shown as they are.
export const DATA_NO = {
  "Email addresses": "E-postadresser", "Passwords": "Passord", "Usernames": "Brukernavn", "Names": "Navn",
  "Phone numbers": "Telefonnumre", "Physical addresses": "Adresser", "Dates of birth": "Fødselsdatoer",
  "IP addresses": "IP-adresser", "Genders": "Kjønn", "Geographic locations": "Steder", "Credit cards": "Kortnumre",
  "Partial credit card data": "Deler av kortnumre", "Bank account numbers": "Kontonumre", "Social media profiles": "Profiler i sosiale medier",
  "Job titles": "Stillinger", "Employers": "Arbeidsgivere", "Private messages": "Private meldinger", "Security questions and answers": "Sikkerhetsspørsmål",
  "Password hints": "Passordhint", "Profile photos": "Profilbilder", "Website activity": "Aktivitet på nettstedet", "Device information": "Enhetsinfo",
  "Purchases": "Kjøp", "Government issued IDs": "ID-dokumenter", "Auth tokens": "Innloggingsnøkler", "Spoken languages": "Språk",
  "Passwords hashes": "Passord (kryptert)", "Password hashes": "Passord (kryptert)", "Account balances": "Saldoer", "Ages": "Alder", "Income levels": "Inntekt", "Marital statuses": "Sivilstatus", "Nationalities": "Nasjonalitet", "Education levels": "Utdanning", "Payment histories": "Betalingshistorikk", "Health insurance information": "Helseforsikring", "Social security numbers": "Personnumre", "Vehicle details": "Kjøretøy",
};
export const dangerous = (dc = []) => dc.some((x) => /Password|Credit card|Bank account|Security question|Auth token|Government issued|Social security/i.test(x));
export const pwLeaked = (dc = []) => dc.some((x) => /Password/i.test(x));
