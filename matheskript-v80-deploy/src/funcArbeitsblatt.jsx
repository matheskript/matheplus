/* ======================================================================
   LEHRER-ARBEITSBLATT-GENERATOR (/lehrkraefte/arbeitsblatt)
   Lehrkraft wählt Klasse → Kapitel → Unterthemen, stellt das Blatt ein
   (Anzahl, Schwierigkeit, Gruppe A/B, Rechenraum blanko oder kompakt,
   Lösungsweg oder nur Ergebnisse) und bekommt ein PDF mit Aufgaben- und
   Lösungsblatt. Kostenlos und ohne Konto; mit Konto: Klasse vorbelegen,
   Blätter speichern, eigener Ref-Code im QR-Code.
   Bewusst KEIN Karo-Papier: Rechenraum ist immer blanko (Pen & Paper).
   Logik: arbeitsblatt.js · Speicher: arbeitsblattSpeicher.js · PDF: pdfBloecke.js
   ====================================================================== */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MarkenLogo } from "./markenLogo.jsx";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { SCHULARTEN, SCHULART_STANDARD, klassenBoxen, roemisch } from "./schulbuch.js";
import {
  BUCHSTABEN, NIVEAUS, SCHULFORM_ZU_SCHULART, aufgabeTauschen, blattErstellen, blattSnapshot, blattTitel, boxZuStufe,
  kapitelMitAufgaben, platzFuer, trainingsLink,
} from "./arbeitsblatt.js";
import { blaetterLaden, blattLoeschen, blattSpeichern, einstellungLesen, einstellungSchreiben } from "./arbeitsblattSpeicher.js";
import { useKonto } from "./konto.js";
import { istLehrend } from "./rollenLogik.js";
import { dateiName, pdfAusBloecken } from "./pdfBloecke.js";

const GOLD_VERLAUF = `linear-gradient(135deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`;
const KICKER = { fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gruenDunkel, margin: 0 };
const KARTE = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", padding: "20px 18px" };
const MAX_TEILE = 60;

/* Text mit $…$-Formeln */
export function Tx({ s, style }) {
  const stuecke = String(s ?? "").split("$");
  return <span style={style}>{stuecke.map((t, i) => (i % 2 ? <M key={i} t={t} /> : <span key={i}>{t}</span>))}</span>;
}

/* ---------- Bausteine der Oberfläche ---------- */
function Schritt({ nr, titel, zeile, children }) {
  return (
    <section style={{ ...KARTE, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: zeile ? 4 : 14 }}>
        <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, background: C.seeTief, color: C.flaggold, fontSize: 13, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", transform: "translateY(-2px)" }}>{nr}</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.tinte, letterSpacing: "-0.01em" }}>{titel}</h2>
      </div>
      {zeile && <p style={{ margin: "0 0 14px 36px", fontSize: 13.5, color: C.grau, lineHeight: 1.55 }}>{zeile}</p>}
      {children}
    </section>
  );
}

function Chip({ an, onClick, children, unter, gold, breit, testid }) {
  return (
    <button type="button" aria-pressed={an} onClick={onClick} data-testid={testid}
      style={{ flex: breit ? "1 1 0" : "0 0 auto", minWidth: breit ? 0 : 52, minHeight: 44, padding: "6px 12px", borderRadius: 12, fontFamily: "inherit", cursor: "pointer", lineHeight: 1.2, textAlign: "center",
        border: `2px solid ${an ? (gold ? C.goldWarm : C.see) : C.linie}`, background: an ? (gold ? "#FFF6DA" : C.see) : C.weiss, color: an ? (gold ? C.gruenDunkel : C.weiss) : C.tinte }}>
      <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{children}</span>
      {unter && <span style={{ display: "block", fontSize: 11, fontWeight: 500, opacity: 0.8, marginTop: 2 }}>{unter}</span>}
    </button>
  );
}

function Kaestchen({ zustand }) {   // zustand: "an" | "halb" | "aus"
  return (
    <span aria-hidden="true" style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, border: `2px solid ${zustand === "aus" ? C.hellgrau : C.see}`, background: zustand === "an" ? C.see : C.weiss, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      {zustand === "an" && <svg width="12" height="10" viewBox="0 0 12 10"><path d="M1 5 L4.5 8.5 L11 1.5" stroke={C.weiss} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      {zustand === "halb" && <span style={{ width: 10, height: 2.5, borderRadius: 2, background: C.see }} />}
    </span>
  );
}

function Feld({ label, wert, setze, platzhalter, typ = "text", name }) {
  return (
    <label style={{ display: "block", minWidth: 0 }}>
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: C.grau, marginBottom: 5 }}>{label}</span>
      <input type={typ} name={name} value={wert} placeholder={platzhalter} onChange={(e) => setze(e.target.value)} maxLength={80}
        style={{ width: "100%", boxSizing: "border-box", height: 44, borderRadius: 12, border: `1.5px solid ${C.linie}`, padding: "0 12px", fontFamily: "inherit", fontSize: 15, color: C.tinte, background: C.weiss }} />
    </label>
  );
}

function GoldKnopf({ onClick, disabled, titel, zeile, testid }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} data-testid={testid}
      style={{ width: "100%", minHeight: 58, borderRadius: 999, border: "none", cursor: disabled ? "default" : "pointer", fontFamily: "inherit", background: disabled ? C.linie : GOLD_VERLAUF, color: C.seeTief, padding: "10px 20px", boxShadow: disabled ? "none" : "0 6px 18px rgba(226,181,60,0.35)" }}>
      <span style={{ display: "block", fontSize: 16.5, fontWeight: 800 }}>{titel}</span>
      {zeile && <span style={{ display: "block", fontSize: 12, fontWeight: 600, opacity: 0.8, marginTop: 2 }}>{zeile}</span>}
    </button>
  );
}

function LeiseKnopf({ onClick, children, testid, disabled }) {
  return (
    <button type="button" onClick={onClick} data-testid={testid} disabled={disabled}
      style={{ minHeight: 44, padding: "8px 16px", borderRadius: 999, border: `1.5px solid ${C.see}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  );
}

/* ======================================================================
   Das Blatt selbst – in der Vorschau und (offscreen, 760 px) fürs PDF
   ====================================================================== */
const PX_JE_ZEILE = 32;   // Rechenraum: eine „Zeile“ ≈ 7,8 mm auf A4

function Logo({ gross }) {
  return (
    <MarkenLogo groesse={gross ? 19 : 15} druck />
  );
}

function BlattKopf({ kopf, titel, gruppe, loesung, neueSeite }) {
  const linie = (t, w) => (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: C.grau }}>{t}</span>
      <span style={{ flex: 1, minWidth: w, borderBottom: `1px solid ${C.hellgrau}`, height: 16 }} />
    </span>
  );
  const wert = (t, v) => (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: C.grau }}>{t}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: C.tinte }}>{v}</span>
    </span>
  );
  const unter = [kopf.schule, kopf.lehrkraft].filter((x) => x && x.trim()).join(" · ");
  return (
    <div data-pdf-block data-pdf-mit-naechstem {...(neueSeite ? { "data-pdf-neue-seite": "" } : {})} style={{ background: C.weiss, fontFamily: "Montserrat, sans-serif" }}>
      <div style={{ background: C.seeTief, padding: "13px 26px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderBottom: `3px solid ${C.flaggold}` }}>
        <Logo gross />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: loesung ? C.flaggold : C.goldText, textAlign: "right" }}>
          {loesung ? "Lösungen" : "Arbeitsblatt"}{gruppe ? ` · Gruppe ${gruppe}` : ""}
        </span>
      </div>
      <div style={{ padding: "16px 26px 6px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{titel || "Arbeitsblatt"}</div>
        {unter && <div style={{ fontSize: 12.5, color: C.grau, marginTop: 4 }}>{unter}</div>}
        {!loesung && (
          <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1.2fr", gap: 16, marginTop: 14, alignItems: "end" }}>
            {linie("Name", 80)}
            {kopf.klasse ? wert("Klasse", kopf.klasse) : linie("Klasse", 30)}
            {kopf.datum ? wert("Datum", kopf.datum) : linie("Datum", 40)}
          </div>
        )}
      </div>
    </div>
  );
}

function Tabelle({ t }) {
  const zelle = (inhalt, kopf) => (
    <td style={{ border: `1px solid ${C.hellgrau}`, padding: "5px 12px", minWidth: 34, textAlign: "center", fontSize: 14.5, fontWeight: kopf ? 700 : 500, background: kopf ? C.sand : C.weiss }}>{inhalt}</td>
  );
  return (
    <table style={{ borderCollapse: "collapse", margin: "10px 0 2px" }}>
      <tbody>
        <tr>{t.kopf.map((x, i) => <React.Fragment key={i}>{zelle(<Tx s={x} />, i === 0)}</React.Fragment>)}</tr>
        <tr>{t.zeile.map((x, i) => <React.Fragment key={i}>{zelle(<Tx s={x} />, i === 0)}</React.Fragment>)}</tr>
      </tbody>
    </table>
  );
}

function Optionen({ a }) {
  const kurz = a.optionen.every((o) => String(o).replace(/\$/g, "").length < 26);
  return (
    <div style={{ display: "grid", gridTemplateColumns: kurz ? "repeat(auto-fill, minmax(150px, 1fr))" : "1fr", gap: "8px 18px", marginTop: 10 }}>
      {a.optionen.map((o, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 14.5, lineHeight: 1.5 }}>
          <span aria-hidden="true" style={{ flexShrink: 0, width: 14, height: 14, border: `1.5px solid ${C.tinte}`, borderRadius: 3, marginTop: 4 }} />
          <span><strong style={{ fontWeight: 700 }}>{BUCHSTABEN[i]})</strong> <Tx s={o} /></span>
        </div>
      ))}
    </div>
  );
}

function AufgabeBlock({ a, nr, rechenraum, druck, onTausch }) {
  const hoehe = rechenraum && !a.optionen ? platzFuer(a) * PX_JE_ZEILE : rechenraum ? 18 : 0;
  return (
    <div data-pdf-block style={{ padding: druck ? "12px 26px 4px" : "14px 18px 6px", background: C.weiss, fontFamily: "Montserrat, sans-serif", color: C.tinte, borderTop: druck ? "none" : `1px solid ${C.linie}` }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, background: C.himmel, color: C.see, fontSize: 13.5, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{nr}</span>
        <div style={{ flex: 1, minWidth: 0, fontSize: 15, lineHeight: 1.7 }}>
          <Tx s={a.text} />
          {a.tabelle && <Tabelle t={a.tabelle} />}
          {a.optionen && <Optionen a={a} />}
        </div>
        {onTausch && (
          <button type="button" onClick={onTausch} aria-label={`Aufgabe ${nr} neu würfeln`} data-testid="ab-tauschen"
            style={{ flexShrink: 0, minWidth: 44, minHeight: 36, padding: "4px 10px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            ↻ Neu
          </button>
        )}
      </div>
      {hoehe > 0 && (
        <div aria-hidden="true" style={{ height: hoehe, position: "relative" }}>
          {!druck && rechenraum && !a.optionen && <span style={{ position: "absolute", right: 0, bottom: 6, fontSize: 10.5, color: C.hellgrau, letterSpacing: "0.04em" }}>Platz zum Rechnen</span>}
        </div>
      )}
    </div>
  );
}

function LoesungBlock({ a, nr, nurErgebnis, druck }) {
  return (
    <div data-pdf-block style={{ padding: druck ? "9px 26px" : "10px 18px", background: C.weiss, fontFamily: "Montserrat, sans-serif", color: C.tinte, borderTop: `1px solid ${C.linie}` }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 999, background: "#FFF6DA", color: C.gruenDunkel, fontSize: 12.5, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{nr}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {!nurErgebnis && a.weg.length > 0 && (
            <div style={{ fontSize: 13.5, lineHeight: 1.75, color: C.grau, marginBottom: 4 }}>
              {a.weg.map((z, i) => <div key={i}><Tx s={z} /></div>)}
            </div>
          )}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "3px 12px", borderRadius: 10, background: "#FFF6DA", border: `1px solid ${C.goldWarm}`, fontSize: 14.5, fontWeight: 700, lineHeight: 1.6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gruenDunkel }}>Ergebnis</span>
            <Tx s={a.ergebnis} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Nur Ergebnisse: kompakt in zwei Spalten, ein Block je fünf Aufgaben */
function ErgebnisRaster({ aufgaben, druck }) {
  const stuecke = [];
  for (let i = 0; i < aufgaben.length; i += 6) stuecke.push(aufgaben.slice(i, i + 6).map((a, k) => ({ a, nr: i + k + 1 })));
  return stuecke.map((st, j) => (
    <div key={j} data-pdf-block style={{ padding: druck ? "6px 26px" : "8px 18px", background: C.weiss, fontFamily: "Montserrat, sans-serif", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px 24px" }}>
      {st.map(({ a, nr }) => (
        <div key={nr} style={{ display: "flex", gap: 10, alignItems: "baseline", borderBottom: `1px solid ${C.linie}`, paddingBottom: 6, fontSize: 14.5, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 800, color: C.gruenDunkel, minWidth: 18 }}>{nr}</span>
          <span style={{ fontWeight: 600, color: C.tinte, minWidth: 0 }}><Tx s={a.ergebnis} /></span>
        </div>
      ))}
    </div>
  ));
}

/* Ganzes Blatt (alle Gruppen + Lösungen) fürs PDF, oder eine Ansicht in der Vorschau */
function Blatt({ blatt, kopf, titel, einst, druck, ansicht = "alles", onTausch }) {
  const teile = [];
  const gruppen = blatt.gruppen;
  const zeigeAufgaben = (g, gi) => (
    <React.Fragment key={`a${gi}`}>
      <BlattKopf kopf={kopf} titel={titel} gruppe={g.name} neueSeite={druck && gi > 0} />
      <div data-pdf-block style={{ height: druck ? 6 : 0, background: C.weiss }} />
      {g.aufgaben.map((a, i) => <AufgabeBlock key={i} a={a} nr={i + 1} rechenraum={einst.rechenraum} druck={druck} onTausch={onTausch ? () => onTausch(i) : null} />)}
    </React.Fragment>
  );
  const zeigeLoesungen = (g, gi) => (
    <React.Fragment key={`l${gi}`}>
      <BlattKopf kopf={kopf} titel={titel} gruppe={g.name} loesung neueSeite={druck && (einst.loesung === "weg" || gi === 0)} />
      <div data-pdf-block style={{ height: 8, background: C.weiss }} />
      {einst.loesung === "ergebnis" ? <ErgebnisRaster aufgaben={g.aufgaben} druck={druck} /> : g.aufgaben.map((a, i) => <LoesungBlock key={i} a={a} nr={i + 1} druck={druck} />)}
    </React.Fragment>
  );
  if (ansicht === "alles") {
    gruppen.forEach((g, gi) => teile.push(zeigeAufgaben(g, gi)));
    gruppen.forEach((g, gi) => teile.push(zeigeLoesungen(g, gi)));
  } else if (ansicht.startsWith("aufgaben")) {
    const gi = Number(ansicht.split(":")[1] || 0);
    teile.push(zeigeAufgaben(gruppen[gi], 0));
  } else {
    gruppen.forEach((g, gi) => teile.push(zeigeLoesungen(g, gi)));
  }
  return <div>{teile}</div>;
}

/* ======================================================================
   Seite
   ====================================================================== */
export function ArbeitsblattSeite({ gehe }) {
  const konto = useKonto();
  const profil = konto.profil;
  const angemeldet = !!konto.nutzer && !!profil;
  const lehrend = angemeldet && istLehrend(profil.rolle);
  const gemerkt = useMemo(() => einstellungLesen(), []);

  const [schulart, setSchulart] = useState(gemerkt.schulart || SCHULART_STANDARD);
  const [box, setBox] = useState(gemerkt.box || null);
  const [offen, setOffen] = useState(null);
  const [teile, setTeile] = useState([]);
  const [einst, setEinst] = useState({ anzahl: 10, niveau: "aufsteigend", gruppen: 1, rechenraum: true, loesung: "weg", ...(gemerkt.einst || {}) });
  const [kopf, setKopf] = useState({ schule: "", lehrkraft: "", klasse: "", datum: "", ...(gemerkt.kopf || {}) });
  const [titel, setTitel] = useState("");
  const [titelEigen, setTitelEigen] = useState(false);
  const [blatt, setBlatt] = useState(null);
  const [ansicht, setAnsicht] = useState("aufgaben:0");
  const [pdfLaeuft, setPdfLaeuft] = useState(false);
  const [drucken, setDrucken] = useState(false);
  const [meldung, setMeldung] = useState("");
  const [qrBild, setQrBild] = useState(null);
  const [klassen, setKlassen] = useState([]);
  const [gespeichert, setGespeichert] = useState(null);
  const [speichertGerade, setSpeichertGerade] = useState(false);
  const druckRef = useRef(null);

  /* merken, was die Lehrkraft nicht jedes Mal neu eintippen will */
  useEffect(() => { einstellungSchreiben({ schulart, box, einst, kopf: { schule: kopf.schule, lehrkraft: kopf.lehrkraft, klasse: kopf.klasse } }); }, [schulart, box, einst, kopf]);
  /* Lehrkraft: Name aus dem Konto vorschlagen */
  useEffect(() => { if (lehrend && !kopf.lehrkraft && profil.name) setKopf((k) => ({ ...k, lehrkraft: profil.name })); }, [lehrend]);   // eslint-disable-line react-hooks/exhaustive-deps
  /* eigene Klassen und gespeicherte Blätter laden */
  useEffect(() => {
    let aktiv = true;
    if (lehrend) import("./kontoRollen.js").then((m) => m.klassenUebersicht()).then((l) => { if (aktiv) setKlassen(Array.isArray(l) ? l : []); }).catch(() => {});
    if (angemeldet) blaetterLaden().then((l) => { if (aktiv) setGespeichert(l); }).catch(() => { if (aktiv) setGespeichert([]); });
    return () => { aktiv = false; };
  }, [lehrend, angemeldet]);

  const kapitel = useMemo(() => (box ? kapitelMitAufgaben(schulart, box) : []), [schulart, box]);
  const boxen = klassenBoxen(schulart);
  const autoTitel = teile.length ? blattTitel(teile) : "";
  const titelJetzt = titelEigen ? titel : autoTitel;

  const ref = angemeldet && profil.ref_code ? profil.ref_code : null;
  const link = useMemo(() => trainingsLink({ teile, schulart, box, ref }), [teile, schulart, box, ref]);
  useEffect(() => {
    let aktiv = true;
    import("qrcode").then((Q) => (Q.default || Q).toDataURL(link, { margin: 0, width: 320, errorCorrectionLevel: "M", color: { dark: C.seeTief, light: "#FFFFFF" } }))
      .then((u) => { if (aktiv) setQrBild(u); }).catch(() => {});
    return () => { aktiv = false; };
  }, [link]);

  const umschalten = (id) => {
    setTeile((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length >= MAX_TEILE ? t : [...t, id]));
  };
  const kapitelUmschalten = (k) => {
    const ids = k.unterthemen.filter((t) => t.quellen.length).map((t) => t.id);
    const alle = ids.every((i) => teile.includes(i));
    setTeile((t) => (alle ? t.filter((x) => !ids.includes(x)) : [...new Set([...t, ...ids])].slice(0, MAX_TEILE)));
  };
  const erstellen = () => {
    if (!teile.length) return;
    setBlatt(blattErstellen({ teile, anzahl: einst.anzahl, niveau: einst.niveau, gruppen: einst.gruppen }));
    setAnsicht("aufgaben:0"); setMeldung("");
  };
  const klasseUebernehmen = (k) => {
    const art = SCHULFORM_ZU_SCHULART[k.schulform] || SCHULART_STANDARD;
    setSchulart(art); setBox(boxZuStufe(art, k.stufe)); setKopf((x) => ({ ...x, klasse: k.name }));
  };

  const pdf = async () => {
    if (!blatt) return;
    setPdfLaeuft(true); setDrucken(true); setMeldung("");
    try {
      await new Promise((r) => setTimeout(r, 80));
      const wurzel = druckRef.current;
      await pdfAusBloecken({
        bloecke: [...wurzel.querySelectorAll("[data-pdf-block]")],
        fuss: `mythosmathe.de · ${titelJetzt || "Arbeitsblatt"}`,
        dateiname: `Arbeitsblatt_${dateiName(titelJetzt || "Mathe")}.pdf`,
        qr: qrBild ? { bild: qrBild, text: "Diese Aufgaben interaktiv üben", zeile: "mythosmathe.de · kostenlos, mit Lösungsweg" } : null,
      });
    } catch (e) { setMeldung("Das PDF ließ sich gerade nicht erstellen. Bitte noch einmal versuchen."); }
    setDrucken(false); setPdfLaeuft(false);
  };

  const speichern = async () => {
    if (!blatt) return;
    setSpeichertGerade(true); setMeldung("");
    try {
      const e = await blattSpeichern({ ...blattSnapshot({ titel: titelJetzt, einstellungen: einst, teile, blatt }), kopf, schulart, box });
      setGespeichert((l) => [e, ...(l || [])]);
      setMeldung("Gespeichert. Sie finden das Blatt unten unter „Ihre Blätter“.");
    } catch (err) { setMeldung(err.message || "Das Blatt ließ sich gerade nicht speichern."); }
    setSpeichertGerade(false);
  };
  const oeffnen = (e) => {
    const d = e.daten || {};
    if (d.schulart) setSchulart(d.schulart);
    if (d.box) setBox(d.box);
    if (d.einstellungen) setEinst(d.einstellungen);
    if (d.kopf) setKopf(d.kopf);
    setTeile(d.teile || []);
    setTitel(d.titel || e.titel); setTitelEigen(true);
    setBlatt(d.blatt || null); setAnsicht("aufgaben:0");
    setMeldung(`„${e.titel}“ ist geöffnet – genau so, wie Sie es gespeichert haben.`);
  };
  const loeschen = async (e) => {
    try { await blattLoeschen(e.id); setGespeichert((l) => (l || []).filter((x) => x.id !== e.id)); } catch (err) { setMeldung(err.message); }
  };

  const nGewaehlt = teile.length;
  const kapitelZustand = (k) => {
    const ids = k.unterthemen.filter((t) => t.quellen.length).map((t) => t.id);
    const n = ids.filter((i) => teile.includes(i)).length;
    return n === 0 ? "aus" : n === ids.length ? "an" : "halb";
  };
  const fremde = teile.filter((t) => !kapitel.some((k) => t.startsWith(`${k.id}.`)));

  return (
    <div style={{ background: C.sand, minHeight: "100vh", fontFamily: "Montserrat, sans-serif" }} data-seite="arbeitsblatt">
      {/* Kopf */}
      <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
        <div className="mx-auto px-6 pt-10 pb-6" style={{ maxWidth: 680 }}>
          <p style={{ margin: "0 0 10px", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold }}>Für Lehrkräfte · kostenlos</p>
          <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 30, letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0 }}>Arbeitsblatt-Generator</h1>
          <div style={{ width: 54, height: 4, background: GOLD_VERLAUF, borderRadius: 2, marginTop: 18, marginBottom: 16 }} />
          <p style={{ color: C.goldText, fontSize: 15, fontWeight: 300, lineHeight: 1.65, margin: 0 }}>
            Kapitel und Unterthemen wählen – fertig ist ein Blatt mit Lösungsblatt. Jede Aufgabe wird neu berechnet, jede Lösung von der App nachgerechnet. Kein Konto nötig.
          </p>
        </div>
        <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
      </div>

      <div className="mx-auto px-4" style={{ maxWidth: 680, paddingBottom: 72 }}>
        {/* 1 · Klasse */}
        <Schritt nr={1} titel="Klasse" zeile="Schulart und Klassenstufe – danach sehen Sie die Kapitel wie im Schulbuch.">
          {lehrend && klassen.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 700, color: C.gruenDunkel }}>Aus Ihren Klassen</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {klassen.map((k) => (
                  <Chip key={k.id} gold an={kopf.klasse === k.name && box === boxZuStufe(SCHULFORM_ZU_SCHULART[k.schulform] || "g9", k.stufe)} onClick={() => klasseUebernehmen(k)} unter={`${k.schulform === "GMS" ? "GS9" : k.schulform} · Klasse ${k.stufe}`} testid="ab-eigene-klasse">{k.name}</Chip>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {SCHULARTEN.map((s) => <Chip key={s.id} breit an={schulart === s.id} onClick={() => { setSchulart(s.id); if (box && !klassenBoxen(s.id).some((b) => b.id === box)) setBox(null); }} unter={s.id === "g8" ? "Abi nach 12" : "Abi nach 13"} testid={`ab-schulart-${s.id}`}>{s.name}</Chip>)}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {boxen.map((b) => <Chip key={b.id} gold={b.gold} an={box === b.id} onClick={() => { setBox(b.id); setOffen(null); }} testid={`ab-klasse-${b.id}`}>{b.label}</Chip>)}
          </div>
        </Schritt>

        {/* 2 · Themen */}
        <Schritt nr={2} titel="Themen" zeile={box ? "Kapitel antippen, um die Unterthemen zu sehen. Das Kästchen wählt das ganze Kapitel." : "Wählen Sie zuerst oben eine Klasse."}>
          {box && (
            <div role="list" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {kapitel.map((k) => {
                const z = kapitelZustand(k), auf = offen === k.id;
                return (
                  <div key={k.id} role="listitem" style={{ border: `1.5px solid ${z === "aus" ? C.linie : C.seeHell}`, borderRadius: 14, background: z === "aus" ? C.weiss : "#F5F8FD", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "stretch" }}>
                      <button type="button" aria-label={`Ganzes Kapitel ${k.titel} ${z === "an" ? "abwählen" : "wählen"}`} onClick={() => kapitelUmschalten(k)} data-testid="ab-kapitel-alle"
                        style={{ border: "none", background: "transparent", padding: "0 6px 0 14px", cursor: "pointer", minWidth: 44, display: "flex", alignItems: "center" }}>
                        <Kaestchen zustand={z} />
                      </button>
                      <button type="button" aria-expanded={auf} onClick={() => setOffen(auf ? null : k.id)} data-testid="ab-kapitel"
                        style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", textAlign: "left", padding: "12px 14px 12px 6px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.hellgrau, letterSpacing: "0.06em" }}>KAPITEL {roemisch(k.nr)}</span>
                          <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{k.titel}</span>
                          <span style={{ display: "block", fontSize: 12, color: C.grau, marginTop: 2 }}>{k.typen} {k.typen === 1 ? "Aufgabentyp" : "Aufgabentypen"}</span>
                        </span>
                        <span aria-hidden="true" style={{ color: C.see, fontSize: 18, transform: auf ? "rotate(90deg)" : "none", transition: "transform .15s" }}>›</span>
                      </button>
                    </div>
                    {auf && (
                      <div style={{ padding: "0 12px 12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                        {k.unterthemen.map((t) => {
                          const moeglich = t.quellen.length > 0, an = teile.includes(t.id);
                          return (
                            <button key={t.id} type="button" disabled={!moeglich} onClick={() => umschalten(t.id)} aria-pressed={an} data-testid="ab-unterthema"
                              style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, padding: "6px 10px", borderRadius: 10, border: "none", background: an ? C.himmel : "transparent", cursor: moeglich ? "pointer" : "default", fontFamily: "inherit", textAlign: "left" }}>
                              <Kaestchen zustand={an ? "an" : "aus"} />
                              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: moeglich ? C.tinte : C.hellgrau }}>{t.titel}</span>
                              {!moeglich && <span style={{ fontSize: 11, color: C.hellgrau }}>noch keine Aufgaben</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {nGewaehlt > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13.5, color: C.grau }}><strong style={{ color: C.tinte }}>{nGewaehlt} {nGewaehlt === 1 ? "Unterthema" : "Unterthemen"}</strong> gewählt{fremde.length ? ` (davon ${fremde.length} aus einer anderen Klasse)` : ""}</span>
              <button type="button" onClick={() => setTeile([])} style={{ background: "none", border: "none", color: C.see, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline", minHeight: 44 }}>Alles abwählen</button>
            </div>
          )}
        </Schritt>

        {/* 3 · Blatt einstellen */}
        <Schritt nr={3} titel="Blatt einstellen">
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: C.grau }}>Anzahl der Aufgaben</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <button type="button" aria-label="Eine Aufgabe weniger" onClick={() => setEinst((e) => ({ ...e, anzahl: Math.max(5, e.anzahl - 1) }))} style={rund}>−</button>
            <span data-testid="ab-anzahl" style={{ minWidth: 44, textAlign: "center", fontSize: 24, fontWeight: 800, color: C.tinte }}>{einst.anzahl}</span>
            <button type="button" aria-label="Eine Aufgabe mehr" onClick={() => setEinst((e) => ({ ...e, anzahl: Math.min(20, e.anzahl + 1) }))} style={rund}>+</button>
            <span style={{ fontSize: 12.5, color: C.hellgrau }}>5 bis 20</span>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: C.grau }}>Schwierigkeit</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 18 }}>
            {NIVEAUS.map((n) => <Chip key={n.id} breit an={einst.niveau === n.id} onClick={() => setEinst((e) => ({ ...e, niveau: n.id }))} unter={n.zeile} testid={`ab-niveau-${n.id}`}>{n.name}</Chip>)}
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: C.grau }}>Fassungen</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <Chip breit an={einst.gruppen === 1} onClick={() => setEinst((e) => ({ ...e, gruppen: 1 }))} unter="ein Blatt für alle">Eine Fassung</Chip>
            <Chip breit an={einst.gruppen === 2} onClick={() => setEinst((e) => ({ ...e, gruppen: 2 }))} unter="gleiche Typen, andere Zahlen" testid="ab-gruppen-2">Gruppe A und B</Chip>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: C.grau }}>Platz zum Rechnen</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <Chip breit an={einst.rechenraum} onClick={() => setEinst((e) => ({ ...e, rechenraum: true }))} unter="blanko unter jeder Aufgabe">Mit Rechenraum</Chip>
            <Chip breit an={!einst.rechenraum} onClick={() => setEinst((e) => ({ ...e, rechenraum: false }))} unter="gerechnet wird im Heft" testid="ab-kompakt">Kompakt</Chip>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: C.grau }}>Lösungsblatt</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip breit an={einst.loesung === "weg"} onClick={() => setEinst((e) => ({ ...e, loesung: "weg" }))} unter="jeder Schritt + Ergebnis">Mit Lösungsweg</Chip>
            <Chip breit an={einst.loesung === "ergebnis"} onClick={() => setEinst((e) => ({ ...e, loesung: "ergebnis" }))} unter="schnell kontrollieren" testid="ab-nur-ergebnisse">Nur Ergebnisse</Chip>
          </div>
        </Schritt>

        {/* 4 · Blattkopf */}
        <Schritt nr={4} titel="Blattkopf" zeile="Alles freiwillig. Leere Felder werden auf dem Blatt zu Schreiblinien.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <Feld label="Titel" name="titel" wert={titelJetzt} setze={(v) => { setTitel(v); setTitelEigen(true); }} platzhalter={autoTitel || "z. B. Übung zur Klassenarbeit"} />
            <Feld label="Schule" name="schule" wert={kopf.schule} setze={(v) => setKopf((k) => ({ ...k, schule: v }))} platzhalter="z. B. Ellenrieder-Gymnasium" />
            <Feld label="Lehrkraft" name="lehrkraft" wert={kopf.lehrkraft} setze={(v) => setKopf((k) => ({ ...k, lehrkraft: v }))} platzhalter="z. B. Herr Blum" />
            <Feld label="Klasse" name="klasse" wert={kopf.klasse} setze={(v) => setKopf((k) => ({ ...k, klasse: v }))} platzhalter="z. B. 7b" />
            <Feld label="Datum" name="datum" wert={kopf.datum} setze={(v) => setKopf((k) => ({ ...k, datum: v }))} platzhalter="z. B. 24.10.2026" />
          </div>
          {titelEigen && autoTitel && titel !== autoTitel && (
            <button type="button" onClick={() => { setTitelEigen(false); setTitel(""); }} style={{ marginTop: 10, background: "none", border: "none", padding: 0, color: C.see, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline", minHeight: 32 }}>Titel wieder automatisch</button>
          )}
        </Schritt>

        <GoldKnopf onClick={erstellen} disabled={!nGewaehlt} testid="ab-erstellen"
          titel={blatt ? "Neues Blatt würfeln" : "Blatt erstellen"}
          zeile={nGewaehlt ? `${einst.anzahl} Aufgaben${einst.gruppen === 2 ? " · Gruppe A und B" : ""} · mit Lösungsblatt` : "Wählen Sie mindestens ein Unterthema"} />

        {!angemeldet && (
          <div style={{ ...KARTE, marginTop: 16, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", background: "#FFFBEF", boxShadow: "none", border: `1px solid ${C.goldWarm}` }}>
            <p style={{ margin: 0, flex: "1 1 240px", fontSize: 13.5, color: C.tinte, lineHeight: 1.55 }}>
              <strong>Mit kostenlosem Lehrer-Konto</strong> wählen Sie Ihre Klassen mit einem Tipp und speichern Blätter, um sie später genau so wieder zu drucken.
            </p>
            <LeiseKnopf onClick={() => gehe({ ansicht: "konto" })} testid="ab-konto">Konto anlegen</LeiseKnopf>
          </div>
        )}

        {/* Vorschau */}
        {blatt && (
          <section style={{ marginTop: 26 }} data-testid="ab-vorschau">
            <p style={{ ...KICKER, marginBottom: 10 }}>Vorschau</p>
            <div role="tablist" style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {blatt.gruppen.map((g, gi) => (
                <Chip key={gi} an={ansicht === `aufgaben:${gi}`} onClick={() => setAnsicht(`aufgaben:${gi}`)} testid={`ab-tab-aufgaben-${gi}`}>{g.name ? `Gruppe ${g.name}` : "Aufgaben"}</Chip>
              ))}
              <Chip gold an={ansicht === "loesungen"} onClick={() => setAnsicht("loesungen")} testid="ab-tab-loesungen">Lösungen</Chip>
            </div>
            <div style={{ ...KARTE, padding: 0, overflow: "hidden" }}>
              <Blatt blatt={blatt} kopf={kopf} titel={titelJetzt} einst={einst} ansicht={ansicht}
                onTausch={ansicht.startsWith("aufgaben") ? (i) => setBlatt((b) => aufgabeTauschen(b, i)) : null} />
              {qrBild && ansicht.startsWith("aufgaben") && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderTop: `1px solid ${C.linie}` }}>
                  <span style={{ flex: 1, fontSize: 11.5, color: C.hellgrau, lineHeight: 1.5 }}>Fußzeile jeder Seite: mythosmathe.de und der QR-Code, mit dem Ihre Schüler genau diese Aufgaben interaktiv weiterüben.</span>
                  <img src={qrBild} alt="QR-Code zum Training" width="54" height="54" style={{ display: "block" }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              <GoldKnopf onClick={pdf} disabled={pdfLaeuft} testid="ab-pdf" titel={pdfLaeuft ? "PDF wird erstellt …" : "PDF herunterladen"}
                zeile={`${einst.gruppen === 2 ? "Gruppe A, Gruppe B" : "Aufgabenblatt"} und Lösungsblatt in einer Datei`} />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <LeiseKnopf onClick={erstellen} testid="ab-neu">Alle Aufgaben neu würfeln</LeiseKnopf>
                {angemeldet && <LeiseKnopf onClick={speichern} disabled={speichertGerade} testid="ab-speichern">{speichertGerade ? "Speichert …" : "Blatt speichern"}</LeiseKnopf>}
              </div>
            </div>
          </section>
        )}
        {meldung && <p role="status" style={{ margin: "14px 4px 0", fontSize: 13.5, color: /nicht|Fehler|schon 200/.test(meldung) ? C.signal : C.gruenDunkel, lineHeight: 1.55 }}>{meldung}</p>}

        {/* gespeicherte Blätter */}
        {angemeldet && gespeichert && gespeichert.length > 0 && (
          <section style={{ ...KARTE, marginTop: 26 }} data-testid="ab-gespeichert">
            <p style={{ ...KICKER, marginBottom: 12 }}>Ihre Blätter</p>
            {gespeichert.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: `1px solid ${C.linie}` }}>
                <button type="button" onClick={() => oeffnen(e)} style={{ flex: 1, minWidth: 0, border: "none", background: "none", textAlign: "left", padding: "4px 0", cursor: "pointer", fontFamily: "inherit", minHeight: 44 }}>
                  <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.tinte, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.titel}</span>
                  <span style={{ display: "block", fontSize: 12, color: C.grau }}>{new Date(e.erstellt).toLocaleDateString("de-DE")}{e.daten && e.daten.kopf && e.daten.kopf.klasse ? ` · ${e.daten.kopf.klasse}` : ""}</span>
                </button>
                <button type="button" onClick={() => loeschen(e)} aria-label={`${e.titel} löschen`} style={{ minWidth: 44, minHeight: 44, border: "none", background: "none", color: C.hellgrau, cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            ))}
          </section>
        )}

        <p style={{ margin: "26px 4px 0", fontSize: 12, color: C.hellgrau, lineHeight: 1.6 }}>
          Alle Aufgaben stammen aus den Aufgaben-Generatoren der App und werden mit festen Rechenregeln erzeugt und gelöst – keine KI, keine Aufgaben aus dem Netz. Sie dürfen die Blätter frei im Unterricht verwenden.
        </p>
      </div>

      {/* Druckfassung (unsichtbar, nur während das PDF entsteht) */}
      {drucken && blatt && (
        <div aria-hidden="true" style={{ position: "fixed", left: -10000, top: 0, width: 760, background: C.weiss, fontFamily: "Montserrat, sans-serif" }}>
          <div ref={druckRef}><Blatt blatt={blatt} kopf={kopf} titel={titelJetzt} einst={einst} druck /></div>
        </div>
      )}
    </div>
  );
}

const rund = { width: 44, height: 44, borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 22, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", lineHeight: 1 };
