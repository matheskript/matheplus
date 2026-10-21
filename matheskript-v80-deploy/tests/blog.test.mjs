/* Blog (src/blogDaten.js, src/funcBlog.jsx): sechs Beispielbeiträge mit eindeutigen Slugs, Pfade /blog und /blog/<slug>,
   die Seite hängt in func10.jsx und hat bewusst keinen Teilen-Knopf. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BLOG, beitragVon, istBlogBeitrag, naechsterBeitrag, datumLang, lesezeit } from "../src/blogDaten.js";
import { pfadAufloesen, pfadFuer } from "../src/pfade.js";
import { KEIN_TEILEN } from "../src/teilen.js";

const quelle = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8");

test("Sechs Beiträge, jeder vollständig, Slugs eindeutig und pfadtauglich, neueste zuerst", () => {
  assert.equal(BLOG.length, 6);
  const slugs = new Set();
  for (const b of BLOG) {
    assert.match(b.slug, /^[a-z0-9-]+$/, b.slug);
    assert.ok(!slugs.has(b.slug), `Slug doppelt: ${b.slug}`); slugs.add(b.slug);
    assert.ok(b.titel.length > 8 && b.kurz.length > 20, b.slug);
    assert.match(b.datum, /^\d{4}-\d{2}-\d{2}$/, b.slug);
    assert.ok(Array.isArray(b.absaetze) && b.absaetze.length >= 3, `${b.slug}: zu wenige Absätze`);
    assert.ok(["raster", "tangente", "pythagoras", "wuerfel", "pfeile", "see"].includes(b.motiv) || b.bild, `${b.slug}: Motiv fehlt`);
    assert.ok(lesezeit(b) >= 1);
  }
  for (let i = 1; i < BLOG.length; i++) assert.ok(BLOG[i - 1].datum >= BLOG[i].datum, "Reihenfolge: neueste zuerst");
});

test("Hilfen: beitragVon, istBlogBeitrag, naechsterBeitrag, datumLang", () => {
  assert.equal(beitragVon(BLOG[0].slug), BLOG[0]);
  assert.equal(beitragVon("gibt-es-nicht"), null);
  assert.ok(istBlogBeitrag(BLOG[2].slug));
  assert.ok(!istBlogBeitrag("") && !istBlogBeitrag(null));
  assert.equal(naechsterBeitrag(BLOG[0].slug), BLOG[1]);
  assert.equal(naechsterBeitrag(BLOG[BLOG.length - 1].slug), null);
  assert.equal(datumLang("2026-10-18"), "18. Oktober 2026");
  assert.equal(datumLang("2026-03-01"), "1. März 2026");
});

test("Pfade: /blog ist die Übersicht, /blog/<slug> der Beitrag, Unbekanntes bleibt unbekannt", () => {
  assert.deepEqual(pfadAufloesen("/blog"), { ansicht: "blog", kanonisch: true });
  assert.equal(pfadAufloesen("/mathe-blog").ansicht, "blog");
  assert.deepEqual(pfadAufloesen(`/blog/${BLOG[1].slug}`), { ansicht: "blog", seite: BLOG[1].slug, kanonisch: true });
  assert.equal(pfadAufloesen("/blog/so-einen-gibt-es-nicht"), null);
  assert.equal(pfadFuer({ ansicht: "blog" }), "/blog");
  assert.equal(pfadFuer({ ansicht: "blog", seite: BLOG[3].slug }), `/blog/${BLOG[3].slug}`);
  assert.equal(pfadFuer({ ansicht: "blog", seite: "falsch" }), "/blog");
});

test("Ende der Übersicht: Dokumente-Karten mit allen Knöpfen, erst nach dem Passwort geladen", () => {
  const b = quelle("funcBlog.jsx");
  assert.ok(b.includes("data-blog-dokumente") && b.includes("data-blog-dokumente-tor"));
  assert.match(b, /lazy\(\(\) => import\("\.\/funcDokumente\.jsx"\)/, "Karten müssen lazy hinter dem Passwort laden");
  assert.match(b, /\{frei \? \(\s*<Suspense fallback=\{null\}><DokumenteKarten eins \/>/);
  // der Abschnitt steht in der Übersicht nach „Alle Beiträge“, nicht im einzelnen Beitrag
  const liste = b.slice(b.indexOf("data-blog-liste"));
  assert.ok(liste.indexOf("bl-alle") < liste.indexOf("<BlogDokumente />"), "Dokumente stehen nicht unter „Alle Beiträge“");
  assert.ok(!b.slice(b.indexOf("data-blog-beitrag"), b.indexOf("data-blog-liste")).includes("BlogDokumente"));
  // dieselben Karten wie auf der Seite „Dokumente“ (keine zweite Liste)
  const d = quelle("funcDokumente.jsx");
  assert.ok(d.includes("export function DokumenteKarten") && /<DokumenteKarten \/>/.test(d));
});

test("Die Seite hängt in der App, ist öffentlich (kein EntwurfTor) und hat keinen Teilen-Knopf", () => {
  const q = quelle("func10.jsx");
  assert.ok(q.includes('ansicht === "blog" ? (') && q.includes("<BlogSeite gehe={gehe} seite={blogSeite} setSeite={setBlogSeite} />"));
  assert.ok(!/EntwurfTor[^\n]*BlogSeite/.test(q));
  assert.ok(KEIN_TEILEN.includes("blog"));
  const b = quelle("funcBlog.jsx");
  assert.ok(b.includes("data-blog-liste") && b.includes("data-blog-beitrag"));
  const jsx = b.slice(b.indexOf("export function BlogSeite"));
  assert.ok(!/[Kk]ommentar|Likes|Aufrufe|Teilen/.test(jsx), "Der Blog bleibt schlicht: keine Kommentare, Zähler oder Kästen");
});
