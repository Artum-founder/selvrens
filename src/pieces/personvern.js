// Page: Personvern (Privacy). Says plainly that Selvrens stores nothing about you.
// Linked from the bottom of every page, not from the menu.
import { tr } from "../core/util.js";

export const meta = { path: "personvern", title: { no: "Personvern", en: "Privacy" }, hidden: true };

export function render(el) {
  el.innerHTML = `<div class="wrap privacy">
    <div class="section-head"><div>
      <p class="eyebrow">${tr("Personvern", "Privacy")}</p>
      <h1>${tr("Selvrens lagrer ingenting om deg", "Selvrens stores nothing about you")}</h1>
      <p class="lede">${tr("Selvrens er en hjelpeside. Den hjelper deg å se og rydde i ditt digitale jeg, men tar ikke vare på noe av det selv.", "Selvrens is a help page. It helps you see and clean up your digital self, but keeps none of it itself.")}</p>
    </div></div>

    <section class="panel">
      <h2>${tr("Det har vi ikke", "What we don't have")}</h2>
      <ul class="plain-list">
        <li>${tr("Ingen database. Det finnes ikke noe sted hos oss der opplysningene dine lagres.", "No database. There is nowhere on our side where your details are stored.")}</li>
        <li>${tr("Ingen brukerkonto og ingen innlogging.", "No user account and no login.")}</li>
        <li>${tr("Ingen informasjonskapsler (cookies).", "No cookies.")}</li>
        <li>${tr("Ingen statistikk, ingen sporing og ingen reklame.", "No statistics, no tracking and no ads.")}</li>
        <li>${tr("Ingen skript eller skrifttyper fra andre selskaper.", "No scripts or fonts from other companies.")}</li>
      </ul>
    </section>

    <section class="panel">
      <h2>${tr("Hvor blir det du skriver inn av?", "Where does what you type go?")}</h2>
      <p>${tr("Det blir liggende i din egen nettleser, på din egen maskin eller telefon. Vi kan ikke se det. Bytter du nettleser eller maskin, er det ikke med deg dit, med mindre du selv laster ned en kopi under Innstillinger.", "It stays in your own browser, on your own computer or phone. We cannot see it. If you change browser or device it does not come with you, unless you download a copy yourself under Settings.")}</p>
      <p>${tr("Slik sletter du det: trykk «Slett alt» under Innstillinger. Du kan også slette nettstedsdata for selvrens i nettleserens innstillinger.", "How to delete it: press «Erase everything» under Settings. You can also clear site data for selvrens in your browser's settings.")}</p>
      <div class="row"><a class="btn quiet" href="#/innstillinger">${tr("Til Innstillinger", "To Settings")}</a></div>
    </section>

    <section class="panel">
      <h2>${tr("Det eneste som forlater nettleseren", "The only things that leave your browser")}</h2>
      <p class="small muted">${tr("Bare når du selv trykker på knappen.", "Only when you press the button yourself.")}</p>
      <ul class="plain-list">
        <li><b>${tr("Passordsjekk", "Password check")}:</b> ${tr("de 5 første tegnene av en kode laget av passordet (en hash) går til Pwned Passwords. Selve passordet sendes aldri.", "the first 5 characters of a code made from the password (a hash) go to Pwned Passwords. The password itself is never sent.")}</li>
        <li><b>${tr("E-postsjekk", "Email check")}:</b> ${tr("e-postadressen sendes rett fra nettleseren din til XposedOrNot, som svarer med lekkasjene den finnes i. Selvrens' server er ikke med. XposedOrNot ser adressen og nettverksadressen din, akkurat som når du bruker nettsiden deres.", "the email address goes straight from your browser to XposedOrNot, which answers with the leaks it is in. The Selvrens server is not involved. XposedOrNot sees the address and your network address, just as when you use their website.")}</li>
        <li><b>Have I Been Pwned:</b> ${tr("knappen åpner nettsiden deres i en ny fane. Der skriver du inn e-posten selv. Selvrens sender ingenting dit.", "the button opens their website in a new tab. You type your email there yourself. Selvrens sends nothing there.")}</li>
        <li><b>${tr("Listen over datainnbrudd", "The list of data breaches")}:</b> ${tr("en offentlig liste hentes. Ingenting om deg sendes.", "a public list is fetched. Nothing about you is sent.")}</li>
        <li><b>${tr("Lenker du åpner", "Links you open")}:</b> ${tr("søk, sletteskjemaer og guider åpner andre nettsteder. Der gjelder deres regler.", "searches, deletion forms and guides open other websites. Their rules apply there.")}</li>
      </ul>
      <p class="small muted">${tr("Som alle nettsteder ser driftsleverandøren (Vercel) tekniske opplysninger om at siden ble åpnet, for eksempel tidspunkt og hvilken side. Det du skriver inn, er ikke med.", "Like every website, the hosting provider (Vercel) sees technical details that the page was opened, such as the time and which page. What you type is not included.")}</p>
    </section>

    <section class="panel sunk">
      <h2>${tr("Hvem står bak", "Who is behind it")}</h2>
      <p>${tr("Selvrens er laget av Peder Schartum Thorbjørnsen (Artum). Koden er åpen, så hvem som helst kan sjekke at dette stemmer.", "Selvrens is made by Peder Schartum Thorbjørnsen (Artum). The code is open, so anyone can check that this is true.")}</p>
      <p><a href="https://github.com/Artum-founder/selvrens" target="_blank" rel="noopener">github.com/Artum-founder/selvrens</a> (${tr("lisens", "license")}: AGPL-3.0)</p>
      <p class="small muted">${tr("Selvrens gir hjelp og maler, ikke juridisk rådgivning.", "Selvrens gives help and templates, not legal advice.")}</p>
    </section>
  </div>`;
}
