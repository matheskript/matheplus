import React from "react";
import { createRoot } from "react-dom/client";
/* Schriften liegen auf unserem eigenen Server (keine Verbindung zu Google Fonts, DSGVO) */
import "@fontsource/montserrat/300.css";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/roboto-condensed/400.css";
import "@fontsource/roboto-condensed/500.css";
import "./index.css";
import App from "./App.jsx";
import { spracheStarten } from "./i18n.js";
import { schutzStarten } from "./chunkSchutz.jsx";
import { EVENT_START_MODUS, startModus } from "./startModus.js";

schutzStarten();
/* Stadion ohne Gold (FCB: Gold → Rot/Weiß/Blau · GER: Marken-Blau → Schwarz): das Modul lädt nur, wenn die
   Ansicht aktiv ist oder später eingeschaltet wird (Startchunk, 23.10.); aktiv beim Start → vor dem ersten Bild */
const stadionAn = () => ["stadion", "ger"].includes(startModus());
let stadionGeladen = null;
const stadionLaden = () => (stadionGeladen ||= import("./stadionGold.js").then((m) => m.stadionGoldStarten(stadionAn, EVENT_START_MODUS)).catch(() => {}));
if (!stadionAn()) window.addEventListener(EVENT_START_MODUS, function einmal() { if (stadionAn()) { window.removeEventListener(EVENT_START_MODUS, einmal); stadionLaden(); } });
Promise.all([spracheStarten(), stadionAn() ? stadionLaden() : null]).finally(() => createRoot(document.getElementById("root")).render(<App />));

/* PWA: Service Worker (Offline + Push), nur im gebauten Stand */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => { /* ohne SW läuft alles weiter */ }); });
}
