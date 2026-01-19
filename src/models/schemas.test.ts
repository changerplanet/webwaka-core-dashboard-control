import { describe, it, expect } from 'vitest';
import {
  DashboardDeclarationSchema,
  DashboardContextSchema,
  DashboardSectionSchema,
  ResolvedDashboardSchema,
  DashboardSnapshotSchema,
  PermissionResultSchema,
  EntitlementSnapshotSchema,
  FeatureSnapshotSchema,
} from './schemas.js';

describe('DashboardSectionSchema', () => {
  it('should validate a basic section', () => {
    const section = {
      sectionId: 'test-section',
      label: 'Test Section',
    };

    const result = DashboardSectionSchema.safeParse(section);
    expect(result.success).toBe(true);
  });

  it('should validate section with all optional fields', () => {
    const section = {
      sectionId: 'full-section',
      label: 'Full Section',
      icon: 'settings',
      requiredCapabilities: ['cap1', 'cap2'],
      requiredEntitlements: ['ent1'],
      requiredFeatures: ['feat1'],
      children: [
        {
          sectionId: 'child-section',
          label: 'Child Section',
        },
      ],
    };

    const result = DashboardSectionSchema.safeParse(section);
    expect(result.success).toBe(true);
  });

  it('should reject section with empty sectionId', () => {
    const section = {
      sectionId: '',
      label: 'Test',
    };

    const result = DashboardSectionSchema.safeParse(section);
    expect(result.success).toBe(false);
  });
});

describe('DashboardDeclarationSchema', () => {
  it('should validate a complete declaration', () => {
    const declaration = {
      dashboardId: 'main-dashboard',
      label: 'Main Dashboard',
      allowedSubjects: ['tenant_admin', 'staff'],
      allowedTenants: ['tenant-1'],
      sections: [
        {
          sectionId: 'sec1',
          label: 'Section 1',
        },
      ],
    };

    const result = DashboardDeclarationSchema.safeParse(declaration);
    expect(result.success).toBe(true);
  });

  it('should reject declaration without required fields', () => {
    const declaration = {
      dashboardId: 'test',
    };

    const result = DashboardDeclarationSchema.safeParse(declaration);
    expect(result.success).toBe(false);
  });
});

describe('DashboardContextSchema', () => {
  it('should validate a valid context', () => {
    const context = {
      subjectId: 'user-123',
      subjectType: 'tenant_admin',
      tenantId: 'tenant-abc',
      partnerId: 'partner-xyz',
      roles: ['admin', 'viewer'],
      evaluationTime: new Date(),
    };

    const result = DashboardContextSchema.safeParse(context);
    expect(result.success).toBe(true);
  });

  it('should reject invalid subject types', () => {
    const context = {
      subjectId: 'user-123',
      subjectType: 'invalid_type',
      tenantId: 'tenant-abc',
      roles: [],
      evaluationTime: new Date(),
    };

    const result = DashboardContextSchema.safeParse(context);
    expect(result.success).toBe(false);
  });

  it('should accept all valid subject types', () => {
    const validTypes = [
      'super_admin',
      'partner_admin',
      'tenant_admin',
      'staff',
      'user',
    ];

    for (const subjectType of validTypes) {
      const context = {
        subjectId: 'user-123',
        subjectType,
        tenantId: 'tenant-abc',
        roles: [],
        evaluationTime: new Date(),
      };

      const result = DashboardContextSchema.safeParse(context);
      expect(result.success).toBe(true);
    }
  });
});

describe('PermissionResultSchema', () => {
  it('should validate permission result', () => {
    const permissions = {
      subjectId: 'user-123',
      capabilities: ['read', 'write'],
      deniedCapabilities: ['delete'],
    };

    const result = PermissionResultSchema.safeParse(permissions);
    expect(result.success).toBe(true);
  });
});

describe('EntitlementSnapshotSchema', () => {
  it('should validate entitlement snapshot', () => {
    const entitlements = {
      tenantId: 'tenant-123',
      activeEntitlements: ['premium', 'analytics'],
      expiredEntitlements: ['trial'],
    };

    const result = EntitlementSnapshotSchema.safeParse(entitlements);
    expect(result.success).toBe(true);
  });
});

describe('FeatureSnapshotSchema', () => {
  it('should validate feature snapshot', () => {
    const features = {
      enabledFeatures: ['feature-a', 'feature-b'],
      disabledFeatures: ['feature-c'],
    };

    const result = FeatureSnapshotSchema.safeParse(features);
    expect(result.success).toBe(true);
  });
});

describe('ResolvedDashboardSchema', () => {
  it('should validate resolved dashboard', () => {
    const resolved = {
      dashboardId: 'test-dash',
      visibleSections: [
        {
          sectionId: 'sec1',
          label: 'Section 1',
        },
      ],
      hiddenSections: ['sec2'],
      reasons: [
        {
          sectionId: 'sec2',
          reason: 'missing_capability',
          details: 'Missing: admin:access',
        },
      ],
    };

    const result = ResolvedDashboardSchema.safeParse(resolved);
    expect(result.success).toBe(true);
  });
});

describe('DashboardSnapshotSchema', () => {
  it('should validate dashboard snapshot', () => {
    const snapshot = {
      snapshotId: 'snap-123',
      dashboardId: 'dash-1',
      subjectId: 'user-1',
      tenantId: 'tenant-1',
      resolvedSections: [
        {
          sectionId: 'sec1',
          label: 'Section 1',
        },
      ],
      hiddenSections: [],
      reasons: [],
      checksum: 'abc123def456',
      evaluationTime: new Date(),
      expiresAt: new Date(),
    };

    const result = DashboardSnapshotSchema.safeParse(snapshot);
    expect(result.success).toBe(true);
  });

  it('should require evaluationTime', () => {
    const snapshot = {
      snapshotId: 'snap-123',
      dashboardId: 'dash-1',
      subjectId: 'user-1',
      tenantId: 'tenant-1',
      resolvedSections: [],
      hiddenSections: [],
      reasons: [],
      checksum: 'abc123def456',
    };

    const result = DashboardSnapshotSchema.safeParse(snapshot);
    expect(result.success).toBe(false);
  });
});
