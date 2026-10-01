-- ======================================================================
-- Mythos Mathe – Konten, Profile, Empfehlungen
-- Einmal im Supabase-Dashboard unter „SQL Editor“ ausführen.
-- ======================================================================

create table if not exists public.profile (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 80),
  schulform     text check (schulform in ('G8', 'G9', 'GMS')),
  klasse        smallint check (klasse between 5 and 13),
  noten         jsonb not null default '{}'::jsonb,          -- {"5": 2, "6": 1, …, "12": 13}
  ref_code      text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  geworben_von  uuid references public.profile (id) on delete set null,
  erstellt      timestamptz not null default now()
);

create index if not exists profile_geworben_von_idx on public.profile (geworben_von);

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
  select id into w from profile where ref_code = lower(code);
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
