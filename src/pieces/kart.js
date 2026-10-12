// Piece: Kart (Map). The combined picture of your digital self, and what to do first.
import { getState } from "../core/store.js";
import { on } from "../core/bus.js";
import { tr, esc, pick, fmtNum } from "../core/util.js";
import { analyse, actions, accountExposure } from "../core/analysis.js";
import { dangerous, cachedCatalogue, loadCatalogue } from "../core/leaks.js";
import { CATEGORIES } from "../data/services.js";

export const meta = { path: "", title: { no: "Kart", en: "Map" } };

const PIECES = [
  { n: 1, path: "kontoer", t: { no: "Kontoer", en: "Accounts" }, d: { no: "Alle stedene du har en innlogging: fra «logg inn med Google/Apple/Microsoft», passordbehandleren og innboksen.", en: "Every place you have a login: from «sign in with Google/Apple/Microsoft», your password manager and your inbox." } },
  { n: 2, path: "lekkasjer", t: { no: "Lekkasjer", en: "Leaks" }, d: { no: "Hvilke av tjenestene dine som er hacket, om e-posten din er lekket, og om passordene dine er kjent.", en: "Which of your services were breached, whether your email leaked, and whether your passwords are known." } },
  { n: 3, path: "synlighet", t: { no: "Synlighet", en: "Visibility" }, d: { no: "Det du viser offentlig, konto for konto, og bildet det blir når alt legges sammen.", en: "What you show in public, account by account, and the picture it makes all together." } },
  { n: 4, path: "data", t: { no: "Dine data", en: "Your data" }, d: { no: "Be Google, Meta, Apple og de andre om en kopi av alt de har lagret om deg.", en: "Ask Google, Meta, Apple and the others for a copy of everything they hold on you." } },
  { n: 5, path: "rens", t: { no: "Rens", en: "Clean up" }, d: { no: "Guider, ferdige GDPR-brev og lenkene som skrur av sporing.", en: "Guides, ready GDPR letters and the links that switch off tracking." } },
  { n: 0, path: "hvorfor", t: { no: "Hvorfor", en: "Why" }, d: { no: "AI, profilen som allerede finnes, og hvorfor det fortsatt lønner seg å rydde.", en: "AI, the profile that already exists, and why cleaning up still pays off." } },
];

// The journey: one clear path through Selvrens. The first step that is not done is "now".
const STEPS = [
  { href: "#/kontoer", t: { no: "Finn kontoene dine", en: "Find your accounts" }, d: { no: "Se hvor du har logget inn med Google, Apple og Microsoft, og hent resten fra passordbehandleren.", en: "See where you signed in with Google, Apple and Microsoft, and pull in the rest from your password manager." }, done: (s) => s.accounts.length > 0 },
  { href: "#/lekkasjer", t: { no: "Sjekk lekkasjer", en: "Check for leaks" }, d: { no: "Skriv inn e-posten din og se hvilke datainnbrudd den er med i.", en: "Type your email and see which data breaches it is part of." }, done: (s) => (s.checks.email || []).length > 0 },
  { href: "#/synlighet", t: { no: "Se hva du viser", en: "See what you show" }, d: { no: "Søk opp deg selv, og kryss av hva en fremmed kan se på hver konto.", en: "Search for yourself, and tick what a stranger can see on each account." }, done: (s, an) => an.accts.some((a) => a.visChecked) },
  { href: "#/kontoer", t: { no: "Bestem for hver konto", en: "Decide for each account" }, d: { no: "Behold, rydd eller slett. Ett trykk per konto.", en: "Keep, tidy or delete. One tap per account." }, done: (s, an) => an.accts.length > 0 && an.unreviewed.length === 0 },
  { href: "#/rens", t: { no: "Rydd opp", en: "Clean up" }, d: { no: "Slett det du ikke vil ha. Guider og ferdige brev hjelper deg.", en: "Delete what you don't want. Guides and ready letters help you." }, done: (s, an) => an.accts.length > 0 && an.unreviewed.length === 0 && an.toDelete.length === 0 },
  { href: "#/data", optional: true, t: { no: "Hent dataene dine", en: "Get your data" }, d: { no: "Valgfritt: be om en kopi av alt de store har lagret om deg.", en: "Optional: ask for a copy of everything the big ones hold on you." }, done: (s) => (s.done.download || []).length > 0 },
];

function journey(an) {
  const s = getState();
  const st = STEPS.map((x) => x.done(s, an));
  const now = st.findIndex((d, i) => !d && !STEPS[i].optional);
  const nowOpt = now === -1 ? st.findIndex((d) => !d) : now;
  const cur = nowOpt === -1 ? null : STEPS[nowOpt];
  const count = st.filter(Boolean).length;
  return `<section class="journey" aria-labelledby="j-h">
    <div class="journey-head">
      <div class="stack">
        <p class="eyebrow">${tr("Din vei gjennom Selvrens", "Your path through Selvrens")} · ${count}/${STEPS.length}</p>
        <h2 id="j-h">${cur ? `${tr("Steg", "Step")} ${nowOpt + 1}: ${esc(pick(cur.t))}` : tr("Alt er gjort. Bra jobbet.", "All done. Well done.")}</h2>
        <p class="muted">${cur ? esc(pick(cur.d)) : tr("Kom tilbake om et halvt år. Nye kontoer og nye lekkasjer dukker opp hele tiden.", "Come back in six months. New accounts and new leaks turn up all the time.")}</p>
      </div>
      <div class="row">${cur ? `<a class="btn big" href="${cur.href}">${count ? tr("Neste steg", "Next step") : tr("Start her", "Start here")} →</a>` : `<a class="btn big" href="#/lekkasjer">${tr("Sjekk lekkasjer på nytt", "Check leaks again")}</a>`}<a class="btn quiet" href="#/hvorfor">${tr("Hvorfor gjøre dette?", "Why do this?")}</a></div>
    </div>
    <ol class="jsteps">${STEPS.map((x, i) => `<li class="${st[i] ? "done" : i === nowOpt ? "now" : ""}"><a href="${x.href}" ${i === nowOpt ? 'aria-current="step"' : ""}>
      <span class="jn" aria-hidden="true">${st[i] ? "✓" : i + 1}</span>
      <span class="jt">${esc(pick(x.t))}${x.optional ? ` <span class="muted small">(${tr("valgfritt", "optional")})</span>` : ""}<span class="sr">${st[i] ? tr(" (gjort)", " (done)") : ""}</span></span>
    </a></li>`).join("")}</ol>
  </section>`;
}

let unsub = [];

export function render(el) {
  unsub.forEach((u) => u()); unsub = [];
  const draw = () => {
    const an = analyse();
    el.innerHTML = an.accts.length ? full(an) : intro(an);
  };
  draw();
  if (getState().accounts.length && !cachedCatalogue()) loadCatalogue().then(() => { if (el.isConnected && location.hash.replace(/^#\/?/, "") === "") draw(); }).catch(() => {});
  el.onclick = (e) => { const d = e.target.closest("[data-href]"); if (d) location.hash = d.dataset.href; };
  el.onkeydown = (e) => { if (e.key !== "Enter") return; const d = e.target.closest("[data-href]"); if (d) location.hash = d.dataset.href; };
  el.onchange = null; el.oninput = null; el.onsubmit = null;
  unsub.push(on("state.changed", () => { if (location.hash.replace(/^#\/?/, "") === "" && el.isConnected) draw(); }));
}

function pieceCards() {
  return `<section class="section"><h2>${tr("Alle delene", "All the parts")}</h2><div class="grid-3 parts">${PIECES.map((p) => `<a class="piece" href="#/${p.path}">
    <span class="piece-n">${p.n ? `${tr("brikke", "piece")} ${p.n}` : tr("les først", "read first")}</span><h3>${esc(pick(p.t))}</h3><p class="small muted">${esc(pick(p.d))}</p></a>`).join("")}</div></section>`;
}

function intro(an) {
  return `<div class="wrap">
    <section class="hero">
      <p class="eyebrow">Selvrens</p>
      <h1>${tr("Se hele ditt digitale jeg.", "See your whole digital self.")}</h1>
      <p class="lede">${tr("Hvor har du kontoer? Hvor har dataene dine lekket? Hva viser du av deg selv, og hva blir bildet når alt legges sammen? Selvrens finner det ut sammen med deg, og hjelper deg å rydde.", "Where do you have accounts? Where has your data leaked? What do you show of yourself, and what picture does it make all together? Selvrens works it out with you, and helps you clean up.")}</p>
      <div class="promise"><span class="tag accent">${tr("Ingen konto", "No account")}</span><span class="tag accent">${tr("Lagres bare hos deg", "Stored only with you")}</span><span class="tag accent">${tr("Ingen sporing", "No tracking")}</span><span class="tag accent">${tr("Gratis og åpen kildekode", "Free and open source")}</span></div>
    </section>
    ${journey(an)}
    ${pieceCards()}
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
    ${journey(an)}
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
    ${pieceCards()}
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
