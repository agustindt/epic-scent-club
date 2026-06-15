import { Router } from 'express'
import { getPool } from '../db.js'
import { generateId } from '../utils.js'

const router = Router()

function rowToVenta(row) {
  return {
    id: row.id,
    perfumeId: row.perfume_id,
    perfumeNombre: row.perfume_nombre,
    clienteId: row.cliente_id,
    clienteNombre: row.cliente_nombre,
    metodoPago: row.metodo_pago,
    estadoPago: row.estado_pago,
    precioVenta: Number(row.precio_venta),
    gananciaNeta: Number(row.ganancia_neta),
    costoBase: Number(row.costo_base),
    comision: Number(row.comision),
    nota: row.nota || '',
    fecha: row.fecha,
  }
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM ventas ORDER BY fecha DESC')
    res.json(rows.map(rowToVenta))
  } catch (err) {
    console.error('GET /api/ventas:', err)
    res.status(500).json({ error: 'Error al obtener ventas' })
  }
})

router.post('/', async (req, res) => {
  const {
    perfumeId, perfumeNombre, clienteId, clienteNombre,
    metodoPago = 'Efectivo', estadoPago = 'pagado',
    precioVenta = 0, gananciaNeta = 0, costoBase = 0, comision = 0,
    nota = '', fecha, id,
  } = req.body

  if (!perfumeId || !clienteId) {
    return res.status(400).json({ error: 'Perfume y cliente son obligatorios' })
  }

  const db = getPool()
  const ventaId = id || generateId()

  try {
    await db.query('BEGIN')

    const stockResult = await db.query(
      'SELECT stock FROM perfumes WHERE id = $1 FOR UPDATE',
      [perfumeId]
    )
    if (!stockResult.rows[0]) {
      await db.query('ROLLBACK')
      return res.status(404).json({ error: 'Perfume no encontrado' })
    }
    if (stockResult.rows[0].stock <= 0) {
      await db.query('ROLLBACK')
      return res.status(400).json({ error: 'Sin stock disponible' })
    }

    const { rows } = await db.query(
      `INSERT INTO ventas (
        id, perfume_id, perfume_nombre, cliente_id, cliente_nombre,
        metodo_pago, estado_pago, precio_venta, ganancia_neta, costo_base, comision, nota, fecha
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        ventaId, perfumeId, perfumeNombre, clienteId, clienteNombre,
        metodoPago, estadoPago, precioVenta, gananciaNeta, costoBase, comision,
        nota, fecha || new Date().toISOString(),
      ]
    )

    await db.query(
      'UPDATE perfumes SET stock = GREATEST(0, stock - 1), updated_at = NOW() WHERE id = $1',
      [perfumeId]
    )

    await db.query('COMMIT')
    res.status(201).json(rowToVenta(rows[0]))
  } catch (err) {
    await db.query('ROLLBACK')
    console.error('POST /api/ventas:', err)
    res.status(500).json({ error: 'Error al registrar venta' })
  }
})

router.post('/bulk', async (req, res) => {
  const ventas = req.body?.ventas
  if (!Array.isArray(ventas) || ventas.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de ventas' })
  }

  const db = getPool()
  const created = []
  try {
    await db.query('BEGIN')
    for (const v of ventas) {
      if (!v.perfumeId || !v.clienteId) continue
      const { rows } = await db.query(
        `INSERT INTO ventas (
          id, perfume_id, perfume_nombre, cliente_id, cliente_nombre,
          metodo_pago, estado_pago, precio_venta, ganancia_neta, costo_base, comision, nota, fecha
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (id) DO NOTHING RETURNING *`,
        [
          v.id || generateId(), v.perfumeId, v.perfumeNombre, v.clienteId, v.clienteNombre,
          v.metodoPago || 'Efectivo', v.estadoPago || 'pagado',
          v.precioVenta || 0, v.gananciaNeta || 0, v.costoBase || 0, v.comision || 0,
          v.nota || '', v.fecha || new Date().toISOString(),
        ]
      )
      if (rows[0]) created.push(rowToVenta(rows[0]))
    }
    await db.query('COMMIT')
    res.status(201).json(created)
  } catch (err) {
    await db.query('ROLLBACK')
    console.error('POST /api/ventas/bulk:', err)
    res.status(500).json({ error: 'Error al importar ventas' })
  }
})

router.put('/:id', async (req, res) => {
  const { estadoPago } = req.body
  if (!estadoPago) return res.status(400).json({ error: 'estadoPago es obligatorio' })

  try {
    const { rows } = await getPool().query(
      'UPDATE ventas SET estado_pago = $1 WHERE id = $2 RETURNING *',
      [estadoPago, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Venta no encontrada' })
    res.json(rowToVenta(rows[0]))
  } catch (err) {
    console.error('PUT /api/ventas/:id:', err)
    res.status(500).json({ error: 'Error al actualizar venta' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await getPool().query('DELETE FROM ventas WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Venta no encontrada' })
    res.status(204).end()
  } catch (err) {
    console.error('DELETE /api/ventas/:id:', err)
    res.status(500).json({ error: 'Error al eliminar venta' })
  }
})

export default router
