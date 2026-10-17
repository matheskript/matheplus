/* ======================================================================
   PWA im Browser: Installieren und Push-Erinnerungen
   Push braucht VITE_VAPID_PUBLIC_KEY (Vercel) und supabase/push.sql.
   ====================================================================== */
import { sb, DEMO } from "./konto.js";

export const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

/* „Zum Startbildschirm“: Chrome/Android liefert das Ereignis, iOS nicht */
let installEreignis = null;
const hoerer = new Set();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEreignis = e; hoerer.forEach((h) => h()); });
  window.addEventListener("appinstalled", () => { installEreignis = null; hoerer.forEach((h) => h()); });
}
export const installHoeren = (f) => { hoerer.add(f); return () => hoerer.delete(f); };
export const kannInstallieren = () => !!installEreignis;
export async function installieren() {
  if (!installEreignis) return false;
  installEreignis.prompt();
  const r = await installEreignis.userChoice.catch(() => null);
  installEreignis = null; hoerer.forEach((h) => h());
  return !!r && r.outcome === "accepted";
}
export const istInstalliert = () => { try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch { return false; } };
export const istIOS = () => { try { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); } catch { return false; } };

export const pushMoeglich = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

const b64 = (s) => {
  const p = "=".repeat((4 - (s.length % 4)) % 4);
  const roh = atob((s + p).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...roh].map((c) => c.charCodeAt(0)));
};

export async function pushStand() {
  if (!pushMoeglich() || !VAPID) return { moeglich: false };
  const reg = await navigator.serviceWorker.getRegistration();
  const abo = reg ? await reg.pushManager.getSubscription() : null;
  return { moeglich: true, an: !!abo, erlaubnis: Notification.permission };
}

export async function pushEinschalten() {
  if (!pushMoeglich() || !VAPID) throw new Error("Auf diesem Gerät nicht möglich.");
  const erlaubnis = await Notification.requestPermission();
  if (erlaubnis !== "granted") throw new Error("Benachrichtigungen sind für diese Seite blockiert. Das lässt sich in den Browser-Einstellungen ändern.");
  const reg = await navigator.serviceWorker.ready;
  const abo = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID) }));
  const j = abo.toJSON();
  if (!DEMO) {
    const { data, error } = await sb.rpc("push_abo_speichern", { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth });
    if (error || !data || data.status !== "ok") throw new Error("Speichern hat nicht geklappt.");
  }
  return true;
}

export async function pushAusschalten() {
  const reg = await navigator.serviceWorker.getRegistration();
  const abo = reg ? await reg.pushManager.getSubscription() : null;
  if (!abo) return true;
  if (!DEMO) { try { await sb.rpc("push_abo_loeschen", { p_endpoint: abo.endpoint }); } catch { /* trotzdem abmelden */ } }
  await abo.unsubscribe();
  return true;
}
