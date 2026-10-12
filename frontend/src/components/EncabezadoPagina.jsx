// components/EncabezadoPagina.jsx — cabecera estándar de cada pantalla.
// Además sincroniza document.title: cada pantalla tiene su propio título
// en la pestaña y en el historial del navegador.
import { useEffect } from 'react'

export default function EncabezadoPagina({ kicker, titulo, acciones }) {
  useEffect(() => {
    document.title = `${titulo} · Gestor de almacén de tienda`
  }, [titulo])

  return (
    <header className="encabezado-pagina">
      <div>
        <span className="encabezado-kicker">{kicker}</span>
        <h2 className="encabezado-titulo">{titulo}</h2>
      </div>
      {acciones && <div className="encabezado-acciones">{acciones}</div>}
    </header>
  )
}
