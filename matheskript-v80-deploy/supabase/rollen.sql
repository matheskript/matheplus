-- ======================================================================
-- Rollen, Eltern-Verknüpfung, Klassen und Plan – im Supabase-SQL-Editor EINMAL ausführen,
-- NACH schema.sql, lernstand.sql und entdecken.sql. Das Skript ist wiederholbar.
--
-- Konto-Arten (profile.rolle): schueler · eltern · lehrkraft · nachhilfe
--   · Schüler registrieren sich selbst. Eltern/Lehrkräfte/Nachhilfelehrer ebenfalls.
--   · Eltern ↔ Schüler: Der Schüler schickt seinen Eltern-Link (mit geheimem Token) per WhatsApp.
--     Wer sich darüber als Elternteil anmeldet, wird automatisch verbunden. Mehrere Elternteile
--     pro Kind, mehrere Kinder pro Elternteil. Der Schüler kann jederzeit trennen oder den Link erneuern.
--   · Lehrkraft/Nachhilfelehrer legen Klassen/Gruppen an (Schulform G8/G9/GMS + Klassenstufe) und
--     bekommen einen Beitrittscode. Der SCHÜLER tritt selbst bei (= erkennt die Lehrkraft an).
--     Eine Klasse hat genau eine Lehrkraft. Ein Schüler kann in mehreren Klassen sein.
--   · Plan (free/pro) hat jedes Konto. Pro setzt nur der Server (Zahlung, später) – nie der Nutzer.
--
-- Sicherheit: Alle Tabellen mit Row Level Security. Verknüpfungen und Klassen werden nur über
-- die Funktionen unten verändert (security definer), nie direkt. Was Eltern/Lehrkräfte von einem
-- Schüler sehen, steht an GENAU EINER Stelle: schueler_zusammenfassung() und schueler_detail().
-- ======================================================================

-- ---------- Profil: Rolle, Plan, Eltern-Token ----------
alter table public.profile add column if not exists rolle text not null default 'schueler';
alter table public.profile drop constraint if exists profile_rolle_check;
alter table public.profile add constraint profile_rolle_check check (rolle in ('schueler', 'eltern', 'lehrkraft', 'nachhilfe'));

alter table public.profile add column if not exists plan text not null default 'free';
alter table public.profile drop constraint if exists profile_plan_check;
alter table public.profile add constraint profile_plan_check check (plan in ('free', 'pro'));
alter table public.profile add column if not exists pro_bis timestamptz;                  -- leer + plan 'pro' = unbefristet
alter table public.profile add column if not exists volljaehrig_erklaert_am timestamptz;  -- Selbstauskunft; echter Nachweis folgt mit der Zahlung

-- Geheimes Token für den Eltern-Link (nur der Schüler selbst sieht es, nicht öffentlich wie der Empfehlungscode)
alter table public.profile add column if not exists eltern_token text;
update public.profile set eltern_token = substr(replace(gen_random_uuid()::text, '-', ''), 1, 16) where eltern_token is null;
alter table public.profile alter column eltern_token set default substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
alter table public.profile alter column eltern_token set not null;
create unique index if not exists profile_eltern_token_idx on public.profile (eltern_token);

-- Früher vergebene Empfehlungscodes bleiben gültig, wenn jemand später eine Wunschzahl festlegt
alter table public.profile add column if not exists ref_frueher text[] not null default '{}';

-- Geschlecht der Schüler:innen: 'm' = Schüler, 'w' = Schülerin (Auswahl bei der Anmeldung, damit die
-- Anrede ohne Gendersprache eindeutig ist). Leer bei Eltern/Lehrkräften und bei älteren Konten.
alter table public.profile add column if not exists geschlecht text;
alter table public.profile drop constraint if exists profile_geschlecht_check;
alter table public.profile add constraint profile_geschlecht_check check (geschlecht in ('m', 'w'));

-- Die Rolle wählt der Nutzer beim Anlegen; Plan, Token und Rest kann er nicht selbst schreiben.
grant insert (id, name, schulform, klasse, noten, rolle, geschlecht) on public.profile to authenticated;
grant update (geschlecht) on public.profile to authenticated;

-- ---------- Empfehlungscodes: alte Codes bleiben gültig ----------
create or replace function public.werber_setzen(code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  w uuid;
  c text := replace(code, ' ', '');
begin
  select id into w from profile where ref_code = c or c = any (ref_frueher) limit 1;
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

create or replace function public.ref_frei(code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.ref_gueltig(code)
     and not exists (select 1 from profile where (ref_code = code or code = any (ref_frueher)) and id <> auth.uid());
$$;

create or replace function public.ref_festlegen(code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  alt text;
begin
  if not public.ref_gueltig(code) then return 'ungueltig'; end if;
  if exists (select 1 from profile where id = auth.uid() and ref_fest) then return 'schon_fest'; end if;
  if exists (select 1 from profile where (ref_code = code or code = any (ref_frueher)) and id <> auth.uid()) then return 'vergeben'; end if;
  select ref_code into alt from profile where id = auth.uid();
  update profile
     set ref_code = code, ref_fest = true,
         ref_frueher = case when alt is not null and alt <> code then array_append(ref_frueher, alt) else ref_frueher end
   where id = auth.uid();
  return 'ok';
exception when unique_violation then
  return 'vergeben';
end;
$$;

-- ---------- Eltern ↔ Kind ----------
create table if not exists public.eltern_kind (
  eltern_id uuid not null references public.profile (id) on delete cascade,
  kind_id   uuid not null references public.profile (id) on delete cascade,
  erstellt  timestamptz not null default now(),
  primary key (eltern_id, kind_id),
  check (eltern_id <> kind_id)
);
create index if not exists eltern_kind_kind_idx on public.eltern_kind (kind_id);
alter table public.eltern_kind enable row level security;
drop policy if exists "eltern_kind_lesen" on public.eltern_kind;
create policy "eltern_kind_lesen" on public.eltern_kind for select using (auth.uid() in (eltern_id, kind_id));
revoke all on public.eltern_kind from anon, authenticated;
grant select on public.eltern_kind to authenticated;

-- ---------- Klassen und Gruppen ----------
create or replace function public.neuer_klassencode()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  abc constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';     -- ohne 0/O/1/I
  kandidat text;
begin
  loop
    kandidat := '';
    for i in 1..6 loop
      kandidat := kandidat || substr(abc, 1 + floor(random() * length(abc))::int, 1);
    end loop;
    exit when not exists (select 1 from klassen where klassen.code = kandidat);
  end loop;
  return kandidat;
end;
$$;

create table if not exists public.klassen (
  id           uuid primary key default gen_random_uuid(),
  lehrkraft_id uuid not null references public.profile (id) on delete cascade,
  art          text not null check (art in ('schule', 'nachhilfe')),
  name         text not null check (char_length(name) between 1 and 60),
  schulform    text not null check (schulform in ('G8', 'G9', 'GMS')),
  stufe        smallint not null check (stufe between 5 and 13),
  code         text not null unique default public.neuer_klassencode(),
  erstellt     timestamptz not null default now(),
  check (not (schulform = 'G8' and stufe > 12))
);
create index if not exists klassen_lehrkraft_idx on public.klassen (lehrkraft_id);

create table if not exists public.klassen_mitglieder (
  klasse_id   uuid not null references public.klassen (id) on delete cascade,
  schueler_id uuid not null references public.profile (id) on delete cascade,
  beigetreten timestamptz not null default now(),
  primary key (klasse_id, schueler_id)
);
create index if not exists klassen_mitglieder_schueler_idx on public.klassen_mitglieder (schueler_id);

alter table public.klassen enable row level security;
alter table public.klassen_mitglieder enable row level security;
drop policy if exists "klassen_lesen" on public.klassen;
-- Eigene Klassen als Lehrkraft, oder Klassen, in denen ich Mitglied bin. (Die Mitglieder-Policy verweist
-- nicht zurück auf klassen – so gibt es keine Endlosschleife.)
create policy "klassen_lesen" on public.klassen for select
  using (lehrkraft_id = auth.uid() or id in (select klasse_id from public.klassen_mitglieder where schueler_id = auth.uid()));
drop policy if exists "mitglieder_lesen" on public.klassen_mitglieder;
create policy "mitglieder_lesen" on public.klassen_mitglieder for select using (schueler_id = auth.uid());
revoke all on public.klassen, public.klassen_mitglieder from anon, authenticated;
grant select on public.klassen, public.klassen_mitglieder to authenticated;

-- ---------- Plan ----------
create or replace function public.plan_aktiv(pid uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case when p.plan = 'pro' and (p.pro_bis is null or p.pro_bis > now()) then 'pro' else 'free' end
    from profile p where p.id = pid;
$$;

-- Wer darf für wen bezahlen? Eltern für ihre Kinder; ein Schüler nur für sich, wenn er volljährig erklärt hat.
create or replace function public.darf_bezahlen_fuer(zahler uuid, ziel uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (zahler = ziel and exists (select 1 from profile p where p.id = ziel and (p.rolle <> 'schueler' or p.volljaehrig_erklaert_am is not null)))
      or exists (select 1 from eltern_kind ek where ek.eltern_id = zahler and ek.kind_id = ziel);
$$;

-- Nur der Server (service_role / SQL-Editor, später der Zahlungs-Webhook) setzt Pro – nie der Nutzer selbst.
create or replace function public.pro_freischalten(ziel uuid, bis timestamptz default null, zahler uuid default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if zahler is not null and not public.darf_bezahlen_fuer(zahler, ziel) then
    raise exception 'zahler_nicht_berechtigt';
  end if;
  update profile set plan = 'pro', pro_bis = bis where id = ziel;
  return found;
end;
$$;

create or replace function public.volljaehrig_erklaeren()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update profile set volljaehrig_erklaert_am = coalesce(volljaehrig_erklaert_am, now())
   where id = auth.uid() and rolle = 'schueler';
  return found;
end;
$$;

-- ---------- Sichtbarkeit: was Eltern und Lehrkräfte von einem Schüler sehen ----------
-- ZENTRALE STELLE. Aktuell ist alles freigegeben; Einschränkungen werden hier (und in schueler_detail)
-- gesetzt, nirgendwo sonst.
create or replace function public.darf_sehen(betrachter uuid, schueler uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select betrachter is not null and (
    exists (select 1 from eltern_kind ek where ek.eltern_id = betrachter and ek.kind_id = schueler)
    or exists (select 1 from klassen_mitglieder m join klassen k on k.id = m.klasse_id
                where m.schueler_id = schueler and k.lehrkraft_id = betrachter)
  );
$$;

-- Kompakte Zusammenfassung für Listen (Wochenübersicht, Ampel): letzte 14 Tage Aktivität + Fortschritt in „Mathe entdecken“.
create or replace function public.schueler_zusammenfassung(sid uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  p profile%rowtype;
  l jsonb;
  e jsonb;
  tage jsonb;
begin
  select * into p from profile where id = sid;
  if not found then return null; end if;
  select daten into l from lernstand where nutzer_id = sid;
  select daten into e from entdecken_fortschritt where nutzer_id = sid;
  select coalesce(jsonb_object_agg(kv.key, jsonb_build_object(
           's', round(coalesce((kv.value ->> 'sekunden')::numeric, 0))::int,
           'a', round(coalesce((kv.value ->> 'aufgaben')::numeric, 0))::int,
           'r', round(coalesce((kv.value ->> 'richtig')::numeric, 0))::int)), '{}'::jsonb)
    into tage
    from jsonb_each(case when jsonb_typeof(l -> 'aktivitaet') = 'object' then l -> 'aktivitaet' else '{}'::jsonb end) kv
   where kv.key >= to_char(current_date - 13, 'YYYY-MM-DD');
  return jsonb_build_object(
    'id', p.id, 'name', p.name, 'schulform', p.schulform, 'klasse', p.klasse,
    'plan', public.plan_aktiv(p.id),
    'letzte_aktivitaet', case when jsonb_typeof(l -> 'letzteAktivitaet') = 'number' then l -> 'letzteAktivitaet' else null end,
    'tage', tage,
    'entdecken', jsonb_build_object(
      'potenz_phase', coalesce((e #>> '{potenz,phase}')::int, 0),
      'potenz_fertig', coalesce((e #>> '{potenz,fertig}')::boolean, false),
      'potenz_schritte', coalesce((select sum(x::int) from jsonb_array_elements_text(case when jsonb_typeof(e #> '{potenz,stand}') = 'array' then e #> '{potenz,stand}' else '[]'::jsonb end) x), 0),
      'video_haupt', coalesce((e #>> '{video,haupt,an}')::boolean, false),
      'reflexion_n', coalesce((select count(*) from jsonb_each(case when jsonb_typeof(e -> 'reflexion') = 'object' then e -> 'reflexion' else '{}'::jsonb end) r
                                where coalesce(r.value ->> 'wahl', '') <> '' or char_length(coalesce(r.value ->> 'text', '')) >= 3), 0)));
end;
$$;

-- Alles zu einem Schüler (Detailansicht). Nur für verbundene Eltern und die Lehrkraft einer seiner Klassen.
create or replace function public.schueler_detail(sid uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.darf_sehen(auth.uid(), sid) then return null; end if;
  return jsonb_build_object(
    'zusammenfassung', public.schueler_zusammenfassung(sid),
    'noten', (select noten from profile where id = sid),
    'lernstand', (select daten from lernstand where nutzer_id = sid),
    'entdecken', (select daten from entdecken_fortschritt where nutzer_id = sid));
end;
$$;

-- ---------- Eltern verbinden ----------
create or replace function public.eltern_verbinden(token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me profile%rowtype;
  kind profile%rowtype;
begin
  select * into me from profile where id = auth.uid();
  if not found or me.rolle <> 'eltern' then return jsonb_build_object('status', 'keine_eltern'); end if;
  select * into kind from profile where eltern_token = lower(btrim(token)) and rolle = 'schueler';
  if not found then return jsonb_build_object('status', 'ungueltig'); end if;
  if exists (select 1 from eltern_kind where eltern_id = me.id and kind_id = kind.id) then
    return jsonb_build_object('status', 'schon', 'name', kind.name);
  end if;
  if (select count(*) from eltern_kind where kind_id = kind.id) >= 6 then
    return jsonb_build_object('status', 'zu_viele');
  end if;
  insert into eltern_kind (eltern_id, kind_id) values (me.id, kind.id);
  return jsonb_build_object('status', 'ok', 'name', kind.name);
end;
$$;

create or replace function public.verbindung_loesen(partner uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from eltern_kind
   where (eltern_id = auth.uid() and kind_id = partner) or (kind_id = auth.uid() and eltern_id = partner);
  return found;
end;
$$;

create or replace function public.eltern_token_erneuern()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  t text := substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
begin
  update profile set eltern_token = t where id = auth.uid() and rolle = 'schueler';
  if not found then return null; end if;
  return t;
end;
$$;

-- ---------- Klassen: anlegen, beitreten, verwalten ----------
create or replace function public.klasse_anlegen(k_name text, k_schulform text, k_stufe int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me profile%rowtype;
  neu klassen%rowtype;
begin
  select * into me from profile where id = auth.uid();
  if not found or me.rolle not in ('lehrkraft', 'nachhilfe') then return jsonb_build_object('status', 'keine_lehrkraft'); end if;
  if k_schulform not in ('G8', 'G9', 'GMS') or k_stufe not between 5 and 13 or (k_schulform = 'G8' and k_stufe > 12) then
    return jsonb_build_object('status', 'ungueltig');
  end if;
  if char_length(btrim(coalesce(k_name, ''))) not between 1 and 60 then return jsonb_build_object('status', 'ungueltig'); end if;
  insert into klassen (lehrkraft_id, art, name, schulform, stufe)
  values (me.id, case when me.rolle = 'nachhilfe' then 'nachhilfe' else 'schule' end, btrim(k_name), k_schulform, k_stufe)
  returning * into neu;
  return jsonb_build_object('status', 'ok', 'id', neu.id, 'code', neu.code);
end;
$$;

create or replace function public.klasse_beitreten(k_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me profile%rowtype;
  k klassen%rowtype;
begin
  select * into me from profile where id = auth.uid();
  if not found or me.rolle <> 'schueler' then return jsonb_build_object('status', 'kein_schueler'); end if;
  select * into k from klassen where code = upper(btrim(k_code));
  if not found then return jsonb_build_object('status', 'ungueltig'); end if;
  if exists (select 1 from klassen_mitglieder where klasse_id = k.id and schueler_id = me.id) then
    return jsonb_build_object('status', 'schon', 'name', k.name);
  end if;
  insert into klassen_mitglieder (klasse_id, schueler_id) values (k.id, me.id);
  return jsonb_build_object('status', 'ok', 'name', k.name, 'art', k.art,
    'lehrkraft', (select name from profile where id = k.lehrkraft_id));
end;
$$;

-- Vor dem Beitritt anzeigen, wem man beitritt (ohne bereits Mitglied zu sein).
create or replace function public.klasse_vorschau(k_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select jsonb_build_object('name', k.name, 'art', k.art, 'schulform', k.schulform, 'stufe', k.stufe,
                           'lehrkraft', p.name)
                     from klassen k join profile p on p.id = k.lehrkraft_id
                    where k.code = upper(btrim(k_code))), jsonb_build_object('status', 'ungueltig'));
$$;

create or replace function public.klasse_verlassen(k_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from klassen_mitglieder where klasse_id = k_id and schueler_id = auth.uid();
  return found;
end;
$$;

create or replace function public.klasse_schueler_entfernen(k_id uuid, s_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from klassen_mitglieder m using klassen k
   where m.klasse_id = k.id and k.id = k_id and k.lehrkraft_id = auth.uid() and m.schueler_id = s_id;
  return found;
end;
$$;

create or replace function public.klasse_loeschen(k_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from klassen where id = k_id and lehrkraft_id = auth.uid();
  return found;
end;
$$;

create or replace function public.klasse_code_neu(k_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  c text := public.neuer_klassencode();
begin
  update klassen set code = c where id = k_id and lehrkraft_id = auth.uid();
  if not found then return null; end if;
  return c;
end;
$$;

-- Rolle ändern: nur solange das Konto noch nichts verknüpft hat.
create or replace function public.rolle_wechseln(neue_rolle text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if neue_rolle not in ('schueler', 'eltern', 'lehrkraft', 'nachhilfe') then return false; end if;
  if exists (select 1 from eltern_kind where eltern_id = auth.uid() or kind_id = auth.uid())
     or exists (select 1 from klassen where lehrkraft_id = auth.uid())
     or exists (select 1 from klassen_mitglieder where schueler_id = auth.uid()) then
    return false;
  end if;
  update profile set rolle = neue_rolle where id = auth.uid();
  return found;
end;
$$;

-- ---------- Übersichten für die Oberfläche ----------
-- Elternteil: alle verbundenen Kinder.
create or replace function public.meine_kinder()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(public.schueler_zusammenfassung(ek.kind_id) order by p.name), '[]'::jsonb)
    from eltern_kind ek join profile p on p.id = ek.kind_id
   where ek.eltern_id = auth.uid();
$$;

-- Lehrkraft/Nachhilfelehrer: eigene Klassen nach Klassenstufe sortiert, darin die Schüler.
create or replace function public.klassen_uebersicht()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', k.id, 'name', k.name, 'art', k.art, 'schulform', k.schulform, 'stufe', k.stufe, 'code', k.code,
           'schueler', coalesce((select jsonb_agg(public.schueler_zusammenfassung(m.schueler_id) order by p.name)
                                   from klassen_mitglieder m join profile p on p.id = m.schueler_id
                                  where m.klasse_id = k.id), '[]'::jsonb))
         order by k.stufe, k.name), '[]'::jsonb)
    from klassen k where k.lehrkraft_id = auth.uid();
$$;

-- Schüler (und alle anderen): wer ist mit mir verbunden?
create or replace function public.meine_beziehungen()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'eltern', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'seit', ek.erstellt) order by ek.erstellt)
                          from eltern_kind ek join profile p on p.id = ek.eltern_id where ek.kind_id = auth.uid()), '[]'::jsonb),
    'kinder', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'seit', ek.erstellt) order by p.name)
                          from eltern_kind ek join profile p on p.id = ek.kind_id where ek.eltern_id = auth.uid()), '[]'::jsonb),
    'klassen', coalesce((select jsonb_agg(jsonb_build_object('id', k.id, 'name', k.name, 'art', k.art, 'schulform', k.schulform,
                                  'stufe', k.stufe, 'lehrkraft', l.name, 'seit', m.beigetreten) order by k.stufe, k.name)
                           from klassen_mitglieder m join klassen k on k.id = m.klasse_id join profile l on l.id = k.lehrkraft_id
                          where m.schueler_id = auth.uid()), '[]'::jsonb));
$$;

-- ---------- Rechte ----------
-- Interne Hilfen: nur andere Funktionen dürfen sie aufrufen.
revoke all on function public.plan_aktiv(uuid), public.darf_bezahlen_fuer(uuid, uuid), public.darf_sehen(uuid, uuid),
  public.schueler_zusammenfassung(uuid), public.neuer_klassencode() from public, anon, authenticated;
-- Pro setzt nur der Server.
revoke all on function public.pro_freischalten(uuid, timestamptz, uuid) from public, anon, authenticated;
-- Alles andere dürfen angemeldete Nutzer aufrufen; jede Funktion prüft selbst, wer sie ist.
revoke all on function public.volljaehrig_erklaeren(), public.schueler_detail(uuid), public.eltern_verbinden(text), public.verbindung_loesen(uuid),
  public.eltern_token_erneuern(), public.klasse_anlegen(text, text, int), public.klasse_beitreten(text), public.klasse_vorschau(text),
  public.klasse_verlassen(uuid), public.klasse_schueler_entfernen(uuid, uuid), public.klasse_loeschen(uuid), public.klasse_code_neu(uuid),
  public.rolle_wechseln(text), public.meine_kinder(), public.klassen_uebersicht(), public.meine_beziehungen() from public, anon;
grant execute on function public.volljaehrig_erklaeren(), public.schueler_detail(uuid), public.eltern_verbinden(text), public.verbindung_loesen(uuid),
  public.eltern_token_erneuern(), public.klasse_anlegen(text, text, int), public.klasse_beitreten(text), public.klasse_vorschau(text),
  public.klasse_verlassen(uuid), public.klasse_schueler_entfernen(uuid, uuid), public.klasse_loeschen(uuid), public.klasse_code_neu(uuid),
  public.rolle_wechseln(text), public.meine_kinder(), public.klassen_uebersicht(), public.meine_beziehungen() to authenticated;
revoke all on function public.werber_setzen(text), public.ref_frei(text), public.ref_festlegen(text) from public, anon;
grant execute on function public.werber_setzen(text), public.ref_frei(text), public.ref_festlegen(text) to authenticated;
