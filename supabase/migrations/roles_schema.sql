-- Create roles table
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  permissions jsonb default '[]'::jsonb, -- Array of allowed route keys like ['dashboard', 'bookings']
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed default roles
insert into public.roles (name, permissions, description)
values 
('Admin', '["all"]', 'Acceso total al sistema'),
('Editor', '["dashboard", "bookings", "experiences", "customers"]', 'Gestión de contenido y ventas'),
('Viewer', '["dashboard"]', 'Solo lectura de métricas básicas')
on conflict (name) do nothing;

-- Add role_id to profiles
alter table public.profiles add column if not exists role_id uuid references public.roles(id);

-- Migration: Update existing profiles to have the 'Admin' role id if they are currently 'admin'
do $$
declare
  admin_role_id uuid;
  user_role_id uuid;
begin
  select id into admin_role_id from public.roles where name = 'Admin';
  select id into user_role_id from public.roles where name = 'Viewer'; -- Default for 'user'

  -- Update profiles that have legacy text roles
  update public.profiles set role_id = admin_role_id where role = 'admin' and role_id is null;
  update public.profiles set role_id = user_role_id where role = 'user' and role_id is null;
end
$$;

-- RLS for Roles
alter table public.roles enable row level security;
create policy "Roles are viewable by everyone" on public.roles for select using (true);
create policy "Only admins can insert roles" on public.roles for insert with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role_id in (select id from public.roles where name = 'Admin')
  )
);
create policy "Only admins can update roles" on public.roles for update using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role_id in (select id from public.roles where name = 'Admin')
  )
);
