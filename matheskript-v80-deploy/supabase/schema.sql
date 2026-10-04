-- ======================================================================
-- Mythos Mathe – Konten, Profile, Empfehlungen
-- Einmal im Supabase-Dashboard unter „SQL Editor“ ausführen.
-- ======================================================================

-- Jeder Empfehlungscode ist eine eigene sechsstellige Zahl: matheplus-scls.vercel.app/482913
create or replace function public.neue_refzahl()
returns text
language plpgsql
volatile
security definer          -- muss alle Codes sehen, um Doppelte zu vermeiden
set search_path = public
as $$
declare
  code text;
begin
  loop
    code := (100000 + floor(random() * 900000))::int::text;
    exit when not exists (select 1 from profile where ref_code = code);
  end loop;
  return code;
end;
$$;

create table if not exists public.profile (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 80),
  schulform     text check (schulform in ('G8', 'G9', 'GMS')),
  klasse        smallint check (klasse between 5 and 13),
  noten         jsonb not null default '{}'::jsonb,          -- {"5": 2, "6": 1, …, "12": 13}
  ref_code      text not null unique,
  geworben_von  uuid references public.profile (id) on delete set null,
  erstellt      timestamptz not null default now()
);

create index if not exists profile_geworben_von_idx on public.profile (geworben_von);
alter table public.profile alter column ref_code set default public.neue_refzahl();
drop function if exists public.neue_gleichung();
alter table public.profile add column if not exists ref_fest boolean not null default false;  -- true = vom Schüler endgültig gewählt

alter table public.profile enable row level security;

-- Jeder sieht und ändert nur sein eigenes Profil.
drop policy if exists "profil_lesen"   on public.profile;
drop policy if exists "profil_anlegen" on public.profile;
drop policy if exists "profil_aendern" on public.profile;
create policy "profil_lesen"   on public.profile for select using (auth.uid() = id);
create policy "profil_anlegen" on public.profile for insert with check (auth.uid() = id);
create policy "profil_aendern" on public.profile for update using (auth.uid() = id) with check (auth.uid() = id);

-- Werber und Empfehlungscode darf der Nutzer nicht selbst setzen: nur diese Spalten sind beschreibbar.
revoke insert, update on public.profile from anon, authenticated;
grant  select on public.profile to authenticated;
grant  insert (id, name, schulform, klasse, noten) on public.profile to authenticated;
grant  update (name, schulform, klasse, noten)     on public.profile to authenticated;

-- Werber zuordnen: nur einmal, nur für frisch angelegte Konten, nicht sich selbst.
create or replace function public.werber_setzen(code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  w uuid;
begin
  select id into w from profile where ref_code = replace(code, ' ', '');
  if w is null or w = auth.uid() then
    return false;
  end if;
  update profile
     set geworben_von = w
   where id = auth.uid()
     and geworben_von is null
     and erstellt > now() - interval '1 day';
  return found;
end;
$$;

-- Wie viele Personen habe ich geworben? (ohne fremde Daten preiszugeben)
create or replace function public.anzahl_geworben()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from profile where geworben_von = auth.uid();
$$;

revoke all on function public.werber_setzen(text) from public, anon;
revoke all on function public.anzahl_geworben()   from public, anon;
grant execute on function public.werber_setzen(text) to authenticated;
grant execute on function public.anzahl_geworben()   to authenticated;


-- ---------- Wunschzahl als Empfehlungslink ----------
-- Gültig: genau sechs Ziffern, keine führende Null (100000 – 999999).
create or replace function public.ref_gueltig(code text)
returns boolean
language sql
immutable
as $$
  select coalesce(code ~ '^[1-9][0-9]{5}$', false);
$$;

-- Ist die Zahl gültig und noch nicht vergeben? (verrät nur ja/nein)
create or replace function public.ref_frei(code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.ref_gueltig(code)
     and not exists (select 1 from profile where ref_code = code and id <> auth.uid());
$$;

-- Einmalig und für immer festlegen.
create or replace function public.ref_festlegen(code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.ref_gueltig(code) then return 'ungueltig'; end if;
  if exists (select 1 from profile where id = auth.uid() and ref_fest) then return 'schon_fest'; end if;
  if exists (select 1 from profile where ref_code = code and id <> auth.uid()) then return 'vergeben'; end if;
  update profile set ref_code = code, ref_fest = true where id = auth.uid();
  return 'ok';
exception when unique_violation then
  return 'vergeben';
end;
$$;

revoke all on function public.ref_frei(text)      from public, anon;
revoke all on function public.ref_festlegen(text) from public, anon;
grant execute on function public.ref_frei(text)      to authenticated;
grant execute on function public.ref_festlegen(text) to authenticated;


-- ======================================================================
-- Feedback per Sprachnachricht (Knopf am rechten Rand jeder Seite)
-- Einmal im Supabase-Dashboard unter „SQL Editor“ ausführen.
-- Schüler dürfen nur senden, nie lesen. Anhören: Dashboard → Storage → feedback,
-- die passende Seite steht in der Tabelle „feedback“ (Spalte seite / audio_pfad).
-- ======================================================================
create table if not exists public.feedback (
  id           uuid primary key default gen_random_uuid(),
  erstellt     timestamptz not null default now(),
  nutzer       uuid default auth.uid(),            -- leer, wenn nicht angemeldet
  seite        text not null check (char_length(seite) between 1 and 200),   -- z. B. „Üben › Kurvendiskussion“
  ansicht      text not null check (char_length(ansicht) <= 60),             -- interne Seiten-ID
  ueberschrift text check (char_length(ueberschrift) <= 200),
  details      jsonb not null default '{}'::jsonb,                           -- Unterziel: Klasse, Bereich, Modus …
  audio_pfad   text not null check (char_length(audio_pfad) <= 200),
  dauer_s      integer check (dauer_s between 0 and 600),
  sprache      text check (sprache in ('de', 'en')),
  viewport     text check (char_length(viewport) <= 20),
  geraet       text check (char_length(geraet) <= 200)
);

alter table public.feedback enable row level security;
drop policy if exists "feedback_senden" on public.feedback;
create policy "feedback_senden" on public.feedback for insert to anon, authenticated with check (true);

revoke all on public.feedback from anon, authenticated;
grant insert (seite, ansicht, ueberschrift, details, audio_pfad, dauer_s, sprache, viewport, geraet) on public.feedback to anon, authenticated;

-- Privater Speicher, höchstens 5 MB pro Aufnahme, nur Audio.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('feedback', 'feedback', false, 5242880,
        array['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/x-m4a'])
on conflict (id) do update
  set public = false, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "feedback_audio_senden" on storage.objects;
create policy "feedback_audio_senden" on storage.objects for insert to anon, authenticated with check (bucket_id = 'feedback');
