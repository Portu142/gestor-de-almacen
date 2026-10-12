// api/productos.js — puntos de la API relacionados con productos.
// Un módulo por recurso: añadir un recurso nuevo = crear su archivo y su hook.
import { pedir } from './client.js'

export function listar({ q, categoria, agotados } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (categoria) params.set('categoria', categoria)
  if (agotados) params.set('agotados', 'true')
  const qs = params.toString()
  return pedir(`/productos${qs ? `?${qs}` : ''}`)
}

export const categorias = () => pedir('/productos/categorias')
export const crear = (cuerpo) => pedir('/productos', { metodo: 'POST', cuerpo })
export const actualizar = (id, cuerpo) => pedir(`/productos/${id}`, { metodo: 'PUT', cuerpo })
export const borrar = (id) => pedir(`/productos/${id}`, { metodo: 'DELETE' })
