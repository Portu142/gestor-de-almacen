// api/index.js — fachada de la API.
// Uso: import { api } from '@/api' → api.productos.listar(), api.movimientos.crear()…
import * as productos from './productos.js'
import * as movimientos from './movimientos.js'
import { pedir } from './client.js'

export const api = {
  productos,
  movimientos,
  dashboard: () => pedir('/dashboard'),
}
