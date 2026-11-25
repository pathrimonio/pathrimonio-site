import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Code2,
  ListChecks,
  Database,
  Shield
} from 'lucide-react';
import { generateEngineeringHandoff } from '../../../lib/formalia/compilers';
import { downloadCanonicalJSONFile, downloadPlantUMLFile } from '../../../services/formaliaService';

export default function FormalIAEngineeringModal({ isOpen, onClose, graph }) {
  const [activeTab, setActiveTab] = useState('plantuml');
  const [copiedKey, setCopiedKey] = useState(null);

  const handoff = useMemo(() => {
    if (!graph) return null;
    return generateEngineeringHandoff(graph);
  }, [graph]);

  if (!isOpen || !handoff) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Paquete Técnico FormalIA"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-4xl max-h-[88vh] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] rounded-[16px] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#09090B] flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#FFC000] text-[#09090B] font-mono text-[10px] font-bold">
                HANDOFF INGENIERÍA
              </span>
              <h3 className="text-sm sm:text-base font-semibold text-[#09090B] dark:text-[#F4F4F5]">
                Paquete Técnico FormalIA — {handoff.process_name || 'Proceso'}
              </h3>
            </div>
            <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
              Compilado deterministamente desde <span className="font-mono">{handoff.session_id}</span> para el equipo y agentes de desarrollo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-3 border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'plantuml', label: 'Código PlantUML (.puml)', icon: Code2 },
            { id: 'stories', label: `Historias de Usuario (${handoff.user_stories.length})`, icon: ListChecks },
            { id: 'rbac', label: `Entidades & RBAC (${handoff.rbac_rules.length})`, icon: Shield },
            { id: 'json', label: 'ProcessGraphJSON', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'border-[#FFC000] text-[#09090B] dark:text-[#F4F4F5]'
                    : 'border-transparent text-[#71717A] hover:text-[#09090B] dark:hover:text-[#F4F4F5]'
                }`}
              >
                <Icon size={14} className={active ? 'text-[#9A6700] dark:text-[#FFC000]' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#FAFAFA] dark:bg-[#09090B]/40">
          {activeTab === 'plantuml' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
                  Diagrama de actividad con carriles (<span className="font-mono">|Rol|</span>) válido para cualquier visor PlantUML.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(handoff.plantuml, 'puml')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#18181B] text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] hover:border-[#FFC000] cursor-pointer"
                  >
                    {copiedKey === 'puml' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedKey === 'puml' ? 'Copiado' : 'Copiar .puml'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadPlantUMLFile(graph)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFC000] text-[#09090B] text-xs font-semibold hover:bg-[#E5AC00] cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Descargar .puml</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-[10px] bg-[#09090B] text-[#F4F4F5] border border-[#27272A] font-mono text-xs overflow-x-auto leading-relaxed">
                {handoff.plantuml}
              </pre>
            </div>
          )}

          {activeTab === 'stories' && (
            <div className="space-y-3">
              {handoff.user_stories.length === 0 ? (
                <p className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
                  Aún no hay pasos suficientes en el diagrama para generar historias. Describe pasos en el chat primero.
                </p>
              ) : (
                handoff.user_stories.map((story) => (
                  <div
                    key={story.id}
                    className="p-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#F4F4F5] dark:bg-[#18181B] text-[#09090B] dark:text-[#F4F4F5] border border-[#E4E4E7] dark:border-[#27272A]">
                          {story.id}
                        </span>
                        <span className="text-xs font-semibold text-[#9A6700] dark:text-[#FFC000]">
                          {story.role}
                        </span>
                      </div>
                      {story.is_priority_automation && (
                        <span className="px-2 py-0.5 rounded bg-[#FFC000]/20 border border-[#FFC000]/40 text-[#9A6700] dark:text-[#FFC000] text-[10px] font-mono font-semibold">
                          Automatización Prioritaria
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#09090B] dark:text-[#F4F4F5] leading-relaxed">
                      <strong>Como</strong> {story.role}, <strong>quiero</strong> {story.action} <strong>para</strong> {story.benefit}.
                    </p>
                    <div className="pt-2 border-t border-[#E4E4E7] dark:border-[#27272A] space-y-1">
                      {story.acceptance_criteria.map((c, idx) => (
                        <div key={idx} className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] flex items-start gap-1.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rbac' && (
            <div className="space-y-4">
              <div className="p-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A]">
                <h4 className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] mb-2">
                  Entidades de Base de Datos Detectadas ({handoff.entities.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {handoff.entities.map((ent) => (
                    <span
                      key={ent}
                      className="px-2.5 py-1 rounded-[6px] bg-[#F4F4F5] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] font-mono text-xs text-[#09090B] dark:text-[#F4F4F5]"
                    >
                      {ent}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {handoff.rbac_rules.map((rule) => (
                  <div
                    key={rule.actor_id}
                    className="p-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5]">
                        {rule.role_name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#FFFBEB] dark:bg-amber-500/10 text-[#9A6700] dark:text-[#FFC000] font-mono text-[10px] border border-amber-200 dark:border-amber-500/30">
                        {rule.actor_type === 'EXTERNAL_CUSTOMER' ? 'Externo' : 'Socio $1/día'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#52525B] dark:text-[#A1A1AA]">
                      {rule.access_scope}
                    </span>
                    {rule.permitted_actions.length > 0 && (
                      <ul className="text-[11px] text-[#09090B] dark:text-[#E4E4E7] list-disc list-inside space-y-0.5">
                        {rule.permitted_actions.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
                  Modelo Canónico de Procesos (<span className="font-mono">ProcessGraphJSON</span>) — Fuente única de verdad.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(graph, null, 2), 'json')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#18181B] text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] hover:border-[#FFC000] cursor-pointer"
                  >
                    {copiedKey === 'json' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedKey === 'json' ? 'Copiado' : 'Copiar JSON'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadCanonicalJSONFile(graph)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFC000] text-[#09090B] text-xs font-semibold hover:bg-[#E5AC00] cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Descargar .json</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-[10px] bg-[#09090B] text-[#F4F4F5] border border-[#27272A] font-mono text-xs overflow-x-auto leading-relaxed">
                {JSON.stringify(graph, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
