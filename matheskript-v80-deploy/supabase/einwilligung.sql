-- ======================================================================
-- Eltern-Einwilligung für Schüler unter 16 (DSGVO Art. 8, § 25 TDDDG)
-- Im Supabase-SQL-Editor ausführen, NACH schema.sql, rollen.sql, lernstand.sql,
-- entdecken.sql, ki.sql, perf-lab.sql. Das Skript ist wiederholbar.
--
-- Grundidee
--   * Jeder Schüler gibt beim Anlegen an, ob er unter 16 ist (Selbstauskunft).
--   * Unter 16 darf das Konto existieren (Name, Rolle), aber nichts weiter wird im
--     Konto gespeichert, bis ein Elternteil zugestimmt hat. Die App läuft dann nur
--     auf dem Gerät weiter (wie ohne Konto).
--   * Ein Elternteil stimmt über den geheimen Link /einwilligung?k=<eltern_token> zu
--     (ohne eigenes Konto möglich) oder in seinem Elternkonto. Gespeichert wird ein
--     Nachweis: wer, welche Mail, welcher Umfang, wann, welche Textfassung.
--   * Umfang in drei Teilen: 'konto' (Lernstand, Noten, Fortschritt im Konto),
--     'ki' (Mathilda über Anthropic), 'klassen' (Klassen beitreten, Lehrkraft sieht Fortschritt).
--   * Widerruf jederzeit über denselben Link oder das Elternkonto. Dann werden die
--     auf Einwilligung gespeicherten Lerndaten gelöscht und Klassen verlassen.
--
-- Durchgesetzt wird das in der Datenbank selbst (nicht nur in der Oberfläche):
--   restriktive Policies auf den Lerntabellen, Trigger auf klassen_mitglieder und
--   profile.noten, und ki_verbrauchen() fragt einwilligung_ok(uid, 'ki').
-- ======================================================================

-- ---------- Altersangabe im Profil ----------
alter table public.profile add column if not exists unter16 boolean;              -- null = noch nicht angegeben
alter table public.profile add column if not exists alter_angegeben_am timestamptz;

-- ---------- Nachweis der Einwilligungen ----------
create table if not exists public.eltern_einwilligungen (
  id            bigint generated always as identity primary key,
  kind_id       uuid not null references public.profile (id) on delete cascade,
  eltern_name   text not null check (char_length(eltern_name) between 2 and 120),
  eltern_email  text not null check (char_length(eltern_email) between 3 and 200),
  eltern_konto  uuid references auth.users (id) on delete set null,   -- gesetzt, wenn über das Elternkonto erteilt
  konto         boolean not null default true,
  ki            boolean not null default false,
  klassen       boolean not null default false,
  textfassung   text not null default '2026-10-18',
  erteilt_am    timestamptz not null default now(),
  widerrufen_am timestamptz,
  bestaetigt_am timestamptz       -- später: Klick in der Bestätigungs-Mail (Double-Opt-in)
);
create index if not exists eltern_einwilligungen_kind_idx on public.eltern_einwilligungen (kind_id);
alter table public.eltern_einwilligungen enable row level security;
revoke all on public.eltern_einwilligungen from anon, authenticated;
-- Lesen nur über die Funktionen unten.

-- Aktuell gültige Einwilligung eines Kindes (jüngste, nicht widerrufene)
create or replace function public.einwilligung_aktuell(kid uuid)
returns public.eltern_einwilligungen
language sql
stable
security definer
set search_path = public
as $$
  select * from eltern_einwilligungen
   where kind_id = kid and widerrufen_am is null
   order by erteilt_am desc limit 1;
$$;

-- Darf für diesen Nutzer in diesem Bereich gespeichert / verarbeitet werden?
-- bereich: 'konto' | 'ki' | 'klassen'
create or replace function public.einwilligung_ok(uid uuid, bereich text default 'konto')
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  p profile%rowtype;
  e eltern_einwilligungen%rowtype;
begin
  if uid is null then return false; end if;
  select * into p from profile where id = uid;
  if not found then return false; end if;
  if p.rolle <> 'schueler' then return true; end if;
  if p.unter16 is null then return false; end if;          -- erst Alter angeben
  if p.unter16 = false then return true; end if;
  e := public.einwilligung_aktuell(uid);
  if e.id is null then return false; end if;
  return case bereich when 'ki' then e.konto and e.ki
                      when 'klassen' then e.konto and e.klassen
                      else e.konto end;
end;
$$;

-- ---------- Schüler: Alter angeben ----------
create or replace function public.alter_angeben(ist_unter16 boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or ist_unter16 is null then return false; end if;
  update profile set unter16 = ist_unter16, alter_angegeben_am = now()
   where id = auth.uid() and rolle = 'schueler';
  return found;
end;
$$;

-- Status für die eigene Oberfläche (Schüler)
create or replace function public.meine_einwilligung()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  p profile%rowtype;
  e eltern_einwilligungen%rowtype;
begin
  select * into p from profile where id = auth.uid();
  if not found then return jsonb_build_object('status', 'kein_profil'); end if;
  e := public.einwilligung_aktuell(p.id);
  return jsonb_build_object(
    'unter16', p.unter16,
    'konto', public.einwilligung_ok(p.id, 'konto'),
    'ki', public.einwilligung_ok(p.id, 'ki'),
    'klassen', public.einwilligung_ok(p.id, 'klassen'),
    'erteilt_am', e.erteilt_am,
    'von', e.eltern_name);
end;
$$;

-- ---------- Eltern ohne Konto: über den geheimen Link ----------
create or replace function public.einwilligung_info(token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  k profile%rowtype;
  e eltern_einwilligungen%rowtype;
begin
  select * into k from profile where eltern_token = lower(btrim(coalesce(token, ''))) and rolle = 'schueler';
  if not found then return jsonb_build_object('status', 'ungueltig'); end if;
  e := public.einwilligung_aktuell(k.id);
  return jsonb_build_object(
    'status', 'ok',
    'vorname', split_part(btrim(k.name), ' ', 1),
    'unter16', k.unter16,
    'erteilt', e.id is not null,
    'erteilt_am', e.erteilt_am,
    'von', e.eltern_name,
    'konto', coalesce(e.konto, false), 'ki', coalesce(e.ki, false), 'klassen', coalesce(e.klassen, false));
end;
$$;

-- Gemeinsamer Kern: neue Einwilligung speichern (ersetzt eine frühere)
create or replace function public.einwilligung_speichern(kid uuid, e_name text, e_mail text, mit_ki boolean, mit_klassen boolean, konto_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  n text := btrim(coalesce(e_name, ''));
  m text := lower(btrim(coalesce(e_mail, '')));
begin
  if char_length(n) < 2 or char_length(n) > 120 then raise exception 'ew_name'; end if;
  if m !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(m) > 200 then raise exception 'ew_mail'; end if;
  update eltern_einwilligungen set widerrufen_am = now() where kind_id = kid and widerrufen_am is null;
  insert into eltern_einwilligungen (kind_id, eltern_name, eltern_email, eltern_konto, konto, ki, klassen)
  values (kid, n, m, konto_id, true, coalesce(mit_ki, false), coalesce(mit_klassen, false));
  -- Umfang verkleinert? Dann Klassen verlassen, die nicht mehr gedeckt sind.
  if not coalesce(mit_klassen, false) and to_regclass('public.klassen_mitglieder') is not null then
    execute 'delete from public.klassen_mitglieder where schueler_id = $1' using kid;
  end if;
  return jsonb_build_object('status', 'ok');
end;
$$;

create or replace function public.einwilligung_erteilen(token text, e_name text, e_mail text, mit_ki boolean default false, mit_klassen boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  k profile%rowtype;
begin
  select * into k from profile where eltern_token = lower(btrim(coalesce(token, ''))) and rolle = 'schueler';
  if not found then return jsonb_build_object('status', 'ungueltig'); end if;
  if k.id = auth.uid() then return jsonb_build_object('status', 'selbst'); end if;   -- das Kind kann nicht für sich selbst zustimmen
  return public.einwilligung_speichern(k.id, e_name, e_mail, mit_ki, mit_klassen, auth.uid());
end;
$$;

-- Löscht, was nur mit Einwilligung gespeichert werden durfte
create or replace function public.einwilligungsdaten_loeschen(kid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  t text;
begin
  foreach t in array array['lernstand', 'entdecken_fortschritt', 'perf_ereignisse', 'perf_aufgaben', 'perf_runden', 'perf_badges', 'ki_nutzung'] loop
    if to_regclass('public.' || t) is not null then
      execute format('delete from public.%I where nutzer_id = $1', t) using kid;
    end if;
  end loop;
  if to_regclass('public.klassen_mitglieder') is not null then
    execute 'delete from public.klassen_mitglieder where schueler_id = $1' using kid;
  end if;
  update profile set noten = '{}'::jsonb, schulform = null, klasse = null where id = kid;
end;
$$;

create or replace function public.einwilligung_widerrufen(token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  k profile%rowtype;
begin
  select * into k from profile where eltern_token = lower(btrim(coalesce(token, ''))) and rolle = 'schueler';
  if not found then return jsonb_build_object('status', 'ungueltig'); end if;
  update eltern_einwilligungen set widerrufen_am = now() where kind_id = k.id and widerrufen_am is null;
  if k.unter16 then perform public.einwilligungsdaten_loeschen(k.id); end if;
  return jsonb_build_object('status', 'ok');
end;
$$;

-- ---------- Eltern mit Konto: für verbundene Kinder ----------
create or replace function public.einwilligung_kinder()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', p.id,
           'vorname', split_part(btrim(p.name), ' ', 1),
           'unter16', p.unter16,
           'erteilt', e.id is not null,
           'erteilt_am', e.erteilt_am,
           'von', e.eltern_name,
           'ki', coalesce(e.ki, false),
           'klassen', coalesce(e.klassen, false)) order by p.name), '[]'::jsonb)
    from eltern_kind ek
    join profile p on p.id = ek.kind_id
    left join lateral (select * from public.einwilligung_aktuell(p.id)) e on true
   where ek.eltern_id = auth.uid() and p.unter16 is true;
$$;

create or replace function public.einwilligung_als_eltern(kid uuid, mit_ki boolean, mit_klassen boolean)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  me profile%rowtype;
  mail text;
begin
  select * into me from profile where id = auth.uid();
  if not found or me.rolle <> 'eltern' then return jsonb_build_object('status', 'keine_eltern'); end if;
  if not exists (select 1 from eltern_kind where eltern_id = me.id and kind_id = kid) then
    return jsonb_build_object('status', 'nicht_verbunden');
  end if;
  select email into mail from auth.users where id = me.id;
  return public.einwilligung_speichern(kid, me.name, coalesce(mail, 'unbekannt@konto.local'), mit_ki, mit_klassen, me.id);
end;
$$;

create or replace function public.einwilligung_widerrufen_als_eltern(kid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from eltern_kind where eltern_id = auth.uid() and kind_id = kid) then
    return jsonb_build_object('status', 'nicht_verbunden');
  end if;
  update eltern_einwilligungen set widerrufen_am = now() where kind_id = kid and widerrufen_am is null;
  if (select unter16 from profile where id = kid) then perform public.einwilligungsdaten_loeschen(kid); end if;
  return jsonb_build_object('status', 'ok');
end;
$$;

-- ---------- Durchsetzung in der Datenbank ----------
-- Restriktive Policies: zusätzlich zu den bestehenden „eigene Zeile“-Regeln muss die Einwilligung passen.
do $$
declare
  t text;
begin
  foreach t in array array['lernstand', 'entdecken_fortschritt', 'perf_ereignisse', 'perf_aufgaben', 'perf_runden', 'perf_badges'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists "einwilligung_einfuegen" on public.%I', t);
      execute format('drop policy if exists "einwilligung_aendern" on public.%I', t);
      execute format('create policy "einwilligung_einfuegen" on public.%I as restrictive for insert to authenticated with check (public.einwilligung_ok(auth.uid(), ''konto''))', t);
      execute format('create policy "einwilligung_aendern" on public.%I as restrictive for update to authenticated using (public.einwilligung_ok(auth.uid(), ''konto''))', t);
    end if;
  end loop;
end;
$$;

-- Klassen beitreten nur mit Einwilligung für Klassen
create or replace function public.einwilligung_klasse_pruefen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.einwilligung_ok(new.schueler_id, 'klassen') then
    raise exception 'eltern_einwilligung_fehlt';
  end if;
  return new;
end;
$$;
do $$
begin
  if to_regclass('public.klassen_mitglieder') is not null then
    execute 'drop trigger if exists einwilligung_klasse on public.klassen_mitglieder';
    execute 'create trigger einwilligung_klasse before insert on public.klassen_mitglieder for each row execute function public.einwilligung_klasse_pruefen()';
  end if;
end;
$$;

-- Noten, Schulform, Klasse nur mit Einwilligung (der Name bleibt immer änderbar)
create or replace function public.einwilligung_profil_pruefen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = new.id and new.rolle = 'schueler'
     and (new.noten is distinct from old.noten or new.schulform is distinct from old.schulform or new.klasse is distinct from old.klasse)
     and not public.einwilligung_ok(new.id, 'konto') then
    raise exception 'eltern_einwilligung_fehlt';
  end if;
  return new;
end;
$$;
drop trigger if exists einwilligung_profil on public.profile;
create trigger einwilligung_profil before update on public.profile
  for each row execute function public.einwilligung_profil_pruefen();

-- ---------- Rechte ----------
revoke all on function public.einwilligung_aktuell(uuid), public.einwilligung_speichern(uuid, text, text, boolean, boolean, uuid),
  public.einwilligungsdaten_loeschen(uuid), public.einwilligung_klasse_pruefen(), public.einwilligung_profil_pruefen()
  from public, anon, authenticated;
revoke all on function public.einwilligung_ok(uuid, text) from public, anon;
grant execute on function public.einwilligung_ok(uuid, text) to authenticated;
revoke all on function public.alter_angeben(boolean), public.meine_einwilligung(), public.einwilligung_kinder(),
  public.einwilligung_als_eltern(uuid, boolean, boolean), public.einwilligung_widerrufen_als_eltern(uuid) from public, anon;
grant execute on function public.alter_angeben(boolean), public.meine_einwilligung(), public.einwilligung_kinder(),
  public.einwilligung_als_eltern(uuid, boolean, boolean), public.einwilligung_widerrufen_als_eltern(uuid) to authenticated;
revoke all on function public.einwilligung_info(text), public.einwilligung_erteilen(text, text, text, boolean, boolean),
  public.einwilligung_widerrufen(text) from public;
grant execute on function public.einwilligung_info(text), public.einwilligung_erteilen(text, text, text, boolean, boolean),
  public.einwilligung_widerrufen(text) to anon, authenticated;
