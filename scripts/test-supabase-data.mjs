import { fetchWorkspace } from '../src/lib/supabaseData.js';

const counts = (data) => ({
  projects: data.projects.length,
  stories: data.stories.length,
  interfaces: data.interfaces.length,
  dataModels: data.dataModels.length,
  actors: data.actors.length,
  files: data.files.length,
  modules: data.interfaceModules.length
});

try {
  const data = await fetchWorkspace();
  console.log('OK fetchWorkspace', counts(data));
  console.log('sample story:', JSON.stringify(data.stories[0], null, 2));
  console.log('sample interface:', JSON.stringify(data.interfaces[0], null, 2));
  console.log('sample data model:', JSON.stringify(data.dataModels[0], null, 2));
  console.log('sample actor:', JSON.stringify(data.actors[0], null, 2));
  console.log('sample file:', JSON.stringify(data.files[0], null, 2));
} catch (error) {
  console.error('FAILED fetchWorkspace:', error);
  process.exitCode = 1;
}
