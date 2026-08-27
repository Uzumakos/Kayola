-- Table des œuvres d'art synchronisée depuis l'application Kayola
create table if not exists public.artworks (
  id text primary key,
  item_code text,
  slug text not null unique,
  title_fr text not null,
  title_en text not null,
  title_ht text,
  artist text not null,
  artist_bio_fr text,
  artist_bio_en text,
  artist_bio_ht text,
  description_fr text not null,
  description_en text not null,
  description_ht text,
  price numeric(12, 2) not null,
  currency text not null default 'USD',
  category_id text not null,
  technique_fr text not null,
  technique_en text not null,
  technique_ht text,
  materials_fr text not null,
  materials_en text not null,
  materials_ht text,
  year integer not null,
  width_cm numeric(10, 2) not null,
  height_cm numeric(10, 2) not null,
  depth_cm numeric(10, 2),
  weight_kg numeric(10, 2),
  is_framed boolean not null default false,
  has_certificate boolean not null default false,
  featured boolean not null default false,
  status text not null,
  reserved_until timestamptz,
  sold_at timestamptz,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artworks_slug_idx on public.artworks (slug);
create index if not exists artworks_status_idx on public.artworks (status);
create index if not exists artworks_category_id_idx on public.artworks (category_id);

alter table public.artworks enable row level security;

-- Politique MVP : autorise la sélection publique (pour le frontend)
create policy "Allow anon select artworks"
  on public.artworks
  for select
  to anon
  using (true);

-- Politique MVP : autorise l'upsert/insert côté client avec la clé anon.
create policy "Allow anon insert artworks"
  on public.artworks
  for insert
  to anon
  with check (true);

create policy "Allow anon update artworks"
  on public.artworks
  for update
  to anon
  using (true)
  with check (true);

create policy "Allow anon delete artworks"
  on public.artworks
  for delete
  to anon
  using (true);
