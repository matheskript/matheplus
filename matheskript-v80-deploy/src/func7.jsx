import React, { useState, useRef } from "react";
import { API_URL, C, DEMO_VIDEO_ID, ganz, zuf } from "./base1.jsx";
import { AFB_FARBE, BEGRUENDEN, DIAG, KOMP, LEITIDEEN, LERN, LINIEN, OPERATOREN, OPERATOR_FAELLE, PHASEN_NAME, SR_ABSTAENDE, TEST_ANZAHL, TEST_GRENZE, UEBEN_ANZAHL, VISUALISIERUNGEN, VORAUSBLICK, aktiv, hatEinheit, messungHalten, messungNach, messungVor, mischen } from "./base3.jsx";
import { kiKopf, kiAntwort } from "./base4.jsx";
import { ErklaerVideo, Satz, jsonLesen } from "./func1.jsx";
import { Formel, M, Text, alsFunktion, normieren, stimmtUeberein, zahlAus } from "./func3.jsx";
import { TermTastatur, kubischErzeugen } from "./func4.jsx";
import { Lernlandkarte, antwortPruefen, brueckeErgebnis, einheitVon, lernAendern, testBestanden, testNichtBestanden, useLern, wannFaellig, wiederholListe, wiederholungErgebnis } from "./func6.jsx";
import { EskalationsKarte, aktivitaetMelden, coachingAnfragen, eskalationSignale, variantenFestschreiben, variantenVorschlag } from "./func8.jsx";
import { Mathilda } from "./func10.jsx";

export function MathildaTutor({ kompetenz, aufgabe, eingabe, onSchliessen }) {
  const L = useLern();
  const [verlauf, setVerlauf] = useState([
    { rolle: "mathilda", text: "Woran hängst du gerade? Schreib mir, was du schon hast — oder an welcher Stelle du nicht weiterkommst." },
  ]);
  const [text, setText] = useState("");
  const [laedt, setLaedt] = useState(false);
  const endeRef = useRef(null);

  const kontext = `Du bist Mathilda, Tutorin im Lernsystem Matheskript für Gymnasiasten.
Der Schüler heißt ${L.profil?.name || "unbekannt"} und ist in Klasse ${L.profil?.klasse || "?"}.
Er arbeitet an der Kompetenz „${kompetenz.titel}": ${kompetenz.kann}
Aktuelle Aufgabe: ${aufgabe ? aufgabe.frage.replace(/\$/g, "") : "keine"}
${eingabe ? `Sein bisheriger Eintrag: ${eingabe}` : ""}

Regeln, die nie gebrochen werden:
- Nenne niemals das Endergebnis und niemals den vollständigen Lösungsweg.
- Pro Antwort genau eine Frage oder genau ein Hinweis. Höchstens drei kurze Sätze.
- Knüpfe an das an, was der Schüler schreibt, und frag nach, was er schon weiß.
- Bewerte nie die Person, nur den Gedanken. Kein Lob-Geschwafel.
- Wenn der Schüler frustriert ist: ein Satz Beruhigung, dann eine kleine, lösbare Frage.
- Formeln in LaTeX zwischen Dollarzeichen, etwa $x^2$.
Antworte auf Deutsch, ohne Vorrede.`;

  const verraet = (antwort) => {
    if (!aufgabe) return false;
    const lo = String(aufgabe.loesung);
    if (aufgabe.art === "term" && lo.length >= 3) {
      const a = normieren(antwort).replace(/\s/g, ""), b = normieren(lo).replace(/\s/g, "");
      return a.includes(b);
    }
    const esc = lo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`=\\s*\\$?\\s*${esc}(?![0-9.,])`).test(antwort);
  };

  const senden = async () => {
    const t = text.trim();
    if (!t || laedt) return;
    const neu = [...verlauf, { rolle: "schueler", text: t }];
    setVerlauf(neu); setText(""); setLaedt(true);
    aktivitaetMelden({ hilfe: true });
    const nachrichten = [{ role: "user", content: kontext }, { role: "assistant", content: verlauf[0].text }]
      .concat(neu.slice(1).map((m) => ({ role: m.rolle === "schueler" ? "user" : "assistant", content: m.text })));
    try {
      const res = await fetch(API_URL, {
        method: "POST", headers: kiKopf(),
        body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 400, messages: nachrichten }),
      });
      const daten = await kiAntwort(res);
      let antwort = (daten.content || []).map((x) => (x.type === "text" ? x.text : "")).join("").trim();
      if (!antwort) antwort = "Da ist gerade etwas schiefgegangen. Magst du es noch einmal schreiben?";
      if (verraet(antwort)) antwort = "Das Ergebnis verrate ich dir nicht — aber ich helfe dir hin. Was steht bei dir in der ersten Zeile?";
      setVerlauf([...neu, { rolle: "mathilda", text: antwort }]);
    } catch (e) {
      setVerlauf([...neu, { rolle: "mathilda", text: "Ich bin gerade nicht erreichbar. Versuch es gleich noch einmal." }]);
    } finally {
      setLaedt(false);
      setTimeout(() => endeRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(14,30,74,0.5)", zIndex: 130, display: "flex", alignItems: "flex-end" }}>
      <div className="auftauchen" style={{ width: "100%", maxWidth: 620, margin: "0 auto", background: C.sand, borderRadius: "20px 20px 0 0",
        maxHeight: "86vh", display: "flex", flexDirection: "column" }}>
        <div className="flex items-center justify-between" style={{ padding: "14px 20px", background: C.seeTief, borderRadius: "20px 20px 0 0" }}>
          <span style={{ color: C.weiss, fontSize: 15.5, fontWeight: 600 }}>
            Frag <span style={{ color: C.gruen }}>Mathilda</span>
          </span>
          <button onClick={onSchliessen} style={{ background: "none", border: "none", color: "#C9D6EE", fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
            schließen
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
          {verlauf.filter((m) => m.rolle === "schueler").length >= 3 && (
            <div style={{ background: C.himmel, borderRadius: 12, padding: "10px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: C.tinte, marginBottom: 6 }}>
                Wenn wir hier zu zweit nicht weiterkommen, ist das kein Problem — dann schaut Basti persönlich drauf.
              </p>
              <button onClick={() => coachingAnfragen(`Festgefahren bei ${kompetenz.titel}`)}
                style={{ background: "none", border: "none", color: C.gruenDunkel, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                Mit Basti sprechen
              </button>
            </div>
          )}
          {aufgabe && (
            <div style={{ background: C.weiss, borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13.5, color: C.grau }}>
              <Text s={aufgabe.frage} style={{ margin: 0, lineHeight: 1.7 }} />
            </div>
          )}
          {verlauf.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.rolle === "schueler" ? "flex-end" : "flex-start", marginBottom: 10 }}>
              <div style={{ maxWidth: "84%", padding: "10px 14px", borderRadius: 16,
                background: m.rolle === "schueler" ? C.see : C.weiss, color: m.rolle === "schueler" ? C.weiss : C.tinte,
                boxShadow: m.rolle === "schueler" ? "none" : "0 2px 10px rgba(15,26,51,0.06)",
                borderBottomRightRadius: m.rolle === "schueler" ? 4 : 16, borderBottomLeftRadius: m.rolle === "schueler" ? 16 : 4 }}>
                <Text s={m.text} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7 }} />
              </div>
            </div>
          ))}
          {laedt && <p style={{ fontSize: 13, color: C.hellgrau }}>Mathilda denkt nach …</p>}
          <div ref={endeRef} />
        </div>

        <div className="flex" style={{ gap: 8, padding: "12px 16px 18px", borderTop: `1px solid ${C.linie}` }}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && senden()}
            placeholder="Schreib Mathilda …"
            style={{ flex: 1, padding: "11px 14px", fontSize: 15, fontFamily: "inherit", border: `1px solid ${C.linie}`,
              borderRadius: 999, outline: "none", background: C.weiss }} />
          <button onClick={senden} disabled={laedt || !text.trim()}
            style={{ padding: "0 18px", background: text.trim() ? C.gruenDunkel : C.hellgrau, color: C.weiss, border: "none",
              borderRadius: 999, fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Der Lerneinheit-Spieler ---------- */


export function AufgabeFeld({ aufgabe, wert, setWert, stand }) {
  const [tastatur, setTastatur] = useState(false);
  const rand = stand === "ok" ? C.see : stand === "nein" ? C.signal : C.linie;
  return (
    <div>
      {aufgabe.praefix && <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}><M t={aufgabe.praefix} /></p>}
      {tastatur && aufgabe.art === "term" ? (
        <TermTastatur wert={wert} setWert={setWert} />
      ) : (
        <input value={wert} onChange={(e) => setWert(e.target.value)} placeholder="Ergebnis"
          style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", fontSize: 16.5, fontFamily: "inherit",
            border: `1.5px solid ${rand}`, borderRadius: 12, outline: "none", background: stand === "ok" ? C.himmel : C.weiss }} />
      )}
      {aufgabe.art === "term" && (
        <button onClick={() => setTastatur(!tastatur)} className="mt-2"
          style={{ background: "none", border: "none", color: C.see, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
          {tastatur ? "Lieber selbst tippen" : "Tastenfeld benutzen"}
        </button>
      )}
      {aufgabe.hinweis && <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, marginTop: 6 }}>{aufgabe.hinweis}</p>}
    </div>
  );
}


export function WegAnzeige({ weg, bis }) {
  return (
    <div>
      {weg.slice(0, bis).map((s, i) => (
        <div key={i} className="auftauchen" style={{ marginBottom: 12 }}>
          <div className="flex" style={{ gap: 10 }}>
            <span style={{ color: C.gruenDunkel, fontWeight: 700, fontSize: 13, width: 16, flexShrink: 0 }}>{i + 1}</span>
            <Text s={s.t} style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: C.grau }} />
          </div>
          {s.f && <div style={{ fontSize: 16.5, lineHeight: 2, marginLeft: 26, overflowX: "auto" }}><M t={s.f} /></div>}
        </div>
      ))}
    </div>
  );
}


export function EinheitSpieler({ id, gehe }) {
  const L = useLern();
  const k = KOMP[id];
  const e = einheitVon(id);
  const hatBeispiele = !e?.kurzform && !!e?.erzeuger;
  const [variante] = useState(() => variantenVorschlag(id));
  const [mitVortest] = useState(() => !!e?.erzeuger && !LERN.messungen?.[id]?.vor && !!LERN.profil);
  const [vortest] = useState(() => (e?.erzeuger ? [e.erzeuger(), e.erzeuger()] : []));
  const [vtNr, setVtNr] = useState(0);
  const [vtEingabe, setVtEingabe] = useState("");
  const [vtOk, setVtOk] = useState(0);
  React.useEffect(() => { variantenFestschreiben(id, variante); }, []);

  /* Rückwärtsbrücke: Woran knüpft die Station an? Eine Aufgabe von dort holt es hoch. */
  const rueckListe = (KOMP[id]?.rueck || []).filter((r) => aktiv(r.id));
  const [brAufgabe] = useState(() => {
    const r = (KOMP[id]?.rueck || []).find((x) => aktiv(x.id) && einheitVon(x.id)?.erzeuger);
    return r ? { id: r.id, aufgabe: einheitVon(r.id).erzeuger() } : null;
  });
  const [brEingabe, setBrEingabe] = useState("");
  const [brStand, setBrStand] = useState(null);
  const kern = variante === "B" ? ["verstehen", "einstieg"] : [e?.einstieg && "einstieg", "verstehen"];
  const phasen = [mitVortest && "vortest", rueckListe.length > 0 && "bruecke", ...kern, hatBeispiele && "beispiele", "ueben", "test"].filter(Boolean);

  const [phase, setPhase] = useState(phasen[0]);
  const [einstiegOffen, setEinstiegOffen] = useState(false);
  const [tutor, setTutor] = useState(null);

  // Beispiele mit schrittweisem Ausblenden
  const beispiele = React.useMemo(() => (hatBeispiele ? [0, 1, 2, 3].map(() => e.erzeuger()) : []), [id]);
  const [bspNr, setBspNr] = useState(0);
  const [bspAufgedeckt, setBspAufgedeckt] = useState(0);
  const [bspEingabe, setBspEingabe] = useState("");
  const [bspStand, setBspStand] = useState(null);

  // Üben
  const [ueb, setUeb] = useState(() => e?.erzeuger());
  const [uebNr, setUebNr] = useState(0);
  const [uebOk, setUebOk] = useState(0);
  const [uebEingabe, setUebEingabe] = useState("");
  const [uebStand, setUebStand] = useState(null);
  const [uebWeg, setUebWeg] = useState(false);

  // Test
  const [testListe, setTestListe] = useState(null);
  const [testNr, setTestNr] = useState(0);
  const [testEingabe, setTestEingabe] = useState("");
  const [testErg, setTestErg] = useState([]);

  if (!k || !e) return <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620 }}><p>Für diese Kompetenz gibt es noch keine Einheit.</p></div>;

  const idee = LEITIDEEN.find((i) => i.id === k.idee);
  const st = L.stand[id] || {};
  const phaseIdx = phasen.indexOf(phase);
  const weiter = () => { const n = phasen[phaseIdx + 1]; if (n) { setPhase(n); window.scrollTo(0, 0); } };

  // --- Beispiele ---
  const bsp = beispiele[bspNr];
  const ausgeblendet = bsp ? Math.min(bspNr, bsp.weg.length) : 0;
  const sichtbar = bsp ? bsp.weg.length - ausgeblendet + bspAufgedeckt : 0;
  const bspWeiter = () => {
    if (bspNr < 3) { setBspNr(bspNr + 1); setBspAufgedeckt(0); setBspEingabe(""); setBspStand(null); }
    else weiter();
  };

  // --- Üben ---
  const uebPruefen = () => {
    const ok = antwortPruefen(ueb, uebEingabe);
    aktivitaetMelden({ ok });
    setUebStand(ok ? "ok" : "nein");
    if (ok) setUebOk(uebOk + 1);
    lernAendern((X) => {
      const alt = X.stand[id] || {};
      X.stand[id] = { ...alt, status: alt.status === "sicher" ? "sicher" : "arbeit", n: (alt.n || 0) + 1, ok: (alt.ok || 0) + (ok ? 1 : 0), zuletzt: Date.now() };
    });
  };
  const uebNeu = () => { setUeb(e.erzeuger()); setUebNr(uebNr + 1); setUebEingabe(""); setUebStand(null); setUebWeg(false); };

  // --- Test ---
  const testStarten = () => {
    setTestListe(Array.from({ length: TEST_ANZAHL }, () => e.erzeuger()));
    setTestNr(0); setTestEingabe(""); setTestErg([]);
  };
  const testAntwort = () => {
    const ok = antwortPruefen(testListe[testNr], testEingabe);
    aktivitaetMelden({ ok });
    const erg = [...testErg, ok];
    setTestErg(erg); setTestEingabe("");
    if (testNr + 1 < TEST_ANZAHL) setTestNr(testNr + 1);
    else {
      const richtig = erg.filter(Boolean).length;
      if (richtig >= TEST_GRENZE) testBestanden(id); else testNichtBestanden(id);
      messungNach(id, richtig, TEST_ANZAHL);
      setTestNr(TEST_ANZAHL);
    }
  };
  const testFertig = testListe && testNr >= TEST_ANZAHL;
  const testRichtig = testErg.filter(Boolean).length;

  const Vis = e.visual ? VISUALISIERUNGEN[e.visual] : null;
  const karte = { background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 16 };
  const hauptKnopf = { height: 48, padding: "0 26px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999,
    fontSize: 15.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" };
  const nebenKnopf = { height: 48, padding: "0 22px", background: C.weiss, color: C.see, border: `1px solid ${C.linie}`,
    borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <button onClick={() => gehe({ ansicht: "karte" })} className="mb-4"
        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        ← Lernlandkarte
      </button>

      {/* Phasenleiste */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${phasen.length}, 1fr)`, gap: 4, marginBottom: 6 }}>
        {phasen.map((ph, i) => (
          <button key={ph} onClick={() => i <= phaseIdx && setPhase(ph)}
            style={{ height: 6, borderRadius: 999, border: "none", padding: 0, cursor: i <= phaseIdx ? "pointer" : "default",
              background: i < phaseIdx ? C.see : i === phaseIdx ? C.gruenDunkel : C.linie }} />
        ))}
      </div>
      <div className="flex justify-between" style={{ marginBottom: 18 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel }}>{PHASEN_NAME[phase]}</span>
        <span style={{ fontSize: 12, color: C.hellgrau }}>
          {st.festigung ? `Festigung ${st.festigung}/${SR_ABSTAENDE.length} · ${wannFaellig(st.faellig)}` : `${phaseIdx + 1} von ${phasen.length}`}
        </span>
      </div>

      {/* 0 · Vortest */}
      {phase === "vortest" && vortest[vtNr] && (
        <div>
          <p style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.75, marginBottom: 14 }}>
            Bevor es losgeht: zwei kurze Aufgaben. Sie werden nicht bewertet und es gibt keine Rückmeldung — sie
            halten nur fest, wo du vorher stehst, damit sich nachher zeigt, was die Einheit gebracht hat.
          </p>
          <div style={karte}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: C.see, marginBottom: 10 }}>Vortest {vtNr + 1} von 2</p>
            <Text s={vortest[vtNr].frage} style={{ fontSize: 16.5, lineHeight: 1.8, marginBottom: 14 }} />
            <AufgabeFeld aufgabe={vortest[vtNr]} wert={vtEingabe} setWert={setVtEingabe} stand={null} />
            <div className="flex flex-wrap gap-3 mt-4">
              {[true, false].map((versucht) => (
                <button key={String(versucht)} disabled={versucht && !vtEingabe.trim()}
                  onClick={() => {
                    const ok = versucht && antwortPruefen(vortest[vtNr], vtEingabe);
                    const summe = vtOk + (ok ? 1 : 0);
                    setVtOk(summe); setVtEingabe("");
                    if (vtNr === 0) setVtNr(1); else { messungVor(id, summe, 2); weiter(); }
                  }}
                  style={versucht ? hauptKnopf : nebenKnopf}>
                  {versucht ? "Weiter" : "Weiß ich nicht"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Anknüpfen: Das kennst du schon */}
      {phase === "bruecke" && (
        <div>
          <div style={{ ...karte, borderTop: `4px solid ${C.gruenDunkel}` }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.gruenDunkel, marginBottom: 12 }}>Das kennst du schon</p>
            {rueckListe.map((r, i) => {
              const vk = KOMP[r.id], vl = LINIEN.find((l) => l.id === vk.idee);
              return (
                <div key={i} style={{ borderLeft: `3px solid ${vl?.farbe || C.see}`, paddingLeft: 12, marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: vl?.farbe, marginBottom: 2 }}>{vl?.kurz} · {vk.titel}</p>
                  <Text s={r.satz} style={{ fontSize: 15, lineHeight: 1.75, margin: 0 }} />
                </div>
              );
            })}
          </div>

          {brAufgabe && (
            <div style={karte}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: C.see, marginBottom: 10 }}>
                Zum Aufwärmen, eine Aufgabe von dort
              </p>
              <Text s={brAufgabe.aufgabe.frage} style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 14 }} />
              <AufgabeFeld aufgabe={brAufgabe.aufgabe} wert={brEingabe} setWert={(w) => { setBrEingabe(w); setBrStand(null); }} stand={brStand} />
              {!brStand ? (
                <div className="flex flex-wrap gap-3 mt-4">
                  <button disabled={!brEingabe.trim()} style={hauptKnopf}
                    onClick={() => { const ok = antwortPruefen(brAufgabe.aufgabe, brEingabe); setBrStand(ok ? "ok" : "nein"); aktivitaetMelden({ ok }); }}>
                    Prüfen
                  </button>
                  <button onClick={weiter} style={nebenKnopf}>Überspringen</button>
                </div>
              ) : (
                <div style={{ borderLeft: `4px solid ${brStand === "ok" ? C.see : C.signal}`, paddingLeft: 14, marginTop: 14 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: brStand === "ok" ? C.see : C.signal, marginBottom: 4 }}>
                    {brStand === "ok" ? "Sitzt — darauf baust du jetzt auf." : "Das ist die Stelle, an der du gleich anknüpfst."}
                  </p>
                  {brStand === "nein" && (
                    <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.9 }}>
                      Richtig wäre <M t={brAufgabe.aufgabe.zeig || brAufgabe.aufgabe.loesung} />. Lies den Satz oben noch einmal — genau das wird gleich gebraucht.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          {(!brAufgabe || brStand) && <button onClick={weiter} style={hauptKnopf}>Weiter: {PHASEN_NAME[phasen[phaseIdx + 1]]}</button>}
        </div>
      )}

      {/* 1 · Einstieg: das Problem zuerst */}
      {phase === "einstieg" && (
        <div>
          <div style={{ ...karte, borderTop: `4px solid ${idee.farbe}` }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: idee.farbe, marginBottom: 10 }}>{variante === "B" ? "Ein Problem zum Anwenden" : "Zuerst ein Problem"}</p>
            <Text s={e.einstieg.text} style={{ fontSize: 16, lineHeight: 1.85, margin: 0 }} />
          </div>
          {!einstiegOffen ? (
            <>
              <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: 16 }}>
                Überleg kurz, bevor du weiterliest. Was vermutest du? Es ist egal, ob du richtig liegst — wer vorher
                nachdenkt, behält die Antwort deutlich besser.
              </p>
              <button onClick={() => setEinstiegOffen(true)} style={hauptKnopf}>Ich habe eine Vermutung</button>
            </>
          ) : (
            <>
              <div className="auftauchen" style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 20 }}>
                <Text s={e.einstieg.aufloesung} style={{ fontSize: 15, lineHeight: 1.8, margin: 0 }} />
              </div>
              <button onClick={weiter} style={hauptKnopf}>Weiter: {PHASEN_NAME[phasen[phaseIdx + 1]]}</button>
            </>
          )}
        </div>
      )}

      {/* 2 · Verstehen */}
      {phase === "verstehen" && (
        <div>
          <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 14 }}>{k.titel}</p>
          {id === "a-regeln" && <ErklaerVideo id={DEMO_VIDEO_ID} titel={k.titel} />}
          {e.verstehen.map((b, i) => {
            if (b.t === "formel") return <Formel key={i} titel={b.titel} zeilen={b.zeilen} />;
            if (b.t === "merk") return (
              <div key={i} style={{ borderLeft: `3px solid ${C.gruen}`, paddingLeft: 16, margin: "18px 0" }}>
                <Text s={b.s} style={{ fontSize: 14.5, lineHeight: 1.85, margin: 0 }} />
              </div>
            );
            return <Text key={i} s={b.s} style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.85, marginBottom: 14 }} />;
          })}
          {Vis && <div style={{ ...karte, marginTop: 8 }}><Vis /></div>}
          <button onClick={weiter} style={hauptKnopf}>Weiter: {PHASEN_NAME[phasen[phaseIdx + 1]]}</button>
        </div>
      )}

      {/* 3 · Beispiele, schrittweise ausgeblendet */}
      {phase === "beispiele" && bsp && (
        <div>
          <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: 14 }}>
            {bspNr === 0 && "Das erste Beispiel ist vollständig vorgerechnet. Lies jeden Schritt und frag dich, warum er dasteht."}
            {bspNr === 1 && "Im zweiten fehlt der letzte Schritt. Den schreibst du selbst."}
            {bspNr === 2 && "Jetzt fehlen die letzten beiden. Deck den ersten auf, wenn du ihn brauchst — das Ergebnis rechnest du."}
            {bspNr === 3 && "Beim letzten steht nur noch der Anfang. Den Rest machst du — die Schritte kannst du dir einzeln holen."}
          </p>
          <div style={karte}>
            <div className="flex justify-between" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: C.see }}>Beispiel {bspNr + 1} von 4</span>
              <span style={{ fontSize: 12, color: C.hellgrau }}>{ausgeblendet === 0 ? "vollständig" : `${ausgeblendet} Schritt${ausgeblendet > 1 ? "e" : ""} fehlen`}</span>
            </div>
            <Text s={bsp.frage} style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 14 }} />
            <WegAnzeige weg={bsp.weg} bis={bspNr === 0 || bspStand ? bsp.weg.length : sichtbar} />

            {bspNr > 0 && !bspStand && bspAufgedeckt < ausgeblendet - 1 && (
              <button onClick={() => setBspAufgedeckt(bspAufgedeckt + 1)} className="mb-3"
                style={{ background: "none", border: "none", color: C.see, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                Nächsten Schritt aufdecken
              </button>
            )}

            {bspNr > 0 && (
              <div style={{ marginTop: 8 }}>
                <AufgabeFeld aufgabe={bsp} wert={bspEingabe} setWert={(w) => { setBspEingabe(w); setBspStand(null); }} stand={bspStand} />
                {!bspStand ? (
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button onClick={() => setBspStand(antwortPruefen(bsp, bspEingabe) ? "ok" : "nein")} disabled={!bspEingabe.trim()} style={hauptKnopf}>Prüfen</button>
                    <button onClick={() => setTutor({ aufgabe: bsp, eingabe: bspEingabe })} style={nebenKnopf}>Frag Mathilda</button>
                  </div>
                ) : (
                  <div style={{ borderLeft: `4px solid ${bspStand === "ok" ? C.see : C.signal}`, paddingLeft: 14, marginTop: 14 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: bspStand === "ok" ? C.see : C.signal }}>
                      {bspStand === "ok" ? "Stimmt." : "Noch nicht — der vollständige Weg steht jetzt oben."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          {(bspNr === 0 || bspStand) && <button onClick={bspWeiter} style={hauptKnopf}>{bspNr < 3 ? "Nächstes Beispiel" : "Jetzt üben"}</button>}
        </div>
      )}

      {/* 4 · Üben */}
      {phase === "ueben" && ueb && (
        <div>
          <div className="flex justify-between" style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: C.grau, fontWeight: 300 }}>Aufgabe {uebNr + 1}</span>
            <span style={{ fontSize: 13, color: C.see, fontWeight: 600 }}>{uebOk} richtig</span>
          </div>
          <div style={karte}>
            <Text s={ueb.frage} style={{ fontSize: 16.5, lineHeight: 1.8, marginBottom: 14 }} />
            <AufgabeFeld aufgabe={ueb} wert={uebEingabe} setWert={(w) => { setUebEingabe(w); setUebStand(null); }} stand={uebStand} />
            {!uebStand ? (
              <div className="flex flex-wrap gap-3 mt-4">
                <button onClick={uebPruefen} disabled={!uebEingabe.trim()} style={hauptKnopf}>Prüfen</button>
                <button onClick={() => setTutor({ aufgabe: ueb, eingabe: uebEingabe })} style={nebenKnopf}>Frag Mathilda</button>
              </div>
            ) : (
              <div style={{ borderLeft: `4px solid ${uebStand === "ok" ? C.see : C.signal}`, paddingLeft: 14, marginTop: 14 }}>
                <p style={{ fontSize: 15.5, fontWeight: 600, color: uebStand === "ok" ? C.see : C.signal, marginBottom: 6 }}>
                  {uebStand === "ok" ? "Stimmt." : "Stimmt nicht."}
                </p>
                {uebStand === "nein" && (
                  <>
                    {ueb.fallen && (() => {
                      const f = alsFunktion(uebEingabe);
                      const treffer = f && ueb.fallen.find((fa) => { const g = alsFunktion(fa.t); return g && stimmtUeberein(f, g, 1e-5); });
                      return treffer ? <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>{treffer.h}</p> : null;
                    })()}
                    <p style={{ fontSize: 14.5, color: C.see, lineHeight: 2 }}>
                      Richtig wäre <M t={ueb.zeig || ueb.loesung} />
                    </p>
                    {ueb.weg && ueb.weg.length > 0 && !uebWeg && (
                      <button onClick={() => setUebWeg(true)} className="mt-1"
                        style={{ background: "none", border: "none", color: C.see, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                        Den Weg zeigen
                      </button>
                    )}
                    {uebWeg && <div style={{ marginTop: 12 }}><WegAnzeige weg={ueb.weg} bis={ueb.weg.length} /></div>}
                  </>
                )}
              </div>
            )}
          </div>
          {uebStand && (
            <div className="flex flex-wrap gap-3">
              <button onClick={uebNeu} style={uebNr + 1 >= UEBEN_ANZAHL ? nebenKnopf : hauptKnopf}>Nächste Aufgabe</button>
              {uebNr + 1 >= UEBEN_ANZAHL && <button onClick={() => { weiter(); testStarten(); }} style={hauptKnopf}>Zum Test</button>}
            </div>
          )}
          {uebNr + 1 < UEBEN_ANZAHL && (
            <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, marginTop: 14 }}>
              Nach {UEBEN_ANZAHL} Aufgaben öffnet sich der Test.
            </p>
          )}
        </div>
      )}

      {/* 5 · Test */}
      {phase === "test" && (
        <div>
          {!testListe && (
            <div style={karte}>
              <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Der Test</p>
              <p style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.75, marginBottom: 18 }}>
                {TEST_ANZAHL} Aufgaben, ohne Hilfe und ohne Rückmeldung bis zum Schluss. Bei {TEST_GRENZE} richtigen
                gilt die Kompetenz als gesichert — und kommt dann in wachsenden Abständen zur Wiederholung zurück,
                damit sie auch in drei Monaten noch sitzt.
              </p>
              <button onClick={testStarten} style={hauptKnopf}>Test starten</button>
            </div>
          )}
          {testListe && !testFertig && (
            <div style={karte}>
              <div className="flex justify-between" style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.see }}>Testaufgabe {testNr + 1} von {TEST_ANZAHL}</span>
              </div>
              <Text s={testListe[testNr].frage} style={{ fontSize: 16.5, lineHeight: 1.8, marginBottom: 14 }} />
              <AufgabeFeld aufgabe={testListe[testNr]} wert={testEingabe} setWert={setTestEingabe} stand={null} />
              <button onClick={testAntwort} disabled={!testEingabe.trim()} className="mt-4" style={hauptKnopf}>
                {testNr + 1 < TEST_ANZAHL ? "Weiter" : "Abgeben"}
              </button>
            </div>
          )}
          {testFertig && (
            <div>
              <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 18, padding: 24, marginBottom: 16 }}>
                <p style={{ fontSize: 12, letterSpacing: "1.4px", color: C.gruen, fontWeight: 600, marginBottom: 10 }}>
                  {testRichtig >= TEST_GRENZE ? "GESICHERT" : "NOCH NICHT GANZ"}
                </p>
                <p style={{ fontSize: 22, fontWeight: 700, color: C.weiss }}>{testRichtig} von {TEST_ANZAHL} richtig</p>
                <p style={{ fontSize: 14.5, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.75, marginTop: 10 }}>
                  {testRichtig >= TEST_GRENZE
                    ? "Diese Kompetenz trägt. Morgen kommt sie zum ersten Mal zur Wiederholung — erst wenn sie dann noch sitzt, ist sie wirklich gefestigt."
                    : `Für die Sicherung fehlen ${TEST_GRENZE - testRichtig}. Das ist keine Niederlage, sondern eine Information: Übe noch ein paar Aufgaben, dann versuch es erneut.`}
                </p>
              </div>
              {testRichtig >= TEST_GRENZE && (VORAUSBLICK[id] || []).some((v) => aktiv(v.id)) && (
                <div style={karte}>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>Das brauchst du wieder bei</p>
                  {(VORAUSBLICK[id] || []).filter((v) => aktiv(v.id)).map((v, i) => {
                    const vk = KOMP[v.id], vl = LINIEN.find((l) => l.id === vk.idee);
                    return (
                      <div key={i} style={{ borderLeft: `3px solid ${vl?.farbe || C.see}`, paddingLeft: 12, marginBottom: 12 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 600, color: C.tinte, marginBottom: 2 }}>{vl?.kurz} · {vk.titel}</p>
                        <Text s={v.satz} style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.65, margin: 0 }} />
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {testRichtig < TEST_GRENZE && (L.testFehl?.[id] || 0) >= 2 && (
                  <div style={{ width: "100%" }}>
                    <EskalationsKarte gehe={gehe} klein signal={eskalationSignale(L).find((x) => x.id === id) ||
                      { art: "haengt", id, titel: `Bei ${k.titel} hakt es fest`, text: "Zweimal nicht bestanden. Ein Blick von außen findet die Stelle davor meist schneller." }} />
                  </div>
                )}
                {testRichtig >= TEST_GRENZE ? (
                  <button onClick={() => gehe({ ansicht: "karte" })} style={hauptKnopf}>Zur Lernlandkarte</button>
                ) : (
                  <>
                    <button onClick={() => { setPhase("ueben"); uebNeu(); }} style={hauptKnopf}>Weiter üben</button>
                    <button onClick={testStarten} style={nebenKnopf}>Test wiederholen</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tutor && (
        <MathildaTutor kompetenz={k} aufgabe={tutor.aufgabe} eingabe={tutor.eingabe} onSchliessen={() => setTutor(null)} />
      )}
    </div>
  );
}

/* ---------- Wiederholen ---------- */


export function Wiederholen({ gehe }) {
  const L = useLern();
  const [sitzung, setSitzung] = useState(null);
  const [nr, setNr] = useState(0);
  const [eingabe, setEingabe] = useState("");
  const [stand, setStand] = useState(null);
  const [bilanz, setBilanz] = useState({ n: 0, ok: 0 });

  const liste = wiederholListe(L);
  const faellig = liste.map((x) => x.id);
  const bruecken = liste.filter((x) => x.fuer);
  const bald = Object.entries(L.stand)
    .filter(([id, s]) => s.faellig && s.faellig > Date.now() && hatEinheit(id))
    .sort((a, b) => a[1].faellig - b[1].faellig).slice(0, 8);

  const starten = () => {
    setSitzung(liste.slice(0, 8).map((x) => ({ id: x.id, fuer: x.fuer, aufgabe: einheitVon(x.id).erzeuger() })));
    setNr(0); setEingabe(""); setStand(null); setBilanz({ n: 0, ok: 0 });
  };

  const pruefen = () => {
    const eintrag = sitzung[nr];
    const ok = antwortPruefen(eintrag.aufgabe, eingabe);
    setStand(ok ? "ok" : "nein");
    if (eintrag.fuer) brueckeErgebnis(eintrag.id, ok); else wiederholungErgebnis(eintrag.id, ok);
    messungHalten(eintrag.id, ok);
    aktivitaetMelden({ ok });
    setBilanz((b) => ({ n: b.n + 1, ok: b.ok + (ok ? 1 : 0) }));
  };

  const karte = { background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 16 };
  const hauptKnopf = { height: 48, padding: "0 26px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999,
    fontSize: 15.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" };

  if (sitzung && nr < sitzung.length) {
    const e = sitzung[nr], k = KOMP[e.id], idee = LEITIDEEN.find((i) => i.id === k.idee);
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <div className="flex justify-between" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: idee.farbe }}>
            {k.titel}{e.fuer ? <span style={{ color: C.grau, fontWeight: 400 }}> · Brücke zu {KOMP[e.fuer]?.titel}</span> : null}
          </span>
          <span style={{ fontSize: 12, color: C.hellgrau, flexShrink: 0 }}>{nr + 1} von {sitzung.length}</span>
        </div>
        <div style={{ height: 5, background: C.himmel, borderRadius: 999, marginBottom: 16 }}>
          <div style={{ height: 5, borderRadius: 999, background: C.see, width: `${(nr / sitzung.length) * 100}%` }} />
        </div>
        <div style={karte}>
          <Text s={e.aufgabe.frage} style={{ fontSize: 16.5, lineHeight: 1.8, marginBottom: 14 }} />
          <AufgabeFeld aufgabe={e.aufgabe} wert={eingabe} setWert={(w) => { setEingabe(w); setStand(null); }} stand={stand} />
          {!stand ? (
            <button onClick={pruefen} disabled={!eingabe.trim()} className="mt-4" style={hauptKnopf}>Prüfen</button>
          ) : (
            <div style={{ borderLeft: `4px solid ${stand === "ok" ? C.see : C.signal}`, paddingLeft: 14, marginTop: 14 }}>
              <p style={{ fontSize: 15.5, fontWeight: 600, color: stand === "ok" ? C.see : C.signal, marginBottom: 4 }}>
                {stand === "ok" ? "Sitzt noch." : "Ist verblasst."}
              </p>
              <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>
                {stand === "ok"
                  ? (e.fuer ? `Trägt. Damit steht ${KOMP[e.fuer]?.titel} auf festem Boden.` : `Nächste Wiederholung ${wannFaellig(L.stand[e.id]?.faellig)}.`)
                  : <>Richtig wäre <M t={e.aufgabe.zeig || e.aufgabe.loesung} />. {e.fuer ? "Schau dir diese Station noch einmal an, bevor du weitergehst — sie kommt morgen wieder." : "Sie kommt morgen wieder."}</>}
              </p>
            </div>
          )}
        </div>
        {stand && (
          <button onClick={() => { setNr(nr + 1); setEingabe(""); setStand(null); }} style={hauptKnopf}>
            {nr + 1 < sitzung.length ? "Weiter" : "Abschließen"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      {sitzung && (
        <div className="auftauchen" style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 18, padding: 22, marginBottom: 16 }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: C.weiss }}>{bilanz.ok} von {bilanz.n} sitzen noch</p>
          <p style={{ fontSize: 14, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.7, marginTop: 8 }}>
            Was sitzt, kommt jetzt seltener. Was verblasst ist, morgen wieder.
          </p>
        </div>
      )}

      <div style={karte}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>Heute fällig</p>
        {faellig.length === 0 ? (
          <p style={{ fontSize: 15, lineHeight: 1.7 }}>Nichts. Alles, was du gesichert hast, sitzt noch.</p>
        ) : (
          <>
            <p style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{faellig.length} Kompetenz{faellig.length > 1 ? "en" : ""}</p>
            <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: 16 }}>
              Je eine Aufgabe. Dauert keine fünf Minuten — und ist der Grund, warum der Stoff im Abitur noch da ist.
            </p>
            {bruecken.length > 0 && (
              <p style={{ fontSize: 13.5, color: C.gruenDunkel, lineHeight: 1.65, marginBottom: 16 }}>
                Darunter {bruecken.length === 1 ? "eine Brücke" : `${bruecken.length} Brücken`} zu {KOMP[bruecken[0].fuer]?.titel} —
                das, worauf dein nächster Schritt aufbaut.
              </p>
            )}
            <button onClick={starten} style={hauptKnopf}>Wiederholen</button>
          </>
        )}
      </div>

      {bald.length > 0 && (
        <div style={karte}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Als Nächstes</p>
          {bald.map(([id, s]) => (
            <div key={id} className="flex justify-between items-center" style={{ marginBottom: 9, gap: 10 }}>
              <span style={{ fontSize: 14 }}>{KOMP[id].titel}</span>
              <span className="flex items-center" style={{ gap: 8, flexShrink: 0 }}>
                <span className="flex" style={{ gap: 3 }}>
                  {SR_ABSTAENDE.map((_, i) => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: 999, background: i < (s.festigung || 0) ? C.see : C.linie }} />
                  ))}
                </span>
                <span style={{ fontSize: 12, color: C.hellgrau, width: 64, textAlign: "right" }}>{wannFaellig(s.faellig)}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, lineHeight: 1.7 }}>
        Abstände nach einer bestandenen Wiederholung: 1, 3, 7, 21 und 60 Tage. Wer eine Kompetenz fünfmal
        über zwei Monate hinweg sicher kann, hat sie dauerhaft.
      </p>
    </div>
  );
}

/* ======================================================================
   PHASE C · PRÜFUNGSFÄHIGKEIT
   Operatoren · Begründen und Beweisen · Probeabitur · Modellieren
   ====================================================================== */

/* ---------- Gemeinsame Helfer ---------- */


export function nahe(eingabe, soll) {
  const x = zahlAus(eingabe);
  if (x === null) return false;
  return Math.abs(x - soll) <= Math.max(6e-4, 5e-3 * Math.abs(soll));
}

/* Prüfungsergebnisse sind Belege für den Lernstand. */

export function pruefungsBefund(id, ok) {
  if (!id || !KOMP[id] || !LERN.profil) return;
  lernAendern((L) => {
    const alt = L.stand[id] || {};
    if (!ok && ["sicher", "vermutet"].includes(alt.status))
      L.stand[id] = { ...alt, status: "arbeit", faellig: Date.now(), zuletzt: Date.now() };
    else if (!ok && !alt.status) L.stand[id] = { ...alt, status: "luecke", zuletzt: Date.now() };
    else if (ok && !alt.status) L.stand[id] = { ...alt, status: "vermutet", zuletzt: Date.now() };
  });
}


export function OperatorMarke({ op, afb }) {
  return (
    <span className="flex items-center" style={{ gap: 6 }}>
      <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", color: C.weiss, background: AFB_FARBE[afb] || C.see,
        borderRadius: 6, padding: "3px 8px" }}>{op.toUpperCase()}</span>
      {afb && <span style={{ fontSize: 11.5, color: C.hellgrau }}>Anforderungsbereich {afb}</span>}
    </span>
  );
}

/* ---------- 9 · Operatoren ---------- */

/* Orientiert an der Operatorenliste für das Abitur. Jeder Operator sagt genau,
   was für die volle Punktzahl auf dem Blatt stehen muss. */

export function Operatoren() {
  const [reiter, setReiter] = useState("training");
  const [offen, setOffen] = useState(null);
  const [nr, setNr] = useState(0);
  const [wahl, setWahl] = useState(null);
  const [bilanz, setBilanz] = useState({ n: 0, ok: 0 });

  const fall = OPERATOR_FAELLE[nr % OPERATOR_FAELLE.length];
  const folge = React.useMemo(() => mischen(fall.antworten.length), [nr]);

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 18 }}>
        Im Abitur entscheidet das erste Wort der Aufgabe, wofür es Punkte gibt. „Bestimmen“ verlangt etwas anderes
        als „angeben“, „zeigen“ etwas anderes als „berechnen“. Wer das weiß, verliert keine Punkte mehr an Stellen,
        an denen er richtig gerechnet hat.
      </p>

      <div className="flex gap-2 mb-5">
        {[["training", "Training"], ["liste", "Alle Operatoren"]].map(([id, n]) => (
          <button key={id} onClick={() => setReiter(id)} className="px-4 py-2"
            style={{ flex: 1, background: reiter === id ? C.see : C.weiss, color: reiter === id ? C.weiss : C.grau,
              border: `1px solid ${reiter === id ? C.see : C.linie}`, borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
            {n}
          </button>
        ))}
      </div>

      {reiter === "training" && (
        <>
          <div style={{ background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 14 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
              <OperatorMarke op={fall.op} afb={fall.afb} />
              {bilanz.n > 0 && <span style={{ fontSize: 12, color: C.hellgrau }}>{bilanz.ok} von {bilanz.n}</span>}
            </div>
            <Text s={fall.aufgabe} style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 12 }} />
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, marginBottom: 12 }}>
              Welche Antwort bekommt die volle Punktzahl? Tippe eine an — es können auch mehrere richtig sein.
            </p>
            {folge.map((i) => {
              const a = fall.antworten[i];
              const gezeigt = wahl !== null;
              const rand = gezeigt ? (a.ok ? C.see : i === wahl ? C.signal : C.linie) : C.linie;
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <button onClick={() => { if (wahl === null) { setWahl(i); setBilanz((b) => ({ n: b.n + 1, ok: b.ok + (a.ok ? 1 : 0) })); } }}
                    style={{ width: "100%", textAlign: "left", background: C.weiss, border: `2px solid ${rand}`, borderRadius: 14,
                      padding: "12px 14px", cursor: wahl === null ? "pointer" : "default", fontFamily: "inherit" }}>
                    <Text s={a.t} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.8, color: C.tinte }} />
                  </button>
                  {gezeigt && (i === wahl || a.ok) && (
                    <p style={{ fontSize: 13.5, lineHeight: 1.7, color: a.ok ? C.see : C.signal, margin: "6px 4px 0" }}>
                      {a.ok ? "Volle Punktzahl. " : "Punktabzug. "}<span style={{ color: C.grau }}>{a.warum.replace(/\$/g, "")}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {wahl !== null && (
            <button onClick={() => { setNr(nr + 1); setWahl(null); }}
              style={{ height: 48, padding: "0 26px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999,
                fontSize: 15.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              Nächster Fall
            </button>
          )}
        </>
      )}

      {reiter === "liste" && OPERATOREN.map((o) => (
        <div key={o.op} style={{ background: C.weiss, borderRadius: 14, marginBottom: 8, boxShadow: "0 2px 12px rgba(15,26,51,0.05)" }}>
          <button onClick={() => setOffen(offen === o.op ? null : o.op)} className="w-full flex justify-between items-center"
            style={{ background: "none", border: "none", padding: "14px 16px", cursor: "pointer", fontFamily: "inherit" }}>
            <OperatorMarke op={o.op} afb={o.afb} />
            <span style={{ color: C.hellgrau, transform: offen === o.op ? "rotate(90deg)" : "none", transition: "transform .15s" }}>›</span>
          </button>
          {offen === o.op && (
            <div style={{ padding: "0 16px 16px" }}>
              <p style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 8 }}><b>Verlangt:</b> {o.verlangt}</p>
              {o.reichtNicht !== "—" && <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.7, marginBottom: 8 }}><b>Reicht nicht:</b> {o.reichtNicht}</p>}
              <Text s={`Beispiel: ${o.beispiel}`} style={{ fontSize: 14, color: C.grau, lineHeight: 1.7, marginBottom: 8 }} />
              <div style={{ borderLeft: `3px solid ${C.signal}`, paddingLeft: 12 }}>
                <p style={{ fontSize: 13.5, lineHeight: 1.7 }}>{o.falle}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- 10 · Begründen und Beweisen ---------- */

/* Freie Texte lassen sich nicht deterministisch prüfen. Deshalb: festes
   Bewertungsraster, zuerst Selbsteinschätzung, dann Mathildas Einschätzung —
   ausdrücklich als Einschätzung, nicht als Note. */

export function Begruenden() {
  const [nr, setNr] = useState(0);
  const [text, setText] = useState("");
  const [selbst, setSelbst] = useState({});
  const [phase, setPhase] = useState("schreiben");
  const [laedt, setLaedt] = useState(false);
  const [urteil, setUrteil] = useState(null);
  const [fehler, setFehler] = useState(null);
  const [muster, setMuster] = useState(false);

  const a = BEGRUENDEN[nr % BEGRUENDEN.length];
  const neu = (n) => { setNr(n); setText(""); setSelbst({}); setPhase("schreiben"); setUrteil(null); setFehler(null); setMuster(false); };

  const einschaetzen = async () => {
    setLaedt(true); setFehler(null);
    const prompt = `Du bewertest die Antwort eines Gymnasiasten auf eine Abituraufgabe streng nach einem festen Raster.

Aufgabe (Operator „${a.op}“): ${a.aufgabe.replace(/\$/g, "")}

Bewertungsraster:
${a.raster.map((r, i) => `${i + 1}. ${r.replace(/\$/g, "")}`).join("\n")}

Antwort des Schülers:
"""${text}"""

Prüfe jedes Kriterium einzeln. Ein Kriterium ist nur erfüllt, wenn der Gedanke in der Antwort tatsächlich steht — nicht, wenn er gemeint sein könnte.
Antworte nur mit JSON:
{"kriterien":[{"erfuellt":true,"kommentar":"ein Satz"}],"rueckmeldung":"zwei Sätze: was trägt, was fehlt"}
Die Liste "kriterien" hat genau ${a.raster.length} Einträge in der Reihenfolge des Rasters. Kommentare auf Deutsch, sachlich, an den Schüler gerichtet.`;
    try {
      const res = await fetch(API_URL, {
        method: "POST", headers: kiKopf(),
        body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 700, messages: [{ role: "user", content: prompt }] }),
      });
      const daten = await kiAntwort(res);
      if (daten.error) throw new Error(daten.error.message);
      const roh = jsonLesen((daten.content || []).map((x) => (x.type === "text" ? x.text : "")).join(""));
      if (!roh || !Array.isArray(roh.kriterien)) throw new Error("Die Einschätzung ließ sich nicht lesen.");
      setUrteil(roh);
      setPhase("ergebnis");
      const erfuellt = roh.kriterien.filter((k) => k && k.erfuellt).length;
      pruefungsBefund(a.thema, erfuellt === a.raster.length);
      aktivitaetMelden({ ok: erfuellt === a.raster.length });
    } catch (e) {
      setFehler(e.message || "Mathilda ist gerade nicht erreichbar.");
    } finally { setLaedt(false); }
  };

  const erfuelltKI = urteil ? urteil.kriterien.filter((k) => k && k.erfuellt).length : 0;
  const erfuelltSelbst = Object.values(selbst).filter(Boolean).length;
  const knopf = { height: 48, padding: "0 24px", background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999,
    fontSize: 15.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 16 }}>
        Rechnen kann man üben, Begründen auch — nur wird es in der Schule selten systematisch gemacht. Schreib deine
        Antwort in ganzen Sätzen, schätze sie dann selbst am Raster ein und vergleiche mit Mathildas Einschätzung.
      </p>

      <div className="flex gap-2 mb-4" style={{ overflowX: "auto" }}>
        {BEGRUENDEN.map((b, i) => (
          <button key={i} onClick={() => neu(i)}
            style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 999, border: `1px solid ${i === nr % BEGRUENDEN.length ? C.see : C.linie}`,
              background: i === nr % BEGRUENDEN.length ? C.see : C.weiss, color: i === nr % BEGRUENDEN.length ? C.weiss : C.grau,
              fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>{i + 1}</button>
        ))}
      </div>

      <div style={{ background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 14 }}>
        <div style={{ marginBottom: 12 }}><OperatorMarke op={a.op} afb={a.afb} /></div>
        <Text s={a.aufgabe} style={{ fontSize: 16.5, lineHeight: 1.8, marginBottom: 14 }} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={phase === "ergebnis"} rows={6}
          placeholder="Deine Antwort in ganzen Sätzen. Formeln dürfen einfach eingetippt werden, etwa f(-x) = x^4 + ..."
          style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", fontSize: 15, fontFamily: "inherit", lineHeight: 1.65,
            border: `1px solid ${C.linie}`, borderRadius: 12, outline: "none", resize: "vertical" }} />
        {phase === "schreiben" && (
          <button onClick={() => setPhase("selbst")} disabled={text.trim().length < 20} className="mt-4"
            style={{ ...knopf, background: text.trim().length >= 20 ? C.gruenDunkel : C.hellgrau }}>
            Fertig — jetzt selbst einschätzen
          </button>
        )}
      </div>

      {phase !== "schreiben" && (
        <div className="auftauchen" style={{ background: C.weiss, borderRadius: 18, padding: 20, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 4 }}>Bewertungsraster</p>
          <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 14 }}>
            {phase === "selbst" ? "Hake ab, was in deiner Antwort wirklich steht — nicht, was du gemeint hast." : "Links deine Einschätzung, rechts Mathildas."}
          </p>
          {a.raster.map((r, i) => {
            const ki = urteil?.kriterien?.[i];
            return (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: 12, marginBottom: 12,
                borderBottom: i < a.raster.length - 1 ? `1px solid ${C.linie}` : "none" }}>
                <button onClick={() => phase === "selbst" && setSelbst({ ...selbst, [i]: !selbst[i] })}
                  style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 7, border: `2px solid ${selbst[i] ? C.see : C.linie}`,
                    background: selbst[i] ? C.see : C.weiss, color: C.weiss, fontSize: 13, cursor: phase === "selbst" ? "pointer" : "default", padding: 0 }}>
                  {selbst[i] ? "✓" : ""}
                </button>
                <div style={{ flex: 1 }}>
                  <Text s={r} style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }} />
                  {ki && (
                    <p style={{ fontSize: 13, lineHeight: 1.6, marginTop: 4, color: ki.erfuellt ? C.see : C.signal }}>
                      {ki.erfuellt ? "Mathilda: erfüllt. " : "Mathilda: fehlt. "}<span style={{ color: C.grau }}>{ki.kommentar}</span>
                    </p>
                  )}
                </div>
                {ki && (
                  <span style={{ width: 22, textAlign: "center", fontSize: 15, color: ki.erfuellt ? C.see : C.signal, flexShrink: 0 }}>
                    {ki.erfuellt ? "✓" : "○"}
                  </span>
                )}
              </div>
            );
          })}

          {phase === "selbst" && (
            <button onClick={einschaetzen} disabled={laedt} style={{ ...knopf, background: laedt ? C.hellgrau : C.gruenDunkel }}>
              {laedt ? "Mathilda liest …" : "Mit Mathildas Einschätzung vergleichen"}
            </button>
          )}
          {fehler && <p style={{ fontSize: 13.5, color: C.signal, marginTop: 10 }}>{fehler}</p>}
        </div>
      )}

      {phase === "ergebnis" && urteil && (
        <div className="auftauchen">
          <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 18, padding: 22, marginBottom: 14 }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.weiss }}>{erfuelltKI} von {a.raster.length} Kriterien</p>
            <p style={{ fontSize: 13.5, color: "#C9D6EE", fontWeight: 300, marginTop: 4 }}>
              Du hattest dir {erfuelltSelbst} gegeben.{" "}
              {erfuelltSelbst > erfuelltKI ? "Du schätzt dich großzügiger ein — genau das kostet in Klausuren Punkte."
                : erfuelltSelbst < erfuelltKI ? "Du bist strenger mit dir als nötig." : "Deine Einschätzung trifft."}
            </p>
            {urteil.rueckmeldung && <p style={{ fontSize: 14.5, color: C.weiss, fontWeight: 300, lineHeight: 1.75, marginTop: 12 }}>{urteil.rueckmeldung}</p>}
          </div>
          <p style={{ fontSize: 12, color: C.hellgrau, fontWeight: 300, lineHeight: 1.7, marginBottom: 14 }}>
            Das ist eine Einschätzung von Mathilda, keine Note. Rechenaufgaben prüft die App selbst — freie Begründungen
            kann nur ein Mensch endgültig bewerten.
          </p>
          {!muster ? (
            <button onClick={() => setMuster(true)} style={{ ...knopf, background: C.weiss, color: C.see, border: `1px solid ${C.linie}` }}>
              Musterlösung zeigen
            </button>
          ) : (
            <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 16 }}>
              <Text s={a.muster} style={{ fontSize: 14.5, lineHeight: 1.85, margin: 0 }} />
            </div>
          )}
          <div className="mt-4">
            <button onClick={() => neu(nr + 1)} style={knopf}>Nächste Aufgabe</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 11 · Probeabitur ---------- */

/* Teil A ohne Hilfsmittel, Teil B mit Hilfsmitteln. Jede Teilaufgabe hat
   Bewertungseinheiten, am Ende gibt es Notenpunkte nach dem üblichen Schlüssel. */

export function binomP(n, p, k) {
  let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - i + 1)) / i;
  return c * p ** k * (1 - p) ** (n - k);
}


export function probeabiturErzeugen() {
  const teilA = [
    { komp: "a-regeln", be: 2, ...DIAG["a-regeln"]() },
    { komp: "a-kette", be: 2, ...DIAG["a-kette"]() },
    { komp: "a-int", be: 2, ...DIAG["a-int"]() },
    { komp: "a-extrem", be: 3, ...DIAG["a-extrem"]() },
    { komp: "g-vek", be: 2, ...DIAG["g-vek"]() },
    { komp: "z-log", be: 1, ...DIAG["z-log"]() },
  ];

  const k = kubischErzeugen();
  const fsFn = alsFunktion(k.fs);
  const integral = k.a / 4 + k.b / 3 + k.c / 2 + k.d;
  const tex = `${k.a === 1 ? "" : "-"}x^3 ${k.b < 0 ? "-" : "+"} ${Math.abs(k.b)}x^2 ${k.c < 0 ? "-" : "+"} ${Math.abs(k.c)}x ${k.d < 0 ? "-" : "+"} ${Math.abs(k.d)}`;
  const analysis = {
    titel: "Analysis", kopf: `Gegeben ist die Funktion $f$ mit $f(x) = ${tex}$.`,
    teile: [
      { frage: "Bestimmen Sie $f′(x)$.", praefix: "f′(x) =", loesung: k.fs, art: "term", be: 2, komp: "a-regeln" },
      { frage: "Bestimmen Sie die x-Koordinate des Hochpunkts.", praefix: "x =", loesung: String(k.hoch), art: "zahl", be: 3, komp: "a-extrem" },
      { frage: "Bestimmen Sie die Wendestelle von $f$.", praefix: "x =", loesung: String(k.wende), art: "zahl", be: 2, komp: "a-wende" },
      { frage: "Berechnen Sie die Steigung der Wendetangente.", praefix: "m =", loesung: String(fsFn(k.wende)), art: "zahl", be: 2, komp: "a-wende" },
      { frage: "Berechnen Sie $\\int_0^1 f(x)\\,dx$.", praefix: "=", soll: integral, art: "nahe", be: 3, komp: "a-int" },
    ],
  };

  const n = zuf([8, 10, 12]), p = zuf([0.2, 0.25, 0.3, 0.4]), kk = zuf([2, 3]);
  let bisK = 0; for (let i = 0; i <= kk; i++) bisK += binomP(n, p, i);
  const stochastik = {
    titel: "Stochastik",
    kopf: `Ein Glücksrad zeigt mit Wahrscheinlichkeit $${String(p).replace(".", "{,}")}$ einen Gewinn. Es wird $${n}$-mal unabhängig gedreht. $X$ ist die Anzahl der Gewinne.`,
    teile: [
      { frage: "Geben Sie den Erwartungswert von $X$ an.", praefix: "E(X) =", soll: n * p, art: "nahe", be: 2, komp: "s-zufall" },
      { frage: `Berechnen Sie $P(X = ${kk})$.`, praefix: "P =", soll: binomP(n, p, kk), art: "nahe", be: 2, komp: "s-binom" },
      { frage: `Berechnen Sie $P(X \\le ${kk})$.`, praefix: "P =", soll: bisK, art: "nahe", be: 2, komp: "s-binom" },
      { frage: "Berechnen Sie die Standardabweichung von $X$.", praefix: "σ =", soll: Math.sqrt(n * p * (1 - p)), art: "nahe", be: 2, komp: "s-binom" },
    ],
  };

  const A = [ganz(0, 2), ganz(0, 2), ganz(0, 2)];
  const u = [ganz(1, 4), 0, ganz(0, 2)], v = [0, ganz(1, 4), ganz(0, 2)];
  const B = A.map((x, i) => x + u[i]), Cp = A.map((x, i) => x + v[i]);
  const dot = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const lu = Math.hypot(...u), lv = Math.hypot(...v);
  const kreuz = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const punkt = (P) => `(${P[0]} \\, | \\, ${P[1]} \\, | \\, ${P[2]})`;
  const geometrie = {
    titel: "Geometrie", kopf: `Gegeben sind $A${punkt(A)}$, $B${punkt(B)}$ und $C${punkt(Cp)}$.`,
    teile: [
      { frage: "Berechnen Sie die Länge der Strecke $\\overline{AB}$.", praefix: "|AB| =", soll: lu, art: "nahe", be: 2, komp: "g-vek" },
      { frage: "Berechnen Sie das Skalarprodukt $\\vec{AB} \\cdot \\vec{AC}$.", praefix: "=", soll: dot, art: "nahe", be: 2, komp: "g-skalar" },
      { frage: "Berechnen Sie den Winkel bei $A$ in Grad.", praefix: "α =", soll: (Math.acos(dot / (lu * lv)) * 180) / Math.PI, art: "nahe", be: 2, komp: "g-skalar" },
      { frage: "Berechnen Sie den Flächeninhalt des Dreiecks $ABC$.", praefix: "A =", soll: Math.hypot(...kreuz) / 2, art: "nahe", be: 3, komp: "g-skalar" },
    ],
  };

  return { teilA, teilB: [analysis, stochastik, geometrie] };
}


export function teilPruefen(t, eingabe) {
  if (t.art === "nahe") return nahe(eingabe, t.soll);
  return antwortPruefen(t, eingabe);
}


