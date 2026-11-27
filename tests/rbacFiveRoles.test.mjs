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
import { getAiQuotaStatus, checkUserWorkspaceCaps } from '../api/_lib/store.js';

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
