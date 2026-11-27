-- Migración: Espacios de Trabajo (Proyecto/Negocio) y Múltiples Lienzos por Usuario en FormalIA
ALTER TABLE public.formalia_sessions
  ADD COLUMN IF NOT EXISTS workspace_id text,
  ADD COLUMN IF NOT EXISTS workspace_name text,
  ADD COLUMN IF NOT EXISTS project_id text,
  ADD COLUMN IF NOT EXISTS canvas_title text;

CREATE INDEX IF NOT EXISTS idx_formalia_sessions_workspace_id
  ON public.formalia_sessions (workspace_id);

CREATE INDEX IF NOT EXISTS idx_formalia_sessions_user_workspace
  ON public.formalia_sessions (user_id, workspace_id);

CREATE INDEX IF NOT EXISTS idx_formalia_sessions_project_id
  ON public.formalia_sessions (project_id);
