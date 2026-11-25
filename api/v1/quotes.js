import { generateEngineeringHandoff } from '../../src/lib/formalia/compilers.js';
import { getSession, saveQuoteWithHandoff } from '../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const formaliaSessionId = payload.formalia_session_id || null;
  let engineering_handoff = payload.engineering_handoff || null;

  if (formaliaSessionId && !engineering_handoff) {
    const session = await getSession(formaliaSessionId);
    const graph = payload.process_graph || session?.process_graph;
    if (graph) {
      engineering_handoff = generateEngineeringHandoff(graph);
    }
  }

  const savedQuote = await saveQuoteWithHandoff({
    ...payload,
    formalia_session_id: formaliaSessionId,
    engineering_handoff,
    received_at: new Date().toISOString()
  });

  return res.status(201).json({
    status: 'ok',
    quote_id: savedQuote.quote_id,
    formalia_session_id: formaliaSessionId,
    handoff_generated: Boolean(engineering_handoff),
    engineering_handoff
  });
}
