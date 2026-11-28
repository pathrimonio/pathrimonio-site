-- ============================================================
-- Cumplimiento Legal & Consentimiento de Privacidad (SDD Pilar 1)
-- ============================================================

alter table public.quotes
  add column if not exists privacy_policy_accepted boolean not null default false,
  add column if not exists privacy_policy_version text not null default '2026-11',
  add column if not exists accepted_at timestamptz;

comment on column public.quotes.privacy_policy_accepted is 'Confirmación explícita (opt-in) de aceptación de la Política de Privacidad en Paso 4 del Cotizador.';
comment on column public.quotes.privacy_policy_version is 'Versión vigente de la Política de Privacidad aceptada por el usuario (ej. 2026-11).';
comment on column public.quotes.accepted_at is 'Fecha y hora exacta en UTC cuando el titular aceptó la Política de Privacidad.';

drop policy if exists "quotes_public_insert" on public.quotes;
create policy "quotes_public_insert"
  on public.quotes
  for insert
  to anon, authenticated
  with check (privacy_policy_accepted = true);

-- Libro de Reclamaciones Virtual (Indecopi - Perú, Ley N.º 29571)
create table if not exists public.complaints (
  complaint_code          text primary key,
  record_type             text not null check (record_type in ('Reclamo', 'Queja')),
  consumer_name           text not null,
  document_type           text not null default 'DNI',
  document_number         text not null,
  address                 text not null default '',
  phone                   text not null default '',
  email                   text not null,
  is_minor                boolean not null default false,
  guardian_name           text,
  service_type            text not null default 'Servicio de Software / Membresía',
  claimed_amount          text,
  service_description     text not null default '',
  detail                  text not null,
  consumer_request        text not null,
  privacy_policy_accepted boolean not null default false,
  privacy_policy_version  text not null default '2026-11',
  accepted_at             timestamptz,
  status                  text not null default 'registrado',
  created_at              timestamptz not null default now()
);

alter table public.complaints enable row level security;

drop policy if exists "complaints_public_insert" on public.complaints;
create policy "complaints_public_insert"
  on public.complaints
  for insert
  to anon, authenticated
  with check (privacy_policy_accepted = true);

drop policy if exists "complaints_admin_select" on public.complaints;
create policy "complaints_admin_select"
  on public.complaints
  for select
  to authenticated
  using (true);
