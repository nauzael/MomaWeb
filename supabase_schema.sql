-- Create the experiences table
create table if not exists experiences (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  description text,
  image text,
  gallery text[] default '{}',
  price_cop numeric default 0,
  price_usd numeric default 0,
  max_capacity integer default 0,
  includes text[] default '{}',
  excludes text[] default '{}',
  location_name text,
  location_lat double precision,
  location_lng double precision
);

-- Enable Row Level Security (RLS)
alter table experiences enable row level security;

-- Create policies (modify as needed for your auth requirements)

-- Allow public read access
create policy "Public experiences are viewable by everyone"
  on experiences for select
  using (true);

-- Allow authenticated users (or service role) to insert/update/delete
-- For now, allowing service role bypass (which the admin API uses) is default,
-- but if you want to allow logged-in users to edit:
create policy "Authenticated users can insert experiences"
  on experiences for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update experiences"
  on experiences for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete experiences"
  on experiences for delete
  using (auth.role() = 'authenticated');
