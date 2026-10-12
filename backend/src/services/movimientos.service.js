// src/services/movimientos.service.js — entradas y salidas de stock.
// Regla clave: el stock se ajusta y el movimiento se registra en la misma
// transacción, y una salida nunca deja el stock en negativo.
import { db } from '../db/connection.js';
import * as productosRepo from '../repositories/productos.repo.js';
import * as repo from '../repositories/movimientos.repo.js';
import { AppError, errorNoEncontrado, errorConflicto } from '../lib/errors.js';

export function listar(filtros = {}) {
  return repo.listar(filtros);
}

export function registrar({ producto_id, tipo, cantidad, motivo } = {}) {
  const cant = Number(cantidad);
  const idProducto = Number(producto_id);

  if (!Number.isInteger(idProducto) || idProducto <= 0) {
    throw new AppError('Falta el producto');
  }
  if (tipo !== 'entrada' && tipo !== 'salida') {
    throw new AppError('El tipo debe ser «entrada» o «salida»');
  }
  if (!Number.isInteger(cant) || cant <= 0) {
    throw new AppError('La cantidad debe ser un número entero mayor que 0');
  }

  const producto = productosRepo.porId(idProducto);
  if (!producto) throw errorNoEncontrado('Producto');

  if (tipo === 'salida' && cant > producto.cantidad) {
    throw errorConflicto(
      `Solo hay ${producto.cantidad} unidades de «${producto.nombre}» en stock`
    );
  }

  db.exec('BEGIN');
  try {
    productosRepo.ajustarStock(idProducto, tipo === 'entrada' ? cant : -cant);
    const movimiento = repo.crear({
      producto_id: idProducto,
      tipo,
      cantidad: cant,
      motivo: String(motivo ?? '').trim(),
    });
    db.exec('COMMIT');
    return movimiento;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
