-- ============================================================
-- FORMALIA — Recopilación de Chat, Archivos y Versiones
-- Almacena historial completo de conversación, archivos generados
-- (.puml, .json, .png, .pdf, chat .md/.json) y versiones v1..vN.
-- ============================================================

alter table public.formalia_sessions
  add column if not exists versions jsonb not null default '[]'::jsonb,
  add column if not exists generated_files jsonb not null default '[]'::jsonb;

create table if not exists public.formalia_artifact_versions (
  id               text primary key,
  session_id       text not null references public.formalia_sessions(session_id) on delete cascade,
  version_number   integer not null default 1,
  version_label    text not null default 'v1',
  artifact_kind    text not null, -- 'snapshot' | 'puml' | 'json' | 'png' | 'pdf' | 'chat_transcript' | 'handoff_stories'
  file_name        text not null,
  mime_type        text not null default 'text/plain',
  content_text     text,
  data_url         text,
  size_bytes       integer not null default 0,
  change_summary   text,
  chat_turns_at    integer not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists idx_formalia_artifacts_session on public.formalia_artifact_versions(session_id, version_number desc);
create index if not exists idx_formalia_artifacts_kind on public.formalia_artifact_versions(artifact_kind);

comment on table public.formalia_artifact_versions is 'Versiones y archivos generados en FORMALIA (chats recopilados, .puml, .json, PNG, PDF y handoffs).';

alter table public.formalia_artifact_versions enable row level security;

drop policy if exists "formalia_artifacts_public_rw" on public.formalia_artifact_versions;
create policy "formalia_artifacts_public_rw"
  on public.formalia_artifact_versions
  for all
  to anon, authenticated
  using (true)
  with check (true);
