import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { karte, Kicker, WhatsAppIcon } from "./funcKontoRollen.jsx";
import { alterAngeben, REF_BASIS, DEMO } from "./konto.js";
import { einwilligungInfo, einwilligungErteilen, einwilligungWiderrufen, einwilligungKinder, einwilligungAlsEltern, einwilligungWiderrufenAlsEltern } from "./kontoRollen.js";
import { UMFANG, einwilligungStatus, einwilligungsLink, elternBitte, mailGueltig, tokenAusUrl } from "./einwilligungLogik.js";
import { whatsappLink } from "./rollenLogik.js";

/* ======================================================================
   ELTERN-EINWILLIGUNG UNTER 16
   - AlterWahl / AlterFrage: Schüler sagt beim Anlegen (oder einmal nachträglich), ob er unter 16 ist.
   - ElternZustimmungKarte: Schüler unter 16 sieht den Stand und schickt seinen Eltern den Link.
   - EinwilligungSeite (/einwilligung?k=…): Eltern lesen, stimmen zu oder widerrufen – ohne eigenes Konto.
   - KinderEinwilligungKarte: dasselbe im Elternkonto für verbundene Kinder.
   Durchgesetzt wird alles in supabase/einwilligung.sql.
   ====================================================================== */

const text = { fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.65 };
const feld = { width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.linie}`, borderRadius: 12, padding: "11px 14px", fontSize: 16, fontFamily: "inherit", color: C.tinte, background: C.weiss, outline: "none" };
const knopfVoll = (an = true) => ({ height: 48, padding: "0 22px", borderRadius: 999, border: "none", background: an ? C.see : C.hellgrau, color: C.weiss, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: an ? "pointer" : "default" });
const linkKnopf = { background: "none", border: "none", padding: 0, color: C.see, textDecoration: "underline", fontFamily: "inherit", fontSize: 13.5, cursor: "pointer" };
const datum = (d) => (d ? new Date(d).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : "");

function Haken({ an, onClick, gesperrt, children }) {
  return (
    <button type="button" onClick={gesperrt ? undefined : onClick} aria-pressed={an}
      style={{ display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", background: "none", border: "none", padding: "6px 0", cursor: gesperrt ? "default" : "pointer", fontFamily: "inherit", width: "100%" }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `2px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss,
        color: C.weiss, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1, opacity: gesperrt ? 0.7 : 1 }}>{an ? "✓" : ""}</span>
      <span style={{ flex: 1 }}>{children}</span>
    </button>
  );
}

/* ---------- Altersangabe ---------- */
export function AlterWahl({ wert, onWahl }) {
  const opt = [[false, "16 oder älter"], [true, "Jünger als 16"]];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {opt.map(([v, n]) => {
        const an = wert === v;
        return (
          <button key={n} type="button" onClick={() => onWahl(v)} aria-pressed={an}
            style={{ padding: "11px 12px", borderRadius: 12, border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss,
              color: an ? C.see : C.tinte, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>{n}</button>
        );
      })}
    </div>
  );
}

export function AlterFrage({ profil }) {
  const [fehler, setFehler] = useState("");
  if (einwilligungStatus(profil) !== "alter_fehlt") return null;
  const waehlen = async (u16) => { setFehler(""); try { await alterAngeben(u16); } catch (e) { setFehler(e.message); } };
  return (
    <div style={{ ...karte, padding: 18, marginBottom: 14, border: `1.5px solid ${C.flaggold}` }}>
      <Kicker>KURZE FRAGE</Kicker>
      <p style={{ ...text, marginBottom: 12 }}>Bist du schon 16? Unter 16 brauchen wir für das Speichern im Konto die Zustimmung deiner Eltern. Bis du antwortest, bleibt dein Lernstand nur auf diesem Gerät.</p>
      <AlterWahl wert={null} onWahl={waehlen} />
      {fehler && <p role="alert" style={{ fontSize: 13, color: C.signal, marginTop: 8 }}>{fehler}</p>}
    </div>
  );
}

/* ---------- Schüler unter 16: Stand und Link für die Eltern ---------- */
export function ElternZustimmungKarte({ profil }) {
  const [kopiert, setKopiert] = useState(false);
  const status = einwilligungStatus(profil);
  if (status !== "fehlt" && status !== "erteilt") return null;
  const link = einwilligungsLink(REF_BASIS, profil.eltern_token);
  const vorname = (profil.name || "").split(" ")[0];
  const e = profil.einwilligung || {};
  const kopieren = async () => { try { await navigator.clipboard.writeText(link); setKopiert(true); setTimeout(() => setKopiert(false), 1800); } catch (er) { /* manuell */ } };

  if (status === "erteilt") {
    const teile = UMFANG.filter((u) => e[u.id]).map((u) => u.titel);
    return (
      <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
        <Kicker>ZUSTIMMUNG DEINER ELTERN</Kicker>
        <p style={{ ...text, marginBottom: 6 }}>
          <b style={{ color: C.smaragd, fontWeight: 700 }}>✓ Erteilt</b>{e.von ? ` von ${e.von}` : ""}{e.erteilt_am ? ` am ${datum(e.erteilt_am)}` : ""}.
        </p>
        <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6 }}>Freigegeben: {teile.join(" · ")}.</p>
        {(!e.ki || !e.klassen) && <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, marginTop: 6 }}>Für mehr können deine Eltern ihre Zustimmung über denselben Link jederzeit erweitern.</p>}
      </div>
    );
  }
  return (
    <div style={{ ...karte, padding: 18, marginBottom: 14, border: `1.5px solid ${C.flaggold}` }}>
      <Kicker>ZUSTIMMUNG DEINER ELTERN FEHLT</Kicker>
      <p style={{ ...text, marginBottom: 12 }}>
        Weil du unter 16 bist, dürfen wir deinen Lernstand erst im Konto speichern, wenn ein Elternteil zustimmt. Bis dahin funktioniert alles weiter – aber nur auf diesem Gerät. Mathilda und Klassen schalten deine Eltern gleich mit frei.
      </p>
      <a href={whatsappLink(elternBitte(vorname, link))} target="_blank" rel="noopener noreferrer"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 50, borderRadius: 999, background: "#25D366", color: "#0B3D1E", fontSize: 15.5, fontWeight: 700, textDecoration: "none" }}>
        <WhatsAppIcon /> Eltern um Zustimmung bitten
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, background: C.sand || "#F6F4EF", borderRadius: 12, padding: "9px 12px" }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.tinte, userSelect: "all" }}>{link}</span>
        <button type="button" onClick={kopieren} style={{ ...linkKnopf, fontSize: 13, flexShrink: 0 }}>{kopiert ? "Kopiert ✓" : "Kopieren"}</button>
      </div>
      <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.6, marginTop: 10 }}>Bitte stimme nicht selbst zu – das zählt nicht und kann dein Konto sperren. Den Link sollen nur deine Eltern öffnen.</p>
    </div>
  );
}

/* ---------- Formular der Eltern (Seite und Elternkonto) ---------- */
function ZustimmungsFormular({ vorname, vorher, mitKontaktfeldern, onSenden, knopf = "Zustimmen" }) {
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [ki, setKi] = useState(!!(vorher && vorher.ki));
  const [klassen, setKlassen] = useState(!!(vorher && vorher.klassen));
  const [sorge, setSorge] = useState(false);
  const [gelesen, setGelesen] = useState(false);
  const [fehler, setFehler] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const bereit = sorge && gelesen && (!mitKontaktfeldern || (name.trim().length >= 2 && mailGueltig(mail)));
  const senden = async () => {
    if (!bereit) { setFehler(mitKontaktfeldern && !mailGueltig(mail) ? "Bitte gib eine gültige E-Mail-Adresse ein." : "Bitte fülle alles aus und setze beide Haken unten."); return; }
    setLaeuft(true); setFehler("");
    try { await onSenden({ name: name.trim(), email: mail.trim(), ki, klassen }); } catch (e) { setFehler(e.message); }
    setLaeuft(false);
  };
  const an = { konto: true, ki, klassen };
  const setzen = { ki: () => setKi(!ki), klassen: () => setKlassen(!klassen) };
  return (
    <>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "4px 0 6px" }}>Ich erlaube für {vorname || "mein Kind"}:</p>
      {UMFANG.map((u) => (
        <Haken key={u.id} an={an[u.id]} gesperrt={u.pflicht} onClick={setzen[u.id]}>
          <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: C.tinte }}>{u.titel}{u.pflicht ? " (Grundlage)" : " (freiwillig)"}</span>
          <span style={{ display: "block", fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>{u.text}</span>
        </Haken>
      ))}
      {mitKontaktfeldern && (
        <div style={{ display: "grid", gap: 10, margin: "14px 0 6px" }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.see }}>Ihr Name
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} style={{ ...feld, marginTop: 6 }} />
          </label>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.see }}>Ihre E-Mail-Adresse
            <input value={mail} onChange={(e) => setMail(e.target.value)} type="email" autoComplete="email" inputMode="email" maxLength={200} style={{ ...feld, marginTop: 6 }} />
          </label>
          <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.6 }}>Name und E-Mail speichern wir nur als Nachweis Ihrer Zustimmung und um Sie bei Änderungen zu erreichen.</p>
        </div>
      )}
      <div style={{ borderTop: `1px solid ${C.linie}`, marginTop: 12, paddingTop: 8 }}>
        <Haken an={sorge} onClick={() => setSorge(!sorge)}>
          <span style={{ fontSize: 14, color: C.tinte, lineHeight: 1.6 }}>Ich bin für {vorname || "das Kind"} sorgeberechtigt. Bei gemeinsamem Sorgerecht ist der andere Elternteil einverstanden.</span>
        </Haken>
        <Haken an={gelesen} onClick={() => setGelesen(!gelesen)}>
          <span style={{ fontSize: 14, color: C.tinte, lineHeight: 1.6 }}>
            Ich habe die <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: C.see }}>Datenschutzerklärung</a> gelesen. Mir ist bekannt, dass ich die Zustimmung jederzeit über diesen Link widerrufen kann.
          </span>
        </Haken>
      </div>
      {fehler && <p role="alert" style={{ fontSize: 13.5, color: C.signal, marginTop: 8 }}>{fehler}</p>}
      <button type="button" onClick={senden} disabled={laeuft} style={{ ...knopfVoll(bereit), width: "100%", marginTop: 14 }}>{laeuft ? "Einen Moment …" : knopf}</button>
    </>
  );
}

/* ---------- Seite /einwilligung?k=… ---------- */
export function EinwilligungSeite() {
  const [token] = useState(() => (typeof window !== "undefined" ? tokenAusUrl(window.location.href) : ""));
  const [info, setInfo] = useState(null);
  const [fehler, setFehler] = useState("");
  const [aendern, setAendern] = useState(false);
  const [fertig, setFertig] = useState("");
  const laden = async () => {
    if (!token) { setInfo({ status: "ungueltig" }); return; }
    try { setInfo(await einwilligungInfo(token)); } catch (e) { setFehler(e.message); setInfo({ status: "fehler" }); }
  };
  useEffect(() => { laden(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const erteilen = async (werte) => {
    const r = await einwilligungErteilen(token, werte);
    if (r && r.status === "selbst") throw new Error("Bitte öffne diesen Link nicht im Konto deines Kindes – die Zustimmung muss ein Elternteil geben.");
    if (!r || r.status !== "ok") throw new Error("Dieser Link ist nicht mehr gültig. Bitte lassen Sie sich von Ihrem Kind einen neuen schicken.");
    setFertig("Vielen Dank! Ihre Zustimmung ist gespeichert. Ihr Kind sieht das beim nächsten Öffnen der App.");
    setAendern(false);
    await laden();
  };
  const widerrufen = async () => {
    if (!window.confirm("Zustimmung wirklich widerrufen? Der im Konto gespeicherte Lernstand Ihres Kindes wird dann gelöscht.")) return;
    try {
      const r = await einwilligungWiderrufen(token);
      if (!r || r.status !== "ok") throw new Error("Das hat nicht geklappt.");
      setFertig("Die Zustimmung ist widerrufen. Die gespeicherten Lerndaten im Konto sind gelöscht; die App läuft für Ihr Kind nur noch auf dem Gerät.");
      await laden();
    } catch (e) { setFehler(e.message); }
  };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      {DEMO && <p style={{ fontSize: 12.5, color: "#6B5310", background: "#FDF8EA", borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>Vorschau-Modus: Die Zustimmung wird nur in diesem Browser gespeichert.</p>}
      {!info ? <p style={text}>Einen Moment …</p> : info.status !== "ok" ? (
        <div style={{ ...karte, padding: 22 }}>
          <p style={{ fontSize: 19, fontWeight: 700, color: C.tinte, marginBottom: 8 }}>Dieser Link funktioniert nicht</p>
          <p style={text}>{fehler || "Der Link ist unvollständig oder nicht mehr gültig. Bitte lassen Sie sich von Ihrem Kind in seinem Konto unter „Eltern um Zustimmung bitten“ einen neuen Link schicken."}</p>
        </div>
      ) : (
        <>
          {fertig && <p role="status" style={{ fontSize: 14, color: "#1B5E3A", background: "#E9F7EF", borderRadius: 12, padding: "10px 14px", marginBottom: 14, lineHeight: 1.6 }}>{fertig}</p>}
          <div style={{ ...karte, padding: 22, marginBottom: 14 }}>
            <p style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", color: C.tinte, marginBottom: 8 }}>
              {info.vorname ? `${info.vorname} möchte mit Mythos Mathe lernen` : "Ihr Kind möchte mit Mythos Mathe lernen"}
            </p>
            <p style={{ ...text, marginBottom: 6 }}>
              Mythos Mathe ist eine Lern-App für Mathematik. Die App selbst funktioniert ohne Konto direkt im Browser. Damit wir den Lernstand Ihres Kindes im Konto speichern dürfen, brauchen wir bei Kindern unter 16 Jahren Ihre Zustimmung (Art. 8 DSGVO).
            </p>
            <p style={{ ...text }}>Wir zeigen keine Werbung, verkaufen keine Daten und nutzen keine Tracking-Dienste. Sie können jede Zustimmung jederzeit hier widerrufen.</p>
          </div>

          {info.erteilt && !aendern ? (
            <div style={{ ...karte, padding: 22, marginBottom: 14 }}>
              <Kicker>IHRE ZUSTIMMUNG</Kicker>
              <p style={{ ...text, marginBottom: 8 }}><b style={{ color: C.smaragd, fontWeight: 700 }}>✓ Erteilt</b>{info.von ? ` von ${info.von}` : ""}{info.erteilt_am ? ` am ${datum(info.erteilt_am)}` : ""}.</p>
              <ul style={{ margin: "0 0 14px", paddingLeft: 18, fontSize: 14, color: C.tinte, lineHeight: 1.8 }}>
                {UMFANG.map((u) => <li key={u.id} style={{ color: info[u.id] ? C.tinte : C.hellgrau }}>{u.titel}: {info[u.id] ? "erlaubt" : "nicht erlaubt"}</li>)}
              </ul>
              <div className="flex flex-wrap" style={{ gap: 16 }}>
                <button type="button" onClick={() => { setAendern(true); setFertig(""); }} style={linkKnopf}>Umfang ändern</button>
                <button type="button" onClick={widerrufen} style={{ ...linkKnopf, color: C.signal }}>Zustimmung widerrufen</button>
              </div>
            </div>
          ) : (
            <div style={{ ...karte, padding: 22, marginBottom: 14 }}>
              <Kicker>{info.erteilt ? "UMFANG ÄNDERN" : "ZUSTIMMUNG GEBEN"}</Kicker>
              {info.unter16 === false && <p style={{ fontSize: 13.5, color: C.grau, marginBottom: 10 }}>Hinweis: Ihr Kind hat angegeben, schon 16 zu sein. Eine Zustimmung ist dann nicht nötig, schadet aber nicht.</p>}
              <ZustimmungsFormular vorname={info.vorname} vorher={info.erteilt ? info : null} mitKontaktfeldern onSenden={erteilen}
                knopf={info.erteilt ? "Änderung speichern" : "Zustimmung erteilen"} />
            </div>
          )}

          <div style={{ ...karte, padding: 22 }}>
            <Kicker>WAS SIE WISSEN SOLLTEN</Kicker>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: C.grau, lineHeight: 1.75 }}>
              <li>Ohne Ihre Zustimmung bleibt alles nur auf dem Gerät Ihres Kindes; nichts wird bei uns gespeichert außer Name und Altersangabe im Konto.</li>
              <li>Mit einem eigenen Elternkonto sehen Sie den Lernfortschritt und erhalten auf Wunsch einen Wochenbericht.</li>
              <li>Beim Widerruf löschen wir Lernstand, Fortschritt und Noten im Konto und beenden Klassen-Mitgliedschaften.</li>
              <li>Das ganze Konto kann Ihr Kind jederzeit selbst löschen, oder Sie schreiben uns – die Kontaktdaten stehen im <a href="/impressum" style={{ color: C.see }}>Impressum</a>.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Elternkonto: Zustimmung für verbundene Kinder ---------- */
export function KinderEinwilligungKarte() {
  const [kinder, setKinder] = useState(null);
  const [offen, setOffen] = useState(null);
  const [meldung, setMeldung] = useState("");
  const laden = async () => { try { setKinder(await einwilligungKinder()); } catch (e) { setKinder([]); } };
  useEffect(() => { laden(); }, []);
  if (!kinder || kinder.length === 0) return null;
  return (
    <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
      <Kicker>ZUSTIMMUNG FÜR KINDER UNTER 16</Kicker>
      {meldung && <p role="status" style={{ fontSize: 13.5, color: C.smaragd, marginBottom: 8 }}>{meldung}</p>}
      {kinder.map((k) => (
        <div key={k.id} style={{ borderTop: `1px solid ${C.linie}`, padding: "12px 0" }}>
          <div className="flex items-center" style={{ gap: 10, justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.tinte }}>{k.vorname}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: k.erteilt ? C.smaragd : C.signal }}>{k.erteilt ? "✓ erteilt" : "fehlt noch"}</span>
          </div>
          {k.erteilt && <p style={{ fontSize: 13, color: C.grau, marginTop: 4 }}>Mathilda: {k.ki ? "ja" : "nein"} · Klassen: {k.klassen ? "ja" : "nein"}{k.erteilt_am ? ` · seit ${datum(k.erteilt_am)}` : ""}</p>}
          {offen === k.id ? (
            <div style={{ marginTop: 8 }}>
              <ZustimmungsFormular vorname={k.vorname} vorher={k.erteilt ? k : null} knopf={k.erteilt ? "Änderung speichern" : "Zustimmung erteilen"}
                onSenden={async ({ ki, klassen }) => {
                  const r = await einwilligungAlsEltern(k.id, ki, klassen);
                  if (!r || r.status !== "ok") throw new Error("Das hat nicht geklappt.");
                  setOffen(null); setMeldung(`Gespeichert für ${k.vorname}.`); await laden();
                }} />
            </div>
          ) : (
            <div className="flex flex-wrap" style={{ gap: 16, marginTop: 6 }}>
              <button type="button" onClick={() => { setOffen(k.id); setMeldung(""); }} style={linkKnopf}>{k.erteilt ? "Umfang ändern" : "Jetzt zustimmen"}</button>
              {k.erteilt && (
                <button type="button" style={{ ...linkKnopf, color: C.signal }} onClick={async () => {
                  if (!window.confirm(`Zustimmung für ${k.vorname} widerrufen? Lernstand und Noten im Konto werden gelöscht.`)) return;
                  try { await einwilligungWiderrufenAlsEltern(k.id); setMeldung("Zustimmung widerrufen."); await laden(); } catch (e) { setMeldung(e.message); }
                }}>Widerrufen</button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
