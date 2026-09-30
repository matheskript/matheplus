import React, { useState, useRef } from "react";
import { C } from "./base1.jsx";
import { BEREICHE, LW_FUNKTIONEN, LW_FX, LW_GRIECHISCH, LW_GROSS, LW_HOCH, LW_KLEIN, LW_ZAHLEN, PLATZ, PROTOKOLL, istLeer } from "./base2.jsx";
import { AKTIVE, ANKER, DIAG, EINHEITEN, EINSTUFUNG_MAX, GEWICHT, GRUPPE_ZU_KOMPETENZ, KOMP, LEITIDEEN, LERN, LERN_SCHLUESSEL, LINIEN, RAM_SPEICHER, SR_ABSTAENDE, STATUS_STIL, STUFEN, STUFE_INDEX, TAG_MS, TIEFE, VORAUSBLICK, aktiv, alleVoraussetzungen, faelligIn, hatEinheit, komma, statusVon, stufeVonKlasse } from "./base3.jsx";
import { bruch } from "./func1.jsx";
import { M, Text, Zeile, alsFunktion, stimmtUeberein, wegPruefen, zahlAus, zeileSetzen } from "./func3.jsx";
import { FR } from "./funcRegistry.jsx";
import { FotoEinwilligungVerwalten, terminWiederholungenHeute } from "./func9.jsx";
import { TermTastatur } from "./func4.jsx";

export function LoesungsWeg({ titelTex, aufgabeText, typ, auf, onSchliessen }) {
  const [zeilen, setZeilen] = useState(["", ""]);
  const [aktiv, setAktiv] = useState(0);
  const [pos, setPos] = useState(0);
  const [panel, setPanel] = useState(null);
  const [gross, setGross] = useState(false);
  const [bericht, setBericht] = useState(null);

  const wert = zeilen[aktiv] || "";

  const setzen = (t, p) => {
    const kopie = [...zeilen];
    kopie[aktiv] = t;
    setZeilen(kopie);
    setPos(Math.max(0, Math.min(p, t.length)));
    setBericht(null);
  };

  const einfuegen = (s) => {
    let t = wert, p = pos;
    if (t[p] === PLATZ) t = t.slice(0, p) + s + t.slice(p + 1);
    else t = t.slice(0, p) + s + t.slice(p);
    const rel = s.indexOf(PLATZ);
    setzen(t, rel >= 0 ? p + rel : p + s.length);
  };

  /* Der Bruchstrich nimmt den zuletzt geschriebenen Term als Zähler. */
  const bruch = () => {
    let i = pos, tiefe = 0;
    while (i > 0) {
      const ch = wert[i - 1];
      if (ch === ")") { tiefe++; i--; continue; }
      if (ch === "(") { if (tiefe === 0) break; tiefe--; i--; continue; }
      if (tiefe === 0 && "+-=".includes(ch)) break;
      i--;
    }
    const zaehler = wert.slice(i, pos).trim();
    if (!zaehler) { einfuegen(`(${PLATZ})/(${PLATZ})`); return; }
    setzen(wert.slice(0, i) + `(${zaehler})/(${PLATZ})` + wert.slice(pos), i + zaehler.length + 4);
  };

  const hochStellen = () => { einfuegen(`^(${PLATZ})`); setPanel("hoch"); };
  const raus = () => { const zu = wert.indexOf(")", pos); setPos(zu >= 0 ? zu + 1 : wert.length); };
  const naechsterPlatz = () => {
    const ab = wert.indexOf(PLATZ, pos + 1);
    const idx = ab >= 0 ? ab : wert.indexOf(PLATZ);
    setPos(idx >= 0 ? idx : wert.length);
  };
  const zurueckTaste = () => { if (pos > 0) setzen(wert.slice(0, pos - 1) + wert.slice(pos), pos - 1); };
  const neueZeile = () => {
    const kopie = [...zeilen];
    kopie.splice(aktiv + 1, 0, "");
    setZeilen(kopie); setAktiv(aktiv + 1); setPos(0); setBericht(null);
  };
  const zeileWeg = () => {
    if (zeilen.length <= 1) { setzen("", 0); return; }
    setZeilen(zeilen.filter((_, i) => i !== aktiv));
    setAktiv(Math.max(0, aktiv - 1)); setPos(0); setBericht(null);
  };

  const pruefen = () => { if (typ && auf) setBericht(wegPruefen(zeilen, typ, auf)); };

  const Taste = ({ z, fn, art, klein, hoehe }) => (
    <button onClick={fn}
      style={{ width: "100%", height: hoehe || 46,
        background: art === "gruppe" ? C.himmel : art === "aktion" ? C.see : art === "op" ? C.himmel : C.weiss,
        color: art === "aktion" ? C.weiss : art === "gruppe" ? C.see : C.tinte,
        border: `1px solid ${art === "aktion" ? C.see : C.linie}`, borderRadius: 12,
        fontSize: klein ? 12.5 : 16.5, fontWeight: art === "gruppe" ? 600 : 500,
        fontFamily: "inherit", cursor: "pointer", padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
      {z}
    </button>
  );

  const gruppen = [
    { id: "zahl", z: "123" }, { id: "abc", z: "ABC" }, { id: "griech", z: "αβγ" },
    { id: "hoch", z: "x▯", fn: hochStellen }, { id: "fx", z: "f(x)" }, { id: "fun", z: "sin" },
  ];

  const panelTasten = () => {
    if (panel === "zahl") return LW_ZAHLEN.map((z) => ({ z, e: z === "," ? "." : z }));
    if (panel === "abc") return (gross ? LW_GROSS : LW_KLEIN).map((z) => ({ z, e: z }));
    if (panel === "griech") return LW_GRIECHISCH.map((z) => ({ z, e: z }));
    if (panel === "hoch") return LW_HOCH.map((z) => ({ z, e: z === "−" ? "-" : z }));
    if (panel === "fx") return LW_FX.map((t) => ({ ...t, klein: true }));
    if (panel === "fun") return LW_FUNKTIONEN.map((t) => ({ ...t, klein: true }));
    return [];
  };

  const spalten = panel === "abc" || panel === "griech" ? 7 : panel === "hoch" ? 7 : panel === "zahl" ? 3 : 3;

  return (
    <div style={{ position: "fixed", inset: 0, background: C.sand, zIndex: 120, overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, background: C.seeTief, zIndex: 5 }}>
        <div className="mx-auto px-5 flex items-center justify-between" style={{ maxWidth: 620, height: 54 }}>
          <span style={{ color: C.weiss, fontSize: 15.5, fontWeight: 600 }}>Lösungsweg</span>
          <button onClick={onSchliessen}
            style={{ background: "none", border: "none", color: C.gruen, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
            schließen
          </button>
        </div>
      </div>

      <div className="mx-auto px-5 pb-10" style={{ maxWidth: 620 }}>
        {/* Aufgabe */}
        {(titelTex || aufgabeText) && (
          <div style={{ background: C.weiss, borderRadius: 14, padding: 16, marginTop: 14, marginBottom: 12,
            boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
            {aufgabeText && <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: titelTex ? 8 : 0 }}>{aufgabeText}</p>}
            {titelTex && <div style={{ fontSize: 18, lineHeight: 2 }}>f(x) = <M t={titelTex} /></div>}
          </div>
        )}

        {/* Zeilen */}
        <div style={{ background: C.weiss, borderRadius: 14, padding: 12, marginBottom: 8,
          boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
          {zeilen.map((z, i) => {
            const dran = i === aktiv;
            const fehlerhaft = bericht && bericht.fehler.some((f) => f.startsWith(`Zeile ${i + 1}:`));
            return (
              <div key={i} onClick={() => { setAktiv(i); setPos((zeilen[i] || "").length); }}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", marginBottom: 5,
                  borderRadius: 10, cursor: "pointer", background: dran ? C.himmel : "transparent",
                  borderLeft: `3px solid ${fehlerhaft ? C.signal : dran ? C.see : "transparent"}` }}>
                <span style={{ color: C.hellgrau, fontSize: 11, width: 12, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, fontSize: 17, lineHeight: 1.9, minHeight: 24, overflowX: "auto" }}>
                  {istLeer(z)
                    ? <span style={{ color: C.hellgrau, fontSize: 13.5, fontWeight: 300 }}>{dran ? "hier schreiben" : "leer"}</span>
                    : zeileSetzen(z)}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: C.hellgrau, fontWeight: 300, marginBottom: 10, wordBreak: "break-all" }}>
          {wert.slice(0, pos)}<span style={{ color: C.gruenDunkel, fontWeight: 700 }}>|</span>{wert.slice(pos)}
        </p>

        {/* Gruppen */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 5 }}>
          {gruppen.map((g) => (
            <button key={g.id}
              onClick={() => (g.fn ? g.fn() : setPanel(panel === g.id ? null : g.id))}
              style={{ width: "100%", height: 46,
                background: panel === g.id ? C.see : C.himmel, color: panel === g.id ? C.weiss : C.see,
                border: `1px solid ${panel === g.id ? C.see : C.linie}`, borderRadius: 12,
                fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
              {g.z}
            </button>
          ))}
        </div>

        {/* Untertastatur */}
        {panel && (
          <div style={{ background: C.weiss, borderRadius: 14, padding: 12, marginTop: 6,
            boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
            {panel === "abc" && (
              <div className="flex gap-2 mb-2">
                {[["klein", false], ["GROSS", true]].map(([n, v]) => (
                  <button key={n} onClick={() => setGross(v)} className="px-3 py-1"
                    style={{ flex: 1, background: gross === v ? C.see : C.weiss, color: gross === v ? C.weiss : C.grau,
                      border: `1px solid ${gross === v ? C.see : C.linie}`, borderRadius: 999, fontSize: 12.5,
                      fontFamily: "inherit", cursor: "pointer" }}>{n}</button>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${spalten}, 1fr)`, gap: 5 }}>
              {panelTasten().map((t, i) => (
                <Taste key={i} z={t.z} klein={t.klein} hoehe={42} fn={() => einfuegen(t.e)} />
              ))}
            </div>
            {panel === "hoch" && (
              <p style={{ fontSize: 12, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 8 }}>
                Die Hochzahl steht im Platzhalter. Mit „raus" springst du hinter die Klammer und schreibst normal weiter.
              </p>
            )}
          </div>
        )}

        {/* Rechenzeichen und Steuerung */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 5, marginTop: 6 }}>
          <Taste z="+" art="op" fn={() => einfuegen("+")} />
          <Taste z="−" art="op" fn={() => einfuegen("-")} />
          <Taste z="·" art="op" fn={() => einfuegen("*")} />
          <Taste z="=" art="op" fn={() => einfuegen("=")} />
          <Taste z="▯/▯" art="op" klein fn={bruch} />
          <Taste z="x" art="op" fn={() => einfuegen("x")} />

          <Taste z="(" art="op" fn={() => einfuegen("(")} />
          <Taste z=")" art="op" fn={() => einfuegen(")")} />
          <Taste z="←" art="aktion" fn={() => setPos(Math.max(0, pos - 1))} />
          <Taste z="→" art="aktion" fn={() => setPos(Math.min(wert.length, pos + 1))} />
          <Taste z="raus" art="aktion" klein fn={raus} />
          <Taste z={PLATZ} art="aktion" fn={naechsterPlatz} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginTop: 5 }}>
          <Taste z="⌫" art="op" hoehe={42} fn={zurueckTaste} />
          <Taste z="Neue Zeile" art="op" klein hoehe={42} fn={neueZeile} />
          <Taste z="Zeile löschen" art="op" klein hoehe={42} fn={zeileWeg} />
        </div>

        {typ && auf && (
          <button onClick={pruefen} className="w-full mt-4"
            style={{ height: 48, background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999,
              fontSize: 15.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Rechenweg prüfen
          </button>
        )}

        {bericht && (
          <div style={{ background: C.weiss, borderRadius: 14, padding: 18, marginTop: 14,
            boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
            <p style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 10,
              color: bericht.vollstaendig ? C.see : C.signal }}>
              {bericht.vollstaendig ? "Der Weg ist vollständig und trägt." : "Der Weg ist noch nicht vollständig."}
            <span style={{ display: "block", fontSize: 13, fontWeight: 400, color: C.grau, marginTop: 4 }}>
              {typ.schritte.filter((sch) => bericht.erfuellt[sch.id]).length} von {typ.schritte.length} Bewertungseinheiten
              {bericht.fehler.length > 0 ? ` · ${bericht.fehler.length} Zeile${bericht.fehler.length > 1 ? "n" : ""} mit Fehler` : ""}
            </span>
            </p>
            {typ.schritte.map((sch) => {
              const da = bericht.erfuellt[sch.id];
              return (
                <div key={sch.id} className="flex items-center" style={{ gap: 9, marginBottom: 7 }}>
                  <span style={{ width: 15, textAlign: "center", fontSize: 13.5,
                    color: da ? C.see : sch.weich ? C.hellgrau : C.signal }}>
                    {da ? "✓" : sch.weich ? "·" : "○"}
                  </span>
                  <span style={{ fontSize: 13.5, color: da ? C.tinte : C.grau, fontWeight: da ? 500 : 300 }}>{sch.name}</span>
                </div>
              );
            })}
            {bericht.fehler.map((f, i) => (
              <p key={i} style={{ fontSize: 13.5, color: C.tinte, fontWeight: 300, lineHeight: 1.7, marginTop: 8 }}>{f}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================================================================
   PHASE A · FUNDAMENT
   Kompetenzkarte · Lernstand mit Profil · adaptive Einstufung
   ====================================================================== */

/* ---------- Die Kompetenzkarte ---------- */

/* Orientiert am Bildungsplan Baden-Württemberg, gegliedert nach den fünf
   Leitideen und vier Stufen. Jede Kompetenz nennt ihre Voraussetzungen —
   daraus entsteht der Graph, auf dem Einstufung und Lernpfad arbeiten. */

/* ======================================================================
   STRUKTUR · ZWEI BEREICHE, ELF LINIEN, VIER NIVEAUS
   A · Algebra — Rechnen und Gleichungen lösen
   B · Funktionen und Analysis — Geraden und Kurven
   Roter Faden: vorwärts rechnen, rückwärts lösen.
   ====================================================================== */


export function buchVerweis(code) {
  if (!code) return [];
  return code.split(" · ").map((teil) => {
    const m = teil.match(/^(LS(\d+)|KS|A(\d))\s+(.+)$/);
    if (!m) return teil;
    const band = m[1] === "KS" ? "Kursstufe" : m[2] ? `Band ${m[2]}` : `Band ${m[3]} (ältere Ausgabe)`;
    return `${band}, Kapitel ${m[4]}`;
  });
}



export function diagPruefen(aufgabe, eingabe) {
  if (!eingabe || !String(eingabe).trim()) return false;
  if (aufgabe.art === "term") {
    const a = alsFunktion(eingabe), b = alsFunktion(aufgabe.loesung);
    return !!a && !!b && stimmtUeberein(a, b, 1e-6);
  }
  const a = zahlAus(eingabe), b = zahlAus(aufgabe.loesung);
  return a !== null && b !== null && Math.abs(a - b) < 1e-4 * (1 + Math.abs(b));
}

/* ---------- Speicherschicht ---------- */

/* Die einzige Stelle, die später gegen den Server getauscht wird.
   Bis dahin: Artefakt-Speicher, sonst Browserspeicher, sonst Arbeitsspeicher. */

export function lernBenachrichtigen() { LERN.hoerer.forEach((h) => h()); }


export function lernSpeichern() {
  speicherSchreiben({ profil: LERN.profil, stand: LERN.stand, einstufung: LERN.einstufung, aktivitaet: LERN.aktivitaet,
    plan: LERN.plan, verlauf: LERN.verlauf, testFehl: LERN.testFehl, letzteAktivitaet: LERN.letzteAktivitaet,
    messungen: LERN.messungen, experimente: LERN.experimente, noten: LERN.noten, pseudonym: LERN.pseudonym, termine: LERN.termine, protokoll: PROTOKOLL.slice(-500) });
}


export function lernAendern(fn) {
  fn(LERN);
  lernBenachrichtigen();
  lernSpeichern();
}

export async function speicherLesen() {
  try {
    if (typeof window !== "undefined" && window.storage && window.storage.get) {
      const r = await window.storage.get(LERN_SCHLUESSEL);
      if (r && r.value) return JSON.parse(r.value);
    }
  } catch (e) { /* Schlüssel noch nicht vorhanden */ }
  try {
    const v = window.localStorage && window.localStorage.getItem(LERN_SCHLUESSEL);
    if (v) return JSON.parse(v);
  } catch (e) { /* nicht verfügbar */ }
  return RAM_SPEICHER[LERN_SCHLUESSEL] || null;
}

export async function speicherSchreiben(daten) {
  RAM_SPEICHER[LERN_SCHLUESSEL] = daten;
  const text = JSON.stringify(daten);
  try {
    if (typeof window !== "undefined" && window.storage && window.storage.set) {
      await window.storage.set(LERN_SCHLUESSEL, text);
      return;
    }
  } catch (e) { /* weiter zum Browserspeicher */ }
  try { window.localStorage && window.localStorage.setItem(LERN_SCHLUESSEL, text); } catch (e) { /* bleibt im Arbeitsspeicher */ }
}

export async function lernLaden() {
  const d = await speicherLesen();
  if (d) {
    LERN.profil = d.profil || null; LERN.stand = d.stand || {}; LERN.einstufung = d.einstufung || null;
    LERN.aktivitaet = d.aktivitaet || {}; LERN.plan = d.plan || null; LERN.verlauf = d.verlauf || [];
    LERN.testFehl = d.testFehl || {}; LERN.letzteAktivitaet = d.letzteAktivitaet || 0;
    LERN.messungen = d.messungen || {}; LERN.experimente = d.experimente || {}; LERN.noten = d.noten || []; LERN.pseudonym = d.pseudonym || null; LERN.termine = d.termine || [];
    PROTOKOLL.splice(0, PROTOKOLL.length, ...(d.protokoll || []));
  }
  LERN.geladen = true;
  lernBenachrichtigen();
}


export function useLern() {
  const [, setZ] = useState(0);
  React.useEffect(() => {
    const h = () => setZ((z) => z + 1);
    LERN.hoerer.add(h);
    return () => LERN.hoerer.delete(h);
  }, []);
  return LERN;
}

/* Übungsergebnisse aus der ganzen App fließen in den Lernstand ein. */

export function lernAusUebung(eintrag) {
  const id = GRUPPE_ZU_KOMPETENZ[eintrag.gruppe];
  if (!id || !LERN.profil) return;
  lernAendern((L) => {
    const alt = L.stand[id] || { status: null, folge: 0, n: 0, ok: 0 };
    const neu = { ...alt, n: (alt.n || 0) + 1, ok: (alt.ok || 0) + (eintrag.richtig ? 1 : 0), zuletzt: Date.now() };
    if (eintrag.richtig) {
      neu.folge = (alt.folge || 0) + 1;
      if (neu.folge >= 5) neu.status = "sicher";
      else if (neu.status !== "sicher") neu.status = "arbeit";
    } else {
      neu.folge = 0;
      neu.status = alt.status === "sicher" ? "arbeit" : alt.status === "luecke" ? "luecke" : "arbeit";
    }
    L.stand[id] = neu;
  });
}

/* Die nächste sinnvolle Kompetenz: die niedrigste Lücke, deren
   Voraussetzungen tragen — sonst die nächste offene auf der eigenen Stufe. */

export function naechsteKompetenz(profil, stand) {
  const traegt = (id) => ["sicher", "vermutet"].includes(stand[id]?.status);
  const bereit = (k) => k.voraus.every(traegt);
  const kandidaten = AKTIVE
    .filter((k) => ["luecke", "arbeit"].includes(stand[k.id]?.status) && bereit(k))
    .sort((a, b) => STUFE_INDEX[a.stufe] - STUFE_INDEX[b.stufe] || GEWICHT[b.id] - GEWICHT[a.id]);
  if (kandidaten.length) return kandidaten[0];
  const eigene = profil ? STUFE_INDEX[stufeVonKlasse(profil.klasse)] : 0;
  const offen = AKTIVE
    .filter((k) => !traegt(k.id) && bereit(k) && STUFE_INDEX[k.stufe] >= eigene - 1 && STUFE_INDEX[k.stufe] <= eigene)
    .sort((a, b) => STUFE_INDEX[a.stufe] - STUFE_INDEX[b.stufe] || GEWICHT[b.id] - GEWICHT[a.id]);
  return offen[0] || null;
}


export function Profil({ gehe }) {
  const L = useLern();
  const [name, setName] = useState(L.profil?.name || "");
  const [klasse, setKlasse] = useState(L.profil?.klasse || 11);
  const [ziel, setZiel] = useState(L.profil?.ziel || "abitur");
  const [loeschen, setLoeschen] = useState(false);
  const neu = !L.profil;

  const speichern = () => {
    lernAendern((X) => { X.profil = { name: name.trim() || "Du", klasse, ziel, seit: X.profil?.seit || Date.now() }; });
    if (neu) gehe({ ansicht: "einstufung" });
  };

  const zaehler = Object.values(L.stand).reduce((z, s) => { z[s.status] = (z[s.status] || 0) + 1; return z; }, {});

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
        {neu
          ? "Drei Angaben, dann weiß Matheskript, wo es für dich losgeht. Danach folgt eine kurze Einstufung."
          : "Dein Profil und dein Lernstand. Beides wird auf diesem Gerät gespeichert."}
      </p>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 18 }}>
        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 8 }}>Wie sollen wir dich nennen?</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vorname"
          style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", fontSize: 16, fontFamily: "inherit",
            border: `1px solid ${C.linie}`, borderRadius: 12, outline: "none", marginBottom: 18 }} />

        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 8 }}>In welcher Klasse bist du?</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 18 }}>
          {[5, 6, 7, 8, 9, 10, 11, 12, 13].map((k) => (
            <button key={k} onClick={() => setKlasse(k)}
              style={{ height: 42, borderRadius: 11, border: `1px solid ${klasse === k ? C.see : C.linie}`,
                background: klasse === k ? C.see : C.weiss, color: klasse === k ? C.weiss : C.tinte,
                fontSize: 15, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>{k}</button>
          ))}
        </div>

        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 8 }}>Worauf arbeitest du hin?</p>
        <div className="flex flex-wrap" style={{ gap: 6 }}>
          {[["abitur", "Abitur"], ["arbeit", "Nächste Klassenarbeit"], ["luecken", "Lücken schließen"]].map(([id, n]) => (
            <button key={id} onClick={() => setZiel(id)} className="px-4 py-2"
              style={{ borderRadius: 999, border: `1px solid ${ziel === id ? C.see : C.linie}`,
                background: ziel === id ? C.see : C.weiss, color: ziel === id ? C.weiss : C.grau,
                fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>{n}</button>
          ))}
        </div>
      </div>

      <button onClick={speichern} className="w-full"
        style={{ height: 50, background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999,
          fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
        {neu ? "Weiter zur Einstufung" : "Speichern"}
      </button>

      {!neu && (
        <>
          <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginTop: 22 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Dein Lernstand</p>
            {["sicher", "vermutet", "arbeit", "luecke"].map((s) => (
              <div key={s} className="flex justify-between items-center" style={{ marginBottom: 9 }}>
                <span className="flex items-center" style={{ gap: 9, fontSize: 14 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 999, background: STATUS_STIL[s].fuell,
                    border: `2px solid ${STATUS_STIL[s].rand}`, display: "inline-block" }} />
                  {STATUS_STIL[s].name}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{zaehler[s] || 0}</span>
              </div>
            ))}
            <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, marginTop: 6 }}>
              von {AKTIVE.length} Stationen
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <button onClick={() => gehe({ ansicht: "einstufung" })} className="px-5 py-3"
              style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
              Einstufung wiederholen
            </button>
            <button onClick={() => setLoeschen(true)} className="px-5 py-3"
              style={{ background: "transparent", color: C.signal, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
              Lernstand zurücksetzen
            </button>
          </div>
          {loeschen && (
            <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginTop: 16 }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
                Damit werden Profil und alle Einträge auf diesem Gerät gelöscht. Wirklich?
              </p>
              <div className="flex gap-3">
                <button onClick={() => { lernAendern((X) => { PROTOKOLL.length = 0; X.profil = null; X.stand = {}; X.einstufung = null; X.aktivitaet = {}; X.plan = null; X.verlauf = []; X.testFehl = {}; X.messungen = {}; X.experimente = {}; X.noten = []; X.pseudonym = null; X.termine = []; }); setLoeschen(false); }}
                  className="px-5 py-2" style={{ background: C.signal, color: C.weiss, border: "none", borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
                  Ja, löschen
                </button>
                <button onClick={() => setLoeschen(false)} className="px-5 py-2"
                  style={{ background: "transparent", color: C.grau, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <FotoEinwilligungVerwalten />

      <p style={{ fontSize: 12, color: C.hellgrau, fontWeight: 300, lineHeight: 1.7, marginTop: 22 }}>
        Die Daten liegen auf diesem Gerät. Sobald Nutzerkonten verfügbar sind, wandern sie mit deiner Zustimmung
        in dein Konto und sind dann auf jedem Gerät da.
      </p>
    </div>
  );
}

/* ---------- Einstufung ---------- */

/* Beginnt bei den tragenden Kompetenzen unterhalb der eigenen Klasse.
   Richtig: die Kompetenz ist sicher, alle ihre Voraussetzungen vermutlich auch.
   Falsch: eine Lücke — und die Suche steigt zu den Voraussetzungen hinab. */

export function naechsteAnkerDarunter(id, gefragt) {
  const gefunden = [], besucht = new Set();
  const schlange = [...(KOMP[id]?.voraus || [])];
  while (schlange.length) {
    const v = schlange.shift();
    if (besucht.has(v)) continue;
    besucht.add(v);
    if (DIAG[v] && !gefragt.has(v)) gefunden.push(v);
    else if (!DIAG[v]) schlange.push(...(KOMP[v]?.voraus || []));
  }
  return gefunden.sort((a, b) => GEWICHT[b] - GEWICHT[a]);
}

/* Oben anfangen: Wer eine tiefe Kompetenz der eigenen Stufe kann, kann
   vermutlich alles darunter. Abgestiegen wird nur, wo etwas nicht sitzt. */

export function startAnker(klasse) {
  const eigene = STUFE_INDEX[stufeVonKlasse(klasse)];
  // Jede der fünf Linien wird mindestens einmal angefasst — mit ihrer tiefsten
  // Kompetenz auf der eigenen Stufe, notfalls ein oder zwei Stufen darunter.
  const auswahl = [];
  LINIEN.forEach((idee) => {
    for (let i = eigene; i >= Math.max(0, eigene - 2); i--) {
      const kand = ANKER
        .filter((id) => KOMP[id].idee === idee.id && STUFE_INDEX[KOMP[id].stufe] === i)
        .sort((a, b) => TIEFE[b] - TIEFE[a]);
      if (kand.length) { auswahl.push(kand[0]); break; }
    }
  });
  const rest = ANKER
    .filter((id) => STUFE_INDEX[KOMP[id].stufe] === eigene && !auswahl.includes(id))
    .sort((a, b) => TIEFE[b] - TIEFE[a]);
  return [...auswahl, ...rest].slice(0, 8);
}

/* Nachprüfen: Kompetenzen, über die nach der Hauptsuche noch nichts bekannt
   ist — weder geprüft noch aus einer richtigen Antwort erschlossen. */

export function nachPruefen(erg, klasse, gefragt) {
  const eigene = STUFE_INDEX[stufeVonKlasse(klasse)];
  const abgedeckt = new Set();
  Object.entries(erg).forEach(([id, ok]) => { if (ok) alleVoraussetzungen(id).forEach((v) => abgedeckt.add(v)); });
  return ANKER
    .filter((id) => !gefragt.has(id) && !abgedeckt.has(id)
      && STUFE_INDEX[KOMP[id].stufe] >= eigene - 2 && STUFE_INDEX[KOMP[id].stufe] <= eigene)
    .sort((a, b) => STUFE_INDEX[KOMP[b].stufe] - STUFE_INDEX[KOMP[a].stufe] || TIEFE[b] - TIEFE[a]);
}


export function Einstufung({ gehe }) {
  const L = useLern();
  const [phase, setPhase] = useState("start");
  const [schlange, setSchlange] = useState([]);
  const [gefragt, setGefragt] = useState(new Set());
  const [aktuell, setAktuell] = useState(null);
  const [aufgabe, setAufgabe] = useState(null);
  const [eingabe, setEingabe] = useState("");
  const [ergebnisse, setErgebnisse] = useState({});
  const [tastatur, setTastatur] = useState(false);

  const klasse = L.profil?.klasse || 11;

  const naechste = (q, g, erg) => {
    let rest = q.filter((id) => !g.has(id));
    if (!rest.length) rest = nachPruefen(erg, klasse, g);
    if (!rest.length || g.size >= EINSTUFUNG_MAX) { abschliessen(erg); return; }
    const id = rest[0];
    setAktuell(id);
    setAufgabe(DIAG[id]());
    setEingabe("");
    setSchlange(rest.slice(1));
  };

  const starten = () => {
    const q = startAnker(klasse);
    setGefragt(new Set()); setErgebnisse({});
    setPhase("frage");
    naechste(q, new Set(), {});
  };

  const antworten = (weiss) => {
    const ok = weiss && diagPruefen(aufgabe, eingabe);
    const g = new Set(gefragt); g.add(aktuell);
    const erg = { ...ergebnisse, [aktuell]: ok };
    let q = [...schlange];
    if (!ok) {
      const darunter = naechsteAnkerDarunter(aktuell, g).filter((id) => !q.includes(id));
      q = [...darunter, ...q];
    }
    setGefragt(g); setErgebnisse(erg);
    naechste(q, g, erg);
  };

  const abschliessen = (erg) => {
    lernAendern((X) => {
      Object.entries(erg).forEach(([id, ok]) => {
        if (ok) {
          X.stand[id] = { ...(X.stand[id] || {}), status: "sicher", zuletzt: Date.now(),
            festigung: Math.max(X.stand[id]?.festigung || 0, 1), faellig: Date.now() + 3 * 86400000 };
          alleVoraussetzungen(id).forEach((v) => {
            if (erg[v] === undefined && !["sicher", "luecke"].includes(X.stand[v]?.status))
              X.stand[v] = { ...(X.stand[v] || {}), status: "vermutet" };
          });
        } else {
          X.stand[id] = { ...(X.stand[id] || {}), status: "luecke", zuletzt: Date.now() };
        }
      });
      X.einstufung = { am: Date.now(), gefragt: Object.keys(erg).length, richtig: Object.values(erg).filter(Boolean).length };
    });
    setPhase("ende");
  };

  if (!L.profil) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
          Für die Einstufung brauchen wir zuerst deine Klassenstufe.
        </p>
        <button onClick={() => gehe({ ansicht: "profil2" })} className="w-full"
          style={{ height: 50, background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Profil anlegen
        </button>
      </div>
    );
  }

  if (phase === "start") {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.6, marginBottom: 12 }}>
          {L.profil.name}, in etwa zehn Minuten wissen wir, wo du wirklich stehst.
        </p>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 12 }}>
          Die Einstufung beginnt bei dem, was du in Klasse {klasse} können solltest. Stimmt eine Antwort nicht,
          geht sie gezielt einen Schritt zurück — dorthin, wo die Lücke tatsächlich beginnt. Denn wer bei der
          Kurvendiskussion scheitert, scheitert selten an der Kurvendiskussion.
        </p>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 22 }}>
          Höchstens {EINSTUFUNG_MAX} Aufgaben. Rechne auf Papier, trag nur das Ergebnis ein.
          Wenn du etwas nicht weißt, sag es — Raten verfälscht nur deinen Lernpfad.
        </p>
        <button onClick={starten} className="w-full"
          style={{ height: 50, background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Einstufung starten
        </button>
      </div>
    );
  }

  if (phase === "frage" && aufgabe) {
    const k = KOMP[aktuell];
    const idee = LEITIDEEN.find((i) => i.id === k.idee);
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <div className="flex justify-between items-baseline mb-2">
          <span style={{ fontSize: 12.5, fontWeight: 600, color: idee.farbe }}>{k.titel}</span>
          <span style={{ fontSize: 12, color: C.hellgrau }}>Aufgabe {gefragt.size + 1} von höchstens {EINSTUFUNG_MAX}</span>
        </div>
        <div style={{ height: 5, background: C.himmel, borderRadius: 999, marginBottom: 18 }}>
          <div style={{ height: 5, borderRadius: 999, background: C.see, width: `${(gefragt.size / EINSTUFUNG_MAX) * 100}%` }} />
        </div>

        <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
          <p style={{ fontSize: 12, color: C.hellgrau, marginBottom: 8 }}>{STUFEN.find((s) => s.id === k.stufe).name}</p>
          <Text s={aufgabe.frage} style={{ fontSize: 17, lineHeight: 1.85, marginBottom: 16 }} />

          {tastatur && aufgabe.art === "term" ? (
            <TermTastatur wert={eingabe} setWert={setEingabe} />
          ) : (
            <input value={eingabe} onChange={(e) => setEingabe(e.target.value)} placeholder="Ergebnis"
              style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", fontSize: 17, fontFamily: "inherit",
                border: `1.5px solid ${C.linie}`, borderRadius: 12, outline: "none" }} />
          )}
          {aufgabe.art === "term" && (
            <button onClick={() => setTastatur(!tastatur)} className="mt-2"
              style={{ background: "none", border: "none", color: C.see, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              {tastatur ? "Lieber selbst tippen" : "Tastenfeld benutzen"}
            </button>
          )}
          {aufgabe.hinweis && (
            <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, marginTop: 8 }}>{aufgabe.hinweis}</p>
          )}

          <div className="flex flex-wrap gap-3 mt-5">
            <button onClick={() => antworten(true)} disabled={!eingabe.trim()} className="px-6 py-3"
              style={{ background: eingabe.trim() ? C.gruenDunkel : C.hellgrau, color: C.weiss, border: "none",
                borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: eingabe.trim() ? "pointer" : "default" }}>
              Weiter
            </button>
            <button onClick={() => antworten(false)} className="px-6 py-3"
              style={{ background: C.weiss, color: C.grau, border: `1px solid ${C.linie}`, borderRadius: 999,
                fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
              Weiß ich nicht
            </button>
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, lineHeight: 1.7, marginTop: 14 }}>
          Während der Einstufung gibt es keine Rückmeldung zu einzelnen Aufgaben — sonst würdest du beim Rechnen lernen,
          und das Ergebnis wäre zu gut.
        </p>
      </div>
    );
  }

  // Ergebnis
  const gesamt = Object.keys(ergebnisse).length;
  const richtig = Object.values(ergebnisse).filter(Boolean).length;
  const luecken = Object.entries(ergebnisse).filter(([, ok]) => !ok).map(([id]) => KOMP[id])
    .sort((a, b) => STUFE_INDEX[a.stufe] - STUFE_INDEX[b.stufe]);
  const start = naechsteKompetenz(L.profil, L.stand);

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 18, padding: 24, marginBottom: 18 }}>
        <p style={{ fontSize: 12, letterSpacing: "1.4px", color: C.gruen, fontWeight: 600, marginBottom: 10 }}>EINSTUFUNG ABGESCHLOSSEN</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: C.weiss, lineHeight: 1.35 }}>
          {richtig} von {gesamt} Kompetenzen sitzen.
        </p>
        <p style={{ fontSize: 14.5, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.75, marginTop: 10 }}>
          {luecken.length === 0
            ? "Keine Lücke gefunden. Du kannst direkt auf deiner Stufe weitermachen."
            : `Die tiefste Lücke liegt in ${STUFEN.find((s) => s.id === luecken[0].stufe).name}. Dort fängt dein Weg an — nicht bei der Klassenarbeit, sondern bei dem, worauf sie aufbaut.`}
        </p>
      </div>

      {luecken.length > 0 && (
        <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.signal, marginBottom: 12 }}>Gefundene Lücken</p>
          {luecken.map((k) => (
            <div key={k.id} className="flex justify-between" style={{ marginBottom: 9, gap: 10 }}>
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>{k.titel}</span>
              <span style={{ fontSize: 12, color: C.hellgrau, whiteSpace: "nowrap" }}>{STUFEN.find((s) => s.id === k.stufe).name}</span>
            </div>
          ))}
        </div>
      )}

      {start && (
        <div style={{ borderLeft: `4px solid ${C.gruenDunkel}`, paddingLeft: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 4 }}>Dein Startpunkt</p>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{start.titel}</p>
          <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>{start.kann}</p>
        </div>
      )}

      <button onClick={() => gehe({ ansicht: "karte" })} className="w-full"
        style={{ height: 50, background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
        Zur Lernlandkarte
      </button>
    </div>
  );
}

/* ---------- Lernlandkarte ---------- */

/* Jede Leitidee ist eine Linie wie im Liniennetzplan, jede Kompetenz eine
   Station. Man sieht auf einen Blick, auf welcher Linie die Lücken liegen. */
/* Vorausblick: Welche späteren Stationen knüpfen an diese an? */

export function BrueckenListe({ titel, eintraege, waehlen, stand }) {
  if (!eintraege.length) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: C.grau, marginBottom: 8 }}>{titel}</p>
      {eintraege.map((e, i) => {
        const k = KOMP[e.id];
        if (!k || k.versteckt) return null;
        const linie = LINIEN.find((l) => l.id === k.idee);
        const st = STATUS_STIL[statusVon(stand, e.id)];
        return (
          <button key={i} onClick={() => waehlen(e.id)}
            style={{ display: "block", width: "100%", textAlign: "left", background: C.himmel, border: "none",
              borderLeft: `3px solid ${linie?.farbe || C.see}`, borderRadius: 10, padding: "10px 12px", marginBottom: 6,
              cursor: "pointer", fontFamily: "inherit" }}>
            <span className="flex items-center" style={{ gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: linie?.farbe }}>{linie?.kurz}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: C.tinte }}>{k.titel}</span>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: st.fuell, border: `1.8px solid ${st.rand}`, marginLeft: "auto", flexShrink: 0 }} />
            </span>
            <span style={{ display: "block", fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>{e.satz}</span>
          </button>
        );
      })}
    </div>
  );
}

/* Zwei Liniennetze — Algebra und Funktionen — mit je vier Niveaubändern. */

export function Liniennetz({ bereich, stand, auswahl, naechste, waehlen }) {
  const linien = LINIEN.filter((l) => l.bereich === bereich.id);
  const B = 340, links = 34, rechts = 20;
  const abstand = linien.length > 1 ? (B - links - rechts) / (linien.length - 1) : 0;
  const spX = linien.map((_, i) => links + i * abstand);
  const reihe = 21, kopf = 24;
  const baender = STUFEN.map((s) => {
    const pro = linien.map((l) => AKTIVE.filter((k) => k.stufe === s.id && k.idee === l.id));
    return { s, pro, hoehe: kopf + Math.max(...pro.map((p) => p.length), 1) * reihe + 4 };
  });
  const lage = {};
  let y0 = 30;
  baender.forEach((b) => {
    b.y = y0;
    b.pro.forEach((liste, li) => liste.forEach((k, ki) => { lage[k.id] = { x: spX[li], y: y0 + kopf + ki * reihe }; }));
    y0 += b.hoehe;
  });
  const H = y0 + 6;

  return (
    <div style={{ background: C.weiss, borderRadius: 18, padding: "16px 8px 10px", boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 16 }}>
      <div style={{ padding: "0 10px 10px" }}>
        <p style={{ fontSize: 11.5, letterSpacing: "1.4px", color: C.gruenDunkel, fontWeight: 600, marginBottom: 4 }}>BEREICH {bereich.id}</p>
        <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>{bereich.name}</p>
        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 6 }}>{bereich.untertitel}</p>
        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.65, fontStyle: "italic" }}>{bereich.leitsatz}</p>
      </div>
      <svg viewBox={`0 0 ${B} ${H}`} style={{ width: "100%", display: "block" }}>
        {linien.map((l, li) => (
          <text key={l.id} x={spX[li]} y="16" fontSize="9.5" fill={l.farbe} textAnchor="middle" fontWeight="700">{l.kurz}</text>
        ))}
        {baender.map((b, bi) => (
          <g key={b.s.id}>
            <rect x="3" y={b.y} width={B - 6} height={b.hoehe - 3} rx="10" fill={bi % 2 ? "#F3F7FC" : "#FFFFFF"} stroke={C.linie} strokeWidth="0.8" />
            <text x="9" y={b.y + 14} fontSize="8" fill={C.hellgrau} fontWeight="600">{b.s.name}</text>
          </g>
        ))}
        {linien.map((l) => {
          const pts = AKTIVE.filter((k) => k.idee === l.id).map((k) => lage[k.id]).filter(Boolean);
          return pts.length > 1 ? <polyline key={l.id} points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none" stroke={l.farbe} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" /> : null;
        })}
        {auswahl && lage[auswahl] && (KOMP[auswahl].rueck || []).map((r, i) => {
          const a = lage[r.id], b = lage[auswahl];
          if (!a || !b) return null;
          return <path key={i} d={`M ${a.x} ${a.y} Q ${(a.x + b.x) / 2 + 18} ${(a.y + b.y) / 2} ${b.x} ${b.y}`}
            fill="none" stroke={C.gruenDunkel} strokeWidth="1.6" strokeDasharray="4 3" opacity="0.8" />;
        })}
        {AKTIVE.filter((k) => lage[k.id]).map((k) => {
          const p = lage[k.id], st = STATUS_STIL[statusVon(stand, k.id)];
          const gewaehlt = auswahl === k.id, dran = naechste && naechste.id === k.id;
          const verbunden = auswahl && (KOMP[auswahl].rueck || []).some((r) => r.id === k.id);
          return (
            <g key={k.id} onClick={() => waehlen(k.id)} style={{ cursor: "pointer" }}>
              {dran && <circle cx={p.x} cy={p.y} r="11" fill="none" stroke={C.gruenDunkel} strokeWidth="1.6" className="pulsieren" />}
              <circle cx={p.x} cy={p.y} r={gewaehlt ? 8 : verbunden ? 7.5 : 6.2} fill={st.fuell}
                stroke={gewaehlt ? C.tinte : verbunden ? C.gruenDunkel : st.rand} strokeWidth={gewaehlt || verbunden ? 2.4 : 2} />
            </g>
          );
        })}
      </svg>
      <div style={{ padding: "8px 10px 2px" }}>
        {linien.map((l) => (
          <div key={l.id} className="flex" style={{ gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.weiss, background: l.farbe, borderRadius: 5, padding: "2px 6px", height: 18, flexShrink: 0 }}>{l.kurz}</span>
            <span style={{ fontSize: 12.5, lineHeight: 1.5 }}>
              <b style={{ fontWeight: 600 }}>{l.name}</b>
              <span style={{ color: C.grau, fontWeight: 300 }}> — {l.satz}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


export function Lernlandkarte({ gehe }) {
  const L = useLern();
  const [auswahl, setAuswahl] = useState(null);
  const [stufe, setStufe] = useState(null);
  const detailRef = useRef(null);
  const stand = L.stand;
  const naechste = naechsteKompetenz(L.profil, stand);

  const waehlen = (id) => {
    setAuswahl(id);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const zaehler = AKTIVE.reduce((z, k) => { const s = statusVon(stand, k.id); z[s] = (z[s] || 0) + 1; return z; }, {});
  const getragen = (zaehler.sicher || 0) + (zaehler.vermutet || 0);
  const k = auswahl ? KOMP[auswahl] : null;

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      {/* Zusammenfassung */}
      <div style={{ background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 16 }}>
        <div className="flex justify-between items-baseline" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.see }}>
            {L.profil ? `${L.profil.name} · Klasse ${L.profil.klasse}` : "Noch kein Profil"}
          </span>
          <span style={{ fontSize: 13, color: C.grau }}>{getragen} von {AKTIVE.length}</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: C.himmel, overflow: "hidden", display: "flex" }}>
          {["sicher", "vermutet", "arbeit", "luecke"].map((s) => (
            <div key={s} style={{ width: `${((zaehler[s] || 0) / AKTIVE.length) * 100}%`,
              background: s === "sicher" ? C.see : s === "vermutet" ? "#8FB1DD" : s === "arbeit" ? C.gruenDunkel : C.signal }} />
          ))}
        </div>
        {naechste && (
          <button onClick={() => waehlen(naechste.id)} className="kachel w-full mt-4"
            style={{ display: "block", textAlign: "left", background: C.himmel, border: "none", borderRadius: 14,
              padding: "12px 14px", cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ display: "block", fontSize: 12, color: C.gruenDunkel, fontWeight: 600, marginBottom: 3 }}>Als Nächstes dran</span>
            <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: C.tinte }}>{naechste.titel}</span>
          </button>
        )}
        {!L.einstufung && (
          <button onClick={() => gehe({ ansicht: L.profil ? "einstufung" : "profil2" })} className="w-full mt-3"
            style={{ height: 44, background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999,
              fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            {L.profil ? "Einstufung machen" : "Profil anlegen"}
          </button>
        )}
        <div className="flex flex-wrap justify-center" style={{ gap: 12, marginTop: 14 }}>
          {["sicher", "vermutet", "arbeit", "luecke", "offen"].map((s) => (
            <span key={s} className="flex items-center" style={{ gap: 5, fontSize: 11, color: C.grau }}>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: STATUS_STIL[s].fuell, border: `1.8px solid ${STATUS_STIL[s].rand}`, display: "inline-block" }} />
              {STATUS_STIL[s].name}
            </span>
          ))}
        </div>
      </div>

      <div style={{ borderLeft: `4px solid ${C.gruenDunkel}`, paddingLeft: 16, marginBottom: 18 }}>
        <p style={{ fontSize: 14, lineHeight: 1.75 }}>
          <b>Vorwärts rechnen, rückwärts lösen.</b>{" "}
          <span style={{ color: C.grau, fontWeight: 300 }}>
            Wer eine Rechnung vorwärts kann, lernt sie rückwärts zu lesen — so entstehen Gleichungen, neue Zahlen und
            am Ende sogar das Integral. Tippe eine Station an: Gestrichelt siehst du, woran sie anknüpft.
          </span>
        </p>
      </div>

      {BEREICHE.map((b) => (
        <Liniennetz key={b.id} bereich={b} stand={stand} auswahl={auswahl} naechste={naechste} waehlen={waehlen} />
      ))}

      <div ref={detailRef} />
      {k && !k.versteckt && (() => {
        const st = statusVon(stand, k.id);
        const linie = LINIEN.find((l) => l.id === k.idee);
        const s2 = stand[k.id];
        const niveau = STUFEN.find((s) => s.id === k.stufe);
        return (
          <div className="auftauchen" style={{ background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.1)", marginBottom: 16, borderTop: `4px solid ${linie.farbe}` }}>
            <p style={{ fontSize: 12, color: linie.farbe, fontWeight: 600, marginBottom: 6 }}>
              {linie.kurz} · {linie.name} · {niveau.name}
            </p>
            <p style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8 }}>{k.titel}</p>
            <p style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: 12 }}>{k.kann}</p>

            <span className="px-3 py-1" style={{ display: "inline-block", borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: STATUS_STIL[st].fuell, color: STATUS_STIL[st].text, border: `1.5px solid ${STATUS_STIL[st].rand}` }}>
              {STATUS_STIL[st].name}
            </span>
            {s2 && s2.festigung > 0 && (
              <div className="flex items-center" style={{ gap: 8, marginTop: 10 }}>
                <span className="flex" style={{ gap: 3 }}>
                  {SR_ABSTAENDE.map((_, i) => (
                    <span key={i} style={{ width: 8, height: 8, borderRadius: 999, background: i < s2.festigung ? C.see : C.linie }} />
                  ))}
                </span>
                <span style={{ fontSize: 12, color: C.grau }}>Festigung · nächste Wiederholung {wannFaellig(s2.faellig)}</span>
              </div>
            )}

            <BrueckenListe titel="Das kennst du schon" eintraege={k.rueck || []} waehlen={waehlen} stand={stand} />
            <BrueckenListe titel="Das brauchst du wieder bei" eintraege={VORAUSBLICK[k.id] || []} waehlen={waehlen} stand={stand} />

            {k.buch && (
              <div style={{ background: "#F3F7FC", borderRadius: 12, padding: "10px 12px", marginTop: 16 }}>
                <p style={{ fontSize: 11.5, fontWeight: 600, color: C.see, marginBottom: 3 }}>Im Schulbuch · Lambacher Schweizer</p>
                {buchVerweis(k.buch).map((z, i) => <p key={i} style={{ fontSize: 13, color: C.tinte, lineHeight: 1.6 }}>{z}</p>)}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-5">
              {hatEinheit(k.id) ? (
                <>
                  <button onClick={() => gehe({ ansicht: "einheit", kompetenz: k.id })} className="px-6 py-3"
                    style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                    {EINHEITEN[k.id] ? "Lerneinheit starten" : "Üben und testen"}
                  </button>
                  {k.ziel && (
                    <button onClick={() => gehe(k.ziel)} className="px-6 py-3"
                      style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
                      Zum Werkzeug
                    </button>
                  )}
                </>
              ) : k.ziel ? (
                <button onClick={() => gehe(k.ziel)} className="px-6 py-3"
                  style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                  Jetzt lernen
                </button>
              ) : (
                <p style={{ fontSize: 13, color: C.hellgrau, fontWeight: 300, lineHeight: 1.7 }}>
                  Für diese Station entsteht das Lernmaterial gerade.
                </p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Liste nach Niveaus */}
      <div className="flex gap-2 mb-3" style={{ overflowX: "auto" }}>
        {[{ id: null, name: "Alle" }, ...STUFEN].map((s) => (
          <button key={s.id || "alle"} onClick={() => setStufe(s.id)} className="px-4 py-2"
            style={{ flexShrink: 0, background: stufe === s.id ? C.see : C.weiss, color: stufe === s.id ? C.weiss : C.grau,
              border: `1px solid ${stufe === s.id ? C.see : C.linie}`, borderRadius: 999, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
            {s.name}
          </button>
        ))}
      </div>
      {STUFEN.filter((s) => !stufe || s.id === stufe).map((s) => (
        <div key={s.id} style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>
            {s.name} <span style={{ color: C.hellgrau, fontWeight: 300 }}>· {s.klassen}</span>
          </p>
          {AKTIVE.filter((k2) => k2.stufe === s.id).map((k2) => {
            const st = STATUS_STIL[statusVon(stand, k2.id)];
            const linie = LINIEN.find((l) => l.id === k2.idee);
            return (
              <button key={k2.id} onClick={() => waehlen(k2.id)} className="kachel w-full"
                style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%",
                  background: C.weiss, border: `1px solid ${auswahl === k2.id ? C.see : C.linie}`, borderRadius: 12,
                  padding: "10px 14px", marginBottom: 6, cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: C.weiss, background: linie.farbe, borderRadius: 5, padding: "2px 5px", flexShrink: 0 }}>{linie.kurz}</span>
                <span style={{ flex: 1, fontSize: 14, color: C.tinte, lineHeight: 1.4 }}>{k2.titel}</span>
                <span style={{ width: 11, height: 11, borderRadius: 999, background: st.fuell, border: `2px solid ${st.rand}`, flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ======================================================================
   PHASE B · DER LERNZYKLUS
   Einheitliches Format · Visualisierung · Mastery · Wiederholen · Tutorin
   ====================================================================== */

/* ---------- Festigung und Wiederholung ---------- */

/* Abstände in Tagen je Festigungsstufe. Jede richtige Wiederholung schiebt
   die nächste weiter hinaus, jede falsche holt sie zurück. */

export function testBestanden(id) {
  lernAendern((L) => {
    const alt = L.stand[id] || {};
    L.stand[id] = { ...alt, status: "sicher", festigung: Math.max(alt.festigung || 0, 1),
      faellig: faelligIn(SR_ABSTAENDE[0]), zuletzt: Date.now(), test: Date.now() };
    L.testFehl = { ...(L.testFehl || {}), [id]: 0 };
    L.verlauf = [...(L.verlauf || []), { typ: "gesichert", id, zeit: Date.now() }].slice(-400);
  });
}


export function testNichtBestanden(id) {
  lernAendern((L) => {
    const alt = L.stand[id] || {};
    L.stand[id] = { ...alt, status: alt.status === "sicher" ? "sicher" : "arbeit", zuletzt: Date.now() };
    L.testFehl = { ...(L.testFehl || {}), [id]: ((L.testFehl || {})[id] || 0) + 1 };
  });
}


export function wiederholungErgebnis(id, ok) {
  lernAendern((L) => {
    L.verlauf = [...(L.verlauf || []), { typ: "wiederholt", id, ok, zeit: Date.now() }].slice(-400);
    const alt = L.stand[id] || { festigung: 1 };
    const f = alt.festigung || 1;
    if (ok) {
      const nf = Math.min(f + 1, SR_ABSTAENDE.length);
      L.stand[id] = { ...alt, status: "sicher", festigung: nf, faellig: faelligIn(SR_ABSTAENDE[nf - 1]), zuletzt: Date.now() };
    } else {
      L.stand[id] = { ...alt, status: "arbeit", festigung: Math.max(1, f - 1), faellig: faelligIn(1), zuletzt: Date.now() };
    }
  });
}


export function faelligeWiederholungen(stand) {
  const jetzt = Date.now();
  return Object.entries(stand)
    .filter(([id, s]) => s.faellig && s.faellig <= jetzt && hatEinheit(id))
    .sort((a, b) => a[1].faellig - b[1].faellig)
    .map(([id]) => id);
}

/* Brückenwiederholung: Bevor eine neue Station beginnt, wird ihre Vorgängerin fällig.
   Wer übermorgen mit der Ableitung anfängt, wiederholt heute die Geradensteigung.
   Nur Stationen, die bereits tragen und in den letzten drei Tagen nicht geübt wurden. */

export function brueckenWiederholungen(L) {
  if (!L.profil) return [];
  const naechste = naechsteKompetenz(L.profil, L.stand);
  if (!naechste || L.stand[naechste.id]?.status === "sicher") return [];
  const kuerzlich = Date.now() - 3 * TAG_MS;
  const ids = [...new Set([...(naechste.rueck || []).map((r) => r.id), ...naechste.voraus])];
  return ids
    .filter((id) => aktiv(id) && hatEinheit(id) && ["sicher", "vermutet"].includes(L.stand[id]?.status)
      && !((L.stand[id]?.zuletzt || 0) > kuerzlich))
    .slice(0, 2)
    .map((id) => ({ id, fuer: naechste.id }));
}

/* Alles, was heute wiederholt werden sollte: fällige Festigungen und Brücken. */

export function wiederholListe(L) {
  const faellig = faelligeWiederholungen(L.stand).map((id) => ({ id }));
  const schon = new Set(faellig.map((x) => x.id));
  const bruecken = brueckenWiederholungen(L).filter((x) => !schon.has(x.id));
  bruecken.forEach((x) => schon.add(x.id));
  let termin = [];
  try { termin = terminWiederholungenHeute(L).filter((x) => !schon.has(x.id)); } catch (e) { /* ohne Termin */ }
  return [...faellig, ...bruecken, ...termin];
}


export function brueckeErgebnis(id, ok) {
  lernAendern((L) => {
    L.verlauf = [...(L.verlauf || []), { typ: "bruecke", id, ok, zeit: Date.now() }].slice(-400);
    const alt = L.stand[id] || {};
    L.stand[id] = ok ? { ...alt, zuletzt: Date.now() }
      : { ...alt, status: "arbeit", festigung: Math.max(1, (alt.festigung || 1) - 1), faellig: faelligIn(1), zuletzt: Date.now() };
  });
}


export function wannFaellig(ts) {
  if (!ts) return "";
  const tage = Math.round((ts - Date.now()) / TAG_MS);
  if (tage <= 0) return "heute fällig";
  if (tage === 1) return "morgen";
  return `in ${tage} Tagen`;
}

/* ---------- Lerneinheiten ---------- */



export function einheitVon(id) {
  if (EINHEITEN[id]) return EINHEITEN[id];
  if (!DIAG[id]) return null;
  return {
    kurzform: true,
    verstehen: [{ t: "merk", s: KOMP[id].kann }],
    erzeuger: () => { const d = DIAG[id](); return { frage: d.frage, loesung: d.loesung, art: d.art, hinweis: d.hinweis }; },
  };
}

export function antwortPruefen(a, eingabe) {
  if (!eingabe || !String(eingabe).trim()) return false;
  if (a.art === "term") {
    const x = alsFunktion(eingabe), y = alsFunktion(a.loesung);
    return !!x && !!y && stimmtUeberein(x, y, 1e-6);
  }
  const x = zahlAus(eingabe), y = zahlAus(a.loesung);
  return x !== null && y !== null && Math.abs(x - y) < 1e-4 * (1 + Math.abs(y));
}

/* ---------- Visualisierungen ---------- */


export function plotAbbildung(xmin, xmax, ymin, ymax, B = 320, H = 210) {
  const px = (x) => ((x - xmin) / (xmax - xmin)) * B;
  const py = (y) => H - ((y - ymin) / (ymax - ymin)) * H;
  const kurve = (fn, von = xmin, bis = xmax) => {
    let d = "", offen = false;
    for (let i = 0; i <= 300; i++) {
      const x = von + ((bis - von) * i) / 300, y = fn(x);
      if (!isFinite(y) || y < ymin - (ymax - ymin) || y > ymax + (ymax - ymin)) { offen = false; continue; }
      d += `${offen ? "L" : "M"} ${px(x).toFixed(1)} ${py(y).toFixed(1)} `;
      offen = true;
    }
    return d;
  };
  return { px, py, kurve, B, H };
}


export function Achsen({ p, xmin, xmax, ymin, ymax }) {
  const xs = []; for (let x = Math.ceil(xmin); x <= xmax; x++) xs.push(x);
  const ys = []; const sy = ymax - ymin > 12 ? 2 : 1; for (let y = Math.ceil(ymin / sy) * sy; y <= ymax; y += sy) ys.push(y);
  return (
    <g>
      {xs.map((x) => <line key={`gx${x}`} x1={p.px(x)} y1="0" x2={p.px(x)} y2={p.H} stroke={C.linie} strokeWidth="0.8" />)}
      {ys.map((y) => <line key={`gy${y}`} x1="0" y1={p.py(y)} x2={p.B} y2={p.py(y)} stroke={C.linie} strokeWidth="0.8" />)}
      <line x1="0" y1={p.py(0)} x2={p.B} y2={p.py(0)} stroke={C.hellgrau} strokeWidth="1.3" />
      <line x1={p.px(0)} y1="0" x2={p.px(0)} y2={p.H} stroke={C.hellgrau} strokeWidth="1.3" />
    </g>
  );
}


export function Schieber({ name, wert, min, max, schritt, setzen, anzeige }) {
  return (
    <div className="flex items-center" style={{ gap: 10, marginTop: 10 }}>
      <span style={{ width: 34, fontSize: 13.5, fontWeight: 500, flexShrink: 0 }}><M t={name} /></span>
      <input type="range" min={min} max={max} step={schritt} value={wert}
        onChange={(e) => setzen(Number(e.target.value))} style={{ flex: 1, minWidth: 0, accentColor: C.see }} />
      <span style={{ width: 48, textAlign: "right", fontSize: 14, fontWeight: 600, color: C.see }}>{anzeige ?? wert}</span>
    </div>
  );
}


export function VisSekante() {
  const [h, setH] = useState(1.6);
  const x0 = 1, f = (x) => x * x;
  const xmin = -0.6, xmax = 3.4, ymin = -1, ymax = 10;
  const p = plotAbbildung(xmin, xmax, ymin, ymax);
  const m = ((x0 + h) ** 2 - 1) / h;
  const gerade = (mm, x1, y1) => `M ${p.px(xmin)} ${p.py(mm * (xmin - x1) + y1)} L ${p.px(xmax)} ${p.py(mm * (xmax - x1) + y1)}`;
  return (
    <div>
      <svg viewBox={`0 0 ${p.B} ${p.H}`} style={{ width: "100%", display: "block" }}>
        <defs><clipPath id="vsek"><rect width={p.B} height={p.H} /></clipPath></defs>
        <Achsen p={p} xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} />
        <g clipPath="url(#vsek)">
          <path d={gerade(2, x0, 1)} stroke={C.gruenDunkel} strokeWidth="1.6" strokeDasharray="6 5" fill="none" opacity="0.8" />
          <path d={gerade(m, x0, 1)} stroke={C.seeHell} strokeWidth="2.2" fill="none" />
          <path d={p.kurve(f)} stroke={C.see} strokeWidth="2.6" fill="none" />
          <circle cx={p.px(x0)} cy={p.py(1)} r="5" fill={C.tinte} />
          <circle cx={p.px(x0 + h)} cy={p.py(f(x0 + h))} r="5" fill={C.seeHell} />
        </g>
      </svg>
      <Schieber name="h" wert={h} min={0.02} max={2.2} schritt={0.02} setzen={setH} anzeige={komma(h)} />
      <p style={{ fontSize: 14, lineHeight: 1.7, marginTop: 10 }}>
        Sekantensteigung <M t={`\\frac{f(1+h) - f(1)}{h} = 2 + h = ${komma(m)}`} />
      </p>
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>
        Gestrichelt die Tangente mit Steigung 2 — dorthin läuft die Sekante, wenn h gegen null geht.
      </p>
    </div>
  );
}


export function VisTangente() {
  const [n, setN] = useState(2);
  const [x0, setX0] = useState(1);
  const f = (x) => x ** n, m = n * x0 ** (n - 1);
  const xmin = -2.4, xmax = 2.4, ymin = n === 2 ? -1 : -6, ymax = n === 2 ? 6 : 6;
  const p = plotAbbildung(xmin, xmax, ymin, ymax);
  const y0 = f(x0);
  return (
    <div>
      <div className="flex gap-2 mb-2">
        {[2, 3].map((k) => (
          <button key={k} onClick={() => setN(k)} className="px-4 py-1.5"
            style={{ borderRadius: 999, border: `1px solid ${n === k ? C.see : C.linie}`, background: n === k ? C.see : C.weiss,
              color: n === k ? C.weiss : C.grau, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
            <M t={`x^${k}`} />
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${p.B} ${p.H}`} style={{ width: "100%", display: "block" }}>
        <defs><clipPath id="vtan"><rect width={p.B} height={p.H} /></clipPath></defs>
        <Achsen p={p} xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} />
        <g clipPath="url(#vtan)">
          <path d={`M ${p.px(xmin)} ${p.py(m * (xmin - x0) + y0)} L ${p.px(xmax)} ${p.py(m * (xmax - x0) + y0)}`}
            stroke={C.gruenDunkel} strokeWidth="2" fill="none" />
          <path d={p.kurve(f)} stroke={C.see} strokeWidth="2.6" fill="none" />
          <circle cx={p.px(x0)} cy={p.py(y0)} r="5.5" fill={C.tinte} />
        </g>
      </svg>
      <Schieber name="x_0" wert={x0} min={-2} max={2} schritt={0.05} setzen={setX0} anzeige={komma(x0)} />
      <p style={{ fontSize: 14, lineHeight: 1.7, marginTop: 10 }}>
        Tangentensteigung <M t={`f′(${komma(x0)}) = ${n} \\cdot ${komma(x0)}${n === 3 ? "^2" : ""} = ${komma(m)}`} />
      </p>
    </div>
  );
}


export function VisParabel() {
  const [a, setA] = useState(1);
  const [xs, setXs] = useState(1);
  const [ys, setYs] = useState(-2);
  const f = (x) => a * (x - xs) ** 2 + ys;
  const xmin = -5, xmax = 5, ymin = -7, ymax = 7;
  const p = plotAbbildung(xmin, xmax, ymin, ymax);
  const b = -2 * a * xs, c = a * xs * xs + ys;
  return (
    <div>
      <svg viewBox={`0 0 ${p.B} ${p.H}`} style={{ width: "100%", display: "block" }}>
        <defs><clipPath id="vpar"><rect width={p.B} height={p.H} /></clipPath></defs>
        <Achsen p={p} xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} />
        <g clipPath="url(#vpar)">
          <line x1={p.px(xs)} y1="0" x2={p.px(xs)} y2={p.H} stroke={C.gruenDunkel} strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
          <path d={p.kurve(f)} stroke={C.see} strokeWidth="2.6" fill="none" />
          <circle cx={p.px(xs)} cy={p.py(ys)} r="6" fill={C.gruenDunkel} />
        </g>
      </svg>
      <div className="flex flex-wrap gap-2 mt-2">
        {[-2, -1, -0.5, 0.5, 1, 2].map((k) => (
          <button key={k} onClick={() => setA(k)} className="px-3 py-1"
            style={{ borderRadius: 999, border: `1px solid ${a === k ? C.see : C.linie}`, background: a === k ? C.see : C.weiss,
              color: a === k ? C.weiss : C.grau, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
            a = {komma(k)}
          </button>
        ))}
      </div>
      <Schieber name="x_s" wert={xs} min={-3} max={3} schritt={0.5} setzen={setXs} anzeige={komma(xs)} />
      <Schieber name="y_s" wert={ys} min={-5} max={5} schritt={0.5} setzen={setYs} anzeige={komma(ys)} />
      <p style={{ fontSize: 14, lineHeight: 1.9, marginTop: 10 }}>
        <M t={`f(x) = ${komma(a)}(x - ${komma(xs)})^2 + ${komma(ys)}`} /><br />
        <span style={{ color: C.grau }}>ausmultipliziert </span>
        <M t={`${komma(a)}x^2 + ${komma(b)}x + ${komma(c)}`} />
      </p>
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>
        Der rote Punkt ist {a > 0 ? "ein Tiefpunkt" : "ein Hochpunkt"} — weil a {a > 0 ? "positiv" : "negativ"} ist.
      </p>
    </div>
  );
}


export function VisIntegral() {
  const [b, setB] = useState(2.5);
  const [n, setN] = useState(6);
  const f = (x) => 0.5 * x * x + 1;
  const xmin = -0.4, xmax = 3.4, ymin = -0.6, ymax = 7;
  const p = plotAbbildung(xmin, xmax, ymin, ymax);
  const dx = b / n;
  let summe = 0;
  const rechtecke = [];
  for (let i = 0; i < n; i++) {
    const x = i * dx, y = f(x + dx / 2);
    summe += y * dx;
    rechtecke.push(<rect key={i} x={p.px(x)} y={p.py(y)} width={p.px(x + dx) - p.px(x)} height={p.py(0) - p.py(y)}
      fill={C.seeHell} opacity="0.35" stroke={C.see} strokeWidth="0.6" />);
  }
  const exakt = b ** 3 / 6 + b;
  return (
    <div>
      <svg viewBox={`0 0 ${p.B} ${p.H}`} style={{ width: "100%", display: "block" }}>
        <Achsen p={p} xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} />
        {rechtecke}
        <path d={p.kurve(f)} stroke={C.see} strokeWidth="2.6" fill="none" />
        <line x1={p.px(b)} y1={p.py(0)} x2={p.px(b)} y2={p.py(f(b))} stroke={C.gruenDunkel} strokeWidth="1.8" />
      </svg>
      <Schieber name="b" wert={b} min={0.5} max={3.2} schritt={0.1} setzen={setB} anzeige={komma(b, 1)} />
      <Schieber name="n" wert={n} min={2} max={40} schritt={1} setzen={setN} />
      <p style={{ fontSize: 14, lineHeight: 1.9, marginTop: 10 }}>
        Rechtecksumme <b>{komma(summe, 3)}</b> · exakt <M t={`\\int_0^{${komma(b, 1)}} f(x)\\,dx = ${komma(exakt, 3)}`} />
      </p>
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>
        Mehr Rechtecke, kleinerer Fehler: bei n = {n} liegt er bei {komma(Math.abs(summe - exakt), 3)}.
      </p>
    </div>
  );
}

FR.VisSekante = VisSekante;
FR.VisTangente = VisTangente;
FR.VisParabel = VisParabel;
FR.VisIntegral = VisIntegral;

