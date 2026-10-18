-- ======================================================================
-- Fortschritt im Pen-&-Paper-Kurs im Konto – im Supabase-SQL-Editor EINMAL ausführen.
--
-- Was gespeichert wird (src/penpaperSpeicher.js → penpaperSnapshot()):
--   · welche der neun Lektionen abgehakt sind
--   · welche Übungen vollständig gelöst wurden (und wie viele Versuche)
--   · der 7-Tage-Plan (abgehakte Tage)
--   · zuletzt geöffnete Lektion
-- Keine Fotos, keine Noten. Pro Konto genau EINE Zeile.
--
-- Sicherheit: Row Level Security – jeder sieht und ändert nur seine eigene Zeile.
-- Löscht der Nutzer sein Konto (auth.users), verschwindet die Zeile automatisch.
-- Ohne diese Tabelle läuft die App weiter wie bisher: der Fortschritt bleibt dann nur auf dem Gerät.
-- Das Skript ist wiederholbar (idempotent) und ändert keine bestehende Tabelle.
-- ======================================================================
create table if not exists public.penpaper_fortschritt (
  nutzer_id uuid primary key references auth.users (id) on delete cascade,
  daten     jsonb not null check (jsonb_typeof(daten) = 'object' and pg_column_size(daten) < 200000),
  version   smallint not null default 1,
  geaendert timestamptz not null default now()
);

alter table public.penpaper_fortschritt enable row level security;
drop policy if exists "eigene_zeile" on public.penpaper_fortschritt;
create policy "eigene_zeile" on public.penpaper_fortschritt
  for all using (auth.uid() = nutzer_id) with check (auth.uid() = nutzer_id);

create or replace function public.penpaper_zeit() returns trigger language plpgsql as $$
begin
  new.geaendert := now();
  return new;
end $$;
drop trigger if exists penpaper_zeit on public.penpaper_fortschritt;
create trigger penpaper_zeit before insert or update on public.penpaper_fortschritt
  for each row execute function public.penpaper_zeit();
