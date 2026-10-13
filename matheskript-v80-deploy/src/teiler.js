/* ======================================================================
   teiler.js – reine Mathematik für „Teilbarkeitsregeln“ in Mathe entdecken
   (kein React, keine Imports; getestet in tests/teiler.test.mjs).

   Die Regeln und ihre Begründungen:
   · 2, 5   n = 10·A + e. Der Zehnerteil 10·A ist durch 2 und durch 5 teilbar (10 = 2·5), also zählt nur die letzte Ziffer e.
   · 4      n = 100·A + zz. 100 = 4·25, also zählen die letzten zwei Ziffern.
   · 8      n = 1000·A + zzz. 1000 = 8·125, also zählen die letzten drei Ziffern.
   · 3, 9   10 = 9+1, 100 = 99+1, … Jede Stelle liefert ein Vielfaches von 9 (9, 99, 999 …) plus ihre Ziffer.
            Übrig bleibt die Quersumme.
   · 6      6 = 2·3, und 2 und 3 haben keinen gemeinsamen Teiler: durch 2 UND durch 3.
   · 7      n = 10·A + e. Zieht man 21·e (ein Vielfaches von 7) ab, bleibt 10·(A − 2e); die 10 enthält keine 7,
            also kommt es auf A − 2e an.
   ====================================================================== */

/* Reihenfolge im Lernmodul (so wie sie Basti vorgegeben hat) */
export const TEILER_REIHE = [2, 5, 3, 4, 6, 7, 8, 9];
export const TEILER_ANZAHL = TEILER_REIHE.length;
/* Anzahl der „Jetzt du“-Schritte je Regel, in der Reihenfolge von TEILER_REIHE */
export const TEILER_SCHRITTE = [3, 3, 3, 3, 3, 4, 3, 3];

export const teilbar = (n, t) => n % t === 0;
export const ziffern = (n) => String(Math.abs(n)).split("").map(Number);
export const quersumme = (n) => ziffern(n).reduce((s, z) => s + z, 0);
export const minus = (s) => String(s).replace(/-/g, "−");

/* ---------- Endziffern (2, 5: k = 1 · 4: k = 2 · 8: k = 3) ---------- */
/* n = vorne · 10^k + ende */
export function endzerlegung(n, k) {
  const p = 10 ** k;
  return { vorne: Math.floor(n / p), ende: n % p, p };
}
/* Wie viele Endziffern entscheiden bei t? */
export const ENDZIFFERN = { 2: 1, 5: 1, 4: 2, 8: 3 };
/* 10^k = t · m */
export const hilfsFaktor = (t) => 10 ** ENDZIFFERN[t] / t;

/* ---------- Quersumme (3, 9) ----------
   Jede Ziffer z an der Stelle mit Wert p: z·p = z·(p−1) + z.  p−1 ist 9, 99, 999 … (Vielfache von 9). */
export function neunerZerlegung(n) {
  const zs = ziffern(n);
  const zeilen = [];
  zs.forEach((z, i) => {
    const p = 10 ** (zs.length - 1 - i);
    zeilen.push({ ziffer: z, stelle: p, neuner: z * (p - 1), rest: z });
  });
  const neunerSumme = zeilen.reduce((s, r) => s + r.neuner, 0);
  return { zeilen, neunerSumme, quersumme: quersumme(n) };
}

/* ---------- Siebener-Verfahren ----------
   n = 10·A + e  →  n − 21·e = 10·(A − 2e). Weiter mit |A − 2e|, bis die Zahl kleiner als 100 ist. */
export function siebenerKette(n) {
  const schritte = [];
  let m = Math.abs(n);
  let sicher = 0;
  while (m >= 100 && sicher++ < 20) {
    const A = Math.floor(m / 10), e = m % 10;
    const ergebnis = A - 2 * e;
    schritte.push({ n: m, A, e, abgezogen: 21 * e, rest: m - 21 * e, ergebnis });
    m = Math.abs(ergebnis);
  }
  const endwert = m;
  return { schritte, endwert, ok: endwert % 7 === 0, faktor: endwert / 7 };
}

/* ---------- Begründung für eine einzelne Zahl (Quiz-Rückmeldung) ---------- */
export function erklaerung(n, t) {
  const ok = n % t === 0;
  const s = String(n);
  let text = "";
  if (t === 2 || t === 5) {
    const e = n % 10;
    text = t === 2
      ? `Letzte Ziffer ${e} – ${e % 2 === 0 ? "gerade" : "ungerade"}.`
      : `Letzte Ziffer ${e} – ${e === 0 || e === 5 ? "0 oder 5" : "weder 0 noch 5"}.`;
  } else if (t === 3 || t === 9) {
    const q = quersumme(n);
    const rechnung = `${ziffern(n).join(" + ")} = ${q}`;
    text = q % t === 0
      ? `Quersumme ${rechnung}, und ${q} = ${t} · ${q / t}.`
      : `Quersumme ${rechnung}, und ${q} ist nicht durch ${t} teilbar${t === 9 && q % 3 === 0 ? " (nur durch 3)" : ""}.`;
  } else if (t === 4 || t === 8) {
    const k = t === 4 ? 2 : 3;
    const { ende } = endzerlegung(n, k);
    const anz = String(ende).padStart(Math.min(k, s.length), "0");
    const vorsatz = `Letzte ${k === 2 ? "zwei" : "drei"} Ziffern: ${anz}${anz !== String(ende) ? ` (also ${ende})` : ""}`;
    text = ende % t === 0
      ? `${vorsatz}. ${ende} = ${t} · ${ende / t}.`
      : `${vorsatz}. ${ende} : ${t} = ${Math.floor(ende / t)} Rest ${ende % t}.`;
  } else if (t === 6) {
    const e = n % 10, q = quersumme(n);
    const zwei = e % 2 === 0, drei = q % 3 === 0;
    const a = `Durch 2: ${zwei ? "ja" : "nein"} (letzte Ziffer ${e}).`;
    const b = `Durch 3: ${drei ? "ja" : "nein"} (Quersumme ${q}).`;
    text = `${a} ${b} ${zwei && drei ? "Beides trifft zu." : zwei ? "Die 3 fehlt." : drei ? "Die 2 fehlt." : "Beides fehlt."}`;
  } else if (t === 7) {
    const k = siebenerKette(n);
    if (!k.schritte.length) text = `${n} ${k.ok ? `= 7 · ${k.faktor}` : `liegt zwischen 7 · ${Math.floor(n / 7)} und 7 · ${Math.floor(n / 7) + 1}`}.`;
    else {
      const kette = k.schritte.map((st) => `${st.A} − 2 · ${st.e} = ${minus(st.ergebnis)}`).join(" → ");
      text = `${kette}. ${k.endwert} ${k.ok ? `= 7 · ${k.faktor}` : "ist kein Vielfaches von 7"}.`;
    }
  }
  return { ok, text: minus(text) };
}

/* ---------- Quiz ---------- */
export const STUFEN = [
  { id: 0, name: "bis 100", lo: 10, hi: 99 },
  { id: 1, name: "bis 1 000", lo: 100, hi: 999 },
  { id: 2, name: "bis 10 000", lo: 1000, hi: 9999 },
];

/* Größere echte Teiler, deren Vielfache als „Fallen“ dienen: Zahlen, die fast passen, aber nicht ganz.
   4 → gerade Zahlen · 8 → Vielfache von 4 · 9 → Vielfache von 3 · 6 → Vielfache von 2 und von 3 */
export const FALLEN = { 4: [2], 6: [2, 3], 8: [4], 9: [3] };

const ganzZufall = (zufall, lo, hi) => lo + Math.floor(zufall() * (hi - lo + 1));
const mischen = (liste, zufall) => {
  const a = liste.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(zufall() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/* Eine Runde: neun verschiedene Zahlen, zwei bis fünf davon durch t teilbar. */
export function rundeErzeugen(t, stufe = 1, zufall = Math.random) {
  const { lo, hi } = STUFEN[stufe] || STUFEN[1];
  const kLo = Math.ceil(lo / t), kHi = Math.floor(hi / t);
  const benutzt = new Set();
  const frei = (n) => n >= lo && n <= hi && !benutzt.has(n);
  const nimm = (n) => { benutzt.add(n); return n; };

  const anzahlRichtig = ganzZufall(zufall, 2, 5);
  const zahlen = [];
  for (let i = 0, v = 0; i < anzahlRichtig && v < 500; v++) {
    const n = t * ganzZufall(zufall, kLo, kHi);
    if (frei(n)) { zahlen.push({ n: nimm(n), ja: true }); i++; }
  }
  const nein = 9 - zahlen.length;
  const fallenTeiler = FALLEN[t] || [];
  const wunschFallen = fallenTeiler.length ? Math.min(nein, fallenTeiler.length > 1 ? 3 : 2) : 0;
  let gesetzt = 0;
  for (let v = 0; gesetzt < wunschFallen && v < 500; v++) {
    const d = fallenTeiler[gesetzt % fallenTeiler.length];
    const n = d * ganzZufall(zufall, Math.ceil(lo / d), Math.floor(hi / d));
    if (frei(n) && n % t !== 0) { zahlen.push({ n: nimm(n), ja: false }); gesetzt++; }
  }
  for (let v = 0; zahlen.length < 9 && v < 2000; v++) {
    const o = ganzZufall(zufall, 1, t - 1);
    const n = t * ganzZufall(zufall, Math.max(0, kLo - 1), kHi) + o;
    if (frei(n) && n % t !== 0) zahlen.push({ n: nimm(n), ja: false });
  }
  for (let n = lo; zahlen.length < 9 && n <= hi; n++) if (frei(n) && n % t !== 0) zahlen.push({ n: nimm(n), ja: false });
  return { teiler: t, stufe, zahlen: mischen(zahlen, zufall) };
}

/* Welche Teilbarkeit kommt als Nächstes? Aus einem „Beutel“ ziehen, damit bei mehreren Teilern jeder dran kommt. */
export function naechsterTeiler(auswahl, beutel, letzter, zufall = Math.random) {
  if (auswahl.length === 1) return { t: auswahl[0], beutel: [] };
  let b = beutel.filter((x) => auswahl.includes(x));
  if (!b.length) {
    b = mischen(auswahl, zufall);
    if (b[0] === letzter) { const j = 1 + Math.floor(zufall() * (b.length - 1)); [b[0], b[j]] = [b[j], b[0]]; }
  }
  return { t: b[0], beutel: b.slice(1) };
}

/* Auswertung einer Runde: markiert = Menge der angetippten Zahlen */
export function auswerten(runde, markiert) {
  const zellen = runde.zahlen.map((z) => {
    const an = markiert.has(z.n);
    return { ...z, an, status: z.ja && an ? "richtig" : z.ja && !an ? "uebersehen" : !z.ja && an ? "falsch" : "frei" };
  });
  const fehler = zellen.filter((z) => z.status === "uebersehen" || z.status === "falsch").length;
  return { zellen, fehler, perfekt: fehler === 0 };
}
