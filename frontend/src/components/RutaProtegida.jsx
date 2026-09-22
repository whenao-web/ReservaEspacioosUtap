import { Navigate, useLocation } from 'react-router'
import { useSesion } from '../context/sesion'
import Estado from './Estado'

// Protege la NAVEGACION, no los datos. Los datos los protege RLS en la base:
// aunque alguien se salte este componente, la base de datos dice que no.
export default function RutaProtegida({ children, soloAdmin = false }) {
  const { sesion, perfil, cargando } = useSesion()
  const ubicacion = useLocation()

  if (cargando || (sesion && !perfil && soloAdmin)) return <Estado tipo="cargando" />
  if (!sesion) return <Navigate to="/login" state={{ desde: ubicacion.pathname }} replace />
  if (soloAdmin && perfil?.rol !== 'admin') return <Estado tipo="error" mensaje="Esta sección es solo para el administrador." />
  return children
}
