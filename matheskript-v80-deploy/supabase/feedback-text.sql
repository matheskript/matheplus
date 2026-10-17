-- ======================================================================
-- Feedback per Text (neben der Sprachnachricht)
-- Im Supabase-SQL-Editor EINMAL ausführen – nach schema.sql.
--
-- Ergänzt public.feedback um die Spalte „nachricht“. Eine Zeile hat jetzt
-- entweder eine Aufnahme (audio_pfad) oder einen Text (nachricht).
-- Schüler dürfen weiter nur senden, nie lesen. Lesen: Dashboard → Table Editor → feedback.
-- Ohne dieses Skript meldet die App beim Senden eines Textes „hat nicht geklappt“.
-- ======================================================================
alter table public.feedback add column if not exists nachricht text;

alter table public.feedback drop constraint if exists feedback_nachricht_laenge;
alter table public.feedback add constraint feedback_nachricht_laenge
  check (nachricht is null or char_length(nachricht) between 1 and 2000);

-- Eine reine Text-Nachricht hat keine Aufnahme.
alter table public.feedback alter column audio_pfad drop not null;

alter table public.feedback drop constraint if exists feedback_inhalt;
alter table public.feedback add constraint feedback_inhalt
  check (audio_pfad is not null or nachricht is not null);

grant insert (nachricht) on public.feedback to anon, authenticated;
