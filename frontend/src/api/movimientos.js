// api/movimientos.js — puntos de la API de movimientos de stock.
import { pedir } from './client.js'

export function listar({ producto_id, tipo, limite } = {}) {
  const params = new URLSearchParams()
  if (producto_id) params.set('producto_id', producto_id)
  if (tipo) params.set('tipo', tipo)
  if (limite) params.set('limite', limite)
  const qs = params.toString()
  return pedir(`/movimientos${qs ? `?${qs}` : ''}`)
}

export const crear = (cuerpo) => pedir('/movimientos', { metodo: 'POST', cuerpo })
