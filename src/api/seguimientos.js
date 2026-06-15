import { request } from './http.js'

export async function fetchSeguimientos() {
  return request('/api/seguimientos')
}

export async function createSeguimiento(data) {
  return request('/api/seguimientos', { method: 'POST', body: JSON.stringify(data) })
}

export async function bulkCreateSeguimientos(seguimientos) {
  return request('/api/seguimientos/bulk', { method: 'POST', body: JSON.stringify({ seguimientos }) })
}

export async function updateSeguimiento(id, data) {
  return request(`/api/seguimientos/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteSeguimiento(id) {
  return request(`/api/seguimientos/${id}`, { method: 'DELETE' })
}
