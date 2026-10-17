/* FORMELSAMMLUNG · ERGÄNZUNGEN
   FS_ERG: pro Formel-Kennung weitere Beweise (her), Verknüpfungen (nutzt), Beispiele (bsp), Falle.
   FS_NEU: ganz neue Formeln (mit "bereich"). Aufbau der Einträge: siehe fsAnalysis.js. */

import { ERG_1 } from "./fsErg1.js";
import { ERG_2 } from "./fsErg2.js";
import { ERG_3 } from "./fsErg3.js";
import { ERG_4 } from "./fsErg4.js";
import { ERG_5 } from "./fsErg5.js";
import { ERG_6 } from "./fsErg6.js";
import { ERG_7 } from "./fsErg7.js";

export const FS_ERG = {
  ...ERG_1,
  ...ERG_2,
  ...ERG_3,
  ...ERG_4,
  ...ERG_5,
  ...ERG_6,
  ...ERG_7,
};

import { NEU } from "./fsNeu.js";

export const FS_NEU = NEU;
