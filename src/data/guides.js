// Cleanup guides. Step lists with links; progress is kept locally.
export const GUIDES = [
  {
    id: "google",
    title: { no: "Google-søk om deg", en: "Google results about you" },
    desc: { no: "Få fjernet treff som viser adresse, telefon eller e-post.", en: "Get results showing your address, phone or email removed." },
    steps: [
      { no: "Søk på navnet ditt med anførselstegn, og på telefon og e-post. Bruk søkene under Synlighet.", en: "Search your name in quotes, and your phone and email. Use the searches under Visibility." },
      { no: "Åpne «Resultater om deg» i Google-kontoen og be om fjerning av treff med kontaktinfo.", en: "Open «Results about you» in your Google account and request removal of results with contact details.", link: "https://myactivity.google.com/results-about-you" },
      { no: "For andre personopplysninger: bruk Googles skjema for fjerning av personlig informasjon.", en: "For other personal data: use Google's form for removing personal information.", link: "https://support.google.com/websearch/troubleshooter/9685456" },
      { no: "Er siden allerede slettet, men vises fortsatt? Be om oppdatering av utdatert innhold.", en: "Page already gone but still showing? Ask for outdated content to be refreshed.", link: "https://search.google.com/search-console/remove-outdated-content" },
      { no: "Gjør det samme hos Bing.", en: "Do the same at Bing.", link: "https://www.bing.com/webmaster/tools/eu-privacy-request" },
    ],
  },
  {
    id: "old-accounts",
    title: { no: "Gamle kontoer", en: "Old accounts" },
    desc: { no: "Finn, gjenopprett og slett kontoer du ikke bruker.", en: "Find, recover and delete accounts you don't use." },
    steps: [
      { no: "Importer passordlisten din under Kontoer, og bruk «Finn glemte kontoer» for innboks og «logg inn med»-tilkoblinger.", en: "Import your password list under Accounts, and use «Find forgotten accounts» for your inbox and «sign in with» connections." },
      { no: "Merk hver konto: behold, rydd eller slett.", en: "Mark each account: keep, tidy or delete." },
      { no: "Kommer du ikke inn? Bruk «glemt passord» med e-posten du brukte den gangen.", en: "Can't get in? Use «forgot password» with the email you used back then." },
      { no: "Last ned dataene dine først hvis du vil ha dem, og slett så kontoen fra innstillingene.", en: "Download your data first if you want it, then delete the account from its settings." },
      { no: "Ingen sletteknapp? Send brevmalen «Slett kontoen min» eller «GDPR art. 17».", en: "No delete button? Send the «Delete my account» or «GDPR art. 17» letter." },
      { no: "Ikke svar innen en måned? Klag til Datatilsynet.", en: "No reply within a month? Complain to the data protection authority.", link: "https://www.datatilsynet.no/" },
      { no: "Merk kontoen som slettet her, så kartet ditt stemmer.", en: "Mark the account as deleted here so your map stays true." },
    ],
  },
  {
    id: "social",
    title: { no: "Sosiale medier", en: "Social media" },
    desc: { no: "Stram inn det du viser, eller slett.", en: "Tighten what you show, or delete." },
    steps: [
      { no: "Gå gjennom profilen som en fremmed: hva ser de uten å følge deg? Fyll ut sjekklisten under Synlighet.", en: "View your profile as a stranger: what can they see without following you? Fill in the checklist under Visibility." },
      { no: "Skjul fødselsdato, telefon, e-post og bosted fra offentlig profil.", en: "Hide date of birth, phone, email and home town from your public profile." },
      { no: "Skru av at andre kan tagge deg uten godkjenning, og fjern gamle tagger.", en: "Stop others tagging you without approval, and remove old tags." },
      { no: "Skjul venne- og følgerlistene.", en: "Hide your friends and followers lists." },
      { no: "Begrens gamle innlegg til venner (Facebook har en knapp for alle tidligere innlegg).", en: "Limit old posts to friends (Facebook has one button for all past posts)." },
      { no: "Vil du slette? Last ned arkivet først. De fleste har 14 til 30 dagers angrefrist.", en: "Want to delete? Download your archive first. Most have a 14 to 30 day grace period." },
    ],
  },
  {
    id: "norway",
    title: { no: "Norske kataloger og telefonsalg", en: "Norwegian directories and telemarketing" },
    desc: { no: "1881, Gulesider, 180 og Reservasjonsregisteret.", en: "1881, Gulesider, 180 and the Norwegian opt-out register." },
    steps: [
      { no: "Søk deg selv opp i 1881, Gulesider og 180 (søkene under Synlighet).", en: "Look yourself up in 1881, Gulesider and 180 (the searches under Visibility)." },
      { no: "Be mobiloperatøren gjøre nummeret ditt hemmelig eller reservert. Da forsvinner det fra katalogene.", en: "Ask your mobile operator to make your number unlisted. It then drops out of the directories." },
      { no: "Står du der likevel, kontakt katalogen direkte og be om fjerning.", en: "Still listed? Contact the directory directly and ask for removal." },
      { no: "Reserver deg mot telefonsalg og adressert reklame i Reservasjonsregisteret.", en: "Opt out of telemarketing and addressed advertising in the Reservasjonsregisteret.", link: "https://www.brreg.no/reservasjonsregisteret/" },
      { no: "Roller i firma (Proff, Brønnøysund) er offentlige og kan ikke fjernes, men gammel adresse kan oppdateres.", en: "Company roles (Proff, Brønnøysund) are public and cannot be removed, but an old address can be updated." },
    ],
  },
  {
    id: "images",
    title: { no: "Bilder av deg", en: "Photos of you" },
    desc: { no: "Finn hvor ansiktet ditt ligger, og få det ned.", en: "Find where your face appears, and get it taken down." },
    steps: [
      { no: "Gjør et omvendt bildesøk med et bilde av deg (Google Lens, Bing, TinEye).", en: "Run a reverse image search with a photo of you (Google Lens, Bing, TinEye).", link: "https://tineye.com/" },
      { no: "Skriv ned adressene til sidene og bildene.", en: "Note the addresses of the pages and images." },
      { no: "Send brevmalen «Fjern bilder av meg» til nettstedet.", en: "Send the «Remove photos of me» letter to the site." },
      { no: "Når bildet er borte fra siden, be søkemotoren oppdatere treffet.", en: "Once the image is gone from the page, ask the search engine to refresh the result.", link: "https://search.google.com/search-console/remove-outdated-content" },
      { no: "Gjelder det krenkende bilder, få hjelp hos Slettmeg.no.", en: "For abusive images, get help from Slettmeg.no.", link: "https://slettmeg.no/" },
    ],
  },
  {
    id: "brokers",
    title: { no: "Datameglere og reklame", en: "Data brokers and advertising" },
    desc: { no: "Selskap som samler og selger opplysninger om deg.", en: "Companies that collect and sell data about you." },
    steps: [
      { no: "Send innsynskrav (GDPR art. 15) til selskap du mistenker har data om deg.", en: "Send an access request (GDPR art. 15) to companies you suspect hold data on you." },
      { no: "Be dem slette (art. 17) og protestere mot markedsføring (art. 21).", en: "Ask them to erase it (art. 17) and object to marketing (art. 21)." },
      { no: "Skru av personlig tilpasset reklame (se fanen Reklame).", en: "Switch off personalised advertising (see the Ads tab)." },
      { no: "Gå gjennom telefonens personverninnstillinger (se fanen Telefon).", en: "Go through your phone's privacy settings (see the Phone tab)." },
    ],
  },
];
