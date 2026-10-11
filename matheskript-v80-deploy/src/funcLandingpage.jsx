import React, { useState } from "react";
import { C } from "./base1.jsx";
import { COACHING } from "./base3.jsx";
import { Startseite } from "./func2.jsx";
import { PerformanceLab } from "./funcPerformanceLab.jsx";

/* ======================================================================
   LANDINGPAGE  (Adresse: #landingpage)
   Offen erreichbar (keine Passwort-Sperre), im Seiten-Menü oben neben der Startseite.

   Aufbau:
     1. Einstieg   – das Problem (dunkel)
     2. Geschichte – „Dieses Problem kenne ich …“ (hell)
     3. Startseite – die bestehende Startseite, unverändert und mit allen Features
                     (<Startseite /> aus func2.jsx, also immer deckungsgleich)
     3b. Performance-Lab – Testbereich (funcPerformanceLab.jsx), eigenständig, mit eigenem Speicher
     4. Abschluss  – was passiert, wenn sich nichts ändert, und die drei nächsten Schritte

   Der Text steht hier im Code; die Startseite wird nicht kopiert, sondern eingebunden.
   ====================================================================== */

export const LANDING = "landingpage";

const GOLD_VERLAUF = `linear-gradient(180deg, #FFD24D 0%, ${C.flaggold} 100%)`;
const BLAU_TEXT = "#C9D6EE";

/* ---------------------------------------------------------------- Bausteine */

function GoldBalken({ breite = 54, abstand = "18px 0" }) {
  return <div style={{ width: breite, height: 4, borderRadius: 2, margin: abstand, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)` }} />;
}

const absatzDunkel = { color: BLAU_TEXT, fontSize: 16, fontWeight: 300, lineHeight: 1.85, margin: "0 0 18px" };
const absatzHell = { color: C.grau, fontSize: 16, fontWeight: 300, lineHeight: 1.85, margin: "0 0 18px" };
const fett = (farbe) => ({ color: farbe, fontWeight: 600 });

function Gedanke({ children }) {
  return (
    <p style={{ margin: "0 0 12px", padding: "14px 18px", borderRadius: 12, borderLeft: `3px solid ${C.flaggold}`, background: "rgba(255,255,255,0.07)",
      color: C.weiss, fontSize: 17, fontWeight: 500, lineHeight: 1.5, letterSpacing: "-0.005em" }}>
      {children}
    </p>
  );
}

function Notensprung() {
  const zahl = (farbe) => ({ fontSize: "clamp(40px, 12vw, 56px)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", color: farbe });
  const unter = { fontSize: 12.5, fontWeight: 400, color: C.grau, lineHeight: 1.4, marginTop: 8 };
  return (
    <div role="img" aria-label="Von der Note 2 in den ersten drei Gymnasialjahren zur Note 1,0 ab Klasse 10"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(10px, 4vw, 26px)", background: C.weiss, borderRadius: 18,
        padding: "24px 16px 22px", margin: "26px 0 30px", boxShadow: "0 3px 18px rgba(15,26,51,0.08)", borderTop: `4px solid ${C.flaggold}` }}>
      <div style={{ textAlign: "center", flex: "1 1 0", minWidth: 0 }}>
        <div style={zahl(C.hellgrau)}>2</div>
        <div style={unter}>erste drei Jahre<br />Gymnasium</div>
      </div>
      <div style={{ textAlign: "center", flex: "0 0 auto" }}>
        <svg viewBox="0 0 48 24" width="48" height="24" fill="none" stroke={C.gruen} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12h40M34 4l9 8-9 8" />
        </svg>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: C.gruenDunkel, marginTop: 6, whiteSpace: "nowrap" }}>ab Klasse 8<br />ein anderer Weg</div>
      </div>
      <div style={{ textAlign: "center", flex: "1 1 0", minWidth: 0 }}>
        <div style={zahl(C.gruen)}>1,0</div>
        <div style={unter}>ab Klasse 10</div>
      </div>
    </div>
  );
}

function Schritt({ nr, text, knopf, onClick, hinweis }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", background: C.weiss, borderRadius: 16, padding: "20px 18px", marginBottom: 12,
      boxShadow: "0 3px 18px rgba(15,26,51,0.07)", border: `1px solid ${C.linie}` }}>
      <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: GOLD_VERLAUF, color: C.seeTief, fontSize: 16, fontWeight: 800 }}>{nr}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, color: C.tinte, fontSize: 16, fontWeight: 500, lineHeight: 1.6 }}>{text}</p>
        <button type="button" onClick={onClick}
          style={{ marginTop: 14, fontFamily: "inherit", cursor: "pointer", fontWeight: 700, fontSize: 14.5, lineHeight: 1.2, padding: "12px 22px", borderRadius: 999,
            border: "none", background: C.seeTief, color: C.weiss, boxShadow: "0 4px 14px rgba(14,30,74,0.22)" }}>
          {knopf}
        </button>
        {hinweis && <p role="status" style={{ margin: "12px 0 0", color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6 }}>{hinweis}</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Seite */

export function Landingpage({ gehe }) {
  const [gespraechHinweis, setGespraechHinweis] = useState(false);

  const zuDenTools = () => {
    const el = document.getElementById("landing-tools");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  /* Terminlink oder Mailadresse stehen in base3.jsx unter COACHING. Solange dort nichts steht, erscheint ein Hinweis. */
  const gespraechBuchen = () => {
    if (COACHING.termin) { window.open(COACHING.termin, "_blank", "noopener"); return; }
    if (COACHING.mail) {
      const betreff = encodeURIComponent("Erstgespräch Mythos Mathe");
      const text = encodeURIComponent("Hallo Basti,\n\nich würde gern ein erstes Gespräch mit dir führen.\n\nKlasse:\nWo es gerade hakt:\n\nViele Grüße");
      window.location.href = `mailto:${COACHING.mail}?subject=${betreff}&body=${text}`;
      return;
    }
    setGespraechHinweis(true);
  };

  return (
    <>
      {/* 1 · Einstieg: das Problem */}
      <section style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
        <div className="mx-auto px-6" style={{ maxWidth: 620, paddingTop: 44, paddingBottom: 30 }}>
          <h1 className="titel-silber" style={{ fontWeight: 800, fontSize: "clamp(28px, 8.6vw, 40px)", letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0 }}>
            Du würdest eigentlich gerne Mathe verstehen.
          </h1>
          <p className="logo-gold" style={{ fontWeight: 700, fontSize: "clamp(21px, 6.2vw, 28px)", letterSpacing: "-0.02em", lineHeight: 1.2, margin: "14px 0 0" }}>
            Stattdessen erlebst du seit Langem das Gegenteil.
          </p>
          <GoldBalken abstand="22px 0 26px" />

          <p style={absatzDunkel}>
            Manche scheinen es einfach zu kapieren. Du hängst hinterher. Du zweifelst an dir und sagst dir Dinge wie:
          </p>
          <Gedanke>„Ich check’s einfach nicht.“</Gedanke>
          <Gedanke>„Mathe ist zu schwer für mich.“</Gedanke>

          <p style={{ ...absatzDunkel, marginTop: 24 }}>
            Du hast schon vieles versucht. Nichts hat wirklich funktioniert. Lernen fühlt sich sinnlos an, macht keinen Spaß und passiert nur,
            wenn du musst – meistens unter Stress kurz vor der Prüfung.
          </p>
          <p style={absatzDunkel}>
            Ein Jahr später ist dasselbe Thema wieder da und du hast fast alles vergessen. Mathe ist zu einer Qual geworden, die du nur noch
            überleben willst. Und irgendwann hast du den Glauben daran verloren, dass du darin <b style={fett(C.weiss)}>wirklich etwas erreichen kannst.</b>
          </p>
        </div>
      </section>

      {/* 2 · Geschichte */}
      <section style={{ background: C.sand }}>
        <div className="mx-auto px-6" style={{ maxWidth: 620, paddingTop: 40, paddingBottom: 36 }}>
          <h2 style={{ fontSize: "clamp(22px, 6.4vw, 28px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.2, color: C.tinte, margin: 0 }}>
            Dieses Problem kenne ich besser, als du dir vorstellen kannst.
          </h2>
          <GoldBalken abstand="18px 0 22px" />

          <p style={absatzHell}>
            In den ersten drei Jahren des Gymnasiums bin ich bei der Note 2 festgehangen. Du denkst jetzt vielleicht:
            „Wovon redet der? Eine 2 wäre für mich schon ein Traum.“
          </p>
          <p style={{ ...absatzHell, color: C.tinte, fontWeight: 600, fontSize: 17 }}>Genau deshalb ist meine Geschichte wichtig.</p>
          <p style={absatzHell}>
            Ab der 8. Klasse habe ich einen komplett anderen Weg eingeschlagen. Ab der 10. Klasse wurde ich zu einer <b style={fett(C.tinte)}>1,0-Maschine.</b>
          </p>

          <Notensprung />

          <p style={absatzHell}>
            Der Unterschied war nicht nur eine Note. Es waren Welten – in der Art, wie ich Mathe begegnet bin, wie ich mich selbst darin gesehen habe
            und was ich daraus für mein Leben mitnehmen konnte.
          </p>
          <p style={absatzHell}>
            Die letzten fünf Jahre habe ich intensiv untersucht, welche konkreten Stellschrauben – vor allem in ihrer Kombination und Reihenfolge –
            diesen Weg bei mir möglich gemacht haben.
          </p>

          <div style={{ background: `linear-gradient(165deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 20, padding: "24px 22px 6px", margin: "28px 0" }}>
            <p style={{ margin: "0 0 14px", color: C.weiss, fontSize: 17, fontWeight: 500, lineHeight: 1.6 }}>
              Was ich herausgefunden habe: Diese Stellschrauben wirken bei jedem Schüler.
            </p>
            <p style={{ margin: "0 0 14px", color: C.flaggold, fontSize: 19, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
              Unabhängig vom Talent. Unabhängig davon, wo du gerade stehst.
            </p>
            <p style={{ margin: "0 0 18px", color: BLAU_TEXT, fontSize: 15.5, fontWeight: 300, lineHeight: 1.75 }}>
              Sie bringen jeden enorm nach vorne – und bringen vor allem die Freude an Mathe zurück.
            </p>
          </div>

          <p style={absatzHell}>
            Genau daraus habe ich im letzten Jahr ein Trainingsprogramm entwickelt. Ab sofort stelle ich es euch zur Verfügung.
          </p>
          <p style={{ ...absatzHell, color: C.tinte, fontWeight: 500, fontSize: 17, lineHeight: 1.7, marginBottom: 0 }}>
            Mit denselben Effekten, die mich damals so schnell so stark gemacht haben, kannst du jetzt
            <b style={fett(C.gruenDunkel)}> die beste Version deiner selbst in Mathematik </b>werden.
          </p>
        </div>
      </section>

      {/* 3 · Die Startseite, unverändert */}
      <div id="landing-tools" style={{ scrollMarginTop: 64 }}>
        <Startseite gehe={gehe} />
      </div>

      {/* 3b · Performance-Lab (Testbereich): gemeinsames Fehlergedächtnis für digitales und handschriftliches Lernen */}
      <PerformanceLab />

      {/* 4 · Abschluss */}
      <section style={{ background: C.sand }}>
        <div className="mx-auto px-6" style={{ maxWidth: 620, paddingTop: 8, paddingBottom: 56 }}>
          <div style={{ background: `linear-gradient(165deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 20, padding: "26px 22px 10px" }}>
            <h2 style={{ margin: "0 0 18px", color: C.weiss, fontSize: "clamp(19px, 5.6vw, 23px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
              Was jetzt passiert, wenn sich nichts ändert:
            </h2>
            {["Die Lücke wird größer.", "Der Stress vor jeder Klausur intensiver.", "Das Gefühl von Hilflosigkeit stärker."].map((z) => (
              <p key={z} style={{ margin: "0 0 10px", color: C.flaggold, fontSize: 16.5, fontWeight: 600, lineHeight: 1.5 }}>{z}</p>
            ))}
            <p style={{ ...absatzDunkel, marginTop: 16 }}>
              Und am Ende des Abis steht nicht nur eine schlechte Note – sondern die Gewissheit, dass du Jahre deiner Schulzeit mit einem Fach verbracht hast,
              das dich immer weiter runtergezogen hat, statt dich wachsen zu lassen.
            </p>
          </div>

          <p style={{ color: C.gruenDunkel, fontWeight: 800, fontSize: "clamp(24px, 7.4vw, 32px)", letterSpacing: "-0.03em", lineHeight: 1.15, margin: "34px 0 0" }}>
            Das muss nicht so bleiben.
          </p>
          <GoldBalken abstand="16px 0 30px" />

          <h2 style={{ margin: "0 0 18px", color: C.tinte, fontSize: "clamp(21px, 6vw, 26px)", fontWeight: 700, letterSpacing: "-0.025em" }}>Dein nächster Schritt:</h2>
          <Schritt nr="1" text="Schau dir die Tools auf dieser Seite an und probiere sie aus." knopf="Zu den Tools" onClick={zuDenTools} />
          <Schritt nr="2" text="Informiere dich über die Mathe Masterclass." knopf="Zur Masterclass" onClick={() => gehe({ ansicht: "masterclass" })} />
          <Schritt nr="3" text="Buche ein erstes Gespräch – und lass uns gemeinsam schauen, wie dein Weg aussehen kann." knopf="Gespräch buchen" onClick={gespraechBuchen}
            hinweis={gespraechHinweis ? "Die Terminbuchung öffnet in Kürze." : null} />

          <p style={{ margin: "30px 0 0", color: C.tinte, fontSize: 17, fontWeight: 600, lineHeight: 1.6 }}>Du musst diesen Weg nicht alleine gehen.</p>
          <p style={{ margin: "6px 0 0", color: C.grau, fontSize: 16, fontWeight: 300, lineHeight: 1.8 }}>
            Ich lade dich herzlich ein, jetzt einen neuen Weg einzuschlagen.
          </p>
        </div>
      </section>
    </>
  );
}
