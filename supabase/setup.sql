-- Run this once in the Supabase SQL editor for the Neuroethology Lab project.
create extension if not exists pgcrypto;

create table if not exists public.app_records (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('people','projects','setups','research','stock','commitments')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_records_kind_idx on public.app_records(kind);

alter table public.app_records enable row level security;

drop policy if exists "authenticated can read app records" on public.app_records;
create policy "authenticated can read app records"
on public.app_records for select
to authenticated
using (true);

drop policy if exists "authenticated can insert app records" on public.app_records;
create policy "authenticated can insert app records"
on public.app_records for insert
to authenticated
with check (true);

drop policy if exists "authenticated can update app records" on public.app_records;
create policy "authenticated can update app records"
on public.app_records for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated can delete app records" on public.app_records;
create policy "authenticated can delete app records"
on public.app_records for delete
to authenticated
using (true);
