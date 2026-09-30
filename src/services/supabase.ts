import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default keys from environment if available
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// LocalStorage keys for user-configured credentials
const STORAGE_KEY_URL = 'zentask_supabase_url';
const STORAGE_KEY_KEY = 'zentask_supabase_key';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_KEY_URL) || ENV_URL;
  const key = localStorage.getItem(STORAGE_KEY_KEY) || ENV_KEY;
  return { url, key };
}

export function saveStoredSupabaseConfig(url: string, key: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  // Reinitialize client
  initSupabase();
}

let supabaseInstance: SupabaseClient | null = null;

export function initSupabase(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseConfig();
  if (url && key) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      supabaseInstance = null;
      return null;
    }
  }
  supabaseInstance = null;
  return null;
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    return initSupabase();
  }
  return supabaseInstance;
}

export const SUPABASE_SQL_SETUP_SCRIPT = `-- Run this in your Supabase SQL Editor to enable real-time sync for ZenTask:

-- 1. Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  notes text default '',
  bucket text check (bucket in ('today', 'this_week', 'later')) not null default 'today',
  is_completed boolean not null default false,
  completed_at timestamptz,
  project_id uuid,
  project_title text,
  order_index integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Projects & Learning table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text check (category in ('learning', 'project')) not null default 'project',
  description text default '',
  color text default 'sky',
  checklist jsonb default '[]'::jsonb,
  resources jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.tasks enable row level security;
alter table public.projects enable row level security;

-- 4. Policies: users can only view and manage their own data
create policy "Users can manage their own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Enable Realtime Publications
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.projects;
`;
