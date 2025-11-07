# Backoffice - Financiamentos (Frontend)

Este repositório contém o frontend do Backoffice de Financiamentos, implementado em React + TypeScript (Vite) com MSW para mocks de API e Recharts para visualizações.

## 🎯 Principais funcionalidades

### 🔐 Autenticação
- Login (mock) — usuários `admin` e `client` (qualquer senha)
- Rota protegida que permite apenas `admin` acessar o backoffice
- Persistência de sessão via localStorage

### 📊 Dashboard com Gráficos (estilo Power BI)
- **Gráfico de Pizza** - Visualização da distribuição de financiamentos por status
- **Gráfico de Barras** - Comparação visual entre diferentes status
- **Alternância de visualização:**
  - 👥 Por número de clientes
  - 💰 Por valor total em cada status
- **Cards de Resumo:**
  - Total de financiamentos
  - Valor total financiado
  - Ticket médio
  - Taxa de aprovação
- **Tabela detalhada** com percentuais por status

### 📋 Lista de Financiamentos
- Campo de pesquisa - busca por cliente ou ID
- Filtro por status (Pendente, Aprovado, Rejeitado, Assinado)
- Badges coloridos para status
- Contador de resultados filtrados
- Tabela responsiva com formatação brasileira de valores

### ✏️ Edição Completa de Financiamentos
- Edição de **todos os campos** (exceto ID):
  - Nome do cliente
  - Valor do financiamento
  - Prazo em meses
  - Status
- Validação de alterações não salvas
- Feedback visual de salvamento

### 🎨 Design Moderno
- Interface estilo Power BI com cores profissionais
- Layout responsivo
- Animações e transições suaves
- Feedback visual em tempo real

## 📦 Como rodar localmente

1. Instale dependências:

```bash
npm install
```

2. Inicie em modo desenvolvimento:

```bash
npm run dev
```

Abra http://localhost:5173 (ou a porta informada pelo Vite).

## 🔑 Credenciais de teste

- **admin** / qualquer senha — papel `admin` (acesso ao backoffice)
- **client** / qualquer senha — papel `client` (acesso negado ao backoffice)

## 🗂️ Estrutura de Páginas

- `/login` - Tela de autenticação
- `/dashboard` - Dashboard com gráficos e estatísticas (página inicial após login)
- `/financiamentos` - Lista de financiamentos com pesquisa e filtros
- `/financiamentos/:id` - Visualização e edição completa de financiamento

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router DOM** - Navegação
- **Recharts** - Gráficos interativos
- **MSW (Mock Service Worker)** - Simulação de APIs

## 📊 Funcionalidades do Dashboard

O dashboard oferece análises completas com:

1. **Métricas principais em cards:**
   - Total de financiamentos
   - Valor total financiado
   - Ticket médio por financiamento
   - Taxa de aprovação (% aprovados + assinados)

2. **Visualizações interativas:**
   - Gráfico de pizza com percentuais
   - Gráfico de barras para comparação
   - Alternância entre visualização por quantidade ou valor

3. **Tabela de estatísticas:**
   - Detalhamento por status
   - Percentual de clientes em cada status
   - Percentual de valor em cada status
   - Totais consolidados

## 🚀 Notas sobre deploy

- Frontend pode ser publicado no **Vercel**
- Em produção, remova o MSW ou mantenha apenas para demonstração
- Configure as variáveis de ambiente para apontar aos backends reais:
  - Serviço de Cadastro para autenticação (`/auth/*`)
  - Serviço de Financiamento para dados (`/financings*`)

## 🔗 Integração com a atividade da equipe

Este frontend consome os seguintes endpoints:

**Autenticação (Time de Cadastro):**
- `POST /auth/login` - Login de usuário
- `GET /auth/me` - Validação de token

**Financiamentos:**
- `GET /financings` - Lista todos os financiamentos
- `GET /financings/:id` - Detalhes de um financiamento
- `PUT /financings/:id` - Atualiza dados do financiamento

Para integração com os times reais, apenas a URL-base precisa ser ajustada e o MSW removido ou desabilitado em produção.

## 💡 Melhorias Futuras

- Paginação com lazy loading
- Exportação de relatórios (PDF/Excel)
- Timeline do financiamento com histórico de alterações
- Upload de documentos
- Notificações em tempo real
- Filtros avançados (data, valor min/max)
- Gráficos de tendência temporal
- Integração com envio de e-mail ao assinar contrato
