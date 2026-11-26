/**
 * FormalIASaveModal
 * Aparece cuando el usuario hace clic en "Guardar conversación" en FORMALIA.
 * Permite:
 *  - Crear una cuenta nueva (registro) → guarda la sesión y sirve para acceder al portal
 *  - Iniciar sesión en una cuenta existente → asocia la sesión a su cuenta
 * Tras el éxito, la sesión FORMALIA queda vinculada a su usuario en Supabase.
 */
import React, { useState } from 'react';
import { X, Save, LogIn, UserPlus, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

const INPUT_CLASS =
  'w-full h-10 px-3.5 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#FFC93C] transition-colors disabled:opacity-60';

const BTN_PRIMARY =
  'w-full h-10 px-4 rounded-[8px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

const BTN_GHOST =
  'w-full h-10 px-4 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:border-[#FFC93C] text-[var(--text-primary)] text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50';

/** Guarda la sesión FORMALIA en la tabla formalia_sessions de Supabase vinculada al usuario */
async function persistFormaliaSession(session, userId) {
  if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase no configurado' };

  const processName =
    session.process_graph?.business_context?.process_name ||
    session.process_graph?.process_name ||
    null;

  const basePayload = {
    session_id: session.session_id,
    process_graph: session.process_graph || null,
    messages: session.messages || [],
    versions: session.versions || [],
    generated_files: session.generated_files || [],
    turns_count: session.turns_count || 0,
    completeness_score: session.process_graph?.completeness_score || 0,
    updated_at: new Date().toISOString()
  };

  const extendedRes = await supabase
    .from('formalia_sessions')
    .upsert({ ...basePayload, user_id: userId, process_name: processName }, { onConflict: 'session_id' });

  if (!extendedRes.error) return { ok: true };

  // Fallback si la migración user_id/process_name aún no fue ejecutada
  const fallbackRes = await supabase
    .from('formalia_sessions')
    .upsert(basePayload, { onConflict: 'session_id' });

  if (fallbackRes.error) return { ok: false, error: fallbackRes.error.message };
  return { ok: true };
}

export default function FormalIASaveModal({ session, onClose, onSaved }) {
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [savedUser, setSavedUser] = useState(null);

  const hasMessages = (session?.messages || []).filter((m) => m.role === 'user').length > 0;
  const processName =
    session?.process_graph?.business_context?.process_name ||
    session?.process_graph?.process_name ||
    'Mi proceso';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('El servicio de autenticación no está disponible en este momento.');
      }

      let userId = null;
      let userEmail = email.trim().toLowerCase();

      if (mode === 'register') {
        if (!name.trim()) throw new Error('Por favor ingresa tu nombre.');
        if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              role: 'Colaborador',
              source: 'formalia'
            }
          }
        });

        if (signUpError) throw new Error(signUpError.message);
        userId = data?.user?.id;
        if (!userId) throw new Error('No se pudo crear la cuenta. Intenta con otro correo.');

        setSavedUser({ name: name.trim(), email: userEmail });
      } else {
        // login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password
        });

        if (signInError) throw new Error('Correo o contraseña incorrectos.');
        userId = data?.user?.id;
        const displayName =
          data?.user?.user_metadata?.full_name ||
          data?.user?.email?.split('@')[0] ||
          'Usuario';
        setSavedUser({ name: displayName, email: userEmail });
      }

      // Persist FORMALIA session linked to this user
      const saveResult = await persistFormaliaSession(session, userId);
      if (!saveResult.ok) {
        // Non-blocking: session saved to Supabase auth but table insert failed
        console.warn('[FORMALIA] Session persist warning:', saveResult.error);
      }

      setSuccess(true);
      onSaved?.({ userId, email: userEmail, sessionSaved: saveResult.ok });
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="save-modal-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-[var(--bg-page)] border border-[var(--border-strong)] rounded-[16px] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#FFC93C] text-[#2B2D31] flex items-center justify-center shrink-0">
              <Sparkles size={18} strokeWidth={2} />
            </div>
            <div>
              <h2 id="save-modal-title" className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                {success ? '¡Conversación guardada!' : mode === 'register' ? 'Crear cuenta y guardar' : 'Ingresar y guardar'}
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {success
                  ? `Sesión "${processName}" vinculada a tu cuenta`
                  : `Guarda "${processName}" y accede al portal`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Hola, {savedUser?.name}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Tu conversación FORMALIA ha sido guardada. Puedes acceder al portal con{' '}
                <strong className="text-[var(--text-primary)]">{savedUser?.email}</strong>
              </p>
            </div>

            <div className="w-full p-3 rounded-[8px] bg-[#FFC93C]/10 border border-[#FFC93C]/30 text-left text-xs text-[var(--text-secondary)] space-y-1">
              <p className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC93C]" />
                ¿Qué puedes hacer ahora?
              </p>
              <ul className="pl-3 space-y-0.5 list-disc list-inside">
                <li>Acceder al Portal Operativo con tu correo y contraseña</li>
                <li>Ver tu historial de sesiones FORMALIA en el portal</li>
                <li>Continuar esta conversación más tarde</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button
                onClick={() => {
                  window.location.href = '/#portal?tab=formalia&mode=login';
                }}
                className={BTN_PRIMARY}
              >
                <LogIn size={15} />
                Ir al Portal (FORMALIA)
              </button>
              <button onClick={onClose} className={BTN_GHOST}>
                Continuar en FORMALIA
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="grid grid-cols-2 border-b border-[var(--border-subtle)]">
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className={`py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'border-[#FFC93C] text-[var(--text-primary)] bg-[var(--accent-soft)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <UserPlus size={13} />
                Crear cuenta
              </button>
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'border-[#FFC93C] text-[var(--text-primary)] bg-[var(--accent-soft)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <LogIn size={13} />
                Ya tengo cuenta
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
              {/* Session preview chip */}
              {hasMessages && (
                <div className="p-2.5 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Save size={13} className="text-[#FFC93C] shrink-0" />
                  <span>
                    Se guardará: <strong className="text-[var(--text-primary)]">"{processName}"</strong>
                    {' · '}
                    {(session?.messages || []).filter((m) => m.role === 'user').length} mensajes
                    {session?.turns_count > 0 && `, ${session.process_graph?.actors?.length || 0} roles mapeados`}
                  </span>
                </div>
              )}

              {mode === 'register' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. María García"
                    required
                    disabled={loading}
                    className={INPUT_CLASS}
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  required
                  disabled={loading}
                  className={INPUT_CLASS}
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Contraseña {mode === 'register' && <span className="normal-case font-normal">(mín. 8 caracteres)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Crea una contraseña segura' : 'Tu contraseña'}
                    required
                    disabled={loading}
                    className={`${INPUT_CLASS} pr-10`}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-[8px] bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-400">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className={BTN_PRIMARY}>
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {loading
                  ? 'Guardando...'
                  : mode === 'register'
                  ? 'Crear cuenta y guardar conversación'
                  : 'Ingresar y guardar conversación'}
              </button>

              <p className="text-center text-[11px] text-[var(--text-muted)] leading-relaxed">
                {mode === 'register' ? (
                  <>
                    Al crear una cuenta aceptas que tus datos y sesión FORMALIA sean almacenados en Pathrimonio.{' '}
                    <a href="/legal/privacidad" target="_blank" rel="noopener" className="text-[#FFC93C] hover:underline">
                      Política de privacidad
                    </a>
                  </>
                ) : (
                  'Usa el mismo correo con el que accedes al Portal Operativo de Pathrimonio.'
                )}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
