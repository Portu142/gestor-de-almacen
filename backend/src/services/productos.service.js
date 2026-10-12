// src/services/productos.service.js — reglas de negocio de productos.
import * as repo from '../repositories/productos.repo.js';
import { AppError, errorNoEncontrado, errorConflicto } from '../lib/errors.js';

export function listar(filtros = {}) {
  return repo.listar(filtros);
}

export function porId(id) {
  const producto = repo.porId(id);
  if (!producto) throw errorNoEncontrado('Producto');
  return producto;
}

export function categorias() {
  return repo.categorias();
}

export function crear(datos) {
  const producto = validarYNormalizar(datos);
  try {
    return repo.crear(producto);
  } catch (e) {
    throw traducirDuplicado(e, producto.sku);
  }
}

export function actualizar(id, datos) {
  porId(id); // 404 si no existe
  const producto = validarYNormalizar(datos);
  try {
    return repo.actualizar(id, producto);
  } catch (e) {
    throw traducirDuplicado(e, producto.sku);
  }
}

export function borrar(id) {
  if (!repo.borrar(id)) throw errorNoEncontrado('Producto');
}

function validarYNormalizar(datos = {}) {
  const errores = [];

  const nombre = String(datos.nombre ?? '').trim();
  const sku = String(datos.sku ?? '').trim();
  const categoria = String(datos.categoria ?? '').trim() || 'Sin categoría';

  if (!nombre) errores.push('El nombre es obligatorio');
  if (!sku) errores.push('El SKU es obligatorio');

  const cantidad = enteroNoNegativo(datos.cantidad, 'cantidad', errores);
  const stock_minimo = enteroNoNegativo(datos.stock_minimo, 'stock_minimo', errores);
  const precio_coste = numeroNoNegativo(datos.precio_coste, 'precio_coste', errores);

  if (errores.length) throw new AppError(errores.join(' | '));

  return { nombre, sku, categoria, cantidad, stock_minimo, precio_coste };
}

function traducirDuplicado(e, sku) {
  const esDuplicado = String(e.message).includes('UNIQUE');
  return esDuplicado ? errorConflicto(`Ya existe un producto con el SKU «${sku}»`) : e;
}

function enteroNoNegativo(valor, campo, errores) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 0) errores.push(`«${campo}» debe ser un entero ≥ 0`);
  return numero;
}

function numeroNoNegativo(valor, campo, errores) {
  const numero = Number(valor);
  if (Number.isNaN(numero) || numero < 0) errores.push(`«${campo}» debe ser un número ≥ 0`);
  return numero;
}
