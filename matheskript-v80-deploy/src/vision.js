/* ======================================================================
   VISION – reine Daten der Seite /vision (ohne React, Node-testbar).
   Oberfläche: funcVision.jsx. Die Kapitel stehen in der Kapitelübersicht
   unter der Bühne und in der Kapitel-Leiste links (ab 1360 px).
   id = Abschnitt in funcVision.jsx, hell = heller Abschnitt (Leiste dunkel).
   ====================================================================== */
export const VISION_KAPITEL = [
  { id: "kapitel-gegner", nr: "01", titel: "Der Gegner" },
  { id: "kapitel-plan", nr: "02", titel: "Der Plan" },
  { id: "kapitel-haltung", nr: "03", titel: "Die Haltung" },
  { id: "kapitel-ort", nr: "04", titel: "Der Ort", hell: true },
  { id: "kapitel-wege", nr: "05", titel: "Zwei Wege" },
  { id: "kapitel-start", nr: "06", titel: "Dein erster Schritt" },
];

/* Wohin die Angebote am Ende der Seite führen (Ansicht in func10.jsx / pfade.js).
   Pen & Paper ist der direkte Knopf: kostenlos und der Einstieg ins System. */
export const VISION_ZIELE = {
  penpaper: { ansicht: "penpaperkurs" },
  mathilda: { ansicht: "analyse", foto: "blatt" },
  kopfrechnen: { ansicht: "headnumbers" },
  mindset: { ansicht: "elternkurs" },
  spenden: { ansicht: "spenden" },
};

/* Schritt 1 „Verstehen“: f(x) = 0,25x³ − 1,5x, f′(x) = 0,75x² − 1,5.
   Hochpunkt bei x = −√2, Tiefpunkt bei x = √2 (f(±√2) = ∓√2). Bildausschnitt in Einheiten der viewBox W × H. */
export const TANGENTE = {
  f: (x) => 0.25 * x * x * x - 1.5 * x,
  fs: (x) => 0.75 * x * x - 1.5,
  xMin: -3.4, xMax: 3.4, yMin: -3.9, yMax: 3.9, W: 380, H: 260, rand: 14,
};

/* Tangente an der Stelle x0, ausgewertet bei x: t(x) = f(x0) + f′(x0)·(x − x0) */
export const tangente = (x0, x, T = TANGENTE) => T.f(x0) + T.fs(x0) * (x - x0);

/* Zahl auf Deutsch: Komma, echtes Minus, keine „−0,00“ */
export const zahlDe = (v, stellen = 2) => {
  const r = Math.abs(v) < 0.5 * 10 ** -stellen ? 0 : v;
  return (r < 0 ? "−" : "") + Math.abs(r).toFixed(stellen).replace(".", ",");
};

/* Schritt 3 „Trainieren“: Vergessenskurve als Modell. Behalten R(t) = e^(−(t − t_w)/S);
   nach jeder Wiederholung t_w wieder 1, danach langsamer (S wächst). Ohne Wiederholung: e^(−t/S₀). */
export const VERGESSEN = { wiederholungen: [2, 5, 11, 22], stabil: [2, 4.5, 10, 22, 45], tage: 30 };
export function behalten(t, mitWiederholung = true, v = VERGESSEN) {
  if (!mitWiederholung) return Math.exp(-t / v.stabil[0]);
  let start = 0, s = v.stabil[0];
  v.wiederholungen.forEach((w, i) => { if (t >= w) { start = w; s = v.stabil[i + 1]; } });
  return Math.exp(-(t - start) / s);
}
