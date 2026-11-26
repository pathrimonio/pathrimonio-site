-- ============================================================
-- FORMALIA Sessions: vincular sesiones a cuentas Supabase Auth
-- Permite guardar conversaciones desde FORMALIA y retomarlas
-- posteriormente al acceder al Portal Operativo.
-- ============================================================

alter table public.formalia_sessions
  add column if not exists user_id          uuid references auth.users(id) on delete set null,
  add column if not exists user_email       text,
  add column if not exists user_name        text,
  add column if not exists process_name     text,
  add column if not exists saved_to_account boolean not null default false,
  add column if not exists versions         jsonb not null default '[]'::jsonb,
  add column if not exists generated_files  jsonb not null default '[]'::jsonb;

create index if not exists idx_formalia_sessions_user
  on public.formalia_sessions(user_id)
  where user_id is not null;

create index if not exists idx_formalia_sessions_user_email
  on public.formalia_sessions(lower(user_email))
  where user_email is not null;

drop policy if exists "formalia_sessions_owner_select" on public.formalia_sessions;
create policy "formalia_sessions_owner_select"
  on public.formalia_sessions
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or lower(coalesce(user_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or user_id is null
  );

comment on column public.formalia_sessions.user_id          is 'UUID del usuario Supabase Auth. Null = sesión anónima (landing pública).';
comment on column public.formalia_sessions.user_email       is 'Correo de la cuenta que guardó la conversación en FORMALIA.';
comment on column public.formalia_sessions.user_name        is 'Nombre visible de la cuenta que guardó la conversación.';
comment on column public.formalia_sessions.process_name     is 'Nombre del proceso mapeado (del process_graph).';
comment on column public.formalia_sessions.saved_to_account is 'True cuando el usuario guardó explícitamente el chat creando o vinculando cuenta.';
comment on column public.formalia_sessions.versions         is 'Snapshots de versiones del diagrama generadas durante la sesión.';
comment on column public.formalia_sessions.generated_files  is 'Archivos generados (PlantUML, PNG, PDF) durante la sesión.';
