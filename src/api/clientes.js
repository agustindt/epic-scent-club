const API_URL = import.meta.env.VITE_API_URL || ''

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  if (!API_URL) {
    throw new ApiError('API no configurada. Definí VITE_API_URL.', 0)
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(data.error || 'Error de servidor', res.status)
  }
  return data
}

export async function fetchClientes() {
  return request('/api/clientes')
}

export async function createCliente(data) {
  return request('/api/clientes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function bulkCreateClientes(clientes) {
  return request('/api/clientes/bulk', {
    method: 'POST',
    body: JSON.stringify({ clientes }),
  })
}

export async function updateCliente(id, data) {
  return request(`/api/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCliente(id) {
  return request(`/api/clientes/${id}`, { method: 'DELETE' })
}

export async function checkHealth() {
  return request('/api/health')
}

export { ApiError }
