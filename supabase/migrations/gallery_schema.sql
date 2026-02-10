-- Create Gallery Images Table
create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt_text text,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table gallery_images enable row level security;

-- Public Read
create policy "Public gallery images are viewable by everyone" 
  on gallery_images for select 
  using (true);

-- Admin/Editor Write (Improved to allow specific admin user IDs even without profile if needed, though usually profile should exist)
-- For now, kept as role checking, but ensure profiles are correct.
create policy "Admins and Editors can insert gallery images" 
  on gallery_images for insert 
  with check (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role in ('admin', 'editor')
    )
  );

create policy "Admins and Editors can update gallery images" 
  on gallery_images for update 
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role in ('admin', 'editor')
    )
  );

create policy "Admins and Editors can delete gallery images" 
  on gallery_images for delete 
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() 
      and role in ('admin', 'editor')
    )
  );

-- Storage bucket for gallery
insert into storage.buckets (id, name, public) 
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Storage policies
 -- !!! IMPORTANT !!!
 -- If you updated this recently, you might need to DROP the policy first to recreate it
 -- drop policy "Public Access" on storage.objects;
 -- etc.

create policy "Public Access" 
  on storage.objects for select 
  using ( bucket_id = 'gallery' );

create policy "Auth users can upload" 
  on storage.objects for insert 
  with check (
    bucket_id = 'gallery' 
    and auth.role() = 'authenticated'
  );

create policy "Auth users can update" 
  on storage.objects for update 
  using (
    bucket_id = 'gallery' 
    and auth.role() = 'authenticated'
  );

create policy "Auth users can delete" 
  on storage.objects for delete 
  using (
    bucket_id = 'gallery' 
    and auth.role() = 'authenticated'
  );

-- Fix Profile Role for Admin if not set
-- (This runs in SQL editor to fix existing user)
-- update profiles set role = 'admin' where email = 'admin@momaturismo.com';
-- update profiles set role = 'admin' where email = 'admin@moma.com';
