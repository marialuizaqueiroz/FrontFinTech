# 🚀 Guia Rápido: Conectar com Backend Real

## Passo a Passo

### 1️⃣ Configure o arquivo `.env`

```bash
# Copie o exemplo
cp .env.example .env
```

Edite o `.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK=false
```

### 2️⃣ Seu backend deve ter estes endpoints:

```
✅ POST   /auth/login       - Login do usuário
✅ GET    /auth/me          - Validar token
✅ GET    /financings       - Listar financiamentos (admin only)
✅ GET    /financings/:id   - Detalhes de um financiamento
✅ PUT    /financings/:id   - Atualizar financiamento
```

### 3️⃣ Configure CORS no backend

```javascript
// No seu backend Express
const cors = require('cors')

app.use(cors({
  origin: 'http://localhost:5173', // URL do frontend
  credentials: true
}))
```

### 4️⃣ Rode o backend

```bash
cd seu-backend
npm start
# Backend rodando em http://localhost:3000
```

### 5️⃣ Rode o frontend

```bash
cd FrontFinTech
npm run dev
# Frontend rodando em http://localhost:5173
```

### 6️⃣ Teste!

Abra http://localhost:5173 e faça login com credenciais do seu banco de dados.

---

## 🔄 Voltar para Mock?

Edite o `.env`:
```env
VITE_USE_MOCK=true
```

Reinicie o frontend (`npm run dev`).

---

## ❓ Troubleshooting

### "Failed to fetch" ou "Network Error"
1. ✅ Backend está rodando? (`http://localhost:3000`)
2. ✅ CORS configurado no backend?
3. ✅ URL no `.env` está correta?

### Tela branca após login
1. ✅ Backend retorna dados no formato esperado?
2. ✅ Token JWT está sendo retornado no login?
3. ✅ Abra o DevTools (F12) → Console → veja os erros

### 401 Unauthorized
1. ✅ Token está sendo enviado no header `Authorization: Bearer <token>`?
2. ✅ Backend valida o token corretamente?

---

## 📚 Documentação Completa

- **Setup detalhado:** [SETUP_BACKEND.md](./SETUP_BACKEND.md)
- **Exemplo de backend:** [BACKEND_EXAMPLE.md](./BACKEND_EXAMPLE.md)
- **README principal:** [README.md](./README.md)

---

## 💡 Dica

Durante o desenvolvimento, você pode usar mock para o frontend funcionar enquanto o backend ainda não está pronto!

```env
VITE_USE_MOCK=true  # Frontend funciona sozinho com dados mockados
```
