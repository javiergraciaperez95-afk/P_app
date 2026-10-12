-- Tabla propia de la web de vietnamita. NO toca public.progress (la de chino).
-- Pegar entero en Supabase → SQL Editor → New query → Run.

create table if not exists public.vi_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text check (char_length(name) <= 40),
  photo      text check (char_length(photo) <= 30000),
  progress   jsonb not null default '{}'::jsonb,
  notebook   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.vi_progress enable row level security;

drop policy if exists "vi_progress: leer mi fila" on public.vi_progress;
drop policy if exists "vi_progress: crear mi fila" on public.vi_progress;
drop policy if exists "vi_progress: actualizar mi fila" on public.vi_progress;
drop policy if exists "vi_progress: borrar mi fila" on public.vi_progress;

create policy "vi_progress: leer mi fila" on public.vi_progress
  for select to authenticated using (auth.uid() = user_id);
create policy "vi_progress: crear mi fila" on public.vi_progress
  for insert to authenticated with check (auth.uid() = user_id);
create policy "vi_progress: actualizar mi fila" on public.vi_progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "vi_progress: borrar mi fila" on public.vi_progress
  for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.vi_progress to authenticated;

-- Para que la API vea la tabla nueva al momento
notify pgrst, 'reload schema';
