import React, { useState } from 'react';
import { 
  Database, 
  WifiOff, 
  ShieldCheck, 
  Cpu, 
  FileCode, 
  Terminal, 
  ArrowRight, 
  Check, 
  Lock, 
  HardDrive,
  RefreshCw,
  EyeOff,
  Server
} from 'lucide-react';

const ARCHITECTURE_PILLARS = [
  {
    id: 'offline',
    title: '100% Offline-First (SQLite Local)',
    subtitle: 'Resiliencia Operativa Continua',
    badge: 'Cero Caídas',
    icon: WifiOff,
    highlight: 'Operación continua sin internet',
    description: 'Toda la interfaz y base de datos reside localmente en el equipo (PC, tablet o terminal). Las ventas, despachos y cobros se registran al instante sin depender de conexión.',
    specs: [
      { label: 'Motor Local', val: 'SQLite embebido de ultra-baja latencia' },
      { label: 'Tiempo de respuesta', val: '< 5 ms por transacción local' },
      { label: 'Sincronización', val: 'Cola reactiva en segundo plano con reconexión automática' },
      { label: 'Resolución de conflictos', val: 'Determinista por timestamp y vector de versión' }
    ],
    codeSnippet: `// Arquitectura Local Offline-First
const localDb = openLocalDatabase("pathrimonio.db");

// Registra en disco sin requerir señal de red
export async function registrarCobro(tx: VentaPayload): Promise<Receipt> {
  const receipt = await localDb.transaction(async (trx) => {
    return await trx.insertInto("cobros").values({
      id: crypto.randomUUID(),
      monto: tx.monto,
      hash_seguridad: computeSha256(tx),
      sync_status: "PENDING_SYNC" // Se sincroniza al detectar Wi-Fi/4G
    });
  });
  return receipt; // Respuesta inmediata (< 5ms)
}`
  },
  {
    id: 'abstract_manifest',
    title: 'Doble Modo & Métodos Abstractos',
    subtitle: 'Especificación SDD · Cero Fuga de Código',
    badge: 'Privacidad Total',
    icon: EyeOff,
    highlight: 'El código fuente nunca sale de tu máquina',
    description: 'Separamos la lectura local del visor web. Tu máquina en localhost escanea el árbol y parsea únicamente las firmas de métodos abstractos para interactuar con archify.',
    specs: [
      { label: 'Entorno Local (localhost)', val: 'Escáner AST en memoria (< 150 ms para 1,000 archivos)' },
      { label: 'Entorno Web / Producción', val: 'Visor de firmas ligeras (methods.manifest.json)' },
      { label: 'Qué se extrae', val: 'Firmas públicas, parámetros tipados y retornos' },
      { label: 'Qué se descarta', val: 'Cuerpo de funciones (body), lógica de negocio y secretos' }
    ],
    codeSnippet: `{
  "project_root": "pathrimonio-core",
  "source_mode": "LOCALHOST_FS",
  "scanned_at": "2026-11-23T21:00:00-05:00",
  "tree": [{
    "path": "src/modules/caja/cierreTurno.service.ts",
    "abstract_methods": [
      {
        "symbol_id": "CierreTurno.conciliarBalance",
        "signature": "public conciliarBalance(turnoId: string): BalanceAudit",
        "visibility": "public",
        "is_async": true
        // El cuerpo (body) de la función NUNCA se exporta
      }
    ]
  }]
}`
  },
  {
    id: 'sovereignty',
    title: 'Soberanía de Datos & Auditoría SHA-256',
    subtitle: 'Sin Vendor Lock-in · Control Criptográfico',
    badge: 'Propiedad Absoluta',
    icon: ShieldCheck,
    highlight: 'Tus datos son tuyos, verificables e inmutables',
    description: 'No retenemos tu información ni cobramos por exportarla. Cada operación de caja y movimiento de almacén queda sellado con una huella criptográfica verificable ante asambleas.',
    specs: [
      { label: 'Formato de posesión', val: 'SQL estándar (PostgreSQL / SQLite) y exportación CSV' },
      { label: 'Integridad', val: 'Hash SHA-256 inmutable por comprobante emitido' },
      { label: 'Comisiones de salida', val: '$0 USD (descarga libre en cualquier momento)' },
      { label: 'Gobernanza', val: 'Auditoría para directivas, asambleas y entidades' }
    ],
    codeSnippet: `// Verificación criptográfica de auditoría inmutable
export function sellarComprobante(payload: RegistroOperativo): string {
  const canonico = canonicalize({
    rol_emisor: payload.usuario_id,
    caja_id: payload.caja_id,
    total: payload.total,
    timestamp: payload.created_at
  });
  
  // Genera huella SHA-256 inalterable para auditoría
  const hash = crypto.createHash("sha256").update(canonico).digest("hex");
  return hash; // Ej: 8f9b2a1c4e7...
}`
  }
];

export default function ArchitectureSection() {
  const [activeTab, setActiveTab] = useState('offline');
  const activePillar = ARCHITECTURE_PILLARS.find(p => p.id === activeTab) || ARCHITECTURE_PILLARS[0];

  return (
    <section id="arquitectura" className="w-full py-20 lg:py-28 bg-[#FAFAFA] dark:bg-[#09090B] border-b border-[#E4E4E7] dark:border-[#27272A] transition-colors">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        {/* Encabezado de Sección */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#F4F4F5] dark:bg-[#18181B] text-[#52525B] dark:text-[#A1A1AA] text-xs font-mono mb-3">
            <span>SECCIÓN 03</span>
            <span>/</span>
            <span className="text-[#09090B] dark:text-[#F4F4F5] font-semibold">ARQUITECTURA SISTÉMICA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#09090B] dark:text-[#F4F4F5] tracking-[-0.02em] mb-4">
            Arquitectura offline-first, soberanía total y cero fuga de código.
          </h2>
          <p className="text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            Diseñada para la realidad operativa: eliminamos la dependencia de nubes cerradas y garantizamos que la lógica interna, el código fuente y las bases de datos permanezcan siempre bajo la propiedad y control de tu organización.
          </p>
        </div>

        {/* Selector de Pilares Arquitectónicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {ARCHITECTURE_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = activeTab === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActiveTab(pillar.id)}
                className={`p-4 rounded-[8px] border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#FFFBEB] dark:bg-amber-500/10 border-[#FFC000] shadow-xs'
                    : 'bg-[#FFFFFF] dark:bg-[#111113] border-[#E4E4E7] dark:border-[#27272A] hover:border-[#D4D4D8] dark:hover:border-[#3F3F46]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#FFC000] text-[#09090B]' : 'bg-[#F4F4F5] dark:bg-[#18181B] text-[#52525B] dark:text-[#A1A1AA]'
                  }`}>
                    <Icon size={16} strokeWidth={1.75} />
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-[4px] font-semibold ${
                    isSelected 
                      ? 'bg-white dark:bg-[#18181B] text-[#9A6700] dark:text-[#FFC000] border border-amber-200 dark:border-amber-500/30' 
                      : 'bg-[#F4F4F5] dark:bg-[#18181B] text-[#52525B] dark:text-[#A1A1AA]'
                  }`}>
                    {pillar.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#09090B] dark:text-[#F4F4F5] mb-0.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
                    {pillar.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Visor Técnico Expandido: Explicación + Código en Vivo */}
        <div className="bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] rounded-[10px] p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Lado Izquierdo: Descripción y Especificaciones (5/12 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#9A6700] dark:text-[#FFC000] mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC000]"></span>
                <span>{activePillar.highlight}</span>
              </div>
              <h3 className="text-2xl font-bold text-[#09090B] dark:text-[#F4F4F5] tracking-tight mb-3">
                {activePillar.title}
              </h3>
              <p className="text-sm text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-6">
                {activePillar.description}
              </p>

              {/* Especificaciones Técnicas */}
              <div className="flex flex-col gap-3 pt-4 border-t border-[#E4E4E7] dark:border-[#27272A]">
                {activePillar.specs.map((spec, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs gap-1">
                    <span className="text-[#52525B] dark:text-[#A1A1AA] font-medium">{spec.label}:</span>
                    <span className="font-mono text-[#09090B] dark:text-[#F4F4F5] font-semibold sm:text-right">{spec.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-[6px] bg-[#FFFBEB] dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 text-xs text-[#09090B] dark:text-[#F4F4F5] flex items-center gap-2.5">
              <Lock size={15} className="text-[#9A6700] dark:text-[#FFC000] shrink-0" />
              <span>Garantía contractual de soberanía: 100% libre de licencias o candados propietarios.</span>
            </div>
          </div>

          {/* Lado Derecho: Bloque de Código de Inspección (7/12 cols) */}
          <div className="lg:col-span-7 rounded-[8px] bg-[#09090B] border border-[#27272A] overflow-hidden flex flex-col shadow-inner">
            <div className="px-4 py-2.5 bg-[#111113] border-b border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27272A]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27272A]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27272A]"></span>
                </div>
                <span className="text-[11px] font-mono text-[#A1A1AA] pl-2">
                  {activeTab === 'abstract_manifest' ? 'methods.manifest.json' : 'pathrimonio.architecture.ts'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-medium text-[#FFC000] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                AUDITADO
              </span>
            </div>

            <div className="p-4 sm:p-5 overflow-x-auto text-[12px] font-mono text-[#F4F4F5] leading-relaxed">
              <pre className="selection:bg-amber-900/40 selection:text-amber-200">
                <code>{activePillar.codeSnippet}</code>
              </pre>
            </div>

            <div className="px-4 py-2 bg-[#111113]/80 border-t border-[#27272A] flex items-center justify-between text-[11px] font-mono text-[#71717A]">
              <span>Modo de ejecución: Aislamiento estricto</span>
              <span className="text-[#FFC000] flex items-center gap-1">
                <Check size={12} strokeWidth={2.5} />
                <span>Verificación de Integridad OK</span>
              </span>
            </div>
          </div>

        </div>

        {/* 4 Métricas de Seguridad & Rendimiento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-minimal p-5">
            <div className="w-8 h-8 rounded-[6px] bg-[#F4F4F5] dark:bg-[#18181B] flex items-center justify-center text-[#09090B] dark:text-[#F4F4F5] mb-3">
              <HardDrive size={16} strokeWidth={1.75} />
            </div>
            <div className="text-xl font-bold font-mono text-[#09090B] dark:text-[#F4F4F5] mb-1">
              &lt; 5 ms
            </div>
            <span className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] block mb-1">
              Latencia Local
            </span>
            <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
              Lectura y guardado directo en SQLite local sin esperar respuestas de red.
            </p>
          </div>

          <div className="card-minimal p-5">
            <div className="w-8 h-8 rounded-[6px] bg-[#F4F4F5] dark:bg-[#18181B] flex items-center justify-center text-[#09090B] dark:text-[#F4F4F5] mb-3">
              <EyeOff size={16} strokeWidth={1.75} />
            </div>
            <div className="text-xl font-bold font-mono text-[#9A6700] dark:text-[#FFC000] mb-1">
              0% Fuga
            </div>
            <span className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] block mb-1">
              Código Protegido
            </span>
            <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
              La lógica de negocio interna nunca se almacena ni se expone en la web.
            </p>
          </div>

          <div className="card-minimal p-5">
            <div className="w-8 h-8 rounded-[6px] bg-[#F4F4F5] dark:bg-[#18181B] flex items-center justify-center text-[#09090B] dark:text-[#F4F4F5] mb-3">
              <Database size={16} strokeWidth={1.75} />
            </div>
            <div className="text-xl font-bold font-mono text-[#09090B] dark:text-[#F4F4F5] mb-1">
              100% Posesión
            </div>
            <span className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] block mb-1">
              Soberanía de Datos
            </span>
            <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
              Descarga tu base de datos SQL completa en un clic sin costo ni trabas.
            </p>
          </div>

          <div className="card-minimal p-5">
            <div className="w-8 h-8 rounded-[6px] bg-[#F4F4F5] dark:bg-[#18181B] flex items-center justify-center text-[#09090B] dark:text-[#F4F4F5] mb-3">
              <ShieldCheck size={16} strokeWidth={1.75} />
            </div>
            <div className="text-xl font-bold font-mono text-[#09090B] dark:text-[#F4F4F5] mb-1">
              SHA-256
            </div>
            <span className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] block mb-1">
              Firma Inmutable
            </span>
            <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
              Control antifraude auditable en cierres de caja y movimientos de stock.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
