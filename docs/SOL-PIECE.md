# Selvrens as a SOL piece

SOL is built from "quantum puzzle pieces": flat modules with an electrified border that makes them float on a shared ground. The ground holds the bridges and the rules for how pieces connect (and later, agents that check that everything works). Pieces can stand alone, be held by an elastic bond that only breaks on purpose, reach across to other domains, or join many others as one system. At the bottom is the core.

Selvrens is one such piece. It works fully on its own at selvrens.no, and is ready to float into SOL later.

## The border

The border is declared in [`/sol.piece.json`](../sol.piece.json) (spec `sol-piece/0.1-draft`):

- **ports.out:** `selvrens.summary` (counts only), `selvrens.event` (topic names and counts), `selvrens.pong` (health)
- **ports.in:** `selvrens.ping`, `selvrens.summary.request`, `selvrens.accounts.offer` (two-way only, and the person must accept)
- **shapes:** `Summary`, `Event`, `Health`, `AccountOffer`
- **data.leavesDevice:** every case where something leaves the browser, and when

## Bonds

A bond is a record kept in the piece's local state:

```json
{ "id": "…", "origin": "https://opensol.earth", "direction": "one-way-out", "flows": ["summary"], "state": "bonded", "createdAt": "…" }
```

| Direction | Out | In |
| --- | --- | --- |
| `one-way-out` | summary, events, health (as allowed by `flows`) | nothing |
| `two-way` | as above, plus answers to ping and summary requests | ping, summary requests, account offers (with consent) |
| `pass-through` | reserved: data travelling through Selvrens on its way elsewhere | reserved |

- **Default:** no bonds. Nothing crosses the border.
- **Lift for repair:** a single bond, or all of them, can be lifted. The bond stays, nothing flows, nothing breaks on the other side.
- **Cut:** only an admin can cut a bond, and it asks for the word KUTT or CUT first.
- **Transport:** `window.postMessage` to the exact bonded origin, so messages cannot reach anyone else. It works when Selvrens is framed by, or opened from, the bonded piece. `frame-ancestors` in `vercel.json` allows `opensol.earth`.

## Message envelope

```json
{ "sol": "0.1", "piece": "selvrens", "type": "selvrens.summary", "payload": { "accounts": 42, "exposureScore": 31 } }
```

## Health

`window.SOLPiece.health()` (same origin) and the `selvrens.pong` port return:

```json
{ "piece": "selvrens", "version": "0.1.0", "ok": true, "checks": [ { "id": "storage", "ok": true, "detail": "…" } ] }
```

Checks: storage, crypto, schema, bonds, catalogue. They are written so the ground's checking agents can run them later.

## What stays inside

Account names, logins, domains, notes, visibility checklists and email check results never cross the border. A future SOL core that wants them would need a new port, a two-way bond and the person's explicit consent in Selvrens.
