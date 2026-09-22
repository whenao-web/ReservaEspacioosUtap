import { supabase } from '../lib/supabase'

const CAMPOS = 'id, nombre, capacidad, ubicacion, imagen, activo, tipo_espacio_id, tipos_espacio(nombre)'

// Aplana la relacion para que el componente reciba la forma del contrato
const plano = (e) => ({ ...e, tipo: e.tipos_espacio?.nombre ?? '', tipos_espacio: undefined })

// Lista espacios. RLS decide: el publico ve solo activos; el admin ve todos.
export async function listarEspacios({ tipo, capacidadMin } = {}) {
  let consulta = supabase.from('espacios').select(CAMPOS).order('nombre')
  if (capacidadMin) consulta = consulta.gte('capacidad', capacidadMin)
  const { data, error } = await consulta
  if (error) throw error
  const lista = data.map(plano)
  return tipo ? lista.filter((e) => e.tipo === tipo) : lista
}

export async function listarTipos() {
  const { data, error } = await supabase.from('tipos_espacio').select('id, nombre').order('nombre')
  if (error) throw error
  return data
}

// Franjas ocupadas de un espacio en una fecha: solo las horas, sin datos de quien
export async function disponibilidad(espacioId, fecha) {
  const { data, error } = await supabase.rpc('disponibilidad', { p_espacio_id: espacioId, p_fecha: fecha })
  if (error) throw error
  return data
}

// ---------- administrador (RLS rechaza a cualquier otro) ----------
export async function crearEspacio(espacio) {
  const { data, error } = await supabase.from('espacios').insert(espacio).select(CAMPOS).single()
  if (error) throw error
  return plano(data)
}

export async function actualizarEspacio(id, cambios) {
  const { data, error } = await supabase.from('espacios').update(cambios).eq('id', id).select(CAMPOS).single()
  if (error) throw error
  return plano(data)
}

export const cambiarEstadoEspacio = (id, activo) => actualizarEspacio(id, { activo })

export async function eliminarEspacio(id) {
  const { error } = await supabase.from('espacios').delete().eq('id', id)
  if (error) throw error
}
