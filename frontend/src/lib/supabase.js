import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const clave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !clave) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY. ' +
    'Copie .env.example como .env.local y complete los valores.'
  )
}

// El UNICO cliente de Supabase de toda la aplicacion.
// Ningun componente lo importa directamente: solo los archivos de services/.
export const supabase = createClient(url, clave)
