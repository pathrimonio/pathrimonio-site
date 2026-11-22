import { requireSupabase } from './supabase.js';

// ── Helpers ───────────────────────────────────────────────────
const check = ({ data, error }) => {
  if (error) throw error;
  return data;
};

const dateOnly = (value) => {
  const text = String(value || '');
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
};

const orNull = (value) => (value === undefined || value === '' ? null : value);

// ── Mappers: DB row -> app shape ──────────────────────────────
const mapProject = (row) => ({
  id: row.id,
  name: row.name,
  shortName: row.short_name,
  subtitle: row.subtitle,
  description: row.description,
  category: row.category,
  icon: row.icon,
  color: row.color,
  status: row.status,
  client: row.client,
  version: row.version,
  modules: row.modules || []
});

const mapStory = (row) => ({
  id: row.id,
  projectId: row.project_id,
  module: row.module,
  priority: row.priority,
  status: row.status,
  role: row.role,
  action: row.action,
  benefit: row.benefit,
  criteria: (row.story_criteria || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((criterion) => ({ id: criterion.id, text: criterion.text, checked: criterion.checked })),
  attachmentsCount: row.attachments_count ?? 0,
  attachmentName: row.attachment_name,
  author: row.author,
  createdAt: row.created_at_label,
  image: row.image,
  imageMeta: row.image_meta
});

const mapInterface = (row) => {
  let images = [];
  if (row.image) {
    try {
      const parsed = JSON.parse(row.image);
      if (Array.isArray(parsed)) {
        images = parsed.filter(Boolean);
      } else if (typeof row.image === 'string') {
        images = [row.image];
      }
    } catch (_) {
      images = [row.image];
    }
  }

  // Parse hotspots from details if serialized
  let detailsText = row.details;
  let hotspots = [];
  if (row.details) {
    try {
      const parsed = JSON.parse(row.details);
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.hotspots)) {
          hotspots = parsed.hotspots;
        }
        if (typeof parsed.text === 'string') {
          detailsText = parsed.text;
        }
      }
    } catch (_) {}
  }

  return {
    id: row.id,
    projectId: row.project_id,
    number: row.number,
    title: row.title,
    fullName: row.full_name,
    module: row.module,
    status: row.status,
    platform: row.platform,
    image: images[0] || row.image || null,
    images: images,
    hotspots: hotspots,
    imagePlaceholder: row.image_placeholder,
    fields: {
      objetivo: row.objective,
      contenido: row.content,
      reglas: row.rules,
      detalles: detailsText
    },
    roles: (row.interface_roles || [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((role) => role.role_name),
    linkedStory: row.linked_story_id,
    author: row.author,
    reviewedBy: row.reviewed_by,
    approvedAt: row.approved_at,
    version: row.version,
    imageAspect: row.image_aspect,
    dataUsage: (row.interface_data_usage || [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((ref) => ({
        key: `${ref.data_model_id || ref.table_name}:${ref.attribute_id || ref.attribute_name}`,
        tableId: ref.data_model_id,
        tableName: ref.table_name,
        tableLabel: ref.table_label,
        schema: ref.schema_name,
        attribute: ref.attribute_name,
        type: ref.data_type,
        isPrimary: ref.is_primary,
        foreignKey: ref.foreign_key
      }))
  };
};

const mapDataModel = (row) => ({
  id: row.id,
  projectId: row.project_id,
  tableName: row.table_name,
  name: row.name,
  module: row.module,
  storageTarget: row.storage_target,
  storageLocation: row.storage_location,
  syncStrategy: row.sync_strategy,
  status: row.status,
  description: row.description,
  linkedStory: row.linked_story_id,
  linkedInterface: row.linked_interface_id,
  author: row.author,
  approvedAt: row.approved_at,
  version: row.version,
  attributes: (row.data_model_attributes || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      type: attribute.data_type,
      isPrimary: attribute.is_primary,
      isNullable: attribute.is_nullable,
      isUnique: attribute.is_unique,
      foreignKey: attribute.foreign_key,
      defaultValue: attribute.default_value,
      description: attribute.description
    }))
});

const mapActor = (row) => ({
  id: row.id,
  projectId: row.project_id,
  name: row.name,
  category: row.category,
  avatarIcon: row.avatar_icon,
  color: row.color,
  description: row.description,
  permissionLevel: row.permission_level,
  systemAreas: row.system_areas || [],
  assignedWorker: row.assigned_worker,
  assignedWorkerName: row.assigned_worker_name,
  status: row.status,
  createdAt: row.created_at_label || row.created_at,
  isPrimaryRole: row.is_primary_role
});

const mapFile = (row) => ({
  id: row.id,
  projectId: row.project_id,
  name: row.name,
  category: row.category,
  format: row.format,
  sizeBytes: row.size_bytes,
  sizeFormatted: row.size_formatted,
  version: row.version,
  status: row.status,
  uploadedBy: row.uploaded_by,
  uploadedAt: row.uploaded_at,
  description: row.description,
  tags: row.tags || [],
  linkedEntity: row.linked_entity,
  downloadUrl: row.download_url,
  contentPreview: row.content_preview
});

// ── Read ──────────────────────────────────────────────────────
export async function fetchWorkspace() {
  const db = requireSupabase();

  const [projects, stories, interfaces, dataModels, actors, files, modules] = await Promise.all([
    db.from('projects').select('*').order('name'),
    db.from('stories').select('*, story_criteria(*)').order('id'),
    db.from('interfaces').select('*, interface_roles(*), interface_data_usage(*)').order('id'),
    db.from('data_models').select('*, data_model_attributes(*)').order('id'),
    db.from('actors').select('*').order('id'),
    db.from('files').select('*').order('id'),
    db.from('interface_modules').select('*').order('name')
  ]);

  return {
    projects: check(projects).map(mapProject),
    stories: check(stories).map(mapStory),
    interfaces: check(interfaces).map(mapInterface),
    dataModels: check(dataModels).map(mapDataModel),
    actors: check(actors).map(mapActor),
    files: check(files).map(mapFile),
    interfaceModules: check(modules)
  };
}

// ── Stories ───────────────────────────────────────────────────
export async function saveStory(story) {
  const db = requireSupabase();

  check(await db.from('stories').upsert({
    id: story.id,
    project_id: story.projectId,
    module: orNull(story.module),
    priority: orNull(story.priority),
    status: orNull(story.status),
    role: orNull(story.role),
    action: orNull(story.action),
    benefit: orNull(story.benefit),
    attachments_count: story.attachmentsCount ?? 0,
    attachment_name: orNull(story.attachmentName),
    author: orNull(story.author),
    created_at_label: orNull(story.createdAt),
    image: orNull(story.image),
    image_meta: orNull(story.imageMeta)
  }, { onConflict: 'id' }));

  check(await db.from('story_criteria').delete().eq('story_id', story.id));

  const criteria = (story.criteria || []).map((criterion, index) => ({
    story_id: story.id,
    id: String(criterion.id),
    text: criterion.text,
    checked: Boolean(criterion.checked),
    position: index
  }));

  if (criteria.length > 0) {
    check(await db.from('story_criteria').insert(criteria));
  }
}

export async function deleteStory(id) {
  const db = requireSupabase();
  check(await db.from('stories').delete().eq('id', id));
}

// ── Interfaces ────────────────────────────────────────────────
export async function saveInterface(item, actorLookup, validDataModelIds, validStoryIds) {
  const db = requireSupabase();

  const resolveActorId = (roleName) => {
    if (!actorLookup) return null;
    if (typeof actorLookup === 'function') return actorLookup(roleName, item.projectId) || null;
    if (actorLookup instanceof Map) {
      return actorLookup.get(`${item.projectId}::${roleName}`) || actorLookup.get(roleName) || null;
    }
    return null;
  };

  const serializedImage = (() => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images.length === 1 ? item.images[0] : JSON.stringify(item.images);
    }
    return item.image || null;
  })();

  const serializedDetails = (() => {
    const plainText = item.fields?.detalles || '';
    if (Array.isArray(item.hotspots) && item.hotspots.length > 0) {
      return JSON.stringify({
        text: plainText,
        hotspots: item.hotspots
      });
    }
    return plainText || null;
  })();

  check(await db.from('interfaces').upsert({
    id: item.id,
    project_id: item.projectId,
    number: orNull(item.number),
    title: item.title,
    full_name: orNull(item.fullName),
    module: orNull(item.module),
    status: orNull(item.status),
    platform: orNull(item.platform),
    image: orNull(serializedImage),
    image_placeholder: orNull(item.imagePlaceholder),
    objective: orNull(item.fields?.objetivo),
    content: orNull(item.fields?.contenido),
    rules: orNull(item.fields?.reglas),
    details: orNull(serializedDetails),
    linked_story_id: item.linkedStory && (!validStoryIds || validStoryIds.has(item.linkedStory))
      ? item.linkedStory
      : null,
    author: orNull(item.author),
    reviewed_by: orNull(item.reviewedBy),
    approved_at: dateOnly(item.approvedAt),
    version: orNull(item.version),
    image_aspect: item.imageAspect ?? null
  }, { onConflict: 'id' }));

  check(await db.from('interface_roles').delete().eq('interface_id', item.id));
  const roles = (item.roles || []).map((role, index) => ({
    interface_id: item.id,
    role_name: String(role),
    actor_id: resolveActorId(String(role)),
    position: index
  }));
  if (roles.length > 0) {
    check(await db.from('interface_roles').insert(roles));
  }

  check(await db.from('interface_data_usage').delete().eq('interface_id', item.id));
  const usage = (item.dataUsage || [])
    .filter((ref) => ref && ref.tableName && ref.attribute)
    .map((ref, index) => ({
      interface_id: item.id,
      data_model_id: ref.tableId && (!validDataModelIds || validDataModelIds.has(ref.tableId))
        ? ref.tableId
        : null,
      attribute_id: String(ref.key || '').split(':')[1] || String(ref.attribute),
      schema_name: ref.schema || 'public',
      table_name: ref.tableName,
      table_label: orNull(ref.tableLabel),
      attribute_name: String(ref.attribute),
      data_type: orNull(ref.type),
      is_primary: Boolean(ref.isPrimary),
      foreign_key: orNull(ref.foreignKey),
      position: index
    }));
  if (usage.length > 0) {
    check(await db.from('interface_data_usage').insert(usage));
  }
}

export async function deleteInterface(id) {
  const db = requireSupabase();
  check(await db.from('interfaces').delete().eq('id', id));
}

// ── Data models ───────────────────────────────────────────────
export async function saveDataModel(model, validStoryIds, validInterfaceIds) {
  const db = requireSupabase();

  // Reuse existing ID if the table already exists in this project to prevent unique constraint conflicts
  let targetId = model.id;
  try {
    const { data: existing } = await db
      .from('data_models')
      .select('id')
      .eq('project_id', model.projectId)
      .eq('table_name', model.tableName)
      .maybeSingle();

    if (existing?.id) {
      targetId = existing.id;
    }
  } catch (_) {}

  check(await db.from('data_models').upsert({
    id: targetId,
    project_id: model.projectId,
    table_name: model.tableName,
    name: model.name,
    module: orNull(model.module),
    storage_target: orNull(model.storageTarget),
    storage_location: orNull(model.storageLocation),
    sync_strategy: orNull(model.syncStrategy),
    status: orNull(model.status),
    description: orNull(model.description),
    linked_story_id: model.linkedStory && (!validStoryIds || validStoryIds.has(model.linkedStory))
      ? model.linkedStory
      : null,
    linked_interface_id: model.linkedInterface && (!validInterfaceIds || validInterfaceIds.has(model.linkedInterface))
      ? model.linkedInterface
      : null,
    author: orNull(model.author),
    approved_at: dateOnly(model.approvedAt),
    version: orNull(model.version)
  }, { onConflict: 'project_id, table_name' }));

  check(await db.from('data_model_attributes').delete().eq('data_model_id', targetId));

  const attributes = (model.attributes || []).map((attribute, index) => ({
    data_model_id: targetId,
    id: String(attribute.id || `attr-${index + 1}`),
    name: attribute.name,
    data_type: attribute.type || 'TEXT',
    is_primary: Boolean(attribute.isPrimary),
    is_nullable: attribute.isNullable !== false,
    is_unique: Boolean(attribute.isUnique),
    foreign_key: orNull(attribute.foreignKey),
    default_value: orNull(attribute.defaultValue),
    description: orNull(attribute.description),
    position: index
  }));

  if (attributes.length > 0) {
    check(await db.from('data_model_attributes').insert(attributes));
  }
}

export async function deleteDataModel(id) {
  const db = requireSupabase();
  check(await db.from('data_models').delete().eq('id', id));
}

// ── Actors ────────────────────────────────────────────────────
export async function saveActor(actor) {
  const db = requireSupabase();
  check(await db.from('actors').upsert({
    id: actor.id,
    project_id: actor.projectId,
    name: actor.name,
    category: orNull(actor.category),
    avatar_icon: orNull(actor.avatarIcon),
    color: orNull(actor.color),
    description: orNull(actor.description),
    permission_level: orNull(actor.permissionLevel),
    system_areas: actor.systemAreas || [],
    assigned_worker: orNull(actor.assignedWorker),
    assigned_worker_name: orNull(actor.assignedWorkerName),
    status: orNull(actor.status),
    is_primary_role: Boolean(actor.isPrimaryRole),
    created_at: dateOnly(actor.createdAt),
    created_at_label: orNull(actor.createdAt)
  }, { onConflict: 'id' }));
}

export async function deleteActor(id) {
  const db = requireSupabase();
  check(await db.from('actors').delete().eq('id', id));
}

// ── Files ─────────────────────────────────────────────────────
export async function saveFile(file) {
  const db = requireSupabase();
  check(await db.from('files').upsert({
    id: file.id,
    project_id: file.projectId,
    name: file.name,
    category: orNull(file.category),
    format: orNull(file.format),
    size_bytes: file.sizeBytes ?? null,
    size_formatted: orNull(file.sizeFormatted),
    version: orNull(file.version),
    status: orNull(file.status),
    uploaded_by: orNull(file.uploadedBy),
    uploaded_at: dateOnly(file.uploadedAt),
    description: orNull(file.description),
    tags: file.tags || [],
    linked_entity: orNull(file.linkedEntity),
    download_url: orNull(file.downloadUrl),
    content_preview: orNull(file.contentPreview)
  }, { onConflict: 'id' }));
}

export async function deleteFile(id) {
  const db = requireSupabase();
  check(await db.from('files').delete().eq('id', id));
}

// ── Projects ──────────────────────────────────────────────────
export async function saveProject(project) {
  const db = requireSupabase();
  check(await db.from('projects').upsert({
    id: project.id,
    name: project.name,
    short_name: orNull(project.shortName),
    subtitle: orNull(project.subtitle),
    description: orNull(project.description),
    category: orNull(project.category),
    icon: orNull(project.icon),
    color: orNull(project.color),
    status: orNull(project.status),
    client: orNull(project.client),
    version: orNull(project.version),
    modules: project.modules || []
  }, { onConflict: 'id' }));
}

// ── Interface module catalog ──────────────────────────────────
export async function addInterfaceModule(name) {
  const db = requireSupabase();
  check(await db.from('interface_modules').insert({ name }));
}

export async function renameInterfaceModule(oldName, newName) {
  const db = requireSupabase();
  check(await db.from('interface_modules').insert({ name: newName }));
  check(await db.from('interface_modules').delete().eq('name', oldName));
  check(await db.from('interfaces').update({ module: newName }).eq('module', oldName));
}

export async function deleteInterfaceModule(name) {
  const db = requireSupabase();
  check(await db.from('interface_modules').delete().eq('name', name));
  check(await db.from('interfaces').update({ module: 'Sin módulo' }).eq('module', name));
}
