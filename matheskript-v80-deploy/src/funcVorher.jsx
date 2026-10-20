import React, { useEffect, useRef, useState } from "react";

/* ======================================================================
   VORHER-ARCHIV  (Ansicht "entwurf-vorher", hinter dem Entwurfs-Passwort)
   Eingefrorene Kopien der kompletten App. Jede Kopie ist ein fertiger
   Build unter public/archiv/<datum>/ und ändert sich nie mehr – egal,
   was danach an der App gebaut wird. Angezeigt wird sie hier in einem
   Rahmen, wahlweise als Desktop (1280 px) oder Handy (390 px).

   Neue Kopie anlegen (z. B. vor einem größeren Umbau):
     npx vite build --base=/archiv/JJJJ-MM-TT/ --outDir public/archiv/JJJJ-MM-TT
   (vorher sicherstellen, dass public/archiv nicht mit hineinkopiert wird:
   Ordner kurz wegschieben oder danach public/archiv/JJJJ-MM-TT/archiv löschen)
   und unten in STAENDE eintragen.
   ====================================================================== */

/* Eigene Schulbücher – ganz oben auf dieser Seite zum Öffnen.
   bereit: false → Knopf zeigt „in Arbeit“ und ist nicht klickbar. */
export const BUECHER = [
  { id: "ableitungen", titel: "Differentialrechnung", zeile: "Band 1 · Ableitungen", lesen: "/buecher/ableitungen/index.html", pdf: "/buecher/ableitungen/Ableitungen.pdf", bereit: true },
  { id: "vektoren", titel: "Vektoren, Geraden und Ebenen", zeile: "Band 2 · Analytische Geometrie", lesen: "/buecher/vektoren/index.html", pdf: "/buecher/vektoren/Vektoren.pdf", bereit: true },
  { id: "kurvendiskussion", titel: "Kurvendiskussion", zeile: "Band 3 · Probekapitel Extrempunkte", lesen: "/buecher/kurvendiskussion/index.html", pdf: "/buecher/kurvendiskussion/Kurvendiskussion.pdf", bereit: true },
];

function BuchKnopf({ b }) {
  const basis = { display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 14, textDecoration: "none", fontFamily: "inherit", minWidth: 0 };
  const symbol = (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
    </svg>
  );
  if (!b.bereit) {
    return (
      <div aria-disabled="true" style={{ ...basis, border: "1.5px dashed rgba(255,255,255,0.3)", color: BLAU_TXT, cursor: "default" }}>
        {symbol}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{b.titel}</div>
          <div style={{ fontSize: 13, marginTop: 2 }}>{b.zeile} · in Arbeit</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <a href={b.lesen} target="_blank" rel="noopener" data-buch={b.id} style={{ ...basis, background: GOLD, color: N }}>
        {symbol}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{b.titel}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{b.zeile} · ganzes Buch öffnen ↗</div>
        </div>
      </a>
      <a href={b.pdf} target="_blank" rel="noopener" style={{ color: BLAU_TXT, fontSize: 13, fontWeight: 600, paddingLeft: 4 }}>PDF öffnen ↗</a>
    </div>
  );
}

export const STAENDE = [
  { id: "2026-10-17", titel: "17. Oktober 2026", notiz: "Stand vor der Max-Version", pfad: "/archiv/2026-10-17/index.html" },
];
/* Biro-Edition: eigene Seite (Ansicht "entwurf-biro"), gleiche Ansicht ohne Schulbücher */
export const STAENDE_BIRO = [
  { id: "2026-10-20", titel: "20. Oktober 2026", notiz: "Biro-Edition", pfad: "/archiv/2026-10-20/index.html" },
];

const N = "#0B1E4A";
const N2 = "#08173B";
const GOLD = "#F5B820";
const BLAU_TXT = "#C9D6EE";
const GERAETE = {
  desktop: { b: 1280, h: 800, name: "Desktop" },
  mobil: { b: 390, h: 844, name: "Mobil" },
};

function useBreite(ref) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const mess = () => setW(el.clientWidth);
    mess();
    let ro;
    try { ro = new ResizeObserver(mess); ro.observe(el); } catch (e) { window.addEventListener("resize", mess); }
    return () => { if (ro) ro.disconnect(); else window.removeEventListener("resize", mess); };
  }, [ref]);
  return w;
}

function Umschalter({ wert, setWert }) {
  return (
    <div role="tablist" aria-label="Ansicht" style={{ display: "inline-flex", padding: 4, borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }}>
      {Object.entries(GERAETE).map(([k, g]) => {
        const an = wert === k;
        return (
          <button key={k} type="button" role="tab" aria-selected={an} onClick={() => setWert(k)}
            style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, padding: "8px 18px", borderRadius: 999,
              background: an ? GOLD : "transparent", color: an ? N : "#fff", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {k === "desktop" ? <><rect x="3" y="4" width="18" height="12" rx="1.6" /><path d="M8 20h8M12 16v4" /></> : <><rect x="7" y="2.5" width="10" height="19" rx="2.2" /><path d="M11 18.5h2" /></>}
            </svg>
            {g.name}
          </button>
        );
      })}
    </div>
  );
}

export function EntwurfBiro() {
  return <EntwurfVorher staende={STAENDE_BIRO} buecher={false} />;
}

export function EntwurfVorher({ staende = STAENDE, buecher = true }) {
  const [stand, setStand] = useState(staende[0]);
  const [geraet, setGeraet] = useState(() => (typeof window !== "undefined" && window.innerWidth < 700 ? "mobil" : "desktop"));
  const buehne = useRef(null);
  const w = useBreite(buehne);
  const g = GERAETE[geraet];
  const mobil = geraet === "mobil";
  // Platz in der Bühne: bei Mobil kommt der Handyrahmen (2 × 12 px) dazu
  const rahmen = mobil ? 24 : 0;
  const verfuegbar = Math.max(0, w - rahmen);
  const hoehe = typeof window !== "undefined" ? window.innerHeight : 900;
  const maxH = mobil ? Math.max(480, hoehe - 210) : Infinity;
  const skala = w ? Math.min(1, verfuegbar / g.b, mobil ? maxH / g.h : 1) : 1;
  // Desktop füllt die Fensterhöhe; Mobil hat das echte Handyformat
  const innenH = mobil ? g.h : Math.max(g.h, Math.round((hoehe - 200) / skala));

  return (
    <div style={{ minHeight: "calc(100vh - var(--kopf-h, 56px))", background: `radial-gradient(120% 70% at 80% 0%, #17306B 0%, ${N} 45%, ${N2} 100%)`,
      color: "#fff", fontFamily: "Montserrat, system-ui, sans-serif", padding: "28px 16px 40px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {buecher && (<>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.16em", color: GOLD }}>SCHULBÜCHER</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, margin: "12px 0 36px" }}>
          {BUECHER.map((b) => <BuchKnopf key={b.id} b={b} />)}
        </div>
        </>)}

        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.16em", color: GOLD }}>{stand.id === "2026-10-20" ? "ARCHIV · BIRO-EDITION" : "ARCHIV · VORHER"}</div>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 34px)", fontWeight: 800, letterSpacing: "-0.02em", margin: "8px 0 6px" }}>So sah die Website aus</h1>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: BLAU_TXT, margin: 0, maxWidth: 640 }}>
          Eingefrorene Kopie vom <b style={{ color: "#fff" }}>{stand.titel}</b> ({stand.notiz}). Sie ist voll bedienbar und bleibt unverändert, egal was danach gebaut wird.
        </p>

        {staende.length > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {staende.map((s) => (
              <button key={s.id} type="button" onClick={() => setStand(s)}
                style={{ border: `1.5px solid ${s.id === stand.id ? GOLD : "rgba(255,255,255,0.25)"}`, background: "transparent", color: "#fff", borderRadius: 999,
                  padding: "6px 14px", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>{s.titel}</button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "20px 0 18px" }}>
          <Umschalter wert={geraet} setWert={setGeraet} />
          <a href={stand.pfad} target="_blank" rel="noopener" style={{ color: BLAU_TXT, fontSize: 14, fontWeight: 600, textDecoration: "underline" }}>
            In neuem Tab öffnen ↗
          </a>
        </div>

        <div ref={buehne} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          {w > 0 && (
            <div style={{
              width: Math.round(g.b * skala) + rahmen, height: Math.round(innenH * skala) + rahmen, flexShrink: 0,
              padding: mobil ? 12 : 0, boxSizing: "border-box",
              borderRadius: mobil ? 44 : 12, background: mobil ? "#05102B" : "#fff",
              border: mobil ? "1px solid rgba(255,255,255,0.22)" : "none",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)", overflow: "hidden",
            }}>
              <div style={{ width: Math.round(g.b * skala), height: Math.round(innenH * skala), overflow: "hidden", borderRadius: mobil ? 32 : 12, background: "#fff" }}>
                <iframe key={stand.id + geraet} src={stand.pfad} title={`Website am ${stand.titel} – ${g.name}`}
                  style={{ width: g.b, height: innenH, border: "none", display: "block", transform: `scale(${skala})`, transformOrigin: "0 0" }} />
              </div>
            </div>
          )}
        </div>
        <p style={{ fontSize: 12.5, color: BLAU_TXT, textAlign: "center", margin: "14px 0 0" }}>
          {g.name}-Ansicht in {g.b} px Breite{skala < 1 ? `, verkleinert auf ${Math.round(skala * 100)} %` : ""}.
        </p>
      </div>
    </div>
  );
}
