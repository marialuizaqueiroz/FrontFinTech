// src/services/api.ts
import { API_URL } from '../config/api'

// Helper para fazer requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Auth
export const authAPI = {
  login: (username: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: (token: string) =>
    fetchAPI('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
}

// Financings
export const financingAPI = {
  list: (token: string) =>
    fetchAPI('/financings', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  get: (id: string, token: string) =>
    fetchAPI(`/financings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (id: string, data: any, token: string) =>
    fetchAPI(`/financings/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
}
