import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { merken } from "./func5.jsx";
import { M } from "./func3.jsx";
import {
  STUFEN, STUFE_INFO, baueRunde, buche, empfehlung, fehlerName, fehlerTipp, haeufigeFehler, neueAufgabe, reiterNeu, stufenStatus, uebenSchritte, uebenSchrittZu, uebersicht, wertung,
} from "./gleichKurs.js";
import { UEBEN_MODI, aufAnhieb } from "./uebenKern.js";
import { UEBEN_CSS, UebenFertig, UebenWahl } from "./funcUebenWahl.jsx";
import { L, karte, Kicker, H2, Absatz, Zurueck, Knopf } from "./funcHeadNumbersBasis.jsx";
import {
  GOLD, NACHT, STATUS_FARBE, STATUS_NAME, GleichTastatur, GleichungGross, InfoKarte, Karte, Rechenkette, Rechnung, Reiter, StufenChips, eingeben, gleichAendern, tx, useGleich,
} from "./funcGleichKursBasis.jsx";
import { GleichungsFilm } from "./funcGleichKursFilm.jsx";

import { springe } from "./sprung.js";
import { MathildaModusKnopf } from "./funcMathildaModusKnopf.jsx";
/* ======================================================================
   GLEICHUNGEN – eigener Bereich nach dem Vorbild „Kopfrechnen“
   Vier Reiter (seit 22.10.: Verstehen bleibt vorne, dahinter die drei Modi
   Auto | Üben | Lernen aus uebenKern.UEBEN_MODI):
     Verstehen  Rechnen vs. Gleichung, Motion-Film über alle Schwierigkeits-
                grade, Rechenkette rückwärts, Waage-Regel, die sieben Stufen
     Auto       die App rechnet vor: dieselbe Aufgabe wie Üben, die ganze
                Rechnung mit Umformungen rechts daneben, Probe – kein Lernstand
     Üben       Schritt-Werkzeug (früher „Rechnen“, war schon die geführte
                Auswahl): Information lesen, je Umformung die richtige Karte
                aus 2–4 goldenen wählen (UebenWahl aus funcUebenWahl.jsx,
                Schritte aus gleichKurs.uebenSchritte), Zeile zieht ins
                Zielfeld ein, Probe, „x von n Schritten auf Anhieb“
     Lernen     (früher „Training“) Lernstand je Stufe, Runden (Stufe,
                gemischt, wiederholen), eigene Tastatur mit Minus, Fehlerarten
   Alte Ids „rechnen“ → ueben, „training“ → lernen (Links, Übergaben).
   Logik und Lernstand in gleichKurs.js (getestet), gespeichert unter
   LERN.training.gleich. Alle Texte zweisprachig.
   ====================================================================== */

const glText = (a) => `${a.gl[0]} = ${a.gl[1]}`;
const gruppeName = (s) => `Gleichungen · Stufe ${STUFE_INFO[s].nr}`;

/* Reiter: Verstehen + die drei Modi (REITER/reiterNeu in gleichKurs.js) */
const modusVon = (id) => UEBEN_MODI.find((m) => m.id === id);
const modusText = (r) => (r === "verstehen"
  ? L("Was eine Gleichung ist – und die eine Regel, mit der du jede löst.", "What an equation is – and the one rule that solves every one of them.")
  : L(modusVon(r).text, modusVon(r).textEn));

/* Üben-Karten zeigen Sätze („Auf beiden Seiten 5 abziehen“), keine Formeln: Text darf umbrechen,
   etwas kleiner als die Formelkarten der anderen Werkzeuge. Gemessen wird in derselben Größe. */
const GK_UEBEN_CSS = `
[data-gk-ueben-weg] .uw-option{font-size:16.5px;line-height:1.4;min-height:56px}
[data-gk-ueben-weg] .uw-inhalt{display:block;white-space:normal;overflow:visible}
[data-gk-ueben-weg] .uw-raster[data-kompakt="true"] .uw-inhalt{font-size:16.5px}
[data-gk-ueben-weg] .uw-mass>span{font-size:16.5px}
[data-gk-ueben-weg] .uw-fertig{padding-top:18px}
`;

/* ======================================================================
   VERSTEHEN
   ====================================================================== */
function Gegenueber() {
  const spalte = (kicker, oben, unten, text, gold) => (
    <div style={{ flex: "1 1 220px", borderRadius: 16, padding: 16, background: gold ? "#FFF8DC" : C.himmel, border: gold ? `1.5px solid ${GOLD}` : "1.5px solid transparent" }}>
      <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: gold ? C.gruenDunkel : C.see, marginBottom: 8 }}>{kicker}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: C.tinte, marginBottom: 2, whiteSpace: "nowrap" }}>{oben}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: gold ? C.gruenDunkel : C.see, marginBottom: 10, whiteSpace: "nowrap" }}>{unten}</p>
      <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.6, fontWeight: 300 }}>{text}</p>
    </div>
  );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {spalte(L("Rechnen", "Calculating"), "7 · 8 = ?", "→ 56", L("Wir kennen alle Zahlen und machen daraus eine neue – mit den Grundrechenarten.", "We know all the numbers and make a new one – with the basic operations."))}
      {spalte(L("Gleichung", "Equation"), <span>7 · <span style={{ color: C.gruenDunkel }}>x</span> = 56</span>, "→ x = 8", L("Wir haben eine Information über eine Zahl und finden diese Zahl.", "We have information about a number and find that number."), true)}
    </div>
  );
}

function KetteErleben() {
  const [a, setA] = useState(() => neueAufgabe("s2"));
  const [schritt, setSchritt] = useState(0);
  const n = a.kette.schritte.length;
  const neu = () => { setA(neueAufgabe("s2")); setSchritt(0); };
  const naechste = a.kette.schritte[n - 1 - schritt];
  return (
    <Karte>
      <Kicker>{L("Rückwärts denken", "Thinking backwards")}</Kicker>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, marginBottom: 6 }}>{L("Die Rechenkette rückwärts gehen", "Walking the chain backwards")}</p>
      <Absatz style={{ fontSize: 14 }}>{L("Oben steht, was mit der Zahl passiert ist. Unten gehst du denselben Weg zurück – mit der Umkehrung jedes Schritts, beim letzten Schritt beginnend.", "At the top you see what happened to the number. Below you walk the same path back – undoing each step, starting with the last one.")}</Absatz>
      <InfoKarte info={a.info} />
      <div style={{ textAlign: "center", fontSize: 22, fontWeight: 600, marginBottom: 10 }}><M t={glText(a)} /></div>
      <Rechenkette kette={a.kette} schritt={schritt} ergebnis={a.loesungen[0]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
        {schritt < n
          ? <Knopf onClick={() => setSchritt(schritt + 1)}><span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>{L("Rückwärts:", "Backwards:")} <M t={naechste.rueck} /></span></Knopf>
          : <Knopf onClick={neu}>{L("Neue Kette", "New chain")}</Knopf>}
        <Knopf haupt={false} onClick={() => (schritt ? setSchritt(0) : neu())}>{schritt ? L("Von vorn", "Start over") : L("Andere Kette", "Other chain")}</Knopf>
      </div>
      {schritt >= n && <p style={{ marginTop: 12, fontSize: 14.5, color: C.smaragd, fontWeight: 700 }}>✓ {L(`Gefunden: x = ${String(a.loesungen[0]).replace("-", "−")}`, `Found: x = ${String(a.loesungen[0]).replace("-", "−")}`)}</p>}
    </Karte>
  );
}

function Waage() {
  return (
    <Karte>
      <Kicker>{L("Die eine Regel", "The one rule")}</Kicker>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, marginBottom: 8 }}>{L("Eine Gleichung ist wie eine Waage", "An equation is like a balance")}</p>
      <svg viewBox="0 0 320 142" style={{ width: "100%", maxWidth: 360, display: "block", margin: "0 auto 8px" }} role="img" aria-label={L("Waage im Gleichgewicht: links 3x + 5, rechts 26", "Balance in equilibrium: left 3x + 5, right 26")}>
        <polygon points="160,40 146,108 174,108" fill={C.linie} />
        <rect x="120" y="106" width="80" height="8" rx="4" fill={C.hellgrau} />
        <line x1="40" y1="40" x2="280" y2="40" stroke={NACHT} strokeWidth="4" strokeLinecap="round" />
        <circle cx="160" cy="40" r="6" fill={GOLD} />
        <line x1="70" y1="40" x2="70" y2="62" stroke={C.hellgrau} strokeWidth="2" /><line x1="250" y1="40" x2="250" y2="62" stroke={C.hellgrau} strokeWidth="2" />
        <path d="M30 62 h80 a40 14 0 0 1 -80 0z" fill={C.himmel} stroke={C.see} strokeWidth="1.5" />
        <path d="M210 62 h80 a40 14 0 0 1 -80 0z" fill={C.himmel} stroke={C.see} strokeWidth="1.5" />
        <text x="70" y="30" textAnchor="middle" fontSize="18" fontWeight="700" fill={C.tinte}>3x + 5</text>
        <text x="250" y="30" textAnchor="middle" fontSize="18" fontWeight="700" fill={C.tinte}>26</text>
        <text x="160" y="136" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.gruenDunkel}>{L("− 5 auf beiden Seiten", "− 5 on both sides")}</text>
      </svg>
      <Absatz style={{ fontSize: 14, marginBottom: 6 }}>{L("Beide Seiten sind gleich viel wert. Solange du links und rechts dasselbe tust, bleibt die Waage im Gleichgewicht – und die Gleichung wahr. So schälst du die Zahl Schritt für Schritt heraus.", "Both sides are worth the same. As long as you do the same on the left and on the right, the balance stays level – and the equation stays true. That is how you peel out the number step by step.")}</Absatz>
      <Absatz style={{ fontSize: 14, marginBottom: 0 }}>{L("Am Ende kommt die Probe: Setz deine Zahl in die Ausgangsgleichung ein. Kommt links und rechts dasselbe heraus, ist sie gefunden.", "At the end comes the check: put your number into the original equation. If both sides come out the same, you have found it.")}</Absatz>
    </Karte>
  );
}

function Verstehen({ onUeben, G }) {
  return (
    <div>
      <Karte style={{ padding: 22 }}>
        <Kicker>{L("Worum es geht", "What it is about")}</Kicker>
        <H2>{L("Rechnen und Gleichungen: zwei Richtungen", "Calculating and equations: two directions")}</H2>
        <Absatz>{L("Beim Rechnen wendest du Grundrechenarten auf bekannte Zahlen an: Aus 7 · 8 machen wir 56. Das kennst du aus dem Kopfrechnen.", "When calculating, you apply basic operations to known numbers: 7 · 8 becomes 56. You know this from mental maths.")}</Absatz>
        <Absatz>{L("Bei Gleichungen ist es umgekehrt. Wir haben eine Information über eine Zahl – zum Beispiel: 7 mal diese Zahl ist 56. Und wir finden die Zahl: 8.", "With equations it is the other way round. We have information about a number – for example: 7 times this number is 56. And we find the number: 8.")}</Absatz>
        <Gegenueber />
        <Absatz style={{ marginTop: 14, marginBottom: 0 }}>{L("Die Information kann viel komplizierter sein. Aber die Frage bleibt immer dieselbe: Welche Zahl ist es? Der Film zeigt das über alle Schwierigkeitsgrade.", "The information can be much more complicated. But the question always stays the same: which number is it? The film shows this across all levels of difficulty.")}</Absatz>
      </Karte>

      <GleichungsFilm onEnde={() => { if (!G.film) gleichAendern((g) => { g.film = true; }); }} />

      <KetteErleben />
      <Waage />

      <Karte>
        <Kicker>{L("Sieben Stufen", "Seven levels")}</Kicker>
        <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, marginBottom: 10 }}>{L("Vom ersten Schritt bis zum Exponenten", "From the first step to the exponent")}</p>
        {STUFEN.map((s) => (
          <button key={s} type="button" onClick={() => onUeben(s)}
            style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 8, borderRadius: 14, border: `1.5px solid ${C.linie}`, background: C.weiss, fontFamily: "inherit", cursor: "pointer", color: C.tinte }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 999, background: `linear-gradient(155deg, ${C.see} 0%, ${NACHT} 100%)`, color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{STUFE_INFO[s].nr}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700 }}>{tx(STUFE_INFO[s].titel)}</span>
              <span style={{ display: "block", fontSize: 13.5, color: C.grau, marginTop: 2 }}><M t={STUFE_INFO[s].beispiel} /></span>
            </span>
            <span aria-hidden="true" style={{ color: C.see, fontWeight: 700 }}>›</span>
          </button>
        ))}
      </Karte>
      <Knopf onClick={() => onUeben("s1")} style={{ width: "100%", marginBottom: 8 }}>{L("Jetzt Schritt für Schritt rechnen", "Now solve step by step")}</Knopf>
    </div>
  );
}

/* ======================================================================
   AUTO und ÜBEN – dieselbe Aufgabe, zwei Modi
     Auto   die App rechnet vor: ganze Rechnung mit Umformungen, Probe
     Üben   Schritt für Schritt: je Umformung die richtige Karte wählen
   ====================================================================== */
/* Kopf der Aufgabenkarte: Stufe, Information, große Gleichung, Rechenkette zum Aufklappen */
function AufgabenKopf({ a, stufe, kette, setKette, fertig }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <Kicker>{L("Stufe", "Level")} {STUFE_INFO[stufe].nr} · {tx(STUFE_INFO[stufe].titel)}</Kicker>
      </div>
      <InfoKarte info={a.info} />
      <GleichungGross a={a} />
      {a.kette && (
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <button type="button" onClick={() => setKette(!kette)} aria-expanded={kette}
            style={{ background: "none", border: "none", color: C.see, fontWeight: 700, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", minHeight: 40, textDecoration: "underline" }}>
            {kette ? L("Rechenkette ausblenden", "Hide the chain") : L("Als Rechenkette ansehen", "Show as a chain")}
          </button>
        </div>
      )}
      {kette && a.kette && <div style={{ marginBottom: 12 }}><Rechenkette kette={a.kette} schritt={fertig ? a.kette.schritte.length : 0} ergebnis={a.loesungen[0]} /></div>}
    </>
  );
}

/* Lösung und Probe (grüner Block) – in Auto von Anfang an, in Üben nach dem letzten Schritt */
function Probe({ a, innerRef, children }) {
  return (
    <div ref={innerRef} data-gk-fertig style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "#EEF7F1", border: "1.5px solid #CBE6D5" }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.smaragd, marginBottom: 8 }}>
        ✓ {a.loesungen.length === 2 ? L("Zwei Zahlen passen:", "Two numbers fit:") : L("Gefunden:", "Found:")}{" "}
        <span style={{ color: C.tinte }}><M t={`\\mathbb{L} = \\{${a.loesungen.map((v) => String(v).replace("-", "−")).join("; ")}\\}`} /></span>
      </p>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.grau, marginBottom: 4 }}>{L("Probe", "Check")}</p>
      {a.probe.map((p, i) => {
        const v = (w) => String(w).replace("-", "−");
        const rechtsNurZahl = p.r === v(p.wr);
        return (
          <div key={i} style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 600 }}><M t={`x = ${v(p.x)}`} /></p>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 10, rowGap: 2, fontSize: 15.5, color: C.tinte, overflowX: "auto" }}>
              <span style={{ color: C.grau, fontSize: 13 }}>{L("links", "left")}</span><span style={{ whiteSpace: "nowrap" }}><M t={`${p.l} = ${v(p.wl)}`} /></span>
              <span style={{ color: C.grau, fontSize: 13 }}>{L("rechts", "right")}</span><span style={{ whiteSpace: "nowrap" }}><M t={rechtsNurZahl ? v(p.wr) : `${p.r} = ${v(p.wr)}`} /> <span style={{ color: C.smaragd, fontWeight: 700 }}>✓ {L("gleich", "equal")}</span></span>
            </div>
          </div>
        );
      })}
      {children}
    </div>
  );
}

const TIPP_BLATT = () => <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, padding: "0 4px" }}>{L("Tipp: Schreib jeden Schritt auch auf dein Blatt – ein Schritt pro Zeile, die Gleichheitszeichen untereinander, die Umformung rechts daneben.", "Tip: write every step on your paper too – one step per line, equals signs aligned, the operation on the right.")}</p>;

/* ---------- Auto: die App rechnet vor (kein Lernstand-Eintrag) ---------- */
function Auto({ stufe, setStufe, G }) {
  const [a, setA] = useState(() => neueAufgabe(stufe));
  const [kette, setKette] = useState(false);
  const neu = (s = stufe) => { setA(neueAufgabe(s)); setKette(false); };
  useEffect(() => { if (a.stufe !== stufe) neu(stufe); }, [stufe]);   // eslint-disable-line react-hooks/exhaustive-deps
  const status = Object.fromEntries(STUFEN.map((s) => [s, stufenStatus(G.stufen[s])]));
  const idx = STUFEN.indexOf(stufe);
  const schritte = a.zeilen.filter((z) => z.op);
  return (
    <div data-gk-auto-weg>
      <StufenChips wert={stufe} onWahl={setStufe} stufen={STUFEN} info={STUFE_INFO} status={status} />
      <Karte style={{ padding: 18 }}>
        <AufgabenKopf a={a} stufe={stufe} kette={kette} setKette={setKette} fertig />
        <div style={{ borderTop: `1px solid ${C.linie}`, marginTop: 8, paddingTop: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.hellgrau, marginBottom: 6 }}>{L("Die Rechnung", "The working")}</p>
          <Rechnung zeilen={a.zeilen} />
        </div>
        <ol style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 6 }} aria-label={L("Die Schritte", "The steps")}>
          {schritte.map((z, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "baseline", fontSize: 14.5, color: C.tinte, lineHeight: 1.5 }}>
              <span aria-hidden="true" style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 999, background: C.himmel, color: C.see, fontSize: 12, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
              <span>{tx(z.op.lang)}</span>
            </li>
          ))}
        </ol>
        <Probe a={a}>
          <div style={{ display: "grid", gridTemplateColumns: idx < STUFEN.length - 1 ? "1fr 1fr" : "1fr", gap: 10, marginTop: 12 }}>
            <Knopf onClick={() => neu()}>{L("Noch eine", "Another one")}</Knopf>
            {idx < STUFEN.length - 1 && <Knopf haupt={false} onClick={() => setStufe(STUFEN[idx + 1])}>{L("Nächste Stufe", "Next level")} ›</Knopf>}
          </div>
        </Probe>
      </Karte>
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, padding: "0 4px" }}>{L("Lies die Rechnung Zeile für Zeile mit: Rechts steht immer, was auf beiden Seiten passiert ist. Dann wechsle zu „Üben“ und wähle die Schritte selbst.", "Read the working line by line: on the right you always see what happened on both sides. Then switch to “Practise” and pick the steps yourself.")}</p>
    </div>
  );
}

/* ---------- Üben: Schritt für Schritt, je Umformung die richtige Karte (funcUebenWahl.jsx) ---------- */
function Ueben({ stufe, setStufe, G, onLernen }) {
  const en = englisch();
  const [a, setA] = useState(() => neueAufgabe(stufe));
  const [bis, setBis] = useState(0);                 // Index der letzten sichtbaren Zeile
  const [falschJe, setFalschJe] = useState({});      // je Üben-Schritt (nr − 1) die Schlüssel der falsch gewählten Karten
  const [fehlerZahl, setFehlerZahl] = useState(0);
  const [kette, setKette] = useState(false);
  const [gebucht, setGebucht] = useState(false);
  const fertigRef = useRef(null), wahlRef = useRef(null);
  const schritte = useMemo(() => uebenSchritte(a, { en }), [a, en]);
  const neu = (s = stufe) => { setA(neueAufgabe(s)); setBis(0); setFalschJe({}); setFehlerZahl(0); setKette(false); setGebucht(false); };
  useEffect(() => { if (a.stufe !== stufe) neu(stufe); }, [stufe]);   // eslint-disable-line react-hooks/exhaustive-deps

  const zeilen = a.zeilen;
  const loesungAb = zeilen.findIndex((z) => /^x(_\{\d\})?$/.test(z.l));
  const fertig = bis >= zeilen.length - 1;
  const aktuell = zeilen[bis];
  const schritt = fertig ? null : uebenSchrittZu(schritte, bis);
  const n = schritte.length;
  const anhieb = aufAnhieb(falschJe, n);
  const status = Object.fromEntries(STUFEN.map((s) => [s, stufenStatus(G.stufen[s])]));

  const weiter = () => {
    /* bei zwei Lösungen erscheinen beide Lösungszeilen gemeinsam */
    const ziel = bis + 1 === loesungAb && zeilen.length - loesungAb === 2 ? bis + 2 : bis + 1;
    setBis(ziel);
  };
  const waehle = (o) => {
    if (o.richtig) { weiter(); return; }
    if (!schritt) return;
    const k = schritt.nr - 1, schon = falschJe[k] || [];
    if (schon.includes(o.key)) return;
    setFalschJe({ ...falschJe, [k]: [...schon, o.key] }); setFehlerZahl((z) => z + 1);
    try { merken({ gruppe: gruppeName(stufe), richtig: false, fehlerart: `gleich_${o.art}` }); } catch (e) { /* optional */ }
  };
  useEffect(() => {
    if (!fertig || gebucht) return;
    setGebucht(true);
    gleichAendern((g) => { g.schritte += 1; buche(g, a.stufe, true, { hilfe: 1 }); });   // geführt gelöst: zählt, aber als „mit Hilfe“
    try { merken({ gruppe: gruppeName(a.stufe), richtig: fehlerZahl === 0 }); } catch (e) { /* optional */ }
    setTimeout(() => { try { fertigRef.current && springe("gleichkurs-fertig", () => fertigRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" })); } catch (e) { /* egal */ } }, 120);
  }, [fertig]);   // eslint-disable-line react-hooks/exhaustive-deps
  /* data-gk-option zusätzlich an den Karten (ältere Browser-Tests klicken darauf) */
  useEffect(() => { const w = wahlRef.current; if (w) w.querySelectorAll("[data-ueben-option]").forEach((b) => b.setAttribute("data-gk-option", "")); });

  const idx = STUFEN.indexOf(stufe);
  return (
    <div data-gk-ueben-weg>
      <style>{UEBEN_CSS}</style>
      <style>{GK_UEBEN_CSS}</style>
      <StufenChips wert={stufe} onWahl={setStufe} stufen={STUFEN} info={STUFE_INFO} status={status} />
      <Karte style={{ padding: 18 }}>
        <AufgabenKopf a={a} stufe={stufe} kette={kette} setKette={setKette} fertig={fertig} />

        <div style={{ borderTop: `1px solid ${C.linie}`, marginTop: 8, paddingTop: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.hellgrau, marginBottom: 6 }}>{L("Deine Rechnung", "Your working")}</p>
          <Rechnung zeilen={zeilen.slice(0, bis + 1)} neu={bis} opBis={bis - 1} ziel={!fertig} />
        </div>

        {!fertig && aktuell.op && (
          <div ref={wahlRef} style={{ marginTop: 14 }}>
            {aktuell.op.auto ? (
              <>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 10 }}>{L("Jetzt kannst du ablesen:", "Now you can read it off:")}</p>
                <span data-gk-auto><Knopf onClick={weiter} style={{ width: "100%" }}>{tx(aktuell.op.lang)} ›</Knopf></span>
              </>
            ) : schritt && (
              <div key={`${a.id}-${bis}`}>
                <UebenWahl schritt={schritt} nr={schritt.nr} gesamt={n} frage={schritt.frage} falsch={falschJe[schritt.nr - 1] || []} onWahl={waehle} inhalt={(o) => tx(o.lang)} />
              </div>
            )}
          </div>
        )}

        {fertig && (
          <div ref={fertigRef}>
            <Probe a={a}>
              <p style={{ fontSize: 13.5, color: C.grau, marginTop: 8 }}>{fehlerZahl === 0 ? L("Jeder Schritt saß beim ersten Versuch.", "Every step was right the first time.") : L(`${fehlerZahl} Fehlgriff${fehlerZahl === 1 ? "" : "e"} unterwegs – genau dafür ist dieses Werkzeug da.`, `${fehlerZahl} wrong pick${fehlerZahl === 1 ? "" : "s"} on the way – that is exactly what this tool is for.`)}</p>
            </Probe>
            <UebenFertig anhieb={anhieb} gesamt={n} onLernen={() => onLernen(a.stufe)} onNeu={() => neu()}
              lernenText={L("Jetzt selbst rechnen", "Now solve it yourself")} neuText={L("Noch eine", "Another one")}
              leise={L("Nächste Stufe: In „Lernen“ rechnest du eine Runde dieser Stufe selbst – du tippst nur das Ergebnis, der Weg gehört auf dein Blatt.", "Next level: in “Learn” you solve a round of this level yourself – you only type the result, the working goes on your paper.")}>
              {idx < STUFEN.length - 1 && (
                <button type="button" onClick={() => setStufe(STUFEN[idx + 1])} style={{ background: "none", border: "none", color: C.see, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", minHeight: 40 }}>
                  {L("Nächste Stufe", "Next level")} ›
                </button>
              )}
            </UebenFertig>
          </div>
        )}
        {!fertig && <button type="button" onClick={() => neu()} style={{ marginTop: 14, background: "none", border: "none", color: C.see, fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", minHeight: 40 }}>↻ {L("Andere Aufgabe", "Different problem")}</button>}
      </Karte>
      <TIPP_BLATT />
    </div>
  );
}

/* ======================================================================
   LERNEN (früher Training) – Übersicht und Runde
   ====================================================================== */
function StufenZeile({ s, eintrag, empfohlen, onStart }) {
  const namen = STATUS_NAME();
  const i = STUFE_INFO[s];
  return (
    <button type="button" onClick={onStart} aria-label={`${L("Stufe", "Level")} ${i.nr}: ${tx(i.titel)} – ${namen[eintrag.status]}`}
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 8, borderRadius: 16, fontFamily: "inherit", cursor: "pointer", background: C.weiss, border: `2px solid ${empfohlen ? GOLD : C.linie}`, color: C.tinte }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, background: `linear-gradient(155deg, ${C.see} 0%, ${NACHT} 100%)`, color: GOLD }}>{i.nr}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{tx(i.titel)}</span>
          {empfohlen && <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", background: GOLD, color: NACHT, borderRadius: 999, padding: "2px 8px" }}>{L("Nächster Schritt", "Next step")}</span>}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.grau, marginTop: 3 }}>
          <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 3, background: STATUS_FARBE[eintrag.status] }} />
          {namen[eintrag.status]}{eintrag.n ? ` · ${eintrag.ok}/${eintrag.n} ${L("richtig", "right")}` : ""}{eintrag.faellig ? ` · ${L("fällig", "due")}` : ""}
        </span>
      </span>
      <span aria-hidden="true" style={{ fontSize: 13, color: C.grau, whiteSpace: "nowrap" }}><M t={i.beispiel} /></span>
    </button>
  );
}

function TrainingUebersicht({ G, onStart, onVerstehen }) {
  const u = uebersicht(G);
  const rec = empfehlung(G);
  const fehler = haeufigeFehler(G);
  const namen = STATUS_NAME();
  const begonnen = u.liste.filter((x) => x.status !== "neu").length;
  return (
    <div>
      <Karte>
        <p style={{ fontSize: 14, color: C.grau, marginBottom: 8 }}><b style={{ color: C.tinte, fontSize: 22 }}>{u.sicher}</b> {L("von 7 Stufen sicher", "of 7 levels secure")}{begonnen ? ` · ${begonnen} ${L("begonnen", "started")}` : ""}</p>
        <div role="img" aria-label={u.liste.map((x) => `${STUFE_INFO[x.id].nr}: ${namen[x.status]}`).join(", ")} style={{ display: "flex", gap: 4 }}>
          {u.liste.map((x) => <span key={x.id} style={{ flex: 1, height: 10, borderRadius: 4, background: STATUS_FARBE[x.status] }} />)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 10 }}>
          {["sicher", "aufbau", "unsicher", "neu"].map((s) => <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.grau }}><span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 3, background: STATUS_FARBE[s] }} />{namen[s]} <b style={{ color: C.tinte }}>{u.zaehler[s] || 0}</b></span>)}
        </div>
        <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 10, lineHeight: 1.5 }}>{L("„Sicher“ heißt: mehrfach ohne Hilfe richtig, verteilt auf mindestens zwei Tage. In „Üben“ geführt gelöste Aufgaben zählen als „mit Hilfe“.", "“Secure” means right several times without help, across at least two days. Problems solved with guidance in “Practise” count as “with help”.")}</p>
      </Karte>

      {rec.art === "verstehen" && (
        <Karte style={{ border: `2px solid ${GOLD}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>{L("Starte mit dem Verstehen", "Start with understanding")}</p>
          <p style={{ fontSize: 14, color: C.grau, marginBottom: 12, lineHeight: 1.55 }}>{L("Der kurze Film zeigt dir in zwei Minuten, worum es bei allen Gleichungen geht.", "The short film shows you in two minutes what all equations are about.")}</p>
          <Knopf onClick={onVerstehen} style={{ width: "100%" }}>{L("Zum Film", "To the film")}</Knopf>
        </Karte>
      )}
      {u.faellig > 0 && (
        <Karte style={{ border: `2px solid ${GOLD}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>{L("Heute zum Wiederholen", "For review today")}</p>
          <p style={{ fontSize: 14, color: C.grau, marginBottom: 12 }}>{L(`${u.faellig} Stufe${u.faellig === 1 ? " ist" : "n sind"} fällig oder unsicher.`, `${u.faellig} level${u.faellig === 1 ? " is" : "s are"} due or shaky.`)}</p>
          <Knopf onClick={() => onStart({ art: "wiederholen" })} style={{ width: "100%" }}>{L("Gezielt wiederholen", "Review now")}</Knopf>
        </Karte>
      )}

      <Kicker>{L("Dein Lernpfad", "Your learning path")}</Kicker>
      <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.55, marginBottom: 10 }}>{L("Sechs Aufgaben je Runde. Du tippst nur das Ergebnis – den Weg machst du auf deinem Blatt. Die Reihenfolge ist ein Vorschlag.", "Six problems per round. You only type the result – do the working on your paper. The order is a suggestion.")}</p>
      {u.liste.map((x) => <StufenZeile key={x.id} s={x.id} eintrag={x} empfohlen={rec.art === "stufe" && rec.stufe === x.id} onStart={() => onStart({ art: "stufe", stufe: x.id })} />)}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "6px 0 18px" }}>
        <Knopf onClick={() => onStart({ art: "gemischt" })}>{L("Gemischte Runde", "Mixed round")}</Knopf>
        <Knopf haupt={false} disabled={!u.faellig && !u.liste.some((x) => x.status === "unsicher")} onClick={() => onStart({ art: "wiederholen" })}>{L("Wiederholen", "Review")}</Knopf>
      </div>

      {fehler.length > 0 && (
        <Karte>
          <Kicker>{L("Woran es hakt", "Where it gets stuck")}</Kicker>
          {fehler.slice(0, 3).map((f) => (
            <p key={f.art} style={{ fontSize: 14, color: C.tinte, lineHeight: 1.55, marginBottom: 8 }}>
              <b>{fehlerName(f.art, englisch())}</b> <span style={{ color: C.hellgrau }}>· {f.n}×</span>
              <span style={{ display: "block", fontSize: 13, color: C.grau }}>{fehlerTipp(f.art, englisch())}</span>
            </p>
          ))}
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55 }}>{L("Ein Muster beschreibt nur, was in einzelnen Antworten passiert ist – keine Diagnose.", "A pattern only describes what happened in single answers – not a diagnosis.")}</p>
        </Karte>
      )}
    </div>
  );
}

function Runde({ aufgaben, titel, onZurueck, onNochmal }) {
  const [queue, setQueue] = useState(aufgaben);
  const [idx, setIdx] = useState(0);
  const [eingaben, setEingaben] = useState(["", ""]);
  const [feld, setFeld] = useState(0);
  const [rueck, setRueck] = useState(null);             // null | { ok, fehler }
  const [tipp, setTipp] = useState(0);
  const [weg, setWeg] = useState(false);
  const [ergebnisse, setErgebnisse] = useState([]);
  const [fertig, setFertig] = useState(false);
  const timer = useRef(null);
  const vorher = useRef(null);
  const G = useGleich();
  if (vorher.current === null) vorher.current = Object.fromEntries(STUFEN.map((s) => [s, stufenStatus(G.stufen[s])]));
  useEffect(() => () => clearTimeout(timer.current), []);
  const a = queue[idx];
  const zwei = a && a.loesungen.length === 2;
  useEffect(() => { try { window.__gkAufgabe = a; } catch (e) { /* nur für automatische Prüfungen */ } }, [a]);

  const weiter = () => {
    clearTimeout(timer.current);
    if (idx + 1 >= queue.length) {
      gleichAendern((g) => { g.runden += 1; });
      setFertig(true); return;
    }
    setIdx(idx + 1); setEingaben(["", ""]); setFeld(0); setRueck(null); setTipp(0); setWeg(false);
  };
  const pruefen = () => {
    if (rueck || !a) return;
    const antworten = zwei ? eingaben : [eingaben[0]];
    const w = wertung(a, antworten);
    if (w.leer) return;
    const hilfe = a.retry ? 2 : tipp;
    gleichAendern((g) => buche(g, a.stufe, w.ok, { hilfe, fehler: w.fehler ? w.fehler.art : null }));
    try { merken({ gruppe: gruppeName(a.stufe), richtig: w.ok, fehlerart: w.ok ? null : `gleich_${w.fehler ? w.fehler.art : "rechnen"}` }); } catch (e) { /* optional */ }
    setErgebnisse([...ergebnisse, { a, ok: w.ok, retry: !!a.retry, fehler: w.fehler, antwort: antworten.filter(Boolean).join("; ") }]);
    setRueck(w);
    if (w.ok) timer.current = setTimeout(weiter, 1300);
    else if (!a.retry) setQueue((q) => { const k = [...q]; k.splice(Math.min(idx + 3, k.length), 0, { ...neueAufgabe(a.stufe), retry: true }); return k; });
  };
  const tippe = (z) => { if (rueck) return; setEingaben((e) => e.map((v, i) => (i === feld ? eingeben(v, z) : v))); };
  const loesche = () => { if (rueck) return; setEingaben((e) => e.map((v, i) => (i === feld ? v.slice(0, -1) : v))); };
  const ok = () => {
    if (rueck) { if (!rueck.ok) weiter(); return; }
    if (zwei && feld === 0 && !eingaben[1]) { setFeld(1); return; }
    pruefen();
  };
  const okRef = useRef(ok); okRef.current = ok;
  const tippeRef = useRef(tippe); tippeRef.current = tippe;
  const loescheRef = useRef(loesche); loescheRef.current = loesche;
  useEffect(() => {
    if (fertig) return undefined;
    const h = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) { tippeRef.current(e.key); e.preventDefault(); }
      else if (e.key === "-" || e.key === "−") { tippeRef.current("−"); e.preventDefault(); }
      else if (e.key === "Backspace") { loescheRef.current(); e.preventDefault(); }
      else if (e.key === "Enter") { okRef.current(); e.preventDefault(); }
      else if (e.key === "Tab" && zwei && !rueck) { setFeld((f) => 1 - f); e.preventDefault(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fertig, zwei, rueck]);

  if (fertig) {
    const erst = ergebnisse.filter((e) => !e.retry);
    const richtig = erst.filter((e) => e.ok).length;
    const G2 = G;
    const wechsel = STUFEN.filter((s) => stufenStatus(G2.stufen[s]) !== vorher.current[s]);
    const namen = STATUS_NAME();
    return (
      <div>
        <Zurueck onClick={onZurueck}>{L("Lernen", "Learn")}</Zurueck>
        <Karte style={{ padding: 22, textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 6 }}>{titel}</p>
          <p style={{ fontSize: 40, fontWeight: 800, color: C.tinte, lineHeight: 1.1 }}>{richtig} / {erst.length}</p>
          <p style={{ fontSize: 14.5, color: C.grau, marginTop: 6 }}>{richtig === erst.length ? L("Alles gefunden. Stark.", "Everything found. Strong.") : richtig >= erst.length / 2 ? L("Gute Runde. Die Fehler kommen in der Wiederholung noch einmal.", "Good round. The mistakes will come back in review.") : L("Das war eine Lernrunde. Schau dir die Stufe noch einmal in „Üben“ an.", "That was a learning round. Have another look at the level in “Practise”.")}</p>
          {wechsel.length > 0 && (
            <div style={{ marginTop: 14, textAlign: "left" }}>
              {wechsel.map((s) => <p key={s} style={{ fontSize: 14, color: C.tinte, marginBottom: 4 }}>{L("Stufe", "Level")} {STUFE_INFO[s].nr}: {namen[vorher.current[s]]} → <b style={{ color: STATUS_FARBE[stufenStatus(G2.stufen[s])] === C.smaragd ? C.smaragd : C.tinte }}>{namen[stufenStatus(G2.stufen[s])]}</b></p>)}
            </div>
          )}
        </Karte>
        {ergebnisse.some((e) => !e.ok) && (
          <Karte>
            <Kicker>{L("Noch einmal ansehen", "Look again")}</Kicker>
            {ergebnisse.filter((e) => !e.ok).map((e, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${C.linie}` }}>
                <p style={{ fontSize: 15.5 }}><M t={glText(e.a)} /> <span style={{ color: C.grau, fontSize: 13 }}>· {L("deine Antwort", "your answer")} {e.antwort.replace(/-/g, "−")}</span></p>
                {e.fehler && <p style={{ fontSize: 13, color: C.signal, marginTop: 2 }}>{fehlerName(e.fehler.art, englisch())}</p>}
              </div>
            ))}
          </Karte>
        )}
        <div style={{ display: "grid", gap: 10 }}>
          <Knopf onClick={onNochmal}>{L("Noch eine Runde", "Another round")}</Knopf>
          <Knopf haupt={false} onClick={onZurueck}>{L("Zur Übersicht", "To the overview")}</Knopf>
        </div>
      </div>
    );
  }

  const erstesOp = a.zeilen.find((z) => z.op);
  const zeigeWeg = weg || (rueck && !rueck.ok);
  const feldStil = (i) => ({
    flex: 1, minWidth: 0, minHeight: 58, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 26, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
    border: `2px solid ${rueck ? (rueck.ok ? C.smaragd : C.signal) : feld === i ? C.see : C.linie}`, background: rueck ? (rueck.ok ? "#EEF7F1" : "#FBEFEA") : C.weiss, color: C.tinte,
  });
  return (
    <div>
      <Zurueck onClick={onZurueck}>{L("Lernen", "Learn")} · {titel}</Zurueck>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }} aria-label={`${L("Aufgabe", "Problem")} ${idx + 1} / ${queue.length}`}>
        {queue.map((q, i) => <span key={q.id} style={{ flex: 1, height: 5, borderRadius: 3, background: i < idx ? C.see : i === idx ? GOLD : C.linie }} />)}
      </div>
      <Karte style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <Kicker>{L("Stufe", "Level")} {STUFE_INFO[a.stufe].nr} · {tx(STUFE_INFO[a.stufe].titel)}</Kicker>
          {a.retry && <span style={{ fontSize: 12, color: C.signal, fontWeight: 700 }}>{L("Zweiter Anlauf", "Second try")}</span>}
        </div>
        <InfoKarte info={a.info} />
        <GleichungGross a={a} />
        <div style={{ display: "flex", gap: 10, margin: "12px 0 6px" }}>
          {(zwei ? [0, 1] : [0]).map((i) => (
            <button key={i} type="button" onClick={() => !rueck && setFeld(i)} aria-label={zwei ? `x${i + 1}` : "x"} style={feldStil(i)}>
              <span style={{ fontSize: 18, color: C.grau, fontWeight: 600 }}><M t={zwei ? `x_{${i + 1}} =` : "x ="} /></span>
              <span>{eingaben[i] || <span style={{ color: C.linie }}>?</span>}</span>
            </button>
          ))}
        </div>
        <div aria-live="polite" style={{ minHeight: 24 }}>
          {rueck && rueck.ok && <p style={{ fontSize: 15, color: C.smaragd, fontWeight: 700 }}>✓ {L("Richtig", "Correct")} – <M t={`\\mathbb{L} = \\{${a.loesungen.map((v) => String(v).replace("-", "−")).join("; ")}\\}`} /></p>}
          {rueck && !rueck.ok && (
            <div>
              <p style={{ fontSize: 15, color: C.signal, fontWeight: 700 }}>{rueck.fehler ? fehlerName(rueck.fehler.art, englisch()) : L("Noch nicht", "Not yet")}</p>
              {rueck.fehler && <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.55 }}>{fehlerTipp(rueck.fehler.art, englisch())}</p>}
            </div>
          )}
          {!rueck && tipp > 0 && erstesOp && <p style={{ fontSize: 14, color: C.tinte }}><b style={{ color: C.gruenDunkel }}>{L("Tipp:", "Hint:")}</b> {L("Erster Schritt", "First step")} – {tx(erstesOp.op.lang)}.</p>}
        </div>
        {zeigeWeg && <div style={{ margin: "10px 0", padding: 12, borderRadius: 14, background: C.himmel }}><Rechnung zeilen={a.zeilen} /></div>}
        {rueck && !rueck.ok
          ? <Knopf onClick={weiter} style={{ width: "100%", marginTop: 8 }}>{L("Weiter", "Next")}</Knopf>
          : <div style={{ marginTop: 8 }}><GleichTastatur onZeichen={tippe} onLoeschen={loesche} onOk={ok} gesperrt={!!rueck} /></div>}
        {!rueck && (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setTipp(1)} disabled={tipp > 0} style={{ background: "none", border: "none", color: tipp ? C.hellgrau : C.see, fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: tipp ? "default" : "pointer", minHeight: 44 }}>💡 {L("Tipp", "Hint")}</button>
            <MathildaModusKnopf kompakt />
            <button type="button" onClick={() => { setWeg(true); setTipp(2); }} disabled={weg} style={{ background: "none", border: "none", color: weg ? C.hellgrau : C.see, fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: weg ? "default" : "pointer", minHeight: 44 }}>{L("Lösungsweg zeigen", "Show working")}</button>
          </div>
        )}
      </Karte>
    </div>
  );
}

/* ======================================================================
   SEITE
   ====================================================================== */
export function GleichungenSeite({ gehe, start = null, onSeite = null }) {
  const G = useGleich();
  const anfang = reiterNeu(start) || (G.film || Object.keys(G.stufen).length ? "lernen" : "verstehen");
  const [reiter, setReiter] = useState(anfang);
  const [stufe, setStufe] = useState("s1");
  const [runde, setRunde] = useState(null);           // { aufgaben, cfg, titel, nr }
  const oben = (id = "gleichkurs-runde") => springe(id, () => window.scrollTo(0, 0));
  const wechsle = (r, id = "gleichkurs-reiter") => { setReiter(r); setRunde(null); oben(id); if (onSeite) onSeite(r); };
  /* Direktlink innerhalb der App (/gleichungen-lernen/ueben, alte Links …/rechnen, …/training) wechselt den Reiter */
  useEffect(() => { const r = reiterNeu(start); if (r && r !== reiter) { setReiter(r); setRunde(null); } }, [start]);   // eslint-disable-line react-hooks/exhaustive-deps
  const zuUeben = (s) => { setStufe(s); wechsle("ueben", "gleichkurs-runde"); };

  const starte = (cfg) => {
    const aufgaben = baueRunde(G, cfg);
    if (!aufgaben.length) return;
    const titel = cfg.art === "stufe" ? `${L("Stufe", "Level")} ${STUFE_INFO[cfg.stufe].nr}` : cfg.art === "gemischt" ? L("Gemischt", "Mixed") : L("Wiederholen", "Review");
    setRunde((r) => ({ aufgaben, cfg, titel, nr: (r ? r.nr : 0) + 1 }));
    oben();
  };
  /* Nach dem Üben „Jetzt selbst rechnen“: nach Lernen wechseln und gleich eine Runde dieser Stufe starten */
  const zuLernen = (s) => { setReiter("lernen"); if (onSeite) onSeite("lernen"); starte({ art: "stufe", stufe: s }); };

  const reiterOptionen = [
    ["verstehen", L("Verstehen", "Understand"), 1],
    ...UEBEN_MODI.map((m, i) => [m.id, L(m.name, m.en), i + 2]),
  ];
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 640, paddingTop: 18 }}>
      {!runde && (
        <>
          <Reiter wert={reiter} onWahl={wechsle} optionen={reiterOptionen} titel={(id) => (id === "verstehen" ? undefined : L(modusVon(id).text, modusVon(id).textEn))} />
          <p data-gk-modus-text style={{ fontSize: 13, color: C.grau, lineHeight: 1.5, margin: "-10px 6px 16px" }}>{modusText(reiter)}</p>
        </>
      )}
      {runde ? (
        <Runde key={runde.nr} aufgaben={runde.aufgaben} titel={runde.titel} onZurueck={() => { setRunde(null); setReiter("lernen"); oben(); }} onNochmal={() => starte(runde.cfg)} />
      ) : reiter === "verstehen" ? (
        <Verstehen G={G} onUeben={zuUeben} />
      ) : reiter === "auto" ? (
        <Auto stufe={stufe} setStufe={setStufe} G={G} />
      ) : reiter === "ueben" ? (
        <Ueben stufe={stufe} setStufe={setStufe} G={G} onLernen={zuLernen} />
      ) : (
        <TrainingUebersicht G={G} onStart={starte} onVerstehen={() => wechsle("verstehen")} />
      )}
      {!runde && (
        <section style={{ ...karte, padding: 18, marginTop: 22 }}>
          <Kicker>{L("Passt dazu", "Goes well with")}</Kicker>
          <div style={{ display: "grid", gap: 10 }}>
            <Knopf haupt={false} onClick={() => gehe && gehe({ ansicht: "gleichungen" })}>{L("Gleichungslöser: eigene Gleichungen umformen", "Equation solver: transform your own equations")}</Knopf>
            <Knopf haupt={false} onClick={() => gehe && gehe({ ansicht: "headnumbers" })}>{L("Kopfrechnen: die Rechnungen, die du hier rückwärts gehst", "Mental maths: the operations you reverse here")}</Knopf>
          </div>
        </section>
      )}
    </div>
  );
}
