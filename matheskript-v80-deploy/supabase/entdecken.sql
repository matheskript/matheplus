-- ======================================================================
-- Fortschritt in „Mathe entdecken“ im Konto – im Supabase-SQL-Editor EINMAL ausführen.
--
-- Was gespeichert wird (src/entdeckenSpeicher.js → entdeckenSnapshot()):
--   · Antworten auf die drei Reflexionsfragen (Auswahl und eigener Text)
--   · welche Videos der Schüler als „gesehen“ markiert hat
--   · Stand im Potenzregel-Modul (Phase, erledigte Schritte je Phase, abgeschlossen)
--   · zuletzt bearbeiteter Abschnitt
-- Keine Fotos, keine Noten. Pro Konto genau EINE Zeile.
--
-- Sicherheit: Row Level Security – jeder sieht und ändert nur seine eigene Zeile.
-- Löscht der Nutzer sein Konto (auth.users), verschwindet die Zeile automatisch.
-- Ohne diese Tabelle läuft die App weiter wie bisher: der Fortschritt bleibt dann nur auf
-- dem Gerät (die Seite zeigt „Konto-Speicher noch nicht eingerichtet“).
-- Das Skript ist wiederholbar (idempotent) und ändert keine bestehende Tabelle.
-- ======================================================================
create table if not exists public.entdecken_fortschritt (
  nutzer_id uuid primary key references auth.users (id) on delete cascade,
  daten     jsonb not null check (jsonb_typeof(daten) = 'object' and pg_column_size(daten) < 200000),
  version   smallint not null default 1,
  geaendert timestamptz not null default now()
);

alter table public.entdecken_fortschritt enable row level security;
drop policy if exists "eigene_zeile" on public.entdecken_fortschritt;
create policy "eigene_zeile" on public.entdecken_fortschritt
  for all using (auth.uid() = nutzer_id) with check (auth.uid() = nutzer_id);

create or replace function public.entdecken_zeit() returns trigger language plpgsql as $$
begin
  new.geaendert := now();
  return new;
end $$;
drop trigger if exists entdecken_zeit on public.entdecken_fortschritt;
create trigger entdecken_zeit before insert or update on public.entdecken_fortschritt
  for each row execute function public.entdecken_zeit();
