/* ======================================================================
   FORMELAUSWAHL ZUM BUCHKAPITEL + TESTKLAUSUR
   Aufruf aus dem Quickfinder (Startseite → Dein Status quo → Kapitel →
   Formelsammlung). Zeigt nur die Formeln, die zu diesem Kapitel gehören:
   erst das Vorwissen aus den Vorjahren (als Weg zum Kapitel), dann die
   Formeln des Kapitels selbst – mit PDF-Download.
   Darunter der goldene Knopf „Testklausur kreieren“: Mathilda stellt eine
   realistische Klassenarbeit bzw. Klausur genau zu diesem Kapitel zusammen,
   mit Bewertungseinheiten, Erwartungshorizont, Notenschlüssel und PDF.
   Daten: kapitelFormeln.js (Auswahl), fsIndex.js (Formeln), schulbuch.js (Kapitel).
   ====================================================================== */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MathildaName } from "./mathildaName.jsx";
import { API_URL, C } from "./base1.jsx";
import { kiAntwort, kiKopf } from "./base4.jsx";
import { M, alsFunktion } from "./func3.jsx";
import { jsonLesen } from "./func1.jsx";
import { FS_NACH_ID } from "./fsIndex.js";
import { kapitelAuswahl } from "./kapitelFormeln.js";
import { kapitelFuer, klassenBoxen, roemisch, schulart as schulartVon } from "./schulbuch.js";
import { quickfinderLesen } from "./funcQuickfinder.jsx";
import { dateiName, pdfAusBloecken } from "./pdfBloecke.js";

import { springe } from "./sprung.js";
const GOLD_VERLAUF = `linear-gradient(135deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`;
const KICKER = { fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gruenDunkel, margin: 0 };
const KARTE = { background: C.weiss, borderRadius: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

/* Text mit $…$-Formeln (wie Text aus func3, aber als span und mit bereinigtem TeX) */
function TeX({ s, style }) {
  const stuecke = String(s || "").split("$");
  return <span style={style}>{stuecke.map((t, i) => (i % 2 ? <M key={i} t={texSaeubern(t)} /> : <span key={i}>{t}</span>))}</span>;
}

/* Was die KI gelegentlich schreibt, der Formelsatz der App aber nicht kennt */
export function texSaeubern(t) {
  return String(t)
    .replace(/\\[dt]frac/g, "\\frac").replace(/\\displaystyle\s*/g, "").replace(/\\limits/g, "")
    .replace(/\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g, (_, inn) => {
      const z = inn.split("\\\\").map((x) => x.trim()).filter(Boolean);
      return z.length === 3 ? `\\left(\\spalte{${z[0]}}{${z[1]}}{${z[2]}}\\right)` : `\\left(\\binom{${z[0] || ""}}{${z[1] || ""}}\\right)`;
    })
    .replace(/\\operatorname\{([^}]*)\}/g, "\\text{$1}").replace(/\\mathrm\{([^}]*)\}/g, "\\text{$1}")
    .replace(/\\cdotp/g, "\\cdot").replace(/\\lvert|\\rvert|\\vert/g, "|");
}

/* ---------- Kapitel bestimmen ---------- */
function kapitelInfo(ziel) {
  const q = ziel && ziel.kapitel ? ziel : quickfinderLesen();
  if (!q || !q.kapitel) return null;
  const schulart = q.schulart || "g9";
  const auswahl = kapitelAuswahl(q.kapitel, schulart);
  if (!auswahl) return null;
  /* Box „Abi“ bündelt alle Kursstufen-Kapitel: dann zählt die Klasse, in der das Kapitel wirklich steht */
  const boxId = !q.klasse || q.klasse === "abi" ? auswahl.klasse && auswahl.klasse.box : q.klasse;
  const box = klassenBoxen(schulart).find((b) => b.id === boxId);
  const liste = box ? kapitelFuer(schulart, box.id) : [];
  const k = liste.find((x) => x.id === q.kapitel);
  return {
    ...auswahl, schulart, schulartName: (schulartVon(schulart) || {}).name || "G9",
    klasseLabel: box ? box.label : auswahl.klasse ? auswahl.klasse.label : "",
    kursstufe: !!(box && box.gold), unterstufe: !!(box && box.klassen[0] <= 6),
    nr: k ? roemisch(k.nr) : null,
  };
}

/* ---------- Kopfbereich (blau, Silbertitel, Goldstrich) ---------- */
function Kopf({ info, untertitel, kicker }) {
  return (
    <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
      <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
        <p style={{ margin: "0 0 10px", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold }}>{kicker}</p>
        <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 29, letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0 }}>{info.titel}</h1>
        <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 16 }} />
        {untertitel && <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65, margin: 0 }}>{untertitel}</p>}
      </div>
      <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
    </div>
  );
}

const kapitelZeile = (info) => [`Klasse ${info.klasseLabel}`, info.schulartName, info.nr ? `Kapitel ${info.nr}` : null].filter(Boolean).join(" · ");

/* ---------- Knöpfe ---------- */
function PdfKnopf({ onClick, laeuft, children = "Als PDF herunterladen" }) {
  return (
    <button type="button" onClick={onClick} disabled={laeuft}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44, padding: "0 18px", borderRadius: 999, border: "none",
        background: C.see, color: C.weiss, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: laeuft ? "wait" : "pointer", opacity: laeuft ? 0.75 : 1 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 20h16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {laeuft ? "PDF wird erstellt …" : children}
    </button>
  );
}

function GoldKnopf({ onClick, titel, zeile, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, textAlign: "left", padding: "16px 18px", borderRadius: 16, border: "none",
        background: GOLD_VERLAUF, color: C.seeTief, fontFamily: "inherit", cursor: disabled ? "wait" : "pointer",
        boxShadow: "0 6px 20px rgba(226,181,60,0.38), inset 0 1px 0 rgba(255,255,255,0.45)", opacity: disabled ? 0.8 : 1 }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 12, background: "rgba(14,30,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z M14 3v5h5 M10 12h6 M10 16h6" fill="none" stroke={C.seeTief} strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round" /></svg>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }}>{titel}</span>
        {zeile && <span style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginTop: 2, color: "rgba(14,30,74,0.78)", lineHeight: 1.4 }}>{zeile}</span>}
      </span>
      <span aria-hidden="true" style={{ fontSize: 24, fontWeight: 700 }}>›</span>
    </button>
  );
}

/* ======================================================================
   FORMELAUSWAHL
   ====================================================================== */
function FormelZeile({ id, oeffne, kern }) {
  const e = FS_NACH_ID[id];
  if (!e) return null;
  return (
    <button type="button" onClick={() => oeffne(id)}
      style={{ ...KARTE, width: "100%", display: "block", textAlign: "left", border: "none", borderLeft: `3px solid ${kern ? C.flaggold : "transparent"}`,
        padding: "11px 14px 9px", marginBottom: 8, fontFamily: "inherit", cursor: "pointer", color: C.tinte }}>
      <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>{e.n}</span>
        <span aria-hidden="true" style={{ fontSize: 18, color: C.see, lineHeight: 1 }}>›</span>
      </span>
      <span style={{ display: "block", fontSize: 16, lineHeight: 1.95, overflowX: "auto", overflowY: "hidden", marginTop: 2 }}><M t={e.f} /></span>
      {e.k && <span style={{ display: "block", fontSize: 12, color: C.grau, lineHeight: 1.45, marginTop: 1 }}>{e.k}</span>}
    </button>
  );
}

function Formelauswahl({ info, gehe, zurKlausur }) {
  const [pdfLaeuft, setPdfLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const druckRef = useRef(null);
  const [drucken, setDrucken] = useState(false);
  const oeffne = (id) => gehe({ ansicht: "formeln", formel: id });
  const nVor = info.vorwissen.reduce((s, a) => s + a.ids.length, 0);
  const nKern = info.kern.reduce((s, a) => s + a.ids.length, 0);

  const pdf = async () => {
    setFehler(""); setPdfLaeuft(true); setDrucken(true);
    try {
      await new Promise((r) => setTimeout(r, 60));
      const wurzel = druckRef.current;
      await pdfAusBloecken({
        bloecke: [...wurzel.querySelectorAll("[data-pdf-block]")],
        kopf: wurzel.querySelector("[data-pdf-kopf]"),
        fuss: `mythosmathe.de · Formelauswahl · ${info.titel}`,
        dateiname: `Formeln_${dateiName(info.titel)}.pdf`,
      });
    } catch (e) { setFehler("Das PDF ließ sich gerade nicht erstellen. Bitte noch einmal versuchen."); }
    setDrucken(false); setPdfLaeuft(false);
  };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
        <p style={{ margin: 0, fontSize: 13.5, color: C.grau, lineHeight: 1.5 }}>
          <strong style={{ color: C.tinte }}>{nVor + nKern} Formeln</strong>{nVor ? ` · ${nVor} aus den Vorjahren · ${nKern} neu` : ""}
        </p>
      </div>

      {info.vorwissen.length > 0 && (
        <>
          <p style={{ ...KICKER, marginBottom: 4 }}>Der Weg zum Kapitel</p>
          <p style={{ margin: "0 0 16px", fontSize: 14.5, color: C.grau, lineHeight: 1.65 }}>Das brauchst du aus den Vorjahren – in der Reihenfolge, in der es zu {info.nr ? `Kapitel ${info.nr}` : "diesem Kapitel"} hinführt.</p>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {info.vorwissen.map((a) => (
              <li key={a.aus} style={{ display: "grid", gridTemplateColumns: "22px 1fr", columnGap: 10 }}>
                <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: 14, height: 14, marginTop: 3, borderRadius: 999, border: `3px solid ${C.see}`, background: C.weiss, flexShrink: 0 }} />
                  <span style={{ width: 3, flex: 1, background: C.seeHell, opacity: 0.45, borderRadius: 2 }} />
                </div>
                <div style={{ minWidth: 0, paddingBottom: 12 }}>
                  <p style={{ margin: "0 0 8px", display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", padding: "2px 8px", borderRadius: 999, background: C.himmel, color: C.see, whiteSpace: "nowrap" }}>{a.herkunft}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.tinte }}>{a.titel}</span>
                  </p>
                  {a.ids.map((id) => <FormelZeile key={id} id={id} oeffne={oeffne} />)}
                </div>
              </li>
            ))}
            <li style={{ display: "grid", gridTemplateColumns: "22px 1fr", columnGap: 10 }}>
              <div aria-hidden="true" style={{ display: "flex", justifyContent: "center" }}>
                <span style={{ width: 18, height: 18, marginTop: 1, borderRadius: 999, background: GOLD_VERLAUF, boxShadow: "0 0 0 4px rgba(237,187,0,0.18)" }} />
              </div>
              <p style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: C.tinte, lineHeight: 1.4 }}>
                {info.nr ? `Kapitel ${info.nr} · ` : ""}{info.titel}
                {info.weg && <span style={{ display: "block", fontSize: 13.5, fontWeight: 400, color: C.grau, lineHeight: 1.6, marginTop: 4 }}>{info.weg}</span>}
              </p>
            </li>
          </ol>
        </>
      )}

      <p style={{ ...KICKER, marginBottom: 4, marginTop: info.vorwissen.length ? 8 : 0 }}>Neu in diesem Kapitel</p>
      {!info.vorwissen.length && info.weg && <p style={{ margin: "0 0 12px", fontSize: 14.5, color: C.grau, lineHeight: 1.65 }}>{info.weg}</p>}
      {info.kern.map((a) => (
        <section key={a.titel} style={{ marginTop: 14 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", color: C.tinte }}>{a.titel}</h3>
          {a.ids.map((id) => <FormelZeile key={id} id={id} oeffne={oeffne} kern />)}
        </section>
      ))}

      <p style={{ margin: "14px 2px 0", fontSize: 12, color: C.hellgrau, lineHeight: 1.55 }}>
        Tippe eine Formel an für Herleitung, Beispiel und typische Falle. Zuschnitt nach Lambacher Schweizer (Baden-Württemberg); je nach Schule kann er abweichen.
      </p>

      <div style={{ height: 1, background: C.linie, margin: "30px 0 24px" }} />
      <p style={{ ...KICKER, marginBottom: 6 }}>Mitnehmen und üben</p>
      <h3 style={{ margin: "0 0 14px", fontSize: 21, fontWeight: 700, letterSpacing: "-0.01em", color: C.tinte, lineHeight: 1.25 }}>
        Formeln als PDF – und dann eine {info.kursstufe ? "Klausur" : "Klassenarbeit"} genau zu diesem Kapitel
      </h3>
      <div style={{ display: "grid", marginBottom: 12 }}><PdfKnopf onClick={pdf} laeuft={pdfLaeuft}>Formelauswahl als PDF herunterladen</PdfKnopf></div>
      {fehler && <p role="alert" style={{ margin: "0 0 12px", fontSize: 13, color: C.signal }}>{fehler}</p>}
      <GoldKnopf onClick={zurKlausur} titel="Testklausur kreieren"
        zeile={`${info.kursstufe ? "Klausur" : "Klassenarbeit"} wie in Klasse ${info.klasseLabel} – mit Punkten, Lösungen und Notenschlüssel`} />

      {drucken && (
        <div aria-hidden="true" style={{ position: "fixed", left: -10000, top: 0, width: 760, background: C.weiss }}>
          <FormelDruck ref={druckRef} info={info} />
        </div>
      )}
    </div>
  );
}

/* ---------- Druckfassung der Formelauswahl (für das PDF) ---------- */
function DruckKopf({ info, rechts }) {
  return (
    <div style={{ background: C.seeTief, padding: "14px 26px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `3px solid ${C.flaggold}`, fontFamily: "Montserrat, sans-serif" }}>
      <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em" }}>
        <span style={{ color: C.silberHell }}>MYTHOS</span><span style={{ color: C.flaggold }}>MATHE</span><span style={{ color: C.silberHell }}>.DE</span>
      </span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: C.goldText }}>{rechts}</span>
    </div>
  );
}

const FormelDruck = React.forwardRef(function FormelDruck({ info }, ref) {
  const Gruppe = ({ titel, kicker, ids, kern }) => (
    <div data-pdf-block style={{ padding: "12px 26px 6px", fontFamily: "Montserrat, sans-serif", color: C.tinte, background: C.weiss }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, borderBottom: `1.5px solid ${kern ? C.flaggold : C.see}`, paddingBottom: 5, marginBottom: 4 }}>
        {kicker && <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: kern ? "#FFF6DA" : C.himmel, color: kern ? C.gruenDunkel : C.see }}>{kicker}</span>}
        <span style={{ fontSize: 16, fontWeight: 700 }}>{titel}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 26 }}>
        {ids.map((id) => {
          const e = FS_NACH_ID[id];
          return (
            <div key={id} style={{ borderTop: `1px solid ${C.linie}`, padding: "7px 0 6px" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.grau }}>{e.n}</div>
              <div style={{ fontSize: 15, lineHeight: 1.9 }}><M t={e.f} /></div>
              {e.k && <div style={{ fontSize: 10.5, color: C.grau, lineHeight: 1.4 }}>{e.k}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
  return (
    <div ref={ref}>
      <div data-pdf-kopf><DruckKopf info={info} rechts={`Formelauswahl · ${info.titel}`} /></div>
      <div data-pdf-block style={{ fontFamily: "Montserrat, sans-serif", background: C.weiss }}>
        <DruckKopf info={info} rechts="Formelauswahl" />
        <div style={{ padding: "20px 26px 8px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gruenDunkel }}>{kapitelZeile(info)}</div>
          <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-0.02em", color: C.tinte, marginTop: 4 }}>{info.titel}</div>
          <div style={{ width: 46, height: 3.5, background: GOLD_VERLAUF, borderRadius: 2, margin: "10px 0 10px" }} />
          {info.weg && <div style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, maxWidth: 640 }}>{info.weg}</div>}
          {info.vorwissen.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 12, fontSize: 11.5, fontWeight: 600, color: C.see }}>
              {info.vorwissen.map((a) => <React.Fragment key={a.aus}><span style={{ padding: "3px 9px", borderRadius: 999, background: C.himmel }}>{a.herkunft} · {a.titel}</span><span style={{ color: C.hellgrau }}>→</span></React.Fragment>)}
              <span style={{ padding: "3px 9px", borderRadius: 999, background: GOLD_VERLAUF, color: C.seeTief, fontWeight: 700 }}>{info.nr ? `Kapitel ${info.nr}` : "Dieses Kapitel"}</span>
            </div>
          )}
        </div>
      </div>
      {info.vorwissen.length > 0 && <div data-pdf-block data-pdf-mit-naechstem style={{ padding: "14px 26px 0", fontFamily: "Montserrat, sans-serif", background: C.weiss }}><div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.see }}>Teil 1 · Aus den Vorjahren</div></div>}
      {info.vorwissen.map((a) => <Gruppe key={a.aus} titel={a.titel} kicker={a.herkunft} ids={a.ids} />)}
      <div data-pdf-block data-pdf-mit-naechstem style={{ padding: "16px 26px 0", fontFamily: "Montserrat, sans-serif", background: C.weiss }}><div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gruenDunkel }}>{info.vorwissen.length ? "Teil 2 · " : ""}Neu in {info.nr ? `Kapitel ${info.nr}` : "diesem Kapitel"}</div></div>
      {info.kern.map((a) => <Gruppe key={a.titel} titel={a.titel} kicker={null} ids={a.ids} kern />)}
    </div>
  );
});

/* ======================================================================
   TESTKLAUSUR
   ====================================================================== */
const SPEICHER = (k) => `matheplus-testklausur-${k}`;
const laden = (k) => { try { return JSON.parse(localStorage.getItem(SPEICHER(k)) || "null"); } catch (e) { return null; } };
const sichern = (k, v) => { try { localStorage.setItem(SPEICHER(k), JSON.stringify(v)); } catch (e) { /* privat */ } };

const NIVEAUS = [
  { id: "solide", name: "Solide", zeile: "mehr Basis" },
  { id: "realistisch", name: "Realistisch", zeile: "wie in der Schule" },
  { id: "anspruchsvoll", name: "Knackig", zeile: "mehr Transfer" },
];

function rahmen(info) {
  if (info.kursstufe) return { art: "Klausur", dauern: [60, 90], dauer: 90, be: (d) => (d >= 90 ? 45 : 30) };
  if (info.unterstufe) return { art: "Klassenarbeit", dauern: [30, 45], dauer: 45, be: (d) => (d >= 45 ? 26 : 18) };
  return { art: "Klassenarbeit", dauern: [30, 45], dauer: 45, be: (d) => (d >= 45 ? 32 : 22) };
}

function systemText(info, dauer, be, niveau) {
  const r = rahmen(info);
  const formeln = [...info.vorwissen.map((a) => ({ titel: `Vorwissen (${a.herkunft}): ${a.titel}`, ids: a.ids })), ...info.kern.map((a) => ({ titel: `Kapitel: ${a.titel}`, ids: a.ids }))]
    .map((a) => `- ${a.titel}: ${a.ids.map((id) => FS_NACH_ID[id] ? `${FS_NACH_ID[id].n} (${FS_NACH_ID[id].f})` : id).join("; ")}`).join("\n");
  return `Du bist eine erfahrene Mathematiklehrkraft an einem Gymnasium in Baden-Württemberg (Bildungsplan 2016, Buch: Lambacher Schweizer). Du schreibst eine realistische ${r.art} – genau so, wie sie eine Lehrkraft nach diesem Buchkapitel stellen würde.

KONTEXT
- Schulart: ${info.schulartName}, Klasse ${info.klasseLabel}${info.kursstufe ? " (Kursstufe, Basisfach-Niveau im Stil des Abiturs)" : ""}
- Buchkapitel: ${info.nr ? `Kapitel ${info.nr} · ` : ""}${info.titel}
- Inhalte des Kapitels: ${info.zeile}
- Formeln, die zum Kapitel gehören:
${formeln}

ANFORDERUNGEN
- Bearbeitungszeit ${dauer} Minuten, insgesamt etwa ${be} Bewertungseinheiten (BE). Pro Minute rechnet man etwa ${(be / dauer).toFixed(1)} BE.
- Schwerpunkt klar auf dem Kapitel; Vorwissen nur als Werkzeug. Keine Inhalte aus späteren Kapiteln.
- Niveau: ${niveau === "solide" ? "solide – mehr Grundaufgaben (AFB I/II), kaum Transfer" : niveau === "anspruchsvoll" ? "anspruchsvoll – mehr Begründen, Transfer und Modellieren (AFB II/III)" : "realistisch – etwa 40 % Reproduzieren, 40 % Zusammenhänge herstellen, 20 % Verallgemeinern/Begründen"}.
- ${info.kursstufe ? "Zwei Teile: \"Teil A · ohne Hilfsmittel\" (etwa ein Drittel der BE, kurze Aufgaben) und \"Teil B · mit Hilfsmitteln\" (WTR, Merkhilfe; längere, zusammenhängende Aufgaben mit Sachkontext)." : info.unterstufe ? "Ein Teil, ohne Taschenrechner." : "Ein Teil; gib an, ob ein Taschenrechner erlaubt ist (typisch für das Thema)."}
- 4 bis 6 Aufgaben mit Teilaufgaben a), b), … Operatoren wie im Abitur: berechne, bestimme, gib an, zeige, begründe, skizziere, beschreibe.
- Mindestens eine Aufgabe mit Sachzusammenhang. Wenn es zum Thema passt, eine Aufgabe zu einem gezeichneten Graphen.
- Zahlen so wählen, dass alles von Hand sauber aufgeht (ganze Zahlen, einfache Brüche, schöne Wurzeln). Rechne jede Lösung selbst nach, bevor du sie hinschreibst.
- Terme in Standardschreibweise: nie x^1, kein 1x, kein +0, kein +-.

FORMAT
Antworte ausschließlich mit JSON (kein Text davor oder danach):
{"titel": "…", "hilfsmittel": "…", "teile": [{"name": "…", "aufgaben": [{"titel": "kurzer Titel", "text": "Einleitung/Gegeben", "graph": null, "teilaufgaben": [{"text": "…", "be": 2, "loesung": "…"}]}]}]}
- "graph" ist null oder {"terme": ["0.5*(x-2)^2-1"], "x": [-2, 6], "y": [-2, 5]}: höchstens zwei Funktionsterme in Rechenschreibweise mit * und ^ (sin(), cos(), exp(), ln(), sqrt(), abs(), pi), dazu der sichtbare Ausschnitt. Dann zeichnet die App die Abbildung; im Text schreibst du „Die Abbildung zeigt …“.
- Mathematik in Texten immer zwischen $…$ in LaTeX. Erlaubt: \\frac{}{}, \\sqrt{}, \\sqrt[n]{}, ^{}, _{}, \\cdot, \\pi, \\infty, \\lim_{x \\to \\infty}, \\sin, \\cos, \\tan, \\ln, \\le, \\ge, \\ne, \\approx, \\Rightarrow, \\in, \\mathbb{R}, \\vec{}, \\spalte{a}{b}{c} (Spaltenvektor), \\binom{n}{k}, \\text{}, \\left( \\right), \\pm, griechische Buchstaben. Keine Umgebungen (\\begin…), kein \\displaystyle. Dezimalkomma mit Komma.
- "loesung": knapper Erwartungshorizont – wichtigster Rechenweg in 1 bis 3 Schritten und das Ergebnis, höchstens 45 Wörter.
- Die gesamte Antwort höchstens 1.600 Wörter. Alle Texte auf Deutsch, Aufgabentexte im Imperativ („Bestimme …“).`;
}

function normalisieren(roh) {
  if (!roh || !Array.isArray(roh.teile)) throw new Error("Die Klausur kam unvollständig zurück. Bitte noch einmal erstellen.");
  const teile = roh.teile.map((t) => ({
    name: String(t.name || ""),
    aufgaben: (Array.isArray(t.aufgaben) ? t.aufgaben : []).map((a) => ({
      titel: String(a.titel || ""), text: String(a.text || ""),
      graph: a.graph && Array.isArray(a.graph.terme) && a.graph.terme.length ? {
        terme: a.graph.terme.slice(0, 2).map(String),
        x: Array.isArray(a.graph.x) && a.graph.x.length === 2 ? a.graph.x.map(Number) : [-5, 5],
        y: Array.isArray(a.graph.y) && a.graph.y.length === 2 ? a.graph.y.map(Number) : null,
      } : null,
      teilaufgaben: (Array.isArray(a.teilaufgaben) ? a.teilaufgaben : []).map((ta) => ({ text: String(ta.text || ""), be: Math.max(0, Math.round(Number(ta.be) || 0)), loesung: String(ta.loesung || "") })),
    })).filter((a) => a.text || a.teilaufgaben.length),
  })).filter((t) => t.aufgaben.length);
  if (!teile.length) throw new Error("Die Klausur kam leer zurück. Bitte noch einmal erstellen.");
  let nr = 0;
  teile.forEach((t) => t.aufgaben.forEach((a) => { nr += 1; a.nr = nr; a.be = a.teilaufgaben.reduce((s, x) => s + x.be, 0); }));
  const gesamt = teile.reduce((s, t) => s + t.aufgaben.reduce((x, a) => x + a.be, 0), 0);
  return { titel: String(roh.titel || ""), hilfsmittel: String(roh.hilfsmittel || ""), teile, gesamt };
}

/* Beispiel-Notenschlüssel: Kursstufe in Notenpunkten (wie im Abitur), sonst Noten 1–6 */
export function notenschluessel(gesamt, kursstufe) {
  const grenzen = kursstufe
    ? [[15, 0.95], [14, 0.9], [13, 0.85], [12, 0.8], [11, 0.75], [10, 0.7], [9, 0.65], [8, 0.6], [7, 0.55], [6, 0.5], [5, 0.45], [4, 0.4], [3, 0.33], [2, 0.27], [1, 0.2], [0, 0]]
    : [["1", 0.87], ["2", 0.73], ["3", 0.59], ["4", 0.45], ["5", 0.2], ["6", 0]];
  const halb = (x) => Math.ceil(x * 2) / 2;
  return grenzen.map(([note, p], i) => {
    const ab = halb(gesamt * p);
    const bis = i === 0 ? gesamt : halb(gesamt * grenzen[i - 1][1]) - 0.5;
    return { note: String(note), ab, bis: Math.max(ab, bis) };
  });
}

const komma = (x) => String(x).replace(".", ",");

/* ---------- Abbildung: Graph auf Karopapier ---------- */
function KlausurGraph({ g, breite = 340 }) {
  const clip = "kg" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const fns = g.terme.map((t) => { try { return alsFunktion(t); } catch (e) { return null; } }).filter(Boolean);
  const [x0, x1] = g.x[0] < g.x[1] ? g.x : [-5, 5];
  let y0, y1;
  if (g.y && g.y[0] < g.y[1]) [y0, y1] = g.y;
  else {
    const ys = [];
    fns.forEach((f) => { for (let i = 0; i <= 200; i++) { const y = f(x0 + ((x1 - x0) * i) / 200); if (isFinite(y)) ys.push(y); } });
    ys.sort((a, b) => a - b);
    y0 = Math.floor(Math.min(-1, ys[Math.floor(ys.length * 0.03)] ?? -3)); y1 = Math.ceil(Math.max(1, ys[Math.floor(ys.length * 0.97)] ?? 3));
  }
  const pad = 18, eh = (breite - 2 * pad) / (x1 - x0);
  const hoehe = Math.min(Math.max((y1 - y0) * eh + 2 * pad, 140), 320);
  const ehY = (hoehe - 2 * pad) / (y1 - y0);
  const px = (x) => pad + (x - x0) * eh, py = (y) => hoehe - pad - (y - y0) * ehY;
  const schritt = x1 - x0 > 16 ? 2 : 1, schrittY = y1 - y0 > 16 ? 2 : 1;
  const linien = [];
  for (let x = Math.ceil(x0); x <= x1; x += 1) linien.push(<line key={`v${x}`} x1={px(x)} y1={pad - 6} x2={px(x)} y2={hoehe - pad + 6} stroke="#E6EBF4" strokeWidth="1" />);
  for (let y = Math.ceil(y0); y <= y1; y += 1) linien.push(<line key={`h${y}`} x1={pad - 6} y1={py(y)} x2={breite - pad + 6} y2={py(y)} stroke="#E6EBF4" strokeWidth="1" />);
  const farben = [C.see, C.signal];
  const pfade = fns.map((f) => {
    let d = "", offen = false;
    for (let i = 0; i <= 400; i++) {
      const x = x0 + ((x1 - x0) * i) / 400, y = f(x);
      if (!isFinite(y) || y < y0 - (y1 - y0) || y > y1 + (y1 - y0)) { offen = false; continue; }
      d += `${offen ? "L" : "M"}${px(x).toFixed(1)} ${py(Math.max(y0 - 0.5, Math.min(y1 + 0.5, y))).toFixed(1)} `;
      offen = true;
    }
    return d;
  });
  const achseX = y0 <= 0 && y1 >= 0 ? py(0) : null, achseY = x0 <= 0 && x1 >= 0 ? px(0) : null;
  return (
    <svg viewBox={`0 0 ${breite} ${hoehe}`} style={{ width: "100%", maxWidth: breite, display: "block", margin: "8px auto 4px" }} role="img" aria-label="Abbildung zur Aufgabe">
      <defs><clipPath id={clip}><rect x={pad - 6} y={pad - 6} width={breite - 2 * pad + 12} height={hoehe - 2 * pad + 12} /></clipPath></defs>
      {linien}
      {achseX !== null && <><line x1={pad - 6} y1={achseX} x2={breite - pad + 8} y2={achseX} stroke={C.tinte} strokeWidth="1.3" /><path d={`M${breite - pad + 8} ${achseX} l-6 -3.5 v7 z`} fill={C.tinte} /><text x={breite - pad + 4} y={achseX - 7} fontSize="11" fontStyle="italic" fill={C.tinte}>x</text></>}
      {achseY !== null && <><line x1={achseY} y1={hoehe - pad + 6} x2={achseY} y2={pad - 8} stroke={C.tinte} strokeWidth="1.3" /><path d={`M${achseY} ${pad - 8} l-3.5 6 h7 z`} fill={C.tinte} /><text x={achseY + 7} y={pad - 1} fontSize="11" fontStyle="italic" fill={C.tinte}>y</text></>}
      {achseX !== null && Array.from({ length: Math.floor(x1) - Math.ceil(x0) + 1 }, (_, i) => Math.ceil(x0) + i).filter((x) => x !== 0 && x % schritt === 0 && x < x1).map((x) => (
        <g key={`tx${x}`}><line x1={px(x)} y1={achseX - 3} x2={px(x)} y2={achseX + 3} stroke={C.tinte} strokeWidth="1" /><text x={px(x)} y={achseX + 14} fontSize="9.5" textAnchor="middle" fill={C.grau}>{x}</text></g>
      ))}
      {achseY !== null && Array.from({ length: Math.floor(y1) - Math.ceil(y0) + 1 }, (_, i) => Math.ceil(y0) + i).filter((y) => y !== 0 && y % schrittY === 0 && y < y1).map((y) => (
        <g key={`ty${y}`}><line x1={achseY - 3} y1={py(y)} x2={achseY + 3} y2={py(y)} stroke={C.tinte} strokeWidth="1" /><text x={achseY - 6} y={py(y) + 3.5} fontSize="9.5" textAnchor="end" fill={C.grau}>{y}</text></g>
      ))}
      <g clipPath={`url(#${clip})`}>{pfade.map((d, i) => <path key={i} d={d} fill="none" stroke={farben[i]} strokeWidth="2.2" strokeLinejoin="round" />)}</g>
    </svg>
  );
}

/* ---------- Das Klausurblatt ---------- */
function Blatt({ k, info, dauer, mitLoesung, druck = false }) {
  const r = rahmen(info);
  const fs = druck ? 1 : 0.95;
  const aufgaben = k.teile.flatMap((t) => t.aufgaben);
  const Kopfzeile = () => (
    <div style={{ padding: druck ? "20px 30px 14px" : "18px 18px 12px", borderBottom: `2px solid ${C.see}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 * fs, fontWeight: 600, color: C.grau }}>
        <span>Mathematik · Klasse {info.klasseLabel} ({info.schulartName})</span>
        <span>{r.art} · Testklausur</span>
      </div>
      <div style={{ fontSize: (druck ? 24 : 21) * fs, fontWeight: 800, letterSpacing: "-0.02em", color: C.tinte, marginTop: 8, lineHeight: 1.2 }}>{info.titel}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 14, fontSize: 12.5 * fs, color: C.grau }}>
        <span style={{ borderBottom: `1px solid ${C.hellgrau}`, paddingBottom: 3 }}>Name:</span>
        <span style={{ borderBottom: `1px solid ${C.hellgrau}`, paddingBottom: 3 }}>Datum:</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 12, fontSize: 12.5 * fs, color: C.tinte }}>
        <span><strong>Zeit:</strong> {dauer} min</span>
        <span><strong>Punkte:</strong> {komma(k.gesamt)} BE</span>
        {k.hilfsmittel && <span><strong>Hilfsmittel:</strong> {k.hilfsmittel}</span>}
      </div>
    </div>
  );
  const AufgabeBlock = ({ a, loesung }) => (
    <div data-pdf-block style={{ padding: druck ? "14px 30px 6px" : "16px 18px 4px", background: C.weiss, color: C.tinte }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 15.5 * fs, fontWeight: 800 }}>Aufgabe {a.nr}{a.titel ? <span style={{ fontWeight: 600, color: C.grau }}> · {a.titel}</span> : null}</span>
        <span style={{ fontSize: 12 * fs, fontWeight: 700, color: C.see, whiteSpace: "nowrap" }}>{komma(a.be)} BE</span>
      </div>
      {a.text && !loesung && <p style={{ margin: "0 0 8px", fontSize: 14.5 * fs, lineHeight: 1.75 }}><TeX s={a.text} /></p>}
      {a.graph && !loesung && <div style={{ maxWidth: druck ? 330 : 340, margin: "0 auto" }}><KlausurGraph g={a.graph} breite={340} /></div>}
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {a.teilaufgaben.map((t, i) => (
          <li key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", columnGap: 6, marginBottom: 8, fontSize: 14.5 * fs, lineHeight: 1.75 }}>
            <span style={{ fontWeight: 700 }}>{String.fromCharCode(97 + i)})</span>
            <span style={{ minWidth: 0 }}>
              {loesung ? <TeX s={t.loesung || "—"} /> : <TeX s={t.text} />}
            </span>
            <span style={{ fontSize: 11.5 * fs, color: C.hellgrau, fontWeight: 600, whiteSpace: "nowrap", paddingTop: 3 }}>{komma(t.be)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
  const Tabelle = () => (
    <div data-pdf-block style={{ padding: druck ? "14px 30px 12px" : "14px 18px 16px", background: C.weiss, overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 12 * fs, color: C.tinte, minWidth: "100%" }}>
        <tbody>
          {[["Aufgabe", ...aufgaben.map((a) => a.nr), "Σ"], ["BE", ...aufgaben.map((a) => komma(a.be)), komma(k.gesamt)], ["erreicht", ...aufgaben.map(() => ""), ""]].map((z, zi) => (
            <tr key={zi}>{z.map((c, ci) => <td key={ci} style={{ border: `1px solid ${C.linie}`, padding: "6px 8px", textAlign: "center", fontWeight: zi === 0 || ci === 0 ? 700 : 500, background: zi === 0 ? C.himmel : C.weiss, minWidth: ci === 0 ? 64 : 30, height: zi === 2 ? 28 : undefined }}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  const Noten = () => {
    const n = notenschluessel(k.gesamt, info.kursstufe);
    return (
      <div data-pdf-block style={{ padding: druck ? "10px 30px 14px" : "6px 18px 16px", background: C.weiss }}>
        <div style={{ fontSize: 12.5 * fs, fontWeight: 700, color: C.tinte, marginBottom: 6 }}>Beispiel-Notenschlüssel {info.kursstufe ? "(Notenpunkte)" : ""}</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${info.kursstufe ? 4 : 3}, minmax(0, 1fr))`, gap: "3px 12px", fontSize: 11.5 * fs, color: C.grau }}>
          {n.map((z) => <span key={z.note}><strong style={{ color: C.tinte }}>{z.note}</strong>: {komma(z.ab)}{z.bis > z.ab ? `–${komma(z.bis)}` : ""} BE</span>)}
        </div>
        <div style={{ fontSize: 10.5 * fs, color: C.hellgrau, marginTop: 6 }}>Jede Schule legt ihren Schlüssel selbst fest.</div>
      </div>
    );
  };
  return (
    <div>
      <div data-pdf-block style={{ background: C.weiss }}>
        {druck && <DruckKopf info={info} rechts={`${r.art} · ${info.titel}`} />}
        <Kopfzeile />
      </div>
      {k.teile.map((t, ti) => (
        <React.Fragment key={ti}>
          {(k.teile.length > 1 || t.name) && (
            <div data-pdf-block data-pdf-mit-naechstem style={{ padding: druck ? "16px 30px 0" : "16px 18px 0", background: C.weiss }}>
              <div style={{ fontSize: 12 * fs, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: ti === 0 ? C.see : C.gruenDunkel }}>{t.name}</div>
            </div>
          )}
          {t.aufgaben.map((a) => <AufgabeBlock key={a.nr} a={a} />)}
        </React.Fragment>
      ))}
      <Tabelle />
      {mitLoesung && (
        <>
          <div data-pdf-block data-pdf-neue-seite data-pdf-mit-naechstem style={{ padding: druck ? "6px 30px 0" : "22px 18px 0", background: C.weiss, borderTop: druck ? "none" : `2px dashed ${C.linie}` }}>
            <div style={{ fontSize: (druck ? 20 : 18) * fs, fontWeight: 800, color: C.tinte }}>Erwartungshorizont</div>
            <div style={{ fontSize: 12.5 * fs, color: C.grau, marginTop: 2 }}>Lösungsskizzen mit Bewertungseinheiten</div>
          </div>
          {aufgaben.map((a) => <AufgabeBlock key={`l${a.nr}`} a={a} loesung />)}
          <Noten />
        </>
      )}
    </div>
  );
}

/* ---------- Auswahl: online bearbeiten oder als PDF ---------- */
function WahlKarte({ k, onOnline, onPdf, pdfLaeuft }) {
  const Weg = ({ onClick, titel, zeile, icon, gold, disabled }) => (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, textAlign: "left", padding: "16px 18px", borderRadius: 16, fontFamily: "inherit", cursor: disabled ? "wait" : "pointer",
        border: gold ? "none" : `2px solid ${C.see}`, background: gold ? GOLD_VERLAUF : C.weiss, color: gold ? C.seeTief : C.see,
        boxShadow: gold ? "0 6px 20px rgba(226,181,60,0.38), inset 0 1px 0 rgba(255,255,255,0.45)" : "none", opacity: disabled ? 0.8 : 1 }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 12, background: gold ? "rgba(14,30,74,0.1)" : C.himmel, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }}>{titel}</span>
        <span style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginTop: 2, color: gold ? "rgba(14,30,74,0.78)" : C.grau, lineHeight: 1.4 }}>{zeile}</span>
      </span>
      <span aria-hidden="true" style={{ fontSize: 24, fontWeight: 700 }}>›</span>
    </button>
  );
  return (
    <div style={{ ...KARTE, padding: 18, marginTop: 22 }} role="group" aria-label="Wie möchtest du die Klausur bearbeiten?">
      <p style={{ ...KICKER, marginBottom: 8 }}>Deine Klausur ist fertig</p>
      <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: C.tinte, letterSpacing: "-0.01em", lineHeight: 1.3 }}>Möchtest du die Klausur jetzt online bearbeiten oder als PDF herunterladen?</p>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: C.grau, lineHeight: 1.55 }}>{k.dauer} min · {komma(k.gesamt)} BE · {k.teile.reduce((s, t) => s + t.aufgaben.length, 0)} Aufgaben</p>
      <div style={{ display: "grid", gap: 10 }}>
        <Weg gold onClick={onOnline} titel="Online bearbeiten" zeile="Mit Uhr und Eingabefeldern. Danach siehst du den Erwartungshorizont und bewertest dich selbst."
          icon={<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="7.5" fill="none" stroke={C.seeTief} strokeWidth="1.9" /><path d="M12 9v4.5l3 1.8M9.5 3h5" fill="none" stroke={C.seeTief} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
        <Weg onClick={onPdf} disabled={pdfLaeuft} titel={pdfLaeuft ? "PDF wird erstellt …" : "Als PDF zum Download"} zeile="Zum Ausdrucken und Rechnen auf Papier, mit Erwartungshorizont und Notenschlüssel."
          icon={<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 20h16" fill="none" stroke={C.see} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
      </div>
    </div>
  );
}

/* ---------- Online bearbeiten ---------- */
const ANTWORTEN = (k) => `matheplus-testklausur-antworten-${k}`;
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function AufgabeOnline({ a, ai, phase, antworten, setAntwort, punkte, setPunkt }) {
  const fertig = phase === "fertig";
  return (
    <div style={{ ...KARTE, padding: "16px 18px", marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 15.5, fontWeight: 800, color: C.tinte }}>Aufgabe {a.nr}{a.titel ? <span style={{ fontWeight: 600, color: C.grau }}> · {a.titel}</span> : null}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.see, whiteSpace: "nowrap" }}>{komma(a.be)} BE</span>
      </div>
      {a.text && <p style={{ margin: "0 0 8px", fontSize: 14.5, lineHeight: 1.75, color: C.tinte }}><TeX s={a.text} /></p>}
      {a.graph && <div style={{ maxWidth: 340, margin: "0 auto" }}><KlausurGraph g={a.graph} breite={340} /></div>}
      {a.teilaufgaben.map((t, ti) => {
        const key = `${ai}-${ti}`;
        const buchstabe = String.fromCharCode(97 + ti);
        return (
          <div key={ti} style={{ marginTop: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", columnGap: 6, fontSize: 14.5, lineHeight: 1.75, color: C.tinte }}>
              <span style={{ fontWeight: 700 }}>{buchstabe})</span>
              <span style={{ minWidth: 0 }}><TeX s={t.text} /></span>
              <span style={{ fontSize: 11.5, color: C.hellgrau, fontWeight: 600, whiteSpace: "nowrap", paddingTop: 3 }}>{komma(t.be)}</span>
            </div>
            <label style={{ display: "block", marginTop: 6 }}>
              <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Deine Antwort zu Aufgabe {a.nr} {buchstabe})</span>
              <textarea value={antworten[key] || ""} onChange={(e) => setAntwort(key, e.target.value)} readOnly={fertig} rows={3}
                placeholder={fertig ? "" : "Dein Rechenweg und deine Antwort …"}
                style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${C.linie}`, background: fertig ? C.sand : C.weiss, fontFamily: "inherit", fontSize: 15, lineHeight: 1.6, color: C.tinte }} />
            </label>
            {fertig && (
              <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 12, background: C.himmel }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.see, marginBottom: 4 }}>Erwartungshorizont</div>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: C.tinte }}><TeX s={t.loesung || "—"} /></div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 13, fontWeight: 600, color: C.grau }}>
                  Deine Punkte
                  <select value={punkte[key] ?? ""} onChange={(e) => setPunkt(key, e.target.value === "" ? null : Number(e.target.value))}
                    style={{ minHeight: 38, padding: "0 10px", borderRadius: 10, border: `1.5px solid ${C.linie}`, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: C.tinte, background: C.weiss }}>
                    <option value="">–</option>
                    {Array.from({ length: t.be + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <span style={{ fontWeight: 500, color: C.hellgrau }}>von {komma(t.be)} BE</span>
                </label>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OnlineKlausur({ k, info, kapitelId, zurWahl, onPdf, pdfLaeuft }) {
  const [phase, setPhase] = useState("bereit");
  const [ende, setEnde] = useState(0);
  const [rest, setRest] = useState(k.dauer * 60);
  const [antworten, setAntworten] = useState(() => { try { return JSON.parse(localStorage.getItem(ANTWORTEN(kapitelId)) || "{}") || {}; } catch (e) { return {}; } });
  const [punkte, setPunkte] = useState({});
  const aufgaben = k.teile.flatMap((t) => t.aufgaben);

  useEffect(() => { try { localStorage.setItem(ANTWORTEN(kapitelId), JSON.stringify(antworten)); } catch (e) { /* privat */ } }, [antworten, kapitelId]);

  useEffect(() => {
    if (phase !== "laeuft") return undefined;
    const tick = () => {
      const s = Math.max(0, Math.round((ende - Date.now()) / 1000));
      setRest(s);
      if (s <= 0) setPhase("fertig");
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [phase, ende]);

  const start = () => { setEnde(Date.now() + k.dauer * 60000); setRest(k.dauer * 60); setPhase("laeuft"); springe("kapitelformeln-ansicht", () => window.scrollTo({ top: 0, behavior: "smooth" })); };
  const neu = () => { setAntworten({}); setPunkte({}); setRest(k.dauer * 60); setPhase("bereit"); };
  const setAntwort = (key, v) => setAntworten((alt) => ({ ...alt, [key]: v }));
  const setPunkt = (key, v) => setPunkte((alt) => { const n = { ...alt }; if (v === null) delete n[key]; else n[key] = v; return n; });

  const summe = Object.values(punkte).reduce((s, x) => s + x, 0);
  const bewertet = Object.keys(punkte).length;
  const anzahlTeil = aufgaben.reduce((s, a) => s + a.teilaufgaben.length, 0);
  const schluessel = notenschluessel(k.gesamt, info.kursstufe);
  const zeile = schluessel.find((z) => summe >= z.ab) || schluessel[schluessel.length - 1];
  const knapp = phase === "laeuft" && rest <= 300;

  return (
    <div style={{ marginTop: 22 }}>
      {phase === "bereit" && (
        <div style={{ ...KARTE, padding: 18 }}>
          <p style={{ ...KICKER, marginBottom: 8 }}>Online bearbeiten</p>
          <p style={{ margin: "0 0 12px", fontSize: 15, color: C.tinte, lineHeight: 1.7 }}>
            Du hast <strong>{k.dauer} Minuten</strong> für <strong>{komma(k.gesamt)} BE</strong>. Schreibe Rechenweg und Antwort in die Felder. Den Erwartungshorizont siehst du erst nach der Abgabe.
            {k.hilfsmittel ? <> Hilfsmittel: {k.hilfsmittel}.</> : null}
          </p>
          <GoldKnopf onClick={start} titel="Klausur starten" zeile="Die Uhr läuft ab dem Klick. Nach Ablauf wird automatisch abgegeben." />
          <button type="button" onClick={zurWahl} style={{ marginTop: 12, background: "none", border: "none", padding: 0, color: C.see, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Doch lieber als PDF</button>
        </div>
      )}

      {phase === "laeuft" && (
        <div style={{ position: "sticky", top: 8, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 16px", borderRadius: 999, background: knapp ? C.signal : C.seeTief, color: C.weiss, boxShadow: "0 4px 16px rgba(15,26,51,0.25)" }}>
          <span role="timer" aria-label={`Noch ${mmss(rest)} Minuten`} style={{ fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{mmss(rest)}</span>
          <button type="button" onClick={() => setPhase("fertig")}
            style={{ minHeight: 38, padding: "0 16px", borderRadius: 999, border: "none", background: C.weiss, color: C.seeTief, fontFamily: "inherit", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Abgeben</button>
        </div>
      )}

      {phase === "fertig" && (
        <div style={{ ...KARTE, padding: 18 }}>
          <p style={{ ...KICKER, marginBottom: 8 }}>Abgegeben</p>
          <p style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: C.tinte, lineHeight: 1.35 }}>
            {bewertet ? <>Du hast dir {komma(summe)} von {komma(k.gesamt)} BE gegeben.</> : "Vergleiche deine Antworten mit dem Erwartungshorizont."}
          </p>
          {bewertet > 0 && (
            <p style={{ margin: "0 0 6px", fontSize: 14, color: C.grau, lineHeight: 1.6 }}>
              Beispiel-Notenschlüssel: {info.kursstufe ? `${zeile.note} Notenpunkte` : `Note ${zeile.note}`}
              {bewertet < anzahlTeil ? ` (bisher ${bewertet} von ${anzahlTeil} Teilaufgaben bewertet)` : ""}. Jede Schule legt ihren Schlüssel selbst fest.
            </p>
          )}
          <p style={{ margin: "0 0 14px", fontSize: 13, color: C.hellgrau, lineHeight: 1.55 }}>Wähle unter jeder Teilaufgabe, wie viele Punkte du bekämst. Sei ehrlich, das bringt dich weiter.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <PdfKnopf onClick={onPdf} laeuft={pdfLaeuft}>PDF mit Lösungen</PdfKnopf>
            <button type="button" onClick={neu} style={{ minHeight: 44, padding: "0 18px", borderRadius: 999, border: `1.5px solid ${C.see}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Noch einmal bearbeiten</button>
          </div>
        </div>
      )}

      {phase !== "bereit" && aufgaben.map((a, ai) => (
        <AufgabeOnline key={a.nr} a={a} ai={ai} phase={phase} antworten={antworten} setAntwort={setAntwort} punkte={punkte} setPunkt={setPunkt} />
      ))}

      {phase === "laeuft" && (
        <button type="button" onClick={() => setPhase("fertig")}
          style={{ width: "100%", marginTop: 16, minHeight: 50, borderRadius: 999, border: "none", background: C.see, color: C.weiss, fontFamily: "inherit", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>Klausur abgeben</button>
      )}
      {phase === "fertig" && (
        <button type="button" onClick={zurWahl} style={{ marginTop: 16, background: "none", border: "none", padding: 0, color: C.see, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Andere Variante wählen</button>
      )}
    </div>
  );
}

function Testklausur({ info, zurueck }) {
  const r = rahmen(info);
  const [dauer, setDauer] = useState(r.dauer);
  const [niveau, setNiveau] = useState("realistisch");
  const [klausur, setKlausur] = useState(() => laden(info.kapitelId));
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [loesung, setLoesung] = useState(false);
  const [pdfLaeuft, setPdfLaeuft] = useState(false);
  const [drucken, setDrucken] = useState(false);
  /* Nach dem Erstellen und beim Öffnen einer gespeicherten Klausur wird immer erst gefragt: online oder PDF */
  const [weg, setWeg] = useState(null);
  const druckRef = useRef(null);
  const obenRef = useRef(null);

  const erstellen = async () => {
    setFehler(""); setLaeuft(true); setLoesung(false); setWeg(null);
    const be = r.be(dauer);
    try {
      const res = await fetch(API_URL, {
        method: "POST", headers: kiKopf(),
        body: JSON.stringify({
          system: systemText(info, dauer, be, niveau), max_tokens: 4000,
          messages: [{ role: "user", content: `Erstelle die ${r.art} zum Kapitel „${info.titel}“ (Klasse ${info.klasseLabel}, ${dauer} Minuten, etwa ${be} BE). Nur JSON.` }],
        }),
      });
      const daten = await kiAntwort(res);
      if (daten.error) throw new Error(daten.error.message || "Mathilda konnte die Klausur gerade nicht erstellen.");
      const text = (daten.content || []).map((x) => (x.type === "text" ? x.text : "")).join("");
      const k = { ...normalisieren(jsonLesen(text)), dauer, niveau, erstellt: Date.now() };
      setKlausur(k); sichern(info.kapitelId, k);
      setTimeout(() => { const el = obenRef.current; if (el) springe("kapitelformeln-klausur", () => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" })); }, 50);
    } catch (e) {
      setFehler(e && e.message ? e.message : "Mathilda ist gerade nicht erreichbar. Bitte gleich noch einmal versuchen.");
    }
    setLaeuft(false);
  };

  const pdf = async () => {
    setPdfLaeuft(true); setDrucken(true);
    try {
      await new Promise((res) => setTimeout(res, 80));
      const wurzel = druckRef.current;
      await pdfAusBloecken({
        bloecke: [...wurzel.querySelectorAll("[data-pdf-block]")],
        kopf: wurzel.querySelector("[data-pdf-kopf]"),
        fuss: `mythosmathe.de · Testklausur · ${info.titel}`,
        dateiname: `Testklausur_${dateiName(info.titel)}.pdf`,
      });
    } catch (e) { setFehler("Das PDF ließ sich gerade nicht erstellen. Bitte noch einmal versuchen."); }
    setDrucken(false); setPdfLaeuft(false);
  };

  const alsPdf = () => { setWeg("pdf"); pdf(); };

  const Chip = ({ an, onClick, children, unter }) => (
    <button type="button" aria-pressed={an} onClick={onClick}
      style={{ flex: 1, minWidth: 0, minHeight: 46, padding: "6px 8px", borderRadius: 12, fontFamily: "inherit", cursor: "pointer", lineHeight: 1.2,
        border: `2px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.tinte }}>
      <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{children}</span>
      {unter && <span style={{ display: "block", fontSize: 11, fontWeight: 500, opacity: 0.8, marginTop: 1 }}>{unter}</span>}
    </button>
  );

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 6 }}>
      <button type="button" onClick={zurueck}
        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "8px 14px 8px 10px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 18 }}>
        ‹ Formelauswahl
      </button>

      <div style={{ ...KARTE, padding: 18 }}>
        <p style={{ ...KICKER, marginBottom: 12 }}>Deine {r.art}</p>
        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: C.grau }}>Bearbeitungszeit</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {r.dauern.map((d) => <Chip key={d} an={dauer === d} onClick={() => setDauer(d)} unter={`ca. ${r.be(d)} BE`}>{d} Minuten</Chip>)}
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: C.grau }}>Niveau</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {NIVEAUS.map((n) => <Chip key={n.id} an={niveau === n.id} onClick={() => setNiveau(n.id)} unter={n.zeile}>{n.name}</Chip>)}
        </div>
        <GoldKnopf onClick={erstellen} disabled={laeuft} titel={laeuft ? "Klausur wird erstellt …" : klausur ? "Neue Testklausur kreieren" : "Testklausur kreieren"}
          zeile={laeuft ? "Mathilda stellt die Aufgaben zusammen und rechnet sie nach – das dauert etwa eine Minute." : `${info.nr ? `Kapitel ${info.nr} · ` : ""}${info.titel}`} />
        {laeuft && (
          <div role="status" aria-label="Klausur wird erstellt" style={{ height: 4, borderRadius: 2, background: C.himmel, overflow: "hidden", marginTop: 14 }}>
            <div className="kf-balken" style={{ height: "100%", width: "40%", borderRadius: 2, background: GOLD_VERLAUF }} />
            <style>{`@keyframes kf-lauf{0%{transform:translateX(-100%)}100%{transform:translateX(260%)}}.kf-balken{animation:kf-lauf 1.4s ease-in-out infinite}`}</style>
          </div>
        )}
        {fehler && <p role="alert" style={{ margin: "12px 0 0", fontSize: 13.5, color: C.signal, lineHeight: 1.55 }}>{fehler}</p>}
        <p style={{ margin: "12px 0 0", fontSize: 12, color: C.hellgrau, lineHeight: 1.55 }}>
          Jede Testklausur ist neu. Rechne auf Papier mit Uhr, dann vergleiche mit dem Erwartungshorizont.
        </p>
      </div>

      {klausur && (
        <div ref={obenRef} style={{ opacity: laeuft ? 0.45 : 1, transition: "opacity .2s" }}>
          {weg === null && <WahlKarte k={klausur} onOnline={() => setWeg("online")} onPdf={alsPdf} pdfLaeuft={pdfLaeuft} />}
          {weg === "online" && <OnlineKlausur key={klausur.erstellt} k={klausur} info={info} kapitelId={info.kapitelId} zurWahl={() => setWeg(null)} onPdf={pdf} pdfLaeuft={pdfLaeuft} />}
          {weg === "pdf" && (
            <div style={{ marginTop: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 13, color: C.grau }}>{klausur.dauer} min · {komma(klausur.gesamt)} BE · {klausur.teile.reduce((s, t) => s + t.aufgaben.length, 0)} Aufgaben</p>
                <PdfKnopf onClick={pdf} laeuft={pdfLaeuft}>PDF mit Lösungen</PdfKnopf>
              </div>
              <div style={{ ...KARTE, overflow: "hidden" }}>
                <Blatt k={klausur} info={info} dauer={klausur.dauer} mitLoesung={loesung} />
              </div>
              <button type="button" onClick={() => setLoesung(!loesung)} aria-expanded={loesung}
                style={{ width: "100%", marginTop: 14, minHeight: 48, borderRadius: 999, border: `1.5px solid ${C.see}`, background: loesung ? C.himmel : C.weiss, color: C.see, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                {loesung ? "Lösungen ausblenden" : "Lösungen und Notenschlüssel zeigen"}
              </button>
              <button type="button" onClick={() => setWeg("online")}
                style={{ marginTop: 14, background: "none", border: "none", padding: 0, color: C.see, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Stattdessen online bearbeiten</button>
            </div>
          )}
          <p style={{ margin: "10px 2px 0", fontSize: 11.5, color: C.hellgrau, lineHeight: 1.55 }}>
            Erstellt von <MathildaName />. Wenn dir eine Lösung komisch vorkommt, frag deine Lehrkraft oder Mathilda – auch eine KI kann sich verrechnen.
          </p>
          {drucken && (
            <div aria-hidden="true" style={{ position: "fixed", left: -10000, top: 0, width: 760, background: C.weiss, fontFamily: "Montserrat, sans-serif" }}>
              <div ref={druckRef}>
                <div data-pdf-kopf><DruckKopf info={info} rechts={`${r.art} · ${info.titel}`} /></div>
                <Blatt k={klausur} info={info} dauer={klausur.dauer} mitLoesung druck />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ======================================================================
   Seite
   ====================================================================== */
export function KapitelFormelnSeite({ ziel, gehe }) {
  const info = useMemo(() => kapitelInfo(ziel), [ziel]);
  const [modus, setModus] = useState(ziel && ziel.modus === "klausur" ? "klausur" : "formeln");
  useEffect(() => { springe("kapitelformeln-ansicht", () => window.scrollTo(0, 0)); }, [modus]);
  if (!info) {
    return (
      <div className="mx-auto px-6" style={{ maxWidth: 620, padding: "60px 24px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.tinte }}>Welches Kapitel?</h1>
        <p style={{ fontSize: 15, color: C.grau, lineHeight: 1.7 }}>Wähle auf der Startseite unter „Dein Status quo“ Schulart, Klasse und Kapitel – dann bekommst du hier genau die passenden Formeln.</p>
        <button type="button" onClick={() => gehe({ ansicht: "start" })}
          style={{ marginTop: 10, minHeight: 46, padding: "0 20px", borderRadius: 999, border: "none", background: C.see, color: C.weiss, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Zur Startseite</button>
      </div>
    );
  }
  return (
    <>
      <Kopf info={info} kicker={kapitelZeile(info)}
        untertitel={modus === "klausur"
          ? `Eine ${rahmen(info).art} genau zu diesem Kapitel – mit Bewertungseinheiten, Erwartungshorizont und PDF.`
          : "Alle Formeln zu diesem Kapitel – und alles aus den Vorjahren, worauf es aufbaut."} />
      {modus === "klausur"
        ? <Testklausur info={info} zurueck={() => setModus("formeln")} />
        : <Formelauswahl info={info} gehe={gehe} zurKlausur={() => setModus("klausur")} />}
    </>
  );
}
