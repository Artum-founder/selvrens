// Turns the local state into the combined picture: numbers, exposure and a prioritised action list.
import { getState, VIS_FIELDS } from "./store.js";
import { cachedCatalogue, breachesByDomain, dangerous } from "./leaks.js";
import { lookup } from "../data/services.js";
import { tr, fmtYearMonth, fmtDate, fmtNum } from "./util.js";

export const VIS_WEIGHT = { name: 1, photo: 2, bio: 1, location: 3, birthday: 3, work: 2, phone: 4, email: 3, links: 1, posts: 2, network: 2, tagged: 2 };
const MAX_W = Object.values(VIS_WEIGHT).reduce((a, b) => a + b, 0);

export const VIS_LABEL = {
  name: { no: "Fullt navn", en: "Full name" },
  photo: { no: "Ansiktsbilde", en: "Face photo" },
  bio: { no: "Bio / om meg", en: "Bio / about" },
  location: { no: "Bosted eller sted", en: "Home town or location" },
  birthday: { no: "Fødselsdato", en: "Date of birth" },
  work: { no: "Jobb eller skole", en: "Work or school" },
  phone: { no: "Telefonnummer", en: "Phone number" },
  email: { no: "E-postadresse", en: "Email address" },
  links: { no: "Lenker til andre kontoer", en: "Links to other accounts" },
  posts: { no: "Innlegg og bilder", en: "Posts and photos" },
  network: { no: "Venne- eller følgerliste", en: "Friends or followers list" },
  tagged: { no: "Bilder andre har tagget deg i", en: "Photos others tagged you in" },
};

export const accountExposure = (a) => Math.round((VIS_FIELDS.reduce((s, f) => s + (a.vis[f] ? VIS_WEIGHT[f] : 0), 0) / MAX_W) * 100);

const live = (a) => a.status !== "deleted";
const YEARS2 = 2 * 365 * 24 * 3600 * 1000;

export function analyse() {
  const s = getState();
  const accts = s.accounts;
  const cat = cachedCatalogue();
  const byDomain = breachesByDomain(cat);

  const breachedAccts = [];
  for (const a of accts.filter(live)) {
    const list = byDomain.get(a.domain);
    if (list && list.length) breachedAccts.push({ a, breaches: list });
  }

  const groups = new Map();
  for (const a of accts.filter(live)) if (a.reuse) { if (!groups.has(a.reuse)) groups.set(a.reuse, []); groups.get(a.reuse).push(a); }
  const reuseGroups = [...groups.values()].filter((g) => g.length > 1);

  const pwnedAccts = accts.filter((a) => live(a) && a.pwned > 0);
  const toDelete = accts.filter((a) => a.status === "delete");
  const deleted = accts.filter((a) => a.status === "deleted");
  const unreviewed = accts.filter((a) => a.status === "unknown");
  const old = accts.filter((a) => live(a) && a.status === "unknown" && a.lastUsed && Date.now() - new Date(a.lastUsed).getTime() > YEARS2);

  // The combined public picture: a field counts if it is visible on at least one live account.
  const visibleOn = {};
  for (const f of VIS_FIELDS) visibleOn[f] = accts.filter((a) => live(a) && a.vis[f]);
  const combined = Math.round((VIS_FIELDS.reduce((sum, f) => sum + (visibleOn[f].length ? VIS_WEIGHT[f] : 0), 0) / MAX_W) * 100);
  const publicItems = VIS_FIELDS.filter((f) => visibleOn[f].length).length;

  const emailHits = (s.checks.email || []).filter((c) => c.breaches && c.breaches.length);

  return { accts, cat, byDomain, breachedAccts, reuseGroups, pwnedAccts, toDelete, deleted, unreviewed, old, visibleOn, combined, publicItems, emailHits };
}

export function actions(an = analyse()) {
  const out = [];
  const name = (a) => a.service || a.domain;
  const link = (a) => `#/kontoer/${encodeURIComponent(a.id)}`;

  for (const a of an.pwnedAccts) {
    out.push({ lvl: 3, text: tr(`Passordet du brukte hos ${name(a)} finnes i kjente lekkasjer (${fmtNum(a.pwned)} ganger). Bytt det nå, og bruk det aldri igjen.`,
      `The password you used at ${name(a)} appears in known leaks (${fmtNum(a.pwned)} times). Change it now and never use it again.`), href: link(a) });
  }
  for (const g of an.reuseGroups) {
    const names = g.slice(0, 5).map(name).join(", ") + (g.length > 5 ? " …" : "");
    out.push({ lvl: 3, text: tr(`${g.length} kontoer delte samme passord: ${names}. Gi hver konto sitt eget.`, `${g.length} accounts shared one password: ${names}. Give each its own.`), href: link(g[0]) });
  }
  for (const c of an.emailHits) {
    out.push({ lvl: 2, text: tr(`${c.email} finnes i ${c.breaches.length} kjente lekkasjer. Se hvilke, og bytt passord der.`, `${c.email} is in ${c.breaches.length} known leaks. See which, and change those passwords.`), href: "#/lekkasjer" });
  }
  for (const { a, breaches } of an.breachedAccts) {
    const b = breaches[0];
    const pw = breaches.some((x) => dangerous(x.dc));
    if (a.status === "keep" && !pw) continue;
    out.push({ lvl: pw ? 2 : 1, text: tr(`${name(a)} hadde et datainnbrudd (${fmtDate(b.bd)})${pw ? ", der passord eller betalingsdata lakk" : ""}. Bytt passordet og slå på totrinnsinnlogging.`,
      `${name(a)} had a breach (${fmtDate(b.bd)})${pw ? " where passwords or payment data leaked" : ""}. Change the password and turn on two-step login.`), href: link(a) });
  }
  for (const f of ["phone", "birthday", "location", "email"]) {
    const on = an.visibleOn[f];
    if (!on.length) continue;
    const label = tr(VIS_LABEL[f].no, VIS_LABEL[f].en);
    out.push({ lvl: 2, text: tr(`${label} er synlig på ${on.map(name).join(", ")}. Vurder å skjule det.`, `${label} is visible on ${on.map(name).join(", ")}. Consider hiding it.`), href: "#/synlighet" });
  }
  for (const a of an.toDelete) {
    const svc = lookup(a.domain);
    out.push({ lvl: 2, text: tr(`Slett kontoen hos ${name(a)}.`, `Delete your account at ${name(a)}.`), href: link(a), ext: svc.del || "" });
  }
  for (const a of an.old.slice(0, 8)) {
    out.push({ lvl: 1, text: tr(`${name(a)} ble sist brukt ${fmtYearMonth(a.lastUsed)}. Behold eller slett?`, `${name(a)} was last used ${fmtYearMonth(a.lastUsed)}. Keep or delete?`), href: link(a) });
  }
  if (an.unreviewed.length > 3) {
    out.push({ lvl: 1, text: tr(`${an.unreviewed.length} kontoer er ikke gjennomgått ennå. Merk hver som behold, rydd eller slett.`, `${an.unreviewed.length} accounts are not reviewed yet. Mark each as keep, tidy or delete.`), href: "#/kontoer" });
  }
  return out.sort((x, y) => y.lvl - x.lvl);
}

// A safe summary for the SOL border: counts only, no names, logins or domains.
export function summary() {
  const an = analyse();
  return {
    accounts: an.accts.filter(live).length,
    breachedServices: an.breachedAccts.length,
    reusedPasswordGroups: an.reuseGroups.length,
    knownLeakedPasswords: an.pwnedAccts.length,
    markedForDeletion: an.toDelete.length,
    deleted: an.deleted.length,
    unreviewed: an.unreviewed.length,
    publicItems: an.publicItems,
    exposureScore: an.combined,
    emailChecksWithHits: an.emailHits.length,
  };
}
