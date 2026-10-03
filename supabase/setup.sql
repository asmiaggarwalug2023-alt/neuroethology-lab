-- Run this in Supabase SQL editor once the Supabase project is connected.
create extension if not exists pgcrypto;

create table if not exists public.app_records (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('people','projects','setups','research','stock','commitments')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_records_kind_idx on public.app_records(kind);
