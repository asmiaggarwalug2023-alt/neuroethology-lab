-- Neuroethology Lab: real web push reminders
-- Run once in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  reminder_minutes integer not null default 15 check (reminder_minutes between 1 and 1440),
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_email_idx
  on public.push_subscriptions(lower(email));

alter table public.push_subscriptions enable row level security;

drop policy if exists "users can read own push subscriptions" on public.push_subscriptions;
create policy "users can read own push subscriptions"
on public.push_subscriptions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can insert own push subscriptions" on public.push_subscriptions;
create policy "users can insert own push subscriptions"
on public.push_subscriptions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own push subscriptions" on public.push_subscriptions;
create policy "users can update own push subscriptions"
on public.push_subscriptions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can delete own push subscriptions" on public.push_subscriptions;
create policy "users can delete own push subscriptions"
on public.push_subscriptions for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.push_delivery_log (
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  commitment_id uuid not null references public.app_records(id) on delete cascade,
  sent_at timestamptz not null default now(),
  primary key (subscription_id, commitment_id)
);

alter table public.push_delivery_log enable row level security;

create or replace function public.get_due_push_jobs(p_secret text)
returns table (
  subscription_id uuid,
  endpoint text,
  p256dh text,
  auth text,
  reminder_minutes integer,
  commitment_id uuid,
  task text,
  start_time text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if encode(digest(coalesce(p_secret,''),'sha256'),'hex') <>
     '7e7082a2c6dec1b80f4474d6c21b00f5086e0bee8d0df71ad73e5ae672652608' then
    return;
  end if;

  return query
  select
    s.id,
    s.endpoint,
    s.p256dh,
    s.auth,
    s.reminder_minutes,
    r.id,
    coalesce(r.data->>'task','Lab responsibility'),
    to_char(
      ((r.data->>'date' || ' ' || r.data->>'start')::timestamp at time zone 'Asia/Kolkata')
      at time zone 'Asia/Kolkata',
      'DD Mon, HH12:MI AM'
    )
  from public.push_subscriptions s
  join public.app_records r
    on r.kind = 'commitments'
   and lower(coalesce(r.data->>'email','')) = lower(s.email)
  where
    ((r.data->>'date' || ' ' || r.data->>'start')::timestamp at time zone 'Asia/Kolkata')
      - make_interval(mins => s.reminder_minutes) <= now()
    and
    ((r.data->>'date' || ' ' || r.data->>'start')::timestamp at time zone 'Asia/Kolkata')
      - make_interval(mins => s.reminder_minutes) > now() - interval '5 minutes'
    and not exists (
      select 1
      from public.push_delivery_log l
      where l.subscription_id = s.id
        and l.commitment_id = r.id
    );
end;
$$;

create or replace function public.mark_push_job_sent(
  p_secret text,
  p_subscription_id uuid,
  p_commitment_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if encode(digest(coalesce(p_secret,''),'sha256'),'hex') <>
     '7e7082a2c6dec1b80f4474d6c21b00f5086e0bee8d0df71ad73e5ae672652608' then
    raise exception 'unauthorized';
  end if;

  insert into public.push_delivery_log(subscription_id,commitment_id)
  values (p_subscription_id,p_commitment_id)
  on conflict do nothing;
end;
$$;

revoke all on function public.get_due_push_jobs(text) from public;
revoke all on function public.mark_push_job_sent(text,uuid,uuid) from public;

grant execute on function public.get_due_push_jobs(text) to anon, authenticated;
grant execute on function public.mark_push_job_sent(text,uuid,uuid) to anon, authenticated;
