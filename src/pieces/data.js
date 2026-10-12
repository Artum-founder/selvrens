// Piece: Dine data (Your data). Get a copy of what the big services hold about you.
import { getState, update } from "../core/store.js";
import { tr, esc, pick, howto, toast } from "../core/util.js";
import { DOWNLOADS } from "../data/download.js";

export const meta = { path: "data", title: { no: "Dine data", en: "Your data" } };

let root;

export function render(el) {
  root = el;
  el.innerHTML = `<div class="wrap">
    <div class="section-head"><div>
      <p class="eyebrow">${tr("Brikke 4 · Dine data", "Piece 4 · Your data")}</p>
      <h1>${tr("Se hva de har lagret om deg", "See what they have stored about you")}</h1>
      <p class="lede">${tr("Alle store tjenester må gi deg en kopi av dataene dine, gratis. Filene viser ofte mer enn du tror: gamle kontoer, enheter, reklameprofilen din og andre nettsteder som har delt data om deg.", "Every big service must give you a copy of your data, for free. The files often show more than you expect: old accounts, devices, your ad profile, and other sites that shared data about you.")}</p>
    </div></div>
    ${howto([
      { no: "Velg en tjeneste under og trykk «Be om dataene».", en: "Pick a service below and press «Request the data»." },
      { no: "Vent på e-posten. Det tar fra minutter til noen dager.", en: "Wait for the email. It takes from minutes to a few days." },
      { no: "Last ned filen, kryss av her, og se etter kontoer og apper du har glemt.", en: "Download the file, tick it here, and look for accounts and apps you had forgotten." },
    ], { no: "Tjenester som ikke er på listen må også svare. Send brevmalen «Hva har dere om meg? (GDPR art. 15)» under Rens.", en: "Services not on the list must also reply. Send the «What do you hold on me? (GDPR art. 15)» letter under Clean up." })}
    <div id="dl" class="stack" style="gap:28px"></div>
    <section class="panel sunk">
      <h3>${tr("Hva du ser etter i filene", "What to look for in the files")}</h3>
      <ul class="prose small">
        <li>${tr("Lister over apper og nettsteder du har logget inn på. Legg dem til under Kontoer.", "Lists of apps and sites you signed in to. Add them under Accounts.")}</li>
        <li>${tr("Reklameinteresser: hva de tror de vet om deg.", "Ad interests: what they think they know about you.")}</li>
        <li>${tr("Aktivitet utenfor tjenesten: butikker og apper som har sendt data om deg.", "Activity off the service: shops and apps that sent data about you.")}</li>
        <li>${tr("Enheter og steder: hvor og når du har vært logget inn.", "Devices and places: where and when you were signed in.")}</li>
      </ul>
      <p class="small muted">${tr("Filene kan være store og inneholde mye privat. Lagre dem et trygt sted, og slett dem når du er ferdig.", "The files can be large and very private. Keep them somewhere safe, and delete them when you are done.")}</p>
    </section>
  </div>`;
  renderList();
  bind();
}

const BIG = ["google", "meta", "apple", "microsoft"];

function card(d, done) {
  return `<div class="piece">
    <div class="row between"><h3>${esc(d.name)}</h3>${done.has(d.id) ? `<span class="tag ok">${tr("hentet", "received")}</span>` : ""}</div>
    <p class="small">${esc(pick(d))}</p>
    <p class="small muted">${tr("Tar", "Takes")} ${esc(pick(d.wait))}</p>
    <div class="row">${d.url ? `<a class="btn sm" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">${tr("Be om dataene", "Request the data")} ↗</a>` : ""}
    <label class="check small"><input type="checkbox" data-dl="${d.id}" ${done.has(d.id) ? "checked" : ""}> ${tr("Hentet", "Received")}</label></div>
  </div>`;
}

function renderList() {
  const done = new Set(getState().done.download || []);
  const n = DOWNLOADS.filter((d) => done.has(d.id)).length;
  const big = DOWNLOADS.filter((d) => BIG.includes(d.id)), rest = DOWNLOADS.filter((d) => !BIG.includes(d.id));
  document.getElementById("dl").innerHTML = `<div class="section">
    <div class="section-head"><div><h2>${tr("Start med de fire store", "Start with the big four")}</h2>
    <p class="small muted">${tr(`De vet mest om de fleste. ${n} av ${DOWNLOADS.length} hentet totalt.`, `They know the most about most people. ${n} of ${DOWNLOADS.length} received in total.`)}</p></div></div>
    <div class="grid-4">${big.map((d) => card(d, done)).join("")}</div>
  </div>
  <div class="section">
    <h2>${tr("Andre tjenester", "Other services")}</h2>
    <div class="grid-3 parts">${rest.map((d) => card(d, done)).join("")}</div>
  </div>`;
}

function bind() {
  root.onchange = (e) => {
    const t = e.target;
    if (!t.dataset.dl) return;
    update((s) => { const d = new Set(s.done.download || []); t.checked ? d.add(t.dataset.dl) : d.delete(t.dataset.dl); s.done.download = [...d]; }, "data.download", { count: 1 });
    renderList();
    toast(t.checked ? tr("Krysset av.", "Ticked.") : tr("Fjernet avkrysning.", "Unticked."));
  };
}
