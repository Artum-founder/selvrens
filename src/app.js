// Selvrens shell: router, header, footer. Each module is a piece in src/pieces/.
import { getState, getLang, setLang, setTheme, update } from "./core/store.js";
import { on } from "./core/bus.js";
import { tr, esc, pick } from "./core/util.js";
export const VERSION = "0.5.0";
import * as kart from "./pieces/kart.js";
import * as kontoer from "./pieces/kontoer.js";
import * as lekkasjer from "./pieces/lekkasjer.js";
import * as synlighet from "./pieces/synlighet.js";
import * as data from "./pieces/data.js";
import * as rens from "./pieces/rens.js";
import { currentGuide } from "./pieces/rens.js";
import * as hvorfor from "./pieces/hvorfor.js";
import * as innstillinger from "./pieces/innstillinger.js";
import * as personvern from "./pieces/personvern.js";

export const PIECES = [kart, kontoer, lekkasjer, synlighet, data, rens, hvorfor, innstillinger, personvern];

const main = document.getElementById("main");
let current = null;

function route() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [seg, ...rest] = hash.split("/");
  const piece = PIECES.find((p) => p.meta.path === seg) || kart;
  const params = rest.map(decodeURIComponent);
  const changed = current !== piece;
  current = piece;
  renderNav();
  // Each piece owns the main area while shown: clear the previous piece's handlers first.
  main.onclick = main.oninput = main.onchange = main.onsubmit = main.onkeydown = null;
  piece.render(main, params);
  renderGuidebar(piece === rens && params[0] === "guider" && params[1]);
  document.title = piece === kart ? "Selvrens" : `${pick(piece.meta.title)} · Selvrens`;
  if (changed) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
}

function renderNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = PIECES.filter((p) => !p.meta.hidden).map((p) => `<a href="#/${p.meta.path}" ${current === p ? 'aria-current="page"' : ""}>${esc(pick(p.meta.title))}</a>`).join("");
  document.getElementById("lang").textContent = getLang() === "en" ? "NO" : "EN";
  document.getElementById("lang").setAttribute("aria-label", getLang() === "en" ? "Bytt til norsk" : "Switch to English");
  document.documentElement.lang = getLang() === "en" ? "en" : "no";
}

// A quiet bar that brings you back to the guide you are in, from any page.
let inFocus = false;
function renderGuidebar(focus) {
  if (focus !== undefined) inFocus = !!focus;
  const bar = document.getElementById("guidebar");
  const cur = currentGuide();
  if (!cur || cur.hidden || inFocus) { bar.hidden = true; bar.innerHTML = ""; return; }
  bar.hidden = false;
  bar.innerHTML = `<div class="guidebar-in"><a href="#/rens/guider/${cur.g.id}">${tr("Fortsett guiden", "Continue the guide")}: <b>${esc(pick(cur.g.title))}</b>, ${tr(`steg ${cur.i + 1} av ${cur.n}`, `step ${cur.i + 1} of ${cur.n}`)} →</a>
    <button type="button" class="chip-btn" id="guidebar-x" aria-label="${tr("Skjul", "Hide")}">${tr("Skjul", "Hide")}</button></div>`;
  document.getElementById("guidebar-x").onclick = () => update((s) => { if (s.done.guidePos) s.done.guidePos.hidden = true; }, "clean.guide.pos");
}

function renderFoot() {
  document.getElementById("foot").innerHTML = `<div class="wrap">
    <div class="foot-row"><b>${tr("Selvrens lagrer ingenting om deg.", "Selvrens stores nothing about you.")}</b>
    <span>${tr("Det du skriver inn, blir bare i din egen nettleser. Ingen konto, ingen sporing, ingen informasjonskapsler.", "What you type stays only in your own browser. No account, no tracking, no cookies.")}</span>
    <a href="#/personvern">${tr("Les mer om personvern", "Read more about privacy")}</a></div>
    <div class="foot-row">
      <span>Selvrens ${esc(VERSION)}</span>
      <a href="https://github.com/Artum-founder/selvrens" rel="noopener">${tr("Åpen kildekode", "Open source")} (AGPL-3.0)</a>
      <span>${tr("Lekkasjedata", "Breach data")}: <a href="https://haveibeenpwned.com/" rel="noopener">Have I Been Pwned</a> (CC BY 4.0), <a href="https://xposedornot.com/" rel="noopener">XposedOrNot</a></span>
    </div></div>`;
}

function applyTheme() {
  const t = getState().settings.theme;
  if (t) document.documentElement.setAttribute("data-theme", t);
  else document.documentElement.removeAttribute("data-theme");
}

// Comfort settings live on <html> as classes so every page follows them.
function applyComfort() {
  const st = getState().settings, cl = document.documentElement.classList;
  cl.toggle("calm", !!st.calm);
  cl.toggle("big-text", !!st.bigText);
  cl.toggle("airy", !!st.airy);
}

document.getElementById("lang").addEventListener("click", () => setLang(getLang() === "en" ? "no" : "en"));
document.getElementById("theme").addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark" || (!getState().settings.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  setTheme(dark ? "light" : "dark");
});

on("settings.lang", () => { route(); renderFoot(); });
on("settings.theme", applyTheme);
on("settings.comfort", applyComfort);
on("state.changed", () => renderGuidebar());
on("state.replaced", () => { applyTheme(); applyComfort(); route(); renderFoot(); });
window.addEventListener("hashchange", route);

applyTheme();
applyComfort();
route();
renderFoot();
