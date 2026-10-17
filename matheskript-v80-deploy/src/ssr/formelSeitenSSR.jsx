/* ======================================================================
   Öffentliche Formelseiten – serverseitiges Rendern beim Build
   Wird von scripts/formelseiten.mjs über `vite build --ssr` gebaut und
   liefert fertiges HTML (ohne JavaScript) für jede Formel der
   Formelsammlung: Formel, Kurzerklärung, Bild, Herleitung(en),
   Beispiel, typische Falle, Zusammenhänge. Gleiche Darstellung wie in
   der App (M, Text aus func3.jsx; Bilder aus funcFsBilder*.jsx).
   ====================================================================== */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { C } from "../base1.jsx";
import { M, Text } from "../func3.jsx";
import { FS_ALLE, FS_BEREICHE, FS_DARAUF, FS_NACH_ID, bereichVon, herleitungen } from "../fsIndex.js";
import { WERKZEUGE } from "../werkzeuge.js";
import { BILDER_1 } from "../funcFsBilder1.jsx";
import { BILDER_2 } from "../funcFsBilder2.jsx";
import { BILDER_3 } from "../funcFsBilder3.jsx";
import { BILDER_4 } from "../funcFsBilder4.jsx";
import { BILDER_5 } from "../funcFsBilder5.jsx";
import { BILDER_6 } from "../funcFsBilder6.jsx";
import { BILDER_7 } from "../funcFsBilder7.jsx";
import { BILDER_8 } from "../funcFsBilder8.jsx";

const BILDER = { ...BILDER_1, ...BILDER_2, ...BILDER_3, ...BILDER_4, ...BILDER_5, ...BILDER_6, ...BILDER_7, ...BILDER_8 };
const STUFEN_NAME = { mittel: "Mittelstufe", ober: "Oberstufe", beide: "Mittel- und Oberstufe" };
export const FARBEN = C;

const kicker = { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, margin: "0 0 10px" };
const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 14px rgba(15,26,51,0.07)" };
const marke = (farbe, grund) => ({ display: "inline-flex", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", padding: "3px 8px", borderRadius: 999, background: grund, color: farbe });

/* Ein Schritt: Text mit $…$ oder abgesetzte Formel "$$… || Notiz" */
function Schritt({ s, nr }) {
  const formel = s.startsWith("$$");
  const [tex, notiz] = formel ? s.slice(2).split(" || ") : [null, null];
  return (
    <li style={{ display: "flex", gap: 12, listStyle: "none" }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 24, height: 24, marginTop: formel ? 8 : 1, borderRadius: 999, background: formel ? C.himmel : C.sand,
        color: formel ? C.see : C.gruenDunkel, fontSize: 11.5, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{nr}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        {formel ? (
          <div style={{ background: "#F7F9FD", borderRadius: 12, padding: "8px 12px" }}>
            <div style={{ fontSize: 16.5, lineHeight: 2.05, color: C.tinte, overflowX: "auto" }}><M t={tex} /></div>
            {notiz && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.grau, fontWeight: 500 }}>{notiz}</p>}
          </div>
        ) : <Text s={s} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: C.tinte }} />}
      </div>
    </li>
  );
}

const link = (e) => `/formeln/${e.id}/`;

function Verweise({ titel, liste }) {
  if (!liste.length) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: C.grau }}>{titel}</p>
      <ul style={{ margin: 0, padding: 0, display: "grid", gap: 6 }}>
        {liste.map(([id, wie]) => {
          const z = FS_NACH_ID[id];
          if (!z) return null;
          return (
            <li key={id} style={{ listStyle: "none" }}>
              <a href={link(z)} style={{ display: "block", padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.linie}`, background: C.weiss, color: C.tinte, textDecoration: "none" }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.see }}>{z.n}</span>
                {wie && <span style={{ display: "block", fontSize: 12.5, color: C.grau, marginTop: 2 }}>{wie}</span>}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Detail({ e, vor, nach }) {
  const b = bereichVon(e.bereich);
  const Bild = e.bild ? BILDER[e.bild[0]] : null;
  let bild = null;
  if (Bild) { try { bild = Bild(e.bild[1] || {}); } catch (err) { bild = null; } }
  const hs = herleitungen(e);
  const wz = e.wz && WERKZEUGE[e.wz];
  return (
    <article>
      <nav aria-label="Brotkrümel" style={{ fontSize: 12.5, fontWeight: 600, color: C.hellgrau, margin: "0 0 6px" }}>
        <a href="/formeln/" style={{ color: C.see, textDecoration: "none" }}>Formelsammlung</a> · <a href={`/formeln/#${b.id}`} style={{ color: C.see, textDecoration: "none" }}>{b.name}</a> · {e.g}
      </nav>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, color: C.tinte }}>{e.n}</h1>
      <div style={{ marginTop: 16, borderRadius: 20, padding: "20px 18px 16px", background: `linear-gradient(160deg, ${C.weiss} 0%, ${C.himmel} 100%)`, boxShadow: "0 2px 16px rgba(15,26,51,0.08)", border: `1px solid ${C.linie}` }}>
        <div style={{ fontSize: 22, lineHeight: 2, color: C.tinte, overflowX: "auto" }}><M t={e.f} /></div>
        <p style={{ margin: "8px 0 0", fontSize: 14.5, color: C.grau, lineHeight: 1.6 }}>{e.k}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          <span style={marke(C.see, C.himmel)}>{STUFEN_NAME[e.st] || "Schule"}</span>
          {hs.length > 0 && <span style={marke(C.gruenDunkel, "#FFF6DA")}>{hs.length > 1 ? `${hs.length} Beweise` : "Herleitung"}</span>}
        </div>
      </div>

      {bild && (
        <section style={{ marginTop: 26 }}>
          <h2 style={kicker}>Im Bild</h2>
          <div className="bild" style={{ ...karte, padding: "14px 14px 12px" }}>{bild}</div>
          <p style={{ fontSize: 12.5, color: C.hellgrau, margin: "6px 2px 0" }}>In der App lässt sich das Bild mit Reglern verändern.</p>
        </section>
      )}

      {hs.map((h, i) => (
        <section key={i} style={{ marginTop: 26 }}>
          <h2 style={kicker}>{hs.length > 1 ? `Warum gilt das? · Weg ${i + 1} von ${hs.length}` : "Warum gilt das?"}</h2>
          <div style={{ ...karte, padding: "16px 16px 14px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15.5, fontWeight: 700, color: C.tinte }}>{h.t}</h3>
            <ol style={{ margin: 0, padding: 0, display: "grid", gap: 12 }}>{h.s.map((s, k) => <Schritt key={k} s={s} nr={k + 1} />)}</ol>
          </div>
        </section>
      ))}

      {e.bsp && e.bsp.length > 0 && (
        <section style={{ marginTop: 26 }}>
          <h2 style={kicker}>Beispiel</h2>
          <div style={{ ...karte, padding: 16, display: "grid", gap: 10 }}>
            {e.bsp.map((s, i) => (s.startsWith("$$")
              ? <div key={i} style={{ fontSize: 16.5, lineHeight: 2, overflowX: "auto", color: C.tinte }}><M t={s.slice(2).split(" || ")[0]} /></div>
              : <Text key={i} s={s} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: C.tinte }} />))}
          </div>
        </section>
      )}

      {e.falle && (
        <section style={{ marginTop: 26 }}>
          <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: 16, background: "#FDF1F5", border: "1px solid #F3D3DF" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, background: "#C2557A", color: C.weiss, fontWeight: 800, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>!</span>
            <div>
              <h2 style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: "#9C3A5E" }}>Vorsicht, Falle</h2>
              <Text s={e.falle} style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: C.tinte }} />
            </div>
          </div>
        </section>
      )}

      {((e.nutzt || []).length > 0 || (FS_DARAUF[e.id] || []).length > 0) && (
        <section style={{ marginTop: 26 }}>
          <h2 style={kicker}>Zusammenhänge</h2>
          <Verweise titel="Baut auf auf" liste={e.nutzt || []} />
          <Verweise titel="Darauf baut auf" liste={FS_DARAUF[e.id] || []} />
        </section>
      )}

      <section style={{ marginTop: 30, borderRadius: 20, padding: "20px 18px", background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>Selbst ausprobieren</h2>
        <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.6, color: "#C9D6EE" }}>
          {wz ? `Im Werkzeug „${wz.name}“ übst du das mit immer neuen Aufgaben – die App prüft jeden Schritt.` : "In der App: Bild mit Reglern, Herleitung Schritt für Schritt und passende Übungen."}
        </p>
        <a href={`/?formel=${e.id}`} style={{ display: "inline-block", padding: "12px 20px", borderRadius: 999, background: C.flaggold, color: C.seeTief, fontWeight: 800, fontSize: 15, textDecoration: "none" }}>In der App öffnen</a>
      </section>

      {(vor || nach) && (
        <nav aria-label="Weitere Formeln" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 26 }}>
          {[vor, nach].map((n, i) => (n ? (
            <a key={i} href={link(n)} style={{ display: "block", padding: "11px 13px", borderRadius: 14, border: `1px solid ${C.linie}`, background: C.weiss, textAlign: i ? "right" : "left", textDecoration: "none" }}>
              <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: C.hellgrau }}>{i ? "Nächste ›" : "‹ Vorige"}</span>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{n.n}</span>
            </a>
          ) : <span key={i} />))}
        </nav>
      )}
    </article>
  );
}

function Uebersicht() {
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: C.tinte }}>Formelsammlung</h1>
      <p style={{ fontSize: 15, color: C.grau, lineHeight: 1.7, margin: "10px 0 0" }}>
        {FS_ALLE.length} Formeln von der Mittelstufe bis zum Abitur – jede mit Herleitung, Beispiel und den typischen Fehlern.
      </p>
      {FS_BEREICHE.map((b) => {
        const liste = FS_ALLE.filter((e) => e.bereich === b.id);
        if (!liste.length) return null;
        return (
          <section key={b.id} id={b.id} style={{ marginTop: 30 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 21, fontWeight: 700, color: C.tinte }}>{b.name}</h2>
            <p style={{ margin: "0 0 12px", fontSize: 13.5, color: C.grau }}>{b.zeile}</p>
            <ul style={{ margin: 0, padding: 0, display: "grid", gap: 8 }}>
              {liste.map((e) => (
                <li key={e.id} style={{ listStyle: "none" }}>
                  <a href={link(e)} style={{ ...karte, display: "block", padding: "12px 16px 10px", textDecoration: "none", color: C.tinte }}>
                    <span style={{ display: "block", fontSize: 14.5, fontWeight: 700 }}>{e.n}</span>
                    <span style={{ display: "block", fontSize: 16, lineHeight: 2, overflowX: "auto" }}><M t={e.f} /></span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/* Reiner Text einer Formel für Titel und Beschreibung */
export const textVon = (s) => String(s || "").replace(/\$\$?/g, "").replace(/\\[a-zA-Z]+/g, " ").replace(/[{}^_]/g, "").replace(/\s+/g, " ").trim();

export function seiten() {
  const liste = FS_ALLE;
  return [
    { pfad: "formeln/index.html", url: "/formeln/", titel: "Formelsammlung Mathe – Mittelstufe bis Abitur | Mythos Mathe",
      beschreibung: `${liste.length} Mathe-Formeln mit Herleitung, Beispiel und typischen Fehlern: Analysis, Vektoren, Stochastik, Geometrie, Terme.`,
      html: renderToStaticMarkup(<Uebersicht />) },
    ...liste.map((e, i) => ({
      pfad: `formeln/${e.id}/index.html`, url: link(e), id: e.id,
      titel: `${e.n} – Formel, Herleitung und Beispiel | Mythos Mathe`,
      beschreibung: `${e.n}: ${textVon(e.k)}.${herleitungen(e).length ? " Mit Herleitung Schritt für Schritt" : ""}${e.bsp && e.bsp.length ? " und Beispiel." : "."}`.replace(/\.\./g, "."),
      bereich: bereichVon(e.bereich).name,
      html: renderToStaticMarkup(<Detail e={e} vor={liste[i - 1] && liste[i - 1].bereich === e.bereich ? liste[i - 1] : null} nach={liste[i + 1] && liste[i + 1].bereich === e.bereich ? liste[i + 1] : null} />),
    })),
  ];
}
