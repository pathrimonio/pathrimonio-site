import { graphToPlantUML } from '../../../../../src/lib/formalia/compilers.js';
import { getSession } from '../../../../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, format = 'json' } = req.query;
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
