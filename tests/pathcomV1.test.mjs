import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryPathcomRepo } from '../api/_lib/pathcomStore.js';
import {
  DEFAULT_PATHCOM_MODULE_FLAGS,
  canExecutePathcomTool,
  canReviewApprovalItem,
  filterVisibleSiteProjects
} from '../src/lib/pathcom/rbacPolicy.js';
import { executePathcomTool, formatPathTimestamp } from '../src/lib/pathcom/toolExecutor.js';
import { runPathcomAgentTurn } from '../src/lib/pathcom/agentEngine.js';
import pathcomHandler from '../api/v1/pathcom.js';

function makeActor(roleCode, userId = `USR-${roleCode.toUpperCase()}`, email = `${roleCode}@pathrimonio.org`) {
  return {
    authenticated: roleCode !== 'guest',
    roleCode,
    userId: roleCode === 'guest' ? null : userId,
    userEmail: roleCode === 'guest' ? null : email,
    userName: roleCode === 'guest' ? 'Visitante' : `Test ${roleCode}`,
    timezone: 'America/Lima'
  };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    }
  };
  return res;
}

test('Criterio 1: path_logs sella recorded_at en servidor ignorando manipulación del cliente y formatea hora local HH:mm', async () => {
  const repo = createMemoryPathcomRepo();
  const userActor = makeActor('user', 'USR-TIMELINE-1');
  const forgedDate = '1999-01-01T00:00:00Z';

  const result = await executePathcomTool({
    actor: userActor,
    toolName: 'path_log_tool',
    operation: 'create_log',
    args: {
      title: 'Cierre de caja diaria por turno',
      content: 'Se validó arqueo ciego en turno tarde.',
      recorded_at: forgedDate,
      duration_minutes: 45,
      progress_percent: 65,
      client_timezone: 'America/Lima'
    },
    repo
  });

  assert.equal(result.ok, true);
  assert.notEqual(result.data.log.recorded_at, forgedDate);
  assert.equal(result.data.log.verified_timestamp, true);
  assert.equal(result.data.log.client_timezone, 'America/Lima');

  const formatted = formatPathTimestamp('2026-11-28T07:16:00Z', 'America/Lima');
  assert.equal(formatted.timeLabel, '02:16');
  assert.match(formatted.compact, /02:16$/);
});

test('Criterio 2: Aislamiento RBAC estricto para guest, user, partner, collaborator y admin', async () => {
  const repo = createMemoryPathcomRepo();
  const guest = makeActor('guest');
  const user = makeActor('user');
  const partner = makeActor('partner');
  const collaborator = makeActor('collaborator');

  // Guest NO puede crear path_logs
  const guestCreateLog = await executePathcomTool({
    actor: guest,
    toolName: 'path_log_tool',
    operation: 'create_log',
    args: { title: 'Intento sin sesión' },
    repo
  });
  assert.equal(guestCreateLog.ok, false);
  assert.equal(guestCreateLog.rbac_denied, true);

  // User NO puede publicar en la landing ni ver expedientes privados de Formalia
  const userPublishTurn = await runPathcomAgentTurn({
    message: 'Publicar cambios en la landing web ahora mismo para proyecto core-hub',
    actor: user,
    repo
  });
  assert.equal(userPublishTurn.rbac_denied, true);
  assert.match(userPublishTurn.reply_text, /permisos/i);

  const userFormalia = await executePathcomTool({
    actor: user,
    toolName: 'projects_ops_tool',
    operation: 'get_formalia_summary',
    args: {},
    repo
  });
  assert.equal(userFormalia.ok, false);
  assert.equal(userFormalia.rbac_denied, true);

  // Partner puede usar pathway_bridge_tool pero user NO
  const userPathway = await executePathcomTool({
    actor: user,
    toolName: 'pathway_bridge_tool',
    operation: 'import_pathway_logs',
    args: {},
    repo
  });
  assert.equal(userPathway.ok, false);
  assert.equal(userPathway.rbac_denied, true);

  const partnerPathway = await executePathcomTool({
    actor: partner,
    toolName: 'pathway_bridge_tool',
    operation: 'import_pathway_logs',
    args: {},
    repo
  });
  assert.equal(partnerPathway.ok, true);
  assert.equal(partnerPathway.data.imported_logs.length, 1);
  assert.equal(partnerPathway.data.imported_logs[0].source, 'PATHWAY');

  // Evitar doble importación en Pathway Bridge
  const partnerPathwayAgain = await executePathcomTool({
    actor: partner,
    toolName: 'pathway_bridge_tool',
    operation: 'import_pathway_logs',
    args: {},
    repo
  });
  assert.equal(partnerPathwayAgain.ok, true);
  assert.equal(partnerPathwayAgain.data.imported_logs.length, 0);

  // Collaborator SÍ accede a get_formalia_summary y create_section_draft
  const collabFormalia = await executePathcomTool({
    actor: collaborator,
    toolName: 'projects_ops_tool',
    operation: 'get_formalia_summary',
    args: {},
    repo
  });
  assert.equal(collabFormalia.ok, true);
});

test('Criterio 3: Compilación trazable a Pathrimonio Market vincula market_path_id y soporta validación por pares', async () => {
  const repo = createMemoryPathcomRepo();
  const author = makeActor('user', 'USR-AUTHOR-1', 'autor@pyme.pe');
  const reviewer = makeActor('partner', 'USR-REVIEWER-1', 'socio@pyme.pe');

  const log1 = await executePathcomTool({
    actor: author,
    toolName: 'path_log_tool',
    operation: 'create_log',
    args: { title: 'Paso 1: Ordenar catálogo', duration_minutes: 25, progress_percent: 40 },
    repo
  });
  const log2 = await executePathcomTool({
    actor: author,
    toolName: 'path_log_tool',
    operation: 'create_log',
    args: { title: 'Paso 2: Activar rol Caja', duration_minutes: 35, progress_percent: 100 },
    repo
  });

  const compiled = await executePathcomTool({
    actor: author,
    toolName: 'market_curator_tool',
    operation: 'compile_logs_to_path',
    args: {
      title: 'Guía rápida de orden comercial',
      category: 'Operación PYME',
      log_ids: [log1.data.log.id, log2.data.log.id],
      submit_immediately: true
    },
    repo
  });

  assert.equal(compiled.ok, true);
  const mpId = compiled.data.market_path.id;
  assert.equal(compiled.data.market_path.total_duration_minutes, 60);
  assert.equal(compiled.data.market_path.status, 'PEER_REVIEW');

  // Verificar que ambos path_logs originales quedaron trazables con market_path_id
  const linkedTimeline = await repo.listPathLogs({ marketPathId: mpId, order: 'asc' });
  assert.equal(linkedTimeline.length, 2);

  // Autor NO puede auto-calificarse
  const selfRating = await executePathcomTool({
    actor: author,
    toolName: 'market_curator_tool',
    operation: 'record_validation',
    args: { market_path_id: mpId, score: 5, feedback: 'Auto voto' },
    repo
  });
  assert.equal(selfRating.ok, false);
  assert.equal(selfRating.code, 'SELF_VALIDATION_BLOCKED');

  // Par sí califica y actualiza avg_rating
  const peerRating = await executePathcomTool({
    actor: reviewer,
    toolName: 'market_curator_tool',
    operation: 'record_validation',
    args: { market_path_id: mpId, score: 5, feedback: 'Excelente guía auditable.' },
    repo
  });
  assert.equal(peerRating.ok, true);
  assert.equal(peerRating.data.market_path.avg_rating, 5);
  assert.equal(peerRating.data.market_path.validations_count, 1);
});

test('Criterio 4: Cero publicación accidental CMS sin estado APPROVED en pathcom_action_queue', async () => {
  const repo = createMemoryPathcomRepo();
  const collaborator = makeActor('collaborator');
  const admin = makeActor('admin');

  const draftRes = await executePathcomTool({
    actor: collaborator,
    toolName: 'site_cms_tool',
    operation: 'create_section_draft',
    args: {
      project_id: 'core-hub',
      draft_name: 'Core Hub PYME v2 (En borrador)',
      draft_status: 'LIVE',
      draft_summary: 'Resumen aún no aprobado.'
    },
    repo
  });
  assert.equal(draftRes.ok, true);

  // La vista pública aún NO refleja el borrador no aprobado
  const publicBefore = filterVisibleSiteProjects(await repo.listSiteProjects(), { roleCode: 'guest' });
  const liveCoreBefore = publicBefore.find((p) => p.id === 'core-hub');
  assert.equal(liveCoreBefore.name, 'Core Hub PYME — Caja, Stock y Pedidos Offline-First');

  // Encolar para aprobación
  const queuedRes = await executePathcomTool({
    actor: collaborator,
    toolName: 'site_cms_tool',
    operation: 'request_publish',
    args: { project_id: 'core-hub' },
    repo
  });
  assert.equal(queuedRes.ok, true);
  const queueId = queuedRes.data.queued_action.id;
  assert.equal(queuedRes.data.queued_action.status, 'PENDING');

  // Sigue sin cambiar en portada antes de Aprobar
  const publicPending = filterVisibleSiteProjects(await repo.listSiteProjects(), { roleCode: 'guest' });
  assert.equal(
    publicPending.find((p) => p.id === 'core-hub').name,
    'Core Hub PYME — Caja, Stock y Pedidos Offline-First'
  );

  // Certificación comercial PATRIMONIO_VALIDADO requiere Admin
  assert.equal(
    canReviewApprovalItem({
      roleCode: 'collaborator',
      actionType: 'resolve',
      item: { payload_json: { requires_admin_certification: true } }
    }).allowed,
    false
  );

  // Admin aprueba la solicitud CMS
  await repo.resolveActionQueueItem({
    id: queueId,
    decision: 'APPROVED',
    reviewerEmail: admin.userEmail,
    reviewNote: 'Aprobado para portada'
  });

  const publicAfter = filterVisibleSiteProjects(await repo.listSiteProjects(), { roleCode: 'guest' });
  const liveCoreAfter = publicAfter.find((p) => p.id === 'core-hub');
  assert.equal(liveCoreAfter.name, 'Core Hub PYME v2 (En borrador)');
  assert.equal(liveCoreAfter.public_summary, 'Resumen aún no aprobado.');
});

test('Criterio 5: Extensibilidad limpia con módulo futuro clubs_domain_tool (Pathrimonio Fit) controlado por feature flag', async () => {
  const repo = createMemoryPathcomRepo();
  const user = makeActor('user');

  // Desactivado por defecto en v1
  const blocked = await executePathcomTool({
    actor: user,
    toolName: 'clubs_domain_tool',
    operation: 'list_clubs',
    args: {},
    repo,
    featureFlags: DEFAULT_PATHCOM_MODULE_FLAGS
  });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.code, 'FEATURE_DISABLED');

  // Activación declarativa sin tocar el núcleo RBAC
  const enabledCheck = canExecutePathcomTool({
    roleCode: 'user',
    toolName: 'clubs_domain_tool',
    operation: 'list_clubs',
    featureFlags: { ...DEFAULT_PATHCOM_MODULE_FLAGS, clubs_enabled: true }
  });
  assert.equal(enabledCheck.allowed, true);
});

test('API Handler /api/v1/pathcom bloquea peticiones anónimas con 403 en mutaciones protegidas y sirve catálogo público', async () => {
  // GET /api/v1/market/paths como guest -> 200 OK
  const resMarket = createMockRes();
  await pathcomHandler(
    { method: 'GET', url: '/api/v1/market/paths', query: { action: 'market_list' }, headers: {} },
    resMarket
  );
  assert.equal(resMarket.statusCode, 200);
  assert.ok(Array.isArray(resMarket.body.paths));

  // POST /api/v1/paths/logs sin token (spoofing user_role: admin en body) -> 403 Forbidden
  const resLogSpoof = createMockRes();
  await pathcomHandler(
    {
      method: 'POST',
      url: '/api/v1/paths/logs',
      query: { action: 'logs' },
      headers: {},
      body: { title: 'Spoof attempt', user_role: 'admin' }
    },
    resLogSpoof
  );
  assert.equal(resLogSpoof.statusCode, 403);
  assert.equal(resLogSpoof.body.rbac_denied, true);

  // GET /api/v1/pathcom/approvals sin token -> 403 Forbidden
  const resApprovals = createMockRes();
  await pathcomHandler(
    { method: 'GET', url: '/api/v1/pathcom/approvals', query: { action: 'approvals' }, headers: {} },
    resApprovals
  );
  assert.equal(resApprovals.statusCode, 403);
});
