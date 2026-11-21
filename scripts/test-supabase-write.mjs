import { supabase } from '../src/lib/supabase.js';
import {
  saveStory,
  deleteStory,
  saveInterface,
  deleteInterface,
  saveDataModel,
  deleteDataModel
} from '../src/lib/supabaseData.js';
import { DEMO_USERS } from '../src/auth/authConfig.js';

const admin = DEMO_USERS[0];
const storyId = '__TEST_STORY__';
const interfaceId = '__TEST_INT__';
const modelId = '__TEST_TBL__';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

try {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: admin.email,
    password: admin.password
  });
  if (signInError) throw signInError;
  console.log('OK signIn', admin.email);

  await saveStory({
    id: storyId,
    projectId: 'pathway',
    module: 'Test',
    priority: 'Baja',
    status: 'Draft',
    role: 'Test Role',
    action: 'test action',
    benefit: 'test benefit',
    criteria: [{ id: 'c1', text: 'criterion one', checked: true }],
    attachmentsCount: 0,
    attachmentName: null,
    author: 'Test',
    createdAt: 'Hoy',
    image: null,
    imageMeta: null
  });
  console.log('OK saveStory');

  const { data: storyRow, error: storyError } = await supabase
    .from('stories')
    .select('*, story_criteria(*)')
    .eq('id', storyId)
    .single();
  if (storyError) throw storyError;
  assert(storyRow.story_criteria.length === 1, 'story criteria not saved');
  assert(storyRow.story_criteria[0].checked === true, 'criterion checked not saved');
  console.log('OK verify story');

  await saveInterface({
    id: interfaceId,
    projectId: 'pathway',
    number: '99',
    title: 'Test Interface',
    fullName: '99. Test Interface',
    module: 'Sin módulo',
    status: 'Borrador',
    platform: 'Web / Desktop',
    image: null,
    imagePlaceholder: 'test',
    fields: { objetivo: 'obj', contenido: 'content', reglas: 'rules', detalles: 'details' },
    roles: ['Test Role'],
    linkedStory: storyId,
    author: 'Test',
    reviewedBy: null,
    approvedAt: null,
    version: 'v1.0',
    imageAspect: 1.5,
    dataUsage: [{
      key: 'TBL-01:c1',
      tableId: 'TBL-01',
      tableName: 'tb_metas',
      tableLabel: 'Metas',
      schema: 'public',
      attribute: 'id',
      type: 'UUID',
      isPrimary: true,
      foreignKey: null
    }]
  }, (roleName) => (roleName === 'Test Role' ? 'ACT-01' : null));
  console.log('OK saveInterface');

  const { data: interfaceRow, error: interfaceError } = await supabase
    .from('interfaces')
    .select('*, interface_roles(*), interface_data_usage(*)')
    .eq('id', interfaceId)
    .single();
  if (interfaceError) throw interfaceError;
  assert(interfaceRow.interface_roles.length === 1, 'interface roles not saved');
  assert(interfaceRow.interface_roles[0].actor_id === 'ACT-01', 'interface role actor_id not saved');
  assert(interfaceRow.interface_data_usage.length === 1, 'interface data usage not saved');
  assert(interfaceRow.interface_data_usage[0].table_name === 'tb_metas', 'data usage table not saved');
  console.log('OK verify interface');

  await saveDataModel({
    id: modelId,
    projectId: 'pathway',
    tableName: '__test_table__',
    name: 'Test Table',
    module: 'Sin módulo',
    storageTarget: 'PostgreSQL',
    storageLocation: 'test',
    syncStrategy: 'test',
    status: 'Borrador',
    description: 'test',
    linkedStory: storyId,
    linkedInterface: interfaceId,
    author: 'Test',
    approvedAt: null,
    version: 'v1.0',
    attributes: [{
      id: 'c1',
      name: 'id',
      type: 'UUID',
      isPrimary: true,
      isNullable: false,
      isUnique: true,
      foreignKey: null,
      defaultValue: null,
      description: 'test'
    }]
  });
  console.log('OK saveDataModel');

  const { data: modelRow, error: modelError } = await supabase
    .from('data_models')
    .select('*, data_model_attributes(*)')
    .eq('id', modelId)
    .single();
  if (modelError) throw modelError;
  assert(modelRow.data_model_attributes.length === 1, 'data model attributes not saved');
  console.log('OK verify data model');

  await deleteDataModel(modelId);
  await deleteInterface(interfaceId);
  await deleteStory(storyId);
  console.log('OK cleanup');

  const { data: gone } = await supabase.from('stories').select('id').eq('id', storyId);
  assert(!gone || gone.length === 0, 'test story still exists');
  console.log('OK verify cleanup');
} catch (error) {
  console.error('FAILED:', error);
  process.exitCode = 1;
  try { await deleteDataModel(modelId); } catch (_) {}
  try { await deleteInterface(interfaceId); } catch (_) {}
  try { await deleteStory(storyId); } catch (_) {}
} finally {
  await supabase.auth.signOut().catch(() => {});
}
