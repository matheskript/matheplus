/* „Scan dein Blatt“ – Fenster mit Live-Kamera im DIN-A4-Format.
   Links eine kurze Anleitung, rechts das, was die Kamera als Foto liefern wird.
   Nach dem Auslösen prüft eine schnelle Bildanalyse Licht, Schärfe, Blattfüllung
   und Schrift und gibt Rückmeldung, bevor das Foto an Mathilda geht.
   Ohne Kamera-Zugriff (kein HTTPS, verweigert, kein Gerät) bleibt die
   Kamera-App des Handys bzw. die Galerie als Weg. */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";

const GOLD = C.flaggold;
const NACHT = C.seeTief;
const DIN = Math.SQRT2; // Höhe : Breite eines DIN-Blatts

/* ---------- Bildprüfung ---------- */
export function fotoPruefen(canvas) {
  const w = 240, h = Math.round(240 * canvas.height / canvas.width);
  const k = document.createElement("canvas"); k.width = w; k.height = h;
  const g = k.getContext("2d", { willReadFrequently: true });
  g.drawImage(canvas, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h).data;
  const L = new Float32Array(w * h);
  let summe = 0, hell = 0, grell = 0, papier = 0, papierSumme = 0, papierN = 0;
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const r = d[i], gg = d[i + 1], b = d[i + 2];
    const l = 0.299 * r + 0.587 * gg + 0.114 * b;
    L[p] = l; summe += l;
    if (l > 250) grell++;
    const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    if (l > 140 && (mx - mn) < 60) { papier++; if (l <= 250) { papierSumme += l; papierN++; } }
    if (l > 160) hell++;
  }
  const n = w * h, mittel = summe / n;
  // Schärfe: Varianz des Laplace-Operators
  let ls = 0, lq = 0, lc = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const p = y * w + x;
    const v = 4 * L[p] - L[p - 1] - L[p + 1] - L[p - w] - L[p + w];
    ls += v; lq += v * v; lc++;
  }
  const schaerfe = lq / lc - (ls / lc) ** 2;
  // Schrift: deutlich dunkler als die Umgebung (lokal, 9×9-Fenster grob über Zeilenmittel)
  let tinte = 0;
  const blockMittel = (x, y) => { let s = 0, c = 0; for (let yy = Math.max(0, y - 6); yy < Math.min(h, y + 7); yy += 3) for (let xx = Math.max(0, x - 6); xx < Math.min(w, x + 7); xx += 3) { s += L[yy * w + xx]; c++; } return s / c; };
  for (let y = 2; y < h - 2; y += 2) for (let x = 2; x < w - 2; x += 2) if (L[y * w + x] < blockMittel(x, y) - 45) tinte++;
  const tintenAnteil = tinte / ((w / 2) * (h / 2));
  // Schatten: Helligkeit der vier Viertel vergleichen
  const viertel = [0, 0, 0, 0], vc = [0, 0, 0, 0];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const q = (y < h / 2 ? 0 : 2) + (x < w / 2 ? 0 : 1); viertel[q] += L[y * w + x]; vc[q]++; }
  const vm = viertel.map((s, i) => s / vc[i]);
  const schatten = Math.max(...vm) - Math.min(...vm);

  const probleme = [];
  if (mittel < 85) probleme.push(["dunkel", "Zu dunkel", "Geh näher ans Fenster oder schalte eine Lampe an."]);
  else if (grell / n > 0.04 && papierN > 0 && papierSumme / papierN < 205) probleme.push(["grell", "Lichtreflex auf dem Blatt", "Blitz aus und das Handy etwas kippen, bis der helle Fleck weg ist."]);
  if (papier / n < 0.45) probleme.push(["rahmen", "Das Blatt füllt den Rahmen nicht", "Geh näher ran, bis das Blatt den goldenen Rahmen ausfüllt."]);
  if (schaerfe < 35) probleme.push(["unscharf", "Unscharf", "Halt das Handy ruhig und tipp aufs Blatt, damit die Kamera scharfstellt."]);
  if (schatten > 55 && mittel >= 85) probleme.push(["schatten", "Schatten auf dem Blatt", "Dreh dich so, dass weder du noch das Handy einen Schatten werfen."]);
  if (tintenAnteil < 0.004 && papier / n >= 0.45) probleme.push(["leer", "Kaum Schrift zu sehen", "Schreib mit schwarzem Stift – Bleistift und Blau liest Mathilda schlecht."]);
  return { probleme, werte: { mittel, schaerfe, papier: papier / n, tinte: tintenAnteil, schatten } };
}

/* ---------- Fenster ---------- */
export function BlattScanner({ offen, onSchliessen, onFoto, onKameraApp, onGalerie }) {
  const videoRef = useRef(null);
  const kastenRef = useRef(null);
  const streamRef = useRef(null);
  const fotoRef = useRef(null);
  const [zustand, setZustand] = useState("start"); // start | live | fehler | pruefen
  const [vorschau, setVorschau] = useState(null);
  const [ergebnis, setErgebnis] = useState(null);
  const [blitz, setBlitz] = useState(false);
  const schliessenRef = useRef(onSchliessen);
  schliessenRef.current = onSchliessen;

  const stoppen = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const starten = useCallback(async () => {
    setZustand("start"); setVorschau(null); setErgebnis(null);
    if (!navigator.mediaDevices?.getUserMedia) { setZustand("fehler"); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" }, width: { ideal: 2560 }, height: { ideal: 1920 } },
      });
      streamRef.current = s;
      const v = videoRef.current;
      if (v) { v.srcObject = s; await v.play().catch(() => {}); }
      setZustand("live");
    } catch {
      setZustand("fehler");
    }
  }, []);

  useEffect(() => {
    if (!offen) { stoppen(); return undefined; }
    starten();
    const esc = (e) => { if (e.key === "Escape") schliessenRef.current(); };
    window.addEventListener("keydown", esc);
    const alt = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = alt; stoppen(); };
  }, [offen, starten, stoppen]);

  const ausloesen = () => {
    const v = videoRef.current, k = kastenRef.current;
    if (!v || !k || !v.videoWidth) return;
    // genau den sichtbaren Ausschnitt (object-fit: cover) übernehmen
    const bw = k.clientWidth, bh = k.clientHeight, vw = v.videoWidth, vh = v.videoHeight;
    const s = Math.max(bw / vw, bh / vh);
    const sw = bw / s, sh = bh / s, sx = (vw - sw) / 2, sy = (vh - sh) / 2;
    const zielB = Math.min(1600, Math.round(sw)), zielH = Math.round(zielB * DIN);
    const c = document.createElement("canvas"); c.width = zielB; c.height = zielH;
    c.getContext("2d").drawImage(v, sx, sy, sw, sh, 0, 0, zielB, zielH);
    fotoRef.current = c;
    setBlitz(true); setTimeout(() => setBlitz(false), 180);
    setVorschau(c.toDataURL("image/jpeg", 0.85));
    setErgebnis(fotoPruefen(c));
    setZustand("pruefen");
    stoppen();
  };

  const verwenden = () => {
    const c = fotoRef.current; if (!c) return;
    c.toBlob((b) => {
      if (!b) return;
      const datei = new File([b], `blatt-${Date.now()}.jpg`, { type: "image/jpeg" });
      onFoto(datei);
    }, "image/jpeg", 0.92);
  };

  if (!offen) return null;
  const ok = zustand === "pruefen" && ergebnis && ergebnis.probleme.length === 0;
  const schlecht = zustand === "pruefen" && ergebnis && ergebnis.probleme.length > 0;

  return (
    <div className="bs-huelle" role="dialog" aria-modal="true" aria-label="Blatt scannen" onClick={(e) => { if (e.target === e.currentTarget) onSchliessen(); }}>
      <style>{`
        .bs-huelle { position: fixed; inset: 0; z-index: 1000; background: rgba(6,12,32,0.72); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 12px; animation: bs-ein .2s ease both; }
        .bs-fenster { width: min(680px, 100%); max-height: calc(100dvh - 24px); overflow: auto; background: #FFFFFF; border-radius: 26px; box-shadow: 0 30px 80px rgba(0,0,0,0.45);
          display: grid; grid-template-columns: 1fr 1fr; gap: 0; position: relative; animation: bs-auf .28s cubic-bezier(.2,.8,.2,1) both; }
        .bs-links { padding: 26px 20px 22px 24px; display: flex; flex-direction: column; }
        .bs-rechts { padding: 14px; background: ${NACHT}; display: flex; flex-direction: column; gap: 12px; align-items: stretch; justify-content: center; }
        .bs-kasten { position: relative; width: 100%; aspect-ratio: 1 / ${DIN}; border-radius: 14px; overflow: hidden; background: #0A1430; }
        .bs-kasten video, .bs-kasten img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .bs-ecken { position: absolute; inset: 13% 7% 7% 7%; pointer-events: none; }
        .bs-ecken i { position: absolute; width: 22%; height: 16%; border: 3px solid ${GOLD}; border-radius: 4px; filter: drop-shadow(0 0 6px rgba(0,0,0,.5)); }
        .bs-ecken i:nth-child(1) { left: 0; top: 0; border-right: none; border-bottom: none; }
        .bs-ecken i:nth-child(2) { right: 0; top: 0; border-left: none; border-bottom: none; }
        .bs-ecken i:nth-child(3) { right: 0; bottom: 0; border-left: none; border-top: none; }
        .bs-ecken i:nth-child(4) { left: 0; bottom: 0; border-right: none; border-top: none; }
        .bs-ecken[data-ok="1"] i { border-color: #3DDC84; }
        .bs-ecken[data-schlecht="1"] i { border-color: #FF8A5B; }
        .bs-din { position: absolute; left: 50%; top: 10px; transform: translateX(-50%); background: rgba(14,30,74,.75); color: ${GOLD}; font-size: 10.5px; font-weight: 800; letter-spacing: .14em; padding: 4px 9px; border-radius: 999px; }
        .bs-ausloeser { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); width: 64px; height: 64px; border-radius: 999px; border: 4px solid ${GOLD}; background: rgba(255,255,255,.18);
          display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; -webkit-tap-highlight-color: transparent; transition: transform .12s ease; box-shadow: 0 4px 16px rgba(0,0,0,.35); }
        .bs-ausloeser span { width: 46px; height: 46px; border-radius: 999px; background: #FFFFFF; display: block; }
        .bs-ausloeser:active { transform: translateX(-50%) scale(.92); }
        .bs-blitz { position: absolute; inset: 0; background: #FFF; opacity: 0; transition: opacity .18s ease; pointer-events: none; }
        .bs-blitz[data-an="1"] { opacity: .85; transition: none; }
        .bs-zu { position: absolute; right: 10px; top: 10px; z-index: 2; width: 36px; height: 36px; border-radius: 999px; border: none; background: rgba(255,255,255,.92); color: ${NACHT}; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,.2); }
        .bs-schritt { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px; }
        .bs-schritt b { width: 24px; height: 24px; border-radius: 999px; background: ${NACHT}; color: ${GOLD}; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex: none; }
        .bs-schritt span { font-size: 14px; line-height: 1.45; color: ${C.tinte}; }
        .bs-knopf { height: 48px; border-radius: 999px; border: none; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; padding: 0 18px; }
        .bs-gold { background: linear-gradient(135deg, #F8D23A 0%, ${GOLD} 55%, #D9A600 100%); color: ${NACHT}; box-shadow: 0 6px 18px rgba(237,187,0,.35); }
        .bs-hell { background: transparent; color: ${C.see}; border: 1.5px solid ${C.linie}; }
        .bs-link { background: none; border: none; padding: 0; font-family: inherit; color: ${C.see}; font-size: 13px; font-weight: 600; text-decoration: underline; cursor: pointer; text-align: left; }
        @keyframes bs-ein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bs-auf { from { opacity: 0; transform: translateY(18px) scale(.98); } to { opacity: 1; transform: none; } }
        @media (max-width: 560px) {
          .bs-fenster { border-radius: 22px; }
          .bs-links { padding: 18px 12px 16px 16px; }
          .bs-rechts { padding: 10px; }
          .bs-schritt span { font-size: 12.5px; }
          .bs-schritt { gap: 8px; margin-bottom: 9px; }
          .bs-schritt b { width: 20px; height: 20px; font-size: 11px; }
          .bs-ausloeser { width: 56px; height: 56px; bottom: 10px; }
          .bs-ausloeser span { width: 40px; height: 40px; }
          .bs-knopf { height: 42px; font-size: 13.5px; padding: 0 12px; }
        }
        @media (prefers-reduced-motion: reduce) { .bs-huelle, .bs-fenster { animation: none; } }
      `}</style>
      <div className="bs-fenster">
        <button type="button" className="bs-zu" onClick={onSchliessen} aria-label="Schließen">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        <div className="bs-links">
          {zustand !== "pruefen" ? (
            <>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.see, marginBottom: 6 }}>Scan dein Blatt</p>
              <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, color: C.tinte, marginBottom: 16 }}>Blatt in den Rahmen – fertig.</p>
              <div className="bs-schritt"><b>1</b><span>Blatt flach auf den Tisch, Handy <strong>gerade darüber</strong>.</span></div>
              <div className="bs-schritt"><b>2</b><span>Das Blatt füllt den <strong style={{ color: "#B48A00" }}>goldenen Rahmen</strong>.</span></div>
              <div className="bs-schritt"><b>3</b><span>Gutes Licht, kein Schatten – dann auslösen.</span></div>
              <div style={{ marginTop: "auto", paddingTop: 10 }}>
                <button type="button" className="bs-link" onClick={onGalerie}>Foto aus der Galerie wählen</button>
              </div>
            </>
          ) : ok ? (
            <>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.smaragd, marginBottom: 6 }}>Foto geprüft</p>
              <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, color: C.tinte, marginBottom: 10 }}>Sieht gut aus.</p>
              <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.55, fontWeight: 300 }}>Licht, Schärfe und Rahmen passen. Mathilda kann loslegen.</p>
              <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <button type="button" className="bs-knopf bs-gold" onClick={verwenden}>Foto verwenden</button>
                <button type="button" className="bs-knopf bs-hell" onClick={starten}>Nochmal</button>
              </div>
            </>
          ) : schlecht ? (
            <>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.signal, marginBottom: 6 }}>Fast</p>
              <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, color: C.tinte, marginBottom: 12 }}>Das geht noch besser.</p>
              {ergebnis.probleme.slice(0, 2).map(([id, t, s]) => (
                <div key={id} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.signal, lineHeight: 1.3 }}>{t}</p>
                  <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.5, fontWeight: 300, marginTop: 2 }}>{s}</p>
                </div>
              ))}
              <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <button type="button" className="bs-knopf bs-gold" onClick={starten}>Nochmal fotografieren</button>
                <button type="button" className="bs-link" style={{ alignSelf: "center" }} onClick={verwenden}>Trotzdem verwenden</button>
              </div>
            </>
          ) : null}
        </div>

        <div className="bs-rechts">
          <div className="bs-kasten" ref={kastenRef}>
            {zustand === "pruefen" && vorschau ? (
              <img src={vorschau} alt="Dein Foto" />
            ) : (
              <video ref={videoRef} playsInline muted autoPlay />
            )}
            {zustand === "fehler" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 16, textAlign: "center" }}>
                <p style={{ color: "#DCE5F6", fontSize: 13.5, lineHeight: 1.5 }}>Die Kamera lässt sich hier nicht direkt öffnen.</p>
                <button type="button" className="bs-knopf bs-gold" onClick={onKameraApp}>Kamera-App öffnen</button>
              </div>
            )}
            {zustand === "start" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "#8FA3CC", fontSize: 13 }}>Kamera startet…</p>
              </div>
            )}
            <div className="bs-ecken" data-ok={ok ? "1" : "0"} data-schlecht={schlecht ? "1" : "0"}><i /><i /><i /><i /></div>
            <span className="bs-din">DIN A4</span>
            {zustand === "live" && <button type="button" className="bs-ausloeser" onClick={ausloesen} aria-label="Foto aufnehmen"><span /></button>}
            <div className="bs-blitz" data-an={blitz ? "1" : "0"} />
          </div>
        </div>
      </div>
    </div>
  );
}
