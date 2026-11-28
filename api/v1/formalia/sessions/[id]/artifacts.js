import { graphToPlantUML, mapProcessToQuoteConfig } from '../../../../../src/lib/formalia/compilers.js';
import { getSession, saveArtifactVersion } from '../../../../_lib/store.js';

export default async function handler(req, res) {
  const { id, action, format = 'json' } = req.query;

  // GET /api/v1/formalia/sessions/:id/export (rewritten to ?action=export)
  if (action === 'export') {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const session = await getSession(id);
    if (!session || !session.process_graph) {
      return res.status(404).json({ error: 'Sesión FORMALIA no encontrada' });
    }
    if (format === 'puml') {
      const puml = graphToPlantUML(session.process_graph);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${id}.puml"`);
      return res.status(200).send(puml);
    }
    return res.status(200).json(session.process_graph);
  }

  // POST /api/v1/formalia/sessions/:id/to-quote (rewritten to ?action=to-quote)
  if (action === 'to-quote') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const session = await getSession(id);
    const graph = body.process_graph || session?.process_graph;
    if (!graph) {
      return res.status(404).json({ error: 'No se encontró grafo de proceso para precargar la cotización.' });
    }
    return res.status(200).json(mapProcessToQuoteConfig(graph));
  }

  if (req.method === 'GET') {
    const session = await getSession(id);
    if (!session) {
      return res.status(404).json({ error: 'Sesión FORMALIA no encontrada' });
    }
    return res.status(200).json({
      session_id: id,
      messages: session.messages || [],
      versions: session.versions || [],
      generated_files: session.generated_files || []
    });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (!body.file_name || !body.artifact_kind) {
      return res.status(400).json({ error: 'file_name y artifact_kind son obligatorios.' });
    }

    const artifact = {
      id: body.id || `${id}_${body.artifact_kind}_${Date.now()}`,
      session_id: id,
      version_number: Number(body.version_number) || 1,
      version_label: body.version_label || `v${Number(body.version_number) || 1}`,
      artifact_kind: body.artifact_kind,
      file_name: body.file_name,
      mime_type: body.mime_type || 'application/octet-stream',
      content_text: body.content_text || null,
      data_url: body.data_url || null,
      size_bytes: Number(body.size_bytes) || 0,
      change_summary: body.change_summary || '',
      chat_turns_at: Number(body.chat_turns_at) || 0,
      created_at: new Date().toISOString()
    };

    const saved = await saveArtifactVersion(artifact);
    return res.status(201).json(saved);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
