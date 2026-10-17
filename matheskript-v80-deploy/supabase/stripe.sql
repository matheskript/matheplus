-- ======================================================================
-- Stripe-Abos (Pro) – im Supabase-SQL-Editor EINMAL ausführen, NACH rollen.sql. Wiederholbar.
--
-- Ablauf: Eltern (oder volljährige Schüler) buchen über Stripe Checkout (api/stripe/checkout.js).
-- Stripe meldet Zahlungen an api/stripe/webhook.js; der Webhook ruft mit dem Service-Role-Key
-- pro_freischalten(ziel, bis, zahler) (rollen.sql) und die Funktionen unten auf.
-- Der Nutzer selbst kann nichts davon schreiben (nur lesen, was ihn betrifft).
-- ======================================================================

alter table public.profile add column if not exists stripe_kunde text;   -- Stripe-Kundennummer des Zahlers (cus_…)
create unique index if not exists profile_stripe_kunde_idx on public.profile (stripe_kunde) where stripe_kunde is not null;

-- Abos: ein Stripe-Abo je Zahler, das ein oder mehrere Schülerkonten freischaltet (Familie)
create table if not exists public.abos (
  abo_id     text primary key,                    -- sub_…
  zahler_id  uuid not null references public.profile (id) on delete cascade,
  plan       text not null check (plan in ('pro', 'familie')),
  status     text not null,                       -- Stripe-Status: active, trialing, past_due, canceled …
  laeuft_bis timestamptz,
  ziele      uuid[] not null default '{}',        -- freigeschaltete Konten
  geaendert  timestamptz not null default now()
);
alter table public.abos enable row level security;
drop policy if exists "abo_eigenes_lesen" on public.abos;
create policy "abo_eigenes_lesen" on public.abos for select using (auth.uid() = zahler_id or auth.uid() = any (ziele));
revoke insert, update, delete on public.abos from anon, authenticated;
grant select on public.abos to authenticated;

-- Verarbeitete Stripe-Ereignisse (jedes nur einmal)
create table if not exists public.stripe_ereignisse (
  ereignis_id text primary key,
  typ         text not null,
  zeit        timestamptz not null default now()
);
alter table public.stripe_ereignisse enable row level security;
revoke all on public.stripe_ereignisse from anon, authenticated;

-- Vom Webhook (Service-Role): Abo eintragen/aktualisieren und alle Ziele freischalten bzw. beenden
create or replace function public.abo_setzen(p_abo_id text, p_zahler uuid, p_plan text, p_status text, p_bis timestamptz, p_ziele uuid[], p_kunde text default null, p_ereignis text default null, p_typ text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  aktiv boolean := p_status in ('active', 'trialing', 'past_due');
  z uuid;
  zl uuid[];
  n integer := 0;
begin
  if p_ereignis is not null then
    insert into stripe_ereignisse (ereignis_id, typ) values (p_ereignis, coalesce(p_typ, '?')) on conflict do nothing;
    if not found then return jsonb_build_object('doppelt', true); end if;
  end if;
  if p_kunde is not null then update profile set stripe_kunde = p_kunde where id = p_zahler and stripe_kunde is distinct from p_kunde; end if;
  -- nur Konten, für die der Zahler zahlen darf (verbundene Kinder oder er selbst als Volljähriger)
  select coalesce(array_agg(z2), '{}'::uuid[]) into zl from unnest(coalesce(p_ziele, '{}'::uuid[])) as z2 where public.darf_bezahlen_fuer(p_zahler, z2);
  insert into abos (abo_id, zahler_id, plan, status, laeuft_bis, ziele, geaendert)
    values (p_abo_id, p_zahler, p_plan, p_status, p_bis, zl, now())
    on conflict (abo_id) do update set status = excluded.status, laeuft_bis = excluded.laeuft_bis,
      ziele = case when array_length(excluded.ziele, 1) is null then abos.ziele else excluded.ziele end, geaendert = now();
  select ziele into zl from abos where abo_id = p_abo_id;
  foreach z in array coalesce(zl, '{}'::uuid[]) loop
    if aktiv then
      perform public.pro_freischalten(z, p_bis, p_zahler); n := n + 1;
    else
      -- Abo beendet: Pro läuft zum Periodenende aus (bleibt bis p_bis, sonst sofort)
      update profile set plan = 'pro', pro_bis = coalesce(p_bis, now()) where id = z and plan = 'pro';
    end if;
  end loop;
  return jsonb_build_object('doppelt', false, 'aktiv', aktiv, 'freigeschaltet', n);
end;
$$;
revoke all on function public.abo_setzen(text, uuid, text, text, timestamptz, uuid[], text, text, text) from public, anon, authenticated;

-- Für die App: eigene Abos (als Zahler) mit Namen der Kinder
create or replace function public.meine_abos()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('abo_id', a.abo_id, 'plan', a.plan, 'status', a.status, 'laeuft_bis', a.laeuft_bis,
    'ziele', (select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name)), '[]'::jsonb) from profile p where p.id = any (a.ziele))) order by a.geaendert desc), '[]'::jsonb)
  from abos a where a.zahler_id = auth.uid();
$$;
revoke all on function public.meine_abos() from public, anon;
grant execute on function public.meine_abos() to authenticated;
