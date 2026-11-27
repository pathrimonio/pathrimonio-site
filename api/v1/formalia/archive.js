import {
  listFormaliaSessionsArchive,
  saveSession,
  saveArtifactVersion,
  updateFormaliaSessionWorkspace,
  deleteFormaliaSessionRecord
} from '../../_lib/store.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const userId = req.query?.user_id || null;
    const userEmail = req.query?.user_email || null;
    const mineOnly = req.query?.mine_only === '1' || req.query?.mine_only === 'true';
    const workspaceId = req.query?.workspace_id || null;

    let sessions = await listFormaliaSessionsArchive({ userId, userEmail, mineOnly });
    if (workspaceId) {
      sessions = sessions.filter((s) => s.workspace_id === workspaceId);
    }
    return res.status(200).json({
      total: sessions.length,
      sessions
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  if (req.method === 'PATCH') {
    const sessionId = body.session_id || body.session?.session_id || req.query?.session_id;
    if (!sessionId) {
      return res.status(400).json({ error: 'session_id requerido' });
    }

    if (body.session && typeof body.session === 'object') {
      const saved = await saveSession({
        ...body.session,
        session_id: sessionId,
        workspace_id: body.workspace_id ?? body.session.workspace_id,
        workspace_name: body.workspace_name ?? body.session.workspace_name,
        project_id: body.project_id !== undefined ? body.project_id : body.session.project_id,
        canvas_title: body.canvas_title ?? body.session.canvas_title,
        ...(body.user_id ? { user_id: body.user_id } : {}),
        ...(body.user_email ? { user_email: body.user_email } : {}),
        ...(body.user_name ? { user_name: body.user_name } : {}),
        saved_to_account: body.saved_to_account !== undefined ? Boolean(body.saved_to_account) : true
      });
      if (Array.isArray(body.session.generated_files) && body.session.generated_files.length > 0) {
        await Promise.all(
          body.session.generated_files.slice(0, 12).map((art) =>
            saveArtifactVersion({ ...art, session_id: sessionId }).catch(() => null)
          )
        );
      }
      return res.status(200).json({ session: saved });
    }

    const updated = await updateFormaliaSessionWorkspace(sessionId, {
      workspace_id: body.workspace_id,
      workspace_name: body.workspace_name,
      project_id: body.project_id,
      canvas_title: body.canvas_title,
      user_id: body.user_id,
      user_email: body.user_email,
      user_name: body.user_name,
      saved_to_account: body.saved_to_account
    });
    if (!updated) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    return res.status(200).json({ session: updated });
  }

  if (req.method === 'DELETE') {
    const sessionId = req.query?.session_id || body.session_id;
    if (!sessionId) {
      return res.status(400).json({ error: 'session_id requerido' });
    }
    await deleteFormaliaSessionRecord(sessionId);
    return res.status(200).json({ deleted: true, session_id: sessionId });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
