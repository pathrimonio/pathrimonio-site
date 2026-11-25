import { listFormaliaSessionsArchive } from '../../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessions = await listFormaliaSessionsArchive();
  return res.status(200).json({
    total: sessions.length,
    sessions
  });
}
