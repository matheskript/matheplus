/* ============================================================
   Integraltrainer (Werkzeug „Integrale“, Pfad /integrale)
   Kombination aus Ableitungstrainer und Polynomplotter:
   · Menü oben: Aufgabentyp (Stammfunktion, durch einen Punkt, bestimmtes
     Integral, Fläche mit der x-Achse, zwischen zwei Graphen, Bestand und
     Änderungsrate), Automatik | Training, Stufe, Würfel
   · Links der Rechenweg als Zeitleiste – im Training Schritt für Schritt
     selbst rechnen (Tastenfeld, Prüfung, gezielte Hinweise, Lösung zeigen),
     in der Automatik steht alles da
   · Rechts das Schaubild: Jeder gelöste Schritt erscheint dort – F unten,
     F(a) und F(b) als Punkte, am Ende wächst die Fläche (funcIntegralBild.jsx)
   Handy: Menü, Aufgabe, Rechenweg direkt darunter. Das Bild zeigt sich beim
   Öffnen kurz und klappt dann zu; „Graph“ in der Aufgabenkarte klappt es
   wieder auf (zwischen Aufgabe und Rechenweg). Die Erklärung zu jedem Schritt
   liegt hinter ⓘ. Desktop ab 840 px: Rechenweg links, Bild rechts mitlaufend.
   Mathe-Kern: integralKern.js. Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { buchen } from "./buchung.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { Eingabe, EingabePopup, Feld, Herleitung, Merke, POP_CSS, PopupWahl, WERK_CSS } from "./funcRegelwerk.jsx";
import { ErklaerAnimation } from "./funcErklaeranimation.jsx";
import { IntZ } from "./ui2.jsx";
import { uebergabeErledigt, uebergabeLesen } from "./uebergabe.js";
import { uebenWunschHolen } from "./uebenWunsch.js";
import { BestandAenderungsrate } from "./funcIntegraleNeu.jsx";
import { springe } from "./sprung.js";
import { IntegralBild } from "./funcIntegralBild.jsx";
import { TYPEN, eigeneAufgabe, hilfeKontext, neueAufgabe, typVon } from "./integralKern.js";

const SPEICHER = "matheplus-integraltrainer";
const blau = `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`;
const MENUE = [...TYPEN.map((t) => ({ id: t.id, name: t.name })), { id: "bestand", name: "Bestand und Änderungsrate" }];
/* Kurznamen für den Knopf auf dem Handy */
const KURZ = { stamm: "Stammfunktion", anfang: "Durch Punkt P", bestimmt: "∫ von a bis b", flaeche: "Fläche + x-Achse", zwei: "Zwei Graphen", bestand: "Bestand" };
const leer = () => ({ text: "", pos: 0, werte: [], status: null, hinweis: "", versuche: 0 });
const fertigStatus = (s) => s === "richtig" || s === "gezeigt";
const HANDY = "(max-width: 839px)";
const istHandy = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(HANDY).matches;
/* Das Bild öffnet sich auf dem Handy einmal je Besuch kurz von selbst */
const BILD_KURZ_MS = 2600;

function lesen() { try { return JSON.parse(window.localStorage.getItem(SPEICHER)) || {}; } catch (e) { return {}; } }
function schreiben(w) { try { window.localStorage.setItem(SPEICHER, JSON.stringify(w)); } catch (e) { /* privat */ } }

const T = ({ s, style }) => <Text s={s} style={{ fontSize: 14.5, fontWeight: 300, color: C.grau, lineHeight: 1.8, margin: "12px 0 0", ...style }} />;

/* ---------- Rechenzeile: Stücke umbrechen nur zwischen den Gleichheitszeichen ---------- */
function Rechenzeile({ z }) {
  return (
    <div className="it-zeile">
      <div className="it-stuecke">{z.k.map((k, i) => <span key={i} className="it-stueck"><M t={k} /></span>)}</div>
      {z.notiz && <Text s={z.notiz} style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.5, margin: "1px 0 0" }} />}
    </div>
  );
}

/* ---------- Eingaben ---------- */
function ZahlEingabe({ label, wert, setWert, onOk, status, anzahl, werte, setWerte }) {
  const rahmen = status === "falsch" ? C.signal : C.linie;
  const feld = { height: 48, borderRadius: 12, border: `1.5px solid ${rahmen}`, padding: "0 10px", fontSize: 17, fontWeight: 700, fontFamily: "inherit", color: C.tinte, background: C.weiss, minWidth: 0, boxSizing: "border-box" };
  const ok = (
    <button type="button" className="it-ok" onClick={onOk}>OK</button>
  );
  if (anzahl) {
    return (
      <div className="it-zahlen">
        {Array.from({ length: anzahl }, (_, i) => (
          <label key={i} className="it-zahlfeld">
            <span><M t={`x_{${i + 1}} =`} /></span>
            <MatheFeld modus="bruch" value={werte[i] || ""} aria-label={`Stelle x${i + 1}`} autoCapitalize="off" autoCorrect="off" spellCheck="false"
              onChange={(e) => { const w = [...werte]; w[i] = e.target.value; setWerte(w); }}
              onKeyDown={(e) => { if (e.key === "Enter") onOk(); }} style={{ ...feld, width: "100%", textAlign: "center" }} />
          </label>
        ))}
        {ok}
      </div>
    );
  }
  return (
    <div className="it-zahlreihe">
      <span className="it-zahllabel"><M t={label} /></span>
      <MatheFeld modus="formel" value={wert} aria-label={label} placeholder="Ergebnis" autoCapitalize="off" autoCorrect="off" spellCheck="false"
        onChange={(e) => setWert(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onOk(); }} style={{ ...feld, flex: "1 1 120px", maxWidth: 220 }} />
      {ok}
    </div>
  );
}

/* ---------- Ein Schritt in der Zeitleiste ---------- */
/* Handy: Schaubild nach oben holen (nur auf Knopfdruck, Sprung-Schalter „integral-bild“) */
const bildOben = () => { const el = document.querySelector(".it-bild"); return el ? Math.max(0, el.getBoundingClientRect().top + window.scrollY - 52) : null; };
const zumBild = () => { const y = bildOben(); if (y !== null) springe("integral-bild", () => window.scrollTo({ top: y, behavior: "smooth" })); };

function Schritt({ nr, s, zustand, st, training, offen, setOffen, aendern, pruefen, zeigen, fokusSetzen, letzter, imBild }) {
  const [infoAuf, setInfoAuf] = useState(false);
  const fertig = zustand === "fertig";
  const aktiv = zustand === "aktiv";
  const zeigeRechnung = !training || fertig || s.art === "info";
  const status = st ? st.status : null;
  const labelTex = (s.label || "").replace(/_(\d)/, "_{$1}");
  return (
    <li className="it-schritt" data-zustand={zustand} onMouseEnter={() => fokusSetzen(s.fokus)} onMouseLeave={() => fokusSetzen(null)}
      onFocus={() => fokusSetzen(s.fokus)}>
      <div className="it-spur" aria-hidden="true">
        <span className="it-nr" data-gezeigt={fertig && training && status === "gezeigt" ? "ja" : undefined}>{fertig && training && status === "richtig" ? "✓" : nr}</span>
        {!letzter && <span className="it-strich" />}
      </div>
      <div className="it-inhalt">
        <div className="it-titelzeile">
          <p className="it-titel">{s.titel}</p>
          {zustand !== "gesperrt" && s.frage && (
            <button type="button" className="it-info" aria-expanded={infoAuf} aria-label={`Erklärung zu „${s.titel}“`} onClick={() => setInfoAuf(!infoAuf)}>i</button>
          )}
        </div>
        {zustand !== "gesperrt" && (
          <div className="it-frage" data-auf={infoAuf ? "ja" : undefined}>
            <Text s={s.frage} style={{ fontSize: 14, color: C.grau, lineHeight: 1.6, margin: "2px 0 0" }} />
          </div>
        )}
        {zustand === "gesperrt" && <p className="it-gesperrt">kommt nach dem vorigen Schritt</p>}

        {training && aktiv && s.art === "term" && (
          <div style={{ marginTop: 10 }}>
            <Feld label={s.label} labelFarbe={C.see} text={st.text} aktiv={offen} status={status} onClick={() => { if (!offen) aendern({ pos: st.text.length }); setOffen(!offen); }}
              pos={st.pos} setPos={(p) => aendern({ pos: p })} platzhalter={s.platzhalter || "hier eingeben …"}
              extra={s.plusC && st.text ? <span style={{ fontSize: 15, color: C.grau, whiteSpace: "nowrap" }}>+ C</span> : null} />
            {offen && (
              <EingabePopup>
                {st.versuche > 0 && <button type="button" className="it-loesung" onClick={zeigen}>Lösung zeigen</button>}
                <Eingabe text={st.text} setText={(t) => aendern({ text: t, status: null, hinweis: "" })} pos={st.pos} setPos={(p) => aendern({ pos: p })} onEnter={pruefen}
                  platzhalter={s.platzhalter} />
              </EingabePopup>
            )}
          </div>
        )}
        {training && aktiv && (s.art === "zahl" || s.art === "zahlen") && (
          <div style={{ marginTop: 10 }}>
            <ZahlEingabe label={labelTex} wert={st.text} setWert={(t) => aendern({ text: t, status: null, hinweis: "" })} onOk={pruefen} status={status}
              anzahl={s.art === "zahlen" ? s.anzahl : 0} werte={st.werte} setWerte={(w) => aendern({ werte: w, status: null, hinweis: "" })} />
            {st.versuche > 0 && <button type="button" className="it-loesung klein" onClick={zeigen}>Lösung zeigen</button>}
          </div>
        )}
        {st && st.hinweis && (
          <div className="it-hinweis" data-gut={status === "richtig" ? "ja" : undefined} role={status === "falsch" ? "alert" : undefined}>
            <Text s={st.hinweis} style={{ fontSize: 13.5, lineHeight: 1.6, margin: 0, color: "inherit" }} />
          </div>
        )}
        {zeigeRechnung && zustand !== "gesperrt" && (
          <div className="it-rechnung" data-gezeigt={status === "gezeigt" ? "ja" : undefined}>
            {status === "gezeigt" && <p className="it-loesungsmarke">Lösung</p>}
            {s.zeilen.map((z, i) => <Rechenzeile key={i} z={z} />)}
          </div>
        )}
        {training && fertig && s.fokus && s.art !== "info" && (
          <button type="button" className="it-zumbild" onClick={imBild}><span aria-hidden="true">↑</span> Im Bild ansehen</button>
        )}
      </div>
    </li>
  );
}

/* ---------- Herleitungen je Typ ---------- */
function Erklaerung({ typ }) {
  if (typ === "stamm") return (
    <Herleitung titel="Warum „+ C“ – und was F′ = f im Bild bedeutet" untertitel="Stammfunktion, Konstante, Tangenten">
      <T s="Beim Ableiten fällt jede Konstante weg: $(x^{3} + 5)′ = 3x^{2}$ und $(x^{3} − 2)′ = 3x^{2}$. Deshalb hat $f(x) = 3x^{2}$ unendlich viele Stammfunktionen – sie unterscheiden sich nur um eine Konstante C. Im Bild unten liegen sie übereinander wie Kopien, nur nach oben oder unten verschoben." />
      <T s="Schieb die Stelle $x_{0}$: Alle Tangenten an die Schar sind parallel, ihre Steigung ist genau $f(x_{0})$ – oben im Bild die Höhe von f. Das ist $F′ = f$." />
      <Merke kopf="Regeln rückwärts" s="$\int x^{n} \,dx = \frac{x^{n+1}}{n+1} + C$ für $n \neq −1$, $\int \frac{1}{x} \,dx = \ln|x| + C$, $\int \sin(x) \,dx = −\cos(x) + C$, $\int \cos(x) \,dx = \sin(x) + C$, $\int e^{x} \,dx = e^{x} + C$. Bei $f(mx + c)$ zusätzlich durch m teilen." />
    </Herleitung>
  );
  if (typ === "anfang") return (
    <Herleitung titel="Ein Punkt wählt genau eine Stammfunktion aus" untertitel="Anfangsbedingung, Schar, C">
      <T s="Alle Stammfunktionen $F(x) = F_{0}(x) + C$ sind verschobene Kopien. Durch einen Punkt $P(x_{0} | y_{0})$ geht genau eine davon – die mit $F_{0}(x_{0}) + C = y_{0}$." />
      <Merke kopf="Rezept" s="Stammfunktion mit $+ C$ bilden, $x_{0}$ einsetzen, gleich $y_{0}$ setzen und nach C auflösen: $C = y_{0} − F_{0}(x_{0})$." />
    </Herleitung>
  );
  if (typ === "bestimmt") return (
    <Herleitung titel="Der Hauptsatz – warum die Fläche F(b) − F(a) ist" untertitel="Flächenfunktion, schmale Streifen, Stammfunktion">
      <T s="Lass die rechte Grenze t von a aus wandern und miss die Fläche $A(t)$ unter f. Schiebst du t um ein winziges Stück $Δt$ weiter, kommt ein schmaler Streifen dazu: ungefähr ein Rechteck der Höhe $f(t)$ und der Breite $Δt$." />
      <T s="Also $A(t + Δt) − A(t) ≈ f(t) \cdot Δt$, und nach Division durch $Δt$ im Grenzfall $A′(t) = f(t)$. Die Flächenfunktion ist eine Stammfunktion von f – mit $A(a) = 0$." />
      <T s="Jede andere Stammfunktion F unterscheidet sich nur um eine Konstante: $A(t) = F(t) − F(a)$. Für $t = b$ steht da der Hauptsatz – und genau das zeigt das Bild: Die Fläche oben ist der Höhenunterschied von F unten." />
      <Merke kopf="Hauptsatz" s="$\int_{a}^{b} f(x) \,dx = F(b) − F(a)$, wenn f auf $[a; b]$ stetig ist und $F′ = f$ gilt. Flächen unter der x-Achse zählen dabei negativ – das Integral ist eine Bilanz." />
    </Herleitung>
  );
  if (typ === "flaeche") return (
    <Herleitung titel="Bilanz oder Fläche?" untertitel="Warum man an den Nullstellen trennt">
      <T s="Das Integral zählt Flächen unter der x-Achse negativ. Integrierst du einfach über alles, heben sich Teile auf – heraus kommt die Bilanz, nicht der Flächeninhalt." />
      <T s="Darum: Nullstellen bestimmen, an ihnen trennen, jedes Teilintegral einzeln ausrechnen und die Beträge addieren. Im Bild ist jede Teilfläche eingefärbt: grün über, rot unter der x-Achse." />
      <Merke kopf="Rezept" s="$A = |I_{1}| + |I_{2}| + …$ mit den Teilintegralen zwischen benachbarten Nullstellen (und den Grenzen a, b)." />
    </Herleitung>
  );
  if (typ === "zwei") return (
    <Herleitung titel="Warum man mit d = f − g rechnet" untertitel="Differenzfunktion, Schnittstellen, gleiche Fläche">
      <T s="Die Höhe der Fläche an der Stelle x ist der Abstand $f(x) − g(x)$. Ziehst du von beiden Graphen g ab, wird g zur x-Achse und f zu $d = f − g$ – die Höhen bleiben gleich, also auch die Fläche. Probier es mit dem Regler unter dem Bild." />
      <Merke kopf="Rezept" s="$d(x) = f(x) − g(x)$ bilden, Nullstellen von d sind die Schnittstellen, dann wie bei „Fläche mit der x-Achse“: $A = |I_{1}| + |I_{2}| + …$" />
    </Herleitung>
  );
  return null;
}

/* ---------- Seite ---------- */

export function IntegralTrainer() {
  // Übergabe aus der Kurvendiskussion: { f, a, b } → bestimmtes Integral mit dieser Funktion
  const [start] = useState(() => {
    const u = uebergabeLesen("integrale");
    if (!u || !u.f || u.a === undefined || u.b === undefined) return null;
    const a = eigeneAufgabe("bestimmt", { f: u.f, a: String(u.a), b: String(u.b) });
    return a.fehler ? { fehler: a.fehler } : { aufgabe: a, f: u.f, a: String(u.a), b: String(u.b) };
  });
  useEffect(() => { uebergabeErledigt("integrale"); }, []);
  const [wunsch] = useState(() => (start ? null : uebenWunschHolen("integrale")));
  const gemerkt = useMemo(lesen, []);

  const startTyp = start && start.aufgabe ? "bestimmt" : wunsch && MENUE.some((m) => m.id === wunsch.art) ? wunsch.art : MENUE.some((m) => m.id === gemerkt.typ) ? gemerkt.typ : "bestimmt";
  const [typ, setTyp] = useState(startTyp);
  const [stufen, setStufen] = useState(() => gemerkt.stufen || {});
  const [modus, setModus] = useState(() => (wunsch && (wunsch.modus === "auto" || wunsch.modus === "training") ? wunsch.modus : gemerkt.modus === "auto" ? "auto" : "training"));
  const [eigen, setEigen] = useState(() => (start && start.aufgabe ? { f: start.f, a: start.a, b: start.b } : null));
  const [eigenOffen, setEigenOffen] = useState(false);
  const stufe = stufen[typ] || 1;
  const [aufgabe, setAufgabe] = useState(() => (start && start.aufgabe ? start.aufgabe : typ === "bestand" ? null : neueAufgabe(typ, stufe)));
  const [nr, setNr] = useState(0);
  const [stand, setStand] = useState({});
  const [offen, setOffen] = useState(false);
  const [hover, setHover] = useState(null);
  const [bilanz, setBilanz] = useState({ richtig: 0, gesamt: 0 });
  /* Handy: Bild einklappbar; beim ersten Öffnen kurz zeigen, dann zu */
  const [bildAuf, setBildAuf] = useState(true);
  const bildUhr = useRef(null);
  useEffect(() => {
    if (!istHandy()) return undefined;
    bildUhr.current = setTimeout(() => { bildUhr.current = null; setBildAuf(false); }, BILD_KURZ_MS);
    return () => { if (bildUhr.current) clearTimeout(bildUhr.current); };
  }, []);
  const bildSchalten = (auf) => { if (bildUhr.current) { clearTimeout(bildUhr.current); bildUhr.current = null; } setBildAuf(auf); };
  const imBild = () => {
    if (!bildAuf) { bildSchalten(true); setTimeout(zumBild, 380); } else zumBild();
  };
  const [meldung, setMeldung] = useState(start && start.fehler ? `Die übergebene Funktion geht hier nicht: ${start.fehler}` : start ? "f und die Grenzen sind übernommen. Bilde jetzt die Stammfunktion." : "");

  useEffect(() => { schreiben({ typ, stufen, modus }); }, [typ, stufen, modus]);

  const training = modus === "training";

  /* Seitenposition festhalten, wenn sich oben etwas ändert (kein Springen) */
  const festhalten = (fn) => {
    const y = window.scrollY;
    fn();
    const zurueck = () => window.scrollTo(0, y);   // sprung-frei: hält die Position fest
    requestAnimationFrame(() => { zurueck(); requestAnimationFrame(zurueck); });
    setTimeout(zurueck, 80);
  };
  const setze = (a) => { setAufgabe(a); setStand({}); setOffen(false); setHover(null); setNr((n) => n + 1); };
  const neu = (t = typ, st = stufe) => { if (t === "bestand") { setAufgabe(null); return; } setEigen(null); setMeldung(""); setze(neueAufgabe(t, st)); };
  const waehleTyp = (id) => festhalten(() => { setTyp(id); setEigenOffen(false); neu(id, stufen[id] || 1); });
  const waehleStufe = (st) => festhalten(() => {
    if (st === "eigen") { setEigenOffen(true); return; }
    setStufen((s) => ({ ...s, [typ]: st })); setEigenOffen(false); neu(typ, st);
  });
  const waehleModus = (m) => festhalten(() => { setModus(m); setStand({}); setOffen(false); });

  const schritte = aufgabe && !aufgabe.fehler ? aufgabe.schritte : [];
  const erledigt = (s) => s.art === "info" || fertigStatus(stand[s.id] && stand[s.id].status);
  const aktivIndex = training ? schritte.findIndex((s) => !erledigt(s)) : -1;
  const alleFertig = training ? aktivIndex === -1 : true;
  const aktivSchritt = aktivIndex >= 0 ? schritte[aktivIndex] : null;
  const zustandVon = (i) => {
    if (!training) return "fertig";
    if (aktivIndex === -1 || i < aktivIndex) return "fertig";
    if (i === aktivIndex) return "aktiv";
    // Info-Schritte direkt nach dem aktiven bleiben zu
    return "gesperrt";
  };

  /* Was das Bild schon zeigen darf */
  const sicht = useMemo(() => {
    if (!aufgabe || aufgabe.fehler) return {};
    const da = (id) => !training || (() => { const i = schritte.findIndex((s) => s.id === id); return i >= 0 && (aktivIndex === -1 || i < aktivIndex); })();
    const teile = (aufgabe.bild.teile || []).map((_, i) => da(`I${i + 1}`));
    return {
      F: da("F"), Fb: da("Fb"), Fa: da("Fa"), I: da("I"), null: da("null"), teile, A: da("A"), d: da("d"),
      schar: da("F"), punkt: true, kurve: da("C"),
    };
  }, [aufgabe, stand, training]); // eslint-disable-line react-hooks/exhaustive-deps
  const fokus = hover || (aktivSchritt ? aktivSchritt.fokus : null);

  /* Eingaben */
  const st = (id) => stand[id] || leer();
  const aendern = (id) => (teil) => setStand((s) => ({ ...s, [id]: { ...(s[id] || leer()), ...teil } }));
  const pruefen = (s) => () => {
    const e = st(s.id);
    const erg = s.art === "zahlen" ? s.pruefen(Array.from({ length: s.anzahl }, (_, i) => e.werte[i] || "")) : s.pruefen(e.text);
    if (erg.unvollstaendig) { aendern(s.id)({ status: "falsch", hinweis: erg.hinweis }); return; }
    setBilanz((b) => ({ richtig: b.richtig + (erg.ok ? 1 : 0), gesamt: b.gesamt + 1 }));
    buchen({ richtig: !!erg.ok, gruppe: `integral-${aufgabe.typ}-${s.id.replace(/\d+$/, "")}`, stufe: aufgabe.stufe || null, art: aufgabe.typ });
    if (erg.ok) { aendern(s.id)({ status: "richtig", hinweis: erg.hinweis || "" }); setOffen(false); }
    else aendern(s.id)({ status: "falsch", hinweis: erg.hinweis, versuche: e.versuche + 1 });
  };
  const zeigen = (s) => () => { aendern(s.id)({ status: "gezeigt", hinweis: "" }); setOffen(false); };

  /* Eigene Funktion */
  const [eF, setEF] = useState(() => (eigen ? eigen.f : ""));
  const [eFPos, setEFPos] = useState(0);
  const [eA, setEA] = useState(() => (eigen ? eigen.a : "0"));
  const [eB, setEB] = useState(() => (eigen ? eigen.b : "2"));
  const [eFehler, setEFehler] = useState("");
  const [eTasten, setETasten] = useState(true);
  const uebernehmen = () => {
    const a = eigeneAufgabe(typ, { f: eF, a: eA, b: eB });
    if (a.fehler) { setEFehler(a.fehler); return; }
    setEFehler(""); setEigen({ f: eF, a: eA, b: eB }); setEigenOffen(false); setMeldung(""); setze(a);
  };

  const typInfo = typ === "bestand" ? null : typVon(typ);
  const stufenOptionen = typInfo ? [...typInfo.stufen.map((n, i) => ({ id: i + 1, name: `Stufe ${i + 1} · ${n}` })), ...(typInfo.eigen ? [{ id: "eigen", name: "Eigene Funktion" }] : [])] : [];
  const stufeKopf = eigen && aufgabe && aufgabe.eigen ? "Eigene" : `Stufe ${stufe}`;
  const kopf = aufgabe && !aufgabe.fehler ? aufgabe.kopf : null;

  /* ---------- Teile ---------- */
  const menue = (
    <div className="it-kopf">
      <div className="it-links">
        <div className="abl-seg" role="group" aria-label="Modus">
          {[["auto", "Rechnen"], ["training", "Trainieren"]].map(([id, name]) => (
            <button key={id} type="button" aria-pressed={modus === id} disabled={typ === "bestand"} onClick={() => waehleModus(id)}>{name}</button>
          ))}
        </div>
        <div className="abl-reihe">
          <PopupWahl className={`abl-stufe${typ === "bestand" ? " aus" : ""}`} wert={eigen && aufgabe && aufgabe.eigen ? "eigen" : stufe} label="Stufe wählen" optionen={stufenOptionen}
            kopf={() => stufeKopf} onWaehle={waehleStufe} />
          <button type="button" className="abl-wuerfel" onClick={() => festhalten(() => neu())} disabled={typ === "bestand"} aria-label="Neue Aufgabe würfeln" title="Neue Aufgabe">
            <span aria-hidden="true">🎲</span>
          </button>
        </div>
      </div>
      <div className="abl-wahl it-wahl">
        <span><span className="it-int" aria-hidden="true">∫</span> Integrieren üben</span>
        <PopupWahl className="abl-regelmenue" knopfClass="abl-regelknopf" rechts wert={typ} label="Welche Aufgabe möchtest du üben?" optionen={MENUE} onWaehle={waehleTyp}
          kopf={(o) => <><span className="it-kurzname">{KURZ[typ]}</span><span className="it-langname">{o ? o.name : ""}</span></>} />
      </div>
    </div>
  );

  const eigenKarte = eigenOffen && typInfo && typInfo.eigen && (
    <div className="it-karte" style={{ marginBottom: 14 }}>
      <p className="it-titel" style={{ marginBottom: 6 }}>Eigene Funktion</p>
      <p style={{ fontSize: 13.5, color: C.grau, marginBottom: 10 }}>{typ === "stamm" ? "Gib f ein – der Trainer bildet die Stammfunktion." : "Gib f und die Grenzen ein – auch π, e oder Brüche wie 1/2."}</p>
      <Feld label="f(x) =" labelFarbe={C.see} text={eF} aktiv={eTasten} onClick={() => setETasten(!eTasten)} pos={eFPos} setPos={setEFPos} platzhalter="f eingeben …" />
      {eTasten && <EingabePopup><Eingabe text={eF} setText={setEF} pos={eFPos} setPos={setEFPos} onEnter={uebernehmen} platzhalter="z. B. x^2-4 oder sin(x)" /></EingabePopup>}
      {typ === "bestimmt" && (
        <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          {[["a", eA, setEA], ["b", eB, setEB]].map(([n, w, setW]) => (
            <label key={n} style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 16, color: C.tinte }}>{n} =
              <MatheFeld modus="formel" value={w} onChange={(e) => setW(e.target.value)} aria-label={`Grenze ${n}`} autoCapitalize="off" autoCorrect="off" spellCheck="false"
                style={{ width: 90, height: 44, borderRadius: 12, border: `1.5px solid ${C.linie}`, padding: "0 10px", fontSize: 16, fontWeight: 600, fontFamily: "inherit", textAlign: "center" }} />
            </label>
          ))}
        </div>
      )}
      {eFehler && <p role="alert" style={{ fontSize: 13.5, color: C.signal, lineHeight: 1.6, marginTop: 10 }}>{eFehler}</p>}
      <button type="button" onClick={uebernehmen} className="it-gross gold" style={{ marginTop: 12 }}>Übernehmen</button>
    </div>
  );

  const aufgabeKarte = kopf && (
    <div className="it-aufgabe">
      <div className="it-aufgabe-oben">
        <div style={{ minWidth: 0 }}>
          <p className="it-kicker">{kopf.kicker}{aufgabe.eigen ? " · eigene Funktion" : typInfo ? ` · Stufe ${aufgabe.stufe}` : ""}</p>
          <Text s={kopf.satz} style={{ fontSize: 14.5, color: C.weiss, lineHeight: 1.55, margin: "2px 0 0", fontWeight: 500 }} />
        </div>
        <button type="button" className="it-neu" aria-label={aufgabe.eigen ? "Funktion ändern" : "Neue Aufgabe"} onClick={() => festhalten(() => (aufgabe.eigen ? setEigenOffen(true) : neu()))}>
          <span aria-hidden="true">↻</span><span>{aufgabe.eigen ? "Ändern" : <>Neu<span className="it-neu-lang">e Aufgabe</span></>}</span>
        </button>
      </div>
      <div className="it-formel">
        {kopf.int ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><IntZ a={<M t={kopf.int.a} />} b={<M t={kopf.int.b} />} gross /><M t={`${kopf.int.inner}\\,dx`} /></span>
        ) : kopf.formel && aufgabe.typ === "stamm" ? <M t={kopf.formel} /> : (
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(kopf.funktionen || []).map((f) => (
              <span key={f.name} style={{ whiteSpace: "nowrap" }}><span style={{ color: f.name === "g" ? C.flaggold : C.weiss }}><M t={`${f.name}(x)`} /></span> <M t={`= ${f.tex}`} /></span>
            ))}
          </span>
        )}
        {kopf.punkt && <span className="it-punkt"><M t={kopf.punkt} /></span>}
        <button type="button" className="it-graphknopf" aria-expanded={bildAuf} aria-controls="it-bild" onClick={() => bildSchalten(!bildAuf)}>
          <span>Graph</span>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      {training && bilanz.gesamt > 0 && <p className="it-bilanz">{bilanz.richtig} von {bilanz.gesamt} Eingaben richtig</p>}
    </div>
  );

  const rechenweg = aufgabe && !aufgabe.fehler && (
    <div className="it-weg">
      <ol className="it-liste">
        {schritte.map((s, i) => (
          <Schritt key={`${nr}-${s.id}`} nr={i + 1} s={s} zustand={zustandVon(i)} st={st(s.id)} training={training}
            offen={offen && aktivIndex === i} setOffen={setOffen} aendern={aendern(s.id)} pruefen={pruefen(s)} zeigen={zeigen(s)}
            fokusSetzen={(f) => { if (!training) setHover(f); }} letzter={i === schritte.length - 1} imBild={imBild} />
        ))}
      </ol>
      {alleFertig && (
        <div className="it-ergebnis">
          <p className="it-kicker" style={{ color: C.gruenDunkel }}>Ergebnis</p>
          <div className="it-ergebnis-wert">
            {aufgabe.typ === "bestimmt" && kopf.int
              ? <M t={`\\int_{${kopf.int.a}}^{${kopf.int.b}} ${kopf.int.inner}\\,dx ${/^≈/.test(aufgabe.ergebnis.tex) ? "" : "= "}${aufgabe.ergebnis.tex}`} />
              : aufgabe.typ === "flaeche" || aufgabe.typ === "zwei" ? <M t={`A = ${aufgabe.ergebnis.tex}`} /> : <M t={aufgabe.ergebnis.tex} />}
            {aufgabe.ergebnis.naeherung && <span className="it-naeh"><M t={`≈ ${aufgabe.ergebnis.naeherung}`} /></span>}
            {aufgabe.ergebnis.einheit && <span className="it-naeh">FE</span>}
          </div>
          {training && (
            <>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.smaragd, margin: "10px 0 0" }}>
                {schritte.filter((s) => s.art !== "info").every((s) => st(s.id).status === "richtig") ? "Alles selbst gerechnet – stark! 🎉" : "Geschafft – der Rechenweg steht."}
              </p>
              <button type="button" className="it-gross blau" onClick={() => festhalten(() => (aufgabe.eigen ? setEigenOffen(true) : neu()))} style={{ marginTop: 12 }}>
                {aufgabe.eigen ? "Andere Funktion" : "Neue Aufgabe"}
              </button>
            </>
          )}
        </div>
      )}
      {training && !alleFertig && aktivSchritt && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}><IchHaengeFest kontext={hilfeKontext(aufgabe, aktivSchritt.id)} /></div>
      )}
    </div>
  );

  const bildTeil = aufgabe && !aufgabe.fehler && (
    <div className="it-bild" id="it-bild" data-zu={bildAuf ? undefined : "ja"} aria-hidden={bildAuf ? undefined : true}>
      <div className="it-bild-innen">
        <IntegralBild bild={aufgabe.bild} sicht={sicht} fokus={fokus} aufgabeId={nr} />
      </div>
    </div>
  );

  return (
    <div className="abl-seite it-seite">
      <style>{POP_CSS}</style>
      <style>{WERK_CSS}</style>
      <style>{IT_CSS}</style>
      <div className="abl-innen">
        {menue}
        {meldung && <p className="it-meldung">{meldung}</p>}
        {typ === "bestand" ? (
          <BestandAenderungsrate />
        ) : (
          <>
            {eigenKarte}
            {aufgabe && aufgabe.fehler && <p role="alert" className="it-meldung" style={{ color: C.signal }}>{aufgabe.fehler}</p>}
            {aufgabeKarte}
            <div className="it-raster">
              {bildTeil}
              {rechenweg}
            </div>
            {(typ === "stamm" || typ === "bestimmt") && <ErklaerAnimation key={typ} art={typ === "stamm" ? "stamm" : "integral"} kompakt style={{ marginTop: 18 }} />}
            <Erklaerung typ={typ} />
          </>
        )}
      </div>
    </div>
  );
}

/* Stile: Kopf wie im Ableitungstrainer (abl-*), dazu die Zeitleiste und das Raster */
const IT_CSS = `
.abl-seite{background:#fff}[data-trainings-session] .abl-seite{min-height:calc(100dvh - 61px)}
.abl-seite,.abl-seite *{overflow-anchor:none}
.abl-innen{max-width:620px;margin:0 auto;padding:14px 16px 48px}
.abl-reihe{display:flex;gap:8px;align-items:stretch;flex:1;min-height:42px}
.abl-seg{display:flex;padding:3px;border-radius:999px;background:#EEF2F8;gap:2px;flex:1;min-height:42px}
.abl-seg button{flex:1;min-width:0;border-radius:999px;border:none;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;background:transparent;color:${C.grau};white-space:nowrap;padding:0 6px}
.abl-seg button[aria-pressed="true"]{background:#fff;color:${C.see};box-shadow:0 1px 6px rgba(15,26,51,0.12)}
.abl-seg button:disabled{opacity:.45;cursor:default}
.abl-stufe{flex:1;min-width:0;display:flex}
.abl-stufe .wk-pop-knopf{flex:1;min-width:0;height:auto;min-height:42px;justify-content:space-between;padding:0 12px 0 14px;font-size:14.5px}
.abl-stufe.aus{opacity:.4;pointer-events:none}
.abl-stufe .wk-pop-liste{min-width:250px}
.abl-wuerfel{width:46px;flex-shrink:0;padding:0;border-radius:999px;border:none;cursor:pointer;background:${C.flaggold};font-size:22px;line-height:1;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(15,26,51,0.14)}
.abl-wuerfel:disabled{opacity:.4;cursor:default}
.abl-wahl{min-width:0;border-radius:18px;background:${blau};color:#fff;box-shadow:0 4px 12px rgba(0,77,152,0.25);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px;text-align:center}
.abl-wahl>span{font-size:15.5px;font-weight:700;line-height:1.2}
.abl-regelmenue{max-width:100%}
.abl-wahl .abl-regelknopf{height:34px;padding:0 6px 0 10px;gap:6px;border:none;background:transparent;color:${C.goldText};font-size:13.5px;font-weight:600;max-width:100%}
.abl-wahl .abl-regelknopf span{overflow:hidden;text-overflow:ellipsis}
.abl-wahl .wk-pop-liste{min-width:270px}
.it-int{font-size:19px;font-weight:300;color:${C.flaggold};margin-right:2px}
.it-wahl>span{white-space:nowrap}
.it-wahl .abl-regelknopf{font-size:13px;padding:0 4px 0 8px}
.it-langname{display:none}
.it-kopf{display:grid;grid-template-columns:1.18fr 1fr;gap:8px;align-items:stretch;margin-bottom:14px}
.it-links{display:flex;flex-direction:column;gap:8px;min-width:0}
.it-meldung{font-size:13.5px;color:${C.see};font-weight:600;line-height:1.55;margin:0 2px 12px}
.it-karte{background:#fff;border:1px solid ${C.linie};border-radius:16px;padding:16px}
.it-titel{font-size:11.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:${C.see};margin:0}
.it-aufgabe{background:${blau};border-radius:18px;padding:14px 16px 16px;color:#fff;box-shadow:0 4px 16px rgba(0,77,152,0.22);margin-bottom:14px}
.it-aufgabe-oben{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.it-kicker{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${C.goldText};margin:0}
.it-neu{flex-shrink:0;height:40px;padding:0 14px;border-radius:999px;border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;color:${C.seeTief};background:${C.flaggold};display:inline-flex;align-items:center;gap:7px}
.it-neu>span[aria-hidden]{font-size:17px;line-height:1}
@media (max-width:600px){.it-neu-lang{display:none}.it-neu{padding:0 12px}}
.it-formel{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px 14px;margin-top:10px;font-size:23px;font-weight:700;line-height:1.75;overflow-x:auto}
.it-punkt{font-size:16px;font-weight:700;color:${C.seeTief};background:${C.flaggold};border-radius:999px;padding:2px 12px;white-space:nowrap}
.it-bilanz{font-size:12px;color:${C.goldText};margin:6px 0 0}
.it-raster{display:flex;flex-direction:column;gap:16px}
.it-bild{min-width:0;display:grid;grid-template-rows:1fr;transition:grid-template-rows .45s ease,opacity .35s ease,margin .45s ease}
.it-bild-innen{min-height:0;overflow:hidden}
.it-bild[data-zu="ja"]{grid-template-rows:0fr;opacity:0;margin-bottom:-16px;visibility:hidden;transition:grid-template-rows .45s ease,opacity .3s ease,margin .45s ease,visibility 0s .45s}
.it-graphknopf{margin-left:auto;align-self:flex-end;height:34px;padding:0 10px 0 13px;border-radius:999px;border:1.5px solid rgba(255,255,255,0.45);background:rgba(255,255,255,0.08);color:#fff;font-family:inherit;font-size:13.5px;font-weight:700;letter-spacing:.01em;cursor:pointer;display:inline-flex;align-items:center;gap:6px;line-height:1}
.it-graphknopf svg{transition:transform .3s ease}
.it-graphknopf[aria-expanded="true"] svg{transform:rotate(180deg)}
.it-titelzeile{display:flex;align-items:center;gap:8px}
.it-info{width:20px;height:20px;flex-shrink:0;border-radius:999px;border:1.5px solid ${C.see};background:#fff;color:${C.see};font-family:Georgia,"Times New Roman",serif;font-style:italic;font-size:12px;font-weight:700;line-height:1;padding:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.it-info[aria-expanded="true"]{background:${C.see};color:#fff}
.it-schritt[data-zustand="gesperrt"] .it-info{display:none}
.it-frage{display:none}
.it-frage[data-auf="ja"]{display:block}
.it-weg{min-width:0}
.it-liste{list-style:none;margin:0;padding:0}
.it-schritt{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px}
.it-spur{display:flex;flex-direction:column;align-items:center}
.it-nr{width:28px;height:28px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;background:#EEF2F8;color:${C.grau};border:1.5px solid ${C.linie}}
.it-strich{flex:1;width:2px;background:${C.linie};margin:4px 0;min-height:14px}
.it-schritt[data-zustand="aktiv"] .it-nr{background:${C.see};color:#fff;border-color:${C.see};box-shadow:0 0 0 4px rgba(0,77,152,0.14)}
.it-schritt[data-zustand="fertig"] .it-nr{background:${C.smaragd};color:#fff;border-color:${C.smaragd}}
.it-schritt[data-zustand="fertig"] .it-strich{background:${C.smaragd};opacity:.45}
.it-schritt[data-zustand="fertig"] .it-nr[data-gezeigt="ja"]{background:#fff;color:${C.grau};border-color:${C.hellgrau}}
.it-inhalt{min-width:0;padding:3px 0 18px}
.it-schritt[data-zustand="gesperrt"] .it-titel{color:${C.hellgrau}}
.it-gesperrt{font-size:12.5px;color:${C.hellgrau};margin:2px 0 0}
.it-rechnung{background:${C.sand};border:1px solid ${C.linie};border-radius:14px;padding:8px 12px;margin-top:10px}
.it-rechnung[data-gezeigt="ja"]{background:#F7F8FB}
.it-loesungsmarke{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${C.grau};margin:0 0 2px}
.it-zeile{padding:4px 0}
.it-zeile+.it-zeile{border-top:1px dashed ${C.linie}}
.it-stuecke{display:flex;flex-wrap:wrap;align-items:center;column-gap:8px;row-gap:0;font-size:17.5px;line-height:1.95;color:${C.tinte}}
.it-stueck{white-space:nowrap;display:inline-flex;align-items:center}
.it-hinweis{margin-top:8px;padding:8px 12px;border-radius:12px;background:#FBF1EC;color:${C.signal};border:1px solid #F0D5C7}
.it-hinweis[data-gut="ja"]{background:#EEF8F2;color:${C.smaragd};border-color:#CFE8DA}
.it-loesung{width:100%;height:44px;margin-bottom:10px;border-radius:14px;border:1.5px solid ${C.linie};cursor:pointer;font-family:inherit;font-size:14.5px;font-weight:600;color:${C.see};background:#fff}
.it-loesung.klein{width:auto;height:36px;padding:0 14px;margin:8px 0 0;font-size:13.5px}
.it-zahlreihe{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.it-zahllabel{font-size:17px;font-weight:700;color:${C.tinte};white-space:nowrap}
.it-zahlen{display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap}
.it-zahlfeld{display:flex;flex-direction:column;gap:2px;flex:1 1 72px;max-width:110px;font-size:14px;font-weight:700;color:${C.tinte}}
.it-zumbild{margin-top:8px;height:32px;padding:0 12px;border-radius:999px;border:1px solid ${C.linie};background:#fff;color:${C.see};font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.it-ok{height:48px;padding:0 20px;border-radius:12px;border:none;cursor:pointer;font-family:inherit;font-size:16px;font-weight:800;color:#fff;background:${C.smaragd};box-shadow:0 4px 14px rgba(47,143,91,0.3)}
.it-ergebnis{border:1.5px solid #CFE8DA;background:#F3FAF6;border-radius:16px;padding:14px 16px;margin:4px 0 0 40px}
.it-ergebnis-wert{display:flex;align-items:center;flex-wrap:wrap;gap:4px 14px;font-size:22px;font-weight:700;color:${C.tinte};line-height:1.8;margin-top:4px}
.it-naeh{font-size:15px;font-weight:600;color:${C.grau}}
.it-gross{width:100%;height:52px;border-radius:14px;border:none;cursor:pointer;font-family:inherit;font-size:16.5px;font-weight:700}
.it-gross.blau{color:#fff;background:${blau}}
.it-gross.gold{color:${C.seeTief};background:${C.flaggold}}
@media (max-width:380px){.abl-seg button{font-size:12.5px}.abl-wahl>span{font-size:14.5px}.it-formel{font-size:20px}.it-stuecke{font-size:16px}}
@media (min-width:601px){.abl-seite{background:transparent}}
/* Desktop (ab 840 px, DESKTOP-STIL.md): Menü als eine Zeile, Rechenweg links, Bild rechts mitlaufend */
@media (min-width:840px){
  .abl-innen{max-width:none;width:var(--tr-breite);padding:22px 0 56px}
  .it-wahl .abl-regelknopf{font-size:13.5px}
  .it-kopf{grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;background:#fff;border:1px solid ${C.linie};border-radius:16px;padding:8px}
  .it-kurzname{display:none}
  .it-langname{display:inline}
  .it-kopf .it-links{order:2;flex-direction:row;align-items:center;justify-content:flex-end}
  .it-kopf .abl-seg{flex:0 0 196px}
  .it-kopf .abl-reihe{flex:0 0 auto}
  .it-kopf .abl-stufe{width:132px;flex:0 0 132px}
  .it-kopf .abl-stufe .wk-pop-liste{right:0;left:auto}
  .it-wahl{flex-direction:row;justify-content:space-between;border-radius:12px;padding:6px 6px 6px 14px;min-height:48px;min-width:0}
  .it-wahl .abl-regelmenue{min-width:0;flex:0 1 auto}
  .it-wahl .abl-regelknopf{max-width:100%}
  .it-raster{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:26px;align-items:start}
  .it-raster>.it-bild{grid-column:2;grid-row:1;position:sticky;top:56px}
  .it-raster>.it-weg{grid-column:1;grid-row:1}
  .it-aufgabe{padding:16px 20px 18px}
  .it-zumbild{display:none}
  .it-graphknopf,.it-info{display:none}
  .it-frage{display:block}
  .it-bild,.it-bild[data-zu="ja"]{grid-template-rows:1fr;opacity:1;margin:0;visibility:visible}
}
`;
