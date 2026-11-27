import { z } from 'zod';

// ── Constantes de Cuotas y Techos Anti-Abuso (SDD FormalIA v2 + RBAC 5 Roles) ─

export const ANON_SESSION_AI_LIMIT = 5;
export const ANON_IP_DAILY_AI_LIMIT = 10;
export const AUTH_USER_DAILY_AI_LIMIT = 15;
export const PARTNER_DAILY_AI_LIMIT = 45;
export const COLLABORATOR_DAILY_AI_LIMIT = 120;
export const ADMIN_DAILY_AI_LIMIT = 999;

export const MAX_WORKSPACES_FREE = 5;
export const MAX_CANVASES_PER_WORKSPACE_FREE = 20;
export const MAX_WORKSPACES_PARTNER = 50;
export const MAX_CANVASES_PER_WORKSPACE_PARTNER = 200;

export function getAiDailyLimitForRole(role = null, isAuthenticated = false) {
  if (!isAuthenticated) return ANON_SESSION_AI_LIMIT;
  const r = String(role || '').trim().toLowerCase();
  if (r === 'admin' || r === 'administrador' || r === 'superadmin') return ADMIN_DAILY_AI_LIMIT;
  if (
    r === 'colaborador' ||
    r === 'collaborator' ||
    r === 'desarrollador' ||
    r === 'fintech lead' ||
    r === 'auditora de impacto'
  ) {
    return COLLABORATOR_DAILY_AI_LIMIT;
  }
  if (r === 'socio / cliente' || r === 'socio' || r === 'partner' || r === 'cliente') {
    return PARTNER_DAILY_AI_LIMIT;
  }
  return AUTH_USER_DAILY_AI_LIMIT;
}

export const ALLOWED_AI_ACTION_TYPES = ['PROCESS_CHAT', 'STORY_GEN', 'UI_LAYOUT'];
export const ALLOWED_UI_BLOCK_TYPES = ['kpi_row', 'data_table', 'action_form', 'status_board'];

// ── Esquemas de Tema Visual (Theme Studio - Paso 2) ──────────────────────────

export const THEME_PRESETS = {
  minimal_light: {
    id: 'minimal_light',
    label: 'Minimalista Claro',
    description: 'Limpio y editorial sobre blanco puro',
    bg_page: '#F8FAFC',
    bg_surface: '#FFFFFF',
    bg_subtle: '#F1F5F9',
    text_primary: '#0F172A',
    text_secondary: '#475569',
    border_color: '#E2E8F0',
    primary_color: '#2563EB',
    radius: 'md',
    font_mode: 'sans'
  },
  minimal_dark: {
    id: 'minimal_dark',
    label: 'Minimalista Oscuro',
    description: 'Alto contraste moderno con acento Pathrimonio',
    bg_page: '#111317',
    bg_surface: '#1B1E24',
    bg_subtle: '#252932',
    text_primary: '#F4F4F5',
    text_secondary: '#A1A1AA',
    border_color: '#2E323B',
    primary_color: '#FFC000',
    radius: 'md',
    font_mode: 'sans'
  },
  corporate: {
    id: 'corporate',
    label: 'Corporativo',
    description: 'Sobrio ejecutivo azul pizarra',
    bg_page: '#F3F6FA',
    bg_surface: '#FFFFFF',
    bg_subtle: '#E6EDF7',
    text_primary: '#0B1F44',
    text_secondary: '#475E82',
    border_color: '#CBD5E1',
    primary_color: '#1D4ED8',
    radius: 'sm',
    font_mode: 'sans'
  },
  ops_compact: {
    id: 'ops_compact',
    label: 'Operativo Compacto',
    description: 'Alta densidad de datos y controles rápidos',
    bg_page: '#0B0F14',
    bg_surface: '#131922',
    bg_subtle: '#1C2430',
    text_primary: '#E6EDF3',
    text_secondary: '#8B949E',
    border_color: '#30363D',
    primary_color: '#10B981',
    radius: 'none',
    font_mode: 'mono'
  }
};

export const ThemeConfigSchema = z.object({
  preset: z.enum(['minimal_light', 'minimal_dark', 'corporate', 'ops_compact']).default('minimal_dark'),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFC000'),
  radius: z.enum(['none', 'sm', 'md', 'lg']).default('md'),
  font_mode: z.enum(['sans', 'mono']).default('sans')
});

// ── Esquemas de Historias de Usuario (Paso 1) ─────────────────────────────────

export const BlueprintStorySchema = z.object({
  id: z.string().min(1),
  role: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  acceptance_criteria: z.array(z.string()).default([]),
  suggested_fields: z.array(z.string()).default([]),
  linked_step_id: z.string().optional().nullable(),
  linked_canvas_id: z.string().optional().nullable(),
  priority: z.enum(['Alta', 'Media', 'Baja']).default('Media')
});

// ── Esquema Declarativo Seguro de UI (Catálogo Cerrado Anti-XSS - Paso 3) ─────

export const KpiRowBlockSchema = z.object({
  id: z.string().optional(),
  type: z.literal('kpi_row'),
  hidden: z.boolean().optional().default(false),
  items: z.array(z.object({
    label: z.string().min(1),
    sample_value: z.string().default('0'),
    delta: z.string().optional()
  })).default([])
});

export const DataTableBlockSchema = z.object({
  id: z.string().optional(),
  type: z.literal('data_table'),
  hidden: z.boolean().optional().default(false),
  title: z.string().min(1),
  columns: z.array(z.string().min(1)).default(['Código', 'Detalle', 'Estado', 'Acción']),
  sample_rows: z.array(z.array(z.string())).optional().default([]),
  toolbar_actions: z.array(z.string()).optional().default([])
});

export const ActionFormBlockSchema = z.object({
  id: z.string().optional(),
  type: z.literal('action_form'),
  hidden: z.boolean().optional().default(false),
  title: z.string().min(1),
  fields: z.array(z.string().min(1)).default(['Nombre / Referencia', 'Observación']),
  primary_action: z.string().default('Guardar registro')
});

export const StatusBoardBlockSchema = z.object({
  id: z.string().optional(),
  type: z.literal('status_board'),
  hidden: z.boolean().optional().default(false),
  title: z.string().min(1),
  columns: z.array(z.object({
    name: z.string().min(1),
    cards: z.array(z.string()).default([])
  })).default([])
});

export const UiComponentBlockSchema = z.discriminatedUnion('type', [
  KpiRowBlockSchema,
  DataTableBlockSchema,
  ActionFormBlockSchema,
  StatusBoardBlockSchema
]);

export const UiScreenSchema = z.object({
  screen_id: z.string().min(1),
  role: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional().default(''),
  components: z.array(UiComponentBlockSchema).default([])
});

export const WebBlueprintSchema = z.object({
  blueprint_id: z.string().min(1),
  workspace_id: z.string().min(1),
  source_canvas_ids: z.array(z.string()).default([]),
  user_stories: z.array(BlueprintStorySchema).default([]),
  theme_config: ThemeConfigSchema.default({
    preset: 'minimal_dark',
    primary_color: '#FFC000',
    radius: 'md',
    font_mode: 'sans'
  }),
  ui_screens: z.array(UiScreenSchema).default([]),
  updated_at: z.string().optional()
});

export function generateBlueprintId() {
  const num = Math.floor(100 + Math.random() * 900);
  return `BP-2026-${num}`;
}

export function createDefaultWebBlueprint(workspaceId = 'ws_general', sourceCanvasIds = []) {
  return {
    blueprint_id: generateBlueprintId(),
    workspace_id: workspaceId,
    source_canvas_ids: Array.isArray(sourceCanvasIds) ? sourceCanvasIds : [],
    user_stories: [],
    theme_config: {
      preset: 'minimal_dark',
      primary_color: '#FFC000',
      radius: 'md',
      font_mode: 'sans'
    },
    ui_screens: [],
    updated_at: new Date().toISOString()
  };
}

/**
 * Sanitiza bloques generados por LLM garantizando catálogo estricto y cero HTML/JS arbitrario.
 */
export function sanitizeUiScreensPayload(rawScreens = []) {
  if (!Array.isArray(rawScreens)) return [];
  const safeScreens = [];

  for (let i = 0; i < rawScreens.length; i++) {
    const scr = rawScreens[i];
    if (!scr || typeof scr !== 'object') continue;
    const rawComponents = Array.isArray(scr.components) ? scr.components : [];
    const safeComponents = [];

    for (let j = 0; j < rawComponents.length; j++) {
      const comp = rawComponents[j];
      if (!comp || !ALLOWED_UI_BLOCK_TYPES.includes(comp.type)) continue;
      const withId = {
        ...comp,
        id: comp.id || `blk_${i + 1}_${j + 1}_${comp.type}`
      };
      const parsed = UiComponentBlockSchema.safeParse(withId);
      if (parsed.success) {
        safeComponents.push(parsed.data);
      }
    }

    const parsedScreen = UiScreenSchema.safeParse({
      screen_id: scr.screen_id || `scr_${i + 1}`,
      role: String(scr.role || 'Operador').slice(0, 60),
      title: String(scr.title || 'Vista Operativa').slice(0, 80),
      subtitle: String(scr.subtitle || '').slice(0, 140),
      components: safeComponents
    });

    if (parsedScreen.success) {
      safeScreens.push(parsedScreen.data);
    }
  }

  return safeScreens;
}

export function resolveThemeCssVars(themeConfig = {}) {
  const preset = THEME_PRESETS[themeConfig?.preset] || THEME_PRESETS.minimal_dark;
  const primary = /^#[0-9A-Fa-f]{6}$/.test(themeConfig?.primary_color || '')
    ? themeConfig.primary_color
    : preset.primary_color;
  const radiusMap = { none: '0px', sm: '4px', md: '8px', lg: '14px' };
  const radiusPx = radiusMap[themeConfig?.radius] || radiusMap[preset.radius] || '8px';
  const fontMode = themeConfig?.font_mode || preset.font_mode || 'sans';
  const isLightPrimary = ['#FFC93C', '#FFC000', '#FACC15', '#EAB308'].includes(primary.toUpperCase());

  return {
    preset,
    '--bp-bg': preset.bg_page,
    '--bp-surface': preset.bg_surface,
    '--bp-subtle': preset.bg_subtle,
    '--bp-text': preset.text_primary,
    '--bp-muted': preset.text_secondary,
    '--bp-border': preset.border_color,
    '--bp-primary': primary,
    '--bp-on-primary': isLightPrimary ? '#09090B' : '#FFFFFF',
    '--bp-radius': radiusPx,
    '--bp-font': fontMode === 'mono' ? "'JetBrains Mono', ui-monospace, monospace" : "'Plus Jakarta Sans', system-ui, sans-serif"
  };
}
