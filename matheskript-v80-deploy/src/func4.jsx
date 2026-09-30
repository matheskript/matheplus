import React, { useState, useRef } from "react";
import { API_URL, C, ganz, zuf } from "./base1.jsx";
import { ABL_TYPEN, FORMELN, GZ_FAMILIEN, PLATZ, TASTEN_FUNK, TASTEN_PARAM, TASTEN_ZAHL, W, ohneKlammer } from "./base2.jsx";
import { kiKopf, kiAntwort } from "./base4.jsx";
import { Trainingsbereich, dekodieren, jsonLesen, parseZahl, rendern } from "./func1.jsx";
import { hoch, termText, zahl } from "./func2.jsx";
import { M, Text, alsFunktion, normieren, numAbleitung, stimmtUeberein } from "./func3.jsx";
import { Arbeitsblatt, merken } from "./func5.jsx";
import { LoesungsWeg } from "./func6.jsx";
import { Auswertung } from "./func9.jsx";
import { Mathilda } from "./func10.jsx";
import { FR } from "./funcRegistry.jsx";

export function FotoAufgaben() {
  const [bild, setBild] = useState(null);
  const [b64, setB64] = useState(null);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState(null);
  const [erg, setErg] = useState(null);
  const [offen, setOffen] = useState({});
  const kameraRef = useRef(null);
  const galerieRef = useRef(null);

  const waehlen = async (file) => {
    if (!file) return;
    setFehler(null); setErg(null);
    try {
      const src = await dekodieren(file, () => {});
      const r = rendern(src, 0);
      setB64(r.b64); setBild(r.vorschau);
    } catch (e) { setFehler(e.message); }
  };

  const erzeugen = async () => {
    if (!b64) return;
    setLaedt(true); setFehler(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST", headers: kiKopf(),
        body: JSON.stringify({
          model: "claude-sonnet-5-5", max_tokens: 1200,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
            { type: "text", text: `Auf dem Foto steht eine Mathematikaufgabe aus einem Schulbuch oder von einem Arbeitsblatt.

Antworte nur mit JSON, ohne Vorrede:
{"typ":"kurze Bezeichnung des Aufgabentyps, z.B. Ableitung mit Produktregel","erkannt":"die Aufgabe, wie du sie liest","hinweis":"ein Satz, worauf es bei diesem Aufgabentyp ankommt","aufgaben":[{"text":"neue Übungsaufgabe im selben Format","loesung":"die Lösung"},{"text":"...","loesung":"..."},{"text":"...","loesung":"..."}]}

Die drei neuen Aufgaben sollen denselben Typ und dasselbe Niveau haben, aber andere Zahlen. Formeln in den Texten in LaTeX zwischen Dollarzeichen.` },
          ] }],
        }),
      });
      const daten = await kiAntwort(res);
      if (daten.error) throw new Error(`Die API hat abgelehnt: ${daten.error.message}`);
      const text = (daten.content || []).map((t) => (t.type === "text" ? t.text : "")).join("");
      setErg(jsonLesen(text));
    } catch (e) {
      setFehler(e.message || "Die Aufgabe konnte nicht gelesen werden.");
    } finally { setLaedt(false); }
  };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 20 }}>
        Fotografiere eine Aufgabe aus deinem Buch oder vom Arbeitsblatt. Mathilda erkennt den Typ und erzeugt
        drei weitere derselben Sorte — damit du genau das übst, was gerade dran ist.
      </p>

      {!bild && (
        <div>
          <button onClick={() => kameraRef.current?.click()} className="w-full px-6 py-7"
            style={{ background: C.gruenDunkel, border: "none", borderRadius: 16, textAlign: "left", cursor: "pointer", color: C.weiss, fontFamily: "inherit" }}>
            <span style={{ fontSize: 17, fontWeight: 600 }}>Aufgabe fotografieren</span>
            <span className="block mt-2" style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.6, opacity: 0.9 }}>
              Eine einzelne Aufgabe, gut ausgeleuchtet.
            </span>
          </button>
          <button onClick={() => galerieRef.current?.click()} className="w-full px-6 py-7 mt-3"
            style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, textAlign: "left", cursor: "pointer", color: C.tinte, fontFamily: "inherit" }}>
            <span style={{ fontSize: 17, fontWeight: 600 }}>Aus der Galerie wählen</span>
          </button>
        </div>
      )}

      <input ref={kameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => waehlen(e.target.files?.[0])} />
      <input ref={galerieRef} type="file" accept="image/*,.heic,.heif" className="hidden"
        onChange={(e) => waehlen(e.target.files?.[0])} />

      {bild && (
        <>
          <img src={bild} alt="Aufgabe" style={{ width: "100%", borderRadius: 16, border: `2px solid ${C.see}` }} />
          <div className="flex flex-wrap gap-3 mt-4">
            {!erg && (
              <button onClick={erzeugen} disabled={laedt} className="px-6 py-3"
                style={{ background: laedt ? C.hellgrau : C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: laedt ? "wait" : "pointer" }}>
                {laedt ? "Mathilda liest…" : "Ähnliche Aufgaben erzeugen"}
              </button>
            )}
            <button onClick={() => { setBild(null); setB64(null); setErg(null); setFehler(null); }} className="px-6 py-3"
              style={{ background: "transparent", color: C.grau, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
              Andere Aufgabe
            </button>
          </div>
        </>
      )}

      {fehler && (
        <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginTop: 18 }}>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>{fehler}</p>
        </div>
      )}

      {erg && (
        <div className="mt-6">
          <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Aufgabentyp</p>
            <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{erg.typ}</p>
            {erg.erkannt && <Text s={erg.erkannt} style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.75 }} />}
            {erg.hinweis && (
              <div style={{ borderLeft: `3px solid ${C.gruen}`, paddingLeft: 14, marginTop: 12 }}>
                <Text s={erg.hinweis} style={{ fontSize: 14.5, lineHeight: 1.75 }} />
              </div>
            )}
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>
            Drei Aufgaben derselben Sorte
          </p>
          {(erg.aufgaben || []).map((a, i) => (
            <div key={i} style={{ background: C.weiss, borderRadius: 16, padding: 18, marginBottom: 10, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
              <div className="flex" style={{ gap: 10 }}>
                <span style={{ color: C.gruenDunkel, fontWeight: 700, fontSize: 13, width: 16, flexShrink: 0 }}>{i + 1}</span>
                <Text s={a.text} style={{ fontSize: 15.5, lineHeight: 1.8, margin: 0, flex: 1 }} />
              </div>
              {offen[i] ? (
                <div style={{ borderLeft: `3px solid ${C.see}`, paddingLeft: 14, marginTop: 12, marginLeft: 26 }}>
                  <Text s={a.loesung} style={{ fontSize: 14.5, lineHeight: 1.8, color: C.see }} />
                </div>
              ) : (
                <button onClick={() => setOffen({ ...offen, [i]: true })} className="mt-3"
                  style={{ marginLeft: 26, background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                  Lösung zeigen
                </button>
              )}
            </div>
          ))}
          <p style={{ color: C.hellgrau, fontSize: 12.5, fontWeight: 300, lineHeight: 1.7, marginTop: 12 }}>
            Diese Aufgaben hat Mathilda erzeugt. Rechne sie auf Papier und prüfe die Lösung anschließend selbst nach.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- Formelsammlung ---------- */


export function Formelsammlung({ zuHerleitung }) {
  const [suche, setSuche] = useState("");
  const [offen, setOffen] = useState(null);

  const s = suche.trim().toLowerCase();
  const treffer = FORMELN.filter((e) =>
    !s || e.name.toLowerCase().includes(s) || e.kurz.toLowerCase().includes(s) ||
    e.gruppe.toLowerCase().includes(s) || e.f.toLowerCase().includes(s));

  const gruppen = [...new Set(treffer.map((e) => e.gruppe))];

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <input value={suche} onChange={(e) => setSuche(e.target.value)}
        placeholder="Suchen: Produktregel, sin, Wendepunkt …"
        style={{ width: "100%", padding: "13px 16px", fontSize: 15.5, fontFamily: "inherit",
          border: `1px solid ${C.linie}`, borderRadius: 14, outline: "none", background: C.weiss,
          color: C.tinte, boxSizing: "border-box", marginBottom: 20 }} />

      {treffer.length === 0 && (
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7 }}>
          Dazu ist nichts hinterlegt. Versuch einen kürzeren Suchbegriff.
        </p>
      )}

      {gruppen.map((g) => (
        <div key={g} style={{ marginBottom: 26 }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>{g}</p>
          {treffer.filter((e) => e.gruppe === g).map((e) => {
            const auf = offen === e.name;
            return (
              <div key={e.name} onClick={() => setOffen(auf ? null : e.name)}
                style={{ background: C.weiss, borderRadius: 14, padding: "15px 17px", marginBottom: 9,
                  boxShadow: "0 2px 12px rgba(15,26,51,0.06)", cursor: "pointer" }}>
                <p style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 8 }}>{e.name}</p>
                <div style={{ fontSize: 16.5, lineHeight: 2, color: C.tinte, overflowX: "auto" }}>
                  <M t={e.f} />
                </div>
                {auf && (
                  <>
                    <p style={{ color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.7, marginTop: 10 }}>
                      {e.kurz}
                    </p>
                    {e.kap ? (
                      <button onClick={(ev) => { ev.stopPropagation(); zuHerleitung(e.kap); }} className="mt-3"
                        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                        Zur Herleitung · Kapitel {e.kap}
                      </button>
                    ) : (
                      <p style={{ color: C.hellgrau, fontSize: 12.5, fontWeight: 300, marginTop: 8 }}>
                        Herleitung folgt in einem späteren Modul.
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ---------- Gemeinsamer Aufgabenerzeuger für kubische Funktionen ---------- */

/* Konstruiert wird rückwärts: erst die beiden Extremstellen, daraus die
   Koeffizienten. So sind Extrem- und Wendestelle garantiert ganzzahlig und
   mindestens eine Nullstelle ist ablesbar. */

export function kubischErzeugen() {
  const a = Math.random() < 0.5 ? 1 : -1;
  const p = ganz(-3, 1);
  const q = p + zuf([2, 2, 4]);
  const b = (-3 * a * (p + q)) / 2;
  const c = 3 * a * p * q;
  const r = ganz(-3, 3);
  const d = -(a * r ** 3 + b * r ** 2 + c * r);
  const f = (x) => a * x ** 3 + b * x ** 2 + c * x + d;
  return {
    a, b, c, d, f, r,
    hoch: a > 0 ? p : q,
    tief: a > 0 ? q : p,
    klein: p, gross: q,
    wende: (p + q) / 2,
    fs: `${3 * a}x^2+${2 * b}x+${c}`,
    fss: `${6 * a}x+${2 * b}`,
    fsss: `${6 * a}`,
  };
}


export function MiniGraph({ fn, hoehe = 112, breite = 150, markieren = [] }) {
  const R = 4.6;
  const proben = [];
  for (let x = -R; x <= R; x += 0.08) { const y = fn(x); if (isFinite(y)) proben.push(Math.abs(y)); }
  proben.sort((a, b) => a - b);
  const oben = proben.length ? proben[Math.floor(proben.length * 0.92)] : 4;
  const yR = Math.min(Math.max(oben * 1.15, 2), 40);
  const px = (x) => breite / 2 + (x * (breite / 2 - 6)) / R;
  const py = (y) => hoehe / 2 - (y * (hoehe / 2 - 6)) / yR;
  let pfad = "", offen = false;
  for (let i = 0; i <= 240; i++) {
    const x = -R + (i * 2 * R) / 240;
    const y = fn(x);
    if (!isFinite(y) || Math.abs(y) > yR * 1.3 || Math.abs(x) < 0.04) { offen = false; continue; }
    pfad += `${offen ? "L" : "M"} ${px(x).toFixed(1)} ${py(y).toFixed(1)} `;
    offen = true;
  }
  return (
    <svg viewBox={`0 0 ${breite} ${hoehe}`} style={{ width: "100%", display: "block" }}>
      <line x1="0" y1={py(0)} x2={breite} y2={py(0)} stroke={C.linie} strokeWidth="1.2" />
      <line x1={px(0)} y1="0" x2={px(0)} y2={hoehe} stroke={C.linie} strokeWidth="1.2" />
      <path d={pfad} stroke={C.see} strokeWidth="2" fill="none" />
      {markieren.map((m, i) => (
        <circle key={i} cx={px(m.x)} cy={py(m.y)} r="3.4" fill={m.farbe || C.gruenDunkel} />
      ))}
    </svg>
  );
}

/* ---------- Kurvendiskussion · das Protokoll ---------- */


export function Kurvendiskussion({ onZurueck }) {
  const [auf, setAuf] = useState(() => kubischErzeugen());
  const [schritt, setSchritt] = useState(0);
  const [eingabe, setEingabe] = useState({});
  const [stand, setStand] = useState(null);
  const [erledigt, setErledigt] = useState([]);

  const { a, b, c, d, f } = auf;
  const punktsym = b === 0 && d === 0;

  const schritte = [
    {
      titel: "Definitionsbereich",
      frage: "Welchen Definitionsbereich hat eine ganzrationale Funktion?",
      typ: "wahl",
      optionen: ["ℝ", "ℝ ohne die Null", "nur x > 0", "nur x ≥ 0"],
      richtig: 0,
      warum: "Ganzrationale Funktionen bestehen nur aus Potenzen, Vielfachen und Summen. Nirgends wird dividiert oder gewurzelt, also gibt es keine verbotenen Stellen.",
    },
    {
      titel: "Symmetrie",
      frage: "Prüfe f(−x). Welche Symmetrie liegt vor?",
      typ: "wahl",
      optionen: ["keine der beiden", "achsensymmetrisch zur y-Achse", "punktsymmetrisch zum Ursprung"],
      richtig: punktsym ? 2 : 0,
      warum: punktsym
        ? "Es kommen nur ungerade Exponenten vor, also gilt f(−x) = −f(x)."
        : "Es treten gerade und ungerade Exponenten gemischt auf. Dann ist f(−x) weder f(x) noch −f(x).",
    },
    {
      titel: "Achsenschnittpunkte",
      frage: "Wie lautet der y-Achsenabschnitt, also f(0)?",
      typ: "zahl",
      richtig: d,
      warum: `Einsetzen von 0 lässt alle Terme mit x verschwinden. Übrig bleibt das absolute Glied ${d}.`,
    },
    {
      titel: "Achsenschnittpunkte",
      frage: "Gib eine Nullstelle an. Eine davon ist ganzzahlig.",
      typ: "nullstelle",
      warum: "Ganzzahlige Nullstellen findet man unter den Teilern des absoluten Glieds. Danach führt Polynomdivision zu den übrigen.",
    },
    {
      titel: "Grenzverhalten",
      frage: "Wie verhält sich der Graph für x → ±∞?",
      typ: "wahl",
      optionen: ["von links unten nach rechts oben", "von links oben nach rechts unten",
                 "beide Äste nach oben", "beide Äste nach unten"],
      richtig: a > 0 ? 0 : 1,
      warum: `Nur der höchste Grad entscheidet, hier ${a > 0 ? "+" : "−"}x³. Ungerader Grad bedeutet gegenläufige Äste, das Vorzeichen legt die Richtung fest.`,
    },
    {
      titel: "Ableitungen",
      frage: "Bestimme f′(x).",
      typ: "term",
      richtig: auf.fs,
      warum: "Gliedweise mit Potenz- und Faktorregel. Das absolute Glied fällt weg.",
    },
    {
      titel: "Ableitungen",
      frage: "Bestimme f″(x).",
      typ: "term",
      richtig: auf.fss,
      warum: "Noch einmal dieselben Regeln, angewendet auf f′. Der Grad sinkt wieder um eins.",
    },
    {
      titel: "Extrempunkte",
      frage: "Löse f′(x) = 0. Gib die kleinere der beiden Stellen an.",
      typ: "zahl",
      richtig: auf.klein,
      warum: "Die Nullstellen von f′ sind die Kandidaten für Extremstellen — notwendige Bedingung, noch keine Entscheidung.",
    },
    {
      titel: "Extrempunkte",
      frage: `Welche Art hat die Stelle x = ${auf.klein}? Prüfe mit f″.`,
      typ: "wahl",
      optionen: ["Hochpunkt", "Tiefpunkt", "Sattelpunkt"],
      richtig: auf.hoch === auf.klein ? 0 : 1,
      warum: `f″(${auf.klein}) = ${6 * a * auf.klein + 2 * b}. ${auf.hoch === auf.klein ? "Negativ bedeutet Hochpunkt." : "Positiv bedeutet Tiefpunkt."}`,
    },
    {
      titel: "Monotonie",
      frage: `Wie verhält sich f zwischen x = ${auf.klein} und x = ${auf.gross}?`,
      typ: "wahl",
      optionen: ["streng monoton steigend", "streng monoton fallend", "konstant"],
      richtig: a > 0 ? 1 : 0,
      warum: "Zwischen den beiden Extremstellen hat f′ das umgekehrte Vorzeichen wie außerhalb.",
    },
    {
      titel: "Wendepunkt",
      frage: "Löse f″(x) = 0. An welcher Stelle liegt der Wendepunkt?",
      typ: "zahl",
      richtig: auf.wende,
      warum: `f‴(x) = ${6 * a} ist nie null, also ist die Stelle bestätigt. Sie liegt stets genau mittig zwischen den beiden Extremstellen.`,
    },
    {
      titel: "Krümmung",
      frage: `Wie ist der Graph links von x = ${auf.wende} gekrümmt?`,
      typ: "wahl",
      optionen: ["linksgekrümmt", "rechtsgekrümmt"],
      richtig: a > 0 ? 1 : 0,
      warum: `Links der Wendestelle hat f″ das Vorzeichen ${a > 0 ? "minus" : "plus"} — also ${a > 0 ? "rechts" : "links"}gekrümmt. Rechts davon kehrt es sich um.`,
    },
  ];

  const s = schritte[schritt];
  const fertig = schritt >= schritte.length;

  const pruefen = () => {
    const wert = eingabe[schritt];
    let ok = false;
    if (s.typ === "wahl") ok = wert === s.richtig;
    else if (s.typ === "zahl") ok = parseZahl(wert) !== null && Math.abs(parseZahl(wert) - s.richtig) < 1e-6;
    else if (s.typ === "nullstelle") {
      const v = parseZahl(wert);
      ok = v !== null && Math.abs(f(v)) < 1e-6;
    } else if (s.typ === "term") {
      const meins = alsFunktion(wert);
      const soll = alsFunktion(s.richtig);
      ok = !!meins && !!soll && stimmtUeberein(meins, soll);
    }
    setStand(ok ? "ok" : "nein");
    if (ok) setErledigt([...erledigt, schritt]);
  };

  const weiter = () => { setStand(null); setSchritt(schritt + 1); };
  const neueFunktion = () => { setAuf(kubischErzeugen()); setSchritt(0); setEingabe({}); setStand(null); setErledigt([]); };

  const marken = [
    { x: auf.hoch, y: f(auf.hoch), farbe: C.gruenDunkel },
    { x: auf.tief, y: f(auf.tief), farbe: C.gruenDunkel },
    { x: auf.wende, y: f(auf.wende), farbe: C.tinte },
  ];

  return (
    <div>
      <button onClick={onZurueck} className="mb-5"
        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        ← Trainingsbereich
      </button>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Das Protokoll, Schritt für Schritt
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 20 }}>
        Jede Funktion wird neu erzeugt, und jeder Schritt wird einzeln geprüft. Rechne auf Papier,
        trage hier nur das Ergebnis ein.
      </p>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 16 }}>
        <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginBottom: 6 }}>Untersuche vollständig</p>
        <div style={{ fontSize: 19, lineHeight: 1.9 }}>f(x) = <M t={termText(a, b, c, d).replace(/x²/g, "x^2").replace(/x³/g, "x^3")} /></div>
      </div>

      {!fertig ? (
        <>
          <div className="flex justify-between items-baseline mb-2">
            <span style={{ fontSize: 13, fontWeight: 600, color: C.see }}>{s.titel}</span>
            <span style={{ fontSize: 12, color: C.hellgrau }}>Schritt {schritt + 1} von {schritte.length}</span>
          </div>
          <div style={{ height: 5, background: C.himmel, borderRadius: 999, marginBottom: 18 }}>
            <div style={{ height: 5, borderRadius: 999, background: C.see, width: `${(schritt / schritte.length) * 100}%` }} />
          </div>

          <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
            <Text s={s.frage} style={{ fontSize: 16.5, lineHeight: 1.8, marginBottom: 16 }} />

            {s.typ === "wahl" ? (
              s.optionen.map((o, k) => {
                const gewaehlt = eingabe[schritt] === k;
                const zeigen = stand !== null;
                let rand = C.linie, schrift = C.tinte, hg = C.weiss;
                if (zeigen && k === s.richtig) { rand = C.gruenDunkel; hg = C.himmel; schrift = C.gruenDunkel; }
                else if (zeigen && gewaehlt) { rand = C.signal; schrift = C.signal; }
                else if (gewaehlt) { rand = C.see; }
                return (
                  <button key={k} onClick={() => { if (stand === null) { setEingabe({ ...eingabe, [schritt]: k }); } }}
                    className="w-full px-5 py-3 mb-2"
                    style={{ background: hg, border: `1.5px solid ${rand}`, borderRadius: 12, textAlign: "left",
                      cursor: stand === null ? "pointer" : "default", fontFamily: "inherit", color: schrift, fontSize: 15 }}>
                    {o}
                  </button>
                );
              })
            ) : (
              <div className="flex items-center" style={{ gap: 8 }}>
                <span style={{ fontSize: 16, color: C.grau }}>{s.typ === "term" ? "=" : "Antwort:"}</span>
                <input value={eingabe[schritt] || ""} onChange={(e) => { setEingabe({ ...eingabe, [schritt]: e.target.value }); setStand(null); }}
                  placeholder={s.typ === "term" ? "z. B. 3x^2-6x" : "Zahl"}
                  style={{ flex: 1, padding: "10px 12px", fontSize: 16, fontFamily: "inherit",
                    border: `1.5px solid ${stand === "ok" ? C.see : stand === "nein" ? C.signal : C.linie}`,
                    borderRadius: 12, outline: "none", background: stand === "ok" ? C.himmel : C.weiss, color: C.tinte }} />
              </div>
            )}

            {stand === null ? (
              <button onClick={pruefen} disabled={eingabe[schritt] === undefined || eingabe[schritt] === ""}
                className="px-6 py-3 mt-4"
                style={{ background: eingabe[schritt] === undefined || eingabe[schritt] === "" ? C.hellgrau : C.gruenDunkel,
                  color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit",
                  cursor: "pointer" }}>
                Prüfen
              </button>
            ) : (
              <div style={{ borderLeft: `4px solid ${stand === "ok" ? C.see : C.signal}`, paddingLeft: 16, marginTop: 16 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: stand === "ok" ? C.see : C.signal, marginBottom: 6 }}>
                  {stand === "ok" ? "Stimmt." : "Noch nicht."}
                </p>
                <Text s={s.warum} style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.75 }} />
                <button onClick={weiter} className="px-6 py-3 mt-4"
                  style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                  {schritt + 1 < schritte.length ? "Nächster Schritt" : "Zum Graphen"}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 4 }}>Schritt 13 · Der Graph</p>
          <p style={{ color: C.grau, fontSize: 14, fontWeight: 300, lineHeight: 1.7, marginBottom: 12 }}>
            Der Graph entsteht aus den berechneten Punkten — nicht umgekehrt.
          </p>
          <div style={{ maxWidth: 330, margin: "0 auto" }}>
            <MiniGraph fn={f} hoehe={210} breite={300} markieren={marken} />
          </div>
          <div style={{ marginTop: 14 }}>
            {[["Hochpunkt", auf.hoch], ["Tiefpunkt", auf.tief], ["Wendepunkt", auf.wende]].map(([n, x]) => (
              <div key={n} className="flex justify-between" style={{ fontSize: 14, marginBottom: 7 }}>
                <span style={{ color: C.grau, fontWeight: 300 }}>{n}</span>
                <span style={{ fontWeight: 500 }}>({zahl(x)} | {zahl(f(x))})</span>
              </div>
            ))}
            <div className="flex justify-between" style={{ fontSize: 14, marginBottom: 7 }}>
              <span style={{ color: C.grau, fontWeight: 300 }}>Richtig beantwortet</span>
              <span style={{ fontWeight: 500 }}>{erledigt.length} von {schritte.length}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-5">
        <button onClick={neueFunktion} className="px-6 py-3"
          style={{ background: fertig ? C.gruenDunkel : C.weiss, color: fertig ? C.weiss : C.see,
            border: fertig ? "none" : `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15,
            fontWeight: fertig ? 600 : 400, fontFamily: "inherit", cursor: "pointer" }}>
          Neue Funktion
        </button>
      </div>
    </div>
  );
}

/* ---------- Graph-Zuordnung ---------- */

/* Sechs Funktionsfamilien, damit nicht immer derselbe Kurventyp kommt.
   Jede liefert f, f′ und f″ analytisch — die Ablenker entstehen daraus. */

export function GraphZuordnung({ onZurueck }) {
  const [richtung, setRichtung] = useState("ableitung");
  const [tempo, setTempo] = useState("langsam");
  const [runde, setRunde] = useState(0);
  const [gewaehlt, setGewaehlt] = useState(null);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });

  const fam = React.useMemo(() => zuf(GZ_FAMILIEN).mach(), [runde]);
  const { f, fs, fss, wozu, grad } = fam;

  const gradText = grad === 0 ? "" : `Grad ${grad}`;

  const karten = React.useMemo(() => {
    const zuWenig = {
      fn: fss, richtig: false,
      warum: grad >= 2
        ? `Das ist f″, also eine Ableitung zu weit. Beim Ableiten sinkt der Grad um genau eins: aus ${gradText} wird Grad ${grad - 1}, nicht Grad ${Math.max(grad - 2, 0)}.`
        : "Das ist f″, also eine Ableitung zu weit — hier bereits die zweite.",
    };
    const konstant = { fn: (x) => fs(x) + 2, richtig: false,
      warum: "Die Form stimmt, die Höhe nicht. Eine Gerade mit Steigung m hat als Ableitung genau die Konstante m — nicht irgendeine andere." };

    if (richtung === "ableitung") {
      const liste = [
        { fn: fs, richtig: true, warum: `Richtig. ${wozu}` },
        grad <= 1 ? konstant : zuWenig,
        { fn: (x) => -fs(x), richtig: false,
          warum: "Das ist −f′, die Vorzeichen sind gedreht. Prüfe an einer Stelle, wo f steigt: dort muss die Ableitung positiv sein, nicht negativ." },
        { fn: f, richtig: false,
          warum: grad >= 1
            ? `Das ist f selbst. Der Grad muss beim Ableiten um eins sinken — hier ist er gleich geblieben.`
            : "Das ist f selbst, nicht die Ableitung." },
      ];
      return liste.map((k, i) => ({ ...k, mix: Math.random(), nr: i }))
        .sort((x, y) => x.mix - y.mix);
    }

    const liste = [
      { fn: f, richtig: true, warum: `Richtig. ${wozu}` },
      { fn: (x) => -f(x), richtig: false,
        warum: "Hier sind alle Vorzeichen gespiegelt. Die Stellen mit waagerechter Tangente stimmen zwar, aber steigend und fallend sind vertauscht." },
      { fn: fs, richtig: false,
        warum: "Das ist die gegebene Funktion selbst, nicht ihre Stammfunktion. Gesucht ist die Kurve, deren Steigungen oben abgebildet sind." },
      { fn: fss, richtig: false,
        warum: "Das ist die Ableitung der gegebenen Funktion — du bist in die falsche Richtung gegangen." },
    ];
    return liste.map((k, i) => ({ ...k, mix: Math.random(), nr: i })).sort((x, y) => x.mix - y.mix);
  }, [runde, richtung]);

  const gezeigt = richtung === "ableitung" ? f : fs;
  const buchstaben = ["A", "B", "C", "D"];

  const waehlen = (i) => {
    if (gewaehlt !== null) return;
    setGewaehlt(i);
    const ok = karten[i].richtig;
    setSerie((s) => ({ n: s.n + 1, ok: s.ok + (ok ? 1 : 0) }));
    merken({ bereich: "graph", gruppe: "Graph-Zuordnung", richtig: ok, fehlerart: ok ? null : "tiefe" });
    if (tempo === "schnell") {
      setTimeout(() => { setRunde((r) => r + 1); setGewaehlt(null); }, ok ? 900 : 1900);
    }
  };

  const richtigeKarte = karten.findIndex((k) => k.richtig);

  return (
    <div>
      <button onClick={onZurueck} className="mb-5"
        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        ← Trainingsbereich
      </button>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Sehen statt rechnen
      </h2>
      <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, marginBottom: 16 }}>
        Kein Taschenrechner. Achte auf Grad, Vorzeichen und darauf, wo der Graph waagerechte Tangenten hat.
      </p>

      <div className="flex gap-2 mb-2">
        {[["ableitung", "Finde f′"], ["stamm", "Finde f"]].map(([id, t]) => (
          <button key={id} onClick={() => { setRichtung(id); setGewaehlt(null); setRunde((r) => r + 1); }} className="px-4 py-2"
            style={{ flex: 1, background: richtung === id ? C.see : C.weiss, color: richtung === id ? C.weiss : C.grau,
              border: `1px solid ${richtung === id ? C.see : C.linie}`, borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-5">
        {[["schnell", "Schnell"], ["langsam", "Ausführlich"]].map(([id, t]) => (
          <button key={id} onClick={() => setTempo(id)} className="px-4 py-2"
            style={{ flex: 1, background: tempo === id ? C.gruenDunkel : C.weiss, color: tempo === id ? C.weiss : C.grau,
              border: `1px solid ${tempo === id ? C.gruenDunkel : C.linie}`, borderRadius: 999, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 12, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 12 }}>
        <div className="flex justify-between items-baseline" style={{ marginBottom: 2 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: C.see }}>
            {richtung === "ableitung" ? "Gegeben ist f" : "Gegeben ist f′"}
          </span>
          {serie.n > 0 && <span style={{ fontSize: 12, color: C.hellgrau }}>{serie.ok} von {serie.n}</span>}
        </div>
        <div style={{ maxWidth: 230, margin: "0 auto" }}>
          <MiniGraph fn={gezeigt} hoehe={104} breite={220} />
        </div>
      </div>

      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>
        {richtung === "ableitung" ? "Welcher Graph zeigt f′?" : "Welcher Graph zeigt f?"}
      </p>

      <div className="flex flex-wrap" style={{ gap: 8 }}>
        {karten.map((k, i) => {
          const zeigen = gewaehlt !== null;
          const dieser = gewaehlt === i;
          let rand = C.linie;
          if (zeigen && k.richtig) rand = C.gruenDunkel;
          else if (zeigen && dieser) rand = C.signal;
          return (
            <button key={i} onClick={() => waehlen(i)}
              style={{ flex: "1 1 46%", background: C.weiss, border: `2px solid ${rand}`, borderRadius: 14,
                padding: 6, cursor: gewaehlt === null ? "pointer" : "default", fontFamily: "inherit" }}>
              <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, textAlign: "left",
                color: rand === C.linie ? C.hellgrau : rand, marginBottom: 1 }}>
                {buchstaben[i]}
              </span>
              <MiniGraph fn={k.fn} hoehe={80} breite={120} />
            </button>
          );
        })}
      </div>

      {gewaehlt !== null && (
        <div style={{ borderLeft: `4px solid ${karten[gewaehlt].richtig ? C.see : C.signal}`,
          paddingLeft: 16, marginTop: 14 }}>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4,
            color: karten[gewaehlt].richtig ? C.see : C.signal }}>
            {karten[gewaehlt].richtig ? "Stimmt." : `Stimmt nicht — richtig wäre ${buchstaben[richtigeKarte]}.`}
          </p>
          {tempo === "langsam" ? (
            <>
              <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>
                {karten[gewaehlt].warum}
              </p>
              {!karten[gewaehlt].richtig && (
                <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.75, marginTop: 8 }}>
                  {karten[richtigeKarte].warum.replace(/^Richtig\. /, "")}
                </p>
              )}
            </>
          ) : (
            <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>
              Nächste Aufgabe kommt gleich…
            </p>
          )}
        </div>
      )}

      {tempo === "langsam" && (
        <button onClick={() => { setRunde(runde + 1); setGewaehlt(null); }} className="px-6 py-3 mt-5"
          style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Neue Runde
        </button>
      )}
    </div>
  );
}

/* ---------- Klausurgenerator ---------- */

/* Erzeugt eine vollständige Klausur im Abiturformat. Während der Bearbeitung
   gibt es bewusst keine Rückmeldung — erst nach der Abgabe. */


export function klausurErzeugen() {
  // Aufgabe A · Kurvendiskussion
  const A = kubischErzeugen();

  // Aufgabe B · Steckbrief, punktsymmetrisch mit Hochpunkt bei x = -1
  const k = zuf([2, 4, 6]);
  const ba = k / 2, bb = (-3 * k) / 2;

  // Aufgabe C · Gewinnfunktion mit G′(x) = -3(x-u)(x-v)
  const u = zuf([2, 3, 4]);
  const v = u + zuf([2, 4]);
  const c2 = (3 * (u + v)) / 2, c1 = 3 * u * v;

  const teile = [
    { gruppe: "A", kopf: `Gegeben ist die Funktion f mit f(x) = ${termText(A.a, A.b, A.c, A.d).replace(/x²/g, "x^2").replace(/x³/g, "x^3")}.`,
      punkte: [
        { frage: "a) Bestimme f′(x).", typ: "term", loesung: A.fs, p: 2 },
        { frage: "b) Gib die kleinere Extremstelle an.", typ: "zahl", loesung: A.klein, p: 2 },
        { frage: "c) Gib die größere Extremstelle an.", typ: "zahl", loesung: A.gross, p: 2 },
        { frage: "d) An welcher Stelle liegt der Wendepunkt?", typ: "zahl", loesung: A.wende, p: 2 },
        { frage: "e) Wie lautet der y-Achsenabschnitt?", typ: "zahl", loesung: A.d, p: 1 },
      ] },
    { gruppe: "B", kopf: `Eine ganzrationale Funktion dritten Grades ist punktsymmetrisch zum Ursprung und hat bei H(−1 | ${k}) einen Hochpunkt.`,
      punkte: [
        { frage: "a) Bestimme f(x).", typ: "term", loesung: `${ba}x^3${bb < 0 ? "" : "+"}${bb}x`, p: 4 },
        { frage: "b) Gib die positive Nullstelle an.", typ: "zahl", loesung: Math.sqrt(-bb / ba), p: 2 },
      ] },
    { gruppe: "C", kopf: `Der Gewinn eines Unternehmens (in 1000 €) bei x produzierten Einheiten wird beschrieben durch G(x) = −x³ + ${c2}x² − ${c1}x, mit x aus [0 ; ${v + 3}].`,
      punkte: [
        { frage: "a) Bestimme G′(x).", typ: "term", loesung: `-3x^2+${2 * c2}x-${c1}`, p: 2 },
        { frage: "b) Bei welcher Produktionsmenge ist der Gewinn maximal?", typ: "zahl", loesung: v, p: 3 },
        { frage: "c) Bei welcher Menge wächst der Gewinn am stärksten?", typ: "zahl", loesung: (u + v) / 2, p: 2 },
      ] },
  ];
  return { teile, gesamt: teile.reduce((s, t) => s + t.punkte.reduce((x, p) => x + p.p, 0), 0) };
}


export function Klausur({ onZurueck }) {
  const [dauer, setDauer] = useState(45);
  const [laeuft, setLaeuft] = useState(false);
  const [rest, setRest] = useState(45 * 60);
  const [klausur, setKlausur] = useState(null);
  const [antworten, setAntworten] = useState({});
  const [abgegeben, setAbgegeben] = useState(false);
  const [wegOffen, setWegOffen] = useState(false);

  React.useEffect(() => {
    if (!laeuft || abgegeben) return;
    const t = setInterval(() => {
      setRest((r) => {
        if (r <= 1) { setAbgegeben(true); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [laeuft, abgegeben]);

  const starten = () => {
    setKlausur(klausurErzeugen());
    setAntworten({}); setAbgegeben(false);
    setRest(dauer * 60); setLaeuft(true);
  };

  const uhr = `${String(Math.floor(rest / 60)).padStart(2, "0")}:${String(rest % 60).padStart(2, "0")}`;

  const bewerten = (p, wert) => {
    if (wert === undefined || String(wert).trim() === "") return false;
    if (p.typ === "zahl") {
      const v = parseZahl(wert);
      return v !== null && Math.abs(v - p.loesung) < 1e-4;
    }
    const meins = alsFunktion(wert), soll = alsFunktion(String(p.loesung));
    return !!meins && !!soll && stimmtUeberein(meins, soll, 1e-5);
  };

  let erreicht = 0;
  if (klausur && abgegeben) {
    klausur.teile.forEach((t, ti) =>
      t.punkte.forEach((p, pi) => { if (bewerten(p, antworten[`${ti}-${pi}`])) erreicht += p.p; }));
  }
  const prozent = klausur ? Math.round((erreicht / klausur.gesamt) * 100) : 0;
  const note = prozent >= 85 ? "sehr gut" : prozent >= 70 ? "gut" : prozent >= 55 ? "befriedigend"
    : prozent >= 40 ? "ausreichend" : "noch nicht ausreichend";

  return (
    <div>
      <button onClick={onZurueck} className="mb-5"
        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        ← Trainingsbereich
      </button>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Drei Aufgaben, eine Uhr
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 20 }}>
        Während der Bearbeitung gibt es keine Rückmeldung — genau wie in der echten Klausur.
        Gerechnet wird auf Papier, hier stehen nur die Ergebnisse.
      </p>

      {!klausur && (
        <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
          <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 12 }}>Bearbeitungszeit wählen</p>
          <div className="flex gap-2 mb-5">
            {[25, 45, 65].map((m) => (
              <button key={m} onClick={() => setDauer(m)} className="px-4 py-2"
                style={{ flex: 1, background: dauer === m ? C.see : C.weiss, color: dauer === m ? C.weiss : C.grau,
                  border: `1px solid ${dauer === m ? C.see : C.linie}`, borderRadius: 999, fontSize: 14.5, fontFamily: "inherit", cursor: "pointer" }}>
                {m} min
              </button>
            ))}
          </div>
          <button onClick={starten} className="w-full px-6 py-4"
            style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Klausur starten
          </button>
          <p style={{ color: C.hellgrau, fontSize: 12.5, fontWeight: 300, lineHeight: 1.6, marginTop: 12 }}>
            Die Aufgaben werden neu erzeugt. Leg Papier und Stift bereit, bevor du startest — die Uhr läuft ab dem Tippen.
          </p>
        </div>
      )}

      {klausur && wegOffen && (
        <LoesungsWeg aufgabeText={klausur.teile[0].kopf}
          onSchliessen={() => setWegOffen(false)} />
      )}

      {klausur && (
        <>
          <div className="flex justify-between items-center" style={{ background: abgegeben ? C.weiss : C.seeTief,
            borderRadius: 14, padding: "12px 18px", marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: abgegeben ? C.grau : "#C9D6EE", fontWeight: 300 }}>
              {abgegeben ? "Bearbeitung beendet" : "verbleibende Zeit"}
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: abgegeben ? C.tinte : (rest < 300 ? C.gruen : C.weiss), letterSpacing: "0.02em" }}>
              {uhr}
            </span>
          </div>

          {klausur.teile.map((t, ti) => (
            <div key={ti} style={{ background: C.weiss, borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 8 }}>
                Aufgabe {t.gruppe} · {t.punkte.reduce((s, p) => s + p.p, 0)} Punkte
              </p>
              <Text s={t.kopf} style={{ fontSize: 15.5, lineHeight: 1.75, marginBottom: 16 }} />

              {t.punkte.map((p, pi) => {
                const schluessel = `${ti}-${pi}`;
                const ok = abgegeben && bewerten(p, antworten[schluessel]);
                return (
                  <div key={pi} style={{ marginBottom: 14 }}>
                    <Text s={p.frage} style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 6 }} />
                    <div className="flex items-center" style={{ gap: 8 }}>
                      <input value={antworten[schluessel] || ""} disabled={abgegeben}
                        onChange={(e) => setAntworten({ ...antworten, [schluessel]: e.target.value })}
                        placeholder="Ergebnis"
                        style={{ flex: 1, padding: "9px 12px", fontSize: 15.5, fontFamily: "inherit",
                          border: `1.5px solid ${abgegeben ? (ok ? C.see : C.signal) : C.linie}`,
                          borderRadius: 11, outline: "none",
                          background: abgegeben && ok ? C.himmel : C.weiss, color: C.tinte }} />
                      {abgegeben && (
                        <span style={{ fontSize: 13, color: ok ? C.see : C.signal, width: 34, textAlign: "right" }}>
                          {ok ? `${p.p}/${p.p}` : `0/${p.p}`}
                        </span>
                      )}
                    </div>
                    {abgegeben && !ok && (
                      <p style={{ fontSize: 13.5, color: C.see, marginTop: 6 }}>
                        Lösung: <M t={String(p.loesung)} />
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {!abgegeben ? (
            <>
              <button onClick={() => setWegOffen(true)} className="w-full px-6 py-4 mb-3"
                style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999,
                  fontSize: 15.5, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
                Lösungsweg schreiben
              </button>
              <button onClick={() => setAbgegeben(true)} className="w-full px-6 py-4"
                style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                Abgeben
              </button>
            </>
          ) : (
            <>
              <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.gruen, marginBottom: 10 }}>Auswertung</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: C.weiss, lineHeight: 1.3 }}>
                  {erreicht} von {klausur.gesamt} Punkten
                </p>
                <p style={{ fontSize: 15, color: "#C9D6EE", marginTop: 4 }}>{prozent} % · {note}</p>
                <p style={{ fontSize: 14, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.75, marginTop: 14 }}>
                  Wichtiger als die Punktzahl: Schau dir die Aufgaben an, bei denen du danebenlagst, und finde
                  heraus, ob es am Verfahren lag oder am Rechnen. Nur das eine davon wiederholt sich.
                </p>
              </div>
              <button onClick={() => { setKlausur(null); setLaeuft(false); }} className="px-6 py-3"
                style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
                Neue Klausur
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- Termtastatur ---------- */

/* Der Term wird als Maschinenschrift geführt, aber gesetzt angezeigt.
   ▯ ist ein Platzhalter: Er wird gefüllt, sobald man etwas einfügt,
   und mit der Pfeiltaste springt man zum nächsten. */


export function tMarken(s) {
  const m = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === PLATZ) { m.push({ t: "box" }); i++; }
    else if (/[0-9.]/.test(ch)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; m.push({ t: "num", v: s.slice(i, j) }); i = j; }
    else if (/[a-zA-Z\u0370-\u03ff]/.test(ch)) {
      const rest = s.slice(i).toLowerCase();
      const fn = ["sqrt", "exp", "sin", "cos", "tan", "log", "ln"].find(
        (name) => rest.startsWith(name) && rest[name.length] === "(");
      if (fn) { m.push({ t: "name", v: fn }); i += fn.length; }
      else if (rest.startsWith("pi")) { m.push({ t: "name", v: "pi" }); i += 2; }
      else {
        let name = ch; i += 1;   // Groß- und Kleinschreibung bleiben erhalten
        // Δx und Δy sind ein Symbol, kein Produkt
        if (/[\u0391-\u03a9]/.test(ch) && i < s.length && /[a-zA-Z]/.test(s[i])) { name += s[i]; i++; }
        while (i < s.length && "′″‴'".includes(s[i])) { name += s[i]; i++; }
        m.push({ t: "name", v: name });
      }
    }
    else if ("+-*/^()".includes(ch)) { m.push({ t: ch }); i++; }
    else if (/\s/.test(ch)) { i++; }
    else { m.push({ t: "?" }); i++; }
  }
  return m;
}


export function tBaum(m) {
  let p = 0;
  const schau = () => m[p];
  const nimm = (t) => { if (m[p] && m[p].t === t) { p++; return true; } return false; };

  function summe() {
    let n = produkt(); if (!n) return null;
    while (schau() && (schau().t === "+" || schau().t === "-")) {
      const op = schau().t; p++;
      const r = produkt(); if (!r) return null;
      n = { op, l: n, r };
    }
    return n;
  }
  function produkt() {
    let n = vorz(); if (!n) return null;
    for (;;) {
      if (schau() && (schau().t === "*" || schau().t === "/")) {
        const op = schau().t; p++;
        const r = vorz(); if (!r) return null;
        n = { op, l: n, r };
      } else if (schau() && ["num", "name", "box", "("].includes(schau().t)) {
        const r = vorz(); if (!r) return null;
        n = { op: "*", still: true, l: n, r };
      } else return n;
    }
  }
  function vorz() {
    if (nimm("-")) { const n = vorz(); return n ? { op: "neg", l: n } : null; }
    if (nimm("+")) return vorz();
    return potenz();
  }
  function potenz() {
    const b = atom(); if (!b) return null;
    if (nimm("^")) { const e = vorz(); return e ? { op: "^", l: b, r: e } : null; }
    return b;
  }
  function atom() {
    const k = schau(); if (!k) return null;
    if (k.t === "box") { p++; return { op: "box" }; }
    if (k.t === "num") { p++; return { op: "num", v: k.v }; }
    if (k.t === "(") { p++; const n = summe(); if (!n || !nimm(")")) return null; return { op: "klammer", l: n }; }
    if (k.t === "name") {
      p++;
      const name = k.v;
      if (["sin", "cos", "tan", "ln", "log", "sqrt", "exp"].includes(name)) {
        if (!nimm("(")) return null;
        const a = summe(); if (!a || !nimm(")")) return null;
        return { op: "fn", name, l: a };
      }
      if (/^[a-zA-Z]['′″‴]{0,3}$/.test(name) && schau() && schau().t === "(") {
        p++;
        const a = summe(); if (!a || !nimm(")")) return null;
        return { op: "fnroh", name, l: a };
      }
      return { op: "var", name };
    }
    return null;
  }
  const n = summe();
  return n && p === m.length ? n : null;
}


export function tTex(n, aussen = 0) {
  const klam = (s, r) => (r < aussen ? `(${s})` : s);
  switch (n.op) {
    case "num": return n.v.replace(".", "{,}");
    case "var": return n.name === "pi" ? "\\pi" : n.name;
    case "box": return "▯";
    case "klammer": return `(${tTex(n.l, 0)})`;
    case "neg": return klam(`-${tTex(n.l, 2)}`, 1);
    case "+": return klam(`${tTex(n.l, 1)} + ${tTex(n.r, 1)}`, 1);
    case "-": return klam(`${tTex(n.l, 1)} - ${tTex(n.r, 2)}`, 1);
    case "*": {
      const a = tTex(n.l, 2), b = tTex(n.r, 2);
      const punkt = /[0-9]$/.test(a) && /^[0-9]/.test(b);
      return klam(`${a}${punkt ? " \\cdot " : " "}${b}`, 2);
    }
    case "/": return `\\frac{${tTex(ohneKlammer(n.l), 0)}}{${tTex(ohneKlammer(n.r), 0)}}`;
    case "^": return klam(`${tTex(n.l, 5)}^{${tTex(n.r, 0)}}`, 4);
    case "fnroh": return `${n.name}(${tTex(ohneKlammer(n.l), 0)})`;
    case "fn": {
      const name = n.name === "sqrt" ? null : n.name === "ln" || n.name === "log" ? "\\ln" : `\\${n.name}`;
      if (!name) return `\\sqrt{${tTex(ohneKlammer(n.l), 0)}}`;
      return `${name}(${tTex(ohneKlammer(n.l), 0)})`;
    }
    default: return "";
  }
}


export function termAlsTex(text) {
  if (!text) return null;
  const b = tBaum(tMarken(text));
  return b ? tTex(b) : null;
}

/* --- Die Tastatur --- */


export function TermTastatur({ wert, setWert }) {
  const [pos, setPos] = useState(wert.length);
  const [feld, setFeld] = useState("zahl");

  const setzen = (t, p) => { setWert(t); setPos(Math.max(0, Math.min(p, t.length))); };

  const einfuegen = (s) => {
    let t = wert, p = pos;
    if (t[p] === PLATZ) t = t.slice(0, p) + s + t.slice(p + 1);
    else t = t.slice(0, p) + s + t.slice(p);
    const rel = s.indexOf(PLATZ);
    setzen(t, rel >= 0 ? p + rel : p + s.length);
  };

  const zurueck = () => {
    if (pos === 0) return;
    setzen(wert.slice(0, pos - 1) + wert.slice(pos), pos - 1);
  };

  const naechsterPlatz = () => {
    const ab = wert.indexOf(PLATZ, pos + 1);
    const idx = ab >= 0 ? ab : wert.indexOf(PLATZ);
    if (idx >= 0) setPos(idx);
    else setPos(wert.length);
  };

  const tex = termAlsTex(wert);

  const Taste = ({ kind, onClick, ton, quadrat, klein }) => (
    <button onClick={onClick}
      style={{ width: "100%", aspectRatio: quadrat ? "1 / 1" : "auto", height: quadrat ? "auto" : 50,
        background: ton === "aktion" ? C.see : ton === "hell" ? C.himmel : C.weiss,
        color: ton === "aktion" ? C.weiss : C.tinte,
        border: `1px solid ${ton === "aktion" ? C.see : C.linie}`, borderRadius: 16,
        fontSize: klein ? 15 : 19, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
      {kind}
    </button>
  );

  return (
    <div>
      {/* Anzeige */}
      <div style={{ background: C.weiss, border: `1.5px solid ${C.linie}`, borderRadius: 12,
        padding: "12px 14px", minHeight: 54, marginBottom: 6, overflowX: "auto" }}>
        {wert ? (
          tex ? <span style={{ fontSize: 19, lineHeight: 1.9 }}><M t={tex} /></span>
              : <span style={{ fontSize: 17, color: C.grau }}>{wert}</span>
        ) : (
          <span style={{ fontSize: 15, color: C.hellgrau, fontWeight: 300 }}>noch nichts eingegeben</span>
        )}
      </div>

      {/* Lineare Fassung mit Schreibmarke */}
      <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, marginBottom: 12, wordBreak: "break-all" }}>
        {wert.slice(0, pos)}<span style={{ color: C.gruenDunkel, fontWeight: 700 }}>|</span>{wert.slice(pos)}
      </p>

      {/* Umschalter */}
      <div className="flex gap-2 mb-2">
        {[["zahl", "Zahlen"], ["funk", "Funktionen"], ["param", "Parameter"]].map(([id, n]) => (
          <button key={id} onClick={() => setFeld(id)} className="px-3 py-2"
            style={{ flex: 1, background: feld === id ? C.see : C.weiss, color: feld === id ? C.weiss : C.grau,
              border: `1px solid ${feld === id ? C.see : C.linie}`, borderRadius: 999, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
            {n}
          </button>
        ))}
      </div>

      {/* Tastenfelder */}
      {feld === "zahl" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {TASTEN_ZAHL.map((t, i) => (
            <Taste key={i} kind={t} quadrat ton={/[0-9.]/.test(t) ? "weiss" : "hell"} onClick={() => einfuegen(t)} />
          ))}
        </div>
      )}

      {feld === "funk" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {TASTEN_FUNK.map((t, i) => (
            <div key={i} style={t.breit ? { gridColumn: "span 2" } : {}}>
              <Taste kind={t.z} quadrat={!t.breit} ton="hell" klein={t.z.length > 3} onClick={() => einfuegen(t.e)} />
            </div>
          ))}
        </div>
      )}

      {feld === "param" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {TASTEN_PARAM.map((t, i) => (
              <Taste key={i} kind={t === "pi" ? "π" : t} quadrat ton="hell" onClick={() => einfuegen(t)} />
            ))}
          </div>
          <p style={{ color: C.hellgrau, fontSize: 12, fontWeight: 300, lineHeight: 1.6, marginTop: 8 }}>
            Parameter sind feste, aber unbekannte Zahlen. Beim Ableiten nach x werden sie wie Konstanten behandelt.
          </p>
        </>
      )}

      {/* Steuerung */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 10 }}>
        <Taste kind="←" ton="aktion" onClick={() => setPos(Math.max(0, pos - 1))} />
        <Taste kind="→" ton="aktion" onClick={() => setPos(Math.min(wert.length, pos + 1))} />
        <Taste kind={PLATZ} ton="aktion" onClick={naechsterPlatz} />
        <Taste kind="⌫" ton="hell" onClick={zurueck} />
        <Taste kind="C" ton="hell" klein onClick={() => setzen("", 0)} />
      </div>
    </div>
  );
}

/* ---------- Generator: Ableitungen bilden ---------- */


export function wegSumme(glieder, erg) {
  const s = [W("Die Summenregel erlaubt es, jeden Summanden einzeln abzuleiten.", null)];
  glieder.forEach((g) => s.push(W(g.h, `(${g.tex})′ = ${g.abl}`)));
  s.push(W("Zusammengesetzt ergibt das die Ableitung.", `f′(x) = ${erg}`));
  return s;
}


export function wegProdukt(u, us, v, vs, zwischen, erg) {
  return [
    W("Schreib zuerst die beiden Faktoren getrennt auf und leite den ersten ab.", `u = ${u} \\, , \\quad u′ = ${us}`),
    W("Dasselbe für den zweiten Faktor.", `v = ${v} \\, , \\quad v′ = ${vs}`),
    W("Jetzt in die Produktregel einsetzen: u′v + uv′.", zwischen),
    W("Ausmultiplizieren und zusammenfassen.", `f′(x) = ${erg}`),
  ];
}


export function wegKette(aussen, innen, innenAbl, zwischen, erg) {
  return [
    W("Zerlege die Funktion in eine äußere und eine innere Funktion.", `äußere: ${aussen} \\quad innere: v = ${innen}`),
    W("Leite die innere Funktion für sich ab. Genau dieser Faktor wird am häufigsten vergessen.", `v′ = ${innenAbl}`),
    W("Kettenregel: äußere Ableitung mal innere Ableitung.", zwischen),
    W("Zusammengefasst.", `f′(x) = ${erg}`),
  ];
}


export function wegQuotient(u, us, v, vs, zwischen, erg) {
  return [
    W("Zähler und Nenner getrennt notieren und den Zähler ableiten.", `u = ${u} \\, , \\quad u′ = ${us}`),
    W("Dasselbe für den Nenner.", `v = ${v} \\, , \\quad v′ = ${vs}`),
    W("In die Quotientenregel einsetzen. Die Reihenfolge im Zähler ist u′v − uv′.", zwischen),
    W("Zähler ausmultiplizieren und zusammenfassen.", `f′(x) = ${erg}`),
  ];
}


export function analysiere(text, meins, soll, auf) {
  const roh = normieren(text);
  const ohneArg = ["sin", "cos", "tan", "ln", "sqrt"].find((f) => {
    const i = roh.indexOf(f);
    return i >= 0 && roh[i + f.length] !== "(";
  });
  if (ohneArg) return `Funktionen brauchen ihr Argument in Klammern: ${ohneArg}(x) statt ${ohneArg} x.`;

  for (const falle of auf.fallen || []) {
    const fn = alsFunktion(falle.t);
    if (fn && stimmtUeberein(meins, fn, 1e-5)) return falle.h;
  }

  const f = alsFunktion(auf.f);
  if (f && stimmtUeberein(meins, f, 1e-5)) return "Das ist f selbst, nicht die Ableitung. Der Grad muss um eins sinken.";
  if (f && stimmtUeberein(meins, numAbleitung(numAbleitung(f)), 2e-3))
    return "Das ist f″, also eine Ableitung zu weit.";

  const negSoll = (x) => -soll(x);
  if (stimmtUeberein(meins, negSoll, 1e-5)) return "Alle Vorzeichen sind gedreht. Prüfe, wo ein Minus verloren gegangen ist.";

  const stellen = [0.83, 1.37, 2.11, 3.07];
  const werte = stellen.map((x) => ({ m: meins(x), s: soll(x) })).filter((w) => isFinite(w.m) && isFinite(w.s));
  if (werte.length >= 3) {
    const diff = werte.map((w) => w.m - w.s);
    if (Math.max(...diff) - Math.min(...diff) < 1e-6 && Math.abs(diff[0]) > 1e-6) {
      const c = Math.round(diff[0] * 1000) / 1000;
      return c > 0
        ? `Dein Ergebnis ist durchweg um ${c} zu groß — meist ein stehen gebliebenes absolutes Glied.`
        : `Dir fehlt ein konstanter Summand: dein Ergebnis ist überall um ${Math.abs(c)} zu klein.`;
    }
    const q = werte.filter((w) => Math.abs(w.s) > 1e-9).map((w) => w.m / w.s);
    if (q.length >= 3 && Math.max(...q) - Math.min(...q) < 1e-6 && Math.abs(q[0] - 1) > 1e-6) {
      const k = Math.round(q[0] * 1000) / 1000;
      return `Dein Ergebnis ist überall um den Faktor ${k} daneben — ein konstanter Faktor wurde vergessen oder doppelt gesetzt.`;
    }
  }

  const x0 = 2;
  const mv = Math.round(meins(x0) * 1000) / 1000, sv = Math.round(soll(x0) * 1000) / 1000;
  if (isFinite(mv) && isFinite(sv))
    return `An der Stelle x = 2 liefert dein Term ${mv}, richtig wäre ${sv}. Setze selbst ein und vergleiche Schritt für Schritt.`;
  return "Der Term stimmt noch nicht. Geh den Weg Zeile für Zeile durch.";
}

/* Ordnet eine Diagnose einer Fehlerart zu — Grundlage des Fehlerprofils. */

export function fehlerartAus(text, auf) {
  if (/Klammern|Argument/.test(text)) return "schreibweise";
  if ((auf.fallen || []).some((f) => f.h === text)) return "regel";
  if (/f selbst|f″/.test(text)) return "tiefe";
  if (/Vorzeichen/.test(text)) return "vorzeichen";
  if (/Summand|absolutes Glied/.test(text)) return "summand";
  if (/Faktor/.test(text)) return "faktor";
  return "sonstiges";
}


export function AbleitungsGenerator() {
  const [typ, setTyp] = useState(ABL_TYPEN[0]);
  const [stufe, setStufe] = useState(2);
  const [auf, setAuf] = useState(() => ABL_TYPEN[0].mach(2));
  const [eingabe, setEingabe] = useState("");
  const [stand, setStand] = useState(null);
  const [hinweis, setHinweis] = useState("");
  const [zeigen, setZeigen] = useState(false);
  const [laedt, setLaedt] = useState(false);
  const [quelle, setQuelle] = useState("");
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const [tippen, setTippen] = useState(false);
  const [start, setStart] = useState(() => Date.now());
  const [wegOffen, setWegOffen] = useState(false);

  const leeren = () => { setEingabe(""); setStand(null); setHinweis(""); setZeigen(false); };
  const neu = (t, s) => { setAuf((t || typ).mach(s || stufe)); setQuelle(""); setStart(Date.now()); leeren(); };
  const wechseln = (t) => { setTyp(t); neu(t); };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(typ, v); };

  const vonKi = async () => {
    setLaedt(true); leeren();
    const ersatz = () => { setAuf(typ.mach(stufe)); setQuelle("Ersatzaufgabe"); setLaedt(false); };
    try {
      const res = await fetch(API_URL, {
        method: "POST", headers: kiKopf(),
        body: JSON.stringify({
          model: "claude-sonnet-5-5", max_tokens: 300,
          messages: [{ role: "user", content: `Erzeuge eine neue Ableitungsaufgabe zur ${typ.regel}. Schwierigkeitsstufe ${stufe} von 5, wobei 1 sehr einfach und 5 anspruchsvolles Abiturniveau ist.
Antworte nur mit JSON: {"tex":"die Funktion in LaTeX","f":"die Funktion in Maschinenschreibweise","fs":"ihre Ableitung in Maschinenschreibweise"}
Maschinenschreibweise: ^ für Potenzen, * für Produkte, sin(x), cos(x), ln(x), sqrt(x), e^x. Nur die Variable x.` }],
        }),
      });
      const daten = await kiAntwort(res);
      const text = (daten.content || []).map((t) => (t.type === "text" ? t.text : "")).join("");
      const roh = jsonLesen(text);
      const f = alsFunktion(roh.f), fs = alsFunktion(roh.fs);
      if (f && fs && roh.tex && stimmtUeberein(fs, numAbleitung(f), 1e-3)) {
        setAuf({ tex: roh.tex, f: roh.f, loesung: roh.fs, zeig: roh.fs, tol: 1e-4, fallen: [] });
        setQuelle("von Mathilda erzeugt"); setLaedt(false);
      } else ersatz();
    } catch (e) { ersatz(); }
  };

  const pruefen = () => {
    const meins = alsFunktion(eingabe);
    if (!meins) {
      setStand("nein");
      setHinweis("Der Term lässt sich nicht lesen. Prüfe die Klammern — jede geöffnete muss auch geschlossen sein.");
      return;
    }
    const soll = alsFunktion(auf.loesung);
    const ok = !!soll && stimmtUeberein(meins, soll, auf.tol || 1e-6);
    const text = ok ? "" : analysiere(eingabe, meins, soll, auf);
    setStand(ok ? "ok" : "nein");
    setHinweis(text);
    setSerie((s) => ({ n: s.n + 1, ok: s.ok + (ok ? 1 : 0) }));
    merken({
      bereich: "ableiten", gruppe: typ.name, stufe, richtig: ok,
      sekunden: Math.max(1, Math.round((Date.now() - start) / 1000)),
      fehlerart: ok ? null : fehlerartAus(text, auf),
    });
  };

  const Stufenknopf = ({ zeichen, onClick }) => (
    <button onClick={onClick}
      style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${C.linie}`, background: C.weiss,
        color: C.see, fontSize: 17, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
      {zeichen}
    </button>
  );

  return (
    <div>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Wähle eine Regel und eine Stufe. Zu jeder Kombination werden beliebig viele neue Funktionen erzeugt.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {ABL_TYPEN.map((t) => (
          <button key={t.id} onClick={() => wechseln(t)} className="px-4 py-2"
            style={{ background: typ.id === t.id ? C.see : C.weiss, color: typ.id === t.id ? C.weiss : C.grau,
              border: `1px solid ${typ.id === t.id ? C.see : C.linie}`, borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
            {t.name}
          </button>
        ))}
      </div>

      <div className="flex items-center" style={{ gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Schwierigkeit</span>
        <Stufenknopf zeichen="−" onClick={() => stufeSetzen(stufe - 1)} />
        <div className="flex" style={{ gap: 4 }}>
          {[1, 2, 3, 4, 5].map((k) => (
            <span key={k} style={{ width: 9, height: 9, borderRadius: 999,
              background: k <= stufe ? C.see : C.linie, display: "inline-block" }} />
          ))}
        </div>
        <Stufenknopf zeichen="+" onClick={() => stufeSetzen(stufe + 1)} />
        <span style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 600 }}>{stufe} / 5</span>
      </div>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 4 }}>{typ.regel}</p>
        <p style={{ color: C.grau, fontSize: 13, fontWeight: 300, lineHeight: 1.6, marginBottom: 16 }}>{typ.erklaerung}</p>

        <div style={{ fontSize: 19, lineHeight: 2.1, marginBottom: 16 }}>
          f(x) = <M t={auf.tex} />
        </div>

        <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>f′(x) =</p>
        {tippen ? (
          <input value={eingabe} onChange={(e) => { setEingabe(e.target.value); setStand(null); }}
            placeholder="deine Lösung"
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 16, fontFamily: "inherit",
              border: `1.5px solid ${stand === "ok" ? C.see : stand ? C.signal : C.linie}`,
              borderRadius: 12, outline: "none", background: stand === "ok" ? C.himmel : C.weiss, color: C.tinte, marginBottom: 8 }} />
        ) : (
          <TermTastatur wert={eingabe} setWert={(w) => { setEingabe(w); setStand(null); }} />
        )}
        <button onClick={() => setTippen(!tippen)} className="mt-2"
          style={{ background: "none", border: "none", color: C.see, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
          {tippen ? "Tastenfeld benutzen" : "Lieber selbst tippen"}
        </button>
        <div style={{ height: 12 }} />
        {quelle && <p style={{ color: C.hellgrau, fontSize: 12, fontWeight: 300, marginBottom: 10 }}>{quelle}</p>}

        {stand === null ? (
          <button onClick={pruefen} disabled={!eingabe.trim()} className="px-6 py-3"
            style={{ background: eingabe.trim() ? C.see : C.hellgrau, color: C.weiss, border: "none",
              borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Prüfen
          </button>
        ) : stand === "ok" ? (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.see }}>Stimmt.</p>
          </div>
        ) : (
          <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>Stimmt nicht.</p>
            <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>{hinweis}</p>
            {!zeigen && (
              <button onClick={() => setZeigen(true)} className="mt-3"
                style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                Lösung zeigen
              </button>
            )}
            {zeigen && <p style={{ fontSize: 17, color: C.see, fontWeight: 600, marginTop: 12, lineHeight: 2 }}>f′(x) = <M t={auf.zeig} /></p>}
          </div>
        )}
      </div>

      {wegOffen && (
        <LoesungsWeg titelTex={auf.tex} aufgabeText="Schreib den vollständigen Weg zur Ableitung auf."
          onSchliessen={() => setWegOffen(false)} />
      )}

      <div className="flex flex-wrap gap-3 mt-5">
        <button onClick={() => neu()} className="px-6 py-3"
          style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Nächste Aufgabe
        </button>
        <button onClick={vonKi} disabled={laedt} className="px-6 py-3"
          style={{ background: C.weiss, color: C.gruenDunkel, border: `1px solid ${C.gruenDunkel}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: laedt ? "wait" : "pointer" }}>
          {laedt ? "…" : "Von Mathilda erzeugen"}
        </button>
        <button onClick={() => setWegOffen(true)} className="px-6 py-3"
          style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
          Lösungsweg schreiben
        </button>
        {serie.n > 0 && (
          <span className="flex items-center" style={{ fontSize: 13, color: C.grau }}>{serie.ok} von {serie.n} richtig</span>
        )}
      </div>
    </div>
  );
}

/* ---------- Generator: vollständige Kurvendiskussion ---------- */
FR.kubischErzeugen = kubischErzeugen;
FR.wegSumme = wegSumme;
FR.wegProdukt = wegProdukt;
FR.wegKette = wegKette;
FR.wegQuotient = wegQuotient;
