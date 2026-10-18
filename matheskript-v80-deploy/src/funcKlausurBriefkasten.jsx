/* ============================================================
   MathildaAI · Klausurbox  (/klausurbriefkasten)
   Schüler werfen das Aufgabenblatt einer zurückgegebenen Klassenarbeit ein.
   Ablauf: ① Angaben (Bundesland, Schulart, Klasse, Schule, Kapitel, Monat)
           ② drei Häkchen (zurückbekommen · alle haben geschrieben · nur Aufgabenblatt)
           ③ bis zu 3 Fotos (Serienmodus: „Foto“ = nächste Seite, „Letztes Foto“ = fertig) → Mathilda analysiert nur die Struktur
           ④ Vorschau „Das merkt sich Mathilda“ → einwerfen oder verwerfen
   Fotos bleiben im Browserspeicher dieser Seite, gehen nur zur Analyse an
   Anthropic und werden danach verworfen – nie gespeichert.
   Logik: klausurBriefkasten.js · Datenbank: supabase/klausurbriefkasten.sql
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_URL, C } from "./base1.jsx";
import { kiAntwort, kiEinwilligungDa, kiKopf } from "./base4.jsx";
import { dekodieren, jsonLesen, rendern } from "./func1.jsx";
import { BlattScanner } from "./funcBlattScanner.jsx";
import { MathildaIcon } from "./funcMathildaSeite.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { kameraWunschHolen } from "./kameraWunsch.js";
import { DEMO, sb, useKonto } from "./konto.js";
import { hilfenFuer, THEMEN } from "./schulbuch.js";
import { englisch } from "./i18n.js";
import { GrosserKnopf, Rueck, karte, kicker, zw } from "./ui2.jsx";
import { springe } from "./sprung.js";
import {
  ANALYSE_REGELN, ART_NAME, BUNDESLAENDER, FREIGABE, HILFSMITTEL_NAME, MAX_BYTES_GESAMT, MAX_SEITEN, PERSON_NAME, SCHULARTEN_BK,
  analyseLesen, analysePrompt, angabenFehler, freigabeKomplett, kapitelZurKlasse, klassenFuer, meldungBauen, schulartBk,
} from "./klausurBriefkasten.js";

const GOLD = C.flaggold, NACHT = C.seeTief, GRUEN = "#0F7A4D";
const ANGABEN = "matheplus-klausurbriefkasten";          // letzte Angaben (nur auf diesem Gerät)
const EIGENE = "matheplus-klausurbriefkasten-eingeworfen"; // ohne Konto: Liste der eigenen Meldungen (Struktur)
const lsLesen = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSchreiben = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat */ } };
const nm = (paar) => (paar ? zw(paar[0], paar[1]) : "");

/* ---------- Speichern über Supabase (ohne Supabase: Vorschau-Modus lokal) ---------- */
function fehlerText(error) {
  const m = String((error && (error.message || error.details)) || "");
  if (/kb_einwilligung/.test(m)) return zw("Für dein Konto fehlt noch die Zustimmung deiner Eltern (unter 16) oder deine Altersangabe. Beides findest du unter „Mein Konto“.", "Your account still needs your parents' consent (under 16) or your age. You'll find both under “My account”.");
  if (/kb_grenze/.test(m)) return zw("Für heute ist der Briefkasten voll. Morgen kannst du weitere Arbeiten einwerfen.", "The mailbox is full for today. You can drop in more tests tomorrow.");
  if (/kb_bild/.test(m)) return zw("Die Meldung enthielt zu viel Text. Bitte versuch es noch einmal.", "The report contained too much text. Please try again.");
  if (/PGRST202|function .* does not exist|klausur_melden/.test(m)) return zw("Der Briefkasten ist auf dem Server noch nicht eingerichtet (supabase/klausurbriefkasten.sql).", "The mailbox is not set up on the server yet.");
  return zw("Das Einwerfen hat nicht geklappt. Bitte versuch es gleich noch einmal.", "Dropping it in didn't work. Please try again shortly.");
}
async function einwerfen(meldung) {
  if (DEMO || !sb) return { id: `lokal-${Date.now()}` };
  const { data, error } = await sb.rpc("klausur_melden", { meldung });
  if (error) throw new Error(fehlerText(error));
  return { id: data };
}
async function meineLaden(angemeldet) {
  if (!angemeldet || DEMO || !sb) return lsLesen(EIGENE, []);
  const { data, error } = await sb.rpc("meine_klausurmeldungen");
  if (error) return lsLesen(EIGENE, []);
  return (data || []).map((m) => ({ ...m, konto: true }));
}
async function meldungLoeschen(eintrag, angemeldet) {
  if (eintrag.konto && angemeldet && sb) {
    const { error } = await sb.rpc("klausur_meldung_loeschen", { p_id: eintrag.id });
    if (error) throw new Error(zw("Löschen hat nicht geklappt.", "Deleting didn't work."));
  }
  lsSchreiben(EIGENE, lsLesen(EIGENE, []).filter((m) => m.id !== eintrag.id));
}

/* ---------- Briefkasten-Bild ---------- */
export function BriefkastenBild({ groesse = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={groesse} height={groesse} aria-hidden="true" style={{ display: "block", flex: "none" }}>
      <defs>
        <linearGradient id="bk-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F8D23A" /><stop offset="0.55" stopColor={GOLD} /><stop offset="1" stopColor="#D9A600" /></linearGradient>
      </defs>
      <rect x="29" y="40" width="6" height="20" rx="2" fill="#0A1636" />
      <path d="M12 26c0-9 7-15 16-15h14c8 0 12 6 12 14v18H12z" fill="url(#bk-gold)" />
      <path d="M12 26c0-9 7-15 16-15h2c-8 0-12 6-12 15v17h-6z" fill="#000" opacity="0.08" />
      <rect x="21" y="27" width="22" height="4" rx="2" fill={NACHT} />
      <path d="M24 6l12-2 2 13-12 2z" fill="#FFFFFF" />
      <path d="M26.5 9.5l8-1.3M27 13l8-1.3" stroke={C.see} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M50 17v-8h7v5h-7" fill={C.see} />
      <rect x="49" y="9" width="2" height="18" rx="1" fill="#0A1636" />
    </svg>
  );
}

/* ---------- Kopf ---------- */
function Kopf() {
  return (
    <div style={{ marginTop: 16, borderRadius: 22, padding: "20px 18px 18px", color: C.weiss, position: "relative", overflow: "hidden",
      background: `radial-gradient(120% 120% at 100% 0%, #1D4790 0%, ${C.see} 38%, ${NACHT} 100%)`, boxShadow: "0 14px 36px rgba(14,30,74,0.28)" }} data-briefkasten-kopf>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ position: "relative", width: 72, height: 72, flex: "none" }}>
          <BriefkastenBild groesse={72} />
          <span style={{ position: "absolute", right: -6, bottom: -4, border: `2px solid ${NACHT}`, borderRadius: 999 }}><MathildaIcon groesse={30} /></span>
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: C.weiss }}><MathildaName dunkel /></p>
          <p style={{ margin: "3px 0 0", fontSize: 24, fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.02em" }}>{zw("Klausurbox", "Test box")}</p>
        </div>
      </div>
      <p style={{ margin: "14px 0 0", fontSize: 15.5, fontWeight: 600, lineHeight: 1.45 }}>{zw("Wirf deine zurückgegebene Klassenarbeit ein.", "Drop in your returned class test.")}</p>
      <p style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 300, lineHeight: 1.6, color: C.goldText }}>
        {zw("Mathilda liest nur, wie die Arbeit aufgebaut ist – Themen, Aufgabentypen, Punkte, Zeit. Aus vielen Arbeiten deiner Klassenstufe und deines Bundeslands baut die App neue Testklausuren, die sich wie echte anfühlen.",
          "Mathilda only reads how the test is built – topics, task types, points, time. From many tests of your grade and state, the app builds new practice tests that feel like the real thing.")}
      </p>
    </div>
  );
}

/* ---------- Infofeld: So bleibt alles sauber ---------- */
const SAUBER = [
  ["foto", zw("Dein Foto wird nicht gespeichert", "Your photo is not stored"), zw("Es bleibt in deinem Browser, geht nur für die Analyse an Mathilda und wird danach verworfen – bei uns landet es nirgends.", "It stays in your browser, goes to Mathilda only for the analysis and is discarded afterwards – it is never stored with us.")],
  ["struktur", zw("Mathilda merkt sich nur den Aufbau", "Mathilda only keeps the structure"), zw("Thema, Aufgabentypen, Operatoren, Schwierigkeit, Punkte und Dauer – in eigenen Worten. Keine Aufgabentexte, keine Zahlen aus den Aufgaben.", "Topic, task types, operators, difficulty, points and time – in her own words. No task texts, no numbers from the tasks.")],
  ["person", zw("Keine Namen, keine Noten", "No names, no grades"), zw("Weder dein Name noch deine Note noch der Name deiner Lehrkraft werden übernommen. Steht so etwas auf dem Foto, ignoriert Mathilda es.", "Neither your name, your grade nor your teacher's name is kept. If something like that is on the photo, Mathilda ignores it.")],
  ["neu", zw("Daraus entstehen neue Aufgaben – nie Kopien", "This becomes new tasks – never copies"), zw("Die Testklausuren der App werden selbst geschrieben, mit eigenen Zahlen und eigenen Sachkontexten. Deine Arbeit sieht niemand sonst.", "The app's practice tests are written from scratch, with their own numbers and contexts. Nobody else ever sees your test.")],
  ["fair", zw("Erst wenn alle geschrieben haben", "Only once everyone has written it"), zw("Wirf eine Arbeit erst ein, wenn du sie zurückbekommen hast und auch Parallelklassen und Nachschreiber fertig sind.", "Only drop in a test once you've got it back and parallel classes and make-up tests are done too.")],
  ["loeschen", zw("Du behältst die Kontrolle", "You stay in control"), zw("Vor dem Einwerfen siehst du genau, was gespeichert wird. Mit Konto kannst du jede Meldung später wieder löschen.", "Before dropping it in you see exactly what will be stored. With an account you can delete any report later.")],
];
function SymbolSauber({ id }) {
  const p = { foto: "M4 8h3l2-3h6l2 3h3v11H4z M12 10a3.2 3.2 0 1 0 0 6.4a3.2 3.2 0 1 0 0-6.4 M3 3l18 18",
    struktur: "M5 5h14M5 10h10M5 15h14M5 20h8", person: "M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8z M4 21c1-4 4-6 8-6s7 2 8 6 M3 3l18 18",
    neu: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6", fair: "M12 3l8 4v5c0 5-3.5 8-8 9c-4.5-1-8-4-8-9V7z M8.5 12l2.5 2.5l4.5-5",
    loeschen: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" }[id];
  return (
    <span style={{ width: 34, height: 34, borderRadius: 10, background: NACHT, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={GOLD} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={p} /></svg>
    </span>
  );
}
export function InfoFeld({ gehe, offenStart = false }) {
  const [warum, setWarum] = useState(offenStart);
  return (
    <section style={{ ...karte, marginTop: 14, borderTop: `4px solid ${GOLD}` }} aria-labelledby="bk-info-titel" data-briefkasten-info>
      <p style={{ ...kicker, color: "#8A6A00" }}>{zw("Datenschutz und Urheberrecht", "Privacy and copyright")}</p>
      <h2 id="bk-info-titel" style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 700, color: C.tinte, letterSpacing: "-0.01em" }}>{zw("So bleibt alles sauber", "How we keep it clean")}</h2>
      <p style={{ margin: "0 0 8px", fontSize: 13.5, color: C.grau, lineHeight: 1.55 }}>{zw("Der Briefkasten sammelt keine Klausuren. Er sammelt Wissen darüber, wie Klausuren aufgebaut sind.", "The mailbox doesn't collect tests. It collects knowledge about how tests are built.")}</p>
      <div style={{ display: "grid", gap: 2 }}>
        {SAUBER.map(([id, t, s]) => (
          <div key={id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0" }}>
            <SymbolSauber id={id} />
            <div><p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.tinte, lineHeight: 1.35 }}>{t}</p><p style={{ margin: "2px 0 0", fontSize: 13, color: C.grau, lineHeight: 1.55 }}>{s}</p></div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setWarum((x) => !x)} aria-expanded={warum} data-warum
        style={{ marginTop: 6, background: "none", border: "none", padding: "6px 0", color: C.see, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        {warum ? "▾ " : "▸ "}{zw("Warum machen wir das so?", "Why do we do it this way?")}
      </button>
      {warum && (
        <div style={{ background: C.sand, borderRadius: 14, padding: "12px 14px", marginTop: 4 }} data-warum-text>
          {[[zw("Urheberrecht", "Copyright"), zw("Die Aufgaben einer Klassenarbeit hat deine Lehrkraft geschrieben (oder aus einem Schulbuch übernommen) – sie gehören ihr bzw. dem Verlag. Du darfst dein Blatt behalten und für dich fotografieren, aber nicht weitergeben, damit andere es nutzen. Deshalb speichern wir das Foto nicht und zeigen es nie jemandem. Erlaubt ist, ein Werk automatisiert auszuwerten (Text- und Data-Mining, § 44b Urheberrechtsgesetz), solange die Kopie danach gelöscht wird. Ideen, Aufgabentypen und Themen gehören niemandem – die Formulierung schon. Darum übernehmen wir nur den Aufbau.",
            "The tasks in a class test were written by your teacher (or taken from a textbook) – they belong to them or the publisher. You may keep your sheet and photograph it for yourself, but not pass it on for others to use. That's why we don't store the photo and never show it to anyone. Analysing a work automatically is allowed (text and data mining, § 44b German Copyright Act) as long as the copy is deleted afterwards. Ideas, task types and topics belong to nobody – the wording does. So we only keep the structure.")],
            [zw("Datenschutz", "Privacy"), zw("Auf einem Klausurblatt stehen oft Name, Note und Kürzel. Das sind persönliche Daten – von dir und von deiner Lehrkraft. Mathilda übernimmt nichts davon, und die App fragt nie nach dem Namen der Lehrkraft. Die Schule ist freiwillig und wird nur in der Statistik genutzt, nie öffentlich angezeigt. Mathilda bekommt für die Analyse weder deinen Namen noch deinen Lernstand.",
              "A test sheet often shows a name, a grade and initials. That is personal data – yours and your teacher's. Mathilda keeps none of it, and the app never asks for your teacher's name. The school is optional, only used in statistics and never shown publicly. Mathilda gets neither your name nor your progress for the analysis.")],
            [zw("Fairness", "Fairness"), zw("Viele Lehrkräfte setzen eine Arbeit in Parallelklassen oder beim Nachschreiben noch einmal ein. Wer sie früher weitergibt, verschafft anderen einen unfairen Vorteil. Deshalb das Häkchen „Alle haben sie geschrieben“.",
              "Many teachers reuse a test in parallel classes or for make-up tests. Passing it on early gives others an unfair advantage. That's why there is the tick “Everyone has written it”.")],
          ].map(([t, s]) => (
            <div key={t} style={{ marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: C.tinte }}>{t}</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: C.tinte, lineHeight: 1.6 }}>{s}</p>
            </div>
          ))}
          <p style={{ margin: 0, fontSize: 12.5, color: C.grau, lineHeight: 1.5 }}>
            {zw("Mehr dazu in der ", "More in our ")}
            <a href="/datenschutz" onClick={(e) => { if (gehe) { e.preventDefault(); gehe({ ansicht: "datenschutz" }); } }} style={{ color: C.see, fontWeight: 700 }}>{zw("Datenschutzerklärung", "privacy policy")}</a>.
          </p>
        </div>
      )}
    </section>
  );
}

/* ---------- Kleine Bausteine ---------- */
const feldStil = { width: "100%", boxSizing: "border-box", height: 46, padding: "0 12px", borderRadius: 12, border: `1.5px solid ${C.linie}`, fontFamily: "inherit", fontSize: 15, color: C.tinte, background: C.weiss, outline: "none" };
const kleinKnopf = { height: 38, padding: "0 14px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer" };
function Schrittkopf({ nr, titel, fertig, zeile }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
      <span style={{ width: 28, height: 28, borderRadius: 999, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800,
        background: fertig ? GRUEN : NACHT, color: fertig ? C.weiss : GOLD }}>{fertig ? "✓" : nr}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.tinte }}>{titel}</p>
        {zeile && <p style={{ margin: 0, fontSize: 12.5, color: C.grau, lineHeight: 1.4 }}>{zeile}</p>}
      </div>
    </div>
  );
}
function Feld({ label, pflicht, children, hinweis }) {
  return (
    <label style={{ display: "block", marginTop: 10 }}>
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 4 }}>{label}{pflicht ? <span style={{ color: C.gruenDunkel }}> *</span> : <span style={{ fontWeight: 400 }}> {zw("(freiwillig)", "(optional)")}</span>}</span>
      {children}
      {hinweis && <span style={{ display: "block", fontSize: 11.5, color: C.hellgrau, marginTop: 4, lineHeight: 1.45 }}>{hinweis}</span>}
    </label>
  );
}

/* ---------- ① Angaben ---------- */
function Angaben({ a, setA, fertig }) {
  const klassen = klassenFuer(a.schulart);
  const kapitel = a.schulart && a.klasse ? kapitelZurKlasse(a.schulart, a.klasse) : [];
  const setze = (k, v) => setA((alt) => {
    const n = { ...alt, [k]: v };
    if (k === "schulart" && !klassenFuer(v).includes(Number(n.klasse))) n.klasse = "";
    if ((k === "schulart" || k === "klasse") && n.kapitel && !kapitelZurKlasse(n.schulart, n.klasse).some((x) => x.id === n.kapitel)) n.kapitel = "";
    return n;
  });
  return (
    <div style={{ ...karte, marginTop: 14 }} data-bk-angaben>
      <Schrittkopf nr="1" titel={zw("Deine Klasse und Schule", "Your class and school")} fertig={fertig} zeile={zw("Damit Mathilda weiß, wo solche Arbeiten geschrieben werden.", "So Mathilda knows where tests like this are written.")} />
      <Feld label={zw("Bundesland", "State")} pflicht>
        <select value={a.bundesland} onChange={(e) => setze("bundesland", e.target.value)} style={feldStil} data-feld="bundesland">
          <option value="">{zw("Bitte wählen", "Please choose")}</option>
          {BUNDESLAENDER.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </Feld>
      <Feld label={zw("Schulart", "School type")} pflicht>
        <select value={a.schulart} onChange={(e) => setze("schulart", e.target.value)} style={feldStil} data-feld="schulart">
          <option value="">{zw("Bitte wählen", "Please choose")}</option>
          {SCHULARTEN_BK.map((s) => <option key={s.id} value={s.id}>{s.name}{s.zeile ? ` – ${s.zeile}` : ""}</option>)}
        </select>
      </Feld>
      <Feld label={zw("Klasse", "Grade")} pflicht>
        <div role="radiogroup" aria-label={zw("Klasse", "Grade")} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(46px, 1fr))", gap: 6 }}>
          {(a.schulart ? klassen : klassenFuer("g9")).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={Number(a.klasse) === k} onClick={() => setze("klasse", k)} disabled={!a.schulart} data-klasse={k}
              style={{ height: 42, borderRadius: 11, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: a.schulart ? "pointer" : "default", opacity: a.schulart ? 1 : 0.45,
                border: `1.5px solid ${Number(a.klasse) === k ? C.see : C.linie}`, background: Number(a.klasse) === k ? C.see : C.weiss, color: Number(a.klasse) === k ? C.weiss : C.see }}>{k}</button>
          ))}
        </div>
      </Feld>
      <Feld label={zw("Schule", "School")} hinweis={zw("Nur für die Statistik, nie öffentlich sichtbar. Bitte keinen Namen einer Lehrkraft.", "Only for statistics, never shown publicly. Please no teacher names.")}>
        <input value={a.schule} onChange={(e) => setze("schule", e.target.value.slice(0, 100))} placeholder={zw("z. B. Gymnasium in Konstanz", "e.g. grammar school in Konstanz")} style={feldStil} data-feld="schule" autoComplete="off" />
      </Feld>
      <Feld label={zw("Kapitel im Buch", "Textbook chapter")} hinweis={zw("Weißt du es nicht genau, ordnet Mathilda die Arbeit selbst zu.", "If you're not sure, Mathilda will assign it herself.")}>
        <select value={a.kapitel} onChange={(e) => setze("kapitel", e.target.value)} style={feldStil} disabled={!kapitel.length} data-feld="kapitel">
          <option value="">{zw("Mathilda soll es erkennen", "Let Mathilda decide")}</option>
          {kapitel.map((k) => <option key={k.id} value={k.id}>{k.titel}</option>)}
        </select>
      </Feld>
      <Feld label={zw("Wann geschrieben?", "When was it written?")}>
        <input type="month" value={a.monat} onChange={(e) => setze("monat", e.target.value)} style={feldStil} data-feld="monat" />
      </Feld>
    </div>
  );
}

/* ---------- ② Freigabe ---------- */
function Freigabe({ f, setF, fertig, aktiv }) {
  return (
    <div style={{ ...karte, marginTop: 10, opacity: aktiv ? 1 : 0.55 }} data-bk-freigabe>
      <Schrittkopf nr="2" titel={zw("Kurz bestätigen", "Quick confirmation")} fertig={fertig} />
      {FREIGABE.map((x) => {
        const an = f[x.id] === true;
        return (
          <button key={x.id} type="button" role="checkbox" aria-checked={an} disabled={!aktiv} onClick={() => setF((o) => ({ ...o, [x.id]: !an }))} data-freigabe={x.id}
            style={{ display: "flex", gap: 12, alignItems: "flex-start", width: "100%", textAlign: "left", padding: "11px 12px", marginTop: 6, borderRadius: 12, fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
              border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss }}>
            <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: 7, flex: "none", marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${an ? C.see : C.hellgrau}`, background: an ? C.see : C.weiss, color: C.weiss, fontSize: 14, fontWeight: 800 }}>{an ? "✓" : ""}</span>
            <span style={{ fontSize: 14, color: C.tinte, lineHeight: 1.5 }}>{englisch() ? x.en : x.de}</span>
          </button>
        );
      })}
      {aktiv && !fertig && <p style={{ margin: "8px 0 0", fontSize: 12.5, color: C.grau, lineHeight: 1.5 }}>{zw("Trifft etwas nicht zu? Dann warte bitte noch – oder deck Name und Note beim Fotografieren mit einem Blatt ab.", "Something doesn't apply? Then please wait – or cover your name and grade with a sheet of paper when taking the photo.")}</p>}
    </div>
  );
}

/* ---------- ③ Fotos ---------- */
function Fotos({ bilder, setBilder, aktiv, onAnalyse, laeuft, kameraWartet, setKameraWartet }) {
  const [scan, setScan] = useState(false);
  const [lade, setLade] = useState(false);
  const [fehler, setFehler] = useState("");
  const kameraRef = useRef(null), galerieRef = useRef(null);
  const bytes = bilder.reduce((n, b) => n + b.b64.length * 0.75, 0);
  const voll = bilder.length >= MAX_SEITEN;
  /* Kam der Schüler über den Kamera-Knopf der Klausurbox, geht die Kamera auf, sobald Angaben und Bestätigung stehen */
  useEffect(() => { if (kameraWartet && aktiv && !voll) { setKameraWartet(false); setScan(true); } }, [kameraWartet, aktiv, voll, setKameraWartet]);
  /* Serienmodus: opt.weiter = true → Kamera bleibt für die nächste Seite offen (Knopf „Foto“); false → „Letztes Foto“ bzw. Einzelbild */
  const datei = async (f, opt) => {
    if (!f) return;
    if (voll) { setScan(false); return; }
    const weiter = !!(opt && opt.weiter);
    setFehler(""); setLade(true); if (!weiter) setScan(false);
    try {
      const src = await dekodieren(f, () => {});
      const r = rendern(src, 0);
      if (bytes + r.b64.length * 0.75 > MAX_BYTES_GESAMT) throw new Error(zw("Zusammen sind die Fotos zu groß. Lass eine Seite weg oder fotografiere näher.", "Together the photos are too large. Leave out a page or take a closer photo."));
      setBilder((alt) => [...alt, { quelle: src, drehung: 0, b64: r.b64, vorschau: r.vorschau }]);
      if (weiter && bilder.length + 1 >= MAX_SEITEN) setScan(false);   // letzte mögliche Seite erreicht
    } catch (e) { setScan(false); setFehler(e.message || zw("Das Foto ließ sich nicht öffnen.", "The photo could not be opened.")); }
    finally { setLade(false); }
  };
  const drehen = (i) => setBilder((alt) => alt.map((b, k) => { if (k !== i) return b; const d = (b.drehung + 90) % 360; const r = rendern(b.quelle, d); return { ...b, drehung: d, b64: r.b64, vorschau: r.vorschau }; }));
  return (
    <div style={{ ...karte, marginTop: 10, opacity: aktiv ? 1 : 0.55 }} data-bk-fotos>
      <Schrittkopf nr="3" titel={zw("Aufgabenblatt fotografieren", "Photograph the task sheet")} fertig={false} zeile={zw(`Bis zu ${MAX_SEITEN} Seiten · gerade von oben · gutes Licht`, `Up to ${MAX_SEITEN} pages · straight from above · good light`)} />
      {bilder.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
          {bilder.map((b, i) => (
            <div key={i} style={{ position: "relative", background: C.sand, borderRadius: 12, padding: 5 }}>
              <img src={b.vorschau} alt={zw(`Seite ${i + 1}`, `Page ${i + 1}`)} style={{ display: "block", width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: 8 }} />
              <span style={{ position: "absolute", left: 9, top: 9, background: NACHT, color: GOLD, fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "2px 7px" }}>{i + 1}</span>
              <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                <button type="button" onClick={() => drehen(i)} aria-label={zw(`Seite ${i + 1} drehen`, `Rotate page ${i + 1}`)} style={{ ...kleinKnopf, height: 30, padding: 0, flex: 1, fontSize: 14 }}>↻</button>
                <button type="button" onClick={() => setBilder((alt) => alt.filter((_, k) => k !== i))} aria-label={zw(`Seite ${i + 1} entfernen`, `Remove page ${i + 1}`)} style={{ ...kleinKnopf, height: 30, padding: 0, flex: 1, fontSize: 14 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!voll && (
        <div style={{ display: "grid", gap: 8 }}>
          <button type="button" onClick={() => setScan(true)} disabled={!aktiv} data-scan
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 999, border: "none", cursor: aktiv ? "pointer" : "default", fontFamily: "inherit", fontSize: 15.5, fontWeight: 800, color: NACHT,
              background: `linear-gradient(135deg, #F8D23A 0%, ${GOLD} 55%, #D9A600 100%)`, boxShadow: aktiv ? "0 8px 22px rgba(237,187,0,0.38), inset 0 1px 0 rgba(255,255,255,0.55)" : "none" }}>
            <span style={{ width: 36, height: 36, borderRadius: 999, background: NACHT, display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
            </span>
            {bilder.length ? zw(`Seite ${bilder.length + 1} fotografieren`, `Photograph page ${bilder.length + 1}`) : zw("Blatt fotografieren", "Photograph the sheet")}
          </button>
          <button type="button" onClick={() => galerieRef.current?.click()} disabled={!aktiv} style={{ height: 44, borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, cursor: aktiv ? "pointer" : "default" }} data-galerie-knopf>
            {zw("Foto aus der Galerie", "Photo from gallery")}
          </button>
          {lade && <p style={{ fontSize: 13, color: C.grau, margin: 0 }}>{zw("Foto wird vorbereitet …", "Preparing the photo …")}</p>}
        </div>
      )}
      <input ref={galerieRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { datei(e.target.files && e.target.files[0]); e.target.value = ""; }} data-galerie />
      <input ref={kameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => { datei(e.target.files && e.target.files[0]); e.target.value = ""; }} />
      {fehler && <Rueck art="warn">{fehler}</Rueck>}
      <GrosserKnopf gold onClick={onAnalyse} disabled={!aktiv || !bilder.length || laeuft}>{laeuft ? zw("Mathilda liest …", "Mathilda is reading …") : zw("Von Mathilda analysieren lassen", "Let Mathilda analyse it")}</GrosserKnopf>
      <p style={{ fontSize: 11.5, color: C.hellgrau, margin: "10px 0 0", lineHeight: 1.5 }}>
        {zw("Die Fotos gehen nur zur Analyse an Anthropic (Claude) und werden danach verworfen. Gespeichert wird erst, was du im nächsten Schritt siehst und einwirfst.", "The photos go to Anthropic (Claude) only for the analysis and are discarded afterwards. Only what you see in the next step and drop in is stored.")}
      </p>
      <BlattScanner offen={scan} onSchliessen={() => setScan(false)} onFoto={datei} serie={{ seite: Math.min(bilder.length + 1, MAX_SEITEN), max: MAX_SEITEN }}
        onKameraApp={() => { setScan(false); kameraRef.current?.click(); }} onGalerie={() => { setScan(false); galerieRef.current?.click(); }} />
    </div>
  );
}

/* ---------- Läuft ---------- */
function Laeuft() {
  const saetze = [zw("Mathilda liest das Blatt …", "Mathilda is reading the sheet …"), zw("Sie sortiert die Aufgabentypen …", "Sorting the task types …"), zw("… und lässt Namen, Noten und Zahlen weg.", "… and leaves out names, grades and numbers.")];
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % saetze.length), 2200); return () => clearInterval(t); }, []);
  return (
    <div style={{ ...karte, marginTop: 14, display: "flex", alignItems: "center", gap: 14 }} role="status" data-laeuft>
      <span className="bk-puls" style={{ flex: "none" }}><BriefkastenBild groesse={46} /></span>
      <style>{`.bk-puls { animation: bkPuls 1.4s ease-in-out infinite; } @keyframes bkPuls { 0%,100% { transform: scale(1); } 50% { transform: scale(.9); } } @media (prefers-reduced-motion: reduce) { .bk-puls { animation: none; } }`}</style>
      <p style={{ margin: 0, fontSize: 15, color: C.tinte, fontWeight: 600 }}>{saetze[i]}</p>
    </div>
  );
}

/* ---------- ④ Vorschau: Das merkt sich Mathilda ---------- */
const Chip = ({ children, gold }) => <span style={{ display: "inline-block", fontSize: 12.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: gold ? "#FFF4D6" : C.himmel, color: gold ? "#7A5A00" : C.see, marginRight: 6, marginBottom: 6 }}>{children}</span>;
const AFB = { I: ["I · reproduzieren", "I · reproduce"], II: ["II · Zusammenhänge", "II · connect"], III: ["III · verallgemeinern", "III · generalise"] };
export function StrukturAnsicht({ m }) {
  const a = m.analyse;
  const land = (BUNDESLAENDER.find((b) => b.id === m.bundesland) || {}).name;
  const kap = m.kapitel && THEMEN[m.kapitel] ? THEMEN[m.kapitel].titel : null;
  const summe = a.aufgaben.reduce((n, x) => n + (x.punkte || 0), 0);
  return (
    <div data-struktur>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <Chip>{land}</Chip><Chip>{(schulartBk(m.schulart) || {}).name}</Chip><Chip>{zw("Klasse", "Grade")} {m.klasse}</Chip>
        {m.schule && <Chip>{m.schule}</Chip>}{m.monat && <Chip>{m.monat.split("-").reverse().join("/")}</Chip>}
      </div>
      <p style={{ margin: "6px 0 2px", fontSize: 18, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{a.thema || kap || zw("Ohne Thema", "No topic")}</p>
      <p style={{ margin: 0, fontSize: 13, color: C.grau }}>
        {nm(ART_NAME[a.art])}{kap ? ` · ${zw("Kapitel", "Chapter")} „${kap}“` : ""}{a.dauerMin ? ` · ${a.dauerMin} min` : ""}{a.gesamtpunkte || summe ? ` · ${a.gesamtpunkte || summe} ${zw("Punkte", "points")}` : ""}{a.niveau ? ` · ${zw("Niveau", "level")} ${a.niveau}/5` : ""}
      </p>
      {(a.hilfsmittel.length > 0 || a.schwerpunkte.length > 0) && (
        <div style={{ marginTop: 8 }}>
          {a.hilfsmittel.map((h) => <Chip key={h} gold>{nm(HILFSMITTEL_NAME[h])}</Chip>)}
          {a.schwerpunkte.map((s) => <Chip key={s}>{s}</Chip>)}
        </div>
      )}
      <div style={{ marginTop: 10, borderRadius: 14, border: `1px solid ${C.linie}`, overflow: "hidden" }}>
        {a.aufgaben.map((x, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 8, padding: "10px 12px", borderTop: i ? `1px solid ${C.linie}` : "none", background: i % 2 ? "#FBFCFE" : C.weiss }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.see }}>{x.nr || i + 1}</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.tinte, lineHeight: 1.35 }}>{x.typ}</p>
              {x.inhalt && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.grau, lineHeight: 1.45 }}>{x.inhalt}</p>}
              <p style={{ margin: "3px 0 0", fontSize: 11.5, color: C.hellgrau }}>
                {[x.operator, x.anforderung ? `AFB ${nm(AFB[x.anforderung])}` : null, x.kontext && x.kontext !== "innermathematisch" ? x.kontext : null, x.ohneHilfsmittel ? zw("ohne Hilfsmittel", "no aids") : null].filter(Boolean).join(" · ")}
              </p>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, whiteSpace: "nowrap" }}>{x.punkte != null ? `${x.punkte} P` : ""}</span>
          </div>
        ))}
      </div>
      {a.besonderheiten.length > 0 && <p style={{ margin: "8px 0 0", fontSize: 12.5, color: C.grau, lineHeight: 1.5 }}>{zw("Auffällig: ", "Notable: ")}{a.besonderheiten.join(" · ")}</p>}
    </div>
  );
}

function Vorschau({ m, personen, onEinwerfen, onVerwerfen, sendet, fehler }) {
  return (
    <div data-bk-vorschau>
      <div style={{ ...karte, marginTop: 14 }}>
        <Schrittkopf nr="4" titel={zw("Das merkt sich Mathilda", "This is what Mathilda keeps")} fertig={false} zeile={zw("Genau das – und nur das – wird gespeichert.", "Exactly this – and only this – is stored.")} />
        <StrukturAnsicht m={m} />
      </div>
      <div style={{ ...karte, marginTop: 10, background: NACHT, color: C.weiss }} data-nicht-gespeichert>
        <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD }}>{zw("Nicht gespeichert", "Not stored")}</p>
        <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.6, color: C.goldText }}>
          {zw("Deine Fotos (schon verworfen) · die Aufgabentexte · alle Zahlen und Funktionen aus den Aufgaben · Namen · Noten · Korrekturen.", "Your photos (already discarded) · the task texts · all numbers and functions from the tasks · names · grades · corrections.")}
        </p>
        {personen.length > 0 && (
          <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.55, color: C.weiss }}>
            {zw("Auf dem Foto war zu sehen: ", "Visible on the photo: ")}<b>{personen.map((p) => nm(PERSON_NAME[p])).join(", ")}</b>. {zw("Keine Sorge – davon wurde nichts übernommen. Beim nächsten Mal einfach abdecken.", "Don't worry – none of it was kept. Next time, just cover it up.")}
          </p>
        )}
      </div>
      {fehler && <Rueck art="warn">{fehler}</Rueck>}
      <GrosserKnopf gold onClick={onEinwerfen} disabled={sendet}>{sendet ? zw("Wird eingeworfen …", "Dropping it in …") : zw("In den Briefkasten werfen", "Drop it in the mailbox")}</GrosserKnopf>
      <GrosserKnopf ghost onClick={onVerwerfen} disabled={sendet}>{zw("Verwerfen – nichts speichern", "Discard – store nothing")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Danke ---------- */
function Danke({ m, anzahl, gehe, onNoch, konto }) {
  const hilfen = useMemo(() => (m.kapitel ? hilfenFuer(m.kapitel).slice(0, 3) : []), [m]);
  return (
    <div data-bk-danke>
      <div style={{ marginTop: 14, borderRadius: 20, padding: "22px 18px", textAlign: "center", color: C.weiss, background: `linear-gradient(160deg, ${NACHT} 0%, ${C.see} 100%)` }}>
        <div style={{ display: "flex", justifyContent: "center" }}><BriefkastenBild groesse={70} /></div>
        <p style={{ margin: "10px 0 0", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>{zw("Eingeworfen. Danke!", "Dropped in. Thank you!")}</p>
        <p style={{ margin: "6px auto 0", maxWidth: 420, fontSize: 14, fontWeight: 300, lineHeight: 1.6, color: C.goldText }}>
          {anzahl > 1 ? zw(`Das war deine ${anzahl}. Arbeit. `, `That was your test no. ${anzahl}. `) : ""}
          {zw("Mit jeder Arbeit lernt Mathilda besser, wie in deiner Klassenstufe geprüft wird – davon profitieren alle Testklausuren der App.", "With every test Mathilda learns better how your grade is examined – every practice test in the app benefits.")}
        </p>
        {!konto && <p style={{ margin: "8px auto 0", maxWidth: 420, fontSize: 12.5, color: C.goldText, lineHeight: 1.5 }}>{zw("Ohne Konto ist die Meldung keinem Gerät zugeordnet und lässt sich später nicht mehr löschen – sie enthält ja nichts Persönliches.", "Without an account the report isn't linked to you and can't be deleted later – it contains nothing personal.")}</p>}
      </div>
      {hilfen.length > 0 && (
        <div style={{ ...karte, marginTop: 10 }}>
          <p style={kicker}>{zw("Passend zu dieser Arbeit", "Matching this test")}</p>
          {hilfen.map((h) => (
            <button key={h.id} type="button" onClick={() => gehe && gehe(h.ziel)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "10px 0", border: "none", borderTop: `1px solid ${C.linie}`, background: "none", fontFamily: "inherit", cursor: "pointer" }}>
              <span><b style={{ display: "block", fontSize: 14.5, color: C.tinte }}>{h.name}</b><span style={{ fontSize: 12.5, color: C.grau }}>{h.zeile}</span></span>
              <span style={{ color: C.see, fontWeight: 800 }} aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      )}
      <GrosserKnopf gold onClick={onNoch}>{zw("Noch eine Arbeit einwerfen", "Drop in another test")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Deine Meldungen ---------- */
function MeineMeldungen({ liste, onLoeschen, angemeldet }) {
  const [auf, setAuf] = useState(null);
  if (!liste.length) return null;
  return (
    <div style={{ ...karte, marginTop: 12 }} data-bk-meine>
      <p style={kicker}>{zw(`Deine eingeworfenen Arbeiten (${liste.length})`, `Your tests dropped in (${liste.length})`)}</p>
      {liste.map((m) => {
        const a = m.analyse || {};
        const offen = auf === m.id;
        return (
          <div key={m.id} style={{ borderTop: `1px solid ${C.linie}`, padding: "10px 0" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button type="button" onClick={() => setAuf(offen ? null : m.id)} aria-expanded={offen} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", padding: 0, fontFamily: "inherit", cursor: "pointer" }}>
                <b style={{ display: "block", fontSize: 14.5, color: C.tinte }}>{a.thema || (m.kapitel && THEMEN[m.kapitel] ? THEMEN[m.kapitel].titel : zw("Klassenarbeit", "Class test"))}</b>
                <span style={{ fontSize: 12.5, color: C.grau }}>{zw("Klasse", "Grade")} {m.klasse} · {(a.aufgaben || []).length} {zw("Aufgaben", "tasks")}{m.erstellt ? ` · ${new Date(m.erstellt).toLocaleDateString(englisch() ? "en-GB" : "de-DE")}` : ""}</span>
              </button>
              {(m.konto || !angemeldet) && (
                <button type="button" onClick={() => { if (window.confirm(zw("Diese Meldung löschen?", "Delete this report?"))) onLoeschen(m); }} style={{ ...kleinKnopf, height: 34 }} aria-label={zw("Meldung löschen", "Delete report")}>{zw("Löschen", "Delete")}</button>
              )}
            </div>
            {offen && <div style={{ marginTop: 8 }}><StrukturAnsicht m={m} /></div>}
          </div>
        );
      })}
      {!angemeldet && <p style={{ margin: "8px 0 0", fontSize: 12, color: C.hellgrau, lineHeight: 1.5 }}>{zw("Ohne Konto entfernt „Löschen“ den Eintrag nur aus dieser Liste auf deinem Gerät.", "Without an account “Delete” only removes the entry from this list on your device.")}</p>}
    </div>
  );
}

/* ---------- Vorbelegung der Angaben ---------- */
function startAngaben(profil) {
  const alt = lsLesen(ANGABEN, null);
  const leer = { bundesland: "", schulart: "", klasse: "", schule: "", kapitel: "", monat: "" };
  if (alt && typeof alt === "object") return { ...leer, ...alt, kapitel: "", monat: "" };
  const qf = lsLesen("matheplus-quickfinder", null);
  const n = { ...leer };
  if (qf && ["g8", "g9", "gms"].includes(qf.schulart)) { n.schulart = qf.schulart; n.bundesland = "bw"; }
  const k = profil && Number(profil.klasse);
  if (n.schulart && k && klassenFuer(n.schulart).includes(k)) n.klasse = k;
  else if (n.schulart && qf && qf.klasse) { const erste = Number(String(qf.klasse).split("-")[0]); if (klassenFuer(n.schulart).includes(erste)) n.klasse = erste; }
  return n;
}

/* ---------- Seite ---------- */
export function KlausurBriefkasten({ gehe }) {
  const konto = useKonto();
  const angemeldet = !!(konto && konto.nutzer);
  const [a, setA] = useState(() => startAngaben(konto && konto.profil));
  const [f, setF] = useState({});
  const [bilder, setBilder] = useState([]);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [vorschau, setVorschau] = useState(null);   // { m, personen }
  const [sendet, setSendet] = useState(false);
  const [sendeFehler, setSendeFehler] = useState("");
  const [fertig, setFertig] = useState(null);       // eingeworfene Meldung
  const [liste, setListe] = useState([]);
  const [warten, setWarten] = useState(false);
  const [kameraWartet, setKameraWartet] = useState(() => kameraWunschHolen("klausur"));   // Kamera-Knopf der Klausurbox auf der Startseite
  const oben = useRef(null);

  const angabenOk = angabenFehler(a).length === 0;
  const freigabeOk = freigabeKomplett(f);
  useEffect(() => { meineLaden(angemeldet).then(setListe).catch(() => {}); }, [angemeldet]);
  useEffect(() => { if (a.bundesland || a.schulart) lsSchreiben(ANGABEN, { bundesland: a.bundesland, schulart: a.schulart, klasse: a.klasse, schule: a.schule }); }, [a.bundesland, a.schulart, a.klasse, a.schule]);
  const hoch = () => requestAnimationFrame(() => springe("klausurbriefkasten", () => oben.current?.scrollIntoView({ behavior: "smooth", block: "start" })));

  const analysieren = async () => {
    if (!angabenOk || !freigabeOk || !bilder.length) return;
    if (!kiEinwilligungDa()) { setWarten(true); try { window.dispatchEvent(new CustomEvent("mm-ki-einwilligung")); } catch (e) { /* kein Browser */ } return; }
    setLaeuft(true); setFehler(""); setSendeFehler("");
    const fotos = bilder;
    try {
      const prompt = analysePrompt({ seiten: fotos.length, bundesland: a.bundesland, schulart: a.schulart, klasse: a.klasse, kapitel: a.kapitel || null });
      const content = [...fotos.map((b) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b.b64 } })), { type: "text", text: prompt }];
      const system = `Du bist Mathilda, die Mathe-KI-Trainerin der App Mythos Mathe.\n\n${ANALYSE_REGELN}`;
      const res = await fetch(API_URL, { method: "POST", headers: kiKopf(), body: JSON.stringify({ max_tokens: 3500, system, messages: [{ role: "user", content }] }) });
      const daten = await kiAntwort(res);
      if (daten.error) throw new Error(daten.error.message || zw("Mathilda hat abgelehnt.", "Mathilda declined."));
      const roh = (daten.content || []).map((x) => (x.type === "text" ? x.text : "")).join("");
      const erlaubt = kapitelZurKlasse(a.schulart, a.klasse).map((k) => k.id);
      const an = analyseLesen(jsonLesen(roh), { kapitelErlaubt: erlaubt });
      if (!an.lesbar) throw new Error(an.rueckfrage);
      setBilder([]);   // Fotos sofort verwerfen – sie werden nicht mehr gebraucht
      setVorschau({ m: meldungBauen({ angaben: a, analyse: an }), personen: an.personenbezug });
      hoch();
    } catch (e) {
      setFehler(e.message || zw("Mathilda ist gerade nicht erreichbar.", "Mathilda is not reachable right now."));
    } finally { setLaeuft(false); }
  };
  /* Nach erteilter Einwilligung automatisch weitermachen */
  useEffect(() => {
    const ja = () => setWarten((w) => { if (w) setTimeout(analysieren, 0); return false; });
    window.addEventListener("mm-ki-einwilligung-erteilt", ja);
    return () => window.removeEventListener("mm-ki-einwilligung-erteilt", ja);
  });

  const einwerfenKlick = async () => {
    if (!vorschau) return;
    setSendet(true); setSendeFehler("");
    try {
      const r = await einwerfen(vorschau.m);
      const eintrag = { ...vorschau.m, id: r.id, erstellt: new Date().toISOString(), konto: angemeldet && !DEMO };
      if (!eintrag.konto) lsSchreiben(EIGENE, [eintrag, ...lsLesen(EIGENE, [])].slice(0, 100));
      setListe((l) => [eintrag, ...l]);
      setFertig(vorschau.m); setVorschau(null); setF({}); hoch();
    } catch (e) { setSendeFehler(e.message); }
    finally { setSendet(false); }
  };
  const neu = () => { setFertig(null); setVorschau(null); setBilder([]); setFehler(""); setA((x) => ({ ...x, kapitel: "", monat: "" })); hoch(); };
  const loeschen = async (m) => {
    try { await meldungLoeschen(m, angemeldet); setListe((l) => l.filter((x) => x.id !== m.id)); }
    catch (e) { window.alert(e.message); }
  };

  return (
    <div data-klausurbriefkasten>
      <div ref={oben} style={{ scrollMarginTop: 70 }} />
      <Kopf />
      {fertig ? (
        <Danke m={fertig} anzahl={liste.length} gehe={gehe} onNoch={neu} konto={angemeldet && !DEMO} />
      ) : vorschau ? (
        <Vorschau m={vorschau.m} personen={vorschau.personen} sendet={sendet} fehler={sendeFehler} onEinwerfen={einwerfenKlick}
          onVerwerfen={() => { setVorschau(null); hoch(); }} />
      ) : (
        <>
          {kameraWartet && !(angabenOk && freigabeOk) && (
            <p style={{ margin: "14px 0 0", padding: "10px 14px", borderRadius: 12, background: C.himmel, border: `1.5px solid ${GOLD}`, fontSize: 13.5, fontWeight: 600, lineHeight: 1.5, color: C.tinte }} data-kamera-wartet>
              {zw("Gleich geht die Kamera auf – vorher kurz Klasse und Bestätigung angeben.", "The camera opens in a moment – first give your class and the quick confirmation.")}
            </p>
          )}
          <InfoFeld gehe={gehe} />
          <Angaben a={a} setA={setA} fertig={angabenOk} />
          <Freigabe f={f} setF={setF} fertig={freigabeOk} aktiv={angabenOk} />
          {laeuft ? <Laeuft /> : <Fotos bilder={bilder} setBilder={setBilder} aktiv={angabenOk && freigabeOk} onAnalyse={analysieren} laeuft={laeuft} kameraWartet={kameraWartet} setKameraWartet={setKameraWartet} />}
          {fehler && !laeuft && <Rueck art="warn">{fehler}</Rueck>}
        </>
      )}
      <MeineMeldungen liste={liste} onLoeschen={loeschen} angemeldet={angemeldet && !DEMO} />
    </div>
  );
}
