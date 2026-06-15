import pg from 'pg'

const { Pool } = pg

let pool

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
    })
  }
  return pool
}

export async function initDb() {
  const db = getPool()
  await db.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      telefono TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS perfumes (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      costo_base NUMERIC(12,2) NOT NULL DEFAULT 0,
      comision NUMERIC(12,2) NOT NULL DEFAULT 0,
      porcentaje_ganancia NUMERIC(8,2) NOT NULL DEFAULT 0,
      imagen TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS imagen TEXT NOT NULL DEFAULT '';

    CREATE TABLE IF NOT EXISTS ventas (
      id TEXT PRIMARY KEY,
      perfume_id TEXT NOT NULL,
      perfume_nombre TEXT NOT NULL,
      cliente_id TEXT NOT NULL,
      cliente_nombre TEXT NOT NULL,
      metodo_pago TEXT NOT NULL DEFAULT 'Efectivo',
      estado_pago TEXT NOT NULL DEFAULT 'pagado',
      precio_venta NUMERIC(12,2) NOT NULL DEFAULT 0,
      ganancia_neta NUMERIC(12,2) NOT NULL DEFAULT 0,
      costo_base NUMERIC(12,2) NOT NULL DEFAULT 0,
      comision NUMERIC(12,2) NOT NULL DEFAULT 0,
      nota TEXT NOT NULL DEFAULT '',
      fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS seguimientos (
      id TEXT PRIMARY KEY,
      cliente_id TEXT NOT NULL,
      cliente_nombre TEXT NOT NULL,
      cliente_telefono TEXT NOT NULL DEFAULT '',
      plantilla_id TEXT NOT NULL,
      prioridad TEXT NOT NULL DEFAULT 'media',
      fecha_recordatorio DATE,
      nota TEXT NOT NULL DEFAULT '',
      mensaje_custom TEXT NOT NULL DEFAULT '',
      estado TEXT NOT NULL DEFAULT 'pendiente',
      historial JSONB NOT NULL DEFAULT '[]',
      creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
}
