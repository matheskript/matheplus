/* Masterclass-Zugangslinks erzeugen – ohne Datenbankzugriff.
   node scripts/masterclass-links.mjs 40 "Mathe Abi Masterclass 2026/27" 2027-07-31 ./ausgabe

   Schreibt in den Ausgabeordner:
     masterclass-zugaenge.sql   – im Supabase-SQL-Editor ausführen (legt die Codes an; wiederholbar)
     masterclass-links.html     – Liste zum Verschicken (Kopieren- und WhatsApp-Knopf je Teilnehmer)
     masterclass-links.csv      – dieselbe Liste für Tabellen
   Die Codes gelten erst, wenn das SQL ausgeführt ist (masterclass.sql muss vorher laufen).
   Die Dateien enthalten Zugangscodes: NICHT ins Repo legen. */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tokenErzeugen, tokenAnzeige, zugangsLink } from "../src/masterclassToken.js";

const [anzahl = "30", gruppe = "Mathe Abi Masterclass", bis = "2027-07-31", ordner = "."] = process.argv.slice(2);
const n = Math.max(1, Math.min(500, Number(anzahl) || 30));
if (!/^\d{4}-\d{2}-\d{2}$/.test(bis)) { console.error("Datum bitte als JJJJ-MM-TT"); process.exit(1); }

const codes = new Set();
while (codes.size < n) codes.add(await tokenErzeugen());
const liste = [...codes].map((t, i) => ({ nr: i + 1, name: `Teilnehmer ${String(i + 1).padStart(2, "0")}`, token: t, link: zugangsLink(t) }));
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const esc = (s) => String(s).replace(/[&<>"']/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z]));
const bisText = new Date(`${bis}T12:00:00`).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });

mkdirSync(ordner, { recursive: true });

writeFileSync(join(ordner, "masterclass-zugaenge.sql"), `-- ${n} Zugangscodes für „${gruppe}“, gültig bis ${bis}. Nach supabase/masterclass.sql ausführen.
-- Vornamen nachtragen (für die Begrüßung): update public.masterclass_zugaenge set name = 'Lena' where notiz = 'Teilnehmer 01';
insert into public.masterclass_zugaenge (token, notiz, gruppe, laeuft_bis) values
${liste.map((e) => `  (${q(e.token)}, ${q(e.name)}, ${q(gruppe)}, ${q(bis)}::date + 1)`).join(",\n")}
on conflict (token) do nothing;
select nr, notiz, token from public.masterclass_zugaenge where gruppe = ${q(gruppe)} order by nr;
`);

writeFileSync(join(ordner, "masterclass-links.csv"), "nr;name;code;link\n" + liste.map((e) => `${e.nr};${e.name};${tokenAnzeige(e.token)};${e.link}`).join("\n") + "\n");

const nachricht = (e) => `Willkommen in der ${gruppe}! Hier ist dein persönlicher Zugang (nur für dich, bitte nicht weitergeben): ${e.link}`;
writeFileSync(join(ordner, "masterclass-links.html"), `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Masterclass-Zugänge</title>
<style>
  :root{--navy:#0B1E4A;--gold:#EDBB00;--linie:#E3E8F2;--grau:#5A6582;--sand:#F8FAFD}
  *{box-sizing:border-box} body{margin:0;font-family:Montserrat,system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--sand);color:#0F1A33}
  header{background:linear-gradient(165deg,#06102A,#0B1E4A 55%,#12306E);color:#fff;padding:32px 20px 28px}
  header div{max-width:860px;margin:0 auto} .k{font-size:11.5px;font-weight:800;letter-spacing:.16em;color:var(--gold);margin:0 0 6px}
  h1{margin:0;font-size:clamp(24px,6vw,34px);letter-spacing:-.02em} header p{color:#C9D6EE;margin:10px 0 0;line-height:1.6;font-size:14.5px}
  main{max-width:860px;margin:0 auto;padding:18px 16px 60px}
  .hinweis{background:#FFF8E1;border:1px solid #F1D98A;border-radius:14px;padding:12px 14px;font-size:13.5px;line-height:1.55;margin-bottom:16px}
  .zeile{display:grid;grid-template-columns:44px 1fr auto;gap:12px;align-items:center;background:#fff;border:1px solid var(--linie);border-radius:14px;padding:12px;margin-bottom:8px}
  .nr{width:36px;height:36px;border-radius:18px;background:var(--navy);color:var(--gold);font-weight:800;display:flex;align-items:center;justify-content:center;font-size:13px}
  .name{font-weight:700;font-size:15px} .code{font-family:ui-monospace,Menlo,monospace;font-size:13px;color:var(--grau);letter-spacing:.04em}
  .link{font-size:12px;color:var(--grau);word-break:break-all;margin-top:2px}
  .knoepfe{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
  button,a.k2{height:36px;padding:0 12px;border-radius:999px;border:1.5px solid var(--linie);background:#fff;color:var(--navy);font:inherit;font-weight:700;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;text-decoration:none}
  a.wa{background:#25D366;border-color:#25D366;color:#fff}
  button.ok{background:var(--gold);border-color:var(--gold)}
  @media (max-width:560px){.zeile{grid-template-columns:36px 1fr}.knoepfe{grid-column:1 / -1;justify-content:flex-start}}
</style></head><body>
<header><div><p class="k">MATHE ABI MASTERCLASS</p><h1>${esc(gruppe)}: ${n} Zugänge</h1>
<p>Gültig bis ${esc(bisText)}. Jeder Link gehört genau einem Teilnehmer – beim ersten Anmelden wird er mit dessen Konto verbunden.</p></div></header>
<main>
<p class="hinweis"><b>Vor dem Verschicken:</b> masterclass-zugaenge.sql im Supabase-SQL-Editor ausführen. Diese Datei enthält echte Zugänge – nicht weitergeben oder öffentlich ablegen.</p>
${liste.map((e) => `<div class="zeile"><span class="nr">${e.nr}</span><div><div class="name">${esc(e.name)}</div><div class="code">${tokenAnzeige(e.token)}</div><div class="link">${esc(e.link)}</div></div>
<div class="knoepfe"><button type="button" data-text="${esc(e.link)}">Link kopieren</button><button type="button" data-text="${esc(nachricht(e))}">Nachricht kopieren</button><a class="k2 wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(nachricht(e))}">WhatsApp</a></div></div>`).join("\n")}
</main>
<script>
document.addEventListener("click", async (e) => {
  const b = e.target.closest("button[data-text]"); if (!b) return;
  try { await navigator.clipboard.writeText(b.dataset.text); } catch (x) { const t = document.createElement("textarea"); t.value = b.dataset.text; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
  const alt = b.textContent; b.textContent = "Kopiert ✓"; b.classList.add("ok"); setTimeout(() => { b.textContent = alt; b.classList.remove("ok"); }, 1400);
});
</script></body></html>
`);
console.log(`${n} Codes in ${ordner}: masterclass-zugaenge.sql, masterclass-links.html, masterclass-links.csv`);
