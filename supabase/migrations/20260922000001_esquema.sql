-- ===========================================================================
--  MIGRACION 1 — ESQUEMA
--  Sistema de Reservas de Espacios · Fundacion Tecnologica Autonoma del Pacifico
--
--  Diferencias con el modelo de servidor propio:
--   * No hay tabla "usuarios": Supabase ya tiene auth.users. Aqui se crea
--     "perfiles", que la extiende con nombre y rol.
--   * usuario_id es UUID, porque asi es el id de auth.users.
--   * El estado de la reserva es texto con CHECK y no una tabla aparte:
--     la restriccion EXCLUDE de la migracion 2 se escribe mas clara asi.
--     Las dos opciones son validas; esta se justifica en decisiones.md.
-- ===========================================================================

create extension if not exists btree_gist with schema extensions;

-- ---------- perfiles ------------------------------------------------------
create table public.perfiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text not null check (char_length(nombre) between 2 and 100),
  rol        text not null default 'usuario' check (rol in ('usuario', 'admin')),
  creado_en  timestamptz not null default now()
);

-- ---------- tipos_espacio -------------------------------------------------
create table public.tipos_espacio (
  id           bigint generated always as identity primary key,
  nombre       text not null unique,
  descripcion  text
);

-- ---------- espacios ------------------------------------------------------
create table public.espacios (
  id               bigint generated always as identity primary key,
  tipo_espacio_id  bigint not null references public.tipos_espacio (id),
  nombre           text   not null unique,
  capacidad        integer not null check (capacidad > 0 and capacidad <= 500),
  ubicacion        text,
  activo           boolean not null default true,
  creado_en        timestamptz not null default now()
);

-- ---------- reservas ------------------------------------------------------
create table public.reservas (
  id            bigint generated always as identity primary key,
  usuario_id    uuid   not null default auth.uid() references auth.users (id),
  espacio_id    bigint not null references public.espacios (id),
  estado        text   not null default 'confirmada'
                check (estado in ('confirmada', 'cancelada')),
  fecha         date   not null,
  hora_inicio   time   not null,
  hora_fin      time   not null,
  motivo        text   check (char_length(motivo) <= 200),
  creada_en     timestamptz not null default now(),
  cancelada_en  timestamptz,
  -- Impide tambien que una reserva cruce la medianoche. Es una decision de
  -- negocio: se confirma con el cliente y se documenta.
  constraint chk_horas    check (hora_fin > hora_inicio),
  constraint chk_duracion check (hora_fin - hora_inicio
                                 between interval '30 minutes' and interval '4 hours')
);

create index idx_reservas_usuario       on public.reservas (usuario_id);
create index idx_reservas_espacio_fecha on public.reservas (espacio_id, fecha);
