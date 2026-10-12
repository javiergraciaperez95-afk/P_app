-- Tabla para guardar el progreso de la app de italiano.
-- Ejecútalo una vez en Supabase: panel del proyecto → SQL Editor → New query → pegar → Run.
-- No toca ninguna tabla existente (tampoco public.progress de la app de chino).

create table if not exists public.italiano_progreso (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  datos       jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);

-- Seguridad a nivel de fila: cada persona solo ve y cambia su propia fila.
alter table public.italiano_progreso enable row level security;

create policy "italiano: leer lo propio"
  on public.italiano_progreso for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "italiano: crear lo propio"
  on public.italiano_progreso for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "italiano: cambiar lo propio"
  on public.italiano_progreso for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "italiano: borrar lo propio"
  on public.italiano_progreso for delete
  to authenticated
  using ((select auth.uid()) = user_id);
