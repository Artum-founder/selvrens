// Piece: Hvorfor (Why). AI, the profile that already exists, and choosing how you are seen from now on.
import { getState, update } from "../core/store.js";
import { tr, esc, pick, toast } from "../core/util.js";
import { AI_OPTOUTS } from "../data/ai.js";

export const meta = { path: "hvorfor", title: { no: "Hvorfor", en: "Why" } };

let root;

const PARTS = [
  {
    h: { no: "Det finnes allerede en profil av deg", en: "A profile of you already exists" },
    p: {
      no: ["Hver konto du har laget, hvert innlegg, hvert kjøp og hver app som fikk lov til å spore deg, har lagt igjen et spor. Sporene er samlet, kjøpt, solgt og koblet sammen i mange år.", "Reklamenettverk har en profil av interessene dine. Datameglere selger adresser, telefonnumre og vaner. Og mye av det du har lagt ut offentlig, er allerede lest av maskiner."],
      en: ["Every account you made, every post, every purchase and every app that was allowed to track you left a trace. Those traces have been collected, bought, sold and joined together for years.", "Ad networks hold a profile of your interests. Data brokers sell addresses, phone numbers and habits. And much of what you posted in public has already been read by machines."],
    },
  },
  {
    h: { no: "Hva AI forandrer", en: "What AI changes" },
    p: {
      no: ["AI-modeller er trent på store mengder tekst og bilder fra det åpne nettet, også innlegg fra vanlige folk. Det en modell allerede har lært, kan den ikke avlære.", "AI gjør det også lett å sette sammen bitene. Et navn, et brukernavn og et bilde er nok til at et verktøy kan finne resten på sekunder: arbeidsplass, bosted, venner og gamle innlegg. Ansiktssøk-tjenester kan finne bilder av deg fra hele nettet."],
      en: ["AI models are trained on huge amounts of text and images from the open web, including posts by ordinary people. What a model has already learned, it cannot unlearn.", "AI also makes it easy to put the pieces together. A name, a username and a photo are enough for a tool to find the rest in seconds: workplace, home town, friends and old posts. Face search services can find photos of you across the whole web."],
    },
  },
  {
    h: { no: "Det er for sent. Og det er ikke for sent.", en: "It is too late. And it is not too late." },
    p: {
      no: ["Det som allerede er samlet inn, får du ikke tilbake. Men nettet leses på nytt hele tiden, modeller trenes på nytt, og profiler oppdateres. Det du sletter, skjuler og protesterer mot i dag, er ikke med i morgen.", "Du kan ikke velge om det finnes en digital versjon av deg. Du kan velge hvordan den ser ut fra nå av: hva som er synlig, hvem som får bruke det, og hva som får lov å vokse videre."],
      en: ["What has already been collected, you will not get back. But the web is read again all the time, models are retrained and profiles are updated. What you delete, hide and object to today is not there tomorrow.", "You cannot choose whether a digital version of you exists. You can choose what it looks like from now on: what is visible, who may use it, and what is allowed to keep growing."],
    },
  },
  {
    h: { no: "Loven er på din side", en: "The law is on your side" },
    p: {
      no: ["I Norge og resten av EØS gir personvernforordningen (GDPR) deg rett til å se hva et selskap har om deg (artikkel 15), få det slettet (artikkel 17) og protestere mot at det brukes, også til markedsføring og AI-trening (artikkel 21). Selskapet må svare innen én måned. Datatilsynet hjelper deg hvis de ikke gjør det."],
      en: ["In Norway and the rest of the EEA, the GDPR gives you the right to see what a company holds on you (Article 15), have it erased (Article 17) and object to its use, including for marketing and AI training (Article 21). The company must reply within one month. The data protection authority helps you if they don't."],
    },
  },
];

export function render(el) {
  root = el;
  el.innerHTML = `<div class="wrap">
    <div class="section-head"><div>
      <p class="eyebrow">${tr("Hvorfor gjøre dette?", "Why do this?")}</p>
      <h1>${tr("Du kan velge hvordan du blir sett, fra nå av", "You can choose how you are seen, from now on")}</h1>
      <p class="lede">${tr("Kort om AI, profilene som allerede finnes, og hvorfor det fortsatt lønner seg å rydde.", "A short read on AI, the profiles that already exist, and why cleaning up still pays off.")}</p>
    </div></div>
    <div class="why">${PARTS.map((x, i) => `<section class="why-part"><span class="why-n">${i + 1}</span><div class="prose"><h2>${esc(pick(x.h))}</h2>${pick(x.p).map((t) => `<p>${esc(t)}</p>`).join("")}</div></section>`).join("")}</div>
    <section class="section">
      <div class="section-head"><div><h2>${tr("Si nei til AI-trening, tjeneste for tjeneste", "Say no to AI training, service by service")}</h2>
      <p class="small muted">${tr("Menynavnene er oversatt og kan være litt annerledes hos deg.", "Menu names are translated and may differ slightly for you.")}</p></div></div>
      <div id="ai"></div>
    </section>
    <section class="panel sunk">
      <h3>${tr("Klar?", "Ready?")}</h3>
      <p>${tr("Start med å finne kontoene dine. Resten følger av seg selv.", "Start by finding your accounts. The rest follows.")}</p>
      <div class="row"><a class="btn" href="#/kontoer">${tr("Finn kontoene mine", "Find my accounts")}</a><a class="btn ghost" href="#/">${tr("Til oversikten", "To the overview")}</a></div>
    </section>
  </div>`;
  renderAI();
  bind();
}

function renderAI() {
  const done = new Set(getState().done.ai || []);
  const n = AI_OPTOUTS.filter((a) => done.has(a.id)).length;
  document.getElementById("ai").innerHTML = `<p class="small muted">${tr(`${n} av ${AI_OPTOUTS.length} gjort`, `${n} of ${AI_OPTOUTS.length} done`)}</p>
  <div class="grid-2">${AI_OPTOUTS.map((a) => `<div class="piece">
    <div class="row between"><h3>${esc(a.name)}</h3>${done.has(a.id) ? `<span class="tag ok">${tr("gjort", "done")}</span>` : ""}</div>
    <p class="small">${esc(pick(a))}</p>
    <div class="row"><a class="btn sm" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">${tr("Åpne", "Open")} ↗</a>
    <label class="check small"><input type="checkbox" data-ai="${a.id}" ${done.has(a.id) ? "checked" : ""}> ${tr("Gjort", "Done")}</label></div>
  </div>`).join("")}</div>`;
}

function bind() {
  root.onchange = (e) => {
    const t = e.target;
    if (!t.dataset.ai) return;
    update((s) => { const d = new Set(s.done.ai || []); t.checked ? d.add(t.dataset.ai) : d.delete(t.dataset.ai); s.done.ai = [...d]; }, "why.ai", { count: 1 });
    renderAI();
    toast(t.checked ? tr("Krysset av.", "Ticked.") : tr("Fjernet avkrysning.", "Unticked."));
  };
}
