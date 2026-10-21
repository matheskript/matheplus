-- ======================================================================
-- Kanal-Landingpages (/poster /thema /insta /eltern /abi-eltern):
--   1. gespraech_anfrage_senden – Erstgespräch / Aufnahmegespräch aus dem Formular
--   2. kanal_zaehlen       – Ereignisse je Werbekanal, ohne Cookies und Drittdienste
-- Im Supabase-SQL-Editor EINMAL ausführen (mehrfach ausführbar).
--
-- Die App ruft nur die beiden Funktionen auf; direkt lesen oder schreiben kann
-- niemand (RLS ohne Regeln). Anfragen siehst du im Dashboard unter
-- Table Editor → gespraech_anfragen, die Zählung in kanal_ereignisse bzw.
-- zusammengefasst in der Sicht kanal_wochen (eine Zeile je Kanal und Woche).
-- ======================================================================

-- ---------- 1. Gesprächsanfragen ----------
create table if not exists public.gespraech_anfragen (
  id         bigint generated always as identity primary key,
  erstellt   timestamptz not null default now(),
  art        text not null check (art in ('erstgespraech', 'aufnahme')),
  name       text not null check (char_length(name) between 1 and 120),
  telefon    text check (telefon is null or char_length(telefon) <= 40),
  email      text check (email is null or char_length(email) <= 200),
  klasse     text check (klasse is null or char_length(klasse) <= 40),
  thema      text check (thema is null or char_length(thema) <= 400),
  termine    text check (termine is null or char_length(termine) <= 200),
  via        text check (via is null or char_length(via) <= 40),
  seite      text check (seite is null or char_length(seite) <= 40),
  erledigt   boolean not null default false
);
alter table public.gespraech_anfragen enable row level security;
revoke all on public.gespraech_anfragen from anon, authenticated;

create or replace function public.gespraech_anfrage_senden(
  p_art text, p_name text, p_telefon text, p_email text, p_klasse text, p_thema text, p_termine text, p_via text, p_seite text
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  n   text := trim(coalesce(p_name, ''));
  t   text := nullif(trim(coalesce(p_telefon, '')), '');
  e   text := nullif(lower(trim(coalesce(p_email, ''))), '');
  neu bigint;
begin
  if p_art not in ('erstgespraech', 'aufnahme') then raise exception 'ga_daten'; end if;
  if n = '' or (t is null and e is null) then raise exception 'ga_daten'; end if;
  if e is not null and e !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'ga_daten'; end if;

  -- Schutz vor Dauerfeuer: höchstens 20 Anfragen je Stunde insgesamt
  if (select count(*) from gespraech_anfragen where erstellt > now() - interval '1 hour') >= 20 then raise exception 'ga_voll'; end if;

  insert into gespraech_anfragen (art, name, telefon, email, klasse, thema, termine, via, seite)
  values (p_art, left(n, 120), left(t, 40), left(e, 200),
          nullif(left(trim(coalesce(p_klasse, '')), 40), ''),
          nullif(left(trim(coalesce(p_thema, '')), 400), ''),
          nullif(left(trim(coalesce(p_termine, '')), 200), ''),
          nullif(left(regexp_replace(lower(coalesce(p_via, '')), '[^a-z0-9-]', '', 'g'), 40), ''),
          nullif(left(regexp_replace(lower(coalesce(p_seite, '')), '[^a-z0-9-]', '', 'g'), 40), ''))
  returning id into neu;
  return neu;
end;
$$;
revoke all on function public.gespraech_anfrage_senden(text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.gespraech_anfrage_senden(text, text, text, text, text, text, text, text, text) to anon, authenticated;

-- ---------- 2. Zählung je Kanal ----------
create table if not exists public.kanal_ereignisse (
  id        bigint generated always as identity primary key,
  zeit      timestamptz not null default now(),
  via       text not null check (char_length(via) between 1 and 40),
  seite     text not null check (char_length(seite) between 1 and 40),
  ereignis  text not null check (char_length(ereignis) between 1 and 30),
  detail    text check (detail is null or char_length(detail) <= 60)
);
create index if not exists kanal_ereignisse_zeit on public.kanal_ereignisse (zeit);
alter table public.kanal_ereignisse enable row level security;
revoke all on public.kanal_ereignisse from anon, authenticated;

create or replace function public.kanal_zaehlen(p_via text, p_seite text, p_ereignis text, p_detail text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v text := left(regexp_replace(lower(coalesce(p_via, '')), '[^a-z0-9-]', '', 'g'), 40);
  s text := left(regexp_replace(lower(coalesce(p_seite, '')), '[^a-z0-9-]', '', 'g'), 40);
  e text := left(regexp_replace(lower(coalesce(p_ereignis, '')), '[^a-z0-9-]', '', 'g'), 30);
begin
  if v = '' or s = '' or e = '' then return; end if;   -- still ignorieren, nie die Seite stören
  insert into kanal_ereignisse (via, seite, ereignis, detail)
  values (v, s, e, nullif(left(trim(coalesce(p_detail, '')), 60), ''));
end;
$$;
revoke all on function public.kanal_zaehlen(text, text, text, text) from public;
grant execute on function public.kanal_zaehlen(text, text, text, text) to anon, authenticated;

-- Wochenübersicht für das Dashboard: eine Zeile je Kanal, Woche und Ereignis
create or replace view public.kanal_wochen as
  select date_trunc('week', zeit)::date as woche, via, seite, ereignis, count(*) as anzahl
  from public.kanal_ereignisse
  group by 1, 2, 3, 4
  order by 1 desc, 2, 3, 4;
revoke all on public.kanal_wochen from anon, authenticated;
