/* ======================================================================
   ZAHLENRÄUME – vier Erkläranimationen („Motion-Videos“)
   Gleicher Player wie alle Erkläranimationen der App (funcErklaeranimation.jsx):
   Abspielen/Pause, Schritt-Knöpfe, Zeitleiste, Beschriftung je Schritt,
   bei „Bewegung reduzieren“ startet nichts von allein.
     natuerlich – ℕ: Plus und Mal führen nie hinaus (abgeschlossen)
     ganz       – Subtraktion: 2 − 7 verlässt ℕ → Spiegeln an der 0 → ℤ
     rational   – Division: 10 : 5 bleibt, 2 : 5 verlässt ℤ → Brüche → ℚ
     reell      – x² = 2: Diagonale des Einheitsquadrats, kein Bruch trifft → ℝ
   Farbcode im ganzen Werkzeug: ℕ blau, ℤ lila, ℚ gold, ℝ grün; Rostbraun = verlässt den Zahlenraum.
   ====================================================================== */
import React, { useId, useState } from "react";
import { C } from "./base1.jsx";
import { Player, lauf } from "./funcErklaeranimation.jsx";
import { zw } from "./ui2.jsx";

export const RAUM_FARBE = { N: C.see, Z: C.lila, Q: C.gold, R: C.smaragd };
const ROT = C.signal;   /* Fehlerfarbe des Schemas: „verlässt den Zahlenraum“ */
const T = (props) => <text fontFamily="inherit" {...props} />;
const fenster = (t, a, b, c, d) => lauf(t, a, b) * (1 - lauf(t, c, d));

/* Bogen von x1 nach x2 über der Grundlinie y, gezeichnet bis zum Anteil p */
function Bogen({ x1, x2, y, h = 22, p, farbe, breite = 2.4, spitze = true }) {
  if (p <= 0.001) return null;
  const mx = (x1 + x2) / 2, d = `M${x1} ${y} Q ${mx} ${y - h * 2} ${x2} ${y}`;
  const r = x2 > x1 ? 1 : -1;
  return (
    <g>
      <path d={d} fill="none" stroke={farbe} strokeWidth={breite} strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} />
      {spitze && p > 0.97 && <path d={`M${x2} ${y} l${-6 * r} -7 M${x2} ${y} l${-8 * r} 1`} stroke={farbe} strokeWidth={breite} strokeLinecap="round" fill="none" />}
    </g>
  );
}
/* Kette von Sprüngen: Stellen s[0] → s[1] → …; zeitlich von a bis b gleichmäßig verteilt */
function Spruenge({ stellen, sx, y, t, a, b, farbe, h = 18 }) {
  const n = stellen.length - 1, dt = (b - a) / n;
  return <g>{stellen.slice(0, -1).map((v, i) => <Bogen key={i} x1={sx(v)} x2={sx(stellen[i + 1])} y={y} h={h} p={lauf(t, a + i * dt, a + (i + 1) * dt)} farbe={farbe} spitze={i === n - 1} />)}</g>;
}
/* Gleichung oben als große Zeile; badge = Zahlenraum-Abzeichen „∈ ℕ“ bzw. „∉ ℕ“ */
function Zeile({ x = 180, y, text, o, gross = 22, badge, badgeFarbe, badgeO = 1 }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      <T x={x} y={y} textAnchor="middle" fontSize={gross} fontWeight="800" fill={C.tinte}>
        {text}{badge && <tspan fill={badgeFarbe} opacity={badgeO}>{"  " + badge}</tspan>}
      </T>
    </g>
  );
}
function Banner({ y, text, o, farbe, breite = 320 }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      <rect x={180 - breite / 2} y={y - 19} width={breite} height={30} rx="15" fill={farbe} opacity="0.12" />
      <rect x={180 - breite / 2} y={y - 19} width={breite} height={30} rx="15" fill="none" stroke={farbe} strokeWidth="1.4" />
      <T x="180" y={y + 1} textAnchor="middle" fontSize="13.5" fontWeight="800" fill={farbe}>{text}</T>
    </g>
  );
}

/* ======================================================================
   SZENE 1 · ℕ – Plus und Mal bleiben drin
   ====================================================================== */
const N_DAUER = 24;
const nSchritte = () => [
  { von: 0, text: zw("Die natürlichen Zahlen 1, 2, 3, … sind die Zahlen zum Zählen. Sie liegen wie Perlen auf einem Strahl, der bei 1 beginnt und nie endet.", "The natural numbers 1, 2, 3, … are the counting numbers. They sit like beads on a ray that starts at 1 and never ends.") },
  { von: 4.6, text: zw("Addieren heißt weiterzählen. 3 + 4: Von 3 aus vier Schritte nach rechts – wir landen bei 7, wieder auf einer Perle. 7 liegt in ℕ.", "Adding means counting on. 3 + 4: four steps to the right from 3 – we land on 7, a bead again. 7 is in ℕ.") },
  { von: 9.4, text: zw("Multiplizieren heißt wiederholt addieren. 3 · 4 = 4 + 4 + 4: drei Sprünge der Länge 4 – wir landen bei 12, wieder in ℕ.", "Multiplying means repeated adding. 3 · 4 = 4 + 4 + 4: three jumps of length 4 – we land on 12, again in ℕ.") },
  { von: 14, text: zw("Egal welche zwei natürlichen Zahlen du nimmst: Plus und Mal führen immer nach rechts auf eine Perle. Man sagt: ℕ ist abgeschlossen bezüglich + und ·. Du kannst den Raum damit nicht verlassen.", "Whichever two natural numbers you take: plus and times always lead to the right onto a bead. We say: ℕ is closed under + and ·. You cannot leave the space this way.") },
  { von: 19.4, text: zw("Und Minus? 7 − 2 = 5 klappt noch. Aber was ist 2 − 7? Das zeigt die nächste Animation.", "And minus? 7 − 2 = 5 still works. But what is 2 − 7? The next animation shows it.") },
];
function nZeichne(t) {
  const Y = 150, sx = (v) => 28 + v * 24;
  const perlen = Array.from({ length: 13 }, (_, i) => i + 1);
  const strahl = lauf(t, 0, 1);
  const hulle = lauf(t, 14.2, 15.2);
  const zielGlanz = (v, a, b) => fenster(t, a, a + 0.4, b, b + 0.6) * (v ? 1 : 0);
  return (
    <g>
      {/* Strahl */}
      <line x1={sx(0)} y1={Y} x2={sx(0) + (sx(13.6) - sx(0)) * strahl} y2={Y} stroke={C.hellgrau} strokeWidth="1.6" />
      {strahl > 0.95 && <path d={`M${sx(13.6)} ${Y} l-7 -4 M${sx(13.6)} ${Y} l-7 4`} stroke={C.hellgrau} strokeWidth="1.6" />}
      <line x1={sx(0)} y1={Y - 5} x2={sx(0)} y2={Y + 5} stroke={C.hellgrau} strokeWidth="1.4" />
      <T x={sx(0)} y={Y + 22} textAnchor="middle" fontSize="11" fill={C.hellgrau}>0</T>
      {/* Hülle: ℕ abgeschlossen */}
      {hulle > 0.01 && <rect x={sx(0.45)} y={Y - 26} width={(sx(13.55) - sx(0.45)) * hulle} height={60} rx="22" fill={C.see} opacity={0.07} stroke={C.see} strokeWidth="1.6" />}
      {hulle > 0.6 && <T x={sx(0.75)} y={Y - 32} fontSize="15" fontWeight="800" fill={C.see} opacity={lauf(t, 14.8, 15.6)}>ℕ</T>}
      {/* Perlen */}
      {perlen.map((v, i) => {
        const o = lauf(t, 0.6 + i * 0.22, 1.0 + i * 0.22);
        const glanz = (v === 7 ? zielGlanz(1, 8, 9.2) : 0) + (v === 12 ? zielGlanz(1, 13.2, 13.9) : 0) + (v === 7 ? fenster(t, 15.6, 15.9, 16.7, 17) : 0) + (v === 10 ? fenster(t, 17.4, 17.7, 18.6, 18.9) : 0);
        return (
          <g key={v} opacity={o}>
            {glanz > 0 && <circle cx={sx(v)} cy={Y} r={12} fill={C.flaggold} opacity={0.45 * glanz} />}
            <circle cx={sx(v)} cy={Y} r="5.4" fill={C.see} />
            <T x={sx(v)} y={Y + 22} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.seeTief}>{v}</T>
          </g>
        );
      })}
      <T x="180" y="34" textAnchor="middle" fontSize="18" fontWeight="800" fill={C.see} opacity={fenster(t, 1.6, 2.6, 4.4, 4.9)}>ℕ = {"{"}1, 2, 3, 4, …{"}"}</T>

      {/* 3 + 4 */}
      <g opacity={1 - lauf(t, 9.2, 9.6)}>
        <Spruenge stellen={[3, 4, 5, 6, 7]} sx={sx} y={Y - 7} t={t} a={5.6} b={7.8} farbe={C.see} h={12} />
      </g>
      <Zeile y={46} text="3 + 4 = 7" o={fenster(t, 5, 5.6, 9.1, 9.5)} badge="∈ ℕ" badgeFarbe={C.see} badgeO={lauf(t, 8, 8.5)} />

      {/* 3 · 4 */}
      <g opacity={1 - lauf(t, 13.9, 14.3)}>
        <Spruenge stellen={[0, 4, 8, 12]} sx={sx} y={Y - 7} t={t} a={10.4} b={12.9} farbe={C.gruen} h={26} />
      </g>
      <Zeile y={46} text="3 · 4 = 4 + 4 + 4 = 12" gross={20} o={fenster(t, 9.8, 10.4, 13.8, 14.2)} badge="∈ ℕ" badgeFarbe={C.see} badgeO={lauf(t, 13, 13.4)} />

      {/* Abgeschlossen: kurze Proben */}
      <g opacity={fenster(t, 15, 15.3, 16.9, 17.1)}><Spruenge stellen={[5, 6, 7]} sx={sx} y={Y - 7} t={t} a={15.3} b={16.2} farbe={C.see} h={12} /></g>
      <g opacity={fenster(t, 17, 17.2, 19, 19.4)}><Spruenge stellen={[0, 5, 10]} sx={sx} y={Y - 7} t={t} a={17.2} b={18.4} farbe={C.gruen} h={24} /></g>
      <Zeile y={46} text={lauf(t, 16.9, 17) > 0.5 ? "2 · 5 = 10" : "5 + 2 = 7"} gross={20} o={fenster(t, 15.1, 15.5, 19, 19.4)} badge="∈ ℕ" badgeFarbe={C.see} />
      <Banner y={232} text={zw("ℕ ist abgeschlossen bezüglich + und ·", "ℕ is closed under + and ·")} o={lauf(t, 15.8, 16.6)} farbe={C.see} />

      {/* Ausblick Minus */}
      <g opacity={lauf(t, 19.8, 20.6)}>
        <T x="100" y="46" textAnchor="middle" fontSize="19" fontWeight="800" fill={C.tinte}>7 − 2 = 5 <tspan fill={C.smaragd}>✓</tspan></T>
        <T x="262" y="46" textAnchor="middle" fontSize="19" fontWeight="800" fill={C.tinte} opacity={lauf(t, 20.8, 21.6)}>2 − 7 = <tspan fill={ROT}>?</tspan></T>
      </g>
      <g opacity={fenster(t, 19.8, 20.2, 23.8, 24)}>
        <Spruenge stellen={[7, 6, 5]} sx={sx} y={Y + 7} t={t} a={20} b={20.9} farbe={C.tinte} h={-10} />
      </g>
    </g>
  );
}

/* ======================================================================
   SZENE 2 · Subtraktion → ℤ
   ====================================================================== */
const Z_DAUER = 27;
const zSchritte = () => [
  { von: 0, text: zw("Subtrahieren heißt rückwärts gehen. 7 − 2: Von 7 zwei Schritte nach links – wir landen bei 5. Das bleibt in ℕ.", "Subtracting means going backwards. 7 − 2: two steps to the left from 7 – we land on 5. That stays in ℕ.") },
  { von: 4.6, text: zw("Jetzt 2 − 7: Von 2 aus sieben Schritte nach links. Nach einem Schritt ist die letzte Perle erreicht – und dann? Links von 1 gibt es in ℕ keine Zahl mehr. Wir verlassen den Zahlenraum.", "Now 2 − 7: seven steps to the left from 2. After one step the last bead is reached – and then? Left of 1 there is no number in ℕ. We leave the number space.") },
  { von: 10.6, text: zw("ℕ ist also nicht abgeschlossen bezüglich der Subtraktion. Damit jede Subtraktion ein Ergebnis hat, brauchen wir einen größeren Zahlenraum.", "So ℕ is not closed under subtraction. For every subtraction to have a result we need a larger number space.") },
  { von: 13.8, text: zw("Wir spiegeln die natürlichen Zahlen an der Null: Zu jeder Zahl n kommt ihre Gegenzahl −n dazu, die 0 in die Mitte. Das sind die ganzen Zahlen ℤ = {…, −2, −1, 0, 1, 2, …}.", "We mirror the natural numbers at zero: each number n gets its opposite −n, with 0 in the middle. These are the integers ℤ = {…, −2, −1, 0, 1, 2, …}.") },
  { von: 18.8, text: zw("Jetzt hat 2 − 7 einen Landeplatz: −5. In ℤ führen Plus, Minus und Mal nie hinaus – ℤ ist abgeschlossen bezüglich +, − und ·.", "Now 2 − 7 has a landing spot: −5. In ℤ, plus, minus and times never lead out – ℤ is closed under +, − and ·.") },
  { von: 23.4, text: zw("Die natürlichen Zahlen stecken vollständig in ℤ: ℕ ⊂ ℤ. Wir haben den Zahlenraum erweitert, ohne etwas wegzunehmen.", "The natural numbers sit entirely inside ℤ: ℕ ⊂ ℤ. We extended the number space without taking anything away.") },
];
function zZeichne(t) {
  const Y = 150, sx = (v) => 180 + v * 19;
  const pos = Array.from({ length: 8 }, (_, i) => i + 1);
  const spiegel = lauf(t, 14.4, 16.6), null0 = lauf(t, 14, 14.6);
  const linksLinie = lauf(t, 14, 15.4);
  const absturz = lauf(t, 7.4, 8.6), verschwinde = 1 - lauf(t, 13.6, 14.2);
  const nebel = fenster(t, 5, 5.8, 13.6, 14.2);
  return (
    <g>
      {/* Zahlengerade: rechts von Anfang an, links erst mit ℤ */}
      <line x1={sx(0.4)} y1={Y} x2={sx(8.6)} y2={Y} stroke={C.hellgrau} strokeWidth="1.6" />
      <path d={`M${sx(8.6)} ${Y} l-7 -4 M${sx(8.6)} ${Y} l-7 4`} stroke={C.hellgrau} strokeWidth="1.6" />
      <line x1={sx(0.4)} y1={Y} x2={sx(0.4) - (sx(0.4) - sx(-8.6)) * linksLinie} y2={Y} stroke={C.hellgrau} strokeWidth="1.6" />
      {linksLinie > 0.95 && <path d={`M${sx(-8.6)} ${Y} l7 -4 M${sx(-8.6)} ${Y} l7 4`} stroke={C.hellgrau} strokeWidth="1.6" />}
      {/* Leere links („hier ist nichts“) */}
      {nebel > 0.01 && (
        <g opacity={nebel}>
          <rect x={sx(-8.8)} y={Y - 30} width={sx(0.5) - sx(-8.8)} height={60} rx="12" fill={C.hellgrau} opacity="0.13" />
          <T x={sx(-4.2)} y={Y + 46} textAnchor="middle" fontSize="12" fontWeight="700" fill={C.grau}>{zw("in ℕ: keine Zahlen", "in ℕ: no numbers")}</T>
        </g>
      )}
      {/* positive Perlen (ℕ) */}
      {pos.map((v) => {
        const glanz = (v === 5 ? fenster(t, 3, 3.4, 4.4, 4.8) : 0);
        return (
          <g key={v} opacity={lauf(t, 0, 0.6)}>
            {glanz > 0 && <circle cx={sx(v)} cy={Y} r="11" fill={C.flaggold} opacity={0.45 * glanz} />}
            <circle cx={sx(v)} cy={Y} r="5" fill={C.see} />
            <T x={sx(v)} y={Y + 21} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.seeTief}>{v}</T>
          </g>
        );
      })}
      {/* Null und Spiegelbilder */}
      <g opacity={null0}>
        <circle cx={sx(0)} cy={Y} r="5" fill={RAUM_FARBE.Z} />
        <T x={sx(0)} y={Y + 21} textAnchor="middle" fontSize="11" fontWeight="700" fill={RAUM_FARBE.Z}>0</T>
      </g>
      {spiegel > 0.001 && pos.map((v) => {
        const p = lauf(t, 14.4 + v * 0.18, 15.4 + v * 0.18);
        const x = sx(v) + (sx(-v) - sx(v)) * p;
        const bogenY = Y - Math.sin(Math.PI * p) * (18 + v * 4);
        return (
          <g key={v} opacity={p > 0.01 ? 1 : 0}>
            <circle cx={x} cy={bogenY} r="5" fill={RAUM_FARBE.Z} />
            <T x={x} y={bogenY + 21} textAnchor="middle" fontSize="11" fontWeight="700" fill={RAUM_FARBE.Z} opacity={lauf(t, 15.2 + v * 0.18, 15.6 + v * 0.18)}>−{v}</T>
          </g>
        );
      })}

      {/* 7 − 2 */}
      <g opacity={1 - lauf(t, 4.4, 4.8)}><Spruenge stellen={[7, 6, 5]} sx={sx} y={Y - 7} t={t} a={1} b={2.8} farbe={C.tinte} h={12} /></g>
      <Zeile y={46} text="7 − 2 = 5" o={fenster(t, 0.6, 1.2, 4.4, 4.8)} badge="∈ ℕ" badgeFarbe={C.see} badgeO={lauf(t, 3, 3.4)} />

      {/* 2 − 7: Absturz */}
      <g opacity={verschwinde}>
        <Bogen x1={sx(2)} x2={sx(1)} y={Y - 7} h={12} p={lauf(t, 5.6, 6.6)} farbe={C.tinte} spitze={false} />
        {absturz > 0.001 && (
          <path d={`M${sx(1)} ${Y - 7} Q ${sx(0.2)} ${Y - 34} ${sx(-0.6)} ${Y - 10}`} fill="none" stroke={ROT} strokeWidth="2.4" strokeDasharray="5 5" pathLength="100"
            strokeDashoffset={0} opacity={absturz} />
        )}
        <T x={sx(-1.6)} y={Y - 14} textAnchor="middle" fontSize="30" fontWeight="800" fill={ROT} opacity={lauf(t, 8.4, 9)}>?</T>
      </g>
      <Zeile y={46} text="2 − 7 = ?" o={fenster(t, 5, 5.6, 13.6, 14)} badge="∉ ℕ" badgeFarbe={ROT} badgeO={lauf(t, 9, 9.6)} />
      <Banner y={236} text={zw("ℕ ist nicht abgeschlossen bezüglich −", "ℕ is not closed under −")} o={fenster(t, 10.8, 11.6, 13.6, 14)} farbe={ROT} />

      {/* ℤ */}
      <T x="180" y="46" textAnchor="middle" fontSize="17" fontWeight="800" fill={RAUM_FARBE.Z} opacity={fenster(t, 15.8, 16.6, 18.6, 19)}>ℤ = {"{"}…, −2, −1, 0, 1, 2, …{"}"}</T>
      <g opacity={fenster(t, 19, 19.2, 23.2, 23.6)}>
        <Spruenge stellen={[2, 1, 0, -1, -2, -3, -4, -5]} sx={sx} y={Y - 7} t={t} a={19.2} b={21.6} farbe={RAUM_FARBE.Z} h={10} />
      </g>
      <Zeile y={46} text="2 − 7 = −5" o={lauf(t, 19, 19.6) * (1 - lauf(t, 23.2, 23.6))} badge="∈ ℤ" badgeFarbe={RAUM_FARBE.Z} badgeO={lauf(t, 21.6, 22)} />
      {fenster(t, 21.6, 22, 23.2, 23.6) > 0 && <circle cx={sx(-5)} cy={Y} r="11" fill={C.flaggold} opacity={0.45 * fenster(t, 21.6, 22, 23.2, 23.6)} />}
      <Banner y={236} text={zw("ℤ ist abgeschlossen bezüglich +, − und ·", "ℤ is closed under +, − and ·")} o={fenster(t, 22, 22.6, 23.2, 23.6)} farbe={RAUM_FARBE.Z} />

      {/* ℕ ⊂ ℤ */}
      <g opacity={lauf(t, 23.6, 24.4)}>
        <rect x={sx(0.5)} y={Y - 24} width={sx(8.5) - sx(0.5)} height={54} rx="18" fill="none" stroke={C.see} strokeWidth="1.6" />
        <T x={sx(8.2)} y={Y - 30} textAnchor="end" fontSize="14" fontWeight="800" fill={C.see}>ℕ</T>
        <rect x={sx(-8.7)} y={Y - 34} width={sx(8.7) - sx(-8.7)} height={74} rx="24" fill="none" stroke={RAUM_FARBE.Z} strokeWidth="1.6" />
        <T x={sx(-8.4)} y={Y - 40} fontSize="14" fontWeight="800" fill={RAUM_FARBE.Z}>ℤ</T>
        <T x="180" y="46" textAnchor="middle" fontSize="24" fontWeight="800" fill={C.tinte}><tspan fill={C.see}>ℕ</tspan> ⊂ <tspan fill={RAUM_FARBE.Z}>ℤ</tspan></T>
      </g>
    </g>
  );
}

/* ======================================================================
   SZENE 3 · Division → ℚ
   ====================================================================== */
const Q_DAUER = 27;
const qSchritte = () => [
  { von: 0, text: zw("Teilen ist Malnehmen rückwärts: 10 : 5 fragt, welche Zahl mal 5 die 10 ergibt. Antwort: 2, denn 5 · 2 = 10. Das Ergebnis ist wieder eine ganze Zahl.", "Dividing is multiplying backwards: 10 : 5 asks which number times 5 gives 10. Answer: 2, because 5 · 2 = 10. The result is an integer again.") },
  { von: 4.6, text: zw("Aber 2 : 5? Wir teilen die Strecke von 0 bis 2 in 5 gleich lange Teile. Das erste Teil endet zwischen 0 und 1 – dort liegt keine ganze Zahl. Die Division führt aus ℤ heraus.", "But 2 : 5? We split the segment from 0 to 2 into 5 equal parts. The first part ends between 0 and 1 – there is no integer there. Division leads out of ℤ.") },
  { von: 10.4, text: zw("Also nehmen wir alle Brüche dazu. Eine rationale Zahl ist ein Quotient aus einer ganzen Zahl p und einer natürlichen Zahl q. Der Nenner ist natürlich: Das Vorzeichen steht im Zähler, und durch 0 darf man nicht teilen.", "So we add all fractions. A rational number is a quotient of an integer p and a natural number q. The denominator is natural: the sign goes in the numerator, and you cannot divide by 0.") },
  { von: 15.6, text: zw("Zwischen den ganzen Zahlen füllt sich die Zahlengerade: Halbe, Drittel, Viertel, Fünftel … Zwischen zwei Brüchen liegt immer noch ein Bruch.", "Between the integers the number line fills up: halves, thirds, quarters, fifths … Between two fractions there is always another fraction.") },
  { von: 20.6, text: zw("In ℚ führen alle vier Grundrechenarten nie hinaus (nur durch 0 darf man nicht teilen). Jede ganze Zahl ist ein Bruch, z. B. −3 = −3/1. Also ℕ ⊂ ℤ ⊂ ℚ – und Bruchrechnen ist Rechnen in ℚ.", "In ℚ none of the four basic operations leads out (only division by 0 is not allowed). Every integer is a fraction, e.g. −3 = −3/1. So ℕ ⊂ ℤ ⊂ ℚ – and working with fractions is calculating in ℚ.") },
];
function qZeichne(t) {
  const Y = 168, sx = (v) => 60 + v * 100;           // −0,5 … 2,9
  const ganze = [0, 1, 2];
  const balken = lauf(t, 5.6, 7.2);
  const teil = lauf(t, 7.2, 8.4);
  const frage = fenster(t, 8.6, 9.2, 10.4, 10.8);
  const bruchPunkt = lauf(t, 11, 11.8);
  const dichte = [[2, 15.8], [3, 16.8], [4, 17.8], [5, 18.6], [6, 19.2], [8, 19.7], [10, 20.1]];
  const strich = (n, v) => (n === 2 ? 15 : n === 3 ? 12 : n === 4 ? 10 : n === 5 ? 9 : 6) * v;
  return (
    <g>
      <line x1={sx(-0.55)} y1={Y} x2={sx(2.9)} y2={Y} stroke={C.hellgrau} strokeWidth="1.6" />
      <path d={`M${sx(2.9)} ${Y} l-7 -4 M${sx(2.9)} ${Y} l-7 4`} stroke={C.hellgrau} strokeWidth="1.6" />
      {/* Brüche verdichten sich */}
      {dichte.map(([n, a]) => {
        const o = lauf(t, a, a + 0.6);
        if (o <= 0.001) return null;
        const marken = [];
        for (let k = Math.ceil(-0.5 * n); k <= 2.85 * n; k++) if (k % n !== 0) marken.push(k / n);
        return <g key={n} opacity={o}>{marken.map((v) => <line key={v} x1={sx(v)} y1={Y - strich(n, 1) / 2} x2={sx(v)} y2={Y + strich(n, 1) / 2} stroke={C.gold} strokeWidth={n <= 3 ? 1.8 : 1.1} />)}</g>;
      })}
      {lauf(t, 16.2, 16.8) > 0 && <T x={sx(0.5)} y={Y - 16} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.gold} opacity={fenster(t, 16.2, 16.8, 20.4, 20.8)}>½</T>}
      {lauf(t, 17.2, 17.8) > 0 && <T x={sx(4 / 3)} y={Y - 16} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.gold} opacity={fenster(t, 17.2, 17.8, 20.4, 20.8)}>4/3</T>}
      {lauf(t, 18.2, 18.8) > 0 && <T x={sx(-0.25)} y={Y - 16} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.gold} opacity={fenster(t, 18.2, 18.8, 20.4, 20.8)}>−¼</T>}
      {/* ganze Zahlen */}
      {ganze.map((v) => (
        <g key={v}>
          <circle cx={sx(v)} cy={Y} r="5.2" fill={v === 0 ? RAUM_FARBE.Z : C.see} />
          <T x={sx(v)} y={Y + 22} textAnchor="middle" fontSize="12" fontWeight="700" fill={v === 0 ? RAUM_FARBE.Z : C.seeTief}>{v}</T>
        </g>
      ))}
      {fenster(t, 2.4, 2.8, 4.2, 4.6) > 0 && <circle cx={sx(2)} cy={Y} r="12" fill={C.flaggold} opacity={0.45 * fenster(t, 2.4, 2.8, 4.2, 4.6)} />}

      {/* 10 : 5 */}
      <Zeile y={44} text="10 : 5 = 2" o={fenster(t, 0.4, 1, 4.4, 4.8)} badge="∈ ℤ" badgeFarbe={RAUM_FARBE.Z} badgeO={lauf(t, 2.4, 2.8)} />
      <T x="180" y="72" textAnchor="middle" fontSize="14" fontWeight="600" fill={C.grau} opacity={fenster(t, 1.4, 2, 4.4, 4.8)}>{zw("Probe: 5 · 2 = 10", "Check: 5 · 2 = 10")}</T>

      {/* 2 : 5 – Strecke teilen */}
      <g opacity={1 - lauf(t, 15, 15.6)}>
        <rect x={sx(0)} y={Y - 52} width={(sx(2) - sx(0)) * balken} height={16} rx="4" fill={C.himmel} stroke={C.see} strokeWidth="1.4" />
        {[1, 2, 3, 4].map((k) => <line key={k} x1={sx(0.4 * k)} y1={Y - 52} x2={sx(0.4 * k)} y2={Y - 36} stroke={C.see} strokeWidth="1.4" opacity={lauf(t, 7.2 + k * 0.2, 7.5 + k * 0.2)} />)}
        <rect x={sx(0)} y={Y - 52} width={(sx(0.4) - sx(0))} height={16} rx="4" fill={C.flaggold} opacity={0.75 * teil} />
        <line x1={sx(0.4)} y1={Y - 36} x2={sx(0.4)} y2={Y - 6} stroke={C.gold} strokeWidth="1.6" strokeDasharray="3 3" opacity={teil} />
        <T x={sx(1)} y={Y - 60} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.see} opacity={fenster(t, 6.6, 7.2, 10.8, 11.2)}>{zw("Strecke 0 bis 2 in 5 Teile", "segment 0 to 2 in 5 parts")}</T>
      </g>
      <T x={sx(0.4)} y={Y + 26} textAnchor="middle" fontSize="26" fontWeight="800" fill={ROT} opacity={frage}>?</T>
      <Zeile y={44} text="2 : 5 = ?" o={fenster(t, 5, 5.6, 10.4, 10.8)} badge="∉ ℤ" badgeFarbe={ROT} badgeO={lauf(t, 9, 9.6)} />

      {/* Bruch 2/5 */}
      {bruchPunkt > 0.001 && (
        <g opacity={bruchPunkt}>
          <circle cx={sx(0.4)} cy={Y} r="5.6" fill={C.gold} />
          <g opacity={1 - lauf(t, 15.4, 15.8)}>
            <T x={sx(0.4)} y={Y + 24} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.gold}>2</T>
            <line x1={sx(0.4) - 6} y1={Y + 28} x2={sx(0.4) + 6} y2={Y + 28} stroke={C.gold} strokeWidth="1.4" />
            <T x={sx(0.4)} y={Y + 41} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.gold}>5</T>
          </g>
        </g>
      )}
      <Zeile y={44} text="2 : 5 = 2/5" o={fenster(t, 10.8, 11.4, 15.4, 15.8)} badge="∈ ℚ" badgeFarbe={C.gold} badgeO={lauf(t, 11.6, 12)} />
      <g opacity={fenster(t, 12, 12.8, 15.4, 15.8)}>
        <rect x="40" y="60" width="280" height="38" rx="12" fill={C.flaggold} opacity="0.13" />
        <T x="180" y="85" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.tinte}>ℚ = {"{"} p/q  |  p ∈ ℤ, q ∈ ℕ {"}"}</T>
      </g>

      {/* Abschluss */}
      <T x="180" y="44" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.gold} opacity={fenster(t, 16, 16.6, 20.4, 20.8)}>{zw("Brüche füllen die Zwischenräume", "Fractions fill the gaps")}</T>
      <g opacity={lauf(t, 21, 21.8)}>
        <T x="180" y="44" textAnchor="middle" fontSize="24" fontWeight="800" fill={C.tinte}><tspan fill={C.see}>ℕ</tspan> ⊂ <tspan fill={RAUM_FARBE.Z}>ℤ</tspan> ⊂ <tspan fill={C.gold}>ℚ</tspan></T>
      </g>
      <Banner y={252} breite={330} text={zw("In ℚ bleiben +, −, · und : drin", "In ℚ, +, −, · and : stay inside")} o={lauf(t, 21.6, 22.4)} farbe={C.gold} />
    </g>
  );
}

/* ======================================================================
   SZENE 4 · x² = 2 → ℝ
   ====================================================================== */
const R_DAUER = 31;
const rSchritte = () => [
  { von: 0, text: zw("Sind das jetzt alle Zahlen? Wir lösen x² = 2: Gesucht ist die Seitenlänge eines Quadrats mit dem Flächeninhalt 2. Wir starten mit dem Einheitsquadrat (Seite 1).", "Are these all numbers now? We solve x² = 2: we want the side length of a square with area 2. We start with the unit square (side 1).") },
  { von: 4.8, text: zw("Seine Diagonale d erfüllt nach Pythagoras d² = 1² + 1² = 2. Die gesuchte Zahl ist also d = √2 – und es gibt sie als Strecke.", "By Pythagoras its diagonal d satisfies d² = 1² + 1² = 2. So the number we want is d = √2 – and it exists as a length.") },
  { von: 9.4, text: zw("Mit dem Zirkel klappen wir die Diagonale auf die Zahlengerade. Sie landet zwischen 1 und 2.", "With a compass we fold the diagonal down onto the number line. It lands between 1 and 2.") },
  { von: 13.6, text: zw("Welcher Bruch ist das? 7/5 ergibt im Quadrat 1,96 – zu klein. 17/12 ergibt 2,0069 – zu groß. 41/29 ergibt 1,9988 … Die Brüche kommen immer näher, treffen aber nie genau.", "Which fraction is it? 7/5 squared is 1.96 – too small. 17/12 squared is 2.0069 – too big. 41/29 squared is 1.9988 … The fractions get ever closer but never hit exactly.") },
  { von: 20.4, text: zw("Das ist kein Pech: Es gibt überhaupt keinen Bruch, dessen Quadrat 2 ist – das beweisen wir unten mit einem Widerspruch. An der Stelle √2 hat ℚ ein Loch.", "That is no bad luck: there is no fraction at all whose square is 2 – we prove it below by contradiction. At √2, ℚ has a hole.") },
  { von: 24.8, text: zw("Die reellen Zahlen ℝ füllen alle Löcher: Rationale und irrationale Zahlen wie √2, √3 oder π bilden zusammen die lückenlose Zahlengerade. ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ – das sind alle Zahlen, die du in der Schule brauchst.", "The real numbers ℝ fill all holes: rational and irrational numbers like √2, √3 or π together form the gapless number line. ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ – these are all the numbers you need at school.") },
];
function rZeichne(t) {
  const Y = 196, E = 104, sx = (v) => 48 + v * E;
  const W2 = Math.SQRT2;
  const quad = lauf(t, 0.6, 1.8), diag = lauf(t, 5.2, 6.6);
  const dreh = lauf(t, 10, 12.4);                         // 45° → 0°
  const winkel = (Math.PI / 4) * (1 - dreh);
  const ex = sx(0) + W2 * E * Math.cos(winkel), ey = Y - W2 * E * Math.sin(winkel);
  const zoomO = fenster(t, 14, 14.6, 20.2, 20.6);
  const loch = lauf(t, 20.8, 21.6);
  const fuellen = lauf(t, 25.4, 27.2);
  const kandidaten = [["7/5", 1.4, "1,96", -1, 14.4], ["17/12", 17 / 12, "2,0069", 1, 16], ["41/29", 41 / 29, "1,9988", -1, 17.6], ["99/70", 99 / 70, "2,0002", 1, 19]];
  return (
    <g>
      {/* Zahlengerade */}
      <line x1={sx(-0.25)} y1={Y} x2={sx(2.95)} y2={Y} stroke={fuellen > 0 ? C.smaragd : C.hellgrau} strokeWidth={1.6 + 2.4 * fuellen} />
      <path d={`M${sx(2.95)} ${Y} l-7 -4 M${sx(2.95)} ${Y} l-7 4`} stroke={C.hellgrau} strokeWidth="1.6" />
      {[0, 1, 2].map((v) => (
        <g key={v}>
          <line x1={sx(v)} y1={Y - 6} x2={sx(v)} y2={Y + 6} stroke={C.tinte} strokeWidth="1.6" />
          <T x={sx(v)} y={Y + 22} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.tinte}>{v}</T>
        </g>
      ))}
      {/* Brüche als feine Marken (ℚ) */}
      <g opacity={0.7 * lauf(t, 0, 0.6) * (1 - 0.6 * fuellen)}>
        {[2, 3, 4, 5, 6, 8].flatMap((n) => Array.from({ length: Math.floor(2.9 * n) }, (_, k) => k + 1).filter((k) => k % n).map((k) => (
          <line key={`${n}-${k}`} x1={sx(k / n)} y1={Y - 3} x2={sx(k / n)} y2={Y + 3} stroke={C.gold} strokeWidth="1" />
        )))}
      </g>
      {/* Einheitsquadrat */}
      <g opacity={quad * (1 - 0.65 * lauf(t, 13.4, 14)) * (1 - fuellen)}>
        <rect x={sx(0)} y={Y - E * quad} width={E * quad} height={E * quad} fill={C.himmel} stroke={C.see} strokeWidth="1.8" />
        <T x={sx(0.5)} y={Y - E - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill={C.see} opacity={lauf(t, 1.8, 2.4) * (1 - lauf(t, 9.4, 9.8))}>1</T>
        <T x={sx(0) - 10} y={Y - E / 2 + 4} textAnchor="end" fontSize="12" fontWeight="700" fill={C.see} opacity={lauf(t, 1.8, 2.4)}>1</T>
        <T x={sx(0.5)} y={Y - E / 2 + 6} textAnchor="middle" fontSize="15" fontWeight="800" fill={C.seeTief} opacity={fenster(t, 2.2, 2.8, 5, 5.4)}>A = 1</T>
      </g>
      {/* Diagonale und Zirkelbogen */}
      {diag > 0.001 && (
        <g opacity={(1 - 0.5 * lauf(t, 13.4, 14)) * (1 - fuellen)}>
          {dreh > 0.001 && <path d={`M${sx(0) + W2 * E * Math.cos(Math.PI / 4)} ${Y - W2 * E * Math.sin(Math.PI / 4)} A ${W2 * E} ${W2 * E} 0 0 1 ${ex} ${ey}`} fill="none" stroke={C.smaragd} strokeWidth="1.6" strokeDasharray="5 4" />}
          <line x1={sx(0)} y1={Y} x2={sx(0) + (ex - sx(0)) * diag} y2={Y + (ey - Y) * diag} stroke={C.smaragd} strokeWidth="3" strokeLinecap="round" />
          <T x={sx(0) + (ex - sx(0)) * 0.55 - 12} y={Y + (ey - Y) * 0.55 - 8} textAnchor="middle" fontSize="15" fontWeight="800" fill={C.smaragd} opacity={lauf(t, 6.6, 7.2) * (1 - lauf(t, 9.6, 10))}>d</T>
        </g>
      )}
      <Zeile y={38} text="x² = 2" o={fenster(t, 0.3, 0.9, 4.6, 5)} />
      <Zeile y={38} gross={19} text="d² = 1² + 1² = 2  ⇒  d = √2" o={fenster(t, 7, 7.6, 13.4, 13.8)} />
      {/* Landepunkt */}
      {dreh > 0.98 && (
        <g>
          {loch < 0.5 && <circle cx={sx(W2)} cy={Y} r="5.6" fill={C.smaragd} />}
          <T x={sx(W2)} y={Y + 40} textAnchor="middle" fontSize="14" fontWeight="800" fill={C.smaragd}>√2 ≈ 1,414</T>
        </g>
      )}
      {/* Näherungsbrüche: Quadrat zu klein oder zu groß – nie genau 2 */}
      {zoomO > 0.001 && (
        <g opacity={zoomO}>
          <rect x="22" y="14" width="316" height="120" rx="14" fill={C.weiss} stroke={C.linie} strokeWidth="1.2" />
          <T x="40" y="36" fontSize="11.5" fontWeight="700" fill={C.grau}>{zw("Bruch", "fraction")}</T>
          <T x="150" y="36" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.grau}>{zw("im Quadrat", "squared")}</T>
          <T x="320" y="36" textAnchor="end" fontSize="11.5" fontWeight="700" fill={C.grau}>{zw("Vergleich mit 2", "compared with 2")}</T>
          {kandidaten.map(([name, , quadrat, seite, a], i) => {
            const o = lauf(t, a, a + 0.6), y = 58 + i * 21;
            return (
              <g key={name} opacity={o}>
                <T x="40" y={y} fontSize="14" fontWeight="800" fill={C.gold}>{name}</T>
                <T x="150" y={y} textAnchor="middle" fontSize="14" fontWeight="700" fill={C.tinte}>{quadrat}</T>
                <T x="320" y={y} textAnchor="end" fontSize="12.5" fontWeight="800" fill={seite < 0 ? C.see : ROT}>{seite < 0 ? zw("zu klein", "too small") : zw("zu groß", "too big")}</T>
              </g>
            );
          })}
        </g>
      )}
      {/* Loch in ℚ */}
      {loch > 0.001 && (
        <g opacity={loch * (1 - fuellen)}>
          <circle cx={sx(W2)} cy={Y} r="7.5" fill={C.sand} stroke={ROT} strokeWidth="2.2" />
          <T x={sx(W2)} y={Y - 18} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={ROT}>{zw("Loch in ℚ", "hole in ℚ")}</T>
        </g>
      )}
      <Zeile y={46} gross={19} text={zw("Kein Bruch p/q mit (p/q)² = 2", "No fraction p/q with (p/q)² = 2")} o={fenster(t, 21, 21.6, 24.8, 25.2)} />
      {/* ℝ: weitere irrationale Zahlen, Mengenbild */}
      {fuellen > 0.001 && (
        <g opacity={fuellen}>
          <circle cx={sx(W2)} cy={Y} r="5.6" fill={C.smaragd} />
          {[[Math.sqrt(3), "√3"], [Math.PI - 1, "π − 1"], [Math.E, "e"]].map(([v, n]) => (
            <g key={n}><circle cx={sx(v)} cy={Y} r="4.6" fill={C.smaragd} /><T x={sx(v)} y={Y - 12} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.smaragd}>{n}</T></g>
          ))}
        </g>
      )}
      <g opacity={lauf(t, 26.6, 27.8)}>
        {[["R", 168, 64, 150, 52], ["Q", 152, 64, 112, 40], ["Z", 136, 64, 76, 29], ["N", 120, 64, 42, 18]].map(([k, cx, cy, rx, ry]) => (
          <g key={k}>
            <ellipse cx={cx + 12} cy={cy} rx={rx} ry={ry} fill={RAUM_FARBE[k]} opacity="0.08" stroke={RAUM_FARBE[k]} strokeWidth="1.6" />
            <T x={cx + 12 + rx - 16} y={cy + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill={RAUM_FARBE[k]}>{{ N: "ℕ", Z: "ℤ", Q: "ℚ", R: "ℝ" }[k]}</T>
          </g>
        ))}
        <T x="110" y="69" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.see}>1, 2, 3</T>
        <T x="303" y="98" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={C.smaragd}>√2, π</T>
      </g>
    </g>
  );
}

/* ---------- Auswahl ---------- */
export const ZR_ANIM = {
  natuerlich: { titel: () => zw("ℕ: Plus und Mal bleiben drin", "ℕ: plus and times stay inside"), unter: () => zw("Warum ℕ abgeschlossen ist – und wo es klemmt", "Why ℕ is closed – and where it gets stuck"),
    szene: () => ({ dauer: N_DAUER, hoehe: 260, schritte: nSchritte(), zeichne: nZeichne,
      beschreibung: zw("Animation: Die natürlichen Zahlen als Perlen auf einem Strahl. 3 + 4 = 7 und 3 · 4 = 12 landen wieder in ℕ. Ausblick: 2 − 7.", "Animation: natural numbers as beads on a ray. 3 + 4 = 7 and 3 · 4 = 12 land in ℕ again. Outlook: 2 − 7.") }) },
  ganz: { titel: () => zw("Minus führt aus ℕ heraus: die ganzen Zahlen", "Minus leads out of ℕ: the integers"), unter: () => zw("2 − 7 braucht neue Zahlen – Spiegeln an der Null", "2 − 7 needs new numbers – mirroring at zero"),
    szene: () => ({ dauer: Z_DAUER, hoehe: 262, schritte: zSchritte(), zeichne: zZeichne,
      beschreibung: zw("Animation: 7 − 2 = 5 bleibt in ℕ, 2 − 7 fällt links aus ℕ heraus. Die Zahlen werden an der 0 gespiegelt, es entsteht ℤ, und 2 − 7 = −5 landet.", "Animation: 7 − 2 = 5 stays in ℕ, 2 − 7 falls out to the left. The numbers are mirrored at 0, ℤ appears and 2 − 7 = −5 lands.") }) },
  rational: { titel: () => zw("Teilen führt aus ℤ heraus: die rationalen Zahlen", "Division leads out of ℤ: the rational numbers"), unter: () => zw("10 : 5 bleibt, 2 : 5 braucht Brüche", "10 : 5 stays, 2 : 5 needs fractions"),
    szene: () => ({ dauer: Q_DAUER, hoehe: 276, schritte: qSchritte(), zeichne: qZeichne,
      beschreibung: zw("Animation: 10 : 5 = 2 liegt in ℤ. Die Strecke von 0 bis 2 wird in 5 Teile geteilt, 2 : 5 landet zwischen 0 und 1. Brüche füllen die Zahlengerade, es entsteht ℚ.", "Animation: 10 : 5 = 2 is in ℤ. The segment from 0 to 2 is split into 5 parts, 2 : 5 lands between 0 and 1. Fractions fill the number line, ℚ appears.") }) },
  reell: { titel: () => zw("x² = 2 hat keine Lösung in ℚ: die reellen Zahlen", "x² = 2 has no solution in ℚ: the real numbers"), unter: () => zw("Die Diagonale des Einheitsquadrats und das Loch in ℚ", "The diagonal of the unit square and the hole in ℚ"),
    szene: () => ({ dauer: R_DAUER, hoehe: 250, schritte: rSchritte(), zeichne: rZeichne,
      beschreibung: zw("Animation: Die Diagonale des Einheitsquadrats hat die Länge √2 und wird auf die Zahlengerade geklappt. Näherungsbrüche treffen nie genau. ℝ füllt das Loch: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.", "Animation: the diagonal of the unit square has length √2 and is folded onto the number line. Approximating fractions never hit exactly. ℝ fills the hole: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.") }) },
};

/* Aufklappbare Karte im Stil der Erkläranimationen; offen = anfangs aufgeklappt */
export function ZahlraumAnimation({ art, offen: start = false }) {
  const [offen, setOffen] = useState(start);
  const id = useId();
  const a = ZR_ANIM[art];
  if (!a) return null;
  return (
    <div data-zr-anim={art} style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", margin: "16px 0", overflow: "hidden" }}>
      <button type="button" aria-expanded={offen} aria-controls={id} onClick={() => setOffen((o) => !o)} className="erk-knopf"
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
        <span aria-hidden="true" style={{ width: 42, height: 42, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "radial-gradient(130% 150% at 90% 10%, #2A2210 0%, #0E0C08 55%, #050404 100%)", border: `1px solid ${C.flaggold}` }}>
          <svg width="16" height="16" viewBox="0 0 18 18"><path d="M5 2.5v13l11-6.5z" fill={C.flaggold} /></svg>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 2 }}>{zw("Erkläranimation", "Explainer animation")}</span>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{a.titel()}</span>
          <span style={{ display: "block", fontSize: 12.5, fontWeight: 400, color: C.grau, lineHeight: 1.45, marginTop: 2 }}>{a.unter()}</span>
        </span>
        <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: offen ? C.see : "#EEF2F8" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={offen ? C.weiss : C.see} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: offen ? "rotate(180deg)" : "none", transition: "transform .2s ease" }}><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </button>
      {offen && <div id={id} data-aufklapp-inhalt="" style={{ padding: "2px 16px 18px" }}><Player szene={a.szene()} /></div>}
    </div>
  );
}
