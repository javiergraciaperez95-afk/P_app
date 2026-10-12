-- =====================================================================
-- Cuentas, progreso y cuaderno para TODAS las apps de idiomas (un solo proyecto de Supabase).
--
-- Cómo usarlo: Supabase → tu proyecto → SQL Editor → New query → pegar TODO → Run.
-- Se puede ejecutar las veces que haga falta: no borra tablas ni datos.
--
-- CUENTAS: no necesitan tabla. Las guarda Supabase en Authentication → Users
-- (correo y contraseña). Como todas las apps usan el mismo proyecto, quien se
-- registra en una app ya tiene cuenta en todas.
--
-- PROGRESO: cada app tiene SU tabla, con una fila por persona. Así cada app
-- solo ve su propio progreso. En esa fila va todo lo de esa app: perfil,
-- lecciones y ejercicios, cuaderno (con su repaso) y actividad.
--
-- SEGURIDAD: con RLS, cada persona solo puede leer y cambiar su propia fila.
--
-- NO incluye la app de portugués: usa varias tablas y tiene su propio archivo
-- (Portuguese/supabase/esquema.sql), que hay que ejecutar aparte.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Las 18 apps con el mismo formato: user_id · datos (JSON) · actualizado
--    Los nombres son los que cada app tiene en su js/config.js.
-- ---------------------------------------------------------------------
do $$
declare
  app text;
  tabla text;
begin
  foreach app in array array[
    'aleman', 'coreano', 'dansk', 'espanol', 'francais', 'griego',
    'holandes', 'indonesio', 'ingles', 'italiano', 'japones', 'noruego',
    'polaco', 'rumano', 'ruso', 'sueco', 'tailandes', 'turco'
  ]
  loop
    tabla := app || '_progreso';

    execute format($f$
      create table if not exists public.%I (
        user_id     uuid primary key references auth.users (id) on delete cascade,
        datos       jsonb not null default '{}'::jsonb,
        actualizado timestamptz not null default now()
      )$f$, tabla);

    execute format('alter table public.%I enable row level security', tabla);

    execute format('drop policy if exists %I on public.%I', app || ': leer lo propio', tabla);
    execute format('drop policy if exists %I on public.%I', app || ': crear lo propio', tabla);
    execute format('drop policy if exists %I on public.%I', app || ': cambiar lo propio', tabla);
    execute format('drop policy if exists %I on public.%I', app || ': borrar lo propio', tabla);

    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      app || ': leer lo propio', tabla);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',
      app || ': crear lo propio', tabla);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      app || ': cambiar lo propio', tabla);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',
      app || ': borrar lo propio', tabla);

    execute format('grant select, insert, update, delete on table public.%I to authenticated', tabla);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 2) Vietnamita (tabla vi_progress) y chino (tabla progress).
--    Estas dos apps guardan nombre, foto, progreso y cuaderno en columnas separadas.
-- ---------------------------------------------------------------------
create table if not exists public.vi_progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text check (char_length(name) <= 40),
  photo      text check (char_length(photo) <= 30000),
  progress   jsonb not null default '{}'::jsonb,
  notebook   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text check (char_length(name) <= 30),
  photo      text check (photo is null or char_length(photo) <= 30000),
  progress   jsonb not null default '{}'::jsonb,
  notebook   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.vi_progress enable row level security;
alter table public.progress enable row level security;

drop policy if exists "vi_progress: leer mi fila" on public.vi_progress;
drop policy if exists "vi_progress: crear mi fila" on public.vi_progress;
drop policy if exists "vi_progress: actualizar mi fila" on public.vi_progress;
drop policy if exists "vi_progress: borrar mi fila" on public.vi_progress;
create policy "vi_progress: leer mi fila" on public.vi_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "vi_progress: crear mi fila" on public.vi_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "vi_progress: actualizar mi fila" on public.vi_progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "vi_progress: borrar mi fila" on public.vi_progress
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "leer mi fila" on public.progress;
drop policy if exists "crear mi fila" on public.progress;
drop policy if exists "actualizar mi fila" on public.progress;
drop policy if exists "borrar mi fila" on public.progress;
create policy "leer mi fila" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "crear mi fila" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "actualizar mi fila" on public.progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "borrar mi fila" on public.progress
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.vi_progress to authenticated;
grant select, insert, update, delete on table public.progress to authenticated;


-- ---------------------------------------------------------------------
-- 3) Que la API vea las tablas nuevas enseguida.
-- ---------------------------------------------------------------------
notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- Comprobación (opcional): debe listar 20 tablas, todas con rls = true.
-- ---------------------------------------------------------------------
select c.relname as tabla, c.relrowsecurity as rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and (c.relname like '%\_progreso' or c.relname in ('vi_progress', 'progress'))
order by 1;
