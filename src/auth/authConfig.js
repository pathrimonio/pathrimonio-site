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
