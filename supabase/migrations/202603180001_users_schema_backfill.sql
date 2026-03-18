alter table if exists public.users
  add column if not exists dodo_customer_id text,
  add column if not exists current_subscription_id text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;
