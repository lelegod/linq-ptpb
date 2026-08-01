-- Waitlist signups (public join form — anon insert only)
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age integer not null check (age >= 13 and age <= 120),
  email text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_lower_idx
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

drop policy if exists "waitlist_anon_insert" on public.waitlist;
create policy "waitlist_anon_insert"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (
    char_length(trim(name)) between 1 and 120
    and age between 13 and 120
    and char_length(trim(email)) between 3 and 320
  );

-- Intentionally no SELECT/UPDATE/DELETE for anon — dashboard/service role only.
