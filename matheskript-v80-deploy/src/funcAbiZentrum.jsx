/* ============================================================
   ABI-ZENTRUM – der eigene Bereich für die Abiturvorbereitung, ganz in Gold
   · Abi-Profil: Bundesland, Jahr, Leistungsfach/Basisfach bzw. LK/GK, Prüfungsform, Hilfsmittel, Termine
   · Countdown, Rückwärtsplan mit Phasen und Probeabis, Vorschläge für heute
   · Mia, die Abi-Trainerin (funcMia.jsx), Abi-Aufgaben und Teil-A-Probe (funcAbiTraining.jsx)
   · Alle Kurse, Trainer nach Sachgebiet, Prüfungssimulationen, Lernpartner-Börse (funcLernpartner.jsx)
   Logik: abiZentrum.js, abiGeneratoren.js, miaKontext.js. Gestaltung: abiStil.jsx.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useState } from "react";
import { WERKZEUGE } from "./werkzeuge.js";
import { AbiSeite, AbiKopf, Abschnitt, BeBalken, MiaEmblem, Pfeil, GOLD, SCHWARZ, PRAEG } from "./abiStil.jsx";
import { useAbi, abiProfilSpeichern, uebergabeSetzen, UEBERGABE } from "./funcAbiDaten.jsx";
import {
  LAENDER, landName, niveauWorte, NIVEAU_WAHL, abiJahre, profilNormieren, pruefungFuer, schriftlichAm, muendlichAm, pruefungenAb, zielTermin, countdown,
  planFuer, phaseAm, naechsterMeilenstein, heuteVorschlaege, statistik, TRAINER, KURSE, SIMULATION, datum, datumLang, datumKurz, tageZwischen, PRUEFUNGEN,
} from "./abiZentrum.js";
import { SACHGEBIETE, typenIn } from "./abiGeneratoren.js";
import { MIA_MODI, OPERATOREN } from "./miaKontext.js";
import { ANGEBOT } from "./angebot.js";
import { useFrei } from "./func2.jsx";

const GEBIETE = ["analysis", "geometrie", "stochastik"];
const FORM_TEXT = { schriftlich: "schriftlich", muendlich: "mündlich", beides: "schriftlich und mündlich" };

/* ---------- Profil ---------- */
function Wahl({ werte, wert, setze, name, zeile, aus = [] }) {
  return (
    <div className={zeile ? "abi-chips zeile" : "abi-chips"} role="radiogroup" aria-label={name}>
      {werte.map(([id, text]) => (
        <button key={id} type="button" role="radio" aria-checked={wert === id} className="abi-chip" disabled={aus.includes(id)} onClick={() => setze(id)}>{text}</button>
      ))}
    </div>
  );
}

/* Abi-Jahr: drei Jahre zum Antippen, ein Pfeil blättert zu den letzten drei von fünf */
function JahrWahl({ jahr, setze }) {
  const jahre = abiJahre();
  const [hinten, setHinten] = useState(() => jahre.indexOf(jahr) >= 3);
  const sicht = hinten ? jahre.slice(2) : jahre.slice(0, 3);
  return (
    <div className="abi-jahre" data-abi-jahre>
      {hinten && <button type="button" className="abi-pfeil" aria-label="Frühere Jahre" onClick={() => setHinten(false)}>‹</button>}
      <Wahl name="Abitur im Jahr" zeile werte={sicht.map((j) => [j, String(j)])} wert={jahr} setze={setze} />
      {!hinten && <button type="button" className="abi-pfeil" aria-label="Spätere Jahre" onClick={() => setHinten(true)}>›</button>}
    </div>
  );
}

function ProfilKarte({ profil, fertig, abbrechen }) {
  const [p, setP] = useState(() => profilNormieren(profil || {}));
  const setze = (feld, wert) => setP((alt) => profilNormieren({ ...alt, [feld]: wert }));
  const bw = p.land === "BW";
  const pr = pruefungFuer(p);
  const ohneTermin = p.form !== "muendlich" && !schriftlichAm(p);
  const punkte = [["", "–"], ...Array.from({ length: 16 }, (_, i) => [String(15 - i), `${15 - i} Punkte`])];
  return (
    <div className="abi-karte" data-abi-profil>
      <span className="abi-eyebrow">Schritt 1</span>
      <h3 style={{ marginTop: 4 }}>Dein Abi-Profil</h3>
      <p className="abi-text" style={{ marginTop: 6 }}>Damit Plan, Aufgaben und Mia genau zu deiner Prüfung passen. Dauert eine Minute, später jederzeit änderbar.</p>
      <div style={{ marginTop: 16 }}>
        <label className="abi-feld"><span>Bundesland</span>
          <select value={p.land} onChange={(e) => setze("land", e.target.value)}>{LAENDER.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
        </label>
      </div>
      <div style={{ marginTop: 16 }}>
        <span className="abi-feld"><span>Abitur im Jahr</span></span>
        <JahrWahl jahr={p.jahr} setze={(v) => setze("jahr", v)} />
      </div>
      <div style={{ marginTop: 16 }}>
        <span className="abi-feld"><span>Dein Kurs</span></span>
        <Wahl name="Kurs" zeile werte={NIVEAU_WAHL} wert={p.niveau} setze={(v) => setze("niveau", v)} />
      </div>
      <div style={{ marginTop: 16 }}>
        <span className="abi-feld"><span>Prüfung in Mathe</span></span>
        <Wahl name="Prüfungsform" zeile werte={[["schriftlich", "Schriftlich"], ["muendlich", "Mündlich"], ["beides", "Beides"]]} wert={p.form} setze={(v) => setze("form", v)}
          aus={bw ? (p.niveau === "erhoeht" ? ["muendlich"] : ["schriftlich", "beides"]) : []} />
        {bw && p.niveau !== "erhoeht" && (
          <p className="abi-hinweis" style={{ marginTop: 10 }}>Im Basisfach legst du Mathe mündlich ab: 20 Minuten Vorbereitung, dann etwa 10 Minuten Vortrag und 10 Minuten Prüfungsgespräch.</p>
        )}
      </div>
      {!bw && p.form !== "muendlich" && (
        <div style={{ marginTop: 16 }}>
          <span className="abi-feld"><span>Rechner in Teil B</span></span>
          <Wahl name="Hilfsmittel" werte={[["WTR", "Wissenschaftlicher TR"], ["GTR", "Grafikrechner"], ["CAS", "CAS"]]} wert={p.hilfsmittel} setze={(v) => setze("hilfsmittel", v)} />
        </div>
      )}
      <div className="abi-raster zwei" style={{ marginTop: 16 }}>
        {p.form !== "muendlich" && (
          <label className="abi-feld"><span>{bw ? "Schriftliche Mathe-Prüfung (nur wenn abweichend)" : "Termin der schriftlichen Prüfung"}</span>
            <input type="date" value={p.termin || ""} onChange={(e) => setze("termin", e.target.value || null)} />
          </label>
        )}
        {p.form !== "schriftlich" && (
          <label className="abi-feld"><span>Mündliche Prüfung (falls bekannt)</span>
            <input type="date" value={p.muendlich || ""} onChange={(e) => setze("muendlich", e.target.value || null)} />
          </label>
        )}
        {p.form !== "muendlich" && (
          <label className="abi-feld"><span>Erste schriftliche Prüfung, alle Fächer</span>
            <input type="date" value={p.pruefungenAb || ""} onChange={(e) => setze("pruefungenAb", e.target.value || null)} />
          </label>
        )}
      </div>
      {bw && (
        <p className="abi-klein" style={{ marginTop: 10 }}>
          {p.form !== "muendlich" && schriftlichAm({ ...p, termin: null }) ? `Bekannter Termin ${p.jahr}: ${datumLang(schriftlichAm({ ...p, termin: null }))}${pruefungenAb({ ...p, termin: null, pruefungenAb: null }) ? `, schriftliche Prüfungen ab ${datumLang(pruefungenAb({ ...p, termin: null, pruefungenAb: null }))}` : ""}. ` : ""}
          Gilt für allgemeinbildende Gymnasien. Berufliches Gymnasium oder Nachtermin: eigenes Datum eintragen.
        </p>
      )}
      {ohneTermin && <p className="abi-hinweis" style={{ marginTop: 12 }}>Für {p.jahr} ist hier noch kein Termin hinterlegt. Trag ihn ein, sobald die Schule ihn nennt – dann rechnet der Plan rückwärts.</p>}
      <div className="abi-raster drei" style={{ marginTop: 16 }}>
        <label className="abi-feld"><span>Letzte Kursnote</span>
          <select value={p.punkte === null ? "" : String(p.punkte)} onChange={(e) => setze("punkte", e.target.value === "" ? null : Number(e.target.value))}>{punkte.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
        </label>
        <label className="abi-feld"><span>Dein Ziel im Abi</span>
          <select value={p.ziel === null ? "" : String(p.ziel)} onChange={(e) => setze("ziel", e.target.value === "" ? null : Number(e.target.value))}>{punkte.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
        </label>
        <div>
          <span className="abi-feld"><span>Zeit am Tag</span></span>
          <Wahl name="Zeit am Tag" werte={[[10, "10 Min."], [20, "20 Min."], [30, "30 Min."]]} wert={p.minuten} setze={(v) => setze("minuten", v)} />
        </div>
      </div>
      {!pr.ausgearbeitet && <p className="abi-klein" style={{ marginTop: 12 }}>{pr.hinweis}</p>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
        <button type="button" className="abi-knopf dunkel" data-abi-profil-speichern onClick={() => { abiProfilSpeichern(p); fertig(); }}>{profil ? "Speichern" : "Plan erstellen"}<Pfeil /></button>
        {abbrechen && <button type="button" className="abi-knopf rand" onClick={abbrechen}>Abbrechen</button>}
      </div>
    </div>
  );
}

/* ---------- Plan ---------- */
function Plan({ plan, heute }) {
  if (!plan.ziel) return <p className="abi-text">Sobald dein Prüfungstermin feststeht, rechnet der Plan von heute rückwärts.</p>;
  const start = plan.phasen.length ? plan.phasen[0].von : heute;
  const D = Math.max(1, tageZwischen(start, plan.ziel));
  const jetzt = Math.max(0, Math.min(100, (tageZwischen(start, heute) / D) * 100));
  const aktuell = phaseAm(plan, heute);
  const naechster = naechsterMeilenstein(plan, heute);
  return (
    <div className="abi-raster zwei" data-abi-plan>
      <div className="abi-karte">
        <div style={{ position: "relative", display: "flex", height: 14, borderRadius: 999, overflow: "hidden", background: "rgba(90,67,0,0.12)" }} aria-hidden="true">
          {plan.phasen.map((p, i) => (
            <span key={p.id} style={{ flex: tageZwischen(p.von, p.bis) + 1, background: p.id === (aktuell && aktuell.id) ? `linear-gradient(90deg, ${PRAEG}, ${GOLD})` : i % 2 ? "rgba(237,187,0,0.35)" : "rgba(237,187,0,0.55)", borderRight: "2px solid #FFFDF6" }} />
          ))}
          <span style={{ position: "absolute", left: `calc(${jetzt}% - 2px)`, top: 0, bottom: 0, width: 4, background: SCHWARZ, borderRadius: 2 }} />
        </div>
        <ol style={{ listStyle: "none", margin: "16px 0 0", padding: 0 }}>
          {plan.phasen.map((p) => {
            const an = aktuell && aktuell.id === p.id;
            const vorbei = p.bis < heute;
            return (
              <li key={p.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--abi-linie)", opacity: vorbei ? 0.55 : 1 }}>
                <span aria-hidden="true" style={{ width: 12, height: 12, marginTop: 5, borderRadius: 999, flex: "none", background: an ? GOLD : vorbei ? PRAEG : "transparent", border: `2px solid ${an ? SCHWARZ : PRAEG}` }} />
                <span style={{ minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: 15, fontWeight: 800 }}>{p.titel}{an && <span className="abi-be" style={{ marginLeft: 8, height: 22, fontSize: 11.5 }}>jetzt</span>}</b>
                  <span className="abi-klein" style={{ display: "block", marginTop: 2 }}>{datumKurz(p.von)} – {datumKurz(p.bis)} · {p.zeile}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="abi-karte dunkel">
        <span className="abi-eyebrow">Meilensteine</span>
        {naechster && <p className="abi-text" style={{ marginTop: 8 }}>Als Nächstes: <b style={{ color: GOLD }}>{naechster.titel}</b> am {datumLang(naechster.datum)}.</p>}
        <ul style={{ listStyle: "none", margin: "14px 0 0", padding: 0 }}>
          {plan.meilensteine.map((m) => (
            <li key={m.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid rgba(237,187,0,0.16)", opacity: m.datum < heute ? 0.5 : 1 }}>
              <span style={{ fontSize: 14.5, fontWeight: m.id === "pruefung" ? 800 : 600, color: m.id === "pruefung" ? GOLD : "#fff" }}>{m.titel}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>{datumKurz(m.datum)}</span>
            </li>
          ))}
        </ul>
        <p className="abi-klein" style={{ marginTop: 12 }}>Probeabis immer samstags zur Prüfungszeit. Die Generalprobe liegt vor dem Beginn der schriftlichen Prüfungen.</p>
      </div>
    </div>
  );
}

/* ---------- Prüfungsformat ---------- */
function Format({ profil }) {
  const pr = pruefungFuer(profil);
  if (pr.id === "bw-lf") {
    const a = pr.teilA, b = pr.teilB;
    return (
      <div className="abi-raster zwei" data-abi-format>
        <div className="abi-karte gold">
          <span className="abi-eyebrow">Teil A · ohne Hilfsmittel</span>
          <h3 style={{ marginTop: 6, fontSize: 26 }}>{a.be} BE</h3>
          <p className="abi-text" style={{ marginTop: 8 }}>{a.vorgelegt} Aufgaben je {a.beJe} BE liegen vor, {a.bearbeiten} bearbeitest du: P1 bis P4 sind Pflicht (zweimal Analysis, Geometrie, Stochastik), aus W1 bis W6 wählst du {a.wahl.waehle}. Abgabe spätestens nach {a.abgabeSpaetestens} Minuten.</p>
        </div>
        <div className="abi-karte dunkel">
          <span className="abi-eyebrow">Teil B · mit WTR und Formeldokument</span>
          <h3 style={{ marginTop: 6, fontSize: 26, color: GOLD }}>{Object.values(b.be).reduce((s, x) => s + x, 0)} BE</h3>
          <p className="abi-text" style={{ marginTop: 8 }}>Analysis {b.be.analysis} BE, Geometrie {b.be.geometrie} BE, Stochastik {b.be.stochastik} BE. {b.auswahl}</p>
          <p className="abi-klein" style={{ marginTop: 10 }}>Zusammen {pr.be} BE in {pr.minuten} Minuten – rund drei Minuten je BE.</p>
        </div>
      </div>
    );
  }
  if (pr.id === "bw-bf") {
    return (
      <div className="abi-raster zwei" data-abi-format>
        <div className="abi-karte gold">
          <span className="abi-eyebrow">Mündlich · Basisfach</span>
          <h3 style={{ marginTop: 6, fontSize: 24 }}>{pr.vorbereitung} + {pr.dauer} Minuten</h3>
          <p className="abi-text" style={{ marginTop: 8 }}>{pr.vorbereitung} Minuten Vorbereitung, dann {pr.teile.join(", ")}. Sachgebiete: {pr.sachgebiete}.</p>
        </div>
        <div className="abi-karte dunkel">
          <span className="abi-eyebrow">Gut zu wissen</span>
          <p className="abi-text" style={{ marginTop: 8 }}>Hilfsmittel: {pr.hilfsmittel}. {pr.hinweis}</p>
          <p className="abi-klein" style={{ marginTop: 10 }}>Mia simuliert beides: Vortrag und Prüfungsgespräch – mit Rückmeldung zu Fachlichem, Fachsprache und Aufbau.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="abi-karte" data-abi-format>
      <h3>{pr.titel}</h3>
      <p className="abi-text" style={{ marginTop: 8 }}>{pr.hinweis}</p>
      <p className="abi-klein" style={{ marginTop: 10 }}>Die Abi-Aufgaben der Masterclass folgen dem Format der IQB-Poolaufgaben (Teil A ohne Hilfsmittel, je Aufgabe 5 BE). Ausgearbeitet ist bisher Baden-Württemberg.</p>
    </div>
  );
}

/* ---------- Seite ---------- */
export function AbiZentrumSeite({ gehe }) {
  const abi = useAbi();
  const frei = useFrei();
  const profil = abi.profil;
  const heute = datum(Date.now());
  const [bearbeiten, setBearbeiten] = useState(false);
  const [operatorenAuf, setOperatorenAuf] = useState(false);
  const p = profil ? profilNormieren(profil) : null;
  const ziel = p ? zielTermin(p, heute) : null;
  const cd = countdown(ziel, heute);
  const plan = p ? planFuer(p, abi, heute) : null;
  const stat = statistik(abi);
  const worte = niveauWorte(p ? p.land : "BW");
  const muendlichNur = p && p.form === "muendlich";
  const vorschlaege = p ? heuteVorschlaege(p, plan, abi, heute) : [];
  const zuAufgabe = (typId) => { uebergabeSetzen(UEBERGABE.typ, typId); gehe({ ansicht: "abiaufgaben" }); };
  const zuMia = (modus) => { uebergabeSetzen(UEBERGABE.miaModus, modus); gehe({ ansicht: "mia" }); };
  const oeffnen = (v) => { if (v.mia) uebergabeSetzen(UEBERGABE.miaModus, v.mia); if (v.gebiet && v.ziel.ansicht === "abiaufgaben") uebergabeSetzen(UEBERGABE.typ, `gebiet:${v.gebiet}`); gehe(v.ziel); };

  return (
    <AbiSeite kennung={{ "data-abi-zentrum": "" }}>
      <AbiKopf
        eyebrow={p ? `Mythos Mathe · Abitur ${p.jahr}` : "Mythos Mathe · Abitur"}
        titel="Mathe-Abi-Masterclass"
        zeile={p ? `${worte[p.niveau]} · ${landName(p.land)} · ${FORM_TEXT[p.form]}` : "Dein Prüfungsformat, dein Plan bis zum Tag X, Mia als Trainerin – und Lernpartner aus deiner Stadt."}
        rechts={p && (
          <>
            {cd && !cd.vorbei && <span className="abi-countdown" data-abi-countdown><b>{cd.tage}</b><span>{cd.tage === 1 ? "Tag" : "Tage"} bis {datumKurz(ziel)}</span></span>}
            {ziel && <span className="abi-pille">{ziel === muendlichAm(p) && ziel !== schriftlichAm(p) ? "Mündlich" : "Schriftlich"}: {datumLang(ziel)}</span>}
            <button type="button" className="abi-knopf rand klein" onClick={() => setBearbeiten(true)} data-abi-profil-aendern>Profil ändern</button>
          </>
        )}
      />
      <div className="abi-innen">
        {(!p || bearbeiten) && (
          <div style={{ marginTop: 22 }}>
            <ProfilKarte profil={profil} fertig={() => setBearbeiten(false)} abbrechen={p ? () => setBearbeiten(false) : null} />
          </div>
        )}

        {p && !bearbeiten && (
          <Abschnitt eyebrow={plan && phaseAm(plan, heute) ? `Phase: ${phaseAm(plan, heute).titel}` : "Heute"} titel="Dein nächster Schritt" kennung={{ "data-abi-heute": "" }}>
            <div className="abi-raster vier">
              {vorschlaege.map((v, i) => (
                <button key={v.id} type="button" className={i === 0 ? "abi-karte gold abi-vorschlag" : "abi-karte abi-vorschlag"} onClick={() => oeffnen(v)} style={{ textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit", display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="abi-eyebrow">{i === 0 ? "Heute zuerst" : "Dann"}</span>
                  <b style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.25 }}>{v.titel}</b>
                  <span className="abi-klein" style={{ color: i === 0 ? "#2A1F00" : undefined }}>{v.zeile}</span>
                  <span style={{ marginTop: "auto", alignSelf: "flex-end" }}><Pfeil /></span>
                </button>
              ))}
            </div>
          </Abschnitt>
        )}

        {/* Mia */}
        <Abschnitt eyebrow="Deine Trainerin" titel="Mia trainiert dich auf die Prüfung" kennung={{ "data-abi-mia": "" }}>
          <div className="abi-karte dunkel" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "20px 20px 6px" }}>
              <MiaEmblem groesse={64} id="mia-zentrum" />
              <div>
                <h3 style={{ color: "#fff", fontSize: 21 }}>Mia, die Abi-Trainerin</h3>
                <p className="abi-text" style={{ marginTop: 4 }}>Mathildas Schwester – sie kennt dein Format, korrigiert nach Erwartungshorizont und sagt dir, wo die BE liegen.</p>
              </div>
            </div>
            <div className="abi-raster zwei" style={{ padding: "12px 20px 20px", gap: 10 }}>
              {MIA_MODI.map((m, i) => (
                <button key={m.id} type="button" className={i === 0 ? "abi-knopf gold breit" : "abi-knopf rand breit"} onClick={() => zuMia(m.id)} data-mia-modus={m.id}
                  style={{ justifyContent: "space-between", minHeight: 56, padding: "8px 18px", textAlign: "left" }}>
                  <span><span style={{ display: "block" }}>{m.name}</span><span style={{ display: "block", fontSize: 12, fontWeight: 600, opacity: 0.8 }}>{m.kurz}</span></span><Pfeil />
                </button>
              ))}
            </div>
          </div>
        </Abschnitt>

        {p && !bearbeiten && plan && (
          <Abschnitt eyebrow={cd && !cd.vorbei ? `${cd.wochen} Wochen` : "Plan"} titel="Dein Weg bis zur Prüfung">
            <Plan plan={plan} heute={heute} />
          </Abschnitt>
        )}

        {p && !bearbeiten && (
          <Abschnitt eyebrow="So läuft die Prüfung" titel={pruefungFuer(p).titel}>
            <Format profil={p} />
          </Abschnitt>
        )}

        {/* Abi-Aufgaben */}
        {!muendlichNur && (
          <Abschnitt eyebrow="Im Prüfungsformat" titel="Abi-Aufgaben trainieren" kennung={{ "data-abi-aufgaben": "" }}
            rechts={<button type="button" className="abi-knopf dunkel klein" onClick={() => gehe({ ansicht: "abiteila" })}>Teil-A-Probe starten<Pfeil /></button>}>
            <p className="abi-text" style={{ marginBottom: 14 }}>Jede Aufgabe hat 5 BE wie in Teil A, einen Erwartungshorizont und eine Uhr (drei Minuten je BE). Unendlich viele, jede neu erzeugt.</p>
            <div className="abi-raster drei">
              {GEBIETE.map((g) => {
                const s = stat[g];
                return (
                  <div key={g} className="abi-karte" data-abi-gebiet={g}>
                    <span className="abi-eyebrow">{s.anzahl ? `${Math.round(s.quote * 100)} % der BE · ${s.anzahl} Aufgaben` : "Noch nicht geübt"}</span>
                    <h3 style={{ marginTop: 4 }}>{SACHGEBIETE[g].name}</h3>
                    <div style={{ margin: "10px 0 4px" }}><BeBalken be={s.be} max={s.max || 1} label={`${SACHGEBIETE[g].name}: ${s.be} von ${s.max} BE`} /></div>
                    <div>
                      {typenIn(g).map((t) => (
                        <button key={t.id} type="button" className="abi-zeile" onClick={() => zuAufgabe(t.id)} data-abi-typ={t.id}>
                          <span><b>{t.titel}</b><span className="z">{t.zeile}</span></span><Pfeil />
                        </button>
                      ))}
                    </div>
                    <span className="abi-feld" style={{ marginTop: 12 }}><span>Trainer dazu</span></span>
                    <div className="abi-chips">
                      {TRAINER[g].map((id) => WERKZEUGE[id] && (
                        <button key={id} type="button" className="abi-chip" onClick={() => gehe(WERKZEUGE[id].ziel)}>{WERKZEUGE[id].kurz || WERKZEUGE[id].name}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Abschnitt>
        )}

        {/* Simulation */}
        <Abschnitt eyebrow="Unter Prüfungsbedingungen" titel="Prüfung simulieren">
          <div className="abi-karte">
            {SIMULATION.map((s) => (
              <button key={s.id} type="button" className="abi-zeile" onClick={() => gehe(s.ziel)} data-abi-simulation={s.id}>
                <span><b>{s.titel}{s.gold && <span className="abi-be" style={{ marginLeft: 8, height: 22, fontSize: 11 }}>neu</span>}</b><span className="z">{s.zeile}</span></span><Pfeil />
              </button>
            ))}
            {p && p.form !== "schriftlich" && (
              <button type="button" className="abi-zeile" onClick={() => zuMia("muendlich")}>
                <span><b>Mündliche Prüfung mit Mia</b><span className="z">20 Minuten Vorbereitung, Vortrag, Prüfungsgespräch, Rückmeldung</span></span><Pfeil />
              </button>
            )}
          </div>
        </Abschnitt>

        {/* Kursbereich der Masterclass (Videolektionen, Aufträge, Live-Calls) – nur mit Angebot „Kurse“ oder Passwort */}
        {(ANGEBOT.kurse || frei) && (
          <Abschnitt eyebrow="Für Teilnehmer" titel="Dein Kursbereich" kennung={{ "data-abi-kursbereich": "" }}>
            <div className="abi-karte dunkel" style={{ display: "grid", gap: 12 }}>
              <p className="abi-text">Zehn Videolektionen in sechs Monaten, zu jeder Lektion die passenden Werkzeuge, ein Auftrag bis zum nächsten Live-Call und Mathilda zur Lektion.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" className="abi-knopf gold" onClick={() => gehe({ ansicht: "mckurs" })} data-abi-zum-kursbereich>Zum Kursbereich<Pfeil /></button>
                <button type="button" className="abi-knopf rand" onClick={() => gehe({ ansicht: "mczugang" })}>Zugangscode einlösen</button>
              </div>
            </div>
          </Abschnitt>
        )}

        {/* Lernpartner */}
        <Abschnitt eyebrow="Gemeinsam statt allein" titel="Lernpartner in deiner Stadt">
          <button type="button" className="abi-karte gold" onClick={() => gehe({ ansicht: "lernpartner" })} data-abi-lernpartner
            style={{ width: "100%", textAlign: "left", cursor: "pointer", font: "inherit", display: "grid", gap: 6 }}>
            <b style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em" }}>Lerngruppe fürs Abi finden</b>
            <span className="abi-text">Abiturienten aus deiner Stadt – auch von anderen Schulen –, die mit Mythos Mathe lernen. Steckbrief statt Chat, Treffen an öffentlichen Orten, höchstens sechs pro Gruppe.</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6, fontWeight: 800 }}>Lernpartner finden<Pfeil /></span>
          </button>
        </Abschnitt>

        {/* Kurse */}
        <Abschnitt eyebrow="Den Stoff lernen" titel="Kurse fürs Abi">
          <div className="abi-raster zwei">
            {[KURSE.slice(0, 4), KURSE.slice(4)].map((teil, i) => (
              <div key={i} className="abi-karte">
                {teil.map((k) => (
                  <button key={k.id} type="button" className="abi-zeile" onClick={() => gehe(k.ziel)} data-abi-kurs={k.id}>
                    <span><b>{k.titel}</b><span className="z">{k.zeile}</span></span><Pfeil />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Abschnitt>

        {/* Operatoren */}
        <Abschnitt eyebrow="Was die Aufgabe wirklich will" titel="Operatoren">
          <div className="abi-karte">
            <button type="button" className="abi-zeile" aria-expanded={operatorenAuf} onClick={() => setOperatorenAuf(!operatorenAuf)} style={{ borderBottom: operatorenAuf ? undefined : "none" }}>
              <span><b>„Zeigen Sie“ ist nicht „Berechnen Sie“</b><span className="z">{OPERATOREN.length} Operatoren mit Anforderungsbereich – wer sie kennt, verschenkt keine BE.</span></span>
              <span className="pf" aria-hidden="true" style={{ transform: operatorenAuf ? "rotate(90deg)" : "none" }}><Pfeil /></span>
            </button>
            {operatorenAuf && (
              <dl style={{ margin: 0 }}>
                {OPERATOREN.map((o) => (
                  <div key={o.wort} style={{ display: "grid", gridTemplateColumns: "minmax(0, 150px) 1fr", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--abi-linie)" }}>
                    <dt style={{ fontWeight: 800, fontSize: 14.5 }}>{o.wort}<span className="abi-klein" style={{ display: "block" }}>AFB {o.afb}</span></dt>
                    <dd style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{o.heisst}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Abschnitt>

        <p className="abi-klein" style={{ marginTop: 30 }}>
          Prüfungsdaten Stand Oktober 2026 (Kultusministerium Baden-Württemberg, IQB). Maßgeblich sind die Angaben deiner Schule.
          {PRUEFUNGEN["bw-lf"].termine[2027] && " Termine 2027: schriftlich Mathe 5. Mai (Nachtermin 31. Mai), mündlich Basisfach 28. Juni bis 8. Juli."}
        </p>
      </div>
    </AbiSeite>
  );
}

export default AbiZentrumSeite;
