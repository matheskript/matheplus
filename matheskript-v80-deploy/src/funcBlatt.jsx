/* ======================================================================
   funcBlatt.jsx – Aufgabenblatt zu einem QR-Code aus den Schulbüchern.
   Jeder gedruckte Code führt auf einen festen Kurzlink (pfade.js):
     /b1/25-1  → neue Aufgaben vom Typ „Band 1, Seite 25, Aufgabe 1“ mit Lösungen,
                 zum Ausdrucken (Drucken/als PDF speichern) oder im PDF zu bearbeiten
     /b1/s25   → Seitenübersicht: das Werkzeug aus dem „In der App“-Kasten (Ziel: /buecher/<band>/kaesten.json)
                 und alle Aufgabentypen der Seite als Knöpfe (für Seiten, auf denen kein Platz für einzelne Codes war)
   Öffentlich erreichbar (middleware.js), ohne Konto. Die Aufgaben kommen aus den
   Generatoren der Kurse (diffAufgaben.js, vekAufgaben.js); der Seed steht in der
   Adresse (?s=…), damit ein Blatt wiederholbar ist.
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";
import { MS } from "./mathText.jsx";
import { FunktionsBild } from "./ui3.jsx";
import { BUECHER, buchLink } from "./pfade.js";
import { springe } from "./sprung.js";

const BASIS = "mythosmathe.de";
const ANZAHL = [4, 6, 8, 10];

async function generator(band) {
  return band === 2 ? import("./vekAufgaben.js") : import("./diffAufgaben.js");
}
const seedAusAdresse = () => { try { const s = Number(new URLSearchParams(window.location.search).get("s")); return Number.isInteger(s) && s > 0 ? s : null; } catch (e) { return null; } };
const seedSetzen = (s) => { try { const u = new URL(window.location.href); u.searchParams.set("s", String(s)); window.history.replaceState({}, "", u.pathname + u.search); } catch (e) { /* ignorieren */ } };
const neuerSeed = () => Math.floor(Math.random() * 900000) + 100000;

const DRUCK_CSS = `
@media print {
  @page { size: A4; margin: 16mm 15mm 18mm 15mm; }
  body * { visibility: hidden !important; }
  #mm-blatt, #mm-blatt * { visibility: visible !important; }
  #mm-blatt { position: absolute !important; left: 0; top: 0; width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; }
  #mm-blatt .nur-bildschirm { display: none !important; }
  #mm-blatt .loesungen { page-break-before: always; break-before: page; }
  #mm-blatt .aufgabe { break-inside: avoid; }
  html, body { background: #fff !important; }
  #mm-blatt .aufgaben > .aufgabe { min-height: 37mm; }   /* Rechenraum auf dem Blatt – blanko, nie Karo */
  #mm-blatt .nur-druck { display: block !important; }
}
#mm-blatt .nur-druck { display: none; }
#mm-blatt .aufgabe-text .katex-display { margin: 6px 0; }
`;

export function BuchBlatt({ gehe, band = 1, seite, nr, kasten = false }) {
  const buch = BUECHER[band] || BUECHER[1];
  const [stand, setStand] = React.useState({ lade: true });
  const [seed, setSeed] = React.useState(() => seedAusAdresse() || neuerSeed());
  const [anzahl, setAnzahl] = React.useState(6);
  const [loesungen, setLoesungen] = React.useState(false);

  /* „In der App“-Kasten → Seitenübersicht: Werkzeug der Stunde + alle Aufgabentypen der Seite */
  React.useEffect(() => {
    if (!kasten) return;
    let aktiv = true;
    Promise.all([
      fetch(`/buecher/${buch.ordner}/kaesten.json`).then((r) => r.json()).catch(() => ({})),
      generator(band),
    ]).then(([k, G]) => {
      if (!aktiv) return;
      const typen = Object.keys(G.BUCH_TYPEN).filter((key) => key.startsWith(`${seite}-`)).map((key) => ({ nr: key.slice(String(seite).length + 1), titel: G.typTitel(G.BUCH_TYPEN[key]) }));
      setStand({ lade: false, werkzeug: k[String(seite)] || null, typen });
    }).catch(() => aktiv && setStand({ lade: false, fehler: "kasten" }));
    return () => { aktiv = false; };
  }, [kasten, seite, buch.ordner, band]);

  /* Aufgabenblatt: Typ und Aufgaben erzeugen */
  React.useEffect(() => {
    if (kasten) return;
    let aktiv = true;
    generator(band).then((G) => {
      if (!aktiv) return;
      const typ = G.typVon(seite, nr);
      if (!typ) { setStand({ lade: false, fehler: "typ" }); return; }
      const aufgaben = [], texte = new Set();
      for (let i = 0; i < anzahl; i++) {
        let a = null;
        for (let v = 0; v < 8 && !a; v++) {   // keine Aufgabe doppelt auf einem Blatt
          try { const k = G.neueAufgabe(typ, (seed * 7919 + i * 104729 + v * 1301) % 2147483647); if (!texte.has(k.text)) a = k; } catch (e) { a = null; }
        }
        if (a) { aufgaben.push(a); texte.add(a.text); }
      }
      setStand({ lade: false, typ, titel: G.typTitel(typ), aufgaben });
    }).catch(() => aktiv && setStand({ lade: false, fehler: "typ" }));
    return () => { aktiv = false; };
  }, [band, seite, nr, kasten, seed, anzahl]);

  React.useEffect(() => { if (!kasten) seedSetzen(seed); }, [seed, kasten]);

  const neu = () => { setSeed(neuerSeed()); springe("anker", () => document.getElementById("mm-blatt")?.scrollIntoView({ block: "start" })); };
  const drucken = () => { setLoesungen(true); setTimeout(() => { try { window.print(); } catch (e) { /* kein Druck */ } }, 150); };

  const kopfZeile = `${buch.titel} · Seite ${seite}${kasten ? "" : ` · Aufgabe ${nr}`}`;
  const link = `${BASIS}${kasten ? buchLink(band, seite) : buchLink(band, seite, nr)}`;

  if (kasten) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "26px 16px 60px" }}>
        <div style={{ background: C.seeTief, color: C.weiss, borderRadius: 18, padding: "18px 18px 16px" }}>
          <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold, margin: 0 }}>Aus dem Mythos-Mathe-Schulbuch</p>
          <h1 style={{ fontSize: 21, fontWeight: 800, margin: "6px 0 4px", lineHeight: 1.25 }}>{kopfZeile}</h1>
          <p style={{ fontSize: 13.5, color: "#C9D2DE", margin: 0 }}>Werkzeug der Stunde und neue Aufgaben zu jeder Nummer dieser Seite.</p>
        </div>
        {stand.lade ? <p role="status" style={{ color: C.grau, fontSize: 15, textAlign: "center", marginTop: 18 }}>Wird geladen …</p> : (
          <>
            {stand.werkzeug ? (
              <button type="button" onClick={() => gehe(stand.werkzeug)} style={{ ...knopf(true), width: "100%", marginTop: 16, minHeight: 52, fontSize: 16 }}>Werkzeug aus dem Kasten „In der App“ öffnen →</button>
            ) : <p style={{ color: C.grau, fontSize: 14, marginTop: 16 }}>Zu dieser Seite ist kein Werkzeug hinterlegt.</p>}
            {(stand.typen || []).length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: C.seeTief, margin: "0 0 8px" }}>Neue Aufgaben zum Ausdrucken – wie im Buch:</h2>
                <div style={{ display: "grid", gap: 8 }}>
                  {stand.typen.map((t) => (
                    <button key={t.nr} type="button" onClick={() => gehe({ ansicht: "blatt", band, seite, nr: t.nr })}
                      style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "12px 14px", fontFamily: "inherit", cursor: "pointer", color: C.tinte, fontSize: 15 }}>
                      <span style={{ display: "inline-flex", minWidth: 30, height: 30, padding: "0 6px", borderRadius: 15, background: C.seeTief, color: C.weiss, fontWeight: 800, fontSize: 13, alignItems: "center", justifyContent: "center" }}>{t.nr}</span>
                      <span>{t.titel}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p style={{ fontSize: 13, color: C.hellgrau, marginTop: 18, lineHeight: 1.5 }}>Interaktiv mit Eingabe und Rückmeldung üben: <button type="button" onClick={() => gehe({ ansicht: buch.kurs })} style={{ background: "none", border: "none", color: C.seeTief, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: 13, padding: 0 }}>im Kurs „{buch.titel}“ →</button></p>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "22px 16px 60px" }}>
      <style>{DRUCK_CSS}</style>

      {/* Steuerung (nicht im Druck) */}
      <div className="nur-bildschirm" style={{ background: C.seeTief, color: C.weiss, borderRadius: 18, padding: "18px 18px 16px", marginBottom: 18 }}>
        <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold, margin: 0 }}>Aus dem Mythos-Mathe-Schulbuch</p>
        <h1 style={{ fontSize: 21, fontWeight: 800, margin: "6px 0 4px", lineHeight: 1.25 }}>{stand.titel || kopfZeile}</h1>
        <p style={{ fontSize: 13.5, color: "#C9D2DE", margin: 0 }}>{kopfZeile}</p>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "11px 13px", margin: "14px 0 12px", fontSize: 14, lineHeight: 1.55 }}>
          <b style={{ color: C.flaggold }}>So lernst du am besten:</b> Drucke das Blatt aus und rechne mit Stift auf Papier – Schritt für Schritt, ohne Abkürzung.
          Die Lösungen stehen auf der zweiten Seite; erst vergleichen, wenn du fertig bist. Du kannst das PDF auch direkt am Tablet mit Stift bearbeiten.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <button type="button" onClick={drucken} disabled={stand.lade || !!stand.fehler} style={knopf(true)}>Drucken / als PDF speichern</button>
          <button type="button" onClick={neu} disabled={stand.lade || !!stand.fehler} style={knopf(false)}>↻ Neue Aufgaben</button>
          <button type="button" onClick={() => setLoesungen(!loesungen)} disabled={stand.lade || !!stand.fehler} style={knopf(false)} aria-pressed={loesungen}>{loesungen ? "Lösungen ausblenden" : "Lösungen anzeigen"}</button>
          <label style={{ fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>Aufgaben
            <select value={anzahl} onChange={(e) => setAnzahl(Number(e.target.value))} style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 700, borderRadius: 8, padding: "6px 8px", border: "none", background: C.weiss, color: C.seeTief }}>
              {ANZAHL.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <p style={{ fontSize: 12.5, color: "#C9D2DE", margin: "12px 0 0", lineHeight: 1.5 }}>
          Dieses Blatt: <span style={{ fontFamily: "ui-monospace, monospace" }}>{link}?s={seed}</span> – derselbe Link liefert dasselbe Blatt, „Neue Aufgaben“ ein anderes.
          Interaktiv mit Eingabe und Rückmeldung üben: <button type="button" onClick={() => gehe({ ansicht: buch.kurs })} style={{ background: "none", border: "none", color: C.flaggold, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, padding: 0 }}>im Kurs „{buch.titel}“ →</button>
        </p>
      </div>

      {stand.lade ? <p role="status" style={{ color: C.grau, fontSize: 15, textAlign: "center" }}>Aufgaben werden erzeugt …</p>
        : stand.fehler ? (
          <div style={{ background: C.sand, borderRadius: 16, padding: 18, color: C.tinte, fontSize: 15.5, lineHeight: 1.6 }}>
            Zu dieser Aufgabe gibt es keine automatischen Varianten (Begründen, Zeichnen, Beweisen). Üben kannst du sie im Kurs – dort stehen Aufgabe und Lösung aus dem Buch.
            <div><button type="button" onClick={() => gehe({ ansicht: buch.kurs })} style={{ ...knopf(true), marginTop: 12, color: C.seeTief }}>Zum Kurs „{buch.titel}“</button></div>
          </div>
        ) : (
          <div id="mm-blatt" style={{ background: C.weiss, borderRadius: 18, padding: "22px 20px", boxShadow: "0 2px 16px rgba(14,30,74,0.08)" }}>
            <BlattKopf titel={stand.titel} zeile={kopfZeile} link={link} seed={seed} />
            <ol className="aufgaben" style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
              {stand.aufgaben.map((a, i) => (
                <li key={a.id} className="aufgabe" style={{ display: "grid", gridTemplateColumns: "30px 1fr", gap: 10, padding: "12px 0", borderTop: i ? `1px solid ${C.linie}` : "none" }}>
                  <span style={{ display: "inline-flex", width: 26, height: 26, borderRadius: 13, background: C.seeTief, color: C.weiss, fontWeight: 800, fontSize: 13, alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                  <div className="aufgabe-text" style={{ fontSize: 15.5, lineHeight: 1.65, color: C.tinte }}>
                    <MS s={a.text} />
                    {a.skizze && <div style={{ maxWidth: 420, marginTop: 8 }}><FunktionsBild {...a.skizze} /></div>}
                    {a.tabelle && <Tabelle t={a.tabelle} />}
                  </div>
                </li>
              ))}
            </ol>
            <p className="nur-druck" style={{ fontSize: 11, color: C.hellgrau, margin: "18px 0 0", lineHeight: 1.5 }}>
              Rechne auf einem eigenen Blatt oder direkt hier. Neues Blatt mit anderen Zahlen: {link}
            </p>

            {loesungen && (
              <section className="loesungen" style={{ marginTop: 26, paddingTop: 18, borderTop: `2px solid ${C.seeTief}` }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: C.seeTief, margin: "0 0 4px" }}>Lösungen</h2>
                <p style={{ fontSize: 12.5, color: C.hellgrau, margin: "0 0 10px" }}>{stand.titel} · {kopfZeile} · Blatt {seed}</p>
                <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {stand.aufgaben.map((a, i) => (
                    <li key={a.id} className="aufgabe" style={{ display: "grid", gridTemplateColumns: "30px 1fr", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${C.linie}` : "none" }}>
                      <span style={{ fontWeight: 800, color: C.seeTief, fontSize: 14 }}>{i + 1}</span>
                      <ol style={{ margin: 0, paddingLeft: 18, fontSize: 14.5, lineHeight: 1.6, color: C.tinte }}>
                        {a.weg.map((z, j) => <li key={j} style={{ paddingLeft: 2 }}><MS s={z} /></li>)}
                      </ol>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        )}
    </div>
  );
}

function BlattKopf({ titel, zeile, link, seed }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, borderBottom: `2px solid ${C.seeTief}`, paddingBottom: 10, flexWrap: "wrap" }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.golddunkel, margin: 0 }}>Mythos Mathe · Aufgabenblatt</p>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: C.seeTief, margin: "3px 0 2px" }}>{titel}</h2>
        <p style={{ fontSize: 12.5, color: C.hellgrau, margin: 0 }}>{zeile} · Blatt {seed} · {link}</p>
      </div>
      <p style={{ fontSize: 12.5, color: C.hellgrau, margin: 0, whiteSpace: "nowrap" }}>Name: ____________________ &nbsp; Datum: __________</p>
    </div>
  );
}

function Tabelle({ t }) {
  return (
    <div style={{ overflowX: "auto", margin: "8px 0" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 14 }}>
        <thead><tr>{t.kopf.map((k, i) => <th key={i} style={{ padding: "5px 9px", border: `1px solid ${C.linie}`, background: C.sand, fontWeight: 700, textAlign: i ? "center" : "left", whiteSpace: "nowrap" }}>{k}</th>)}</tr></thead>
        <tbody>{t.zeilen.map((z, j) => <tr key={j}>{z.map((w, i) => <td key={i} style={{ padding: "5px 9px", border: `1px solid ${C.linie}`, textAlign: i ? "center" : "left", whiteSpace: "nowrap" }}>{w}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

const knopf = (gold) => ({
  minHeight: 42, borderRadius: 11, padding: "0 16px", fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, cursor: "pointer", border: gold ? "none" : "1.5px solid rgba(255,255,255,0.35)",
  background: gold ? C.flaggold : "transparent", color: gold ? C.seeTief : C.weiss,
});
