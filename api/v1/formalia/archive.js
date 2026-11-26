import { listFormaliaSessionsArchive } from '../../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.query?.user_id || null;
  const userEmail = req.query?.user_email || null;
  const mineOnly = req.query?.mine_only === '1' || req.query?.mine_only === 'true';

  const sessions = await listFormaliaSessionsArchive({ userId, userEmail, mineOnly });
  return res.status(200).json({
    total: sessions.length,
    sessions
  });
}
