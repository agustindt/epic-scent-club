import { useState, useEffect, useCallback } from 'react'

function readLegacy(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useResource({
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  bulkCreateFn,
  legacyKey,
  migratedKey,
  sortFn,
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncing, setSyncing] = useState(false)

  const sort = sortFn || ((a, b) => 0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let data = await fetchFn()
      const legacy = readLegacy(legacyKey)
      const alreadyMigrated = localStorage.getItem(migratedKey) === 'true'

      if (!alreadyMigrated && data.length === 0 && legacy.length > 0 && bulkCreateFn) {
        setSyncing(true)
        const imported = await bulkCreateFn(legacy)
        data = imported.length > 0 ? imported : await fetchFn()
        localStorage.setItem(migratedKey, 'true')
        localStorage.removeItem(legacyKey)
        setSyncing(false)
      }

      setItems([...data].sort(sort))
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los datos')
      const legacy = readLegacy(legacyKey)
      if (legacy.length > 0) setItems(legacy)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, bulkCreateFn, legacyKey, migratedKey, sortFn])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (data) => {
    const created = await createFn(data)
    setItems(prev => [...prev, created].sort(sort))
    return created
  }, [createFn, sortFn])

  const edit = useCallback(async (id, data) => {
    const updated = await updateFn(id, data)
    setItems(prev => prev.map(item => item.id === id ? updated : item).sort(sort))
    return updated
  }, [updateFn, sortFn])

  const remove = useCallback(async (id) => {
    await deleteFn(id)
    setItems(prev => prev.filter(item => item.id !== id))
  }, [deleteFn])

  const replace = useCallback((next) => {
    setItems([...next].sort(sort))
  }, [sortFn])

  return { items, loading, error, syncing, reload: load, add, edit, remove, replace }
}
