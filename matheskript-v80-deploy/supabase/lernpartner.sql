-- ======================================================================
-- Lernpartner-Börse fürs Abi – im Supabase-SQL-Editor ausführen,
-- NACH schema.sql, rollen.sql und einwilligung.sql. Das Skript ist wiederholbar.
--
-- Was die Börse kann
--   * Abiturienten derselben Stadt und desselben Abi-Jahrgangs finden sich – auch über Schulgrenzen.
--   * Steckbrief ohne Freitext: Vorname, Stadt, Abi-Jahr, Kurs, „kann helfen bei“ / „sucht Hilfe bei“,
--     Zeiten, Treffpunkt-Arten. Schule nur, wenn der Schüler sie zeigen will.
--   * Anfrage mit Zeit und Treffpunkt-Art; angenommen entsteht eine Lerngruppe (höchstens 6).
--   * In der Gruppe: Treffen vorschlagen (Tag, Uhrzeit, öffentlicher Ort), zu- oder absagen,
--     gemeinsamer Teil-A-Satz (alle rechnen dieselbe Probe, satz_seed).
--
-- Schutz (durchgesetzt hier in der Datenbank, nicht nur in der Oberfläche)
--   * Nur Schülerkonten mit Altersangabe „nicht unter 16“.
--   * Minderjährige brauchen die Freigabe eines verbundenen Elternteils (eltern_kind);
--     wer volljährig erklärt hat, braucht sie nicht. Widerruf beendet alles sofort.
--   * Kein Chat, keine Kontaktdaten: Namen, Ortsnamen und Gruppennamen laufen durch lp_text_ok
--     (keine Mail, kein Link, keine Telefonnummer, keine Messenger-Namen).
--   * Sichtbar nur für Teilnehmer derselben Stadt und desselben Jahrgangs; Blockieren wirkt beidseitig.
--   * Höchstens 5 Anfragen pro 24 Stunden. Meldungen landen in lernpartner_meldung (nur Admin liest).
--   * Alle Tabellen mit Row Level Security und ohne direkte Rechte – Zugriff nur über die Funktionen.
-- ======================================================================

-- ---------- Text ohne Kontaktdaten ----------
create or replace function public.lp_text_ok(t text)
returns boolean
language sql
immutable
as $$
  select t is not null
     and t !~* '(@|https?:|www\.|\.(de|com|net|org|io|me|eu)([^a-z]|$)|insta|snap|whats|wa\.me|tiktok|discord|telegram|signal|handy|nummer|telefon)'
     and char_length(regexp_replace(t, '[^0-9]', '', 'g')) < 5
$$;

-- ---------- Tabellen ----------
create table if not exists public.lernpartner_profil (
  nutzer_id        uuid primary key references public.profile (id) on delete cascade,
  anzeigename      text not null check (anzeigename ~ '^[A-Za-zÄÖÜäöüßéèçñ][A-Za-zÄÖÜäöüßéèçñ .-]{1,19}$' and public.lp_text_ok(anzeigename)),
  stadt            text not null check (stadt ~ '^[A-Za-zÄÖÜäöüßéè][A-Za-zÄÖÜäöüßéè .()/-]{1,59}$'),
  stadt_schluessel text generated always as (lower(regexp_replace(btrim(stadt), '\s+', ' ', 'g'))) stored,
  abi_jahr         smallint not null check (abi_jahr between 2026 and 2035),
  niveau           text not null check (niveau in ('erhoeht', 'grundlegend')),
  schule           text check (schule is null or (char_length(schule) between 2 and 80 and public.lp_text_ok(schule))),
  schule_zeigen    boolean not null default false,
  helfen           text[] not null default '{}' check (helfen <@ array['analysis', 'geometrie', 'stochastik', 'teila', 'muendlich']::text[]),
  suchen           text[] not null default '{}' check (suchen <@ array['analysis', 'geometrie', 'stochastik', 'teila', 'muendlich']::text[]),
  zeiten           text[] not null default '{}' check (zeiten <@ array['wt-nachmittag', 'wt-abend', 'sa', 'so']::text[]),
  orte             text[] not null default '{}' check (orte <@ array['bibliothek', 'schule', 'cafe', 'lernraum']::text[]),
  aktiv            boolean not null default true,
  erstellt         timestamptz not null default now(),
  aktualisiert     timestamptz not null default now()
);
create index if not exists lernpartner_profil_ort_idx on public.lernpartner_profil (stadt_schluessel, abi_jahr);

create table if not exists public.lernpartner_freigabe (
  kind_id    uuid primary key references public.profile (id) on delete cascade,
  eltern_id  uuid not null references public.profile (id) on delete cascade,
  erteilt_am timestamptz not null default now()
);

create table if not exists public.lernpartner_gruppe (
  id               bigint generated always as identity primary key,
  name             text not null check (char_length(name) between 2 and 40 and public.lp_text_ok(name)),
  stadt_schluessel text not null,
  abi_jahr         smallint not null,
  satz_seed        integer not null default (floor(random() * 2000000000))::int,
  erstellt         timestamptz not null default now()
);

create table if not exists public.lernpartner_mitglied (
  gruppe_id   bigint not null references public.lernpartner_gruppe (id) on delete cascade,
  nutzer_id   uuid not null references public.profile (id) on delete cascade,
  beigetreten timestamptz not null default now(),
  primary key (gruppe_id, nutzer_id)
);
create index if not exists lernpartner_mitglied_nutzer_idx on public.lernpartner_mitglied (nutzer_id);

create table if not exists public.lernpartner_anfrage (
  id          bigint generated always as identity primary key,
  von         uuid not null references public.profile (id) on delete cascade,
  an          uuid not null references public.profile (id) on delete cascade,
  gruppe_id   bigint references public.lernpartner_gruppe (id) on delete cascade,
  zeit        text not null check (zeit in ('wt-nachmittag', 'wt-abend', 'sa', 'so')),
  ort         text not null check (ort in ('bibliothek', 'schule', 'cafe', 'lernraum')),
  status      text not null default 'offen' check (status in ('offen', 'angenommen', 'abgelehnt', 'zurueckgezogen')),
  erstellt    timestamptz not null default now(),
  beantwortet timestamptz,
  check (von <> an)
);
create unique index if not exists lernpartner_anfrage_offen_idx on public.lernpartner_anfrage (von, an) where status = 'offen';
create index if not exists lernpartner_anfrage_an_idx on public.lernpartner_anfrage (an, status);

create table if not exists public.lernpartner_treffen (
  id        bigint generated always as identity primary key,
  gruppe_id bigint not null references public.lernpartner_gruppe (id) on delete cascade,
  wann      timestamptz not null,
  ort       text not null check (ort in ('bibliothek', 'schule', 'cafe', 'lernraum')),
  ort_name  text not null check (char_length(ort_name) between 2 and 60 and public.lp_text_ok(ort_name)),
  thema     text not null default 'teila' check (thema in ('analysis', 'geometrie', 'stochastik', 'teila', 'muendlich')),
  von       uuid references public.profile (id) on delete set null,
  erstellt  timestamptz not null default now()
);
create index if not exists lernpartner_treffen_gruppe_idx on public.lernpartner_treffen (gruppe_id, wann);

create table if not exists public.lernpartner_zusage (
  treffen_id bigint not null references public.lernpartner_treffen (id) on delete cascade,
  nutzer_id  uuid not null references public.profile (id) on delete cascade,
  zusage     boolean not null,
  primary key (treffen_id, nutzer_id)
);

create table if not exists public.lernpartner_block (
  von      uuid not null references public.profile (id) on delete cascade,
  an       uuid not null references public.profile (id) on delete cascade,
  erstellt timestamptz not null default now(),
  primary key (von, an),
  check (von <> an)
);

create table if not exists public.lernpartner_meldung (
  id         bigint generated always as identity primary key,
  von        uuid references public.profile (id) on delete set null,
  an         uuid references public.profile (id) on delete set null,
  grund      text not null check (grund in ('kontakt', 'belaestigung', 'fake', 'sonstiges')),
  erstellt   timestamptz not null default now(),
  bearbeitet timestamptz
);

do $$
declare t text;
begin
  foreach t in array array['lernpartner_profil', 'lernpartner_freigabe', 'lernpartner_gruppe', 'lernpartner_mitglied', 'lernpartner_anfrage',
                           'lernpartner_treffen', 'lernpartner_zusage', 'lernpartner_block', 'lernpartner_meldung'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- Höchstens 6 Mitglieder je Gruppe
create or replace function public.lp_gruppe_voll()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.lernpartner_mitglied where gruppe_id = new.gruppe_id) >= 6 then
    raise exception 'lp_gruppe_voll';
  end if;
  return new;
end;
$$;
drop trigger if exists lernpartner_mitglied_max on public.lernpartner_mitglied;
create trigger lernpartner_mitglied_max before insert on public.lernpartner_mitglied for each row execute function public.lp_gruppe_voll();

-- ---------- Wer darf teilnehmen? ----------
-- 'ok' | 'kein_konto' | 'rolle' | 'alter' (keine Angabe) | 'unter16' | 'freigabe' (minderjährig ohne Elternfreigabe)
create or replace function public.lp_grund(uid uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare p profile%rowtype;
begin
  if uid is null then return 'kein_konto'; end if;
  select * into p from profile where id = uid;
  if not found then return 'kein_konto'; end if;
  if p.rolle <> 'schueler' then return 'rolle'; end if;
  if p.unter16 is null then return 'alter'; end if;
  if p.unter16 then return 'unter16'; end if;
  if p.volljaehrig_erklaert_am is not null then return 'ok'; end if;
  if exists (select 1 from lernpartner_freigabe f join eltern_kind ek on ek.kind_id = f.kind_id and ek.eltern_id = f.eltern_id where f.kind_id = uid) then
    return 'ok';
  end if;
  return 'freigabe';
end;
$$;

create or replace function public.lp_darf(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select public.lp_grund(uid) = 'ok' $$;

create or replace function public.lp_blockiert(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from lernpartner_block where (von = a and an = b) or (von = b and an = a)) $$;

-- Alles beenden (Widerruf der Freigabe, Profil löschen): Gruppen verlassen, offene Anfragen zurückziehen
create or replace function public.lp_aufraeumen(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update lernpartner_anfrage set status = 'zurueckgezogen', beantwortet = now() where status = 'offen' and (von = uid or an = uid);
  delete from lernpartner_mitglied where nutzer_id = uid;
  delete from lernpartner_gruppe g where not exists (select 1 from lernpartner_mitglied m where m.gruppe_id = g.id);
  update lernpartner_profil set aktiv = false, aktualisiert = now() where nutzer_id = uid;
end;
$$;

-- ---------- Eigener Stand ----------
create or replace function public.lp_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'grund', public.lp_grund(auth.uid()),
    'profil', (select to_jsonb(lp) - 'stadt_schluessel' - 'nutzer_id' from lernpartner_profil lp where lp.nutzer_id = auth.uid()),
    'eltern', exists (select 1 from eltern_kind where kind_id = auth.uid()),
    'freigabe', exists (select 1 from lernpartner_freigabe where kind_id = auth.uid())
  )
$$;

-- Steckbrief anlegen oder ändern. Rückgabe: 'ok' | 'nicht_erlaubt' | 'name' | 'stadt' | 'schule' | 'jahr' | 'niveau'
create or replace function public.lp_profil_speichern(d jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  n text := btrim(coalesce(d->>'anzeigename', ''));
  s text := btrim(regexp_replace(coalesce(d->>'stadt', ''), '\s+', ' ', 'g'));
  sch text := nullif(btrim(coalesce(d->>'schule', '')), '');
  j int;
  bereiche constant text[] := array['analysis', 'geometrie', 'stochastik', 'teila', 'muendlich'];
begin
  if not public.lp_darf(me) then return 'nicht_erlaubt'; end if;
  if n !~ '^[A-Za-zÄÖÜäöüßéèçñ][A-Za-zÄÖÜäöüßéèçñ .-]{1,19}$' or not public.lp_text_ok(n) then return 'name'; end if;
  if s !~ '^[A-Za-zÄÖÜäöüßéè][A-Za-zÄÖÜäöüßéè .()/-]{1,59}$' then return 'stadt'; end if;
  if sch is not null and (char_length(sch) not between 2 and 80 or not public.lp_text_ok(sch)) then return 'schule'; end if;
  begin j := (d->>'abi_jahr')::int; exception when others then return 'jahr'; end;
  if j is null or j not between 2026 and 2035 then return 'jahr'; end if;
  if coalesce(d->>'niveau', '') not in ('erhoeht', 'grundlegend') then return 'niveau'; end if;
  insert into lernpartner_profil as lp (nutzer_id, anzeigename, stadt, abi_jahr, niveau, schule, schule_zeigen, helfen, suchen, zeiten, orte, aktiv, aktualisiert)
  values (me, n, s, j, d->>'niveau', sch, coalesce((d->>'schule_zeigen')::boolean, false) and sch is not null,
    array(select distinct x from jsonb_array_elements_text(coalesce(d->'helfen', '[]')) x where x = any(bereiche) order by x),
    array(select distinct x from jsonb_array_elements_text(coalesce(d->'suchen', '[]')) x where x = any(bereiche) order by x),
    array(select distinct x from jsonb_array_elements_text(coalesce(d->'zeiten', '[]')) x where x = any(array['wt-nachmittag', 'wt-abend', 'sa', 'so']) order by x),
    array(select distinct x from jsonb_array_elements_text(coalesce(d->'orte', '[]')) x where x = any(array['bibliothek', 'schule', 'cafe', 'lernraum']) order by x),
    coalesce((d->>'aktiv')::boolean, true), now())
  on conflict (nutzer_id) do update set anzeigename = excluded.anzeigename, stadt = excluded.stadt, abi_jahr = excluded.abi_jahr, niveau = excluded.niveau,
    schule = excluded.schule, schule_zeigen = excluded.schule_zeigen, helfen = excluded.helfen, suchen = excluded.suchen, zeiten = excluded.zeiten,
    orte = excluded.orte, aktiv = excluded.aktiv, aktualisiert = now();
  return 'ok';
end;
$$;

-- Steckbrief löschen (verlässt alle Gruppen)
create or replace function public.lp_profil_loeschen()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return false; end if;
  perform public.lp_aufraeumen(auth.uid());
  delete from lernpartner_profil where nutzer_id = auth.uid();
  return true;
end;
$$;

-- ---------- Suchen ----------
create or replace function public.lp_suchen()
returns table (id uuid, anzeigename text, schule text, niveau text, helfen text[], suchen text[], zeiten text[], orte text[], passung int, angefragt boolean)
language sql
stable
security definer
set search_path = public
as $$
  select o.nutzer_id, o.anzeigename, case when o.schule_zeigen then o.schule end, o.niveau, o.helfen, o.suchen, o.zeiten, o.orte,
         (2 * cardinality(array(select unnest(o.helfen) intersect select unnest(m.suchen)))
          + 2 * cardinality(array(select unnest(m.helfen) intersect select unnest(o.suchen)))
          + cardinality(array(select unnest(o.zeiten) intersect select unnest(m.zeiten)))
          + case when o.niveau = m.niveau then 1 else 0 end)::int,
         exists (select 1 from lernpartner_anfrage a where a.status = 'offen' and ((a.von = m.nutzer_id and a.an = o.nutzer_id) or (a.von = o.nutzer_id and a.an = m.nutzer_id)))
    from lernpartner_profil m
    join lernpartner_profil o on o.stadt_schluessel = m.stadt_schluessel and o.abi_jahr = m.abi_jahr and o.nutzer_id <> m.nutzer_id
   where m.nutzer_id = auth.uid() and m.aktiv and o.aktiv
     and public.lp_darf(m.nutzer_id) and public.lp_darf(o.nutzer_id)
     and not public.lp_blockiert(m.nutzer_id, o.nutzer_id)
   order by 9 desc, o.aktualisiert desc
   limit 50
$$;

-- ---------- Anfragen ----------
-- Rückgabe: 'ok' | 'nicht_erlaubt' | 'nicht_gefunden' | 'limit' | 'offen' | 'gruppe' | 'gruppe_voll' | 'schon_drin' | 'ungueltig'
create or replace function public.lp_anfragen(an_id uuid, zeit_wahl text, ort_wahl text, gruppe bigint default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  m lernpartner_profil%rowtype;
  o lernpartner_profil%rowtype;
begin
  if not public.lp_darf(me) then return 'nicht_erlaubt'; end if;
  select * into m from lernpartner_profil where nutzer_id = me and aktiv;
  if not found then return 'nicht_erlaubt'; end if;
  select * into o from lernpartner_profil where nutzer_id = an_id and aktiv;
  if not found or o.stadt_schluessel <> m.stadt_schluessel or o.abi_jahr <> m.abi_jahr or an_id = me
     or not public.lp_darf(an_id) or public.lp_blockiert(me, an_id) then
    return 'nicht_gefunden';
  end if;
  if zeit_wahl not in ('wt-nachmittag', 'wt-abend', 'sa', 'so') or ort_wahl not in ('bibliothek', 'schule', 'cafe', 'lernraum') then return 'ungueltig'; end if;
  if (select count(*) from lernpartner_anfrage where von = me and erstellt > now() - interval '24 hours') >= 5 then return 'limit'; end if;
  if exists (select 1 from lernpartner_anfrage where status = 'offen' and ((von = me and an = an_id) or (von = an_id and an = me))) then return 'offen'; end if;
  if gruppe is not null then
    if not exists (select 1 from lernpartner_mitglied where gruppe_id = gruppe and nutzer_id = me) then return 'gruppe'; end if;
    if exists (select 1 from lernpartner_mitglied where gruppe_id = gruppe and nutzer_id = an_id) then return 'schon_drin'; end if;
    if (select count(*) from lernpartner_mitglied where gruppe_id = gruppe) >= 6 then return 'gruppe_voll'; end if;
  end if;
  insert into lernpartner_anfrage (von, an, gruppe_id, zeit, ort) values (me, an_id, gruppe, zeit_wahl, ort_wahl);
  return 'ok';
end;
$$;

-- Antworten. Angenommen: neue Gruppe aus beiden – oder Beitritt zur Gruppe der Anfrage.
-- Rückgabe: 'ok' | 'nicht_gefunden' | 'nicht_erlaubt' | 'gruppe_voll'
create or replace function public.lp_antworten(anfrage bigint, ja boolean)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  a lernpartner_anfrage%rowtype;
  pv lernpartner_profil%rowtype;
  pm lernpartner_profil%rowtype;
  g bigint;
begin
  select * into a from lernpartner_anfrage where id = anfrage and an = me and status = 'offen' for update;
  if not found then return 'nicht_gefunden'; end if;
  if not coalesce(ja, false) then
    update lernpartner_anfrage set status = 'abgelehnt', beantwortet = now() where id = anfrage;
    return 'ok';
  end if;
  if not public.lp_darf(me) or not public.lp_darf(a.von) or public.lp_blockiert(me, a.von) then return 'nicht_erlaubt'; end if;
  select * into pv from lernpartner_profil where nutzer_id = a.von;
  select * into pm from lernpartner_profil where nutzer_id = me;
  if pv.nutzer_id is null or pm.nutzer_id is null then return 'nicht_erlaubt'; end if;
  if a.gruppe_id is not null then
    if not exists (select 1 from lernpartner_mitglied where gruppe_id = a.gruppe_id and nutzer_id = a.von) then return 'nicht_gefunden'; end if;
    if (select count(*) from lernpartner_mitglied where gruppe_id = a.gruppe_id) >= 6 then return 'gruppe_voll'; end if;
    insert into lernpartner_mitglied (gruppe_id, nutzer_id) values (a.gruppe_id, me) on conflict do nothing;
  else
    insert into lernpartner_gruppe (name, stadt_schluessel, abi_jahr)
    values (left(pv.anzeigename || ' & ' || pm.anzeigename, 40), pv.stadt_schluessel, pv.abi_jahr) returning id into g;
    insert into lernpartner_mitglied (gruppe_id, nutzer_id) values (g, a.von), (g, me);
  end if;
  update lernpartner_anfrage set status = 'angenommen', beantwortet = now() where id = anfrage;
  return 'ok';
end;
$$;

create or replace function public.lp_zurueckziehen(anfrage bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update lernpartner_anfrage set status = 'zurueckgezogen', beantwortet = now() where id = anfrage and von = auth.uid() and status = 'offen';
  return found;
end;
$$;

-- ---------- Übersicht: Anfragen, Gruppen, Treffen ----------
create or replace function public.lp_meine()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'eingehend', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'von', a.von, 'name', p.anzeigename, 'schule', case when p.schule_zeigen then p.schule end,
        'niveau', p.niveau, 'helfen', p.helfen, 'suchen', p.suchen, 'zeit', a.zeit, 'ort', a.ort, 'gruppe', g.name, 'erstellt', a.erstellt) order by a.erstellt desc)
      from lernpartner_anfrage a join lernpartner_profil p on p.nutzer_id = a.von left join lernpartner_gruppe g on g.id = a.gruppe_id
      where a.an = auth.uid() and a.status = 'offen' and public.lp_darf(a.von)), '[]'::jsonb),
    'ausgehend', coalesce((select jsonb_agg(x.j order by x.erstellt desc) from (
        select jsonb_build_object('id', a.id, 'an', a.an, 'name', p.anzeigename, 'zeit', a.zeit, 'ort', a.ort, 'status', a.status, 'erstellt', a.erstellt) as j, a.erstellt
          from lernpartner_anfrage a join lernpartner_profil p on p.nutzer_id = a.an
         where a.von = auth.uid() order by a.erstellt desc limit 20) x), '[]'::jsonb),
    'gruppen', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name, 'satz_seed', g.satz_seed,
        'mitglieder', (select jsonb_agg(jsonb_build_object('id', m2.nutzer_id, 'name', p2.anzeigename, 'ich', m2.nutzer_id = auth.uid()) order by m2.beigetreten)
                         from lernpartner_mitglied m2 join lernpartner_profil p2 on p2.nutzer_id = m2.nutzer_id where m2.gruppe_id = g.id),
        'treffen', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'wann', t.wann, 'ort', t.ort, 'ort_name', t.ort_name, 'thema', t.thema,
              'zusagen', (select count(*) from lernpartner_zusage z where z.treffen_id = t.id and z.zusage),
              'absagen', (select count(*) from lernpartner_zusage z where z.treffen_id = t.id and not z.zusage),
              'meine', (select z.zusage from lernpartner_zusage z where z.treffen_id = t.id and z.nutzer_id = auth.uid())) order by t.wann)
            from lernpartner_treffen t where t.gruppe_id = g.id and t.wann > now() - interval '3 hours'), '[]'::jsonb)) order by g.erstellt)
      from lernpartner_gruppe g join lernpartner_mitglied m on m.gruppe_id = g.id and m.nutzer_id = auth.uid()), '[]'::jsonb)
  )
$$;

-- ---------- Treffen ----------
-- Rückgabe: 'ok' | 'gruppe' | 'zeit' | 'ort' | 'ort_name' | 'thema'
create or replace function public.lp_treffen_vorschlagen(gruppe bigint, zeitpunkt timestamptz, ort_wahl text, ortsname text, thema_wahl text default 'teila')
returns text
language plpgsql
security definer
set search_path = public
as $$
declare t bigint;
begin
  if not public.lp_darf(auth.uid()) or not exists (select 1 from lernpartner_mitglied where gruppe_id = gruppe and nutzer_id = auth.uid()) then return 'gruppe'; end if;
  if zeitpunkt is null or zeitpunkt < now() or zeitpunkt > now() + interval '60 days' then return 'zeit'; end if;
  if ort_wahl not in ('bibliothek', 'schule', 'cafe', 'lernraum') then return 'ort'; end if;
  if char_length(btrim(coalesce(ortsname, ''))) not between 2 and 60 or not public.lp_text_ok(ortsname) then return 'ort_name'; end if;
  if coalesce(thema_wahl, '') not in ('analysis', 'geometrie', 'stochastik', 'teila', 'muendlich') then return 'thema'; end if;
  if (select count(*) from lernpartner_treffen where gruppe_id = gruppe and lernpartner_treffen.wann > now()) >= 10 then return 'zeit'; end if;
  insert into lernpartner_treffen (gruppe_id, wann, ort, ort_name, thema, von) values (gruppe, zeitpunkt, ort_wahl, btrim(ortsname), thema_wahl, auth.uid()) returning id into t;
  insert into lernpartner_zusage (treffen_id, nutzer_id, zusage) values (t, auth.uid(), true);
  return 'ok';
end;
$$;

create or replace function public.lp_zusagen(treffen bigint, ja boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.lp_darf(auth.uid()) or not exists (select 1 from lernpartner_treffen t join lernpartner_mitglied m on m.gruppe_id = t.gruppe_id and m.nutzer_id = auth.uid() where t.id = treffen) then
    return false;
  end if;
  insert into lernpartner_zusage (treffen_id, nutzer_id, zusage) values (treffen, auth.uid(), coalesce(ja, false))
  on conflict (treffen_id, nutzer_id) do update set zusage = excluded.zusage;
  return true;
end;
$$;

create or replace function public.lp_gruppe_verlassen(gruppe bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from lernpartner_mitglied where gruppe_id = gruppe and nutzer_id = auth.uid();
  if not found then return false; end if;
  delete from lernpartner_gruppe g where g.id = gruppe and not exists (select 1 from lernpartner_mitglied m where m.gruppe_id = g.id);
  return true;
end;
$$;

-- ---------- Blockieren und Melden ----------
create or replace function public.lp_blockieren(an_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or an_id is null or an_id = auth.uid() then return false; end if;
  insert into lernpartner_block (von, an) values (auth.uid(), an_id) on conflict do nothing;
  update lernpartner_anfrage set status = 'zurueckgezogen', beantwortet = now()
   where status = 'offen' and ((von = auth.uid() and an = an_id) or (von = an_id and an = auth.uid()));
  return true;
end;
$$;

create or replace function public.lp_melden(an_id uuid, grund text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or an_id is null or an_id = auth.uid() or coalesce(grund, '') not in ('kontakt', 'belaestigung', 'fake', 'sonstiges') then return false; end if;
  if (select count(*) from lernpartner_meldung where von = auth.uid() and erstellt > now() - interval '24 hours') >= 10 then return false; end if;
  insert into lernpartner_meldung (von, an, grund) values (auth.uid(), an_id, grund);
  perform public.lp_blockieren(an_id);
  return true;
end;
$$;

-- ---------- Eltern: Freigabe für ihr Kind ----------
create or replace function public.lp_freigeben(kind uuid, ja boolean)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from eltern_kind ek join profile p on p.id = ek.eltern_id and p.rolle = 'eltern' where ek.eltern_id = auth.uid() and ek.kind_id = kind) then
    return 'nicht_verbunden';
  end if;
  if coalesce(ja, false) then
    insert into lernpartner_freigabe (kind_id, eltern_id) values (kind, auth.uid())
    on conflict (kind_id) do update set eltern_id = excluded.eltern_id, erteilt_am = now();
  else
    delete from lernpartner_freigabe where kind_id = kind;
    if public.lp_grund(kind) <> 'ok' then perform public.lp_aufraeumen(kind); end if;
  end if;
  return 'ok';
end;
$$;

create or replace function public.lp_kinder()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'name', split_part(p.name, ' ', 1),
      'freigabe', exists (select 1 from lernpartner_freigabe f where f.kind_id = p.id),
      'volljaehrig', p.volljaehrig_erklaert_am is not null, 'unter16', p.unter16,
      'teilnahme', exists (select 1 from lernpartner_profil lp where lp.nutzer_id = p.id and lp.aktiv),
      'gruppen', (select count(*) from lernpartner_mitglied m where m.nutzer_id = p.id)) order by p.name), '[]'::jsonb)
    from eltern_kind ek join profile p on p.id = ek.kind_id
   where ek.eltern_id = auth.uid() and p.rolle = 'schueler'
$$;

-- ---------- Rechte ----------
revoke all on function public.lp_grund(uuid), public.lp_darf(uuid), public.lp_blockiert(uuid, uuid), public.lp_aufraeumen(uuid),
  public.lp_status(), public.lp_profil_speichern(jsonb), public.lp_profil_loeschen(), public.lp_suchen(),
  public.lp_anfragen(uuid, text, text, bigint), public.lp_antworten(bigint, boolean), public.lp_zurueckziehen(bigint), public.lp_meine(),
  public.lp_treffen_vorschlagen(bigint, timestamptz, text, text, text), public.lp_zusagen(bigint, boolean), public.lp_gruppe_verlassen(bigint),
  public.lp_blockieren(uuid), public.lp_melden(uuid, text), public.lp_freigeben(uuid, boolean), public.lp_kinder()
  from public, anon, authenticated;
grant execute on function
  public.lp_status(), public.lp_profil_speichern(jsonb), public.lp_profil_loeschen(), public.lp_suchen(),
  public.lp_anfragen(uuid, text, text, bigint), public.lp_antworten(bigint, boolean), public.lp_zurueckziehen(bigint), public.lp_meine(),
  public.lp_treffen_vorschlagen(bigint, timestamptz, text, text, text), public.lp_zusagen(bigint, boolean), public.lp_gruppe_verlassen(bigint),
  public.lp_blockieren(uuid), public.lp_melden(uuid, text), public.lp_freigeben(uuid, boolean), public.lp_kinder()
  to authenticated;
