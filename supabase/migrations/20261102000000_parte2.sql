-- Anaból[IA] · MVP parte 2: assinatura e eventos de pagamento.
-- Só o servidor (chave de serviço) grava. O dono só lê a própria assinatura.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  provider text not null check (provider in ('teste', 'onprofit', 'stripe')),
  provider_ref text,
  status text not null check (status in ('ativa', 'pendente', 'atrasada', 'cancelada', 'reembolsada')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "subscriptions: dono lê" on public.subscriptions for select
  using ((select auth.uid()) = user_id);

-- Registro de todo evento recebido. A chave única garante que um webhook repetido não é aplicado duas vezes.
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  type text not null,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  payload jsonb,
  received_at timestamptz not null default now(),
  -- Preenchido só depois de gravar a assinatura: evento registrado sem applied_at é reaplicado no reenvio.
  applied_at timestamptz,
  unique (provider, provider_event_id)
);
alter table public.payment_events enable row level security;
-- Sem políticas: ninguém além da chave de serviço lê ou grava.

-- O comprador chega pelo e-mail. Só a chave de serviço pode perguntar.
create or replace function public.user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;
revoke execute on function public.user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.user_id_by_email(text) to service_role;
