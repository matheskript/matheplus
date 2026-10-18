-- ======================================================================
-- Mathe Abi Masterclass – persönliche Zugangslinks.
-- Im Supabase-SQL-Editor EINMAL ausführen, NACH rollen.sql und ki.sql. Das Skript ist wiederholbar.
--
-- Jeder Teilnehmer bekommt einen eigenen Link: https://mythosmathe.de/masterclass/zugang?z=MC7K2Q9XFAH3
-- Beim Einlösen (angemeldet) wird der Code an sein Konto gebunden. Das Konto bekommt
--   · masterclass_bis / masterclass_gruppe im Profil (Kurs „Masterclass“ offen),
--   · Pro bis zum Kursende (Mathilda ohne Tageslimit, alle Pro-Inhalte).
-- Ein Code gilt für genau ein Konto. Sperren: update masterclass_zugaenge set gesperrt = true where nr = …;
--
-- NEUE LINKS ANLEGEN (hier im SQL-Editor):
--   select * from public.masterclass_links_anlegen(20, 'Masterclass 2026/27', '2027-07-31');
-- Die Ergebnisliste (nr, code, link) an die Teilnehmer schicken. Namen nachtragen:
--   update public.masterclass_zugaenge set name = 'Lena' where nr = 1;
-- Übersicht:  select nr, name, gruppe, laeuft_bis, eingeloest_am, gesperrt from public.masterclass_zugaenge order by nr;
--
-- Die Prüfzeichen rechnet die App genauso (src/masterclassToken.js, middleware.js).
-- ======================================================================

alter table public.profile add column if not exists masterclass_bis timestamptz;
alter table public.profile add column if not exists masterclass_gruppe text;

create table if not exists public.masterclass_zugaenge (
  token         text primary key check (token ~ '^MC[0-9A-HJKMNP-TV-Z]{10}$'),
  nr            serial unique,
  name          text,                                   -- freiwillig, für die Begrüßung
  gruppe        text not null default 'Masterclass',
  laeuft_bis    timestamptz not null,
  nutzer        uuid references auth.users (id) on delete set null,
  eingeloest_am timestamptz,
  gesperrt      boolean not null default false,
  notiz         text,
  angelegt      timestamptz not null default now()
);
alter table public.masterclass_zugaenge enable row level security;
revoke all on public.masterclass_zugaenge from anon, authenticated;

-- Zwei Prüfzeichen aus SHA-256('mythosmathe-masterclass-v1:' || körper), erste 10 Bit, Crockford-Alphabet
create or replace function public.masterclass_pruefzeichen(koerper text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  alph constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  h bytea := sha256(convert_to('mythosmathe-masterclass-v1:' || koerper, 'UTF8'));
  v integer := (get_byte(h, 0) << 2) | (get_byte(h, 1) >> 6);
begin
  return substr(alph, (v >> 5) + 1, 1) || substr(alph, (v & 31) + 1, 1);
end;
$$;

-- Nur im SQL-Editor (Service-Rolle): n neue Codes anlegen
create or replace function public.masterclass_links_anlegen(anzahl integer, p_gruppe text default 'Masterclass', p_bis date default (now() + interval '7 months')::date, basis text default 'https://mythosmathe.de')
returns table (nr integer, code text, link text)
language plpgsql
security definer
set search_path = public
as $$
declare
  alph constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  k text; t text; i integer; j integer; b bytea;
begin
  for i in 1 .. greatest(0, least(anzahl, 500)) loop
    loop
      b := uuid_send(gen_random_uuid());   -- 16 starke Zufallsbytes, ohne pgcrypto
      k := '';
      for j in 0 .. 7 loop k := k || substr(alph, (get_byte(b, j) & 31) + 1, 1); end loop;
      t := 'MC' || k || public.masterclass_pruefzeichen(k);
      exit when not exists (select 1 from masterclass_zugaenge z where z.token = t);
    end loop;
    insert into masterclass_zugaenge (token, gruppe, laeuft_bis) values (t, coalesce(p_gruppe, 'Masterclass'), (p_bis + 1)::timestamptz);
    return query select z.nr, z.token, basis || '/masterclass/zugang?z=' || z.token from masterclass_zugaenge z where z.token = t;
  end loop;
end;
$$;
revoke all on function public.masterclass_links_anlegen(integer, text, date, text) from public, anon, authenticated;

-- Öffentlich (auch ohne Konto): taugt der Code? Verrät nur Vornamen und Gruppe.
create or replace function public.masterclass_link_pruefen(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select jsonb_build_object(
      'gueltig', not z.gesperrt and z.laeuft_bis > now() and (z.nutzer is null or z.nutzer = auth.uid()),
      'grund', case when z.gesperrt then 'gesperrt' when z.laeuft_bis <= now() then 'abgelaufen'
                    when z.nutzer is not null and z.nutzer is distinct from auth.uid() then 'vergeben' else null end,
      'name', split_part(coalesce(z.name, ''), ' ', 1),
      'gruppe', z.gruppe,
      'bis', z.laeuft_bis,
      'eingeloest_hier', z.nutzer is not null and z.nutzer = auth.uid())
    from masterclass_zugaenge z where z.token = upper(p_token)),
    jsonb_build_object('gueltig', false, 'grund', 'unbekannt'));
$$;
revoke all on function public.masterclass_link_pruefen(text) from public;
grant execute on function public.masterclass_link_pruefen(text) to anon, authenticated;

-- Angemeldet: Code an das eigene Konto binden, Kurs und Pro freischalten
create or replace function public.masterclass_einloesen(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  z masterclass_zugaenge%rowtype;
begin
  if uid is null then raise exception 'mc_nicht_angemeldet'; end if;
  select * into z from masterclass_zugaenge where token = upper(p_token) for update;
  if not found then raise exception 'mc_unbekannt'; end if;
  if z.gesperrt then raise exception 'mc_gesperrt'; end if;
  if z.laeuft_bis <= now() then raise exception 'mc_abgelaufen'; end if;
  if z.nutzer is not null and z.nutzer <> uid then raise exception 'mc_vergeben'; end if;

  update masterclass_zugaenge set nutzer = uid, eingeloest_am = coalesce(eingeloest_am, now()) where token = z.token;
  update profile set
    masterclass_bis = greatest(coalesce(masterclass_bis, z.laeuft_bis), z.laeuft_bis),
    masterclass_gruppe = z.gruppe,
    -- unbefristetes Pro bleibt unbefristet, sonst Pro mindestens bis Kursende
    pro_bis = case when plan = 'pro' and pro_bis is null then null else greatest(coalesce(pro_bis, z.laeuft_bis), z.laeuft_bis) end,
    plan = 'pro'
  where id = uid;
  if not found then raise exception 'mc_kein_profil'; end if;
  return jsonb_build_object('ok', true, 'name', split_part(coalesce(z.name, ''), ' ', 1), 'gruppe', z.gruppe, 'bis', z.laeuft_bis);
end;
$$;
revoke all on function public.masterclass_einloesen(text) from public, anon;
grant execute on function public.masterclass_einloesen(text) to authenticated;

-- Zugang sperren und den Kurs im Profil zurücknehmen. Im SQL-Editor:
--   select public.masterclass_sperren(3);
create or replace function public.masterclass_sperren(p_nr integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare u uuid; z masterclass_zugaenge%rowtype;
begin
  update masterclass_zugaenge set gesperrt = true where nr = p_nr returning * into z;
  if not found then return false; end if;
  -- Pro, das genau aus diesem Zugang kommt (pro_bis = Kursende), endet mit; ein bezahltes Abo bleibt unberührt
  if z.nutzer is not null then
    update profile set masterclass_bis = now(),
      pro_bis = case when plan = 'pro' and pro_bis = z.laeuft_bis then now() else pro_bis end
    where id = z.nutzer;
  end if;
  return true;
end;
$$;
revoke all on function public.masterclass_sperren(integer) from public, anon, authenticated;
