-- Pilot access allowlist.
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.

create table if not exists public.allowed_emails (
  email text primary key
);

-- Locks the table from the public API (anon key) — only the
-- service role key (used server-side in api/generate.js) can read it.
alter table public.allowed_emails enable row level security;

insert into public.allowed_emails (email) values
  ('totorubusinessmanagement@gmail.com'),
  ('arihia.chen@totoru.com.au')
on conflict (email) do nothing;

-- To add someone later, run:
-- insert into public.allowed_emails (email) values ('newperson@example.com') on conflict (email) do nothing;

-- To remove someone later, run:
-- delete from public.allowed_emails where email = 'someone@example.com';
