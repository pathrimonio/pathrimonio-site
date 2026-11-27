import {
  getClientIp,
  getAiQuotaStatus,
  recordAiQuotaTurn,
  recordApiUsageEvent,
  getWorkspaceBlueprint,
  saveWorkspaceBlueprint,
  listFormaliaSessionsArchive
} from '../_lib/store.js';
import {
  generateBlueprintStories,
  generateBlueprintLayout
} from '../../src/lib/formalia/blueprintGenerator.js';

export default async function handler(req, res) {
  const ip = getClientIp(req);
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const workspaceId = req.query?.id || body.workspace_id || 'ws_general';
  const action = req.query?.action || body.action || 'blueprint';

  if (req.method === 'GET') {
    const blueprint = await getWorkspaceBlueprint(workspaceId);
    return res.status(200).json({ blueprint });
  }

  // PATCH /api/v1/workspaces/:id/blueprint (Ediciones manuales: 0 turnos de IA)
  if (req.method === 'PATCH') {
    const saved = await saveWorkspaceBlueprint(workspaceId, {
      source_canvas_ids: body.source_canvas_ids,
      user_stories: body.user_stories,
      theme_config: body.theme_config,
      ui_screens: body.ui_screens
    });
    return res.status(200).json({ blueprint: saved, ai_turns_consumed: 0 });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = body.user_id || null;
  const userEmail = body.user_email || null;
  const useAi = body.use_ai !== false;

  // Resolver lienzos del Workspace (desde payload o archive del servidor)
  let canvases = Array.isArray(body.canvases) ? body.canvases : [];
  if (canvases.length === 0) {
    const archived = await listFormaliaSessionsArchive({ userId, userEmail, mineOnly: false });
    canvases = archived.filter((s) => s.workspace_id === workspaceId);
    if (Array.isArray(body.canvas_ids) && body.canvas_ids.length > 0) {
      const idSet = new Set(body.canvas_ids);
      const filtered = canvases.filter((c) => idSet.has(c.session_id));
      if (filtered.length > 0) canvases = filtered;
    }
  }

  // POST /api/v1/workspaces/:id/blueprint/stories
  if (action === 'stories') {
    if (useAi) {
      const quotaBefore = await getAiQuotaStatus({
        userId,
        userEmail,
        ip,
        sessionId: canvases[0]?.session_id || null
      });
      if (!quotaBefore.allowed) {
        return res.status(429).json({
          error: quotaBefore.is_authenticated
            ? 'Usaste tus 15 turnos de IA de hoy; se renuevan mañana. Puedes agregar o editar historias manualmente sin gastar turnos.'
            : 'Agotaste los 5 turnos de prueba de IA. Inicia sesión para obtener 15 turnos diarios o edita historias manualmente.',
          code: 'AI_QUOTA_EXCEEDED',
          reset_at: quotaBefore.reset_at,
          quota: quotaBefore
        });
      }
    }

    const genResult = await generateBlueprintStories({
      workspaceName: body.workspace_name || canvases[0]?.workspace_name || 'Mi Negocio',
      canvases,
      useAi
    });

    const sourceCanvasIds = canvases.map((c) => c.session_id).filter(Boolean);
    const saved = await saveWorkspaceBlueprint(workspaceId, {
      source_canvas_ids: sourceCanvasIds.length > 0 ? sourceCanvasIds : (body.canvas_ids || []),
      user_stories: genResult.stories
    });

    if (useAi) {
      await recordAiQuotaTurn({
        userId,
        userEmail,
        ip,
        sessionId: canvases[0]?.session_id || null,
        workspaceId,
        actionType: 'STORY_GEN'
      });
      if (Array.isArray(genResult.attempt_logs) && genResult.attempt_logs.length > 0) {
        await Promise.all(
          genResult.attempt_logs.map((ev) => recordApiUsageEvent(ev).catch(() => null))
        );
      }
    }

    const quotaAfter = await getAiQuotaStatus({
      userId,
      userEmail,
      ip,
      sessionId: canvases[0]?.session_id || null
    });

    return res.status(200).json({
      blueprint: saved,
      user_stories: saved.user_stories,
      source: genResult.source,
      quota: quotaAfter
    });
  }

  // POST /api/v1/workspaces/:id/blueprint/layout
  if (action === 'layout') {
    if (useAi) {
      const quotaBefore = await getAiQuotaStatus({
        userId,
        userEmail,
        ip,
        sessionId: canvases[0]?.session_id || null
      });
      if (!quotaBefore.allowed) {
        return res.status(429).json({
          error: quotaBefore.is_authenticated
            ? 'Usaste tus 15 turnos de IA de hoy; se renuevan mañana. Puedes editar los bloques de interfaz manualmente.'
            : 'Agotaste los 5 turnos de prueba de IA. Inicia sesión para obtener 15 turnos diarios o ajusta la maqueta manualmente.',
          code: 'AI_QUOTA_EXCEEDED',
          reset_at: quotaBefore.reset_at,
          quota: quotaBefore
        });
      }
    }

    const prevBp = await getWorkspaceBlueprint(workspaceId);
    const stories = Array.isArray(body.user_stories) && body.user_stories.length > 0
      ? body.user_stories
      : prevBp.user_stories || [];
    const themeConfig = body.theme_config || prevBp.theme_config;
    const existingScreens = Array.isArray(body.existing_screens)
      ? body.existing_screens
      : prevBp.ui_screens || [];

    const layoutRes = await generateBlueprintLayout({
      workspaceName: body.workspace_name || canvases[0]?.workspace_name || 'Mi Negocio',
      stories,
      canvases,
      themeConfig,
      targetRole: body.target_role || null,
      refinementPrompt: body.refinement_prompt || '',
      existingScreens,
      useAi
    });

    const saved = await saveWorkspaceBlueprint(workspaceId, {
      user_stories: stories,
      theme_config: themeConfig,
      ui_screens: layoutRes.ui_screens
    });

    if (useAi) {
      await recordAiQuotaTurn({
        userId,
        userEmail,
        ip,
        sessionId: canvases[0]?.session_id || null,
        workspaceId,
        actionType: 'UI_LAYOUT'
      });
      if (Array.isArray(layoutRes.attempt_logs) && layoutRes.attempt_logs.length > 0) {
        await Promise.all(
          layoutRes.attempt_logs.map((ev) => recordApiUsageEvent(ev).catch(() => null))
        );
      }
    }

    const quotaAfter = await getAiQuotaStatus({
      userId,
      userEmail,
      ip,
      sessionId: canvases[0]?.session_id || null
    });

    return res.status(200).json({
      blueprint: saved,
      ui_screens: saved.ui_screens,
      source: layoutRes.source,
      quota: quotaAfter
    });
  }

  return res.status(400).json({ error: 'Acción de blueprint no soportada' });
}
