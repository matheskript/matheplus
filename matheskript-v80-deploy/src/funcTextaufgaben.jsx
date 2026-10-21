/* ============================================================
   Textaufgaben übersetzen  (Bereich „Textaufgaben“, /textaufgaben)
   Erst übersetzen, dann rechnen: Jede Information im Text wird zu einer
   mathematischen Bedingung. Drei Reiter:
   · Verstehen – Leitidee, Beispiel zum Antippen, Übersetzungskette,
     die fünf häufigsten Fallen, Übersetzungs-Wörterbuch
   · Training  – acht Themen (Klasse 5–13), drei Stufen:
     1 Erkennen (Auswahl), 2 Übersetzen (tippen), 3 Ganze Aufgabe
   · Mathilda  – Foto oder Text: Mathilda übersetzt jede Stelle und
     erklärt warum (funcTextMathilda.jsx)
   Logik: textaufgaben.js (Generatoren), bedingungen.js (Prüfung).
   ============================================================ */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { buchen } from "./buchung.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { GrosserKnopf, MS, Rueck, hilfeKontext, kicker, zw } from "./ui2.jsx";
import { Aufklapp } from "./ui3.jsx";
import { MathildaIcon } from "./funcMathildaSeite.jsx";
import { TextMathilda } from "./funcTextMathilda.jsx";
import { alsTex, pruefeEingabe } from "./bedingungen.js";
import { springe } from "./sprung.js";
import { ErgebnisReihe, useDesktop } from "./arbeitsflaeche.jsx";
import { useKarte } from "./funcZahlenDesktop.jsx";
import {
  KLASSEN_STUFEN, STUFEN, THEMEN, WB_GRUPPEN, alleZiele, anzahlBedingungen, beispielSteckbrief, klasseText, neueTextaufgabe,
  pruefeAuswahl, schnelltasten, stellenOptionen, themaName, themaZeile, themenFuer, woerterbuch,
} from "./textaufgaben.js";

const SPEICHER = "matheplus-textaufgaben";
const GOLD = C.flaggold, NACHT = C.seeTief, GRUEN = "#0F7A4D";
const lesen = () => { try { return JSON.parse(localStorage.getItem(SPEICHER) || "{}") || {}; } catch (e) { return {}; } };
const schreiben = (o) => { try { localStorage.setItem(SPEICHER, JSON.stringify({ ...lesen(), ...o })); } catch (e) { /* privat */ } };
const NR = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];

/* Bedingung anzeigen: aus einfacher Schreibweise oder fertigem TeX */
export const BedTex = ({ c, tex, gross }) => <span style={{ fontSize: gross ? 18 : 16, color: C.tinte }}><M t={tex || alsTex(c)} /></span>;

/* ---------- Text mit markierten Stellen ----------
   aktiv: Index der gerade gefragten Stelle (gold), fertig: Set erledigter Stellen (grün unterstrichen),
   zeigeAlle: alle Stellen sichtbar markieren, ansatzAktiv/ansatzFertig: dasselbe für die Ansatz-Stelle */
function MarkierterText({ a, aktiv = -1, fertig = new Set(), zeigeAlle = false, gold = new Set(), ansatzAktiv = false, ansatzFertig = false, verdeckt = false, onTipp }) {
  const stil = (an, ok, gelb) => ({
    background: an || gelb ? "linear-gradient(transparent 52%, rgba(237,187,0,0.55) 52%)" : ok ? "linear-gradient(transparent 82%, rgba(15,122,77,0.35) 82%)" : zeigeAlle ? "linear-gradient(transparent 82%, rgba(0,77,152,0.22) 82%)" : "none",
    fontWeight: an ? 700 : 500, borderRadius: 2, padding: "0 1px", cursor: onTipp ? "pointer" : "default",
    WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone",
  });
  return (
    <p data-textaufgabe style={{ fontSize: 16, lineHeight: 1.85, color: C.tinte, margin: 0 }}>
      {a.teile.map((p, i) => {
        if (typeof p === "string") return <React.Fragment key={i}><MS s={p} /></React.Fragment>;
        if (p.a) {
          if (verdeckt) return <span key={i}>{a.ansatz.t}</span>;
          return <span key={i} data-stelle="ansatz" style={stil(ansatzAktiv, ansatzFertig, false)}>{a.ansatz.t}</span>;
        }
        const s = a.stellen[p.s];
        if (verdeckt && !gold.has(p.s)) return <span key={i}><MS s={s.t} /></span>;
        const ok = fertig.has(p.s);
        return (
          <span key={i} data-stelle={p.s} onClick={onTipp ? () => onTipp(p.s) : undefined} role={onTipp ? "button" : undefined} tabIndex={onTipp ? 0 : undefined}
            onKeyDown={onTipp ? (e) => { if (e.key === "Enter") onTipp(p.s); } : undefined} style={stil(aktiv === p.s, ok, gold.has(p.s))}>
            <MS s={s.t} />{(ok || zeigeAlle) && <sup style={{ color: ok ? GRUEN : C.see, fontWeight: 800, fontSize: 11, marginLeft: 1 }}>{NR[p.s] || p.s + 1}</sup>}
          </span>
        );
      })}
    </p>
  );
}

/* ---------- Mathilda-Hinweis (in Verstehen und Training) ---------- */
function MathildaTeaser({ onOeffnen }) {
  return (
    <button type="button" onClick={onOeffnen} data-mathilda-teaser
      style={{ width: "100%", marginTop: 14, display: "flex", alignItems: "center", gap: 14, textAlign: "left", cursor: "pointer", fontFamily: "inherit",
        border: "none", borderRadius: 18, padding: "14px 16px", color: C.weiss, boxShadow: "0 10px 28px rgba(14,30,74,0.22)",
        background: `radial-gradient(120% 140% at 100% 0%, #1D4790 0%, ${C.see} 40%, ${NACHT} 100%)` }}>
      <MathildaIcon groesse={52} hintergrund="rgba(255,255,255,0.08)" />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.01em", color: GOLD }}>{zw("Mathilda übersetzt", "Mathilda translates")}</span>
        <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, lineHeight: 1.3, marginTop: 2 }}>{zw("Textaufgabe aus deinem Buch? Fotografiere sie.", "A word problem from your book? Take a photo.")}</span>
        <span style={{ display: "block", fontSize: 12.5, fontWeight: 300, color: "#C9D6EE", lineHeight: 1.45, marginTop: 2 }}>{zw("Mathilda zeigt dir jede Stelle als Bedingung – und warum.", "Mathilda shows every phrase as a condition – and why.")}</span>
      </span>
      <span aria-hidden="true" style={{ color: GOLD, fontSize: 22, fontWeight: 700 }}>→</span>
    </button>
  );
}

/* ======================================================================
   VERSTEHEN
   ====================================================================== */
function Leitidee() {
  const karte = useKarte();   // Desktop: feiner Rahmen statt Schatten
  const schritte = [
    [zw("Gesucht und Ansatz", "Unknown and general form"), zw("Was ist gesucht? Nenne die Unbekannte x – oder wähle den Funktionsansatz. Er sagt dir, wie viele Unbekannte es gibt.", "What is asked for? Name the unknown x – or choose the general form. It tells you how many unknowns there are.")],
    [zw("Jede Information = eine Bedingung", "Every piece of information = a condition"), zw("Markiere im Text jede Information und übersetze sie einzeln: „Hochpunkt H(6|4)“ → $f(6) = 4$ und $f′(6) = 0$.", "Mark every piece of information and translate it on its own: “maximum H(6|4)” → $f(6) = 4$ and $f′(6) = 0$.")],
    [zw("Zählen", "Count"), zw("So viele Bedingungen wie Unbekannte – dann ist die Aufgabe lösbar. Erst jetzt wird gerechnet.", "As many conditions as unknowns – then the task can be solved. Only now do you calculate.")],
  ];
  return (
    <div style={{ ...karte, marginTop: 16, borderLeft: `4px solid ${GOLD}` }}>
      <p style={kicker}>{zw("Die Leitidee", "The key idea")}</p>
      <p style={{ margin: "0 0 12px", fontSize: 19, fontWeight: 700, lineHeight: 1.35, color: C.tinte, letterSpacing: "-0.01em" }}>
        {zw("Eine Textaufgabe ist eine verschlüsselte Gleichung.", "A word problem is an equation in disguise.")}
      </p>
      <p style={{ margin: "0 0 14px", fontSize: 14.5, lineHeight: 1.7, color: C.grau }}>
        {zw("Die meisten Fehler passieren nicht beim Rechnen, sondern beim Übersetzen. Darum trainierst du hier nur das: Text → Mathematik. Das Rechnen danach ist Handwerk.", "Most mistakes happen not while calculating but while translating. So here you train only that: text → maths. Calculating afterwards is craft.")}
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {schritte.map(([t, s], i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 999, background: NACHT, color: GOLD, fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.tinte }}>{t}</p>
              <p style={{ margin: "2px 0 0", fontSize: 13.5, lineHeight: 1.6, color: C.grau }}><MS s={s} /></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BeispielAntippen() {
  const karte = useKarte();   // Desktop: feiner Rahmen statt Schatten
  const b = useMemo(() => beispielSteckbrief(), []);
  const [auf, setAuf] = useState(new Set());
  const [ansatzAuf, setAnsatzAuf] = useState(false);
  const a = { teile: b.teile, ansatz: b.ansatz, stellen: b.stellen };
  const tipp = (i) => setAuf((s) => new Set(s).add(i));
  const alle = ansatzAuf && auf.size === b.stellen.length;
  return (
    <div style={{ ...karte, marginTop: 16 }} data-beispiel>
      <p style={kicker}>{zw("Beispiel – tippe die markierten Stellen an", "Example – tap the marked phrases")}</p>
      <div style={{ background: C.sand, borderRadius: 14, padding: "12px 14px" }}>
        <p style={{ fontSize: 16, lineHeight: 1.85, color: C.tinte, margin: 0 }}>
          {a.teile.map((p, i) => {
            if (typeof p === "string") return <React.Fragment key={i}>{p}</React.Fragment>;
            const an = p.a ? ansatzAuf : auf.has(p.s);
            const t = p.a ? b.ansatz.t : b.stellen[p.s].t;
            return (
              <button key={i} type="button" onClick={() => (p.a ? setAnsatzAuf(true) : tipp(p.s))} data-bsp={p.a ? "ansatz" : p.s}
                style={{ display: "inline", font: "inherit", lineHeight: "inherit", color: "inherit", border: "none", padding: "0 1px", cursor: "pointer", borderRadius: 3,
                  background: an ? "linear-gradient(transparent 82%, rgba(15,122,77,0.4) 82%)" : "linear-gradient(transparent 52%, rgba(237,187,0,0.5) 52%)", fontWeight: 600,
                  WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}>
                {t}{an && <sup style={{ color: GRUEN, fontWeight: 800, fontSize: 11 }}>{p.a ? "A" : NR[p.s]}</sup>}
              </button>
            );
          })}
        </p>
      </div>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {ansatzAuf && (
          <div style={{ borderLeft: `4px solid ${C.see}`, background: C.himmel, borderRadius: 12, padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.see }}>A · {zw("Ansatz", "General form")}</p>
            <div style={{ fontSize: 18, margin: "4px 0", overflowX: "auto" }}><M t={b.ansatz.zeile} /></div>
            <p style={{ margin: 0, fontSize: 13, color: C.tinte, lineHeight: 1.55 }}>{b.ansatz.warum}</p>
          </div>
        )}
        {b.stellen.map((s, i) => auf.has(i) && (
          <div key={i} style={{ borderLeft: `4px solid ${GRUEN}`, background: "#EEF8F3", borderRadius: 12, padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: GRUEN }}>{NR[i]} „{s.t}“</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px", fontSize: 18, margin: "4px 0" }}>{s.tex.map((t) => <M key={t} t={t} />)}</div>
            <p style={{ margin: 0, fontSize: 13, color: C.tinte, lineHeight: 1.55 }}>{s.warum}</p>
          </div>
        ))}
      </div>
      {alle
        ? <Rueck art="gut">{zw("4 Unbekannte, 4 Bedingungen – übersetzt. Jetzt erst wird gerechnet: einsetzen, Gleichungssystem lösen.", "4 unknowns, 4 conditions – translated. Only now do you calculate: substitute, solve the system.")}</Rueck>
        : <GrosserKnopf ghost onClick={() => { setAnsatzAuf(true); setAuf(new Set(b.stellen.map((_, i) => i))); }}>{zw("Alles zeigen", "Show everything")}</GrosserKnopf>}
    </div>
  );
}

function Kette() {
  const karte = useKarte();   // Desktop: feiner Rahmen statt Schatten
  const z = [["Das Dreifache einer Zahl", "Three times a number", "3x"], [", vermindert um 4", ", decreased by 4", "3x − 4"], [", ergibt 11.", ", gives 11.", "3x − 4 = 11"]];
  const [n, setN] = useState(1);
  return (
    <div style={{ ...karte, marginTop: 16 }} data-kette>
      <p style={kicker}>{zw("Stück für Stück übersetzen (Klasse 5–7)", "Translate piece by piece (Year 5–7)")}</p>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: C.tinte, margin: "0 0 10px" }}>
        {z.map(([de, en], i) => <span key={i} style={{ background: i < n ? "linear-gradient(transparent 82%, rgba(15,122,77,0.35) 82%)" : "none", color: i < n ? C.tinte : C.hellgrau }}>{zw(de, en)}</span>)}
      </p>
      <div style={{ background: C.sand, borderRadius: 12, padding: "6px 12px" }}>
        {z.slice(0, n).map(([, , t], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderTop: i ? `1px solid ${C.linie}` : "none" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: GRUEN, width: 18 }}>{NR[i]}</span>
            <span style={{ fontSize: 18, color: i === n - 1 ? C.tinte : C.grau }}><M t={t} /></span>
          </div>
        ))}
      </div>
      <GrosserKnopf ghost onClick={() => setN(n >= z.length ? 1 : n + 1)}>{n >= z.length ? zw("Von vorn", "Restart") : zw("Nächstes Stück", "Next piece")}</GrosserKnopf>
    </div>
  );
}

function Fallen() {
  const karte = useKarte();   // Desktop: feiner Rahmen statt Schatten
  const f = [
    [zw("„um 5 größer als“", "“5 more than”"), "A = B + 5", zw("Die 5 kommt zur kleineren Seite – Probe mit Zahlen!", "The 5 goes with the smaller side – check with numbers!")],
    [zw("„Länge ist dreimal so groß wie Breite“", "“length is three times the width”"), "x = 3y", zw("Nicht y = 3x – setze zur Probe Zahlen ein.", "Not y = 3x – check with numbers.")],
    [zw("„Punkt P(2|5)“", "“point P(2|5)”"), "f(2) = 5", zw("Erst x, dann y – nie f(5) = 2.", "x first, then y – never f(5) = 2.")],
    [zw("„nach 20 % Erhöhung 540 €“", "“540 after a 20 % rise”"), "1{,}2x = 540", zw("Die 20 % beziehen sich auf den alten Preis.", "The 20 % refers to the old price.")],
    [zw("„mindestens 3“", "“at least 3”"), "P(X \\geq 3) = 1 − P(X \\leq 2)", zw("3 gehört dazu; das Gegenereignis endet bei 2.", "3 is included; the complement ends at 2.")],
    [zw("„Steigung 4 bei x = 1“", "“slope 4 at x = 1”"), "f′(1) = 4", zw("Steigung heißt Ableitung, nicht Funktionswert.", "Slope means derivative, not function value.")],
  ];
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Die häufigsten Übersetzungsfallen", "The most common translation traps")}</p>
      <div style={{ display: "grid", gap: 8 }}>
        {f.map(([p, t, w], i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 2, padding: "8px 0", borderTop: i ? `1px solid ${C.linie}` : "none" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 10px" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.tinte }}>{p}</span>
              <span aria-hidden="true" style={{ color: GOLD, fontWeight: 800 }}>→</span>
              <span style={{ fontSize: 16 }}><M t={t} /></span>
            </div>
            <span style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.5 }}>{w}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Woerterbuch() {
  const karte = useKarte();   // Desktop: feiner Rahmen statt Schatten
  const alle = useMemo(() => woerterbuch(), []);
  const [gruppe, setGruppe] = useState("steckbrief");
  const [suche, setSuche] = useState("");
  const q = suche.trim().toLowerCase();
  const liste = alle.filter((e) => (q ? (e.phrase + " " + e.tex).toLowerCase().includes(q) : e.gruppe === gruppe));
  return (
    <div style={{ ...karte, marginTop: 16 }} data-woerterbuch>
      <p style={kicker}>{zw("Übersetzungs-Wörterbuch", "Translation dictionary")}</p>
      <input type="search" value={suche} onChange={(e) => setSuche(e.target.value)} aria-label={zw("Im Wörterbuch suchen", "Search the dictionary")}
        placeholder={zw("Suchen, z. B. „mindestens“ oder „Tangente“", "Search, e.g. “at least” or “tangent”")}
        style={{ width: "100%", boxSizing: "border-box", height: 44, padding: "0 14px", borderRadius: 12, border: `1.5px solid ${C.linie}`, fontFamily: "inherit", fontSize: 15, color: C.tinte, outline: "none", marginBottom: 10 }} />
      {!q && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {WB_GRUPPEN.map((g) => (
            <button key={g.id} type="button" aria-pressed={gruppe === g.id} onClick={() => setGruppe(g.id)}
              style={{ padding: "6px 11px", borderRadius: 999, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${gruppe === g.id ? C.see : C.linie}`, background: gruppe === g.id ? C.see : C.weiss, color: gruppe === g.id ? C.weiss : C.see }}>{zw(g.name[0], g.name[1])}</button>
          ))}
        </div>
      )}
      <div>
        {liste.map((e, i) => (
          <div key={i} style={{ padding: "9px 0", borderTop: `1px solid ${C.linie}` }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: "4px 12px" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.tinte }}>{e.phrase}</span>
              <span style={{ fontSize: 16, overflowX: "auto", maxWidth: "100%" }}><M t={e.tex} /></span>
            </div>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.grau, lineHeight: 1.5 }}><MS s={e.warum} /></p>
          </div>
        ))}
        {!liste.length && <p style={{ fontSize: 13.5, color: C.grau }}>{zw("Nichts gefunden – versuch ein anderes Wort.", "Nothing found – try another word.")}</p>}
      </div>
    </div>
  );
}

function Verstehen({ zuMathilda, zuTraining }) {
  const desktop = useDesktop();
  if (desktop) {
    /* Desktop: Leitidee und Kette nebeneinander, Beispiel breit, Fallen und Wörterbuch nebeneinander */
    return (
      <div data-verstehen="breit">
        <ErgebnisReihe spalten="minmax(0, 1fr) minmax(0, 1fr)" style={{ alignItems: "start" }}>
          <div><Leitidee /><BeispielAntippen /></div>
          <div><Kette /><Fallen /></div>
        </ErgebnisReihe>
        <Woerterbuch />
        <div style={{ maxWidth: 360, margin: "0 auto" }}><GrosserKnopf onClick={zuTraining}>{zw("Jetzt selbst übersetzen", "Now translate yourself")}</GrosserKnopf></div>
        <MathildaTeaser onOeffnen={zuMathilda} />
      </div>
    );
  }
  return (
    <div>
      <Leitidee />
      <BeispielAntippen />
      <Kette />
      <Fallen />
      <Woerterbuch />
      <GrosserKnopf onClick={zuTraining}>{zw("Jetzt selbst übersetzen", "Now translate yourself")}</GrosserKnopf>
      <MathildaTeaser onOeffnen={zuMathilda} />
    </div>
  );
}

/* ======================================================================
   TRAINING
   ====================================================================== */
function Chips({ liste, wert, setWert, label, klein }) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {liste.map(([id, t]) => (
        <button key={id} type="button" aria-pressed={wert === id} onClick={() => setWert(id)}
          style={{ padding: klein ? "5px 10px" : "7px 12px", borderRadius: 999, fontFamily: "inherit", fontSize: klein ? 12.5 : 13, fontWeight: 700, cursor: "pointer",
            border: `1.5px solid ${wert === id ? C.see : C.linie}`, background: wert === id ? C.see : C.weiss, color: wert === id ? C.weiss : C.see }}>{t}</button>
      ))}
    </div>
  );
}

/* Eingabefeld mit Schnelltasten (fügen an der Schreibmarke ein) */
function BedingungsFeld({ wert, setWert, tasten, onEnter, mehrzeilig, label, platzhalter }) {
  const ref = useRef(null);
  const einfuegen = (t) => {
    const el = ref.current;
    const ein = t === "²" ? "^2" : t;
    if (!el) { setWert(wert + ein); return; }
    const a = el.selectionStart ?? wert.length, b = el.selectionEnd ?? wert.length;
    const neu = wert.slice(0, a) + ein + wert.slice(b);
    setWert(neu);
    requestAnimationFrame(() => { try { el.focus(); el.setSelectionRange(a + ein.length, a + ein.length); } catch (e) { /* egal */ } });
  };
  const stil = { width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 16, fontFamily: "ui-monospace, Menlo, monospace", color: C.tinte,
    border: `1.5px solid ${C.linie}`, borderRadius: 12, background: C.weiss, outline: "none", lineHeight: 1.5 };
  return (
    <div>
      {mehrzeilig
        ? <textarea ref={ref} value={wert} onChange={(e) => setWert(e.target.value.slice(0, 400))} rows={4} aria-label={label} placeholder={platzhalter} spellCheck={false} autoCapitalize="off" autoCorrect="off" style={{ ...stil, resize: "vertical" }} />
        : <input ref={ref} value={wert} onChange={(e) => setWert(e.target.value.slice(0, 160))} onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }} aria-label={label} placeholder={platzhalter}
            spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" style={{ ...stil, height: 46 }} />}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        {tasten.map((t) => (
          <button key={t} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => einfuegen(t === "−" ? "-" : t === "f′(" ? "f'(" : t === "f″(" ? "f''(" : t.replace("′(", "'(").replace("″(", "''("))}
            style={{ minWidth: 40, height: 34, padding: "0 10px", borderRadius: 9, border: `1px solid ${C.linie}`, background: C.sand, color: C.see, fontSize: 14, fontWeight: 700, fontFamily: "ui-monospace, Menlo, monospace", cursor: "pointer" }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

/* Ergebnis einer Prüfung als Rückmeldung */
function PruefRueck({ r, ziele }) {
  if (!r) return null;
  if (r.leer) return <Rueck art="warn">{zw("Tippe zuerst eine Bedingung ein.", "Type a condition first.")}</Rueck>;
  if (r.ok) return null;
  const n = r.gefunden.filter(Boolean).length;
  return (
    <Rueck art="schlecht">
      <span style={{ display: "block" }}>{zw(`${n} von ${ziele.length} ${ziele.length === 1 ? "Bedingung" : "Bedingungen"} richtig.`, `${n} of ${ziele.length} conditions correct.`)}</span>
      {r.unlesbar.map((u, i) => <span key={"u" + i} style={{ display: "block" }}>{zw("Nicht lesbar:", "Can't read:")} „{u}“ – {zw("schreib z. B. f'(2) = 0 oder 3x - 4 = 11.", "write e.g. f'(2) = 0 or 3x - 4 = 11.")}</span>)}
      {r.extra.filter((e) => !e.doppelt && !e.trivial).map((e, i) => (
        <span key={"e" + i} style={{ display: "block" }}>„{e.text}“: {e.fehler ? <MS s={zw("Denkfehler: ", "Mistake: ") + e.fehler} /> : zw("passt nicht zu dieser Information.", "does not match this information.")}</span>
      ))}
      {r.extra.filter((e) => e.trivial).map((e, i) => <span key={"t" + i} style={{ display: "block" }}>„{e.text}“: {zw("gilt wegen des Ansatzes von selbst – darfst du weglassen.", "holds automatically because of the general form – you may leave it out.")}</span>)}
    </Rueck>
  );
}

/* Ansatz-Schritt (Auswahl) */
function AnsatzSchritt({ a, fertig, onFertig }) {
  const [wahl, setWahl] = useState(null);
  const [rueck, setRueck] = useState(null);
  const A = a.ansatz;
  /* Reihenfolge stabil mischen, damit die richtige Wahl nicht immer oben steht */
  const gemischt = useMemo(() => { const k = (a.id * 5 + 1) % A.optionen.length; return [...A.optionen.slice(k), ...A.optionen.slice(0, k)]; }, [a.id]);
  if (fertig) {
    return (
      <div style={{ borderLeft: `4px solid ${C.see}`, background: C.himmel, borderRadius: 12, padding: "10px 12px", marginTop: 12 }} data-ansatz-fertig>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.see }}>{zw("Ansatz", "General form")}</p>
        <div style={{ fontSize: 17, margin: "4px 0", overflowX: "auto" }}>{A.unbekannte ? <M t={A.zeile} /> : <span style={{ fontSize: 15, fontWeight: 600, color: C.tinte }}>{A.zeile}</span>}</div>
        <p style={{ margin: 0, fontSize: 13, color: C.tinte, lineHeight: 1.55 }}><MS s={A.warum} /></p>
      </div>
    );
  }
  const pruefen = () => {
    const o = A.optionen.find((x) => x.id === wahl);
    if (!o) return;
    buchen({ richtig: o.richtig, gruppe: `text-${a.thema}-ansatz` });
    if (o.richtig) { setRueck(null); onFertig(); } else setRueck(o.rueck || zw("Noch nicht.", "Not yet."));
  };
  return (
    <div style={{ marginTop: 14 }} data-ansatz-schritt>
      <p style={{ fontSize: 13, fontWeight: 700, color: C.grau, margin: "0 0 6px" }}>{A.unbekannte ? zw("Schritt 1 · Ansatz", "Step 1 · General form") : zw("Schritt 1 · Unbekannte festlegen", "Step 1 · Choose the unknown")}</p>
      <p style={{ fontSize: 15, color: C.tinte, margin: "0 0 8px", fontWeight: 600 }}>{A.frage}</p>
      <div role="radiogroup" aria-label={A.frage} style={{ display: "grid", gap: 8 }}>
        {gemischt.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={wahl === o.id} data-o={o.id} onClick={() => { setWahl(o.id); setRueck(null); }}
            style={{ textAlign: "left", minHeight: 46, padding: "8px 14px", borderRadius: 12, fontFamily: "inherit", cursor: "pointer", fontSize: 15, color: C.tinte, overflowX: "auto",
              border: `1.5px solid ${wahl === o.id ? C.see : C.linie}`, background: wahl === o.id ? C.himmel : C.weiss, fontWeight: 600 }}>
            {o.tex ? <M t={o.tex} /> : o.text}
          </button>
        ))}
      </div>
      {rueck && <Rueck art="schlecht">{rueck}</Rueck>}
      <GrosserKnopf onClick={pruefen} disabled={!wahl}>{zw("Prüfen", "Check")}</GrosserKnopf>
    </div>
  );
}

/* Eine Textstelle übersetzen: Stufe 1 Auswahl, Stufe 2 tippen */
function StellenSchritt({ a, i, stufe, onFertig, nr, gesamt }) {
  const s = a.stellen[i];
  const tippen = stufe >= 2 && s.tippbar;
  const optionen = useMemo(() => stellenOptionen(s, a.id + i), [a.id, i]);
  const [gewaehlt, setGewaehlt] = useState([]);
  const [eingabe, setEingabe] = useState("");
  const [r, setR] = useState(null);
  const [versuche, setVersuche] = useState(0);
  const [hilfe, setHilfe] = useState(false);
  const geschafft = (erster) => { onFertig(erster); };
  const pruefen = () => {
    if (tippen) {
      const res = pruefeEingabe(eingabe, s.ziel, { falsch: s.falsch, funktionen: a.funktionen, ansatz: a.eval });
      setR(res);
      if (res.leer) return;
      buchen({ richtig: res.ok, gruppe: `text-${a.thema}` });
      if (res.ok) geschafft(versuche === 0); else setVersuche(versuche + 1);
    } else {
      const res = pruefeAuswahl(optionen, gewaehlt);
      setR(res);
      buchen({ richtig: res.ok, gruppe: `text-${a.thema}` });
      if (res.ok) geschafft(versuche === 0); else setVersuche(versuche + 1);
    }
  };
  const aufloesen = () => { buchen({ richtig: false, gruppe: `text-${a.thema}` }); onFertig(false); };
  return (
    <div style={{ marginTop: 14 }} data-stellen-schritt={i}>
      <p style={{ fontSize: 13, fontWeight: 700, color: C.grau, margin: "0 0 4px" }}>{zw(`Textstelle ${nr} von ${gesamt}`, `Phrase ${nr} of ${gesamt}`)}</p>
      <p style={{ fontSize: 16, color: C.tinte, margin: "0 0 8px", fontWeight: 700, lineHeight: 1.45 }}>
        <span style={{ background: "linear-gradient(transparent 52%, rgba(237,187,0,0.55) 52%)" }}>„<MS s={s.t} />“</span>
      </p>
      {tippen ? (
        <>
          <p style={{ fontSize: 13.5, color: C.grau, margin: "0 0 8px" }}>{zw("Schreib die Bedingung(en) auf – mehrere mit ; trennen.", "Write the condition(s) – separate several with ;")}</p>
          <BedingungsFeld wert={eingabe} setWert={(v) => { setEingabe(v); setR(null); }} tasten={schnelltasten(a)} onEnter={pruefen} label={zw("Deine Übersetzung", "Your translation")} platzhalter={a.thema === "stochastik" ? "P(X ≤ 3)" : a.funktionen && a.funktionen.length ? `${a.funktionen[0]}(2) = 5; ${a.funktionen[0]}'(2) = 0` : "3x - 4 = 11"} />
        </>
      ) : (
        <>
          <p style={{ fontSize: 13.5, color: C.grau, margin: "0 0 8px" }}>
            {stufe >= 2 ? zw("Diese Stelle lässt sich schlecht tippen – wähle aus. ", "This one is hard to type – choose. ") : ""}{zw("Wähle alles, was diese Stelle bedeutet.", "Choose everything this phrase means.")}
          </p>
          <div role="group" aria-label={zw("Übersetzungen", "Translations")} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {optionen.map((o) => {
              const an = gewaehlt.includes(o.id);
              return (
                <button key={o.id} type="button" aria-pressed={an} data-o={o.id} onClick={() => { setGewaehlt(an ? gewaehlt.filter((x) => x !== o.id) : [...gewaehlt, o.id]); setR(null); }}
                  style={{ minHeight: 46, padding: "6px 14px", borderRadius: 12, fontFamily: "inherit", cursor: "pointer", maxWidth: "100%", overflowX: "auto",
                    border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss, boxShadow: an ? `inset 0 -3px 0 ${C.see}` : "none" }}>
                  <BedTex c={o.c} tex={o.tex} />
                </button>
              );
            })}
          </div>
        </>
      )}
      {r && !tippen && !r.ok && (
        <Rueck art="schlecht">
          {r.zuviel.length ? r.zuviel.map((z, k) => <span key={k} style={{ display: "block" }}><MS s={zw("Denkfehler: ", "Mistake: ") + z.text} /></span>) : null}
          {r.fehlend > 0 && <span style={{ display: "block" }}>{r.fehlend === 1 ? zw("Eine Bedingung fehlt noch.", "One condition is still missing.") : zw(`Es fehlen noch ${r.fehlend} Bedingungen.`, `${r.fehlend} conditions are still missing.`)}</span>}
        </Rueck>
      )}
      {tippen && <PruefRueck r={r} ziele={s.ziel} />}
      {hilfe && <Rueck art="info"><MS s={zw("Was heißt das? ", "What does it mean? ") + s.bedeutung} /></Rueck>}
      <GrosserKnopf onClick={pruefen} disabled={tippen ? !eingabe.trim() : !gewaehlt.length}>{zw("Prüfen", "Check")}</GrosserKnopf>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
        {!hilfe ? <button type="button" onClick={() => setHilfe(true)} style={linkStil}>{zw("Tipp: Was heißt das?", "Hint: what does it mean?")}</button> : <span />}
        {versuche >= 2 && <button type="button" onClick={aufloesen} style={linkStil} data-loesung-zeigen>{zw("Lösung zeigen", "Show solution")}</button>}
      </div>
    </div>
  );
}
const linkStil = { background: "none", border: "none", color: C.see, fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: "8px 0", minHeight: 40 };

/* Fertig übersetzte Stelle */
function StelleFertig({ a, i, erster }) {
  const s = a.stellen[i];
  return (
    <div style={{ borderLeft: `4px solid ${erster === false ? GOLD : GRUEN}`, background: erster === false ? "#FFF8DD" : "#EEF8F3", borderRadius: 12, padding: "9px 12px", marginTop: 10 }} data-stelle-fertig={i}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: erster === false ? "#7A5A00" : GRUEN }}>{NR[i]} „<MS s={s.t} />“</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px", margin: "4px 0", overflowX: "auto" }}>
        {(s.zielTex || s.ziel.map((z) => alsTex(z.c))).map((t, k) => <BedTex key={k} tex={t} />)}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: C.tinte, lineHeight: 1.55 }}><MS s={s.warum} /></p>
    </div>
  );
}

/* Stufe 3: alle Bedingungen auf einmal */
function GanzeAufgabe({ a, onTreffer, onFertig, setGold }) {
  const tipp = a.stellen.map((s, i) => ({ s, i })).filter((x) => x.s.tippbar);
  const ziele = tipp.flatMap(({ s, i }) => s.ziel.map((z) => ({ ...z, stelle: i })));
  const falsch = tipp.flatMap(({ s }) => s.falsch);
  const [eingabe, setEingabe] = useState("");
  const [r, setR] = useState(null);
  const [versuche, setVersuche] = useState(0);
  const pruefen = () => {
    const res = pruefeEingabe(eingabe, ziele, { falsch, funktionen: a.funktionen, ansatz: a.eval });
    setR(res);
    if (res.leer) return;
    buchen({ richtig: res.ok, gruppe: `text-${a.thema}-ganz` });
    /* erledigte Stellen grün, ab dem 2. Versuch fehlende gold markieren */
    const fertigeStellen = tipp.filter(({ i }) => ziele.every((z, k) => z.stelle !== i || res.gefunden[k])).map(({ i }) => i);
    onTreffer(fertigeStellen);
    if (!res.ok && versuche >= 1) setGold(new Set(tipp.map(({ i }) => i).filter((i) => !fertigeStellen.includes(i))));
    if (res.ok) onFertig(versuche === 0); else setVersuche(versuche + 1);
  };
  return (
    <div style={{ marginTop: 14 }} data-ganze-aufgabe>
      <p style={{ fontSize: 13, fontWeight: 700, color: C.grau, margin: "0 0 4px" }}>{zw("Schritt 2 · Alle Bedingungen", "Step 2 · All conditions")}</p>
      <p style={{ fontSize: 14.5, color: C.tinte, margin: "0 0 8px", lineHeight: 1.55 }}>
        {zw(`Finde jede Information im Text und schreib alle Bedingungen auf – eine pro Zeile. Es sind ${ziele.length}.`, `Find every piece of information and write all conditions – one per line. There are ${ziele.length}.`)}
      </p>
      <BedingungsFeld mehrzeilig wert={eingabe} setWert={(v) => { setEingabe(v); setR(null); }} tasten={schnelltasten(a)} label={zw("Alle Bedingungen", "All conditions")}
        platzhalter={a.funktionen && a.funktionen.length ? `${a.funktionen[0]}(2) = 5\n${a.funktionen[0]}'(2) = 0` : "x + y = 35\n2x + 4y = 94"} />
      <PruefRueck r={r} ziele={ziele} />
      {r && !r.ok && versuche >= 2 && <Rueck art="info">{zw("Die gold markierten Stellen im Text fehlen dir noch.", "The phrases marked in gold are still missing.")}</Rueck>}
      <GrosserKnopf onClick={pruefen} disabled={!eingabe.trim()}>{zw("Prüfen", "Check")}</GrosserKnopf>
      {versuche >= 3 && <button type="button" onClick={() => { buchen({ richtig: false, gruppe: `text-${a.thema}-ganz` }); onTreffer(tipp.map(({ i }) => i)); onFertig(false); }} style={linkStil} data-loesung-zeigen>{zw("Lösung zeigen", "Show solution")}</button>}
    </div>
  );
}

const WERKZEUG_NACH = {
  woerter: { ansicht: "gleichkurs", name: ["Gleichung lösen", "Solve the equation"] },
  gleichung: { ansicht: "gleichkurs", name: ["Gleichung lösen", "Solve the equation"] },
  lgs: { ansicht: "lgs", name: ["Gleichungssystem lösen", "Solve the system"] },
  funktion: { ansicht: "lgs", name: ["Gleichungssystem lösen", "Solve the system"] },
  steckbrief: { ansicht: "steckbrief", name: ["Steckbriefaufgaben lösen", "Solve reconstruction tasks"] },
  stochastik: { ansicht: "bernoulli", name: ["Binomialverteilung berechnen", "Calculate the binomial distribution"] },
  anwendung: { ansicht: "integrale", name: ["Integrale und Bestand", "Integrals and amounts"] },
  vektoren: { ansicht: "geraden", name: ["Lagebeziehungen untersuchen", "Investigate positions"] },
};

function Zusammenfassung({ a, gehe, neu, erste }) {
  const n = anzahlBedingungen(a);
  const u = a.ansatz && a.ansatz.unbekannte ? a.ansatz.unbekannte.length : null;
  const w = WERKZEUG_NACH[a.thema];
  return (
    <div style={{ marginTop: 16, borderRadius: 16, padding: "14px 16px", background: `linear-gradient(160deg, ${NACHT} 0%, ${C.see} 100%)`, color: C.weiss }} data-zusammenfassung>
      <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD }}>{zw("Übersetzt", "Translated")} ✓</p>
      <p style={{ margin: "4px 0 10px", fontSize: 15, fontWeight: 300, color: "#C9D6EE" }}>
        {erste === a.stellen.length ? zw("Alles beim ersten Versuch – stark.", "Everything at the first try – great.") : zw(`${erste} von ${a.stellen.length} Stellen beim ersten Versuch.`, `${erste} of ${a.stellen.length} phrases at the first try.`)}
      </p>
      <div style={{ background: C.weiss, borderRadius: 12, padding: "8px 12px", color: C.tinte, overflowX: "auto" }}>
        {a.ansatz && a.ansatz.unbekannte && <div style={{ fontSize: 15, padding: "4px 0", borderBottom: `1px solid ${C.linie}`, color: C.see }}><M t={a.ansatz.zeile} /></div>}
        {a.stellen.flatMap((s, i) => (s.zielTex || s.ziel.map((z) => alsTex(z.c))).map((t, k) => (
          <div key={`${i}-${k}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
            <span style={{ fontSize: 11, color: GRUEN, fontWeight: 800, width: 16 }}>{k === 0 ? NR[i] : ""}</span>
            <BedTex tex={t} />
          </div>
        )))}
      </div>
      {u !== null && (
        <p style={{ margin: "10px 0 0", fontSize: 14, fontWeight: 600 }}>
          {zw(`${u} Unbekannte · ${n} Bedingungen`, `${u} unknowns · ${n} conditions`)} {u === n ? <span style={{ color: GOLD }}>{zw("– passt, lösbar.", "– matches, solvable.")}</span> : <span style={{ color: GOLD }}>{zw("– eine Information fehlt noch zum Lösen.", "– one more piece of information is needed to solve.")}</span>}
        </p>
      )}
      {a.einsetzen && a.einsetzen.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <Aufklapp titel={zw("Nächster Schritt: in den Ansatz einsetzen", "Next step: substitute into the general form")}>
            <div style={{ overflowX: "auto" }}>
              {a.einsetzen.map((z, k) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, color: C.grau, minWidth: 92 }}><M t={alsTex(z.bed)} /></span>
                  <span aria-hidden="true" style={{ color: GOLD, fontWeight: 800 }}>⇒</span>
                  <span style={{ fontSize: 16 }}><M t={alsTex(z.gl)} /></span>
                </div>
              ))}
            </div>
          </Aufklapp>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: w ? "1fr 1fr" : "1fr", gap: 8, marginTop: 4 }}>
        <GrosserKnopf gold onClick={neu}>{zw("Nächste Aufgabe", "Next task")}</GrosserKnopf>
        {w && <GrosserKnopf ghost onClick={() => gehe && gehe({ ansicht: w.ansicht })}>{zw(w.name[0], w.name[1])} →</GrosserKnopf>}
      </div>
    </div>
  );
}

function Aufgabe({ a, stufe, gehe, neu, zaehle }) {
  const karte = useKarte();   // Desktop: feiner Rahmen statt Schatten
  const [ansatzOk, setAnsatzOk] = useState(!a.ansatz);
  const [fertig, setFertig] = useState(new Map());   // Stelle → beim ersten Versuch?
  const [gold, setGold] = useState(new Set());
  const [ganzFertig, setGanzFertig] = useState(false);
  const reihenfolge = a.stellen.map((_, i) => i);
  const offen = reihenfolge.filter((i) => !fertig.has(i));
  /* Stufe 3: zuerst der Tipp-Teil, danach Auswahl für nicht tippbare Stellen */
  const ganzModus = stufe === 3 && a.stellen.some((s) => s.tippbar);
  const aktiv = !ansatzOk ? -1 : ganzModus && !ganzFertig ? -1 : offen.find((i) => !(ganzModus && a.stellen[i].tippbar)) ?? -1;
  const fertigSet = new Set(fertig.keys());
  const alles = ansatzOk && offen.length === 0;
  const erste = [...fertig.values()].filter(Boolean).length;
  useEffect(() => { if (alles) zaehle(erste, a.stellen.length); }, [alles]);
  useEffect(() => { try { window.__taAufgabe = a; } catch (e) { /* nur für automatische Prüfungen */ } }, [a]);
  const kontext = hilfeKontext({
    id: `textaufgaben-${a.thema}`, aufgabe: `Textaufgabe übersetzen: ${a.teile.map((p) => (typeof p === "string" ? p : p.a ? a.ansatz.t : a.stellen[p.s].t)).join("")}`,
    verstehen: [zw("Markiere jede Information im Text einzeln.", "Mark every piece of information separately.")],
    ansatz: [zw("Frage bei jeder Stelle: Ist das ein Funktionswert (f), eine Steigung (f′) oder eine Krümmung (f″)? Bei Sachaufgaben: Welche Rechenart steckt im Wort?", "Ask for every phrase: is it a value (f), a slope (f′) or a curvature (f″)? In word problems: which operation hides in the word?")],
    regel: [zw("Punkt P(x|y) → f(x) = y · Extrempunkt → f und f′ · Wendepunkt → f und f″", "Point P(x|y) → f(x) = y · extremum → f and f′ · inflection → f and f″"), zw("„um 5 größer als“ → A = B + 5", "“5 more than” → A = B + 5")],
    pruefen: [zw("Setze zur Probe Zahlen ein, die zum Text passen.", "Check with numbers that fit the text.")],
  });
  return (
    <div style={{ ...karte, marginTop: 12 }} data-aufgabe={a.thema}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <p style={{ ...kicker, marginBottom: 6 }}>{a.titel} · {klasseText(THEMEN.find((t) => t.id === a.thema))}</p>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.grau }}>{zw("Stufe", "Level")} {stufe}</span>
      </div>
      {a.frage && <p style={{ fontSize: 13.5, color: C.grau, margin: "0 0 8px", lineHeight: 1.5 }}>{a.frage}</p>}
      <div style={{ background: C.sand, borderRadius: 14, padding: "12px 14px" }}>
        <MarkierterText a={a} aktiv={aktiv} fertig={fertigSet} gold={gold} verdeckt={stufe === 3 && !alles}
          ansatzAktiv={!ansatzOk} ansatzFertig={ansatzOk && !!a.ansatz} />
      </div>
      {a.variablen && a.variablen.length > 0 && ansatzOk && (
        <p style={{ fontSize: 12.5, color: C.grau, margin: "8px 0 0" }}>{a.variablen.map(([v, t]) => `${v}: ${t}`).join(" · ")}</p>
      )}
      {a.ansatz && <AnsatzSchritt a={a} fertig={ansatzOk} onFertig={() => setAnsatzOk(true)} />}
      {reihenfolge.filter((i) => fertig.has(i)).map((i) => <StelleFertig key={i} a={a} i={i} erster={fertig.get(i)} />)}
      {ganzModus && ansatzOk && !ganzFertig && (
        <GanzeAufgabe a={a} setGold={setGold}
          onTreffer={(liste) => setFertig((m) => { const n = new Map(m); liste.forEach((i) => { if (!n.has(i)) n.set(i, null); }); return n; })}
          onFertig={(erster) => { setGanzFertig(true); setGold(new Set()); setFertig((m) => { const n = new Map(m); a.stellen.forEach((s, i) => { if (s.tippbar) n.set(i, erster); }); return n; }); }} />
      )}
      {aktiv >= 0 && (
        <StellenSchritt key={`${a.id}-${aktiv}`} a={a} i={aktiv} stufe={stufe} nr={a.stellen.length - offen.length + 1} gesamt={a.stellen.length}
          onFertig={(erster) => setFertig((m) => new Map(m).set(aktiv, erster))} />
      )}
      {alles && <Zusammenfassung a={a} gehe={gehe} neu={neu} erste={erste} />}
      {!alles && <GrosserKnopf ghost onClick={neu}>{zw("Andere Aufgabe", "Another task")}</GrosserKnopf>}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}><IchHaengeFest kontext={kontext} /></div>
    </div>
  );
}

function Training({ gehe, zuMathilda }) {
  const karte = useKarte();   // Desktop: feiner Rahmen statt Schatten
  const start = useMemo(() => lesen(), []);
  const [klasse, setKlasse] = useState(start.klasse || "alle");
  const themen = themenFuer(klasse);
  const [thema, setThema] = useState(start.thema && THEMEN.some((t) => t.id === start.thema) ? start.thema : "steckbrief");
  const t = THEMEN.find((x) => x.id === thema) || THEMEN[0];
  const [stufe, setStufe] = useState(start.stufe || 1);
  const stufeEcht = t.nurWahl ? 1 : stufe;
  const [a, setA] = useState(() => neueTextaufgabe(thema));
  const [bilanz, setBilanz] = useState({ erste: 0, gesamt: 0, aufgaben: 0 });
  const neu = (th = thema) => setA(neueTextaufgabe(th));
  useEffect(() => { schreiben({ klasse, thema, stufe }); }, [klasse, thema, stufe]);
  useEffect(() => { if (!themen.some((x) => x.id === thema)) { const n = themen[0].id; setThema(n); neu(n); } }, [klasse]);
  const anker = useRef(null);
  const waehleThema = (id) => { setThema(id); neu(id); requestAnimationFrame(() => springe("textaufgaben-thema", () => anker.current?.scrollIntoView({ behavior: "smooth", block: "start" }))); };
  const desktop = useDesktop();
  const klasseWahl = <>
    <p style={kicker}>{zw("Deine Klasse", "Your year")}</p>
    <Chips liste={KLASSEN_STUFEN.map((k) => [k.id, zw(k.name[0], k.name[1])])} wert={klasse} setWert={setKlasse} label={zw("Klasse", "Year")} klein />
  </>;
  const stufeWahl = <>
    <p style={{ ...kicker, marginTop: desktop ? 0 : 14 }}>{zw("Stufe", "Level")}</p>
    <div role="radiogroup" aria-label={zw("Stufe", "Level")} style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6 }}>
      {STUFEN.map((st) => {
        const an = stufeEcht === st.id, aus = t.nurWahl && st.id > 1;
        return (
          <button key={st.id} type="button" role="radio" aria-checked={an} disabled={aus} onClick={() => { setStufe(st.id); neu(); }} data-stufe={st.id}
            style={{ padding: "8px 6px", borderRadius: 12, cursor: aus ? "default" : "pointer", fontFamily: "inherit", textAlign: "center", opacity: aus ? 0.4 : 1,
              border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see }}>
            <span style={{ display: "block", fontSize: 13, fontWeight: 800 }}>{st.id} · {zw(st.name[0], st.name[1])}</span>
          </button>
        );
      })}
    </div>
    <p style={{ fontSize: 12.5, color: C.grau, margin: "6px 0 0", lineHeight: 1.5 }}>
      {t.nurWahl ? zw("Vektor-Bedingungen werden ausgewählt, nicht getippt.", "Vector conditions are chosen, not typed.") : zw(STUFEN[stufeEcht - 1].zeile[0], STUFEN[stufeEcht - 1].zeile[1])}
    </p>
  </>;
  return (
    <div>
      <div style={{ ...karte, marginTop: 16 }}>
        {desktop
          ? <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", columnGap: 28, alignItems: "start", marginBottom: 16 }}><div>{klasseWahl}</div><div>{stufeWahl}</div></div>
          : klasseWahl}
        <p style={{ ...kicker, marginTop: desktop ? 0 : 14 }}>{zw("Thema", "Topic")}</p>
        <div data-themen style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 230px), 1fr))", gap: 8 }}>
          {themen.map((x) => {
            const an = x.id === thema;
            return (
              <button key={x.id} type="button" aria-pressed={an} onClick={() => waehleThema(x.id)} data-thema={x.id}
                style={{ display: "flex", gap: 10, alignItems: "center", textAlign: "left", padding: "10px 12px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", minWidth: 0,
                  border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss, boxShadow: an ? `inset 0 -3px 0 ${GOLD}` : "none" }}>
                <span aria-hidden="true" style={{ flexShrink: 0, minWidth: 54, height: 40, padding: "0 6px", borderRadius: 10, background: an ? NACHT : C.sand, color: an ? GOLD : C.see,
                  fontSize: 12.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "ui-monospace, Menlo, monospace", whiteSpace: "nowrap" }}>{x.symbol}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.tinte, lineHeight: 1.25 }}>{themaName(x)}</span>
                  <span style={{ display: "block", fontSize: 11.5, color: C.grau, lineHeight: 1.35, marginTop: 1 }}>{klasseText(x)} · {themaZeile(x)}</span>
                </span>
              </button>
            );
          })}
        </div>
        {!desktop && stufeWahl}
      </div>
      <div ref={anker} style={{ scrollMarginTop: 80 }} />
      <Aufgabe key={`${a.id}-${stufeEcht}`} a={a} stufe={stufeEcht} gehe={gehe} neu={() => neu()}
        zaehle={(e, g) => setBilanz((b) => ({ erste: b.erste + e, gesamt: b.gesamt + g, aufgaben: b.aufgaben + 1 }))} />
      {bilanz.aufgaben > 0 && (
        <p style={{ fontSize: 13, color: C.grau, textAlign: "center", margin: "10px 0 0" }} data-bilanz>
          {zw(`Heute: ${bilanz.aufgaben} ${bilanz.aufgaben === 1 ? "Aufgabe" : "Aufgaben"}, ${bilanz.erste} von ${bilanz.gesamt} Stellen beim ersten Versuch`, `Today: ${bilanz.aufgaben} tasks, ${bilanz.erste} of ${bilanz.gesamt} phrases at the first try`)}
        </p>
      )}
      <MathildaTeaser onOeffnen={zuMathilda} />
    </div>
  );
}

/* ======================================================================
   SEITE
   ====================================================================== */
const REITER = ["verstehen", "training", "mathilda"];
export function Textaufgaben({ gehe, seite, setSeite }) {
  const [modus, setModusIntern] = useState(REITER.includes(seite) ? seite : "training");
  useEffect(() => { if (REITER.includes(seite) && seite !== modus) setModusIntern(seite); }, [seite]);
  const setModus = (m) => { setModusIntern(m); if (setSeite) setSeite(m); };
  const oben = useRef(null);
  const wechsel = (m) => { setModus(m); requestAnimationFrame(() => springe("textaufgaben-wechsel", () => oben.current?.scrollIntoView({ behavior: "smooth", block: "start" }))); };
  const R = [["verstehen", zw("Verstehen", "Understand")], ["training", zw("Training", "Training")], ["mathilda", zw("Mathilda", "Mathilda")]];
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 680, paddingTop: 22 }}>
      <div ref={oben} style={{ scrollMarginTop: 70 }} />
      <p style={{ fontSize: 15, lineHeight: 1.65, color: C.grau, margin: "0 0 14px" }}>
        {zw("Erst übersetzen, dann rechnen. Hier lernst du, jede Information einer Textaufgabe in eine mathematische Bedingung zu übersetzen – vom Zahlenrätsel in Klasse 5 bis zur Steckbriefaufgabe im Abi.", "Translate first, calculate second. Learn to turn every piece of information in a word problem into a mathematical condition – from number puzzles in Year 5 to reconstruction tasks for the Abitur.")}
      </p>
      <div role="tablist" aria-label={zw("Textaufgaben", "Word problems")} style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        {R.map(([id, t]) => {
          const an = modus === id, m = id === "mathilda";
          return (
            <button key={id} type="button" role="tab" aria-selected={an} onClick={() => setModus(id)} data-reiter={id}
              style={{ minHeight: 52, padding: "8px 6px", borderRadius: 14, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                border: `1.5px solid ${an ? (m ? GOLD : C.see) : m ? "rgba(237,187,0,0.6)" : C.linie}`,
                background: an ? (m ? `linear-gradient(135deg, #F8D23A 0%, ${GOLD} 60%, #D9A600 100%)` : C.see) : C.weiss,
                color: an ? (m ? NACHT : C.weiss) : m ? "#7A5A00" : C.see, boxShadow: an && m ? "0 6px 18px rgba(237,187,0,0.35)" : "none" }}>
              {m && <span aria-hidden="true" style={{ fontSize: 13 }}>✦</span>}{t}
            </button>
          );
        })}
      </div>
      <div style={{ display: modus === "verstehen" ? "block" : "none" }}><Verstehen zuMathilda={() => wechsel("mathilda")} zuTraining={() => wechsel("training")} /></div>
      <div style={{ display: modus === "training" ? "block" : "none" }}><Training gehe={gehe} zuMathilda={() => wechsel("mathilda")} /></div>
      {modus === "mathilda" && <TextMathilda gehe={gehe} zuTraining={() => wechsel("training")} />}
    </div>
  );
}
