/* ======================================================================
   „Was kann dieses Werkzeug?“ – aufklappbar unter jedem Werkzeug (21.10.2026).
   Bewusst <details> und kein Popup: der Text steht von Anfang an im HTML.
   Derselbe Text steht in der vorgerenderten Seite für Google und KI-Crawler
   (src/seo/index.js, scripts/werkzeugseiten.mjs). Nur Deutsch.
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";
import { wo } from "./werkzeuge.js";
import { FR } from "./funcRegistry.jsx";
import { seoText, entitaet, steckbrief, AUTOR } from "./seo/index.js";

const CSS = `
.wi{max-width:940px;margin:28px auto 8px;padding:0 16px;font-family:Montserrat,system-ui,sans-serif}
.wi details{border-radius:18px;background:${C.weiss};border:1px solid ${C.linie};box-shadow:0 6px 20px -16px rgba(14,30,74,0.35);overflow:hidden}
.wi summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;padding:14px 16px;font-weight:800;font-size:15px;color:${C.seeTief}}
.wi summary::-webkit-details-marker{display:none}
.wi summary .i{flex:0 0 auto;width:28px;height:28px;border-radius:999px;display:grid;place-items:center;font-size:14px;font-weight:900;color:${C.seeTief};background:linear-gradient(180deg,#FFE58A,${C.flaggold})}
.wi summary .t{flex:1 1 auto;min-width:0}
.wi summary .t small{display:block;margin-top:2px;font-size:12.5px;font-weight:500;color:${C.grau};line-height:1.4}
.wi-inhalt{padding:0 18px 18px;font-size:14.5px;line-height:1.65;color:${C.tinte}}
.wi-inhalt p{margin:0 0 10px}
.wi-inhalt h3{margin:18px 0 6px;font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#8A6A00}
.wi-inhalt dt{margin-top:10px;font-weight:700}
.wi-inhalt dd{margin:2px 0 0}
.wi-autor{margin-top:16px;padding:12px 14px;border-radius:14px;background:#F6F8FC;font-size:13px;line-height:1.55;color:${C.grau}}
.wi-autor b{color:${C.tinte}}
.wi-autor ul{margin:6px 0 0;padding-left:18px;list-style:disc}
.wi-autor li{margin-top:3px}
.wi-autor a{color:${C.see};font-weight:700}
.wi-steck{display:grid;grid-template-columns:max-content 1fr;gap:3px 12px;margin:0 0 12px;font-size:13.5px}
.wi-steck dt{font-weight:700;color:${C.seeTief}}
.wi-steck dd{margin:0;color:${C.tinte}}
`;

export function WerkzeugInfo({ ansicht }) {
  const ort = wo(ansicht);
  const t = ort && ort.werkzeug ? seoText(ort.werkzeug.id) : null;
  if (!t) return null;
  return (
    <section className="wi" aria-label="Über dieses Werkzeug" data-werkzeug-info={t.id} data-kein-i18n>
      <style>{CSS}</style>
      <details>
        <summary>
          <span className="i" aria-hidden="true">i</span>
          <span className="t">Was kann dieses Werkzeug?<small>{t.kurz}</small></span>
        </summary>
        <div className="wi-inhalt">
          {/* Entitätssatz und Steckbrief zuerst – derselbe Block wie auf der vorgerenderten Seite */}
          <p><strong>{entitaet(t)}</strong></p>
          <dl className="wi-steck">{steckbrief(t).map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>
          {t.text.map((a, i) => <p key={i}>{a}</p>)}
          {t.faq && t.faq.length > 0 && (
            <>
              <h3>Häufige Fragen</h3>
              <dl>{t.faq.map((q, i) => <React.Fragment key={i}><dt>{q.f}</dt><dd>{q.a}</dd></React.Fragment>)}</dl>
            </>
          )}
          <div className="wi-autor">
            <b>{AUTOR.name}</b>, {AUTOR.rolle}: {AUTOR.kurz}{" "}
            <a href="/vision" onClick={(e) => { if (FR.gehe) { e.preventDefault(); FR.gehe({ ansicht: "vision" }); } }}>Mehr über Mythos Mathe</a>
          </div>
        </div>
      </details>
    </section>
  );
}
