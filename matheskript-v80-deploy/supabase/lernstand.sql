-- ======================================================================
-- Lernstand im Konto – im Supabase-SQL-Editor EINMAL ausführen.
--
-- Was gespeichert wird: der Lernstand des Schülers (src/func6.jsx → lernSnapshot()):
-- Kompetenzen, Trainingsstand, Ebbinghaus-Wiederholungsplan und Tagespläne, Head & Numbers.
-- Keine Freitexte, keine Fotos. Pro Konto genau EINE Zeile.
--
-- Sicherheit: Row Level Security – jeder sieht und ändert nur seine eigene Zeile.
-- Löscht der Nutzer sein Konto (auth.users), verschwindet die Zeile automatisch.
-- Ohne diese Tabelle läuft die App weiter wie bisher: der Lernstand bleibt dann nur auf
-- dem Gerät (die Seite zeigt „Speicher im Konto noch nicht eingerichtet“).
-- ======================================================================
create table if not exists public.lernstand (
  nutzer_id uuid primary key references auth.users (id) on delete cascade,
  daten     jsonb not null,
  version   smallint not null default 1,
  geaendert timestamptz not null default now()
);

alter table public.lernstand enable row level security;
drop policy if exists "eigene_zeile" on public.lernstand;
create policy "eigene_zeile" on public.lernstand
  for all using (auth.uid() = nutzer_id) with check (auth.uid() = nutzer_id);

create or replace function public.lernstand_zeit() returns trigger language plpgsql as $$
begin
  new.geaendert := now();
  return new;
end $$;
drop trigger if exists lernstand_zeit on public.lernstand;
create trigger lernstand_zeit before insert or update on public.lernstand
  for each row execute function public.lernstand_zeit();
