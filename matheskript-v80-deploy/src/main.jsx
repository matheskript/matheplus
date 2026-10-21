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
import { stadionGoldStarten } from "./stadionGold.js";
import { EVENT_START_MODUS, startModus } from "./startModus.js";

schutzStarten();
stadionGoldStarten(() => startModus() === "stadion", EVENT_START_MODUS);   /* Stadion: Gold → Rot/Weiß/Blau */
spracheStarten().finally(() => createRoot(document.getElementById("root")).render(<App />));

/* PWA: Service Worker (Offline + Push), nur im gebauten Stand */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => { /* ohne SW läuft alles weiter */ }); });
}
