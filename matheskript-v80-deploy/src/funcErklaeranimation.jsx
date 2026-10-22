import React, { useState, useRef, useEffect, useId } from "react";
import { C } from "./base1.jsx";
import { zw } from "./ui2.jsx";
import { DREHBUCH, ENDEN, FOLGERUNG, PAAR_ZEIT, WURZEL_BEISPIELE, WURZEL_PAARE, WURZEL_START, drehbuchZeit, gz, wurzelBeschreibung, wurzelInfo, wurzelSchritte, wurzelZeiten } from "./wurzelMotion.js";

/* ======================================================================
   ERKLÄRANIMATION
   Aufklappbarer Baustein (Pfeil nach unten) mit einer kurzen, schrittweisen
   Animation. Gleicher Player für alle Szenen:
     · Abspielen/Pause, Schritt-Knöpfe, Zeitleiste zum Hin- und Herziehen
     · Beschriftung wechselt mit dem Schritt
     · bei „Bewegung reduzieren“ startet nichts von allein
   Szenen: "produkt" (Produktregel am Rechteck), "kette" (Kettenregel als
   Verstärkerkette), "stamm" (Stammfunktion: Ableiten rückwärts), "integral"
   (bestimmtes Integral: Streifen und Hauptsatz), "wurzel" (Wurzel aus
   vierstelligen Quadratzahlen, knapp zwei Minuten: 1² unten bis 10² oben, daneben die Zehnerquadrate,
   letzte Ziffern, dann „zwischen welchen Zehnerquadraten?“ – Logik in wurzelMotion.js).
   ====================================================================== */

/* ---------- Zeit-Hilfen ---------- */
const klemm = (x, a, b) => Math.min(b, Math.max(a, x));
const weich = (p) => p * p * (3 - 2 * p);
/* 0 → 1 zwischen den Zeitpunkten a und b, mit sanftem Anlauf */
const lauf = (t, a, b) => weich(klemm((t - a) / (b - a), 0, 1));

const FONT = "inherit";
const T = (props) => <text fontFamily={FONT} {...props} />;

/* ======================================================================
   SZENE 1 · Produktregel am Rechteck
   ====================================================================== */
const PRODUKT_SCHRITTE = [
  { von: 0, text: "Das Produkt u · v ist die Fläche eines Rechtecks mit den Seiten u und v. Die Frage der Produktregel: Wie ändert sich diese Fläche, wenn sich x ein kleines Stück ändert?" },
  { von: 4.2, text: "Wächst x um ein kleines Δx, wird u um Δu = u′ · Δx länger. Rechts kommt ein Streifen dazu: Höhe v, Breite Δu. Seine Fläche ist u′ · v · Δx." },
  { von: 8.2, text: "Gleichzeitig wird v um Δv = v′ · Δx höher. Oben kommt ein zweiter Streifen dazu: Breite u, Höhe Δv. Seine Fläche ist u · v′ · Δx." },
  { von: 12.2, text: "In der Ecke bleibt ein Mini-Rechteck Δu · Δv. Es ist doppelt klein (es enthält Δx zweimal). Teilst du durch Δx und lässt Δx gegen 0 gehen, verschwindet es." },
  { von: 16.8, text: "Übrig bleiben genau die beiden Streifen. Deshalb ist die Ableitung eines Produkts eine Summe aus zwei Beiträgen: erst u ändert sich, dann v." },
];

function produktZeichne(t) {
  const X0 = 44, YB = 214, U = 170, V = 112, DU = 58, DV = 42;
  const wachs = lauf(t, 0, 1.6);
  const beschr = lauf(t, 1.4, 2.4);
  const flaeche = lauf(t, 2.4, 3.4);
  const s1 = lauf(t, 4.6, 6.4);
  const s1text = lauf(t, 5.8, 6.8);
  const s2 = lauf(t, 8.6, 10.4);
  const s2text = lauf(t, 9.8, 10.8);
  const ecke = lauf(t, 12.4, 13.6) * (1 - lauf(t, 14.6, 16.2));
  const eckeText = lauf(t, 12.8, 13.8) * (1 - lauf(t, 15.4, 16.4));
  const formel = lauf(t, 17.2, 18.4);
  const beispiel = lauf(t, 19.4, 20.8);
  const gx = X0 + U, gy = YB - V - DV; // Ecke rechts oben
  const ec = ecke;
  return (
    <g>
      {/* Grundrechteck u · v */}
      <rect x={X0} y={YB - V * wachs} width={U * wachs} height={V * wachs} fill={C.himmel} stroke={C.see} strokeWidth="1.8" rx="3" />
      <T x={X0 + U / 2} y={YB - V / 2 + 8} textAnchor="middle" fontSize="24" fontWeight="800" fill={C.seeTief} opacity={flaeche}>u · v</T>
      <T x={X0 + U / 2} y={YB + 24} textAnchor="middle" fontSize="16" fontWeight="700" fill={C.see} opacity={beschr}>u</T>
      <T x={X0 - 12} y={YB - V / 2 + 6} textAnchor="end" fontSize="16" fontWeight="700" fill={C.see} opacity={beschr}>v</T>

      {/* Streifen rechts: u′ · v */}
      {s1 > 0.001 && <rect x={X0 + U} y={YB - V} width={DU * s1} height={V} fill={C.flaggold} stroke={C.gold} strokeWidth="1.3" rx="2" />}
      <T x={X0 + U + DU / 2} y={YB - V / 2 + 6} textAnchor="middle" fontSize="15" fontWeight="800" fill={C.seeTief} opacity={s1text}>u′ · v</T>
      <T x={X0 + U + DU / 2} y={YB + 24} textAnchor="middle" fontSize="15" fontWeight="700" fill={C.gold} opacity={s1text}>Δu</T>

      {/* Streifen oben: u · v′ */}
      {s2 > 0.001 && <rect x={X0} y={YB - V - DV * s2} width={U} height={DV * s2} fill={C.see} stroke={C.seeTief} strokeWidth="1.3" rx="2" opacity="0.92" />}
      <T x={X0 + U / 2} y={YB - V - DV / 2 + 6} textAnchor="middle" fontSize="15" fontWeight="800" fill={C.weiss} opacity={s2text}>u · v′</T>
      <T x={X0 - 12} y={YB - V - DV / 2 + 6} textAnchor="end" fontSize="15" fontWeight="700" fill={C.see} opacity={s2text}>Δv</T>

      {/* Mini-Ecke Δu · Δv */}
      {ec > 0.001 && (
        <rect x={gx + (DU * (1 - ec)) / 2} y={gy + (DV * (1 - ec)) / 2} width={DU * ec} height={DV * ec} fill={C.signal} stroke={C.signal} strokeWidth="1" rx="2" opacity="0.9" />
      )}
      <T x={X0 + U + DU + 10} y={gy + 17} fontSize="13.5" fontWeight="800" fill={C.signal} opacity={eckeText}>Δu · Δv</T>
      <T x={X0 + U + DU + 10} y={gy + 34} fontSize="12" fontWeight="500" fill={C.grau} opacity={eckeText}>doppelt klein</T>

      {/* Ergebnis */}
      <T x="180" y="272" textAnchor="middle" fontSize="20" fontWeight="700" fill={C.tinte} opacity={formel}>
        (u · v)′ = <tspan fill={C.gold}>u′ · v</tspan> + <tspan fill={C.see}>u · v′</tspan>
      </T>
      <T x="180" y="295" textAnchor="middle" fontSize="13.5" fontWeight="500" fill={C.grau} opacity={beispiel}>Beispiel: (x² · x³)′ = 2x · x³ + x² · 3x²</T>
      <T x="180" y="315" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.tinte} opacity={beispiel}>= 5x<tspan dy="-6" fontSize="10">4</tspan></T>
    </g>
  );
}

/* ======================================================================
   SZENE 2 · Kettenregel als Verstärkerkette
   Beispiel f(x) = (2x + 1)³ an der Stelle x = 0:  v = 2x + 1,  u = v³
   Faktoren: v′ = 2,  u′(v) = 3v² = 3  →  f′(0) = 6
   ====================================================================== */
const KETTE_SCHRITTE = [
  { von: 0, text: "f(x) = (2x + 1)³ ist eine Kette: x wird zur inneren Funktion v = 2x + 1, und aus v wird die äußere Funktion u = v³. Wir sehen uns an der Stelle x = 0 an, wie ein kleiner Zuwachs durch die Kette läuft." },
  { von: 5, text: "x wird um ein kleines Δx größer. Das ist unser Start-Zuwachs, hier als blauer Balken." },
  { von: 10, text: "Die innere Funktion v = 2x + 1 verdoppelt jeden Zuwachs: Δv = 2 · Δx. Dieser Faktor ist die innere Ableitung v′ = 2." },
  { von: 15, text: "Die äußere Funktion u = v³ verstärkt den Zuwachs an der Stelle v = 1 noch einmal um u′(v) = 3v² = 3. Der Zuwachs ist jetzt 3 · 2 = 6-mal so groß wie am Anfang (für kleine Δx)." },
  { von: 20, text: "Die Verstärkungen werden multipliziert: äußere Ableitung mal innere Ableitung. Genau das sagt die Kettenregel, und deshalb darf der Faktor 2 nie fehlen." },
];

function ketteZeichne(t) {
  const X0 = 14, E = 48, TL = 300, H = 22;
  const track = [lauf(t, 0.2, 1.0), lauf(t, 0.6, 1.4), lauf(t, 1.0, 1.8)];
  const txt = lauf(t, 0.6, 1.6);
  const b1 = lauf(t, 5.4, 7.4);
  const b1t = lauf(t, 7, 8);
  const c1 = lauf(t, 10.2, 11.4);
  const b2 = lauf(t, 11.2, 13.4);
  const b2t = lauf(t, 13, 14);
  const c2 = lauf(t, 15.2, 16.4);
  const b3 = lauf(t, 16.2, 18.8);
  const b3t = lauf(t, 18.4, 19.6);
  const fo = lauf(t, 20.6, 21.8);
  const f2 = lauf(t, 22.6, 23.8);
  const zeile = (y, i) => <rect x={X0} y={y} width={TL} height={H} rx={H / 2} fill={C.silberHell} opacity={track[i]} />;
  const balken = (y, breite, farbe) => breite > 0.5 && <rect x={X0} y={y} width={Math.max(H, breite)} height={H} rx={H / 2} fill={farbe} />;
  const x1 = X0 + E, x2 = X0 + 2 * E;
  return (
    <g>
      <T x={X0} y="24" fontSize="11.5" fontWeight="700" fill={C.hellgrau} opacity={txt} letterSpacing="0.08em">ZUWACHS BEI EINEM KLEINEN SCHRITT</T>

      {/* Zeile 1: x */}
      <T x={X0} y="48" fontSize="14.5" fontWeight="700" fill={C.tinte} opacity={txt}>x = 0</T>
      {zeile(56, 0)}
      {balken(56, E * b1, C.see)}
      <T x={x1 + 12} y="73" fontSize="15" fontWeight="800" fill={C.see} opacity={b1t}>Δx</T>

      {/* Verbindung 1: × 2 */}
      <g opacity={c1}>
        <path d={`M${x1} 82 V110`} stroke={C.gold} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d={`M${x1 - 5} 105 L${x1} 112 L${x1 + 5} 105`} stroke={C.gold} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x={x1 + 12} y="88" width="50" height="26" rx="13" fill={C.flaggold} />
        <T x={x1 + 37} y="106" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.seeTief}>· 2</T>
        <T x={x1 + 72} y="97" fontSize="12.5" fontWeight="500" fill={C.grau}>innere Ableitung</T>
        <T x={x1 + 72} y="113" fontSize="14" fontWeight="700" fill={C.tinte}>v′ = 2</T>
      </g>

      {/* Zeile 2: v */}
      <T x={X0} y="136" fontSize="14.5" fontWeight="700" fill={C.tinte} opacity={txt}>v = 2x + 1 = 1</T>
      {zeile(144, 1)}
      {balken(144, 2 * E * b2, C.flaggold)}
      <T x={x2 + 12} y="161" fontSize="14.5" fontWeight="800" fill={C.gold} opacity={b2t}>Δv = 2 · Δx</T>

      {/* Verbindung 2: × 3 */}
      <g opacity={c2}>
        <path d={`M${x2} 170 V198`} stroke={C.smaragd} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d={`M${x2 - 5} 193 L${x2} 200 L${x2 + 5} 193`} stroke={C.smaragd} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x={x2 + 12} y="176" width="50" height="26" rx="13" fill={C.smaragd} />
        <T x={x2 + 37} y="194" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.weiss}>· 3</T>
        <T x={x2 + 72} y="185" fontSize="12.5" fontWeight="500" fill={C.grau}>äußere Ableitung</T>
        <T x={x2 + 72} y="201" fontSize="14" fontWeight="700" fill={C.tinte}>u′(v) = 3v² = 3</T>
      </g>

      {/* Zeile 3: u */}
      <T x={X0} y="224" fontSize="14.5" fontWeight="700" fill={C.tinte} opacity={txt}>u = v³ = 1</T>
      {zeile(232, 2)}
      {balken(232, 6 * E * b3, C.smaragd)}
      <T x={X0 + 16} y="249" fontSize="14.5" fontWeight="800" fill={C.weiss} opacity={b3t}>Δu ≈ 6 · Δx</T>

      {/* Ergebnis */}
      <T x="180" y="286" textAnchor="middle" fontSize="18" fontWeight="700" fill={C.tinte} opacity={fo}>
        f′(x) = <tspan fill={C.smaragd}>u′(v(x))</tspan> · <tspan fill={C.gold}>v′(x)</tspan>
      </T>
      <T x="180" y="309" textAnchor="middle" fontSize="13.5" fontWeight="500" fill={C.grau} opacity={f2}>Hier bei x = 0: 3 · 2 = 6 = 6 · (2 · 0 + 1)²</T>
    </g>
  );
}

/* ======================================================================
   SZENE 3 · Wurzel aus vierstelligen Quadratzahlen (seit 22.10.2026)
   Zeiten, Texte und Rechnung rein in src/wurzelMotion.js (Test tests/wurzelMotion.test.mjs).
   Die Zeichnung ist nach dem Drehbuch (DREHBUCH, eine Minute) getaktet; wurzelZeichne rechnet die langsamere
   Abspielzeit zuerst mit drehbuchZeit um. Größer = weiter oben: Liste 10² oben, 1² unten; Leiter ebenso.
   1 Quadratzahlen 1² bis 10² · 2 daneben die Zehnerquadrate (dieselben Zahlen mit 00)
   3 letzte Ziffern: 1|81, 4|64, 9|49, 16|36 enden gleich (Klammern), 25 und 100 allein
   4 Folgerung: letzte Ziffer → Einerziffer der Wurzel · 5 Beispiel: die letzte Ziffer
   6 zwischen welchen Zehnerquadraten liegt die Zahl? (Leiter) → Zehnerziffer
   7 nur bei zwei Kandidaten: näher am unteren oder oberen Zehnerquadrat? · Ergebnis
   ====================================================================== */
const SP = " ";
const ZEHN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const mische = (a, b, p) => a + (b - a) * p;
const RY = (i) => 46 + i * 36; // Oberkante der i-ten Zeile von oben
const LY = (i) => RY(9 - i);    // Oberkante der Zeile für (i + 1)²: 1² ganz unten, 10² ganz oben
const RH = 30;

/* Zahl mit hervorgehobener letzter Ziffer: Grundtext + Goldziffer darüber (gleiche Laufweite) */
function Wert({ x, y, text, groesse, gold, farbe = C.seeTief, nullen = false }) {
  const vorn = text.slice(0, -1), hinten = text.slice(-1);
  return (
    <g>
      <T x={x} y={y} textAnchor="end" fontSize={groesse} fontWeight="800" fill={farbe}>
        {text}{nullen && <tspan fill={C.gold}>00</tspan>}
      </T>
      {gold > 0.001 && (
        <T x={x} y={y} textAnchor="end" fontSize={groesse} fontWeight="800" fill={C.gold} opacity={gold}>
          <tspan fillOpacity="0">{vorn}</tspan>{hinten}{nullen && <tspan fillOpacity="0">00</tspan>}
        </T>
      )}
    </g>
  );
}

/* waagrechter Pfeil (Schriftzeichen „→“ ist in Montserrat zu klein) */
const Pfeil = ({ x1, x2, y, farbe, breite = 2 }) => (
  <path d={`M${x1} ${y} H${x2} M${x2 - 5} ${y - 4.5} L${x2} ${y} L${x2 - 5} ${y + 4.5}`} fill="none" stroke={farbe} strokeWidth={breite} strokeLinecap="round" strokeLinejoin="round" />
);

function wurzelZeichne(tAbspiel, I) {
  const t = drehbuchZeit(tAbspiel, I.zwei);
  const Zt = DREHBUCH(I.zwei).s;
  const tE = Zt[Zt.length - 1];
  const [tZehner, tEnden, tFolge, tBsp, tLeiter] = [Zt[1], Zt[2], Zt[3], Zt[4], Zt[5]];
  const tNaeher = I.zwei ? Zt[6] : null;
  const ziff = String(I.N).split("");

  /* ---------- Sichtbarkeit der großen Abschnitte ---------- */
  const listeAn = 1 - lauf(t, tBsp - 0.2, tBsp + 0.6); // Liste 1² bis 10² (Schritte 1 bis 4)
  const rechtsAn = lauf(t, tZehner + 0.2, tZehner + 0.8) * (1 - lauf(t, tEnden, tEnden + 0.7)); // Zehnerquadrate
  const sl = lauf(t, tEnden + 0.4, tEnden + 1.3); // Liste rückt nach rechts, Platz für die Klammern
  const endenAn = lauf(t, tEnden + 0.9, tEnden + 1.5) * listeAn;
  const bspAn = lauf(t, tBsp + 0.3, tBsp + 1.1);

  /* ---------- Schritt 3: Paare ---------- */
  const paarT = PAAR_ZEIT.map((d) => tEnden + d);
  const fertig = paarT.map((p) => lauf(t, p, p + 0.7));
  const aktiv = paarT.map((p, k) => lauf(t, p, p + 0.5) * (1 - lauf(t, (k + 1 < paarT.length ? paarT[k + 1] : tEnden + 14) - 0.2, (k + 1 < paarT.length ? paarT[k + 1] : tEnden + 14) + 0.4)));
  /* in Schritt 4 leuchtet das Beispiel der Folgerung (Endziffer 9) noch einmal auf */
  const folgeAn = lauf(t, tFolge + 0.4, tFolge + 1.2) * (1 - lauf(t, tBsp - 0.6, tBsp));
  const zeileAktiv = (i) => {
    let a = 0;
    WURZEL_PAARE.forEach((p, k) => { if (p.zeilen.includes(i)) a = Math.max(a, aktiv[k], k === 2 ? folgeAn : 0); });
    return a;
  };
  const zeileFertig = (i) => {
    let f = 0;
    WURZEL_PAARE.forEach((p, k) => { if (p.zeilen.includes(i)) f = fertig[k]; });
    return f;
  };

  /* Liste: Lage und Breite */
  const LX = mische(14, 60, sl), LW = mische(148, 124, sl);

  /* ---------- Beispiel ---------- */
  const bx = (i) => 98 + i * 52;
  const col = ENDEN.findIndex(([e]) => e === I.ende);
  const tab = lauf(t, tBsp + 1.0, tBsp + 1.8);
  const endHi = lauf(t, tBsp + 2.0, tBsp + 2.8);
  const colHi = lauf(t, tBsp + 2.6, tBsp + 3.4);
  const verb1 = lauf(t, tBsp + 3.2, tBsp + 4.0) * (1 - lauf(t, tLeiter, tLeiter + 0.6));
  const einerAn = lauf(t, tBsp + 3.6, tBsp + 4.4);
  const boxenAn = lauf(t, tBsp + 1.2, tBsp + 2.0);
  const vorneHi = lauf(t, tLeiter + 0.2, tLeiter + 1.0);
  const leiterAn = (s) => lauf(t, tLeiter + 0.4 + s * 0.22, tLeiter + 1.0 + s * 0.22);
  const nAn = lauf(t, tLeiter + 1.6, tLeiter + 2.4);
  const randHi = lauf(t, tLeiter + 2.4, tLeiter + 3.2);
  const zwischen = lauf(t, tLeiter + 2.8, tLeiter + 3.6);
  const verb2 = lauf(t, tLeiter + 3.2, tLeiter + 4.0) * (1 - lauf(t, tE, tE + 0.6));
  const zehnerAn = lauf(t, tLeiter + 3.6, tLeiter + 4.4);
  const kandAn = I.zwei ? lauf(t, tLeiter + 4.6, tLeiter + 5.4) : 0;
  const ab1 = tNaeher != null ? lauf(t, tNaeher + 0.4, tNaeher + 1.2) : 0;
  const ab2 = tNaeher != null ? lauf(t, tNaeher + 1.0, tNaeher + 1.8) : 0;
  const nahHi = tNaeher != null ? lauf(t, tNaeher + 1.6, tNaeher + 2.4) : 0;
  const entscheid = tNaeher != null ? lauf(t, tNaeher + 2.6, tNaeher + 3.4) : 0;
  const einerFest = I.zwei ? lauf(t, tNaeher + 3.2, tNaeher + 4.0) : 1;
  const erg = lauf(t, tE + 0.5, tE + 1.5);
  const probe = lauf(t, tE + 1.8, tE + 2.6);

  /* Leiter: z − 1, z, die Zahl, z + 1, z + 2 */
  const LEITER = [I.z - 1, I.z, "N", I.z + 1, I.z + 2];
  const leiterY = (s) => 194 + (4 - s) * 36;   // größere Zehnerquadrate oben, wie in der Liste
  const naeherZeile = I.kleiner ? 1 : 3;
  const einerText = I.zwei ? `${I.kand[0]}|${I.kand[1]}` : String(I.kand[0]);

  return (
    <g>
      {/* ================= Schritte 1 bis 4: die Liste ================= */}
      <g opacity={listeAn}>
        {/* Überschriften */}
        <T x={LX + LW / 2} y="30" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.hellgrau} letterSpacing="0.08em" opacity={lauf(t, 0.1, 0.8)}>QUADRATZAHLEN</T>
        <T x="272" y="30" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.gold} letterSpacing="0.08em" opacity={rechtsAn}>ZEHNERQUADRATE</T>
        <T x="280" y="30" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.hellgrau} letterSpacing="0.05em" opacity={endenAn}>LETZTE ZIFFER → WURZEL</T>

        {/* Klammern: n² und (10 − n)² enden gleich */}
        {WURZEL_PAARE.slice(0, 4).map((p, k) => {
          const y1 = LY(p.zeilen[0]) + RH / 2, y2 = LY(p.zeilen[1]) + RH / 2, ya = Math.min(y1, y2), yb = Math.max(y1, y2);
          const xr = LX - 4, xl = 16 + k * 9;
          const d = `M${xr} ${ya} H${xl + 6} Q${xl} ${ya} ${xl} ${ya + 6} V${yb - 6} Q${xl} ${yb} ${xl + 6} ${yb} H${xr}`;
          return (
            <g key={k} opacity={endenAn}>
              <path d={d} fill="none" stroke={C.see} strokeOpacity="0.4" strokeWidth="1.8" strokeLinecap="round" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - fertig[k]} />
              {aktiv[k] > 0.001 && <path d={d} fill="none" stroke={C.gold} strokeWidth="2.8" strokeLinecap="round" opacity={aktiv[k]} />}
            </g>
          );
        })}
        {/* 25 und 100 stehen allein */}
        {[4, 5].map((k) => {
          const y = LY(WURZEL_PAARE[k].zeilen[0]) + RH / 2;
          return (
            <g key={k} opacity={endenAn * fertig[k]}>
              <circle cx={LX - 10} cy={y} r={3.5 + 2 * aktiv[k]} fill={C.gold} />
              {aktiv[k] > 0.001 && <circle cx={LX - 10} cy={y} r="9" fill="none" stroke={C.flaggold} strokeWidth="2" opacity={aktiv[k]} />}
            </g>
          );
        })}

        {/* Zeilen */}
        {ZEHN.map((n, i) => {
          const ein = lauf(t, 0.5 + i * 0.45, 1.1 + i * 0.45);
          const hi = zeileAktiv(i);
          const y = LY(i);
          return (
            <g key={n}>
              <g opacity={ein}>
                <rect x={LX} y={y} width={LW} height={RH} rx="9" fill={C.himmel} stroke={C.see} strokeWidth="1.5" />
                {hi > 0.001 && <rect x={LX} y={y} width={LW} height={RH} rx="9" fill={C.flaggold} fillOpacity={0.45 * hi} stroke={C.gold} strokeWidth="2.4" strokeOpacity={hi} />}
                <T x={LX + 13} y={y + 21} fontSize="14" fontWeight="700" fill={C.see}>{n}²</T>
                <Wert x={LX + LW - 13} y={y + 22} text={String(n * n)} groesse={19} gold={Math.max(0.85 * zeileFertig(i) * endenAn, hi)} />
              </g>
              {/* daneben: (10 · n)² */}
              <g opacity={lauf(t, tZehner + 0.5 + i * 0.4, tZehner + 1.1 + i * 0.4) * rechtsAn}>
                <Pfeil x1={168} x2={191} y={y + RH / 2} farbe={C.flaggold} breite={2.2} />
                <rect x="198" y={y} width="148" height={RH} rx="9" fill={C.weiss} stroke={C.gold} strokeWidth="1.5" />
                <T x="211" y={y + 21} fontSize="14" fontWeight="700" fill={C.gold}>{n * 10}²</T>
                <Wert x={333} y={y + 22} text={String(n * n)} groesse={19} gold={0} nullen />
              </g>
            </g>
          );
        })}

        {/* rechts in Schritt 3/4: was die letzte Ziffer über die Wurzel sagt */}
        {WURZEL_PAARE.map((p, k) => {
          const y = RY(k);
          const hi = Math.max(aktiv[k], k === 2 ? folgeAn : 0);
          return (
            <g key={k} opacity={endenAn * fertig[k]}>
              <rect x="214" y={y} width="132" height={RH} rx="9" fill={C.weiss} stroke={C.linie} strokeWidth="1.3" />
              {hi > 0.001 && <rect x="214" y={y} width="132" height={RH} rx="9" fill={C.flaggold} fillOpacity={0.3 * hi} stroke={C.gold} strokeWidth="2.2" strokeOpacity={hi} />}
              <T x="227" y={y + 21} textAnchor="middle" fontSize="16" fontWeight="800" fill={C.seeTief}>{p.ende}</T>
              <Pfeil x1={238} x2={252} y={y + RH / 2} farbe={C.hellgrau} breite={1.8} />
              <T x="260" y={y + 21} fontSize="14.5" fontWeight="800" fill={C.gold}>{p.wurzel}</T>
            </g>
          );
        })}
        <g opacity={endenAn * lauf(t, tFolge + 4.0, tFolge + 4.8)}>
          <rect x="214" y={RY(6)} width="132" height={RH} rx="9" fill="none" stroke={C.hellgrau} strokeWidth="1.3" strokeDasharray="4 3" />
          <T x="223" y={RY(6) + 20} fontSize="12.5" fontWeight="800" fill={C.grau}>2 3 7 8</T>
          <Pfeil x1={278} x2={293} y={RY(6) + RH / 2} farbe={C.hellgrau} breite={1.8} />
          <T x="301" y={RY(6) + 20} fontSize="13" fontWeight="700" fill={C.grau}>nie</T>
        </g>

        {/* Bildunterschriften */}
        <g opacity={lauf(t, 5.4, 6.2) * (1 - lauf(t, tZehner + 4.6, tZehner + 5.2))}>
          <T x="180" y="438" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.tinte}>Diese zehn Zahlen reichen</T>
          <T x="180" y="462" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.grau}>{`für alle Wurzeln bis 10${SP}000`}</T>
        </g>
        <g opacity={lauf(t, tZehner + 5.2, tZehner + 6.0) * (1 - lauf(t, tEnden, tEnden + 0.6))}>
          <T x="180" y="438" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.tinte}>
            {"Dieselben Zahlen – nur mit "}<tspan fill={C.gold}>zwei Nullen</tspan>{" dran"}
          </T>
          <T x="180" y="462" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.grau}>denn (10 · n)² = n² · 100, z. B. 70² = 7² · 100 = 4900</T>
        </g>
        {WURZEL_PAARE.map((p, k) => (
          <T key={k} x="180" y="438" textAnchor="middle" fontSize="14.5" fontWeight="800" fill={C.tinte} opacity={aktiv[k] * listeAn}>
            {p.n.length === 2
              ? `${p.n[0]}² = ${p.n[0] ** 2} und ${p.n[1]}² = ${p.n[1] ** 2}${SP}→${SP}beide enden auf `
              : `Nur ${p.n[0]}² = ${p.n[0] ** 2} endet auf `}
            <tspan fill={C.gold}>{p.ende}</tspan>
          </T>
        ))}
        <T x="180" y="462" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.grau}
          opacity={lauf(t, paarT[3] + 0.6, paarT[3] + 1.4) * (1 - lauf(t, tFolge, tFolge + 0.6))}>Spiegelbildlich um die 5: n² und (10 − n)² enden gleich</T>
        <g opacity={lauf(t, tFolge + 0.4, tFolge + 1.2)}>
          <T x="180" y="438" textAnchor="middle" fontSize="15.5" fontWeight="800" fill={C.tinte}>
            {`${FOLGERUNG.wurzel}² = ${FOLGERUNG.quadrat.toString().slice(0, -1)}`}<tspan fill={C.gold}>{FOLGERUNG.quadrat % 10}</tspan>
            {` endet wie ${FOLGERUNG.einer}² = `}<tspan fill={C.gold}>{FOLGERUNG.einer ** 2}</tspan>
          </T>
          <T x="180" y="462" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.grau}>Die Zehner der Wurzel ändern die letzte Ziffer nicht.</T>
        </g>
        <T x="180" y="482" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.see}
          opacity={lauf(t, tFolge + 2.0, tFolge + 2.8)}>Letzte Ziffer → Einerziffer der Wurzel</T>
      </g>

      {/* ================= Schritte 5 bis Ende: das Beispiel ================= */}
      <g opacity={bspAn}>
        <T x="180" y="24" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.hellgrau} letterSpacing="0.08em">BEISPIEL</T>
        <path d="M60 72 L67 66 L77 94 L91 40 L300 40" stroke={C.tinte} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {ziff.map((d, i) => (
          <g key={i}>
            <rect x={bx(i)} y="50" width="44" height="50" rx="9" fill={C.weiss} stroke={C.linie} strokeWidth="1.5" />
            <T x={bx(i) + 22} y="86" textAnchor="middle" fontSize="30" fontWeight="800" fill={C.tinte}>{d}</T>
          </g>
        ))}
        <rect x={bx(3)} y="50" width="44" height="50" rx="9" fill={C.flaggold} fillOpacity={0.35 * endHi} stroke={C.flaggold} strokeWidth="2.4" strokeOpacity={endHi} />
        <rect x={bx(0)} y="50" width="96" height="50" rx="9" fill={C.see} fillOpacity={0.14 * vorneHi} stroke={C.see} strokeWidth="2.4" strokeOpacity={vorneHi} />

        {/* Tabelle: letzte Ziffer → Einerziffer der Wurzel */}
        <g opacity={tab}>
          <T x="180" y="120" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.hellgrau} letterSpacing="0.06em">LETZTE ZIFFER → WURZEL ENDET AUF</T>
          {ENDEN.map(([e, w], i) => {
            const an = i === col ? colHi : 0;
            const x = 24 + i * 52;
            return (
              <g key={e}>
                <rect x={x + 2} y="128" width="48" height="22" rx="6" fill={C.silberHell} />
                <rect x={x + 2} y="128" width="48" height="22" rx="6" fill={C.flaggold} opacity={an} />
                <T x={x + 26} y="144" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.tinte}>{e}</T>
                <rect x={x + 2} y="153" width="48" height="22" rx="6" fill={C.himmel} />
                <rect x={x + 2} y="153" width="48" height="22" rx="6" fill={C.flaggold} opacity={an} />
                <T x={x + 26} y="169" textAnchor="middle" fontSize="13.5" fontWeight={i === col ? 800 : 600} fill={C.see}>{w}</T>
              </g>
            );
          })}
        </g>
        {/* Goldfaden: Tabelle → Einerziffer */}
        {col >= 0 && (
          <path d={`M${24 + col * 52 + 26} 178 C ${24 + col * 52 + 26} 196, 309 188, 309 206`} fill="none" stroke={C.gold} strokeWidth="2" strokeDasharray="4 3" opacity={verb1} />
        )}

        {/* Leiter der Zehnerquadrate */}
        <T x="98" y="188" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.gold} letterSpacing="0.06em" opacity={leiterAn(0)}>ZEHNERQUADRATE</T>
        {LEITER.map((m, s) => {
          const y = leiterY(s);
          if (m === "N") {
            return (
              <g key="N" opacity={nAn}>
                <rect x="30" y={y} width="136" height={RH} rx="15" fill={C.flaggold} fillOpacity="0.35" stroke={C.gold} strokeWidth="2.2" />
                <T x="98" y={y + 21} textAnchor="middle" fontSize="17" fontWeight="800" fill={C.tinte}>{I.N}</T>
              </g>
            );
          }
          if (m < 1 || m > 10) return null;
          const rand = s === 1 || s === 3 ? randHi : 0;
          const nah = s === naeherZeile ? nahHi : 0;
          return (
            <g key={m} opacity={leiterAn(s) * (s === 1 || s === 3 ? 1 : 1 - 0.55 * randHi)}>
              <rect x="18" y={y} width="160" height={RH} rx="9" fill={C.weiss} stroke={C.gold} strokeWidth="1.4" />
              {rand > 0.001 && <rect x="18" y={y} width="160" height={RH} rx="9" fill={C.himmel} fillOpacity={rand} stroke={C.see} strokeWidth="2.4" strokeOpacity={rand} />}
              {nah > 0.001 && <rect x="18" y={y} width="160" height={RH} rx="9" fill="none" stroke={C.smaragd} strokeWidth="3" opacity={nah} />}
              <T x="31" y={y + 21} fontSize="14" fontWeight="700" fill={C.gold}>{m * 10}²</T>
              <Wert x={165} y={y + 22} text={String(m * m)} groesse={18} gold={0} nullen />
            </g>
          );
        })}
        {/* Faden: Leiter → Zehnerziffer */}
        <path d={`M178 ${leiterY(2) + RH / 2} C 192 ${leiterY(2) + RH / 2}, 194 250, 205 244`} fill="none" stroke={C.see} strokeWidth="2" strokeDasharray="4 3" opacity={verb2} />

        {/* Zehner + Einer */}
        <g opacity={boxenAn}>
          <T x="233" y="284" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.see} letterSpacing="0.08em">ZEHNER</T>
          <T x="309" y="284" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.gold} letterSpacing="0.08em">EINER</T>
          <rect x="205" y="208" width="56" height="60" rx="12" fill={C.himmel} stroke={erg > 0.5 ? C.smaragd : C.see} strokeWidth="2.2" />
          <rect x="281" y="208" width="56" height="60" rx="12" fill={C.weiss} stroke={erg > 0.5 ? C.smaragd : C.gold} strokeWidth="2.2" />
          <T x="233" y="249" textAnchor="middle" fontSize="32" fontWeight="800" fill={C.hellgrau} opacity={1 - zehnerAn}>?</T>
          <T x="233" y="249" textAnchor="middle" fontSize="32" fontWeight="800" fill={C.see} opacity={zehnerAn}>{I.z}</T>
          <T x="309" y="249" textAnchor="middle" fontSize="32" fontWeight="800" fill={C.hellgrau} opacity={1 - einerAn}>?</T>
          {I.zwei && <T x="309" y="246" textAnchor="middle" fontSize="23" fontWeight="800" fill={C.gold} opacity={einerAn * (1 - einerFest)}>{einerText}</T>}
          <T x="309" y="249" textAnchor="middle" fontSize="32" fontWeight="800" fill={C.gold} opacity={einerAn * einerFest}>{I.gewaehlt % 10}</T>
          <T x="233" y="300" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.grau} opacity={zehnerAn}>{`${I.z * 10}² … ${(I.z + 1) * 10}²`}</T>
          <T x="309" y="300" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.grau} opacity={einerAn}>{`letzte Ziffer ${I.ende}`}</T>
        </g>
        <T x="271" y="326" textAnchor="middle" fontSize="14.5" fontWeight="800" fill={C.see} opacity={zwischen}>
          {`${I.z * 10} < √${I.N} < ${(I.z + 1) * 10}`}
        </T>
        {I.zwei && (
          <g>
            <T x="271" y="350" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.tinte} opacity={kandAn * (1 - ab1)}>
              {`Kandidaten: ${I.kandZahlen[0]} oder ${I.kandZahlen[1]}`}
            </T>
            <T x="271" y="350" textAnchor="middle" fontSize="12.5" fontWeight="600" fill={I.kleiner ? C.smaragd : C.grau} opacity={ab1}>{`${I.N} − ${gz(I.unten)} = ${I.abU}`}</T>
            <T x="271" y="370" textAnchor="middle" fontSize="12.5" fontWeight="600" fill={I.kleiner ? C.grau : C.smaragd} opacity={ab2}>{`${gz(I.oben)} − ${I.N} = ${I.abO}`}</T>
            <T x="271" y="396" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.tinte} opacity={entscheid}>
              {`näher an ${gz(I.kleiner ? I.unten : I.oben)}${SP}→${SP}`}<tspan fill={C.smaragd}>{I.gewaehlt}</tspan>
            </T>
          </g>
        )}

        {/* Ergebnis */}
        <T x="180" y="440" textAnchor="middle" fontSize="27" fontWeight="800" fill={C.smaragd} opacity={erg}>√{I.N} = {I.gewaehlt}</T>
        <T x="180" y="466" textAnchor="middle" fontSize="13.5" fontWeight="600" fill={C.grau} opacity={probe}>Probe: {I.gewaehlt}² = {I.N} ✓</T>
      </g>
    </g>
  );
}

/* ======================================================================
   PLAYER
   ====================================================================== */
const spielKnopf = { width: 46, height: 46, borderRadius: 999, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  background: C.seeTief, boxShadow: "0 3px 10px rgba(14,30,74,0.25)" };

/* Auch für andere Werkzeuge nutzbar (z. B. Trigonometrie): szene = { dauer, hoehe, schritte: [{ von, text }], zeichne(t), beschreibung } */
export function Player({ szene }) {
  const { dauer, schritte, hoehe, zeichne, beschreibung } = szene;
  const leise = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [t, setT] = useState(0);
  const [spielt, setSpielt] = useState(!leise);
  const tRef = useRef(0);

  useEffect(() => {
    if (!spielt) return undefined;
    let alt = performance.now();
    let raf = 0;
    const tick = (jetzt) => {
      const dt = Math.min(0.1, (jetzt - alt) / 1000);
      alt = jetzt;
      const neu = Math.min(dauer, tRef.current + dt);
      tRef.current = neu;
      setT(neu);
      if (neu >= dauer) { setSpielt(false); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spielt, dauer]);

  const setzen = (neu) => { tRef.current = neu; setT(neu); };
  const idx = schritte.reduce((a, s, i) => (t >= s.von - 0.001 ? i : a), 0);
  const amEnde = t >= dauer - 0.001;

  const umschalten = () => {
    if (spielt) { setSpielt(false); return; }
    if (amEnde) setzen(0);
    setSpielt(true);
  };
  const zuSchritt = (i) => { setzen(schritte[i].von); setSpielt(true); };

  return (
    <div>
      <style>{`@keyframes erkEin{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        .erk-ein{animation:erkEin .35s ease both}
        @media (prefers-reduced-motion: reduce){.erk-ein{animation:none}}
        .erk-knopf:focus-visible,.erk-pille:focus-visible{outline:3px solid ${C.flaggold};outline-offset:2px}`}</style>
      <div style={{ background: C.sand, borderRadius: 14, border: `1px solid ${C.linie}`, padding: "10px 6px 4px", maxWidth: 480, margin: "0 auto" }}>
        <svg viewBox={`0 0 360 ${hoehe}`} width="100%" role="img" aria-label={beschreibung} style={{ display: "block", overflow: "visible" }}>
          {zeichne(t)}
        </svg>
      </div>

      <input type="range" min={0} max={dauer} step={0.01} value={t} aria-label={zw("Zeitleiste der Animation", "Animation timeline")}
        onChange={(e) => { setSpielt(false); setzen(parseFloat(e.target.value)); }}
        style={{ width: "100%", accentColor: C.see, margin: "12px 0 6px", cursor: "pointer" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <button type="button" className="erk-knopf" onClick={umschalten} style={spielKnopf}
          aria-label={spielt ? zw("Pause", "Pause") : amEnde ? zw("Noch einmal abspielen", "Play again") : zw("Abspielen", "Play")}>
          {spielt ? (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><rect x="3" y="2.5" width="4" height="13" rx="1.2" fill={C.flaggold} /><rect x="11" y="2.5" width="4" height="13" rx="1.2" fill={C.flaggold} /></svg>
          ) : amEnde ? (
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke={C.flaggold} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4.5 2.5v13l11-6.5z" fill={C.flaggold} /></svg>
          )}
        </button>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} role="group" aria-label={zw("Schritte", "Steps")}>
          {schritte.map((s, i) => (
            <button key={i} type="button" className="erk-pille" onClick={() => zuSchritt(i)} aria-label={zw(`Schritt ${i + 1} abspielen`, `Play step ${i + 1}`)} aria-current={i === idx ? "step" : undefined}
              style={{ width: 38, height: 38, borderRadius: 999, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${i === idx ? C.see : C.linie}`, background: i === idx ? C.see : C.weiss, color: i === idx ? C.weiss : C.see }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div key={idx} className="erk-ein" aria-live="polite" style={{ borderLeft: `3px solid ${C.gruen}`, paddingLeft: 14 }}>
        <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 4 }}>{zw(`Schritt ${idx + 1} von ${schritte.length}`, `Step ${idx + 1} of ${schritte.length}`)}</p>
        <p style={{ fontSize: 14.5, fontWeight: 400, lineHeight: 1.75, color: C.tinte, margin: 0 }}>{schritte[idx].text}</p>
      </div>
    </div>
  );
}

/* ======================================================================
   SZENE 4 · Stammfunktion: Ableiten rückwärts
   Beispiel f(x) = x²  →  F(x) = x³/3 + C, Kurvenschar mit gleicher Steigung
   ====================================================================== */
const STAMM_SCHRITTE = [
  { von: 0, text: "Ableiten fragt: Wie lautet F′, wenn F gegeben ist? Die Stammfunktion dreht die Frage um: Gegeben ist f, gesucht ist eine Funktion F, deren Ableitung f ist. Als Beispiel nehmen wir f(x) = x²." },
  { von: 4.2, text: "Beim Ableiten von x³ kommt der Exponent 3 nach vorn, und der Exponent sinkt um 1: (x³)′ = 3x². Rückwärts müssen wir also den Exponenten um 1 erhöhen: Aus x² wird x³." },
  { von: 8.6, text: "Ableiten von x³ liefert aber 3x², und wir wollen nur x². Der Faktor 3 ist zu viel, deshalb teilen wir durch den neuen Exponenten: F(x) = x³/3. Probe: (x³/3)′ = 3x²/3 = x²." },
  { von: 14.4, text: "Eine Konstante verschwindet beim Ableiten. x³/3, x³/3 + 1 und x³/3 − 1 haben alle dieselbe Ableitung x²: überall dieselbe Steigung, nur die Kurve ist nach oben oder unten verschoben. Darum gehört ein + C dazu." },
  { von: 20.4, text: "Ergebnis: Eine Stammfunktion von x² ist x³/3 + C. Allgemein gilt: Exponent um 1 erhöhen, durch den neuen Exponenten teilen, + C dranhängen." },
];

const hoch = (e) => <tspan dy="-7" fontSize="0.68em">{e}</tspan>;

function stammZeichne(t) {
  const aus = 1 - lauf(t, 14.6, 15.4);                 // Rechenkarte blendet aus, Graph kommt
  const box = lauf(t, 0.3, 1.4) * aus;
  const pf1 = lauf(t, 1.6, 2.4) * aus, pf2 = lauf(t, 2.4, 3.4) * aus;
  const vw = lauf(t, 4.6, 6.2) * aus, rw = lauf(t, 6.4, 8.2) * aus;
  const dv = lauf(t, 9, 10.2) * aus, fx = lauf(t, 10.6, 12) * aus, pr = lauf(t, 12.6, 13.8) * aus;

  const gr = lauf(t, 15.2, 16.2);
  const reveal = lauf(t, 15.6, 17.4);
  const shift = lauf(t, 17.8, 19.4);
  const tang = lauf(t, 19.6, 20.4);
  const erg = lauf(t, 20.8, 22), allg = lauf(t, 22.6, 24.4);

  const sx = (x) => 190 + 70 * x, sy = (y) => 186 - 36 * y;
  const FF = (x) => (x * x * x) / 3;
  const pfad = (c, p) => {
    const xe = -1.2 + 3.0 * p;
    let d = "";
    for (let x = -1.2; x <= xe + 1e-9; x += 0.05) d += `${d ? "L" : "M"}${sx(x).toFixed(1)} ${sy(FF(x) + c).toFixed(1)}`;
    return d;
  };
  const scharen = [1, 2, -1];
  return (
    <g>
      {/* Karte: F ← f */}
      <g opacity={box}>
        <rect x="18" y="16" width="118" height="46" rx="12" fill={C.weiss} stroke={C.gold} strokeWidth="1.8" />
        <T x="77" y="46" textAnchor="middle" fontSize="19" fontWeight="800" fill={C.gold}>F(x) = ?</T>
        <rect x="224" y="16" width="118" height="46" rx="12" fill={C.himmel} stroke={C.see} strokeWidth="1.8" />
        <T x="283" y="46" textAnchor="middle" fontSize="19" fontWeight="800" fill={C.seeTief}>f(x) = x{hoch("2")}</T>
      </g>
      <g opacity={pf1}>
        <path d="M142 32 H214 M208 26 L216 32 L208 38" stroke={C.hellgrau} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <T x="179" y="23" textAnchor="middle" fontSize="12" fontWeight="600" fill={C.grau}>ableiten</T>
      </g>
      <g opacity={pf2}>
        <path d="M218 50 H146 M152 44 L144 50 L152 56" stroke={C.gold} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <T x="181" y="72" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.gold}>rückwärts</T>
      </g>

      {/* vorwärts: x³ → 3x² */}
      <g opacity={vw}>
        <T x="18" y="106" fontSize="11" fontWeight="700" fill={C.hellgrau} letterSpacing="0.08em">VORWÄRTS · ABLEITEN</T>
        <T x="18" y="136" fontSize="25" fontWeight="800" fill={C.see}>x{hoch("3")}<tspan dy="7" fill={C.hellgrau}>{"  →  "}</tspan>3x{hoch("2")}</T>
        <T x="196" y="128" fontSize="12.5" fontWeight="500" fill={C.grau}>Exponent 3 nach vorn,</T>
        <T x="196" y="146" fontSize="12.5" fontWeight="500" fill={C.grau}>Exponent um 1 kleiner</T>
      </g>
      {/* rückwärts: x² → x³ */}
      <g opacity={rw}>
        <T x="18" y="180" fontSize="11" fontWeight="700" fill={C.gold} letterSpacing="0.08em">RÜCKWÄRTS · STAMMFUNKTION</T>
        <T x="18" y="210" fontSize="25" fontWeight="800" fill={C.gold}>x{hoch("2")}<tspan dy="7" fill={C.hellgrau}>{"  →  "}</tspan>x{hoch("3")}</T>
        <T x="196" y="210" fontSize="12.5" fontWeight="600" fill={C.grau}>Exponent um 1 größer</T>
      </g>
      {/* durch den neuen Exponenten teilen */}
      <T x="180" y="244" textAnchor="middle" fontSize="13.5" fontWeight="500" fill={C.tinte} opacity={dv}>Aber (x{hoch("3")}<tspan dy="7">)′ = 3x</tspan>{hoch("2")}<tspan dy="7"> – der Faktor 3 ist zu viel.</tspan></T>
      <T x="180" y="277" textAnchor="middle" fontSize="25" fontWeight="800" fill={C.see} opacity={fx}>F(x) = x{hoch("3")}<tspan dy="7"> / 3</tspan></T>
      <T x="180" y="304" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.gruen} opacity={pr}>Probe: (x{hoch("3")}<tspan dy="7">/3)′ = x</tspan>{hoch("2")}<tspan dy="7"> ✓</tspan></T>

      {/* Graph: Kurvenschar F(x) = x³/3 + C */}
      <g opacity={gr}>
        <line x1="30" y1={sy(0)} x2="342" y2={sy(0)} stroke={C.hellgrau} strokeWidth="1.2" opacity="0.7" />
        <line x1={sx(0)} y1="30" x2={sx(0)} y2="252" stroke={C.hellgrau} strokeWidth="1.2" opacity="0.7" />
        <T x="336" y={sy(0) - 6} textAnchor="end" fontSize="12" fontWeight="600" fill={C.hellgrau}>x</T>
        {scharen.map((c) => (
          shift > 0.001 && <path key={c} d={pfad(c * shift, 1)} fill="none" stroke={C.see} strokeWidth="2.2" strokeLinecap="round" opacity={0.55 * shift} />
        ))}
        <path d={pfad(0, reveal)} fill="none" stroke={C.see} strokeWidth="3" strokeLinecap="round" />
        {[0, ...scharen].map((c) => {
          const o = c === 0 ? reveal : shift;
          return <T key={c} x={sx(1.8) + 8} y={sy(FF(1.8) + c * (c === 0 ? 1 : shift)) + 4} fontSize="12" fontWeight="700" fill={c === 0 ? C.seeTief : C.see} opacity={o > 0.95 ? 1 : 0}>C = {c}</T>;
        })}
        {[0, ...scharen].map((c) => {
          const cc = c * (c === 0 ? 1 : shift), y0 = FF(1) + cc;
          return (
            <g key={c} opacity={tang * (c === 0 ? 1 : shift)}>
              <line x1={sx(0.55)} y1={sy(y0 - 0.45)} x2={sx(1.45)} y2={sy(y0 + 0.45)} stroke={C.flaggold} strokeWidth="3.4" strokeLinecap="round" />
              <circle cx={sx(1)} cy={sy(y0)} r="3.6" fill={C.gold} />
            </g>
          );
        })}
        <T x="18" y="44" fontSize="13" fontWeight="700" fill={C.tinte} opacity={tang}>Bei x = 1 hat jede Kurve</T>
        <T x="18" y="62" fontSize="13" fontWeight="700" fill={C.gold} opacity={tang}>dieselbe Steigung f(1) = 1</T>
      </g>

      {/* Ergebnis */}
      <T x="180" y="290" textAnchor="middle" fontSize="21" fontWeight="800" fill={C.tinte} opacity={erg}>∫ x{hoch("2")}<tspan dy="7"> dx = </tspan><tspan dy="0" fill={C.see}>x</tspan>{hoch("3")}<tspan dy="7" fill={C.see}>/3 + C</tspan></T>
      <T x="180" y="314" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.grau} opacity={allg}>Allgemein: x{hoch("n")}<tspan dy="7"> → x</tspan>{hoch("n+1")}<tspan dy="7"> / (n + 1) + C</tspan></T>
    </g>
  );
}

/* ======================================================================
   SZENE 5 · Bestimmtes Integral: Streifen und Hauptsatz
   f(x) = x² von a = 1 bis b = 3,  F(x) = x³/3,  ∫ = 9 − 1/3 = 26/3
   ====================================================================== */
const INT_A = 1, INT_B = 3;
const intF = (x) => x * x;
const riemann = (n) => { const h = (INT_B - INT_A) / n; let s = 0; for (let i = 0; i < n; i++) s += intF(INT_A + i * h) * h; return s; };
const komma = (z) => z.toFixed(2).replace(".", ",");
const STUFEN = [4, 8, 16, 50];
const INTEGRAL_SCHRITTE = [
  { von: 0, text: "Gesucht ist die Fläche unter dem Graphen von f(x) = x² zwischen den Grenzen a = 1 und b = 3. Genau das ist das bestimmte Integral von 1 bis 3." },
  { von: 4.5, text: `Erste Näherung: Wir zerlegen die Fläche in 4 Streifen. Jeder Streifen ist ein Rechteck, die Höhe liest du am linken Rand ab. Alle Rechtecke zusammen haben die Fläche ${komma(riemann(4))}, etwas zu wenig.` },
  { von: 9.2, text: `Mit mehr Streifen wird die Näherung besser: 8 Streifen ergeben ${komma(riemann(8))}, 16 Streifen ${komma(riemann(16))} und 50 Streifen ${komma(riemann(50))}. Die Werte laufen auf eine feste Zahl zu.` },
  { von: 16, text: "Das geht auch ganz ohne Streifen: Der Hauptsatz sagt, die Fläche ist F(b) − F(a), wobei F eine Stammfunktion von f ist. Für f(x) = x² ist F(x) = x³/3. Wir setzen die obere und die untere Grenze ein." },
  { von: 21, text: "F(3) = 9 und F(1) = 1/3. Die Fläche ist also 9 − 1/3 = 26/3 ≈ 8,67. Genau diese Zahl haben die Streifen immer besser getroffen." },
];

function integralZeichne(t) {
  const sx = (x) => 30 + 100 * (x - 0.5), sy = (y) => 230 - 18 * y;
  const reveal = lauf(t, 0.2, 2);
  const region = lauf(t, 2.2, 3.6);
  const marke = lauf(t, 2.6, 3.8);
  const betont = lauf(t, 21, 22.2);
  const kurve = (von, bis) => {
    let d = "";
    for (let x = von; x <= bis + 1e-9; x += 0.05) d += `${d ? "L" : "M"}${sx(x).toFixed(1)} ${sy(intF(x)).toFixed(1)}`;
    return d;
  };
  const flaeche = (() => {
    let d = `M${sx(INT_A)} ${sy(0)}`;
    for (let x = INT_A; x <= INT_B + 1e-9; x += 0.05) d += `L${sx(x).toFixed(1)} ${sy(intF(x)).toFixed(1)}`;
    return `${d}L${sx(INT_B)} ${sy(0)}Z`;
  })();
  const fenster = [[4.8, 9.6], [9.6, 11.6], [11.6, 13.6], [13.6, 16.4]].map(([a, b]) => lauf(t, a, a + 0.9) * (1 - lauf(t, b, b + 0.9)));
  const g0 = lauf(t, 4.8, 6.6);
  const rechtecke = (n, grow) => {
    const h = (INT_B - INT_A) / n, breite = 100 * h;
    return Array.from({ length: n }, (_, i) => {
      const x0 = INT_A + i * h, hoehe = 18 * intF(x0) * grow;
      return <rect key={i} x={sx(x0)} y={230 - hoehe} width={Math.max(0.6, breite - (n > 20 ? 0.4 : 1.6))} height={hoehe} fill={C.flaggold} stroke={C.gold} strokeWidth={n > 20 ? 0.3 : 0.9} opacity="0.85" />;
    });
  };
  const hs1 = lauf(t, 16.8, 18.2), hs2 = lauf(t, 18.6, 20), hs3 = lauf(t, 21.4, 22.8);
  return (
    <g>
      {/* Achse, Fläche, Kurve */}
      <line x1="18" y1="230" x2="344" y2="230" stroke={C.hellgrau} strokeWidth="1.3" opacity="0.8" />
      <path d={flaeche} fill={C.himmel} opacity={0.45 * region + 0.3 * betont} />
      {STUFEN.map((n, k) => fenster[k] > 0.001 && <g key={n} opacity={fenster[k]}>{rechtecke(n, k === 0 ? g0 : 1)}</g>)}
      <path d={kurve(0.5, 0.5 + 2.8 * reveal)} fill="none" stroke={C.see} strokeWidth="3" strokeLinecap="round" />
      <T x="22" y="46" fontSize="14" fontWeight="800" fill={C.seeTief} opacity={reveal > 0.9 ? 1 : 0}>f(x) = x{hoch("2")}</T>

      {/* Grenzen a und b */}
      <g opacity={marke}>
        <line x1={sx(INT_A)} y1="230" x2={sx(INT_A)} y2={sy(intF(INT_A))} stroke={C.gold} strokeWidth="2" strokeDasharray="4 3" />
        <line x1={sx(INT_B)} y1="230" x2={sx(INT_B)} y2={sy(intF(INT_B))} stroke={C.gold} strokeWidth="2" strokeDasharray="4 3" />
        <T x={sx(INT_A)} y="248" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.gold}>a = 1</T>
        <T x={sx(INT_B)} y="248" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.gold}>b = 3</T>
      </g>

      {/* Streifen-Anzeige */}
      {STUFEN.map((n, k) => (
        <g key={n} opacity={fenster[k]}>
          <T x="180" y="278" textAnchor="middle" fontSize="19" fontWeight="800" fill={C.tinte}>{n} Streifen ≈ <tspan fill={C.gold}>{komma(riemann(n))}</tspan></T>
          {k === 0 && <T x="180" y="300" textAnchor="middle" fontSize="13" fontWeight="500" fill={C.grau}>etwas zu wenig – oben fehlen Stückchen</T>}
          {k === 3 && <T x="180" y="300" textAnchor="middle" fontSize="13" fontWeight="500" fill={C.grau}>immer näher an einer festen Zahl</T>}
        </g>
      ))}

      {/* Hauptsatz */}
      <g opacity={hs1}>
        <T x="26" y="278" fontSize="32" fontWeight="300" fill={C.tinte}>∫</T>
        <T x="43" y="262" fontSize="11" fontWeight="700" fill={C.gold}>3</T>
        <T x="41" y="288" fontSize="11" fontWeight="700" fill={C.gold}>1</T>
        <T x="58" y="276" fontSize="18" fontWeight="700" fill={C.tinte}>x{hoch("2")}<tspan dy="7"> dx</tspan></T>
        <T x="118" y="276" fontSize="18" fontWeight="800" fill={C.tinte}>= <tspan fill={C.see}>F(3)</tspan> − <tspan fill={C.gold}>F(1)</tspan></T>
      </g>
      <T x="26" y="310" fontSize="14" fontWeight="600" fill={C.grau} opacity={hs2}>mit F(x) = x{hoch("3")}<tspan dy="7"> / 3</tspan></T>
      <T x="26" y="338" fontSize="20" fontWeight="800" fill={C.tinte} opacity={hs3}>= <tspan fill={C.see}>9</tspan> − <tspan fill={C.gold}>1/3</tspan> = 26/3 ≈ 8,67</T>
    </g>
  );
}

/* Für weitere Szenen in anderen Dateien (Kopfrechnen: funcKopfVideo.jsx) */
export { lauf, T, wurzelZeichne };   // wurzelZeichne: Kontaktbogen (scripts/wurzel-blatt.mjs)

/* ---------- Szenen-Auswahl ---------- */
export const INFO = {
  produkt: { titel: "Produktregel am Rechteck", unter: "Warum beim Ableiten zwei Streifen entstehen" },
  kette: { titel: "Kettenregel als Verstärkerkette", unter: "Warum die innere Ableitung nie fehlen darf" },
  stamm: { titel: "Stammfunktion: Ableiten rückwärts", unter: "Warum durch den neuen Exponenten geteilt wird – und warum + C" },
  integral: { titel: "Fläche unter der Kurve und der Hauptsatz", unter: "Vom Streifen-Zählen zu F(b) − F(a)" },
  wurzel: { titel: "Wurzel aus vierstelligen Zahlen", unter: "Knapp zwei Minuten: Quadratzahlen bis 10, Zehnerquadrate, letzte Ziffern" },
};

function ProduktSzene() {
  return <Player szene={{ dauer: 22, hoehe: 326, schritte: PRODUKT_SCHRITTE, zeichne: produktZeichne,
    beschreibung: "Animation: Ein Rechteck mit den Seiten u und v wächst um zwei Streifen u′·v und u·v′, die kleine Ecke Δu·Δv verschwindet. Daraus folgt die Produktregel." }} />;
}
function KetteSzene() {
  return <Player szene={{ dauer: 26, hoehe: 322, schritte: KETTE_SCHRITTE, zeichne: ketteZeichne,
    beschreibung: "Animation: Ein kleiner Zuwachs Δx wird in der Kette zuerst mit 2 und dann mit 3 multipliziert, insgesamt mit 6. Das ist äußere mal innere Ableitung." }} />;
}
function WurzelSzene() {
  const [N, setN] = useState(WURZEL_START);
  const I = wurzelInfo(N);
  return (
    <div>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: C.grau, marginBottom: 8 }}>Beispiel wählen</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }} role="group" aria-label="Beispielzahl">
        {WURZEL_BEISPIELE.map((z) => (
          <button key={z} type="button" aria-pressed={z === N} onClick={() => setN(z)} className="erk-pille" data-wurzel-beispiel={z}
            style={{ minHeight: 40, padding: "0 14px", borderRadius: 999, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer",
              border: `1.5px solid ${z === N ? C.see : C.linie}`, background: z === N ? C.see : C.weiss, color: z === N ? C.weiss : C.see }}>
            {z}
          </button>
        ))}
      </div>
      <Player key={N} szene={{ dauer: wurzelZeiten(I.zwei).dauer, hoehe: 490, schritte: wurzelSchritte(I), zeichne: (t) => wurzelZeichne(t, I),
        beschreibung: wurzelBeschreibung(I) }} />
    </div>
  );
}
function StammSzene() {
  return <Player szene={{ dauer: 26, hoehe: 326, schritte: STAMM_SCHRITTE, zeichne: stammZeichne,
    beschreibung: "Animation: Ableiten rückwärts. Aus x² wird x³, geteilt durch 3, also x³/3. Eine Konstante C verschiebt die Kurve, die Steigung bleibt gleich." }} />;
}
function IntegralSzene() {
  return <Player szene={{ dauer: 25, hoehe: 350, schritte: INTEGRAL_SCHRITTE, zeichne: integralZeichne,
    beschreibung: "Animation: Die Fläche unter x² zwischen 1 und 3 wird mit 4, 8, 16 und 50 Streifen genähert. Der Hauptsatz liefert den genauen Wert F(3) − F(1) = 26/3." }} />;
}
export const SZENEN = { produkt: ProduktSzene, kette: KetteSzene, stamm: StammSzene, integral: IntegralSzene, wurzel: WurzelSzene };

/* ======================================================================
   AUFKLAPP-KARTE
   art: "produkt" | "kette" | "stamm" | "integral" | "wurzel"
   ====================================================================== */
export function ErklaerAnimation({ art, style, kompakt = false }) {
  const [offen, setOffen] = useState(false);
  const id = useId();
  const info = INFO[art];
  const Szene = SZENEN[art];
  if (!info || !Szene) return null;
  /* Kompakt: nur ein kleiner Knopf; die Szene klappt darunter als Karte auf */
  if (kompakt) return (
    <div style={{ margin: "0 0 12px", ...style }}>
      <button type="button" aria-expanded={offen} aria-controls={id} onClick={() => setOffen((o) => !o)}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px 0 6px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
          fontSize: 13.5, fontWeight: 700, color: C.see, background: C.weiss, border: `1.5px solid ${offen ? C.see : C.linie}`, whiteSpace: "nowrap" }}>
        <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "radial-gradient(130% 150% at 90% 10%, #2A2210 0%, #0E0C08 55%, #050404 100%)", border: `1px solid ${C.flaggold}` }}>
          <svg width="11" height="11" viewBox="0 0 18 18"><path d="M5 2.5v13l11-6.5z" fill={C.flaggold} /></svg>
        </span>
        <span>Erkläranimation</span>
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: offen ? "rotate(180deg)" : "none", transition: "transform .2s ease" }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {offen && (
        <div id={id} data-aufklapp-inhalt="" style={{ marginTop: 10, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", padding: "14px 16px 18px" }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3, marginBottom: 8 }}>{info.titel}</div>
          <Szene />
        </div>
      )}
    </div>
  );
  return (
    <div style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", margin: "20px 0 24px", overflow: "hidden", ...style }}>
      <button type="button" aria-expanded={offen} aria-controls={id} onClick={() => setOffen((o) => !o)} className="erk-knopf"
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
        <span aria-hidden="true" style={{ width: 42, height: 42, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "radial-gradient(130% 150% at 90% 10%, #2A2210 0%, #0E0C08 55%, #050404 100%)", border: `1px solid ${C.flaggold}` }}>
          <svg width="16" height="16" viewBox="0 0 18 18"><path d="M5 2.5v13l11-6.5z" fill={C.flaggold} /></svg>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 2 }}>Erkläranimation</span>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{info.titel}</span>
          <span style={{ display: "block", fontSize: 12.5, fontWeight: 400, color: C.grau, lineHeight: 1.45, marginTop: 2 }}>{info.unter}</span>
        </span>
        <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: offen ? C.see : "#EEF2F8", transition: "background .2s ease" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={offen ? C.weiss : C.see} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: offen ? "rotate(180deg)" : "none", transition: "transform .2s ease" }}><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </button>
      {offen && (
        <div id={id} data-aufklapp-inhalt="" style={{ padding: "2px 16px 18px" }}>
          <Szene />
        </div>
      )}
    </div>
  );
}
