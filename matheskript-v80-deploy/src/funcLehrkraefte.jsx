/* ======================================================================
   FÜR LEHRKRÄFTE (/lehrkraefte) – offen erreichbar, ohne Passwort (middleware.js).

   Dramaturgie: Blockbuster-StorySkript (Alexander Christiani). Die Lehrkraft ist die Heldin bzw.
   der Held, Basti (Mythos Mathe) ist der Mentor. Fünf Schritte, je drei Unterpunkte:

     1. HELD      Identität · Wunsch · Einsatz                → Kopf + Vertrauensleiste
     2. PROBLEM   äußeres · inneres · Gegenspieler (Mythos)  → „Sie kennen das“ in drei Ebenen
     3. MENTOR    Empathie · Autorität · Haltung              → „Warum es das gibt“
     4. LÖSUNG    3-Schritte-Plan · Versprechen · Werkzeuge   → Plan, Zusagen, Werkzeuge-Karten
     5. REISE     Handlung · Erfolg · Scheitern               → Zwei Wege, Fragen, Abschluss

   Ein direkter Knopf (Arbeitsblatt erstellen) im Kopf, nach der Lösung und am Schluss,
   auf dem Handy zusätzlich als feste Leiste; ein Übergangs-Knopf („So funktioniert es“).
   Lehrkräfte werden gesiezt. Keine erfundenen Zahlen, Zitate oder Nutzerzahlen.
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";
import { springe } from "./sprung.js";

const GOLD = `linear-gradient(135deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`;
const INNEN = { maxWidth: 760, margin: "0 auto", padding: "0 20px" };
const KICKER = { fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gruenDunkel, margin: "0 0 10px" };
const H2 = { fontSize: "clamp(24px, 6vw, 32px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, color: C.tinte, margin: "0 0 14px" };
const P = { fontSize: 16, lineHeight: 1.7, color: C.grau, margin: "0 0 14px" };

function Knopf({ onClick, children, leise, testid }) {
  return (
    <button type="button" onClick={onClick} data-testid={testid}
      style={{ minHeight: 54, padding: "12px 26px", borderRadius: 999, fontFamily: "inherit", fontSize: 16, fontWeight: 800, cursor: "pointer",
        border: leise ? `1.5px solid ${C.silber}` : "none", background: leise ? "transparent" : GOLD, color: leise ? C.weiss : C.seeTief,
        boxShadow: leise ? "none" : "0 8px 22px rgba(226,181,60,0.35)" }}>
      {children}
    </button>
  );
}

function Abschnitt({ id, hell, children }) {
  return <section id={id} style={{ background: hell ? C.weiss : C.sand, padding: "64px 0" }}><div style={INNEN}>{children}</div></section>;
}

function DreiKarten({ karten, nummer }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginTop: 22 }}>
      {karten.map((k, i) => (
        <div key={k.titel} style={{ background: C.weiss, borderRadius: 18, padding: "20px 18px", boxShadow: "0 2px 16px rgba(15,26,51,0.07)", borderTop: `3px solid ${i === 2 && !nummer ? C.flaggold : C.see}` }}>
          {nummer && <div style={{ width: 34, height: 34, borderRadius: 999, background: C.seeTief, color: C.flaggold, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>{i + 1}</div>}
          {k.kicker && <p style={{ ...KICKER, fontSize: 10.5, color: C.see, marginBottom: 6 }}>{k.kicker}</p>}
          <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, margin: "0 0 8px", lineHeight: 1.3 }}>{k.titel}</p>
          <p style={{ fontSize: 14.5, color: C.grau, lineHeight: 1.65, margin: 0 }}>{k.text}</p>
        </div>
      ))}
    </div>
  );
}

const FRAGEN = [
  ["Darf ich die Blätter im Unterricht verwenden?", "Ja. Alle Aufgaben erzeugt die App selbst – Sie dürfen die Blätter frei kopieren, austeilen und als Hausaufgabe nutzen."],
  ["Woher kommen die Aufgaben – ist das KI?", "Nein. Die Aufgaben entstehen aus festen Rechenregeln in der App. Jede Zahl wird neu gewählt und jede Lösung von der App selbst berechnet, nicht von einer KI geschrieben. Darum gibt es auch keine Aufgaben, deren Lösung man im Netz nachschlagen kann."],
  ["Brauche ich ein Konto?", "Nein. Mit einem kostenlosen Lehrer-Konto können Sie zusätzlich Ihre Klassen mit einem Tipp auswählen und Blätter speichern, um sie später genau so wieder zu drucken."],
  ["Was steht sonst noch auf dem Blatt?", "Unten auf jeder Seite stehen dezent mythosmathe.de und ein QR-Code. Er führt Ihre Schüler zum passenden Training mit Lösungsweg – kostenlos. Sonst nichts: keine Werbung, keine Preise."],
  ["Passt das zu meinem Lehrplan?", "Die Kapitel orientieren sich am Lambacher Schweizer für Baden-Württemberg (G8, G9, Gemeinschaftsschule). Die Inhalte sind aber Schulmathematik, wie sie in jedem Bundesland vorkommt."],
  ["Warum gibt es kein Karo-Papier?", "Mit Absicht. Auf Blanko sehen Schüler die Struktur ihrer Rechnung: Abstände, Brüche, Gleichheitszeichen untereinander. Der Rechenraum unter jeder Aufgabe ist deshalb immer weiß – oder Sie wählen „Kompakt“ und es wird im Heft gerechnet."],
  ["Was passiert mit Daten meiner Schüler?", "Der Generator braucht keine Schülerdaten. Was Sie in den Blattkopf schreiben (Schule, Name, Klasse), bleibt auf Ihrem Gerät – oder in Ihrem Konto, wenn Sie ein Blatt speichern."],
];

export function LehrkraefteSeite({ gehe }) {
  const zumGenerator = () => gehe({ ansicht: "lehrerblatt" });
  const zumPlan = () => springe("anker", () => { const el = document.getElementById("lk-plan"); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" }); });
  return (
    <div style={{ fontFamily: "Montserrat, sans-serif", background: C.sand }} data-seite="lehrkraefte">
      {/* 1 · HELD – Identität, Wunsch, Einsatz */}
      <header style={{ background: `linear-gradient(165deg, ${C.seeTief} 0%, ${C.see} 100%)`, padding: "58px 0 64px" }}>
        <div style={INNEN}>
          <p style={{ ...KICKER, color: C.flaggold }}>Für Lehrkräfte · kostenlos · ohne Konto</p>
          <h1 className="titel-silber" style={{ fontSize: "clamp(31px, 8vw, 46px)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.08, margin: "0 0 18px" }}>
            Übungsblätter für Ihre Klasse – in zwei Minuten statt an einem Abend.
          </h1>
          <div style={{ width: 60, height: 4, background: GOLD, borderRadius: 2, marginBottom: 20 }} />
          <p style={{ fontSize: 17, lineHeight: 1.7, color: C.goldText, fontWeight: 300, margin: "0 0 28px", maxWidth: 600 }}>
            Sie unterrichten Mathematik und wollen, dass Ihre Schüler üben – mit Aufgaben, die genau zum Kapitel passen, und einem Lösungsblatt, auf das Sie sich verlassen können. Kapitel wählen, Unterthemen anhaken, PDF drucken. Mit Gruppe A und B, wenn Sie möchten.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Knopf onClick={zumGenerator} testid="lk-start">Arbeitsblatt erstellen</Knopf>
            <Knopf leise onClick={zumPlan} testid="lk-plan-knopf">So funktioniert es</Knopf>
          </div>
        </div>
      </header>

      {/* Vertrauensleiste – nur Fakten */}
      <div style={{ background: C.weiss, borderBottom: `1px solid ${C.linie}` }}>
        <div style={{ ...INNEN, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, padding: "20px 20px" }}>
          {[["Klasse 5 bis 13", "G8, G9 und Gemeinschaftsschule"], ["Kapitel wie im Buch", "Lambacher Schweizer BW"], ["Mit Lösungsblatt", "Lösungsweg oder nur Ergebnisse"], ["Gruppe A und B", "gleiche Typen, andere Zahlen"]].map(([t, z]) => (
            <div key={t}><p style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: C.tinte }}>{t}</p><p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.grau }}>{z}</p></div>
          ))}
        </div>
      </div>

      {/* 2 · PROBLEM – äußeres, inneres, Gegenspieler */}
      <Abschnitt>
        <p style={KICKER}>Sie kennen das</p>
        <h2 style={H2}>Gutes Übungsmaterial kostet Zeit, die im Schulalltag fehlt.</h2>
        <DreiKarten karten={[
          { kicker: "Im Alltag", titel: "Suchen, abtippen, nachrechnen", text: "Aufgaben aus drei Büchern zusammensuchen, Zahlen ändern, damit niemand die Lösung kennt, und am Ende das Lösungsblatt selbst durchrechnen – für eine einzige Übungsstunde." },
          { kicker: "Im Kopf", titel: "Stimmt das Lösungsblatt wirklich?", text: "Ein Tippfehler im Lösungsblatt, und die halbe Klasse zweifelt an der richtigen Rechnung. Spätabends geschrieben, morgens unsicher – das kennen viele." },
          { kicker: "Dahinter", titel: "Der Mythos vom Mathetalent", text: "Schnell teilt sich eine Klasse in „kann Mathe“ und „kann es nicht“. Dabei ist Mathe kein Talent, sondern ein System, das man üben kann. Üben darf deshalb nie daran scheitern, dass gutes Material fehlt." },
        ]} />
      </Abschnitt>

      {/* 3 · MENTOR – Empathie, Autorität, Haltung */}
      <Abschnitt hell>
        <p style={KICKER}>Warum es das gibt</p>
        <h2 style={H2}>Gebaut von jemandem, der seit Jahren mit Schülern rechnet.</h2>
        <p style={P}>
          Ich bin Basti von Mythos Mathe. Seit Jahren gebe ich Mathe-Nachhilfe und sehe jede Woche, was ein Schüler braucht, um sicher zu werden: viele ähnliche Aufgaben, sauber gestellt, mit einer Lösung, die stimmt. Genau das wollte ich auch Ihnen in die Hand geben.
        </p>
        <p style={P}>
          Ich studiere Mathematik an der Universität Konstanz. Hinter dem Generator stehen dieselben Aufgaben-Generatoren, mit denen in der App trainiert wird: Jede Aufgabe wird nach festen Regeln erzeugt, jede Lösung von der App berechnet und automatisch getestet – auch darauf, dass kein Ergebnis unvereinfacht stehen bleibt.
        </p>
        <p style={{ ...P, color: C.tinte, fontWeight: 600 }}>
          Sie kennen Ihre Klasse und entscheiden, was geübt wird. Ich liefere nur das Material – so schnell, dass die Zeit wieder in den Unterricht geht.
        </p>
      </Abschnitt>

      {/* 4 · LÖSUNG – Plan, Versprechen, Werkzeuge */}
      <Abschnitt id="lk-plan">
        <p style={KICKER}>So funktioniert es</p>
        <h2 style={H2}>Drei Schritte zum fertigen Blatt.</h2>
        <DreiKarten nummer karten={[
          { titel: "Klasse wählen", text: "Schulart und Klassenstufe antippen. Mit Lehrer-Konto reicht ein Tipp auf Ihre Klasse." },
          { titel: "Themen anhaken", text: "Kapitel wie im Schulbuch, darin die Unterthemen. Auch über mehrere Kapitel – etwa für die Wiederholung vor der Klassenarbeit." },
          { titel: "PDF drucken", text: "5 bis 20 Aufgaben, leicht bis schwer oder aufsteigend, mit Rechenraum oder kompakt – und das Lösungsblatt gleich dazu." },
        ]} />
        <div style={{ marginTop: 28, background: C.seeTief, borderRadius: 20, padding: "24px 22px", color: C.weiss }}>
          <p style={{ ...KICKER, color: C.flaggold }}>Unsere Zusagen</p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15.5, lineHeight: 1.85, color: C.goldText }}>
            <li><strong style={{ color: C.weiss }}>Kostenlos</strong> – ohne Konto, ohne Testphase, ohne Haken.</li>
            <li><strong style={{ color: C.weiss }}>Jede Lösung nachgerechnet</strong> – von der App, nicht abgeschrieben.</li>
            <li><strong style={{ color: C.weiss }}>Jedes Blatt neu</strong> – keine Aufgaben, die im Netz kursieren.</li>
            <li><strong style={{ color: C.weiss }}>Keine Werbung auf dem Blatt</strong> – nur eine dezente Fußzeile mit QR-Code zum Weiterüben.</li>
          </ul>
        </div>
        <DreiKarten karten={[
          { kicker: "Kostenlos", titel: "Arbeitsblatt-Generator", text: "Aufgabenblatt und Lösungsblatt als PDF, Gruppe A und B, Blattkopf mit Schule, Klasse und Datum." },
          { kicker: "Kostenlos", titel: "Lehrer-Konto", text: "Klassen anlegen, Klassencode an die Schüler geben, Aktivität als Ampel sehen und Arbeitsblätter speichern." },
          { kicker: "Für Ihre Schüler", titel: "Weiterüben mit Lösungsweg", text: "Der QR-Code auf dem Blatt führt zum passenden Training in der App – mit Hinweisen, wenn jemand festhängt." },
        ]} />
        <div style={{ marginTop: 28 }}><Knopf onClick={zumGenerator} testid="lk-start-2">Arbeitsblatt erstellen</Knopf></div>
      </Abschnitt>

      {/* 5 · REISE – Erfolg und Scheitern */}
      <Abschnitt hell>
        <p style={KICKER}>Zwei Wege</p>
        <h2 style={H2}>Was sich ändert – und was bleibt, wenn alles bleibt.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <div style={{ background: "#FFFBEF", border: `1.5px solid ${C.goldWarm}`, borderRadius: 18, padding: "20px 18px" }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, margin: "0 0 8px" }}>Mit dem Generator</p>
            <p style={{ fontSize: 14.5, color: C.grau, lineHeight: 1.65, margin: 0 }}>Die Übungsstunde steht in zwei Minuten. Gruppe A und B liegen auf dem Pult, das Lösungsblatt stimmt, und wer schneller ist, scannt den QR-Code und übt weiter.</p>
          </div>
          <div style={{ background: C.sand, border: `1.5px solid ${C.linie}`, borderRadius: 18, padding: "20px 18px" }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, margin: "0 0 8px" }}>Ohne</p>
            <p style={{ fontSize: 14.5, color: C.grau, lineHeight: 1.65, margin: 0 }}>Weiter Aufgaben zusammensuchen und Lösungen von Hand rechnen. Das geht – kostet aber jede Woche Zeit, die für die Schüler selbst fehlt.</p>
          </div>
        </div>
      </Abschnitt>

      <Abschnitt>
        <p style={KICKER}>Fragen</p>
        <h2 style={H2}>Was Lehrkräfte wissen wollen</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FRAGEN.map(([f, a]) => (
            <details key={f} style={{ background: C.weiss, borderRadius: 14, padding: "4px 18px", boxShadow: "0 1px 8px rgba(15,26,51,0.05)" }}>
              <summary style={{ cursor: "pointer", fontSize: 15.5, fontWeight: 700, color: C.tinte, padding: "14px 0", minHeight: 24 }}>{f}</summary>
              <p style={{ ...P, fontSize: 15, marginTop: 0 }}>{a}</p>
            </details>
          ))}
        </div>
      </Abschnitt>

      {/* Abschluss – Aufruf */}
      <section style={{ background: `linear-gradient(165deg, ${C.seeTief} 0%, ${C.see} 100%)`, padding: "60px 0 110px" }}>
        <div style={{ ...INNEN, textAlign: "center" }}>
          <h2 className="titel-silber" style={{ ...H2, color: undefined, margin: "0 auto 14px", maxWidth: 560 }}>Ihr nächstes Übungsblatt ist zwei Minuten entfernt.</h2>
          <p style={{ fontSize: 16, color: C.goldText, lineHeight: 1.65, margin: "0 auto 24px", maxWidth: 520 }}>Kostenlos, ohne Konto, mit Lösungsblatt.</p>
          <Knopf onClick={zumGenerator} testid="lk-start-3">Arbeitsblatt erstellen</Knopf>
        </div>
      </section>

      {/* feste Leiste auf dem Handy */}
      <div className="lk-leiste" style={{ position: "fixed", left: 0, right: 0, bottom: 0, padding: "10px 16px calc(10px + env(safe-area-inset-bottom))", background: "rgba(14,30,74,0.96)", zIndex: 40 }}>
        <button type="button" onClick={zumGenerator} style={{ width: "100%", minHeight: 50, borderRadius: 999, border: "none", background: GOLD, color: C.seeTief, fontFamily: "inherit", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>Arbeitsblatt erstellen</button>
      </div>
      <style>{"@media (min-width: 760px){.lk-leiste{display:none}}"}</style>
    </div>
  );
}
