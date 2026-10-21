/* ============================================================
   Farbwelten der Kurse – „Lack und Goldfolie“. Eine Palette je Kurs,
   gemeinsam genutzt von den Startseiten-Kacheln (funcKursKachel.jsx) und den
   Kursseiten (funcKursKopf.jsx). Reine Daten, keine Importe aus func-Dateien.

   lack      = tief lackierte Fläche (Kachel, Kopf der Kursseite)
   rand      = Folienkante (1 px, als Verlauf)
   glanz     = Lichtkante oben links, schein = Schein unten rechts hinter dem Motiv
   titel/text/akzent = Schrift auf dem Lack
   knopf/knopftext   = Pille „Kurs öffnen“ bzw. „Weiter mit …“
   kopf/linie        = Kopfzeile der Kachel auf dem Handy: Streifen hinter dem Titel, Linie darunter
   koerper           = Fläche unter der Kopfzeile auf dem Handy (optional, sonst lack)
   dunkel    = dunkle Karte „Dein Fortschritt“ auf der Kursseite, ring = Ring darauf
   medaille/medailleText = Nummernplakette eines Moduls, fertig = Plakette, wenn geschafft
   badge/badgeText       = Kapitel-Plakette
   ============================================================ */
import { C } from "./base1.jsx";

export const FOLIE = {
  gold: ["#FFF3C4", "#F2C14E", "#D9A520", "#FFE9A0", "#B58612"],
  silber: ["#FFFFFF", "#E3E7EE", "#9AA3B3", "#F4F6FA", "#7F8898"],
  praegung: ["#2A1F00", "#5A4300", "#8A6A00", "#5A4300", "#2A1F00"],
};
export const GOLD_VERLAUF = "linear-gradient(90deg, #FFE9A0, #F2C14E 55%, #B58612)";
export const GOLD_PILLE = "linear-gradient(150deg, #FFE9A0 0%, #F4CE4A 28%, #EDBB00 55%, #D9A520 78%, #B58612 100%)";

/* Differentialrechnung: Porzellan – Babyblau, Schwarz, Weiß, sehr dunkles Gold */
export const PORZELLAN = {
  lack: `linear-gradient(145deg, ${C.babyblauHell} 0%, ${C.babyblau} 58%, #8FCBEE 100%)`,
  rand: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(90,67,0,0.35) 60%, rgba(90,67,0,0.55))",
  glanz: "rgba(255,255,255,0.75)", schein: "rgba(255,255,255,0.55)", kante: "rgba(255,255,255,0.9)", schatten: "rgba(60,130,190,0.55)",
  kopf: `linear-gradient(145deg, ${C.babyblau} 0%, #8FCBEE 100%)`, linie: `linear-gradient(90deg, ${C.golddunkel}, #8A6A00 60%, ${C.golddunkel})`,
  koerper: `linear-gradient(160deg, ${C.weiss} 0%, ${C.babyblauHell} 100%)`,
  titel: C.nachtschwarz, text: "#1A2230", akzent: C.golddunkel, chip: "rgba(11,12,16,0.07)", chipRand: "rgba(11,12,16,0.14)",
  knopf: C.nachtschwarz, knopftext: C.weiss, knopfschatten: "rgba(11,12,16,0.6)", spur: "rgba(11,12,16,0.14)", fuellung: `linear-gradient(90deg, ${C.golddunkel}, #B98A00)`,
  dunkel: `linear-gradient(150deg, ${C.nachtschwarz} 0%, #16181F 100%)`, dunkelText: C.weiss, ring: C.babyblau, ringSpur: "rgba(255,255,255,0.14)", dunkelKnopf: C.babyblau, dunkelKnopfText: C.nachtschwarz,
  medaille: C.babyblau, medailleText: C.nachtschwarz, fertig: C.golddunkel, fertigText: C.weiss, badge: C.nachtschwarz, badgeText: C.babyblau, linieFertig: C.babyblauTief,
};

/* Vektoren, Geraden und Ebenen: Tiefblau mit warmem Gold */
export const TIEFBLAU = {
  lack: `linear-gradient(150deg, ${C.vkNacht} 0%, ${C.vkTief} 58%, #1A3E96 100%)`,
  rand: "linear-gradient(135deg, rgba(255,233,160,0.85), rgba(242,193,78,0.25) 55%, rgba(168,192,240,0.35))",
  glanz: "rgba(168,192,240,0.22)", schein: "rgba(36,87,197,0.55)", kante: "rgba(255,255,255,0.22)", schatten: "rgba(13,39,102,0.75)",
  kopf: `linear-gradient(150deg, #040C20 0%, ${C.vkNacht} 100%)`, linie: GOLD_VERLAUF,
  titel: C.weiss, text: "rgba(255,255,255,0.84)", akzent: C.vkGold, chip: "rgba(255,255,255,0.1)", chipRand: "rgba(255,255,255,0.22)",
  knopf: GOLD_VERLAUF, knopftext: C.vkNacht, knopfschatten: "rgba(242,193,78,0.6)", spur: "rgba(255,255,255,0.16)", fuellung: GOLD_VERLAUF,
  dunkel: `linear-gradient(150deg, ${C.vkNacht} 0%, ${C.vkTief} 100%)`, dunkelText: C.weiss, ring: C.vkGold, ringSpur: "rgba(255,255,255,0.14)", dunkelKnopf: GOLD_PILLE, dunkelKnopfText: C.vkNacht,
  medaille: C.vkHell, medailleText: C.vkNacht, fertig: C.vkGold, fertigText: C.vkNacht, badge: C.vkNacht, badgeText: C.vkGold, linieFertig: C.vkGold,
};

/* GFS: Lackschwarz mit Gold – die Bühne */
export const LACKSCHWARZ = {
  lack: `linear-gradient(150deg, ${C.nachtschwarz} 0%, #1A1608 58%, #2E2408 100%)`,
  rand: "linear-gradient(135deg, rgba(255,233,160,0.9), rgba(237,187,0,0.3) 55%, rgba(237,187,0,0.55))",
  glanz: "rgba(255,246,214,0.14)", schein: "rgba(237,187,0,0.38)", kante: "rgba(255,255,255,0.2)", schatten: "rgba(11,12,16,0.8)",
  kopf: "linear-gradient(150deg, #050608 0%, #0B0C10 100%)", linie: GOLD_VERLAUF,
  titel: C.weiss, text: "rgba(255,255,255,0.84)", akzent: C.flaggold, chip: "rgba(255,255,255,0.1)", chipRand: "rgba(237,187,0,0.3)",
  knopf: GOLD_VERLAUF, knopftext: C.nachtschwarz, knopfschatten: "rgba(237,187,0,0.6)", spur: "rgba(255,255,255,0.16)", fuellung: GOLD_VERLAUF,
  dunkel: `linear-gradient(150deg, ${C.nachtschwarz} 0%, #1E1A0E 100%)`, dunkelText: C.weiss, ring: C.flaggold, ringSpur: "rgba(255,255,255,0.14)", dunkelKnopf: GOLD_PILLE, dunkelKnopfText: C.nachtschwarz,
  medaille: "#FFF6D6", medailleText: C.nachtschwarz, fertig: C.flaggold, fertigText: C.nachtschwarz, badge: C.nachtschwarz, badgeText: C.flaggold, linieFertig: C.flaggold,
};

/* Mathe mit KI lernen: Nachtblau mit Silber und Gold */
export const NACHTBLAU = {
  lack: "linear-gradient(150deg, #06102A 0%, #0B1E4A 56%, #12306E 100%)",
  rand: "linear-gradient(135deg, rgba(244,246,250,0.9), rgba(199,205,214,0.25) 55%, rgba(237,187,0,0.5))",
  glanz: "rgba(199,205,214,0.2)", schein: "rgba(237,187,0,0.3)", kante: "rgba(255,255,255,0.22)", schatten: "rgba(6,16,42,0.8)",
  kopf: "linear-gradient(150deg, #030919 0%, #06102A 100%)", linie: GOLD_VERLAUF,
  titel: C.weiss, text: "rgba(255,255,255,0.84)", akzent: C.flaggold, chip: "rgba(255,255,255,0.1)", chipRand: "rgba(199,205,214,0.3)",
  knopf: GOLD_VERLAUF, knopftext: "#06102A", knopfschatten: "rgba(237,187,0,0.6)", spur: "rgba(255,255,255,0.16)", fuellung: GOLD_VERLAUF,
  dunkel: "linear-gradient(150deg, #06102A 0%, #0B1E4A 100%)", dunkelText: C.weiss, ring: C.flaggold, ringSpur: "rgba(255,255,255,0.14)", dunkelKnopf: GOLD_PILLE, dunkelKnopfText: "#06102A",
  medaille: "#EEF3FC", medailleText: "#06102A", fertig: C.flaggold, fertigText: "#06102A", badge: "#0B1E4A", badgeText: C.flaggold, linieFertig: C.flaggold,
};

/* Unterstufe (Klasse 5 und 6): Granat – das tiefe Weinrot der Marke (Grana) mit Gold */
export const GRANAT = {
  lack: `linear-gradient(150deg, #3A0019 0%, #7A0032 55%, ${C.gruen} 100%)`,
  rand: "linear-gradient(135deg, rgba(255,233,160,0.9), rgba(242,193,78,0.28) 55%, rgba(255,180,205,0.35))",
  glanz: "rgba(255,210,225,0.2)", schein: "rgba(242,193,78,0.35)", kante: "rgba(255,255,255,0.22)", schatten: "rgba(58,0,25,0.75)",
  kopf: "linear-gradient(150deg, #24000F 0%, #3A0019 100%)", linie: GOLD_VERLAUF,
  titel: C.weiss, text: "rgba(255,255,255,0.86)", akzent: "#FFD66B", chip: "rgba(255,255,255,0.1)", chipRand: "rgba(255,233,160,0.3)",
  knopf: GOLD_VERLAUF, knopftext: "#3A0019", knopfschatten: "rgba(242,193,78,0.55)", spur: "rgba(255,255,255,0.16)", fuellung: GOLD_VERLAUF,
  dunkel: "linear-gradient(150deg, #24000F 0%, #5A0024 100%)", dunkelText: C.weiss, ring: "#FFD66B", ringSpur: "rgba(255,255,255,0.14)", dunkelKnopf: GOLD_PILLE, dunkelKnopfText: "#3A0019",
  medaille: "#FFE9EF", medailleText: "#5A0024", fertig: "#F2C14E", fertigText: "#3A0019", badge: "#5A0024", badgeText: "#FFD66B", linieFertig: "#F2C14E",
};

/* Abi-Zentrum: Goldlack – die ganze Fläche Gold, Schrift und Knöpfe in Nachtschwarz, Prägung in Dunkelgold */
export const GOLDLACK = {
  lack: "linear-gradient(150deg, #FFE9A0 0%, #F4CE4A 26%, #EDBB00 55%, #C99A0C 84%, #9C7400 100%)",
  rand: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(90,67,0,0.4) 55%, rgba(42,31,0,0.65))",
  glanz: "rgba(255,255,255,0.55)", schein: "rgba(255,246,214,0.75)", kante: "rgba(255,255,255,0.75)", schatten: "rgba(154,116,0,0.55)",
  kopf: "linear-gradient(150deg, #F8D23A 0%, #EDBB00 60%, #D9A520 100%)", linie: "linear-gradient(90deg, #2A1F00, #5A4300 50%, #2A1F00)",
  koerper: "linear-gradient(160deg, #FFF8DC 0%, #FFE9A0 100%)",
  titel: C.nachtschwarz, text: "#2A1F00", akzent: C.golddunkel, chip: "rgba(42,31,0,0.08)", chipRand: "rgba(42,31,0,0.22)",
  knopf: C.nachtschwarz, knopftext: C.flaggold, knopfschatten: "rgba(11,12,16,0.55)", spur: "rgba(42,31,0,0.16)", fuellung: "linear-gradient(90deg, #2A1F00, #5A4300)",
  dunkel: `linear-gradient(150deg, ${C.nachtschwarz} 0%, #1E1A0E 100%)`, dunkelText: C.weiss, ring: C.flaggold, ringSpur: "rgba(255,255,255,0.14)", dunkelKnopf: GOLD_PILLE, dunkelKnopfText: C.nachtschwarz,
  medaille: C.nachtschwarz, medailleText: C.flaggold, fertig: C.golddunkel, fertigText: "#FFF6D6", badge: C.nachtschwarz, badgeText: C.flaggold, linieFertig: C.golddunkel,
};
