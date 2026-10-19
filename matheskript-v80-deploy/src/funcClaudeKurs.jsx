/* ============================================================
   KURSE „MATHE LERNEN MIT CLAUDE“ (ab 18, ansicht "claudekurs", /mathe-lernen-mit-claude)
   und  „MATHE LERNEN MIT GEMINI“ (ab 16, ansicht "geminikurs", /mathe-lernen-mit-gemini)

   Dieselbe Seite, Prop kurs = "claude" | "gemini". Zehn Lektionen: Wie frage
   ich die KI so, dass ich Mathe verstehe – nicht „löse mir“, sondern
   „erklär mir“. Jede Lektion mit Motion-Erklärung, Prompt-Vorlagen zum
   Kopieren, Beispiel-Chat (ab 18: Buch Ableitungen, ab 16: Parabeln/
   Gleichungen/Prozent/Geometrie), „So nicht – so besser“, Auftrag, Mathilda.

   Bauweise wie der Masterclass-Kursbereich (funcMasterclassKurs.jsx),
   Nachtblau mit Gold. Inhalte: claudeKursDaten.js. Filme: funcClaudeKursAnimationen.jsx.
   Fortschritt je Kurs im localStorage (mm_claudekurs / mm_geminikurs).
   ============================================================ */
import React, { useEffect, useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { springe } from "./sprung.js";
import { MathildaChatModal } from "./funcMathildaChat.jsx";
import { LEKTIONEN, KURSE, GRUNDREGELN, kurs as kursDaten, kiText, kurzFuer, schritteFuer, naechsteLektion, anteilFertig, gesamtMinuten } from "./claudeKursDaten.js";
import { ClaudeKursFilm } from "./funcClaudeKursAnimationen.jsx";

/* ---------- Farben ---------- */
const K = {
  nacht: "#06102A", navy: "#0B1E4A", blau: C.see, gold: C.flaggold, goldText: "#8A6A00", hell: "#FFF8E1",
  weiss: C.weiss, tinte: C.tinte, grau: C.grau, linie: C.linie, sand: C.sand, gruen: C.smaragd, rot: C.signal,
};
const GOLD = "linear-gradient(150deg, #FFE9A0 0%, #F4CE4A 28%, #EDBB00 55%, #D9A520 78%, #B58612 100%)";
const NACHT = `linear-gradient(165deg, ${K.nacht} 0%, ${K.navy} 55%, #12306E 100%)`;
const karte = { background: K.weiss, border: `1px solid ${K.linie}`, borderRadius: 18, padding: "16px", boxShadow: "0 2px 14px rgba(15,26,51,0.06)" };

/* ---------- Speicher ---------- */
const standLesen = (k) => {
  const leer = { fertig: {}, auftrag: {} };
  try { return { ...leer, ...JSON.parse(localStorage.getItem(k.speicher) || "{}") }; } catch (e) { return leer; }
};
const standSchreiben = (k, s) => { try { localStorage.setItem(k.speicher, JSON.stringify(s)); } catch (e) { /* privat */ } };
const nachOben = () => springe("claudekurs-lektion", () => window.scrollTo({ top: 0, behavior: "auto" }));

/* ---------- Kleine Bausteine ---------- */
/* Kurs-Emblem: Sprechblase mit Funken – eigenes Zeichen, kein Markenlogo */
export function KursEmblem({ groesse = 120, hell = true }) {
  const f = hell ? K.gold : K.navy;
  return (
    <svg viewBox="0 0 120 120" width={groesse} height={groesse} aria-hidden="true" style={{ display: "block" }}>
      <path d="M22 28 h64 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 h-36 l-18 16 v-16 h-10 a12 12 0 0 1 -12 -12 v-34 a12 12 0 0 1 12 -12z" fill="none" stroke={f} strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M38 50 h44 M38 62 h30" stroke={f} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M96 10 l3.2 8.8 l8.8 3.2 l-8.8 3.2 l-3.2 8.8 l-3.2 -8.8 l-8.8 -3.2 l8.8 -3.2z" fill={f} />
    </svg>
  );
}

function Kicker({ children, hell }) {
  return <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.16em", color: hell ? K.gold : K.goldText, margin: "0 0 6px" }}>{children}</p>;
}

function Haken({ an, gross }) {
  const g = gross ? 26 : 22;
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", width: g, height: g, borderRadius: g / 2, flex: "none", alignItems: "center", justifyContent: "center",
      background: an ? GOLD : "transparent", border: an ? "none" : `1.5px solid ${K.linie}` }}>
      {an && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.4 2.4 4.6-5" stroke={K.navy} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  );
}

function Knopf({ children, onClick, art = "gold", breit, ...rest }) {
  const stile = {
    gold: { background: GOLD, color: K.navy, border: "none", boxShadow: "0 6px 18px rgba(181,134,18,0.35)" },
    navy: { background: K.navy, color: K.weiss, border: "none" },
    rand: { background: K.weiss, color: K.navy, border: `1.5px solid ${K.linie}` },
    glas: { background: "rgba(255,255,255,0.1)", color: K.weiss, border: "1px solid rgba(255,255,255,0.25)" },
  };
  return (
    <button type="button" onClick={onClick} {...rest}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44, padding: "0 18px", borderRadius: 999, cursor: "pointer",
        fontFamily: "inherit", fontWeight: 800, fontSize: 14, width: breit ? "100%" : undefined, ...stile[art], ...(rest.style || {}) }}>
      {children}
    </button>
  );
}

function Abschnitt({ kicker, titel, children }) {
  return (
    <section style={{ marginTop: 28 }}>
      <Kicker>{kicker}</Kicker>
      {titel && <h3 style={{ fontSize: 19, fontWeight: 800, color: K.navy, margin: "0 0 12px", letterSpacing: "-0.01em" }}>{titel}</h3>}
      {children}
    </section>
  );
}

/* Hinweis auf den Schwesterkurs (andere Altersgruppe) */
function Schwester({ k, gehe, hell }) {
  const andere = KURSE.find((x) => x.id !== k.id);
  return (
    <button type="button" onClick={() => gehe({ ansicht: andere.ansicht })} data-claudekurs-schwester
      style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 36, padding: "0 14px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
        background: hell ? "rgba(255,255,255,0.1)" : K.weiss, color: hell ? K.weiss : K.navy, border: hell ? "1px solid rgba(255,255,255,0.25)" : `1px solid ${K.linie}` }}>
      <span style={{ fontWeight: 800, color: K.gold }}>{andere.alter}</span> {andere.titel} →
    </button>
  );
}

/* Kopieren-Knopf mit Rückmeldung */
function Kopieren({ text, art = "gold", label = "Prompt kopieren" }) {
  const [ok, setOk] = useState(false);
  return (
    <Knopf art={art} onClick={() => { try { navigator.clipboard.writeText(text).catch(() => {}); } catch (e) { /* kein Zugriff */ } setOk(true); setTimeout(() => setOk(false), 1800); }}
      aria-live="polite" style={{ minHeight: 38, fontSize: 13 }}>
      {ok ? "Kopiert ✓" : label}
    </Knopf>
  );
}

/* ---------- Kopf ---------- */
function Kopf({ untertitel, k, gehe }) {
  return (
    <div style={{ background: NACHT, color: K.weiss, position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 100% 0%, rgba(237,187,0,0.22) 0%, transparent 60%)" }} />
      <div aria-hidden="true" className="clk-kopfbild" style={{ position: "absolute", right: 14, top: 22, opacity: 0.9 }}><KursEmblem groesse={140} /></div>
      <div className="held mx-auto px-6 pt-10 pb-5" style={{ maxWidth: 620, position: "relative" }}>
        <Kicker hell>KURS {k.alter.toUpperCase()} · 10 LEKTIONEN</Kicker>
        <h1 style={{ fontWeight: 800, fontSize: "clamp(28px, 8vw, 40px)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0,
          background: "linear-gradient(180deg, #FFF 0%, #E3E8EF 45%, #B9C2CE 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Mathe lernen<br />mit {k.ki}
        </h1>
        <div style={{ width: 54, height: 4, background: GOLD, borderRadius: 2, marginTop: 16, marginBottom: 14 }} />
        <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.6, margin: "0 0 14px", maxWidth: 400 }}>{untertitel}</p>
        <Schwester k={k} gehe={gehe} hell />
      </div>
      <div style={{ height: 24, background: K.sand, borderRadius: "20px 20px 0 0", position: "relative" }} />
      <style>{`@media (max-width:520px){.clk-kopfbild svg{width:84px !important;height:84px !important}.clk-kopfbild{top:16px !important;opacity:.55 !important}}`}</style>
    </div>
  );
}

/* ---------- Übersicht ---------- */
function Uebersicht({ k, stand, oeffnen, gehe }) {
  const zahl = LEKTIONEN.filter((l) => stand.fertig[l.id]).length;
  const weiter = naechsteLektion(stand.fertig);
  return (
    <div className="mx-auto px-4 pb-16" style={{ maxWidth: 760 }}>
      {/* Fortschritt */}
      <div style={{ background: NACHT, color: K.weiss, borderRadius: 20, padding: "18px 18px 16px", marginBottom: 18, boxShadow: "0 10px 30px rgba(6,16,42,0.3)", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 90% at 100% 0%, rgba(237,187,0,0.16), transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", color: K.gold, margin: 0 }}>DEIN FORTSCHRITT</p>
            <p style={{ fontSize: 13, color: "#C9D6EE", margin: 0 }}><b style={{ color: K.weiss, fontSize: 18 }}>{zahl}</b> von {LEKTIONEN.length} Lektionen</p>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.14)", marginTop: 10, overflow: "hidden" }} role="progressbar" aria-valuemin={0} aria-valuemax={LEKTIONEN.length} aria-valuenow={zahl}>
            <div style={{ height: "100%", width: `${anteilFertig(stand.fertig) * 100}%`, background: GOLD, borderRadius: 4, transition: "width .3s" }} />
          </div>
          <button type="button" onClick={() => oeffnen(weiter.id)} data-claudekurs-weiter
            style={{ marginTop: 14, width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 12px 12px 14px", borderRadius: 14, border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.08)", color: K.weiss, fontFamily: "inherit", textAlign: "left" }}>
            <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.05em", color: "transparent", WebkitTextStroke: `1.5px ${K.gold}`, lineHeight: 1, flex: "none", width: 44 }}>{String(weiter.nr).padStart(2, "0")}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: K.gold }}>{zahl === 0 ? "JETZT STARTEN" : zahl === LEKTIONEN.length ? "NOCH EINMAL" : "WEITER MIT"}</span>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{weiter.titel}</span>
            </span>
            <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 18, background: GOLD, color: K.navy, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", fontWeight: 800 }}>▶</span>
          </button>
        </div>
      </div>

      {/* Worum es geht */}
      <div style={{ ...karte, marginBottom: 22, borderLeft: `4px solid ${K.gold}` }}>
        <p style={{ margin: 0, fontSize: 14.5, color: K.tinte, lineHeight: 1.6 }}>
          <b>{k.ki} ist Trainer, nicht Lösungsmaschine.</b> In zehn Lektionen lernst du, wie du fragst, damit du am Ende selbst rechnen kannst – mit Beispielen für <b>{k.klassen}</b> ({k.kurz}). {k.id === "claude" ? "Claude ist ab 18; ab 16 gibt es den Schwesterkurs mit Gemini, davor" : "Ein Google-Konto gibt es in Deutschland ab 16; darunter hilft"} Mathilda AI hier in der App – die Prompts sind überall dieselben.
        </p>
      </div>

      {/* Lektionen */}
      <Kicker>DIE ZEHN LEKTIONEN</Kicker>
      <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
        {LEKTIONEN.map((l) => {
          const fertig = !!stand.fertig[l.id];
          return (
            <button key={l.id} type="button" onClick={() => oeffnen(l.id)} className="clk-lektion" data-claudekurs-lektion={l.id}
              style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "12px 14px", borderRadius: 16, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                background: K.weiss, border: `1px solid ${fertig ? "#E9CF7A" : K.linie}`, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
              <span aria-hidden="true" style={{ width: 46, height: 46, borderRadius: 13, flex: "none", background: NACHT, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 800, color: "transparent", WebkitTextStroke: `1.2px ${K.gold}`, letterSpacing: "-0.04em" }}>{String(l.nr).padStart(2, "0")}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 700, fontSize: 15, color: K.tinte, lineHeight: 1.3 }}>{l.titel}</span>
                <span className="clk-frage" style={{ display: "block", fontSize: 12.5, color: K.grau, marginTop: 3, lineHeight: 1.45 }}>{kiText(l.frage, k.ki)}</span>
                <span style={{ display: "block", fontSize: 11.5, color: K.goldText, fontWeight: 700, marginTop: 4 }}>{l.dauer} Minuten</span>
              </span>
              <Haken an={fertig} gross />
            </button>
          );
        })}
      </div>

      {/* Spickzettel */}
      <Kicker>DIE ZEHN REGELN AUF EINEN BLICK</Kicker>
      <div style={{ ...karte, padding: "6px 16px", marginBottom: 20 }}>
        {GRUNDREGELN.map((r, i) => (
          <div key={r} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: i < GRUNDREGELN.length - 1 ? `1px solid ${K.linie}` : "none" }}>
            <span style={{ flex: "none", width: 24, height: 24, borderRadius: 12, background: K.navy, color: K.gold, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <span style={{ fontSize: 14, color: K.tinte, lineHeight: 1.55 }}>{r}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Kopieren text={GRUNDREGELN.map((r, i) => `${i + 1}. ${r}`).join("\n")} art="rand" label="Regeln kopieren" />
        <Knopf art="navy" onClick={() => gehe({ ansicht: "analyse", foto: "chat" })} style={{ minHeight: 38, fontSize: 13 }}>Mathilda öffnen</Knopf>
      </div>
      <p style={{ fontSize: 12.5, color: K.grau, textAlign: "center", margin: "18px 0 0" }}>{LEKTIONEN.length} Lektionen · rund {gesamtMinuten()} Minuten · {k.titel} · {k.alter}</p>
      <style>{`.clk-lektion{transition:transform .15s ease, box-shadow .15s ease}
        @media (hover:hover){.clk-lektion:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(15,26,51,0.10)}}
        @media (max-width:400px){.clk-frage{display:none !important}}`}</style>
    </div>
  );
}

/* ---------- Beispiel-Chat ---------- */
function Chat({ gespraech }) {
  return (
    <div style={{ display: "grid", gap: 8, padding: "14px 12px", background: K.sand, borderRadius: 14 }}>
      {gespraech.map((z, i) => {
        const duZ = z.wer === "du";
        return (
          <div key={i} style={{ display: "flex", justifyContent: duZ ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
            {!duZ && <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: 12, background: NACHT, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}><KursEmblem groesse={16} /></span>}
            <div style={{ maxWidth: "86%", padding: "9px 12px", borderRadius: 14, fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap",
              background: duZ ? GOLD : K.weiss, color: duZ ? K.navy : K.tinte, border: duZ ? "none" : `1px solid ${K.blau}`,
              borderBottomRightRadius: duZ ? 4 : 14, borderBottomLeftRadius: duZ ? 14 : 4, fontWeight: duZ ? 600 : 400 }}>
              {z.text}
            </div>
            {duZ && <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: 12, background: K.gold, flex: "none", fontSize: 9.5, fontWeight: 800, color: K.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>Du</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Modul (eine Lektion) ---------- */
function Modul({ k, l, stand, setStand, oeffnen, zurUebersicht, gehe }) {
  const [chat, setChat] = useState(false);
  const i = LEKTIONEN.indexOf(l);
  const naechste = LEKTIONEN[i + 1], vorige = LEKTIONEN[i - 1];
  const stufe = k.beispiele;
  const ki = (t) => kiText(t, k.ki);
  const b = l.beispiel[stufe];
  const auftrag = (stand.auftrag && stand.auftrag[l.id]) || [];
  const aendern = (f) => setStand((s) => { const neu = f(s); standSchreiben(k, neu); return neu; });
  const fertig = !!stand.fertig[l.id];
  const aufgabe = useMemo(() => ({ text: `Kurs „${k.titel}“, Lektion ${l.nr}: „${l.titel}“. Leitfrage: ${ki(l.frage)} Der Schüler übt gerade, so zu fragen: ${ki(l.mathilda)}` }), [l.id]);   // eslint-disable-line react-hooks/exhaustive-deps
  const schritte = schritteFuer(l, k.id);
  const kurz = kurzFuer(l, k.id);

  return (
    <div className="mx-auto px-5 pb-16" style={{ maxWidth: 720 }} data-claudekurs-modul={l.id}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", lineHeight: 1.5, color: K.goldText, margin: "2px 0 0" }}>
          LEKTION {l.nr} VON {LEKTIONEN.length} · {l.dauer} MIN
        </p>
        <button type="button" onClick={zurUebersicht}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px 8px 8px", borderRadius: 10, border: `1px solid ${K.linie}`, background: K.weiss,
            color: K.navy, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
          <span aria-hidden="true">←</span> Alle Lektionen
        </button>
      </div>
      <h2 style={{ fontSize: "clamp(23px, 6.4vw, 30px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, color: K.navy, margin: "10px 0 6px" }}>{l.titel}</h2>
      <p style={{ fontSize: 15.5, fontStyle: "italic", color: "#2B3A4F", margin: "0 0 16px", lineHeight: 1.5 }}>{ki(l.frage)}</p>

      <ClaudeKursFilm id={l.id} stufe={stufe} ki={k.ki} titel={ki(l.frage)} />

      <Abschnitt kicker="DARUM GEHT ES">
        <div style={{ ...karte, padding: "4px 16px" }}>
          {kurz.map((t, n) => (
            <p key={n} style={{ fontSize: 15, color: K.tinte, lineHeight: 1.75, margin: "12px 0", fontWeight: 300 }}>{ki(t)}</p>
          ))}
        </div>
      </Abschnitt>

      {schritte && (
        <Abschnitt kicker={`${k.alter.toUpperCase()} · EIGENES KONTO BEI ${k.anbieter.toUpperCase()}`} titel="So kommst du hinein">
          <div style={{ ...karte, padding: "4px 16px" }}>
            {schritte.map(([t, text], n) => (
              <div key={t} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: n < schritte.length - 1 ? `1px solid ${K.linie}` : "none" }}>
                <span style={{ flex: "none", width: 26, height: 26, borderRadius: 13, background: K.navy, color: K.gold, fontSize: 12.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{n + 1}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: K.tinte }}>{t}</span>
                  <span style={{ display: "block", fontSize: 13.5, color: K.grau, lineHeight: 1.55, marginTop: 2 }}>{text}</span>
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", margin: "10px 4px 0" }}>
            <p style={{ fontSize: 12.5, color: K.grau, margin: 0, lineHeight: 1.5 }}>
              {k.id === "claude" ? "Noch keine 18? Ab 16 gibt es denselben Kurs mit Gemini, darunter Mathilda AI in der App." : "Noch keine 16? Mathilda AI in der App läuft auf Claude – gleiche Prompts. Schon 18? Dann lohnt auch der Kurs mit Claude."}
            </p>
            <Schwester k={k} gehe={gehe} />
          </div>
        </Abschnitt>
      )}

      <Abschnitt kicker="PROMPTS ZUM KOPIEREN" titel="Das schreibst du">
        <div style={{ display: "grid", gap: 10 }}>
          {l.prompts.map((p) => (
            <div key={p.titel} style={{ background: NACHT, color: K.weiss, borderRadius: 18, padding: 16 }} data-claudekurs-prompt>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: K.gold, margin: "0 0 6px" }}>{p.titel.toUpperCase()}</p>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: "0 0 12px", padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.07)", borderLeft: `3px solid ${K.gold}`, whiteSpace: "pre-wrap" }}>{ki(p.text)}</p>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12.5, color: "#C9D6EE" }}>Wann: {ki(p.wann)}</span>
                <Kopieren text={ki(p.text)} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: K.grau, margin: "8px 4px 0", lineHeight: 1.5 }}>Alles in [eckigen Klammern] ersetzt du durch deine Angaben.</p>
      </Abschnitt>

      <Abschnitt kicker={`BEISPIEL · ${k.klassen.toUpperCase()}`} titel="So sieht das im Chat aus">
        <div style={{ ...karte, padding: 0, overflow: "hidden" }} data-claudekurs-beispiel>
          <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${K.linie}` }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", background: K.hell, color: K.goldText, padding: "4px 9px", borderRadius: 999, marginBottom: 8 }}>{b.quelle}</span>
            <p style={{ fontSize: 14.5, color: K.tinte, lineHeight: 1.6, margin: 0 }}>{ki(b.aufgabe)}</p>
          </div>
          <Chat gespraech={b.gespraech.map((z) => ({ ...z, text: ki(z.text) }))} />
          <div style={{ padding: "12px 16px 14px", borderTop: `1px solid ${K.linie}`, background: K.hell }}>
            <p style={{ fontSize: 13.5, color: K.navy, lineHeight: 1.6, margin: 0 }}><b>Merke:</b> {ki(b.merke)}</p>
          </div>
        </div>
      </Abschnitt>

      <Abschnitt kicker="SO NICHT – SO BESSER">
        <div style={{ display: "grid", gap: 8 }}>
          {l.fehler.map((f, k) => (
            <div key={k} style={{ ...karte, padding: "12px 14px", display: "grid", gap: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ flex: "none", fontSize: 11, fontWeight: 800, color: K.weiss, background: K.rot, padding: "3px 8px", borderRadius: 6, marginTop: 1 }}>✗</span>
                <span style={{ fontSize: 14, color: K.tinte, lineHeight: 1.55, textDecoration: "line-through", textDecorationColor: K.rot, textDecorationThickness: "1.5px" }}>{ki(f.so)}</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ flex: "none", fontSize: 11, fontWeight: 800, color: K.weiss, background: K.gruen, padding: "3px 8px", borderRadius: 6, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 14, color: K.tinte, lineHeight: 1.55, fontWeight: 600 }}>{ki(f.besser)}</span>
              </div>
            </div>
          ))}
        </div>
      </Abschnitt>

      <Abschnitt kicker="BIS ZUR NÄCHSTEN LEKTION" titel="Dein Auftrag">
        <div style={{ ...karte, padding: "4px 6px" }}>
          {l.auftrag.map((a, n) => {
            const an = !!auftrag[n];
            return (
              <label key={a} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 10px", borderBottom: n < l.auftrag.length - 1 ? `1px solid ${K.linie}` : "none", cursor: "pointer" }}>
                <input type="checkbox" checked={an} className="clk-check"
                  onChange={() => aendern((s) => { const liste = [...((s.auftrag && s.auftrag[l.id]) || [])]; liste[n] = !an; return { ...s, auftrag: { ...s.auftrag, [l.id]: liste } }; })} />
                <Haken an={an} />
                <span style={{ fontSize: 14.5, color: an ? K.grau : K.tinte, textDecoration: an ? "line-through" : "none", lineHeight: 1.5 }}>{ki(a)}</span>
              </label>
            );
          })}
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {fertig
            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: K.goldText }}><Haken an /> Lektion abgehakt</span>
            : <Knopf art="rand" data-claudekurs-abhaken onClick={() => aendern((s) => ({ ...s, fertig: { ...s.fertig, [l.id]: true } }))}>Lektion abhaken</Knopf>}
        </div>
      </Abschnitt>

      <Abschnitt kicker="JETZT AUSPROBIEREN" titel={`Mit ${k.ki} oder Mathilda`}>
        <div style={{ background: NACHT, color: K.weiss, borderRadius: 18, padding: 18 }}>
          <p style={{ fontSize: 14, color: "#C9D6EE", lineHeight: 1.6, margin: "0 0 10px" }}>Ein Einstieg zum Abschreiben – Mathilda kennt die Lektion und hält sich an die Regeln:</p>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "0 0 14px", padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.07)", borderLeft: `3px solid ${K.gold}` }}>{ki(l.mathilda)}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Knopf onClick={() => setChat(true)} data-claudekurs-mathilda>Mathilda fragen</Knopf>
            <Kopieren text={ki(l.mathilda)} art="glas" label="Einstieg kopieren" />
            <a href={`https://${k.adresse}`} target="_blank" rel="noopener noreferrer" data-claudekurs-extern
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44, padding: "0 18px", borderRadius: 999, fontWeight: 800, fontSize: 14,
                background: "rgba(255,255,255,0.1)", color: K.weiss, border: "1px solid rgba(255,255,255,0.25)", textDecoration: "none" }}>
              {k.adresse} öffnen ↗
            </a>
          </div>
        </div>
      </Abschnitt>

      <div style={{ margin: "32px 0 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
        {vorige && (
          <button type="button" onClick={() => oeffnen(vorige.id)}
            style={{ flex: "1 1 200px", padding: "14px 16px", borderRadius: 14, border: `1px solid ${K.linie}`, background: K.weiss, color: K.navy, fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
            <span style={{ display: "block", fontSize: 11.5, color: K.grau, fontWeight: 600 }}>← Vorherige Lektion</span>{vorige.titel}
          </button>
        )}
        {naechste ? (
          <button type="button" onClick={() => oeffnen(naechste.id)} data-claudekurs-naechste
            style={{ flex: "1 1 200px", padding: "14px 16px", borderRadius: 14, border: "none", background: NACHT, color: K.weiss, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "right" }}>
            <span style={{ display: "block", fontSize: 11.5, color: K.gold, fontWeight: 600 }}>Nächste Lektion →</span>{naechste.titel}
          </button>
        ) : (
          <button type="button" onClick={zurUebersicht}
            style={{ flex: "1 1 200px", padding: "14px 16px", borderRadius: 14, border: "none", background: GOLD, color: K.navy, fontFamily: "inherit", fontWeight: 800, fontSize: 14, cursor: "pointer", textAlign: "right" }}>
            <span style={{ display: "block", fontSize: 11.5, fontWeight: 600 }}>Geschafft</span>Zu den zehn Regeln →
          </button>
        )}
      </div>

      {chat && <MathildaChatModal aufgabe={aufgabe} schliessen={() => setChat(false)} />}
    </div>
  );
}

/* ---------- Seite ---------- */
export function ClaudeKursSeite({ gehe, kurs = "claude" }) {
  const k = kursDaten(kurs);
  const [stand, setStand] = useState(() => standLesen(k));
  const [lektionId, setLektionId] = useState(null);
  useEffect(() => { setStand(standLesen(k)); setLektionId(null); }, [k.id]);
  const l = LEKTIONEN.find((x) => x.id === lektionId);
  const oeffnen = (id) => { setLektionId(id); nachOben(); };
  const zurUebersicht = () => { setLektionId(null); nachOben(); };
  useEffect(() => { try { window.__ckStand = () => ({ kurs: k.id, ...stand }); } catch (e) { /* egal */ } }, [stand, k.id]);
  return (
    <>
      <style>{CSS}</style>
      <Kopf k={k} gehe={gehe}
        untertitel={l ? `Lektion ${l.nr} · Film ansehen, Prompts kopieren, ausprobieren.` : `Nicht „löse mir“, sondern „erklär mir“: In zehn Lektionen lernst du, wie ${k.ki} dich Mathe verstehen lässt – statt sie für dich zu rechnen.`} />
      {l
        ? <Modul key={`${k.id}-${l.id}`} k={k} l={l} stand={stand} setStand={setStand} oeffnen={oeffnen} zurUebersicht={zurUebersicht} gehe={gehe} />
        : <Uebersicht k={k} stand={stand} oeffnen={oeffnen} gehe={gehe} />}
    </>
  );
}

const CSS = `
  .clk-check{position:absolute;opacity:0;width:1px;height:1px}
  label:has(.clk-check:focus-visible){outline:2px solid ${K.gold};border-radius:10px}
`;
