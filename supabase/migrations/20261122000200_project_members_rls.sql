-- ============================================================
-- PATHrimonio — RLS de miembros por proyecto
-- Solo owners/editors del proyecto pueden gestionar miembros.
-- ============================================================

create or replace function public.current_portal_user_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.portal_users
  where lower(email) = lower(auth.jwt() ->> 'email')
  limit 1;
$$;

create or replace function public.can_manage_project_members(target_project_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = target_project_id
      and pm.user_id = public.current_portal_user_id()
      and pm.role in ('owner', 'editor')
  );
$$;

grant execute on function public.current_portal_user_id() to authenticated;
grant execute on function public.can_manage_project_members(text) to authenticated;

drop policy if exists "write_authenticated" on public.project_members;
drop policy if exists "manage_project_members" on public.project_members;

create policy "manage_project_members" on public.project_members
  for all to authenticated
  using (public.can_manage_project_members(project_id))
  with check (public.can_manage_project_members(project_id));
