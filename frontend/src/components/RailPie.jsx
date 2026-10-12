// components/RailPie.jsx — pie del raíl con el estado real del sistema.
// Pinga /api/salud para saber si la API responde, e indica entorno y turno.
import { useEffect, useState } from 'react'
import { pedir } from '../api/client'

// Entorno según cómo se sirva la app: en localhost es «Desarrollo».
const ENTORNO = window.location.hostname === 'localhost' ? 'Desarrollo' : 'Producción'

function turnoDeAhora() {
  const hora = new Date().getHours()
  if (hora >= 6 && hora < 14) return 'Turno mañana'
  if (hora >= 14 && hora < 22) return 'Turno tarde'
  return 'Turno noche'
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function selloFecha() {
  const f = new Date()
  return `${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()}`
}

export default function RailPie() {
  const [estado, setEstado] = useState('comprobando') // comprobando | conectado | sin-conexion

  useEffect(() => {
    let vivo = true

    async function ping() {
      try {
        await pedir('/salud')
        if (vivo) setEstado('conectado')
      } catch {
        if (vivo) setEstado('sin-conexion')
      }
    }

    ping()
    const intervalo = setInterval(ping, 30000) // recheck cada 30 s
    return () => {
      vivo = false
      clearInterval(intervalo)
    }
  }, [])

  const conectado = estado === 'conectado'

  return (
    <footer className="rail-pie">
      <div className="rail-estado">
        <span
          className={`rail-punto rail-punto--${estado}`}
          aria-hidden="true"
        />
        <span className="rail-estado-texto">
          {estado === 'comprobando'
            ? 'Conectando…'
            : conectado
              ? 'Servidor conectado'
              : 'Servidor sin conexión'}
        </span>
      </div>

      <dl className="rail-datos">
        <div className="rail-dato">
          <dt>Entorno</dt>
          <dd>{ENTORNO}</dd>
        </div>
        <div className="rail-dato">
          <dt>Centro</dt>
          <dd>Tienda principal</dd>
        </div>
        <div className="rail-dato">
          <dt>Fecha de cierre</dt>
          <dd>{selloFecha()}</dd>
        </div>
      </dl>

      <p className="rail-version-pie">v1.0 · {turnoDeAhora()}</p>
    </footer>
  )
}
