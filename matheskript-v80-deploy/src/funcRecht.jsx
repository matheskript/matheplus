import React from "react";
import { C } from "./base1.jsx";

/* ======================================================================
   RECHTLICHES: Fußzeile, Impressum, AGB, Widerrufsbelehrungen.
   Texte nach dem Entwurf „Impressum und Vertragsbedingungen“ (Stand 1.10.2026);
   Betreiberhinweise sind nicht übernommen.

   >>> Alle Kontaktangaben stehen NUR hier. Platzhalter vor dem Livegang ersetzen. <<<
   ====================================================================== */

export const ANBIETER = {
  name: "Bastian Blumenröther",
  marke: "Mythos Mathe",
  strasse: "[Straße und Hausnummer]",
  ort: "[PLZ und Ort]",
  land: "Deutschland",
  email: "[E-Mail-Adresse]",
  telefon: "[Telefonnummer]",
  domain: "https://mythosmathe.de",
};

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
export function Fusszeile({ gehe }) {
  const link = (ansicht, text) => (
    <button type="button" onClick={() => { gehe({ ansicht }); window.scrollTo(0, 0); }}
      style={{ background: "none", border: "none", padding: "4px 0", color: "#C9D6EE", fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
      {text}
    </button>
  );
  return (
    <footer style={{ background: C.seeTief, marginTop: 24 }}>
      <div className="mx-auto px-6" style={{ maxWidth: 620, padding: "26px 24px 30px" }}>
        <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
          <span className="logo-silber">mythos</span><span className="logo-gold">mathe</span><span className="logo-silber">.de</span>
        </p>
        <p style={{ fontSize: 13, color: "#8FA3C8", fontWeight: 300, marginTop: 4, lineHeight: 1.6 }}>Mathe verstehen, nicht auswendig lernen.</p>
        <div style={{ height: 1, background: "rgba(255,255,255,0.12)", margin: "16px 0 12px" }} />
        <nav aria-label="Rechtliches" className="flex flex-wrap" style={{ columnGap: 20, rowGap: 2 }}>
          {link("impressum", "Impressum")}
          {link("agb", "AGB")}
          {link("widerruf", "Widerrufsbelehrung")}
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
      <H2>Verbraucherstreitbeilegung</H2>
      <P>Ich bin weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</P>
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
