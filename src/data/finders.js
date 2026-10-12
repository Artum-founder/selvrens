// Ways to find yourself: search links built from your own details, inbox searches that surface
// forgotten sign-ups, and the pages that list apps you signed in to with another account.
// Nothing is fetched by Selvrens: these are links you open yourself.

const q = encodeURIComponent;
const quoted = (s) => `"${s}"`;

export function nameSearches(name) {
  const n = quoted(name);
  return [
    { g: "web", label: "Google", url: `https://www.google.com/search?q=${q(n)}` },
    { g: "web", label: "Google Bilder / Images", url: `https://www.google.com/search?tbm=isch&q=${q(n)}` },
    { g: "web", label: "Bing", url: `https://www.bing.com/search?q=${q(n)}` },
    { g: "web", label: "DuckDuckGo", url: `https://duckduckgo.com/?q=${q(n)}` },
    { g: "no", label: "1881", url: `https://duckduckgo.com/?q=${q(`site:1881.no ${n}`)}` },
    { g: "no", label: "Gulesider", url: `https://duckduckgo.com/?q=${q(`site:gulesider.no ${n}`)}` },
    { g: "no", label: "180.no", url: `https://duckduckgo.com/?q=${q(`site:180.no ${n}`)}` },
    { g: "no", label: "Proff", url: `https://duckduckgo.com/?q=${q(`site:proff.no ${n}`)}` },
    { g: "no", label: "FINN", url: `https://duckduckgo.com/?q=${q(`site:finn.no ${n}`)}` },
    { g: "social", label: "Facebook", url: `https://www.google.com/search?q=${q(`site:facebook.com ${n}`)}` },
    { g: "social", label: "LinkedIn", url: `https://www.google.com/search?q=${q(`site:linkedin.com ${n}`)}` },
    { g: "social", label: "Instagram", url: `https://www.google.com/search?q=${q(`site:instagram.com ${n}`)}` },
    { g: "docs", label: "PDF", url: `https://www.google.com/search?q=${q(`${n} filetype:pdf`)}` },
  ];
}

export const valueSearches = (v) => [
  { label: "Google", url: `https://www.google.com/search?q=${q(quoted(v))}` },
  { label: "Bing", url: `https://www.bing.com/search?q=${q(quoted(v))}` },
  { label: "DuckDuckGo", url: `https://duckduckgo.com/?q=${q(quoted(v))}` },
];

// Profile addresses for one username. Opening them shows whether the name is taken, and by whom.
export const PROFILE_SITES = [
  ["Instagram", "instagram.com", (u) => `https://www.instagram.com/${u}/`],
  ["Facebook", "facebook.com", (u) => `https://www.facebook.com/${u}`],
  ["X", "x.com", (u) => `https://x.com/${u}`],
  ["TikTok", "tiktok.com", (u) => `https://www.tiktok.com/@${u}`],
  ["Threads", "threads.net", (u) => `https://www.threads.net/@${u}`],
  ["YouTube", "youtube.com", (u) => `https://www.youtube.com/@${u}`],
  ["LinkedIn", "linkedin.com", (u) => `https://www.linkedin.com/in/${u}`],
  ["Pinterest", "pinterest.com", (u) => `https://www.pinterest.com/${u}/`],
  ["Reddit", "reddit.com", (u) => `https://www.reddit.com/user/${u}`],
  ["Tumblr", "tumblr.com", (u) => `https://${u}.tumblr.com`],
  ["GitHub", "github.com", (u) => `https://github.com/${u}`],
  ["SoundCloud", "soundcloud.com", (u) => `https://soundcloud.com/${u}`],
  ["Spotify", "spotify.com", (u) => `https://open.spotify.com/user/${u}`],
  ["Twitch", "twitch.tv", (u) => `https://www.twitch.tv/${u}`],
  ["Vimeo", "vimeo.com", (u) => `https://vimeo.com/${u}`],
  ["Medium", "medium.com", (u) => `https://medium.com/@${u}`],
  ["Behance", "behance.net", (u) => `https://www.behance.net/${u}`],
  ["Dribbble", "dribbble.com", (u) => `https://dribbble.com/${u}`],
  ["Flickr", "flickr.com", (u) => `https://www.flickr.com/people/${u}/`],
  ["Telegram", "telegram.org", (u) => `https://t.me/${u}`],
  ["Snapchat", "snapchat.com", (u) => `https://www.snapchat.com/add/${u}`],
  ["Bluesky", "bsky.app", (u) => `https://bsky.app/profile/${u}.bsky.social`],
  ["Patreon", "patreon.com", (u) => `https://www.patreon.com/${u}`],
  ["Wayback", "web.archive.org", (u) => `https://web.archive.org/web/*/instagram.com/${u}*`],
];

// Gmail search strings that surface old sign-ups. Paste into your mail search.
export const INBOX_QUERIES = [
  { no: "Velkomst-e-poster", en: "Welcome emails", q: 'subject:(welcome OR velkommen OR "thanks for signing up" OR "takk for at du registrerte")' },
  { no: "Bekreft e-post", en: "Confirm your email", q: 'subject:("verify your email" OR "confirm your email" OR "bekreft e-post" OR "bekreft e-postadressen")' },
  { no: "Ny konto opprettet", en: "Account created", q: '"your account" (created OR registered) OR "kontoen din er opprettet"' },
  { no: "Passord tilbakestilt", en: "Password resets", q: 'subject:("reset your password" OR "password reset" OR "tilbakestill passord")' },
  { no: "Nye innlogginger", en: "New sign-ins", q: 'subject:("new sign-in" OR "new login" OR "ny pålogging" OR "ny innlogging")' },
  { no: "Nyhetsbrev (avslør tjenester)", en: "Newsletters (reveal services)", q: "unsubscribe OR avmeld" },
];

// Where to see apps and sites you signed in to with another account.
export const CONNECTED = [
  { label: "Google: tredjepartstilkoblinger / third-party connections", url: "https://myaccount.google.com/connections" },
  { label: "Google: lagrede passord / saved passwords", url: "https://passwords.google.com/" },
  { label: "Facebook: apper og nettsteder / apps and websites", url: "https://www.facebook.com/settings?tab=applications" },
  { label: "Microsoft: apper med tilgang / apps with access", url: "https://account.live.com/consent/Manage" },
  { label: "GitHub: autoriserte apper / authorized apps", url: "https://github.com/settings/applications" },
  { label: "X: tilkoblede apper / connected apps", url: "https://x.com/settings/connected_apps" },
];

export const EXPORT_HELP = [
  { app: "Chrome / Edge / Google", no: "Innstillinger, Passord, Eksporter passord (CSV).", en: "Settings, Passwords, Export passwords (CSV)." },
  { app: "Firefox", no: "Passord (about:logins), ⋯, Eksporter. Firefox tar med når kontoen sist ble brukt.", en: "Passwords (about:logins), ⋯, Export. Firefox includes when each login was last used." },
  { app: "Apple Passwords", no: "Passord-appen på Mac: Fil, Eksporter alle passord.", en: "Passwords app on Mac: File, Export All Passwords." },
  { app: "Bitwarden", no: "Verktøy, Eksporter hvelv, .csv.", en: "Tools, Export vault, .csv." },
  { app: "1Password", no: "Fil, Eksporter, CSV.", en: "File, Export, CSV." },
  { app: "Proton Pass / LastPass / Dashlane / KeePass", no: "Eksport til CSV fra innstillingene.", en: "Export to CSV from settings." },
];
