-- =====================================================================
-- PAGLOT · CUENTAS COMO MULLVAD (18-10-2026)
-- Cada dispositivo tiene un número de cuenta de 16 cifras: no se pide nada más. Con ese número se entra
-- desde otro dispositivo. Una cuenta anónima que no se usa en 7 días se borra sola. Si se le añade un
-- correo (verificado con un código), ya no caduca y el número se puede recuperar por correo.
--
-- Cómo se ejecuta: Supabase → el proyecto → SQL Editor → New query → pegar TODO → Run.
-- Se puede ejecutar varias veces: no borra datos.
--
-- La tabla no se puede leer ni escribir directamente: todo pasa por las funciones de abajo, y quien no sabe
-- el número no puede tocar esa cuenta (el número hace de llave).
-- =====================================================================

create table if not exists public.paglot_cuentas (
  numero  text primary key check (numero ~ '^[0-9]{16}$'),
  datos   jsonb not null default '{}'::jsonb,
  usuario uuid unique references auth.users (id) on delete set null,  -- con correo: no caduca
  correo  text,
  creada  timestamptz not null default now(),
  usada   timestamptz not null default now()
);

alter table public.paglot_cuentas enable row level security;
revoke all on public.paglot_cuentas from anon, authenticated;

-- Borra las cuentas anónimas que llevan 7 días sin usarse.
create or replace function public.paglot_limpiar()
returns void language sql security definer set search_path = public as $$
  delete from paglot_cuentas where usuario is null and usada < now() - interval '7 days';
$$;

-- Lee el progreso de una cuenta (y cuenta como uso). null si no existe (o ya se borró).
create or replace function public.paglot_leer(p_numero text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  perform paglot_limpiar();
  update paglot_cuentas set usada = now() where numero = p_numero returning datos into v;
  return v;
end $$;

-- Guarda el progreso (crea la cuenta si no existe). Como mucho 2 MB por cuenta.
create or replace function public.paglot_guardar(p_numero text, p_datos jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_numero !~ '^[0-9]{16}$' then raise exception 'número no válido'; end if;
  if octet_length(p_datos::text) > 2000000 then raise exception 'demasiados datos'; end if;
  insert into paglot_cuentas (numero, datos) values (p_numero, p_datos)
  on conflict (numero) do update set datos = excluded.datos, usada = now();
  return true;
end $$;

-- ¿Existe esta cuenta? (para entrar con un número en otro dispositivo)
create or replace function public.paglot_existe(p_numero text)
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from paglot_cuentas where numero = p_numero);
$$;

-- Con sesión de correo (código verificado): une la cuenta a ese correo; desde ahí no caduca.
create or replace function public.paglot_vincular(p_numero text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'hace falta verificar el correo'; end if;
  -- un correo, una cuenta: si ya tenía otra, se suelta
  update paglot_cuentas set usuario = null, correo = null where usuario = auth.uid() and numero <> p_numero;
  update paglot_cuentas set usuario = auth.uid(), correo = auth.jwt() ->> 'email', usada = now() where numero = p_numero;
  return found;
end $$;

-- Con sesión de correo: el número de la cuenta unida a ese correo (para recuperarlo).
create or replace function public.paglot_mi_numero()
returns text language sql security definer set search_path = public as $$
  select numero from paglot_cuentas where usuario = auth.uid();
$$;

-- Qué correo tiene unida una cuenta (para enseñarlo en el Perfil), o null.
create or replace function public.paglot_correo(p_numero text)
returns text language sql security definer set search_path = public as $$
  select correo from paglot_cuentas where numero = p_numero;
$$;

-- Borra una cuenta (desde el Perfil, «borrar mi cuenta»).
create or replace function public.paglot_borrar(p_numero text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from paglot_cuentas where numero = p_numero;
  return found;
end $$;

revoke all on function public.paglot_limpiar() from anon, authenticated, public;
grant execute on function public.paglot_leer(text), public.paglot_guardar(text, jsonb), public.paglot_existe(text),
  public.paglot_correo(text), public.paglot_borrar(text) to anon, authenticated;
grant execute on function public.paglot_vincular(text), public.paglot_mi_numero() to authenticated;
