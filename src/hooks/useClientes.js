import { useState, useEffect, useCallback } from 'react'
import {
  fetchClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  bulkCreateClientes,
} from '../api/clientes'

const LEGACY_KEY = 'esc_clientes'
const MIGRATED_KEY = 'esc_clientes_migrated'

function readLegacyClientes() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncing, setSyncing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let data = await fetchClientes()

      const legacy = readLegacyClientes()
      const alreadyMigrated = localStorage.getItem(MIGRATED_KEY) === 'true'

      if (!alreadyMigrated && data.length === 0 && legacy.length > 0) {
        setSyncing(true)
        const imported = await bulkCreateClientes(legacy)
        data = imported.length > 0 ? imported : await fetchClientes()
        localStorage.setItem(MIGRATED_KEY, 'true')
        localStorage.removeItem(LEGACY_KEY)
        setSyncing(false)
      }

      setClientes(data)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los clientes')
      const legacy = readLegacyClientes()
      if (legacy.length > 0) setClientes(legacy)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const addCliente = useCallback(async (data) => {
    const created = await createCliente(data)
    setClientes(prev => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    return created
  }, [])

  const editCliente = useCallback(async (id, data) => {
    const updated = await updateCliente(id, data)
    setClientes(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }, [])

  const removeCliente = useCallback(async (id) => {
    await deleteCliente(id)
    setClientes(prev => prev.filter(c => c.id !== id))
  }, [])

  return {
    clientes,
    loading,
    error,
    syncing,
    reload: load,
    addCliente,
    editCliente,
    removeCliente,
  }
}
