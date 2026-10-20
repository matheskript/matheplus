/* ======================================================================
   Service Worker von mythosmathe.de
   · Offline: App-Hülle (index.html) und alle einmal geladenen /assets/*
     (Dateinamen mit Hash → unveränderlich) aus dem Cache. Seiten:
     zuerst Netz, ohne Netz die zuletzt gespeicherte Fassung.
   · Push: zeigt Benachrichtigungen (api/cron/push.js) und öffnet beim
     Antippen die mitgeschickte Adresse.
   API-Aufrufe (/api/*) und fremde Adressen gehen immer direkt ans Netz.
   ====================================================================== */
const VERSION = "mm-v1";
const HUELLE = ["/", "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(HUELLE).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin || u.pathname.startsWith("/api/") || u.pathname.startsWith("/__zugang")) return;
  // Hash-Dateien: Cache zuerst
  if (u.pathname.startsWith("/assets/") || u.pathname.startsWith("/icons/")) {
    e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => {
      if (res.ok) { const k = res.clone(); caches.open(VERSION).then((c) => c.put(r, k)); }
      return res;
    })));
    return;
  }
  // Seiten: Netz zuerst, sonst Cache (App-Hülle für alle SPA-Pfade)
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then((res) => {
      if (res.ok && res.status === 200 && (res.headers.get("content-type") || "").includes("text/html") && !u.pathname.startsWith("/formeln")) {
        const k = res.clone(); caches.open(VERSION).then((c) => c.put("/", k));
      }
      return res;
    }).catch(() => caches.match(u.pathname.startsWith("/formeln") ? r : "/").then((hit) => hit || caches.match("/"))));
  }
});

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { text: e.data ? e.data.text() : "" }; }
  const titel = d.titel || "Mythos Mathe";
  e.waitUntil(self.registration.showNotification(titel, {
    body: d.text || "Zeit für zehn Minuten Mathe.",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-96.png",
    tag: d.tag || "mm-erinnerung",
    renotify: false,
    data: { url: d.url || "/?ansicht=meintraining" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const ziel = new URL((e.notification.data && e.notification.data.url) || "/", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((fenster) => {
    for (const f of fenster) if (new URL(f.url).origin === self.location.origin) { f.navigate(ziel); return f.focus(); }
    return self.clients.openWindow(ziel);
  }));
});
