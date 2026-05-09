create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  is_done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tasks'
      and policyname = 'Users can view their own tasks'
  ) then
    create policy "Users can view their own tasks"
    on public.tasks
    for select
    to authenticated
    using (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tasks'
      and policyname = 'Users can create their own tasks'
  ) then
    create policy "Users can create their own tasks"
    on public.tasks
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tasks'
      and policyname = 'Users can update their own tasks'
  ) then
    create policy "Users can update their own tasks"
    on public.tasks
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tasks'
      and policyname = 'Users can delete their own tasks'
  ) then
    create policy "Users can delete their own tasks"
    on public.tasks
    for delete
    to authenticated
    using (auth.uid() = user_id);
  end if;
end
$$;

create index if not exists tasks_user_id_idx
on public.tasks(user_id);

create index if not exists tasks_created_at_idx
on public.tasks(created_at desc);

