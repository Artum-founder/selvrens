// Letter templates. The first four come from the 2025 Manus build of SelvRens (tightened);
// the access request (GDPR art. 15) is new. Every field is filled in the browser only.

const F = {
  name: { no: "Ditt fulle navn", en: "Your full name" },
  email: { no: "Din e-postadresse", en: "Your email address" },
  recipient: { no: "Mottakers e-post (personvern/support)", en: "Recipient email (privacy/support)" },
  company: { no: "Selskap eller tjeneste", en: "Company or service" },
  account: { no: "Brukernavn eller konto-ID", en: "Username or account ID" },
  info: { no: "Hvilke opplysninger det gjelder", en: "Which data this is about" },
  urls: { no: "Adresser (URL-er), én per linje", en: "Addresses (URLs), one per line" },
  details: { no: "Mer om saken (valgfritt)", en: "More detail (optional)" },
};

export const TEMPLATES = [
  {
    id: "erasure",
    title: { no: "Slett opplysninger om meg (GDPR art. 17)", en: "Erase my data (GDPR art. 17)" },
    desc: { no: "Retten til å bli glemt. Selskapet har én måned på å svare.", en: "The right to be forgotten. The company has one month to reply." },
    fields: ["name", "email", "recipient", "company", "account", "info"],
    text: {
      no: (v) => `Emne: Krav om sletting av personopplysninger (GDPR artikkel 17)

Til ${v.company || "[selskap]"},

Jeg ber om at dere sletter alle personopplysninger dere har om meg, i tråd med personvernforordningen (GDPR) artikkel 17.

Navn: ${v.name || "[navn]"}
E-post: ${v.email || "[e-post]"}${v.account ? `\nKonto: ${v.account}` : ""}
${v.info ? `\nDette gjelder særlig:\n${v.info}\n` : ""}
Jeg trekker tilbake ethvert samtykke dere bygger behandlingen på, og opplysningene er ikke lenger nødvendige for formålet de ble samlet inn for.

Etter GDPR artikkel 12 nr. 3 ber jeg om skriftlig bekreftelse på at slettingen er gjennomført, senest innen én måned. Hvis dere mener dere ikke kan slette noe av dette, ber jeg om en begrunnelse for hvert punkt. Jeg er kjent med retten til å klage til Datatilsynet.

Med vennlig hilsen
${v.name || "[navn]"}`,
      en: (v) => `Subject: Request to erase personal data (GDPR Article 17)

To ${v.company || "[company]"},

I ask you to erase all personal data you hold about me, under Article 17 of the General Data Protection Regulation (GDPR).

Name: ${v.name || "[name]"}
Email: ${v.email || "[email]"}${v.account ? `\nAccount: ${v.account}` : ""}
${v.info ? `\nThis concerns in particular:\n${v.info}\n` : ""}
I withdraw any consent your processing relies on, and the data is no longer necessary for the purpose it was collected for.

Under Article 12(3) GDPR, please confirm in writing that the erasure is complete within one month. If you believe you cannot erase any of it, please give your reasons for each item. I am aware of my right to complain to the data protection authority.

Kind regards
${v.name || "[name]"}`,
    },
  },
  {
    id: "access",
    title: { no: "Hva har dere om meg? (GDPR art. 15)", en: "What do you hold on me? (GDPR art. 15)" },
    desc: { no: "Innsyn: få en kopi av alt et selskap har lagret om deg. Gratis, svar innen én måned.", en: "Access: get a copy of everything a company stores about you. Free, reply within one month." },
    fields: ["name", "email", "recipient", "company", "account"],
    text: {
      no: (v) => `Emne: Krav om innsyn i personopplysninger (GDPR artikkel 15)

Til ${v.company || "[selskap]"},

Jeg ber om innsyn i personopplysningene dere behandler om meg, i tråd med GDPR artikkel 15.

Navn: ${v.name || "[navn]"}
E-post: ${v.email || "[e-post]"}${v.account ? `\nKonto: ${v.account}` : ""}

Jeg ber om:
1. En kopi av alle personopplysninger dere har om meg.
2. Formålene med behandlingen og det rettslige grunnlaget.
3. Hvem opplysningene er delt med eller solgt til.
4. Hvor lenge opplysningene lagres.
5. Hvor dere fikk opplysningene fra, hvis ikke fra meg.
6. Om det brukes automatiserte avgjørelser eller profilering.

Svar innen én måned, jf. artikkel 12 nr. 3.

Med vennlig hilsen
${v.name || "[navn]"}`,
      en: (v) => `Subject: Subject access request (GDPR Article 15)

To ${v.company || "[company]"},

Under Article 15 GDPR I request access to the personal data you process about me.

Name: ${v.name || "[name]"}
Email: ${v.email || "[email]"}${v.account ? `\nAccount: ${v.account}` : ""}

Please send me:
1. A copy of all personal data you hold about me.
2. The purposes of the processing and the legal basis.
3. Who the data has been shared with or sold to.
4. How long the data is kept.
5. Where you got the data, if not from me.
6. Whether automated decisions or profiling are used.

Please reply within one month, as Article 12(3) requires.

Kind regards
${v.name || "[name]"}`,
    },
  },
  {
    id: "account",
    title: { no: "Slett kontoen min", en: "Delete my account" },
    desc: { no: "For tjenester uten egen sletteknapp.", en: "For services without a delete button." },
    fields: ["name", "email", "recipient", "company", "account", "details"],
    text: {
      no: (v) => `Emne: Forespørsel om permanent sletting av konto

Til ${v.company || "[tjeneste]"},

Jeg ber om at kontoen min slettes permanent, sammen med alle personopplysninger knyttet til den.

Brukernavn eller konto-ID: ${v.account || "[konto]"}
E-post knyttet til kontoen: ${v.email || "[e-post]"}
${v.details ? `\n${v.details}\n` : ""}
Bekreft gjerne skriftlig når slettingen er gjennomført, og senest innen 30 dager.

Med vennlig hilsen
${v.name || "[navn]"}`,
      en: (v) => `Subject: Request to permanently delete my account

To ${v.company || "[service]"},

Please permanently delete my account and all personal data linked to it.

Username or account ID: ${v.account || "[account]"}
Email linked to the account: ${v.email || "[email]"}
${v.details ? `\n${v.details}\n` : ""}
Please confirm in writing when the deletion is complete, within 30 days at the latest.

Kind regards
${v.name || "[name]"}`,
    },
  },
  {
    id: "search",
    title: { no: "Fjern treff fra søkemotor", en: "Remove search results" },
    desc: { no: "Når en side om deg dukker opp i søk. Søkemotorene har egne skjema; dette er teksten du kan lime inn.", en: "When a page about you shows up in search. Search engines have their own forms; this is the text to paste." },
    fields: ["name", "email", "urls", "details"],
    text: {
      no: (v) => `Emne: Forespørsel om fjerning av søketreff med personopplysninger

Mitt navn er ${v.name || "[navn]"}. Jeg ber om at følgende adresser fjernes fra søkeresultater for navnet mitt:

${v.urls || "[adresser]"}

Sidene inneholder personopplysninger om meg som ikke har allmenn interesse, og som jeg ikke har samtykket til at skal spres. Jeg viser til retten til sletting i GDPR artikkel 17.
${v.details ? `\n${v.details}\n` : ""}
Med vennlig hilsen
${v.name || "[navn]"}
${v.email || ""}`,
      en: (v) => `Subject: Request to remove search results containing personal data

My name is ${v.name || "[name]"}. I ask that the following addresses be removed from search results for my name:

${v.urls || "[addresses]"}

These pages contain personal data about me that is not in the public interest and that I have not agreed to spread. I refer to the right to erasure in Article 17 GDPR.
${v.details ? `\n${v.details}\n` : ""}
Kind regards
${v.name || "[name]"}
${v.email || ""}`,
    },
  },
  {
    id: "images",
    title: { no: "Fjern bilder av meg", en: "Remove photos of me" },
    desc: { no: "Til eieren av et nettsted som viser bilder av deg.", en: "To the owner of a site that shows photos of you." },
    fields: ["name", "email", "recipient", "company", "urls", "details"],
    text: {
      no: (v) => `Emne: Forespørsel om fjerning av bilder

Til ${v.company || "[nettsted]"},

Jeg ber om at følgende bilder av meg fjernes fra nettstedet deres:

${v.urls || "[bildeadresser]"}

Jeg har ikke samtykket til publiseringen. Bilder der jeg kan gjenkjennes er personopplysninger etter GDPR, og jeg ber om sletting etter artikkel 17.
${v.details ? `\n${v.details}\n` : ""}
Bekreft gjerne når bildene er fjernet, helst innen 14 dager.

Med vennlig hilsen
${v.name || "[navn]"}
${v.email || ""}`,
      en: (v) => `Subject: Request to remove photos

To ${v.company || "[website]"},

Please remove the following photos of me from your website:

${v.urls || "[image addresses]"}

I did not consent to their publication. Photos in which I can be recognised are personal data under the GDPR, and I request erasure under Article 17.
${v.details ? `\n${v.details}\n` : ""}
Please confirm once the photos are removed, ideally within 14 days.

Kind regards
${v.name || "[name]"}
${v.email || ""}`,
    },
  },
];

export const FIELD_LABELS = F;
