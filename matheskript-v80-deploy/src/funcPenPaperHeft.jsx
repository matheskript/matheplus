import React, { useState } from "react";
import { C } from "./base1.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { englisch } from "./i18n.js";
import "@fontsource/caveat/600.css";

/* ======================================================================
   PEN-&-PAPER-KURS: Heftseiten
     HeftVergleich     – dieselbe Aufgabe „vorher“ und „nachher“, vier antippbare Markierungen
     MathildaBeispiel  – Beispielblatt mit Mathildas Rückmeldung (Fragen statt Lösung, offene Unsicherheit)

   Die Heftseiten sind nachgebaut (Handschrift-Schrift „Caveat“ über @fontsource, SIL OFL).
   Echte Fotos: assets/penpaper/vorher.jpg und nachher.jpg ablegen (siehe LIESMICH.txt) –
   dann zeigt der Vergleich automatisch die Fotos.
   ====================================================================== */

const L = (de, en) => (englisch() ? en : de);

const NAVY = "#0B1E4A";
const GOLD = C.flaggold;
const LABEL = "#626D8A";
const TINTE = "#23408E";          // Kugelschreiber-Blau
const SCHIEFER = "#5A6582";
const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const HAND = { fontFamily: "'Caveat', 'Bradley Hand', 'Segoe Print', cursive", fontWeight: 600, color: TINTE };

/* ---------------------------------------------------------------- echte Fotos (optional) */

const FOTO_DATEIEN = import.meta.glob("./assets/penpaper/*.{jpg,jpeg,png,webp}", { eager: true, query: "?url", import: "default" });
function fotos() {
  const finde = (name) => {
    const k = Object.keys(FOTO_DATEIEN).find((p) => new RegExp("/" + name + "\\.[a-z]+$", "i").test(p));
    return k ? FOTO_DATEIEN[k] : null;
  };
  const v = finde("vorher"), n = finde("nachher");
  return v && n ? { vorher: v, nachher: n } : null;
}

/* ---------------------------------------------------------------- Bausteine */

function HeftStil() {
  return (
    <style>{`.pp-pin:focus-visible,.pp-seg:focus-visible{outline:3px solid ${GOLD};outline-offset:2px}`}</style>
  );
}

function tabTaste(e, n, aktuell, setze) {
  const k = e.key;
  let i = aktuell;
  if (k === "ArrowRight" || k === "ArrowDown") i = (aktuell + 1) % n;
  else if (k === "ArrowLeft" || k === "ArrowUp") i = (aktuell - 1 + n) % n;
  else if (k === "Home") i = 0;
  else if (k === "End") i = n - 1;
  else return;
  e.preventDefault();
  setze(i);
  const tabs = e.currentTarget.querySelectorAll('[role="tab"]');
  if (tabs[i]) tabs[i].focus();
}

/* Karoheft-Seite: Karos, roter Rand links */
function Heft({ children, minHoehe }) {
  return (
    <div style={{ position: "relative", background: "#FFFEFB", borderRadius: 12, border: `1px solid ${C.linie}`, overflow: "hidden", padding: "12px 10px 14px 40px", minHeight: minHoehe,
      backgroundImage: "linear-gradient(rgba(0,77,152,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(0,77,152,0.10) 1px, transparent 1px)",
      backgroundSize: "24px 24px", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.7), 0 6px 18px rgba(15,26,51,0.08)" }}>
      <span aria-hidden="true" style={{ position: "absolute", left: 30, top: 0, bottom: 0, width: 1.5, background: "rgba(214,72,72,0.5)" }} />
      {children}
    </div>
  );
}

function Pin({ nr, aktiv, onClick, farbe, text = "#fff", label }) {
  return (
    <button type="button" className="pp-pin" aria-label={label} aria-pressed={aktiv} onClick={onClick}
      style={{ position: "absolute", right: 0, top: "50%", transform: `translateY(-50%) scale(${aktiv ? 1.12 : 1})`, width: 32, height: 32, borderRadius: 999, padding: 0,
        border: `2.5px solid ${aktiv ? NAVY : "#fff"}`, background: farbe, color: text, fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, cursor: "pointer",
        boxShadow: "0 2px 10px rgba(15,26,51,0.32)", transition: "transform .15s" }}>{nr}</button>
  );
}

/* Eine handgeschriebene Zeile; schief/versatz machen sie „unordentlich“ */
function Zeile({ children, schief = 0, versatz = 0, pin, aktiv, hell }) {
  return (
    <div style={{ position: "relative", minHeight: 48, paddingRight: 40, display: "flex", alignItems: "center",
      background: aktiv ? hell || "rgba(237,187,0,0.16)" : "transparent", borderRadius: 8, transition: "background .2s", margin: "0 -6px", paddingLeft: 6 }}>
      <div style={{ ...HAND, fontSize: 28, lineHeight: 1.1, transform: `translateX(${versatz}px) rotate(${schief}deg)`, transformOrigin: "left center", whiteSpace: "nowrap" }}>{children}</div>
      {pin}
    </div>
  );
}

function Bruch({ z, n }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", margin: "0 5px", lineHeight: 1.05 }}>
      <span style={{ padding: "0 5px 1px" }}>{z}</span>
      <span style={{ borderTop: `2.4px solid ${TINTE}`, padding: "1px 5px 0" }}>{n}</span>
    </span>
  );
}

const Hoch = ({ children, tief }) => (
  <span style={{ position: "relative", top: tief ? 5 : -10, fontSize: "0.7em", marginLeft: tief ? 4 : 1, lineHeight: 0 }}>{children}</span>
);

const Plakette = ({ farbe, text = "#fff", children }) => (
  <span style={{ display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: "0.07em", padding: "4px 10px", borderRadius: 999, background: farbe, color: text }}>{children}</span>
);

/* ---------------------------------------------------------------- Vorher / Nachher */

export function HeftVergleich() {
  const [modus, setModus] = useState("vorher");
  const [pin, setPin] = useState(0);
  const foto = fotos();
  const nachher = modus === "nachher";

  const punkte = [
    { name: L("Klarschrift", "Clear writing"), en: "Clear writing",
      vorher: L("„7−3/3−1“ lässt offen, was Zähler und Nenner ist. Wörtlich gelesen wäre es 7 − 1 − 1 = 5 und nicht 2.", "“7−3/3−1” leaves open what the numerator and denominator are. Read literally it would be 7 − 1 − 1 = 5, not 2."),
      nachher: L("Der Bruchstrich trennt Zähler (7 − 3) und Nenner (3 − 1) eindeutig. Niemand muss raten.", "The fraction bar clearly separates numerator (7 − 3) and denominator (3 − 1). Nobody has to guess."),
      achte: L("Sind Zahlen, Exponenten und Bruchstriche eindeutig lesbar?", "Are numbers, exponents and fraction bars unambiguous?") },
    { name: "Final Operators", en: "Final operators",
      vorher: L("In einer Zeile stehen b, ein Zwischenergebnis und die fertige Gerade. „1 = y = 2x + 1“ ist falsch geschrieben: 1 ist nicht y.", "One line holds b, an intermediate result and the finished line. “1 = y = 2x + 1” is written wrongly: 1 is not y."),
      nachher: L("Eine Umformung pro Zeile, die Gleichheitszeichen stehen untereinander. Die fertige Gerade steht allein und ist doppelt unterstrichen.", "One step per line, with the equals signs lined up. The finished line stands alone and is double-underlined."),
      achte: L("Verbindet jedes Gleichheitszeichen wirklich Gleiches – und steht pro Zeile eine Umformung?", "Does every equals sign really connect equal things – and is there one step per line?") },
    { name: L("Klarheitsabstand", "Clarity spacing"), en: "Clarity spacing",
      vorher: L("Bei „6+1=7“ klebt alles zusammen. Man sieht nicht, wo ein Termhaus endet und das nächste beginnt.", "In “6+1=7” everything sticks together. You cannot see where one term house ends and the next begins."),
      nachher: L("Abstände um + und = machen die Termhäuser sichtbar: 2 · 3 + 1.", "Gaps around + and = make the term houses visible: 2 · 3 + 1."),
      achte: L("Sieht man auf einen Blick, wo ein Termhaus endet?", "Can you see at a glance where a term house ends?") },
    { name: L("Selbstkontrolle", "Self-check"), en: "Self-check",
      vorher: L("Das Ergebnis geht unter, und nirgends steht, dass geprüft wurde. Ob die Gerade stimmt, weiß nur, wer geschrieben hat.", "The result gets lost, and nowhere does it say that anything was checked. Only the writer knows whether the line is right."),
      nachher: L("Die Probe f(3) = 7 ✓ steht ausdrücklich auf dem Blatt – wer es liest, kann sie nachvollziehen.", "The check f(3) = 7 ✓ is explicitly on the page – whoever reads it can follow it."),
      achte: L("Ist die Probe sichtbar und das Ergebnis hervorgehoben?", "Is the check visible and the result highlighted?") },
  ];
  const farbe = nachher ? GOLD : C.signal;
  const pinText = nachher ? NAVY : "#fff";
  const mkPin = (i) => (
    <Pin nr={i + 1} aktiv={pin === i} farbe={farbe} text={pinText} onClick={() => setPin(i)}
      label={`${L("Markierung", "Marker")} ${i + 1}: ${punkte[i].name}`} />
  );
  const gelb = "rgba(237,187,0,0.18)", rot = "rgba(184,92,46,0.12)";
  const hell = nachher ? gelb : rot;
  const P = punkte[pin];

  return (
    <div>
      <HeftStil />
      <div role="tablist" aria-label={L("Vorher oder nachher", "Before or after")} onKeyDown={(e) => tabTaste(e, 2, nachher ? 1 : 0, (i) => setModus(i ? "nachher" : "vorher"))}
        style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 4, background: "#EEF3FA", borderRadius: 14, padding: 4, marginBottom: 12 }}>
        {[["vorher", L("Vorher", "Before")], ["nachher", L("Nachher", "After")]].map(([id, t]) => (
          <button key={id} type="button" role="tab" aria-selected={modus === id} tabIndex={modus === id ? 0 : -1} className="pp-seg" onClick={() => setModus(id)}
            style={{ padding: "11px 8px", borderRadius: 11, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700,
              background: modus === id ? NAVY : "transparent", color: modus === id ? GOLD : SCHIEFER, transition: "background .2s" }}>{t}</button>
        ))}
      </div>

      <p style={{ fontSize: 12.5, color: LABEL, marginBottom: 8 }}>
        {L("Aufgabe: Gerade durch P(1 | 3) und Q(3 | 7) bestimmen und prüfen. Gleiche Mathematik, gleiche Schülerin – nur anders aufgeschrieben.",
          "Task: find the line through P(1 | 3) and Q(3 | 7) and check it. Same maths, same student – just written down differently.")}
      </p>

      {foto ? (
        <div key={modus} className="pp-neu" style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.linie}`, background: "#fff" }}>
          <img src={foto[modus]} alt={nachher ? L("Heftseite nachher: strukturiert nach Pen & Paper", "Notebook page after: structured with Pen & Paper") : L("Heftseite vorher: unstrukturiert", "Notebook page before: unstructured")}
            style={{ display: "block", width: "100%", maxHeight: 520, objectFit: "contain" }} />
        </div>
      ) : (
        <div key={modus} className="pp-neu">
          <Heft minHoehe={modus === "vorher" ? 224 : 392}>
            {!nachher ? (
              <>
                <Zeile schief={-1.1} versatz={2} aktiv={pin === 0} hell={hell} pin={mkPin(0)}><span style={{ letterSpacing: "-0.5px" }}>m=7-3/3-1=4/2=2</span></Zeile>
                <Zeile schief={0.9} versatz={-1} aktiv={pin === 1} hell={hell} pin={mkPin(1)}><span style={{ letterSpacing: "-0.5px" }}>b=3-2·1=1=y=2x+1</span></Zeile>
                <Zeile schief={-0.5} versatz={3} aktiv={pin === 2} hell={hell} pin={mkPin(2)}><span style={{ letterSpacing: "-0.4px" }}>f(3)=2·3+1=6+1=7</span></Zeile>
                <Zeile aktiv={pin === 3} hell={hell} pin={mkPin(3)}>
                  <span style={{ fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: LABEL, fontStyle: "italic" }}>{L("– hier fehlt etwas –", "– something is missing here –")}</span>
                </Zeile>
              </>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "auto auto minmax(0, 1fr)", columnGap: 0, rowGap: 0, alignItems: "stretch", paddingRight: 0 }}>
                {[
                  [0, "m", <Bruch z="7 − 3" n="3 − 1" />],
                  [null, "", <Bruch z="4" n="2" />],
                  [null, "", "2"],
                  [1, "b", "3 − 2 · 1"],
                  [null, "", "1"],
                  [null, "", <span style={{ borderBottom: `3px double ${TINTE}`, paddingBottom: 1 }}>y = 2x + 1</span>, true],
                  [2, "f(3)", "2 · 3 + 1"],
                  [3, "", <span>7 <span style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.8em" }}>✓</span></span>],
                ].map(([p, l, r, solo], i) => {
                  const an = p !== null && pin === p;
                  const bg = an ? gelb : "transparent";
                  const zelle = { ...HAND, fontSize: 28, minHeight: 48, display: "flex", alignItems: "center", background: bg, transition: "background .2s" };
                  return (
                    <React.Fragment key={i}>
                      {solo ? (
                        <div style={{ ...zelle, gridColumn: "1 / -1", paddingLeft: 8 }}>{r}</div>
                      ) : (
                        <>
                          <div style={{ ...zelle, justifyContent: "flex-end", paddingLeft: 6 }}>{l}</div>
                          <div style={{ ...zelle, padding: "0 12px" }}>=</div>
                          <div style={{ ...zelle, position: "relative", paddingRight: 40 }}>{r}{p !== null && mkPin(p)}</div>
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </Heft>
        </div>
      )}

      {/* vier Werkzeuge als Auswahl */}
      <div role="group" aria-label={L("Worauf es ankommt", "What matters")} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginTop: 12 }}>
        {punkte.map((x, i) => (
          <button key={x.en} type="button" aria-pressed={pin === i} onClick={() => setPin(i)}
            style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", padding: "10px 11px", borderRadius: 13, cursor: "pointer", fontFamily: "inherit",
              border: `1.5px solid ${pin === i ? NAVY : C.linie}`, background: pin === i ? NAVY : "#fff", transition: "background .2s" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 999, background: farbe, color: pinText, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: pin === i ? "#fff" : NAVY, lineHeight: 1.2 }}>{x.name}</span>
          </button>
        ))}
      </div>

      <div key={`${modus}${pin}`} className="pp-neu" aria-live="polite" style={{ ...karte, marginTop: 10, padding: "14px 16px", borderLeft: `4px solid ${farbe}` }}>
        <p style={{ marginBottom: 7 }}>
          <Plakette farbe={nachher ? GOLD : C.signal} text={nachher ? NAVY : "#fff"}>{nachher ? L("SO GEHT’S", "DO IT LIKE THIS") : L("DAS STÖRT", "WHAT GETS IN THE WAY")} · {P.name.toUpperCase()}</Plakette>
        </p>
        <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.7 }}>{foto ? P.achte : nachher ? P.nachher : P.vorher}</p>
      </div>
      <p style={{ fontSize: 12.5, color: LABEL, lineHeight: 1.6, marginTop: 10 }}>
        {foto
          ? L("Echte Heftseiten aus dem Unterricht.", "Real notebook pages from lessons.")
          : L("Nachgebaute Beispielseiten. Tippe auf die Zahlen am Rand oder unten auf ein Werkzeug.", "Re-created example pages. Tap the numbers in the margin or one of the tools below.")}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Mathilda: Beispielrückmeldung */

export function MathildaBeispiel() {
  const [sel, setSel] = useState(0);
  const TYP = {
    fehler: { farbe: C.signal, text: "#fff", name: L("RECHENFEHLER", "CALCULATION ERROR"), bg: "rgba(184,92,46,0.12)" },
    hinweis: { farbe: GOLD, text: NAVY, name: L("HINWEIS ZUR DARSTELLUNG", "NOTE ON PRESENTATION"), bg: "rgba(237,187,0,0.2)" },
    unsicher: { farbe: SCHIEFER, text: "#fff", name: L("UNSICHER GELESEN", "READ WITH UNCERTAINTY"), bg: "rgba(90,101,130,0.15)" },
  };
  const funde = [
    { zeile: 0, typ: "unsicher", kat: "arbeit", titel: L("Zeile 1 · Lesbarkeit", "Line 1 · Legibility"), sicher: false,
      text: L("Ich bin mir hier nicht sicher: Ich lese „x 2“. Ist das x² mit Exponent oder x · 2? Schreib den Exponenten direkt rechts oben an das x – dann muss ich nicht raten.",
        "I'm not sure here: I read “x 2”. Is that x² with an exponent or x · 2? Write the exponent right at the top right of the x – then I don't have to guess.") },
    { zeile: 1, typ: "hinweis", kat: "arbeit", titel: L("Zeile 2 · Zwischenschritt", "Line 2 · Missing step"), sicher: true,
      text: L("Von Zeile 1 auf Zeile 2 fehlt ein Zwischenschritt. Was musst du zu x² − 4x addieren, damit ein Quadrat entsteht – und was danach wieder abziehen? Schreib diesen Schritt auf, dann lässt sich dein Gedanke nachvollziehen.",
        "A step is missing between line 1 and line 2. What do you have to add to x² − 4x to get a square – and what do you then have to subtract again? Write that step down so your thinking can be followed.") },
    { zeile: 2, typ: "fehler", kat: "mathe", titel: L("Zeile 3 · Vorzeichen", "Line 3 · Sign"), sicher: true,
      text: L("Prüfe −4 + 3 in einer eigenen Nebenrechnung. Passt das Vorzeichen deines Ergebnisses?", "Check −4 + 3 in a separate side calculation. Does the sign of your result fit?") },
    { zeile: 3, typ: "fehler", kat: "mathe", titel: L("Zeile 4 · Scheitelpunkt", "Line 4 · Vertex"), sicher: true,
      text: L("Zwei Dinge zum Prüfen: Bei welchem x wird die Klammer (x − 2) null? Und der y-Wert hängt an deinem Ergebnis aus Zeile 3 – stimmt er noch?",
        "Two things to check: at which x does the bracket (x − 2) become zero? And the y-value depends on your result from line 3 – does it still hold?") },
  ];
  const F = funde[sel], T = TYP[F.typ];
  const nMathe = funde.filter((f) => f.kat === "mathe").length;
  const nArbeit = funde.filter((f) => f.kat === "arbeit").length;
  const mkPin = (i) => (
    <Pin nr={i + 1} aktiv={sel === i} farbe={TYP[funde[i].typ].farbe} text={TYP[funde[i].typ].text} onClick={() => setSel(i)}
      label={`${L("Rückmeldung", "Feedback")} ${i + 1}: ${funde[i].titel}`} />
  );
  const bg = (i) => (sel === i ? TYP[funde[i].typ].bg : "transparent");

  return (
    <div>
      <HeftStil />
      <div style={{ ...karte, padding: "16px 14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <Plakette farbe={NAVY} text={GOLD}>{L("BEISPIEL", "EXAMPLE")}</Plakette>
          <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{L("So sieht die Rückmeldung aus", "What the feedback looks like")}</span>
        </div>
        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginBottom: 12 }}>
          {L("Aufgabe: Scheitelpunkt von f(x) = x² − 4x + 3. Tippe eine Markierung an.", "Task: vertex of f(x) = x² − 4x + 3. Tap a marker.")}
        </p>
        <Heft minHoehe={216}>
          <Zeile aktiv={sel === 0} hell={bg(0)} pin={mkPin(0)}>
            f(x) = x<Hoch tief>2</Hoch> − 4x + 3
          </Zeile>
          <Zeile aktiv={sel === 1} hell={bg(1)} pin={mkPin(1)} versatz={10}>
            = (x − 2)<Hoch>2</Hoch> − 4 + 3
          </Zeile>
          <Zeile aktiv={sel === 2} hell={bg(2)} pin={mkPin(2)} versatz={10}>
            = (x − 2)<Hoch>2</Hoch> + 1
          </Zeile>
          <Zeile aktiv={sel === 3} hell={bg(3)} pin={mkPin(3)}>
            S(−2 | 1)
          </Zeile>
        </Heft>

        <div key={sel} className="pp-neu" aria-live="polite" style={{ marginTop: 12, borderRadius: 14, border: `1px solid ${C.linie}`, padding: "13px 14px", borderLeft: `4px solid ${T.farbe}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 7 }}>
            <Plakette farbe={T.farbe} text={T.text}>{T.name}</Plakette>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: NAVY }}>{F.titel}</span>
          </div>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.7 }}>
            <b style={{ fontWeight: 700 }}><MathildaName />:</b> {F.text}
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: F.sicher ? C.gruenDunkel : SCHIEFER, marginTop: 9 }}>
            <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 999, background: F.sicher ? GOLD : "transparent", border: F.sicher ? "none" : `2px solid ${SCHIEFER}` }} />
            {F.sicher ? L("Sicher erkannt", "Recognised with confidence") : L("Unsicher – bitte bestätige, was du geschrieben hast", "Unsure – please confirm what you wrote")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginTop: 10 }}>
          {[[L("Mathematik", "Mathematics"), nMathe, L("Rechenfehler", "calculation errors"), C.signal], [L("Arbeitsweise", "Way of working"), nArbeit, L("Hinweise", "notes"), GOLD]].map(([t, n, s, f]) => (
            <div key={t} style={{ borderRadius: 13, background: "#F4F7FC", padding: "10px 12px", borderTop: `3px solid ${f}` }}>
              <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.08em", color: LABEL, textTransform: "uppercase" }}>{t}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginTop: 2 }}>{n} <span style={{ fontWeight: 500, fontSize: 13, color: C.grau }}>{s}</span></p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: LABEL, lineHeight: 1.6, marginTop: 10 }}>
          {L("Mathilda gibt dir Fragen statt der fertigen Lösung, bewertet Mathematik und Arbeitsweise getrennt und sagt offen, wo sie unsicher ist. Das hier ist ein Beispielblatt, keine echte Analyse.",
            "Mathilda gives you questions instead of the finished solution, rates maths and way of working separately, and says openly where she is unsure. This is an example page, not a real analysis.")}
        </p>
      </div>
    </div>
  );
}
