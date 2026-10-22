/* Wert eines Eingabefelds so setzen, dass React sein onChange auslöst – alle Filter und Zähler der
   Werkzeuge laufen dann wie bei einer Tastatureingabe. Gemeinsam für Mathe-Tastatur und Spracheingabe. */
export function setzeFeldWert(el, wert) {
  const proto = typeof HTMLTextAreaElement !== "undefined" && el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, wert);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}
