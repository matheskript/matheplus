/* ======================================================================
   WORTMARKE MYTHOSMATHE.DE – die eine Quelle für das Logo (Stand 20.10.2026).

   Schrift der Startseiten-Headline „Mathe kann jeder verstehen“:
   Montserrat Black (900; geladen ist 800, das ist dieselbe Darstellung wie
   die Headline), Großbuchstaben, Laufweite −0,02 em (≈ 1 px mehr als die
   Headline, damit MYTHOS nicht gedrückt wirkt). „mythos“ und „.de“ in Weiß
   (auf hellem Grund Nachtblau), „mathe“ im Gold der Headline.

   druck: für Bilder, die zu PDFs werden (Arbeitsblatt, Formelauswahl) –
   dort volles Gold statt Verlauf, weil Verlaufs-Text beim Rastern nicht
   zuverlässig mitkommt. Die Wochenmail (src/wochenmail.js) setzt die Marke
   als HTML-Text mit denselben Werten (LOGO_GEWICHT, LOGO_LAUFWEITE).
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";

export const LOGO_GEWICHT = 900;
export const LOGO_LAUFWEITE = "-0.02em";
export const LOGO_GOLD_VERLAUF = `linear-gradient(180deg, #FFE58A 0%, ${C.flaggold} 55%, #C9931A 100%)`;
const LOGO_GOLD_VERLAUF_HELL = `linear-gradient(180deg, ${C.flaggold} 0%, #D9A400 60%, #B8860B 100%)`;

export function MarkenLogo({ groesse, grund = "dunkel", druck = false, textFarbe, style }) {
  const hell = grund === "hell";
  const gold = druck
    ? { color: C.flaggold }
    /* backgroundImage statt background: die Kurzschreibweise setzt beim Moduswechsel (hell ↔ dunkel) background-clip zurück,
       React setzt den unveränderten Clip nicht neu – dann erscheint „mathe“ als goldener Block */
    : { backgroundImage: hell ? LOGO_GOLD_VERLAUF_HELL : LOGO_GOLD_VERLAUF, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" };
  return (
    <span data-kein-i18n style={{
      fontFamily: "Montserrat, system-ui, sans-serif", fontSize: groesse, fontWeight: LOGO_GEWICHT, letterSpacing: LOGO_LAUFWEITE,
      textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1, color: textFarbe || (hell ? C.seeTief : "#FFFFFF"), ...style,
    }}>
      <span className="marke-mythos">mythos</span><span className="marke-mathe" style={gold}>mathe</span><span className="marke-de">.de</span>
    </span>
  );
}
