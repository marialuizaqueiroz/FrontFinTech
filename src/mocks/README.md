MSW handlers estão em `src/mocks/handlers.ts`.

Comportamento:
- POST /auth/login: aceita qualquer username/password; username 'admin' gera token admin
- GET /auth/me: valida token simples
- GET /financings, GET /financings/:id, PUT /financings/:id: endpoints de backoffice (apenas admin)
