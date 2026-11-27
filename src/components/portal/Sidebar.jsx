import React from 'react';
import ProjectSelector from './ProjectSelector';
import { getRoleDefinition, normalizeRoleCode } from '../../auth/permissionsConfig';

export default function Sidebar({ 
  activeTab, 
  onSelectTab, 
  onReturnHome, 
  sidebarOpen, 
  setSidebarOpen,
  projects = [],
  activeProjectId,
  onSelectProject,
  onOpenNewProjectModal,
  currentUser,
  roleDefinitions
}) {
  const allNavItems = [
    { id: 'actors', label: 'Actores & Roles', icon: 'badge', badge: 'ROL' },
    { id: 'stories', label: 'Historias de Usuario', icon: 'view_kanban', badge: 'US' },
    { id: 'interfaces', label: 'Interfaces de Software', icon: 'devices', badge: 'UI/UX' },
    { id: 'formalia', label: 'FORMALIA (Flujos → HUs)', icon: 'auto_awesome', badge: 'IA' },
    { id: 'implementationStatus', label: 'Estado & Diffs Web', icon: 'rocket_launch', badge: 'DIFF' },
    { id: 'partnerPanel', label: 'Panel de Socio', icon: 'workspace_premium', badge: 'SOCIO' },
    { id: 'presalesReview', label: 'Preventa & Cotizaciones', icon: 'assignment_turned_in', badge: 'TECH' },
    { id: 'architecture', label: 'Arquitectura de Software', icon: 'account_tree', badge: 'ARCH' },
    { id: 'dataModel', label: 'Arquitectura de Datos', icon: 'database', badge: 'DB' },
    { id: 'files', label: 'Archivos & Manifiestos', icon: 'folder_open', badge: 'FILES' },
    { id: 'backlog', label: 'Backlog', icon: 'format_list_bulleted' },
    { id: 'sprints', label: 'Sprints & Ciclos', icon: 'timelapse' },
    { id: 'docs', label: 'Docs de Arquitectura', icon: 'article', badge: 'DOCS' },
    { id: 'settings', label: 'Administración & RBAC', icon: 'admin_panel_settings', badge: 'ADMIN' }
  ];

  // Restricción estricta según el rol y matriz de permisos
  const userRole = currentUser?.role || 'Usuario Registrado';
  const roleCode = normalizeRoleCode(userRole);
  const roleConfig = getRoleDefinition(userRole, roleDefinitions);
  const allowedTabs = roleConfig?.allowedTabs || ['actors', 'stories', 'interfaces', 'formalia', 'implementationStatus'];

  const navItems = allNavItems.filter(item => allowedTabs.includes(item.id));

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-surface-container-lowest z-40 flex flex-col justify-between border-r border-outline-variant transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col gap-y-3 p-3">
          
          {/* Logo Brand Bar */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-outline-variant/60 pb-3">
            <div 
              onClick={onReturnHome}
              className="flex items-center gap-x-2.5 cursor-pointer group"
              title="Volver a la portada de Pathrimonio"
            >
              <div className="w-7 h-7 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center group-hover:border-primary transition-colors shrink-0">
                <img src="/assets/images/logo.png" alt="Pathrimonio" className="w-4 h-4 object-contain" />
              </div>
              <img
                src="/assets/images/Banner_PATHRIMONIO_COMPANY.png"
                alt="Pathrimonio Company"
                className="h-9 w-auto max-w-[138px] object-contain rounded-[6px] bg-black px-1 border border-outline-variant/60 shrink-0"
              />
            </div>

            <button 
              onClick={onReturnHome}
              className="p-1 rounded text-on-surface-variant hover:text-white hover:bg-surface-container-low transition-colors"
              title="Volver al Inicio"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
            </button>
          </div>

          {/* Project Switcher Selector */}
          <div className="pt-0.5 pb-1">
            <ProjectSelector
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={onSelectProject}
              onOpenNewProjectModal={onOpenNewProjectModal}
            />
          </div>

          {/* Role Identity Banner */}
          {roleCode !== 'admin' && (
            <div className="mx-1 my-1 p-2 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-300 font-space text-[10px]">
              <span className="material-symbols-outlined text-[15px] shrink-0">shield_person</span>
              <span className="font-semibold leading-tight">
                {roleCode === 'partner'
                  ? 'Socio / Cliente · 45 IA/día + Billetera'
                  : roleCode === 'collaborator'
                    ? 'Colaborador · Preventa, Archifly & Files'
                    : 'Cuenta PYME · 4 Vistas + Tracking Web'}
              </span>
            </div>
          )}
          <nav className="flex flex-col gap-y-1 pt-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded font-space text-xs tracking-wide transition-all text-left ${
                    isActive 
                      ? 'text-white bg-surface-container border-l-2 border-primary font-semibold shadow-sm' 
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-x-2.5 min-w-0">
                    <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-primary' : ''}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] uppercase tracking-wider ${
                      isActive 
                        ? 'bg-primary/20 text-primary border border-primary/40 font-bold' 
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 flex flex-col gap-2">
          {/* Back to public site button */}
          <button 
            onClick={onReturnHome}
            className="w-full flex items-center justify-between px-3 py-2 rounded bg-surface-container border border-outline-variant hover:border-primary/40 text-on-surface-variant hover:text-white font-space text-xs transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">arrow_back</span>
              <span>Sitio Institucional</span>
            </span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </button>

          {/* Sync indicator status box */}
          <div className="p-2.5 rounded bg-surface-container-low border border-outline-variant/60 flex flex-col gap-y-1">
            <div className="flex items-center justify-between text-on-surface-variant font-space text-[11px]">
              <span>Sincronización Local</span>
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(245,166,35,0.7)] animate-pulse"></span>
            </div>
            <p className="text-on-surface-variant font-jakarta text-[11px]">
              Almacenamiento activo en memoria
            </p>
          </div>
        </div>

      </aside>
    </>
  );
}
