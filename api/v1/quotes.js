import { generateEngineeringHandoff } from '../../src/lib/formalia/compilers.js';
import { getSession, saveQuoteWithHandoff } from '../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (payload.privacy_policy_accepted !== true) {
    return res.status(400).json({
      error: 'Debes aceptar la Política de Privacidad para enviar tu cotización.'
    });
  }

  const acceptedAt = payload.accepted_at || new Date().toISOString();
  const privacyVersion = payload.privacy_policy_version || '2026-11';
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
    privacy_policy_accepted: true,
    privacy_policy_version: privacyVersion,
    accepted_at: acceptedAt,
    formalia_session_id: formaliaSessionId,
    web_blueprint_id: payload.web_blueprint_id || null,
    engineering_handoff,
    received_at: new Date().toISOString()
  });

  return res.status(201).json({
    status: 'ok',
    quote_id: savedQuote.quote_id,
    formalia_session_id: formaliaSessionId,
    privacy_policy_accepted: true,
    privacy_policy_version: privacyVersion,
    accepted_at: acceptedAt,
    handoff_generated: Boolean(engineering_handoff),
    engineering_handoff
  });
}
