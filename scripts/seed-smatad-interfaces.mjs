import { saveInterface, saveProject, saveActor } from '../src/lib/supabaseData.js';
import { requireSupabase } from '../src/lib/supabase.js';
import { INITIAL_PROJECTS } from '../src/data/initialProjects.js';
import { INITIAL_ACTORS } from '../src/data/initialActors.js';
import { SMATAD_INTERFACES } from '../src/data/smatadInterfaces.js';

export { SMATAD_INTERFACES };

async function main() {
  console.log('--- Iniciando sincronización de SMATAD en Supabase ---');

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

  // 2. Guardar actores de SMATAD
  const smatadActors = INITIAL_ACTORS.filter(a => a.projectId === 'smatad');
  console.log(`Sincronizando ${smatadActors.length} actores para SMATAD...`);
  for (const actor of smatadActors) {
    await saveActor(actor);
  }

  // 3. Guardar las 18 interfaces
  console.log(`Sincronizando ${SMATAD_INTERFACES.length} interfaces para SMATAD...`);
  for (const item of SMATAD_INTERFACES) {
    await saveInterface(item);
    console.log(`  ✓ Registrada interface [${item.number}] ${item.title} (${item.id})`);
  }

  console.log('--- Sincronización finalizada con éxito ---');
}

main().catch(err => {
  console.error('Error durante la sincronización:', err);
  process.exitCode = 1;
});
