// Piece: Kart (Map). The combined picture of your digital self, and what to do first.
import { getState } from "../core/store.js";
import { on } from "../core/bus.js";
import { tr, esc, pick, fmtNum } from "../core/util.js";
import { analyse, actions, accountExposure } from "../core/analysis.js";
import { dangerous, cachedCatalogue, loadCatalogue } from "../core/leaks.js";
import { CATEGORIES } from "../data/services.js";

export const meta = { path: "", title: { no: "Kart", en: "Map" } };

const PIECES = [
  { n: 1, path: "kontoer", t: { no: "Kontoer", en: "Accounts" }, d: { no: "Alle stedene du har en innlogging: fra passordbehandleren, innboksen og «logg inn med».", en: "Every place you have a login: from your password manager, your inbox and «sign in with»." } },
  { n: 2, path: "lekkasjer", t: { no: "Lekkasjer", en: "Leaks" }, d: { no: "Hvilke av tjenestene dine som er hacket, om e-posten din er lekket, og om passordene dine er kjent.", en: "Which of your services were breached, whether your email leaked, and whether your passwords are known." } },
  { n: 3, path: "synlighet", t: { no: "Synlighet", en: "Visibility" }, d: { no: "Det du viser offentlig, konto for konto, og bildet det blir når alt legges sammen.", en: "What you show in public, account by account, and the picture it makes all together." } },
  { n: 4, path: "", t: { no: "Kart", en: "Map" }, d: { no: "Hele ditt digitale jeg på én side, med det viktigste å gjøre først.", en: "Your whole digital self on one page, with the most important thing to do first." } },
  { n: 5, path: "rens", t: { no: "Rens", en: "Clean up" }, d: { no: "Guider, ferdige GDPR-brev og lenkene som skrur av sporing.", en: "Guides, ready GDPR letters and the links that switch off tracking." } },
];

let unsub = [];

export function render(el) {
  unsub.forEach((u) => u()); unsub = [];
  const draw = () => {
    const an = analyse();
    el.innerHTML = an.accts.length ? full(an) : intro();
  };
  draw();
  if (getState().accounts.length && !cachedCatalogue()) loadCatalogue().then(() => { if (el.isConnected && location.hash.replace(/^#\/?/, "") === "") draw(); }).catch(() => {});
  el.onclick = (e) => { const d = e.target.closest("[data-href]"); if (d) location.hash = d.dataset.href; };
  el.onkeydown = (e) => { if (e.key !== "Enter") return; const d = e.target.closest("[data-href]"); if (d) location.hash = d.dataset.href; };
  el.onchange = null; el.oninput = null; el.onsubmit = null;
  unsub.push(on("state.changed", () => { if (location.hash.replace(/^#\/?/, "") === "" && el.isConnected) draw(); }));
}

function pieceCards(skipMap) {
  return `<div class="grid-3">${PIECES.filter((p) => !(skipMap && p.n === 4)).map((p) => `<a class="piece" href="#/${p.path}">
    <span class="piece-n">${tr("brikke", "piece")} ${p.n}</span><h3>${esc(pick(p.t))}</h3><p class="small muted">${esc(pick(p.d))}</p></a>`).join("")}</div>`;
}

function intro() {
  return `<div class="wrap">
    <section class="hero">
      <p class="eyebrow">Selvrens</p>
      <h1>${tr("Se hele ditt digitale jeg.", "See your whole digital self.")}</h1>
      <p class="lede">${tr("Hvor har du kontoer? Hvor har dataene dine lekket? Hva viser du av deg selv, og hva blir bildet når alt legges sammen? Selvrens finner det ut sammen med deg, og hjelper deg å rydde.", "Where do you have accounts? Where has your data leaked? What do you show of yourself, and what picture does it make all together? Selvrens works it out with you, and helps you clean up.")}</p>
      <div class="promise"><span class="tag accent">${tr("Ingen konto", "No account")}</span><span class="tag accent">${tr("Lagres bare hos deg", "Stored only with you")}</span><span class="tag accent">${tr("Ingen sporing", "No tracking")}</span><span class="tag accent">${tr("Gratis og åpen kildekode", "Free and open source")}</span></div>
      <div class="row"><a class="btn" href="#/kontoer">${tr("Start med kontoene dine", "Start with your accounts")}</a><a class="btn ghost" href="#/lekkasjer">${tr("Eller sjekk en e-post", "Or check an email")}</a></div>
    </section>
    ${pieceCards(true)}
    <section class="panel sunk">
      <p class="quote">${tr("«Selvrens er ikke en app. Det er en frigjøringsmekanisme.»", "«Selvrens is not an app. It is a liberation mechanism.»")}</p>
      <div class="prose small muted">
        <p>${tr("Du skal ikke betale for å forsvinne. Du skal få velge hvordan du vises, og når du ikke vil det lenger.", "You shouldn't have to pay to disappear. You should get to choose how you appear, and when you no longer want to.")}</p>
        <p>${tr("Alt du legger inn blir i denne nettleseren. Du kan ta det med deg som en (låst) fil, og slette alt med ett trykk under Innstillinger.", "Everything you enter stays in this browser. You can take it with you as a (locked) file, and erase it all with one click under Settings.")}</p>
      </div>
    </section>
  </div>`;
}

function full(an) {
  const acts = actions(an);
  const live = an.accts.filter((a) => a.status !== "deleted").length;
  return `<div class="wrap">
    <section class="hero" style="padding-bottom:0">
      <p class="eyebrow">${tr("Ditt digitale jeg", "Your digital self")}</p>
      <h1>${tr(`${fmtNum(live)} kontoer. Dette er bildet.`, `${fmtNum(live)} accounts. This is the picture.`)}</h1>
    </section>
    <div class="stats">
      <div class="stat"><b>${fmtNum(live)}</b><span>${tr("kontoer", "accounts")}</span></div>
      <div class="stat ${an.breachedAccts.length ? "danger" : "ok"}"><b>${an.breachedAccts.length}</b><span>${tr("hos hackede tjenester", "at breached services")}</span></div>
      <div class="stat ${an.pwnedAccts.length + an.reuseGroups.length ? "danger" : "ok"}"><b>${an.pwnedAccts.length + an.reuseGroups.length}</b><span>${tr("passordproblemer", "password problems")}</span></div>
      <div class="stat ${an.combined > 40 ? "warn" : ""}"><b>${an.combined}</b><span>${tr("synlighet av 100", "visibility of 100")}</span></div>
      <div class="stat"><b>${an.toDelete.length}</b><span>${tr("skal slettes", "to delete")}</span></div>
      <div class="stat ok"><b>${an.deleted.length}</b><span>${tr("slettet", "deleted")}</span></div>
    </div>
    <section class="map-wrap">
      <div class="panel">${mapSVG(an)}
        <div class="legend"><span><i style="background:var(--danger)"></i>${tr("risiko", "risk")}</span><span><i style="background:var(--warn)"></i>${tr("synlig", "visible")}</span><span><i style="background:var(--ok)"></i>${tr("i orden", "fine")}</span><span><i style="background:var(--accent);opacity:.55"></i>${tr("ikke gjennomgått", "not reviewed")}</span><span><i style="background:var(--muted)"></i>${tr("slettet / skal slettes", "deleted / to delete")}</span></div>
      </div>
      <div class="section">
        <h2>${tr("Gjør dette først", "Do this first")}</h2>
        ${acts.length ? `<div class="actions">${acts.slice(0, 12).map((a) => `<div class="action lvl-${a.lvl}"><p>${esc(a.text)}</p><span class="row">${a.ext ? `<a class="btn sm" href="${esc(a.ext)}" target="_blank" rel="noopener noreferrer">${tr("Slett", "Delete")}</a>` : ""}<a class="btn quiet sm" href="${esc(a.href)}">${tr("Se", "View")}</a></span></div>`).join("")}</div>
          ${acts.length > 12 ? `<p class="small muted">${tr(`Og ${acts.length - 12} til.`, `And ${acts.length - 12} more.`)}</p>` : ""}`
          : `<p class="note">${tr("Ingenting haster. Fortsett å gå gjennom kontoene, og sjekk synligheten.", "Nothing urgent. Keep reviewing your accounts, and check your visibility.")}</p>`}
      </div>
    </section>
    ${pieceCards(true)}
  </div>`;
}

function dotClass(a, an) {
  if (a.status === "deleted" || a.status === "delete") return "d-del";
  const b = an.byDomain.get(a.domain);
  if (a.pwned > 0 || (a.reuse && an.reuseGroups.some((g) => g.includes(a))) || (b && dangerous(b.flatMap((x) => x.dc)))) return "d-risk";
  if (a.visChecked && accountExposure(a) > 15) return "d-pub";
  if (a.status === "keep" || a.status === "cleanup" || a.visChecked) return "d-ok";
  return "d-unk";
}

function mapSVG(an) {
  const W = 560, C = W / 2;
  const accts = an.accts.slice(0, 480);
  const byCat = new Map();
  for (const a of accts) { if (!byCat.has(a.category)) byCat.set(a.category, []); byCat.get(a.category).push(a); }
  const cats = [...byCat.entries()].sort((x, y) => y[1].length - x[1].length);
  const total = accts.length;
  const gap = 0.06;
  const minShare = 0.05;
  const shares = cats.map(([, l]) => Math.max(minShare, l.length / total));
  const sum = shares.reduce((a, b) => a + b, 0);
  let ang = -Math.PI / 2;
  let dots = "", labels = "", spokes = "";
  cats.forEach(([cat, list], i) => {
    const span = (shares[i] / sum) * (Math.PI * 2);
    const a0 = ang + gap / 2, a1 = ang + span - gap / 2;
    spokes += `<line class="spoke" x1="${C + 52 * Math.cos(ang)}" y1="${C + 52 * Math.sin(ang)}" x2="${C + 236 * Math.cos(ang)}" y2="${C + 236 * Math.sin(ang)}"/>`;
    let r = 84, k = 0;
    while (k < list.length && r < 236) {
      const fit = Math.max(1, Math.floor((r * (a1 - a0)) / 15));
      for (let j = 0; j < fit && k < list.length; j++, k++) {
        const t = fit === 1 ? (a0 + a1) / 2 : a0 + ((a1 - a0) * j) / (fit - 1);
        const a = list[k];
        dots += `<circle class="dot ${dotClass(a, an)}" cx="${(C + r * Math.cos(t)).toFixed(1)}" cy="${(C + r * Math.sin(t)).toFixed(1)}" r="5.5" data-href="#/kontoer/${encodeURIComponent(a.id)}" tabindex="0" role="link"><title>${esc(a.service || a.domain)}${a.login ? " · " + esc(a.login) : ""}</title></circle>`;
      }
      r += 15;
    }
    const mid = (a0 + a1) / 2, lr = 254;
    const x = C + lr * Math.cos(mid), y = C + lr * Math.sin(mid);
    const anchor = Math.abs(Math.cos(mid)) < 0.3 ? "middle" : Math.cos(mid) > 0 ? "start" : "end";
    labels += `<text class="cat-t" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle">${esc(pick(CATEGORIES[cat] || CATEGORIES.other))} ${list.length}</text>`;
    ang += span;
  });
  return `<svg class="map" viewBox="-120 0 800 ${W}" role="img" aria-label="${tr("Kart over kontoene dine etter kategori", "Map of your accounts by category")}">
    <circle class="ring" cx="${C}" cy="${C}" r="120"/><circle class="ring" cx="${C}" cy="${C}" r="180"/><circle class="ring" cx="${C}" cy="${C}" r="238"/>
    ${spokes}${dots}${labels}
    <circle class="core" cx="${C}" cy="${C}" r="46"/><text class="core-t" x="${C}" y="${C}" text-anchor="middle" dominant-baseline="middle">${tr("Deg", "You")}</text>
  </svg>`;
}
