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
import React from "react";
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
