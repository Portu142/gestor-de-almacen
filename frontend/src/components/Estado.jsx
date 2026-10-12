// components/Estado.jsx — etiqueta de estado con punto de color (sin píldoras).
const TEXTO = {
  ok: 'En stock',
  bajo: 'Reponer',
  agotado: 'Agotado',
  entrada: 'Entrada',
  salida: 'Salida',
}

// Deduce el estado de un producto a partir de su stock y su mínimo.
export function estadoDeProducto(producto) {
  if (producto.cantidad === 0) return 'agotado'
  if (producto.cantidad <= producto.stock_minimo) return 'bajo'
  return 'ok'
}

export default function Estado({ estado, texto }) {
  return <span className={`estado estado--${estado}`}>{texto ?? TEXTO[estado] ?? estado}</span>
}
