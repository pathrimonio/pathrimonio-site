import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const DEFAULT_CREDENTIALS_FILE = 'F:/Tokens Stack Tecnologico/Supabase PATHrimonio.txt';

function parseEnvFile(filePath) {
  if (!filePath || !existsSync(filePath)) return {};
  const map = {};
  const content = readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = line.slice(0, eqIndex).trim();
    const val = line.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
    map[key] = val;
  }
  return map;
}

function resolveSupabaseConfig() {
  const localEnv = parseEnvFile(resolve(repoRoot, '.env.local'));
  const credFilePath = process.env.PATHRIMONIO_CREDENTIALS_FILE || DEFAULT_CREDENTIALS_FILE;
  const credFileEnv = parseEnvFile(credFilePath);

  const url =
    process.env.PATHRIMONIO_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    localEnv.VITE_SUPABASE_URL ||
    credFileEnv.SUPABASE_URL ||
    '';

  const serviceRoleKey =
    process.env.PATHRIMONIO_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    credFileEnv.SUPABASE_SERVICE_ROLE_KEY ||
    '';

  const anonKey =
    process.env.PATHRIMONIO_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    localEnv.VITE_SUPABASE_ANON_KEY ||
    credFileEnv.SUPABASE_ANON_KEY ||
    '';

  const agentEmail = process.env.PATHRIMONIO_AGENT_EMAIL || '';
  const agentPassword = process.env.PATHRIMONIO_AGENT_PASSWORD || '';

  return {
    url,
    serviceRoleKey,
    anonKey,
    agentEmail,
    agentPassword
  };
}

let cachedClient = null;
let cachedAuthMode = '';

export async function getSupabaseClient() {
  if (cachedClient) return { supabase: cachedClient, authMode: cachedAuthMode };

  const cfg = resolveSupabaseConfig();
  if (!cfg.url) {
    throw new Error(
      'Falta SUPABASE_URL. Configura PATHRIMONIO_SUPABASE_URL en mcp_config.json o en .env.local.'
    );
  }

  if (cfg.serviceRoleKey) {
    cachedClient = createClient(cfg.url, cfg.serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    cachedAuthMode = 'service_role';
    return { supabase: cachedClient, authMode: cachedAuthMode };
  }

  if (cfg.anonKey && cfg.agentEmail && cfg.agentPassword) {
    const client = createClient(cfg.url, cfg.anonKey, {
      auth: { autoRefreshToken: true, persistSession: false }
    });
    const { error } = await client.auth.signInWithPassword({
      email: cfg.agentEmail,
      password: cfg.agentPassword
    });
    if (error) {
      throw new Error(`No se pudo autenticar el agente MCP (${cfg.agentEmail}): ${error.message}`);
    }
    cachedClient = client;
    cachedAuthMode = `authenticated:${cfg.agentEmail}`;
    return { supabase: cachedClient, authMode: cachedAuthMode };
  }

  throw new Error(
    'Faltan credenciales de escritura para Supabase. Configura PATHRIMONIO_SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SERVICE_ROLE_KEY) o bien PATHRIMONIO_SUPABASE_ANON_KEY + PATHRIMONIO_AGENT_EMAIL + PATHRIMONIO_AGENT_PASSWORD.'
  );
}
