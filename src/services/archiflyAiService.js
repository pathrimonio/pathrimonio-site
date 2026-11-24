// Servicio de Integración de IA para la Skill Archifly
// Conecta con Google Gemini API, OpenAI, DeepSeek o el motor estático offline.
// Principio: Zero-Code Leakage (Solo se envían firmas abstractas, contratos y metadatos).

import { getProjectArchitecture } from '../data/initialArchitectures';

export const AI_CONFIG_STORAGE_KEY = 'pathrimonio_archifly_ai_config_v1';

export const AI_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini API (Recomendado)',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Ultrarrápido & Preciso)' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Razonamiento Complejo)' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Baja Latencia)' }
    ],
    defaultModel: 'gemini-2.0-flash',
    endpoint: (model, key) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    placeholder: 'AIzaSy...'
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
  try {
    const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        provider: parsed.provider || 'gemini',
        model: parsed.model || 'gemini-2.0-flash',
        apiKey: parsed.apiKey || '',
        isAiEnabled: Boolean(parsed.isAiEnabled && parsed.apiKey)
      };
    }
  } catch (_) {}

  // Fallback to environment variable if present
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_AI_API_KEY || '';
  return {
    provider: 'gemini',
    model: 'gemini-2.0-flash',
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
  if (!apiKey || !apiKey.trim()) {
    return { success: false, error: 'Por favor ingresa una clave de API válida.' };
  }

  const cleanKey = apiKey.trim();

  try {
    if (provider === 'gemini') {
      const activeModel = model || 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${cleanKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Responde únicamente con la palabra: PONG' }] }]
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${res.status}: Error al autenticar con Gemini`);
      }

      return { success: true, message: `Conexión exitosa con Google Gemini (${activeModel}).` };
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
  aiConfig
}) {
  const fallbackArch = getProjectArchitecture(project?.id || 'pathway');

  if (!aiConfig?.isAiEnabled || !aiConfig?.apiKey?.trim()) {
    // Si no hay API key activa, retorna el motor estático offline de archifly
    return {
      source: 'offline_engine',
      architecture: fallbackArch,
      message: 'Arquitectura generada con el Motor Estático Local archifly (Offline-First).'
    };
  }

  const cleanKey = aiConfig.apiKey.trim();
  const provider = aiConfig.provider || 'gemini';
  const model = aiConfig.model || 'gemini-2.0-flash';

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
      samplePaths: treeNodes.filter(n => !n.isDirectory).slice(0, 20).map(n => n.path)
    }
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

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
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

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${res.status} al consultar Gemini API`);
      }

      const resJson = await res.json();
      rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
          model,
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
      model,
      architecture: {
        ...fallbackArch,
        ...parsed,
        synthesizedBy: `archifly Engine con ${provider.toUpperCase()} (${model})`,
        lastAnalyzed: new Date().toISOString()
      },
      message: `Arquitectura analizada y sintetizada con éxito mediante ${provider.toUpperCase()} (${model}).`
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
