// components/Campo.jsx — campo de formulario con etiqueta asociada.
export default function Campo({ etiqueta, ayuda, children }) {
  return (
    <label className="campo">
      <span className="campo-etiqueta">{etiqueta}</span>
      {children}
      {ayuda && <span className="campo-ayuda">{ayuda}</span>}
    </label>
  )
}

export function Entrada(props) {
  return <input {...props} className={`campo-control ${props.className ?? ''}`} />
}

export function Selector(props) {
  return <select {...props} className={`campo-control ${props.className ?? ''}`} />
}
