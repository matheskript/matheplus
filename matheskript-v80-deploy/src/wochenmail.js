/* ======================================================================
   Eltern-Wochenmail – Inhalt (reine Funktionen, ohne Netz; getestet in
   tests/wochenmail.test.mjs). Versand: api/cron/wochenmail.js.
   Eingabe je Kind: schueler_zusammenfassung() aus supabase/rollen.sql
   mit tage: { "YYYY-MM-DD": { s: Sekunden, a: Aufgaben, r: richtig } }.
   Bewusst ohne Noten und ohne Einzelfehler – nur Gewohnheit und Richtung.
   ====================================================================== */

const tagKey = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

/* Die App schreibt Tageswerte nach deutschem Kalendertag – „heute“ also in Europe/Berlin (als UTC-Mitternacht) */
export function berlinHeute(jetzt = new Date()) {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(jetzt).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/* Summen für die 7 Tage bis einschließlich `heute` und die 7 Tage davor */
export function wochenWerte(tage, heute = berlinHeute()) {
  const summe = (von, bis) => {
    const w = { minuten: 0, aufgaben: 0, richtig: 0, tage: 0 };
    for (let i = von; i <= bis; i++) {
      const d = new Date(Date.UTC(heute.getUTCFullYear(), heute.getUTCMonth(), heute.getUTCDate() - i));
      const t = (tage || {})[tagKey(d)];
      if (!t) continue;
      const s = Number(t.s) || 0, a = Number(t.a) || 0, r = Number(t.r) || 0;
      w.minuten += s / 60; w.aufgaben += a; w.richtig += Math.min(r, a);
      if (s >= 60 || a > 0) w.tage += 1;
    }
    w.minuten = Math.round(w.minuten);
    w.quote = w.aufgaben >= 5 ? Math.round((w.richtig / w.aufgaben) * 100) : null;
    return w;
  };
  return { jetzt: summe(0, 6), vorher: summe(7, 13) };
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[z]));
const vorname = (n) => String(n || "Ihr Kind").trim().split(/\s+/)[0];

/* Ein Satz zur Richtung – freundlich, ohne Druck */
export function einordnung(w) {
  const { jetzt: j, vorher: v } = w;
  if (j.tage === 0) return "Diese Woche war ruhig. Ein kurzer Einstieg von zehn Minuten reicht, um wieder reinzukommen.";
  if (j.tage >= 4) return "Eine richtig gute Woche: an vier oder mehr Tagen geübt. Regelmäßigkeit schlägt Dauer.";
  if (j.minuten > v.minuten + 10) return "Mehr Lernzeit als in der Woche davor – das zahlt sich aus.";
  if (v.minuten > 0 && j.minuten < v.minuten - 10) return "Etwas weniger als in der Vorwoche. Kein Grund zur Sorge – ein fester Termin pro Woche hilft oft.";
  return "Stetig dran geblieben. Kleine, regelmäßige Einheiten sind der beste Weg.";
}

export function betreff(kinder, heute = berlinHeute()) {
  if (!kinder.length) return "Ihr Wochenbericht von Mythos Mathe";
  if (kinder.length === 1) {
    const w = wochenWerte(kinder[0].tage, heute);
    return `${vorname(kinder[0].name)}: ${w.jetzt.tage} von 7 Tagen geübt – Ihr Wochenbericht`;
  }
  return `Wochenbericht für ${kinder.map((k) => vorname(k.name)).join(" und ")}`;
}

const pfeil = (a, b) => (a > b ? "▲" : a < b ? "▼" : "–");

function kindBlock(k, heute) {
  const w = wochenWerte(k.tage, heute);
  const zelle = (zahl, text, vergleich) => `<td style="padding:10px 6px;text-align:center;width:33%">
      <div style="font-size:24px;font-weight:700;color:#0B1E4A">${esc(zahl)}</div>
      <div style="font-size:12px;color:#5B6478">${esc(text)}</div>
      ${vergleich ? `<div style="font-size:11px;color:#8A93A5;margin-top:2px">${esc(vergleich)}</div>` : ""}</td>`;
  const e = k.entdecken || {};
  return `<tr><td style="padding:18px 20px;border-top:1px solid #E6EAF2">
    <div style="font-size:17px;font-weight:700;color:#0B1E4A;margin-bottom:6px">${esc(vorname(k.name))}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
      ${zelle(`${w.jetzt.tage}/7`, "Tage geübt", `Vorwoche ${w.vorher.tage} ${pfeil(w.jetzt.tage, w.vorher.tage)}`)}
      ${zelle(`${w.jetzt.minuten} min`, "Lernzeit", `Vorwoche ${w.vorher.minuten} min ${pfeil(w.jetzt.minuten, w.vorher.minuten)}`)}
      ${zelle(w.jetzt.aufgaben, "Aufgaben", w.jetzt.quote !== null ? `${w.jetzt.quote} % richtig` : "")}
    </tr></table>
    <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#2E3A4E">${esc(einordnung(w))}</p>
    ${e.potenz_fertig ? `<p style="margin:6px 0 0;font-size:13px;color:#5B6478">In „Mathe entdecken“ hat ${esc(vorname(k.name))} die Potenzregel selbst hergeleitet.</p>` : ""}
  </td></tr>`;
}

/* Fertige Mail: { betreff, html, text } */
export function wochenmail({ eltern, kinder, abmeldeUrl, appUrl = "https://mythosmathe.de", heute = berlinHeute() }) {
  const b = betreff(kinder, heute);
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(b)}</title></head>
<body style="margin:0;background:#F4F6FA;font-family:Montserrat,Arial,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F4F6FA"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
  <tr><td style="background:#0B1E4A;padding:18px 20px;font-family:Montserrat,Arial,sans-serif;font-size:20px;font-weight:900;letter-spacing:-.02em;color:#ffffff">MYTHOS<span style="color:#EDBB00">MATHE</span>.DE</td></tr>
  <tr><td style="padding:22px 20px 6px">
    <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;color:#8A6A00;text-transform:uppercase">Ihr Wochenbericht</p>
    <p style="margin:0;font-size:15px;line-height:1.65;color:#2E3A4E">Hallo ${esc(vorname(eltern.name))}, so lief die Mathe-Woche – ohne Noten, nur Gewohnheit und Richtung.</p>
  </td></tr>
  ${kinder.map((k) => kindBlock(k, heute)).join("")}
  <tr><td style="padding:18px 20px 22px;border-top:1px solid #E6EAF2">
    <a href="${esc(appUrl)}/?konto=1" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#EDBB00;color:#0B1E4A;font-weight:800;font-size:14px;text-decoration:none">Details in der App</a>
  </td></tr>
</table>
<p style="max-width:560px;margin:14px auto 0;font-size:11.5px;line-height:1.6;color:#8A93A5;text-align:center">
  Sie bekommen diese Mail, weil Ihr Konto mit dem Ihres Kindes verbunden ist.<br><a href="${esc(abmeldeUrl)}" style="color:#5B6478">Wochenmail abbestellen</a>
</p>
</td></tr></table></body></html>`;
  const text = [`${b}`, "", `Hallo ${vorname(eltern.name)},`, "",
    ...kinder.flatMap((k) => { const w = wochenWerte(k.tage, heute); return [`${vorname(k.name)}: ${w.jetzt.tage}/7 Tage, ${w.jetzt.minuten} min, ${w.jetzt.aufgaben} Aufgaben${w.jetzt.quote !== null ? ` (${w.jetzt.quote} % richtig)` : ""}`, einordnung(w), ""]; }),
    `Details: ${appUrl}/?konto=1`, `Abbestellen: ${abmeldeUrl}`].join("\n");
  return { betreff: b, html, text };
}
