// Servicio de Integración de IA para la Skill Archifly
// Conecta con Google Gemini API, OpenAI, DeepSeek o el motor estático offline.
// Principio: Zero-Code Leakage (Solo se envían firmas abstractas, contratos y metadatos).

import { getProjectArchitecture } from '../data/initialArchitectures';

export const AI_CONFIG_STORAGE_KEY = 'pathrimonio_archifly_ai_config_v1';
const getEnvApiKey = () => {
  const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  return (viteEnv.VITE_GEMINI_API_KEY || viteEnv.VITE_AI_API_KEY || '').trim();
};

export const AI_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini API (Conectado)',
    models: [
      { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite (Recomendado / Activo)' },
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Alta Precisión)' },
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview (Razonamiento Complejo)' }
    ],
    defaultModel: 'gemini-3.5-flash-lite',
    endpoint: (model, key) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    placeholder: 'AQ.Ab8... o AIzaSy...'
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4o)',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o (Alta Fidelidad)' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Económico)' }
    ],
    defaultModel: 'gpt-4o',
    endpoint: () => 'https://api.openai.com/v1/chat/completions',
    placeholder: 'sk-proj-...'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Chat',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3' }
    ],
    defaultModel: 'deepseek-chat',
    endpoint: () => 'https://api.deepseek.com/v1/chat/completions',
    placeholder: 'sk-...'
  }
];

export function loadArchiflyAiConfig() {
  const envKey = getEnvApiKey();
  try {
    const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const key = (parsed.apiKey || envKey || '').trim();
      return {
        provider: parsed.provider || 'gemini',
        model: (parsed.model === 'gemini-2.0-flash' || parsed.model === 'gemini-1.5-pro' || !parsed.model)
          ? 'gemini-3.5-flash-lite'
          : parsed.model,
        apiKey: key,
        isAiEnabled: parsed.isAiEnabled !== undefined ? Boolean(parsed.isAiEnabled && key) : Boolean(key)
      };
    }
  } catch (_) {}

  return {
    provider: 'gemini',
    model: 'gemini-3.5-flash-lite',
    apiKey: envKey,
    isAiEnabled: Boolean(envKey)
  };
}

export function saveArchiflyAiConfig(config) {
  try {
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving Archifly AI config:', e);
  }
}

// Probar conexión con la API
export async function testAiConnection({ provider = 'gemini', apiKey, model }) {
  const cleanKey = (apiKey || getEnvApiKey()).trim();

  if (!cleanKey) {
    return { success: false, error: 'Por favor ingresa una clave de API válida.' };
  }

  try {
    if (provider === 'gemini') {
      const candidateModels = [
        model || 'gemini-3.5-flash-lite',
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.8-flash'
      ];

      let lastError = null;
      for (const m of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${cleanKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Responde únicamente con la palabra: PONG' }] }]
            })
          });

          if (res.ok) {
            return { success: true, message: `Conexión exitosa con Google Gemini (${m}). API Key activa y válida.` };
          }

          const errJson = await res.json().catch(() => ({}));
          lastError = errJson?.error?.message || `HTTP ${res.status}`;
        } catch (e) {
          lastError = e.message;
        }
      }

      throw new Error(lastError || 'No se pudo conectar con los modelos de Gemini.');
    }

    if (provider === 'openai' || provider === 'deepseek') {
      const endpoint = provider === 'deepseek'
        ? 'https://api.deepseek.com/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      const activeModel = model || (provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [{ role: 'user', content: 'Responde PONG' }],
          max_tokens: 10
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${res.status}: Error de autenticación`);
      }

      return { success: true, message: `Conexión exitosa con ${provider.toUpperCase()} (${activeModel}).` };
    }

    return { success: false, error: 'Proveedor no reconocido.' };
  } catch (err) {
    return { success: false, error: err.message || 'Fallo de conexión con el proveedor de IA.' };
  }
}

// Ejecutar análisis de arquitectura con IA
export async function analyzeArchitectureWithAi({
  project,
  stories = [],
  interfaces = [],
  dataModels = [],
  treeNodes = [],
  fileRecords = [],
  aiConfig
}) {
  const fallbackArch = getProjectArchitecture(project?.id || 'pathway');
  const cleanKey = (aiConfig?.apiKey || getEnvApiKey()).trim();

  if (!cleanKey) {
    return {
      source: 'offline_engine',
      architecture: fallbackArch,
      message: 'Arquitectura generada con el Motor Estático Local archifly (Offline-First).'
    };
  }

  const provider = aiConfig?.provider || 'gemini';
  const initialModel = aiConfig?.model || 'gemini-3.5-flash-lite';

  const nodePathById = new Map(treeNodes.map((n) => [n.id, n.path]));

  // Preparar payload ligero con Zero-Code Leakage
  const promptPayload = {
    project: {
      id: project?.id,
      name: project?.name,
      description: project?.description,
      modules: project?.modules
    },
    userStories: stories.slice(0, 15).map(s => ({
      id: s.id,
      role: s.role,
      goal: s.goal,
      module: s.module,
      criteria: s.acceptanceCriteria?.slice(0, 2)
    })),
    interfaces: interfaces.slice(0, 12).map(i => ({
      id: i.id,
      name: i.name,
      module: i.module,
      type: i.type,
      dataUsage: i.dataUsage
    })),
    dataModels: dataModels.slice(0, 10).map(d => ({
      name: d.name,
      description: d.description,
      columnsCount: d.columns?.length || 0
    })),
    treeSummary: {
      totalFiles: treeNodes.filter(n => !n.isDirectory).length,
      samplePaths: treeNodes.filter(n => !n.isDirectory).slice(0, 25).map(n => n.path)
    },
    syncedAbstractRecords: fileRecords.slice(0, 60).map(r => ({
      filePath: nodePathById.get(r.nodeId) || '',
      recordType: r.recordType,
      name: r.name,
      signature: r.signature,
      lineNumber: r.lineNumber
    }))
  };

  const systemInstructions = `
Actúa como la skill Archifly, experto en Arquitectura de Software Sistemática, Clean Architecture y Hexagonal Architecture.
Dado el siguiente proyecto de software y sus requerimientos, genera una especificación arquitectónica rigurosa en formato JSON estricto.
IMPORTANTE:
1. Divide el software en 4 capas concéntricas:
   - "presentation" (Capa 1: Presentación & UI)
   - "application" (Capa 2: Aplicación & Casos de Uso)
   - "domain" (Capa 3: Dominio & Reglas Nucleares)
   - "infrastructure" (Capa 4: Infraestructura & Adaptadores)
2. Para cada capa, define 2 a 3 componentes con métodos abstractos (symbol, signature, visibility, isAsync, line, doc) SIN cuerpo de código (Zero-Code Leakage).
3. Genera un diagrama Mermaid C4 claro en "mermaidDiagram".
4. Construye una matriz de trazabilidad "traceabilityMatrix" que vincule: storyId -> interfaceId -> abstractMethod -> domainModel.
5. Proporciona diagnóstico de cumplimiento de la regla de inversión de dependencias (DIP) y recomendaciones.

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura (sin texto markdown antes o después):
{
  "architecturePattern": "Patrón arquitectónico",
  "summary": "Resumen arquitectónico",
  "tokenSavingsPercent": 95.5,
  "metrics": {
    "layersCount": 4,
    "abstractMethodsCount": 24,
    "tracedStoriesPercent": 100,
    "offlineReadiness": "Nativa o Híbrida",
    "dipCompliance": "100% Compliant"
  },
  "layers": [
    {
      "id": "presentation",
      "name": "Capa 1: Presentación & UI",
      "badge": "UI/UX",
      "colorClass": "text-amber-400 border-amber-500/30 bg-amber-500/10",
      "description": "Descripción",
      "components": [
        {
          "name": "NombreComponente",
          "path": "ruta/al/archivo.tsx",
          "type": "screen",
          "abstractMethods": [
            {
              "symbol": "Clase.metodo",
              "signature": "public metodo(arg: Tipo): Retorno",
              "visibility": "public",
              "isAsync": true,
              "line": 40,
              "doc": "Propósito"
            }
          ]
        }
      ]
    }
  ],
  "mermaidDiagram": "flowchart TD\\n  ...",
  "traceabilityMatrix": [
    {
      "storyId": "US-01",
      "storyTitle": "...",
      "interfaceId": "IF-01",
      "interfaceName": "...",
      "abstractMethod": "Clase.metodo()",
      "domainModel": "tabla",
      "doDCriterion": "...",
      "status": "Auditado"
    }
  ],
  "diagnostics": {
    "dipCompliance": "100% — Dominio aislado",
    "zeroLeakageScore": "100% — Solo firmas abstractas",
    "offlineReadiness": "100%",
    "cyclomaticComplexity": "1.3",
    "recommendations": ["..."]
  }
}
`;

  try {
    let rawText = '';
    let usedModel = initialModel;

    if (provider === 'gemini') {
      const candidateModels = [
        initialModel,
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.8-flash'
      ];

      let lastError = null;
      let success = false;

      for (const m of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${cleanKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: systemInstructions },
                    { text: `PROYECTO A ANALIZAR:\n${JSON.stringify(promptPayload, null, 2)}` }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            })
          });

          if (res.ok) {
            const resJson = await res.json();
            rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            usedModel = m;
            success = true;
            break;
          }

          const errJson = await res.json().catch(() => ({}));
          lastError = errJson?.error?.message || `HTTP ${res.status}`;
        } catch (e) {
          lastError = e.message;
        }
      }

      if (!success) {
        throw new Error(lastError || 'Fallo al invocar modelos de Gemini.');
      }
    } else {
      // OpenAI / DeepSeek
      const endpoint = provider === 'deepseek'
        ? 'https://api.deepseek.com/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: initialModel,
          messages: [
            { role: 'system', content: systemInstructions },
            { role: 'user', content: JSON.stringify(promptPayload) }
          ],
          temperature: 0.2
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${res.status} al consultar ${provider}`);
      }

      const resJson = await res.json();
      rawText = resJson?.choices?.[0]?.message?.content || '';
    }

    // Limpiar posibles bloques de código markdown ```json ... ```
    const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      source: 'ai_model',
      provider,
      model: usedModel,
      architecture: {
        ...fallbackArch,
        ...parsed,
        synthesizedBy: `archifly Engine con ${provider.toUpperCase()} (${usedModel})`,
        lastAnalyzed: new Date().toISOString()
      },
      message: `Arquitectura analizada y sintetizada con éxito mediante ${provider.toUpperCase()} (${usedModel}).`
    };
  } catch (err) {
    console.warn('Fallo en análisis con IA, recurriendo a motor estático:', err);
    return {
      source: 'offline_fallback',
      error: err.message,
      architecture: fallbackArch,
      message: `No se pudo conectar con el modelo (${err.message}). Se cargó el motor estático local archifly.`
    };
  }
}
