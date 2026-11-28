import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAiDailyLimitForRole,
  ANON_SESSION_AI_LIMIT,
  AUTH_USER_DAILY_AI_LIMIT,
  PARTNER_DAILY_AI_LIMIT
} from '../src/lib/formalia/blueprintSchema.js';
import {
  DEFAULT_ROLE_DEFINITIONS,
  ROLE_QUOTA_POLICIES,
  normalizeRoleCode,
  isTabAllowedForRole,
  isActionAllowedForRole
} from '../src/auth/permissionsConfig.js';
import { calculateQuotePricing } from '../src/data/pricingRules.js';
import { getAiQuotaStatus, checkUserWorkspaceCaps, claimAnonymousSessionToAccount, saveSession } from '../api/_lib/store.js';
import {
  createOrUpdateImplementationRequest,
  computeLiveDiffsAgainstBaseline,
  fetchPlatformSettings
} from '../src/services/platformService.js';
import { compileProcessToPortalBundle } from '../src/lib/formalia/compilers.js';
import { SDD_EXAMPLE_LOGISTICS_GRAPH } from '../src/lib/formalia/schema.js';
import {
  PATHRIMONIO_SITE_PROJECT,
  PATHRIMONIO_SITE_ACTORS,
  PATHRIMONIO_SITE_STORIES,
  PATHRIMONIO_SITE_INTERFACES,
  PATHRIMONIO_SITE_DATA_MODELS,
  PATHRIMONIO_SITE_FILES
} from '../src/data/pathrimonioSiteData.js';
import {
  buildProjectSyncReports,
  syncProjectFromCodeCatalog,
  autoSyncExistingCatalogProjects
} from '../src/services/projectSyncService.js';

test('RBAC 5-Role Quota Policies & Daily Limits (5 / 15 / 45)', async () => {
  assert.equal(ROLE_QUOTA_POLICIES.guest.aiTurnsLimit, ANON_SESSION_AI_LIMIT);
  assert.equal(ROLE_QUOTA_POLICIES.user.aiTurnsLimit, AUTH_USER_DAILY_AI_LIMIT);
  assert.equal(ROLE_QUOTA_POLICIES.partner.aiTurnsLimit, PARTNER_DAILY_AI_LIMIT);
  assert.equal(PARTNER_DAILY_AI_LIMIT, 45);
  assert.equal(ROLE_QUOTA_POLICIES.user.maxWorkspaces, 5);
  assert.equal(ROLE_QUOTA_POLICIES.user.maxCanvases, 20);

  assert.equal(getAiDailyLimitForRole(null, false), 5);
  assert.equal(getAiDailyLimitForRole('Usuario Registrado', true), 15);
  assert.equal(getAiDailyLimitForRole('Socio / Cliente', true), 45);
  assert.equal(getAiDailyLimitForRole('Colaborador', true), 120);
  assert.equal(getAiDailyLimitForRole('Admin', true), 999);

  const partnerQuota = await getAiQuotaStatus({
    userEmail: `socio_${Date.now()}@pyme.pe`,
    userRole: 'Socio / Cliente',
    ip: '198.51.100.45'
  });
  assert.equal(partnerQuota.daily_limit, 45);
  assert.equal(partnerQuota.allowed, true);
});

test('RBAC Module & Governance Action Guards across all 5 Roles', () => {
  // Usuario Registrado: first 4 views + implementationStatus only
  assert.equal(isTabAllowedForRole('Usuario Registrado', 'actors', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isTabAllowedForRole('Usuario Registrado', 'stories', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isTabAllowedForRole('Usuario Registrado', 'interfaces', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isTabAllowedForRole('Usuario Registrado', 'formalia', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isTabAllowedForRole('Usuario Registrado', 'implementationStatus', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isTabAllowedForRole('Usuario Registrado', 'partnerPanel', DEFAULT_ROLE_DEFINITIONS), false);
  assert.equal(isTabAllowedForRole('Usuario Registrado', 'presalesReview', DEFAULT_ROLE_DEFINITIONS), false);
  assert.equal(isTabAllowedForRole('Usuario Registrado', 'architecture', DEFAULT_ROLE_DEFINITIONS), false);
  assert.equal(isTabAllowedForRole('Usuario Registrado', 'settings', DEFAULT_ROLE_DEFINITIONS), false);

  // Socio / Cliente: everything user has + partnerPanel
  assert.equal(isTabAllowedForRole('Socio / Cliente', 'partnerPanel', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isTabAllowedForRole('Socio / Cliente', 'presalesReview', DEFAULT_ROLE_DEFINITIONS), false);
  assert.equal(isTabAllowedForRole('Socio / Cliente', 'settings', DEFAULT_ROLE_DEFINITIONS), false);

  // Colaborador: presalesReview, architecture, files, but CANNOT touch settings/pricing/partners
  assert.equal(isTabAllowedForRole('Colaborador', 'presalesReview', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isTabAllowedForRole('Colaborador', 'architecture', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isTabAllowedForRole('Colaborador', 'files', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isTabAllowedForRole('Colaborador', 'settings', DEFAULT_ROLE_DEFINITIONS), false);
  assert.equal(isActionAllowedForRole('Colaborador', 'canReviewSubmissions', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isActionAllowedForRole('Colaborador', 'canEditPricingConfig', DEFAULT_ROLE_DEFINITIONS), false);
  assert.equal(isActionAllowedForRole('Colaborador', 'canApproveReferrals', DEFAULT_ROLE_DEFINITIONS), false);
  assert.equal(isActionAllowedForRole('Colaborador', 'canPublishImpact', DEFAULT_ROLE_DEFINITIONS), false);
  assert.equal(isActionAllowedForRole('Colaborador', 'canDeletePartners', DEFAULT_ROLE_DEFINITIONS), false);

  // Admin: full RBAC
  assert.equal(isTabAllowedForRole('Admin', 'settings', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isActionAllowedForRole('Admin', 'canEditPricingConfig', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isActionAllowedForRole('Admin', 'canApproveReferrals', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isActionAllowedForRole('Admin', 'canPublishImpact', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isActionAllowedForRole('Admin', 'canDeletePartners', DEFAULT_ROLE_DEFINITIONS), true);
});

test('Role Normalization & Dynamic Pricing Config Override', () => {
  assert.equal(normalizeRoleCode('guest'), 'guest');
  assert.equal(normalizeRoleCode('Usuario Registrado'), 'user');
  assert.equal(normalizeRoleCode('Socio / Cliente'), 'partner');
  assert.equal(normalizeRoleCode('Colaborador'), 'collaborator');
  assert.equal(normalizeRoleCode('Admin'), 'admin');

  const pricing = calculateQuotePricing(
    {
      admin_roles: [{ role: 'gerencia', count: 2 }],
      end_customers_tier: 'hasta_100_base',
      interfaces: ['web_operativa'],
      data_and_apis: [],
      commitment_plan: 'semestral_setup_gratis'
    },
    { admin_role_monthly_usd: 40, setup_fee_no_permanence_usd: 600 }
  );
  assert.equal(pricing.monthlyRolesBase, 80);
  assert.equal(pricing.setupFeeSavings, 600);
});

test('Web Implementation Package returns full Portal bundle & computes post-submission edit diffs', async () => {
  const impl = await createOrUpdateImplementationRequest({
    user: { id: 'u-test-1', email: 'pyme@test.pe', name: 'PYME Test', role: 'Usuario Registrado' },
    session: { session_id: 'FIA-TEST-8899', workspace_id: 'ws_test' },
    graph: SDD_EXAMPLE_LOGISTICS_GRAPH,
    editedStories: [
      { id: 'US-01', role: 'Despachador', title: 'Confirmar despacho con QR', priority: 'Alta' }
    ],
    webBlueprint: { blueprint_id: 'BP-TEST-01', theme_config: { preset: 'minimal_dark' }, ui_screens: [] }
  });

  assert.ok(impl.reqRecord && impl.request);
  assert.ok(impl.projectObj && impl.project);
  assert.ok(Array.isArray(impl.finalStories) && impl.finalStories.length === 1);
  assert.ok(Array.isArray(impl.bundle.actors) && impl.bundle.actors.length > 0);
  assert.ok(Array.isArray(impl.bundle.interfaces) && impl.bundle.interfaces.length > 0);

  const modifiedStories = impl.finalStories.map((st, idx) =>
    idx === 0 ? { ...st, action: 'Confirmar despacho con firma digital y foto' } : st
  );
  const diffs = computeLiveDiffsAgainstBaseline(
    impl.reqRecord,
    impl.bundle.actors,
    modifiedStories,
    impl.bundle.interfaces
  );
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].change_kind, 'updated');
  assert.equal(diffs[0].review_status, 'pending');
});

test('Project-scoped FORMALIA bundle IDs avoid cross-project PK collisions & settings preserve both casings', async () => {
  const b1 = compileProcessToPortalBundle(SDD_EXAMPLE_LOGISTICS_GRAPH, 'cli-transnorte-fia-4410');
  const b2 = compileProcessToPortalBundle(SDD_EXAMPLE_LOGISTICS_GRAPH, 'cli-ferreteria-fia-4410');
  assert.notEqual(b1.dataModels[0].id, b2.dataModels[0].id);
  assert.notEqual(b1.stories[0].id, b2.stories[0].id);
  assert.notEqual(b1.actors[0].id, b2.actors[0].id);

  const settings = await fetchPlatformSettings();
  assert.ok(settings.communityImpact && settings.community_impact);
  assert.ok(settings.pricingConfig && settings.pricing_config);
  assert.equal(settings.communityImpact.education.metric, settings.community_impact.education.metric);
});

test('Claiming anonymous FORMALIA session binds owner user AND project_id cleanly', async () => {
  const claimed = await claimAnonymousSessionToAccount({
    anonymousSessionId: 'FIA-ANON-CLAIM-01',
    userId: 'u-pyme-906',
    userEmail: 'pyme@test.pe',
    userName: 'Carlos Test',
    projectId: 'smat',
    workspaceName: 'SMAT',
    fallbackSession: {
      session_id: 'FIA-ANON-CLAIM-01',
      process_graph: SDD_EXAMPLE_LOGISTICS_GRAPH,
      messages: [{ role: 'user', content: 'Hola quiero mapear despachos' }],
      turns_count: 1
    }
  });
  assert.equal(claimed.ok, true);
  assert.equal(claimed.project_id, 'smat');
  assert.equal(claimed.workspace_id, 'ws_proj_smat');
  assert.equal(claimed.session.user_email, 'pyme@test.pe');
  assert.equal(claimed.session.project_id, 'smat');
  assert.equal(claimed.session.saved_to_account, true);

  // Simular cache frío en otra lambda donde memorySessions tenía 0 turnos pero fallback trae chat y diagramas reales
  await saveSession({ session_id: 'FIA-LAMBDA-STALE-01', turns_count: 0, messages: [{ role: 'assistant', content: 'Hola' }], process_graph: { actors: [], steps: [], completeness_score: 5 } });
  const richerClaim = await claimAnonymousSessionToAccount({
    anonymousSessionId: 'FIA-LAMBDA-STALE-01',
    userId: 'u-pyme-906',
    userEmail: 'pyme@test.pe',
    userName: 'Carlos Test',
    projectId: 'smat',
    workspaceName: 'SMAT',
    fallbackSession: {
      session_id: 'FIA-LAMBDA-STALE-01',
      process_graph: SDD_EXAMPLE_LOGISTICS_GRAPH,
      messages: [
        { role: 'assistant', content: 'Hola' },
        { role: 'user', content: 'Somos Bodega Central' },
        { role: 'assistant', content: 'Entendido, Bodega Central' }
      ],
      versions: [{ version_number: 1, version_label: 'v1' }],
      turns_count: 1,
      completeness_score: 35
    }
  });
  assert.equal(richerClaim.session.turns_count, 1);
  assert.equal(richerClaim.session.messages.length, 3);
  assert.ok((richerClaim.session.process_graph?.steps || []).length > 0);
});

test('Pathrimonio Site registers all 5 RBAC system roles as project Actors and Stories', () => {
  const expectedNames = [
    'Visitante (guest)',
    'Usuario Registrado (user)',
    'Socio / Cliente (partner)',
    'Colaborador (collaborator)',
    'Administrador (admin)'
  ];
  const actorNames = new Set(PATHRIMONIO_SITE_ACTORS.map((a) => a.name));
  const storyRoles = new Set(PATHRIMONIO_SITE_STORIES.map((s) => s.role));
  expectedNames.forEach((roleLabel) => {
    assert.ok(actorNames.has(roleLabel), `Falta actor ${roleLabel} en pathrimonio-site`);
    assert.ok(storyRoles.has(roleLabel), `Falta historia HU para ${roleLabel} en pathrimonio-site`);
  });
});

test('RBAC restricts projectsManager tab and canManageProjects action to internal roles', () => {
  assert.equal(isTabAllowedForRole('Admin', 'projectsManager', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isTabAllowedForRole('Colaborador', 'projectsManager', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isTabAllowedForRole('Auditora de Impacto', 'projectsManager', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isTabAllowedForRole('Usuario Registrado', 'projectsManager', DEFAULT_ROLE_DEFINITIONS), false);
  assert.equal(isTabAllowedForRole('Socio / Cliente', 'projectsManager', DEFAULT_ROLE_DEFINITIONS), false);

  assert.equal(isActionAllowedForRole('Admin', 'canManageProjects', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isActionAllowedForRole('Colaborador', 'canManageProjects', DEFAULT_ROLE_DEFINITIONS), true);
  assert.equal(isActionAllowedForRole('Auditora de Impacto', 'canManageProjects', DEFAULT_ROLE_DEFINITIONS), false);
  assert.equal(isActionAllowedForRole('Usuario Registrado', 'canManageProjects', DEFAULT_ROLE_DEFINITIONS), false);
  assert.equal(isActionAllowedForRole('Socio / Cliente', 'canManageProjects', DEFAULT_ROLE_DEFINITIONS), false);
});

test('ProjectSyncService detects outdated catalog specs, auto-upgrades DB projects, and preserves extra DB rows', async () => {
  const outdatedDbProject = {
    ...PATHRIMONIO_SITE_PROJECT,
    version: 'v1.0.0',
    status: 'En Producción'
  };
  const dbActors = PATHRIMONIO_SITE_ACTORS.filter((a) => a.id !== 'ACT-PS-06');
  const dbStories = PATHRIMONIO_SITE_STORIES.filter((s) => s.id !== 'US-PS-10');
  const extraDbInterface = {
    id: 'INT-PS-CUSTOM-DB',
    projectId: 'pathrimonio-site',
    title: 'Vista Extra en BD',
    module: 'Custom DB',
    route: '/custom-db'
  };
  const dbInterfaces = [...PATHRIMONIO_SITE_INTERFACES, extraDbInterface];

  const initialReports = buildProjectSyncReports({
    dbProjects: [outdatedDbProject],
    dbActors,
    dbStories,
    dbInterfaces,
    dbDataModels: PATHRIMONIO_SITE_DATA_MODELS,
    dbFiles: PATHRIMONIO_SITE_FILES,
    implementationRequests: []
  });

  const psBefore = initialReports.find((r) => r.id === 'pathrimonio-site');
  const coreHubBefore = initialReports.find((r) => r.id === 'core-hub');
  assert.ok(psBefore);
  assert.equal(psBefore.statusCode, 'outdated');
  assert.equal(psBefore.needsSync, true);
  assert.equal(psBefore.versionMismatch, true);
  assert.equal(psBefore.counts.actors.missing, 1);
  assert.equal(psBefore.counts.stories.missing, 1);
  assert.ok(coreHubBefore);
  assert.equal(coreHubBefore.statusCode, 'uninitialized');

  const autoRes = await autoSyncExistingCatalogProjects(
    {
      projects: [outdatedDbProject],
      actors: dbActors,
      stories: dbStories,
      interfaces: dbInterfaces,
      dataModels: PATHRIMONIO_SITE_DATA_MODELS,
      files: PATHRIMONIO_SITE_FILES,
      implementationRequests: []
    },
    { email: 'admin@pathrimonio.org', role: 'Admin' }
  );

  assert.deepEqual(autoRes.syncedIds, ['pathrimonio-site']);
  const upgradedProj = autoRes.nextState.projects.find((p) => p.id === 'pathrimonio-site');
  assert.equal(upgradedProj.version, PATHRIMONIO_SITE_PROJECT.version);
  assert.ok(autoRes.nextState.actors.some((a) => a.id === 'ACT-PS-06'));
  assert.ok(autoRes.nextState.stories.some((s) => s.id === 'US-PS-10'));
  assert.ok(
    autoRes.nextState.interfaces.some((i) => i.id === 'INT-PS-CUSTOM-DB'),
    'No debe eliminar registros adicionales creados en BD'
  );

  const afterReports = buildProjectSyncReports({
    dbProjects: autoRes.nextState.projects,
    dbActors: autoRes.nextState.actors,
    dbStories: autoRes.nextState.stories,
    dbInterfaces: autoRes.nextState.interfaces,
    dbDataModels: autoRes.nextState.dataModels,
    dbFiles: autoRes.nextState.files,
    implementationRequests: []
  });
  const psAfter = afterReports.find((r) => r.id === 'pathrimonio-site');
  const coreHubAfterAuto = afterReports.find((r) => r.id === 'core-hub');
  assert.equal(psAfter.statusCode, 'up_to_date');
  assert.equal(psAfter.needsSync, false);
  assert.equal(coreHubAfterAuto.statusCode, 'uninitialized');

  const manualCoreSync = await syncProjectFromCodeCatalog(
    'core-hub',
    autoRes.nextState,
    { email: 'admin@pathrimonio.org', role: 'Admin' }
  );
  assert.equal(manualCoreSync.projectId, 'core-hub');
  assert.ok(manualCoreSync.nextState.projects.some((p) => p.id === 'core-hub'));
});
