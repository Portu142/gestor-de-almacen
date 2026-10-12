// src/services/dashboard.service.js — cifras agregadas del panel principal.
import { db } from '../db/connection.js';

export function resumen() {
  const totales = db
    .prepare(
      `SELECT
         COUNT(*)                                        AS total_productos,
         COALESCE(SUM(cantidad), 0)                      AS unidades_totales,
         COALESCE(SUM(cantidad * precio_coste), 0)       AS valor_inventario,
         COALESCE(SUM(CASE WHEN cantidad <= stock_minimo THEN 1 ELSE 0 END), 0)
                                                         AS productos_bajo_minimo
       FROM productos`
    )
    .get();

  const bajo_minimo = db
    .prepare(
      `SELECT *, (stock_minimo - cantidad) AS unidades_faltantes
       FROM productos
       WHERE cantidad <= stock_minimo
       ORDER BY unidades_faltantes DESC, nombre COLLATE NOCASE`
    )
    .all();

  const ultimos_movimientos = db
    .prepare(
      `SELECT m.*, p.nombre AS producto_nombre, p.sku AS producto_sku
       FROM movimientos m JOIN productos p ON p.id = m.producto_id
       ORDER BY m.fecha DESC, m.id DESC
       LIMIT 8`
    )
    .all();

  const por_categoria = db
    .prepare(
      `SELECT categoria,
              COUNT(*)                    AS productos,
              COALESCE(SUM(cantidad), 0)  AS unidades,
              COALESCE(SUM(cantidad * precio_coste), 0) AS valor
       FROM productos
       GROUP BY categoria
       ORDER BY valor DESC, categoria COLLATE NOCASE`
    )
    .all();

  return {
    totales: {
      ...totales,
      valor_inventario: Number(totales.valor_inventario.toFixed(2)),
    },
    bajo_minimo,
    ultimos_movimientos,
    por_categoria,
  };
}
