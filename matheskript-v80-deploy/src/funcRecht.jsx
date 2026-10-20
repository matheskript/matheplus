import React, { useState } from "react";
import { MarkenLogo } from "./markenLogo.jsx";
import { C } from "./base1.jsx";
import { MedienEinstellungen } from "./funcExtern.jsx";
import { einwilligungLesen, einwilligungSetzen } from "./func9.jsx";

import { springe } from "./sprung.js";
import { ANGEBOT } from "./angebot.js";
/* ======================================================================
   RECHTLICHES: Fußzeile, Impressum, AGB, Widerrufsbelehrungen.
   Texte nach dem Entwurf „Impressum und Vertragsbedingungen“ (Stand 1.10.2026);
   Betreiberhinweise sind nicht übernommen.

   >>> Alle Kontaktangaben stehen NUR hier. Platzhalter vor dem Livegang ersetzen. <<<
   Datenschutzerklärung: DATENSCHUTZ unten. Bei neuen Diensten (Analyse, Mailversand, Zahlungsart …)
   hier einen Abschnitt ergänzen und STAND_DATENSCHUTZ anpassen.
   ====================================================================== */

export const ANBIETER = {
  name: "Bastian Blumenröther",
  marke: "Mythos Mathe",
  strasse: "Heinrich-von-Tettingen-Straße 24",
  ort: "78465 Konstanz",
  land: "Deutschland",
  email: "lakepoker.consulting@gmail.com",
  telefon: "0160 55 74 171",
  /* Umsatzsteuer-Identifikationsnummer (nicht die Steuer-ID!). Leer = Abschnitt „Umsatzsteuer“ im Impressum entfällt. */
  ustId: "",
  domain: "https://mythosmathe.de",
  /* Datenschutz-Aufsicht am Sitz des Anbieters (Baden-Württemberg) */
  aufsicht: "Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg, Lautenschlagerstraße 20, 70173 Stuttgart, www.baden-wuerttemberg.datenschutz.de",
  /* Region des Supabase-Projekts – im Supabase-Dashboard unter Project Settings → General prüfen */
  supabaseRegion: "[Serverstandort prüfen und eintragen – empfohlen: Frankfurt am Main (eu-central-1)]",
};

export const STAND_DATENSCHUTZ = "19. Oktober 2026";

const anschrift = `${ANBIETER.strasse}, ${ANBIETER.ort}, ${ANBIETER.land}`;

/* ---------- Bausteine ---------- */
const Seite = ({ children }) => (
  <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30, color: C.tinte }}>{children}</div>
);
const H2 = ({ children }) => <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3, margin: "28px 0 10px" }}>{children}</h2>;
const H3 = ({ children }) => <h3 style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.35, margin: "20px 0 6px" }}>{children}</h3>;
const P = ({ children, style }) => <p style={{ fontSize: 14.5, color: "#3B4763", fontWeight: 400, lineHeight: 1.75, marginBottom: 12, ...style }}>{children}</p>;
const Stand = () => <p style={{ fontSize: 12.5, color: C.hellgrau, marginBottom: 6 }}>Stand: 1. Oktober 2026</p>;

/* ---------- Fußzeile (auf jeder Ansicht) ---------- */
export function Fusszeile({ gehe, arbeitsmenue }) {
  const link = (ansicht, text) => (
    <button type="button" onClick={() => { gehe({ ansicht }); springe("seitenwechsel", () => window.scrollTo(0, 0)); }}
      style={{ background: "none", border: "none", padding: "4px 0", color: "#C9D6EE", fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
      {text}
    </button>
  );
  return (
    <footer style={{ background: C.seeTief, marginTop: 24 }}>
      <div className="mx-auto px-6" style={{ maxWidth: 620, padding: "26px 24px 30px" }}>
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ lineHeight: 1 }}><MarkenLogo groesse="min(36px, 8.4vw)" /></p>
          <p style={{ fontSize: "min(21px, 4.9vw)", fontWeight: 600, marginTop: 2, lineHeight: 1, letterSpacing: "0.03em", color: "#FFFFFF", whiteSpace: "nowrap" }}>
            System <span style={{ color: C.flaggold }}>+</span> Freude <span style={{ color: C.flaggold }}>=</span> Erfolg
          </p>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.12)", margin: "16px 0 12px" }} />
        <nav aria-label="Rechtliches" className="flex flex-wrap" style={{ columnGap: 20, rowGap: 2 }}>
          {link("impressum", "Impressum")}
          {link("datenschutz", "Datenschutz")}
          {ANGEBOT.agb && link("agb", "AGB")}
          {arbeitsmenue && arbeitsmenue({ background: "none", border: "none", padding: "4px 0", color: C.flaggold, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" })}
          {ANGEBOT.agb && link("widerruf", "Widerrufsbelehrung")}
          {link("lehrkraefte", "Für Lehrkräfte")}
          {link("spenden", "Unterstützen")}
        </nav>
        <p style={{ fontSize: 12.5, color: "#8FA3C8", marginTop: 12 }}>© 2026 Mythos Mathe · Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  );
}

/* ---------- Impressum ---------- */
export function ImpressumSeite() {
  return (
    <Seite>
      <H2>Angaben gemäß § 5 DDG</H2>
      <P>
        {ANBIETER.name}<br />
        {ANBIETER.marke}<br />
        {ANBIETER.strasse}<br />
        {ANBIETER.ort}<br />
        {ANBIETER.land}
      </P>
      <H2>Kontakt</H2>
      <P>E-Mail: {ANBIETER.email}<br />Telefon: {ANBIETER.telefon}</P>
      <H2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</H2>
      <P>{ANBIETER.name}, Anschrift wie oben.</P>
      {ANBIETER.ustId && (
        <>
          <H2>Umsatzsteuer</H2>
          <P>Umsatzsteuer-Identifikationsnummer nach § 27a UStG: {ANBIETER.ustId}</P>
        </>
      )}
      <H2>Verbraucherstreitbeilegung</H2>
      <P>Ich bin weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</P>
      <H2>Haftung für Links</H2>
      <P>Die App verlinkt an einigen Stellen auf Seiten anderer Anbieter, etwa von Mathematik-Wettbewerben. Für deren Inhalte ist der jeweilige Anbieter verantwortlich. Werden mir Rechtsverletzungen bekannt, entferne ich den Link umgehend.</P>
      <H2>Datenschutz</H2>
      <P>Wie wir mit personenbezogenen Daten umgehen, steht in der Datenschutzerklärung (Link unten auf jeder Seite).</P>
    </Seite>
  );
}

/* ---------- AGB ---------- */
const AGB = [
  ["1 Anbieter und Geltungsbereich", [
    `Diese Allgemeinen Geschäftsbedingungen gelten für Verträge und vereinbarte Nutzungsverhältnisse über die Lernplattform ${ANBIETER.marke} unter ${ANBIETER.domain}. Anbieter ist ${ANBIETER.name}, ${anschrift}, E-Mail ${ANBIETER.email}. Für eine weitere Domain gelten diese Bedingungen nur, soweit sie dort entsprechend einbezogen werden. Individuelle Vereinbarungen haben Vorrang.`,
    "Die kostenlose Nutzung frei zugänglicher Informationen begründet keine Zahlungspflicht. Für kostenpflichtige Angebote gelten die vor Bestellung dargestellte Leistungsbeschreibung und die bei Vertragsschluss einbezogenen Bedingungen. Diese AGB ersetzen die Datenschutzerklärung nicht.",
  ]],
  ["2 Vertragspartner und Schüler", [
    "Kostenpflichtige Angebote richten sich an volljährige Vertragspartner. Eltern oder andere hierzu berechtigte Erwachsene können für einen in der Bestellung benannten Schüler buchen. Der Erwachsene bleibt Vertragspartner; der benannte Schüler darf die vereinbarten Inhalte und Unterrichtstermine nutzen. Minderjährige schließen über den Bestellablauf selbst keine kostenpflichtigen Verträge. Für ein Schülerkonto gelten die gesondert mitgeteilten Registrierungsvoraussetzungen.",
  ]],
  ["3 Leistungsumfang", [
    "Produktbeschreibungen nennen Inhalte, Preis, Zugangsdauer, etwaige Nutzungsgrenzen und technische Voraussetzungen. Digitale Selbstlernprodukte enthalten die dort bezeichneten Videos, Texte, Aufgaben und bereitgestellten Lösungen. Sie enthalten keine persönliche Korrektur, fachliche Sprechstunde oder individuelle Analyse des Lernerfolgs. Individuelle KI-Auswertung ist kein Bestandteil dieser bezahlten Selbstlernprodukte.",
    "Live-Kurse bestehen aus den beschriebenen Unterrichtsterminen mit unmittelbarer Kommunikation zwischen Lehrendem und Teilnehmern. Es werden keine Aufzeichnungen bereitgestellt. Ein bestimmter Schulabschluss, eine bestimmte Note oder ein bestimmter Lernerfolg wird nicht garantiert. Die vereinbarte fachgerechte Leistung bleibt geschuldet.",
  ]],
  ["4 Bestellung und Vertragsschluss", [
    "Produktdarstellungen sind eine Aufforderung zur Bestellung. Der Kunde wählt das Angebot, trägt die erforderlichen Angaben ein und kann Eingabefehler vor Abgabe der Bestellung mit den dafür vorgesehenen Funktionen berichtigen. Mit Betätigung des Buttons „zahlungspflichtig bestellen“ gibt er ein verbindliches Vertragsangebot ab.",
    "Der Vertrag kommt durch eine ausdrücklich als Vertragsannahme bezeichnete E-Mail des Anbieters innerhalb von zwei Werktagen zustande. Eine automatische Eingangsbestätigung allein ist keine Annahme. Vor Annahme wird keine Zahlung eingezogen. Kommt innerhalb der Frist keine Annahme zustande, ist der Kunde nicht mehr an seine Bestellung gebunden. Vertragssprache ist Deutsch.",
    "Der Kunde erhält Vertragsinhalt, diese AGB und die anwendbaren Widerrufsinformationen per E-Mail. Der Vertragstext wird vom Anbieter gespeichert, aber nicht als dauerhaft abrufbares Kundenarchiv zugesagt. Der Kunde kann seine Unterlagen selbst speichern.",
  ]],
  ["5 Preise und Zahlung", [
    "Alle gegenüber Verbrauchern genannten Preise sind Endpreise einschließlich gesetzlich anfallender Steuern. Zusätzliche Kosten werden vor Bestellung ausdrücklich ausgewiesen. Die angebotenen Zahlungsmittel werden spätestens zu Beginn des Bestellvorgangs genannt. Einmalige Entgelte sind nach Vertragsannahme fällig. Die Leistung beginnt zum in der Produktbeschreibung genannten Zeitpunkt und bei vereinbarter Vorauszahlung nach Zahlungseingang. Bei Angeboten mit vereinbartem späterem Leistungsbeginn bleibt dieser Termin maßgeblich.",
  ]],
  ["6 Digitale Materialien und technische Voraussetzungen", [
    "Streamingzugang besteht für die vor Bestellung angegebene Dauer ab Freischaltung. Eine automatische Verlängerung erfolgt bei zeitlich befristeten Selbstlernprodukten nicht. Bereitgestellte Downloads können für die erlaubte private Nutzung gespeichert werden. Die Produktbeschreibung nennt Dateiformate, unterstützte Funktionen, wesentliche Kompatibilitätsanforderungen und gegebenenfalls technische Schutzmaßnahmen.",
    "Der Kunde benötigt ein geeignetes Gerät, einen unterstützten aktuellen Browser und Internetzugang; für Live-Termine zusätzlich die in der Beschreibung genannte Videokonferenzsoftware und erforderliche Audiofunktionen. Der Anbieter stellt gesetzlich erforderliche Aktualisierungen bereit und informiert über sie. Gesetzliche Mängelrechte bleiben unberührt.",
  ]],
  ["7 Live-Termine und Ausfälle", [
    "Zahl, Dauer, Thema, Termine und gegebenenfalls Mindestteilnehmerzahl werden vor Bestellung genannt. Teilnehmer können während des Unterrichts unmittelbar inhaltliche Fragen stellen und Antworten erhalten. Begleitmaterial dient den beschriebenen Terminen; ein zusätzlicher betreuter asynchroner Lehrgang wird durch diese Buchung nicht zugesagt.",
    "Ist eine Mindestteilnehmerzahl vorgesehen, wird die Entscheidung über die Durchführung spätestens sieben Kalendertage vor Kursbeginn mitgeteilt. Wird sie nicht erreicht, kann der Anbieter den Kurs absagen und erstattet bereits gezahlte Entgelte unverzüglich. Ein Ersatzkurs wird nur mit Zustimmung des Kunden gebucht.",
    "Bei einem vom Anbieter zu verantwortenden Ausfall oder einer erheblichen von ihm zu verantwortenden technischen Störung wird ein zumutbarer Ersatztermin angeboten. Kann die vereinbarte Leistung nicht erbracht werden oder ist der Ersatztermin dem Kunden nicht zumutbar, wird der betroffene Leistungsanteil erstattet. Weitergehende gesetzliche Rechte bleiben unberührt.",
    "Bei Verhinderung des Kunden erfolgt nicht automatisch eine Erstattung. Gesetzliche Widerrufs-, Kündigungs- und sonstige Rechte bleiben bestehen. Soweit der Anbieter wegen Nichtteilnahme Vergütung beanspruchen kann, werden ersparte Aufwendungen und anderweitiger Erwerb nach den gesetzlichen Vorschriften berücksichtigt. Kunden und Teilnehmer dürfen den Unterricht ohne vorherige Erlaubnis des Anbieters und aller betroffenen Personen nicht aufzeichnen.",
  ]],
  ["8 Kundenkonto und Sicherheit", [
    "Zugangsdaten sind vertraulich zu behandeln. Ein für einen benannten Schüler gebuchter Zugang darf von diesem genutzt werden; eine Weitergabe an weitere Personen ist nicht erlaubt. Bei Verdacht auf Fremdzugriff soll der Anbieter unverzüglich informiert werden. Der Anbieter kann bei einem konkreten erheblichen Sicherheitsrisiko den betroffenen Zugang vorübergehend sperren, soweit dies erforderlich und verhältnismäßig ist. Er informiert den Kunden und hebt die Sperre nach Wegfall des Grundes auf. Gesetzliche Leistungs- und Erstattungsansprüche bleiben bestehen.",
  ]],
  ["9 Nutzungsrechte und Uploads", [
    "Der Kunde und der benannte Schüler erhalten das einfache, nicht übertragbare Recht, die erworbenen Materialien und Werkzeuge im vereinbarten Umfang privat zu Lernzwecken zu nutzen. Downloads dürfen für diesen Zweck gespeichert und ausgedruckt werden. Weiterverkauf, öffentliche Verbreitung und die Bereitstellung an unberechtigte Dritte sind nicht gestattet. Gesetzlich erlaubte Nutzungen bleiben unberührt.",
    "Wer Inhalte hochlädt, muss zur dafür notwendigen Verarbeitung berechtigt sein. Personenbezogene Angaben Dritter sind vor einem Upload zu entfernen, soweit sie nicht für den angeforderten Zweck erforderlich und rechtmäßig verarbeitet werden dürfen. Der Nutzer räumt nur die zur angeforderten technischen Verarbeitung erforderlichen Nutzungsrechte ein. Ein Recht zur öffentlichen Veröffentlichung oder zum Modelltraining wird durch diese AGB nicht eingeräumt.",
  ]],
  ["10 Kostenlose KI-Funktionen", [
    "Soweit auf der Plattform kostenlose KI-Funktionen freigeschaltet sind, werden sie als solche gekennzeichnet. Sie sind kein Bestandteil der bezahlten Selbstlernprodukte oder Live-Kurse. Ihre Nutzung setzt die jeweils angezeigten Voraussetzungen voraus. Die konkret angegebenen Verarbeitungsinformationen sind in der Datenschutzerklärung beschrieben.",
    "KI-generierte Vorschläge können Fehler enthalten und sollen anhand der zugrunde liegenden Rechenregeln geprüft werden. Sie ersetzen keine amtliche Leistungsbewertung. Dieser Hinweis beschränkt keine gesetzlichen Rechte und befreit den Anbieter nicht von der Verantwortung für ausdrücklich zugesagte Eigenschaften.",
  ]],
  ["11 Vertragsende", [
    "Für befristete Selbstlernprodukte endet der Streamingzugang ohne Kündigung nach der vereinbarten Dauer; zulässig gespeicherte Downloads dürfen weiter privat genutzt werden.",
  ]],
  ["12 Widerruf und gesetzliche Rechte", [
    "Verbrauchern stehen die gesetzlichen Widerrufsrechte zu. Einzelheiten ergeben sich aus der gesonderten, für das konkrete Produkt bereitgestellten Widerrufsbelehrung und dem Musterformular. Eine gesonderte ausdrückliche Erklärung ist erforderlich, soweit Leistungen vor Ablauf der Widerrufsfrist beginnen sollen und dadurch gesetzliche Folgen ausgelöst werden. Gesetzliche Mängelrechte für digitale Produkte werden nicht eingeschränkt.",
  ]],
  ["13 Haftung", [
    "Der Anbieter haftet nach den gesetzlichen Vorschriften. Insbesondere werden die Haftung für Vorsatz und grobe Fahrlässigkeit sowie wegen Verletzung von Leben, Körper oder Gesundheit nicht eingeschränkt. Diese AGB enthalten keinen pauschalen Haftungsausschluss für Inhalte, KI-Ausgaben oder technische Fehler.",
  ]],
  ["14 Anwendbares Recht", [
    "Es gilt deutsches Recht. Bei Verbrauchern bleiben zwingende Schutzvorschriften des Staates ihres gewöhnlichen Aufenthalts erhalten. Es wird kein ausschließlicher Gerichtsstand für Verbraucher vereinbart.",
  ]],
  ["15 Verbraucherschlichtung", [
    "Der Anbieter ist weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
  ]],
];

export function AGBSeite() {
  return (
    <Seite>
      <Stand />
      {AGB.map(([titel, absaetze]) => (
        <section key={titel}>
          <H2>{titel.replace(/^(\d+) /, "§ $1 ")}</H2>
          {absaetze.map((a, i) => <P key={i}>{a}</P>)}
        </section>
      ))}
    </Seite>
  );
}

/* ---------- Widerrufsbelehrungen ---------- */
const kontaktWiderruf = `${ANBIETER.name}, ${anschrift}, E-Mail: ${ANBIETER.email}, Telefon: ${ANBIETER.telefon}`;

function Belehrung({ dienstleistung }) {
  return (
    <>
      <H3>Widerrufsrecht</H3>
      <P>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</P>
      <P>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ({kontaktWiderruf}) mittels einer eindeutigen Erklärung (zum Beispiel ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das unten stehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.</P>
      <P>Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</P>
      <H3>Folgen des Widerrufs</H3>
      <P>Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.</P>
      {dienstleistung ? (
        <>
          <P>Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.</P>
          <H3>Vorzeitiges Erlöschen bei entgeltlichen Dienstleistungen</H3>
          <P>Das Widerrufsrecht erlischt bei vollständiger Erbringung der Dienstleistung, wenn Sie vor Leistungsbeginn ausdrücklich zugestimmt haben, dass wir vor Ablauf der Widerrufsfrist beginnen, und Ihre Kenntnis davon bestätigt haben, dass Ihr Widerrufsrecht bei vollständiger Vertragserfüllung durch uns erlischt.</P>
        </>
      ) : (
        <>
          <H3>Vorzeitiges Erlöschen bei entgeltlichen digitalen Inhalten</H3>
          <P>Das Widerrufsrecht erlischt bei nicht auf einem körperlichen Datenträger bereitgestellten digitalen Inhalten, wenn wir mit der Vertragserfüllung begonnen haben, nachdem Sie ausdrücklich zugestimmt haben, dass wir vor Ablauf der Widerrufsfrist mit der Vertragserfüllung beginnen, Sie Ihre Kenntnis davon bestätigt haben, dass mit Beginn der Vertragserfüllung Ihr Widerrufsrecht erlischt, und wir Ihnen die gesetzlich erforderliche Vertragsbestätigung zur Verfügung gestellt haben.</P>
        </>
      )}
    </>
  );
}

export function WiderrufSeite() {
  const linie = { borderBottom: `1px solid ${C.hellgrau}`, height: 26, marginBottom: 6 };
  return (
    <Seite>
      <Stand />
      <div style={{ background: C.weiss, borderRadius: 14, padding: "4px 18px 8px", boxShadow: "0 2px 12px rgba(15,26,51,0.06)", marginTop: 14 }}>
        <H2>Widerrufsbelehrung für Live-Unterricht und Dienstleistungen</H2>
        <Belehrung dienstleistung />
      </div>
      <div style={{ background: C.weiss, borderRadius: 14, padding: "4px 18px 8px", boxShadow: "0 2px 12px rgba(15,26,51,0.06)", marginTop: 14 }}>
        <H2>Widerrufsbelehrung für digitale Inhalte</H2>
        <Belehrung />
      </div>
      <div style={{ background: C.weiss, borderRadius: 14, padding: "4px 18px 14px", boxShadow: "0 2px 12px rgba(15,26,51,0.06)", marginTop: 14 }}>
        <H2>Muster-Widerrufsformular</H2>
        <P>(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)</P>
        <P>An {ANBIETER.name}, {anschrift}, E-Mail: {ANBIETER.email}</P>
        <P>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)</P>
        {["Bestellt am (*)/erhalten am (*)", "Name des/der Verbraucher(s)", "Anschrift des/der Verbraucher(s)", "Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)", "Datum"].map((t) => (
          <div key={t} style={{ marginBottom: 10 }}>
            <div style={linie} />
            <p style={{ fontSize: 12.5, color: C.grau }}>{t}</p>
          </div>
        ))}
        <p style={{ fontSize: 12.5, color: C.grau }}>(*) Unzutreffendes streichen.</p>
      </div>
    </Seite>
  );
}

/* ======================================================================
   DATENSCHUTZERKLÄRUNG
   Aufbau: Kurzfassung für Schüler → Verantwortlicher → je Verarbeitung ein Abschnitt
   (was, wozu, Rechtsgrundlage, Empfänger, Dauer) → Rechte → Einstellungen auf diesem Gerät.
   ====================================================================== */
const DRITTLAND = "Soweit Daten in die USA gelangen, stützen wir die Übermittlung auf den Angemessenheitsbeschluss der EU-Kommission zum EU-US Data Privacy Framework, sofern der Anbieter danach zertifiziert ist, und im Übrigen auf die EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).";

const KURZ = [
  "Die App funktioniert ohne Konto. Dann bleibt alles, was du übst, nur auf deinem Gerät.",
  "Mit Konto speichern wir deinen Lernstand, damit er auf jedem Gerät da ist. Bist du unter 16, nur wenn deine Eltern zustimmen.",
  "Mathilda (KI) nutzt du nur, wenn du vorher zustimmst. Deine Fragen und Fotos gehen dafür an die Firma Anthropic. Fotos speichern wir nicht.",
  "Wir zeigen keine Werbung, verkaufen keine Daten und setzen keine Tracking- oder Analysedienste ein.",
  "Videos von YouTube laden erst, wenn du auf „Video laden“ tippst.",
  "Du kannst jederzeit alle Daten aus deinem Konto herunterladen oder dein Konto komplett löschen.",
];

const DATENSCHUTZ = [
  ["Verantwortlicher", [
    `Verantwortlich für die Datenverarbeitung ist ${ANBIETER.name} (${ANBIETER.marke}), ${anschrift}, E-Mail: ${ANBIETER.email}, Telefon: ${ANBIETER.telefon}. Ein Datenschutzbeauftragter ist gesetzlich nicht vorgeschrieben und nicht benannt. Bei Fragen zum Datenschutz schreiben Sie bitte an die genannte E-Mail-Adresse.`,
  ]],
  ["Grundsätze", [
    "Wir verarbeiten so wenig Daten wie möglich. Die Lernwerkzeuge laufen im Browser; ohne Konto verlassen Ihre Übungsdaten das Gerät nicht. Wir setzen keine Werbung, keine Tracking-Cookies, keine Analyse- oder Profiling-Dienste ein und verkaufen keine Daten. Automatisierte Entscheidungen im Sinne von Art. 22 DSGVO finden nicht statt.",
    "Die Angebote richten sich vor allem an Schüler. Wir achten deshalb besonders auf verständliche Informationen (oben die Kurzfassung) und holen bei Kindern unter 16 Jahren die Zustimmung der Eltern ein (Abschnitt „Kinder und Jugendliche“).",
  ]],
  ["Aufruf der Website und Hosting", [
    "Die Website und die Serverfunktionen werden bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, betrieben. Beim Aufruf verarbeitet Vercel technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse, übertragene Datenmenge, Browser und Betriebssystem sowie die verweisende Seite. Diese Server-Protokolle dienen der Auslieferung, Stabilität und Sicherheit und werden von Vercel nach kurzer Zeit (in der Regel wenige Tage) gelöscht.",
    "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse liegt im sicheren und fehlerfreien Betrieb. Mit Vercel besteht ein Auftragsverarbeitungsvertrag. " + DRITTLAND,
    "Schriften (Montserrat, Roboto Condensed, Caveat) und alle Programmbibliotheken liefern wir von unserem eigenen Server aus. Es besteht keine Verbindung zu Google Fonts oder anderen Schrift- und Code-Verteilern.",
  ]],
  ["Speicherung auf Ihrem Gerät", [
    "Die App speichert Lernstand, Einstellungen und Zwischenstände im lokalen Speicher Ihres Browsers (localStorage), zum Beispiel Trainingsergebnisse, Wiederholungsplan, gewählte Klasse, Trainingsplan, Fortschritt in „Mathe entdecken“, Ihre Zustimmungen und eine zufällige Gerätekennung zur Begrenzung von KI-Anfragen ohne Konto. Diese Daten bleiben auf dem Gerät, solange Sie sie nicht löschen (Browserdaten löschen genügt).",
    "Ist der Passwortschutz der Testphase eingeschaltet, setzt die Seite dafür Cookies (mm_zugang, mm_willkommen, mm_gast). Angemeldete Nutzer erhalten ein Anmelde-Token im lokalen Speicher. Diese Speicherungen sind für den von Ihnen gewünschten Dienst unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG) und benötigen keine Einwilligung. Andere Cookies setzen wir nicht.",
  ]],
  ["Kundenkonto", [
    `Für das Konto nutzen wir Supabase (Supabase Inc., 970 Toa Payoh North #07-04, Singapur 318992) als Datenbank- und Anmeldedienst im Auftrag. Serverstandort: ${ANBIETER.supabaseRegion}. Mit Supabase besteht ein Auftragsverarbeitungsvertrag; soweit Supabase oder Unterauftragnehmer Daten außerhalb der EU verarbeiten, gelten die EU-Standardvertragsklauseln.`,
    "Gespeichert werden: E-Mail-Adresse und Passwort (verschlüsselt) bzw. die Kennung Ihres Google- oder Facebook-Kontos, Name, Rolle (Schüler, Elternteil, Lehrkraft, Nachhilfelehrer), bei Schülern Anrede, Altersangabe (unter oder ab 16) und auf Wunsch Schulform, Klassenstufe und Mathenoten, außerdem Ihr Empfehlungslink, wer Sie eingeladen hat, Ihr Plan und Verknüpfungen zu Eltern, Kindern und Klassen.",
    "Rechtsgrundlage ist die Erfüllung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO). Freiwillige Angaben wie Noten verarbeiten wir auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie durch Löschen der Angabe jederzeit widerrufen können. Die Daten bleiben gespeichert, bis Sie das Konto löschen.",
  ]],
  ["Anmeldung mit Google oder Facebook", [
    "Wählen Sie „Mit Google anmelden“ oder „Mit Facebook anmelden“, werden Sie zum jeweiligen Anbieter weitergeleitet (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland; Meta Platforms Ireland Limited, Merrion Road, Dublin 4, Irland). Wir erhalten von dort nur Ihren Namen, Ihre E-Mail-Adresse und eine Kennung. Was der Anbieter selbst verarbeitet, regeln dessen Datenschutzhinweise. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO; die Anmeldung per E-Mail und Passwort steht immer als Alternative bereit.",
  ]],
  ["Lernstand im Konto", [
    "Mit Konto gleichen wir Ihren Lernstand zwischen Geräten ab: Kompetenzen, Trainings- und Prüfungsergebnisse, Wiederholungsplan, Tagespläne, Kopfrechentraining, Fortschritt in „Mathe entdecken“ einschließlich eigener Reflexionstexte und Ergebnisse im Performance-Lab. Fotos und Mathilda-Gespräche speichern wir nicht im Konto.",
    "Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, bei Schülern unter 16 Jahren die Einwilligung der Eltern (Art. 6 Abs. 1 lit. a i. V. m. Art. 8 DSGVO). Die Daten bleiben bis zur Löschung des Kontos bzw. bis zum Widerruf der Einwilligung gespeichert.",
  ]],
  ["Eltern, Lehrkräfte und Klassen", [
    "Ein Schüler kann Eltern über einen persönlichen Link mit seinem Konto verbinden. Verbundene Eltern sehen Aktivität, Lernstand, Fortschritt und eingetragene Noten ihres Kindes und können einen wöchentlichen Bericht per E-Mail erhalten.",
    "Tritt ein Schüler mit einem Code der Klasse einer Lehrkraft oder eines Nachhilfelehrers bei, sieht diese Person Name, Aktivität und Lernfortschritt des Schülers. In der Klassen-Challenge sehen Mitschüler nur einen selbst gewählten Spitznamen und Punkte, und nur, wenn der Schüler das einschaltet. Lehrkräfte, die die App im Unterricht einsetzen, sind für die Einhaltung der schulrechtlichen Vorgaben selbst verantwortlich.",
    "Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, bei Schülern unter 16 die Einwilligung der Eltern. Jede Verbindung kann jederzeit im Konto gelöst werden; danach endet die Einsicht sofort.",
  ]],
  ["Mathilda – KI-Tutor", [
    "Mathilda beantwortet Fragen, prüft Rechenwege und wertet Fotos von Rechenblättern aus. Dafür übermitteln wir Ihre Eingaben, das Foto (vorher auf Ihrem Gerät verkleinert), Vorname, Klasse und einen kurzen Auszug aus dem Lernstand an Anthropic PBC, 548 Market Street, PMB 90375, San Francisco, CA 94104, USA (Dienst „Claude“). Anthropic verarbeitet die Daten als Auftragsverarbeiter, verwendet sie nicht zum Training seiner Modelle und speichert sie nur befristet, etwa zur Missbrauchserkennung. " + DRITTLAND,
    "Bei Mythos Mathe werden Fotos und Gesprächsinhalte nicht gespeichert; das Ergebnis bleibt auf Ihrem Gerät. Mit Konto zählen wir nur die Zahl der Anfragen pro Tag (Kontingent); diese Zählung löschen wir nach 60 Tagen. Ohne Konto begrenzen wir Anfragen anhand der zufälligen Gerätekennung und der IP-Adresse; das geschieht nur im Arbeitsspeicher des Servers.",
    "Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie vor der ersten Nutzung erteilen und jederzeit unten unter „Deine Einstellungen“ widerrufen können. Unter 16 Jahren muss ein Elternteil zustimmen. Bitte geben Sie keine Namen, Gesichter oder sonstigen persönlichen Angaben in Fotos oder Texten ein. KI-Antworten können Fehler enthalten.",
    "Die Spracheingabe nutzt die Spracherkennung Ihres Browsers. Je nach Browser verarbeitet dessen Hersteller dabei die Aufnahme (bei Google Chrome etwa Google). Das Vorlesen erfolgt auf Ihrem Gerät.",
  ]],
  ["Klausurbriefkasten", [
    "Im Klausurbriefkasten können Schüler das Aufgabenblatt einer bereits zurückgegebenen Klassenarbeit fotografieren. Das Foto wird auf dem Gerät verkleinert und ausschließlich zur Auswertung an Anthropic PBC übermittelt (siehe „Mathilda – KI-Tutor“); Name und Lernstand werden dabei nicht mitgeschickt. Wir speichern das Foto nicht; es wird nach der Auswertung im Browser verworfen.",
    "Gespeichert wird nur, was der Nutzer vor dem Einwerfen angezeigt bekommt und bestätigt: Bundesland, Schulart, Klasse, freiwillig Schule und Monat, das Buchkapitel sowie die Struktur der Arbeit (Thema, Aufgabentypen in allgemeiner Beschreibung, Operatoren, Anforderungsbereiche, Punkte, Dauer, Hilfsmittel). Aufgabentexte, Zahlenwerte, Namen, Noten und Korrekturen werden nicht übernommen; die App fragt nicht nach Lehrkräften. Mit Konto ist die Meldung dem Konto zugeordnet und kann dort jederzeit gelöscht werden; nach Löschung des Kontos bleibt sie ohne Kontobezug als Statistik erhalten.",
    "Zweck ist, typische Prüfungsformen je Bundesland, Schulart und Klassenstufe zu erkennen und daraus eigene, neue Übungsklausuren zu erstellen. Schulbezogene Auswertungen werden nicht veröffentlicht. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) für die Übermittlung an Anthropic sowie die Erfüllung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO) für die gespeicherte Struktur; unter 16 Jahren gilt die Zustimmung der Eltern.",
  ]],
  ["Kinder und Jugendliche", [
    "Schüler geben beim Anlegen des Kontos an, ob sie jünger als 16 Jahre sind. Ist das der Fall, speichern wir zunächst nur Name, Rolle und Altersangabe. Lernstand, Noten, Klassen und Mathilda schalten erst die Eltern frei: Das Kind schickt ihnen einen persönlichen Link, auf dem sie die Informationen lesen und getrennt zustimmen können zu (1) Speichern des Lernens im Konto, (2) Mathilda und (3) Klassen. Als Nachweis speichern wir Name und E-Mail-Adresse des zustimmenden Elternteils, den Umfang, die Fassung des Textes und den Zeitpunkt. Eltern mit eigenem Elternkonto können auch dort zustimmen.",
    "Eltern können die Zustimmung jederzeit über denselben Link oder im Elternkonto ändern oder widerrufen. Nach einem Widerruf löschen wir die auf dieser Grundlage gespeicherten Lerndaten, Noten und Klassen-Mitgliedschaften; die App läuft dann nur noch auf dem Gerät weiter. Ohne Konto nutzt ein Kind unter 16 Mathilda nur, wenn ein Elternteil auf dem Gerät zustimmt.",
    "Kostenpflichtige Verträge schließen nur Volljährige ab (siehe AGB). Die Altersangabe beruht auf einer Selbstauskunft; erhalten wir Hinweise auf eine falsche Angabe, sperren wir das Speichern im Konto, bis die Eltern zugestimmt haben.",
  ]],
  ["Bezahlung", [
    "Kostenpflichtige Pläne bezahlen Sie über Stripe Payments Europe, Limited, 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, D02 H210, Irland. Die Zahlungsdaten geben Sie direkt bei Stripe ein; wir erhalten nur Name, E-Mail-Adresse, gebuchten Plan, Zahlungsstatus und eine Kundennummer, nie vollständige Karten- oder Kontodaten. Stripe verarbeitet Daten auch als eigener Verantwortlicher, etwa zur Betrugsvermeidung und zur Erfüllung gesetzlicher Pflichten; Daten können dabei an Stripe, Inc. in den USA gelangen. " + DRITTLAND,
    "Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und c DSGVO. Rechnungs- und Buchungsdaten bewahren wir so lange auf, wie es das Handels- und Steuerrecht verlangt (bis zu zehn Jahre).",
  ]],
  ["Freiwillige Spenden", [
    "Besucher können auf der Seite „Donate“ freiwillig zu den KI-Kosten beitragen. Die Zahlung läuft nicht über unsere Server: Mit einem Klick öffnet sich PayPal in einem neuen Fenster, oder Sie überweisen per SEPA an das dort genannte Konto. Zahlungsdaten geben Sie nur bei PayPal bzw. Ihrer Bank ein; PayPal verarbeitet sie als eigener Verantwortlicher nach seinen Datenschutzhinweisen, und Daten können dabei in Drittländer gelangen. Wir erhalten von der Zahlung Name, gegebenenfalls E-Mail-Adresse, Betrag und Zeitpunkt, soweit PayPal sie uns mitteilt oder sie auf dem Kontoauszug stehen. Beim Öffnen des PayPal-Links erfährt PayPal Ihre IP-Adresse; vorher wird nichts übertragen.",
    "Rechtsgrundlage für die Buchung der Zahlung ist Art. 6 Abs. 1 lit. c DSGVO (Buchführungspflichten), die Aufbewahrung richtet sich nach dem Handels- und Steuerrecht. Eine Spende ist ein freiwilliges Dankeschön: Sie begründet keinen Anspruch auf eine Gegenleistung, schaltet nichts frei und wird nicht mit Ihrem Lernstand verknüpft. Eine Spendenquittung stellen wir nicht aus.",
  ]],
  ["E-Mails und Benachrichtigungen", [
    "Eltern können einen wöchentlichen Lernbericht per E-Mail bestellen. Für den Versand nutzen wir Resend (Resend, Inc., San Francisco, USA) als Auftragsverarbeiter; übermittelt werden E-Mail-Adresse, Name und der Berichtsinhalt. " + DRITTLAND + " Jede Mail enthält einen Abmeldelink. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).",
    "Erlauben Sie Push-Benachrichtigungen (etwa Erinnerungen an fällige Wiederholungen), speichern wir die vom Browser erzeugte Empfangsadresse mit Ihrem Konto. Die Nachrichten laufen über den Push-Dienst Ihres Browsers (zum Beispiel Google, Apple oder Mozilla). Sie können Push jederzeit in den Browser- oder Geräteeinstellungen abschalten; die Adresse wird dann gelöscht.",
  ]],
  ["Videos", [
    "Kursvideos betten wir über Bunny Stream ein (BunnyWay d.o.o., Cesta komandanta Staneta 4A, 1215 Medvode, Slowenien, EU). Einige Erklärvideos stammen von YouTube (Google Ireland Limited, Irland); wir nutzen dafür den erweiterten Datenschutzmodus (youtube-nocookie.com).",
    "Beide laden erst, wenn Sie auf „Video laden“ tippen. Erst dann werden IP-Adresse und technische Daten an den Anbieter übertragen; bei YouTube können Daten auch an Google LLC in die USA gelangen. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Wenn Sie „immer laden“ wählen, merkt sich Ihr Gerät das; Sie können es unten widerrufen.",
  ]],
  ["Feedback", [
    "Über den Feedback-Knopf können Sie uns eine Sprach- oder Textnachricht schicken. Gespeichert werden die Nachricht, die Seite, auf der Sie waren, Sprache, Bildschirmgröße, Gerätetyp und – wenn angemeldet – Ihre Konto-Kennung. Wir nutzen das ausschließlich, um die App zu verbessern. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie vor dem Senden erteilen. Feedback löschen wir nach der Auswertung, spätestens nach zwölf Monaten.",
  ]],
  ["Anmeldung zu Veranstaltungen", [
    "Für den Elternabend speichern wir Name, E-Mail-Adresse, Personenzahl und auf Wunsch die Telefonnummer, um Plätze zu vergeben und Sie bei Änderungen zu informieren (Art. 6 Abs. 1 lit. b DSGVO). Die Daten löschen wir drei Monate nach der Veranstaltung.",
  ]],
  ["Links zu anderen Seiten", [
    "Die App enthält einfache Links, etwa zu Mathematik-Wettbewerben oder WhatsApp zum Teilen von Einladungen. Erst wenn Sie einen Link antippen, öffnet sich die fremde Seite; für sie gilt deren Datenschutzerklärung. Beim Teilen über WhatsApp übergeben wir nur den vorbereiteten Text an WhatsApp; ob und an wen Sie ihn senden, entscheiden Sie.",
  ]],
  ["Ihre Rechte", [
    "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21). Eine Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO).",
    "Im Konto unter „Deine Daten“ können Sie alle gespeicherten Daten als Datei herunterladen und das Konto vollständig löschen. Für alles Weitere genügt eine E-Mail an uns.",
    `Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der für uns zuständigen: ${ANBIETER.aufsicht}.`,
  ]],
  ["Änderungen", [
    "Wenn wir neue Funktionen einführen oder Dienstleister wechseln, passen wir diese Erklärung an. Bei wesentlichen Änderungen, die eine Einwilligung betreffen, fragen wir erneut.",
  ]],
];

/* Abschnitte, die nur erscheinen, solange das jeweilige Angebot eingeschaltet ist (angebot.js) – ohne Angebot keine Erklärung dazu */
const NUR_MIT_ANGEBOT = { "Bezahlung": "pro", "Anmeldung zu Veranstaltungen": "elternabend" };

function DeineEinstellungen({ gehe }) {
  const [ki, setKi] = useState(() => einwilligungLesen());
  return (
    <div style={{ background: C.weiss, borderRadius: 14, padding: "6px 18px 16px", boxShadow: "0 2px 12px rgba(15,26,51,0.06)", marginTop: 28 }} id="einstellungen">
      <H2>Deine Einstellungen auf diesem Gerät</H2>
      <H3>Mathilda (KI)</H3>
      {ki ? (
        <>
          <P style={{ marginBottom: 6 }}>Zustimmung erteilt am {new Date(ki.am).toLocaleDateString("de-DE")}{ki.unter16 ? " (durch ein Elternteil)" : ""}.</P>
          <button type="button" onClick={() => { einwilligungSetzen(null); setKi(null); }}
            style={{ background: "none", border: "none", padding: 0, color: C.signal, textDecoration: "underline", fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>Zustimmung widerrufen</button>
        </>
      ) : <P>Keine Zustimmung erteilt. Mathilda fragt dich, bevor sie das erste Mal etwas sendet.</P>}
      <H3>Videos anderer Anbieter</H3>
      <MedienEinstellungen />
      <H3>Konto</H3>
      <P style={{ marginBottom: 6 }}>Datenexport, Konto löschen und Eltern-Zustimmung findest du in deinem Konto.</P>
      {gehe && <button type="button" onClick={() => { gehe({ ansicht: "konto" }); springe("seitenwechsel", () => window.scrollTo(0, 0)); }}
        style={{ background: "none", border: "none", padding: 0, color: C.see, textDecoration: "underline", fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>Zum Konto</button>}
    </div>
  );
}

export function DatenschutzSeite({ gehe }) {
  return (
    <Seite>
      <p style={{ fontSize: 12.5, color: C.hellgrau, marginBottom: 6 }}>Stand: {STAND_DATENSCHUTZ}</p>
      <div style={{ background: C.himmel, borderRadius: 14, padding: "14px 18px 6px", marginTop: 10 }}>
        <p style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 8 }}>Kurz erklärt – für Schüler</p>
        <ul style={{ margin: "0 0 10px", paddingLeft: 18, fontSize: 14.5, color: "#3B4763", lineHeight: 1.7 }}>
          {KURZ.map((t) => <li key={t} style={{ marginBottom: 4 }}>{t}</li>)}
        </ul>
      </div>
      {DATENSCHUTZ.filter(([titel]) => !NUR_MIT_ANGEBOT[titel] || ANGEBOT[NUR_MIT_ANGEBOT[titel]]).map(([titel, absaetze], i) => (
        <section key={titel}>
          <H2>{i + 1}. {titel}</H2>
          {absaetze.map((a, j) => <P key={j}>{a}</P>)}
        </section>
      ))}
      <DeineEinstellungen gehe={gehe} />
    </Seite>
  );
}
