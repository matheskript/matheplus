/* ======================================================================
   SEO/KI für die Werkzeug- und Hub-Seiten (21.10.2026) – reine Daten und HTML-Bausteine,
   ohne React (Node-testbar, auch vom Build-Skript scripts/werkzeugseiten.mjs genutzt).

   · seoText(id)   Text eines Werkzeugs: handgeschrieben aus texte*.js, sonst aus
                   werkzeuge.js abgeleitet (Name, Zeile, Slogan, Stufe, Bereich).
   · entitaet(t)   der erste Satz jeder Seite: „<Werkzeug> von Mythos Mathe ist ein kostenloses
                   Online-Werkzeug zum …“ – der Satz, den KI-Assistenten und Google zitieren.
   · steckbrief(t) Faktenblock (Was · Für wen · Kostet · Lehrplan · Modi) – für Nutzer und Crawler.
   · SEO_SEITEN()  alle Werkzeuge mit Pfad (aus pfade.js) – eine öffentliche Seite je Werkzeug.
   · HUB_SEITEN()  Startseite, Trainingszentrum, Vision, Analysis, Vektoren, Stochastik (hubs.js).
   · seiteHtml(…)  der statische Inhalt einer Werkzeug-Seite (für Crawler ohne JavaScript;
                   React ersetzt ihn beim Start durch die App).
   · hubHtml(…)    der statische Inhalt einer Hub-Seite mit der Werkzeugliste des Bereichs.
   · jsonLd(…)     schema.org: LearningResource (+ teaches, dateModified, typicalAgeRange) + FAQPage +
                   BreadcrumbList; Hubs: WebSite/Organization + CollectionPage + FAQPage.
   In der App zeigt funcWerkzeugInfo.jsx denselben Text aufklappbar unter jedem Werkzeug –
   Google, KI-Crawler und Nutzer sehen also dasselbe.
   ====================================================================== */
import { WERKZEUGE, BEREICHE, ETIKETTEN } from "../werkzeuge.js";
import { pfadFuer } from "../pfade.js";
import { AUTOR, autorLd } from "./autor.js";
import { HUBS } from "./hubs.js";
import { TEXTE_ANALYSIS } from "./texteAnalysis.js";
import { TEXTE_GRUNDLAGEN } from "./texteGrundlagen.js";
import { TEXTE_GEOMETRIE } from "./texteGeometrie.js";
import { TEXTE_VEKTOREN_STOCHASTIK } from "./texteVektorenStochastik.js";
import { TEXTE_UNTERSTUFE } from "./texteUnterstufe.js";

export { AUTOR, HUBS };
export const BASIS_URL = "https://mythosmathe.de";
export const MARKE = "Mythos Mathe";

export const SEO_TEXTE = { ...TEXTE_GRUNDLAGEN, ...TEXTE_GEOMETRIE, ...TEXTE_VEKTOREN_STOCHASTIK, ...TEXTE_UNTERSTUFE, ...TEXTE_ANALYSIS };

const STUFE_TEXT = { unter: "Klasse 5 bis 7", mittel: "Mittelstufe (Klasse 7 bis 10)", ober: "Kursstufe und Abitur", beide: "Mittelstufe bis Abitur" };
export const stufeText = (stufe) => STUFE_TEXT[stufe] || "Klasse 5 bis Abitur";
const ALTER = { unter: "10-13", mittel: "12-16", ober: "16-19", beide: "12-19" };
export const altersSpanne = (stufe) => ALTER[stufe] || "10-19";
/* Was ein Werkzeug je Etikett tut – fürs Entitäts-Satzmuster */
const ETIKETT_ZWECK = { trainieren: "Üben mit sofortiger Rückmeldung", rechnen: "Rechnen mit vollständigem Rechenweg", entdecken: "Verstehen mit Reglern und Live-Bild" };

export function bereichVon(id) {
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

/* Entitätssatz: steht als erster Absatz auf der Seite und im Aufklapper */
export function entitaet(t) {
  const w = WERKZEUGE[t.id];
  if (!w) return "";
  const zweck = ETIKETT_ZWECK[w.etikett] || ETIKETT_ZWECK.trainieren;
  return `${w.name} von ${MARKE} ist ein kostenloses Online-Werkzeug zum ${zweck} – für Schüler am Gymnasium, ${stufeText(w.stufe)}: ${t.kurz.replace(/\.$/, "")}.`;
}

/* Steckbrief: Faktenblock als Liste [Bezeichnung, Wert] */
export function steckbrief(t) {
  const w = WERKZEUGE[t.id];
  if (!w) return [];
  const b = bereichVon(t.id);
  const modi = w.modi ? w.modi.map((m) => m.name).join(" · ") : ETIKETTEN[w.etikett] ? ETIKETTEN[w.etikett].name : "";
  return [
    ["Was", w.zeile],
    ["Für wen", `Gymnasium, ${stufeText(w.stufe)}`],
    ["Bereich", b ? b.titel : "Mathematik"],
    ["Modus", modi],
    ["Kosten", "kostenlos, ohne Anmeldung, im Browser"],
    ["Lehrplan", "Bildungsplan Baden-Württemberg (G8/G9); die Mathematik gilt in allen Bundesländern"],
  ].filter(([, v]) => v);
}

/* Alle Werkzeug-Seiten: { id, pfad } (Pfad ohne führenden Schrägstrich) */
export function SEO_SEITEN() {
  return Object.keys(WERKZEUGE).map((id) => {
    const p = pfadFuer(WERKZEUGE[id].ziel);
    return p ? { id, pfad: p.replace(/^\//, "") } : null;
  }).filter(Boolean);
}

/* Alle Hub-Seiten: { id, pfad } – die Startseite hat den Pfad "" */
export const HUB_SEITEN = () => Object.keys(HUBS).map((id) => ({ id, pfad: HUBS[id].pfad }));

/* ---------- HTML ---------- */
export const esc = (s) => String(s).replace(/[&<>"]/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[z]));

const brotkrumen = (teile) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: teile.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: t.url })),
});

/* „teaches“: die Stichworte aus der Zeile des Werkzeugs (z. B. „Produktregel“, „Kettenregel“) */
const lehrt = (w) => String(w.zeile || "").split(/,|·|–/).map((s) => s.trim()).filter((s) => s.length > 2 && s.length < 60).slice(0, 6);

export function jsonLd(t, url, { datum = null } = {}) {
  const w = WERKZEUGE[t.id];
  const b = bereichVon(t.id);
  const hubPfad = b && HUBS[b.id] ? `${BASIS_URL}/${HUBS[b.id].pfad}` : `${BASIS_URL}/trainingszentrum`;
  const daten = [{
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: t.titel,
    headline: w ? w.name : t.titel,
    description: t.beschreibung,
    url,
    inLanguage: "de",
    isAccessibleForFree: true,
    learningResourceType: "Interaktives Übungswerkzeug",
    educationalLevel: stufeText(w && w.stufe),
    typicalAgeRange: altersSpanne(w && w.stufe),
    teaches: w ? lehrt(w) : [],
    educationalAlignment: { "@type": "AlignmentObject", alignmentType: "educationalSubject", targetName: "Mathematik" },
    audience: { "@type": "EducationalAudience", educationalRole: "student" },
    author: autorLd(BASIS_URL),
    publisher: { "@type": "Organization", name: MARKE, url: BASIS_URL },
    isPartOf: { "@type": "WebSite", name: MARKE, url: BASIS_URL },
    ...(datum ? { dateModified: datum } : {}),
  }];
  if (t.faq && t.faq.length) daten.push({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map((q) => ({ "@type": "Question", name: q.f, acceptedAnswer: { "@type": "Answer", text: q.a } })),
  });
  daten.push(brotkrumen([
    { name: MARKE, url: `${BASIS_URL}/` },
    { name: b ? b.titel : "Werkzeuge", url: hubPfad },
    { name: w ? w.name : t.titel, url },
  ]));
  return JSON.stringify(daten).replace(/</g, "\\u003c");
}

/* JSON-LD einer Hub-Seite: Startseite = WebSite + Organization + Person, sonst CollectionPage; dazu FAQ */
export function hubJsonLd(h, url, werkzeuge = [], { datum = null } = {}) {
  const daten = [];
  if (h.ansicht === "start") {
    daten.push({ "@context": "https://schema.org", "@type": "WebSite", name: MARKE, url: BASIS_URL, inLanguage: "de", description: h.beschreibung,
      publisher: { "@type": "Organization", name: MARKE, url: BASIS_URL, founder: autorLd(BASIS_URL),
        address: { "@type": "PostalAddress", addressLocality: "Konstanz", addressCountry: "DE" } } });
  } else {
    daten.push({ "@context": "https://schema.org", "@type": "CollectionPage", name: h.titel, description: h.beschreibung, url, inLanguage: "de",
      isPartOf: { "@type": "WebSite", name: MARKE, url: BASIS_URL }, author: autorLd(BASIS_URL), ...(datum ? { dateModified: datum } : {}),
      hasPart: werkzeuge.map((v) => ({ "@type": "LearningResource", name: v.name, url: `${BASIS_URL}/${v.pfad}` })) });
  }
  if (h.faq && h.faq.length) daten.push({ "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: h.faq.map((q) => ({ "@type": "Question", name: q.f, acceptedAnswer: { "@type": "Answer", text: q.a } })) });
  if (h.ansicht !== "start") daten.push(brotkrumen([{ name: MARKE, url: `${BASIS_URL}/` }, { name: h.h1, url }]));
  return JSON.stringify(daten).replace(/</g, "\\u003c");
}

const STIL = `max-width:720px;margin:0 auto;padding:28px 20px 48px;font-family:Montserrat,system-ui,sans-serif;color:#0E1E4A;line-height:1.6`;
const H2 = `font-size:20px;margin:24px 0 8px`;
/* Beispiel mit Lösungsweg (Top-Werkzeuge, Trainingstools H): Aufgabe, nummerierte Schritte, Ergebnis – derselbe Block in der App (funcWerkzeugInfo) */
export const beispielText = (t) => t.beispiel ? [t.beispiel.aufgabe, ...t.beispiel.schritte, t.beispiel.ergebnis] : [];
const beispielHtml = (t) => t.beispiel ? `<section><h2 style="${H2}">Beispiel mit Lösungsweg</h2>
<p><strong>Aufgabe:</strong> ${esc(t.beispiel.aufgabe)}</p>
<ol style="list-style:decimal;padding-left:22px">${t.beispiel.schritte.map((z) => `<li style="margin:0 0 6px">${esc(z)}</li>`).join("")}</ol>
<p><strong>Ergebnis:</strong> ${esc(t.beispiel.ergebnis)}</p></section>
` : "";
const autorZeile = () => `<p style="margin-top:28px;font-size:14px;color:#4B5A7A"><strong>${esc(AUTOR.name)}</strong>, ${esc(AUTOR.rolle)} – ${esc(AUTOR.kurz)} <a href="/vision">Mehr über Mythos Mathe</a></p>`;
const fuss = () => `<p style="margin-top:20px"><a href="/">mythosmathe.de</a> · Mathe-Coaching und Lern-App für Gymnasiasten · <a href="/trainingszentrum">Alle Werkzeuge</a> · <a href="/impressum">Impressum</a> · <a href="/datenschutz">Datenschutz</a></p>`;

/* Statischer Inhalt für #root (vor dem Start der App) */
export function seiteHtml(t, verwandte = [], { hub = null } = {}) {
  const w = WERKZEUGE[t.id];
  const b = bereichVon(t.id);
  const hubLink = hub || (b && HUBS[b.id] ? { name: b.titel, pfad: HUBS[b.id].pfad } : { name: "Alle Werkzeuge", pfad: "trainingszentrum" });
  return `<main class="seo-seite" style="${STIL}">
<p style="font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8A6A00;margin:0 0 8px"><a href="/" style="color:inherit;text-decoration:none">Mythos Mathe</a> · <a href="/${esc(hubLink.pfad)}" style="color:inherit;text-decoration:none">${esc(hubLink.name)}</a> · ${esc(stufeText(w && w.stufe))}</p>
<h1 style="font-size:32px;line-height:1.1;margin:0 0 12px">${esc(w ? w.name : t.titel)}</h1>
<p style="font-size:17px;margin:0 0 20px">${esc(entitaet(t))}</p>
<dl style="display:grid;grid-template-columns:max-content 1fr;gap:4px 14px;margin:0 0 20px;font-size:14.5px">${steckbrief(t).map(([k, v]) => `<dt style="font-weight:700">${esc(k)}</dt><dd style="margin:0">${esc(v)}</dd>`).join("")}</dl>
<section><h2 style="${H2}">Was kann dieses Werkzeug?</h2>
${t.text.map((a) => `<p>${esc(a)}</p>`).join("\n")}</section>
${beispielHtml(t)}${t.faq && t.faq.length ? `<section><h2 style="${H2}">Häufige Fragen</h2>
${t.faq.map((q) => `<h3 style="font-size:16px;margin:16px 0 4px">${esc(q.f)}</h3><p style="margin:0">${esc(q.a)}</p>`).join("\n")}</section>` : ""}
${verwandte.length ? `<nav aria-label="Weitere Werkzeuge"><h2 style="${H2}">Weitere Werkzeuge: ${esc(hubLink.name)}</h2><ul>${verwandte.map((v) => `<li><a href="/${esc(v.pfad)}">${esc(v.name)}</a></li>`).join("")}</ul><p><a href="/${esc(hubLink.pfad)}">Alle Werkzeuge zu ${esc(hubLink.name)}</a></p></nav>` : ""}
${autorZeile()}
${fuss()}
</main>`;
}

/* Statischer Inhalt einer Hub-Seite */
export function hubHtml(h, bereiche = []) {
  const liste = bereiche.map((b) => `<section><h2 style="${H2}">${esc(b.titel)}</h2><ul>${b.werkzeuge.map((v) => `<li><a href="/${esc(v.pfad)}">${esc(v.name)}</a> – ${esc(v.zeile)}</li>`).join("")}</ul></section>`).join("\n");
  const preise = h.ansicht === "vision" ? `<section><h2 style="${H2}">Über den Autor</h2><p><strong>${esc(AUTOR.name)}</strong>, ${esc(AUTOR.rolle)}: ${esc(AUTOR.kurz)}</p><ul>${AUTOR.preise.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></section>` : "";
  return `<main class="seo-seite" style="${STIL}">
<p style="font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8A6A00;margin:0 0 8px">${h.ansicht === "start" ? "Mythos Mathe · Konstanz" : `<a href="/" style="color:inherit;text-decoration:none">Mythos Mathe</a>`}</p>
<h1 style="font-size:32px;line-height:1.1;margin:0 0 12px">${esc(h.h1)}</h1>
<p style="font-size:17px;margin:0 0 20px">${esc(h.kurz)}</p>
${h.text.map((a) => `<p>${esc(a)}</p>`).join("\n")}
${liste}
${preise}
${h.faq && h.faq.length ? `<section><h2 style="${H2}">Häufige Fragen</h2>
${h.faq.map((q) => `<h3 style="font-size:16px;margin:16px 0 4px">${esc(q.f)}</h3><p style="margin:0">${esc(q.a)}</p>`).join("\n")}</section>` : ""}
${h.ansicht === "vision" ? "" : autorZeile()}
${fuss()}
</main>`;
}

/* Werkzeuge derselben Station (für die Linkliste) */
export function verwandteVon(id, seiten = SEO_SEITEN()) {
  const pfade = new Map(seiten.map((s) => [s.id, s.pfad]));
  for (const b of BEREICHE) for (const s of b.stationen) if (s.werkzeuge.includes(id)) {
    const andere = b.stationen.flatMap((x) => x.werkzeuge).filter((x) => x !== id && pfade.has(x) && WERKZEUGE[x]).slice(0, 8);
    return andere.map((x) => ({ id: x, name: WERKZEUGE[x].name, pfad: pfade.get(x) }));
  }
  return [];
}

/* Werkzeuge eines Hubs, nach Bereich gruppiert: { titel, werkzeuge: [{ id, name, zeile, pfad }] } */
export function hubBereiche(h, seiten = SEO_SEITEN()) {
  const pfade = new Map(seiten.map((s) => [s.id, s.pfad]));
  const ids = h.bereiche === "alle" ? BEREICHE.map((b) => b.id) : h.bereiche || [];
  return BEREICHE.filter((b) => ids.includes(b.id)).map((b) => ({
    id: b.id, titel: b.titel,
    werkzeuge: b.stationen.flatMap((s) => s.werkzeuge).filter((x, i, l) => l.indexOf(x) === i && pfade.has(x)).map((x) => ({ id: x, name: WERKZEUGE[x].name, zeile: WERKZEUGE[x].zeile, pfad: pfade.get(x) })),
  })).filter((b) => b.werkzeuge.length);
}
