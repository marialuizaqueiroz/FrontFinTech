import { rest } from 'msw'

const financings = [
  { id: 'f-001', customer: 'João Silva', amount: 45000, status: 'pending', createdAt: new Date('2025-11-01').toISOString(), termMonths: 60 },
  { id: 'f-002', customer: 'Maria Souza', amount: 120000, status: 'approved', createdAt: new Date('2025-10-28').toISOString(), termMonths: 84 },
  { id: 'f-003', customer: 'Carlos Pereira', amount: 30000, status: 'signed', createdAt: new Date('2025-10-25').toISOString(), termMonths: 48 },
  { id: 'f-004', customer: 'Ana Costa', amount: 85000, status: 'approved', createdAt: new Date('2025-11-03').toISOString(), termMonths: 72 },
  { id: 'f-005', customer: 'Pedro Santos', amount: 15000, status: 'rejected', createdAt: new Date('2025-10-20').toISOString(), termMonths: 36 },
  { id: 'f-006', customer: 'Juliana Oliveira', amount: 200000, status: 'signed', createdAt: new Date('2025-11-05').toISOString(), termMonths: 96 },
  { id: 'f-007', customer: 'Roberto Lima', amount: 67000, status: 'pending', createdAt: new Date('2025-11-06').toISOString(), termMonths: 60 },
  { id: 'f-008', customer: 'Fernanda Alves', amount: 95000, status: 'approved', createdAt: new Date('2025-10-15').toISOString(), termMonths: 72 },
]

const products = [
  { id: 'p-101', name: 'SUV Elite 2025', category: 'veiculos', sku: 'CAR-SUV-ELT-25', status: 'available', price: 189900, stock: 12, vendor: 'AutoPrime Motors', engagementRewardPoints: 18000, totalSales: 37, lastSaleDate: new Date('2025-11-05T10:30:00Z').toISOString() },
  { id: 'p-102', name: 'Notebook VisionBook X14', category: 'tecnologia', sku: 'TEC-NB-VBX14', status: 'available', price: 7499, stock: 48, vendor: 'VisionTech', engagementRewardPoints: 750, totalSales: 152, lastSaleDate: new Date('2025-11-04T15:15:00Z').toISOString() },
  { id: 'p-103', name: 'Apartamento Vista Parque', category: 'imoveis', sku: 'HOUSE-VISTA-PAR', status: 'out_of_stock', price: 890000, stock: 0, vendor: 'Construtora Horizonte', engagementRewardPoints: 30000, totalSales: 9, lastSaleDate: new Date('2025-10-21T11:00:00Z').toISOString() },
  { id: 'p-104', name: 'Smartphone Nova X Pro', category: 'tecnologia', sku: 'TEC-SP-NVXPRO', status: 'available', price: 5899, stock: 76, vendor: 'Nova Mobile', engagementRewardPoints: 590, totalSales: 210, lastSaleDate: new Date('2025-11-02T19:20:00Z').toISOString() },
]

const sales = [
  { id: 's-9001', productId: 'p-101', productName: 'SUV Elite 2025', customer: 'Marina Costa', channel: 'store', quantity: 1, unitPrice: 189900, discountPercent: 5, status: 'delivered', pointsEarned: 20000, pointsUsed: 5000, engagementStatus: 'synced', saleDate: new Date('2025-11-05T10:35:00Z').toISOString(), totalValue: 189900 * 0.95 },
  { id: 's-9002', productId: 'p-102', productName: 'Notebook VisionBook X14', customer: 'Felipe Martins', channel: 'online', quantity: 2, unitPrice: 7499, discountPercent: 10, status: 'paid', pointsEarned: 1500, pointsUsed: 0, engagementStatus: 'pending', saleDate: new Date('2025-11-04T16:05:00Z').toISOString(), totalValue: 2 * 7499 * 0.9 },
  { id: 's-9003', productId: 'p-104', productName: 'Smartphone Nova X Pro', customer: 'Julio Andrade', channel: 'marketplace', quantity: 3, unitPrice: 5899, discountPercent: 7, status: 'shipped', pointsEarned: 1800, pointsUsed: 400, engagementStatus: 'synced', saleDate: new Date('2025-11-02T20:10:00Z').toISOString(), totalValue: 3 * 5899 * 0.93 },
  { id: 's-9004', productId: 'p-103', productName: 'Apartamento Vista Parque', customer: 'Grupo Almeida', channel: 'store', quantity: 1, unitPrice: 890000, discountPercent: 2, status: 'processing', pointsEarned: 45000, pointsUsed: 10000, engagementStatus: 'pending', saleDate: new Date('2025-10-28T11:45:00Z').toISOString(), totalValue: 890000 * 0.98 },
]

export const handlers = [
  // auth login
  rest.post('/auth/login', async (req, res, ctx) => {
    const body = await req.json()
    const username = body.username || ''
    const role = username === 'admin' ? 'admin' : 'client'
    const token = 'mock-token-' + role
    const user = { id: role === 'admin' ? 'u-admin' : 'u-client', name: username || 'Usuário', role }
    return res(ctx.status(200), ctx.json({ token, user }))
  }),

  // validate token
  rest.get('/auth/me', (req, res, ctx) => {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer mock-token-')) return res(ctx.status(401))
    const role = auth.includes('admin') ? 'admin' : 'client'
    return res(ctx.status(200), ctx.json({ id: role === 'admin' ? 'u-admin' : 'u-client', name: role === 'admin' ? 'Admin' : 'Client', role }))
  }),

  // financings list
  rest.get('/financings', (req, res, ctx) => {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer mock-token-')) return res(ctx.status(401))
    // only admins allowed to access backoffice
    if (auth.includes('client')) return res(ctx.status(403), ctx.json({ message: 'Forbidden' }))
    return res(ctx.status(200), ctx.json(financings))
  }),

  rest.get('/financings/:id', (req, res, ctx) => {
    const { id } = req.params
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer mock-token-')) return res(ctx.status(401))
    if (auth.includes('client')) return res(ctx.status(403), ctx.json({ message: 'Forbidden' }))
    const f = financings.find(x => x.id === id)
    if (!f) return res(ctx.status(404))
    return res(ctx.status(200), ctx.json(f))
  }),

  rest.put('/financings/:id', async (req, res, ctx) => {
    const { id } = req.params
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer mock-token-')) return res(ctx.status(401))
    if (auth.includes('client')) return res(ctx.status(403), ctx.json({ message: 'Forbidden' }))
    const body = await req.json()
    const idx = financings.findIndex(x => x.id === id)
    if (idx === -1) return res(ctx.status(404))
    
    // Atualiza todos os campos, exceto ID e createdAt
    financings[idx] = { 
      ...financings[idx], 
      customer: body.customer || financings[idx].customer,
      amount: body.amount !== undefined ? body.amount : financings[idx].amount,
      status: body.status || financings[idx].status,
      termMonths: body.termMonths !== undefined ? body.termMonths : financings[idx].termMonths
    }
    
    return res(ctx.status(200), ctx.json(financings[idx]))
  }),

  // products
  rest.get('/products', (req, res, ctx) => {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer mock-token-')) return res(ctx.status(401))
    if (auth.includes('client')) return res(ctx.status(403), ctx.json({ message: 'Forbidden' }))
    return res(ctx.status(200), ctx.json(products))
  }),

  rest.get('/products/:id', (req, res, ctx) => {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer mock-token-')) return res(ctx.status(401))
    if (auth.includes('client')) return res(ctx.status(403), ctx.json({ message: 'Forbidden' }))
    const product = products.find(p => p.id === req.params.id)
    if (!product) return res(ctx.status(404))
    return res(ctx.status(200), ctx.json(product))
  }),

  // sales
  rest.get('/sales', (req, res, ctx) => {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer mock-token-')) return res(ctx.status(401))
    if (auth.includes('client')) return res(ctx.status(403), ctx.json({ message: 'Forbidden' }))
    return res(ctx.status(200), ctx.json(sales))
  }),

  rest.get('/sales/:id', (req, res, ctx) => {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer mock-token-')) return res(ctx.status(401))
    if (auth.includes('client')) return res(ctx.status(403), ctx.json({ message: 'Forbidden' }))
    const sale = sales.find(s => s.id === req.params.id)
    if (!sale) return res(ctx.status(404))
    return res(ctx.status(200), ctx.json(sale))
  }),
]
