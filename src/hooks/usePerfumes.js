import { useResource } from './useResource'
import {
  fetchPerfumes, createPerfume, updatePerfume, deletePerfume, bulkCreatePerfumes,
} from '../api/perfumes'

export function usePerfumes() {
  const resource = useResource({
    fetchFn: fetchPerfumes,
    createFn: createPerfume,
    updateFn: updatePerfume,
    deleteFn: deletePerfume,
    bulkCreateFn: bulkCreatePerfumes,
    legacyKey: 'esc_perfumes',
    migratedKey: 'esc_perfumes_migrated',
    sortFn: (a, b) => a.nombre.localeCompare(b.nombre),
  })

  return {
    perfumes: resource.items,
    loading: resource.loading,
    error: resource.error,
    syncing: resource.syncing,
    reload: resource.reload,
    addPerfume: resource.add,
    editPerfume: resource.edit,
    removePerfume: resource.remove,
    replacePerfumes: resource.replace,
  }
}
