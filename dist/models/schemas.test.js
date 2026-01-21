"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const schemas_js_1 = require("./schemas.js");
(0, vitest_1.describe)('DashboardSectionSchema', () => {
    (0, vitest_1.it)('should validate a basic section', () => {
        const section = {
            sectionId: 'test-section',
            label: 'Test Section',
        };
        const result = schemas_js_1.DashboardSectionSchema.safeParse(section);
        (0, vitest_1.expect)(result.success).toBe(true);
    });
    (0, vitest_1.it)('should validate section with all optional fields', () => {
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
        const result = schemas_js_1.DashboardSectionSchema.safeParse(section);
        (0, vitest_1.expect)(result.success).toBe(true);
    });
    (0, vitest_1.it)('should reject section with empty sectionId', () => {
        const section = {
            sectionId: '',
            label: 'Test',
        };
        const result = schemas_js_1.DashboardSectionSchema.safeParse(section);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
});
(0, vitest_1.describe)('DashboardDeclarationSchema', () => {
    (0, vitest_1.it)('should validate a complete declaration', () => {
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
        const result = schemas_js_1.DashboardDeclarationSchema.safeParse(declaration);
        (0, vitest_1.expect)(result.success).toBe(true);
    });
    (0, vitest_1.it)('should reject declaration without required fields', () => {
        const declaration = {
            dashboardId: 'test',
        };
        const result = schemas_js_1.DashboardDeclarationSchema.safeParse(declaration);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
});
(0, vitest_1.describe)('DashboardContextSchema', () => {
    (0, vitest_1.it)('should validate a valid context', () => {
        const context = {
            subjectId: 'user-123',
            subjectType: 'tenant_admin',
            tenantId: 'tenant-abc',
            partnerId: 'partner-xyz',
            roles: ['admin', 'viewer'],
            evaluationTime: new Date(),
        };
        const result = schemas_js_1.DashboardContextSchema.safeParse(context);
        (0, vitest_1.expect)(result.success).toBe(true);
    });
    (0, vitest_1.it)('should reject invalid subject types', () => {
        const context = {
            subjectId: 'user-123',
            subjectType: 'invalid_type',
            tenantId: 'tenant-abc',
            roles: [],
            evaluationTime: new Date(),
        };
        const result = schemas_js_1.DashboardContextSchema.safeParse(context);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)('should accept all valid subject types', () => {
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
            const result = schemas_js_1.DashboardContextSchema.safeParse(context);
            (0, vitest_1.expect)(result.success).toBe(true);
        }
    });
});
(0, vitest_1.describe)('PermissionResultSchema', () => {
    (0, vitest_1.it)('should validate permission result', () => {
        const permissions = {
            subjectId: 'user-123',
            capabilities: ['read', 'write'],
            deniedCapabilities: ['delete'],
        };
        const result = schemas_js_1.PermissionResultSchema.safeParse(permissions);
        (0, vitest_1.expect)(result.success).toBe(true);
    });
});
(0, vitest_1.describe)('EntitlementSnapshotSchema', () => {
    (0, vitest_1.it)('should validate entitlement snapshot', () => {
        const entitlements = {
            tenantId: 'tenant-123',
            activeEntitlements: ['premium', 'analytics'],
            expiredEntitlements: ['trial'],
        };
        const result = schemas_js_1.EntitlementSnapshotSchema.safeParse(entitlements);
        (0, vitest_1.expect)(result.success).toBe(true);
    });
});
(0, vitest_1.describe)('FeatureSnapshotSchema', () => {
    (0, vitest_1.it)('should validate feature snapshot', () => {
        const features = {
            enabledFeatures: ['feature-a', 'feature-b'],
            disabledFeatures: ['feature-c'],
        };
        const result = schemas_js_1.FeatureSnapshotSchema.safeParse(features);
        (0, vitest_1.expect)(result.success).toBe(true);
    });
});
(0, vitest_1.describe)('ResolvedDashboardSchema', () => {
    (0, vitest_1.it)('should validate resolved dashboard', () => {
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
        const result = schemas_js_1.ResolvedDashboardSchema.safeParse(resolved);
        (0, vitest_1.expect)(result.success).toBe(true);
    });
});
(0, vitest_1.describe)('DashboardSnapshotSchema', () => {
    (0, vitest_1.it)('should validate dashboard snapshot', () => {
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
        const result = schemas_js_1.DashboardSnapshotSchema.safeParse(snapshot);
        (0, vitest_1.expect)(result.success).toBe(true);
    });
    (0, vitest_1.it)('should require evaluationTime', () => {
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
        const result = schemas_js_1.DashboardSnapshotSchema.safeParse(snapshot);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
});
//# sourceMappingURL=schemas.test.js.map