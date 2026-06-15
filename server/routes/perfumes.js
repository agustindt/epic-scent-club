import { Router } from 'express'
import { getPool } from '../db.js'
import { generateId } from '../utils.js'

const router = Router()

function rowToPerfume(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    stock: Number(row.stock),
    costoBase: Number(row.costo_base),
    comision: Number(row.comision),
    porcentajeGanancia: Number(row.porcentaje_ganancia),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM perfumes ORDER BY nombre ASC')
    res.json(rows.map(rowToPerfume))
  } catch (err) {
    console.error('GET /api/perfumes:', err)
    res.status(500).json({ error: 'Error al obtener perfumes' })
  }
})

router.post('/', async (req, res) => {
  const { nombre, stock = 0, costoBase = 0, comision = 0, porcentajeGanancia = 0, id } = req.body
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' })

  try {
    const { rows } = await getPool().query(
      `INSERT INTO perfumes (id, nombre, stock, costo_base, comision, porcentaje_ganancia)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id || generateId(), nombre.trim(), stock, costoBase, comision, porcentajeGanancia]
    )
    res.status(201).json(rowToPerfume(rows[0]))
  } catch (err) {
    console.error('POST /api/perfumes:', err)
    res.status(500).json({ error: 'Error al crear perfume' })
  }
})

router.post('/bulk', async (req, res) => {
  const perfumes = req.body?.perfumes
  if (!Array.isArray(perfumes) || perfumes.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de perfumes' })
  }

  const db = getPool()
  const created = []
  try {
    await db.query('BEGIN')
    for (const p of perfumes) {
      if (!p.nombre?.trim()) continue
      const { rows } = await db.query(
        `INSERT INTO perfumes (id, nombre, stock, costo_base, comision, porcentaje_ganancia)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING RETURNING *`,
        [p.id || generateId(), p.nombre.trim(), p.stock || 0, p.costoBase || 0, p.comision || 0, p.porcentajeGanancia || 0]
      )
      if (rows[0]) created.push(rowToPerfume(rows[0]))
    }
    await db.query('COMMIT')
    res.status(201).json(created)
  } catch (err) {
    await db.query('ROLLBACK')
    console.error('POST /api/perfumes/bulk:', err)
    res.status(500).json({ error: 'Error al importar perfumes' })
  }
})

router.put('/:id', async (req, res) => {
  const { nombre, stock, costoBase, comision, porcentajeGanancia } = req.body
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' })

  try {
    const { rows } = await getPool().query(
      `UPDATE perfumes SET nombre=$1, stock=$2, costo_base=$3, comision=$4,
       porcentaje_ganancia=$5, updated_at=NOW() WHERE id=$6 RETURNING *`,
      [nombre.trim(), stock ?? 0, costoBase ?? 0, comision ?? 0, porcentajeGanancia ?? 0, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Perfume no encontrado' })
    res.json(rowToPerfume(rows[0]))
  } catch (err) {
    console.error('PUT /api/perfumes/:id:', err)
    res.status(500).json({ error: 'Error al actualizar perfume' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await getPool().query('DELETE FROM perfumes WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Perfume no encontrado' })
    res.status(204).end()
  } catch (err) {
    console.error('DELETE /api/perfumes/:id:', err)
    res.status(500).json({ error: 'Error al eliminar perfume' })
  }
})

export default router
