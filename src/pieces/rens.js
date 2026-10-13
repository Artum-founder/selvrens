// Piece: Rens (Clean up). Guides, letters and opt-outs.
// Guides open in a focus view: one step at a time, with the place saved.
import { getState, update } from "../core/store.js";
import { tr, esc, pick, copyText, toast, howto } from "../core/util.js";
import { GUIDES, START_GUIDE, guideById } from "../data/guides.js";
import { TEMPLATES, FIELD_LABELS } from "../data/templates.js";
import { ADS, PHONE } from "../data/optout.js";

export const meta = { path: "rens", title: { no: "Rens", en: "Clean up" } };

const TABS = [
  ["guider", { no: "Guider", en: "Guides" }],
  ["maler", { no: "Brevmaler", en: "Letters" }],
  ["reklame", { no: "Reklame", en: "Ads" }],
  ["telefon", { no: "Telefon", en: "Phone" }],
];
let root, tab = "guider", tpl = TEMPLATES[0].id;
const vals = {};

export function render(el, params) {
  root = el;
  if (params[0] && TABS.some(([k]) => k === params[0])) tab = params[0];
  if (tab === "maler" && params[1] && TEMPLATES.some((x) => x.id === params[1])) tpl = params[1];
  const g = tab === "guider" && params[1] ? guideById(params[1]) : null;
  if (g) { el.innerHTML = `<div class="wrap focus-wrap">${focusView(g)}</div>`; bind(); focusHeading(); return; }
  el.innerHTML = `<div class="wrap">
    <div class="section-head"><div>
      <p class="eyebrow">${tr("Del 5 · Rens", "Part 5 · Clean up")}</p>
      <h1>${tr("Ta det tilbake, ett steg om gangen", "Take it back, one step at a time")}</h1>
      <p class="lede">${tr("Guider som viser ett steg om gangen, ferdige brev med lovhjemmel, og lenkene som skrur av sporing.", "Guides that show one step at a time, ready letters citing the law, and the links that switch off tracking.")}</p>
    </div></div>
    ${howto([
      { no: "Velg en guide. Den viser ett steg om gangen og husker hvor du er.", en: "Pick a guide. It shows one step at a time and remembers where you are." },
      { no: "Finnes det ingen sletteknapp, bruk en brevmal. Den er ferdig skrevet med riktig lov.", en: "No delete button? Use a letter template. It is ready-written with the right law." },
      { no: "Skru av reklame og sporing under Reklame og Telefon.", en: "Switch off ads and tracking under Ads and Phone." },
    ])}
    <div class="tabs" role="tablist">${TABS.map(([k, l]) => `<button role="tab" aria-selected="${tab === k}" data-tab="${k}">${esc(pick(l))}</button>`).join("")}</div>
    <div id="tabbody"></div>
  </div>`;
  bind();
  renderTab();
}

function renderTab() {
  const box = document.getElementById("tabbody");
  if (tab === "guider") box.innerHTML = guides();
  if (tab === "maler") { box.innerHTML = letters(); fillLetter(); }
  if (tab === "reklame") box.innerHTML = ads();
  if (tab === "telefon") box.innerHTML = phone();
}

// ---- Guides -------------------------------------------------------------

const handled = (gid) => new Set(getState().done.guides?.[gid] || []);
const skipped = (gid) => new Set(getState().done.guideSkip?.[gid] || []);
const isDone = (g) => { const h = handled(g.id); return g.steps.every((st) => h.has(st.id)); };
const firstOpen = (g) => { const h = handled(g.id); const i = g.steps.findIndex((st) => !h.has(st.id)); return i === -1 ? 0 : i; };
const pos = () => getState().done.guidePos;

// Where the visitor is in a guide, or null. Used by the shell to offer «Fortsett».
export function currentGuide() {
  const p = pos();
  const g = p && guideById(p.g);
  if (!g || isDone(g)) return null;
  const i = Math.min(Math.max(0, p.i | 0), g.steps.length - 1);
  return { g, i, n: g.steps.length, hidden: !!p.hidden };
}

function progressText(g) {
  const h = handled(g.id), n = g.steps.filter((st) => h.has(st.id)).length;
  if (n === g.steps.length) return tr("Ferdig", "Done");
  return n ? tr(`${n} av ${g.steps.length} steg gjort`, `${n} of ${g.steps.length} steps done`) : tr(`${g.steps.length} steg`, `${g.steps.length} steps`);
}

function guides() {
  const cur = currentGuide();
  const rec = guideById(START_GUIDE) && !isDone(guideById(START_GUIDE)) ? guideById(START_GUIDE) : GUIDES.find((g) => !isDone(g));
  const showRec = rec && (!cur || cur.g.id !== rec.id);
  const card = (g, label, btn) => `<div class="panel guide-card">
      <p class="eyebrow">${label}</p>
      <h3>${esc(pick(g.title))}</h3>
      <p class="muted">${esc(pick(g.desc))}</p>
      <p class="small"><b>${tr("Tar", "Takes")}:</b> ${esc(pick(g.time))}</p>
      <div class="row"><a class="btn xl" href="#/rens/guider/${g.id}">${btn}</a></div>
    </div>`;
  return `<div class="stack guides">
    ${cur ? card(cur.g, tr("Fortsett der du slapp", "Pick up where you left off"), tr(`Fortsett på steg ${cur.i + 1} av ${cur.n}`, `Continue at step ${cur.i + 1} of ${cur.n}`)) : ""}
    ${showRec ? card(rec, rec.id === START_GUIDE ? tr("Start her", "Start here") : tr("Neste guide", "Next guide"), tr("Se guiden", "See the guide")) : ""}
    ${!rec ? `<p class="note">${tr("Du har gått gjennom alle guidene.", "You have been through all the guides.")}</p>` : ""}
    <details class="fold" ${!cur && !rec ? "open" : ""}><summary>${tr(`Vis alle guider (${GUIDES.length})`, `Show all guides (${GUIDES.length})`)}</summary><div class="fold-body">
      <ul class="guide-list">${GUIDES.map((g) => `<li><a href="#/rens/guider/${g.id}"><span class="gl-t">${esc(pick(g.title))}</span><span class="small muted">${esc(pick(g.time))} · ${progressText(g)}</span></a></li>`).join("")}</ul>
    </div></details>
  </div>`;
}

function linkButton(link) {
  if (!link) return "";
  if (link.startsWith("#/")) {
    const names = { "#/synlighet": tr("Gå til Synlighet", "Go to Visibility"), "#/kontoer": tr("Gå til Kontoer", "Go to Accounts") };
    const label = link.startsWith("#/rens/maler") ? tr("Åpne brevmalen", "Open the letter") : names[link] || tr("Gå dit", "Go there");
    return `<a class="btn quiet xl" href="${esc(link)}">${label} →</a>`;
  }
  const host = new URL(link).hostname.replace(/^www\./, "");
  return `<a class="btn quiet xl" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${tr("Åpne", "Open")} ${esc(host)} ↗</a>`;
}

function aboutGuide(g) {
  return `<dl class="facts">
    <div><dt>${tr("Tar", "Takes")}</dt><dd>${esc(pick(g.time))}</dd></div>
    <div><dt>${tr("Du trenger", "You need")}</dt><dd><ul>${g.need.map((x) => `<li>${esc(pick(x))}</li>`).join("")}</ul></dd></div>
    <div><dt>${tr("Ferdig når", "Done when")}</dt><dd>${esc(pick(g.doneWhen))}</dd></div>
    <div><dt>${tr("Greit å vite", "Good to know")}</dt><dd><ul>${g.warn.map((x) => `<li>${esc(pick(x))}</li>`).join("")}</ul></dd></div>
  </dl>`;
}

function plan(g, cur) {
  const h = handled(g.id), sk = skipped(g.id);
  return `<details class="fold"><summary>${tr("Se hele planen", "See the whole plan")}</summary><div class="fold-body">
    <ol class="plan">${g.steps.map((st, i) => `<li class="${h.has(st.id) ? "done" : ""} ${i === cur ? "now" : ""}"><button type="button" class="plan-b" data-jump="${i}">
      <span class="pn" aria-hidden="true">${h.has(st.id) ? "✓" : i + 1}</span><span>${esc(pick(st.do))}${sk.has(st.id) ? ` <span class="muted small">(${tr("hoppet over", "skipped")})</span>` : h.has(st.id) ? `<span class="sr"> (${tr("gjort", "done")})</span>` : ""}${i === cur ? `<span class="sr"> (${tr("du er her", "you are here")})</span>` : ""}</span>
    </button></li>`).join("")}</ol>
  </div></details>`;
}

function focusView(g) {
  const back = `<a class="back" href="#/rens/guider">← ${tr("Alle guider", "All guides")}</a>`;
  const head = `<p class="eyebrow">${tr("Guide", "Guide")} · ${esc(pick(g.title))}</p>`;
  if (isDone(g)) {
    return `<section class="focus" data-guide="${g.id}">${back}${head}
      <h2 id="focus-h" tabindex="-1">${tr("Ferdig med denne guiden.", "This guide is done.")}</h2>
      <p class="lede">${esc(pick(g.doneWhen))}</p>
      <div class="focus-actions">
        ${g.loopFrom ? `<button class="btn xl" data-g="again">${g.id === "social" ? tr("Ta neste nettverk", "Do the next network") : g.id === "brokers" ? tr("Ta neste selskap", "Do the next company") : tr("Ta neste konto", "Do the next account")}</button>` : ""}
        <a class="btn ${g.loopFrom ? "quiet " : ""}xl" href="#/rens/guider">${tr("Tilbake til guidene", "Back to the guides")}</a>
        <button class="btn quiet" data-g="restart">${tr("Start guiden på nytt", "Start the guide again")}</button>
      </div>
      ${plan(g, -1)}
    </section>`;
  }
  const p = pos();
  const started = (p && p.g === g.id) || handled(g.id).size > 0;
  if (!started) {
    return `<section class="focus" data-guide="${g.id}">${back}${head}
      <h2 id="focus-h" tabindex="-1">${esc(pick(g.title))}</h2>
      <p class="lede">${esc(pick(g.desc))}</p>
      ${aboutGuide(g)}
      <div class="focus-actions"><button class="btn xl" data-g="start">${tr("Start", "Start")} →</button></div>
      ${plan(g, -1)}
    </section>`;
  }
  const i = p && p.g === g.id ? Math.min(Math.max(0, p.i | 0), g.steps.length - 1) : firstOpen(g);
  const st = g.steps[i], n = g.steps.length;
  const doneN = g.steps.filter((x) => handled(g.id).has(x.id)).length;
  return `<section class="focus" data-guide="${g.id}" data-i="${i}">${back}${head}
    <div class="prog"><div class="prog-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${doneN}" aria-label="${tr("Fremdrift", "Progress")}"><span style="width:${Math.round((doneN / n) * 100)}%"></span></div>
      <p class="step-count">${tr(`Steg ${i + 1} av ${n}`, `Step ${i + 1} of ${n}`)}</p></div>
    <h2 id="focus-h" class="step-do" tabindex="-1">${esc(pick(st.do))}</h2>
    ${linkButton(st.link)}
    <div class="see"><b>${tr("Når det har virket", "When it has worked")}:</b> ${esc(pick(st.see))}</div>
    <div class="alt"><b>${tr("Ser det annerledes ut?", "Does it look different?")}</b> ${esc(pick(st.alt))}</div>
    <div class="focus-actions">
      <button class="btn xl" data-g="next">${doneN === n - 1 && !handled(g.id).has(st.id) ? tr("Ferdig", "Done") : tr("Ferdig, neste", "Done, next")} ✓</button>
      <button class="btn quiet" data-g="skip">${tr("Hopp over", "Skip")}</button>
      ${i > 0 ? `<button class="btn quiet" data-g="prev">← ${tr("Forrige", "Previous")}</button>` : ""}
      <button class="btn quiet" data-g="pause">${tr("Ta pause", "Take a break")}</button>
    </div>
    <details class="fold"><summary>${tr("Om guiden: tid, hva du trenger, greit å vite", "About the guide: time, what you need, good to know")}</summary><div class="fold-body">${aboutGuide(g)}</div></details>
    ${plan(g, i)}
  </section>`;
}

function focusHeading() {
  const h = document.getElementById("focus-h");
  if (h) { h.focus({ preventScroll: true }); window.scrollTo(0, 0); }
}

function setPos(gid, i, extra = {}) {
  update((s) => { s.done.guidePos = { g: gid, i, at: new Date().toISOString(), ...extra }; }, "clean.guide.pos");
}

function markStep(g, i, skip) {
  const id = g.steps[i].id;
  update((s) => {
    const h = new Set(s.done.guides[g.id] || []); h.add(id); s.done.guides[g.id] = [...h];
    s.done.guideSkip ||= {};
    const k = new Set(s.done.guideSkip[g.id] || []); skip ? k.add(id) : k.delete(id); s.done.guideSkip[g.id] = [...k];
  }, "clean.guide.step");
  const h = handled(g.id);
  const next = [...g.steps.keys()].map((d) => (i + 1 + d) % g.steps.length).find((j) => !h.has(g.steps[j].id));
  if (next == null) update((s) => { s.done.guidePos = null; }, "clean.guide.done");
  else setPos(g.id, next);
}

function guideAction(act, g, focus) {
  const i = +(focus.dataset.i || 0);
  if (act === "start") setPos(g.id, firstOpen(g));
  if (act === "next") markStep(g, i, false);
  if (act === "skip") markStep(g, i, true);
  if (act === "prev") setPos(g.id, Math.max(0, i - 1));
  if (act === "pause") { setPos(g.id, i); toast(tr("Plassen din er lagret. Fortsett når du vil.", "Your place is saved. Continue whenever you like.")); location.hash = "#/rens/guider"; return; }
  if (act === "restart" || act === "again") {
    const from = act === "again" ? g.steps.findIndex((st) => st.id === g.loopFrom) : 0;
    const keep = new Set(g.steps.slice(0, from).map((st) => st.id));
    update((s) => {
      s.done.guides[g.id] = (s.done.guides[g.id] || []).filter((id) => keep.has(id));
      if (s.done.guideSkip?.[g.id]) s.done.guideSkip[g.id] = s.done.guideSkip[g.id].filter((id) => keep.has(id));
    }, "clean.guide.reset");
    setPos(g.id, from);
  }
  render(root, ["guider", g.id]);
}

function letters() {
  const t = TEMPLATES.find((x) => x.id === tpl);
  const v = vals[tpl] || (vals[tpl] = {});
  const prof = getState().profile;
  if (v.name == null && prof.names) v.name = prof.names.split(",")[0].trim();
  if (v.email == null && prof.emails) v.email = prof.emails.split(/[,\s]+/)[0].trim();
  return `<div class="grid-2">
    <div class="stack">
      ${TEMPLATES.map((x) => `<button class="piece" style="text-align:left;cursor:pointer;${x.id === tpl ? "border-color:var(--accent)" : ""}" data-tpl="${x.id}" aria-pressed="${x.id === tpl}"><h3>${esc(pick(x.title))}</h3><p class="small muted">${esc(pick(x.desc))}</p></button>`).join("")}
    </div>
    <div class="panel">
      <h3>${esc(pick(t.title))}</h3>
      <p class="note small">${tr("Feltene fylles bare ut her i nettleseren. Brevet sendes fra din egen e-post.", "The fields are filled in here in your browser only. You send the letter from your own email.")}</p>
      <div class="form-grid">${t.fields.map((f) => `<label class="field">${esc(pick(FIELD_LABELS[f]))}${["info", "urls", "details"].includes(f) ? `<textarea data-f="${f}" rows="3">${esc(v[f] || "")}</textarea>` : `<input type="${f === "email" || f === "recipient" ? "email" : "text"}" data-f="${f}" value="${esc(v[f] || "")}">`}</label>`).join("")}</div>
      <label class="field">${tr("Brevet", "The letter")}<textarea class="letter" id="letter" readonly></textarea></label>
      <div class="row"><button class="btn" data-act="copy">${tr("Kopier", "Copy")}</button><a class="btn quiet" id="mailto" href="#">${tr("Åpne i e-post", "Open in email")}</a></div>
    </div>
  </div>`;
}

function fillLetter() {
  const t = TEMPLATES.find((x) => x.id === tpl);
  const v = vals[tpl] || {};
  const text = pick(t.text)(v);
  const area = document.getElementById("letter");
  if (!area) return;
  area.value = text;
  const [first, ...rest] = text.split("\n");
  const subject = first.replace(/^(Emne|Subject):\s*/, "");
  document.getElementById("mailto").href = `mailto:${encodeURIComponent(v.recipient || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(rest.join("\n").trim())}`;
}

function ads() {
  const done = new Set(getState().done.optout || []);
  return `<div class="stack">
    <p class="muted">${tr("Åpne hver lenke, skru av det du kan, og kryss av her.", "Open each link, switch off what you can, and tick it here.")}</p>
    <div class="grid-2">${ADS.map((a) => `<div class="panel"><label class="check"><input type="checkbox" data-opt="${a.id}" ${done.has(a.id) ? "checked" : ""}> <b>${esc(a.label)}</b></label>
      <p class="small muted">${esc(pick(a))}</p><a class="small" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">${esc(new URL(a.url).hostname.replace(/^www\./, ""))} ↗</a></div>`).join("")}</div>
  </div>`;
}

function phone() {
  const done = new Set(getState().done.optout || []);
  return `<div class="stack">
    <p class="muted">${tr("Telefonen samler mer enn de fleste vet: steder du ofte er, sporing mellom apper og en reklame-ID som følger deg. Fem minutter her stopper mye av det.", "Your phone collects more than most people know: places you often go, tracking between apps and an ad ID that follows you. Five minutes here stops much of it.")}</p>
    <div class="list">${PHONE.map((p) => `<div class="panel"><label class="check"><input type="checkbox" data-opt="${p.id}" ${done.has(p.id) ? "checked" : ""}> <b>${esc(pick(p))}</b></label>
      <p class="small"><code style="overflow-wrap:anywhere">${esc(pick(p.path))}</code></p>${p.url ? `<a class="small" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(new URL(p.url).hostname)} ↗</a>` : ""}</div>`).join("")}</div>
  </div>`;
}

function bind() {
  root.onclick = (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    const focus = t.closest(".focus");
    if (focus && (t.dataset.g || t.dataset.jump != null)) {
      const g = guideById(focus.dataset.guide);
      if (t.dataset.jump != null) { setPos(g.id, +t.dataset.jump); return render(root, ["guider", g.id]); }
      return guideAction(t.dataset.g, g, focus);
    }
    if (t.dataset.tab) { tab = t.dataset.tab; history.replaceState(null, "", `#/rens/${tab}`); return render(root, [tab]); }
    if (t.dataset.tpl) { tpl = t.dataset.tpl; history.replaceState(null, "", `#/rens/maler/${tpl}`); return renderTab(); }
    if (t.dataset.act === "copy") return copyText(document.getElementById("letter").value);
  };
  root.oninput = (e) => {
    const f = e.target.dataset.f;
    if (!f) return;
    (vals[tpl] ||= {})[f] = e.target.value;
    fillLetter();
  };
  root.onchange = (e) => {
    const t = e.target;
    if (t.dataset.opt) {
      update((s) => {
        const d = new Set(s.done.optout || []);
        t.checked ? d.add(t.dataset.opt) : d.delete(t.dataset.opt);
        s.done.optout = [...d];
      }, "clean.optout");
      toast(t.checked ? tr("Krysset av.", "Ticked.") : tr("Fjernet avkrysning.", "Unticked."));
    }
  };
}
