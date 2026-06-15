import { Router } from 'express'
import { getPool } from '../db.js'
import { generateId } from '../utils.js'

const router = Router()

function rowToSeguimiento(row) {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    clienteNombre: row.cliente_nombre,
    clienteTelefono: row.cliente_telefono || '',
    plantillaId: row.plantilla_id,
    prioridad: row.prioridad,
    fechaRecordatorio: row.fecha_recordatorio
      ? row.fecha_recordatorio.toISOString().split('T')[0]
      : '',
    nota: row.nota || '',
    mensajeCustom: row.mensaje_custom || '',
    estado: row.estado,
    historial: row.historial || [],
    creadoEn: row.creado_en,
    updatedAt: row.updated_at,
  }
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await getPool().query(
      'SELECT * FROM seguimientos ORDER BY creado_en DESC'
    )
    res.json(rows.map(rowToSeguimiento))
  } catch (err) {
    console.error('GET /api/seguimientos:', err)
    res.status(500).json({ error: 'Error al obtener seguimientos' })
  }
})

router.post('/', async (req, res) => {
  const {
    clienteId, clienteNombre, clienteTelefono = '', plantillaId,
    prioridad = 'media', fechaRecordatorio = '', nota = '',
    mensajeCustom = '', estado = 'pendiente', historial = [], id, creadoEn,
  } = req.body

  if (!clienteId || !clienteNombre) {
    return res.status(400).json({ error: 'Cliente es obligatorio' })
  }

  try {
    const { rows } = await getPool().query(
      `INSERT INTO seguimientos (
        id, cliente_id, cliente_nombre, cliente_telefono, plantilla_id,
        prioridad, fecha_recordatorio, nota, mensaje_custom, estado, historial, creado_en
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        id || generateId(), clienteId, clienteNombre, clienteTelefono, plantillaId,
        prioridad, fechaRecordatorio || null, nota, mensajeCustom, estado,
        JSON.stringify(historial), creadoEn || new Date().toISOString(),
      ]
    )
    res.status(201).json(rowToSeguimiento(rows[0]))
  } catch (err) {
    console.error('POST /api/seguimientos:', err)
    res.status(500).json({ error: 'Error al crear seguimiento' })
  }
})

router.post('/bulk', async (req, res) => {
  const seguimientos = req.body?.seguimientos
  if (!Array.isArray(seguimientos) || seguimientos.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de seguimientos' })
  }

  const db = getPool()
  const created = []
  try {
    await db.query('BEGIN')
    for (const s of seguimientos) {
      if (!s.clienteId) continue
      const { rows } = await db.query(
        `INSERT INTO seguimientos (
          id, cliente_id, cliente_nombre, cliente_telefono, plantilla_id,
          prioridad, fecha_recordatorio, nota, mensaje_custom, estado, historial, creado_en
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (id) DO NOTHING RETURNING *`,
        [
          s.id || generateId(), s.clienteId, s.clienteNombre, s.clienteTelefono || '',
          s.plantillaId, s.prioridad || 'media', s.fechaRecordatorio || null,
          s.nota || '', s.mensajeCustom || '', s.estado || 'pendiente',
          JSON.stringify(s.historial || []), s.creadoEn || new Date().toISOString(),
        ]
      )
      if (rows[0]) created.push(rowToSeguimiento(rows[0]))
    }
    await db.query('COMMIT')
    res.status(201).json(created)
  } catch (err) {
    await db.query('ROLLBACK')
    console.error('POST /api/seguimientos/bulk:', err)
    res.status(500).json({ error: 'Error al importar seguimientos' })
  }
})

router.put('/:id', async (req, res) => {
  const { estado, historial, mensajeCustom } = req.body
  const fields = []
  const values = []
  let i = 1

  if (estado !== undefined) { fields.push(`estado = $${i++}`); values.push(estado) }
  if (historial !== undefined) { fields.push(`historial = $${i++}`); values.push(JSON.stringify(historial)) }
  if (mensajeCustom !== undefined) { fields.push(`mensaje_custom = $${i++}`); values.push(mensajeCustom) }

  if (fields.length === 0) return res.status(400).json({ error: 'Sin campos para actualizar' })

  fields.push('updated_at = NOW()')
  values.push(req.params.id)

  try {
    const { rows } = await getPool().query(
      `UPDATE seguimientos SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )
    if (!rows[0]) return res.status(404).json({ error: 'Seguimiento no encontrado' })
    res.json(rowToSeguimiento(rows[0]))
  } catch (err) {
    console.error('PUT /api/seguimientos/:id:', err)
    res.status(500).json({ error: 'Error al actualizar seguimiento' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await getPool().query('DELETE FROM seguimientos WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Seguimiento no encontrado' })
    res.status(204).end()
  } catch (err) {
    console.error('DELETE /api/seguimientos/:id:', err)
    res.status(500).json({ error: 'Error al eliminar seguimiento' })
  }
})

export default router
