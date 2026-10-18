import React, { useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { EinmaleinsSchachbrett, KopfKacheln, PotenzSpalten } from "./func14.jsx";
import { ALLE_ITEMS, ITEMS, ITEM_INFO, MODULE, STUFEN, baueRunde, empfehlung, fehlerName, gesamtUebersicht, itemText, modulUebersicht, musterAufgabe, schwacheGrundlagen, status, stufenStand } from "./headNumbers.js";
import { L, karte, NAVY, FEHLER_TIPP, useKopf, modulInfo, stufeInfo, RICHTUNG_NAME, Kicker, H2, Absatz, Zurueck, Knopf, StandBalken, Legende } from "./funcHeadNumbersBasis.jsx";
import { Aufklapp, ModusLeiste } from "./ui3.jsx";
import { KopfEntdecken, KopfRechnen } from "./funcKopfModi.jsx";
import { Runde } from "./funcHeadNumbersRunde.jsx";
import { Memory, Zuordnung } from "./funcHeadNumbersSpiele.jsx";
import { MusterCheck, Verstehen } from "./funcHeadNumbersVerstehen.jsx";

/* ======================================================================
   HEAD & NUMBERS
   Kopfrechnen als eigene Grundfertigkeit: Einmaleins bis 100, Quadratzahlen
   bis 625, Kubikzahlen bis 1000 und ein gemischtes Training.

   Aufbau der Seite
     Start      Einleitung, die vier Bereiche mit Lernstand, heute Fälliges
     Bereich    Lernstand, Lernpfad in sechs Stufen, Blockauswahl,
                Spiele, offene Herausforderungen, Nachschlagen
     Runde      adaptive Aufgabenrunde (Zahlenfeld, Auswahl, Tipps)
     Spiele     Zuordnung und Zahlenmemory
     Verstehen  Muster und Zusammenhänge zum Entdecken

   Die Mathematik und der Lernstand stehen in headNumbers.js (getestet).
   Der Lernstand liegt im vorhandenen Lernstand unter training.kopf und wird
   mit dem vorhandenen Speicher (func6: lernAendern) gesichert. Übungen
   fließen zusätzlich über merken() in Protokoll, Fortschritt und Aktivität ein.
   Alle Texte sind zweisprachig: L(deutsch, englisch).
   ====================================================================== */

/* ======================================================================
   BEREICH – Übersicht eines Moduls
   ====================================================================== */
function Stufenzeile({ stufe, stand, empfohlen, onStart, modul }) {
  const s = stufeInfo(stufe);
  const st = stand[stufe] || { offen: true };
  const offen = st.offen;
  let hinweis = null;
  if (!offen && stufe === "schnell") hinweis = L(`Wird frei, sobald etwa die Hälfte der freigeschalteten Aufgaben im Aufbau ist (noch ${st.fehlt}).`, `Unlocks once about half of the open problems are in progress (${st.fehlt} to go).`);
  if (!offen && stufe === "challenge") hinweis = L("Wird frei, sobald rund 70 % im Aufbau und ein Drittel sicher ist.", "Unlocks once about 70 % are in progress and a third is secure.");
  if (!offen && stufe === "wiederholen") hinweis = L("Gerade ist nichts zu wiederholen.", "Nothing to review right now.");
  if (offen && stufe === "wiederholen" && st.anzahl) hinweis = L(`${st.anzahl} Aufgabe${st.anzahl === 1 ? "" : "n"} unsicher oder fällig.`, `${st.anzahl} problem${st.anzahl === 1 ? "" : "s"} shaky or due.`);
  return (
    <button type="button" disabled={!offen} onClick={onStart} aria-label={`${s.nr}. ${s.name}`}
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 8, borderRadius: 16, fontFamily: "inherit",
        cursor: offen ? "pointer" : "default", background: offen ? C.weiss : "#F1F4F9", border: `2px solid ${empfohlen && offen ? C.flaggold : C.linie}`, opacity: offen ? 1 : 0.8 }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800,
        background: offen ? `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` : "#D5DBE8", color: offen ? C.flaggold : "#fff" }}>{offen ? s.nr : "🔒"}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15.5, fontWeight: 700, color: C.tinte }}>{s.name}</span>
          {empfohlen && offen && <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", background: C.flaggold, color: NAVY, borderRadius: 999, padding: "2px 8px" }}>{L("Nächster Schritt", "Next step")}</span>}
        </span>
        <span style={{ display: "block", fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.4, marginTop: 2 }}>{hinweis || s.text}</span>
      </span>
    </button>
  );
}

function BereichSeite({ modul, onZurueck, onStart, gehe }) {
  const K = useKopf();
  const info = modulInfo(modul);
  const gemischt = modul === "gemischt";
  const jetzt = Date.now();
  const u = gemischt ? null : modulUebersicht(K, modul, jetzt);
  const g = gesamtUebersicht(K, jetzt);
  const stand = stufenStand(K, modul, jetzt);
  const rec = empfehlung(K, modul, jetzt);
  const stufen = gemischt ? ["selbst", "schnell", "wiederholen", "challenge"] : STUFEN;
  const [auswahl, setAuswahl] = useState(null);       // null = alle freigeschalteten Blöcke
  const [referenz, setReferenz] = useState(false);
  const zaehler = gemischt ? g.module.reduce((z, m) => { for (const s of Object.keys(m.zaehler)) z[s] = (z[s] || 0) + m.zaehler[s]; return z; }, {}) : u.zaehler;
  const gesamt = gemischt ? g.gesamt : u.gesamt;
  const sicher = (zaehler.sicher || 0) + (zaehler.automatisiert || 0);
  const faellig = gemischt ? g.faellig : u.faellig;
  const unsicherListe = gemischt ? ALLE_ITEMS.filter((k) => status(K.items[k]) === "unsicher") : u.unsicher;
  const bloeckeFuerRunde = !gemischt && auswahl && auswahl.length ? [...auswahl].sort((a, b) => a - b) : null;
  const start = (art, extra = {}) => onStart({ art, modul, bloecke: bloeckeFuerRunde, ...extra });
  const hn = L("Kopfrechnen", "Mental Math");

  return (
    <div>
      <Zurueck onClick={onZurueck}>{hn}</Zurueck>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 16, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, fontWeight: 800 }}>{info.zeichen}</span>
        <div><H2 style={{ marginBottom: 2, fontSize: 23 }}>{info.titel}</H2><p style={{ fontSize: 14, color: C.grau, fontWeight: 300 }}>{info.kurz}</p></div>
      </div>

      <section style={{ ...karte, padding: 18, marginBottom: 14 }}>
        <p style={{ fontSize: 14, color: C.grau, marginBottom: 8 }}><b style={{ color: C.tinte, fontSize: 22 }}>{sicher}</b> {L(`von ${gesamt} ${info.einheit} sicher abrufbar (beide Richtungen einzeln gezählt)`, `of ${gesamt} ${info.einheit} securely recalled (both directions counted separately)`)}</p>
        <StandBalken zaehler={zaehler} gesamt={gesamt} />
        <Legende zaehler={zaehler} />
        {faellig > 0 && <p style={{ fontSize: 13.5, color: C.tinte, marginTop: 12 }}><b>{faellig}</b> {L(faellig === 1 ? "Aufgabe ist zum Wiederholen fällig." : "Aufgaben sind zum Wiederholen fällig.", faellig === 1 ? "problem is due for review." : "problems are due for review.")}</p>}
        <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 10, lineHeight: 1.5 }}>{L("„Sicher“ heißt: mehrfach richtig abgerufen, verteilt auf mindestens zwei Tage. Einmal richtig reicht nicht – und langsam ist nicht schlechter, nur noch nicht automatisiert.", "“Secure” means recalled correctly several times across at least two days. Once is not enough – and slower is not worse, just not yet automatic.")}</p>
      </section>

      {gemischt && (
        <section style={{ ...karte, padding: 18, marginBottom: 14 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 10 }}>{L("Die drei Bereiche im Mix", "The three areas in the mix")}</p>
          {g.module.map((m) => (
            <div key={m.modul} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{modulInfo(m.modul).gruppe}</span><span style={{ color: C.grau }}>{m.sicher}/{m.gesamt}</span></div>
              <StandBalken zaehler={m.zaehler} gesamt={m.gesamt} hoehe={7} />
            </div>
          ))}
        </section>
      )}

      <Kicker>{L("Dein Lernpfad", "Your learning path")}</Kicker>
      <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.55, marginBottom: 10 }}>{L("Die Reihenfolge ist ein Vorschlag, keine Pflicht. Tempo-Stufen schalten sich frei, wenn die Grundlage da ist.", "The order is a suggestion, not a rule. Speed levels unlock once the foundation is there.")}</p>
      {stufen.map((s) => (
        <Stufenzeile key={s} stufe={s} stand={stand} empfohlen={rec === s} modul={modul}
          onStart={() => (s === "verstehen" ? onStart({ art: "verstehen", modul }) : start("runde", { stufe: s }))} />
      ))}

      {!gemischt && (
        <>
          <Kicker>{L("Bereiche zum Üben", "Areas to practise")}</Kicker>
          <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.55, marginBottom: 10 }}>{L("Zu Beginn sind die leichteren Pakete offen; die nächsten öffnen sich mit dem Fortschritt. Du kannst auch gezielt auswählen.", "At first the easier sets are open; the next ones open as you progress. You can also choose directly.")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {u.bloecke.map((b) => {
              const an = auswahl ? auswahl.includes(b.index) : b.offen;
              const gut = b.zaehler.aufbau + b.zaehler.sicher + b.zaehler.automatisiert;
              return (
                <button key={b.id} type="button" aria-pressed={an} onClick={() => { const aktuell = auswahl || u.offen; setAuswahl(aktuell.includes(b.index) ? (aktuell.length > 1 ? aktuell.filter((x) => x !== b.index) : aktuell) : [...aktuell, b.index]); }}
                  style={{ minHeight: 56, padding: "8px 14px", borderRadius: 14, fontFamily: "inherit", textAlign: "left", cursor: "pointer", border: `2px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss, color: C.tinte }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{!b.offen && !an ? "🔒 " : ""}{L(b.de, b.en)}</span>
                  <span style={{ display: "block", fontSize: 12, color: C.grau }}>{gut}/{b.gesamt} {L("im Aufbau oder besser", "building or better")}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <Kicker>{L("Spielen", "Play")}</Kicker>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 18 }}>
        <Knopf haupt={false} onClick={() => start("zuordnung")}>{L("Zuordnungsspiel", "Matching game")}</Knopf>
        <Knopf haupt={false} onClick={() => start("memory")}>{L("Zahlenmemory", "Number memory")}</Knopf>
      </div>

      <Kicker>{L("Offene Herausforderungen", "Open challenges")}</Kicker>
      <section style={{ ...karte, padding: 18, marginBottom: 18 }}>
        {unsicherListe.length === 0 && faellig === 0 ? (
          <p style={{ fontSize: 14.5, color: C.grau, lineHeight: 1.6 }}>{L("Gerade ist nichts unsicher oder fällig. Neue Aufgaben findest du in den Stufen oben.", "Nothing is shaky or due right now. Find new problems in the levels above.")}</p>
        ) : (
          <>
            {unsicherListe.length > 0 && (
              <>
                <p style={{ fontSize: 14, color: C.tinte, marginBottom: 8 }}>{L("Noch unsicher:", "Still shaky:")}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {unsicherListe.slice(0, 18).map((k) => (
                    <span key={k} title={RICHTUNG_NAME(ITEM_INFO.get(k).richtung)} style={{ background: "#FBEFEA", color: C.signal, borderRadius: 999, padding: "5px 12px", fontSize: 14, fontWeight: 700 }}>{itemText(k)}</span>
                  ))}
                  {unsicherListe.length > 18 && <span style={{ fontSize: 13, color: C.grau, alignSelf: "center" }}>+{unsicherListe.length - 18}</span>}
                </div>
              </>
            )}
            <Knopf onClick={() => start("runde", { stufe: "wiederholen" })} style={{ width: "100%" }}>{L("Gezielt wiederholen", "Review now")}</Knopf>
          </>
        )}
      </section>

      {!gemischt && (
        <>
          <button type="button" aria-expanded={referenz} onClick={() => setReferenz(!referenz)}
            style={{ width: "100%", minHeight: 48, textAlign: "left", padding: "10px 16px", borderRadius: 14, border: `1.5px solid ${C.linie}`, background: C.weiss, fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: C.see, cursor: "pointer", marginBottom: 10 }}>
            {referenz ? "− " : "+ "}{L("Nachschlagen: alle Zahlen", "Look up: all numbers")}
          </button>
          {referenz && (
            <div style={{ marginBottom: 14 }}>
              {modul === "einmaleins" && <EinmaleinsSchachbrett />}
              {modul === "quadrate" && <PotenzSpalten hoch={2} bloecke={[[1, 10], [11, 20], [21, 25]]} />}
              {modul === "kubik" && <PotenzSpalten hoch={3} bloecke={[[1, 10]]} />}
            </div>
          )}
          <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, marginTop: 6 }}>
            {L("Weitere Rechentrainer dazu – zum Beispiel Mal bis vierstellig oder Wurzeln bis 10 000 – findest du im ", "More arithmetic trainers for this – for example multiplication up to four digits or roots up to 10 000 – are in ")}
            <button type="button" onClick={() => gehe({ ansicht: "kopf", trainer: modul === "einmaleins" ? "multiplizieren" : "potenzen" })} style={{ background: "none", border: "none", padding: 0, color: C.see, fontWeight: 700, fontFamily: "inherit", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>{L("Kopfrechnen-Bereich", "mental arithmetic section")}</button>.
          </p>
        </>
      )}
    </div>
  );
}

/* ======================================================================
   START
   ====================================================================== */
function StartSeite({ onWaehle, onStart, gehe }) {
  const K = useKopf();
  const jetzt = Date.now();
  const g = gesamtUebersicht(K, jetzt);
  const hinweis = schwacheGrundlagen(K);
  const [modus, setModus] = useState("training");
  const [thema, setThema] = useState(null);
  const [rechenThema, setRechenThema] = useState("plusminus");
  const faelligGesamt = g.faellig + g.unsicher;
  return (
    <div>
      <section style={{ ...karte, padding: 16, marginBottom: 14 }}>
        <Kicker>{L("Zu diesem Kurs", "About this course")}</Kicker>
        <H2 style={{ fontSize: 20, marginBottom: 8 }}>{L("Kopfrechnen: eine Grundlage, die einfach sitzen sollte", "Mental arithmetic: a foundation that should simply be there")}</H2>
        <Aufklapp titel={L("Warum Kopfrechnen?", "Why mental arithmetic?")}>
        <Absatz>{L("Kopfrechnen ist eine wichtige Grundlage in der Mathematik. Es sollte einfach verfügbar und gut trainiert sein, damit es dir keine Schwierigkeiten macht, wenn es in einer Aufgabe darauf ankommt.", "Mental arithmetic is an important foundation in mathematics. It should be readily available and well practised, so that it causes you no trouble when it matters in a problem.")}</Absatz>
        <Absatz>{L("Gleichzeitig ist es eine ganz eigene Aufgabe – sehr getrennt von den wirklichen Fähigkeiten in der Mathematik, mit denen es häufig verwechselt wird. Wir wollen es deshalb als zusätzliche Fähigkeit beherrschen.", "At the same time it is a task of its own – very separate from the real skills in mathematics, with which it is often confused. So we want to master it as an additional skill.")}</Absatz>
        <div style={{ background: "#FFF8DC", borderLeft: `4px solid ${C.flaggold}`, borderRadius: "4px 14px 14px 4px", padding: "14px 16px", marginBottom: 14 }}>
          <p style={{ fontSize: 15, color: C.tinte, lineHeight: 1.75, fontWeight: 400 }}>{L("Stell dir einen Koch vor: Er sollte auch seine Küche sauber halten können. Das hat mit Kochen direkt nichts zu tun – und ist trotzdem eine wichtige Fähigkeit, um eine Küche sauber führen zu können.", "Picture a cook: they should also be able to keep their kitchen clean. That has nothing directly to do with cooking – and yet it is an important skill for running a kitchen cleanly.")}</p>
        </div>
        <Absatz style={{ marginBottom: 0 }}>{L("Genau dafür ist Kopfrechnen da: Einmaleins, Quadratzahlen und Kubikzahlen einmal sauber trainieren – spielerisch, mit Verständnis und ohne Zeitdruck.", "That is exactly what Mental Math is for: practise the times tables, square numbers and cube numbers properly once – playfully, with understanding and without time pressure.")}</Absatz>
        </Aufklapp>
      </section>

      <ModusLeiste label={L("Kopfrechnen", "Mental arithmetic")} modi={[["entdecken", L("Entdecken", "Explore")], ["rechnen", L("Rechnen", "Calculate")], ["training", L("Training", "Training")]]} modus={modus} setModus={(m) => { setModus(m); try { window.scrollTo(0, 0); } catch (e) { /* egal */ } }} />
      <div style={{ height: 16 }} />

      {modus === "entdecken" && <KopfEntdecken thema={thema} setThema={setThema} onRechnen={(id) => { setRechenThema(id); setModus("rechnen"); }} onTraining={(id) => gehe && gehe({ ansicht: "kopf", trainer: id })} />}
      {modus === "rechnen" && <KopfRechnen key={rechenThema} thema={rechenThema} setThema={setRechenThema} />}
      {modus === "training" && (
        <>
      <section data-kopf-trainer style={{ marginBottom: 18 }}>
        <KopfKacheln onWaehle={(id) => gehe && gehe({ ansicht: "kopf", trainer: id })} />
      </section>

      {faelligGesamt > 0 && (
        <section style={{ ...karte, padding: 18, marginBottom: 18, border: `2px solid ${C.flaggold}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>{L("Heute zum Wiederholen", "For review today")}</p>
          <p style={{ fontSize: 14, color: C.grau, marginBottom: 12 }}>{L(`${faelligGesamt} Zahlenbeziehung${faelligGesamt === 1 ? " ist" : "en sind"} unsicher oder fällig – quer durch alle Bereiche.`, `${faelligGesamt} number fact${faelligGesamt === 1 ? " is" : "s are"} shaky or due – across all areas.`)}</p>
          <Knopf onClick={() => onStart({ art: "runde", modul: "gemischt", stufe: "wiederholen", bloecke: null })} style={{ width: "100%" }}>{L("Gemischt wiederholen", "Review mixed")}</Knopf>
        </section>
      )}

      <Kicker>{L("Wähle deinen Bereich", "Choose your area")}</Kicker>
      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        {[...MODULE, "gemischt"].map((m) => {
          const info = modulInfo(m);
          const z = m === "gemischt" ? g.module.reduce((acc, x) => { for (const s of Object.keys(x.zaehler)) acc[s] = (acc[s] || 0) + x.zaehler[s]; return acc; }, {}) : modulUebersicht(K, m, jetzt).zaehler;
          const gesamt = m === "gemischt" ? g.gesamt : ITEMS[m].length;
          const sicher = (z.sicher || 0) + (z.automatisiert || 0);
          const f = m === "gemischt" ? g.faellig : modulUebersicht(K, m, jetzt).faellig;
          return (
            <button key={m} type="button" onClick={() => onWaehle(m)} aria-label={info.titel}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, textAlign: "left", fontFamily: "inherit", cursor: "pointer", color: C.tinte, ...karte, border: `1px solid ${C.linie}` }}>
              <span aria-hidden="true" style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 15, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: m === "gemischt" ? 18 : 21, fontWeight: 800 }}>{info.zeichen}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "clamp(15px, 4.4vw, 17.5px)", fontWeight: 700, lineHeight: 1.25, marginBottom: 2 }}>{info.titel}</span>
                <span style={{ display: "block", fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.4, marginBottom: 8 }}>{info.kurz}</span>
                <StandBalken zaehler={z} gesamt={gesamt} hoehe={7} />
                <span style={{ display: "block", fontSize: 12, color: C.grau, marginTop: 6 }}>{sicher}/{gesamt} {L("sicher", "secure")}{f > 0 ? ` · ${f} ${L("fällig", "due")}` : ""}</span>
              </span>
            </button>
          );
        })}
      </div>



      <section style={{ ...karte, padding: 18, marginBottom: 18 }}>
        <Kicker>{L("So lernst du hier", "How you learn here")}</Kicker>
        <ol style={{ margin: 0, paddingLeft: 22, listStyle: "decimal", color: C.tinte, fontSize: 14.5, lineHeight: 1.75 }}>
          {["verstehen", "unterstuetzt", "selbst", "schnell", "wiederholen", "challenge"].map((s) => <li key={s}><b>{stufeInfo(s).name}</b> – <span style={{ color: C.grau, fontWeight: 300 }}>{stufeInfo(s).text}</span></li>)}
        </ol>
        <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, marginTop: 10 }}>{L("Tempo ist nie das einzige Maß: Zuerst zählt, dass etwas stimmt und sicher sitzt. Fehler kosten keine Punkte – sie kommen einfach noch einmal dran.", "Speed is never the only measure: first it matters that something is right and secure. Mistakes cost no points – they simply come back.")}</p>
      </section>

      {(hinweis.genug || hinweis.fehlerarten.length > 0) && (
        <section style={{ ...karte, padding: 18, marginBottom: 18 }}>
          <Kicker>{L("Hinweis zu deinen Grundlagen", "Note on your foundations")}</Kicker>
          {hinweis.genug && (
            <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.6, marginBottom: 8 }}>
              {L("Diese Zahlenbeziehungen waren im Training bisher mehrfach falsch:", "These number facts have been wrong several times in training so far:")}{" "}
              {hinweis.treffer.slice(0, 6).map((t) => `${itemText(t.key)} (${RICHTUNG_NAME(t.richtung)})`).join(", ")}
            </p>
          )}
          {hinweis.fehlerarten.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.6, marginBottom: 6 }}>{L("Wiederkehrende Muster in deinen falschen Antworten:", "Recurring patterns in your wrong answers:")}</p>
              {hinweis.fehlerarten.slice(0, 3).map((f) => (
                <p key={f.art} style={{ fontSize: 14, color: C.tinte, lineHeight: 1.55, marginBottom: 6 }}>
                  <b>{fehlerName(f.art, englisch())}</b> <span style={{ color: C.hellgrau }}>· {f.n}×</span>
                  <span style={{ display: "block", fontSize: 13, color: C.grau }}>{FEHLER_TIPP(f.art)}</span>
                </p>
              ))}
              <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55 }}>{L("Dieselben Muster siehst du auch unter „Woran es hakt“ im Fortschritt.", "You will also see the same patterns under “Woran es hakt” (where it gets stuck) in your progress.")}</p>
            </div>
          )}
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55 }}>{L("Das ist nur ein Hinweis auf deinen Trainingsstand – keine Diagnose, warum eine Aufgabe in einem anderen Thema schiefgeht. Ein Muster beschreibt nur, was in einzelnen Antworten passiert ist.", "This is only a note on your training status – not a diagnosis of why a problem goes wrong in another topic. A pattern only describes what happened in individual answers.")}</p>
        </section>
      )}

      <section style={{ ...karte, padding: 18 }}>
        <Kicker>{L("Zusammen mit Pen & Paper", "Together with Pen & Paper")}</Kicker>
        <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.65, marginBottom: 12 }}>{L("Kopfrechnen trainiert den sicheren Abruf von Zahlen im Kopf. Pen & Paper trainiert die saubere schriftliche Darstellung deiner Lösungswege. Beide ergänzen sich.", "Mental Math trains secure recall of numbers in your head. Pen & Paper trains the clean written presentation of your solution paths. They complement each other.")}</p>
        <Knopf haupt={false} onClick={() => gehe({ ansicht: "penpaperkurs" })}>{L("Zum Pen-&-Paper-Kurs", "To the Pen & Paper course")}</Knopf>
      </section>
        </>
      )}
    </div>
  );
}

/* ======================================================================
   SEITE – Navigation innerhalb von Head & Numbers
   ====================================================================== */
export function HeadNumbersSeite({ gehe, start = null, unten = null }) {
  const K = useKopf();
  const [ansicht, setAnsicht] = useState(start && modulInfo(start) ? { typ: "bereich", modul: start } : { typ: "start" });
  const [zaehler, setZaehler] = useState(0);
  const oben = () => { try { window.scrollTo(0, 0); } catch (e) { /* egal */ } };
  const zu = (a) => { setAnsicht(a); oben(); };
  const bereich = (m) => zu({ typ: "bereich", modul: m });
  const en = englisch();

  const starten = (cfg) => {
    if (cfg.art === "verstehen") return zu({ typ: "verstehen", modul: cfg.modul });
    if (cfg.art === "zuordnung") return zu({ typ: "zuordnung", modul: cfg.modul, bloecke: cfg.bloecke });
    if (cfg.art === "memory") return zu({ typ: "memory", modul: cfg.modul, bloecke: cfg.bloecke });
    if (cfg.art === "muster") {
      return zu({ typ: "runde", modul: cfg.modul, stufe: "verstehen", aufgaben: [1, 2, 3].map(() => musterAufgabe("q-diff", { en })), cfg });
    }
    const aufgaben = baueRunde(K, { modul: cfg.modul, stufe: cfg.stufe, bloecke: cfg.bloecke, en });
    if (!aufgaben.length) return zu({ typ: "leer", modul: cfg.modul, stufe: cfg.stufe });
    setZaehler((z) => z + 1);
    return zu({ typ: "runde", modul: cfg.modul, stufe: cfg.stufe, aufgaben, cfg });
  };

  const wrap = (kinder) => <div className="mx-auto px-4 pb-16" style={{ maxWidth: 620, paddingTop: 18 }}>{kinder}</div>;

  if (ansicht.typ === "start") return <>{wrap(<StartSeite onWaehle={bereich} onStart={starten} gehe={gehe} />)}{unten}</>;
  if (ansicht.typ === "bereich") return wrap(<BereichSeite modul={ansicht.modul} onZurueck={() => zu({ typ: "start" })} onStart={starten} gehe={gehe} />);
  if (ansicht.typ === "verstehen") {
    return wrap(<Verstehen modul={ansicht.modul} onZurueck={() => bereich(ansicht.modul)}
      onUeben={() => starten({ art: "runde", modul: ansicht.modul, stufe: "unterstuetzt", bloecke: null })}
      onMuster={() => starten({ art: "muster", modul: ansicht.modul })} />);
  }
  if (ansicht.typ === "zuordnung") return wrap(<Zuordnung modul={ansicht.modul} bloecke={ansicht.bloecke} onZurueck={() => bereich(ansicht.modul)} />);
  if (ansicht.typ === "memory") return wrap(<Memory modul={ansicht.modul} bloecke={ansicht.bloecke} onZurueck={() => bereich(ansicht.modul)} />);
  if (ansicht.typ === "leer") {
    return wrap(
      <div>
        <Zurueck onClick={() => bereich(ansicht.modul)}>{modulInfo(ansicht.modul).titel}</Zurueck>
        <div style={{ ...karte, padding: 22 }}>
          <H2 style={{ fontSize: 21 }}>{L("Gerade ist nichts zu wiederholen", "Nothing to review right now")}</H2>
          <Absatz>{L("Nichts ist unsicher oder fällig – das ist ein gutes Zeichen. Übe etwas Neues oder spiele eine gemischte Runde.", "Nothing is shaky or due – a good sign. Practise something new or play a mixed round.")}</Absatz>
          <div style={{ display: "grid", gap: 10 }}>
            <Knopf onClick={() => starten({ art: "runde", modul: ansicht.modul, stufe: ansicht.modul === "gemischt" ? "challenge" : "selbst", bloecke: null })}>{L("Eine Runde üben", "Practise a round")}</Knopf>
            <Knopf haupt={false} onClick={() => bereich(ansicht.modul)}>{L("Zurück zur Übersicht", "Back to overview")}</Knopf>
          </div>
        </div>
      </div>,
    );
  }
  /* Runde */
  const { modul, stufe, aufgaben, cfg } = ansicht;
  return wrap(
    <div>
      <Zurueck onClick={() => bereich(modul)}>{modulInfo(modul).titel} · {stufeInfo(stufe).name}</Zurueck>
      <Runde key={`${modul}-${stufe}-${zaehler}-${aufgaben[0] && aufgaben[0].id}`} aufgaben={aufgaben} modul={modul} stufe={stufe}
        onZurueck={() => bereich(modul)}
        nochmalText={stufe === "verstehen" ? L("Zurück zum Verstehen", "Back to understanding") : null}
        onNochmal={() => (stufe === "verstehen" ? zu({ typ: "verstehen", modul }) : starten({ ...cfg, art: "runde" }))} />
    </div>,
  );
}


