-- Tabla para guardar el progreso de la app de inglés.
-- Ejecútalo una vez en Supabase: panel del proyecto → SQL Editor → New query → pegar → Run.
-- No toca ninguna tabla existente (tampoco public.progress de la app de chino).

create table if not exists public.ingles_progreso (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  datos       jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);

-- Seguridad a nivel de fila: cada persona solo ve y cambia su propia fila.
alter table public.ingles_progreso enable row level security;

create policy "ingles: leer lo propio"
  on public.ingles_progreso for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "ingles: crear lo propio"
  on public.ingles_progreso for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "ingles: cambiar lo propio"
  on public.ingles_progreso for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "ingles: borrar lo propio"
  on public.ingles_progreso for delete
  to authenticated
  using ((select auth.uid()) = user_id);
