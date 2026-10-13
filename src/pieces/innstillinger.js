// Page: Innstillinger (Settings). Your data, language and theme.
import { getState, replaceState, wipe, setLang, setTheme, getLang, setComfort } from "../core/store.js";
import { on } from "../core/bus.js";
import { tr, esc, toast, download, fmtDate } from "../core/util.js";
import { exportState, importState, isLocked } from "../core/vault.js";

export const meta = { path: "innstillinger", title: { no: "Innstillinger", en: "Settings" } };

let root, unsub = [], pendingImport = null;

export function render(el) {
  root = el;
  unsub.forEach((u) => u()); unsub = [];
  const s = getState();
  el.innerHTML = `<div class="wrap">
    <div class="section-head"><div>
      <p class="eyebrow">${tr("Innstillinger", "Settings")}</p>
      <h1>${tr("Dine data, språk og visning", "Your data, language and display")}</h1>
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

    <section class="panel" aria-labelledby="comfort-h">
      <h2 id="comfort-h">${tr("Ro og lesbarhet", "Calm and readability")}</h2>
      <p class="small muted">${tr("Velg det som gjør det lettere for deg. Valgene gjelder hele Selvrens og lagres bare i denne nettleseren.", "Pick what makes it easier for you. The choices apply to all of Selvrens and are saved only in this browser.")}</p>
      <div class="comfort">
        ${[
          ["calm", tr("Rolig visning", "Calm display"), tr("Ingen bevegelse eller glød. Alt står stille.", "No movement or glow. Everything stays still.")],
          ["bigText", tr("Større tekst", "Larger text"), tr("All tekst blir omtrent en femtedel større.", "All text gets about a fifth larger.")],
          ["airy", tr("Mer luft", "More space"), tr("Mer avstand mellom linjer, ord og bokstaver.", "More space between lines, words and letters.")],
        ].map(([k, l, d]) => `<label class="check comfort-opt"><input type="checkbox" data-comfort="${k}" ${s.settings[k] ? "checked" : ""}><span><b>${l}</b><span class="small muted">${d}</span></span></label>`).join("")}
      </div>
    </section>

    <section class="panel sunk">
      <h2>${tr("Om Selvrens", "About Selvrens")}</h2>
      <div class="prose small">
        <p>${tr("Selvrens kartlegger ditt digitale jeg: kontoene du har, hvor dataene dine har lekket, og hva du viser offentlig. Så hjelper den deg å rydde. Den startet som et konsept i 2025 og er nå bygget på nytt som et frittstående verktøy.", "Selvrens maps your digital self: the accounts you have, where your data has leaked, and what you show in public. Then it helps you clean up. It began as a concept in 2025 and has now been rebuilt as a standalone tool.")}</p>
        <p>${tr("Hva som forlater nettleseren, og når: de 5 første tegnene av en passord-hash (passordsjekk), e-postadressen din (bare når du selv kjører en e-postsjekk), og en forespørsel om den offentlige listen over datainnbrudd. Ingenting annet.", "What leaves the browser, and when: the first 5 characters of a password hash (password check), your email address (only when you run an email check yourself), and a request for the public list of breaches. Nothing else.")}</p>
        <p>${tr("Lekkasjedata fra", "Breach data from")} <a href="https://haveibeenpwned.com/" target="_blank" rel="noopener">Have I Been Pwned</a> (CC BY 4.0) ${tr("og", "and")} <a href="https://xposedornot.com/" target="_blank" rel="noopener">XposedOrNot</a>. ${tr("Kildekoden", "Source code")}: <a href="https://github.com/Artum-founder/selvrens" target="_blank" rel="noopener">github.com/Artum-founder/selvrens</a> (${tr("lisens", "license")}: <a href="https://github.com/Artum-founder/selvrens/blob/main/LICENSE" target="_blank" rel="noopener">AGPL-3.0</a>).</p>
      </div>
    </section>
  </div>`;
  bind();
}

function bind() {
  root.onclick = async (e) => {
    const t = e.target.closest("button");
    if (!t) return;
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
  };
  root.onchange = async (e) => {
    const t = e.target;
    if (t.dataset.comfort) return setComfort(t.dataset.comfort, t.checked);
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
