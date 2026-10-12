// Export and import of the local state, optionally locked with a passphrase (AES-GCM, PBKDF2-SHA-256).
const ITER = 310000;
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function keyFrom(pass, salt) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function exportState(state, pass) {
  const payload = JSON.stringify(state);
  if (!pass) return JSON.stringify({ format: "selvrens-export", v: 1, locked: false, exportedAt: new Date().toISOString(), state }, null, 2);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFrom(pass, salt);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(payload));
  return JSON.stringify({ format: "selvrens-export", v: 1, locked: true, exportedAt: new Date().toISOString(), kdf: { name: "PBKDF2-SHA-256", iter: ITER, salt: b64(salt) }, iv: b64(iv), data: b64(ct) }, null, 2);
}

export function isLocked(text) {
  try { const j = JSON.parse(text); return j.format === "selvrens-export" && j.locked; } catch { return false; }
}

export async function importState(text, pass) {
  const j = JSON.parse(text);
  if (j.format !== "selvrens-export") throw new Error("format");
  if (!j.locked) return j.state;
  const key = await keyFrom(pass || "", unb64(j.kdf.salt));
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(j.iv) }, key, unb64(j.data));
  return JSON.parse(new TextDecoder().decode(pt));
}
