-- =====================================================================
-- PAGLOT · CUENTAS CON CORREO Y CONTRASEÑA (20-10-2026)
-- Dos usos:
--  1. En local, la app usa Supabase como servidor (js/servidor.js): cuentas de Supabase Auth (correo + contraseña,
--     con código por correo para confirmar, para entrar sin contraseña y para cambiarla), el progreso por curso,
--     los planes, los regalos, Fundadores y Familia.
--  2. En el hosting (PHP), Supabase es la segunda llave de los pagos: el PHP apunta aquí cada plan que concede y, antes
--     de darlo por bueno, pregunta si existe (paglot_apuntar_concesion y paglot_concesion_valida, solo con la clave
--     service_role). Si alguien tocara una sola de las dos bases, no tendría plan.
--
-- Cómo se ejecuta: Supabase → SQL Editor → New query → pegar TODO → Run. Se puede ejecutar varias veces.
-- En Authentication → Email Templates, pon {{ .Token }} en las plantillas «Confirm signup», «Magic Link» y
-- «Reset Password» para que lleguen códigos de 6 cifras en lugar de enlaces.
-- Cuenta de desarrollador: crea la cuenta normal en la app y luego ejecuta  select paglot_hacer_dev('tu@correo');
-- =====================================================================

-- El perfil de cada cuenta: su número público de 8 cifras y si es la de desarrollo.
create table if not exists public.paglot_perfiles (
  usuario    uuid primary key references auth.users (id) on delete cascade,
  numero     integer not null unique check (numero between 10000000 and 99999999),
  nombre     text not null default '' check (char_length(nombre) <= 60),
  idioma     text not null default 'es',
  es_dev     boolean not null default false,
  protegido  boolean not null default false,
  creado     timestamptz not null default now()
);

create table if not exists public.paglot_progreso (
  usuario    uuid not null references auth.users (id) on delete cascade,
  curso      text not null check (curso ~ '^[a-z]{2,8}$'),
  datos      jsonb not null,
  cuando     bigint not null default 0,
  primary key (usuario, curso)
);

-- Lo que da derecho a un plan (la misma tabla para las dos llaves): pagos, regalos, Hucha, Fundadores, Familia.
create table if not exists public.paglot_concesiones (
  referencia text primary key,
  numero     integer not null,
  plan       text not null check (plan in ('plus', 'max', 'familia')),
  hasta      timestamptz,
  origen     text not null,
  creada     timestamptz not null default now()
);
create index if not exists paglot_concesiones_numero on public.paglot_concesiones (numero);

create table if not exists public.paglot_regalos (
  huella     text primary key,
  tipo       text not null check (tipo in ('max-mes', 'max-ano')),
  lote       text not null,
  usado_por  integer,
  usado_en   timestamptz
);

create table if not exists public.paglot_familia (
  titular    integer not null,
  miembro    integer not null unique,
  primary key (titular, miembro)
);

alter table public.paglot_perfiles enable row level security;
alter table public.paglot_progreso enable row level security;
alter table public.paglot_concesiones enable row level security;
alter table public.paglot_regalos enable row level security;
alter table public.paglot_familia enable row level security;
revoke all on public.paglot_perfiles, public.paglot_progreso, public.paglot_concesiones, public.paglot_regalos, public.paglot_familia from anon, authenticated;

-- Que la cuenta protegida (la de desarrollo) no se pueda borrar ni dejar de serlo.
create or replace function public.paglot_proteger() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' and old.protegido then raise exception 'cuenta protegida: no se puede borrar'; end if;
  if tg_op = 'UPDATE' and old.protegido and (not new.protegido or not new.es_dev or new.numero <> old.numero) then
    raise exception 'cuenta protegida: no se puede cambiar';
  end if;
  return coalesce(new, old);
end $$;
drop trigger if exists paglot_perfiles_protegidos on public.paglot_perfiles;
create trigger paglot_perfiles_protegidos before update or delete on public.paglot_perfiles for each row execute function public.paglot_proteger();

create or replace function public.paglot_proteger_auth() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from paglot_perfiles where usuario = old.id and protegido) then raise exception 'cuenta protegida: no se puede borrar'; end if;
  return old;
end $$;
drop trigger if exists paglot_auth_protegidos on auth.users;
create trigger paglot_auth_protegidos before delete on auth.users for each row execute function public.paglot_proteger_auth();

-- El perfil de quien llama (lo crea con un número al azar la primera vez).
create or replace function public.paglot_mi_perfil() returns public.paglot_perfiles
language plpgsql security definer set search_path = public as $$
declare p paglot_perfiles; n integer;
begin
  if auth.uid() is null then raise exception 'sin sesión'; end if;
  select * into p from paglot_perfiles where usuario = auth.uid();
  if found then return p; end if;
  loop
    n := 10000000 + floor(random() * 90000000)::integer;
    exit when not exists (select 1 from paglot_perfiles where numero = n) and n <> 78910021;
  end loop;
  insert into paglot_perfiles (usuario, numero, nombre) values (auth.uid(), n, coalesce(auth.jwt() -> 'user_metadata' ->> 'nombre', ''))
  returning * into p;
  return p;
end $$;

-- El plan de un número: el mejor vigente de sus concesiones, o el de su familia.
create or replace function public.paglot_plan_de(p_numero integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_dev boolean; v_plan text := 'gratis'; v_hasta timestamptz; v_familia text; v_fundador boolean; t integer;
begin
  select es_dev into v_dev from paglot_perfiles where numero = p_numero;
  if coalesce(v_dev, false) then return jsonb_build_object('plan', 'max', 'hasta', null, 'familia', null, 'fundador', false, 'dev', true); end if;
  select case when bool_or(plan = 'max') then 'max' when count(*) > 0 then 'plus' else 'gratis' end,
         case when bool_or(hasta is null) then null else max(hasta) end,
         bool_or(origen = 'fundador'), case when bool_or(plan = 'familia') then 'titular' end
    into v_plan, v_hasta, v_fundador, v_familia
    from paglot_concesiones where numero = p_numero and (hasta is null or hasta > now());
  if v_plan = 'gratis' then
    select titular into t from paglot_familia where miembro = p_numero;
    if t is not null and exists (select 1 from paglot_concesiones where numero = t and plan = 'familia' and (hasta is null or hasta > now())) then
      v_plan := 'plus'; v_familia := 'miembro';
    end if;
  end if;
  return jsonb_build_object('plan', v_plan, 'hasta', v_hasta, 'familia', v_familia, 'fundador', coalesce(v_fundador, false), 'dev', false);
end $$;

-- Lo que la app sabe de la cuenta (como cuenta/yo del PHP).
create or replace function public.paglot_yo() returns jsonb
language plpgsql security definer set search_path = public as $$
declare p paglot_perfiles;
begin
  p := paglot_mi_perfil();
  return jsonb_build_object('numero', p.numero, 'correo', auth.jwt() ->> 'email', 'nombre', p.nombre, 'idioma', p.idioma)
    || paglot_plan_de(p.numero);
end $$;

create or replace function public.paglot_poner_nombre(p_nombre text) returns boolean
language sql security definer set search_path = public as $$
  update paglot_perfiles set nombre = left(coalesce(p_nombre, ''), 60) where usuario = auth.uid() returning true;
$$;

create or replace function public.paglot_progreso_leer() returns jsonb
language sql security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(curso, jsonb_build_object('datos', datos, 'cuando', cuando)), '{}'::jsonb)
  from paglot_progreso where usuario = auth.uid();
$$;

create or replace function public.paglot_progreso_guardar(p_curso text, p_datos jsonb, p_cuando bigint) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sin sesión'; end if;
  if octet_length(p_datos::text) > 2000000 then raise exception 'demasiados datos'; end if;
  insert into paglot_progreso (usuario, curso, datos, cuando) values (auth.uid(), p_curso, p_datos, coalesce(p_cuando, 0))
  on conflict (usuario, curso) do update set datos = excluded.datos, cuando = excluded.cuando;
  return true;
end $$;

-- Canjear un regalo: un solo uso; suma 30 o 365 días de Max a lo que ya tenga.
create or replace function public.paglot_canjear(p_codigo text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p paglot_perfiles; r paglot_regalos; h text; v_desde timestamptz;
begin
  p := paglot_mi_perfil();
  h := encode(digest(upper(regexp_replace(p_codigo, '[^A-Za-z0-9]', '', 'g')), 'sha256'), 'hex');
  select * into r from paglot_regalos where huella = h for update;
  if not found then raise exception 'regalo-no-existe'; end if;
  if r.usado_por is not null then raise exception 'regalo-usado'; end if;
  update paglot_regalos set usado_por = p.numero, usado_en = now() where huella = h;
  select greatest(now(), coalesce(max(hasta), now())) into v_desde from paglot_concesiones where numero = p.numero and plan = 'max' and hasta > now();
  insert into paglot_concesiones (referencia, numero, plan, hasta, origen)
  values ('regalo-' || left(h, 40), p.numero, 'max', coalesce(v_desde, now()) + case when r.tipo = 'max-ano' then interval '365 days' else interval '30 days' end, 'regalo');
  return paglot_yo();
end $$;

create or replace function public.paglot_fundadores_restantes() returns integer
language sql security definer set search_path = public as $$
  select greatest(0, 500 - (select count(*)::integer from paglot_concesiones where origen = 'fundador'));
$$;

-- Familia (local): la titular con plan Familia apunta a alguien por su número; cualquiera puede salirse.
create or replace function public.paglot_familia_anadir(p_numero integer) returns boolean
language plpgsql security definer set search_path = public as $$
declare p paglot_perfiles;
begin
  p := paglot_mi_perfil();
  if (paglot_plan_de(p.numero) ->> 'familia') is distinct from 'titular' then raise exception 'sin-plan'; end if;
  if (select count(*) from paglot_familia where titular = p.numero) >= 5 then raise exception 'familia-llena'; end if;
  insert into paglot_familia (titular, miembro) values (p.numero, p_numero) on conflict (miembro) do update set titular = excluded.titular;
  return true;
end $$;
create or replace function public.paglot_familia_quitar(p_numero integer) returns boolean
language plpgsql security definer set search_path = public as $$
declare p paglot_perfiles;
begin
  p := paglot_mi_perfil();
  delete from paglot_familia where miembro = p_numero and (titular = p.numero or miembro = p.numero);
  return true;
end $$;
create or replace function public.paglot_familia_estado() returns jsonb
language plpgsql security definer set search_path = public as $$
declare p paglot_perfiles; t integer;
begin
  p := paglot_mi_perfil();
  t := coalesce((select titular from paglot_familia where miembro = p.numero), case when (paglot_plan_de(p.numero) ->> 'familia') = 'titular' then p.numero end);
  if t is null then return jsonb_build_object('familia', null); end if;
  return jsonb_build_object('familia', jsonb_build_object('titular', t, 'soyTitular', t = p.numero, 'plazas', 5,
    'miembros', coalesce((select jsonb_agg(jsonb_build_object('numero', f.miembro, 'nombre', pf.nombre)) from paglot_familia f join paglot_perfiles pf on pf.numero = f.miembro where f.titular = t), '[]'::jsonb)));
end $$;

-- Borrar la propia cuenta (no la protegida).
create or replace function public.paglot_borrar_cuenta() returns boolean
language plpgsql security definer set search_path = public, auth as $$
begin
  if exists (select 1 from paglot_perfiles where usuario = auth.uid() and protegido) then raise exception 'protegida'; end if;
  delete from auth.users where id = auth.uid();
  return true;
end $$;

-- ----- La segunda llave de los pagos (solo el servidor PHP, con la clave service_role) -----
create or replace function public.paglot_apuntar_concesion(p_referencia text, p_numero integer, p_plan text, p_hasta timestamptz, p_origen text)
returns boolean language sql security definer set search_path = public as $$
  insert into paglot_concesiones (referencia, numero, plan, hasta, origen) values (p_referencia, p_numero, p_plan, p_hasta, p_origen)
  on conflict (referencia) do nothing returning true;
$$;
create or replace function public.paglot_concesion_valida(p_referencia text, p_numero integer, p_plan text)
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from paglot_concesiones where referencia = p_referencia and numero = p_numero and plan = p_plan and (hasta is null or hasta > now()));
$$;

-- La cuenta de desarrollo: número 78910021, todo desbloqueado, protegida (ejecutar a mano en el SQL Editor).
create or replace function public.paglot_hacer_dev(p_correo text) returns integer
language plpgsql security definer set search_path = public, auth as $$
declare u uuid;
begin
  select id into u from auth.users where lower(email) = lower(p_correo);
  if u is null then raise exception 'no existe esa cuenta: créala antes en la app'; end if;
  delete from paglot_perfiles where numero = 78910021 and usuario <> u and not protegido;
  insert into paglot_perfiles (usuario, numero, nombre, es_dev, protegido) values (u, 78910021, 'Desarrollo', true, true)
  on conflict (usuario) do update set numero = 78910021, es_dev = true, protegido = true;
  return 78910021;
end $$;

create extension if not exists pgcrypto;

revoke all on function public.paglot_apuntar_concesion(text, integer, text, timestamptz, text), public.paglot_concesion_valida(text, integer, text),
  public.paglot_hacer_dev(text), public.paglot_plan_de(integer), public.paglot_mi_perfil() from anon, authenticated, public;
grant execute on function public.paglot_apuntar_concesion(text, integer, text, timestamptz, text), public.paglot_concesion_valida(text, integer, text) to service_role;
grant execute on function public.paglot_yo(), public.paglot_poner_nombre(text), public.paglot_progreso_leer(), public.paglot_progreso_guardar(text, jsonb, bigint),
  public.paglot_canjear(text), public.paglot_familia_anadir(integer), public.paglot_familia_quitar(integer), public.paglot_familia_estado(),
  public.paglot_borrar_cuenta() to authenticated;
grant execute on function public.paglot_fundadores_restantes() to anon, authenticated;
