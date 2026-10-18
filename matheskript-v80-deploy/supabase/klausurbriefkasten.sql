-- ======================================================================
-- Klausurbriefkasten (Mathilda): Struktur-Meldungen zu Klassenarbeiten
-- Im Supabase-SQL-Editor ausführen (mehrfach ausführbar). Danach konto.sql
-- noch einmal, damit „Meine Daten herunterladen“ die Meldungen enthält.
--
-- Grundsatz: Fotos werden NIE gespeichert. Die App schickt das Foto nur zur
-- Analyse an Mathilda und legt hier ausschließlich die Struktur ab
-- (Thema, Aufgabentypen, Operatoren, Anforderungsbereiche, Punkte, Dauer,
-- Hilfsmittel) plus Bundesland, Schulart, Klasse, optional Schule und Monat.
-- Die Tabelle nimmt keine Bilddaten an (Prüfung unten).
--
-- Zugriff nur über die Funktionen:
--   klausur_melden(meldung jsonb)        – einwerfen (mit oder ohne Konto)
--   meine_klausurmeldungen()             – eigene Meldungen ansehen
--   klausur_meldung_loeschen(id)         – eigene Meldung löschen
-- Auswertung (alle Meldungen) nur im Dashboard: Table Editor → klausur_meldungen.
-- Konto gelöscht → Meldungen bleiben ohne Kontobezug (nutzer = null) als Statistik.
-- ======================================================================
create table if not exists public.klausur_meldungen (
  id          bigint generated always as identity primary key,
  erstellt    timestamptz not null default now(),
  nutzer      uuid references auth.users (id) on delete set null,
  version     smallint not null default 1,
  bundesland  text not null check (bundesland in ('bw','by','be','bb','hb','hh','he','mv','ni','nw','rp','sl','sn','st','sh','th')),
  schulart    text not null check (schulart in ('g8','g9','gms','realschule','gesamtschule','berufl','sonstige')),
  klasse      smallint not null check (klasse between 5 and 13),
  schule      text check (schule is null or char_length(schule) <= 100),
  monat       text check (monat is null or monat ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  kapitel     text check (kapitel is null or kapitel ~ '^[A-Za-z0-9]{1,30}$'),
  analyse     jsonb not null check (jsonb_typeof(analyse) = 'object' and pg_column_size(analyse) < 24000)
);
create index if not exists klausur_meldungen_filter on public.klausur_meldungen (bundesland, schulart, klasse, kapitel);
create index if not exists klausur_meldungen_nutzer on public.klausur_meldungen (nutzer);

alter table public.klausur_meldungen enable row level security;
revoke all on public.klausur_meldungen from anon, authenticated;

-- ---------- Einwerfen ----------
create or replace function public.klausur_melden(meldung jsonb)
returns bigint
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  uid   uuid := auth.uid();
  a     jsonb := meldung -> 'analyse';
  roh   text := meldung::text;
  heute int;
  neu   bigint;
begin
  if meldung is null or jsonb_typeof(meldung) <> 'object' or a is null or jsonb_typeof(a) <> 'object' then raise exception 'kb_daten'; end if;
  if jsonb_typeof(a -> 'aufgaben') <> 'array' or jsonb_array_length(a -> 'aufgaben') not between 1 and 30 then raise exception 'kb_daten'; end if;
  -- keine Bilder, keine Abschriften
  if octet_length(roh) > 30000 or roh ~* '(data:image|base64|/9j/4|iVBORw0KGgo)' or a ? 'abschrift' or a ? 'bild' or meldung ? 'bild' then
    raise exception 'kb_bild';
  end if;

  -- Unter 16 ohne Eltern-Zustimmung: nichts mit dem Konto verknüpfen
  if uid is not null and to_regprocedure('public.einwilligung_ok(uuid,text)') is not null
     and not public.einwilligung_ok(uid, 'konto') then
    raise exception 'kb_einwilligung';
  end if;

  -- Grenzen: je Konto 15 am Tag, ohne Konto zusammen 400 am Tag
  perform pg_advisory_xact_lock(hashtext('klausur_meldungen'));
  if uid is not null then
    select count(*) into heute from klausur_meldungen where nutzer = uid and erstellt > now() - interval '1 day';
    if heute >= 15 then raise exception 'kb_grenze'; end if;
  else
    select count(*) into heute from klausur_meldungen where nutzer is null and erstellt > now() - interval '1 day';
    if heute >= 400 then raise exception 'kb_grenze'; end if;
  end if;

  insert into klausur_meldungen (nutzer, version, bundesland, schulart, klasse, schule, monat, kapitel, analyse)
  values (
    uid,
    coalesce((meldung ->> 'v')::smallint, 1),
    meldung ->> 'bundesland',
    meldung ->> 'schulart',
    (meldung ->> 'klasse')::smallint,
    nullif(left(trim(coalesce(meldung ->> 'schule', '')), 100), ''),
    nullif(meldung ->> 'monat', ''),
    nullif(meldung ->> 'kapitel', ''),
    a
  ) returning id into neu;
  return neu;
end;
$$;

-- ---------- Eigene Meldungen ----------
create or replace function public.meine_klausurmeldungen()
returns setof jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object('id', id, 'erstellt', erstellt, 'bundesland', bundesland, 'schulart', schulart, 'klasse', klasse,
                            'schule', schule, 'monat', monat, 'kapitel', kapitel, 'analyse', analyse)
  from klausur_meldungen where nutzer = auth.uid() and auth.uid() is not null
  order by erstellt desc limit 200;
$$;

create or replace function public.klausur_meldung_loeschen(p_id bigint)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare n int;
begin
  if auth.uid() is null then return false; end if;
  delete from klausur_meldungen where id = p_id and nutzer = auth.uid();
  get diagnostics n = row_count;
  return n > 0;
end;
$$;

revoke all on function public.klausur_melden(jsonb) from public;
revoke all on function public.meine_klausurmeldungen() from public;
revoke all on function public.klausur_meldung_loeschen(bigint) from public;
grant execute on function public.klausur_melden(jsonb) to anon, authenticated;
grant execute on function public.meine_klausurmeldungen() to authenticated;
grant execute on function public.klausur_meldung_loeschen(bigint) to authenticated;
