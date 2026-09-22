import { supabase } from '../lib/supabase'

export async function registrar({ nombre, correo, password }) {
  // "nombre" viaja en los metadatos y lo lee el disparador crear_perfil().
  // El rol NO se envia: lo decide la base de datos, nunca el navegador.
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password,
    options: { data: { nombre } },
  })
  if (error) throw error
  return data
}

export async function iniciarSesion({ correo, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password })
  if (error) throw error
  return data
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function obtenerPerfil(idUsuario) {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre, rol')
    .eq('id', idUsuario)
    .single()
  if (error) throw error
  return data
}
