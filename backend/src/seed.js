// src/seed.js — crea datos de ejemplo para probar la app (npm run seed)
import { db } from './db/connection.js';

const productos = [
  ['Teclado mecánico RGB', 'TEC-001', 'Electrónica', 12, 5, 24.5],
  ['Ratón inalámbrico', 'RAT-014', 'Electrónica', 3, 5, 12.9],
  ['Monitor 24" Full HD', 'MON-024', 'Electrónica', 4, 4, 119.0],
  ['HDMI 2 m', 'CAB-HD2', 'Cables', 30, 10, 4.2],
  ['Cable USB-C 1 m', 'CAB-UC1', 'Cables', 0, 8, 3.5],
  ['Papel A4 (500 hojas)', 'PAP-A4', 'Papelería', 25, 10, 4.8],
  ['Bolígrafo azul (docena)', 'BOL-AZ', 'Papelería', 18, 6, 2.1],
  ['Café molido 250 g', 'CAF-250', 'Alimentación', 9, 12, 3.95],
  ['Agua 1,5 L (pack 6)', 'AGU-15', 'Alimentación', 14, 6, 3.2],
  ['Cinta adhesiva', 'CIN-ADH', 'Papelería', 40, 15, 1.1],
];

const movimientos = [
  [1, 'entrada', 12, 'Recepción de pedido #1001'],
  [2, 'entrada', 8, 'Recepción de pedido #1001'],
  [2, 'salida', 5, 'Ventas tienda'],
  [3, 'entrada', 4, 'Recepción de pedido #1002'],
  [5, 'salida', 2, 'Venta mostrador'],
  [4, 'entrada', 30, 'Recepción de pedido #1003'],
  [8, 'salida', 3, 'Rotura (caducidad)'],
];

console.log('Sembrando datos de ejemplo…');

// La siembra se puede repetir sin duplicar: se limpia antes.
db.exec('DELETE FROM movimientos');
db.exec('DELETE FROM productos');
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('productos', 'movimientos')");

const insertProducto = db.prepare(
  `INSERT INTO productos (nombre, sku, categoria, cantidad, stock_minimo, precio_coste)
   VALUES (?, ?, ?, ?, ?, ?)`
);
for (const p of productos) insertProducto.run(...p);

const insertMovimiento = db.prepare(
  `INSERT INTO movimientos (producto_id, tipo, cantidad, motivo) VALUES (?, ?, ?, ?)`
);
for (const m of movimientos) insertMovimiento.run(...m);

console.log(`✔ ${productos.length} productos y ${movimientos.length} movimientos creados.`);
