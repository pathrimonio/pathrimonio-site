import React, { useState } from 'react';
import { 
  SYSTEM_MODULES, 
  SYSTEM_ACTIONS, 
  DEFAULT_ROLE_DEFINITIONS,
  saveRoleDefinitions 
} from '../../auth/permissionsConfig';

export default function AdminUsersView({
  currentUser,
  portalUsers = [],
  onUpdatePortalUsers,
  roleDefinitions,
  onUpdateRoleDefinitions,
  onNotify
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('users'); // 'users' | 'matrix'
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState('Colaborador');

  // Modal para agregar nuevo usuario
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserOrg, setNewUserOrg] = useState('');
  const [newUserRole, setNewUserRole] = useState('Colaborador');

  // Roles disponibles
  const availableRoles = Object.keys(roleDefinitions || DEFAULT_ROLE_DEFINITIONS);

  // Filtrado de usuarios
  const filteredUsers = portalUsers.filter(u => {
    const matchSearch = 
      (u.name || '').toLowerCase().includes(searchUser.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchUser.toLowerCase()) ||
      (u.organization || '').toLowerCase().includes(searchUser.toLowerCase());
    const matchRole = roleFilter === 'Todos' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Cambiar rol de un usuario
  const handleRoleChange = (userId, newRole) => {
    const updated = portalUsers.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    onUpdatePortalUsers(updated);
    const targetUser = portalUsers.find(u => u.id === userId);
    onNotify?.(`Rol de ${targetUser?.name || 'usuario'} actualizado a "${newRole}".`);
  };

  // Alternar estado de activación
  const handleToggleUserStatus = (userId) => {
    const updated = portalUsers.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    onUpdatePortalUsers(updated);
    onNotify?.(`Estado del usuario actualizado.`);
  };

  // Agregar nuevo usuario manualmente
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const initials = newUserName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'US';

    const newUser = {
      id: `user_${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      organization: newUserOrg.trim() || 'Pathrimonio Colaboradores',
      role: newUserRole,
      avatar: initials,
      color: newUserRole === 'Admin' ? 'bg-primary' : 'bg-amber-600',
      status: 'active',
      permissions: ['read', 'write']
    };

    const updated = [newUser, ...portalUsers];
    onUpdatePortalUsers(updated);
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserOrg('');
    setNewUserRole('Colaborador');
    onNotify?.(`Usuario ${newUser.name} registrado con rol ${newUserRole}.`);
  };

  // Alternar módulo permitido para un rol en la matriz
  const handleToggleModuleForRole = (roleKey, moduleId) => {
    if (roleKey === 'Admin' && moduleId === 'settings') {
      onNotify?.('El rol Administrador debe conservar acceso al módulo de administración.');
      return;
    }

    const currentDefs = { ...roleDefinitions };
    const targetRole = { ...currentDefs[roleKey] };
    const currentTabs = targetRole.allowedTabs || [];

    let updatedTabs;
    if (currentTabs.includes(moduleId)) {
      updatedTabs = currentTabs.filter(t => t !== moduleId);
    } else {
      updatedTabs = [...currentTabs, moduleId];
    }

    targetRole.allowedTabs = updatedTabs;
    currentDefs[roleKey] = targetRole;

    onUpdateRoleDefinitions(currentDefs);
    saveRoleDefinitions(currentDefs);
    onNotify?.(`Permisos de módulo actualizados para el rol ${roleKey}.`);
  };

  // Alternar acción permitida para un rol en la matriz
  const handleToggleActionForRole = (roleKey, actionId) => {
    if (roleKey === 'Admin' && actionId === 'canManageUsers') {
      onNotify?.('El rol Administrador debe conservar permiso de gestión de usuarios.');
      return;
    }

    const currentDefs = { ...roleDefinitions };
    const targetRole = { ...currentDefs[roleKey] };
    const currentActions = { ...(targetRole.actions || {}) };

    currentActions[actionId] = !currentActions[actionId];
    targetRole.actions = currentActions;
    currentDefs[roleKey] = targetRole;

    onUpdateRoleDefinitions(currentDefs);
    saveRoleDefinitions(currentDefs);
    onNotify?.(`Acción "${actionId}" actualizada para el rol ${roleKey}.`);
  };

  // Restablecer valores predeterminados
  const handleResetDefaults = () => {
    if (window.confirm('¿Deseas restablecer la matriz de roles y permisos a los valores estándar de Pathrimonio?')) {
      onUpdateRoleDefinitions(DEFAULT_ROLE_DEFINITIONS);
      saveRoleDefinitions(DEFAULT_ROLE_DEFINITIONS);
      onNotify?.('Matriz de permisos restablecida a valores estándar.');
    }
  };

  const activeRoleConfig = roleDefinitions[selectedRoleForMatrix] || roleDefinitions['Colaborador'];

  return (
    <div className="flex flex-col gap-6 max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[22px]">admin_panel_settings</span>
            <h1 className="font-space text-xl sm:text-2xl text-white font-bold tracking-tight">
              Administración de Pathrimonio
            </h1>
            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/40">
              Control de Accesos
            </span>
          </div>
          <p className="font-jakarta text-xs text-on-surface-variant max-w-2xl">
            Manejo integral de cuentas de usuario, asignación de roles y configuración de la matriz de permisos para cada perfil operativo del sistema.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant shrink-0">
          <button
            type="button"
            onClick={() => setActiveAdminTab('users')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-space text-xs font-semibold transition-all ${
              activeAdminTab === 'users'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">group</span>
            <span>Manejo de Usuarios</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/20 text-current">
              {portalUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('matrix')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-space text-xs font-semibold transition-all ${
              activeAdminTab === 'matrix'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">security</span>
            <span>Roles y Permisos de Acceso</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TAB 1: MANEJO DE USUARIOS
      ══════════════════════════════════════════ */}
      {activeAdminTab === 'users' && (
        <div className="flex flex-col gap-5">
          {/* Controls Bar: Search, Filters, Add Button */}
          <div className="p-4 rounded-lg bg-surface-container border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
              {/* Buscador */}
              <div className="relative w-full sm:w-72">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Buscar por nombre, email o entidad..."
                  className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-lg pl-8 pr-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary placeholder-on-surface-variant/50"
                />
              </div>

              {/* Filtro por Rol */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="font-space text-xs text-on-surface-variant shrink-0">Filtrar rol:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-9 bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 font-space text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="Todos">Todos los roles ({portalUsers.length})</option>
                  {availableRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botón Nuevo Usuario */}
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(true)}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Registrar / Asignar Usuario</span>
            </button>
          </div>

          {/* Banner de Política de Seguridad: Cuentas de Colaborador */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-400 text-[20px] shrink-0 mt-0.5">
              shield_person
            </span>
            <div className="flex flex-col gap-0.5 text-xs">
              <span className="font-space font-bold text-white">
                Política de Acceso para Colaboradores Creados desde el Login
              </span>
              <p className="font-jakarta text-on-surface-variant leading-relaxed">
                Las cuentas creadas públicamente se registran por defecto con el rol <strong className="text-amber-300">Colaborador</strong>. Este perfil está acotado exclusivamente a <span className="text-white font-medium">Crear Roles</span>, <span className="text-white font-medium">Crear Historias de Usuario</span> y <span className="text-white font-medium">Crear Interfaces de Software</span>. Como Administrador, puedes reasignar su rol a continuación para conceder permisos adicionales.
              </p>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/80 bg-surface-container-low text-[11px] font-space text-on-surface-variant uppercase tracking-wider">
                    <th className="py-3 px-4">Usuario / Colaborador</th>
                    <th className="py-3 px-4">Organización / Entidad</th>
                    <th className="py-3 px-4">Rol Asignado</th>
                    <th className="py-3 px-4">Módulos Permitidos</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-on-surface-variant font-jakarta">
                        No se encontraron usuarios que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const isSelf = user.email?.toLowerCase() === currentUser?.email?.toLowerCase();
                      const roleConfig = roleDefinitions[user.role] || roleDefinitions['Colaborador'];
                      const isSuspended = user.status === 'suspended';
                      const allowedTabsCount = roleConfig?.allowedTabs?.length || 0;

                      return (
                        <tr 
                          key={user.id} 
                          className={`hover:bg-surface-container-high/40 transition-colors ${
                            isSuspended ? 'opacity-60 bg-surface-container-lowest/50' : ''
                          }`}
                        >
                          {/* Usuario Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full ${user.color || roleConfig?.avatarBg || 'bg-primary'} flex items-center justify-center font-space text-xs font-bold text-white shrink-0 shadow-xs`}>
                                {user.avatar || user.name?.slice(0, 2)?.toUpperCase() || 'US'}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-space font-bold text-white truncate">{user.name}</span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-primary/20 text-primary border border-primary/40 font-bold">
                                      TÚ
                                    </span>
                                  )}
                                  {user.id.startsWith('collab_') && (
                                    <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                      LOGIN
                                    </span>
                                  )}
                                </div>
                                <span className="font-jakarta text-[11px] text-on-surface-variant truncate">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Organización */}
                          <td className="py-3 px-4 font-jakarta text-on-surface-variant">
                            {user.organization || 'Pathrimonio Core'}
                          </td>

                          {/* Selector de Rol */}
                          <td className="py-3 px-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              disabled={isSelf}
                              className={`h-8 bg-surface-container-lowest border rounded-md px-2 font-space text-xs font-semibold focus:outline-none focus:border-primary ${
                                roleConfig?.badgeColor || 'border-outline-variant text-white'
                              }`}
                            >
                              {availableRoles.map(r => (
                                <option key={r} value={r} className="bg-surface-container text-white">
                                  {r}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Módulos Permitidos */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-white">
                                {allowedTabsCount} de {SYSTEM_MODULES.length}
                              </span>
                              <span className="text-[11px] text-on-surface-variant">
                                ({user.role === 'Colaborador' ? 'Roles, Historias, UI' : user.role === 'Admin' ? 'Acceso Total' : 'Parcial'})
                              </span>
                            </div>
                          </td>

                          {/* Estado */}
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-space font-semibold uppercase ${
                              isSuspended
                                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                              <span>{isSuspended ? 'Suspendido' : 'Activo'}</span>
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserStatus(user.id)}
                                  title={isSuspended ? 'Reactivar usuario' : 'Suspender acceso'}
                                  className="p-1 rounded text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[17px]">
                                    {isSuspended ? 'lock_open' : 'block'}
                                  </span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRoleForMatrix(user.role);
                                  setActiveAdminTab('matrix');
                                }}
                                title="Ver permisos de este rol"
                                className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                              >
                                <span className="material-symbols-outlined text-[17px]">tune</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 2: MATRIZ DE ROLES Y PERMISOS
      ══════════════════════════════════════════ */}
      {activeAdminTab === 'matrix' && (
        <div className="flex flex-col gap-6">
          {/* Selector de Rol a Configurar */}
          <div className="p-4 rounded-lg bg-surface-container border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-space text-xs font-bold text-white uppercase block mb-1">
                Selecciona el Rol a Auditar o Configurar
              </span>
              <p className="font-jakarta text-xs text-on-surface-variant">
                Modifica los accesos a módulos y las acciones permitidas para cada perfil.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-md border border-outline-variant hover:border-red-500/50 text-on-surface-variant hover:text-red-400 font-space text-xs transition-colors"
              >
                Restablecer Estándar
              </button>
            </div>
          </div>

          {/* Botones de Roles */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {availableRoles.map(rKey => {
              const rDef = roleDefinitions[rKey] || DEFAULT_ROLE_DEFINITIONS[rKey];
              const isSelected = selectedRoleForMatrix === rKey;
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => setSelectedRoleForMatrix(rKey)}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-surface-container-high border-primary shadow-sm'
                      : 'bg-surface-container border-outline-variant/80 hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-space text-xs font-bold truncate ${rDef?.color || 'text-white'}`}>
                      {rKey}
                    </span>
                    {rKey === 'Colaborador' && (
                      <span className="px-1 py-0.2 rounded font-mono text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Login
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    {rDef?.allowedTabs?.length || 0} módulos
                  </span>
                </button>
              );
            })}
          </div>

          {/* Panel de Configuración del Rol Seleccionado */}
          <div className="p-6 rounded-lg bg-surface-container border border-outline-variant flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-space text-lg text-white font-bold">
                    {activeRoleConfig?.name || selectedRoleForMatrix}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${activeRoleConfig?.badgeColor}`}>
                    {selectedRoleForMatrix}
                  </span>
                </div>
                <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                  {activeRoleConfig?.desc}
                </p>
              </div>

              {selectedRoleForMatrix === 'Colaborador' && (
                <div className="px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-space text-xs font-medium shrink-0">
                  Modo Acotado Estricto (Por Requerimiento)
                </div>
              )}
            </div>

            {/* Sub-Sección A: Módulos y Pantallas Permitidas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-space text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">view_quilt</span>
                  <span>Módulos y Vistas con Acceso en el Menú</span>
                </span>
                <span className="font-mono text-xs text-on-surface-variant">
                  {activeRoleConfig?.allowedTabs?.length} de {SYSTEM_MODULES.length} activos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SYSTEM_MODULES.map(mod => {
                  const isAllowed = (activeRoleConfig?.allowedTabs || []).includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => handleToggleModuleForRole(selectedRoleForMatrix, mod.id)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isAllowed
                          ? 'bg-surface-container-high border-primary/60 text-white'
                          : 'bg-surface-container-lowest/60 border-outline-variant/60 text-on-surface-variant hover:border-outline-variant'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                          isAllowed ? 'text-primary' : 'text-on-surface-variant'
                        }`}>
                          {mod.icon}
                        </span>
                        <div>
                          <span className={`font-space text-xs font-bold block ${isAllowed ? 'text-white' : 'text-on-surface-variant'}`}>
                            {mod.label}
                          </span>
                          <span className="font-jakarta text-[11px] text-on-surface-variant leading-tight block mt-0.5">
                            {mod.desc}
                          </span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isAllowed
                          ? 'bg-primary border-primary text-on-primary'
                          : 'border-outline-variant bg-surface-container'
                      }`}>
                        {isAllowed && <span className="material-symbols-outlined text-[14px]">check</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sub-Sección B: Acciones Operativas Permitidas */}
            <div className="pt-4 border-t border-outline-variant">
              <span className="font-space text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                <span>Acciones Operativas Permitidas</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SYSTEM_ACTIONS.map(action => {
                  const isActionAllowed = Boolean(activeRoleConfig?.actions?.[action.id]);
                  return (
                    <div
                      key={action.id}
                      onClick={() => handleToggleActionForRole(selectedRoleForMatrix, action.id)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isActionAllowed
                          ? 'bg-surface-container-high border-primary/60 text-white'
                          : 'bg-surface-container-lowest/60 border-outline-variant/60 text-on-surface-variant hover:border-outline-variant'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${isActionAllowed ? 'bg-primary' : 'bg-outline-variant'}`}></span>
                        <span className={`font-space text-xs font-medium ${isActionAllowed ? 'text-white' : 'text-on-surface-variant'}`}>
                          {action.label}
                        </span>
                      </div>

                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isActionAllowed
                          ? 'bg-primary border-primary text-on-primary'
                          : 'border-outline-variant bg-surface-container'
                      }`}>
                        {isActionAllowed && <span className="material-symbols-outlined text-[14px]">check</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: REGISTRAR / ASIGNAR USUARIO
      ══════════════════════════════════════════ */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                <h3 className="font-space text-sm font-bold text-white uppercase tracking-wider">
                  Registrar Usuario en Workspace
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-on-surface-variant hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-space text-xs text-white">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ej. Ing. Diana Robles"
                  className="h-9 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-space text-xs text-white">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="diana@cooperativa.org"
                  className="h-9 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-space text-xs text-white">Organización / Entidad</label>
                <input
                  type="text"
                  value={newUserOrg}
                  onChange={(e) => setNewUserOrg(e.target.value)}
                  placeholder="Ej. Cooperativa Andina / PYME"
                  className="h-9 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-space text-xs text-white">Rol Asignado *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="h-9 bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 font-space text-xs text-white focus:outline-none focus:border-primary"
                >
                  {availableRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <span className="font-jakarta text-[10px] text-on-surface-variant mt-0.5">
                  {newUserRole === 'Colaborador'
                    ? 'Acceso acotado a crear roles, historias de usuario e interfaces.'
                    : 'Permisos completos según la matriz configurada.'}
                </span>
              </div>

              <div className="pt-3 border-t border-outline-variant flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-outline-variant font-space text-xs text-on-surface-variant hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
