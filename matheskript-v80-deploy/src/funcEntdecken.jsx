import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { GrosserKnopf, karte } from "./ui2.jsx";
import { PotenzModul } from "./funcEntdeckenPotenz.jsx";
import { useEntdeckenSyncStatus } from "./entdeckenSync.js";
import {
  PHASEN_ANZAHL, REFLEX_IDS, einstiegFortschritt, entdeckenHoeren, entdeckenStand, reflexionBeantwortet, reflexionSetzen, statusEinstieg, statusPotenz, videoGesehen, videoSetzen,
} from "./entdeckenSpeicher.js";

/* ======================================================================
   MATHE ENTDECKEN – zweiter Hauptbereich neben „Mathe-Training“.
   Aufbau: Übersicht (Begrüßung, zwei Lernangebote mit Status) →
     Lernangebot 1: Hauptvideo, Reflexionsfragen, zwei weitere Videos →
     Lernangebot 2: „Mathe entdecken in der Praxis“ mit Themenkarte →
     Modul: siebenphasiges Potenzregel-Modul (Zurück führt zur Übersicht).
   Fortschritt und Antworten liegen in entdeckenSpeicher.js (localStorage).
   Alle Video-IDs sind per YouTube-oEmbed geprüft.
   ====================================================================== */

export const ENTDECKEN_VIDEOS = [
  { id: "haupt", video: "ytVneQUA5-c", titel: "Five Principles of Extraordinary Math Teaching", quelle: "Dan Finkel · TEDxRainier",
    url: "https://www.youtube.com/watch?v=ytVneQUA5-c" },
  { id: "puzzle", video: "piJkuavhV50", titel: "Solving problems by adding a dimension", quelle: "3Blue1Brown",
    url: "https://www.youtube.com/watch?v=piJkuavhV50",
    ziel: "Du erlebst, wie ungewöhnliche Fragestellungen und ein Perspektivwechsel zu neuen mathematischen Lösungswegen führen.",
    text: "Manchmal liegt die Lösung nicht darin, schneller zu rechnen, sondern die Aufgabe anders zu betrachten. Beobachte, wie sich neue Möglichkeiten ergeben, wenn du deine ursprüngliche Denkweise hinterfragst." },
  { id: "calculus", video: "WUvTyaaNkzM", titel: "The essence of calculus", quelle: "3Blue1Brown",
    url: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
    ziel: "Du bekommst einen visuellen Eindruck davon, wie grundlegende Ideen der Analysis aus anschaulichen Fragen entstehen.",
    text: "Auch große mathematische Ideen lassen sich aus einfachen Fragen entwickeln. Dieses Video zeigt, wie man sich den Ideen hinter der Analysis Schritt für Schritt nähern kann." },
];

const REFLEXION = [
  { id: "q1", frage: "Muss ich eine mathematische Aufgabe sofort lösen können, um etwas dabei zu lernen?",
    optionen: [["a", "Nein – auch beim Ausprobieren lerne ich etwas"], ["b", "Nur, wenn ich am Ende die Lösung sehe"], ["c", "Das hängt von der Aufgabe ab"]] },
  { id: "q2", frage: "Warum kann es sinnvoll sein, zunächst selbst zu experimentieren, statt direkt eine fertige Regel anzuschauen?",
    optionen: [["a", "Ich merke mir Dinge besser, die ich selbst herausgefunden habe"], ["b", "Ich verstehe, warum die Regel gilt"], ["c", "Es ist nicht sinnvoll – die fertige Regel ist schneller"]] },
  { id: "q3", frage: "Was ist der Unterschied zwischen einer Formel auswendig zu lernen und zu verstehen, warum sie gilt?",
    optionen: [["a", "Wer versteht, kann die Formel auch neu herleiten"], ["b", "Wer versteht, erkennt, wann und wie sie anwendbar ist"], ["c", "Es gibt keinen großen Unterschied"]] },
];

const STATUS = {
  offen: { text: "Noch nicht begonnen", farbe: C.grau, grund: C.hellgrau + "33" },
  arbeit: { text: "In Bearbeitung", farbe: "#7A5800", grund: "#FFF4CC" },
  fertig: { text: "Abgeschlossen", farbe: "#0F7A4D", grund: "#E6F6EF" },
};

const kickerStil = { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 8 };
const absatz = { color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, margin: 0 };

/* Stand neu lesen, sobald sich im Speicher etwas ändert */
function useStand() {
  const [, setZ] = useState(0);
  useEffect(() => entdeckenHoeren(() => setZ((z) => z + 1)), []);
  return entdeckenStand();
}

function StatusChip({ status }) {
  const s = STATUS[status] || STATUS.offen;
  return (
    <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, color: s.farbe, background: s.grund, whiteSpace: "nowrap" }}>
      {status === "fertig" ? "✓ " : ""}{s.text}
    </span>
  );
}

/* Responsiver 16:9-Player, keine automatische Wiedergabe */
function VideoRahmen({ v, gross }) {
  return (
    <div>
      <div style={{ borderRadius: gross ? 16 : 14, overflow: "hidden", background: "#000", boxShadow: gross ? "0 3px 18px rgba(15,26,51,0.1)" : "0 2px 12px rgba(15,26,51,0.08)" }}>
        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
          <iframe src={`https://www.youtube-nocookie.com/embed/${v.video}?rel=0&modestbranding=1&playsinline=1`}
            title={`${v.titel} – ${v.quelle}`} loading="lazy" allowFullScreen
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
        </div>
      </div>
      <p style={{ fontSize: 12.5, fontWeight: 300, color: C.grau, margin: "8px 2px 0", lineHeight: 1.5 }}>
        {v.quelle} – {v.titel}{" · "}
        <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ color: C.see, fontWeight: 600, textDecoration: "none" }}>Auf YouTube ansehen</a>
      </p>
    </div>
  );
}

/* „Video gesehen“-Schalter: der Schüler markiert selbst (YouTube meldet den Fortschritt nicht zuverlässig zurück) */
function GesehenSchalter({ id }) {
  const an = videoGesehen(id);
  return (
    <button type="button" aria-pressed={an} onClick={() => videoSetzen(id, !an)}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, minHeight: 40, padding: "6px 14px 6px 10px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer",
        fontSize: 13, fontWeight: 700, border: `1.5px solid ${an ? "#0F7A4D" : C.linie}`, background: an ? "#E6F6EF" : C.weiss, color: an ? "#0F7A4D" : C.see }}>
      <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12,
        background: an ? "#0F7A4D" : C.himmel, color: an ? C.weiss : C.see }}>{an ? "✓" : ""}</span>
      {an ? "Video gesehen" : "Ich habe das Video gesehen"}
    </button>
  );
}

/* ---------- Reflexion ---------- */
function Reflexion({ stand }) {
  return (
    <div style={{ ...karte, padding: 20, marginTop: 22 }}>
      <p style={kickerStil}>Reflexion</p>
      <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3, color: C.tinte, margin: "0 0 6px" }}>Drei Fragen an dich</h3>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "0 0 4px" }}>
        Hier gibt es kein Richtig und kein Falsch. Es geht darum, wie du selbst lernst.
      </p>
      {REFLEXION.map((q, i) => {
        const a = stand.reflexion[q.id] || {};
        return (
          <div key={q.id} style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${C.linie}` }}>
            <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5, color: C.tinte, margin: "0 0 10px" }}>
              <span style={{ color: C.see }}>{i + 1}.</span> {q.frage}
            </p>
            <div role="group" aria-label={`Frage ${i + 1}`} style={{ display: "grid", gap: 8 }}>
              {q.optionen.map(([oid, text]) => {
                const an = a.wahl === oid;
                return (
                  <button key={oid} type="button" aria-pressed={an} onClick={() => reflexionSetzen(q.id, { wahl: an ? "" : oid })}
                    style={{ textAlign: "left", fontFamily: "inherit", cursor: "pointer", minHeight: 44, padding: "10px 14px", borderRadius: 12, fontSize: 14, fontWeight: 600, lineHeight: 1.45,
                      border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.tinte }}>
                    {text}
                  </button>
                );
              })}
            </div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: C.grau, margin: "12px 0 6px" }} htmlFor={`refl-${q.id}`}>Deine eigenen Gedanken (optional)</label>
            <textarea id={`refl-${q.id}`} rows={3} value={a.text || ""} onChange={(e) => reflexionSetzen(q.id, { text: e.target.value })}
              placeholder="Schreib auf, was dir dazu einfällt …"
              style={{ width: "100%", boxSizing: "border-box", fontFamily: "inherit", fontSize: 14.5, lineHeight: 1.6, color: C.tinte, padding: "10px 12px", borderRadius: 12,
                border: `1.5px solid ${C.linie}`, background: C.weiss, resize: "vertical" }} />
            {reflexionBeantwortet(a) && (
              <p style={{ fontSize: 12.5, fontWeight: 600, color: "#0F7A4D", margin: "8px 0 0" }}>✓ Gespeichert</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Themenkarte: Lernweg in drei Schritten ---------- */
function Lernweg() {
  const schritte = [
    { nr: 1, titel: "Binomische Formel", text: "Eine bekannte Formel genau untersuchen." },
    { nr: 2, titel: "Pascalsches Dreieck", text: "Ein Zahlenmuster erkennen." },
    { nr: 3, titel: "Potenzregel:", formel: "f′(x)=n\\cdot x^{n-1}", text: "Eine allgemeine Regel selbst herleiten." },
  ];
  return (
    <ol style={{ listStyle: "none", margin: "18px 0 0", padding: 0 }}>
      {schritte.map((s, i) => (
        <li key={s.nr} style={{ display: "flex", gap: 14, position: "relative", paddingBottom: i < schritte.length - 1 ? 18 : 0 }}>
          {i < schritte.length - 1 && (
            <span aria-hidden="true" style={{ position: "absolute", left: 17, top: 38, bottom: 2, width: 2, borderRadius: 1, background: `linear-gradient(180deg, ${C.flaggold}, ${C.linie})` }} />
          )}
          <span aria-hidden="true" style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1,
            background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss, fontSize: 15, fontWeight: 700 }}>{s.nr}</span>
          <div style={{ minWidth: 0, flex: 1, paddingTop: 3 }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 12, rowGap: 2 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte, margin: 0, lineHeight: 1.3 }}>{s.titel}</p>
              {s.formel && <span style={{ fontSize: 20, color: C.tinte, maxWidth: "100%" }}><M t={s.formel} /></span>}
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 300, color: C.grau, lineHeight: 1.55, margin: "2px 0 0" }}>{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Übersichtskarte (anklickbar, springt zum Abschnitt) ---------- */
function LernangebotKarte({ nr, titel, text, status, fortschritt, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label={`${titel} – ${STATUS[status].text}`}
      style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%", fontFamily: "inherit", cursor: "pointer",
        background: C.weiss, border: "none", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
      <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
        background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss, fontSize: 16, fontWeight: 700 }}>{nr}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{titel}</span>
        <span style={{ display: "block", fontSize: 13, fontWeight: 300, color: C.grau, lineHeight: 1.5, margin: "2px 0 8px" }}>{text}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <StatusChip status={status} />
          {fortschritt && <span style={{ fontSize: 12, fontWeight: 600, color: C.grau }}>{fortschritt}</span>}
        </span>
      </span>
      <svg width="9" height="15" viewBox="0 0 9 15" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M1.5 1.5 L7.5 7.5 L1.5 13.5" fill="none" stroke={C.see} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function ZurueckKnopf({ onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{ fontFamily: "inherit", cursor: "pointer", background: "none", border: "none", padding: "6px 0", marginBottom: 14, fontSize: 13.5, fontWeight: 600, color: C.see }}>
      ← Mathe entdecken
    </button>
  );
}

/* ---------- Wo ist der Fortschritt gespeichert? ---------- */
const SPEICHER_TEXT = {
  lokal: ["Dein Fortschritt ist auf diesem Gerät gespeichert.", C.hellgrau],
  aus: ["Dein Fortschritt ist auf diesem Gerät gespeichert. Mit einem Konto ist er auf allen Geräten da.", C.hellgrau],
  verbinde: ["Verbinde mit deinem Konto …", C.grau],
  ausstehend: ["Wird in deinem Konto gesichert …", C.grau],
  ok: ["Im Konto gesichert – auf allen deinen Geräten verfügbar.", "#0F7A4D"],
  "nicht-eingerichtet": ["Konto-Speicher noch nicht eingerichtet – dein Fortschritt bleibt vorerst auf diesem Gerät.", C.grau],
  fehler: ["Sichern im Konto hat nicht geklappt. Dein Fortschritt bleibt auf diesem Gerät, bei der nächsten Änderung versuchen wir es erneut.", "#B3261E"],
};
function SpeicherHinweis() {
  const st = useEntdeckenSyncStatus();
  const [text, farbe] = SPEICHER_TEXT[st.status] || SPEICHER_TEXT.lokal;
  return (
    <p role="status" style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, fontWeight: 400, color: C.grau, lineHeight: 1.55, margin: "22px 2px 0" }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 8, height: 8, borderRadius: 999, background: farbe, marginTop: 6 }} />
      <span>{text}</span>
    </p>
  );
}

/* ---------- Übersicht ---------- */
function Uebersicht({ stand, oeffne }) {
  const sE = statusEinstieg();
  const sP = statusPotenz();
  const nE = einstiegFortschritt();
  const phase = Math.min((stand.potenz.phase || 0) + 1, PHASEN_ANZAHL);
  const zuletzt = stand.zuletzt;
  return (
    <>
      <div style={{ ...karte, borderLeft: `4px solid ${C.flaggold}`, padding: "18px 20px" }}>
        <p style={{ ...absatz, color: C.tinte, fontWeight: 500, marginBottom: 12 }}>
          Die spannendsten Erkenntnisse entstehen oft mit einer einfachen Frage: Warum ist das eigentlich so?
        </p>
        <p style={{ ...absatz, marginBottom: 12 }}>
          In diesem Bereich lernst du, Mathematik wie ein Entdecker zu betrachten. Du wirst Vermutungen aufstellen, Zusammenhänge untersuchen und eigene Erklärungen entwickeln.
        </p>
        <p style={absatz}>
          Du musst nicht sofort die Lösung kennen. Entscheidend ist, dass du lernst, die richtigen Fragen zu stellen.
        </p>
      </div>

      <div style={{ marginTop: 28 }}>
        <p style={kickerStil}>Deine Lernangebote</p>
        <div style={{ display: "grid", gap: 12 }}>
          <LernangebotKarte nr={1} titel="Mathe entdecken" text="Wie entsteht mathematisches Denken?" status={sE}
            fortschritt={sE === "arbeit" ? `Video ${videoGesehen("haupt") ? "✓" : "–"} · ${nE} von ${REFLEX_IDS.length} Fragen` : null} onClick={() => oeffne("einstieg")} />
          <LernangebotKarte nr={2} titel="Pascalsches Dreieck" text="Entdecke die Potenzregel" status={sP}
            fortschritt={sP === "arbeit" ? `Phase ${phase} von ${PHASEN_ANZAHL}` : null} onClick={() => oeffne("praxis")} />
        </div>
        {zuletzt && (
          <button type="button" onClick={() => oeffne(zuletzt.id === "potenz" ? "praxis" : "einstieg")}
            style={{ display: "block", width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", background: "none", border: "none", padding: 0,
              fontSize: 12.5, fontWeight: 300, color: C.grau, margin: "14px 2px 0", lineHeight: 1.5 }}>
            Zuletzt bearbeitet: <b style={{ fontWeight: 600, color: C.tinte }}>{zuletzt.id === "potenz" ? "Pascalsches Dreieck" : "Mathe entdecken"}</b> · {zuletzt.label}{" "}
            <span style={{ color: C.see, fontWeight: 600 }}>Weitermachen →</span>
          </button>
        )}
      </div>
      <SpeicherHinweis />
    </>
  );
}

/* ---------- Lernangebot 1: Einstieg ---------- */
function Einstieg({ stand, zurueck, weiter }) {
  const [haupt, v2, v3] = ENTDECKEN_VIDEOS;
  return (
    <>
      <ZurueckKnopf onClick={zurueck} />
      <p style={kickerStil}>Lernangebot 1</p>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: C.tinte, margin: "0 0 18px" }}>
        Mathe entdecken – Wie entsteht mathematisches Denken?
      </h2>
      <VideoRahmen v={haupt} gross />
      <GesehenSchalter id={haupt.id} />
      <p style={{ ...absatz, marginTop: 18 }}>
        Mathematik wird interessant, wenn du selbst denkst, ausprobierst und entdeckst.
      </p>
      <p style={{ ...absatz, marginTop: 10 }}>
        Achte beim Anschauen darauf, welche Rolle Neugier, Fragen und eigene Ideen beim Lernen von Mathematik spielen.
      </p>

      <Reflexion stand={stand} />

      <div style={{ marginTop: 34 }}>
        <p style={kickerStil}>Mathematische Kreativität</p>
        <p style={{ ...absatz, marginBottom: 18 }}>Zwei weitere Perspektiven, wenn du tiefer einsteigen möchtest.</p>
        {[v2, v3].map((v, i) => (
          <div key={v.id} style={{ ...karte, padding: 16, marginTop: i ? 16 : 0 }}>
            <VideoRahmen v={v} />
            <GesehenSchalter id={v.id} />
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.gruenDunkel, margin: "14px 0 6px" }}>{i + 2}. Video</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.tinte, lineHeight: 1.5, margin: "0 0 8px" }}>{v.ziel}</p>
            <p style={{ ...absatz, fontSize: 14.5 }}>{v.text}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
        <div style={{ flex: "0 0 38%" }}><GrosserKnopf ghost onClick={zurueck}>Übersicht</GrosserKnopf></div>
        <div style={{ flex: 1 }}><GrosserKnopf onClick={weiter}>Weiter zum Pascalschen Dreieck →</GrosserKnopf></div>
      </div>
    </>
  );
}

/* ---------- Lernangebot 2: Praxis mit Themenkarte ---------- */
function Praxis({ zurueck, startModul }) {
  const sP = statusPotenz();
  const phase = Math.min((entdeckenStand().potenz.phase || 0) + 1, PHASEN_ANZAHL);
  return (
    <>
      <ZurueckKnopf onClick={zurueck} />
      <p style={kickerStil}>Lernangebot 2</p>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: C.tinte, margin: "0 0 6px" }}>Mathe entdecken in der Praxis</h2>
      <p style={{ fontSize: 16, fontWeight: 600, color: C.see, margin: "0 0 14px", lineHeight: 1.4 }}>Vom Zahlenmuster zur mathematischen Regel</p>
      <p style={{ ...absatz, marginBottom: 12 }}>Jetzt probieren wir diese Denkweise selbst aus.</p>
      <p style={{ ...absatz, marginBottom: 12 }}>
        Wir beginnen mit einer bekannten Formel, entdecken ein Muster im Pascalschen Dreieck und verwenden dieses Muster schließlich, um eine wichtige Regel der Analysis herzuleiten: die Potenzregel.
      </p>
      <p style={{ ...absatz, marginBottom: 22 }}>
        Du wirst sehen, wie aus drei scheinbar unterschiedlichen Themen ein einziger zusammenhängender Gedankengang entsteht.
      </p>

      <div style={{ ...karte, padding: 22, background: `linear-gradient(180deg, ${C.weiss} 0%, ${C.himmel} 100%)`, border: `1px solid ${C.linie}` }}>
        <p style={kickerStil}>Lernmodul</p>
        <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, color: C.tinte, margin: 0 }}>
          Pascalsches Dreieck – Entdecke die Potenzregel
        </h3>
        <Lernweg />
      </div>

      <GrosserKnopf onClick={startModul}>Jetzt selbst entdecken</GrosserKnopf>
      {sP !== "offen" && (
        <p style={{ fontSize: 12.5, fontWeight: 300, color: C.grau, textAlign: "center", margin: "10px 0 0" }}>
          {sP === "fertig" ? "Modul abgeschlossen – du kannst es jederzeit wiederholen." : `Du bist bei Phase ${phase} von ${PHASEN_ANZAHL} – dein Stand ist gespeichert.`}
        </p>
      )}
    </>
  );
}

export function EntdeckenSeite() {
  const stand = useStand();
  const [seite, setSeite] = useState("uebersicht"); // uebersicht | einstieg | praxis | modul
  useEffect(() => { window.scrollTo(0, 0); }, [seite]);

  if (seite === "modul") return <PotenzModul onZurueck={() => setSeite("uebersicht")} />;

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      {seite === "uebersicht" && <Uebersicht stand={stand} oeffne={setSeite} />}
      {seite === "einstieg" && <Einstieg stand={stand} zurueck={() => setSeite("uebersicht")} weiter={() => setSeite("praxis")} />}
      {seite === "praxis" && <Praxis zurueck={() => setSeite("uebersicht")} startModul={() => setSeite("modul")} />}
    </div>
  );
}

/* Logo für die Startkachel: Lupe über einem Pascalschen Dreieck, daneben die Potenzregel-Idee */
export function EntdeckenLogoKlein() {
  const W = 230, H = 190;
  const reihen = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {reihen.map((r, i) => r.map((z, j) => {
        const x = 115 + (j - (r.length - 1) / 2) * 34, y = 32 + i * 28;
        const markiert = i === 3 && (j === 1 || j === 2);
        return (
          <g key={`${i}-${j}`}>
            <circle cx={x} cy={y} r="13" fill={markiert ? C.flaggold : "rgba(255,255,255,0.1)"} stroke={markiert ? C.flaggold : "rgba(255,255,255,0.35)"} strokeWidth="1.5" />
            <text x={x} y={y + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="Montserrat, system-ui, sans-serif" fill={markiert ? C.seeTief : C.weiss}>{z}</text>
          </g>
        );
      }))}
      <g transform="translate(146 126)">
        <circle cx="22" cy="22" r="17" fill="rgba(255,255,255,0.08)" stroke={C.flaggold} strokeWidth="4" />
        <line x1="34" y1="34" x2="52" y2="52" stroke={C.flaggold} strokeWidth="6" strokeLinecap="round" />
      </g>
      <text x="34" y="170" fontSize="20" fontWeight="700" fontFamily="Montserrat, system-ui, sans-serif" fill={C.weiss} opacity="0.85">xⁿ</text>
    </svg>
  );
}
