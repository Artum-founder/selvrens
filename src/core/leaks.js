// Leak checks. Three sources, all honest about what leaves the browser:
// 1. Pwned Passwords (k-anonymity): only the first 5 characters of a SHA-1 hash leave the browser.
// 2. Breach catalogue (public list of breached services, Have I Been Pwned, CC BY 4.0) via /api/breaches.
// 3. Email checks: XposedOrNot (free) and Have I Been Pwned (needs a key on the server) via /api/*.

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

async function postJSON(url, body) {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  let j = null;
  try { j = await r.json(); } catch {}
  return { status: r.status, body: j };
}

// Free check through XposedOrNot. Returns { ok, breaches: [names] } or { ok:false, reason }.
export async function checkEmailXON(email) {
  const { status, body } = await postJSON("/api/xon-email", { email });
  if (status === 200) return { ok: true, breaches: body.breaches || [] };
  if (status === 429) return { ok: false, reason: "rate" };
  return { ok: false, reason: "error" };
}

// Official Have I Been Pwned check. Switched off ({ enabled:false }) until HIBP_API_KEY is set on the server.
export async function checkEmailHIBP(email) {
  const { status, body } = await postJSON("/api/hibp-email", { email });
  if (status === 200 && body && body.enabled === false) return { ok: false, reason: "off" };
  if (status === 200) return { ok: true, breaches: body.breaches || [] };
  if (status === 501) return { ok: false, reason: "off" };
  if (status === 429) return { ok: false, reason: "rate" };
  return { ok: false, reason: "error" };
}

// Data class names from the catalogue, in Norwegian. Others are shown as they are.
export const DATA_NO = {
  "Email addresses": "E-postadresser", "Passwords": "Passord", "Usernames": "Brukernavn", "Names": "Navn",
  "Phone numbers": "Telefonnumre", "Physical addresses": "Adresser", "Dates of birth": "Fødselsdatoer",
  "IP addresses": "IP-adresser", "Genders": "Kjønn", "Geographic locations": "Steder", "Credit cards": "Kortnumre",
  "Partial credit card data": "Deler av kortnumre", "Bank account numbers": "Kontonumre", "Social media profiles": "Profiler i sosiale medier",
  "Job titles": "Stillinger", "Employers": "Arbeidsgivere", "Private messages": "Private meldinger", "Security questions and answers": "Sikkerhetsspørsmål",
  "Password hints": "Passordhint", "Profile photos": "Profilbilder", "Website activity": "Aktivitet på nettstedet", "Device information": "Enhetsinfo",
  "Purchases": "Kjøp", "Government issued IDs": "ID-dokumenter", "Auth tokens": "Innloggingsnøkler", "Spoken languages": "Språk",
};
export const dangerous = (dc = []) => dc.some((x) => /Passwords|Credit cards|Bank account|Security questions|Auth tokens|Government issued/.test(x));
