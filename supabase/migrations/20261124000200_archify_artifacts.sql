-- Archify Interactive HTML Artifacts per Project
create table if not exists public.project_architecture_artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references public.projects(id) on delete cascade,
  slug text not null,
  title text not null,
  diagram_type text not null default 'architecture',
  html_content text not null,
  generator_version text,
  source_path text,
  size_bytes bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_architecture_artifacts_project_slug_unique unique (project_id, slug)
);

create index if not exists idx_project_architecture_artifacts_project
  on public.project_architecture_artifacts(project_id, updated_at desc);

drop trigger if exists trg_project_architecture_artifacts_updated_at on public.project_architecture_artifacts;
create trigger trg_project_architecture_artifacts_updated_at
  before update on public.project_architecture_artifacts
  for each row execute function public.touch_updated_at();

alter table public.project_architecture_artifacts enable row level security;

drop policy if exists "read_all" on public.project_architecture_artifacts;
create policy "read_all" on public.project_architecture_artifacts
  for select to anon, authenticated using (true);

drop policy if exists "write_authenticated" on public.project_architecture_artifacts;
create policy "write_authenticated" on public.project_architecture_artifacts
  for all to authenticated using (true) with check (true);

grant select on public.project_architecture_artifacts to anon, authenticated;
grant insert, update, delete on public.project_architecture_artifacts to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'project_architecture_artifacts'
  ) then
    alter publication supabase_realtime add table public.project_architecture_artifacts;
  end if;
end $$;
