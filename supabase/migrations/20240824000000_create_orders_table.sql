-- Table des commandes synchronisée depuis l'application Kayola (Guest Checkout)
create table if not exists public.orders (
  id text primary key,
  order_number text not null unique,
  access_code text not null,
  tracking_token text not null,
  artwork_id text not null,
  customer_first_name text not null,
  customer_last_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_city text not null,
  customer_country text not null,
  customer_notes text,
  payment_method_id text not null,
  amount numeric(12, 2) not null,
  currency text not null default 'USD',
  status text not null,
  payment_proofs jsonb not null default '[]'::jsonb,
  events jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_order_number_idx on public.orders (order_number);
create index if not exists orders_tracking_token_idx on public.orders (tracking_token);
create index if not exists orders_status_idx on public.orders (status);

alter table public.orders enable row level security;

-- Politique MVP : autorise l'upsert côté client avec la clé anon.
-- À durcir en production (auth admin, Edge Functions, etc.).
create policy "Allow anon insert orders"
  on public.orders
  for insert
  to anon
  with check (true);

create policy "Allow anon update orders"
  on public.orders
  for update
  to anon
  using (true)
  with check (true);

create policy "Allow anon select orders"
  on public.orders
  for select
  to anon
  using (true);
