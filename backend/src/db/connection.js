// src/db/connection.js — punto único de acceso a la base de datos.
// Todo lo que toca SQL pasa por aquí: si mañana se migra a PostgreSQL,
// solo se cambia este módulo y los repositorios.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_SCHEMA = path.join(__dirname, 'schema.sql');
const RUTA_DEFECTO = path.join(__dirname, '..', '..', 'data', 'almacen.db');

export function abrirConexion(ruta = process.env.ALMACEN_DB ?? RUTA_DEFECTO) {
  if (ruta !== ':memory:' && !fs.existsSync(path.dirname(ruta))) {
    fs.mkdirSync(path.dirname(ruta), { recursive: true });
  }

  const db = new DatabaseSync(ruta);

  // WAL permite leer mientras se escribe y es más robusto ante cortes de luz.
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(fs.readFileSync(RUTA_SCHEMA, 'utf8'));

  return db;
}

// Instancia compartida por repositorios y tests (los tests usan ALMACEN_DB=:memory:).
export const db = abrirConexion();
