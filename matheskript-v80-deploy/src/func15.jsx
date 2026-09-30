/* ============================================================
   Videokurse in den Schulkursen:
   - VideokursVorschau: Block auf der Kursseite (Lektionen, Fortschritt, Start)
   - VideokursPlayer:   Lektionsansicht mit Video, Erklärung, Kernpunkten,
                        Merksatz, Kurz-Check, „Jetzt üben“ und Navigation
   - videoAnzahl:       für das Abzeichen auf den Kurskarten
   Fortschritt liegt pro Gerät im Browser (localStorage) – nur Komfort,
   die App funktioniert auch ohne.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { VIDEOKURSE } from "./base5.jsx";

const schluessel = (kursId) => `mm-videokurs-${kursId}`;

function ladeErledigt(kursId) {
  try { return JSON.parse(localStorage.getItem(schluessel(kursId)) || "[]"); } catch { return []; }
}
function speichereErledigt(kursId, liste) {
  try { localStorage.setItem(schluessel(kursId), JSON.stringify(liste)); } catch { /* optional */ }
}

export const videoAnzahl = (kursId) => (VIDEOKURSE[kursId] ? VIDEOKURSE[kursId].lektionen.length : 0);

/* Index der nächsten noch nicht erledigten Lektion (oder 0). */
export function naechsteLektion(kursId) {
  const vk = VIDEOKURSE[kursId];
  if (!vk) return 0;
  const erledigt = ladeErledigt(kursId);
  const i = vk.lektionen.findIndex((l) => !erledigt.includes(l.id));
  return i < 0 ? 0 : i;
}

function Fortschrittsbalken({ anteil, hell }) {
  return (
    <div style={{ height: 6, borderRadius: 3, background: hell ? "rgba(255,255,255,0.18)" : C.linie, overflow: "hidden" }}>
      <div style={{ width: `${Math.round(anteil * 100)}%`, height: "100%", background: C.flaggold, borderRadius: 3, transition: "width .3s" }} />
    </div>
  );
}

function PlayIcon({ groesse = 14, farbe = C.weiss }) {
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" fill={farbe} />
    </svg>
  );
}

/* Kleines Abzeichen für die Kurskarte */
export function VideoAbzeichen({ kursId }) {
  const n = videoAnzahl(kursId);
  if (!n) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.himmel, color: C.see,
      borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
      <PlayIcon groesse={11} farbe={C.see} /> Videokurs · {n} Lektionen
    </span>
  );
}

/* Lektionsliste – auf der Kursseite und unter dem Player */
function Lektionsliste({ kursId, aktiv, erledigt, onWahl }) {
  const vk = VIDEOKURSE[kursId];
  let letztesKapitel = null;
  return (
    <div>
      {vk.lektionen.map((l, i) => {
        const fertig = erledigt.includes(l.id);
        const istAktiv = i === aktiv;
        const kapitel = l.kapitel !== letztesKapitel ? l.kapitel : null;
        letztesKapitel = l.kapitel;
        return (
          <div key={l.id}>
            {kapitel && (
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: C.hellgrau, margin: i === 0 ? "0 0 6px" : "14px 0 6px" }}>{kapitel}</p>
            )}
            <button onClick={() => onWahl(i)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left", cursor: "pointer",
                fontFamily: "inherit", padding: "10px 12px", marginBottom: 6, borderRadius: 12,
                border: `1px solid ${istAktiv ? C.see : C.linie}`, background: istAktiv ? C.himmel : C.weiss }}>
              <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 999, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 13, fontWeight: 700,
                background: fertig ? C.smaragd : istAktiv ? C.see : C.sand, color: fertig || istAktiv ? C.weiss : C.grau,
                border: fertig || istAktiv ? "none" : `1px solid ${C.linie}` }}>
                {fertig ? "✓" : i + 1}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: C.tinte, lineHeight: 1.35 }}>{l.titel}</span>
              </span>
              {istAktiv && <PlayIcon groesse={14} farbe={C.see} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* Block auf der Kursseite */
export function VideokursVorschau({ kursId, onStart }) {
  const vk = VIDEOKURSE[kursId];
  const [erledigt] = useState(() => ladeErledigt(kursId));
  if (!vk) return null;
  const n = vk.lektionen.length, fertig = vk.lektionen.filter((l) => erledigt.includes(l.id)).length;
  const weiter = naechsteLektion(kursId);
  return (
    <div style={{ background: C.weiss, borderRadius: 18, overflow: "hidden", boxShadow: "0 3px 18px rgba(15,26,51,0.09)", marginBottom: 24 }}>
      <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            color: C.seeTief, background: C.flaggold, borderRadius: 999, padding: "2px 8px" }}>Videokurs</span>
          <span style={{ fontSize: 12, color: C.goldText }}>{n} Lektionen · mit Kurz-Checks</span>
        </div>
        <p style={{ color: C.weiss, fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>{vk.titel}</p>
        <p style={{ color: C.goldText, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6, marginBottom: 14 }}>{vk.intro}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}><Fortschrittsbalken anteil={fertig / n} hell /></div>
          <span style={{ fontSize: 12, color: C.goldText, whiteSpace: "nowrap" }}>{fertig} von {n} erledigt</span>
        </div>
      </div>
      <div style={{ padding: "16px 16px 18px" }}>
        <Lektionsliste kursId={kursId} aktiv={-1} erledigt={erledigt} onWahl={(i) => onStart(i)} />
        <button onClick={() => onStart(weiter)}
          style={{ width: "100%", height: 52, marginTop: 8, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontSize: 16, fontWeight: 700, color: C.weiss, background: C.gruen, boxShadow: "0 4px 14px rgba(165,0,68,0.3)" }}>
          <PlayIcon groesse={16} />
          {fertig === 0 ? "Videokurs starten" : fertig === n ? "Nochmal ansehen" : `Weiter mit Lektion ${weiter + 1}`}
        </button>
      </div>
    </div>
  );
}

/* Kurz-Check: eine Multiple-Choice-Frage direkt nach dem Video */
function KurzCheck({ check }) {
  const [wahl, setWahl] = useState(null);
  const beantwortet = wahl !== null;
  return (
    <div style={{ background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 14px rgba(15,26,51,0.06)", border: `1px solid ${C.linie}` }}>
      <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 6 }}>Kurz-Check</p>
      <p style={{ fontSize: 15.5, fontWeight: 600, color: C.tinte, lineHeight: 1.5, marginBottom: 12 }}>{check.frage}</p>
      {check.optionen.map((o, i) => {
        const richtig = i === check.richtig, gewaehlt = i === wahl;
        const farbe = !beantwortet ? C.linie : richtig ? C.smaragd : gewaehlt ? C.signal : C.linie;
        return (
          <button key={i} onClick={() => !beantwortet && setWahl(i)} disabled={beantwortet}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", fontFamily: "inherit",
              cursor: beantwortet ? "default" : "pointer", padding: "11px 14px", marginBottom: 8, borderRadius: 12,
              border: `1.5px solid ${farbe}`, fontSize: 14.5, color: C.tinte,
              background: beantwortet && richtig ? "#EEF8F2" : beantwortet && gewaehlt ? "#FBEFEA" : C.weiss }}>
            <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 999, fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: beantwortet && richtig ? C.smaragd : beantwortet && gewaehlt ? C.signal : C.sand,
              color: beantwortet && (richtig || gewaehlt) ? C.weiss : C.grau }}>
              {beantwortet && richtig ? "✓" : beantwortet && gewaehlt ? "✗" : String.fromCharCode(65 + i)}
            </span>
            {o}
          </button>
        );
      })}
      {beantwortet && (
        <div style={{ marginTop: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: wahl === check.richtig ? C.smaragd : C.signal, marginBottom: 4 }}>
            {wahl === check.richtig ? "Richtig!" : "Nicht ganz."}
          </p>
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6 }}>{check.erklaerung}</p>
          <button onClick={() => setWahl(null)}
            style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, marginTop: 8 }}>
            Nochmal versuchen
          </button>
        </div>
      )}
    </div>
  );
}

/* Lektionsansicht */
export function VideokursPlayer({ kursId, kursTitel, start = 0, onZurueck, gehe }) {
  const vk = VIDEOKURSE[kursId];
  const [i, setI] = useState(start);
  const [erledigt, setErledigt] = useState(() => ladeErledigt(kursId));
  useEffect(() => { window.scrollTo(0, 0); }, [i]);
  if (!vk) return null;
  const l = vk.lektionen[i];
  const n = vk.lektionen.length;
  const fertig = vk.lektionen.filter((x) => erledigt.includes(x.id)).length;
  const letzte = i === n - 1;

  const abhaken = () => {
    if (erledigt.includes(l.id)) return erledigt;
    const neu = [...erledigt, l.id];
    setErledigt(neu); speichereErledigt(kursId, neu);
    return neu;
  };
  const weiter = () => { abhaken(); if (!letzte) setI(i + 1); };
  const allesFertig = vk.lektionen.every((x) => erledigt.includes(x.id));

  const abschnittTitel = (t) => (
    <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 8 }}>{t}</p>
  );

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <button onClick={onZurueck} className="mb-5"
        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        ← {kursTitel}
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel }}>Lektion {i + 1} von {n}</span>
        <span style={{ fontSize: 12.5, color: C.hellgrau }}>· {l.kapitel}</span>
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 16 }}>{l.titel}</h2>

      {/* Video 16:9 */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 18, overflow: "hidden",
        background: C.seeTief, boxShadow: "0 8px 28px rgba(14,30,74,0.25)", marginBottom: 20 }}>
        <iframe key={l.youtube} title={l.titel}
          src={`https://www.youtube-nocookie.com/embed/${l.youtube}?rel=0&modestbranding=1&playsinline=1`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen />
      </div>

      {/* Worum es geht */}
      <div style={{ marginBottom: 20 }}>
        {abschnittTitel("Worum es geht")}
        <p style={{ fontSize: 15.5, color: C.grau, fontWeight: 300, lineHeight: 1.75 }}>{l.worum}</p>
      </div>

      {/* Kernpunkte */}
      <div style={{ background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 14px rgba(15,26,51,0.06)", marginBottom: 16 }}>
        {abschnittTitel("Das nimmst du mit")}
        {l.mitnehmen.map((m, k) => (
          <div key={k} style={{ display: "flex", gap: 12, marginBottom: k === l.mitnehmen.length - 1 ? 0 : 10 }}>
            <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 8, background: C.himmel, color: C.see,
              fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{k + 1}</span>
            <span style={{ fontSize: 15, color: C.tinte, lineHeight: 1.55 }}>{m}</span>
          </div>
        ))}
      </div>

      {/* Merksatz */}
      <div style={{ borderLeft: `4px solid ${C.flaggold}`, background: "#FFF9E5", borderRadius: "0 14px 14px 0", padding: "14px 16px", marginBottom: 20 }}>
        <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A6D00", marginBottom: 4 }}>Merksatz</p>
        <p style={{ fontSize: 15.5, fontWeight: 600, color: C.tinte, lineHeight: 1.55 }}>{l.merksatz}</p>
      </div>

      {/* Kurz-Check */}
      <div style={{ marginBottom: 16 }}>
        <KurzCheck key={l.id} check={l.check} />
      </div>

      {/* Jetzt üben */}
      {l.ueben && gehe && (
        <button onClick={() => gehe({ ansicht: l.ueben.ansicht, ziel: l.ueben.ziel })}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 22,
            padding: "14px 16px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            border: `1px solid ${C.linie}`, background: C.weiss, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
          <span>
            <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel }}>Jetzt üben</span>
            <span style={{ display: "block", fontSize: 15.5, fontWeight: 600, color: C.tinte, marginTop: 2 }}>{l.ueben.label}</span>
          </span>
          <span style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 999, background: C.gruen, color: C.weiss,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>→</span>
        </button>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}
          style={{ flex: "0 0 auto", height: 52, padding: "0 18px", borderRadius: 14, fontFamily: "inherit", fontSize: 14.5, fontWeight: 600,
            cursor: i === 0 ? "default" : "pointer", border: `1px solid ${C.linie}`, background: C.weiss,
            color: i === 0 ? C.hellgrau : C.see }}>
          ← Zurück
        </button>
        <button onClick={weiter}
          style={{ flex: 1, height: 52, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit",
            fontSize: 15.5, fontWeight: 700, color: C.weiss,
            background: letzte ? C.smaragd : `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` }}>
          {letzte ? (allesFertig ? "Kurs abgeschlossen ✓" : "Kurs abschließen ✓") : "Erledigt · weiter →"}
        </button>
      </div>

      {letzte && allesFertig && (
        <div style={{ textAlign: "center", background: "#EEF8F2", borderRadius: 16, padding: "16px 18px", marginBottom: 24 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: C.smaragd }}>Alle {n} Lektionen geschafft! 🎉</p>
          <p style={{ fontSize: 13.5, color: C.grau, marginTop: 4 }}>Festige das Gelernte jetzt mit den Aufgaben aus dem Kurs.</p>
        </div>
      )}

      {/* Kursinhalt */}
      <div style={{ background: C.weiss, borderRadius: 18, padding: 16, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.tinte }}>Kursinhalt · {vk.titel}</p>
          <span style={{ fontSize: 12, color: C.grau }}>{fertig} / {n}</span>
        </div>
        <div style={{ marginBottom: 14 }}><Fortschrittsbalken anteil={fertig / n} /></div>
        <Lektionsliste kursId={kursId} aktiv={i} erledigt={erledigt} onWahl={setI} />
      </div>
    </div>
  );
}
