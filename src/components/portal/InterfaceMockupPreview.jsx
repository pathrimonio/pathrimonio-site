import React from 'react';

export default function InterfaceMockupPreview({ 
  image, 
  placeholderType, 
  title, 
  onImageClick 
}) {
  // If an uploaded image or image URL is available
  if (image) {
    return (
      <div 
        onClick={onImageClick}
        className="relative group/img cursor-pointer rounded-xl overflow-hidden border border-outline-variant/80 bg-surface-container-lowest flex items-center justify-center p-2 min-h-[200px] max-h-[360px]"
        title="Clic para ampliar imagen"
      >
        <img 
          src={image} 
          alt={title} 
          className="max-h-[340px] w-auto max-w-full object-contain rounded-lg transition-transform duration-300 group-hover/img:scale-[1.01]" 
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-surface-container-high/90 text-white font-space text-xs font-semibold flex items-center gap-1.5 shadow-lg">
            <span className="material-symbols-outlined text-[16px] text-primary">zoom_in</span>
            <span>Ampliar Imagen</span>
          </span>
        </div>
      </div>
    );
  }

  // Realistic UI Mockups based on placeholder type
  return (
    <div 
      onClick={onImageClick}
      className="relative group/mockup cursor-pointer rounded-xl overflow-hidden border border-outline-variant/80 bg-[#121316] p-4 flex flex-col gap-3 min-h-[220px] transition-all hover:border-primary/50 shadow-inner"
      title="Clic para ver o cambiar imagen de la interfaz"
    >
      {/* Device / Browser Window Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 -mx-4 px-4 -mt-4 pt-3 bg-surface-container-lowest/80">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
          <span className="ml-2 font-mono text-[10px] text-on-surface-variant truncate max-w-[200px]">
            {title || 'app.pathrimonio.site/screen'}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] uppercase tracking-wider">
          Mockup Visual UI
        </span>
      </div>

      {/* Screen Specific Mockup Bodies */}

      {/* 4. DASHBOARD (Ventas, Ingresos, Egresos, Alertas) */}
      {placeholderType === 'dashboard' && (
        <div className="flex flex-col gap-3 pt-1">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/40 flex flex-col gap-0.5">
              <span className="text-[10px] text-on-surface-variant font-space uppercase">Ventas Hoy</span>
              <span className="text-sm font-bold font-mono text-emerald-400">$12,450</span>
              <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">▲ +14% vs ayer</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/40 flex flex-col gap-0.5">
              <span className="text-[10px] text-on-surface-variant font-space uppercase">Ingresos Mes</span>
              <span className="text-sm font-bold font-mono text-primary">$84,200</span>
              <span className="text-[9px] text-primary flex items-center gap-0.5">▲ +8.2%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/40 flex flex-col gap-0.5">
              <span className="text-[10px] text-on-surface-variant font-space uppercase">Egresos</span>
              <span className="text-sm font-bold font-mono text-white/90">$29,150</span>
              <span className="text-[9px] text-on-surface-variant">Estable</span>
            </div>
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 flex flex-col gap-0.5">
              <span className="text-[10px] text-red-400 font-space uppercase font-semibold">Alertas Inventario</span>
              <span className="text-sm font-bold font-mono text-red-400">3 Críticas</span>
              <span className="text-[9px] text-red-300">Stock &lt; 5 unidades</span>
            </div>
          </div>

          {/* Quick Actions & Live Chart Mockup */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2 p-3 rounded-lg bg-surface-container border border-outline-variant/40 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-space text-white">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Flujo de Caja en Tiempo Real
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">20 Nov, 2026</span>
              </div>
              {/* Graphic bars mockup */}
              <div className="h-16 flex items-end gap-1.5 pt-2 px-1">
                <div className="flex-1 bg-primary/40 rounded-t h-[45%] hover:bg-primary transition-all"></div>
                <div className="flex-1 bg-primary/50 rounded-t h-[60%] hover:bg-primary transition-all"></div>
                <div className="flex-1 bg-primary/40 rounded-t h-[35%] hover:bg-primary transition-all"></div>
                <div className="flex-1 bg-primary/60 rounded-t h-[75%] hover:bg-primary transition-all"></div>
                <div className="flex-1 bg-primary/70 rounded-t h-[85%] hover:bg-primary transition-all"></div>
                <div className="flex-1 bg-primary rounded-t h-[100%] shadow-[0_0_10px_rgba(245,166,35,0.5)]"></div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/40 flex flex-col gap-1.5 justify-between">
              <span className="text-[10px] font-space text-on-surface-variant uppercase font-semibold">Accesos Rápidos</span>
              <div className="flex flex-col gap-1 text-[11px] font-space">
                <button className="px-2 py-1 rounded bg-surface-container-high border border-outline-variant text-white text-left flex items-center justify-between">
                  <span>+ Nueva Venta</span>
                  <span className="text-primary font-mono font-bold">+</span>
                </button>
                <button className="px-2 py-1 rounded bg-surface-container-high border border-outline-variant text-white text-left flex items-center justify-between">
                  <span>Descargar Balance</span>
                  <span className="material-symbols-outlined text-[13px] text-primary">download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. LOGIN & AUTENTICACIÓN */}
      {placeholderType === 'login' && (
        <div className="flex items-center justify-center py-4">
          <div className="w-full max-w-xs p-4 rounded-xl bg-surface-container border border-outline-variant flex flex-col gap-2.5 shadow-xl">
            <div className="flex items-center gap-2 pb-1 border-b border-outline-variant/60">
              <img src="/assets/images/logo.png" alt="Pathrimonio" className="w-5 h-5 object-contain" />
              <span className="font-space font-bold text-xs text-white">PATH<span className="text-primary">RIMONIO</span></span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-on-surface-variant font-space">Correo Institucional</span>
              <div className="h-7 px-2 bg-surface-container-lowest border border-outline-variant rounded flex items-center text-[10px] text-white/80 font-mono">
                admin@pathrimonio.org
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-on-surface-variant font-space">Contraseña</span>
              <div className="h-7 px-2 bg-surface-container-lowest border border-outline-variant rounded flex items-center text-[10px] text-white/80 font-mono tracking-widest">
                ••••••••••••
              </div>
            </div>
            <div className="h-7 rounded bg-primary text-on-primary font-space text-xs font-bold flex items-center justify-center uppercase tracking-wider mt-1">
              Iniciar Sesión
            </div>
          </div>
        </div>
      )}

      {/* 2. ONBOARDING & BIENVENIDA */}
      {placeholderType === 'onboarding' && (
        <div className="flex flex-col items-center justify-center py-4 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[28px]">route</span>
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <span className="font-space font-bold text-sm text-white">Divide Metas Grandes en Pasos Claros</span>
            <span className="text-[11px] text-on-surface-variant font-jakarta">
              Aprende a registrar tus objetivos diarios sin frustración ni sobrecarga.
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-6 h-1.5 rounded-full bg-primary"></span>
            <span className="w-2 h-1.5 rounded-full bg-surface-container-highest"></span>
            <span className="w-2 h-1.5 rounded-full bg-surface-container-highest"></span>
          </div>
        </div>
      )}

      {/* 3. REGISTRO DE META */}
      {placeholderType === 'goal_create' && (
        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/60 flex flex-col gap-2 max-w-md mx-auto w-full">
          <span className="font-space text-xs font-bold text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[16px]">flag</span>
            Formulario: Nueva Gran Meta
          </span>
          <div className="h-7 px-2.5 bg-surface-container-lowest border border-outline-variant rounded flex items-center text-[10px] text-white">
            Meta: Lanzar Aplicación en Google Play Store
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-space text-on-surface-variant">
            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">Tecnología</span>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-white">Fecha: 30 Dic 2026</span>
          </div>
        </div>
      )}

      {/* 5. ROADMAP DE PASOS */}
      {placeholderType === 'steps_roadmap' && (
        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/60 flex flex-col gap-2 max-w-md mx-auto w-full">
          <div className="flex items-center justify-between text-xs font-space border-b border-outline-variant/50 pb-2">
            <span className="text-white font-bold">Ruta Crítica: Lanzamiento Pathway</span>
            <span className="text-primary font-mono font-bold">75% Completado</span>
          </div>
          <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-primary/40 text-[11px] font-jakarta">
            <div className="flex items-center gap-2 text-white">
              <span className="w-3 h-3 rounded-full bg-emerald-400 text-black flex items-center justify-center text-[8px] font-bold">✓</span>
              <span>1. Diseñar Wireframes y Arquitectura</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="w-3 h-3 rounded-full bg-emerald-400 text-black flex items-center justify-center text-[8px] font-bold">✓</span>
              <span>2. Implementar Base de Datos Offline</span>
            </div>
            <div className="flex items-center gap-2 text-primary font-medium">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
              <span>3. Aprobación en Play Store (En Curso)</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. BITÁCORA */}
      {placeholderType === 'journal' && (
        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/60 flex flex-col gap-2 max-w-md mx-auto w-full">
          <div className="flex items-center justify-between text-xs font-space border-b border-outline-variant/50 pb-1.5">
            <span className="text-white font-bold">Bitácora Diaria</span>
            <span className="text-on-surface-variant text-[10px]">20 Nov, 2026 • 23:40</span>
          </div>
          <p className="text-[11px] text-white/90 italic font-jakarta">
            "Hoy se formalizaron las interfaces contractuales para coordinar con el cliente..."
          </p>
          <div className="flex items-center gap-2 text-[10px] font-space text-on-surface-variant pt-1 border-t border-outline-variant/30">
            <span>Ánimo: 🔥 Enfoque Máximo</span>
            <span>•</span>
            <span>3 Hábitos Cumplidos</span>
          </div>
        </div>
      )}

      {/* Hover action banner */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/mockup:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
        <span className="px-3 py-1.5 rounded-lg bg-surface-container-high/95 text-white font-space text-xs font-semibold flex items-center gap-1.5 shadow-xl border border-outline-variant">
          <span className="material-symbols-outlined text-[16px] text-primary">image</span>
          <span>Ver / Reemplazar Imagen de Interfaz</span>
        </span>
      </div>
    </div>
  );
}
