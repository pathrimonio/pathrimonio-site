import React, { useState, useEffect } from 'react';

const PRESET_PAYLOADS = [
  {
    title: "Transacción de Microcrédito Comunal",
    text: "PATH-TX-2026:OFICIAL_ID=CR-042;COMUNIDAD=ANDINA_NORTE;MONTO=1200.00_USD;MODO=OFFLINE;NONCE=8849103"
  },
  {
    title: "Trazabilidad de Cadena de Frío",
    text: "PATH-HEALTH-COLDCHAIN:LOTE=VAC-COVID90;TEMP_AVG=3.8C;DIST_ID=AMAZONAS_14;TIMESTAMP_LOCAL=1700448102"
  },
  {
    title: "Telemetría de Sensor de Pozo Solar",
    text: "PATH-IOT-H2O:NODO=WELL_08;NIVEL_FREA=14.32m;SALINIDAD=0.18ppm;BATERIA_SOLAR=98%;RADIO=LORAWAN"
  }
];

export default function TelemetryAudit() {
  const [inputText, setInputText] = useState(PRESET_PAYLOADS[0].text);
  const [activePreset, setActivePreset] = useState(0);
  const [computedHash, setComputedHash] = useState('');
  const [computing, setComputing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Real SHA-256 calculation using Web Cryptography API
  useEffect(() => {
    let isCancelled = false;
    setComputing(true);

    const calculateHash = async () => {
      try {
        const msgBuffer = new TextEncoder().encode(inputText);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        if (!isCancelled) {
          setComputedHash(hashHex);
          setComputing(false);
        }
      } catch (e) {
        if (!isCancelled) {
          setComputedHash('Error calculando hash criptográfico');
          setComputing(false);
        }
      }
    };

    calculateHash();
    return () => { isCancelled = true; };
  }, [inputText]);

  const handleSelectPreset = (idx) => {
    setActivePreset(idx);
    setInputText(PRESET_PAYLOADS[idx].text);
  };

  const handleCopyHash = () => {
    if (!computedHash) return;
    navigator.clipboard?.writeText(computedHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full py-20 lg:py-24 bg-surface-container-low border-t border-outline-variant/60" id="estandares">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col gap-2 max-w-3xl">
          <span className="font-space text-xs text-primary uppercase tracking-widest font-bold">
            Garantías Técnicas y Seguridad
          </span>
          <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
            Estándares de Rendimiento, Seguridad &amp; Auditoría
          </h2>
          <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Nuestros sistemas están construidos bajo estrictos protocolos de ingeniería de software. Cada transacción, acta o registro telemétrico es inmutable, auditable y criptográficamente comprobable.
          </p>
        </div>

        {/* 4 Architectural Standards Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-container border border-outline-variant/60 p-6 rounded-xl flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-space text-xs uppercase font-bold text-white">Modo Offline-First</span>
              <span className="material-symbols-outlined text-primary text-[20px]">offline_bolt</span>
            </div>
            <span className="font-space text-xl font-bold text-white">Autonomía Total</span>
            <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
              Base de datos embebida con sincronización asíncrona idempotente. Opera sin conexión y reconcilia sin conflictos.
            </p>
          </div>

          <div className="bg-surface-container border border-outline-variant/60 p-6 rounded-xl flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-space text-xs uppercase font-bold text-white">Criptografía Fuerte</span>
              <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
            </div>
            <span className="font-space text-xl font-bold text-primary">AES-256 + SHA-256</span>
            <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
              Cifrado en reposo para dispositivos locales y firmas digitales de extremo a extremo que impiden la alteración de actas.
            </p>
          </div>

          <div className="bg-surface-container border border-outline-variant/60 p-6 rounded-xl flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-space text-xs uppercase font-bold text-white">Carga Ultra-Ligera</span>
              <span className="material-symbols-outlined text-primary text-[20px]">speed</span>
            </div>
            <span className="font-space text-xl font-bold text-white">&lt; 50 KB Payload</span>
            <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
              Arquitectura optimizada para funcionar fluidamente en redes satelitales de alta latencia o conectividad móvil 2G/3G.
            </p>
          </div>

          <div className="bg-surface-container border border-outline-variant/60 p-6 rounded-xl flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-space text-xs uppercase font-bold text-white">Soberanía de Código</span>
              <span className="material-symbols-outlined text-primary text-[20px]">code</span>
            </div>
            <span className="font-space text-xl font-bold text-white">Open Core Auditable</span>
            <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
              Modelos de código abierto verificables sin costos de licencias extractivas ni dependencia de monopolios en la nube.
            </p>
          </div>
        </div>

        {/* Real-Time Interactive Cryptographic Inspector */}
        <div className="bg-surface-container border border-outline-variant/70 p-6 rounded-xl flex flex-col gap-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">terminal</span>
              <div>
                <span className="font-space text-sm uppercase text-white font-bold block">
                  Inspector de Integridad Criptográfica en Cliente
                </span>
                <span className="font-jakarta text-xs text-on-surface-variant">
                  Cálculo determinista SHA-256 ejecutado en tu propio navegador mediante Web Cryptography API
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-space text-xs text-primary font-mono font-bold">
                API NATIVA ACTIVA
              </span>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-space text-xs text-white font-medium">
              Cargar Carga Útil de Ejemplo o Ingresar Datos Personalizados:
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_PAYLOADS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(idx)}
                  className={`px-3 py-1.5 rounded-lg font-space text-xs transition-all ${
                    activePreset === idx
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white'
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Payload Input */}
          <div className="flex flex-col gap-1.5">
            <label className="font-space text-xs text-on-surface-variant font-medium">
              Contenido de la Transacción / Registro:
            </label>
            <textarea
              rows="2"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setActivePreset(-1);
              }}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 font-mono text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none leading-relaxed"
              placeholder="Escribe cualquier texto para ver cómo se calcula su huella SHA-256 en tiempo real..."
            ></textarea>
          </div>

          {/* Computed Hash Display */}
          <div className="p-4 rounded-lg bg-surface-container-lowest border border-outline-variant flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">fingerprint</span>
                <span className="font-space text-xs uppercase tracking-wider text-white font-bold">
                  Huella Digital Criptográfica (SHA-256 Digest)
                </span>
              </div>
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container border border-outline-variant hover:border-primary text-on-surface-variant hover:text-white font-space text-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copiado' : 'Copiar Hash'}</span>
              </button>
            </div>

            <div className="font-mono text-xs sm:text-sm text-primary font-bold break-all bg-surface-container/60 p-3 rounded border border-primary/20">
              {computing ? 'Calculando hash...' : computedHash}
            </div>

            <div className="flex flex-wrap items-center justify-between text-on-surface-variant font-space text-[11px] pt-1">
              <span>Longitud: 256 bits (64 caracteres hexadecimales)</span>
              <span className="text-white flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-primary text-[14px]">verified</span>
                Estado de Integridad: Comprobado en Cliente
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
