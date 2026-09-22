-- ===========================================================================
--  MIGRACION 4 — LO QUE NO ES CRUD: FUNCIONES Y VISTAS
--  Se llaman desde el frontend con supabase.rpc('nombre', { parametros })
--
--  Toda funcion nace ejecutable por PUBLIC. Por eso a cada una se le quita
--  ese permiso y se le da solo al rol que la necesita.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Disponibilidad de un espacio en una fecha.
-- El usuario NO puede leer las reservas de otros (RLS), pero necesita saber
-- que franjas estan ocupadas. Esta funcion devuelve SOLO las horas:
-- ni quien reservo, ni para que.
-- ---------------------------------------------------------------------------
create or replace function public.disponibilidad(p_espacio_id bigint, p_fecha date)
returns table (hora_inicio time, hora_fin time)
language sql
stable
security definer
set search_path = ''
as $$
  select r.hora_inicio, r.hora_fin
    from public.reservas r
    join public.espacios e on e.id = r.espacio_id
   where r.espacio_id = p_espacio_id
     and r.fecha      = p_fecha
     and r.estado     = 'confirmada'
     and (e.activo or public.es_admin())
   order by r.hora_inicio;
$$;

revoke execute on function public.disponibilidad(bigint, date) from public;
grant  execute on function public.disponibilidad(bigint, date) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Cancelar una reserva.
-- Es la UNICA forma de modificar una reserva. La regla 4 la aplica el
-- disparador de la migracion 2, aunque alguien llegue por otro camino.
-- ---------------------------------------------------------------------------
create or replace function public.cancelar_reserva(p_reserva_id bigint)
returns public.reservas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reserva public.reservas;
begin
  select * into v_reserva from public.reservas where id = p_reserva_id;

  if not found then
    raise exception 'NO_ENCONTRADA' using hint = 'La reserva no existe';
  end if;

  if v_reserva.usuario_id <> auth.uid() and not public.es_admin() then
    raise exception 'NO_AUTORIZADO' using hint = 'La reserva es de otro usuario';
  end if;

  if v_reserva.estado = 'cancelada' then
    raise exception 'YA_CANCELADA' using hint = 'La reserva ya estaba cancelada';
  end if;

  update public.reservas
     set estado = 'cancelada'
   where id = p_reserva_id
  returning * into v_reserva;

  return v_reserva;
end;
$$;

revoke execute on function public.cancelar_reserva(bigint) from public;
grant  execute on function public.cancelar_reserva(bigint) to authenticated;

-- ---------------------------------------------------------------------------
-- Mis reservas, con el campo "cancelable" calculado AQUI y no en el frontend:
-- si el frontend repitiera la cuenta de las 2 horas, habria dos versiones de
-- la misma regla, y algun dia dirian cosas distintas.
-- security_invoker: la vista respeta el RLS de quien la consulta.
-- ---------------------------------------------------------------------------
create or replace view public.mis_reservas
with (security_invoker = true)
as
select r.id,
       r.espacio_id,
       e.nombre as espacio_nombre,
       r.fecha,
       r.hora_inicio,
       r.hora_fin,
       r.motivo,
       r.estado,
       r.cancelada_en,
       (r.estado = 'confirmada'
        and public.momento_local(r.fecha, r.hora_inicio) - now() >= interval '2 hours')
         as cancelable
  from public.reservas r
  join public.espacios e on e.id = r.espacio_id
 where r.usuario_id = auth.uid();

grant select on public.mis_reservas to authenticated;

-- ---------------------------------------------------------------------------
-- Reporte de ocupacion (solo administrador).
-- Los filtros de fecha y estado van en el ON del LEFT JOIN, no en el WHERE:
-- en el WHERE convertirian el LEFT JOIN en INNER JOIN y los espacios sin
-- reservas desaparecerian del reporte, que es justo el dato que interesa.
-- ---------------------------------------------------------------------------
create or replace function public.reporte_ocupacion(p_desde date, p_hasta date)
returns table (
  espacio           text,
  reservas          bigint,
  horas_reservadas  numeric,
  horas_canceladas  numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'NO_AUTORIZADO' using hint = 'Solo el administrador ve el reporte';
  end if;
  if p_desde is null or p_hasta is null or p_desde > p_hasta then
    raise exception 'RANGO_INVALIDO' using hint = 'La fecha inicial debe ser anterior a la final';
  end if;

  return query
  select e.nombre,
         count(r.id) filter (where r.estado = 'confirmada'),
         coalesce(round(sum(extract(epoch from r.hora_fin - r.hora_inicio) / 3600)
                  filter (where r.estado = 'confirmada'), 2), 0),
         coalesce(round(sum(extract(epoch from r.hora_fin - r.hora_inicio) / 3600)
                  filter (where r.estado = 'cancelada'), 2), 0)
    from public.espacios e
    left join public.reservas r
           on r.espacio_id = e.id
          and r.fecha between p_desde and p_hasta
   group by e.id, e.nombre
   order by 3 desc, e.nombre;
end;
$$;

revoke execute on function public.reporte_ocupacion(date, date) from public;
grant  execute on function public.reporte_ocupacion(date, date) to authenticated;
