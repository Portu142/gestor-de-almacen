// src/repositories/movimientos.repo.js — consultas SQL de movimientos.
import { db } from '../db/connection.js';

export function listar({ producto_id, tipo, limite = 100 } = {}) {
  const where = [];
  const params = [];

  if (producto_id) {
    where.push('m.producto_id = ?');
    params.push(Number(producto_id));
  }
  if (tipo === 'entrada' || tipo === 'salida') {
    where.push('m.tipo = ?');
    params.push(tipo);
  }

  return db
    .prepare(
      `SELECT m.*, p.nombre AS producto_nombre, p.sku AS producto_sku
       FROM movimientos m
       JOIN productos p ON p.id = m.producto_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY m.fecha DESC, m.id DESC
       LIMIT ?`
    )
    .all(...params, Math.min(Number(limite) || 100, 500));
}

export function porId(id) {
  return db
    .prepare(
      `SELECT m.*, p.nombre AS producto_nombre, p.sku AS producto_sku
       FROM movimientos m JOIN productos p ON p.id = m.producto_id
       WHERE m.id = ?`
    )
    .get(id);
}

export function crear({ producto_id, tipo, cantidad, motivo }) {
  const resultado = db
    .prepare('INSERT INTO movimientos (producto_id, tipo, cantidad, motivo) VALUES (?, ?, ?, ?)')
    .run(producto_id, tipo, cantidad, motivo);
  return porId(resultado.lastInsertRowid);
}
