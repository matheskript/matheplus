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
import { uebergabeHinweis, uebergabeSetzen, uebergabeZurueck } from "./uebergabe.js";

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

export function WerkzeugLeiste({ ansicht, gehe }) {
  const ort = wo(ansicht);
  if (!ort) return null;
  const { bereich, station, werkzeug: wAktiv, sNr } = ort;
  const scrollZuAktiv = (el) => { if (el) { const c = el.querySelector('[aria-current="page"]'); if (c && c.offsetLeft + c.offsetWidth > el.clientWidth) el.scrollLeft = c.offsetLeft + c.offsetWidth - el.clientWidth + 12; } };

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
  return (
    <div data-werkzeug-leiste>
      <p style={{ textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.62)", margin: "0 0 8px" }}>
        {bereich.uebersicht
          ? <button type="button" onClick={() => gehe({ ansicht: bereich.uebersicht })} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "inherit", textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: "rgba(255,255,255,0.3)" }}>{bereich.titel}</button>
          : bereich.titel}
        {` · Station ${sNr} von ${bereich.stationen.length} · `}<span style={{ color: C.flaggold }}>{station.titel}</span>
      </p>
      <div className="sek-menue" ref={scrollZuAktiv} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, paddingBottom: 4 }}>
        {station.werkzeuge.map((id) => {
          const w = werkzeug(id);
          const aktiv = w.id === wAktiv.id;
          return (
            <button key={id} type="button" onClick={() => gehe(w.ziel)} aria-current={aktiv ? "page" : undefined} className="sek-chip" title={w.name} style={chipStil(aktiv)}>
              <span className="titel-lang">{w.name}</span><span className="titel-kurz">{w.kurz}</span>
            </button>
          );
        })}
        {weiter && (
          <button type="button" onClick={() => gehe(weiter.ziel)} className="sek-chip" title={`Weiter zur Station ${sNr + 1}: ${naechste.titel}`}
            style={{ ...chipStil(false), border: "1px dashed rgba(237,187,0,0.6)", color: C.flaggold, background: "transparent" }}>
            <span className="titel-lang">{`Weiter: ${naechste.titel} ›`}</span><span className="titel-kurz">Weiter ›</span>
          </button>
        )}
      </div>
      {uebergabeHinweis(ansicht) && (
        <p data-uebergabe-hinweis style={{ textAlign: "center", fontSize: 12.5, color: C.flaggold, margin: "8px 0 0", fontWeight: 600 }}>
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
      {wAktiv.modi && (
        <div role="tablist" aria-label={`${wAktiv.name}: Ansicht wählen`} style={{ display: "flex", justifyContent: "center", margin: "10px auto 2px" }}>
          <div style={{ display: "inline-flex", padding: 3, borderRadius: 999, background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.18)" }}>
            {wAktiv.modi.map((m) => {
              const an = m.ansicht === ansicht;
              return (
                <button key={m.ansicht} type="button" role="tab" aria-selected={an} onClick={() => !an && gehe({ ansicht: m.ansicht })}
                  style={{ padding: "6px 14px", borderRadius: 999, border: "none", fontFamily: "inherit", fontSize: 12.5, fontWeight: an ? 700 : 500, cursor: an ? "default" : "pointer",
                    background: an ? C.weiss : "transparent", color: an ? C.seeTief : C.silberHell, whiteSpace: "nowrap" }}>
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Schlanke Kopfleiste für Trainingswerkzeuge (Handy zuerst) ----------
   Ersetzt auf diesen Seiten den großen Seitenkopf: eine einzige weiße Zeile mit
   ‹ Zurück (zur Übersicht des Bereichs), der Stations-Auswahl (die Werkzeuge der
   Station, „Weiter“ zur nächsten Station, Startseite) sowie Test und Menü.
   Alles, was früher als Überschrift, Bereichszeile und Chip-Leiste Platz brauchte,
   steckt in dieser Zeile bzw. im Aufklappfeld der Stations-Auswahl. */
export function KompaktKopf({ ansicht, gehe, menueOffen, onMenue, menue, testKnopf }) {
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
  if (!ort || !ort.station) return null;
  const { bereich, station, werkzeug: wAktiv, sNr } = ort;
  const naechste = bereich.stationen[sNr];
  const weiter = naechste ? werkzeug(naechste.werkzeuge[0]) : null;
  const rund = { height: 44, minWidth: 44, borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, cursor: "pointer",
    fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 };
  const zeile = (aktiv) => ({ display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 48, padding: "0 14px", border: "none", borderRadius: 12, textAlign: "left",
    fontFamily: "inherit", fontSize: 15.5, fontWeight: aktiv ? 700 : 500, cursor: "pointer", color: aktiv ? C.seeTief : C.tinte, background: aktiv ? "rgba(237,187,0,0.16)" : "transparent" });
  return (
    <div data-kompakt-kopf style={{ position: "sticky", top: 0, zIndex: 50, background: C.weiss, borderBottom: `1px solid ${C.linie}` }}>
      <div ref={wurzel} className="mx-auto" style={{ position: "relative", maxWidth: 620, height: 60, padding: "0 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <button type="button" onClick={() => gehe(bereich.uebersicht ? { ansicht: bereich.uebersicht } : { ansicht: "start" })} style={rund}
          aria-label={`Zurück zu ${bereich.titel}`} title={`Zurück zu ${bereich.titel}`}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" onClick={() => setAuf(!auf)} aria-expanded={auf} aria-haspopup="listbox"
          style={{ ...rund, flex: "1 1 auto", minWidth: 0, justifyContent: "space-between", gap: 8, padding: "0 16px", fontSize: 16.5, fontWeight: 700, color: C.seeTief,
            borderColor: auf ? C.flaggold : C.linie, background: auf ? "rgba(237,187,0,0.12)" : C.weiss }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{wAktiv.kurz || wAktiv.name}</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            style={{ flexShrink: 0, transform: auf ? "rotate(180deg)" : "none", transition: "transform .15s" }}><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {testKnopf}
        <button type="button" onClick={onMenue} aria-haspopup="dialog" aria-expanded={menueOffen} aria-label={menueOffen ? "Menü schließen" : "Menü mit allen Bereichen"} title="Menü"
          style={{ ...rund, borderColor: menueOffen ? C.flaggold : C.linie, background: menueOffen ? "rgba(237,187,0,0.12)" : C.weiss }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            {menueOffen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        {menueOffen && menue}
        {auf && (
          <div role="listbox" aria-label={`${bereich.titel}: Station ${sNr}`}
            style={{ position: "absolute", top: 58, left: 12, right: 12, zIndex: 51, background: C.weiss, borderRadius: 16, padding: 8,
              boxShadow: "0 14px 40px rgba(8,23,59,0.28)", border: `1px solid ${C.linie}` }}>
            <p style={{ margin: "6px 14px 6px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.grau }}>
              {bereich.titel}{` · Station ${sNr} von ${bereich.stationen.length} · `}<span style={{ color: C.goldDunkel || "#8A6A00" }}>{station.titel}</span>
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
            {weiter && (
              <button type="button" onClick={() => gehe(weiter.ziel)} style={{ ...zeile(false), color: C.see, fontWeight: 700, borderTop: `1px solid ${C.linie}`, borderRadius: 0, marginTop: 4 }}>
                {`Weiter: ${naechste.titel}`}<span aria-hidden="true">›</span>
              </button>
            )}
            <div style={{ borderTop: `1px solid ${C.linie}`, marginTop: 4, paddingTop: 4, display: "flex", gap: 4 }}>
              <button type="button" onClick={() => gehe(bereich.uebersicht ? { ansicht: bereich.uebersicht } : { ansicht: "start" })} style={{ ...zeile(false), fontSize: 14, color: C.grau, flex: 1 }}>{`‹ ${bereich.titel}`}</button>
              <button type="button" onClick={() => gehe({ ansicht: "start" })} style={{ ...zeile(false), fontSize: 14, color: C.grau, flex: 1 }}>Startseite</button>
            </div>
          </div>
        )}
      </div>
    </div>
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
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, lineHeight: 1.25 }}>{name}</span>
        {zeile && <span style={{ display: "block", fontSize: 12.5, fontWeight: 400, color: C.grau, lineHeight: 1.35, marginTop: 2 }}>{zeile}</span>}
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
      <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.grau, margin: "0 2px 8px" }}>{titel}</p>
      <div style={{ display: "grid", gap: 8 }}>{kinder}</div>
    </div>
  );
}
