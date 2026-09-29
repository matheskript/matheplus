/* Registry für Funktionsreferenzen, die aus den "base"-Dateien heraus
   auf Funktionen aus den "func"-Dateien verweisen müssen, ohne dass die
   base-Datei die func-Datei statisch importiert (das würde die
   Auswertungsreihenfolge zwischen den base-Dateien durcheinanderbringen,
   siehe TDZ-Problematik bei zyklischen ESM-Importen). Die func-Dateien
   tragen sich hier nach ihrer eigenen Deklaration ein; die base-Dateien
   lesen nur lazy (zur Aufrufzeit), wenn alle Module bereits geladen sind. */
export const FR = {};
