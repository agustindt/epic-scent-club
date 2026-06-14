import { Router } from 'express'
import { getPool } from '../db.js'
import { generateId } from '../utils.js'

const router = Router()

function rowToCliente(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await getPool().query(
      'SELECT * FROM clientes ORDER BY nombre ASC'
    )
    res.json(rows.map(rowToCliente))
  } catch (err) {
    console.error('GET /api/clientes:', err)
    res.status(500).json({ error: 'Error al obtener clientes' })
  }
})

router.post('/', async (req, res) => {
  const { nombre, telefono = '', id } = req.body
  if (!nombre?.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' })
  }

  const clienteId = id || generateId()

  try {
    const { rows } = await getPool().query(
      `INSERT INTO clientes (id, nombre, telefono)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [clienteId, nombre.trim(), telefono.trim()]
    )
    res.status(201).json(rowToCliente(rows[0]))
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El cliente ya existe' })
    }
    console.error('POST /api/clientes:', err)
    res.status(500).json({ error: 'Error al crear cliente' })
  }
})

router.post('/bulk', async (req, res) => {
  const clientes = req.body?.clientes
  if (!Array.isArray(clientes) || clientes.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de clientes' })
  }

  const db = getPool()
  const created = []

  try {
    await db.query('BEGIN')
    for (const c of clientes) {
      if (!c.nombre?.trim()) continue
      const clienteId = c.id || generateId()
      const { rows } = await db.query(
        `INSERT INTO clientes (id, nombre, telefono)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING
         RETURNING *`,
        [clienteId, c.nombre.trim(), (c.telefono || '').trim()]
      )
      if (rows[0]) created.push(rowToCliente(rows[0]))
    }
    await db.query('COMMIT')
    res.status(201).json(created)
  } catch (err) {
    await db.query('ROLLBACK')
    console.error('POST /api/clientes/bulk:', err)
    res.status(500).json({ error: 'Error al importar clientes' })
  }
})

router.put('/:id', async (req, res) => {
  const { nombre, telefono = '' } = req.body
  if (!nombre?.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' })
  }

  try {
    const { rows } = await getPool().query(
      `UPDATE clientes
       SET nombre = $1, telefono = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [nombre.trim(), telefono.trim(), req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json(rowToCliente(rows[0]))
  } catch (err) {
    console.error('PUT /api/clientes/:id:', err)
    res.status(500).json({ error: 'Error al actualizar cliente' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await getPool().query(
      'DELETE FROM clientes WHERE id = $1',
      [req.params.id]
    )
    if (!rowCount) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.status(204).end()
  } catch (err) {
    console.error('DELETE /api/clientes/:id:', err)
    res.status(500).json({ error: 'Error al eliminar cliente' })
  }
})

export default router
