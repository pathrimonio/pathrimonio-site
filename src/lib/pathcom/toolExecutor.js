import {
  DEFAULT_PATHCOM_MODULE_FLAGS,
  canExecutePathcomTool,
  filterVisibleSiteProjects
} from './rbacPolicy.js';

export function isValidIanaTimeZone(tz) {
  if (!tz || typeof tz !== 'string') return 'America/Lima';
  try {
    Intl.DateTimeFormat('es-PE', { timeZone: tz }).format(new Date());
    return tz;
  } catch (_) {
    return 'America/Lima';
  }
}

/**
 * Formatea una marca temporal ISO en hora local exacta (ej. "28 Nov · 02:16").
 */
export function formatPathTimestamp(isoString, clientTimezone = 'America/Lima') {
  const safeTz = isValidIanaTimeZone(clientTimezone);
  const date = isoString ? new Date(isoString) : new Date();
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: '—', timeLabel: '--:--', compact: '— · --:--', timeZone: safeTz };
  }

  const datePart = new Intl.DateTimeFormat('es-PE', {
    timeZone: safeTz,
    day: '2-digit',
    month: 'short'
  })
    .format(date)
    .replace('.', '');

  const timePart = new Intl.DateTimeFormat('en-GB', {
    timeZone: safeTz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);

  const normalizedDate = datePart.replace(/\b([a-z])/g, (m) => m.toUpperCase());
  return {
    dateLabel: normalizedDate,
    timeLabel: timePart,
    compact: `${normalizedDate} · ${timePart}`,
    timeZone: safeTz
  };
}

function makeId(prefix) {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${new Date().getUTCFullYear()}-${stamp}${rand}`;
}

/**
 * Ejecuta una herramienta de Pathcom validando estrictamente RBAC antes de acceder al repositorio.
 */
export async function executePathcomTool({
  actor,
  toolName,
  operation,
  args = {},
  repo,
  featureFlags = DEFAULT_PATHCOM_MODULE_FLAGS
}) {
  const safeActor = actor || { roleCode: 'guest', userId: null, userEmail: null, userName: 'Visitante' };
  const authCheck = canExecutePathcomTool({
    roleCode: safeActor.roleCode,
    toolName,
    operation,
    featureFlags,
    targetUserId: args.user_id || null,
    actorUserId: safeActor.userId || null
  });

  if (!authCheck.allowed) {
    return {
      ok: false,
      rbac_denied: authCheck.code === 'RBAC_FORBIDDEN',
      code: authCheck.code,
      tool_name: toolName,
      operation,
      error: authCheck.reason
    };
  }

  if (toolName === 'path_log_tool') {
    return handlePathLogTool({ actor: safeActor, operation, args, repo });
  }
  if (toolName === 'market_curator_tool') {
    return handleMarketCuratorTool({ actor: safeActor, operation, args, repo });
  }
  if (toolName === 'projects_ops_tool') {
    return handleProjectsOpsTool({ actor: safeActor, operation, args, repo });
  }
  if (toolName === 'site_cms_tool') {
    return handleSiteCmsTool({ actor: safeActor, operation, args, repo });
  }
  if (toolName === 'pathway_bridge_tool') {
    return handlePathwayBridgeTool({ actor: safeActor, operation, args, repo });
  }

  return {
    ok: false,
    code: 'UNHANDLED_TOOL',
    tool_name: toolName,
    operation,
    error: `Herramienta "${toolName}" no implementada.`
  };
}

async function handlePathLogTool({ actor, operation, args, repo }) {
  if (operation === 'create_log') {
    const title = String(args.title || args.summary || '').trim();
    const content = String(args.content || args.description || title).trim();
    if (!title) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        tool_name: 'path_log_tool',
        operation,
        error: 'El título o descripción del avance es obligatorio.'
      };
    }

    // Sello temporal estrictamente asignado por servidor (se ignora cualquier fecha enviada por cliente)
    const serverRecordedAt = new Date().toISOString();
    const clientTimezone = isValidIanaTimeZone(args.client_timezone || actor.timezone);
    const parsedDuration =
      args.duration_minutes !== undefined && args.duration_minutes !== null && args.duration_minutes !== ''
        ? Math.max(0, Math.round(Number(args.duration_minutes) || 0))
        : null;
    const progressPercent = Math.min(100, Math.max(0, Math.round(Number(args.progress_percent ?? 25) || 0)));

    const logRecord = await repo.createPathLog({
      id: makeId('LOG'),
      user_id: actor.userId,
      user_email: actor.userEmail || null,
      user_name: actor.userName || actor.userEmail || 'Integrante Pathrimonio',
      market_path_id: args.market_path_id || null,
      title: title.slice(0, 140),
      content: content.slice(0, 1200),
      recorded_at: serverRecordedAt,
      client_timezone: clientTimezone,
      duration_minutes: parsedDuration,
      progress_percent: progressPercent,
      source: 'WEB',
      verified_timestamp: true,
      created_at: serverRecordedAt
    });

    const fmt = formatPathTimestamp(logRecord.recorded_at, logRecord.client_timezone);
    return {
      ok: true,
      tool_name: 'path_log_tool',
      operation,
      summary: `Avance registrado a las ${fmt.compact} (${fmt.timeZone}) · ${logRecord.progress_percent}%.`,
      data: { log: logRecord, formatted_time: fmt }
    };
  }

  if (operation === 'list_timeline') {
    const targetUserId = args.user_id || actor.userId || null;
    const isStaff = ['collaborator', 'admin'].includes(actor.roleCode);
    const isOwner = Boolean(actor.userId && targetUserId && actor.userId === targetUserId);
    const publicOnly = !isStaff && !isOwner;

    const logs = await repo.listPathLogs({
      userId: targetUserId,
      marketPathId: args.market_path_id || null,
      publicOnly,
      order: args.order === 'asc' ? 'asc' : 'desc'
    });

    return {
      ok: true,
      tool_name: 'path_log_tool',
      operation,
      summary: `${logs.length} registro(s) cronológico(s) encontrados.`,
      data: { logs, total: logs.length }
    };
  }

  if (operation === 'summarize_progress') {
    const targetUserId = args.user_id || actor.userId;
    const logs = await repo.listPathLogs({ userId: targetUserId, order: 'asc' });
    const totalMinutes = logs.reduce((acc, item) => acc + (Number(item.duration_minutes) || 0), 0);
    const latestProgress = logs.length > 0 ? Number(logs[logs.length - 1].progress_percent || 0) : 0;
    const pathwayCount = logs.filter((item) => item.source === 'PATHWAY').length;

    return {
      ok: true,
      tool_name: 'path_log_tool',
      operation,
      summary: `${logs.length} registros · ${totalMinutes} min invertidos · progreso actual ${latestProgress}%.`,
      data: {
        total_logs: logs.length,
        total_duration_minutes: totalMinutes,
        latest_progress_percent: latestProgress,
        pathway_imported_count: pathwayCount,
        logs
      }
    };
  }

  return { ok: false, code: 'UNKNOWN_OPERATION', tool_name: 'path_log_tool', operation, error: 'Operación no soportada.' };
}

async function handleMarketCuratorTool({ actor, operation, args, repo }) {
  if (operation === 'list_market') {
    const isStaff = ['collaborator', 'admin'].includes(actor.roleCode);
    const paths = await repo.listMarketPaths({
      category: args.category || null,
      includeDraftsForUserId: isStaff ? '__ALL__' : actor.userId || null
    });
    return {
      ok: true,
      tool_name: 'market_curator_tool',
      operation,
      summary: `${paths.length} ruta(s) disponible(s) en Pathrimonio Market.`,
      data: { paths }
    };
  }

  if (operation === 'get_market_path') {
    const pathItem = await repo.getMarketPathById(args.market_path_id || args.id);
    if (!pathItem) {
      return { ok: false, code: 'NOT_FOUND', tool_name: 'market_curator_tool', operation, error: 'Ruta no encontrada en el Market.' };
    }
    const validations = await repo.listPathValidations(pathItem.id);
    const logs = await repo.listPathLogs({ marketPathId: pathItem.id, order: 'asc' });
    return {
      ok: true,
      tool_name: 'market_curator_tool',
      operation,
      summary: `Ruta "${pathItem.title}" con ${logs.length} registro(s) auditables.`,
      data: { path: pathItem, validations, timeline_logs: logs }
    };
  }

  if (operation === 'compile_logs_to_path') {
    const userLogs = await repo.listPathLogs({ userId: actor.userId, order: 'asc' });
    const requestedIds = Array.isArray(args.log_ids) && args.log_ids.length > 0 ? new Set(args.log_ids) : null;
    const selectedLogs = requestedIds
      ? userLogs.filter((l) => requestedIds.has(l.id))
      : userLogs.slice(-10);

    if (selectedLogs.length === 0) {
      return {
        ok: false,
        code: 'EMPTY_LOGS',
        tool_name: 'market_curator_tool',
        operation,
        error: 'Primero registra al menos un avance en tu línea de tiempo antes de compilar una ruta.'
      };
    }

    const marketPathId = makeId('MP');
    const title = String(args.title || `Guía operativa: ${selectedLogs[selectedLogs.length - 1].title}`).trim().slice(0, 140);
    const totalMinutes = selectedLogs.reduce((acc, item) => acc + (Number(item.duration_minutes) || 0), 0);
    const stepsJson = selectedLogs.map((l) => ({
      log_id: l.id,
      title: l.title,
      content: l.content,
      recorded_at: l.recorded_at,
      client_timezone: l.client_timezone || 'America/Lima',
      duration_minutes: l.duration_minutes,
      progress_percent: l.progress_percent,
      source: l.source || 'WEB'
    }));

    const summary =
      String(args.summary || '').trim() ||
      `Ruta compilada a partir de ${selectedLogs.length} registro(s) reales (${totalMinutes} min acumulados).`;

    const savedPath = await repo.saveMarketPath({
      id: marketPathId,
      author_user_id: actor.userId,
      author_name: actor.userName || actor.userEmail || 'Integrante Pathrimonio',
      author_email: actor.userEmail || null,
      title,
      category: String(args.category || 'Operación PYME').trim(),
      summary,
      steps_json: stepsJson,
      status: args.submit_immediately ? 'PEER_REVIEW' : 'DRAFT',
      is_patrimonio_validated: false,
      avg_rating: 0,
      validations_count: 0,
      total_duration_minutes: totalMinutes,
      published_at: args.submit_immediately ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await repo.linkLogsToMarketPath(
      selectedLogs.map((l) => l.id),
      marketPathId
    );

    return {
      ok: true,
      tool_name: 'market_curator_tool',
      operation,
      summary: `Guía "${savedPath.title}" (${savedPath.status}) compilada con ${selectedLogs.length} registros vinculados (${marketPathId}).`,
      data: { market_path: savedPath, linked_log_ids: selectedLogs.map((l) => l.id) }
    };
  }

  if (operation === 'submit_for_review') {
    const pathId = args.market_path_id || args.id;
    const existing = await repo.getMarketPathById(pathId);
    if (!existing) {
      return { ok: false, code: 'NOT_FOUND', tool_name: 'market_curator_tool', operation, error: 'Ruta no encontrada.' };
    }
    const isStaff = ['collaborator', 'admin'].includes(actor.roleCode);
    if (existing.author_user_id !== actor.userId && !isStaff) {
      return {
        ok: false,
        rbac_denied: true,
        code: 'RBAC_FORBIDDEN',
        tool_name: 'market_curator_tool',
        operation,
        error: 'Solo el autor de la ruta o el equipo técnico puede enviarla a revisión.'
      };
    }

    if (args.request_patrimonio_validated) {
      const queued = await repo.enqueueAction({
        id: makeId('PAQ'),
        requested_by_user_id: actor.userId,
        requested_by_email: actor.userEmail || null,
        requested_by_role: actor.roleCode,
        tool_name: 'market_curator_tool',
        action_summary: `Certificar "${existing.title}" como PATRIMONIO_VALIDADO`,
        payload_json: {
          kind: 'certify_market_path',
          market_path_id: existing.id,
          requires_admin_certification: true
        },
        status: 'PENDING',
        created_at: new Date().toISOString()
      });

      return {
        ok: true,
        tool_name: 'market_curator_tool',
        operation,
        summary: `Solicitud de certificación PATRIMONIO_VALIDADO enviada a la Bandeja de Aprobaciones (${queued.id}).`,
        data: { queued_action: queued, market_path: existing }
      };
    }

    const updated = await repo.saveMarketPath({
      ...existing,
      status: 'PEER_REVIEW',
      published_at: existing.published_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return {
      ok: true,
      tool_name: 'market_curator_tool',
      operation,
      summary: `Ruta "${updated.title}" publicada en revisión por pares (PEER_REVIEW) en Pathrimonio Market.`,
      data: { market_path: updated }
    };
  }

  if (operation === 'record_validation') {
    const pathId = args.market_path_id || args.id;
    const existing = await repo.getMarketPathById(pathId);
    if (!existing) {
      return { ok: false, code: 'NOT_FOUND', tool_name: 'market_curator_tool', operation, error: 'Ruta no encontrada.' };
    }
    if (existing.author_user_id === actor.userId) {
      return {
        ok: false,
        code: 'SELF_VALIDATION_BLOCKED',
        tool_name: 'market_curator_tool',
        operation,
        error: 'No puedes calificar tu propia ruta en Pathrimonio Market.'
      };
    }

    const score = Math.min(5, Math.max(1, Math.round(Number(args.score) || 0)));
    if (score < 1 || score > 5) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        tool_name: 'market_curator_tool',
        operation,
        error: 'La calificación debe estar entre 1 y 5.'
      };
    }

    const weight = ['partner', 'collaborator', 'admin'].includes(actor.roleCode) ? 1.5 : 1.0;
    const savedValidation = await repo.savePathValidation({
      id: makeId('VAL'),
      market_path_id: existing.id,
      validator_user_id: actor.userId,
      validator_name: actor.userName || actor.userEmail || 'Validador Pathrimonio',
      validator_role: actor.roleCode,
      score,
      feedback: String(args.feedback || '').trim().slice(0, 600),
      validator_weight: weight,
      created_at: new Date().toISOString()
    });

    const refreshedPath = await repo.recomputeMarketPathRating(existing.id);
    return {
      ok: true,
      tool_name: 'market_curator_tool',
      operation,
      summary: `Calificación (${score}/5) registrada sobre "${existing.title}". Promedio actual: ${refreshedPath.avg_rating}/5.`,
      data: { validation: savedValidation, market_path: refreshedPath }
    };
  }

  return { ok: false, code: 'UNKNOWN_OPERATION', tool_name: 'market_curator_tool', operation, error: 'Operación no soportada.' };
}

async function handleProjectsOpsTool({ actor, operation, args, repo }) {
  if (operation === 'list_projects') {
    const allProjects = await repo.listSiteProjects();
    const visible = filterVisibleSiteProjects(allProjects, actor);
    return {
      ok: true,
      tool_name: 'projects_ops_tool',
      operation,
      summary: `${visible.length} proyecto(s) accesible(s) para el rol ${actor.roleCode}.`,
      data: { projects: visible }
    };
  }

  if (operation === 'update_project_draft') {
    const projectId = String(args.project_id || args.id || '').trim();
    if (!projectId) {
      return { ok: false, code: 'VALIDATION_ERROR', tool_name: 'projects_ops_tool', operation, error: 'Se requiere project_id.' };
    }
    const draft = await repo.saveSiteProjectDraft({
      id: projectId,
      draft_name: args.name || args.draft_name,
      draft_status: args.status || args.draft_status,
      draft_summary: args.summary || args.draft_summary || args.public_summary
    });
    return {
      ok: true,
      tool_name: 'projects_ops_tool',
      operation,
      summary: `Borrador DRAFT actualizado para "${draft.draft_name || draft.name}" sin alterar la portada pública.`,
      data: { project: draft }
    };
  }

  if (operation === 'get_formalia_summary') {
    const sessions = await repo.listFormaliaSessionsSummary();
    return {
      ok: true,
      tool_name: 'projects_ops_tool',
      operation,
      summary: `${sessions.length} expediente(s) reciente(s) de Formalia disponibles para revisión.`,
      data: { sessions }
    };
  }

  return { ok: false, code: 'UNKNOWN_OPERATION', tool_name: 'projects_ops_tool', operation, error: 'Operación no soportada.' };
}

async function handleSiteCmsTool({ actor, operation, args, repo }) {
  const projectId = String(args.project_id || args.id || 'core-hub').trim();

  if (operation === 'create_section_draft') {
    const draft = await repo.saveSiteProjectDraft({
      id: projectId,
      draft_name: args.draft_name || args.name,
      draft_status: args.draft_status || args.status,
      draft_summary: args.draft_summary || args.public_summary || args.summary
    });
    return {
      ok: true,
      tool_name: 'site_cms_tool',
      operation,
      summary: `Borrador CMS guardado en estado DRAFT para "${draft.draft_name || draft.name}". La portada pública permanece intacta hasta aprobarlo.`,
      data: { project: draft }
    };
  }

  if (operation === 'request_publish') {
    const all = await repo.listSiteProjects();
    const target = all.find((p) => p.id === projectId);
    const draft =
      target && (args.draft_name || args.draft_summary || args.draft_status)
        ? await repo.saveSiteProjectDraft({
            id: projectId,
            draft_name: args.draft_name || target.draft_name || target.name,
            draft_status: args.draft_status || target.draft_status || target.status,
            draft_summary: args.draft_summary || args.public_summary || target.draft_summary || target.public_summary
          })
        : target ||
          (await repo.saveSiteProjectDraft({
            id: projectId,
            draft_name: args.draft_name || args.name || 'Nuevo Proyecto Pathrimonio',
            draft_status: args.draft_status || args.status || 'IN_PROGRESS',
            draft_summary: args.draft_summary || args.public_summary || 'Proyecto operativo estructurado por roles.'
          }));

    const queued = await repo.enqueueAction({
      id: makeId('PAQ'),
      requested_by_user_id: actor.userId,
      requested_by_email: actor.userEmail || null,
      requested_by_role: actor.roleCode,
      tool_name: 'site_cms_tool',
      action_summary: `Publicar cambios web para proyecto "${draft.draft_name || draft.name}"`,
      payload_json: {
        kind: 'publish_site_project',
        project_id: draft.id,
        previous_live: {
          name: draft.name,
          status: draft.status,
          public_summary: draft.public_summary,
          is_published: Boolean(draft.is_published)
        },
        proposed_live: {
          name: draft.draft_name || draft.name,
          status: draft.draft_status || draft.status || 'LIVE',
          public_summary: draft.draft_summary || draft.public_summary,
          is_published: true
        }
      },
      status: 'PENDING',
      created_at: new Date().toISOString()
    });

    return {
      ok: true,
      tool_name: 'site_cms_tool',
      operation,
      summary: `Solicitud ${queued.id} encolada en pathcom_action_queue para aprobación humana antes de publicar en pathrimonio.site.`,
      data: { queued_action: queued, project_draft: draft }
    };
  }

  return { ok: false, code: 'UNKNOWN_OPERATION', tool_name: 'site_cms_tool', operation, error: 'Operación no soportada.' };
}

async function handlePathwayBridgeTool({ actor, operation, args, repo }) {
  const targetUserId = args.user_id && ['collaborator', 'admin'].includes(actor.roleCode) ? args.user_id : actor.userId;
  const milestones = await repo.fetchPathwayMilestones({
    userId: targetUserId,
    userEmail: actor.userEmail
  });

  if (operation === 'fetch_user_milestones') {
    return {
      ok: true,
      tool_name: 'pathway_bridge_tool',
      operation,
      summary: `${milestones.length} hito(s) detectado(s) desde Pathway para sincronización.`,
      data: { milestones }
    };
  }

  if (operation === 'import_pathway_logs') {
    const existingLogs = await repo.listPathLogs({ userId: targetUserId, order: 'asc' });
    const seenExternalIds = new Set(existingLogs.map((l) => l.external_ref_id).filter(Boolean));
    const clientTz = isValidIanaTimeZone(args.client_timezone || actor.timezone);
    const imported = [];

    for (const m of milestones) {
      if (seenExternalIds.has(m.external_ref_id)) continue;
      const inserted = await repo.createPathLog({
        id: makeId('LOG'),
        user_id: targetUserId,
        user_email: actor.userEmail || null,
        user_name: actor.userName || actor.userEmail || 'Socio Pathway',
        market_path_id: null,
        title: m.title,
        content: m.content,
        recorded_at: m.recorded_at || new Date().toISOString(),
        client_timezone: m.client_timezone || clientTz,
        duration_minutes: m.duration_minutes ?? 30,
        progress_percent: m.progress_percent ?? 50,
        source: 'PATHWAY',
        external_ref_id: m.external_ref_id,
        verified_timestamp: true,
        created_at: new Date().toISOString()
      });
      imported.push(inserted);
    }

    return {
      ok: true,
      tool_name: 'pathway_bridge_tool',
      operation,
      summary:
        imported.length > 0
          ? `${imported.length} avance(s) importado(s) desde Pathway con su marca de tiempo original.`
          : 'Tus metas de Pathway ya estaban sincronizadas al día (sin duplicados).',
      data: { imported_logs: imported, total_milestones_checked: milestones.length }
    };
  }

  return { ok: false, code: 'UNKNOWN_OPERATION', tool_name: 'pathway_bridge_tool', operation, error: 'Operación no soportada.' };
}
