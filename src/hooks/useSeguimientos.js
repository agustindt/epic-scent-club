import { useCallback } from 'react'
import { useResource } from './useResource'
import {
  fetchSeguimientos, createSeguimiento, updateSeguimiento, deleteSeguimiento, bulkCreateSeguimientos,
} from '../api/seguimientos'

export function useSeguimientos() {
  const resource = useResource({
    fetchFn: fetchSeguimientos,
    createFn: createSeguimiento,
    updateFn: updateSeguimiento,
    deleteFn: deleteSeguimiento,
    bulkCreateFn: bulkCreateSeguimientos,
    legacyKey: 'esc_seguimientos',
    migratedKey: 'esc_seguimientos_migrated',
    sortFn: (a, b) => new Date(b.creadoEn) - new Date(a.creadoEn),
  })

  const marcarEnviado = useCallback(async (id, mensaje) => {
    const seg = resource.items.find(s => s.id === id)
    if (!seg) return
    const historial = [...(seg.historial || []), { fecha: new Date().toISOString(), mensaje }]
    return resource.edit(id, { historial })
  }, [resource.items, resource.edit])

  const toggleEstado = useCallback(async (id) => {
    const seg = resource.items.find(s => s.id === id)
    if (!seg) return
    const estado = seg.estado === 'completado' ? 'pendiente' : 'completado'
    return resource.edit(id, { estado })
  }, [resource.items, resource.edit])

  return {
    seguimientos: resource.items,
    loading: resource.loading,
    error: resource.error,
    syncing: resource.syncing,
    reload: resource.reload,
    addSeguimiento: resource.add,
    removeSeguimiento: resource.remove,
    marcarEnviado,
    toggleEstado,
  }
}
