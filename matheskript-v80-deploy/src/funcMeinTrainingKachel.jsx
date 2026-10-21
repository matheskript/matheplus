/* ============================================================
   Kachel „Mein Mathe-Training“ ganz oben auf der Startseite: weißer Grund, blauer Rand (wie „Dein Training startet hier.“).
   Angemeldet: heute offen, Themen in Arbeit, nächste Arbeit, Knopf zum Tagesplan. Ohne Konto: Anmelden oder Test-Account.
   Leicht gehalten – die Seite selbst (funcMeinTraining.jsx) wird erst beim Öffnen geladen.
   ============================================================ */
import React, { useMemo } from "react";
import { C } from "./base1.jsx";
import { useEbb, useJetzt } from "./funcEbbinghaus.jsx";
import { testkontoStarten, useKonto } from "./konto.js";
import { useMT } from "./meinTrainingSpeicher.js";
import { kommendeArbeiten, tageText } from "./ebbinghaus.js";
import { MAX_AKTIV, eigeneThemen, tagesStand } from "./meinTraining.js";

const knopf = { minHeight: 42, padding: "8px 16px", borderRadius: 999, border: `1.5px solid ${C.see}`, background: C.see, color: C.weiss, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" };
const knopfHell = { ...knopf, background: C.weiss, color: C.see };

function Zahl({ wert, text, farbe }) {
  return (
    <div style={{ flex: "1 1 90px", background: C.sand, borderRadius: 12, padding: "8px 12px" }}>
      <p style={{ fontSize: 22, fontWeight: 800, color: farbe || C.tinte, lineHeight: 1.1 }}>{wert}</p>
      <p style={{ fontSize: 11.5, color: C.grau, lineHeight: 1.35 }}>{text}</p>
    </div>
  );
}

/* ---------- Für Startseite und Lernpfad: offene Einträge heute ---------- */
export function useOffenHeute() {
  const { E, geladen } = useEbb();
  const MT = useMT();
  const jetzt = useJetzt();
  const stand = useMemo(() => tagesStand(MT, E, { jetzt }), [MT, E, jetzt]);
  const arbeit = kommendeArbeiten(E, { jetzt })[0] || null;
  return { offen: stand.gesamt - stand.erledigt, gesamt: stand.gesamt, fertig: stand.fertig, hatSkills: eigeneThemen(MT).length > 0 || Object.keys(E.skills).length > 0, geladen, arbeit: arbeit && arbeit.tage <= 14 ? { art: arbeit.art, tage: arbeit.tage } : null, themen: eigeneThemen(MT).length };
}
export function meinTrainingText(s) {
  if (s.geladen && s.arbeit) return `${s.arbeit.art} ${tageText(s.arbeit.tage)}. ${s.fertig ? "Tagesplan geschafft." : s.offen > 0 ? `Heute ${s.offen === 1 ? "wartet 1 Eintrag" : `warten ${s.offen} Einträge`} auf dich.` : "Dein Tagesplan und deine Themen."}`;
  if (!s.geladen || !s.hatSkills) return "Deine Themen, dein Tagesplan, deine Wiederholungen – an einem Ort.";
  if (s.fertig) return "Tagesplan geschafft. Deine Themen und dein Stand.";
  if (s.offen > 0) return `Heute ${s.offen === 1 ? "wartet 1 Eintrag" : `warten ${s.offen} Einträge`} auf dich.`;
  return "Deine Themen, dein Tagesplan, deine Wiederholungen – an einem Ort.";
}

export function MeinTrainingKachel({ gehe }) {
  const konto = useKonto();
  const { E, geladen } = useEbb();
  const MT = useMT();
  const jetzt = useJetzt();
  const stand = useMemo(() => tagesStand(MT, E, { jetzt }), [MT, E, jetzt]);
  const arbeit = useMemo(() => kommendeArbeiten(E, { jetzt })[0] || null, [E, jetzt]);
  const angemeldet = !!konto.nutzer;
  const offen = stand.gesamt - stand.erledigt;
  const titel = (
    <>
      <h2 style={{ margin: 0, fontSize: "clamp(19px, 5.2vw, 25px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.12, color: C.see }}>Mein Mathe-Training</h2>
      <span aria-hidden="true" style={{ display: "block", width: 40, height: 3, borderRadius: 2, marginTop: 9, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)` }} />
    </>
  );
  return (
    <div data-start-meintraining style={{ width: "calc(100% + 32px)", margin: "12px -16px 0", border: `2px solid ${C.see}`, borderRadius: 18, background: C.weiss, boxShadow: "0 6px 22px rgba(0,77,152,0.14)", padding: "16px 16px 14px" }}>
      {titel}
      {!angemeldet ? (
        <>
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "10px 0 0" }}>Was mache ich heute? Wo stehe ich? Mit Konto bekommst du jeden Tag einen Plan aus deinen Themen, Wiederholungen und Fehlern.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <button type="button" onClick={() => gehe({ ansicht: "konto" })} style={knopf}>Anmelden</button>
            <button type="button" data-testkonto onClick={() => { testkontoStarten(); import("./funcMeinTraining.jsx").then((m) => m.testdatenEinspielen()).catch(() => {}); gehe({ ansicht: "meintraining" }); }} style={knopfHell}>Test-Account starten</button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "10px 0 0" }}>
            {!geladen ? "Dein Lernstand wird geladen …" : eigeneThemen(MT).length === 0 ? "Noch kein Thema in Arbeit. Wähl eins – ab dann steht hier jeden Tag dein Plan." : stand.fertig ? "Tagesplan geschafft. Mehr ist heute nicht nötig." : offen > 0 ? `Heute ${offen === 1 ? "wartet 1 Eintrag" : `warten ${offen} Einträge`} auf dich.` : "Heute ist nichts fällig."}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <Zahl wert={geladen ? `${stand.erledigt}/${stand.gesamt}` : "–"} text="heute erledigt" farbe={stand.fertig && stand.gesamt ? C.smaragd : C.see} />
            <Zahl wert={`${eigeneThemen(MT).length}/${MAX_AKTIV}`} text="Themen in Arbeit" />
            <Zahl wert={arbeit ? tageText(arbeit.tage) : "–"} text={arbeit ? arbeit.art : "keine Arbeit eingetragen"} farbe={arbeit && arbeit.tage <= 3 ? C.signal : undefined} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <button type="button" onClick={() => gehe({ ansicht: "meintraining" })} style={knopf}>{eigeneThemen(MT).length ? "Zum Tagesplan ›" : "Thema wählen ›"}</button>
          </div>
        </>
      )}
    </div>
  );
}
