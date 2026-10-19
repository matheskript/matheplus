/* ============================================================
   GFS-Trainer · Die optimale Dose – Extremwertprobleme mit Nebenbedingungen
   (Lambacher Schweizer Kursstufe, Kapitel I; G8 Klasse 11, G9 Klasse 12)
   Reine Logik ohne React: Dosenrechnung, Übungsgeneratoren zu den
   Grundtypen, Adaptionen der fünf Aufgaben der GFS-Seite (eigene Zahlen,
   eigene Kontexte, eine Stufe mehr Tiefe), Lückenbeweise, Gliederung und
   Kolloquiumsfragen. Getestet in tests/gfsDose.test.mjs.
   Keine Buchtexte, keine Buchzahlen als feste Aufgabe (330 ml = Beispiel
   der Buchseite, 150 ml / 50 cm / 400 m² / 1 l / 3 m sind die Buchaufgaben
   und kommen auf Stufe 1 und 2 nie vor).
   ============================================================ */

export const PI = Math.PI;
export const rund = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
/* Zahl mit Komma, ohne überflüssige Nullen */
export const dk = (x, n = 2) => String(rund(x, n)).replace("-", "−").replace(".", ",");
/* Zahl aus Eingabe („3,74“, „3.74“, „−2“) */
export const lies = (s) => {
  const t = String(s ?? "").trim().replace(/\s/g, "").replace(/−/g, "-").replace(",", ".");
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : null;
};
export const nah = (ist, soll, tol) => ist !== null && Math.abs(ist - soll) <= tol;
/* Toleranz: zwei Nachkommastellen Rundung plus ein Prozent */
const tolFuer = (soll) => Math.max(0.011, Math.abs(soll) * 0.01);

const zz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const wahl = (liste, zufall) => liste[(zufall || zz)(0, liste.length - 1)];
const stufeIn = (s) => Math.max(1, Math.min(5, Math.round(s || 1)));

/* ---------- Die Dose ---------- */
/* Zylinder mit Volumen V (cm³): Oberfläche als Funktion des Radius, Höhe aus der Nebenbedingung.
   faktor = Anzahl der Deckel-Flächen in der Zielgröße: 2 (geschlossen), 1 (offen), 4 (Boden und Deckel doppelt so dick). */
export const hoeheAus = (r, V) => V / (PI * r * r);
export const oberflaeche = (r, V, faktor = 2) => faktor * PI * r * r + 2 * V / r;
export function optimaleDose(V, faktor = 2) {
  const r = Math.cbrt(V / (faktor * PI));
  const h = hoeheAus(r, V);                 // = faktor · r
  return { V, r, h, O: oberflaeche(r, V, faktor), faktor };
}
/* Wie viel Prozent mehr Material braucht eine Dose mit Radius r als die optimale? */
export const mehrverbrauch = (r, V, faktor = 2) => (oberflaeche(r, V, faktor) / optimaleDose(V, faktor).O - 1) * 100;

/* Volumen-Liste für Aufgaben: 330 (Buchbeispiel) und 150 (Buchaufgabe 1) nur ab Stufe 3 */
const VOLUMEN = [200, 250, 400, 440, 500, 568, 750, 1000, 1500];
const VOLUMEN_ALLE = [150, ...VOLUMEN, 330];
const volumenFuer = (s, zufall) => wahl(s >= 3 ? VOLUMEN_ALLE : VOLUMEN, zufall);

/* ---------- Grundtypen ---------- */
export const ARTEN = [
  { id: "zielfunktion", name: "Zielfunktion finden" },
  { id: "dose", name: "Optimale Maße" },
  { id: "rueckwaerts", name: "Rückwärts" },
  { id: "vergleich", name: "Echte Dose prüfen" },
];

export function aufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe);
  if (art === "zielfunktion") {
    const V = volumenFuer(s, zufall);
    const V2 = 2 * V;
    const optionen = [
      `O(r) = 2\\pi r^{2} + \\frac{${V2}}{r}`,
      `O(r) = 2\\pi r^{2} + \\frac{${V}}{r}`,
      `O(r) = \\pi r^{2} + \\frac{${V2}}{r}`,
      `O(r) = 2\\pi r + \\frac{${V2}}{r^{2}}`,
    ];
    const fehler = [
      "",
      "Der Mantel ist 2πr · h. Mit h = V/(πr²) bleibt 2V/r – der Faktor 2 gehört dazu.",
      "Eine geschlossene Dose hat Boden und Deckel: zweimal πr².",
      "Boden und Deckel sind Kreisflächen (πr²), nicht Umfänge (2πr) – und der Mantel wird zu 2V/r, nicht zu 2V/r².",
    ];
    const reihenfolge = gemischt(optionen, zufall(0, 11));
    return { art, V, optionen, fehler, reihenfolge, richtig: 0 };
  }
  if (art === "dose") {
    const V = volumenFuer(s, zufall);
    const d = optimaleDose(V);
    return { art, V, r: d.r, h: d.h, O: d.O };
  }
  if (art === "rueckwaerts") {
    const r = wahl(s <= 2 ? [2, 3, 4, 5] : [2.5, 3.5, 4.5, 6, 1.5], zufall);
    const V = 2 * PI * r ** 3;
    return { art, r, V, h: 2 * r };
  }
  // vergleich: eine reale Dose – Radius und Volumen gegeben
  const V = volumenFuer(s, zufall);
  const d = optimaleDose(V);
  const r = rund(d.r * wahl(s <= 2 ? [0.75, 0.85, 1.25] : [0.6, 0.7, 0.8, 1.3, 1.5], zufall), 1);
  const h = hoeheAus(r, V), O = oberflaeche(r, V);
  return { art, V, r, h, O, Omin: d.O, prozent: mehrverbrauch(r, V) };
}

export function aufgabeTex(a) {
  if (a.art === "zielfunktion") return `V = ${a.V}\\,\\text{cm}^{3},\\quad O = 2\\pi r^{2} + 2\\pi r h`;
  if (a.art === "dose") return `V = ${a.V}\\,\\text{cm}^{3}`;
  if (a.art === "rueckwaerts") return `r = ${dk(a.r)}\\,\\text{cm},\\quad h = 2r`;
  return `V = ${a.V}\\,\\text{cm}^{3},\\quad r = ${dk(a.r)}\\,\\text{cm}`;
}

/* Prüfen: zielfunktion → Index der gewählten Option; dose → { r, h, O }; rueckwaerts → { V, h }; vergleich → { h, O, prozent } */
export function pruefe(a, eingabe) {
  if (a.art === "zielfunktion") {
    const i = Number(eingabe);
    return i === a.richtig ? { ok: true } : { ok: false, grund: a.fehler[i] || "" };
  }
  const felder = {};
  const teste = (k, soll, tol) => { felder[k] = nah(lies(eingabe[k]), soll, tol); };
  if (a.art === "dose") { teste("r", a.r, 0.011); teste("h", a.h, 0.021); teste("O", a.O, tolFuer(a.O)); }
  if (a.art === "rueckwaerts") { teste("V", a.V, tolFuer(a.V)); teste("h", a.h, 0.011); }
  if (a.art === "vergleich") { teste("h", a.h, 0.011); teste("O", a.O, tolFuer(a.O)); teste("prozent", a.prozent, Math.max(0.6, a.prozent * 0.02)); }
  return { ok: Object.values(felder).every(Boolean), felder };
}

export function rechenweg(a) {
  if (a.art === "zielfunktion") return [
    `${a.V} = \\pi r^{2} h \\;\\Rightarrow\\; h = \\frac{${a.V}}{\\pi r^{2}}`,
    `O(r) = 2\\pi r^{2} + 2\\pi r \\cdot \\frac{${a.V}}{\\pi r^{2}} = 2\\pi r^{2} + \\frac{${2 * a.V}}{r}`,
  ];
  if (a.art === "dose") return [
    `O(r) = 2\\pi r^{2} + \\frac{${2 * a.V}}{r}`,
    `O'(r) = 4\\pi r - \\frac{${2 * a.V}}{r^{2}} = 0 \\;\\Rightarrow\\; r^{3} = \\frac{${a.V}}{2\\pi}`,
    `r = \\sqrt[3]{\\frac{${a.V}}{2\\pi}} \\approx ${dk(a.r)}, \\quad h = \\frac{${a.V}}{\\pi r^{2}} = 2r \\approx ${dk(a.h)}`,
    `O(r) \\approx ${dk(a.O)}`,
  ];
  if (a.art === "rueckwaerts") return [
    `h = 2r = ${dk(a.h)}`,
    `V = \\pi r^{2} h = \\pi \\cdot ${dk(a.r)}^{2} \\cdot ${dk(a.h)} = 2\\pi r^{3} \\approx ${dk(a.V, 1)}`,
  ];
  return [
    `h = \\frac{${a.V}}{\\pi \\cdot ${dk(a.r)}^{2}} \\approx ${dk(a.h)}`,
    `O = 2\\pi \\cdot ${dk(a.r)}^{2} + 2\\pi \\cdot ${dk(a.r)} \\cdot ${dk(a.h)} \\approx ${dk(a.O, 1)}`,
    `O_{\\min} = 2\\pi r_{1}^{2} + \\frac{${2 * a.V}}{r_{1}} \\approx ${dk(a.Omin, 1)} \\quad (r_{1} = \\sqrt[3]{\\frac{${a.V}}{2\\pi}})`,
    `\\frac{${dk(a.O, 1)}}{${dk(a.Omin, 1)}} \\approx ${dk(a.O / a.Omin, 3)} \\;\\Rightarrow\\; \\text{etwa } ${dk(a.prozent, 1)}\\,\\%\\text{ mehr Material}`,
  ];
}

export function tipp(a) {
  if (a.art === "zielfunktion") return "Erst die Nebenbedingung nach h auflösen, dann h im Term für O ersetzen. Kürzen: 2πr · V/(πr²) = 2V/r.";
  if (a.art === "dose") return "Ableiten, O′(r) = 0 setzen, nach r³ auflösen – die Zahl im Nenner ist 2π, nicht 4π (vorher kürzen!). Dann h = 2r.";
  if (a.art === "rueckwaerts") return "Bei der optimalen Dose ist h = 2r. Das Volumen ist dann πr² · 2r = 2πr³.";
  return "Höhe aus V = πr²h. Oberfläche mit dieser Höhe ausrechnen und mit O(r₁) der optimalen Dose vergleichen – der Quotient minus 1 ist der Mehrverbrauch.";
}

/* ---------- Übungen zu den Aufgaben der GFS-Seite ---------- */
/* Jede Buchaufgabe als eigene Übung zur gleichen Idee: eigene Zahlen (Generator), eigene Kontexte,
   eigene Rückmeldung und je eine Variante, die im Buch nicht steht. */
export const BUCH_ARTEN = [
  { id: "flugzeug", name: "Kleine Dose" },
  { id: "zaun", name: "Zaun mit festem Umfang" },
  { id: "beet", name: "Fläche fest, Umfang minimal" },
  { id: "quader", name: "Quader-Karton" },
  { id: "zelt", name: "Zelt und Kegel" },
  { id: "dreieck", name: "Dreieck im Dreieck" },
  { id: "begruenden", name: "Begründen" },
];

const W3 = Math.sqrt(3);
export function buchAufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe);
  if (art === "flugzeug") {
    // Buchidee: kleine Dose mit anderem Volumen. Eigene Stufe: offen (h = r) und dicker Boden/Deckel (h = 4r)
    const variante = s <= 2 ? "geschlossen" : s === 3 ? "offen" : s === 4 ? wahl(["geschlossen", "offen", "dick"], zufall) : "dick";
    const faktor = { geschlossen: 2, offen: 1, dick: 4 }[variante];
    const V = wahl(s <= 2 ? [200, 250, 400, 500, 568] : [150, 200, 250, 330, 440, 500, 1000], zufall);
    const d = optimaleDose(V, faktor);
    return { art, V, variante, faktor, r: d.r, h: d.h, O: d.O, verhaeltnis: faktor };
  }
  if (art === "zaun") {
    // Buchidee: fester Umfang, maximale Fläche. Eigene Stufe: Hauswand (nur drei Seiten Zaun)
    const variante = s <= 2 ? "frei" : s === 3 ? "wand" : wahl(["frei", "wand"], zufall);
    const L = s <= 2 ? wahl([24, 36, 40, 60, 80, 120], zufall) : zufall(10, 60) * 2;
    const kontext = wahl(["Weidezaun", "Beet-Einfassung", "Lichterkette um eine Tanzfläche", "Bilderrahmen-Leiste"], zufall);
    if (variante === "frei") return { art, variante, L, kontext, a: L / 4, b: L / 4, A: (L * L) / 16 };
    return { art, variante, L, kontext, a: L / 2, b: L / 4, A: (L * L) / 8 };   // a parallel zur Wand, a + 2b = L
  }
  if (art === "beet") {
    // Buchidee: feste Fläche, minimaler Umfang. Eigene Stufe: eine Seite ist eine Mauer
    const variante = s <= 2 ? "frei" : s === 3 ? "wand" : wahl(["frei", "wand"], zufall);
    const A = s <= 2 ? wahl([100, 225, 625, 900, 1600, 2500], zufall) : wahl([144, 200, 288, 400, 450, 800, 1250, 3600], zufall);
    const kontext = wahl(["Gemüsebeet", "Hühnergehege", "Parkplatz", "Spielfeld"], zufall);
    if (variante === "frei") { const a = Math.sqrt(A); return { art, variante, A, kontext, a, b: a, U: 4 * a }; }
    const b = Math.sqrt(A / 2);
    return { art, variante, A, kontext, a: 2 * b, b, U: 4 * b };               // a an der Mauer, U = a + 2b
  }
  if (art === "quader") {
    // Buchidee: Quader mit quadratischer Grundfläche. Eigene Stufe: doppelt dicker Boden und Deckel
    const variante = s <= 2 ? "geschlossen" : s === 3 ? "offen" : wahl(["geschlossen", "offen", "dick"], zufall);
    const V = s <= 2 ? wahl([64, 125, 216, 343, 512, 729], zufall) : wahl([100, 250, 500, 1000, 1728, 2000, 4000], zufall);
    const f = { geschlossen: 1, offen: 2, dick: 0.5 }[variante];                 // a³ = f · V
    const a = Math.cbrt(f * V), h = V / (a * a);
    const O = variante === "geschlossen" ? 6 * a * a : variante === "offen" ? 3 * a * a : 4 * a * a + 4 * a * h;
    return { art, variante, V, a, h, O };
  }
  if (art === "zelt") {
    // Buchidee: Pyramide aus vier Stäben. Eigene Stufe: Kegelzelt aus denselben Stäben als Mantellinien
    const variante = s <= 2 ? "pyramide" : s === 3 ? "kegel" : wahl(["pyramide", "kegel"], zufall);
    const st = wahl(s <= 2 ? [2, 2.5, 4, 5, 6] : [1.8, 2.2, 3, 3.5, 4.5], zufall);
    const h = st / W3;
    if (variante === "pyramide") { const a = (2 * st) / W3; return { art, variante, st, h, a, V: (a * a * h) / 3 }; }
    const r = st * Math.sqrt(2 / 3);
    return { art, variante, st, h, r, V: (PI * r * r * h) / 3 };
  }
  if (art === "dreieck") {
    // Buchidee (1891): Parallele zur Basis, Dreieck DEM maximal. Eigene Stufe: Rechteck im Dreieck
    const variante = s <= 2 ? "dreieck" : s === 3 ? "rechteck" : wahl(["dreieck", "rechteck"], zufall);
    const c = zufall(4, 12), H = zufall(4, 12);
    if (variante === "dreieck") return { art, variante, c, H, x: H / 2, A: (c * H) / 8, anteil: 4 };
    return { art, variante, c, H, x: H / 2, A: (c * H) / 4, anteil: 2 };
  }
  return { art: "begruenden" };
}

export function buchAuftrag(a) {
  const v = a.variante;
  if (a.art === "flugzeug") {
    const kopf = `Eine Getränkedose soll ${a.V} ml fassen.`;
    if (v === "geschlossen") return `${kopf} Für welche Werte von r und h braucht die zylinderförmige Dose am wenigsten Blech?`;
    if (v === "offen") return `${kopf} Die Dose ist oben offen (ein Becher). Für welche Werte von r und h ist der Materialverbrauch am kleinsten?`;
    return `${kopf} Boden und Deckel werden aus doppelt so dickem Blech gefertigt wie der Mantel. Für welche Werte von r und h ist der Materialverbrauch am kleinsten?`;
  }
  if (a.art === "zaun") {
    if (v === "frei") return `Ein ${a.kontext} ist ${a.L} m lang. Damit soll ein Rechteck mit möglichst großem Flächeninhalt eingefasst werden. Wie lang sind die Seiten?`;
    return `Ein ${a.kontext} ist ${a.L} m lang. Er umschließt ein Rechteck an einer Hauswand – die Wandseite braucht keinen Zaun. Für welche Seitenlängen ist die Fläche am größten? (a liegt an der Wand.)`;
  }
  if (a.art === "beet") {
    if (v === "frei") return `Ein rechteckiges ${a.kontext} soll ${a.A} m² groß werden. Wie lang sind die Seiten zu wählen, damit der Umfang minimal wird?`;
    return `Ein rechteckiges ${a.kontext} von ${a.A} m² liegt mit der Seite a an einer Mauer. Nur die drei übrigen Seiten werden eingezäunt. Für welche Seitenlängen ist die Zaunlänge am kleinsten?`;
  }
  if (a.art === "quader") {
    const kopf = `Ein Karton mit quadratischer Grundfläche (Seite a) und Höhe h fasst ${a.V} cm³.`;
    if (v === "geschlossen") return `${kopf} Wie groß müssen a und h sein, damit die Oberfläche minimal wird – und wie groß ist sie dann?`;
    if (v === "offen") return `${kopf} Der Karton ist oben offen. Für welche Werte von a und h ist der Materialverbrauch am kleinsten?`;
    return `${kopf} Boden und Deckel bestehen aus doppelt so dicker Pappe wie die Seitenwände. Für welche Werte von a und h ist der Materialverbrauch am kleinsten?`;
  }
  if (a.art === "zelt") {
    if (v === "pyramide") return `Ein Zelt mit quadratischem Grundriss wird von vier Stäben der Länge ${dk(a.st)} m getragen (Pyramide). Für welche Höhe h ist der Rauminhalt am größten, und wie groß ist er?`;
    return `Ein kegelförmiges Zelt wird von Stäben der Länge ${dk(a.st)} m getragen, die von der Spitze bis zum Boden reichen. Für welche Höhe h ist der Rauminhalt am größten, und wie groß ist er?`;
  }
  if (a.art === "dreieck") {
    if (v === "dreieck") return `Ein Dreieck hat die Grundseite c = ${a.c} cm und die Höhe ${a.H} cm. Eine Parallele zur Grundseite schneidet die beiden anderen Seiten in D und E; M ist ein beliebiger Punkt auf der Grundseite. In welchem Abstand x von der Grundseite hat das Dreieck DEM den größten Flächeninhalt?`;
    return `Einem Dreieck mit der Grundseite c = ${a.c} cm und der Höhe ${a.H} cm wird ein Rechteck einbeschrieben: Eine Seite liegt auf der Grundseite, die beiden oberen Ecken auf den Schenkeln. Für welche Höhe x des Rechtecks ist seine Fläche am größten?`;
  }
  return "";
}

/* Felder je Übung: [schlüssel, Beschriftung, Einheit, Toleranz] */
export function buchFelder(a) {
  const t = (soll) => tolFuer(soll);
  if (a.art === "flugzeug") return [["r", "r", "cm", 0.011], ["h", "h", "cm", 0.021]];
  if (a.art === "zaun") return [["a", "a", "m", 0.011], ["b", "b", "m", 0.011], ["A", "A", "m²", t(a.A)]];
  if (a.art === "beet") return [["a", "a", "m", 0.011], ["b", "b", "m", 0.011], ["U", "U", "m", t(a.U)]];
  if (a.art === "quader") return [["a", "a", "cm", 0.011], ["h", "h", "cm", 0.011]];
  if (a.art === "zelt") return [["h", "h", "m", 0.011], ["V", "V", "m³", t(a.V)]];
  if (a.art === "dreieck") return [["x", "x", "cm", 0.011], ["A", "A", "cm²", t(a.A)]];
  return [];
}

export function buchPruefe(a, eingabe) {
  const felder = buchFelder(a).map(([k, , , tol]) => nah(lies(eingabe[k]), a[k], tol));
  const r = { ok: felder.every(Boolean), felder };
  if (a.art === "zaun" || a.art === "beet") {
    const ea = lies(eingabe.a), eb = lies(eingabe.b);
    r.vertauscht = !r.ok && ea !== null && eb !== null && nah(ea, a.b, 0.011) && nah(eb, a.a, 0.011) && a.a !== a.b;
  }
  return r;
}

export function buchRechenweg(a) {
  const v = a.variante;
  if (a.art === "flugzeug") {
    const k = a.faktor, V2 = 2 * a.V;
    return [
      `h = \\frac{${a.V}}{\\pi r^{2}}, \\quad O(r) = ${k}\\pi r^{2} + \\frac{${V2}}{r}`,
      `O'(r) = ${2 * k}\\pi r - \\frac{${V2}}{r^{2}} = 0 \\;\\Rightarrow\\; r^{3} = \\frac{${a.V}}{${k}\\pi}`,
      `r = \\sqrt[3]{\\frac{${a.V}}{${k}\\pi}} \\approx ${dk(a.r)}, \\quad h = \\frac{${a.V}}{\\pi r^{2}} = ${k === 1 ? "" : k}r \\approx ${dk(a.h)}`,
      `O'' > 0, \\; O(r) \\to \\infty \\text{ an beiden Rändern} \\;\\Rightarrow\\; \\text{globales Minimum}`,
    ];
  }
  if (a.art === "zaun") {
    if (v === "frei") return [
      `2a + 2b = ${a.L} \\;\\Rightarrow\\; b = ${a.L / 2} - a, \\quad A(a) = a \\cdot (${a.L / 2} - a) = ${a.L / 2}a - a^{2}`,
      `A'(a) = ${a.L / 2} - 2a = 0 \\;\\Rightarrow\\; a = ${dk(a.a)}, \\quad b = ${dk(a.b)}, \\quad A = ${dk(a.A)}`,
      `A'' = -2 < 0, \\text{ Ränder } A(0) = A(${a.L / 2}) = 0 \\;\\Rightarrow\\; \\text{Quadrat ist optimal}`,
    ];
    return [
      `a + 2b = ${a.L} \\;\\Rightarrow\\; a = ${a.L} - 2b, \\quad A(b) = (${a.L} - 2b) \\cdot b = ${a.L}b - 2b^{2}`,
      `A'(b) = ${a.L} - 4b = 0 \\;\\Rightarrow\\; b = ${dk(a.b)}, \\quad a = ${dk(a.a)}, \\quad A = ${dk(a.A)}`,
      `\\text{An der Wand: } a = 2b \\text{ – die Wand ersetzt einen Teil des Zauns}`,
    ];
  }
  if (a.art === "beet") {
    if (v === "frei") return [
      `a \\cdot b = ${a.A} \\;\\Rightarrow\\; b = \\frac{${a.A}}{a}, \\quad U(a) = 2a + \\frac{${2 * a.A}}{a}`,
      `U'(a) = 2 - \\frac{${2 * a.A}}{a^{2}} = 0 \\;\\Rightarrow\\; a^{2} = ${a.A} \\;\\Rightarrow\\; a = b = ${dk(a.a)}, \\quad U = ${dk(a.U)}`,
      `U(a) \\to \\infty \\text{ für } a \\to 0 \\text{ und } a \\to \\infty \\;\\Rightarrow\\; \\text{globales Minimum}`,
    ];
    return [
      `a \\cdot b = ${a.A} \\;\\Rightarrow\\; a = \\frac{${a.A}}{b}, \\quad U(b) = \\frac{${a.A}}{b} + 2b`,
      `U'(b) = -\\frac{${a.A}}{b^{2}} + 2 = 0 \\;\\Rightarrow\\; b^{2} = ${a.A / 2} \\;\\Rightarrow\\; b = ${dk(a.b)}, \\quad a = ${dk(a.a)}, \\quad U = ${dk(a.U)}`,
      `\\text{An der Mauer: } a = 2b`,
    ];
  }
  if (a.art === "quader") {
    if (v === "geschlossen") return [
      `h = \\frac{${a.V}}{a^{2}}, \\quad O(a) = 2a^{2} + 4ah = 2a^{2} + \\frac{${4 * a.V}}{a}`,
      `O'(a) = 4a - \\frac{${4 * a.V}}{a^{2}} = 0 \\;\\Rightarrow\\; a^{3} = ${a.V} \\;\\Rightarrow\\; a = ${dk(a.a)}, \\quad h = a`,
      `O = 6a^{2} \\approx ${dk(a.O)} \\text{ – der Würfel ist der sparsamste Quader}`,
    ];
    if (v === "offen") return [
      `O(a) = a^{2} + 4ah = a^{2} + \\frac{${4 * a.V}}{a}`,
      `O'(a) = 2a - \\frac{${4 * a.V}}{a^{2}} = 0 \\;\\Rightarrow\\; a^{3} = ${2 * a.V} \\;\\Rightarrow\\; a = ${dk(a.a)}, \\quad h = \\frac{a}{2} \\approx ${dk(a.h)}`,
      `\\text{Ohne Deckel: halb so hoch wie breit}`,
    ];
    return [
      `\\text{Material} = 2 \\cdot 2a^{2} + 4ah = 4a^{2} + \\frac{${4 * a.V}}{a}`,
      `M'(a) = 8a - \\frac{${4 * a.V}}{a^{2}} = 0 \\;\\Rightarrow\\; a^{3} = ${a.V / 2} \\;\\Rightarrow\\; a = ${dk(a.a)}, \\quad h = 2a \\approx ${dk(a.h)}`,
      `\\text{Teurer Boden und Deckel: doppelt so hoch wie breit}`,
    ];
  }
  if (a.art === "zelt") {
    const s2 = rund(a.st * a.st, 4);
    if (v === "pyramide") return [
      `\\text{Halbe Diagonale } \\frac{a}{\\sqrt{2}}: \\; h^{2} + \\frac{a^{2}}{2} = ${dk(a.st)}^{2}`,
      `a^{2} = 2(${dk(s2, 4)} - h^{2})`,
      `V(h) = \\frac{1}{3} a^{2} h = \\frac{2}{3}(${dk(s2, 4)} - h^{2}) h = \\frac{2}{3}(${dk(s2, 4)} h - h^{3})`,
      `V'(h) = \\frac{2}{3}(${dk(s2, 4)} - 3h^{2}) = 0 \\;\\Rightarrow\\; h = \\frac{${dk(a.st)}}{\\sqrt{3}} \\approx ${dk(a.h)}`,
      `a \\approx ${dk(a.a)}, \\quad V \\approx ${dk(a.V)}`,
    ];
    return [
      `r^{2} + h^{2} = ${dk(a.st)}^{2} \\;\\Rightarrow\\; V(h) = \\frac{1}{3}\\pi (${dk(s2, 4)} - h^{2}) h`,
      `V'(h) = \\frac{1}{3}\\pi (${dk(s2, 4)} - 3h^{2}) = 0 \\;\\Rightarrow\\; h = \\frac{${dk(a.st)}}{\\sqrt{3}} \\approx ${dk(a.h)}`,
      `r = \\sqrt{${dk(s2, 4)} - h^{2}} \\approx ${dk(a.r)}, \\quad V \\approx ${dk(a.V)} \\text{ – dieselbe Höhe wie beim Pyramidenzelt}`,
    ];
  }
  if (a.art === "dreieck") {
    const { c, H } = a;
    if (v === "dreieck") return [
      `\\text{Strahlensatz: } \\frac{DE}{${c}} = \\frac{${H} - x}{${H}} \\;\\Rightarrow\\; DE = ${c} - \\frac{${c}}{${H}}x`,
      `A(x) = \\frac{1}{2} \\cdot DE \\cdot x = \\frac{${c}}{2}x - \\frac{${c}}{${2 * H}}x^{2}`,
      `A'(x) = \\frac{${c}}{2} - \\frac{${c}}{${H}}x = 0 \\;\\Rightarrow\\; x = \\frac{${H}}{2} = ${dk(a.x)}`,
      `A = \\frac{${c} \\cdot ${H}}{8} = ${dk(a.A)}`,
      `\\text{Der Punkt M spielt keine Rolle – Grundseite und Höhe von DEM hängen nicht von M ab}`,
    ];
    return [
      `\\text{Breite des Rechtecks: } b(x) = ${c} - \\frac{${c}}{${H}}x, \\quad A(x) = b(x) \\cdot x = ${c}x - \\frac{${c}}{${H}}x^{2}`,
      `A'(x) = ${c} - \\frac{${2 * c}}{${H}}x = 0 \\;\\Rightarrow\\; x = \\frac{${H}}{2} = ${dk(a.x)}`,
      `A = \\frac{${c} \\cdot ${H}}{4} = ${dk(a.A)}`,
      `\\text{Das Rechteck füllt genau die Hälfte des Dreiecks}`,
    ];
  }
  return [];
}

export function buchTipp(a) {
  const v = a.variante;
  if (a.art === "flugzeug") return v === "geschlossen" ? "Zielgröße O = 2πr² + 2πrh, Nebenbedingung V = πr²h. Nach h auflösen und einsetzen."
    : v === "offen" ? "Nur ein Kreis: O = πr² + 2πrh. Das ändert die Ableitung – und das Ergebnis h = r." : "Boden und Deckel zählen doppelt: M = 4πr² + 2πrh. Dann wird h = 4r.";
  if (a.art === "zaun") return v === "frei" ? "Nebenbedingung 2a + 2b = L. Eine Variable ersetzen, dann hat A nur noch eine Variable." : "An der Wand gilt a + 2b = L. Die Wandseite a braucht keinen Zaun.";
  if (a.art === "beet") return v === "frei" ? "Nebenbedingung a · b = A. Nach b auflösen: U(a) = 2a + 2A/a." : "Nur drei Seiten: U = a + 2b mit a · b = A.";
  if (a.art === "quader") return v === "geschlossen" ? "O = 2a² + 4ah mit h = V/a²." : v === "offen" ? "Ohne Deckel: O = a² + 4ah." : "Zähle Boden und Deckel doppelt: 4a² + 4ah.";
  if (a.art === "zelt") return "Pythagoras verbindet Stab, Höhe und Grundfläche. Die Nebenbedingung steckt in dieser Gleichung – löse sie nach a² bzw. r² auf.";
  if (a.art === "dreieck") return "Strahlensatz: Die Parallele im Abstand x ist so lang wie c · (H − x)/H. Das ist die Nebenbedingung.";
  return "";
}

/* Einheit und Hinweis zur Variante für die Anzeige */
export function buchHinweis(a) {
  const v = a.variante;
  if (a.art === "flugzeug") return v === "geschlossen" ? "Geschlossene Dose" : v === "offen" ? "Offene Dose – eine Stufe tiefer" : "Doppelt dicker Boden und Deckel – eine Stufe tiefer";
  if (a.art === "zaun" || a.art === "beet") return v === "frei" ? "Vier Seiten" : "Drei Seiten (Wand) – eine Stufe tiefer";
  if (a.art === "quader") return v === "geschlossen" ? "Geschlossener Karton" : v === "offen" ? "Offener Karton" : "Dicker Boden und Deckel – eine Stufe tiefer";
  if (a.art === "zelt") return v === "pyramide" ? "Pyramidenzelt" : "Kegelzelt – eine Stufe tiefer";
  if (a.art === "dreieck") return v === "dreieck" ? "Aufgabe von 1891" : "Rechteck im Dreieck – eine Stufe tiefer";
  return "";
}

/* ---------- Begründen: Beweise mit Lücken ---------- */
export const BEGRUENDUNGEN = [
  {
    id: "doppelt", titel: "Warum ist die Höhe der optimalen Dose genau doppelt so groß wie der Radius?",
    ziel: "h = 2r",
    schritte: [
      { text: "Aus der Nebenbedingung $V = \\pi r^{2} h$ folgt $h = \\frac{V}{\\pi r^{2}}$. Setzt man das in $O = 2\\pi r^{2} + 2\\pi r h$ ein, wird der Mantel zu …",
        optionen: ["$\\frac{2V}{r}$", "$\\frac{2V}{r^{2}}$", "$2\\pi V r$"], richtig: 0 },
      { text: "Die Zielfunktion lautet $O(r) = 2\\pi r^{2} + \\frac{2V}{r}$. Ihre Ableitung ist …",
        optionen: ["$O'(r) = 4\\pi r - \\frac{2V}{r^{2}}$", "$O'(r) = 4\\pi r - \\frac{2V}{r}$", "$O'(r) = 4\\pi r + \\frac{2V}{r^{2}}$"], richtig: 0 },
      { text: "Aus $O'(r) = 0$ folgt $4\\pi r = \\frac{2V}{r^{2}}$, also $4\\pi r^{3} = 2V$. Nach $r^{3}$ aufgelöst ergibt das …",
        optionen: ["$r^{3} = \\frac{V}{2\\pi}$", "$r^{3} = \\frac{2V}{\\pi}$", "$r^{3} = \\frac{V}{4\\pi}$"], richtig: 0 },
      { text: "Jetzt zurück in die Nebenbedingung: $h = \\frac{V}{\\pi r^{2}}$. Mit $V = 2\\pi r^{3}$ wird daraus $h = \\frac{2\\pi r^{3}}{\\pi r^{2}} = $ …",
        optionen: ["$2r$", "$r$", "$2\\pi r$"], richtig: 0 },
      { text: "Die Dose ist also genau so hoch wie …",
        optionen: ["ihr Durchmesser", "ihr Radius", "ihr Umfang"], richtig: 0 },
    ],
  },
  {
    id: "global", titel: "Warum ist das lokale Minimum auch das globale Minimum?",
    ziel: "O(r) \\to \\infty \\text{ an beiden Rändern von } D = (0; \\infty)",
    schritte: [
      { text: "$O''(r) = 4\\pi + \\frac{4V}{r^{3}}$ ist für alle $r > 0$ …",
        optionen: ["positiv – also liegt bei $r_{1}$ ein lokales Minimum", "negativ – also ein lokales Maximum", "null – keine Aussage"], richtig: 0 },
      { text: "Für $r \\to 0$ wird der Summand $\\frac{2V}{r}$ …",
        optionen: ["beliebig groß – die Dose wird zum endlos langen Strohhalm", "beliebig klein", "gleich $2V$"], richtig: 0 },
      { text: "Für $r \\to \\infty$ wird der Summand $2\\pi r^{2}$ …",
        optionen: ["beliebig groß – die Dose wird zur riesigen flachen Scheibe", "beliebig klein", "gleich $2\\pi$"], richtig: 0 },
      { text: "An beiden Rändern wächst $O$ über alle Grenzen, und $O'$ hat nur eine Nullstelle. Deshalb ist $O(r_{1})$ …",
        optionen: ["der kleinste Wert, den $O$ überhaupt annimmt", "nur einer von mehreren Tiefpunkten", "der größte Wert von $O$"], richtig: 0 },
    ],
  },
  {
    id: "quadrat", titel: "Warum ist bei festem Umfang das Quadrat das Rechteck mit der größten Fläche?",
    ziel: "A(a) = a \\cdot (\\frac{U}{2} - a) \\text{ ist maximal für } a = \\frac{U}{4}",
    schritte: [
      { text: "Aus $2a + 2b = U$ folgt $b = $ …",
        optionen: ["$\\frac{U}{2} - a$", "$U - a$", "$\\frac{U}{2} - 2a$"], richtig: 0 },
      { text: "Die Fläche $A(a) = a \\cdot (\\frac{U}{2} - a) = \\frac{U}{2} a - a^{2}$ ist eine …",
        optionen: ["nach unten geöffnete Parabel – ihr Scheitel ist ein Maximum", "nach oben geöffnete Parabel – ihr Scheitel ist ein Minimum", "Gerade"], richtig: 0 },
      { text: "$A'(a) = \\frac{U}{2} - 2a = 0$ liefert $a = \\frac{U}{4}$, und damit $b = \\frac{U}{2} - \\frac{U}{4} = $ …",
        optionen: ["$\\frac{U}{4}$ – alle Seiten gleich lang", "$\\frac{U}{2}$", "$0$"], richtig: 0 },
      { text: "Dieselbe Idee steckt in der Dose: Je „runder“ eine Form bei festem Inhalt, desto …",
        optionen: ["kleiner ihre Oberfläche", "größer ihre Oberfläche", "größer ihr Volumen"], richtig: 0 },
    ],
  },
];

/* Reihenfolge der Antworten je Anzeige mischen – die richtige liegt sonst immer vorn */
export function gemischt(optionen, salz = 0) {
  const idx = optionen.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = (i * 7 + salz * 3 + 1) % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}

/* ---------- Gegenüberstellung: Buchaufgabe → Übung in der App ---------- */
/* Für Basti und die Kursseite: Idee der GFS-Seite, nichts vom Wortlaut. */
export const ADAPTION = [
  { buch: "Beispiel der Seite", idee: "Zylinder mit festem Volumen, Oberfläche minimal", app: "dose",
    wie: "Immer neue Volumina statt des Buchvolumens; das Dosen-Labor zeigt jede Dose maßstäblich, die Prozentzahl des Mehrverbrauchs ist unser eigener Zusatz. Das Buchvolumen taucht erst ab Stufe 3 auf." },
  { buch: "Aufgabe 1", idee: "Kleinere Dose mit anderem Volumen", app: "flugzeug",
    wie: "Zufällige Volumina aus einer eigenen Liste, das Buchvolumen nur ab Stufe 3. Eine Stufe tiefer: offene Dose (h = r) und doppelt dicker Boden und Deckel (h = 4r) – beide Varianten stehen nicht im Buch." },
  { buch: "Aufgabe 2 a", idee: "Fester Umfang, größte Fläche", app: "zaun",
    wie: "Eigene Kontexte (Weidezaun, Lichterkette, Rahmenleiste) mit zufälliger Länge statt der Buchlänge. Eine Stufe tiefer: Hauswand – nur drei Seiten brauchen Zaun, Ergebnis a = 2b." },
  { buch: "Aufgabe 2 b", idee: "Feste Fläche, kleinster Umfang", app: "beet",
    wie: "Eigene Kontexte und Flächen, Quadratzahlen auf Stufe 1 bis 2 (die Buchfläche kommt dort nicht vor). Eine Stufe tiefer: eine Seite ist eine Mauer. Rückmeldung erkennt vertauschte Seiten." },
  { buch: "Aufgabe 3", idee: "Quader mit quadratischer Grundfläche, geschlossen und offen", app: "quader",
    wie: "Kubikzahlen als Volumen statt 1 l; geschlossen (Würfel), offen (h = a/2) und als eigene Variante doppelt dicke Pappe für Boden und Deckel (h = 2a)." },
  { buch: "Aufgabe 4", idee: "Pyramidenzelt aus vier Stäben", app: "zelt",
    wie: "Zufällige Stablänge, die Buchlänge nur ab Stufe 3. Eine Stufe tiefer: Kegelzelt mit denselben Stäben als Mantellinien – die optimale Höhe ist dieselbe, das ist die Pointe." },
  { buch: "Aufgabe 5", idee: "Dreieck DEM unter einer Parallelen (Schulbuch 1891)", app: "dreieck",
    wie: "Zufällige Grundseite und Höhe, Herleitung über den Strahlensatz mit der Einsicht, dass M keine Rolle spielt. Eine Stufe tiefer: einbeschriebenes Rechteck füllt genau die halbe Dreiecksfläche." },
  { buch: "Erarbeitung (fünf Schritte)", idee: "h = 2r und Randbetrachtung", app: "begruenden",
    wie: "Zwei geführte Lückenbeweise (h = 2r, lokales = globales Minimum) und ein dritter zum Quadrat – als Vorbereitung auf den Tafelanschrieb." },
];

/* ---------- GFS: Gliederung und Kolloquium ---------- */
export const GLIEDERUNG = [
  { min: 2, titel: "Einstieg", text: "Zwei Dosen mit gleichem Inhalt auf den Tisch stellen – eine schlanke, eine gedrungene. Frage an die Klasse: Welche braucht weniger Blech? Dann die Leitfrage: Wie sieht die sparsamste Dose aus?" },
  { min: 3, titel: "Das Problem sauber stellen", text: "Zielgröße Oberfläche O = 2πr² + 2πrh, Nebenbedingung V = πr²h. Erkläre, warum man mit zwei Variablen nicht ableiten kann und die Nebenbedingung deshalb eine davon „schluckt“." },
  { min: 6, titel: "Die Rechnung an der Tafel", text: "h = V/(πr²) einsetzen, O(r) = 2πr² + 2V/r, Definitionsmenge r > 0, Ableitung, O′(r) = 0, r³ = V/(2π). Dann der Clou: h = 2r. Zum Schluss O″ > 0 und die Ränder: Beide gehen gegen unendlich." },
  { min: 4, titel: "Fünf-Schritte-Strategie und Varianten", text: "Die Schrittfolge als Werkzeug für alle Extremwertprobleme vorstellen. Dann kurz zeigen, wie sich das Ergebnis ändert: offene Dose h = r, dicker Deckel h = 4r, Quader wird zum Würfel." },
  { min: 2, titel: "Wirklichkeit und Fazit", text: "Echte Dosen sind höher als optimal – Handlichkeit, Regale, Marketing. Fazit in einem Satz: Nebenbedingung einsetzen, dann ist es Kurvendiskussion mit Rand." },
];

export const TIPPS = [
  "Die Rechnung mit dem allgemeinen V führen, nicht nur mit einer Zahl – dann steht h = 2r ohne Rundung da, und das überzeugt im Kolloquium.",
  "Zwei echte Dosen mitbringen und ausmessen: Das Verhältnis h : r liegt bei den meisten weit über 2. Daraus wird der beste Einstieg und das beste Fazit.",
  "Auf das Handout gehören die fünf Schritte, die Rechnung bis h = 2r, eine Skizze des Netzes und zwei Übungsaufgaben mit Lösung.",
];

export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Was ist hier die Zielgröße, was die Nebenbedingung?",
    antwort: "Die Zielgröße ist das, was minimal werden soll: die Oberfläche O = 2πr² + 2πrh. Die Nebenbedingung ist das, was festliegt: das Volumen V = πr²h. Sie verbindet r und h, sodass man eine der beiden Variablen loswird." },
  { stufe: "Basis", frage: "Warum muss man die Nebenbedingung einsetzen, bevor man ableitet?",
    antwort: "Weil O von zwei Variablen abhängt und wir nur Funktionen einer Variablen ableiten können. Nach dem Einsetzen hängt O nur noch von r ab – dann ist es eine gewöhnliche Extremwertaufgabe." },
  { stufe: "Basis", frage: "Warum ist die Definitionsmenge D = (0; ∞)?",
    antwort: "Ein Radius ist positiv, und bei r = 0 gäbe es keine Dose – außerdem steht r im Nenner. Nach oben gibt es keine Grenze: Zu jedem Radius liefert die Nebenbedingung eine passende Höhe." },
  { stufe: "Vertiefung", frage: "Warum ist bei der sparsamsten Dose die Höhe gleich dem Durchmesser?",
    antwort: "Aus O′(r) = 0 folgt r³ = V/(2π), also V = 2πr³. Setzt man das in h = V/(πr²) ein, bleibt h = 2r. Das gilt für jedes Volumen – das Ergebnis ist eine Form, keine Zahl." },
  { stufe: "Vertiefung", frage: "Warum reicht O″(r₁) > 0 nicht, um das globale Minimum zu zeigen?",
    antwort: "O″ > 0 zeigt nur ein lokales Minimum. Global wird es erst durch die Ränder: Für r → 0 geht 2V/r gegen unendlich, für r → ∞ geht 2πr² gegen unendlich. Da O′ nur eine Nullstelle hat, ist das lokale Minimum das kleinste überhaupt." },
  { stufe: "Vertiefung", frage: "Wie ändert sich das Ergebnis bei einer offenen Dose?",
    antwort: "Es fehlt eine Kreisfläche: O = πr² + 2V/r. Dann ergibt O′ = 0 die Gleichung r³ = V/π, und h = V/(πr²) = r. Die offene Dose ist nur halb so hoch wie die geschlossene – so hoch wie ihr Radius." },
  { stufe: "Vertiefung", frage: "Warum sehen echte Dosen anders aus als die optimale?",
    antwort: "Material ist nur ein Kostenfaktor. Eine schlankere Dose liegt besser in der Hand, passt in Automaten und Regale, hat mehr Fläche fürs Etikett, und beim Aufziehen aus einem Blechstück geht am Deckel mehr Verschnitt verloren. Und die Abweichung kostet wenig: Eine 330-ml-Dose mit r ≈ 3,3 cm braucht nur etwa 1,5 % mehr Blech als die optimale, weil die Kurve O(r) nahe am Minimum sehr flach verläuft." },
  { stufe: "Profi", frage: "Was passiert, wenn Boden und Deckel aus doppelt so teurem Material sind?",
    antwort: "Dann minimiert man die Kosten K = 2 · 2πr² + 2πrh = 4πr² + 2V/r. Aus K′ = 0 folgt r³ = V/(4π) und damit h = 4r: Die Dose wird schlanker, weil die teuren Kreisflächen kleiner werden sollen." },
  { stufe: "Profi", frage: "Gibt es das Minimum auch ohne Ableitung?",
    antwort: "Ja. Mit der Ungleichung zwischen arithmetischem und geometrischem Mittel: 2πr² + V/r + V/r ≥ 3 · ∛(2πr² · V/r · V/r) = 3 · ∛(2πV²), mit Gleichheit genau dann, wenn 2πr² = V/r, also r³ = V/(2π). Dasselbe Ergebnis, ohne Kalkül." },
  { stufe: "Profi", frage: "Welche Form hätte das Minimum ohne die Zylinder-Vorgabe?",
    antwort: "Die Kugel. Sie hat bei festem Volumen die kleinste Oberfläche aller Körper – deshalb sind Seifenblasen rund. Der Zylinder mit h = 2r ist die beste Näherung an eine Kugel, die ein Zylinder erreichen kann: Er passt genau in eine Kugel-ähnliche Box." },
  { stufe: "Profi", frage: "Warum ist die Zielfunktion O(r) = 2πr² + 2V/r keine ganzrationale Funktion – und spielt das eine Rolle?",
    antwort: "Wegen des Summanden 2V/r mit r im Nenner. Deshalb hat O eine Polstelle bei r = 0, die man beim Rand mitdenken muss. Für die Ableitung gilt wie immer die Potenzregel mit negativem Exponenten: (2V · r⁻¹)′ = −2V · r⁻²." },
];
