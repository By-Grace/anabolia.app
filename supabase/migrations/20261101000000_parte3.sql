-- Anaból[IA] · MVP parte 3: dados do corpo para a meta e lista de compras.
alter table public.profiles
  add column if not exists sex text check (sex in ('m', 'f')),
  add column if not exists birth_year integer check (birth_year between 1900 and 2100),
  add column if not exists weight_kg numeric(5, 1) check (weight_kg between 35 and 250),
  add column if not exists height_cm integer check (height_cm between 130 and 230),
  add column if not exists activity text check (activity in ('leve', 'moderado', 'alto', 'muito_alto'));

create table if not exists public.shopping_list (
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_slug text not null,
  portions integer not null check (portions between 1 and 8),
  checked integer[] not null default '{}',
  added_at timestamptz not null default now(),
  primary key (user_id, recipe_slug)
);
alter table public.shopping_list enable row level security;
create policy "shopping_list: dono" on public.shopping_list for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
