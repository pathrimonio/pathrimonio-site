import React from 'react';

export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const roleColors = {
    'Admin': 'text-primary',
    'Fintech Lead': 'text-blue-400',
    'Desarrollador': 'text-purple-400',
    'Auditora de Impacto': 'text-teal-400',
    'Colaborador': 'text-amber-400',
    'Socio / Cliente': 'text-emerald-400',
    'Usuario Registrado': 'text-sky-400',
    'Product Owner': 'text-emerald-400',
    'Cliente': 'text-cyan-400'
  };

  const roleBadgeColors = {
    'Admin': 'bg-primary/20 border-primary/40 text-primary',
    'Fintech Lead': 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    'Desarrollador': 'bg-purple-500/20 border-purple-500/40 text-purple-400',
    'Auditora de Impacto': 'bg-teal-500/20 border-teal-500/40 text-teal-400',
    'Colaborador': 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    'Socio / Cliente': 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    'Usuario Registrado': 'bg-sky-500/20 border-sky-500/40 text-sky-300',
    'Product Owner': 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    'Cliente': 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
  };

  const avatarBg = {
    'Admin': 'bg-primary',
    'Fintech Lead': 'bg-blue-500',
    'Desarrollador': 'bg-purple-500',
    'Auditora de Impacto': 'bg-teal-500',
    'Colaborador': 'bg-amber-600',
    'Socio / Cliente': 'bg-emerald-600',
    'Usuario Registrado': 'bg-sky-600',
    'Product Owner': 'bg-emerald-600',
    'Cliente': 'bg-cyan-600'
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-container-high transition-colors group"
        title={`${user.name} · ${user.role}`}
      >
        <div className={`w-7 h-7 rounded-full ${avatarBg[user.role] || 'bg-primary'} flex items-center justify-center font-space text-[11px] font-bold text-white shrink-0`}>
          {user.avatar}
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="font-space text-xs text-white font-semibold leading-tight truncate max-w-24">
            {user.name.split(' ')[0]}
          </span>
          <span className={`font-space text-[10px] leading-tight ${roleColors[user.role] || 'text-primary'}`}>
            {user.role}
          </span>
        </div>
        <span className="material-symbols-outlined text-[14px] text-on-surface-variant group-hover:text-white transition-colors hidden sm:block">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-surface-container border border-outline-variant rounded-lg shadow-2xl z-50 py-1.5 overflow-hidden">
          {/* User identity header */}
          <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${avatarBg[user.role] || 'bg-primary'} flex items-center justify-center font-space text-sm font-bold text-white shrink-0`}>
              {user.avatar}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-space text-sm text-white font-bold truncate">{user.name}</span>
              {user.organization && (
                <span className="font-space text-[10px] text-primary truncate flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[12px]">domain</span>
                  <span>{user.organization}</span>
                </span>
              )}
              <span className="font-jakarta text-[11px] text-on-surface-variant truncate">{user.email}</span>
              <span className={`mt-0.5 inline-block px-1.5 py-0 rounded border text-[10px] font-space font-semibold w-fit ${roleBadgeColors[user.role] || ''}`}>
                {user.role}
              </span>
            </div>
          </div>

          {/* Permissions list */}
          <div className="px-4 py-2.5 border-b border-outline-variant">
            <p className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">Permisos activos</p>
            <div className="flex flex-wrap gap-1">
              {(user.permissions || []).map(p => (
                <span key={p} className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/60 text-[10px] font-space text-on-surface capitalize">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Menu Actions */}
          <div className="py-1">
            <button className="w-full px-4 py-2 text-left font-space text-xs text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-primary">account_circle</span>
              Mi Perfil de Analista
            </button>
            <button className="w-full px-4 py-2 text-left font-space text-xs text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-primary">notifications</span>
              Centro de Notificaciones
            </button>
            <button className="w-full px-4 py-2 text-left font-space text-xs text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-primary">settings</span>
              Preferencias del Workspace
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-outline-variant py-1">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full px-4 py-2 text-left font-space text-xs text-error hover:bg-error-container/30 transition-colors flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
