import React, { useMemo, useState } from 'react';
import {
  PLATFORM_IMPLEMENTED_VERSION,
  buildProjectSyncReports,
  getAutoSyncEnabled,
  setAutoSyncEnabled
} from '../../services/projectSyncService';
import SectionInfoPopover from './SectionInfoPopover';

export default function ProjectsManagementView({
  currentUser,
  isAdmin = false,
  projects = [],
  actors = [],
  stories = [],
  interfaces = [],
  dataModels = [],
  files = [],
  implementationRequests = [],
  onSyncCatalogProject,
  onSyncAllCatalogProjects,
  onUpdateProjectMeta,
  onOpenNewProjectModal,
  onSelectProject,
  onNavigateTab,
  onNotify
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'outdated' | 'up_to_date' | 'catalog' | 'client'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [editingProjId, setEditingProjId] = useState(null);
  const [editVersion, setEditVersion] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [syncingId, setSyncingId] = useState(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [autoSyncOn, setAutoSyncOn] = useState(() => getAutoSyncEnabled());

  const reports = useMemo(
    () =>
      buildProjectSyncReports({
        dbProjects: projects,
        dbActors: actors,
        dbStories: stories,
        dbInterfaces: interfaces,
        dbDataModels: dataModels,
        dbFiles: files,
        implementationRequests
      }),
    [projects, actors, stories, interfaces, dataModels, files, implementationRequests]
  );

  const stats = useMemo(() => {
    const total = reports.length;
    const upToDate = reports.filter((r) => r.statusCode === 'up_to_date').length;
    const outdated = reports.filter((r) => r.statusCode === 'outdated' || r.statusCode === 'client_diffs').length;
    const uninitialized = reports.filter((r) => r.statusCode === 'uninitialized').length;
    const catalogSyncable = reports.filter((r) => r.isCatalogProject && r.needsSync).length;
    return { total, upToDate, outdated, uninitialized, catalogSyncable };
  }, [reports]);

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reports.filter((r) => {
      if (filterMode === 'outdated' && r.statusCode !== 'outdated' && r.statusCode !== 'uninitialized' && r.statusCode !== 'client_diffs') {
        return false;
      }
      if (filterMode === 'up_to_date' && r.statusCode !== 'up_to_date') return false;
      if (filterMode === 'catalog' && !r.isCatalogProject) return false;
      if (filterMode === 'client' && r.isCatalogProject) return false;
      if (!q) return true;
      return (
        (r.id || '').toLowerCase().includes(q) ||
        (r.project?.name || '').toLowerCase().includes(q) ||
        (r.project?.shortName || '').toLowerCase().includes(q) ||
        (r.project?.client || '').toLowerCase().includes(q) ||
        (r.project?.owner_email || '').toLowerCase().includes(q) ||
        (r.dbVersion || '').toLowerCase().includes(q) ||
        (r.codeVersion || '').toLowerCase().includes(q)
      );
    });
  }, [reports, filterMode, searchQuery]);

  const handleToggleAutoSync = () => {
    const next = !autoSyncOn;
    setAutoSyncOn(next);
    setAutoSyncEnabled(next);
    onNotify?.(
      next
        ? 'Sincronización automática de catálogos activada al ingresar al Portal.'
        : 'Sincronización automática pausada; podrás actualizar manualmente desde esta vista.'
    );
  };

  const handleSyncSingle = async (projectId) => {
    if (!onSyncCatalogProject || syncingId) return;
    setSyncingId(projectId);
    try {
      await onSyncCatalogProject(projectId);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    if (!onSyncAllCatalogProjects || syncingAll) return;
    setSyncingAll(true);
    try {
      await onSyncAllCatalogProjects();
    } finally {
      setSyncingAll(false);
    }
  };

  const startEditingMeta = (rep) => {
    setEditingProjId(rep.id);
    setEditVersion(rep.project?.version || 'v1.0.0');
    setEditStatus(rep.project?.status || '');
  };

  const handleSaveMeta = async (rep) => {
    if (!onUpdateProjectMeta) return;
    await onUpdateProjectMeta({
      ...rep.project,
      version: editVersion.trim() || rep.project?.version || 'v1.0.0',
      status: editStatus.trim() || rep.project?.status
    });
    setEditingProjId(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-jakarta text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">deployed_code_update</span>
            Manejo de Proyectos &amp; Control de Versiones
            <SectionInfoPopover
              title="Versión Implementada vs Estado en Supabase"
              description="Compara automáticamente los catálogos SDD desplegados en código (actores, historias, interfaces, tablas, archivos y versión de release) contra los registros persistidos en Supabase, y verifica el estado de proyectos cliente web."
            />
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Release implementado en plataforma: <strong className="font-mono text-primary">{PLATFORM_IMPLEMENTED_VERSION}</strong> · Auditoría en vivo de paridad Código ↔ Base de Datos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleAutoSync}
            className={`px-3 py-2 rounded-xl border text-xs font-space font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              autoSyncOn
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-surface-container border-outline-variant text-on-surface-variant hover:text-white'
            }`}
            title="Sincroniza automáticamente catálogos ya registrados en BD cuando se despliega una versión nueva en código"
          >
            <span className="material-symbols-outlined text-[16px]">
              {autoSyncOn ? 'sync' : 'sync_disabled'}
            </span>
            <span>Auto-Sync: {autoSyncOn ? 'Activo' : 'Manual'}</span>
          </button>

          {stats.catalogSyncable > 0 && onSyncAllCatalogProjects && (
            <button
              type="button"
              disabled={syncingAll}
              onClick={handleSyncAll}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-space font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${syncingAll ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{syncingAll ? 'Sincronizando...' : `Sincronizar Pendientes (${stats.catalogSyncable})`}</span>
            </button>
          )}

          {onOpenNewProjectModal && (
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="px-3.5 py-2 rounded-xl bg-primary text-[#18181b] hover:brightness-110 text-xs font-space font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Nuevo Proyecto</span>
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant">
          <div className="text-[11px] font-mono text-on-surface-variant uppercase">Total Proyectos</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.total}</div>
          <div className="text-[11px] text-on-surface-variant mt-0.5">Catálogo SDD + Clientes Web</div>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-low border border-emerald-500/35">
          <div className="text-[11px] font-mono text-emerald-300 uppercase">Actualizados</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{stats.upToDate}</div>
          <div className="text-[11px] text-on-surface-variant mt-0.5">Paridad 100% con implementación</div>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-low border border-amber-500/35">
          <div className="text-[11px] font-mono text-amber-300 uppercase">Desactualizados / Diffs</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{stats.outdated}</div>
          <div className="text-[11px] text-on-surface-variant mt-0.5">Requieren sync o revisión</div>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant">
          <div className="text-[11px] font-mono text-on-surface-variant uppercase">Solo en Código (Sin BD)</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.uninitialized}</div>
          <div className="text-[11px] text-on-surface-variant mt-0.5">Listos para inicializar en Supabase</div>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar proyecto por ID, nombre, cliente, versión o propietario..."
            className="w-full bg-surface-container-highest border border-outline-variant rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-surface-container border border-outline-variant">
          {[
            { id: 'all', label: `Todos (${reports.length})` },
            { id: 'outdated', label: `Por actualizar (${stats.outdated + stats.uninitialized})` },
            { id: 'up_to_date', label: `Actualizados (${stats.upToDate})` },
            { id: 'catalog', label: 'Catálogo SDD' },
            { id: 'client', label: 'Clientes Web' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-space font-semibold transition-colors cursor-pointer ${
                filterMode === tab.id
                  ? 'bg-primary text-[#18181b]'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Proyectos y Estado Código <-> BD */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="p-10 rounded-2xl border border-outline-variant bg-surface-container-low text-center text-xs text-on-surface-variant">
            No se encontraron proyectos con el filtro seleccionado.
          </div>
        ) : (
          filteredReports.map((rep) => {
            const p = rep.project || {};
            const isExpanded = expandedProjectId === rep.id;
            const isEditing = editingProjId === rep.id;
            const statusStyle =
              rep.statusCode === 'up_to_date'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : rep.statusCode === 'uninitialized'
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40';

            const statusIcon =
              rep.statusCode === 'up_to_date'
                ? 'check_circle'
                : rep.statusCode === 'uninitialized'
                  ? 'cloud_upload'
                  : 'warning';

            return (
              <div
                key={rep.id}
                className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 sm:p-5 space-y-4"
              >
                {/* Fila Principal */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/35 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {p.icon || 'deployed_code'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white truncate">
                          {p.name || rep.id}
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant font-mono text-[10px] text-primary">
                          {rep.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold ${
                            rep.isCatalogProject
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/35'
                              : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35'
                          }`}
                        >
                          {rep.isCatalogProject ? 'Catálogo SDD' : 'Cliente Web'}
                        </span>
                      </div>

                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {p.client || 'Pathrimonio'} · Estado: <strong className="text-white">{p.status || 'Activo'}</strong>
                        {p.owner_email ? ` · Dueño: ${p.owner_email}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full border text-xs font-mono font-bold inline-flex items-center gap-1.5 ${statusStyle}`}>
                      <span className="material-symbols-outlined text-[15px]">{statusIcon}</span>
                      <span>{rep.statusLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Comparativa de Versiones + Contadores 1:1 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant">
                    <div className="text-[10px] font-mono text-on-surface-variant">Versión en BD</div>
                    <div className="font-mono font-bold text-white mt-0.5">{rep.dbVersion}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant">
                    <div className="text-[10px] font-mono text-on-surface-variant">
                      {rep.isCatalogProject ? 'Versión Código' : 'Baseline'}
                    </div>
                    <div className="font-mono font-bold text-primary mt-0.5">{rep.codeVersion}</div>
                  </div>

                  {[
                    { key: 'actors', label: 'Actores' },
                    { key: 'stories', label: 'Historias HU' },
                    { key: 'interfaces', label: 'Interfaces UI' },
                    { key: 'dataModels', label: 'Tablas SQL' },
                    { key: 'files', label: 'Archivos' }
                  ].map((metric) => {
                    const m = rep.counts[metric.key];
                    const hasDelta = (m.missing || 0) + (m.outdated || 0) > 0;
                    return (
                      <div
                        key={metric.key}
                        className={`p-2.5 rounded-xl border ${
                          hasDelta
                            ? 'bg-amber-500/10 border-amber-500/40'
                            : 'bg-surface-container border-outline-variant'
                        }`}
                      >
                        <div className="text-[10px] font-mono text-on-surface-variant">{metric.label}</div>
                        <div className="font-mono font-bold text-white mt-0.5 flex items-center justify-between gap-1">
                          <span>
                            {m.db}
                            {rep.isCatalogProject ? ` / ${m.code}` : ''}
                          </span>
                          {hasDelta && (
                            <span className="text-[10px] text-amber-300">
                              {m.missing > 0 ? `+${m.missing}` : `~${m.outdated}`}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Edición rápida de versión/estado (Admin / Staff) */}
                {isEditing && (
                  <div className="p-3 rounded-xl bg-surface-container border border-primary/40 flex flex-wrap items-end gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-on-surface-variant uppercase">Versión en BD</label>
                      <input
                        type="text"
                        value={editVersion}
                        onChange={(e) => setEditVersion(e.target.value)}
                        placeholder="v1.2.0"
                        className="h-8 px-2.5 rounded-lg bg-surface-container-highest border border-outline-variant text-xs font-mono text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[200px]">
                      <label className="text-[10px] font-mono text-on-surface-variant uppercase">Estado del Software</label>
                      <input
                        type="text"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        placeholder="En Producción (v1.2)"
                        className="w-full h-8 px-2.5 rounded-lg bg-surface-container-highest border border-outline-variant text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveMeta(rep)}
                      className="h-8 px-3 rounded-lg bg-primary text-[#18181b] text-xs font-bold cursor-pointer"
                    >
                      Guardar Metadata
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProjId(null)}
                      className="h-8 px-3 rounded-lg border border-outline-variant text-xs text-on-surface-variant hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                {/* Detalle de diferencias Código <-> BD */}
                {isExpanded && (
                  <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/80 space-y-2">
                    <div className="text-[11px] font-mono font-bold text-primary">
                      Detalle de Verificación ({rep.diffDetails.length} diferencia(s))
                    </div>
                    {rep.diffDetails.length === 0 ? (
                      <p className="text-xs text-emerald-300">
                        Todos los artefactos del proyecto coinciden con la última versión implementada ({rep.codeVersion}).
                      </p>
                    ) : (
                      <ul className="space-y-1 text-xs text-on-surface-variant list-disc list-inside max-h-48 overflow-y-auto">
                        {rep.diffDetails.map((d, idx) => (
                          <li key={idx} className="font-mono text-[11px]">
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Barra de Acciones */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/60">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {rep.isInDb && (
                      <>
                        {[
                          { tab: 'actors', label: 'Actores' },
                          { tab: 'stories', label: 'Historias HU' },
                          { tab: 'interfaces', label: 'Interfaces' },
                          { tab: 'architecture', label: 'Arquitectura' },
                          ...(rep.implementationRequest ? [{ tab: 'implementationStatus', label: 'Estado & Diffs' }] : [])
                        ].map((nav) => (
                          <button
                            key={nav.tab}
                            type="button"
                            onClick={() => {
                              onSelectProject?.(rep.id);
                              onNavigateTab?.(nav.tab);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant hover:border-primary text-[11px] font-space text-white cursor-pointer"
                          >
                            {nav.label}
                          </button>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedProjectId(isExpanded ? null : rep.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant text-[11px] text-on-surface-variant hover:text-white cursor-pointer"
                    >
                      {isExpanded ? 'Ocultar detalle' : `Ver paridad (${rep.diffDetails.length})`}
                    </button>

                    {rep.isInDb && isAdmin && onUpdateProjectMeta && (
                      <button
                        type="button"
                        onClick={() => startEditingMeta(rep)}
                        className="px-2.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant hover:border-primary text-[11px] text-white cursor-pointer"
                      >
                        Editar Versión
                      </button>
                    )}

                    {rep.isCatalogProject && onSyncCatalogProject && (
                      <button
                        type="button"
                        disabled={syncingId === rep.id}
                        onClick={() => handleSyncSingle(rep.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-space font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                          rep.needsSync
                            ? 'bg-primary text-[#18181b] hover:brightness-110'
                            : 'bg-surface-container border border-outline-variant hover:border-primary text-white'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[15px] ${syncingId === rep.id ? 'animate-spin' : ''}`}>
                          sync
                        </span>
                        <span>
                          {syncingId === rep.id
                            ? 'Sincronizando...'
                            : !rep.isInDb
                              ? `Inicializar en BD (${rep.codeVersion})`
                              : rep.needsSync
                                ? `Sincronizar a ${rep.codeVersion}`
                                : `Re-sincronizar (${rep.codeVersion})`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
