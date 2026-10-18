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

/* Ersetzt in einem Text „Mathilda AI“ bzw. „MathildaAI“ durch die Wortmarke, alles andere bleibt unverändert. */
export function mitMathildaAI(text, dunkel) {
  if (typeof text !== "string" || !/Mathilda ?AI/.test(text)) return text;
  const teile = text.split(/Mathilda ?AI/);
  return teile.flatMap((t, i) => (i === 0 ? [t] : [<MathildaName key={i} dunkel={dunkel} />, t]));
}
