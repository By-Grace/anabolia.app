# MVP parte 2 — login e assinatura (com pagamento de teste) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conta de verdade por link mágico no e-mail, paywall de R$ 29,90/mês, assinatura liberada por evento de pagamento e cancelamento no Perfil, tudo atrás de um adaptador de pagamento que hoje roda em modo de teste.

**Architecture:** Regras puras de acesso e de eventos em `web/lib/domain/access.ts`. Pagamento atrás de uma interface única em `web/lib/payments/` com o adaptador `teste` implementado e `onprofit` como esqueleto que recusa até ser configurado. Assinatura gravada só pelo servidor com a chave de serviço (RLS só deixa o dono ler). O bloqueio de rotas mora no middleware e só liga com `PAYWALL=on`; desligado, o app segue aberto como hoje.

**Tech Stack:** Next.js 15.5 App Router, Supabase Auth (link mágico com PKCE, `@supabase/ssr`), Postgres RLS, zod, Vitest + Testing Library, Node `crypto` (HMAC).

**Spec:** `docs/specs/2026-10-31-mvp-escopo.md`, seções 3.7 (conta e assinatura), 3.8 (perfil: sair e cancelar) e 7 (pagamento por adaptador, OnProfit com webhooks). Visual: `DESIGN.md`.

## Global Constraints

- Login por e-mail com link mágico, mais Google e Apple.
- Fluxo: landing/Instagram → cria conta → onboarding → paywall → checkout → app.
- Preço: R$29,90/mês. Sem trial grátis. Garantia de 7 dias com reembolso.
- Checkout com Pix e cartão. Cancelamento pelo próprio app.
- O código fala com o pagamento por uma única interface (criar assinatura, consultar status, cancelar, receber webhook); o provedor é um adaptador trocável. Até a decisão, o app funciona com um adaptador de teste.
- OnProfit: checkout hospedado por eles; o app recebe webhooks (pedido criado, status atualizado, assinatura cancelada, pagamento concluído) para liberar ou bloquear o acesso. Login no app por e-mail do comprador.
- Visual e copy: DESIGN.md, sem tagline, sem travessão na interface, pt-BR.
- Chaves: nada de segredo no código nem em `NEXT_PUBLIC_*`. A chave de serviço do Supabase só no servidor.

## Decisões desta parte (registradas, sem pergunta)

- **Bloqueio desligado por padrão:** `PAYWALL=on` liga; qualquer outro valor deixa tudo aberto. Produção só liga quando a OnProfit existir.
- **Google e Apple atrás de flags** (`NEXT_PUBLIC_LOGIN_GOOGLE=on`, `NEXT_PUBLIC_LOGIN_APPLE=on`): os provedores precisam ser configurados no painel do Supabase (e a Apple exige conta paga de desenvolvedor). Sem flag, a tela de entrar mostra só o e-mail.
- **Quem já usa como anônimo não perde nada:** com sessão anônima, "Receber link" chama `updateUser({ email })`, que transforma a conta anônima em permanente após o clique. Se o e-mail já tem conta, cai para `signInWithOtp` (entra na conta existente).
- **Estados da assinatura:** `ativa`, `pendente`, `atrasada`, `cancelada`, `reembolsada`. Acesso: `ativa`; ou `cancelada`/`atrasada` enquanto `current_period_end` estiver no futuro. `reembolsada` corta na hora.
- **Eventos normalizados:** `pago` (com fim do período), `pendente`, `atrasado`, `cancelado`, `reembolsado`. Idempotência por `(provider, provider_event_id)`.
- **Usuário do evento:** `userId` quando o provedor devolver a referência; senão pelo e-mail, via função SQL `user_id_by_email` só para a chave de serviço.
- **Pagamento de teste:** `/assinar/teste` mostra um checkout falso com "Simular pagamento aprovado"; recusa quando `VERCEL_ENV=production`. O webhook de teste usa HMAC-SHA256 com `PAYMENT_WEBHOOK_SECRET` no cabeçalho `x-assinatura`.
- **Período:** 30 dias a partir do pagamento no adaptador de teste.

## Review Focus

1. Webhook repetido (mesmo id) não pode estender o período duas vezes nem duplicar linha.
2. Assinatura forjada pelo cliente: nenhum caminho do navegador grava em `subscriptions` (RLS sem política de escrita; ações validam no servidor).
3. Pessoa anônima com refeições marcadas que cria conta mantém as refeições, a lista e a meta.
4. Com `PAYWALL` desligado nada muda para quem usa hoje (rotas abertas, sessão anônima nas escritas).
5. Link mágico aberto em outro navegador ou expirado mostra uma tela clara para pedir outro, não um erro cru.

---

### Task 1: Regras de acesso e de eventos

**Files:** Create `web/lib/domain/access.ts`; Test `web/tests/access.test.ts`

**Interfaces — Produces:**
- `type SubStatus = "ativa" | "pendente" | "atrasada" | "cancelada" | "reembolsada"`
- `type Subscription = { provider: ProviderId; providerRef: string | null; status: SubStatus; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean }`
- `type ProviderId = "teste" | "onprofit" | "stripe"`
- `type PaymentEvent = { id: string; provider: ProviderId; type: "pago" | "pendente" | "atrasado" | "cancelado" | "reembolsado"; email: string | null; userId: string | null; providerRef: string | null; periodEnd: string | null }`
- `hasAccess(sub: Subscription | null, now: Date): boolean`
- `applyEvent(prev: Subscription | null, e: PaymentEvent): Subscription`
- `PLAN = { id: "mensal", priceCents: 2990, label: "R$ 29,90 por mês", periodDays: 30 }`

- [ ] Testes: acesso só com `ativa` ou cancelada/atrasada no período; reembolsada corta na hora; `pago` vira `ativa` com o novo fim e `cancelAtPeriodEnd=false`; `cancelado` mantém o fim e marca `cancelAtPeriodEnd`; `pendente` sobre `ativa` não derruba o acesso; `atrasado` vira `atrasada` mantendo o fim.
- [ ] FAIL → implementar → PASS → commit `feat(dominio): regras de acesso da assinatura`.

### Task 2: Banco, cliente de serviço e repositórios

**Files:** Create `supabase/migrations/20261102000000_parte2.sql`, `web/lib/supabase/admin.ts`, `web/lib/data/subscription-repo.ts`; Test `web/tests/subscription-repo.test.ts`

Migração: `subscriptions` (user_id pk → auth.users on delete cascade, provider, provider_ref, status com check, current_period_end, cancel_at_period_end default false, updated_at) com RLS e só política de leitura do dono; `payment_events` (id uuid, provider, provider_event_id, type, user_id, email, payload jsonb, received_at; unique (provider, provider_event_id)) com RLS ligada e nenhuma política; `user_id_by_email(text) returns uuid` `security definer`, `set search_path = ''`, com `revoke execute ... from public, anon, authenticated` e `grant ... to service_role`.

**Interfaces — Produces:**
- `supabaseAdmin(): SupabaseClient` (lança "Falta SUPABASE_SERVICE_ROLE_KEY" se faltar; arquivo começa com `import "server-only"`)
- `readSubscription(client, userId): Promise<Subscription | null>` (cliente do usuário, RLS)
- `recordEvent(admin, e: PaymentEvent, payload: unknown): Promise<boolean>` (false se já existia: idempotência)
- `userIdByEmail(admin, email): Promise<string | null>`
- `writeSubscription(admin, userId, sub: Subscription): Promise<void>` (upsert)

- [ ] Testes com o fake: leitura converte colunas; `recordEvent` devolve false no conflito (código 23505); `writeSubscription` faz upsert com `onConflict: "user_id"`.
- [ ] FAIL → implementar → PASS → commit `feat(dados): assinaturas e eventos de pagamento`.

### Task 3: Adaptador de pagamento e webhook

**Files:** Create `web/lib/payments/types.ts`, `web/lib/payments/teste.ts`, `web/lib/payments/onprofit.ts`, `web/lib/payments/index.ts`, `web/lib/payments/apply.ts`, `web/app/api/pagamento/webhook/[provider]/route.ts`; Test `web/tests/payments.test.ts`

**Interfaces — Produces:**
- `interface PaymentProvider { id: ProviderId; checkoutUrl(u: { userId: string; email: string }): Promise<string>; parseWebhook(req: Request): Promise<PaymentEvent | null>; cancel(sub: Subscription, userId: string): Promise<PaymentEvent | null> }`
- `getProvider(id?: string): PaymentProvider` (padrão `process.env.PAYMENT_PROVIDER ?? "teste"`)
- `signTeste(body: string, secret: string): string`
- `applyPaymentEvent(admin, e: PaymentEvent, payload: unknown): Promise<"aplicado" | "repetido" | "sem-usuario">`

- [ ] Testes: assinatura HMAC certa aceita e errada recusa (null); corpo inválido recusa; `applyPaymentEvent` repetido devolve "repetido" sem gravar assinatura; sem userId resolve pelo e-mail; e-mail desconhecido devolve "sem-usuario"; `onprofit.checkoutUrl` lança "OnProfit ainda não configurada".
- [ ] Rota: 401 assinatura inválida, 404 provedor desconhecido, 503 sem segredo, 200 nos demais.
- [ ] FAIL → implementar → PASS → commit `feat(pagamento): adaptador de teste, esqueleto OnProfit e webhook idempotente`.

### Task 4: Entrar com link mágico

**Files:** Create `web/app/entrar/page.tsx`, `web/app/entrar/EntrarView.tsx`, `web/app/entrar/actions.ts`, `web/app/auth/callback/route.ts`, `web/lib/auth/login.ts`; Test `web/tests/entrar.test.tsx`, `web/tests/login.test.ts`

**Interfaces — Produces:**
- `sendLoginLink(client, email: string, redirectTo: string): Promise<{ ok: true } | { ok: false; message: string }>` — anônimo: `updateUser({ email }, { emailRedirectTo })`; e-mail já usado: `signInWithOtp`; sem sessão: `signInWithOtp({ shouldCreateUser: true })`. E-mail inválido: "Confira o e-mail.".
- `EntrarView({ next, onSend, google, apple, error? })` — estados: formulário; enviado ("Enviamos um link para x. Abra no celular para entrar." com "Usar outro e-mail").
- `signOutAction()` → `/entrar`.
- Callback: `code` → `exchangeCodeForSession`; `token_hash`+`type` → `verifyOtp`; sucesso → `next` (só caminho interno começando com "/" e sem "//"); falha → `/entrar?erro=link`, onde a tela diz "Esse link expirou ou já foi usado. Peça outro.".

- [ ] Testes: os três ramos de `sendLoginLink`; `next` externo vira "/"; view envia, mostra o estado enviado, mostra o erro de link; botões Google/Apple só com flag.
- [ ] FAIL → implementar → PASS → commit `feat(web): entrar com link mágico, sem perder o que a conta anônima já tinha`.

### Task 5: Paywall e checkout de teste

**Files:** Create `web/app/assinar/page.tsx`, `web/app/assinar/AssinarView.tsx`, `web/app/assinar/actions.ts`, `web/app/assinar/teste/page.tsx`, `web/app/assinar/teste/TesteView.tsx`; Test `web/tests/assinar.test.tsx`

Copy: título "Assinatura"; três linhas com check: "N receitas com a proteína calculada", "Meta diária e histórico da semana", "Lista de compras das suas receitas"; cartão de preço "R$ 29,90 por mês", "Pix ou cartão. Cancela quando quiser no Perfil.", "Garantia de 7 dias: se não gostar, devolvemos o valor."; primário "Assinar por R$ 29,90/mês". Com acesso: "Sua assinatura está ativa" e link para Hoje.

- [ ] Testes: view mostra preço e as três linhas com N real; com acesso mostra o estado ativo; `startCheckoutAction` sem conta permanente manda para `/entrar?next=/assinar`; checkout de teste recusa em produção e, fora dela, aplica `pago` e leva para `/hoje`.
- [ ] FAIL → implementar → PASS → commit `feat(web): paywall e checkout de teste`.

### Task 6: Bloqueio por assinatura

**Files:** Create `web/lib/auth/gate.ts`; Modify `web/middleware.ts`; Test `web/tests/gate.test.ts`

**Interfaces — Produces:** `gate(path: string, s: { user: boolean; anonymous: boolean; access: boolean }, paywall: boolean): string | null` (destino do redirecionamento ou null).

Regras com paywall: públicas `/entrar`, `/auth/*`, `/assinar*`, `/api/pagamento/*`; sem conta permanente → `/entrar?next=<path>`; protegidas (`/`, `/hoje`, `/comecar`, `/receitas*`, `/cozinhar*`, `/lista`, `/perfil`, `/api/log-meal*`) sem acesso → `/assinar` (exceto `/comecar` e `/`, liberadas para quem tem conta: o cadastro vem antes do paywall). Sem paywall: sempre null.

- [ ] Testes cobrindo cada regra e o paywall desligado.
- [ ] FAIL → implementar → PASS → commit `feat(web): bloqueio por assinatura atrás de PAYWALL=on`.

### Task 7: Conta no Perfil, verificação e docs

**Files:** Modify `web/app/perfil/{page,PerfilView,actions}.tsx?`; Test `web/tests/perfil.test.tsx`; Modify `DESIGN.md`, `web/e2e/loop.spec.ts`, `web/.env.example`

- [ ] Perfil ganha a seção "Conta": e-mail, estado da assinatura ("Ativa até 30/11", "Cancelada, acesso até 30/11"), "Cancelar assinatura" com confirmação na tela e "Sair". Anônimo: "Criar conta" para `/entrar`.
- [ ] Testes da seção; suite, tsc, build; migração aplicada quando o MCP voltar; conferência no simulador; DESIGN.md e `.env.example` com as variáveis novas (sem valores).
- [ ] Commit `feat(web): conta e assinatura no Perfil`.
