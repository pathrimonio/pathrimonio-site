import { saveComplaintRecord } from '../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  if (payload.privacy_policy_accepted !== true) {
    return res.status(400).json({
      error: 'Debes aceptar la Política de Privacidad para registrar tu hoja de reclamación.'
    });
  }

  if (!payload.consumer_name?.trim() || !payload.document_number?.trim() || !payload.email?.trim() || !payload.detail?.trim() || !payload.consumer_request?.trim()) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios en la hoja de reclamación.'
    });
  }

  const complaintCode = payload.complaint_code || `LR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const nowIso = new Date().toISOString();

  const saved = await saveComplaintRecord({
    ...payload,
    complaint_code: complaintCode,
    privacy_policy_accepted: true,
    privacy_policy_version: payload.privacy_policy_version || '2026-11',
    accepted_at: payload.accepted_at || nowIso
  });

  return res.status(201).json({
    status: 'ok',
    complaint_code: saved.complaint_code,
    registered_at: nowIso,
    response_deadline_business_days: 15
  });
}
