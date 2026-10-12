// Piece: Innstillinger (Settings). Your data, and the SOL border (bonds, repair, health).
import { getState, replaceState, wipe, setLang, setTheme, getLang } from "../core/store.js";
import { on } from "../core/bus.js";
import { tr, esc, toast, download, fmtDate } from "../core/util.js";
import { exportState, importState, isLocked } from "../core/vault.js";
import { health, addBond, setBondState, cutBond, liftAll, offers, acceptOffer, declineOffer, PIECE } from "../sol/border.js";
import { summary } from "../core/analysis.js";

export const meta = { path: "innstillinger", title: { no: "Innstillinger", en: "Settings" } };

const DIR = {
  "one-way-out": { no: "Én vei ut: Selvrens sender tall, tar ikke imot noe", en: "One way out: Selvrens sends counts, accepts nothing" },
  "two-way": { no: "Toveis: svarer på spørsmål og kan få tilbud om kontoer (du godkjenner)", en: "Two-way: answers requests and may be offered accounts (you approve)" },
  "pass-through": { no: "Gjennomstrømning: data passerer videre (reservert for senere)", en: "Pass-through: data travels on (reserved for later)" },
};
const FLOW = { summary: { no: "Oppsummering (bare tall)", en: "Summary (counts only)" }, events: { no: "Hendelser (navn og antall)", en: "Events (names and counts)" }, health: { no: "Helse", en: "Health" } };
const pick2 = (o) => (getLang() === "en" ? o.en : o.no);

let root, unsub = [], pendingImport = null;

export function render(el) {
  root = el;
  unsub.forEach((u) => u()); unsub = [];
  const s = getState();
  el.innerHTML = `<div class="wrap">
    <div class="section-head"><div>
      <p class="eyebrow">${tr("Innstillinger", "Settings")}</p>
      <h1>${tr("Dine data, og hvordan Selvrens kobler seg til", "Your data, and how Selvrens connects")}</h1>
    </div></div>

    <section class="grid-2">
      <div class="panel">
        <h2>${tr("Ta med deg dataene", "Take your data with you")}</h2>
        <p class="small muted">${tr("Alt ligger i denne nettleseren. Lagre en kopi, gjerne låst med en passordfrase, for å flytte til en annen maskin.", "Everything lives in this browser. Save a copy, ideally locked with a passphrase, to move to another device.")}</p>
        <label class="field">${tr("Passordfrase (valgfritt, men anbefalt)", "Passphrase (optional, recommended)")}<input type="password" id="pass" autocomplete="new-password"></label>
        <div class="row"><button class="btn" data-act="export">${tr("Last ned kopi", "Download copy")}</button></div>
        <hr style="border:0;border-top:1px solid var(--line);width:100%">
        <label class="field">${tr("Hent inn en kopi", "Load a copy")}<input type="file" id="imp" accept=".json,application/json"></label>
        <div id="imp-pass" hidden class="stack"><label class="field">${tr("Kopien er låst. Passordfrase:", "The copy is locked. Passphrase:")}<input type="password" id="imp-pw"></label><button class="btn sm" data-act="unlock">${tr("Lås opp og hent inn", "Unlock and load")}</button></div>
        <p class="small muted" id="imp-status" role="status"></p>
      </div>
      <div class="panel">
        <h2>${tr("Språk og tema", "Language and theme")}</h2>
        <div class="row"><button class="btn ${getLang() === "no" ? "" : "quiet"} sm" data-lang="no">Norsk</button><button class="btn ${getLang() === "en" ? "" : "quiet"} sm" data-lang="en">English</button></div>
        <div class="row"><button class="btn quiet sm" data-theme-set="">${tr("Følg systemet", "Follow system")}</button><button class="btn quiet sm" data-theme-set="light">${tr("Lyst", "Light")}</button><button class="btn quiet sm" data-theme-set="dark">${tr("Mørkt", "Dark")}</button></div>
        <hr style="border:0;border-top:1px solid var(--line);width:100%">
        <h3>${tr("Slett alt", "Erase everything")}</h3>
        <p class="small muted">${tr("Fjerner alle kontoer, sjekker og innstillinger fra denne nettleseren. Kan ikke angres.", "Removes all accounts, checks and settings from this browser. Cannot be undone.")}</p>
        <div class="row"><button class="btn quiet sm" data-act="wipe">${tr("Slett alt", "Erase everything")}</button><button class="btn danger sm" data-act="wipe-yes" hidden>${tr("Ja, slett alt nå", "Yes, erase it all now")}</button></div>
      </div>
    </section>

    <section class="section" id="sol">
      <div class="section-head"><div>
        <p class="eyebrow">${tr("SOL-brikke", "SOL piece")} · ${esc(PIECE.spec)}</p>
        <h2>${tr("Den elektriske kanten", "The electrified border")}</h2>
        <p class="lede">${tr("Selvrens er bygget som en puslespillbrikke. Den står helt alene, men kan senere sveve inn i SOL og knyttes til andre brikker med elastiske bånd. Et bånd brytes bare med vilje, og kan løftes ut for reparasjon uten å ryke.", "Selvrens is built as a puzzle piece. It stands fully on its own, but can later float into SOL and bond with other pieces through elastic bonds. A bond only breaks on purpose, and can be lifted out for repair without snapping.")}</p>
      </div></div>
      <div class="grid-2">
        <div class="panel">
          <div class="row between"><h3>${tr("Bånd", "Bonds")}</h3>
            <label class="check"><input type="checkbox" id="lift" ${s.settings.lifted ? "checked" : ""}> ${tr("Løft alle for reparasjon", "Lift all for repair")}</label></div>
          <div id="bonds" class="stack"></div>
          <details class="fold"><summary>${tr("Nytt bånd (admin)", "New bond (admin)")}</summary><div class="fold-body">
            <label class="field">${tr("Opprinnelse (https://…)", "Origin (https://…)")}<input type="url" id="b-origin" placeholder="https://opensol.earth"></label>
            <label class="field">${tr("Retning", "Direction")}<select id="b-dir">${Object.entries(DIR).map(([k, v]) => `<option value="${k}">${esc(pick2(v))}</option>`).join("")}</select></label>
            <div class="stack small">${Object.entries(FLOW).map(([k, v]) => `<label class="check"><input type="checkbox" data-flow="${k}" ${k === "summary" ? "checked" : ""}> ${esc(pick2(v))}</label>`).join("")}</div>
            <button class="btn sm" data-act="bond">${tr("Knytt bånd", "Create bond")}</button>
            <p class="small muted">${tr("Bånd virker når Selvrens åpnes inne i, eller fra, den andre brikken. Meldinger går bare til nøyaktig den adressen.", "Bonds work when Selvrens is opened inside, or from, the other piece. Messages go only to that exact address.")}</p>
          </div></details>
          <div id="offers"></div>
        </div>
        <div class="panel">
          <h3>${tr("Helse", "Health")}</h3>
          <div id="health" class="stack small"></div>
          <details class="fold"><summary>${tr("Det som kan sendes ut", "What may be sent out")}</summary><div class="fold-body"><pre class="small" style="white-space:pre-wrap;margin:0" id="sum"></pre>
          <p class="small muted">${tr("Bare tall. Aldri navn, innlogginger eller domener.", "Counts only. Never names, logins or domains.")} <a href="/sol.piece.json" target="_blank" rel="noopener">sol.piece.json</a></p></div></details>
        </div>
      </div>
    </section>

    <section class="panel sunk">
      <h2>${tr("Om Selvrens", "About Selvrens")}</h2>
      <div class="prose small">
        <p>${tr("Selvrens kartlegger ditt digitale jeg: kontoene du har, hvor dataene dine har lekket, og hva du viser offentlig. Så hjelper den deg å rydde. Den startet som et konsept i 2025 og er nå bygget på nytt som et frittstående verktøy.", "Selvrens maps your digital self: the accounts you have, where your data has leaked, and what you show in public. Then it helps you clean up. It began as a concept in 2025 and has now been rebuilt as a standalone tool.")}</p>
        <p>${tr("Hva som forlater nettleseren, og når: de 5 første tegnene av en passord-hash (passordsjekk), e-postadressen din (bare når du selv kjører en e-postsjekk), og en forespørsel om den offentlige listen over datainnbrudd. Ingenting annet.", "What leaves the browser, and when: the first 5 characters of a password hash (password check), your email address (only when you run an email check yourself), and a request for the public list of breaches. Nothing else.")}</p>
        <p>${tr("Lekkasjedata fra", "Breach data from")} <a href="https://haveibeenpwned.com/" target="_blank" rel="noopener">Have I Been Pwned</a> (CC BY 4.0) ${tr("og", "and")} <a href="https://xposedornot.com/" target="_blank" rel="noopener">XposedOrNot</a>. ${tr("Kildekoden", "Source code")}: <a href="https://github.com/Artum-founder/Selvrens" target="_blank" rel="noopener">github.com/Artum-founder/Selvrens</a>.</p>
      </div>
    </section>
  </div>`;
  bind();
  renderSol();
  unsub.push(on("state.changed", () => { if (document.getElementById("bonds")) renderSol(); }));
  unsub.push(on("sol.offers", () => { if (document.getElementById("offers")) renderSol(); }));
}

function renderSol() {
  const s = getState();
  const bonds = s.settings.bonds || [];
  document.getElementById("lift").checked = !!s.settings.lifted;
  document.getElementById("bonds").innerHTML = bonds.length ? bonds.map((b) => `<div class="panel sunk" data-bond="${esc(b.id)}">
      <div class="row between"><b style="overflow-wrap:anywhere">${esc(b.origin)}</b><span class="tag ${b.state === "bonded" && !s.settings.lifted ? "ok" : "warn"}">${b.state === "bonded" ? (s.settings.lifted ? tr("løftet", "lifted") : tr("knyttet", "bonded")) : tr("løftet for reparasjon", "lifted for repair")}</span></div>
      <p class="small">${esc(pick2(DIR[b.direction] || DIR["one-way-out"]))}</p>
      <p class="small muted">${tr("Flyt", "Flow")}: ${esc((b.flows || []).map((f) => pick2(FLOW[f] || { no: f, en: f })).join(", "))} · ${esc(fmtDate(b.createdAt))}</p>
      <div class="row"><button class="btn quiet sm" data-bstate="${b.state === "bonded" ? "lifted" : "bonded"}">${b.state === "bonded" ? tr("Løft for reparasjon", "Lift for repair") : tr("Sett tilbake", "Put back")}</button>
      <button class="btn quiet sm" data-act="cut">${tr("Kutt bånd", "Cut bond")}</button></div>
      <div class="row" data-cutbox hidden><label class="field">${tr("Skriv KUTT for å bekrefte", "Type CUT to confirm")}<input type="text" data-cutword></label><button class="btn danger sm" data-act="cut-yes">${tr("Kutt", "Cut")}</button></div>
    </div>`).join("") : `<p class="small muted">${tr("Ingen bånd. Selvrens står alene, og ingenting forlater den gjennom kanten.", "No bonds. Selvrens stands alone, and nothing leaves through its border.")}</p>`;
  const h = health();
  document.getElementById("health").innerHTML = h.checks.map((c) => `<div class="row"><span class="tag ${c.ok ? "ok" : "warn"}">${c.ok ? "ok" : "!"}</span><span><b>${esc(c.id)}</b> · ${esc(c.detail)}</span></div>`).join("");
  document.getElementById("sum").textContent = JSON.stringify(summary(), null, 2);
  document.getElementById("offers").innerHTML = offers.map((o, i) => `<div class="note warn"><p>${esc(tr(`${o.from} vil legge til ${o.accounts.length} kontoer.`, `${o.from} wants to add ${o.accounts.length} accounts.`))}</p>
    <div class="row"><button class="btn sm" data-offer-yes="${i}">${tr("Godta", "Accept")}</button><button class="btn quiet sm" data-offer-no="${i}">${tr("Avvis", "Decline")}</button></div></div>`).join("");
}

function bind() {
  root.onclick = async (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    const bondEl = t.closest("[data-bond]");
    if (t.dataset.lang) return setLang(t.dataset.lang);
    if (t.dataset.themeSet != null) return setTheme(t.dataset.themeSet || null);
    if (t.dataset.act === "export") {
      const pass = document.getElementById("pass").value;
      const text = await exportState(getState(), pass);
      download(`selvrens-${new Date().toISOString().slice(0, 10)}${pass ? "-locked" : ""}.json`, text);
      document.getElementById("pass").value = "";
      return toast(pass ? tr("Låst kopi lastet ned.", "Locked copy downloaded.") : tr("Kopi lastet ned. Den er ikke låst.", "Copy downloaded. It is not locked."));
    }
    if (t.dataset.act === "unlock") return doImport(document.getElementById("imp-pw").value);
    if (t.dataset.act === "wipe") { t.hidden = true; t.nextElementSibling.hidden = false; return; }
    if (t.dataset.act === "wipe-yes") { wipe(); return toast(tr("Alt er slettet fra denne nettleseren.", "Everything is erased from this browser.")); }
    if (t.dataset.act === "bond") {
      const origin = document.getElementById("b-origin").value.trim();
      const dir = document.getElementById("b-dir").value;
      const flows = [...root.querySelectorAll("[data-flow]:checked")].map((x) => x.dataset.flow);
      try { addBond(origin, dir, flows); toast(tr("Bånd knyttet.", "Bond created.")); }
      catch (err) { toast(err.message === "https" ? tr("Bånd krever https.", "Bonds need https.") : tr("Ugyldig adresse.", "Invalid address.")); }
      return;
    }
    if (t.dataset.bstate && bondEl) return setBondState(bondEl.dataset.bond, t.dataset.bstate);
    if (t.dataset.act === "cut" && bondEl) { bondEl.querySelector("[data-cutbox]").hidden = false; return; }
    if (t.dataset.act === "cut-yes" && bondEl) {
      const w = bondEl.querySelector("[data-cutword]").value.trim().toUpperCase();
      if (w !== "KUTT" && w !== "CUT") return toast(tr("Skriv KUTT for å bekrefte.", "Type CUT to confirm."));
      cutBond(bondEl.dataset.bond);
      return toast(tr("Båndet er kuttet.", "The bond is cut."));
    }
    if (t.dataset.offerYes != null) { const r = acceptOffer(+t.dataset.offerYes); return toast(tr(`La til ${r.added} kontoer.`, `Added ${r.added} accounts.`)); }
    if (t.dataset.offerNo != null) return declineOffer(+t.dataset.offerNo);
  };
  root.onchange = async (e) => {
    const t = e.target;
    if (t.id === "lift") return liftAll(t.checked);
    if (t.id === "imp" && t.files[0]) {
      pendingImport = await t.files[0].text();
      t.value = "";
      if (isLocked(pendingImport)) { document.getElementById("imp-pass").hidden = false; return; }
      return doImport("");
    }
  };
}

async function doImport(pass) {
  const st = document.getElementById("imp-status");
  try {
    const next = await importState(pendingImport, pass);
    replaceState(next);
    pendingImport = null;
    toast(tr("Kopien er hentet inn.", "The copy is loaded."));
  } catch {
    if (st) st.textContent = tr("Kunne ikke hente inn. Feil passordfrase eller ikke en Selvrens-fil.", "Couldn't load it. Wrong passphrase, or not a Selvrens file.");
  }
}
