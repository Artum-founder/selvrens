// Piece: Rens (Clean up). Guides, letters and opt-outs.
import { getState, update } from "../core/store.js";
import { tr, esc, pick, copyText, toast, howto } from "../core/util.js";
import { GUIDES } from "../data/guides.js";
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
  el.innerHTML = `<div class="wrap">
    <div class="section-head"><div>
      <p class="eyebrow">${tr("Brikke 5 · Rens", "Piece 5 · Clean up")}</p>
      <h1>${tr("Ta det tilbake, ett steg om gangen", "Take it back, one step at a time")}</h1>
      <p class="lede">${tr("Guider med avkrysning, ferdige brev med lovhjemmel, og lenkene som skrur av sporing.", "Guides you can tick off, ready letters citing the law, and the links that switch off tracking.")}</p>
    </div></div>
    ${howto([
      { no: "Velg en guide og kryss av stegene etter hvert.", en: "Pick a guide and tick the steps as you go." },
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

function guides() {
  const done = getState().done.guides || {};
  return `<div class="grid-2">${GUIDES.map((g) => {
    const d = done[g.id] || [];
    const n = d.length;
    return `<div class="piece" data-guide="${g.id}">
      <div class="row between"><h3>${esc(pick(g.title))}</h3><span class="tag ${n === g.steps.length ? "ok" : ""}">${n}/${g.steps.length}</span></div>
      <p class="small muted">${esc(pick(g.desc))}</p>
      <ol class="steps">${g.steps.map((s, i) => `<li class="${d.includes(i) ? "done" : ""}"><input type="checkbox" class="stepbox" data-step="${i}" ${d.includes(i) ? "checked" : ""} aria-label="${tr("Steg", "Step")} ${i + 1}">
        <div class="stack"><span class="step-t">${esc(pick(s))}</span>${s.link ? `<a class="small" href="${esc(s.link)}" target="_blank" rel="noopener noreferrer">${esc(new URL(s.link).hostname.replace(/^www\./, ""))} ↗</a>` : ""}</div></li>`).join("")}</ol>
    </div>`;
  }).join("")}</div>`;
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
    if (t.dataset.tab) { tab = t.dataset.tab; history.replaceState(null, "", `#/rens/${tab}`); return render(root, [tab]); }
    if (t.dataset.tpl) { tpl = t.dataset.tpl; return renderTab(); }
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
    if (t.dataset.step != null) {
      const gid = t.closest("[data-guide]").dataset.guide, i = +t.dataset.step;
      update((s) => {
        const d = new Set(s.done.guides[gid] || []);
        t.checked ? d.add(i) : d.delete(i);
        s.done.guides[gid] = [...d];
      }, "clean.guide.step", { count: i });
      return renderTab();
    }
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
