// Cleanup guides, written to be followed one step at a time.
// Every guide says up front how long it takes, what you need, when you are done and what to expect.
// Every step is one action («do»), what you will see when it worked («see»),
// and what to do if the page looks different («alt»). Links starting with #/ stay inside Selvrens.
// Progress and your place are kept locally (done.guides and done.guidePos).

export const START_GUIDE = "norway";

export const GUIDES = [
  {
    id: "norway",
    title: { no: "Norske kataloger og telefonsalg", en: "Norwegian directories and telemarketing" },
    desc: { no: "Få navnet og nummeret ditt ut av 1881, Gulesider og 180, og stopp telefonsalg.", en: "Get your name and number out of 1881, Gulesider and 180, and stop telemarketing." },
    time: { no: "ca. 15 minutter", en: "about 15 minutes" },
    need: [
      { no: "Mobilen din", en: "Your phone" },
      { no: "BankID eller MinID (for Reservasjonsregisteret)", en: "BankID or MinID (for the opt-out register)" },
    ],
    doneWhen: { no: "Du har sjekket de tre katalogene, bedt om hemmelig nummer hvis du vil det, og er reservert i Reservasjonsregisteret.", en: "You have checked the three directories, asked for an unlisted number if you want one, and are in the opt-out register." },
    warn: [
      { no: "Hemmelig nummer betyr at folk ikke finner nummeret ditt i katalogene. Det er et valg, ikke noe du må.", en: "An unlisted number means people cannot find your number in the directories. It is a choice, not something you have to do." },
      { no: "Det kan ta noen dager før endringer vises i katalogene.", en: "Changes can take a few days to show in the directories." },
    ],
    steps: [
      { id: "n1", do: { no: "Søk på navnet ditt på 1881.no.", en: "Search for your name on 1881.no." }, see: { no: "Du ser om navn, nummer og adresse står der, eller at det ikke er treff.", en: "You see whether your name, number and address are listed, or that there are no results." }, alt: { no: "Ingen treff? Fint. Gå videre til neste steg.", en: "No results? Good. Go on to the next step." }, link: "https://www.1881.no/" },
      { id: "n2", do: { no: "Søk på navnet ditt på gulesider.no.", en: "Search for your name on gulesider.no." }, see: { no: "Du ser om du står oppført der.", en: "You see whether you are listed there." }, alt: { no: "Ingen treff? Gå videre.", en: "No results? Go on." }, link: "https://www.gulesider.no/" },
      { id: "n3", do: { no: "Søk på navnet ditt på 180.no.", en: "Search for your name on 180.no." }, see: { no: "Du ser om du står oppført der.", en: "You see whether you are listed there." }, alt: { no: "Ingen treff? Gå videre.", en: "No results? Go on." }, link: "https://www.180.no/" },
      { id: "n4", do: { no: "Vil du ha hemmelig nummer? Kontakt mobiloperatøren din og si: «Jeg vil ha hemmelig nummer.»", en: "Want an unlisted number? Contact your mobile operator and say: «I want an unlisted number.»" }, see: { no: "Operatøren bekrefter at nummeret er hemmelig.", en: "The operator confirms the number is unlisted." }, alt: { no: "Vil du ikke ha hemmelig nummer? Trykk «Hopp over». Finner du ikke kontaktinfo, står den under «Kundeservice» på operatørens nettside.", en: "Don't want an unlisted number? Press «Skip». Can't find the contact details? They are under «Customer service» on the operator's website." } },
      { id: "n5", do: { no: "Åpne Reservasjonsregisteret og logg inn med BankID eller MinID.", en: "Open the opt-out register (Reservasjonsregisteret) and log in with BankID or MinID." }, see: { no: "Du ser valg for telefonsalg og adressert reklame.", en: "You see choices for telemarketing and addressed advertising." }, alt: { no: "Ser siden annerledes ut? Se etter en knapp som heter «Reserver deg» eller «Logg inn».", en: "Does the page look different? Look for a button called «Reserver deg» or «Logg inn»." }, link: "https://www.brreg.no/reservasjonsregisteret/" },
      { id: "n6", do: { no: "Velg å reservere deg mot både telefonsalg og adressert reklame, og lagre.", en: "Choose to opt out of both telemarketing and addressed advertising, and save." }, see: { no: "Du får en bekreftelse på skjermen.", en: "You get a confirmation on the screen." }, alt: { no: "Ser valgene annerledes ut? Velg alt som handler om telefonsalg og reklame i posten.", en: "Do the choices look different? Pick everything about telemarketing and advertising by post." } },
      { id: "n7", do: { no: "Står du fortsatt i en katalog om en uke? Send brevmalen «Slett opplysninger om meg» til katalogen.", en: "Still listed in a directory in a week? Send the «Erase my data» letter to the directory." }, see: { no: "Du har sendt en e-post. Katalogen skal svare innen en måned.", en: "You have sent an email. The directory must reply within a month." }, alt: { no: "Står du ikke lenger der? Da er du ferdig. Trykk «Ferdig».", en: "No longer listed? Then you are done. Press «Done»." }, link: "#/rens/maler/erasure" },
    ],
  },
  {
    id: "google",
    title: { no: "Google-søk om deg", en: "Google results about you" },
    desc: { no: "Få fjernet søketreff som viser adresse, telefon eller e-post.", en: "Get search results showing your address, phone or email removed." },
    time: { no: "ca. 20 minutter", en: "about 20 minutes" },
    need: [
      { no: "En Google-konto (for «Resultater om deg»)", en: "A Google account (for «Results about you»)" },
      { no: "Et sted å skrive ned lenker, for eksempel notatappen", en: "Somewhere to note links, like your notes app" },
    ],
    doneWhen: { no: "Du har bedt Google og Bing fjerne treffene som viser kontaktinfoen din.", en: "You have asked Google and Bing to remove the results that show your contact details." },
    warn: [
      { no: "Google fjerner treffet fra søket, ikke selve nettsiden. Siden må du kontakte direkte med en brevmal.", en: "Google removes the result from search, not the web page itself. Contact the page directly with a letter template." },
      { no: "Svarene kommer på e-post, ofte etter noen dager.", en: "Replies come by email, often after a few days." },
    ],
    steps: [
      { id: "g1", do: { no: "Åpne Synlighet og skriv inn navnet ditt.", en: "Open Visibility and type your name." }, see: { no: "Du ser en rad med søkeknapper.", en: "You see a row of search buttons." }, alt: { no: "Har du allerede skrevet inn navnet? Gå videre.", en: "Already typed your name? Go on." }, link: "#/synlighet" },
      { id: "g2", do: { no: "Trykk på Google-søket og les de to første sidene med treff.", en: "Press the Google search and read the first two pages of results." }, see: { no: "Du ser treff som handler om deg, og noen om andre med samme navn.", en: "You see results about you, and some about other people with the same name." }, alt: { no: "Mange med samme navn? Søk på navnet sammen med kommunen din.", en: "Many people with the same name? Search your name together with your town." } },
      { id: "g3", do: { no: "Kopier lenken til hvert treff som viser adressen, telefonen eller e-posten din, og lim den inn i et notat.", en: "Copy the link to each result that shows your address, phone or email, and paste it into a note." }, see: { no: "Du har en liste med lenker.", en: "You have a list of links." }, alt: { no: "Ingen slike treff? Flott. Hopp til steg 6.", en: "No such results? Great. Skip to step 6." } },
      { id: "g4", do: { no: "Åpne «Resultater om deg» og logg inn med Google-kontoen din.", en: "Open «Results about you» and log in with your Google account." }, see: { no: "Google ber deg legge inn kontaktinfoen din, så den kan lete etter treff.", en: "Google asks you to add your contact details so it can look for results." }, alt: { no: "Ser siden annerledes ut? Bruk skjemaet i steg 6 i stedet.", en: "Does the page look different? Use the form in step 6 instead." }, link: "https://myactivity.google.com/results-about-you" },
      { id: "g5", do: { no: "Be om fjerning av hvert treff Google finner.", en: "Request removal of each result Google finds." }, see: { no: "Treffene står som sendt til behandling.", en: "The results show as sent for review." }, alt: { no: "Står ikke treffet ditt i listen? Bruk skjemaet i neste steg.", en: "Your result isn't in the list? Use the form in the next step." } },
      { id: "g6", do: { no: "Bruk Googles skjema for personlig informasjon for treff som mangler. Lim inn lenkene fra notatet.", en: "Use Google's personal information form for any missing results. Paste the links from your note." }, see: { no: "Du får en e-post fra Google om at saken er mottatt.", en: "You get an email from Google saying the request was received." }, alt: { no: "Ingen treff igjen? Gå videre.", en: "No results left? Go on." }, link: "https://support.google.com/websearch/troubleshooter/9685456" },
      { id: "g7", do: { no: "Send de samme lenkene til Bing med skjemaet deres.", en: "Send the same links to Bing with their form." }, see: { no: "Bing bekrefter at saken er mottatt.", en: "Bing confirms the request was received." }, alt: { no: "Fant du ingen treff i Bing? Da er du ferdig.", en: "Found no results in Bing? Then you are done." }, link: "https://www.bing.com/webmaster/tools/eu-privacy-request" },
    ],
  },
  {
    id: "old-accounts",
    title: { no: "Gamle kontoer", en: "Old accounts" },
    desc: { no: "Slett kontoer du ikke bruker, én om gangen.", en: "Delete accounts you don't use, one at a time." },
    time: { no: "ca. 10 minutter per konto", en: "about 10 minutes per account" },
    need: [
      { no: "Kontolisten din under Kontoer", en: "Your account list under Accounts" },
      { no: "Tilgang til e-posten du brukte den gangen", en: "Access to the email you used back then" },
    ],
    doneWhen: { no: "Kontoen er slettet og merket som slettet her. Du velger selv om du tar én til.", en: "The account is deleted and marked as deleted here. You choose whether to do another." },
    warn: [
      { no: "Mange tjenester venter 14 til 30 dager før kontoen slettes helt. Logger du inn i den tiden, kan slettingen stoppe.", en: "Many services wait 14 to 30 days before the account is fully deleted. Logging in during that time can stop the deletion." },
      { no: "Får du ikke svar på et slettebrev innen en måned, kan du klage til Datatilsynet.", en: "No reply to a deletion letter within a month? You can complain to Datatilsynet, the Norwegian data protection authority." },
    ],
    loopFrom: "o2",
    steps: [
      { id: "o1", do: { no: "Åpne Kontoer og legg inn kontoene dine.", en: "Open Accounts and add your accounts." }, see: { no: "Kontoene står i listen.", en: "Your accounts are in the list." }, alt: { no: "Har du ingen passordbehandler? Bruk fanen «Logg inn med Google/Apple». Ligger kontoene allerede der? Gå videre.", en: "No password manager? Use the «Sign in with Google/Apple» tab. Accounts already there? Go on." }, link: "#/kontoer" },
      { id: "o2", do: { no: "Velg én konto du ikke bruker lenger.", en: "Pick one account you no longer use." }, see: { no: "Du har én konto i tankene. Bare én.", en: "You have one account in mind. Just one." }, alt: { no: "Vanskelig å velge? Ta den eldste.", en: "Hard to choose? Take the oldest." } },
      { id: "o3", do: { no: "Logg inn på kontoen.", en: "Log in to the account." }, see: { no: "Du er inne på kontoen.", en: "You are in the account." }, alt: { no: "Kommer du ikke inn? Trykk «Glemt passord» og bruk e-posten du brukte den gangen.", en: "Can't get in? Press «Forgot password» and use the email you used back then." } },
      { id: "o4", do: { no: "Vil du ta vare på noe (bilder, kvitteringer)? Last det ned nå.", en: "Want to keep anything (photos, receipts)? Download it now." }, see: { no: "Filene ligger på maskinen eller telefonen din.", en: "The files are on your computer or phone." }, alt: { no: "Ingenting du vil ta vare på? Trykk «Hopp over».", en: "Nothing to keep? Press «Skip»." } },
      { id: "o5", do: { no: "Finn «Slett konto» i innstillingene og slett kontoen.", en: "Find «Delete account» in the settings and delete the account." }, see: { no: "Tjenesten bekrefter at kontoen slettes.", en: "The service confirms the account is being deleted." }, alt: { no: "Finner du ikke knappen? Søk på nettet etter «[navnet på tjenesten] slett konto». Ingen sletteknapp i det hele tatt? Send brevmalen «Slett kontoen min».", en: "Can't find the button? Search the web for «[service name] delete account». No delete button at all? Send the «Delete my account» letter." } },
      { id: "o6", do: { no: "Åpne Kontoer og merk kontoen som slettet.", en: "Open Accounts and mark the account as deleted." }, see: { no: "Kontoen står som slettet, og kartet ditt er oppdatert.", en: "The account shows as deleted, and your map is updated." }, alt: { no: "Står ikke kontoen i listen? Da trenger du ikke gjøre noe her.", en: "The account isn't in the list? Then there is nothing to do here." }, link: "#/kontoer" },
    ],
  },
  {
    id: "social",
    title: { no: "Sosiale medier", en: "Social media" },
    desc: { no: "Stram inn det fremmede kan se, ett nettverk om gangen.", en: "Tighten what strangers can see, one network at a time." },
    time: { no: "ca. 15 minutter per nettverk", en: "about 15 minutes per network" },
    need: [
      { no: "Innlogging til nettverket (Facebook, Instagram, TikTok eller andre)", en: "Your login for the network (Facebook, Instagram, TikTok or others)" },
    ],
    doneWhen: { no: "En fremmed ser bare det du har valgt å vise.", en: "A stranger only sees what you chose to show." },
    warn: [
      { no: "Endringer gjelder fra nå. Det andre allerede har lagret eller delt, forsvinner ikke.", en: "Changes apply from now on. What others have already saved or shared does not disappear." },
      { no: "Knappene heter litt forskjellig fra nettverk til nettverk. De ligger nesten alltid under «Personvern».", en: "The buttons are named a little differently on each network. They are almost always under «Privacy»." },
    ],
    loopFrom: "s1",
    steps: [
      { id: "s1", do: { no: "Velg ett nettverk å starte med.", en: "Pick one network to start with." }, see: { no: "Du har ett nettverk i tankene.", en: "You have one network in mind." }, alt: { no: "Vet ikke hvilket? Ta det du bruker mest.", en: "Not sure which? Take the one you use most." } },
      { id: "s2", do: { no: "Åpne profilen din i et privat nettleservindu, uten å være logget inn.", en: "Open your profile in a private browser window, without being logged in." }, see: { no: "Det du ser nå, ser alle fremmede.", en: "What you see now, every stranger sees." }, alt: { no: "Vil ikke profilen åpne seg uten innlogging? Bruk valget «Vis som offentlig» i nettverket.", en: "Profile won't open without logging in? Use the network's «View as public» option." } },
      { id: "s3", do: { no: "Kryss av det du ser i sjekklisten for kontoen under Synlighet.", en: "Tick what you see in the checklist for the account under Visibility." }, see: { no: "Sjekklisten er fylt ut.", en: "The checklist is filled in." }, alt: { no: "Står ikke kontoen der? Legg den til under Kontoer først.", en: "Account not there? Add it under Accounts first." }, link: "#/synlighet" },
      { id: "s4", do: { no: "Skjul fødselsdato, telefon, e-post og bosted fra den offentlige profilen.", en: "Hide date of birth, phone, email and home town from the public profile." }, see: { no: "Feltene står som «Bare meg» eller «Venner».", en: "The fields show as «Only me» or «Friends»." }, alt: { no: "Finner du ikke valget? Se under «Rediger profil» eller «Personvern».", en: "Can't find the option? Look under «Edit profile» or «Privacy»." } },
      { id: "s5", do: { no: "Slå på at du må godkjenne tagger før de vises.", en: "Turn on that you must approve tags before they show." }, see: { no: "Nye tagger venter på godkjenning fra deg.", en: "New tags wait for your approval." }, alt: { no: "Har ikke nettverket tagger? Trykk «Hopp over».", en: "The network has no tags? Press «Skip»." } },
      { id: "s6", do: { no: "Skjul listen over venner og følgere.", en: "Hide your friends and followers lists." }, see: { no: "Listene står som «Bare meg» eller «Venner».", en: "The lists show as «Only me» or «Friends»." }, alt: { no: "Går det ikke an å skjule? Trykk «Hopp over».", en: "Can't be hidden? Press «Skip»." } },
      { id: "s7", do: { no: "Begrens gamle innlegg til venner.", en: "Limit old posts to friends." }, see: { no: "Gamle offentlige innlegg vises bare for venner.", en: "Old public posts only show to friends." }, alt: { no: "På Facebook ligger dette under «Personvern», og gjelder alle tidligere innlegg på én gang. Andre nettverk har det ofte ikke. Trykk da «Hopp over».", en: "On Facebook this is under «Privacy» and covers all past posts at once. Other networks often don't have it. Then press «Skip»." } },
    ],
  },
  {
    id: "images",
    title: { no: "Bilder av deg", en: "Photos of you" },
    desc: { no: "Finn hvor ansiktet ditt ligger på nettet, og be om å få det fjernet.", en: "Find where your face appears online, and ask for it to be removed." },
    time: { no: "ca. 25 minutter, pluss ventetid på svar", en: "about 25 minutes, plus waiting for replies" },
    need: [
      { no: "Et bilde der ansiktet ditt synes godt", en: "A photo where your face shows clearly" },
      { no: "Et sted å skrive ned lenker", en: "Somewhere to note links" },
    ],
    doneWhen: { no: "Du har bedt hver side om å fjerne bildet, og bedt søkemotorene oppdatere treffene.", en: "You have asked each site to remove the photo, and asked the search engines to refresh the results." },
    warn: [
      { no: "Bildet du søker med, lastes opp til søketjenesten. Bruk et bilde som allerede ligger åpent på nettet.", en: "The photo you search with is uploaded to the search service. Use a photo that is already public online." },
      { no: "Er bildet krenkende eller delt uten at du ville det? Slettmeg.no hjelper gratis.", en: "Is the photo abusive or shared without your consent? Slettmeg.no helps for free." },
    ],
    steps: [
      { id: "i1", do: { no: "Velg ett bilde der ansiktet ditt synes godt.", en: "Pick one photo where your face shows clearly." }, see: { no: "Bildet ligger klart på maskinen eller telefonen.", en: "The photo is ready on your computer or phone." }, alt: { no: "Har du ikke noe bilde? Ta et nytt, rett forfra.", en: "No photo? Take a new one, straight on." } },
      { id: "i2", do: { no: "Last opp bildet på TinEye.", en: "Upload the photo on TinEye." }, see: { no: "Du ser en liste over sider der bildet finnes.", en: "You see a list of pages where the photo appears." }, alt: { no: "Ingen treff? Prøv samme bilde i Google Lens eller Bing Visuelt søk.", en: "No results? Try the same photo in Google Lens or Bing Visual Search." }, link: "https://tineye.com/" },
      { id: "i3", do: { no: "Kopier lenken til hver side med bildet, og lim den inn i et notat.", en: "Copy the link to each page with the photo, and paste it into a note." }, see: { no: "Du har en liste med lenker.", en: "You have a list of links." }, alt: { no: "Ingen sider å fjerne? Da er du ferdig. Trykk «Ferdig» på resten.", en: "No pages to remove? Then you are done. Press «Done» on the rest." } },
      { id: "i4", do: { no: "Send brevmalen «Fjern bilder av meg» til hver side.", en: "Send the «Remove photos of me» letter to each site." }, see: { no: "Du har sendt én e-post per side.", en: "You have sent one email per site." }, alt: { no: "Finner du ingen e-postadresse? Se etter «Kontakt» eller «Personvern» nederst på siden.", en: "Can't find an email address? Look for «Contact» or «Privacy» at the bottom of the site." }, link: "#/rens/maler/images" },
      { id: "i5", do: { no: "Vent på svar. Sjekk sidene igjen om en uke.", en: "Wait for replies. Check the pages again in a week." }, see: { no: "Bildene er borte fra sidene.", en: "The photos are gone from the pages." }, alt: { no: "Ikke svar etter en måned? Du kan klage til Datatilsynet.", en: "No reply after a month? You can complain to Datatilsynet." } },
      { id: "i6", do: { no: "Vises bildet fortsatt i Google, selv om det er borte fra siden? Be Google oppdatere treffet.", en: "Photo still showing in Google even though it is gone from the page? Ask Google to refresh the result." }, see: { no: "Google bekrefter at forespørselen er mottatt.", en: "Google confirms the request was received." }, alt: { no: "Vises det ikke lenger? Da er du ferdig.", en: "No longer showing? Then you are done." }, link: "https://search.google.com/search-console/remove-outdated-content" },
    ],
  },
  {
    id: "brokers",
    title: { no: "Selskaper som har data om deg", en: "Companies that hold data about you" },
    desc: { no: "Spør hva de vet om deg, og be dem slette det.", en: "Ask what they know about you, and ask them to delete it." },
    time: { no: "ca. 15 minutter, pluss inntil en måned ventetid", en: "about 15 minutes, plus up to a month of waiting" },
    need: [
      { no: "Navnet på selskapet", en: "The company's name" },
      { no: "E-posten din", en: "Your email" },
    ],
    doneWhen: { no: "Du har fått svar fra selskapet og bedt om sletting av det du ikke vil de skal ha.", en: "You have a reply from the company and have asked them to delete what you don't want them to have." },
    warn: [
      { no: "Selskapet har en måned på å svare. Er saken komplisert, kan de forlenge med to måneder, men de må si fra.", en: "The company has one month to reply. If it is complicated they can extend by two months, but they must tell you." },
      { no: "Noe må de beholde, for eksempel regnskap. Det er lov.", en: "Some things they must keep, such as accounting records. That is allowed." },
    ],
    loopFrom: "b1",
    steps: [
      { id: "b1", do: { no: "Velg ett selskap du tror har data om deg. For eksempel en butikk der du har medlemskort.", en: "Pick one company you think holds data about you. For example a shop where you have a loyalty card." }, see: { no: "Du har ett selskap i tankene.", en: "You have one company in mind." }, alt: { no: "Vet ikke hvem? Start med banken, strømselskapet eller forsikringsselskapet.", en: "Not sure who? Start with your bank, power company or insurer." } },
      { id: "b2", do: { no: "Send brevmalen «Hva har dere om meg?» til selskapet.", en: "Send the «What do you hold on me?» letter to the company." }, see: { no: "Du har sendt en e-post.", en: "You have sent an email." }, alt: { no: "Finner du ingen e-postadresse? Søk etter «personvern» på nettsiden deres.", en: "Can't find an email address? Search their website for «privacy»." }, link: "#/rens/maler/access" },
      { id: "b3", do: { no: "Vent på svaret. Ta en pause her.", en: "Wait for the reply. Take a break here." }, see: { no: "Du har fått svar med det de har om deg.", en: "You have a reply with what they hold about you." }, alt: { no: "Ingen svar etter en måned? Du kan klage til Datatilsynet.", en: "No reply after a month? You can complain to Datatilsynet." } },
      { id: "b4", do: { no: "Vil du at de sletter noe? Send brevmalen «Slett opplysninger om meg».", en: "Want them to delete something? Send the «Erase my data» letter." }, see: { no: "Du har sendt en e-post.", en: "You have sent an email." }, alt: { no: "Er du fornøyd med det de har? Trykk «Hopp over».", en: "Fine with what they hold? Press «Skip»." }, link: "#/rens/maler/erasure" },
    ],
  },
];

export const guideById = (id) => GUIDES.find((g) => g.id === id);
