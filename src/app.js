// Selvrens shell: router, header, footer. Each module is a piece in src/pieces/.
import { getState, getLang, setLang, setTheme } from "./core/store.js";
import { on } from "./core/bus.js";
import { tr, esc, pick } from "./core/util.js";
import { startBorder, PIECE } from "./sol/border.js";
import * as kart from "./pieces/kart.js";
import * as kontoer from "./pieces/kontoer.js";
import * as lekkasjer from "./pieces/lekkasjer.js";
import * as synlighet from "./pieces/synlighet.js";
import * as data from "./pieces/data.js";
import * as rens from "./pieces/rens.js";
import * as hvorfor from "./pieces/hvorfor.js";
import * as innstillinger from "./pieces/innstillinger.js";

export const PIECES = [kart, kontoer, lekkasjer, synlighet, data, rens, hvorfor, innstillinger];

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
  document.title = piece === kart ? "Selvrens" : `${pick(piece.meta.title)} · Selvrens`;
  if (changed) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
}

function renderNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = PIECES.map((p) => `<a href="#/${p.meta.path}" ${current === p ? 'aria-current="page"' : ""}>${esc(pick(p.meta.title))}</a>`).join("");
  document.getElementById("lang").textContent = getLang() === "en" ? "NO" : "EN";
  document.getElementById("lang").setAttribute("aria-label", getLang() === "en" ? "Bytt til norsk" : "Switch to English");
  document.documentElement.lang = getLang() === "en" ? "en" : "no";
}

function renderFoot() {
  const s = getState();
  const bonds = (s.settings.bonds || []).filter((b) => b.state === "bonded").length;
  document.getElementById("foot").innerHTML = `<div class="wrap">
    <div class="foot-row"><b>${tr("Alt lagres bare i denne nettleseren.", "Everything stays in this browser.")}</b>
    <span>${tr("Ingen konto. Ingen sporing. Ingen informasjonskapsler.", "No account. No tracking. No cookies.")}</span></div>
    <div class="foot-row">
      <span>${tr("SOL-brikke", "SOL piece")} ${esc(PIECE.version)} · ${bonds ? tr(`${bonds} bånd`, `${bonds} bond(s)`) : tr("frittstående", "standalone")}${s.settings.lifted ? tr(" · løftet for reparasjon", " · lifted for repair") : ""}</span>
      <a href="https://github.com/Artum-founder/selvrens" rel="noopener">${tr("Åpen kildekode", "Open source")} (AGPL-3.0)</a>
      <span>${tr("Lekkasjedata", "Breach data")}: <a href="https://haveibeenpwned.com/" rel="noopener">Have I Been Pwned</a> (CC BY 4.0), <a href="https://xposedornot.com/" rel="noopener">XposedOrNot</a></span>
    </div></div>`;
}

function applyTheme() {
  const t = getState().settings.theme;
  if (t) document.documentElement.setAttribute("data-theme", t);
  else document.documentElement.removeAttribute("data-theme");
}

document.getElementById("lang").addEventListener("click", () => setLang(getLang() === "en" ? "no" : "en"));
document.getElementById("theme").addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark" || (!getState().settings.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  setTheme(dark ? "light" : "dark");
});

on("settings.lang", () => { route(); renderFoot(); });
on("settings.theme", applyTheme);
on("state.replaced", () => { applyTheme(); route(); renderFoot(); });
on("sol.bond.added", renderFoot); on("sol.bond.state", renderFoot); on("sol.bond.cut", renderFoot); on("sol.lift", renderFoot);
window.addEventListener("hashchange", route);

applyTheme();
startBorder();
route();
renderFoot();
