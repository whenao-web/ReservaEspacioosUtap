-- ===========================================================================
--  MIGRACION 3 — SEGURIDAD: PERFILES, PERMISOS Y ROW LEVEL SECURITY
--
--  La clave publicable viaja en el JavaScript del navegador y cualquiera la
--  puede leer. Lo que protege los datos no es la clave: es este archivo.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Perfil automatico al registrarse.
-- ATENCION: raw_user_meta_data lo escribe el propio usuario al registrarse.
-- Se toma de ahi el NOMBRE, nunca el ROL. Si el rol se leyera de ahi,
-- cualquiera podria registrarse como administrador.
-- ---------------------------------------------------------------------------
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''),
             split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ---------------------------------------------------------------------------
-- ¿El usuario de esta peticion es administrador?
-- security definer: consulta perfiles sin quedar atrapada en su propio RLS.
-- ---------------------------------------------------------------------------
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
     where id = auth.uid() and rol = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Activar RLS en TODAS las tablas. Una tabla sin RLS es una tabla publica.
-- ---------------------------------------------------------------------------
alter table public.perfiles       enable row level security;
alter table public.tipos_espacio  enable row level security;
alter table public.espacios       enable row level security;
alter table public.reservas       enable row level security;

-- ---------------------------------------------------------------------------
-- Privilegios: solo lo necesario, rol por rol
-- ---------------------------------------------------------------------------
revoke all on public.perfiles, public.tipos_espacio, public.espacios, public.reservas
  from anon, authenticated;

grant select on public.tipos_espacio, public.espacios to anon, authenticated;
grant insert, update, delete on public.tipos_espacio, public.espacios to authenticated;

grant select, insert on public.reservas to authenticated;
-- Sin UPDATE ni DELETE sobre reservas: cancelar se hace con cancelar_reserva()

grant select on public.perfiles to authenticated;
grant update (nombre) on public.perfiles to authenticated;
-- UPDATE solo de la columna nombre: el usuario no puede cambiarse el rol

-- ---------------------------------------------------------------------------
-- Politicas
-- ---------------------------------------------------------------------------

-- perfiles
create policy "ver el propio perfil, o todos si es admin"
  on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_admin());

create policy "editar el propio nombre"
  on public.perfiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- tipos_espacio
create policy "cualquiera ve los tipos"
  on public.tipos_espacio for select to anon, authenticated
  using (true);

create policy "solo admin crea tipos"
  on public.tipos_espacio for insert to authenticated
  with check (public.es_admin());

create policy "solo admin edita tipos"
  on public.tipos_espacio for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy "solo admin borra tipos"
  on public.tipos_espacio for delete to authenticated
  using (public.es_admin());

-- espacios  (REGLA 6: los inactivos solo los ve el administrador)
create policy "ver espacios activos, o todos si es admin"
  on public.espacios for select to anon, authenticated
  using (activo or public.es_admin());

create policy "solo admin crea espacios"
  on public.espacios for insert to authenticated
  with check (public.es_admin());

create policy "solo admin edita espacios"
  on public.espacios for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy "solo admin borra espacios"
  on public.espacios for delete to authenticated
  using (public.es_admin());

-- reservas
create policy "ver las propias, o todas si es admin"
  on public.reservas for select to authenticated
  using (usuario_id = auth.uid() or public.es_admin());

create policy "crear solo a nombre propio"
  on public.reservas for insert to authenticated
  with check (usuario_id = auth.uid());
