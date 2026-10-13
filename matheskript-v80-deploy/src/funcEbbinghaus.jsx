/* ============================================================
   Ebbinghaus – „Vergess-Kennenlernen – vom Verstehen zum Können“
   Startseiten-Kachel, Lernsektion (Prinzip, Video, drei Stufen, Wiederholungsplan),
   Dashboard „Heute in Mathe“ und Training mit echten, gespeicherten Daten.

   Die Wiederholungslogik steht in ebbinghaus.js (rein, getestet). Aufgaben und Mathematik
   kommen aus trainingDaten.js, der Aufgabenlauf aus funcTraining.jsx. Gespeichert wird im
   vorhandenen Lernstand unter training.ebbinghaus (wie bei Head & Numbers: training.kopf).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { lernAendern, useLern } from "./func6.jsx";
import { Aufgabenlauf, ebbBuchen } from "./funcTraining.jsx";
import { GrosserKnopf, Rueck, karte, kicker } from "./ui2.jsx";
import { Aufklapp } from "./ui3.jsx";
import { THEMEN, lies, neueAufgabe, normiere } from "./trainingDaten.js";
import {
  PLAENE, PLAN_IDS, SCHRITTE, SKILLS, SKILL_INFO, STATUS, ERGEBNIS_TEXT, SCHRITT_AB_HILFE_AUS,
  ARTEN, aktuelleThemen, datumVon, heuteAuswahl, letzterGeneratorVon, lernUebersicht, normiereEbb, planTage, schrittVon, skillKapitel, statusVon, tagesStand, tagesplanSichern, waehleGenerator,
} from "./ebbinghaus.js";
import { useSyncStatus } from "./lernSync.js";

export const EBB_VIDEO_ID = "otTSq-5PNsE";
export const EBB_SLOGAN = "Beende Vergess kennenlernen und lerne wirklich Mathe. Mit einem klaren System.";

/* ---------- Speicher: im vorhandenen Lernstand ---------- */
function ebbAendern(fn) {
  lernAendern((L) => {
    L.training = normiere(L.training);
    const E = normiereEbb(L.training.ebbinghaus);
    fn(E);
    L.training.ebbinghaus = E;
  });
}
function useEbb() {
  const L = useLern();
  const roh = L.training && L.training.ebbinghaus;
  const E = useMemo(() => normiereEbb(roh), [roh]);
  return { E, geladen: L.geladen !== false, zuletzt: L.training && L.training.zuletzt, T: L.training || null };
}
function useJetzt() {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setT(Date.now()), 60000); return () => clearInterval(i); }, []);
  return t;
}
const datumKurz = (d) => { const [y, m, t] = d.split("-"); return `${t}.${m}.${y}`; };
const wannText = (d, heute) => {
  const n = Math.round((Date.parse(d + "T00:00:00Z") - Date.parse(heute + "T00:00:00Z")) / 86400000);
  return n === 0 ? "heute" : n === 1 ? "morgen" : n === -1 ? "gestern" : n < 0 ? `vor ${-n} Tagen` : `in ${n} Tagen`;
};

/* ---------- Logo und Hinweis für die Startseiten-Kachel ---------- */
export function EbbinghausLogoKlein() {
  const W = 230, H = 190;
  const ohne = [], mit = [];
  for (let i = 0; i <= 40; i++) { const t = i / 40; ohne.push(`${22 + t * 190},${150 - 112 * Math.exp(-t / 0.16)}`); }
  const marken = [0.1, 0.27, 0.5, 0.78];
  const ks = [0.16, 0.26, 0.45, 0.8, 1.6];
  let start = 0, k = ks[0];
  const pkt = (t, s, kk, lvl) => `${22 + t * 190},${150 - 112 * (lvl * Math.exp(-(t - s) / kk))}`;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const idx = marken.filter((m) => t >= m).length;
    start = idx ? marken[idx - 1] : 0; k = ks[idx];
    mit.push(pkt(t, start, k, idx ? 0.96 : 1));
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      <line x1="22" y1="150" x2="214" y2="150" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <line x1="22" y1="30" x2="22" y2="150" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <polyline points={ohne.join(" ")} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.4" strokeDasharray="5 5" strokeLinecap="round" />
      <polyline points={mit.join(" ")} fill="none" stroke={C.flaggold} strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
      {marken.map((m) => <circle key={m} cx={22 + m * 190} cy={150 - 112 * 0.96} r="5" fill={C.weiss} stroke={C.flaggold} strokeWidth="2" />)}
      <circle cx="22" cy="38" r="5.5" fill={C.weiss} stroke={C.flaggold} strokeWidth="2" />
    </svg>
  );
}

/* Kleine goldene Zahl auf der Kachel: nur wenn wirklich Wiederholungen fällig sind */
export function EbbinghausBadge() {
  const { E } = useEbb();
  const jetzt = useJetzt();
  const n = heuteAuswahl(E, { jetzt }).faellig;
  if (!n) return null;
  return (
    <span aria-label={`${n} Wiederholungen heute fällig`} style={{ position: "absolute", bottom: 8, right: 8, minWidth: 26, height: 26, padding: "0 7px", borderRadius: 999, background: C.flaggold, color: C.seeTief,
      fontSize: 13, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(0,0,0,0.28)" }}>{n}</span>
  );
}

/* ---------- kleine Bausteine ---------- */
const Abschnitt = React.forwardRef(function Abschnitt({ kicker: k, titel, children }, ref) {
  return (
    <section ref={ref} style={{ marginTop: 34, scrollMarginTop: 70 }}>
      {k && <p style={{ ...kicker, color: C.gruenDunkel, marginBottom: 6 }}>{k}</p>}
      <h2 style={{ fontSize: "clamp(21px, 6.4vw, 26px)", fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>{titel}</h2>
      {children}
    </section>
  );
});
/* Fließtext mit **fett** und $Formeln$ */
function Rich({ s, style }) {
  return (
    <p style={style}>
      {String(s).split("**").map((teil, i) => {
        const inhalt = teil.split("$").map((t, k) => (k % 2 === 1 ? <M key={k} t={t} /> : <span key={k}>{t}</span>));
        return i % 2 === 1 ? <b key={i} style={{ color: C.tinte }}>{inhalt}</b> : <React.Fragment key={i}>{inhalt}</React.Fragment>;
      })}
    </p>
  );
}
const Absatz = ({ s, style }) => <Rich s={s} style={{ fontSize: 15, lineHeight: 1.8, color: C.grau, marginBottom: 12, ...style }} />;
const Chip = ({ status }) => {
  const st = STATUS[status] || STATUS.neu;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: st.farbe, whiteSpace: "nowrap" }}>
    <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 3, background: st.farbe }} />{st.name}</span>;
};
const knopfKlein = { minHeight: 44, padding: "8px 16px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" };

/* ---------- 1. Prinzip ---------- */
function Prinzip() {
  return (
    <>
      <Absatz s="Du hast etwas verstanden und eine Aufgabe gelöst. Einige Tage später ist der Rechenweg weg. Das ist normal – und du kannst etwas dagegen tun." />
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ ...karte, borderLeft: `5px solid ${C.hellgrau}` }}>
          <p style={{ ...kicker, color: C.grau }}>Vergess-Kennenlernen</p>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, color: C.tinte }}>Du lernst einen Inhalt einmal kennen, verstehst ihn vielleicht sogar und löst eine Aufgabe – und gehst dann ohne gezielte Wiederholung zum nächsten Thema weiter. Einige Zeit später ist der Rechenweg nicht mehr sicher abrufbar.</p>
        </div>
        <div style={{ ...karte, borderLeft: `5px solid ${C.flaggold}` }}>
          <p style={kicker}>Wirkliches Lernen</p>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, color: C.tinte }}>Du rufst das Verstandene wiederholt selbst ab, wendest es an und festigst es über die Zeit – in kurzen, gezielten Einheiten, die über Tage und Wochen verteilt sind.</p>
        </div>
      </div>
      <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss, borderRadius: 16, padding: "18px 18px", marginTop: 14 }}>
        <p style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.5, letterSpacing: "-0.01em" }}>Nicht nur kennenlernen. Nicht nur verstehen.</p>
        <p style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.5, color: C.flaggold, letterSpacing: "-0.01em" }}>Wiederholen, abrufen, anwenden – bis du es wirklich kannst.</p>
      </div>
      <p style={{ fontSize: 14, fontStyle: "italic", color: C.grau, lineHeight: 1.7, margin: "14px 0 6px" }}>„Du musst Mathe nicht immer wieder neu lernen. Du musst lernen, das einmal Verstandene im richtigen Moment wieder abzurufen.“</p>
      <Aufklapp titel="Drei Beispiele aus dem Alltag in Mathe">
        <Rich s="**Kettenregel.** Du siehst eine Erklärung zur Kettenregel und verstehst sie. Einige Tage später kannst du sie ohne Hilfe nicht anwenden." style={{ marginBottom: 10 }} />
        <Rich s="**Quadratische Ergänzung.** Du lernst sie, löst mehrere Aufgaben und wiederholst den Skill später ohne Musterlösung – so wird aus Verstehen Können." style={{ marginBottom: 10 }} />
        <Rich s="**Kurvendiskussion.** Du merkst, dass dein Problem eigentlich bei einer älteren Fähigkeit liegt, etwa beim Umformen von Gleichungen. Genau deshalb bleiben alte Skills im Training." />
      </Aufklapp>
      <Rueck art="info">Einmaliges Verstehen ist ein wertvoller Anfang, aber noch kein Beweis für dauerhaft verfügbares Können. Vergessen heißt nicht, dass du zu dumm für Mathe bist – meist wurde ein Inhalt einmal kennengelernt, aber noch nicht ausreichend trainiert. Fehler und Erinnerungslücken sind Rückmeldungen für dein Training, kein Urteil über dich.</Rueck>
    </>
  );
}

/* ---------- 2. Video (zwei Klicks: erst beim Abspielen wird YouTube geladen) ---------- */
function VideoBox() {
  const [an, setAn] = useState(false);
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(15,26,51,0.12)", background: C.seeTief }}>
      <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0 }}>
        {an ? (
          <iframe title="Warum wir vergessen – und wie du dagegen trainierst" src={`https://www.youtube-nocookie.com/embed/${EBB_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
        ) : (
          <button type="button" onClick={() => setAn(true)} aria-label="Video abspielen"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", cursor: "pointer", fontFamily: "inherit", color: C.weiss, padding: 16,
              background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span aria-hidden="true" style={{ width: 64, height: 64, borderRadius: 999, background: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(0,0,0,0.3)" }}>
              <svg viewBox="0 0 24 24" width="28" height="28"><path d="M 8 5 L 8 19 L 19 12 Z" fill={C.seeTief} /></svg>
            </span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Video abspielen</span>
            <span style={{ fontSize: 11.5, fontWeight: 300, opacity: 0.85, lineHeight: 1.4, textAlign: "center", maxWidth: 300 }}>Beim Abspielen wird das Video von YouTube (youtube-nocookie.com) geladen.</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* Schematische Vergessenskurve – ausdrücklich keine exakte Vorhersage und ohne Prozentzahlen */
function Vergessenskurve() {
  const W = 340, H = 190, x0 = 34, x1 = 326, yT = 24, yB = 150;
  const X = (t) => x0 + t * (x1 - x0), Y = (v) => yB - v * (yB - yT);
  const ohne = [], mit = [];
  const marken = [0.1, 0.26, 0.48, 0.74];
  const ks = [0.16, 0.26, 0.42, 0.75, 1.5];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    ohne.push(`${X(t)},${Y(Math.exp(-t / 0.16))}`);
    const idx = marken.filter((m) => t >= m).length;
    const s = idx ? marken[idx - 1] : 0;
    mit.push(`${X(t)},${Y((idx ? 0.97 : 1) * Math.exp(-(t - s) / ks[idx]))}`);
  }
  return (
    <figure style={{ margin: "14px 0 0" }}>
      <div style={{ ...karte, padding: "14px 12px 10px" }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Schematische Vergessenskurve: ohne Wiederholung fällt die Abrufbarkeit schnell, mit Wiederholungen immer langsamer" style={{ width: "100%", height: "auto", display: "block" }}>
          <line x1={x0} y1={yB} x2={x1} y2={yB} stroke={C.hellgrau} strokeWidth="1.5" />
          <line x1={x0} y1={yT - 6} x2={x0} y2={yB} stroke={C.hellgrau} strokeWidth="1.5" />
          <polyline points={ohne.join(" ")} fill="none" stroke={C.hellgrau} strokeWidth="2.6" strokeDasharray="6 5" strokeLinecap="round" />
          <polyline points={mit.join(" ")} fill="none" stroke={C.see} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
          {marken.map((m) => <circle key={m} cx={X(m)} cy={Y(0.97)} r="5.5" fill={C.flaggold} stroke={C.weiss} strokeWidth="1.5" />)}
          <circle cx={X(0)} cy={Y(1)} r="5.5" fill={C.flaggold} stroke={C.weiss} strokeWidth="1.5" />
          <text x={x0 + 8} y={yB + 17} fontSize="11" fontWeight="600" fill={C.grau}>Zeit</text>
          <text x={x0 + 8} y={yT - 8} fontSize="11" fontWeight="600" fill={C.grau}>sicher abrufbar</text>
          <text x={X(0.2)} y={Y(0.13) - 6} fontSize="11" fontWeight="600" fill={C.grau}>ohne Wiederholung</text>
          <text x={X(0.55)} y={Y(0.78) - 12} fontSize="11" fontWeight="700" fill={C.see}>mit Wiederholungen</text>
        </svg>
        <p style={{ fontSize: 12, color: C.grau, lineHeight: 1.55, marginTop: 6 }}>
          <span aria-hidden="true" style={{ display: "inline-block", width: 9, height: 9, borderRadius: 999, background: C.flaggold, marginRight: 6 }} />Gold = eine Wiederholung. Die Grafik ist <b>schematisch</b> und keine exakte Vorhersage – wie schnell jemand vergisst, ist von Mensch zu Mensch und von Skill zu Skill verschieden.
        </p>
      </div>
    </figure>
  );
}

/* ---------- 3. Drei Stufen + kurze Übung ---------- */
function Stufen() {
  const daten = [
    { n: 1, t: "Wiedererkennen", z: "„Wenn ich die Lösung sehe, kommt mir der Rechenweg bekannt vor.“", e: "Das zeigt Vertrautheit, aber noch nicht unbedingt, dass du die Aufgabe allein lösen kannst.", f: C.hellgrau },
    { n: 2, t: "Abrufen", z: "„Ich kann erklären, wie die Methode funktioniert, ohne die Lösung anzusehen.“", e: "Du rufst Wissen aktiv aus dem Gedächtnis ab.", f: C.seeHell },
    { n: 3, t: "Anwenden", z: "„Ich erkenne den richtigen Ansatz selbst und löse eine neue Aufgabe korrekt.“", e: "Du kannst das Wissen praktisch nutzen, auch wenn die Aufgabe etwas anders aussieht.", f: C.see },
  ];
  return (
    <>
      <Absatz s="Auf dem Weg vom Verstehen zum Können gibt es drei Stufen. Das ist kein Test, sondern eine Landkarte: Du darfst dich entwickeln und Fehler machen." />
      <div style={{ display: "grid", gap: 10 }}>
        {daten.map((d) => (
          <div key={d.n} style={{ ...karte, display: "flex", gap: 14, alignItems: "flex-start", padding: 14 }}>
            <div aria-hidden="true" style={{ flex: "0 0 54px", height: 54, display: "flex", alignItems: "flex-end", gap: 4 }}>
              {[1, 2, 3].map((k) => <span key={k} style={{ flex: 1, height: 10 + k * 14, borderRadius: 4, background: k <= d.n ? d.f : C.linie }} />)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", color: C.gruenDunkel, textTransform: "uppercase" }}>Stufe {d.n}</p>
              <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, margin: "2px 0 4px" }}>{d.t}</p>
              <p style={{ fontSize: 14, fontStyle: "italic", color: C.tinte, lineHeight: 1.6 }}>{d.z}</p>
              <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginTop: 4 }}>{d.e}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function KurzUebung({ starteSkill }) {
  const [eingabe, setEingabe] = useState("");
  const [abgegeben, setAbgegeben] = useState(false);
  const [meldung, setMeldung] = useState("");
  const wert = 1536;   // f′(1) für f(x) = (3x² + 1)⁴: 4·(3x²+1)³·6x = 24x(3x²+1)³ → 24·1·4³ = 1536
  const v = abgegeben ? lies(eingabe) : null;
  const passt = v !== null && Math.abs(v - wert) < 1e-9;
  const abgeben = () => {
    if (eingabe.trim() && lies(eingabe) === null) { setMeldung("Das habe ich nicht als Zahl verstanden. Erlaubt sind z. B. 1536 oder 1.536."); return; }
    setMeldung(""); setAbgegeben(true);
  };
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>Kurze Übung</p>
      <Text s="Leite ab: $f(x) = (3x^2 + 1)^4$" style={{ fontSize: 17, lineHeight: 1.8, color: C.tinte, fontWeight: 600 }} />
      <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.65, margin: "6px 0 10px" }}>Rechne zuerst <b>auf Papier und ohne Musterlösung</b>. Zur Kontrolle setzt du danach <i>x</i> = 1 in deine Ableitung ein.</p>
      <label style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 15, color: C.tinte }}>
        <span style={{ fontWeight: 600 }}><M t="f'(1) =" /></span>
        <input value={eingabe} disabled={abgegeben} inputMode="decimal" aria-label="Wert von f′ an der Stelle 1" autoComplete="off" spellCheck="false"
          onChange={(e) => { setEingabe(e.target.value.replace(/[^0-9\-−,.]/g, "").slice(0, 10)); setMeldung(""); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !abgegeben) abgeben(); }}
          style={{ width: 120, minHeight: 44, borderRadius: 10, border: `1.5px solid ${C.linie}`, padding: "0 12px", fontSize: 17, fontFamily: "inherit", color: C.tinte, background: abgegeben ? C.sand : C.weiss }} />
      </label>
      {meldung && <Rueck art="warn">{meldung}</Rueck>}
      {!abgegeben && <GrosserKnopf onClick={abgeben}>{eingabe.trim() ? "Abgeben und Lösung zeigen" : "Ohne Wert abgeben und Lösung zeigen"}</GrosserKnopf>}
      {abgegeben && (
        <div data-aufklapp-inhalt>
          {eingabe.trim() === "" ? (
            <Rueck art="info">Kein Problem – du siehst die Lösung jetzt, um den Weg zu vergleichen. Versuch es in ein paar Tagen noch einmal ohne Hilfe.</Rueck>
          ) : passt ? (
            <Rueck art="gut">Dein Wert bei x = 1 passt zur Musterlösung. Wichtig: Geprüft wurde nur dieser Zahlenwert – ob dein Rechenweg sauber ist, siehst du im Vergleich mit der Lösung unten. Die App bewertet diese Übung nicht automatisch als „gekonnt“.</Rueck>
          ) : (
            <Rueck art="warn">Dein Wert weicht von der Musterlösung ab. Vergleiche mit der Lösung unten: Wo weicht dein Weg ab? Typisch ist, die innere Ableitung 6x zu vergessen. Ein Fehler ist ein Hinweis, was du als Nächstes trainierst.</Rueck>
          )}
          <div style={{ marginTop: 12, background: C.sand, borderRadius: 12, padding: "12px 14px" }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.gruenDunkel, marginBottom: 6 }}>Musterlösung</p>
            <div style={{ fontSize: 16, lineHeight: 2.1, color: C.tinte, overflowX: "auto" }}>
              <M t="f'(x) = 4\cdot(3x^2+1)^3 \cdot 6x" /><br />
              <M t="f'(x) = 24x\,(3x^2+1)^3" /><br />
              <M t="f'(1) = 24 \cdot 1 \cdot 4^3 = 1536" />
            </div>
            <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, marginTop: 4 }}>Äußere Ableitung (Potenzregel) mal innere Ableitung <M t="6x" />.</p>
          </div>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.75, margin: "14px 0 4px" }}>Eine richtige Antwort heute ist ein guter Anfang. Ob der Skill wirklich sitzt, zeigt sich daran, ob du ihn auch nach einer Pause wieder selbstständig anwendest. Deshalb fragt die App ihn später noch einmal ab.</p>
          <GrosserKnopf gold onClick={() => starteSkill("kettenregel")}>Kettenregel als Skill starten</GrosserKnopf>
        </div>
      )}
    </div>
  );
}

/* ---------- 4. Wiederholungsplan ---------- */
function Plan({ E }) {
  const tage = planTage(E);
  const setzePlan = (id) => ebbAendern((X) => { X.plan = id; });
  return (
    <>
      <Absatz s="Jede Übung gehört zu einem oder mehreren **Skills** (z. B. Kettenregel, Potenzregel). Sobald du einen Skill zum ersten Mal selbstständig gelöst hast, plant die App die nächsten Wiederholungen – du musst nichts selbst planen." />
      <div style={{ ...karte, padding: "6px 16px" }}>
        {tage.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i ? `1px solid ${C.linie}` : "none" }}>
            <span aria-hidden="true" style={{ flex: "0 0 56px", textAlign: "center", fontSize: 13, fontWeight: 800, color: i === 0 ? C.seeTief : C.weiss, background: i === 0 ? C.flaggold : C.see, borderRadius: 999, padding: "5px 0" }}>Tag {t}</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{SCHRITTE[i].name}</p>
              {i >= SCHRITT_AB_HILFE_AUS && <p style={{ fontSize: 12.5, color: C.grau, marginTop: 1 }}>{i === 3 ? "Hier arbeitest du möglichst ohne Hilfe." : i === 4 ? "Die Aufgabe ist etwas anspruchsvoller." : "Ein langer Abstand zeigt, was wirklich hängen geblieben ist."}</p>}
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.65, margin: "10px 0 4px" }}>
        <b>Das ist ein Startmodell</b> – keine universell optimale Formel und keine Vorhersage, wann du etwas vergisst. Die tatsächlichen Abstände passen sich deiner Leistung an.
      </p>
      <div role="group" aria-label="Rhythmus wählen" style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0 14px" }}>
        {PLAN_IDS.map((id) => (
          <button key={id} type="button" aria-pressed={E.plan === id} onClick={() => setzePlan(id)}
            style={{ ...knopfKlein, background: E.plan === id ? C.see : C.weiss, color: E.plan === id ? C.weiss : C.see, borderColor: E.plan === id ? C.see : C.linie }}>
            {PLAENE[id].name}: {PLAENE[id].tage.join(" · ")}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.6, marginBottom: 16 }}>Der Rhythmus gilt für neu berechnete Termine; bereits geplante Termine bleiben, bis du sie wiederholt hast.</p>
      <p style={{ ...kicker, marginTop: 8 }}>Nach jeder Wiederholung ordnet die App ein</p>
      <div style={{ display: "grid", gap: 10 }}>
        {[
          ["sicher", "Du löst die Aufgabe selbstständig, im ersten Versuch und ohne Hilfe.", "Der nächste Abstand wird länger."],
          ["teilweise", "Du kommst ans Ziel, brauchst aber Hinweise oder einen zweiten Versuch.", "Der Abstand wird kürzer; du übst gezielt."],
          ["nicht", "Du brauchst die Lösung oder findest den Ansatz nicht.", "Du bekommst eine Erklärung, übst selbst und wirst zeitnah (morgen) wieder geprüft."],
        ].map(([k, was, folge]) => (
          <div key={k} style={{ ...karte, padding: 14, borderLeft: `5px solid ${ERGEBNIS_TEXT[k].farbe}` }}>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: ERGEBNIS_TEXT[k].farbe }}>{ERGEBNIS_TEXT[k].name}</p>
            <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.6, marginTop: 2 }}>{was}</p>
            <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, marginTop: 2 }}>{folge}</p>
          </div>
        ))}
      </div>
      <Rueck art="info">Eine nicht gelungene Wiederholung ist kein Rückschritt und kein Versagen. Sie zeigt nur: Dieser Skill braucht noch etwas Training. Geprüft wird dein <b>Ergebnis</b> – wie viel Hilfe du gebraucht hast, wird ehrlich mit eingerechnet. Dein Rechenweg wird nicht automatisch geprüft.</Rueck>
    </>
  );
}

/* ---------- 5. Training (Aufgabenlauf mit Buchung) ---------- */
function baueAufgaben(items, E) {
  return items.map((it) => {
    const S = E.skills[it.skill_id];
    const fehler = S && (S.last_result === "nicht" || S.last_result === "teilweise") ? S.last_error_type : null;   // gezielt den Fehlertyp üben
    const gen = waehleGenerator(it.skill_id, it.schritt, S ? letzterGeneratorVon(S) : null, Math.random, fehler);
    return gen ? neueAufgabe(gen) : null;
  }).filter(Boolean);
}

function Training({ items, E, onEnde, titel }) {
  const [aufgaben] = useState(() => baueAufgaben(items, E));
  const aenderungen = useRef([]);
  const [fertig, setFertig] = useState(false);
  const { E: neu } = useEbb();
  const jetzt = Date.now();
  const heute = datumVon(jetzt);
  if (!aufgaben.length) return <Rueck art="warn">Für diese Auswahl gibt es gerade keine Aufgabe.</Rueck>;
  if (fertig) {
    const gesehen = new Set();
    const zeilen = aenderungen.current.filter((a) => { const k = `${a.skill_id}:${a.voraussetzungVon || ""}`; if (gesehen.has(k)) return false; gesehen.add(k); return true; });
    return (
      <div>
        <div style={{ ...karte, background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
          <p style={{ fontSize: 12.5, opacity: 0.85, marginBottom: 6 }}>Einheit geschafft</p>
          <p style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>Heute ein kleiner Schritt – mit der Zeit ein sicherer Skill.</p>
        </div>
        <div style={{ ...karte, marginTop: 14 }}>
          <p style={kicker}>So geht es weiter</p>
          {zeilen.length === 0 && <p style={{ fontSize: 14, color: C.grau }}>Es wurde nichts eingetragen, weil keine Aufgabe bearbeitet wurde.</p>}
          {zeilen.map((a, k) => {
            const info = SKILL_INFO[a.skill_id];
            const S = neu.skills[a.skill_id];
            return (
              <div key={`${a.skill_id}${k}`} style={{ padding: "10px 0", borderTop: k ? `1px solid ${C.linie}` : "none" }}>
                <p style={{ fontSize: 14.5, fontWeight: 700, color: C.tinte }}>{info.name}</p>
                {a.voraussetzungVon ? (
                  <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6 }}>Der Fehler lag wahrscheinlich nicht bei {SKILL_INFO[a.voraussetzungVon].name}, sondern bei dieser Grundlage. Sie kommt {S ? wannText(S.next_review_at, heute) : "bald"} noch einmal dran.</p>
                ) : (
                  <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6 }}>
                    <b style={{ color: ERGEBNIS_TEXT[a.ergebnis].farbe }}>{ERGEBNIS_TEXT[a.ergebnis].name}.</b>{" "}
                    {a.lernphase && a.ergebnis === "sicher" ? "Das war dein erster selbstständiger Schritt (Tag 0). " : ""}
                    {S ? `Nächste Wiederholung: ${wannText(S.next_review_at, heute)} (${datumKurz(S.next_review_at)}).` : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <GrosserKnopf onClick={onEnde}>Zurück zu „Heute in Mathe“</GrosserKnopf>
      </div>
    );
  }
  return (
    <div>
      {titel && <p style={{ ...kicker, marginBottom: 8 }}>{titel}</p>}
      <Aufgabenlauf aufgaben={aufgaben} quelle="ebbinghaus" endeText="Zur Auswertung" onEnde={() => setFertig(true)}
        onWeiter={(a, z) => { aenderungen.current.push(...ebbBuchen([a], [z], "ebbinghaus")); }} />
    </div>
  );
}

/* ---------- 6. Dashboard „Heute in Mathe“: gespeicherter Tagesplan ---------- */
const ART_FARBE = { wiederholung: C.see, voraussetzung: C.signal, weiter: C.smaragd };

/* Der Plan für heute: einmal pro Tag angelegt und im Konto gespeichert, danach nur ergänzt.
   Angezeigt wird immer der Plan, wie er gespeichert würde – gespeichert wird, sobald der Schüler schon Skills hat. */
function useTagesplan(E, T, geladen, jetzt) {
  const heute = datumVon(jetzt);
  const { stand, noetig, schluessel } = useMemo(() => {
    const E2 = { ...E, tage: JSON.parse(JSON.stringify(E.tage || {})) };
    const vorher = JSON.stringify(E2.tage[heute] || null);
    tagesplanSichern(E2, T, { jetzt });
    const nachher = JSON.stringify(E2.tage[heute]);
    return { stand: tagesStand(E2, { jetzt }), noetig: vorher !== nachher && Object.keys(E.skills).length > 0, schluessel: `${heute}|${nachher}` };
  }, [E, T, jetzt, heute]);
  const gesichert = useRef("");
  useEffect(() => {
    if (!geladen || !noetig || gesichert.current === schluessel) return;
    gesichert.current = schluessel;
    ebbAendern((X) => { tagesplanSichern(X, T, { jetzt: Date.now() }); });
  }, [geladen, noetig, schluessel, T]);
  return stand;
}

function Dashboard({ E, T, geladen, gehe, laeuft, setLaeuft, zuSkills }) {
  const jetzt = useJetzt();
  const heute = datumVon(jetzt);
  const stand = useTagesplan(E, T, geladen, jetzt);
  const themen = useMemo(() => aktuelleThemen(E, T, { jetzt }), [E, T, jetzt]);
  const anzahlSkills = Object.keys(E.skills).length;
  const naechster = Object.values(E.skills).filter((S) => S.next_review_at > heute).sort((a, b) => a.next_review_at.localeCompare(b.next_review_at))[0];
  const anteil = stand.gesamt ? (stand.erledigt / stand.gesamt) * 100 : 0;
  const offen = stand.items.filter((i) => !i.erledigt);
  const alsItem = (i) => { const S = E.skills[i.skill_id]; return { skill_id: i.skill_id, schritt: S ? schrittVon(S, E) : 0, prio: 3, grund: i.grund }; };

  if (!geladen) return <div style={karte}><p style={{ fontSize: 14, color: C.grau }}>Dein Lernstand wird geladen …</p></div>;
  if (laeuft) {
    return <Training key={laeuft.key} items={laeuft.items} E={E} titel={laeuft.titel} onEnde={() => setLaeuft(null)} />;
  }
  return (
    <div style={karte}>
      <p style={kicker}>Dein Tagesplan · {datumKurz(heute)}</p>
      {anzahlSkills === 0 && (
        <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.7, margin: "0 0 8px" }}>Du hast noch nichts geübt. Hier ein Vorschlag zum Start – sobald du einen Skill zum ersten Mal selbstständig löst, plant die App deine Wiederholungen und stellt dir jeden Tag einen Plan zusammen. Es steht nur da, was du wirklich gemacht hast.</p>
      )}
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, margin: "0 0 10px" }}>
        {themen.length ? <>Du arbeitest gerade an: {themen.map((t) => <span key={t.thema} style={{ display: "inline-block", background: C.himmel, color: C.see, fontWeight: 700, fontSize: 12.5, borderRadius: 999, padding: "2px 10px", margin: "0 6px 4px 0" }}>{t.name}</span>)}</> : "Sobald du in einem Thema übst, erkennt die App, woran du gerade arbeitest, und richtet den Plan danach aus."}
      </p>
      {stand.items.length === 0 ? (
        <Rueck art="gut">Heute ist nichts fällig. {naechster ? `Die nächste Wiederholung (${SKILL_INFO[naechster.skill_id].name}) ist ${wannText(naechster.next_review_at, heute)} dran.` : ""} Du kannst unten jederzeit freiwillig einen Skill üben.</Rueck>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 120px", background: C.sand, borderRadius: 12, padding: "10px 14px" }}>
              <p style={{ fontSize: 30, fontWeight: 800, color: stand.fertig ? C.smaragd : C.see, lineHeight: 1.1 }}>{stand.erledigt}<span style={{ fontSize: 16, color: C.grau, fontWeight: 700 }}> / {stand.gesamt}</span></p>
              <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.4 }}>heute erledigt</p>
            </div>
            <div style={{ flex: "1 1 120px", background: C.sand, borderRadius: 12, padding: "10px 14px" }}>
              <p style={{ fontSize: 30, fontWeight: 800, color: C.tinte, lineHeight: 1.1 }}>{stand.minutenRest ? `ca. ${stand.minutenRest}` : "–"}<span style={{ fontSize: 14, fontWeight: 700 }}>{stand.minutenRest ? " Min." : ""}</span></p>
              <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.4 }}>noch zu tun</p>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(anteil)} aria-label="Fortschritt des Tagesplans" style={{ height: 8, borderRadius: 999, background: C.linie, overflow: "hidden" }}><div style={{ width: `${anteil}%`, height: "100%", background: C.smaragd, borderRadius: 999, transition: "width .3s ease" }} /></div>
          </div>
          <div style={{ marginTop: 6 }}>
            {stand.items.map((it, k) => {
              const kap = skillKapitel(it.skill_id);
              const er = it.ergebnis ? ERGEBNIS_TEXT[it.ergebnis] : null;
              return (
                <div key={it.skill_id} style={{ padding: "10px 0", borderTop: k ? `1px solid ${C.linie}` : "none", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span aria-hidden="true" style={{ flex: "0 0 22px", height: 22, borderRadius: 999, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800,
                    background: it.erledigt ? C.smaragd : "transparent", color: C.weiss, border: it.erledigt ? "none" : `1.5px solid ${C.hellgrau}` }}>{it.erledigt ? "✓" : ""}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: it.erledigt ? C.grau : C.tinte }}>{it.name}</p>
                      <span style={{ fontSize: 12, fontWeight: 700, color: ART_FARBE[it.art] }}>{ARTEN[it.art]}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55 }}>{kap.gruppe}{kap.name ? ` · ${kap.name}` : ""}</p>
                    {it.erledigt ? (
                      <p style={{ fontSize: 12.5, lineHeight: 1.55, color: C.grau }}>
                        <b style={{ color: er.farbe }}>{er.name}.</b> {it.naechster ? `Nächste Wiederholung: ${wannText(it.naechster, heute)}.` : ""}
                      </p>
                    ) : (
                      <>
                        <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55 }}>{it.grund}</p>
                        <button type="button" onClick={() => setLaeuft({ key: Date.now(), items: [alsItem(it)], titel: it.name })} style={{ ...knopfKlein, minHeight: 40, padding: "4px 14px", fontSize: 13, marginTop: 6 }}>Nur diesen üben</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {stand.fertig ? (
            <Rueck art="gut">Tagesplan geschafft. Mehr ist heute nicht nötig – wenn du Lust hast, kannst du unten freiwillig einen Skill üben.</Rueck>
          ) : (
            <GrosserKnopf gold onClick={() => setLaeuft({ key: Date.now(), items: offen.map(alsItem), titel: "Tagesplan" })}>{stand.erledigt ? "Restlichen Plan starten" : "Tagesplan starten"}</GrosserKnopf>
          )}
          {stand.zusaetzlich.length > 0 && <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 8 }}>Zusätzlich geübt: {stand.zusaetzlich.map((z) => z.name).join(", ")}.</p>}
        </>
      )}
      {anzahlSkills === 0 && <GrosserKnopf onClick={zuSkills}>Selbst einen Skill auswählen</GrosserKnopf>}
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.65, marginTop: 12 }}>Du musst nicht überlegen, was du heute lernen solltest: Der Plan besteht aus fälligen Wiederholungen und ein bis zwei neuen Schritten in dem Stoff, an dem du gerade arbeitest. Er wird einmal pro Tag zusammengestellt und gespeichert.</p>
    </div>
  );
}

/* ---------- 6b. Dein Lernstand: was gelernt, wann, was kommt ---------- */
const wochentag = (d) => new Date(d + "T00:00:00Z").toLocaleDateString("de-DE", { weekday: "short", timeZone: "UTC" });
const tagLabel = (d, heute) => (d === heute ? "Heute" : wannText(d, heute) === "gestern" ? "Gestern" : wannText(d, heute) === "morgen" ? "Morgen" : `${wochentag(d)}, ${datumKurz(d).slice(0, 6)}`);

function SyncHinweis() {
  const st = useSyncStatus();
  const zeit = st.zuletzt ? new Date(st.zuletzt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
  const t = {
    lokal: ["Nur in diesem Browser", "Der Speicher im Konto ist auf dieser Seite nicht aktiv. Dein Lernstand liegt nur in diesem Browser."],
    aus: ["Nur in diesem Browser", "Du bist nicht angemeldet. Mit einem Konto wird dein Lernstand gesichert und ist auf jedem Gerät gleich."],
    verbinde: ["Wird abgeglichen …", "Dein Lernstand wird mit deinem Konto abgeglichen."],
    ok: ["In deinem Konto gespeichert", `Dein Lernstand ist gesichert${zeit ? ` (zuletzt ${zeit} Uhr)` : ""} und auf allen Geräten verfügbar.`],
    ausstehend: ["Wird gespeichert …", "Deine letzte Änderung wird gleich in deinem Konto gesichert."],
    "nicht-eingerichtet": ["Konto-Speicher noch nicht eingerichtet", "Dein Lernstand liegt vorerst nur in diesem Browser. Der Speicher im Konto muss noch einmalig aktiviert werden."],
    fehler: ["Speichern im Konto gerade nicht möglich", "Dein Lernstand bleibt in diesem Browser erhalten und wird später erneut gesichert."],
  }[st.status] || ["", ""];
  const farbe = st.status === "ok" ? C.smaragd : st.status === "fehler" || st.status === "nicht-eingerichtet" ? C.signal : C.grau;
  return (
    <div role="status" style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 12 }}>
      <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 999, background: farbe, marginTop: 6, flex: "0 0 9px" }} />
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6 }}><b style={{ color: farbe }}>{t[0]}.</b> {t[1]}</p>
    </div>
  );
}

function Lernstand({ E, T, geladen }) {
  const jetzt = useJetzt();
  const heute = datumVon(jetzt);
  const u = useMemo(() => lernUebersicht(E, { jetzt }), [E, jetzt]);
  const [alle, setAlle] = useState(false);
  if (!geladen) return null;
  const sichtbar = alle ? u.gelernt : u.gelernt.slice(0, 6);
  const kachel = (zahl, text, farbe) => (
    <div style={{ flex: "1 1 130px", background: C.sand, borderRadius: 12, padding: "10px 14px" }}>
      <p style={{ fontSize: 26, fontWeight: 800, color: farbe || C.tinte, lineHeight: 1.15 }}>{zahl}</p>
      <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.4 }}>{text}</p>
    </div>
  );
  const ergFarbe = (e) => ERGEBNIS_TEXT[e].farbe;
  const vorschauTage = u.vorschau.filter((v) => v.skills.length);
  return (
    <>
      <SyncHinweis />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {kachel(u.anzahl.gelernt, u.anzahl.gelernt === 1 ? "Skill gelernt" : "Skills gelernt", C.see)}
        {kachel(u.serie, u.serie === 1 ? "Tag in Folge geübt" : "Tage in Folge geübt", u.serie ? C.smaragd : C.tinte)}
        {kachel(u.aufgabenGesamt, "Aufgaben im Training")}
        {kachel(u.seit ? datumKurz(u.seit).slice(0, 6) : "–", u.seit ? "Erster Skill gelernt am" : "Noch nichts gelernt")}
      </div>

      <div style={{ ...karte, marginTop: 14 }}>
        <p style={kicker}>Das hast du gelernt</p>
        {u.gelernt.length === 0 ? (
          <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.7 }}>Hier erscheint jeder Skill, sobald du ihn zum ersten Mal selbstständig gelöst hast – mit dem Datum, wann du ihn zuletzt geübt hast und wann er wiederkommt.</p>
        ) : (
          <>
            {sichtbar.map((g, k) => (
              <div key={g.skill_id} style={{ padding: "10px 0", borderTop: k ? `1px solid ${C.linie}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: C.tinte }}>{g.name}</p>
                  <Chip status={g.status} />
                </div>
                <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6 }}>
                  {g.thema} · gelernt am {datumKurz(g.erstmals)}{g.zuletzt ? ` · zuletzt geübt ${wannText(g.zuletzt, heute)}` : ""} · nächste Wiederholung {wannText(g.naechster, heute)} ({datumKurz(g.naechster).slice(0, 6)})
                </p>
              </div>
            ))}
            {u.gelernt.length > 6 && <button type="button" onClick={() => setAlle(!alle)} style={{ ...knopfKlein, marginTop: 8 }}>{alle ? "Weniger anzeigen" : `Alle ${u.gelernt.length} anzeigen`}</button>}
          </>
        )}
      </div>

      <div style={{ ...karte, marginTop: 14 }}>
        <p style={kicker}>Die letzten 14 Tage</p>
        {u.rueckblick.map((r, k) => (
          <div key={r.datum} style={{ display: "flex", gap: 12, padding: "7px 0", borderTop: k ? `1px solid ${C.linie}` : "none", alignItems: "baseline" }}>
            <p style={{ flex: "0 0 86px", fontSize: 12.5, fontWeight: r.datum === heute ? 800 : 600, color: r.datum === heute ? C.tinte : C.grau }}>{tagLabel(r.datum, heute)}</p>
            <div style={{ flex: 1, minWidth: 0 }}>
              {r.skills.length === 0 ? <p style={{ fontSize: 12.5, color: C.hellgrau }}>{r.datum === heute ? "noch nichts geübt" : "–"}</p> : (
                <p style={{ fontSize: 13, lineHeight: 1.6, color: C.tinte }}>
                  {r.skills.map((x, i) => <span key={x.skill_id}>{i ? " · " : ""}<span style={{ color: ergFarbe(x.ergebnis), fontWeight: 700 }} title={ERGEBNIS_TEXT[x.ergebnis].name}>{x.ergebnis === "sicher" ? "✓" : x.ergebnis === "teilweise" ? "◐" : "↻"}</span> {x.name}</span>)}
                </p>
              )}
              {r.geplant !== null && <p style={{ fontSize: 12, color: C.grau }}>Plan: {r.geplantErledigt} von {r.geplant} erledigt</p>}
            </div>
          </div>
        ))}
        <p style={{ fontSize: 12, color: C.grau, lineHeight: 1.6, marginTop: 8 }}>✓ sicher · ◐ mit Hilfe oder im zweiten Versuch · ↻ noch einmal üben</p>
      </div>

      <div style={{ ...karte, marginTop: 14 }}>
        <p style={kicker}>Die nächsten 14 Tage</p>
        {vorschauTage.length === 0 ? <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.7 }}>Noch nichts geplant. Sobald du Skills gelernt hast, siehst du hier, wann sie wiederkommen.</p> : vorschauTage.map((v, k) => (
          <div key={v.datum} style={{ display: "flex", gap: 12, padding: "7px 0", borderTop: k ? `1px solid ${C.linie}` : "none", alignItems: "baseline" }}>
            <p style={{ flex: "0 0 86px", fontSize: 12.5, fontWeight: 600, color: C.grau }}>{tagLabel(v.datum, heute)}</p>
            <p style={{ flex: 1, fontSize: 13, lineHeight: 1.6, color: C.tinte }}>{v.skills.map((x) => x.name).join(" · ")}</p>
          </div>
        ))}
        <p style={{ fontSize: 12, color: C.grau, lineHeight: 1.6, marginTop: 8 }}>Das ist die Vorschau der Wiederholungen. Sie verschiebt sich je nach deinen Ergebnissen. Neue Schritte kommen im Tagesplan dazu.</p>
      </div>
    </>
  );
}

/* ---------- 7. Skills ---------- */
function SkillListe({ E, gehe, start }) {
  const jetzt = useJetzt();
  const heute = datumVon(jetzt);
  const [offen, setOffen] = useState(null);
  const gruppen = useMemo(() => {
    const g = {};
    for (const s of SKILLS) { const kap = skillKapitel(s.id); (g[kap.gruppe || "Weitere"] = g[kap.gruppe || "Weitere"] || []).push(s); }
    return g;
  }, []);
  return (
    <>
      <Absatz s="Hier siehst du alle Skills, die die App kennt. Jeder gehört zu echten Aufgaben aus der App. Starte einen Skill, wenn du ihn gerade lernst – oder wiederhole freiwillig, auch vor dem Termin." />
      {Object.entries(gruppen).map(([gruppe, liste]) => (
        <div key={gruppe} style={{ ...karte, padding: "14px 16px", marginBottom: 12 }}>
          <p style={kicker}>{gruppe}</p>
          {liste.map((s, k) => {
            const S = E.skills[s.id];
            const status = S ? statusVon(S, E) : null;
            const kap = skillKapitel(s.id);
            const tool = kap.tools[0];
            const aufgeklappt = offen === s.id;
            return (
              <div key={s.id} style={{ padding: "10px 0", borderTop: k ? `1px solid ${C.linie}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: C.tinte }}>{s.name}</p>
                  {status ? <Chip status={status} /> : <span style={{ fontSize: 12, color: C.hellgrau, fontWeight: 600 }}>Noch nicht gestartet</span>}
                </div>
                <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55 }}>
                  {kap.name}
                  {S ? ` · nächste Wiederholung ${wannText(S.next_review_at, heute)} (${datumKurz(S.next_review_at)})` : ""}
                  {S && !S.first_learned_at ? " · noch nicht selbstständig gelöst" : ""}
                </p>
                {s.voraus.length > 0 && <p style={{ fontSize: 12, color: C.hellgrau, lineHeight: 1.5 }}>Baut auf: {s.voraus.map((v) => SKILL_INFO[v].name).join(", ")}</p>}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  <button type="button" onClick={() => start(s.id)} style={{ ...knopfKlein, background: C.see, color: C.weiss, borderColor: C.see }}>{S && S.first_learned_at ? "Jetzt wiederholen" : "Skill starten"}</button>
                  {tool && <button type="button" onClick={() => gehe({ ansicht: tool.ansicht, trainer: tool.trainer })} style={knopfKlein}>Zum Thema</button>}
                  {S && S.review_history.length > 0 && <button type="button" aria-expanded={aufgeklappt} onClick={() => setOffen(aufgeklappt ? null : s.id)} style={knopfKlein}>{aufgeklappt ? "Verlauf ausblenden" : "Verlauf"}</button>}
                </div>
                {aufgeklappt && S && (
                  <div data-aufklapp-inhalt style={{ marginTop: 8, background: C.sand, borderRadius: 10, padding: "8px 12px" }}>
                    {S.review_history.slice(-8).reverse().map((h, i) => (
                      <p key={i} style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.7 }}>
                        {datumKurz(h.datum)} · {SCHRITTE[h.schritt] ? SCHRITTE[h.schritt].kurz : ""} · <b style={{ color: ERGEBNIS_TEXT[h.ergebnis].farbe }}>{ERGEBNIS_TEXT[h.ergebnis].name}</b>
                        {h.verspaetung_tage > 0 ? ` · ${h.verspaetung_tage} Tage verspätet` : ""}{!h.faellig ? " · freiwillig" : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}

/* ---------- Seite ---------- */
export function EbbinghausSeite({ gehe }) {
  const { E, T, geladen } = useEbb();
  const [laeuft, setLaeuft] = useState(null);
  const refs = { lernstand: useRef(null), prinzip: useRef(null), video: useRef(null), stufen: useRef(null), plan: useRef(null), heute: useRef(null), skills: useRef(null) };
  const hin = (k) => { try { refs[k].current && refs[k].current.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { /* egal */ } };
  const jetzt = useJetzt();
  const faellig = heuteAuswahl(E, { jetzt }).faellig;
  const startSkill = (id) => {
    const S = E.skills[id];
    setLaeuft({ key: Date.now(), items: [{ skill_id: id, schritt: S ? schrittVon(S, E) : 0, prio: 3, grund: "" }], titel: S && S.first_learned_at ? `Wiederholung: ${SKILL_INFO[id].name}` : `Neuer Skill: ${SKILL_INFO[id].name}` });
    hin("heute");
  };
  const navi = [["heute", "Heute in Mathe"], ["lernstand", "Dein Lernstand"], ["prinzip", "Prinzip"], ["video", "Video"], ["stufen", "Drei Stufen"], ["plan", "Plan"], ["skills", "Skills"]];
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 6 }}>
      <nav aria-label="Abschnitte" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "4px 0 10px", margin: "0 -4px" }}>
        {navi.map(([k, t]) => <button key={k} type="button" onClick={() => hin(k)} style={{ ...knopfKlein, flex: "0 0 auto", minHeight: 40, padding: "6px 14px", fontSize: 13 }}>{t}</button>)}
      </nav>
      {faellig > 0 && !laeuft && (
        <button type="button" onClick={() => hin("heute")}
          style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", border: `1.5px solid ${C.flaggold}`, background: "#FFF9E0", borderRadius: 14, padding: "12px 14px", marginTop: 6 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: C.tinte }}>Heute {faellig === 1 ? "ist 1 Wiederholung" : `sind ${faellig} Wiederholungen`} fällig</span>
          <span style={{ display: "block", fontSize: 13, color: C.grau, marginTop: 2 }}>Zu „Heute in Mathe“ springen</span>
        </button>
      )}

      <Abschnitt kicker="Das Prinzip" titel="Vergess-Kennenlernen oder wirkliches Lernen?" ref={refs.prinzip}><Prinzip /></Abschnitt>

      <Abschnitt kicker="Video" titel="Warum wir vergessen – und wie du dagegen trainierst" ref={refs.video}>
        <Absatz s="Du hast heute etwas verstanden. Aber kannst du es nächste Woche noch ohne Hilfe anwenden? Genau hier liegt der Unterschied zwischen kurzfristigem Kennenlernen und dauerhaftem Können. Schau dir an, warum Wiederholungen so wichtig sind – und wie Mythos Mathe dir dabei hilft." />
        <VideoBox />
        <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.65, margin: "12px 0 0" }}>
          <b style={{ color: C.tinte }}>Warum „Ebbinghaus“?</b> Der Psychologe Hermann Ebbinghaus hat 1885 als einer der Ersten untersucht, wie schnell Gelerntes ohne Wiederholung verblasst – und dass Wiederholungen es festigen. Nach ihm ist die Vergessenskurve benannt.
        </p>
        <div style={{ ...karte, marginTop: 14 }}>
          <p style={{ fontSize: 16.5, fontWeight: 700, color: C.tinte, lineHeight: 1.5 }}>Du hast heute eine Aufgabe verstanden und richtig gelöst. Kannst du sie in sieben Tagen noch ohne Hilfe lösen?</p>
          <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.7, marginTop: 6 }}>Das lässt sich nicht zuverlässig allein aus dem heutigen Erfolg ableiten. Deshalb überprüft die App dein Können später noch einmal.</p>
        </div>
        <Vergessenskurve />
      </Abschnitt>

      <Abschnitt kicker="Vom Wiedererkennen zum Können" titel="Drei Stufen" ref={refs.stufen}>
        <Stufen />
        <KurzUebung starteSkill={startSkill} />
      </Abschnitt>

      <Abschnitt kicker="Der automatische Wiederholungsplan" titel="Du musst nicht allein planen" ref={refs.plan}><Plan E={E} /></Abschnitt>

      <Abschnitt kicker="Dein Training" titel="Heute in Mathe – dein nächster Schritt" ref={refs.heute}>
        <Dashboard E={E} T={T} geladen={geladen} gehe={gehe} laeuft={laeuft} setLaeuft={setLaeuft} zuSkills={() => hin("skills")} />
        <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 10 }}>
          Alte Skills bleiben im Training: Auch wenn du gerade ein neues Thema bearbeitest, kommen ältere Skills wieder dran, sobald eine Wiederholung fällig ist – oder wenn sie für dein aktuelles Thema gebraucht werden. Dein Lernstand liegt in deinem Konto bzw. in diesem Browser.
        </p>
      </Abschnitt>

      <Abschnitt kicker="Erste Version" titel="Dein Lernstand" ref={refs.lernstand}><Lernstand E={E} T={T} geladen={geladen} /></Abschnitt>

      <Abschnitt kicker="Alle Skills" titel="Deine Skills" ref={refs.skills}><SkillListe E={E} gehe={gehe} start={startSkill} /></Abschnitt>

      <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss, borderRadius: 16, padding: "20px 18px", marginTop: 34 }}>
        <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5, letterSpacing: "-0.01em" }}>Du musst Mathe nicht beim ersten Mal perfekt können.</p>
        <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.75, marginTop: 8, opacity: 0.95 }}>
          Du musst lernen, das Verstandene wieder abzurufen, Fehler als Hinweise zu nutzen und deine Fähigkeiten Schritt für Schritt zu festigen. Mythos Mathe hilft dir, daraus ein System zu machen.
        </p>
      </div>
    </div>
  );
}
