import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { obtenerPerfil } from '../services/auth'
import { SesionContext } from './sesion'

export function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      setCargando(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => setSesion(nueva))
    return () => data.subscription.unsubscribe()
  }, [])

  const idUsuario = sesion?.user.id
  useEffect(() => {
    if (!idUsuario) return
    let vigente = true
    obtenerPerfil(idUsuario)
      .then((p) => vigente && setPerfil(p))
      .catch(() => vigente && setPerfil(null))
    return () => { vigente = false }
  }, [idUsuario])

  // El perfil solo vale si es del usuario de la sesion actual
  const perfilActual = perfil && perfil.id === idUsuario ? perfil : null

  // esAdmin solo decide que se MUESTRA. Lo que se PERMITE lo decide RLS.
  const valor = { sesion, perfil: perfilActual, cargando, esAdmin: perfilActual?.rol === 'admin' }
  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}
