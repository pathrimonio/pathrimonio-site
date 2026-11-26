/**
 * FormalIASaveModal
 * Permite guardar la conversación FORMALIA actual creando una cuenta nueva
 * (o ingresando con una cuenta existente / sesión activa) para conservar el chat,
 * el diagrama y versiones generadas, y luego acceder al Portal Operativo.
 */
import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  UserCheck
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { mapSupabaseUser } from '../../../auth/authConfig';
import { registerPortalUserLocally } from '../../../auth/permissionsConfig';
import { saveFormaliaSessionToAccount } from '../../../services/formaliaService';

const INPUT_CLASS =
  'w-full h-10 px-3.5 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#FFC93C] transition-colors disabled:opacity-60';

const BTN_PRIMARY =
  'w-full h-10 px-4 rounded-[8px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

const BTN_GHOST =
  'w-full h-10 px-4 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:border-[#FFC93C] text-[var(--text-primary)] text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50';

function computeInitials(name = '', email = '') {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length > 0) {
    return parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  }
  return String(email || 'CO').slice(0, 2).toUpperCase();
}

async function syncPortalUserRow(userObj) {
  if (!isSupabaseConfigured || !supabase || !userObj?.id || !userObj?.email) return;
  try {
    const cleanEmail = String(userObj.email).trim().toLowerCase();
    const { data: existing } = await supabase
      .from('portal_users')
      .select('id')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (existing?.id) return;

    await supabase.from('portal_users').insert({
      id: userObj.id,
      email: cleanEmail,
      name: userObj.name || cleanEmail,
      role: userObj.role || 'Colaborador',
      avatar: userObj.avatar || computeInitials(userObj.name, cleanEmail),
      color: userObj.color || 'bg-amber-600',
      permissions: userObj.permissions || ['create_role', 'create_story', 'create_interface']
    });
  } catch (_) {}
}

export default function FormalIASaveModal({
  session,
  currentUser = null,
  onClose,
  onSaved,
  onGoToPortal
}) {
  const ctxCompany = session?.process_graph?.business_context?.company_name || '';
  const initialCompany =
    ctxCompany && ctxCompany !== 'Tu Negocio' && ctxCompany !== 'No especificada' ? ctxCompany : '';

  const [activeAuthUser, setActiveAuthUser] = useState(currentUser);
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState(initialCompany);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alreadyExistsHint, setAlreadyExistsHint] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [resendingConfirm, setResendingConfirm] = useState(false);
  const [resendOkMsg, setResendOkMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [savedUser, setSavedUser] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setActiveAuthUser(currentUser);
      return;
    }
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          setActiveAuthUser(mapSupabaseUser(data.session.user));
        }
      }).catch(() => {});
    }
  }, [currentUser]);

  const userMessagesCount = (session?.messages || []).filter((m) => m.role === 'user').length;
  const processName =
    session?.process_graph?.business_context?.process_name ||
    session?.process_graph?.process_name ||
    session?.process_name ||
    'Mi proceso';

  const handleSaveWithActiveSession = async () => {
    if (!activeAuthUser) return;
    setError('');
    setLoading(true);
    try {
      const saveResult = await saveFormaliaSessionToAccount(session, {
        userId: activeAuthUser.id,
        email: activeAuthUser.email,
        name: activeAuthUser.name
      });
      if (!saveResult.ok) {
        throw new Error(saveResult.error || 'No se pudo guardar la conversación.');
      }
      setSavedUser(activeAuthUser);
      setNeedsEmailConfirm(false);
      setSuccess(true);
      onSaved?.({ user: activeAuthUser, session: saveResult.session, needsEmailConfirm: false });
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async (targetEmail) => {
    const cleanEmail = String(targetEmail || email || '').trim().toLowerCase();
    if (!supabase || !cleanEmail || resendingConfirm) return;
    setResendingConfirm(true);
    setResendOkMsg('');
    setError('');
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/#portal?tab=formalia`
        }
      });
      if (resendErr) {
        setError(resendErr.message || 'No se pudo reenviar el enlace de verificación.');
      } else {
        setResendOkMsg(`Enlace reenviado a ${cleanEmail}. Revisa tu bandeja o spam.`);
      }
    } catch (err) {
      setError(err.message || 'Error al reenviar el enlace.');
    } finally {
      setResendingConfirm(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAlreadyExistsHint(false);
    setResendOkMsg('');
    setLoading(true);

    const userEmail = email.trim().toLowerCase();

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('El servicio de autenticación no está disponible en este momento.');
      }

      if (!userEmail) throw new Error('Por favor ingresa tu correo electrónico.');

      let mappedUser = null;
      let requiresConfirm = false;

      if (mode === 'register') {
        if (!name.trim()) throw new Error('Por favor ingresa tu nombre.');
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');

        const initials = computeInitials(name, userEmail);
        const userMetadata = {
          name: name.trim(),
          full_name: name.trim(),
          organization: organization.trim() || null,
          role: 'Colaborador',
          source: 'formalia',
          softwareNeeds: 'Sistema de Gestión Operativa / ERP PYME',
          avatar: initials,
          color: 'bg-amber-600',
          permissions: ['create_role', 'create_story', 'create_interface']
        };

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/#portal?tab=formalia`,
            data: userMetadata
          }
        });

        if (signUpError) {
          const msg = String(signUpError.message || '');
          if (/already|registered|exists/i.test(msg)) {
            setAlreadyExistsHint(true);
            throw new Error('Este correo ya tiene una cuenta registrada. Inicia sesión para guardar esta conversación en ella.');
          }
          if (/rate limit|too many requests/i.test(msg)) {
            throw new Error('Se alcanzó el límite temporal de envíos de verificación por correo. Si ya tienes cuenta, usa "Ya tengo cuenta" o intenta en unos minutos.');
          }
          throw new Error(msg || 'No se pudo crear la cuenta.');
        }

        if (!data?.user?.id) {
          throw new Error('No se pudo crear la cuenta. Verifica el correo ingresado.');
        }

        mappedUser = mapSupabaseUser({
          ...data.user,
          user_metadata: { ...(data.user.user_metadata || {}), ...userMetadata }
        });

        registerPortalUserLocally(mappedUser);

        if (data.session) {
          requiresConfirm = false;
          await syncPortalUserRow(mappedUser);
        } else {
          requiresConfirm = true;
        }
      } else {
        // mode === 'login'
        if (!password) throw new Error('Por favor ingresa tu contraseña.');

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password
        });

        if (signInError) {
          if (/email not confirmed|confirm/i.test(signInError.message || '')) {
            setNeedsEmailConfirm(true);
            throw new Error('Tu cuenta aún no ha confirmado su correo electrónico. Revisa tu bandeja para activarla.');
          }
          throw new Error('Correo o contraseña incorrectos.');
        }

        mappedUser = mapSupabaseUser(data.user);
        registerPortalUserLocally(mappedUser);
        await syncPortalUserRow(mappedUser);
        requiresConfirm = false;
      }

      const saveResult = await saveFormaliaSessionToAccount(session, {
        userId: mappedUser.id,
        email: mappedUser.email,
        name: mappedUser.name
      });

      if (!saveResult.ok) {
        console.warn('[FORMALIA] Session persist warning:', saveResult.error);
      }

      setSavedUser(mappedUser);
      setNeedsEmailConfirm(requiresConfirm);
      setSuccess(true);
      onSaved?.({
        user: mappedUser,
        session: saveResult.session,
        needsEmailConfirm: requiresConfirm
      });
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPortalClick = () => {
    if (onGoToPortal) {
      onGoToPortal({ needsEmailConfirm });
      return;
    }
    window.location.href = needsEmailConfirm
      ? '/#portal?tab=formalia&mode=login'
      : '/#portal?tab=formalia';
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-[var(--bg-page)] border border-[var(--border-strong)] rounded-[16px] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#FFC93C] text-[#2B2D31] flex items-center justify-center shrink-0">
              <Sparkles size={18} strokeWidth={2} />
            </div>
            <div>
              <h2 id="save-modal-title" className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                {success
                  ? '¡Conversación guardada!'
                  : mode === 'register'
                    ? 'Guardar chat y crear cuenta'
                    : 'Ingresar y guardar chat'}
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {success
                  ? `Sesión "${processName}" vinculada a tu cuenta`
                  : `Guarda "${processName}" para acceder luego al Portal`}
              </p>
            </div>
          </div>
          <button
            type="button"
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
                ¡Listo, {savedUser?.name}!
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Tu conversación FORMALIA ({userMessagesCount} mensajes, {session?.process_graph?.actors?.length || 0} roles) ha sido guardada en{' '}
                <strong className="text-[var(--text-primary)]">{savedUser?.email}</strong>.
              </p>
            </div>

            {needsEmailConfirm && (
              <div className="w-full p-3 rounded-[8px] bg-amber-500/10 border border-amber-500/30 text-left text-xs space-y-2">
                <p className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Mail size={14} className="text-[#FFC93C] shrink-0" />
                  <span>Confirma tu correo para activar el Portal</span>
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Te enviamos un enlace a <strong className="text-[var(--text-primary)]">{savedUser?.email}</strong>. Haz clic en él para habilitar el ingreso al Portal cuando regreses.
                </p>
                <button
                  type="button"
                  onClick={() => handleResendConfirmation(savedUser?.email)}
                  disabled={resendingConfirm}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#FFC93C] text-[#2B2D31] text-[11px] font-semibold hover:bg-[#FFD561] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {resendingConfirm ? 'Reenviando...' : 'Reenviar enlace de confirmación'}
                </button>
                {resendOkMsg && (
                  <p className="text-[11px] text-emerald-400">{resendOkMsg}</p>
                )}
              </div>
            )}

            <div className="w-full p-3 rounded-[8px] bg-[#FFC93C]/10 border border-[#FFC93C]/30 text-left text-xs text-[var(--text-secondary)] space-y-1">
              <p className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC93C]" />
                ¿Qué puedes hacer ahora?
              </p>
              <ul className="pl-3 space-y-0.5 list-disc list-inside text-[11px]">
                <li>Seguir conversando aquí: cada nuevo mensaje se sincronizará con tu cuenta</li>
                <li>Entrar luego al Portal con tu correo y contraseña</li>
                <li>Retomar este chat o materializarlo en Roles, Historias e Interfaces</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button
                type="button"
                onClick={handleOpenPortalClick}
                className={BTN_PRIMARY}
              >
                <LogIn size={15} />
                {needsEmailConfirm ? 'Ir al acceso del Portal' : 'Abrir en el Portal'}
              </button>
              <button type="button" onClick={onClose} className={BTN_GHOST}>
                Seguir en FORMALIA
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Banner si el usuario ya inició sesión */}
            {activeAuthUser && (
              <div className="mx-5 mt-4 p-3 rounded-[10px] bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FFC93C] text-[#2B2D31] flex items-center justify-center font-bold text-xs shrink-0">
                    <UserCheck size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      Sesión activa: {activeAuthUser.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate">
                      {activeAuthUser.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveWithActiveSession}
                  disabled={loading}
                  className={BTN_PRIMARY}
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Guardar en mi cuenta actual
                </button>
                <div className="text-center text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  o crea / vincula otra cuenta abajo
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="grid grid-cols-2 border-b border-[var(--border-subtle)] mt-2">
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setAlreadyExistsHint(false); setNeedsEmailConfirm(false); }}
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
                type="button"
                onClick={() => { setMode('login'); setError(''); setAlreadyExistsHint(false); setNeedsEmailConfirm(false); }}
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
              <div className="p-2.5 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Save size={13} className="text-[#FFC93C] shrink-0" />
                <span>
                  Se guardará: <strong className="text-[var(--text-primary)]">"{processName}"</strong>
                  {' · '}
                  {userMessagesCount} {userMessagesCount === 1 ? 'mensaje' : 'mensajes'}
                  {(session?.process_graph?.actors?.length || 0) > 0 &&
                    `, ${session.process_graph.actors.length} roles`}
                </span>
              </div>

              {mode === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Nombre completo *
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
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Empresa / Negocio
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Ej. Panadería Sol"
                      disabled={loading}
                      className={INPUT_CLASS}
                      autoComplete="organization"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Correo electrónico *
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
                  Contraseña * {mode === 'register' && <span className="normal-case font-normal">(mín. 6 caracteres)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                    required
                    minLength={mode === 'register' ? 6 : undefined}
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
                <div className="p-2.5 rounded-[8px] bg-red-500/10 border border-red-500/30 flex flex-col gap-2 text-xs text-red-400">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                  {alreadyExistsHint && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError('');
                        setAlreadyExistsHint(false);
                      }}
                      className="self-start px-2.5 py-1 rounded-[6px] bg-[#FFC93C] text-[#2B2D31] text-[11px] font-semibold cursor-pointer"
                    >
                      Cambiar a &ldquo;Ya tengo cuenta&rdquo;
                    </button>
                  )}
                  {needsEmailConfirm && (
                    <button
                      type="button"
                      onClick={() => handleResendConfirmation(email)}
                      disabled={resendingConfirm}
                      className="self-start px-2.5 py-1 rounded-[6px] bg-[#FFC93C] text-[#2B2D31] text-[11px] font-semibold cursor-pointer disabled:opacity-60"
                    >
                      {resendingConfirm ? 'Reenviando...' : 'Reenviar enlace de confirmación'}
                    </button>
                  )}
                </div>
              )}

              {resendOkMsg && (
                <div className="p-2.5 rounded-[8px] bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
                  {resendOkMsg}
                </div>
              )}

              <button type="submit" disabled={loading} className={BTN_PRIMARY}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {loading
                  ? 'Guardando...'
                  : mode === 'register'
                    ? 'Crear cuenta y guardar chat'
                    : 'Ingresar y guardar chat'}
              </button>

              <p className="text-center text-[11px] text-[var(--text-muted)] leading-relaxed">
                {mode === 'register' ? (
                  <>
                    Se creará una cuenta de <strong className="text-[var(--text-primary)]">Colaborador</strong> con la que podrás entrar al Portal y ver tus chats de FORMALIA.{' '}
                    <a href="/legal/privacidad" target="_blank" rel="noopener" className="text-[#FFC93C] hover:underline">
                      Política de privacidad
                    </a>
                  </>
                ) : (
                  'Usa el mismo correo y contraseña con los que accedes al Portal Operativo de Pathrimonio.'
                )}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
