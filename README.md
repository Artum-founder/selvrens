# Selvrens

**Se hele ditt digitale jeg.** Selvrens kartlegger kontoene dine, hvor dataene dine har lekket, og hva du viser av deg selv på nett. Så hjelper den deg å rydde. Ingen konto, ingen sporing, alt lagres bare i din egen nettleser.

Nettside: https://selvrens.no (inntil domenet er koblet til: https://selvrens.vercel.app)

*English below.*

## Slik virker det

Startsiden (Kart) viser én vei med én «Neste steg»-knapp, så ingen trenger å gjette hva de skal gjøre:

1. Finn kontoene dine
2. Sjekk lekkasjer
3. Se hva du viser
4. Bestem for hver konto (behold, rydd eller slett)
5. Rydd opp
6. Hent dataene dine (valgfritt)

Hver side starter med en kort «Slik gjør du det»-boks med de tre tingene du skal gjøre der.

Under Innstillinger kan du slå på rolig visning (ingen bevegelse), større tekst og mer luft. Guidene er laget med tanke på folk med ADHD og autisme: én ting om gangen, ingen overraskelser, og pause når du vil.

## Delene

| Del | Hva den gjør |
| --- | --- |
| **1 Kontoer** | Fire måter å finne kontoene dine på: sidene for «Logg inn med Google / Apple / Microsoft / Facebook / X / GitHub / Spotify / Discord» (steg for steg, med en boks der du limer inn det du finner), en CSV-fil fra passordbehandleren (Chrome, Firefox, Apple, Bitwarden, 1Password, Proton Pass, LastPass, Dashlane, KeePass), ferdige søk i innboksen etter velkomst- og registreringsmeldinger, eller for hånd. Merk hver konto behold, rydd eller slett. |
| **2 Lekkasjer** | Sammenligner kontoene dine med den offentlige listen over kjente datainnbrudd, sjekker e-postadresser (gratis via XposedOrNot, offisielt via Have I Been Pwned når en nøkkel er lagt inn) og sjekker passord med k-anonymitet. Nettstedene en e-post har lekket fra, kan legges til i kontolisten med ett trykk, siden en lekkasje viser at du hadde konto der. |
| **3 Synlighet** | Søkelenker for navn, brukernavn, e-poster og telefonnumre (søkemotorer, norske kataloger, profiladresser på over 20 plattformer, Wayback Machine), og en sjekkliste per konto over hva en fremmed kan se. Alt legges sammen til ett samlet bilde. |
| **4 Dine data** | Direkte lenker for å be om en kopi av dataene dine fra Google Takeout, Meta, Apple, Microsoft, X, LinkedIn, TikTok, Snapchat, Spotify, Amazon, Netflix, Reddit og GitHub, med hvor lang tid det tar og hva du bør se etter i filene. |
| **5 Rens** | Guider som viser ett steg om gangen (med tid, hva du trenger, hva du ser når det har virket og hva du gjør hvis siden ser annerledes ut), og som husker hvor du var. GDPR-brev (sletting, innsyn, sletting av konto, fjerning fra søk og av bilder), reservasjon mot reklame og personverninnstillinger på telefonen. |
| **Hvorfor** | Hvorfor dette fortsatt betyr noe i KI-alderen: en profil av deg finnes allerede, men du kan velge hvordan du blir sett fra nå av. Med reservasjon mot KI-trening hos Meta, LinkedIn, X, Google Gemini, ChatGPT, Claude og PimEyes. |
| **Kart** | Startsiden: veien over, et kart over alle kontoene etter kategori og risiko, og en prioritert liste over hva du bør gjøre først. |

Ingen tjeneste kan liste alle stedene du noen gang har registrert deg. Selvrens kommer nær ved å kombinere de fem kildene som til sammen dekker nesten alt: «logg inn med»-listene, passordbehandleren, innboksen, lekkasjelistene og datanedlastingene dine.

## Personvern, helt konkret

Alt lagres i nettleserens `localStorage`. Du kan ta en kopi (gjerne låst med en passordfrase, AES-GCM) og slette alt med ett trykk. Bare dette forlater nettleseren, og bare når du selv starter det:

- **Passordsjekk:** de 5 første tegnene av en SHA-1-hash går til `api.pwnedpasswords.com`. Passordet forlater aldri nettleseren.
- **Import fra passordbehandler:** passordene leses i minnet for å sjekkes og for å finne gjenbruk, og slippes så. Bare et lekkasjetall og en tilfeldig gruppemerkelapp tas vare på.
- **E-postsjekk:** adressen går gjennom `/api/xon-email` (XposedOrNot) eller `/api/hibp-email` (Have I Been Pwned). Serveren verken logger eller lagrer den.
- **Lekkasjekatalogen:** `/api/breaches` henter den offentlige listen over datainnbrudd. Ingenting personlig sendes.

Ingen informasjonskapsler, ingen analyse, ingen skript eller fonter fra andre. En streng Content Security Policy er satt i `vercel.json`.

### Hvorfor ingen søking i lekkede databaser

Å laste ned og søke i lekkede passorddumper betyr å håndtere stjålne data om millioner av mennesker. Varslingstjenester (Have I Been Pwned, XposedOrNot, Mozilla Monitor) indekserer allerede disse lekkasjene på en ansvarlig måte, så Selvrens bygger på dem i stedet.

## Kjør den selv

Ingen byggesteg og ingen avhengigheter. Server mappen:

```
python3 -m http.server 8080
```

Funksjonene i `/api` kjører på Vercel (Node 20+). Lokalt viser lekkasjesjekkene som trenger dem en vennlig feilmelding.

### Slå på den offisielle Have I Been Pwned-sjekken

Kjøp en nøkkel på https://haveibeenpwned.com/API/Key og legg den inn i Vercel-prosjektet som miljøvariabelen `HIBP_API_KEY`. Inntil da svarer `/api/hibp-email` `{ "enabled": false }`, og knappen forklarer det.

## Oppbygning

```
index.html, styles.css, favicon.svg
src/app.js              skall og ruter
src/core/               store (lokal tilstand), bus, csv, leaks, analysis, vault (eksport), util
src/pieces/             kart, kontoer, lekkasjer, synlighet, data, rens, hvorfor, innstillinger
src/data/               services (slettesider), signin, download, ai, templates, guides, finders, optout
api/                    breaches, xon-email, hibp-email (Vercel-funksjoner)
docs/                   FROM-MANUS.md
```

## Takk til

Lekkasjedata: [Have I Been Pwned](https://haveibeenpwned.com/) (CC BY 4.0) og [XposedOrNot](https://xposedornot.com/). Passordsjekk: [Pwned Passwords](https://haveibeenpwned.com/Passwords).

Ideen og det første konseptet kommer fra Peder Schartum Thorbjørnsen (Artum). Den første prototypen ble bygget med Manus i juni 2025; dette er en ny versjon bygget fra bunnen av. Se [docs/FROM-MANUS.md](docs/FROM-MANUS.md).

## Lisens

Copyright (C) 2026 Peder Schartum Thorbjørnsen (Artum).

Selvrens er fri programvare: du kan dele den videre og endre den under vilkårene i GNU Affero General Public License, versjon 3, utgitt av Free Software Foundation. Se [LICENSE](LICENSE). Kjører du en endret versjon som nettjeneste, må du gi brukerne tilgang til kildekoden.

---

## English

**See your whole digital self.** Selvrens maps your accounts, where your data has leaked, and what you show of yourself online, then helps you clean up. No account, no tracking, everything stays in your own browser. The site is in Norwegian, with English one click away (the EN button).

**How it works.** The start page shows one path with one «Next step» button: find your accounts, check for leaks, see what you show, decide for each account (keep, tidy, delete), clean up, and optionally get your data. Every page opens with a short three-step «How to do it» box. The guides show one step at a time and remember your place, with calm display, larger text and more spacing under Settings, designed with ADHD and autism in mind.

**The parts.** 1 Kontoer (Accounts), 2 Lekkasjer (Leaks), 3 Synlighet (Visibility), 4 Dine data (Your data), 5 Rens (Clean up), Hvorfor (Why) and Kart (Map), as described in the Norwegian table above.

**Privacy.** Everything is stored in the browser's `localStorage`, can be exported (optionally locked with a passphrase, AES-GCM) and erased with one click. Only these leave the browser, and only when you start them: the first 5 characters of a password's SHA-1 hash (to `api.pwnedpasswords.com`), an email address for a leak check (through `/api/xon-email` or `/api/hibp-email`, never logged or stored), and a request for the public breach list (`/api/breaches`). No cookies, no analytics, no third-party scripts or fonts. Selvrens does not crawl leaked dumps; it builds on breach-notification services instead.

**Run it.** No build step, no dependencies: `python3 -m http.server 8080`. The `/api` functions run on Vercel (Node 20+). To turn on the official Have I Been Pwned email check, add a key as `HIBP_API_KEY` in the Vercel project.

**License.** GNU Affero General Public License, version 3. If you run a modified version as a web service, you must offer its source code to its users.
