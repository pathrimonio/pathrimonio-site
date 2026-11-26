-- ============================================================
-- Pathrimonio Admin — Telemetría Diaria de API y Límites por Clave
-- Registra consumo diario por clave conectada (sin exponer secretos),
-- tokens de entrada/salida, latencia, códigos HTTP y topes configurados.
-- ============================================================

create table if not exists public.api_usage_logs (
  id                text primary key,
  usage_date        date not null default ((now() at time zone 'America/Lima')::date),
  key_id            text not null, -- 'server_gemini' | 'server_openai' | 'server_deepseek' | 'portal_byok_...'
  key_label         text not null,
  key_fingerprint   text not null default '',
  provider          text not null, -- 'gemini' | 'openai' | 'deepseek'
  model             text not null,
  source_module     text not null default 'formalia', -- 'formalia' | 'archifly' | 'probe'
  scope             text not null default 'server',   -- 'server' | 'client_byok'
  http_status       integer not null default 200,
  success           boolean not null default true,
  prompt_tokens     integer not null default 0,
  output_tokens     integer not null default 0,
  total_tokens      integer not null default 0,
  latency_ms        integer not null default 0,
  rate_limit_info   jsonb not null default '{}'::jsonb,
  error_message     text,
  created_at        timestamptz not null default now()
);

create index if not exists idx_api_usage_logs_date_key
  on public.api_usage_logs(usage_date desc, key_id);

create index if not exists idx_api_usage_logs_created_at
  on public.api_usage_logs(created_at desc);

create table if not exists public.api_key_quotas (
  key_id              text primary key,
  provider            text not null,
  label               text not null,
  tier                text not null default 'free', -- 'free' | 'tier1' | 'custom'
  daily_request_limit integer not null default 1500,
  rpm_limit           integer not null default 15,
  daily_token_limit   integer not null default 250000,
  notes               text,
  updated_by          text,
  updated_at          timestamptz not null default now()
);

alter table public.api_usage_logs enable row level security;
alter table public.api_key_quotas enable row level security;

drop policy if exists "api_usage_logs_rw" on public.api_usage_logs;
create policy "api_usage_logs_rw"
  on public.api_usage_logs
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "api_key_quotas_rw" on public.api_key_quotas;
create policy "api_key_quotas_rw"
  on public.api_key_quotas
  for all
  to anon, authenticated
  using (true)
  with check (true);
