-- Enable PostGIS for location
create extension if not exists postgis;

-- Experiences Table
create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  image text default ''::text,
  gallery jsonb default '[]'::jsonb,
  price_cop numeric,
  price_usd numeric,
  location_name text,
  location_lat double precision,
  location_lng double precision,
  location_coords geography(Point, 4326),
  includes jsonb default '[]'::jsonb,
  excludes jsonb default '[]'::jsonb,
  recommendations text,
  max_capacity integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table experiences add column if not exists description text;
alter table experiences add column if not exists image text default ''::text;
alter table experiences add column if not exists gallery jsonb default '[]'::jsonb;
alter table experiences add column if not exists location_name text;
alter table experiences add column if not exists location_lat double precision;
alter table experiences add column if not exists location_lng double precision;
alter table experiences add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Experience Media Table
create table if not exists experience_media (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid references experiences(id) on delete cascade not null,
  url text not null,
  type text check (type in ('image', 'video')),
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings Table
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid references experiences(id) not null,
  customer_name text not null,
  customer_email text not null,
  travel_date date not null,
  guests_count integer not null,
  total_amount numeric not null,
  currency text check (currency in ('COP', 'USD')) default 'COP',
  status text check (status in ('pending', 'confirmed', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments Table
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) not null,
  gateway text check (gateway in ('wompi', 'stripe')),
  transaction_id text,
  payment_status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Experiences: Public Read, Admin Write
alter table experiences enable row level security;
create policy "Public experiences are viewable by everyone" on experiences for select using (true);

-- Media: Public Read, Admin Write
alter table experience_media enable row level security;
create policy "Public media are viewable by everyone" on experience_media for select using (true);

-- Bookings: Insert public (creation), View own (by email? tricky without auth) or Admin View
alter table bookings enable row level security;
create policy "Anyone can create a booking" on bookings for insert with check (true);

-- Payments: Connection to bookings
alter table payments enable row level security;
