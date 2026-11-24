-- ============================================================
-- PATHrimonio — Árbol de archivos del proyecto + registros abstractos
-- ============================================================

-- ── Árbol de carpetas y archivos importado desde una carpeta raíz ──
create table if not exists public.project_tree_nodes (
  id           uuid primary key default gen_random_uuid(),
  project_id   text not null references public.projects(id) on delete cascade,
  root_name    text not null,
  path         text not null,
  parent_path  text not null default '',
  name         text not null,
  extension    text,
  is_directory boolean not null default false,
  size_bytes   bigint,
  depth        integer not null default 0,
  record_count integer not null default 0,
  source       text not null default 'folder-scan',
  created_at   timestamptz not null default now(),
  unique (project_id, root_name, path)
);

create index if not exists idx_project_tree_nodes_project
  on public.project_tree_nodes(project_id);
create index if not exists idx_project_tree_nodes_parent
  on public.project_tree_nodes(project_id, parent_path);
create index if not exists idx_project_tree_nodes_root
  on public.project_tree_nodes(project_id, root_name);

-- ── Registros abstractos por archivo (métodos, variables, tablas, etc.) ──
create table if not exists public.file_records (
  id           uuid primary key default gen_random_uuid(),
  node_id      uuid not null references public.project_tree_nodes(id) on delete cascade,
  project_id   text not null references public.projects(id) on delete cascade,
  record_type  text not null,
  name         text not null,
  signature    text,
  description  text,
  line_number  integer,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists idx_file_records_node
  on public.file_records(node_id);
create index if not exists idx_file_records_project
  on public.file_records(project_id);

-- ── Mantener record_count sincronizado ──
create or replace function public.sync_project_tree_record_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.project_tree_nodes
       set record_count = record_count + 1
     where id = new.node_id;
  elsif tg_op = 'DELETE' then
    update public.project_tree_nodes
       set record_count = greatest(record_count - 1, 0)
     where id = old.node_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_file_records_count on public.file_records;
create trigger trg_file_records_count
  after insert or delete on public.file_records
  for each row execute function public.sync_project_tree_record_count();

-- ── Reemplazo atómico del árbol de una raíz ──
create or replace function public.replace_project_tree(
  target_project_id text,
  target_root_name text,
  nodes jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.project_tree_nodes
   where project_id = target_project_id
     and root_name = target_root_name;

  insert into public.project_tree_nodes (
    project_id, root_name, path, parent_path, name, extension,
    is_directory, size_bytes, depth, source
  )
  select
    target_project_id,
    target_root_name,
    node->>'path',
    coalesce(node->>'parentPath', ''),
    node->>'name',
    nullif(node->>'extension', ''),
    coalesce((node->>'isDirectory')::boolean, false),
    nullif(node->>'sizeBytes', '')::bigint,
    coalesce((node->>'depth')::integer, 0),
    coalesce(node->>'source', 'folder-scan')
  from jsonb_array_elements(nodes) as node;
end;
$$;

grant execute on function public.replace_project_tree(text, text, jsonb) to authenticated;

-- ── RLS ──
alter table public.project_tree_nodes enable row level security;
alter table public.file_records enable row level security;

drop policy if exists "read_all" on public.project_tree_nodes;
create policy "read_all" on public.project_tree_nodes
  for select to anon, authenticated using (true);

drop policy if exists "write_authenticated" on public.project_tree_nodes;
create policy "write_authenticated" on public.project_tree_nodes
  for all to authenticated using (true) with check (true);

drop policy if exists "read_all" on public.file_records;
create policy "read_all" on public.file_records
  for select to anon, authenticated using (true);

drop policy if exists "write_authenticated" on public.file_records;
create policy "write_authenticated" on public.file_records
  for all to authenticated using (true) with check (true);

grant select on public.project_tree_nodes, public.file_records to anon, authenticated;
grant insert, update, delete on public.project_tree_nodes, public.file_records to authenticated;
