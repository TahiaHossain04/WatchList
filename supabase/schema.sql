-- =============================================================
-- Tahia's Watch List — database schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- Enums ------------------------------------------------
do $$ begin
  create type watch_status as enum ('watched', 'watching', 'abandoned', 'want_to_watch');
exception when duplicate_object then null; end $$;

do $$ begin
  create type media_type as enum ('show', 'movie', 'documentary', 'other');
exception when duplicate_object then null; end $$;

-- "collection" = origin group. Shown on the site as: korean → K-Drama, chinese → C-Drama,
-- english → North American, hindi → Indian. Real genres can be a separate table later.
do $$ begin
  create type media_collection as enum ('korean', 'chinese', 'anime', 'thai', 'english', 'hindi', 'other');
exception when duplicate_object then null; end $$;
-- If you created the database before Thai existed, this adds it:
alter type media_collection add value if not exists 'thai';

-- ---------- Entries ----------------------------------------------
create table if not exists public.entries (
  id               uuid primary key default gen_random_uuid(),

  -- Required
  title            text not null check (char_length(btrim(title)) between 1 and 200),
  status           watch_status not null,
  media_type       media_type not null,
  collection       media_collection not null,

  -- Details (all optional)
  director         text,
  actors           text[],
  date_watched     date,
  rating           numeric(3,1) check (rating between 0 and 10),
  comment          text,
  poster_url       text,
  synopsis         text,
  release_year     smallint check (release_year between 1870 and 2100),
  total_episodes   integer check (total_episodes > 0),

  -- Progress: "currently at" (watching) or "stopped at" (abandoned)
  last_watched_at  date,
  last_season      integer check (last_season >= 0),
  last_episode     integer check (last_episode >= 0),
  last_timestamp   text check (last_timestamp ~ '^\d{1,3}:[0-5]\d(:[0-5]\d)?$'),

  -- Tahia's mark: 'favorite' (heart, optionally ranked) or 'dislike' (cross, greyed out)
  reaction         text check (reaction in ('favorite', 'dislike')),
  favorite_rank    integer check (favorite_rank >= 1),

  -- External ids for future TMDB / Jikan / Wikipedia integration
  tmdb_id          bigint,
  jikan_id         bigint,
  wikipedia_title  text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Columns added after the first version (safe to run again on an existing database)
alter table public.entries add column if not exists reaction text check (reaction in ('favorite', 'dislike'));
alter table public.entries add column if not exists favorite_rank integer check (favorite_rank >= 1);

-- A favourite number is used once per collection + kind of title (dramas / movies / docs & more).
create unique index if not exists entries_favorite_rank_unique
  on public.entries (
    collection,
    (case media_type when 'show' then 'series' when 'movie' then 'movies' else 'more' end),
    favorite_rank
  )
  where favorite_rank is not null;

create index if not exists entries_status_idx on public.entries (status);
create index if not exists entries_collection_idx on public.entries (collection);
create index if not exists entries_created_at_idx on public.entries (created_at desc);

-- ---------- updated_at trigger -----------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists entries_set_updated_at on public.entries;
create trigger entries_set_updated_at
  before update on public.entries
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security -----------------------------------
-- Everyone may read. Nobody may write through the public (anon) key.
-- Writes go through the Express server, which uses the service-role key
-- and checks that the caller is the admin.
alter table public.entries enable row level security;

drop policy if exists "Entries are publicly readable" on public.entries;
create policy "Entries are publicly readable"
  on public.entries for select
  using (true);
