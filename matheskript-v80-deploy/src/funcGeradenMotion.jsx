/* ============================================================
   Animation „Gerade durch zwei Punkte“ als Karte – für den Geradentrainer (g_zweipunkte, Reiter „Zwei Punkte“)
   und das Vektor-Werkzeug „Zwei Punkte – eine Gerade“ (v_zweipunkte). Beide laden diese Datei lazy, weil der
   Abspieler alle Szenen mitbringt. Texte (titel, frage, kern) in src/motion/medienGeraden.js.
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";
import { Motion, SZENEN } from "./funcUnterstufeMotion.jsx";
import { zeitplan } from "./motion/kern.jsx";
import { GERADEN_MOTION } from "./motion/medienGeraden.js";

export function GeradenMotion({ szene, stil }) {
  const S = SZENEN[szene], tx = GERADEN_MOTION[szene];
  if (!S || !tx) return null;
  const sekunden = Math.round(zeitplan(S.ablauf({})).dauer / 1000);
  return (
    <div data-geraden-motion={szene} style={{ backgroundColor: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 18, padding: "10px 10px 2px", ...stil }}>
      <p style={{ margin: "0 4px 6px", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A6A00" }}>Animation · {sekunden} Sekunden</p>
      <Motion szene={szene} titel={tx.titel} thema="vektoren" frage={tx.frage} kern={tx.kern} />
    </div>
  );
}
