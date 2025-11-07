# 🔧 Exemplo de Backend Express Compatível

Este é um exemplo mínimo de backend Express compatível com o frontend.

## Setup Rápido

```bash
mkdir backend-financiamento
cd backend-financiamento
npm init -y
npm install express cors jsonwebtoken dotenv
npm install -D typescript @types/express @types/cors @types/jsonwebtoken ts-node nodemon
```

## Estrutura de Arquivos

```
backend-financiamento/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   └── financings.ts
│   └── middleware/
│       └── auth.ts
├── package.json
└── .env
```

## Código Exemplo

### `src/server.ts`
```typescript
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import financingRoutes from './routes/financings'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.use('/auth', authRoutes)
app.use('/financings', financingRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`)
})
```

### `src/routes/auth.ts`
```typescript
import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()
const SECRET = process.env.JWT_SECRET || 'secret-key'

// Mock de usuários - substitua por consulta ao banco
const users = [
  { id: '1', username: 'admin', password: 'admin', name: 'Admin User', role: 'admin' },
  { id: '2', username: 'client', password: 'client', name: 'Client User', role: 'client' }
]

router.post('/login', (req, res) => {
  const { username, password } = req.body
  
  const user = users.find(u => u.username === username && u.password === password)
  
  if (!user) {
    return res.status(401).json({ message: 'Credenciais inválidas' })
  }
  
  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: '24h' }
  )
  
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role
    }
  })
})

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  try {
    const decoded: any = jwt.verify(token, SECRET)
    const user = users.find(u => u.id === decoded.id)
    
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' })
    }
    
    res.json({
      id: user.id,
      name: user.name,
      role: user.role
    })
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
})

export default router
```

### `src/middleware/auth.ts`
```typescript
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'secret-key'

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  try {
    const decoded = jwt.verify(token, SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' })
  }
  next()
}
```

### `src/routes/financings.ts`
```typescript
import { Router } from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = Router()

// Mock de dados - substitua por consulta ao banco
let financings = [
  { 
    id: 'f-001', 
    customer: 'João Silva', 
    amount: 45000, 
    status: 'pending', 
    createdAt: new Date('2025-11-01').toISOString(), 
    termMonths: 60 
  },
  { 
    id: 'f-002', 
    customer: 'Maria Souza', 
    amount: 120000, 
    status: 'approved', 
    createdAt: new Date('2025-10-28').toISOString(), 
    termMonths: 84 
  }
]

// Listar todos (apenas admin)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  res.json(financings)
})

// Buscar por ID (apenas admin)
router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
  const financing = financings.find(f => f.id === req.params.id)
  
  if (!financing) {
    return res.status(404).json({ message: 'Financiamento não encontrado' })
  }
  
  res.json(financing)
})

// Atualizar (apenas admin)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const index = financings.findIndex(f => f.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ message: 'Financiamento não encontrado' })
  }
  
  // Atualiza apenas os campos permitidos
  const { customer, amount, status, termMonths } = req.body
  
  financings[index] = {
    ...financings[index],
    ...(customer && { customer }),
    ...(amount !== undefined && { amount }),
    ...(status && { status }),
    ...(termMonths !== undefined && { termMonths })
  }
  
  res.json(financings[index])
})

export default router
```

### `package.json`
```json
{
  "name": "backend-financiamento",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/jsonwebtoken": "^9.0.2",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1"
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### `.env`
```
PORT=3000
JWT_SECRET=seu-secret-super-seguro-aqui
```

## Rodando

```bash
npm run dev
```

O backend estará em `http://localhost:3000`

## Integração com Banco de Dados

Substitua os arrays mock por queries reais:

### MongoDB (com Mongoose)
```typescript
import Financing from './models/Financing'

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const financings = await Financing.find()
  res.json(financings)
})
```

### PostgreSQL (com Prisma)
```typescript
import { prisma } from './db'

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const financings = await prisma.financing.findMany()
  res.json(financings)
})
```

## ✅ Pronto!

Agora configure o frontend com:
```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK=false
```
