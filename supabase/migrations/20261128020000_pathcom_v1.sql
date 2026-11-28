-- ============================================================
-- PATHRIMONIO — Agente Pathcom v1 (pathrimonio.site)
-- Tablas: path_logs, market_paths, path_validations,
--         site_projects, pathcom_action_queue, pathcom_chat_messages
-- Feature flags en platform_settings (clubs_enabled = false)
-- ============================================================

-- 1. Rutas estructuradas para Pathrimonio Market
create table if not exists public.market_paths (
  id                      text primary key,
  author_user_id          text not null,
  author_name             text,
  author_email            text,
  title                   text not null,
  category                text not null default 'Operación PYME',
  summary                 text not null,
  steps_json              jsonb not null default '[]'::jsonb,
  status                  text not null default 'DRAFT'
                          check (status in ('DRAFT', 'PEER_REVIEW', 'VALIDATED')),
  is_patrimonio_validated boolean not null default false,
  avg_rating              numeric(3,2) not null default 0,
  validations_count       integer not null default 0,
  total_duration_minutes  integer not null default 0,
  published_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists idx_market_paths_status
  on public.market_paths(status, published_at desc);
create index if not exists idx_market_paths_author
  on public.market_paths(author_user_id);

-- 2. Registros cronológicos de ruta con sello temporal exacto (UTC + timezone local)
create table if not exists public.path_logs (
  id                 text primary key,
  user_id            text not null,
  user_email         text,
  user_name          text,
  market_path_id     text references public.market_paths(id) on delete set null,
  title              text not null,
  content            text not null,
  recorded_at        timestamptz not null default now(),
  client_timezone    text not null default 'America/Lima',
  duration_minutes   integer check (duration_minutes is null or duration_minutes >= 0),
  progress_percent   integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  source             text not null default 'WEB' check (source in ('WEB', 'PATHWAY')),
  external_ref_id    text,
  verified_timestamp boolean not null default true,
  created_at         timestamptz not null default now()
);

create index if not exists idx_path_logs_user_recorded
  on public.path_logs(user_id, recorded_at desc);
create index if not exists idx_path_logs_market_path
  on public.path_logs(market_path_id, recorded_at asc);
create unique index if not exists idx_path_logs_pathway_dedup
  on public.path_logs(user_id, source, external_ref_id)
  where external_ref_id is not null;

-- 3. Calificaciones y reseñas por pares en Pathrimonio Market
create table if not exists public.path_validations (
  id                 text primary key,
  market_path_id     text not null references public.market_paths(id) on delete cascade,
  validator_user_id  text not null,
  validator_name     text,
  validator_role     text,
  score              integer not null check (score >= 1 and score <= 5),
  feedback           text not null default '',
  validator_weight   numeric(4,2) not null default 1.0,
  created_at         timestamptz not null default now(),
  unique (market_path_id, validator_user_id)
);

create index if not exists idx_path_validations_market
  on public.path_validations(market_path_id, created_at desc);

-- 4. Proyectos gestionados y publicados en pathrimonio.site (CMS con compuerta DRAFT -> APPROVED)
create table if not exists public.site_projects (
  id                 text primary key,
  name               text not null,
  client_partner_id  text,
  status             text not null default 'DISCOVERY'
                     check (status in ('DISCOVERY', 'IN_PROGRESS', 'LIVE')),
  public_summary     text not null default '',
  draft_name         text,
  draft_status       text check (draft_status is null or draft_status in ('DISCOVERY', 'IN_PROGRESS', 'LIVE')),
  draft_summary      text,
  cms_state          text not null default 'PUBLISHED'
                     check (cms_state in ('DRAFT', 'PUBLISHED')),
  is_published       boolean not null default false,
  updated_at         timestamptz not null default now()
);

create index if not exists idx_site_projects_published
  on public.site_projects(is_published, updated_at desc);

-- 5. Cola auditable Human-in-the-Loop para acciones críticas de Pathcom
create table if not exists public.pathcom_action_queue (
  id                    text primary key,
  requested_by_user_id  text not null,
  requested_by_email    text,
  requested_by_role     text not null,
  tool_name             text not null,
  action_summary        text not null,
  payload_json          jsonb not null default '{}'::jsonb,
  status                text not null default 'PENDING'
                        check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by           text,
  review_note           text,
  reviewed_at           timestamptz,
  created_at            timestamptz not null default now()
);

create index if not exists idx_pathcom_queue_status
  on public.pathcom_action_queue(status, created_at desc);

-- 6. Bitácora persistente de conversaciones con Pathcom por usuario
create table if not exists public.pathcom_chat_messages (
  id               text primary key,
  user_id          text not null,
  role_code        text not null,
  sender           text not null check (sender in ('user', 'assistant')),
  content          text not null,
  tool_executions  jsonb not null default '[]'::jsonb,
  rbac_denied      boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists idx_pathcom_chat_user
  on public.pathcom_chat_messages(user_id, created_at desc);

-- 7. RLS estricto
alter table public.market_paths          enable row level security;
alter table public.path_logs             enable row level security;
alter table public.path_validations      enable row level security;
alter table public.site_projects         enable row level security;
alter table public.pathcom_action_queue  enable row level security;
alter table public.pathcom_chat_messages enable row level security;

-- Lectura pública controlada para catálogo del Market, líneas de tiempo vinculadas y proyectos publicados
drop policy if exists "market_paths_public_read" on public.market_paths;
create policy "market_paths_public_read"
  on public.market_paths for select
  to anon, authenticated
  using (status in ('PEER_REVIEW', 'VALIDATED') or auth.uid()::text = author_user_id);

drop policy if exists "path_logs_public_timeline_read" on public.path_logs;
create policy "path_logs_public_timeline_read"
  on public.path_logs for select
  to anon, authenticated
  using (market_path_id is not null or auth.uid()::text = user_id);

drop policy if exists "path_validations_public_read" on public.path_validations;
create policy "path_validations_public_read"
  on public.path_validations for select
  to anon, authenticated
  using (true);

drop policy if exists "site_projects_public_published_read" on public.site_projects;
create policy "site_projects_public_published_read"
  on public.site_projects for select
  to anon, authenticated
  using (is_published = true);

-- Escrituras y gestión interna operadas desde API backend (service_role) o usuarios propietarios autenticados en path_logs
drop policy if exists "path_logs_auth_insert" on public.path_logs;
create policy "path_logs_auth_insert"
  on public.path_logs for insert
  to authenticated
  with check (auth.uid()::text = user_id);

drop policy if exists "pathcom_queue_auth_select" on public.pathcom_action_queue;
create policy "pathcom_queue_auth_select"
  on public.pathcom_action_queue for select
  to authenticated
  using (true);

drop policy if exists "pathcom_chat_owner_rw" on public.pathcom_chat_messages;
create policy "pathcom_chat_owner_rw"
  on public.pathcom_chat_messages for all
  to authenticated
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

-- 8. Seeds iniciales idempotentes (Feature Flags, Proyectos Públicos, Rutas de Muestra en Market)
insert into public.platform_settings (key, value, updated_by)
values (
  'pathcom_modules',
  '{
    "market_enabled": true,
    "pathway_bridge_enabled": true,
    "site_cms_enabled": true,
    "clubs_enabled": false,
    "clubs_reserved": ["pathrimonio_fit"]
  }'::jsonb,
  'system_seed'
)
on conflict (key) do nothing;

insert into public.site_projects (
  id, name, client_partner_id, status, public_summary, cms_state, is_published
) values
(
  'pathway',
  'Pathway — Metas y Progreso Comunitario',
  'partner_pathrimonio',
  'LIVE',
  'Aplicación móvil y web que ordena objetivos por pasos diarios e integra avances sincronizados hacia Pathrimonio.',
  'PUBLISHED',
  true
),
(
  'core-hub',
  'Core Hub PYME — Caja, Stock y Pedidos Offline-First',
  'partner_pyme_01',
  'LIVE',
  'Sistema operativo por roles para comercios y distribuidoras con base local SQLite y $0 de implementación para socios.',
  'PUBLISHED',
  true
),
(
  'formalia-studio',
  'Formalia Studio & Pathcom Ops',
  'partner_pathrimonio',
  'IN_PROGRESS',
  'Motor de mapeo de procesos por carriles conectado a historias SDD y registro cronológico verificable.',
  'PUBLISHED',
  true
)
on conflict (id) do nothing;

insert into public.market_paths (
  id, author_user_id, author_name, author_email, title, category, summary,
  steps_json, status, is_patrimonio_validated, avg_rating, validations_count,
  total_duration_minutes, published_at
) values
(
  'MP-2026-001',
  'USR-SOFIA-OPS',
  'Sofía Mendoza · Operaciones',
  'sofia@pathrimonio.org',
  'Implementación de Control de Caja y Cierre Diario sin Descuadres',
  'Finanzas & Caja PYME',
  'Guía paso a paso validada en tienda real para separar apertura, arqueo ciego por turno y reporte automático a Gerencia.',
  '[
    {"log_id":"LOG-2026-8801","title":"Inventario inicial de conceptos de ingreso y egreso","content":"Estandarización de motivos de caja chica, transferencias Yape/Plin y ventas al contado.","recorded_at":"2026-11-26T14:10:00Z","client_timezone":"America/Lima","duration_minutes":35,"progress_percent":35,"source":"WEB"},
    {"log_id":"LOG-2026-8802","title":"Configuración de rol Cajero con arqueo ciego","content":"El rol Cajero registra el efectivo contado antes de ver el saldo esperado, reduciendo errores manuales.","recorded_at":"2026-11-27T16:45:00Z","client_timezone":"America/Lima","duration_minutes":50,"progress_percent":75,"source":"WEB"},
    {"log_id":"LOG-2026-8803","title":"Validación en cierre real y sincronización de meta en Pathway","content":"Primer cierre completo de fin de semana sin diferencias ni hojas paralelas.","recorded_at":"2026-11-28T01:15:00Z","client_timezone":"America/Lima","duration_minutes":30,"progress_percent":100,"source":"PATHWAY"}
  ]'::jsonb,
  'VALIDATED',
  true,
  4.85,
  2,
  115,
  '2026-11-28T01:20:00Z'
),
(
  'MP-2026-002',
  'USR-CARLOS-LOG',
  'Carlos Quispe · Logística',
  'carlos@pathrimonio.org',
  'Ruta de Despacho en Almacén con Guías por WhatsApp y Conteo Rápido',
  'Almacén & Despacho',
  'Secuencia verificada en ruta de 3 sesiones para separar picking de despacho y confirmar entregas sin pérdida de stock.',
  '[
    {"log_id":"LOG-2026-8811","title":"Etiquetado de zonas rápidas de almacén","content":"Se agruparon los 40 SKUs de mayor rotación en pasillo A para reducir traslados.","recorded_at":"2026-11-27T15:05:00Z","client_timezone":"America/Lima","duration_minutes":40,"progress_percent":50,"source":"WEB"},
    {"log_id":"LOG-2026-8812","title":"Checklist de salida para repartidor","content":"Confirmación obligatoria de bultos antes de marcar el pedido En Ruta.","recorded_at":"2026-11-27T21:30:00Z","client_timezone":"America/Lima","duration_minutes":45,"progress_percent":90,"source":"WEB"}
  ]'::jsonb,
  'PEER_REVIEW',
  false,
  4.50,
  1,
  85,
  '2026-11-27T21:40:00Z'
)
on conflict (id) do nothing;

insert into public.path_logs (
  id, user_id, user_email, user_name, market_path_id, title, content,
  recorded_at, client_timezone, duration_minutes, progress_percent, source, verified_timestamp
) values
('LOG-2026-8801', 'USR-SOFIA-OPS', 'sofia@pathrimonio.org', 'Sofía Mendoza · Operaciones', 'MP-2026-001', 'Inventario inicial de conceptos de ingreso y egreso', 'Estandarización de motivos de caja chica, transferencias Yape/Plin y ventas al contado.', '2026-11-26T14:10:00Z', 'America/Lima', 35, 35, 'WEB', true),
('LOG-2026-8802', 'USR-SOFIA-OPS', 'sofia@pathrimonio.org', 'Sofía Mendoza · Operaciones', 'MP-2026-001', 'Configuración de rol Cajero con arqueo ciego', 'El rol Cajero registra el efectivo contado antes de ver el saldo esperado, reduciendo errores manuales.', '2026-11-27T16:45:00Z', 'America/Lima', 50, 75, 'WEB', true),
('LOG-2026-8803', 'USR-SOFIA-OPS', 'sofia@pathrimonio.org', 'Sofía Mendoza · Operaciones', 'MP-2026-001', 'Validación en cierre real y sincronización de meta en Pathway', 'Primer cierre completo de fin de semana sin diferencias ni hojas paralelas.', '2026-11-28T01:15:00Z', 'America/Lima', 30, 100, 'PATHWAY', true),
('LOG-2026-8811', 'USR-CARLOS-LOG', 'carlos@pathrimonio.org', 'Carlos Quispe · Logística', 'MP-2026-002', 'Etiquetado de zonas rápidas de almacén', 'Se agruparon los 40 SKUs de mayor rotación en pasillo A para reducir traslados.', '2026-11-27T15:05:00Z', 'America/Lima', 40, 50, 'WEB', true),
('LOG-2026-8812', 'USR-CARLOS-LOG', 'carlos@pathrimonio.org', 'Carlos Quispe · Logística', 'MP-2026-002', 'Checklist de salida para repartidor', 'Confirmación obligatoria de bultos antes de marcar el pedido En Ruta.', '2026-11-27T21:30:00Z', 'America/Lima', 45, 90, 'WEB', true)
on conflict (id) do nothing;

insert into public.path_validations (
  id, market_path_id, validator_user_id, validator_name, validator_role, score, feedback, validator_weight
) values
('VAL-2026-01', 'MP-2026-001', 'USR-CARLOS-LOG', 'Carlos Quispe', 'collaborator', 5, 'Orden muy claro; el arqueo ciego evitó diferencias en el primer turno.', 1.5),
('VAL-2026-02', 'MP-2026-001', 'USR-SOCIO-DEMO', 'Bodega San Martín (Socio)', 'partner', 5, 'Lo aplicamos con dos cajeros por turno y redujimos el cierre a 10 minutos.', 1.5),
('VAL-2026-03', 'MP-2026-002', 'USR-SOFIA-OPS', 'Sofía Mendoza', 'collaborator', 5, 'Buena separación de zonas A; falta detallar protocolo de devoluciones.', 1.5)
on conflict (id) do nothing;
