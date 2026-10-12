// Small shared helpers. No dependencies.
import { getLang } from "./store.js";

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// tr("Norsk", "English") picks the text for the current language.
export const tr = (no, en) => (getLang() === "en" ? en : no);
// pick({no, en}) for data objects that carry both languages.
export const pick = (o) => (o && typeof o === "object" ? (getLang() === "en" ? o.en ?? o.no : o.no ?? o.en) : o ?? "");

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let toastTimer;
export function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2600);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(tr("Kopiert.", "Copied."));
    return true;
  } catch {
    toast(tr("Kunne ikke kopiere. Merk teksten og kopier selv.", "Could not copy. Select the text and copy it yourself."));
    return false;
  }
}

export function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  return d.toLocaleDateString(getLang() === "en" ? "en-GB" : "nb-NO", { year: "numeric", month: "short", day: "numeric" });
}
export function fmtYearMonth(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  return d.toLocaleDateString(getLang() === "en" ? "en-GB" : "nb-NO", { year: "numeric", month: "short" });
}
export const fmtNum = (n) => Number(n || 0).toLocaleString(getLang() === "en" ? "en-GB" : "nb-NO");

// Domain helpers: reduce a URL or host to the registrable domain ("accounts.google.com" -> "google.com").
const TWO_LEVEL = new Set(["co.uk", "org.uk", "ac.uk", "com.au", "net.au", "co.nz", "co.jp", "com.br", "co.za", "com.mx", "com.tr", "co.in", "com.sg", "com.cn"]);
export function domainOf(input) {
  if (!input) return "";
  let s = String(input).trim().toLowerCase();
  if (s.startsWith("android://")) {
    const m = s.match(/@([a-z0-9.-]+)\/?$/);
    s = m ? m[1].split(".").reverse().join(".") : s;
  }
  try {
    if (!/^[a-z][a-z0-9+.-]*:\/\//.test(s)) s = "https://" + s;
    const host = new URL(s).hostname.replace(/^www\./, "");
    const parts = host.split(".").filter(Boolean);
    if (parts.length <= 2) return host;
    const last2 = parts.slice(-2).join(".");
    return TWO_LEVEL.has(last2) ? parts.slice(-3).join(".") : last2;
  } catch {
    return "";
  }
}

export function debounce(fn, ms = 250) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export function download(filename, text, type = "application/json") {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
