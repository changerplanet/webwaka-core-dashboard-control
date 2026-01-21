"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const snapshot_js_1 = require("./snapshot.js");
const resolver_js_1 = require("./resolver.js");
const createTestDeclaration = () => ({
    dashboardId: 'snapshot-test',
    label: 'Snapshot Test Dashboard',
    allowedSubjects: ['tenant_admin'],
    sections: [
        {
            sectionId: 'section-a',
            label: 'Section A',
            requiredEntitlements: ['premium'],
        },
        {
            sectionId: 'section-b',
            label: 'Section B',
        },
    ],
});
const createTestContext = () => ({
    subjectId: 'user-snap-1',
    subjectType: 'tenant_admin',
    tenantId: 'tenant-snap',
    roles: ['admin'],
    evaluationTime: new Date('2025-01-19T14:00:00Z'),
});
const createTestPermissions = () => ({
    subjectId: 'user-snap-1',
    capabilities: ['dashboard:view'],
});
const createTestEntitlements = () => ({
    tenantId: 'tenant-snap',
    activeEntitlements: ['premium'],
});
const createTestFeatures = () => ({
    enabledFeatures: [],
});
(0, vitest_1.describe)('generateDashboardSnapshot', () => {
    (0, vitest_1.it)('should generate a valid snapshot with checksum', () => {
        const declaration = createTestDeclaration();
        const context = createTestContext();
        const resolved = (0, resolver_js_1.resolveDashboard)(declaration, context, createTestPermissions(), createTestEntitlements(), createTestFeatures());
        const snapshot = (0, snapshot_js_1.generateDashboardSnapshot)(declaration, resolved, context);
        (0, vitest_1.expect)(snapshot.snapshotId).toBeDefined();
        (0, vitest_1.expect)(snapshot.dashboardId).toBe('snapshot-test');
        (0, vitest_1.expect)(snapshot.subjectId).toBe('user-snap-1');
        (0, vitest_1.expect)(snapshot.tenantId).toBe('tenant-snap');
        (0, vitest_1.expect)(snapshot.checksum).toBeDefined();
        (0, vitest_1.expect)(snapshot.checksum.length).toBe(64);
    });
    (0, vitest_1.it)('should include expiration when specified', () => {
        const declaration = createTestDeclaration();
        const context = createTestContext();
        const resolved = (0, resolver_js_1.resolveDashboard)(declaration, context, createTestPermissions(), createTestEntitlements(), createTestFeatures());
        const snapshot = (0, snapshot_js_1.generateDashboardSnapshot)(declaration, resolved, context, 3600000);
        (0, vitest_1.expect)(snapshot.expiresAt).toBeDefined();
        (0, vitest_1.expect)(snapshot.expiresAt.getTime()).toBe(context.evaluationTime.getTime() + 3600000);
    });
});
(0, vitest_1.describe)('verifyDashboardSnapshot', () => {
    (0, vitest_1.it)('should verify a valid snapshot', () => {
        const declaration = createTestDeclaration();
        const context = createTestContext();
        const resolved = (0, resolver_js_1.resolveDashboard)(declaration, context, createTestPermissions(), createTestEntitlements(), createTestFeatures());
        const snapshot = (0, snapshot_js_1.generateDashboardSnapshot)(declaration, resolved, context);
        const isValid = (0, snapshot_js_1.verifyDashboardSnapshot)(snapshot);
        (0, vitest_1.expect)(isValid).toBe(true);
    });
    (0, vitest_1.it)('should verify snapshot generated hours ago', () => {
        const declaration = createTestDeclaration();
        const oldContext = {
            ...createTestContext(),
            evaluationTime: new Date('2024-06-15T10:00:00Z'),
        };
        const resolved = (0, resolver_js_1.resolveDashboard)(declaration, oldContext, createTestPermissions(), { ...createTestEntitlements(), tenantId: oldContext.tenantId }, createTestFeatures());
        const snapshot = (0, snapshot_js_1.generateDashboardSnapshot)(declaration, resolved, oldContext);
        const isValid = (0, snapshot_js_1.verifyDashboardSnapshot)(snapshot);
        (0, vitest_1.expect)(isValid).toBe(true);
    });
    (0, vitest_1.it)('should detect tampering with snapshot data', () => {
        const declaration = createTestDeclaration();
        const context = createTestContext();
        const resolved = (0, resolver_js_1.resolveDashboard)(declaration, context, createTestPermissions(), createTestEntitlements(), createTestFeatures());
        const snapshot = (0, snapshot_js_1.generateDashboardSnapshot)(declaration, resolved, context);
        const tamperedSnapshot = {
            ...snapshot,
            tenantId: 'hacked-tenant',
        };
        const isValid = (0, snapshot_js_1.verifyDashboardSnapshot)(tamperedSnapshot);
        (0, vitest_1.expect)(isValid).toBe(false);
    });
    (0, vitest_1.it)('should detect tampering with resolved sections', () => {
        const declaration = createTestDeclaration();
        const context = createTestContext();
        const resolved = (0, resolver_js_1.resolveDashboard)(declaration, context, createTestPermissions(), createTestEntitlements(), createTestFeatures());
        const snapshot = (0, snapshot_js_1.generateDashboardSnapshot)(declaration, resolved, context);
        const tamperedSnapshot = {
            ...snapshot,
            resolvedSections: [
                ...snapshot.resolvedSections,
                { sectionId: 'injected', label: 'Injected Section' },
            ],
        };
        const isValid = (0, snapshot_js_1.verifyDashboardSnapshot)(tamperedSnapshot);
        (0, vitest_1.expect)(isValid).toBe(false);
    });
    (0, vitest_1.it)('should detect tampering with checksum', () => {
        const declaration = createTestDeclaration();
        const context = createTestContext();
        const resolved = (0, resolver_js_1.resolveDashboard)(declaration, context, createTestPermissions(), createTestEntitlements(), createTestFeatures());
        const snapshot = (0, snapshot_js_1.generateDashboardSnapshot)(declaration, resolved, context);
        const tamperedSnapshot = {
            ...snapshot,
            checksum: 'invalid_checksum_value',
        };
        const isValid = (0, snapshot_js_1.verifyDashboardSnapshot)(tamperedSnapshot);
        (0, vitest_1.expect)(isValid).toBe(false);
    });
});
(0, vitest_1.describe)('verifySnapshotIntegrity (legacy)', () => {
    (0, vitest_1.it)('should verify with explicit evaluation time', () => {
        const declaration = createTestDeclaration();
        const context = createTestContext();
        const resolved = (0, resolver_js_1.resolveDashboard)(declaration, context, createTestPermissions(), createTestEntitlements(), createTestFeatures());
        const snapshot = (0, snapshot_js_1.generateDashboardSnapshot)(declaration, resolved, context);
        const isValid = (0, snapshot_js_1.verifySnapshotIntegrity)(snapshot, context.evaluationTime);
        (0, vitest_1.expect)(isValid).toBe(true);
    });
});
(0, vitest_1.describe)('evaluateFromSnapshot', () => {
    (0, vitest_1.it)('should return resolved dashboard from valid snapshot', () => {
        const declaration = createTestDeclaration();
        const context = createTestContext();
        const resolved = (0, resolver_js_1.resolveDashboard)(declaration, context, createTestPermissions(), createTestEntitlements(), createTestFeatures());
        const snapshot = (0, snapshot_js_1.generateDashboardSnapshot)(declaration, resolved, context);
        const fromSnapshot = (0, snapshot_js_1.evaluateFromSnapshot)(snapshot);
        (0, vitest_1.expect)(fromSnapshot.dashboardId).toBe(resolved.dashboardId);
        (0, vitest_1.expect)(fromSnapshot.visibleSections).toEqual(resolved.visibleSections);
        (0, vitest_1.expect)(fromSnapshot.hiddenSections).toEqual(resolved.hiddenSections);
    });
    (0, vitest_1.it)('should return empty sections for expired snapshot', () => {
        const declaration = createTestDeclaration();
        const context = createTestContext();
        const resolved = (0, resolver_js_1.resolveDashboard)(declaration, context, createTestPermissions(), createTestEntitlements(), createTestFeatures());
        const snapshot = (0, snapshot_js_1.generateDashboardSnapshot)(declaration, resolved, context, 1000);
        const futureTime = new Date(context.evaluationTime.getTime() + 2000);
        const fromSnapshot = (0, snapshot_js_1.evaluateFromSnapshot)(snapshot, futureTime);
        (0, vitest_1.expect)(fromSnapshot.visibleSections).toHaveLength(0);
    });
    (0, vitest_1.it)('snapshot evaluation matches live evaluation', () => {
        const declaration = createTestDeclaration();
        const context = createTestContext();
        const permissions = createTestPermissions();
        const entitlements = createTestEntitlements();
        const features = createTestFeatures();
        const liveResult = (0, resolver_js_1.resolveDashboard)(declaration, context, permissions, entitlements, features);
        const snapshot = (0, snapshot_js_1.generateDashboardSnapshot)(declaration, liveResult, context);
        const snapshotResult = (0, snapshot_js_1.evaluateFromSnapshot)(snapshot);
        (0, vitest_1.expect)(snapshotResult.dashboardId).toBe(liveResult.dashboardId);
        (0, vitest_1.expect)(snapshotResult.visibleSections.length).toBe(liveResult.visibleSections.length);
        (0, vitest_1.expect)(snapshotResult.hiddenSections).toEqual(liveResult.hiddenSections);
        (0, vitest_1.expect)(snapshotResult.reasons).toEqual(liveResult.reasons);
    });
});
(0, vitest_1.describe)('Offline Safety', () => {
    (0, vitest_1.it)('snapshots can be evaluated without network access', () => {
        const declaration = createTestDeclaration();
        const context = createTestContext();
        const resolved = (0, resolver_js_1.resolveDashboard)(declaration, context, createTestPermissions(), createTestEntitlements(), createTestFeatures());
        const snapshot = (0, snapshot_js_1.generateDashboardSnapshot)(declaration, resolved, context);
        const serialized = JSON.stringify(snapshot);
        const deserialized = JSON.parse(serialized);
        if (deserialized.expiresAt) {
            deserialized.expiresAt = new Date(deserialized.expiresAt);
        }
        const result = (0, snapshot_js_1.evaluateFromSnapshot)(deserialized);
        (0, vitest_1.expect)(result.dashboardId).toBe('snapshot-test');
        (0, vitest_1.expect)(result.visibleSections.length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=snapshot.test.js.map