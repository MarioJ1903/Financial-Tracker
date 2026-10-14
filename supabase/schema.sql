-- Run this script in the Supabase SQL Editor for your project.
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (char_length(category) between 1 and 60),
  amount bigint not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  transaction_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc);

alter table public.transactions enable row level security;

drop policy if exists "Users read own transactions" on public.transactions;
create policy "Users read own transactions"
  on public.transactions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own transactions" on public.transactions;
create policy "Users insert own transactions"
  on public.transactions for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own transactions" on public.transactions;
create policy "Users update own transactions"
  on public.transactions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete own transactions" on public.transactions;
create policy "Users delete own transactions"
  on public.transactions for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.transactions to authenticated;

-- Per-user preferences; RLS ensures settings only sync to the signed-in owner.
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  currency text not null default 'IDR' check (currency in ('IDR', 'USD', 'SGD', 'MYR')),
  monthly_budget bigint not null default 6000000 check (monthly_budget >= 0),
  category_budgets jsonb not null default '{}'::jsonb,
  savings_opening_balance bigint not null default 0 check (savings_opening_balance >= 0),
  savings_start_date date not null default current_date,
  updated_at timestamptz not null default now()
);

alter table public.user_settings add column if not exists savings_opening_balance bigint not null default 0 check (savings_opening_balance >= 0);
alter table public.user_settings add column if not exists savings_start_date date not null default current_date;

alter table public.user_settings enable row level security;
drop policy if exists "Users manage own settings" on public.user_settings;
create policy "Users manage own settings"
  on public.user_settings for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.user_settings to authenticated;
