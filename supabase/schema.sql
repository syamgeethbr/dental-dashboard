-- Clinic Desk — schema setup
-- Run this in Supabase Dashboard → SQL Editor.
-- If your patients / appointments / treatments tables already exist with
-- different columns, adjust the "alter table ... add column if not exists"
-- sections below instead of the "create table" ones.

create extension if not exists "pgcrypto";

-- ---------- patients ----------
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int,
  phone text not null,
  medical_history text,
  allergies text,
  created_at timestamptz not null default now()
);

-- ---------- appointments ----------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_date date not null,
  appointment_time time not null,
  reason text,
  status text not null default 'Waiting'
    check (status in ('Waiting', 'In Progress', 'Completed', 'Cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists appointments_date_idx on public.appointments (appointment_date);
create index if not exists appointments_patient_idx on public.appointments (patient_id);

-- ---------- treatments ----------
create table if not exists public.treatments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  procedure_name text not null,
  prescription text,
  cost numeric(10, 2) not null default 0,
  treatment_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists treatments_patient_idx on public.treatments (patient_id);

-- ---------- Row Level Security ----------
-- RLS is ON by default for new Supabase projects. The policies below allow
-- full read/write using the publishable ("anon") key, which is what this
-- dashboard uses since it has no login screen.
--
-- IMPORTANT: this means anyone with your project URL + publishable key can
-- read and write every row in these tables — fine for local development or
-- a single trusted device, but not safe for a clinic's real patient data
-- once this goes anywhere staff or the internet can reach it. Before real
-- use, add Supabase Auth and scope these policies to authenticated staff
-- (e.g. `using (auth.role() = 'authenticated')`).

alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.treatments enable row level security;

drop policy if exists "dev_full_access" on public.patients;
create policy "dev_full_access" on public.patients
  for all using (true) with check (true);

drop policy if exists "dev_full_access" on public.appointments;
create policy "dev_full_access" on public.appointments
  for all using (true) with check (true);

drop policy if exists "dev_full_access" on public.treatments;
create policy "dev_full_access" on public.treatments
  for all using (true) with check (true);

-- ---------- Realtime ----------
-- Enables the dashboard's live appointment updates.
alter publication supabase_realtime add table public.appointments;
