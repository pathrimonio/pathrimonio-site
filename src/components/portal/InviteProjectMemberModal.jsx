import React, { useEffect, useMemo, useState } from 'react';

const ROLE_OPTIONS = [
  { value: 'editor', label: 'Editor', hint: 'Consulta y aporta cambios' },
  { value: 'viewer', label: 'Consulta', hint: 'Solo lectura' },
  { value: 'owner', label: 'Administrador', hint: 'Gestiona el proyecto y sus usuarios' }
];

const initialsOf = (name) => String(name || '')
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('');

const roleLabel = (value) => ROLE_OPTIONS.find((option) => option.value === value)?.label || value;

export default function InviteProjectMemberModal({
  isOpen,
  onClose,
  project,
  portalUsers = [],
  projectUsers = [],
  currentUser,
  onAdd,
  onRemove
}) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState('editor');
  const [busy, setBusy] = useState(false);

  const currentEmail = String(currentUser?.email || '').toLowerCase();

  const memberIds = useMemo(
    () => new Set((projectUsers || []).map((member) => member.id)),
    [projectUsers]
  );

  const availableUsers = useMemo(
    () => (portalUsers || []).filter((user) => !memberIds.has(user.id)),
    [portalUsers, memberIds]
  );

  const ownerCount = useMemo(
    () => (projectUsers || []).filter((member) => member.projectRole === 'owner').length,
    [projectUsers]
  );

  useEffect(() => {
    if (!isOpen) return;
    setSelectedUserId(availableUsers[0]?.id || '');
    setRole('editor');
    setBusy(false);
  }, [isOpen, availableUsers]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!selectedUserId || busy) return;

    setBusy(true);
    const added = await onAdd?.({ userId: selectedUserId, role });
    setBusy(false);

    if (added) {
      const next = availableUsers.find((user) => user.id !== selectedUserId);
      setSelectedUserId(next?.id || '');
    }
  };

  const handleRemove = async (membershipId) => {
    if (busy) return;
    setBusy(true);
    await onRemove?.(membershipId);
    setBusy(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="relative w-full max-w-lg bg-surface-container border border-outline-variant rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/60 bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">group_add</span>
            </div>
            <div>
              <h2 className="font-space text-sm font-bold text-white">Usuarios del Proyecto</h2>
              <p className="font-jakarta text-[11px] text-on-surface-variant">
                {project?.name || 'Proyecto'} · acceso al portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Current members */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-space text-xs font-semibold text-white">
                Con acceso al proyecto
              </span>
              <span className="font-mono text-[11px] text-primary">{projectUsers.length}</span>
            </div>

            {projectUsers.length === 0 ? (
              <p className="text-[11px] font-jakarta text-on-surface-variant p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60">
                Todavía no hay usuarios con acceso a este proyecto.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {projectUsers.map((member) => {
                  const isCurrentUser = String(member.email || '').toLowerCase() === currentEmail;
                  const isLastOwner = member.projectRole === 'owner' && ownerCount <= 1;
                  const canRemove = !isCurrentUser && !isLastOwner;

                  return (
                    <div
                      key={member.membershipId || member.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/60"
                    >
                      <div className={`w-7 h-7 rounded-full border border-outline-variant flex items-center justify-center font-space text-[10px] font-semibold text-white ${member.color || 'bg-blue-500'}`}>
                        {member.avatar || initialsOf(member.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-space text-xs font-semibold text-white truncate">{member.name}</span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-[9px]">
                              VOS
                            </span>
                          )}
                        </div>
                        <span className="block font-jakarta text-[10px] text-on-surface-variant truncate">{member.email}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-[10px] font-space text-on-surface-variant shrink-0">
                        {roleLabel(member.projectRole)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(member.membershipId)}
                        disabled={!canRemove || busy}
                        className="p-1 rounded text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                        title={isCurrentUser ? 'No podés quitarte a vos mismo' : isLastOwner ? 'El proyecto necesita al menos un administrador' : 'Quitar acceso'}
                      >
                        <span className="material-symbols-outlined text-[16px]">person_remove</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add member */}
          <form
            onSubmit={handleAdd}
            className="flex flex-col gap-2.5 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60"
          >
            <span className="font-space text-xs font-semibold text-white">Agregar usuario del portal</span>

            {availableUsers.length === 0 ? (
              <p className="text-[11px] font-jakarta text-on-surface-variant">
                Todos los usuarios del portal ya tienen acceso a este proyecto.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={selectedUserId}
                    onChange={(event) => setSelectedUserId(event.target.value)}
                    className="h-9 px-2 bg-surface-container border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
                  >
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} — {user.email}
                      </option>
                    ))}
                  </select>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="h-9 px-2 bg-surface-container border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} · {option.hint}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={busy || !selectedUserId}
                  className="h-9 rounded-lg bg-primary text-on-primary hover:bg-[#e09419] font-space text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>{busy ? 'Agregando…' : 'Agregar al proyecto'}</span>
                </button>
              </>
            )}
          </form>

          <p className="text-[10px] font-jakarta text-on-surface-variant leading-relaxed">
            El acceso se valida contra Supabase Auth por email. Los usuarios deben existir en el directorio del portal.
          </p>
        </div>
      </div>
    </div>
  );
}
