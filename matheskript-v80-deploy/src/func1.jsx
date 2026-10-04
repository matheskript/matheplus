import React, { useState, useRef } from "react";
import { API_URL, C, DEMO, GRENZE, KAUF_LINKS, KURSE, MODULE, M_AUSWAHL, ganz, videoZeit } from "./base1.jsx";
import { MODUL_KATALOG } from "./base2.jsx";
import { aktiv } from "./base3.jsx";
import { kiKopf, kiAntwort } from "./base4.jsx";
import { LernModul, RechenwegEditor } from "./func3.jsx";
import { GraphZuordnung, Klausur, Kurvendiskussion } from "./func4.jsx";
import { intervall } from "./func8.jsx";
import { VideokursPlayer, VideokursVorschau, naechsteLektion, videoAnzahl } from "./func15.jsx";
import { AufklappZeichen } from "./aufklappen.jsx";

export function useYouTubeApi() {
  const [bereit, setBereit] = useState(() => typeof window !== "undefined" && !!(window.YT && window.YT.Player));
  React.useEffect(() => {
    if (bereit || typeof window === "undefined") return;
    if (window.YT && window.YT.Player) { setBereit(true); return; }
    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    const vorher = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { setBereit(true); if (vorher) vorher(); };
  }, [bereit]);
  return bereit;
}


export function ErklaerVideo({ id, titel }) {
  const bereit = useYouTubeApi();
  const [domId] = useState(() => `yt-${Math.random().toString(36).slice(2)}`);
  const spielerRef = useRef(null);
  const [spielt, setSpielt] = useState(false);
  const [aktuell, setAktuell] = useState(0);
  const [dauer, setDauer] = useState(0);
  const [gezogen, setGezogen] = useState(false);

  React.useEffect(() => {
    if (!bereit || !id) return;
    let aktiv = true;
    spielerRef.current = new window.YT.Player(domId, {
      videoId: id,
      playerVars: { controls: 0, modestbranding: 1, rel: 0, fs: 0, iv_load_policy: 3, cc_load_policy: 0, disablekb: 1, playsinline: 1 },
      events: {
        onReady: (e) => { if (aktiv) setDauer(e.target.getDuration() || 0); },
        onStateChange: (e) => { if (!aktiv) return; setSpielt(e.data === 1); if (e.data === 1) setDauer(e.target.getDuration() || 0); },
      },
    });
    const intervall = setInterval(() => {
      const p = spielerRef.current;
      if (p && p.getCurrentTime && !gezogen) setAktuell(p.getCurrentTime() || 0);
    }, 400);
    return () => { aktiv = false; clearInterval(intervall); try { spielerRef.current && spielerRef.current.destroy(); } catch (e) { /* schon weg */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bereit, id]);

  if (!id) return null;

  const umschalten = () => {
    const p = spielerRef.current;
    if (!p) return;
    if (spielt) p.pauseVideo(); else p.playVideo();
  };
  const springen = (wert) => {
    setAktuell(wert);
    if (spielerRef.current) spielerRef.current.seekTo(wert, true);
  };

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 20, background: C.seeTief, boxShadow: "0 3px 18px rgba(15,26,51,0.1)" }}>
      <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000" }}>
        <div id={domId} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        <button onClick={umschalten} aria-label={spielt ? "Pause" : "Abspielen"}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "transparent", border: "none", cursor: "pointer", padding: 0 }} />
        {!spielt && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ width: 60, height: 60, borderRadius: 999, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="24" viewBox="0 0 20 24"><path d="M0 0 L20 12 L0 24 Z" fill={C.weiss} /></svg>
            </div>
          </div>
        )}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "8px 12px 10px",
          background: "linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)",
          display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={umschalten} aria-label={spielt ? "Pause" : "Abspielen"}
            style={{ width: 24, height: 24, flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
            {spielt
              ? <svg width="13" height="15" viewBox="0 0 13 15"><rect width="4" height="15" fill={C.weiss} /><rect x="9" width="4" height="15" fill={C.weiss} /></svg>
              : <svg width="13" height="15" viewBox="0 0 13 15"><path d="M0 0 L13 7.5 L0 15 Z" fill={C.weiss} /></svg>}
          </button>
          <span style={{ fontSize: 11, color: C.weiss, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{videoZeit(aktuell)}</span>
          <input type="range" min={0} max={dauer || 0} step={0.5} value={Math.min(aktuell, dauer || 0)}
            onMouseDown={() => setGezogen(true)} onTouchStart={() => setGezogen(true)}
            onChange={(e) => springen(Number(e.target.value))}
            onMouseUp={() => setGezogen(false)} onTouchEnd={() => setGezogen(false)}
            style={{ flex: 1, accentColor: C.gruen, height: 4 }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{videoZeit(dauer)}</span>
        </div>
      </div>
      {titel && (
        <div className="flex items-center justify-between" style={{ padding: "10px 14px" }}>
          <p style={{ fontSize: 12.5, color: "#C9D6EE", fontWeight: 300, margin: 0 }}>{titel} · Demo</p>
          <a href={`https://youtu.be/${id}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: C.gruen, fontWeight: 600, textDecoration: "underline", whiteSpace: "nowrap", marginLeft: 12 }}>
            in neuem Tab öffnen
          </a>
        </div>
      )}
    </div>
  );
}

/* ---------- JSON robust einlesen ---------- */


export function jsonLesen(raw) {
  let t = raw.replace(/```json|```/g, "").trim();
  const start = t.indexOf("{");
  if (start > 0) t = t.slice(start);
  try {
    return JSON.parse(t);
  } catch (e) {
    let depth = 0, inStr = false, esc = false, cut = -1;
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      if (esc) { esc = false; continue; }
      if (ch === "\\") { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === "{" || ch === "[") depth++;
      if (ch === "}" || ch === "]") { depth--; if (depth === 0) cut = i; }
    }
    if (cut > 0) return JSON.parse(t.slice(0, cut + 1));
    throw new Error("Die Antwort kam unvollständig zurück. Versuch es noch einmal.");
  }
}

/* ---------- Bild: mehrstufige Dekodierung ---------- */


export function scriptLaden(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => res();
    s.onerror = () => rej(new Error("CDN nicht erreichbar"));
    document.head.appendChild(s);
  });
}


export function viaImgTag(blob) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Browser kann das Format nicht öffnen")); };
    img.src = url;
  });
}

export async function dekodieren(file, melden) {
  // Stufe 1: nativer Decoder inkl. EXIF-Drehung (Safari kann hier auch HEIC)
  if (typeof createImageBitmap === "function") {
    try {
      const bm = await createImageBitmap(file, { imageOrientation: "from-image" });
      melden("nativ dekodiert");
      return bm;
    } catch (e) { /* weiter */ }
  }
  // Stufe 2: klassisches img-Element
  try {
    const img = await viaImgTag(file);
    melden("über Bild-Element geladen");
    return img;
  } catch (e) { /* weiter */ }
  // Stufe 3: HEIC/HEIF nachträglich umwandeln
  try {
    melden("HEIC wird umgewandelt…");
    await scriptLaden("https://cdnjs.cloudflare.com/ajax/libs/heic2any/0.0.4/heic2any.min.js");
    const out = await window.heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    const jpg = Array.isArray(out) ? out[0] : out;
    try {
      const bm = await createImageBitmap(jpg);
      melden("HEIC umgewandelt");
      return bm;
    } catch (e2) {
      const img = await viaImgTag(jpg);
      melden("HEIC umgewandelt");
      return img;
    }
  } catch (e) { /* weiter */ }

  throw new Error("Dieses Foto lässt sich im Browser nicht öffnen. Mach ersatzweise einen Screenshot des Bildes und lade den hoch – das funktioniert immer.");
}


export function rendern(quelle, drehung) {
  const bw = quelle.width || quelle.naturalWidth;
  const bh = quelle.height || quelle.naturalHeight;
  let kante = 1700;
  let qualitaet = 0.85;

  for (let versuch = 0; versuch < 6; versuch++) {
    let w = bw, h = bh;
    if (Math.max(w, h) > kante) {
      const s = kante / Math.max(w, h);
      w = Math.round(w * s); h = Math.round(h * s);
    }
    const quer = drehung === 90 || drehung === 270;
    const cv = document.createElement("canvas");
    cv.width = quer ? h : w;
    cv.height = quer ? w : h;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.rotate((drehung * Math.PI) / 180);
    ctx.drawImage(quelle, -w / 2, -h / 2, w, h);

    const dataUrl = cv.toDataURL("image/jpeg", qualitaet);
    const bytes = dataUrl.length * 0.75;
    if (bytes < GRENZE || versuch === 5) {
      return { b64: dataUrl.split(",")[1], vorschau: dataUrl, w: cv.width, h: cv.height, kb: Math.round(bytes / 1024) };
    }
    kante = Math.round(kante * 0.78);
    qualitaet = Math.max(0.6, qualitaet - 0.07);
  }
}

/* In der Claude-Vorschau geht der Aufruf direkt an die API. Überall sonst (Vercel, Wix)
   läuft er über /api/claude — dort liegt der Schlüssel sicher auf dem Server. */

export function Trainingsbereich({ sprung, setSprung, ziel, setZiel }) {
  const [offenesModul, setOffenesModul] = useState(null);
  const nurModule = ziel === "module";
  const setWegOffen = (v) => setZiel(v ? "weg" : null);
  const setKdOffen = (v) => setZiel(v ? "kd" : null);
  const setGzOffen = (v) => setZiel(v ? "gz" : null);
  const setKlausurOffen = (v) => setZiel(v ? "klausur" : null);
  const wegOffen = ziel === "weg", kdOffen = ziel === "kd";
  const gzOffen = ziel === "gz", klausurOffen = ziel === "klausur";
  const [modulId, setModulId] = useState(null);
  const [phase, setPhase] = useState("einleitung");
  const [index, setIndex] = useState(0);
  const [gewaehlt, setGewaehlt] = useState(null);
  const [treffer, setTreffer] = useState(0);

  const modul = MODULE.find((m) => m.id === modulId);

  const starten = (id) => { setModulId(id); setPhase("einleitung"); setIndex(0); setGewaehlt(null); setTreffer(0); };
  const zurueck = () => setModulId(null);

  const antworten = (i) => {
    if (gewaehlt !== null) return;
    setGewaehlt(i);
    if (i === modul.aufgaben[index].richtig) setTreffer((t) => t + 1);
  };

  const weiter = () => {
    if (index + 1 < modul.aufgaben.length) { setIndex(index + 1); setGewaehlt(null); }
    else setPhase("fertig");
  };

  const direktModul = ziel && ziel.startsWith("modul:") ? MODUL_KATALOG.find((m) => m.id === ziel.slice(6)) : null;
  const modulAuf = sprung ? MODUL_KATALOG.find((m) => m.id === "ableitung") : direktModul || offenesModul;
  if (modulAuf) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <LernModul modul={modulAuf} startKapitel={sprung}
          onZurueck={() => { setOffenesModul(null); setSprung(null); if (direktModul) setZiel("module"); }} />
      </div>
    );
  }

  if (klausurOffen) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <Klausur onZurueck={() => setKlausurOffen(false)} />
      </div>
    );
  }

  if (wegOffen) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <RechenwegEditor onZurueck={() => setWegOffen(false)} />
      </div>
    );
  }

  if (kdOffen) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <Kurvendiskussion onZurueck={() => setKdOffen(false)} />
      </div>
    );
  }

  if (gzOffen) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <GraphZuordnung onZurueck={() => setGzOffen(false)} />
      </div>
    );
  }

  if (!modul) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
          Erst das Prinzip, dann die Aufgaben
        </h2>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 26 }}>
          Jedes Modul stellt dir zuerst das Thema vor. Danach arbeitest du dich durch die Aufgaben,
          eine nach der anderen, mit sofortiger Begründung zu jeder Antwort.
        </p>

        {!nurModule && (<>
        <button onClick={() => setKlausurOffen(true)} className="w-full px-5 py-5 mb-3"
          style={{ background: `linear-gradient(160deg, ${C.seeTief} 0%, #061233 100%)`, border: "none", borderRadius: 16, textAlign: "left", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 18px rgba(0,0,0,0.24)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.gruen, marginBottom: 6 }}>Werkzeug · mit Uhr</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: C.weiss, marginBottom: 4 }}>Klausurgenerator</p>
          <p style={{ color: "#C9D6EE", fontSize: 13, fontWeight: 300, lineHeight: 1.55 }}>
            Drei Aufgaben im Abiturformat, neu erzeugt, ohne Rückmeldung bis zur Abgabe.
          </p>
        </button>

        <button onClick={() => setKdOffen(true)} className="w-full px-5 py-5 mb-3"
          style={{ background: `linear-gradient(160deg, ${C.gruenDunkel} 0%, #5E0026 100%)`, border: "none", borderRadius: 16, textAlign: "left", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 18px rgba(127,0,52,0.22)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.gruen, marginBottom: 6 }}>Werkzeug · 12 Schritte</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: C.weiss, marginBottom: 4 }}>Kurvendiskussion</p>
          <p style={{ color: "#F3C6D8", fontSize: 13, fontWeight: 300, lineHeight: 1.55 }}>
            Das Protokoll geführt durchlaufen, an immer neuen Funktionen. Jeder Schritt wird geprüft.
          </p>
        </button>

        <button onClick={() => setGzOffen(true)} className="w-full px-5 py-5 mb-3"
          style={{ background: C.weiss, border: `1.5px solid ${C.see}`, borderRadius: 16, textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: C.tinte }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.see, marginBottom: 6 }}>Werkzeug</p>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Graph-Zuordnung</p>
          <p style={{ color: C.grau, fontSize: 13, fontWeight: 300, lineHeight: 1.55 }}>
            Welcher der vier Graphen ist f′? Kein Rechnen, nur sehen.
          </p>
        </button>

        <button onClick={() => setWegOffen(true)} className="w-full px-5 py-5 mb-3"
          style={{ background: C.weiss, border: `1.5px solid ${C.gruenDunkel}`, borderRadius: 16, textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: C.tinte }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.gruenDunkel, marginBottom: 6 }}>Werkzeug</p>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Rechenweg schreiben</p>
          <p style={{ color: C.grau, fontSize: 13, fontWeight: 300, lineHeight: 1.55 }}>
            Vier Aufgabentypen, ganze Wege eintippen. Geprüft wird Korrektheit und Vollständigkeit.
          </p>
        </button>

        </>)}

        <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginTop: nurModule ? 4 : 26, marginBottom: 10 }}>
          Arbeitsheft Analysis 01 · acht Bausteine
        </p>
        {MODUL_KATALOG.map((m) => (
          <button key={m.id} onClick={() => setOffenesModul(m)} className="w-full px-5 py-4 mb-3"
            style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: C.tinte }}>
            <div className="flex">
              <span style={{ color: C.gruenDunkel, fontWeight: 700, fontSize: 14, width: 26, flexShrink: 0 }}>{m.nr}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16.5, fontWeight: 600, marginBottom: 3 }}>{m.titel}</p>
                <p style={{ color: C.grau, fontSize: 13, fontWeight: 300, lineHeight: 1.55 }}>{m.kurz}</p>
                <p style={{ color: C.hellgrau, fontSize: 12, marginTop: 6 }}>
                  {m.kapitel.length > 1 ? `${m.kapitel.length} Kapitel · ` : ""}
                  {m.kapitel.reduce((s2, k) => s2 + k.aufgaben.length, 0)} Aufgaben{m.pdf ? " · PDF" : ""}
                </p>
              </div>
            </div>
          </button>
        ))}

        <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginTop: 24, marginBottom: 10 }}>
          Ältere Module
        </p>

        {MODULE.map((m) => (
          <button key={m.id} onClick={() => starten(m.id)} className="w-full px-5 py-5 mb-3"
            style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
            <div className="flex justify-between items-start">
              <div style={{ paddingRight: 12 }}>
                <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{m.titel}</p>
                <p style={{ color: C.grau, fontSize: 13, fontWeight: 300, lineHeight: 1.5 }}>{m.unter}</p>
              </div>
              <span style={{ color: C.hellgrau, fontSize: 12, whiteSpace: "nowrap", paddingTop: 4 }}>{m.aufgaben.length} Aufgaben</span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (phase === "einleitung") {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <button onClick={zurueck} className="mb-6" style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
          ← Alle Module
        </button>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 16 }}>{modul.titel}</h2>
        {modul.einleitung.map((t, i) => (
          <p key={i} style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 14 }}>{t}</p>
        ))}
        <div style={{ background: C.weiss, borderRadius: 16, padding: 22, marginTop: 8, marginBottom: 24, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
          {modul.punkte.map((p, i) => (
            <div key={i} className="flex" style={{ marginBottom: i === modul.punkte.length - 1 ? 0 : 12 }}>
              <span style={{ color: C.gruenDunkel, fontWeight: 700, fontSize: 14, width: 22, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: 15, lineHeight: 1.55 }}>{p}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setPhase("aufgaben")} className="px-7 py-3"
          style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Aufgaben starten
        </button>
      </div>
    );
  }

  if (phase === "fertig") {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16, padding: 28, marginBottom: 20 }}>
          <p style={{ color: "#C9D6EE", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{modul.titel}</p>
          <p style={{ color: C.weiss, fontSize: 22, fontWeight: 600, lineHeight: 1.4 }}>
            {treffer} von {modul.aufgaben.length} richtig
          </p>
          <p style={{ color: "#C9D6EE", fontSize: 14, fontWeight: 300, lineHeight: 1.7, marginTop: 12 }}>
            Wichtiger als die Zahl ist, ob du die Begründungen nachvollziehen konntest. Wenn nicht: Modul einfach nochmal durchgehen.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => starten(modul.id)} className="px-6 py-3"
            style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Nochmal
          </button>
          <button onClick={zurueck} className="px-6 py-3"
            style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
            Alle Module
          </button>
        </div>
      </div>
    );
  }

  const a = modul.aufgaben[index];
  const fertig = gewaehlt !== null;

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <button onClick={zurueck} className="mb-5" style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        ← Alle Module
      </button>

      <div className="flex justify-between items-baseline mb-2">
        <span style={{ fontSize: 13, fontWeight: 600, color: C.see }}>{modul.titel}</span>
        <span style={{ fontSize: 12, color: C.hellgrau }}>Aufgabe {index + 1} von {modul.aufgaben.length}</span>
      </div>
      <div style={{ height: 5, background: C.himmel, borderRadius: 999, marginBottom: 22 }}>
        <div style={{ height: 5, borderRadius: 999, background: C.see, width: `${((index + (fertig ? 1 : 0)) / modul.aufgaben.length) * 100}%` }} />
      </div>

      <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.5, marginBottom: 20 }}>{a.frage}</p>

      {a.optionen.map((o, i) => {
        const istRichtig = i === a.richtig;
        let rand = C.linie, hintergrund = C.weiss, schrift = C.tinte;
        if (fertig && istRichtig) { rand = C.see; hintergrund = C.himmel; schrift = C.see; }
        else if (fertig && i === gewaehlt) { rand = C.signal; schrift = C.signal; }
        return (
          <button key={i} onClick={() => antworten(i)} className="w-full px-5 py-4 mb-3"
            style={{ background: hintergrund, border: `1.5px solid ${rand}`, borderRadius: 14, textAlign: "left", cursor: fertig ? "default" : "pointer", fontFamily: "inherit", color: schrift, fontSize: 15, lineHeight: 1.5, fontWeight: fertig && istRichtig ? 600 : 400 }}>
            {o}
          </button>
        );
      })}

      {fertig && (
        <div style={{ background: C.weiss, borderLeft: `4px solid ${gewaehlt === a.richtig ? C.see : C.signal}`, borderRadius: 14, padding: 20, marginTop: 8, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: gewaehlt === a.richtig ? C.see : C.signal, marginBottom: 8 }}>
            {gewaehlt === a.richtig ? "Richtig" : "Noch nicht"}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: C.tinte }}>{a.erklaerung}</p>
          <button onClick={weiter} className="px-6 py-3 mt-5"
            style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            {index + 1 < modul.aufgaben.length ? "Weiter" : "Modul abschließen"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- KI-Aufgaben: Geradengleichungen ---------- */


export function ggT(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }


export function bruch(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = ggT(n, d);
  return { n: n / g, d: d / g };
}


export function bruchText(f) {
  if (f.d === 1) return String(f.n);
  return `${f.n}/${f.d}`;
}

/* Wie bruchText, aber als \frac{}{} für die <M>-Formelanzeige — ein echter
   (übereinander stehender) Bruch statt eines Schrägstrichs. */

export function bruchLatex(f) {
  if (f.d === 1) return String(f.n);
  return `\\frac{${f.n}}{${f.d}}`;
}


export function parseZahl(s) {
  if (s === undefined || s === null) return null;
  const t = String(s).trim().replace(",", ".");
  if (t === "") return null;
  if (/^-?\d+(\.\d+)?$/.test(t)) return parseFloat(t);
  const m = t.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (m) { const d = parseFloat(m[2]); if (d === 0) return null; return parseFloat(m[1]) / d; }
  return null;
}


export function zufall(arr) { return arr[Math.floor(Math.random() * arr.length)]; }


export function aufgabeLokal(typ) {
  const m = zufall(M_AUSWAHL);
  const b = Math.floor(Math.random() * 13) - 6;
  const schritt = m.d;
  const a1 = Math.floor(Math.random() * 5) - 2;
  let a2 = a1 + (Math.random() < 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2));
  if (a2 === a1) a2 = a1 + 1;
  const x1 = a1 * schritt, x2 = a2 * schritt;
  const y1 = (m.n * x1) / m.d + b;
  const y2 = (m.n * x2) / m.d + b;
  const bF = { n: b, d: 1 };
  if (typ === "punktsteigung") {
    return { typ, x1, y1, m, b: bF };
  }
  return { typ: "zweipunkte", x1, y1, x2, y2, m, b: bF };
}


export function ausRohdaten(d) {
  if (!d || typeof d !== "object") return null;
  const ganz = (v) => Number.isInteger(v) && Math.abs(v) <= 12;
  if (d.typ === "zweipunkte") {
    if (![d.x1, d.y1, d.x2, d.y2].every(ganz)) return null;
    if (d.x1 === d.x2) return null;
    const m = bruch(d.y2 - d.y1, d.x2 - d.x1);
    if (m.n === 0 || m.d > 4) return null;
    const b = bruch(d.y1 * m.d - m.n * d.x1, m.d);
    if (b.d > 4) return null;
    return { typ: "zweipunkte", x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2, m, b };
  }
  if (d.typ === "punktsteigung") {
    if (![d.x1, d.y1, d.mz, d.mn].every((v) => Number.isInteger(v))) return null;
    if (!ganz(d.x1) || !ganz(d.y1) || d.mn === 0 || d.mz === 0) return null;
    const m = bruch(d.mz, d.mn);
    if (m.d > 4 || Math.abs(m.n) > 6) return null;
    const b = bruch(d.y1 * m.d - m.n * d.x1, m.d);
    if (b.d > 4) return null;
    return { typ: "punktsteigung", x1: d.x1, y1: d.y1, m, b };
  }
  return null;
}


export function Schaubild({ a, mS, bS }) {
  const mR = a.m.n / a.m.d, bR = a.b.n / a.b.d;
  const xs = [a.x1, 0].concat(a.typ === "zweipunkte" ? [a.x2] : []);
  const ys = [a.y1, 0, bR].concat(a.typ === "zweipunkte" ? [a.y2] : []);
  if (mS !== null && bS !== null) ys.push(bS);
  const R = Math.max(6, Math.ceil(Math.max(...xs.map(Math.abs), ...ys.map(Math.abs)) + 1.5));
  const S = 300, mitte = S / 2, k = (S / 2 - 18) / R;
  const px = (x) => mitte + x * k;
  const py = (y) => mitte - y * k;
  const schritt = R > 9 ? 2 : 1;
  const striche = [];
  for (let i = -R; i <= R; i += schritt) striche.push(i);

  const gerade = (m, b) => `M ${px(-R)} ${py(-m * R + b)} L ${px(R)} ${py(m * R + b)}`;
  const zeigeSchueler = mS !== null && bS !== null && (Math.abs(mS - mR) > 1e-6 || Math.abs(bS - bR) > 1e-6);

  return (
    <svg viewBox={`0 0 ${S} ${S}`} style={{ width: "100%", maxWidth: 340, display: "block", margin: "0 auto" }}>
      <defs>
        <clipPath id="feld"><rect x="0" y="0" width={S} height={S} /></clipPath>
      </defs>
      <rect x="0" y="0" width={S} height={S} fill={C.weiss} rx="12" />
      {striche.map((i) => (
        <g key={i}>
          <line x1={px(i)} y1={0} x2={px(i)} y2={S} stroke={C.linie} strokeWidth="1" />
          <line x1={0} y1={py(i)} x2={S} y2={py(i)} stroke={C.linie} strokeWidth="1" />
        </g>
      ))}
      <line x1={0} y1={py(0)} x2={S} y2={py(0)} stroke={C.hellgrau} strokeWidth="1.5" />
      <line x1={px(0)} y1={0} x2={px(0)} y2={S} stroke={C.hellgrau} strokeWidth="1.5" />
      {striche.filter((i) => i !== 0 && i % (schritt * 2) === 0).map((i) => (
        <g key={`l${i}`}>
          <text x={px(i)} y={py(0) + 13} fontSize="9" fill={C.hellgrau} textAnchor="middle">{i}</text>
          <text x={px(0) - 6} y={py(i) + 3} fontSize="9" fill={C.hellgrau} textAnchor="end">{i}</text>
        </g>
      ))}
      <g clipPath="url(#feld)">
        {zeigeSchueler && <path d={gerade(mS, bS)} stroke={C.signal} strokeWidth="2.5" strokeDasharray="6 5" fill="none" />}
        <path d={gerade(mR, bR)} stroke={C.see} strokeWidth="2.5" fill="none" />
      </g>
      <circle cx={px(a.x1)} cy={py(a.y1)} r="5" fill={C.tinte} />
      {a.typ === "zweipunkte" && <circle cx={px(a.x2)} cy={py(a.y2)} r="5" fill={C.tinte} />}
    </svg>
  );
}


export function KIAufgaben({ eingebettet }) {
  const [typ, setTyp] = useState("zweipunkte");
  const [a, setA] = useState(null);
  const [laedt, setLaedt] = useState(false);
  const [eM, setEM] = useState("");
  const [eB, setEB] = useState("");
  const [geprueft, setGeprueft] = useState(false);
  const [serie, setSerie] = useState({ versuche: 0, treffer: 0 });
  const [quelle, setQuelle] = useState("");

  const neueAufgabe = async (gewuenschterTyp) => {
    const t = gewuenschterTyp || typ;
    setLaedt(true); setGeprueft(false); setEM(""); setEB("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: kiKopf(),
        body: JSON.stringify({
          model: "claude-sonnet-5-5",
          max_tokens: 300,
          messages: [{
            role: "user",
            content: t === "zweipunkte"
              ? `Erzeuge eine neue Übungsaufgabe: Gerade durch zwei Punkte. Ganzzahlige Koordinaten zwischen -10 und 10, x1 ungleich x2, die Steigung darf nicht 0 sein und soll als gekürzter Bruch höchstens den Nenner 4 haben, der y-Achsenabschnitt ebenfalls. Wähle andere Zahlen als üblich, variiere Vorzeichen und Quadranten. Antworte nur mit JSON: {"typ":"zweipunkte","x1":Zahl,"y1":Zahl,"x2":Zahl,"y2":Zahl}`
              : `Erzeuge eine neue Übungsaufgabe: Gerade durch einen Punkt mit gegebener Steigung. Ganzzahlige Punktkoordinaten zwischen -10 und 10. Steigung als Bruch mz/mn, gekürzt, Nenner höchstens 4, Zähler betragsmäßig höchstens 6, nicht 0. Der y-Achsenabschnitt soll höchstens Nenner 4 haben. Variiere Vorzeichen und Quadranten. Antworte nur mit JSON: {"typ":"punktsteigung","x1":Zahl,"y1":Zahl,"mz":Zahl,"mn":Zahl}`,
          }],
        }),
      });
      const data = await kiAntwort(res);
      const text = (data.content || []).map((i) => (i.type === "text" ? i.text : "")).join("");
      const roh = jsonLesen(text);
      const fertig = ausRohdaten(roh);
      if (fertig) { setA(fertig); setQuelle("von Mathilda erzeugt"); }
      else { setA(aufgabeLokal(t)); setQuelle("Ersatzaufgabe"); }
    } catch (e) {
      setA(aufgabeLokal(t)); setQuelle("Ersatzaufgabe");
    } finally {
      setLaedt(false);
    }
  };

  const wechseln = (t) => { setTyp(t); setA(null); setGeprueft(false); setEM(""); setEB(""); };

  const mS = parseZahl(eM), bS = parseZahl(eB);
  const mR = a ? a.m.n / a.m.d : 0, bR = a ? a.b.n / a.b.d : 0;
  const mOk = mS !== null && Math.abs(mS - mR) < 1e-6;
  const bOk = bS !== null && Math.abs(bS - bR) < 1e-6;

  const pruefen = () => {
    if (mS === null || bS === null) return;
    setGeprueft(true);
    setSerie((s) => ({ versuche: s.versuche + 1, treffer: s.treffer + (mOk && bOk ? 1 : 0) }));
  };

  const feldStil = (ok) => ({
    width: 74, padding: "10px 12px", fontSize: 17, fontFamily: "inherit", textAlign: "center",
    border: `1.5px solid ${geprueft ? (ok ? C.see : C.signal) : C.linie}`, borderRadius: 12,
    background: geprueft && ok ? C.himmel : C.weiss, color: geprueft && !ok ? C.signal : C.tinte, outline: "none",
  });

  return (
    <div className={eingebettet ? "" : "mx-auto px-6 pb-16"} style={eingebettet ? {} : { maxWidth: 620, paddingTop: 30 }}>
      {!eingebettet && (<>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
          Immer neue Geraden
        </h2>
      </>)}
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 20 }}>
        Rechne auf Papier, nicht im Kopf und nicht am Bildschirm. Trage anschließend nur das Ergebnis ein.
        Danach siehst du beide Geraden im Schaubild – deine und die richtige.
      </p>

      <div className="flex gap-2 mb-6">
        {[["zweipunkte", "Zwei Punkte"], ["punktsteigung", "Punkt & Steigung"]].map(([id, t]) => (
          <button key={id} onClick={() => wechseln(id)} className="px-4 py-2"
            style={{ background: typ === id ? C.see : C.weiss, color: typ === id ? C.weiss : C.grau, border: `1px solid ${typ === id ? C.see : C.linie}`, borderRadius: 999, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>

      {!a && (
        <button onClick={() => neueAufgabe()} disabled={laedt} className="px-7 py-3"
          style={{ background: laedt ? C.hellgrau : C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: laedt ? "wait" : "pointer" }}>
          {laedt ? "Aufgabe wird erzeugt…" : "Aufgabe erzeugen"}
        </button>
      )}

      {a && (
        <>
          <div style={{ background: C.weiss, borderRadius: 16, padding: 22, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>
              {a.typ === "zweipunkte" ? "Gerade durch zwei Punkte" : "Gerade durch Punkt mit gegebener Steigung"}
            </p>
            {a.typ === "zweipunkte" ? (
              <p style={{ fontSize: 18, lineHeight: 1.6 }}>
                Bestimme die Gleichung der Geraden durch<br />
                <span style={{ fontWeight: 600 }}>P({a.x1} | {a.y1})</span> und <span style={{ fontWeight: 600 }}>Q({a.x2} | {a.y2})</span>.
              </p>
            ) : (
              <p style={{ fontSize: 18, lineHeight: 1.6 }}>
                Eine Gerade hat die Steigung <span style={{ fontWeight: 600 }}>m = {bruchText(a.m)}</span> und geht durch<br />
                <span style={{ fontWeight: 600 }}>P({a.x1} | {a.y1})</span>. Bestimme ihre Gleichung.
              </p>
            )}
            <p style={{ color: C.hellgrau, fontSize: 12, fontWeight: 300, marginTop: 12 }}>{quelle}</p>
          </div>

          <div style={{ background: C.weiss, borderRadius: 16, padding: 22, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
            <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 14 }}>Deine Lösung</p>
            <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
              <span style={{ fontSize: 19 }}>y =</span>
              <input value={eM} onChange={(e) => { setEM(e.target.value); setGeprueft(false); }}
                placeholder="m" inputMode="text" style={feldStil(mOk)} />
              <span style={{ fontSize: 19 }}>· x +</span>
              <input value={eB} onChange={(e) => { setEB(e.target.value); setGeprueft(false); }}
                placeholder="c" inputMode="text" style={feldStil(bOk)} />
            </div>
            <p style={{ color: C.hellgrau, fontSize: 12, fontWeight: 300, marginTop: 10, lineHeight: 1.6 }}>
              Brüche als 3/4 eingeben, Dezimalzahlen mit Komma oder Punkt. Negative Werte mit Minus.
            </p>

            {!geprueft && (
              <button onClick={pruefen} disabled={mS === null || bS === null} className="px-6 py-3 mt-5"
                style={{ background: mS === null || bS === null ? C.hellgrau : C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: mS === null || bS === null ? "default" : "pointer" }}>
                Prüfen
              </button>
            )}

            {geprueft && (
              <div className="mt-5" style={{ borderLeft: `4px solid ${mOk && bOk ? C.see : C.signal}`, paddingLeft: 16 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: mOk && bOk ? C.see : C.signal, marginBottom: 6 }}>
                  {mOk && bOk ? "Stimmt." : mOk ? "Die Steigung stimmt, c noch nicht." : bOk ? "c stimmt, die Steigung noch nicht." : "Beides noch nicht."}
                </p>
                <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>
                  {mOk && bOk
                    ? `y = ${bruchText(a.m)} · x ${a.b.n < 0 ? "−" : "+"} ${bruchText({ n: Math.abs(a.b.n), d: a.b.d })}`
                    : "Vergleiche im Schaubild, wo deine Gerade von der gesuchten abweicht. Verschobene Lage bedeutet falsches c, andere Neigung bedeutet falsches m."}
                </p>
              </div>
            )}
          </div>

          {geprueft && (
            <div className="mt-5" style={{ background: C.weiss, borderRadius: 16, padding: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
              <Schaubild a={a} mS={mS} bS={bS} />
              <div className="flex flex-wrap justify-center mt-3" style={{ gap: 18 }}>
                <span className="flex items-center" style={{ gap: 7, fontSize: 12, color: C.grau }}>
                  <span style={{ width: 20, height: 3, background: C.see, display: "inline-block", borderRadius: 2 }} /> gesuchte Gerade
                </span>
                {(Math.abs(mS - mR) > 1e-6 || Math.abs(bS - bR) > 1e-6) && (
                  <span className="flex items-center" style={{ gap: 7, fontSize: 12, color: C.grau }}>
                    <span style={{ width: 20, height: 3, background: C.signal, display: "inline-block", borderRadius: 2 }} /> deine Gerade
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => neueAufgabe()} disabled={laedt} className="px-6 py-3"
              style={{ background: laedt ? C.hellgrau : C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: laedt ? "wait" : "pointer" }}>
              {laedt ? "…" : "Nächste Aufgabe"}
            </button>
            {serie.versuche > 0 && (
              <span className="flex items-center" style={{ fontSize: 13, color: C.grau }}>
                {serie.treffer} von {serie.versuche} richtig
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Schulkurse ---------- */

/* Hier die eigenen Zahlungslinks eintragen (Stripe, Digistore24, CopeCart …).
   Solange ein Feld leer ist, zeigt der Button einen Hinweis statt ins Leere zu führen. */

/* Pen-&-Paper-Grafik: blankes Blatt mit einer Rechnung nach den Pen-&-Paper-Regeln
   (Abstände zwischen Termen und Operatoren, ein Schritt pro Zeile, „=“ untereinander,
   Umformungen rechts kommentiert, Ergebnis doppelt unterstrichen) und ein Stift. */
export function PenPaperBlatt() {
  const W = 230, H = 190;
  const T = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700, fontSize: 17, fill: C.seeTief };
  const K = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 600, fontSize: 12, fill: C.gruen };
  const zeilen = [
    { y: 66, links: [["3x", 60, "end"], ["+", 75, "middle"], ["5", 101, "end"]], rechts: "20", kommentar: "|  − 5" },
    { y: 100, links: [["3x", 101, "end"]], rechts: "15", kommentar: "|  : 3" },
    { y: 134, links: [["x", 101, "end"]], rechts: "5" },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      <g transform="rotate(-3 115 96)">
        <rect x="8" y="30" width="214" height="136" rx="6" fill="#FFFFFF" />
        {zeilen.map((z) => (
          <g key={z.y}>
            {z.links.map(([t, x, anker]) => <text key={t + x} x={x} y={z.y} textAnchor={anker} {...T}>{t}</text>)}
            <text x="116" y={z.y} textAnchor="middle" {...T}>=</text>
            <text x="131" y={z.y} {...T}>{z.rechts}</text>
            {z.kommentar && <text x="164" y={z.y - 1} {...K}>{z.kommentar}</text>}
          </g>
        ))}
        <line x1="84" y1="142" x2="152" y2="142" stroke={C.flaggold} strokeWidth="2.5" />
        <line x1="84" y1="147" x2="152" y2="147" stroke={C.flaggold} strokeWidth="2.5" />
      </g>
      <g transform="translate(-10 -4) rotate(38 206 150)">
        <rect x="199" y="104" width="14" height="66" rx="3" fill={C.flaggold} />
        <rect x="199" y="104" width="14" height="12" rx="3" fill={C.goldWarm} />
        <path d="M 199 170 L 213 170 L 206 184 Z" fill="#F3E2B0" />
        <path d="M 203.5 179 L 208.5 179 L 206 184 Z" fill={C.seeTief} />
      </g>
    </svg>
  );
}

/* Einzelne Themenseiten zur Analysis – erscheinen im Analysis-Dropdown der Schulkurse */
const ANALYSIS_THEMEN = [
  { ansicht: "diffq", titel: "Differenzenquotient", unter: "Vom Tangentenproblem zur Ableitung", info: "Thema · Video · Übung", grafik: "sekante" },
  { ansicht: "potenzregel", titel: "Potenzregel", unter: "Beweis per Produktregel und Induktion", info: "Thema · Video · Übung", grafik: "potenz" },
];

export function KursGrafik({ art, hoehe = 150 }) {
  const w = 340, h = 150;
  if (art === "papier") return (
    <div style={{ height: hoehe, background: C.seeTief }}><PenPaperBlatt /></div>
  );
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: hoehe, display: "block" }} preserveAspectRatio="none">
      <rect x="0" y="0" width={w} height={h} fill={C.seeTief} />
      {[40, 80, 120, 160, 200, 240, 280].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2={h} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      {[30, 60, 90, 120].map((y) => (
        <line key={y} x1="0" y1={y} x2={w} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}

      {art === "sekante" && (
        <>
          {/* Parabel mit Sekante (gold) und Tangente (grana) im Punkt P */}
          <line x1="20" y1="135" x2="320" y2="135" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <path d="M 40 130 Q 150 150 300 20" stroke={C.weiss} strokeWidth="2.5" fill="none" />
          <line x1="70" y1="155.6" x2="300" y2="35.5" stroke={C.flaggold} strokeWidth="2.2" />
          <line x1="40" y1="152" x2="320" y2="63.1" stroke={C.gruen} strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="134.4" cy="122" r="5.5" fill={C.flaggold} />
          <circle cx="241.6" cy="66" r="5.5" fill={C.flaggold} />
          <path d="M 134.4 122 L 241.6 122 L 241.6 66" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" fill="none" strokeDasharray="4 3" />
          <text x="188" y="138" fill="rgba(255,255,255,0.8)" fontSize="13" fontWeight="700" fontStyle="italic" textAnchor="middle">h</text>
        </>
      )}

      {art === "potenz" && (
        <>
          {/* Dominokette: umgefallene Steine (weiß), der aktuelle Stein gold, dahinter x³ */}
          <line x1="20" y1="135" x2="320" y2="135" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <path d="M 30 132 C 120 128 170 110 200 80 S 250 20 262 10" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={48 + i * 42} y="72" width="18" height="62" rx="3" fill={C.weiss} opacity={0.55 + i * 0.12}
              transform={`rotate(-38 ${66 + i * 42} 134)`} />
          ))}
          <rect x="218" y="72" width="18" height="62" rx="3" fill={C.flaggold} transform="rotate(-12 236 134)" />
          <rect x="262" y="72" width="18" height="62" rx="3" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" />
          <rect x="300" y="72" width="18" height="62" rx="3" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" />
        </>
      )}

      {art === "gerade" && (
        <>
          {/* zwei sich schneidende Geraden mit Steigungsdreieck */}
          <line x1="20" y1="135" x2="320" y2="130" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <line x1="40" y1="130" x2="300" y2="22" stroke={C.weiss} strokeWidth="2.5" />
          <line x1="40" y1="30" x2="300" y2="118" stroke={C.gruen} strokeWidth="2.5" />
          <path d="M 110 100.9 L 190 100.9 L 190 67.7" stroke={C.flaggold} strokeWidth="2" fill="none" strokeDasharray="5 4" />
          <circle cx="172.6" cy="74.9" r="5.5" fill={C.flaggold} />
        </>
      )}

      {art === "polynom" && (
        <>
          {/* kubische Parabel mit drei markierten Nullstellen */}
          <line x1="20" y1="80" x2="320" y2="80" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <path d="M 30 140 C 60 20, 110 20, 140 80 C 165 128, 205 128, 230 80 C 250 45, 280 25, 315 10" stroke={C.weiss} strokeWidth="2.5" fill="none" />
          {[56, 140, 230].map((x) => <circle key={x} cx={x} cy="80" r="5.5" fill={C.flaggold} />)}
        </>
      )}

      {art === "funktionen" && (
        <>
          {/* e-Funktion, Sinuswelle und Hyperbelast */}
          <line x1="20" y1="120" x2="320" y2="120" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <path d="M 20 116 C 120 114, 190 100, 230 60 C 250 40, 262 22, 270 8" stroke={C.weiss} strokeWidth="2.5" fill="none" />
          <path d="M 20 80 C 45 50, 70 50, 95 80 C 120 110, 145 110, 170 80 C 195 50, 220 50, 245 80 C 270 110, 295 110, 320 80"
            stroke={C.gruen} strokeWidth="2.3" fill="none" opacity="0.9" />
          <path d="M 250 146 C 262 120, 285 104, 320 98" stroke={C.flaggold} strokeWidth="2.3" fill="none" />
        </>
      )}

      {art === "kurve" && (
        <>
          <path d="M 20 130 C 70 20, 110 20, 150 75 C 190 130, 240 130, 320 30"
            stroke={C.weiss} strokeWidth="2.5" fill="none" />
          <circle cx="88" cy="38" r="5" fill={C.gruen} />
          <circle cx="150" cy="75" r="5" fill={C.gruen} />
          <circle cx="222" cy="116" r="5" fill={C.gruen} />
          <line x1="50" y1="102" x2="126" y2="38" stroke={C.gruen} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />
        </>
      )}

      {art === "flaeche" && (
        <>
          <path d="M 30 120 C 90 30, 150 140, 310 40 L 310 135 L 30 135 Z" fill="rgba(255,255,255,0.16)" />
          {[50, 80, 110, 140, 170, 200, 230, 260].map((x, i) => (
            <line key={x} x1={x} y1="135" x2={x} y2={[86, 62, 60, 76, 96, 108, 104, 88][i]}
              stroke={C.gruen} strokeWidth="2" opacity="0.75" />
          ))}
          <path d="M 30 120 C 90 30, 150 140, 310 40" stroke={C.weiss} strokeWidth="2.5" fill="none" />
          <line x1="20" y1="135" x2="320" y2="135" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
        </>
      )}

      {art === "stochastik" && (
        <>
          {/* Binomialverteilung als Säulendiagramm mit Glockenkurve */}
          {[0.03, 0.1, 0.22, 0.3, 0.22, 0.1, 0.03].map((p, i) => {
            const x = 70 + i * 32, hoehe = p * 330;
            return <rect key={i} x={x} y={130 - hoehe} width="24" height={hoehe} rx="3"
              fill={i === 3 ? C.flaggold : "rgba(255,255,255,0.22)"} stroke="rgba(255,255,255,0.45)" strokeWidth="1" />;
          })}
          <path d="M 50 128 C 120 126, 140 26, 178 26 C 216 26, 236 126, 306 128" stroke={C.weiss} strokeWidth="2.5" fill="none" />
          <line x1="40" y1="130" x2="320" y2="130" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <circle cx="42" cy="36" r="9" fill="none" stroke={C.gruen} strokeWidth="2" />
          <circle cx="42" cy="36" r="2.5" fill={C.gruen} />
          <line x1="42" y1="45" x2="30" y2="66" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          <line x1="42" y1="45" x2="54" y2="66" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
        </>
      )}

      {art === "vektor" && (
        <>
          <path d="M 120 100 L 235 62 L 300 92 L 185 130 Z" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
          <line x1="60" y1="130" x2="60" y2="22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <line x1="60" y1="130" x2="310" y2="130" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <line x1="60" y1="130" x2="18" y2="146" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <line x1="60" y1="130" x2="176" y2="52" stroke={C.weiss} strokeWidth="2.5" />
          <polygon points="176,52 164,56 170,64" fill={C.weiss} />
          <line x1="60" y1="130" x2="150" y2="112" stroke={C.gruen} strokeWidth="2.5" />
          <polygon points="150,112 138,110 141,119" fill={C.gruen} />
          <circle cx="60" cy="130" r="4" fill={C.weiss} />
        </>
      )}
    </svg>
  );
}


export function Kurse({ gehe, startKurs = null }) {
  const [offen, setOffen] = useState(startKurs);
  const [hinweis, setHinweis] = useState(false);
  const [analysisAuf, setAnalysisAuf] = useState(false);   // Dropdown der fünf Analysis-Kurse
  const [video, setVideo] = useState(null);   // null oder Index der Lektion

  const kaufen = (id) => {
    const url = KAUF_LINKS[id];
    if (url) window.open(url, "_blank");
    else setHinweis(true);
  };

  const KaufBlock = ({ k, gross }) => (
    <div>
      <button onClick={() => kaufen(k.id)} className={gross ? "w-full px-6 py-4" : "px-6 py-3"}
        style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: gross ? 17 : 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 4px 18px rgba(127,0,52,0.22)" }}>
        Kurs kaufen · {k.preis} €
      </button>
      {hinweis && (
        <p style={{ color: C.grau, fontSize: 12, fontWeight: 300, marginTop: 10, lineHeight: 1.6 }}>
          Der Zahlungslink ist noch nicht hinterlegt. Er wird im Code unter KAUF_LINKS eingetragen.
        </p>
      )}
    </div>
  );

  if (offen && video !== null) {
    const k = KURSE.find((x) => x.id === offen);
    return (
      <VideokursPlayer kursId={k.id} kursTitel={k.titel} start={video} gehe={gehe}
        onZurueck={() => { setVideo(null); window.scrollTo(0, 0); }} />
    );
  }

  if (offen) {
    const k = KURSE.find((x) => x.id === offen);
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <button onClick={() => { setOffen(null); setHinweis(false); setVideo(null); }} className="mb-5"
          style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
          ← Alle Kurse
        </button>

        <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 22px rgba(15,26,51,0.14)", marginBottom: 20 }}>
          <KursGrafik art={k.grafik} hoehe={170} />
        </div>

        <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 14 }}>{k.titel}</h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {[k.stufe, k.umfang].map((t, i) => (
            <span key={i} className="px-4 py-2" style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 12, color: C.grau }}>{t}</span>
          ))}
        </div>

        <VideokursVorschau kursId={k.id} onStart={(i) => { setVideo(i); window.scrollTo(0, 0); }} />

        {k.text.map((t, i) => (
          <p key={i} style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 14 }}>{t}</p>
        ))}

        <div style={{ background: C.weiss, borderRadius: 16, padding: 22, marginTop: 12, marginBottom: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 14 }}>Das kannst du danach</p>
          {k.lernst.map((t, i) => (
            <div key={i} className="flex" style={{ marginBottom: i === k.lernst.length - 1 ? 0 : 11 }}>
              <span style={{ color: C.gruenDunkel, fontWeight: 700, fontSize: 14, width: 20, flexShrink: 0 }}>·</span>
              <span style={{ fontSize: 14.5, lineHeight: 1.6 }}>{t}</span>
            </div>
          ))}
        </div>

        <div style={{ borderLeft: `3px solid ${C.see}`, paddingLeft: 16, marginBottom: 26 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Für wen der Kurs ist</p>
          <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.7 }}>{k.fuerWen}</p>
        </div>

        <KaufBlock k={k} gross />

        <p style={{ color: C.hellgrau, fontSize: 12, fontWeight: 300, marginTop: 14, lineHeight: 1.7 }}>
          Einmalzahlung, dauerhafter Zugang. Alle Materialien als Arbeitsheft zum Ausdrucken, plus die passenden Module im Trainingsbereich.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Ein Halbjahr, ein Thema, ein System
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 26 }}>
        Jeder Kurs führt ein komplettes Abiturthema von Grund auf durch – mit Arbeitsheft, Aufgaben und den passenden
        Modulen im Trainingsbereich. Tipp auf einen Kurs – dort findest du alle Infos, die Videos und den Kauf.
      </p>

      {(() => {
        // Eine Kachel im Stil der Startseite; klein = kompakte Variante für das Analysis-Dropdown
        const kachel = ({ key, titel, unter, info, grafik, onClick, label, klein, rechts, auf }) => (
          <button key={key} onClick={onClick} aria-label={label} aria-expanded={auf} className="kurs-kachel"
            style={{ display: "flex", width: klein ? "100%" : "calc(100% + 32px)", marginLeft: klein ? 0 : -16, marginRight: klein ? 0 : -16,
              height: klein ? 92 : 138, marginBottom: klein ? 8 : 12,
              padding: 0, border: "none", borderRadius: klein ? 14 : 18, overflow: "hidden", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`,
              boxShadow: `0 6px 22px rgba(0,77,152,0.24), inset 0 0 0 1px ${C.silber}40` }}>
            <div style={{ flex: klein ? "1 1 68%" : "1 1 60%", minWidth: 0, padding: klein ? "10px 8px 9px 14px" : "13px 10px 12px 16px", display: "flex", flexDirection: "column" }}>
              <p className="titel-silber" style={{ fontSize: klein ? "clamp(14px, 3.8vw, 18px)" : "clamp(15px, 4.1vw, 22px)", fontWeight: 700, letterSpacing: "-0.03em",
                lineHeight: 1.1, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{titel}</p>
              <span aria-hidden="true" style={{ display: "block", width: klein ? 26 : 34, height: 2.5, borderRadius: 2, marginTop: klein ? 5 : 6,
                background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)` }} />
              <p className="kurs-text" style={{ color: C.weiss, fontSize: klein ? 12 : 12.5, fontWeight: 300, lineHeight: 1.4, marginTop: klein ? 4 : 6, marginBottom: 0 }}>{unter}</p>
              <p style={{ marginTop: "auto", marginBottom: 0, color: C.goldText, fontSize: klein ? 11 : 11.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {info}
              </p>
            </div>
            {rechts || (
              <div style={{ flex: klein ? "0 0 32%" : "0 0 40%", borderLeft: `1px solid ${C.silber}33` }}>
                <KursGrafik art={grafik} hoehe="100%" />
              </div>
            )}
          </button>
        );
        const infoText = (k) => {
          const n = videoAnzahl(k.id);
          return `${k.stufe.replace("Klasse ", "Kl. ").replace(" – ", "–")}${n > 0 ? ` · ${n} Videos` : ""} · ${k.preis} €`;
        };
        const oeffne = (id) => { setOffen(id); setHinweis(false); window.scrollTo(0, 0); };
        const analysis = KURSE.filter((k) => k.id.startsWith("analysis"));
        const videosAnalysis = analysis.reduce((s0, k) => s0 + videoAnzahl(k.id), 0);
        const ausgabe = [];
        KURSE.forEach((k) => {
          if (k.id.startsWith("analysis")) {
            if (k.id !== analysis[0].id) return;
            ausgabe.push(
              <div key="analysis-gruppe">
                {kachel({
                  key: "analysis", titel: "Analysis", auf: analysisAuf, label: analysisAuf ? "Analysis-Kurse zuklappen" : "Analysis-Kurse aufklappen",
                  unter: "Geraden · Polynome · Andere Funktionen · Kurvendiskussion · Integrale",
                  info: `Kl. 8–13 · ${analysis.length} Kurse · ${videosAnalysis} Videos`, grafik: "kurve",
                  onClick: () => setAnalysisAuf(!analysisAuf),
                  rechts: (
                    <div style={{ flex: "0 0 40%", borderLeft: `1px solid ${C.silber}33`, position: "relative" }}>
                      <KursGrafik art="kurve" hoehe="100%" />
                      <AufklappZeichen art="gold" auf={analysisAuf} groesse={40} abstand={10} />
                    </div>
                  ),
                })}
                {analysisAuf && (
                  <div data-aufklapp-inhalt style={{ margin: "-4px 0 14px", padding: "10px 0 2px 12px", borderLeft: `3px solid ${C.flaggold}` }}>
                    {analysis.map((a) => kachel({
                      key: a.id, klein: true, titel: a.titel, unter: a.unter, info: infoText(a), grafik: a.grafik,
                      label: `${a.titel} öffnen`, onClick: () => oeffne(a.id),
                    }))}
                    {/* Einzelne Themenseiten (Aufbau: Video, Herleitung, Visualisierung, Übung) */}
                    <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.grau, margin: "10px 0 6px 2px" }}>Themen</p>
                    {ANALYSIS_THEMEN.map((t) => kachel({
                      key: t.ansicht, klein: true, titel: t.titel, unter: t.unter, info: t.info, grafik: t.grafik,
                      label: `Thema ${t.titel} öffnen`, onClick: () => { gehe({ ansicht: t.ansicht }); window.scrollTo(0, 0); },
                    }))}
                  </div>
                )}
              </div>
            );
            return;
          }
          ausgabe.push(kachel({ key: k.id, titel: k.titel, unter: k.unter, info: infoText(k), grafik: k.grafik, label: `${k.titel} öffnen`, onClick: () => oeffne(k.id) }));
        });
        return ausgabe;
      })()}
      <style>{`.kurs-kachel{transition:transform .15s ease, box-shadow .15s ease}
        .kurs-kachel:active{transform:scale(0.985)}
        @media (hover:hover){.kurs-kachel:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,77,152,0.32)}}
        .kurs-text{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}`}</style>
    </div>
  );
}

/* ---------- Startseite ---------- */

/* Adresse des Intro-Videos (1:30) und der Matheskript-Bibel als PDF.
   Solange leer, zeigen Videokarte und Download-Link einen Hinweis. */

export function Karo({ opacity = 0.06 }) {
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
      <defs>
        <pattern id="karo" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M18 0 L0 0 0 18" fill="none" stroke={C.weiss} strokeWidth="1" opacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#karo)" />
    </svg>
  );
}

/* --- Mikro-Beweise --- */


export function BeweisMathilda() {
  const Blatt = ({ zeilen, eng }) => (
    <div style={{ flex: 1, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 10, padding: 10, minHeight: 88 }}>
      {zeilen.map((b, i) => (
        <div key={i} style={{ height: 3, borderRadius: 2, background: i === 1 && eng ? C.signal : C.hellgrau, width: `${b}%`, marginBottom: eng ? 5 : 11, opacity: i === 1 && eng ? 0.9 : 0.55 }} />
      ))}
    </div>
  );
  return (
    <div>
      <div className="flex" style={{ gap: 12 }}>
        <Blatt zeilen={[88, 94, 70, 82, 60]} eng />
        <Blatt zeilen={[62, 48, 55, 40]} />
      </div>
      <div className="flex justify-between mt-2" style={{ fontSize: 11, color: C.hellgrau }}>
        <span>vorher · 3 von 8</span>
        <span style={{ color: C.see, fontWeight: 600 }}>nachher · 7 von 8</span>
      </div>
    </div>
  );
}


export function BeweisTraining() {
  return (
    <div>
      <div className="flex items-end" style={{ gap: 5, height: 46 }}>
        {DEMO.wochen.map((w, i) => (
          <div key={i} style={{ flex: 1, height: `${w}%`, background: i === DEMO.wochen.length - 1 ? C.see : "#D5DEEE", borderRadius: 3 }} />
        ))}
      </div>
      <div className="flex justify-between mt-2" style={{ fontSize: 11, color: C.hellgrau }}>
        <span>Eigenständigkeit, 7 Wochen</span>
        <span>Tag {DEMO.streak} in Folge</span>
      </div>
    </div>
  );
}


export function BeweisGenerator() {
  return (
    <div style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 10, padding: 12, display: "flex", gap: 10 }}>
      <div style={{ width: 3, background: C.gruenDunkel, borderRadius: 2, opacity: 0.5 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 4, width: "46%", background: C.see, borderRadius: 2, marginBottom: 10 }} />
        {[72, 58, 66, 44].map((b, i) => (
          <div key={i} style={{ height: 3, width: `${b}%`, background: C.hellgrau, opacity: 0.5, borderRadius: 2, marginBottom: 9 }} />
        ))}
      </div>
      <div style={{ width: 46, borderLeft: `1px dashed ${C.linie}` }} />
    </div>
  );
}


export function BeweisKurse({ gekauft }) {
  return (
    <div className="flex" style={{ gap: 8 }}>
      {KURSE.map((k, i) => (
        <div key={k.id} style={{ flex: 1, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 10, padding: 10 }}>
          <div style={{ height: 26, borderRadius: 6, background: C.seeTief, marginBottom: 8, position: "relative", overflow: "hidden" }}>
            <Karo opacity={0.16} />
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>{k.titel}</p>
          <p style={{ fontSize: 11, color: gekauft && i === 0 ? C.see : C.hellgrau, marginTop: 3 }}>
            {gekauft && i === 0 ? `${DEMO.kurs.fortschritt} %` : `${k.preis} €`}
          </p>
        </div>
      ))}
    </div>
  );
}

/* --- Bausteine der Seite --- */


export function Sektion({ children, style }) {
  return <section style={{ marginBottom: 64, ...style }}>{children}</section>;
}


export function Titel({ children }) {
  return <h2 style={{ fontSize: 23, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 10 }}>{children}</h2>;
}


export function Satz({ children }) {
  return <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7 }}>{children}</p>;
}


export function Knopf({ children, onClick, breit }) {
  return (
    <button onClick={onClick} className={breit ? "w-full px-6 py-4" : "px-6 py-3"}
      style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: breit ? 16 : 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 4px 18px rgba(127,0,52,0.2)" }}>
      {children}
    </button>
  );
}


export function TextLink({ children, onClick }) {
  return (
    <button onClick={onClick}
      style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
      {children}
    </button>
  );
}


export function Bereich({ titel, satz, beweis, knopf, onClick }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h3 style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 6 }}>{titel}</h3>
      <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, marginBottom: 16 }}>{satz}</p>
      <div style={{ marginBottom: 16 }}>{beweis}</div>
      <Knopf onClick={onClick}>{knopf}</Knopf>
    </div>
  );
}


/* Gesperrte Kurs-Kacheln unter den Gratis-Werkzeugen einer Sektion (Analysis, Vektoren, Stochastik):
   blau wie in den Schulkursen, aber mit Schloss und nicht anklickbar. */
export function GesperrteKurse({ ids, ueberschrift = "Die Kurse dazu" }) {
  const kurse = ids.map((id) => KURSE.find((k) => k.id === id)).filter(Boolean);
  if (!kurse.length) return null;
  return (
    <div style={{ marginTop: 30 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 6 }}>Videokurse</p>
      <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 12 }}>{ueberschrift}</h3>
      {kurse.map((k) => {
        const n = videoAnzahl(k.id);
        const info = `${k.stufe.replace("Klasse ", "Kl. ").replace(" – ", "–")}${n > 0 ? ` · ${n} Videos` : ""}`;
        return (
          <div key={k.id} role="button" aria-disabled="true" aria-label={`${k.titel} – noch gesperrt`} title="Noch gesperrt"
            style={{ display: "flex", width: "100%", height: 92, marginBottom: 8, borderRadius: 14, overflow: "hidden", cursor: "not-allowed",
              background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, userSelect: "none",
              boxShadow: `0 6px 22px rgba(0,77,152,0.18), inset 0 0 0 1px ${C.silber}40` }}>
            <div style={{ flex: "1 1 68%", minWidth: 0, padding: "10px 8px 9px 14px", display: "flex", flexDirection: "column" }}>
              <p className="titel-silber" style={{ fontSize: "clamp(14px, 3.8vw, 18px)", fontWeight: 700, letterSpacing: "-0.03em",
                lineHeight: 1.1, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.titel}</p>
              <span aria-hidden="true" style={{ display: "block", width: 26, height: 2.5, borderRadius: 2, marginTop: 5,
                background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)` }} />
              <p style={{ color: C.weiss, fontSize: 12, fontWeight: 300, lineHeight: 1.4, marginTop: 4, marginBottom: 0,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.unter}</p>
              <p style={{ marginTop: "auto", marginBottom: 0, color: C.goldText, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{info}</p>
            </div>
            <div style={{ flex: "0 0 32%", position: "relative", borderLeft: `1px solid ${C.silber}33` }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.4 }}><KursGrafik art={k.grafik} hoehe="100%" /></div>
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 34, height: 34, borderRadius: 999, background: "rgba(255,255,255,0.94)", boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke={C.seeTief} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="11" width="14" height="10" rx="2.2" fill={C.seeTief} />
                    <path d="M 8 11 V 7.5 a 4 4 0 0 1 8 0 V 11" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
