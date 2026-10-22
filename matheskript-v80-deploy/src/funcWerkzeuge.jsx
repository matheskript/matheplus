/* ============================================================
   Werkzeug-Bausteine, die alle aus werkzeuge.js gespeist werden:
   · EtikettPille     – Entdecken / Rechnen / Trainieren
   · WerkzeugLeiste   – Kopfbereich jeder Werkzeugseite: Bereich und
                        Station, die Werkzeuge der Station, Umschalter
                        (z. B. Polynome | Beliebige Funktionen) und
                        „Weiter“ zur nächsten Station
   · ZentrumListe     – Übersichtsseiten (Analysis, Vektoren, Stochastik)
                        nach Stationen gegliedert
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { BEREICHE, ETIKETTEN, werkzeug, wo } from "./werkzeuge.js";
import { FR } from "./funcRegistry.jsx";
import { MS } from "./mathText.jsx";
import { uebergabeHinweis, uebergabeSetzen, uebergabeZurueck } from "./uebergabe.js";
import { KURSE, VEK_BEREICHE, aktuellerKurs, kurs, kursMerken, meineKurse, reiterFuer, reiterKurz, reiterName, wahlUmschalten } from "./trainingsKurse.js";
import { MitWurzeln } from "./wurzelZeichen.jsx";
import { useVekStand, vekAktiv, vekEintragOeffnen } from "./vekNav.js";
import { LERN } from "./base3.jsx";
import { themaBereich } from "./meinTraining.js";
import { THEMEN as TRAINING_THEMEN } from "./trainingDaten.js";

/* ---------- Etikett ---------- */
const ETIKETT_FARBE = {
  entdecken: { hg: "rgba(237,187,0,0.18)", rand: "rgba(237,187,0,0.55)", text: "#8A6A00", hgDunkel: "rgba(8,22,56,0.78)", textDunkel: "#FFE58A" },
  rechnen: { hg: "rgba(0,77,152,0.08)", rand: "rgba(0,77,152,0.35)", text: "#004D98", hgDunkel: "rgba(8,22,56,0.78)", textDunkel: "#BFD6F5" },
  trainieren: { hg: "rgba(165,0,68,0.08)", rand: "rgba(165,0,68,0.35)", text: "#A50044", hgDunkel: "rgba(8,22,56,0.78)", textDunkel: "#FF9EC2" },
};

export function EtikettPille({ etikett, dunkel = false, klein = false, style }) {
  const e = ETIKETTEN[etikett];
  if (!e) return null;
  const f = ETIKETT_FARBE[etikett];
  return (
    <span title={e.text} style={{ display: "inline-block", flexShrink: 0, padding: klein ? "1px 5px" : "2px 7px", borderRadius: 999, fontSize: klein ? 9 : 10.5, fontWeight: 700, letterSpacing: "0.04em",
      textTransform: "uppercase", lineHeight: 1.4, whiteSpace: "nowrap",
      background: dunkel ? f.hgDunkel : f.hg, color: dunkel ? f.textDunkel : f.text, border: dunkel ? "1px solid rgba(255,255,255,0.18)" : `1px solid ${f.rand}`, ...style }}>
      {e.name}
    </span>
  );
}

/* Etiketten als Filter (Startseite): antippen zeigt nur Werkzeuge dieser Art, nochmal antippen hebt den Filter auf */
export function EtikettFilter({ wert, setze }) {
  const aktiv = wert && ETIKETTEN[wert];
  return (
    <div style={{ margin: "4px 0 2px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.grau, marginBottom: 7 }}>Zeig mir</div>
      <div role="group" aria-label="Werkzeuge nach Art filtern" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {Object.keys(ETIKETTEN).map((k) => {
          const an = wert === k, f = ETIKETT_FARBE[k];
          return (
            <button key={k} type="button" aria-pressed={an} onClick={() => setze(an ? null : k)}
              style={{ minHeight: 36, padding: "0 13px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 11.5, fontWeight: 800,
                letterSpacing: "0.05em", textTransform: "uppercase", border: `1.5px solid ${an ? f.text : f.rand}`, background: an ? f.text : f.hg, color: an ? "#fff" : f.text,
                transition: "background .15s ease, color .15s ease" }}>
              {ETIKETTEN[k].name}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 12.5, color: C.grau, marginTop: 7, lineHeight: 1.45 }}>
        {aktiv ? <>{ETIKETTEN[wert].text}. <button type="button" onClick={() => setze(null)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: C.see }}>Alle zeigen</button></>
          : "Tippe ein Etikett an, um nur diese Werkzeuge zu sehen."}
      </div>
    </div>
  );
}

/* Kompakte Etikett-Knöpfe (Startseite, neben „Weitermachen“): ohne Überschrift und Hinweis, füllen die Breite.
   Antippen filtert, nochmal antippen hebt den Filter auf. */
export function EtikettKnoepfe({ wert, setze }) {
  return (
    <div role="group" aria-label="Werkzeuge nach Art filtern" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6 }}>
      {Object.keys(ETIKETTEN).map((k) => {
        /* aktiv = gefüllt in der Etikett-Farbe; inaktiv = nur dünner Rand, ohne Fläche; ist ein anderes aktiv, treten die übrigen zurück */
        const an = wert === k, f = ETIKETT_FARBE[k], leise = !!wert && !an;
        return (
          <button key={k} type="button" aria-pressed={an} onClick={() => setze(an ? null : k)} title={ETIKETTEN[k].text}
            style={{ minHeight: 34, padding: "0 4px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 800,
              letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              border: `1.5px solid ${an ? f.text : f.rand}`, background: an ? f.text : "transparent", color: an ? "#fff" : f.text,
              boxShadow: an ? "0 4px 12px -4px rgba(15,26,51,0.35)" : "none", opacity: leise ? 0.55 : 1,
              transition: "background .15s ease, color .15s ease, opacity .15s ease" }}>
            {ETIKETTEN[k].name}
          </button>
        );
      })}
    </div>
  );
}

/* Kleine Legende der drei Etiketten */
export function EtikettLegende({ dunkel = false }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", alignItems: "center", margin: "4px 0 2px" }}>
      {Object.keys(ETIKETTEN).map((k) => (
        <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: dunkel ? "rgba(255,255,255,0.82)" : C.grau, fontWeight: 400 }}>
          <EtikettPille etikett={k} dunkel={dunkel} />{ETIKETTEN[k].text}
        </span>
      ))}
    </div>
  );
}

/* ---------- Kopfbereich einer Werkzeugseite ---------- */
const chipStil = (aktiv) => ({
  padding: "6px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: aktiv ? 700 : 500, fontFamily: "inherit", cursor: "pointer",
  whiteSpace: "nowrap", border: `1px solid ${aktiv ? C.flaggold : "rgba(255,255,255,0.28)"}`,
  background: aktiv ? "rgba(237,187,0,0.16)" : "rgba(255,255,255,0.08)", color: aktiv ? C.flaggold : C.silberHell,
});

/* Eine einzige Zeile unter dem Titel: links die Stations-Auswahl (Werkzeuge der Station,
   „Weiter“ zur nächsten Station und die Bereichsübersicht stecken im Aufklappfeld),
   rechts daneben – falls das Werkzeug mehrere Ansichten hat – der Umschalter
   (z. B. Polynome | Beliebige Funktionen). Früher waren das drei Zeilen
   (Stationszeile, Chip-Leiste, Umschalter). */
export function WerkzeugLeiste({ ansicht, gehe }) {
  const ort = wo(ansicht);
  const [auf, setAuf] = useState(false);
  const wurzel = useRef(null);
  useEffect(() => { setAuf(false); }, [ansicht]);
  useEffect(() => {
    if (!auf) return undefined;
    const taste = (e) => { if (e.key === "Escape") setAuf(false); };
    const aussen = (e) => { if (wurzel.current && !wurzel.current.contains(e.target)) setAuf(false); };
    window.addEventListener("keydown", taste);
    document.addEventListener("pointerdown", aussen);
    return () => { window.removeEventListener("keydown", taste); document.removeEventListener("pointerdown", aussen); };
  }, [auf]);
  if (!ort) return null;
  const { bereich, station, werkzeug: wAktiv, sNr } = ort;

  /* Übersichtsseite eines Bereichs: die Stationen als Chips */
  if (!station) {
    return (
      <div className="sek-menue" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, paddingBottom: 4 }}>
        {bereich.stationen.map((s, i) => (
          <button key={s.id} type="button" className="sek-chip" onClick={() => gehe(werkzeug(s.werkzeuge[0]).ziel)} style={chipStil(false)}>
            {i + 1}{" "}<span>{s.titel}</span>
          </button>
        ))}
      </div>
    );
  }

  const naechste = bereich.stationen[sNr];   // sNr ist 1-basiert → Index der nächsten Station
  const weiter = naechste ? werkzeug(naechste.werkzeuge[0]) : null;
  const anzahl = bereich.stationen.length;
  const zeile = (aktiv) => ({ display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 42, padding: "0 12px", border: "none", borderRadius: 10, textAlign: "left",
    fontFamily: "inherit", fontSize: 14.5, fontWeight: aktiv ? 700 : 500, cursor: "pointer", color: aktiv ? C.seeTief : C.tinte, background: aktiv ? "rgba(237,187,0,0.16)" : "transparent" });
  const zurUebersicht = bereich.uebersicht ? { ansicht: bereich.uebersicht } : null;
  return (
    <div data-werkzeug-leiste>
      <style>{`@media (max-width:480px){.wz-zeile .wz-pille{padding:0 9px 0 11px !important;gap:5px !important}.wz-zeile .wz-tab{padding:0 10px !important}}@media (max-width:374px){.wz-zeile .wz-nr{display:none}.wz-zeile .wz-pille{font-size:12px !important}}`}</style>
      <div className="wz-zeile" style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", gap: 8 }}>
        <div ref={wurzel} style={{ position: "relative", flex: "0 1 auto", minWidth: 0 }}>
          <button type="button" className="wz-pille" onClick={() => setAuf(!auf)} aria-expanded={auf} aria-haspopup="listbox"
            title={`${bereich.titel} · Station ${sNr} von ${anzahl}: ${station.titel}`}
            style={{ height: 34, maxWidth: "100%", display: "inline-flex", alignItems: "center", gap: 7, padding: "0 12px 0 13px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
              fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", color: C.silberHell,
              border: `1px solid ${auf ? C.flaggold : "rgba(255,255,255,0.28)"}`, background: auf ? "rgba(237,187,0,0.14)" : "rgba(255,255,255,0.08)" }}>
            <span className="wz-nr" style={{ color: "rgba(255,255,255,0.62)", fontWeight: 500, flexShrink: 0 }}><span className="titel-lang">Station </span>{`${sNr}/${anzahl}`}</span>
            <span style={{ color: C.flaggold, fontWeight: 700, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{station.titel}</span>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              style={{ flexShrink: 0, transform: auf ? "rotate(180deg)" : "none", transition: "transform .15s" }}><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {auf && (
            <div role="listbox" aria-label={`${bereich.titel}: Station ${sNr}`}
              style={{ position: "absolute", top: 40, left: 0, zIndex: 60, width: "min(320px, calc(100vw - 48px))", background: C.weiss, borderRadius: 14, padding: 6,
                boxShadow: "0 14px 40px rgba(8,23,59,0.32)", border: `1px solid ${C.linie}`, textAlign: "left" }}>
              <p style={{ margin: "6px 12px 4px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.grau, lineHeight: 1.6 }}>
                <span style={{ display: "block" }}>{bereich.titel}</span>
                <span style={{ display: "block", fontWeight: 600, letterSpacing: "0.06em" }}>{`Station ${sNr} von ${anzahl} · `}<span style={{ color: "#8A6A00" }}>{station.titel}</span></span>
              </p>
              {station.werkzeuge.map((id) => {
                const w = werkzeug(id);
                const aktiv = w.id === wAktiv.id;
                return (
                  <button key={id} type="button" role="option" aria-selected={aktiv} onClick={() => (aktiv ? setAuf(false) : gehe(w.ziel))} style={zeile(aktiv)}>
                    <span style={{ flex: 1 }}>{w.name}</span>{aktiv && <span aria-hidden="true" style={{ color: C.flaggold, fontWeight: 800 }}>●</span>}
                  </button>
                );
              })}
              {(weiter || zurUebersicht) && <div style={{ borderTop: `1px solid ${C.linie}`, margin: "4px 0" }} />}
              {weiter && (
                <button type="button" onClick={() => gehe(weiter.ziel)} style={{ ...zeile(false), color: C.see, fontWeight: 700, justifyContent: "space-between" }}>
                  <span>{`Weiter: ${naechste.titel}`}</span><span aria-hidden="true">›</span>
                </button>
              )}
              {zurUebersicht && (
                <button type="button" onClick={() => gehe(zurUebersicht)} style={{ ...zeile(false), fontSize: 13.5, color: C.grau }}>
                  ‹ Alle Stationen
                </button>
              )}
            </div>
          )}
        </div>
        {wAktiv.modi && (
          <div role="tablist" aria-label={`${wAktiv.name}: Ansicht wählen`}
            style={{ display: "inline-flex", flexShrink: 0, height: 34, boxSizing: "border-box", padding: 3, borderRadius: 999, background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.18)", minWidth: 0 }}>
            {wAktiv.modi.map((m) => {
              const an = m.ansicht === ansicht;
              return (
                <button key={m.ansicht} type="button" role="tab" className="wz-tab" aria-selected={an} onClick={() => !an && gehe({ ansicht: m.ansicht })} title={m.name}
                  style={{ padding: "0 12px", borderRadius: 999, border: "none", fontFamily: "inherit", fontSize: 12.5, fontWeight: an ? 700 : 500, cursor: an ? "default" : "pointer",
                    background: an ? C.weiss : "transparent", color: an ? C.seeTief : C.silberHell, whiteSpace: "nowrap" }}>
                  {m.kurz ? <><span className="titel-lang">{m.name}</span><span className="titel-kurz">{m.kurz}</span></> : m.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {uebergabeHinweis(ansicht) && (
        <p data-uebergabe-hinweis style={{ fontSize: 12.5, color: C.flaggold, margin: "8px 0 0", fontWeight: 600 }}>
          {`↪ Übernommen aus „${uebergabeHinweis(ansicht)}“`}
          {uebergabeZurueck(ansicht) && (<>
            {" · "}
            <button type="button" onClick={() => gehe(uebergabeZurueck(ansicht))}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", fontWeight: 700, color: C.weiss, textDecoration: "underline", textUnderlineOffset: 3 }}>
              zurück
            </button>
          </>)}
        </p>
      )}
    </div>
  );
}

/* ---------- Werkzeug-Band: die dünne Menüleiste innerhalb eines Werkzeugs ----------
   Steht direkt unter der Kopfleiste (Mythos-Mathe-Header) und klebt beim Scrollen oben.
   Links die Werkzeuge der Station als Reiter (aktives Werkzeug mit Goldstrich),
   rechts „Test“ (Prüfungsmodus) und der Kurs-Umschalter: Gehört das Werkzeug zu einem
   Kurs (trainingsKurse.js, z. B. Analysis Oberstufe), stehen links die Trainer dieses
   Kurses und der Knopf trägt den Kursnamen; das Aufklappfeld wechselt den Kurs und
   zeigt darunter alle Werkzeuge. Sonst wie früher: Station + „Tools“. Ersetzt die frühere KompaktKopf-Zeile
   (‹ · Werkzeug-Auswahl · Test · ☰) – das ☰-Menü steckt jetzt in der Kopfleiste. */
export const BAND_HOEHE = 38;

/* Lernstand lesen, ohne func6 zu importieren (func6 → func3 → diese Datei wäre ein Kreis):
   LERN liegt in base3, Änderungen melden sich über LERN.hoerer. Schreiben lädt func6 erst beim Klick. */
function useLernstand() {
  const [, setZ] = useState(0);
  useEffect(() => { const h = () => setZ((z) => z + 1); LERN.hoerer.add(h); return () => { LERN.hoerer.delete(h); }; }, []);
  return LERN;
}
const kursWahlSetzen = (ids) => import("./func6.jsx").then((m) => m.lernAendern((L) => {
  L.training = { ...(L.training || {}), kurse: { gewaehlt: ids, zeit: Date.now() } };
}));
/* Gebiet eines Themas aus Mein Mathe-Training („Analysis“, „Vektoren“, „Stochastik“ …) */
const gebietVon = (id, teile) => { const t = themaBereich(id, teile); return t && TRAINING_THEMEN[t] ? TRAINING_THEMEN[t].gruppe : null; };
const QUELLE_TEXT = {
  wahl: "Von dir ausgewählt.",
  training: "Aus deinen Themen in Mein Mathe-Training.",
  alle: "Alle Bereiche – wähle aus, welche du gerade brauchst.",
};

/* Kurs-Zeichen im Umschalter: vier Kacheln (wie früher „Tools“) */
const KachelZeichen = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></svg>
);
const Pfeil = ({ auf, g = 11 }) => (
  <svg viewBox="0 0 24 24" width={g} height={g} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    style={{ flexShrink: 0, transform: auf ? "rotate(180deg)" : "none", transition: "transform .15s" }}><path d="M6 9l6 6 6-6" /></svg>
);

export function WerkzeugBand({ ansicht, gehe, testKnopf }) {
  const ort = wo(ansicht);
  const [auf, setAuf] = useState(false);
  const [alleAuf, setAlleAuf] = useState(false);
  const [bearbeiten, setBearbeiten] = useState(false);
  const lern = useLernstand();
  const [kursId, setKursId] = useState(() => { const k = aktuellerKurs(ansicht); return k ? k.id : null; });
  const wurzel = useRef(null);
  const reiterRef = useRef(null);
  const [mehr, setMehr] = useState(false);   // Reiter laufen über den Rand → rechts weich ausblenden (Handy)
  const vekStand = useVekStand();   // Vektoren: Gruppe hängt auch vom Modus ab (Geraden im Raum, Winkel)
  useEffect(() => { if (!auf) setBearbeiten(false); }, [auf]);
  useEffect(() => { setAuf(false); const k = aktuellerKurs(ansicht); setKursId(k ? k.id : null); }, [ansicht]);
  /* Aktiven Reiter waagerecht ins Bild holen (nur innerhalb der Reiterzeile, die Seite scrollt nicht) */
  useEffect(() => {
    const el = reiterRef.current;
    if (!el) return undefined;
    const pruefe = () => setMehr(el.scrollWidth - el.scrollLeft - el.clientWidth > 4);
    const a = el.querySelector('[aria-current="page"]');
    /* Aktiver Reiter immer an den linken Rand: so ist er am Handy nie am rechten Rand abgeschnitten („Integra…“) */
    if (a) el.scrollLeft = Math.max(0, a.offsetLeft - 4);
    pruefe();
    el.addEventListener("scroll", pruefe, { passive: true });
    window.addEventListener("resize", pruefe);
    return () => { el.removeEventListener("scroll", pruefe); window.removeEventListener("resize", pruefe); };
  }, [ansicht, kursId]);
  useEffect(() => {
    if (!auf) return undefined;
    const taste = (e) => { if (e.key === "Escape") setAuf(false); };
    const aussen = (e) => { if (wurzel.current && !wurzel.current.contains(e.target)) setAuf(false); };
    window.addEventListener("keydown", taste);
    document.addEventListener("pointerdown", aussen);
    return () => { window.removeEventListener("keydown", taste); document.removeEventListener("pointerdown", aussen); };
  }, [auf]);
  if (!ort || !ort.werkzeug) return null;
  const { bereich, station, werkzeug: wAktiv, sNr } = ort;
  const aktKurs = kurs(kursId);
  /* Kurs-Modus: Reiter = Trainer des Kurses. Sonst wie bisher: Werkzeuge der Station + „Weiter“. */
  const reiter = aktKurs ? reiterFuer(aktKurs, wAktiv.id) : station.werkzeuge;
  const naechste = aktKurs ? null : bereich.stationen[sNr];
  const weiter = naechste ? werkzeug(naechste.werkzeuge[0]) : null;
  const { kurse: meine, quelle } = meineKurse(lern.training, gebietVon);
  const weitere = KURSE.filter((k) => !meine.some((m) => m.id === k.id));
  const H = BAND_HOEHE;
  const zeile = (aktiv) => ({ display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 40, padding: "0 12px", border: "none", borderRadius: 10, textAlign: "left",
    fontFamily: "inherit", fontSize: 14, fontWeight: aktiv ? 700 : 500, cursor: "pointer", color: aktiv ? C.seeTief : C.tinte, background: aktiv ? "rgba(237,187,0,0.16)" : "transparent" });
  const kicker = (farbe = C.grau) => ({ margin: "8px 12px 4px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: farbe });
  const kursWaehlen = (k) => {
    kursMerken(k.id);
    setAuf(false);
    if (k.werkzeuge.includes(wAktiv.id)) { setKursId(k.id); return; }
    const erst = werkzeug(k.werkzeuge[0]);
    if (erst) gehe(erst.ziel);
  };
  const KursZeile = ({ k }) => {
    const an = aktKurs && aktKurs.id === k.id;
    const drin = meine.some((m) => m.id === k.id);
    const klick = bearbeiten ? () => kursWahlSetzen(wahlUmschalten(meine, k.id)) : an ? () => setAuf(false) : () => kursWaehlen(k);
    return (
      <button type="button" data-wb-kurs={k.id} aria-current={!bearbeiten && an ? "true" : undefined} aria-pressed={bearbeiten ? drin : undefined} onClick={klick}
        style={{ ...zeile(!bearbeiten && an), minHeight: 52, alignItems: "center" }}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold, fontSize: 13, fontWeight: 800, fontStyle: "italic", opacity: bearbeiten && !drin ? 0.45 : 1 }}>
          {werkzeug(k.werkzeuge[0]).zeichen.slice(0, 3)}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", lineHeight: 1.25 }}>{k.titel}{k.stufe && <span style={{ fontWeight: 500, color: C.grau }}>{` ${k.stufe}`}</span>}</span>
          <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: C.grau, lineHeight: 1.35 }}>{`${k.werkzeuge.length} Werkzeuge · ${k.zeile}`}</span>
        </span>
        {bearbeiten
          ? <span aria-hidden="true" style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${drin ? C.see : C.linie}`, background: drin ? C.see : C.weiss,
              color: C.weiss, fontSize: 13, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{drin ? "✓" : ""}</span>
          : an && <span aria-hidden="true" style={{ color: C.flaggold, fontWeight: 800 }}>●</span>}
      </button>
    );
  };
  return (
    <nav data-werkzeug-band data-kurs={aktKurs ? aktKurs.id : undefined} aria-label={aktKurs ? `${aktKurs.titel} ${aktKurs.stufe}: Werkzeuge`.trim() : `${bereich.titel}: Werkzeuge`}
      style={{ position: "sticky", top: 0, zIndex: 45, background: "rgba(255,255,255,0.96)", backdropFilter: "saturate(1.4) blur(8px)", WebkitBackdropFilter: "saturate(1.4) blur(8px)",
        borderBottom: `1px solid ${C.linie}`, boxShadow: "0 6px 18px -14px rgba(15,26,51,0.35)" }}>
      <style>{`.wb-reiter{scrollbar-width:none}.wb-reiter::-webkit-scrollbar{display:none}
        .wb-tab::after{content:"";position:absolute;left:10px;right:10px;bottom:0;height:2px;border-radius:2px;background:${C.flaggold};transform:scaleX(0);transition:transform .2s cubic-bezier(.2,.7,.3,1)}
        .wb-tab[aria-current="page"]::after{transform:scaleX(1)}
        .wb-tab:hover{color:${C.seeTief} !important}
        .wb-innen{max-width:620px}
        .wb-kurs-stufe,.wb-lang{display:none}
        @media (min-width:840px){.wb-innen{max-width:none;width:var(--tr-breite);padding:0 0 0 8px !important}.wb-tab{padding:0 12px !important;font-size:13.5px !important}.wb-tab::after{left:12px;right:12px}}
        @media (min-width:1000px){.wb-kurs-stufe,.wb-lang{display:inline}.wb-kurz{display:none}.wb-tab{padding:0 10px !important;font-size:13px !important}.wb-tab::after{left:10px;right:10px}}
        @media (max-width:839px){.wb-reiter[data-mehr]{-webkit-mask-image:linear-gradient(90deg,#000 82%,transparent);mask-image:linear-gradient(90deg,#000 82%,transparent)}}
        @media (max-width:374px){.wb-tools-text{display:none}}`}</style>
      <div ref={wurzel} className="mx-auto wb-innen" style={{ position: "relative", height: H, padding: "0 8px 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
        <div ref={reiterRef} className="wb-reiter" data-mehr={mehr ? "" : undefined} style={{ flex: "1 1 auto", minWidth: 0, display: "flex", alignItems: "stretch", height: "100%", overflowX: "auto" }}>
          {/* Vektoren: Gruppen statt Werkzeuge (VEK_BEREICHE); ein Reiter öffnet den ersten Eintrag der Gruppe */}
          {aktKurs && aktKurs.bereiche === "vek" && VEK_BEREICHE.map((b) => {
            const akt = vekAktiv(vekStand.ansicht === ansicht ? vekStand : { ansicht, modus: null });
            const an = Boolean(akt && akt.bereich.id === b.id);
            return (
              <button key={b.id} type="button" className="wb-tab" data-wb-gruppe={b.id} aria-current={an ? "page" : undefined} onClick={() => !an && vekEintragOeffnen(b.eintraege[0])} title={b.name}
                style={{ position: "relative", flexShrink: 0, height: "100%", padding: "0 10px", border: "none", background: "none", fontFamily: "inherit", cursor: an ? "default" : "pointer",
                  fontSize: 13, fontWeight: an ? 700 : 500, color: an ? C.seeTief : C.grau, whiteSpace: "nowrap", letterSpacing: "-0.005em" }}>
                <span className="wb-lang">{b.name}</span><span className="wb-kurz">{b.kurz}</span>
              </button>
            );
          })}
          {!(aktKurs && aktKurs.bereiche === "vek") && reiter.map((id) => {
            const w = werkzeug(id);
            const an = w.id === wAktiv.id;
            return (
              <button key={id} type="button" className="wb-tab" aria-current={an ? "page" : undefined} onClick={() => !an && gehe(w.ziel)} title={aktKurs ? reiterName(aktKurs, id, w).replace(/√\((.*?)\)/g, "$1") : w.name}
                style={{ position: "relative", flexShrink: 0, height: "100%", padding: "0 10px", border: "none", background: "none", fontFamily: "inherit", cursor: an ? "default" : "pointer",
                  fontSize: 13, fontWeight: an ? 700 : 500, color: an ? C.seeTief : C.grau, whiteSpace: "nowrap", letterSpacing: "-0.005em" }}>
                {aktKurs ? <><span className="wb-lang"><MitWurzeln text={reiterName(aktKurs, id, w)} /></span><span className="wb-kurz"><MitWurzeln text={reiterKurz(aktKurs, id, w)} /></span></>
                  : <><span className="titel-lang">{w.name}</span><span className="titel-kurz">{w.kurz || w.name}</span></>}
              </button>
            );
          })}
        </div>
        {testKnopf}
        <button type="button" onClick={() => setAuf(!auf)} aria-expanded={auf} aria-haspopup="dialog" data-wb-tools title={aktKurs ? "Bereich wechseln" : "Alle Werkzeuge"}
          style={{ flexShrink: 0, height: 26, display: "inline-flex", alignItems: "center", gap: 5, padding: "0 9px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer",
            fontSize: 12.5, fontWeight: 700, color: C.see, border: `1px solid ${auf ? C.flaggold : C.linie}`, background: auf ? "rgba(237,187,0,0.14)" : C.weiss }}>
          <KachelZeichen />
          <span className="wb-tools-text">{aktKurs ? <>{aktKurs.titel}{aktKurs.stufe && <span className="wb-kurs-stufe">{` ${aktKurs.stufe}`}</span>}</> : "Werkzeuge"}</span>
          <Pfeil auf={auf} />
        </button>
        {auf && (
          <div role="dialog" aria-label={aktKurs ? "Bereich wechseln" : "Alle Werkzeuge"} data-wb-panel
            style={{ position: "absolute", top: H + 4, right: 8, zIndex: 46, width: "min(340px, calc(100vw - 16px))", maxHeight: "min(72vh, 600px)", overflowY: "auto",
              background: C.weiss, borderRadius: 14, padding: 6, boxShadow: "0 14px 40px rgba(8,23,59,0.28)", border: `1px solid ${C.linie}` }}>
            {weiter && (
              <button type="button" onClick={() => gehe(weiter.ziel)} style={{ ...zeile(false), color: C.see, fontWeight: 700, justifyContent: "space-between" }}>
                <span>{`Weiter: ${naechste.titel}`}</span><span aria-hidden="true">›</span>
              </button>
            )}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <p style={kicker()}>Deine Bereiche</p>
              <button type="button" data-wb-bearbeiten aria-pressed={bearbeiten} onClick={() => setBearbeiten(!bearbeiten)}
                style={{ margin: "0 12px 0 0", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: C.see }}>
                {bearbeiten ? "Fertig" : "Auswählen"}
              </button>
            </div>
            <p data-wb-quelle style={{ margin: "-2px 12px 6px", fontSize: 11.5, color: C.grau, lineHeight: 1.4 }}>
              {bearbeiten ? "Tippe an, welche Bereiche du gerade brauchst." : QUELLE_TEXT[quelle]}
            </p>
            {(bearbeiten ? KURSE : meine).map((k) => <KursZeile key={k.id} k={k} />)}
            {!bearbeiten && weitere.length > 0 && (<>
              <p style={kicker()}>Weitere Bereiche</p>
              {weitere.map((k) => <KursZeile key={k.id} k={k} />)}
            </>)}
            <div style={{ borderTop: `1px solid ${C.linie}`, marginTop: 6, paddingTop: 4 }}>
              <button type="button" aria-expanded={alleAuf || !aktKurs} onClick={() => setAlleAuf(!alleAuf)} disabled={!aktKurs}
                style={{ ...zeile(false), minHeight: 36, fontSize: 12.5, fontWeight: 700, color: C.grau, justifyContent: "space-between", cursor: aktKurs ? "pointer" : "default" }}>
                <span>Alle Werkzeuge</span>{aktKurs && <Pfeil auf={alleAuf} />}
              </button>
              {(alleAuf || !aktKurs) && BEREICHE.map((b) => (
                <div key={b.id} style={{ marginTop: 2 }}>
                  <p style={kicker(b.id === bereich.id ? "#8A6A00" : C.grau)}>{b.titel}</p>
                  {b.stationen.flatMap((s) => s.werkzeuge).filter((id, i, l) => l.indexOf(id) === i).map((id) => {
                    const w = werkzeug(id);
                    if (!w) return null;
                    const an = w.id === wAktiv.id;
                    return (
                      <button key={id} type="button" aria-current={an ? "page" : undefined} onClick={() => (an ? setAuf(false) : gehe(w.ziel))} style={zeile(an)}>
                        <span style={{ flex: 1 }}>{w.name}</span>{an && <span aria-hidden="true" style={{ color: C.flaggold, fontWeight: 800 }}>●</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {aktKurs && wAktiv.modi && (
        /* Werkzeug mit mehreren Ansichten (Kurvendiskussion: Polynome | Beliebige Funktionen): zweite, flache Zeile */
        <div className="mx-auto wb-innen" style={{ padding: "0 8px 8px 12px" }}>
          <div role="tablist" aria-label={`${wAktiv.name}: Ansicht wählen`}
            style={{ display: "inline-flex", height: 32, boxSizing: "border-box", padding: 3, borderRadius: 999, background: "#EEF2F8" }}>
            {wAktiv.modi.map((m) => {
              const an = m.ansicht === ansicht;
              return (
                <button key={m.ansicht} type="button" role="tab" aria-selected={an} onClick={() => !an && gehe({ ansicht: m.ansicht })}
                  style={{ padding: "0 14px", borderRadius: 999, border: "none", fontFamily: "inherit", fontSize: 12.5, fontWeight: an ? 700 : 500, cursor: an ? "default" : "pointer",
                    background: an ? C.weiss : "transparent", color: an ? C.see : C.grau, boxShadow: an ? "0 1px 6px rgba(15,26,51,0.12)" : "none", whiteSpace: "nowrap" }}>
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

/* ---------- Übersichtsseite eines Bereichs ---------- */
export function ZentrumListe({ bereichId, gehe }) {
  const bereich = BEREICHE.find((b) => b.id === bereichId);
  if (!bereich) return null;
  return (
    <div>
      <EtikettLegende />
      {bereich.stationen.map((s, i) => (
        <section key={s.id} style={{ marginTop: i ? 18 : 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "0 2px 10px" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, background: C.seeTief, color: C.flaggold, fontSize: 13, fontWeight: 800,
              display: "inline-flex", alignItems: "center", justifyContent: "center", transform: "translateY(5px)" }}>{i + 1}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", color: C.tinte }}>{s.titel}</span>
              <span style={{ display: "block", fontSize: 13, fontWeight: 300, color: C.grau }}>{s.zeile}</span>
            </span>
          </div>
          {s.werkzeuge.map((id) => {
            const x = werkzeug(id);
            return (
              <button key={id} onClick={() => gehe(x.ziel)} className="w-full mb-3"
                style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 18,
                  textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
                <span aria-hidden="true" style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 15,
                  background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: x.zeichen.length > 3 ? 17 : 21, fontWeight: 800, fontStyle: "italic", whiteSpace: "nowrap" }}>
                  {x.zeichen}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ minWidth: 0, fontSize: "clamp(15px, 4.4vw, 17.5px)", fontWeight: 600, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span className="titel-lang">{x.name}</span><span className="titel-kurz">{x.kurz}</span>
                    </span>
                    <EtikettPille etikett={x.etikett} />
                  </span>
                  <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.8em", color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.4 }}>{x.slogan}</span>
                </span>
              </button>
            );
          })}
        </section>
      ))}
    </div>
  );
}

/* ---------- „Weiter mit …“: Ergebnis an ein anderes Werkzeug übergeben ----------
   ziel  – Ansicht des Zielwerkzeugs
   daten – was das Ziel beim Start übernimmt (siehe uebergabe.js)
   von   – Name des abgebenden Werkzeugs (für die Zeile „Übernommen aus …“) */
export function WeiterKnopf({ ziel, daten, von, titel, zeile, zurueck = null }) {
  const w = wo(ziel);
  const name = titel || (w && w.werkzeug ? w.werkzeug.name : ziel);
  return (
    <button type="button" data-weiter-ziel={ziel} onClick={() => { uebergabeSetzen(ziel, daten, von, zurueck); if (FR.gehe) FR.gehe({ ansicht: ziel, uebergabe: true }); }}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        border: `1.5px solid ${C.see}`, background: C.weiss, color: C.see, boxShadow: "0 2px 10px rgba(0,77,152,0.08)" }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 999, background: C.see, color: C.flaggold, fontSize: 16, fontWeight: 800,
        display: "inline-flex", alignItems: "center", justifyContent: "center" }}>↪</span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, lineHeight: 1.25 }}><MS s={name} /></span>
        {zeile && <span style={{ display: "block", fontSize: 12.5, fontWeight: 400, color: C.grau, lineHeight: 1.35, marginTop: 2 }}><MS s={zeile} /></span>}
      </span>
      <span aria-hidden="true" style={{ flexShrink: 0, fontSize: 18, fontWeight: 700 }}>›</span>
    </button>
  );
}

/* Mehrere Weiter-Knöpfe unter einer kleinen Überschrift */
export function WeiterMit({ children, titel = "Weiter mit diesem Ergebnis" }) {
  const kinder = React.Children.toArray(children).filter(Boolean);
  if (!kinder.length) return null;
  return (
    <div data-weiter-mit style={{ marginTop: 18 }}>
      <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.grau, margin: "0 2px 8px" }}><MS s={titel} /></p>
      <div style={{ display: "grid", gap: 8 }}>{kinder}</div>
    </div>
  );
}
