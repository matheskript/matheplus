/* Reihenfolge der Antworten in Wahl-Schritten (ui3.jsx SchrittFolge) je Aufgabe drehen,
   damit die richtige Antwort nicht immer vorn steht. Rein, Node-testbar.
   wahlDrehen(schritte, seed): jeder Schritt mit typ "wahl" wird um (seed + Schrittnummer) gedreht. */
export const drehe = (l, n) => { const k = ((n % l.length) + l.length) % l.length; return [...l.slice(k), ...l.slice(0, k)]; };
export const wahlDrehen = (schritte, seed = 0) =>
  schritte.map((st, i) => (st.typ === "wahl" && Array.isArray(st.optionen) ? { ...st, optionen: drehe(st.optionen, seed + i) } : st));
