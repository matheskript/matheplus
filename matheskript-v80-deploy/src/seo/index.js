/* ======================================================================
   SEO/KI für die Werkzeug-Seiten (21.10.2026) – reine Daten und HTML-Bausteine,
   ohne React (Node-testbar, auch vom Build-Skript scripts/werkzeugseiten.mjs genutzt).

   · seoText(id)   Text eines Werkzeugs: handgeschrieben aus texte*.js, sonst aus
                   werkzeuge.js abgeleitet (Name, Zeile, Slogan, Stufe, Bereich).
   · SEO_SEITEN()  alle Werkzeuge mit Pfad (aus pfade.js) – eine öffentliche Seite je Werkzeug.
   · seiteHtml(…)  der statische Inhalt einer Werkzeug-Seite (für Crawler ohne JavaScript;
                   React ersetzt ihn beim Start durch die App).
   · jsonLd(…)     schema.org: LearningResource + FAQPage + Autor.
   In der App zeigt funcWerkzeugInfo.jsx denselben Text aufklappbar unter jedem Werkzeug –
   Google, KI-Crawler und Nutzer sehen also dasselbe.
   ====================================================================== */
import { WERKZEUGE, BEREICHE } from "../werkzeuge.js";
import { pfadFuer } from "../pfade.js";
import { AUTOR, autorLd } from "./autor.js";
import { TEXTE_ANALYSIS } from "./texteAnalysis.js";
import { TEXTE_GRUNDLAGEN } from "./texteGrundlagen.js";
import { TEXTE_GEOMETRIE } from "./texteGeometrie.js";
import { TEXTE_VEKTOREN_STOCHASTIK } from "./texteVektorenStochastik.js";
import { TEXTE_UNTERSTUFE } from "./texteUnterstufe.js";

export { AUTOR };
export const BASIS_URL = "https://mythosmathe.de";

export const SEO_TEXTE = { ...TEXTE_GRUNDLAGEN, ...TEXTE_GEOMETRIE, ...TEXTE_VEKTOREN_STOCHASTIK, ...TEXTE_UNTERSTUFE, ...TEXTE_ANALYSIS };

const STUFE_TEXT = { unter: "Klasse 5 bis 7", mittel: "Mittelstufe (Klasse 7 bis 10)", ober: "Kursstufe und Abitur", beide: "Mittelstufe bis Abitur" };
export const stufeText = (stufe) => STUFE_TEXT[stufe] || "Klasse 5 bis Abitur";

function bereichVon(id) {
  for (const b of BEREICHE) for (const s of b.stationen) if (s.werkzeuge.includes(id)) return b;
  return null;
}
const kuerze = (t, n) => (t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, "") + " …");

/* Text eines Werkzeugs – handgeschrieben oder abgeleitet. null, wenn es das Werkzeug nicht gibt. */
export function seoText(id) {
  const w = WERKZEUGE[id];
  if (!w) return null;
  const hand = SEO_TEXTE[id];
  if (hand) return { id, ...hand, hand: true };
  const b = bereichVon(id);
  const bereich = b ? b.titel || b.name || "" : "";
  const slogan = (w.slogan || w.zeile || "").replace(/\s+$/, "");
  return {
    id, hand: false,
    titel: kuerze(`${w.name}: online üben mit Rechenweg`, 60),
    beschreibung: kuerze(`${w.name} interaktiv üben – ${w.zeile}. Mit Erklärung und sofortiger Rückmeldung, passend zum Bildungsplan, ${stufeText(w.stufe)}.`, 155),
    kurz: slogan,
    text: [
      `${w.name}: ${slogan}${/[.!?]$/.test(slogan) ? "" : "."} Das Werkzeug gehört${bereich ? ` zum Bereich ${bereich}` : ""} von Mythos Mathe und passt zum Stoff für ${stufeText(w.stufe)}.`,
      "Du arbeitest direkt im Browser, ohne Anmeldung: Aufgaben stellen, selbst lösen, sofort Rückmeldung bekommen. Am meisten bringt es, wenn du zuerst auf Papier rechnest und dann mit dem Werkzeug vergleichst.",
    ],
    faq: [],
  };
}

/* Alle Werkzeug-Seiten: { id, pfad } (Pfad ohne führenden Schrägstrich) */
export function SEO_SEITEN() {
  return Object.keys(WERKZEUGE).map((id) => {
    const p = pfadFuer(WERKZEUGE[id].ziel);
    return p ? { id, pfad: p.replace(/^\//, "") } : null;
  }).filter(Boolean);
}

/* ---------- HTML ---------- */
export const esc = (s) => String(s).replace(/[&<>"]/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[z]));

export function jsonLd(t, url) {
  const w = WERKZEUGE[t.id];
  const daten = [{
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: t.titel,
    description: t.beschreibung,
    url,
    inLanguage: "de",
    isAccessibleForFree: true,
    learningResourceType: "Interaktives Übungswerkzeug",
    educationalLevel: stufeText(w && w.stufe),
    educationalAlignment: { "@type": "AlignmentObject", alignmentType: "educationalSubject", targetName: "Mathematik" },
    audience: { "@type": "EducationalAudience", educationalRole: "student" },
    author: autorLd(BASIS_URL),
    isPartOf: { "@type": "WebSite", name: "Mythos Mathe", url: BASIS_URL },
  }];
  if (t.faq && t.faq.length) daten.push({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map((q) => ({ "@type": "Question", name: q.f, acceptedAnswer: { "@type": "Answer", text: q.a } })),
  });
  return JSON.stringify(daten).replace(/</g, "\\u003c");
}

/* Statischer Inhalt für #root (vor dem Start der App) */
export function seiteHtml(t, verwandte = []) {
  const w = WERKZEUGE[t.id];
  return `<main class="seo-seite" style="max-width:720px;margin:0 auto;padding:28px 20px 48px;font-family:Montserrat,system-ui,sans-serif;color:#0E1E4A;line-height:1.6">
<p style="font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8A6A00;margin:0 0 8px">Mythos Mathe · ${esc(stufeText(w && w.stufe))}</p>
<h1 style="font-size:32px;line-height:1.1;margin:0 0 12px">${esc(w ? w.name : t.titel)}</h1>
<p style="font-size:17px;margin:0 0 20px">${esc(t.kurz)}</p>
<section><h2 style="font-size:20px;margin:24px 0 8px">Was kann dieses Werkzeug?</h2>
${t.text.map((a) => `<p>${esc(a)}</p>`).join("\n")}</section>
${t.faq && t.faq.length ? `<section><h2 style="font-size:20px;margin:24px 0 8px">Häufige Fragen</h2>
${t.faq.map((q) => `<h3 style="font-size:16px;margin:16px 0 4px">${esc(q.f)}</h3><p style="margin:0">${esc(q.a)}</p>`).join("\n")}</section>` : ""}
<section><h2 style="font-size:20px;margin:24px 0 8px">Über den Autor</h2>
<p><strong>${esc(AUTOR.name)}</strong>, ${esc(AUTOR.rolle)}: ${esc(AUTOR.kurz)}</p>
<ul>${AUTOR.preise.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></section>
${verwandte.length ? `<nav aria-label="Weitere Werkzeuge"><h2 style="font-size:20px;margin:24px 0 8px">Weitere Werkzeuge</h2><ul>${verwandte.map((v) => `<li><a href="/${esc(v.pfad)}">${esc(v.name)}</a></li>`).join("")}</ul></nav>` : ""}
<p style="margin-top:28px"><a href="/">mythosmathe.de</a> · Mathe-Coaching und Lern-App für Gymnasiasten · <a href="/impressum">Impressum</a> · <a href="/datenschutz">Datenschutz</a></p>
</main>`;
}

/* Werkzeuge derselben Station (für die Linkliste) */
export function verwandteVon(id, seiten = SEO_SEITEN()) {
  const pfade = new Map(seiten.map((s) => [s.id, s.pfad]));
  for (const b of BEREICHE) for (const s of b.stationen) if (s.werkzeuge.includes(id)) {
    const andere = b.stationen.flatMap((x) => x.werkzeuge).filter((x) => x !== id && pfade.has(x) && WERKZEUGE[x]).slice(0, 6);
    return andere.map((x) => ({ id: x, name: WERKZEUGE[x].name, pfad: pfade.get(x) }));
  }
  return [];
}
