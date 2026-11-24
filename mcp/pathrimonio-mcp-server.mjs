#!/usr/bin/env node
import { existsSync, statSync } from 'node:fs';
import { basename, isAbsolute, relative, resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getSupabaseClient } from './supabaseClient.mjs';
import {
  buildNodePayloadsForPath,
  extractAbstractRecordsFromFile,
  getExtension,
  normalizeRelPath,
  scanLocalDirectory
} from './abstractExtractor.mjs';

const SERVER_NAME = 'pathrimonio-files';
const SERVER_VERSION = '1.0.0';

const okResult = (payload) => ({
  content: [{ type: 'text', text: JSON.stringify({ ok: true, ...payload }, null, 2) }]
});

const errResult = (error) => ({
  content: [{
    type: 'text',
    text: JSON.stringify({ ok: false, error: error?.message || String(error) }, null, 2)
  }],
  isError: true
});

async function listRootsForProject(supabase, projectId) {
  const { data, error } = await supabase
    .from('project_tree_nodes')
    .select('root_name')
    .eq('project_id', projectId)
    .eq('path', '');
  if (error) throw error;
  return (data || []).map((row) => row.root_name);
}

async function resolveTargetFileContext(supabase, {
  projectId,
  rootName,
  filePath,
  repoRoot
}) {
  let cleanPath = filePath || '';
  let resolvedRepoRoot = repoRoot ? resolve(repoRoot) : null;

  if (resolvedRepoRoot && isAbsolute(cleanPath)) {
    const rel = relative(resolvedRepoRoot, resolve(cleanPath));
    if (rel.startsWith('..') || isAbsolute(rel)) {
      throw new Error(`El archivo "${filePath}" está fuera de repo_root "${repoRoot}".`);
    }
    cleanPath = rel;
  }
  cleanPath = normalizeRelPath(cleanPath);

  const existingRoots = await listRootsForProject(supabase, projectId);
  let resolvedRoot = (rootName || '').trim();

  if (!resolvedRoot && resolvedRepoRoot) {
    const base = basename(resolvedRepoRoot);
    if (existingRoots.includes(base) || existingRoots.length === 0) {
      resolvedRoot = base;
    }
  }

  if (!resolvedRoot && cleanPath) {
    const firstSeg = cleanPath.split('/')[0];
    const matchedPrefixRoot = existingRoots.find((r) => r === firstSeg);
    if (matchedPrefixRoot && cleanPath.includes('/')) {
      resolvedRoot = matchedPrefixRoot;
      cleanPath = cleanPath.slice(matchedPrefixRoot.length + 1);
    }
  }

  if (!resolvedRoot) {
    if (existingRoots.length === 1) {
      resolvedRoot = existingRoots[0];
    } else if (existingRoots.length > 1 && cleanPath) {
      const { data: candidates } = await supabase
        .from('project_tree_nodes')
        .select('root_name')
        .eq('project_id', projectId)
        .eq('path', cleanPath);
      if (candidates && candidates.length === 1) {
        resolvedRoot = candidates[0].root_name;
      } else {
        throw new Error(
          `El proyecto "${projectId}" tiene múltiples raíces (${existingRoots.join(', ')}). Especifica root_name.`
        );
      }
    } else {
      resolvedRoot = resolvedRepoRoot ? basename(resolvedRepoRoot) : projectId;
    }
  } else if (cleanPath.startsWith(`${resolvedRoot}/`)) {
    cleanPath = cleanPath.slice(resolvedRoot.length + 1);
  }

  return {
    rootName: resolvedRoot,
    relPath: cleanPath
  };
}

async function upsertNodesBatch(supabase, projectId, rootName, nodes) {
  const chunkSize = 500;
  const returned = [];

  for (let i = 0; i < nodes.length; i += chunkSize) {
    const slice = nodes.slice(i, i + chunkSize);
    const { data, error } = await supabase.rpc('upsert_project_tree_nodes', {
      target_project_id: projectId,
      target_root_name: rootName,
      nodes: slice
    });
    if (error) throw error;
    if (Array.isArray(data)) returned.push(...data);
  }

  return returned;
}

async function ensureNodeWithAncestors(supabase, {
  projectId,
  rootName,
  relPath,
  isDirectory = false,
  sizeBytes = null,
  source = 'mcp-agent'
}) {
  const payloads = buildNodePayloadsForPath({
    relPath,
    isDirectory,
    sizeBytes,
    rootName,
    source
  });
  const rows = await upsertNodesBatch(supabase, projectId, rootName, payloads);
  const target = rows.find((r) => r.path === relPath);
  if (target) return target;

  const { data, error } = await supabase
    .from('project_tree_nodes')
    .select('*')
    .eq('project_id', projectId)
    .eq('root_name', rootName)
    .eq('path', relPath)
    .single();
  if (error) throw error;
  return data;
}

async function resolveNodeByInput(supabase, {
  nodeId,
  projectId,
  rootName,
  path,
  autoCreate = false,
  source = 'mcp-agent'
}) {
  if (nodeId) {
    const { data, error } = await supabase
      .from('project_tree_nodes')
      .select('*')
      .eq('id', nodeId)
      .single();
    if (error || !data) throw new Error(`No existe ningún nodo con id=${nodeId}.`);
    return data;
  }

  if (!projectId || path === undefined || path === null) {
    throw new Error('Debes indicar node_id o bien project_id + path.');
  }

  const ctx = await resolveTargetFileContext(supabase, {
    projectId,
    rootName,
    filePath: path
  });

  const { data: found, error } = await supabase
    .from('project_tree_nodes')
    .select('*')
    .eq('project_id', projectId)
    .eq('root_name', ctx.rootName)
    .eq('path', ctx.relPath)
    .maybeSingle();

  if (error) throw error;
  if (found) return found;

  if (!autoCreate) {
    throw new Error(
      `Archivo no encontrado en Supabase (${projectId}/${ctx.rootName}/${ctx.relPath}). Usa upsert_file_node o pasa auto_create_node: true.`
    );
  }

  return ensureNodeWithAncestors(supabase, {
    projectId,
    rootName: ctx.rootName,
    relPath: ctx.relPath,
    isDirectory: false,
    source
  });
}

function recordMatchKey(rec) {
  const type = String(rec.record_type ?? rec.recordType ?? 'record').trim().toLowerCase();
  const name = String(rec.name ?? '').trim();
  return `${type}\u0000${name}`;
}

async function syncRecordsForNode(supabase, {
  node,
  incomingRecords = [],
  replaceExistingForFile = false,
  sourceTag = 'mcp-agent'
}) {
  const { data: existingRows, error: fetchErr } = await supabase
    .from('file_records')
    .select('*')
    .eq('node_id', node.id);
  if (fetchErr) throw fetchErr;

  const existingById = new Map((existingRows || []).map((r) => [r.id, r]));
  const existingByKey = new Map();
  for (const row of existingRows || []) {
    const key = recordMatchKey(row);
    if (!existingByKey.has(key)) existingByKey.set(key, []);
    existingByKey.get(key).push(row);
  }

  const matchedExistingIds = new Set();
  const toInsert = [];
  const updates = [];
  let unchanged = 0;

  for (const item of incomingRecords) {
    const recordType = String(item.record_type ?? item.recordType ?? 'method').trim();
    const name = String(item.name ?? '').trim();
    if (!name) continue;

    const signature = item.signature ?? null;
    const description = item.description ?? null;
    const lineNumber = item.line_number ?? item.lineNumber ?? null;

    let existing = null;
    if (item.id && existingById.has(item.id)) {
      existing = existingById.get(item.id);
    } else {
      const candidates = existingByKey.get(recordMatchKey({ record_type: recordType, name })) || [];
      const cls = item.metadata?.className;
      existing = (cls
        ? candidates.find((c) => !matchedExistingIds.has(c.id) && c.metadata?.className === cls)
        : null) || candidates.find((c) => !matchedExistingIds.has(c.id)) || null;
    }

    if (existing) {
      matchedExistingIds.add(existing.id);
      const mergedMetadata = { ...(existing.metadata || {}), ...(item.metadata || {}), syncedBy: sourceTag };
      const changed =
        existing.record_type !== recordType ||
        existing.name !== name ||
        (existing.signature ?? null) !== signature ||
        (existing.description ?? null) !== description ||
        (existing.line_number ?? null) !== lineNumber ||
        JSON.stringify(existing.metadata || {}) !== JSON.stringify(mergedMetadata);

      if (changed) {
        updates.push({
          id: existing.id,
          record_type: recordType,
          name,
          signature,
          description,
          line_number: lineNumber,
          metadata: mergedMetadata
        });
      } else {
        unchanged += 1;
      }
    } else {
      const metadata = { ...(item.metadata || {}), syncedBy: sourceTag };
      toInsert.push({
        node_id: node.id,
        project_id: node.project_id,
        record_type: recordType,
        name,
        signature,
        description,
        line_number: lineNumber,
        metadata
      });
    }
  }

  let deletedCount = 0;
  if (replaceExistingForFile) {
    const obsoleteIds = (existingRows || [])
      .map((r) => r.id)
      .filter((id) => !matchedExistingIds.has(id));

    if (obsoleteIds.length > 0) {
      for (let i = 0; i < obsoleteIds.length; i += 200) {
        const chunk = obsoleteIds.slice(i, i + 200);
        const { error: delErr } = await supabase
          .from('file_records')
          .delete()
          .in('id', chunk);
        if (delErr) throw delErr;
      }
      deletedCount = obsoleteIds.length;
    }
  }

  let insertedRows = [];
  if (toInsert.length > 0) {
    for (let i = 0; i < toInsert.length; i += 200) {
      const chunk = toInsert.slice(i, i + 200);
      const { data: insData, error: insErr } = await supabase
        .from('file_records')
        .insert(chunk)
        .select();
      if (insErr) throw insErr;
      if (insData) insertedRows.push(...insData);
    }
  }

  for (const upd of updates) {
    const { id, ...fields } = upd;
    const { error: updErr } = await supabase
      .from('file_records')
      .update(fields)
      .eq('id', id);
    if (updErr) throw updErr;
  }

  const { data: finalRows, error: finalErr } = await supabase
    .from('file_records')
    .select('*')
    .eq('node_id', node.id)
    .order('line_number', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true });
  if (finalErr) throw finalErr;

  const exactCount = (finalRows || []).length;
  await supabase
    .from('project_tree_nodes')
    .update({ record_count: exactCount, source: sourceTag })
    .eq('id', node.id);

  return {
    inserted: insertedRows.length,
    updated: updates.length,
    deleted: deletedCount,
    unchanged,
    totalRecords: exactCount,
    records: (finalRows || []).map((r) => ({
      id: r.id,
      recordType: r.record_type,
      name: r.name,
      signature: r.signature,
      description: r.description,
      lineNumber: r.line_number,
      metadata: r.metadata
    }))
  };
}

// ── Definición del servidor MCP ─────────────────────────────────────────
const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION
});

// 1. list_projects
server.registerTool(
  'list_projects',
  {
    title: 'Listar proyectos de Pathrimonio',
    description: 'Lista los proyectos de software registrados en Pathrimonio junto con sus raíces de repositorio y estadísticas de archivos y registros.',
    inputSchema: {}
  },
  async () => {
    try {
      const { supabase, authMode } = await getSupabaseClient();
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name, short_name, category, status, version, modules')
        .order('name', { ascending: true });
      if (error) throw error;

      const { data: roots, error: rootErr } = await supabase
        .from('project_tree_nodes')
        .select('project_id, root_name')
        .eq('path', '');
      if (rootErr) throw rootErr;

      const enriched = await Promise.all((projects || []).map(async (p) => {
        const [{ count: fileCount }, { count: recordCount }] = await Promise.all([
          supabase.from('project_tree_nodes').select('*', { count: 'exact', head: true }).eq('project_id', p.id).eq('is_directory', false),
          supabase.from('file_records').select('*', { count: 'exact', head: true }).eq('project_id', p.id)
        ]);
        return {
          ...p,
          roots: (roots || []).filter((r) => r.project_id === p.id).map((r) => r.root_name),
          fileCount: fileCount ?? 0,
          recordCount: recordCount ?? 0
        };
      }));

      return okResult({ authMode, projects: enriched });
    } catch (error) {
      return errResult(error);
    }
  }
);

// 2. get_project_tree
server.registerTool(
  'get_project_tree',
  {
    title: 'Consultar árbol de archivos del proyecto',
    description: 'Obtiene archivos y carpetas registrados en project_tree_nodes para un proyecto, con filtros por raíz, prefijo de ruta, búsqueda y presencia de métodos.',
    inputSchema: {
      project_id: z.string().describe('ID del proyecto (ej. pathway, smatad, core-hub, portal-admin)'),
      root_name: z.string().optional().describe('Nombre de la carpeta raíz (opcional si el proyecto tiene una sola raíz)'),
      path_prefix: z.string().optional().describe('Filtrar nodos cuya ruta empiece por este prefijo (ej. src/services)'),
      search: z.string().optional().describe('Subcadena en nombre o ruta'),
      only_files: z.boolean().optional().describe('Si true, excluye carpetas'),
      only_with_records: z.boolean().optional().describe('Si true, solo retorna archivos con record_count > 0'),
      limit: z.number().int().min(1).max(2000).optional().describe('Máximo de nodos a retornar (default 250)')
    }
  },
  async ({ project_id, root_name, path_prefix, search, only_files, only_with_records, limit = 250 }) => {
    try {
      const { supabase } = await getSupabaseClient();
      let query = supabase
        .from('project_tree_nodes')
        .select('id, project_id, root_name, path, parent_path, name, extension, is_directory, size_bytes, depth, record_count, source, updated_at')
        .eq('project_id', project_id)
        .order('root_name', { ascending: true })
        .order('path', { ascending: true })
        .limit(limit);

      if (root_name) query = query.eq('root_name', root_name);
      if (only_files) query = query.eq('is_directory', false);
      if (only_with_records) query = query.gt('record_count', 0);
      if (path_prefix) query = query.ilike('path', `${normalizeRelPath(path_prefix)}%`);
      if (search) query = query.or(`name.ilike.%${search}%,path.ilike.%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return okResult({ count: (data || []).length, nodes: data || [] });
    } catch (error) {
      return errResult(error);
    }
  }
);

// 3. upsert_file_node
server.registerTool(
  'upsert_file_node',
  {
    title: 'Crear o actualizar nodo de archivo/carpeta',
    description: 'Crea o actualiza un archivo o carpeta en project_tree_nodes (creando automáticamente las carpetas intermedias) SIN borrar los métodos/registros abstractos ya asociados.',
    inputSchema: {
      project_id: z.string().describe('ID del proyecto en Pathrimonio'),
      path: z.string().describe('Ruta relativa desde la raíz del proyecto (ej. src/services/AuthService.ts)'),
      root_name: z.string().optional().describe('Nombre de la carpeta raíz (opcional si existe una única raíz)'),
      is_directory: z.boolean().optional().describe('false para archivos (default), true para carpetas'),
      size_bytes: z.number().int().nonnegative().optional().describe('Tamaño del archivo en bytes'),
      local_file_path: z.string().optional().describe('Opcional: ruta absoluta local para leer size_bytes del disco'),
      source: z.string().optional().describe('Etiqueta de origen (default mcp-agent)')
    }
  },
  async ({ project_id, path, root_name, is_directory = false, size_bytes, local_file_path, source = 'mcp-agent' }) => {
    try {
      const { supabase } = await getSupabaseClient();
      const ctx = await resolveTargetFileContext(supabase, {
        projectId: project_id,
        rootName: root_name,
        filePath: path
      });

      let computedSize = size_bytes ?? null;
      if (computedSize === null && !is_directory && local_file_path && existsSync(local_file_path)) {
        const st = statSync(local_file_path);
        if (st.isFile()) computedSize = st.size;
      }

      const node = await ensureNodeWithAncestors(supabase, {
        projectId: project_id,
        rootName: ctx.rootName,
        relPath: ctx.relPath,
        isDirectory: is_directory,
        sizeBytes: computedSize,
        source
      });

      return okResult({ node });
    } catch (error) {
      return errResult(error);
    }
  }
);

// 4. rename_or_move_file_node
server.registerTool(
  'rename_or_move_file_node',
  {
    title: 'Renombrar o mover archivo/carpeta',
    description: 'Cambia la ruta o nombre de un archivo (o carpeta y todo su subárbol) preservando los IDs de nodo y todos los métodos/registros asociados.',
    inputSchema: {
      project_id: z.string(),
      old_path: z.string().describe('Ruta relativa actual'),
      new_path: z.string().describe('Nueva ruta relativa'),
      root_name: z.string().optional()
    }
  },
  async ({ project_id, old_path, new_path, root_name }) => {
    try {
      const { supabase } = await getSupabaseClient();
      const oldCtx = await resolveTargetFileContext(supabase, { projectId: project_id, rootName: root_name, filePath: old_path });
      const newRel = normalizeRelPath(new_path);

      const { data: existing, error } = await supabase
        .from('project_tree_nodes')
        .select('*')
        .eq('project_id', project_id)
        .eq('root_name', oldCtx.rootName)
        .eq('path', oldCtx.relPath)
        .single();
      if (error || !existing) {
        throw new Error(`No existe la ruta origen: ${project_id}/${oldCtx.rootName}/${oldCtx.relPath}`);
      }

      // Asegurar nuevas carpetas padre para el destino
      const newDirSegments = newRel.split('/').slice(0, -1);
      if (newDirSegments.length > 0) {
        await ensureNodeWithAncestors(supabase, {
          projectId: project_id,
          rootName: oldCtx.rootName,
          relPath: newDirSegments.join('/'),
          isDirectory: true,
          source: 'mcp-agent'
        });
      }

      if (!existing.is_directory) {
        const newName = newRel.split('/').pop();
        const newParent = newRel.includes('/') ? newRel.slice(0, newRel.lastIndexOf('/')) : '';
        const newExt = getExtension(newName) || null;
        const newDepth = newRel.split('/').filter(Boolean).length;

        const { data: updated, error: updErr } = await supabase
          .from('project_tree_nodes')
          .update({
            path: newRel,
            parent_path: newParent,
            name: newName,
            extension: newExt,
            depth: newDepth,
            source: 'mcp-agent'
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (updErr) throw updErr;

        return okResult({ movedNodes: 1, node: updated });
      }

      // Si es carpeta, actualizar la carpeta y sus descendientes preservando IDs y file_records
      const escapedOldPath = oldCtx.relPath.replace(/"/g, '\\"');
      const { data: subtree, error: subErr } = await supabase
        .from('project_tree_nodes')
        .select('*')
        .eq('project_id', project_id)
        .eq('root_name', oldCtx.rootName)
        .or(`path.eq."${escapedOldPath}",path.like."${escapedOldPath}/%"`);
      if (subErr) throw subErr;

      let updatedCount = 0;
      for (const item of subtree || []) {
        const suffix = item.path === oldCtx.relPath ? '' : item.path.slice(oldCtx.relPath.length);
        const targetPath = `${newRel}${suffix}`;
        const targetParent = targetPath.includes('/') ? targetPath.slice(0, targetPath.lastIndexOf('/')) : '';
        const targetName = targetPath.split('/').pop();
        const targetDepth = targetPath.split('/').filter(Boolean).length;

        const { error: itemUpdErr } = await supabase
          .from('project_tree_nodes')
          .update({
            path: targetPath,
            parent_path: targetParent,
            name: targetName,
            depth: targetDepth,
            source: 'mcp-agent'
          })
          .eq('id', item.id);
        if (itemUpdErr) throw itemUpdErr;
        updatedCount += 1;
      }

      return okResult({ movedNodes: updatedCount, oldPath: oldCtx.relPath, newPath: newRel });
    } catch (error) {
      return errResult(error);
    }
  }
);

// 5. delete_file_node
server.registerTool(
  'delete_file_node',
  {
    title: 'Eliminar archivo o carpeta del árbol',
    description: 'Elimina un nodo de archivo (o recursivamente una carpeta y sus hijos si recursive=true) junto con sus file_records por cascada.',
    inputSchema: {
      node_id: z.string().optional(),
      project_id: z.string().optional(),
      root_name: z.string().optional(),
      path: z.string().optional(),
      recursive: z.boolean().optional().describe('Si true y es carpeta, elimina también todo su contenido')
    }
  },
  async ({ node_id, project_id, root_name, path, recursive = false }) => {
    try {
      const { supabase } = await getSupabaseClient();
      const node = await resolveNodeByInput(supabase, {
        nodeId: node_id,
        projectId: project_id,
        rootName: root_name,
        path,
        autoCreate: false
      });

      if (node.is_directory && recursive) {
        let delQuery = supabase
          .from('project_tree_nodes')
          .delete()
          .eq('project_id', node.project_id)
          .eq('root_name', node.root_name);

        if (node.path) {
          const escapedPath = node.path.replace(/"/g, '\\"');
          delQuery = delQuery.or(`path.eq."${escapedPath}",path.like."${escapedPath}/%"`);
        }

        const { data: deleted, error } = await delQuery.select('id');
        if (error) throw error;
        return okResult({ deletedCount: (deleted || []).length, path: node.path });
      }

      const { error } = await supabase
        .from('project_tree_nodes')
        .delete()
        .eq('id', node.id);
      if (error) throw error;
      return okResult({ deletedCount: 1, id: node.id, path: node.path });
    } catch (error) {
      return errResult(error);
    }
  }
);

// 6. list_file_records
server.registerTool(
  'list_file_records',
  {
    title: 'Listar métodos y registros abstractos',
    description: 'Lista métodos, funciones, clases, hooks, componentes, tablas o contratos registrados en file_records para un archivo específico o buscando en todo un proyecto.',
    inputSchema: {
      node_id: z.string().optional().describe('UUID del nodo de archivo (opcional si das project_id + path)'),
      project_id: z.string().optional().describe('ID del proyecto'),
      root_name: z.string().optional(),
      path: z.string().optional().describe('Ruta relativa del archivo dentro del proyecto'),
      record_type: z.string().optional().describe('Filtrar por tipo (method, function, class, component, hook, table, etc.)'),
      search: z.string().optional().describe('Buscar por nombre o firma')
    }
  },
  async ({ node_id, project_id, root_name, path, record_type, search }) => {
    try {
      const { supabase } = await getSupabaseClient();

      if (node_id || path) {
        const node = await resolveNodeByInput(supabase, {
          nodeId: node_id,
          projectId: project_id,
          rootName: root_name,
          path,
          autoCreate: false
        });

        let q = supabase
          .from('file_records')
          .select('*')
          .eq('node_id', node.id)
          .order('line_number', { ascending: true, nullsFirst: false })
          .order('name', { ascending: true });
        if (record_type) q = q.eq('record_type', record_type);
        if (search) q = q.or(`name.ilike.%${search}%,signature.ilike.%${search}%`);

        const { data, error } = await q;
        if (error) throw error;
        return okResult({
          node: { id: node.id, projectId: node.project_id, rootName: node.root_name, path: node.path },
          count: (data || []).length,
          records: data || []
        });
      }

      if (!project_id) {
        throw new Error('Proporciona node_id, o project_id + path, o al menos project_id para buscar en el proyecto.');
      }

      let q = supabase
        .from('file_records')
        .select('*, node:project_tree_nodes(path, root_name, name)')
        .eq('project_id', project_id)
        .order('created_at', { ascending: false })
        .limit(250);
      if (record_type) q = q.eq('record_type', record_type);
      if (search) q = q.or(`name.ilike.%${search}%,signature.ilike.%${search}%`);

      const { data, error } = await q;
      if (error) throw error;
      return okResult({ count: (data || []).length, records: data || [] });
    } catch (error) {
      return errResult(error);
    }
  }
);

// 7. upsert_file_records
const recordItemSchema = z.object({
  id: z.string().optional().describe('UUID del registro existente si se desea actualizar por ID exacto'),
  record_type: z.string().describe('Tipo: method, function, class, component, hook, interface, type, variable, constant, table, route, etc.'),
  name: z.string().describe('Nombre o identificador (ej. QuoteService.calculateTotal o createGoal)'),
  signature: z.string().optional().describe('Firma abstracta tipada sin implementación (ej. public async createGoal(cmd: CreateGoalCmd): Promise<string>)'),
  description: z.string().optional().describe('Resumen del contrato o responsabilidad'),
  line_number: z.number().int().positive().optional().describe('Número de línea aproximado en el archivo real'),
  metadata: z.record(z.unknown()).optional().describe('Metadatos extra: visibility, isAsync, className, layer, etc.')
});

server.registerTool(
  'upsert_file_records',
  {
    title: 'Crear o actualizar métodos/registros en un archivo',
    description: 'Inserta o actualiza métodos, funciones, clases u otros registros abstractos dentro de un archivo. Empareja automáticamente por id o por (record_type, name, className). Si replace_existing_for_file=true, elimina los registros obsoletos del archivo.',
    inputSchema: {
      node_id: z.string().optional(),
      project_id: z.string().optional(),
      root_name: z.string().optional(),
      path: z.string().optional(),
      auto_create_node: z.boolean().optional().describe('Si true, crea el nodo del archivo si aún no existe en Supabase'),
      replace_existing_for_file: z.boolean().optional().describe('Si true, reemplaza la lista completa de registros del archivo sincronizando bajas'),
      records: z.array(recordItemSchema).describe('Lista de métodos o registros abstractos')
    }
  },
  async ({
    node_id,
    project_id,
    root_name,
    path,
    auto_create_node = true,
    replace_existing_for_file = false,
    records
  }) => {
    try {
      const { supabase } = await getSupabaseClient();
      const node = await resolveNodeByInput(supabase, {
        nodeId: node_id,
        projectId: project_id,
        rootName: root_name,
        path,
        autoCreate: auto_create_node
      });

      const result = await syncRecordsForNode(supabase, {
        node,
        incomingRecords: records,
        replaceExistingForFile: replace_existing_for_file
      });

      return okResult({
        node: { id: node.id, projectId: node.project_id, rootName: node.root_name, path: node.path },
        ...result
      });
    } catch (error) {
      return errResult(error);
    }
  }
);

// 8. delete_file_record
server.registerTool(
  'delete_file_record',
  {
    title: 'Eliminar método o registro abstracto',
    description: 'Elimina un registro abstracto específico de file_records por su record_id o por (project_id, path, name).',
    inputSchema: {
      record_id: z.string().optional(),
      project_id: z.string().optional(),
      root_name: z.string().optional(),
      path: z.string().optional(),
      name: z.string().optional(),
      record_type: z.string().optional()
    }
  },
  async ({ record_id, project_id, root_name, path, name, record_type }) => {
    try {
      const { supabase } = await getSupabaseClient();

      if (record_id) {
        const { data: deleted, error } = await supabase
          .from('file_records')
          .delete()
          .eq('id', record_id)
          .select();
        if (error) throw error;
        return okResult({ deletedCount: (deleted || []).length, deleted });
      }

      if (!project_id || !path || !name) {
        throw new Error('Proporciona record_id o bien project_id + path + name.');
      }

      const node = await resolveNodeByInput(supabase, {
        projectId: project_id,
        rootName: root_name,
        path,
        autoCreate: false
      });

      let q = supabase
        .from('file_records')
        .delete()
        .eq('node_id', node.id)
        .eq('name', name);
      if (record_type) q = q.eq('record_type', record_type);

      const { data: deleted, error } = await q.select();
      if (error) throw error;
      return okResult({ deletedCount: (deleted || []).length, deleted });
    } catch (error) {
      return errResult(error);
    }
  }
);

// 9. sync_modified_file (one-shot local AST extraction + node + records sync)
server.registerTool(
  'sync_modified_file',
  {
    title: 'Sincronizar archivo real modificado con la web',
    description: 'Herramienta principal para agentes tras editar un archivo real: lee el archivo desde el disco local, extrae únicamente sus métodos/firmas abstractas (Zero-Code Leakage, sin cuerpo de implementación), asegura el nodo en project_tree_nodes y sincroniza file_records en Supabase en una sola llamada.',
    inputSchema: {
      project_id: z.string().describe('ID del proyecto en Pathrimonio (ej. pathway, smatad, core-hub, portal-admin)'),
      local_file_path: z.string().describe('Ruta absoluta del archivo real modificado en disco'),
      repo_root: z.string().optional().describe('Ruta absoluta de la carpeta raíz local del proyecto para derivar path relativo'),
      root_name: z.string().optional().describe('Nombre de la raíz en Pathrimonio (ej. Pathway, smatad-rn-prototype)'),
      relative_path: z.string().optional().describe('Ruta relativa explícita si no se pasa repo_root'),
      records: z.array(recordItemSchema).optional().describe('Opcional: sobrescribir registros manualmente en lugar de extraerlos automáticamente')
    }
  },
  async ({ project_id, local_file_path, repo_root, root_name, relative_path, records }) => {
    try {
      const { supabase } = await getSupabaseClient();
      const absFile = resolve(local_file_path);

      const extraction = extractAbstractRecordsFromFile(absFile);
      const ctx = await resolveTargetFileContext(supabase, {
        projectId: project_id,
        rootName: root_name,
        filePath: relative_path || absFile,
        repoRoot: repo_root
      });

      const node = await ensureNodeWithAncestors(supabase, {
        projectId: project_id,
        rootName: ctx.rootName,
        relPath: ctx.relPath,
        isDirectory: false,
        sizeBytes: extraction.sizeBytes,
        source: 'mcp-agent'
      });

      const targetRecords = Array.isArray(records) ? records : extraction.records;
      const syncSummary = await syncRecordsForNode(supabase, {
        node,
        incomingRecords: targetRecords,
        replaceExistingForFile: true,
        sourceTag: 'mcp-agent'
      });

      return okResult({
        projectId: project_id,
        rootName: ctx.rootName,
        path: ctx.relPath,
        nodeId: node.id,
        sizeBytes: extraction.sizeBytes,
        extractedAutomatically: !Array.isArray(records),
        ...syncSummary
      });
    } catch (error) {
      return errResult(error);
    }
  }
);

// 10. sync_directory_from_disk
server.registerTool(
  'sync_directory_from_disk',
  {
    title: 'Sincronizar carpeta de proyecto desde disco',
    description: 'Sincroniza incrementalmente el árbol de un repositorio local hacia project_tree_nodes (preservando node_ids y registros manuales existentes). Opcionalmente extrae firmas abstractas de los archivos soportados y poda archivos eliminados.',
    inputSchema: {
      project_id: z.string().describe('ID del proyecto en Pathrimonio'),
      directory_path: z.string().describe('Ruta absoluta de la carpeta raíz del proyecto real'),
      root_name: z.string().optional().describe('Nombre raíz a usar en Supabase (default: nombre de la carpeta)'),
      path_filter: z.string().optional().describe('Subcarpeta relativa opcional para sincronización parcial (ej. src/services)'),
      extract_abstract_signatures: z.boolean().optional().describe('Si true, extrae automáticamente métodos/clases/funciones de archivos de código hacia file_records (default false)'),
      prune_deleted: z.boolean().optional().describe('Si true (solo sin path_filter o dentro del prefijo), elimina de Supabase archivos que ya no existen en disco (default false)')
    }
  },
  async ({
    project_id,
    directory_path,
    root_name,
    path_filter = '',
    extract_abstract_signatures = false,
    prune_deleted = false
  }) => {
    try {
      const { supabase } = await getSupabaseClient();
      const scan = scanLocalDirectory({
        directoryPath: directory_path,
        rootName: root_name,
        extractSignatures: extract_abstract_signatures,
        pathFilter: path_filter
      });

      const upsertedRows = await upsertNodesBatch(supabase, project_id, scan.rootName, scan.nodes);

      let prunedCount = 0;
      if (prune_deleted) {
        const scannedPaths = new Set(scan.nodes.map((n) => n.path));
        const filterNorm = normalizeRelPath(path_filter);
        const pageSize = 1000;
        let from = 0;
        const staleIds = [];

        while (true) {
          let q = supabase
            .from('project_tree_nodes')
            .select('id, path')
            .eq('project_id', project_id)
            .eq('root_name', scan.rootName)
            .range(from, from + pageSize - 1);
          if (filterNorm) q = q.like('path', `${filterNorm}%`);

          const { data, error } = await q;
          if (error) throw error;
          for (const row of data || []) {
            if (row.path !== '' && !scannedPaths.has(row.path)) {
              staleIds.push(row.id);
            }
          }
          if (!data || data.length < pageSize) break;
          from += pageSize;
        }

        for (let i = 0; i < staleIds.length; i += 200) {
          const chunk = staleIds.slice(i, i + 200);
          const { error: delErr } = await supabase
            .from('project_tree_nodes')
            .delete()
            .in('id', chunk);
          if (delErr) throw delErr;
        }
        prunedCount = staleIds.length;
      }

      let syncedFilesWithRecords = 0;
      let totalRecordsSynced = 0;
      if (extract_abstract_signatures && scan.extractedByPath.size > 0) {
        const nodeByPath = new Map(upsertedRows.map((row) => [row.path, row]));
        const entries = Array.from(scan.extractedByPath.entries());
        const concurrency = 8;

        for (let i = 0; i < entries.length; i += concurrency) {
          const batch = entries.slice(i, i + concurrency);
          const results = await Promise.all(batch.map(async ([relPath, records]) => {
            let node = nodeByPath.get(relPath);
            if (!node) {
              const { data } = await supabase
                .from('project_tree_nodes')
                .select('*')
                .eq('project_id', project_id)
                .eq('root_name', scan.rootName)
                .eq('path', relPath)
                .maybeSingle();
              node = data;
            }
            if (!node) return null;
            return syncRecordsForNode(supabase, {
              node,
              incomingRecords: records,
              replaceExistingForFile: true,
              sourceTag: 'mcp-agent'
            });
          }));

          for (const summary of results) {
            if (!summary) continue;
            syncedFilesWithRecords += 1;
            totalRecordsSynced += summary.totalRecords;
          }
        }
      }

      return okResult({
        projectId: project_id,
        rootName: scan.rootName,
        totalNodesSynced: scan.nodes.length,
        filesCount: scan.nodes.filter((n) => !n.isDirectory).length,
        foldersCount: scan.nodes.filter((n) => n.isDirectory).length,
        prunedCount,
        truncated: scan.truncated,
        syncedFilesWithRecords,
        totalRecordsSynced
      });
    } catch (error) {
      return errResult(error);
    }
  }
);

// Iniciar transporte Stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[${SERVER_NAME}] MCP server v${SERVER_VERSION} ready on stdio.`);
}

main().catch((err) => {
  console.error(`[${SERVER_NAME}] Fatal startup error:`, err);
  process.exit(1);
});
