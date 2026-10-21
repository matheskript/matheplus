import React, { useEffect, useMemo, useState } from "react";
import { COACHING, tagSchluessel } from "./base3.jsx";
import { sb } from "./konto.js";
import { ANGEBOT } from "./angebot.js";
import { ELTERNABEND } from "./funcElternabend.jsx";
import { LP_CSS, LP_FARBEN as F, Haken, Kreuz } from "./funcLandingpage.jsx";
import { KANAL_SEITEN, SERIE, KLASSEN_WAHL, preisText, VIA_KEY, KLAUSUR_VORBELEGT_KEY, SERIE_KEY, kanalSeite, viaNormal } from "./kanalSeiten.js";
import { springe } from "./sprung.js";
import { lernAendern } from "./func6.jsx";

/* ======================================================================
   KANAL-LANDINGPAGES – eine Vorlage, fünf Konfigurationen (Daten: src/kanalSeiten.js).
   Adressen /poster · /thema · /insta · /eltern · /abi-eltern (pfade.js), Ansicht "kanal".

   Aufbau je Seite (Blockbuster-StorySkript, Baulig-Layout, Gestaltung aus funcLandingpage.jsx):
     1 HELD      Kopf mit Kicker, Schlagzeile, Lead – rechts daneben (Handy: darunter) die
                 Einstiegskarte: der eine nächste Schritt (Klausur eintragen · Kapitel 1 · Serie ·
                 Erstgespräch · Aufnahmegespräch) → Vertrauensleiste mit vier Fakten
     2 PROBLEM   drei Ebenen, die dritte ist der Mythos
     3 MENTOR    Geschichte 2 → 1,0, drei Belege, Haltung
     4 LÖSUNG    3-Schritte-Plan, drei Versprechen, Angebote als Karten
     5 REISE     zwei Wege, Eltern-Weiche (Schüler-Seiten), Fragen, Abschluss mit Knopf;
                 Handy: feste Leiste mit dem direkten Knopf

   Kein Karo (Entscheidung 20.10.), keine erfundenen Stimmen, Preise nur mit PREISE_ANZEIGEN.
   Zählung ohne Cookies: kanal_zaehlen(...) in supabase/kanal.sql (Aufruf, Knopf, Formular …).
   ====================================================================== */

const KS_CSS = `
.ks .lp-kopf { padding-bottom: clamp(44px, 6vw, 72px); }
.ks-karte { background: ${F.weiss}; color: ${F.tinte}; border-radius: 24px; padding: clamp(22px, 3vw, 30px); box-shadow: 0 30px 60px rgba(3,10,30,0.35); }
.ks-karte h2 { font-size: 20px; font-weight: 800; letter-spacing: -0.015em; line-height: 1.3; }
.ks-karte .ks-hinweis { font-size: 13.5px; line-height: 1.55; color: ${F.still}; margin-top: 10px; }
.ks-feld { display: block; width: 100%; box-sizing: border-box; min-height: 50px; padding: 12px 14px; border-radius: 12px; border: 1.5px solid ${F.linie}; background: ${F.papier};
  font: 500 16px/1.3 Montserrat, system-ui, sans-serif; color: ${F.tinte}; outline: none; }
.ks-feld:focus { border-color: ${F.see}; background: ${F.weiss}; }
.ks-label { display: block; font-size: 12.5px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: ${F.still}; margin: 16px 0 6px; }
.ks-label:first-child { margin-top: 0; }
.ks-karte .lp-knopf { width: 100%; margin-top: 18px; }
.ks-fehler { margin-top: 10px; font-size: 13.5px; color: ${F.rot}; }
.ks-ok { border-radius: 14px; padding: 14px 16px; background: #E6F6EF; border: 1px solid #9BD9B8; color: #0F5C3A; font-size: 14.5px; line-height: 1.55; }
.ks-ok b { display: block; font-size: 16px; font-weight: 800; margin-bottom: 4px; }
.ks-zwei { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; }
@media (max-width: 420px) { .ks-zwei { grid-template-columns: minmax(0, 1fr); } }
.ks-held-punkte { list-style: none; padding: 0; margin: 28px 0 0; display: grid; gap: 10px; max-width: 34em; }
.ks-held-punkte li { display: flex; gap: 12px; align-items: flex-start; font-size: 15px; line-height: 1.55; color: ${F.blauText}; }
.ks-held-punkte b { color: ${F.weiss}; font-weight: 700; }
.ks-haltung { margin-top: 40px; padding: 26px 28px; border-left: 4px solid ${F.gold}; background: ${F.weiss}; border-radius: 0 18px 18px 0; font-size: 18px; font-weight: 600; line-height: 1.55; letter-spacing: -0.005em; max-width: 36em; }
.ks-preis { display: inline-block; font-size: 15px; font-weight: 800; letter-spacing: -0.01em; margin-left: 10px; }
.ks-weiche { margin-top: 48px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; border-radius: 26px; padding: clamp(26px, 4vw, 40px); background: ${F.himmel}; border: 1px solid ${F.linie}; align-items: center; }
@media (min-width: 900px) { .ks-weiche { grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr); } }
.ks-weiche h3 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
.ks-weiche .lp-cta-reihe { justify-content: flex-start; }
.ks-serie { list-style: none; padding: 0; margin-top: 44px; display: grid; gap: 14px; }
.ks-tag { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 16px; background: ${F.weiss}; border: 1px solid ${F.linie}; border-radius: 22px; padding: 22px 22px 22px 18px; }
.ks-tag-nr { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; background: ${F.himmel}; color: ${F.see}; }
.ks-tag.offen .ks-tag-nr { background: ${F.gold}; color: ${F.nacht}; }
.ks-tag.fertig .ks-tag-nr { background: ${F.gruen}; color: ${F.weiss}; }
.ks-tag.zu { opacity: 0.55; }
.ks-tag h3 { font-size: 18px; font-weight: 800; letter-spacing: -0.015em; line-height: 1.3; }
.ks-tag h3 span { color: ${F.still}; font-weight: 700; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 4px; }
.ks-tag .lp-text { margin-top: 8px; font-size: 15px; line-height: 1.6; }
.ks-tag .ks-uebung { margin-top: 12px; padding: 12px 14px; border-radius: 12px; background: ${F.papier}; font-size: 14.5px; line-height: 1.55; color: ${F.tinte}; }
.ks-tag .ks-uebung b { color: ${F.see}; }
.ks-tag .lp-knopf { margin-top: 14px; min-height: 46px; padding: 0 22px; font-size: 15px; }
@media (max-width: 560px) { .ks-tag { grid-template-columns: 44px minmax(0, 1fr); gap: 12px; padding: 18px 16px 18px 14px; } .ks-tag-nr { width: 40px; height: 40px; font-size: 14px; } .ks-tag .lp-knopf { width: 100%; } }
.ks-fakten { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; margin-top: 24px; }
@media (min-width: 700px) { .ks-fakten { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.ks-fakten div { display: flex; gap: 12px; align-items: flex-start; font-size: 15px; line-height: 1.55; color: ${F.grau}; }
.ks-fakten b { color: ${F.tinte}; }
.ks-hand { display: block; font-family: Caveat, 'Bradley Hand', 'Segoe Print', cursive; font-weight: 700; font-size: clamp(30px, 5vw, 40px); line-height: 1.15; color: ${F.weiss};
  text-decoration: line-through; text-decoration-color: ${F.rot}; text-decoration-thickness: 0.12em; text-decoration-skip-ink: none; overflow-wrap: anywhere; }
.ks .lp-h1 { font-size: clamp(38px, 5.4vw, 62px); }
/* Kopf: Handy = Schlagzeile, dann sofort die Einstiegskarte, dann der Rest; Desktop = Text links, Karte rechts */
.ks-held { display: grid; grid-template-columns: minmax(0, 1fr); grid-template-areas: "kopf" "karte" "mehr"; gap: 28px; align-items: start; }
.ks-held-kopf { grid-area: kopf; } .ks-held-karte { grid-area: karte; } .ks-held-mehr { grid-area: mehr; }
@media (min-width: 900px) { .ks-held { grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); grid-template-areas: "kopf karte" "mehr karte"; column-gap: clamp(40px, 5vw, 72px); row-gap: 0; } }
`;

/* ---------------------------------------------------------------- Kanal-Kennung und Zählung */
function viaLesen(seite) {
  try {
    const v = viaNormal(new URLSearchParams(window.location.search).get("via"));
    if (v) { sessionStorage.setItem(VIA_KEY, v); return v; }
    const alt = sessionStorage.getItem(VIA_KEY);
    if (alt) return alt;
    sessionStorage.setItem(VIA_KEY, seite);
    return seite;
  } catch (e) { return seite; }
}
/* Ein Ereignis zählen: ohne Cookies, ohne Drittdienst – nur ein Zeilenzähler je Kanal (kanal.sql). Fehler sind egal. */
export function kanalZaehlen(via, seite, ereignis, detail) {
  if (!sb) return;
  try { sb.rpc("kanal_zaehlen", { p_via: via, p_seite: seite, p_ereignis: ereignis, p_detail: detail || null }).then(() => {}, () => {}); } catch (e) { /* egal */ }
}

/* ---------------------------------------------------------------- Einstiegskarten */
const tagVon = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

function KlausurKarte({ gehe, zaehlen }) {
  const [datum, setDatum] = useState(() => tagSchluessel(tagVon(14)));
  const [thema, setThema] = useState("");
  const [klasse, setKlasse] = useState("");
  const [fehler, setFehler] = useState("");
  const morgen = tagSchluessel(tagVon(1));
  const los = (e) => {
    e.preventDefault();
    if (!datum || datum < morgen) { setFehler("Bitte ein Datum ab morgen wählen."); return; }
    if (!klasse) { setFehler("Bitte deine Klasse wählen."); return; }
    try { sessionStorage.setItem(KLAUSUR_VORBELEGT_KEY, JSON.stringify({ datum, suche: thema.trim() })); } catch (x) { /* privat */ }
    /* Der Planer braucht ein Profil (Klasse, Ziel) – das legen wir still auf dem Gerät an, statt eine Profilseite dazwischenzuschalten */
    try { const k = Number(klasse); lernAendern((X) => { if (!X.profil) X.profil = { name: "Du", klasse: k, ziel: "arbeit", seit: Date.now() }; }); } catch (x) { /* privat */ }
    zaehlen("klausur", thema.trim().slice(0, 60) || null);
    gehe({ ansicht: "vorbereiten", termin: "neu" });
  };
  return (
    <form className="ks-karte" id="ks-einstieg" onSubmit={los} noValidate>
      <h2>Deine nächste Mathe-Klausur</h2>
      <label className="ks-label" htmlFor="ks-datum">Wann?</label>
      <input id="ks-datum" className="ks-feld" type="date" value={datum} min={morgen} onChange={(e) => { setDatum(e.target.value); setFehler(""); }} />
      <div className="ks-zwei">
        <div>
          <label className="ks-label" htmlFor="ks-thema">Thema (wie im Heft)</label>
          <input id="ks-thema" className="ks-feld" value={thema} onChange={(e) => setThema(e.target.value)} placeholder="z. B. Ableitungen" autoComplete="off" />
        </div>
        <div>
          <label className="ks-label" htmlFor="ks-klasse-p">Deine Klasse</label>
          <select id="ks-klasse-p" className="ks-feld" value={klasse} onChange={(e) => { setKlasse(e.target.value); setFehler(""); }}>
            <option value="">Wählen</option>
            {[8, 9, 10, 11, 12, 13].map((k) => <option key={k} value={k}>Klasse {k}</option>)}
          </select>
        </div>
      </div>
      {fehler && <p className="ks-fehler" role="alert">{fehler}</p>}
      <button type="submit" className="lp-knopf lp-gold lp-knopf-gross">Plan bis zur Klausur bekommen</button>
      <p className="ks-hinweis">Kostenlos, ohne Konto. Der Planer rechnet rückwärts bis zum Termin – der Plan bleibt auf deinem Handy.</p>
    </form>
  );
}

function KapitelKarte({ gehe, zaehlen }) {
  return (
    <div className="ks-karte" id="ks-einstieg">
      <span className="lp-kicker" style={{ marginBottom: 10 }}>Kapitel 1 · kostenlos</span>
      <h2>Ableitungen – was eine Ableitung ist und woher die Regel kommt</h2>
      <p className="ks-hinweis">Aus dem Band „Ableitungen“: Herleitung, Beispiel, Aufgaben mit Lösungen. 20 Minuten lesen, dann rechnen. Ohne Konto.</p>
      <button type="button" className="lp-knopf lp-gold lp-knopf-gross" onClick={() => { zaehlen("kapitel", "diffkurs"); gehe({ ansicht: "diffkurs" }); }}>Kapitel 1 lesen</button>
      <button type="button" className="lp-knopf lp-rand-dunkel" style={{ marginTop: 10 }} onClick={() => { zaehlen("trainer", "ableitungstrainer"); gehe({ ansicht: "ableitungstrainer" }); }}>Nur den Trainer ausprobieren</button>
      <div className="ks-fakten" style={{ marginTop: 18, gridTemplateColumns: "minmax(0, 1fr)" }}>
        <div><Haken /><span><b>Jetzt:</b> Differentialrechnung (Ableitungen)</span></div>
        <div><span style={{ width: 22, height: 22, borderRadius: 999, background: F.himmel, flexShrink: 0 }} aria-hidden="true" /><span><b>In Arbeit:</b> Vektoren · Kurvendiskussion</span></div>
      </div>
    </div>
  );
}

/* 7-Tage-Serie: Stand nur auf diesem Gerät (localStorage) – Start-Datum und erledigte Tage */
const serieLesen = () => { try { return JSON.parse(localStorage.getItem(SERIE_KEY) || "null") || { start: null, fertig: [] }; } catch (e) { return { start: null, fertig: [] }; } };
const serieSchreiben = (s) => { try { localStorage.setItem(SERIE_KEY, JSON.stringify(s)); } catch (e) { /* privat */ } };
const tageSeit = (start) => { if (!start) return 0; const a = new Date(start + "T00:00:00"), b = new Date(tagSchluessel() + "T00:00:00"); return Math.max(0, Math.round((b - a) / 86400000)); };

function SerieKarte({ stand, starten, zumTag }) {
  const offen = stand.start ? Math.min(7, tageSeit(stand.start) + 1) : 0;
  const fertig = stand.fertig.length;
  return (
    <div className="ks-karte" id="ks-einstieg">
      <span className="lp-kicker" style={{ marginBottom: 10 }}>7 Tage · 7 Gründe</span>
      <h2>{stand.start ? `Tag ${offen} von 7 ist frei.` : "Ein Grund pro Tag, zehn Minuten Übung."}</h2>
      <p className="ks-hinweis">{stand.start ? `${fertig} von 7 Übungen gemacht. Der Stand bleibt auf diesem Handy.` : "Kostenlos, ohne Konto. Der Stand bleibt auf diesem Handy; jeden Tag wird der nächste Grund frei."}</p>
      <div style={{ display: "flex", gap: 6, marginTop: 16 }} aria-hidden="true">
        {SERIE.map((t) => <span key={t.tag} style={{ flex: 1, height: 8, borderRadius: 999, background: stand.fertig.includes(t.tag) ? F.gruen : t.tag <= offen ? F.gold : F.linie }} />)}
      </div>
      {stand.start
        ? <button type="button" className="lp-knopf lp-gold lp-knopf-gross" onClick={zumTag}>Weiter mit Tag {Math.min(offen, (stand.fertig.length < offen ? stand.fertig.length + 1 : offen))}</button>
        : <button type="button" className="lp-knopf lp-gold lp-knopf-gross" onClick={starten}>Tag 1 starten</button>}
    </div>
  );
}

const FEHLER = {
  daten: "Bitte Name und Telefonnummer oder E-Mail-Adresse angeben.",
  weg: "Die Anfrage ist gerade nicht erreichbar. Bitte versuchen Sie es später noch einmal.",
};
function GespraechKarte({ art, du, seite, via, zaehlen }) {
  const aufnahme = art === "aufnahme";
  const [name, setName] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [klasse, setKlasse] = useState("");
  const [thema, setThema] = useState("");
  const [termine, setTermine] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [fertig, setFertig] = useState(false);
  const klassen = aufnahme ? KLASSEN_WAHL.slice(2) : KLASSEN_WAHL;
  const senden = async (e) => {
    e.preventDefault();
    const mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!name.trim() || (!telefon.trim() && !mailOk)) { setFehler(FEHLER.daten); return; }
    if (!sb) {
      if (COACHING.mail) {   // ohne Datenbank: Anfrage per Mail-Programm
        const betreff = encodeURIComponent(aufnahme ? "Aufnahmegespräch Mathe Abi Masterclass" : "Erstgespräch Mythos Mathe");
        const text = encodeURIComponent(`Name: ${name}\nTelefon: ${telefon}\nE-Mail: ${email}\nKlasse: ${klasse}\nWo es hakt: ${thema}\nWunschtermine: ${termine}\nSeite: ${seite} (${via})`);
        window.location.href = `mailto:${COACHING.mail}?subject=${betreff}&body=${text}`;
        return;
      }
      setFehler(FEHLER.weg); return;
    }
    setLaeuft(true); setFehler("");
    const { error } = await sb.rpc("gespraech_anfrage_senden", {
      p_art: art, p_name: name.trim(), p_telefon: telefon.trim() || null, p_email: mailOk ? email.trim() : null,
      p_klasse: klasse || null, p_thema: thema.trim() || null, p_termine: termine.trim() || null, p_via: via, p_seite: seite,
    });
    setLaeuft(false);
    if (error) { setFehler(String(error.message || "").includes("ga_daten") ? FEHLER.daten : FEHLER.weg); return; }
    zaehlen("formular", art);
    setFertig(true);
  };
  if (fertig) return (
    <div className="ks-karte" id="ks-einstieg">
      <div className="ks-ok" role="status">
        <b>Danke, die Anfrage ist angekommen.</b>
        {du ? "Wir melden uns innerhalb eines Werktags bei dir." : "Wir melden uns innerhalb eines Werktags bei Ihnen – telefonisch oder per E-Mail, je nachdem, was Sie angegeben haben."}
      </div>
    </div>
  );
  return (
    <form className="ks-karte" id="ks-einstieg" onSubmit={senden} noValidate>
      <h2>{aufnahme ? "Aufnahmegespräch anfragen" : "Erstgespräch anfragen"}</h2>
      <p className="ks-hinweis">{aufnahme ? "30 Minuten, Eltern und Schüler gemeinsam, per Zoom oder in Konstanz." : "20 Minuten, kostenlos und unverbindlich. Rückruf innerhalb eines Werktags."}</p>
      <label className="ks-label" htmlFor="ks-name">{du ? "Dein Name" : "Ihr Name"}</label>
      <input id="ks-name" className="ks-feld" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      <div className="ks-zwei">
        <div>
          <label className="ks-label" htmlFor="ks-telefon">Telefon</label>
          <input id="ks-telefon" className="ks-feld" type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} autoComplete="tel" />
        </div>
        <div>
          <label className="ks-label" htmlFor="ks-mail">E-Mail</label>
          <input id="ks-mail" className="ks-feld" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
      </div>
      <label className="ks-label" htmlFor="ks-klasse">{du ? "Deine Klasse" : "Klasse des Kindes"}</label>
      <select id="ks-klasse" className="ks-feld" value={klasse} onChange={(e) => setKlasse(e.target.value)}>
        <option value="">Bitte wählen</option>
        {klassen.map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
      <label className="ks-label" htmlFor="ks-hakt">{aufnahme ? "Wo steht Ihr Kind in Mathe?" : "Wo hakt es gerade?"}</label>
      <input id="ks-hakt" className="ks-feld" value={thema} onChange={(e) => setThema(e.target.value)} placeholder={aufnahme ? "z. B. Note 4, Analysis unsicher, Abi 2027" : "z. B. Note 5 in der letzten Arbeit, Thema Ableitungen"} />
      <label className="ks-label" htmlFor="ks-termine">Zwei Wunschtermine</label>
      <input id="ks-termine" className="ks-feld" value={termine} onChange={(e) => setTermine(e.target.value)} placeholder="z. B. Di nach 18 Uhr oder Sa vormittags" />
      {fehler && <p className="ks-fehler" role="alert">{fehler}</p>}
      <button type="submit" className="lp-knopf lp-gold lp-knopf-gross" disabled={laeuft}>{laeuft ? "Wird gesendet …" : aufnahme ? "Aufnahmegespräch anfragen" : "Erstgespräch anfragen"}</button>
      <p className="ks-hinweis">{du ? "Deine Angaben" : "Ihre Angaben"} werden nur für dieses Gespräch genutzt. Mehr in der <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>Datenschutzerklärung</a>.</p>
    </form>
  );
}

/* ---------------------------------------------------------------- Bausteine */
const Mark = ({ teile }) => (teile.length > 1 ? <>{teile[0]}<span className="lp-mark">{teile[1]}</span></> : <>{teile[0]}</>);

function Durchgestrichen({ text }) {
  return (
    <span className="ks-hand" role="img" aria-label={`${text} – durchgestrichen`}>{text}</span>
  );
}

/* ---------------------------------------------------------------- Seite */
export function KanalSeite({ seite: id, gehe }) {
  const S = kanalSeite(id) || KANAL_SEITEN[0];
  const via = useMemo(() => viaLesen(S.id), [S.id]);
  const [leisteAn, setLeisteAn] = useState(false);
  const [serie, setSerie] = useState(serieLesen);
  const zaehlen = (ereignis, detail) => kanalZaehlen(via, S.id, ereignis, detail);

  /* Seitentitel; Aufruf einmal je Sitzung zählen */
  useEffect(() => {
    const alt = document.title;
    document.title = S.titel;
    try {
      const k = `mm-kanal-aufruf-${S.id}`;
      if (!sessionStorage.getItem(k)) { sessionStorage.setItem(k, "1"); zaehlen("aufruf"); }
    } catch (e) { /* privat */ }
    return () => { document.title = alt; };
  }, [S.id]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* Feste Leiste auf dem Handy, sobald der Kopf aus dem Bild ist (wie auf der Landingpage) */
  useEffect(() => {
    const kopf = document.getElementById("ks-kopf");
    const ende = document.getElementById("ks-abschluss");
    if (!kopf || !("IntersectionObserver" in window)) return;
    let kopfSichtbar = true, endeSichtbar = false;
    const io = new IntersectionObserver((eintraege) => {
      eintraege.forEach((e) => { if (e.target === kopf) kopfSichtbar = e.isIntersecting; if (e.target === ende) endeSichtbar = e.isIntersecting; });
      setLeisteAn(!kopfSichtbar && !endeSichtbar);
    }, { threshold: 0.05 });
    io.observe(kopf); if (ende) io.observe(ende);
    return () => io.disconnect();
  }, [S.id]);

  const scrollen = (ziel) => { const el = document.getElementById(ziel); if (el) springe("anker", () => el.scrollIntoView({ behavior: "smooth", block: "start" })); };
  /* Der direkte Knopf (nach dem Plan, am Schluss, Leiste): zurück zur Einstiegskarte */
  const zumEinstieg = () => { zaehlen("knopf", "einstieg"); scrollen("ks-einstieg"); };
  const uebergang = () => { zaehlen("knopf", "uebergang"); gehe(S.knopfUebergang.ziel); };
  const elternAdresse = () => { try { return `${window.location.origin}/eltern?via=${encodeURIComponent(via)}`; } catch (e) { return "/eltern"; } };

  const serieStarten = () => {
    const s = { start: tagSchluessel(), fertig: [] };
    serieSchreiben(s); setSerie(s); zaehlen("serie", "start");
    setTimeout(() => scrollen("ks-serie"), 60);
  };
  const serieTag = (t) => {
    const s = { ...serie, fertig: serie.fertig.includes(t.tag) ? serie.fertig : [...serie.fertig, t.tag] };
    serieSchreiben(s); setSerie(s); zaehlen("serie", `tag-${t.tag}`);
    gehe(t.ziel);
  };
  const serieOffen = serie.start ? Math.min(7, tageSeit(serie.start) + 1) : 0;

  const einstieg = S.einstieg === "klausur" ? <KlausurKarte gehe={gehe} zaehlen={zaehlen} />
    : S.einstieg === "kapitel" ? <KapitelKarte gehe={gehe} zaehlen={zaehlen} />
    : S.einstieg === "serie" ? <SerieKarte stand={serie} starten={serieStarten} zumTag={() => scrollen("ks-serie")} />
    : <GespraechKarte art={S.einstieg === "aufnahme" ? "aufnahme" : "erstgespraech"} du={S.du} seite={S.id} via={via} zaehlen={zaehlen} />;

  const kartenAktion = (k) => () => {
    if (k.aktion === "einstieg") { zumEinstieg(); return; }
    if (k.aktion === "eltern") { zaehlen("knopf", "eltern"); window.location.assign(elternAdresse()); return; }
    zaehlen("knopf", k.ziel && k.ziel.ansicht);
    gehe(k.ziel);
  };
  const preisHinweis = S.zielgruppe === "eltern"
    ? (preisText("checken") ? null : (S.du ? "Preis und Laufzeit besprechen wir im Erstgespräch." : "Preis und Zahlungsweise besprechen wir im Gespräch; beides steht vor dem Start fest."))
    : null;

  return (
    <div className="lp ks">
      <style>{LP_CSS}{KS_CSS}</style>

      {/* ═══ 1 · HELD – Identität, Wunsch, Einsatz + Einstiegskarte ═══ */}
      <header className="lp-kopf" id="ks-kopf">
        <div className="lp-innen ks-held">
          <div className="ks-held-kopf">
            <span className="lp-kicker">{S.kicker}</span>
            <h1 className="lp-h1"><Mark teile={S.h1} /></h1>
            <p className="lp-lead">{S.lead}</p>
          </div>
          <div className="ks-held-karte">{einstieg}</div>
          <div className="ks-held-mehr">
            <ul className="ks-held-punkte" style={{ marginTop: 0 }}>
              <li><Haken /><span><b>Wo {S.du ? "du stehst" : "Sie stehen"}:</b> {S.held.identitaet}</span></li>
              <li><Haken /><span><b>Was {S.du ? "du willst" : "Sie wollen"}:</b> {S.held.wunsch}</span></li>
              <li><Haken /><span><b>Worum es geht:</b> {S.held.einsatz}</span></li>
            </ul>
            <p className="lp-autor">Von <b>Basti Blumenröther</b>, Mathestudent an der Universität Konstanz und seit Jahren Mathe-Coach am Bodensee.</p>
          </div>
        </div>
      </header>
      <div className="lp-vertrauen">
        <div className="lp-innen">
          {S.vertrauen.map(([t, s]) => <div key={t}><b>{t}</b><span>{s}</span></div>)}
        </div>
      </div>

      {/* ═══ 2 · PROBLEM – äußeres, inneres, Gegenspieler ═══ */}
      <section className="lp-sektion">
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-kicker">{S.problem.kicker}</span>
            <h2 className="lp-h2"><Mark teile={S.problem.h2} /></h2>
            <p className="lp-text" style={{ marginTop: 24, maxWidth: "36em" }}>{S.problem.text}</p>
          </div>
          <div className="lp-ebenen">
            {S.problem.ebenen.map((e) => (
              <div key={e.nr} className={`lp-ebene${e.gegner ? " lp-ebene-gegner" : ""}`}>
                <span className="lp-ebene-nr">{e.nr}</span>
                {e.gegner ? <div style={{ margin: "14px 0 14px" }}><Durchgestrichen text={`„${e.zitat}“`} /></div> : <q>{e.zitat}</q>}
                <p className="lp-text" style={{ fontSize: 15.5 }}>{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3 · MENTOR – Empathie, Autorität, Haltung ═══ */}
      <section className="lp-sektion" style={{ background: F.weiss, borderTop: `1px solid ${F.linie}` }}>
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-kicker">{S.mentor.kicker}</span>
            <h2 className="lp-h2"><Mark teile={S.mentor.h2} /></h2>
            <p className="lp-text" style={{ marginTop: 24, maxWidth: "36em" }}>{S.mentor.text}</p>
          </div>
          <div className="lp-belege">
            {S.mentor.belege.map(([t, s]) => <div key={t} className="lp-beleg"><b>{t}</b><span>{s}</span></div>)}
          </div>
          <p className="ks-haltung">{S.mentor.haltung}</p>
        </div>
      </section>

      {/* ═══ 4 · LÖSUNG – 3-Schritte-Plan, Versprechen, Angebote ═══ */}
      <section className="lp-sektion lp-dunkel">
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-kicker">{S.plan.kicker}</span>
            <h2 className="lp-h2"><Mark teile={S.plan.h2} /></h2>
          </div>
          <ol className="lp-plan">
            {S.plan.schritte.map(([t, s]) => <li key={t}><h3 className="lp-h3">{t}</h3><p className="lp-text">{s}</p></li>)}
          </ol>
          <div className="lp-versprechen">
            {S.plan.versprechen.map((v) => <div key={v}><span className="lp-haken"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2l2.4 2.4L9.6 3.8" stroke={F.nacht} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span>{v}</span></div>)}
          </div>
          <div className="lp-cta-reihe" style={{ marginTop: 40 }}>
            <span style={{ display: "inline-block" }}>
              <button type="button" className="lp-knopf lp-gold lp-knopf-gross" onClick={zumEinstieg}>{S.knopfDirekt}</button>
              <span className="lp-unter" style={{ color: F.blauText }}>{S.knopfUnter}</span>
            </span>
          </div>
        </div>
      </section>

      {/* 4c · Angebote als Karten */}
      <section className="lp-sektion" id="ks-angebote" style={{ background: F.weiss, borderTop: `1px solid ${F.linie}`, scrollMarginTop: 64 }}>
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-kicker">{S.angebote.kicker}</span>
            <h2 className="lp-h2"><Mark teile={S.angebote.h2} /></h2>
            <p className="lp-text" style={{ marginTop: 20 }}>{S.angebote.text}</p>
          </div>
          <div className="lp-angebote">
            {S.angebote.karten.map((k) => {
              const preis = k.preis ? preisText(k.preis) : "";
              return (
                <div key={k.name} className="lp-angebot" style={k.hervor ? { background: F.nacht, color: F.weiss } : { background: F.papier, border: `1px solid ${F.linie}` }}>
                  {k.hervor && <span className="lp-empfehlung">{S.zielgruppe === "eltern" ? "Der nächste Schritt" : "Für dich"}</span>}
                  <div className="lp-angebot-kopf">
                    <span className="lp-dauer" style={k.hervor ? { background: "rgba(237,187,0,0.14)", color: F.gold } : { background: F.himmel, color: F.see }}>{k.dauer}</span>
                  </div>
                  <h3 className="lp-h2" style={{ fontSize: "clamp(26px, 3.2vw, 34px)", marginTop: 18 }}>{k.name}{preis && <span className="ks-preis" style={{ color: k.hervor ? F.gold : F.goldText }}>{preis}</span>}</h3>
                  <p className="lp-text" style={{ marginTop: 12, ...(k.hervor ? { color: F.blauText } : null) }}>{k.text}</p>
                  <ul style={k.hervor ? null : { color: F.tinte }}>{k.punkte.map((p) => <li key={p}>{p}</li>)}</ul>
                  <div style={{ marginTop: "auto" }}><button type="button" className={`lp-knopf ${k.hervor ? "lp-gold" : "lp-rand-dunkel"}`} onClick={kartenAktion(k)}>{k.knopf}</button></div>
                </div>
              );
            })}
          </div>
          {(S.angebote.hinweis || preisHinweis) && <p className="lp-klein" style={{ marginTop: 20 }}>{[preisHinweis, S.angebote.hinweis].filter(Boolean).join(" ")}</p>}
          {S.zielgruppe === "eltern" && ANGEBOT.elternabend && (
            <p className="lp-text" style={{ marginTop: 18 }}>
              Erst kennenlernen? Beim <button type="button" className="lp-link" onClick={() => { zaehlen("knopf", "elternabend"); gehe({ ansicht: "elternabend" }); }}>Elternabend am {ELTERNABEND.datumKurz}</button> in Dingelsdorf.
            </p>
          )}
        </div>
      </section>

      {/* Instagram: die 7-Tage-Serie */}
      {S.einstieg === "serie" && (
        <section className="lp-sektion" id="ks-serie" style={{ scrollMarginTop: 64 }}>
          <div className="lp-innen">
            <div style={{ maxWidth: 760 }}>
              <span className="lp-kicker">Die Serie</span>
              <h2 className="lp-h2">Sieben Tage, <span className="lp-mark">sieben Gründe.</span></h2>
              <p className="lp-text" style={{ marginTop: 20 }}>
                {serie.start ? `Tag ${serieOffen} ist frei. Jeden Tag kommt der nächste dazu – ein Grund, eine Übung von zehn Minuten.` : "Starte die Serie oben, dann ist Tag 1 frei. Jeden Tag kommt der nächste dazu – ein Grund, eine Übung von zehn Minuten."}
              </p>
            </div>
            <ol className="ks-serie">
              {SERIE.map((t) => {
                const fertig = serie.fertig.includes(t.tag), offen = t.tag <= serieOffen;
                return (
                  <li key={t.tag} className={`ks-tag ${fertig ? "fertig" : offen ? "offen" : "zu"}`}>
                    <span className="ks-tag-nr" aria-hidden="true">{fertig ? "✓" : t.tag}</span>
                    <div>
                      <h3><span>Tag {t.tag}{fertig ? " · gemacht" : offen ? "" : " · noch gesperrt"}</span>Grund {t.tag}: „{t.mythos}“</h3>
                      {offen && <p className="lp-text">{t.kurz}</p>}
                      {offen && <p className="ks-uebung"><b>Übung (etwa 10 Minuten):</b> {t.uebung}</p>}
                      {offen && <button type="button" className={`lp-knopf ${fertig ? "lp-rand-dunkel" : "lp-gold"}`} onClick={() => serieTag(t)}>{t.knopf}</button>}
                      {!offen && <p className="lp-text" style={{ fontSize: 14.5 }}>{serie.start ? "Wird morgen frei." : "Wird frei, sobald du die Serie startest."}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* ═══ 5 · REISE – Erfolg, Scheitern, Eltern-Weiche, Fragen, Abschluss ═══ */}
      <section className="lp-sektion lp-dunkel">
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-kicker">Zwei Wege</span>
            <h2 className="lp-h2">Was in einem halben Jahr anders ist – <span className="lp-mark">oder nicht.</span></h2>
          </div>
          <div className="lp-wege">
            <div className="lp-weg lp-weg-grau"><h3>Ohne Plan</h3><ul>{S.wege.scheitern.map((w) => <li key={w}>{w}</li>)}</ul></div>
            <div className="lp-weg lp-weg-gold"><h3>Mit System</h3><ul>{S.wege.erfolg.map((w) => <li key={w}>{w}</li>)}</ul></div>
          </div>
        </div>
      </section>

      {S.elternWeiche && (
        <section className="lp-sektion" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="lp-innen">
            <div className="ks-weiche">
              <div>
                <span className="lp-kicker">Für deine Eltern</span>
                <h3>{S.elternWeiche.h3}</h3>
                <p className="lp-text" style={{ marginTop: 12 }}>{S.elternWeiche.text}</p>
              </div>
              <div className="lp-cta-reihe" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <a className="lp-knopf lp-gold" href={`https://wa.me/?text=${encodeURIComponent(S.elternWeiche.nachricht + elternAdresse())}`} target="_blank" rel="noopener noreferrer" onClick={() => zaehlen("knopf", "whatsapp")}>Per WhatsApp schicken</a>
                <a className="lp-knopf lp-rand-dunkel" href={elternAdresse()} onClick={() => zaehlen("knopf", "eltern")}>Seite für Eltern öffnen</a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="lp-sektion">
        <div className="lp-innen lp-schmal">
          <span className="lp-kicker">Fragen</span>
          <h2 className="lp-h2">{S.du ? "Was du vielleicht noch wissen willst." : "Was Sie vielleicht noch wissen möchten."}</h2>
          <div style={{ marginTop: 28 }}>
            {S.fragen.map(([f, a]) => (
              <details key={f} className="lp-frage">
                <summary>{f}</summary>
                <p className="lp-text">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-sektion lp-dunkel" id="ks-abschluss" style={{ background: `radial-gradient(120% 90% at 50% 100%, #17306E 0%, ${F.nacht} 50%, ${F.nachtTief} 100%)`, scrollMarginTop: 64 }}>
        <div className="lp-innen lp-mitte" style={{ maxWidth: 760 }}>
          <h2 className="lp-h2"><Mark teile={S.abschluss.h2} /></h2>
          <p className="lp-lead" style={{ marginTop: 20, color: F.blauText }}>{S.abschluss.text}</p>
          <div className="lp-cta-reihe" style={{ marginTop: 36, justifyContent: "center" }}>
            <span style={{ display: "inline-block" }}>
              <button type="button" className="lp-knopf lp-gold lp-knopf-gross" onClick={zumEinstieg}>{S.knopfDirekt}</button>
              <span className="lp-unter" style={{ color: F.blauText }}>{S.knopfUnter}</span>
            </span>
          </div>
          <div style={{ marginTop: 18 }}>
            <button type="button" className="lp-link" style={{ color: F.blauText, textDecorationColor: "rgba(201,214,238,0.4)" }} onClick={uebergang}>{S.knopfUebergang.text}</button>
          </div>
        </div>
      </section>
      <div className="lp-leiste-platz" aria-hidden="true" />

      {/* Feste Leiste auf dem Handy */}
      <div className={`lp-leiste${leisteAn ? " lp-leiste-an" : ""}`} aria-hidden={!leisteAn}>
        <button type="button" className="lp-knopf lp-gold" onClick={zumEinstieg} tabIndex={leisteAn ? 0 : -1}>{S.knopfDirekt}</button>
      </div>
    </div>
  );
}
