import React from 'react';
import UserMenu from './UserMenu';

export default function Header({ 
  onToggleSidebar, 
  user, 
  onLogout,
  activeProject,
  projectUsers = [],
  onInvite
}) {
  const currentEmail = String(user?.email || '').toLowerCase();
  const collaborators = (projectUsers || []).filter(
    (member) => String(member.email || '').toLowerCase() !== currentEmail
  );
  const visibleCollaborators = collaborators.slice(0, 2);
  const hiddenCollaborators = collaborators.slice(2);
  const initialsOf = (name) => String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-14 bg-surface-container-lowest/90 backdrop-blur-md z-30 border-b border-outline-variant px-3 sm:px-4 lg:px-5 flex items-center justify-between gap-4">
      
      {/* Left: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-x-3 min-w-0">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded text-on-surface-variant hover:text-white hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <div className="flex items-center gap-x-2 text-on-surface-variant font-jakarta text-xs truncate">
          <span className="text-white font-space font-semibold hidden sm:inline">Pathrimonio</span>
          <span className="text-outline-variant font-mono hidden sm:inline">/</span>
          <span className="text-primary font-space font-semibold truncate flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">{activeProject?.icon || 'apps'}</span>
            <span>{activeProject?.name || 'Portal Core'}</span>
          </span>
        </div>

        <div className="hidden md:block h-4 w-px bg-outline-variant"></div>

        <div className="hidden md:flex items-center gap-x-1.5 px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-on-surface font-space text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-medium text-white truncate max-w-[160px]">
            {activeProject?.status || 'Sprint Activo'}
          </span>
        </div>
      </div>

      {/* Right: Collabs & User Menu */}
      <div className="flex items-center gap-x-3">
        {/* Collaborators avatars (project team, excluding the logged-in user) */}
        {(collaborators.length > 0 || onInvite) && (
          <div className="hidden sm:flex items-center gap-1.5">
            {collaborators.length > 0 && (
              <div
                className="flex items-center -space-x-1.5"
                title={`Equipo de ${activeProject?.shortName || activeProject?.name || 'Pathrimonio'}`}
              >
                {visibleCollaborators.map((member) => (
                  <div
                    key={member.id || member.email}
                    className={`w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center font-space text-[10px] font-semibold text-white ${member.color || 'bg-blue-500'}`}
                    title={`${member.name}${member.role ? ` · ${member.role}` : ''}`}
                  >
                    {member.avatar || initialsOf(member.name)}
                  </div>
                ))}
                {hiddenCollaborators.length > 0 && (
                  <div
                    className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-space text-[10px] font-bold text-primary"
                    title={hiddenCollaborators.map((member) => member.name).join(', ')}
                  >
                    +{hiddenCollaborators.length}
                  </div>
                )}
              </div>
            )}

            {onInvite && (
              <button
                type="button"
                onClick={onInvite}
                className="w-6 h-6 rounded-full border border-dashed border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary flex items-center justify-center transition-colors"
                title={collaborators.length > 0 ? 'Gestionar usuarios del proyecto' : 'Invitar usuario al proyecto'}
              >
                <span className="material-symbols-outlined text-[14px]">person_add</span>
              </button>
            )}
          </div>
        )}

        {/* Notification bell */}
        <button className="relative p-1.5 rounded text-on-surface-variant hover:text-white hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(245,166,35,0.7)]"></span>
        </button>

        {/* User Menu with Dropdown */}
        {user && <UserMenu user={user} onLogout={onLogout} />}
      </div>

    </header>
  );
}
