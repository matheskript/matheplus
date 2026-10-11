-- ======================================================================
-- Performance-Lab – VORBEREITET, NOCH NICHT EINGESPIELT.
-- Heute liegt das Fehlergedächtnis im Browser (src/perfSpeicher.js, Schlüssel "mm-performance-lab").
-- Für den Serverbetrieb: dieses Skript im Supabase-SQL-Editor ausführen und perfSpeicher.js
-- auf diese Tabellen umstellen (dieselben Funktionen aus perfKern.js laufen dann serverseitig).
-- Nutzer sehen und ändern nur ihre eigenen Zeilen (Row Level Security).
-- ======================================================================
create table if not exists public.perf_ereignisse (
  id          text primary key,                       -- deterministisch (Idempotenz): "ev-" + Hash
  nutzer_id   uuid not null references auth.users (id) on delete cascade,
  quelle      text not null check (quelle in ('digital', 'scan', 'manuell')),
  zeit        timestamptz not null,
  typ         text, untertyp text, haupt text,
  status      text not null check (status in ('erkannt', 'bestaetigt', 'unsicher', 'verworfen')),
  konfidenz   real not null check (konfidenz between 0 and 1),
  daten       jsonb not null,                         -- Aufgabe, Schritt, Prüfung, Hypothesen, Ursprung
  taxonomie   smallint not null default 1
);
create index if not exists perf_ereignisse_nutzer_zeit on public.perf_ereignisse (nutzer_id, zeit desc);
create index if not exists perf_ereignisse_nutzer_typ  on public.perf_ereignisse (nutzer_id, typ, untertyp);

create table if not exists public.perf_aufgaben (       -- Nenner für Fehlerquoten
  id text primary key, nutzer_id uuid not null references auth.users (id) on delete cascade, zeit timestamptz not null, daten jsonb not null
);
create index if not exists perf_aufgaben_nutzer_zeit on public.perf_aufgaben (nutzer_id, zeit desc);

create table if not exists public.perf_runden (
  id text primary key, nutzer_id uuid not null references auth.users (id) on delete cascade,
  typ text not null, status text not null check (status in ('laufend', 'erfolgreich', 'nicht_geschafft', 'abgebrochen')), zeit timestamptz not null, daten jsonb not null
);
create index if not exists perf_runden_nutzer_typ on public.perf_runden (nutzer_id, typ, status);

create table if not exists public.perf_badges (
  id text primary key, nutzer_id uuid not null references auth.users (id) on delete cascade, typ text not null, zeit timestamptz not null, daten jsonb not null,
  unique (nutzer_id, typ)                              -- nie ein doppeltes Badge
);

do $$ declare t text; begin
  foreach t in array array['perf_ereignisse', 'perf_aufgaben', 'perf_runden', 'perf_badges'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "eigene_zeilen" on public.%I', t);
    execute format('create policy "eigene_zeilen" on public.%I for all using (auth.uid() = nutzer_id) with check (auth.uid() = nutzer_id)', t);
  end loop;
end $$;
