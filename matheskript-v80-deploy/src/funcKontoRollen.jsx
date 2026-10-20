import React, { useCallback, useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { auftragGeben, auftragLoeschen, auftraegeFuer } from "./trainingAuftraege.js";
import { ANGEBOT } from "./angebot.js";
import { DEMO, useKonto, anmeldenEmail, empfehlungsLink, REF_BASIS, REF_BASIS_ANZEIGE, gemerkteEinladung, einladungVergessen, hinweisSchliessen, profilSpeichern } from "./konto.js";
import {
  meineBeziehungen, meineKinder, klassenUebersicht, schuelerDetail, elternVerbinden, verbindungLoesen, elternTokenErneuern,
  klasseAnlegen, klasseVorschau, klasseBeitreten, klasseVerlassen, klasseSchuelerEntfernen, klasseLoeschen, klasseCodeNeu,
  rolleWechseln, volljaehrigErklaeren, demoElternHinzufuegen, ANGEBOTE_ANZEIGE, PRO_ENTHAELT, aboVerwalten, meineAbos, proBuchen } from "./kontoRollen.js";
import {
  ROLLEN, GESCHLECHTER, istGeschlecht, rolleName, istLehrend, ampelSortiert, ampelZaehlung, wochenUebersicht, zuletztText, entdeckenText,
  elternLink, klassenLink, elternNachricht, freundeNachricht, lehrkraftNachricht, klassenNachricht, whatsappLink, einladungAusUrl, KLASSENCODE, SCHULFORM_NAME, maxStufe, klassenLabel,
} from "./rollenLogik.js";

/* ======================================================================
   Rollen im Konto: Auswahl, E-Mail-Anmeldung, Eltern ↔ Kind, Klassen, Plan,
   Wochenübersicht (Eltern), Ampel (Lehrkräfte). Datenbank: supabase/rollen.sql
   ====================================================================== */

const NAVY = "#0B1E4A";
export const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
export const Kicker = ({ children }) => <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.hellgrau, marginBottom: 10 }}>{children}</p>;
const text = { fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.65 };
const feld = { width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.linie}`, borderRadius: 12, padding: "11px 14px", fontSize: 16, fontFamily: "inherit", color: C.tinte, background: C.weiss, outline: "none" };
const knopfVoll = (an = true) => ({ height: 44, padding: "0 20px", borderRadius: 999, border: "none", background: an ? C.see : C.hellgrau, color: C.weiss, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: an ? "pointer" : "default" });
const knopfRand = { height: 44, padding: "0 18px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.tinte, fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" };
const linkKnopf = { background: "none", border: "none", padding: 0, color: C.see, textDecoration: "underline", fontFamily: "inherit", fontSize: 13, cursor: "pointer" };

function useLaden(fn, abhaengig = []) {
  const [d, setD] = useState({ laden: true, daten: null, fehler: "" });
  const neu = useCallback(async () => {
    try { setD({ laden: false, daten: await fn(), fehler: "" }); } catch (e) { setD({ laden: false, daten: null, fehler: e.message }); }
  }, abhaengig); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { neu(); }, [neu]);
  return [d, neu];
}

async function kopieren(t, setK) {
  try { await navigator.clipboard.writeText(t); setK(true); setTimeout(() => setK(false), 1800); } catch (e) { /* manuell */ }
}

export const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
);

/* ---------- Schüler / Schülerin: eine Karte, in der Mitte geteilt ---------- */
const halbKnopf = (g, an, andereGewaehlt, erster) => ({ flex: 1, padding: "14px 8px", border: "none", borderLeft: erster ? "none" : "1.5px solid rgba(255,255,255,0.55)",
  background: g === "w" ? C.flaggold : NAVY, color: g === "w" ? NAVY : C.weiss, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer",
  opacity: andereGewaehlt && !an ? 0.45 : 1, boxShadow: an ? `inset 0 0 0 3px ${g === "w" ? NAVY : C.flaggold}` : "none", transition: "opacity .15s" });

export function GeschlechtWahl({ wert, onWahl }) {
  return (
    <div role="radiogroup" aria-label="Schüler oder Schülerin?" style={{ display: "flex", borderRadius: 14, overflow: "hidden", border: `1.5px solid ${istGeschlecht(wert) ? NAVY : C.linie}` }}>
      {GESCHLECHTER.map((g, i) => (
        <button key={g.id} type="button" role="radio" aria-checked={wert === g.id} onClick={() => onWahl(g.id)} style={halbKnopf(g.id, wert === g.id, istGeschlecht(wert), i === 0)}>{wert === g.id ? "✓ " : ""}{g.name}</button>
      ))}
    </div>
  );
}

/* ---------- Rollenauswahl ----------
   onWahl(rolle, geschlecht): Bei „Schüler“ (links) kommt "m", bei „Schülerin“ (rechts) "w", sonst null. */
export function RollenWahl({ wert, geschlecht, onWahl }) {
  return (
    <div role="radiogroup" aria-label="Wer bist du?" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
      {ROLLEN.map((r) => {
        const an = wert === r.id;
        if (r.id === "schueler") {
          const gewaehlt = an && istGeschlecht(geschlecht);
          return (
            <div key={r.id} role="presentation" style={{ display: "flex", borderRadius: 14, overflow: "hidden", border: `1.5px solid ${an ? NAVY : C.linie}` }}>
              {GESCHLECHTER.map((g, i) => (
                <button key={g.id} type="button" role="radio" aria-checked={an && geschlecht === g.id} onClick={() => onWahl("schueler", g.id)} style={halbKnopf(g.id, an && geschlecht === g.id, gewaehlt, i === 0)}>{an && geschlecht === g.id ? "✓ " : ""}{g.name}</button>
              ))}
            </div>
          );
        }
        return (
          <button key={r.id} type="button" role="radio" aria-checked={an} onClick={() => onWahl(r.id, null)}
            style={{ textAlign: "left", padding: "11px 14px", borderRadius: 14, border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss, fontFamily: "inherit", cursor: "pointer" }}>
            <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: an ? C.see : C.tinte }}>{r.name}</span>
            <span style={{ display: "block", fontSize: 12.5, color: C.grau, fontWeight: 300 }}>{r.kurz}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Anmeldung per E-Mail und Passwort ---------- */
export function EmailAnmeldung() {
  const [neu, setNeu] = useState(false);
  const [mail, setMail] = useState("");
  const [pw, setPw] = useState("");
  const [fehler, setFehler] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const los = async (e) => {
    e.preventDefault(); setLaeuft(true); setFehler("");
    try { await anmeldenEmail(mail, pw, neu); } catch (er) { setFehler(er.message); }
    setLaeuft(false);
  };
  return (
    <form onSubmit={los} style={{ marginTop: 4 }}>
      <label htmlFor="konto-mail" style={{ fontSize: 13, fontWeight: 600, color: C.see }}>E-Mail</label>
      <input id="konto-mail" type="email" autoComplete="email" value={mail} onChange={(e) => setMail(e.target.value)} style={{ ...feld, marginTop: 6, marginBottom: 12 }} />
      <label htmlFor="konto-pw" style={{ fontSize: 13, fontWeight: 600, color: C.see }}>Passwort <span style={{ color: C.hellgrau, fontWeight: 400 }}>(mindestens 8 Zeichen)</span></label>
      <input id="konto-pw" type="password" autoComplete={neu ? "new-password" : "current-password"} value={pw} onChange={(e) => setPw(e.target.value)} style={{ ...feld, marginTop: 6 }} />
      {fehler && <p role="alert" style={{ fontSize: 13, color: C.signal, marginTop: 8 }}>{fehler}</p>}
      <button type="submit" disabled={laeuft || !mail || !pw} style={{ ...knopfVoll(!!mail && !!pw && !laeuft), width: "100%", height: 50, marginTop: 14, fontSize: 15.5 }}>
        {laeuft ? "Einen Moment …" : neu ? "Konto erstellen" : "Anmelden"}
      </button>
      <p style={{ fontSize: 13, color: C.grau, marginTop: 10, textAlign: "center" }}>
        {neu ? "Schon ein Konto? " : "Noch kein Konto? "}
        <button type="button" onClick={() => { setNeu(!neu); setFehler(""); }} style={linkKnopf}>{neu ? "Anmelden" : "Konto erstellen"}</button>
      </p>
      {neu && <p style={{ fontSize: 12, color: C.hellgrau, lineHeight: 1.55, marginTop: 4 }}>Merke dir dein Passwort gut: „Passwort vergessen“ gibt es noch nicht. Mit Google oder Facebook musst du dir nichts merken.</p>}
    </form>
  );
}

/* ---------- Hinweis nach automatischer Verbindung ---------- */
export function HinweisLeiste() {
  const { hinweis } = useKonto();
  if (!hinweis) return null;
  return (
    <div role="status" style={{ background: "#E9F7EF", border: "1px solid #9AD8B5", borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 14, color: "#1B5E3A", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ flex: 1, lineHeight: 1.55 }}>{hinweis}</span>
      <button type="button" onClick={hinweisSchliessen} aria-label="Hinweis schließen" style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#1B5E3A", padding: 0 }}>×</button>
    </div>
  );
}

/* ======================================================================
   SCHÜLER
   ====================================================================== */

/* Leute einladen – EINE kompakte Box: persönlicher Link (kopierbar) + WhatsApp an Eltern, Schulfreunde, Lehrkraft.
   Der Eltern-Link enthält einen geheimen Token (Verbindung mit dem Konto) und bleibt deshalb ein eigener Link; die Verwaltung ist eingeklappt. */
const einladenKnopf = (hintergrund, farbe, rand) => ({
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, minWidth: 0, height: 62, padding: "0 4px", borderRadius: 14,
  background: hintergrund, color: farbe, border: rand || "none", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit", textDecoration: "none", cursor: "pointer", lineHeight: 1.2, textAlign: "center",
});

export function EinladenBox({ profil, geworben = 0 }) {
  const [kLink, setKLink] = useState(false);
  const [kEltern, setKEltern] = useState(false);
  const [verwalten, setVerwalten] = useState(false);
  const [bez, neu] = useLaden(meineBeziehungen);
  const [fehler, setFehler] = useState("");
  const [bestaetigen, setBestaetigen] = useState(false);
  const vorname = (profil.name || "").split(" ")[0];
  const link = empfehlungsLink(profil.ref_code);
  const elternUrl = elternLink(REF_BASIS, profil.ref_code, profil.eltern_token);
  const eltern = (bez.daten && bez.daten.eltern) || [];
  const loesen = async (id) => { try { await verbindungLoesen(id); await neu(); } catch (e) { setFehler(e.message); } };
  const erneuern = async () => { try { await elternTokenErneuern(); setBestaetigen(false); } catch (e) { setFehler(e.message); } };
  const klein = { height: 34, padding: "0 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.4)", background: "transparent", color: C.weiss, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", flexShrink: 0 };
  const hell = { background: "none", border: "none", padding: 0, color: "#C9D6EE", textDecoration: "underline", fontFamily: "inherit", fontSize: 13, cursor: "pointer" };
  return (
    <div id="eltern-einladen" style={{ ...karte, padding: 16, marginBottom: 14, background: `linear-gradient(155deg, ${C.see} 0%, ${NAVY} 100%)`, color: C.weiss }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.flaggold, marginBottom: 4 }}>LEUTE EINLADEN</p>
      <p style={{ fontSize: 13.5, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.5, marginBottom: 10 }}>
        Dein persönlicher Link: Wer sich darüber anmeldet, wird dir zugeordnet.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 12, padding: "8px 8px 8px 12px" }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", userSelect: "all" }}>
          {REF_BASIS_ANZEIGE}/<span style={{ color: C.flaggold }}>{String(profil.ref_code)}</span>
        </span>
        <button type="button" onClick={() => kopieren(link, setKLink)} style={klein}>{kLink ? "Kopiert ✓" : "Link kopieren"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 10 }}>
        <a href={whatsappLink(elternNachricht(vorname, elternUrl))} target="_blank" rel="noopener noreferrer"
          style={einladenKnopf(`linear-gradient(150deg, #FFE9A0 0%, ${C.flaggold} 55%, #C99A14 100%)`, NAVY)}>
          <WhatsAppIcon /> Eltern
        </a>
        <a href={whatsappLink(freundeNachricht(vorname, link))} target="_blank" rel="noopener noreferrer"
          style={einladenKnopf("#25D366", "#0B3D1E")}>
          <WhatsAppIcon /> Schulfreunde
        </a>
        <a href={whatsappLink(lehrkraftNachricht(vorname, link))} target="_blank" rel="noopener noreferrer"
          style={einladenKnopf("rgba(255,255,255,0.14)", C.weiss, "1px solid rgba(255,255,255,0.4)")}>
          <WhatsAppIcon /> Lehrkraft
        </a>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#C9D6EE" }}>
          <b style={{ color: C.flaggold, fontSize: 16 }}>{geworben}</b> {geworben === 1 ? "Person" : "Personen"} eingeladen
          {eltern.length > 0 && <> · <b style={{ color: C.flaggold }}>{eltern.length}</b> {eltern.length === 1 ? "Elternteil" : "Eltern"} verbunden</>}
        </span>
        <button type="button" onClick={() => setVerwalten(!verwalten)} aria-expanded={verwalten} aria-controls="eltern-verwalten" style={hell}>
          {verwalten ? "Eltern-Verbindung schließen ▴" : "Eltern-Verbindung ▾"}
        </button>
      </div>
      {verwalten && (
        <div id="eltern-verwalten" style={{ marginTop: 10, background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 12 }}>
          <p style={{ fontSize: 13, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.5, marginBottom: 8 }}>
            Der Eltern-Link verbindet dein Konto mit dem Elternkonto – dann sehen deine Eltern, wie du vorankommst.
          </p>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => kopieren(elternUrl, setKEltern)} style={klein}>{kEltern ? "Kopiert ✓" : "Eltern-Link kopieren"}</button>
            {!bestaetigen && <button type="button" onClick={() => setBestaetigen(true)} style={hell}>Link erneuern</button>}
          </div>
          {bestaetigen && (
            <div style={{ marginTop: 10, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 10 }}>
              <p style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>Der alte Eltern-Link funktioniert danach nicht mehr. Bereits verbundene Eltern bleiben verbunden.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={erneuern} style={{ ...klein, background: C.flaggold, color: NAVY, border: "none", fontWeight: 700 }}>Neuen Link erzeugen</button>
                <button type="button" onClick={() => setBestaetigen(false)} style={klein}>Abbrechen</button>
              </div>
            </div>
          )}
          {fehler && <p role="alert" style={{ fontSize: 13, color: "#FFB4A8", marginTop: 8 }}>{fehler}</p>}
          <div style={{ marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 8 }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.flaggold, marginBottom: 4 }}>Verbunden</p>
            {eltern.length === 0 ? (
              <p style={{ fontSize: 13, color: "#C9D6EE", fontWeight: 300 }}>Noch niemand verbunden.</p>
            ) : eltern.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{e.name}</span>
                <button type="button" onClick={() => loesen(e.id)} style={hell}>Trennen</button>
              </div>
            ))}
            {DEMO && eltern.length === 0 && <button type="button" onClick={() => { demoElternHinzufuegen(); neu(); }} style={{ ...hell, marginTop: 6 }}>Vorschau: Beispiel-Elternteil verbinden</button>}
          </div>
        </div>
      )}
    </div>
  );
}

/* Klassen: per Code oder Link beitreten, Liste, Verlassen */
export function MeineKlassen({ rolle }) {
  const [code, setCode] = useState(() => { const e = gemerkteEinladung(); return e && e.klasse ? e.klasse : ""; });
  const [vor, setVor] = useState(null);
  const [fehler, setFehler] = useState("");
  const [meldung, setMeldung] = useState("");
  const [bez, neu] = useLaden(meineBeziehungen);
  const klassen = (bez.daten && bez.daten.klassen) || [];
  const sauber = code.trim().toUpperCase();

  const pruefen = async () => {
    setFehler(""); setMeldung(""); setVor(null);
    if (!KLASSENCODE.test(sauber)) { setFehler("Der Klassencode hat 6 Zeichen (Buchstaben und Ziffern)."); return; }
    try {
      const v = await klasseVorschau(sauber);
      if (v && v.status === "ungueltig") setFehler("Diesen Klassencode gibt es nicht. Bitte prüfe ihn.");
      else setVor(v);
    } catch (e) { setFehler(e.message); }
  };
  useEffect(() => { if (KLASSENCODE.test(sauber) && gemerkteEinladung() && gemerkteEinladung().klasse === sauber) pruefen(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const beitreten = async () => {
    try {
      const r = await klasseBeitreten(sauber);
      if (r.status === "ok" || r.status === "schon") { setMeldung(r.status === "ok" ? `Du bist jetzt in „${r.name}“.` : "Du bist schon in dieser Klasse."); setVor(null); setCode(""); einladungVergessen("klasse"); await neu(); }
      else if (r.status === "kein_schueler") setFehler("Nur Schüler können einer Klasse beitreten.");
      else setFehler("Beitritt nicht möglich. Bitte prüfe den Code.");
    } catch (e) { setFehler(e.message); }
  };
  const verlassen = async (id) => { try { await klasseVerlassen(id); await neu(); } catch (e) { setFehler(e.message); } };

  if (rolle !== "schueler") return null;
  return (
    <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
      <Kicker>MEINE KLASSE / MEINE LEHRKRAFT</Kicker>
      <p style={{ ...text, marginBottom: 12 }}>Hat deine Lehrkraft oder dein Nachhilfelehrer dir einen Klassencode gegeben? Gib ihn hier ein. Danach sieht die Lehrkraft, wie aktiv du lernst – so hilft sie dir gezielter.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setVor(null); setFehler(""); }} maxLength={6} placeholder="z. B. K7M3PX" aria-label="Klassencode"
          style={{ ...feld, flex: 1, minWidth: 0, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }} />
        <button type="button" onClick={pruefen} disabled={!sauber} style={knopfVoll(!!sauber)}>Prüfen</button>
      </div>
      {fehler && <p role="alert" style={{ fontSize: 13, color: C.signal, marginTop: 8 }}>{fehler}</p>}
      {meldung && <p role="status" style={{ fontSize: 13.5, color: C.smaragd, marginTop: 8 }}>{meldung}</p>}
      {vor && (
        <div style={{ marginTop: 12, background: C.himmel, borderRadius: 14, padding: 14 }}>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, marginBottom: 10 }}>
            Möchtest du der Klasse <b>{vor.name}</b> ({SCHULFORM_NAME[vor.schulform] || vor.schulform}, Klasse {vor.stufe}) von <b>{vor.lehrkraft}</b> beitreten? {vor.lehrkraft} sieht dann deinen Lernfortschritt. Du kannst jederzeit wieder austreten.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={beitreten} style={knopfVoll()}>Ja, beitreten</button>
            <button type="button" onClick={() => setVor(null)} style={knopfRand}>Abbrechen</button>
          </div>
        </div>
      )}
      {klassen.length > 0 && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${C.linie}`, paddingTop: 12 }}>
          {klassen.map((k) => (
            <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.tinte }}>{k.name}</span>
                <span style={{ display: "block", fontSize: 12.5, color: C.grau, fontWeight: 300 }}>Lehrkraft: {k.lehrkraft} · {SCHULFORM_NAME[k.schulform] || k.schulform}, Klasse {k.stufe}</span>
              </span>
              <button type="button" onClick={() => verlassen(k.id)} style={linkKnopf}>Austreten</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================================================================
   PLAN (Free / Pro) – für alle Rollen
   ====================================================================== */
export function PlanKarte({ profil, kinder = [] }) {
  const rolle = profil.rolle || "schueler";
  const pro = profil.plan === "pro" && (!profil.pro_bis || new Date(profil.pro_bis) > new Date());
  const [fehler, setFehler] = useState("");
  const [bestaetigen, setBestaetigen] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [abos, setAbos] = useState([]);
  const [angebot, setAngebot] = useState("pro_jahr");
  const [ziele, setZiele] = useState([]);
  const volljaehrig = !!profil.volljaehrig_erklaert_am;
  const [gebucht] = useState(() => { try { const g = sessionStorage.getItem("mm-pro-danke") === "1"; sessionStorage.removeItem("mm-pro-danke"); return g; } catch (e) { return false; } });
  useEffect(() => { let lebt = true; meineAbos().then((a) => lebt && setAbos(a)); return () => { lebt = false; }; }, [profil.id, profil.plan]);
  // Voreinstellung: der Schüler selbst bzw. das einzige nicht-Pro-Kind
  const offeneKinder = kinder.filter((k) => !(k.plan === "pro" || k.plan === true));
  useEffect(() => {
    if (rolle === "schueler") setZiele([profil.id]);
    else if (offeneKinder.length === 1) setZiele([offeneKinder[0].id]);
  }, [rolle, profil.id, offeneKinder.map((k) => k.id).join(",")]);
  const erklaeren = async () => { try { await volljaehrigErklaeren(); setBestaetigen(false); } catch (e) { setFehler(e.message); } };
  const badge = (an) => ({ display: "inline-block", padding: "3px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, background: an ? C.flaggold : C.sand, color: an ? NAVY : C.grau });
  const istPro = (k) => k.plan === "pro" || k.plan === true;
  const buchen = async (ang, z) => {
    setFehler(""); setLaeuft(true);
    try { await proBuchen(ang, z); } catch (e) { setFehler(e.message); setLaeuft(false); }
  };
  const portal = async () => { setFehler(""); try { await aboVerwalten(); } catch (e) { setFehler(e.message); } };
  const a = ANGEBOTE_ANZEIGE.find((x) => x.id === angebot) || ANGEBOTE_ANZEIGE[0];

  const Angebote = ({ zielListe }) => (
    <div>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginTop: 10 }}>
        {ANGEBOTE_ANZEIGE.map((x) => (
          <button key={x.id} type="button" aria-pressed={angebot === x.id} onClick={() => { setAngebot(x.id); setZiele((z) => z.slice(0, x.maxZiele)); }}
            style={{ textAlign: "left", padding: "12px 14px", borderRadius: 14, border: `2px solid ${angebot === x.id ? C.flaggold : C.linie}`, background: angebot === x.id ? "#FFF8DD" : C.weiss, cursor: "pointer", fontFamily: "inherit", position: "relative" }}>
            {x.empfohlen && <span style={{ position: "absolute", top: -9, right: 10, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", background: C.flaggold, color: NAVY, padding: "2px 8px", borderRadius: 999 }}>BELIEBT</span>}
            <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: C.tinte }}>{x.name}</span>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.see, marginTop: 2 }}>{x.preis}</span>
            <span style={{ display: "block", fontSize: 12, color: C.grau, marginTop: 2 }}>{x.zeile}</span>
          </button>
        ))}
      </div>
      <ul style={{ margin: "12px 0 0", paddingLeft: 18, fontSize: 13.5, color: C.tinte, lineHeight: 1.7 }}>{PRO_ENTHAELT.map((t) => <li key={t}>{t}</li>)}</ul>
      {zielListe && zielListe.length > 1 && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.tinte, marginBottom: 6 }}>{a.maxZiele > 1 ? `Für welche Kinder? (bis zu ${a.maxZiele})` : "Für welches Kind?"}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {zielListe.map((k) => {
              const an = ziele.includes(k.id);
              return (
                <button key={k.id} type="button" aria-pressed={an} disabled={istPro(k)} onClick={() => setZiele((z) => (an ? z.filter((x) => x !== k.id) : a.maxZiele === 1 ? [k.id] : [...z, k.id].slice(0, a.maxZiele)))}
                  style={{ ...knopfRand, height: 38, opacity: istPro(k) ? 0.5 : 1, border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss }}>
                  {k.name}{istPro(k) ? " · Pro" : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
        <button type="button" disabled={laeuft || !ziele.length} onClick={() => buchen(angebot, ziele)} style={{ ...knopfVoll(!laeuft && ziele.length > 0), background: laeuft || !ziele.length ? C.hellgrau : C.smaragd }}>
          {laeuft ? "Weiter zu Stripe …" : `${a.name} buchen – ${a.preis}`}
        </button>
        <span style={{ fontSize: 12, color: C.hellgrau }}>Bezahlung über Stripe, jederzeit kündbar.</span>
      </div>
    </div>
  );

  const AboListe = () => (abos.length ? (
    <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.linie}` }}>
      {abos.map((ab) => (
        <p key={ab.abo_id} style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.6 }}>
          <b>{ab.plan === "familie" ? "Familie" : "Pro"}</b> · {ab.status === "active" || ab.status === "trialing" ? "aktiv" : ab.status === "past_due" ? "Zahlung offen" : "beendet"}
          {ab.laeuft_bis ? ` · bis ${new Date(ab.laeuft_bis).toLocaleDateString("de-DE")}` : ""}{ab.ziele && ab.ziele.length ? ` · ${ab.ziele.map((z) => z.name).join(", ")}` : ""}
        </p>
      ))}
      <button type="button" onClick={portal} style={{ ...knopfRand, height: 38, marginTop: 6 }}>Abo verwalten (Rechnungen, Kündigung)</button>
    </div>
  ) : null);

  return (
    <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
      <Kicker>MEIN PLAN</Kicker>
      {gebucht && <p role="status" style={{ background: "#E6F6EF", color: "#0F7A4D", borderRadius: 12, padding: "9px 12px", fontSize: 13.5, fontWeight: 600, marginBottom: 12 }}>Danke! Die Freischaltung kommt in wenigen Sekunden – lade die Seite gleich neu, falls das Abzeichen noch Free zeigt.</p>}
      {rolle === "eltern" ? (
        <>
          <p style={{ ...text, marginBottom: 12 }}>Als Elternteil nutzt du Mythos Mathe kostenlos: Du siehst die Wochenübersicht deiner Kinder und hast Zugriff auf den Mathe-Mindset-Kurs. Pro schaltest du für deine Kinder frei.</p>
          {kinder.length === 0 ? <p style={{ fontSize: 13.5, color: C.grau }}>Sobald ein Kind verbunden ist, kannst du hier Pro buchen.</p> : (<>
            {kinder.map((k) => (
              <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: `1px solid ${C.linie}` }}>
                <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: C.tinte }}>{k.name}</span>
                <span style={badge(istPro(k))}>{istPro(k) ? "Pro" : "Free"}</span>
              </div>
            ))}
            {offeneKinder.length > 0 && <Angebote zielListe={offeneKinder} />}
          </>)}
          <AboListe />
        </>
      ) : rolle === "schueler" ? (
        <>
          <p style={{ marginBottom: 10 }}><span style={badge(pro)}>{pro ? "Pro" : "Free"}</span>{pro && profil.pro_bis && <span style={{ fontSize: 13, color: C.grau, marginLeft: 10 }}>bis {new Date(profil.pro_bis).toLocaleDateString("de-DE")}</span>}</p>
          <p style={{ ...text, marginBottom: 10 }}>
            {pro ? "Dein Pro-Zugang ist aktiv." : volljaehrig ? "Du lernst im kostenlosen Plan. Du hast erklärt, volljährig zu sein, und kannst Pro selbst buchen." : "Du lernst im kostenlosen Plan. Pro schalten deine Eltern für dich frei – sie bezahlen und verwalten es in ihrem Konto (Eltern-Link oben)."}
          </p>
          {!pro && !volljaehrig && !bestaetigen && (
            <button type="button" onClick={() => setBestaetigen(true)} style={linkKnopf}>Ich bin 18 oder älter</button>
          )}
          {!pro && bestaetigen && (
            <div style={{ background: C.sand, borderRadius: 12, padding: 12 }}>
              <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.55, marginBottom: 8 }}>Mit Klick erklärst du, dass du mindestens 18 Jahre alt bist. Dann kannst du Pro selbst buchen. Wir können einen Altersnachweis verlangen.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={erklaeren} style={{ ...knopfVoll(), height: 40 }}>Ja, ich bin volljährig</button>
                <button type="button" onClick={() => setBestaetigen(false)} style={{ ...knopfRand, height: 40 }}>Abbrechen</button>
              </div>
            </div>
          )}
          {volljaehrig && !pro && <Angebote zielListe={null} />}
          <AboListe />
        </>
      ) : (
        <>
          <p style={{ marginBottom: 10 }}><span style={badge(pro)}>{pro ? "Pro" : "Free"}</span></p>
          <p style={text}>Du nutzt Mythos Mathe als {rolleName(rolle)} kostenlos. Welche Funktionen ein Pro-Plan für Lehrende enthält, legen wir noch fest – hier erscheint er dann.</p>
        </>
      )}
      {fehler && <p role="alert" style={{ fontSize: 13, color: C.signal, marginTop: 8 }}>{fehler}</p>}
    </div>
  );
}

/* ======================================================================
   ELTERN: Wochenübersicht je Kind
   ====================================================================== */
function Balken({ tage }) {
  const max = Math.max(30, ...tage.map((t) => t.minuten));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 6, alignItems: "end", height: 92 }} role="img"
      aria-label={"Lernminuten pro Tag: " + tage.map((t) => `${t.name} ${t.minuten}`).join(", ")}>
      {tage.map((t) => (
        <div key={t.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
          <span style={{ fontSize: 10.5, color: C.grau, marginBottom: 2 }}>{t.minuten > 0 ? t.minuten : ""}</span>
          <span style={{ width: "100%", maxWidth: 28, height: Math.max(t.minuten > 0 ? 4 : 2, (t.minuten / max) * 56), borderRadius: 5, background: t.minuten > 0 ? C.see : t.zukunft ? "transparent" : C.linie }} />
          <span style={{ fontSize: 11, marginTop: 4, fontWeight: t.heute ? 800 : 500, color: t.heute ? C.see : C.hellgrau }}>{t.name}</span>
        </div>
      ))}
    </div>
  );
}

function KindKarte({ kind }) {
  const w = wochenUebersicht(kind);
  const [offen, setOffen] = useState(false);
  const [det, setDet] = useState(null);
  const [fehler, setFehler] = useState("");
  const aufklappen = async () => {
    setOffen(!offen);
    if (!offen && !det) { try { setDet(await schuelerDetail(kind.id)); } catch (e) { setFehler(e.message); } }
  };
  const noten = det && det.noten ? Object.entries(det.noten).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])) : [];
  return (
    <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <span style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 999, background: `linear-gradient(155deg, ${C.see} 0%, ${NAVY} 100%)`, color: C.flaggold, fontSize: 19, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{(kind.name || "?").slice(0, 1).toUpperCase()}</span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: "block", fontSize: 17, fontWeight: 700, color: C.tinte }}>{kind.name}</span>
          <span style={{ display: "block", fontSize: 12.5, color: C.grau, fontWeight: 300 }}>
            {kind.klasse ? `Klasse ${kind.klasse} · ` : ""}zuletzt aktiv: {zuletztText(kind.letzte_aktivitaet)}
          </span>
        </span>
        {kind.beispiel && <span style={{ fontSize: 11, fontWeight: 700, color: "#6B5310", background: "#FDF8EA", border: `1px solid ${C.goldWarm}66`, borderRadius: 999, padding: "2px 8px" }}>Beispiel</span>}
      </div>
      <Kicker>DIESE WOCHE · LERNMINUTEN</Kicker>
      <Balken tage={w.tage} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 14 }}>
        {[[w.minuten, "Minuten"], [w.aufgaben, "Aufgaben"], [w.prozent === null ? "–" : `${w.prozent} %`, "richtig"]].map(([z, l]) => (
          <div key={l} style={{ background: C.sand, borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: 20, fontWeight: 800, color: C.tinte }}>{z}</span>
            <span style={{ display: "block", fontSize: 11.5, color: C.grau }}>{l}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13.5, color: C.grau, marginTop: 12, lineHeight: 1.6 }}>
        <b style={{ color: C.tinte }}>Mathe entdecken:</b> {entdeckenText(kind.entdecken)}
      </p>
      <button type="button" onClick={aufklappen} aria-expanded={offen} style={{ ...linkKnopf, marginTop: 8 }}>{offen ? "Details ausblenden" : "Details anzeigen"}</button>
      {offen && (
        <div style={{ marginTop: 10, borderTop: `1px solid ${C.linie}`, paddingTop: 10 }}>
          {fehler && <p style={{ fontSize: 13, color: C.signal }}>{fehler}</p>}
          {!det ? <p style={{ fontSize: 13.5, color: C.grau }}>Lädt …</p> : (
            <>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Mathe-Noten</p>
              {noten.length === 0 ? <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Noch keine Noten eingetragen.</p> : (
                <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.8 }}>{noten.map(([k, v]) => <span key={k} style={{ display: "inline-block", marginRight: 14 }}>Kl. {k}: <b>{v}</b></span>)}</p>
              )}
              <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "10px 0 6px" }}>Mathe entdecken</p>
              <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>
                Hauptvideo: {kind.entdecken && kind.entdecken.video_haupt ? "gesehen" : "noch nicht gesehen"} · Reflexionsfragen: {(kind.entdecken && kind.entdecken.reflexion_n) || 0} von 3 beantwortet
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function ElternBereich({ profil, gehe, kinderRef }) {
  const [d, neu] = useLaden(meineKinder);
  const [link, setLink] = useState("");
  const [fehler, setFehler] = useState("");
  const [ok, setOk] = useState("");
  useEffect(() => { if (kinderRef) kinderRef(d.daten || []); }, [d.daten]); // eslint-disable-line react-hooks/exhaustive-deps
  const kinder = d.daten || [];
  const verbinden = async () => {
    setFehler(""); setOk("");
    const e = einladungAusUrl(link.trim().startsWith("http") ? link.trim() : "https://" + link.trim());
    if (!e || !e.token) { setFehler("In diesem Link fehlt der Einladungsschlüssel. Bitte lass dir den Link über „Eltern per WhatsApp einladen“ im Konto deines Kindes schicken."); return; }
    try {
      const r = await elternVerbinden(e.token);
      if (r.status === "ok") { setOk(`Du bist jetzt mit ${r.name} verbunden.`); setLink(""); await neu(); }
      else if (r.status === "schon") setOk(`Du bist schon mit ${r.name} verbunden.`);
      else if (r.status === "zu_viele") setFehler("Dieses Kind hat schon die höchste Zahl an verbundenen Elternteilen.");
      else if (r.status === "keine_eltern") setFehler("Nur Elternkonten können sich mit einem Kind verbinden.");
      else setFehler("Dieser Link ist nicht mehr gültig. Bitte lass dir einen neuen schicken.");
    } catch (er) { setFehler(er.message); }
  };
  return (
    <>
      {DEMO && kinder.some((k) => k.beispiel) && <p style={{ fontSize: 12.5, color: "#6B5310", marginBottom: 10 }}>Vorschau: Diese Kinder und Zahlen sind Beispieldaten.</p>}
      {d.laden ? <p style={{ fontSize: 14, color: C.grau }}>Einen Moment …</p> : kinder.length === 0 ? (
        <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
          <Kicker>DEINE KINDER</Kicker>
          <p style={text}>Noch ist kein Kind verbunden. Dein Kind erzeugt in seinem Konto mit „Eltern per WhatsApp einladen“ einen Link und schickt ihn dir. Du kannst ihn unten auch einfügen.</p>
        </div>
      ) : kinder.map((k) => <KindKarte key={k.id} kind={k} />)}

      <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
        <Kicker>WEITERES KIND VERBINDEN</Kicker>
        <p style={{ ...text, marginBottom: 10 }}>Füge den Einladungslink deines Kindes ein.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Einladungslink einfügen" aria-label="Einladungslink" style={{ ...feld, flex: 1, minWidth: 0 }} />
          <button type="button" onClick={verbinden} disabled={!link.trim()} style={knopfVoll(!!link.trim())}>Verbinden</button>
        </div>
        {fehler && <p role="alert" style={{ fontSize: 13, color: C.signal, marginTop: 8, lineHeight: 1.5 }}>{fehler}</p>}
        {ok && <p role="status" style={{ fontSize: 13.5, color: C.smaragd, marginTop: 8 }}>{ok}</p>}
      </div>

      <div style={{ ...karte, padding: 18, marginBottom: 14, background: `linear-gradient(155deg, ${C.see} 0%, ${NAVY} 100%)`, color: C.weiss }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.flaggold, marginBottom: 6 }}>FÜR ELTERN · KOSTENLOS</p>
        <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Mathe-Mindset-Kurs</p>
        <p style={{ fontSize: 14, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.6, marginBottom: 12 }}>6 TED-Talks und 2 Bücher, die inspirieren, wie Mathe auch funktionieren kann. Der Kernkurs für Eltern folgt.</p>
        <button type="button" onClick={() => gehe({ ansicht: "elternkurs" })} style={{ height: 44, padding: "0 22px", borderRadius: 999, border: "none", background: C.flaggold, color: NAVY, fontSize: 14.5, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>Kurs öffnen</button>
      </div>
    </>
  );
}

/* ======================================================================
   LEHRKRÄFTE / NACHHILFE: Klassen und Ampel
   ====================================================================== */
const AMPEL_FARBE = { rot: "#E0485A", gelb: "#F2B31A", gruen: "#2DA865", grau: "#B8BFCC" };
const Punkt = ({ farbe, gross }) => <span aria-hidden="true" style={{ display: "inline-block", width: gross ? 14 : 12, height: gross ? 14 : 12, borderRadius: 999, background: AMPEL_FARBE[farbe], flexShrink: 0 }} />;

/* Coach/Lehrkraft legt einen Eintrag in den Tagesplan des Schülers („Mein Mathe-Training“, supabase/training.sql).
   Der Coach (Nachhilfe) darf immer, die Lehrkraft nur, wenn der Schüler es freigegeben hat. */
function AuftragGeben({ schuelerId, rolle }) {
  const [liste, setListe] = useState(null);
  const [titel, setTitel] = useState("");
  const [zeile, setZeile] = useState("");
  const [faellig, setFaellig] = useState("");
  const [fehler, setFehler] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const laden = useCallback(() => auftraegeFuer(schuelerId).then((l) => setListe(Array.isArray(l) ? l : [])).catch(() => setListe([])), [schuelerId]);
  useEffect(() => { laden(); }, [laden]);
  const senden = async () => {
    setLaeuft(true); setFehler("");
    try { await auftragGeben(schuelerId, { titel, zeile, faellig: faellig || null }); setTitel(""); setZeile(""); setFaellig(""); laden(); }
    catch (e) { setFehler(e.message); }
    setLaeuft(false);
  };
  const weg = async (id) => { try { await auftragLoeschen(id); laden(); } catch (e) { /* egal */ } };
  const offen = (liste || []).filter((a) => !a.erledigt);
  return (
    <div style={{ marginTop: 12, background: C.himmel, borderRadius: 14, padding: 12 }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: C.see, marginBottom: 6 }}>IN DEN TAGESPLAN LEGEN</p>
      <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.5, marginBottom: 8 }}>{rolle === "nachhilfe" ? "Aufträge stehen oben im Tagesplan deines Schülers und verfallen nicht." : "Nur möglich, wenn der Schüler es in seinem Training freigegeben hat. Aufträge stehen oben im Tagesplan und verfallen nicht."}</p>
      <input value={titel} onChange={(e) => setTitel(e.target.value)} maxLength={120} placeholder="z. B. Buch S. 42, Nr. 3–5" aria-label="Auftrag" style={{ ...feld, marginBottom: 6 }} />
      <input value={zeile} onChange={(e) => setZeile(e.target.value)} maxLength={200} placeholder="Hinweis (optional)" aria-label="Hinweis zum Auftrag" style={{ ...feld, marginBottom: 6 }} />
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input type="date" value={faellig} onChange={(e) => setFaellig(e.target.value)} aria-label="Bis wann (optional)" style={{ ...feld, width: "auto", padding: "8px 12px", fontSize: 14 }} />
        <button type="button" onClick={senden} disabled={laeuft || !titel.trim()} style={{ ...knopfVoll(!!titel.trim() && !laeuft), height: 40 }}>{laeuft ? "Einen Moment …" : "In den Plan legen"}</button>
      </div>
      {fehler && <p role="alert" style={{ fontSize: 13, color: C.signal, marginTop: 6 }}>{fehler}</p>}
      {offen.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {offen.map((a) => (
            <p key={a.id} style={{ fontSize: 13, color: C.tinte, lineHeight: 1.6, display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ flex: 1 }}>○ {a.titel}{a.faellig ? ` · bis ${a.faellig.split("-").reverse().join(".")}` : ""}</span>
              <button type="button" onClick={() => weg(a.id)} style={{ ...linkKnopf, color: C.signal }}>löschen</button>
            </p>
          ))}
        </div>
      )}
      {liste && liste.some((a) => a.erledigt) && <p style={{ fontSize: 12, color: C.grau, marginTop: 4 }}>Erledigt: {liste.filter((a) => a.erledigt).length}</p>}
    </div>
  );
}

function SchuelerZeile({ s, klasseId, onEntfernt, rolle }) {
  const [offen, setOffen] = useState(false);
  const [det, setDet] = useState(null);
  const [frage, setFrage] = useState(false);
  const w = wochenUebersicht(s);
  const aufklappen = async () => { setOffen(!offen); if (!offen && !det) { try { setDet(await schuelerDetail(s.id)); } catch (e) { /* egal */ } } };
  const entfernen = async () => { try { await klasseSchuelerEntfernen(klasseId, s.id); onEntfernt(); } catch (e) { /* egal */ } };
  return (
    <div style={{ borderTop: `1px solid ${C.linie}` }}>
      <button type="button" onClick={aufklappen} aria-expanded={offen}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 0", background: "none", border: "none", fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
        <Punkt farbe={s.ampel.farbe} gross />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.tinte }}>{s.name}</span>
          <span style={{ display: "block", fontSize: 12.5, color: C.grau, fontWeight: 300 }}>{s.ampel.text} · zuletzt aktiv: {zuletztText(s.letzte_aktivitaet)}</span>
        </span>
        <span style={{ fontSize: 12.5, color: C.grau, flexShrink: 0 }}>{w.aktiveTage}/7 Tage</span>
      </button>
      {offen && (
        <div style={{ padding: "0 0 12px 24px" }}>
          <Balken tage={w.tage} />
          <p style={{ fontSize: 13.5, color: C.grau, marginTop: 10, lineHeight: 1.6 }}>
            Diese Woche: <b style={{ color: C.tinte }}>{w.minuten} Min.</b>, <b style={{ color: C.tinte }}>{w.aufgaben}</b> Aufgaben{w.prozent !== null ? `, ${w.prozent} % richtig` : ""}.<br />
            Mathe entdecken: {entdeckenText(s.entdecken)}
          </p>
          {det && det.noten && Object.keys(det.noten).length > 0 && (
            <p style={{ fontSize: 13.5, color: C.grau, marginTop: 4 }}>Noten: {Object.entries(det.noten).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])).map(([k, v]) => `Kl. ${k}: ${v}`).join(" · ")}</p>
          )}
          {!s.beispiel && <AuftragGeben schuelerId={s.id} rolle={rolle} />}
          {!frage ? <button type="button" onClick={() => setFrage(true)} style={{ ...linkKnopf, marginTop: 8, color: C.signal }}>Aus Klasse entfernen</button> : (
            <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13.5, color: C.tinte }}>{s.name} wirklich entfernen?</span>
              <button type="button" onClick={entfernen} style={{ ...knopfVoll(), height: 36, background: C.signal }}>Ja, entfernen</button>
              <button type="button" onClick={() => setFrage(false)} style={{ ...knopfRand, height: 36 }}>Abbrechen</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KlassenKarte({ k, neu }) {
  const [kop, setKop] = useState(false);
  const [kopL, setKopL] = useState(false);
  const [code, setCode] = useState(k.code);
  const [loeschen, setLoeschen] = useState(false);
  const [codeFrage, setCodeFrage] = useState(false);
  const liste = ampelSortiert(k.schueler || []);
  const z = ampelZaehlung(k.schueler || []);
  const link = klassenLink(REF_BASIS, code);
  const nachricht = klassenNachricht(k.name, link, code);
  const codeNeu = async () => { try { const c = await klasseCodeNeu(k.id); if (c) setCode(c); setCodeFrage(false); } catch (e) { /* egal */ } };
  const weg = async () => { try { await klasseLoeschen(k.id); neu(); } catch (e) { /* egal */ } };
  return (
    <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: C.tinte }}>{k.name}</span>
        <span style={{ fontSize: 12.5, color: C.grau }}>{SCHULFORM_NAME[k.schulform] || k.schulform} · Klasse {k.stufe}{k.art === "nachhilfe" ? " · Nachhilfe" : ""}</span>
      </div>
      <div style={{ display: "flex", gap: 14, margin: "8px 0 12px", flexWrap: "wrap" }} aria-label="Ampel-Übersicht">
        {["rot", "gelb", "gruen", "grau"].map((f) => <span key={f} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: C.tinte }}><Punkt farbe={f} /> {z[f]}</span>)}
      </div>

      <div style={{ background: C.himmel, borderRadius: 14, padding: 12, marginBottom: 6 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: C.see, marginBottom: 4 }}>BEITRITTSCODE</p>
        <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.18em", color: NAVY, marginBottom: 8 }}>{code}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href={whatsappLink(nachricht)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", borderRadius: 999, background: "#25D366", color: "#0B3D1E", fontSize: 14, fontWeight: 700, textDecoration: "none" }}><WhatsAppIcon /> Per WhatsApp teilen</a>
          <button type="button" onClick={() => kopieren(link, setKop)} style={{ ...knopfRand, height: 40 }}>{kop ? "Kopiert ✓" : "Link kopieren"}</button>
          <button type="button" onClick={() => kopieren(code, setKopL)} style={{ ...knopfRand, height: 40 }}>{kopL ? "Kopiert ✓" : "Code kopieren"}</button>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        {liste.length === 0 ? <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Noch keine Schüler. Sobald sie mit dem Code beitreten, erscheinen sie hier.</p>
          : liste.map((s) => <SchuelerZeile key={s.id} s={s} klasseId={k.id} onEntfernt={neu} rolle={k.art === "nachhilfe" ? "nachhilfe" : "lehrkraft"} />)}
      </div>
      <p style={{ fontSize: 11.5, color: C.hellgrau, lineHeight: 1.5, marginTop: 10 }}>Die Ampel zeigt Aktivität, nicht Leistung: grün = an mindestens 2 der letzten 7 Tage gelernt, gelb = an 1 Tag oder zuletzt vor 8–14 Tagen, rot = länger als 14 Tage nicht aktiv, grau = noch nicht gestartet.</p>

      <div style={{ marginTop: 12, display: "flex", gap: 14, flexWrap: "wrap" }}>
        {!codeFrage ? <button type="button" onClick={() => setCodeFrage(true)} style={linkKnopf}>Neuen Code erzeugen</button> : (
          <span style={{ fontSize: 13, color: C.tinte }}>Der alte Code gilt dann nicht mehr. <button type="button" onClick={codeNeu} style={linkKnopf}>Ja, neuer Code</button> · <button type="button" onClick={() => setCodeFrage(false)} style={linkKnopf}>Abbrechen</button></span>
        )}
        {!loeschen ? <button type="button" onClick={() => setLoeschen(true)} style={{ ...linkKnopf, color: C.signal }}>Klasse löschen</button> : (
          <span style={{ fontSize: 13, color: C.tinte }}>Klasse samt Zuordnung löschen? <button type="button" onClick={weg} style={{ ...linkKnopf, color: C.signal }}>Ja, löschen</button> · <button type="button" onClick={() => setLoeschen(false)} style={linkKnopf}>Abbrechen</button></span>
        )}
      </div>
    </div>
  );
}

function KlasseAnlegen({ rolle, fertig }) {
  const [name, setName] = useState("");
  const [sf, setSf] = useState("G9");
  const [stufe, setStufe] = useState(7);
  const [fehler, setFehler] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const max = maxStufe(sf);
  const stufen = Array.from({ length: max - 4 }, (_, i) => i + 5);
  const anlegen = async () => {
    setLaeuft(true); setFehler("");
    try {
      const r = await klasseAnlegen(name.trim(), sf, Math.min(stufe, max));
      if (r.status === "ok") { setName(""); fertig(); } else setFehler("Die Klasse konnte nicht angelegt werden. Bitte prüfe die Angaben.");
    } catch (e) { setFehler(e.message); }
    setLaeuft(false);
  };
  const pille = (an) => ({ padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss, color: an ? C.see : C.tinte, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700 });
  return (
    <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
      <Kicker>{rolle === "nachhilfe" ? "NEUE GRUPPE / NEUER SCHÜLERKREIS" : "NEUE KLASSE"}</Kicker>
      <label htmlFor="klasse-name" style={{ fontSize: 13, fontWeight: 600, color: C.see }}>Name</label>
      <input id="klasse-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder={rolle === "nachhilfe" ? "z. B. Dienstag-Gruppe" : "z. B. 7a"} style={{ ...feld, marginTop: 6, marginBottom: 14 }} />
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Schulform</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 14 }}>
        {["G8", "G9", "GMS"].map((s) => <button key={s} type="button" onClick={() => { setSf(s); if (stufe > maxStufe(s)) setStufe(maxStufe(s)); }} style={pille(sf === s)}>{SCHULFORM_NAME[s]}</button>)}
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Klassenstufe</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {stufen.map((k) => (
          <button key={k} type="button" onClick={() => setStufe(k)} aria-pressed={stufe === k}
            style={{ width: 44, height: 40, borderRadius: 10, border: `1.5px solid ${stufe === k ? C.see : C.linie}`, background: stufe === k ? C.see : C.weiss, color: stufe === k ? C.weiss : C.tinte, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>{k}</button>
        ))}
      </div>
      {fehler && <p role="alert" style={{ fontSize: 13, color: C.signal, marginBottom: 8 }}>{fehler}</p>}
      <button type="button" onClick={anlegen} disabled={laeuft || !name.trim()} style={knopfVoll(!!name.trim() && !laeuft)}>{laeuft ? "Einen Moment …" : "Anlegen und Code erzeugen"}</button>
    </div>
  );
}

export function LehrBereich({ profil, gehe }) {
  const rolle = profil.rolle;
  const [d, neu] = useLaden(klassenUebersicht);
  const klassen = d.daten || [];
  return (
    <>
      {DEMO && klassen.some((k) => (k.schueler || []).some((s) => s.beispiel)) && <p style={{ fontSize: 12.5, color: "#6B5310", marginBottom: 10 }}>Vorschau: Die Beispielklasse zeigt, wie deine Ansicht aussehen wird.</p>}
      {d.laden ? <p style={{ fontSize: 14, color: C.grau }}>Einen Moment …</p> : klassen.map((k) => <KlassenKarte key={k.id} k={k} neu={neu} />)}
      {d.fehler && <p style={{ fontSize: 13.5, color: C.signal }}>{d.fehler}</p>}
      <KlasseAnlegen rolle={rolle} fertig={neu} />
      {rolle === "nachhilfe" && ANGEBOT.kurse && (
        <div style={{ ...karte, padding: 18, marginBottom: 14, background: `linear-gradient(155deg, ${C.see} 0%, ${NAVY} 100%)`, color: C.weiss }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.flaggold, marginBottom: 6 }}>FÜR NACHHILFELEHRER:INNEN</p>
          <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Nachhilfe-Kurs</p>
          <p style={{ fontSize: 14, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.6, marginBottom: 12 }}>Wie du Schüler in Mathe wirklich weiterbringst – Diagnose, Erklären, Üben, Motivation und Elternarbeit.</p>
          <button type="button" onClick={() => gehe({ ansicht: "nachhilfekurs" })} style={{ height: 44, padding: "0 22px", borderRadius: 999, border: "none", background: C.flaggold, color: NAVY, fontSize: 14.5, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>Kurs öffnen</button>
        </div>
      )}
    </>
  );
}

/* ---------- Rolle ändern (nur solange nichts verbunden ist) ---------- */
export function RolleAendern({ profil }) {
  const [offen, setOffen] = useState(false);
  const [wahl, setWahl] = useState(profil.rolle || "schueler");
  const [wahlG, setWahlG] = useState(profil.geschlecht || "");
  const [msg, setMsg] = useState("");
  const speichern = async () => {
    setMsg("");
    if (wahl === "schueler" && !istGeschlecht(wahlG)) { setMsg("Bitte wähle Schüler oder Schülerin."); return; }
    try {
      if (wahl === (profil.rolle || "schueler")) {
        // Gleiche Rolle: nur das Geschlecht ändern (das geht auch, wenn schon etwas verbunden ist)
        if (wahl === "schueler" && wahlG !== profil.geschlecht) await profilSpeichern({ geschlecht: wahlG });
        setOffen(false);
        return;
      }
      const ok = await rolleWechseln(wahl);
      if (!ok) { setMsg("Die Rolle kann nur geändert werden, solange du mit niemandem verbunden bist (Eltern, Klassen)."); return; }
      if (wahl === "schueler") await profilSpeichern({ geschlecht: wahlG });
      setOffen(false);
    } catch (e) { setMsg(e.message); }
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <button type="button" onClick={() => setOffen(!offen)} aria-expanded={offen} style={linkKnopf}>Rolle: {rolleName(profil.rolle || "schueler", profil.geschlecht)} – ändern</button>
      {offen && (
        <div style={{ ...karte, padding: 14, marginTop: 8 }}>
          <RollenWahl wert={wahl} geschlecht={wahlG} onWahl={(r, g) => { setWahl(r); setWahlG(g || ""); }} />
          {msg && <p role="alert" style={{ fontSize: 13, color: C.signal, marginTop: 8, lineHeight: 1.5 }}>{msg}</p>}
          <button type="button" onClick={speichern} style={{ ...knopfVoll(), marginTop: 10 }}>Speichern</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Bestehende Schüler-Konten ohne Angabe: einmal nachfragen ---------- */
export function GeschlechtFrage({ profil }) {
  const [fehler, setFehler] = useState("");
  if ((profil.rolle || "schueler") !== "schueler" || istGeschlecht(profil.geschlecht)) return null;
  const waehlen = async (g) => {
    setFehler("");
    try { await profilSpeichern({ geschlecht: g }); } catch (e) { setFehler(e.message); }
  };
  return (
    <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
      <Kicker>ANREDE</Kicker>
      <p style={{ ...text, marginBottom: 12 }}>Damit wir dich richtig ansprechen können: Bist du Schüler oder Schülerin?</p>
      <GeschlechtWahl wert="" onWahl={waehlen} />
      {fehler && <p role="alert" style={{ fontSize: 13, color: C.signal, marginTop: 8 }}>{fehler}</p>}
    </div>
  );
}
