-- ================================================
-- DASHBOARD PESSOAL — MIGRATIONS SUPABASE
-- Execute no SQL Editor do seu projeto Supabase
-- ================================================

-- Habilitar extensão UUID
create extension if not exists "uuid-ossp";

-- ================================================
-- TABELAS
-- ================================================

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  tags text[] default '{}',
  position integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  color text default 'yellow' check (color in ('yellow', 'blue', 'green', 'pink', 'purple')),
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  description text,
  category text,
  favicon_url text,
  created_at timestamptz default now()
);

create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  target_value numeric,
  current_value numeric default 0,
  unit text,
  deadline date,
  status text default 'active' check (status in ('active', 'completed', 'paused')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  dashboard_layout jsonb default '{}',
  widgets_enabled text[] default '{"tasks","notes","bookmarks","goals"}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================
-- ÍNDICES
-- ================================================

create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_status_idx on public.tasks(status);
create index tasks_due_date_idx on public.tasks(due_date);
create index notes_user_id_idx on public.notes(user_id);
create index bookmarks_user_id_idx on public.bookmarks(user_id);
create index goals_user_id_idx on public.goals(user_id);

-- ================================================
-- TRIGGER updated_at
-- ================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.handle_updated_at();

create trigger notes_updated_at before update on public.notes
  for each row execute function public.handle_updated_at();

create trigger goals_updated_at before update on public.goals
  for each row execute function public.handle_updated_at();

create trigger preferences_updated_at before update on public.user_preferences
  for each row execute function public.handle_updated_at();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.goals enable row level security;
alter table public.user_preferences enable row level security;

create policy "tasks: acesso proprio" on public.tasks
  for all using (auth.uid() = user_id);

create policy "notes: acesso proprio" on public.notes
  for all using (auth.uid() = user_id);

create policy "bookmarks: acesso proprio" on public.bookmarks
  for all using (auth.uid() = user_id);

create policy "goals: acesso proprio" on public.goals
  for all using (auth.uid() = user_id);

create policy "preferences: acesso proprio" on public.user_preferences
  for all using (auth.uid() = user_id);
