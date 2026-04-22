-- Alpha Groups Backend - Supabase Database Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create leads table
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text not null,
  project_type text not null,
  plot_area double precision,
  location text,
  budget text,
  message text,
  source text default 'website',
  status text default 'new',
  notes text,
  created_at timestamptz default now()
);

-- 2. Create admins table
create table if not exists public.admins (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password text not null,
  name text not null,
  created_at timestamptz default now()
);

-- 3. Create vendors table
create table if not exists public.vendors (
  id uuid primary key default uuid_generate_v4(),
  vendor_id text unique not null,
  name text not null,
  company_name text,
  phone text not null,
  email text,
  website text,
  categories jsonb default '[]'::jsonb,
  description text,
  document_url text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- 4. Create package_configs table
create table if not exists public.package_configs (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  description text,
  price_per_sft double precision not null,
  is_visible boolean default true,
  "order" integer default 0
);

-- 5. Create package_features table
create table if not exists public.package_features (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  classic text,
  select text,
  signature text,
  customize text,
  "order" integer default 0
);

-- 6. Create partners table
create table if not exists public.partners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text unique not null,
  password text not null,
  referral_code text unique not null,
  commission_percent double precision default 2.0,
  account_manager text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 7. Create referral_terms table
create table if not exists public.referral_terms (
  id text primary key default 'referral_terms',
  commission_percent double precision default 2.0,
  validity_days integer default 90,
  payment_timeline_days integer default 30,
  terms_content text,
  updated_at timestamptz default now()
);

-- 8. Create collaboration_leads table
create table if not exists public.collaboration_leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text,
  land_location text not null,
  land_size text not null,
  intent text not null,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

-- 9. Create listings table
create table if not exists public.listings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  property_type text not null,
  location text not null,
  price double precision not null,
  area_sqft double precision not null,
  bedrooms integer not null,
  bathrooms integer not null,
  description text,
  images jsonb default '[]'::jsonb,
  status text default 'available',
  owner_type text default 'alpha',
  partner_id uuid references public.partners(id) on delete set null,
  amenities jsonb default '[]'::jsonb,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- 10. Create marketing_materials table
create table if not exists public.marketing_materials (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  file_url text not null,
  file_type text not null,
  created_at timestamptz default now()
);

-- 11. Create partner_payments table
create table if not exists public.partner_payments (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid references public.partners(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  amount double precision not null,
  status text default 'paid',
  payment_date timestamptz default now()
);

-- Enable Row Level Security
alter table public.leads enable row level security;
alter table public.admins enable row level security;
alter table public.vendors enable row level security;
alter table public.package_configs enable row level security;
alter table public.package_features enable row level security;
alter table public.partners enable row level security;
alter table public.referral_terms enable row level security;
alter table public.collaboration_leads enable row level security;
alter table public.listings enable row level security;
alter table public.marketing_materials enable row level security;
alter table public.partner_payments enable row level security;

-- Create policies (allow all operations for now - secure in production)
create policy "Enable all access for leads" on public.leads for all using (true) with check (true);
create policy "Enable all access for admins" on public.admins for all using (true) with check (true);
create policy "Enable all access for vendors" on public.vendors for all using (true) with check (true);
create policy "Enable all access for package_configs" on public.package_configs for all using (true) with check (true);
create policy "Enable all access for package_features" on public.package_features for all using (true) with check (true);
create policy "Enable all access for partners" on public.partners for all using (true) with check (true);
create policy "Enable all access for referral_terms" on public.referral_terms for all using (true) with check (true);
create policy "Enable all access for collaboration_leads" on public.collaboration_leads for all using (true) with check (true);
create policy "Enable all access for listings" on public.listings for all using (true) with check (true);
create policy "Enable all access for marketing_materials" on public.marketing_materials for all using (true) with check (true);
create policy "Enable all access for partner_payments" on public.partner_payments for all using (true) with check (true);

-- Create indexes for better query performance
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_source_idx on public.leads(source);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists admins_email_idx on public.admins(email);

-- Insert default admin (email: admin@alphagroups.com, password: admin123)
insert into public.admins (email, password, name)
values (
  'admin@alphagroups.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MebAJu',
  'Admin User'
)
on conflict (email) do nothing;
