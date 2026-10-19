-- =====================================================================
-- PAGLOT · ERRORES ANÓNIMOS, IDEAS DEL LABORATORIO Y CORREO TAPADO (19-10-2026)
--
-- 1) Errores: si la app falla en el móvil o el navegador de alguien, manda un aviso anónimo: el error, la pantalla
--    (#/leccion/012), el curso, la versión de la app y el navegador («Chrome 141 · Android»). Nada personal: ni el
--    número de cuenta, ni el correo, ni lo que se ha escrito. Los iguales del mismo día se cuentan en una sola fila.
--    Se borran solos a los 90 días. Para verlos: Table Editor → paglot_errores (o la consulta de abajo).
-- 2) Laboratorio (#/laboratorio): las ideas y los votos, los mismos para todos. Cada dispositivo vota con una marca al
--    azar (no con su número de cuenta). Límites: 3 ideas por dispositivo y día, 60 ideas nuevas por hora en total,
--    sin enlaces; una idea con 3 avisos de «no cumple las normas» se oculta sola hasta que la revises.
-- 3) Un arreglo de las cuentas: el correo unido a una cuenta se devuelve tapado.
-- 4) Arreglos de seguridad de las cuentas: freno a quien prueba números al azar, no se puede cambiar el correo de una
--    cuenta que ya tiene uno, y borrar una cuenta borra también su correo.
--
-- Cómo se ejecuta: Supabase → el proyecto → SQL Editor → New query → pegar TODO → Run.
-- Se puede ejecutar varias veces: no borra datos. Mientras no se ejecute, la app no manda errores y el laboratorio
-- guarda las ideas solo en cada navegador, como hasta ahora.
--
-- Consultas útiles:
--   select * from paglot_errores order by ultima desc limit 50;               -- los últimos errores
--   select * from paglot_ideas where oculta order by creada desc;              -- ideas ocultadas por avisos
--   update paglot_ideas set oculta = false, denuncias = 0 where id = '…';      -- devolver una idea a la estantería
--   delete from paglot_ideas where id = '…';                                   -- borrarla del todo
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) ERRORES
-- ---------------------------------------------------------------------
create table if not exists public.paglot_errores (
  id        bigint generated always as identity primary key,
  dia       date not null default current_date,
  mensaje   text not null,
  donde     text not null default '',   -- archivo:línea:columna dentro de la app
  pantalla  text not null default '',   -- la ruta, sin nada más
  curso     text not null default '',
  version   text not null default '',
  navegador text not null default '',
  veces     integer not null default 1,
  primera   timestamptz not null default now(),
  ultima    timestamptz not null default now(),
  unique (dia, mensaje, donde, version, navegador)
);
alter table public.paglot_errores enable row level security;
revoke all on public.paglot_errores from anon, authenticated;

-- Apunta un error. Textos recortados; como mucho 300 filas nuevas cada 10 minutos (si no, se ignoran: un error que
-- se repite en todos los móviles ya está apuntado). Los de hace más de 90 días se borran.
create or replace function public.paglot_error(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_mensaje text := left(coalesce(p ->> 'mensaje', ''), 300);
begin
  if v_mensaje = '' then return; end if;
  delete from paglot_errores where ultima < now() - interval '90 days';
  update paglot_errores set veces = veces + 1, ultima = now()
    where dia = current_date and mensaje = v_mensaje and donde = left(coalesce(p ->> 'donde', ''), 200)
      and version = left(coalesce(p ->> 'version', ''), 40) and navegador = left(coalesce(p ->> 'navegador', ''), 60);
  if found then return; end if;
  if (select count(*) from paglot_errores where primera > now() - interval '10 minutes') >= 300 then return; end if;
  insert into paglot_errores (mensaje, donde, pantalla, curso, version, navegador)
  values (v_mensaje, left(coalesce(p ->> 'donde', ''), 200), left(coalesce(p ->> 'pantalla', ''), 80),
          left(coalesce(p ->> 'curso', ''), 8), left(coalesce(p ->> 'version', ''), 40), left(coalesce(p ->> 'navegador', ''), 60))
  on conflict do nothing;
end $$;

-- ---------------------------------------------------------------------
-- 2) LABORATORIO DE IDEAS
-- ---------------------------------------------------------------------
create table if not exists public.paglot_ideas (
  id        uuid primary key default gen_random_uuid(),
  texto     text not null check (char_length(texto) between 3 and 180),
  autora    text not null default '' check (char_length(autora) <= 32),
  votos     integer not null default 0,
  denuncias integer not null default 0,
  oculta    boolean not null default false,
  quien     text not null,                 -- la marca al azar del dispositivo que la propuso (para el límite diario)
  creada    timestamptz not null default now()
);
create index if not exists paglot_ideas_creada on public.paglot_ideas (creada);

create table if not exists public.paglot_votos (
  idea  uuid not null references public.paglot_ideas (id) on delete cascade,
  quien text not null,
  primary key (idea, quien)
);
create table if not exists public.paglot_denuncias (
  idea  uuid not null references public.paglot_ideas (id) on delete cascade,
  quien text not null,
  primary key (idea, quien)
);
alter table public.paglot_ideas enable row level security;
alter table public.paglot_votos enable row level security;
alter table public.paglot_denuncias enable row level security;
revoke all on public.paglot_ideas, public.paglot_votos, public.paglot_denuncias from anon, authenticated;

-- Las ideas a la vista (las 200 más votadas), y cuáles ha votado este dispositivo.
create or replace function public.paglot_ideas_ver(p_quien text)
returns jsonb language sql security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', i.id, 'texto', i.texto, 'autora', i.autora, 'votos', i.votos,
    'creada', (extract(epoch from i.creada) * 1000)::bigint,
    'votada', exists (select 1 from paglot_votos v where v.idea = i.id and v.quien = p_quien)
  ) order by i.votos desc, i.creada), '[]'::jsonb)
  from (select * from paglot_ideas where not oculta order by votos desc, creada limit 200) i;
$$;

-- Una idea nueva. Devuelve su id. Errores con nombre para que la app diga qué pasa: «enlace», «limite», «texto».
create or replace function public.paglot_idea_nueva(p_quien text, p_texto text, p_autora text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_texto text := btrim(coalesce(p_texto, ''));
  v_autora text := left(btrim(coalesce(p_autora, '')), 32);
  v_id uuid;
begin
  if p_quien !~ '^[0-9a-f]{32}$' then raise exception 'quien'; end if;
  if char_length(v_texto) < 3 or char_length(v_texto) > 180 then raise exception 'texto'; end if;
  if v_texto ~* '(https?://|www\.|\.(com|net|org|io|es|ly)\b)' or v_autora ~* '(https?://|www\.)' then raise exception 'enlace'; end if;
  if (select count(*) from paglot_ideas where quien = p_quien and creada > now() - interval '1 day') >= 3 then raise exception 'limite'; end if;
  if (select count(*) from paglot_ideas where creada > now() - interval '1 hour') >= 60 then raise exception 'limite'; end if;
  insert into paglot_ideas (texto, autora, quien) values (v_texto, v_autora, p_quien) returning id into v_id;
  return v_id;
end $$;

-- Pone o quita el voto de este dispositivo. Devuelve los votos que tiene la idea.
create or replace function public.paglot_votar(p_quien text, p_idea uuid, p_si boolean)
returns integer language plpgsql security definer set search_path = public as $$
declare v integer;
begin
  if p_quien !~ '^[0-9a-f]{32}$' then raise exception 'quien'; end if;
  if p_si then
    insert into paglot_votos (idea, quien) values (p_idea, p_quien) on conflict do nothing;
  else
    delete from paglot_votos where idea = p_idea and quien = p_quien;
  end if;
  update paglot_ideas set votos = (select count(*) from paglot_votos where idea = p_idea) where id = p_idea returning votos into v;
  return coalesce(v, 0);
end $$;

-- Avisa de que una idea no cumple las normas. Con 3 avisos de dispositivos distintos, se oculta.
create or replace function public.paglot_denunciar(p_quien text, p_idea uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_quien !~ '^[0-9a-f]{32}$' then raise exception 'quien'; end if;
  insert into paglot_denuncias (idea, quien) values (p_idea, p_quien) on conflict do nothing;
  update paglot_ideas set denuncias = (select count(*) from paglot_denuncias where idea = p_idea) where id = p_idea;
  update paglot_ideas set oculta = true where id = p_idea and denuncias >= 3;
end $$;

grant execute on function public.paglot_error(jsonb), public.paglot_ideas_ver(text), public.paglot_idea_nueva(text, text, text),
  public.paglot_votar(text, uuid, boolean), public.paglot_denunciar(text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3) ARREGLO DE LAS CUENTAS: el correo unido a una cuenta se enseña tapado («j•••@gmail.com»). Quien solo sabe el
--    número de una cuenta ya no se entera del correo entero (la app solo lo necesita para recordártelo).
-- ---------------------------------------------------------------------
create or replace function public.paglot_correo(p_numero text)
returns text language sql security definer set search_path = public as $$
  select case when correo is null then null
              else left(split_part(correo, '@', 1), 1) || '•••@' || split_part(correo, '@', 2) end
  from paglot_cuentas where numero = p_numero;
$$;

-- ---------------------------------------------------------------------
-- 4) ARREGLOS DE SEGURIDAD DE LAS CUENTAS (de _notas/INFORME_BASES_DE_DATOS_2026-10-19)
-- ---------------------------------------------------------------------
-- a) Adivinar números: cada consulta de un número que no existe se apunta (sin IP ni nada más: solo la hora). Si en el
--    último minuto van más de 120 en total, se deja de responder un rato: probar números al azar deja de servir (con
--    16 cifras, a ese ritmo haría falta más de un siglo para acertar uno), y quien entra con su número no lo nota.
create table if not exists public.paglot_fallos (cuando timestamptz not null default now());
create index if not exists paglot_fallos_cuando on public.paglot_fallos (cuando);
alter table public.paglot_fallos enable row level security;
revoke all on public.paglot_fallos from anon, authenticated;

create or replace function public.paglot_fallo()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from paglot_fallos where cuando < now() - interval '10 minutes';
  if (select count(*) from paglot_fallos where cuando > now() - interval '1 minute') >= 120 then
    raise exception 'demasiados intentos';
  end if;
  insert into paglot_fallos default values;
end $$;
revoke all on function public.paglot_fallo() from anon, authenticated, public;

create or replace function public.paglot_leer(p_numero text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  perform paglot_limpiar();
  update paglot_cuentas set usada = now() where numero = p_numero returning datos into v;
  if not found then perform paglot_fallo(); end if;
  return v;
end $$;

create or replace function public.paglot_existe(p_numero text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from paglot_cuentas where numero = p_numero) then return true; end if;
  perform paglot_fallo();
  return false;
end $$;

-- b) Unir un correo: si la cuenta ya tiene otro correo unido, no se cambia (si no, quien supiera el número podría
--    quitarle al dueño la forma de recuperarla).
create or replace function public.paglot_vincular(p_numero text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'hace falta verificar el correo'; end if;
  if exists (select 1 from paglot_cuentas where numero = p_numero and usuario is not null and usuario <> auth.uid()) then
    raise exception 'ya tiene correo';
  end if;
  -- un correo, una cuenta: si ya tenía otra, se suelta
  update paglot_cuentas set usuario = null, correo = null where usuario = auth.uid() and numero <> p_numero;
  update paglot_cuentas set usuario = auth.uid(), correo = auth.jwt() ->> 'email', usada = now() where numero = p_numero;
  return found;
end $$;

-- c) Borrar una cuenta borra también su correo de Supabase Auth (antes se quedaba allí).
create or replace function public.paglot_borrar(p_numero text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_usuario uuid;
begin
  delete from paglot_cuentas where numero = p_numero returning usuario into v_usuario;
  if not found then return false; end if;
  if v_usuario is not null then delete from auth.users where id = v_usuario; end if;
  return true;
end $$;

grant execute on function public.paglot_leer(text), public.paglot_existe(text), public.paglot_borrar(text) to anon, authenticated;
grant execute on function public.paglot_vincular(text) to authenticated;
