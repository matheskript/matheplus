import React from "react";

/* Wortmarke „MathildaAI“: Mathilda normal geschrieben, direkt danach AI in Großbuchstaben und Gold.
   dunkel = Hintergrund ist dunkel (Mathilda weiß, helles Gold); sonst erbt Mathilda die Textfarbe (dunkleres Gold). */
export function MathildaName({ dunkel }) {
  return (
    <span data-kein-i18n>
      <span style={dunkel ? { color: "#FFFFFF" } : undefined}>Mathilda</span>
      <span style={{ color: dunkel ? "#EDBB00" : "#B98A00" }}>AI</span>
    </span>
  );
}

/* Ersetzt in einem Text „Mathilda AI“ durch die Wortmarke, alles andere bleibt unverändert. */
export function mitMathildaAI(text, dunkel) {
  if (typeof text !== "string" || !text.includes("Mathilda AI")) return text;
  const teile = text.split("Mathilda AI");
  return teile.flatMap((t, i) => (i === 0 ? [t] : [<MathildaName key={i} dunkel={dunkel} />, t]));
}
