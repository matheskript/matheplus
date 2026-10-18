/* Blätterbares Buch: Einzelseite (Handy) oder Doppelseite (Desktop) */
(function () {
  const seiten = Array.from(document.querySelectorAll("#vorrat > .page"));
  const N = seiten.length;
  /* Ausschnitt für den Kurs: ?von=12&bis=13 zeigt nur diese Buchseiten, ohne Inhalt und PDF */
  const par = new URLSearchParams(location.search);
  const VON = Math.max(1, Math.min(N, parseInt(par.get("von"), 10) || 1));
  const BIS = Math.max(VON, Math.min(N, parseInt(par.get("bis"), 10) || N));
  const AUSSCHNITT = VON > 1 || BIS < N;
  if (AUSSCHNITT) document.body.classList.add("ausschnitt");
  const buehne = document.getElementById("buehne");
  const aufschlag = document.getElementById("aufschlag");
  const regler = document.getElementById("regler");
  regler.min = VON; regler.max = BIS;
  if (BIS - VON < 2) document.body.classList.add("ohnefuss");
  const seitenText = document.getElementById("seitenText");
  const knZ = document.getElementById("knZurueck"), knW = document.getElementById("knWeiter");
  const inhaltKnoepfe = Array.from(document.querySelectorAll("#inhalt button[data-seite]"));
  const PW = seiten[0].offsetWidth || 794, PH = seiten[0].offsetHeight || 1123;
  let seite = 1, doppel = false, letzteGruppe = null, lupe = 0;
  const LUPE = [1, 1.6, 2.2];
  const knLupe = document.getElementById("knLupe");

  /* Doppelseiten wie im gedruckten Buch: gerade links, ungerade rechts */
  function gruppen() {
    const g = [];
    for (let p = VON; p <= BIS; p++) {
      if (!doppel) { g.push([p]); continue; }
      if (p % 2 === 0 && p + 1 <= BIS) { g.push([p, p + 1]); p++; } else g.push([p]);
    }
    return g;
  }
  const gruppeVon = (s) => gruppen().findIndex((g) => g.includes(s));

  function ausmessen() {
    const W = buehne.clientWidth, H = buehne.clientHeight;
    const sD = Math.min((W - 48) / (2 * PW), (H - 40) / PH);
    doppel = lupe === 0 && W >= 900 && sD >= 0.42;
    if (doppel) return sD;
    const basis = W < 700 ? (W - 16) / PW : Math.min((W - 32) / PW, (H - 40) / PH);
    return basis * LUPE[lupe];
  }

  function zeigen(neu, richtung) {
    seite = Math.max(VON, Math.min(BIS, neu));
    const s = ausmessen();
    const gs = gruppen();
    const gi = gruppeVon(seite);
    const g = gs[gi];
    aufschlag.className = doppel ? "doppel" : "";
    for (const kind of Array.from(aufschlag.children)) {
      const p = kind.firstElementChild;
      if (p) document.getElementById("vorrat").appendChild(p);
    }
    aufschlag.innerHTML = "";
    g.forEach((nr, k) => {
      const blatt = document.createElement("div");
      blatt.className = "blatt" + (doppel ? (g.length === 2 ? (k === 0 ? " l" : " r") : (nr % 2 === 1 ? " r" : " l")) : "");
      blatt.style.width = PW * s + "px";
      blatt.style.height = PH * s + "px";
      const p = seiten[nr - 1];
      p.style.transform = `scale(${s})`;
      blatt.appendChild(p);
      aufschlag.appendChild(blatt);
    });
    if (doppel && g.length === 1) {
      const leer = document.createElement("div");
      leer.style.width = PW * s + "px";
      if (g[0] % 2 === 1) aufschlag.insertBefore(leer, aufschlag.firstChild); else aufschlag.appendChild(leer);
    }
    if (letzteGruppe !== null && letzteGruppe !== gi) {
      aufschlag.classList.remove("rein");
      void aufschlag.offsetWidth;
      aufschlag.classList.add("rein");
      if (richtung < 0) aufschlag.classList.add("rueck");
      buehne.scrollTop = 0;
    }
    letzteGruppe = gi;
    const sichtbar = g.join("–");
    const titel = (seiten[g[g.length - 1] - 1].querySelector(".kopf-ukap") || {}).textContent || "";
    seitenText.textContent = (AUSSCHNITT ? `Buchseite ${sichtbar} · ${gs.findIndex((x) => x === g) + 1}/${gs.length}` : `Seite ${sichtbar} von ${N}`) + (titel && !AUSSCHNITT ? ` · ${titel}` : "");
    regler.value = seite;
    knZ.disabled = gi === 0;
    knW.disabled = gi === gs.length - 1;
    let aktiv = null;
    for (const b of inhaltKnoepfe) if (+b.dataset.seite <= g[g.length - 1]) aktiv = b;
    inhaltKnoepfe.forEach((b) => b.classList.toggle("aktiv", b === aktiv));
    try { history.replaceState(null, "", "#" + seite); } catch (e) { /* egal */ }
    try { if (window.parent !== window) window.parent.postMessage({ typ: "mm-schulbuch-seite", buch: "ableitungen", seite, von: VON, bis: BIS, ende: gi === gs.length - 1 }, location.origin); } catch (e) { /* egal */ }
  }

  function blaettern(d) {
    const gs = gruppen();
    const gi = Math.max(0, Math.min(gs.length - 1, gruppeVon(seite) + d));
    zeigen(gs[gi][0], d);
  }

  knLupe.addEventListener("click", () => {
    lupe = (lupe + 1) % LUPE.length;
    knLupe.setAttribute("aria-label", lupe === LUPE.length - 1 ? "Verkleinern" : "Vergrößern");
    knLupe.classList.toggle("an", lupe > 0);
    letzteGruppe = null;
    zeigen(seite, 0);
  });
  knZ.addEventListener("click", () => blaettern(-1));
  knW.addEventListener("click", () => blaettern(1));
  regler.addEventListener("input", () => zeigen(+regler.value, 0));
  document.addEventListener("keydown", (e) => {
    if (e.target && e.target.tagName === "INPUT") return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); blaettern(1); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); blaettern(-1); }
    if (e.key === "Escape") document.body.classList.remove("offen");
  });

  /* Wischen (nur waagrecht, nicht beim Zoomen) */
  let x0 = null, y0 = null;
  buehne.addEventListener("touchstart", (e) => { if (e.touches.length === 1) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; } else x0 = null; }, { passive: true });
  buehne.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (lupe === 0 && Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) blaettern(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });

  /* Inhaltsverzeichnis */
  document.getElementById("knInhalt").addEventListener("click", () => document.body.classList.toggle("offen"));
  document.getElementById("schleier").addEventListener("click", () => document.body.classList.remove("offen"));
  inhaltKnoepfe.forEach((b) => b.addEventListener("click", () => { document.body.classList.remove("offen"); zeigen(+b.dataset.seite, 1); }));

  /* Sprünge in die App: im Rahmen der App ohne Neuladen */
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a.appsprung");
    if (!a || window.parent === window) return;
    e.preventDefault();
    let ziel = null; try { ziel = JSON.parse(a.dataset.ziel); } catch (err) { return; }
    window.parent.postMessage({ typ: "mm-gehe", ziel }, location.origin);
  });

  /* Befehle der App (Kapitel öffnen) */
  window.addEventListener("message", (e) => {
    if (e.origin !== location.origin || !e.data || e.data.typ !== "mm-schulbuch-zeige") return;
    zeigen(+e.data.seite || 1, 1);
  });

  let t = null;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => zeigen(seite, 0), 80); });
  const start = parseInt((location.hash || "").slice(1), 10);
  zeigen(Number.isFinite(start) ? start : VON, 0);
})();
