-- Tabla para guardar el progreso de la app de español.
-- Ejecútalo en Supabase: panel del proyecto → SQL Editor → New query → pegar → Run.
-- Solo crea cosas nuevas: si se ejecuta dos veces, avisa de que las reglas ya existen y no cambia nada.
-- No toca ninguna tabla existente (tampoco public.dansk_progreso de la app de danés ni public.progress de la app de chino).

-- 1. La tabla: una fila por persona con todo su progreso (lecciones, cuaderno, actividad) en JSON.
create table if not exists public.espanol_progreso (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  datos       jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);

comment on table public.espanol_progreso is 'Progreso de la app de español (una fila por usuario).';

-- 2. Permisos para las personas con sesión iniciada.
grant select, insert, update, delete on table public.espanol_progreso to authenticated;

-- 3. Seguridad a nivel de fila: cada persona solo ve y cambia su propia fila.
alter table public.espanol_progreso enable row level security;

create policy "espanol: leer lo propio"
  on public.espanol_progreso for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "espanol: crear lo propio"
  on public.espanol_progreso for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "espanol: cambiar lo propio"
  on public.espanol_progreso for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "espanol: borrar lo propio"
  on public.espanol_progreso for delete
  to authenticated
  using ((select auth.uid()) = user_id);
