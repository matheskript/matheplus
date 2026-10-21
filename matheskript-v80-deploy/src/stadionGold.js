/* ======================================================================
   STADION OHNE GOLD (21.10.2026)

   In der Stadion-Ansicht (Rot-Weiß-Blau, startModus.js) verschwindet Gold
   fast überall: Wortmarke, Menüknöpfe, Kacheln, Kurs-Kacheln, Bildzeichen.
   Gold bleibt nur, wo ein Element (oder ein Vorfahr) data-gold-bleibt trägt:
   Mathildas Name (MathildaName, MathildaKnopfSchrift), ihre Haare und das
   Etikett „Deine Tutorin“.

   Wie: Gold steckt in hunderten Stellen (inline-Stile, SVG-Attribute,
   <style>-Blöcke der Komponenten). Statt jede Datei anzufassen, ersetzt
   dieses Modul goldene Farben durch var(--st-gold, <altes Gold>) bzw.
   var(--st-flaeche, …) für Flächen:
   - inline style und SVG-Attribute (fill, stroke, stop-color) direkt am Element,
   - Stylesheet-Regeln über eine eigene Überschreib-Stilvorlage (!important).
   Die Variablen gibt es nur unter html[data-start-edition="stadion"]; in allen
   anderen Ansichten greift der Rückfallwert = das ursprüngliche Gold.
   Kontext: auf weißem Blatt wird Gold Rot, auf farbigen Flächen (Bühne, Inseln,
   Kopfleiste, Menüs, Kurs-Kacheln) Weiß – siehe STADION_VARIABLEN.

   Reine Text-Funktionen (goldErsetzen, istGold) sind ohne Browser testbar.
   ====================================================================== */

export const ROT = "#DC052D";
export const ROT_TIEF = "#A3001F";
export const BLAU = "#0066B2";
export const BLAU_TIEF = "#00447A";

/* Gold-artige Farbe? (Gold, Dunkelgold, Bernstein, helles Gold) – Rot, Pink, Orange, Creme bleiben außen vor */
export function istGold(r, g, b) {
  if (r >= 150 && g >= 110 && b <= 110 && r - b >= 90 && g - b >= 50 && r >= g && r - g <= 90) return true;   // Gold, Bernstein, Dunkelgold-hell
  if (r >= 70 && g >= 50 && b <= 30 && r > g && g / r >= 0.6 && g / r <= 0.9) return true;                  // Dunkelgold (#8A6A00, #5A4300 …)
  if (r >= 240 && g >= 200 && b >= 100 && b <= 160 && r - b >= 90) return true;                              // helles Gold (#FFE58A)
  return false;
}

const HEX = /#([0-9a-f]{6}|[0-9a-f]{3})\b/gi;
const RGB = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+%?)\s*)?\)/gi;

function hexZuRgb(h) {
  let s = h.slice(1);
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

/* Marken-Blau (see, seeTief, Navy der Kacheln …)? Nur kräftige Blautöne – Hellblau und Nachtschwarz bleiben außen vor.
   Wird in der GER-Ansicht über var(--gb-blau, <altes Blau>) zu Schwarz, aber nur in der App-Hülle
   (Startseite, Kopfleiste, Menüs, Fußzeile) – in den Werkzeugen bleibt Blau Blau (Farbcodes!). */
export function istBlau(r, g, b) {
  return r <= 80 && b >= 90 && b - r >= 70 && b - g >= 30;
}

/* Ersetzt goldene Farben in einem CSS-Wert. art: "gold" (Linien, Text) oder "flaeche" (Hintergründe).
   Ergebnis behält das alte Gold als Rückfallwert, Transparenz über color-mix. */
export function goldErsetzen(wert, art = "gold", nur = null) {
  if (!wert || wert.includes("--st-") || wert.includes("--gb-")) return wert;
  const fl = art === "flaeche";
  /* nur: "gold" oder "blau" – für Stylesheet-Regeln getrennt, weil jede Ersetzung nur in ihrer Ansicht gelten darf */
  const varFuer = (r, g, b) => (nur !== "blau" && istGold(r, g, b) ? (fl ? "--st-flaeche" : "--st-gold")
    : nur !== "gold" && istBlau(r, g, b) ? (fl ? "--gb-flaeche" : "--gb-blau") : null);
  let neu = String(wert).replace(RGB, (m, r, g, b, a) => {
    const v = varFuer(+r, +g, +b);
    if (!v) return m;
    const alt = `rgb(${r}, ${g}, ${b})`;
    if (a === undefined) return `var(${v}, ${alt})`;
    const p = a.endsWith("%") ? parseFloat(a) : parseFloat(a) * 100;
    if (p >= 100) return `var(${v}, ${alt})`;
    return `color-mix(in srgb, var(${v}, ${alt}) ${Math.round(p * 10) / 10}%, transparent)`;
  });
  neu = neu.replace(HEX, (m) => {
    const [r, g, b] = hexZuRgb(m);
    const v = varFuer(r, g, b);
    return v ? `var(${v}, ${m})` : m;
  });
  return neu;
}

const FLAECHE = /^(background|background-color|background-image|box-shadow)$/;
const DUNKLER_TEXT = /^(#050b1f|#0e1e4a|#0f1a33|rgb\(5, 11, 31\)|rgb\(14, 30, 74\)|rgb\(15, 26, 51\))$/i;

/* Eine Deklarationsliste (Eigenschaft → Wert) umfärben. Liegt eine goldene Fläche unter dunklem Text,
   wird der Text zu var(--st-auf-flaeche) – sonst stünde Nachtblau auf Rot. */
export function deklarationenUmfaerben(paare, nur = null) {
  let geaendert = false, flaecheGold = false;
  const aus = paare.map(([p, w, wichtig]) => {
    const n = goldErsetzen(w, FLAECHE.test(p) ? "flaeche" : "gold", nur);
    if (n !== w) { geaendert = true; if (FLAECHE.test(p) && n.includes("--st-")) flaecheGold = true; }
    return [p, n, wichtig];
  });
  if (flaecheGold) {
    for (const e of aus) if (e[0] === "color" && DUNKLER_TEXT.test(String(e[1]).trim())) { e[1] = `var(--st-auf-flaeche, ${e[1]})`; geaendert = true; }
  }
  return geaendert ? aus : null;
}

/* Kontext-Variablen: Rot auf Weiß, Weiß auf Farbe. Farbige Flächen der App in Stadion: */
const FARBIG = [
  ".sbb-insel", ".sbb-held", ".sbb-streifen", ".kl", ".hmd", ".hm-mathilda", ".hm-karte-dunkel",
  ".kk", ".kk-kachel", "[data-kurs-kachel]", ".mz", ".fb-fuss",
].join(", ");

export const STADION_VARIABLEN = `
/* GER: Marken-Blau wird Schwarz – nur in der App-Hülle; Kurs-Kacheln behalten ihren Lack */
:root[data-start-edition="ger"] :is(.sbb, .kl, .hmd, .hm-fenster, .seiten-fuss, .fuss-paar) { --gb-blau: #0A0A0A; --gb-flaeche: #141414; }
:root[data-start-edition="ger"] :is(.kk, .hmd-lack, [data-kurs-kachel]) { --gb-blau: initial; --gb-flaeche: initial; }
:root[data-start-edition="stadion"] { --st-gold: ${ROT}; --st-flaeche: ${ROT}; --st-auf-flaeche: #FFFFFF; }
:root[data-start-edition="stadion"] :is(${FARBIG}) { --st-gold: #FFFFFF; --st-flaeche: #FFFFFF; --st-auf-flaeche: ${ROT}; }
:root[data-start-edition="stadion"] :is(.sbb-streifen) { --st-auf-flaeche: ${BLAU}; }
:root[data-start-edition="stadion"] :is(.hmd-buch, .hm-klasse-karte) { --st-gold: ${ROT}; --st-flaeche: ${ROT}; --st-auf-flaeche: #FFFFFF; }
/* Cremefarbene Klassen-Karten (Dein Schulbuch) werden weiß mit rotem Rand */
:root[data-start-edition="stadion"] :is(.hmd-buch, .hm-klasse-karte) { background: #FFFFFF !important; border-color: rgba(220,5,45,0.45) !important; }
:root[data-start-edition="stadion"] .hm-klasse-karte { box-shadow: 0 0 0 1.5px rgba(220,5,45,0.45) !important; }
:root[data-start-edition="stadion"] .hmd-stufen button[aria-pressed="true"] { color: ${ROT} !important; }
:root[data-start-edition="stadion"] :is([data-kk-hell]) { --st-gold: ${ROT}; --st-flaeche: ${ROT}; --st-auf-flaeche: #FFFFFF; }
:root[data-start-edition="stadion"] [data-gold-bleibt] { --st-gold: initial; --st-flaeche: initial; --st-auf-flaeche: initial; }
/* Weiße Bühne der Startseite: Gold wird dort Rot (sie ist Insel, aber hell) */
:root[data-start-edition="stadion"] .sbb-held { --st-gold: ${ROT}; --st-flaeche: ${ROT}; --st-auf-flaeche: #FFFFFF; }
:root[data-start-edition="stadion"] .sbb-mythen-streifen { --st-auf-flaeche: ${ROT}; }
/* Kopfleiste und Fußzeile gleich: Rot, MYTHOS und .DE Blau mit weißem Rand, MATHE Weiß, + und = Blau */
:root[data-start-edition="stadion"] .seiten-fuss { background: radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 55%),
  linear-gradient(155deg, #F0284A 0%, ${ROT} 45%, ${ROT_TIEF} 100%) !important; }
:root[data-start-edition="stadion"] .seiten-fuss button { color: #FFE0E6 !important; }
:root[data-start-edition="stadion"] .seiten-fuss .fuss-zeichen { color: ${BLAU_TIEF} !important; font-weight: 900; }
:root[data-start-edition="stadion"] :is(.kl, .seiten-fuss) :is(.marke-mythos, .marke-de) { color: ${BLAU};
  text-shadow: 1px 0 0 #FFFFFF, -1px 0 0 #FFFFFF, 0 1px 0 #FFFFFF, 0 -1px 0 #FFFFFF, 0.7px 0.7px 0 #FFFFFF, -0.7px 0.7px 0 #FFFFFF, 0.7px -0.7px 0 #FFFFFF, -0.7px -0.7px 0 #FFFFFF; }
:root[data-start-edition="stadion"] :is(.kl, .seiten-fuss) .marke-mathe { color: #FFFFFF !important; -webkit-text-fill-color: #FFFFFF !important; }
/* Wortmarke sonst: MATHE in Weiß (auf Farbe) bzw. Rot (auf Weiß), ohne Verlauf */
:root[data-start-edition="stadion"] .marke-mathe { background-image: none !important; -webkit-background-clip: border-box !important; background-clip: border-box !important; color: var(--st-gold) !important; -webkit-text-fill-color: currentColor !important; }
`;

/* Nur weicher Gold-Schimmer (jede goldene Farbe mit Deckkraft ≤ 0,25)? Solche Verläufe liegen als Licht über einer
   Fläche aus einer anderen Regel – eine !important-Überschreibung würde diese Fläche mit wegnehmen. */
export function nurSchimmer(wert) {
  let gold = 0, schwach = 0;
  String(wert).replace(RGB, (m, r, g, b, a) => {
    if (istGold(+r, +g, +b)) { gold++; const x = a === undefined ? 1 : (a.endsWith("%") ? parseFloat(a) / 100 : parseFloat(a)); if (x <= 0.25) schwach++; }
    return m;
  });
  return gold > 0 && gold === schwach;
}

/* ---------------- Browser-Teil ---------------- */
const AUS = "[data-gold-bleibt]";
const ATTRIBUTE = ["fill", "stroke", "stop-color", "flood-color", "color"];

function inGoldBleibt(el) { return !!(el && el.closest && el.closest(AUS)); }

function elementUmfaerben(el) {
  if (!el || el.nodeType !== 1 || inGoldBleibt(el)) return;
  /* inline style */
  const st = el.getAttribute("style");
  if (st && /rgb|#/i.test(st)) {
    const paare = [];
    for (let i = 0; i < el.style.length; i++) { const p = el.style[i]; paare.push([p, el.style.getPropertyValue(p), el.style.getPropertyPriority(p)]); }
    const neu = deklarationenUmfaerben(paare);
    if (neu) for (const [p, w, wichtig] of neu) if (w !== el.style.getPropertyValue(p)) el.style.setProperty(p, w, wichtig);
  }
  /* SVG-Attribute */
  if (el instanceof SVGElement) {
    for (const a of ATTRIBUTE) {
      const w = el.getAttribute(a);
      if (!w || w.includes("--st-")) continue;
      const n = goldErsetzen(w, "gold");
      if (n !== w) { el.style.setProperty(a, n); }
    }
  }
}

function baumUmfaerben(wurzel) {
  if (!wurzel || wurzel.nodeType !== 1) return;
  elementUmfaerben(wurzel);
  const alle = wurzel.querySelectorAll("[style], [fill], [stroke], [stop-color]");
  for (const el of alle) elementUmfaerben(el);
}

/* Stylesheet-Regeln mit Gold → Überschreib-Regeln (nur in Stadion, !important) */
const erledigt = new WeakMap();
let vorlage = null;

function regelnSammeln(liste, aus, rahmen) {
  for (const r of Array.from(liste || [])) {
    if (r.type === 1 && r.selectorText) {
      const paare = [];
      for (let i = 0; i < r.style.length; i++) { const p = r.style[i]; paare.push([p, r.style.getPropertyValue(p), r.style.getPropertyPriority(p)]); }
      const alt = Object.fromEntries(paare.map(([p, w]) => [p, w]));
      /* Zwei getrennte Überschreibungen: Gold nur in FCB (stadion), Marken-Blau nur in GER. Regeln der Grund-Modi
         (data-modus="mix"/"hell"/"dunkel") bekommen in GER keine Blau-Überschreibung – die färbt GER selbst um
         (sonst schlüge das !important die eigenen GER-Regeln). */
      for (const [nur, ed2] of [["gold", "stadion"], ["blau", "ger"]]) {
        if (nur === "blau" && /data-(start-)?modus=/.test(r.selectorText)) continue;
        const quelle = nur === "gold" ? paare.filter(([p, w]) => !(p === "background-image" && nurSchimmer(w))) : paare;
        const neu = deklarationenUmfaerben(quelle, nur);
        if (!neu) continue;
        const teile = neu.filter(([p, w]) => w !== alt[p]).map(([p, w]) => `${p}: ${w} !important;`);
        if (!teile.length) continue;
        /* :where() hält die Spezifität klein, :is(…) behält die des Originals; !important schlägt Original und inline */
        const sel = `:is(${r.selectorText}):where(:root[data-start-edition="${ed2}"] *):not(${AUS}, ${AUS} *)`;
        aus.push(rahmen ? `${rahmen} { ${sel} { ${teile.join(" ")} } }` : `${sel} { ${teile.join(" ")} }`);
      }
    } else if (r.cssRules && (r.type === 4 || r.type === 12)) {
      regelnSammeln(r.cssRules, aus, `${r.type === 4 ? "@media" : "@supports"} ${r.conditionText || (r.media && r.media.mediaText) || ""}`);
    }
  }
}

function blattText(knoten) { return knoten.textContent || ""; }

function stilvorlagenPruefen() {
  if (!vorlage) return;
  let geaendert = false;
  for (const blatt of Array.from(document.styleSheets)) {
    const k = blatt.ownerNode;
    if (!k || k === vorlage) continue;
    const kennung = k.tagName === "STYLE" ? blattText(k) : (blatt.href || "");
    if (erledigt.get(k) === kennung) continue;
    let regeln;
    try { regeln = blatt.cssRules; } catch { continue; }
    const aus = [];
    regelnSammeln(regeln, aus, null);
    erledigt.set(k, kennung);
    k.__stadionRegeln = aus.join("\n");
    geaendert = true;
  }
  if (geaendert) {
    const alle = [STADION_VARIABLEN];
    for (const blatt of Array.from(document.styleSheets)) { const k = blatt.ownerNode; if (k && k.__stadionRegeln) alle.push(k.__stadionRegeln); }
    vorlage.textContent = alle.join("\n");
    document.head.appendChild(vorlage);   // bleibt die letzte Vorlage
  }
}

let beobachter = null, geplant = false;
const offen = new Set();

function planen() {
  if (geplant) return;
  geplant = true;
  requestAnimationFrame(() => {
    geplant = false;
    const liste = Array.from(offen); offen.clear();
    for (const el of liste) if (el.isConnected) baumUmfaerben(el);
    stilvorlagenPruefen();
  });
}

function an() {
  if (!vorlage) { vorlage = document.createElement("style"); vorlage.setAttribute("data-stadion-gold", ""); document.head.appendChild(vorlage); }
  stilvorlagenPruefen();
  baumUmfaerben(document.body);
  if (beobachter) return;
  beobachter = new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === "childList") { for (const n of m.addedNodes) if (n.nodeType === 1) offen.add(n); if (m.target.nodeName === "STYLE") offen.add(document.body); }
      else if (m.type === "characterData") { /* Text einer <style> geändert */ offen.add(document.body); }
      else offen.add(m.target);
    }
    planen();
  });
  beobachter.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["style", ...ATTRIBUTE] });
}

/* Start: einmal beim Laden und bei jedem Moduswechsel. Einmal umgefärbte Werte behalten ihren
   Rückfallwert (das alte Gold), deshalb ist Ausschalten nur: Beobachter aus, Variablen weg. */
export function stadionGoldStarten(istStadion, ereignis) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const pruefen = () => {
    if (istStadion()) { if (document.body) an(); else window.addEventListener("DOMContentLoaded", an, { once: true }); }
    else if (beobachter) { beobachter.disconnect(); beobachter = null; }
  };
  pruefen();
  window.addEventListener(ereignis, pruefen);
}
