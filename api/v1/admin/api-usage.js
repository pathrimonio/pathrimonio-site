import {
  getApiUsageSummary,
  probeConnectedServerKeys,
  recordApiUsageEvent,
  updateApiKeyQuotaLimit
} from '../../_lib/store.js';

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      const days = Math.min(30, Math.max(1, Number(req.query?.days) || 7));
      const summary = await getApiUsageSummary({ days });
      return res.status(200).json(summary);
    } catch (err) {
      return res.status(500).json({ error: err?.message || 'Error consultando consumo de API.' });
    }
  }

  if (req.method === 'POST') {
    const body = parseBody(req);

    if (body.action === 'probe') {
      try {
        const probes = await probeConnectedServerKeys();
        const summary = await getApiUsageSummary({ days: 7 });
        return res.status(200).json({ ok: true, probes, summary });
      } catch (err) {
        return res.status(500).json({ error: err?.message || 'No se pudo verificar las claves conectadas.' });
      }
    }

    if (body.action === 'record_event' && body.event) {
      try {
        // Nunca aceptar claves crudas; únicamente huella enmascarada y contadores de consumo
        const safeEvent = {
          key_id: body.event.key_id || `portal_byok_${body.event.provider || 'gemini'}`,
          key_label: body.event.key_label || 'Portal Archifly BYOK',
          key_fingerprint: body.event.key_fingerprint || '',
          provider: body.event.provider || 'gemini',
          model: body.event.model || 'unknown',
          source_module: body.event.source_module || 'archifly',
          scope: body.event.scope || 'client_byok',
          http_status: Number(body.event.http_status) || 200,
          success: body.event.success !== undefined ? Boolean(body.event.success) : true,
          prompt_tokens: Number(body.event.prompt_tokens) || 0,
          output_tokens: Number(body.event.output_tokens) || 0,
          total_tokens: Number(body.event.total_tokens) || 0,
          latency_ms: Number(body.event.latency_ms) || 0,
          rate_limit_info: body.event.rate_limit_info || {},
          error_message: body.event.error_message || null
        };
        const saved = await recordApiUsageEvent(safeEvent);
        return res.status(201).json({ ok: true, event: saved });
      } catch (err) {
        return res.status(500).json({ error: err?.message || 'Error registrando evento de API.' });
      }
    }

    return res.status(400).json({ error: 'Acción POST no soportada.' });
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    if (!body.key_id) {
      return res.status(400).json({ error: 'key_id es obligatorio.' });
    }
    try {
      const updated = await updateApiKeyQuotaLimit(body);
      const summary = await getApiUsageSummary({ days: 7 });
      return res.status(200).json({ ok: true, quota: updated, summary });
    } catch (err) {
      return res.status(500).json({ error: err?.message || 'Error actualizando límite de cuota.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
