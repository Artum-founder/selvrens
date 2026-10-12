// Where to see every app and site you signed in to with another account ("Sign in with Google" and friends).
// Menu names are translated; on a Norwegian phone the wording can differ slightly.
export const SIGNIN = [
  {
    id: "google", name: "Google", domain: "google.com",
    url: "https://myaccount.google.com/linkedapps?filters=4",
    steps: {
      no: ["Trykk «Åpne» og logg inn på Google-kontoen din.", "Listen viser alle apper og nettsteder du har brukt «Logg inn med Google» på.", "Skriv navnene inn i feltet under. Trykk på en app hos Google for å se detaljer eller slutte å bruke den."],
      en: ["Press «Open» and sign in to your Google account.", "The list shows every app and site where you used «Sign in with Google».", "Type the names into the box below. Click an app at Google to see details or stop using it."],
    },
    more: { no: "Viktig: «Slutt å bruke Logg inn med Google» sletter ikke kontoen i appen. Den må slettes i appen selv. Vil du se alle koblinger, også apper som bare har tilgang til data, fjern filteret øverst på siden.", en: "Important: «Stop using Sign in with Google» does not delete your account in the app. That has to be deleted in the app itself. To see every link, including apps that only have data access, remove the filter at the top of the page." },
  },
  {
    id: "apple", name: "Apple", domain: "apple.com",
    url: "https://account.apple.com/",
    steps: {
      no: ["iPhone eller iPad: Innstillinger > navnet ditt > Logg på med Apple.", "Mac: Apple-menyen > Systeminnstillinger > navnet ditt > Logg på med Apple.", "På nettet: logg inn, velg Pålogging og sikkerhet, så Logg på med Apple."],
      en: ["iPhone or iPad: Settings > your name > Sign in with Apple.", "Mac: Apple menu > System Settings > your name > Sign in with Apple.", "On the web: sign in, choose Sign-In & Security, then Sign in with Apple."],
    },
    more: { no: "Brukte du «Skjul e-postadressen min»? Listen under iCloud viser hvilke apper som fikk en skjult adresse.", en: "Used «Hide My Email»? The list under iCloud shows which apps got a hidden address." },
  },
  {
    id: "microsoft", name: "Microsoft", domain: "microsoft.com",
    url: "https://microsoft.com/consent",
    steps: {
      no: ["Trykk «Åpne» og logg inn med Microsoft-kontoen (Outlook, Hotmail, Xbox, Skype).", "Listen viser apper og tjenester du har gitt tilgang til kontoen din.", "Skriv navnene inn i feltet under."],
      en: ["Press «Open» and sign in with your Microsoft account (Outlook, Hotmail, Xbox, Skype).", "The list shows apps and services you have given access to your account.", "Type the names into the box below."],
    },
  },
  {
    id: "facebook", name: "Facebook", domain: "facebook.com",
    url: "https://www.facebook.com/settings?tab=applications",
    steps: {
      no: ["Trykk «Åpne» og logg inn på Facebook.", "Du ser apper og nettsteder du har logget inn på med Facebook. Sjekk både aktive, utløpte og fjernede.", "Skriv navnene inn i feltet under."],
      en: ["Press «Open» and sign in to Facebook.", "You see apps and sites you signed in to with Facebook. Check active, expired and removed ones.", "Type the names into the box below."],
    },
  },
  {
    id: "x", name: "X (Twitter)", domain: "x.com",
    url: "https://x.com/settings/connected_apps",
    steps: {
      no: ["Trykk «Åpne» og logg inn på X.", "Listen viser tilkoblede apper.", "Skriv navnene inn i feltet under."],
      en: ["Press «Open» and sign in to X.", "The list shows connected apps.", "Type the names into the box below."],
    },
  },
  {
    id: "github", name: "GitHub", domain: "github.com",
    url: "https://github.com/settings/applications",
    steps: {
      no: ["Trykk «Åpne» og logg inn på GitHub.", "Se både «Authorized OAuth Apps» og «Authorized GitHub Apps».", "Skriv navnene inn i feltet under."],
      en: ["Press «Open» and sign in to GitHub.", "Look at both «Authorized OAuth Apps» and «Authorized GitHub Apps».", "Type the names into the box below."],
    },
  },
  {
    id: "spotify", name: "Spotify", domain: "spotify.com",
    url: "https://www.spotify.com/account/apps/",
    steps: {
      no: ["Trykk «Åpne» og logg inn på Spotify.", "Listen viser apper som har tilgang til Spotify-kontoen din.", "Skriv navnene inn i feltet under."],
      en: ["Press «Open» and sign in to Spotify.", "The list shows apps with access to your Spotify account.", "Type the names into the box below."],
    },
  },
  {
    id: "discord", name: "Discord", domain: "discord.com",
    url: "",
    steps: {
      no: ["Åpne Discord.", "Brukerinnstillinger > Autoriserte apper.", "Skriv navnene inn i feltet under."],
      en: ["Open Discord.", "User Settings > Authorized Apps.", "Type the names into the box below."],
    },
  },
];

// Plain words that find sign-ups in any mail program (Outlook, iCloud, Proton and others).
export const MAIL_WORDS = {
  no: ["velkommen", "bekreft e-post", "bekreft kontoen", "kontoen din er opprettet", "tilbakestill passord", "ny pålogging", "avmeld"],
  en: ["welcome", "verify your email", "confirm your account", "account created", "reset your password", "new sign-in", "unsubscribe"],
};
