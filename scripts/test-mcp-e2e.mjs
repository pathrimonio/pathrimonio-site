import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const parseToolJson = (result) => {
  const text = result?.content?.[0]?.text || '{}';
  const parsed = JSON.parse(text);
  if (result?.isError || parsed.ok === false) {
    throw new Error(`Tool failed: ${parsed.error || text}`);
  }
  return parsed;
};

const tempRepo = mkdtempSync(join(tmpdir(), 'pathrimonio-mcp-e2e-'));
const testFileA = join(tempRepo, 'src', 'services', 'TestSampleService.ts');
const tempSrcDir = join(tempRepo, 'src', 'services');

const client = new Client({ name: 'pathrimonio-e2e-tester', version: '1.0.0' });
const transport = new StdioClientTransport({
  command: 'node',
  args: [resolve('mcp/pathrimonio-mcp-server.mjs')]
});

const testProjectId = 'pathway';
const testRootName = '__mcp_e2e_test_root__';

try {
  // Preparar archivo TS real temporal con clase, métodos y hook para validar extracción AST
  await import('node:fs').then(({ mkdirSync }) => mkdirSync(tempSrcDir, { recursive: true }));
  writeFileSync(testFileA, `
/** Servicio temporal de prueba E2E */
export class TestSampleService {
  private secretInternalFormula(): number {
    const internalToken = "DO_NOT_EXPOSURE";
    return internalToken.length * 42;
  }

  public async calculateQuota(rolesCount: number, isPartner: boolean): Promise<number> {
    return rolesCount * (isPartner ? 10 : 20);
  }
}

export function useSampleHelper(flag: boolean): string {
  return flag ? "on" : "off";
}
`, 'utf8');

  await client.connect(transport);
  console.log('OK connect stdio MCP');

  const { tools } = await client.listTools();
  const toolNames = tools.map((t) => t.name);
  for (const expected of [
    'list_projects',
    'get_project_tree',
    'upsert_file_node',
    'rename_or_move_file_node',
    'delete_file_node',
    'list_file_records',
    'upsert_file_records',
    'delete_file_record',
    'sync_modified_file',
    'sync_directory_from_disk',
    'list_archify_artifacts',
    'publish_archify_html'
  ]) {
    assert(toolNames.includes(expected), `Missing tool: ${expected}`);
  }
  console.log(`OK listTools (${toolNames.length} tools)`);

  const projRes = parseToolJson(await client.callTool({ name: 'list_projects', arguments: {} }));
  assert(projRes.projects.some((p) => p.id === testProjectId), 'pathway project missing');
  console.log(`OK list_projects (authMode=${projRes.authMode}, projects=${projRes.projects.length})`);

  // Clean up any leftover test root from a previous aborted run
  await client.callTool({
    name: 'delete_file_node',
    arguments: {
      project_id: testProjectId,
      root_name: testRootName,
      path: '',
      recursive: true
    }
  }).catch(() => {});

  // 1. sync_modified_file (AST extraction -> upsert node & sync records)
  const syncRes = parseToolJson(await client.callTool({
    name: 'sync_modified_file',
    arguments: {
      project_id: testProjectId,
      root_name: testRootName,
      repo_root: tempRepo,
      local_file_path: testFileA
    }
  }));
  assert(syncRes.inserted >= 4, `Expected >=4 extracted records, got ${syncRes.inserted}`);
  const dumpedText = JSON.stringify(syncRes);
  assert(!dumpedText.includes('DO_NOT_EXPOSURE'), 'SECURITY LEAK: body literal appeared in response');
  console.log(`OK sync_modified_file (records=${syncRes.totalRecords}, path=${syncRes.path})`);

  // 2. upsert_file_records (update existing method + add custom record)
  const upsertRecRes = parseToolJson(await client.callTool({
    name: 'upsert_file_records',
    arguments: {
      project_id: testProjectId,
      root_name: testRootName,
      path: 'src/services/TestSampleService.ts',
      records: [
        {
          record_type: 'method',
          name: 'TestSampleService.calculateQuota',
          signature: 'public async calculateQuota(rolesCount: number, isPartner: boolean, discount: number): Promise<number>',
          description: 'Actualizado por agente MCP',
          line_number: 10
        },
        {
          record_type: 'constant',
          name: 'MAX_QUOTA_LIMIT',
          signature: 'export const MAX_QUOTA_LIMIT = 500',
          line_number: 22
        }
      ]
    }
  }));
  assert(upsertRecRes.updated === 1 && upsertRecRes.inserted === 1, 'Expected 1 updated + 1 inserted');
  console.log(`OK upsert_file_records (updated=${upsertRecRes.updated}, inserted=${upsertRecRes.inserted}, total=${upsertRecRes.totalRecords})`);

  // 3. rename_or_move_file_node (preserve node_id + file_records)
  const moveRes = parseToolJson(await client.callTool({
    name: 'rename_or_move_file_node',
    arguments: {
      project_id: testProjectId,
      root_name: testRootName,
      old_path: 'src/services/TestSampleService.ts',
      new_path: 'src/domain/RenamedSampleService.ts'
    }
  }));
  assert(moveRes.movedNodes === 1, 'Expected movedNodes=1');

  const listAfterMove = parseToolJson(await client.callTool({
    name: 'list_file_records',
    arguments: {
      project_id: testProjectId,
      root_name: testRootName,
      path: 'src/domain/RenamedSampleService.ts'
    }
  }));
  assert(listAfterMove.count === upsertRecRes.totalRecords, 'Records count changed after rename');
  console.log(`OK rename_or_move_file_node + list_file_records (${listAfterMove.count} records preserved)`);

  // 4. delete_file_record
  const maxQuotaRec = listAfterMove.records.find((r) => r.name === 'MAX_QUOTA_LIMIT');
  assert(maxQuotaRec?.id, 'MAX_QUOTA_LIMIT not found');
  const delRecRes = parseToolJson(await client.callTool({
    name: 'delete_file_record',
    arguments: { record_id: maxQuotaRec.id }
  }));
  assert(delRecRes.deletedCount === 1, 'Expected deletedCount=1');
  console.log('OK delete_file_record');

  // 5. Cleanup test root subtree so production DB stays spotless
  const cleanupRes = parseToolJson(await client.callTool({
    name: 'delete_file_node',
    arguments: {
      project_id: testProjectId,
      root_name: testRootName,
      path: '',
      recursive: true
    }
  }));
  console.log(`OK cleanup root subtree (deleted=${cleanupRes.deletedCount})`);

  // 6. list_archify_artifacts + publish_archify_html (with clean DB deletion after verify)
  const sampleHtmlPath = join(tempRepo, 'sample-archify-e2e.html');
  writeFileSync(
    sampleHtmlPath,
    '<!doctype html><html><head><title>E2E Test Archify · Diagrama</title><meta name="generator" content="archify 3.3.0"></head><body><h1>OK</h1></body></html>',
    'utf8'
  );
  const pubRes = parseToolJson(await client.callTool({
    name: 'publish_archify_html',
    arguments: {
      project_id: testProjectId,
      slug: 'mcp-e2e-test-diagram',
      html_file_path: sampleHtmlPath,
      is_primary: false
    }
  }));
  assert(pubRes.published?.slug === 'mcp-e2e-test-diagram', 'Published slug mismatch');

  const listArchRes = parseToolJson(await client.callTool({
    name: 'list_archify_artifacts',
    arguments: { project_id: testProjectId }
  }));
  assert(
    listArchRes.artifacts.some((a) => a.slug === 'mcp-e2e-test-diagram'),
    'Published Archify test artifact missing in list_archify_artifacts'
  );

  const { getSupabaseClient } = await import('../mcp/supabaseClient.mjs');
  const { supabase } = await getSupabaseClient();
  await supabase
    .from('project_architecture_artifacts')
    .delete()
    .eq('project_id', testProjectId)
    .in('slug', ['mcp-e2e-test-diagram', '__mcp_e2e_test_diagram__']);
  console.log('OK publish_archify_html + list_archify_artifacts + cleanup');
  console.log('ALL MCP E2E TESTS PASSED');
} finally {
  await client.close().catch(() => {});
  rmSync(tempRepo, { recursive: true, force: true });
}
