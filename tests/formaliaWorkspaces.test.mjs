import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyGraphPatches,
  createInitialProcessGraph,
  extractWorkspaceMeta,
  normalizeWorkspaceMeta
} from '../src/lib/formalia/schema.js';
import {
  buildWorkspaceDirectory,
  normalizeSessionWorkspace
} from '../src/services/formaliaService.js';
import {
  saveSession,
  getSession,
  listFormaliaSessionsArchive,
  updateFormaliaSessionWorkspace,
  deleteFormaliaSessionRecord
} from '../api/_lib/store.js';

test('normalizeWorkspaceMeta & createInitialProcessGraph preserve workspace metadata', () => {
  const meta = normalizeWorkspaceMeta({
    project_id: 'pathway',
    workspace_name: 'Pathrimonio Core',
    canvas_title: 'Onboarding Socios'
  });
  assert.equal(meta.workspace_id, 'ws_proj_pathway');
  assert.equal(meta.workspace_name, 'Pathrimonio Core');
  assert.equal(meta.project_id, 'pathway');
  assert.equal(meta.canvas_title, 'Onboarding Socios');

  const graph = createInitialProcessGraph('FIA-2026-9001', meta);
  assert.equal(graph.workspace_meta.workspace_id, 'ws_proj_pathway');
  assert.equal(graph.business_context.company_name, 'Pathrimonio Core');
  assert.equal(graph.business_context.process_name, 'Onboarding Socios');

  const patched = applyGraphPatches(graph, [
    { op: 'add_role', actor: { id: 'role_ventas', name: 'Ventas', type: 'INTERNAL_ADMIN_ROLE' } }
  ]);
  assert.equal(patched.workspace_meta.workspace_id, 'ws_proj_pathway');
  assert.equal(patched.workspace_meta.canvas_title, 'Onboarding Socios');
});

test('extractWorkspaceMeta resolves fallback from JSONB workspace_meta even without SQL columns', () => {
  const extracted = extractWorkspaceMeta({
    session_id: 'FIA-2026-9002',
    process_graph: {
      workspace_meta: {
        workspace_id: 'ws_neg_alfa',
        workspace_name: 'Distribuidora Alfa SAC',
        project_id: null,
        canvas_title: 'Despacho Regional'
      },
      business_context: {
        company_name: 'Distribuidora Alfa SAC',
        process_name: 'Despacho Regional'
      }
    }
  });
  assert.deepEqual(extracted, {
    workspace_id: 'ws_neg_alfa',
    workspace_name: 'Distribuidora Alfa SAC',
    project_id: null,
    canvas_title: 'Despacho Regional'
  });
});

test('buildWorkspaceDirectory groups Portal projects, custom business workspaces and multi-canvases cleanly', () => {
  const portalProjects = [
    { id: 'pathway', name: 'Pathrimonio Pathway' },
    { id: 'smatad', name: 'SMATAD Mobile' }
  ];
  const customWorkspaces = [
    { workspace_id: 'ws_neg_cafe', workspace_name: 'Café Tostado SAC', category: 'negocio' }
  ];
  const sessions = [
    normalizeSessionWorkspace({
      session_id: 'FIA-2026-1001',
      workspace_id: 'ws_proj_pathway',
      workspace_name: 'Pathrimonio Pathway',
      project_id: 'pathway',
      canvas_title: 'Cotizador Web',
      updated_at: '2026-11-26T10:00:00.000Z',
      process_graph: createInitialProcessGraph('FIA-2026-1001')
    }),
    normalizeSessionWorkspace({
      session_id: 'FIA-2026-1002',
      workspace_id: 'ws_proj_pathway',
      workspace_name: 'Pathrimonio Pathway',
      project_id: 'pathway',
      canvas_title: 'Facturación Socios',
      updated_at: '2026-11-26T12:00:00.000Z',
      process_graph: createInitialProcessGraph('FIA-2026-1002')
    }),
    normalizeSessionWorkspace({
      session_id: 'FIA-2026-1003',
      workspace_id: 'ws_neg_cafe',
      workspace_name: 'Café Tostado SAC',
      canvas_title: 'Compras Grano',
      updated_at: '2026-11-26T11:00:00.000Z',
      process_graph: createInitialProcessGraph('FIA-2026-1003')
    })
  ];

  const dir = buildWorkspaceDirectory({ sessions, portalProjects, customWorkspaces });
  assert.equal(dir.length, 3);

  const pathwayWs = dir.find((w) => w.workspace_id === 'ws_proj_pathway');
  assert.ok(pathwayWs);
  assert.equal(pathwayWs.source, 'project');
  assert.equal(pathwayWs.canvases.length, 2);
  // Most recently updated canvas comes first
  assert.equal(pathwayWs.canvases[0].session_id, 'FIA-2026-1002');
  assert.equal(pathwayWs.canvases[1].session_id, 'FIA-2026-1001');

  const cafeWs = dir.find((w) => w.workspace_id === 'ws_neg_cafe');
  assert.ok(cafeWs);
  assert.equal(cafeWs.source, 'custom');
  assert.equal(cafeWs.canvases.length, 1);
  assert.equal(cafeWs.canvases[0].canvas_title, 'Compras Grano');
});

test('api/_lib/store persists, renames and deletes canvases with workspace_meta sync', async () => {
  const sid = 'FIA-2026-TESTWS';
  const meta = normalizeWorkspaceMeta({
    workspace_id: 'ws_neg_test',
    workspace_name: 'Empresa Test SAC',
    canvas_title: 'Lienzo Inicial'
  });
  await saveSession({
    session_id: sid,
    user_email: 'tester@pathrimonio.org',
    saved_to_account: true,
    ...meta,
    process_graph: createInitialProcessGraph(sid, meta),
    messages: [],
    turns_count: 1
  });

  const fetched = await getSession(sid);
  assert.equal(fetched.workspace_id, 'ws_neg_test');
  assert.equal(fetched.canvas_title, 'Lienzo Inicial');
  assert.equal(fetched.process_graph.workspace_meta.workspace_name, 'Empresa Test SAC');

  const archived = await listFormaliaSessionsArchive({ userEmail: 'tester@pathrimonio.org', mineOnly: true });
  assert.ok(archived.some((s) => s.session_id === sid));

  const renamed = await updateFormaliaSessionWorkspace(sid, {
    canvas_title: 'Ventas B2B'
  });
  assert.equal(renamed.canvas_title, 'Ventas B2B');
  assert.equal(renamed.process_graph.business_context.process_name, 'Ventas B2B');
  assert.equal(renamed.process_graph.workspace_meta.canvas_title, 'Ventas B2B');

  await deleteFormaliaSessionRecord(sid);
  const afterDelete = await listFormaliaSessionsArchive({ userEmail: 'tester@pathrimonio.org', mineOnly: true });
  assert.equal(afterDelete.some((s) => s.session_id === sid), false);
});
