// src/config/api.ts
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Quando mock estiver ativo, API_URL será "/api"
const API_URL = USE_MOCK
  ? '/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:3000'

export { API_URL, USE_MOCK }
