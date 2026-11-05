# Caribe Gaming Backend

API Express em TypeScript para centralizar regras de negócio e integrações.

## Desenvolvimento local

```bash
cp .env.example .env
npm install
npm run typecheck
npm run dev
```

O modo padrão é `APP_MODE=local`. Nesse modo a API inicia sem Supabase,
Asaas ou RAWG configurados. O modo `integrated` valida as credenciais
necessárias durante a inicialização.

Endpoint de verificação:

```text
GET http://localhost:3000/health
```
