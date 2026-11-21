// Despliega el esquema y el seed de PATHrimonio en Supabase.
//
// Uso:
//   node scripts/deploy-supabase.mjs
//   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/deploy-supabase.mjs
//   SUPABASE_PROJECT_NAME=pathrimonio node scripts/deploy-supabase.mjs
//
// Si el proyecto no existe y definís SUPABASE_ORG_ID + SUPABASE_DB_PASSWORD,
// lo crea automáticamente (region por defecto: sa-east-1).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const API = 'https://api.supabase.com/v1';
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const tokenFile = 'F:/Tokens Stack Tecnologico/Token acceso 40 supabase.txt';

const token = (process.env.SUPABASE_ACCESS_TOKEN || readFileSync(tokenFile, 'utf8')).trim();
if (!token.startsWith('sbp_')) {
  console.error('El token no parece un PAT de Supabase (debe empezar con sbp_).');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
};

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} -> ${response.status}: ${text.slice(0, 800)}`);
  }
  return text ? JSON.parse(text) : null;
}

const projectName = (process.env.SUPABASE_PROJECT_NAME || 'pathrimonio').toLowerCase();

console.log('Buscando proyecto en Supabase...');
let projects = await api('/projects');
let project = projects.find((p) => p.name.toLowerCase() === projectName)
  || projects.find((p) => p.name.toLowerCase().includes('pathrimonio'));

if (!project && process.env.SUPABASE_ORG_ID && process.env.SUPABASE_DB_PASSWORD) {
  console.log(`No existe. Creando "${projectName}"...`);
  project = await api('/projects', {
    method: 'POST',
    body: JSON.stringify({
      organization_id: process.env.SUPABASE_ORG_ID,
      name: projectName,
      db_pass: process.env.SUPABASE_DB_PASSWORD,
      region: process.env.SUPABASE_REGION || 'sa-east-1',
      plan: process.env.SUPABASE_PLAN || 'free'
    })
  });
  console.log(`Proyecto creado: ${project.id}`);
}

if (!project) {
  const orgs = await api('/organizations');
  console.error('No encontré un proyecto de PATHrimonio y faltan datos para crearlo.');
  console.error('Organizaciones disponibles:');
  for (const org of orgs) console.error(`  - ${org.name} (${org.id})`);
  console.error('');
  console.error('Opciones:');
  console.error('  1. Creá el proyecto en https://supabase.com/dashboard y volvé a correr este script.');
  console.error('  2. Exportá SUPABASE_ORG_ID y SUPABASE_DB_PASSWORD y corré de nuevo para crearlo automáticamente.');
  process.exit(1);
}

console.log(`Proyecto: ${project.name} (${project.id})`);

for (let attempt = 1; attempt <= 90; attempt += 1) {
  const current = await api(`/projects/${project.id}`);
  if (current.status === 'ACTIVE_HEALTHY') {
    console.log('Proyecto activo.');
    break;
  }
  if (attempt === 90) {
    throw new Error(`El proyecto no quedó activo (estado: ${current.status}).`);
  }
  console.log(`Esperando proyecto... estado: ${current.status}`);
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 5000));
}

async function runSql(label, sql) {
  console.log(`Aplicando ${label} (${sql.length} bytes)...`);
  const result = await api(`/projects/${project.id}/database/query`, {
    method: 'POST',
    body: JSON.stringify({ query: sql })
  });
  console.log(`${label}: OK`);
  return result;
}

const schema = readFileSync(resolve(root, 'supabase/migrations/20261121000100_init.sql'), 'utf8');
const seed = readFileSync(resolve(root, 'supabase/seed.sql'), 'utf8');

await runSql('esquema', schema);
await runSql('seed', seed);

const verification = await runSql(
  'verificación',
  `select
     (select count(*) from public.projects) as projects,
     (select count(*) from public.portal_users) as users,
     (select count(*) from public.actors) as actors,
     (select count(*) from public.stories) as stories,
     (select count(*) from public.story_criteria) as criteria,
     (select count(*) from public.interfaces) as interfaces,
     (select count(*) from public.interface_roles) as interface_roles,
     (select count(*) from public.data_models) as data_models,
     (select count(*) from public.data_model_attributes) as attributes,
     (select count(*) from public.files) as files;`
);

console.log('Verificación:', JSON.stringify(verification));
console.log('');
console.log('Deploy completo.');
console.log(`Project URL: https://${project.id}.supabase.co`);
