-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Dynasties table
create table public.dynasties (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  school text not null,
  conference text not null,
  coach_name text not null,
  prestige text not null check (prestige in ('blue_blood', 'rising_power', 'rebuild')),
  created_at timestamptz default now() not null
);

-- Seasons table
create table public.seasons (
  id uuid default uuid_generate_v4() primary key,
  dynasty_id uuid references public.dynasties(id) on delete cascade not null,
  year integer not null,
  current_week integer default 1 not null,
  season_state jsonb default '{}'::jsonb not null,
  narrative_memory text default '' not null,
  updated_at timestamptz default now() not null
);

-- RLS policies
alter table public.dynasties enable row level security;
alter table public.seasons enable row level security;

create policy "Users can view their own dynasties"
  on public.dynasties for select
  using (auth.uid() = user_id);

create policy "Users can insert their own dynasties"
  on public.dynasties for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own dynasties"
  on public.dynasties for update
  using (auth.uid() = user_id);

create policy "Users can delete their own dynasties"
  on public.dynasties for delete
  using (auth.uid() = user_id);

create policy "Users can view seasons for their dynasties"
  on public.seasons for select
  using (dynasty_id in (select id from public.dynasties where user_id = auth.uid()));

create policy "Users can insert seasons for their dynasties"
  on public.seasons for insert
  with check (dynasty_id in (select id from public.dynasties where user_id = auth.uid()));

create policy "Users can update seasons for their dynasties"
  on public.seasons for update
  using (dynasty_id in (select id from public.dynasties where user_id = auth.uid()));

create policy "Users can delete seasons for their dynasties"
  on public.seasons for delete
  using (dynasty_id in (select id from public.dynasties where user_id = auth.uid()));

-- Weekly submissions table
create table public.weekly_submissions (
  id uuid default uuid_generate_v4() primary key,
  season_id uuid references public.seasons(id) on delete cascade not null,
  week integer not null,
  raw_input jsonb not null,
  user_box_score jsonb default '{}'::jsonb,
  opponent_box_score jsonb default '{}'::jsonb,
  rankings jsonb default '[]'::jsonb,
  status text default 'submitted' not null check (status in ('submitted', 'generating', 'complete', 'error')),
  generated_at timestamptz,
  submitted_at timestamptz default now() not null,
  unique(season_id, week)
);

-- RLS for weekly_submissions
alter table public.weekly_submissions enable row level security;

create policy "Users can view their own weekly submissions"
  on public.weekly_submissions for select
  using (season_id in (
    select s.id from public.seasons s
    join public.dynasties d on s.dynasty_id = d.id
    where d.user_id = auth.uid()
  ));

create policy "Users can insert their own weekly submissions"
  on public.weekly_submissions for insert
  with check (season_id in (
    select s.id from public.seasons s
    join public.dynasties d on s.dynasty_id = d.id
    where d.user_id = auth.uid()
  ));

create policy "Users can update their own weekly submissions"
  on public.weekly_submissions for update
  using (season_id in (
    select s.id from public.seasons s
    join public.dynasties d on s.dynasty_id = d.id
    where d.user_id = auth.uid()
  ));

-- Press conferences table
create table public.press_conferences (
  id uuid default uuid_generate_v4() primary key,
  season_id uuid references public.seasons(id) on delete cascade not null,
  week integer not null,
  questions_answers jsonb not null default '[]'::jsonb,
  grade jsonb,
  created_at timestamptz default now() not null
);

alter table public.press_conferences enable row level security;

create policy "Users can manage their own press conferences"
  on public.press_conferences for all
  using (season_id in (
    select s.id from public.seasons s
    join public.dynasties d on s.dynasty_id = d.id
    where d.user_id = auth.uid()
  ));

-- Recruits table
create table public.recruits (
  id uuid default uuid_generate_v4() primary key,
  dynasty_id uuid references public.dynasties(id) on delete cascade not null,
  season_id uuid references public.seasons(id) on delete cascade not null,
  name text not null,
  position text not null,
  stars integer not null check (stars between 1 and 5),
  status text not null default 'offered' check (status in ('offered', 'visited', 'leader', 'committed', 'decommitted', 'lost', 'flipped')),
  trend text not null default 'stable' check (trend in ('hot', 'warm', 'stable', 'cooling', 'cold')),
  backstory text default '' not null,
  storyline_history jsonb default '[]'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.recruits enable row level security;

create policy "Users can manage their own recruits"
  on public.recruits for all
  using (dynasty_id in (select id from public.dynasties where user_id = auth.uid()));

-- Content cache table
create table public.content_cache (
  id uuid default uuid_generate_v4() primary key,
  weekly_submission_id uuid references public.weekly_submissions(id) on delete cascade not null,
  content_type text not null,
  content jsonb not null,
  created_at timestamptz default now() not null
);

alter table public.content_cache enable row level security;

create policy "Users can view their own content"
  on public.content_cache for select
  using (weekly_submission_id in (
    select ws.id from public.weekly_submissions ws
    join public.seasons s on ws.season_id = s.id
    join public.dynasties d on s.dynasty_id = d.id
    where d.user_id = auth.uid()
  ));

create policy "Users can insert their own content"
  on public.content_cache for insert
  with check (weekly_submission_id in (
    select ws.id from public.weekly_submissions ws
    join public.seasons s on ws.season_id = s.id
    join public.dynasties d on s.dynasty_id = d.id
    where d.user_id = auth.uid()
  ));

-- Subscriptions table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  tier text not null default 'free' check (tier in ('free', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);
