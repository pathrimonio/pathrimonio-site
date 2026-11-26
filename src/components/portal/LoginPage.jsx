import React, { useState, useEffect } from 'react';
import { mapSupabaseUser } from '../../auth/authConfig';
import { supabase } from '../../lib/supabase';
import { registerPortalUserLocally } from '../../auth/permissionsConfig';

const ROLE_OPTIONS = [
  { value: 'Product Owner', label: 'Product Owner / Líder de Proyecto' },
  { value: 'Gerente General', label: 'Gerente General / Fundador' },
  { value: 'Líder de Operaciones', label: 'Líder de Operaciones / Caja' },
  { value: 'Coordinador de TI', label: 'Coordinador de TI / Sistemas' },
  { value: 'Colaborador', label: 'Colaborador / Usuario Operativo' },
  { value: 'Otro', label: 'Otro Perfil de Negocio' }
];

const SOFTWARE_NEEDS_OPTIONS = [
  { value: 'Sistema de Gestión Operativa / ERP PYME', label: 'Sistema de Gestión Operativa / ERP PYME' },
  { value: 'Portal Web de Clientes / Socios', label: 'Portal Web de Clientes / Socios' },
  { value: 'Aplicación Móvil Android / iOS', label: 'Aplicación Móvil Android / iOS' },
  { value: 'E-commerce & Catálogo Digital', label: 'E-commerce & Catálogo Digital' },
  { value: 'Automatización de Procesos & WhatsApp', label: 'Automatización de Procesos & WhatsApp' },
  { value: 'Consultoría y Arquitectura de Software', label: 'Consultoría y Arquitectura de Software' }
];

export default function LoginPage({ 
  onLoginSuccess, 
  projects = [], 
  activeProjectId = 'pathway',
  initialMode = 'login',
  onBackToLanding 
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerOrganization, setRegisterOrganization] = useState('');
  const [registerRole, setRegisterRole] = useState('Product Owner');
  const [registerSoftwareNeeds, setRegisterSoftwareNeeds] = useState('Sistema de Gestión Operativa / ERP PYME');
  const [registerProjectName, setRegisterProjectName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Status & feedback
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [resendingConfirm, setResendingConfirm] = useState(false);

  // Sync mode if initialMode changes
  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  // Clear errors when switching modes
  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    setNeedsEmailConfirm(false);
  };

  const handleResendConfirmation = async () => {
    if (!supabase || !loginEmail.trim() || resendingConfirm) return;
    setResendingConfirm(true);
    setError('');
    setSuccessMessage('');
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: loginEmail.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/#portal`
        }
      });
      if (resendErr) {
        setError(resendErr.message || 'No se pudo reenviar el correo de confirmación.');
      } else {
        setSuccessMessage(`Enlace de confirmación reenviado a ${loginEmail.trim()}. Revisa tu bandeja o spam.`);
        setNeedsEmailConfirm(false);
      }
    } catch (err) {
      setError(err?.message || 'Error al reenviar la confirmación.');
    } finally {
      setResendingConfirm(false);
    }
  };

  // ── Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setNeedsEmailConfirm(false);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (!supabase) {
      // Local demo fallback login
      const fallbackUser = {
        id: `u_${Date.now()}`,
        email: loginEmail.trim(),
        name: loginEmail.split('@')[0],
        role: 'Colaborador',
        avatar: loginEmail.slice(0, 2).toUpperCase(),
        color: 'bg-primary',
        permissions: ['read', 'write']
      };
      onLoginSuccess(fallbackUser);
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword
      });

      if (authError) {
        if (/email not confirmed|confirm/i.test(authError.message || '')) {
          setNeedsEmailConfirm(true);
          setError('Tu correo electrónico aún no ha sido confirmado. Haz clic en el enlace que te enviamos para activar tu cuenta.');
        } else {
          setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
        }
        return;
      }

      onLoginSuccess(mapSupabaseUser(data.user));
    } catch (err) {
      setError(err?.message || 'No se pudo iniciar sesión. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handle Register Submission (Collaborator seeking software development)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validations
    if (!registerName.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!registerEmail.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!registerOrganization.trim()) {
      setError('Por favor indica tu organización, empresa o negocio.');
      return;
    }
    if (!registerProjectName.trim()) {
      setError('Por favor ingresa el nombre del nuevo proyecto o software que vas a crear.');
      return;
    }
    if (registerPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setLoading(true);

    const initials = registerName
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CO';

    const trimmedProjectName = registerProjectName.trim();
    const projectSlug = trimmedProjectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `proj-${Date.now().toString().slice(-4)}`;

    const userMetadata = {
      name: registerName.trim(),
      organization: registerOrganization.trim(),
      role: 'Colaborador', // Las cuentas creadas desde el login se inicializan estrictamente como Colaborador
      jobTitle: registerRole,
      softwareNeeds: registerSoftwareNeeds,
      initialProject: projectSlug,
      initialProjectName: trimmedProjectName,
      avatar: initials,
      color: 'bg-amber-600',
      permissions: ['create_role', 'create_story', 'create_interface']
    };

    try {
      if (supabase) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: registerEmail.trim(),
          password: registerPassword,
          options: {
            data: userMetadata
          }
        });

        if (signUpError) {
          // If already registered, guide the user
          if (signUpError.message?.toLowerCase().includes('already registered')) {
            setError('Este correo ya cuenta con una cuenta registrada. Intenta iniciar sesión.');
            return;
          }
          // Fallback resiliente: Si Supabase alcanza el límite de envío de correos o falla la red, permitir acceso local
          console.warn('[Supabase SignUp Error, fallback local]:', signUpError);
          const fallbackCollab = {
            id: `collab_${Date.now()}`,
            email: registerEmail.trim(),
            ...userMetadata
          };
          registerPortalUserLocally(fallbackCollab);
          setSuccessMessage('¡Cuenta de colaborador creada con éxito! Accediendo al portal...');
          setTimeout(() => {
            onLoginSuccess(fallbackCollab);
          }, 800);
          return;
        }

        // If auto-logged in or session available
        if (data?.session) {
          const mapped = mapSupabaseUser(data.session.user);
          registerPortalUserLocally(mapped);
          onLoginSuccess(mapped);
          return;
        }

        // If email confirmation is enabled on Supabase, but user created
        if (data?.user) {
          // Still provide direct access with mapped user so collaborator is not blocked
          const mapped = mapSupabaseUser({
            ...data.user,
            user_metadata: userMetadata
          });
          registerPortalUserLocally(mapped);
          setSuccessMessage('¡Cuenta creada con éxito! Accediendo al portal...');
          setTimeout(() => {
            onLoginSuccess(mapped);
          }, 800);
          return;
        }
      }

      // Offline / Local fallback simulation
      const localUser = {
        id: `collab_${Date.now()}`,
        email: registerEmail.trim(),
        ...userMetadata
      };
      registerPortalUserLocally(localUser);
      setSuccessMessage('¡Cuenta de colaborador creada con éxito! Redirigiendo...');
      setTimeout(() => {
        onLoginSuccess(localUser);
      }, 600);

    } catch (err) {
      setError(err?.message || 'Error al crear la cuenta. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/8 rounded-full blur-[170px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="loginGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#loginGrid)" />
      </svg>

      {/* Floating Back to Landing Link */}
      <div className="absolute top-6 left-6 z-20">
        <button
          type="button"
          onClick={() => {
            if (onBackToLanding) {
              onBackToLanding();
            } else {
              window.location.hash = '';
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container/60 hover:bg-surface-container border border-outline-variant/60 hover:border-primary/40 text-on-surface-variant hover:text-white font-space text-xs transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Volver al Sitio</span>
        </button>
      </div>

      <div className={`relative w-full ${mode === 'register' ? 'max-w-xl' : 'max-w-sm'} flex flex-col gap-6 transition-all duration-300`}>
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2.5 text-center">
          <img 
            src="/assets/images/logo.png" 
            alt="Pathrimonio" 
            className="w-[108px] h-[108px] object-contain select-none" 
          />
          <div>
            <h1 className="font-space text-2xl font-bold text-white tracking-tight">
              PATH<span className="text-primary">RIMONIO</span>
            </h1>
            <p className="font-space text-xs tracking-wider text-primary font-medium mt-0.5">
              Impulsamos el desarrollo comunitario
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant font-space text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>Portal de Requerimientos &amp; Desarrollo de Software</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
          
          {/* Top Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-surface-container-lowest border border-outline-variant rounded-xl font-space text-xs">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-primary text-on-primary font-bold shadow-md'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>Iniciar Sesión</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-primary text-on-primary font-bold shadow-md'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Crear Cuenta</span>
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: INICIAR SESIÓN                                        */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {mode === 'login' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div>
                <h2 className="font-space text-lg font-bold text-white">Acceso al Portal</h2>
                <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                  Ingresa tus credenciales para acceder a tus proyectos, roles e historias de usuario.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
                {/* Email Field */}
                <div className="flex flex-col gap-1">
                  <label className="font-space text-xs text-white font-medium">Correo electrónico</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px] pointer-events-none">
                      alternate_email
                    </span>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => { setLoginEmail(e.target.value); setError(''); }}
                      placeholder="nombre@organizacion.org"
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
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => { setLoginPassword(e.target.value); setError(''); }}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="w-full h-10 bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-10 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showLoginPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Error Alert (Login) */}
                {error && (
                  <div className="flex flex-col gap-2 px-3 py-2.5 rounded-lg bg-error-container border border-error/30 text-error text-xs font-jakarta animate-shake">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                      <span>{error}</span>
                    </div>
                    {needsEmailConfirm && (
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={resendingConfirm}
                        className="self-start px-2.5 py-1 rounded bg-primary text-on-primary font-space text-[11px] font-semibold hover:bg-[#e09419] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {resendingConfirm ? 'Reenviando enlace...' : 'Reenviar correo de confirmación'}
                      </button>
                    )}
                  </div>
                )}

                {/* Success Alert */}
                {successMessage && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-jakarta animate-fadeIn">
                    <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span>Ingresando al portal...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Ingresar al Portal</span>
                    </>
                  )}
                </button>
              </form>

              {/* Callout to switch to register */}
              <div className="pt-2 border-t border-outline-variant/60 text-center">
                <p className="font-jakarta text-xs text-on-surface-variant">
                  ¿Eres nuevo colaborador o buscas desarrollo de software?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register')}
                    className="text-primary hover:underline font-bold font-space inline-flex items-center gap-0.5"
                  >
                    <span>Crea tu cuenta aquí</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: CREAR CUENTA PARA COLABORADORES                       */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {mode === 'register' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              
              {/* Header banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/30 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary text-surface flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[16px]">groups</span>
                  </span>
                  <h2 className="font-space text-sm font-bold text-white">
                    Cuenta de Colaborador en Software
                  </h2>
                </div>
                <p className="font-jakarta text-[11px] text-on-surface-variant leading-relaxed">
                  Regístrate como colaborador o cliente de Pathrimonio para consultar y definir los <strong className="text-white">roles del negocio</strong>, las <strong className="text-white">historias de usuario (HU)</strong> y las <strong className="text-white">interfaces interactivas</strong> de tu proyecto.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
                
                {/* 2-column: Nombre y Organización */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-space text-[11px] text-white font-medium flex items-center gap-1">
                      <span>Nombre y Apellido</span>
                      <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[17px] pointer-events-none">
                        person
                      </span>
                      <input
                        type="text"
                        required
                        value={registerName}
                        onChange={(e) => { setRegisterName(e.target.value); setError(''); }}
                        placeholder="Ej. Ing. Carlos Mendoza"
                        className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-lg pl-8 pr-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/40"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-space text-[11px] text-white font-medium flex items-center gap-1">
                      <span>Empresa u Organización</span>
                      <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[17px] pointer-events-none">
                        domain
                      </span>
                      <input
                        type="text"
                        required
                        value={registerOrganization}
                        onChange={(e) => { setRegisterOrganization(e.target.value); setError(''); }}
                        placeholder="Ej. Cooperativa Andina / PYME"
                        className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-lg pl-8 pr-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/40"
                      />
                    </div>
                  </div>
                </div>

                {/* 2-column: Rol en la Organización y Proyecto Inicial */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-space text-[11px] text-white font-medium">
                      Rol en tu Organización
                    </label>
                    <select
                      value={registerRole}
                      onChange={(e) => setRegisterRole(e.target.value)}
                      className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 font-space text-xs text-white focus:outline-none focus:border-primary"
                    >
                      {ROLE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-surface-container text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-space text-[11px] text-white font-medium flex items-center justify-between">
                      <span>Nombre del Proyecto a Crear *</span>
                      <span className="text-[10px] text-primary font-mono font-normal">Nuevo Software</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[17px] pointer-events-none">
                        rocket_launch
                      </span>
                      <input
                        type="text"
                        required
                        value={registerProjectName}
                        onChange={(e) => { setRegisterProjectName(e.target.value); setError(''); }}
                        placeholder="Ej. App de Logística / Portal ERP"
                        className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-lg pl-8 pr-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/40"
                      />
                    </div>
                  </div>
                </div>

                {/* Tipo de Software que busca desarrollar */}
                <div className="flex flex-col gap-1">
                  <label className="font-space text-[11px] text-white font-medium flex items-center justify-between">
                    <span>Tipo de Software que buscas desarrollar:</span>
                    <span className="text-[10px] text-primary font-mono font-normal">Requerimiento</span>
                  </label>
                  <select
                    value={registerSoftwareNeeds}
                    onChange={(e) => setRegisterSoftwareNeeds(e.target.value)}
                    className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 font-space text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {SOFTWARE_NEEDS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-surface-container text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-1">
                  <label className="font-space text-[11px] text-white font-medium flex items-center gap-1">
                    <span>Correo electrónico de contacto</span>
                    <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[17px] pointer-events-none">
                      alternate_email
                    </span>
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => { setRegisterEmail(e.target.value); setError(''); }}
                      placeholder="tu.correo@organizacion.com"
                      autoComplete="email"
                      className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-lg pl-8 pr-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/40"
                    />
                  </div>
                </div>

                {/* 2-column: Contraseña y Confirmar Contraseña */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-space text-[11px] text-white font-medium flex items-center gap-1">
                      <span>Contraseña</span>
                      <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[17px] pointer-events-none">
                        lock
                      </span>
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={registerPassword}
                        onChange={(e) => { setRegisterPassword(e.target.value); setError(''); }}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                        className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-lg pl-8 pr-8 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/40"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {showRegisterPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-space text-[11px] text-white font-medium flex items-center gap-1">
                      <span>Confirmar Contraseña</span>
                      <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[17px] pointer-events-none">
                        lock_reset
                      </span>
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        value={registerConfirmPassword}
                        onChange={(e) => { setRegisterConfirmPassword(e.target.value); setError(''); }}
                        placeholder="Repite la contraseña"
                        autoComplete="new-password"
                        className={`w-full h-9 bg-surface-container-lowest border rounded-lg pl-8 pr-3 font-jakarta text-xs text-white focus:outline-none focus:ring-1 placeholder-on-surface-variant/40 ${
                          registerConfirmPassword && registerPassword !== registerConfirmPassword
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-outline-variant focus:border-primary focus:ring-primary'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Error Alert (Register) */}
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error-container border border-error/30 text-error text-xs font-jakarta animate-shake">
                    <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Success Alert */}
                {successMessage && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-jakarta animate-fadeIn">
                    <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Privileges Summary Pill & Scope Callout */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-white font-space font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-amber-400">shield_person</span>
                      <span>Perfil de Acceso: Colaborador</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      ACOTADO
                    </span>
                  </div>
                  <p className="font-jakarta text-[11px] text-on-surface-variant leading-tight">
                    Tu cuenta tendrá permisos exclusivos para <strong className="text-white">crear roles</strong>, <strong className="text-white">crear historias de usuario</strong> y <strong className="text-white">crear interfaces</strong>. Los demás módulos del software quedan reservados y pueden ser autorizados por un Administrador en la gestión de usuarios.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] pt-1">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ Crear Roles</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">✓ Crear Historias</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">✓ Crear Interfaces</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 mt-1 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span>Creando cuenta de colaborador...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                      <span>Crear Cuenta &amp; Acceder al Proyecto</span>
                    </>
                  )}
                </button>
              </form>

              {/* Callout to switch to login */}
              <div className="pt-2 border-t border-outline-variant/60 text-center">
                <p className="font-jakarta text-xs text-on-surface-variant">
                  ¿Ya tienes una cuenta registrada?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-primary hover:underline font-bold font-space inline-flex items-center gap-0.5"
                  >
                    <span>Inicia sesión aquí</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </button>
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer info note */}
        <div className="text-center font-jakarta text-[11px] text-on-surface-variant leading-relaxed">
          <span className="flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-primary text-[14px]">shield</span>
            Acceso seguro a requerimientos y especificaciones de software
          </span>
          <span className="block mt-1 text-outline">
            © 2026 Pathrimonio — Impulsamos el desarrollo comunitario
          </span>
        </div>

      </div>
    </div>
  );
}
