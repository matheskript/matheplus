import React, { useState, useRef } from "react";
import { C, KURSE } from "./base1.jsx";
import { AKTIVE, KOMP, LERN, LINIEN, RAM_SPEICHER, STATUS_STIL, STUFE_INDEX, TAG_MS, TIEFE, VARIANTEN, aktiv, alleVoraussetzungen, hatEinheit, komma, statusVon, tagSchluessel, wochentagIdx } from "./base3.jsx";
import { ART_FARBE, ART_TEXT, EINWILLIGUNG_SCHLUESSEL, MIN_WIEDERHOLEN, TERMIN_ARTEN, datumAus, datumKurz, komptrifftKlasse, kursTrifftKlasse, minutenFuer, mittel, pz, tageBis, tageText, traegtSchon } from "./base4.jsx";
import { M, Text } from "./func3.jsx";
import { Einstufung, Profil, antwortPruefen, buchVerweis, einheitVon, lernAendern, useLern } from "./func6.jsx";
import { pruefungsBefund } from "./func7.jsx";
import { aktivitaetMelden, auswerten, gepaart, intervall, messExport, tagVon, welch } from "./func8.jsx";
import { FR } from "./funcRegistry.jsx";

export function Auswertung() {
  const [exporte, setExporte] = useState([]);
  const [text, setText] = useState("");
  const [fehler, setFehler] = useState(null);

  const hinzufuegen = (roh) => {
    const neu = [];
    roh.forEach((r) => {
      try {
        const d = JSON.parse(r);
        (Array.isArray(d) ? d : [d]).forEach((x) => { if (x && x.format === "matheskript-messung") neu.push(x); });
      } catch (e) { /* ungültig */ }
    });
    if (!neu.length) { setFehler("Keine gültigen Messdateien gefunden."); return; }
    setFehler(null);
    setExporte((alt) => {
      const nach = Object.fromEntries(alt.map((x) => [x.pseudonym, x]));
      neu.forEach((x) => { nach[x.pseudonym] = x; });
      return Object.values(nach);
    });
  };

  const dateien = async (liste) => {
    const inhalte = await Promise.all([...liste].map((f) => f.text()));
    hinzufuegen(inhalte);
  };

  const a = auswerten(exporte);
  const paarTest = gepaart(a.paare);
  const vergleich = paarTest || welch(a.A.g, a.B.g);
  const vergleichHalten = welch(a.A.halten, a.B.halten);
  const gi = intervall(a.g);
  const karte = { background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(16,42,67,0.08)", marginBottom: 14 };
  const zeile = (n, v) => (
    <div className="flex justify-between" style={{ marginBottom: 8, gap: 12 }}>
      <span style={{ fontSize: 14, color: C.grau }}>{n}</span><span style={{ fontSize: 14, fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
  const pText = (p) => (p < 0.001 ? "p < 0,001" : `p = ${komma(p, 3)}`);
  const kKorrelation = (() => {
    if (a.noten.length < 3) return null;
    const x = a.noten.map((n) => n.stunden), y = a.noten.map((n) => n.delta);
    const mx = mittel(x), my = mittel(y);
    const kov = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
    const nenner = Math.sqrt(x.reduce((s, xi) => s + (xi - mx) ** 2, 0) * y.reduce((s, yi) => s + (yi - my) ** 2, 0));
    return nenner ? kov / nenner : null;
  })();

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, marginTop: -8 }}>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 18 }}>
        Für Lehrkräfte und für dich als Kursleiter: Hier werden die anonymen Messdateien vieler Schüler
        zusammengeführt. Erst über eine Gruppe lässt sich sagen, ob etwas wirkt.
      </p>

      <div style={karte}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>Messdateien laden</p>
        <input type="file" accept=".json,application/json" multiple onChange={(e) => dateien(e.target.files)}
          style={{ fontSize: 13.5, fontFamily: "inherit", marginBottom: 10, width: "100%" }} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="… oder Inhalte hier einfügen"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 12.5, fontFamily: "ui-monospace, monospace",
            border: `1px solid ${C.linie}`, borderRadius: 10, outline: "none" }} />
        <div className="flex flex-wrap" style={{ gap: 10, marginTop: 10 }}>
          <button onClick={() => { hinzufuegen(text.split(/\n(?=\s*\{)/)); setText(""); }} disabled={!text.trim()}
            style={{ height: 40, padding: "0 18px", background: text.trim() ? C.gruenDunkel : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Einfügen
          </button>
          <button onClick={() => hinzufuegen([JSON.stringify(messExport(LERN))])} disabled={!LERN.profil}
            style={{ height: 40, padding: "0 18px", background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
            Eigene Daten dazunehmen
          </button>
          {exporte.length > 0 && (
            <button onClick={() => setExporte([])}
              style={{ height: 40, padding: "0 18px", background: "transparent", color: C.grau, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
              Leeren
            </button>
          )}
        </div>
        {fehler && <p style={{ fontSize: 13, color: C.signal, marginTop: 8 }}>{fehler}</p>}
        <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 10 }}>{exporte.length} Schüler geladen · {a.reihen.length} Kompetenzmessungen</p>
      </div>

      {a.reihen.length > 0 && (
        <>
          <div style={karte}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Lernzuwachs insgesamt</p>
            {zeile("vorher richtig", `${pz(mittel(a.vor))} · n = ${a.vor.length}`)}
            {zeile("nach der Einheit richtig", `${pz(mittel(a.nach))} · n = ${a.nach.length}`)}
            {zeile("nach mindestens 7 Tagen richtig", `${pz(mittel(a.halten))} · n = ${a.halten.length}`)}
            {zeile("normalisierter Zuwachs", `${pz(mittel(a.g))}${gi ? ` · 95 %: ${pz(gi[0])} bis ${pz(gi[1])}` : ""}`)}
            <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, lineHeight: 1.65, marginTop: 6 }}>
              Der normalisierte Zuwachs misst, welcher Anteil des möglichen Zuwachses erreicht wurde. In der
              Lernforschung gelten Werte ab etwa 30 % als mittlere, ab 70 % als hohe Wirkung.
            </p>
          </div>

          <div style={karte}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 4 }}>Experiment: Reihenfolge der Einheit</p>
            <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, marginBottom: 12 }}>A: {VARIANTEN.A} · B: {VARIANTEN.B}</p>
            {zeile("Zuwachs A", `${pz(mittel(a.A.g))} · n = ${a.A.g.length}`)}
            {zeile("Zuwachs B", `${pz(mittel(a.B.g))} · n = ${a.B.g.length}`)}
            {vergleich ? (
              <>
                {zeile("Unterschied", `${pz(paarTest ? paarTest.m : mittel(a.A.g) - mittel(a.B.g))} · ${pText(vergleich.p)} · d = ${komma(vergleich.d, 2)}`)}
                <p style={{ fontSize: 12, color: C.hellgrau, marginBottom: 6 }}>
                  {paarTest ? `Gepaarter Vergleich innerhalb von ${paarTest.n} Schülern, die beide Varianten hatten.` : "Noch zu wenige Schüler mit beiden Varianten — vorläufig als Gruppenvergleich gerechnet."}
                </p>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, marginTop: 6, color: vergleich.p < 0.05 ? C.see : C.grau }}>
                  {vergleich.p < 0.05
                    ? `Der Unterschied ist statistisch belastbar. ${(paarTest ? paarTest.m : mittel(a.A.g) - mittel(a.B.g)) > 0 ? "Problem zuerst" : "Erklärung zuerst"} wirkt in dieser Gruppe besser.`
                    : "Noch kein belastbarer Unterschied. Das kann heißen, dass es keinen gibt — oder dass die Gruppe zu klein ist."}
                </p>
              </>
            ) : <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.7 }}>Für den Vergleich braucht es in beiden Gruppen mindestens zwei Messungen.</p>}
            {vergleichHalten && zeile("Behalten nach Wochen, A gegen B", `${pz(mittel(a.A.halten))} gegen ${pz(mittel(a.B.halten))} · ${pText(vergleichHalten.p)}`)}
          </div>

          <div style={karte}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Nach Kompetenzen</p>
            {Object.entries(a.proKomp).filter(([id]) => KOMP[id]).map(([id, rs]) => {
              const g = rs.map((r) => r.g).filter((x) => x !== null);
              return zeile(KOMP[id].titel, `${pz(mittel(g))} · n = ${g.length}`);
            })}
          </div>

          <div style={karte}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Außenmaßstab: Schulnoten</p>
            {a.noten.length === 0 ? (
              <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.7 }}>Noch keine Schüler mit mindestens zwei eingetragenen Noten.</p>
            ) : (
              <>
                {zeile("Schüler mit Notenverlauf", a.noten.length)}
                {zeile("mittlere Veränderung", `${mittel(a.noten.map((n) => n.delta)) >= 0 ? "+" : ""}${komma(mittel(a.noten.map((n) => n.delta)), 1)} NP`)}
                {kKorrelation !== null && zeile("Zusammenhang mit Lernzeit", `r = ${komma(kKorrelation, 2)}`)}
                <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, lineHeight: 1.65, marginTop: 6 }}>
                  Ein Zusammenhang ist noch kein Beweis: Wer mehr lernt, ist oft auch sonst motivierter. Belastbar wird
                  es erst mit einer Vergleichsgruppe, die ohne die App lernt.
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ======================================================================
   KLAUSURVORBEREITUNG · TERMIN-STEUERUNG
   Ein Termin mit Datum und Stationen. Die App rechnet rückwärts: erst die
   Lücken darunter, dann die Stationen der Arbeit, dann Wiederholungen,
   zwei bis drei Tage vorher die Probeklausur, am letzten Tag nur noch das,
   was dort danebenging. Der Plan wird bei jedem Öffnen aus dem aktuellen
   Lernstand neu berechnet — dadurch passt er sich täglich von selbst an.
   ====================================================================== */


export function aktiveTermine(L) {
  return (L.termine || []).filter((t) => tageBis(t.datum) >= 1).sort((a, b) => a.datum.localeCompare(b.datum));
}

/* Was muss bis zum Termin passieren? */

export function terminBedarf(L, t) {
  const ziel = t.stationen.filter(aktiv);
  const ordnung = (a, b) => STUFE_INDEX[KOMP[a].stufe] - STUFE_INDEX[KOMP[b].stufe] || (TIEFE[a] || 0) - (TIEFE[b] || 0);

  // Lücken darunter: alles, was schon als Lücke oder in Arbeit gilt, dazu direkte Voraussetzungen, über die nichts bekannt ist.
  const direkt = new Set(ziel.flatMap((id) => KOMP[id].voraus));
  const luecken = new Set();
  ziel.forEach((id) => alleVoraussetzungen(id).forEach((v) => {
    if (!aktiv(v) || ziel.includes(v)) return;
    const st = L.stand[v]?.status;
    if (st === "luecke" || st === "arbeit" || (!st && direkt.has(v))) luecken.add(v);
  }));

  const neu = ziel.filter((id) => L.stand[id]?.status !== "sicher");
  const kuerzlich = Date.now() - 2 * TAG_MS;
  const bruecken = [...new Set(ziel.flatMap((id) => (KOMP[id].rueck || []).map((r) => r.id)))]
    .filter((id) => aktiv(id) && !ziel.includes(id) && !luecken.has(id) && traegtSchon(L, id));
  const wdh = [...ziel.filter((id) => L.stand[id]?.status === "sicher"), ...bruecken]
    .filter((id) => hatEinheit(id) && !((L.stand[id]?.zuletzt || 0) > kuerzlich));

  return {
    ziel,
    posten: [
      ...[...luecken].sort(ordnung).map((id) => ({ id, art: "luecke", min: minutenFuer(id) })),
      ...neu.sort(ordnung).map((id) => ({ id, art: "neu", min: minutenFuer(id) })),
      ...wdh.map((id) => ({ id, art: "wiederholen", min: MIN_WIEDERHOLEN })),
    ],
  };
}

/* Verteilt den Bedarf auf die verfügbaren Tage bis zum Termin. */

export function terminPlan(L, t) {
  const rest = tageBis(t.datum);
  if (rest < 1) return { vorbei: true };
  const planTage = L.plan?.tage?.length ? L.plan.tage : [0, 1, 2, 3, 4, 5, 6];
  const minuten = L.plan?.minuten || 20;

  const tage = [];
  for (let off = 0; off < rest; off++) {
    const d = tagVon(off);
    if (planTage.includes(wochentagIdx(d)) || off === rest - 1) tage.push({ d, off, eintraege: [] });
  }

  const { ziel, posten } = terminBedarf(L, t);
  const probeFertig = !!t.probe?.am;
  const letzter = tage[tage.length - 1];
  const kandidaten = tage.filter((x) => x !== letzter);
  // Probeklausur zwei Tage vorher (bzw. am letzten Lerntag davor), der Stoff kommt vollständig davor.
  const probeTag = probeFertig ? null : kandidaten.filter((x) => x.off <= rest - 2).pop() || null;
  const probeMin = Math.min(45, Math.max(20, ziel.length * 6));

  const inhalt = tage.filter((x) => x !== letzter && x !== probeTag && (!probeTag || x.off < probeTag.off));
  if (!inhalt.length && !probeTag && tage.length === 1) inhalt.push(letzter);

  let i = 0, offen = posten[0]?.min || 0;
  inhalt.forEach((tag) => {
    let budget = minuten;
    while (i < posten.length && budget > 0) {
      const nimm = Math.min(budget, offen);
      tag.eintraege.push({ ...posten[i], min: nimm, teil: nimm < posten[i].min });
      budget -= nimm; offen -= nimm;
      if (offen <= 0) { i++; offen = posten[i]?.min || 0; }
    }
  });
  const nichtGeschafft = posten.slice(i).map((p, k) => (k === 0 ? { ...p, min: offen } : p));
  const fehlend = nichtGeschafft.reduce((s, p) => s + p.min, 0);

  if (probeTag) probeTag.eintraege.push({ art: "probe", min: probeMin });

  const probeFehler = probeFertig ? Object.entries(t.probe.erg || {}).filter(([, e]) => e.some((ok) => !ok)).map(([id]) => id) : [];
  if (letzter && (letzter !== inhalt[0] || !letzter.eintraege.length)) {
    const ids = probeFertig ? probeFehler : ziel;
    letzter.eintraege.push({ art: "nachbereiten", ids, min: Math.min(minuten, Math.max(10, ids.length * 5)), probeFertig });
  }

  const zusatz = inhalt.length ? Math.ceil(fehlend / inhalt.length / 5) * 5 : 0;
  return {
    rest, tage, ziel, minuten, planTage, probeTag, probeMin, fehlend, nichtGeschafft, inhaltTage: inhalt.length,
    empfohlen: Math.min(90, minuten + zusatz),
    sitzen: ziel.filter((id) => L.stand[id]?.status === "sicher").length,
    heute: tage.find((x) => x.off === 0) || null,
    naechster: tage.find((x) => x.off > 0) || null,
  };
}

/* Wiederholungen aus dem Klausurplan für heute — sie laufen über „Wiederholen“. */

export function terminWiederholungenHeute(L) {
  const t = aktiveTermine(L)[0];
  if (!t) return [];
  const p = terminPlan(L, t);
  if (!p.heute) return [];
  return p.heute.eintraege.filter((e) => e.art === "wiederholen").map((e) => ({ id: e.id, termin: t.id }));
}


export function eintragZiel(e) {
  if (e.art === "wiederholen") return { ansicht: "wiederholen" };
  if (hatEinheit(e.id)) return { ansicht: "einheit", kompetenz: e.id };
  return KOMP[e.id]?.ziel || { ansicht: "karte" };
}

/* ---------- Kompakte Karte für „Dein Heute“ ---------- */


export function TerminHinweis({ gehe }) {
  const L = LERN;
  const t = aktiveTermine(L)[0];
  if (!t) return null;
  const p = terminPlan(L, t);
  const heute = p.heute?.eintraege || [];
  const erster = heute[0];
  const titel = erster ? (erster.art === "probe" ? "Probeklausur" : erster.art === "nachbereiten" ? "Nachbereiten" : KOMP[erster.id]?.titel) : null;
  return (
    <div className="auftauchen" style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 18, padding: 20, marginBottom: 14 }}>
      <div className="flex justify-between items-baseline" style={{ gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.weiss }}>{t.art} {tageText(p.rest)}</span>
        <span style={{ fontSize: 12.5, color: "#BBD6EA" }}>{p.sitzen} von {p.ziel.length} sitzen</span>
      </div>
      <p style={{ fontSize: 17, fontWeight: 600, color: C.weiss, lineHeight: 1.4, marginTop: 10 }}>
        {titel ? `Heute: ${titel}` : p.naechster ? `Heute frei. Weiter am ${datumKurz(p.naechster.d)}.` : "Heute frei."}
      </p>
      {heute.length > 1 && <p style={{ fontSize: 13, color: "#BBD6EA", marginTop: 4 }}>und {heute.length - 1} weitere{heute.length > 2 ? "" : "r"} Schritt{heute.length > 2 ? "e" : ""}</p>}
      {p.fehlend > 0 && <p style={{ fontSize: 13, color: C.weiss, marginTop: 8 }}>Die Zeit ist knapp — schau in den Plan.</p>}
      <button onClick={() => gehe({ ansicht: "vorbereiten", termin: t.id })} className="mt-4"
        style={{ height: 42, padding: "0 20px", background: C.weiss, color: C.seeTief, border: "none", borderRadius: 999,
          fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
        Zum Plan
      </button>
    </div>
  );
}

/* ---------- Probeklausur zum Termin ---------- */


export function TerminProbe({ termin, minuten, onFertig, onAbbruch }) {
  const [aufgaben] = useState(() => {
    const liste = [];
    termin.stationen.filter((id) => aktiv(id) && einheitVon(id)?.erzeuger).forEach((id) => {
      for (let k = 0; k < 2; k++) liste.push({ id, a: einheitVon(id).erzeuger() });
    });
    return liste.slice(0, 10);
  });
  const [eingaben, setEingaben] = useState({});
  const [rest, setRest] = useState(minuten * 60);
  const [ergebnis, setErgebnis] = useState(null);

  const abgeben = () => {
    const erg = {};
    const oks = aufgaben.map((x, i) => {
      const ok = antwortPruefen(x.a, eingaben[i]);
      (erg[x.id] = erg[x.id] || []).push(ok);
      return ok;
    });
    Object.entries(erg).forEach(([id, e]) => pruefungsBefund(id, e.every(Boolean)));
    const nOk = oks.filter(Boolean).length;
    if (nOk) aktivitaetMelden({ ok: true, anzahl: nOk });
    if (oks.length - nOk) aktivitaetMelden({ ok: false, anzahl: oks.length - nOk });
    lernAendern((L) => { L.termine = (L.termine || []).map((t) => (t.id === termin.id ? { ...t, probe: { am: Date.now(), erg } } : t)); });
    setErgebnis({ oks, erg });
    window.scrollTo(0, 0);
  };

  React.useEffect(() => {
    if (ergebnis) return;
    if (rest <= 0) { abgeben(); return; }
    const z = setTimeout(() => setRest((r) => r - 1), 1000);
    return () => clearTimeout(z);
  }, [rest, ergebnis]);

  const karte = { background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(16,42,67,0.08)", marginBottom: 14 };
  const knopf = { height: 48, padding: "0 24px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" };

  if (!aufgaben.length) return (
    <div style={karte}>
      <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>Für die gewählten Stationen gibt es noch keine prüfbaren Aufgaben. Nimm dafür den Klausurgenerator unter „Üben“.</p>
      <button onClick={onAbbruch} style={knopf}>Zurück zum Plan</button>
    </div>
  );

  if (ergebnis) {
    const n = ergebnis.oks.filter(Boolean).length;
    const fehler = Object.entries(ergebnis.erg).filter(([, e]) => e.some((ok) => !ok)).map(([id]) => id);
    return (
      <div>
        <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 18, padding: 22, marginBottom: 14 }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: C.weiss }}>{n} von {aufgaben.length} richtig</p>
          <p style={{ fontSize: 14, color: "#BBD6EA", fontWeight: 300, lineHeight: 1.7, marginTop: 8 }}>
            {fehler.length
              ? `Am letzten Tag vor dem Termin arbeitest du nur noch an: ${fehler.map((id) => KOMP[id].titel).join(", ")}.`
              : "Alles hat getragen. Am letzten Tag reicht eine kurze Runde zum Aufwärmen."}
          </p>
        </div>
        <div style={karte}>
          {aufgaben.map((x, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <span style={{ width: 18, color: ergebnis.oks[i] ? C.see : C.signal, flexShrink: 0 }}>{ergebnis.oks[i] ? "✓" : "○"}</span>
              <div style={{ flex: 1 }}>
                <Text s={x.a.frage} style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: C.grau }} />
                {!ergebnis.oks[i] && <p style={{ fontSize: 13.5, color: C.see, lineHeight: 1.9 }}>richtig: <M t={x.a.zeig || x.a.loesung} /></p>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={onFertig} style={knopf}>Zurück zum Plan</button>
      </div>
    );
  }

  const uhr = `${Math.floor(Math.max(rest, 0) / 60)}:${String(Math.max(rest, 0) % 60).padStart(2, "0")}`;
  return (
    <div>
      <div className="flex justify-between items-center" style={{ position: "sticky", top: 56, zIndex: 20, background: C.sand, padding: "10px 0", marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.see }}>Probeklausur · {termin.art}</span>
        <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: rest < 300 ? C.signal : C.tinte }}>{uhr}</span>
      </div>
      <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: 14 }}>
        Wie in der echten Arbeit: auf Papier rechnen, nur das Ergebnis eintragen, keine Rückmeldung bis zur Abgabe.
      </p>
      {aufgaben.map((x, i) => (
        <div key={i} style={karte}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>Aufgabe {i + 1}</p>
          <Text s={x.a.frage} style={{ fontSize: 15.5, lineHeight: 1.8, marginBottom: 10 }} />
          <div className="flex items-center" style={{ gap: 10 }}>
            {x.a.praefix && <span style={{ fontSize: 15, fontWeight: 500, flexShrink: 0 }}><M t={x.a.praefix} /></span>}
            <input value={eingaben[i] || ""} onChange={(e) => setEingaben({ ...eingaben, [i]: e.target.value })}
              style={{ flex: 1, minWidth: 0, padding: "10px 12px", fontSize: 15.5, fontFamily: "inherit", border: `1px solid ${C.linie}`, borderRadius: 11, outline: "none" }} />
          </div>
        </div>
      ))}
      <div className="flex flex-wrap" style={{ gap: 10 }}>
        <button onClick={abgeben} style={knopf}>Abgeben</button>
        <button onClick={onAbbruch} style={{ ...knopf, background: "transparent", color: C.grau, border: `1px solid ${C.linie}`, fontWeight: 400 }}>Abbrechen</button>
      </div>
    </div>
  );
}

/* ---------- Termin anlegen ---------- */


export function TerminFormular({ onFertig, onAbbruch }) {
  const [art, setArt] = useState("Klassenarbeit");
  const morgen = tagSchluessel(tagVon(1));
  const [datum, setDatum] = useState(tagSchluessel(tagVon(14)));
  const [auswahl, setAuswahl] = useState([]);
  const [suche, setSuche] = useState("");

  const q = suche.trim().toLowerCase();
  const passt = (k) => !q || k.titel.toLowerCase().includes(q) || (k.buch || "").toLowerCase().includes(q)
    || buchVerweis(k.buch).join(" ").toLowerCase().includes(q);
  const umschalten = (id) => setAuswahl(auswahl.includes(id) ? auswahl.filter((x) => x !== id) : [...auswahl, id]);
  const gueltig = auswahl.length > 0 && datum >= morgen;

  const speichern = () => {
    const t = { id: "t" + Date.now().toString(36), art, datum, stationen: auswahl, erstellt: Date.now() };
    lernAendern((L) => { L.termine = [...(L.termine || []), t]; });
    onFertig(t.id);
  };

  const karte = { background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(16,42,67,0.08)", marginBottom: 14 };
  return (
    <div>
      <div style={karte}>
        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 8 }}>Was steht an?</p>
        <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 18 }}>
          {TERMIN_ARTEN.map((a) => (
            <button key={a} onClick={() => setArt(a)} className="px-4 py-2"
              style={{ borderRadius: 999, border: `1px solid ${art === a ? C.see : C.linie}`, background: art === a ? C.see : C.weiss,
                color: art === a ? C.weiss : C.grau, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>{a}</button>
          ))}
        </div>
        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 8 }}>Wann?</p>
        <input type="date" value={datum} min={morgen} onChange={(e) => setDatum(e.target.value)}
          style={{ padding: "10px 12px", fontSize: 16, fontFamily: "inherit", border: `1px solid ${C.linie}`, borderRadius: 11, outline: "none" }} />
        {datum >= morgen && <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 8 }}>{tageText(tageBis(datum))}</p>}
      </div>

      <div style={karte}>
        <div className="flex justify-between items-baseline" style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 13, color: C.grau, fontWeight: 300 }}>Welcher Stoff kommt dran?</p>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel }}>{auswahl.length} gewählt</span>
        </div>
        <input value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Thema oder Buchkapitel, z. B. Ableitung oder LS10 II"
          style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", fontSize: 15, fontFamily: "inherit",
            border: `1px solid ${C.linie}`, borderRadius: 12, outline: "none", marginBottom: 14 }} />
        {LINIEN.map((l) => {
          const ks = AKTIVE.filter((k) => k.idee === l.id && passt(k));
          if (!ks.length) return null;
          return (
            <div key={l.id} style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: l.farbe, marginBottom: 6 }}>{l.kurz} · {l.name}</p>
              {ks.map((k) => {
                const an = auswahl.includes(k.id);
                return (
                  <button key={k.id} onClick={() => umschalten(k.id)}
                    style={{ display: "flex", gap: 10, alignItems: "center", width: "100%", textAlign: "left", fontFamily: "inherit",
                      background: an ? C.himmel : C.weiss, border: `1px solid ${an ? C.see : C.linie}`, borderRadius: 11,
                      padding: "9px 12px", marginBottom: 5, cursor: "pointer" }}>
                    <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${an ? C.see : C.linie}`,
                      background: an ? C.see : C.weiss, color: C.weiss, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{an ? "✓" : ""}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: "block", fontSize: 14, color: C.tinte }}>{k.titel}</span>
                      {k.buch && <span style={{ display: "block", fontSize: 11.5, color: C.hellgrau, marginTop: 1 }}>{buchVerweis(k.buch)[0]}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap" style={{ gap: 10 }}>
        <button onClick={speichern} disabled={!gueltig}
          style={{ height: 50, padding: "0 26px", background: gueltig ? C.gruenDunkel : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999,
            fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: gueltig ? "pointer" : "default" }}>
          Plan erstellen
        </button>
        <button onClick={onAbbruch}
          style={{ height: 50, padding: "0 22px", background: "transparent", color: C.grau, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}

/* ---------- Der Plan zu einem Termin ---------- */


export function TerminAnsicht({ t, gehe, zurueck, probeStarten }) {
  const L = LERN;
  const [loeschen, setLoeschen] = useState(false);
  const p = terminPlan(L, t);
  const karte = { background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(16,42,67,0.08)", marginBottom: 14 };

  if (p.vorbei) return (
    <div style={karte}>
      <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{t.art} vom {datumKurz(datumAus(t.datum))}</p>
      <p style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: 16 }}>
        Wie ist sie gelaufen? Trag die Note ein — daran zeigt sich, ob die Vorbereitung wirkt.
      </p>
      <button onClick={() => gehe({ ansicht: "messung" })}
        style={{ height: 44, padding: "0 20px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
        Note eintragen
      </button>
    </div>
  );

  const eintragZeile = (e, k, klickbar) => {
    const titel = e.art === "probe" ? `Probeklausur · ${e.min} Minuten`
      : e.art === "nachbereiten" ? (e.ids.length ? (e.probeFertig ? `Nur noch: ${e.ids.map((id) => KOMP[id]?.titel).join(", ")}` : "Die Fehler aus der Probeklausur") : "Kurze Runde zum Aufwärmen")
      : KOMP[e.id]?.titel;
    const aktion = e.art === "probe" ? probeStarten : e.art === "nachbereiten" ? (e.ids[0] ? () => gehe({ ansicht: "einheit", kompetenz: e.ids[0] }) : () => gehe({ ansicht: "wiederholen" })) : () => gehe(eintragZiel(e));
    return (
      <button key={k} onClick={klickbar ? aktion : undefined}
        style={{ display: "flex", gap: 10, alignItems: "center", width: "100%", textAlign: "left", fontFamily: "inherit",
          background: klickbar ? C.himmel : "transparent", border: "none", borderRadius: 11, padding: klickbar ? "10px 12px" : "4px 0",
          marginBottom: 5, cursor: klickbar ? "pointer" : "default" }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: ART_FARBE[e.art], flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 14, color: C.tinte, fontWeight: klickbar ? 600 : 400 }}>{titel}</span>
          <span style={{ display: "block", fontSize: 11.5, color: C.grau }}>{ART_TEXT[e.art]}{e.teil ? " · Teil" : ""}</span>
        </span>
        <span style={{ fontSize: 12, color: C.hellgrau, flexShrink: 0 }}>{e.min} min</span>
      </button>
    );
  };

  return (
    <div>
      <button onClick={zurueck} className="mb-4" style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        ← Alle Termine
      </button>

      <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 20, padding: 22, marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: "#BBD6EA" }}>{t.art} am {datumKurz(datumAus(t.datum))}</p>
        <div className="flex items-end" style={{ gap: 12, marginTop: 6 }}>
          <span style={{ fontSize: 50, fontWeight: 700, color: C.weiss, lineHeight: 1, letterSpacing: "-0.03em" }}>{p.rest}</span>
          <span style={{ fontSize: 15, color: "#BBD6EA", paddingBottom: 6 }}>{p.rest === 1 ? "Tag" : "Tage"} bis dahin</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.18)", marginTop: 16, overflow: "hidden" }}>
          <div style={{ height: 6, borderRadius: 999, background: C.gruen, width: `${p.ziel.length ? (p.sitzen / p.ziel.length) * 100 : 0}%` }} />
        </div>
        <p style={{ fontSize: 13, color: "#BBD6EA", marginTop: 8 }}>
          {p.sitzen} von {p.ziel.length} Stationen der Arbeit sitzen
          {t.probe?.am ? " · Probeklausur geschrieben" : ""}
        </p>
      </div>

      {!L.einstufung && (
        <div style={{ borderLeft: `4px solid ${C.gruenDunkel}`, paddingLeft: 14, marginBottom: 14 }}>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>
            Ohne Einstufung weiß die App nicht, welche Grundlagen sitzen. Zehn Minuten Einstufung machen den Plan deutlich genauer.
          </p>
          <button onClick={() => gehe({ ansicht: "einstufung" })} className="mt-2"
            style={{ background: "none", border: "none", color: C.gruenDunkel, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
            Einstufung machen
          </button>
        </div>
      )}

      {p.fehlend > 0 && (
        <div className="auftauchen" style={{ ...karte, borderLeft: `4px solid ${C.signal}` }}>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Die Zeit reicht nicht für alles</p>
          <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: 10 }}>
            {p.inhaltTage > 0
              ? `Mit ${p.minuten} Minuten an deinen Lerntagen fehlen etwa ${p.fehlend} Minuten. Zwei ehrliche Möglichkeiten: mehr Zeit einplanen, oder die folgenden Stationen bewusst weglassen und die Punkte bei den anderen holen.`
              : "Bis zum Termin bleibt nur noch Zeit für Probeklausur und Nachbereitung. Neuen Stoff jetzt noch anzufangen, bringt selten Punkte — konzentrier dich auf das, was schon fast sitzt."}
          </p>
          {p.nichtGeschafft.map((e, i) => (
            <p key={i} style={{ fontSize: 13.5, lineHeight: 1.6, color: C.tinte }}>· {KOMP[e.id]?.titel} <span style={{ color: C.hellgrau }}>({ART_TEXT[e.art]}, {e.min} min)</span></p>
          ))}
          {p.inhaltTage > 0 && p.empfohlen > p.minuten && <button onClick={() => lernAendern((X) => { X.plan = { ...(X.plan || { tage: p.planTage, uhrzeit: "17:00", erstellt: Date.now() }), minuten: p.empfohlen }; })}
            className="mt-4" style={{ height: 42, padding: "0 18px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Plan auf {p.empfohlen} Minuten erhöhen
          </button>}
        </div>
      )}

      <div style={karte}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>Heute</p>
        {p.heute && p.heute.eintraege.length
          ? p.heute.eintraege.map((e, k) => eintragZeile(e, k, true))
          : <p style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>
              {p.heute ? "Für heute ist alles erledigt." : `Heute ist frei.${p.naechster ? ` Weiter am ${datumKurz(p.naechster.d)}.` : ""}`}
            </p>}
      </div>

      <div style={karte}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 4 }}>Der Weg bis zum Termin</p>
        <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, marginBottom: 12 }}>
          Er wird jeden Tag aus deinem Lernstand neu berechnet. Was sitzt, fällt heraus; was schiefgeht, rückt nach.
        </p>
        {p.tage.filter((x) => x.off > 0).map((tag) => (
          <div key={tag.off} style={{ paddingTop: 10, marginTop: 10, borderTop: `1px solid ${C.linie}` }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: C.grau, marginBottom: 6 }}>
              {datumKurz(tag.d)}{tag.off === p.rest - 1 ? " · letzter Tag" : ""}
            </p>
            {tag.eintraege.length ? tag.eintraege.map((e, k) => eintragZeile(e, k, false))
              : <p style={{ fontSize: 13, color: C.hellgrau }}>Puffer</p>}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap" style={{ gap: 14 }}>
        {!t.probe?.am && (
          <button onClick={probeStarten} style={{ background: "none", border: "none", color: C.see, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
            Probeklausur jetzt schreiben
          </button>
        )}
        <button onClick={() => setLoeschen(true)} style={{ background: "none", border: "none", color: C.signal, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
          Termin löschen
        </button>
      </div>
      {loeschen && (
        <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 14, marginTop: 14 }}>
          <p style={{ fontSize: 14, marginBottom: 10 }}>Termin und Plan löschen? Dein Lernstand bleibt erhalten.</p>
          <div className="flex" style={{ gap: 10 }}>
            <button onClick={() => { lernAendern((X) => { X.termine = (X.termine || []).filter((x) => x.id !== t.id); }); zurueck(); }}
              className="px-5 py-2" style={{ background: C.signal, color: C.weiss, border: "none", borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>Löschen</button>
            <button onClick={() => setLoeschen(false)} className="px-5 py-2"
              style={{ background: "transparent", color: C.grau, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>Abbrechen</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Übersicht ---------- */


export function KlausurVorbereitung({ gehe, start }) {
  const L = useLern();
  const [modus, setModus] = useState(start || "liste");
  const [probe, setProbe] = useState(false);

  if (!L.profil) return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, marginTop: -8 }}>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>Für einen Vorbereitungsplan brauchen wir zuerst dein Profil.</p>
      <button onClick={() => gehe({ ansicht: "profil2" })} style={{ height: 50, padding: "0 26px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
        Profil anlegen
      </button>
    </div>
  );

  const termin = (L.termine || []).find((t) => t.id === modus);
  const huelle = (inhalt) => <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, marginTop: -8 }}>{inhalt}</div>;

  if (modus === "neu") return huelle(<TerminFormular onFertig={(id) => setModus(id)} onAbbruch={() => setModus("liste")} />);
  if (termin && probe) return huelle(
    <TerminProbe termin={termin} minuten={terminPlan(L, termin).probeMin || 30} onFertig={() => setProbe(false)} onAbbruch={() => setProbe(false)} />);
  if (termin) return huelle(<TerminAnsicht t={termin} gehe={gehe} zurueck={() => setModus("liste")} probeStarten={() => { setProbe(true); window.scrollTo(0, 0); }} />);

  const kommend = aktiveTermine(L);
  const vorbei = (L.termine || []).filter((t) => tageBis(t.datum) < 1).sort((a, b) => b.datum.localeCompare(a.datum)).slice(0, 5);
  return huelle(
    <div>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 18 }}>
        Trag ein, was ansteht. Die App plant rückwärts bis zum Termin: erst die Lücken darunter, dann der Stoff der Arbeit,
        dann eine Probeklausur — und am letzten Tag nur noch das, was dort danebenging.
      </p>
      {kommend.map((t) => {
        const p = terminPlan(L, t);
        return (
          <button key={t.id} onClick={() => setModus(t.id)} className="kachel w-full"
            style={{ display: "block", width: "100%", textAlign: "left", background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16,
              padding: "16px 18px", marginBottom: 10, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 14px rgba(16,42,67,0.06)" }}>
            <span className="flex justify-between items-baseline" style={{ gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: C.tinte }}>{t.art} · {datumKurz(datumAus(t.datum))}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: p.rest <= 3 ? C.signal : C.gruenDunkel }}>{tageText(p.rest)}</span>
            </span>
            <span style={{ display: "block", fontSize: 13, color: C.grau, marginTop: 4 }}>
              {p.sitzen} von {p.ziel.length} Stationen sitzen{p.fehlend > 0 ? " · Zeit knapp" : ""}
            </span>
          </button>
        );
      })}
      <button onClick={() => setModus("neu")} className="mt-2"
        style={{ height: 50, padding: "0 26px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
        Neuen Termin anlegen
      </button>
      {vorbei.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.grau, marginBottom: 8 }}>Vorbei</p>
          {vorbei.map((t) => (
            <button key={t.id} onClick={() => setModus(t.id)}
              style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: `1px solid ${C.linie}`, borderRadius: 12,
                padding: "10px 14px", marginBottom: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: C.grau }}>
              {t.art} · {datumKurz(datumAus(t.datum))}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================================================================
   EINWILLIGUNG VOR DEM ERSTEN FOTO
   ====================================================================== */


export function einwilligungLesen() {
  try { const v = window.localStorage.getItem(EINWILLIGUNG_SCHLUESSEL); if (v) return JSON.parse(v); } catch (e) { /* nicht verfügbar */ }
  return RAM_SPEICHER[EINWILLIGUNG_SCHLUESSEL] || null;
}

export function einwilligungSetzen(v) {
  RAM_SPEICHER[EINWILLIGUNG_SCHLUESSEL] = v;
  try {
    if (v) window.localStorage.setItem(EINWILLIGUNG_SCHLUESSEL, JSON.stringify(v));
    else window.localStorage.removeItem(EINWILLIGUNG_SCHLUESSEL);
  } catch (e) { /* bleibt im Arbeitsspeicher */ }
}


export function Einwilligung({ onJa }) {
  const [alter, setAlter] = useState(null);
  const [eltern, setEltern] = useState(false);
  const ok = alter === "16" || (alter === "u16" && eltern);
  const punkte = [
    ["Was mit dem Foto passiert", "Es wird auf deinem Gerät verkleinert und dann zur Auswertung an den KI-Dienst Claude von Anthropic geschickt. Auch Fragen an Mathilda gehen an diesen Dienst."],
    ["Was gespeichert wird", "In Matheskript wird das Foto nicht gespeichert. Das Ergebnis bleibt nur auf diesem Gerät."],
    ["Was nicht aufs Foto gehört", "Nur das Rechenblatt: kein Name, kein Gesicht, keine Klassenliste im Bild."],
  ];
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620 }}>
      <div style={{ background: C.weiss, borderRadius: 18, padding: 22, boxShadow: "0 3px 18px rgba(16,42,67,0.08)", marginBottom: 14 }}>
        <p style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 14 }}>Bevor du das erste Foto machst</p>
        {punkte.map(([t, s], i) => (
          <div key={i} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: i < punkte.length - 1 ? `1px solid ${C.linie}` : "none" }}>
            <p style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 3 }}>{t}</p>
            <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>{s}</p>
          </div>
        ))}
        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginTop: 6, marginBottom: 8 }}>Wie alt bist du?</p>
        <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 12 }}>
          {[["16", "16 oder älter"], ["u16", "Jünger als 16"]].map(([id, n]) => (
            <button key={id} onClick={() => setAlter(id)} className="px-4 py-2"
              style={{ borderRadius: 999, border: `1px solid ${alter === id ? C.see : C.linie}`, background: alter === id ? C.see : C.weiss,
                color: alter === id ? C.weiss : C.grau, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>{n}</button>
          ))}
        </div>
        {alter === "u16" && (
          <button onClick={() => setEltern(!eltern)}
            style={{ display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", marginBottom: 6 }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: `2px solid ${eltern ? C.see : C.linie}`, background: eltern ? C.see : C.weiss,
              color: C.weiss, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{eltern ? "✓" : ""}</span>
            <span style={{ fontSize: 14, color: C.tinte, lineHeight: 1.6 }}>Meine Eltern wissen Bescheid und sind einverstanden.</span>
          </button>
        )}
      </div>
      <button disabled={!ok} onClick={() => { einwilligungSetzen({ am: Date.now(), unter16: alter === "u16" }); onJa(); }}
        style={{ height: 50, padding: "0 26px", background: ok ? C.gruenDunkel : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999,
          fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: ok ? "pointer" : "default" }}>
        Einverstanden
      </button>
      <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, lineHeight: 1.7, marginTop: 12 }}>
        Du kannst die Einwilligung jederzeit im Profil zurückziehen. Alles ohne Foto funktioniert auch ohne sie.
      </p>
    </div>
  );
}


export function FotoEinwilligungVerwalten() {
  const [e, setE] = useState(() => einwilligungLesen());
  if (!e) return null;
  return (
    <div style={{ marginTop: 22 }}>
      <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>
        Einwilligung für Fotos erteilt am {new Date(e.am).toLocaleDateString("de-DE")}.
      </p>
      <button onClick={() => { einwilligungSetzen(null); setE(null); }} className="mt-1"
        style={{ background: "none", border: "none", color: C.signal, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
        Einwilligung zurückziehen
      </button>
    </div>
  );
}

/* Kennung dieses Geräts für die Kostenbremse — zufällig, ohne Bezug zur Person. */

export function geraetKennung() {
  try {
    let g = window.localStorage.getItem("matheskript-geraet");
    if (!g) { g = Math.random().toString(36).slice(2, 12); window.localStorage.setItem("matheskript-geraet", g); }
    return g;
  } catch (e) { return "ohne"; }
}

export function klasseVonBuch(buch) {
  const erster = (buch || "").split(" · ")[0];
  const ls = erster.match(/^LS(\d+)/);
  if (ls) return Number(ls[1]);
  const a = erster.match(/^A(\d)/);
  if (a) return { 1: 5, 2: 6, 3: 7 }[a[1]] || null;
  if (erster.startsWith("KS")) return "KS";
  return null;
}

export function klasseZiel(k) {
  if (hatEinheit(k.id)) return { ansicht: "einheit", kompetenz: k.id };
  return k.ziel || { ansicht: "karte" };
}


export function KlasseAnsicht({ klasse, gehe }) {
  const L = useLern();
  const linien = LINIEN
    .map((l) => ({ l, ks: AKTIVE.filter((k) => k.idee === l.id && komptrifftKlasse(k, klasse)) }))
    .filter((x) => x.ks.length);
  const kurse = KURSE.filter((k) => kursTrifftKlasse(k, klasse));
  const gesamt = linien.reduce((s, x) => s + x.ks.length, 0);
  const stand = L.stand || {};

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, marginTop: -8 }}>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 4 }}>
        {klasse >= 11
          ? "Stoff der Kursstufe. Die genaue Reihenfolge hängt von deiner Schule ab — G8 oder G9, welches Halbjahr welches Thema hat."
          : `Alles, was in Klasse ${klasse} laut Lambacher Schweizer dran ist.`}
      </p>
      <p style={{ color: C.hellgrau, fontSize: 12.5, fontWeight: 300, marginBottom: 22 }}>{gesamt} Stationen</p>

      {kurse.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>Passende Schulkurse</p>
          {kurse.map((k) => (
            <button key={k.id} onClick={() => gehe({ ansicht: "kurse" })} className="kachel w-full"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left",
                background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "13px 16px", marginBottom: 8,
                cursor: "pointer", fontFamily: "inherit" }}>
              <span>
                <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{k.titel}</span>
                <span style={{ display: "block", fontSize: 12.5, color: C.grau, marginTop: 2 }}>{k.unter}</span>
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, flexShrink: 0 }}>{k.preis} €</span>
            </button>
          ))}
        </div>
      )}

      {linien.map(({ l, ks }) => (
        <div key={l.id} style={{ marginBottom: 22 }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: l.farbe, marginBottom: 8 }}>{l.kurz} · {l.name}</p>
          {ks.map((k) => {
            const st = STATUS_STIL[statusVon(stand, k.id)];
            return (
              <button key={k.id} onClick={() => gehe(klasseZiel(k))} className="kachel w-full"
                style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%",
                  background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 12, padding: "10px 14px",
                  marginBottom: 6, cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ width: 11, height: 11, borderRadius: 999, background: st.fuell, border: `2px solid ${st.rand}`, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 14, color: C.tinte, lineHeight: 1.4 }}>{k.titel}</span>
                  <span style={{ display: "block", fontSize: 12, color: C.hellgrau, marginTop: 1 }}>{buchVerweis(k.buch)[0]}</span>
                </span>
              </button>
            );
          })}
        </div>
      ))}

      {!L.profil && (
        <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, lineHeight: 1.7, marginTop: 8 }}>
          Mit einem Profil zeigt jeder Punkt deinen eigenen Lernstand — blau heißt gesichert, rostbraun heißt Lücke.
        </p>
      )}
    </div>
  );
}

/* ---------- Navigation ---------- */

/* Vier Gruppen statt einer langen Liste. Jeder Eintrag zeigt auf eine Ansicht
   und optional direkt auf ein Werkzeug darin. */

FR.geraetKennung = geraetKennung;
FR.klasseVonBuch = klasseVonBuch;
