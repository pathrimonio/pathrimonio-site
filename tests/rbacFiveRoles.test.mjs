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
import { getAiQuotaStatus, checkUserWorkspaceCaps, claimAnonymousSessionToAccount } from '../api/_lib/store.js';
import {
  createOrUpdateImplementationRequest,
  computeLiveDiffsAgainstBaseline,
  fetchPlatformSettings
} from '../src/services/platformService.js';
import { compileProcessToPortalBundle } from '../src/lib/formalia/compilers.js';
import { SDD_EXAMPLE_LOGISTICS_GRAPH } from '../src/lib/formalia/schema.js';

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
});
