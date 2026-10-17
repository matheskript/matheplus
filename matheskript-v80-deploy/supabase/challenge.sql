-- ======================================================================
-- Klassen-Challenge – im Supabase-SQL-Editor EINMAL ausführen (nach rollen.sql, lernstand.sql).
--
-- Die Lehrkraft schaltet die Challenge für eine ihrer Klassen ein. Alle Mitglieder
-- sehen dann eine Wochenrangliste: Punkte = richtig gelöste Aufgaben in der
-- laufenden Kalenderwoche (Mo–So, deutsche Zeit) aus lernstand.aktivitaet.
-- Datenschutz: In der Rangliste steht nur ein Spitzname (selbst gewählt) oder der
-- Vorname – nie der volle Name, keine weiteren Werte. Wer will, kann sich ausblenden.
-- ======================================================================
alter table public.klassen add column if not exists challenge_an boolean not null default false;
alter table public.klassen_mitglieder add column if not exists spitzname text check (spitzname is null or char_length(spitzname) between 2 and 20);
alter table public.klassen_mitglieder add column if not exists challenge_sichtbar boolean not null default true;

-- Punkte eines Schülers für die Woche, die mit `montag` beginnt
create or replace function public.challenge_punkte(sid uuid, montag date)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(least(
           coalesce((kv.value ->> 'richtig')::numeric, 0),
           coalesce((kv.value ->> 'aufgaben')::numeric, 0)))::int, 0)
    from lernstand l,
         jsonb_each(case when jsonb_typeof(l.daten -> 'aktivitaet') = 'object' then l.daten -> 'aktivitaet' else '{}'::jsonb end) kv
   where l.nutzer_id = sid
     and kv.key >= to_char(montag, 'YYYY-MM-DD') and kv.key <= to_char(montag + 6, 'YYYY-MM-DD');
$$;

create or replace function public.challenge_rangliste(k_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  k klassen%rowtype;
  heute date := (now() at time zone 'Europe/Berlin')::date;
  montag date := heute - ((extract(isodow from heute)::int) - 1);
  ist_lehrkraft boolean;
  liste jsonb;
  vorwoche jsonb;
begin
  select * into k from klassen where id = k_id;
  if not found then return jsonb_build_object('status', 'unbekannt'); end if;
  ist_lehrkraft := k.lehrkraft_id = auth.uid();
  if not ist_lehrkraft and not exists (select 1 from klassen_mitglieder where klasse_id = k_id and schueler_id = auth.uid()) then
    return jsonb_build_object('status', 'kein_zugang');
  end if;
  if not k.challenge_an and not ist_lehrkraft then return jsonb_build_object('status', 'aus', 'klasse', k.name); end if;

  select coalesce(jsonb_agg(x order by (x ->> 'punkte')::int desc, x ->> 'name'), '[]'::jsonb) into liste from (
    select jsonb_build_object(
             'name', coalesce(m.spitzname, split_part(trim(p.name), ' ', 1)),
             'punkte', public.challenge_punkte(m.schueler_id, montag),
             'ich', m.schueler_id = auth.uid()) as x
      from klassen_mitglieder m join profile p on p.id = m.schueler_id
     where m.klasse_id = k_id and (m.challenge_sichtbar or m.schueler_id = auth.uid())) t;

  select x into vorwoche from (
    select jsonb_build_object('name', coalesce(m.spitzname, split_part(trim(p.name), ' ', 1)), 'punkte', public.challenge_punkte(m.schueler_id, montag - 7)) as x
      from klassen_mitglieder m join profile p on p.id = m.schueler_id
     where m.klasse_id = k_id and m.challenge_sichtbar
     order by public.challenge_punkte(m.schueler_id, montag - 7) desc limit 1) t
   where (x ->> 'punkte')::int > 0;

  return jsonb_build_object(
    'status', 'ok', 'klasse', k.name, 'an', k.challenge_an, 'lehrkraft', ist_lehrkraft,
    'woche_von', montag, 'woche_bis', montag + 6,
    'gesamt', (select coalesce(sum(public.challenge_punkte(m.schueler_id, montag)), 0) from klassen_mitglieder m where m.klasse_id = k_id),
    'liste', liste, 'sieger_vorwoche', vorwoche,
    'mein_spitzname', (select spitzname from klassen_mitglieder where klasse_id = k_id and schueler_id = auth.uid()),
    'ich_sichtbar', (select challenge_sichtbar from klassen_mitglieder where klasse_id = k_id and schueler_id = auth.uid()));
end;
$$;

create or replace function public.challenge_schalten(k_id uuid, an boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  update klassen set challenge_an = an where id = k_id and lehrkraft_id = auth.uid();
  if not found then return jsonb_build_object('status', 'kein_zugang'); end if;
  return jsonb_build_object('status', 'ok', 'an', an);
end;
$$;

create or replace function public.challenge_profil(k_id uuid, name text, sichtbar boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  n text := nullif(regexp_replace(trim(coalesce(name, '')), '\s+', ' ', 'g'), '');
begin
  if n is not null and (char_length(n) < 2 or char_length(n) > 20) then return jsonb_build_object('status', 'laenge'); end if;
  update klassen_mitglieder set spitzname = n, challenge_sichtbar = coalesce(sichtbar, true)
   where klasse_id = k_id and schueler_id = auth.uid();
  if not found then return jsonb_build_object('status', 'kein_zugang'); end if;
  return jsonb_build_object('status', 'ok');
end;
$$;

-- Alle Klassen, in denen ich die Challenge sehe (als Lehrkraft oder Mitglied)
create or replace function public.challenge_klassen()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', k.id, 'name', k.name, 'stufe', k.stufe, 'code', case when k.lehrkraft_id = auth.uid() then k.code end,
                                               'an', k.challenge_an, 'lehrkraft', k.lehrkraft_id = auth.uid(),
                                               'mitglieder', (select count(*) from klassen_mitglieder m2 where m2.klasse_id = k.id))
                            order by k.stufe, k.name), '[]'::jsonb)
    from klassen k
   where k.lehrkraft_id = auth.uid() or exists (select 1 from klassen_mitglieder m where m.klasse_id = k.id and m.schueler_id = auth.uid());
$$;

revoke all on function public.challenge_punkte(uuid, date) from public, anon, authenticated;
revoke all on function public.challenge_rangliste(uuid), public.challenge_schalten(uuid, boolean), public.challenge_profil(uuid, text, boolean), public.challenge_klassen() from public, anon;
grant execute on function public.challenge_rangliste(uuid), public.challenge_schalten(uuid, boolean), public.challenge_profil(uuid, text, boolean), public.challenge_klassen() to authenticated;
