import React from 'react';
import { ArrowLeft, ArrowRight, Minus, Plus, AlertTriangle } from 'lucide-react';
import { ADMIN_ROLES } from '../../../data/pricingRules';

export default function StepRoles({
  adminRoles,
  totalAdminUsers,
  unitSocioPrice,
  onRoleCountChange,
  onBack,
  onNext
}) {
  return (
    <div className="animate-step-enter flex flex-col gap-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            2. Roles de tu Equipo
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Tarifa Socio:{' '}
            <strong className="text-[var(--text-primary)] font-mono">
              $1 USD/día (${unitSocioPrice}/mes)
            </strong>{' '}
            por rol operativo activo.
          </p>
        </div>

        <div className="text-right shrink-0 px-3 py-1.5 rounded-[8px] bg-[var(--bg-page)] border border-[var(--border-subtle)]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block">
            Total Roles
          </span>
          <span className="text-lg font-bold font-mono tabular-nums text-[var(--accent-text)]">
            {totalAdminUsers}
          </span>
        </div>
      </div>

      {/* Grid de 2 columnas con contadores compactos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ADMIN_ROLES.map((role) => {
          const selectedRole = adminRoles.find((r) => r.role === role.id);
          const count = selectedRole ? selectedRole.count : 0;
          const isSelected = count > 0;

          return (
            <div
              key={role.id}
              className={`p-4 rounded-[8px] border transition-all flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-[var(--bg-subtle)] border-[var(--accent-border)]'
                  : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {role.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] shrink-0 tabular-nums">
                    ${unitSocioPrice}/mes
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1" title={role.desc}>
                  {role.desc}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onRoleCountChange(role.id, -1)}
                  disabled={count === 0}
                  aria-label={`Quitar usuario de ${role.name}`}
                  className="w-8 h-8 rounded-[6px] border border-[var(--border-strong)] bg-[var(--bg-page)] hover:bg-[var(--bg-surface)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <Minus size={13} strokeWidth={2} />
                </button>
                <span
                  className={`w-7 text-center font-mono font-bold text-sm tabular-nums ${
                    isSelected ? 'text-[var(--accent-text)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {count}
                </span>
                <button
                  type="button"
                  onClick={() => onRoleCountChange(role.id, 1)}
                  aria-label={`Agregar usuario a ${role.name}`}
                  className="w-8 h-8 rounded-[6px] border border-[var(--accent-primary)] bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] flex items-center justify-center text-[var(--accent-text-on-solid)] transition-colors cursor-pointer"
                >
                  <Plus size={13} strokeWidth={2} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {totalAdminUsers === 0 && (
        <div className="p-3 rounded-[8px] bg-amber-500/10 border border-amber-500/35 text-xs text-[var(--text-primary)] flex items-center gap-2">
          <AlertTriangle size={14} className="text-[var(--accent-text)] shrink-0" />
          <span>Activa al menos 1 rol operativo para continuar al siguiente paso.</span>
        </div>
      )}

      {/* Navegación */}
      <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          <span>Atrás</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="btn-accent group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold cursor-pointer"
        >
          <span>Continuar a Canales</span>
          <ArrowRight
            size={14}
            strokeWidth={2}
            className="transition-transform duration-150 group-hover:translate-x-[3px]"
          />
        </button>
      </div>
    </div>
  );
}
