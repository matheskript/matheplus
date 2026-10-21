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
import { useStateGebucht } from "./buchung.jsx";
import { WeiterKnopf, WeiterMit } from "./funcWerkzeuge.jsx";
import { C } from "./base1.jsx";
import { Einzeilig, ggT, kreuz, skalar } from "./func19.jsx";
import { FA, FB, FE, FS, Gl, Name, Raum3, Schritt, Vek, k, koordText, n } from "./func20.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { AufklappZeichen } from "./aufklappen.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { FallWahl, HauptKnopf, ObjektBox, ObjektReihe, Tafel, VF, VekArbeit, VekSeite, WuerfelKnopf } from "./vekUi.jsx";
import { ErgebnisReihe, FeinKarte, useDesktop } from "./arbeitsflaeche.jsx";

const pt = (P) => P.map(n).join(" | ");
function geradeHilfe(A, B) {
  const d = diff(A, B);
  return {
    id: `gerade-${pt(A)}-${pt(B)}`,
    aufgabe: "Gerade Stützvektor Richtungsvektor",
    hilfen: {
      verstehen: [
        "Gesucht ist eine Gleichung der Form x = p + t · u, deren Punkte genau die Gerade durch A und B bilden.",
        "Stützvektor p: Ortsvektor eines Punkts der Geraden. Richtungsvektor u: zeigt entlang der Geraden – jedes Vielfache ≠ 0 geht genauso.",
        "Du darfst jeden Punkt der Geraden als Stützpunkt nehmen und jedes Vielfache von AB als Richtungsvektor.",
      ],
      ansatz: [
        "Welchen Punkt nimmst du als Stützpunkt, welchen Vektor als Richtung?",
        "Richtungsvektor = Verbindungsvektor: AB = B − A, also „Spitze minus Fuß“.",
        "Rechne B − A komponentenweise: (b₁ − a₁ | b₂ − a₂ | b₃ − a₃). Mit dem Stützpunkt A ist die Gerade fertig.",
      ],
      pruefen: [
        "Liegt dein Stützpunkt wirklich auf der Geraden?",
        "Dein Richtungsvektor muss ein Vielfaches von AB sein: Teile die Komponenten – überall derselbe Faktor?",
        "Der Nullvektor zeigt in keine Richtung – er ist als Richtungsvektor nicht erlaubt.",
      ],
    },
    regeln: [{ name: "Verbindungsvektor", bereich: "vektoren" }, { name: "Geradengleichung", bereich: "vektoren" }],
    grundlage: null,
    loesung: `Zum Beispiel g: x = (${pt(A)}) + t · (${pt(d)}). Ebenso richtig: Stützpunkt B oder jedes Vielfache des Richtungsvektors.`,
  };
}
function ebeneHilfe(A, B, Cp, norm) {
  const u = diff(A, B), v = diff(A, Cp);
  return {
    id: `ebene-${pt(A)}-${pt(B)}-${pt(Cp)}`,
    aufgabe: "Ebene Koordinatenform Normalenvektor Kreuzprodukt",
    hilfen: {
      verstehen: [
        "Gesucht ist eine Koordinatengleichung n₁x₁ + n₂x₂ + n₃x₃ = d der Ebene durch A, B und C.",
        "Die Koeffizienten n₁, n₂, n₃ sind die Koordinaten eines Normalenvektors – er steht senkrecht auf der Ebene.",
        "Jedes Vielfache ≠ 0 deiner Gleichung beschreibt dieselbe Ebene.",
      ],
      ansatz: [
        "Wie bekommst du einen Vektor, der auf zwei Spannvektoren der Ebene senkrecht steht?",
        "Mit dem Kreuzprodukt der Spannvektoren: n = AB × AC. Danach liefert ein Punkt der Ebene die Zahl d = n · a.",
        `Spannvektoren: AB = (${pt(u)}), AC = (${pt(v)}). Berechne n = AB × AC und setze dann A ein.`,
      ],
      regel: [
        "Wie lautet die Formel für das Kreuzprodukt?",
        "a × b = (a₂b₃ − a₃b₂ | a₃b₁ − a₁b₃ | a₁b₂ − a₂b₁).",
        "Die Koordinatenform: n₁x₁ + n₂x₂ + n₃x₃ = d mit d = n₁a₁ + n₂a₂ + n₃a₃.",
      ],
      pruefen: [
        "Setze alle drei Punkte in deine Gleichung ein. Stimmt die Gleichung jedes Mal?",
        "Prüfe, ob n wirklich senkrecht auf AB und AC steht: Beide Skalarprodukte müssen 0 sein.",
        "Gemeinsame Faktoren darfst du kürzen – auch ein Vorzeichenwechsel ändert die Ebene nicht.",
      ],
    },
    regeln: [{ name: "Ebene in Parameterform", bereich: "vektoren" }, { name: "Kreuzprodukt", bereich: "vektoren" }, { name: "Koordinatenform", bereich: "vektoren" }],
    grundlage: { trainer: "multiplizieren", name: "Multiplizieren", grund: "Das Kreuzprodukt besteht aus vielen kleinen Produkten. Eine schnelle Runde hilft." },
    loesung: `Gekürzt: E: ${koordText(norm.n, norm.d)}`,
  };
}

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

const hinweis = { fontSize: 13, color: C.grau, lineHeight: 1.6, marginBottom: 12 };

export function Meldung({ art = "info", children }) {
  const farben = { info: [VF.einsHell, C.see], warn: ["#FFF6DD", "#7A5A00"], gut: [VF.dreiHell, "#1F6E44"], schlecht: ["#FCEFE8", "#8E3F17"] }[art];
  return (
    <div role={art === "warn" || art === "schlecht" ? "alert" : "status"}
      style={{ background: farben[0], color: farben[1], borderRadius: 12, padding: "10px 12px", fontSize: 13.5, lineHeight: 1.55, marginBottom: 12, fontWeight: 600 }}>
      {children}
    </div>
  );
}

/* Ganzzahliges Eingabefeld */
export function Feld({ wert, setWert, label, farbe = C.see, breite = 40, schmal = false }) {
  /* schmal: Feld darf in einer nicht umbrechenden Zeile (z. B. Ebenengleichung) bis auf 24 px schrumpfen */
  const groesse = schmal ? { width: 0, flex: `1 1 ${breite}px`, minWidth: 24, maxWidth: breite, padding: 0, fontSize: "inherit" } : { width: breite, fontSize: 15 };
  return (
    <MatheFeld modus="ganzvz" value={wert} aria-label={label}
      onChange={(e) => setWert(e.target.value.replace(/[^0-9\-−]/g, "").replace("−", "-").slice(0, 4))}
      onFocus={(e) => e.target.select()}
      style={{ ...groesse, height: 34, textAlign: "center", fontWeight: 800, fontFamily: "inherit", color: farbe,
        border: `1.5px solid ${farbe}55`, borderRadius: 9, background: `${farbe}0D`, outline: "none" }} />
  );
}

/* Ebenengleichung a·x₁ + b·x₂ + c·x₃ = d – steht immer in EINER Zeile (Schrift und Felder schrumpfen mit der Breite) */
export function EbenenZeile({ name, w, setze, farbe = C.see, textFarbe, labelVor = "", style }) {
  const lab = (b) => (labelVor ? `${labelVor} ${b}` : b);
  return (
    <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", gap: 3, fontSize: "clamp(12px, 3.9vw, 16px)", fontWeight: 800, whiteSpace: "nowrap", color: textFarbe || farbe, ...style }}>
      <span>{name}:</span>
      <Feld wert={w[0]} setWert={setze(0)} label={lab("a")} farbe={farbe} schmal /><span>x₁ +</span>
      <Feld wert={w[1]} setWert={setze(1)} label={lab("b")} farbe={farbe} schmal /><span>x₂ +</span>
      <Feld wert={w[2]} setWert={setze(2)} label={lab("c")} farbe={farbe} schmal /><span>x₃ =</span>
      <Feld wert={w[3]} setWert={setze(3)} label={lab("d")} farbe={farbe} breite={48} schmal />
    </div>
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

/* Punkt in eigener Box: Kopf „A Punkt“, darunter ( _ | _ | _ ) */
export function PunktBox({ name, farbe, werte, setWerte, art = "Punkt" }) {
  const setze = (i) => (v) => { const w = [...werte]; w[i] = v; setWerte(w); };
  const text = farbe === VF.zwei || farbe === C.gruen ? VF.zweiText : farbe;
  return (
    <ObjektBox farbe={farbe} name={name} art={art}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, fontSize: 18, fontWeight: 700, color: C.hellgrau }}>
        <span>(</span>
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ fontWeight: 400 }}>|</span>}
            <Feld wert={werte[i]} setWert={setze(i)} label={`${name} Koordinate x${i + 1}`} farbe={text} breite={40} />
          </React.Fragment>
        ))}
        <span>)</span>
      </div>
    </ObjektBox>
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
function Weg({ titel, offen, umschalten, children, id, stuetz, farbe }) {
  return (
    <div style={{ border: `1.5px solid ${offen ? C.see : C.linie}`, borderRadius: 18, marginTop: 10, background: C.weiss, overflow: "hidden",
      boxShadow: offen ? "0 10px 30px -18px rgba(15,26,51,0.3)" : "none" }}>
      <button type="button" onClick={umschalten} aria-expanded={offen} aria-controls={id}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, minHeight: 54, padding: "10px 14px",
          border: "none", background: offen ? VF.einsHell : C.weiss, cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: C.tinte }}>
        <span style={{ fontSize: 15, fontWeight: 800 }}>{titel}</span>
        {stuetz && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.grau }}>
            Stützpunkt
            <span style={{ minWidth: 24, height: 24, padding: "0 6px", borderRadius: 7, background: farbe, color: C.weiss, fontSize: 13.5, fontWeight: 800,
              display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{stuetz}</span>
          </span>
        )}
        <span style={{ marginLeft: "auto" }}><AufklappZeichen auf={offen} farbe={C.see} /></span>
      </button>
      {offen && <div id={id} data-aufklapp-inhalt style={{ padding: "14px 12px 4px" }}>{children}</div>}
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

  const fG = VF.drei;   // die Gerade ist das Ergebnis
  const desktop = useDesktop();
  const seitenTitel = "Zwei Punkte – eine Gerade";
  const seitenText = "Ein Punkt liefert den Stützvektor, der Weg zum anderen Punkt den Richtungsvektor. Welchen Punkt du als Stützpunkt nimmst, ist egal.";
  const boxen = (
    <ObjektReihe>
      <PunktBox name="A" farbe={FA} werte={Aw} setWerte={setAw} />
      <PunktBox name="B" farbe={FB} werte={Bw} setWerte={setBw} />
    </ObjektReihe>
  );
  const fehler = !A || !B ? <Meldung art="warn">Bitte in jedes Feld eine ganze Zahl eintragen.</Meldung>
    : gleich(A, B) ? <Meldung art="warn">A und B sind derselbe Punkt. Durch einen einzelnen Punkt gehen unendlich viele Geraden – die Gerade ist nicht eindeutig bestimmt.
      Ändere einen der Punkte.</Meldung> : null;
  const raum = (breit) => (
    <Raum3 key={[...A, ...B].join()} punkte={[{ p: A, label: "A", farbe: FA }, { p: B, label: "B", farbe: VF.zweiText }]} gerade={{ p: A, r: diff(A, B), farbe: fG }}
      legende={[{ text: "A", farbe: FA, art: "punkt" }, { text: "B", farbe: FB, art: "punkt" }, { text: "g", farbe: fG }]} arbeitsflaeche={breit} />
  );
  const wegInhalt = (S, Q) => (
    <>
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
      <p style={{ ...hinweis, margin: "0 0 12px 36px" }}>Probe: t = 0 ergibt {S}, t = 1 ergibt {Q}.</p>
    </>
  );
  const beideWege = (
    <Meldung>
      Beide Wege beschreiben dieselbe Gerade: <Name t="BA" farbe={FE} /> = −1 · <Name t="AB" farbe={FE} /> ist parallel zu <Name t="AB" farbe={FE} />,
      und B liegt auf der Geraden aus Weg 1 (t = 1).
    </Meldung>
  );

  /* ---------- Desktop: Punkte links, 3D-Bild rechts, beide Wege darunter nebeneinander ---------- */
  if (desktop) {
    return (
      <VekSeite titel={seitenTitel} text={seitenText}>
        <div data-zp="breit">
          <VekArbeit
            links={<>
              {/* am Desktop untereinander: die Punktfelder brauchen ≈ 180 px je Box */}
              <div data-zp-punkte="" style={{ display: "grid", gap: 10 }}>
                <PunktBox name="A" farbe={FA} werte={Aw} setWerte={setAw} />
                <PunktBox name="B" farbe={FB} werte={Bw} setWerte={setBw} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}><WuerfelKnopf onClick={neu}>Neue Punkte</WuerfelKnopf></div>
              {!fehler && beideWege}
            </>}
            rechts={fehler || raum(true)} />
        </div>
        {!fehler && (
          <div>
            <Tafel titel="Zwei Wege zur Geradengleichung" stil={{ marginTop: 20 }}>
              <ErgebnisReihe gap={20}>
                {[["A", "B"], ["B", "A"]].map(([S, Q], i) => (
                  <div key={S} data-zp-weg={S} style={{ minWidth: 0 }}>
                    <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, color: C.tinte, margin: "0 0 12px" }}>
                      Weg {i + 1}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.grau }}>
                        Stützpunkt
                        <span style={{ minWidth: 24, height: 24, padding: "0 6px", borderRadius: 7, background: farbe[S], color: C.weiss, fontSize: 13.5, fontWeight: 800,
                          display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{S}</span>
                      </span>
                    </p>
                    {wegInhalt(S, Q)}
                  </div>
                ))}
              </ErgebnisReihe>
            </Tafel>
          </div>
        )}
        {A && B && !gleich(A, B) && <div><GeradePruefen A={A} B={B} key={[...A, ...B].join()} /></div>}
      </VekSeite>
    );
  }

  return (
    <VekSeite titel={seitenTitel} text={seitenText}>
      {boxen}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}><WuerfelKnopf onClick={neu}>Neue Punkte</WuerfelKnopf></div>

      {fehler ? (
        <div style={{ marginTop: 12 }}>{fehler}</div>
      ) : (
        <>
          <div style={{ marginTop: 12 }}>
            {raum(false)}
          </div>
          <Tafel titel="Zwei Wege zur Geradengleichung" text="Öffne einen Weg – jeder Schritt steht einzeln da.">
            {[["A", "B"], ["B", "A"]].map(([S, Q], i) => (
              <Weg key={S} id={`zp-weg-${S}`} titel={`Weg ${i + 1}`} stuetz={S} farbe={farbe[S]} offen={offen === S} umschalten={() => setOffen(offen === S ? null : S)}>
                {wegInhalt(S, Q)}
              </Weg>
            ))}
            <div style={{ marginTop: 12 }}>
              {beideWege}
            </div>
          </Tafel>
        </>
      )}

      {A && B && !gleich(A, B) && <GeradePruefen A={A} B={B} key={[...A, ...B].join()} />}
    </VekSeite>
  );
}

/* Eigene Parametrisierung prüfen: dieselbe Gerade? */
function GeradePruefen({ A, B }) {
  const [Pw, setPw] = useState(["", "", ""]);
  const [rw, setRw] = useState(["", "", ""]);
  const [ergebnis, setErgebnis] = useStateGebucht(null);
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
    <Tafel titel="Jetzt selbst: Ist das dieselbe Gerade?" text="Gib eine eigene Geradengleichung durch A und B ein – mit beliebigem Stützpunkt der Geraden und beliebigem Richtungsvektor. Die App prüft, ob sie dieselbe Gerade beschreibt.">
      <ObjektBox farbe={C.see} name="g" art="Deine Gerade">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 800, display: "inline-flex", gap: 6 }}><Name t="x" /> =</span>
          <VektorFeld name="" farbe={FA} werte={Pw} setWerte={(w) => { setPw(w); setErgebnis(null); }} />
          <span style={{ fontSize: 16, fontWeight: 800 }}>+ t ·</span>
          <VektorFeld name="" farbe={FE} werte={rw} setWerte={(w) => { setRw(w); setErgebnis(null); }} />
        </div>
      </ObjektBox>
      {ergebnis && <div style={{ marginTop: 12 }}><Meldung art={ergebnis.art}>{ergebnis.text}</Meldung></div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <HauptKnopf onClick={pruefen}>Prüfen</HauptKnopf>
        <IchHaengeFest kontext={geradeHilfe(A, B)} />
      </div>
    </Tafel>
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

  const desktop = useDesktop();
  const seitenTitel = "Drei Punkte – eine Ebene";
  const seitenText = "Ein Punkt wird Stützpunkt, die Wege zu den beiden anderen werden Spannvektoren. Danach rechnest du die Parameterform in die Koordinatenform um.";
  const punktBoxen = [
    <PunktBox key="A" name="A" farbe={FA} werte={Aw} setWerte={setAw} />,
    <PunktBox key="B" name="B" farbe={FB} werte={Bw} setWerte={setBw} />,
    <PunktBox key="C" name="C" farbe={FS} werte={Cw} setWerte={setCw} />,
  ];
  const wuerfel = <WuerfelKnopf onClick={neu}>Neue Punkte</WuerfelKnopf>;
  const raum = (breit) => !fehler && (
    <Raum3 key={[...A, ...B, ...Cp].join()} punkte={[{ p: A, label: "A", farbe: FA }, { p: B, label: "B", farbe: VF.zweiText }, { p: Cp, label: "C", farbe: FS }]}
      ebene={{ n: formen[0].nv, d: formen[0].d }}
      legende={[{ text: "A", farbe: FA, art: "punkt" }, { text: "B", farbe: FB, art: "punkt" }, { text: "C", farbe: FS, art: "punkt" }, { text: "E", farbe: C.see, art: "flaeche" }]}
      arbeitsflaeche={breit} />
  );
  const pruefText = <>Prüfung vorab: <Name t="AB" farbe={FE} /> × <Name t="AC" farbe={FE} /> ≠ <Name t="0" />, die Punkte liegen also nicht auf einer Geraden.</>;
  /* ein Weg in zwei Teilen: Spannvektoren + Parameterform | Umrechnung in die Koordinatenform */
  const wegTeile = ([S, P, Q]) => {
    const u = diff(pkt[S], pkt[P]), v = diff(pkt[S], pkt[Q]);
    return [
      <>
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
      </>,
      <KoordinatenformRechnung S={S} u={u} v={v} P={pkt[S]} farbeS={farbe[S]} nU={S + P} nV={S + Q} />,
    ];
  };
  const vergleichInhalt = !fehler && (
    <>
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
    </>
  );
  const weiter = !fehler && (() => {
    const k = [...formen[0].norm.n, formen[0].norm.d];
    const passt = k.every((x) => Number.isInteger(x) && Math.abs(x) <= 10);
    return (
      <WeiterMit titel="Weiter mit dieser Ebene">
        {passt && <WeiterKnopf ziel="ebenen" von="Drei Punkte – eine Ebene" daten={{ k }} zeile={`${koordText(formen[0].norm.n, formen[0].norm.d)} im Raum drehen, Spurpunkte und Normalenvektor sehen`} />}
        <WeiterKnopf ziel="abstaende" von="Drei Punkte – eine Ebene" daten={{ ebene: k }} zeile="Abstand eines Punktes zu genau dieser Ebene berechnen" />
      </WeiterMit>
    );
  })();

  /* ---------- Desktop: Punkte und Vergleich links, 3D-Bild rechts, gewählter Weg darunter in zwei Spalten ---------- */
  if (desktop) {
    const wahl = varianten.find(([S]) => S === offen) || varianten[0];
    const [teil1, teil2] = fehler ? [null, null] : wegTeile(wahl);
    return (
      <VekSeite titel={seitenTitel} text={seitenText}>
        <div data-dp="breit">
          <VekArbeit
            links={<>
              {/* am Desktop untereinander: die Punktfelder brauchen ≈ 180 px je Box */}
              <div data-dp-punkte="" style={{ display: "grid", gap: 10 }}>{punktBoxen}</div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{wuerfel}</div>
            </>}
            rechts={fehler ? <Meldung art="warn">{fehler}</Meldung> : raum(true)} />
        </div>
        {!fehler && (
          <div>
            <Tafel titel={`Rechenweg mit Stützpunkt ${wahl[0]}`} text={pruefText} stil={{ marginTop: 20 }}
              rechts={<FallWahl label="Weg wählen" wert={wahl[0]} setWert={(S) => setOffen(S)}
                optionen={varianten.map(([S], i) => [S, `Weg ${String.fromCharCode(65 + i)}: Stützpunkt ${S}`])} />}>
              <div data-dp-weg={wahl[0]}>
                <ErgebnisReihe gap={20}>
                  <div style={{ minWidth: 0 }}>{teil1}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: C.see, margin: "3px 0 10px" }}>Parameterform in Koordinatenform umrechnen</p>
                    {teil2}
                  </div>
                </ErgebnisReihe>
              </div>
            </Tafel>
          </div>
        )}
        {!fehler && (
          <div style={{ marginTop: 16 }}>
            <ErgebnisReihe spalten="minmax(0, 1fr) minmax(0, 320px)" gap={20}>
              <FeinKarte data-dp-vergleich="">
                <p style={{ fontSize: 14, fontWeight: 800, color: C.tinte, margin: "0 0 8px" }}>Vergleich der drei Koordinatengleichungen</p>
                {vergleichInhalt}
              </FeinKarte>
              <div style={{ marginTop: -18 }}>{weiter}</div>
            </ErgebnisReihe>
          </div>
        )}
        {!fehler && <div><EbenePruefen norm={formen[0].norm} A={A} B={B} Cp={Cp} key={[...A, ...B, ...Cp].join()} /></div>}
      </VekSeite>
    );
  }

  return (
    <VekSeite titel={seitenTitel} text={seitenText}>
      {/* vier Zellen: A, B, C und der Würfel – mobil 2 × 2, breit eine Reihe */}
      <ObjektReihe min={160}>
        {punktBoxen}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 60 }}>{wuerfel}</div>
      </ObjektReihe>

      {fehler ? <div style={{ marginTop: 12 }}><Meldung art="warn">{fehler}</Meldung></div> : (
        <>
          <div style={{ marginTop: 12 }}>
            {raum(false)}
          </div>
          <Tafel titel="Drei Wege zur Ebene" text={pruefText}>
            {varianten.map(([S, P, Q], i) => {
              const [teil1, teil2] = wegTeile([S, P, Q]);
              return (
                <Weg key={S} id={`dp-weg-${S}`} titel={`Weg ${String.fromCharCode(65 + i)}`} stuetz={S} farbe={farbe[S]} offen={offen === S}
                  umschalten={() => setOffen(offen === S ? null : S)}>
                  {teil1}
                  {teil2}
                </Weg>
              );
            })}
            <div style={{ background: VF.flaeche, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "12px 12px 4px", marginTop: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.tinte, marginBottom: 8 }}>Vergleich der drei Koordinatengleichungen</p>
              {vergleichInhalt}
            </div>
          </Tafel>
          {weiter}
        </>
      )}

      {!fehler && <EbenePruefen norm={formen[0].norm} A={A} B={B} Cp={Cp} key={[...A, ...B, ...Cp].join()} />}
    </VekSeite>
  );
}

/* Eigene Koordinatengleichung prüfen: dieselbe Ebene? */
function EbenePruefen({ norm, A, B, Cp }) {
  const [w, setW] = useState(["", "", "", ""]);
  const [ergebnis, setErgebnis] = useStateGebucht(null);
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
    <Tafel titel="Jetzt selbst: Stimmt deine Koordinatengleichung?" text="Rechne selbst und gib deine Koordinatengleichung ein. Auch Vielfache der gekürzten Form werden als richtig erkannt.">
      <ObjektBox farbe={C.see} name="E" art="Deine Ebene">
        <EbenenZeile name="E" w={w} setze={setze} textFarbe="inherit" />
      </ObjektBox>
      {ergebnis && <div style={{ marginTop: 12 }}><Meldung art={ergebnis.art}>{ergebnis.text}</Meldung></div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <HauptKnopf onClick={pruefen}>Prüfen</HauptKnopf>
        <IchHaengeFest kontext={ebeneHilfe(A, B, Cp, norm)} />
      </div>
    </Tafel>
  );
}
