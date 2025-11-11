# Backoffice FinTech – Frontend

Interface administrativa (React + TypeScript + Vite) utilizada pelo time de Backoffice. O foco deste módulo é permitir que **usuários admin** visualizem financiamentos, produtos e vendas. Usuários **cliente** autenticados são bloqueados e redirecionados para uma tela de aviso.

## Funcionalidades

- Autenticação integrada ao backend (ou MSW). Sessão persistida no `localStorage` e sincronizada via `/auth/me` quando há token.
- Controle de acesso simples: rotas protegidas (`/dashboard`, `/financiamentos`, `/vendas`) exigem admin; `/acesso-negado` orienta clientes.
- Navegação rápida entre Financiamentos e Vendas em todas as telas do backoffice.
- Layouts responsivos (cards → grid fluido, tabelas com rolagem horizontal, formulários em colunas adaptáveis).
- Suporte ao Mock Service Worker para demonstrar o módulo sem depender de outros times.

## Atualizações recentes (`feature/routes-permissions`)

- Botão de edição por produto no módulo de vendas com modal administrativo, salvando via `PUT /products/:id`.
- Ajustes de responsividade mobile (cabeçalhos flexíveis, filtros empilháveis, tabelas adaptáveis e modais fluidos).
- Revisão dos filtros de financiamentos (remoção do botão duplicado "Novo Financiamento" e espaçamento consistente).

## Variáveis de ambiente

```env
VITE_API_URL=http://localhost:3001   # Backend do backoffice
VITE_USE_MOCK=false                  # true ativa MSW
```

- `VITE_USE_MOCK=true`: usa `src/mocks/handlers.ts` para simular autenticação, financiamentos, produtos e vendas.
- `VITE_USE_MOCK=false`: consome o backend real publicado (Render/Heroku/etc). Auth e dados saem do mesmo host.

## Como executar localmente

```bash
npm install
cp .env.example .env          # ajuste se necessário
npm run dev                   # http://localhost:5173
```

Build para deploy:

```bash
npm run build
npm run preview
```

## Rotas principais

| Rota                   | Descrição                                                   |
|-----------------------|-------------------------------------------------------------|
| `/login`              | Autenticação / fallback mockado                             |
| `/dashboard`          | Cards + gráficos (somente admin)                            |
| `/financiamentos`     | Lista administrativa + filtros                              |
| `/financiamentos/:id` | Detalhe + edição                                            |
| `/financiamentos/novo`| Cadastro rápido                                             |
| `/vendas`             | Consolidação de produtos e vendas                           |
| `/acesso-negado`      | Mensagem exibida ao cliente quando tenta acessar o backoffice |

## Fluxo de perfis

- `admin`: acesso completo após login. Caso tente abrir `/acesso-negado`, é redirecionado para `/dashboard`.
- `client`: sempre redirecionado para `/acesso-negado`. A tela orienta a usar o portal do cliente ou pedir permissão.
- Mock local: `admin/admin123` e `client/client123` (apenas quando o backend não responde).

## Integração com o backend

- Os serviços Axios estão em `src/services/api.ts`. Quando `VITE_USE_MOCK=false`, todas as rotas (`/auth/login`, `/auth/me`, `/financings`, `/products`, `/sales`) são chamadas no host configurado em `VITE_API_URL`.
- Para demonstrar com o backend deste repositório:

```bash
# Backend
cd ../BackFinTech
npm install
npm run dev

# Frontend
cd ../FrontFinTech
VITE_API_URL=http://localhost:3001 VITE_USE_MOCK=false npm run dev
```

## Teste sugerido

1. Levante o backend (`npm run dev`) e confirme `http://localhost:3001/api-docs`.
2. No frontend, defina `VITE_API_URL=http://localhost:3001` e `VITE_USE_MOCK=false`.
3. Login como `admin/admin123` → visitar `/dashboard`, `/financiamentos`, `/vendas`.
4. Logout, login como `client/client123` → verificar redirecionamento para `/acesso-negado`.
5. Ative `VITE_USE_MOCK=true` para apresentar o módulo sem backend.

## Tecnologias

- React 18 + TypeScript + Vite
- React Router DOM
- Axios
- Recharts
- MSW para mocks

> Banco de dados/integrações externas não fazem parte do escopo deste time; usamos o backend do grupo (com mock habilitado) ou o MSW para simulações.
