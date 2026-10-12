-- =============================================================================
-- Olá! Learn Portuguese — progress tracking schema for Supabase
-- =============================================================================
--
-- The app teaches PORTUGUESE (European Portuguese). English and Vietnamese are only
-- interface languages: they are stored as a preference and NEVER change the progress.
--
-- HOW TO RUN IT
--   1. Supabase dashboard → SQL Editor → New query.
--   2. Paste this whole file and press «Run». It can be run again safely (idempotent).
--   3. Then paste and run supabase/catalogo.sql (the list of units and lessons).
--      Every time lessons are added, regenerate it with `npm run catalogo-sql`
--      and run it again: it only inserts/updates, it never deletes progress.
--
-- WHAT IT CREATES (all with the «portuguese_» prefix, so it never touches the tables
-- of other apps, e.g. «dansk_progreso» of the Danish app):
--   Catalogue (read-only for the app):
--     portuguese_units            units of the course
--     portuguese_lessons          lessons (stable ids = file names in lessons/)
--   Per-user data (each user only sees and changes their own rows, via RLS):
--     portuguese_profiles         name, interface language, last reset
--     portuguese_lesson_progress  one row per user and lesson (opened / completed)
--     portuguese_exercise_progress one row per user, lesson and exercise
--     portuguese_notebook_cards   saved words/phrases + spaced-repetition state
--     portuguese_daily_activity   exercises and reviews per day (streaks)
--
-- Primary keys make duplicates impossible: completing a lesson again, reopening it
-- or switching the interface language updates the same row (upsert), never adds one.
--
-- «client_ts» columns are the device time (milliseconds) of the last change; the
-- app uses them to merge progress from several devices. «created_at»/«updated_at»
-- are server timestamps maintained by the database.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Helper: keep «updated_at» up to date
-- -----------------------------------------------------------------------------
create or replace function public.portuguese_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. Catalogue: units and lessons
-- -----------------------------------------------------------------------------
create table if not exists public.portuguese_units (
  id          text primary key
              constraint portuguese_units_id_format check (id ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  position    integer not null constraint portuguese_units_position_positive check (position > 0),
  title       text not null constraint portuguese_units_title_length check (char_length(title) between 1 and 200),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.portuguese_lessons (
  id              text primary key
                  constraint portuguese_lessons_id_format check (id ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  unit_id         text not null
                  references public.portuguese_units (id) on update cascade on delete restrict,
  position        integer not null constraint portuguese_lessons_position_positive check (position > 0),
  title           text not null constraint portuguese_lessons_title_length check (char_length(title) between 1 and 200),
  exercise_count  integer not null default 0 constraint portuguese_lessons_exercise_count check (exercise_count >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists portuguese_lessons_unit_position_idx
  on public.portuguese_lessons (unit_id, position);

-- -----------------------------------------------------------------------------
-- 3. User profile (one row per user)
-- -----------------------------------------------------------------------------
create table if not exists public.portuguese_profiles (
  user_id       uuid primary key default auth.uid()
                references auth.users (id) on delete cascade,
  display_name  text constraint portuguese_profiles_name_length check (char_length(display_name) <= 40),
  -- Interface language only (the learned language is always Portuguese).
  ui_language   text not null default 'en'
                constraint portuguese_profiles_ui_language check (ui_language in ('en', 'vi')),
  -- Last «reset progress» (ms). Rows older than this are obsolete.
  reset_at      bigint not null default 0 constraint portuguese_profiles_reset_at check (reset_at >= 0),
  client_ts     bigint not null default 0 constraint portuguese_profiles_client_ts check (client_ts >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 4. Lesson progress (one row per user and lesson)
-- -----------------------------------------------------------------------------
create table if not exists public.portuguese_lesson_progress (
  user_id       uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  -- «restrict»: a lesson with progress cannot be removed from the catalogue by accident.
  lesson_id     text not null
                references public.portuguese_lessons (id) on update cascade on delete restrict,
  opened        boolean not null default false,
  completed     boolean not null default false,
  completed_ms  bigint constraint portuguese_lesson_progress_completed_ms check (completed_ms >= 0),
  completed_at  timestamptz generated always as (
                  case when completed_ms is null then null else to_timestamp(completed_ms / 1000.0) end
                ) stored,
  client_ts     bigint not null default 0 constraint portuguese_lesson_progress_client_ts check (client_ts >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, lesson_id),
  constraint portuguese_lesson_progress_completed_needs_time check (not completed or completed_ms is not null)
);

create index if not exists portuguese_lesson_progress_lesson_idx
  on public.portuguese_lesson_progress (lesson_id);

-- -----------------------------------------------------------------------------
-- 5. Exercise progress (one row per user, lesson and exercise)
-- -----------------------------------------------------------------------------
create table if not exists public.portuguese_exercise_progress (
  user_id       uuid not null default auth.uid(),
  lesson_id     text not null,
  exercise_id   text not null constraint portuguese_exercise_progress_id_length check (char_length(exercise_id) between 1 and 200),
  attempts      integer not null default 0 constraint portuguese_exercise_progress_attempts check (attempts >= 0),
  correct       integer not null default 0 constraint portuguese_exercise_progress_correct check (correct >= 0),
  wrong         integer not null default 0 constraint portuguese_exercise_progress_wrong check (wrong >= 0),
  last_correct  boolean,
  client_ts     bigint not null default 0 constraint portuguese_exercise_progress_client_ts check (client_ts >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, lesson_id, exercise_id),
  -- The exercise belongs to the SAME user's lesson progress; deleting it deletes its exercises.
  foreign key (user_id, lesson_id)
    references public.portuguese_lesson_progress (user_id, lesson_id) on delete cascade,
  constraint portuguese_exercise_progress_totals check (correct + wrong = attempts)
);

-- -----------------------------------------------------------------------------
-- 6. Notebook cards and spaced repetition (one row per user and card)
-- -----------------------------------------------------------------------------
create table if not exists public.portuguese_notebook_cards (
  user_id          uuid not null default auth.uid()
                   references auth.users (id) on delete cascade,
  card_id          text not null constraint portuguese_notebook_cards_id_length check (char_length(card_id) between 1 and 300),
  -- Deleted cards are kept as «tombstones» so that other devices also delete them.
  deleted          boolean not null default false,
  kind             text not null default 'palabra'
                   constraint portuguese_notebook_cards_kind check (kind in ('palabra', 'frase')),
  portuguese       text not null constraint portuguese_notebook_cards_text_length check (char_length(portuguese) between 1 and 500),
  -- Texts in the interface languages: a string or {"en": "...", "vi": "..."}.
  translation      jsonb,
  pronunciation    jsonb,
  note             jsonb,
  origin           jsonb,
  created_ms       bigint not null default 0 constraint portuguese_notebook_cards_created_ms check (created_ms >= 0),
  srs_repetitions  integer not null default 0 constraint portuguese_notebook_cards_reps check (srs_repetitions >= 0),
  srs_interval     integer not null default 0 constraint portuguese_notebook_cards_interval check (srs_interval >= 0),
  srs_ease         double precision not null default 2.5 constraint portuguese_notebook_cards_ease check (srs_ease between 1 and 5),
  srs_lapses       integer not null default 0 constraint portuguese_notebook_cards_lapses check (srs_lapses >= 0),
  srs_due          bigint not null default 0 constraint portuguese_notebook_cards_due check (srs_due >= 0),
  client_ts        bigint not null default 0 constraint portuguese_notebook_cards_client_ts check (client_ts >= 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  primary key (user_id, card_id),
  constraint portuguese_notebook_cards_json_size check (
    coalesce(octet_length(translation::text), 0) + coalesce(octet_length(pronunciation::text), 0)
    + coalesce(octet_length(note::text), 0) + coalesce(octet_length(origin::text), 0) <= 8000
  )
);

-- Cards due for review, per user.
create index if not exists portuguese_notebook_cards_due_idx
  on public.portuguese_notebook_cards (user_id, srs_due) where not deleted;

-- -----------------------------------------------------------------------------
-- 7. Daily activity (one row per user and day)
-- -----------------------------------------------------------------------------
create table if not exists public.portuguese_daily_activity (
  user_id    uuid not null default auth.uid()
             references auth.users (id) on delete cascade,
  day        date not null,
  exercises  integer not null default 0 constraint portuguese_daily_activity_exercises check (exercises >= 0),
  reviews    integer not null default 0 constraint portuguese_daily_activity_reviews check (reviews >= 0),
  client_ts  bigint not null default 0 constraint portuguese_daily_activity_client_ts check (client_ts >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- -----------------------------------------------------------------------------
-- 8. «updated_at» triggers
-- -----------------------------------------------------------------------------
do $$
declare
  tabla text;
begin
  foreach tabla in array array[
    'portuguese_units', 'portuguese_lessons', 'portuguese_profiles', 'portuguese_lesson_progress',
    'portuguese_exercise_progress', 'portuguese_notebook_cards', 'portuguese_daily_activity'
  ] loop
    execute format('drop trigger if exists %I on public.%I', tabla || '_updated_at', tabla);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.portuguese_set_updated_at()',
      tabla || '_updated_at', tabla);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- 9. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.portuguese_units              enable row level security;
alter table public.portuguese_lessons            enable row level security;
alter table public.portuguese_profiles           enable row level security;
alter table public.portuguese_lesson_progress    enable row level security;
alter table public.portuguese_exercise_progress  enable row level security;
alter table public.portuguese_notebook_cards     enable row level security;
alter table public.portuguese_daily_activity     enable row level security;

-- 9a. Catalogue: anyone can read it; nobody can change it from the app
--     (it is only changed from the SQL Editor, which uses a privileged role).
drop policy if exists "portuguese_units: read" on public.portuguese_units;
create policy "portuguese_units: read"
  on public.portuguese_units for select
  to anon, authenticated
  using (true);

drop policy if exists "portuguese_lessons: read" on public.portuguese_lessons;
create policy "portuguese_lessons: read"
  on public.portuguese_lessons for select
  to anon, authenticated
  using (true);

-- 9b. User data: each signed-in user can only read and change their own rows.
do $$
declare
  tabla text;
begin
  foreach tabla in array array[
    'portuguese_profiles', 'portuguese_lesson_progress', 'portuguese_exercise_progress',
    'portuguese_notebook_cards', 'portuguese_daily_activity'
  ] loop
    execute format('drop policy if exists %I on public.%I', tabla || ': select own', tabla);
    execute format('drop policy if exists %I on public.%I', tabla || ': insert own', tabla);
    execute format('drop policy if exists %I on public.%I', tabla || ': update own', tabla);
    execute format('drop policy if exists %I on public.%I', tabla || ': delete own', tabla);

    execute format(
      'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      tabla || ': select own', tabla);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',
      tabla || ': insert own', tabla);
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      tabla || ': update own', tabla);
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',
      tabla || ': delete own', tabla);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- 10. Table privileges (RLS still applies on top of them)
-- -----------------------------------------------------------------------------
revoke all on public.portuguese_units, public.portuguese_lessons from anon, authenticated;
grant select on public.portuguese_units, public.portuguese_lessons to anon, authenticated;

revoke all on
  public.portuguese_profiles, public.portuguese_lesson_progress, public.portuguese_exercise_progress,
  public.portuguese_notebook_cards, public.portuguese_daily_activity
from anon, authenticated;
grant select, insert, update, delete on
  public.portuguese_profiles, public.portuguese_lesson_progress, public.portuguese_exercise_progress,
  public.portuguese_notebook_cards, public.portuguese_daily_activity
to authenticated;

revoke all on function public.portuguese_set_updated_at() from public, anon, authenticated;

commit;

-- =============================================================================
-- 11. HOW TO CHECK THAT EVERYTHING WAS CREATED (run these queries separately)
-- =============================================================================
-- Tables and RLS (rowsecurity must be «true» for the 7 tables):
--   select tablename, rowsecurity from pg_tables
--   where schemaname = 'public' and tablename like 'portuguese\_%' order by tablename;
--
-- Policies (2 catalogue «read» policies + 4 per user table = 22):
--   select tablename, policyname, cmd, roles from pg_policies
--   where schemaname = 'public' and tablename like 'portuguese\_%' order by tablename, policyname;
--
-- Catalogue loaded (after running supabase/catalogo.sql):
--   select u.id as unit, l.id as lesson, l.title, l.exercise_count
--   from public.portuguese_lessons l join public.portuguese_units u on u.id = l.unit_id
--   order by u.position, l.position;
--
-- Progress of the users (from the SQL Editor, which can see every row):
--   select user_id, lesson_id, opened, completed, completed_at, updated_at
--   from public.portuguese_lesson_progress order by updated_at desc limit 20;
-- =============================================================================
