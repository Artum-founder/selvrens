// CSV parsing and password-manager export mapping. Runs only in the browser.

export function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  const s = String(text || "").replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"') {
        if (s[i + 1] === '"') { cell += '"'; i++; } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === ";" && rows.length === 0 && row.length === 0 && !s.slice(0, 400).includes(",")) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v !== "")) rows.push(row);
  return rows;
}

// Header names used by common exports: Chrome/Edge/Google, Firefox, Bitwarden, 1Password,
// Apple Passwords, LastPass, Proton Pass, Dashlane, KeePass(XC), NordPass.
const H = {
  url: ["url", "login_uri", "web site", "website", "uri", "urls", "login url", "address"],
  login: ["username", "login_username", "login name", "login", "email", "user name", "user", "username2"],
  name: ["name", "title", "account", "item name"],
  password: ["password", "login_password", "pass"],
  created: ["timecreated", "createtime", "created", "creation time", "date created"],
  lastUsed: ["timelastused", "last used", "lastused", "modifytime", "last modified", "modified", "timepasswordchanged"],
};

export function mapHeader(header) {
  const h = header.map((x) => String(x || "").trim().toLowerCase());
  const idx = {};
  for (const [k, names] of Object.entries(H)) {
    idx[k] = -1;
    for (const n of names) {
      const i = h.indexOf(n);
      if (i >= 0) { idx[k] = i; break; }
    }
  }
  return idx;
}

function toISO(v) {
  if (!v) return null;
  const s = String(v).trim();
  if (/^\d{10,13}$/.test(s)) {
    const n = Number(s);
    const d = new Date(s.length === 13 ? n : n * 1000);
    return isNaN(d) ? null : d.toISOString();
  }
  const d = new Date(s);
  return isNaN(d) ? null : d.toISOString();
}

// Returns { rows: [{url, login, name, password, created, lastUsed}], idx, detected }
export function readExport(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) return { rows: [], idx: null, detected: false };
  const idx = mapHeader(rows[0]);
  const detected = idx.url >= 0 || idx.name >= 0;
  const out = [];
  for (const r of rows.slice(1)) {
    const get = (k) => (idx[k] >= 0 ? (r[idx[k]] || "").trim() : "");
    const url = get("url"), name = get("name"), login = get("login");
    if (!url && !name) continue;
    out.push({ url, name, login, password: get("password"), created: toISO(get("created")), lastUsed: toISO(get("lastUsed")) });
  }
  return { rows: out, idx, detected };
}
