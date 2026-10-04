import React, { useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { KARTE_VIEWBOX, LAENDER_PFADE } from "./deutschlandKarte.js";

/* ======================================================================
   MATHE-WETTBEWERBE — Bundeswettbewerb Mathematik und die Wettbewerbe
   der 16 Bundesländer. Alle Termine und Links: Stand Oktober 2026.
   Die Seiten sind bewusst datengetrieben: Für eine neue Runde reicht es,
   unten die Einträge (Termine, PDF-Links) zu ergänzen.
   ====================================================================== */

const L = (de, en) => (englisch() ? en : de);
const STAND = "Oktober 2026";

/* Läuft eine Runde gerade? start/ende als ISO-Datum; fehlt start, ist sie nur angekündigt. */
function rundenStatus(r, heute = new Date()) {
  if (!r.start) return "angekuendigt";
  const s = new Date(r.start + "T00:00:00"), e = r.ende ? new Date(r.ende + "T23:59:59") : null;
  if (heute < s) return "bald";
  if (!e || heute <= e) return "laeuft";
  return "vorbei";
}

/* ---------- Bundeswettbewerb Mathematik ---------- */
const BWM_PDF = "https://www.mathe-wettbewerbe.de/fileadmin/Mathe-Wettbewerbe/Bundeswettbewerb_Mathematik/Dokumente/Aufgaben_und_Loesungen_BWM/";
export const BWM = {
  web: "https://www.mathe-wettbewerbe.de/bundeswettbewerb-mathematik",
  archiv: "https://www.mathe-wettbewerbe.de/aufgaben",
  // Nächste bzw. aktuelle erste Runde. Sobald die Aufgaben 2027 erscheinen: start, ende und blatt eintragen.
  ersteRunde: {
    jahr: 2027, start: null, ende: null, blatt: null,
    hinweis: ["Die Aufgaben erscheinen voraussichtlich Anfang Dezember 2026, Einsendeschluss voraussichtlich Anfang März 2027 (im Vorjahr: 1. Dezember bis 2. März).",
      "The tasks are expected in early December 2026, with the deadline expected in early March 2027 (last year: 1 December to 2 March)."],
  },
  vorjahr: {
    jahr: 2026,
    runden: [
      { titel: ["1. Runde 2026", "Round 1 2026"], termin: ["1. Dezember 2025 – 2. März 2026", "1 December 2025 – 2 March 2026"],
        links: [[["Aufgabenblatt", "Task sheet"], BWM_PDF + "2026/BWM_Aufgabenblatt_2026_1.pdf"],
          [["Aufgaben und Lösungen", "Tasks and solutions"], BWM_PDF + "2026/26_1_Aufgaben_und_Loesungen_endgueltig_260519_HP.pdf"]] },
      { titel: ["2. Runde 2026", "Round 2 2026"],
        links: [[["Aufgabenblatt", "Task sheet"], BWM_PDF + "2026/26_2_Aufgabenblatt.pdf"],
          [["Lösungen", "Solutions"], BWM_PDF + "2026/loes_26_2_v.pdf"]] },
    ],
  },
  davor: {
    jahr: 2025,
    links: [[["1. Runde 2025 – Aufgaben", "Round 1 2025 – tasks"], BWM_PDF + "2025/BWM_2025_Aufgabenblatt_SCREEN.pdf"],
      [["1. Runde 2025 – Lösungen", "Round 1 2025 – solutions"], BWM_PDF + "2025/25_1_Aufgaben_und_Loesungen_endgueltig.pdf"],
      [["2. Runde 2025 – Aufgaben", "Round 2 2025 – tasks"], BWM_PDF + "2025/BWM_25_2_Aufgabenblatt.pdf"],
      [["2. Runde 2025 – Lösungen", "Round 2 2025 – solutions"], BWM_PDF + "2025/bwm_2025_ii_endgueltig.pdf"]],
  },
};

/* ---------- Wettbewerbe der Länder ---------- */
const MO_AKTUELL = {
  titel: ["66. Mathematik-Olympiade 2026/27", "66th Mathematical Olympiad 2026/27"],
  termine: [
    [["Schulrunde", "School round"], ["August bis Oktober 2026", "August to October 2026"]],
    [["Regionalrunde", "Regional round"], ["11. November 2026", "11 November 2026"]],
    [["Landesrunde", "State round"], ["26.–28. Februar 2027", "26–28 February 2027"]],
    [["Bundesrunde", "National round"], ["30. Mai – 2. Juni 2027, Kaiserslautern", "30 May – 2 June 2027, Kaiserslautern"]],
  ],
  links: [[["Aktuelle Aufgaben der Mathematik-Olympiade", "Current Mathematical Olympiad tasks"], "https://www.mathematik-olympiaden.de/moev/aufgaben?view=aktaufg"]],
};
const MO_VORJAHR = {
  titel: ["65. Mathematik-Olympiade 2025/26", "65th Mathematical Olympiad 2025/26"],
  links: [[["Aufgaben und Lösungen im Archiv", "Tasks and solutions in the archive"], "https://www.mathematik-olympiaden.de/moev/aufgaben/aufgabenarchiv-2?view=aufgabenarchiv"]],
};
const MO_INFO = ["Die Mathematik-Olympiade ist der Wettbewerb, über den die meisten Bundesländer ihre Landessieger ermitteln: Schulrunde, Regionalrunde, Landesrunde – die Besten fahren zur Bundesrunde. Die Aufgaben sind bundesweit gleich, getrennt nach Klassenstufen.",
  "The Mathematical Olympiad is the competition most German states use to find their state winners: school round, regional round, state round – the best go on to the national round. The tasks are the same nationwide, separated by grade."];
const MO_FORMAT = ["Vier Stufen: Schul-, Regional-, Landes- und Bundesrunde. Ab der Regionalrunde als Klausur.", "Four stages: school, regional, state and national round. From the regional round on as a written exam."];
const MO_ALLGEMEIN = "https://www.mathe-wettbewerbe.de/mathematik-olympiade";

const mo = (land, extra) => ({
  art: "mo", wettbewerb: [`Mathematik-Olympiade – Landesrunde ${land}`, `Mathematical Olympiad – ${land} state round`],
  info: MO_INFO, format: MO_FORMAT, aktuell: MO_AKTUELL, vorjahr: MO_VORJAHR, ...extra,
});

const RLP = "https://bildung.rlp.de/fileadmin/user_upload/lawema.bildung.rlp.de/";
const HE = "https://mathematik-wettbewerb.de/pages/aufgloes/";
const BW_PDF = "https://www.landeswettbewerb-mathematik.de/";

export const LAENDER = {
  bw: { name: "Baden-Württemberg", kuerzel: "BW", art: "lw",
    wettbewerb: ["Landeswettbewerb Mathematik Baden-Württemberg", "Baden-Württemberg State Mathematics Competition"],
    traeger: ["Kultusministerium Baden-Württemberg, in Kooperation mit Bayern", "Ministry of Education Baden-Württemberg, in cooperation with Bavaria"],
    web: "https://www.landeswettbewerb-mathematik.de/",
    stufen: ["Klassen 5 bis 10", "Grades 5 to 10"],
    format: ["1. Runde: sechs Aufgaben, vier davon bearbeiten – Gruppen bis zu drei Personen erlaubt. 2. Runde: Einzelarbeit; die Besten werden zu einem Seminar eingeladen.",
      "Round 1: six tasks, solve four of them – groups of up to three allowed. Round 2: individual work; the best are invited to a seminar."],
    aktuell: { titel: ["1. Runde 2026", "Round 1 2026"], termine: [[["Aufgaben", "Tasks"], ["seit September 2026 an den Schulen", "at schools since September 2026"]]],
      links: [[["Aufgabenblatt 1. Runde 2026", "Task sheet round 1 2026"], BW_PDF + "pdf/aufgaben2026.pdf"]] },
    vorjahr: { titel: ["Wettbewerb 2025", "Competition 2025"],
      links: [[["1. Runde 2025 – Aufgaben und Lösungsbeispiele", "Round 1 2025 – tasks and sample solutions"], BW_PDF + "aufgaben/daten/LWM_39_1_Lösungsbeispiele.pdf"],
        [["2. Runde 2025 – Aufgaben und Lösungsbeispiele", "Round 2 2025 – tasks and sample solutions"], BW_PDF + "aufgaben/daten/LWM_39_2_Lösungsbeispiele.pdf"],
        [["Archiv aller Jahrgänge", "Archive of all years"], BW_PDF + "?p=content/alteAufgaben.html"]] } },
  by: { name: "Bayern", kuerzel: "BY", art: "lw",
    wettbewerb: ["Landeswettbewerb Mathematik Bayern", "Bavarian State Mathematics Competition"],
    traeger: ["Bayerisches Staatsministerium für Unterricht und Kultus", "Bavarian State Ministry of Education"],
    web: "https://lwmb.de/",
    stufen: ["Mittelstufe (Klassen 5 bis 10)", "Middle school (grades 5 to 10)"],
    format: ["1. Runde: sechs Aufgaben, vier davon bearbeiten – Gruppen bis zu drei Personen erlaubt. 2. Runde: Einzelarbeit.",
      "Round 1: six tasks, solve four of them – groups of up to three allowed. Round 2: individual work."],
    aktuell: { titel: ["1. Runde des 29. LWMB 2026/27", "Round 1 of the 29th LWMB 2026/27"], termine: [[["Einsendeschluss", "Deadline"], ["12. November 2026", "12 November 2026"]]],
      links: [[["Aufgabenblatt 1. Runde (29. LWMB)", "Task sheet round 1 (29th LWMB)"], "https://lwmb.de/index.php?rex_media_type=open&rex_media_file=ab29lwmb.pdf"]] },
    vorjahr: { titel: ["28. LWMB 2025/26", "28th LWMB 2025/26"],
      links: [[["1. Runde – Aufgaben", "Round 1 – tasks"], "https://lwmb.de/index.php?rex_media_type=open&rex_media_file=ab28lwmb.pdf"],
        [["1. Runde – Lösungen", "Round 1 – solutions"], "https://lwmb.de/index.php?rex_media_type=open&rex_media_file=lsg281.pdf"],
        [["2. Runde – Lösungen", "Round 2 – solutions"], "https://lwmb.de/index.php?rex_media_type=open&rex_media_file=lsg282.pdf"],
        [["Archiv", "Archive"], "https://lwmb.de/archiv/"]] } },
  rp: { name: "Rheinland-Pfalz", kuerzel: "RP", art: "lw",
    wettbewerb: ["Landeswettbewerb Mathematik Rheinland-Pfalz", "Rhineland-Palatinate State Mathematics Competition"],
    traeger: ["Ministerium für Bildung Rheinland-Pfalz", "Ministry of Education Rhineland-Palatinate"],
    web: "https://bildung.rlp.de/lawema/",
    stufen: ["1. Runde: Klassen 7 und 8 · 2. Runde: Klassen 8 und 9", "Round 1: grades 7 and 8 · Round 2: grades 8 and 9"],
    format: ["1. Runde als Klausur in der Schule. 2. Runde: Hausarbeit im Januar, danach Kolloquium im Mai/Juni.",
      "Round 1 as an exam at school. Round 2: home assignment in January, followed by a colloquium in May/June."],
    aktuell: { titel: ["Wettbewerb 2026/27", "Competition 2026/27"], termine: [[["Aufgaben", "Tasks"], ["noch nicht veröffentlicht", "not yet published"]]], links: [] },
    vorjahr: { titel: ["Wettbewerb 2026", "Competition 2026"],
      links: [[["1. Runde – Aufgaben", "Round 1 – tasks"], RLP + "Aufgaben1_Runde_2026.pdf"],
        [["1. Runde – Lösungen", "Round 1 – solutions"], RLP + "Loesungen_1_Runde_2026.pdf"],
        [["2. Runde – Aufgaben", "Round 2 – tasks"], RLP + "5_Aufgaben_2_Runde_LaWeMa2026.pdf"],
        [["2. Runde – Lösungen", "Round 2 – solutions"], RLP + "Loesungen_2_Runde_LaWeMa2026.pdf"],
        [["Aufgaben und Lösungen 2025", "Tasks and solutions 2025"], "https://bildung.rlp.de/lawema/aufgaben-und-loesungen-2025-weitere-aufgabenbeispiele"]] } },
  he: { name: "Hessen", kuerzel: "HE", art: "lw",
    wettbewerb: ["Mathematik-Wettbewerb des Landes Hessen", "Hessen State Mathematics Competition"],
    traeger: ["Hessisches Kultusministerium", "Hessian Ministry of Education"],
    web: "https://mathematik-wettbewerb.de/pages/index.xml",
    stufen: ["Jahrgangsstufe 8", "Grade 8"],
    format: ["Drei Runden im Schuljahr, jeweils als Klausur.", "Three rounds per school year, each as a written exam."],
    aktuell: { titel: ["Wettbewerb 2026/27", "Competition 2026/27"],
      termine: [[["1. Runde", "Round 1"], ["3. Dezember 2026", "3 December 2026"]], [["2. Runde", "Round 2"], ["3. März 2027", "3 March 2027"]], [["3. Runde", "Round 3"], ["11. Mai 2027", "11 May 2027"]]],
      links: [[["Termine 2026/27", "Dates 2026/27"], "https://mathematik-wettbewerb.de/pages/termine.xml"]] },
    vorjahr: { titel: ["Wettbewerb 2025/26", "Competition 2025/26"],
      links: [[["1. Runde – Aufgaben", "Round 1 – tasks"], HE + "mw2025_2026_1r.pdf"], [["1. Runde – Lösungen", "Round 1 – solutions"], HE + "mw2025_2026_1r_loes_ohne_pkte.pdf"],
        [["2. Runde – Aufgaben", "Round 2 – tasks"], HE + "mw2025_2026_2r.pdf"], [["2. Runde – Lösungen", "Round 2 – solutions"], HE + "mw2025_2026_2r_loes_ohne_pkte.pdf"],
        [["3. Runde – Aufgaben", "Round 3 – tasks"], HE + "mw2025_2026_3r.pdf"], [["3. Runde – Lösungen", "Round 3 – solutions"], HE + "mw2025_2026_3r_loes_ohne_pkte.pdf"],
        [["Archiv", "Archive"], "https://mathematik-wettbewerb.de/pages/aufgloes.xml"]] } },
  be: { name: "Berlin", kuerzel: "BE", ...mo("Berlin", { traeger: ["Mathematikolympiaden in Berlin e.V.", "Mathematikolympiaden in Berlin e.V."], web: "https://www.mathematikolympiaden-berlin.de/", stufen: ["Klassen 3 bis 12", "Grades 3 to 12"] }) },
  bb: { name: "Brandenburg", kuerzel: "BB", ...mo("Brandenburg", { wettbewerb: ["Mathematikolympiade des Landes Brandenburg (MOLB)", "Brandenburg State Mathematical Olympiad (MOLB)"], traeger: ["BLiS e.V.", "BLiS e.V."], web: "https://www.blis-brandenburg.de/", stufen: ["Landesrunde: Klassen 6 bis 12", "State round: grades 6 to 12"],
    extraLinks: [[["Mathematikolympiade im Schulportal Brandenburg", "Mathematical Olympiad on the Brandenburg school portal"], "https://schulportal.brandenburg.de/angebote/schuelerwettbewerbe/mathematikolympiade-des-landes-brandenburg"]] }) },
  hb: { name: "Bremen", kuerzel: "HB", ...mo("Bremen", { traeger: ["Universität Bremen, Fachbereich Mathematik", "University of Bremen, Department of Mathematics"], web: "http://www.math.uni-bremen.de/didaktik/ma/ralbers/MOBremen/index.html" }) },
  hh: { name: "Hamburg", kuerzel: "HH", ...mo("Hamburg", { traeger: ["TU Hamburg und Hamburger Schulbehörde", "TU Hamburg and the Hamburg school authority"], web: "https://bildungsserver.hamburg.de/schulfaecher/mint/mathematik/matheolympiade-711428", stufen: ["Klassen 3 bis 13", "Grades 3 to 13"] }) },
  mv: { name: "Mecklenburg-Vorpommern", kuerzel: "MV", ...mo("Mecklenburg-Vorpommern", { traeger: ["Ministerium für Bildung und Kindertagesförderung MV", "Ministry of Education of Mecklenburg-Western Pomerania"], web: MO_ALLGEMEIN, stufen: ["Klassen 3 bis 12", "Grades 3 to 12"] }) },
  ni: { name: "Niedersachsen", kuerzel: "NI", ...mo("Niedersachsen", { traeger: ["MO-Ni e.V.", "MO-Ni e.V."], web: "https://www.mo-ni.de/", stufen: ["Klassen 3 bis 13", "Grades 3 to 13"],
    landTermine: [[["Hausaufgabenrunde", "Home round"], ["24. August – 9. Oktober 2026", "24 August – 9 October 2026"]], [["Landesrunde", "State round"], ["26.–27. Februar 2027, Universität Göttingen", "26–27 February 2027, University of Göttingen"]]],
    extraLinks: [[["Termine 2026/27", "Dates 2026/27"], "https://www.mo-ni.de/klasse-5-13/termine-202627"]] }) },
  nw: { name: "Nordrhein-Westfalen", kuerzel: "NW", ...mo("Nordrhein-Westfalen", { traeger: ["Landesverband Mathematikwettbewerbe NRW e.V.", "Landesverband Mathematikwettbewerbe NRW e.V."], web: "https://mathe-nrw.de/wettbewerb/landesrunde/", stufen: ["Klasse 5 bis Q2", "Grade 5 to Q2"] }) },
  sl: { name: "Saarland", kuerzel: "SL", ...mo("Saarland", { traeger: ["Mathematik-Olympiade e.V.", "Mathematik-Olympiade e.V."], web: MO_ALLGEMEIN,
    hinweis: ["Im Saarland gibt es keinen eigenen Landeswettbewerb. Zusätzlich veranstaltet die Universität des Saarlandes jedes Frühjahr den „Tag der Mathematik“ für die Oberstufe (Teams aus zwei bis drei Personen).",
      "Saarland has no separate state competition. In addition, Saarland University holds the “Tag der Mathematik” for upper secondary students every spring (teams of two or three)."],
    extraLinks: [[["Tag der Mathematik – Universität des Saarlandes", "Tag der Mathematik – Saarland University"], "https://www.uni-saarland.de/en/news/mathe-schuelerwettbewerbe-an-der-saar-uni-tag-der-mathematik-und-kleiner-tag-der-mathematik-44019.html"]] }) },
  sn: { name: "Sachsen", kuerzel: "SN", ...mo("Sachsen", { traeger: ["Landeskomitee und Bezirkskomitees der Mathematik-Olympiade", "State and district committees of the Mathematical Olympiad"], web: "https://www.sachsen.schule/~bezirkskomitee/neu/olympiade.htm",
    extraLinks: [[["Übersicht Schülerwettbewerbe Sachsen", "Overview of student competitions in Saxony"], "https://www.schule.sachsen.de/download/2025_26_Schuelerwettbewerbe.pdf"]] }) },
  st: { name: "Sachsen-Anhalt", kuerzel: "ST", ...mo("Sachsen-Anhalt", { wettbewerb: ["Mathematikolympiade in Sachsen-Anhalt", "Mathematical Olympiad in Saxony-Anhalt"], traeger: ["eLeMeNTe e.V.", "eLeMeNTe e.V."], web: "https://mo.elemente.org/", stufen: ["Klassen 5 bis 12", "Grades 5 to 12"],
    extraLinks: [[["Aktuelle Olympiade in Sachsen-Anhalt", "Current olympiad in Saxony-Anhalt"], "https://mo.elemente.org/aktuelle-olympiade/"], [["Aufgaben", "Tasks"], "https://mo.elemente.org/aufgaben/"]] }) },
  sh: { name: "Schleswig-Holstein", kuerzel: "SH", ...mo("Schleswig-Holstein", { traeger: ["Europa-Universität Flensburg, Institut für Mathematik", "Europa-Universität Flensburg, Institute of Mathematics"], web: "https://www.uni-flensburg.de/mathematik/forschung-projekte-wettbewerbe/wettbewerbe/mathematikolympiade/sekundarschule/landesrunde", stufen: ["Klassen 5 bis 13", "Grades 5 to 13"] }) },
  th: { name: "Thüringen", kuerzel: "TH", ...mo("Thüringen", { wettbewerb: ["Thüringer Mathematik-Olympiade – Landesrunde", "Thuringian Mathematical Olympiad – state round"], traeger: ["Thüringer Bildungsministerium", "Thuringian Ministry of Education"], web: MO_ALLGEMEIN }) },
};
const LAND_EN = { by: "Bavaria", he: "Hesse", rp: "Rhineland-Palatinate", ni: "Lower Saxony", nw: "North Rhine-Westphalia", mv: "Mecklenburg-Western Pomerania", sn: "Saxony", st: "Saxony-Anhalt", th: "Thuringia" };
const landName = (id) => (englisch() && LAND_EN[id]) || LAENDER[id].name;

/* ---------- Bausteine ---------- */
const karteStil = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const Kicker = ({ children }) => <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>{children}</p>;
const H2 = ({ children }) => <h2 style={{ fontSize: 23, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>{children}</h2>;
const Absatz = ({ children }) => <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 14 }}>{children}</p>;
const Trenner = () => <div style={{ height: 1, background: C.linie, margin: "28px 0 24px" }} />;
const t = (paar) => (Array.isArray(paar) ? L(paar[0], paar[1]) : paar);

function PdfLink({ text, url }) {
  const pdf = /\.pdf($|\?)|rex_media_file=.*\.pdf/i.test(url);
  return (
    <a href={encodeURI(url)} target="_blank" rel="noopener noreferrer"
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.linie}`, textDecoration: "none", color: C.tinte }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, background: pdf ? "#FBEFEA" : C.himmel,
        color: pdf ? C.signal : C.see, fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: "0.03em" }}>
        {pdf ? "PDF" : "WEB"}
      </span>
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500, lineHeight: 1.4 }}>{text}</span>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ flexShrink: 0 }}><path d="M6 3h7v7M13 3L5 11" stroke={C.see} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </a>
  );
}
const LinkListe = ({ links }) => (
  <div style={{ ...karteStil, padding: "2px 16px" }}>
    {links.map(([text, url]) => <PdfLink key={url} text={t(text)} url={url} />)}
  </div>
);
const Termine = ({ liste }) => (
  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", marginTop: 10 }}>
    {liste.map(([a, b], i) => (
      <React.Fragment key={i}>
        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)" }}>{t(a)}</span>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: C.weiss }}>{t(b)}</span>
      </React.Fragment>
    ))}
  </div>
);
const Hinweis = () => (
  <p style={{ fontSize: 12, color: C.hellgrau, lineHeight: 1.6, marginTop: 26 }}>
    {L(`Stand: ${STAND}. Alle Angaben ohne Gewähr – maßgeblich sind die Seiten der Veranstalter.`,
      `As of ${STAND === "Oktober 2026" ? "October 2026" : STAND}. All information without guarantee – the organisers' websites are authoritative.`)}
  </p>
);
function StatusKarte({ kicker, titel, status, children }) {
  const farbe = status === "laeuft" ? "#3DDC84" : C.flaggold;
  const text = { laeuft: L("läuft gerade", "running now"), bald: L("startet bald", "starting soon"), angekuendigt: L("in Vorbereitung", "in preparation"), vorbei: L("abgeschlossen", "finished") }[status];
  return (
    <div style={{ borderRadius: 20, padding: "18px 18px 20px", color: C.weiss, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`,
      boxShadow: "0 8px 24px rgba(0,77,152,0.25)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: C.flaggold }}>{kicker}</span>
        {status && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "rgba(255,255,255,0.12)", whiteSpace: "nowrap", flexShrink: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: farbe }} />{text}
        </span>}
      </div>
      <p style={{ fontSize: "clamp(21px, 6vw, 26px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, marginTop: 8 }}>{titel}</p>
      {children}
    </div>
  );
}

/* ---------- Seite: Bundeswettbewerb Mathematik ---------- */
export function BundeswettbewerbSeite() {
  const r = BWM.ersteRunde;
  const status = rundenStatus(r);
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <StatusKarte kicker={L("NÄCHSTE 1. RUNDE", "NEXT ROUND 1")} titel={L(`Bundeswettbewerb Mathematik ${r.jahr}`, `Bundeswettbewerb Mathematik ${r.jahr}`)} status={status}>
        <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, marginTop: 8 }}>
          {status === "laeuft" ? L("Die Aufgaben der 1. Runde sind veröffentlicht – jetzt bearbeiten und rechtzeitig einsenden.", "The round 1 tasks are out – work on them now and submit in time.") : t(r.hinweis)}
        </p>
        {r.blatt && status === "laeuft" && (
          <a href={r.blatt} target="_blank" rel="noopener noreferrer" style={{ marginTop: 14, display: "flex", justifyContent: "center", padding: "13px 16px", borderRadius: 14,
            background: "linear-gradient(180deg,#FFE58A 0%,#EDBB00 45%,#E2B53C 70%,#A67C00 100%)", color: "#0E0C08", fontWeight: 800, textDecoration: "none" }}>
            {L("Aufgabenblatt der 1. Runde öffnen", "Open the round 1 task sheet")}
          </a>
        )}
        <a href={BWM.web} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 14, fontSize: 14, fontWeight: 600, color: C.flaggold }}>
          {L("Zur offiziellen Seite →", "Go to the official website →")}
        </a>
      </StatusKarte>

      <div style={{ marginTop: 26 }}>
        <H2>{L("Der anspruchsvollste Mathe-Wettbewerb für die Oberstufe", "Germany's most demanding maths competition for upper secondary students")}</H2>
        <Absatz>{L("Der Bundeswettbewerb Mathematik richtet sich an alle Schülerinnen und Schüler, die auf dem Weg zum Abitur sind – auch an deutschen Schulen im Ausland. Es geht nicht um Schulstoff, sondern um echte mathematische Probleme, die man mit Ausdauer, Ideen und sauberen Beweisen löst.",
          "The Bundeswettbewerb Mathematik is open to all students on their way to the Abitur – including German schools abroad. It is not about school material but about real mathematical problems that you solve with persistence, ideas and clean proofs.")}</Absatz>
      </div>

      <div style={{ ...karteStil, padding: "4px 16px" }}>
        {[[L("1. Runde", "Round 1"), L("Hausaufgabe: vier Aufgaben aus Algebra, Geometrie, Kombinatorik und Zahlentheorie, rund drei Monate Zeit.", "Home assignment: four problems from algebra, geometry, combinatorics and number theory, about three months' time.")],
          [L("2. Runde", "Round 2"), L("Wieder vier Hausaufgaben, deutlich anspruchsvoller – für alle Preisträger der 1. Runde.", "Again four home problems, considerably harder – for all prize winners of round 1.")],
          [L("3. Runde", "Round 3"), L("Ein etwa einstündiges Fachgespräch mit Mathematikerinnen und Mathematikern.", "An expert interview of about one hour with mathematicians.")],
          [L("Preise", "Prizes"), L("Urkunden, Sach- und Geldpreise. Bundessieger werden in die Studienstiftung des deutschen Volkes aufgenommen.", "Certificates, material and cash prizes. National winners are admitted to the German Academic Scholarship Foundation.")]]
          .map(([a, b], i, arr) => (
            <div key={a} style={{ display: "flex", gap: 12, padding: "13px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.linie}` : "none" }}>
              <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, background: C.seeTief, color: C.flaggold, fontSize: 12.5, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center" }}>{i < 3 ? i + 1 : "★"}</span>
              <span><span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.tinte }}>{a}</span>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 300, color: C.grau, lineHeight: 1.55, marginTop: 2 }}>{b}</span></span>
            </div>
          ))}
      </div>

      <Trenner />
      <Kicker>{L("Zum Üben", "For practice")}</Kicker>
      <H2>{L(`Aufgaben und Lösungen ${BWM.vorjahr.jahr}`, `Tasks and solutions ${BWM.vorjahr.jahr}`)}</H2>
      {BWM.vorjahr.runden.map((rd) => (
        <div key={rd.titel[0]} style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.tinte, marginBottom: 8 }}>{t(rd.titel)}{rd.termin && <span style={{ fontWeight: 300, color: C.grau }}> · {t(rd.termin)}</span>}</p>
          <LinkListe links={rd.links} />
        </div>
      ))}
      <p style={{ fontSize: 14, fontWeight: 700, color: C.tinte, margin: "4px 0 8px" }}>{L(`Ältere Jahrgänge`, `Earlier years`)}</p>
      <LinkListe links={[...BWM.davor.links, [["Aufgabenarchiv aller Jahre", "Archive of all years"], BWM.archiv]]} />

      <Trenner />
      <Kicker>{L("So gehst du die 1. Runde an", "How to approach round 1")}</Kicker>
      <div style={{ ...karteStil, padding: "6px 16px" }}>
        {[L("Lies alle vier Aufgaben früh – Ideen kommen oft erst nach Tagen.", "Read all four problems early – ideas often come only after days."),
          L("Probiere kleine Fälle aus und suche Muster, bevor du beweist.", "Try small cases and look for patterns before you prove anything."),
          L("Schreib jeden Schritt vollständig auf: Bewertet wird der Beweis, nicht nur das Ergebnis.", "Write down every step completely: the proof is graded, not just the result."),
          L("Arbeite die Lösungen der Vorjahre durch – dort lernst du, wie gute Beweise aussehen.", "Work through previous years' solutions – that is where you learn what good proofs look like.")]
          .map((s, i, arr) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.linie}` : "none" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true"><circle cx="10" cy="10" r="9" fill={C.flaggold} /><path d="M6 10.2l2.6 2.6L14.2 7" stroke={C.seeTief} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.55 }}>{s}</span>
            </div>
          ))}
      </div>
      <Hinweis />
    </div>
  );
}

/* ---------- Deutschlandkarte ---------- */
const LABEL_VERSATZ = { bb: [44, 50], be: [0, 1], hb: [-4, 4], hh: [4, -2], sh: [6, -6], mv: [0, 4], ni: [-6, 30], sl: [2, 0], rp: [8, 0], by: [10, 0], st: [-4, 0] };
const KLEIN = new Set(["be", "hb", "hh", "sl"]);

function Deutschlandkarte({ onWahl }) {
  const [hover, setHover] = useState(null);
  return (
    <div style={{ ...karteStil, padding: "14px 10px 8px" }}>
      <style>{`.land{cursor:pointer;transition:fill .15s ease}
        .land:focus{outline:none}
        .land:focus-visible{stroke:${C.flaggold};stroke-width:3}`}</style>
      <svg viewBox={KARTE_VIEWBOX} role="group" aria-label={L("Deutschlandkarte – Bundesland wählen", "Map of Germany – choose a state")}
        style={{ width: "100%", maxWidth: 440, height: "auto", display: "block", margin: "0 auto" }}>
        {/* Stadtstaaten zuletzt zeichnen, damit sie über den Flächenländern liegen */}
        {Object.entries(LAENDER_PFADE).sort(([a], [b]) => (KLEIN.has(a) ? 1 : 0) - (KLEIN.has(b) ? 1 : 0)).map(([id, p]) => {
          const lw = LAENDER[id].art === "lw";
          const an = hover === id;
          return (
            <path key={id} d={p.d} className="land" tabIndex={0} role="button" aria-label={landName(id)}
              onClick={() => onWahl(id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onWahl(id); } }}
              onMouseEnter={() => setHover(id)} onMouseLeave={() => setHover(null)}
              fill={an ? C.flaggold : lw ? C.see : "#8D97A6"} stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" />
          );
        })}
        {Object.entries(LAENDER_PFADE).map(([id, p]) => {
          const [dx, dy] = LABEL_VERSATZ[id] || [0, 0];
          return (
            <text key={id} x={p.cx + dx} y={p.cy + dy} textAnchor="middle" dominantBaseline="middle" pointerEvents="none"
              style={{ fontSize: KLEIN.has(id) ? 18 : 26, fontWeight: 800, fontFamily: "inherit", letterSpacing: "0.02em",
                // Stadtstaaten: dunkle Schrift mit weißem Rand, damit sie auf der kleinen Fläche lesbar bleiben
                ...(KLEIN.has(id) ? { fill: C.seeTief, stroke: "#FFFFFF", strokeWidth: 4, paintOrder: "stroke" } : { fill: hover === id ? C.seeTief : "#FFFFFF" }) }}>
              {LAENDER[id].kuerzel}
            </text>
          );
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginTop: 8, fontSize: 12.5, color: C.grau }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: C.see }} />{L("Eigener Landeswettbewerb", "Own state competition")}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "#8D97A6" }} />{L("Landesrunde der Mathematik-Olympiade", "State round of the Mathematical Olympiad")}</span>
      </div>
      <p style={{ fontSize: 10.5, color: C.hellgrau, textAlign: "right", marginTop: 6 }}>{L("Karte", "Map")}: svg-maps (CC BY 4.0)</p>
    </div>
  );
}

/* ---------- Seite: Landeswettbewerbe (Karte + Liste) ---------- */
export function LandeswettbewerbeSeite({ gehe }) {
  const wahl = (id) => { gehe({ ansicht: "landeswettbewerb", land: id }); window.scrollTo(0, 0); };
  const ids = Object.keys(LAENDER).sort((a, b) => landName(a).localeCompare(landName(b), "de"));
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <H2>{L("Tippe auf dein Bundesland", "Tap your state")}</H2>
      <Absatz>{L("Jedes Bundesland hat seinen eigenen Weg zum Landessieger: Baden-Württemberg, Bayern, Rheinland-Pfalz und Hessen haben einen eigenen Landeswettbewerb, alle anderen ermitteln ihre Besten über die Landesrunde der Mathematik-Olympiade.",
        "Every state has its own route to the state title: Baden-Württemberg, Bavaria, Rhineland-Palatinate and Hesse run their own state competition, all other states find their best through the state round of the Mathematical Olympiad.")}</Absatz>
      <Deutschlandkarte onWahl={wahl} />
      <style>{`.land-liste{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:18px}
        @media (max-width:420px){.land-liste{grid-template-columns:1fr}}`}</style>
      <div className="land-liste">
        {ids.map((id) => (
          <button key={id} onClick={() => wahl(id)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.linie}`, background: C.weiss,
              cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: C.tinte, fontSize: 13.5, fontWeight: 600 }}>
            <span style={{ flexShrink: 0, width: 30, height: 22, borderRadius: 6, background: LAENDER[id].art === "lw" ? C.see : "#8D97A6", color: C.weiss,
              fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{LAENDER[id].kuerzel}</span>
            <span style={{ minWidth: 0, flex: 1 }}>{landName(id)}</span>
            <span aria-hidden="true" style={{ color: C.see, fontSize: 15 }}>→</span>
          </button>
        ))}
      </div>
      <Hinweis />
    </div>
  );
}

/* ---------- Seite: einzelnes Bundesland ---------- */
export function LandeswettbewerbSeite({ land, gehe }) {
  const d = LAENDER[land];
  if (!d) return null;
  const termine = [...(d.aktuell.termine || []), ...(d.landTermine || [])];
  const linksAktuell = [...(d.aktuell.links || []), ...(d.extraLinks || [])];
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <button onClick={() => { gehe({ ansicht: "landeswettbewerbe" }); window.scrollTo(0, 0); }}
        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, marginBottom: 16 }}>
        ← {L("Alle Bundesländer", "All states")}
      </button>
      <StatusKarte kicker={L("AKTUELLE RUNDE", "CURRENT ROUND")} titel={t(d.aktuell.titel)}>
        {termine.length > 0 && <Termine liste={termine} />}
        <a href={encodeURI(d.web)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 14, fontSize: 14, fontWeight: 600, color: C.flaggold }}>
          {L("Zur offiziellen Seite →", "Go to the official website →")}
        </a>
      </StatusKarte>

      <div style={{ marginTop: 24 }}>
        <Kicker>{d.art === "lw" ? L("Landeswettbewerb", "State competition") : L("Mathematik-Olympiade", "Mathematical Olympiad")}</Kicker>
        <H2>{t(d.wettbewerb)}</H2>
        {d.info && <Absatz>{t(d.info)}</Absatz>}
        {d.hinweis && <Absatz>{t(d.hinweis)}</Absatz>}
        <div style={{ ...karteStil, padding: "4px 16px" }}>
          {[[L("Veranstalter", "Organiser"), d.traeger], [L("Für wen", "Who can take part"), d.stufen], [L("Ablauf", "Format"), d.format]].filter(([, v]) => v).map(([a, v], i, arr) => (
            <div key={a} style={{ padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.linie}` : "none" }}>
              <span style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: C.grau, textTransform: "uppercase" }}>{a}</span>
              <span style={{ display: "block", fontSize: 14.5, color: C.tinte, lineHeight: 1.55, marginTop: 3 }}>{t(v)}</span>
            </div>
          ))}
        </div>
      </div>

      <Trenner />
      <Kicker>{L("Aktuelle Aufgaben", "Current tasks")}</Kicker>
      {linksAktuell.length ? <LinkListe links={[...linksAktuell, [["Offizielle Seite", "Official website"], d.web]]} />
        : <LinkListe links={[[["Offizielle Seite – Aufgaben folgen", "Official website – tasks to follow"], d.web]]} />}

      <Trenner />
      <Kicker>{L("Zum Üben: letztes Jahr", "For practice: last year")}</Kicker>
      <H2>{t(d.vorjahr.titel)}</H2>
      <LinkListe links={d.vorjahr.links} />
      <Hinweis />
    </div>
  );
}

/* ---------- Kleine Grafiken für die Startseiten-Kacheln ---------- */

/* Medaillenschrank für „Mathe-Wettbewerbe“: sechs Glasfächer, ein Fach pro Jahr –
   Bronze · Gold+Gold · Gold+Gold · Gold+Bronze · Gold+Silber · Gold+Pokal. */
const METALL = {
  gold: ["#FFE58A", "#EDBB00", "#A67C00", "#7A5A00"],
  silber: ["#FFFFFF", "#D3D9E3", "#8E99AA", "#5E6878"],
  bronze: ["#F4C79A", "#C8813F", "#8A5220", "#5E3412"],
};
const FAECHER = [["bronze"], ["gold", "gold"], ["gold", "gold"], ["gold", "bronze"], ["gold", "silber"], ["gold", "pokal"]];

export function MedaillenschrankLogo() {
  // Hochformat 2 × 3, links in der Grafikfläche – rechts unten sitzt der Plus-Knopf.
  const fw = 60, fh = 46, x0 = 13, y0 = 13, gap = 5;
  const medaille = (cx, top, art, key) => {
    const [hell, , dunkel, text] = METALL[art];
    const cy = top + 28;
    return (
      <g key={key}>
        <path d={`M${cx - 6} ${top + 3} L${cx} ${cy - 8} L${cx + 6} ${top + 3}`} fill="none" stroke="#1B62AE" strokeWidth="4.2" strokeLinejoin="round" />
        <path d={`M${cx - 6} ${top + 3} L${cx - 1.6} ${cy - 10}`} stroke="#E8EEF7" strokeWidth="1.3" />
        <circle cx={cx} cy={cy} r="9.5" fill={`url(#ms-${art})`} stroke={dunkel} strokeWidth="1.1" />
        <circle cx={cx} cy={cy} r="6.4" fill="none" stroke={hell} strokeWidth="0.8" opacity="0.8" />
        <text x={cx} y={cy + 3} textAnchor="middle" style={{ fontSize: 8.5, fontWeight: 800, fill: text, fontFamily: "Montserrat, system-ui, sans-serif" }}>
          {art === "gold" ? "1" : art === "silber" ? "2" : "3"}
        </text>
      </g>
    );
  };
  const pokal = (cx, top, key) => (
    <g key={key}>
      <path d={`M${cx - 9} ${top + 7} h18 v5 a9 9 0 0 1 -18 0 Z`} fill="url(#ms-gold)" stroke="#7A5A00" strokeWidth="1" />
      <path d={`M${cx - 9} ${top + 9.5} h-3.5 a4 4 0 0 0 4.5 6.5 M${cx + 9} ${top + 9.5} h3.5 a4 4 0 0 1 -4.5 6.5`} fill="none" stroke="#A67C00" strokeWidth="1.5" />
      <rect x={cx - 1.6} y={top + 20.5} width="3.2" height="6" fill="#A67C00" />
      <rect x={cx - 7} y={top + 26.5} width="14" height="4.5" rx="1.1" fill="url(#ms-gold)" stroke="#7A5A00" strokeWidth="0.8" />
      <rect x={cx - 8.5} y={top + 31} width="17" height="4" rx="1" fill="#5A4300" />
      <path d={`M${cx - 5.5} ${top + 9.5} q 1 6 4.5 8`} stroke="#FFFFFF" strokeWidth="1.1" fill="none" opacity="0.6" />
    </g>
  );
  const W = x0 * 2 + fw * 2 + gap, H = y0 + fh * 3 + gap * 2 + 22;
  return (
    <div style={{ width: "100%", height: "100%", padding: "9px 56px 9px 10px", boxSizing: "border-box" }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
        <defs>
          {Object.entries(METALL).map(([k, [hell, mitte, dunkel]]) => (
            <radialGradient key={k} id={`ms-${k}`} cx="38%" cy="32%" r="75%">
              <stop offset="0" stopColor={hell} /><stop offset="0.55" stopColor={mitte} /><stop offset="1" stopColor={dunkel} />
            </radialGradient>
          ))}
          <linearGradient id="ms-korpus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0E2F5E" /><stop offset="1" stopColor="#061A38" /></linearGradient>
          <linearGradient id="ms-glas" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" /><stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.04" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        {/* Korpus mit Sockel */}
        <rect x="3" y="3" width={W - 6} height={H - 12} rx="8" fill="url(#ms-korpus)" stroke={C.flaggold} strokeWidth="1.8" />
        <rect x="9" y={H - 12} width={W - 18} height="9" rx="2.5" fill="#04122A" stroke="rgba(237,187,0,0.55)" strokeWidth="1" />
        {FAECHER.map((inhalt, i) => {
          const sp = i % 2, ze = Math.floor(i / 2);
          const x = x0 + sp * (fw + gap), y = y0 + ze * (fh + gap);
          const mitte = x + fw / 2;
          const pos = inhalt.length === 1 ? [mitte] : [mitte - 13, mitte + 13];
          return (
            <g key={i}>
              <rect x={x} y={y} width={fw} height={fh} rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.28)" strokeWidth="0.9" />
              <rect x={x + 3} y={y + fh - 6} width={fw - 6} height="3" rx="1.2" fill="rgba(255,255,255,0.18)" />
              {inhalt.map((art, k) => (art === "pokal" ? pokal(pos[k], y + 4, k) : medaille(pos[k], y + 1, art, k)))}
              <rect x={x} y={y} width={fw} height={fh} rx="4" fill="url(#ms-glas)" />
              <path d={`M${x + 7} ${y + fh - 5} L${x + 19} ${y + 5}`} stroke="#FFFFFF" strokeWidth="2" opacity="0.13" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* Logo-Kachel „Bundeswettbewerb Mathematik“: geviertelte Fläche mit Kreis,
   Quadrat, Dreieck und Karo – eigene Grafik im Stil der App. */
export function BwmLogo() {
  const feld = (x, y, inhalt, hg) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="66" height="66" fill={hg} />
      {inhalt}
    </g>
  );
  const w = "#FFFFFF", g = C.flaggold;
  return (
    <svg viewBox="0 0 230 190" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      <defs><clipPath id="bwm-rund"><rect x="49" y="29" width="132" height="132" rx="16" /></clipPath></defs>
      <g clipPath="url(#bwm-rund)">
        {feld(49, 29, <circle cx="33" cy="33" r="19" fill="none" stroke={g} strokeWidth="5" />, "rgba(255,255,255,0.10)")}
        {feld(115, 29, <rect x="15" y="15" width="36" height="36" fill={w} />, "rgba(237,187,0,0.22)")}
        {feld(49, 95, <path d="M33 13 L53 51 H13 Z" fill={w} />, "rgba(237,187,0,0.22)")}
        {feld(115, 95, <path d="M33 11 L55 33 L33 55 L11 33 Z" fill="none" stroke={g} strokeWidth="5" strokeLinejoin="round" />, "rgba(255,255,255,0.10)")}
      </g>
      <rect x="49" y="29" width="132" height="132" rx="16" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
      <path d="M115 29 V161 M49 95 H181" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
    </svg>
  );
}

export function MedailleLogo() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }} aria-hidden="true">
      <path d="M36 10 L50 40 L64 10" fill="none" stroke="#C9D3E2" strokeWidth="9" strokeLinejoin="round" />
      <path d="M36 10 L50 40" stroke={C.flaggold} strokeWidth="5" />
      <circle cx="50" cy="60" r="24" fill="url(#mgold)" stroke="#A67C00" strokeWidth="2" />
      <defs><linearGradient id="mgold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE58A" /><stop offset="0.5" stopColor="#EDBB00" /><stop offset="1" stopColor="#A67C00" /></linearGradient></defs>
      <text x="50" y="68" textAnchor="middle" style={{ fontSize: 22, fontWeight: 800, fill: "#5A4300", fontFamily: "inherit" }}>1</text>
    </svg>
  );
}
/* Medaillenschrank: sechs Fächer, ein Jahr pro Fach (Bronze · 2× Gold · 2× Gold · Gold+Bronze · Gold+Silber · Gold+Pokal) */
const MED_FARBE = {
  gold: ["#FFE58A", "#EDBB00", "#A67C00"], silber: ["#FFFFFF", "#C9D3E2", "#7D8A9C"], bronze: ["#F3C29B", "#C77B3E", "#7A4320"],
};
function SchrankMedaille({ x, y, art }) {
  const id = `msch-${art}`;
  return (
    <g>
      <path d={`M${x - 3.2} ${y - 11} L${x} ${y - 4.5} L${x + 3.2} ${y - 11}`} fill="none" stroke="#4E7BC4" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx={x} cy={y} r="5.6" fill={`url(#${id})`} stroke={MED_FARBE[art][2]} strokeWidth="0.9" />
      <circle cx={x} cy={y} r="3.4" fill="none" stroke={MED_FARBE[art][2]} strokeWidth="0.5" opacity="0.6" />
    </g>
  );
}
function SchrankPokal({ x, y }) {
  return (
    <g>
      <path d={`M${x - 5.5} ${y - 9} H${x + 5.5} V${y - 6} Q${x + 5.5} ${y} ${x} ${y + 0.5} Q${x - 5.5} ${y} ${x - 5.5} ${y - 6} Z`} fill="url(#msch-gold)" stroke="#A67C00" strokeWidth="0.8" />
      <path d={`M${x - 5.5} ${y - 7.5} q-3.2 0.4 -2.6 3.4 q0.5 2.2 3.2 2.4 M${x + 5.5} ${y - 7.5} q3.2 0.4 2.6 3.4 q-0.5 2.2 -3.2 2.4`} fill="none" stroke="#C99A00" strokeWidth="1.1" />
      <rect x={x - 1.1} y={y + 0.5} width="2.2" height="3.4" fill="#C99A00" />
      <rect x={x - 4} y={y + 3.9} width="8" height="2.4" rx="0.6" fill="#A67C00" />
    </g>
  );
}
export function MedaillenschrankLogo() {
  // Fächer: Spalte (0/1), Reihe (0–2); jedes Fach = ein Jahr
  const FAECHER = [["bronze"], ["gold", "gold"], ["gold", "gold"], ["gold", "bronze"], ["gold", "silber"], ["gold", "pokal"]];
  const X0 = 17, Y0 = 11, B = 33, H = 26;
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }} aria-hidden="true">
      <defs>
        {Object.entries(MED_FARBE).map(([art, [a, b, c]]) => (
          <linearGradient key={art} id={`msch-${art}`} x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor={a} /><stop offset="0.55" stopColor={b} /><stop offset="1" stopColor={c} /></linearGradient>
        ))}
        <linearGradient id="msch-glas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.16" /><stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.03" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0.1" /></linearGradient>
      </defs>
      {/* Korpus */}
      <rect x={X0 - 4} y={Y0 - 5} width={2 * B + 8} height={3 * H + 9} rx="4" fill="#0B1838" stroke="#C9D3E2" strokeWidth="1.6" />
      <rect x={X0 - 6} y={Y0 + 3 * H + 3} width={2 * B + 12} height="4" rx="1.5" fill="#C9D3E2" />
      {FAECHER.map((inhalt, i) => {
        const sp = i % 2, re = Math.floor(i / 2), fx = X0 + sp * B, fy = Y0 + re * H;
        const n = inhalt.length, mitte = fx + B / 2, abst = 11;
        return (
          <g key={i}>
            <rect x={fx + 1} y={fy + 1} width={B - 2} height={H - 2} rx="1.5" fill="#132A5C" />
            {/* Regalboden */}
            <rect x={fx + 1} y={fy + H - 3.2} width={B - 2} height="2.2" fill="#3A5A92" />
            {inhalt.map((art, k) => {
              const x = n === 1 ? mitte : mitte + (k === 0 ? -abst / 2 : abst / 2) * 1.25;
              return art === "pokal" ? <SchrankPokal key={k} x={x} y={fy + H - 10.5} /> : <SchrankMedaille key={k} x={x} y={fy + H - 10} art={art} />;
            })}
          </g>
        );
      })}
      {/* Glastüren */}
      <rect x={X0} y={Y0} width={2 * B} height={3 * H} fill="url(#msch-glas)" />
      <line x1={X0 + B} y1={Y0} x2={X0 + B} y2={Y0 + 3 * H} stroke="#C9D3E2" strokeWidth="1.2" />
      <circle cx={X0 + B - 2.6} cy={Y0 + 1.5 * H} r="1.1" fill="#EDBB00" /><circle cx={X0 + B + 2.6} cy={Y0 + 1.5 * H} r="1.1" fill="#EDBB00" />
    </svg>
  );
}
export function KarteLogo() {
  return (
    <svg viewBox={KARTE_VIEWBOX} style={{ width: "100%", height: "100%", padding: 8, boxSizing: "border-box" }} aria-hidden="true">
      {Object.entries(LAENDER_PFADE).map(([id, p]) => (
        <path key={id} d={p.d} fill={LAENDER[id].art === "lw" ? C.flaggold : "rgba(255,255,255,0.55)"} stroke="rgba(11,30,74,0.6)" strokeWidth="2" />
      ))}
    </svg>
  );
}
