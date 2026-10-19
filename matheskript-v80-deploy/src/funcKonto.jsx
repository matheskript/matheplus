import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { SpendenTeaser } from "./funcSpenden.jsx";
import { ANGEBOT } from "./angebot.js";
import { RollenWahl, EmailAnmeldung, HinweisLeiste, EinladenBox, MeineKlassen, PlanKarte, ElternBereich, LehrBereich, RolleAendern, GeschlechtFrage } from "./funcKontoRollen.jsx";
import { rolleName, istLehrend, istGeschlecht, KURSSTUFE, NOTEN_AB, datenVollstaendig } from "./rollenLogik.js";
import { MeinTrainingKarte } from "./funcKontoTraining.jsx";
import { AppKarte, DatenKarte, WochenmailKarte } from "./funcKontoDaten.jsx";
import { AlterWahl, AlterFrage, ElternZustimmungKarte, KinderEinwilligungKarte } from "./funcEinwilligung.jsx";
import { darfImKonto } from "./einwilligungLogik.js";
import { DEMO, useKonto, gemerkteEinladung, anmelden, abmelden, profilAnlegen, profilSpeichern } from "./konto.js";

/* ======================================================================
   KONTOBEREICH (ansicht "konto")
   ====================================================================== */

const NAVY = "#0B1E4A";
const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const Kicker = ({ children }) => <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.hellgrau, marginBottom: 10 }}>{children}</p>;

export const SCHULFORMEN = [
  { id: "G8", name: "Gymnasium G8", kurz: "Abi nach Klasse 12", bis: 12, kursstufe: KURSSTUFE.G8 },
  { id: "G9", name: "Gymnasium G9", kurz: "Abi nach Klasse 13", bis: 13, kursstufe: KURSSTUFE.G9 },
  { id: "GMS", name: "Gemeinschaftsschule", kurz: "Oberstufe bis Klasse 13", bis: 13, kursstufe: KURSSTUFE.GMS },
];

/* Punkte (Kursstufe) in eine Note umrechnen, nur für die Verlaufsgrafik */
const alsNote = (wert, punkte) => (punkte ? Math.min(6, Math.max(0.67, (17 - wert) / 3)) : wert);

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#FFFFFF" />
      <path fill="#1877F2" d="M13.4 21v-7.1h2.4l.4-2.8h-2.8V9.3c0-.8.2-1.4 1.4-1.4h1.5V5.4c-.3 0-1.1-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8v2.8h2.4V21h3z" />
    </svg>
  );
}

/* ---------- Abgemeldet: Anmeldekarte ---------- */
function Anmelden({ gehe }) {
  const [laeuft, setLaeuft] = useState(null);
  const los = async (a) => { setLaeuft(a); await anmelden(a); setLaeuft(null); };
  const knopf = { width: "100%", height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
    fontSize: 15.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" };
  return (
    <div style={{ ...karte, padding: 22 }}>
      <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: C.tinte, marginBottom: 6 }}>Dein Konto bei Mythos Mathe</p>
      <p style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.65, marginBottom: 18 }}>
        Melde dich an, um deine Kurse, deine Noten und deinen Einladungslink an einem Ort zu haben.
        Zum Start brauchst du nur deinen Namen – alles andere ist freiwillig.
      </p>
      <button type="button" onClick={() => los("google")} disabled={!!laeuft}
        style={{ ...knopf, background: C.weiss, color: "#1F1F1F", border: `1.5px solid ${C.linie}`, marginBottom: 10 }}>
        <GoogleIcon /> {laeuft === "google" ? "Weiterleitung …" : "Mit Google anmelden"}
      </button>
      <button type="button" onClick={() => los("facebook")} disabled={!!laeuft}
        style={{ ...knopf, background: "#1877F2", color: C.weiss, border: "none" }}>
        <FacebookIcon /> {laeuft === "facebook" ? "Weiterleitung …" : "Mit Facebook anmelden"}
      </button>
      <p style={{ fontSize: 12.5, color: C.hellgrau, textAlign: "center", margin: "16px 0 8px" }}>oder mit E-Mail und Passwort</p>
      <EmailAnmeldung />
      <p style={{ fontSize: 12, color: C.hellgrau, lineHeight: 1.6, marginTop: 14 }}>
        {ANGEBOT.agb && (<>Mit der Anmeldung akzeptierst du unsere{" "}
        <button type="button" onClick={() => gehe({ ansicht: "agb" })} style={{ background: "none", border: "none", padding: 0, color: C.see, textDecoration: "underline", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>AGB</button>.{" "}</>)}
        Wie wir mit deinen Daten umgehen, steht in der{" "}
        <button type="button" onClick={() => gehe({ ansicht: "datenschutz" })} style={{ background: "none", border: "none", padding: 0, color: C.see, textDecoration: "underline", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>Datenschutzerklärung</button>.
        Bist du unter 16, fragen wir nach dem Anlegen deine Eltern um Zustimmung.
      </p>
    </div>
  );
}

/* ---------- Erstes Anmelden: nur der Name ---------- */
function Willkommen({ nutzer }) {
  const [name, setName] = useState(nutzer?.user_metadata?.full_name || nutzer?.user_metadata?.name || "");
  const einl = gemerkteEinladung();
  const [rolle, setRolle] = useState(() => (einl && einl.als === "eltern" ? "eltern" : einl && einl.klasse ? "schueler" : ""));
  const [geschlecht, setGeschlecht] = useState("");
  const [unter16, setUnter16] = useState(null);
  const [fehler, setFehler] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const bereit = !!rolle && (rolle !== "schueler" || (istGeschlecht(geschlecht) && typeof unter16 === "boolean"));
  const anlegen = async () => {
    if (!rolle) { setFehler("Bitte wähle aus, wer du bist."); return; }
    if (rolle === "schueler" && !istGeschlecht(geschlecht)) { setFehler("Bitte wähle Schüler oder Schülerin."); return; }
    if (rolle === "schueler" && typeof unter16 !== "boolean") { setFehler("Bitte gib an, ob du schon 16 bist."); return; }
    setLaeuft(true); setFehler("");
    try { await profilAnlegen(name, rolle, geschlecht || null, rolle === "schueler" ? unter16 : null); } catch (e) { setFehler(e.message); }
    setLaeuft(false);
  };
  return (
    <div style={{ ...karte, padding: 22 }}>
      <p style={{ fontSize: 22, fontWeight: 700, color: C.tinte, marginBottom: 6 }}>Willkommen!</p>
      <p style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.65, marginBottom: 16 }}>Wer bist du, und wie dürfen wir dich nennen? Mehr brauchen wir nicht, um dein Konto anzulegen.</p>
      {einl && einl.token && <p style={{ fontSize: 13.5, color: "#1B5E3A", background: "#E9F7EF", borderRadius: 10, padding: "8px 12px", marginBottom: 14 }}>Du wurdest von deinem Kind eingeladen – nach dem Anlegen bist du automatisch verbunden.</p>}
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Ich bin …</p>
      <div style={{ marginBottom: 16 }}><RollenWahl wert={rolle} geschlecht={geschlecht} onWahl={(r, g) => { setRolle(r); setGeschlecht(g || ""); setFehler(""); }} /></div>
      {rolle === "schueler" && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Wie alt bist du?</p>
          <AlterWahl wert={unter16} onWahl={(v) => { setUnter16(v); setFehler(""); }} />
          {unter16 === true && <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 8 }}>Kein Problem! Nach dem Anlegen schickst du deinen Eltern einen Link. Sobald sie zustimmen, speichert dein Konto deinen Lernstand. Bis dahin bleibt alles auf diesem Gerät.</p>}
        </div>
      )}
      <label htmlFor="konto-name" style={{ fontSize: 13, fontWeight: 600, color: C.see }}>Dein Name</label>
      <input id="konto-name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") anlegen(); }}
        autoComplete="name" maxLength={80}
        style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, border: `1.5px solid ${fehler ? C.signal : C.linie}`, borderRadius: 12,
          padding: "12px 14px", fontSize: 16, fontFamily: "inherit", color: C.tinte, outline: "none" }} />
      {fehler && <p style={{ fontSize: 13, color: C.signal, marginTop: 6 }}>{fehler}</p>}
      <button type="button" onClick={anlegen} disabled={laeuft || !name.trim() || !bereit}
        style={{ marginTop: 14, width: "100%", height: 50, borderRadius: 999, border: "none", background: name.trim() && bereit ? C.see : C.hellgrau,
          color: C.weiss, fontSize: 15.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
        {laeuft ? "Einen Moment …" : "Konto anlegen"}
      </button>
    </div>
  );
}

/* ---------- Notenverlauf als kleine Grafik ---------- */
function NotenVerlauf({ punkte }) {
  // punkte: [{ klasse, note }] mit Note 1–6 (1 oben)
  if (punkte.length < 2) return null;
  const W = 300, H = 90, x0 = 20, x1 = 290, y = (n) => 10 + ((n - 1) / 5) * (H - 24);
  const minK = punkte[0].klasse, maxK = punkte[punkte.length - 1].klasse;
  const x = (k) => x0 + ((k - minK) / Math.max(1, maxK - minK)) * (x1 - x0);
  const pfad = punkte.map((p, i) => `${i ? "L" : "M"}${x(p.klasse).toFixed(1)},${y(p.note).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", marginTop: 8 }} aria-label="Verlauf deiner Mathenoten">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <g key={n}>
          <line x1={x0} x2={x1} y1={y(n)} y2={y(n)} stroke={C.linie} strokeWidth="1" />
          <text x="4" y={y(n) + 3.5} fontSize="9" fill={C.hellgrau} fontFamily="Montserrat, system-ui, sans-serif">{n}</text>
        </g>
      ))}
      <path d={pfad} stroke={C.see} strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {punkte.map((p) => <circle key={String(p.klasse)} cx={x(p.klasse)} cy={y(p.note)} r="3.6" fill={C.flaggold} stroke={NAVY} strokeWidth="1.4" />)}
    </svg>
  );
}

/* ---------- Name ändern (Eltern, Lehrkräfte) ---------- */
function NameKarte({ profil }) {
  const [name, setName] = useState(profil.name || "");
  const [status, setStatus] = useState(null);
  const speichern = async () => {
    try { await profilSpeichern({ name: name.trim() }); setStatus({ ok: true, text: "Gespeichert." }); } catch (e) { setStatus({ ok: false, text: e.message }); }
  };
  return (
    <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
      <Kicker>MEINE DATEN</Kicker>
      <label htmlFor="konto-name2" style={{ fontSize: 13, fontWeight: 600, color: C.see }}>Name</label>
      <input id="konto-name2" value={name} onChange={(e) => { setName(e.target.value); setStatus(null); }} maxLength={80}
        style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, border: `1.5px solid ${C.linie}`, borderRadius: 12, padding: "11px 14px", fontSize: 16, fontFamily: "inherit", color: C.tinte, outline: "none" }} />
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginTop: 6 }}>Diesen Namen sehen die Schüler, die mit dir verbunden sind.</p>
      <div className="flex items-center" style={{ gap: 12, marginTop: 12 }}>
        <button type="button" onClick={speichern} disabled={!name.trim()} style={{ height: 44, padding: "0 22px", borderRadius: 999, border: "none", background: name.trim() ? C.see : C.hellgrau, color: C.weiss, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Speichern</button>
        {status && <span style={{ fontSize: 13.5, color: status.ok ? C.smaragd : C.signal }}>{status.text}</span>}
      </div>
    </div>
  );
}

/* ---------- Vorschau-Hinweis (nur ohne echte Anmeldung) ---------- */
function VorschauHinweis({ style }) {
  return (
    <div style={{ background: "#FDF8EA", border: `1px solid ${C.goldWarm}66`, borderRadius: 12, padding: "10px 14px", fontSize: 12.5, color: "#6B5310", lineHeight: 1.5, ...style }}>
      <b>Vorschau-Modus:</b> Die echte Anmeldung ist noch nicht verbunden. Alles, was du hier eingibst, bleibt nur in diesem Browser.
    </div>
  );
}

/* ---------- Angemeldet ---------- */
function Profil({ nutzer, profil, geworben, gehe }) {
  const [form, setForm] = useState(() => ({ name: profil.name || "", schulform: profil.schulform || "", klasse: profil.klasse || "", noten: profil.noten || {} }));
  const [status, setStatus] = useState(null);
  useEffect(() => { setStatus(null); }, [form]);

  const sf = SCHULFORMEN.find((s) => s.id === form.schulform);
  const bis = sf ? sf.bis : 13;
  const klassen = Array.from({ length: bis - 4 }, (_, i) => i + 5);
  const klasse = Number(form.klasse) || null;
  const notenKlassen = klasse ? Array.from({ length: klasse - NOTEN_AB + 1 }, (_, i) => i + NOTEN_AB) : [];
  const gold = (k) => !!klasse && k >= klasse - 1;   // die letzten beiden Jahre
  const [offen, setOffen] = useState(() => !datenVollstaendig(profil));
  const istPunkte = (k) => sf && k >= sf.kursstufe;

  const noteSetzen = (k, v) => setForm((f) => {
    const n = { ...f.noten };
    if (v === null || n[k] === v) delete n[k]; else n[k] = v;
    return { ...f, noten: n };
  });

  const speichern = async () => {
    const noten = Object.fromEntries(Object.entries(form.noten).filter(([k]) => {
      const kl = parseInt(k, 10), hj = String(k).includes(".");
      if (klasse && kl > klasse) return false;
      return sf ? (kl >= sf.kursstufe ? hj : !hj) : true;   // Kursstufe nur Halbjahre, davor nur Jahresnoten
    }));
    try {
      await profilSpeichern(darfImKonto(profil) ? { name: form.name.trim(), schulform: form.schulform || null, klasse: klasse, noten } : { name: form.name.trim() });
      setStatus({ ok: true, text: "Gespeichert." });
      if (datenVollstaendig({ ...profil, name: form.name.trim(), schulform: form.schulform, klasse, noten })) setOffen(false);
    } catch (e) { setStatus({ ok: false, text: e.message }); }
  };

  const rolle = profil.rolle || "schueler";
  const [kinder, setKinder] = useState([]);

  const verlauf = [];
  notenKlassen.forEach((k) => {
    if (istPunkte(k)) [1, 2].forEach((h) => { const v = form.noten[`${k}.${h}`]; if (v !== undefined) verlauf.push({ klasse: k + (h === 1 ? 0 : 0.5), note: alsNote(v, true) }); });
    else if (form.noten[k] !== undefined) verlauf.push({ klasse: k, note: alsNote(form.noten[k], false) });
  });
  const feld = { width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.linie}`, borderRadius: 12, padding: "11px 14px", fontSize: 16, fontFamily: "inherit", color: C.tinte, background: C.weiss, outline: "none" };
  const pille = (an) => ({ padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss,
    color: an ? C.see : C.tinte, fontFamily: "inherit", cursor: "pointer", textAlign: "left" });

  return (
    <>
      {/* Kopf */}
      <style>{`.konto-kopf{display:flex;align-items:center;gap:16px 20px;margin-bottom:18px}
.konto-kopf-hallo{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:14px}
.konto-kopf-hinweis{flex:0 0 43%;max-width:43%}
@media (max-width:560px){.konto-kopf{flex-wrap:wrap}.konto-kopf-hinweis{flex:1 1 100%;max-width:none}}`}</style>
      <div className="konto-kopf">
      <div className="konto-kopf-hallo">
        <span style={{ flexShrink: 0, width: 54, height: 54, borderRadius: 999, background: `linear-gradient(155deg, ${C.see} 0%, ${NAVY} 100%)`,
          color: C.flaggold, fontSize: 24, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {(profil.name || "?").slice(0, 1).toUpperCase()}
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 22, fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", lineHeight: 1.2, overflowWrap: "anywhere" }}>Hallo, {profil.name.split(" ")[0]}!</span>
          <span style={{ display: "block", fontSize: 13, color: C.grau, fontWeight: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nutzer.email}</span>
          <span style={{ display: "inline-block", marginTop: 4, fontSize: 11.5, fontWeight: 700, color: C.see, background: C.himmel, borderRadius: 999, padding: "2px 10px" }}>{rolleName(rolle, profil.geschlecht)}</span>
        </span>
      </div>
      {DEMO && <div className="konto-kopf-hinweis"><VorschauHinweis /></div>}
      </div>

      {rolle === "schueler" && (
        <>
      <AlterFrage profil={profil} />
      <ElternZustimmungKarte profil={profil} />
      {/* Meine Daten */}
      <div style={{ ...karte, marginBottom: 14, overflow: "hidden" }}>
        <button type="button" onClick={() => setOffen(!offen)} aria-expanded={offen} aria-controls="meine-daten-inhalt"
          style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", padding: offen ? "18px 18px 6px" : "18px", background: "none", border: "none", fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: offen ? C.hellgrau : C.see }}>MEINE DATEN</span>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke={C.see} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: offen ? "rotate(180deg)" : "none", transition: "transform .2s" }}><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {offen && (
        <div id="meine-daten-inhalt" style={{ padding: "0 18px 18px" }}>
        {!datenVollstaendig(profil) && <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.55, marginBottom: 14 }}>Trag hier bitte deine Schulform, deine Klassenstufe und deine Mathe-Noten ein.</p>}
        <label style={{ fontSize: 13, fontWeight: 600, color: C.see }}>Name <span style={{ color: C.gruen }}>*</span></label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} style={{ ...feld, marginTop: 6, marginBottom: 16 }} />

        {!darfImKonto(profil) ? (
          <p style={{ fontSize: 13.5, color: "#6B5310", background: "#FDF8EA", borderRadius: 10, padding: "10px 12px", lineHeight: 1.6, marginBottom: 6 }}>
            Schulform, Klasse und Noten kannst du eintragen, sobald {profil.unter16 == null ? "du oben dein Alter angegeben hast" : "deine Eltern zugestimmt haben"}.
          </p>
        ) : (<>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Schulform</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 16 }}>
          {SCHULFORMEN.map((s) => (
            <button key={s.id} type="button" onClick={() => setForm((f) => ({ ...f, schulform: f.schulform === s.id ? "" : s.id, klasse: s.bis < Number(f.klasse) ? "" : f.klasse }))} style={pille(form.schulform === s.id)}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{s.name}</span>
              <span style={{ display: "block", fontSize: 12, color: C.grau }}>{s.kurz}</span>
            </button>
          ))}
        </div>

        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Aktuelle Klassenstufe</p>
        <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 16 }}>
          {klassen.map((k) => (
            <button key={k} type="button" onClick={() => setForm((f) => ({ ...f, klasse: Number(f.klasse) === k ? "" : k }))}
              style={{ width: 44, height: 40, borderRadius: 10, border: `1.5px solid ${klasse === k ? C.see : C.linie}`, background: klasse === k ? C.see : C.weiss,
                color: klasse === k ? C.weiss : C.tinte, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>{k}</button>
          ))}
        </div>

        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 2 }}>Mathe-Jahresnoten</p>
        {!klasse ? (
          <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 6 }}>Wähle zuerst deine Klassenstufe.</p>
        ) : (
          <>
            <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginBottom: 8, lineHeight: 1.5 }}>
              Endjahresnote in Mathe ab Klasse 3{sf ? `; in der Kursstufe die Punkte (0–15) für jedes Halbjahr ${sf.kursstufe}.1 bis ${sf.kursstufe + 1}.2` : ""}. Antippen zum Auswählen, nochmal antippen zum Entfernen. Gold markiert sind die letzten beiden Jahre.
            </p>
            {notenKlassen.map((k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: `1px solid ${C.linie}` }}>
                <span style={{ width: 62, flexShrink: 0, fontSize: 13.5, fontWeight: 600, color: C.tinte }}>
                  Kl. {k}{gold(k) && <span style={{ display: "block", fontSize: 10.5, color: "#9A7400", fontWeight: 700 }}>{k === klasse ? "aktuell" : "Vorjahr"}</span>}
                </span>
                {istPunkte(k) ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flex: 1 }}>
                    {[1, 2].map((h) => {
                      const key = `${k}.${h}`;
                      return (
                        <label key={key} style={{ display: "block" }}>
                          <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: C.hellgrau, marginBottom: 3 }}>{key}</span>
                          <select value={form.noten[key] ?? ""} onChange={(e) => noteSetzen(key, e.target.value === "" ? null : Number(e.target.value))}
                            aria-label={`Halbjahr ${key}: Punkte`}
                            style={{ ...feld, padding: "8px 8px", fontSize: 15, width: "100%", ...(gold(k) ? { background: C.flaggold, borderColor: C.flaggold, color: NAVY, fontWeight: 600 } : {}) }}>
                            <option value="">– Punkte –</option>
                            {Array.from({ length: 16 }, (_, i) => 15 - i).map((p) => <option key={p} value={p}>{p} P.</option>)}
                          </select>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 5, flex: 1 }}>
                    {[1, 2, 3, 4, 5, 6].map((n) => {
                      const an = form.noten[k] === n;
                      return (
                        <button key={n} type="button" onClick={() => noteSetzen(k, n)} aria-label={`Klasse ${k}: Note ${n}`}
                          style={{ height: 36, borderRadius: 9, border: `1.5px solid ${an ? NAVY : gold(k) ? C.flaggold : C.linie}`, background: an ? NAVY : gold(k) ? C.flaggold : C.weiss,
                            color: an ? C.flaggold : gold(k) ? NAVY : C.tinte, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>{n}</button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            <NotenVerlauf punkte={verlauf} />
          </>
        )}
        </>)}

        <div className="flex items-center flex-wrap" style={{ gap: 12, marginTop: 16 }}>
          <button type="button" onClick={speichern} disabled={!form.name.trim()}
            style={{ height: 46, padding: "0 24px", borderRadius: 999, border: "none", background: form.name.trim() ? C.see : C.hellgrau, color: C.weiss,
              fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Speichern</button>
          {status && <span style={{ fontSize: 13.5, color: status.ok ? C.smaragd : C.signal, fontWeight: 500 }}>{status.text}</span>}
        </div>
        </div>
        )}
      </div>

      <MeinTrainingKarte gehe={gehe} />
      <GeschlechtFrage profil={profil} />
      {/* Meine Kurse */}
      {ANGEBOT.kurse && (<div style={{ ...karte, padding: 18, marginBottom: 14 }}>
        <Kicker>MEINE KURSE</Kicker>
        <p style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginBottom: 12 }}>Du hast noch keinen Kurs gebucht. Hier erscheinen deine Programme, sobald es losgeht.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button type="button" onClick={() => gehe({ ansicht: "mathecheck" })} style={{ ...pille(false), background: "linear-gradient(150deg,#FFFFFF 0%,#E4E8EE 30%,#C3CBD6 70%,#E9ECF1 100%)", border: "none" }}>
            <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: NAVY }}>Mathe checken</span>
            <span style={{ display: "block", fontSize: 12, color: "#3B4763" }}>2 Monate</span>
          </button>
          <button type="button" onClick={() => gehe({ ansicht: "masterclass" })} style={{ ...pille(false), background: "linear-gradient(150deg,#FFE9A0 0%,#EDBB00 55%,#C99A14 100%)", border: "none" }}>
            <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: NAVY }}>Masterclass</span>
            <span style={{ display: "block", fontSize: 12, color: "#3B2A00" }}>6 Monate</span>
          </button>
        </div>
      </div>)}

          <EinladenBox profil={profil} geworben={geworben} />
          <MeineKlassen rolle={rolle} />
          {ANGEBOT.pro && <PlanKarte profil={profil} />}
      {profil.geworben_von && <p style={{ fontSize: 12.5, color: C.hellgrau, margin: "-6px 4px 14px" }}>Du bist selbst über eine Einladung zu Mythos Mathe gekommen.</p>}

        </>
      )}
      {rolle === "eltern" && (
        <>
          <ElternBereich profil={profil} gehe={gehe} kinderRef={setKinder} />
          <KinderEinwilligungKarte />
          <WochenmailKarte />
          {ANGEBOT.pro && <PlanKarte profil={profil} kinder={kinder} />}
          <SpendenTeaser gehe={gehe} />
          <NameKarte profil={profil} />
        </>
      )}
      {istLehrend(rolle) && (
        <>
          <LehrBereich profil={profil} gehe={gehe} />
          {ANGEBOT.pro && <PlanKarte profil={profil} />}
          <NameKarte profil={profil} />
        </>
      )}

      {rolle !== "eltern" && (
        <button type="button" onClick={() => gehe({ ansicht: "challenge" })}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", marginBottom: 14, borderRadius: 18, border: `1.5px solid ${C.flaggold}`, background: "#FFFBEA", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.tinte }}>Klassen-Challenge</span>
            <span style={{ display: "block", fontSize: 13, color: C.grau, marginTop: 2 }}>{istLehrend(rolle) ? "Für eine Klasse starten und die Wochenrangliste sehen" : "Punkte für deine Klasse sammeln"}</span>
          </span>
          <span aria-hidden="true" style={{ fontSize: 22, color: "#8A6A00" }}>›</span>
        </button>
      )}
      <AppKarte />
      <DatenKarte gehe={gehe} />
      <RolleAendern profil={profil} />
      <button type="button" onClick={abmelden}
        style={{ background: "none", border: `1px solid ${C.linie}`, borderRadius: 999, padding: "10px 20px", color: C.grau, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
        Abmelden
      </button>
    </>
  );
}

export function KontoSeite({ gehe }) {
  const { geladen, nutzer, profil, geworben, fehler } = useKonto();
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 14 }}>
      {DEMO && !(nutzer && profil) && <VorschauHinweis style={{ marginBottom: 16 }} />}
      {fehler && <p style={{ fontSize: 13.5, color: C.signal, marginBottom: 12 }}>{fehler}</p>}
      <HinweisLeiste />
      {!geladen ? (
        <p style={{ fontSize: 14, color: C.grau }}>Einen Moment …</p>
      ) : !nutzer ? (
        <Anmelden gehe={gehe} />
      ) : !profil ? (
        <Willkommen nutzer={nutzer} />
      ) : (
        <Profil key={profil.id} nutzer={nutzer} profil={profil} geworben={geworben} gehe={gehe} />
      )}
    </div>
  );
}
