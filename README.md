# Selvrens

**Se hele ditt digitale jeg.** Selvrens kartlegger kontoene dine, hvor dataene dine har lekket, og hva du viser av deg selv på nett. Så hjelper den deg å rydde. Ingen konto, ingen sporing, alt lagres bare i din egen nettleser.

**See your whole digital self.** Selvrens maps your accounts, where your data has leaked, and what you show of yourself online, then helps you clean up. No account, no tracking, everything stays in your own browser.

Live: https://selvrens.no

## How it works

Kart (the start page) shows one path with one «Next step» button, so nobody has to guess what to do:

1. Find your accounts
2. Check for leaks
3. See what you show
4. Decide for each account (keep, tidy, delete)
5. Clean up
6. Get your data (optional)

Every page opens with a short «How to do it» box with the three things to do there.

## The pieces

| Piece | What it does |
| --- | --- |
| **1 Kontoer** (Accounts) | Four ways to find your accounts: the «Sign in with Google / Apple / Microsoft / Facebook / X / GitHub / Spotify / Discord» pages (step-by-step, with a box to paste what you find), a CSV from your password manager (Chrome, Firefox, Apple, Bitwarden, 1Password, Proton Pass, LastPass, Dashlane, KeePass), ready inbox searches for welcome and sign-up emails, or by hand. Mark each account keep, tidy or delete. |
| **2 Lekkasjer** (Leaks) | Matches your accounts against the public catalogue of known breaches, checks email addresses (free via XposedOrNot, official via Have I Been Pwned when a key is set), and checks passwords with k-anonymity. The sites an email was leaked from can be added to your account list with one click, since a leak proves you had an account there. |
| **3 Synlighet** (Visibility) | Search links for your names, usernames, emails and phone numbers (search engines, Norwegian directories, profile addresses on 20+ platforms, the Wayback Machine), plus a checklist per account of what a stranger can see. Adds it all up into one combined picture. |
| **4 Dine data** (Your data) | Direct links to request a copy of your data from Google Takeout, Meta, Apple, Microsoft, X, LinkedIn, TikTok, Snapchat, Spotify, Amazon, Netflix, Reddit and GitHub, with how long each takes and what to look for in the files. |
| **5 Rens** (Clean up) | Step-by-step guides, GDPR letters (erasure, access, account deletion, search and image removal), ad opt-outs and phone privacy settings. |
| **Hvorfor** (Why) | Why this still matters in the age of AI: a profile of you already exists, but you can choose how you are seen from now on. Includes the opt-outs from AI training at Meta, LinkedIn, X, Google Gemini, ChatGPT, Claude and PimEyes. |
| **Kart** (Map) | The start page: the path above, a map of every account by category and risk, and a prioritised list of what to do first. |

No service can list every site you ever signed up for. Selvrens gets close by combining the five sources that together cover almost everything: sign-in-with lists, your password manager, your inbox, leak lists and your data downloads.

## Privacy, exactly

Everything is stored in the browser's `localStorage`. You can export it (optionally locked with a passphrase, AES-GCM) and erase it with one click. Only these things ever leave the browser, and only when you start them:

- **Password checks:** the first 5 characters of a SHA-1 hash go to `api.pwnedpasswords.com`. The password never leaves.
- **Password-manager import:** passwords are read in memory to check them and to find reused ones, then dropped. Only a leak count and a random group label are kept.
- **Email checks:** the address goes through `/api/xon-email` (XposedOrNot) or `/api/hibp-email` (Have I Been Pwned). The server does not log or store it.
- **Breach catalogue:** `/api/breaches` fetches the public list of breaches. Nothing personal is sent.

No cookies, no analytics, no third-party scripts or fonts. A strict Content Security Policy is set in `vercel.json`.

### Why no crawler for leak sites

Downloading and searching leaked password dumps means handling stolen data about millions of people. Breach-notification services (Have I Been Pwned, XposedOrNot, Mozilla Monitor) already index those leaks responsibly, so Selvrens builds on them instead.

## A SOL piece

Selvrens is standalone, and also built as a puzzle piece for SOL: it declares its border in [`sol.piece.json`](sol.piece.json) (ports, data shapes, bond directions) and implements it in [`src/sol/border.js`](src/sol/border.js). With no bonds, nothing flows. An admin can bond it to another origin (one-way out, two-way or pass-through), lift a bond for repair without breaking it, or cut it on purpose. Only counts ever cross the border, never names, logins or domains. See [docs/SOL-PIECE.md](docs/SOL-PIECE.md).

## Run it

No build step and no dependencies. Serve the folder:

```
python3 -m http.server 8080
```

The `/api` functions run on Vercel (Node 20+). Locally the leak checks that need them show a friendly error.

### Turn on the official Have I Been Pwned email check

Buy a key at https://haveibeenpwned.com/API/Key and add it to the Vercel project as the environment variable `HIBP_API_KEY`. Until then `/api/hibp-email` answers `{ "enabled": false }` and the button explains it.

## Structure

```
index.html, styles.css, favicon.svg
sol.piece.json          the piece's border (manifest)
src/app.js              shell and router
src/core/               store (local state), bus, csv, leaks, analysis, vault (export), util
src/pieces/             kart, kontoer, lekkasjer, synlighet, data, rens, hvorfor, innstillinger
src/data/               services (delete pages), signin, download, ai, templates, guides, finders, optout
src/sol/border.js       bonds, health, postMessage ports
api/                    breaches, xon-email, hibp-email (Vercel functions)
docs/                   SOL-PIECE.md, FROM-MANUS.md
```

## Credits

Breach data: [Have I Been Pwned](https://haveibeenpwned.com/) (CC BY 4.0) and [XposedOrNot](https://xposedornot.com/). Password checks: [Pwned Passwords](https://haveibeenpwned.com/Passwords).

The idea and the first concept come from Peder Schartum Thorbjørnsen (Artum). The first prototype was built with Manus in June 2025; this is a rebuild from scratch. See [docs/FROM-MANUS.md](docs/FROM-MANUS.md).

## License

Copyright (C) 2026 Peder Schartum Thorbjørnsen (Artum).

Selvrens is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License, version 3, as published by the Free Software Foundation. See [LICENSE](LICENSE). If you run a modified version as a web service, you must offer its source code to the people who use it.
