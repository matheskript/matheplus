-- ======================================================================
-- Konto löschen und Daten exportieren (DSGVO Art. 15, 17, 20)
-- Im Supabase-SQL-Editor EINMAL ausführen – nach schema.sql, rollen.sql,
-- lernstand.sql, entdecken.sql, ki.sql, perf-lab.sql, stripe.sql.
-- Fehlt eine dieser Tabellen, wird sie im Export einfach übersprungen.
--
-- konto_export()   – alles, was zum eigenen Konto gespeichert ist, als JSON
-- konto_loeschen() – löscht das eigene Konto endgültig. Alle Tabellen hängen
--                    mit „on delete cascade“ an auth.users bzw. profile; Feedback
--                    wird anonymisiert. Läuft noch ein bezahltes Abo, wird
--                    abgebrochen ('abo_aktiv') – erst im Kundenportal kündigen.
-- ======================================================================

-- Hilfe: eine Tabelle als JSON-Liste, falls es sie gibt
create or replace function public.konto_tabelle(tabelle text, spalte text, uid uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r jsonb;
begin
  if to_regclass('public.' || tabelle) is null then return null; end if;
  execute format('select coalesce(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) from public.%I t where t.%I = $1', tabelle, spalte) into r using uid;
  return r;
end;
$$;

create or replace function public.konto_export()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  benutzer jsonb;
begin
  if uid is null then return jsonb_build_object('status', 'nicht_angemeldet'); end if;
  select jsonb_build_object('id', u.id, 'email', u.email, 'angelegt', u.created_at, 'zuletzt_angemeldet', u.last_sign_in_at,
                            'anbieter', u.raw_app_meta_data -> 'providers')
    into benutzer from auth.users u where u.id = uid;
  return jsonb_build_object(
    'format', 'mythosmathe-export-1',
    'erstellt', now(),
    'konto', benutzer,
    'profil', public.konto_tabelle('profile', 'id', uid),
    'lernstand', public.konto_tabelle('lernstand', 'nutzer_id', uid),
    'mathe_entdecken', public.konto_tabelle('entdecken_fortschritt', 'nutzer_id', uid),
    'ki_nutzung', public.konto_tabelle('ki_nutzung', 'nutzer_id', uid),
    'performance_lab', jsonb_build_object(
      'ereignisse', public.konto_tabelle('perf_ereignisse', 'nutzer_id', uid),
      'aufgaben', public.konto_tabelle('perf_aufgaben', 'nutzer_id', uid),
      'runden', public.konto_tabelle('perf_runden', 'nutzer_id', uid),
      'badges', public.konto_tabelle('perf_badges', 'nutzer_id', uid)),
    'abos', public.konto_tabelle('abos', 'zahler_id', uid),
    'eltern_einwilligungen', public.konto_tabelle('eltern_einwilligungen', 'kind_id', uid),
    'feedback', public.konto_tabelle('feedback', 'nutzer', uid),
    'wochenmail', public.konto_tabelle('wochenmail', 'eltern_id', uid),
    'verbindungen', case when to_regprocedure('public.meine_beziehungen()') is not null then public.meine_beziehungen() else null end,
    'eigene_klassen', public.konto_tabelle('klassen', 'lehrkraft_id', uid),
    'klassen_mitgliedschaft', public.konto_tabelle('klassen_mitglieder', 'schueler_id', uid));
end;
$$;

create or replace function public.konto_loeschen(bestaetigung text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then return jsonb_build_object('status', 'nicht_angemeldet'); end if;
  if bestaetigung is distinct from 'LÖSCHEN' then return jsonb_build_object('status', 'bestaetigung_fehlt'); end if;
  if to_regclass('public.abos') is not null and exists (
       select 1 from public.abos where zahler_id = uid and status in ('active', 'trialing', 'past_due') and (laeuft_bis is null or laeuft_bis > now())) then
    return jsonb_build_object('status', 'abo_aktiv');
  end if;
  if to_regclass('public.feedback') is not null then
    update public.feedback set nutzer = null where nutzer = uid;
  end if;
  delete from auth.users where id = uid;     -- alles Weitere per „on delete cascade“
  return jsonb_build_object('status', 'geloescht');
end;
$$;

revoke all on function public.konto_tabelle(text, text, uuid) from public, anon, authenticated;
revoke all on function public.konto_export(), public.konto_loeschen(text) from public, anon;
grant execute on function public.konto_export(), public.konto_loeschen(text) to authenticated;
