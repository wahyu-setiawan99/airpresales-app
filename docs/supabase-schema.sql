-- ============================================================
-- AirPresales — Supabase schema
-- Paste this whole file into: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to run once on a fresh project.
-- ============================================================

-- ---------- Tables ----------

create table if not exists consultants (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users on delete cascade,
  name              text not null,
  firm              text,
  discipline        text,
  title             text,
  phone             text,
  whatsapp          text,
  email             text,
  birthday          date,
  tier              text default 'B',
  cadence_days      int,
  last_contacted_at timestamptz,
  notes             text,
  is_active         boolean default true,
  created_at        timestamptz default now()
);

create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users on delete cascade,
  name          text not null,
  owner_client  text,
  product_scope text default 'hvac',
  stage         text default 'lead',
  spec_status   text default 'unknown',
  est_value     bigint,
  close_date    date,
  notes         text,
  created_at    timestamptz default now()
);

create table if not exists interactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users on delete cascade,
  consultant_id uuid not null references consultants on delete cascade,
  type          text,
  notes         text,
  occurred_at   timestamptz,
  created_at    timestamptz default now()
);

create table if not exists project_consultants (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users on delete cascade,
  project_id      uuid not null references projects on delete cascade,
  consultant_id   uuid not null references consultants on delete cascade,
  role_in_project text,
  influence       text default 'med',
  unique (project_id, consultant_id)
);

create table if not exists user_stats (
  user_id            uuid primary key references auth.users on delete cascade,
  total_points       int default 0,
  current_streak     int default 0,
  longest_streak     int default 0,
  last_activity_date date
);

create table if not exists achievements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  code        text not null,
  unlocked_at timestamptz default now(),
  unique (user_id, code)
);

-- ---------- Row Level Security (each user sees only their own rows) ----------

alter table consultants          enable row level security;
alter table projects             enable row level security;
alter table interactions         enable row level security;
alter table project_consultants  enable row level security;
alter table user_stats           enable row level security;
alter table achievements         enable row level security;

create policy "own consultants"  on consultants
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own projects" on projects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own interactions" on interactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own project_consultants" on project_consultants
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own user_stats" on user_stats
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own achievements" on achievements
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Helpful indexes ----------

create index if not exists idx_interactions_consultant on interactions (consultant_id);
create index if not exists idx_pc_project on project_consultants (project_id);
create index if not exists idx_pc_consultant on project_consultants (consultant_id);
