-- ============================================================
-- PATHrimonio — Miembros reales por proyecto
-- Vincula usuarios del portal (portal_users) con proyectos.
-- El acceso real se valida contra Supabase Auth por email.
-- ============================================================

create table if not exists public.project_members (
  id          uuid primary key default gen_random_uuid(),
  project_id  text not null references public.projects(id) on delete cascade,
  user_id     text not null references public.portal_users(id) on delete cascade,
  role        text not null default 'viewer' check (role in ('owner', 'editor', 'viewer')),
  invited_by  text references public.portal_users(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (project_id, user_id)
);

create index if not exists idx_project_members_project on public.project_members(project_id);
create index if not exists idx_project_members_user on public.project_members(user_id);

comment on table public.project_members is 'Usuarios del portal con acceso real a un proyecto.';

alter table public.project_members enable row level security;

drop policy if exists "read_all" on public.project_members;
create policy "read_all" on public.project_members
  for select to anon, authenticated using (true);

drop policy if exists "write_authenticated" on public.project_members;
create policy "write_authenticated" on public.project_members
  for all to authenticated using (true) with check (true);
