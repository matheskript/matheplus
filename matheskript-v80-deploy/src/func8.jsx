import React, { useState, useRef } from "react";
import { C } from "./base1.jsx";
import { FEHLERARTEN } from "./base2.jsx";
import { ABI_ZEIT, AKTIVE, COACHING, EINHEITEN, ICS_TAGE, KOMP, LERN, LINIEN, MODELLE, TAG_MS, WOCHENTAGE, dauerText, hatEinheit, istLerntag, komma, mischen, notenText, notenpunkte, pseudonymVon, tagSchluessel, wochentagIdx } from "./base3.jsx";
import { datumAus, datumKurz, mittel, pZweiseitig, pz, streuung, tageText } from "./base4.jsx";
import { M, Text } from "./func3.jsx";
import { Lernlandkarte, Profil, antwortPruefen, lernAendern, naechsteKompetenz, useLern, wiederholListe } from "./func6.jsx";
import { AufgabeFeld, probeabiturErzeugen, pruefungsBefund, teilPruefen } from "./func7.jsx";
import { aktiveTermine, terminPlan } from "./func9.jsx";
import { FR } from "./funcRegistry.jsx";

export function Probeabitur() {
  const [abi, setAbi] = useState(null);
  const [teil, setTeil] = useState("start");
  const [antA, setAntA] = useState({});
  const [antB, setAntB] = useState({});
  const [rest, setRest] = useState(0);
  const [ergebnis, setErgebnis] = useState(null);

  React.useEffect(() => {
    if (teil !== "A" && teil !== "B") return;
    const t = setInterval(() => setRest((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [teil]);

  React.useEffect(() => {
    if ((teil === "A" || teil === "B") && rest <= 0) { if (teil === "A") zuB(); else abgeben(); }
  }, [rest]);

  const starten = () => { setAbi(probeabiturErzeugen()); setAntA({}); setAntB({}); setErgebnis(null); setTeil("A"); setRest(ABI_ZEIT.A); window.scrollTo(0, 0); };
  const zuB = () => { setTeil("B"); setRest(ABI_ZEIT.B); window.scrollTo(0, 0); };

  const abgeben = () => {
    const posten = [];
    abi.teilA.forEach((t, i) => posten.push({ teil: "A", t, ok: teilPruefen(t, antA[i]) }));
    abi.teilB.forEach((blk, bi) => blk.teile.forEach((t, ti) => posten.push({ teil: "B", blk: blk.titel, t, ok: teilPruefen(t, antB[`${bi}-${ti}`]) })));
    const summe = (f) => posten.filter(f).reduce((s, p) => s + p.t.be, 0);
    const max = summe(() => true), erreicht = summe((p) => p.ok);
    const prozent = Math.round((erreicht / max) * 100);
    const proKomp = {};
    posten.forEach((p) => { if (!p.t.komp) return; proKomp[p.t.komp] = proKomp[p.t.komp] || { ok: 0, n: 0 }; proKomp[p.t.komp].n++; if (p.ok) proKomp[p.t.komp].ok++; });
    Object.entries(proKomp).forEach(([id, w]) => pruefungsBefund(id, w.ok === w.n));
    const nOk = posten.filter((p) => p.ok).length;
    if (nOk) aktivitaetMelden({ ok: true, anzahl: nOk });
    if (posten.length - nOk) aktivitaetMelden({ ok: false, anzahl: posten.length - nOk });
    setErgebnis({ posten, max, erreicht, prozent, np: notenpunkte(prozent),
      a: { e: summe((p) => p.teil === "A" && p.ok), m: summe((p) => p.teil === "A") },
      b: { e: summe((p) => p.teil === "B" && p.ok), m: summe((p) => p.teil === "B") }, proKomp });
    setTeil("ende"); window.scrollTo(0, 0);
  };

  const uhr = `${Math.floor(Math.max(rest, 0) / 60)}:${String(Math.max(rest, 0) % 60).padStart(2, "0")}`;
  const knopf = { height: 50, padding: "0 26px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999,
    fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" };
  const karte = { background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 14 };

  const feld = (t, wert, setzen) => (
    <div className="flex items-center" style={{ gap: 10, marginTop: 8 }}>
      {t.praefix && <span style={{ fontSize: 15, fontWeight: 500, flexShrink: 0 }}><M t={t.praefix} /></span>}
      <input value={wert || ""} onChange={(e) => setzen(e.target.value)}
        style={{ flex: 1, minWidth: 0, padding: "10px 12px", fontSize: 15.5, fontFamily: "inherit", border: `1px solid ${C.linie}`, borderRadius: 11, outline: "none" }} />
    </div>
  );

  if (teil === "start") {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <div style={karte}>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>So läuft das Probeabitur</p>
          {[["Teil A · ohne Hilfsmittel", `${ABI_ZEIT.A / 60} Minuten, sechs kürzere Aufgaben. Kein Taschenrechner, keine Formelsammlung.`],
            ["Teil B · mit Hilfsmitteln", `${ABI_ZEIT.B / 60} Minuten, je ein Block Analysis, Stochastik und Geometrie. Taschenrechner erlaubt, Ergebnisse auf drei Nachkommastellen.`],
            ["Bewertung", "Jede Teilaufgabe hat Bewertungseinheiten. Am Ende gibt es Notenpunkte nach dem üblichen Abiturschlüssel — und eine Aufschlüsselung, welche Kompetenzen getragen haben."]]
            .map(([t, s], i) => (
              <div key={i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: i < 2 ? `1px solid ${C.linie}` : "none" }}>
                <p style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 4 }}>{t}</p>
                <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>{s}</p>
              </div>
            ))}
          <p style={{ fontSize: 13, color: C.hellgrau, fontWeight: 300, lineHeight: 1.7 }}>
            Rechne auf Papier wie in der echten Prüfung und trag nur die Ergebnisse ein. Wenn du die Seite verlässt,
            wird das Probeabitur abgebrochen — plane dir die Zeit am Stück ein.
          </p>
        </div>
        <button onClick={starten} style={knopf}>Probeabitur beginnen</button>
      </div>
    );
  }

  if (teil === "A" || teil === "B") {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <div className="flex justify-between items-center" style={{ position: "sticky", top: 56, zIndex: 20, background: C.sand, padding: "10px 0", marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.see }}>{teil === "A" ? "Teil A · ohne Hilfsmittel" : "Teil B · mit Hilfsmitteln"}</span>
          <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: rest < 300 ? C.signal : C.tinte }}>{uhr}</span>
        </div>

        {teil === "A" && abi.teilA.map((t, i) => (
          <div key={i} style={karte}>
            <div className="flex justify-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel }}>Aufgabe {i + 1}</span>
              <span style={{ fontSize: 12, color: C.hellgrau }}>{t.be} BE</span>
            </div>
            <Text s={t.frage} style={{ fontSize: 15.5, lineHeight: 1.8, margin: 0 }} />
            {feld(t, antA[i], (w) => setAntA({ ...antA, [i]: w }))}
          </div>
        ))}

        {teil === "B" && abi.teilB.map((blk, bi) => (
          <div key={bi} style={karte}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.gruenDunkel, letterSpacing: "0.04em", marginBottom: 8 }}>
              {blk.titel.toUpperCase()}
            </p>
            <Text s={blk.kopf} style={{ fontSize: 15.5, lineHeight: 1.8, marginBottom: 12 }} />
            {blk.teile.map((t, ti) => (
              <div key={ti} style={{ paddingTop: 12, marginTop: 12, borderTop: `1px solid ${C.linie}` }}>
                <div className="flex justify-between" style={{ gap: 10 }}>
                  <span style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.see }}>{String.fromCharCode(97 + ti)})</span>
                    <Text s={t.frage} style={{ fontSize: 14.5, lineHeight: 1.75, margin: 0 }} />
                  </span>
                  <span style={{ fontSize: 12, color: C.hellgrau, flexShrink: 0 }}>{t.be} BE</span>
                </div>
                {feld(t, antB[`${bi}-${ti}`], (w) => setAntB({ ...antB, [`${bi}-${ti}`]: w }))}
              </div>
            ))}
          </div>
        ))}

        <button onClick={teil === "A" ? zuB : abgeben} style={knopf}>
          {teil === "A" ? "Teil A abgeben, weiter zu Teil B" : "Probeabitur abgeben"}
        </button>
      </div>
    );
  }

  // Auswertung
  const e = ergebnis;
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <div className="auftauchen" style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 20, padding: 24, marginBottom: 16 }}>
        <p style={{ fontSize: 12, letterSpacing: "1.4px", color: C.gruen, fontWeight: 600, marginBottom: 10 }}>PROBEABITUR</p>
        <div className="flex items-end" style={{ gap: 14 }}>
          <span style={{ fontSize: 56, fontWeight: 700, color: C.weiss, lineHeight: 1, letterSpacing: "-0.03em" }}>{e.np}</span>
          <span style={{ fontSize: 15, color: "#C9D6EE", paddingBottom: 8 }}>Notenpunkte · {notenText(e.np)}</span>
        </div>
        <p style={{ fontSize: 14.5, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.7, marginTop: 12 }}>
          {e.erreicht} von {e.max} BE ({e.prozent} %) · Teil A {e.a.e}/{e.a.m} · Teil B {e.b.e}/{e.b.m}
        </p>
      </div>

      <div style={karte}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Nach Kompetenzen</p>
        {Object.entries(e.proKomp).map(([id, w]) => (
          <div key={id} className="flex justify-between items-center" style={{ marginBottom: 9, gap: 10 }}>
            <span style={{ fontSize: 14 }}>{KOMP[id]?.titel || id}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: w.ok === w.n ? C.see : C.signal, flexShrink: 0 }}>{w.ok}/{w.n}</span>
          </div>
        ))}
        <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, lineHeight: 1.7, marginTop: 8 }}>
          Was nicht getragen hat, steht jetzt auf deiner Lernlandkarte wieder in Arbeit und kommt zur Wiederholung.
        </p>
      </div>

      <div style={karte}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Alle Aufgaben</p>
        {e.posten.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ width: 18, fontSize: 14, color: p.ok ? C.see : C.signal, flexShrink: 0 }}>{p.ok ? "✓" : "○"}</span>
            <div style={{ flex: 1 }}>
              <Text s={`${p.blk ? p.blk + ": " : ""}${p.t.frage}`} style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: C.grau }} />
              {!p.ok && (
                <p style={{ fontSize: 13.5, color: C.see, lineHeight: 1.9 }}>
                  richtig: <M t={p.t.art === "nahe" ? komma(p.t.soll, 3) : (p.t.zeig || p.t.loesung)} />
                </p>
              )}
            </div>
            <span style={{ fontSize: 12, color: C.hellgrau, flexShrink: 0 }}>{p.ok ? p.t.be : 0}/{p.t.be}</span>
          </div>
        ))}
      </div>

      <button onClick={() => setTeil("start")} style={knopf}>Neues Probeabitur</button>
    </div>
  );
}

/* ---------- 12 · Modellieren ---------- */

/* Der Modellierungskreislauf in vier Schritten: verstehen, mathematisieren,
   rechnen, interpretieren. Jeder Schritt wird einzeln geprüft. */

export function Modellieren() {
  const [runde, setRunde] = useState(0);
  const m = React.useMemo(() => MODELLE[runde % MODELLE.length](), [runde]);
  const mischung = React.useMemo(() => ({ g: mischen(m.groessen.optionen.length), d: mischen(m.deuten.optionen.length) }), [runde]);
  const [schritt, setSchritt] = useState(0);
  const [wahl, setWahl] = useState(null);
  const [eingabe, setEingabe] = useState("");
  const [stand, setStand] = useState(null);
  const [fehlerZahl, setFehlerZahl] = useState(0);

  const neu = () => { setRunde(runde + 1); setSchritt(0); setWahl(null); setEingabe(""); setStand(null); setFehlerZahl(0); };
  const naechster = () => { setSchritt(schritt + 1); setWahl(null); setEingabe(""); setStand(null); };

  const SCHRITTE = ["Verstehen", "Mathematisieren", "Rechnen", "Interpretieren"];
  const knopf = { height: 46, padding: "0 24px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999,
    fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" };

  const auswahlBlock = (block, folge) => (
    <>
      <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6, marginBottom: 10 }}>{block.frage}</p>
      {folge.map((i) => {
        const o = block.optionen[i];
        const gezeigt = wahl !== null;
        const rand = gezeigt ? (i === block.richtig ? C.see : i === wahl ? C.signal : C.linie) : C.linie;
        return (
          <button key={i} onClick={() => { if (wahl === null) { setWahl(i); if (i !== block.richtig) setFehlerZahl(fehlerZahl + 1); } }}
            style={{ display: "block", width: "100%", textAlign: "left", background: C.weiss, border: `2px solid ${rand}`, borderRadius: 12,
              padding: "11px 14px", marginBottom: 8, fontSize: 14.5, fontFamily: "inherit", cursor: wahl === null ? "pointer" : "default", color: C.tinte }}>
            {o}
          </button>
        );
      })}
      {wahl !== null && block.warum && <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.7, marginTop: 4 }}>{block.warum}</p>}
    </>
  );

  const eingabeBlock = (block) => (
    <>
      <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6, marginBottom: 10 }}>{block.frage}</p>
      <AufgabeFeld aufgabe={block} wert={eingabe} setWert={(w) => { setEingabe(w); setStand(null); }} stand={stand} />
      {!stand && (
        <button onClick={() => { const ok = antwortPruefen(block, eingabe); setStand(ok ? "ok" : "nein"); aktivitaetMelden({ ok }); if (!ok) setFehlerZahl(fehlerZahl + 1); }}
          disabled={!eingabe.trim()} className="mt-4" style={knopf}>Prüfen</button>
      )}
      {stand && (
        <p style={{ fontSize: 14.5, marginTop: 12, lineHeight: 1.9, color: stand === "ok" ? C.see : C.signal }}>
          {stand === "ok" ? "Stimmt." : <>Stimmt nicht — richtig wäre <M t={block.loesung} />.</>}
        </p>
      )}
    </>
  );

  const fertig = schritt >= 4;
  const aktuellFertig = schritt === 0 || schritt === 3 ? wahl !== null : stand !== null;

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 16 }}>
        An Sachaufgaben scheitern auch Schüler, die rechnen können — weil der schwierigste Schritt vor der Rechnung
        liegt. Hier wird jeder Schritt des Modellierens einzeln geübt und geprüft.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 6 }}>
        {SCHRITTE.map((s, i) => (
          <div key={s} style={{ height: 6, borderRadius: 999, background: i < schritt ? C.see : i === schritt ? C.gruenDunkel : C.linie }} />
        ))}
      </div>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel, marginBottom: 14 }}>
        {fertig ? "Geschafft" : `${schritt + 1} · ${SCHRITTE[schritt]}`}
      </p>

      <div style={{ background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 14, borderTop: `4px solid ${C.see}` }}>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: C.see, marginBottom: 6 }}>{m.titel}</p>
        <p style={{ fontSize: 15.5, lineHeight: 1.8 }}>{m.text}</p>
      </div>

      {!fertig && (
        <div style={{ background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 14 }}>
          {schritt === 0 && auswahlBlock(m.groessen, mischung.g)}
          {schritt === 1 && eingabeBlock(m.modell)}
          {schritt === 2 && eingabeBlock(m.rechnen)}
          {schritt === 3 && auswahlBlock(m.deuten, mischung.d)}
        </div>
      )}

      {!fertig && aktuellFertig && (
        <button onClick={() => { if (schritt === 3) pruefungsBefund(m.thema, fehlerZahl === 0); naechster(); }} style={knopf}>
          {schritt < 3 ? `Weiter: ${SCHRITTE[schritt + 1]}` : "Abschließen"}
        </button>
      )}

      {fertig && (
        <div className="auftauchen">
          <div style={{ borderLeft: `4px solid ${fehlerZahl === 0 ? C.see : C.gruenDunkel}`, paddingLeft: 16, marginBottom: 18 }}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
              {fehlerZahl === 0 ? "Alle vier Schritte sauber." : `${4 - Math.min(fehlerZahl, 4)} von 4 Schritten auf Anhieb.`}
            </p>
            <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>
              Verstehen, mathematisieren, rechnen, interpretieren — in Prüfungen gibt es für jeden dieser Schritte eigene Punkte.
            </p>
          </div>
          <button onClick={neu} style={knopf}>Nächste Sachaufgabe</button>
        </div>
      )}
    </div>
  );
}

/* ======================================================================
   PHASE D · WAS SCHULE AUSSERDEM LEISTET
   Wochenplan und Serie · Bericht für Eltern und Lehrkräfte · Eskalation
   ====================================================================== */

/* Kontaktweg für das persönliche Coaching. Einmal eintragen, dann führen
   alle Eskalationsknöpfe der App dorthin. */

export function tagVon(offset) { const d = new Date(); d.setDate(d.getDate() + offset); return d; }

/* Jede geprüfte Aufgabe irgendwo in der App landet hier. Die Lernzeit wird aus
   den Abständen zwischen den Aufgaben geschätzt — Pausen über drei Minuten zählen nicht. */

export function aktivitaetMelden({ ok = null, fehlerart = null, hilfe = false, anzahl = 1 } = {}) {
  if (!LERN.profil) return;
  lernAendern((L) => {
    const k = tagSchluessel();
    const t = L.aktivitaet[k] || { sekunden: 0, aufgaben: 0, richtig: 0, hilfe: 0, fehler: {} };
    const jetzt = Date.now(), luecke = jetzt - (L.letzteAktivitaet || 0);
    t.sekunden += luecke < 30 * 60000 ? Math.min(luecke, 180000) / 1000 : 60;
    if (ok !== null) { t.aufgaben += anzahl; if (ok) t.richtig += anzahl; }
    if (hilfe) t.hilfe += 1;
    if (fehlerart) t.fehler[fehlerart] = (t.fehler[fehlerart] || 0) + 1;
    L.aktivitaet[k] = t;
    L.letzteAktivitaet = jetzt;
  });
}


export function verlaufMelden(typ, id) {
  if (!LERN.profil) return;
  lernAendern((L) => { L.verlauf = [...(L.verlauf || []), { typ, id, zeit: Date.now() }].slice(-400); });
}


export function serieBerechnen(L) {
  const geplant = L.plan?.tage || [0, 1, 2, 3, 4, 5, 6];
  let serie = 0;
  for (let off = 0; off > -120; off--) {
    const d = tagVon(off), t = L.aktivitaet[tagSchluessel(d)];
    if (istLerntag(t)) { serie++; continue; }
    if (off === 0) continue;                         // heute ist noch nicht vorbei
    if (!geplant.includes(wochentagIdx(d))) continue; // freier Tag laut Plan
    break;
  }
  return serie;
}


export function zeitraum(L, tage) {
  const s = { sekunden: 0, aufgaben: 0, richtig: 0, hilfe: 0, lerntage: 0, fehler: {} };
  for (let off = 0; off > -tage; off--) {
    const t = L.aktivitaet[tagSchluessel(tagVon(off))];
    if (!t) continue;
    s.sekunden += t.sekunden; s.aufgaben += t.aufgaben; s.richtig += t.richtig; s.hilfe += t.hilfe;
    if (istLerntag(t)) s.lerntage++;
    Object.entries(t.fehler || {}).forEach(([a, n]) => { s.fehler[a] = (s.fehler[a] || 0) + n; });
  }
  return s;
}


export function eskalationSignale(L) {
  if (!L.profil) return [];
  const signale = [];
  const haengt = Object.entries(L.testFehl || {}).filter(([, n]) => n >= 2).map(([id]) => id);
  haengt.forEach((id) => signale.push({ art: "haengt", id,
    titel: `Bei ${KOMP[id]?.titel || "einer Kompetenz"} hakt es fest`,
    text: "Der Test hat zweimal nicht geklappt. Das liegt selten am Fleiß, meistens an einer Stelle davor, die niemand gesehen hat. Genau dafür ist ein Blick von außen da." }));

  const woche = zeitraum(L, 7);
  if (woche.aufgaben >= 15 && woche.richtig / woche.aufgaben < 0.4)
    signale.push({ art: "frust", titel: "Diese Woche ging viel daneben",
      text: "Weniger als die Hälfte der Aufgaben saß. Das ist kein Urteil — aber ein Zeichen, dass der Weg gerade zu steil ist. Lass uns ihn gemeinsam neu anlegen." });

  if (L.plan && L.letzteAktivitaet) {
    let verpasst = 0;
    for (let off = -1; off > -21 && verpasst < 4; off--) {
      const d = tagVon(off);
      if (!L.plan.tage.includes(wochentagIdx(d))) continue;
      if (istLerntag(L.aktivitaet[tagSchluessel(d)])) break;
      verpasst++;
    }
    if (verpasst >= 4)
      signale.push({ art: "pause", titel: "Du warst eine Weile nicht da",
        text: "Vier geplante Tage ohne Mathe. Das passiert jedem — die Frage ist nur, wie man wieder reinkommt. Entweder mit einem kleineren Plan oder mit einem kurzen Gespräch." });
  }
  return signale;
}


export function coachingText(L, anlass) {
  const w = zeitraum(L, 14);
  const luecken = AKTIVE.filter((k) => ["luecke", "arbeit"].includes(L.stand[k.id]?.status)).map((k) => k.titel).slice(0, 6);
  return [
    `Hallo Basti,`,
    ``,
    `ich komme mit Matheskript gerade nicht weiter und würde gern mit dir sprechen.`,
    ``,
    `Anlass: ${anlass}`,
    `Klasse: ${L.profil?.klasse || "?"} · Ziel: ${L.profil?.ziel || "?"}`,
    `Letzte zwei Wochen: ${w.lerntage} Lerntage, ${dauerText(w.sekunden)}, ${w.aufgaben} Aufgaben, davon ${w.richtig} richtig`,
    luecken.length ? `Offene Stellen: ${luecken.join(", ")}` : ``,
    ``,
    `Viele Grüße`,
    L.profil?.name || "",
  ].filter((z, i, a) => z !== "" || a[i - 1] !== "").join("\n");
}


export function coachingAnfragen(anlass) {
  if (COACHING.termin) { window.open(COACHING.termin, "_blank"); return true; }
  if (COACHING.mail) {
    const url = `mailto:${COACHING.mail}?subject=${encodeURIComponent("Matheskript · Gespräch")}&body=${encodeURIComponent(coachingText(LERN, anlass))}`;
    window.location.href = url;
    return true;
  }
  return false;
}


export function EskalationsKarte({ signal, gehe, klein }) {
  const [hinweis, setHinweis] = useState(false);
  return (
    <div className="auftauchen" style={{ background: C.weiss, borderRadius: 18, padding: klein ? 16 : 20, marginBottom: 14,
      boxShadow: "0 3px 18px rgba(15,26,51,0.08)", borderLeft: `4px solid ${C.gruenDunkel}` }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: C.gruenDunkel, letterSpacing: "0.04em", marginBottom: 6 }}>PERSÖNLICH</p>
      <p style={{ fontSize: klein ? 15.5 : 17, fontWeight: 600, lineHeight: 1.4, marginBottom: 6 }}>{signal.titel}</p>
      <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: 14 }}>{signal.text}</p>
      <div className="flex flex-wrap" style={{ gap: 10 }}>
        <button onClick={() => { if (!coachingAnfragen(signal.titel)) setHinweis(true); }}
          style={{ height: 42, padding: "0 20px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999,
            fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Mit Basti sprechen
        </button>
        {signal.art === "pause" && gehe && (
          <button onClick={() => gehe({ ansicht: "plan" })}
            style={{ height: 42, padding: "0 20px", background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999,
              fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
            Plan verkleinern
          </button>
        )}
        {signal.art === "haengt" && gehe && (
          <button onClick={() => gehe({ ansicht: "karte" })}
            style={{ height: 42, padding: "0 20px", background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999,
              fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
            Voraussetzungen ansehen
          </button>
        )}
      </div>
      {hinweis && (
        <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, lineHeight: 1.6, marginTop: 10 }}>
          Der Kontaktweg ist noch nicht hinterlegt. Im Code unter COACHING eine Mailadresse oder einen Terminlink eintragen.
        </p>
      )}
    </div>
  );
}

/* ---------- 13 · Mein Plan ---------- */


export function icsErzeugen(plan) {
  const [hh, mm] = (plan.uhrzeit || "17:00").split(":").map(Number);
  const heute = new Date();
  let start = null;
  for (let i = 0; i < 8 && !start; i++) {
    const d = tagVon(i);
    d.setHours(hh, mm, 0, 0);
    if (plan.tage.includes(wochentagIdx(d)) && d > heute) start = d;
  }
  start = start || tagVon(1);
  const f = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
  const utc = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Matheskript//Lernplan//DE", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:matheskript-plan-${Date.now()}@matheskript`,
    `DTSTAMP:${utc}`,
    `DTSTART:${f(start)}`,
    `DURATION:PT${plan.minuten}M`,
    `RRULE:FREQ=WEEKLY;BYDAY=${plan.tage.map((t) => ICS_TAGE[t]).join(",")}`,
    `SUMMARY:Matheskript · ${plan.minuten} Minuten`,
    "DESCRIPTION:Zuerst die Wiederholungen\\, dann dein nächster Schritt auf der Lernlandkarte.",
    "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:Gleich Mathe", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}


export function MeinPlan({ gehe }) {
  const L = useLern();
  const [tage, setTage] = useState(L.plan?.tage || [0, 1, 3, 4]);
  const [minuten, setMinuten] = useState(L.plan?.minuten || 20);
  const [uhrzeit, setUhrzeit] = useState(L.plan?.uhrzeit || "17:00");
  const [bearbeiten, setBearbeiten] = useState(!L.plan);
  const [kalHinweis, setKalHinweis] = useState(null);

  if (!L.profil) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>Für einen Plan brauchen wir zuerst dein Profil.</p>
        <button onClick={() => gehe({ ansicht: "profil2" })} style={{ height: 50, padding: "0 26px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Profil anlegen
        </button>
      </div>
    );
  }

  const speichern = () => {
    lernAendern((X) => { X.plan = { tage: [...tage].sort(), minuten, uhrzeit, erstellt: X.plan?.erstellt || Date.now() }; });
    setBearbeiten(false);
  };

  const kalender = () => {
    try {
      const blob = new Blob([icsErzeugen(L.plan)], { type: "text/calendar;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "matheskript-lernplan.ics";
      document.body.appendChild(a); a.click(); a.remove();
      setKalHinweis("ok");
    } catch (e) { setKalHinweis("fehler"); }
  };

  const heute = L.aktivitaet[tagSchluessel()] || { sekunden: 0, aufgaben: 0 };
  const heuteMin = Math.round(heute.sekunden / 60);
  const ziel = L.plan?.minuten || minuten;
  const anteil = Math.min(1, heuteMin / ziel);
  const serie = serieBerechnen(L);
  const montag = tagVon(-wochentagIdx());
  const woche = WOCHENTAGE.map((n, i) => {
    const d = new Date(montag); d.setDate(montag.getDate() + i);
    const t = L.aktivitaet[tagSchluessel(d)];
    return { n, geplant: (L.plan?.tage || []).includes(i), gelernt: istLerntag(t), zukunft: d > new Date() && tagSchluessel(d) !== tagSchluessel() };
  });
  const wocheGeschafft = woche.filter((w) => w.geplant && w.gelernt).length;
  const wocheGeplant = woche.filter((w) => w.geplant).length;
  const faellig = wiederholListe(L);
  const naechste = naechsteKompetenz(L.profil, L.stand);

  const karte = { background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 14 };
  const R = 38, U = 2 * Math.PI * R;

  if (bearbeiten) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 18 }}>
          Ein Plan ist eine Verabredung mit dir selbst. Lieber klein und gehalten als groß und gebrochen — zwanzig
          Minuten an vier Tagen bringen mehr als zwei Stunden am Sonntag.
        </p>
        <div style={karte}>
          <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 8 }}>An welchen Tagen?</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 18 }}>
            {WOCHENTAGE.map((n, i) => {
              const an = tage.includes(i);
              return (
                <button key={n} onClick={() => setTage(an ? tage.filter((x) => x !== i) : [...tage, i])}
                  style={{ height: 42, borderRadius: 11, border: `1px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss,
                    color: an ? C.weiss : C.grau, fontSize: 13.5, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>{n}</button>
              );
            })}
          </div>
          <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 8 }}>Wie lange pro Tag?</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 18 }}>
            {[10, 20, 30, 45].map((m) => (
              <button key={m} onClick={() => setMinuten(m)}
                style={{ height: 42, borderRadius: 11, border: `1px solid ${minuten === m ? C.see : C.linie}`, background: minuten === m ? C.see : C.weiss,
                  color: minuten === m ? C.weiss : C.grau, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>{m} min</button>
            ))}
          </div>
          <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 8 }}>Um wie viel Uhr?</p>
          <input type="time" value={uhrzeit} onChange={(e) => setUhrzeit(e.target.value)}
            style={{ padding: "10px 12px", fontSize: 16, fontFamily: "inherit", border: `1px solid ${C.linie}`, borderRadius: 11, outline: "none" }} />
          <p style={{ fontSize: 13, color: C.hellgrau, fontWeight: 300, marginTop: 14, lineHeight: 1.6 }}>
            Das sind {tage.length * minuten} Minuten pro Woche.
          </p>
        </div>
        <button onClick={speichern} disabled={!tage.length}
          style={{ height: 50, padding: "0 26px", background: tage.length ? C.gruenDunkel : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Plan speichern
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      {/* Heute */}
      <div style={{ ...karte, display: "flex", gap: 18, alignItems: "center" }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ flexShrink: 0 }}>
          <circle cx="48" cy="48" r={R} fill="none" stroke={C.himmel} strokeWidth="9" />
          <circle cx="48" cy="48" r={R} fill="none" stroke={anteil >= 1 ? C.see : C.gruenDunkel} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={`${U * anteil} ${U}`} transform="rotate(-90 48 48)" style={{ transition: "stroke-dasharray .6s" }} />
          <text x="48" y="46" textAnchor="middle" fontSize="20" fontWeight="700" fill={C.tinte}>{heuteMin}</text>
          <text x="48" y="62" textAnchor="middle" fontSize="10" fill={C.hellgrau}>von {ziel} min</text>
        </svg>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 4 }}>Heute</p>
          <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35, marginBottom: 4 }}>
            {!woche[wochentagIdx()].geplant ? "Heute ist frei." : anteil >= 1 ? "Für heute geschafft." : `Noch ${Math.max(0, ziel - heuteMin)} Minuten.`}
          </p>
          <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>{heute.aufgaben} Aufgaben gerechnet</p>
        </div>
      </div>

      {/* Tagesablauf */}
      {woche[wochentagIdx()].geplant && anteil < 1 && (
        <div style={karte}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Die Reihenfolge für heute</p>
          {[
            faellig.length > 0 && { t: `${faellig.length} Wiederholung${faellig.length > 1 ? "en" : ""}`, s: "Erst sichern, was schon da ist.", ziel: { ansicht: "wiederholen" } },
            naechste && { t: naechste.titel, s: "Dein nächster Schritt auf der Karte.", ziel: hatEinheit(naechste.id) ? { ansicht: "einheit", kompetenz: naechste.id } : naechste.ziel || { ansicht: "karte" } },
            { t: "Fünf Minuten Kopfrechnen", s: "Zum Abschluss, für den Kopf.", ziel: { ansicht: "kopf" } },
          ].filter(Boolean).map((p, i) => (
            <button key={i} onClick={() => gehe(p.ziel)} className="kachel w-full"
              style={{ display: "flex", gap: 12, alignItems: "center", textAlign: "left", width: "100%", background: C.himmel, border: "none",
                borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, background: C.see, color: C.weiss, fontSize: 12.5, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
              <span>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: C.tinte }}>{p.t}</span>
                <span style={{ display: "block", fontSize: 12.5, color: C.grau, fontWeight: 300 }}>{p.s}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Woche und Serie */}
      <div style={karte}>
        <div className="flex justify-between items-baseline" style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.see }}>Diese Woche</span>
          <span style={{ fontSize: 13, color: C.grau }}>{wocheGeschafft} von {wocheGeplant} geplanten Tagen</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 16 }}>
          {woche.map((w, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ height: 36, borderRadius: 10, marginBottom: 4,
                background: w.gelernt ? C.see : w.geplant && !w.zukunft && i < wochentagIdx() ? "#F6E3DA" : w.geplant ? C.himmel : "#F4F4F2",
                border: i === wochentagIdx() ? `2px solid ${C.gruenDunkel}` : "2px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "center", color: C.weiss, fontSize: 14 }}>
                {w.gelernt ? "✓" : ""}
              </div>
              <span style={{ fontSize: 11.5, color: w.geplant ? C.tinte : C.hellgrau }}>{w.n}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center" style={{ gap: 12, paddingTop: 14, borderTop: `1px solid ${C.linie}` }}>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: serie > 0 ? C.gruenDunkel : C.hellgrau }}>{serie}</span>
          <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.5 }}>
            {serie === 1 ? "Lerntag in Folge" : "Lerntage in Folge"}<br />
            <span style={{ fontSize: 12, color: C.hellgrau }}>Freie Tage laut Plan unterbrechen die Serie nicht.</span>
          </span>
        </div>
      </div>

      {/* Erinnerung */}
      <div style={karte}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Erinnerung</p>
        <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: 14 }}>
          {L.plan.tage.map((t) => WOCHENTAGE[t]).join(", ")} um {L.plan.uhrzeit} Uhr, je {L.plan.minuten} Minuten. Trag den Plan
          in deinen Kalender ein — dann erinnert dich dein Handy zehn Minuten vorher, auch wenn die App geschlossen ist.
        </p>
        <div className="flex flex-wrap" style={{ gap: 10 }}>
          <button onClick={kalender}
            style={{ height: 44, padding: "0 20px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            In den Kalender eintragen
          </button>
          <button onClick={() => setBearbeiten(true)}
            style={{ height: 44, padding: "0 20px", background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 14.5, fontFamily: "inherit", cursor: "pointer" }}>
            Plan ändern
          </button>
        </div>
        {kalHinweis === "ok" && <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, marginTop: 10, lineHeight: 1.6 }}>Die Kalenderdatei wurde erzeugt. Öffne sie, um die Termine zu übernehmen.</p>}
        {kalHinweis === "fehler" && <p style={{ fontSize: 12.5, color: C.signal, marginTop: 10 }}>Das Herunterladen ist hier nicht möglich — in der Web-Fassung der App funktioniert es.</p>}
      </div>
    </div>
  );
}

/* ---------- 14 · Wochenbericht ---------- */


export function Wochenbericht() {
  const L = useLern();
  const [fuer, setFuer] = useState("eltern");
  const [geteilt, setGeteilt] = useState(null);

  if (!L.profil) return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7 }}>Der Bericht entsteht, sobald ein Profil angelegt ist und gelernt wurde.</p>
    </div>
  );

  const w = zeitraum(L, 7), vw = (() => {
    const s = { sekunden: 0, aufgaben: 0, richtig: 0 };
    for (let off = -7; off > -14; off--) { const t = L.aktivitaet[tagSchluessel(tagVon(off))]; if (t) { s.sekunden += t.sekunden; s.aufgaben += t.aufgaben; s.richtig += t.richtig; } }
    return s;
  })();
  const quote = w.aufgaben ? Math.round((w.richtig / w.aufgaben) * 100) : null;
  const vquote = vw.aufgaben ? Math.round((vw.richtig / vw.aufgaben) * 100) : null;
  const grenze = Date.now() - 7 * TAG_MS;
  const ereignisse = (L.verlauf || []).filter((v) => v.zeit >= grenze);
  const gesichert = [...new Set(ereignisse.filter((v) => v.typ === "gesichert").map((v) => v.id))];
  const wiederholt = ereignisse.filter((v) => v.typ === "wiederholt").length;
  const geplant = L.plan ? L.plan.tage.length : null;
  const fehlerListe = Object.entries(w.fehler).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const von = tagVon(-6), bis = new Date();
  const datum = (d) => `${d.getDate()}.${d.getMonth() + 1}.`;
  const tendenz = quote !== null && vquote !== null ? (quote - vquote >= 5 ? "steigend" : vquote - quote >= 5 ? "fallend" : "stabil") : null;

  const zeilen = [
    `Wochenbericht Matheskript · ${L.profil.name} · ${datum(von)}–${datum(bis)}`,
    ``,
    `Lerntage: ${w.lerntage}${geplant ? ` von ${geplant} geplanten` : ""}`,
    `Lernzeit: ${dauerText(w.sekunden)}`,
    `Aufgaben: ${w.aufgaben}${quote !== null ? `, davon ${quote} % richtig${tendenz ? ` (Tendenz ${tendenz})` : ""}` : ""}`,
    `Hilfe bei Mathilda angefragt: ${w.hilfe}-mal`,
    gesichert.length ? `Neu gesichert: ${gesichert.map((id) => KOMP[id]?.titel).join(", ")}` : `Neu gesichert: noch nichts in dieser Woche`,
    `Wiederholungen erledigt: ${wiederholt}`,
    fehlerListe.length ? `Woran gearbeitet wird: ${fehlerListe.map(([a, n]) => `${FEHLERARTEN[a] || a} (${n}×)`).join(", ")}` : ``,
  ];
  const termine = aktiveTermine(L).map((t) => ({ t, p: terminPlan(L, t) }));
  termine.forEach(({ t, p }) => zeilen.push(`Vorbereitung: ${t.art} am ${datumKurz(datumAus(t.datum))} — ${p.sitzen} von ${p.ziel.length} Stationen sitzen${t.probe?.am ? ", Probeklausur geschrieben" : ""}`));
  if (fuer === "lehrer") {
    zeilen.push(``, `Lernstand nach Linien:`);
    LINIEN.forEach((i) => {
      const ks = AKTIVE.filter((k) => k.idee === i.id);
      const tr = ks.filter((k) => ["sicher", "vermutet"].includes(L.stand[k.id]?.status)).length;
      const lu = ks.filter((k) => L.stand[k.id]?.status === "luecke").map((k) => k.titel);
      zeilen.push(`· ${i.name}: ${tr} von ${ks.length} tragen${lu.length ? ` — Lücken: ${lu.join(", ")}` : ""}`);
    });
  }
  const berichtText = zeilen.filter((z, i, a) => z !== "" || a[i - 1] !== "").join("\n");

  const teilen = async () => {
    try {
      if (navigator.share) { await navigator.share({ title: "Wochenbericht Matheskript", text: berichtText }); setGeteilt("geteilt"); return; }
      await navigator.clipboard.writeText(berichtText); setGeteilt("kopiert");
    } catch (e) { setGeteilt("fehler"); }
  };

  const karte = { background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 14 };
  const Zahl = ({ wert, name, klein }) => (
    <div style={{ background: C.himmel, borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
      <p style={{ fontSize: klein ? 18 : 24, fontWeight: 700, letterSpacing: "-0.02em", color: C.tinte, lineHeight: 1.1 }}>{wert}</p>
      <p style={{ fontSize: 11.5, color: C.grau, marginTop: 4 }}>{name}</p>
    </div>
  );

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <div className="flex gap-2 mb-4">
        {[["eltern", "Für Eltern"], ["lehrer", "Für Lehrkräfte"]].map(([id, n]) => (
          <button key={id} onClick={() => setFuer(id)} className="px-4 py-2"
            style={{ flex: 1, background: fuer === id ? C.see : C.weiss, color: fuer === id ? C.weiss : C.grau,
              border: `1px solid ${fuer === id ? C.see : C.linie}`, borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>{n}</button>
        ))}
      </div>

      <div className="druckblatt">
        <div style={karte}>
          <p style={{ fontSize: 11, letterSpacing: "1.6px", color: C.gruenDunkel, fontWeight: 600, marginBottom: 6 }}>WOCHENBERICHT</p>
          <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{L.profil.name}</p>
          <p style={{ fontSize: 13, color: C.grau, fontWeight: 300 }}>Klasse {L.profil.klasse} · {datum(von)} bis {datum(bis)}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 18 }}>
            <Zahl wert={`${w.lerntage}${geplant ? `/${geplant}` : ""}`} name="Lerntage" />
            <Zahl wert={dauerText(w.sekunden)} name="Lernzeit" klein />
            <Zahl wert={quote !== null ? `${quote} %` : "—"} name="richtig" />
          </div>
          {tendenz && (
            <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginTop: 12 }}>
              Gegenüber der Vorwoche: {tendenz} ({vquote} % → {quote} %).
            </p>
          )}
        </div>

        {termine.length > 0 && (
          <div style={karte}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Vorbereitung auf Termine</p>
            {termine.map(({ t, p }) => (
              <div key={t.id} style={{ marginBottom: 12 }}>
                <div className="flex justify-between" style={{ marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{t.art} am {datumKurz(datumAus(t.datum))}</span>
                  <span style={{ fontSize: 12.5, color: C.grau }}>{tageText(p.rest)}</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: C.himmel }}>
                  <div style={{ height: 6, borderRadius: 999, background: C.see, width: `${p.ziel.length ? (p.sitzen / p.ziel.length) * 100 : 0}%` }} />
                </div>
                <p style={{ fontSize: 12.5, color: C.grau, marginTop: 4 }}>
                  {p.sitzen} von {p.ziel.length} Stationen sitzen{t.probe?.am ? " · Probeklausur geschrieben" : ""}{p.fehlend > 0 ? " · Zeit knapp" : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        <div style={karte}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Was passiert ist</p>
          {[
            ["Aufgaben gerechnet", w.aufgaben],
            ["Neu gesicherte Kompetenzen", gesichert.length],
            ["Wiederholungen erledigt", wiederholt],
            ["Hilfe bei Mathilda angefragt", `${w.hilfe}-mal`],
          ].map(([n, v]) => (
            <div key={n} className="flex justify-between" style={{ marginBottom: 9 }}>
              <span style={{ fontSize: 14, color: C.grau }}>{n}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          {gesichert.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: 6, marginTop: 10 }}>
              {gesichert.map((id) => (
                <span key={id} style={{ fontSize: 12.5, padding: "4px 10px", borderRadius: 999, background: C.see, color: C.weiss }}>{KOMP[id]?.titel}</span>
              ))}
            </div>
          )}
        </div>

        {fehlerListe.length > 0 && (
          <div style={karte}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 4 }}>Woran gearbeitet wird</p>
            <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, marginBottom: 12 }}>Nicht wie viele Fehler — welche.</p>
            {fehlerListe.map(([a, n]) => (
              <div key={a} className="flex justify-between" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>{FEHLERARTEN[a] || a}</span>
                <span style={{ fontSize: 13, color: C.grau }}>{n}×</span>
              </div>
            ))}
          </div>
        )}

        {fuer === "lehrer" && (
          <div style={karte}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Lernstand nach Linien</p>
            {LINIEN.map((i) => {
              const ks = AKTIVE.filter((k) => k.idee === i.id);
              const tr = ks.filter((k) => ["sicher", "vermutet"].includes(L.stand[k.id]?.status)).length;
              const lu = ks.filter((k) => L.stand[k.id]?.status === "luecke");
              return (
                <div key={i.id} style={{ marginBottom: 14 }}>
                  <div className="flex justify-between" style={{ marginBottom: 5 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>{i.name}</span>
                    <span style={{ fontSize: 12.5, color: C.grau }}>{tr}/{ks.length}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: C.himmel }}>
                    <div style={{ height: 6, borderRadius: 999, background: i.farbe, width: `${(tr / ks.length) * 100}%` }} />
                  </div>
                  {lu.length > 0 && <p style={{ fontSize: 12, color: C.signal, marginTop: 4 }}>Lücken: {lu.map((k) => k.titel).join(", ")}</p>}
                </div>
              );
            })}
          </div>
        )}

        <p style={{ fontSize: 12, color: C.hellgrau, fontWeight: 300, lineHeight: 1.7, marginBottom: 16 }}>
          {fuer === "eltern"
            ? "Dieser Bericht enthält keine Noten. Er zeigt, wie regelmäßig und wie eigenständig gearbeitet wurde — das sind die Dinge, die Sie unterstützen können."
            : "Die Lernzeit ist aus den Abständen zwischen gerechneten Aufgaben geschätzt. Der Lernstand stammt aus Einstufung, Einheitentests und Wiederholungen."}
        </p>
      </div>

      <div className="flex flex-wrap nichtdrucken" style={{ gap: 10 }}>
        <button onClick={teilen}
          style={{ height: 46, padding: "0 22px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Bericht teilen
        </button>
        <button onClick={() => window.print()}
          style={{ height: 46, padding: "0 22px", background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
          Als PDF sichern
        </button>
      </div>
      {geteilt && (
        <p style={{ fontSize: 12.5, color: geteilt === "fehler" ? C.signal : C.hellgrau, marginTop: 10 }}>
          {geteilt === "kopiert" ? "Der Bericht liegt in der Zwischenablage — einfach in eine Nachricht einfügen." : geteilt === "geteilt" ? "Geteilt." : "Teilen ist hier nicht möglich."}
        </p>
      )}
    </div>
  );
}

/* ======================================================================
   PHASE E · WIRKSAMKEIT MESSEN
   Vorher-Nachher je Kompetenz · Experiment zwischen Erklärformen ·
   anonymer Export · Auswertung über viele Schüler
   ====================================================================== */

/* ---------- Messungen ---------- */

/* Drei Zeitpunkte je Kompetenz:
   vor    — Vortest, bevor die Einheit beginnt
   nach   — der erste Einheitentest
   halten — jede spätere Wiederholung, mit Abstand in Tagen             */

export function messungSetzen(id, fn) {
  if (!LERN.profil) return;
  lernAendern((L) => {
    L.messungen = L.messungen || {};
    L.messungen[id] = fn({ ...(L.messungen[id] || {}) });
  });
}

export function variantenVorschlag(id) {
  if (!EINHEITEN[id]?.einstieg) return null;
  return LERN.experimente?.[id] || (Math.random() < 0.5 ? "A" : "B");
}

export function variantenFestschreiben(id, v) {
  if (!v || LERN.experimente?.[id] || !LERN.profil) return;
  lernAendern((L) => { L.experimente = { ...(L.experimente || {}), [id]: v }; });
}

export function pseudonymSichern() {
  if (LERN.pseudonym || !LERN.profil) return;
  const p = "MS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  lernAendern((X) => { X.pseudonym = p; });
}

export function messExport(L) {
  const summe = Object.values(L.aktivitaet || {}).reduce((s, t) => ({
    tage: s.tage + (istLerntag(t) ? 1 : 0), sekunden: s.sekunden + t.sekunden, aufgaben: s.aufgaben + t.aufgaben, richtig: s.richtig + t.richtig,
  }), { tage: 0, sekunden: 0, aufgaben: 0, richtig: 0 });
  return {
    format: "matheskript-messung", version: 1,
    pseudonym: pseudonymVon(L), klasse: L.profil?.klasse || null, ziel: L.profil?.ziel || null,
    seit: L.profil?.seit || null, erstellt: Date.now(),
    messungen: L.messungen || {}, experimente: L.experimente || {}, noten: L.noten || [],
    aktivitaet: summe,
    stand: Object.fromEntries(Object.entries(L.stand || {}).map(([k, v]) => [k, v.status || null])),
  };
}

/* ---------- Statistik ---------- */


export function betaKF(a, b, x) {
  let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d; let h = d;
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d;
    const del = d * c; h *= del; if (Math.abs(del - 1) < 3e-12) break;
  }
  return h;
}

export function lnGamma(z) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let x = z, y = z, t = x + 5.5; t -= (x + 0.5) * Math.log(t); let s = 1.000000000190015;
  for (const c of g) s += c / ++y;
  return -t + Math.log((2.5066282746310005 * s) / x);
}

export function betaReg(a, b, x) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betaKF(a, b, x)) / a : 1 - (bt * betaKF(b, a, 1 - x)) / b;
}
/* Zweiseitiger p-Wert eines t-Werts. */

export function tQuantil(df) {
  let lo = 0, hi = 50;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (pZweiseitig(m, df) > 0.05) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

export function intervall(a) {
  if (a.length < 2) return null;
  const m = mittel(a), h = (tQuantil(a.length - 1) * streuung(a)) / Math.sqrt(a.length);
  return [m - h, m + h];
}
/* Welch-Test: Unterscheiden sich zwei Gruppen im Mittel? */

export function welch(a, b) {
  if (a.length < 2 || b.length < 2) return null;
  const va = streuung(a) ** 2 / a.length, vb = streuung(b) ** 2 / b.length;
  if (va + vb === 0) return { t: 0, df: a.length + b.length - 2, p: 1, d: 0 };
  const t = (mittel(a) - mittel(b)) / Math.sqrt(va + vb);
  const df = (va + vb) ** 2 / (va ** 2 / (a.length - 1) + vb ** 2 / (b.length - 1));
  const sp = Math.sqrt(((a.length - 1) * streuung(a) ** 2 + (b.length - 1) * streuung(b) ** 2) / (a.length + b.length - 2));
  return { t, df, p: pZweiseitig(Math.abs(t), df), d: sp > 0 ? (mittel(a) - mittel(b)) / sp : 0 };
}

/* Gepaarter Test: Jeder Schüler bekommt beide Varianten bei verschiedenen
   Kompetenzen. Verglichen wird deshalb innerhalb derselben Person — das
   schaltet den Unterschied zwischen starken und schwachen Schülern aus. */

export function gepaart(differenzen) {
  const n = differenzen.length;
  if (n < 3) return null;
  const m = mittel(differenzen), sd = streuung(differenzen);
  if (!(sd > 0)) return { t: 0, df: n - 1, p: m === 0 ? 1 : 0, d: 0, n, m };
  const t = m / (sd / Math.sqrt(n));
  return { t, df: n - 1, p: pZweiseitig(Math.abs(t), n - 1), d: m / sd, n, m };
}

/* Normalisierter Lernzuwachs nach Hake: Welcher Anteil des möglichen
   Zuwachses wurde erreicht? Wer vorher schon alles konnte, zählt nicht. */

export function zuwachs(m) {
  if (!m?.vor || !m?.nach) return null;
  const vor = m.vor.ok / m.vor.n, nach = m.nach.ok / m.nach.n;
  if (vor >= 1) return null;
  return (nach - vor) / (1 - vor);
}


export function auswerten(exporte) {
  const reihen = [];
  exporte.forEach((ex) => Object.entries(ex.messungen || {}).forEach(([id, m]) => {
    const spaet = (m.halten || []).filter((h) => h.abstand >= 7);
    reihen.push({
      person: ex.pseudonym, id, variante: ex.experimente?.[id] || null,
      vor: m.vor ? m.vor.ok / m.vor.n : null, nach: m.nach ? m.nach.ok / m.nach.n : null, g: zuwachs(m),
      halten: spaet.length ? spaet.filter((h) => h.ok).length / spaet.length : null,
    });
  }));
  const werte = (f) => reihen.map(f).filter((x) => x !== null && isFinite(x));
  const nachVariante = (v, f) => reihen.filter((r) => r.variante === v).map(f).filter((x) => x !== null && isFinite(x));
  const proKomp = {};
  reihen.forEach((r) => { (proKomp[r.id] = proKomp[r.id] || []).push(r); });
  const noten = exporte.map((ex) => {
    const n = [...(ex.noten || [])].sort((a, b) => a.datum.localeCompare(b.datum));
    return n.length >= 2 ? { person: ex.pseudonym, delta: n[n.length - 1].np - n[0].np, stunden: (ex.aktivitaet?.sekunden || 0) / 3600 } : null;
  }).filter(Boolean);
  const paare = exporte.map((ex) => {
    const eigene = reihen.filter((r) => r.person === ex.pseudonym && r.g !== null);
    const ga = eigene.filter((r) => r.variante === "A").map((r) => r.g), gb = eigene.filter((r) => r.variante === "B").map((r) => r.g);
    return ga.length && gb.length ? mittel(ga) - mittel(gb) : null;
  }).filter((x) => x !== null);
  return {
    personen: exporte.length, reihen, paare,
    vor: werte((r) => r.vor), nach: werte((r) => r.nach), g: werte((r) => r.g), halten: werte((r) => r.halten),
    A: { g: nachVariante("A", (r) => r.g), halten: nachVariante("A", (r) => r.halten) },
    B: { g: nachVariante("B", (r) => r.g), halten: nachVariante("B", (r) => r.halten) },
    proKomp, noten,
  };
}


export function Messbericht({ gehe }) {
  const L = useLern();
  const [datum, setDatum] = useState(tagSchluessel());
  const [np, setNp] = useState("");
  const [art, setArt] = useState("Klassenarbeit");
  const [meldung, setMeldung] = useState(null);
  React.useEffect(() => { pseudonymSichern(); }, [L.profil]);

  if (!L.profil) return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7 }}>Messungen entstehen, sobald ein Profil angelegt ist und Einheiten bearbeitet werden.</p>
    </div>
  );

  const eigene = auswerten([messExport(L)]);
  const zeilen = Object.entries(L.messungen || {}).filter(([id]) => KOMP[id]);
  const karte = { background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 14 };

  const noteSpeichern = () => {
    const wert = parseInt(np, 10);
    if (!(wert >= 0 && wert <= 15)) { setMeldung("Notenpunkte zwischen 0 und 15 eintragen."); return; }
    lernAendern((X) => { X.noten = [...(X.noten || []), { datum, np: wert, art }].sort((a, b) => a.datum.localeCompare(b.datum)); });
    setNp(""); setMeldung(null);
  };

  const exportieren = async () => {
    const text = JSON.stringify(messExport(L));
    try {
      const blob = new Blob([text], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = `matheskript-messung-${pseudonymVon(L)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setMeldung("Die Messdatei wurde erzeugt. Sie enthält keinen Namen, nur dein Pseudonym.");
    } catch (e) {
      try { await navigator.clipboard.writeText(text); setMeldung("Die Messdaten liegen in der Zwischenablage."); }
      catch (e2) { setMeldung("Export hier nicht möglich — in der Web-Fassung funktioniert er."); }
    }
  };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 18 }}>
        Vor jeder Einheit zwei kurze Aufgaben, danach der Test, später die Wiederholungen. Daraus wird sichtbar,
        was eine Einheit wirklich gebracht hat — und ob es nach Wochen noch da ist.
      </p>

      <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 18, padding: 22, marginBottom: 14 }}>
        <p style={{ fontSize: 12, letterSpacing: "1.4px", color: C.gruen, fontWeight: 600, marginBottom: 12 }}>DEIN LERNZUWACHS</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[["vorher", mittel(eigene.vor)], ["nach der Einheit", mittel(eigene.nach)], ["nach Wochen", mittel(eigene.halten)]].map(([n, v]) => (
            <div key={n}>
              <p style={{ fontSize: 26, fontWeight: 700, color: C.weiss, letterSpacing: "-0.02em" }}>{pz(v)}</p>
              <p style={{ fontSize: 12, color: "#C9D6EE" }}>{n}</p>
            </div>
          ))}
        </div>
        {eigene.g.length > 0 && (
          <p style={{ fontSize: 14, color: C.weiss, fontWeight: 300, lineHeight: 1.7, marginTop: 14 }}>
            Im Schnitt hast du {pz(mittel(eigene.g))} dessen dazugewonnen, was dir vor einer Einheit noch gefehlt hat.
          </p>
        )}
      </div>

      <div style={karte}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Nach Kompetenzen</p>
        {zeilen.length === 0 ? (
          <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>Noch keine Messung. Starte eine Lerneinheit auf der Lernlandkarte.</p>
        ) : zeilen.map(([id, m]) => {
          const spaet = (m.halten || []).filter((h) => h.abstand >= 7);
          return (
            <div key={id} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${C.linie}` }}>
              <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{KOMP[id].titel}</p>
              <p style={{ fontSize: 12.5, color: C.grau }}>
                vorher {m.vor ? `${m.vor.ok}/${m.vor.n}` : "—"} · Test {m.nach ? `${m.nach.ok}/${m.nach.n}` : "—"}
                {spaet.length ? ` · nach Wochen ${spaet.filter((h) => h.ok).length}/${spaet.length}` : ""}
                {zuwachs(m) !== null ? ` · Zuwachs ${pz(zuwachs(m))}` : ""}
              </p>
            </div>
          );
        })}
      </div>

      <div style={karte}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Noten aus der Schule</p>
        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.65, marginBottom: 14 }}>
          Der härteste Maßstab ist nicht die App, sondern die Klassenarbeit. Trag deine Ergebnisse ein — dann lässt sich
          prüfen, ob sich das Lernen hier auch dort zeigt.
        </p>
        {(L.noten || []).map((n, i) => (
          <div key={i} className="flex justify-between" style={{ fontSize: 13.5, marginBottom: 6 }}>
            <span style={{ color: C.grau }}>{n.datum.split("-").reverse().join(".")} · {n.art}</span>
            <span style={{ fontWeight: 600 }}>{n.np} NP</span>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.8fr", gap: 8, marginTop: 10 }}>
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)}
            style={{ padding: "9px 10px", fontSize: 14, fontFamily: "inherit", border: `1px solid ${C.linie}`, borderRadius: 10 }} />
          <input value={np} onChange={(e) => setNp(e.target.value)} placeholder="Punkte 0–15" inputMode="numeric"
            style={{ padding: "9px 10px", fontSize: 14, fontFamily: "inherit", border: `1px solid ${C.linie}`, borderRadius: 10 }} />
        </div>
        <div className="flex flex-wrap" style={{ gap: 6, marginTop: 8 }}>
          {["Klassenarbeit", "Klausur", "Test"].map((x) => (
            <button key={x} onClick={() => setArt(x)} className="px-3 py-1"
              style={{ borderRadius: 999, border: `1px solid ${art === x ? C.see : C.linie}`, background: art === x ? C.see : C.weiss,
                color: art === x ? C.weiss : C.grau, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer" }}>{x}</button>
          ))}
          <button onClick={noteSpeichern}
            style={{ marginLeft: "auto", height: 34, padding: "0 16px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999,
              fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Eintragen</button>
        </div>
      </div>

      <div style={karte}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>An einer Studie teilnehmen</p>
        <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: 14 }}>
          Deine Messdaten helfen zu prüfen, ob Matheskript besser wirkt als Unterricht allein. Der Export enthält
          keinen Namen, nur das Pseudonym <b style={{ color: C.tinte }}>{pseudonymVon(L)}</b>, deine Klasse und die Messwerte.
          Geteilt wird nur, was du selbst weitergibst.
        </p>
        <button onClick={exportieren}
          style={{ height: 44, padding: "0 20px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Messdaten exportieren
        </button>
        {meldung && <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, marginTop: 10, lineHeight: 1.6 }}>{meldung}</p>}
      </div>
    </div>
  );
}

/* ---------- Auswertung über viele Schüler ---------- */

FR.messungSetzen = messungSetzen;
FR.betaReg = betaReg;
