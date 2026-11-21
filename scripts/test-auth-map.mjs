import { supabase } from '../src/lib/supabase.js';
import { DEMO_USERS, mapSupabaseUser } from '../src/auth/authConfig.js';

const admin = DEMO_USERS[0];
const { data, error } = await supabase.auth.signInWithPassword({
  email: admin.email,
  password: admin.password
});

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(JSON.stringify(mapSupabaseUser(data.user), null, 2));
await supabase.auth.signOut();
