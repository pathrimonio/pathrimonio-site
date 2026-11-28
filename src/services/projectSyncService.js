import { INITIAL_PROJECTS } from '../data/initialProjects.js';
import { INITIAL_ACTORS } from '../data/initialActors.js';
import { INITIAL_STORIES } from '../data/initialStories.js';
import { INITIAL_INTERFACES } from '../data/initialInterfaces.js';
import { INITIAL_DATA_MODELS } from '../data/initialDataModels.js';
import { INITIAL_FILES } from '../data/initialFiles.js';
import { PATHRIMONIO_SITE_PROJECT } from '../data/pathrimonioSiteData.js';
import { isSupabaseConfigured } from '../lib/supabase.js';
import {
  saveProject,
  saveActor,
  saveStory,
  saveDataModel,
  saveInterface,
  saveFile
} from '../lib/supabaseData.js';
import {
  computeLiveDiffsAgainstBaseline,
  recordSystemAudit
} from './platformService.js';

export const PLATFORM_IMPLEMENTED_VERSION = PATHRIMONIO_SITE_PROJECT.version || 'v1.2.0';
const AUTO_SYNC_PREF_KEY = 'pathrimonio_projects_autosync_v1';
const AUTO_SYNC_LOCK_KEY = 'pathrimonio_projects_autosync_lock_v1';

export function getAutoSyncEnabled() {
  if (typeof localStorage === 'undefined') return true;
  try {
    const val = localStorage.getItem(AUTO_SYNC_PREF_KEY);
    return val === null ? true : val !== 'false';
  } catch (_) {
    return true;
  }
}

export function setAutoSyncEnabled(enabled) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(AUTO_SYNC_PREF_KEY, enabled ? 'true' : 'false');
  } catch (_) {}
}

export function getCatalogBundleForProject(projectId) {
  const project = INITIAL_PROJECTS.find((p) => p.id === projectId) || null;
  if (!project) return null;
  return {
    project,
    actors: INITIAL_ACTORS.filter((a) => a.projectId === projectId),
    stories: INITIAL_STORIES.filter((s) => s.projectId === projectId),
    interfaces: INITIAL_INTERFACES.filter((i) => i.projectId === projectId),
    dataModels: INITIAL_DATA_MODELS.filter((d) => d.projectId === projectId),
    files: INITIAL_FILES.filter((f) => f.projectId === projectId)
  };
}

function normText(v) {
  return String(v || '').replace(/\s+/g, ' ').trim();
}

function computeMissingAndOutdated(codeList = [], dbList = [], isOutdatedFn) {
  const dbMap = new Map((dbList || []).map((item) => [item.id, item]));
  const missing = [];
  const outdated = [];

  (codeList || []).forEach((codeItem) => {
    const existing = dbMap.get(codeItem.id);
    if (!existing) {
      missing.push(codeItem);
    } else if (isOutdatedFn && isOutdatedFn(codeItem, existing)) {
      outdated.push(codeItem);
    }
  });

  return { missing, outdated };
}

function isActorOutdated(codeActor, dbActor) {
  return (
    normText(codeActor.name) !== normText(dbActor.name) ||
    normText(codeActor.category) !== normText(dbActor.category) ||
    normText(codeActor.permissionLevel) !== normText(dbActor.permissionLevel) ||
    Boolean(codeActor.isPrimaryRole) !== Boolean(dbActor.isPrimaryRole) ||
    normText(codeActor.description) !== normText(dbActor.description)
  );
}

function isStoryOutdated(codeStory, dbStory) {
  return (
    normText(codeStory.role) !== normText(dbStory.role) ||
    normText(codeStory.module) !== normText(dbStory.module) ||
    normText(codeStory.priority) !== normText(dbStory.priority) ||
    normText(codeStory.action) !== normText(dbStory.action) ||
    (codeStory.criteria || []).length !== (dbStory.criteria || []).length
  );
}

function isDataModelOutdated(codeModel, dbModel) {
  return (
    normText(codeModel.name) !== normText(dbModel.name) ||
    normText(codeModel.tableName) !== normText(dbModel.tableName) ||
    (codeModel.attributes || []).length > (dbModel.attributes || []).length
  );
}

function isInterfaceOutdated(codeIface, dbIface) {
  return (
    normText(codeIface.title) !== normText(dbIface.title) ||
    normText(codeIface.module) !== normText(dbIface.module)
  );
}

function isFileOutdated(codeFile, dbFile) {
  return (
    normText(codeFile.name) !== normText(dbFile.name) ||
    normText(codeFile.version) !== normText(dbFile.version)
  );
}

function isProjectMetaOutdated(codeProj, dbProj) {
  if (!dbProj) return true;
  if (normText(codeProj.version) !== normText(dbProj.version)) return true;
  if (normText(codeProj.status) !== normText(dbProj.status)) return true;
  const codeMods = Array.isArray(codeProj.modules) ? codeProj.modules : [];
  const dbMods = Array.isArray(dbProj.modules) ? dbProj.modules : [];
  if (codeMods.some((m) => !dbMods.includes(m))) return true;
  return false;
}

/**
 * Construye el reporte comparativo entre el catálogo/versión implementada en código
 * y los registros reales persistidos en Supabase por cada proyecto.
 */
export function buildProjectSyncReports({
  dbProjects = [],
  dbActors = [],
  dbStories = [],
  dbInterfaces = [],
  dbDataModels = [],
  dbFiles = [],
  implementationRequests = []
} = {}) {
  const byId = new Map();
  INITIAL_PROJECTS.forEach((p) => {
    byId.set(p.id, { codeProject: p, dbProject: null });
  });
  (dbProjects || []).forEach((p) => {
    if (!p?.id) return;
    const prev = byId.get(p.id) || { codeProject: null, dbProject: null };
    byId.set(p.id, { ...prev, dbProject: p });
  });

  const reports = [];

  for (const [projectId, pair] of byId.entries()) {
    const { codeProject, dbProject } = pair;
    const pActors = (dbActors || []).filter((a) => a.projectId === projectId);
    const pStories = (dbStories || []).filter((s) => s.projectId === projectId);
    const pInterfaces = (dbInterfaces || []).filter((i) => i.projectId === projectId);
    const pModels = (dbDataModels || []).filter((m) => m.projectId === projectId);
    const pFiles = (dbFiles || []).filter((f) => f.projectId === projectId);

    if (codeProject) {
      const codeBundle = getCatalogBundleForProject(projectId);
      const actorDiff = computeMissingAndOutdated(codeBundle.actors, pActors, isActorOutdated);
      const storyDiff = computeMissingAndOutdated(codeBundle.stories, pStories, isStoryOutdated);
      const ifaceDiff = computeMissingAndOutdated(codeBundle.interfaces, pInterfaces, isInterfaceOutdated);
      const modelDiff = computeMissingAndOutdated(codeBundle.dataModels, pModels, isDataModelOutdated);
      const fileDiff = computeMissingAndOutdated(codeBundle.files, pFiles, isFileOutdated);

      const metaOutdated = isProjectMetaOutdated(codeProject, dbProject);
      const versionMismatch = Boolean(!dbProject || normText(codeProject.version) !== normText(dbProject.version));
      const pendingEntityUpdates =
        actorDiff.missing.length +
        actorDiff.outdated.length +
        storyDiff.missing.length +
        storyDiff.outdated.length +
        ifaceDiff.missing.length +
        ifaceDiff.outdated.length +
        modelDiff.missing.length +
        modelDiff.outdated.length +
        fileDiff.missing.length +
        fileDiff.outdated.length;

      const needsSync = Boolean(!dbProject || metaOutdated || pendingEntityUpdates > 0);
      const statusCode = !dbProject
        ? 'uninitialized'
        : needsSync
          ? 'outdated'
          : 'up_to_date';

      const diffDetails = [
        ...(versionMismatch && dbProject
          ? [`Versión en BD (${dbProject.version || 'N/A'}) difiere de la implementada (${codeProject.version})`]
          : []),
        ...actorDiff.missing.map((a) => `Actor faltante: ${a.id} (${a.name})`),
        ...actorDiff.outdated.map((a) => `Actor desactualizado: ${a.id} (${a.name})`),
        ...storyDiff.missing.map((s) => `Historia faltante: ${s.id} (${s.role})`),
        ...storyDiff.outdated.map((s) => `Historia desactualizada: ${s.id} (${s.role})`),
        ...ifaceDiff.missing.map((i) => `Interfaz faltante: ${i.id} (${i.title})`),
        ...ifaceDiff.outdated.map((i) => `Interfaz desactualizada: ${i.id} (${i.title})`),
        ...modelDiff.missing.map((m) => `Tabla SQL faltante: ${m.id} (${m.tableName})`),
        ...modelDiff.outdated.map((m) => `Tabla SQL desactualizada: ${m.id} (${m.tableName})`),
        ...fileDiff.missing.map((f) => `Archivo faltante: ${f.id} (${f.name})`),
        ...fileDiff.outdated.map((f) => `Archivo desactualizado: ${f.id} (${f.name})`)
      ];

      reports.push({
        id: projectId,
        project: dbProject || codeProject,
        codeProject,
        dbProject,
        isCatalogProject: true,
        isInDb: Boolean(dbProject),
        codeVersion: codeProject.version || 'v1.0.0',
        dbVersion: dbProject?.version || 'Sin registro en BD',
        versionMismatch,
        metaOutdated,
        needsSync,
        pendingChangesCount: pendingEntityUpdates + (metaOutdated ? 1 : 0),
        statusCode,
        statusLabel:
          statusCode === 'uninitialized'
            ? 'Solo en Código (No inicializado en BD)'
            : statusCode === 'outdated'
              ? 'Desactualizado vs Implementación'
              : `Actualizado · ${codeProject.version || 'v1.0.0'}`,
        counts: {
          actors: { db: pActors.length, code: codeBundle.actors.length, missing: actorDiff.missing.length, outdated: actorDiff.outdated.length },
          stories: { db: pStories.length, code: codeBundle.stories.length, missing: storyDiff.missing.length, outdated: storyDiff.outdated.length },
          interfaces: { db: pInterfaces.length, code: codeBundle.interfaces.length, missing: ifaceDiff.missing.length, outdated: ifaceDiff.outdated.length },
          dataModels: { db: pModels.length, code: codeBundle.dataModels.length, missing: modelDiff.missing.length, outdated: modelDiff.outdated.length },
          files: { db: pFiles.length, code: codeBundle.files.length, missing: fileDiff.missing.length, outdated: fileDiff.outdated.length }
        },
        diffs: {
          actors: actorDiff,
          stories: storyDiff,
          interfaces: ifaceDiff,
          dataModels: modelDiff,
          files: fileDiff
        },
        diffDetails,
        liveDiffsCount: 0,
        implementationRequest: null
      });
    } else if (dbProject) {
      const req = (implementationRequests || []).find((r) => r.project_id === projectId) || null;
      const liveDiffs = req
        ? computeLiveDiffsAgainstBaseline(req, dbActors, dbStories, dbInterfaces)
        : [];
      const pendingReviewDiffs = liveDiffs.filter((d) => d.review_status === 'pending').length;
      const snap = req?.submitted_snapshot || {};
      const needsReview = pendingReviewDiffs > 0;

      reports.push({
        id: projectId,
        project: dbProject,
        codeProject: null,
        dbProject,
        isCatalogProject: false,
        isInDb: true,
        codeVersion: req ? 'Snapshot Web' : (dbProject.version || 'v0.1.0'),
        dbVersion: dbProject.version || 'v0.1.0',
        versionMismatch: false,
        metaOutdated: false,
        needsSync: false,
        pendingChangesCount: pendingReviewDiffs,
        statusCode: needsReview ? 'client_diffs' : 'up_to_date',
        statusLabel: needsReview
          ? `${pendingReviewDiffs} Diff(s) Post-Envío por Revisar`
          : `Actualizado · ${dbProject.version || 'v0.1.0'}`,
        counts: {
          actors: { db: pActors.length, code: (snap.actors || []).length || pActors.length, missing: 0, outdated: 0 },
          stories: { db: pStories.length, code: (snap.stories || []).length || pStories.length, missing: 0, outdated: 0 },
          interfaces: { db: pInterfaces.length, code: (snap.interfaces || []).length || pInterfaces.length, missing: 0, outdated: 0 },
          dataModels: { db: pModels.length, code: (snap.dataModels || []).length || pModels.length, missing: 0, outdated: 0 },
          files: { db: pFiles.length, code: pFiles.length, missing: 0, outdated: 0 }
        },
        diffs: null,
        diffDetails: liveDiffs.map((d) => `${d.entity_type} ${d.entity_id}: ${d.change_kind} (${d.review_status})`),
        liveDiffsCount: pendingReviewDiffs,
        implementationRequest: req
      });
    }
  }

  return reports.sort((a, b) => {
    if (a.id === 'pathrimonio-site') return -1;
    if (b.id === 'pathrimonio-site') return 1;
    if (a.needsSync !== b.needsSync) return a.needsSync ? -1 : 1;
    return String(a.project?.name || '').localeCompare(String(b.project?.name || ''));
  });
}

function mergeListById(existingList = [], incomingList = []) {
  const safeExisting = Array.isArray(existingList) ? existingList : [];
  const safeIncoming = Array.isArray(incomingList) ? incomingList : [];
  const byId = new Map(safeIncoming.map((item) => [item.id, item]));
  return [
    ...safeIncoming,
    ...safeExisting.filter((item) => item && !byId.has(item.id))
  ];
}

/**
 * Sincroniza un proyecto del catálogo implementado hacia Supabase y devuelve
 * los nuevos arrays de estado para refrescar el Portal sin recargar.
 */
export async function syncProjectFromCodeCatalog(
  projectId,
  {
    projects = [],
    actors = [],
    stories = [],
    interfaces = [],
    dataModels = [],
    files = [],
    implementationRequests = []
  } = {},
  actorUser = null
) {
  const codeBundle = getCatalogBundleForProject(projectId);
  if (!codeBundle) {
    throw new Error(`El proyecto "${projectId}" no pertenece al catálogo SDD en código.`);
  }

  const reports = buildProjectSyncReports({
    dbProjects: projects,
    dbActors: actors,
    dbStories: stories,
    dbInterfaces: interfaces,
    dbDataModels: dataModels,
    dbFiles: files,
    implementationRequests
  });
  const report = reports.find((r) => r.id === projectId);

  const actorsToUpsert = [...(report?.diffs?.actors?.missing || []), ...(report?.diffs?.actors?.outdated || [])];
  const storiesToUpsert = [...(report?.diffs?.stories?.missing || []), ...(report?.diffs?.stories?.outdated || [])];
  const modelsToUpsert = [...(report?.diffs?.dataModels?.missing || []), ...(report?.diffs?.dataModels?.outdated || [])];
  const ifacesToUpsert = [...(report?.diffs?.interfaces?.missing || []), ...(report?.diffs?.interfaces?.outdated || [])];
  const filesToUpsert = [...(report?.diffs?.files?.missing || []), ...(report?.diffs?.files?.outdated || [])];

  const existingDbProj = projects.find((p) => p.id === projectId) || null;
  const mergedProj = {
    ...(existingDbProj || {}),
    ...codeBundle.project,
    modules: Array.from(
      new Set([
        ...(Array.isArray(codeBundle.project.modules) ? codeBundle.project.modules : []),
        ...(Array.isArray(existingDbProj?.modules) ? existingDbProj.modules : [])
      ])
    )
  };

  const nextProjects = mergeListById(projects, [mergedProj]);
  const nextActors = mergeListById(actors, actorsToUpsert);
  const nextStories = mergeListById(stories, storiesToUpsert);
  const nextModels = mergeListById(dataModels, modelsToUpsert);
  const nextInterfaces = mergeListById(interfaces, ifacesToUpsert);
  const nextFiles = mergeListById(files, filesToUpsert);

  if (isSupabaseConfigured) {
    await saveProject(mergedProj);
    for (const a of actorsToUpsert) {
      await saveActor(a);
    }
    for (const s of storiesToUpsert) {
      await saveStory(s);
    }

    const validStoryIds = new Set(nextStories.filter((s) => s.projectId === projectId).map((s) => s.id));
    const validIfaceIds = new Set(nextInterfaces.filter((i) => i.projectId === projectId).map((i) => i.id));
    const validModelIds = new Set(nextModels.filter((m) => m.projectId === projectId).map((m) => m.id));
    const actorIdLookup = (roleName, pId) => {
      const match = nextActors.find(
        (a) => a.name === roleName && (!a.projectId || a.projectId === (pId || projectId))
      );
      return match?.id || null;
    };

    for (const dm of modelsToUpsert) {
      await saveDataModel(dm, validStoryIds, validIfaceIds);
    }
    for (const iface of ifacesToUpsert) {
      await saveInterface(iface, actorIdLookup, validModelIds, validStoryIds);
    }
    for (const f of filesToUpsert) {
      await saveFile(f);
    }

    await recordSystemAudit({
      actorEmail: actorUser?.email || 'system@pathrimonio.org',
      actorRole: actorUser?.role || 'Sistema',
      actionType: 'sync_project_spec',
      targetId: projectId,
      summary: `Sincronizó proyecto "${projectId}" a ${mergedProj.version} (+${actorsToUpsert.length} actores, +${storiesToUpsert.length} HUs, +${ifacesToUpsert.length} interfaces, +${modelsToUpsert.length} tablas, +${filesToUpsert.length} archivos).`
    });
  }

  return {
    projectId,
    version: mergedProj.version,
    syncedEntities:
      actorsToUpsert.length +
      storiesToUpsert.length +
      modelsToUpsert.length +
      ifacesToUpsert.length +
      filesToUpsert.length,
    nextState: {
      projects: nextProjects,
      actors: nextActors,
      stories: nextStories,
      dataModels: nextModels,
      interfaces: nextInterfaces,
      files: nextFiles
    }
  };
}

/**
 * Al iniciar el Portal con un usuario interno (Admin/Colaborador), sincroniza automáticamente
 * proyectos del catálogo ya presentes en BD que estén atrasados respecto al código desplegado.
 */
export async function autoSyncExistingCatalogProjects(workspaceState, actorUser) {
  if (!getAutoSyncEnabled()) {
    return { syncedIds: [], nextState: workspaceState };
  }

  // Evita que múltiples pestañas abiertas del mismo origen disparen upsert/auditoría duplicados al unísono
  if (typeof localStorage !== 'undefined') {
    try {
      const lockUntil = Number(localStorage.getItem(AUTO_SYNC_LOCK_KEY) || 0);
      if (Number.isFinite(lockUntil) && lockUntil > Date.now()) {
        return { syncedIds: [], nextState: workspaceState };
      }
      localStorage.setItem(AUTO_SYNC_LOCK_KEY, String(Date.now() + 15000));
    } catch (_) {}
  }

  const reports = buildProjectSyncReports({
    dbProjects: workspaceState.projects,
    dbActors: workspaceState.actors,
    dbStories: workspaceState.stories,
    dbInterfaces: workspaceState.interfaces,
    dbDataModels: workspaceState.dataModels,
    dbFiles: workspaceState.files,
    implementationRequests: workspaceState.implementationRequests
  });

  const targets = reports.filter((r) => r.isCatalogProject && r.isInDb && r.needsSync);
  if (targets.length === 0) {
    if (typeof localStorage !== 'undefined') {
      try { localStorage.removeItem(AUTO_SYNC_LOCK_KEY); } catch (_) {}
    }
    return { syncedIds: [], nextState: workspaceState };
  }

  let rollingState = { ...workspaceState };
  const syncedIds = [];

  for (const target of targets) {
    try {
      const res = await syncProjectFromCodeCatalog(target.id, rollingState, actorUser);
      rollingState = {
        ...rollingState,
        ...res.nextState
      };
      syncedIds.push(target.id);
    } catch (err) {
      console.warn(`[ProjectAutoSync] ${target.id}:`, err?.message || err);
    }
  }

  return { syncedIds, nextState: rollingState };
}
