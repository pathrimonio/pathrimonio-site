import { createInitialProcessGraph, generateFormaliaSessionId } from '../../../src/lib/formalia/schema.js';
import { saveSession, getClientIp, checkIpSessionQuota } from '../../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req);
  const quota = checkIpSessionQuota(ip);
  if (!quota.allowed) {
    return res.status(429).json({
      error: 'Límite temporal de sesiones alcanzado. Intenta nuevamente más tarde.'
    });
  }

  const sessionId = generateFormaliaSessionId();
  const initialGraph = createInitialProcessGraph(sessionId);

  const greeting = {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content: 'Hola, soy FORMALIA. Cuéntame en tus propias palabras: ¿qué proceso de tu negocio te genera hoy más desorden? (Ej. Ventas, Despachos, Pedidos)',
    quick_replies: [
      'Recibimos pedidos por WhatsApp, anotamos en Excel y despachamos en ruta',
      'Comercio / Bodega: ventas en caja, control de stock e inventario manual',
      'Restaurante / Delivery: comandas, cocina y entregas con demora'
    ],
    phase: '1_context',
    timestamp: new Date().toISOString()
  };

  const record = await saveSession({
    session_id: sessionId,
    process_graph: initialGraph,
    messages: [greeting],
    turns_count: 0,
    completeness_score: initialGraph.completeness_score,
    created_at: new Date().toISOString()
  });

  return res.status(201).json({
    session_id: record.session_id,
    greeting,
    process_graph: record.process_graph,
    turns_count: record.turns_count,
    max_turns: 15
  });
}
