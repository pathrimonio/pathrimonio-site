-- ============================================================
-- PATHRIMONIO — Arquitectura RBAC de 5 Roles & Plataforma Completa
-- Roles: guest | user | partner | collaborator | admin
-- Tablas: portal_users (ext), formalia_workspaces, formalia_daily_usage,
--         implementation_requests, referral_records, credit_redemptions,
--         platform_settings, system_audit_logs
-- ============================================================

-- 1. Extender portal_users para métricas de Socio/Referidos y estado
alter table public.portal_users
  add column if not exists organization        text,
  add column if not exists status              text not null default 'active',
  add column if not exists referral_code       text,
  add column if not exists referred_by_code    text,
  add column if not exists credit_balance_usd  numeric(10,2) not null default 0,
  add column if not exists bonus_role_months   integer not null default 0,
  add column if not exists partner_since       timestamptz,
  add column if not exists source              text default 'portal';

create unique index if not exists idx_portal_users_referral_code
  on public.portal_users(referral_code)
  where referral_code is not null;

-- 2. Extender projects para propiedad por usuario/cliente
alter table public.projects
  add column if not exists owner_email text,
  add column if not exists owner_user_id text,
  add column if not exists source_type text not null default 'internal';

-- 3. Workspaces y Lienzos permanentes de FORMALIA
create table if not exists public.formalia_workspaces (
  id           text primary key,
  user_id      text,
  user_email   text not null,
  name         text not null,
  industry     text,
  project_id   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_formalia_workspaces_email
  on public.formalia_workspaces(lower(user_email));

alter table public.formalia_sessions
  add column if not exists workspace_id text,
  add column if not exists canvas_title text;

-- 4. Cuotas diarias de IA (reinicio 00:00 UTC)
create table if not exists public.formalia_daily_usage (
  id              text primary key, -- "${subject_key}_${usage_date_utc}"
  usage_date_utc  date not null default (now() at time zone 'utc')::date,
  subject_key     text not null,
  user_email      text,
  role_code       text not null default 'user',
  turns_used      integer not null default 0,
  daily_limit     integer not null default 15,
  updated_at      timestamptz not null default now()
);

create index if not exists idx_formalia_daily_usage_date
  on public.formalia_daily_usage(usage_date_utc, subject_key);

-- 5. Solicitudes de Implementación ("Implementar en solución web") + Diff & Revisión Técnica
create table if not exists public.implementation_requests (
  id                     text primary key,
  user_id                text,
  user_email             text not null,
  user_name              text,
  project_id             text not null,
  session_id             text,
  workspace_id           text,
  quote_id               text,
  title                  text not null,
  company_name           text,
  status                 text not null default 'enviada',
  web_blueprint          jsonb not null default '{}'::jsonb,
  submitted_snapshot     jsonb not null default '{}'::jsonb,
  pending_modifications  jsonb not null default '[]'::jsonb,
  status_history         jsonb not null default '[]'::jsonb,
  tech_notes             text,
  assigned_collaborator  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists idx_impl_requests_email
  on public.implementation_requests(lower(user_email));
create index if not exists idx_impl_requests_project
  on public.implementation_requests(project_id);

-- 6. Referidos y Billetera de Créditos de Socio
create table if not exists public.referral_records (
  id                   text primary key,
  referrer_email       text not null,
  referrer_name        text,
  referral_code        text not null,
  referred_company     text not null,
  referred_email       text,
  payment_amount_usd   numeric(10,2) not null default 30,
  credits_awarded_usd  numeric(10,2) not null default 30,
  role_months_awarded  integer not null default 1,
  status               text not null default 'pendiente_pago',
  approved_by          text,
  approved_at          timestamptz,
  notes                text,
  created_at           timestamptz not null default now()
);

create index if not exists idx_referrals_referrer
  on public.referral_records(lower(referrer_email));

create table if not exists public.credit_redemptions (
  id                    text primary key,
  partner_email         text not null,
  credits_used_usd      numeric(10,2) not null,
  role_months_extended  integer not null default 1,
  target_project_id     text,
  note                  text,
  created_at            timestamptz not null default now()
);

-- 7. Configuración Global (pricing-config, community_impact, partner_workshops)
create table if not exists public.platform_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_by  text,
  updated_at  timestamptz not null default now()
);

-- 8. Bitácora de Auditoría del Sistema
create table if not exists public.system_audit_logs (
  id           text primary key,
  actor_email  text,
  actor_role   text,
  action_type  text not null,
  target_id    text,
  summary      text not null,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists idx_system_audit_created
  on public.system_audit_logs(created_at desc);

-- 9. Extender quotes para dueño y estado en bandeja de preventa
alter table public.quotes
  add column if not exists user_email   text,
  add column if not exists user_id      text,
  add column if not exists assigned_to  text,
  add column if not exists tech_notes   text;

-- 10. RLS & Grants
alter table public.formalia_workspaces     enable row level security;
alter table public.formalia_daily_usage    enable row level security;
alter table public.implementation_requests enable row level security;
alter table public.referral_records        enable row level security;
alter table public.credit_redemptions      enable row level security;
alter table public.platform_settings       enable row level security;
alter table public.system_audit_logs       enable row level security;

-- platform_settings lectura pública para landing (pricing y métricas de impacto); escritura autenticada
drop policy if exists "platform_settings_read" on public.platform_settings;
create policy "platform_settings_read" on public.platform_settings for select to anon, authenticated using (true);
drop policy if exists "platform_settings_write" on public.platform_settings;
create policy "platform_settings_write" on public.platform_settings for all to authenticated using (true) with check (true);

-- formalia_daily_usage lectura/escritura abierta para controlar cuotas IP/usuario desde API/cliente
drop policy if exists "formalia_daily_usage_rw" on public.formalia_daily_usage;
create policy "formalia_daily_usage_rw" on public.formalia_daily_usage for all to anon, authenticated using (true) with check (true);

-- Workspaces, Solicitudes, Referidos, Canjes y Auditoría: acceso completo a autenticados y lectura/inserción segura
do $$
declare
  t text;
begin
  foreach t in array array[
    'formalia_workspaces',
    'implementation_requests',
    'referral_records',
    'credit_redemptions',
    'system_audit_logs'
  ]
  loop
    execute format('drop policy if exists "auth_rw_%I" on public.%I', t, t);
    execute format('create policy "auth_rw_%I" on public.%I for all to anon, authenticated using (true) with check (true)', t, t);
  end loop;
end;
$$;

-- Permitir también escritura de proyectos/actores/historias/interfaces a nuevos registros desde flujo web
grant select, insert, update, delete on all tables in schema public to anon, authenticated;

-- Seed inicial de pricing_config y community_impact si no existen
insert into public.platform_settings (key, value, updated_by)
values (
  'pricing_config',
  '{
    "admin_role_monthly_usd": 30,
    "setup_fee_no_permanence_usd": 350,
    "permanence_months": 6,
    "referral_credit_rule": {
      "referrals_required": 2,
      "bonus_role_months": 2,
      "usd_per_credit_month": 30
    },
    "customer_tiers": {
      "hasta_100_base": 0,
      "hasta_300": 15,
      "hasta_500": 30,
      "hasta_1000": 60,
      "hasta_2000": 120,
      "mas_2000_enterprise": 180
    },
    "interface_prices": {
      "web_operativa": 0,
      "portal_clientes": 35,
      "app_movil": 45,
      "bot_whatsapp": 30,
      "dashboard_bi": 25
    },
    "api_prices": {
      "historial_ilimitado": 15,
      "validacion_ruc_dni": 20,
      "pasarela_pagos": 25,
      "almacenamiento_cloud": 15,
      "integracion_hardware_erp": 0
    }
  }'::jsonb,
  'system_seed'
)
on conflict (key) do nothing;

insert into public.platform_settings (key, value, updated_by)
values (
  'community_impact',
  '{
    "education": {
      "pilar": "Pilar I · Formación",
      "title": "Educación y Alfabetización Técnica",
      "description": "Talleres prácticos de capacitación para operarios de almacén, cajeros y jóvenes de barrios locales en el uso de herramientas digitales sin barreras.",
      "metric": "+120 hrs",
      "label": "talleres comunitarios"
    },
    "sports": {
      "pilar": "Pilar II · Cohesión",
      "title": "Deporte e Integración Vecinal",
      "description": "Fomento y auspicio solidario a ligas de fútbol, campeonatos escolares y actividades al aire libre organizadas por juntas vecinales aliadas.",
      "metric": "8 ligas",
      "label": "equipos respaldados"
    },
    "values": {
      "pilar": "Pilar III · Ética",
      "title": "Valores y Transparencia Radical",
      "description": "Prohibición estricta de comisiones por transacción sobre las ventas de nuestros socios. Código abierto, trazabilidad y datos bajo tu posesión.",
      "metric": "0% fees",
      "label": "cero intermediación"
    },
    "pathway": {
      "badge": "BENEFICIO VINCULADO · APP MVP",
      "title": "Pathway: El mapa vivo de desarrollo comunitario",
      "description": "Como socio o usuario del software Pathrimonio, tu proyecto puede vincularse a la aplicación móvil Pathway para publicar metas colectivas de financiamiento y rendición de cuentas en tiempo real."
    }
  }'::jsonb,
  'system_seed'
)
on conflict (key) do nothing;
