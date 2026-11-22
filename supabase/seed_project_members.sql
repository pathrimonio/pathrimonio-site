-- Miembros iniciales por proyecto (idempotente).
insert into public.project_members (project_id, user_id, role)
select m.project_id, u.id, m.role
from (values
  ('pathway',      'admin@pathrimonio.org',  'owner'),
  ('portal-admin', 'admin@pathrimonio.org',  'owner'),
  ('core-hub',     'admin@pathrimonio.org',  'owner'),
  ('smatad',       'admin@pathrimonio.org',  'owner'),
  ('pathway',      'sofia@pathrimonio.org',  'editor'),
  ('portal-admin', 'sofia@pathrimonio.org',  'editor'),
  ('core-hub',     'carlos@pathrimonio.org', 'editor'),
  ('smatad',       'carlos@pathrimonio.org', 'editor'),
  ('pathway',      'elena@pathrimonio.org',  'editor'),
  ('core-hub',     'elena@pathrimonio.org',  'viewer')
) as m(project_id, email, role)
join public.projects p on p.id = m.project_id
join public.portal_users u on lower(u.email) = lower(m.email)
on conflict (project_id, user_id) do nothing;
