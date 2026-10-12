# What came from the Manus build

The first SelvRens was a Manus project (8 to 13 June 2025). It produced a 13-part concept and a React, Vite and Tailwind site deployed in four versions on manus.space. The newest was `splghnbr.manus.space`.

This repository is a rebuild from scratch around a wider idea: map your whole digital identity (every account, every leak, everything you show in public), not only remove data. These parts of the Manus build were carried over or kept in spirit:

| From Manus | Where it lives now |
| --- | --- |
| Manifesto line «SelvRens er ikke en app. Det er en frigjøringsmekanisme.» and the three promises | Front page (`src/pieces/kart.js`) |
| Zero-storage principle | The whole app: local-only state, no accounts, no cookies |
| Pwned Passwords k-anonymity check | `src/core/leaks.js`, used for single passwords and during import |
| Letter templates: GDPR art. 17 erasure, Google removal, image removal, account deletion | `src/data/templates.js` (tightened, Norwegian and English, plus a new GDPR art. 15 access request) |
| Guided deletion modules (Google, images, contact details, social media) | `src/data/guides.js` (rewritten with concrete steps and links, plus Norwegian directories, old accounts and data brokers) |
| Ad opt-out links (Your Online Choices, DAA, NAI, Meta, X, Google, Microsoft, Blacklight) | `src/data/optout.js` |
| Resource links (Datatilsynet, Have I Been Pwned, Slettmeg.no) | Guides and the Leaks page |

Left behind on purpose:

- **The DeHashed check.** It needs a paid key and a proxy that was never built. Email checks now go through XposedOrNot (free) and Have I Been Pwned (when a key is set).
- **The simulated email-domain check.** It returned made-up results.
- **The visibility questionnaire.** It is replaced by a per-account checklist that adds up into one combined picture.
