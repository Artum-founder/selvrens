// Piece: Synlighet (Public self). What you show of yourself, across every account.
import { getState, update, patchAccount, addAccounts, VIS_FIELDS } from "../core/store.js";
import { on } from "../core/bus.js";
import { tr, esc, pick, uid, toast, howto } from "../core/util.js";
import { analyse, accountExposure, VIS_LABEL } from "../core/analysis.js";
import { nameSearches, valueSearches, PROFILE_SITES } from "../data/finders.js";
import { lookup } from "../data/services.js";

export const meta = { path: "synlighet", title: { no: "Synlighet", en: "Visibility" } };

let root, unsub = [], showAll = false, focusId = null;
const split = (s) => String(s || "").split(/[,\n]+/).map((x) => x.trim()).filter(Boolean);

export function render(el, params) {
  root = el;
  unsub.forEach((u) => u()); unsub = [];
  focusId = params[0] || null;
  const p = getState().profile;
  el.innerHTML = `<div class="wrap">
    <div class="section-head"><div>
      <p class="eyebrow">${tr("Del 3 · Synlighet", "Part 3 · Visibility")}</p>
      <h1>${tr("Hva kan en fremmed sette sammen om deg?", "What can a stranger piece together about you?")}</h1>
      <p class="lede">${tr("Hver konto viser litt. Til sammen kan det bli et helt bilde. Her ser du begge deler.", "Each account shows a little. Together it can add up to a whole picture. Here you see both.")}</p>
    </div></div>
    ${howto([
      { no: "Skriv navnet og brukernavnene dine i feltene under.", en: "Type your name and usernames in the fields below." },
      { no: "Åpne søkene og se hva som dukker opp om deg.", en: "Open the searches and see what comes up about you." },
      { no: "For hver konto: åpne profilen din utlogget, og kryss av det en fremmed kan se.", en: "For each account: open your profile logged out, and tick what a stranger can see." },
    ])}
    <div id="combined"></div>
    <section class="section">
      <div class="section-head"><div><h2>${tr("Søk etter deg selv", "Search for yourself")}</h2>
      <p class="small muted">${tr("Lenkene åpnes i en ny fane. Selvrens henter ingenting selv. Opplysningene du skriver her blir i nettleseren.", "Links open in a new tab. Selvrens fetches nothing itself. What you type here stays in your browser.")}</p></div></div>
      <div class="panel"><div class="form-grid">
        <label class="field">${tr("Navn du er kjent under", "Names you go by")}<input type="text" data-prof="names" value="${esc(p.names)}" placeholder="${tr("Ola Nordmann, Ola N.", "Jane Doe, J. Doe")}"></label>
        <label class="field">${tr("Brukernavn", "Usernames")}<input type="text" data-prof="usernames" value="${esc(p.usernames)}" placeholder="olanordmann, ola.n"></label>
        <label class="field">${tr("E-postadresser", "Email addresses")}<input type="text" data-prof="emails" value="${esc(p.emails)}"></label>
        <label class="field">${tr("Telefonnumre", "Phone numbers")}<input type="text" data-prof="phones" value="${esc(p.phones)}"></label>
      </div></div>
      <div id="searches" class="stack"></div>
    </section>
    <section class="section">
      <div class="section-head"><div><h2>${tr("Konto for konto", "Account by account")}</h2>
      <p class="small muted">${tr("Åpne profilen din som en utlogget besøkende, og kryss av det som synes.", "Open your profile as a logged-out visitor, and tick what shows.")}</p></div>
      <label class="check"><input type="checkbox" id="showall" ${showAll ? "checked" : ""}> ${tr("Vis alle kontoer, ikke bare sosiale medier", "Show all accounts, not only social media")}</label></div>
      <div id="vislist" class="list"></div>
    </section>
  </div>`;
  bind();
  renderCombined(); renderSearches(); renderVis();
  unsub.push(on("state.changed", () => { if (document.getElementById("vislist")) { renderCombined(); renderVis(); } }));
  if (focusId) setTimeout(() => document.getElementById(`v-${focusId}`)?.scrollIntoView({ block: "center" }), 50);
}

function renderCombined() {
  const box = document.getElementById("combined");
  if (!box) return;
  const an = analyse();
  const shown = VIS_FIELDS.filter((f) => an.visibleOn[f].length);
  const checked = an.accts.filter((a) => a.visChecked).length;
  box.innerHTML = `<div class="panel">
    <div class="row between"><h2>${tr("Det samlede bildet", "The combined picture")}</h2><span class="num" style="font-size:1.6rem">${an.combined}<span class="small muted">/100</span></span></div>
    <div class="meter" aria-hidden="true"><i style="width:${an.combined}%;background-position:${an.combined}% 0"></i></div>
    ${checked ? (shown.length
      ? `<p>${tr("Ut fra kontoene du har sjekket, kan en fremmed finne:", "From the accounts you have checked, a stranger can find:")}</p>
         <div class="links">${shown.map((f) => `<span class="tag ${["phone", "birthday", "location", "email"].includes(f) ? "warn" : ""}" title="${esc(an.visibleOn[f].map((a) => a.service || a.domain).join(", "))}">${esc(pick(VIS_LABEL[f]))} · ${an.visibleOn[f].length}</span>`).join("")}</div>`
      : `<p class="note">${tr("Ingen av kontoene du har sjekket viser noe offentlig. Godt jobbet.", "None of the accounts you've checked show anything in public. Well done.")}</p>`)
      : `<p class="muted">${tr("Kryss av for hver konto under, så bygges bildet her.", "Tick each account below and the picture builds up here.")}</p>`}
    <p class="small muted">${tr(`${checked} av ${an.accts.filter((a) => a.status !== "deleted").length} kontoer sjekket.`, `${checked} of ${an.accts.filter((a) => a.status !== "deleted").length} accounts checked.`)}</p>
  </div>`;
}

function renderSearches() {
  const box = document.getElementById("searches");
  if (!box) return;
  const p = getState().profile;
  const names = split(p.names), users = split(p.usernames), emails = split(p.emails), phones = split(p.phones);
  if (!names.length && !users.length && !emails.length && !phones.length) { box.innerHTML = ""; return; }
  const groups = { web: tr("Søkemotorer", "Search engines"), no: tr("Norske kataloger", "Norwegian directories"), social: tr("Sosiale medier", "Social media"), docs: tr("Dokumenter", "Documents") };
  const have = new Set(getState().accounts.map((a) => a.domain));
  box.innerHTML = [
    ...names.map((n) => {
      const s = nameSearches(n);
      return `<details class="fold" open><summary>${esc(n)}</summary><div class="fold-body">${Object.entries(groups).map(([g, label]) => `<div class="stack"><span class="small muted">${esc(label)}</span><div class="links">${s.filter((x) => x.g === g).map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.label)}</a>`).join("")}</div></div>`).join("")}</div></details>`;
    }),
    ...users.map((u) => `<details class="fold"><summary>@${esc(u)}</summary><div class="fold-body">
      <p class="small muted">${tr("Åpne hver lenke. Er profilen din, trykk «Min».", "Open each link. If the profile is yours, press «Mine».")}</p>
      <div class="list">${PROFILE_SITES.map(([name, dom, fn]) => `<div class="row between" style="border-bottom:1px solid var(--line);padding-bottom:6px">
        <a href="${esc(fn(encodeURIComponent(u)))}" target="_blank" rel="noopener noreferrer">${esc(name)}</a>
        ${dom === "web.archive.org" ? `<span class="small muted">${tr("gamle utgaver", "old versions")}</span>` : have.has(dom) ? `<span class="tag ok">${tr("i listen", "in list")}</span>` : `<button class="btn quiet sm" data-mine="${esc(dom)}" data-user="${esc(u)}">${tr("Min", "Mine")}</button>`}
      </div>`).join("")}</div></div></details>`),
    ...[...emails, ...phones].map((v) => `<details class="fold"><summary>${esc(v)}</summary><div class="fold-body"><div class="links">${valueSearches(v).map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.label)}</a>`).join("")}</div></div></details>`),
  ].join("");
}

function renderVis() {
  const box = document.getElementById("vislist");
  if (!box) return;
  const accts = getState().accounts.filter((a) => a.status !== "deleted" && (showAll || a.category === "social" || a.category === "media" || a.visChecked || a.id === focusId));
  if (!accts.length) { box.innerHTML = `<div class="empty">${tr("Ingen kontoer i sosiale medier ennå. Legg dem til under Kontoer, eller trykk «Min» i søket over.", "No social media accounts yet. Add them under Accounts, or press «Mine» in the search above.")}</div>`; return; }
  accts.sort((x, y) => (y.visChecked - x.visChecked) || accountExposure(y) - accountExposure(x));
  box.innerHTML = accts.map((a) => {
    const exp = accountExposure(a);
    return `<details class="acct" id="v-${esc(a.id)}" data-id="${esc(a.id)}" ${a.id === focusId ? "open" : ""}>
      <summary><div class="acct-name"><b>${esc(a.service || a.domain)}</b><span>${esc(a.login || a.domain)}</span></div>
      <div class="acct-badges">${a.visChecked ? `<span class="tag ${exp > 40 ? "danger" : exp > 15 ? "warn" : "ok"}">${exp}%</span>` : `<span class="tag">${tr("ikke sjekket", "not checked")}</span>`}</div></summary>
      <div class="acct-body">
        <div class="vis">${VIS_FIELDS.map((f) => `<label class="check"><input type="checkbox" data-vis="${f}" ${a.vis[f] ? "checked" : ""}> ${esc(pick(VIS_LABEL[f]))}</label>`).join("")}</div>
        <div class="row"><button class="btn quiet sm" data-none="1">${tr("Ingenting av dette synes", "None of this shows")}</button>
        ${a.url || a.domain ? `<a class="btn quiet sm" href="${esc(a.url && /^https?:/.test(a.url) ? a.url : "https://" + a.domain)}" target="_blank" rel="noopener noreferrer">${tr("Åpne tjenesten", "Open the service")}</a>` : ""}</div>
      </div></details>`;
  }).join("");
}

function bind() {
  root.onchange = (e) => {
    const t = e.target;
    if (t.dataset.prof) { const k = t.dataset.prof; update((s) => (s.profile[k] = t.value.slice(0, 500))); renderSearches(); return; }
    if (t.id === "showall") { showAll = t.checked; return renderVis(); }
    if (t.dataset.vis) {
      const id = t.closest("[data-id]").dataset.id;
      const a = getState().accounts.find((x) => x.id === id);
      focusId = id;
      patchAccount(id, { vis: { ...a.vis, [t.dataset.vis]: t.checked }, visChecked: true });
    }
  };
  root.oninput = null;
  root.onclick = (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.none) {
      const id = t.closest("[data-id]").dataset.id;
      const vis = Object.fromEntries(VIS_FIELDS.map((f) => [f, false]));
      focusId = id;
      patchAccount(id, { vis, visChecked: true });
      return;
    }
    if (t.dataset.mine) {
      const svc = lookup(t.dataset.mine);
      addAccounts([{ id: uid(), domain: t.dataset.mine, login: t.dataset.user, service: svc.name, category: svc.category }], "search");
      toast(tr(`${svc.name} lagt til i kontoene dine.`, `${svc.name} added to your accounts.`));
      renderSearches();
    }
  };
}
