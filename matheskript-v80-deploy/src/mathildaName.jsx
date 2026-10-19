import React from "react";

/* Wortmarke „MathildaAI“ (fester Teil des Corporate Designs):
   Mathilda mit großem M und sonst klein, direkt danach AI in Großbuchstaben und Gold – nie „MATHILDAAI“, nie mit Leerzeichen.
   dunkel = Hintergrund ist dunkel (Mathilda weiß, helles Gold); sonst erbt Mathilda die Textfarbe (dunkleres Gold).
   Nie per text-transform: uppercase darüberlegen – Wächter: tests/markenname.test.mjs. */
export function MathildaName({ dunkel }) {
  return (
    <span data-kein-i18n style={{ textTransform: "none" }}>
      <span style={dunkel ? { color: "#FFFFFF" } : undefined}>Mathilda</span>
      <span style={{ color: dunkel ? "#EDBB00" : "#B98A00" }}>AI</span>
    </span>
  );
}

/* Logo-Schriftzug für den Mathilda-Knopf im Kreislauf (nur dort, auf dunklem Grund): nur „Mathilda“, weiß und klein
   geschrieben (echtes kleines m), das erste a als großes goldenes A, das i als goldenes I: m A t h I l d a.
   Die normale Wortmarke oben bleibt überall sonst unverändert. */
export function MathildaKnopfSchrift() {
  return (
    <span data-kein-i18n style={{ textTransform: "none", whiteSpace: "nowrap" }}>
      <span style={{ color: "#FFFFFF" }}>m</span>
      <span style={{ fontSize: "1.55em", lineHeight: 0, color: "#EDBB00" }}>A</span>
      <span style={{ color: "#FFFFFF" }}>th</span>
      <span style={{ color: "#EDBB00" }}>I</span>
      <span style={{ color: "#FFFFFF" }}>lda</span>
    </span>
  );
}

/* Ersetzt in einem Text „Mathilda AI“ bzw. „MathildaAI“ durch die Wortmarke, alles andere bleibt unverändert. */
export function mitMathildaAI(text, dunkel) {
  if (typeof text !== "string" || !/Mathilda ?AI/.test(text)) return text;
  const teile = text.split(/Mathilda ?AI/);
  return teile.flatMap((t, i) => (i === 0 ? [t] : [<MathildaName key={i} dunkel={dunkel} />, t]));
}
