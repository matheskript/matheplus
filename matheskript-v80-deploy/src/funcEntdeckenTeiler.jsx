import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { GrosserKnopf, KleinerLink, Rueck, karte } from "./ui2.jsx";
import { Aufklapp, ModusLeiste, SchrittFolge } from "./ui3.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { merken } from "./func5.jsx";
import { springe } from "./sprung.js";
import {
  ENDZIFFERN, STUFEN, TEILER_ANZAHL, TEILER_REIHE, TEILER_SCHRITTE, auswerten, endzerlegung, erklaerung, hilfsFaktor, naechsterTeiler,
  neunerZerlegung, rundeErzeugen, siebenerKette, ziffern, minus,
} from "./teiler.js";
import {
  entdeckenHoeren, entdeckenStand, teilerQuizBuchen, teilerRegelFertig, teilerStandSetzen, teilerZuruecksetzen,
} from "./entdeckenSpeicher.js";

/* ======================================================================
   TEILBARKEITSREGELN – WARUM FUNKTIONIEREN SIE? (Teil von „Mathe entdecken“)
   Für alle einstelligen Zahlen: Regel, Begründung, Zahlenbeispiele zum Ausprobieren, geführte Schritte.
   Reihenfolge: 2, 5, 3, 4, 6, 7, 8, 9 – danach das Quiz „Zahlen markieren“.
   Der Fortschritt wird je Schritt gespeichert (entdeckenSpeicher.js → teiler).
   Reine Mathematik: teiler.js (getestet).
   ====================================================================== */

const OK = "#0F7A4D", OK_GRUND = "#E6F6EF", NEIN_GRUND = "#FCE8EE";
const BLAU = { grund: "#EAF1FB", rand: C.see, text: C.see };
const GOLD = { grund: "#FFF6D6", rand: C.flaggold, text: "#7A5A00" };

const absatz = { color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, margin: "0 0 12px" };
const kickerStil = { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 6 };

/* „48 = 4 · 12“ bzw. „58 : 4 = 14 Rest 2“ */
const teilText = (x, t) => (x % t === 0 ? `${x} = ${t} · ${x / t}` : `${x} : ${t} = ${Math.floor(x / t)} Rest ${x % t}`);

const KURZ = {
  2: ["Die letzte Ziffer ist gerade (0, 2, 4, 6 oder 8).", "10 = 2 · 5"],
  5: ["Die letzte Ziffer ist 0 oder 5.", "10 = 5 · 2"],
  3: ["Die Quersumme ist durch 3 teilbar.", "10 = 9 + 1, 100 = 99 + 1, …"],
  4: ["Die Zahl aus den letzten zwei Ziffern ist durch 4 teilbar.", "100 = 4 · 25"],
  6: ["Die Zahl ist durch 2 und durch 3 teilbar.", "6 = 2 · 3, ohne gemeinsamen Teiler"],
  7: ["Letzte Ziffer streichen, ihr Doppeltes abziehen, wiederholen: kommt ein Vielfaches von 7 heraus, ist die Zahl durch 7 teilbar.", "n − 21 · e = 10 · (A − 2e)"],
  8: ["Die Zahl aus den letzten drei Ziffern ist durch 8 teilbar.", "1000 = 8 · 125"],
  9: ["Die Quersumme ist durch 9 teilbar.", "10 = 9 + 1, 100 = 99 + 1, …"],
};

/* ---------- kleine Bausteine ---------- */
function Urteil({ ok, children }) {
  return (
    <div role="status" style={{ marginTop: 10, borderRadius: 12, padding: "10px 12px", fontSize: 14, lineHeight: 1.55, fontWeight: 600,
      background: ok ? OK_GRUND : NEIN_GRUND, color: ok ? OK : C.gruenDunkel }}>{children}</div>
  );
}

function Block({ farbe, titel, children }) {
  return (
    <div style={{ borderRadius: 12, padding: "10px 12px", background: farbe.grund, borderLeft: `4px solid ${farbe.rand}`, marginTop: 10 }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: farbe.text, margin: "0 0 4px" }}>{titel}</p>
      {children}
    </div>
  );
}

const zeileStil = { fontSize: 15.5, fontWeight: 600, color: C.tinte, lineHeight: 1.6, margin: 0, overflowWrap: "anywhere", fontVariantNumeric: "tabular-nums" };
const kleinStil = { fontSize: 13, fontWeight: 400, color: C.grau, lineHeight: 1.55, margin: "3px 0 0" };

const BildKarte = ({ children }) => <div style={{ ...karte, padding: 16, marginTop: 14 }}>{children}</div>;
const Aufforderung = ({ children }) => <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 10px" }}>{children}</p>;

/* Zahl wählen: Beispiele, eigene Zahl, Zufallszahl */
function ZahlWahl({ n, setN, beispiele = [], bereich = [10, 9999] }) {
  const [text, setText] = useState(String(n));
  useEffect(() => { setText(String(n)); }, [n]);
  const chip = (aktiv) => ({ minHeight: 38, padding: "6px 12px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700,
    border: `1.5px solid ${aktiv ? C.see : C.linie}`, background: aktiv ? C.see : C.weiss, color: aktiv ? C.weiss : C.see });
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      {beispiele.map((b, i) => (
        <button key={b} type="button" aria-pressed={n === b} onClick={() => setN(b)} style={chip(n === b)}>{beispiele.length > 1 ? `${i + 1}. ` : ""}{b}</button>
      ))}
      <MatheFeld modus="ganz" value={text} aria-label="Eigene Zahl eingeben" placeholder="eigene Zahl"
        onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 5); setText(v); const x = parseInt(v, 10); if (x > 0) setN(x); }}
        onFocus={(e) => e.target.select()} onBlur={() => setText(String(n))}
        style={{ width: 112, height: 40, textAlign: "center", fontSize: 16, fontWeight: 700, fontFamily: "inherit", color: C.see, boxSizing: "border-box",
          border: `1.5px solid ${C.see}66`, borderRadius: 11, background: `${C.see}0D`, outline: "none" }} />
      <button type="button" onClick={() => setN(bereich[0] + Math.floor(Math.random() * (bereich[1] - bereich[0] + 1)))} style={chip(false)}>Zufallszahl</button>
    </div>
  );
}

/* Die Ziffern einer Zahl als Kästchen; die letzten k Ziffern hervorgehoben */
function ZifferReihe({ n, k }) {
  const s = String(n), kk = Math.min(k, s.length);
  return (
    <div role="img" aria-label={`Die Zahl ${n}`} style={{ display: "flex", justifyContent: "center", gap: 4, margin: "14px 0 4px", flexWrap: "wrap" }}>
      {s.split("").map((d, i) => {
        const hinten = i >= s.length - kk;
        return (
          <span key={i} style={{ width: 36, height: 46, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 10, fontSize: 22, fontWeight: 700,
            color: C.tinte, background: hinten ? GOLD.grund : BLAU.grund, border: `1.5px solid ${hinten ? GOLD.rand : BLAU.rand}` }}>{d}</span>
        );
      })}
    </div>
  );
}

/* ---------- Bild für 2, 5, 4, 8: vorderer Teil + letzte Ziffern ---------- */
function EndzifferBild({ t, beispiele }) {
  const k = ENDZIFFERN[t];
  const [n, setN] = useState(beispiele[0]);
  const { vorne, ende, p } = endzerlegung(n, k);
  const endeS = String(ende).padStart(Math.min(k, String(n).length), "0");
  const jaEnde = ende % t === 0;
  const stelle = k === 1 ? "letzte Ziffer" : k === 2 ? "letzten zwei Ziffern" : "letzten drei Ziffern";
  return (
    <BildKarte>
      <Aufforderung>Wähle eine Zahl und sieh, wie sie zerfällt: vorne der Teil, der garantiert durch {t} teilbar ist, hinten die {stelle}.</Aufforderung>
      <ZahlWahl n={n} setN={setN} beispiele={beispiele} />
      <ZifferReihe n={n} k={k} />
      <p style={{ ...zeileStil, textAlign: "center", fontSize: 17 }}>
        {n} = <span style={{ color: BLAU.text }}>{vorne} · {p}</span> + <span style={{ color: GOLD.text }}>{endeS}</span>
      </p>
      <Block farbe={BLAU} titel="DER VORDERE TEIL">
        <p style={zeileStil}>{vorne} · {p}</p>
        <p style={kleinStil}>Immer durch {t} teilbar, denn {p} = {t} · {hilfsFaktor(t)}.</p>
      </Block>
      <Block farbe={GOLD} titel={`DIE ${stelle.toUpperCase()}`}>
        <p style={zeileStil}>{endeS}{endeS !== String(ende) ? ` (also ${ende})` : ""}</p>
        <p style={kleinStil}>Durch {t} teilbar? <b style={{ color: jaEnde ? OK : C.gruenDunkel }}>{jaEnde ? "Ja" : "Nein"}</b> – {teilText(ende, t)}.</p>
      </Block>
      <Urteil ok={jaEnde}>
        {jaEnde ? "Teilbar + teilbar = teilbar" : "Teilbar + nicht teilbar = nicht teilbar"}: {n} ist {jaEnde ? "" : "nicht "}durch {t} teilbar.
        <span style={{ display: "block", fontWeight: 400, fontSize: 13, marginTop: 2 }}>Kontrolle: {teilText(n, t)}</span>
      </Urteil>
    </BildKarte>
  );
}

/* ---------- Bild für 3 und 9: Neunerblöcke und Quersumme ---------- */
function NeunerBild({ t, beispiele }) {
  const [n, setN] = useState(beispiele[0]);
  const z = neunerZerlegung(n);
  const zs = ziffern(n);
  const blockZeilen = z.zeilen.filter((r) => r.ziffer > 0);
  const neunerTerme = z.zeilen.filter((r) => r.neuner > 0).map((r) => r.neuner);
  const jaQ = z.quersumme % t === 0;
  return (
    <BildKarte>
      <Aufforderung>Probiere die drei Beispiele nacheinander aus – oder gib eine eigene Zahl ein.</Aufforderung>
      <ZahlWahl n={n} setN={setN} beispiele={beispiele} />
      <ZifferReihe n={n} k={0} />
      <Block farbe={{ grund: "#F4F6FA", rand: C.hellgrau, text: C.grau }} titel="JEDE STELLE ZERFÄLLT IN EINEN NEUNERBLOCK UND DIE ZIFFER">
        {blockZeilen.map((r, i) => (
          <p key={i} style={{ ...zeileStil, fontSize: 15 }}>
            {r.stelle === 1
              ? <>{r.ziffer} bleibt <span style={{ color: GOLD.text }}>{r.ziffer}</span> <span style={{ fontWeight: 400, color: C.grau }}>(Einer)</span></>
              : <>{r.ziffer} · {r.stelle} = <span style={{ color: BLAU.text }}>{r.ziffer} · {r.stelle - 1}</span> + <span style={{ color: GOLD.text }}>{r.ziffer}</span></>}
          </p>
        ))}
      </Block>
      <Block farbe={BLAU} titel="ALLE NEUNERBLÖCKE ZUSAMMEN">
        <p style={zeileStil}>{neunerTerme.length > 1 ? `${neunerTerme.join(" + ")} = ` : ""}{z.neunerSumme}</p>
        <p style={kleinStil}>
          Immer durch {t} teilbar: 9, 99, 999 … bestehen nur aus Neunen (9 = 9 · 1, 99 = 9 · 11, 999 = 9 · 111). Hier: {z.neunerSumme === 0 ? "0 = " + t + " · 0" : teilText(z.neunerSumme, t)}.
        </p>
      </Block>
      <Block farbe={GOLD} titel="WAS ÜBRIG BLEIBT: DIE QUERSUMME">
        <p style={zeileStil}>{zs.join(" + ")} = {z.quersumme}</p>
        <p style={kleinStil}>Durch {t} teilbar? <b style={{ color: jaQ ? OK : C.gruenDunkel }}>{jaQ ? "Ja" : "Nein"}</b> – {teilText(z.quersumme, t)}.</p>
      </Block>
      <Urteil ok={jaQ}>
        {n} = {z.neunerSumme} + {z.quersumme}. {jaQ ? "Teilbar + teilbar = teilbar" : "Teilbar + nicht teilbar = nicht teilbar"}: {n} ist {jaQ ? "" : "nicht "}durch {t} teilbar.
        <span style={{ display: "block", fontWeight: 400, fontSize: 13, marginTop: 2 }}>Kontrolle: {teilText(n, t)}</span>
      </Urteil>
    </BildKarte>
  );
}

/* ---------- Bild für 6: zwei Prüfungen ---------- */
function SechserBild({ beispiele }) {
  const [n, setN] = useState(beispiele[0]);
  const e2 = erklaerung(n, 2), e3 = erklaerung(n, 3), e6 = n % 6 === 0;
  const Pruef = ({ t, e }) => (
    <div style={{ flex: "1 1 200px", borderRadius: 12, padding: "10px 12px", background: e.ok ? OK_GRUND : NEIN_GRUND, borderLeft: `4px solid ${e.ok ? OK : C.gruen}` }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: e.ok ? OK : C.gruenDunkel, margin: "0 0 4px" }}>DURCH {t}: {e.ok ? "JA" : "NEIN"}</p>
      <p style={{ ...kleinStil, margin: 0, color: C.tinte }}>{e.text}</p>
    </div>
  );
  return (
    <BildKarte>
      <Aufforderung>Prüfe getrennt auf 2 und auf 3. Nur wenn beides stimmt, ist die Zahl durch 6 teilbar.</Aufforderung>
      <ZahlWahl n={n} setN={setN} beispiele={beispiele} />
      <p style={{ ...zeileStil, textAlign: "center", fontSize: 26, margin: "14px 0 10px", color: C.tinte }}>{n}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Pruef t={2} e={e2} />
        <Pruef t={3} e={e3} />
      </div>
      <Urteil ok={e6}>
        {e2.ok && e3.ok ? "Beides trifft zu" : !e2.ok && !e3.ok ? "Weder 2 noch 3" : !e2.ok ? "Die 2 fehlt" : "Die 3 fehlt"}: {n} ist {e6 ? "" : "nicht "}durch 6 teilbar.
        <span style={{ display: "block", fontWeight: 400, fontSize: 13, marginTop: 2 }}>Kontrolle: {teilText(n, 6)}</span>
      </Urteil>
    </BildKarte>
  );
}

/* ---------- Bild für 7: das Verfahren Schritt für Schritt ---------- */
function SiebenerBild({ beispiele }) {
  const [n, setN] = useState(beispiele[0]);
  const k = siebenerKette(n);
  return (
    <BildKarte>
      <Aufforderung>Sieh dir an, was bei jedem Durchgang passiert: Ziffer abtrennen, Siebener-Vielfaches abziehen, Null weglassen.</Aufforderung>
      <ZahlWahl n={n} setN={setN} beispiele={beispiele} />
      <div style={{ marginTop: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: C.grau, margin: "0 0 6px" }}>DIE NEUN ZAHLEN, DIE MAN HÖCHSTENS ABZIEHT (21 · LETZTE ZIFFER)</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9, minmax(0, 1fr))", gap: 4 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((e) => {
            const benutzt = k.schritte.some((s) => s.e === e);
            return (
              <div key={e} style={{ textAlign: "center", borderRadius: 8, padding: "5px 0", background: benutzt ? GOLD.grund : "#F4F6FA", border: `1.5px solid ${benutzt ? GOLD.rand : "transparent"}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: C.grau }}>{e}</div>
                <div style={{ fontSize: "clamp(10.5px, 2.8vw, 13px)", fontWeight: 700, color: C.tinte }}>{21 * e}</div>
              </div>
            );
          })}
        </div>
        <p style={{ ...kleinStil, fontSize: 12.5 }}>Alle neun sind Zahlen aus der Siebenerreihe (21 = 7 · 3, 42 = 7 · 6, …, 189 = 7 · 27).</p>
      </div>
      {k.schritte.length === 0 && (
        <Block farbe={BLAU} titel="DIE ZAHL IST SCHON KLEIN">
          <p style={zeileStil}>{n}</p>
          <p style={kleinStil}>Unter 100 erkennst du es an der Siebenerreihe: {k.ok ? `${n} = 7 · ${k.faktor}` : `${n} liegt zwischen 7 · ${Math.floor(n / 7)} = ${7 * Math.floor(n / 7)} und 7 · ${Math.floor(n / 7) + 1} = ${7 * (Math.floor(n / 7) + 1)}`}.</p>
        </Block>
      )}
      {k.schritte.map((s, i) => (
        <Block key={i} farbe={BLAU} titel={`DURCHGANG ${i + 1}`}>
          <p style={zeileStil}>{s.n} = <span style={{ color: BLAU.text }}>{s.A}</span> | <span style={{ color: GOLD.text }}>{s.e}</span> <span style={{ fontWeight: 400, color: C.grau, fontSize: 13 }}>(n = 10 · {s.A} + {s.e})</span></p>
          <p style={kleinStil}>{s.n} − 21 · {s.e} = {s.n} − {s.abgezogen} = {minus(s.rest)} = 10 · {s.ergebnis < 0 ? `(${minus(s.ergebnis)})` : s.ergebnis}</p>
          <p style={{ ...zeileStil, marginTop: 4, color: GOLD.text }}>Abkürzung: {s.A} − 2 · {s.e} = {minus(s.ergebnis)}</p>
          {s.ergebnis < 0 && <p style={kleinStil}>Das Minus spielt keine Rolle: {minus(s.ergebnis)} und {Math.abs(s.ergebnis)} sind beide durch 7 teilbar – oder beide nicht.</p>}
        </Block>
      ))}
      {k.schritte.length > 0 && (
        <p style={{ ...zeileStil, marginTop: 12, textAlign: "center" }}>
          Ergebnis: {k.endwert}. {k.ok ? `Das ist 7 · ${k.faktor}, ein Vielfaches von 7.` : "Das ist kein Vielfaches von 7."}
        </p>
      )}
      <Urteil ok={k.ok}>
        {n} ist {k.ok ? "" : "nicht "}durch 7 teilbar.
        <span style={{ display: "block", fontWeight: 400, fontSize: 13, marginTop: 2 }}>Kontrolle: {teilText(n, 7)}</span>
      </Urteil>
    </BildKarte>
  );
}

/* ---------- Inhalte der acht Regeln ---------- */
const P = ({ children }) => <p style={absatz}>{children}</p>;

function regelInhalt(t) {
  switch (t) {
    case 2: return {
      regel: "Eine Zahl ist durch 2 teilbar, wenn ihre letzte Ziffer gerade ist – also 0, 2, 4, 6 oder 8.",
      warum: (<>
        <P>Jede Zahl lässt sich in Zehner und letzte Ziffer zerlegen: 3846 = 384 · 10 + 6.</P>
        <P>Der Zehnerteil 384 · 10 ist immer durch 2 teilbar, denn 10 = 2 · 5. Mit dem Hilfssatz heißt das: Ob die ganze Zahl durch 2 teilbar ist, entscheidet allein die letzte Ziffer.</P>
        <P>Welche Ziffern von 0 bis 9 sind durch 2 teilbar? Die geraden: 0, 2, 4, 6 und 8. Die 0 gehört dazu, denn 0 = 2 · 0.</P>
      </>),
      bild: <EndzifferBild t={2} beispiele={[3846, 517, 2090]} />,
      schritte: [
        { id: "t2a", titel: "Zerlegen", typ: "zahl", frage: "Zerlege 3846 in Zehner und letzte Ziffer: 3846 = 384 · 10 + ?", text: "Rest =", wert: 6, breite: 90,
          hinweise: ["Die letzte Ziffer bleibt übrig, alles davor bildet die Zehner."],
          fehler: [{ wert: 46, text: "46 sind die letzten zwei Ziffern. Bei Zehnern bleibt nur die letzte Ziffer übrig: 384 · 10 = 3840." }, { wert: 38, text: "38 steht vorne. Gesucht ist, was nach 3840 noch fehlt." }],
          erklaerung: "3846 = 3840 + 6 = 384 · 10 + 6." },
        { id: "t2b", titel: "Worauf kommt es an?", typ: "wahl", frage: "Ist 2718 durch 2 teilbar? Was entscheidet das?", richtig: "a",
          optionen: [["a", "Nur die letzte Ziffer 8 – sie ist gerade"], ["b", "Die Quersumme 18"], ["c", "Die erste Ziffer 2"]],
          fehler: [{ wahl: "b", text: "Die Quersumme brauchst du für 3 und 9. Bei der 2 reicht die letzte Ziffer, weil der Zehnerteil immer durch 2 teilbar ist (10 = 2 · 5)." },
            { wahl: "c", text: "Die erste Ziffer gehört zum Zehnerteil 271 · 10 – und der ist immer durch 2 teilbar. Entscheidend ist nur die letzte Ziffer." }],
          erklaerung: "2718 = 271 · 10 + 8. Der Zehnerteil ist durch 2 teilbar, die 8 auch – also ist 2718 durch 2 teilbar (2718 = 2 · 1359)." },
        { id: "t2c", titel: "Anwenden", typ: "wahl", frage: "Welche Zahl ist NICHT durch 2 teilbar?", richtig: "c",
          optionen: [["a", "5280"], ["b", "7614"], ["c", "1357"], ["d", "4000"]],
          fehler: [{ wahl: "d", text: "Die 0 zählt als gerade Ziffer: 4000 = 2 · 2000." }],
          erklaerung: "1357 endet auf 7 – eine ungerade Ziffer. Die anderen enden auf 0, 4 und 0." },
      ],
    };
    case 5: return {
      regel: "Eine Zahl ist durch 5 teilbar, wenn ihre letzte Ziffer 0 oder 5 ist.",
      warum: (<>
        <P>Dieselbe Zerlegung wie bei der 2: Zahl = Zehnerteil · 10 + letzte Ziffer, zum Beispiel 2735 = 273 · 10 + 5.</P>
        <P>Der Zehnerteil ist immer durch 5 teilbar, denn 10 = 5 · 2. Wieder entscheidet nur die letzte Ziffer.</P>
        <P>Welche Ziffern von 0 bis 9 stehen in der Fünferreihe? 0 = 5 · 0 und 5 = 5 · 1 – sonst keine, denn schon die nächste Zahl der Fünferreihe ist 10.</P>
      </>),
      bild: <EndzifferBild t={5} beispiele={[2735, 6048, 1590]} />,
      schritte: [
        { id: "t5a", titel: "Warum die letzte Ziffer?", typ: "wahl", frage: "Warum reicht bei der 5 die letzte Ziffer?", richtig: "a",
          optionen: [["a", "Weil 10 = 5 · 2: Der Zehnerteil ist immer durch 5 teilbar."], ["b", "Weil jede zweite Zahl durch 5 teilbar ist."], ["c", "Weil 5 eine ungerade Zahl ist."]],
          fehler: [{ wahl: "b", text: "Nur jede fünfte Zahl ist durch 5 teilbar: 5, 10, 15, 20, …" }, { wahl: "c", text: "Dass 5 ungerade ist, erklärt die Regel nicht. Entscheidend ist 10 = 5 · 2." }],
          erklaerung: "10 = 5 · 2, also ist jedes Vielfache von 10 auch ein Vielfaches von 5. Übrig bleibt nur die letzte Ziffer." },
        { id: "t5b", titel: "Zählen", typ: "zahl", frage: "Wie viele Zahlen von 1 bis 100 sind durch 5 teilbar?", text: "Anzahl:", wert: 20, breite: 90,
          hinweise: ["Schau dir einen Zehnerblock an: 1 bis 10. Welche Zahlen davon sind durch 5 teilbar?"],
          fehler: [{ wert: 10, text: "Das sind nur die Zahlen, die auf 0 enden (oder nur die auf 5). In jedem Zehnerblock passen zwei: eine auf 5 und eine auf 0 – also 2 · 10." }],
          erklaerung: "In jedem Block von 10 Zahlen sind genau zwei durch 5 teilbar (…5 und …0). 10 Blöcke · 2 = 20 – oder 100 : 5 = 20." },
        { id: "t5c", titel: "Anwenden", typ: "wahl", frage: "Welche Zahl ist durch 5 teilbar?", richtig: "c",
          optionen: [["a", "6504"], ["b", "6051"], ["c", "6405"]],
          fehler: [{ wahl: "a", text: "Die 5 steht hier vorne, nicht am Ende – 6504 endet auf 4. Nur die letzte Ziffer zählt." }, { wahl: "b", text: "6051 endet auf 1, nicht auf 0 oder 5." }],
          erklaerung: "6405 = 640 · 10 + 5, beides ist durch 5 teilbar. 6405 = 5 · 1281." },
      ],
    };
    case 3: return {
      regel: "Eine Zahl ist durch 3 teilbar, wenn ihre Quersumme durch 3 teilbar ist.",
      warum: (<>
        <P>Bei der 3 hilft die Zerlegung in Zehner nicht, denn 10 ist nicht durch 3 teilbar. Aber 10 ist nur um 1 größer als 9, und 9 ist durch 3 teilbar. Genauso ist 100 = 99 + 1 und 1000 = 999 + 1: lauter Neunerzahlen plus 1.</P>
        <P>Zerlege deshalb jede Stelle in einen Neunerblock und die Ziffer selbst: 2 · 100 = 2 · 99 + 2. Alle Neunerblöcke sind durch 3 teilbar (9 = 3 · 3, 99 = 3 · 33, …). Übrig bleiben die Ziffern – ihre Summe ist die Quersumme.</P>
        <P>Mit dem Hilfssatz: Die Zahl ist genau dann durch 3 teilbar, wenn die Quersumme es ist. Umgekehrt klappt es auch: 14 = 9 + 5 – der Rest 5 ist nicht durch 3 teilbar, also ist es 14 auch nicht. Probiere es an 12, 84 und 213 aus.</P>
      </>),
      bild: <NeunerBild t={3} beispiele={[12, 84, 213]} />,
      schritte: [
        { id: "t3a", titel: "Beispiel 12", typ: "zahl", frage: "Zerlege 12 = 1 · 10 + 2 und schreibe 10 = 9 + 1. Dann ist 12 = 9 + (1 + 2). Wie groß ist der Rest in der Klammer?", text: "Rest =", wert: 3, breite: 90,
          fehler: [{ wert: 2, text: "Zum Rest gehören beide Ziffern: 1 + 2, denn auch die Ziffer 1 aus dem Neunerblock bleibt übrig." }],
          erklaerung: "12 = 9 + 3. Die 9 ist durch 3 teilbar, der Rest 3 = 1 + 2 (die Quersumme) auch – also ist 12 durch 3 teilbar (12 = 3 · 4)." },
        { id: "t3b", titel: "Beispiel 84", typ: "wahl", frage: "84 = 8 · 10 + 4 = 8 · 9 + (8 + 4) = 72 + 12. Ist 84 durch 3 teilbar?", richtig: "a",
          optionen: [["a", "Ja – 72 und 12 sind beide durch 3 teilbar"], ["b", "Nein – 12 ist größer als 9"], ["c", "Nein – 84 endet auf 4"]],
          fehler: [{ wahl: "b", text: "Die Größe der Quersumme ist egal – entscheidend ist, ob sie durch 3 teilbar ist. 12 = 3 · 4." },
            { wahl: "c", text: "Die letzte Ziffer entscheidet nur bei 2 und 5. Bei der 3 zählt die Quersumme: 8 + 4 = 12." }],
          erklaerung: "72 = 3 · 24 und 12 = 3 · 4 – zwei Vielfache von 3 ergeben wieder ein Vielfaches von 3: 84 = 3 · 28." },
        { id: "t3c", titel: "Beispiel 213", typ: "zahl", frage: "213 = 2 · 100 + 1 · 10 + 3 = (2 · 99 + 1 · 9) + (2 + 1 + 3). Wie groß ist die Summe in der ersten Klammer?", text: "Neunerblock =", wert: 207, breite: 100,
          hinweise: ["Rechne 2 · 99 und 1 · 9 einzeln und addiere."],
          fehler: [{ wert: 198, text: "198 = 2 · 99 ist nur der Hunderterteil. Dazu kommt noch 1 · 9 von den Zehnern." }],
          erklaerung: "198 + 9 = 207 = 3 · 69, und die Quersumme 2 + 1 + 3 = 6 = 3 · 2. Also ist 213 durch 3 teilbar: 213 = 3 · 71." },
      ],
    };
    case 4: return {
      regel: "Eine Zahl ist durch 4 teilbar, wenn die Zahl aus ihren letzten beiden Ziffern durch 4 teilbar ist.",
      warum: (<>
        <P>Probieren wir zuerst, ob die letzte Ziffer genügt. 12 und 22 enden beide auf 2, aber nur 12 ist durch 4 teilbar. Der Grund: 10 ist nicht durch 4 teilbar (10 = 4 · 2 + 2).</P>
        <P>Dafür ist 100 = 4 · 25 durch 4 teilbar. Zerlege deshalb in Hunderter und die letzten zwei Ziffern: 1348 = 13 · 100 + 48.</P>
        <P>Der Hunderterteil ist immer durch 4 teilbar. Es entscheidet die Zahl aus den letzten beiden Ziffern: 48 = 4 · 12, also ist 1348 durch 4 teilbar.</P>
      </>),
      bild: <EndzifferBild t={4} beispiele={[1348, 2758, 7300]} />,
      schritte: [
        { id: "t4a", titel: "Warum nicht nur eine Ziffer?", typ: "wahl", frage: "12 und 22 enden beide auf 2. Warum reicht die letzte Ziffer bei der 4 nicht?", richtig: "a",
          optionen: [["a", "Weil 10 nicht durch 4 teilbar ist – der Zehnerteil kann Rest 2 lassen."], ["b", "Weil 4 eine gerade Zahl ist."], ["c", "Weil 4 kleiner als 10 ist."]],
          fehler: [{ wahl: "b", text: "Auch die 2 ist gerade und braucht trotzdem nur die letzte Ziffer. Der Unterschied: 10 ist durch 2 teilbar, durch 4 aber nicht." },
            { wahl: "c", text: "Auch die 5 ist kleiner als 10 und kommt mit einer Ziffer aus. Entscheidend ist, ob 10 durch die Zahl teilbar ist – durch 4 ist es das nicht." }],
          erklaerung: "10 = 4 · 2 + 2: Jeder Zehner bringt Rest 2 mit. 12 = 3 · 4 geht auf, 22 = 5 · 4 + 2 nicht. Erst 100 = 4 · 25 ist durch 4 teilbar." },
        { id: "t4b", titel: "Zwei Ziffern prüfen", typ: "zahl", frage: "Die letzten beiden Ziffern von 3572 bilden die Zahl 72. Wie oft passt die 4 in 72?", text: "72 = 4 ·", wert: 18, breite: 90,
          hinweise: ["4 · 10 = 40, und dann noch 32 übrig."],
          fehler: [{ wert: 8, text: "4 · 8 = 32. Rechne weiter: 72 : 4." }],
          erklaerung: "72 = 4 · 18 – also ist 3572 = 35 · 100 + 72 durch 4 teilbar (3572 = 4 · 893)." },
        { id: "t4c", titel: "Anwenden", typ: "wahl", frage: "Welche Zahl ist NICHT durch 4 teilbar?", richtig: "c",
          optionen: [["a", "4036"], ["b", "7524"], ["c", "2918"], ["d", "6100"]],
          fehler: [{ wahl: "d", text: "Die letzten beiden Ziffern 00 stehen für 0, und 0 = 4 · 0 – also teilbar (6100 = 4 · 1525)." },
            { wahl: "a", text: "36 = 4 · 9 – teilbar." }, { wahl: "b", text: "24 = 4 · 6 – teilbar." }],
          erklaerung: "18 : 4 = 4 Rest 2 – nicht teilbar. 36 = 4 · 9, 24 = 4 · 6 und 00 = 4 · 0 gehen dagegen auf." },
      ],
    };
    case 6: return {
      regel: "Eine Zahl ist durch 6 teilbar, wenn sie durch 2 und durch 3 teilbar ist.",
      warum: (<>
        <P>Das klappt, weil 6 = 2 · 3 ist. Wer durch 6 teilbar ist (n = 6 · m), ist natürlich auch durch 2 und durch 3 teilbar.</P>
        <P>Und umgekehrt? Ist n durch 2 teilbar, dann n = 2 · k. Soll n auch durch 3 teilbar sein, muss die 3 in n stecken. In der 2 steckt keine 3, also steckt sie in k: k = 3 · m und n = 2 · 3 · m = 6 · m.</P>
        <P>Prüfe also getrennt: Ist die letzte Ziffer gerade? Ist die Quersumme durch 3 teilbar? Nur wenn beides stimmt, ist die Zahl durch 6 teilbar.</P>
      </>),
      bild: <SechserBild beispiele={[78, 124, 231]} />,
      extra: (
        <Aufklapp titel="Aufpassen: Das geht nicht mit jedem Paar">
          <p style={{ margin: "0 0 8px" }}>12 ist durch 2 und durch 4 teilbar, aber nicht durch 8 = 2 · 4. Der Trick klappt nur, wenn die beiden Zahlen keinen gemeinsamen Teiler haben. 2 und 3 haben keinen – 2 und 4 teilen sich die 2.</p>
          <p style={{ margin: 0 }}>Mit demselben Trick: durch 10 (2 und 5), durch 12 (3 und 4), durch 15 (3 und 5), durch 18 (2 und 9).</p>
        </Aufklapp>
      ),
      schritte: [
        { id: "t6a", titel: "Zwei Prüfungen", typ: "wahl", frage: "Ist 4134 durch 6 teilbar?", richtig: "a",
          optionen: [["a", "Ja – gerade, und die Quersumme 12 ist durch 3 teilbar"], ["b", "Nein – die Quersumme 12 ist nicht durch 6 teilbar"], ["c", "Nein – 4134 ist nicht durch 3 teilbar"]],
          fehler: [{ wahl: "b", text: "Du musst nicht die Quersumme durch 6 teilen. Prüfe getrennt: letzte Ziffer für die 2, Quersumme für die 3." },
            { wahl: "c", text: "4 + 1 + 3 + 4 = 12 = 3 · 4 – doch, durch 3 ist sie teilbar." }],
          erklaerung: "Die letzte Ziffer 4 ist gerade, die Quersumme 12 = 3 · 4. Also ist 4134 durch 2 und durch 3 teilbar – und damit durch 6 (4134 = 6 · 689)." },
        { id: "t6b", titel: "Eine Hälfte genügt nicht", typ: "wahl", frage: "Welche Zahl ist durch 3, aber NICHT durch 6 teilbar?", richtig: "a",
          optionen: [["a", "135"], ["b", "144"], ["c", "246"], ["d", "252"]],
          fehler: [{ wahl: "b", text: "144 ist gerade und hat die Quersumme 9 – durch 2 und durch 3, also durch 6 teilbar." },
            { wahl: "c", text: "246 ist gerade und hat die Quersumme 12 – durch 2 und durch 3, also durch 6 teilbar." },
            { wahl: "d", text: "252 ist gerade und hat die Quersumme 9 – durch 2 und durch 3, also durch 6 teilbar." }],
          erklaerung: "135 ist ungerade, also nicht durch 2 und damit nicht durch 6. Die Quersumme 9 zeigt: durch 3 ist sie teilbar." },
        { id: "t6c", titel: "Zählen", typ: "zahl", frage: "Wie viele Zahlen von 1 bis 30 sind durch 6 teilbar?", text: "Anzahl:", wert: 5, breite: 90,
          hinweise: ["Das ist die Sechserreihe: 6, 12, …"],
          fehler: [{ wert: 10, text: "Das sind die Vielfachen von 3. Durch 6 braucht es zusätzlich die 2." }, { wert: 15, text: "Das sind die Vielfachen von 2. Durch 6 braucht es zusätzlich die 3." }],
          erklaerung: "6, 12, 18, 24, 30: fünf Zahlen (30 : 6 = 5). Von den 10 Vielfachen der 3 ist jedes zweite gerade." },
      ],
    };
    case 7: return {
      regel: "Streiche die letzte Ziffer und ziehe ihr Doppeltes von der restlichen Zahl ab. Wiederhole das, bis die Zahl klein ist. Ist das Ergebnis ein Vielfaches von 7 (0, 7, 14, 21, …), war die Zahl durch 7 teilbar.",
      warum: (<>
        <P>Das Verfahren: Streiche die letzte Ziffer e und ziehe ihr Doppeltes vom Rest A ab, also A − 2e. Bei 203 heißt das 20 − 2 · 3 = 14. Was steckt dahinter?</P>
        <P>Die Zahl ist n = 10 · A + e. Ziehe davon 21 · e ab – das ist eine Zahl aus der Siebenerreihe, nämlich 21, 42, 63, 84, 105, 126, 147, 168 oder 189 (je nach Endziffer 1 bis 9). Es bleibt n − 21 · e = 10 · A + e − 21 · e = 10 · (A − 2e).</P>
        <P>Weil man nur ein Vielfaches von 7 abgezogen hat, ist n genau dann durch 7 teilbar, wenn 10 · (A − 2e) es ist. In der 10 = 2 · 5 steckt keine 7. Also muss die 7 in A − 2e stecken – und genau das prüft man. Mit dem kleineren Wert geht es genauso weiter, bis man ihn an der Siebenerreihe erkennt.</P>
      </>),
      bild: <SiebenerBild beispiele={[203, 1316, 1235]} />,
      schritte: [
        { id: "t7a", titel: "Das Siebener-Vielfache", typ: "zahl", frage: "203 endet auf 3. Welches Vielfache von 7 ziehst du ab? Es ist 21 · 3 =", text: "21 · 3 =", wert: 63, breite: 90,
          fehler: [{ wert: 21, text: "21 · 1 wäre es bei der Endziffer 1. Bei der Endziffer 3 ist es 21 · 3." }],
          erklaerung: "203 − 63 = 140 = 10 · 14. Weil 63 = 7 · 9 durch 7 teilbar ist, ändert das Abziehen nichts an der Siebener-Teilbarkeit." },
        { id: "t7b", titel: "Die Null weglassen", typ: "wahl", frage: "Warum darf man die 10 in 140 = 10 · 14 weglassen und nur 14 prüfen?", richtig: "a",
          optionen: [["a", "In 10 = 2 · 5 steckt keine 7 – sie müsste also in 14 stecken."], ["b", "Weil 10 durch 7 teilbar ist."], ["c", "Weil Nullen am Ende nie etwas ausmachen."]],
          fehler: [{ wahl: "b", text: "10 : 7 geht nicht auf. Gerade deshalb muss die 7 im Faktor 14 stecken." },
            { wahl: "c", text: "Nullen machen oft etwas aus: 30 ist durch 5 teilbar, 3 nicht. Bei der 7 klappt es nur, weil 7 kein Teiler von 10 ist." }],
          erklaerung: "Ein Produkt 10 · m ist nur dann durch 7 teilbar, wenn die 7 in m steckt – denn in der 10 steckt keine. Also genügt es, m = 14 zu prüfen." },
        { id: "t7c", titel: "Die Abkürzung", typ: "zahl", frage: "Kürzer geht es so: 203 = 20 | 3. Berechne A − 2e = 20 − 2 · 3.", text: "Ergebnis =", wert: 14, breite: 90,
          fehler: [{ wert: 17, text: "Das Doppelte der Ziffer 3 ist 6, nicht 3: 20 − 6." }, { wert: 26, text: "Es wird abgezogen, nicht addiert." }],
          erklaerung: "14 = 7 · 2, also ist 203 durch 7 teilbar: 203 = 7 · 29." },
        { id: "t7d", titel: "Eine Zahl, die nicht passt", typ: "wahl", frage: "Ist 1235 durch 7 teilbar?", richtig: "a",
          optionen: [["a", "Nein – 123 − 10 = 113, dann 11 − 6 = 5, und 5 ist kein Vielfaches von 7"], ["b", "Ja – die Rechnung geht ohne Rest auf"], ["c", "Ja – 1235 endet auf 5"]],
          fehler: [{ wahl: "b", text: "Am Ende bleibt 5. Nur 0, 7, 14, 21 … sind Vielfache von 7." }, { wahl: "c", text: "Die Endziffer sagt bei der 7 nichts aus – dafür braucht man das Verfahren." }],
          erklaerung: "1235 : 7 = 176 Rest 3. Das Verfahren zeigt es früh: 5 ist kein Vielfaches von 7." },
      ],
    };
    case 8: return {
      regel: "Eine Zahl ist durch 8 teilbar, wenn die Zahl aus ihren letzten drei Ziffern durch 8 teilbar ist.",
      warum: (<>
        <P>Wie bei der 4 gehen wir einen Schritt weiter. Hundert genügt nicht: 100 = 8 · 12 + 4. Darum enden 112, 212 und 312 alle auf 12, aber nur 112 und 312 sind durch 8 teilbar.</P>
        <P>Erst 1000 = 8 · 125 ist durch 8 teilbar. Zerlege deshalb in Tausender und die letzten drei Ziffern: 5816 = 5 · 1000 + 816.</P>
        <P>Der Tausenderteil ist immer durch 8 teilbar. Es entscheidet die Zahl aus den letzten drei Ziffern: 816 = 8 · 102, also ist 5816 durch 8 teilbar.</P>
      </>),
      bild: <EndzifferBild t={8} beispiele={[5816, 3124, 9112]} />,
      extra: (
        <Aufklapp titel="Abkürzung für Schnelle">
          <p style={{ margin: "0 0 8px" }}>Ist die Hunderterziffer gerade, genügt es, die letzten zwei Ziffern auf Teilbarkeit durch 8 zu prüfen. Ist sie ungerade, rechne vorher 4 dazu.</p>
          <p style={{ margin: "0 0 8px" }}>Grund: 100 = 96 + 4, und 96 = 8 · 12 ist durch 8 teilbar. Jeder Hunderter lässt also Rest 4, zwei Hunderter Rest 8 – das geht wieder auf.</p>
          <p style={{ margin: 0 }}>Beispiel 312: Hunderterziffer 3 (ungerade), also 12 + 4 = 16 = 8 · 2. Ja, teilbar. Bei 212 ist die Hunderterziffer gerade: 12 ist nicht durch 8 teilbar, also 212 auch nicht.</p>
        </Aufklapp>
      ),
      schritte: [
        { id: "t8a", titel: "Warum nicht zwei Ziffern?", typ: "wahl", frage: "112, 212 und 312 enden alle auf 12. Welche davon sind durch 8 teilbar?", richtig: "a",
          optionen: [["a", "112 und 312"], ["b", "Alle drei"], ["c", "Nur 112"]],
          fehler: [{ wahl: "b", text: "212 : 8 = 26 Rest 4 – nicht teilbar." }, { wahl: "c", text: "Auch 312 = 8 · 39 geht auf." }],
          erklaerung: "112 = 8 · 14 und 312 = 8 · 39, aber 212 = 8 · 26 + 4. Zwei Ziffern reichen also nicht – die Hunderterziffer zählt mit." },
        { id: "t8b", titel: "Drei Ziffern prüfen", typ: "zahl", frage: "Die letzten drei Ziffern von 6344 bilden die Zahl 344. Wie oft passt die 8 in 344?", text: "344 = 8 ·", wert: 43, breite: 90,
          hinweise: ["8 · 40 = 320, und dann noch 24 übrig."],
          fehler: [{ wert: 4, text: "8 · 4 = 32 – das sind nur die Zehner. 344 ist viel größer." }],
          erklaerung: "344 = 8 · 43 – also ist 6344 = 6 · 1000 + 344 durch 8 teilbar (6344 = 8 · 793)." },
        { id: "t8c", titel: "Anwenden", typ: "wahl", frage: "Welche Zahl ist durch 8 teilbar?", richtig: "b",
          optionen: [["a", "1204"], ["b", "5336"], ["c", "7402"], ["d", "3100"]],
          fehler: [{ wahl: "a", text: "204 : 8 = 25 Rest 4 – nicht teilbar." }, { wahl: "c", text: "402 : 8 = 50 Rest 2 – nicht teilbar." },
            { wahl: "d", text: "100 : 8 = 12 Rest 4. Obwohl 3100 durch 4 teilbar ist, reicht das für die 8 nicht." }],
          erklaerung: "336 = 8 · 42, also ist 5336 durch 8 teilbar (5336 = 8 · 667)." },
      ],
    };
    default: return {  // 9
      regel: "Eine Zahl ist durch 9 teilbar, wenn ihre Quersumme durch 9 teilbar ist.",
      warum: (<>
        <P>Genau wie bei der 3: Jede Stelle zerfällt in einen Neunerblock und die Ziffer selbst – 2 · 100 = 2 · 99 + 2. Die Neunerblöcke 9, 99, 999 … sind aber nicht nur durch 3, sondern auch durch 9 teilbar (9 = 9 · 1, 99 = 9 · 11, 999 = 9 · 111).</P>
        <P>Darum entscheidet wieder die Quersumme – diesmal muss sie durch 9 teilbar sein. Probiere es an 27, 162 und 387 aus.</P>
        <P>Aufpassen: Eine Quersumme von 12 reicht für die 3, aber nicht für die 9. 21 hat die Quersumme 3 – durch 3 teilbar, durch 9 nicht.</P>
      </>),
      bild: <NeunerBild t={9} beispiele={[27, 162, 387]} />,
      schritte: [
        { id: "t9a", titel: "Beispiel 27", typ: "zahl", frage: "27 = 2 · 10 + 7 = 2 · 9 + (2 + 7). Wie groß ist die Quersumme 2 + 7?", text: "Quersumme =", wert: 9, breite: 100,
          erklaerung: "27 = 18 + 9. Beide Teile sind durch 9 teilbar, also ist 27 = 9 · 3 durch 9 teilbar." },
        { id: "t9b", titel: "Beispiel 162", typ: "wahl", frage: "162 = 1 · 99 + 6 · 9 + (1 + 6 + 2) = 153 + 9. Was folgt daraus?", richtig: "a",
          optionen: [["a", "162 ist durch 9 teilbar: 153 = 9 · 17 und 9 = 9 · 1"], ["b", "162 ist nicht durch 9 teilbar, weil 153 so groß ist"], ["c", "Man kann nichts sagen"]],
          fehler: [{ wahl: "b", text: "Die Größe zählt nicht. 153 = 9 · 17 ist ein Vielfaches von 9, genau wie die Quersumme 9." },
            { wahl: "c", text: "Doch: Ein Vielfaches von 9 plus ein Vielfaches von 9 ist wieder ein Vielfaches von 9." }],
          erklaerung: "Neunerblock 99 + 54 = 153 = 9 · 17 und Quersumme 9 – beide durch 9 teilbar. Also 162 = 9 · 18." },
        { id: "t9c", titel: "3 oder 9?", typ: "wahl", frage: "Die Quersumme von 4827 ist 21. Was gilt?", richtig: "b",
          optionen: [["a", "Durch 3 und durch 9 teilbar"], ["b", "Durch 3, aber nicht durch 9 teilbar"], ["c", "Weder durch 3 noch durch 9 teilbar"], ["d", "Durch 9, aber nicht durch 3 teilbar"]],
          fehler: [{ wahl: "a", text: "21 = 3 · 7, aber 21 : 9 = 2 Rest 3 – für die 9 reicht es nicht." },
            { wahl: "c", text: "21 = 3 · 7 ist durch 3 teilbar." },
            { wahl: "d", text: "Was durch 9 teilbar ist, ist auch durch 3 teilbar, denn 9 = 3 · 3. Ein Vielfaches von 9 ohne 3 gibt es nicht." }],
          erklaerung: "21 ist durch 3, aber nicht durch 9 teilbar. Also ist 4827 = 3 · 1609, aber nicht durch 9 teilbar." },
      ],
    };
  }
}

/* ---------- Eine Regel ---------- */
function RegelSeite({ t, index, stand, setStand, onWeiter, onZurueck, onUebersicht }) {
  const inhalt = useMemo(() => regelInhalt(t), [t]);
  const fertig = stand >= TEILER_SCHRITTE[index];
  const letzte = index === TEILER_ANZAHL - 1;
  return (
    <div>
      <KleinerLink onClick={onUebersicht}>← Überblick</KleinerLink>
      <p style={kickerStil}>Regel {index + 1} von {TEILER_ANZAHL}</p>
      <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, color: C.tinte, margin: "0 0 12px" }}>Teilbarkeit durch {t}</h3>
      <div style={{ ...karte, borderLeft: `4px solid ${C.flaggold}`, padding: "14px 16px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.gruenDunkel, margin: "0 0 4px" }}>DIE REGEL</p>
        <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.55, color: C.tinte, margin: 0 }}>{inhalt.regel}</p>
      </div>
      <p style={{ ...kickerStil, marginTop: 22 }}>Warum ist das so?</p>
      {inhalt.warum}
      {inhalt.bild}
      {inhalt.extra}

      <div style={{ ...karte, marginTop: 20 }}>
        <p style={kickerStil}>Jetzt du</p>
        <SchrittFolge key={t} schritte={inhalt.schritte} stand={stand} setStand={setStand} fertigText={`Geschafft – du hast die Regel für die ${t} selbst begründet.`} />
      </div>

      {fertig && (
        <div style={{ ...karte, marginTop: 14, borderLeft: `4px solid ${C.flaggold}`, padding: "14px 16px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, margin: "0 0 4px" }}>Das hast du hergeleitet:</p>
          <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5, color: C.tinte, margin: 0 }}>Durch {t}: {KURZ[t][0]}</p>
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.55, margin: "4px 0 0" }}>Der Grund: {KURZ[t][1]}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        {index > 0 && <div style={{ flex: "0 0 38%" }}><GrosserKnopf ghost onClick={onZurueck}>← Zurück</GrosserKnopf></div>}
        <div style={{ flex: 1 }}>
          <GrosserKnopf ghost={!fertig} onClick={onWeiter}>{letzte ? "Weiter zum Quiz →" : `Weiter: durch ${TEILER_REIHE[index + 1]} →`}</GrosserKnopf>
        </div>
      </div>
    </div>
  );
}

/* ---------- Überblick (Start) ---------- */
function Start({ fertigAnzahl, oeffne }) {
  const naechste = TEILER_SCHRITTE.findIndex((_, k) => !teilerRegelFertig(k));
  const fertigAlle = fertigAnzahl === TEILER_ANZAHL;
  return (
    <div>
      <P>Woran erkennst du, ob eine Zahl durch 2, 3, 4 … teilbar ist – ohne zu rechnen? Hinter jeder Teilbarkeitsregel steckt eine Begründung. Hier leitest du sie selbst her, für alle einstelligen Zahlen. Durch 1 ist jede Zahl teilbar, dafür braucht es keine Regel. Bleiben die Zahlen von 2 bis 9.</P>
      <div style={{ ...karte, borderLeft: `4px solid ${C.flaggold}`, padding: "16px 18px" }}>
        <p style={kickerStil}>Der Hilfssatz hinter allen Regeln</p>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: C.tinte, margin: "0 0 8px" }}>
          Sind zwei Zahlen beide durch t teilbar, dann auch ihre Summe und ihre Differenz. Ist nur eine der beiden durch t teilbar, dann ist die Summe es nicht.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: C.grau, margin: "0 0 8px" }}>
          Beispiel mit t = 3: 12 + 9 = 21 – beide Summanden sind durch 3 teilbar, und 21 = 3 · 7. Aber 12 + 5 = 17 – die 5 ist nicht durch 3 teilbar, und 17 auch nicht.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: C.grau, margin: 0 }}>
          So entsteht jede Regel: Man zerlegt die Zahl in einen Teil, der garantiert durch t teilbar ist, und einen kleinen Rest, den man leicht prüfen kann.
        </p>
      </div>
      <div style={{ marginTop: 18 }}>
        {fertigAlle
          ? <Rueck art="gut">Alle acht Regeln hergeleitet. Jetzt kannst du im Quiz trainieren, sie schnell anzuwenden.</Rueck>
          : <GrosserKnopf onClick={() => oeffne(Math.max(naechste, 0))}>{fertigAnzahl === 0 ? "Los geht’s: Teilbarkeit durch 2" : `Weiter mit der Teilbarkeit durch ${TEILER_REIHE[Math.max(naechste, 0)]}`}</GrosserKnopf>}
        <GrosserKnopf ghost onClick={() => oeffne("quiz")}>Direkt zum Quiz</GrosserKnopf>
      </div>
    </div>
  );
}

/* ---------- Quiz: Zahlen markieren ---------- */
function Spickzettel() {
  return (
    <Aufklapp titel="Alle Regeln auf einen Blick">
      {TEILER_REIHE.slice().sort((a, b) => a - b).map((t) => (
        <p key={t} style={{ margin: "0 0 8px", lineHeight: 1.55 }}>
          <b>Durch {t}:</b> {KURZ[t][0]} <span style={{ color: C.grau }}>({KURZ[t][1]})</span>
        </p>
      ))}
    </Aufklapp>
  );
}

function useStandTick() {
  const [, setZ] = useState(0);
  useEffect(() => entdeckenHoeren(() => setZ((z) => z + 1)), []);
  return entdeckenStand();
}

function Quiz() {
  const stand = useStandTick();
  const alle = TEILER_REIHE.slice().sort((a, b) => a - b);
  const [wahl, setWahl] = useState([]);
  const [stufe, setStufe] = useState("1");
  const [laeuft, setLaeuft] = useState(false);
  const [runde, setRunde] = useState(null);
  const [auswahl, setAuswahl] = useState([]);
  const [beutel, setBeutel] = useState([]);
  const [markiert, setMarkiert] = useState(() => new Set());
  const [ergebnis, setErgebnis] = useState(null);
  const [sitzung, setSitzung] = useState({ runden: 0, perfekt: 0 });

  const neueRunde = (liste, b, letzter, st = stufe) => {
    const z = naechsterTeiler(liste, b, letzter);
    setBeutel(z.beutel);
    setRunde(rundeErzeugen(z.t, Number(st)));
    setMarkiert(new Set());
    setErgebnis(null);
    springe("teiler-weiter", () => window.scrollTo({ top: 0 }));
  };
  const starten = (liste) => {
    const l = liste.slice().sort((a, b) => a - b);
    setAuswahl(l); setLaeuft(true); setSitzung({ runden: 0, perfekt: 0 });
    neueRunde(l, [], null);
  };
  const umschalten = (t) => setWahl((w) => (w.includes(t) ? w.filter((x) => x !== t) : [...w, t]));
  const tippe = (n) => {
    if (ergebnis) return;
    setMarkiert((m) => { const c = new Set(m); if (c.has(n)) c.delete(n); else c.add(n); return c; });
  };
  const pruefen = () => {
    const a = auswerten(runde, markiert);
    setErgebnis(a);
    teilerQuizBuchen(a.perfekt);
    setSitzung((s) => ({ runden: s.runden + 1, perfekt: s.perfekt + (a.perfekt ? 1 : 0) }));
    a.zellen.forEach((z) => {
      const richtig = z.status === "richtig" || z.status === "frei";
      try { merken({ gruppe: `Teilbarkeit · durch ${runde.teiler}`, richtig, ...(richtig ? {} : { fehlerart: "rechnen" }) }); } catch (e) { /* Protokoll ist optional */ }
    });
  };

  const chip = (aktiv) => ({ minHeight: 46, minWidth: 54, padding: "6px 14px", borderRadius: 12, fontFamily: "inherit", cursor: "pointer", fontSize: 17, fontWeight: 800,
    border: `1.5px solid ${aktiv ? C.see : C.linie}`, background: aktiv ? C.see : C.weiss, color: aktiv ? C.weiss : C.see });
  const mixAn = wahl.length === alle.length;

  if (!laeuft) {
    return (
      <div>
        <p style={kickerStil}>Quiz</p>
        <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, color: C.tinte, margin: "0 0 10px" }}>Zahlen markieren</h3>
        <P>In jeder Runde bekommst du neun Zahlen und eine Frage, zum Beispiel: Welche Zahlen sind durch 7 teilbar? Tippe alle passenden Zahlen an und lass sie prüfen.</P>
        <div style={{ ...karte, padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.tinte, margin: "0 0 8px" }}>Welche Teilbarkeiten möchtest du üben?</p>
          <div role="group" aria-label="Teilbarkeiten wählen" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {alle.map((t) => <button key={t} type="button" aria-pressed={wahl.includes(t)} onClick={() => umschalten(t)} style={chip(wahl.includes(t))}>{t}</button>)}
            <button type="button" aria-pressed={mixAn} onClick={() => setWahl(mixAn ? [] : alle.slice())} style={{ ...chip(mixAn), padding: "6px 16px" }}>Mix</button>
          </div>
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.5, margin: "8px 0 14px" }}>
            Wähle eine oder mehrere. Bei mehreren wechselt die Frage von Runde zu Runde. „Mix“ wählt alle acht.
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.tinte, margin: "0 0 8px" }}>Wie groß sollen die Zahlen sein?</p>
          <ModusLeiste label="Zahlenraum" modi={STUFEN.map((s) => [String(s.id), s.name])} modus={stufe} setModus={setStufe} />
          <GrosserKnopf disabled={!wahl.length} onClick={() => starten(wahl)}>
            {wahl.length ? `Training starten (${wahl.length === alle.length ? "alle Teilbarkeiten" : "durch " + wahl.slice().sort((a, b) => a - b).join(", ")})` : "Wähle mindestens eine Teilbarkeit"}
          </GrosserKnopf>
          <GrosserKnopf gold onClick={() => { setWahl(alle.slice()); starten(alle); }}>Mix starten – alle gemischt</GrosserKnopf>
        </div>
        {stand.teiler.quiz.runden > 0 && (
          <p style={{ fontSize: 12.5, color: C.grau, margin: "12px 2px 0" }}>Bisher: {stand.teiler.quiz.runden} Runde{stand.teiler.quiz.runden === 1 ? "" : "n"}, davon {stand.teiler.quiz.perfekt} fehlerfrei.</p>
        )}
        <Spickzettel />
      </div>
    );
  }

  const t = runde.teiler;
  const uebersehen = ergebnis ? ergebnis.zellen.filter((z) => z.status === "uebersehen").length : 0;
  const falsch = ergebnis ? ergebnis.zellen.filter((z) => z.status === "falsch").length : 0;
  const rahmen = (z) => {
    if (!ergebnis) return { border: `2px solid ${markiert.has(z.n) ? C.flaggold : C.linie}`, background: markiert.has(z.n) ? "#FFF8DC" : C.weiss };
    return {
      richtig: { border: `2px solid ${OK}`, background: OK_GRUND },
      uebersehen: { border: `2px dashed ${C.flaggold}`, background: "#FFF8DC" },
      falsch: { border: `2px solid ${C.gruen}`, background: NEIN_GRUND },
      frei: { border: `2px solid ${C.linie}`, background: "#F4F6FA" },
    }[z.status];
  };
  const beschriftung = (z) => (z.status === "richtig" ? "teilbar ✓" : z.status === "uebersehen" ? "teilbar – übersehen" : z.status === "falsch" ? "nicht teilbar" : z.ja ? "teilbar" : "nicht teilbar");
  return (
    <div>
      <p style={kickerStil}>Runde {sitzung.runden + (ergebnis ? 0 : 1)} · {auswahl.length === TEILER_ANZAHL ? "Mix" : auswahl.length > 1 ? "mehrere Teilbarkeiten" : `Teilbarkeit durch ${t}`}</p>
      <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3, color: C.tinte, margin: "0 0 4px" }}>Markiere alle Zahlen, die durch <span style={{ color: C.gruen }}>{t}</span> teilbar sind.</h3>
      <Aufklapp titel={`Erinnerung: Regel für die ${t}`}>
        <p style={{ margin: 0 }}>{KURZ[t][0]}</p>
      </Aufklapp>
      <div role="group" aria-label={`Neun Zahlen – welche sind durch ${t} teilbar?`} style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginTop: 14 }}>
        {runde.zahlen.map((z) => {
          const zeile = ergebnis ? ergebnis.zellen.find((c) => c.n === z.n) : z;
          return (
            <button key={z.n} type="button" aria-pressed={markiert.has(z.n)} disabled={!!ergebnis} onClick={() => tippe(z.n)}
              style={{ minHeight: 76, borderRadius: 14, fontFamily: "inherit", cursor: ergebnis ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: "6px 4px",
                ...rahmen(zeile) }}>
              <span style={{ fontSize: "clamp(20px, 6vw, 26px)", fontWeight: 800, color: C.tinte, fontVariantNumeric: "tabular-nums" }}>{z.n}</span>
              {ergebnis && <span style={{ fontSize: 11, fontWeight: 700, color: zeile.status === "richtig" ? OK : zeile.status === "falsch" ? C.gruenDunkel : zeile.status === "uebersehen" ? GOLD.text : C.grau, textAlign: "center", lineHeight: 1.2 }}>{beschriftung(zeile)}</span>}
            </button>
          );
        })}
      </div>
      {!ergebnis && (
        <>
          <p style={{ fontSize: 12.5, color: C.grau, margin: "10px 2px 0" }}>{markiert.size === 0 ? "Tippe die passenden Zahlen an." : `${markiert.size} markiert`}</p>
          <GrosserKnopf onClick={pruefen}>Prüfen</GrosserKnopf>
        </>
      )}
      {ergebnis && (
        <>
          <Rueck art={ergebnis.perfekt ? "gut" : "schlecht"}>
            {ergebnis.perfekt ? "Alle neun richtig – keine übersehen, keine zu viel." : `${9 - ergebnis.fehler} von 9 richtig.${uebersehen ? ` ${uebersehen} teilbare Zahl${uebersehen === 1 ? "" : "en"} übersehen.` : ""}${falsch ? ` ${falsch} Zahl${falsch === 1 ? "" : "en"} zu viel markiert.` : ""}`}
          </Rueck>
          <Aufklapp titel={ergebnis.perfekt ? "So sieht man es bei jeder Zahl" : "Warum? Alle neun Zahlen erklärt"} start={!ergebnis.perfekt}>
            {ergebnis.zellen.slice().sort((a, b) => (b.status === "uebersehen" || b.status === "falsch") - (a.status === "uebersehen" || a.status === "falsch")).map((z) => (
              <p key={z.n} style={{ margin: "0 0 8px", lineHeight: 1.55 }}>
                <b>{z.n}</b> – {z.ja ? "teilbar" : "nicht teilbar"}{z.status === "uebersehen" ? " (übersehen)" : z.status === "falsch" ? " (zu viel markiert)" : ""}. <span style={{ color: C.grau }}>{erklaerung(z.n, t).text}</span>
              </p>
            ))}
          </Aufklapp>
          <GrosserKnopf onClick={() => neueRunde(auswahl, beutel, t)}>Nächste Runde</GrosserKnopf>
        </>
      )}
      <p style={{ fontSize: 12.5, color: C.grau, margin: "12px 2px 0" }}>
        Diese Sitzung: {sitzung.perfekt} von {sitzung.runden} Runden fehlerfrei.
      </p>
      <div style={{ marginTop: 4 }}>
        <KleinerLink onClick={() => { setLaeuft(false); setRunde(null); setErgebnis(null); }}>Auswahl ändern</KleinerLink>
      </div>
    </div>
  );
}

/* ---------- Das Modul ---------- */
export function TeilerModul({ onZurueck }) {
  const [stand, setStandLok] = useState(() => entdeckenStand().teiler.stand.slice());
  const [tab, setTabRoh] = useState("start");           // "start" | 0–7 | "quiz"
  const [bestaetige, setBestaetige] = useState(false);
  const gesamt = TEILER_SCHRITTE.reduce((s, n, k) => s + Math.min(stand[k], n), 0);
  const summe = TEILER_SCHRITTE.reduce((s, n) => s + n, 0);
  const fertigAnzahl = TEILER_SCHRITTE.filter((n, k) => stand[k] >= n).length;

  const tabQuelle = useRef("teiler-reiter");   // Sprung-Schalter: Reiter oben oder Weiter/Zurück/Übersicht
  const setTab = (t, q = "teiler-reiter") => { tabQuelle.current = q; setTabRoh(t); };
  useEffect(() => { springe(tabQuelle.current, () => window.scrollTo(0, 0)); }, [tab]);

  const setterFuer = (k) => (f) => {
    const neu = typeof f === "function" ? f(stand[k]) : f;
    if (neu > stand[k]) {
      teilerStandSetzen(k, neu);
      setStandLok((s) => { const c = s.slice(); c[k] = Math.max(c[k], neu); return c; });
    }
  };
  const chip = (an, ok) => ({ minHeight: 46, borderRadius: 12, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700, padding: "6px 4px",
    border: `1.5px solid ${an ? C.see : ok ? OK : C.linie}`, background: an ? C.see : ok ? OK_GRUND : C.weiss, color: an ? C.weiss : ok ? OK : C.see });

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <button type="button" onClick={onZurueck}
        style={{ fontFamily: "inherit", cursor: "pointer", background: "none", border: "none", padding: "6px 0", marginBottom: 10, fontSize: 13.5, fontWeight: 600, color: C.see }}>
        ← Mathe entdecken
      </button>
      <h2 style={{ fontSize: "clamp(20px, 6.2vw, 25px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: C.tinte, marginBottom: 6 }}>
        Teilbarkeitsregeln – warum funktionieren sie?
      </h2>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 14 }}>Acht Regeln, jede mit Begründung. Du rechnest selbst und kannst am Ende trainieren.</p>

      <div role="tablist" aria-label="Regeln" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
        {TEILER_REIHE.map((t, k) => {
          const an = tab === k, ok = stand[k] >= TEILER_SCHRITTE[k];
          return (
            <button key={t} type="button" role="tab" aria-selected={an} aria-label={`Teilbarkeit durch ${t}${ok ? " (abgeschlossen)" : ""}`} onClick={() => setTab(k)} style={chip(an, ok)}>
              {ok && !an ? "✓ " : ""}durch {t}
            </button>
          );
        })}
        <button type="button" role="tab" aria-selected={tab === "quiz"} onClick={() => setTab("quiz")} style={{ ...chip(tab === "quiz", false), gridColumn: "1 / -1" }}>Quiz: Zahlen markieren</button>
      </div>
      <div aria-hidden="true" style={{ height: 5, borderRadius: 3, background: C.linie, marginTop: 12, overflow: "hidden" }}>
        <div style={{ width: `${(gesamt / summe) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.see}, ${C.gruen})`, transition: "width .3s ease" }} />
      </div>
      <p style={{ fontSize: 12, color: C.grau, margin: "6px 2px 0" }}>{fertigAnzahl} von {TEILER_ANZAHL} Regeln hergeleitet</p>

      <div style={{ marginTop: 20 }}>
        {tab === "start" && <Start fertigAnzahl={fertigAnzahl} oeffne={setTab} />}
        {typeof tab === "number" && (
          <RegelSeite t={TEILER_REIHE[tab]} index={tab} stand={stand[tab]} setStand={setterFuer(tab)}
            onUebersicht={() => setTab("start", "teiler-weiter")} onZurueck={() => setTab(tab - 1, "teiler-weiter")} onWeiter={() => setTab(tab === TEILER_ANZAHL - 1 ? "quiz" : tab + 1, "teiler-weiter")} />
        )}
        {tab === "quiz" && <Quiz />}
      </div>

      {gesamt > 0 && (
        <div style={{ marginTop: 28, textAlign: "center" }}>
          {!bestaetige
            ? <KleinerLink onClick={() => setBestaetige(true)}>Modul von vorn beginnen</KleinerLink>
            : (
              <Rueck art="warn">
                Dein Fortschritt in diesem Modul wird gelöscht.
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <div style={{ flex: 1 }}><GrosserKnopf ghost onClick={() => setBestaetige(false)}>Abbrechen</GrosserKnopf></div>
                  <div style={{ flex: 1 }}><GrosserKnopf onClick={() => { teilerZuruecksetzen(); setStandLok(Array(TEILER_ANZAHL).fill(0)); setTab("start", "teiler-weiter"); setBestaetige(false); springe("teiler-weiter", () => window.scrollTo(0, 0)); }}>Ja, neu beginnen</GrosserKnopf></div>
                </div>
              </Rueck>
            )}
        </div>
      )}
    </div>
  );
}
