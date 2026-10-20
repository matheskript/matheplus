-- ======================================================================
-- „Mein Mathe-Training“: Aufträge von Coach und Lehrkraft im Tagesplan eines Schülers – im Supabase-SQL-Editor
-- EINMAL ausführen (nach rollen.sql). Wiederholbar (idempotent).
--
-- Was gespeichert wird:
--   · training_auftraege – ein Auftrag (Titel, Zeile, Ziel in der App, Fälligkeit) von einem Coach (Rolle nachhilfe)
--     oder einer Lehrkraft (Rolle lehrkraft) an einen verbundenen Schüler; der Schüler hakt ihn ab
--   · training_freigabe – Schalter des Schülers: Darf die Lehrkraft Einträge in meinen Plan legen? (Coach darf immer)
-- Der eigentliche Lernstand (Themen, Tagespläne, Nachholen) liegt wie bisher in public.lernstand (lernstand.sql).
--
-- Sicherheit: Row Level Security; Schreiben nur über security-definer-Funktionen, die die Verbindung prüfen
-- (darf_sehen aus rollen.sql: Eltern ↔ Kind, Lehrkraft/Coach ↔ Klasse bzw. Gruppe).
-- ======================================================================
create table if not exists public.training_auftraege (
  id          uuid primary key default gen_random_uuid(),
  schueler_id uuid not null references public.profile (id) on delete cascade,
  von_id      uuid not null references public.profile (id) on delete cascade,
  titel       text not null check (char_length(titel) between 1 and 120),
  zeile       text not null default '' check (char_length(zeile) <= 200),
  ziel        jsonb check (ziel is null or (jsonb_typeof(ziel) = 'object' and pg_column_size(ziel) < 2000)),
  faellig     date,
  erstellt    timestamptz not null default now(),
  erledigt    timestamptz,
  check (schueler_id <> von_id)
);
create index if not exists training_auftraege_schueler_idx on public.training_auftraege (schueler_id, erledigt);
create index if not exists training_auftraege_von_idx on public.training_auftraege (von_id, erstellt);

create table if not exists public.training_freigabe (
  nutzer_id      uuid primary key references public.profile (id) on delete cascade,
  lehrer_erlaubt boolean not null default false,
  geaendert      timestamptz not null default now()
);

alter table public.training_auftraege enable row level security;
alter table public.training_freigabe enable row level security;
drop policy if exists "auftraege_lesen" on public.training_auftraege;
create policy "auftraege_lesen" on public.training_auftraege for select using (auth.uid() in (schueler_id, von_id));
drop policy if exists "freigabe_eigene" on public.training_freigabe;
create policy "freigabe_eigene" on public.training_freigabe for select using (auth.uid() = nutzer_id);
revoke all on public.training_auftraege, public.training_freigabe from anon, authenticated;
grant select on public.training_auftraege, public.training_freigabe to authenticated;

-- ---------- Schalter des Schülers ----------
create or replace function public.lehrer_freigeben(erlaubt boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return false; end if;
  insert into training_freigabe (nutzer_id, lehrer_erlaubt, geaendert) values (auth.uid(), coalesce(erlaubt, false), now())
  on conflict (nutzer_id) do update set lehrer_erlaubt = excluded.lehrer_erlaubt, geaendert = now();
  return coalesce(erlaubt, false);
end;
$$;

create or replace function public.lehrer_freigabe()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select lehrer_erlaubt from training_freigabe where nutzer_id = auth.uid()), false);
$$;

-- ---------- Auftrag geben (Coach immer, Lehrkraft nur mit Freigabe des Schülers) ----------
create or replace function public.auftrag_geben(schueler uuid, titel text, zeile text default '', ziel jsonb default null, faellig date default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  me profile%rowtype;
  neu uuid;
begin
  select * into me from profile where id = auth.uid();
  if not found or me.rolle not in ('lehrkraft', 'nachhilfe') then return jsonb_build_object('status', 'keine_lehrkraft'); end if;
  if not darf_sehen(me.id, schueler) then return jsonb_build_object('status', 'nicht_verbunden'); end if;
  if me.rolle = 'lehrkraft' and not coalesce((select lehrer_erlaubt from training_freigabe where nutzer_id = schueler), false) then
    return jsonb_build_object('status', 'keine_freigabe');
  end if;
  if btrim(coalesce(titel, '')) = '' then return jsonb_build_object('status', 'leer'); end if;
  if (select count(*) from training_auftraege a where a.schueler_id = schueler and a.von_id = me.id and a.erledigt is null) >= 10 then
    return jsonb_build_object('status', 'zu_viele');
  end if;
  insert into training_auftraege (schueler_id, von_id, titel, zeile, ziel, faellig)
  values (schueler, me.id, left(btrim(titel), 120), left(coalesce(zeile, ''), 200), ziel, faellig)
  returning id into neu;
  return jsonb_build_object('status', 'ok', 'id', neu);
end;
$$;

-- ---------- Aufträge des angemeldeten Schülers: offene und die der letzten 30 Tage ----------
create or replace function public.meine_auftraege()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', a.id, 'titel', a.titel, 'zeile', a.zeile, 'ziel', a.ziel, 'faellig', a.faellig, 'erstellt', a.erstellt, 'erledigt', a.erledigt,
    'absender', coalesce(p.name, ''), 'rolle', coalesce(p.rolle, '')) order by a.erledigt nulls first, a.faellig nulls last, a.erstellt), '[]'::jsonb)
  from training_auftraege a left join profile p on p.id = a.von_id
  where a.schueler_id = auth.uid() and (a.erledigt is null or a.erledigt > now() - interval '30 days');
$$;

-- ---------- Abhaken (nur der Schüler selbst) ----------
create or replace function public.auftrag_erledigt(aid uuid, zurueck boolean default false)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  update training_auftraege set erledigt = case when zurueck then null else now() end
  where id = aid and schueler_id = auth.uid();
  return found;
end;
$$;

-- ---------- Für Coach/Lehrkraft: gegebene Aufträge eines Schülers lesen, löschen ----------
create or replace function public.auftraege_fuer(schueler uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'titel', a.titel, 'zeile', a.zeile, 'ziel', a.ziel, 'faellig', a.faellig, 'erstellt', a.erstellt, 'erledigt', a.erledigt)
    order by a.erledigt nulls first, a.erstellt desc), '[]'::jsonb)
  from training_auftraege a
  where a.schueler_id = schueler and a.von_id = auth.uid() and darf_sehen(auth.uid(), schueler);
$$;

create or replace function public.auftrag_loeschen(aid uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  delete from training_auftraege where id = aid and von_id = auth.uid();
  return found;
end;
$$;

grant execute on function public.lehrer_freigeben(boolean), public.lehrer_freigabe(), public.auftrag_geben(uuid, text, text, jsonb, date),
  public.meine_auftraege(), public.auftrag_erledigt(uuid, boolean), public.auftraege_fuer(uuid), public.auftrag_loeschen(uuid) to authenticated;
