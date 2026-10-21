/* ======================================================================
   Symbole der Heute-Karte – „Lack und Goldfolie“ im Kleinen
   Jede Einheit des Tages bekommt ein eigenes Motiv (viewBox 0 0 120 90),
   gezeichnet wie die Motive der Kurs-Kacheln (funcKursMotive.jsx): Goldfolie,
   Silber, Weiß auf dunklem Lack, weicher Schein dahinter. Die Formen sind
   bewusst kräftig, damit sie auch auf dem Handy (Kachel ≈ 65 px breit) lesbar
   bleiben.

   HeuteMotiv({ id }) – id = Werkzeug-id aus werkzeuge.js oder "fehler".
   Unbekannte Werkzeuge bekommen ihr Zeichen (WERKZEUGE[id].zeichen) groß in Folie.
   Ein neues Werkzeug: Eintrag in MOTIVE ergänzen (Funktion (f) => <>…</>).
   ====================================================================== */
import React, { useId } from "react";
import { FOLIE } from "./kursFarben.js";
import { WERKZEUGE } from "./werkzeuge.js";

const TINTE = "#06102A";
const W = "#FFFFFF";
const BLASS = "rgba(255,255,255,0.32)";

/* Pfeilspitze am Ende (x2, y2) der Strecke von (x1, y1) */
function spitze(x1, y1, x2, y2, l = 10, b = 7) {
  const dx = x2 - x1, dy = y2 - y1, n = Math.hypot(dx, dy) || 1;
  const ux = dx / n, uy = dy / n;
  const bx = x2 - ux * l, by = y2 - uy * l;
  return `${x2},${y2} ${bx - uy * b},${by + ux * b} ${bx + uy * b},${by - ux * b}`;
}
function Pfeil({ x1, y1, x2, y2, farbe, breite = 5, l = 11, b = 7.5 }) {
  const n = Math.hypot(x2 - x1, y2 - y1) || 1;
  const kx = x2 - ((x2 - x1) / n) * (l * 0.7), ky = y2 - ((y2 - y1) / n) * (l * 0.7);
  return (
    <>
      <line x1={x1} y1={y1} x2={kx} y2={ky} stroke={farbe} strokeWidth={breite} strokeLinecap="round" />
      <polygon points={spitze(x1, y1, x2, y2, l, b)} fill={farbe} strokeLinejoin="round" />
    </>
  );
}

/* f = { g: Goldfolie, s: Silber, h: Schein, gl: Goldfolie für waagrechte/senkrechte Linien } als url(#…).
   Waagrechte oder senkrechte Linien brauchen f.gl: Ein Verlauf über die eigene Box ist bei einer
   Box ohne Höhe (bzw. Breite) leer – die Linie wäre unsichtbar. */
const MOTIVE = {
  /* Meine Fehler üben: Lupe über der Rechnung, darin ein Haken */
  fehler: (f) => (<>
    <circle cx="72" cy="42" r="36" fill={f.h} />
    <path d="M12 22 h40 M12 38 h26 M12 54 h34 M12 70 h22" stroke={BLASS} strokeWidth="5" strokeLinecap="round" />
    <line x1="88" y1="58" x2="105" y2="76" stroke={f.g} strokeWidth="10" strokeLinecap="round" />
    <circle cx="72" cy="42" r="22" fill="rgba(6,16,42,0.72)" stroke={f.g} strokeWidth="6" />
    <path d="M61 43 l7.5 7.5 l14 -15" stroke={W} strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>),

  /* ---------- Einträge des Tagesplans (tagesplan.js) ---------- */
  /* Warm-up: Stoppuhr mit goldenem Zeiger und Blitz */
  warmup: (f) => (<>
    <circle cx="60" cy="48" r="38" fill={f.h} />
    <rect x="52" y="6" width="16" height="8" rx="3" fill={f.s} />
    <circle cx="60" cy="50" r="30" fill="rgba(6,16,42,0.72)" stroke={f.s} strokeWidth="5" />
    <path d="M60 50 L60 30" stroke={f.g} strokeWidth="5" strokeLinecap="round" />
    <path d="M60 50 L74 58" stroke={W} strokeWidth="4" strokeLinecap="round" />
    <circle cx="60" cy="50" r="4" fill={f.g} />
    <path d="M92 10 l-8 16 h10 l-10 18" stroke={f.g} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>),
  /* Wiederholen: Kreispfeil (Ebbinghaus) um ein Blatt mit drei Zeilen */
  wiederholung: (f) => (<>
    <circle cx="60" cy="46" r="38" fill={f.h} />
    <path d="M30 56 A32 32 0 1 1 42 74" stroke={f.g} strokeWidth="7" fill="none" strokeLinecap="round" />
    <polygon points={spitze(30, 70, 40, 76, 12, 9)} fill={f.g} />
    <rect x="46" y="28" width="30" height="36" rx="5" fill="rgba(6,16,42,0.72)" stroke={f.s} strokeWidth="3.5" />
    <path d="M53 40 h16 M53 48 h16 M53 56 h10" stroke={W} strokeWidth="3.5" strokeLinecap="round" />
  </>),
  /* Aufs Blatt: Papier mit Stift, goldene Rechenzeile */
  blatt: (f) => (<>
    <circle cx="58" cy="46" r="38" fill={f.h} />
    <path d="M30 14 h46 l12 12 v52 h-58 z" fill="rgba(6,16,42,0.72)" stroke={f.s} strokeWidth="4" strokeLinejoin="round" />
    <path d="M76 14 v12 h12" stroke={f.s} strokeWidth="4" fill="none" strokeLinejoin="round" />
    <path d="M40 36 h28 M40 48 h22" stroke={BLASS} strokeWidth="4" strokeLinecap="round" />
    <path d="M40 60 h30" stroke={f.gl} strokeWidth="5" strokeLinecap="round" />
    <path d="M96 40 l12 12 l-28 28 l-16 4 l4 -16 z" fill={f.g} stroke={TINTE} strokeWidth="2" strokeLinejoin="round" />
    <path d="M80 56 l12 12" stroke={TINTE} strokeWidth="2.5" />
  </>),
  /* Auftrag: Umschlag mit goldenem Siegel */
  auftrag: (f) => (<>
    <circle cx="60" cy="46" r="38" fill={f.h} />
    <rect x="18" y="24" width="84" height="50" rx="6" fill="rgba(6,16,42,0.72)" stroke={f.s} strokeWidth="4" />
    <path d="M20 28 L60 56 L100 28" stroke={f.s} strokeWidth="4" fill="none" strokeLinejoin="round" />
    <circle cx="60" cy="58" r="11" fill={f.g} stroke={TINTE} strokeWidth="2" />
    <path d="M55 58 l3.5 3.5 l7 -7" stroke={TINTE} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>),
  /* Kerntraining ohne eigenes Werkzeug: aufgeschlagenes Buch mit goldener Seite */
  kern: (f) => (<>
    <circle cx="60" cy="46" r="38" fill={f.h} />
    <path d="M14 22 Q38 16 58 26 V74 Q38 64 14 70 Z" fill="rgba(6,16,42,0.72)" stroke={f.s} strokeWidth="4" strokeLinejoin="round" />
    <path d="M106 22 Q82 16 62 26 V74 Q82 64 106 70 Z" fill="rgba(6,16,42,0.72)" stroke={f.g} strokeWidth="4" strokeLinejoin="round" />
    <path d="M72 36 h22 M72 46 h22 M72 56 h14" stroke={f.g} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M24 36 h22 M24 46 h22 M24 56 h14" stroke={BLASS} strokeWidth="3.5" strokeLinecap="round" />
  </>),
  /* Basis-Check: Fundament aus drei Steinen, oberster in Gold */
  basis: (f) => (<>
    <circle cx="60" cy="48" r="38" fill={f.h} />
    <rect x="18" y="58" width="84" height="18" rx="4" fill="rgba(6,16,42,0.72)" stroke={f.s} strokeWidth="4" />
    <rect x="28" y="38" width="64" height="18" rx="4" fill="rgba(6,16,42,0.72)" stroke={f.s} strokeWidth="4" />
    <rect x="40" y="18" width="40" height="18" rx="4" fill={f.g} stroke={TINTE} strokeWidth="2" />
    <path d="M52 27 l5 5 l10 -10" stroke={TINTE} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>),
  /* Neustart-Check: Kreispfeil mit Haken */
  check: (f) => (<>
    <circle cx="60" cy="46" r="38" fill={f.h} />
    <path d="M86 32 A32 32 0 1 0 90 56" stroke={f.g} strokeWidth="7" fill="none" strokeLinecap="round" />
    <polygon points={spitze(92, 20, 88, 34, 12, 9)} fill={f.g} />
    <path d="M46 48 l10 10 l20 -22" stroke={W} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>),

  /* ---------- Analysis ---------- */
  /* Funktionen: Graph und Umkehrfunktion, gespiegelt an y = x */
  funktionen: (f) => (<>
    <circle cx="58" cy="44" r="40" fill={f.h} />
    <path d="M14 78 H110 M18 82 V8" stroke={BLASS} strokeWidth="2.4" strokeLinecap="round" />
    <line x1="18" y1="78" x2="88" y2="8" stroke={W} strokeOpacity="0.55" strokeWidth="2.6" strokeDasharray="5 5" strokeLinecap="round" />
    <path d="M34 78 C 38 64, 52 48, 88 36" stroke={f.s} strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M18 62 C 32 58, 48 44, 60 8" stroke={f.g} strokeWidth="5.5" fill="none" strokeLinecap="round" />
  </>),
  /* Ableitungstrainer: Kurve mit Tangente im Berührpunkt */
  ableitungstrainer: (f) => (<>
    <circle cx="40" cy="48" r="38" fill={f.h} />
    <path d="M8 74 C 30 74, 38 20, 60 22 S 92 66, 114 30" stroke={W} strokeWidth="5" fill="none" strokeLinecap="round" />
    <line x1="15" y1="80.6" x2="53" y2="13.9" stroke={f.g} strokeWidth="5" strokeLinecap="round" />
    <circle cx="34" cy="47.3" r="6.5" fill={f.g} stroke={TINTE} strokeWidth="2.6" />
  </>),
  /* Steckbrief: aus Punkten wird eine Funktion */
  steckbrief: (f) => (<>
    <circle cx="60" cy="44" r="40" fill={f.h} />
    <path d="M8 76 C 18 46, 30 26, 42 26 C 56 26, 64 58, 76 58 C 88 58, 98 40, 112 14" stroke={W} strokeOpacity="0.75" strokeWidth="3.6" fill="none" strokeDasharray="6 5" strokeLinecap="round" />
    {[[42, 26], [76, 58], [16, 58.6]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="7" fill={f.g} stroke={TINTE} strokeWidth="2.6" />)}
  </>),
  /* Kurvendiskussion: Hoch-, Tief- und Wendepunkt */
  kurvendiskussion: (f) => (<>
    <circle cx="58" cy="44" r="40" fill={f.h} />
    <path d="M8 60 C 14 34, 22 22, 32 22 C 48 22, 66 66, 84 66 C 96 66, 104 48, 112 28" stroke={W} strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="32" cy="22" r="6.5" fill={f.g} stroke={TINTE} strokeWidth="2.6" />
    <circle cx="84" cy="66" r="6.5" fill={f.g} stroke={TINTE} strokeWidth="2.6" />
    <circle cx="57.3" cy="44" r="5.5" fill={f.s} stroke={TINTE} strokeWidth="2.4" />
  </>),
  /* Integrale: Fläche unter der Kurve */
  integrale: (f) => (<>
    <circle cx="60" cy="50" r="40" fill={f.h} />
    <path d="M22 76 L22 46.5 C 40 26, 64 22, 98 44 L98 76 Z" fill={f.g} />
    <path d="M8 64 C 30 30, 64 18, 112 52" stroke={W} strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M8 76 H112" stroke={W} strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
  </>),
  /* Sinus: Schwingung mit Amplitude */
  sinus: (f) => (<>
    <circle cx="58" cy="46" r="40" fill={f.h} />
    <path d="M8 46 H112" stroke={BLASS} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M8 46 C 18 10, 32 10, 42 46 C 52 82, 66 82, 76 46 C 86 10, 100 10, 110 46" stroke={f.g} strokeWidth="5.5" fill="none" strokeLinecap="round" />
    <line x1="25" y1="44" x2="25" y2="22" stroke={W} strokeWidth="2.6" strokeLinecap="round" />
  </>),
  /* Wachstum: Exponentialkurve mit Messpunkten */
  wachstum: (f) => (<>
    <circle cx="70" cy="40" r="38" fill={f.h} />
    <path d="M14 8 V78 H112" fill="none" stroke={BLASS} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M14 72 C 58 70, 84 58, 104 10" stroke={f.g} strokeWidth="5.5" fill="none" strokeLinecap="round" />
    {[[42, 69], [70, 61], [92, 40]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="5" fill={f.s} stroke={TINTE} strokeWidth="2.2" />)}
  </>),

  /* ---------- Vektoren ---------- */
  /* Rechnen mit Vektoren: a + b als Parallelogramm */
  vektorgenerator: (f) => (<>
    <circle cx="62" cy="44" r="40" fill={f.h} />
    <path d="M70 60 L92 14 M38 26 L92 14" stroke={W} strokeOpacity="0.4" strokeWidth="2.6" strokeDasharray="4 4" strokeLinecap="round" />
    <Pfeil x1={16} y1={76} x2={70} y2={60} farbe={W} breite={4.6} />
    <Pfeil x1={16} y1={76} x2={38} y2={26} farbe={f.s} breite={4.6} />
    <Pfeil x1={16} y1={76} x2={92} y2={14} farbe={f.g} breite={5.6} l={13} b={9} />
  </>),
  /* Zwei Punkte – eine Gerade */
  zweipunkte: (f) => (<>
    <circle cx="60" cy="46" r="40" fill={f.h} />
    <line x1="6" y1="76" x2="114" y2="18" stroke={f.g} strokeWidth="5.5" strokeLinecap="round" />
    <circle cx="38" cy="58.8" r="8" fill={W} stroke={TINTE} strokeWidth="2.6" />
    <circle cx="82" cy="35.2" r="8" fill={W} stroke={TINTE} strokeWidth="2.6" />
    <text x="30" y="84" fontSize="15" fontWeight="800" fill={W} fontFamily="Montserrat, sans-serif">A</text>
    <text x="88" y="22" fontSize="15" fontWeight="800" fill={W} fontFamily="Montserrat, sans-serif">B</text>
  </>),
  /* Geraden im Raum: Achsenkreuz, zwei windschiefe Geraden */
  geraden: (f) => (<>
    <circle cx="60" cy="46" r="40" fill={f.h} />
    <path d="M40 64 V10 M40 64 H114 M40 64 L10 86" stroke={BLASS} strokeWidth="2.4" strokeLinecap="round" />
    <line x1="30" y1="84" x2="98" y2="14" stroke={f.s} strokeWidth="5" strokeLinecap="round" />
    <line x1="10" y1="30" x2="110" y2="54" stroke={TINTE} strokeWidth="11" strokeLinecap="round" />
    <line x1="10" y1="30" x2="110" y2="54" stroke={f.g} strokeWidth="5.5" strokeLinecap="round" />
  </>),
  /* Kreuzprodukt: zwei Vektoren, darauf senkrecht der dritte */
  kreuzprodukt: (f) => (<>
    <circle cx="56" cy="50" r="40" fill={f.h} />
    <path d="M20 70 L66 80 L98 60 L52 50 Z" fill={W} fillOpacity="0.1" stroke={BLASS} strokeWidth="2" strokeLinejoin="round" />
    <Pfeil x1={44} y1={66} x2={84} y2={74} farbe={W} breite={4.4} />
    <Pfeil x1={44} y1={66} x2={86} y2={54} farbe={f.s} breite={4.4} />
    <Pfeil x1={44} y1={66} x2={44} y2={10} farbe={f.gl} breite={5.6} l={13} b={9} />
  </>),
  /* Drei Punkte – eine Ebene */
  dreipunkte: (f) => (<>
    <circle cx="60" cy="46" r="40" fill={f.h} />
    <path d="M8 70 L74 82 L112 30 L46 18 Z" fill={f.g} fillOpacity="0.22" stroke={f.g} strokeWidth="3.6" strokeLinejoin="round" />
    {[[34, 62], [80, 64], [66, 34]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="7" fill={W} stroke={TINTE} strokeWidth="2.6" />)}
  </>),

  /* ---------- Stochastik ---------- */
  /* Kombinatorik: Urne mit Kugeln, eine wird gezogen */
  kombinatorik: (f) => (<>
    <circle cx="60" cy="54" r="38" fill={f.h} />
    <path d="M34 26 C 18 52, 26 84, 60 84 C 94 84, 102 52, 86 26" fill={W} fillOpacity="0.07" stroke={W} strokeWidth="4" strokeLinecap="round" />
    <path d="M30 26 H90" stroke={W} strokeWidth="4" strokeLinecap="round" />
    {[[44, 66, "g"], [61, 72, "s"], [78, 64, "g"], [52, 50, "s"], [70, 49, "g"]].map(([x, y, c]) => <circle key={x} cx={x} cy={y} r="8" fill={c === "g" ? f.g : f.s} stroke={TINTE} strokeWidth="1.8" />)}
    <circle cx="60" cy="11" r="7.5" fill={f.g} stroke={TINTE} strokeWidth="1.8" />
  </>),
  /* Erwartungswert: Verteilung, die auf ihrem Schwerpunkt balanciert */
  erwartungswert: (f) => (<>
    <circle cx="58" cy="46" r="40" fill={f.h} />
    {[14, 30, 46, 34, 20, 10].map((h, i) => <rect key={i} x={16 + i * 16} y={66 - h} width="12" height={h} rx="2.5" fill={W} fillOpacity={0.88} />)}
    <line x1="58.8" y1="66" x2="58.8" y2="10" stroke={f.gl} strokeWidth="3.4" strokeDasharray="4 4" strokeLinecap="round" />
    <line x1="10" y1="68" x2="110" y2="68" stroke={f.gl} strokeWidth="4.5" strokeLinecap="round" />
    <path d="M58.8 70 L47 86 H70.6 Z" fill={f.g} strokeLinejoin="round" />
  </>),
  /* Hypothesentest: Verteilung, Ablehnungsbereiche in Gold */
  hypothesentest: (f) => (<>
    <circle cx="60" cy="50" r="40" fill={f.h} />
    {[8, 16, 30, 48, 58, 48, 30, 16, 8].map((h, i) => {
      const rand = i < 2 || i > 6;
      return <rect key={i} x={7 + i * 12} y={76 - h} width="10" height={h} rx="2" fill={rand ? f.g : W} fillOpacity={rand ? 1 : 0.85} />;
    })}
    <path d="M6 79 H114" stroke={BLASS} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M30 14 V82 M90 14 V82" stroke={f.g} strokeWidth="2.6" strokeDasharray="4 4" strokeLinecap="round" />
  </>),

  /* ---------- Gleichungen ---------- */
  /* Gleichungen lösen: die Waage im Gleichgewicht */
  gleichungen: (f) => (<>
    <circle cx="60" cy="48" r="40" fill={f.h} />
    <line x1="60" y1="24" x2="60" y2="76" stroke={W} strokeWidth="4.5" strokeLinecap="round" />
    <path d="M42 84 H78 L71 75 H49 Z" fill={f.g} strokeLinejoin="round" />
    <line x1="18" y1="28" x2="102" y2="28" stroke={f.gl} strokeWidth="5.5" strokeLinecap="round" />
    <circle cx="60" cy="24" r="5.5" fill={f.g} />
    <path d="M22 30 L12 54 M22 30 L32 54 M98 30 L88 54 M98 30 L108 54" stroke={W} strokeOpacity="0.6" strokeWidth="2" />
    <path d="M8 54 Q 22 66, 36 54 Z M84 54 Q 98 66, 112 54 Z" fill={W} fillOpacity="0.9" />
    <rect x="15" y="41" width="14" height="12" rx="2" fill={f.g} />
    <circle cx="93" cy="48" r="5.4" fill={f.s} /><circle cx="104" cy="48" r="5.4" fill={f.s} />
  </>),
  /* Terme und Potenzen: Quadrate wachsen, daneben der Würfel */
  terme: (f) => (<>
    <circle cx="48" cy="50" r="40" fill={f.h} />
    <rect x="12" y="26" width="52" height="52" rx="3" fill={W} fillOpacity="0.07" stroke={W} strokeOpacity="0.8" strokeWidth="3" />
    <rect x="12" y="46" width="32" height="32" rx="2.5" fill={W} fillOpacity="0.1" stroke={f.s} strokeWidth="3.4" />
    <rect x="12" y="62" width="16" height="16" rx="2" fill={f.g} />
    <path d="M76 48 L86 38 H112 L102 48 Z" fill="#FFE9A0" />
    <path d="M102 48 L112 38 V64 L102 74 Z" fill="#8A6A00" />
    <rect x="76" y="48" width="26" height="26" fill={f.g} />
  </>),
  /* Ungleichungen: Zahlenstrahl, Lösungsmenge als goldener Strahl */
  ungleichungen: (f) => (<>
    <circle cx="50" cy="46" r="40" fill={f.h} />
    <Pfeil x1={8} y1={50} x2={114} y2={50} farbe={W} breite={3} l={9} b={6} />
    {[22, 40, 58, 94].map((x) => <line key={x} x1={x} y1={43} x2={x} y2={57} stroke={W} strokeWidth="2.6" strokeLinecap="round" />)}
    <Pfeil x1={70} y1={34} x2={12} y2={34} farbe={f.gl} breite={7} l={14} b={10} />
    <circle cx="76" cy="50" r="7" fill={TINTE} stroke={f.g} strokeWidth="4" />
  </>),

  /* ---------- Textaufgaben ---------- */
  /* Text → Funktion */
  textaufgaben: (f) => (<>
    <circle cx="62" cy="46" r="40" fill={f.h} />
    <rect x="8" y="14" width="48" height="62" rx="7" fill={W} fillOpacity="0.1" stroke={W} strokeOpacity="0.55" strokeWidth="2.4" />
    <path d="M17 28 H47 M17 40 H43 M17 52 H39" stroke={W} strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" />
    <path d="M17 64 H33" stroke={f.g} strokeWidth="4.5" strokeLinecap="round" />
    <Pfeil x1={62} y1={45} x2={80} y2={45} farbe={f.gl} breite={4.6} l={10} b={7} />
    <path d="M86 16 V72 H114" fill="none" stroke={BLASS} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M86 66 L112 24" stroke={f.g} strokeWidth="5" strokeLinecap="round" />
  </>),

  /* ---------- Fundament ---------- */
  /* Axiome: das Fundament aus Bausteinen */
  axiome: (f) => (<>
    <circle cx="60" cy="50" r="40" fill={f.h} />
    {[14, 46, 78].map((x) => <rect key={x} x={x} y="64" width="28" height="16" rx="3" fill={W} fillOpacity="0.16" stroke={W} strokeOpacity="0.7" strokeWidth="2.4" />)}
    {[30, 62].map((x) => <rect key={x} x={x} y="44" width="28" height="16" rx="3" fill={f.s} />)}
    <rect x="46" y="24" width="28" height="16" rx="3" fill={f.g} />
  </>),
  /* Zahlenräume: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ */
  zahlenraeume: (f) => (<>
    <circle cx="56" cy="50" r="40" fill={f.h} />
    <ellipse cx="62" cy="46" rx="52" ry="38" fill="none" stroke={W} strokeOpacity="0.4" strokeWidth="3" />
    <ellipse cx="56" cy="50" rx="39" ry="29" fill="none" stroke={W} strokeOpacity="0.7" strokeWidth="3" />
    <ellipse cx="50" cy="55" rx="26" ry="19" fill={W} fillOpacity="0.06" stroke={f.s} strokeWidth="3.6" />
    <ellipse cx="44" cy="60" rx="13" ry="9.5" fill={f.g} />
  </>),
  /* Mengen und Logik: A ∩ B */
  mengenlogik: (f) => (<>
    <circle cx="60" cy="46" r="40" fill={f.h} />
    <circle cx="44" cy="46" r="27" fill={W} fillOpacity="0.07" stroke={W} strokeWidth="4" />
    <circle cx="76" cy="46" r="27" fill={W} fillOpacity="0.07" stroke={f.s} strokeWidth="4" />
    <path d="M60 23.5 A27 27 0 0 1 60 68.5 A27 27 0 0 1 60 23.5 Z" fill={f.g} />
  </>),

  /* ---------- Geometrie ---------- */
  /* Koordinatensystem: Punkt und sein Spiegelbild */
  koordinaten: (f) => (<>
    <circle cx="60" cy="46" r="40" fill={f.h} />
    <path d="M8 46 H112 M60 84 V8" stroke={W} strokeOpacity="0.5" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M88 22 V46 M88 22 H60" stroke={f.g} strokeWidth="2.8" strokeDasharray="4 3.5" strokeLinecap="round" />
    <line x1="88" y1="22" x2="32" y2="70" stroke={W} strokeOpacity="0.35" strokeWidth="2.2" strokeDasharray="3 4" />
    <circle cx="88" cy="22" r="7.5" fill={f.g} stroke={TINTE} strokeWidth="2.4" />
    <circle cx="32" cy="70" r="7.5" fill={f.s} stroke={TINTE} strokeWidth="2.4" />
  </>),
  /* Winkel und Winkelsummen: Dreieck mit Winkelbögen */
  winkelsaetze: (f) => (<>
    <circle cx="60" cy="54" r="40" fill={f.h} />
    <path d="M12 78 L108 78 L70 14 Z" fill={W} fillOpacity="0.07" stroke={W} strokeWidth="4" strokeLinejoin="round" />
    <path d="M12 78 L31 78 A19 19 0 0 0 24.5 63.8 Z" fill={f.g} />
    <path d="M108 78 L92 78 A16 16 0 0 1 99.8 64.3 Z" fill={f.s} />
    <path d="M77.1 25.9 A14 14 0 0 1 60.5 24.1" stroke={f.g} strokeWidth="4" fill="none" strokeLinecap="round" />
  </>),
  /* Flächeninhalt: Parallelogramm mit Höhe */
  flaechen: (f) => (<>
    <circle cx="60" cy="48" r="40" fill={f.h} />
    <path d="M12 74 L82 74 L108 22 L38 22 Z" fill={f.g} />
    <line x1="38" y1="22" x2="38" y2="74" stroke={TINTE} strokeWidth="3" strokeDasharray="4 3.5" />
    <path d="M38 65 H47 V74" stroke={TINTE} strokeWidth="2.6" fill="none" />
    <path d="M12 82 H82" stroke={W} strokeWidth="3" strokeLinecap="round" />
  </>),
  /* Satz des Thales: rechter Winkel im Halbkreis */
  thales: (f) => (<>
    <circle cx="60" cy="56" r="40" fill={f.h} />
    <path d="M14 76 A46 46 0 0 1 106 76" stroke={W} strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M10 76 H110" stroke={W} strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
    <path d="M14 76 L37 36.2 L106 76 Z" fill={f.g} fillOpacity="0.16" stroke={f.g} strokeWidth="4.6" strokeLinejoin="round" />
    <path d="M33 43.1 L39.9 47.1 L43.9 40.2" stroke={W} strokeWidth="2.8" fill="none" />
    <circle cx="60" cy="76" r="4" fill={W} />
  </>),
  /* Kongruenz: zwei deckungsgleiche Dreiecke */
  kongruenz: (f) => (<>
    <circle cx="60" cy="46" r="40" fill={f.h} />
    <path d="M10 72 L50 72 L22 22 Z" fill={f.s} fillOpacity="0.3" stroke={f.s} strokeWidth="3.6" strokeLinejoin="round" />
    <path d="M62 72 L102 72 L74 22 Z" fill={f.g} stroke={f.g} strokeWidth="3.6" strokeLinejoin="round" />
    <path d="M28 76 V82 M80 76 V82 M78 76 V82" stroke={W} strokeWidth="2.4" strokeLinecap="round" />
  </>),

  /* ---------- Brüche ---------- */
  /* Brüche rechnen: drei Viertel */
  bruchrechnen: (f) => (<>
    <circle cx="46" cy="46" r="40" fill={f.h} />
    <circle cx="44" cy="46" r="31" fill={W} fillOpacity="0.1" stroke={W} strokeOpacity="0.7" strokeWidth="2.6" />
    <path d="M44 46 L44 15 A31 31 0 1 1 13 46 Z" fill={f.g} />
    <path d="M44 15 V77 M13 46 H75" stroke={TINTE} strokeWidth="2.6" />
    <text x="98" y="38" textAnchor="middle" fontSize="22" fontWeight="800" fill={f.g} fontFamily="Montserrat, sans-serif">3</text>
    <line x1="88" y1="46" x2="108" y2="46" stroke={W} strokeWidth="3.4" strokeLinecap="round" />
    <text x="98" y="72" textAnchor="middle" fontSize="22" fontWeight="800" fill={W} fontFamily="Montserrat, sans-serif">4</text>
  </>),
  /* Bruchterme: Hyperbel mit Asymptoten */
  bruchterme: (f) => (<>
    <circle cx="60" cy="46" r="40" fill={f.h} />
    <path d="M60 6 V86 M6 46 H114" stroke={W} strokeOpacity="0.45" strokeWidth="2.6" strokeDasharray="5 4" strokeLinecap="round" />
    <path d="M66 8 C 68 32, 80 40, 112 41" stroke={f.g} strokeWidth="5.5" fill="none" strokeLinecap="round" />
    <path d="M54 84 C 52 60, 40 52, 8 51" stroke={f.s} strokeWidth="5.5" fill="none" strokeLinecap="round" />
  </>),

  /* ---------- Zahlen ---------- */
  /* Stellenwert: Abakus – je Stelle eine Stange */
  stellenwert: (f) => (<>
    <circle cx="60" cy="48" r="40" fill={f.h} />
    {[24, 48, 72, 96].map((x) => <line key={x} x1={x} y1="12" x2={x} y2="76" stroke={W} strokeOpacity="0.4" strokeWidth="2.6" strokeLinecap="round" />)}
    <line x1="10" y1="78" x2="110" y2="78" stroke={W} strokeWidth="5" strokeLinecap="round" />
    {[[24, 1], [48, 3], [72, 2], [96, 4]].map(([x, n], k) =>
      Array.from({ length: n }, (_, i) => <rect key={`${k}-${i}`} x={x - 10} y={64 - i * 12} width="20" height="10" rx="5" fill={k === 0 ? f.g : f.s} />))}
  </>),
  /* Rechengesetze: a · (b + c) als Fläche */
  rechengesetze: (f) => (<>
    <circle cx="60" cy="48" r="40" fill={f.h} />
    <rect x="20" y="24" width="48" height="50" rx="3" fill={f.g} />
    <rect x="72" y="24" width="36" height="50" rx="3" fill={f.s} />
    <text x="44" y="17" textAnchor="middle" fontSize="15" fontStyle="italic" fontWeight="800" fill={W} fontFamily="Montserrat, sans-serif">b</text>
    <text x="90" y="17" textAnchor="middle" fontSize="15" fontStyle="italic" fontWeight="800" fill={W} fontFamily="Montserrat, sans-serif">c</text>
    <text x="10" y="54" textAnchor="middle" fontSize="15" fontStyle="italic" fontWeight="800" fill={W} fontFamily="Montserrat, sans-serif">a</text>
  </>),
  /* Größen: Lineal mit Maßpfeil */
  groessen: (f) => (<>
    <circle cx="60" cy="50" r="40" fill={f.h} />
    <rect x="8" y="46" width="104" height="28" rx="5" fill={f.s} />
    {Array.from({ length: 19 }, (_, i) => <line key={i} x1={14 + i * 5.2} y1="46" x2={14 + i * 5.2} y2={i % 5 === 0 ? 58 : 52} stroke={TINTE} strokeWidth={i % 5 === 0 ? 2.2 : 1.4} />)}
    <Pfeil x1={40} y1={28} x2={14} y2={28} farbe={f.gl} breite={4.6} l={10} b={7} />
    <Pfeil x1={80} y1={28} x2={106} y2={28} farbe={f.gl} breite={4.6} l={10} b={7} />
    <line x1="38" y1="28" x2="82" y2="28" stroke={f.gl} strokeWidth="4.6" />
  </>),

  /* ---------- Zuordnungen und Prozent ---------- */
  /* Zuordnungen: proportional, mit Steigungsdreiecken */
  zuordnungen: (f) => (<>
    <circle cx="62" cy="46" r="40" fill={f.h} />
    <path d="M16 8 V78 H112" fill="none" stroke={BLASS} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M40 62.4 H64 V46.7 M64 46.7 H88 V31" stroke={W} strokeWidth="3" fill="none" strokeLinejoin="round" />
    <line x1="16" y1="78" x2="110" y2="16.7" stroke={f.g} strokeWidth="5.5" strokeLinecap="round" />
    {[[40, 62.4], [64, 46.7], [88, 31]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="5" fill={f.g} stroke={TINTE} strokeWidth="2" />)}
  </>),
  /* Prozent: Ring zu 70 % gefüllt und das Prozentzeichen */
  prozent: (f) => (<>
    <circle cx="44" cy="46" r="40" fill={f.h} />
    <circle cx="42" cy="46" r="28" fill="none" stroke={W} strokeOpacity="0.16" strokeWidth="11" />
    <circle cx="42" cy="46" r="28" fill="none" stroke={f.g} strokeWidth="11" strokeLinecap="round" strokeDasharray="123.2 175.9" transform="rotate(-90 42 46)" />
    <circle cx="90" cy="28" r="7" fill="none" stroke={W} strokeWidth="4.2" />
    <circle cx="106" cy="66" r="7" fill="none" stroke={W} strokeWidth="4.2" />
    <line x1="108" y1="22" x2="88" y2="72" stroke={W} strokeWidth="4.6" strokeLinecap="round" />
  </>),

  /* ---------- Daten und Zufall ---------- */
  /* Diagramme: Balken und der Mittelwert */
  diagramme: (f) => (<>
    <circle cx="60" cy="46" r="40" fill={f.h} />
    {[30, 52, 38, 60, 24].map((h, i) => <rect key={i} x={14 + i * 19.5} y={78 - h} width="14" height={h} rx="2.5" fill={f.s} />)}
    <line x1="8" y1="37.2" x2="112" y2="37.2" stroke={f.gl} strokeWidth="4.6" strokeLinecap="round" />
    <path d="M8 80 H112" stroke={BLASS} strokeWidth="2.4" strokeLinecap="round" />
  </>),
  /* Zufall: zwei Würfel */
  zufall: (f) => (<>
    <circle cx="56" cy="50" r="40" fill={f.h} />
    <g transform="rotate(16 92 30)">
      <rect x="78" y="16" width="28" height="28" rx="6" fill={f.s} />
      <circle cx="86" cy="24" r="3" fill={TINTE} /><circle cx="98" cy="36" r="3" fill={TINTE} />
    </g>
    <g transform="rotate(-12 50 52)">
      <rect x="26" y="28" width="48" height="48" rx="10" fill={f.g} />
      {[[38, 40], [62, 40], [50, 52], [38, 64], [62, 64]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4.6" fill={TINTE} />)}
    </g>
  </>),
};

/* Zusammenlegungen und Varianten auf dasselbe Motiv */
const GLEICH = {
  advplotter: "kurvendiskussion", plotter: "kurvendiskussion", gleichverstehen: "gleichungen",
  scharen: "kurvendiskussion", optimierung: "integrale", dreipunkteebene: "dreipunkte",
};

export const hatMotiv = (id) => !!(MOTIVE[id] || MOTIVE[GLEICH[id]]);

function ZeichenMotiv({ zeichen, f }) {
  const z = String(zeichen || "?");
  const groesse = z.length <= 2 ? 44 : z.length <= 4 ? 32 : 24;
  return (<>
    <circle cx="60" cy="46" r="40" fill={f.h} />
    <text x="60" y="46" dy="0.35em" textAnchor="middle" fontSize={groesse} fontWeight="800" letterSpacing="-1" fill={f.g} fontFamily="Montserrat, sans-serif">{z}</text>
  </>);
}

/* Das Motiv als SVG (viewBox 0 0 120 90). gedimmt: für erledigte Einheiten. */
export function HeuteMotiv({ id, className, style }) {
  const roh = useId();
  const u = `hm${roh.replace(/[^a-zA-Z0-9]/g, "")}`;
  const f = { g: `url(#${u}-g)`, s: `url(#${u}-s)`, h: `url(#${u}-h)`, gl: `url(#${u}-gl)` };
  const zeichne = MOTIVE[id] || MOTIVE[GLEICH[id]];
  return (
    <svg viewBox="0 0 120 90" className={className} style={style} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${u}-g`} x1="0" y1="0" x2="1" y2="1">
          {FOLIE.gold.map((c, i) => <stop key={i} offset={`${(i / (FOLIE.gold.length - 1)) * 100}%`} stopColor={c} />)}
        </linearGradient>
        <linearGradient id={`${u}-s`} x1="0" y1="0" x2="1" y2="1">
          {FOLIE.silber.map((c, i) => <stop key={i} offset={`${(i / (FOLIE.silber.length - 1)) * 100}%`} stopColor={c} />)}
        </linearGradient>
        <linearGradient id={`${u}-gl`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="120" y2="90">
          {FOLIE.gold.map((c, i) => <stop key={i} offset={`${(i / (FOLIE.gold.length - 1)) * 100}%`} stopColor={c} />)}
        </linearGradient>
        <radialGradient id={`${u}-h`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EDBB00" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#EDBB00" stopOpacity="0" />
        </radialGradient>
      </defs>
      {zeichne ? zeichne(f) : <ZeichenMotiv zeichen={(WERKZEUGE[id] || {}).zeichen} f={f} />}
    </svg>
  );
}

export const MOTIV_IDS = Object.keys(MOTIVE);
