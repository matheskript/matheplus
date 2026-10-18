/* ======================================================================
   Schutz vor dem weißen Bildschirm (Logik: chunkFehler.js).
   · lazyLaden(loader)  – Ersatz für React.lazy: scheitert das Nachladen
     wegen einer neuen App-Version, lädt die Seite einmal automatisch neu.
   · ChunkGrenze        – Error-Boundary: fängt jeden Darstellungsfehler
     ab und zeigt statt einer weißen Fläche einen „Neu laden“-Knopf.
   · schutzStarten()    – Vite-Ereignis „vite:preloadError“ (Vorladen).
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { istChunkFehler, neuLadenErlaubt } from "./chunkFehler.js";

const SCHLUESSEL = "mm-chunk-neuladen";

/** Lädt die Seite neu, höchstens einmal je 15 Sekunden. Gibt zurück, ob neu geladen wird. */
export function einmalNeuLaden() {
  try {
    const zuletzt = sessionStorage.getItem(SCHLUESSEL);
    if (!neuLadenErlaubt(Date.now(), zuletzt)) return false;
    sessionStorage.setItem(SCHLUESSEL, String(Date.now()));
  } catch (e) { /* ohne Speicher: trotzdem einmal versuchen */ }
  window.location.reload();
  return true;
}

export function lazyLaden(lader) {
  return React.lazy(() => lader().catch((e) => {
    if (istChunkFehler(e) && einmalNeuLaden()) return new Promise(() => { /* bis zum Neuladen „Wird geladen …“ */ });
    throw e;
  }));
}

export function schutzStarten() {
  // Vite meldet fehlgeschlagenes Vorladen hier; ohne preventDefault würde der Fehler weitergeworfen.
  window.addEventListener("vite:preloadError", (ev) => {
    if (einmalNeuLaden() && ev && ev.preventDefault) ev.preventDefault();
  });
}

export class ChunkGrenze extends React.Component {
  constructor(props) { super(props); this.state = { fehler: null }; }
  static getDerivedStateFromError(fehler) { return { fehler }; }
  componentDidCatch(fehler) {
    if (istChunkFehler(fehler)) einmalNeuLaden();
    else { try { console.error(fehler); } catch (e) { /* egal */ } }
  }
  render() {
    if (!this.state.fehler) return this.props.children;
    const en = englisch();
    return (
      <div role="alert" style={{ maxWidth: 520, margin: "48px auto", padding: "0 24px", textAlign: "center", fontFamily: "Montserrat, sans-serif" }}>
        <p style={{ color: C.seeTief, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          {en ? "This page could not be loaded." : "Diese Seite konnte nicht geladen werden."}
        </p>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>
          {en ? "Most likely the app was just updated. Reloading fixes it." : "Meist wurde die App gerade aktualisiert. Neu laden behebt das."}
        </p>
        <button type="button" onClick={() => window.location.reload()}
          style={{ background: C.see, color: "#fff", border: 0, borderRadius: 999, padding: "12px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          {en ? "Reload" : "Neu laden"}
        </button>
      </div>
    );
  }
}
