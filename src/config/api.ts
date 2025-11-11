// src/config/api.ts

// Define se deve usar mocks
const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === 'true' ||
  import.meta.env.PROD; // ativa mock automaticamente na Vercel

// Define a URL base da API
const API_URL = USE_MOCK
  ? '/api' // interceptado pelo MSW
  : import.meta.env.VITE_API_URL || 'http://localhost:3001';

export { API_URL, USE_MOCK };
