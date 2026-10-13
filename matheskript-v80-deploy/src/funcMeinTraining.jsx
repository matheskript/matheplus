/* ============================================================
   Mein Training – eigene Kachel ganz oben auf der Startseite und die zugehörige Seite:
   Tagesplan (Ebbinghaus), Lernfortschritt, die Übungsmodi und eine Erinnerung.
   Die Logik steckt in ebbinghaus.js und funcEbbinghaus.jsx; hier wird nur zusammengestellt.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { useTraining, TrainingFortschritt } from "./funcTraining.jsx";
import { wiederkehrende } from "./trainingDaten.js";
import { EbbDashboardSektion, Klassenarbeiten, Lernstand, useEbb, useJetzt, useTagesplan } from "./funcEbbinghaus.jsx";
import { kommendeArbeiten, tageText } from "./ebbinghaus.js";
import { karte, kicker } from "./ui2.jsx";

/* Logo: ansteigende Säulen mit Haken – blau/gold auf hellem Grund */
export function MeinTrainingLogoKlein() {
  return (
    <svg viewBox="0 0 230 190" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {[[38, 40], [76, 66], [114, 96], [152, 128]].map(([x, h], i) => (
        <rect key={x} x={x} y={150 - h} width="26" height={h} rx="5" fill={i === 3 ? C.flaggold : C.see} opacity={i === 3 ? 1 : 0.35 + i * 0.2} />
      ))}
      <line x1="26" y1="150" x2="198" y2="150" stroke={C.see} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <circle cx="165" cy="48" r="22" fill={C.weiss} stroke={C.see} strokeWidth="3" />
      <path d="M 154 48 L 162 57 L 177 39" fill="none" stroke={C.smaragd} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Zahl der heute offenen Übungen (nur wenn schon trainiert wurde) */
export function useOffenHeute() {
  const { E, T, geladen } = useEbb();
  const jetzt = useJetzt();
  const stand = useTagesplan(E, T, geladen, jetzt);
  const hatSkills = Object.keys(E.skills).length > 0;
  const arbeit = kommendeArbeiten(E, { jetzt })[0] || null;
  return { offen: stand.gesamt - stand.erledigt, gesamt: stand.gesamt, fertig: stand.fertig, hatSkills, geladen, arbeit: arbeit && arbeit.tage <= 14 ? { art: arbeit.art, tage: arbeit.tage } : null };
}

export function MeinTrainingBadge({ offen }) {
  if (!offen) return null;
  return (
    <span aria-label={`${offen} Übungen heute offen`} style={{ position: "absolute", bottom: 8, right: 8, minWidth: 26, height: 26, padding: "0 7px", borderRadius: 999, background: C.flaggold, color: C.seeTief,
      fontSize: 13, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(0,0,0,0.2)" }}>{offen}</span>
  );
}

export function meinTrainingText(s) {
  if (s.geladen && s.arbeit) return `${s.arbeit.art} ${tageText(s.arbeit.tage)}. ${s.fertig ? "Tagesplan geschafft." : s.offen > 0 ? `Heute ${s.offen === 1 ? "wartet 1 Übung" : `warten ${s.offen} Übungen`} auf dich.` : "Dein Tagesplan und dein Lernfortschritt."}`;
  if (!s.geladen || !s.hatSkills) return "Dein Tagesplan, dein Lernfortschritt und alle Übungsmodi an einem Ort.";
  if (s.fertig) return "Tagesplan geschafft. Dein Lernfortschritt und alle Übungsmodi.";
  if (s.offen > 0) return `Heute ${s.offen === 1 ? "wartet 1 Übung" : `warten ${s.offen} Übungen`} auf dich – dein Tagesplan und dein Lernfortschritt.`;
  return "Dein Tagesplan, dein Lernfortschritt und alle Übungsmodi an einem Ort.";
}

/* ---------- Erinnerung: tägliche Kalender-Erinnerung (.ics) ---------- */
const ZEIT_SCHLUESSEL = "mm-erinnerung-zeit";
function icsBauen(zeit) {
  const [h, m] = zeit.split(":");
  const p = (n) => String(n).padStart(2, "0");
  const d = new Date();
  const start = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(h)}${p(m)}00`;
  const link = typeof window !== "undefined" ? window.location.origin : "";
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mythos Mathe//Mein Training//DE", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `UID:mein-training-${Date.now()}@mythosmathe.de`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${start}`, "DURATION:PT15M", "RRULE:FREQ=DAILY", "SUMMARY:Mein Training – Mythos Mathe",
    `DESCRIPTION:Dein Tagesplan wartet. Wenige Minuten reichen.\\n${link}`, `URL:${link}`,
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Mein Training", "TRIGGER:PT0M", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}
function Erinnerung() {
  const [zeit, setZeit] = useState(() => { try { return localStorage.getItem(ZEIT_SCHLUESSEL) || "17:00"; } catch (e) { return "17:00"; } });
  const [fertig, setFertig] = useState(false);
  const laden = () => {
    try { localStorage.setItem(ZEIT_SCHLUESSEL, zeit); } catch (e) { /* egal */ }
    const blob = new Blob([icsBauen(zeit)], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "mein-training-erinnerung.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setFertig(true);
  };
  return (
    <div style={karte}>
      <p style={kicker}>Erinnerung</p>
      <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.7, margin: "0 0 10px" }}>
        Sobald du die App öffnest, siehst du auf der Startseite, wie viele Übungen heute offen sind. Damit du nichts vergisst, kannst du dir außerdem jeden Tag eine Erinnerung in deinen Handy-Kalender legen.
      </p>
      <label style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 14, color: C.tinte, fontWeight: 600 }}>
        Uhrzeit
        <input type="time" value={zeit} onChange={(e) => { setZeit(e.target.value || "17:00"); setFertig(false); }}
          style={{ minHeight: 44, padding: "6px 12px", fontSize: 15, fontFamily: "inherit", border: `1.5px solid ${C.linie}`, borderRadius: 12 }} />
      </label>
      <button type="button" onClick={laden}
        style={{ marginTop: 10, minHeight: 44, padding: "8px 18px", borderRadius: 999, border: `1.5px solid ${C.see}`, background: C.weiss, color: C.see, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
        Tägliche Erinnerung in den Kalender
      </button>
      {fertig && <p role="status" style={{ fontSize: 13, color: C.smaragd, fontWeight: 600, lineHeight: 1.6, marginTop: 8 }}>Die Datei wurde geladen. Öffne sie, dann trägt dein Kalender die tägliche Erinnerung um {zeit} Uhr ein.</p>}
    </div>
  );
}

/* ---------- Seite ---------- */
const Abschnitt = ({ kick, titel, children }) => (
  <section style={{ marginTop: 26 }}>
    <p style={kicker}>{kick}</p>
    <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: C.tinte, margin: "2px 0 12px", lineHeight: 1.2 }}>{titel}</h2>
    {children}
  </section>
);

export function MeinTrainingSeite({ gehe }) {
  const { E, T, geladen } = useEbb();
  const Tn = useTraining();
  const wk = wiederkehrende(Tn).length;
  const [laeuft, setLaeuft] = useState(null);
  const knoepfe = [
    ["warmup", "5 Minuten Mathe", "Fünf kurze Aufgaben"],
    ["fehlertraining", "Meine Fehler üben", wk ? `${wk} wiederkehrende${wk === 1 ? "r" : ""} Fehlertyp${wk === 1 ? "" : "en"}` : "Gezielt ähnliche Aufgaben"],
    ["pruefung", "Prüfungsmodus", "Ohne Hilfen, mit Punkten"],
    ["klausurnach", "Klausur nachbereiten", "Verlorene Punkte auswerten"],
  ];
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 6 }}>
      <Abschnitt kick="Heute" titel="Dein Tagesplan">
        <EbbDashboardSektion E={E} T={T} geladen={geladen} gehe={gehe} laeuft={laeuft} setLaeuft={setLaeuft} zuSkills={() => gehe({ ansicht: "ebbinghaus" })} />
      </Abschnitt>
      {!laeuft && (
        <>
          <Abschnitt kick="Vorbereiten" titel="Klassenarbeiten und Tests">
            <Klassenarbeiten E={E} T={T} geladen={geladen} />
          </Abschnitt>
          <Abschnitt kick="Dein Lernfortschritt" titel="Was du gelernt hast – und wann">
            <Lernstand E={E} T={T} geladen={geladen} />
            <TrainingFortschritt gehe={gehe} />
          </Abschnitt>
          <Abschnitt kick="Üben" titel="Weitere Übungsmodi">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
              {knoepfe.map(([id, titel, zeile]) => (
                <button key={id} type="button" onClick={() => gehe({ ansicht: id })}
                  style={{ minHeight: 74, padding: "12px 14px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss, boxShadow: "0 4px 16px rgba(0,77,152,0.22)" }}>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>{titel}</span>
                  <span style={{ display: "block", fontSize: 12.5, fontWeight: 300, opacity: 0.9, marginTop: 4, lineHeight: 1.35 }}>{zeile}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => gehe({ ansicht: "ebbinghaus" })}
              style={{ marginTop: 12, minHeight: 44, padding: "8px 16px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
              Wie der Tagesplan funktioniert: Ebbinghaus
            </button>
          </Abschnitt>
          <Abschnitt kick="Dranbleiben" titel="Erinnerung"><Erinnerung /></Abschnitt>
        </>
      )}
    </div>
  );
}
