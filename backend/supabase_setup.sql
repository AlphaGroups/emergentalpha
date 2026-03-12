-- Alpha Groups Backend - Supabase Database Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create leads table
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

-- Create admins table
create table if not exists public.admins (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password text not null,
  name text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.leads enable row level security;
alter table public.admins enable row level security;

-- Create policies for leads (allow all operations for now - secure in production)
create policy "Enable all access for leads"
on public.leads
for all
using (true)
with check (true);

-- Create policies for admins
create policy "Enable all access for admins"
on public.admins
for all
using (true)
with check (true);

-- Create indexes for better query performance
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_source_idx on public.leads(source);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists admins_email_idx on public.admins(email);

-- Insert default admin (email: admin@alphagroups.com, password: admin123)
-- Password hash for 'admin123' using bcrypt
insert into public.admins (email, password, name)
values (
  'admin@alphagroups.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MebAJu',
  'Admin User'
)
on conflict (email) do nothing;
