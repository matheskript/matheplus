/* ======================================================================
   BLOG – Bastis privater Mathe-Blog (Adresse /blog, Beiträge /blog/<slug>).
   Daten: src/blogDaten.js. Eigener Chunk (lazy in func10.jsx).

   Bewusst schlicht: Liste = Titelbild, Datum, Titel, eine Zeile Text
   (ab 700 px: neuester Beitrag groß, die übrigen als Zeilen mit Bild rechts).
   Beitrag = Datum, Titel, Titelbild, Absätze, am Ende der nächste Beitrag.
   Keine Kommentare, keine Zähler, keine Kästen – weißes Blatt, viel Luft.
   Die Titelbilder sind gezeichnete Motive (SVG) in der Kursoptik (Nacht-
   blau, Goldfolie); ein echtes Foto bekommt ein Beitrag, wenn er statt
   motiv ein bild (Pfad unter public/) trägt.
   ====================================================================== */
import React, { useEffect } from "react";
import { C } from "./base1.jsx";
import { BLOG, beitragVon, naechsterBeitrag, datumLang, lesezeit } from "./blogDaten.js";
import { springe } from "./sprung.js";

const NACHT = "#050B1F";
const GOLD = C.flaggold;
const GOLD_HELL = "#FFE58A";
const DESKTOP = "(min-width: 840px)";

const CSS = `
.bl { max-width: 620px; margin: 0 auto; padding: 36px 24px 90px; color: ${C.tinte}; font-family: Montserrat, system-ui, sans-serif; }
@media ${DESKTOP} { .bl { width: 735px; max-width: 735px; margin-left: calc(50% - 355px); margin-right: 0; padding-left: 0; padding-right: 0; } }
.bl *, .bl *::before, .bl *::after { box-sizing: border-box; }
.bl button { font-family: inherit; }
.bl-kicker { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${C.gruen}; }
.bl h1 { margin: 10px 0 0; font-size: clamp(30px, 7vw, 44px); font-weight: 900; letter-spacing: -0.035em; line-height: 1.02; color: ${C.seeTief}; }
.bl-unter { margin: 14px 0 0; font-size: 16px; font-weight: 300; line-height: 1.6; color: ${C.grau}; max-width: 46ch; }
.bl-liste { list-style: none; margin: 46px 0 0; padding: 0; display: grid; gap: 54px; }
@media ${DESKTOP} { .bl-liste { gap: 64px; } }
.bl-eintrag { display: block; }
/* Ab 700 px: der neueste Beitrag groß, die übrigen als ruhige Zeilen – Text links, Bild rechts */
@media (min-width: 700px) {
  .bl-eintrag + .bl-eintrag { display: grid; grid-template-columns: minmax(0, 1fr) 248px; grid-template-rows: auto auto auto 1fr; column-gap: 40px; align-items: start; }
  .bl-eintrag + .bl-eintrag > * { grid-column: 1; }
  .bl-eintrag + .bl-eintrag > .bl-bild { grid-column: 2; grid-row: 1 / 5; aspect-ratio: 16 / 10; border-radius: 14px; }
  .bl-eintrag + .bl-eintrag > .bl-meta { margin-top: 2px; }
  .bl-eintrag + .bl-eintrag h2 { font-size: 23px; }
  .bl-eintrag + .bl-eintrag .bl-kurz { font-size: 15.5px; }
  .bl-eintrag:first-child h2 { font-size: clamp(26px, 3.4vw, 32px); }
}
.bl-bild { display: block; width: 100%; aspect-ratio: 16 / 9; border-radius: 18px; overflow: hidden; border: none; padding: 0; margin: 0; cursor: pointer; background: ${NACHT};
  box-shadow: 0 18px 40px -24px rgba(5,11,31,.55); transition: transform .25s cubic-bezier(.2,.7,.3,1), box-shadow .25s ease; }
.bl-bild svg { display: block; width: 100%; height: 100%; }
.bl-bild img { display: block; width: 100%; height: 100%; object-fit: cover; }
.bl-eintrag:hover .bl-bild { transform: translateY(-2px); box-shadow: 0 26px 50px -24px rgba(5,11,31,.6); }
.bl-meta { margin: 18px 0 0; font-size: 12.5px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: ${C.hellgrau}; }
.bl-meta b { font-weight: 600; color: ${C.grau}; }
.bl-eintrag h2 { margin: 8px 0 0; font-size: clamp(22px, 5.4vw, 28px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.12; }
.bl-eintrag h2 button { background: none; border: none; padding: 0; margin: 0; cursor: pointer; text-align: left; color: ${C.seeTief}; font: inherit; letter-spacing: inherit; line-height: inherit; }
.bl-eintrag h2 button:hover { color: ${C.see}; }
.bl-kurz { margin: 10px 0 0; font-size: 16px; font-weight: 300; line-height: 1.6; color: ${C.grau}; max-width: 58ch; }
.bl-lesen { display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; background: none; border: none; padding: 0; cursor: pointer; font-size: 14px; font-weight: 700; color: ${C.gruenDunkel}; }
.bl-lesen span { transition: transform .2s ease; }
.bl-lesen:hover span { transform: translateX(3px); }
.bl button:focus-visible { outline: 3px solid ${GOLD}; outline-offset: 3px; border-radius: 6px; }

/* Beitrag */
.bl-zurueck { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; padding: 0; cursor: pointer; font-size: 13.5px; font-weight: 700; color: ${C.grau}; }
.bl-zurueck:hover { color: ${C.seeTief}; }
.bl-beitrag h1 { font-size: clamp(28px, 6.8vw, 40px); margin-top: 8px; }
.bl-beitrag .bl-bild { margin-top: 28px; cursor: default; }
.bl-beitrag .bl-bild:hover { transform: none; }
.bl-text { margin-top: 34px; }
.bl-text p { margin: 0 0 22px; font-size: 17px; font-weight: 400; line-height: 1.72; color: ${C.tinte}; max-width: 62ch; }
.bl-text p:first-child { font-size: 18px; font-weight: 500; }
.bl-ende { margin-top: 44px; padding-top: 28px; border-top: 1px solid ${C.linie}; }
.bl-ende .bl-kicker { color: ${C.hellgrau}; }
.bl-ende h2 { margin: 8px 0 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
.bl-ende h2 button { background: none; border: none; padding: 0; cursor: pointer; text-align: left; color: ${C.seeTief}; font: inherit; letter-spacing: inherit; }
.bl-ende h2 button:hover { color: ${C.see}; }
.bl-ende .bl-zurueck { margin-top: 22px; }
`;

/* ---------- Titelbilder: gezeichnete Motive in der Kursoptik ---------- */
const Grund = ({ id, children }) => (
  <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <defs>
      <linearGradient id={`blg-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#0A5AB0" /><stop offset=".45" stopColor={C.see} /><stop offset="1" stopColor={C.seeTief} />
      </linearGradient>
      <linearGradient id={`blgold-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={GOLD_HELL} /><stop offset=".6" stopColor={GOLD} /><stop offset="1" stopColor="#C9931A" />
      </linearGradient>
      <radialGradient id={`bll-${id}`} cx="85%" cy="0%" r="70%">
        <stop offset="0" stopColor="rgba(255,229,138,0.45)" /><stop offset="1" stopColor="rgba(255,229,138,0)" />
      </radialGradient>
      <pattern id={`blr-${id}`} width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M10 0H0V10" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth=".6" />
      </pattern>
    </defs>
    <rect width="160" height="90" fill={`url(#blg-${id})`} />
    <rect width="160" height="90" fill={`url(#blr-${id})`} />
    <rect width="160" height="90" fill={`url(#bll-${id})`} />
    {children}
  </svg>
);

const MOTIVE = {
  /* Karopapier mit einer sauberen Rechnung: Gleichheitszeichen untereinander */
  raster: (
    <Grund id="raster">
      {[28, 42, 56].map((y, i) => (
        <g key={y} stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity={.9 - i * .12}>
          <path d={`M${30 + i * 6} ${y}h${22 - i * 4}`} /><path d={`M${64} ${y - 1.6}h8 M64 ${y + 1.6}h8`} stroke={GOLD} /><path d={`M${80} ${y}h${30 - i * 7}`} />
        </g>
      ))}
      <rect x="78" y="62" width="18" height="12" rx="2" fill="none" stroke={GOLD} strokeWidth="1.6" />
      <path d="M81 68h12" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
    </Grund>
  ),
  /* Parabel mit Tangente im Punkt – exakt: y = 14 + (x−80)²·66/4096 (quadratische Bézierkurve, x läuft linear),
     Berührpunkt (48 | 30,5), Steigung −1,03125 → Tangente von (22 | 57,31) bis (74 | 3,69) */
  tangente: (
    <Grund id="tangente">
      <path d="M14 82h132" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      <path d="M16 80 Q 80 -52 144 80" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".9" />
      <path d="M22 57.31 L 74 3.69" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
      <circle cx="48" cy="30.5" r="3.6" fill={`url(#blgold-tangente)`} />
    </Grund>
  ),
  /* Rechtwinkliges Dreieck mit den drei Quadraten */
  pythagoras: (
    <Grund id="pythagoras">
      <g transform="translate(62 32)">
        <path d="M0 24 L0 0 L18 24 Z" fill="rgba(255,255,255,0.18)" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
        <rect x="-24" y="0" width="24" height="24" fill="none" stroke={GOLD} strokeWidth="1.6" />
        <rect x="0" y="24" width="18" height="18" fill="none" stroke={GOLD} strokeWidth="1.6" />
        {/* Quadrat über der Hypotenuse (0|0)–(18|24), Länge 30, nach außen um die Normale (24|−18) versetzt */}
        <path d="M0 0 L18 24 L42 6 L24 -18 Z" fill="none" stroke={`url(#blgold-pythagoras)`} strokeWidth="2" strokeLinejoin="round" />
        <path d="M0 24 h4 v-4 h-4 z" fill="#fff" opacity=".9" />
      </g>
    </Grund>
  ),
  /* Würfel (Fünf) und ein kleiner Baum */
  wuerfel: (
    <Grund id="wuerfel">
      <g transform="translate(34 24)">
        <rect width="40" height="40" rx="7" fill="#fff" opacity=".95" />
        {[[10, 10], [30, 10], [20, 20], [10, 30], [30, 30]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.4" fill={NACHT} />)}
      </g>
      <g stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M96 44 L120 26 M96 44 L120 44 M96 44 L120 62" />
      </g>
      <g fill={`url(#blgold-wuerfel)`}><circle cx="96" cy="44" r="3" /><circle cx="121" cy="26" r="2.4" /><circle cx="121" cy="44" r="2.4" /><circle cx="121" cy="62" r="2.4" /></g>
      <text x="128" y="29" fill="#fff" fontSize="7" fontFamily="Montserrat, system-ui, sans-serif" fontWeight="700">1/6</text>
    </Grund>
  ),
  /* Drei Pfeile vom selben Punkt – und derselbe Pfeil, verschoben */
  pfeile: (
    <Grund id="pfeile">
      <g stroke="rgba(255,255,255,0.35)" strokeWidth="1"><path d="M20 72h124M20 12v60" /></g>
      <g strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M20 72 L70 30" stroke={GOLD} /><path d="M70 30 l-9 1.5 M70 30 l-2 9" stroke={GOLD} />
        <path d="M20 72 L92 60" stroke="#fff" /><path d="M92 60 l-8 -4 M92 60 l-7 5.5" stroke="#fff" />
        <path d="M96 66 L146 24" stroke={GOLD} opacity=".55" /><path d="M146 24 l-9 1.5 M146 24 l-2 9" stroke={GOLD} opacity=".55" />
      </g>
    </Grund>
  ),
  /* Abend am See: Sonne, Wellen als Sinuskurven */
  see: (
    <Grund id="see">
      <circle cx="116" cy="30" r="14" fill={`url(#blgold-see)`} />
      {[52, 62, 72].map((y, i) => (
        <path key={y} d={`M-5 ${y} C 15 ${y - 6}, 25 ${y + 6}, 45 ${y} S 75 ${y - 6}, 95 ${y} S 145 ${y + 6}, 170 ${y}`} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity={.85 - i * .25} />
      ))}
    </Grund>
  ),
};

export function BlogMotiv({ beitrag }) {
  if (beitrag.bild) return <img src={beitrag.bild} alt="" loading="lazy" />;
  return MOTIVE[beitrag.motiv] || MOTIVE.raster;
}

/* ---------- Seite ---------- */
export function BlogSeite({ gehe, seite, setSeite }) {
  const beitrag = seite ? beitragVon(seite) : null;
  const oeffnen = (slug) => { setSeite(slug); springe("seitenwechsel", () => window.scrollTo(0, 0)); };
  const zurueck = () => { setSeite(null); springe("seitenwechsel", () => window.scrollTo(0, 0)); };
  useEffect(() => {
    const alt = document.title;
    document.title = beitrag ? `${beitrag.titel} · Mythos Mathe Blog` : "Blog · Mythos Mathe";
    return () => { document.title = alt; };
  }, [beitrag]);

  if (seite && !beitrag) {
    return (
      <div className="bl"><style>{CSS}</style>
        <p className="bl-kicker">Blog</p>
        <h1>Diesen Beitrag gibt es nicht.</h1>
        <p className="bl-unter">Vielleicht wurde er umbenannt. Alle Beiträge findest du in der Übersicht.</p>
        <button type="button" className="bl-zurueck" style={{ marginTop: 22 }} onClick={zurueck}><span aria-hidden="true">←</span> Alle Beiträge</button>
      </div>
    );
  }

  if (beitrag) {
    const weiter = naechsterBeitrag(beitrag.slug);
    return (
      <article className="bl bl-beitrag" data-blog-beitrag={beitrag.slug}><style>{CSS}</style>
        <button type="button" className="bl-zurueck" onClick={zurueck}><span aria-hidden="true">←</span> Alle Beiträge</button>
        <p className="bl-meta" style={{ marginTop: 26 }}><time dateTime={beitrag.datum}>{datumLang(beitrag.datum)}</time> · {lesezeit(beitrag)} Min.</p>
        <h1>{beitrag.titel}</h1>
        <div className="bl-bild"><BlogMotiv beitrag={beitrag} /></div>
        <div className="bl-text">
          {beitrag.absaetze.map((a, i) => <p key={i}>{a}</p>)}
        </div>
        <div className="bl-ende">
          {weiter && (<>
            <p className="bl-kicker">Nächster Beitrag</p>
            <h2><button type="button" onClick={() => oeffnen(weiter.slug)}>{weiter.titel}</button></h2>
          </>)}
          <button type="button" className="bl-zurueck" onClick={zurueck}><span aria-hidden="true">←</span> Alle Beiträge</button>
        </div>
      </article>
    );
  }

  return (
    <div className="bl" data-blog-liste><style>{CSS}</style>
      <p className="bl-kicker">Blog</p>
      <h1>Mathe-Blog</h1>
      <p className="bl-unter">Notizen von Basti – über Mathe, übers Lernen und über das, was zwischen Aufgabe und Lösung passiert.</p>
      <ul className="bl-liste">
        {BLOG.map((b) => (
          <li key={b.slug} className="bl-eintrag">
            <button type="button" className="bl-bild" onClick={() => oeffnen(b.slug)} aria-label={b.titel} tabIndex={-1}><BlogMotiv beitrag={b} /></button>
            <p className="bl-meta"><time dateTime={b.datum}>{datumLang(b.datum)}</time> · {lesezeit(b)} Min.</p>
            <h2><button type="button" onClick={() => oeffnen(b.slug)}>{b.titel}</button></h2>
            <p className="bl-kurz">{b.kurz}</p>
            <button type="button" className="bl-lesen" onClick={() => oeffnen(b.slug)}>Weiterlesen <span aria-hidden="true">→</span></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
