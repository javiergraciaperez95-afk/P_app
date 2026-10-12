-- =====================================================================
-- App única «Idiomas»: todo lo que necesita en Supabase.
--
-- Cómo usarlo: Supabase → tu proyecto → SQL Editor → New query → pegar TODO → Run.
-- Se puede ejecutar las veces que haga falta: no borra tablas ni datos.
--
-- Qué hace:
--   1) Una tabla de progreso por curso (21). Las 18 que ya existían no cambian;
--      se crean las 3 que faltaban: portugués, vietnamita y chino.
--   2) Un almacén público «audios» para guardar los audios de las lecciones
--      (solo hace falta si se quiere que la app los descargue de internet).
--
-- CUENTAS: no necesitan tabla. Las guarda Supabase en Authentication → Users.
-- Quien se registra tiene la misma cuenta para todos los idiomas.
--
-- Las apps antiguas de portugués, vietnamita y chino usaban otras tablas
-- (vi_progress, progress y las de Portuguese/supabase/esquema.sql). No se tocan:
-- la app única guarda en las tablas nuevas, así que el progreso de aquellas
-- apps antiguas no aparece aquí.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Progreso: una tabla por curso, con una fila por persona.
--    Formato: user_id · datos (JSON con perfil, lecciones, cuaderno y actividad) · actualizado
--    Los nombres son los del campo «tabla» de Idiomas/js/cursos.js.
-- ---------------------------------------------------------------------
do $$
declare
  curso text;
  tabla text;
begin
  foreach curso in array array[
    'espanol', 'ingles', 'francais', 'aleman', 'italiano', 'portugues', 'holandes',
    'dansk', 'noruego', 'sueco', 'polaco', 'rumano', 'griego', 'ruso', 'turco',
    'indonesio', 'japones', 'coreano', 'tailandes', 'vietnamita', 'chino'
  ]
  loop
    tabla := curso || '_progreso';

    execute format($f$
      create table if not exists public.%I (
        user_id     uuid primary key references auth.users (id) on delete cascade,
        datos       jsonb not null default '{}'::jsonb,
        actualizado timestamptz not null default now()
      )$f$, tabla);

    execute format('alter table public.%I enable row level security', tabla);

    -- Cada persona solo puede leer y cambiar su propia fila.
    execute format('drop policy if exists %I on public.%I', curso || ': leer lo propio', tabla);
    execute format('drop policy if exists %I on public.%I', curso || ': crear lo propio', tabla);
    execute format('drop policy if exists %I on public.%I', curso || ': cambiar lo propio', tabla);
    execute format('drop policy if exists %I on public.%I', curso || ': borrar lo propio', tabla);

    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      curso || ': leer lo propio', tabla);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',
      curso || ': crear lo propio', tabla);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      curso || ': cambiar lo propio', tabla);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',
      curso || ': borrar lo propio', tabla);

    execute format('grant select, insert, update, delete on table public.%I to authenticated', tabla);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 2) Audios de las lecciones: un almacén PÚBLICO de solo lectura.
--    Cualquiera puede descargar los audios (la app no pide cuenta para oírlos);
--    solo tú, desde el panel de Supabase, puedes subir, cambiar o borrar archivos.
--    Dirección que hay que poner después en Idiomas/js/config.js (AUDIOS_EN_LINEA):
--      https://TU-PROYECTO.supabase.co/storage/v1/object/public/audios
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, allowed_mime_types)
values ('audios', 'audios', true, array['audio/mpeg', 'application/json'])
on conflict (id) do update set public = true, allowed_mime_types = excluded.allowed_mime_types;
