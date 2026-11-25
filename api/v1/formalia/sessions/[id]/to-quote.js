import { mapProcessToQuoteConfig } from '../../../../src/lib/formalia/compilers.js';
import { getSession } from '../../../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const session = await getSession(id);
  const graph = body.process_graph || session?.process_graph;

  if (!graph) {
    return res.status(404).json({ error: 'No se encontró grafo de proceso para precargar la cotización.' });
  }

  const quoteConfig = mapProcessToQuoteConfig(graph);
  return res.status(200).json(quoteConfig);
}
