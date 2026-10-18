import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { spracheStarten } from "./i18n.js";
import { schutzStarten } from "./chunkSchutz.jsx";

schutzStarten();
spracheStarten().finally(() => createRoot(document.getElementById("root")).render(<App />));

/* PWA: Service Worker (Offline + Push), nur im gebauten Stand */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => { /* ohne SW läuft alles weiter */ }); });
}
