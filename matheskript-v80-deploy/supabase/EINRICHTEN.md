# Einrichten: Konto-Daten, Eltern-Wochenmail, Klassen-Challenge, Push

Alles ist im Code fertig und bleibt aus, bis die Schritte unten erledigt sind.

## 1. SQL im Supabase-SQL-Editor ausführen (einmal, in dieser Reihenfolge)

1. `konto.sql` – Daten exportieren und Konto löschen
2. `wochenmail.sql` – Eltern-Wochenmail
3. `challenge.sql` – Klassen-Challenge
4. `push.sql` – Push-Abos der App
5. `feedback-text.sql` – Feedback per Text (neben der Sprachnachricht); ohne dieses Skript meldet die App beim Senden eines Textes „hat nicht geklappt“

Vorher müssen `schema.sql`, `rollen.sql`, `lernstand.sql`, `entdecken.sql`, `ki.sql`, `perf-lab.sql` und `stripe.sql` laufen (sind schon eingerichtet).

## 2. Umgebungsvariablen in Vercel (Project → Settings → Environment Variables)

| Variable | Wofür | Woher |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Wochenmail und Push lesen Empfänger (gibt es schon für Stripe) | Supabase → Settings → API |
| `RESEND_API_KEY` | Mailversand | resend.com → API Keys (Domain mythosmathe.de bestätigen) |
| `WOCHENMAIL_ABSENDER` | Absender, z. B. `Mythos Mathe <bericht@mythosmathe.de>` | – |
| `WOCHENMAIL_AN` | Schalter: `ja` | – |
| `VITE_VAPID_PUBLIC_KEY` | Push im Browser | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Push senden | dieselbe Ausgabe |
| `VAPID_KONTAKT` | z. B. `mailto:info@mythosmathe.de` | – |
| `PUSH_AN` | Schalter: `ja` | – |
| `FORMELN_OEFFENTLICH` | Formelseiten ohne Passwort und indexierbar: `ja` | – |

`CRON_SECRET` setzt Vercel selbst. Nach dem Eintragen einmal neu deployen.

## 3. Prüfen

- Wochenmail-Probelauf ohne Versand: `GET /api/cron/wochenmail?probe=1` mit Header `Authorization: Bearer <CRON_SECRET>`.
- Die Wochenmail geht sonntags um 16:00 UTC raus (18:00 Uhr Sommerzeit), höchstens einmal in fünf Tagen je Elternteil.
- Push-Erinnerung: täglich 15:00 UTC an alle, die zugestimmt haben und an dem Tag noch nicht geübt haben.
