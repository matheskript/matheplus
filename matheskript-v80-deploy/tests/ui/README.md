# Browser-Tests (Playwright, Python)

Prüfen Head & Numbers im echten Browser: Lernpfad, Runde, Fehlerarten, Speicherung, Tab-Pause, Barrierefreiheit,
Englisch, Lernlandkarte. Die Logik selbst wird in `tests/headnumbers.test.mjs` geprüft (Node, ohne Browser).

```bash
pip install playwright && playwright install chromium     # einmalig
npm run build && npx vite preview --port 4173 &            # gebauten Stand ausliefern
python3 tests/ui/headnumbers.ui.py                         # optional: BASE_URL=http://localhost:4173/
```

Exit-Code 0 = alles in Ordnung. Das Skript löscht beim Start den lokalen Lernstand des Browser-Profils (leeres Profil je Lauf).

Mathe-Tastatur (Handy-Emulation, Formelfeld im Advanced Plotter): `python3 tests/ui/matheTastatur.ui.py`
