-- Run this SQL in Supabase Dashboard -> SQL Editor.
create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  tmdb_id bigint not null,
  title text not null,
  poster_path text,
  backdrop_path text,
  release_date text not null default '',
  overview text not null default '',
  vote_average numeric not null default 0,
  genres jsonb not null default '[]'::jsonb,
  runtime integer,
  status text not null default 'to_watch'
    check (status in ('to_watch', 'watching', 'waiting', 'watched')),
  user_id uuid not null references auth.users(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists movies_user_status_position_idx
  on public.movies(user_id, status, position);

create unique index if not exists movies_user_tmdb_id_unique
  on public.movies(user_id, tmdb_id);

alter table public.movies enable row level security;

drop policy if exists "Users can view their own movies" on public.movies;
create policy "Users can view their own movies"
  on public.movies for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own movies" on public.movies;
create policy "Users can insert their own movies"
  on public.movies for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own movies" on public.movies;
create policy "Users can update their own movies"
  on public.movies for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own movies" on public.movies;
create policy "Users can delete their own movies"
  on public.movies for delete using (auth.uid() = user_id);
