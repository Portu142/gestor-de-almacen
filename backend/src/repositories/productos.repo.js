// src/repositories/productos.repo.js — consultas SQL de productos.
// Sin reglas de negocio: solo leer/escribir la tabla.
import { db } from '../db/connection.js';

export function listar({ q, categoria, agotados } = {}) {
  const where = [];
  const params = [];

  if (q) {
    where.push('(nombre LIKE ? OR sku LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (categoria) {
    where.push('categoria = ?');
    params.push(categoria);
  }
  if (agotados) {
    where.push('cantidad <= stock_minimo');
  }

  return db
    .prepare(
      `SELECT * FROM productos
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY nombre COLLATE NOCASE`
    )
    .all(...params);
}

export function porId(id) {
  return db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
}

export function categorias() {
  return db
    .prepare('SELECT DISTINCT categoria FROM productos ORDER BY categoria COLLATE NOCASE')
    .all()
    .map((r) => r.categoria);
}

export function crear({ nombre, sku, categoria, cantidad, stock_minimo, precio_coste }) {
  const resultado = db
    .prepare(
      `INSERT INTO productos (nombre, sku, categoria, cantidad, stock_minimo, precio_coste)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(nombre, sku, categoria, cantidad, stock_minimo, precio_coste);
  return porId(resultado.lastInsertRowid);
}

export function actualizar(id, { nombre, sku, categoria, cantidad, stock_minimo, precio_coste }) {
  db.prepare(
    `UPDATE productos
     SET nombre = ?, sku = ?, categoria = ?, cantidad = ?, stock_minimo = ?, precio_coste = ?
     WHERE id = ?`
  ).run(nombre, sku, categoria, cantidad, stock_minimo, precio_coste, id);
  return porId(id);
}

export function borrar(id) {
  return db.prepare('DELETE FROM productos WHERE id = ?').run(id).changes > 0;
}

// Cambia el stock en una transacción abierta por el servicio de movimientos.
export function ajustarStock(producto_id, delta) {
  db.prepare('UPDATE productos SET cantidad = cantidad + ? WHERE id = ?').run(delta, producto_id);
}
