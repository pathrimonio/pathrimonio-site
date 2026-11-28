import { runPathcomAgentTurn } from '../../src/lib/pathcom/agentEngine.js';
import {
  canReviewApprovalItem,
  filterVisibleSiteProjects
} from '../../src/lib/pathcom/rbacPolicy.js';
import { executePathcomTool } from '../../src/lib/pathcom/toolExecutor.js';
import {
  getServerPathcomRepo,
  loadPathcomFeatureFlags,
  resolveServerActor
} from '../_lib/pathcomStore.js';
import { recordApiUsageEvent } from '../_lib/store.js';

function resolveRouteAction(req) {
  if (req.query?.action) return String(req.query.action);
  const cleanUrl = String(req.url || '').split('?')[0];
  if (cleanUrl.endsWith('/chat')) return 'chat';
  if (cleanUrl.endsWith('/approvals')) return 'approvals';
  if (cleanUrl.endsWith('/projects')) return 'site_projects';
  if (cleanUrl.endsWith('/pathway-sync')) return 'pathway_sync';
  if (cleanUrl.endsWith('/history')) return 'history';
  if (/\/timeline$/.test(cleanUrl)) return 'timeline';
  if (/\/logs$/.test(cleanUrl)) return 'logs';
  if (/\/validate$/.test(cleanUrl)) return 'validate';
  if (/\/market\/paths$/.test(cleanUrl)) return 'market_list';
  return 'market_list';
}

function parseJsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  const action = resolveRouteAction(req);
  const body = parseJsonBody(req);
  const actor = await resolveServerActor(req);
  const repo = getServerPathcomRepo();
  const featureFlags = await loadPathcomFeatureFlags();

  // 1. POST /api/v1/pathcom/chat
  if (action === 'chat') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const message = String(body.message || '').trim();
    if (!message) {
      return res.status(400).json({ error: 'El mensaje para Pathcom no puede estar vacío.' });
    }

    const clientTimezone = body.client_timezone || actor.timezone || 'America/Lima';
    const history = actor.userId ? await repo.listChatMessages(actor.userId) : [];

    const turnResult = await runPathcomAgentTurn({
      message,
      actor,
      repo,
      featureFlags,
      clientTimezone,
      history
    });

    if (Array.isArray(turnResult.attempt_logs)) {
      await Promise.all(turnResult.attempt_logs.map((ev) => recordApiUsageEvent(ev).catch(() => null)));
    }

    if (actor.userId) {
      const now = Date.now();
      await repo.saveChatMessage({
        id: `PMSG-${now}-U`,
        user_id: actor.userId,
        role_code: actor.roleCode,
        sender: 'user',
        content: message,
        tool_executions: [],
        rbac_denied: false,
        created_at: new Date(now).toISOString()
      });
      await repo.saveChatMessage({
        id: `PMSG-${now}-A`,
        user_id: actor.userId,
        role_code: actor.roleCode,
        sender: 'assistant',
        content: turnResult.reply_text,
        tool_executions: turnResult.tool_executions || [],
        rbac_denied: Boolean(turnResult.rbac_denied),
        created_at: new Date(now + 1).toISOString()
      });
    }

    return res.status(turnResult.rbac_denied ? 200 : 200).json({
      actor: {
        authenticated: actor.authenticated,
        role_code: actor.roleCode,
        user_id: actor.userId,
        user_name: actor.userName
      },
      reply_text: turnResult.reply_text,
      tool_executions: turnResult.tool_executions,
      rbac_denied: Boolean(turnResult.rbac_denied),
      engine_source: turnResult.engine_source
    });
  }

  // 2. GET /api/v1/paths/:userId/timeline
  if (action === 'timeline') {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const cleanUrl = String(req.url || '').split('?')[0];
    const urlUserMatch = cleanUrl.match(/\/paths\/([^/]+)\/timeline/);
    const requestedUserId = req.query?.userId || urlUserMatch?.[1] || null;
    const marketPathId = req.query?.market_path_id || null;

    const normalizedTargetUser =
      requestedUserId === 'me'
        ? actor.userId
        : requestedUserId === 'all'
          ? null
          : requestedUserId;

    const result = await executePathcomTool({
      actor,
      toolName: 'path_log_tool',
      operation: 'list_timeline',
      args: {
        user_id: normalizedTargetUser,
        market_path_id: marketPathId,
        order: req.query?.order === 'asc' ? 'asc' : 'desc'
      },
      repo,
      featureFlags
    });

    if (!result.ok) {
      return res.status(result.rbac_denied ? 403 : 400).json(result);
    }
    return res.status(200).json({
      user_id: requestedUserId === 'me' ? actor.userId : requestedUserId,
      logs: result.data.logs,
      total: result.data.total
    });
  }

  // 3. POST /api/v1/paths/logs
  if (action === 'logs') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const result = await executePathcomTool({
      actor,
      toolName: 'path_log_tool',
      operation: 'create_log',
      args: {
        title: body.title,
        content: body.content,
        duration_minutes: body.duration_minutes,
        progress_percent: body.progress_percent,
        market_path_id: body.market_path_id || null,
        client_timezone: body.client_timezone || actor.timezone
      },
      repo,
      featureFlags
    });

    if (!result.ok) {
      return res.status(result.rbac_denied ? 403 : 400).json(result);
    }
    return res.status(201).json(result.data.log);
  }

  // 4. GET /api/v1/market/paths
  if (action === 'market_list') {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const result = await executePathcomTool({
      actor,
      toolName: 'market_curator_tool',
      operation: 'list_market',
      args: { category: req.query?.category || null },
      repo,
      featureFlags
    });
    if (!result.ok) return res.status(403).json(result);
    return res.status(200).json({ paths: result.data.paths });
  }

  // 5. POST /api/v1/market/paths/:id/validate
  if (action === 'validate') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const cleanUrl = String(req.url || '').split('?')[0];
    const urlPathMatch = cleanUrl.match(/\/market\/paths\/([^/]+)\/validate/);
    const marketPathId = req.query?.id || urlPathMatch?.[1] || body.market_path_id;

    const result = await executePathcomTool({
      actor,
      toolName: 'market_curator_tool',
      operation: 'record_validation',
      args: {
        market_path_id: marketPathId,
        score: body.score,
        feedback: body.feedback
      },
      repo,
      featureFlags
    });

    if (!result.ok) {
      return res.status(result.rbac_denied ? 403 : 400).json(result);
    }
    return res.status(200).json(result.data);
  }

  // 6. GET / PATCH /api/v1/pathcom/approvals
  if (action === 'approvals') {
    if (req.method === 'GET') {
      const check = canReviewApprovalItem({ roleCode: actor.roleCode, actionType: 'read' });
      if (!check.allowed) {
        return res.status(403).json({ error: check.reason, code: 'RBAC_FORBIDDEN' });
      }
      const items = await repo.listActionQueue({ status: req.query?.status || null });
      return res.status(200).json({ approvals: items });
    }

    if (req.method === 'PATCH') {
      const itemId = body.id || req.query?.id;
      const decision = String(body.status || body.decision || '').toUpperCase();
      if (!itemId || !['APPROVED', 'REJECTED'].includes(decision)) {
        return res.status(400).json({ error: 'Se requiere id y status (APPROVED o REJECTED).' });
      }
      const targetItem = repo.getActionQueueItem
        ? await repo.getActionQueueItem(itemId)
        : (await repo.listActionQueue()).find((q) => q.id === itemId);

      const check = canReviewApprovalItem({
        roleCode: actor.roleCode,
        actionType: 'resolve',
        item: targetItem
      });
      if (!check.allowed) {
        return res.status(403).json({ error: check.reason, code: 'RBAC_FORBIDDEN' });
      }
      if (!targetItem) {
        return res.status(404).json({ error: 'Solicitud en cola no encontrada.' });
      }

      const resolved = await repo.resolveActionQueueItem({
        id: itemId,
        decision,
        reviewerEmail: actor.userEmail || actor.userName,
        reviewNote: body.review_note || ''
      });
      const updatedProjects = filterVisibleSiteProjects(await repo.listSiteProjects(), actor);
      return res.status(200).json({ approval: resolved, site_projects: updatedProjects });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 7. GET /api/v1/pathcom/projects (y POST para crear borrador o solicitar aprobación CMS)
  if (action === 'site_projects') {
    if (req.method === 'GET') {
      const all = await repo.listSiteProjects();
      return res.status(200).json({
        projects: filterVisibleSiteProjects(all, actor),
        feature_flags: featureFlags
      });
    }
    if (req.method === 'POST') {
      const op = body.request_publish ? 'request_publish' : 'create_section_draft';
      const result = await executePathcomTool({
        actor,
        toolName: 'site_cms_tool',
        operation: op,
        args: body,
        repo,
        featureFlags
      });
      if (!result.ok) {
        return res.status(result.rbac_denied ? 403 : 400).json(result);
      }
      return res.status(200).json(result.data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 8. POST /api/v1/pathcom/pathway-sync
  if (action === 'pathway_sync') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const result = await executePathcomTool({
      actor,
      toolName: 'pathway_bridge_tool',
      operation: 'import_pathway_logs',
      args: { client_timezone: body.client_timezone || actor.timezone },
      repo,
      featureFlags
    });
    if (!result.ok) {
      return res.status(result.rbac_denied ? 403 : 400).json(result);
    }
    return res.status(200).json(result.data);
  }

  // 9. GET /api/v1/pathcom/history
  if (action === 'history') {
    const messages = actor.userId ? await repo.listChatMessages(actor.userId) : [];
    return res.status(200).json({
      actor: {
        authenticated: actor.authenticated,
        role_code: actor.roleCode,
        user_id: actor.userId,
        user_name: actor.userName
      },
      messages,
      feature_flags: featureFlags
    });
  }

  return res.status(404).json({ error: 'Acción de Pathcom no encontrada.' });
}
