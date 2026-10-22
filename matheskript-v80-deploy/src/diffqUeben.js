/* ============================================================
   Differenzenquotient – Modus „Üben“ (ohne Oberfläche)
   Zwischen Auto (die App rechnet vor) und Lernen (der Schüler tippt jede Zeile
   selbst) liegt Üben: Der Schüler geht jeden Schritt selbst, wählt aber aus
   ZWEI fertigen Zeilen – eine richtige (aus dem Musterweg) und eine falsche,
   die einen typischen Fehler genau dieses Schritts enthält. Wer falsch tippt,
   bekommt den Grund und wählt die andere; erst die richtige wird eingesetzt.

   uebenWeg(auf, x0, zufall) → Schritte
     { art: fxh | einsetzen | bruch | frei | limes, label, frage,
       richtig: { text } | { a, b },
       optionen: [{ text } | { a, b }, …]   (zwei, Reihenfolge zufällig)
       richtigIndex, falschHinweis, falschArt }

   Jede falsche Option ist numerisch geprüft falsch (dieselbe Prüfung wie in
   Lernen: pruefeFxh / pruefeEinsetzen / pruefeZeile) – ein „Fehler“, der
   zufällig gleichwertig ist (z. B. Faktor 1), fällt heraus. Reine Logik,
   testbar mit Node (tests/diffqUeben.test.mjs).
   ============================================================ */
import {
  ableitungVon, bruchText, entwickelt, fxhWeg, gliederText, lies, musterweg, polyText, pruefeEinsetzen, pruefeFxh, pruefeZeile, zahlText, zusammengefasst,
} from "./diffqKern.js";

/* Zahlen und Terme in Hinweisen: echtes Minuszeichen, negative Zahlen in Klammern, wo sie als Faktor stehen */
const zh = (v) => zahlText(v).replace("-", "−");
const zk = (v) => (v < 0 ? `(${zh(v)})` : zh(v));
const mt = (t) => String(t).replace(/-/g, "−");
const nz = (c) => (c === 0 ? "" : c < 0 ? `-${zahlText(-c)}` : `+${zahlText(c)}`);
const faktor = (v) => (v === 1 ? "" : v === -1 ? "-" : zahlText(v));
const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - i + 1)) / i; return r; };
/* Glieder an der Stelle x₀: x wird zur Zahl, übrig bleiben Glieder in h */
const anStelle = (glieder, x0) => zusammengefasst(glieder.map(({ c, i, j }) => ({ c: c * x0 ** i, i: 0, j })));

/* ---------- Fragen je Schritt ---------- */
function frageZu(label, art, x0) {
  const xs = x0 === null ? "x" : zh(x0);
  if (art === "fxh" && label === "Einsetzen") return x0 === null ? "Ersetze in f jedes x durch (x+h)." : `Setz (${xs}+h) für x ein.`;
  if (art === "fxh") return "Multipliziere aus.";
  if (art === "einsetzen") return `Setz f(${xs}+h) und f(${xs}) in den Bruch ein.`;
  if (art === "limes") return "Lass h gegen 0 gehen: Setz h = 0 ein.";
  if (label === "Zusammenfassen") return "Fasse den Zähler zusammen.";
  if (label === "Auf einen Nenner bringen") return "Bring die beiden Brüche im Zähler auf einen Nenner.";
  if (/erweitern/.test(label)) return "Erweitere so, dass die Wurzeln im Zähler verschwinden.";
  if (label === "h ausklammern") return "Klammere im Zähler h aus.";
  if (label === "Durch h kürzen") return "Kürze durch h.";
  return "Welche Zeile kommt als Nächstes?";
}

/* ---------- Typische Fehler je Schritt (Kandidaten in Vorzugsreihenfolge) ---------- */
/* Vorbereitung 1: x → (x+h) */
function fehlerEinsetzenVor(auf, x0, mw0) {
  const st = x0 !== null;
  const k = [];
  const fx = mw0.b;   // f(x) bzw. f(x₀) genau so, wie es im Musterweg steht (Brüche und Wurzeln exakt)
  const xs = st ? zh(x0) : "x";
  k.push({ art: "plus-h", text: `${fx}+h`, hinweis: `Das h gehört in die Klammer zu ${xs}: f(${xs}+h), nicht f(${xs}) + h.` });
  if (auf.familie !== "frei" || !st) {
    const fh = auf.familie === "poly" ? polyText(auf.koef, "h") : String(auf.f).replace(/x/g, "h");
    k.push({ art: "f-von-h", text: fh, hinweis: st ? `Nicht nur h einsetzen: Für x kommt die ganze Klammer (${zh(x0)}+h).` : "Nicht x durch h ersetzen, sondern durch (x+h) – das x bleibt erhalten." });
  }
  if (auf.familie === "poly") {
    const kf = auf.koef;
    // An einer Stelle nicht: ohne Klammer würden Faktor und Zahl zu einer Zahl verschmelzen (3·2 → „32“)
    if (!st) k.push({ art: "ohne-klammer", text: polyText(kf, "x+h"), hinweis: "Klammer vergessen: (x+h)² ist etwas ganz anderes als x + h². Setz (x+h) immer mit Klammer ein." });
    const xGlieder = kf.map((c, i) => (i > 0 && c ? i : null)).filter((i) => i !== null);
    if (!st && xGlieder.length >= 2) {
      const n = kf.length - 1;
      const oben = new Array(n + 1).fill(0); oben[n] = kf[n];
      const rest = kf.slice(); rest[n] = 0;
      const r = polyText(rest);
      k.push({ art: "teilweise", text: `${polyText(oben, "(x+h)")}${r.startsWith("-") ? "" : "+"}${r}`, hinweis: "Nicht nur beim ersten Glied: Jedes x in f wird durch (x+h) ersetzt." });
    }
  }
  if (auf.familie === "poly") {
    const basis = st ? `(${zahlText(x0)}-h)` : "(x-h)";
    k.push({ art: "minus-h", text: polyText(auf.koef, basis), hinweis: `Plus, nicht minus: In f(${xs}+h) wird ${st ? `(${xs}+h)` : "(x+h)"} eingesetzt.` });
  }
  if (auf.familie === "wurzel" && auf.form.a === 1 && !st) {
    const innen = auf.form.c === 0 ? "x" : `x${nz(auf.form.c)}`;
    k.push({ art: "wurzel-gliedweise", text: `sqrt(${innen})+sqrt(h)`, hinweis: "Wurzeln darf man nicht gliedweise ziehen: √(x+h) ist nicht √(x) + √(h)." });
  }
  if (auf.familie === "bruch" && !st) {
    const { a, c } = auf.form;
    k.push({ art: "bruch-gliedweise", text: `${zahlText(a)}/${c === 0 ? "x" : `(x${nz(c)})`}${a < 0 ? "-" : "+"}${zahlText(Math.abs(a))}/h`, hinweis: "f(x+h) ist nicht f(x) + f(h): Das ganze (x+h) kommt in den Nenner." });
  }
  return k;
}

/* Vorbereitung 2: ausmultiplizieren (nur Polynome) */
function fehlerAusmultiplizieren(auf, x0) {
  const st = x0 !== null, kf = auf.koef, grad = kf.length - 1;
  const text = (gl) => gliederText(st ? anStelle(gl, x0) : zusammengefasst(gl), !st);
  const k = [];
  if (grad >= 2) {
    const gl = [];
    kf.forEach((c, i) => { if (!c) return; gl.push({ c, i, j: 0 }); if (i > 0) gl.push({ c, i: 0, j: i }); });
    k.push({ art: "binom-gliedweise", text: text(gl),
      hinweis: st ? `Potenzen von (${zh(x0)}+h) nie gliedweise – das gemischte Glied fehlt. Binomische Formel: (a+b)² = a² + 2ab + b².`
        : "Potenzen von (x+h) nie gliedweise: (x+h)² = x² + 2xh + h², nicht x² + h² – das gemischte Glied fehlt." });
    const ohne = [];
    kf.forEach((c, i) => { if (!c) return; for (let j = 0; j <= i; j++) ohne.push({ c, i: i - j, j }); });
    k.push({ art: "binom-faktor", text: text(ohne),
      hinweis: grad >= 3 ? "Die Vorfaktoren der binomischen Formel fehlen: (a+b)² = a² + 2ab + b², (a+b)³ = a³ + 3a²b + 3ab² + b³."
        : st ? "Das gemischte Glied der binomischen Formel hat den Faktor 2: (a+b)² = a² + 2ab + b²." : "Das gemischte Glied ist 2xh, nicht xh: (x+h)² = (x+h)(x+h) = x² + 2xh + h²." });
  }
  if (kf.some((c, i) => i > 0 && c && Math.abs(c) !== 1)) {
    const gl = [];
    kf.forEach((c, i) => { if (!c) return; for (let j = 0; j <= i; j++) gl.push({ c: j === 0 ? c : Math.sign(c) * binom(i, j), i: i - j, j }); });
    k.push({ art: "faktor-nicht-verteilt", text: text(gl), hinweis: "Der Faktor vor der Klammer gilt für jedes Glied darin: 3(x+h) = 3x + 3h, nicht 3x + h." });
  }
  k.push({ art: "h-vergessen", text: st ? zahlText(auf.fn(x0)) : polyText(kf), hinweis: st ? `Das ist f(${zh(x0)}) – alle Glieder mit h sind verloren gegangen.` : "Das ist f(x) – alle Glieder mit h sind verloren gegangen." });
  return k;
}

/* Einsetzen in den Bruch: Felder A = f(x+h), B = f(x) */
function fehlerEinsetzenBruch(auf, x0, A, B) {
  const st = x0 !== null, xs = st ? zh(x0) : "x";
  const k = [{ art: "vertauscht", a: B, b: A, hinweis: `Reihenfolge: Im Zähler steht f(${xs}+h) − f(${xs}) – zuerst der Wert mit h, dann der ohne.` }];
  if (!st && auf.familie !== "frei") k.push({ art: "f-von-h", a: A, b: B.replace(/x/g, "h"), hinweis: "f(x) heißt: der Term von f mit x – ohne h. Im zweiten Feld hast du h für x eingesetzt." });
  if (st && Math.abs(auf.fn(x0) - x0) > 1e-9) k.push({ art: "stelle-statt-wert", a: A, b: zahlText(x0), hinweis: `f(${xs}) ist der Funktionswert: ${xs} in f einsetzen und ausrechnen – nicht die Stelle selbst.` });
  return k;
}

/* Umformungszeilen über h (bruch) */
function fehlerBruchZeile(auf, x0, label) {
  const st = x0 !== null, k = [];
  if (auf.familie === "poly") {
    const kf = auf.koef;
    let P = entwickelt(kf);
    if (st) P = anStelle(P, x0);
    const Fx = st ? [{ c: auf.fn(x0), i: 0, j: 0 }] : kf.map((c, i) => ({ c, i, j: 0 })).filter((t) => t.c);
    const Q = zusammengefasst([...P, ...Fx.map((t) => ({ ...t, c: -t.c }))]);
    if (label === "Zusammenfassen") {
      if (!st && Fx.length >= 2) {
        const oben = Fx.reduce((m, t) => (t.i > m.i ? t : m), Fx[0]);
        const falsch = zusammengefasst([...P, ...Fx.map((t) => (t === oben ? { ...t, c: -t.c } : t))]);
        k.push({ art: "minus-nur-vorne", text: gliederText(falsch), hinweis: "Das Minus vor f(x) gilt für jedes Glied: −(x² + 3x) = −x² − 3x. Danach bleibt kein Glied ohne h übrig." });
      }
      k.push({ art: "plus-statt-minus", text: gliederText(zusammengefasst([...P, ...Fx])), hinweis: `Im Zähler wird f(${st ? zh(x0) : "x"}) abgezogen – die Glieder ohne h heben sich weg, sie verdoppeln sich nicht.` });
      k.push({ art: "fx-vergessen", text: gliederText(P), hinweis: `Da fehlt das − f(${st ? zh(x0) : "x"}). Nach dem Zusammenfassen steht in jedem Glied ein h.` });
      const R = Q.map((t) => ({ ...t, j: t.j - 1 }));
      k.push({ art: "schon-gekuerzt", text: gliederText(R), hinweis: "Hier wird nur zusammengefasst – durch h geteilt wird erst später. Der Bruch über h bleibt noch stehen." });
    }
    if (label === "h ausklammern") {
      const sortiert = [...Q].sort((a, b) => a.j - b.j || b.i - a.i);
      const erst = sortiert.map((t, n) => (n === 0 ? { ...t, j: t.j - 1 } : t));
      k.push({ art: "nur-erstes", text: `h(${gliederText(erst)})`, hinweis: "Ausklammern heißt: aus jedem einzelnen Glied ein h herausziehen – aus h² wird h, aus 2xh wird 2x." });
      k.push({ art: "nicht-reduziert", text: `h(${gliederText(Q)})`, hinweis: "In der Klammer hat jedes Glied ein h weniger: h · (…) muss wieder den Zähler darüber ergeben." });
    }
  }
  if (auf.familie === "bruch") {
    const { a, c } = auf.form;
    const az = zahlText(a);
    if (st) {
      const s = x0 + c, sh = `(${zahlText(s)}+h)`;
      if (label === "Auf einen Nenner bringen") k.push({ art: "kreuz-vertauscht", text: `(${faktor(a)}${sh}${a * s < 0 ? "+" : "-"}${zahlText(Math.abs(a * s))})/(${faktor(s)}${sh})`, hinweis: `Über Kreuz: Der erste Bruch bekommt den Faktor ${zk(s)}, der zweite (${zh(s)}+h) – du hast es vertauscht.` });
      if (label === "Zusammenfassen") {
        k.push({ art: "vorzeichen", text: `${faktor(a)}h/(${faktor(s)}${sh})`, hinweis: `Achte auf das Minus vor der Klammer: ${zh(s)} − (${zh(s)} + h) = −h.` });
        k.push({ art: "schon-gekuerzt", text: `${zahlText(-a)}/(${faktor(s)}${sh})`, hinweis: "Hier wird nur zusammengefasst – das h im Zähler bleibt stehen, gekürzt wird im nächsten Schritt." });
      }
    } else {
      const xc = c === 0 ? "x" : `(x${nz(c)})`, xhc = `(x+h${nz(c)})`;
      if (label === "Auf einen Nenner bringen") k.push({ art: "kreuz-vertauscht", text: `(${faktor(a)}${xhc}${a < 0 ? "+" : "-"}${faktor(Math.abs(a))}${xc})/(${xhc}${xc})`, hinweis: `Über Kreuz: Der erste Bruch bekommt den Faktor ${mt(xc)}, der zweite ${mt(xhc)} – du hast es vertauscht.` });
      if (label === "Zusammenfassen") {
        k.push({ art: "vorzeichen", text: `${faktor(a)}h/(${xhc}${xc})`, hinweis: `Achte auf das Minus vor der Klammer: ${xc === "x" ? "x − (x + h)" : `${mt(xc)} − ${mt(xhc)}`} = −h.` });
        k.push({ art: "schon-gekuerzt", text: `${zahlText(-a)}/(${xhc}${xc})`, hinweis: "Hier wird nur zusammengefasst – das h im Zähler bleibt stehen, gekürzt wird im nächsten Schritt." });
      }
    }
  }
  if (auf.familie === "wurzel") {
    const { a, c } = auf.form;
    const az = a === 1 ? "" : a === -1 ? "-" : zahlText(a);
    const innen = st ? zahlText(x0 + c) : c === 0 ? "x" : `x${nz(c)}`;
    const m = st ? x0 + c : null, wm = st ? Math.sqrt(m) : null, glatt = st && Number.isInteger(wm);
    const w1 = `sqrt(${innen}+h)`, w2 = glatt ? zahlText(wm) : `sqrt(${innen})`;
    const innenK = /[+-]/.test(innen.slice(1)) ? `(${innen})` : innen;
    if (/erweitern/.test(label)) {
      k.push({ art: "falsch-erweitert", text: `${az}(${innen}+h-${innenK})/(${w1}-${w2})`, hinweis: "Erweitert wird mit der Summe der beiden Wurzeln – nur dann ergibt die dritte binomische Formel im Zähler (x+h) − x, und die Wurzeln sind weg." });
      k.push({ art: "binom-vorzeichen", text: `${az}(${innen}+h+${innenK})/(${w1}+${w2})`, hinweis: "Dritte binomische Formel: (√a − √b)(√a + √b) = a − b, mit Minus." });
    }
    if (label === "Zusammenfassen") {
      const doppelt = st ? `${zahlText(2 * m)}+h` : `2x${nz(2 * c)}+h`;
      k.push({ art: "nicht-weggehoben", text: `${az}(${doppelt})/(${w1}+${w2})`, hinweis: `Vorzeichen: (${mt(innen)} + h) − ${mt(innenK)} = h – alles außer h hebt sich weg, nichts verdoppelt sich.` });
    }
  }
  return k;
}

/* h gekürzt (frei) */
function fehlerKuerzen(auf, x0, limesText) {
  const st = x0 !== null, k = [];
  if (auf.familie === "poly") {
    let P = entwickelt(auf.koef);
    if (st) P = anStelle(P, x0);
    const Fx = st ? [{ c: -auf.fn(x0), i: 0, j: 0 }] : auf.koef.map((c, i) => ({ c: -c, i, j: 0 }));
    const Q = zusammengefasst([...P, ...Fx]);
    const R = Q.map((t) => ({ ...t, j: t.j - 1 }));
    if (R.some((t) => t.j > 0)) k.push({ art: "zu-frueh", text: gliederText(R.filter((t) => t.j === 0)), hinweis: "Zu früh: Hier steht noch „lim“ davor, das h bleibt in dieser Zeile. h = 0 setzt du erst im nächsten Schritt." });
    if (Q.length >= 2) {
      const sortiert = [...Q].sort((a, b) => a.j - b.j || b.i - a.i);
      k.push({ art: "teilweise-gekuerzt", text: gliederText(sortiert.map((t, n) => (n === 0 ? { ...t, j: t.j - 1 } : t))), hinweis: "Durch h kürzen heißt: jedes einzelne Glied durch h teilen – h² : h = h." });
    }
    k.push({ art: "nicht-gekuerzt", text: gliederText(Q), hinweis: "Das ist noch der Zähler über dem Bruchstrich. Kürzen heißt: jedes Glied durch h teilen – danach hat jedes Glied ein h weniger." });
  }
  if (auf.familie === "bruch") {
    const { a, c } = auf.form;
    const sh = st ? `(${zahlText(x0 + c)}+h)` : `(x+h${nz(c)})`;
    k.push({ art: "nenner-halb", text: `${zahlText(-a)}/${sh}`, hinweis: "Beim Kürzen fällt nur das h weg – der Nenner bleibt ganz stehen." });
    k.push({ art: "zu-frueh", text: limesText, hinweis: "Zu früh: Hier steht noch „lim“ davor, das h bleibt in dieser Zeile. h = 0 setzt du erst im nächsten Schritt." });
  }
  if (auf.familie === "wurzel") {
    const { a, c } = auf.form;
    const azZ = a === 1 ? "1" : zahlText(a);
    const innen = st ? zahlText(x0 + c) : c === 0 ? "x" : `x${nz(c)}`;
    k.push({ art: "summe-halb", text: `${azZ}/sqrt(${innen}+h)`, hinweis: "Beim Kürzen fällt nur das h weg – im Nenner bleibt die ganze Summe der beiden Wurzeln stehen." });
    k.push({ art: "zu-frueh", text: limesText, hinweis: "Zu früh: Hier steht noch „lim“ davor, das h bleibt in dieser Zeile. h = 0 setzt du erst im nächsten Schritt." });
  }
  return k;
}

/* Grenzwert h → 0 (limes) */
function fehlerGrenzwert(auf, x0, mw0) {
  const st = x0 !== null, k = [];
  const xs = st ? zh(x0) : "x";
  if (auf.familie === "poly") {
    let P = entwickelt(auf.koef);
    if (st) P = anStelle(P, x0);
    const Fx = st ? [{ c: -auf.fn(x0), i: 0, j: 0 }] : auf.koef.map((c, i) => ({ c: -c, i, j: 0 }));
    const R = zusammengefasst([...P, ...Fx]).map((t) => ({ ...t, j: t.j - 1 }));
    if (R.some((t) => t.j > 0)) {
      k.push({ art: "h-gleich-1", text: gliederText(zusammengefasst(R.map((t) => ({ ...t, j: 0 })))), hinweis: "h → 0 heißt: h wird 0, nicht 1. Alle Glieder mit h fallen weg." });
      // nur beim ersten Glied mit h das h weggelassen (z. B. an Stellen mit Steigung 0: −h + h³ → −1)
      const jMin = Math.min(...R.filter((t) => t.j > 0).map((t) => t.j));
      const weg = R.filter((t) => t.j === 0 || t.j === jMin).map((t) => ({ ...t, j: 0 }));
      k.push({ art: "h-weggelassen", text: gliederText(zusammengefasst(weg)), hinweis: "Ein h darf man nicht einfach weglassen: h → 0 macht jedes Glied mit h zu 0 – samt Vorfaktor." });
    }
    const abl = auf.koef.slice(1).map((c, i) => c * (i + 1));
    if (!st && abl[0] && abl.some((c, i) => i > 0 && c)) k.push({ art: "konstante-weg", text: polyText([0, ...abl.slice(1)]), hinweis: `Nur die Glieder mit h werden 0 – die ${zh(abl[0])} ohne h bleibt stehen.` });
    if (!st && abl.length === 1 && abl[0]) k.push({ art: "konstante-weg", text: "0", hinweis: `Nur die Glieder mit h werden 0 – die ${zh(abl[0])} hat kein h, sie bleibt stehen.` });
    const steigung = st ? abl.reduce((sum, c, i) => sum + c * x0 ** i, 0) : 0;
    if (st && Math.abs(steigung) > 1e-9) k.push({ art: "konstante-weg", text: "0", hinweis: `Nur die Glieder mit h werden 0 – die ${zh(steigung)} hat kein h, sie bleibt stehen.` });
  }
  if (auf.familie === "bruch") {
    const { a, c } = auf.form;
    k.push({ art: "quadrat-fehlt", text: st ? bruchText(-a, x0 + c) : `${zahlText(-a)}/${c === 0 ? "x" : `(x${nz(c)})`}`,
      hinweis: st ? `Bei h = 0 wird (${zh(x0 + c)}+h) · ${zk(x0 + c)} zu ${zk(x0 + c)} · ${zk(x0 + c)} = ${zh((x0 + c) ** 2)} – der Nenner ist ein Quadrat.`
        : c === 0 ? "Bei h = 0 wird (x+h) · x zu x · x = x² – der Nenner ist ein Quadrat." : `Bei h = 0 wird ${mt(`(x+h${nz(c)})`)} · ${mt(`(x${nz(c)})`)} zu ${mt(`(x${nz(c)})`)}² – der Nenner ist ein Quadrat.` });
  }
  if (auf.familie === "wurzel") {
    const { a, c } = auf.form;
    const azZ = a === 1 ? "1" : zahlText(a);
    if (st) {
      const m = x0 + c, wm = Math.sqrt(m);
      k.push({ art: "zwei-fehlt", text: Number.isInteger(wm) ? bruchText(a, wm) : `${azZ}/sqrt(${zahlText(m)})`, hinweis: `Bei h = 0 werden beide Wurzeln gleich: √(${zh(m)}) + √(${zh(m)}) = 2√(${zh(m)}) – die 2 gehört in den Nenner.` });
    } else {
      k.push({ art: "zwei-fehlt", text: `${azZ}/sqrt(${c === 0 ? "x" : `x${nz(c)}`})`, hinweis: `Bei h = 0 werden beide Wurzeln gleich: √(${mt(c === 0 ? "x" : `x${nz(c)}`)}) + √(${mt(c === 0 ? "x" : `x${nz(c)}`)}) = 2√(${mt(c === 0 ? "x" : `x${nz(c)}`)}) – die 2 gehört in den Nenner.` });
    }
  }
  if (!st) k.push({ art: "f-statt-ableitung", text: mw0.b, hinweis: "Das ist f(x) selbst, nicht die Ableitung. Setz in der Zeile darüber h = 0 ein." });
  else k.push({ art: "funktionswert", text: mw0.b, hinweis: `Das ist f(${xs}), der Funktionswert – gesucht ist die Steigung f′(${xs}).` });
  return k;
}

/* ---------- Auswahl ---------- */
const istText = (o) => typeof o.text === "string";
function gueltigeWahl(kandidaten, richtig, pruefe, zufall) {
  const gesehen = new Set([istText(richtig) ? richtig.text : `${richtig.a}|${richtig.b}`]);
  const gut = [];
  for (const k of kandidaten) {
    const key = istText(k) ? k.text : `${k.a}|${k.b}`;
    if (gesehen.has(key)) continue;
    gesehen.add(key);
    const lesbar = istText(k) ? !!lies(k.text) : !!lies(k.a) && !!lies(k.b);
    if (!lesbar) continue;
    const r = pruefe(k);
    if (r.ok) continue;
    gut.push({ ...k, hinweis: k.hinweis || r.hinweis });
  }
  if (!gut.length) return null;
  return gut[Math.min(gut.length - 1, Math.floor(zufall() * gut.length))];
}

/* Notnagel, falls kein typischer Fehler greift (z. B. eigene Funktionen): Vorzeichen gedreht, sonst +1 */
function notnagel(richtig, pruefe) {
  if (!istText(richtig)) {
    const k = { art: "plus-eins", a: richtig.a, b: `${richtig.b}+1`, hinweis: "" };
    return { ...k, hinweis: pruefe(k).hinweis || "Das zweite Feld stimmt nicht." };
  }
  const v = Number(String(richtig.text).replace(",", "."));
  const kandidaten = Number.isFinite(v) && /^-?[0-9.,]+$/.test(richtig.text) ? [zahlText(-v || 1)] : [`-(${richtig.text})`, `${richtig.text}+1`];
  for (const t of kandidaten) {
    const k = { art: "notnagel", text: t };
    const r = pruefe(k);
    if (!r.ok) return { ...k, hinweis: r.hinweis || "Diese Zeile ist nicht gleichwertig zur Zeile darüber." };
  }
  return { art: "notnagel", text: `${richtig.text}+1`, hinweis: "Diese Zeile ist nicht gleichwertig zur Zeile darüber." };
}

/* ---------- Der Weg ---------- */
export function uebenWeg(auf, x0 = null, zufall = Math.random) {
  const mw = musterweg(auf, x0);
  const vor = fxhWeg(auf, x0);
  const schritte = [];
  const dazu = (art, label, richtig, kandidaten, pruefe) => {
    const falsch = gueltigeWahl(kandidaten, richtig, pruefe, zufall) || notnagel(richtig, pruefe);
    const richtigZuerst = zufall() < 0.5;
    const { hinweis, art: falschArt, ...falschOpt } = falsch;
    schritte.push({
      art, label, frage: frageZu(label, art, x0), richtig,
      optionen: richtigZuerst ? [richtig, falschOpt] : [falschOpt, richtig],
      richtigIndex: richtigZuerst ? 0 : 1,
      falschHinweis: hinweis, falschArt,
    });
  };
  const pFxh = (k) => pruefeFxh(auf, x0, k.text);
  // Vorbereitung: einsetzen, bei Polynomen ausmultiplizieren
  dazu("fxh", "Einsetzen", { text: vor[0] }, fehlerEinsetzenVor(auf, x0, mw[0]), pFxh);
  if (vor.length > 1) dazu("fxh", "Ausmultiplizieren", { text: vor[1] }, fehlerAusmultiplizieren(auf, x0), pFxh);
  // Bruch: erstes Feld = fertig ausgerechnetes f(x+h)
  const A = vor[vor.length - 1], B = mw[0].b;
  dazu("einsetzen", "Einsetzen", { a: A, b: B }, fehlerEinsetzenBruch(auf, x0, A, B), (k) => {
    const r = pruefeEinsetzen(auf, x0, k.a, k.b);
    return { ok: r.a.ok && r.b.ok, hinweis: r.a.ok ? r.b.hinweis : r.a.hinweis };
  });
  const limesText = mw[mw.length - 1].text;
  for (const m of mw.slice(1)) {
    if (m.label === "Ausmultiplizieren") continue;   // steht schon in der Vorbereitung
    const pZ = (k) => pruefeZeile(auf, x0, m.art, k.text);
    const kand = m.art === "bruch" ? fehlerBruchZeile(auf, x0, m.label) : m.art === "frei" ? fehlerKuerzen(auf, x0, limesText) : fehlerGrenzwert(auf, x0, mw[0]);
    dazu(m.art, m.label, { text: m.text }, kand, pZ);
  }
  return schritte;
}

/* Ergebnis f′ als Eingabetext (für den Abschluss) */
export const uebenErgebnis = (auf, x0 = null) => {
  const mw = musterweg(auf, x0);
  return mw[mw.length - 1].text || ableitungVon(auf).text;
};
