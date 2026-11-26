-- ============================================================
-- Interfaces: columna explícita ultima_fecha_modificacion + Realtime
-- ============================================================

alter table public.interfaces
  add column if not exists ultima_fecha_modificacion timestamptz not null default now();

-- Backfill existente desde updated_at / created_at
update public.interfaces
   set ultima_fecha_modificacion = coalesce(updated_at, created_at, now());

-- Mantener sincronizados updated_at y ultima_fecha_modificacion en inserts/updates
create or replace function public.touch_interface_timestamps()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.ultima_fecha_modificacion is null then
      new.ultima_fecha_modificacion = coalesce(new.updated_at, new.created_at, now());
    end if;
    return new;
  end if;

  new.updated_at = now();
  if new.ultima_fecha_modificacion is null or new.ultima_fecha_modificacion = old.ultima_fecha_modificacion then
    new.ultima_fecha_modificacion = now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_interfaces_touch on public.interfaces;
create trigger trg_interfaces_touch
  before insert or update on public.interfaces
  for each row execute function public.touch_interface_timestamps();

create index if not exists idx_interfaces_ultima_modificacion
  on public.interfaces(project_id, ultima_fecha_modificacion desc);

comment on column public.interfaces.ultima_fecha_modificacion is
  'Fecha y hora exacta de la última modificación de la especificación o captura de la interfaz.';

-- Realtime para que cambios hechos desde MCP o Portal en interfaces se reflejen al instante
alter table public.interfaces replica identity full;
alter table public.interface_roles replica identity full;
alter table public.interface_data_usage replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.interfaces;
exception when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.interface_roles;
exception when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.interface_data_usage;
exception when duplicate_object then null;
end;
$$;
