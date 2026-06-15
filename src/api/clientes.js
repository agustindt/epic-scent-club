import { request } from './http.js'

export async function fetchClientes() {
  return request('/api/clientes')
}

export async function createCliente(data) {
  return request('/api/clientes', { method: 'POST', body: JSON.stringify(data) })
}

export async function bulkCreateClientes(clientes) {
  return request('/api/clientes/bulk', { method: 'POST', body: JSON.stringify({ clientes }) })
}

export async function updateCliente(id, data) {
  return request(`/api/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteCliente(id) {
  return request(`/api/clientes/${id}`, { method: 'DELETE' })
}

export { ApiError } from './http.js'
