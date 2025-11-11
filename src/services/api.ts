// src/services/api.ts
import axios from 'axios'
import { API_URL } from '../config/api'

// Configuração do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Tipos
export interface Financing {
  id: string
  customer: string
  amount: number
  status: 'pending' | 'approved' | 'signed' | 'rejected'
  termMonths: number
  createdAt: string
}

export interface CreateFinancingDTO {
  customer: string
  amount: number
  status: 'pending' | 'approved' | 'signed' | 'rejected'
  termMonths: number
}

export interface UpdateFinancingDTO {
  customer?: string
  amount?: number
  status?: 'pending' | 'approved' | 'signed' | 'rejected'
  termMonths?: number
}

export interface Product {
  id: string
  name: string
  category: string
  sku: string
  status: 'available' | 'out_of_stock' | 'inactive'
  price: number
  stock: number
  vendor?: string
  description?: string
  imageUrl?: string
  engagementRewardPoints: number
  lastSaleDate?: string
  totalSales: number
}

export interface CreateProductDTO {
  name: string
  category: string
  sku: string
  status?: 'available' | 'out_of_stock' | 'inactive'
  price: number
  stock: number
  vendor?: string
  description?: string
  imageUrl?: string
  engagementRewardPoints?: number
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  totalSales?: number
  lastSaleDate?: string
}

export interface Sale {
  id: string
  productId: string
  productName: string
  customer: string
  channel: 'online' | 'store' | 'marketplace'
  quantity: number
  unitPrice: number
  discountPercent: number
  status: 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  pointsEarned: number
  pointsUsed: number
  engagementStatus: 'pending' | 'synced' | 'error'
  saleDate: string
  totalValue: number
}

export interface CreateSaleDTO {
  productId: string
  productName: string
  customer: string
  channel?: 'online' | 'store' | 'marketplace'
  quantity: number
  unitPrice: number
  discountPercent?: number
  status?: 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  pointsEarned?: number
  pointsUsed?: number
  engagementStatus?: 'pending' | 'synced' | 'error'
  saleDate?: string
}

export interface UpdateSaleDTO extends Partial<CreateSaleDTO> {
  totalValue?: number
}

// Auth Service
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },

  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// Financing Service
export const financingAPI = {
  // Listar todos os financiamentos
  list: async (): Promise<Financing[]> => {
    const response = await api.get('/financings')
    return response.data
  },

  // Buscar financiamento por ID
  get: async (id: string): Promise<Financing> => {
    const response = await api.get(`/financings/${id}`)
    return response.data
  },

  // Criar novo financiamento
  create: async (data: CreateFinancingDTO): Promise<Financing> => {
    const response = await api.post('/financings', data)
    return response.data
  },

  // Atualizar financiamento
  update: async (id: string, data: UpdateFinancingDTO): Promise<Financing> => {
    const response = await api.put(`/financings/${id}`, data)
    return response.data
  },

  // Deletar financiamento
  delete: async (id: string): Promise<void> => {
    await api.delete(`/financings/${id}`)
  },
}

export const productAPI = {
  list: async (): Promise<Product[]> => {
    const response = await api.get('/products')
    return response.data
  },
  get: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },
  create: async (data: CreateProductDTO): Promise<Product> => {
    const response = await api.post('/products', data)
    return response.data
  },
  update: async (id: string, data: UpdateProductDTO): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data)
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`)
  },
}

export const saleAPI = {
  list: async (): Promise<Sale[]> => {
    const response = await api.get('/sales')
    return response.data
  },
  get: async (id: string): Promise<Sale> => {
    const response = await api.get(`/sales/${id}`)
    return response.data
  },
  create: async (data: CreateSaleDTO): Promise<Sale> => {
    const response = await api.post('/sales', data)
    return response.data
  },
  update: async (id: string, data: UpdateSaleDTO): Promise<Sale> => {
    const response = await api.put(`/sales/${id}`, data)
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/sales/${id}`)
  },
}

export default api
