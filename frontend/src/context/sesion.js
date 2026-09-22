import { createContext, useContext } from 'react'

export const SesionContext = createContext(null)

// { sesion, perfil, cargando, esAdmin }
export const useSesion = () => useContext(SesionContext)
