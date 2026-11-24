import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ARCHIFY_BIN = 'C:/Users/jhan4/.agents/skills/archify/bin/archify.mjs';

const DEFAULT_ARCHIFY_SOURCES = {
  smatad: [
    'F:/SMATAD/arquitectura_implementacion.html',
    'F:/SMATAD/.archify',
    'F:/SMATAD/smatad-rn-prototype/.archify',
    'public/archify/smatad-arquitectura-implementacion.html'
  ],
  pathway: [
    'F:/Pathway/arquitectura_implementacion.html',
    'F:/Pathway/.archify',
    'public/archify/pathway-architecture.html'
  ],
  'core-hub': ['public/archify/core-hub-architecture.html'],
  'portal-admin': ['public/archify/portal-admin-architecture.html']
};

function slugifyName(input) {
  return String(input || 'diagram')
    .toLowerCase()
    .replace(/\.html?$/i, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '') || 'arquitectura-implementacion';
}

function dirnameCandidateDir(entryPath, rootDir) {
  const abs = entryPath.startsWith('public/') ? resolve(rootDir, entryPath) : resolve(entryPath);
  if (existsSync(abs) && statSync(abs).isDirectory()) return abs;
  return resolve(abs, '..');
}

function collectHtmlFiles(entryPath, depth = 0, out = []) {
  if (!entryPath || depth > 3 || !existsSync(entryPath)) return out;
  const st = statSync(entryPath);
  if (st.isFile()) {
    if (/\.html?$/i.test(entryPath)) out.push(resolve(entryPath));
    return out;
  }
  if (st.isDirectory()) {
    for (const entry of readdirSync(entryPath, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      collectHtmlFiles(join(entryPath, entry.name), depth + 1, out);
    }
  }
  return out;
}

function findFirstCandidateJson(entryPath, depth = 0) {
  if (!entryPath || depth > 3 || !existsSync(entryPath)) return null;
  const st = statSync(entryPath);
  if (st.isDirectory()) {
    const entries = readdirSync(entryPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && /^candidate.*\.json$/i.test(entry.name)) {
        return join(entryPath, entry.name);
      }
    }
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        const nested = findFirstCandidateJson(join(entryPath, entry.name), depth + 1);
        if (nested) return nested;
      }
    }
  }
  return null;
}

function parseArchifyHtmlMeta(filePath, projectId) {
  const htmlContent = readFileSync(filePath, 'utf8');
  const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
  const rawTitle = titleMatch ? titleMatch[1].replace(/\s*·\s*Diagrama\s*$/i, '').trim() : basename(filePath, '.html');
  const genMatch = htmlContent.match(/<meta\s+name="generator"\s+content="([^"]+)"/i);
  const generatorVersion = genMatch ? genMatch[1].trim() : 'archify 3.3.0';
  const fileBase = basename(filePath, '.html');
  const cleanSlug = fileBase.replace(new RegExp(`^${projectId}-`, 'i'), '').replace(/_/g, '-');
  let slug = slugifyName(cleanSlug || fileBase);
  if (slug === 'architecture') {
    slug = projectId === 'smatad' && filePath.includes('20261025')
      ? 'arquitectura-operativa'
      : 'arquitectura-implementacion';
  }
  return {
    projectId,
    slug,
    title: rawTitle || fileBase,
    diagramType: 'architecture',
    htmlContent,
    generatorVersion,
    sourcePath: filePath,
    sizeBytes: statSync(filePath).size,
    metadata: {
      isPrimary: slug === 'arquitectura-implementacion',
      syncedFromLocalhost: true
    }
  };
}

function readJsonBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 10 * 1024 * 1024) {
        rejectBody(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolveBody(raw ? JSON.parse(raw) : {});
      } catch (err) {
        rejectBody(err);
      }
    });
    req.on('error', rejectBody);
  });
}

function archifyLocalDevPlugin() {
  return {
    name: 'pathrimonio-archify-dev-sync',
    configureServer(server) {
      server.middlewares.use('/api/archify/sync', async (req, res, next) => {
        if (req.method !== 'POST') {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, mode: 'dev-archify-bridge', cliAvailable: existsSync(ARCHIFY_BIN) }));
            return;
          }
          next();
          return;
        }

        const remoteIp = req.socket?.remoteAddress || '';
        const isLoopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remoteIp);
        if (!isLoopback) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: 'Archify local bridge only allows loopback requests.' }));
          return;
        }

        try {
          const body = await readJsonBody(req);
          const projectId = String(body.projectId || 'pathway').trim();
          const customRepoPath = body.repoPath ? String(body.repoPath).trim() : '';
          const customHtmlPath = body.htmlPath ? String(body.htmlPath).trim() : '';
          const shouldRegenerate = Boolean(body.regenerate);

          const htmlSet = new Set();
          if (customHtmlPath && existsSync(customHtmlPath)) {
            collectHtmlFiles(customHtmlPath, 0, []).forEach((f) => htmlSet.add(f));
          }
          if (customRepoPath && existsSync(customRepoPath)) {
            collectHtmlFiles(join(customRepoPath, 'arquitectura_implementacion.html'), 0, []).forEach((f) => htmlSet.add(f));
            collectHtmlFiles(join(customRepoPath, '.archify'), 0, []).forEach((f) => htmlSet.add(f));
          }

          if (!customHtmlPath && !customRepoPath) {
            for (const candidatePath of DEFAULT_ARCHIFY_SOURCES[projectId] || []) {
              const abs = candidatePath.startsWith('public/')
                ? resolve(server.config.root, candidatePath)
                : candidatePath;
              collectHtmlFiles(abs, 0, []).forEach((f) => htmlSet.add(f));
            }
          }

          if (htmlSet.size === 0 || shouldRegenerate) {
            const candidateDirs = [
              ...(customRepoPath ? [join(customRepoPath, '.archify')] : []),
              ...(DEFAULT_ARCHIFY_SOURCES[projectId] || [])
            ];
            if (existsSync(ARCHIFY_BIN)) {
              for (const dir of candidateDirs) {
                const candidate = findFirstCandidateJson(dir);
                if (candidate) {
                  const targetHtml = resolve(dirnameCandidateDir(dir, server.config.root), `${projectId}-arquitectura-implementacion.html`);
                  await execFileAsync('node', [ARCHIFY_BIN, 'render', 'architecture', candidate, targetHtml, '--quality', 'showcase'], {
                    timeout: 30000
                  });
                  if (existsSync(targetHtml)) htmlSet.add(targetHtml);
                  break;
                }
              }
            }
          }

          const bySlug = new Map();
          for (const htmlFile of htmlSet) {
            const parsed = parseArchifyHtmlMeta(htmlFile, projectId);
            const existing = bySlug.get(parsed.slug);
            if (!existing || parsed.metadata.isPrimary) {
              bySlug.set(parsed.slug, parsed);
            }
          }
          const artifacts = Array.from(bySlug.values());

          let supabaseSynced = false;
          if (artifacts.length > 0) {
            try {
              const { getSupabaseClient } = await import('./mcp/supabaseClient.mjs');
              const { supabase, authMode } = await getSupabaseClient();
              if (authMode === 'service_role' || authMode === 'authenticated') {
                for (const art of artifacts) {
                  await supabase.from('project_architecture_artifacts').upsert({
                    project_id: art.projectId,
                    slug: art.slug,
                    title: art.title,
                    diagram_type: art.diagramType,
                    html_content: art.htmlContent,
                    generator_version: art.generatorVersion,
                    source_path: art.sourcePath,
                    size_bytes: art.sizeBytes,
                    metadata: art.metadata
                  }, { onConflict: 'project_id,slug' });
                }
                supabaseSynced = true;
              }
            } catch (_) {
              supabaseSynced = false;
            }
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            projectId,
            syncedCount: artifacts.length,
            supabaseSynced,
            artifacts
          }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: err?.message || String(err) }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), archifyLocalDevPlugin()],
  server: {
    port: 3000,
    open: false
  }
});
