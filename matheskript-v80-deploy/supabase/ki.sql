-- ======================================================================
-- Mathilda-Kontingent je Konto – im Supabase-SQL-Editor EINMAL ausführen, NACH rollen.sql.
-- Das Skript ist wiederholbar.
--
-- Jede Anfrage an Mathilda (api/claude.js) zählt der Server über ki_verbrauchen() mit dem
-- Zugangstoken des angemeldeten Nutzers. Free-Konten haben ein Tageslimit (Standard 30, der
-- Server kann es per Umgebungsvariable KI_FREI_PRO_TAG überschreiben), Pro-Konten sind frei.
-- Die alte Idee eines Flags profile.ki_frei entfällt: angemeldet = freigeschaltet, mit Kontingent.
-- ======================================================================

create table if not exists public.ki_nutzung (
  nutzer_id uuid not null references auth.users (id) on delete cascade,
  tag       date not null,
  anzahl    integer not null default 0,
  geaendert timestamptz not null default now(),
  primary key (nutzer_id, tag)
);

alter table public.ki_nutzung enable row level security;
drop policy if exists "ki_eigene_zeile_lesen" on public.ki_nutzung;
create policy "ki_eigene_zeile_lesen" on public.ki_nutzung for select using (auth.uid() = nutzer_id);
revoke insert, update, delete on public.ki_nutzung from anon, authenticated;
grant select on public.ki_nutzung to authenticated;

-- Zählt eine Anfrage des angemeldeten Nutzers und sagt, ob sie erlaubt ist.
-- Liefert: erlaubt, anzahl (nach dem Zählen), limit (null = unbegrenzt), plan.
create or replace function public.ki_verbrauchen(frei_pro_tag integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  heute date := (now() at time zone 'Europe/Berlin')::date;
  p text;
  n integer;
  lim integer;
begin
  if uid is null then
    raise exception 'nicht_angemeldet';
  end if;
  p := coalesce(public.plan_aktiv(uid), 'free');
  lim := case when p = 'pro' then null else greatest(0, coalesce(frei_pro_tag, 30)) end;
  select anzahl into n from ki_nutzung where nutzer_id = uid and tag = heute;
  n := coalesce(n, 0);
  if lim is not null and n >= lim then
    return jsonb_build_object('erlaubt', false, 'anzahl', n, 'limit', lim, 'plan', p);
  end if;
  insert into ki_nutzung (nutzer_id, tag, anzahl) values (uid, heute, 1)
    on conflict (nutzer_id, tag) do update set anzahl = ki_nutzung.anzahl + 1, geaendert = now();
  return jsonb_build_object('erlaubt', true, 'anzahl', n + 1, 'limit', lim, 'plan', p);
end;
$$;

-- Nur lesen: wie viel ist heute verbraucht (für die Anzeige in der App)
create or replace function public.ki_stand(frei_pro_tag integer default 30)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'anzahl', coalesce((select anzahl from ki_nutzung where nutzer_id = auth.uid() and tag = (now() at time zone 'Europe/Berlin')::date), 0),
    'limit', case when coalesce(public.plan_aktiv(auth.uid()), 'free') = 'pro' then null else greatest(0, coalesce(frei_pro_tag, 30)) end,
    'plan', coalesce(public.plan_aktiv(auth.uid()), 'free'));
$$;

revoke all on function public.ki_verbrauchen(integer) from public, anon;
grant execute on function public.ki_verbrauchen(integer) to authenticated;
revoke all on function public.ki_stand(integer) from public, anon;
grant execute on function public.ki_stand(integer) to authenticated;

-- Alte Zeilen aufräumen (vom Server oder von Hand, z. B. monatlich)
create or replace function public.ki_nutzung_aufraeumen()
returns void
language sql
security definer
set search_path = public
as $$ delete from ki_nutzung where tag < current_date - 60; $$;
revoke all on function public.ki_nutzung_aufraeumen() from public, anon, authenticated;
