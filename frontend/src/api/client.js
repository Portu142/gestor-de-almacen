// api/client.js — cliente HTTP único. Todas las peticiones salen de aquí:
// cambiar de transporte (fetch → axios, o añadir tokens de auth) es un solo archivo.
const BASE = import.meta.env.VITE_API_URL ?? ''

export async function pedir(ruta, { metodo = 'GET', cuerpo } = {}) {
  const respuesta = await fetch(`${BASE}/api${ruta}`, {
    method: metodo,
    headers: cuerpo !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
  })

  if (respuesta.status === 204) return null

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    throw new Error(datos?.error ?? `Error ${respuesta.status}`)
  }
  return datos
}
