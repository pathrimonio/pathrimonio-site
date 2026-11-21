// Genera supabase/seed.sql desde los datos reales del repo.
// Uso: node scripts/generate-supabase-seed.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { INITIAL_PROJECTS } from '../src/data/initialProjects.js';
import { INITIAL_STORIES } from '../src/data/initialStories.js';
import { INITIAL_INTERFACES, INTERFACE_MODULE_OPTIONS } from '../src/data/initialInterfaces.js';
import { INITIAL_DATA_MODELS } from '../src/data/initialDataModels.js';
import { INITIAL_ACTORS } from '../src/data/initialActors.js';
import { INITIAL_FILES } from '../src/data/initialFiles.js';
import { DEMO_USERS } from '../src/auth/authConfig.js';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, '../supabase/seed.sql');

const s = (v) => {
  if (v === null || v === undefined) return 'null';
  return `'${String(v).replace(/'/g, "''")}'`;
};
const n = (v) => (v === null || v === undefined ? 'null' : String(v));
const b = (v) => (v ? 'true' : 'false');
const arr = (a) => (Array.isArray(a) && a.length ? `array[${a.map(s).join(', ')}]::text[]` : `'{}'::text[]`);
const date = (v) => (v ? `${s(v)}::date` : 'null');

function insert(table, columns, rows, conflict) {
  if (!rows.length) return '';
  const values = rows.map((row) => `  (${row.join(', ')})`).join(',\n');
  return `insert into public.${table} (${columns.join(', ')}) values\n${values}\n${conflict};\n\n`;
}

function upsert(table, columns, rows, keyColumns) {
  const sets = columns
    .filter((col) => !keyColumns.includes(col))
    .map((col) => `${col} = excluded.${col}`)
    .join(', ');
  const conflict = sets
    ? `on conflict (${keyColumns.join(', ')}) do update set ${sets}`
    : `on conflict (${keyColumns.join(', ')}) do nothing`;
  return insert(table, columns, rows, conflict);
}

const projectIds = new Set(INITIAL_PROJECTS.map((p) => p.id));
const storyIds = new Set(INITIAL_STORIES.map((st) => st.id));
const interfaceIds = new Set(INITIAL_INTERFACES.map((i) => i.id));
const actorByName = new Map(INITIAL_ACTORS.map((a) => [`${a.projectId}::${a.name}`, a.id]));

let sql = `-- ============================================================
-- PATHrimonio — Seed generado desde src/data/*.js
-- Generado por scripts/generate-supabase-seed.mjs
-- No editar a mano: volvé a correr el generador.
-- ============================================================

begin;

`;

// 1. Proyectos
sql += upsert(
  'projects',
  ['id', 'name', 'short_name', 'subtitle', 'description', 'category', 'icon', 'color', 'status', 'client', 'version', 'modules'],
  INITIAL_PROJECTS.map((p) => [
    s(p.id), s(p.name), s(p.shortName), s(p.subtitle), s(p.description), s(p.category),
    s(p.icon), s(p.color), s(p.status), s(p.client), s(p.version), arr(p.modules)
  ]),
  ['id']
);

// 2. Usuarios del portal (sin contraseñas)
sql += upsert(
  'portal_users',
  ['id', 'email', 'name', 'role', 'avatar', 'color', 'permissions'],
  DEMO_USERS.map((u) => [s(u.id), s(u.email), s(u.name), s(u.role), s(u.avatar), s(u.color), arr(u.permissions)]),
  ['id']
);

// 3. Actores
sql += upsert(
  'actors',
  ['id', 'project_id', 'name', 'category', 'avatar_icon', 'color', 'description', 'permission_level', 'system_areas', 'assigned_worker', 'assigned_worker_name', 'status', 'is_primary_role', 'created_at', 'created_at_label'],
  INITIAL_ACTORS.map((a) => [
    s(a.id), s(a.projectId), s(a.name), s(a.category), s(a.avatarIcon), s(a.color),
    s(a.description), s(a.permissionLevel), arr(a.systemAreas), s(a.assignedWorker),
    s(a.assignedWorkerName), s(a.status), b(a.isPrimaryRole), date(a.createdAt), s(a.createdAt)
  ]),
  ['id']
);

// 4. Historias
sql += upsert(
  'stories',
  ['id', 'project_id', 'module', 'priority', 'status', 'role', 'action', 'benefit', 'attachments_count', 'attachment_name', 'author', 'created_at_label', 'image', 'image_meta'],
  INITIAL_STORIES.map((st) => [
    s(st.id), s(st.projectId), s(st.module), s(st.priority), s(st.status), s(st.role),
    s(st.action), s(st.benefit), n(st.attachmentsCount ?? 0), s(st.attachmentName),
    s(st.author), s(st.createdAt), s(st.image), s(st.imageMeta)
  ]),
  ['id']
);

// 4.1 Criterios de aceptación
sql += upsert(
  'story_criteria',
  ['story_id', 'id', 'text', 'checked', 'position'],
  INITIAL_STORIES.flatMap((st) =>
    (st.criteria || []).map((c, index) => [s(st.id), s(c.id), s(c.text), b(c.checked), n(index)])
  ),
  ['story_id', 'id']
);

// 5. Catálogo global de módulos de interfaces
const moduleNames = new Set();
INTERFACE_MODULE_OPTIONS.forEach((m) => { if (m && m !== 'Todos') moduleNames.add(m); });
INITIAL_INTERFACES.forEach((i) => { if (i.module && i.module !== 'Sin módulo') moduleNames.add(i.module); });
sql += upsert(
  'interface_modules',
  ['name'],
  [...moduleNames].sort().map((m) => [s(m)]),
  ['name']
);

// 6. Interfaces
sql += upsert(
  'interfaces',
  ['id', 'project_id', 'number', 'title', 'full_name', 'module', 'status', 'platform', 'image', 'image_placeholder', 'objective', 'content', 'rules', 'details', 'linked_story_id', 'author', 'reviewed_by', 'approved_at', 'version', 'image_aspect'],
  INITIAL_INTERFACES.map((i) => [
    s(i.id), s(i.projectId), s(i.number), s(i.title), s(i.fullName), s(i.module),
    s(i.status), s(i.platform), s(i.image), s(i.imagePlaceholder),
    s(i.fields?.objetivo), s(i.fields?.contenido), s(i.fields?.reglas), s(i.fields?.detalles),
    storyIds.has(i.linkedStory) ? s(i.linkedStory) : 'null',
    s(i.author), s(i.reviewedBy), date(i.approvedAt), s(i.version),
    i.imageAspect === undefined || i.imageAspect === null ? 'null' : n(i.imageAspect)
  ]),
  ['id']
);

// 6.1 Roles de interfaz (resuelve actor_id por nombre dentro del proyecto)
sql += upsert(
  'interface_roles',
  ['interface_id', 'role_name', 'actor_id', 'position'],
  INITIAL_INTERFACES.flatMap((i) =>
    (i.roles || []).map((role, index) => [
      s(i.id), s(role), actorByName.has(`${i.projectId}::${role}`) ? s(actorByName.get(`${i.projectId}::${role}`)) : 'null', n(index)
    ])
  ),
  ['interface_id', 'role_name']
);

// 7. Modelado de datos
sql += upsert(
  'data_models',
  ['id', 'project_id', 'table_name', 'name', 'module', 'storage_target', 'storage_location', 'sync_strategy', 'status', 'description', 'linked_story_id', 'linked_interface_id', 'author', 'approved_at', 'version'],
  INITIAL_DATA_MODELS.map((dm) => [
    s(dm.id), s(dm.projectId), s(dm.tableName), s(dm.name), s(dm.module),
    s(dm.storageTarget), s(dm.storageLocation), s(dm.syncStrategy), s(dm.status), s(dm.description),
    storyIds.has(dm.linkedStory) ? s(dm.linkedStory) : 'null',
    interfaceIds.has(dm.linkedInterface) ? s(dm.linkedInterface) : 'null',
    s(dm.author), date(dm.approvedAt), s(dm.version)
  ]),
  ['id']
);

// 7.1 Atributos del modelo de datos
sql += upsert(
  'data_model_attributes',
  ['data_model_id', 'id', 'name', 'data_type', 'is_primary', 'is_nullable', 'is_unique', 'foreign_key', 'default_value', 'description', 'position'],
  INITIAL_DATA_MODELS.flatMap((dm) =>
    (dm.attributes || []).map((a, index) => [
      s(dm.id), s(a.id), s(a.name), s(a.type), b(a.isPrimary), b(a.isNullable),
      b(a.isUnique), s(a.foreignKey), s(a.defaultValue), s(a.description), n(index)
    ])
  ),
  ['data_model_id', 'id']
);

// 8. Datos usados por interfaz (si alguna ficha ya los trae)
const usageRows = INITIAL_INTERFACES.flatMap((i) =>
  (i.dataUsage || []).map((ref, index) => [
    s(i.id),
    s(ref.tableId),
    s(String(ref.key || '').split(':')[1] || ref.attribute),
    s(ref.schema || 'public'),
    s(ref.tableName),
    s(ref.tableLabel),
    s(ref.attribute),
    s(ref.type),
    b(ref.isPrimary),
    s(ref.foreignKey),
    n(index)
  ])
);
sql += upsert(
  'interface_data_usage',
  ['interface_id', 'data_model_id', 'attribute_id', 'schema_name', 'table_name', 'table_label', 'attribute_name', 'data_type', 'is_primary', 'foreign_key', 'position'],
  usageRows,
  ['interface_id', 'schema_name', 'table_name', 'attribute_name']
);

// 9. Archivos
sql += upsert(
  'files',
  ['id', 'project_id', 'name', 'category', 'format', 'size_bytes', 'size_formatted', 'version', 'status', 'uploaded_by', 'uploaded_at', 'description', 'tags', 'linked_entity', 'download_url', 'content_preview'],
  INITIAL_FILES.map((f) => [
    s(f.id), s(f.projectId), s(f.name), s(f.category), s(f.format), n(f.sizeBytes),
    s(f.sizeFormatted), s(f.version), s(f.status), s(f.uploadedBy), date(f.uploadedAt),
    s(f.description), arr(f.tags), s(f.linkedEntity), s(f.downloadUrl), s(f.contentPreview)
  ]),
  ['id']
);

sql += `commit;\n`;

writeFileSync(outFile, sql, 'utf8');
console.log(`Seed generado: ${outFile}`);
console.log(`Proyectos: ${INITIAL_PROJECTS.length}`);
console.log(`Historias: ${INITIAL_STORIES.length}`);
console.log(`Interfaces: ${INITIAL_INTERFACES.length}`);
console.log(`Modelos de datos: ${INITIAL_DATA_MODELS.length}`);
console.log(`Atributos: ${INITIAL_DATA_MODELS.reduce((acc, dm) => acc + (dm.attributes?.length || 0), 0)}`);
console.log(`Actores: ${INITIAL_ACTORS.length}`);
console.log(`Archivos: ${INITIAL_FILES.length}`);
console.log(`Módulos de interfaz: ${moduleNames.size}`);
console.log(`Usuarios: ${DEMO_USERS.length}`);
