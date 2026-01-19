import { describe, it, expect } from 'vitest';
import {
  resolveDashboard,
  TenantIsolationError,
  SubjectAccessError,
} from './resolver.js';
import type {
  DashboardDeclaration,
  DashboardContext,
  PermissionResult,
  EntitlementSnapshot,
  FeatureSnapshot,
} from '../models/index.js';

const createBaseDeclaration = (): DashboardDeclaration => ({
  dashboardId: 'test-dashboard',
  label: 'Test Dashboard',
  allowedSubjects: ['tenant_admin', 'staff'],
  sections: [
    {
      sectionId: 'section-1',
      label: 'Section 1',
      requiredCapabilities: ['dashboard:view'],
    },
    {
      sectionId: 'section-2',
      label: 'Section 2',
      requiredEntitlements: ['premium'],
    },
    {
      sectionId: 'section-3',
      label: 'Section 3',
      requiredFeatures: ['beta-feature'],
    },
    {
      sectionId: 'section-4',
      label: 'Section 4',
    },
  ],
});

const createBaseContext = (): DashboardContext => ({
  subjectId: 'user-123',
  subjectType: 'tenant_admin',
  tenantId: 'tenant-abc',
  roles: ['admin'],
  evaluationTime: new Date('2025-01-19T12:00:00Z'),
});

const createBasePermissions = (): PermissionResult => ({
  subjectId: 'user-123',
  capabilities: ['dashboard:view', 'dashboard:edit'],
});

const createBaseEntitlements = (): EntitlementSnapshot => ({
  tenantId: 'tenant-abc',
  activeEntitlements: ['basic', 'premium'],
});

const createBaseFeatures = (): FeatureSnapshot => ({
  enabledFeatures: ['beta-feature', 'analytics'],
});

describe('resolveDashboard', () => {
  it('should show all sections when all requirements are met', () => {
    const result = resolveDashboard(
      createBaseDeclaration(),
      createBaseContext(),
      createBasePermissions(),
      createBaseEntitlements(),
      createBaseFeatures()
    );

    expect(result.dashboardId).toBe('test-dashboard');
    expect(result.visibleSections).toHaveLength(4);
    expect(result.hiddenSections).toHaveLength(0);
    expect(result.reasons).toHaveLength(0);
  });

  it('should hide section when capability is missing', () => {
    const permissions = createBasePermissions();
    permissions.capabilities = ['dashboard:edit'];

    const result = resolveDashboard(
      createBaseDeclaration(),
      createBaseContext(),
      permissions,
      createBaseEntitlements(),
      createBaseFeatures()
    );

    expect(result.visibleSections).toHaveLength(3);
    expect(result.hiddenSections).toContain('section-1');
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        sectionId: 'section-1',
        reason: 'missing_capability',
      })
    );
  });

  it('should hide section when entitlement is revoked', () => {
    const entitlements = createBaseEntitlements();
    entitlements.activeEntitlements = ['basic'];

    const result = resolveDashboard(
      createBaseDeclaration(),
      createBaseContext(),
      createBasePermissions(),
      entitlements,
      createBaseFeatures()
    );

    expect(result.visibleSections).toHaveLength(3);
    expect(result.hiddenSections).toContain('section-2');
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        sectionId: 'section-2',
        reason: 'missing_entitlement',
      })
    );
  });

  it('should hide section when feature flag is disabled', () => {
    const features = createBaseFeatures();
    features.enabledFeatures = ['analytics'];

    const result = resolveDashboard(
      createBaseDeclaration(),
      createBaseContext(),
      createBasePermissions(),
      createBaseEntitlements(),
      features
    );

    expect(result.visibleSections).toHaveLength(3);
    expect(result.hiddenSections).toContain('section-3');
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        sectionId: 'section-3',
        reason: 'missing_feature',
      })
    );
  });

  it('should throw TenantIsolationError on cross-tenant access', () => {
    const entitlements = createBaseEntitlements();
    entitlements.tenantId = 'different-tenant';

    expect(() =>
      resolveDashboard(
        createBaseDeclaration(),
        createBaseContext(),
        createBasePermissions(),
        entitlements,
        createBaseFeatures()
      )
    ).toThrow(TenantIsolationError);
  });

  it('should throw SubjectAccessError for disallowed subject types', () => {
    const context = createBaseContext();
    context.subjectType = 'user';

    expect(() =>
      resolveDashboard(
        createBaseDeclaration(),
        context,
        createBasePermissions(),
        createBaseEntitlements(),
        createBaseFeatures()
      )
    ).toThrow(SubjectAccessError);
  });

  it('should produce identical output for same inputs (determinism test)', () => {
    const declaration = createBaseDeclaration();
    const context = createBaseContext();
    const permissions = createBasePermissions();
    const entitlements = createBaseEntitlements();
    const features = createBaseFeatures();

    const results: string[] = [];
    for (let i = 0; i < 10; i++) {
      const result = resolveDashboard(
        declaration,
        context,
        permissions,
        entitlements,
        features
      );
      results.push(JSON.stringify(result));
    }

    const firstResult = results[0];
    for (const result of results) {
      expect(result).toBe(firstResult);
    }
  });

  it('should respect permissions precedence over entitlements', () => {
    const declaration: DashboardDeclaration = {
      dashboardId: 'precedence-test',
      label: 'Precedence Test',
      allowedSubjects: ['tenant_admin'],
      requiredCapabilities: ['admin:access'],
      sections: [
        {
          sectionId: 'sec-1',
          label: 'Section 1',
        },
      ],
    };

    const permissions: PermissionResult = {
      subjectId: 'user-123',
      capabilities: [],
    };

    const result = resolveDashboard(
      declaration,
      createBaseContext(),
      permissions,
      createBaseEntitlements(),
      createBaseFeatures()
    );

    expect(result.visibleSections).toHaveLength(0);
    expect(result.reasons[0].reason).toBe('missing_capability');
  });

  it('should handle nested sections correctly', () => {
    const declaration: DashboardDeclaration = {
      dashboardId: 'nested-test',
      label: 'Nested Test',
      allowedSubjects: ['tenant_admin'],
      sections: [
        {
          sectionId: 'parent',
          label: 'Parent',
          children: [
            {
              sectionId: 'child-1',
              label: 'Child 1',
              requiredCapabilities: ['child:view'],
            },
            {
              sectionId: 'child-2',
              label: 'Child 2',
            },
          ],
        },
      ],
    };

    const permissions: PermissionResult = {
      subjectId: 'user-123',
      capabilities: [],
    };

    const result = resolveDashboard(
      declaration,
      createBaseContext(),
      permissions,
      createBaseEntitlements(),
      createBaseFeatures()
    );

    expect(result.visibleSections).toHaveLength(1);
    expect(result.visibleSections[0].children).toHaveLength(1);
    expect(result.hiddenSections).toContain('child-1');
  });

  it('should provide explainable reasons for all hidden sections', () => {
    const permissions: PermissionResult = {
      subjectId: 'user-123',
      capabilities: [],
    };
    const entitlements: EntitlementSnapshot = {
      tenantId: 'tenant-abc',
      activeEntitlements: [],
    };
    const features: FeatureSnapshot = {
      enabledFeatures: [],
    };

    const result = resolveDashboard(
      createBaseDeclaration(),
      createBaseContext(),
      permissions,
      entitlements,
      features
    );

    expect(result.reasons.length).toBeGreaterThan(0);
    for (const reason of result.reasons) {
      expect(reason.sectionId).toBeDefined();
      expect(reason.reason).toBeDefined();
      expect(reason.details).toBeDefined();
    }
  });
});

describe('Suite Dashboard Request Test', () => {
  it('Suite can request dashboard declaration and receive deterministic, explainable, verifiable structure', () => {
    const declaration: DashboardDeclaration = {
      dashboardId: 'suite-dashboard',
      label: 'Suite Dashboard',
      allowedSubjects: ['tenant_admin', 'partner_admin', 'super_admin'],
      sections: [
        {
          sectionId: 'analytics',
          label: 'Analytics',
          requiredEntitlements: ['analytics'],
        },
        {
          sectionId: 'settings',
          label: 'Settings',
          requiredCapabilities: ['settings:manage'],
        },
        {
          sectionId: 'reports',
          label: 'Reports',
          requiredFeatures: ['reports-v2'],
        },
      ],
    };

    const context: DashboardContext = {
      subjectId: 'suite-user-1',
      subjectType: 'tenant_admin',
      tenantId: 'suite-tenant',
      roles: ['admin'],
      evaluationTime: new Date(),
    };

    const permissions: PermissionResult = {
      subjectId: 'suite-user-1',
      capabilities: ['settings:manage'],
    };

    const entitlements: EntitlementSnapshot = {
      tenantId: 'suite-tenant',
      activeEntitlements: ['analytics'],
    };

    const features: FeatureSnapshot = {
      enabledFeatures: ['reports-v2'],
    };

    const result1 = resolveDashboard(
      declaration,
      context,
      permissions,
      entitlements,
      features
    );
    const result2 = resolveDashboard(
      declaration,
      context,
      permissions,
      entitlements,
      features
    );

    expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));

    expect(result1.visibleSections).toHaveLength(3);
    expect(result1.hiddenSections).toHaveLength(0);

    const reducedPerms: PermissionResult = {
      subjectId: 'suite-user-1',
      capabilities: [],
    };

    const result3 = resolveDashboard(
      declaration,
      context,
      reducedPerms,
      entitlements,
      features
    );

    expect(result3.visibleSections).toHaveLength(2);
    expect(result3.hiddenSections).toContain('settings');
    expect(result3.reasons.find((r) => r.sectionId === 'settings')).toBeDefined();
    expect(result3.reasons.find((r) => r.sectionId === 'settings')?.details).toContain(
      'settings:manage'
    );
  });
});
