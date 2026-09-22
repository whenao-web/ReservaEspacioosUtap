-- ===========================================================================
--  MIGRACION 2 — LAS REGLAS DE NEGOCIO
--  Cada regla dice su numero. Cada error lleva un codigo en MAYUSCULAS, que es
--  el mismo que usa el frontend para mostrar el mensaje (ver errores.js).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Hora local de Colombia.
-- now() en Supabase esta en UTC. Las reservas se escriben en hora local.
-- Sin esta conversion, la regla de las 2 horas se equivoca por 5 horas.
-- ---------------------------------------------------------------------------
create or replace function public.momento_local(p_fecha date, p_hora time)
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select (p_fecha + p_hora) at time zone 'America/Bogota';
$$;

-- ---------------------------------------------------------------------------
-- REGLAS 1, 2 y 3 — sin solapamiento, adyacentes validas, cancelar libera
--   1: EXCLUDE impide dos rangos que se crucen en el mismo espacio
--   2: '[)' deja abierto el limite superior: 10-12 y 12-14 no chocan
--   3: WHERE estado = 'confirmada': una cancelada ya no ocupa la franja
-- Error que produce: codigo 23P01 (exclusion_violation)
-- ---------------------------------------------------------------------------
alter table public.reservas
  add constraint sin_solapamiento
  exclude using gist (
    espacio_id with =,
    tsrange(fecha + hora_inicio, fecha + hora_fin, '[)') with &&
  )
  where (estado = 'confirmada');

-- ---------------------------------------------------------------------------
-- REGLAS 5 y 6, y fecha no pasada — al crear una reserva
-- ---------------------------------------------------------------------------
create or replace function public.validar_nueva_reserva()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activo  boolean;
  v_activas integer;
begin
  -- REGLA 6: el espacio debe existir y estar activo
  select activo into v_activo from public.espacios where id = new.espacio_id;
  if v_activo is distinct from true then
    raise exception 'ESPACIO_INACTIVO'
      using hint = 'El espacio no existe o no acepta reservas nuevas';
  end if;

  if public.momento_local(new.fecha, new.hora_inicio) <= now() then
    raise exception 'FECHA_PASADA'
      using hint = 'No se puede reservar una franja que ya empezo';
  end if;

  -- REGLA 5: maximo 3 reservas activas.
  -- El candado serializa las reservas de un MISMO usuario: sin el, dos
  -- pestanas enviando al mismo tiempo podrian contar 2 y 2, y dejar 4.
  perform pg_advisory_xact_lock(hashtextextended(new.usuario_id::text, 0));

  select count(*) into v_activas
    from public.reservas
   where usuario_id = new.usuario_id
     and estado = 'confirmada'
     and public.momento_local(fecha, hora_inicio) > now();

  if v_activas >= 3 then
    raise exception 'LIMITE_RESERVAS'
      using hint = 'Ya tiene 3 reservas activas';
  end if;

  -- Nadie crea una reserva ya cancelada ni con fecha de cancelacion
  new.estado       := 'confirmada';
  new.cancelada_en := null;
  return new;
end;
$$;

create trigger trg_validar_nueva_reserva
  before insert on public.reservas
  for each row execute function public.validar_nueva_reserva();

-- ---------------------------------------------------------------------------
-- REGLA 4, e inmutabilidad — al modificar una reserva
-- Una reserva solo puede pasar de confirmada a cancelada. Nada mas cambia.
-- ---------------------------------------------------------------------------
create or replace function public.validar_cambio_reserva()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.usuario_id, new.espacio_id, new.fecha, new.hora_inicio, new.hora_fin, new.motivo)
     is distinct from
     (old.usuario_id, old.espacio_id, old.fecha, old.hora_inicio, old.hora_fin, old.motivo) then
    raise exception 'RESERVA_INMUTABLE'
      using hint = 'Una reserva no se edita: se cancela y se crea otra';
  end if;

  if old.estado = 'cancelada' and new.estado = 'confirmada' then
    raise exception 'NO_REACTIVABLE'
      using hint = 'Una reserva cancelada no se puede reactivar';
  end if;

  -- REGLA 4: no se cancela con menos de 2 horas de anticipacion
  if old.estado = 'confirmada' and new.estado = 'cancelada' then
    if public.momento_local(old.fecha, old.hora_inicio) - now() < interval '2 hours' then
      raise exception 'FUERA_DE_PLAZO'
        using hint = 'No se puede cancelar con menos de 2 horas de anticipacion';
    end if;
    new.cancelada_en := now();
  end if;

  return new;
end;
$$;

create trigger trg_validar_cambio_reserva
  before update on public.reservas
  for each row execute function public.validar_cambio_reserva();
