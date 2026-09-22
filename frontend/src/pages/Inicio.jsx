import { useState } from 'react'
import { Link } from 'react-router'
import { BANNER_INICIO } from '../lib/imagenes'
import { listarEspacios } from '../services/espacios'
import { useDatos } from '../components/useDatos'
import TarjetaEspacio from '../components/TarjetaEspacio'
import Estado from '../components/Estado'

const PASOS = [
  ['1', 'Elija el espacio', 'Salas, laboratorios y auditorio, con su capacidad y ubicación.'],
  ['2', 'Revise la disponibilidad', 'Vea las franjas ocupadas del día antes de escoger su horario.'],
  ['3', 'Reserve y listo', 'La confirmación es inmediata. Puede cancelar hasta 2 horas antes.'],
]

export default function Inicio() {
  const destacados = useDatos(() => listarEspacios())
  // Si existe img/banner/inicio.jpg se usa de fondo; si no, queda el degradado
  const [conFoto, setConFoto] = useState(false)

  return (
    <>
      <section className={`hero ${conFoto ? 'hero-con-foto' : ''}`} aria-labelledby="titulo-hero"
               style={{ '--banner': `url(${BANNER_INICIO})` }}>
        <img src={BANNER_INICIO} alt="" hidden onLoad={() => setConFoto(true)} />
        <div className="contenedor hero-interior">
          <div className="hero-texto">
            <p className="hero-antetitulo">Oficina de recursos físicos</p>
            <h1 id="titulo-hero">Reserve su espacio <span>en minutos</span></h1>
            <p className="hero-descripcion">
              Consulte la disponibilidad de salas, laboratorios y auditorio de la institución y reserve sin intermediarios.
            </p>
            <div className="hero-acciones">
              <Link className="boton boton-acento" to="/espacios">Ver espacios disponibles</Link>
              <Link className="boton boton-contorno" to="/mis-reservas">Mis reservas</Link>
            </div>
          </div>
          <div className="hero-figura" aria-hidden="true">
            <span className="burbuja b1" /><span className="burbuja b2" /><span className="burbuja b3" />
          </div>
        </div>
      </section>

      <section className="contenedor seccion" aria-labelledby="titulo-pasos">
        <h2 id="titulo-pasos" className="titulo-seccion">Cómo funciona</h2>
        <ol className="pasos">
          {PASOS.map(([n, t, d]) => (
            <li key={n}><span className="paso-numero">{n}</span><h3>{t}</h3><p>{d}</p></li>
          ))}
        </ol>
      </section>

      <section className="contenedor seccion" aria-labelledby="titulo-destacados">
        <h2 id="titulo-destacados" className="titulo-seccion">Espacios</h2>
        {destacados.cargando && <Estado tipo="cargando" />}
        {destacados.error && <Estado tipo="error" mensaje={destacados.error} />}
        {destacados.datos?.length > 0 && (
          <ul className="lista-espacios">
            {destacados.datos.slice(0, 3).map((e) => <TarjetaEspacio key={e.id} espacio={e} />)}
          </ul>
        )}
        <p className="centrado"><Link className="boton" to="/espacios">Ver todos los espacios</Link></p>
      </section>
    </>
  )
}
