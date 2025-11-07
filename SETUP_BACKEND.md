# 🔧 Configuração de Backend

Este guia explica como conectar o frontend ao backend real.

## 🎭 Modo Mock vs Backend Real

O projeto suporta dois modos de operação:

### 1. **Modo Mock** (padrão para desenvolvimento)
- Usa MSW (Mock Service Worker) para simular APIs
- Não precisa de backend rodando
- Dados ficam apenas na memória do navegador

### 2. **Modo Backend Real**
- Conecta com seu backend Node.js/Express
- Dados persistidos no banco de dados
- Requer backend rodando

## ⚙️ Configuração

### Passo 1: Configurar variáveis de ambiente

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# URL do seu backend
VITE_API_URL=http://localhost:3000

# true = usa mock | false = usa backend real
VITE_USE_MOCK=false
```

### Passo 2: Estrutura esperada do Backend

Seu backend deve expor os seguintes endpoints:

#### **Autenticação**
```
POST /auth/login
Body: { username: string, password: string }
Response: { token: string, user: { id: string, name: string, role: 'admin' | 'client' } }

GET /auth/me
Headers: { Authorization: 'Bearer <token>' }
Response: { id: string, name: string, role: 'admin' | 'client' }
```

#### **Financiamentos**
```
GET /financings
Headers: { Authorization: 'Bearer <token>' }
Response: Array<{
  id: string
  customer: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'signed'
  termMonths: number
  createdAt: string
}>

GET /financings/:id
Headers: { Authorization: 'Bearer <token>' }
Response: {
  id: string
  customer: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'signed'
  termMonths: number
  createdAt: string
}

PUT /financings/:id
Headers: { Authorization: 'Bearer <token>' }
Body: {
  customer?: string
  amount?: number
  status?: string
  termMonths?: number
}
Response: { ...dadosAtualizados }
```

### Passo 3: CORS no Backend

Adicione CORS ao seu backend Express:

```javascript
const cors = require('cors')

app.use(cors({
  origin: 'http://localhost:5173', // URL do frontend
  credentials: true
}))
```

### Passo 4: Rodar o projeto

```bash
# 1. Inicie seu backend (porta 3000 por padrão)
cd seu-backend
npm start

# 2. Em outro terminal, inicie o frontend
cd FrontFinTech
npm run dev
```

## 🔄 Alternando entre Mock e Real

### Usar Mock (desenvolvimento sem backend):
```env
VITE_USE_MOCK=true
```

### Usar Backend Real:
```env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3000
```

## 🌐 Deploy em Produção

### Vercel (Frontend)

1. No painel do Vercel, configure as variáveis de ambiente:
   - `VITE_API_URL`: URL do seu backend em produção
   - `VITE_USE_MOCK`: `false`

2. Deploy:
```bash
vercel --prod
```

### Backend (Render/Railway/Heroku)

1. Deploy seu backend primeiro
2. Anote a URL de produção (ex: `https://seu-backend.onrender.com`)
3. Configure no Vercel: `VITE_API_URL=https://seu-backend.onrender.com`

## 🧪 Testando

### Com Mock:
```bash
VITE_USE_MOCK=true npm run dev
# Login: admin / qualquer senha
```

### Com Backend Real:
```bash
VITE_USE_MOCK=false npm run dev
# Login: usar credenciais do seu banco de dados
```

## ❓ Troubleshooting

### Erro: "Failed to fetch"
- ✅ Verifique se o backend está rodando
- ✅ Confira se a `VITE_API_URL` está correta
- ✅ Verifique CORS no backend

### Erro: 401 Unauthorized
- ✅ Verifique se o token está sendo enviado corretamente
- ✅ Confira se o backend valida tokens JWT corretamente

### Dados não aparecem
- ✅ Abra o DevTools (F12) → Network → veja se as requests estão indo para o backend correto
- ✅ Verifique se `VITE_USE_MOCK=false` está configurado
- ✅ Confira se o backend retorna dados no formato esperado

## 📝 Exemplo de Backend Mínimo

Veja o arquivo `BACKEND_EXAMPLE.md` para um exemplo completo de backend compatível.
