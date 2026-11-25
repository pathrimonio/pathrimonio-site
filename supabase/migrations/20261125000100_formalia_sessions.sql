-- ============================================================
-- FormalIA — Sesiones conversacionales y Handoff Preventa -> Dev
-- SDD Secciones 6.2 y 7.2 (expiración automática a 7 días, máx 15 turnos)
-- ============================================================

create table if not exists public.formalia_sessions (
  session_id         text primary key,
  process_graph      jsonb not null default '{}'::jsonb,
  messages           jsonb not null default '[]'::jsonb,
  turns_count        integer not null default 0 check (turns_count <= 15),
  completeness_score integer not null default 0 check (completeness_score >= 0 and completeness_score <= 100),
  client_ip_hash     text,
  linked_quote_id    text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  expires_at         timestamptz not null default (now() + interval '7 days')
);

create index if not exists idx_formalia_sessions_expires on public.formalia_sessions(expires_at);
create index if not exists idx_formalia_sessions_quote on public.formalia_sessions(linked_quote_id);

comment on table public.formalia_sessions is 'Sesiones anónimas de FormalIA. Sesiones sin cotización vinculada expiran a los 7 días.';

create table if not exists public.quotes (
  quote_id              text primary key,
  formalia_session_id   text references public.formalia_sessions(session_id) on delete set null,
  business_discovery    jsonb not null default '{}'::jsonb,
  configuration         jsonb not null default '{}'::jsonb,
  pricing_summary       jsonb not null default '{}'::jsonb,
  lead_contact          jsonb not null default '{}'::jsonb,
  engineering_handoff   jsonb,
  status                text not null default 'nuevo_lead',
  created_at            timestamptz not null default now()
);

create index if not exists idx_quotes_formalia_session on public.quotes(formalia_session_id);

-- Políticas RLS abiertas para inserción/consulta por session_id en landing pública
alter table public.formalia_sessions enable row level security;
alter table public.quotes enable row level security;

drop policy if exists "formalia_sessions_public_rw" on public.formalia_sessions;
create policy "formalia_sessions_public_rw"
  on public.formalia_sessions
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "quotes_public_insert" on public.quotes;
create policy "quotes_public_insert"
  on public.quotes
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "quotes_public_select" on public.quotes;
create policy "quotes_public_select"
  on public.quotes
  for select
  to authenticated
  using (true);
