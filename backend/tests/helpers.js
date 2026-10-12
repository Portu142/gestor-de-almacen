// tests/helpers.js — base de datos en memoria limpia para cada test.
process.env.ALMACEN_DB = ':memory:';

const { db } = await import('../src/db/connection.js');

export function limpiar() {
  db.exec('DELETE FROM movimientos');
  db.exec('DELETE FROM productos');
}

export { db };
