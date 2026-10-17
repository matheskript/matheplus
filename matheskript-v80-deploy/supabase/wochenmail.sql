-- ======================================================================
-- Eltern-Wochenmail – im Supabase-SQL-Editor EINMAL ausführen (nach rollen.sql).
--
-- Eltern, die mit ihrem Kind verbunden sind (eltern_kind), bekommen sonntags
-- eine kurze Mail: Lernzeit, gelöste Aufgaben, Trefferquote, aktive Tage –
-- keine Noten, keine Einzelfehler. Standard: an. Abmelden per Link in jeder
-- Mail (Token) oder in der App.
--
-- Verschickt wird von api/cron/wochenmail.js (Vercel Cron). Die Funktion
-- wochenmail_daten() darf nur der Server mit dem Service-Role-Schlüssel aufrufen.
-- ======================================================================
create table if not exists public.wochenmail (
  eltern_id  uuid primary key references public.profile (id) on delete cascade,
  an         boolean not null default true,
  token      text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  zuletzt    timestamptz,
  geaendert  timestamptz not null default now()
);
alter table public.wochenmail enable row level security;
drop policy if exists "wochenmail_lesen" on public.wochenmail;
create policy "wochenmail_lesen" on public.wochenmail for select using (auth.uid() = eltern_id);
revoke all on public.wochenmail from anon, authenticated;
grant select on public.wochenmail to authenticated;

-- In der App: an/aus (legt die Zeile bei Bedarf an)
create or replace function public.wochenmail_setzen(einschalten boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return jsonb_build_object('status', 'nicht_angemeldet'); end if;
  insert into wochenmail (eltern_id, an) values (auth.uid(), einschalten)
    on conflict (eltern_id) do update set an = excluded.an, geaendert = now();
  return jsonb_build_object('status', 'ok', 'an', einschalten);
end;
$$;

create or replace function public.wochenmail_stand()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object('an', coalesce((select an from wochenmail where eltern_id = auth.uid()), true),
                            'zuletzt', (select zuletzt from wochenmail where eltern_id = auth.uid()));
$$;

-- Abmelden ohne Anmeldung, per Link aus der Mail
create or replace function public.wochenmail_abmelden(t text)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  update wochenmail set an = false, geaendert = now() where token = t;
  return found;
end;
$$;

-- Nur Server: alle Empfänger mit ihren Kindern und den Tageswerten der letzten 7 Tage
create or replace function public.wochenmail_daten()
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, auth
as $$
declare
  r jsonb;
begin
  -- jedes Elternteil mit Verbindung bekommt eine Zeile (Standard an)
  insert into wochenmail (eltern_id)
    select distinct ek.eltern_id from eltern_kind ek
     where not exists (select 1 from wochenmail w where w.eltern_id = ek.eltern_id);
  select coalesce(jsonb_agg(jsonb_build_object(
           'eltern_id', p.id, 'name', p.name, 'email', u.email, 'token', w.token,
           'kinder', (select coalesce(jsonb_agg(public.schueler_zusammenfassung(ek.kind_id) order by k.name), '[]'::jsonb)
                        from eltern_kind ek join profile k on k.id = ek.kind_id where ek.eltern_id = p.id))), '[]'::jsonb)
    into r
    from wochenmail w join profile p on p.id = w.eltern_id join auth.users u on u.id = p.id
   where w.an and u.email is not null and p.rolle = 'eltern'
     and (w.zuletzt is null or w.zuletzt < now() - interval '5 days')
     and exists (select 1 from eltern_kind ek where ek.eltern_id = p.id);
  return r;
end;
$$;

create or replace function public.wochenmail_gesendet(ids uuid[])
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update wochenmail set zuletzt = now() where eltern_id = any (ids);
$$;

revoke all on function public.wochenmail_daten(), public.wochenmail_gesendet(uuid[]) from public, anon, authenticated;
grant execute on function public.wochenmail_daten(), public.wochenmail_gesendet(uuid[]) to service_role;
revoke all on function public.wochenmail_setzen(boolean), public.wochenmail_stand() from public, anon;
grant execute on function public.wochenmail_setzen(boolean), public.wochenmail_stand() to authenticated;
revoke all on function public.wochenmail_abmelden(text) from public;
grant execute on function public.wochenmail_abmelden(text) to anon, authenticated, service_role;
