import test from "node:test";
import assert from "node:assert/strict";
import {
  PHI, GRENZE, bruch, bGleich, bAdd, bSub, bMal, bNeg, bWert, bruchTex, bruchText,
  leseAntwort, bewerte, geradePQ, achsenabschnitt, gleichungTex, gleichungText,
  steigungWeg, achsenWeg, probeText, zahlText, fehlerFaelleM, fehlerFaelleC,
  fenster, zuBild, zuMathe, einrasten, linieImFenster, dreieck, dreieckPm, schrittFuer,
  zufallPQ, zufallPm, tasteAnwenden,
} from "../src/geradenLogik.js";

const nah = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
/* Regel A5: nichts Unvereinfachtes am Ende einer Schreibweise */
const A5_VERBOTEN = /\+ −|− −|\+ \+|(^|[^\d.])1x|\^\{?1\}?(?![\d])|· 1(?![\d])|\+ 0(?![\d,.])|− 0(?![\d,.])/;

test("Brüche: kürzen, Vorzeichen im Zähler, Rechnen, ungültige Eingaben", () => {
  assert.deepEqual(bruch(6, 4), { n: 3, d: 2 });
  assert.deepEqual(bruch(6, -4), { n: -3, d: 2 });
  assert.deepEqual(bruch(0, -5), { n: 0, d: 1 });
  assert.equal(bruch(1, 0), null);
  assert.equal(bruch(1.5, 2), null);
  assert.ok(bGleich(bAdd(bruch(1, 2), bruch(1, 3)), bruch(5, 6)));
  assert.ok(bGleich(bSub(bruch(1, 2), bruch(1, 2)), bruch(0)));
  assert.ok(bGleich(bMal(bruch(-2, 3), bruch(3, 4)), bruch(-1, 2)));
  assert.ok(bGleich(bNeg(bruch(3, 2)), bruch(-3, 2)));
  assert.ok(nah(bWert(bruch(-3, 2)), -1.5));
  assert.equal(bruchTex(bruch(-3, 2)), "−\\frac{3}{2}");
  assert.equal(bruchTex(bruch(4, 2)), "2");
  assert.equal(bruchText(bruch(-3, 2)), "−3/2");
});

test("Eingabe lesen: ganze Zahlen, Brüche, Unfertiges, Division durch null", () => {
  assert.deepEqual(leseAntwort("-3/2").wert, { n: -3, d: 2 });
  assert.ok(leseAntwort("−3/2").kanonisch);
  assert.ok(!leseAntwort("4/2").kanonisch, "4/2 ist noch nicht gekürzt");
  assert.ok(!leseAntwort("4/1").kanonisch, "4/1 → einfach 4");
  assert.ok(leseAntwort("5").kanonisch);
  assert.ok(!leseAntwort("6/4").kanonisch);
  for (const kaputt of ["", "-", "3/", "/2", "3/0", "a", "1,5", "--2", "3//2"]) assert.equal(leseAntwort(kaputt), null, kaputt);
});

test("Zahlenfeld: Ziffern, Vorzeichen, Löschen, Bruchstrich, keine führende Null", () => {
  const t = (text, tasten, o) => tasten.reduce((a, k) => tasteAnwenden(a, k, o), text);
  assert.equal(t("", ["5"]), "5");
  assert.equal(t("", ["±", "5"]), "-5");
  assert.equal(t("-5", ["±"]), "5");
  assert.equal(t("5", ["⌫"]), "");
  assert.equal(t("", ["1", "2", "3"], { maxZiffern: 2 }), "12", "höchstens zwei Ziffern");
  assert.equal(t("", ["1", "2", "3"], { maxZiffern: 3 }), "123");
  assert.equal(t("0", ["7"]), "7");
  assert.equal(t("-0", ["7"]), "-7");
  assert.equal(t("", ["0", "0"]), "0");
  assert.equal(t("", ["/"], { bruch: true }), "", "Bruchstrich erst nach einer Ziffer");
  assert.equal(t("", ["3", "/", "2"], { bruch: true }), "3/2");
  assert.equal(t("", ["3", "/", "/", "2"], { bruch: true }), "3/2", "nur ein Bruchstrich");
  assert.equal(t("", ["3", "/", "2"], { bruch: false }), "32", "ohne Bruchmodus kein Strich");
  assert.equal(t("", ["±", "1", "2", "/", "1", "5"], { bruch: true, maxZiffern: 2 }), "-12/15");
  assert.equal(t("3/", ["⌫", "⌫"], { bruch: true }), "");
  assert.equal(t("7", ["x"]), "7");
});

test("Bewerten: richtig, ungekürzt, typische Fehler, leer, unfertig", () => {
  const soll = bruch(3, 2);
  assert.equal(bewerte("3/2", soll).art, "richtig");
  assert.equal(bewerte("6/4", soll).art, "ungekuerzt");
  assert.match(bewerte("6/4", soll).hinweis, /kürze/);
  assert.equal(bewerte("", soll).art, "leer");
  assert.equal(bewerte("3/", soll).art, "unfertig");
  assert.equal(bewerte("-3/2", soll, [{ wert: bruch(-3, 2), id: "v", text: "Vorzeichen" }]).hinweis, "Vorzeichen");
  assert.equal(bewerte("7", soll).art, "falsch");
  assert.equal(bewerte("2", bruch(2)).art, "richtig");
  assert.equal(bewerte("4/2", bruch(2)).art, "ungekuerzt");
  assert.equal(bewerte("0", bruch(0)).art, "richtig");
});

test("Gerade aus zwei Punkten: Rechnung stimmt für alle Gitterpunkte −8…8", () => {
  let n = 0;
  for (let xp = -8; xp <= 8; xp += 2) for (let yp = -8; yp <= 8; yp += 3) for (let xq = -8; xq <= 8; xq++) for (let yq = -8; yq <= 8; yq += 2) {
    const g = geradePQ([xp, yp], [xq, yq]);
    if (xp === xq) { assert.ok(g.senkrecht); assert.equal(g.gleichePunkte, yp === yq); continue; }
    n++;
    assert.ok(!g.senkrecht);
    // Gerade geht durch beide Punkte
    assert.ok(nah(bWert(g.m) * xp + bWert(g.c), yp, 1e-9), `P ${xp},${yp} ${xq},${yq}`);
    assert.ok(nah(bWert(g.m) * xq + bWert(g.c), yq, 1e-9), `Q ${xp},${yp} ${xq},${yq}`);
    // Steigung gleich Höhe durch Breite, vollständig gekürzt
    assert.ok(nah(bWert(g.m), (yq - yp) / (xq - xp)));
    assert.ok(g.m.d >= 1 && Math.abs(g.m.n) % g.m.d !== 0 || g.m.d === 1);
    assert.ok(bGleich(g.c, achsenabschnitt([xp, yp], g.m)));
  }
  assert.ok(n > 2000);
});

test("Schreibweise y = m·x + c (Regel A5)", () => {
  const f = (mn, md, cn, cd = 1) => gleichungTex(bruch(mn, md), bruch(cn, cd));
  assert.equal(f(2, 1, 1), "y = 2x + 1");
  assert.equal(f(1, 1, -3), "y = x − 3");
  assert.equal(f(-1, 1, 4), "y = −x + 4");
  assert.equal(f(-1, 1, 0), "y = −x");
  assert.equal(f(3, 1, 0), "y = 3x");
  assert.equal(f(0, 1, 5), "y = 5");
  assert.equal(f(0, 1, -5), "y = −5");
  assert.equal(f(0, 1, 0), "y = 0");
  assert.equal(f(1, 2, 3), "y = \\frac{1}{2}x + 3");
  assert.equal(f(-3, 2, -1, 2), "y = −\\frac{3}{2}x − \\frac{1}{2}");
  assert.equal(f(2, 1, 1, 2), "y = 2x + \\frac{1}{2}");
  assert.equal(gleichungText(bruch(1, 2), bruch(-3)), "y = (1/2)x − 3");
  assert.equal(gleichungText(bruch(-1), bruch(0)), "y = −x");
  // über alle Kombinationen nie ein unvereinfachter Rest
  for (let mn = -6; mn <= 6; mn++) for (const md of [1, 2, 3, 4]) for (let cn = -6; cn <= 6; cn++) for (const cd of [1, 2, 3]) {
    const s = gleichungTex(bruch(mn, md), bruch(cn, cd));
    assert.ok(!A5_VERBOTEN.test(s), s);
  }
});

test("Rechenwege enden vereinfacht, negative Werte stehen in Klammern, kein „− −“", () => {
  assert.equal(steigungWeg([2, 3], [5, 9]), "m = \\frac{y_Q − y_P}{x_Q − x_P} = \\frac{9 − 3}{5 − 2} = \\frac{6}{3} = 2");
  assert.equal(steigungWeg([1, 2], [3, 5]), "m = \\frac{y_Q − y_P}{x_Q − x_P} = \\frac{5 − 2}{3 − 1} = \\frac{3}{2}");
  assert.equal(steigungWeg([1, 1], [2, 4]), "m = \\frac{y_Q − y_P}{x_Q − x_P} = \\frac{4 − 1}{2 − 1} = 3");
  assert.equal(steigungWeg([-2, -5], [1, 4]), "m = \\frac{y_Q − y_P}{x_Q − x_P} = \\frac{4 − (−5)}{1 − (−2)} = \\frac{9}{3} = 3");
  assert.equal(steigungWeg([3, 1], [1, 5]), "m = \\frac{y_Q − y_P}{x_Q − x_P} = \\frac{5 − 1}{1 − 3} = \\frac{4}{−2} = −2");
  assert.equal(achsenWeg([2, 3], bruch(2)), "c = y_P − m · x_P = 3 − 2 · 2 = 3 − 4 = −1");
  assert.equal(achsenWeg([2, 3], bruch(1, 2)), "c = y_P − m · x_P = 3 − \\frac{1}{2} · 2 = 3 − 1 = 2");
  assert.equal(achsenWeg([-2, 3], bruch(-1)), "c = y_P − m · x_P = 3 − (−1) · (−2) = 3 − 2 = 1");
  assert.equal(achsenWeg([0, 4], bruch(3)), "c = y_P − m · x_P = 4 − 3 · 0 = 4");
  for (let xp = -6; xp <= 6; xp += 3) for (let yp = -6; yp <= 6; yp += 3) for (let xq = -6; xq <= 6; xq++) for (let yq = -6; yq <= 6; yq += 2) {
    if (xp === xq) continue;
    const g = geradePQ([xp, yp], [xq, yq]);
    for (const s of [steigungWeg([xp, yp], [xq, yq]), achsenWeg([xp, yp], g.m)]) {
      assert.ok(!/− −|\+ −/.test(s), s);
    }
    assert.ok(steigungWeg([xp, yp], [xq, yq]).endsWith(`= ${bruchTex(g.m)}`), "endet mit dem gekürzten Wert");
    assert.ok(achsenWeg([xp, yp], g.m).endsWith(`= ${bruchTex(g.c)}`));
  }
});

test("Probe für Basics", () => {
  assert.equal(probeText(2, -3, 3).text, "y = 2 · 3 − 3 = 3");
  assert.equal(probeText(-1, 0, 2).text, "y = (−1) · 2 = −2");
  assert.equal(probeText(0.5, 1, -2).text, "y = 0,5 · (−2) + 1 = 0");
  assert.equal(probeText(2, -1, 3).y, 5);
  assert.equal(zahlText(-0), "0");
  assert.equal(zahlText(-1.5), "−1,5");
});

test("Typische Fehler werden erkannt – und die Lösung ist nie ein „Fehler“", () => {
  const P = [2, 3], Q = [5, 9];
  const m = geradePQ(P, Q).m;
  const fm = fehlerFaelleM(P, Q);
  assert.equal(bewerte("-2", m, fm).fehler, "vorzeichen");
  assert.equal(bewerte("1/2", m, fm).fehler, "kehrwert");
  assert.equal(bewerte("6", m, fm).fehler, "nurDy");
  assert.equal(bewerte("3", m, fm).fehler, "nurDx");
  const c = achsenabschnitt(P, m);
  const fc = fehlerFaelleC(P, m);
  assert.equal(bewerte("3", c, fc).fehler, "ohneM");
  assert.equal(bewerte("7", c, fc).fehler, "plus");
  assert.equal(bewerte("1", c, fc).fehler, "umgekehrt");
  assert.deepEqual(fehlerFaelleM([1, 1], [1, 5]), []);
});

test("Bildausschnitt: goldener Schnitt, gleiche Einheit, Ursprung und Punkte sichtbar", () => {
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  for (let i = 0; i < 3000; i++) {
    const pts = [[Math.round(rnd() * 40 - 20), Math.round(rnd() * 40 - 20)], [Math.round(rnd() * 40 - 20), Math.round(rnd() * 40 - 20)]];
    const f = fenster(pts);
    assert.ok(nah((f.x1 - f.x0) / (f.y1 - f.y0), PHI, 1e-9), "Breite : Höhe = φ");
    for (const [x, y] of [[0, 0], ...pts]) {
      assert.ok(x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1, `(${x}|${y}) liegt im Fenster`);
    }
    assert.ok(f.h >= 8 - 1e-9);
    assert.ok([1, 2, 5, 10, 20, 50, 100].includes(f.schritt));
  }
  const klein = fenster([[1, 1]]);
  assert.ok(nah(klein.h, 8) && klein.schritt === 1);
});

test("Koordinaten: Bild ↔ Mathe, Einrasten, Dreieck", () => {
  const f = fenster([[3, 4], [-2, 1]]);
  const W = 360, H = W / PHI;
  for (const p of [[0, 0], [3, 4], [-2, 1], [1.5, -0.5]]) {
    const [bx, by] = zuBild(p, f, W, H);
    const [mx, my] = zuMathe(bx, by, f, W, H);
    assert.ok(nah(mx, p[0], 1e-9) && nah(my, p[1], 1e-9));
  }
  assert.deepEqual(einrasten([2.6, -1.4], f), [3, -1]);
  const g = { x0: -3.4, x1: 3.4, y0: -2.1, y1: 2.1 };
  assert.deepEqual(einrasten([99, -99], g), [3, -2], "bleibt im Fenster");
  assert.deepEqual(einrasten([99, 99], { x0: -50, x1: 50, y0: -50, y1: 50 }), [GRENZE, GRENZE], "bleibt im erlaubten Bereich");
  assert.deepEqual(dreieck([1, 2], [4, 8]), { R: [4, 2], dx: 3, dy: 6 });
  assert.deepEqual(dreieckPm([1, 2], bruch(3, 2)), { R: [3, 2], Q: [3, 5], dx: 2, dy: 3 });
  assert.deepEqual(dreieckPm([1, 2], bruch(-2)), { R: [2, 2], Q: [2, 0], dx: 1, dy: -2 });
  assert.equal(schrittFuer(8), 1);
  assert.equal(schrittFuer(12), 2);
  assert.equal(schrittFuer(30), 5);
});

test("Gerade im Fenster zuschneiden", () => {
  const f = { x0: -8, x1: 8, y0: -5, y1: 5 };
  const s = linieImFenster(1, 0, f);
  assert.ok(s && nah(s[0][0], -5) && nah(s[1][0], 5), "y = x trifft oben/unten");
  const w = linieImFenster(0, 3, f);
  assert.ok(w && nah(w[0][0], -8) && nah(w[1][0], 8) && nah(w[0][1], 3));
  assert.equal(linieImFenster(0, 9, f), null, "liegt ganz außerhalb");
  for (const [m, c] of [[2, -3], [-0.5, 1], [4, 4], [-3, -4]]) {
    const e = linieImFenster(m, c, f);
    assert.ok(e);
    for (const [x, y] of e) {
      assert.ok(nah(y, m * x + c, 1e-9));
      assert.ok(x >= f.x0 - 1e-9 && x <= f.x1 + 1e-9 && y >= f.y0 - 1e-9 && y <= f.y1 + 1e-9);
    }
  }
});

test("Zufallsaufgaben P & Q: gültig, im Bild, nie senkrecht, auch Brüche mit Kürzen", () => {
  let ganz = 0, bruchM = 0, kuerzen = 0, ganzC = 0;
  for (let i = 0; i < 6000; i++) {
    const { P, Q } = zufallPQ();
    assert.ok(Math.abs(P[0]) <= 8 && Math.abs(P[1]) <= 8 && Math.abs(Q[0]) <= 8 && Math.abs(Q[1]) <= 8);
    assert.ok(P[0] !== Q[0], "keine senkrechte Gerade");
    const g = geradePQ(P, Q);
    assert.ok(!g.senkrecht);
    g.m.d === 1 ? ganz++ : bruchM++;
    if (g.c.d === 1) ganzC++;
    if (ggTrivial(g.dy, g.dx) > 1 && g.m.d > 1) kuerzen++;
  }
  assert.ok(ganz > 1500 && bruchM > 1500, `ganz ${ganz}, Bruch ${bruchM}`);
  assert.ok(kuerzen > 200, `Kürzen kommt vor (${kuerzen})`);
  assert.ok(ganzC > 3500, `meist ganzzahliges c (${ganzC})`);
  // deterministisch mit eigenem Zufall
  const a = zufallPQ(() => 0.37), b = zufallPQ(() => 0.37);
  assert.deepEqual(a, b);
});
function ggTrivial(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }

test("Zufallsaufgaben P & m: gültig, c bleibt handlich", () => {
  let waag = 0, bruchM = 0, ganzC = 0;
  for (let i = 0; i < 6000; i++) {
    const { P, m } = zufallPm();
    assert.ok(Math.abs(P[0]) <= 8 && Math.abs(P[1]) <= 8);
    assert.ok(m.d >= 1 && Math.abs(m.n) <= 5);
    const c = achsenabschnitt(P, m);
    assert.ok(Math.abs(bWert(c)) <= 12);
    if (m.n === 0) waag++;
    if (m.d > 1) bruchM++;
    if (c.d === 1) ganzC++;
  }
  assert.ok(waag > 0 && waag < 700);
  assert.ok(bruchM > 1500);
  assert.ok(ganzC > 4500, `meist ganzzahliges c (${ganzC})`);
});
