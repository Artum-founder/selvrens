// Piece: Lekkasjer (Leaks). Where you have been compromised.
import { getState, update, addAccounts } from "../core/store.js";
import { on } from "../core/bus.js";
import { tr, esc, toast, fmtDate, fmtNum, isEmail, howto, uid } from "../core/util.js";
import { lookup } from "../data/services.js";
import { loadCatalogue, cachedCatalogue, breachByName, pwnedCount, checkEmailXON, checkEmailHIBP, DATA_NO, dangerous } from "../core/leaks.js";
import { analyse } from "../core/analysis.js";

export const meta = { path: "lekkasjer", title: { no: "Lekkasjer", en: "Leaks" } };

let root, unsub = [];

export function render(el) {
  root = el;
  unsub.forEach((u) => u()); unsub = [];
  const emails = getState().profile.emails.split(/[,\s]+/).filter(isEmail);
  el.innerHTML = `<div class="wrap">
    <div class="section-head"><div>
      <p class="eyebrow">${tr("Brikke 2 · Lekkasjer", "Piece 2 · Leaks")}</p>
      <h1>${tr("Hvor har dataene dine lekket?", "Where has your data leaked?")}</h1>
      <p class="lede">${tr("Tre sjekker: tjenestene du har konto hos mot listen over kjente datainnbrudd, e-postadressene dine, og enkeltpassord.", "Three checks: the services you have accounts with against the list of known breaches, your email addresses, and single passwords.")}</p>
    </div></div>
    ${howto([
      { no: "Skriv e-postadressen din under og trykk «Sjekk gratis».", en: "Type your email address below and press «Check free»." },
      { no: "Se hvilke lekkasjer den er i. Legg nettstedene til i kontolisten med ett trykk: hver lekkasje er et sted du har hatt konto.", en: "See which leaks it is in. Add the sites to your account list with one click: every leak is a place you had an account." },
      { no: "Bytt passord der det står «alvorlig», og slå på totrinnsinnlogging.", en: "Change the password wherever it says «serious», and turn on two-step login." },
    ])}

    <section class="section">
      <div class="section-head"><div><h2>${tr("Kontoene dine mot kjente datainnbrudd", "Your accounts against known breaches")}</h2>
      <p class="small muted" id="cat-info"></p></div>
      <button class="btn quiet sm" data-act="refresh">${tr("Oppdater listen", "Refresh the list")}</button></div>
      <div id="matches"></div>
    </section>

    <section class="grid-2">
      <div class="panel">
        <h2>${tr("Sjekk en e-postadresse", "Check an email address")}</h2>
        <p class="small muted">${tr("Viser hvilke kjente lekkasjer adressen din finnes i. Adressen sendes gjennom selvrens.no sin server til tjenesten du velger. Vi lagrer den ikke.", "Shows which known leaks your address is in. The address goes through the selvrens.no server to the service you choose. We don't store it.")}</p>
        <label class="field">${tr("E-post", "Email")}<input type="email" id="em" value="${esc(emails[0] || "")}" autocomplete="email"></label>
        <div class="row">
          <button class="btn" data-act="xon">${tr("Sjekk gratis (XposedOrNot)", "Check free (XposedOrNot)")}</button>
          <button class="btn quiet" data-act="hibp">${tr("Sjekk med Have I Been Pwned", "Check with Have I Been Pwned")}</button>
        </div>
        <p class="small" id="em-status" role="status"></p>
        <div id="em-results" class="stack"></div>
      </div>
      <div class="panel">
        <h2>${tr("Sjekk et passord", "Check a password")}</h2>
        <p class="small muted">${tr("Passordet gjøres om til en SHA-1-hash i nettleseren. Bare de 5 første tegnene sendes til Pwned Passwords, som svarer med alle treff som starter likt. Sammenligningen skjer her.", "The password is turned into a SHA-1 hash in your browser. Only the first 5 characters are sent to Pwned Passwords, which answers with every match starting the same way. The comparison happens here.")}</p>
        <label class="field">${tr("Passord", "Password")}<input type="password" id="pw" autocomplete="off"></label>
        <div class="row"><button class="btn" data-act="pw">${tr("Sjekk", "Check")}</button></div>
        <p id="pw-out" role="status"></p>
      </div>
    </section>

    <section class="panel sunk">
      <h3>${tr("Hvorfor Selvrens ikke kryper lekkasjesider selv", "Why Selvrens doesn't crawl leak sites itself")}</h3>
      <div class="prose small">
        <p>${tr("Lekkede passordlister ligger på forum og nedlastingssider. Å hente, lagre og søke i dem betyr å håndtere stjålne data om millioner av mennesker, og det er både ulovlig og farlig å oppbevare.", "Leaked password lists sit on forums and download sites. Fetching, storing and searching them means handling stolen data about millions of people, which is unlawful and dangerous to keep.")}</p>
        <p>${tr("Tjenester som Have I Been Pwned og XposedOrNot gjør dette ansvarlig: de leser lekkasjene, beholder bare det som trengs for å varsle, og lar deg søke uten at noen får se passordet ditt. Selvrens bygger på dem.", "Services like Have I Been Pwned and XposedOrNot do this responsibly: they read the leaks, keep only what's needed to warn people, and let you search without anyone seeing your password. Selvrens builds on them.")}</p>
        <div class="links"><a href="https://haveibeenpwned.com/" target="_blank" rel="noopener">Have I Been Pwned</a><a href="https://monitor.mozilla.org/" target="_blank" rel="noopener">Mozilla Monitor</a><a href="https://xposedornot.com/" target="_blank" rel="noopener">XposedOrNot</a></div>
      </div>
    </section>
  </div>`;
  bind();
  renderMatches();
  renderEmailResults();
  unsub.push(on("state.changed", () => { if (document.getElementById("matches")) { renderMatches(); renderEmailResults(); } }));
  if (!cachedCatalogue()) refresh(false);
}

async function refresh(force) {
  const info = document.getElementById("cat-info");
  if (info) info.textContent = tr("Henter listen over kjente datainnbrudd…", "Fetching the list of known breaches…");
  try { await loadCatalogue(force); } catch { if (info) info.textContent = tr("Fikk ikke hentet listen akkurat nå. Prøv igjen senere.", "Couldn't fetch the list right now. Try again later."); return; }
  renderMatches();
}

function renderMatches() {
  const box = document.getElementById("matches");
  if (!box) return;
  const cat = cachedCatalogue();
  const info = document.getElementById("cat-info");
  if (cat && info) info.textContent = tr(`${fmtNum(cat.breaches.length)} kjente datainnbrudd i listen, hentet ${fmtDate(cat.fetchedAt)}. Kilde: Have I Been Pwned.`, `${fmtNum(cat.breaches.length)} known breaches in the list, fetched ${fmtDate(cat.fetchedAt)}. Source: Have I Been Pwned.`);
  const an = analyse();
  if (!an.accts.length) { box.innerHTML = `<div class="empty">${tr("Legg til kontoer under Kontoer, så sammenligner vi dem her.", "Add accounts under Accounts and we'll compare them here.")} <a class="btn sm" href="#/kontoer">${tr("Til kontoer", "To accounts")}</a></div>`; return; }
  if (!cat) { box.innerHTML = ""; return; }
  if (!an.breachedAccts.length) { box.innerHTML = `<p class="note">${tr(`Ingen av dine ${an.accts.length} kontoer er hos tjenester med kjente datainnbrudd. Det sier ikke alt: sjekk også e-postadressen.`, `None of your ${an.accts.length} accounts are at services with known breaches. That's not the whole story: check your email address too.`)}</p>`; return; }
  box.innerHTML = `<div class="scroll-x"><table class="tbl"><thead><tr><th>${tr("Konto", "Account")}</th><th>${tr("Innbrudd", "Breach")}</th><th>${tr("Når", "When")}</th><th>${tr("Hva lakk", "What leaked")}</th><th>${tr("Berørte", "Affected")}</th></tr></thead><tbody>
    ${an.breachedAccts.map(({ a, breaches }) => breaches.map((b, i) => `<tr>
      <td>${i === 0 ? `<a href="#/kontoer/${encodeURIComponent(a.id)}">${esc(a.service || a.domain)}</a>${a.login ? `<br><span class="small muted">${esc(a.login)}</span>` : ""}` : ""}</td>
      <td>${esc(b.t || b.n)} ${dangerous(b.dc) ? `<span class="tag danger">${tr("alvorlig", "serious")}</span>` : ""}</td>
      <td class="num">${esc(fmtDate(b.bd))}</td>
      <td>${esc(b.dc.map((d) => tr(DATA_NO[d] || d, d)).join(", "))}</td>
      <td class="num">${fmtNum(b.pc)}</td></tr>`).join("")).join("")}
  </tbody></table></div>
  <p class="small muted">${tr("At en tjeneste er rammet betyr ikke sikkert at din konto var med, men bytt passord og slå på totrinnsinnlogging der.", "A breached service doesn't always mean your account was in it, but change the password and turn on two-step login there.")}</p>`;
}

function renderEmailResults() {
  const box = document.getElementById("em-results");
  if (!box) return;
  const cat = cachedCatalogue();
  const list = getState().checks.email || [];
  box.innerHTML = list.slice().reverse().map((c, idx) => `<div class="panel sunk">
    <div class="row between"><b>${esc(c.email)}</b><span class="small muted">${esc(c.source === "hibp" ? "Have I Been Pwned" : "XposedOrNot")} · ${esc(fmtDate(c.at))}</span></div>
    ${c.breaches.length ? `<p>${tr(`Funnet i ${c.breaches.length} lekkasjer:`, `Found in ${c.breaches.length} leaks:`)}</p>
      <div class="links">${c.breaches.slice(0, 60).map((n) => { const b = breachByName(cat, n); return `<span class="tag ${b && dangerous(b.dc) ? "danger" : "warn"}" title="${esc(b ? fmtDate(b.bd) + " · " + b.dc.join(", ") : "")}">${esc(b ? b.t || b.n : n)}</span>`; }).join("")}</div>`
      : `<p class="note">${tr("Ikke funnet i kjente lekkasjer.", "Not found in known leaks.")}</p>`}
    <div class="row">${c.breaches.length ? `<button class="btn sm" data-addbreach="${list.length - 1 - idx}">${tr("Legg nettstedene til i kontolisten", "Add the sites to your account list")}</button>` : ""}<button class="btn quiet sm" data-forget="${list.length - 1 - idx}">${tr("Glem dette resultatet", "Forget this result")}</button></div>
  </div>`).join("");
}

function bind() {
  root.onclick = async (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.act === "refresh") return refresh(true);
    if (t.dataset.addbreach != null) {
      const c = getState().checks.email[+t.dataset.addbreach];
      if (!c) return;
      if (!cachedCatalogue()) { try { await loadCatalogue(); } catch {} }
      const cat = cachedCatalogue();
      const list = [];
      let unknown = 0;
      for (const n of c.breaches) {
        const b = breachByName(cat, n);
        if (!b || !b.d) { unknown++; continue; }
        const svc = lookup(b.d);
        list.push({ id: uid(), domain: svc.domain || b.d, service: svc.known ? svc.name : b.t || b.n, category: svc.category, login: c.email, source: "breach" });
      }
      const r = addAccounts(list, "breach");
      toast(tr(`La til ${r.added} kontoer, ${r.merged} fantes fra før${unknown ? `, ${unknown} uten kjent nettsted` : ""}.`, `Added ${r.added} accounts, ${r.merged} already there${unknown ? `, ${unknown} without a known site` : ""}.`));
      return;
    }
    if (t.dataset.forget != null) { const i = +t.dataset.forget; update((s) => s.checks.email.splice(i, 1)); return; }
    if (t.dataset.act === "xon" || t.dataset.act === "hibp") {
      const email = document.getElementById("em").value.trim();
      const st = document.getElementById("em-status");
      if (!isEmail(email)) { st.textContent = tr("Skriv en gyldig e-postadresse.", "Type a valid email address."); return; }
      st.textContent = tr("Sjekker…", "Checking…");
      t.disabled = true;
      let r;
      try { r = t.dataset.act === "xon" ? await checkEmailXON(email) : await checkEmailHIBP(email); } catch { r = { ok: false, reason: "error" }; }
      t.disabled = false;
      if (!r.ok) {
        st.textContent = r.reason === "off" ? tr("Sjekken mot Have I Been Pwned er ikke slått på ennå (krever en betalt API-nøkkel). Bruk den gratis sjekken, eller søk direkte på haveibeenpwned.com.", "The Have I Been Pwned check isn't switched on yet (it needs a paid API key). Use the free check, or search directly at haveibeenpwned.com.")
          : r.reason === "rate" ? tr("For mange sjekker på kort tid. Vent litt og prøv igjen.", "Too many checks in a short time. Wait a little and try again.")
          : tr("Sjekken feilet. Prøv igjen senere.", "The check failed. Try again later.");
        return;
      }
      st.textContent = "";
      if (!cachedCatalogue()) { try { await loadCatalogue(); } catch {} }
      update((s) => {
        s.checks.email = (s.checks.email || []).filter((c) => !(c.email === email && c.source === t.dataset.act));
        s.checks.email.push({ email, source: t.dataset.act, at: new Date().toISOString(), breaches: r.breaches });
      }, "leaks.email.checked", { count: r.breaches.length });
      toast(r.breaches.length ? tr(`Funnet i ${r.breaches.length} lekkasjer.`, `Found in ${r.breaches.length} leaks.`) : tr("Ikke funnet.", "Not found."));
    }
    if (t.dataset.act === "pw") {
      const inp = document.getElementById("pw");
      const out = document.getElementById("pw-out");
      if (!inp.value) return;
      out.textContent = tr("Sjekker…", "Checking…");
      try {
        const n = await pwnedCount(inp.value);
        out.innerHTML = n ? `<span class="note danger" style="display:block">${esc(tr(`Dette passordet finnes ${fmtNum(n)} ganger i kjente lekkasjer. Ikke bruk det.`, `This password appears ${fmtNum(n)} times in known leaks. Don't use it.`))}</span>`
          : `<span class="note" style="display:block">${esc(tr("Ikke funnet i kjente lekkasjer. Det gjør det ikke sterkt, bare ukjent.", "Not found in known leaks. That doesn't make it strong, only unknown."))}</span>`;
      } catch { out.textContent = tr("Fikk ikke kontakt med Pwned Passwords.", "Couldn't reach Pwned Passwords."); }
      inp.value = "";
    }
  };
}
