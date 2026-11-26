-- ============================================================
-- FORMALIA Sessions: agregar user_id para vincular sesiones
-- a cuentas Supabase Auth (registro desde FORMALIA)
-- ============================================================

-- Columnas nuevas en formalia_sessions
alter table public.formalia_sessions
  add column if not exists user_id      uuid references auth.users(id) on delete set null,
  add column if not exists process_name text,
  add column if not exists versions     jsonb not null default '[]'::jsonb,
  add column if not exists generated_files jsonb not null default '[]'::jsonb;

-- Índice para acceso por user_id
create index if not exists idx_formalia_sessions_user
  on public.formalia_sessions(user_id)
  where user_id is not null;

-- Política: cada usuario autenticado solo ve sus propias sesiones vinculadas
-- (las anónimas sin user_id siguen siendo accesibles por session_id via la política pública)
drop policy if exists "formalia_sessions_owner_select" on public.formalia_sessions;
create policy "formalia_sessions_owner_select"
  on public.formalia_sessions
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or user_id is null  -- sesiones anónimas siguen visibles por session_id
  );

comment on column public.formalia_sessions.user_id       is 'UUID del usuario Supabase Auth. Null = sesión anónima (landing pública).';
comment on column public.formalia_sessions.process_name  is 'Nombre del proceso mapeado (del process_graph).';
comment on column public.formalia_sessions.versions      is 'Snapshots de versiones del diagrama generadas durante la sesión.';
comment on column public.formalia_sessions.generated_files is 'Archivos generados (PlantUML, PNG, PDF) durante la sesión.';
