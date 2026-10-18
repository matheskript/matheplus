// Baut das Schulbuch "Ableitungen" aus pages/*.html zu dist/buch.html
// Seitendatei: erste Zeile <!-- kap: I | ukap: 1 Mittlere Änderungsrate | typ: normal -->
// Inhalt: Hauptspalte, optional nach <!--rand--> die Randspalte.
// Mathe: $...$ inline, $$...$$ abgesetzt (KaTeX, serverseitig).
// Grafik: <graph>{ JSON }</graph>
import fs from "node:fs";
import path from "node:path";
import katex from "katex";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const PAGES = path.join(ROOT, "pages");
const DIST = path.join(ROOT, "dist");
fs.mkdirSync(path.join(DIST, "fonts"), { recursive: true });

// ---------- Schriften kopieren ----------
const mont = path.join(ROOT, "node_modules/@fontsource/montserrat/files");
for (const w of [400, 500, 600, 700, 800]) for (const s of ["normal", "italic"]) {
  const f = `montserrat-latin-${w}-${s}.woff2`;
  fs.copyFileSync(path.join(mont, f), path.join(DIST, "fonts", f));
  const fe = `montserrat-latin-ext-${w}-${s}.woff2`;
  if (fs.existsSync(path.join(mont, fe))) fs.copyFileSync(path.join(mont, fe), path.join(DIST, "fonts", fe));
}
const kfonts = path.join(ROOT, "node_modules/katex/dist/fonts");
fs.mkdirSync(path.join(DIST, "fonts/katex"), { recursive: true });
for (const f of fs.readdirSync(kfonts)) if (f.endsWith(".woff2")) fs.copyFileSync(path.join(kfonts, f), path.join(DIST, "fonts/katex", f));
let kcss = fs.readFileSync(path.join(ROOT, "node_modules/katex/dist/katex.min.css"), "utf8")
  .replace(/url\(fonts\//g, "url(fonts/katex/")
  .replace(/,url\([^)]*\.woff\) format\("woff"\)/g, "").replace(/,url\([^)]*\.ttf\) format\("truetype"\)/g, "");
fs.writeFileSync(path.join(DIST, "katex.css"), kcss);

// ---------- Farben ----------
export const FARBE = {
  see: "#004D98", seeTief: "#0E1E4A", grana: "#A50044", granaHell: "#D4145A",
  gold: "#EDBB00", goldDunkel: "#B88A00", grau: "#8A93A6", hell: "#E8EEF7",
};
const KAPFARBE = { "I": FARBE.see, "II": FARBE.grana, "III": FARBE.seeTief, "L": FARBE.seeTief, "0": FARBE.seeTief };

// ---------- Mathe ----------
const ent = (t) => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
function mathe(src) {
  // erst abgesetzt, dann inline; \$ als echtes Dollarzeichen
  src = src.replace(/\\\$/g, "\u0000DOLLAR\u0000");
  src = src.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => {
    try { return `<div class="formel">${katex.renderToString(ent(t.trim()), { displayMode: true, throwOnError: true, strict: false })}</div>`; }
    catch (e) { throw new Error("KaTeX (display): " + t + "\n" + e.message); }
  });
  src = src.replace(/\$([^$]+?)\$/g, (_, t) => {
    try { return katex.renderToString(ent(t.trim()), { displayMode: false, throwOnError: true, strict: false }); }
    catch (e) { throw new Error("KaTeX (inline): " + t + "\n" + e.message); }
  });
  return src.replace(/\u0000DOLLAR\u0000/g, "$");
}

// ---------- Grafik ----------
// spec: { b: Breite mm, h: Höhe mm, x:[a,b], y:[c,d], fn:[{f:"x*x", c:"see", w:1.6, d:"" , von, bis, label, lx, ly}],
//   gerade:[{p:[x,y], q:[x,y], c, w, d}] (bis Rand verlängert), strecke:[{p,q,c,w,d,pfeil}],
//   punkt:[{x,y,c,t,pos:"o|u|l|r|ol|or|ul|ur", leer}], text:[{x,y,t,c,pos,g}], achsen:true, gitter:1, tx:1, ty:1, xl:"x", yl:"y",
//   flaeche:[{f, von, bis, c}], keineZahlen }
const fnCache = new Map();
function F(src) {
  if (!fnCache.has(src)) {
    const body = src.replace(/\bsin\b/g, "Math.sin").replace(/\bcos\b/g, "Math.cos").replace(/\btan\b/g, "Math.tan")
      .replace(/\bexp\b/g, "Math.exp").replace(/\bln\b/g, "Math.log").replace(/\bsqrt\b/g, "Math.sqrt").replace(/\bPI\b/g, "Math.PI").replace(/\babs\b/g, "Math.abs");
    fnCache.set(src, new Function("x", `return (${body});`));
  }
  return fnCache.get(src);
}
const farbe = (c) => FARBE[c] || c || FARBE.see;
const fmt = (v) => {
  const r = Math.round(v * 1000) / 1000;
  return (r < 0 ? "−" : "") + String(Math.abs(r)).replace(".", ",");
};
function graph(spec) {
  const B = spec.b ?? 70, H = spec.h ?? 50; // mm
  const S = 4; // px pro mm im viewBox
  const W = B * S, Hh = H * S;
  const [x0, x1] = spec.x, [y0, y1] = spec.y;
  const pad = 2;
  const X = (x) => pad + (x - x0) / (x1 - x0) * (W - 2 * pad);
  const Y = (y) => Hh - pad - (y - y0) / (y1 - y0) * (Hh - 2 * pad);
  const out = [];
  out.push(`<svg class="graph" viewBox="0 0 ${W} ${Hh}" width="${B}mm" height="${H}mm" xmlns="http://www.w3.org/2000/svg">`);
  out.push(`<defs><clipPath id="c${++graph.n}"><rect x="0" y="0" width="${W}" height="${Hh}"/></clipPath>
    <marker id="pf${graph.n}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="${FARBE.seeTief}"/></marker>
    <marker id="pk${graph.n}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="currentColor"/></marker></defs>`);
  const id = graph.n;
  // Gitter
  const g = spec.gitter ?? 1;
  if (g) {
    const [gx, gy] = Array.isArray(g) ? g : [g, g];
    const gl = [];
    for (let x = Math.ceil(x0 / gx) * gx; x <= x1 + 1e-9; x += gx) gl.push(`M${X(x).toFixed(1)},0V${Hh}`);
    for (let y = Math.ceil(y0 / gy) * gy; y <= y1 + 1e-9; y += gy) gl.push(`M0,${Y(y).toFixed(1)}H${W}`);
    out.push(`<path d="${gl.join("")}" stroke="#D5DDEB" stroke-width="0.7" fill="none"/>`);
  }
  // Flächen
  for (const fl of spec.flaeche ?? []) {
    const f = F(fl.f), pts = [];
    const n = 120;
    for (let i = 0; i <= n; i++) { const x = fl.von + (fl.bis - fl.von) * i / n; pts.push(`${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`); }
    out.push(`<polygon clip-path="url(#c${id})" points="${X(fl.von).toFixed(1)},${Y(0).toFixed(1)} ${pts.join(" ")} ${X(fl.bis).toFixed(1)},${Y(0).toFixed(1)}" fill="${farbe(fl.c)}" opacity="${fl.o ?? 0.15}"/>`);
  }
  // Achsen
  if (spec.achsen !== false) {
    const ax = [];
    if (y0 <= 0 && y1 >= 0) ax.push(`<line x1="0" y1="${Y(0)}" x2="${W - 1}" y2="${Y(0)}" stroke="${FARBE.seeTief}" stroke-width="1.3" marker-end="url(#pf${id})"/>`);
    if (x0 <= 0 && x1 >= 0) ax.push(`<line x1="${X(0)}" y1="${Hh}" x2="${X(0)}" y2="1" stroke="${FARBE.seeTief}" stroke-width="1.3" marker-end="url(#pf${id})"/>`);
    out.push(ax.join(""));
    const tx = spec.tx ?? 1, ty = spec.ty ?? 1;
    const t = [];
    if (!spec.keineZahlen) {
      if (y0 <= 0 && y1 >= 0) for (let x = Math.ceil(x0 / tx) * tx; x <= x1 - tx * 0.4; x += tx) {
        if (Math.abs(x) < 1e-9) continue;
        t.push(`<line x1="${X(x)}" y1="${Y(0) - 3}" x2="${X(x)}" y2="${Y(0) + 3}" stroke="${FARBE.seeTief}" stroke-width="1"/>`);
        t.push(`<text x="${X(x)}" y="${Y(0) + 14}" class="tz" text-anchor="middle">${fmt(x)}</text>`);
      }
      if (x0 <= 0 && x1 >= 0) for (let y = Math.ceil(y0 / ty) * ty; y <= y1 - ty * 0.4; y += ty) {
        if (Math.abs(y) < 1e-9) continue;
        t.push(`<line x1="${X(0) - 3}" y1="${Y(y)}" x2="${X(0) + 3}" y2="${Y(y)}" stroke="${FARBE.seeTief}" stroke-width="1"/>`);
        t.push(`<text x="${X(0) - 6}" y="${Y(y) + 4}" class="tz" text-anchor="end">${fmt(y)}</text>`);
      }
    }
    if (y0 <= 0 && y1 >= 0) t.push(`<text x="${W - 4}" y="${Y(0) - 7}" class="al" text-anchor="end">${spec.xl ?? "x"}</text>`);
    if (x0 <= 0 && x1 >= 0) t.push(`<text x="${X(0) + 7}" y="13" class="al">${spec.yl ?? "y"}</text>`);
    out.push(t.join(""));
  }
  // Funktionen
  for (const fn of spec.fn ?? []) {
    const f = F(fn.f), a = fn.von ?? x0, b = fn.bis ?? x1, n = 400;
    let d = "", pen = false;
    for (let i = 0; i <= n; i++) {
      const x = a + (b - a) * i / n, y = f(x);
      if (!isFinite(y) || y > y1 + (y1 - y0) * 3 || y < y0 - (y1 - y0) * 3) { pen = false; continue; }
      d += (pen ? "L" : "M") + X(x).toFixed(1) + "," + Y(y).toFixed(1); pen = true;
    }
    out.push(`<path clip-path="url(#c${id})" d="${d}" stroke="${farbe(fn.c)}" stroke-width="${fn.w ?? 2}" fill="none" ${fn.d ? `stroke-dasharray="${fn.d}"` : ""} stroke-linejoin="round" stroke-linecap="round"/>`);
    if (fn.label) out.push(`<text x="${X(fn.lx)}" y="${Y(fn.ly)}" class="fl" fill="${farbe(fn.c)}">${fn.label}</text>`);
  }
  // Geraden (durch zwei Punkte, bis zum Rand)
  for (const ge of spec.gerade ?? []) {
    if (ge.f && ge.sek) { const f = F(ge.f); ge.p = [ge.sek[0], f(ge.sek[0])]; ge.q = [ge.sek[1], f(ge.sek[1])]; }
    if (ge.f && ge.tan !== undefined) { const f = F(ge.f), x = ge.tan, e = 1e-6; const m = (f(x + e) - f(x - e)) / (2 * e); ge.p = [x, f(x)]; ge.q = [x + 1, f(x) + m]; }
    let [px, py] = ge.p, [qx, qy] = ge.q;
    let a, b;
    if (Math.abs(qx - px) < 1e-12) { a = [px, y0 - 10]; b = [px, y1 + 10]; }
    else { const m = (qy - py) / (qx - px); const xa = ge.von ?? x0 - 1, xb = ge.bis ?? x1 + 1; a = [xa, py + m * (xa - px)]; b = [xb, py + m * (xb - px)]; }
    out.push(`<line clip-path="url(#c${id})" x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="${farbe(ge.c)}" stroke-width="${ge.w ?? 1.5}" ${ge.d ? `stroke-dasharray="${ge.d}"` : ""} opacity="${ge.o ?? 1}"/>`);
  }
  // Strecken
  for (const s of spec.strecke ?? []) {
    out.push(`<line x1="${X(s.p[0])}" y1="${Y(s.p[1])}" x2="${X(s.q[0])}" y2="${Y(s.q[1])}" stroke="${farbe(s.c)}" style="color:${farbe(s.c)}" stroke-width="${s.w ?? 1.3}" ${s.d ? `stroke-dasharray="${s.d}"` : ""} ${s.pfeil ? `marker-end="url(#pk${id})"` : ""} ${s.pfeil === 2 ? `marker-start="url(#pk${id})"` : ""}/>`);
  }
  // Punkte
  const OFF = { o: [0, -9, "middle"], u: [0, 17, "middle"], l: [-8, 4, "end"], r: [8, 4, "start"], ol: [-6, -7, "end"], or: [6, -7, "start"], ul: [-6, 15, "end"], ur: [6, 15, "start"] };
  for (const p of spec.punkt ?? []) {
    if (p.f) p.y = F(p.f)(p.x);
    const c = farbe(p.c ?? "seeTief");
    out.push(`<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${p.r ?? 3.2}" fill="${p.leer ? "#fff" : c}" stroke="${c}" stroke-width="1.4"/>`);
    if (p.t) { const [dx, dy, an] = OFF[p.pos ?? "or"]; out.push(`<text x="${X(p.x) + dx}" y="${Y(p.y) + dy}" text-anchor="${an}" class="pl" fill="${c}">${p.t}</text>`); }
  }
  for (const t of spec.text ?? []) {
    const [dx, dy, an] = OFF[t.pos ?? "r"] ?? [0, 0, "middle"];
    out.push(`<text x="${X(t.x) + dx}" y="${Y(t.y) + dy}" text-anchor="${t.an ?? an}" class="${t.k ?? "pl"}" fill="${farbe(t.c ?? "seeTief")}">${t.t}</text>`);
  }
  out.push(`</svg>`);
  return out.join("\n");
}
graph.n = 0;

// ---------- Seiten ----------
const files = fs.readdirSync(PAGES).filter((f) => f.endsWith(".html")).sort();
const seiten = [];
let nr = 0;
for (const f of files) {
  const raw = fs.readFileSync(path.join(PAGES, f), "utf8");
  const m = raw.match(/^<!--([\s\S]*?)-->/);
  const meta = {};
  if (m) for (const teil of m[1].split("|")) { const [k, ...v] = teil.split(":"); if (k.trim()) meta[k.trim()] = v.join(":").trim(); }
  let body = raw.slice(m ? m[0].length : 0);
  body = body.replace(/<graph>([\s\S]*?)<\/graph>/g, (_, j) => {
    let spec; try { spec = JSON.parse(j); } catch (e) { throw new Error(`Graph-JSON in ${f}: ${e.message}\n${j}`); }
    return graph(spec);
  });
  try { body = mathe(body); } catch (e) { throw new Error(`${f}: ${e.message}`); }
  const [haupt, rand] = body.split("<!--rand-->");
  nr++;
  seiten.push({ datei: f, nr, meta, haupt, rand: rand ?? "" });
}

const KAPNAME = { I: "Die Ableitung", II: "Ableitungsregeln", III: "Anwenden und Üben", L: "Anhang", "0": "" };
function seite(s) {
  const typ = s.meta.typ || "normal";
  const kap = s.meta.kap || "0";
  const seiteLR = s.nr % 2 === 1 ? "rechts" : "links";
  const col = KAPFARBE[kap] || FARBE.see;
  if (typ === "frei") return `<section class="page frei ${seiteLR} kap-${kap}" style="--kap:${col}" data-nr="${s.nr}" data-datei="${s.datei}">${s.haupt}</section>`;
  const kopf = typ === "auftakt" ? "" : `<header class="kopf"><span class="kopf-kap"><b>${kap === "L" || kap === "0" ? "" : "Kapitel " + kap}</b>${KAPNAME[kap] ?? ""}</span><span class="kopf-ukap">${s.meta.ukap ?? ""}</span></header>`;
  return `<section class="page ${typ} ${seiteLR} kap-${kap}" style="--kap:${col}" data-nr="${s.nr}" data-datei="${s.datei}">
  <div class="kapband"></div>
  ${kopf}
  <div class="koerper ${s.rand.trim() ? "" : "ohne-rand"}"><div class="haupt">${s.haupt}</div>${s.rand.trim() ? `<aside class="rand">${s.rand}</aside>` : ""}</div>
  <footer class="fuss"><span class="snr">${s.nr}</span><span class="marke">Mythos Mathe · Ableitungen</span></footer>
</section>`;
}

const css = fs.readFileSync(path.join(ROOT, "buch.css"), "utf8");
const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Ableitungen – Mythos Mathe</title>
<link rel="stylesheet" href="katex.css"><style>${css}</style></head><body>
${seiten.map(seite).join("\n")}
</body></html>`;
fs.writeFileSync(path.join(DIST, "buch.html"), html);
fs.writeFileSync(path.join(DIST, "seiten.json"), JSON.stringify(seiten.map((s) => ({ nr: s.nr, datei: s.datei, ...s.meta })), null, 1));
console.log(`${seiten.length} Seiten gebaut.`);
