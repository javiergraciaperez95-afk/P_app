-- =====================================================================
-- PHUONG APP · LA CUENTA CON CÓDIGO (20-10-2026)
-- La app la usa una sola persona: su cuenta es un código de 4 cifras (5567). Con él se abre la app y se guarda el
-- progreso aquí. Del código solo se guarda su huella (SHA-256 de «phuong-app:<código>»), nunca el código.
--
-- Cómo se ejecuta (una vez): Supabase → el proyecto → SQL Editor → New query → pegar TODO → Run.
-- Se puede volver a ejecutar: no borra el progreso guardado.
--
-- La tabla no se puede leer ni escribir directamente (RLS sin políticas): todo pasa por las dos funciones de abajo,
-- y las dos piden el código. Tras 20 códigos equivocados en 15 minutos, se deja de comprobar un rato.
-- =====================================================================

create table if not exists public.phuong_cuenta (
  codigo_hash text primary key,
  datos       jsonb not null default '{}'::jsonb,
  cuando      bigint not null default 0,          -- la hora (ms) de la copia que se subió, para juntar sin pisar
  actualizada timestamptz not null default now()
);
alter table public.phuong_cuenta enable row level security;
revoke all on public.phuong_cuenta from anon, authenticated;

create table if not exists public.phuong_intentos (
  momento timestamptz not null default now()
);
alter table public.phuong_intentos enable row level security;
revoke all on public.phuong_intentos from anon, authenticated;

-- La cuenta: el código 5567.
insert into public.phuong_cuenta (codigo_hash)
values (encode(sha256(convert_to('phuong-app:5567', 'UTF8')), 'hex'))
on conflict (codigo_hash) do nothing;

-- La huella de la cuenta de ese código, o null si el código no es el bueno (y entonces cuenta como intento fallido).
-- Devuelve 'demasiados' si ya van muchos fallos seguidos.
create or replace function public.phuong_comprobar(p_codigo text)
returns text language plpgsql security definer set search_path = public as $$
declare v_hash text;
begin
  delete from phuong_intentos where momento < now() - interval '1 day';
  if (select count(*) from phuong_intentos where momento > now() - interval '15 minutes') >= 20 then
    return 'demasiados';
  end if;
  v_hash := encode(sha256(convert_to('phuong-app:' || coalesce(p_codigo, ''), 'UTF8')), 'hex');
  if not exists (select 1 from phuong_cuenta where codigo_hash = v_hash) then
    insert into phuong_intentos default values;
    return null;
  end if;
  return v_hash;
end $$;

-- Lee el progreso: { ok, datos, cuando } o { error: 'codigo' | 'demasiados' }.
create or replace function public.phuong_leer(p_codigo text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_hash text; v_fila phuong_cuenta;
begin
  v_hash := phuong_comprobar(p_codigo);
  if v_hash is null then return jsonb_build_object('error', 'codigo'); end if;
  if v_hash = 'demasiados' then return jsonb_build_object('error', 'demasiados'); end if;
  select * into v_fila from phuong_cuenta where codigo_hash = v_hash;
  return jsonb_build_object('ok', true, 'datos', v_fila.datos, 'cuando', v_fila.cuando);
end $$;

-- Guarda el progreso (como mucho 4 MB): { ok } o { error: 'codigo' | 'demasiados' | 'grande' }.
create or replace function public.phuong_guardar(p_codigo text, p_datos jsonb, p_cuando bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_hash text;
begin
  v_hash := phuong_comprobar(p_codigo);
  if v_hash is null then return jsonb_build_object('error', 'codigo'); end if;
  if v_hash = 'demasiados' then return jsonb_build_object('error', 'demasiados'); end if;
  if octet_length(p_datos::text) > 4000000 then return jsonb_build_object('error', 'grande'); end if;
  update phuong_cuenta set datos = p_datos, cuando = coalesce(p_cuando, 0), actualizada = now() where codigo_hash = v_hash;
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.phuong_comprobar(text) from anon, authenticated, public;
grant execute on function public.phuong_leer(text), public.phuong_guardar(text, jsonb, bigint) to anon, authenticated;
