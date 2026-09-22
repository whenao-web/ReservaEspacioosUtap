import { useEffect, useEffectEvent, useState } from 'react'
import { traducirError } from '../lib/errores'

// Carga datos con una funcion de services/ y expone los tres estados.
//   const { datos, error, cargando, recargar } = useDatos(() => listarEspacios(f), [f])
// "dependencias": cuando cambian, se vuelve a cargar.
// "recargar": vuelve a pedir los datos despues de una accion (crear, cancelar...).
export function useDatos(cargar, dependencias = []) {
  const [version, setVersion] = useState(0)
  const [resultado, setResultado] = useState({ id: null, datos: null, error: '' })
  const ejecutar = useEffectEvent(() => cargar())
  const id = `${JSON.stringify(dependencias)}#${version}`

  useEffect(() => {
    // "vigente" evita que una respuesta vieja pise a una nueva: si el usuario
    // cambia el filtro dos veces rapido, la primera respuesta puede llegar tarde.
    let vigente = true
    ejecutar()
      .then((datos) => vigente && setResultado({ id, datos, error: '' }))
      .catch((e) => vigente && setResultado({ id, datos: null, error: traducirError(e) }))
    return () => { vigente = false }
  }, [id])

  const cargando = resultado.id !== id
  return {
    datos: cargando ? null : resultado.datos,
    error: cargando ? '' : resultado.error,
    cargando,
    recargar: () => setVersion((v) => v + 1),
  }
}
