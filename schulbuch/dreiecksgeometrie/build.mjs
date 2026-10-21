// Baut das Schulbuch "Dreiecksgeometrie" (Band 4) aus pages/*.html zu dist/buch.html
// Seitendatei: erste Zeile <!-- kap: I | ukap: 1 Mittlere Änderungsrate | typ: normal -->
// Inhalt: Hauptspalte, optional nach <!--rand--> die Randspalte.
// Mathe: $...$ inline, $$...$$ abgesetzt (KaTeX, serverseitig).
// Grafik: <graph>{ JSON }</graph>
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { qrEinbauen, QR_CSS, qrSvg } from "../qr.mjs";
import { vorwortSeiten, KDP_CSS } from "../kdp/vorwort.mjs";
// Druckausgabe für Amazon KDP: KDP=1 DIST=dist-kdp node build.mjs (Beschnitt, Vorspann I–VIII, kdp.json)
const KDP = !!process.env.KDP;
import katex from "katex";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const PAGES = path.join(ROOT, "pages");
// Probe-Modus für paralleles Arbeiten: DIST=dist-xy NUR="^(1[1-9]|20)-" node build.mjs
// baut nur die passenden Seiten in einen eigenen Ordner; unbekannte Verweise werden dort zu „??“.
const DIST = path.join(ROOT, process.env.DIST || "dist");
const NUR = process.env.NUR ? new RegExp(process.env.NUR) : null;
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
  gold: "#EDBB00", goldDunkel: "#B88A00", goldTief: "#8C6A00", grau: "#8A93A6", hell: "#E8EEF7",
  smaragd: "#1F7A4D", lila: "#6A3F94",
};
const KAPFARBE = { "I": FARBE.goldTief, "II": FARBE.see, "III": FARBE.grana, "IV": FARBE.seeTief, "V": FARBE.smaragd, "VI": FARBE.lila, "A": FARBE.seeTief, "L": FARBE.seeTief, "0": FARBE.seeTief };

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


// ---------- Raumbild (Schrägbild) ----------
// <raum>{ JSON }</raum>  Koordinaten [x1, x2, x3]. Projektion wie im Heft:
// x2 nach rechts, x3 nach oben, x1 schräg nach vorn-unten (Verkürzung k = 0,5 je Richtung, also ½·√2).
// spec: { b, h (mm), achsen:[a1,a2,a3] (positive Länge, Standard [4,4,4]), neg:[n1,n2,n3] (Standard 0.6),
//   zahlen:true (Einheiten an den Achsen), tx:1, namen:["x₁","x₂","x₃"], keineAchsen,
//   punkt:[{p,t,pos,c,r,lot}]  lot:true zeichnet die Koordinatenwege gestrichelt,
//   strecke:[{p,q,c,w,d,pfeil,t,pos,vek}]  (vek:true → Pfeil über der Beschriftung),
//   vektor:[{p (Start, Standard 0), v (Vektor) | q (Ende), c, w, t, pos, vek}],
//   gerade:[{p,u,von,bis,c,w,d,t,lt,pos}]  Punkt p + t·u für t in [von,bis],
//   flaeche:[{pkte:[[..],..], c, o, rand, d}]  Polygon (z. B. Ebenenstück, Spurdreieck),
//   quader:[{von,bis,c,w,d}], text:[{p,t,c,pos,vek,k}], winkel:[{s,a,b,r,c}] Winkelbogen am Scheitel s zu den Punkten a,b }
function raum(spec) {
  const S = 4, B = spec.b ?? 60, H = spec.h ?? 50, W = B * S, Hh = H * S;
  const k = spec.k ?? 0.5;
  const proj = ([a, b, c]) => [b - k * a, c - k * a];
  const AF = farbe(spec.achsenFarbe ?? "seeTief");
  const A = spec.achsen ?? [4, 4, 4], N = spec.neg ?? [0.6, 0.6, 0.6];
  const pts = [];
  const sammle = (p) => { if (p) pts.push(proj(p)); };
  if (!spec.keineAchsen) for (let i = 0; i < 3; i++) { const e = [0, 0, 0], f = [0, 0, 0]; e[i] = A[i] + 0.35; f[i] = -N[i]; sammle(e); sammle(f); }
  for (const p of spec.punkt ?? []) sammle(p.p);
  for (const s of spec.strecke ?? []) { sammle(s.p); sammle(s.q); }
  for (const v of spec.vektor ?? []) { const p0 = v.p ?? [0, 0, 0]; sammle(p0); sammle(v.q ?? p0.map((x, i) => x + v.v[i])); }
  for (const g of spec.gerade ?? []) for (const t of [g.von ?? -1, g.bis ?? 1]) sammle(g.p.map((x, i) => x + t * g.u[i]));
  for (const f of spec.flaeche ?? []) f.pkte.forEach(sammle);
  for (const q of spec.quader ?? []) { sammle(q.von); sammle(q.bis); }
  for (const t of spec.text ?? []) sammle(t.p);
  let [u0, v0, u1, v1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [u, v] of pts) { u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
  const pad = spec.rand ?? 14;
  const sk = Math.min((W - 2 * pad) / (u1 - u0 || 1), (Hh - 2 * pad) / (v1 - v0 || 1));
  const ou = (W - sk * (u1 - u0)) / 2, ov = (Hh - sk * (v1 - v0)) / 2;
  const P = (p) => { const [u, v] = proj(p); return [ou + (u - u0) * sk, Hh - ov - (v - v0) * sk]; };
  const id = ++graph.n;
  const out = [`<svg class="graph raum" viewBox="0 0 ${W} ${Hh}" width="${B}mm" height="${H}mm" xmlns="http://www.w3.org/2000/svg">`,
    `<defs><marker id="pf${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="${AF}"/></marker>
     <marker id="pk${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="context-stroke"/></marker></defs>`];
  const linie = (p, q, c, w, d, pf, extra = "") => {
    const [x1, y1] = P(p), [x2, y2] = P(q);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${farbe(c)}" stroke-width="${w ?? 1.4}" ${d ? `stroke-dasharray="${d}"` : ""} ${pf ? `marker-end="url(#pk${id})"` : ""} stroke-linecap="round" ${extra}/>`;
  };
  const OFF = { o: [0, -9, "middle"], u: [0, 17, "middle"], l: [-8, 4, "end"], r: [8, 4, "start"], ol: [-6, -7, "end"], or: [6, -7, "start"], ul: [-6, 15, "end"], ur: [6, 15, "start"], m: [0, 4, "middle"] };
  const label = (p, t, c, pos, vek, kl = "pl") => {
    const [x, y] = P(p), [dx, dy, an] = OFF[pos ?? "or"];
    let s = `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${an}" class="${kl}" fill="${farbe(c)}">${t}</text>`;
    if (vek) { // kleiner Pfeil über dem ersten Zeichen
      const bw = 7.5, xs = an === "start" ? x + dx : an === "end" ? x + dx - bw : x + dx - bw / 2, ys = y + dy - 11.5;
      s += `<path d="M${xs.toFixed(1)},${ys.toFixed(1)}h${bw}m-2.4,-2.1l2.4,2.1l-2.4,2.1" stroke="${farbe(c)}" stroke-width="1" fill="none"/>`;
    }
    return s;
  };
  // Flächen zuerst
  for (const f of spec.flaeche ?? []) {
    const pp = f.pkte.map((q) => P(q).map((v) => v.toFixed(1)).join(",")).join(" ");
    out.push(`<polygon points="${pp}" fill="${farbe(f.c)}" opacity="${f.o ?? 0.16}"/>`);
    if (f.rand !== false) out.push(`<polygon points="${pp}" fill="none" stroke="${farbe(f.c)}" stroke-width="${f.w ?? 1}" ${f.d ? `stroke-dasharray="${f.d}"` : ""} opacity="0.85"/>`);
    if (f.t) out.push(label(f.tp ?? f.pkte[0], f.t, f.c, f.pos ?? "m", false, "fl"));
  }
  // Achsen
  if (!spec.keineAchsen) {
    const namen = spec.namen ?? ["x₁", "x₂", "x₃"], tx = spec.tx ?? 1;
    for (let i = 0; i < 3; i++) {
      const e = [0, 0, 0], f = [0, 0, 0]; e[i] = A[i] + 0.35; f[i] = -N[i];
      const [x1, y1] = P(f), [x2, y2] = P(e);
      out.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${AF}" stroke-width="1.2" marker-end="url(#pf${id})"/>`);
      const lp = [0, 0, 0]; lp[i] = A[i] + 0.35;
      out.push(label(lp, namen[i], spec.achsenFarbe ?? "seeTief", ["l", "ur", "r"][i], false, "al"));
      if (spec.zahlen !== false) for (let z = tx; z <= A[i] + 1e-9; z += tx) {
        const q = [0, 0, 0]; q[i] = z; const [x, y] = P(q);
        const tick = i === 1 ? `M${x.toFixed(1)},${(y - 3).toFixed(1)}v6` : `M${(x - 3).toFixed(1)},${y.toFixed(1)}h6`;
        out.push(`<path d="${tick}" stroke="${AF}" stroke-width="1"/>`);
        if (spec.zahlen === true || (spec.zahlen ?? 1) && (z === A[i] || spec.alleZahlen)) {
          const [dx, dy, an] = i === 0 ? [-6, 4, "end"] : i === 1 ? [0, 13, "middle"] : [-6, 4, "end"];
          out.push(`<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${an}" class="tz">${fmt(z)}</text>`);
        }
      }
    }
  }
  for (const q of spec.quader ?? []) {
    const [a, b] = [q.von, q.bis];
    const ecke = (i, j, l) => [[a[0], b[0]][i], [a[1], b[1]][j], [a[2], b[2]][l]];
    const kanten = [];
    for (const i of [0, 1]) for (const j of [0, 1]) { kanten.push([ecke(0, i, j), ecke(1, i, j)]); kanten.push([ecke(i, 0, j), ecke(i, 1, j)]); kanten.push([ecke(i, j, 0), ecke(i, j, 1)]); }
    const hinten = [a[0], a[1], a[2]].join();
    for (const [p1, p2] of kanten) {
      const versteckt = q.versteckt !== false && (p1.join() === hinten || p2.join() === hinten);
      out.push(linie(p1, p2, q.c ?? "see", q.w ?? 1.2, versteckt ? "3 2.5" : q.d));
    }
  }
  for (const g of spec.gerade ?? []) {
    const a = g.von ?? -1, b = g.bis ?? 1;
    const p = g.p.map((x, i) => x + a * g.u[i]), q = g.p.map((x, i) => x + b * g.u[i]);
    out.push(linie(p, q, g.c ?? "see", g.w ?? 1.8, g.d));
    if (g.t) out.push(label(g.p.map((x, i) => x + (g.lt ?? b) * g.u[i]), g.t, g.c ?? "see", g.pos ?? "or", false, "fl"));
  }
  for (const s of spec.strecke ?? []) {
    out.push(linie(s.p, s.q, s.c ?? "seeTief", s.w ?? 1.3, s.d, s.pfeil));
    if (s.t) out.push(label(s.p.map((x, i) => (x + s.q[i]) / 2), s.t, s.c ?? "seeTief", s.pos ?? "o", s.vek));
  }
  for (const v of spec.vektor ?? []) {
    const p0 = v.p ?? [0, 0, 0], q = v.q ?? p0.map((x, i) => x + v.v[i]);
    out.push(linie(p0, q, v.c ?? "grana", v.w ?? 2, v.d, true));
    if (v.t) out.push(label(p0.map((x, i) => (x + q[i]) / 2), v.t, v.c ?? "grana", v.pos ?? "o", v.vek !== false));
  }
  for (const w of spec.winkel ?? []) {
    const [sx, sy] = P(w.s), [ax, ay] = P(w.a), [bx, by] = P(w.b), r = w.r ?? 14;
    const wa = Math.atan2(ay - sy, ax - sx), wb = Math.atan2(by - sy, bx - sx);
    let d = wb - wa; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    const x1 = sx + r * Math.cos(wa), y1 = sy + r * Math.sin(wa), x2 = sx + r * Math.cos(wb), y2 = sy + r * Math.sin(wb);
    out.push(`<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 0 ${d > 0 ? 1 : 0} ${x2.toFixed(1)},${y2.toFixed(1)}" stroke="${farbe(w.c ?? "goldDunkel")}" stroke-width="1.4" fill="none"/>`);
    if (w.t) { const m = wa + d / 2; out.push(`<text x="${(sx + (r + 8) * Math.cos(m)).toFixed(1)}" y="${(sy + (r + 8) * Math.sin(m) + 4).toFixed(1)}" text-anchor="middle" class="pl" fill="${farbe(w.c ?? "goldDunkel")}">${w.t}</text>`); }
  }
  for (const p of spec.punkt ?? []) {
    if (p.lot) {
      const [a, b, c] = p.p;
      out.push(linie([a, 0, 0], [a, b, 0], "grau", 0.9, "2.5 2"), linie([0, b, 0], [a, b, 0], "grau", 0.9, "2.5 2"), linie([a, b, 0], [a, b, c], "grau", 0.9, "2.5 2"));
    }
    const [x, y] = P(p.p), c = farbe(p.c ?? "seeTief");
    out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.r ?? 3}" fill="${p.leer ? "#fff" : c}" stroke="${c}" stroke-width="1.3"/>`);
    if (p.t) out.push(label(p.p, p.t, p.c ?? "seeTief", p.pos ?? "or"));
  }
  for (const t of spec.text ?? []) out.push(label(t.p, t.t, t.c ?? "seeTief", t.pos ?? "m", t.vek, t.k ?? "pl"));
  out.push("</svg>");
  return out.join("\n");
}

// ---------- Figur (ebene Geometrie, Band 4) ----------
// <figur>{ JSON }</figur>  Koordinaten in beliebigen Einheiten, gleicher Maßstab in x und y (keine Verzerrung).
// spec: { b, h (mm), rand (px, Standard 16), gitter: 0|1 (Karoraster 1 Einheit, blass),
//   flaeche:[{pkte:[[x,y],..], c, o (Deckkraft 0.18), rand:true|false, d, w}]   Vieleck (Dreieck, Rechteck …),
//   strecke:[{p,q,c,w,d,t,pos,pfeil}]   t = Beschriftung an der Mitte (z. B. "a", "h_c", "5 cm"),
//   punkt:[{p,t,pos,c,leer,r}],  kreis:[{m,r,c,w,d,o}] (o = Füllung), bogen:[{m,r,von,bis,c,w,d}] (Grad, gegen den Uhrzeigersinn),
//   winkel:[{s,a,b,r,t,c,recht,o}] Winkel am Scheitel s von Strahl s→a zu s→b (der kleinere); recht:true = Quadrat mit Punkt,
//   text:[{p,t,c,pos,g}],  gerade:[{p,q,c,w,d}] (über p und q hinaus bis zum Rand) }
// Beschriftungen: "_" setzt den Rest tiefgestellt (h_c, A_1); Griechisch direkt (α, β, γ). pos: o,u,l,r,ol,or,ul,ur,m.
function figur(spec) {
  const S = 4, B = spec.b ?? 60, H = spec.h ?? 45, W = B * S, Hh = H * S;
  const pts = [];
  const sammle = (p) => { if (p) pts.push(p); };
  for (const f of spec.flaeche ?? []) f.pkte.forEach(sammle);
  for (const s of spec.strecke ?? []) { sammle(s.p); sammle(s.q); }
  for (const p of spec.punkt ?? []) sammle(p.p);
  for (const k of [...(spec.kreis ?? []), ...(spec.bogen ?? [])]) { sammle([k.m[0] - k.r, k.m[1] - k.r]); sammle([k.m[0] + k.r, k.m[1] + k.r]); }
  for (const t of spec.text ?? []) sammle(t.p);
  if (spec.fenster) { sammle([spec.fenster[0], spec.fenster[1]]); sammle([spec.fenster[2], spec.fenster[3]]); }
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const pad = spec.rand ?? 16;
  const sk = Math.min((W - 2 * pad) / (x1 - x0 || 1), (Hh - 2 * pad) / (y1 - y0 || 1));
  const ox = (W - sk * (x1 - x0)) / 2, oy = (Hh - sk * (y1 - y0)) / 2;
  const P = ([x, y]) => [ox + (x - x0) * sk, Hh - oy - (y - y0) * sk];
  const f1 = (v) => v.toFixed(1);
  const id = ++graph.n;
  const out = [`<svg class="graph figur" viewBox="0 0 ${W} ${Hh}" width="${B}mm" height="${H}mm" xmlns="http://www.w3.org/2000/svg">`,
    `<defs><marker id="pf${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="context-stroke"/></marker></defs>`];
  if (spec.gitter) {
    const gl = [];
    for (let x = Math.ceil(x0 - 1); x <= x1 + 1; x++) { const [u] = P([x, 0]); if (u >= 0 && u <= W) gl.push(`M${f1(u)},0V${Hh}`); }
    for (let y = Math.ceil(y0 - 1); y <= y1 + 1; y++) { const [, v] = P([0, y]); if (v >= 0 && v <= Hh) gl.push(`M0,${f1(v)}H${W}`); }
    out.push(`<path d="${gl.join("")}" stroke="#D5DDEB" stroke-width="0.7" fill="none"/>`);
  }
  const OFF = { o: [0, -9], u: [0, 15], l: [-8, 4], r: [8, 4], ol: [-7, -7], or: [7, -7], ul: [-7, 14], ur: [7, 14], m: [0, 4] };
  const ANKER = { o: "middle", u: "middle", m: "middle", l: "end", ol: "end", ul: "end", r: "start", or: "start", ur: "start" };
  const label = (x, y, t, pos = "o", c = "seeTief", g = 13) => {
    const [dx, dy] = OFF[pos] || OFF.o;
    const [haupt, tief] = String(t).split("_");
    const it = /^[a-zA-Zα-ωΑ-Ω]$/.test(haupt) ? ` font-style="italic"` : "";
    return `<text x="${f1(x + dx)}" y="${f1(y + dy)}" font-size="${g}" font-weight="700" fill="${farbe(c)}" text-anchor="${ANKER[pos] || "middle"}"${it} font-family="Montserrat, sans-serif">${haupt}${tief ? `<tspan font-size="${Math.round(g * 0.72)}" dy="3">${tief}</tspan>` : ""}</text>`;
  };
  for (const f of spec.flaeche ?? []) {
    const d = f.pkte.map(P).map(([u, v]) => `${f1(u)},${f1(v)}`).join(" ");
    out.push(`<polygon points="${d}" fill="${farbe(f.c)}" fill-opacity="${f.o ?? 0.18}" stroke="${f.rand === false ? "none" : farbe(f.c)}" stroke-width="${f.w ?? 1.8}" stroke-linejoin="round"${f.d ? ` stroke-dasharray="${f.d}"` : ""}/>`);
  }
  for (const k of spec.kreis ?? []) {
    const [u, v] = P(k.m);
    out.push(`<circle cx="${f1(u)}" cy="${f1(v)}" r="${f1(k.r * sk)}" fill="${k.o ? farbe(k.c) : "none"}" fill-opacity="${k.o ?? 0}" stroke="${farbe(k.c)}" stroke-width="${k.w ?? 1.6}"${k.d ? ` stroke-dasharray="${k.d}"` : ""}/>`);
  }
  for (const b of spec.bogen ?? []) {
    const r = b.r * sk, [u, v] = P(b.m), a0 = b.von * Math.PI / 180, a1 = b.bis * Math.PI / 180;
    const p0 = [u + r * Math.cos(a0), v - r * Math.sin(a0)], p1 = [u + r * Math.cos(a1), v - r * Math.sin(a1)];
    const gross = ((b.bis - b.von) % 360 + 360) % 360 > 180 ? 1 : 0;
    out.push(`<path d="M${f1(p0[0])},${f1(p0[1])} A${f1(r)},${f1(r)} 0 ${gross} 0 ${f1(p1[0])},${f1(p1[1])}" fill="none" stroke="${farbe(b.c)}" stroke-width="${b.w ?? 1.6}"${b.d ? ` stroke-dasharray="${b.d}"` : ""}/>`);
  }
  for (const g of spec.gerade ?? []) {
    const [ax, ay] = P(g.p), [bx, by] = P(g.q), dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, e = (W + Hh) * 2;
    out.push(`<line x1="${f1(ax - dx / L * e)}" y1="${f1(ay - dy / L * e)}" x2="${f1(bx + dx / L * e)}" y2="${f1(by + dy / L * e)}" stroke="${farbe(g.c)}" stroke-width="${g.w ?? 1.4}"${g.d ? ` stroke-dasharray="${g.d}"` : ""}/>`);
  }
  for (const w of spec.winkel ?? []) {
    const [su, sv] = P(w.s), [au, av] = P(w.a), [bu, bv] = P(w.b);
    let wa = Math.atan2(-(av - sv), au - su), wb = Math.atan2(-(bv - sv), bu - su);
    let diff = ((wb - wa) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    if (diff > Math.PI) { [wa, wb] = [wb, wa]; diff = 2 * Math.PI - diff; }
    const r = (w.r ?? 0.9) * sk, c = farbe(w.c ?? "gold");
    if (w.recht) {
      const q = r * 0.62, ea = [Math.cos(wa), -Math.sin(wa)], eb = [Math.cos(wa + diff), -Math.sin(wa + diff)];
      const p1 = [su + ea[0] * q, sv + ea[1] * q], p2 = [su + (ea[0] + eb[0]) * q, sv + (ea[1] + eb[1]) * q], p3 = [su + eb[0] * q, sv + eb[1] * q];
      out.push(`<path d="M${f1(p1[0])},${f1(p1[1])} L${f1(p2[0])},${f1(p2[1])} L${f1(p3[0])},${f1(p3[1])}" fill="none" stroke="${c}" stroke-width="1.4"/>`);
      out.push(`<circle cx="${f1(su + (ea[0] + eb[0]) * q * 0.5)}" cy="${f1(sv + (ea[1] + eb[1]) * q * 0.5)}" r="1.4" fill="${c}"/>`);
    } else {
      const p0 = [su + r * Math.cos(wa), sv - r * Math.sin(wa)], p1 = [su + r * Math.cos(wa + diff), sv - r * Math.sin(wa + diff)];
      out.push(`<path d="M${f1(su)},${f1(sv)} L${f1(p0[0])},${f1(p0[1])} A${f1(r)},${f1(r)} 0 0 0 ${f1(p1[0])},${f1(p1[1])} Z" fill="${c}" fill-opacity="${w.o ?? 0.28}" stroke="${c}" stroke-width="1.3"/>`);
    }
    if (w.t) {
      const m = wa + diff / 2, rr = r + (w.recht ? 6 : 9);
      out.push(label(su + rr * Math.cos(m), sv - rr * Math.sin(m) + 4, w.t, "m", w.tc ?? "seeTief", 12));
    }
  }
  for (const s of spec.strecke ?? []) {
    const [ax, ay] = P(s.p), [bx, by] = P(s.q);
    out.push(`<line x1="${f1(ax)}" y1="${f1(ay)}" x2="${f1(bx)}" y2="${f1(by)}" stroke="${farbe(s.c)}" stroke-width="${s.w ?? 1.8}" stroke-linecap="round"${s.d ? ` stroke-dasharray="${s.d}"` : ""}${s.pfeil ? ` marker-end="url(#pf${id})"` : ""}/>`);
    if (s.t) {
      const mx = (ax + bx) / 2, my = (ay + by) / 2, L = Math.hypot(bx - ax, by - ay) || 1;
      let nx = -(by - ay) / L, ny = (bx - ax) / L;
      if (s.seite === "innen") { nx = -nx; ny = -ny; }
      const ab = s.ab ?? 10;
      out.push(label(mx + nx * ab, my + ny * ab + 4, s.t, "m", s.tc ?? s.c ?? "seeTief", 12));
    }
  }
  for (const p of spec.punkt ?? []) {
    const [u, v] = P(p.p);
    out.push(`<circle cx="${f1(u)}" cy="${f1(v)}" r="${p.r ?? 2.6}" fill="${p.leer ? "#fff" : farbe(p.c ?? "seeTief")}" stroke="${farbe(p.c ?? "seeTief")}" stroke-width="1.2"/>`);
    if (p.t) out.push(label(u, v, p.t, p.pos ?? "o", p.c ?? "seeTief"));
  }
  for (const t of spec.text ?? []) { const [u, v] = P(t.p); out.push(label(u, v, t.t, t.pos ?? "m", t.c ?? "seeTief", t.g ?? 12)); }
  out.push("</svg>");
  return out.join("\n");
}

// ---------- Seiten ----------
// Meta je Seite: kap, typ, uk (Titel eines neuen, nummerierten Unterkapitels) oder ukap (Titel ohne Nummer).
// Seiten ohne uk/ukap gehören zum laufenden Unterkapitel. Nummern zählen automatisch.
// Verweise im Text: {{S:stamm}} = Seitenzahl, {{K:stamm}} = Nummer des Unterkapitels, das auf dieser Seite beginnt,
// {{T:stamm}} = sein Titel, {{KAP:stamm}} = Kapitel (I, II …). stamm = Dateiname ohne Nummer und .html.
const files = fs.readdirSync(PAGES).filter((f) => f.endsWith(".html") && (!NUR || NUR.test(f))).sort();
const stammVon = (f) => f.replace(/^\d+-/, "").replace(/\.html$/, "");
const roh = files.map((f) => {
  const raw = fs.readFileSync(path.join(PAGES, f), "utf8");
  const m = raw.match(/^<!--([\s\S]*?)-->/);
  const meta = {};
  if (m) for (const teil of m[1].split("|")) { const [k, ...v] = teil.split(":"); if (k.trim()) meta[k.trim()] = v.join(":").trim(); }
  return { f, stamm: stammVon(f), meta, body: raw.slice(m ? m[0].length : 0) };
});
export const VERZ = {};
{
  let einheit = 0, laufend = "";
  roh.forEach((r, i) => {
    r.nr = NUR ? parseInt(r.f, 10) : i + 1; // im Probe-Modus zählt die Dateinummer (richtige linke/rechte Seite)
    if (r.meta.uk) { einheit++; laufend = `${einheit} ${r.meta.uk}`; r.ukNr = einheit; }
    else if (r.meta.ukap) laufend = r.meta.ukap;
    else if (r.meta.typ === "auftakt" || r.meta.typ === "frei") laufend = "";
    r.meta.ukap = laufend;
    VERZ[r.stamm] = { seite: r.nr, nr: r.ukNr, titel: r.meta.uk || r.meta.ukap, kap: r.meta.kap };
  });
}
function verweise(text, f) {
  return text.replace(/\{\{(S|K|T|KAP):([a-z0-9-]+)\}\}/g, (_, art, st) => {
    const v = VERZ[st];
    if (!v) { if (NUR) return "??"; throw new Error(`${f}: unbekannter Verweis ${art}:${st}`); }
    const w = art === "S" ? v.seite : art === "K" ? v.nr : art === "T" ? v.titel : v.kap;
    if (w === undefined) throw new Error(`${f}: Verweis ${art}:${st} ohne Wert`);
    return String(w);
  });
}
const seiten = [];
for (const r of roh) {
  const f = r.f, meta = r.meta;
  let body = verweise(r.body, f);
  body = body.replace(/<graph>([\s\S]*?)<\/graph>/g, (_, j) => {
    let spec; try { spec = JSON.parse(j); } catch (e) { throw new Error(`Graph-JSON in ${f}: ${e.message}\n${j}`); }
    return graph(spec);
  });
  body = body.replace(/<figur>([\s\S]*?)<\/figur>/g, (_, j) => {
    let spec; try { spec = JSON.parse(j); } catch (e) { throw new Error(`Figur-JSON in ${f}: ${e.message}\n${j}`); }
    return figur(spec);
  });
  body = body.replace(/<raum>([\s\S]*?)<\/raum>/g, (_, j) => {
    let spec; try { spec = JSON.parse(j); } catch (e) { throw new Error(`Raum-JSON in ${f}: ${e.message}\n${j}`); }
    return raum(spec);
  });
  try { body = mathe(body); } catch (e) { throw new Error(`${f}: ${e.message}`); }
  const [haupt, rand] = body.split("<!--rand-->");
  seiten.push({ datei: f, nr: r.nr, meta, haupt, rand: rand ?? "" });
}

const KAPNAME = { I: "Flächen", II: "Winkel und Konstruktionen", III: "Dreieck und Kreis", IV: "Der Satz des Pythagoras", V: "Ähnlichkeit", VI: "Trigonometrie", A: "Anhang", L: "Lösungen" };
function seite(s) {
  const typ = s.meta.typ || "normal";
  const kap = s.meta.kap || "0";
  const seiteLR = (s.roem ? s.roemIndex % 2 === 0 : s.nr % 2 === 1) ? "rechts" : "links";
  const col = KAPFARBE[kap] || FARBE.see;
  if (typ === "frei") return `<section class="page frei ${seiteLR} kap-${kap}" style="--kap:${col}" data-nr="${s.nr}" data-datei="${s.datei}">${s.haupt}</section>`;
  const kopf = typ === "auftakt" ? "" : `<header class="kopf"><span class="kopf-kap"><b>${kap === "L" || kap === "0" ? "" : "Kapitel " + kap}</b>${KAPNAME[kap] ?? ""}</span><span class="kopf-ukap">${s.meta.ukap ?? ""}</span></header>`;
  return `<section class="page ${typ} ${seiteLR} kap-${kap}" style="--kap:${col}" data-nr="${s.nr}" data-datei="${s.datei}">
  <div class="kapband"></div>
  ${kopf}
  <div class="koerper ${s.rand.trim() ? "" : "ohne-rand"}"><div class="haupt">${s.haupt}</div>${s.rand.trim() ? `<aside class="rand">${s.rand}</aside>` : ""}</div>
  <footer class="fuss"><span class="snr">${s.roem || s.nr}</span><span class="marke">Mythos Mathe · Dreiecksgeometrie</span></footer>
</section>`;
}

// ---------- Zusammenbauen, QR-Codes (qr.mjs), Druckausgabe (kdp/) ----------
const APP = path.join(ROOT, "..", "..", "matheskript-v80-deploy");
const BUCH_TYPEN = {};   // Band 4: noch keine Aufgabentypen in der App (QR-Codes offen, b4 fehlt in src/pfade.js)
let alleSeiten = seiten;
if (KDP) {
  const konfig = JSON.parse(fs.readFileSync(path.join(ROOT, "kdp.json"), "utf8"));
  const vor = await vorwortSeiten(konfig, { seiten, KAPNAME, qrSvg });
  vor.forEach((v, i) => { v.roemIndex = i; });
  alleSeiten = [...vor, ...seiten];
  console.log(`KDP: Vorspann ${vor.length} Seiten (${vor.map((v) => v.roem).join(", ")}), Beschnitt 3,2 mm.`);
}
const css = fs.readFileSync(path.join(ROOT, "buch.css"), "utf8") + QR_CSS + (KDP ? KDP_CSS : "");
function schreiben() {
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Dreiecksgeometrie – Mythos Mathe</title>
<link rel="stylesheet" href="katex.css"><style>${css}</style></head><body>
${alleSeiten.map(seite).join("\n")}
</body></html>`;
  fs.writeFileSync(path.join(DIST, "buch.html"), html);
}
// QR-Codes in zwei Durchgängen: erst ohne Codes bauen und den freien Platz je Seite messen (render.py --messen),
// dann je Seite die passende Form einbauen. QR=0 überspringt die Codes (schneller Probebau).
const QR_FORM = {};   // Form je Seite erzwingen, z. B. { 25: "eng" } – siehe qr.mjs
if (process.env.QR === "1") {   // Band 4: QR-Codes erst, wenn /b4/… in der App existiert (LIESMICH.md)
  schreiben();
  let platz = null;
  try {
    execSync("python3 render.py --messen", { cwd: ROOT, env: { ...process.env, DIST: path.basename(DIST) }, stdio: "pipe" });
    platz = JSON.parse(fs.readFileSync(path.join(DIST, "platz.json"), "utf8"));
  } catch (e) { console.warn("Platzmessung fehlgeschlagen – QR-Codes nur in den App-Kästen:", String(e.message || e).split("\n")[0]); }
  const qrStat = await qrEinbauen(seiten, { band: 4, buchTypen: BUCH_TYPEN, platz, form: QR_FORM });
  const formen = Object.values(qrStat.formen).reduce((m, f) => ({ ...m, [f]: (m[f] || 0) + 1 }), {});
  console.log(`QR-Codes: ${qrStat.codes} Aufgaben, ${qrStat.kaesten} App-Kästen; Formen je Seite: ${JSON.stringify(formen)}.`);
}
schreiben();
fs.writeFileSync(path.join(DIST, "seiten.json"), JSON.stringify(seiten.map((s) => ({ nr: s.nr, datei: s.datei, ...s.meta })), null, 1));
fs.writeFileSync(path.join(DIST, "verzeichnis.json"), JSON.stringify(VERZ, null, 1));
console.log(`${seiten.length} Seiten gebaut.`);

// ---------- Inhalte für den Kurs in der App (dist/kurs/<seite>.json) ----------
// Je Seite: alle Aufgaben (gerendertes HTML), die Kästen Merke/Achtung/Für Interessierte/Rückblick
// und die Lösungen zu jeder Aufgabe aus loesungen.html. Die App (src/funcVekKursUeben.jsx) zeigt
// sie im Kursmodul unter „Aufgaben“ bzw. „Sätze und Definitionen“.
function bloecke(html, klasse) {
  // alle <div class="klasse …">…</div> mit richtig gezählten verschachtelten divs
  const out = [];
  const re = new RegExp(`<div class="${klasse}[ "]`, "g");
  let m;
  while ((m = re.exec(html))) {
    let i = m.index, tiefe = 0;
    const tag = /<\/?div\b[^>]*>/g;
    tag.lastIndex = i;
    let t;
    while ((t = tag.exec(html))) {
      if (t[0][1] === "/") tiefe--; else tiefe++;
      if (tiefe === 0) { out.push(html.slice(i, tag.lastIndex)); re.lastIndex = tag.lastIndex; break; }
    }
  }
  return out;
}
const textOhneTags = (h) => h.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const kursLoes = {};
{
  // Im Probe-Modus kann loesungen.html noch fehlen (entsteht erst mit loesungen-sammeln.py) – dann ohne Lösungen weiter.
  const lDatei = path.join(ROOT, "loesungen.html");
  if (!fs.existsSync(lDatei) && !NUR) throw new Error("loesungen.html fehlt – zuerst python3 loesungen-sammeln.py");
  let l = fs.existsSync(lDatei) ? verweise(fs.readFileSync(lDatei, "utf8"), "loesungen.html") : "";
  l = mathe(l);
  for (const abschnitt of l.split(/(?=<h3>)/)) {
    const s = /\(Seite (\d+)\)<\/h3>/.exec(abschnitt);
    if (!s) continue;
    const nr = +s[1];
    kursLoes[nr] = kursLoes[nr] || {};
    for (const p of abschnitt.split(/(?=<p><span class="an">)/).slice(1)) {
      const a = /^<p><span class="an">([^<]+)<\/span>\s*/.exec(p);
      const ende = p.indexOf("</p>");
      kursLoes[nr][a[1].trim()] = p.slice(a[0].length, ende).trim();
    }
  }
}
const kurs = { seiten: {} };
for (const s of seiten) {
  const haupt = s.haupt;
  const aufgaben = bloecke(haupt, "auf").map((h) => {
    const nr = /<span class="z[^"]*">([^<]+)<\/span>/.exec(h)[1].trim();
    const stufe = (/<span class="stufe">([^<]*)<\/span>/.exec(h) || [])[1] || "";
    const offen = /class="z offen"/.test(h);
    const text = h.replace(/^<div class="auf">\s*<div class="anr">[\s\S]*?<\/div>\s*<div class="text">/, "").replace(/<\/div>\s*<\/div>\s*$/, "");
    const erstes = /<p[^>]*>([\s\S]*?)<\/p>/.exec(text);
    return { nr, stufe: (stufe.match(/●/g) || []).length, offen, html: text.trim(), kopf: erstes ? erstes[1].trim() : "", loesung: (kursLoes[s.nr] || {})[nr] || "" };
  });
  const kaesten = [];
  for (const art of ["merke", "achtung", "vertiefung", "rueckblick"]) {
    for (const h of bloecke(haupt, `kasten ${art}`)) {
      const etikett = textOhneTags((/<div class="etikett">([\s\S]*?)<\/div>/.exec(h) || [])[1] || "");
      const inhalt = h.replace(/^<div class="kasten [^"]*"[^>]*>\s*(<div class="etikett">[\s\S]*?<\/div>)?/, "").replace(/<\/div>\s*$/, "").trim();
      kaesten.push({ art, etikett, html: inhalt, pos: haupt.indexOf(h) });
    }
  }
  kaesten.sort((a, b) => a.pos - b.pos).forEach((k) => delete k.pos);
  if (aufgaben.length || kaesten.length) kurs.seiten[s.nr] = { titel: s.meta.ukap || "", aufgaben, kaesten };
}
fs.rmSync(path.join(DIST, "kurs"), { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "kurs"), { recursive: true });
for (const [nr, inhalt] of Object.entries(kurs.seiten)) fs.writeFileSync(path.join(DIST, "kurs", `${nr}.json`), JSON.stringify(inhalt));
fs.writeFileSync(path.join(DIST, "kurs", "seiten.json"), JSON.stringify(Object.keys(kurs.seiten).map(Number)));   // welche Seiten Inhalte haben
const nA = Object.values(kurs.seiten).reduce((n, s) => n + s.aufgaben.length, 0);
const nL = Object.values(kurs.seiten).reduce((n, s) => n + s.aufgaben.filter((a) => a.loesung).length, 0);
console.log(`Kurs-Inhalte: ${nA} Aufgaben (${nL} mit Lösung), ${Object.values(kurs.seiten).reduce((n, s) => n + s.kaesten.length, 0)} Kästen.`);
