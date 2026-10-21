/* ======================================================================
   hesseKern.js – Rechenkern der Seite „Normalenform und Hessesche Normalenform“ (22.10.2026)
   Reine Mathematik und Aufgaben, kein React – getestet in tests/hesse.test.mjs.

   Eine Ebene E durch den Punkt A mit Normalenvektor n:
     Normalenform        (x − a) · n = 0
     Koordinatenform     n₁x₁ + n₂x₂ + n₃x₃ = d          mit d = a · n
     Hessesche Normalenform (HNF): dieselbe Gleichung durch |n| geteilt,
                         (x − a) · n₀ = 0,  n₀ = n / |n|
     Abstand eines Punktes P:  d(P, E) = |(p − a) · n₀| = |n · p − d| / |n|
   Für die Aufgaben werden Normalenvektoren mit ganzzahliger Länge benutzt
   (pythagoreische Quadrupel), damit |n| und der Abstand ganze Zahlen sind.
   ====================================================================== */

export const skalar = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
export const diff = (P, Q) => Q.map((x, i) => x - P[i]);            // Vektor von P nach Q
export const laenge = (v) => Math.sqrt(skalar(v, v));
export const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));

/* Quadrupel (a, b, c) mit a² + b² + c² = L² – Normalenvektoren mit ganzzahliger Länge */
export const QUADRUPEL = [[1, 2, 2], [2, 3, 6], [1, 4, 8], [4, 4, 7], [2, 6, 9], [6, 6, 7], [3, 4, 12], [2, 10, 11], [8, 9, 12]];

/* ---------- Zufall (rnd: () => [0,1) – austauschbar für Tests) ---------- */
const ganz = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
const ohneNull = (rnd, a, b) => { let x = 0; while (x === 0) x = ganz(rnd, a, b); return x; };
const wahl = (rnd, liste) => liste[Math.floor(rnd() * liste.length)];
const mische = (rnd, liste) => { const l = liste.slice(); for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };

/* Punkt mit ganzzahligen Koordinaten in [−r, r] */
export const punkt = (rnd, r = 5) => [ganz(rnd, -r, r), ganz(rnd, -r, r), ganz(rnd, -r, r)];

/* Normalenvektor für Aufgaben ohne Länge: Komponenten in [−6, 6], höchstens eine Null, nicht alle gleich */
export function normalenvektor(rnd) {
  for (;;) {
    const n = [ganz(rnd, -6, 6), ganz(rnd, -6, 6), ganz(rnd, -6, 6)];
    if (n.filter((x) => x === 0).length > 1) continue;
    if (n.every((x) => x === 0)) continue;
    return n;
  }
}

/* Normalenvektor mit ganzzahliger Länge: Quadrupel, gemischt und mit Vorzeichen */
export function normalenvektorMitLaenge(rnd, hoechstens = 9) {
  const q = wahl(rnd, QUADRUPEL.filter((x) => laenge(x) <= hoechstens));
  return mische(rnd, q).map((x) => (rnd() < 0.4 ? -x : x));
}

/* ---------- Darstellung ---------- */
export const minus = (x) => String(x).replace("-", "−");

/* a·x₁ + b·x₂ + c·x₃ = d als Text (Koeffizienten 0 fallen weg, ±1 ohne Zahl) */
export function koordText(n, d) {
  const teile = [];
  n.forEach((k, i) => {
    if (k === 0) return;
    const x = `x${["₁", "₂", "₃"][i]}`;
    const betrag = Math.abs(k) === 1 ? "" : String(Math.abs(k));
    if (!teile.length) teile.push(`${k < 0 ? "−" : ""}${betrag}${x}`);
    else teile.push(`${k < 0 ? "−" : "+"} ${betrag}${x}`);
  });
  return `${teile.length ? teile.join(" ") : "0"} = ${minus(d)}`;
}

/* Wurzel aus q als Text: ganze Zahl, wenn q Quadratzahl, sonst √q */
export function wurzelText(q) {
  const w = Math.round(Math.sqrt(q));
  return w * w === q ? String(w) : `√${q}`;
}

/* Zahl mit höchstens zwei Nachkommastellen, deutsches Komma */
export const dezimal = (x, stellen = 2) => {
  const r = Math.round(x * 10 ** stellen) / 10 ** stellen;
  return minus(String(r).replace(".", ","));
};

/* ---------- Eingaben lesen ---------- */
/* "−3", "-3", "2,5", "1/2", " 7 " → Zahl; sonst null */
export function liesZahl(s) {
  if (s === null || s === undefined) return null;
  const t = String(s).trim().replace(/−/g, "-").replace(/,/g, ".").replace(/\s+/g, "");
  if (!t) return null;
  const m = t.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (m) { const u = Number(m[2]); return u ? Number(m[1]) / u : null; }
  if (!/^-?\d+(?:\.\d+)?$/.test(t)) return null;
  return Number(t);
}
export const istNah = (x, y, eps = 0.011) => x !== null && y !== null && Math.abs(x - y) <= eps;

/* ---------- Aufgaben ---------- */

export const ARTEN = ["ablesen", "koordinatenform", "punktprobe", "laenge", "abstand"];

/* Aufgabe einer Art. Alle Felder sind reine Daten (die Oberfläche setzt sie). */
export function neueAufgabe(art, rnd = Math.random) {
  switch (art) {
    case "ablesen": {              // Normalenvektor aus der Koordinatenform ablesen
      const n = normalenvektor(rnd);
      const d = ganz(rnd, -9, 9);
      return { art, n, d, loesung: n };
    }
    case "koordinatenform": {      // A und n gegeben → d = a · n, Koordinatenform
      const n = normalenvektor(rnd);
      const A = punkt(rnd, 4);
      return { art, n, A, d: skalar(A, n), loesung: skalar(A, n) };
    }
    case "punktprobe": {           // Normalenform gegeben, liegt P in E? → (p − a) · n berechnen
      const n = normalenvektor(rnd);
      const A = punkt(rnd, 4);
      let P;
      if (rnd() < 0.5) {
        // Punkt in der Ebene: P = A + s·u mit u ⟂ n (ganzzahlig)
        const kandidaten = [];
        for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) for (let k = -3; k <= 3; k++) {
          const u = [i, j, k];
          if (u.some((x) => x !== 0) && skalar(u, n) === 0 && laenge(u) <= 4) kandidaten.push(u);
        }
        const u = kandidaten.length ? wahl(rnd, kandidaten) : [0, 0, 0];
        P = A.map((x, i) => x + u[i]);
      } else {
        P = punkt(rnd, 5);
        if (skalar(diff(A, P), n) === 0) P[0] += n[0] ? 1 : 0;
      }
      const wert = skalar(diff(A, P), n);
      return { art, n, A, P, wert, loesung: wert, liegt: wert === 0 };
    }
    case "laenge": {               // |n| berechnen
      const n = normalenvektorMitLaenge(rnd);
      return { art, n, loesung: Math.round(laenge(n)) };
    }
    case "abstand": {              // Abstand Punkt–Ebene mit der HNF (ganzzahlig)
      for (;;) {
        const n = normalenvektorMitLaenge(rnd);
        const L = Math.round(laenge(n));
        const F = punkt(rnd, 3);                       // Lotfußpunkt
        const t = L <= 3 ? wahl(rnd, [-2, -1, 1, 2]) : wahl(rnd, [-1, 1]);
        const P = F.map((x, i) => x + t * n[i]);        // P = F + t·n → Abstand |t|·|n|
        if (P.some((x) => Math.abs(x) > 12)) continue;
        const d = skalar(n, F);
        const wert = skalar(n, P) - d;                 // = t·|n|²
        return { art, n, d, P, F, L, wert, vorzeichen: Math.sign(t), loesung: Math.abs(t) * L };
      }
    }
    default: return null;
  }
}

/* Prüfung: eingabe ist ein String (oder bei „ablesen“ ein Array aus drei Strings).
   Liefert { ok, art: "gut" | "schlecht" | "warn", text }. */
export function pruefe(a, eingabe) {
  if (a.art === "ablesen") {
    const v = (Array.isArray(eingabe) ? eingabe : []).map(liesZahl);
    if (v.length !== 3 || v.some((x) => x === null)) return { ok: false, art: "warn", text: "Bitte in jedes Feld eine ganze Zahl eintragen." };
    if (v.every((x) => x === 0)) return { ok: false, art: "schlecht", text: "Der Nullvektor ist kein Normalenvektor – er hat keine Richtung." };
    // Vielfaches von n? v = k·n
    const i = a.n.findIndex((x) => x !== 0);
    const k = v[i] / a.n[i];
    const vielfach = k !== 0 && a.n.every((x, j) => istNah(x * k, v[j]));
    if (vielfach && istNah(k, 1)) return { ok: true, art: "gut", text: "Richtig: Die Koeffizienten von x₁, x₂ und x₃ sind genau der Normalenvektor." };
    if (vielfach) return { ok: true, art: "gut", text: `Richtig: Dein Vektor ist das ${dezimal(k)}-Fache des abgelesenen Normalenvektors – jedes Vielfache (außer 0) steht ebenfalls senkrecht auf der Ebene.` };
    if (istNah(v[0], a.d) || istNah(v[2], a.d)) return { ok: false, art: "schlecht", text: "Die Zahl rechts vom Gleichheitszeichen gehört nicht in den Normalenvektor – sie verschiebt nur die Ebene." };
    return { ok: false, art: "schlecht", text: "Nicht ganz: Der Normalenvektor besteht aus den drei Koeffizienten vor x₁, x₂ und x₃ – in dieser Reihenfolge, mit Vorzeichen. Fehlt ein x, ist die Komponente 0." };
  }
  const x = liesZahl(eingabe);
  if (x === null) return { ok: false, art: "warn", text: "Bitte eine Zahl eintragen (z. B. −3 oder 2,5)." };
  if (a.art === "koordinatenform") {
    if (istNah(x, a.loesung)) return { ok: true, art: "gut", text: `Richtig: d = a · n = ${minus(a.loesung)}, also ${koordText(a.n, a.d)}.` };
    if (istNah(x, -a.loesung) && a.loesung !== 0) return { ok: false, art: "schlecht", text: "Vorzeichen: d = a · n steht rechts vom Gleichheitszeichen. Rechne das Skalarprodukt noch einmal mit Vorzeichen." };
    return { ok: false, art: "schlecht", text: "Nicht ganz: d ist das Skalarprodukt a · n – jede Koordinate von A mal die passende Komponente von n, dann addieren." };
  }
  if (a.art === "punktprobe") {
    if (istNah(x, a.loesung)) return { ok: true, art: "gut", text: a.liegt ? "Richtig: (p − a) · n = 0 – P liegt in der Ebene." : `Richtig: (p − a) · n = ${minus(a.loesung)} ≠ 0 – P liegt nicht in der Ebene.` };
    if (istNah(x, skalar(a.P, a.n))) return { ok: false, art: "schlecht", text: "Du hast p · n gerechnet. In der Normalenform steht der Verbindungsvektor p − a: erst von P den Punkt A abziehen, dann mit n multiplizieren." };
    return { ok: false, art: "schlecht", text: "Nicht ganz: Bilde zuerst p − a (Koordinate für Koordinate), dann das Skalarprodukt mit n." };
  }
  if (a.art === "laenge") {
    if (istNah(x, a.loesung)) return { ok: true, art: "gut", text: `Richtig: |n| = √(${a.n.map((v) => `${minus(v)}²`).join(" + ")}) = ${a.loesung}.` };
    if (istNah(x, a.loesung * a.loesung)) return { ok: false, art: "schlecht", text: "Das ist n · n, die Summe der Quadrate. Die Länge ist die Wurzel daraus." };
    return { ok: false, art: "schlecht", text: "Nicht ganz: |n| = √(n₁² + n₂² + n₃²) – jede Komponente quadrieren (Minus verschwindet), addieren, Wurzel ziehen." };
  }
  if (a.art === "abstand") {
    if (istNah(x, a.loesung)) return { ok: true, art: "gut", text: `Richtig: d(P, E) = |n · p − d| / |n| = ${Math.abs(a.wert)} / ${a.L} = ${a.loesung}.` };
    if (istNah(x, -a.loesung)) return { ok: false, art: "schlecht", text: "Fast: Die HNF liefert einen Wert mit Vorzeichen (es sagt, auf welcher Seite der Ebene P liegt). Der Abstand ist der Betrag davon." };
    if (istNah(x, Math.abs(a.wert))) return { ok: false, art: "schlecht", text: `Du hast n · p − d = ${minus(a.wert)} gerechnet, aber noch nicht durch |n| = ${a.L} geteilt. Erst das Teilen macht aus der Koordinatenform die HNF.` };
    if (istNah(x, Math.abs(a.wert) / (a.L * a.L))) return { ok: false, art: "schlecht", text: `Du hast durch |n|² = ${a.L * a.L} geteilt. In der HNF wird durch die Länge |n| = ${a.L} geteilt, nicht durch ihr Quadrat.` };
    return { ok: false, art: "schlecht", text: "Nicht ganz: Setze P in die linke Seite der Koordinatenform ein, ziehe d ab und teile den Betrag durch |n|." };
  }
  return { ok: false, art: "warn", text: "Unbekannte Aufgabe." };
}

/* ---------- Schaubild: Punkte auf und neben der Beispiel-Ebene ----------
   E: n = (1 | 2 | 2), A = (1 | 1 | 2), also x₁ + 2x₂ + 2x₃ = 7; |n| = 3.
   u = (2 | −1 | 0) und v = (2 | 0 | −1) liegen in der Ebene (u · n = v · n = 0).
   X(s, t) = A + s·u + t·v liegt in E; P(s, t, h) = X + h·n liegt im Abstand 3·|h| über/unter E. */
export const BEISPIEL = { n: [1, 2, 2], A: [1, 1, 2], d: 7, u: [2, -1, 0], v: [2, 0, -1], L: 3 };

export function punktInEbene(s, t, B = BEISPIEL) {
  return B.A.map((a, i) => a + s * B.u[i] + t * B.v[i]);
}
export function punktNeben(s, t, h, B = BEISPIEL) {
  const X = punktInEbene(s, t, B);
  return X.map((x, i) => x + h * B.n[i]);
}
/* (p − a) · n und der HNF-Wert (p − a) · n₀ = (p − a) · n / |n| */
export function normalenWert(P, B = BEISPIEL) {
  const w = skalar(diff(B.A, P), B.n);
  return { wert: w, hnf: w / B.L, abstand: Math.abs(w) / B.L };
}
