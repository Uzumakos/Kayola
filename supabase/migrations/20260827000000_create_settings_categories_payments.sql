-- =======================================================
-- Tables for Payment Methods, Categories and Settings
-- =======================================================

-- 1. Payment Methods Table
create table if not exists public.payment_methods (
  id text primary key,
  name text not null,
  type text not null,
  description_fr text,
  description_en text,
  description_ht text,
  instructions_fr text,
  instructions_en text,
  instructions_ht text,
  account_name text,
  account_number text,
  phone_number text,
  additional_information_fr text,
  additional_information_en text,
  additional_information_ht text,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Categories Table
create table if not exists public.categories (
  id text primary key,
  slug text not null unique,
  name_fr text not null,
  name_en text not null,
  name_ht text,
  description_fr text,
  description_en text,
  description_ht text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Settings Table
-- We use a single-row table approach with id='gallery_settings'
create table if not exists public.settings (
  id text primary key default 'gallery_settings',
  gallery_name text not null default 'KAYOLA',
  tagline_fr text,
  tagline_en text,
  tagline_ht text,
  logo_url text,
  logo_type text default 'monogram',
  contact_email text,
  contact_phone text,
  address text,
  updated_at timestamptz not null default now()
);

-- Row Level Security (RLS) setup
alter table public.payment_methods enable row level security;
alter table public.categories enable row level security;
alter table public.settings enable row level security;

-- Policies for payment_methods (MVP: Allow anon full access)
create policy "Allow anon select payment_methods" on public.payment_methods for select to anon using (true);
create policy "Allow anon insert payment_methods" on public.payment_methods for insert to anon with check (true);
create policy "Allow anon update payment_methods" on public.payment_methods for update to anon using (true) with check (true);
create policy "Allow anon delete payment_methods" on public.payment_methods for delete to anon using (true);

-- Policies for categories
create policy "Allow anon select categories" on public.categories for select to anon using (true);
create policy "Allow anon insert categories" on public.categories for insert to anon with check (true);
create policy "Allow anon update categories" on public.categories for update to anon using (true) with check (true);
create policy "Allow anon delete categories" on public.categories for delete to anon using (true);

-- Policies for settings
create policy "Allow anon select settings" on public.settings for select to anon using (true);
create policy "Allow anon insert settings" on public.settings for insert to anon with check (true);
create policy "Allow anon update settings" on public.settings for update to anon using (true) with check (true);

-- Initial default settings row (optional, will be upserted by app anyway)
insert into public.settings (id, gallery_name) values ('gallery_settings', 'KAYOLA') on conflict (id) do nothing;
