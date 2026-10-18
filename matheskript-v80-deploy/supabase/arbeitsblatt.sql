-- ======================================================================
-- Gespeicherte Arbeitsblätter (Lehrer-Arbeitsblatt-Generator, /lehrkraefte/arbeitsblatt)
-- Im Supabase-SQL-Editor EINMAL ausführen; danach konto.sql noch einmal (Datenexport).
--
-- Was gespeichert wird (src/arbeitsblatt.js → blattSnapshot()):
--   · Titel, gewählte Unterthemen, Einstellungen (Anzahl, Niveau, Gruppen, Rechenraum, Lösungen)
--   · die erzeugten Aufgaben selbst (damit dasselbe Blatt später genau so wieder gedruckt werden kann)
--   · Blattkopf (Schule, Lehrkraft, Klasse, Datum) – nur, was die Lehrkraft selbst eingetragen hat
-- Keine Schülerdaten.
--
-- Sicherheit: Row Level Security – jeder sieht, speichert und löscht nur seine eigenen Blätter.
-- Höchstens 200 Blätter je Konto. Löscht der Nutzer sein Konto, verschwinden die Blätter automatisch.
-- Ohne diese Tabelle läuft die Seite weiter; Speichern meldet dann, dass es gerade nicht geht.
-- Das Skript ist wiederholbar (idempotent).
-- ======================================================================
create table if not exists public.arbeitsblaetter (
  id        uuid primary key default gen_random_uuid(),
  nutzer_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titel     text not null check (char_length(titel) between 1 and 120),
  daten     jsonb not null check (jsonb_typeof(daten) = 'object' and pg_column_size(daten) < 120000),
  erstellt  timestamptz not null default now()
);
create index if not exists arbeitsblaetter_nutzer_idx on public.arbeitsblaetter (nutzer_id, erstellt desc);

alter table public.arbeitsblaetter enable row level security;
drop policy if exists "eigene_blaetter" on public.arbeitsblaetter;
create policy "eigene_blaetter" on public.arbeitsblaetter
  for all using (auth.uid() = nutzer_id) with check (auth.uid() = nutzer_id);

create or replace function public.arbeitsblatt_grenze() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.arbeitsblaetter where nutzer_id = new.nutzer_id) >= 200 then
    raise exception 'ab_grenze' using hint = 'Höchstens 200 gespeicherte Blätter je Konto.';
  end if;
  return new;
end $$;
drop trigger if exists arbeitsblatt_grenze on public.arbeitsblaetter;
create trigger arbeitsblatt_grenze before insert on public.arbeitsblaetter
  for each row execute function public.arbeitsblatt_grenze();
