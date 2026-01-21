"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const resolver_js_1 = require("./resolver.js");
const createBaseDeclaration = () => ({
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
const createBaseContext = () => ({
    subjectId: 'user-123',
    subjectType: 'tenant_admin',
    tenantId: 'tenant-abc',
    roles: ['admin'],
    evaluationTime: new Date('2025-01-19T12:00:00Z'),
});
const createBasePermissions = () => ({
    subjectId: 'user-123',
    capabilities: ['dashboard:view', 'dashboard:edit'],
});
const createBaseEntitlements = () => ({
    tenantId: 'tenant-abc',
    activeEntitlements: ['basic', 'premium'],
});
const createBaseFeatures = () => ({
    enabledFeatures: ['beta-feature', 'analytics'],
});
(0, vitest_1.describe)('resolveDashboard', () => {
    (0, vitest_1.it)('should show all sections when all requirements are met', () => {
        const result = (0, resolver_js_1.resolveDashboard)(createBaseDeclaration(), createBaseContext(), createBasePermissions(), createBaseEntitlements(), createBaseFeatures());
        (0, vitest_1.expect)(result.dashboardId).toBe('test-dashboard');
        (0, vitest_1.expect)(result.visibleSections).toHaveLength(4);
        (0, vitest_1.expect)(result.hiddenSections).toHaveLength(0);
        (0, vitest_1.expect)(result.reasons).toHaveLength(0);
    });
    (0, vitest_1.it)('should hide section when capability is missing', () => {
        const permissions = createBasePermissions();
        permissions.capabilities = ['dashboard:edit'];
        const result = (0, resolver_js_1.resolveDashboard)(createBaseDeclaration(), createBaseContext(), permissions, createBaseEntitlements(), createBaseFeatures());
        (0, vitest_1.expect)(result.visibleSections).toHaveLength(3);
        (0, vitest_1.expect)(result.hiddenSections).toContain('section-1');
        (0, vitest_1.expect)(result.reasons).toContainEqual(vitest_1.expect.objectContaining({
            sectionId: 'section-1',
            reason: 'missing_capability',
        }));
    });
    (0, vitest_1.it)('should hide section when entitlement is revoked', () => {
        const entitlements = createBaseEntitlements();
        entitlements.activeEntitlements = ['basic'];
        const result = (0, resolver_js_1.resolveDashboard)(createBaseDeclaration(), createBaseContext(), createBasePermissions(), entitlements, createBaseFeatures());
        (0, vitest_1.expect)(result.visibleSections).toHaveLength(3);
        (0, vitest_1.expect)(result.hiddenSections).toContain('section-2');
        (0, vitest_1.expect)(result.reasons).toContainEqual(vitest_1.expect.objectContaining({
            sectionId: 'section-2',
            reason: 'missing_entitlement',
        }));
    });
    (0, vitest_1.it)('should hide section when feature flag is disabled', () => {
        const features = createBaseFeatures();
        features.enabledFeatures = ['analytics'];
        const result = (0, resolver_js_1.resolveDashboard)(createBaseDeclaration(), createBaseContext(), createBasePermissions(), createBaseEntitlements(), features);
        (0, vitest_1.expect)(result.visibleSections).toHaveLength(3);
        (0, vitest_1.expect)(result.hiddenSections).toContain('section-3');
        (0, vitest_1.expect)(result.reasons).toContainEqual(vitest_1.expect.objectContaining({
            sectionId: 'section-3',
            reason: 'missing_feature',
        }));
    });
    (0, vitest_1.it)('should throw TenantIsolationError on cross-tenant access', () => {
        const entitlements = createBaseEntitlements();
        entitlements.tenantId = 'different-tenant';
        (0, vitest_1.expect)(() => (0, resolver_js_1.resolveDashboard)(createBaseDeclaration(), createBaseContext(), createBasePermissions(), entitlements, createBaseFeatures())).toThrow(resolver_js_1.TenantIsolationError);
    });
    (0, vitest_1.it)('should throw SubjectAccessError for disallowed subject types', () => {
        const context = createBaseContext();
        context.subjectType = 'user';
        (0, vitest_1.expect)(() => (0, resolver_js_1.resolveDashboard)(createBaseDeclaration(), context, createBasePermissions(), createBaseEntitlements(), createBaseFeatures())).toThrow(resolver_js_1.SubjectAccessError);
    });
    (0, vitest_1.it)('should produce identical output for same inputs (determinism test)', () => {
        const declaration = createBaseDeclaration();
        const context = createBaseContext();
        const permissions = createBasePermissions();
        const entitlements = createBaseEntitlements();
        const features = createBaseFeatures();
        const results = [];
        for (let i = 0; i < 10; i++) {
            const result = (0, resolver_js_1.resolveDashboard)(declaration, context, permissions, entitlements, features);
            results.push(JSON.stringify(result));
        }
        const firstResult = results[0];
        for (const result of results) {
            (0, vitest_1.expect)(result).toBe(firstResult);
        }
    });
    (0, vitest_1.it)('should respect permissions precedence over entitlements', () => {
        const declaration = {
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
        const permissions = {
            subjectId: 'user-123',
            capabilities: [],
        };
        const result = (0, resolver_js_1.resolveDashboard)(declaration, createBaseContext(), permissions, createBaseEntitlements(), createBaseFeatures());
        (0, vitest_1.expect)(result.visibleSections).toHaveLength(0);
        (0, vitest_1.expect)(result.reasons[0].reason).toBe('missing_capability');
    });
    (0, vitest_1.it)('should handle nested sections correctly', () => {
        const declaration = {
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
        const permissions = {
            subjectId: 'user-123',
            capabilities: [],
        };
        const result = (0, resolver_js_1.resolveDashboard)(declaration, createBaseContext(), permissions, createBaseEntitlements(), createBaseFeatures());
        (0, vitest_1.expect)(result.visibleSections).toHaveLength(1);
        (0, vitest_1.expect)(result.visibleSections[0].children).toHaveLength(1);
        (0, vitest_1.expect)(result.hiddenSections).toContain('child-1');
    });
    (0, vitest_1.it)('should provide explainable reasons for all hidden sections', () => {
        const permissions = {
            subjectId: 'user-123',
            capabilities: [],
        };
        const entitlements = {
            tenantId: 'tenant-abc',
            activeEntitlements: [],
        };
        const features = {
            enabledFeatures: [],
        };
        const result = (0, resolver_js_1.resolveDashboard)(createBaseDeclaration(), createBaseContext(), permissions, entitlements, features);
        (0, vitest_1.expect)(result.reasons.length).toBeGreaterThan(0);
        for (const reason of result.reasons) {
            (0, vitest_1.expect)(reason.sectionId).toBeDefined();
            (0, vitest_1.expect)(reason.reason).toBeDefined();
            (0, vitest_1.expect)(reason.details).toBeDefined();
        }
    });
});
(0, vitest_1.describe)('Suite Dashboard Request Test', () => {
    (0, vitest_1.it)('Suite can request dashboard declaration and receive deterministic, explainable, verifiable structure', () => {
        const declaration = {
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
        const context = {
            subjectId: 'suite-user-1',
            subjectType: 'tenant_admin',
            tenantId: 'suite-tenant',
            roles: ['admin'],
            evaluationTime: new Date(),
        };
        const permissions = {
            subjectId: 'suite-user-1',
            capabilities: ['settings:manage'],
        };
        const entitlements = {
            tenantId: 'suite-tenant',
            activeEntitlements: ['analytics'],
        };
        const features = {
            enabledFeatures: ['reports-v2'],
        };
        const result1 = (0, resolver_js_1.resolveDashboard)(declaration, context, permissions, entitlements, features);
        const result2 = (0, resolver_js_1.resolveDashboard)(declaration, context, permissions, entitlements, features);
        (0, vitest_1.expect)(JSON.stringify(result1)).toBe(JSON.stringify(result2));
        (0, vitest_1.expect)(result1.visibleSections).toHaveLength(3);
        (0, vitest_1.expect)(result1.hiddenSections).toHaveLength(0);
        const reducedPerms = {
            subjectId: 'suite-user-1',
            capabilities: [],
        };
        const result3 = (0, resolver_js_1.resolveDashboard)(declaration, context, reducedPerms, entitlements, features);
        (0, vitest_1.expect)(result3.visibleSections).toHaveLength(2);
        (0, vitest_1.expect)(result3.hiddenSections).toContain('settings');
        (0, vitest_1.expect)(result3.reasons.find((r) => r.sectionId === 'settings')).toBeDefined();
        (0, vitest_1.expect)(result3.reasons.find((r) => r.sectionId === 'settings')?.details).toContain('settings:manage');
    });
});
//# sourceMappingURL=resolver.test.js.map