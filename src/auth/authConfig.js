// Credenciales de demostración para el Portal Pathrimonio
// En producción, estos usuarios serían validados contra Supabase Auth
export const DEMO_USERS = [
  {
    id: "u1",
    email: "admin@pathrimonio.org",
    password: "Pathrimonio2026!",
    name: "Administrador Sistémico",
    role: "Admin",
    avatar: "AS",
    color: "bg-primary",
    permissions: ["read", "write", "delete", "export", "settings"]
  },
  {
    id: "u2",
    email: "sofia@pathrimonio.org",
    password: "FintechLead2026",
    name: "Sofía V.",
    role: "Fintech Lead",
    avatar: "SV",
    color: "bg-blue-500",
    permissions: ["read", "write", "export"]
  },
  {
    id: "u3",
    email: "carlos@pathrimonio.org",
    password: "DevTeam2026",
    name: "Carlos D.",
    role: "Desarrollador",
    avatar: "CD",
    color: "bg-purple-500",
    permissions: ["read", "write"]
  },
  {
    id: "u4",
    email: "elena@pathrimonio.org",
    password: "Auditoria2026",
    name: "Elena Morales",
    role: "Auditora de Impacto",
    avatar: "EM",
    color: "bg-teal-500",
    permissions: ["read", "export"]
  }
];

export const AUTH_STORAGE_KEY = "pathrimonio_auth_session";

export function authenticateUser(email, password) {
  const user = DEMO_USERS.find(
    u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
  );
  if (!user) return null;
  // Don't store the password in the session
  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

export function saveSession(user) {
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      user,
      loginAt: new Date().toISOString()
    }));
  } catch (e) {
    console.error("Error saving session:", e);
  }
}

export function loadSession() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.user || null;
  } catch (e) {
    return null;
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {}
}

const KNOWN_SYSTEM_ROLES = new Set([
  'Admin',
  'Administrador',
  'Colaborador',
  'Desarrollador',
  'Fintech Lead',
  'Auditora de Impacto',
  'Socio / Cliente',
  'Usuario Registrado'
]);

// Convierte el usuario de Supabase Auth al shape que consume el portal.
// Los metadatos se crean junto con el usuario (name, role, avatar, color, permissions).
export function mapSupabaseUser(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  const demo = DEMO_USERS.find(
    (candidate) => candidate.email.toLowerCase() === String(user.email || '').toLowerCase()
  );
  const rawRole = meta.role || demo?.role || 'Usuario Registrado';
  const normalizedRole = KNOWN_SYSTEM_ROLES.has(rawRole) ? rawRole : 'Usuario Registrado';
  return {
    id: user.id,
    email: user.email,
    name: meta.name || meta.full_name || demo?.name || user.email,
    role: normalizedRole,
    jobTitle: meta.jobTitle || (!KNOWN_SYSTEM_ROLES.has(rawRole) ? rawRole : null),
    source: meta.source || null,
    organization: meta.organization || null,
    softwareNeeds: meta.softwareNeeds || null,
    initialProject: meta.initialProject || null,
    initialProjectName: meta.initialProjectName || null,
    referral_code: meta.referral_code || null,
    avatar: meta.avatar || demo?.avatar || String(meta.name || meta.full_name || user.email || '?').slice(0, 2).toUpperCase(),
    color: meta.color || demo?.color || 'bg-primary',
    permissions: meta.permissions || demo?.permissions || ['read', 'write', 'create_workspace', 'implement_web']
  };
}

export function getPortalEmailRedirectUrl(targetTab = 'actors') {
  const fallbackOrigin = 'https://www.pathrimonio.site';
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : fallbackOrigin;
  return `${origin}/?portal_tab=${encodeURIComponent(targetTab)}`;
}
