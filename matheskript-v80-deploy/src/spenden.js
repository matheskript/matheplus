/* ======================================================================
   Spenden für die KI-Kosten – reine Logik (ohne React, testbar mit Node).
   Einziger Zahlungseingang der Seite: freiwillig, ohne Gegenleistung.
   Karte: funcSpenden.jsx (im Elternkonto). Alle Zahlungsdaten NUR hier eintragen.

   Eintragen (leer = Weg erscheint als „Link folgt“, nichts wird erfunden):
   - paypal.name   → Teil hinter paypal.me/ (z. B. "bastiblumenroether")
   - kofi.name     → Teil hinter ko-fi.com/
   - karte.link    → Stripe-Zahlungslink (Karte, Apple/Google Pay), sobald Stripe steht
   - sepa.iban / sepa.empfaenger → Überweisung
   ====================================================================== */

export const SPENDEN = {
  betraege: [10, 20, 50, 100],
  vorgewaehlt: 20,
  zweck: "Mythos Mathe – KI-Kosten",
  paypal: { name: "" },
  kofi: { name: "" },
  karte: { link: "" },
  sepa: { iban: "", empfaenger: "" },
};

export const euro = (b) => `${b} €`;

export const betragOk = (b, cfg = SPENDEN) => Number.isInteger(b) && cfg.betraege.includes(b);

const NAME_OK = /^[A-Za-z0-9._-]{2,60}$/;
const LINK_OK = /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[^\s]*)?$/i;

export function paypalLink(name, betrag) {
  if (!NAME_OK.test(name || "") || !Number.isInteger(betrag) || betrag < 1) return null;
  return `https://www.paypal.com/paypalme/${name}/${betrag}EUR`;
}

export function kofiLink(name) {
  return NAME_OK.test(name || "") ? `https://ko-fi.com/${name}` : null;
}

export function kartenLink(link) {
  return LINK_OK.test(link || "") ? link : null;
}

/* Grobe IBAN-Prüfung (Länge, Zeichen, Prüfziffer mod 97) */
export function ibanOk(iban) {
  const s = String(iban || "").replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
  const umgestellt = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rest = 0;
  for (const z of umgestellt) rest = (rest * 10 + Number(z)) % 97;
  return rest === 1;
}

export const ibanAnzeige = (iban) => String(iban || "").replace(/\s+/g, "").toUpperCase().replace(/(.{4})/g, "$1 ").trim();

/* Die vier Wege in fester Reihenfolge: PayPal zuerst, dann drei Vorschläge.
   art "link"  → href (neues Fenster)
   art "text"  → Kontodaten zum Kopieren
   bereit false → Knopf gesperrt, Hinweis „Link folgt“ */
export function wege(betrag, cfg = SPENDEN) {
  const pp = paypalLink(cfg.paypal.name, betrag);
  const kofi = kofiLink(cfg.kofi.name);
  const karte = kartenLink(cfg.karte.link);
  const sepaBereit = ibanOk(cfg.sepa.iban) && !!String(cfg.sepa.empfaenger || "").trim();
  return [
    { id: "paypal", name: "PayPal", zeile: "Betrag ist schon eingetragen", art: "link", href: pp, bereit: !!pp, empfohlen: true },
    { id: "karte", name: "Karte · Apple Pay · Google Pay", zeile: "Sicher über Stripe, Betrag frei wählbar", art: "link", href: karte, bereit: !!karte },
    { id: "kofi", name: "Ko-fi", zeile: "Wie ein Kaffee für die Seite, Betrag frei wählbar", art: "link", href: kofi, bereit: !!kofi },
    { id: "sepa", name: "Überweisung (SEPA)", zeile: "Ohne Zwischenanbieter", art: "text", href: null, bereit: sepaBereit,
      iban: sepaBereit ? ibanAnzeige(cfg.sepa.iban) : "", empfaenger: cfg.sepa.empfaenger || "", verwendung: `${cfg.zweck} (${euro(betrag)})` },
  ];
}

export const mindestensEinWeg = (cfg = SPENDEN) => wege(cfg.vorgewaehlt, cfg).some((w) => w.bereit);
