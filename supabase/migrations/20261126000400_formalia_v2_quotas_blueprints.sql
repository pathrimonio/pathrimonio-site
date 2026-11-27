-- Migración FormalIA v2: Cuotas de IA, Workspaces, Canvases y Web Blueprints

CREATE TABLE IF NOT EXISTS public.workspaces (
  id text PRIMARY KEY,
  owner_user_id text,
  owner_email text,
  name text NOT NULL,
  industry text DEFAULT 'otro_sector',
  project_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner_user ON public.workspaces (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_email ON public.workspaces (owner_email);

CREATE TABLE IF NOT EXISTS public.canvases (
  id text PRIMARY KEY,
  workspace_id text NOT NULL,
  session_id text UNIQUE,
  title text NOT NULL DEFAULT 'Lienzo principal',
  process_graph_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_canvases_workspace_id ON public.canvases (workspace_id);

CREATE TABLE IF NOT EXISTS public.ai_usage_ledger (
  id text PRIMARY KEY,
  user_id text,
  user_email text,
  ip_hash text NOT NULL,
  session_id text,
  workspace_id text,
  action_type text NOT NULL CHECK (action_type IN ('PROCESS_CHAT', 'STORY_GEN', 'UI_LAYOUT')),
  usage_date_utc text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON public.ai_usage_ledger (user_id, usage_date_utc);
CREATE INDEX IF NOT EXISTS idx_ai_usage_email_date ON public.ai_usage_ledger (user_email, usage_date_utc);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ip_date ON public.ai_usage_ledger (ip_hash, usage_date_utc);

CREATE TABLE IF NOT EXISTS public.web_blueprints (
  id text PRIMARY KEY,
  workspace_id text NOT NULL UNIQUE,
  source_canvas_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_stories_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  theme_config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ui_screens_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_web_blueprints_workspace ON public.web_blueprints (workspace_id);

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS web_blueprint_id text;

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_blueprints ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workspaces' AND policyname = 'workspaces_public_rw') THEN
    CREATE POLICY workspaces_public_rw ON public.workspaces FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'canvases' AND policyname = 'canvases_public_rw') THEN
    CREATE POLICY canvases_public_rw ON public.canvases FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_usage_ledger' AND policyname = 'ai_usage_ledger_rw') THEN
    CREATE POLICY ai_usage_ledger_rw ON public.ai_usage_ledger FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'web_blueprints' AND policyname = 'web_blueprints_rw') THEN
    CREATE POLICY web_blueprints_rw ON public.web_blueprints FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
