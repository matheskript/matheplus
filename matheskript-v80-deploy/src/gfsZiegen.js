/* ============================================================
   GFS-Trainer · Das Ziegenproblem – bleiben oder wechseln?
   (Lambacher Schweizer 9 BW, Kapitel VI Wahrscheinlichkeit)
   Reine Logik ohne React: Wahrscheinlichkeiten mit n Türen und k
   geöffneten Nieten, Spielrunden und Simulation (mit festem Startwert
   wiederholbar), vier Übungsgeneratoren mit Lösung und gezielter
   Rückmeldung zu typischen Fehlern, Gliederung, Tipps und Kolloquium.
   Getestet in tests/gfsZiegen.test.mjs.
   Nichts stammt aus dem Schulbuch: Aufgaben, Kontexte, Zahlen und
   Formulierungen sind eigene (Prinzip wie in gfsPascalAufgaben.js).
   Spielregeln überall gleich: Der Preis liegt zufällig hinter einer der
   n Türen; der Moderator öffnet nie die gewählte Tür und nie den Preis;
   hat er die Wahl, wählt er zufällig; er bietet immer den Wechsel an.
   ============================================================ */

/* ---------- Zufall ---------- */
/* mulberry32: kleiner, schneller Generator mit Startwert – für wiederholbare Simulationen und Tests */
export function zufallszahlen(startwert = 1) {
  let s = startwert >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* Ganzzahl-Würfel zufall(a, b) wie in den übrigen GFS-Generatoren; mit Startwert wiederholbar */
export const wuerfelAus = (rnd = Math.random) => (a, b) => a + Math.floor(rnd() * (b - a + 1));
const zz = wuerfelAus();
const wahl = (liste, zufall) => liste[(zufall || zz)(0, liste.length - 1)];
const stufeIn = (s) => Math.max(1, Math.min(5, Math.round(s || 1)));

/* ---------- Brüche ---------- */
export const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export const bruch = (z, n) => { const g = ggT(z, n); return { z: z / g, n: n / g }; };
export const wert = (b) => b.z / b.n;
export const mal = (a, b) => bruch(a.z * b.z, a.n * b.n);
export const plus = (a, b) => bruch(a.z * b.n + b.z * a.n, a.n * b.n);
export const gleich = (a, b) => a.z * b.n === b.z * a.n;
/* TeX: ganze Zahlen ohne Bruchstrich (0, 1), sonst \frac{z}{n} */
export const bTex = (b) => (b.n === 1 ? String(b.z) : `\\frac{${b.z}}{${b.n}}`);
/* Klartext „2/3“ */
export const bText = (b) => (b.n === 1 ? String(b.z) : `${b.z}/${b.n}`);
/* Zahl mit Komma, ohne überflüssige Nullen */
export const rund = (x, n = 3) => Math.round(x * 10 ** n) / 10 ** n;
export const dk = (x, n = 3) => String(rund(x, n)).replace("-", "−").replace(".", ",");

/* ---------- Die Mathematik ---------- */
/* n Türen, ein Preis; der Moderator öffnet k Nieten (1 ≤ k ≤ n − 2, k = 0: er öffnet nichts).
   Bleiben gewinnt genau dann, wenn die erste Wahl stimmt: 1/n.
   Wechseln (gleichmäßig zu einer der n − 1 − k übrigen geschlossenen Türen) gewinnt, wenn die erste
   Wahl eine Niete war ((n − 1)/n) und man dann die richtige der n − 1 − k Türen erwischt. */
export const gewinnBleiben = (n) => bruch(1, n);
export const gewinnWechseln = (n, k = n - 2) => bruch(n - 1, n * (n - 1 - k));
export const uebrig = (n, k = n - 2) => n - 1 - k;   // geschlossene Türen, auf die man wechseln kann

/* Eine Runde: Türen 0 … n − 1, Preis bei `auto`, erste Wahl `w`, Moderator öffnet k Nieten.
   Liefert die geöffneten Türen und die Wechsel-Tür (bei k = n − 2 die einzige). */
export function moderatorOeffnet(n, auto, w, k, rnd = Math.random) {
  const kandidaten = [];
  for (let i = 0; i < n; i++) if (i !== auto && i !== w) kandidaten.push(i);
  for (let i = kandidaten.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [kandidaten[i], kandidaten[j]] = [kandidaten[j], kandidaten[i]]; }
  return kandidaten.slice(0, k).sort((a, b) => a - b);
}
export function runde(n = 3, rnd = Math.random, k = n - 2, w = null) {
  const auto = Math.floor(rnd() * n);
  const erste = w === null ? Math.floor(rnd() * n) : w;
  const offen = moderatorOeffnet(n, auto, erste, k, rnd);
  const zu = [];
  for (let i = 0; i < n; i++) if (i !== erste && !offen.includes(i)) zu.push(i);
  const wechsel = zu[Math.floor(rnd() * zu.length)];
  return { n, k, auto, erste, offen, wechsel, bleibenGewinnt: erste === auto, wechselnGewinnt: wechsel === auto };
}
/* Viele Runden: beide Strategien in denselben Spielen. verlauf = relative Häufigkeiten nach jeder Runde (optional). */
export function simuliere(N, n = 3, rnd = Math.random, k = n - 2, verlauf = false) {
  let b = 0, w = 0;
  const kurve = verlauf ? [] : null;
  for (let i = 1; i <= N; i++) {
    const r = runde(n, rnd, k);
    if (r.bleibenGewinnt) b++;
    if (r.wechselnGewinnt) w++;
    if (kurve) kurve.push([b / i, w / i]);
  }
  return { N, n, k, bleiben: b, wechseln: w, kurve };
}

/* ---------- Eingaben lesen ---------- */
/* „2/3“, „0,667“, „,5“, „66,7 %“, „1“ → Zahl; sonst null */
export function liesWkt(s) {
  let t = String(s ?? "").trim().replace(/\s/g, "").replace(/−/g, "-").replace(/,/g, ".");
  if (!t) return null;
  let prozent = false;
  if (t.endsWith("%")) { prozent = true; t = t.slice(0, -1); }
  const m = /^(\d+)\/(\d+)$/.exec(t);
  if (m && !prozent) return Number(m[2]) === 0 ? null : Number(m[1]) / Number(m[2]);
  if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return prozent ? Number(t) / 100 : Number(t);
}
export const liesZahl = (s) => {
  const t = String(s ?? "").trim().replace(/\s/g, "").replace(/−/g, "-").replace(",", ".");
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : null;
};
/* Bruch-Eingabe „12/275“ → { z, n } (wird exakt verglichen); sonst null */
export function liesBruch(s) {
  const m = /^(\d+)\/(\d+)$/.exec(String(s ?? "").replace(/\s/g, ""));
  return m && Number(m[2]) > 0 ? { z: Number(m[1]), n: Number(m[2]) } : null;
}
/* Dezimalzahl: ab 0,1 auf zwei Stellen gerundet (2/3 ≈ 0,67), kleinere Werte auf 1 % genau (12/275 ≈ 0,0436) */
const tolFuer = (soll) => (Math.abs(soll) >= 0.1 ? 0.0051 : Math.max(0.0002, Math.abs(soll) * 0.01));
export const trifft = (ist, soll) => ist !== null && Math.abs(ist - soll) <= tolFuer(soll);

/* ---------- Kontexte (eigene Formulierungen) ---------- */
const KONTEXTE = [
  { id: "show", mehr: "Türen", preis: "das Auto", nieten: "Ziegen", leiter: "Der Moderator",
    wechsel: (m) => (m === 1 ? "zur anderen noch geschlossenen Tür" : "zu einer der noch geschlossenen anderen Türen"),
    satz: (n, k) => `In einer Spielshow stehen ${n} geschlossene Türen. Hinter einer wartet ein Auto, hinter den anderen ${n - 1} je eine Ziege. Du zeigst auf eine Tür. Der Moderator weiß, wo das Auto steht, und öffnet ${k === 1 ? "eine andere Tür" : `${k} andere Türen`} – ${k === 1 ? "eine Ziege" : "lauter Ziegen"}. Dann fragt er: bleiben oder wechseln?` },
  { id: "truhe", mehr: "Truhen", preis: "der Schatz", nieten: "Steine", leiter: "Der Spielleiter",
    wechsel: (m) => (m === 1 ? "zur anderen noch verschlossenen Truhe" : "zu einer der noch verschlossenen anderen Truhen"),
    satz: (n, k) => `Im Escape-Room stehen ${n} verschlossene Truhen. In einer liegt der Schatz, in den übrigen nur Steine. Du legst die Hand auf eine Truhe. Der Spielleiter kennt den Inhalt und öffnet ${k === 1 ? "eine andere Truhe" : `${k} andere Truhen`} mit Steinen. Danach darfst du deine Wahl ändern.` },
  { id: "umschlag", mehr: "Umschläge", preis: "die Konzertkarte", nieten: "leere Zettel", leiter: "Der Lehrer",
    wechsel: (m) => (m === 1 ? "zum anderen noch geschlossenen Umschlag" : "zu einem der noch geschlossenen anderen Umschläge"),
    satz: (n, k) => `Beim Schulfest liegen ${n} Umschläge auf dem Tisch. In einem steckt eine Konzertkarte, in den anderen nur ein leerer Zettel. Du nimmst einen Umschlag in die Hand, ohne ihn zu öffnen. Der Lehrer am Stand weiß, wo die Karte ist, und reißt ${k === 1 ? "einen der anderen Umschläge" : `${k} der anderen Umschläge`} auf – jeweils leer. Du darfst tauschen.` },
  { id: "becher", mehr: "Becher", preis: "die Murmel", nieten: "leere Becher", leiter: "Der Zauberer",
    wechsel: (m) => (m === 1 ? "zum anderen noch umgedrehten Becher" : "zu einem der anderen noch umgedrehten Becher"),
    satz: (n, k) => `Ein Zauberer stellt ${n} Becher umgedreht auf den Tisch; unter einem liegt eine Murmel. Du tippst auf einen Becher. Der Zauberer weiß, wo die Murmel ist, und hebt ${k === 1 ? "einen anderen Becher" : `${k} andere Becher`} hoch – ${k === 1 ? "er ist leer" : "alle leer"}. Bleibst du bei deinem Becher?` },
];
const kontextFuer = (zufall) => wahl(KONTEXTE, zufall);

/* n und k je Stufe: 1 klassisch, 2 mehr Türen (alle bis auf eine offen), 3 nicht alle offen, 4–5 frei und groß */
function nkFuer(s, zufall) {
  if (s === 1) return [3, 1];
  if (s === 2) { const n = wahl([4, 5, 6, 8, 10], zufall); return [n, n - 2]; }
  if (s === 3) { const n = zufall(4, 8); return [n, zufall(1, n - 3)]; }
  if (s === 4) { const n = zufall(5, 12); return [n, zufall(1, n - 2)]; }
  const n = wahl([10, 12, 20, 25, 50, 100], zufall);
  return [n, wahl([1, 2, Math.floor(n / 2), n - 4, n - 3, n - 2].filter((k) => k >= 1 && k <= n - 2), zufall)];
}

/* ---------- Übungen ---------- */
export const ARTEN = [
  { id: "grundtyp", name: "Bleiben oder wechseln" },
  { id: "baum", name: "Baumdiagramm" },
  { id: "haeufigkeit", name: "Häufigkeiten" },
  { id: "moderator", name: "Was weiß der Moderator?" },
];

/* Szenarien zur Frage „Was weiß der Moderator, und was folgt daraus?“ (Typ moderator).
   Immer drei Türen bzw. n Türen, du wählst Tür 1; gefragt ist P(Wechseln gewinnt). */
const B = bruch;
export const SZENARIEN = [
  { id: "wissend", stufen: [1, 2],
    text: () => "Drei Türen, ein Auto, zwei Ziegen. Du wählst Tür 1. Der Moderator weiß, wo das Auto steht, öffnet mit Absicht eine andere Tür mit Ziege und bietet dir den Wechsel an. Wie groß ist die Wahrscheinlichkeit, dass Wechseln gewinnt?",
    richtig: () => B(2, 3), optionen: () => [B(1, 3), B(1, 2), B(2, 3), B(1, 1)],
    erklaerung: () => ["Wechseln gewinnt genau dann, wenn deine erste Wahl eine Ziege war: $\\frac{2}{3}$.",
      "Der Moderator kann immer eine Ziege zeigen – an deiner ersten Wahl ändert sein Öffnen nichts, sie behält $\\frac{1}{3}$."] },
  { id: "wissendN", stufen: [2, 3],
    zahl: (zufall) => wahl([4, 5, 6, 10, 20, 100], zufall),
    text: (n) => `${n} Türen, hinter einer ein Auto. Du wählst Tür 1. Der Moderator weiß Bescheid und öffnet ${n - 2} der anderen Türen, alle mit Ziege. Eine Tür außer deiner bleibt zu. Wie groß ist die Wahrscheinlichkeit, dass Wechseln zu dieser Tür gewinnt?`,
    richtig: (n) => B(n - 1, n), optionen: (n) => [B(1, n), B(1, 2), B(n - 1, n), B(2, 3)],
    erklaerung: (n) => [`Deine Tür trifft mit $\\frac{1}{${n}}$. In allen anderen Fällen – Wahrscheinlichkeit $\\frac{${n - 1}}{${n}}$ – steht das Auto hinter der einen Tür, die der Moderator zulassen musste.`] },
  { id: "ahnungslos", stufen: [3, 4],
    text: () => "Drei Türen, du wählst Tür 1. Diesmal weiß der Moderator nicht, wo das Auto steht: Er öffnet rein zufällig eine der beiden anderen Türen – und es ist eine Ziege. Wie groß ist jetzt die Wahrscheinlichkeit, dass Wechseln gewinnt?",
    richtig: () => B(1, 2), optionen: () => [B(1, 3), B(1, 2), B(2, 3), B(1, 1)],
    erklaerung: () => ["Sechs gleich wahrscheinliche Fälle: Auto hinter Tür 1, 2 oder 3, und der Moderator öffnet Tür 2 oder Tür 3.",
      "In zwei Fällen zeigt er das Auto – die sind ausgeschlossen, denn er hat ja eine Ziege gezeigt. Von den vier übrigen gewinnt Wechseln in zwei: $\\frac{1}{2}$.",
      "Ohne Wissen verrät sein Öffnen nichts darüber, welche der beiden geschlossenen Türen besser ist."] },
  { id: "engel", stufen: [4],
    text: () => "Ein besonders netter Moderator: Er öffnet eine Ziegentür und bietet den Wechsel nur dann an, wenn deine erste Wahl eine Ziege war. Hast du das Auto gewählt, beendet er das Spiel sofort. Er bietet dir den Wechsel an. Wie groß ist die Wahrscheinlichkeit, dass Wechseln gewinnt?",
    richtig: () => B(1, 1), optionen: () => [B(0, 1), B(1, 2), B(2, 3), B(1, 1)],
    erklaerung: () => ["Das Angebot selbst ist die Information: Es kommt nur, wenn du eine Ziege hast.",
      "Dann steht das Auto sicher hinter der anderen geschlossenen Tür – Wechseln gewinnt immer."] },
  { id: "teufel", stufen: [4],
    text: () => "Ein listiger Moderator: Er öffnet eine Ziegentür und bietet den Wechsel nur dann an, wenn du das Auto gewählt hast. Sonst öffnet er sofort deine Tür. Er bietet dir den Wechsel an. Wie groß ist die Wahrscheinlichkeit, dass Wechseln gewinnt?",
    richtig: () => B(0, 1), optionen: () => [B(0, 1), B(1, 3), B(1, 2), B(2, 3)],
    erklaerung: () => ["Er bietet den Wechsel nur an, wenn du schon richtig liegst.",
      "Wer jetzt wechselt, verliert sicher. Die 2/3 gelten nur, wenn der Moderator immer anbietet."] },
  { id: "vorliebeZu", stufen: [5],
    text: () => "Drei Türen, du wählst Tür 1. Der Moderator weiß, wo das Auto steht. Hat er die Wahl zwischen zwei Ziegentüren, öffnet er immer die mit der kleineren Nummer. Er öffnet Tür 3. Wie groß ist die Wahrscheinlichkeit, dass Wechseln zu Tür 2 gewinnt?",
    richtig: () => B(1, 1), optionen: () => [B(1, 2), B(2, 3), B(1, 1), B(1, 3)],
    erklaerung: () => ["Stünde das Auto hinter Tür 1, hätte er die Wahl gehabt – und Tür 2 geöffnet.",
      "Steht es hinter Tür 3, darf er Tür 3 nicht öffnen. Also bleibt nur: Das Auto steht hinter Tür 2. Wechseln gewinnt sicher."] },
  { id: "vorliebeOffen", stufen: [5],
    text: () => "Drei Türen, du wählst Tür 1. Der Moderator weiß, wo das Auto steht. Hat er die Wahl zwischen zwei Ziegentüren, öffnet er immer die mit der kleineren Nummer. Er öffnet Tür 2. Wie groß ist die Wahrscheinlichkeit, dass Wechseln zu Tür 3 gewinnt?",
    richtig: () => B(1, 2), optionen: () => [B(1, 3), B(1, 2), B(2, 3), B(1, 1)],
    erklaerung: () => ["Tür 2 öffnet er in zwei Fällen: Auto hinter Tür 1 (er hatte die Wahl und nimmt die kleinere Nummer) und Auto hinter Tür 3 (er muss).",
      "Beide Fälle haben die Wahrscheinlichkeit $\\frac{1}{3}$ – also sind sie gleich wahrscheinlich, und Wechseln gewinnt mit $\\frac{1}{2}$.",
      "Über alle Spiele gerechnet bleibt es trotzdem bei $\\frac{2}{3}$ fürs Wechseln."] },
  { id: "ahnungslosN", stufen: [5],
    zahl: (zufall) => wahl([4, 5, 10, 20], zufall),
    text: (n) => `${n} Türen, du wählst Tür 1. Der Moderator weiß nicht, wo das Auto steht, und öffnet rein zufällig ${n - 2} der anderen Türen – zufällig lauter Ziegen. Eine Tür außer deiner bleibt zu. Wie groß ist die Wahrscheinlichkeit, dass Wechseln gewinnt?`,
    richtig: () => B(1, 2), optionen: (n) => [B(1, n), B(1, 2), B(n - 1, n), B(1, n - 1)],
    erklaerung: (n) => [`Deine Tür hat das Auto mit $\\frac{1}{${n}}$; dann zeigt er sicher nur Ziegen.`,
      `Die übrig gebliebene Tür hat es ebenfalls mit $\\frac{1}{${n}}$: Auto bei den anderen ($\\frac{${n - 1}}{${n}}$) und er lässt genau diese Tür zu ($\\frac{1}{${n - 1}}$).`,
      "Beide Fälle sind gleich wahrscheinlich: $\\frac{1}{2}$. Nur das Wissen des Moderators macht aus dem Zufall einen Hinweis."] },
];
/* Rückmeldung je falscher Antwort – je Szenario, damit sie zur Lage passt */
const FALLE = "Das ist die 50:50-Falle: Zwei geschlossene Türen heißen nicht automatisch gleiche Chancen. Entscheidend ist, ob und wie der Moderator auswählt.";
const VORHER = "Das war die Chance jeder Tür vor dem Öffnen. Inzwischen hat der Moderator eine Ziege gezeigt – zähle nur noch die Fälle, die dazu passen.";
const NIE_SICHER = "Sicher ist der Gewinn nicht: War deine erste Wahl schon richtig, verliert der Wechsel.";
function moderatorFehler(sz, n, o) {
  const v = wert(o);
  const ist = (x) => Math.abs(v - x) < 1e-9;
  if (sz.id === "wissend" || sz.id === "wissendN") {
    if (ist(0.5)) return FALLE;
    if (ist(1 / n)) return "Das ist die Chance deiner eigenen Tür – also die Gewinnwahrscheinlichkeit beim Bleiben.";
    if (ist(1)) return NIE_SICHER;
    return `Bei ${n} Türen gilt nicht 2/3. Wechseln gewinnt, wenn deine erste Wahl eine Ziege war – wie wahrscheinlich ist das bei ${n} Türen?`;
  }
  if (sz.id === "ahnungslos" || sz.id === "ahnungslosN") {
    if (v > 0.5 && v < 1) return "Diese Zahl gilt nur, wenn der Moderator weiß, wo das Auto ist. Hier öffnet er zufällig – sein Öffnen verrät nichts über die beiden geschlossenen Türen.";
    if (ist(1)) return NIE_SICHER;
    if (ist(1 / n)) return VORHER;
    return "Teile nicht durch die Zahl der anderen Türen: Am Ende sind genau zwei Türen zu, und beide Fälle sind gleich wahrscheinlich.";
  }
  if (sz.id === "engel") return "Achte darauf, wann er anbietet: nur, wenn deine erste Wahl eine Ziege war. Das Angebot verrät alles.";
  if (sz.id === "teufel") return "Achte darauf, wann er anbietet: nur, wenn du das Auto schon hast. Das Angebot ist eine Warnung.";
  if (sz.id === "vorliebeZu") {
    if (ist(2 / 3)) return "2/3 gilt über alle Spiele gemittelt. Hier weißt du mehr: Frag dich, in welchen Fällen er mit seiner Vorliebe überhaupt Tür 3 öffnet.";
    if (ist(0.5)) return FALLE;
    return "Frag dich, in welchen Fällen er mit seiner Vorliebe überhaupt Tür 3 öffnet. Es bleibt nur ein Fall übrig.";
  }
  /* vorliebeOffen */
  if (ist(2 / 3)) return "2/3 gilt über alle Spiele gemittelt. Hier weißt du aber mehr: Er hat Tür 2 geöffnet – zähle nur die Fälle, in denen das passiert.";
  if (ist(1 / 3)) return VORHER;
  return "Sicher ist es nicht: Auch wenn das Auto hinter Tür 1 steht, öffnet er Tür 2 – er nimmt ja die kleinere Nummer.";
}

export function aufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe);
  if (art === "grundtyp") {
    const [n, k] = nkFuer(s, zufall);
    const K = kontextFuer(zufall);
    const b = gewinnBleiben(n), w = gewinnWechseln(n, k);
    return { art, stufe: s, n, k, kontext: K.id, text: K.satz(n, k), soll: { b, w }, loesung: { b: bText(b), w: bText(w) } };
  }
  if (art === "baum") {
    const [n, k] = nkFuer(s, zufall);
    const a = bruch(1, n), b = bruch(n - 1, n), c = bruch(1, uebrig(n, k)), d = mal(b, c);
    const soll = { a, b, c, d };
    return { art, stufe: s, n, k, soll, loesung: Object.fromEntries(Object.entries(soll).map(([x, y]) => [x, bText(y)])) };
  }
  if (art === "haeufigkeit") {
    const [n, k] = s <= 2 ? [3, 1] : s === 3 ? (() => { const m = zufall(4, 6); return [m, m - 2]; })()
      : (() => { const m = s === 4 ? zufall(4, 6) : wahl([6, 8, 10], zufall); return [m, zufall(1, m - 3)]; })();
    const p = gewinnWechseln(n, k), pb = gewinnBleiben(n);
    const N = wahl(s <= 1 ? [20, 30, 50] : s === 2 ? [40, 60, 80, 120] : [50, 100, 200, 250], zufall);
    /* tatsächliches Ergebnis: N echte Runden mit dem Würfel (wiederholbar, wenn der Würfel einen Startwert hat) */
    const rnd = () => zufall(0, 999999) / 1000000;
    const G = simuliere(N, n, rnd, k).wechseln;
    /* Erwartung für M Runden – M so, dass M · p ganzzahlig ist (lcm der Nenner) */
    const nenner = (p.n * pb.n) / ggT(p.n, pb.n);
    const passend = (s <= 2 ? [60, 90, 120, 150, 300, 600] : [300, 600, 900, 1200, 1500, 2400, 3000]).filter((x) => x % nenner === 0);
    const M = passend.length ? wahl(passend, zufall) : nenner * wahl([10, 20, 50], zufall);
    const name = wahl(["Lena", "Tim", "Aylin", "Jonas", "Mia", "Elias", "Sofia", "Noah"], zufall);
    const E = (M / p.n) * p.z, Eb = (M / pb.n) * pb.z;      // exakt ganzzahlig, weil M ein Vielfaches beider Nenner ist
    const soll = { h: G / N, E, ...(s >= 3 ? { Eb } : {}) };
    const loesung = { h: dk(G / N), E: String(E), ...(s >= 3 ? { Eb: String(Eb) } : {}) };
    return { art, stufe: s, n, k, N, G, M, name, p, pb, soll, loesung };
  }
  /* moderator */
  const liste = SZENARIEN.filter((x) => x.stufen.includes(s));
  const sz = wahl(liste, zufall);
  const n = sz.zahl ? sz.zahl(zufall) : 3;
  const optionen = sz.optionen(n);
  const richtig = optionen.findIndex((o) => gleich(o, sz.richtig(n)));
  const reihenfolge = gemischt(optionen, zufall(0, 11));
  return { art: "moderator", stufe: s, szenario: sz.id, n, text: sz.text(n), optionen: optionen.map(bTex), werte: optionen.map(wert),
    fehler: optionen.map((o, i) => (i === richtig ? "" : moderatorFehler(sz, n, o))), richtig, reihenfolge, erklaerung: sz.erklaerung(n), loesung: { wahl: richtig } };
}

/* Felder je Übung: [schlüssel, Beschriftung, Einheit/Hinweis, Art] – Art "wkt" (Bruch, Dezimal, Prozent) oder "zahl" */
export function felder(a) {
  if (a.art === "grundtyp") return [["b", "P(Bleiben)", "", "wkt"], ["w", "P(Wechseln)", "", "wkt"]];
  if (a.art === "baum") return [["a", "a", "", "wkt"], ["b", "b", "", "wkt"], ["c", "c", "", "wkt"], ["d", "d", "", "wkt"]];
  if (a.art === "haeufigkeit") return [
    ["h", "h", "", "wkt"], ["E", "Gewinne beim Wechseln", "", "zahl"], ...(a.stufe >= 3 ? [["Eb", "Gewinne beim Bleiben", "", "zahl"]] : []),
  ];
  return [];
}

export function auftrag(a) {
  if (a.art === "grundtyp") return `${a.text} Wie groß ist die Gewinnwahrscheinlichkeit, wenn du bleibst – und wenn du ${KONTEXTE.find((x) => x.id === a.kontext).wechsel(uebrig(a.n, a.k))} wechselst?`;
  if (a.art === "baum") {
    const m = uebrig(a.n, a.k);
    return `${a.n} Türen, ein Auto. Der Moderator weiß Bescheid und öffnet ${a.k === 1 ? "eine Ziegentür" : `${a.k} Ziegentüren`}. Wer wechselt, ${m === 1 ? "nimmt die eine Tür, die außer seiner noch zu ist" : `wählt zufällig eine der ${m} Türen, die außer seiner noch zu sind`}. Ergänze die Wahrscheinlichkeiten im Baumdiagramm der Strategie „Wechseln“.`;
  }
  if (a.art === "haeufigkeit") {
    const spiel = a.n === 3 ? "das klassische Ziegenspiel mit drei Türen" : `das Spiel mit ${a.n} Türen, bei dem der Moderator ${a.k === 1 ? "eine Ziegentür" : `${a.k} Ziegentüren`} öffnet,`;
    return `${a.name} spielt ${spiel} ${a.N}-mal und wechselt jedes Mal. ${a.name} gewinnt ${a.G}-mal. Wie groß ist die relative Häufigkeit h der Gewinne? Mit wie vielen Gewinnen ist bei ${a.M} Runden zu rechnen${a.stufe >= 3 ? " – beim Wechseln und beim Bleiben" : ", wenn man immer wechselt"}?`;
  }
  return a.text;
}

/* Prüfen: moderator → Index der gewählten Option; sonst { feld: eingabe } */
export function pruefe(a, eingabe) {
  if (a.art === "moderator") {
    const i = Number(eingabe);
    return i === a.richtig ? { ok: true } : { ok: false, grund: a.fehler[i] || "" };
  }
  const ergebnis = {};
  const ist = {};
  for (const [k, , , typ] of felder(a)) {
    ist[k] = typ === "zahl" ? liesZahl(eingabe[k]) : liesWkt(eingabe[k]);
    const soll = typeof a.soll[k] === "number" ? a.soll[k] : wert(a.soll[k]);
    const br = typ === "wkt" ? liesBruch(eingabe[k]) : null;
    ergebnis[k] = typ === "zahl" ? ist[k] !== null && Math.abs(ist[k] - soll) <= 0.5 : br ? Math.abs(wert(br) - soll) < 1e-9 : trifft(ist[k], soll);
  }
  const ok = Object.values(ergebnis).every(Boolean);
  return { ok, felder: ergebnis, grund: ok ? "" : grundFuer(a, ist, ergebnis) };
}

/* gezielte Rückmeldung zum ersten falschen Feld */
function grundFuer(a, ist, erg) {
  const { n, k } = a;
  const m = uebrig(n, k);
  if (a.art === "grundtyp") {
    if (!erg.b) {
      if (trifft(ist.b, 1 / (n - k)) || trifft(ist.b, 0.5)) return `Gleichverteilungs-Falle: Die geöffneten ${a.n === 3 ? "Türen" : "Nieten"} ändern nichts an deiner ersten Wahl – der Moderator kann ja immer eine Niete zeigen. Deine Wahl behält die Chance, die sie am Anfang hatte.`;
      if (ist.b === null) return "Gib die Wahrscheinlichkeit als Bruch (1/3), Dezimalzahl (0,33) oder in Prozent (33 %) ein.";
      return `Bleiben gewinnt nur, wenn die erste Wahl schon stimmt: eine von ${n} gleich wahrscheinlichen Türen.`;
    }
    if (ist.w === null) return "Gib die Wahrscheinlichkeit als Bruch (2/3), Dezimalzahl (0,67) oder in Prozent (67 %) ein.";
    if (trifft(ist.w, 1 / (n - k)) || trifft(ist.w, 0.5)) return "Gleichverteilungs-Falle: Die übrigen Türen sind nicht gleich gut. Der Moderator hat gezielt Nieten geöffnet – deine erste Tür hat er dabei nicht angefasst.";
    if (m > 1 && trifft(ist.w, (n - 1) / n)) return `Fast: Mit ${bText(bruch(n - 1, n))} liegt der Preis bei den anderen Türen. Davon sind aber noch ${m} geschlossen – du kannst nur eine nehmen. Teile also noch durch ${m}.`;
    if (trifft(ist.w, 1 / (n - 1))) return `Die geöffneten Türen fallen weg: Beim Wechseln hast du nur noch ${m} Tür${m === 1 ? "" : "en"} zur Auswahl, nicht ${n - 1}.`;
    if (trifft(ist.w, (n - 1) / n / (n - k))) return "Deine eigene Tür zählt beim Wechseln nicht mit – nur die anderen noch geschlossenen.";
    return `Wechseln gewinnt, wenn die erste Wahl eine Niete war (${bText(bruch(n - 1, n))}) und du dann die richtige der ${m} übrigen Türen erwischst. Pfadregel: multiplizieren.`;
  }
  if (a.art === "baum") {
    if (!erg.a) return trifft(ist.a, (n - 1) / n) ? "a und b sind vertauscht: a ist der Ast „erste Wahl trifft das Auto“." : `Am Anfang sind alle ${n} Türen gleich wahrscheinlich – eine davon hat das Auto.`;
    if (!erg.b) return trifft(ist.b, 1 / n) ? "a und b sind vertauscht: b ist der Ast „erste Wahl ist eine Ziege“." : "Die beiden Äste nach der ersten Wahl ergeben zusammen 1: b = 1 − a.";
    if (!erg.c) {
      if (trifft(ist.c, 1 / (n - 1)) && m !== n - 1) return `Die geöffneten Türen fallen weg: Beim Wechseln stehen nur noch ${m} Tür${m === 1 ? "" : "en"} zur Wahl.`;
      if (trifft(ist.c, 1 / (n - k))) return "Deine eigene Tür ist beim Wechseln tabu – zähle nur die anderen geschlossenen Türen.";
      if (trifft(ist.c, 0.5) && m !== 2) return "Nicht raten: Zähle, wie viele Türen außer deiner noch geschlossen sind. Das Auto steckt auf diesem Ast sicher hinter einer davon.";
      return `Auf dem Ziegen-Ast steht das Auto sicher hinter einer der ${m} anderen geschlossenen Türen – jede ist gleich wahrscheinlich.`;
    }
    if (trifft(ist.d, wert(a.soll.b) + wert(a.soll.c))) return "Pfadregel: Entlang eines Pfades wird multipliziert, nicht addiert.";
    return "Pfadregel: Die Wahrscheinlichkeit des Pfades ist das Produkt der Wahrscheinlichkeiten auf seinen Ästen, also d = b · c.";
  }
  if (a.art === "haeufigkeit") {
    if (!erg.h) {
      if (ist.h !== null && Math.abs(ist.h - a.G) < 0.5) return "Das ist die absolute Häufigkeit. Die relative Häufigkeit ist der Anteil: Anzahl der Gewinne geteilt durch die Zahl der Runden.";
      if (trifft(ist.h, wert(a.p)) && !trifft(a.G / a.N, wert(a.p))) return "Das ist die Wahrscheinlichkeit. Gefragt ist, was in den Runden tatsächlich passiert ist – das weicht durch den Zufall etwas davon ab.";
      if (trifft(ist.h, a.N / a.G)) return "Umgekehrt: Gewinne durch Runden, nicht Runden durch Gewinne.";
      return "Relative Häufigkeit = Anzahl der Gewinne : Anzahl der Runden.";
    }
    if (!erg.E) {
      if (ist.E === null) return "Gib eine Anzahl ein, zum Beispiel 40.";
      if (Math.abs(ist.E - a.M / 2) < 0.5) return "Das ist die 50:50-Falle. Beim Wechseln liegt die Gewinnwahrscheinlichkeit nicht bei 1/2.";
      if (Math.abs(ist.E - a.M * wert(a.pb)) < 0.5) return "Das ist die Erwartung fürs Bleiben. Beim Wechseln ist die Gewinnwahrscheinlichkeit größer.";
      if (Math.abs(ist.E - a.M * a.G / a.N) < 0.5 && Math.abs(a.G / a.N - wert(a.p)) > 1e-9) return `Rechne mit der Wahrscheinlichkeit, nicht mit dem Zufallsergebnis von ${a.name}. Die relative Häufigkeit schwankt, die Wahrscheinlichkeit nicht.`;
      return "Zu erwartende Anzahl = Zahl der Runden · Gewinnwahrscheinlichkeit.";
    }
    if (ist.Eb === null) return "Gib eine Anzahl ein, zum Beispiel 40.";
    if (Math.abs(ist.Eb - a.M / 2) < 0.5) return "Auch beim Bleiben gilt nicht 50:50 – deine erste Wahl behält ihre Anfangschance.";
    if (Math.abs(ist.Eb - (a.M - a.M * wert(a.p))) < 0.5 && a.k !== a.n - 2) return "Bleiben und Wechseln ergänzen sich nur dann zu allen Runden, wenn genau eine andere Tür geschlossen bleibt. Hier sind es mehr.";
    return "Beim Bleiben gewinnt man mit der Wahrscheinlichkeit der ersten Wahl.";
  }
  return "";
}

/* Rechenweg als TeX-Zeilen (moderator: Erklärung als Text mit $…$, siehe erklaerung) */
export function rechenweg(a) {
  const { n, k } = a;
  const m = uebrig(n, k);
  const b = gewinnBleiben(n), z = bruch(n - 1, n), w = gewinnWechseln(n, k);
  const vergleich = () => {
    const q = wert(w) / wert(b);
    const wie = Math.abs(q - 2) < 1e-9 ? "doppelt so gut" : Math.abs(q - Math.round(q)) < 1e-9 ? `${Math.round(q)}-mal so gut` : "besser";
    return `${bTex(w)} > ${bTex(b)} \\;\\Rightarrow\\; \\text{Wechseln ist ${wie}}`;
  };
  if (a.art === "grundtyp") return [
    `P(\\text{Bleiben}) = P(\\text{erste Wahl trifft}) = ${bTex(b)}`,
    `P(\\text{erste Wahl Niete}) = ${bTex(z)}, \\quad \\text{übrig zum Wechseln: } ${n} − 1 − ${k} = ${m}`,
    m === 1
      ? `P(\\text{Wechseln}) = P(\\text{erste Wahl Niete}) = ${bTex(w)}`
      : `P(\\text{Wechseln}) = ${bTex(z)} \\cdot ${bTex(bruch(1, m))} = ${bTex(w)}`,
    vergleich(),
  ];
  if (a.art === "baum") return [
    `a = ${bTex(b)}, \\quad b = 1 − ${bTex(b)} = ${bTex(z)}`,
    `\\text{übrig zum Wechseln: } ${n} − 1 − ${k} = ${m} \\;\\Rightarrow\\; c = ${bTex(bruch(1, m))}`,
    m === 1 ? `d = b \\cdot c = ${bTex(w)}` : `d = b \\cdot c = ${bTex(z)} \\cdot ${bTex(bruch(1, m))} = ${bTex(w)}`,
    vergleich(),
  ];
  if (a.art === "haeufigkeit") {
    const z = [
      `h = \\frac{${a.G}}{${a.N}} ${Math.abs(rund(a.G / a.N) - a.G / a.N) < 1e-12 ? "=" : "\\approx"} ${dk(a.G / a.N)}`,
      `P(\\text{Wechseln}) = ${bTex(a.p)} \\;\\Rightarrow\\; ${a.M} \\cdot ${bTex(a.p)} = ${a.soll.E} \\text{ Gewinne}`,
    ];
    if (a.stufe >= 3) z.push(`P(\\text{Bleiben}) = ${bTex(a.pb)} \\;\\Rightarrow\\; ${a.M} \\cdot ${bTex(a.pb)} = ${a.soll.Eb} \\text{ Gewinne}`);
    const h = a.G / a.N, p = wert(a.p), st = dk(h) === dk(p) ? 4 : 3;
    z.push(Math.abs(h - p) < 1e-12
      ? `h = ${bTex(a.p)} \\text{ – diesmal genau getroffen, das ist Zufall}`
      : `\\text{Zufall in ${a.N} Runden: } h ${Math.abs(rund(h, st) - h) < 1e-12 ? "=" : "\\approx"} ${dk(h, st)} \\text{ statt } ${dk(p, st)}`);
    return z;
  }
  return [];
}

export function tipp(a) {
  if (a.art === "grundtyp") return "Bleiben: Nur die erste Wahl zählt. Wechseln: erste Wahl Niete, dann die richtige der übrigen geschlossenen Türen – multiplizieren.";
  if (a.art === "baum") return "a + b = 1. Auf dem Ziegen-Ast steckt der Preis sicher hinter einer der übrigen geschlossenen Türen. Pfadregel: d = b · c.";
  if (a.art === "haeufigkeit") return "h = Gewinne : Runden. Erwartung = Runden · Wahrscheinlichkeit.";
  return "Frag immer: In welchen Fällen öffnet der Moderator so, wie er es getan hat?";
}

/* Reihenfolge der Antworten je Anzeige mischen – die richtige liegt sonst immer an derselben Stelle */
export function gemischt(optionen, salz = 0) {
  const idx = optionen.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = (i * 7 + salz * 3 + 1) % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}

/* ---------- Herleitung: Fallunterscheidung und natürliche Häufigkeiten ---------- */
/* Du wählst Tür 1. Drei gleich wahrscheinliche Fälle für das Auto. */
export const FAELLE = [
  { auto: 1, oeffnet: "2 oder 3", bleiben: true, wechseln: false },
  { auto: 2, oeffnet: "3", bleiben: false, wechseln: true },
  { auto: 3, oeffnet: "2", bleiben: false, wechseln: true },
];
/* 300 Spiele, Wahl Tür 1, Moderator öffnet Tür 3: wie oft steht das Auto wo? (wissend bzw. ahnungslos) */
export function dreihundert(wissend = true) {
  const je = 100;
  if (wissend) {
    const tuer3 = { auto1: je / 2, auto2: je, auto3: 0 };    // Auto hinter 1: halbe-halbe; hinter 2: muss 3 öffnen; hinter 3: nie
    const summe = tuer3.auto1 + tuer3.auto2;
    return { ...tuer3, summe, wechseln: bruch(tuer3.auto2, summe), bleiben: bruch(tuer3.auto1, summe) };
  }
  const tuer3 = { auto1: je / 2, auto2: je / 2, auto3: je / 2 };  // öffnet zufällig 2 oder 3
  const summe = tuer3.auto1 + tuer3.auto2;                        // auto3: Auto gezeigt – Show geplatzt
  return { ...tuer3, summe, wechseln: bruch(tuer3.auto2, summe), bleiben: bruch(tuer3.auto1, summe) };
}

/* ---------- GFS: Gliederung, Tipps, Kolloquium ---------- */
export const GLIEDERUNG = [
  { min: 3, titel: "Einstieg: das Spiel live", text: "Drei Becher, unter einem ein Gummibärchen, du bist der Moderator. Lass zwei Mitschüler ein paar Runden spielen – einer bleibt immer, einer wechselt immer. Dann Abstimmung: Ist es egal? Die meisten sagen ja. Das ist deine Leitfrage." },
  { min: 2, titel: "Die Spielregeln genau", text: "Schreib die vier Regeln an: Auto zufällig verteilt, Moderator öffnet nie deine Tür und nie das Auto, wählt bei zwei Ziegen zufällig, bietet immer den Wechsel an. Betone: Ohne diese Regeln hat die Frage keine eindeutige Antwort." },
  { min: 6, titel: "Herleitung an der Tafel", text: "Erst die Fallunterscheidung (drei Fälle, Tabelle), dann das Baumdiagramm mit Pfadregel: Bleiben 1/3, Wechseln über den Ziegen-Ast 2/3. Zum Schluss die 300 Spiele: In 150 öffnet er Tür 3, in 100 davon steht das Auto hinter Tür 2." },
  { min: 4, titel: "Warum die Intuition irrt", text: "Der Unterschied liegt im Wissen des Moderators: Ein ahnungsloser Moderator liefert 1/2. Dann die 100 Türen als Aha-Moment und die allgemeine Formel 1/n gegen (n − 1)/n. Simulation zeigen: Die relativen Häufigkeiten pendeln sich bei 1/3 und 2/3 ein." },
  { min: 2, titel: "Geschichte und Fazit", text: "Marilyn vos Savant, 1990, Tausende Leserbriefe, die ihr widersprachen – sie hatte recht. Fazit in einem Satz: Wer wechselt, gewinnt immer dann, wenn er zuerst danebenlag – und das passiert in zwei von drei Fällen." },
];

export const TIPPS = [
  "Spiel das Spiel vor dem Rechnen echt vor – mit drei Bechern oder Karten. Wer es selbst erlebt hat, hört der Herleitung viel aufmerksamer zu.",
  "Lege dich vorher auf die vier Spielregeln fest und schreib sie sichtbar an. Fast jede Gegenfrage im Kolloquium lässt sich mit dem Satz „Das hängt davon ab, was der Moderator weiß“ einordnen.",
  "Auf das Handout gehören die Regeln, die Tabelle der drei Fälle, das Baumdiagramm, die Formel für n Türen und eine kleine Simulation mit Strichliste zum Selbermachen.",
];

export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Warum gewinnt man beim Bleiben nur mit der Wahrscheinlichkeit 1/3?",
    antwort: "Wer bleibt, gewinnt genau dann, wenn seine erste Wahl das Auto war. Am Anfang sind alle drei Türen gleich wahrscheinlich, also 1/3. Das Öffnen ändert daran nichts, weil der Moderator immer eine Ziegentür findet – egal, was hinter meiner Tür steht." },
  { stufe: "Basis", frage: "Warum gewinnt man beim Wechseln mit 2/3?",
    antwort: "Wer wechselt, gewinnt genau dann, wenn die erste Wahl eine Ziege war – das passiert mit 2/3. Dann muss der Moderator die andere Ziege zeigen, und hinter der letzten Tür steht sicher das Auto. Im Baumdiagramm ist das der Pfad über den Ziegen-Ast: 2/3, danach gewinnt Wechseln mit Sicherheit." },
  { stufe: "Basis", frage: "Es sind doch nur noch zwei Türen zu – warum ist es nicht 50 zu 50?",
    antwort: "Zwei Möglichkeiten heißen nicht zwei gleich wahrscheinliche Möglichkeiten. Die Laplace-Regel gilt nur, wenn kein Ergebnis bevorzugt ist. Meine Tür hat der Moderator nicht angerührt, die andere hat er bewusst stehen lassen – die beiden Türen sind also nicht gleichwertig." },
  { stufe: "Vertiefung", frage: "Welche Rolle spielt das Wissen des Moderators?",
    antwort: "Die entscheidende. Weil er weiß, wo das Auto ist, ist seine Wahl in zwei von drei Fällen erzwungen – er verrät indirekt die Autotür. Öffnet er dagegen zufällig und erwischt zufällig eine Ziege, haben beide geschlossenen Türen 1/2: Von sechs gleich wahrscheinlichen Fällen fallen die zwei weg, in denen er das Auto zeigt, und von den vier übrigen gewinnt Wechseln zwei." },
  { stufe: "Vertiefung", frage: "Wie sieht das Ergebnis bei n Türen aus?",
    antwort: "Bleiben gewinnt mit 1/n. Öffnet der Moderator n − 2 Ziegentüren, gewinnt Wechseln mit (n − 1)/n – bei 100 Türen also mit 99/100. Öffnet er nur k Türen, verteilt sich die Chance (n − 1)/n auf die n − 1 − k übrigen Türen: Wechseln gewinnt dann mit (n − 1)/(n · (n − 1 − k)), und das ist für jedes k ≥ 1 mehr als 1/n." },
  { stufe: "Vertiefung", frage: "Wie kann man das Ergebnis ohne Formeln überprüfen?",
    antwort: "Durch Simulation: viele Runden spielen und eine Strichliste führen. Nach dem empirischen Gesetz der großen Zahlen stabilisieren sich die relativen Häufigkeiten bei der Wahrscheinlichkeit. Nach 1000 Runden liegt der Anteil der Wechsel-Gewinne typischerweise zwischen etwa 0,64 und 0,70." },
  { stufe: "Vertiefung", frage: "Was ändert sich, wenn man schon weiß, dass der Moderator Tür 3 geöffnet hat?",
    antwort: "Nichts am Ergebnis, aber man muss anders zählen. Von 300 Spielen mit Wahl Tür 1 öffnet er Tür 3 in 50 Spielen mit Auto hinter Tür 1 (er hat die Wahl) und in allen 100 Spielen mit Auto hinter Tür 2 (er muss). In 100 von 150 Spielen gewinnt also Wechseln – wieder 2/3." },
  { stufe: "Profi", frage: "Gibt es Regeln, unter denen Wechseln schlechter ist als Bleiben?",
    antwort: "Ja: wenn der Moderator den Wechsel nur anbietet, wenn ich das Auto schon habe. Dann ist das Angebot eine Falle, und Wechseln verliert sicher. Umgekehrt gewinnt Wechseln sicher, wenn er nur bei einer Ziege anbietet. Die 2/3 gelten nur für die Standardregeln – deshalb muss man sie im Vortrag genau festlegen." },
  { stufe: "Profi", frage: "Was passiert, wenn der Moderator bei zwei Ziegen immer die Tür mit der kleineren Nummer öffnet?",
    antwort: "Dann hängt die Antwort davon ab, welche Tür er öffnet. Habe ich Tür 1 und er öffnet Tür 3, dann hatte er keine Wahl – das Auto steht hinter Tür 2, Wechseln gewinnt sicher. Öffnet er Tür 2, sind Auto hinter 1 und Auto hinter 3 gleich wahrscheinlich: 1/2. Gemittelt über alle Spiele bleibt es bei 2/3 – Wechseln ist also nie schlechter." },
  { stufe: "Profi", frage: "Woher kommt das Ziegenproblem, und warum war es so umstritten?",
    antwort: "Es geht auf die US-Spielshow „Let’s Make a Deal“ mit dem Moderator Monty Hall zurück, deshalb heißt es dort Monty-Hall-Problem. Berühmt wurde es 1990, als Marilyn vos Savant in einer Zeitschriftenkolumne zum Wechseln riet. Tausende Leser widersprachen, darunter viele Mathematiker – zu Unrecht. Der Streit zeigt, wie stark unsere Intuition bei bedingten Wahrscheinlichkeiten täuscht." },
];
