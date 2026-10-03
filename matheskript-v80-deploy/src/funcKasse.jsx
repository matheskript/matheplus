import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { DEMO, useKonto, hatRecht, kaufStarten, aboVerwalten, rechteNeuLaden, vertragMelden } from "./konto.js";
import { FREI_PRO_TAG, useTageszaehler } from "./zugang.js";

/* ======================================================================
   KASSE: Kaufdialog, Kaufbereich im Konto, Sperren, Kündigen/Widerrufen.
   Preise und Texte der Produkte stehen in PRODUKT_INFO; die echten Preise
   liegen in Stripe (api/_kasse.js) – beide müssen übereinstimmen.
   ====================================================================== */

const NAVY = "#0B1E4A";
const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const euro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
const datum = (iso) => (iso ? new Date(iso).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : "");

export const PRODUKT_INFO = {
  analysis1: {
    titel: "Selbstlernkurs Analysis 1 – Geraden",
    kurz: "Der komplette Videokurs: Steigung, Geradengleichungen, Schnittpunkte, parallele und senkrechte Geraden.",
    preis: 50, preisZeile: "50,00 € einmalig", knopf: "50,00 €",
    laufzeit: "Unbefristeter Zugang · kein Abo, keine Verlängerung",
    drin: ["Alle Lektionen mit Video, Erklärung und Merksatz", "Kurz-Check nach jeder Lektion mit Lösung", "„Jetzt üben“-Sprünge in die passenden Trainer"],
    nichtDrin: ["Keine persönliche Korrektur oder Sprechstunde", "Keine individuelle (KI-)Auswertung des Lernerfolgs"],
    sofortText: "Ich stimme ausdrücklich zu, dass vor Ablauf der Widerrufsfrist mit der Bereitstellung der digitalen Inhalte begonnen wird. Mir ist bekannt, dass ich mit Beginn der Vertragserfüllung mein Widerrufsrecht verliere.",
    ohneSofort: "Ohne dieses Häkchen schalten wir trotzdem sofort frei – dein 14-tägiges Widerrufsrecht bleibt dann vollständig bestehen.",
  },
  unlimited: {
    titel: "Mythos Mathe Unlimited",
    kurz: "Alle Trainingsgeräte in Üben und Prüfung ohne Tageslimit.",
    preis: 20, preisZeile: "20,00 € pro Monat", knopf: "20,00 € / Monat",
    laufzeit: "Monatlich · jederzeit zum Ende des laufenden Monats kündbar",
    drin: ["Gleichungslöser, Gleichungssysteme, Ableitungstrainer", "Rechenweg, Kurvendiskussion, Graph-Zuordnung, Kopfrechnen", "Klausurgenerator, Probeabitur, Modellieren", `Statt ${FREI_PRO_TAG} Aufgaben am Tag: so viele du willst`],
    nichtDrin: ["Keine persönliche Korrektur oder Sprechstunde", "KI-Funktionen (Mathilda) sind kostenlos und kein Teil des Abos"],
    sofortText: "Ich verlange ausdrücklich und stimme zu, dass vor Ablauf der Widerrufsfrist mit der Leistung begonnen wird. Mir ist bekannt, dass mein Widerrufsrecht mit vollständiger Vertragserfüllung erlischt. Über einen möglichen anteiligen Wertersatz im Widerrufsfall wurde ich informiert.",
    ohneSofort: "Ohne dieses Häkchen schalten wir trotzdem sofort frei – dein 14-tägiges Widerrufsrecht bleibt dann vollständig bestehen.",
  },
};

/* ---------- kleine Bausteine ---------- */
function Haken({ an, onClick, children, pflicht }) {
  return (
    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginBottom: 12 }}>
      <input type="checkbox" checked={an} onChange={onClick}
        style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0, accentColor: C.see, cursor: "pointer" }} />
      <span style={{ fontSize: 13.5, lineHeight: 1.55, color: C.tinte }}>
        {children}{pflicht && <span style={{ color: C.gruen, fontWeight: 700 }}> *</span>}
      </span>
    </label>
  );
}
const Liste = ({ punkte, farbe, zeichen }) => punkte.map((t, i) => (
  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
    <span style={{ color: farbe, fontWeight: 700, width: 14, flexShrink: 0 }}>{zeichen}</span>
    <span style={{ fontSize: 13.5, lineHeight: 1.5, color: C.tinte }}>{t}</span>
  </div>
));
const Linkknopf = ({ onClick, children }) => (
  <button type="button" onClick={onClick} style={{ background: "none", border: "none", padding: 0, color: C.see, fontSize: "inherit", fontFamily: "inherit", textDecoration: "underline", cursor: "pointer" }}>{children}</button>
);

/* ---------- Kaufdialog (Bestellübersicht direkt vor dem Bestellknopf) ---------- */
export function KaufDialog({ produkt, onSchliessen, gehe }) {
  const p = PRODUKT_INFO[produkt];
  const { nutzer } = useKonto();
  const [volljaehrig, setVolljaehrig] = useState(false);
  const [sofort, setSofort] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [fertig, setFertig] = useState(false);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && !laeuft && onSchliessen();
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [laeuft]);

  const zu = (ansicht) => { onSchliessen(); gehe({ ansicht }); };
  const bestellen = async () => {
    setFehler(""); setLaeuft(true);
    try {
      const r = await kaufStarten(produkt, { volljaehrig, sofortBeginn: sofort });
      if (r.demo) { setFertig(true); setLaeuft(false); }
    } catch (e) { setFehler(e.message); setLaeuft(false); }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={`${p.titel} kaufen`}
      onClick={(e) => e.target === e.currentTarget && !laeuft && onSchliessen()}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(11,30,74,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "24px 0 0" }}>
      <div style={{ background: C.sand, width: "100%", maxWidth: 560, maxHeight: "100%", overflowY: "auto", borderRadius: "22px 22px 0 0", boxShadow: "0 -8px 40px rgba(11,30,74,0.3)" }}>
        <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${NAVY} 100%)`, padding: "20px 22px 18px", borderRadius: "22px 22px 0 0", color: C.weiss, position: "relative" }}>
          <button type="button" onClick={onSchliessen} disabled={laeuft} aria-label="Schließen"
            style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.14)", color: C.weiss, fontSize: 20, cursor: "pointer", fontFamily: "inherit" }}>×</button>
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", color: C.flaggold, marginBottom: 6 }}>DEINE BESTELLUNG</p>
          <p style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, paddingRight: 36 }}>{p.titel}</p>
          <p style={{ fontSize: 13.5, color: C.goldText, fontWeight: 300, lineHeight: 1.55, marginTop: 6 }}>{p.kurz}</p>
        </div>

        <div style={{ padding: "18px 22px 26px" }}>
          {fertig ? (
            <div style={{ ...karte, padding: 20, textAlign: "center" }}>
              <p style={{ fontSize: 34, marginBottom: 6 }}>✓</p>
              <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Freigeschaltet</p>
              <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 16 }}>Vorschau-Modus: Der Kauf wurde nur in diesem Browser simuliert, es wurde nichts bezahlt.</p>
              <button type="button" onClick={onSchliessen}
                style={{ height: 46, padding: "0 26px", borderRadius: 999, border: "none", background: C.see, color: C.weiss, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Weiter</button>
            </div>
          ) : !nutzer ? (
            <div style={{ ...karte, padding: 20 }}>
              <p style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 6 }}>Erst anmelden</p>
              <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 14 }}>Käufe werden deinem Konto zugeordnet, damit du sie auf jedem Gerät nutzen kannst.</p>
              <button type="button" onClick={() => zu("konto")}
                style={{ height: 46, padding: "0 24px", borderRadius: 999, border: "none", background: C.see, color: C.weiss, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Zur Anmeldung</button>
            </div>
          ) : (
            <>
              {/* Übersicht */}
              <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: C.grau }}>Preis (Endpreis)</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: C.tinte, whiteSpace: "nowrap" }}>{p.preisZeile}</span>
                </div>
                <p style={{ fontSize: 12.5, color: C.grau, marginBottom: 14 }}>{p.laufzeit}</p>
                <Liste punkte={p.drin} farbe={C.smaragd} zeichen="✓" />
                <div style={{ height: 1, background: C.linie, margin: "10px 0" }} />
                <Liste punkte={p.nichtDrin} farbe={C.hellgrau} zeichen="–" />
              </div>

              {/* Erklärungen – nichts ist vorangekreuzt */}
              <Haken an={volljaehrig} onClick={() => setVolljaehrig(!volljaehrig)} pflicht>
                Ich bin volljährig und schließe den Vertrag selbst ab – für mich oder für den Schüler, der dieses Konto nutzt.
                Es gelten die <Linkknopf onClick={() => zu("agb")}>AGB</Linkknopf>; die <Linkknopf onClick={() => zu("widerruf")}>Widerrufsbelehrung</Linkknopf> habe ich zur Kenntnis genommen.
              </Haken>
              <Haken an={sofort} onClick={() => setSofort(!sofort)}>{p.sofortText}</Haken>
              <p style={{ fontSize: 12, color: C.grau, lineHeight: 1.55, margin: "-4px 0 16px 32px" }}>Freiwillig. {p.ohneSofort}</p>

              {fehler && <p style={{ fontSize: 13.5, color: C.signal, marginBottom: 12, lineHeight: 1.5 }}>{fehler}</p>}

              <button type="button" onClick={bestellen} disabled={!volljaehrig || laeuft}
                style={{ width: "100%", height: 54, borderRadius: 999, border: "none", fontFamily: "inherit", fontSize: 16, fontWeight: 700,
                  cursor: volljaehrig && !laeuft ? "pointer" : "not-allowed",
                  background: volljaehrig ? `linear-gradient(150deg, ${C.granaHell} 0%, ${C.gruen} 60%, ${C.gruenDunkel} 100%)` : C.hellgrau,
                  color: C.weiss, boxShadow: volljaehrig ? "0 6px 18px rgba(165,0,68,0.3)" : "none" }}>
                {laeuft ? "Einen Moment …" : `Zahlungspflichtig bestellen · ${p.knopf}`}
              </button>
              <p style={{ fontSize: 12, color: C.grau, textAlign: "center", lineHeight: 1.55, marginTop: 10 }}>
                Weiter zur sicheren Bezahlung bei Stripe – mit <b>Kreditkarte</b> oder <b>PayPal</b>.<br />Der Vertrag kommt mit Abschluss der Zahlung zustande; danach ist sofort freigeschaltet.
              </p>
              {DEMO && <p style={{ fontSize: 12, color: "#6B5310", background: "#FDF8EA", borderRadius: 10, padding: "8px 12px", marginTop: 12, textAlign: "center" }}>Vorschau-Modus: Es wird nichts bezahlt, der Kauf wird nur simuliert.</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Kaufbereich im Konto ---------- */
function Produktkarte({ id, rechte, onKaufen, gehe }) {
  const p = PRODUKT_INFO[id];
  const z = rechte[id];
  const hat = hatRecht(rechte, id);
  const [fehler, setFehler] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const verwalten = async () => {
    setFehler(""); setLaeuft(true);
    try { await aboVerwalten(); } catch (e) { setFehler(e.message); }
    setLaeuft(false);
  };
  const status = !hat ? null
    : id === "unlimited"
      ? (z.status === "gekuendigt" ? `Gekündigt – aktiv bis ${datum(z.kuendigung_zum || z.bis)}` : `Aktiv – verlängert sich am ${datum(z.bis)}`)
      : "Freigeschaltet – unbefristet";
  return (
    <div style={{ ...karte, padding: 18, marginBottom: 12, border: hat ? `1.5px solid ${C.smaragd}55` : "1.5px solid transparent" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{p.titel}</p>
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.5 }}>{p.kurz}</p>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: hat ? C.smaragd : C.tinte, whiteSpace: "nowrap" }}>{hat ? "✓" : p.preisZeile.replace(" einmalig", "").replace(" pro Monat", " / Monat")}</span>
      </div>
      {hat && <p style={{ fontSize: 13, color: C.smaragd, fontWeight: 600, marginTop: 10 }}>{status}</p>}
      {z && z.status === "ueberfaellig" && <p style={{ fontSize: 13, color: C.signal, marginTop: 10 }}>Die letzte Zahlung ist fehlgeschlagen. Bitte aktualisiere dein Zahlungsmittel.</p>}
      <div className="flex flex-wrap" style={{ gap: 8, marginTop: 14 }}>
        {!hat && (
          <button type="button" onClick={() => onKaufen(id)}
            style={{ height: 44, padding: "0 20px", borderRadius: 999, border: "none", background: C.gruen, color: C.weiss, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
            {id === "unlimited" ? "Unlimited holen" : "Kurs kaufen"}
          </button>
        )}
        {hat && id === "analysis1" && (
          <button type="button" onClick={() => gehe({ ansicht: "kurse", kurs: "analysis1" })}
            style={{ height: 44, padding: "0 20px", borderRadius: 999, border: "none", background: C.see, color: C.weiss, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Zum Kurs</button>
        )}
        {(hat || z?.status === "ueberfaellig") && id === "unlimited" && (
          <button type="button" onClick={verwalten} disabled={laeuft}
            style={{ height: 44, padding: "0 20px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.tinte, fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            {laeuft ? "Einen Moment …" : "Abo verwalten · kündigen"}
          </button>
        )}
      </div>
      {fehler && <p style={{ fontSize: 13, color: C.signal, marginTop: 8 }}>{fehler}</p>}
    </div>
  );
}

export function KaufBereich({ gehe }) {
  const { rechte } = useKonto();
  const [dialog, setDialog] = useState(null);
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.hellgrau, margin: "6px 0 10px" }}>KURSE & ABO</p>
      <Produktkarte id="unlimited" rechte={rechte} onKaufen={setDialog} gehe={gehe} />
      <Produktkarte id="analysis1" rechte={rechte} onKaufen={setDialog} gehe={gehe} />
      <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, margin: "4px 2px 0" }}>
        Bezahlung mit Kreditkarte oder PayPal über Stripe. Rechnungen findest du unter „Abo verwalten“ und in deiner Bestätigungs-E-Mail.
        Kündigen oder widerrufen geht auch ohne Anmeldung: <Linkknopf onClick={() => gehe({ ansicht: "vertraege" })}>Verträge hier kündigen</Linkknopf>.
      </p>
      {dialog && <KaufDialog produkt={dialog} gehe={gehe} onSchliessen={() => setDialog(null)} />}
    </div>
  );
}

/* ---------- Rückmeldung nach dem Checkout (?kauf=erfolg|abbruch) ---------- */
export function KaufRueckmeldung() {
  const { rechte } = useKonto();
  const [info] = useState(() => {
    try {
      const u = new URL(window.location.href);
      const kauf = u.searchParams.get("kauf"), produkt = u.searchParams.get("produkt");
      if (kauf) { ["kauf", "produkt"].forEach((k) => u.searchParams.delete(k)); window.history.replaceState({}, "", u.pathname + u.search + u.hash); }
      return kauf ? { kauf, produkt } : null;
    } catch (e) { return null; }
  });
  const [zu, setZu] = useState(false);
  const fertig = info?.kauf === "erfolg" && hatRecht(rechte, info.produkt);

  // Der Webhook schaltet ein paar Sekunden nach der Zahlung frei – so lange nachfragen.
  useEffect(() => {
    if (info?.kauf !== "erfolg" || fertig) return;
    let n = 0;
    const t = setInterval(() => { n += 1; rechteNeuLaden(); if (n >= 12) clearInterval(t); }, 2500);
    return () => clearInterval(t);
  }, [info, fertig]);

  if (!info || zu) return null;
  const p = PRODUKT_INFO[info.produkt];
  const [farbe, hinter, text] = info.kauf === "abbruch"
    ? [C.grau, C.weiss, "Die Bezahlung wurde abgebrochen. Es wurde nichts berechnet."]
    : fertig
      ? [C.smaragd, "#EEF8F2", `Danke! ${p ? p.titel : "Dein Kauf"} ist freigeschaltet. Die Bestätigung mit Rechnung kommt per E-Mail.`]
      : [C.see, C.himmel, "Zahlung erhalten – wir schalten gerade frei. Das dauert meist nur wenige Sekunden …"];
  return (
    <div style={{ background: hinter, border: `1px solid ${farbe}44`, borderRadius: 14, padding: "12px 40px 12px 14px", marginBottom: 16, position: "relative" }}>
      <p style={{ fontSize: 14, color: farbe === C.grau ? C.tinte : farbe, fontWeight: 600, lineHeight: 1.5 }}>{text}</p>
      <button type="button" onClick={() => setZu(true)} aria-label="Hinweis schließen"
        style={{ position: "absolute", top: 6, right: 6, width: 30, height: 30, border: "none", background: "none", fontSize: 18, color: C.grau, cursor: "pointer" }}>×</button>
    </div>
  );
}

/* ---------- Trainingsgeräte: Tageskontingent und Sperre ---------- */
export function TagesKontingent({ gehe }) {
  const { n } = useTageszaehler();
  const rest = Math.max(0, FREI_PRO_TAG - n);
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: "calc(14px + env(safe-area-inset-bottom, 0px))", zIndex: 120, padding: "0 16px", pointerEvents: "none" }}>
      <div className="mx-auto" style={{ maxWidth: 520, pointerEvents: "auto", display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.97)", border: `1px solid ${C.linie}`, borderRadius: 999, padding: "6px 6px 6px 16px", boxShadow: "0 8px 28px rgba(11,30,74,0.18)", backdropFilter: "blur(8px)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12.5, color: C.grau, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Heute noch <b style={{ color: rest <= 3 ? C.gruen : C.tinte }}>{rest} von {FREI_PRO_TAG}</b> freien Aufgaben
          </p>
          <div style={{ height: 3, background: C.linie, borderRadius: 2, marginTop: 4 }}>
            <div style={{ height: 3, width: `${(rest / FREI_PRO_TAG) * 100}%`, background: rest <= 3 ? C.gruen : C.see, borderRadius: 2, transition: "width .3s" }} />
          </div>
        </div>
        <button type="button" onClick={() => gehe({ ansicht: "konto" })}
          style={{ height: 32, padding: "0 14px", borderRadius: 999, border: "none", background: C.flaggold, color: NAVY, fontSize: 12.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}>Unlimited</button>
      </div>
    </div>
  );
}

export function TrainingsSperre({ gehe }) {
  const [dialog, setDialog] = useState(false);
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <div style={{ ...karte, overflow: "hidden" }}>
        <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${NAVY} 100%)`, padding: "26px 22px", color: C.weiss }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: C.flaggold, marginBottom: 8 }}>TAGESZIEL GESCHAFFT</p>
          <p style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 8 }}>{FREI_PRO_TAG} Aufgaben heute – stark.</p>
          <p style={{ fontSize: 14.5, color: C.goldText, fontWeight: 300, lineHeight: 1.65 }}>
            Ab morgen hast du wieder {FREI_PRO_TAG} freie Aufgaben. Wenn du jetzt weitermachen willst, schaltet Unlimited alle Trainingsgeräte ohne Tageslimit frei.
          </p>
        </div>
        <div style={{ padding: 22 }}>
          <Liste punkte={PRODUKT_INFO.unlimited.drin} farbe={C.smaragd} zeichen="✓" />
          <button type="button" onClick={() => setDialog(true)}
            style={{ width: "100%", height: 52, marginTop: 12, borderRadius: 999, border: "none", background: C.gruen, color: C.weiss, fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 6px 18px rgba(165,0,68,0.28)" }}>
            Unlimited · 20,00 € / Monat
          </button>
          <p style={{ fontSize: 12.5, color: C.grau, textAlign: "center", marginTop: 10 }}>Monatlich kündbar · Kreditkarte oder PayPal</p>
          <div style={{ height: 1, background: C.linie, margin: "18px 0 14px" }} />
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6 }}>
            Weiter ohne Limit geht es mit allem, was frei ist: <Linkknopf onClick={() => gehe({ ansicht: "plotter" })}>Plotter</Linkknopf>,{" "}
            <Linkknopf onClick={() => gehe({ ansicht: "formeln" })}>Formelsammlung</Linkknopf>, <Linkknopf onClick={() => gehe({ ansicht: "wiederholen" })}>Wiederholen</Linkknopf> und{" "}
            <Linkknopf onClick={() => gehe({ ansicht: "analyse", foto: "blatt" })}>Mathilda AI</Linkknopf>.
          </p>
        </div>
      </div>
      {dialog && <KaufDialog produkt="unlimited" gehe={gehe} onSchliessen={() => setDialog(false)} />}
    </div>
  );
}

/* ---------- Kurs: gesperrte Lektion ---------- */
export function LektionSperre({ kursId, gehe, onZurueck }) {
  const [dialog, setDialog] = useState(false);
  const p = PRODUKT_INFO[kursId];
  return (
    <div style={{ ...karte, padding: 22, textAlign: "center", marginBottom: 20 }}>
      <div style={{ width: 52, height: 52, borderRadius: 999, background: C.himmel, color: C.see, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>🔒</div>
      <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Diese Lektion gehört zum Kurs</p>
      <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.6, marginBottom: 16 }}>Die erste Lektion ist frei. Alle weiteren Lektionen, Kurz-Checks und Übungssprünge schaltest du mit dem Kurs frei – einmalig, ohne Abo.</p>
      <button type="button" onClick={() => setDialog(true)}
        style={{ height: 50, padding: "0 28px", borderRadius: 999, border: "none", background: C.gruen, color: C.weiss, fontSize: 15.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 6px 18px rgba(165,0,68,0.28)" }}>
        Kurs freischalten · {p.knopf}
      </button>
      {onZurueck && (
        <div style={{ marginTop: 12 }}><Linkknopf onClick={onZurueck}>Zurück zur Übersicht</Linkknopf></div>
      )}
      {dialog && <KaufDialog produkt={kursId} gehe={gehe} onSchliessen={() => setDialog(false)} />}
    </div>
  );
}

/* ---------- Verträge kündigen / widerrufen (ohne Anmeldung, § 312k BGB) ---------- */
export function VertraegeSeite({ gehe }) {
  const { nutzer } = useKonto();
  const [art, setArt] = useState("kuendigung");
  const [schritt, setSchritt] = useState(1);   // 1 = Formular, 2 = Bestätigungsseite, 3 = Eingangsbestätigung
  const [f, setF] = useState({ name: "", email: nutzer?.email || "", vertrag: "unlimited", kuendigungsart: "ordentlich", grund: "", nachricht: "" });
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [antwort, setAntwort] = useState(null);
  const setze = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const gueltig = f.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim());
  const VERTRAEGE = art === "kuendigung"
    ? [["unlimited", "Mythos Mathe Unlimited (Abo)"], ["sonstiges", "Anderer Vertrag"]]
    : [["analysis1", "Selbstlernkurs Analysis 1 – Geraden"], ["unlimited", "Mythos Mathe Unlimited (Abo)"], ["sonstiges", "Anderer Vertrag"]];
  const vertragName = (VERTRAEGE.find((v) => v[0] === f.vertrag) || [, f.vertrag])[1];

  const senden = async () => {
    setFehler(""); setLaeuft(true);
    try { setAntwort(await vertragMelden({ art, ...f })); setSchritt(3); }
    catch (e) { setFehler(e.message); }
    setLaeuft(false);
  };
  const feld = { width: "100%", height: 46, borderRadius: 12, border: `1.5px solid ${C.linie}`, padding: "0 14px", fontSize: 15, fontFamily: "inherit", color: C.tinte, background: C.weiss, marginBottom: 12 };
  const Beschriftung = ({ children }) => <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{children}</p>;
  const Grosser = ({ onClick, children, aus }) => (
    <button type="button" onClick={onClick} disabled={aus}
      style={{ width: "100%", height: 52, borderRadius: 999, border: "none", background: aus ? C.hellgrau : C.gruen, color: C.weiss, fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: aus ? "not-allowed" : "pointer" }}>{children}</button>
  );
  const wort = art === "kuendigung" ? "Kündigung" : "Widerruf";

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      {schritt === 1 && (
        <>
          <div className="flex" style={{ gap: 8, marginBottom: 18 }}>
            {[["kuendigung", "Vertrag kündigen"], ["widerruf", "Vertrag widerrufen"]].map(([id, t]) => (
              <button key={id} type="button" onClick={() => { setArt(id); setF({ ...f, vertrag: id === "kuendigung" ? "unlimited" : "analysis1" }); }}
                style={{ flex: 1, height: 44, borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                  background: art === id ? C.see : C.weiss, color: art === id ? C.weiss : C.grau, border: `1px solid ${art === id ? C.see : C.linie}` }}>{t}</button>
            ))}
          </div>
          <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.65, marginBottom: 18 }}>
            {art === "kuendigung"
              ? "Hier kündigst du ein laufendes Abo – ohne Anmeldung. Eine ordentliche Kündigung wirkt zum Ende des laufenden Monats; bis dahin bleibt der Zugang bestehen."
              : "Innerhalb von 14 Tagen nach Vertragsschluss kannst du ohne Angabe von Gründen widerrufen. Es reicht, die Erklärung vor Ablauf der Frist abzusenden."}
          </p>
          <div style={{ ...karte, padding: 18 }}>
            <Beschriftung>Name *</Beschriftung>
            <input style={feld} value={f.name} onChange={setze("name")} autoComplete="name" />
            <Beschriftung>E-Mail-Adresse des Vertrags *</Beschriftung>
            <input style={feld} type="email" value={f.email} onChange={setze("email")} autoComplete="email" />
            <Beschriftung>Welcher Vertrag?</Beschriftung>
            <select style={feld} value={f.vertrag} onChange={setze("vertrag")}>
              {VERTRAEGE.map(([id, t]) => <option key={id} value={id}>{t}</option>)}
            </select>
            {art === "kuendigung" && (
              <>
                <Beschriftung>Art der Kündigung</Beschriftung>
                <select style={feld} value={f.kuendigungsart} onChange={setze("kuendigungsart")}>
                  <option value="ordentlich">Ordentlich – zum nächstmöglichen Zeitpunkt</option>
                  <option value="ausserordentlich">Außerordentlich – aus wichtigem Grund</option>
                </select>
                {f.kuendigungsart === "ausserordentlich" && (
                  <textarea style={{ ...feld, height: 90, padding: 12, resize: "vertical" }} placeholder="Grund der außerordentlichen Kündigung" value={f.grund} onChange={setze("grund")} />
                )}
              </>
            )}
            <Beschriftung>Nachricht (freiwillig)</Beschriftung>
            <textarea style={{ ...feld, height: 80, padding: 12, resize: "vertical", marginBottom: 16 }} value={f.nachricht} onChange={setze("nachricht")} />
            <Grosser onClick={() => setSchritt(2)} aus={!gueltig}>Weiter zur Bestätigung</Grosser>
          </div>
        </>
      )}

      {schritt === 2 && (
        <div style={{ ...karte, padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.hellgrau, marginBottom: 10 }}>BITTE PRÜFEN</p>
          {[["Erklärung", art === "kuendigung" ? (f.kuendigungsart === "ordentlich" ? "Ordentliche Kündigung" : "Außerordentliche Kündigung") : "Widerruf"], ["Vertrag", vertragName], ["Name", f.name], ["E-Mail", f.email]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.linie}` }}>
              <span style={{ width: 90, flexShrink: 0, fontSize: 13.5, color: C.grau }}>{k}</span>
              <span style={{ fontSize: 14, fontWeight: 600, wordBreak: "break-word" }}>{v}</span>
            </div>
          ))}
          <div style={{ height: 18 }} />
          {fehler && <p style={{ fontSize: 13.5, color: C.signal, marginBottom: 12, lineHeight: 1.5 }}>{fehler}</p>}
          <Grosser onClick={senden} aus={laeuft}>{laeuft ? "Wird gesendet …" : art === "kuendigung" ? "Jetzt kündigen" : "Widerruf bestätigen"}</Grosser>
          <div style={{ textAlign: "center", marginTop: 12 }}><Linkknopf onClick={() => setSchritt(1)}>Angaben ändern</Linkknopf></div>
        </div>
      )}

      {schritt === 3 && antwort && (
        <div style={{ ...karte, padding: 22 }} id="eingangsbestaetigung">
          <p style={{ fontSize: 30, color: C.smaragd, marginBottom: 6 }}>✓</p>
          <p style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>{wort} eingegangen</p>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.65, marginBottom: 14 }}>{antwort.ergebnis}</p>
          <div style={{ background: C.sand, borderRadius: 12, padding: 14, fontSize: 13.5, lineHeight: 1.7, marginBottom: 16 }}>
            <b>Eingangsbestätigung</b><br />
            Erklärung: {wort} · {vertragName}<br />
            Name: {f.name} · E-Mail: {f.email}<br />
            Eingegangen am {new Date(antwort.eingang).toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short" })} Uhr<br />
            Vorgangsnummer: {String(antwort.id).slice(0, 8).toUpperCase()}
          </div>
          <button type="button" onClick={() => window.print()}
            style={{ height: 46, padding: "0 22px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.tinte, fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Bestätigung speichern / drucken
          </button>
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 12 }}>Bitte speichere diese Bestätigung. Fragen? Über das <Linkknopf onClick={() => gehe({ ansicht: "impressum" })}>Impressum</Linkknopf> erreichst du uns direkt.</p>
        </div>
      )}
    </div>
  );
}
