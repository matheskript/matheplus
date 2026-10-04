/* ============================================================
   Vektoren-Bereich: zwei eigenständige Trainingstools
   · Zwei Punkte – eine Gerade
   · Drei Punkte – eine Ebene (drei Wege als Akkordeon, jeweils mit
     Umrechnung Parameterform → Koordinatenform)
   Beide nutzen die gemeinsamen Rechen- und Darstellungsbausteine aus
   func20 (Rechnen mit Vektoren) und func19 – keine doppelte Implementierung.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useState } from "react";
import { C } from "./base1.jsx";
import { Einzeilig, ggT, kreuz, skalar } from "./func19.jsx";
import { FA, FB, FE, FS, Gl, Name, Raum3, Schritt, Vek, k, koordText, n } from "./func20.jsx";

/* ---------- kleine Helfer ---------- */

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const zufallsPunkt = (r = 5) => [rnd(-r, r), rnd(-r, r), rnd(-r, r)];
const diff = (P, Q) => Q.map((x, i) => x - P[i]);          // Vektor von P nach Q
const gleich = (u, v) => u.every((x, i) => x === v[i]);
const istNull = (v) => v.every((x) => x === 0);
export const zahl = (s) => { const t = String(s).replace("−", "-").trim(); return /^-?\d+$/.test(t) ? Number(t) : null; };
export const leseVektor = (w) => { const z = w.map(zahl); return z.some((x) => x === null) ? null : z; };
const alsText = (v) => v.map(String);

/* Gleichung n·x = d auf eine Normalform bringen: gekürzt, erster Koeffizient ≠ 0 positiv */
export function normiere(nv, d) {
  const g = [...nv, d].reduce((a, b) => ggT(a, b), 0) || 1;
  const erster = nv.find((x) => x !== 0) || 1;
  const s = erster < 0 ? -1 : 1;
  return { n: nv.map((x) => (s * x) / g), d: (s * d) / g, faktor: s * g };
}

const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const kicker = { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 8 };
const hinweis = { fontSize: 13, color: C.grau, lineHeight: 1.6, marginBottom: 12 };

export function Meldung({ art = "info", children }) {
  const farben = { info: [C.himmel, C.see], warn: ["#FFF4D6", "#7A5A00"], gut: ["#E6F6EF", "#0F7A4D"], schlecht: ["#FCE8EE", C.gruenDunkel] }[art];
  return (
    <div role={art === "warn" || art === "schlecht" ? "alert" : "status"}
      style={{ background: farben[0], color: farben[1], borderRadius: 12, padding: "10px 12px", fontSize: 13.5, lineHeight: 1.55, marginBottom: 12, fontWeight: 500 }}>
      {children}
    </div>
  );
}

/* Ganzzahliges Eingabefeld */
export function Feld({ wert, setWert, label, farbe = C.see, breite = 40 }) {
  return (
    <input value={wert} inputMode="numeric" aria-label={label}
      onChange={(e) => setWert(e.target.value.replace(/[^0-9\-−]/g, "").replace("−", "-").slice(0, 4))}
      onFocus={(e) => e.target.select()}
      style={{ width: breite, height: 34, textAlign: "center", fontSize: 15, fontWeight: 800, fontFamily: "inherit", color: farbe,
        border: `1.5px solid ${farbe}55`, borderRadius: 9, background: `${farbe}0D`, outline: "none" }} />
  );
}

/* Punkt als Zeile: A( _ | _ | _ ) */
export function PunktEingabe({ name, farbe, werte, setWerte }) {
  const setze = (i) => (v) => { const w = [...werte]; w[i] = v; setWerte(w); };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 17, fontWeight: 800, color: farbe }}>
      <span style={{ marginRight: 2 }}>{name}(</span>
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ color: C.hellgrau, fontWeight: 400 }}>|</span>}
          <Feld wert={werte[i]} setWert={setze(i)} label={`${name} Koordinate x${i + 1}`} farbe={farbe} />
        </React.Fragment>
      ))}
      <span>)</span>
    </div>
  );
}

/* Spaltenvektor zur Eingabe */
export function VektorFeld({ name, farbe, werte, setWerte }) {
  const setze = (i) => (v) => { const w = [...werte]; w[i] = v; setWerte(w); };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 800 }}>
      {name}
      <span style={{ display: "inline-flex", flexDirection: "column", gap: 3, padding: "2px 4px", borderLeft: `1.8px solid ${farbe}`, borderRight: `1.8px solid ${farbe}`, borderRadius: 8 }}>
        {[0, 1, 2].map((i) => <Feld key={i} wert={werte[i]} setWert={setze(i)} label={`${name} Komponente ${i + 1}`} farbe={farbe} breite={44} />)}
      </span>
    </span>
  );
}

/* Ein Weg im Akkordeon: Kopf ist immer klickbar, damit auch ein geschlossener Weg erreichbar bleibt */
function Weg({ titel, offen, umschalten, children, id }) {
  return (
    <div style={{ border: `1px solid ${offen ? C.see : C.linie}`, borderRadius: 14, marginBottom: 10, background: C.weiss, overflow: "hidden" }}>
      <button type="button" onClick={umschalten} aria-expanded={offen} aria-controls={id}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 48, padding: "10px 14px",
          border: "none", background: offen ? C.himmel : C.weiss, cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: C.tinte }}>
        <span style={{ fontSize: 15, fontWeight: 800 }}>{titel}</span>
        <span aria-hidden="true" style={{ color: C.see, fontSize: 18, transform: offen ? "rotate(90deg)" : "none", transition: "transform .15s" }}>›</span>
      </button>
      {offen && <div id={id} style={{ padding: "12px 10px 2px" }}>{children}</div>}
    </div>
  );
}

export function Knopf({ children, onClick, gold, klein }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: klein ? "7px 12px" : "0 16px", height: klein ? undefined : 44, borderRadius: 999, fontFamily: "inherit", cursor: "pointer",
        fontSize: klein ? 12.5 : 14.5, fontWeight: 700, whiteSpace: "nowrap",
        border: gold ? "none" : `1px solid ${C.linie}`, background: gold ? C.flaggold : C.weiss, color: gold ? C.seeTief : C.see,
        boxShadow: gold ? "0 4px 14px rgba(237,187,0,0.3)" : "none" }}>
      {children}
    </button>
  );
}

const Verb = ({ von, nach, farbeVon, farbeNach, P, Q }) => {
  const d = diff(P, Q);
  return (
    <Einzeilig max={15}>
      <Name t={von + nach} farbe={FE} /><Gl /><Vek w={Q.map(n)} farbe={farbeNach} /><span>−</span><Vek w={P.map(n)} farbe={farbeVon} /><Gl />
      <Vek w={Q.map((x, i) => `${n(x)} − ${k(P[i])}`)} /><Gl /><Vek w={d.map(n)} farbe={FE} />
    </Einzeilig>
  );
};

/* ============================================================
   Zwei Punkte – eine Gerade
   ============================================================ */

function zweiZufall() {
  const A = zufallsPunkt(); let B = zufallsPunkt();
  while (gleich(A, B)) B = zufallsPunkt();
  return [alsText(A), alsText(B)];
}

export function ZweiPunkteGerade() {
  const [start] = useState(zweiZufall);
  const [Aw, setAw] = useState(start[0]);
  const [Bw, setBw] = useState(start[1]);
  const [offen, setOffen] = useState("A");
  const A = leseVektor(Aw), B = leseVektor(Bw);
  const neu = () => { const [a, b] = zweiZufall(); setAw(a); setBw(b); setOffen("A"); };
  const pkt = { A, B }, farbe = { A: FA, B: FB };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>Durch zwei Punkte geht genau eine Gerade</h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Ein Punkt liefert den Stützvektor, der Verbindungsvektor zum anderen Punkt den Richtungsvektor. Welchen Punkt du als Stützpunkt
        nimmst, ist egal – beide Wege beschreiben dieselbe Gerade.
      </p>

      <div style={karte}>
        <p style={kicker}>Punkte</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          <PunktEingabe name="A" farbe={FA} werte={Aw} setWerte={setAw} />
          <PunktEingabe name="B" farbe={FB} werte={Bw} setWerte={setBw} />
        </div>
        <div style={{ marginBottom: 16 }}><Knopf gold onClick={neu}>🎲 Neue Punkte</Knopf></div>

        {!A || !B ? (
          <Meldung art="warn">Bitte in jedes Feld eine ganze Zahl eintragen.</Meldung>
        ) : gleich(A, B) ? (
          <Meldung art="warn">A und B sind derselbe Punkt. Durch einen einzelnen Punkt gehen unendlich viele Geraden – die Gerade ist nicht eindeutig bestimmt.
            Ändere einen der Punkte.</Meldung>
        ) : (
          <>
            {[["A", "B"], ["B", "A"]].map(([S, Q], i) => (
              <Weg key={S} id={`zp-weg-${S}`} titel={`Weg ${i + 1}: Stützpunkt ${S}`} offen={offen === S} umschalten={() => setOffen(offen === S ? null : S)}>
                <Schritt nr="1" titel={`Stützvektor: Ortsvektor von ${S}`}>
                  <Einzeilig max={16}><Name t={"O" + S} farbe={farbe[S]} /><Gl /><Vek w={pkt[S].map(n)} farbe={farbe[S]} /></Einzeilig>
                </Schritt>
                <Schritt nr="2" titel={`Richtungsvektor: von ${S} nach ${Q}`}>
                  <Verb von={S} nach={Q} farbeVon={farbe[S]} farbeNach={farbe[Q]} P={pkt[S]} Q={pkt[Q]} />
                </Schritt>
                <Schritt nr="3" titel="Geradengleichung">
                  <Einzeilig max={17}>
                    <span>g:</span><Name t="x" /><Gl /><Vek w={pkt[S].map(n)} farbe={farbe[S]} /><span>+ t ·</span><Vek w={diff(pkt[S], pkt[Q]).map(n)} farbe={FE} />
                  </Einzeilig>
                </Schritt>
                <p style={hinweis}>Probe: t = 0 ergibt {S}, t = 1 ergibt {Q}.</p>
              </Weg>
            ))}
            <Meldung>
              Beide Wege beschreiben dieselbe Gerade: <Name t="BA" farbe={FE} /> = −1 · <Name t="AB" farbe={FE} /> ist parallel zu <Name t="AB" farbe={FE} />,
              und B liegt auf der Geraden aus Weg 1 (t = 1).
            </Meldung>
            <Raum3 key={[...A, ...B].join()} punkte={[{ p: A, label: "A", farbe: FA }, { p: B, label: "B", farbe: FB }]} gerade={{ p: A, r: diff(A, B) }} />
          </>
        )}
      </div>

      {A && B && !gleich(A, B) && <GeradePruefen A={A} B={B} key={[...A, ...B].join()} />}
    </div>
  );
}

/* Eigene Parametrisierung prüfen: dieselbe Gerade? */
function GeradePruefen({ A, B }) {
  const [Pw, setPw] = useState(["", "", ""]);
  const [rw, setRw] = useState(["", "", ""]);
  const [ergebnis, setErgebnis] = useState(null);
  const pruefen = () => {
    const P = leseVektor(Pw), r = leseVektor(rw), ab = diff(A, B);
    if (!P || !r) return setErgebnis({ art: "warn", text: "Bitte alle sechs Felder mit ganzen Zahlen füllen." });
    if (istNull(r)) return setErgebnis({ art: "schlecht", text: "Der Nullvektor kann kein Richtungsvektor sein – er zeigt in keine Richtung." });
    const parallel = istNull(kreuz(r, ab));
    const aufG = istNull(kreuz(diff(A, P), ab));
    if (parallel && aufG) return setErgebnis({ art: "gut", text: "Richtig – das ist dieselbe Gerade: Dein Richtungsvektor ist ein Vielfaches von AB, und dein Stützpunkt liegt auf der Geraden." });
    if (!parallel) return setErgebnis({ art: "schlecht", text: "Nicht dieselbe Gerade: Dein Richtungsvektor ist kein Vielfaches von AB. Prüfe den Verbindungsvektor." });
    return setErgebnis({ art: "schlecht", text: "Die Richtung stimmt, aber dein Stützpunkt liegt nicht auf der Geraden – das wäre eine parallele Gerade." });
  };
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={{ ...kicker, color: C.gruen }}>Jetzt selbst üben</p>
      <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8 }}>Ist das dieselbe Gerade?</h3>
      <p style={hinweis}>Gib eine eigene Geradengleichung durch A und B ein – mit einem beliebigen Stützpunkt der Geraden und einem
        beliebigen Richtungsvektor. Die App prüft, ob sie dieselbe Gerade beschreibt.</p>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 16, fontWeight: 800 }}>g: x =</span>
        <VektorFeld name="" farbe={FA} werte={Pw} setWerte={(w) => { setPw(w); setErgebnis(null); }} />
        <span style={{ fontSize: 16, fontWeight: 800 }}>+ t ·</span>
        <VektorFeld name="" farbe={FE} werte={rw} setWerte={(w) => { setRw(w); setErgebnis(null); }} />
      </div>
      {ergebnis && <Meldung art={ergebnis.art}>{ergebnis.text}</Meldung>}
      <Knopf gold onClick={pruefen}>Prüfen</Knopf>
    </div>
  );
}

/* ============================================================
   Drei Punkte – eine Ebene
   ============================================================ */

function dreiZufall() {
  for (;;) {
    const A = zufallsPunkt(4), B = zufallsPunkt(4), Cp = zufallsPunkt(4);
    if (!istNull(kreuz(diff(A, B), diff(A, Cp)))) return [alsText(A), alsText(B), alsText(Cp)];
  }
}

const PAARE = [[1, 2], [2, 0], [0, 1]];

function KoordinatenformRechnung({ S, u, v, P, farbeS, nU, nV }) {
  const nv = kreuz(u, v);
  const d = skalar(P, nv);
  const norm = normiere(nv, d);
  return (
    <>
      <Schritt nr="3" titel={`Normalenvektor: ${nU} × ${nV}`}>
        <Einzeilig max={15}>
          <Name t="n" farbe={FS} /><Gl /><Vek w={u.map(n)} farbe={FE} /><span>×</span><Vek w={v.map(n)} farbe={FE} />
        </Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={15}>
          <Gl /><Vek w={PAARE.map(([i, j]) => `${k(u[i])}·${k(v[j])} − ${k(u[j])}·${k(v[i])}`)} /><Gl /><Vek w={nv.map(n)} farbe={FS} />
        </Einzeilig>
      </Schritt>
      <Schritt nr="4" titel={`Ansatz: x · n = p · n mit dem Stützpunkt ${S}`}>
        <Einzeilig max={16}>
          <Name t="x" /><span>·</span><Vek w={nv.map(n)} farbe={FS} /><Gl /><Vek w={P.map(n)} farbe={farbeS} /><span>·</span><Vek w={nv.map(n)} farbe={FS} />
        </Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={16}>
          <span>p · n =</span><span>{P.map((x, i) => `${k(x)}·${k(nv[i])}`).join(" + ")}</span><Gl /><span style={{ color: FE }}>{n(d)}</span>
        </Einzeilig>
      </Schritt>
      <Schritt nr="5" titel="Koordinatengleichung (komponentenweise ausmultipliziert)">
        <Einzeilig max={17}><span>E:</span><span>{koordText(nv, d)}</span></Einzeilig>
        {norm.faktor !== 1 && (
          <>
            <div style={{ height: 6 }} />
            <Einzeilig max={16}>
              <span style={{ color: C.grau, fontWeight: 600 }}>{norm.faktor === -1 ? "mit −1 multipliziert:" : `durch ${n(norm.faktor)} geteilt:`}</span>
              <span style={{ color: FE }}>{koordText(norm.n, norm.d)}</span>
            </Einzeilig>
          </>
        )}
      </Schritt>
    </>
  );
}

export function DreiPunkteEbene() {
  const [start] = useState(dreiZufall);
  const [Aw, setAw] = useState(start[0]);
  const [Bw, setBw] = useState(start[1]);
  const [Cw, setCw] = useState(start[2]);
  const [offen, setOffen] = useState("A");
  const A = leseVektor(Aw), B = leseVektor(Bw), Cp = leseVektor(Cw);
  const neu = () => { const [a, b, c] = dreiZufall(); setAw(a); setBw(b); setCw(c); setOffen("A"); };
  const pkt = { A, B, C: Cp }, farbe = { A: FA, B: FB, C: FS };
  const varianten = [["A", "B", "C"], ["B", "A", "C"], ["C", "A", "B"]];

  let fehler = null;
  if (!A || !B || !Cp) fehler = "Bitte in jedes Feld eine ganze Zahl eintragen.";
  else if (gleich(A, B) || gleich(A, Cp) || gleich(B, Cp)) fehler = "Zwei der Punkte sind gleich. Drei Punkte legen eine Ebene nur fest, wenn sie verschieden sind und nicht auf einer Geraden liegen.";
  else if (istNull(kreuz(diff(A, B), diff(A, Cp)))) fehler = "Die drei Punkte liegen auf einer Geraden (AB und AC sind parallel, AB × AC ist der Nullvektor). Durch eine Gerade gehen unendlich viele Ebenen – die Ebene ist nicht eindeutig bestimmt.";

  const formen = !fehler ? varianten.map(([S, P, Q]) => {
    const u = diff(pkt[S], pkt[P]), v = diff(pkt[S], pkt[Q]), nv = kreuz(u, v);
    return { S, nv, d: skalar(pkt[S], nv), norm: normiere(nv, skalar(pkt[S], nv)) };
  }) : [];

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>Drei Punkte, eine Ebene – drei Wege</h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Ein Punkt wird Stützpunkt, die Verbindungsvektoren zu den beiden anderen Punkten werden Spannvektoren. Jeder der drei Punkte
        kann Stützpunkt sein. Danach rechnest du die Parameterform in die Koordinatenform um.
      </p>

      <div style={karte}>
        <p style={kicker}>Punkte</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          <PunktEingabe name="A" farbe={FA} werte={Aw} setWerte={setAw} />
          <PunktEingabe name="B" farbe={FB} werte={Bw} setWerte={setBw} />
          <PunktEingabe name="C" farbe={FS} werte={Cw} setWerte={setCw} />
        </div>
        <div style={{ marginBottom: 16 }}><Knopf gold onClick={neu}>🎲 Neue Punkte</Knopf></div>

        {fehler ? <Meldung art="warn">{fehler}</Meldung> : (
          <>
            <p style={hinweis}>Prüfung: <Name t="AB" farbe={FE} /> × <Name t="AC" farbe={FE} /> ≠ <Name t="0" />, die Punkte liegen also nicht auf einer Geraden.</p>
            {varianten.map(([S, P, Q], i) => {
              const u = diff(pkt[S], pkt[P]), v = diff(pkt[S], pkt[Q]);
              return (
                <Weg key={S} id={`dp-weg-${S}`} titel={`Weg ${String.fromCharCode(65 + i)}: Stützpunkt ${S}`} offen={offen === S}
                  umschalten={() => setOffen(offen === S ? null : S)}>
                  <Schritt nr="1" titel="Spannvektoren">
                    <Verb von={S} nach={P} farbeVon={farbe[S]} farbeNach={farbe[P]} P={pkt[S]} Q={pkt[P]} />
                    <div style={{ height: 6 }} />
                    <Verb von={S} nach={Q} farbeVon={farbe[S]} farbeNach={farbe[Q]} P={pkt[S]} Q={pkt[Q]} />
                  </Schritt>
                  <Schritt nr="2" titel="Parameterform">
                    <Einzeilig max={16}>
                      <span>E:</span><Name t="x" /><Gl /><Vek w={pkt[S].map(n)} farbe={farbe[S]} />
                      <span>+ r ·</span><Vek w={u.map(n)} farbe={FE} /><span>+ s ·</span><Vek w={v.map(n)} farbe={FE} />
                    </Einzeilig>
                  </Schritt>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: C.see, margin: "4px 0 8px" }}>Parameterform in Koordinatenform umrechnen</p>
                  <KoordinatenformRechnung S={S} u={u} v={v} P={pkt[S]} farbeS={farbe[S]} nU={S + P} nV={S + Q} />
                </Weg>
              );
            })}
            <div style={{ background: C.sand, borderRadius: 12, padding: "12px 12px 4px", marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.tinte, marginBottom: 8 }}>Vergleich der drei Koordinatengleichungen</p>
              {formen.map((f, i) => (
                <p key={f.S} style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 6 }}>
                  <b style={{ color: C.tinte }}>Weg {String.fromCharCode(65 + i)}:</b> {koordText(f.nv, f.d)}
                  {i > 0 && (f.norm.faktor === formen[0].norm.faktor
                    ? <span> – identisch mit Weg A</span>
                    : <span> – das {n(f.norm.faktor / formen[0].norm.faktor)}-Fache der Gleichung aus Weg A</span>)}
                </p>
              ))}
              <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 8 }}>
                Gekürzt ergibt sich jedes Mal <b style={{ color: FE }}>{koordText(formen[0].norm.n, formen[0].norm.d)}</b>. Unterscheiden sich zwei
                Gleichungen nur um einen von 0 verschiedenen Gesamtfaktor, beschreiben sie dieselbe Ebene.
              </p>
            </div>
            <Raum3 key={[...A, ...B, ...Cp].join()} punkte={[{ p: A, label: "A", farbe: FA }, { p: B, label: "B", farbe: FB }, { p: Cp, label: "C", farbe: FS }]}
              ebene={{ n: formen[0].nv, d: formen[0].d }} />
          </>
        )}
      </div>

      {!fehler && <EbenePruefen norm={formen[0].norm} key={[...A, ...B, ...Cp].join()} />}
    </div>
  );
}

/* Eigene Koordinatengleichung prüfen: dieselbe Ebene? */
function EbenePruefen({ norm }) {
  const [w, setW] = useState(["", "", "", ""]);
  const [ergebnis, setErgebnis] = useState(null);
  const setze = (i) => (v) => { const x = [...w]; x[i] = v; setW(x); setErgebnis(null); };
  const pruefen = () => {
    const z = w.map(zahl);
    if (z.some((x) => x === null)) return setErgebnis({ art: "warn", text: "Bitte a, b, c und d als ganze Zahlen eintragen." });
    const nv = z.slice(0, 3);
    if (istNull(nv)) return setErgebnis({ art: "schlecht", text: "Der Normalenvektor darf nicht der Nullvektor sein." });
    const eig = normiere(nv, z[3]);
    if (gleich(eig.n, norm.n) && eig.d === norm.d) return setErgebnis({ art: "gut", text: `Richtig – deine Gleichung ist das ${n(eig.faktor)}-Fache der gekürzten Form und beschreibt dieselbe Ebene.` });
    if (gleich(eig.n, norm.n)) return setErgebnis({ art: "schlecht", text: "Der Normalenvektor passt, aber d stimmt nicht – das wäre eine parallele Ebene. Setze einen der Punkte ein, um d zu bestimmen." });
    return setErgebnis({ art: "schlecht", text: "Der Normalenvektor ist kein Vielfaches des richtigen. Prüfe das Kreuzprodukt der Spannvektoren." });
  };
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={{ ...kicker, color: C.gruen }}>Jetzt selbst üben</p>
      <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8 }}>Stimmt deine Koordinatengleichung?</h3>
      <p style={hinweis}>Rechne selbst und gib deine Koordinatengleichung ein. Auch Vielfache der gekürzten Form werden als richtig erkannt.</p>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 800, marginBottom: 14 }}>
        <span>E:</span>
        <Feld wert={w[0]} setWert={setze(0)} label="a" /><span>x₁ +</span>
        <Feld wert={w[1]} setWert={setze(1)} label="b" /><span>x₂ +</span>
        <Feld wert={w[2]} setWert={setze(2)} label="c" /><span>x₃ =</span>
        <Feld wert={w[3]} setWert={setze(3)} label="d" breite={48} />
      </div>
      {ergebnis && <Meldung art={ergebnis.art}>{ergebnis.text}</Meldung>}
      <Knopf gold onClick={pruefen}>Prüfen</Knopf>
    </div>
  );
}
