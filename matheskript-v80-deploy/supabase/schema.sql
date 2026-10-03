-- ======================================================================
-- Mythos Mathe – Konten, Profile, Empfehlungen
-- Einmal im Supabase-Dashboard unter „SQL Editor“ ausführen.
-- ======================================================================

-- Jeder Empfehlungscode ist eine eigene sechsstellige Zahl: mythosmathe.de/482913
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
-- Käufe und Abos (Stripe). Geschrieben wird NUR vom Server (Webhook mit
-- Service-Role-Schlüssel); jeder Nutzer darf seine eigenen Zeilen lesen.
-- ======================================================================
create table if not exists public.berechtigungen (
  nutzer          uuid not null references auth.users (id) on delete cascade,
  produkt         text not null check (produkt in ('analysis1', 'unlimited')),
  status          text not null check (status in ('aktiv', 'gekuendigt', 'beendet', 'ueberfaellig', 'erstattet')),
  bis             timestamptz,            -- Abo: Ende der bezahlten Periode; Kurs: null = unbefristet
  kuendigung_zum  timestamptz,            -- Abo gekündigt zum …
  stripe_kunde    text,
  stripe_abo      text,
  stripe_zahlung  text,                   -- PaymentIntent beim Einmalkauf (für Erstattungen)
  aktualisiert    timestamptz not null default now(),
  primary key (nutzer, produkt)
);
create index if not exists berechtigungen_zahlung_idx on public.berechtigungen (stripe_zahlung);

alter table public.berechtigungen enable row level security;
drop policy if exists "rechte_lesen" on public.berechtigungen;
create policy "rechte_lesen" on public.berechtigungen for select using (auth.uid() = nutzer);
revoke all on public.berechtigungen from anon, authenticated;
grant select on public.berechtigungen to authenticated;

-- Kündigungen und Widerrufe (Kündigungsbutton / Widerrufsfunktion).
-- Nur der Server schreibt und liest; im Dashboard unter „Table Editor“ einsehbar.
create table if not exists public.vertragsmeldungen (
  id              uuid primary key default gen_random_uuid(),
  art             text not null check (art in ('kuendigung', 'widerruf')),
  name            text not null,
  email           text not null,
  vertrag         text,
  kuendigungsart  text,
  grund           text,
  nachricht       text,
  ergebnis        text,
  eingang         timestamptz not null default now(),
  erledigt        boolean not null default false
);
alter table public.vertragsmeldungen enable row level security;
revoke all on public.vertragsmeldungen from anon, authenticated;


-- ======================================================================
-- Event-Buchungen (z. B. Elternabend). Plätze werden beim Start des
-- Bezahlvorgangs 30 Minuten reserviert; nur der Server schreibt.
-- ======================================================================
create table if not exists public.eventbuchungen (
  id              uuid primary key default gen_random_uuid(),
  event           text not null,
  name            text not null,
  email           text not null,
  plaetze         smallint not null check (plaetze between 1 and 4),
  status          text not null default 'reserviert' check (status in ('reserviert', 'bezahlt', 'storniert', 'erstattet')),
  laeuft_ab       timestamptz not null,
  stripe_session  text,
  stripe_zahlung  text,
  erstellt        timestamptz not null default now()
);
create index if not exists eventbuchungen_event_idx on public.eventbuchungen (event, status);
alter table public.eventbuchungen enable row level security;
revoke all on public.eventbuchungen from anon, authenticated;

-- Belegte Plätze: bezahlt + noch gültige Reservierungen.
create or replace function public.event_belegt(ev text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(plaetze), 0)::int from eventbuchungen
   where event = ev and (status = 'bezahlt' or (status = 'reserviert' and laeuft_ab > now()));
$$;

-- Atomar reservieren: gibt die neue Buchungs-ID zurück oder null, wenn es nicht mehr passt.
create or replace function public.event_reservieren(ev text, anzahl int, maximum int, kunde_name text, kunde_email text, minuten int)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  neu uuid;
begin
  perform pg_advisory_xact_lock(hashtext(ev));
  if public.event_belegt(ev) + anzahl > maximum then
    return null;
  end if;
  insert into eventbuchungen (event, name, email, plaetze, laeuft_ab)
  values (ev, kunde_name, kunde_email, anzahl, now() + make_interval(mins => minuten))
  returning id into neu;
  return neu;
end;
$$;

revoke all on function public.event_belegt(text) from public, anon, authenticated;
revoke all on function public.event_reservieren(text, int, int, text, text, int) from public, anon, authenticated;
grant execute on function public.event_belegt(text) to service_role;
grant execute on function public.event_reservieren(text, int, int, text, text, int) to service_role;
grant all on public.eventbuchungen to service_role;
grant all on public.berechtigungen to service_role;
grant all on public.vertragsmeldungen to service_role;
