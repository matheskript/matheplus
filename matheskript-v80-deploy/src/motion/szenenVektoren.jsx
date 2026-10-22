/* ============================================================
   Szenen der Vektoren-Seiten (Oberstufe): Normalenform und Hesse-Normalenform.
   Präfix v_. Vertrag siehe kern.jsx. Abspieler: <Motion thema="vektoren" …> in funcUnterstufeMotion.jsx.

   Beide Szenen zeigen DIESELBE Ebene wie das Beispiel a) der Seite Hesse-Normalenform (funcHesse.jsx):
     n⃗ = (1 | 2 | 2), P(−2 | 4 | 0), E: x₁ + 2x₂ + 2x₃ = 6, u⃗ = (0 | 1 | −1), v⃗ = (2 | −1 | 0) in E.
   Die Kamera ist dieselbe orthografische Projektion wie in den 3D-Werkzeugen (func16 kamera),
   nur mit festem Blickwinkel – so sieht die Animation aus wie das Werkzeug darunter.

   Farben: Ebene und n⃗ Blau, X/Q und PX⃗ Gold, „senkrecht“/„= 0“/Lot Grün, „≠ 0“ Granat.
   Vektorpfeile über Buchstaben werden gezeichnet (VecTx) – der Unicode-Kombinationspfeil fehlt in Montserrat.
   ============================================================ */
import React from "react";
import { B, F, Tx, Strich, Pille, Puls, breite, de, mix, klemm, teil, sanft, raus } from "./kern.jsx";

/* ---------- Geometrie ---------- */
const N = [1, 2, 2], P0 = [-2, 4, 0], U = [0, 1, -1], V = [2, -1, 0];
const LN = 3;                                  // |n⃗|
const N0 = N.map((x) => x / LN);               // n⃗₀
const add = (a, b) => a.map((x, i) => x + b[i]);
const sub = (a, b) => a.map((x, i) => x - b[i]);
const mul = (a, c) => a.map((x) => x * c);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const inE = (s, t) => add(P0, add(mul(U, s), mul(V, t)));

/* Kamera: fester Blick (wie func16 kamera(phi, theta)), u nach rechts, v nach oben */
const PHI = 0.2, THETA = 0.35;
const cp = Math.cos(PHI), sp = Math.sin(PHI), ct = Math.cos(THETA), st = Math.sin(THETA);
const SC = 36, OX = 64.6, OY = 154.4;           // Maßstab und Bildschirmlage des Ursprungs (P liegt dann bei 220 | 140)
const pr = ([x1, x2, x3]) => { const u = -x1 * sp + x2 * cp, w = x1 * cp + x2 * sp; return [OX + SC * u, OY - SC * (x3 * ct - w * st)]; };
const n1 = (v) => Math.round(v * 10) / 10;
const pstr = (p) => `${n1(p[0])},${n1(p[1])}`;
const ECKEN = [[-1.4, -1.4], [1.4, -1.4], [1.4, 1.4], [-1.4, 1.4]].map(([s, t]) => pr(inE(s, t)));
const EBENE_PFAD = ECKEN.map((p, i) => `${i ? "L" : "M"}${pstr(p)}`).join(" ") + " Z";
const zahl = (x) => de(Math.round(x * 100) / 100);
/* eine Nachkommastelle, ganze Zahlen ohne Komma („3“, „−1,5“) */
const dez = (v) => { const r = Math.round(v * 10) / 10; return de(r, Number.isInteger(r) ? 0 : 1); };
const kl = (x) => (x < 0 ? `(${zahl(x)})` : zahl(x));

/* ---------- Zeichen-Bausteine ---------- */

/* Text mit Vektorpfeil darüber: n⃗, PX⃗, x⃗ … (a = "start" | "middle") */
function VecTx({ x, y, text, g = 13, f = F.tinte, w = 800, a = "middle", o = 1, tief }) {
  if (o <= 0) return null;
  const br = breite(text, g), xl = a === "middle" ? x - br / 2 : x;
  const ya = y - g * 1.02, xe = xl + br + 1;
  return (
    <g opacity={o}>
      <Tx x={xl} y={y} g={g} f={f} w={w} a="start" fontStyle="italic">{text}</Tx>
      {tief && <Tx x={xl + br + 1} y={y + g * 0.25} g={g * 0.62} f={f} w={w} a="start">{tief}</Tx>}
      <line x1={xl - 1} y1={ya} x2={xe} y2={ya} stroke={f} strokeWidth={g * 0.09} strokeLinecap="round" />
      <path d={`M${xe - g * 0.28} ${ya - g * 0.2} L${xe} ${ya} L${xe - g * 0.28} ${ya + g * 0.2}`} fill="none" stroke={f} strokeWidth={g * 0.09} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/* Eine Formelzeile aus Teilen: [{ t, f, w, vec, tief, g }] – nebeneinander ab x (a = start | middle | end) */
function Zeile({ x, y, g = 13, a = "middle", teile, o = 1 }) {
  if (o <= 0) return null;
  const sicht = teile.filter(Boolean);
  /* Lücke zwischen zwei Teilen: nach „(“ und vor „)“ fast keine; breite() schätzt Fließtext etwas zu breit (× 0,9) */
  const luecke = (i) => (i >= sicht.length - 1 ? 0 : sicht[i].t === "(" || sicht[i + 1].t === ")" ? 1 : g * 0.28);
  const breiten = sicht.map((p) => (p.vec ? breite(p.t, p.g || g) : breite(p.t, p.g || g) * 0.9) + (p.tief ? breite(p.tief, (p.g || g) * 0.62) + 1 : 0));
  const gesamt = breiten.reduce((s, w, i) => s + w + luecke(i), 0);
  let cx = a === "middle" ? x - gesamt / 2 : a === "end" ? x - gesamt : x;
  return (
    <g opacity={o}>
      {sicht.map((p, i) => {
        const el = p.vec
          ? <VecTx key={i} x={cx} y={y} text={p.t} tief={p.tief} g={p.g || g} f={p.f || F.tinte} w={p.w || 800} a="start" />
          : <Tx key={i} x={cx} y={y} g={p.g || g} f={p.f || F.tinte} w={p.w || 700} a="start">{p.t}</Tx>;
        cx += breiten[i] + luecke(i);
        return el;
      })}
    </g>
  );
}

/* Pfeil im Raum (von → bis), wächst mit u; Spitze passend zur Linienstärke */
function Pfeil3({ von, bis, u = 1, f = F.tinte, b = 2.4, o = 1, strich, hof = true }) {
  if (u <= 0 || o <= 0) return null;
  const [x1, y1] = pr(von), [xb, yb] = pr(bis);
  const x2 = mix(x1, xb, u), y2 = mix(y1, yb, u);
  const l = Math.hypot(x2 - x1, y2 - y1);
  if (l < 1) return null;
  const w = Math.atan2(y2 - y1, x2 - x1), k = Math.min(b * 3.4 + 3, l * 0.6), h = k * 0.48;
  const xe = x2 - k * Math.cos(w), ye = y2 - k * Math.sin(w);
  return (
    <g opacity={o}>
      {hof && <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={F.weiss} strokeWidth={b + 2.4} strokeLinecap="round" opacity="0.85" />}
      <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={f} strokeWidth={b} strokeLinecap={strich ? "butt" : "round"} strokeDasharray={strich} />
      <path d={`M${n1(x2)} ${n1(y2)} L${n1(xe + h * Math.sin(w))} ${n1(ye - h * Math.cos(w))} L${n1(xe - h * Math.sin(w))} ${n1(ye + h * Math.cos(w))} Z`} fill={f} />
    </g>
  );
}

/* Punkt im Raum mit Beschriftung */
function Punkt3({ p, f, label, o = 1, r = 5, dx = 8, dy = -7, lf }) {
  if (o <= 0) return null;
  const [x, y] = pr(p);
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill={f} stroke={F.weiss} strokeWidth="1.8" />
      {label && <Tx x={x + dx} y={y + dy} g={13} f={lf || f} w={800} a="start" fontStyle="italic" stroke={F.weiss} strokeWidth="3" paintOrder="stroke">{label}</Tx>}
    </g>
  );
}

/* Rechter-Winkel-Zeichen im Raum: an Punkt p zwischen den Richtungen e1 und e2 (Einheitsvektoren) */
function RechterWinkel3({ p, e1, e2, g = 0.5, f = F.gruen, o = 1 }) {
  if (o <= 0) return null;
  const a = pr(add(p, mul(e1, g))), b = pr(add(p, mul(add(e1, e2), g))), c = pr(add(p, mul(e2, g)));
  const m = pr(add(p, mul(add(e1, e2), g * 0.5)));
  return (
    <g opacity={o}>
      <path d={`M${pstr(a)} L${pstr(b)} L${pstr(c)}`} fill="none" stroke={f} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx={m[0]} cy={m[1]} r="1.8" fill={f} />
    </g>
  );
}

/* Ebene als Parallelogramm + Achsenkreuz-Andeutung (Ursprung) */
function Ebene({ o = 1, label = true, blass = 0 }) {
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <path d={EBENE_PFAD} fill={F.blau} fillOpacity={0.12 - 0.07 * blass} stroke={F.blau} strokeOpacity="0.55" strokeWidth="1.3" strokeLinejoin="round" />
      {label && <Tx x={ECKEN[1][0] - 14} y={ECKEN[1][1] + 1} g={14} f={F.blau} w={800} fontStyle="italic">E</Tx>}
    </g>
  );
}

/* Formelkasten am unteren Rand (volle Breite) */
function Kasten3({ y, h = 34, o = 1, f = F.weiss, rand = F.linie, children }) {
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <rect x={10} y={y} width={B - 20} height={h} rx={11} fill={f} stroke={rand} strokeWidth="1.3" />
      {children}
    </g>
  );
}

/* ---------- Zahlen der Szene 1 ---------- */
/* Stationen von X in der Ebene: (s, t) → PX⃗ = s·u⃗ + t·v⃗ mit n⃗·PX⃗ = 0 */
const STOPS = [[1, 0], [-1, 1], [0, -1], [-1, -1], [1, 1]];
const X_VON = (i) => inE(STOPS[i][0], STOPS[i][1]);
const HOPS = STOPS.length - 1, HOP_MS = 1800, HOP_LAUF = 0.56;   // je Station: 56 % Bewegung, dann Ruhe mit Zahlen

/* Produktzeile n⃗ · PX⃗ = 1·a + 2·b + 2·c = ergebnis (mit Zahlen) */
const produktTeile = (PX, ergebnisFarbe, ergebnisText, mitZahlen = true) => {
  const terme = mitZahlen ? [0, 1, 2].map((i) => `${N[i]}·${kl(PX[i])}`).join(" + ") : null;
  return [
    { t: "n", vec: true, f: F.blau }, { t: "·" }, { t: "PX", vec: true, f: F.goldDunkel }, { t: "=" },
    mitZahlen && { t: terme, w: 700 }, mitZahlen && { t: "=" },
    { t: ergebnisText, f: ergebnisFarbe, w: 900, g: 14.5 },
  ];
};

/* ============================================================
   v_normalenform – Warum (x⃗ − p⃗) · n⃗ = 0 genau die Punkte der Ebene beschreibt
   p: {} (keine Parameter)
   ============================================================ */
const v_normalenform = {
  h: 276,
  label: () => "Ein fester Punkt P und ein beliebiger Punkt X der Ebene: Der Vektor von P nach X liegt in der Ebene, steht senkrecht auf dem Normalenvektor, das Skalarprodukt ist 0 – die Normalenform.",
  ablauf: () => [
    { k: "ebene", ms: 900, text: "Eine Ebene E im Raum." },
    { k: "normale", ms: 1300, text: "Ein Vektor n⃗, der senkrecht auf E steht – auf jeder Richtung in der Ebene: der Normalenvektor." },
    { k: "punktP", ms: 1400, text: "Wir halten einen Punkt der Ebene fest: P, den Aufpunkt." },
    { k: "punktX", ms: 1300, text: "X ist irgendein anderer Punkt der Ebene – beliebig, Hauptsache in E." },
    { k: "orts", ms: 1800, text: "Vom Ursprung O aus zeigen die Ortsvektoren: p⃗ auf P, x⃗ auf X." },
    { k: "differenz", ms: 2000, text: "Zieht man p⃗ von x⃗ ab, bleibt der Vektor von P nach X: x⃗ − p⃗ = PX⃗. Er liegt ganz in der Ebene." },
    { k: "senkrecht", ms: 1800, text: "PX⃗ liegt in E – und n⃗ steht senkrecht auf allem, was in E liegt. Also steht n⃗ senkrecht auf PX⃗." },
    { k: "skalar", ms: 2200, text: "Senkrecht heißt: Das Skalarprodukt ist 0. Denn n⃗ · PX⃗ = |n⃗| · |PX⃗| · cos 90°, und cos 90° = 0." },
    { k: "zahlen", ms: 2200, text: "Mit Zahlen: n⃗ = (1 | 2 | 2) und PX⃗ = (0 | 1 | −1). Nachrechnen: 1·0 + 2·1 + 2·(−1) = 0." },
    { k: "wandern", ms: HOPS * HOP_MS, text: "Egal, wohin X in der Ebene wandert: Die Zahlen ändern sich – das Skalarprodukt bleibt 0." },
    { k: "heben", ms: 1500, text: "Und wenn X die Ebene verlässt? Dann liegt PX⃗ nicht mehr in E …" },
    { k: "oben", ms: 1700, text: "… PX⃗ steht nicht mehr senkrecht auf n⃗ – und das Skalarprodukt ist nicht mehr 0." },
    { k: "zurueck", ms: 1300, text: "Zurück in die Ebene: Das Produkt ist wieder 0." },
    { k: "gleichung", ms: 2600, text: "Genau die Punkte X mit (x⃗ − p⃗) · n⃗ = 0 liegen in E. Das ist die Normalenform der Ebene." },
  ],
  bild: ({ Z, z }) => {
    const uE = Z("ebene"), uN = Z("normale"), uP = Z("punktP"), uX = Z("punktX"), uO = Z("orts"), uD = Z("differenz");
    const uS = Z("senkrecht"), uSk = Z("skalar"), uZ = Z("zahlen"), uW = z("wandern"), uH = Z("heben"), uOb = Z("oben"), uR = Z("zurueck"), uG = Z("gleichung");

    /* Lage von X: Station 0 → Wanderung über die Stationen → am Ende angehoben und zurück */
    let X, stop = 0, ruhe = 1;                   // ruhe: 1 = X steht auf einer Station (Zahlen zeigen)
    if (uW <= 0) X = X_VON(0);
    else if (uW >= 1) { X = X_VON(HOPS); stop = HOPS; }
    else {
      const f = uW * HOPS, i = Math.min(HOPS - 1, Math.floor(f)), r = f - i;
      const lauf = sanft(klemm(r / HOP_LAUF));
      X = add(X_VON(i), mul(sub(X_VON(i + 1), X_VON(i)), lauf));
      stop = r < HOP_LAUF ? i : i + 1;
      ruhe = r < HOP_LAUF ? (r < 0.06 ? 1 - r / 0.06 : 0) : teil(r, HOP_LAUF, HOP_LAUF + 0.12);
    }
    const hoehe = 1.5 * (uH > 0 && uR < 1 ? (uR > 0 ? 1 - uR : uH) : 0);     // Anheben entlang n⃗₀
    const Xf = X;                                                              // Fußpunkt in E
    X = add(X, mul(N0, hoehe));
    const PX = sub(X, P0);
    const prod = dot(N, PX);
    const lPX = len(PX) || 1, e = mul(PX, 1 / lPX);
    const nTip = add(P0, mul(N0, LN * uN));

    const [xP, yP] = pr(P0), [xX, yX] = pr(X), [xO, yO] = pr([0, 0, 0]);
    const oO = Math.min(uO, 1 - uS);                                           // Ursprung + Ortsvektoren: rein in „orts“, raus in „senkrecht“
    const inEbene = hoehe < 1e-6;
    const ausserhalb = !inEbene;

    /* Formelkasten unten */
    const yK = 238;
    let kasten = null;
    if (uG > 0) {
      kasten = (
        <Kasten3 y={yK} h={32} o={uG} f={F.blauHell} rand={F.blau}>
          <Zeile x={B / 2 - 54} y={yK + 21} g={14} teile={[
            { t: "(" }, { t: "x", vec: true }, { t: "−" }, { t: "p", vec: true }, { t: ")" }, { t: "·" }, { t: "n", vec: true, f: F.blau }, { t: "=" }, { t: "0", f: F.gruen, w: 900, g: 15 },
          ]} />
          <Tx x={B - 20} y={yK + 21} g={10.5} f={F.blau} w={800} a="end">NORMALENFORM</Tx>
        </Kasten3>
      );
    } else if (uH > 0) {
      const warn = ausserhalb && hoehe > 0.08;
      const voll = uOb > 0 && uR <= 0;
      kasten = (
        <Kasten3 y={yK} h={32} f={warn ? "#FBEAF0" : F.gruenHell} rand={warn ? F.granat : F.gruen}>
          <Zeile x={B / 2} y={yK + 21} g={13} teile={voll
            ? produktTeile(PX, F.granat, `${zahl(prod)} ≠ 0`, true)
            : produktTeile(PX, warn ? F.granat : F.gruen, warn ? `${zahl(prod)} ≠ 0` : "0", false)} />
        </Kasten3>
      );
    } else if (uZ > 0) {
      const mitZahlen = uW <= 0 ? uZ > 0.35 : ruhe > 0.5;
      kasten = (
        <Kasten3 y={yK} h={32} f={F.gruenHell} rand={F.gruen}>
          <Zeile x={B / 2} y={yK + 21} g={13} teile={produktTeile(uW <= 0 ? sub(X_VON(0), P0) : sub(X_VON(stop), P0), F.gruen, "0", mitZahlen)}
            o={uW <= 0 ? 1 : Math.max(0.35, ruhe)} />
        </Kasten3>
      );
    } else if (uSk > 0) {
      kasten = (
        <Kasten3 y={yK} h={32} o={uSk}>
          <Zeile x={B / 2} y={yK + 21} g={13} teile={[
            { t: "n", vec: true, f: F.blau }, { t: "·" }, { t: "PX", vec: true, f: F.goldDunkel }, { t: "=" },
            { t: "|n|·|PX|·cos 90°", w: 700 }, { t: "=" }, { t: "0", f: F.gruen, w: 900, g: 14.5 },
          ]} />
        </Kasten3>
      );
    } else if (uD > 0) {
      kasten = (
        <Kasten3 y={yK} h={32} o={teil(uD, 0.3, 0.8)} f={F.goldHell} rand={F.gold}>
          <Zeile x={B / 2} y={yK + 21} g={13.5} teile={[
            { t: "x", vec: true }, { t: "−" }, { t: "p", vec: true }, { t: "=" }, { t: "PX", vec: true, f: F.goldDunkel }, { t: "– liegt in E", f: F.goldDunkel, w: 700, g: 12 },
          ]} />
        </Kasten3>
      );
    }

    return (
      <>
        {/* Hinter der Ebene: Ursprung und Ortsvektoren */}
        {oO > 0 && (
          <g opacity={oO}>
            <circle cx={xO} cy={yO} r="3" fill={F.grau} />
            <Tx x={xO - 8} y={yO + 14} g={12} f={F.grau} w={800} fontStyle="italic">O</Tx>
            <Pfeil3 von={[0, 0, 0]} bis={P0} u={teil(uO, 0.05, 0.5)} f={F.grau} b={1.8} strich="5 3" hof={false} />
            <Pfeil3 von={[0, 0, 0]} bis={X} u={teil(uO, 0.45, 0.95)} f={F.grau} b={1.8} strich="5 3" hof={false} />
            {teil(uO, 0.3, 0.6) > 0 && <VecTx x={mix(xO, xP, 0.55)} y={mix(yO, yP, 0.55) - 9} text="p" g={12.5} f={F.grau} o={teil(uO, 0.3, 0.6)} />}
            {teil(uO, 0.75, 1) > 0 && <VecTx x={mix(xO, xX, 0.55)} y={mix(yO, yX, 0.55) + 17} text="x" g={12.5} f={F.grau} o={teil(uO, 0.75, 1)} />}
          </g>
        )}
        <Ebene o={uE} blass={oO} />
        {/* Lot vom angehobenen X auf die Ebene */}
        {hoehe > 0.02 && (
          <g>
            <Strich x1={pr(Xf)[0]} y1={pr(Xf)[1]} x2={xX} y2={yX} f={F.granat} b={1.4} strokeDasharray="4 3" />
            <circle cx={pr(Xf)[0]} cy={pr(Xf)[1]} r="2.6" fill={F.granat} />
          </g>
        )}
        {/* n⃗ */}
        <Pfeil3 von={P0} bis={nTip} u={uN > 0 ? 1 : 0} f={F.blau} b={3.2} />
        {uN > 0.6 && <VecTx x={pr(nTip)[0] + 8} y={pr(nTip)[1] + 2} text="n" g={14} f={F.blau} a="start" o={teil(uN, 0.6, 1)} />}
        {/* kleines Winkelzeichen „n⃗ senkrecht auf E“ während der Einführung */}
        <RechterWinkel3 p={P0} e1={N0} e2={mul(U, 1 / len(U))} g={0.42} f={F.blau} o={Math.min(teil(uN, 0.5, 1), 1 - uP)} />
        {/* PX⃗ und das Winkelzeichen */}
        <Pfeil3 von={P0} bis={X} u={uD > 0 ? raus(klemm(uD * 1.6)) : 0} f={F.gold} b={2.8} />
        <RechterWinkel3 p={P0} e1={N0} e2={e} g={0.5} f={F.gruen} o={inEbene ? uS : Math.max(0, 1 - hoehe * 6)} />
        {uD > 0.55 && inEbene && uW <= 0 && uSk <= 0 && <VecTx x={(xP + xX) / 2 - 16} y={(yP + yX) / 2 + 16} text="PX" g={13} f={F.goldDunkel} o={teil(uD, 0.55, 0.9)} />}
        {/* Punkte */}
        <Punkt3 p={P0} f={F.tinte} label="P" o={uP} dx={-18} dy={16} />
        <Puls x={xP} y={yP} u={teil(uP, 0.1, 0.7)} r={16} f={F.tinte} />
        <Pille x={xP - 62} y={yP + 34} text="fester Punkt (Aufpunkt)" g={10.5} f={F.flaeche} tf={F.grau} o={Math.min(teil(uP, 0.5, 1), 1 - uO)} />
        <Punkt3 p={X} f={F.gold} label="X" o={uX} dx={9} dy={-6} lf={F.goldDunkel} />
        <Puls x={xX} y={yX} u={teil(uX, 0.05, 0.65)} r={16} f={F.gold} />
        <Pille x={xX - 40} y={yX + 28} text="beliebiger Punkt in E" g={10.5} f={F.goldHell} tf={F.goldDunkel} o={Math.min(teil(uX, 0.5, 1), 1 - uO)} />
        {/* „senkrecht“-Etikett */}
        <Pille x={xP - 44} y={yP - 38} text="senkrecht" g={11} f={F.gruenHell} tf={F.gruen} o={Math.min(teil(uS, 0.4, 1), 1 - uSk)} />
        {ausserhalb && uOb > 0 && <Pille x={xX + 22} y={yX - 30} text="nicht in E" g={11} f="#FBEAF0" tf={F.granat} a="start" o={uOb} />}
        {kasten}
      </>
    );
  },
};

/* ============================================================
   v_hnf – Hesse-Normalenform. Reihenfolge ist Absicht: Für die Gleichung (x⃗ − p⃗) · n⃗ = 0 ist die Länge von n⃗
   egal (jedes Vielfache ist ein Normalenvektor). Erst wenn man einen Punkt Q AUSSERHALB einsetzt, hängt der Wert
   von |n⃗| ab (9 mit n⃗, 18 mit 2n⃗) – DESHALB wird n⃗ auf Länge 1 gebracht: n⃗₀ macht den Wert zum Abstand.
   Dieselbe Ebene; Q(−1 | 5 | 3) liegt 3 LE über E (Fußpunkt F(−2 | 3 | 1)); PQ⃗ = (1 | 1 | 3), n⃗ · PQ⃗ = 9, δ = 9/3 = 3.
   ============================================================ */
const FUSS = inE(-1, 0);                                  // F(−2 | 3 | 1)
const Q_VON = (h) => add(FUSS, mul(N0, h));
const X_L = inE(1, 0);                                    // Punkt in E für „die Länge von n⃗ ist egal“
const v_hnf = {
  h: 276,
  label: () => "Für die Normalenform ist die Länge des Normalenvektors egal. Setzt man aber einen Punkt außerhalb der Ebene ein, hängt der Wert von der Länge ab – deshalb wird der Normalenvektor auf Länge 1 gebracht: Dann ist das Skalarprodukt der Schatten des Verbindungsvektors, genau der Abstand, mit Vorzeichen für die Seite.",
  ablauf: () => [
    { k: "ebene", ms: 1300, text: "Dieselbe Ebene E mit Aufpunkt P und Normalenvektor n⃗ = (1 | 2 | 2). Normalenform: (x⃗ − p⃗) · n⃗ = 0." },
    { k: "laenge", ms: 2800, text: "Wie lang n⃗ ist, spielt dafür keine Rolle: Auch 2n⃗ oder ½n⃗ stehen senkrecht auf E – das Skalarprodukt mit jedem Vektor in E bleibt 0." },
    { k: "punktQ", ms: 1500, text: "Jetzt ein Punkt Q, der NICHT in E liegt." },
    { k: "pq", ms: 1700, text: "PQ⃗ = q⃗ − p⃗ liegt nicht in der Ebene – das Skalarprodukt mit n⃗ ist nicht 0. Aber welcher Wert kommt heraus?" },
    { k: "wert", ms: 3200, text: "Mit n⃗ kommt 9 heraus, mit 2n⃗ schon 18: Der Wert hängt von der Länge des Normalenvektors ab – so ist er noch kein Abstand." },
    { k: "normieren", ms: 2100, text: "Deshalb erst jetzt: n⃗ durch seine Länge teilen. n⃗₀ = n⃗ / 3 hat die Länge 1 – damit ist der Wert eindeutig." },
    { k: "hnf", ms: 1700, text: "Die Normalenform mit n⃗₀ heißt Hesse-Normalenform: (x⃗ − p⃗) · n⃗₀ = 0." },
    { k: "schatten", ms: 2300, text: "PQ⃗ · n⃗₀ = |PQ⃗| · 1 · cos φ: die Länge des Schattens, den PQ⃗ auf die Richtung von n⃗₀ wirft." },
    { k: "lot", ms: 2300, text: "Dieser Schatten ist genauso lang wie das Lot von Q auf E – also der Abstand von Q zur Ebene." },
    { k: "zahlen", ms: 2400, text: "Mit Zahlen: PQ⃗ · n⃗₀ = 9 / 3 = 3. Q ist 3 LE von E entfernt." },
    { k: "durch", ms: 4200, text: "Schiebt man Q durch die Ebene, wechselt das Vorzeichen: positiv auf der n⃗₀-Seite, 0 in E, negativ dahinter." },
    { k: "fazit", ms: 2600, text: "Q in die Hesse-Normalenform einsetzen liefert δ: den Abstand mit Vorzeichen. Der Abstand selbst ist |δ|." },
  ],
  bild: ({ Z, z }) => {
    const uE = Z("ebene"), uLa = z("laenge"), uQ = Z("punktQ"), uPQ = Z("pq"), uW = Z("wert"), uNo = Z("normieren"), uH = Z("hnf");
    const uSch = Z("schatten"), uL = Z("lot"), uZ = Z("zahlen"), uD = z("durch"), uF = Z("fazit");
    /* Länge von n⃗: in „laenge“ atmet sie 3 → 6 → 1,5 → 3; in „wert“ wächst sie auf 6 (2n⃗); in „normieren“ schrumpft sie auf 1 (n⃗₀) */
    let k = 1;
    if (uLa > 0 && uLa < 1) k = uLa < 0.5 ? 1 + Math.sin(Math.PI * uLa * 2) : 1 - 0.5 * Math.sin(Math.PI * (uLa - 0.5) * 2);
    if (uW > 0) k = 1 + teil(uW, 0.45, 0.75);
    const nLang = uNo > 0 ? mix(2 * LN, 1, uNo) : LN * k;
    const nTip = add(P0, mul(N0, nLang));
    const [xT, yT] = pr(nTip);
    const nName = uNo > 0.5 ? "n" : nLang > 4.5 ? "2n" : "n";
    /* Q: erst 3 LE über E; in „durch“ hinunter bis −1,5 LE und zurück auf +2 */
    let h = 3;
    if (uD > 0) { const w = sanft(uD < 0.6 ? uD / 0.6 : 1); h = mix(3, -1.5, w); if (uD > 0.72) h = mix(-1.5, 2, sanft(teil(uD, 0.72, 1))); }
    const Q = Q_VON(h);
    const delta = h;                                                          // (Q − P) · n⃗₀ = h
    const S = add(P0, mul(N0, delta));                                        // Ende des Schattens auf der n⃗₀-Geraden
    const [xP, yP] = pr(P0), [xQ, yQ] = pr(Q), [xS, yS] = pr(S), [xFu, yFu] = pr(FUSS), [xX, yX] = pr(X_L);
    const oben = h > 1e-6, drin = Math.abs(h) < 0.04;
    const gerade = (kk) => pr(add(P0, mul(N0, kk)));
    const oX = Math.min(klemm(uLa * 4), 1 - uQ);                              // X in E nur im Abschnitt „laenge“
    const yK = 238;
    const vzFarbe = drin ? F.gruen : oben ? F.gruen : F.granat;
    let kasten = null;
    if (uF > 0) {
      kasten = (
        <Kasten3 y={yK} h={32} o={uF} f={F.blauHell} rand={F.blau}>
          <Zeile x={28} y={yK + 21} g={13.5} a="start" teile={[
            { t: "δ", f: F.gruen, w: 900, g: 14.5 }, { t: "=" }, { t: "(" }, { t: "q", vec: true, f: F.goldDunkel }, { t: "−" }, { t: "p", vec: true }, { t: ")" }, { t: "·" }, { t: "n", vec: true, tief: "0", f: F.blau },
          ]} />
          <Zeile x={B - 20} y={yK + 21} g={12.5} a="end" teile={[{ t: "d(Q; E) = |δ|", w: 800, f: F.blau }]} />
        </Kasten3>
      );
    } else if (uD > 0) {
      kasten = (
        <Kasten3 y={yK} h={32} f={drin ? F.gruenHell : oben ? F.gruenHell : "#FBEAF0"} rand={vzFarbe}>
          <Zeile x={B / 2} y={yK + 21} g={13.5} teile={[
            { t: "δ", f: vzFarbe, w: 900, g: 14.5 }, { t: "=" }, { t: "PQ", vec: true, f: F.goldDunkel }, { t: "·" }, { t: "n", vec: true, tief: "0", f: F.blau }, { t: "=" },
            { t: dez(delta), f: vzFarbe, w: 900, g: 14.5 },
            { t: drin ? "– in E" : oben ? "– auf der n₀-Seite" : "– Gegenseite", f: vzFarbe, w: 700, g: 11.5 },
          ]} />
        </Kasten3>
      );
    } else if (uZ > 0) {
      kasten = (
        <Kasten3 y={yK} h={32} o={uZ} f={F.gruenHell} rand={F.gruen}>
          <Zeile x={B / 2} y={yK + 21} g={12.5} teile={[
            { t: "PQ", vec: true, f: F.goldDunkel }, { t: "·" }, { t: "n", vec: true, tief: "0", f: F.blau }, { t: "=" },
            { t: "(1·1 + 2·1 + 2·3) / 3", w: 700 }, { t: "=" }, { t: "9 / 3", w: 700 }, { t: "=" }, { t: "3", f: F.gruen, w: 900, g: 14.5 },
          ]} />
        </Kasten3>
      );
    } else if (uSch > 0) {
      kasten = (
        <Kasten3 y={yK} h={32} o={uSch} f={F.gruenHell} rand={F.gruen}>
          <Zeile x={B / 2} y={yK + 21} g={13} teile={[
            { t: "PQ", vec: true, f: F.goldDunkel }, { t: "·" }, { t: "n", vec: true, tief: "0", f: F.blau }, { t: "=" },
            { t: "|PQ| · 1 · cos φ", w: 700 }, { t: "=" }, { t: uL > 0.5 ? "Abstand" : "Schatten", f: F.gruen, w: 900, g: 13.5 },
          ]} />
        </Kasten3>
      );
    } else if (uH > 0) {
      kasten = (
        <Kasten3 y={yK} h={32} o={uH} f={F.blauHell} rand={F.blau}>
          <Zeile x={B / 2 - 50} y={yK + 21} g={14} teile={[
            { t: "(" }, { t: "x", vec: true }, { t: "−" }, { t: "p", vec: true }, { t: ")" }, { t: "·" }, { t: "n", vec: true, tief: "0", f: F.blau }, { t: "=" }, { t: "0", f: F.gruen, w: 900, g: 15 },
          ]} />
          <Tx x={B - 20} y={yK + 21} g={10.5} f={F.blau} w={800} a="end">HESSE-NORMALENFORM</Tx>
        </Kasten3>
      );
    } else if (uNo > 0) {
      kasten = (
        <Kasten3 y={yK} h={32} o={uNo}>
          <Zeile x={B / 2} y={yK + 21} g={13.5} teile={[
            { t: "n", vec: true, tief: "0", f: F.blau }, { t: "=" }, { t: "n", vec: true, f: F.blau }, { t: "/" }, { t: "|n|", w: 700 }, { t: "=" }, { t: "(1 | 2 | 2) / 3", w: 700 },
            { t: "→  Länge 1", f: F.blau, w: 800, g: 12 },
          ]} />
        </Kasten3>
      );
    } else if (uW > 0) {
      const doppelt = k > 1.5;
      kasten = doppelt ? (
        <Kasten3 y={yK} h={32} f={F.goldHell} rand={F.gold}>
          <Zeile x={B / 2} y={yK + 21} g={13} teile={[
            { t: "PQ", vec: true, f: F.goldDunkel }, { t: "·" }, { t: "2n", vec: true, f: F.blau }, { t: "=" }, { t: "2 · 9", w: 700 }, { t: "=" },
            { t: "18", f: F.goldDunkel, w: 900, g: 14.5 }, { t: "– hängt von |n| ab", f: F.goldDunkel, w: 700, g: 11.5 },
          ]} />
        </Kasten3>
      ) : (
        <Kasten3 y={yK} h={32} o={klemm(uW * 4)}>
          <Zeile x={B / 2} y={yK + 21} g={13} teile={[
            { t: "PQ", vec: true, f: F.goldDunkel }, { t: "·" }, { t: "n", vec: true, f: F.blau }, { t: "=" }, { t: "1·1 + 2·1 + 2·3", w: 700 }, { t: "=" }, { t: "9", f: F.tinte, w: 900, g: 14.5 },
          ]} />
        </Kasten3>
      );
    } else if (uPQ > 0) {
      kasten = (
        <Kasten3 y={yK} h={32} o={teil(uPQ, 0.4, 0.9)} f="#FBEAF0" rand={F.granat}>
          <Zeile x={B / 2} y={yK + 21} g={13} teile={[
            { t: "PQ", vec: true, f: F.goldDunkel }, { t: "·" }, { t: "n", vec: true, f: F.blau }, { t: "≠ 0", f: F.granat, w: 900, g: 14 }, { t: "– Q liegt nicht in E", f: F.granat, w: 700, g: 11.5 },
          ]} />
        </Kasten3>
      );
    } else if (uLa > 0) {
      kasten = (
        <Kasten3 y={yK} h={32} o={klemm(uLa * 4)} f={F.gruenHell} rand={F.gruen}>
          <Zeile x={B / 2} y={yK + 21} g={13} teile={[
            { t: "PX", vec: true, f: F.goldDunkel }, { t: "·" }, { t: "(k·" }, { t: "n", vec: true, f: F.blau }, { t: ")" }, { t: "=" }, { t: "k · 0", w: 700 }, { t: "=" }, { t: "0", f: F.gruen, w: 900, g: 14.5 },
            { t: "– für jede Länge", f: F.gruen, w: 700, g: 11.5 },
          ]} />
        </Kasten3>
      );
    } else if (uE > 0) {
      kasten = (
        <Kasten3 y={yK} h={32} o={teil(uE, 0.4, 1)} f={F.blauHell} rand={F.blau}>
          <Zeile x={B / 2 - 50} y={yK + 21} g={14} teile={[
            { t: "(" }, { t: "x", vec: true }, { t: "−" }, { t: "p", vec: true }, { t: ")" }, { t: "·" }, { t: "n", vec: true, f: F.blau }, { t: "=" }, { t: "0", f: F.gruen, w: 900, g: 15 },
          ]} />
          <Tx x={B - 20} y={yK + 21} g={10.5} f={F.blau} w={800} a="end">NORMALENFORM</Tx>
        </Kasten3>
      );
    }

    const schattenO = Math.min(uSch, 1);
    const laengePille = uNo > 0.5 ? "Länge 1" : `Länge ${dez(nLang)}`;
    const pilleW = breite(laengePille, 10.5) + 16;                            // Pille rechts oberhalb der Spitze; passt sie nicht mehr, rechts unterhalb der Pfeilmitte
    return (
      <>
        <Ebene o={uE} />
        {/* Gerade in Richtung n⃗₀ durch P (für den Schatten) */}
        {schattenO > 0 && <Strich x1={gerade(-1.6)[0]} y1={gerade(-1.6)[1]} x2={gerade(3.6)[0]} y2={gerade(3.6)[1]} u={schattenO} f={F.blau} b={1.1} strokeDasharray="4 4" />}
        {/* Lot von Q auf E */}
        {uL > 0 && Math.abs(h) > 0.03 && (
          <g>
            <Strich x1={xFu} y1={yFu} x2={xQ} y2={yQ} u={uL} f={F.gruen} b={2.4} />
            <circle cx={xFu} cy={yFu} r="3.4" fill={F.gruen} stroke={F.weiss} strokeWidth="1.4" opacity={uL} />
            <Tx x={xFu + 9} y={yFu + 14} g={12.5} f={F.gruen} w={800} fontStyle="italic" o={uL}>F</Tx>
            <RechterWinkel3 p={FUSS} e1={mul(N0, Math.sign(h) || 1)} e2={mul(V, 1 / len(V))} g={0.42} f={F.gruen} o={uL} />
          </g>
        )}
        {/* Schatten von PQ⃗ auf der n⃗₀-Geraden */}
        {schattenO > 0 && Math.abs(delta) > 0.03 && (
          <g>
            <line x1={xP} y1={yP} x2={mix(xP, xS, schattenO)} y2={mix(yP, yS, schattenO)} stroke={F.gruen} strokeWidth="6" strokeLinecap="round" opacity="0.5" />
            <Strich x1={xQ} y1={yQ} x2={xS} y2={yS} u={schattenO} f={F.hell} b={1.2} strokeDasharray="3 3" />
            {(uSch > 0.6) && <Pille x={xS + 8} y={yS + 5} text={uZ > 0.3 || uD > 0 ? `δ = ${dez(delta)}` : "Schatten"} g={10.5} f={F.gruenHell} tf={F.gruen} a="start" o={teil(uSch, 0.6, 1)} />}
          </g>
        )}
        {/* X in E mit PX⃗ und rechtem Winkel – die Länge von n⃗ ist egal */}
        {oX > 0 && (
          <g opacity={oX}>
            <Pfeil3 von={P0} bis={X_L} u={1} f={F.gold} b={2.8} />
            <RechterWinkel3 p={P0} e1={N0} e2={mul(U, 1 / len(U))} g={0.5} f={F.gruen} />
            <VecTx x={(xP + xX) / 2 - 16} y={(yP + yX) / 2 + 16} text="PX" g={13} f={F.goldDunkel} />
            <Punkt3 p={X_L} f={F.gold} label="X" dx={9} dy={-6} lf={F.goldDunkel} />
          </g>
        )}
        {/* n⃗ (atmet, wächst auf 2n⃗, schrumpft auf n⃗₀) */}
        <Pfeil3 von={P0} bis={nTip} u={1} f={F.blau} b={3.2} o={uE} />
        {uE > 0.5 && <VecTx x={xT > 318 ? xT - 26 : xT + 8} y={xT > 318 ? yT + 18 : yT + 3} text={nName} tief={uNo > 0.5 ? "0" : undefined} g={14} f={F.blau} a="start" o={teil(uE, 0.5, 1)} />}
        <Pille x={xT + 12 + pilleW <= 356 ? xT + 12 + pilleW / 2 : (xP + xT) / 2 + 22 + pilleW / 2} y={xT + 12 + pilleW <= 356 ? yT - 20 : (yP + yT) / 2 + 14} text={laengePille} g={10.5} f={F.blauHell} tf={F.blau} o={Math.min(teil(uE, 0.6, 1), 1 - uH)} />
        {/* PQ⃗ */}
        <Pfeil3 von={P0} bis={Q} u={uPQ > 0 ? raus(klemm(uPQ * 1.5)) : 0} f={F.gold} b={2.8} />
        {uPQ > 0.5 && uSch <= 0.3 && <VecTx x={(xP + xQ) / 2 - 24} y={(yP + yQ) / 2 + 4} text="PQ" g={13} f={F.goldDunkel} o={teil(uPQ, 0.5, 1)} />}
        {/* Winkel φ zwischen n⃗ und PQ⃗ an P (ab dem Schatten) */}
        {uSch > 0 && uZ <= 0 && (() => {
          const ePQ = mul(sub(Q, P0), 1 / (len(sub(Q, P0)) || 1));
          const a = pr(add(P0, mul(N0, 0.7))), c = pr(add(P0, mul(ePQ, 0.7)));
          return <g opacity={uSch}><path d={`M${pstr(a)} Q${pstr(pr(add(P0, mul(add(N0, ePQ), 0.42))))} ${pstr(c)}`} fill="none" stroke={F.goldDunkel} strokeWidth="1.5" />
            <Tx x={pr(add(P0, mul(add(N0, ePQ), 0.72)))[0] + 1} y={pr(add(P0, mul(add(N0, ePQ), 0.72)))[1] - 4} g={12} f={F.goldDunkel} w={800} fontStyle="italic">φ</Tx></g>;
        })()}
        {/* Punkte */}
        <Punkt3 p={P0} f={F.tinte} label="P" o={uE} dx={-18} dy={16} />
        <Punkt3 p={Q} f={F.gold} label="Q" o={uQ} dx={9} dy={-6} lf={F.goldDunkel} />
        <Puls x={xQ} y={yQ} u={teil(uQ, 0.05, 0.7)} r={16} f={F.gold} />
        <Pille x={xQ + 20} y={yQ - 10} text="nicht in E" g={10.5} f={F.goldHell} tf={F.goldDunkel} a="start" o={Math.min(teil(uQ, 0.5, 1), 1 - uPQ)} />
        {uD > 0 && !drin && <Pille x={xQ + 20} y={yQ - 10} text={oben ? "über E" : "unter E"} g={10.5} f={oben ? F.gruenHell : "#FBEAF0"} tf={oben ? F.gruen : F.granat} a="start" />}
        {uD > 0 && drin && <Pille x={xQ + 20} y={yQ - 10} text="in E: δ = 0" g={10.5} f={F.gruenHell} tf={F.gruen} a="start" />}
        {kasten}
      </>
    );
  },
};

export const SZENEN_VEKTOREN = { v_normalenform, v_hnf };
