import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { DEMO_USERS } from '../src/auth/authConfig.js';

const credentialsPath = 'F:/Tokens Stack Tecnologico/Supabase PATHrimonio.txt';
const raw = readFileSync(credentialsPath, 'utf8');
const get = (key) => {
  const line = raw.split(/\r?\n/).find((entry) => entry.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : '';
};

const url = get('SUPABASE_URL');
const serviceKey = get('SUPABASE_SERVICE_ROLE_KEY');

if (!url || !serviceKey) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el archivo de credenciales.');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

let created = 0;
let existing = 0;
let failed = 0;

for (const user of DEMO_USERS) {
  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      color: user.color,
      permissions: user.permissions
    }
  });

  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      existing += 1;
      console.log(`EXISTS ${user.email}`);
    } else {
      failed += 1;
      console.log(`FAILED ${user.email}: ${error.message}`);
    }
  } else {
    created += 1;
    console.log(`CREATED ${user.email} -> ${data.user.id}`);
  }
}

console.log(JSON.stringify({ created, existing, failed }));
if (failed > 0) process.exitCode = 1;
