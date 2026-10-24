/* ============================================================
   Ableitungstrainer (seit 22.10. = die frühere Regelwerkstatt).
   Regeln: Produkt-, Quotienten-, Reziproken-, lineare Kettenregel,
   Kettenregel, Alle Regeln (RegelWerkstatt aus funcRegelwerk.jsx).
   Dazu „Eigene Funktion“: f eingeben, f′, f″, f‴ selbst ableiten;
   ist f′ geschafft, öffnet sich automatisch f″, dann f‴.
   Drei Modi (seit 22.10.): Auto (die App rechnet vor) · Üben (je Ableitung
   die richtige Zeile aus 2–4 goldenen Karten wählen, regelwerkUeben.js) ·
   Lernen (selbst eintippen, früher „Trainieren“) – Namen aus uebenKern.js.

   Die Prüfung vergleicht die Eingabe numerisch mit der symbolisch
   gebildeten Ableitung — jede gleichwertige Schreibweise zählt.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { buchen } from "./buchung.jsx";
import { uebenWunschHolen } from "./uebenWunsch.js";
import { uebergabeErledigt, uebergabeLesen } from "./uebergabe.js";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import {
  LiveFormel, Tastenfeld, ableitung, alsTex, hatBox, kompiliere, ohnePar, parse,
} from "./func12.jsx";
import { IchHaengeFest, ableitRegeln, aussenTex, summanden } from "./funcHilfe.jsx";
import { Eingabe, EingabePopup, ModusSchalter, ModusText, POP_CSS, PopupWahl, REGEL_CHIPS, RegelWerkstatt } from "./funcRegelwerk.jsx";
import { aufAnhieb } from "./uebenKern.js";
import { UEBEN_CSS, UebenFertig, UebenWahl } from "./funcUebenWahl.jsx";
import { uebenWegEigen } from "./regelwerkUeben.js";

import { EinstellungsPille } from "./ui3.jsx";
import { DESKTOP, useMedien } from "./arbeitsflaeche.jsx";
/* Kontext für „Ich hänge fest“: Hinweise aus dem Term, der gerade abgeleitet wird */
const NAME_F = ["f", "f′", "f″", "f‴"];
function ableitHilfe(kette, aktiv) {
  if (!kette || !kette[aktiv]) return null;
  const baum = kette[aktiv].baum, tex = alsTex(baum), fn = kette[aktiv].fn;
  const wer = NAME_F[aktiv], ziel = NAME_F[aktiv + 1];
  const { regeln, haupt } = ableitRegeln(baum);
  const teile = summanden(baum);
  let schritt;
  if (haupt && haupt.regel === "Produktregel") schritt = `Produktregel mit $u = ${alsTex(haupt.u)}$ und $v = ${alsTex(haupt.v)}$: Bilde zuerst $u′$ und $v′$, dann $u′ \\cdot v + u \\cdot v′$.`;
  else if (haupt && haupt.regel === "Quotientenregel") schritt = `Quotientenregel mit Zähler $u = ${alsTex(haupt.u)}$ und Nenner $v = ${alsTex(haupt.v)}$: $\\frac{u′ v - u v′}{v^{2}}$.`;
  else if (haupt && haupt.regel === "Kettenregel") schritt = `Kettenregel: innere Funktion $${alsTex(haupt.innen)}$, äußere Funktion $${aussenTex(haupt.ganz, haupt.innen)}$. Leite außen ab, lass die innere Funktion stehen und multipliziere mit der inneren Ableitung $(${alsTex(haupt.innen)})′$.`;
  else if (haupt && haupt.regel === "Umschreiben") schritt = `Schreib $${alsTex(haupt.term)}$ als Potenz mit negativem Exponenten – dann reicht die Potenzregel.`;
  else if (haupt && haupt.regel === "eForm") schritt = "Variable in Basis und Exponent: schreibe den Term als e-Funktion, zum Beispiel $x^{x} = e^{x \\cdot \\ln(x)}$, und nutze dann die Kettenregel.";
  else if (teile.length > 1) schritt = `Leite Summand für Summand ab. Beginne mit dem ersten: $(${alsTex(teile[0])})′ = ${alsTex(ableitung(teile[0]))}$.`;
  else schritt = `Grundableitung: $(${tex})′$ steht direkt in der Formelsammlung (${regeln.filter((r) => r !== "Konstante").join(", ") || "Konstante"}).`;
  const x0 = [1, 1.29, 0.5, 2].find((x) => Number.isFinite(fn(x)) && Number.isFinite(fn(x + 1e-4)));
  const steigung = x0 !== undefined ? (fn(x0 + 1e-5) - fn(x0 - 1e-5)) / 2e-5 : null;
  const dz = (v) => String(Math.round(v * 1000) / 1000).replace(".", ",").replace("-", "−");
  const brueche = /\\frac|\./.test(tex);
  return {
    id: `abl-${tex}-${aktiv}`,
    aufgabe: `Ableitung ${regeln.join(" ")} ${tex.includes("ln") ? "ln Definitionsmenge" : ""}`,
    hilfen: {
      verstehen: [
        `Gesucht ist ${ziel}(x). Abgeleitet wird also ${wer}(x) = $${tex}$ – die Zeile darüber.`,
        "Die Ableitung gibt zu jedem x die Steigung des Graphen an. Summen leitest du Summand für Summand ab, konstante Faktoren bleiben stehen.",
        `Schreib „${ziel}(x) =“ und arbeite dann die Bausteine von $${tex}$ einzeln ab.`,
      ],
      ansatz: [
        "Ist der Term eine Summe, ein Produkt, ein Quotient oder eine Verkettung (Funktion in einer Funktion)?",
        `Hier brauchst du: ${regeln.filter((r) => r !== "Konstante" || regeln.length === 1).join(", ")}.`,
        schritt,
      ],
      regel: [
        "Welche Grundableitungen kennst du für die Bausteine – xⁿ, eˣ, sin x, cos x, ln x?",
        `Die Regeln für diesen Term: ${regeln.filter((r) => r !== "Konstante" || regeln.length === 1).join(", ")}. Unten unter „Passende Regel ansehen“ stehen sie mit Beispiel.`,
        schritt,
      ],
      umformen: [
        "Lässt sich der Term vorher vereinfachen? Brüche und Wurzeln als Potenz geschrieben sparen oft eine Regel.",
        "$\\frac{1}{x^{n}} = x^{-n}$ und $\\sqrt{x} = x^{\\frac{1}{2}}$. Ausmultiplizieren kann die Produktregel ersparen.",
        "Dein Ergebnis musst du nicht vereinfachen – jede gleichwertige Schreibweise wird als richtig erkannt.",
      ],
      pruefen: [
        `Passt das Vorzeichen deiner Ableitung zum Verlauf von ${wer}: Wo ${wer} steigt, muss ${ziel} positiv sein.`,
        "Typische Fehler: (u·v)′ ≠ u′·v′, bei der Kettenregel die innere Ableitung vergessen, (cos x)′ = −sin x.",
        steigung !== null ? `Probe mit einer Zahl: Die Steigung von ${wer} bei x = ${dz(x0)} ist ungefähr ${dz(steigung)}. Setz x = ${dz(x0)} in deine Ableitung ein – es muss derselbe Wert herauskommen.` : "Setz eine Zahl in deine Ableitung ein und vergleiche mit der Steigung im Schaubild.",
      ],
    },
    regeln: regeln.filter((r) => r !== "Konstante" || regeln.length === 1).map((name) => ({ name, bereich: "analysis" })),
    grundlage: brueche ? { trainer: "bruchrechnen", name: "Brüche", grund: "Im Term stehen Brüche. Ein paar schnelle Runden Bruchrechnen helfen beim Zusammenfassen." } : null,
    loesung: `$${ziel}(x) = ${alsTex(kette[aktiv + 1].baum)}$`,
  };
}

const STRICHE = ["", "′", "″", "‴"];
const endlich = (y) => typeof y === "number" && isFinite(y);

/* Prüfstellen: verteilt, bewusst „krumm“, damit Zufallstreffer ausgeschlossen sind. */
export const STELLEN = [-2.73, -1.91, -1.17, -0.61, -0.29, 0.37, 0.83, 1.29, 1.77, 2.41, 3.13, 4.07];

export function vergleich(g, soll) {
  let gleich = 0, anders = 0;
  STELLEN.forEach((x) => {
    const s = soll(x), m = g(x);
    if (!endlich(s)) return;
    if (!endlich(m)) { anders++; return; }
    if (Math.abs(m - s) <= 1e-6 * (1 + Math.abs(s))) gleich++; else anders++;
  });
  return { gleich, anders, ok: anders === 0 && gleich >= 4 };
}

/* Kurzer, hilfreicher Hinweis bei falscher Eingabe. */
function diagnose(g, soll, vorher, stufe) {
  const tests = [
    [vorher, stufe === 1 ? "Das ist f selbst — du hast noch nicht abgeleitet." : `Das ist noch f${STRICHE[stufe - 1]} — du hast diese Zeile nicht weiter abgeleitet.`],
    [(x) => -soll(x), "Fast! Alle Vorzeichen sind gedreht — prüfe, wo ein Minus verloren gegangen ist."],
  ];
  for (const [h, text] of tests) if (h && vergleich(g, h).ok) return text;
  const werte = STELLEN.map((x) => ({ m: g(x), s: soll(x) })).filter((w) => endlich(w.m) && endlich(w.s));
  if (werte.length >= 4) {
    const diff = werte.map((w) => w.m - w.s);
    if (Math.max(...diff) - Math.min(...diff) < 1e-6 && Math.abs(diff[0]) > 1e-6)
      return "Du liegst überall um denselben Wert daneben — meist ein stehen gebliebener konstanter Summand.";
    const q = werte.filter((w) => Math.abs(w.s) > 1e-9).map((w) => w.m / w.s);
    if (q.length >= 4 && Math.max(...q) - Math.min(...q) < 1e-6 && Math.abs(q[0] - 1) > 1e-6)
      return `Die Form stimmt, aber ein konstanter Faktor ist falsch (Faktor ${Math.round(q[0] * 100) / 100}).`;
  }
  const x0 = 1.29, mv = g(x0), sv = soll(x0);
  if (endlich(mv) && endlich(sv))
    return `Noch nicht richtig: bei x = 1,29 liefert dein Term ${String(Math.round(mv * 1000) / 1000).replace(".", ",")}, richtig wäre ${String(Math.round(sv * 1000) / 1000).replace(".", ",")}.`;
  return "Noch nicht richtig. Geh die Ableitungsregeln Schritt für Schritt durch.";
}

/* Eine Ableitungszeile: Label, Formelanzeige, Status. */
function Zeile({ stufe, aktiv, eintrag, onKlick, pos, setPos, tex, ziel }) {
  const farbe = eintrag.status === "richtig" ? C.smaragd : eintrag.status === "falsch" ? C.signal : aktiv ? C.see : C.linie;
  return (
    <div onClick={onKlick} className={ziel ? "uw-ziel" : undefined} data-ueben-ziel={ziel || undefined} data-abl-zeile={stufe}
      style={{ border: `2px solid ${farbe}`, borderRadius: 16, padding: "10px 16px", marginBottom: 12, minHeight: 66,
        background: eintrag.status === "richtig" ? "#EEF8F2" : C.weiss,
        display: "flex", alignItems: "center", gap: 10, overflowX: "auto", cursor: onKlick ? "pointer" : "default",
        boxShadow: aktiv ? "0 4px 16px rgba(0,77,152,0.12)" : "none", transition: "box-shadow .2s, border-color .2s" }}>
      <span style={{ fontSize: 20, fontWeight: 700, color: C.tinte, whiteSpace: "nowrap" }}>f{STRICHE[stufe]}(x) =</span>
      <span style={{ flex: 1, fontSize: 22, lineHeight: 1.9, whiteSpace: "nowrap" }}>
        {tex ? <M t={tex} />
          : ziel ? <span className="uw-platz" style={{ fontSize: 18 }}>?</span>
          : setPos ? <LiveFormel text={eintrag.text || ""} pos={pos} setPos={setPos} hinweis={<span style={{ color: C.hellgrau, fontSize: 15, fontWeight: 300 }}>hier eingeben …</span>} />
          : eintrag.text ? <LiveFormel text={eintrag.text} />
            : <span style={{ color: C.hellgrau, fontSize: 15, fontWeight: 300 }}>{aktiv ? "hier eingeben …" : ""}</span>}
      </span>
      {eintrag.status === "richtig" && <span style={{ fontSize: 24, color: C.smaragd, fontWeight: 700 }}>✓</span>}
      {eintrag.status === "falsch" && <span style={{ fontSize: 24, color: C.signal, fontWeight: 700 }}>✗</span>}
      {eintrag.status === "gezeigt" && <span style={{ fontSize: 12, color: C.grau, fontWeight: 600 }}>Lösung</span>}
    </div>
  );
}

const leer = () => ({ text: "", status: null, hinweis: "", versuche: 0 });

export function Ableitungstrainer() {
  const desk = useMedien(DESKTOP);   // ab 840 px: Einstellungen als Spalte; darunter Einstellungs-Pille („Aufgabe zuerst“)
  // Übergabe aus einem anderen Werkzeug (z. B. Kurvendiskussion, Steckbrief): diese Funktion selbst ableiten → „Eigene Funktion“
  const [mit] = useState(() => { const u = uebergabeLesen("ableitungstrainer"); return u && u.text && parse(u.text) ? u.text : null; });
  React.useEffect(() => { uebergabeErledigt("ableitungstrainer"); }, []);
  // Wunsch der Heute-Karte (uebenWunsch.js): gleich mit einer Regel starten, z. B. Produktregel
  const [startRegel] = useState(() => {
    if (mit) return "eigen";
    const w = uebenWunschHolen("ableitungstrainer");
    return (w && REGEL_CHIPS.some(([id]) => id === w.art)) ? w.art : "produkt";
  });
  // Seit 22.10.: der Ableitungstrainer IST die Regelwerkstatt. Dazu kommt nur „Eigene Funktion“ (f′, f″, f‴ selbst ableiten).
  const [regel, setRegel] = useState(startRegel);   // produkt | quotient | reziprok | linkette | kette | gold | eigen
  const eigen = regel === "eigen";
  const [stufe, setStufe] = useState(1);
  const [modus, setModus] = useState("lernen");   // auto | ueben | lernen; Standard Lernen (selbst eintippen), Auto zeigt die Musterlösung
  const [wurf, setWurf] = useState(0);
  // Üben (Eigene Funktion): Runde, offener Schritt, falsch gewählte Karten je Schritt
  const [uebenRunde, setUebenRunde] = useState(0);
  const [uebenStand, setUebenStand] = useState(0);
  const [uebenFalsch, setUebenFalsch] = useState({});
  const uebenNeu = () => { setUebenRunde((r) => r + 1); setUebenStand(0); setUebenFalsch({}); };

  // Eigene Funktion
  const [fText, setFText] = useState(mit || "");
  const [eigenText, setEigenText] = useState(mit || "");
  const [eigenPos, setEigenPos] = useState(mit ? mit.length : 0);
  const [eigenOffen, setEigenOffen] = useState(!mit);
  const [zeilen, setZeilen] = useState([leer()]);
  const [aktiv, setAktiv] = useState(0);
  const [pos, setPos] = useState(0);
  const [offen, setOffen] = useState(false);          // Eingabe-Pop-up: öffnet erst beim Antippen des Feldes
  const [bilanz, setBilanz] = useState({ richtig: 0, gesamt: 0 });

  const fBaum = useMemo(() => {
    const b = parse(fText);
    return b && !hatBox(b) ? ohnePar(b) : null;
  }, [fText]);
  // Symbolische Ableitungen 0 bis 3
  const kette = useMemo(() => {
    if (!fBaum) return null;
    const l = [fBaum];
    for (let i = 1; i <= 3; i++) l.push(ableitung(l[i - 1]));
    return l.map((b) => ({ baum: b, fn: kompiliere(b) }));
  }, [fBaum]);

  // Auswahlfelder (Modus, Stufe, Würfel, Regel) lassen die Seitenposition, wie sie ist.
  const festhalten = (fn) => {
    const y = window.scrollY;
    fn();
    const zurueck = () => window.scrollTo(0, y);   // sprung-frei: hält die Position fest
    requestAnimationFrame(() => { zurueck(); requestAnimationFrame(zurueck); });
    setTimeout(zurueck, 80);
  };

  const neustart = (text) => { setFText(text); setZeilen([leer()]); setAktiv(0); setPos(0); setOffen(false); uebenNeu(); };
  const waehleModus = (m) => { setModus(m); setZeilen([leer()]); setAktiv(0); setPos(0); setOffen(false); uebenNeu(); };

  /* ---------- Üben: f′, f″, f‴ je aus 2–4 Karten wählen (regelwerkUeben.js) ---------- */
  const uebenSchritte = useMemo(() => (kette && modus === "ueben" ? uebenWegEigen(kette.map((k) => k.baum)) : []), [kette, modus, uebenRunde]);
  const nUeben = uebenSchritte.length;
  const uebenFertig = modus === "ueben" && nUeben > 0 && uebenStand >= nUeben;
  const uebenAnhieb = aufAnhieb(uebenFalsch, Math.min(uebenStand, nUeben));
  const uebenWaehle = (o) => {
    if (!uebenSchritte[uebenStand]) return;
    const schon = uebenFalsch[uebenStand] || [];
    if (!o.richtig) { if (!schon.includes(o.key)) setUebenFalsch({ ...uebenFalsch, [uebenStand]: [...schon, o.key] }); return; }
    const neu = uebenStand + 1;
    setUebenStand(neu);
    if (neu === nUeben) buchen({ richtig: aufAnhieb(uebenFalsch, nUeben) === nUeben, gruppe: "ableitung-ueben", stufe: nUeben, art: "eigen" });
  };

  const eintrag = zeilen[aktiv];
  const setEintragText = (t) => setZeilen(zeilen.map((z, i) => (i === aktiv ? { ...z, text: t, status: null, hinweis: "" } : z)));

  const pruefen = () => {
    if (!kette || !eintrag) return;
    const st = aktiv + 1;
    const b = parse(eintrag.text);
    if (!b || hatBox(b)) {
      setZeilen(zeilen.map((z, i) => (i === aktiv ? { ...z, status: "falsch", hinweis: "Der Term ist noch nicht vollständig — fülle alle Platzhalter ▯ und schließe die Klammern." } : z)));
      return;
    }
    const g = kompiliere(ohnePar(b));
    const soll = kette[st].fn, vorher = kette[st - 1].fn;
    const erg = vergleich(g, soll);
    setBilanz((bz) => ({ richtig: bz.richtig + (erg.ok ? 1 : 0), gesamt: bz.gesamt + 1 }));
    buchen({ richtig: !!erg.ok, gruppe: `ableitung-${st}`, stufe: st, art: "eigen" });
    if (erg.ok) {
      const neu = zeilen.map((z, i) => (i === aktiv ? { ...z, status: "richtig", hinweis: "" } : z));
      if (st < 3) { neu.push(leer()); setAktiv(aktiv + 1); setPos(0); }
      setZeilen(neu);
    } else {
      setZeilen(zeilen.map((z, i) => (i === aktiv ? { ...z, status: "falsch", hinweis: diagnose(g, soll, vorher, st), versuche: z.versuche + 1 } : z)));
    }
  };

  const loesungZeigen = () => {
    const st = aktiv + 1;
    const neu = zeilen.map((z, i) => (i === aktiv ? { ...z, status: "gezeigt", zeig: alsTex(kette[st].baum), hinweis: "" } : z));
    if (st < 3) { neu.push(leer()); setAktiv(aktiv + 1); setPos(0); }
    setZeilen(neu);
  };

  const uebernehmen = () => { const b = parse(eigenText); if (b && !hatBox(b)) { neustart(eigenText); setEigenOffen(false); } };

  const fertig = zeilen.length === 3 && ["richtig", "gezeigt"].includes(zeilen[2].status);

  const regeln = [...REGEL_CHIPS, ["eigen", "Eigene Funktion"]];
  const waehleRegel = (id) => {
    setRegel(id);
    if (id === "eigen") { if (!kette) setEigenOffen(true); return; }
    if (id !== "gold" && stufe > 3) setStufe(3);
  };
  const wuerfeln = () => (eigen ? setEigenOffen(true) : setWurf((w) => w + 1));
  const stufen = (regel === "gold" ? [1, 2, 3, 4, 5] : [1, 2, 3]).map((st) => ({ id: st, name: `Stufe ${st}` }));
  const regelName = (regeln.find(([id]) => id === regel) || ["", ""])[1];

  const modusSchalter = (
    <>
      <ModusSchalter className="abl-seg" modus={modus} setModus={(m) => festhalten(() => waehleModus(m))} />
      <ModusText modus={modus} attr="data-abl-modus-text" />
    </>
  );
  const stufeWahl = (
    <PopupWahl className={`abl-stufe${eigen ? " aus" : ""}`} wert={stufe} label="Stufe wählen" optionen={stufen}
      kopf={(o) => (o ? o.name : "Stufe")} onWaehle={(st) => festhalten(() => setStufe(st))} />
  );
  const wuerfel = (
    <button type="button" className="abl-wuerfel" onClick={() => festhalten(wuerfeln)}
      aria-label={eigen ? "Funktion ändern" : "Neue Aufgabe würfeln"} title={eigen ? "Funktion ändern" : "Neue Aufgabe"}><span aria-hidden="true">🎲</span></button>
  );
  const regelChips = (umbruch) => (
    <div className="abl-chipwrap" style={umbruch ? { margin: 0 } : undefined}>
      <div className="abl-chips" role="group" aria-label="Was möchtest du ableiten?" style={umbruch ? { flexWrap: "wrap" } : undefined}>
        {regeln.map(([id, name]) => (
          <button key={id} type="button" className="abl-chip" aria-pressed={regel === id} onClick={() => festhalten(() => waehleRegel(id))}>{name}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="abl-seite">
      <style>{POP_CSS}</style>
      <style>{UEBEN_CSS}</style>
      <style>{`
        .abl-seite{background:#fff}[data-trainings-session] .abl-seite{min-height:calc(100dvh - 61px)}
        .abl-seite,.abl-seite *{overflow-anchor:none}
        .abl-innen{max-width:620px;margin:0 auto;padding:14px 16px 48px}
        .abl-chipwrap{position:relative;margin:0 -16px 10px}
        .abl-chips{display:flex;gap:8px;overflow-x:auto;padding:2px 16px 4px;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;scroll-padding-left:16px}
        .abl-chips::-webkit-scrollbar{display:none}
        .abl-chipwrap::after{content:"";position:absolute;right:0;top:0;bottom:4px;width:34px;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,0),#fff)}
        .abl-chip{flex:0 0 auto;scroll-snap-align:start;height:46px;padding:0 18px;border-radius:999px;font-family:inherit;font-size:15.5px;font-weight:600;cursor:pointer;white-space:nowrap;border:1.5px solid ${C.linie};background:#fff;color:${C.see}}
        .abl-chip[aria-pressed="true"]{background:${C.see};border-color:${C.see};color:#fff}
        .abl-karte{background:transparent}
        .abl-kopf{display:grid;grid-template-columns:1fr;gap:8px;align-items:stretch;margin-bottom:14px}
        .abl-links{display:flex;flex-direction:column;gap:8px;min-width:0}
        .abl-reihe{display:flex;gap:8px;align-items:stretch;flex:1;min-height:42px}
        .abl-seg{display:flex;padding:3px;border-radius:999px;background:#EEF2F8;gap:2px;flex:1;min-height:42px}
        .abl-seg button{flex:1;min-width:0;border-radius:999px;border:none;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;background:transparent;color:${C.grau};white-space:nowrap;padding:0 6px}
        .abl-seg button[aria-pressed="true"]{background:#fff;color:${C.see};box-shadow:0 1px 6px rgba(15,26,51,0.12)}
        .abl-stufe,.abl-reihe .wk-pop.abl-stufe{flex:1;min-width:0;display:flex}
        .abl-stufe .wk-pop-knopf{flex:1;min-width:0;height:auto;min-height:42px;justify-content:space-between;padding:0 12px 0 14px;font-size:14.5px}
        .abl-stufe.aus{opacity:.4;pointer-events:none}
        .abl-wuerfel{width:46px;flex-shrink:0;padding:0;border-radius:999px;border:none;cursor:pointer;background:${C.flaggold};font-size:22px;line-height:1;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(15,26,51,0.14)}
        @media (min-width:601px){
          .abl-seite{background:transparent}
          .abl-chipwrap{margin:0 0 12px}
          .abl-chipwrap::after{display:none}
          .abl-chips{flex-wrap:wrap;overflow:visible;padding:0}
          .abl-karte{background:#fff;border-radius:16px;padding:18px;box-shadow:0 2px 16px rgba(15,26,51,0.07)}
        }
        .abl-nur-desk{display:none}
        /* Desktop (ab 840 px, DESKTOP-STIL.md): links die Einstellungen (Modus, Stufe, Regel) als ruhige,
           mitlaufende Spalte, rechts die Aufgabe – alles auf einen Blick. Handy unverändert. */
        @media (min-width:840px){
          .abl-innen{max-width:none;width:var(--tr-breite);padding:24px 0 56px}
          .abl-raster{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:24px;align-items:start}
          .abl-spalte-l{position:sticky;top:${38 + 18}px;background:#fff;border:1px solid ${C.linie};border-radius:16px;padding:16px}
          .abl-spalte-r{min-width:0}
          .abl-nur-desk{display:block}
          .abl-kopf{grid-template-columns:1fr;gap:10px;margin-bottom:16px !important}
          .abl-chipwrap{margin:0}
          .abl-chips{flex-direction:column;flex-wrap:nowrap;gap:6px}
          .abl-chip{width:100%;height:40px;text-align:left;font-size:14px;padding:0 14px;border-radius:12px}
          .abl-karte{border:1px solid ${C.linie};box-shadow:none;padding:20px 22px}
        }`}</style>
      <div className="abl-innen">
       <div className="abl-raster">
        <div className="abl-spalte-l">
        {/* Handy (unter 840 px, „Aufgabe zuerst“): Modus und eine Einstellungs-Pille (Regel · Stufe, Würfel rechts) vor der Aufgabe.
            Desktop: Spalte mit Modus, Stufe + Würfel und der Regelliste. */}
        {!desk ? (
          <>
            <div className="abl-kopf" style={{ marginBottom: 0 }}><div className="abl-links">{modusSchalter}</div></div>
            <EinstellungsPille kennung="ableitungstrainer"
              teile={[["Regel", regelName], eigen ? null : ["Stufe", String(stufe)]]}
              rechts={wuerfel}>
              {!eigen && <div className="abl-reihe" style={{ marginBottom: 10 }}>{stufeWahl}</div>}
              {regelChips(true)}
            </EinstellungsPille>
          </>
        ) : (<>
          <div className="abl-kopf">
            <div className="abl-links">
              {modusSchalter}
              <div className="abl-reihe">{stufeWahl}{wuerfel}</div>
            </div>
          </div>
          <p className="abl-nur-desk" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.grau, margin: "0 2px 8px" }}>Regel</p>
          {regelChips(false)}
        </>)}
        </div>
        <div className="abl-spalte-r">
        {!eigen && <RegelWerkstatt regel={regel} stufe={stufe} modus={modus} onModus={setModus} wurf={wurf} ohneKopf />}
        {eigen && <>
        {eigenOffen && (
          <div className="abl-karte" style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 14, color: C.grau, marginBottom: 8 }}>Gib deine Funktion ein und tippe auf „Übernehmen“.</p>
            <div style={{ border: `1.5px solid ${C.linie}`, borderRadius: 14, padding: "8px 14px", minHeight: 56,
              display: "flex", alignItems: "center", gap: 8, overflowX: "auto", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 20 }}>f(x) =</span>
              <span style={{ fontSize: 22, lineHeight: 1.9 }}>
                <LiveFormel text={eigenText} pos={eigenPos} setPos={setEigenPos} hinweis={<span style={{ color: C.hellgrau, fontSize: 15 }}>…</span>} />
              </span>
            </div>
            <Tastenfeld wert={eigenText} setWert={setEigenText} pos={eigenPos} setPos={setEigenPos} onOk={uebernehmen} />
            <button onClick={uebernehmen}
              style={{ width: "100%", height: 56, marginTop: 12, borderRadius: 14, border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 17, fontWeight: 700, color: C.seeTief, background: C.flaggold }}>
              Übernehmen
            </button>
          </div>
        )}

        {/* Aufgabe und Ableitungszeilen */}
        {kette && !eigenOffen && (
          <div className="abl-karte">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte, lineHeight: 1.25 }}>Leite ab</p>
                <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.35 }}>
                  Eigene Funktion{bilanz.gesamt ? ` · ${bilanz.richtig} von ${bilanz.gesamt} richtig` : ""}
                </p>
              </div>
              <button type="button" onClick={() => setEigenOffen(true)}
                style={{ flexShrink: 0, height: 46, padding: "0 18px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 15, fontWeight: 700, color: C.seeTief, background: C.flaggold, display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>↻</span>Funktion ändern
              </button>
            </div>
            <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16,
              padding: "14px 18px", marginBottom: 14, overflowX: "auto" }}>
              <span style={{ color: C.weiss, fontSize: 24, fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.9 }}>
                <M t={`f(x) = ${alsTex(fBaum)}`} />
              </span>
            </div>

            {modus === "auto" ? (
              /* Rechnen: die drei Ableitungen stehen sofort da, nichts zu tippen */
              <div className="abl-auto" style={{ background: C.sand, borderRadius: 16, padding: "10px 16px 12px" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 52, borderTop: i > 1 ? `1px solid ${C.linie}` : "none", overflowX: "auto", whiteSpace: "nowrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: C.tinte, flexShrink: 0, minWidth: 64 }}>f{["′", "″", "‴"][i - 1]}(x) =</span>
                    <span style={{ fontSize: 20 }}><M t={alsTex(kette[i].baum)} /></span>
                  </div>
                ))}
              </div>
            ) : modus === "ueben" ? (
              <div data-abl-ueben-weg>
                {uebenSchritte.slice(0, Math.min(uebenStand + 1, nUeben)).map((s, i) => {
                  const fertigZ = i < uebenStand;
                  return (
                    <div key={`${uebenRunde}-${i}`}>
                      <Zeile stufe={s.stufe} aktiv={false} eintrag={{ text: "", status: fertigZ ? "richtig" : null }} tex={fertigZ ? s.richtig.tex : ""} ziel={!fertigZ} />
                      {!fertigZ && (
                        <div style={{ marginBottom: 14 }}>
                          <UebenWahl schritt={s} nr={i + 1} gesamt={nUeben} frage={s.frage} falsch={uebenFalsch[i] || []} onWahl={uebenWaehle} inhalt={(w) => <M t={w.tex} />} />
                        </div>
                      )}
                    </div>
                  );
                })}
                {uebenFertig && (
                  <UebenFertig anhieb={uebenAnhieb} gesamt={nUeben} onLernen={() => waehleModus("lernen")} onNeu={() => neustart(fText)} neuText="Nochmal üben"
                    leise="Nächste Stufe: Leite dieselbe Funktion in „Lernen“ ab – jede Zeile selbst eintippen, ohne Auswahl.">
                    <M t={`f‴(x) = ${uebenSchritte[nUeben - 1].richtig.tex}`} />
                  </UebenFertig>
                )}
              </div>
            ) : zeilen.map((z, i) => (
              <div key={i}>
                <Zeile stufe={i + 1} aktiv={i === aktiv && !fertig} eintrag={z.status === "gezeigt" ? { ...z, text: "" } : z}
                  onKlick={i === aktiv && !fertig ? () => { if (!offen) setPos(z.text.length); setOffen(!offen); } : undefined}
                  pos={pos} setPos={i === aktiv && !fertig && offen ? setPos : undefined} />
                {i === aktiv && !fertig && offen && (
                  <EingabePopup style={{ marginTop: -4, marginBottom: 14 }}>
                    {eintrag && eintrag.versuche > 0 && (
                      <button onClick={loesungZeigen}
                        style={{ width: "100%", height: 46, marginBottom: 10, borderRadius: 14, border: `1.5px solid ${C.linie}`, cursor: "pointer",
                          fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, color: C.see, background: C.weiss }}>
                        Lösung zeigen
                      </button>
                    )}
                    <Eingabe text={eintrag.text} setText={setEintragText} pos={pos} setPos={setPos} onEnter={pruefen} platzhalter="z. B. 2x*cos(x) oder e^(2x)" />
                  </EingabePopup>
                )}
                {z.status === "gezeigt" && (
                  <p style={{ fontSize: 17, margin: "-4px 4px 14px", overflowX: "auto", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 13, color: C.grau, marginRight: 8 }}>Lösung:</span><M t={z.zeig} />
                  </p>
                )}
                {z.hinweis && (
                  <p style={{ fontSize: 14, color: C.signal, lineHeight: 1.6, margin: "-2px 4px 14px" }}>{z.hinweis}</p>
                )}
              </div>
            ))}

            {modus === "lernen" && fertig && (
              <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: C.smaragd, marginBottom: 4 }}>
                  {zeilen.every((z) => z.status === "richtig") ? "Alle drei Ableitungen richtig! 🎉" : "Geschafft — alle drei Ableitungen stehen."}
                </p>
                <p style={{ fontSize: 14, color: C.grau, marginBottom: 14 }}>Nochmal mit dieser oder einer neuen Funktion?</p>
                <button onClick={() => neustart(fText)}
                  style={{ width: "100%", height: 56, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit",
                    fontSize: 17, fontWeight: 700, color: C.weiss, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` }}>
                  Nochmal von vorn
                </button>
              </div>
            )}
            {modus === "lernen" && !fertig && <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}><IchHaengeFest kontext={ableitHilfe(kette, aktiv)} /></div>}
          </div>
        )}
        </>}
        </div>
       </div>
      </div>
    </div>
  );
}

/* Hochformat-Grafik für die Startseiten-Kachel: f, f′, f″ untereinander. */
export function AbleitungLogoKlein() {
  const W = 230, H = 190;
  const kurve = (g, y0, s) => {
    let d = "";
    for (let i = 0; i <= 120; i++) {
      const x = -3 + (6 * i) / 120, y = g(x);
      d += `${i ? "L" : "M"}${(34 + (x + 3) * 27).toFixed(1)},${(y0 - y * s).toFixed(1)}`;
    }
    return d;
  };
  const zeilen = [
    { g: (x) => x ** 3 / 6 - x, y: 42, farbe: C.weiss, t: "f", s: 7, ok: true },
    { g: (x) => x ** 2 / 2 - 1, y: 100, farbe: C.flaggold, t: "f′", s: 6.5, ok: true },
    { g: (x) => x, y: 158, farbe: C.granaHell, t: "f″", s: 5, ok: false },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {zeilen.map((z, i) => (
        <g key={i}>
          <line x1="34" y1={z.y} x2="196" y2={z.y} stroke="rgba(255,255,255,0.14)" />
          <text x="12" y={z.y + 5} fill={z.farbe} fontSize="15" fontWeight="700" fontStyle="italic">{z.t}</text>
          <path d={kurve(z.g, z.y, z.s)} stroke={z.farbe} strokeWidth={i === 0 ? 2.8 : 2.3} fill="none" strokeLinecap="round" />
          <circle cx="214" cy={z.y - 16} r="9" fill={z.ok ? C.smaragd : "rgba(255,255,255,0.14)"} />
          {z.ok ? <path d={`M209.5,${z.y - 16} l3.2,3.2 l6,-6.5`} stroke={C.weiss} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            : <text x="214" y={z.y - 12} fill={C.weiss} fontSize="12" fontWeight="700" textAnchor="middle">?</text>}
          {i < 2 && <path d={`M115,${z.y + 19} l0,12 m-4,-4 l4,4 l4,-4`} stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" fill="none" />}
        </g>
      ))}
    </svg>
  );
}

/* Logo für die Startseiten-Kachel: f, f′, f″ gestaffelt, mit Häkchen. */
export function AbleitungLogo() {
  const W = 340, H = 170;
  const kurve = (g, y0, s) => {
    let d = "";
    for (let i = 0; i <= 160; i++) {
      const x = -3 + (6 * i) / 160, y = g(x);
      d += `${i ? "L" : "M"}${(40 + (x + 3) * 40).toFixed(1)},${(y0 - y * s).toFixed(1)}`;
    }
    return d;
  };
  const zeilen = [
    { g: (x) => x ** 3 / 6 - x, y: 13, farbe: C.weiss, t: "f", s: 2.8 },
    { g: (x) => x ** 2 / 2 - 1, y: 33, farbe: C.flaggold, t: "f′", s: 2.6 },
    { g: (x) => x, y: 53, farbe: C.granaHell, t: "f″", s: 2 },
  ];
  return (
    <svg viewBox={`0 0 ${W} 64`} preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {zeilen.map((z, i) => (
        <g key={i}>
          <line x1="40" y1={z.y} x2="280" y2={z.y} stroke="rgba(255,255,255,0.14)" />
          <text x="12" y={z.y + 5} fill={z.farbe} fontSize="12" fontWeight="700" fontStyle="italic">{z.t}</text>
          <path d={kurve(z.g, z.y, z.s)} stroke={z.farbe} strokeWidth={i === 0 ? 3 : 2.4} fill="none" strokeLinecap="round" />
          <circle cx="306" cy={z.y} r="7.5" fill={i < 2 ? C.smaragd : "rgba(255,255,255,0.12)"} />
          {i < 2 && <path d={`M302.5,${z.y} l2.5,2.5 l5,-5`} stroke={C.weiss} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          {i === 2 && <text x="306" y={z.y + 5} fill={C.weiss} fontSize="11" fontWeight="700" textAnchor="middle">?</text>}
        </g>
      ))}
    </svg>
  );
}
