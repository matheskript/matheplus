/* FORMELSAMMLUNG · ERGÄNZUNGEN
   FS_ERG: pro Formel-Kennung weitere Beweise (her), Verknüpfungen (nutzt), Beispiele (bsp), Falle.
   FS_NEU: ganz neue Formeln (mit "bereich"). Aufbau der Einträge: siehe fsAnalysis.js.

   Mehrere Ergänzungsdateien dürfen dieselbe Kennung ergänzen. Sie werden zusammengeführt,
   nicht überschrieben: Listen (her, nutzt, bsp) werden aneinandergehängt, Suchwörter (syn)
   verbunden; bei bild, wz und falle gilt die erste Datei, die einen Wert setzt. */

import { ERG_1 } from "./fsErg1.js";
import { ERG_2 } from "./fsErg2.js";
import { ERG_3 } from "./fsErg3.js";
import { ERG_4 } from "./fsErg4.js";
import { ERG_5 } from "./fsErg5.js";
import { ERG_6 } from "./fsErg6.js";
import { ERG_7 } from "./fsErg7.js";
import { ERG_8 } from "./fsErg8.js";

const liste = (x) => (Array.isArray(x) ? x : x ? [x] : []);

export function ergZusammen(...quellen) {
  const aus = {};
  for (const q of quellen) {
    for (const [id, z] of Object.entries(q)) {
      const a = aus[id];
      if (!a) { aus[id] = { ...z }; continue; }
      aus[id] = {
        ...a,
        her: [...liste(a.her), ...liste(z.her)],
        nutzt: [...(a.nutzt || []), ...(z.nutzt || []).filter(([v]) => !(a.nutzt || []).some(([w]) => w === v))],
        bsp: [...(a.bsp || []), ...(z.bsp || [])],
        ...(a.bild || !z.bild ? {} : { bild: z.bild }),
        ...(a.wz || !z.wz ? {} : { wz: z.wz }),
        ...(a.falle || !z.falle ? {} : { falle: z.falle }),
        ...(z.syn ? { syn: [a.syn, z.syn].filter(Boolean).join(" ") } : {}),
      };
    }
  }
  return aus;
}

export const FS_ERG = ergZusammen(ERG_1, ERG_2, ERG_3, ERG_4, ERG_5, ERG_6, ERG_7, ERG_8);

import { NEU } from "./fsNeu.js";

export const FS_NEU = NEU;
