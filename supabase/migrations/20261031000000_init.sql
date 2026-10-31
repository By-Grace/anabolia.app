-- Anaból[IA] · MVP parte 1: meta, refeições marcadas e favoritas, por usuário (RLS).

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  goal_protein_g integer check (goal_protein_g between 40 and 400),
  goal_kcal integer check (goal_kcal between 1200 and 7000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_slug text not null,
  portions integer not null check (portions between 1 and 8),
  slot text not null check (slot in ('cafe', 'almoco', 'lanche', 'jantar')),
  day_key text not null check (day_key ~ '^\d{4}-\d{2}-\d{2}$'),
  logged_at timestamptz not null default now()
);
create index if not exists meal_logs_user_day on public.meal_logs (user_id, day_key);

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_slug)
);

alter table public.profiles enable row level security;
alter table public.meal_logs enable row level security;
alter table public.favorites enable row level security;

create policy "profiles: dono" on public.profiles for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "meal_logs: dono" on public.meal_logs for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "favorites: dono" on public.favorites for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
