-- ============================================================
-- PATHrimonio — Sincronización Realtime y soporte MCP para archivos/métodos
-- ============================================================

-- ── 1. Trazabilidad temporal en nodos y registros abstractos ──
alter table public.project_tree_nodes
  add column if not exists updated_at timestamptz not null default now();

alter table public.file_records
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_project_tree_nodes_touch on public.project_tree_nodes;
create trigger trg_project_tree_nodes_touch
  before update on public.project_tree_nodes
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_file_records_touch on public.file_records;
create trigger trg_file_records_touch
  before update on public.file_records
  for each row execute function public.touch_updated_at();

-- ── 2. Índices de búsqueda rápida para el servidor MCP ──
create index if not exists idx_project_tree_nodes_lookup
  on public.project_tree_nodes(project_id, root_name, path);

create index if not exists idx_file_records_node_lookup
  on public.file_records(node_id, record_type, name);

-- ── 3. Trigger de conteo robusto (INSERT / UPDATE node_id / DELETE) ──
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
  elsif tg_op = 'UPDATE' and new.node_id is distinct from old.node_id then
    update public.project_tree_nodes
       set record_count = greatest(record_count - 1, 0)
     where id = old.node_id;
    update public.project_tree_nodes
       set record_count = record_count + 1
     where id = new.node_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_file_records_count on public.file_records;
create trigger trg_file_records_count
  after insert or update of node_id or delete on public.file_records
  for each row execute function public.sync_project_tree_record_count();

-- ── 4. Upsert incremental de nodos sin borrar file_records existentes ──
create or replace function public.upsert_project_tree_nodes(
  target_project_id text,
  target_root_name text,
  nodes jsonb
)
returns setof public.project_tree_nodes
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
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
    coalesce(node->>'source', 'mcp-agent')
  from jsonb_array_elements(nodes) as node
  on conflict (project_id, root_name, path) do update set
    parent_path  = excluded.parent_path,
    name         = excluded.name,
    extension    = excluded.extension,
    is_directory = excluded.is_directory,
    size_bytes   = excluded.size_bytes,
    depth        = excluded.depth,
    source       = excluded.source,
    updated_at   = now()
  returning *;
end;
$$;

grant execute on function public.upsert_project_tree_nodes(text, text, jsonb) to authenticated;

-- ── 5. Supabase Realtime para reflejar cambios MCP al instante en la web ──
alter table public.project_tree_nodes replica identity full;
alter table public.file_records replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.project_tree_nodes;
exception when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.file_records;
exception when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.projects;
exception when duplicate_object then null;
end;
$$;
