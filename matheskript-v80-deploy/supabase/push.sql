-- ======================================================================
-- Push-Erinnerungen der App (PWA) – im Supabase-SQL-Editor EINMAL ausführen
-- (nach lernstand.sql). Jedes Gerät, auf dem jemand Erinnerungen erlaubt,
-- ist eine Zeile. Versand: api/cron/push.js (Vercel Cron, täglich) – nur an
-- Konten, die an diesem Tag (deutsche Zeit) noch nicht geübt haben.
-- ======================================================================
create table if not exists public.push_abos (
  endpoint   text primary key check (char_length(endpoint) <= 1000),
  nutzer_id  uuid not null references auth.users (id) on delete cascade,
  p256dh     text not null check (char_length(p256dh) <= 200),
  auth       text not null check (char_length(auth) <= 100),
  erstellt   timestamptz not null default now(),
  zuletzt    timestamptz
);
create index if not exists push_abos_nutzer_idx on public.push_abos (nutzer_id);
alter table public.push_abos enable row level security;
drop policy if exists "push_eigene" on public.push_abos;
create policy "push_eigene" on public.push_abos for select using (auth.uid() = nutzer_id);
revoke all on public.push_abos from anon, authenticated;
grant select on public.push_abos to authenticated;

create or replace function public.push_abo_speichern(p_endpoint text, p_p256dh text, p_auth text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return jsonb_build_object('status', 'nicht_angemeldet'); end if;
  if p_endpoint !~ '^https://' then return jsonb_build_object('status', 'ungueltig'); end if;
  insert into push_abos (endpoint, nutzer_id, p256dh, auth) values (p_endpoint, auth.uid(), p_p256dh, p_auth)
    on conflict (endpoint) do update set nutzer_id = auth.uid(), p256dh = excluded.p256dh, auth = excluded.auth;
  return jsonb_build_object('status', 'ok');
end;
$$;

create or replace function public.push_abo_loeschen(p_endpoint text)
returns jsonb
language sql
volatile
security definer
set search_path = public
as $$
  delete from push_abos where endpoint = p_endpoint and nutzer_id = auth.uid();
  select jsonb_build_object('status', 'ok');
$$;

-- Nur Server: Geräte, deren Konto heute noch nicht geübt hat und heute noch keine Erinnerung bekam
create or replace function public.push_empfaenger()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with heute as (select to_char((now() at time zone 'Europe/Berlin')::date, 'YYYY-MM-DD') as t)
  select coalesce(jsonb_agg(jsonb_build_object('endpoint', a.endpoint, 'p256dh', a.p256dh, 'auth', a.auth, 'name', split_part(trim(coalesce(p.name, '')), ' ', 1))), '[]'::jsonb)
    from push_abos a
    left join profile p on p.id = a.nutzer_id
    left join lernstand l on l.nutzer_id = a.nutzer_id, heute
   where (a.zuletzt is null or (a.zuletzt at time zone 'Europe/Berlin')::date < (now() at time zone 'Europe/Berlin')::date)
     and coalesce((l.daten #>> array['aktivitaet', heute.t, 'aufgaben'])::numeric, 0) = 0;
$$;

-- Nur Server: gesendet markieren bzw. abgelaufene Geräte entfernen
create or replace function public.push_ergebnis(gesendet text[], weg text[])
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update push_abos set zuletzt = now() where endpoint = any (gesendet);
  delete from push_abos where endpoint = any (weg);
$$;

revoke all on function public.push_empfaenger(), public.push_ergebnis(text[], text[]) from public, anon, authenticated;
grant execute on function public.push_empfaenger(), public.push_ergebnis(text[], text[]) to service_role;
revoke all on function public.push_abo_speichern(text, text, text), public.push_abo_loeschen(text) from public, anon;
grant execute on function public.push_abo_speichern(text, text, text), public.push_abo_loeschen(text) to authenticated;
