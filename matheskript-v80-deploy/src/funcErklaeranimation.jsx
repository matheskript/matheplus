import React, { useState, useRef, useEffect, useId } from "react";
import { C } from "./base1.jsx";
import { zw } from "./ui2.jsx";

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
   vierstelligen Quadratzahlen).
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
   SZENE 3 · Wurzel aus vierstelligen Quadratzahlen
   Drei Schritte: Endziffer · Zehnerstelle · Mitte testen
   ====================================================================== */
const WURZEL_BEISPIELE = [1296, 2025, 5329, 7569, 9604];
const ENDEN = [[1, "1 | 9"], [4, "2 | 8"], [9, "3 | 7"], [6, "4 | 6"], [5, "5"], [0, "0"]];
const KANDIDATEN = { 0: [0], 1: [1, 9], 4: [2, 8], 5: [5], 6: [4, 6], 9: [3, 7] };

function wurzelInfo(N) {
  const n = Math.round(Math.sqrt(N));
  const ende = N % 10;
  const kand = KANDIDATEN[ende] || [n % 10];
  const vorne = Math.floor(N / 100);
  const z = Math.floor(Math.sqrt(vorne)); // Zehnerstelle
  const unten = z * z, oben = (z + 1) * (z + 1);
  const zwei = kand.length === 2;
  const mitte = 10 * z + 5;
  const kleiner = N < mitte * mitte;
  const gewaehlt = zwei ? (kleiner ? 10 * z + kand[0] : 10 * z + kand[1]) : 10 * z + kand[0];
  return { N, n, ende, kand, vorne, z, unten, oben, zwei, mitte, kleiner, gewaehlt, kandZahlen: kand.map((k) => 10 * z + k) };
}

function wurzelSchritte(I) {
  const [a, b] = I.kand;
  const s1 = I.zwei
    ? `Schau nur auf die letzte Ziffer: ${I.ende}. Eine Quadratzahl, die auf ${I.ende} endet, hat eine Wurzel, die auf ${a} oder ${b} endet (${a}² = ${a * a} und ${b}² = ${b * b}).`
    : `Schau nur auf die letzte Ziffer: ${I.ende}. Endet eine Quadratzahl auf ${I.ende}, dann endet ihre Wurzel immer auf ${a} (${a}² = ${a * a}).`;
  const s2 = `Streiche die letzten zwei Ziffern: Es bleibt ${I.vorne}. Das liegt zwischen ${I.unten} = ${I.z}² und ${I.oben} = ${I.z + 1}². Die Wurzel beginnt also mit ${I.z} und liegt zwischen ${I.z * 10} und ${(I.z + 1) * 10}.`;
  const s3 = I.zwei
    ? `Es bleiben zwei Kandidaten: ${I.kandZahlen[0]} und ${I.kandZahlen[1]}. Teste die Mitte ${I.mitte}: ${I.z} · ${I.z + 1} = ${I.z * (I.z + 1)}, dann 25 anhängen, also ${I.mitte}² = ${I.mitte * I.mitte}. Weil ${I.N} ${I.kleiner ? "kleiner" : "größer"} ist, nimmst du ${I.kleiner ? "den kleineren" : "den größeren"}: ${I.gewaehlt}.`
    : `Es bleibt nur ein Kandidat: ${I.gewaehlt}. Hier brauchst du keinen Mitte-Test.`;
  const s4 = `Fertig: √${I.N} = ${I.gewaehlt}. Probe: ${I.gewaehlt}² = ${I.N}. Du brauchst dafür nur die Quadratzahlen bis 10² und die Mitte-Regel.`;
  return [{ von: 0, text: s1 }, { von: 5, text: s2 }, { von: 10, text: s3 }, { von: 15, text: s4 }];
}

function wurzelZeichne(t, I) {
  const ziff = String(I.N).split("");
  const bx = (i) => 98 + i * 52;
  const h1 = lauf(t, 0.6, 1.6);
  const tab = lauf(t, 1.2, 2.2);
  const hl = lauf(t, 2.4, 3.4);
  const h2 = lauf(t, 5.4, 6.4);
  const nl = lauf(t, 6.0, 7.0);
  const mk = lauf(t, 7.2, 8.8);
  const zz = lauf(t, 8.8, 9.8);
  const pl = lauf(t, 10.4, 11.4);
  const mt = lauf(t, 12.0, 13.0);
  const ent = lauf(t, 13.6, 14.6);
  const wahl = lauf(t, 13.8, 14.8);
  const erg = lauf(t, 15.4, 16.6);
  const col = ENDEN.findIndex(([e]) => e === I.ende);
  const frac = (I.vorne - I.unten) / (I.oben - I.unten);
  const mx = 50 + 260 * frac * mk;
  const pillX = I.zwei ? [130, 230] : [180];
  return (
    <g>
      {/* Wurzelzeichen mit den Ziffern */}
      <path d="M60 72 L67 66 L77 94 L91 40 L300 40" stroke={C.tinte} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {ziff.map((d, i) => (
        <g key={i}>
          <rect x={bx(i)} y="50" width="44" height="50" rx="9" fill={C.sand} stroke={C.linie} strokeWidth="1.5" />
          <T x={bx(i) + 22} y="86" textAnchor="middle" fontSize="30" fontWeight="800" fill={C.tinte}>{d}</T>
        </g>
      ))}
      {/* Markierung Endziffer */}
      <rect x={bx(3)} y="50" width="44" height="50" rx="9" fill={C.flaggold} fillOpacity={0.35 * h1} stroke={C.flaggold} strokeWidth="2.4" strokeOpacity={h1} />
      {/* Markierung vordere Ziffern */}
      <rect x={bx(0)} y="50" width="96" height="50" rx="9" fill={C.see} fillOpacity={0.14 * h2} stroke={C.see} strokeWidth="2.4" strokeOpacity={h2} />

      {/* Tabelle: Endziffer der Zahl → Endziffer der Wurzel */}
      <g opacity={tab}>
        <T x="180" y="126" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.hellgrau} letterSpacing="0.06em">ENDZIFFER: ZAHL → WURZEL</T>
        {ENDEN.map(([e, w], i) => {
          const an = i === col;
          const x = 24 + i * 52;
          return (
            <g key={e}>
              <rect x={x + 2} y="134" width="48" height="24" rx="6" fill={an ? C.flaggold : C.silberHell} fillOpacity={an ? 0.25 + 0.75 * hl : 1} />
              <T x={x + 26} y="151" textAnchor="middle" fontSize="14.5" fontWeight="700" fill={C.tinte}>{e}</T>
              <rect x={x + 2} y="162" width="48" height="24" rx="6" fill={an ? C.flaggold : C.himmel} fillOpacity={an ? 0.25 + 0.75 * hl : 1} />
              <T x={x + 26} y="179" textAnchor="middle" fontSize="14" fontWeight={an ? 800 : 600} fill={an ? C.seeTief : C.see}>{w}</T>
            </g>
          );
        })}
      </g>

      {/* Schritt 2: Zehnerstelle über die Zahlengerade */}
      <T x="180" y="216" textAnchor="middle" fontSize="14" fontWeight="600" fill={C.grau} opacity={h2}>Ohne die letzten zwei Ziffern bleibt <tspan fontWeight="800" fill={C.see}>{I.vorne}</tspan></T>
      <g opacity={nl}>
        <path d="M50 252 H310" stroke={C.hellgrau} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 245 V259 M310 245 V259" stroke={C.tinte} strokeWidth="2.5" strokeLinecap="round" />
        <T x="50" y="280" textAnchor="middle" fontSize="13.5" fontWeight="700" fill={C.tinte}>{I.unten} = {I.z}²</T>
        <T x="310" y="280" textAnchor="middle" fontSize="13.5" fontWeight="700" fill={C.tinte}>{I.oben} = {I.z + 1}²</T>
      </g>
      <g opacity={mk}>
        <circle cx={mx} cy="252" r="8" fill={C.see} stroke={C.weiss} strokeWidth="2" />
        <T x={mx} y="238" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.see}>{I.vorne}</T>
      </g>
      <T x="180" y="308" textAnchor="middle" fontSize="15.5" fontWeight="800" fill={C.see} opacity={zz}>Die Wurzel beginnt mit {I.z}  →  {I.z}_</T>

      {/* Schritt 3: Kandidaten und Mitte */}
      <g opacity={pl}>
        {I.kandZahlen.map((k, i) => {
          const gewinner = k === I.gewaehlt;
          const dim = I.zwei ? 1 - 0.62 * wahl * (gewinner ? 0 : 1) : 1;
          const an = gewinner && wahl > 0.5;
          return (
            <g key={k} opacity={dim}>
              <rect x={pillX[i] - 42} y="324" width="84" height="34" rx="17" fill={an ? C.smaragd : C.himmel} stroke={an ? C.smaragd : C.see} strokeWidth="1.8" />
              <T x={pillX[i]} y="347" textAnchor="middle" fontSize="18" fontWeight="800" fill={an ? C.weiss : C.see}>{k}</T>
            </g>
          );
        })}
      </g>
      {I.zwei ? (
        <>
          <T x="180" y="382" textAnchor="middle" fontSize="13.5" fontWeight="600" fill={C.grau} opacity={mt}>
            Mitte: {I.mitte}² = {I.z} · {I.z + 1} → {I.z * (I.z + 1)}, dann 25 = <tspan fontWeight="800" fill={C.tinte}>{I.mitte * I.mitte}</tspan>
          </T>
          <T x="180" y="404" textAnchor="middle" fontSize="14.5" fontWeight="800" fill={C.tinte} opacity={ent}>
            {I.N} {I.kleiner ? "<" : ">"} {I.mitte * I.mitte}  →  {I.kleiner ? "der kleinere" : "der größere"}: <tspan fill={C.smaragd}>{I.gewaehlt}</tspan>
          </T>
        </>
      ) : (
        <T x="180" y="382" textAnchor="middle" fontSize="13.5" fontWeight="600" fill={C.grau} opacity={mt}>Nur eine Möglichkeit, kein Mitte-Test nötig</T>
      )}

      {/* Schritt 4: Ergebnis */}
      <g opacity={erg}>
        <T x="180" y="442" textAnchor="middle" fontSize="27" fontWeight="800" fill={C.smaragd}>√{I.N} = {I.gewaehlt}</T>
        <T x="180" y="463" textAnchor="middle" fontSize="13.5" fontWeight="600" fill={C.grau}>Probe: {I.gewaehlt}² = {I.N} ✓</T>
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

/* ---------- Szenen-Auswahl ---------- */
const INFO = {
  produkt: { titel: "Produktregel am Rechteck", unter: "Warum beim Ableiten zwei Streifen entstehen" },
  kette: { titel: "Kettenregel als Verstärkerkette", unter: "Warum die innere Ableitung nie fehlen darf" },
  stamm: { titel: "Stammfunktion: Ableiten rückwärts", unter: "Warum durch den neuen Exponenten geteilt wird – und warum + C" },
  integral: { titel: "Fläche unter der Kurve und der Hauptsatz", unter: "Vom Streifen-Zählen zu F(b) − F(a)" },
  wurzel: { titel: "Wurzel aus vierstelligen Zahlen", unter: "Der Drei-Schritt-Trick für √10\u00A0000" },
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
  const [N, setN] = useState(5329);
  const I = wurzelInfo(N);
  return (
    <div>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: C.grau, marginBottom: 8 }}>Beispiel wählen</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }} role="group" aria-label="Beispielzahl">
        {WURZEL_BEISPIELE.map((z) => (
          <button key={z} type="button" aria-pressed={z === N} onClick={() => setN(z)} className="erk-pille"
            style={{ minHeight: 40, padding: "0 14px", borderRadius: 999, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer",
              border: `1.5px solid ${z === N ? C.see : C.linie}`, background: z === N ? C.see : C.weiss, color: z === N ? C.weiss : C.see }}>
            {z}
          </button>
        ))}
      </div>
      <Player key={N} szene={{ dauer: 20, hoehe: 474, schritte: wurzelSchritte(I), zeichne: (t) => wurzelZeichne(t, I),
        beschreibung: `Animation: Wurzel aus ${N} in drei Schritten. Endziffer, Zehnerstelle über die Quadratzahlen, Mitte testen. Ergebnis ${I.gewaehlt}.` }} />
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
const SZENEN = { produkt: ProduktSzene, kette: KetteSzene, stamm: StammSzene, integral: IntegralSzene, wurzel: WurzelSzene };

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
