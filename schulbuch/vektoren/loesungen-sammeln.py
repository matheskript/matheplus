"""Setzt loesungen.html aus loes/*.html zusammen (Checks, Kapitel I–VI, Abitur).
Aufruf: python3 loesungen-sammeln.py && python3 loesungen-verteilen.py"""
import pathlib
L = pathlib.Path(__file__).parent / "loes"
teile = ["<h3>Checks auf den Auftaktseiten</h3>\n"]
teile += [(L / f"check-{k}.html").read_text() for k in ["I", "II", "III", "IV", "V", "VI"]]
teile += ["\n"] + [(L / f"{k}.html").read_text() + "\n" for k in ["I", "II", "III", "IV", "V", "VI"]]
teile.append((L / "abitur.html").read_text())
(L.parent / "loesungen.html").write_text("".join(teile))
print("loesungen.html:", sum(t.count("<h3>") for t in teile), "Abschnitte")
