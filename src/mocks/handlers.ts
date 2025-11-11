import { rest } from 'msw'

// ---------------------- MOCK DATA ----------------------
let financings = [
  { id: 'f-001', customer: 'João Silva', amount: 45000, status: 'pending', createdAt: new Date('2025-11-01').toISOString(), termMonths: 60 },
  { id: 'f-002', customer: 'Maria Souza', amount: 120000, status: 'approved', createdAt: new Date('2025-10-28').toISOString(), termMonths: 84 },
  { id: 'f-003', customer: 'Carlos Pereira', amount: 30000, status: 'signed', createdAt: new Date('2025-10-25').toISOString(), termMonths: 48 },
  { id: 'f-004', customer: 'Ana Costa', amount: 85000, status: 'approved', createdAt: new Date('2025-11-03').toISOString(), termMonths: 72 },
  { id: 'f-005', customer: 'Pedro Santos', amount: 15000, status: 'rejected', createdAt: new Date('2025-10-20').toISOString(), termMonths: 36 },
  { id: 'f-006', customer: 'Juliana Oliveira', amount: 200000, status: 'signed', createdAt: new Date('2025-11-05').toISOString(), termMonths: 96 },
  { id: 'f-007', customer: 'Roberto Lima', amount: 67000, status: 'pending', createdAt: new Date('2025-11-06').toISOString(), termMonths: 60 },
  { id: 'f-008', customer: 'Fernanda Alves', amount: 95000, status: 'approved', createdAt: new Date('2025-10-15').toISOString(), termMonths: 72 },
]

let products = [
  { id: 'p-101', name: 'SUV Elite 2025', category: 'veiculos', sku: 'CAR-SUV-ELT-25', status: 'available', price: 189900, stock: 12, vendor: 'AutoPrime Motors', engagementRewardPoints: 18000, totalSales: 37, lastSaleDate: new Date('2025-11-05T10:30:00Z').toISOString() },
  { id: 'p-102', name: 'Notebook VisionBook X14', category: 'tecnologia', sku: 'TEC-NB-VBX14', status: 'available', price: 7499, stock: 48, vendor: 'VisionTech', engagementRewardPoints: 750, totalSales: 152, lastSaleDate: new Date('2025-11-04T15:15:00Z').toISOString() },
  { id: 'p-103', name: 'Apartamento Vista Parque', category: 'imoveis', sku: 'HOUSE-VISTA-PAR', status: 'out_of_stock', price: 890000, stock: 0, vendor: 'Construtora Horizonte', engagementRewardPoints: 30000, totalSales: 9, lastSaleDate: new Date('2025-10-21T11:00:00Z').toISOString() },
  { id: 'p-104', name: 'Smartphone Nova X Pro', category: 'tecnologia', sku: 'TEC-SP-NVXPRO', status: 'available', price: 5899, stock: 76, vendor: 'Nova Mobile', engagementRewardPoints: 590, totalSales: 210, lastSaleDate: new Date('2025-11-02T19:20:00Z').toISOString() },
]

let sales = [
  { id: 's-9001', productId: 'p-101', productName: 'SUV Elite 2025', customer: 'Marina Costa', channel: 'store', quantity: 1, unitPrice: 189900, discountPercent: 5, status: 'delivered', pointsEarned: 20000, pointsUsed: 5000, engagementStatus: 'synced', saleDate: new Date('2025-11-05T10:35:00Z').toISOString(), totalValue: 189900 * 0.95 },
  { id: 's-9002', productId: 'p-102', productName: 'Notebook VisionBook X14', customer: 'Felipe Martins', channel: 'online', quantity: 2, unitPrice: 7499, discountPercent: 10, status: 'paid', pointsEarned: 1500, pointsUsed: 0, engagementStatus: 'pending', saleDate: new Date('2025-11-04T16:05:00Z').toISOString(), totalValue: 2 * 7499 * 0.9 },
  { id: 's-9003', productId: 'p-104', productName: 'Smartphone Nova X Pro', customer: 'Julio Andrade', channel: 'marketplace', quantity: 3, unitPrice: 5899, discountPercent: 7, status: 'shipped', pointsEarned: 1800, pointsUsed: 400, engagementStatus: 'synced', saleDate: new Date('2025-11-02T20:10:00Z').toISOString(), totalValue: 3 * 5899 * 0.93 },
  { id: 's-9004', productId: 'p-103', productName: 'Apartamento Vista Parque', customer: 'Grupo Almeida', channel: 'store', quantity: 1, unitPrice: 890000, discountPercent: 2, status: 'processing', pointsEarned: 45000, pointsUsed: 10000, engagementStatus: 'pending', saleDate: new Date('2025-10-28T11:45:00Z').toISOString(), totalValue: 890000 * 0.98 },
]

// ---------------------- HANDLERS ----------------------
export const handlers = [
  // LOGIN
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { username } = await req.json()
    const role = username === 'admin' ? 'admin' : 'client'
    const token = 'mock-token-' + role
    const user = { id: role === 'admin' ? 'u-admin' : 'u-client', name: username || 'Usuário', role }
    return res(ctx.status(200), ctx.json({ token, user }))
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer mock-token-')) return res(ctx.status(401))
    const role = auth.includes('admin') ? 'admin' : 'client'
    return res(ctx.status(200), ctx.json({ id: role === 'admin' ? 'u-admin' : 'u-client', name: role === 'admin' ? 'Admin' : 'Client', role }))
  }),

  // ---------------------- FINANCINGS ----------------------
  rest.get('/api/financings', (req, res, ctx) => res(ctx.status(200), ctx.json(financings))),

  rest.get('/api/financings/:id', (req, res, ctx) => {
    const f = financings.find(x => x.id === req.params.id)
    return f ? res(ctx.status(200), ctx.json(f)) : res(ctx.status(404))
  }),

  rest.put('/api/financings/:id', async (req, res, ctx) => {
    const { id } = req.params
    const body = await req.json()
    const idx = financings.findIndex(x => x.id === id)
    if (idx === -1) return res(ctx.status(404))
    financings[idx] = { ...financings[idx], ...body }
    return res(ctx.status(200), ctx.json(financings[idx]))
  }),

  // ---------------------- PRODUCTS ----------------------
  rest.get('/api/products', (req, res, ctx) => res(ctx.status(200), ctx.json(products))),

  rest.get('/api/products/:id', (req, res, ctx) => {
    const product = products.find(p => p.id === req.params.id)
    return product ? res(ctx.status(200), ctx.json(product)) : res(ctx.status(404))
  }),

  rest.put('/api/products/:id', async (req, res, ctx) => {
    const { id } = req.params
    const body = await req.json()
    const idx = products.findIndex(p => p.id === id)
    if (idx === -1) return res(ctx.status(404), ctx.json({ message: 'Produto não encontrado' }))
    products[idx] = { ...products[idx], ...body }
    return res(ctx.status(200), ctx.json(products[idx]))
  }),

  rest.post('/api/products', async (req, res, ctx) => {
    const newProduct = await req.json()
    newProduct.id = 'p-' + Math.floor(Math.random() * 1000)
    products.push(newProduct)
    return res(ctx.status(201), ctx.json(newProduct))
  }),

  rest.delete('/api/products/:id', (req, res, ctx) => {
    const { id } = req.params
    products = products.filter(p => p.id !== id)
    return res(ctx.status(204))
  }),

  // ---------------------- SALES ----------------------
  rest.get('/api/sales', (req, res, ctx) => res(ctx.status(200), ctx.json(sales))),

  rest.get('/api/sales/:id', (req, res, ctx) => {
    const sale = sales.find(s => s.id === req.params.id)
    return sale ? res(ctx.status(200), ctx.json(sale)) : res(ctx.status(404))
  }),
]
