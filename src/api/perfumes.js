import { request } from './http.js'

export async function fetchPerfumes() {
  return request('/api/perfumes')
}

export async function createPerfume(data) {
  return request('/api/perfumes', { method: 'POST', body: JSON.stringify(data) })
}

export async function bulkCreatePerfumes(perfumes) {
  return request('/api/perfumes/bulk', { method: 'POST', body: JSON.stringify({ perfumes }) })
}

export async function updatePerfume(id, data) {
  return request(`/api/perfumes/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deletePerfume(id) {
  return request(`/api/perfumes/${id}`, { method: 'DELETE' })
}
