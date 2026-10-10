import React, { useState, useEffect } from "react";
import { C } from "./base1.jsx";

/* ======================================================================
   ELTERNKURS — sieben Inputs für Eltern: die sechs meistgesehenen
   TED-Talks und das Buch „Selbstbild“ von Carol Dweck.
   Die Seite zeigt erst die sieben Kapitel als Buttons, ein Klick öffnet
   das Kapitel; mit Zurück/Weiter kann man durchklicken.

   Buchcover: Liegt die Datei public/elternkurs/selbstbild.jpg vor, wird
   sie verwendet. Sonst versucht die Seite das Cover der Open Library
   (ISBN 978-3-492-31122-9). Klappt beides nicht, erscheint ein
   gezeichnetes Cover.
   ====================================================================== */

export const ELTERNKURS = [
  { id: "robinson", art: "ted", nr: 1, titel: "Do schools kill creativity?", sprecher: "Sir Ken Robinson", video: "iG9CE55wbtY",
    kurz: "Warum Schule oft das Gegenteil von dem fördert, was Kinder mitbringen." },
  { id: "cuddy", art: "ted", nr: 2, titel: "Your body language may shape who you are", sprecher: "Amy Cuddy", video: "Ks-_Mh1QhMc",
    kurz: "Wie Körperhaltung beeinflusst, wie wir uns fühlen und auftreten." },
  { id: "sinek", art: "ted", nr: 3, titel: "How great leaders inspire action", sprecher: "Simon Sinek", video: "qp0HIF3SfI4",
    kurz: "Warum das Wozu stärker wirkt als das Was." },
  { id: "brown", art: "ted", nr: 4, titel: "The power of vulnerability", sprecher: "Brené Brown", video: "iCvmsMzlF7o",
    kurz: "Was Mut, Zugehörigkeit und Verletzlichkeit miteinander zu tun haben." },
  { id: "treasure", art: "ted", nr: 5, titel: "How to speak so that people want to listen", sprecher: "Julian Treasure", video: "eIho2S0ZahI",
    kurz: "Wie man so spricht, dass andere wirklich zuhören." },
  { id: "urban", art: "ted", nr: 6, titel: "Inside the mind of a master procrastinator", sprecher: "Tim Urban", video: "arj7oStGLkU",
    kurz: "Was im Kopf passiert, wenn man Wichtiges vor sich herschiebt." },
  { id: "dweck", art: "buch", nr: 7, titel: "Selbstbild", sprecher: "Carol Dweck", isbn: "9783492311229",
    kurz: "Wie unser Denken über Begabung Erfolge oder Niederlagen bewirkt.",
    text: [
      "Carol Dweck hat über Jahrzehnte erforscht, warum manche Menschen an Rückschlägen wachsen und andere daran zerbrechen. Ihr Kernbefund: Entscheidend ist weniger die Begabung als die Überzeugung, ob Fähigkeiten feststehen oder sich entwickeln lassen.",
      "Wer glaubt, Talent sei angeboren, vermeidet Fehler und gibt schnell auf, sobald es schwierig wird. Wer glaubt, dass man durch Übung besser wird, sucht Herausforderungen und nutzt Fehler zum Lernen. Für Eltern heißt das: Lob für Anstrengung und Strategie stärkt Kinder mehr als Lob für „Du bist so schlau“.",
    ] },
];

const SCHATTEN = "0 2px 16px rgba(15,26,51,0.07)";

/* Gezeichnetes Ersatz-Cover, falls kein Bild geladen werden kann */
function BuchErsatz() {
  return (
    <svg viewBox="0 0 200 290" role="img" aria-label="Buchcover Selbstbild von Carol Dweck" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="200" height="290" fill={C.seeTief} />
      <rect x="14" y="14" width="172" height="262" fill="none" stroke={C.flaggold} strokeWidth="1.5" />
      <text x="100" y="118" textAnchor="middle" fontSize="26" fontWeight="700" fill="#FFFFFF" fontFamily="Montserrat, system-ui, sans-serif">Selbstbild</text>
      <rect x="73" y="132" width="54" height="4" rx="2" fill={C.flaggold} />
      <text x="100" y="236" textAnchor="middle" fontSize="13" fontWeight="500" fill="#C9D6EE" fontFamily="Montserrat, system-ui, sans-serif">Carol Dweck</text>
    </svg>
  );
}

function BuchBild({ isbn }) {
  const quellen = ["/elternkurs/selbstbild.jpg", `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`];
  const [i, setI] = useState(0);
  return (
    <div style={{ width: 190, aspectRatio: "200 / 290", borderRadius: 6, overflow: "hidden", boxShadow: "0 8px 28px rgba(15,26,51,0.22)", background: C.hellgrau, margin: "0 auto" }}>
      {i < quellen.length ? (
        <img src={quellen[i]} alt="Buchcover: Selbstbild von Carol Dweck" onError={() => setI(i + 1)}
          onLoad={(e) => { if (e.currentTarget.naturalWidth < 20) setI(i + 1); }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : <BuchErsatz />}
    </div>
  );
}

function Kapitel({ k }) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 6 }}>
        {k.art === "ted" ? "TED-Talk" : "Buch"} · {k.sprecher}
      </p>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 18 }}>{k.titel}</h2>

      {k.art === "ted" ? (
        <div style={{ borderRadius: 16, overflow: "hidden", background: "#000", boxShadow: "0 3px 18px rgba(15,26,51,0.1)" }}>
          <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
            <iframe key={k.video} src={`https://www.youtube-nocookie.com/embed/${k.video}?rel=0&modestbranding=1&playsinline=1`}
              title={`${k.titel} – ${k.sprecher} (TED)`} loading="lazy" allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
          </div>
        </div>
      ) : (
        <div style={{ background: C.weiss, borderRadius: 16, padding: "28px 22px 24px", boxShadow: SCHATTEN }}>
          <BuchBild isbn={k.isbn} />
          <div style={{ marginTop: 24 }}>
            {k.text.map((t, i) => (
              <p key={i} style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: i < k.text.length - 1 ? 14 : 0 }}>{t}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ElternkursSeite() {
  const [offen, setOffen] = useState(null); // Index des geöffneten Kapitels oder null = Übersicht
  useEffect(() => { window.scrollTo(0, 0); }, [offen]);

  const knopf = (aktiv) => ({
    fontFamily: "inherit", cursor: "pointer", fontSize: 14.5, fontWeight: 600, padding: "13px 18px", borderRadius: 12,
    border: aktiv ? "none" : `1.5px solid ${C.linie}`, background: aktiv ? C.see : C.weiss, color: aktiv ? C.weiss : C.tinte,
  });

  if (offen === null) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>Sieben Impulse für Eltern</h2>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 22 }}>
          Sechs der meistgesehenen TED-Talks und ein Buch, das erklärt, warum Mathe keine Frage von Talent ist. Du kannst die Kapitel der Reihe nach durchklicken.
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {ELTERNKURS.map((k, i) => (
            <button key={k.id} onClick={() => setOffen(i)} aria-label={`Kapitel ${k.nr}: ${k.titel}`}
              style={{ display: "flex", alignItems: "center", gap: 16, textAlign: "left", width: "100%", fontFamily: "inherit", cursor: "pointer",
                background: C.weiss, border: "none", borderRadius: 16, padding: "16px 18px", boxShadow: SCHATTEN }}>
              <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss, fontSize: 16, fontWeight: 700 }}>{k.nr}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.gruenDunkel, marginBottom: 2 }}>
                  {k.art === "ted" ? "TED-Talk" : "Buch"} · {k.sprecher}
                </span>
                <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{k.titel}</span>
                <span style={{ display: "block", fontSize: 13, fontWeight: 300, color: C.grau, lineHeight: 1.5, marginTop: 3 }}>{k.kurz}</span>
              </span>
              <svg width="9" height="15" viewBox="0 0 9 15" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M1.5 1.5 L7.5 7.5 L1.5 13.5" fill="none" stroke={C.see} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const k = ELTERNKURS[offen];
  const zurueck = offen > 0 ? offen - 1 : null;
  const weiter = offen < ELTERNKURS.length - 1 ? offen + 1 : null;

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 26 }}>
      <button onClick={() => setOffen(null)}
        style={{ fontFamily: "inherit", cursor: "pointer", background: "none", border: "none", padding: 0, marginBottom: 18, fontSize: 13.5, fontWeight: 600, color: C.see }}>
        ← Alle Kapitel
      </button>

      <div role="tablist" aria-label="Kapitel" style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        {ELTERNKURS.map((x, i) => (
          <button key={x.id} role="tab" aria-selected={i === offen} aria-label={`Kapitel ${x.nr}`} onClick={() => setOffen(i)}
            style={{ flex: 1, height: 36, borderRadius: 10, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700,
              border: i === offen ? "none" : `1.5px solid ${C.linie}`, background: i === offen ? C.see : C.weiss, color: i === offen ? C.weiss : C.grau }}>{x.nr}</button>
        ))}
      </div>
      <p style={{ fontSize: 12.5, fontWeight: 300, color: C.grau, marginBottom: 22 }}>Kapitel {k.nr} von {ELTERNKURS.length}</p>

      <Kapitel k={k} />

      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        {zurueck !== null ? (
          <button onClick={() => setOffen(zurueck)} style={{ ...knopf(false), flex: 1 }}>← Zurück</button>
        ) : <span style={{ flex: 1 }} />}
        {weiter !== null ? (
          <button onClick={() => setOffen(weiter)} style={{ ...knopf(true), flex: 1 }}>Weiter →</button>
        ) : (
          <button onClick={() => setOffen(null)} style={{ ...knopf(true), flex: 1 }}>Zur Übersicht</button>
        )}
      </div>
    </div>
  );
}
