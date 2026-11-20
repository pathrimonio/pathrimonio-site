import React, { useState, useEffect } from 'react';

const INITIAL_LOGS = [
  {
    time: "14:32:01 UTC",
    message: "Sincronización BioSalud Nodo #44 (Zona Andina) • 4,210 paquetes verificados",
    status: "STATUS: CONFIRMADO",
    statusColor: "text-primary"
  },
  {
    time: "14:31:12 UTC",
    message: "Red Raíces: Balance de liquidación comunitaria mensual emitido sin discrepancias",
    status: "STATUS: VALIDADO",
    statusColor: "text-primary"
  },
  {
    time: "14:28:44 UTC",
    message: "AguaViva IoT: Alerta temprana de sequía enviada a 3 comités de cuenca",
    status: "STATUS: DESPACHADO",
    statusColor: "text-primary"
  },
  {
    time: "14:25:02 UTC",
    message: "Verificación de integridad bloque SHA-256 en Ledger Rural #109 (Cusco)",
    status: "STATUS: SELLADO",
    statusColor: "text-primary"
  }
];

const NEW_LOG_TEMPLATES = [
  {
    prefix: "Red Raíces Nodo #88: Microcrédito de $1,200 USD desembolsado en modo offline",
    status: "STATUS: CONCILIADO",
    statusColor: "text-primary"
  },
  {
    prefix: "AguaViva IoT Estación #12: Telemetría de salinidad y nivel freático OK (14.2m)",
    status: "STATUS: TELEMETRÍA RECIBIDA",
    statusColor: "text-primary"
  },
  {
    prefix: "BioSalud Cadena de Frío: Monitoreo térmico constante a 4.1°C en tránsito",
    status: "STATUS: ÓPTIMO",
    statusColor: "text-primary"
  },
  {
    prefix: "Auditoría Social Pública: Hash de gobernanza emitido para asamblea comunal",
    status: "STATUS: AUDITADO",
    statusColor: "text-primary"
  }
];

export default function TelemetryAudit() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toISOString().slice(11, 19) + " UTC";
      const randomTemplate = NEW_LOG_TEMPLATES[Math.floor(Math.random() * NEW_LOG_TEMPLATES.length)];

      const newLog = {
        time: timeStr,
        message: randomTemplate.prefix,
        status: randomTemplate.status,
        statusColor: randomTemplate.statusColor
      };

      setLogs(prev => [newLog, ...prev.slice(0, 5)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <section className="w-full py-20 lg:py-24 bg-surface-container-low border-t border-outline-variant/60" id="auditoria">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col gap-2">
          <span className="font-space text-xs text-primary uppercase tracking-widest font-bold">
            Auditoría Social en Vivo
          </span>
          <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
            Transparencia e Indicadores de Rendimiento Sistémico
          </h2>
          <p className="font-jakarta text-sm sm:text-base text-on-surface-variant max-w-2xl">
            Monitoreo en tiempo real de nodos distribuidos, métricas de gobernanza e impacto medioambiental verificable.
          </p>
        </div>

        {/* Live Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-container border border-outline-variant/60 p-6 rounded-xl flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-space text-xs uppercase font-medium">Comunidades Atendidas</span>
              <span className="material-symbols-outlined text-primary text-[20px]">location_city</span>
            </div>
            <span className="font-space text-3xl lg:text-4xl font-bold text-white">1,420</span>
            <span className="font-jakarta text-xs text-on-surface-variant">
              Distribuidas en 8 ecosistemas rurales
            </span>
          </div>

          <div className="bg-surface-container border border-outline-variant/60 p-6 rounded-xl flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-space text-xs uppercase font-medium">Código Auditado Éticamente</span>
              <span className="material-symbols-outlined text-primary text-[20px]">rule</span>
            </div>
            <span className="font-space text-3xl lg:text-4xl font-bold text-primary">100%</span>
            <span className="font-jakarta text-xs text-on-surface-variant">
              Libre de sesgos discriminatorios
            </span>
          </div>

          <div className="bg-surface-container border border-outline-variant/60 p-6 rounded-xl flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-space text-xs uppercase font-medium">Eficiencia Energética</span>
              <span className="material-symbols-outlined text-primary text-[20px]">eco</span>
            </div>
            <span className="font-space text-3xl lg:text-4xl font-bold text-white">0.02g</span>
            <span className="font-jakarta text-xs text-on-surface-variant">
              CO₂ emitido por consulta de endpoint
            </span>
          </div>

          <div className="bg-surface-container border border-outline-variant/60 p-6 rounded-xl flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-space text-xs uppercase font-medium">Capacitaciones Locales</span>
              <span className="material-symbols-outlined text-primary text-[20px]">school</span>
            </div>
            <span className="font-space text-3xl lg:text-4xl font-bold text-white">2,850+</span>
            <span className="font-jakarta text-xs text-on-surface-variant">
              Horas de transferencia técnica directa
            </span>
          </div>
        </div>

        {/* Real-Time Activity Log Simulation */}
        <div className="bg-surface-container border border-outline-variant/70 p-6 rounded-xl flex flex-col gap-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
              <span className="font-space text-sm uppercase text-white font-bold">
                Registro de Ejecución Criptográfica de Impacto
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsLive(!isLive)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant text-[11px] font-space text-on-surface-variant hover:text-white"
              >
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-primary animate-pulse' : 'bg-outline'}`}></span>
                <span>{isLive ? 'EN VIVO' : 'PAUSADO'}</span>
              </button>
              <span className="font-space text-xs text-on-surface-variant font-mono">
                LATAM-SYNC // SHA-256
              </span>
            </div>
          </div>

          <div className="font-mono text-xs flex flex-col gap-2 text-on-surface-variant">
            {logs.map((log, index) => (
              <div 
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 bg-surface-container-low px-3.5 rounded border border-outline-variant/40 hover:border-outline-variant transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-white/40 text-[11px]">[{log.time}]</span>
                  <span className="text-white text-xs truncate">• {log.message}</span>
                </div>
                <span className={`font-space text-[11px] font-bold shrink-0 ${log.statusColor}`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
