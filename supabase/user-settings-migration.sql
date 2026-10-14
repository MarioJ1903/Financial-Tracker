-- Run once in Supabase SQL Editor to enable synced RuangDana preferences.
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  currency text not null default 'IDR' check (currency in ('IDR', 'USD', 'SGD', 'MYR')),
  monthly_budget bigint not null default 6000000 check (monthly_budget >= 0),
  category_budgets jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;
drop policy if exists "Users manage own settings" on public.user_settings;
create policy "Users manage own settings"
  on public.user_settings for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.user_settings to authenticated;
