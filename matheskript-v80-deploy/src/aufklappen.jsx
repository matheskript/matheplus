import React from "react";
import { C } from "./base1.jsx";

/* ======================================================================
   Gemeinsame Regeln für alle aufklappbaren Menüs
   1. Zugeklappt zeigt das Zeichen „+“, aufgeklappt an derselben Stelle „−“.
   2. Beim Aufklappen wird der Titel des Menüs nach oben gescrollt – bei einem
      Untermenü der Titel des übergeordneten Menüs.
   Markierung im Code:  aria-expanded am Kopf-Knopf (bzw. <details>/<summary>)
                        data-aufklapp-inhalt am Container, der beim Aufklappen erscheint
   ====================================================================== */

/* Plus bzw. Minus. art: "schlicht" (nur das Zeichen), "badge" (runde Fläche), "gold" (goldener Knopf unten rechts in einer Kachel) */
export function AufklappZeichen({ auf, art = "schlicht", groesse, abstand = 8, farbe }) {
  const g = groesse || (art === "gold" ? 30 : art === "badge" ? 32 : 18);
  const glyph = art === "gold" ? C.seeTief : art === "badge" ? (auf ? C.weiss : C.see) : (farbe || "currentColor");
  const gz = art === "gold" ? Math.round(g * 0.5) : art === "badge" ? 14 : g;
  const svg = (
    <svg width={gz} height={gz} viewBox="0 0 14 14" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <path d="M2.8 7h8.4" stroke={glyph} strokeWidth={art === "schlicht" ? 1.9 : 2.2} fill="none" strokeLinecap="round" />
      <path d="M7 2.8v8.4" stroke={glyph} strokeWidth={art === "schlicht" ? 1.9 : 2.2} fill="none" strokeLinecap="round"
        style={{ transformBox: "fill-box", transformOrigin: "center", transform: auf ? "scaleY(0)" : "scaleY(1)", opacity: auf ? 0 : 1, transition: "transform .2s ease, opacity .2s ease" }} />
    </svg>
  );
  if (art === "schlicht") return <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: g, height: g, color: farbe || "inherit" }}>{svg}</span>;
  if (art === "badge") {
    return (
      <span aria-hidden="true" style={{ flexShrink: 0, width: g, height: g, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
        background: auf ? C.see : "#EEF2F8", transition: "background .2s ease" }}>{svg}</span>
    );
  }
  return (
    <span aria-hidden="true" style={{ position: "absolute", right: abstand, bottom: abstand, width: g, height: g, borderRadius: 999,
      background: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>{svg}</span>
  );
}

/* ---------- Scrollen ---------- */
const KOPF_PUFFER = 10;

function kopfHoehe() {
  const k = document.querySelector("[data-kopfleiste]");
  return (k ? k.getBoundingClientRect().height : 56) + KOPF_PUFFER;
}

/* Welcher Titel soll oben stehen? Bei einem Untermenü das übergeordnete Menü. */
function titelZiel(kopf) {
  const inhalt = kopf.closest("[data-aufklapp-inhalt]");
  if (inhalt) {
    let k = inhalt.previousElementSibling;
    while (k && !(k.matches("[aria-expanded]") || k.tagName === "SUMMARY")) k = k.previousElementSibling;
    if (k) return k;
  }
  if (kopf.tagName === "SUMMARY") {
    const aussen = kopf.parentElement && kopf.parentElement.parentElement && kopf.parentElement.parentElement.closest("details");
    const s = aussen && aussen.querySelector(":scope > summary");
    if (s) return s;
  }
  return kopf;
}

function scrolleZu(ziel) {
  const leise = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior = leise ? "auto" : "smooth";
  const box = ziel.closest("[data-scroll-box]");
  if (box) {
    box.scrollTo({ top: Math.max(0, box.scrollTop + ziel.getBoundingClientRect().top - box.getBoundingClientRect().top - 6), behavior });
    return;
  }
  window.scrollTo({ top: Math.max(0, ziel.getBoundingClientRect().top + window.scrollY - kopfHoehe()), behavior });
}

function nachOben(kopf) {
  if (!kopf || !kopf.isConnected || kopf.closest("[data-kein-scroll]")) return;
  const ziel = titelZiel(kopf);
  scrolleZu(ziel);
  /* Nachkorrektur: Bereiche mit Animation wachsen noch, der erste Scroll kann zu kurz geraten sein */
  setTimeout(() => {
    if (!ziel.isConnected) return;
    if (ziel.closest("[data-scroll-box]")) return;
    if (Math.abs(ziel.getBoundingClientRect().top - kopfHoehe()) > 6 && window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 2) scrolleZu(ziel);
  }, 420);
}

let gestartet = false;
export function aufklappScrollStarten() {
  if (gestartet || typeof document === "undefined") return;
  gestartet = true;
  document.addEventListener("click", (ev) => {
    const kopf = ev.target && ev.target.closest ? ev.target.closest("[aria-expanded]") : null;
    if (!kopf) return;
    /* React hat den neuen Zustand nach dem Klick sofort gezeichnet; ein Frame später ist das Layout fertig */
    requestAnimationFrame(() => { if (kopf.isConnected && kopf.getAttribute("aria-expanded") === "true") nachOben(kopf); });
  });
  document.addEventListener("toggle", (ev) => {
    const d = ev.target;
    if (d && d.tagName === "DETAILS" && d.open) requestAnimationFrame(() => nachOben(d.querySelector(":scope > summary")));
  }, true);
}

/* Einheitliches Aussehen für <details>/<summary>: Zeichen rechts, + zu − */
export const AUFKLAPP_CSS = `
details > summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px}
details > summary::-webkit-details-marker{display:none}
details > summary::after{content:"";flex:0 0 18px;width:18px;height:18px;background-repeat:no-repeat;background-position:center;background-size:18px 18px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14'%3E%3Cpath d='M2.8 7h8.4M7 2.8v8.4' stroke='%23004D98' stroke-width='1.9' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")}
details[open] > summary::after{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14'%3E%3Cpath d='M2.8 7h8.4' stroke='%23004D98' stroke-width='1.9' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")}
`;

export function AufklappStil() {
  return <style>{AUFKLAPP_CSS}</style>;
}
