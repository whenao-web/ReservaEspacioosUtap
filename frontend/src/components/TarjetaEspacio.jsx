import { useState } from 'react'
import { Link } from 'react-router'
import { imagenesDeEspacio } from '../lib/imagenes'

export default function TarjetaEspacio({ espacio }) {
  const candidatas = imagenesDeEspacio(espacio)
  const [intento, setIntento] = useState(0)
  const esIlustracion = intento === candidatas.length - 1
  // Si una imagen no existe, pasa a la siguiente candidata
  const siguiente = () => setIntento((i) => Math.min(i + 1, candidatas.length - 1))

  return (
    <li>
      <article className="tarjeta-espacio">
        <div className="tarjeta-imagen">
          {/* La foto describe el espacio; la ilustracion es decorativa */}
          <img src={candidatas[intento]} alt={esIlustracion ? '' : `Fotografía de ${espacio.nombre}`}
               loading="lazy" onError={siguiente} />
          <span className="etiqueta-tipo">{espacio.tipo}</span>
          <h2>{espacio.nombre}</h2>
        </div>
        <div className="tarjeta-cuerpo">
          <dl>
            <dt>Capacidad</dt><dd>{espacio.capacidad} personas</dd>
            <dt>Ubicación</dt><dd>{espacio.ubicacion}</dd>
          </dl>
          <Link className="boton" to={`/reservar?espacio=${espacio.id}`}>Reservar {espacio.nombre}</Link>
        </div>
      </article>
    </li>
  )
}
