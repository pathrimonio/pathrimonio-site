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
  modules: row.modules || [],
  owner_email: row.owner_email || null,
  owner_user_id: row.owner_user_id || null,
  source_type: row.source_type || 'internal'
});

const mapPortalUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  organization: row.organization || null,
  status: row.status || 'active',
  referral_code: row.referral_code || null,
  referred_by_code: row.referred_by_code || null,
  credit_balance_usd: Number(row.credit_balance_usd || 0),
  bonus_role_months: Number(row.bonus_role_months || 0),
  source: row.source || null,
  avatar: row.avatar,
  color: row.color,
  permissions: row.permissions || []
});

const mapProjectMember = (row) => ({
  id: row.id,
  projectId: row.project_id,
  userId: row.user_id,
  role: row.role,
  invitedBy: row.invited_by,
  createdAt: row.created_at
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
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.ultima_fecha_modificacion || row.created_at,
    ultimaFechaModificacion: row.ultima_fecha_modificacion || row.updated_at || row.created_at,
    ultima_fecha_modificacion: row.ultima_fecha_modificacion || row.updated_at || row.created_at,
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

const mapProjectTreeNode = (row) => ({
  id: row.id,
  projectId: row.project_id,
  rootName: row.root_name,
  path: row.path,
  parentPath: row.parent_path,
  name: row.name,
  extension: row.extension,
  isDirectory: row.is_directory,
  sizeBytes: row.size_bytes,
  depth: row.depth,
  recordCount: row.record_count,
  source: row.source,
  createdAt: row.created_at,
  updatedAt: row.updated_at || row.created_at
});

const mapFileRecord = (row) => ({
  id: row.id,
  nodeId: row.node_id,
  projectId: row.project_id,
  recordType: row.record_type,
  name: row.name,
  signature: row.signature,
  description: row.description,
  lineNumber: row.line_number,
  metadata: row.metadata || {},
  createdAt: row.created_at,
  updatedAt: row.updated_at || row.created_at
});

// ── Read ──────────────────────────────────────────────────────
export async function fetchWorkspace() {
  const db = requireSupabase();

  const [projects, stories, interfaces, dataModels, actors, files, modules, portalUsers, projectMembers] = await Promise.all([
    db.from('projects').select('*').order('name'),
    db.from('stories').select('*, story_criteria(*)').order('id'),
    db
      .from('interfaces')
      .select('*, interface_roles(*), interface_data_usage(*)')
      .order('ultima_fecha_modificacion', { ascending: false })
      .order('id'),
    db.from('data_models').select('*, data_model_attributes(*)').order('id'),
    db.from('actors').select('*').order('id'),
    db.from('files').select('*').order('id'),
    db.from('interface_modules').select('*').order('name'),
    db.from('portal_users').select('*').order('name'),
    db.from('project_members').select('*').order('created_at')
  ]);

  return {
    projects: check(projects).map(mapProject),
    stories: check(stories).map(mapStory),
    interfaces: check(interfaces).map(mapInterface),
    dataModels: check(dataModels).map(mapDataModel),
    actors: check(actors).map(mapActor),
    files: check(files).map(mapFile),
    interfaceModules: check(modules),
    portalUsers: check(portalUsers).map(mapPortalUser),
    projectMembers: check(projectMembers).map(mapProjectMember)
  };
}

export async function fetchInterfaces() {
  const db = requireSupabase();
  const res = await db
    .from('interfaces')
    .select('*, interface_roles(*), interface_data_usage(*)')
    .order('ultima_fecha_modificacion', { ascending: false })
    .order('id');
  return check(res).map(mapInterface);
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
    image_aspect: item.imageAspect ?? null,
    ultima_fecha_modificacion:
      item.ultimaFechaModificacion || item.ultima_fecha_modificacion || new Date().toISOString()
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

// ── Project tree ──────────────────────────────────────────────
export async function fetchProjectTree(projectId) {
  const db = requireSupabase();
  const pageSize = 1000;
  let from = 0;
  const rows = [];

  while (true) {
    const { data, error } = await db
      .from('project_tree_nodes')
      .select('*')
      .eq('project_id', projectId)
      .order('root_name', { ascending: true })
      .order('path', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows.map(mapProjectTreeNode);
}

export async function replaceProjectTree({ projectId, rootName, nodes }) {
  const db = requireSupabase();
  const { error } = await db.rpc('replace_project_tree', {
    target_project_id: projectId,
    target_root_name: rootName,
    nodes
  });
  if (error) throw error;
  return fetchProjectTree(projectId);
}

export async function fetchFileRecords(nodeId) {
  const db = requireSupabase();
  const { data, error } = await db
    .from('file_records')
    .select('*')
    .eq('node_id', nodeId)
    .order('line_number', { ascending: true, nullsFirst: false })
    .order('record_type', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data.map(mapFileRecord);
}

export async function fetchProjectFileRecords(projectId) {
  const db = requireSupabase();
  const pageSize = 1000;
  let from = 0;
  const rows = [];

  while (true) {
    const { data, error } = await db
      .from('file_records')
      .select('*')
      .eq('project_id', projectId)
      .order('line_number', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows.map(mapFileRecord);
}

export async function addFileRecord(record) {
  const db = requireSupabase();
  const { data, error } = await db
    .from('file_records')
    .insert({
      node_id: record.nodeId,
      project_id: record.projectId,
      record_type: record.recordType,
      name: record.name,
      signature: orNull(record.signature),
      description: orNull(record.description),
      line_number: record.lineNumber ?? null,
      metadata: record.metadata || {}
    })
    .select()
    .single();

  if (error) throw error;
  return mapFileRecord(data);
}

export async function deleteFileRecord(id) {
  const db = requireSupabase();
  check(await db.from('file_records').delete().eq('id', id));
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
    modules: project.modules || [],
    owner_email: orNull(project.owner_email),
    owner_user_id: orNull(project.owner_user_id),
    source_type: project.source_type || 'internal'
  }, { onConflict: 'id' }));
}

export async function upsertPortalUserRecord(user) {
  const db = requireSupabase();
  check(await db.from('portal_users').upsert({
    id: user.id,
    email: String(user.email || '').trim().toLowerCase(),
    name: user.name || user.email,
    role: user.role || 'Usuario Registrado',
    organization: orNull(user.organization),
    status: user.status || 'active',
    referral_code: orNull(user.referral_code),
    credit_balance_usd: Number(user.credit_balance_usd || 0),
    bonus_role_months: Number(user.bonus_role_months || 0),
    source: orNull(user.source),
    avatar: orNull(user.avatar),
    color: orNull(user.color),
    permissions: user.permissions || ['read', 'write']
  }, { onConflict: 'id' }));
}

export async function deletePortalUserRecord(userId) {
  const db = requireSupabase();
  check(await db.from('portal_users').delete().eq('id', userId));
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

// ── Project members ───────────────────────────────────────────
export async function addProjectMember({ projectId, userId, role = 'viewer', invitedBy = null }) {
  const db = requireSupabase();
  const { data, error } = await db
    .from('project_members')
    .insert({
      project_id: projectId,
      user_id: userId,
      role,
      invited_by: orNull(invitedBy)
    })
    .select()
    .single();
  if (error) throw error;
  return mapProjectMember(data);
}

export async function updateProjectMemberRole(id, role) {
  const db = requireSupabase();
  const { data, error } = await db
    .from('project_members')
    .update({ role })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapProjectMember(data);
}

export async function removeProjectMember(id) {
  const db = requireSupabase();
  check(await db.from('project_members').delete().eq('id', id));
}

// ── Archify interactive HTML artifacts ────────────────────────
function mapArchitectureArtifact(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    slug: row.slug,
    title: row.title,
    diagramType: row.diagram_type || 'architecture',
    htmlContent: row.html_content || '',
    generatorVersion: row.generator_version || 'archify 3.3.0',
    sourcePath: row.source_path || '',
    sizeBytes: Number(row.size_bytes) || 0,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function fetchProjectArchitectureArtifacts(projectId) {
  const db = requireSupabase();
  const { data, error } = await db
    .from('project_architecture_artifacts')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapArchitectureArtifact);
}

export async function upsertProjectArchitectureArtifact(artifact) {
  const db = requireSupabase();
  const htmlContent = String(artifact.htmlContent || artifact.html_content || '');
  const payload = {
    project_id: artifact.projectId || artifact.project_id,
    slug: artifact.slug || 'arquitectura-implementacion',
    title: artifact.title || 'Arquitectura de Implementación · Archify',
    diagram_type: artifact.diagramType || artifact.diagram_type || 'architecture',
    html_content: htmlContent,
    generator_version: artifact.generatorVersion || artifact.generator_version || 'archify 3.3.0',
    source_path: orNull(artifact.sourcePath || artifact.source_path),
    size_bytes: Number(artifact.sizeBytes || artifact.size_bytes) || new TextEncoder().encode(htmlContent).length,
    metadata: artifact.metadata || {}
  };
  const { data, error } = await db
    .from('project_architecture_artifacts')
    .upsert(payload, { onConflict: 'project_id,slug' })
    .select()
    .single();
  if (error) throw error;
  return mapArchitectureArtifact(data);
}
