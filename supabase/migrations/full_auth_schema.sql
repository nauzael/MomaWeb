-- 1. Ensure Profiles Table Exists
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text check (role in ('admin', 'editor', 'user')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Roles Table
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  permissions jsonb default '[]'::jsonb, -- Array of allowed route keys
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Seed Default Roles
insert into public.roles (name, permissions, description)
values 
('Admin', '["all"]', 'Acceso total al sistema'),
('Editor', '["dashboard", "bookings", "experiences", "customers"]', 'Gestión de contenido y ventas'),
('Viewer', '["dashboard"]', 'Solo lectura de métricas básicas')
on conflict (name) do nothing;

-- 4. Link Profiles to Roles
alter table public.profiles add column if not exists role_id uuid references public.roles(id);

-- 5. Migrate Existing Users to New Roles
do $$
declare
  admin_role_id uuid;
  user_role_id uuid;
begin
  select id into admin_role_id from public.roles where name = 'Admin';
  select id into user_role_id from public.roles where name = 'Viewer';

  -- Update admin users
  update public.profiles 
  set role_id = admin_role_id 
  where role = 'admin' and role_id is null;

  -- Update regular users
  update public.profiles 
  set role_id = user_role_id 
  where (role = 'user' or role is null) and role_id is null;
end
$$;

-- 6. Enable RLS
alter table public.profiles enable row level security;
alter table public.roles enable row level security;

-- 7. Policies
-- Profiles: Everyone can read (needed for role checks), Users can update own
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Roles: Everyone can read, Only Admins can edit
drop policy if exists "Roles are viewable by everyone" on public.roles;
create policy "Roles are viewable by everyone" on public.roles for select using (true);

drop policy if exists "Only admins can insert roles" on public.roles;
create policy "Only admins can insert roles" on public.roles for insert with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role_id in (select id from public.roles where name = 'Admin')
  )
);

drop policy if exists "Only admins can update roles" on public.roles;
create policy "Only admins can update roles" on public.roles for update using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role_id in (select id from public.roles where name = 'Admin')
  )
);

drop policy if exists "Only admins can delete roles" on public.roles;
create policy "Only admins can delete roles" on public.roles for delete using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role_id in (select id from public.roles where name = 'Admin')
  )
);

-- 8. Trigger for New Users (Updated to set default role_id)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_role_id uuid;
begin
  select id into default_role_id from public.roles where name = 'Viewer';
  
  insert into public.profiles (id, email, role, role_id)
  values (new.id, new.email, 'user', default_role_id);
  
  return new;
end;
$$ language plpgsql security definer;
