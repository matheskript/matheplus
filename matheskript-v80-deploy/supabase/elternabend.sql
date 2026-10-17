-- ======================================================================
-- Elternabend: Anmeldungen ohne Bezahlung (Übergangsphase mit Bonuscode)
-- Im Supabase-SQL-Editor EINMAL ausführen (mehrfach ausführbar).
--
-- Die App ruft nur die Funktion elternabend_anmelden(...) auf. Sie prüft
-- den Bonuscode und die freien Plätze selbst. Direkt lesen oder schreiben
-- kann niemand (RLS ohne Regeln) – die Liste siehst du im Dashboard unter
-- Table Editor → elternabend_anmeldungen.
-- Gültige Codes und Platzzahl stehen unten in der Funktion.
-- ======================================================================
create table if not exists public.elternabend_anmeldungen (
  id         bigint generated always as identity primary key,
  erstellt   timestamptz not null default now(),
  geaendert  timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 120),
  email      text not null check (char_length(email) between 3 and 200),
  personen   int  not null check (personen between 1 and 4),
  telefon    text check (telefon is null or char_length(telefon) <= 40),
  code       text not null
);
create unique index if not exists elternabend_anmeldungen_email
  on public.elternabend_anmeldungen (lower(email));

alter table public.elternabend_anmeldungen enable row level security;
revoke all on public.elternabend_anmeldungen from anon, authenticated;

create or replace function public.elternabend_anmelden(
  p_name text, p_email text, p_personen int, p_telefon text, p_code text
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  plaetze  constant int := 40;
  codes    constant text[] := array['MATHE27'];
  c        text := upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
  e        text := lower(trim(coalesce(p_email, '')));
  n        text := trim(coalesce(p_name, ''));
  belegt   int;
  bisher   int;
begin
  if not (c = any(codes)) then raise exception 'ea_code'; end if;
  if n = '' or e !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' or p_personen is null or p_personen not between 1 and 4 then
    raise exception 'ea_daten';
  end if;

  -- gleichzeitige Anmeldungen nacheinander abarbeiten
  perform pg_advisory_xact_lock(hashtext('elternabend_anmeldungen'));

  select coalesce(sum(personen), 0) into belegt from elternabend_anmeldungen;
  select personen into bisher from elternabend_anmeldungen where lower(email) = e;
  if belegt - coalesce(bisher, 0) + p_personen > plaetze then raise exception 'ea_voll'; end if;

  insert into elternabend_anmeldungen (name, email, personen, telefon, code)
  values (left(n, 120), e, p_personen, nullif(left(trim(coalesce(p_telefon, '')), 40), ''), c)
  on conflict (lower(email)) do update
    set name = excluded.name, personen = excluded.personen, telefon = excluded.telefon,
        code = excluded.code, geaendert = now();

  return plaetze - (belegt - coalesce(bisher, 0) + p_personen);
end;
$$;

revoke all on function public.elternabend_anmelden(text, text, int, text, text) from public;
grant execute on function public.elternabend_anmelden(text, text, int, text, text) to anon, authenticated;
