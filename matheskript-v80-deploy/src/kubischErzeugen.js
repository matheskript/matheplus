/* Kubische Funktion mit ganzzahligen Extremstellen (aus func4.jsx ausgelagert, 21.10.2026) – von Klausur,
   Kopfrechnen (func5) und den Prüfungen (func7) genutzt; eigene Datei, damit func7 nicht func4 statisch lädt. */
import { ganz, zuf } from "./base1.jsx";

export function kubischErzeugen() {
  const a = Math.random() < 0.5 ? 1 : -1;
  const p = ganz(-3, 1);
  const q = p + zuf([2, 2, 4]);
  const b = (-3 * a * (p + q)) / 2;
  const c = 3 * a * p * q;
  const r = ganz(-3, 3);
  const d = -(a * r ** 3 + b * r ** 2 + c * r);
  const f = (x) => a * x ** 3 + b * x ** 2 + c * x + d;
  return {
    a, b, c, d, f, r,
    hoch: a > 0 ? p : q,
    tief: a > 0 ? q : p,
    klein: p, gross: q,
    wende: (p + q) / 2,
    fs: `${3 * a}x^2+${2 * b}x+${c}`,
    fss: `${6 * a}x+${2 * b}`,
    fsss: `${6 * a}`,
  };
}
