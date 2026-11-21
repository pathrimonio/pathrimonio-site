-- ============================================================
-- PATHrimonio — Esquema relacional completo
-- Módulos: proyectos, usuarios, actores, historias, criterios,
-- interfaces, roles, datos usados por interfaz, modelado de datos,
-- atributos y archivos.
-- ============================================================

-- gen_random_uuid() es nativo en PostgreSQL 13+ (Supabase usa 15+).

-- ── 1. Proyectos ─────────────────────────────────────────────
create table if not exists public.projects (
  id            text primary key,
  name          text not null,
  short_name    text,
  subtitle      text,
  description   text,
  category      text,
  icon          text,
  color         text,
  status        text,
  client        text,
  version       text,
  modules       text[] not null default '{}'::text[],
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.projects is 'Proyectos/software del portal (Pathway, Core Hub, Portal Admin).';

-- ── 2. Usuarios del portal ───────────────────────────────────
-- Perfiles. Las contraseñas deben vivir en Supabase Auth, no acá.
create table if not exists public.portal_users (
  id            text primary key,
  email         text not null unique,
  name          text not null,
  role          text,
  avatar        text,
  color         text,
  permissions   text[] not null default '{}'::text[],
  created_at    timestamptz not null default now()
);

comment on table public.portal_users is 'Perfiles de usuario del portal. Credenciales en Supabase Auth.';

-- ── 3. Actores de negocio ────────────────────────────────────
create table if not exists public.actors (
  id                   text primary key,
  project_id           text not null references public.projects(id) on delete cascade,
  name                 text not null,
  category             text,
  avatar_icon          text,
  color                text,
  description          text,
  permission_level     text,
  system_areas         text[] not null default '{}'::text[],
  assigned_worker      text,
  assigned_worker_name text,
  status               text,
  is_primary_role      boolean not null default false,
  created_at           date,
  created_at_label     text,
  updated_at           timestamptz not null default now()
);

create index if not exists idx_actors_project on public.actors(project_id);

-- ── 4. Historias de usuario ──────────────────────────────────
create table if not exists public.stories (
  id                 text primary key,
  project_id         text not null references public.projects(id) on delete cascade,
  module             text,
  priority           text,
  status             text,
  role               text,
  action             text,
  benefit            text,
  attachments_count  integer not null default 0,
  attachment_name    text,
  author             text,
  created_at_label   text,
  image              text,
  image_meta         text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_stories_project on public.stories(project_id);
create index if not exists idx_stories_status on public.stories(status);

create table if not exists public.story_criteria (
  story_id   text not null references public.stories(id) on delete cascade,
  id         text not null,
  text       text not null,
  checked    boolean not null default false,
  position   integer not null default 0,
  primary key (story_id, id)
);

create index if not exists idx_story_criteria_story on public.story_criteria(story_id);

-- ── 5. Catálogo global de módulos de interfaces ──────────────
create table if not exists public.interface_modules (
  name        text primary key,
  created_at  timestamptz not null default now()
);

comment on table public.interface_modules is 'Catálogo global editable de módulos usados por las interfaces.';

-- ── 6. Interfaces / especificaciones de pantalla ─────────────
create table if not exists public.interfaces (
  id                text primary key,
  project_id        text not null references public.projects(id) on delete cascade,
  number            text,
  title             text not null,
  full_name         text,
  module            text,
  status            text,
  platform          text,
  image             text,
  image_placeholder text,
  objective         text,
  content           text,
  rules             text,
  details           text,
  linked_story_id   text references public.stories(id) on delete set null,
  author            text,
  reviewed_by       text,
  approved_at       date,
  version           text,
  image_aspect      numeric(10,6),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_interfaces_project on public.interfaces(project_id);
create index if not exists idx_interfaces_module on public.interfaces(module);
create index if not exists idx_interfaces_story on public.interfaces(linked_story_id);

create table if not exists public.interface_roles (
  interface_id  text not null references public.interfaces(id) on delete cascade,
  role_name     text not null,
  actor_id      text references public.actors(id) on delete set null,
  position      integer not null default 0,
  primary key (interface_id, role_name)
);

create index if not exists idx_interface_roles_interface on public.interface_roles(interface_id);

-- ── 7. Modelado de datos ─────────────────────────────────────
create table if not exists public.data_models (
  id                   text primary key,
  project_id           text not null references public.projects(id) on delete cascade,
  table_name           text not null,
  name                 text not null,
  module               text,
  storage_target       text,
  storage_location     text,
  sync_strategy        text,
  status               text,
  description          text,
  linked_story_id      text references public.stories(id) on delete set null,
  linked_interface_id  text references public.interfaces(id) on delete set null,
  author               text,
  approved_at          date,
  version              text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (project_id, table_name)
);

create index if not exists idx_data_models_project on public.data_models(project_id);
create index if not exists idx_data_models_story on public.data_models(linked_story_id);
create index if not exists idx_data_models_interface on public.data_models(linked_interface_id);

create table if not exists public.data_model_attributes (
  data_model_id  text not null references public.data_models(id) on delete cascade,
  id             text not null,
  name           text not null,
  data_type      text not null,
  is_primary     boolean not null default false,
  is_nullable    boolean not null default true,
  is_unique      boolean not null default false,
  foreign_key    text,
  default_value  text,
  description    text,
  position       integer not null default 0,
  primary key (data_model_id, id)
);

create index if not exists idx_data_model_attributes_model on public.data_model_attributes(data_model_id);

-- ── 8. Datos usados por cada interfaz ────────────────────────
-- Snapshot denormalizado: campo + tabla + esquema + tipo.
create table if not exists public.interface_data_usage (
  id              uuid primary key default gen_random_uuid(),
  interface_id    text not null references public.interfaces(id) on delete cascade,
  data_model_id   text references public.data_models(id) on delete set null,
  attribute_id    text,
  schema_name     text not null,
  table_name      text not null,
  table_label     text,
  attribute_name  text not null,
  data_type       text,
  is_primary      boolean not null default false,
  foreign_key     text,
  position        integer not null default 0,
  created_at      timestamptz not null default now(),
  unique (interface_id, schema_name, table_name, attribute_name)
);

create index if not exists idx_interface_data_usage_interface on public.interface_data_usage(interface_id);
create index if not exists idx_interface_data_usage_model on public.interface_data_usage(data_model_id);

-- ── 9. Archivos / entregables ────────────────────────────────
create table if not exists public.files (
  id               text primary key,
  project_id       text not null references public.projects(id) on delete cascade,
  name             text not null,
  category         text,
  format           text,
  size_bytes       bigint,
  size_formatted   text,
  version          text,
  status           text,
  uploaded_by      text,
  uploaded_at      date,
  description      text,
  tags             text[] not null default '{}'::text[],
  linked_entity    text,
  download_url     text,
  content_preview  text,
  created_at       timestamptz not null default now()
);

create index if not exists idx_files_project on public.files(project_id);
create index if not exists idx_files_category on public.files(category);

-- ── 10. Trigger updated_at ───────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_touch on public.projects;
create trigger trg_projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_stories_touch on public.stories;
create trigger trg_stories_touch before update on public.stories
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_interfaces_touch on public.interfaces;
create trigger trg_interfaces_touch before update on public.interfaces
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_data_models_touch on public.data_models;
create trigger trg_data_models_touch before update on public.data_models
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_actors_touch on public.actors;
create trigger trg_actors_touch before update on public.actors
  for each row execute function public.touch_updated_at();

-- ── 11. RLS ──────────────────────────────────────────────────
-- Lectura pública para el portal; escritura solo para usuarios autenticados.
-- Cuando se conecte Supabase Auth, las policies se pueden refinar por proyecto.
alter table public.projects               enable row level security;
alter table public.portal_users           enable row level security;
alter table public.actors                 enable row level security;
alter table public.stories                enable row level security;
alter table public.story_criteria         enable row level security;
alter table public.interface_modules      enable row level security;
alter table public.interfaces             enable row level security;
alter table public.interface_roles        enable row level security;
alter table public.data_models            enable row level security;
alter table public.data_model_attributes  enable row level security;
alter table public.interface_data_usage   enable row level security;
alter table public.files                  enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'projects','portal_users','actors','stories','story_criteria','interface_modules',
    'interfaces','interface_roles','data_models','data_model_attributes',
    'interface_data_usage','files'
  ]
  loop
    execute format('drop policy if exists "read_all" on public.%I', t);
    execute format('create policy "read_all" on public.%I for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "write_authenticated" on public.%I', t);
    execute format('create policy "write_authenticated" on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
