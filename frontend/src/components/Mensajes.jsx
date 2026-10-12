// components/Mensajes.jsx — estados vacíos, errores y carga, con tono sobrio.
// Los roles ARIA permiten que un lector de pantalla anuncie el error o la
// carga sin que el usuario tenga que buscar el cambio.
export function Cargando({ texto = 'Cargando…' }) {
  return (
    <p className="nota nota--carga" role="status">
      {texto}
    </p>
  )
}

export function ErrorNota({ error }) {
  if (!error) return null
  return (
    <p className="nota" role="alert">
      {error}
    </p>
  )
}

export function Vacio({ texto, accion }) {
  return (
    <p className="vacio">
      {texto}
      {accion}
    </p>
  )
}
