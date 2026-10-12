-- =====================================================
-- HSK · 阅读小屋 — tabla de usuarios en Supabase
-- Cómo usarlo: Supabase → tu proyecto → SQL Editor → New query →
-- pega TODO este archivo → Run. Solo hay que hacerlo una vez.
--
-- El email, la contraseña y la forma de registro ya los guarda Supabase
-- (Authentication → Users). Aquí solo va lo de la web:
--   name      nombre del perfil
--   photo     foto de perfil (miniatura pequeña, opcional)
--   progress  textos terminados y repaso de frases
--   notebook  palabras guardadas en el cuaderno
-- =====================================================

drop table if exists public.progress;   -- versión anterior de prueba (si existía)

create table public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text  check (char_length(name) <= 30),
  photo      text  check (photo is null or char_length(photo) <= 30000),
  progress   jsonb not null default '{}'::jsonb,
  notebook   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Seguridad: cada usuario solo puede ver y modificar SU fila.
alter table public.progress enable row level security;

create policy "leer mi fila" on public.progress
  for select using (auth.uid() = user_id);
create policy "crear mi fila" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "actualizar mi fila" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "borrar mi fila" on public.progress
  for delete using (auth.uid() = user_id);
