import { saveInterface, saveProject, saveActor, deleteActor, deleteInterface } from '../src/lib/supabaseData.js';
import { requireSupabase } from '../src/lib/supabase.js';
import { INITIAL_PROJECTS } from '../src/data/initialProjects.js';
import { INITIAL_ACTORS } from '../src/data/initialActors.js';
import { SMATAD_INTERFACES } from '../src/data/smatadInterfaces.js';

export { SMATAD_INTERFACES };

async function main() {
  console.log('--- Iniciando sincronización de SMATAD en Supabase (33 Interfaces & 4 Roles Canónicos) ---');

  const db = requireSupabase();
  const { data: authData, error: authError } = await db.auth.signInWithPassword({
    email: 'admin@pathrimonio.org',
    password: 'Pathrimonio2026!'
  });
  if (authError) {
    throw new Error(`Error de autenticación: ${authError.message}`);
  }
  console.log(`✓ Autenticado en Supabase como ${authData.user.email}`);

  // 1. Guardar/actualizar proyecto SMATAD
  const smatadProject = INITIAL_PROJECTS.find(p => p.id === 'smatad');
  if (smatadProject) {
    console.log('Sincronizando proyecto SMATAD...');
    await saveProject(smatadProject);
  }

  // 2. Sincronizar los 4 Actores Oficiales de SMATAD (Administrador, Logista, Conductor, Estibador)
  const smatadActors = INITIAL_ACTORS.filter(a => a.projectId === 'smatad');
  console.log(`Sincronizando ${smatadActors.length} actores canónicos para SMATAD...`);
  
  // Limpiar actores legados
  const validActorIds = smatadActors.map(a => a.id);
  const { data: existingActors } = await db.from('actors').select('id').eq('project_id', 'smatad');
  for (const a of existingActors || []) {
    if (!validActorIds.includes(a.id)) {
      console.log(`  ✕ Eliminando actor legado: ${a.id}`);
      await deleteActor(a.id);
    }
  }

  for (const actor of smatadActors) {
    await saveActor(actor);
    console.log(`  ✓ Registrado actor [${actor.id}] ${actor.name} (${actor.category})`);
  }

  // Preparar lookup de actores y validadores de llaves foráneas
  const actorLookup = new Map();
  for (const actor of smatadActors) {
    actorLookup.set(`smatad::${actor.name}`, actor.id);
    actorLookup.set(actor.name, actor.id);
  }

  const { data: dbDataModels } = await db.from('data_models').select('id');
  const validDataModelIds = new Set((dbDataModels || []).map(d => d.id));

  const { data: dbStories } = await db.from('stories').select('id');
  const validStoryIds = new Set((dbStories || []).map(s => s.id));

  // 3. Sincronizar las 33 Interfaces formalizadas de SMATAD
  console.log(`Sincronizando ${SMATAD_INTERFACES.length} interfaces oficiales para SMATAD...`);
  
  const validInterfaceIds = SMATAD_INTERFACES.map(i => i.id);
  const { data: existingInterfaces } = await db.from('interfaces').select('id').eq('project_id', 'smatad');
  for (const item of existingInterfaces || []) {
    if (!validInterfaceIds.includes(item.id)) {
      console.log(`  ✕ Eliminando interface obsoleta: ${item.id}`);
      await deleteInterface(item.id);
    }
  }

  for (const item of SMATAD_INTERFACES) {
    // Si la historia enlazada no existe en el catálogo, evitar violaciones de clave foránea
    const sanitizedItem = {
      ...item,
      linkedStory: item.linkedStory && validStoryIds.has(item.linkedStory) ? item.linkedStory : null
    };
    await saveInterface(sanitizedItem, actorLookup, validDataModelIds, validStoryIds);
    console.log(`  ✓ Registrada interface [${item.number}] ${item.title} (${item.id}) - Roles: ${item.roles.join(', ')}`);
  }

  console.log('--- Sincronización finalizada con éxito en Supabase (pathrimonio.site) ---');
}

main().catch(err => {
  console.error('Error durante la sincronización:', err);
  process.exitCode = 1;
});
