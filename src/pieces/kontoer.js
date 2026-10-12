// Piece: Kontoer (Accounts). Map every account you have, from password exports, your inbox and by hand.
import { getState, addAccounts, patchAccount, removeAccount } from "../core/store.js";
import { on } from "../core/bus.js";
import { tr, esc, pick, uid, toast, copyText, domainOf, fmtDate, fmtYearMonth, fmtNum } from "../core/util.js";
import { readExport } from "../core/csv.js";
import { pwnedCount, cachedCatalogue, breachesByDomain, DATA_NO, dangerous } from "../core/leaks.js";
import { accountExposure } from "../core/analysis.js";
import { lookup, CATEGORIES, searchDeleteUrl } from "../data/services.js";
import { INBOX_QUERIES, CONNECTED, EXPORT_HELP } from "../data/finders.js";

export const meta = { path: "kontoer", title: { no: "Kontoer", en: "Accounts" } };

export const STATUS = {
  unknown: { no: "Ikke gjennomgått", en: "Not reviewed", cls: "" },
  keep: { no: "Behold", en: "Keep", cls: "ok" },
  cleanup: { no: "Rydd", en: "Tidy up", cls: "accent" },
  delete: { no: "Slett", en: "Delete", cls: "warn" },
  deleted: { no: "Slettet", en: "Deleted", cls: "" },
};

const F = { text: "", status: "", cat: "", sort: "name" };
const open = new Set();
let root, unsub = [];

export function render(el, params) {
  root = el;
  unsub.forEach((u) => u()); unsub = [];
  if (params[0]) open.add(params[0]);
  el.innerHTML = `<div class="wrap">
    <div class="section-head"><div>
      <p class="eyebrow">${tr("Brikke 1 · Kontoer", "Piece 1 · Accounts")}</p>
      <h1>${tr("Alle kontoene dine, på ett sted", "All your accounts, in one place")}</h1>
      <p class="lede">${tr("Hent dem fra passordbehandleren, finn de glemte i innboksen, eller legg dem til selv. Ingenting forlater nettleseren din.", "Pull them from your password manager, find the forgotten ones in your inbox, or add them yourself. Nothing leaves your browser.")}</p>
    </div></div>
    <div class="grid-3">
      <div class="panel">
        <h3>${tr("Importer fra passordbehandler", "Import from a password manager")}</h3>
        <p class="small muted">${tr("CSV fra Chrome, Firefox, Apple, Bitwarden, 1Password, Proton Pass, LastPass og flere. Passordene leses bare for sjekken under og lagres aldri.", "CSV from Chrome, Firefox, Apple, Bitwarden, 1Password, Proton Pass, LastPass and more. Passwords are read only for the check below and never stored.")}</p>
        <label class="check"><input type="checkbox" id="pwcheck" checked> <span>${tr("Sjekk passordene mot kjente lekkasjer (bare 5 tegn av en hash sendes)", "Check the passwords against known leaks (only 5 characters of a hash are sent)")}</span></label>
        <label class="check"><input type="checkbox" id="reusecheck" checked> <span>${tr("Finn kontoer som deler passord", "Find accounts that share a password")}</span></label>
        <input type="file" id="file" accept=".csv,text/csv" hidden>
        <div class="row"><button class="btn" data-act="pick">${tr("Velg CSV-fil", "Choose CSV file")}</button></div>
        <p class="small muted" id="import-status" role="status"></p>
        <details class="fold"><summary>${tr("Slik eksporterer du", "How to export")}</summary><div class="fold-body small">
          ${EXPORT_HELP.map((h) => `<p><b>${esc(h.app)}:</b> ${esc(pick(h))}</p>`).join("")}
          <p class="note warn">${tr("CSV-filen inneholder passordene dine i klartekst. Slett den (og tøm papirkurven) når importen er ferdig.", "The CSV file holds your passwords in plain text. Delete it (and empty the bin) once the import is done.")}</p>
        </div></details>
      </div>
      <form class="panel" id="addform">
        <h3>${tr("Legg til selv", "Add by hand")}</h3>
        <label class="field">${tr("Nettsted eller tjeneste", "Website or service")}<input type="text" name="site" placeholder="instagram.com" required></label>
        <label class="field">${tr("Brukernavn eller e-post (valgfritt)", "Username or email (optional)")}<input type="text" name="login" autocomplete="off"></label>
        <div class="row"><button class="btn" type="submit">${tr("Legg til", "Add")}</button></div>
        <details class="fold"><summary>${tr("Lim inn en liste", "Paste a list")}</summary><div class="fold-body">
          <textarea id="paste" placeholder="${tr("Én adresse per linje", "One address per line")}"></textarea>
          <button class="btn quiet sm" type="button" data-act="paste">${tr("Legg til alle", "Add all")}</button>
        </div></details>
      </form>
      <div class="panel">
        <h3>${tr("Finn glemte kontoer", "Find forgotten accounts")}</h3>
        <p class="small muted">${tr("Gamle kontoer gjemmer seg i innboksen og bak «logg inn med Google/Facebook».", "Old accounts hide in your inbox and behind «sign in with Google/Facebook».")}</p>
        <details class="fold"><summary>${tr("Søk i innboksen", "Search your inbox")}</summary><div class="fold-body">
          ${INBOX_QUERIES.map((x, i) => `<div class="stack"><span class="small"><b>${esc(pick(x))}</b></span><div class="row"><code class="small" style="overflow-wrap:anywhere">${esc(x.q)}</code><button class="btn quiet sm" type="button" data-copy="${i}">${tr("Kopier", "Copy")}</button></div></div>`).join("")}
          <p class="small muted">${tr("Lim inn i søkefeltet i Gmail (fungerer også delvis i Outlook). Legg til tjenestene du finner.", "Paste into the Gmail search box (partly works in Outlook too). Add the services you find.")}</p>
        </div></details>
        <details class="fold"><summary>${tr("«Logg inn med»-tilkoblinger", "«Sign in with» connections")}</summary><div class="fold-body">
          <div class="links">${CONNECTED.map((c) => `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.label)}</a>`).join("")}</div>
          <p class="small muted">${tr("Apple: Innstillinger > ditt navn > Logg på med Apple.", "Apple: Settings > your name > Sign in with Apple.")}</p>
        </div></details>
      </div>
    </div>
    <div class="section">
      <div class="toolbar">
        <label class="field">${tr("Søk", "Search")}<input type="search" id="f-text" value="${esc(F.text)}" placeholder="${tr("Navn, domene, brukernavn", "Name, domain, username")}"></label>
        <label class="field">${tr("Status", "Status")}<select id="f-status"><option value="">${tr("Alle", "All")}</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${F.status === k ? "selected" : ""}>${esc(pick(v))}</option>`).join("")}</select></label>
        <label class="field">${tr("Kategori", "Category")}<select id="f-cat"><option value="">${tr("Alle", "All")}</option>${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}" ${F.cat === k ? "selected" : ""}>${esc(pick(v))}</option>`).join("")}</select></label>
        <label class="field">${tr("Sorter", "Sort")}<select id="f-sort">
          <option value="name" ${F.sort === "name" ? "selected" : ""}>${tr("Navn", "Name")}</option>
          <option value="risk" ${F.sort === "risk" ? "selected" : ""}>${tr("Risiko først", "Risk first")}</option>
          <option value="old" ${F.sort === "old" ? "selected" : ""}>${tr("Eldst brukt først", "Least recently used")}</option>
          <option value="new" ${F.sort === "new" ? "selected" : ""}>${tr("Sist lagt til", "Recently added")}</option>
        </select></label>
      </div>
      <div class="row between"><p class="small muted" id="count"></p><div class="row" id="bulk"></div></div>
      <div class="list" id="list"></div>
    </div>
  </div>`;
  bind();
  renderList();
  unsub.push(on("state.changed", () => { if (root.isConnected && document.getElementById("list")) renderList(); }));
  if (params[0]) setTimeout(() => document.getElementById(`a-${params[0]}`)?.scrollIntoView({ block: "center" }), 50);
}

function risk(a, byDomain, groups) {
  let r = 0;
  if (a.pwned > 0) r += 100;
  if (a.reuse && (groups.get(a.reuse) || 0) > 1) r += 50;
  const b = byDomain.get(a.domain);
  if (b) r += dangerous(b.flatMap((x) => x.dc)) ? 40 : 20;
  r += accountExposure(a) / 4;
  if (a.status === "deleted") r -= 500;
  return r;
}

function filtered() {
  const s = getState();
  const byDomain = breachesByDomain(cachedCatalogue());
  const groups = new Map();
  for (const a of s.accounts) if (a.reuse && a.status !== "deleted") groups.set(a.reuse, (groups.get(a.reuse) || 0) + 1);
  const t = F.text.trim().toLowerCase();
  let list = s.accounts.filter((a) => (!F.status || a.status === F.status) && (!F.cat || a.category === F.cat) &&
    (!t || `${a.service} ${a.domain} ${a.login} ${a.notes}`.toLowerCase().includes(t)));
  const by = {
    name: (x, y) => (x.service || x.domain).localeCompare(y.service || y.domain),
    risk: (x, y) => risk(y, byDomain, groups) - risk(x, byDomain, groups),
    old: (x, y) => (x.lastUsed || "9999").localeCompare(y.lastUsed || "9999"),
    new: (x, y) => (y.addedAt || "").localeCompare(x.addedAt || ""),
  }[F.sort];
  list.sort(by);
  return { list, byDomain, groups, total: s.accounts.length };
}

function row(a, byDomain, groups) {
  const st = STATUS[a.status];
  const breaches = byDomain.get(a.domain) || [];
  const reuseN = a.reuse ? groups.get(a.reuse) || 0 : 0;
  const exp = a.visChecked ? accountExposure(a) : null;
  const svc = lookup(a.domain);
  const badges = [
    a.pwned > 0 ? `<span class="tag danger">${tr("Passord lekket", "Password leaked")}</span>` : "",
    reuseN > 1 ? `<span class="tag warn">${tr(`Delt passord ×${reuseN}`, `Shared password ×${reuseN}`)}</span>` : "",
    breaches.length ? `<span class="tag ${dangerous(breaches.flatMap((b) => b.dc)) ? "danger" : "warn"}">${tr("Datainnbrudd", "Breached")}</span>` : "",
    exp ? `<span class="tag warn">${tr("Synlig", "Visible")} ${exp}%</span>` : "",
    `<span class="tag ${st.cls}">${esc(pick(st))}</span>`,
  ].join("");
  return `<details class="acct st-${a.status}" id="a-${esc(a.id)}" data-id="${esc(a.id)}" ${open.has(a.id) ? "open" : ""}>
    <summary><div class="acct-name"><b>${esc(a.service || a.domain)}</b><span>${esc(a.domain)}${a.login ? " · " + esc(a.login) : ""}</span></div><div class="acct-badges">${badges}</div></summary>
    <div class="acct-body">
      <div class="row" role="group" aria-label="Status">${Object.entries(STATUS).map(([k, v]) => `<button type="button" class="btn sm ${a.status === k ? "" : "quiet"}" data-status="${k}" aria-pressed="${a.status === k}">${esc(pick(v))}</button>`).join("")}</div>
      <div class="grid-2">
        <dl class="kv">
          <dt>${tr("Tjeneste", "Service")}</dt><dd><input type="text" data-edit="service" value="${esc(a.service)}"></dd>
          <dt>${tr("Innlogging", "Login")}</dt><dd><input type="text" data-edit="login" value="${esc(a.login)}"></dd>
          <dt>${tr("Kategori", "Category")}</dt><dd><select data-edit="category">${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}" ${a.category === k ? "selected" : ""}>${esc(pick(v))}</option>`).join("")}</select></dd>
          <dt>${tr("Sist brukt", "Last used")}</dt><dd><input type="month" data-edit="lastUsed" value="${a.lastUsed ? esc(a.lastUsed.slice(0, 7)) : ""}"></dd>
          <dt>${tr("Kilde", "Source")}</dt><dd>${esc(a.source)}${a.created ? ` · ${tr("opprettet", "created")} ${esc(fmtYearMonth(a.created))}` : ""}</dd>
        </dl>
        <div class="stack">
          ${a.pwned > 0 ? `<p class="note danger">${tr(`Passordet du hadde lagret her finnes ${fmtNum(a.pwned)} ganger i kjente lekkasjer. Bytt det, og bruk det ikke noe annet sted.`, `The password you had saved here appears ${fmtNum(a.pwned)} times in known leaks. Change it, and don't use it anywhere else.`)}</p>` : ""}
          ${reuseN > 1 ? `<p class="note warn">${tr(`Samme passord ble brukt på ${reuseN} kontoer. Lekker én, er alle åpne.`, `The same password was used on ${reuseN} accounts. If one leaks, all are open.`)}</p>` : ""}
          ${breaches.length ? `<div class="stack"><b class="small">${tr("Kjente datainnbrudd hos tjenesten", "Known breaches at this service")}</b>${breaches.slice(0, 4).map((b) => `<p class="small"><b>${esc(b.t || b.n)}</b> · ${esc(fmtDate(b.bd))} · ${esc(b.dc.slice(0, 6).map((d) => tr(DATA_NO[d] || d, d)).join(", "))}</p>`).join("")}</div>` : ""}
          <div class="row">
            ${svc.del ? `<a class="btn sm" href="${esc(svc.del)}" target="_blank" rel="noopener">${tr("Åpne sletteside", "Open delete page")}</a>` : `<a class="btn quiet sm" href="${esc(searchDeleteUrl(a.service || a.domain))}" target="_blank" rel="noopener">${tr("Finn sletteside", "Find delete page")}</a>`}
            <a class="btn quiet sm" href="#/rens/maler">${tr("Brevmal", "Letter")}</a>
            <a class="btn quiet sm" href="#/synlighet/${encodeURIComponent(a.id)}">${tr("Hva viser du her?", "What do you show here?")}</a>
          </div>
        </div>
      </div>
      <label class="field">${tr("Notater", "Notes")}<textarea data-edit="notes" rows="2">${esc(a.notes)}</textarea></label>
      <div class="row between"><span class="small muted">${tr("Lagt til", "Added")} ${esc(fmtDate(a.addedAt))}</span>
        <span class="row"><button type="button" class="btn quiet sm" data-act="remove">${tr("Fjern fra listen", "Remove from list")}</button>
        <button type="button" class="btn danger sm" data-act="remove-yes" hidden>${tr("Ja, fjern", "Yes, remove")}</button></span></div>
    </div>
  </details>`;
}

function renderList() {
  const { list, byDomain, groups, total } = filtered();
  const box = document.getElementById("list");
  if (!box) return;
  document.getElementById("count").textContent = total ? tr(`Viser ${list.length} av ${total} kontoer`, `Showing ${list.length} of ${total} accounts`) : "";
  document.getElementById("bulk").innerHTML = list.length > 1 ? `<label class="field" style="min-width:200px">${tr("Sett status for alle som vises", "Set status for all shown")}<select id="bulkset"><option value="">…</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}">${esc(pick(v))}</option>`).join("")}</select></label>` : "";
  if (!total) {
    box.innerHTML = `<div class="empty"><b>${tr("Ingen kontoer ennå", "No accounts yet")}</b><p>${tr("Start med en import fra passordbehandleren, den finner flest.", "Start with an import from your password manager, it finds the most.")}</p></div>`;
    return;
  }
  box.innerHTML = list.length ? list.map((a) => row(a, byDomain, groups)).join("") : `<div class="empty">${tr("Ingen treff.", "No matches.")}</div>`;
}

function bind() {
  const el = root;
  el.onclick = async (e) => {
    const t = e.target.closest("button, [data-act]");
    if (!t) return;
    const card = t.closest("[data-id]");
    const id = card?.dataset.id;
    if (t.dataset.act === "pick") return document.getElementById("file").click();
    if (t.dataset.copy != null) return copyText(INBOX_QUERIES[+t.dataset.copy].q);
    if (t.dataset.act === "paste") return addPasted();
    if (t.dataset.status && id) { patchAccount(id, { status: t.dataset.status }); return; }
    if (t.dataset.act === "remove") { t.hidden = true; t.nextElementSibling.hidden = false; return; }
    if (t.dataset.act === "remove-yes" && id) { removeAccount(id); toast(tr("Fjernet fra listen.", "Removed from the list.")); }
  };
  if (!el.dataset.acctToggle) {
    el.dataset.acctToggle = "1";
    el.addEventListener("toggle", (e) => { const d = e.target; if (d.classList?.contains("acct")) d.open ? open.add(d.dataset.id) : open.delete(d.dataset.id); }, true);
  }
  el.oninput = (e) => {
    if (e.target.id === "f-text") { F.text = e.target.value; renderList(); }
  };
  el.onchange = async (e) => {
    const t = e.target;
    if (t.id === "f-status") { F.status = t.value; return renderList(); }
    if (t.id === "f-cat") { F.cat = t.value; return renderList(); }
    if (t.id === "f-sort") { F.sort = t.value; return renderList(); }
    if (t.id === "bulkset" && t.value) {
      const ids = filtered().list.map((a) => a.id);
      ids.forEach((id) => patchAccount(id, { status: t.value }));
      toast(tr(`Oppdaterte ${ids.length} kontoer.`, `Updated ${ids.length} accounts.`));
      return;
    }
    if (t.id === "file" && t.files[0]) { await importFile(t.files[0]); t.value = ""; return; }
    const card = t.closest("[data-id]");
    if (card && t.dataset.edit) {
      let v = t.value;
      if (t.dataset.edit === "lastUsed") v = v ? new Date(v + "-01T00:00:00Z").toISOString() : null;
      patchAccount(card.dataset.id, { [t.dataset.edit]: v });
    }
  };
  el.onsubmit = (e) => {
    if (e.target.id !== "addform") return;
    e.preventDefault();
    const fd = new FormData(e.target);
    const site = String(fd.get("site") || "").trim();
    const d = domainOf(site);
    if (!d) return toast(tr("Skriv en nettadresse, for eksempel instagram.com", "Type a web address, for example instagram.com"));
    const svc = lookup(d);
    const r = addAccounts([{ id: uid(), domain: d, url: site, login: String(fd.get("login") || "").trim(), service: svc.name, category: svc.category }], "manual");
    e.target.reset();
    toast(r.added ? tr("Lagt til.", "Added.") : tr("Fantes fra før.", "Already there."));
  };
}

function addPasted() {
  const lines = document.getElementById("paste").value.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  const list = lines.map((l) => { const d = domainOf(l); const svc = lookup(d); return d ? { id: uid(), domain: d, url: l, service: svc.name, category: svc.category } : null; }).filter(Boolean);
  if (!list.length) return toast(tr("Fant ingen adresser.", "No addresses found."));
  const r = addAccounts(list, "paste");
  document.getElementById("paste").value = "";
  toast(tr(`La til ${r.added}, ${r.merged} fantes fra før.`, `Added ${r.added}, ${r.merged} already there.`));
}

async function importFile(file) {
  const status = document.getElementById("import-status");
  const doPw = document.getElementById("pwcheck").checked;
  const doReuse = document.getElementById("reusecheck").checked;
  status.textContent = tr("Leser filen…", "Reading the file…");
  let text = await file.text();
  let { rows, detected } = readExport(text);
  text = null;
  if (!detected || !rows.length) { status.textContent = tr("Fant ingen kontoer. Er dette en CSV-eksport fra en passordbehandler?", "No accounts found. Is this a CSV export from a password manager?"); return; }

  // Passwords stay inside this function. Only counts and random group labels survive.
  const uses = new Map();
  for (const r of rows) if (r.password) uses.set(r.password, (uses.get(r.password) || 0) + 1);
  const label = new Map();
  if (doReuse) for (const [pw, n] of uses) if (n > 1) label.set(pw, "g" + uid().slice(0, 8));
  const counts = new Map();
  let checked = 0, failed = false;
  if (doPw) {
    const unique = [...uses.keys()];
    for (const pw of unique) {
      try { counts.set(pw, await pwnedCount(pw)); } catch { failed = true; break; }
      checked++;
      if (checked % 10 === 0) status.textContent = tr(`Sjekker passord ${checked} av ${unique.length}…`, `Checking password ${checked} of ${unique.length}…`);
    }
  }
  const list = [];
  for (const r of rows) {
    const d = domainOf(r.url) || domainOf(r.name);
    if (!d) continue;
    const svc = lookup(d);
    list.push({ id: uid(), domain: d, url: r.url, login: r.login, service: svc.known ? svc.name : r.name || svc.name, category: svc.category, created: r.created, lastUsed: r.lastUsed,
      pwned: r.password && counts.has(r.password) ? counts.get(r.password) : null, reuse: r.password ? label.get(r.password) || null : null });
    r.password = "";
  }
  uses.clear(); label.clear(); counts.clear(); rows = null;
  const res = addAccounts(list, "import");
  const leaked = list.filter((x) => x.pwned > 0).length;
  status.innerHTML = esc(tr(`Ferdig: ${res.added} nye kontoer, ${res.merged} slått sammen med eksisterende.`, `Done: ${res.added} new accounts, ${res.merged} merged with existing ones.`)) +
    (doPw ? " " + esc(failed ? tr("Passordsjekken stoppet (ingen nettforbindelse?).", "The password check stopped (no connection?).") : tr(`${leaked} kontoer hadde et passord som finnes i lekkasjer.`, `${leaked} accounts had a password found in leaks.`)) : "") +
    `<br><b>${esc(tr("Husk å slette CSV-filen nå.", "Remember to delete the CSV file now."))}</b>`;
}
