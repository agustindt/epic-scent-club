import { useCallback } from 'react'
import { useResource } from './useResource'
import {
  fetchClientes, createCliente, updateCliente, deleteCliente, bulkCreateClientes,
} from '../api/clientes'

export function useClientes() {
  const resource = useResource({
    fetchFn: fetchClientes,
    createFn: createCliente,
    updateFn: updateCliente,
    deleteFn: deleteCliente,
    bulkCreateFn: bulkCreateClientes,
    legacyKey: 'esc_clientes',
    migratedKey: 'esc_clientes_migrated',
    sortFn: (a, b) => a.nombre.localeCompare(b.nombre),
  })

  return {
    clientes: resource.items,
    loading: resource.loading,
    error: resource.error,
    syncing: resource.syncing,
    reload: resource.reload,
    addCliente: resource.add,
    editCliente: resource.edit,
    removeCliente: resource.remove,
  }
}
