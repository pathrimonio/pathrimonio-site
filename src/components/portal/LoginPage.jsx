import React, { useState } from 'react';
import { mapSupabaseUser } from '../../auth/authConfig';
import { supabase } from '../../lib/supabase';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (!supabase) {
      setError('Supabase no está configurado. Revisá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (authError) {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
        return;
      }

      onLoginSuccess(mapSupabaseUser(data.user));
    } catch (err) {
      setError(err?.message || 'No se pudo iniciar sesión. Revisá tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="loginGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#loginGrid)" />
      </svg>

      <div className="relative w-full max-w-sm flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center shadow-lg">
            <img src="/assets/images/logo.png" alt="Pathrimonio" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="font-space text-2xl font-bold text-white tracking-tight">
              PATH<span className="text-primary">RIMONIO</span>
            </h1>
            <p className="font-space text-xs tracking-wider text-primary font-medium mt-0.5">
              Impulsamos el desarrollo comunitario
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant font-space text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>Plataforma de Alta Disponibilidad · LATAM</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-2xl flex flex-col gap-5">
          <div>
            <h2 className="font-space text-lg font-bold text-white">Acceso al Portal</h2>
            <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
              Ingresa tus credenciales institucionales para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Correo institucional</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px] pointer-events-none">
                  alternate_email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="nombre@pathrimonio.org"
                  autoComplete="email"
                  className="w-full h-10 bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/50 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Contraseña</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px] pointer-events-none">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full h-10 bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-10 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded bg-error-container border border-error/30 text-error text-xs font-jakarta">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Verificando acceso...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Ingresar al Portal</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <div className="text-center font-jakarta text-[11px] text-on-surface-variant leading-relaxed">
          <span className="flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-primary text-[14px]">verified_user</span>
            Sesión cifrada · Acceso institucional restringido
          </span>
          <span className="block mt-1 text-outline">
            © 2026 Pathrimonio — Impulsamos el desarrollo comunitario
          </span>
        </div>
      </div>
    </div>
  );
}
