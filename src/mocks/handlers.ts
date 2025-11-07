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
  })
]
