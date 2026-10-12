// Advertising opt-out links (carried over from the 2025 Manus build, updated) and phone settings
// (from Peder's Sol Archive entry E014 on shadow logging).
export const ADS = [
  { id: "yoc", label: "Your Online Choices (Norge / EU)", url: "https://www.youronlinechoices.com/nor/dine-valg", no: "Velg bort tilpasset reklame fra annonsenettverk i Europa.", en: "Opt out of tailored ads from European ad networks." },
  { id: "google", label: "Google My Ad Center", url: "https://myadcenter.google.com/", no: "Skru av tilpassede annonser hos Google og YouTube.", en: "Turn off personalised ads on Google and YouTube." },
  { id: "meta", label: "Meta (Facebook, Instagram)", url: "https://www.facebook.com/adpreferences/", no: "Annonseinnstillinger og data fra partnere.", en: "Ad preferences and data from partners." },
  { id: "x", label: "X", url: "https://x.com/settings/account/personalization", no: "Tilpasning og data.", en: "Personalisation and data." },
  { id: "microsoft", label: "Microsoft", url: "https://account.microsoft.com/privacy/ad-settings", no: "Tilpassede annonser hos Microsoft.", en: "Personalised ads at Microsoft." },
  { id: "daa", label: "DAA WebChoices (USA)", url: "https://optout.aboutads.info/", no: "Amerikanske annonsenettverk.", en: "US ad networks." },
  { id: "nai", label: "NAI opt-out (USA)", url: "https://optout.networkadvertising.org/", no: "Flere amerikanske nettverk.", en: "More US networks." },
  { id: "blacklight", label: "Blacklight (The Markup)", url: "https://themarkup.org/blacklight", no: "Se hvilke sporere et nettsted bruker.", en: "See which trackers a website uses." },
];

export const PHONE = [
  { id: "locations", no: "iPhone: skru av «Viktige steder».", en: "iPhone: turn off «Significant Locations».", path: { no: "Innstillinger > Personvern og sikkerhet > Stedstjenester > Systemtjenester > Viktige steder", en: "Settings > Privacy & Security > Location Services > System Services > Significant Locations" } },
  { id: "tracking", no: "iPhone: ikke la apper be om å spore deg.", en: "iPhone: don't let apps ask to track you.", path: { no: "Innstillinger > Personvern og sikkerhet > Sporing", en: "Settings > Privacy & Security > Tracking" } },
  { id: "apple-ads", no: "iPhone: skru av tilpassede annonser fra Apple.", en: "iPhone: turn off Apple personalised ads.", path: { no: "Innstillinger > Personvern og sikkerhet > Apple-reklame", en: "Settings > Privacy & Security > Apple Advertising" } },
  { id: "analytics", no: "iPhone: ikke del analysedata.", en: "iPhone: don't share analytics.", path: { no: "Innstillinger > Personvern og sikkerhet > Analyse og forbedringer", en: "Settings > Privacy & Security > Analytics & Improvements" } },
  { id: "android-ad-id", no: "Android: slett annonse-ID-en.", en: "Android: delete the advertising ID.", path: { no: "Innstillinger > Google > Alle tjenester > Annonser > Slett annonse-ID", en: "Settings > Google > All services > Ads > Delete advertising ID" } },
  { id: "google-activity", no: "Google: ikke lagre tale- og lydaktivitet.", en: "Google: don't save voice and audio activity.", path: { no: "Google-konto > Data og personvern > Nett- og appaktivitet", en: "Google Account > Data & privacy > Web & App Activity" }, url: "https://myactivity.google.com/activitycontrols" },
];
