import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { DEMO, useKonto, anmelden, abmelden, profilAnlegen, profilSpeichern, empfehlungsLink } from "./konto.js";

/* ======================================================================
   KONTOBEREICH (ansicht "konto")
   ====================================================================== */

const NAVY = "#0B1E4A";
const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const Kicker = ({ children }) => <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.hellgrau, marginBottom: 10 }}>{children}</p>;

export const SCHULFORMEN = [
  { id: "G8", name: "Gymnasium G8", kurz: "Abi nach Klasse 12", bis: 12, kursstufe: 11 },
  { id: "G9", name: "Gymnasium G9", kurz: "Abi nach Klasse 13", bis: 13, kursstufe: 12 },
  { id: "GMS", name: "Gemeinschaftsschule", kurz: "Oberstufe bis Klasse 13", bis: 13, kursstufe: 12 },
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
      <p style={{ fontSize: 12, color: C.hellgrau, lineHeight: 1.6, marginTop: 14 }}>
        Mit der Anmeldung akzeptierst du unsere{" "}
        <button type="button" onClick={() => gehe({ ansicht: "agb" })} style={{ background: "none", border: "none", padding: 0, color: C.see, textDecoration: "underline", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>AGB</button>.
      </p>
    </div>
  );
}

/* ---------- Erstes Anmelden: nur der Name ---------- */
function Willkommen({ nutzer }) {
  const [name, setName] = useState(nutzer?.user_metadata?.full_name || nutzer?.user_metadata?.name || "");
  const [fehler, setFehler] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const anlegen = async () => {
    setLaeuft(true); setFehler("");
    try { await profilAnlegen(name); } catch (e) { setFehler(e.message); }
    setLaeuft(false);
  };
  return (
    <div style={{ ...karte, padding: 22 }}>
      <p style={{ fontSize: 22, fontWeight: 700, color: C.tinte, marginBottom: 6 }}>Willkommen!</p>
      <p style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.65, marginBottom: 16 }}>Wie dürfen wir dich nennen? Mehr brauchen wir nicht, um dein Konto anzulegen.</p>
      <label htmlFor="konto-name" style={{ fontSize: 13, fontWeight: 600, color: C.see }}>Dein Name</label>
      <input id="konto-name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") anlegen(); }}
        autoComplete="name" maxLength={80}
        style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, border: `1.5px solid ${fehler ? C.signal : C.linie}`, borderRadius: 12,
          padding: "12px 14px", fontSize: 16, fontFamily: "inherit", color: C.tinte, outline: "none" }} />
      {fehler && <p style={{ fontSize: 13, color: C.signal, marginTop: 6 }}>{fehler}</p>}
      <button type="button" onClick={anlegen} disabled={laeuft || !name.trim()}
        style={{ marginTop: 14, width: "100%", height: 50, borderRadius: 999, border: "none", background: name.trim() ? C.see : C.hellgrau,
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
      {punkte.map((p) => <circle key={p.klasse} cx={x(p.klasse)} cy={y(p.note)} r="3.6" fill={C.flaggold} stroke={NAVY} strokeWidth="1.4" />)}
    </svg>
  );
}

/* ---------- Angemeldet ---------- */
function Profil({ nutzer, profil, geworben, gehe }) {
  const [form, setForm] = useState(() => ({ name: profil.name || "", schulform: profil.schulform || "", klasse: profil.klasse || "", noten: profil.noten || {} }));
  const [status, setStatus] = useState(null);
  const [kopiert, setKopiert] = useState(false);
  useEffect(() => { setStatus(null); }, [form]);

  const sf = SCHULFORMEN.find((s) => s.id === form.schulform);
  const bis = sf ? sf.bis : 13;
  const klassen = Array.from({ length: bis - 4 }, (_, i) => i + 5);
  const klasse = Number(form.klasse) || null;
  const notenKlassen = klasse ? Array.from({ length: klasse - 4 }, (_, i) => i + 5) : [];
  const istPunkte = (k) => sf && k >= sf.kursstufe;

  const noteSetzen = (k, v) => setForm((f) => {
    const n = { ...f.noten };
    if (v === null || n[k] === v) delete n[k]; else n[k] = v;
    return { ...f, noten: n };
  });

  const speichern = async () => {
    const noten = Object.fromEntries(Object.entries(form.noten).filter(([k]) => !klasse || Number(k) <= klasse));
    try {
      await profilSpeichern({ name: form.name.trim(), schulform: form.schulform || null, klasse: klasse, noten });
      setStatus({ ok: true, text: "Gespeichert." });
    } catch (e) { setStatus({ ok: false, text: e.message }); }
  };

  const link = empfehlungsLink(profil.ref_code);
  const kopieren = async () => {
    try { await navigator.clipboard.writeText(link); setKopiert(true); setTimeout(() => setKopiert(false), 1800); } catch (e) { /* manuell markieren */ }
  };
  const teilen = async () => {
    try { await navigator.share({ title: "Mythos Mathe", text: "Schau dir Mythos Mathe an – Mathe verstehen mit System:", url: link }); } catch (e) { /* abgebrochen */ }
  };

  const verlauf = notenKlassen.filter((k) => form.noten[k] !== undefined).map((k) => ({ klasse: k, note: alsNote(form.noten[k], istPunkte(k)) }));
  const feld = { width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.linie}`, borderRadius: 12, padding: "11px 14px", fontSize: 16, fontFamily: "inherit", color: C.tinte, background: C.weiss, outline: "none" };
  const pille = (an) => ({ padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss,
    color: an ? C.see : C.tinte, fontFamily: "inherit", cursor: "pointer", textAlign: "left" });

  return (
    <>
      {/* Kopf */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <span style={{ flexShrink: 0, width: 54, height: 54, borderRadius: 999, background: `linear-gradient(155deg, ${C.see} 0%, ${NAVY} 100%)`,
          color: C.flaggold, fontSize: 24, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {(profil.name || "?").slice(0, 1).toUpperCase()}
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 22, fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em" }}>Hallo, {profil.name.split(" ")[0]}!</span>
          <span style={{ display: "block", fontSize: 13, color: C.grau, fontWeight: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nutzer.email}</span>
        </span>
      </div>

      {/* Meine Kurse */}
      <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
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
      </div>

      {/* Meine Daten */}
      <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
        <Kicker>MEINE DATEN</Kicker>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.see }}>Name <span style={{ color: C.gruen }}>*</span></label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} style={{ ...feld, marginTop: 6, marginBottom: 16 }} />

        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Schulform <span style={{ color: C.hellgrau, fontWeight: 400 }}>(freiwillig)</span></p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 16 }}>
          {SCHULFORMEN.map((s) => (
            <button key={s.id} type="button" onClick={() => setForm((f) => ({ ...f, schulform: f.schulform === s.id ? "" : s.id, klasse: s.bis < Number(f.klasse) ? "" : f.klasse }))} style={pille(form.schulform === s.id)}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{s.name}</span>
              <span style={{ display: "block", fontSize: 12, color: C.grau }}>{s.kurz}</span>
            </button>
          ))}
        </div>

        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Aktuelle Klassenstufe <span style={{ color: C.hellgrau, fontWeight: 400 }}>(freiwillig)</span></p>
        <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 16 }}>
          {klassen.map((k) => (
            <button key={k} type="button" onClick={() => setForm((f) => ({ ...f, klasse: Number(f.klasse) === k ? "" : k }))}
              style={{ width: 44, height: 40, borderRadius: 10, border: `1.5px solid ${klasse === k ? C.see : C.linie}`, background: klasse === k ? C.see : C.weiss,
                color: klasse === k ? C.weiss : C.tinte, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>{k}</button>
          ))}
        </div>

        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 2 }}>Mathe-Jahresnoten <span style={{ color: C.hellgrau, fontWeight: 400 }}>(freiwillig)</span></p>
        {!klasse ? (
          <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 6 }}>Wähle zuerst deine Klassenstufe.</p>
        ) : (
          <>
            <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginBottom: 8, lineHeight: 1.5 }}>
              Endjahresnote in Mathe ab Klasse 5{sf ? `, in der Kursstufe ab Klasse ${sf.kursstufe} in Punkten (0–15)` : ""}. Antippen zum Auswählen, nochmal antippen zum Entfernen.
            </p>
            {notenKlassen.map((k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: `1px solid ${C.linie}` }}>
                <span style={{ width: 62, flexShrink: 0, fontSize: 13.5, fontWeight: 600, color: C.tinte }}>
                  Kl. {k}{k === klasse && <span style={{ display: "block", fontSize: 10.5, color: C.hellgrau, fontWeight: 500 }}>aktuell</span>}
                </span>
                {istPunkte(k) ? (
                  <select value={form.noten[k] ?? ""} onChange={(e) => noteSetzen(k, e.target.value === "" ? null : Number(e.target.value))}
                    style={{ ...feld, padding: "8px 10px", fontSize: 15, width: "auto", minWidth: 130 }}>
                    <option value="">– Punkte –</option>
                    {Array.from({ length: 16 }, (_, i) => 15 - i).map((p) => <option key={p} value={p}>{p} Punkte</option>)}
                  </select>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 5, flex: 1 }}>
                    {[1, 2, 3, 4, 5, 6].map((n) => {
                      const an = form.noten[k] === n;
                      return (
                        <button key={n} type="button" onClick={() => noteSetzen(k, n)} aria-label={`Klasse ${k}: Note ${n}`}
                          style={{ height: 36, borderRadius: 9, border: `1.5px solid ${an ? NAVY : C.linie}`, background: an ? NAVY : C.weiss,
                            color: an ? C.flaggold : C.tinte, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>{n}</button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            <NotenVerlauf punkte={verlauf} />
          </>
        )}

        <div className="flex items-center flex-wrap" style={{ gap: 12, marginTop: 16 }}>
          <button type="button" onClick={speichern} disabled={!form.name.trim()}
            style={{ height: 46, padding: "0 24px", borderRadius: 999, border: "none", background: form.name.trim() ? C.see : C.hellgrau, color: C.weiss,
              fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Speichern</button>
          {status && <span style={{ fontSize: 13.5, color: status.ok ? C.smaragd : C.signal, fontWeight: 500 }}>{status.text}</span>}
        </div>
      </div>

      {/* Freunde einladen */}
      <div style={{ ...karte, padding: 18, marginBottom: 14, background: `linear-gradient(155deg, ${C.see} 0%, ${NAVY} 100%)`, color: C.weiss }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.flaggold, marginBottom: 6 }}>FREUNDE EINLADEN</p>
        <p style={{ fontSize: 14.5, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.6, marginBottom: 12 }}>
          Teile deinen persönlichen Link. Wer sich darüber anmeldet, wird automatisch dir zugeordnet.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 12, padding: "10px 12px" }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", userSelect: "all" }}>{link.replace("https://", "")}</span>
        </div>
        <div className="flex flex-wrap items-center" style={{ gap: 8, marginTop: 10 }}>
          <button type="button" onClick={kopieren}
            style={{ height: 42, padding: "0 18px", borderRadius: 999, border: "none", background: C.flaggold, color: NAVY, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
            {kopiert ? "Kopiert ✓" : "Link kopieren"}
          </button>
          {typeof navigator !== "undefined" && navigator.share && (
            <button type="button" onClick={teilen}
              style={{ height: 42, padding: "0 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.4)", background: "transparent", color: C.weiss, fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              Teilen
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: 13.5, color: "#C9D6EE" }}>
            <b style={{ color: C.flaggold, fontSize: 18 }}>{geworben}</b> {geworben === 1 ? "Person" : "Personen"} eingeladen
          </span>
        </div>
        {profil.geworben_von && <p style={{ fontSize: 12.5, color: "#8FA3C8", marginTop: 10 }}>Du bist selbst über eine Einladung zu Mythos Mathe gekommen.</p>}
      </div>

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
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      {DEMO && (
        <div style={{ background: "#FDF8EA", border: `1px solid ${C.goldWarm}66`, borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#6B5310", lineHeight: 1.55 }}>
          <b>Vorschau-Modus:</b> Die echte Anmeldung ist noch nicht verbunden. Alles, was du hier eingibst, bleibt nur in diesem Browser.
        </div>
      )}
      {fehler && <p style={{ fontSize: 13.5, color: C.signal, marginBottom: 12 }}>{fehler}</p>}
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
