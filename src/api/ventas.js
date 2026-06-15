import { request } from './http.js'

export async function fetchVentas() {
  return request('/api/ventas')
}

export async function createVenta(data) {
  return request('/api/ventas', { method: 'POST', body: JSON.stringify(data) })
}

export async function bulkCreateVentas(ventas) {
  return request('/api/ventas/bulk', { method: 'POST', body: JSON.stringify({ ventas }) })
}

export async function updateVenta(id, data) {
  return request(`/api/ventas/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteVenta(id) {
  return request(`/api/ventas/${id}`, { method: 'DELETE' })
}
