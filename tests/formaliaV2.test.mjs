import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialProcessGraph } from '../src/lib/formalia/schema.js';
import {
  ANON_SESSION_AI_LIMIT,
  AUTH_USER_DAILY_AI_LIMIT,
  sanitizeUiScreensPayload,
  resolveThemeCssVars
} from '../src/lib/formalia/blueprintSchema.js';
import {
  generateBlueprintStories,
  generateBlueprintLayout
} from '../src/lib/formalia/blueprintGenerator.js';
import {
  saveSession,
  getSession,
  recordAiQuotaTurn,
  getAiQuotaStatus,
  claimAnonymousSessionToAccount,
  checkUserWorkspaceCaps,
  getWorkspaceBlueprint,
  saveWorkspaceBlueprint
} from '../api/_lib/store.js';

test('Strict AI Quota: anonymous visitor blocked after 5 session turns, authenticated gets 15/day UTC', async () => {
  const anonId = `FIA-ANON-${Date.now()}`;
  const anonIp = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
  await saveSession({
    session_id: anonId,
    process_graph: createInitialProcessGraph(anonId),
    messages: [],
    turns_count: 0
  });

  for (let i = 0; i < ANON_SESSION_AI_LIMIT; i++) {
    const q = await getAiQuotaStatus({ ip: anonIp, sessionId: anonId });
    assert.equal(q.allowed, true);
    await recordAiQuotaTurn({ ip: anonIp, sessionId: anonId, actionType: 'PROCESS_CHAT' });
  }

  const afterAnonLimit = await getAiQuotaStatus({ ip: anonIp, sessionId: anonId });
  assert.equal(afterAnonLimit.allowed, false);
  assert.equal(afterAnonLimit.remaining_turns, 0);
  assert.equal(afterAnonLimit.code, 'AI_QUOTA_EXCEEDED');

  // Claim Flow: transfer anonymous session cleanly to authenticated user -> 15 daily quota available
  const userEmail = `claim_${Date.now()}@empresa.pe`;
  const claimed = await claimAnonymousSessionToAccount({
    anonymousSessionId: anonId,
    userEmail,
    userName: 'Dueño PyME',
    workspaceName: 'Importadora Sol SAC'
  });
  assert.equal(claimed.ok, true);
  assert.equal(claimed.session.saved_to_account, true);
  assert.equal(claimed.workspace_name, 'Importadora Sol SAC');

  const retrieved = await getSession(anonId);
  assert.equal(retrieved.user_email, userEmail);
  assert.equal(retrieved.workspace_name, 'Importadora Sol SAC');

  const authQuota = await getAiQuotaStatus({ userEmail, ip: anonIp, sessionId: anonId });
  assert.equal(authQuota.allowed, true);
  assert.equal(authQuota.daily_limit, AUTH_USER_DAILY_AI_LIMIT);
  assert.equal(authQuota.remaining_turns, 15);

  for (let j = 0; j < 15; j++) {
    await recordAiQuotaTurn({
      userEmail,
      ip: anonIp,
      sessionId: anonId,
      actionType: j % 3 === 0 ? 'STORY_GEN' : j % 3 === 1 ? 'UI_LAYOUT' : 'PROCESS_CHAT'
    });
  }
  const authExhausted = await getAiQuotaStatus({ userEmail, ip: anonIp, sessionId: anonId });
  assert.equal(authExhausted.allowed, false);
  assert.equal(authExhausted.remaining_turns, 0);
  assert.equal(authExhausted.code, 'AI_QUOTA_EXCEEDED');
});

test('Anti-abuse caps limit free user to max 5 non-project workspaces', async () => {
  const email = `cap_user_${Date.now()}@test.pe`;
  for (let i = 1; i <= 5; i++) {
    const sid = `FIA-CAP-${i}-${Date.now()}`;
    await saveSession({
      session_id: sid,
      user_email: email,
      saved_to_account: true,
      workspace_id: `ws_neg_${i}`,
      workspace_name: `Negocio ${i}`,
      process_graph: createInitialProcessGraph(sid)
    });
  }

  const sixthCheck = await checkUserWorkspaceCaps({
    userEmail: email,
    userRole: 'Colaborador',
    workspaceId: 'ws_neg_6',
    creatingNewWorkspace: true
  });
  assert.equal(sixthCheck.allowed, false);
  assert.equal(sixthCheck.code, 'WORKSPACE_LIMIT_EXCEEDED');
});

test('UI Blueprint sanitizer blocks arbitrary HTML/script blocks and keeps only closed component catalog', async () => {
  const sanitized = sanitizeUiScreensPayload([
    {
      screen_id: 'scr_almacen',
      role: 'Almacén',
      title: 'Despacho y Stock',
      components: [
        { type: 'raw_html', html: '<script>alert("xss")</script>' },
        { type: 'iframe', src: 'https://evil.example' },
        { type: 'kpi_row', items: [{ label: 'Órdenes Hoy', sample_value: '24' }] },
        { type: 'action_form', title: 'Nueva Guía', fields: ['Cliente', 'Bultos'], primary_action: 'Emitir' }
      ]
    }
  ]);

  assert.equal(sanitized.length, 1);
  assert.equal(sanitized[0].components.length, 2);
  assert.deepEqual(
    sanitized[0].components.map((c) => c.type),
    ['kpi_row', 'action_form']
  );

  const vars = resolveThemeCssVars({ preset: 'corporate', primary_color: '#1D4ED8', radius: 'lg', font_mode: 'mono' });
  assert.equal(vars['--bp-primary'], '#1D4ED8');
  assert.equal(vars['--bp-radius'], '14px');
  assert.match(vars['--bp-font'], /JetBrains Mono/);
});

test('Blueprint generator produces stories and role screens deterministically and persists blueprint without AI turns', async () => {
  const graph = createInitialProcessGraph('FIA-BP-01');
  graph.actors = [
    { id: 'act_cliente', name: 'Cliente', type: 'EXTERNAL_CUSTOMER' },
    { id: 'role_almacen', name: 'Almacén', type: 'INTERNAL_ADMIN_ROLE' }
  ];
  graph.steps = [
    {
      id: 'stp_1',
      actor_id: 'act_cliente',
      label: 'Solicita pedido por WhatsApp',
      step_type: 'TRIGGER',
      channel: 'whatsapp',
      artifacts: ['Pedido'],
      is_manual_bottleneck: false
    },
    {
      id: 'stp_2',
      actor_id: 'role_almacen',
      label: 'Prepara despacho en cuaderno manual',
      step_type: 'TASK',
      channel: 'cuaderno_papel',
      artifacts: ['GuiaRemision'],
      is_manual_bottleneck: true,
      automation_opportunity: 'Guía digital con QR'
    }
  ];

  const canvas = { session_id: 'FIA-BP-01', canvas_title: 'Despacho', process_graph: graph };
  const storyRes = await generateBlueprintStories({
    workspaceName: 'Logística Andes',
    canvases: [canvas],
    useAi: false
  });
  assert.equal(storyRes.stories.length, 2);
  assert.equal(storyRes.stories[1].role, 'Almacén');

  const layoutRes = await generateBlueprintLayout({
    workspaceName: 'Logística Andes',
    stories: storyRes.stories,
    canvases: [canvas],
    targetRole: 'Almacén',
    refinementPrompt: 'Agrega filtro por fecha y exportar PDF',
    useAi: false
  });
  assert.ok(layoutRes.ui_screens.some((s) => s.role === 'Almacén'));
  const almacenScreen = layoutRes.ui_screens.find((s) => s.role === 'Almacén');
  const tableBlock = almacenScreen.components.find((c) => c.type === 'data_table');
  assert.ok(tableBlock.toolbar_actions.includes('Filtrar por fecha'));
  assert.ok(tableBlock.toolbar_actions.includes('Exportar PDF'));

  await saveWorkspaceBlueprint('ws_andes', {
    user_stories: storyRes.stories,
    ui_screens: layoutRes.ui_screens
  });
  const loaded = await getWorkspaceBlueprint('ws_andes');
  assert.equal(loaded.workspace_id, 'ws_andes');
  assert.equal(loaded.user_stories.length, 2);
});
