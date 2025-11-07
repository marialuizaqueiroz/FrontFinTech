// src/config/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export { API_URL, USE_MOCK }
