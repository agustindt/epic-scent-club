import { useCallback } from 'react'
import { useResource } from './useResource'
import {
  fetchVentas, createVenta, updateVenta, deleteVenta, bulkCreateVentas,
} from '../api/ventas'

export function useVentas() {
  const resource = useResource({
    fetchFn: fetchVentas,
    createFn: createVenta,
    updateFn: updateVenta,
    deleteFn: deleteVenta,
    bulkCreateFn: bulkCreateVentas,
    legacyKey: 'esc_ventas',
    migratedKey: 'esc_ventas_migrated',
    sortFn: (a, b) => new Date(b.fecha) - new Date(a.fecha),
  })

  const togglePago = useCallback(async (id) => {
    const venta = resource.items.find(v => v.id === id)
    if (!venta) return
    const estadoPago = venta.estadoPago === 'pagado' ? 'pendiente' : 'pagado'
    return resource.edit(id, { estadoPago })
  }, [resource.items, resource.edit])

  return {
    ventas: resource.items,
    loading: resource.loading,
    error: resource.error,
    syncing: resource.syncing,
    reload: resource.reload,
    addVenta: resource.add,
    removeVenta: resource.remove,
    togglePago,
  }
}
