import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { merken } from "./func5.jsx";
import { buche, paarRunde, status, mischen } from "./headNumbers.js";
import { L, karte, kopfAendern, useKopf, modulInfo, H2, Absatz, Zurueck, Knopf } from "./funcHeadNumbersBasis.jsx";

/* ======================================================================
   SPIELE – Zuordnung und Zahlenmemory
   ====================================================================== */
export function Zuordnung({ modul, bloecke, onZurueck }) {
  const K = useKopf();
  const [runde, setRunde] = useState(0);
  const spiel = useMemo(() => paarRunde(K, { modul, anzahl: 6, richtung: "mix", bloecke }), [runde]); // eslint-disable-line react-hooks/exhaustive-deps
  const rechts = useMemo(() => mischen(spiel.paare.map((p, i) => ({ ...p, i }))), [spiel]);
  const [links, setLinks] = useState(null);
  const [fertig, setFertig] = useState({});
  const [fehl, setFehl] = useState({});
  const [zeigeFalsch, setZeigeFalsch] = useState(null);
  const info = modulInfo(modul);
  const alle = Object.keys(fertig).length === spiel.paare.length;
  useEffect(() => { setLinks(null); setFertig({}); setFehl({}); }, [spiel]);

  const waehleRechts = (r) => {
    if (links === null || fertig[r.i]) return;
    const p = spiel.paare[links];
    if (r.i === links) {
      const hilfe = fehl[links] ? 1 : 0;
      kopfAendern((Kp) => buche(Kp, p.key, true, { modus: "erkennen", hilfe }));
      try { merken({ gruppe: `Head & Numbers · ${info.gruppe}`, richtig: true }); } catch (e) { /* optional */ }
      setFertig((f) => ({ ...f, [links]: true })); setLinks(null);
    } else {
      if (!fehl[links]) {
        kopfAendern((Kp) => buche(Kp, p.key, false, { modus: "erkennen" }));
        try { merken({ gruppe: `Head & Numbers · ${info.gruppe}`, richtig: false, fehlerart: "rechnen" }); } catch (e) { /* optional */ }
      }
      setFehl((f) => ({ ...f, [links]: (f[links] || 0) + 1 }));
      setZeigeFalsch(r.i); setTimeout(() => setZeigeFalsch(null), 600);
    }
  };
  const fehler = Object.keys(fehl).length;
  const zelle = (aktiv, fertigFlag, falsch) => ({
    minHeight: 54, padding: "8px 10px", borderRadius: 14, fontFamily: "inherit", fontSize: "clamp(16px, 4.6vw, 20px)", fontWeight: 700, whiteSpace: "nowrap", cursor: fertigFlag ? "default" : "pointer",
    border: `2px solid ${fertigFlag ? C.smaragd : falsch ? C.signal : aktiv ? C.flaggold : C.linie}`, background: fertigFlag ? "#EEF8F2" : aktiv ? "#FFF8DC" : C.weiss, color: C.tinte, opacity: fertigFlag ? 0.7 : 1,
  });
  return (
    <div>
      <Zurueck onClick={onZurueck}>{info.titel}</Zurueck>
      <H2 style={{ fontSize: 22 }}>{L("Zuordnungsspiel", "Matching game")}</H2>
      <Absatz>{L("Tippe links eine Karte an und dann rechts die passende. Ein Fehlgriff kostet nichts – er merkt sich nur, was du noch einmal anschauen solltest.", "Tap a card on the left, then the matching one on the right. A wrong tap costs nothing – it only remembers what to look at again.")}</Absatz>
      <div style={{ ...karte, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ display: "grid", gap: 8 }}>
            {spiel.paare.map((p, i) => <button key={p.key} type="button" disabled={!!fertig[i]} aria-pressed={links === i} onClick={() => setLinks(i)} style={zelle(links === i, fertig[i], false)}>{p.links}</button>)}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {rechts.map((r) => <button key={r.key} type="button" disabled={!!fertig[r.i] || links === null} onClick={() => waehleRechts(r)} style={zelle(false, fertig[r.i], zeigeFalsch === r.i)}>{r.rechts}</button>)}
          </div>
        </div>
        {alle && (
          <div style={{ marginTop: 16 }} role="status">
            <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte }}>{fehler === 0 ? L("Alle Paare gefunden – ohne Fehlgriff!", "All pairs found – no wrong taps!") : L(`Alle Paare gefunden. ${fehler} Paar${fehler === 1 ? "" : "e"} zum Nochmal-Anschauen.`, `All pairs found. ${fehler} pair${fehler === 1 ? "" : "s"} to look at again.`)}</p>
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              <Knopf onClick={() => setRunde(runde + 1)}>{L("Neue Karten", "New cards")}</Knopf>
              <Knopf haupt={false} onClick={onZurueck}>{L("Zurück zur Übersicht", "Back to overview")}</Knopf>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Memory({ modul, bloecke, onZurueck }) {
  const K = useKopf();
  const [runde, setRunde] = useState(0);
  const spiel = useMemo(() => paarRunde(K, { modul, anzahl: 6, richtung: "mix", bloecke }), [runde]); // eslint-disable-line react-hooks/exhaustive-deps
  const karten = useMemo(() => mischen(spiel.paare.flatMap((p, i) => [{ id: `${i}a`, paar: i, text: p.links, key: p.key }, { id: `${i}b`, paar: i, text: p.rechts, key: p.key }])), [spiel]);
  const [offen, setOffen] = useState([]);
  const [gefunden, setGefunden] = useState([]);
  const [zuege, setZuege] = useState(0);
  const timer = useRef(null);
  const info = modulInfo(modul);
  useEffect(() => { setOffen([]); setGefunden([]); setZuege(0); }, [spiel]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const alle = gefunden.length === spiel.paare.length;

  const dreh = (k) => {
    if (offen.length >= 2 || offen.includes(k.id) || gefunden.includes(k.paar)) return;
    const neu = [...offen, k.id];
    setOffen(neu);
    if (neu.length === 2) {
      setZuege((z) => z + 1);
      const [x, y] = neu.map((id) => karten.find((c) => c.id === id));
      if (x.paar === y.paar) {
        kopfAendern((Kp) => buche(Kp, x.key, true, { modus: "erkennen" }));
        try { merken({ gruppe: `Head & Numbers · ${info.gruppe}`, richtig: true }); } catch (e) { /* optional */ }
        timer.current = setTimeout(() => { setGefunden((g) => [...g, x.paar]); setOffen([]); }, 450);
      } else timer.current = setTimeout(() => setOffen([]), 1000);
    }
  };
  return (
    <div>
      <Zurueck onClick={onZurueck}>{info.titel}</Zurueck>
      <H2 style={{ fontSize: 22 }}>{L("Zahlenmemory", "Number memory")}</H2>
      <Absatz>{L("Finde die zusammengehörigen Karten. Zeit spielt keine Rolle – nur das Merken.", "Find the cards that belong together. Time does not matter – only remembering.")}</Absatz>
      <div style={{ ...karte, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {karten.map((k) => {
            const auf = offen.includes(k.id) || gefunden.includes(k.paar);
            const gef = gefunden.includes(k.paar);
            return (
              <button key={k.id} type="button" aria-label={auf ? k.text : L("verdeckte Karte", "face-down card")} onClick={() => dreh(k)}
                style={{ minHeight: 70, borderRadius: 14, fontFamily: "inherit", fontSize: "clamp(16px, 4.6vw, 20px)", fontWeight: 800, whiteSpace: "nowrap", cursor: auf ? "default" : "pointer",
                  border: gef ? `2px solid ${C.smaragd}` : "none", color: auf ? C.tinte : C.flaggold,
                  background: gef ? "#EEF8F2" : auf ? "#FFF8DC" : `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, transition: "background .15s" }}>
                {auf ? k.text : "?"}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 13, color: C.grau, marginTop: 12 }}>{L("Züge", "Moves")}: <b style={{ color: C.tinte }}>{zuege}</b> · {L("gefunden", "found")}: <b style={{ color: C.tinte }}>{gefunden.length}/{spiel.paare.length}</b></p>
        {alle && (
          <div style={{ display: "grid", gap: 10, marginTop: 14 }} role="status">
            <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte }}>{L(`Geschafft in ${zuege} Zügen.`, `Done in ${zuege} moves.`)}</p>
            <Knopf onClick={() => setRunde(runde + 1)}>{L("Neue Karten", "New cards")}</Knopf>
            <Knopf haupt={false} onClick={onZurueck}>{L("Zurück zur Übersicht", "Back to overview")}</Knopf>
          </div>
        )}
      </div>
    </div>
  );
}

