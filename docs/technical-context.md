# Caribe Gaming — contexto técnico

Documento de referência para agentes e colaboradores. Descreve o estado real
do repositório em 2026-11-03 e consolida as decisões tomadas durante a
migração de Firebase para Supabase.

## 1. Resumo executivo

O Caribe Gaming é uma aplicação de e-commerce demonstrativa de jogos digitais.
O frontend é Angular standalone com SSR/prerendering. O backend é uma API
Express/TypeScript recém-criada para centralizar autenticação de negócio,
carrinho, favoritos, catálogo administrativo, pedidos e integrações externas.

O projeto está em migração:

```text
Estado desejado:
Angular standalone + SSR
        ↓
Express + TypeScript
        ↓
Supabase Auth + PostgreSQL + RLS
        ↓
Asaas Sandbox / RAWG / Steam
```

O estado atual ainda é híbrido:

```text
Frontend → Supabase Auth
Frontend → Backend → Supabase (carrinho parcialmente)
Frontend → localStorage (catálogo e favoritos)
Frontend → fixtures locais (produtos)
```

Não considerar o projeto pronto para produção apenas porque o build passa.

## 2. Decisões e regras importantes

- Implementar em etapas pequenas, independentes e com commits descritivos.
- Não colocar segredos no Angular ou no Git.
- A chave `publishable`/anon do Supabase pode estar no frontend.
- `SUPABASE_SERVICE_ROLE_KEY`, `ASAAS_API_KEY`,
  `ASAAS_WEBHOOK_TOKEN`, `RAWG_API_KEY` e equivalentes ficam somente no backend.
- Não confiar em preço ou total enviados pelo frontend.
- Não usar e-mail fixo para identificar administradores.
- Não usar sincronização destrutiva de carrinho (`delete` global seguido de
  `insert`).
- Não conectar Asaas, RAWG ou outros serviços reais antes de validar o modo
  local, autenticação, RLS e pedidos.
- Não editar migrations já aplicadas; criar migrations incrementais.
- O endereço de cobrança não deve ser solicitado no checkout inicial, salvo
  quando o fluxo de pagamento exigir.
- Componentes antigos de produto podem permanecer por compatibilidade, mas não
  devem receber novas regras enquanto o detalhe genérico não for validado.

## 3. Estrutura relevante

```text
src/
  app/
    core/
      facades/
      guards/
      models/
      services/
    features/
      admin/
      carrinho/
      checkout/
      login/
      perfil/
      produtos/
      sobrenos/
    home/
    shared/
  environments/
backend/
  src/
    config/
    middleware/
    routes/
    types/
supabase/
  migrations/
docs/
```

Arquivos principais:

- `src/app/app.config.ts`: configuração standalone; fornece router, hydration
  e `HttpClient`.
- `src/app/app.routes.ts`: rotas públicas, checkout/perfil protegidos e admin.
- `src/app/core/services/supabase.service.ts`: cliente Supabase público do
  frontend, criado sob demanda.
- `src/app/core/services/auth.ts`: autenticação Supabase.
- `src/app/core/facades/carrinho.facade.ts`: estado local do carrinho e
  sincronização incremental com a API.
- `src/app/core/services/favoritos.service.ts`: ainda baseado em
  `localStorage`.
- `src/app/core/services/produtos.service.ts`: catálogo temporário estático.
- `backend/src/config/env.ts`: validação de ambiente e modos `local`/`integrated`.
- `backend/src/config/supabase.ts`: cliente Supabase com service role no
  backend, criado apenas quando configurado.
- `backend/src/middleware/auth.ts`: validação de Bearer token pelo Supabase.
- `backend/src/routes/cart.ts`: API atômica do carrinho.
- `backend/src/routes/favorites.ts`: API de favoritos.
- `supabase/migrations/20261103030000_initial_schema.sql`: schema inicial e RLS.

## 4. Frontend atual

### 4.1 Ambiente e Supabase

O projeto Supabase configurado é `xffraooahgrezxbpevbc.supabase.co`. A URL e
a chave pública estão em
[src/environments/environment.ts](../src/environments/environment.ts).

Não copiar valores de ambiente para documentação externa. Nunca adicionar a
service role key nesse arquivo.

O frontend usa:

```ts
environment.supabase.url
environment.supabase.anonKey
```

O serviço lança erro explícito quando a configuração está ausente. Em SSR,
o serviço de autenticação captura a ausência de configuração e registra erro;
isso permite o build local antes de configurar o ambiente.

### 4.2 Autenticação

Implementada em `src/app/core/services/auth.ts`:

- login por e-mail/senha;
- Google OAuth;
- recuperação de senha;
- cadastro com `display_name`;
- logout;
- atualização do nome;
- leitura de sessão;
- obtenção do access token para chamadas ao backend.

`AuthFacade` expõe o usuário atual e considera admin somente quando
`role === 'admin'`. Os guards usam `AuthService`; não devem voltar a consultar
um e-mail fixo.

Observação: o role real deve ser confiável no banco/perfil. Metadata de usuário
no token não deve ser a única fonte de autorização para operações administrativas.

### 4.3 Carrinho

`CarrinhoService` mantém estado reativo e `localStorage` para UX local.
`CarrinhoFacade`:

- carrega o carrinho da API após login;
- adiciona item por `POST /api/cart/items`;
- altera quantidade por fluxo incremental;
- remove item por `DELETE /api/cart/items/:productId`;
- limpa por `DELETE /api/cart`;
- envia Bearer token obtido do Supabase;
- não envia itens com IDs que não sejam UUID.

Limitações atuais:

- o catálogo local usa IDs numéricos, incompatíveis com `products.id` UUID;
- falhas de sincronização ficam no estado local e são registradas no console;
- não há interceptor HTTP central para anexar token;
- não há estratégia de retry, fila offline, merge por `updated_at` ou resolução
  de conflito entre dispositivos;
- o endpoint `PATCH /api/cart/items/:productId` existe no backend, mas o
  facade ainda não o usa diretamente em todos os fluxos.

Próxima correção recomendada: mapear o catálogo para UUIDs reais do Supabase ou
criar um adapter de catálogo que preserve uma chave estável, depois extrair um
cliente de API compartilhado.

### 4.4 Favoritos

`FavoritosService` ainda usa somente:

```text
localStorage → caribes-gaming-favoritos
```

Os endpoints backend já existem, mas o serviço frontend ainda não os consome.
A migração deve preservar a UX atual e sincronizar por usuário após login,
preferencialmente com operações individuais:

```text
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:productId
```

### 4.5 Catálogo e produtos

`ProdutosService` mantém aproximadamente 20 jogos em fixture local, com preços
formatados como strings em reais, Steam App IDs, slugs, categorias e imagens.
Esse catálogo não é fonte confiável para cobrança.

Existem componentes antigos específicos por jogo e uma estrutura de detalhe
genérico planejada/introduzida parcialmente. Não duplicar regras de produto nos
componentes antigos.

### 4.6 Checkout e admin

Rotas existentes:

- `/checkout`: protegido por `authGuard`;
- `/perfil`: protegido por `authGuard`;
- `/admin`: protegido por `adminGuard`.

O checkout ainda precisa ser alinhado completamente à API de pedidos,
idempotência, validação server-side e status de pagamento.

O painel administrativo ainda usa serviços/mock em partes. O role deve ser
resolvido pelo perfil/RLS/backend, nunca por e-mail hardcoded.

## 5. Backend atual

### 5.1 Execução

O backend usa Express 5, TypeScript strict, Zod, CORS e Supabase JS.

```bash
cd backend
cp .env.example .env
npm install
npm run typecheck
npm run dev
```

Scripts:

```text
npm run dev       tsx watch src/server.ts
npm run build     tsc -p tsconfig.json
npm run start     node dist/server.js
npm run typecheck tsc -p tsconfig.json --noEmit
```

`APP_MODE=local` é o padrão e permite iniciar sem credenciais externas.
`APP_MODE=integrated` exige:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ASAAS_API_KEY
ASAAS_WEBHOOK_TOKEN
```

`backend/.env` nunca deve ser commitado.

### 5.2 Endpoints implementados

```text
GET    /health

GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:productId
DELETE /api/cart/items/:productId
DELETE /api/cart

GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:productId
```

Carrinho e favoritos exigem:

```http
Authorization: Bearer <supabase-access-token>
```

O middleware consulta `supabase.auth.getUser(token)`. Sem token, a resposta é
`401 authentication_required`; token inválido resulta em `401 invalid_token`.

Payload de item de carrinho:

```json
{
  "productId": "uuid",
  "quantity": 1
}
```

`quantity` é inteiro positivo com máximo 99. Payloads inválidos retornam erro
controlado por Zod. O backend não deve retornar sucesso falso em falhas de
integração.

### 5.3 Erros e segurança

`error-handler.ts`:

- retorna códigos e mensagens controladas;
- não expõe stack trace ao cliente;
- registra erros não tratados no servidor.

O backend desabilita `x-powered-by`, limita JSON a 100 KB e configura CORS a
partir de `CORS_ORIGINS`.

## 6. Banco Supabase

A migration inicial cria:

```text
profiles
products
cart_items
favorites
orders
order_items
```

Enums:

```text
user_role: customer | admin
order_status: pending | payment_pending | paid | failed | cancelled | completed
```

Regras principais:

- `cart_items` tem chave primária composta `(user_id, product_id)`;
- `favorites` tem chave primária composta `(user_id, product_id)`;
- `orders` tem unicidade `(user_id, idempotency_key)`;
- preços são armazenados em centavos;
- produtos possuem `active`, `slug`, `steam_app_id` e preço em centavos;
- profiles são criados por trigger após `auth.users`;
- todas as tabelas de negócio têm RLS habilitado;
- usuários veem/modificam apenas seus dados;
- produtos ativos podem ser lidos publicamente;
- administradores podem gerenciar produtos e atualizar pedidos.

Antes de aplicar em ambiente remoto:

1. revisar compatibilidade com migrations já aplicadas;
2. confirmar se os tipos/enums ainda não existem;
3. aplicar via Supabase CLI;
4. testar RLS com usuário comum, usuário sem sessão e admin;
5. inserir/validar produtos com UUIDs reais;
6. nunca usar service role no browser.

## 7. Histórico das decisões desta sessão

1. O handoff inicial descrevia uma arquitetura Supabase/backend, mas a
   inspeção encontrou o repositório real ainda baseado em Firebase/Firestore,
   sem `backend/` e sem migrations.
2. Foi escolhida migração total e incremental, mantendo primeiro um modo local
   funcional.
3. Foi criada a fundação Express com configuração validada por Zod e health
   check.
4. Foi criada a migration inicial de schema/RLS.
5. Foram criadas APIs atômicas de carrinho e favoritos.
6. A autenticação frontend foi migrada de Firebase para Supabase.
7. O facade do carrinho deixou de usar Firestore e passou a usar a API.
8. A configuração pública do projeto Supabase foi adicionada ao ambiente
   frontend.
9. Os commits criados foram:

```text
2e8fc4e feat: add supabase backend foundation
d55836b chore: ignore backend build artifacts
caa4199 chore: configure supabase frontend project
```

O primeiro commit incluiu artefatos gerados por engano; o commit seguinte os
removeu do índice e adicionou `backend/.gitignore`.

## 8. Validações conhecidas

Passaram após a migração:

```bash
npm run build
cd backend && npm run typecheck
cd backend && npm run build
git diff --check
```

O endpoint local `/health` respondeu com `status: "ok"` e `mode: "local"`.
`GET /api/cart` sem token respondeu `401`.

A suíte completa do Vitest possui falhas legadas, principalmente testes que
assumem a configuração Firebase anterior, templates/seletores antigos e
dependência de artefatos `dist`. Um teste focado do carrinho falha porque não
encontra o seletor `.btn-acao.btn-principal`; isso é uma pendência de teste/UI,
não uma validação de integração Supabase.

Não declarar a suíte estável até corrigir os testes e remover dependências
legadas.

## 9. Backlog recomendado

### Prioridade alta

1. Corrigir testes legados para a arquitetura Supabase/standalone.
2. Remover referências de teste a Firebase que não sejam mocks intencionais.
3. Garantir que o catálogo tenha IDs UUID correspondentes a `products`.
4. Migrar `FavoritosService` para a API por usuário.
5. Criar interceptor HTTP para o Bearer token.
6. Validar a migration e RLS no projeto Supabase remoto.
7. Implementar catálogo backend/repository em vez de depender só de fixtures.

### Pedidos e pagamentos

1. Criar `POST /api/orders`.
2. Validar body com Zod.
3. Recalcular preços no backend a partir de `products`.
4. Usar transação/RPC para pedido e itens.
5. Aplicar `idempotency_key`.
6. Persistir eventos e estados de pagamento.
7. Integrar Asaas Sandbox somente após os passos anteriores.

### Integrações futuras

- RAWG deve ser acessado somente pelo backend.
- Steam deve ser tratado como fonte/adapter de catálogo, não como fonte de
  preço confiável sem validação.
- Adicionar retries, timeout, circuit breaker e logs estruturados para serviços
  externos.

## 10. Checklist para o próximo agente

Antes de editar:

- verificar `git status`;
- não tocar nos diretórios não relacionados criados por ferramentas locais;
- ler este documento e os arquivos reais;
- confirmar se há migration remota já aplicada;
- não assumir que o handoff histórico representa o estado atual.

Ao alterar:

- fazer uma etapa funcional por vez;
- criar migration incremental em vez de editar migration aplicada;
- manter segredos fora do frontend e do Git;
- preservar validação explícita e mensagens de erro;
- atualizar este documento somente quando uma decisão/arquitetura mudar;
- executar build, typecheck e testes focados.

