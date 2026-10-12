# BASE DE DATOS COMPARTIDA (Supabase) · cómo funciona

Este proyecto (vietnamita) comparte el MISMO proyecto de Supabase que la web de chino
("HSK · 阅读小屋"). Leer antes de tocar nada relacionado con cuentas o la nube.

## Datos de conexión (públicos, se pueden poner en el código)
- Project URL: https://iuniglsiqnfvnotmfgdo.supabase.co
- Clave publishable (pública): sb_publishable_dZDATuXD7GFWilF-SnWXyw_KVWjyX4P
- NUNCA usar ni pedir la clave secreta (sb_secret_…). La web solo necesita la publishable.

## Usuarios (compartidos)
- Supabase Auth gestiona los usuarios. Una misma cuenta sirve para las dos webs.
- Registro por email + contraseña, con confirmación por correo obligatoria.
- El correo gratuito de Supabase tiene un límite bajo de envíos por hora.
- Al publicar esta web, añadir su dirección en Supabase → Authentication → URL Configuration →
  Redirect URLs (además de la de chino). En local esta web usa http://localhost:8080/**
  (en este Windows el puerto 8000 está reservado por el sistema y no se puede usar).

## Tabla de la web de chino: public.progress (NO TOCAR, NO ESCRIBIR)
user_id (PK → auth.users), name (≤30), photo (≤30000), progress jsonb, notebook jsonb, updated_at.
RLS "solo mi fila". Esta web solo la LEE (name y photo) como valor inicial del perfil.

## Tabla propia de esta web: public.vi_progress
SQL en `notes/supabase.sql` (pegar en Supabase → SQL Editor → New query → Run).
- user_id uuid PK → auth.users on delete cascade
- name, photo: perfil propio de esta web (si está vacío, se rellena leyendo public.progress)
- progress jsonb: { lecciones: { "001": { hecha, fecha, ejercicios: {...} } } }
- notebook jsonb: { tarjetas: {...}, borrados: { palabra: fecha }, registro: { día: {...} } }
- updated_at timestamptz

## Conexión (sin librerías, todo con fetch) → js/nube.js
- Auth: /auth/v1/signup, /auth/v1/token?grant_type=password|refresh_token, /auth/v1/logout,
  /auth/v1/recover, PUT /auth/v1/user. Cabecera apikey = publishable.
- Sesión en localStorage ("vietlibro.sesion"). Renovar antes de caducar; ante 401, renovar y reintentar una vez.
- Enlaces del correo: #access_token=…&type=signup|recovery (o #error=…): se capturan al arrancar.
- Datos: /rest/v1/vi_progress. Upsert con POST + Prefer: resolution=merge-duplicates,return=minimal
  (responde 201 sin cuerpo).
- Sincronizar = leer fila, UNIR con lo local, guardar. Nunca se pierde un «terminado»; en el
  cuaderno gana el cambio más reciente por palabra (con marca de borrado). Al arrancar, al
  entrar y unos segundos después de cada cambio. Una sola sincronización a la vez.
- Sin sesión, la web funciona igual con localStorage.
