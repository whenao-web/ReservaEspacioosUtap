import { supabase } from '../lib/supabase'

// usuario_id NO se envia: la base de datos lo toma de la sesion (default auth.uid())
// y RLS rechaza cualquier intento de reservar a nombre de otro.
export async function crearReserva({ espacio_id, fecha, hora_inicio, hora_fin, motivo }) {
  const { data, error } = await supabase
    .from('reservas')
    .insert({ espacio_id: Number(espacio_id), fecha, hora_inicio, hora_fin, motivo: motivo || null })
    .select()
    .single()
  if (error) throw error
  return data
}

// Vista mis_reservas: trae "cancelable" calculado en el servidor
export async function misReservas() {
  const { data, error } = await supabase
    .from('mis_reservas')
    .select('*')
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: false })
  if (error) throw error
  return data
}

export async function cancelarReserva(id) {
  const { data, error } = await supabase.rpc('cancelar_reserva', { p_reserva_id: id })
  if (error) throw error
  return data
}

// ---------- administrador ----------
export async function todasLasReservas({ fecha, espacioId } = {}) {
  let consulta = supabase
    .from('reservas')
    .select('id, fecha, hora_inicio, hora_fin, estado, motivo, espacios(nombre)')
    .order('fecha', { ascending: false })
    .order('hora_inicio')
  if (fecha) consulta = consulta.eq('fecha', fecha)
  if (espacioId) consulta = consulta.eq('espacio_id', espacioId)
  const { data, error } = await consulta
  if (error) throw error
  return data
}

export async function reporteOcupacion(desde, hasta) {
  const { data, error } = await supabase.rpc('reporte_ocupacion', { p_desde: desde, p_hasta: hasta })
  if (error) throw error
  return data
}
