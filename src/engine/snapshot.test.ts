import { describe, it, expect } from 'vitest';
import {
  generateDashboardSnapshot,
  verifyDashboardSnapshot,
  verifySnapshotIntegrity,
  evaluateFromSnapshot,
} from './snapshot.js';
import { resolveDashboard } from './resolver.js';
import type {
  DashboardDeclaration,
  DashboardContext,
  PermissionResult,
  EntitlementSnapshot,
  FeatureSnapshot,
  DashboardSnapshot,
} from '../models/index.js';

const createTestDeclaration = (): DashboardDeclaration => ({
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

const createTestContext = (): DashboardContext => ({
  subjectId: 'user-snap-1',
  subjectType: 'tenant_admin',
  tenantId: 'tenant-snap',
  roles: ['admin'],
  evaluationTime: new Date('2025-01-19T14:00:00Z'),
});

const createTestPermissions = (): PermissionResult => ({
  subjectId: 'user-snap-1',
  capabilities: ['dashboard:view'],
});

const createTestEntitlements = (): EntitlementSnapshot => ({
  tenantId: 'tenant-snap',
  activeEntitlements: ['premium'],
});

const createTestFeatures = (): FeatureSnapshot => ({
  enabledFeatures: [],
});

describe('generateDashboardSnapshot', () => {
  it('should generate a valid snapshot with checksum', () => {
    const declaration = createTestDeclaration();
    const context = createTestContext();
    const resolved = resolveDashboard(
      declaration,
      context,
      createTestPermissions(),
      createTestEntitlements(),
      createTestFeatures()
    );

    const snapshot = generateDashboardSnapshot(declaration, resolved, context);

    expect(snapshot.snapshotId).toBeDefined();
    expect(snapshot.dashboardId).toBe('snapshot-test');
    expect(snapshot.subjectId).toBe('user-snap-1');
    expect(snapshot.tenantId).toBe('tenant-snap');
    expect(snapshot.checksum).toBeDefined();
    expect(snapshot.checksum.length).toBe(64);
  });

  it('should include expiration when specified', () => {
    const declaration = createTestDeclaration();
    const context = createTestContext();
    const resolved = resolveDashboard(
      declaration,
      context,
      createTestPermissions(),
      createTestEntitlements(),
      createTestFeatures()
    );

    const snapshot = generateDashboardSnapshot(
      declaration,
      resolved,
      context,
      3600000
    );

    expect(snapshot.expiresAt).toBeDefined();
    expect(snapshot.expiresAt!.getTime()).toBe(
      context.evaluationTime.getTime() + 3600000
    );
  });
});

describe('verifyDashboardSnapshot', () => {
  it('should verify a valid snapshot', () => {
    const declaration = createTestDeclaration();
    const context = createTestContext();
    const resolved = resolveDashboard(
      declaration,
      context,
      createTestPermissions(),
      createTestEntitlements(),
      createTestFeatures()
    );

    const snapshot = generateDashboardSnapshot(declaration, resolved, context);

    const isValid = verifyDashboardSnapshot(snapshot);
    expect(isValid).toBe(true);
  });

  it('should verify snapshot generated hours ago', () => {
    const declaration = createTestDeclaration();
    const oldContext: DashboardContext = {
      ...createTestContext(),
      evaluationTime: new Date('2024-06-15T10:00:00Z'),
    };
    const resolved = resolveDashboard(
      declaration,
      oldContext,
      createTestPermissions(),
      { ...createTestEntitlements(), tenantId: oldContext.tenantId },
      createTestFeatures()
    );

    const snapshot = generateDashboardSnapshot(declaration, resolved, oldContext);

    const isValid = verifyDashboardSnapshot(snapshot);
    expect(isValid).toBe(true);
  });

  it('should detect tampering with snapshot data', () => {
    const declaration = createTestDeclaration();
    const context = createTestContext();
    const resolved = resolveDashboard(
      declaration,
      context,
      createTestPermissions(),
      createTestEntitlements(),
      createTestFeatures()
    );

    const snapshot = generateDashboardSnapshot(declaration, resolved, context);

    const tamperedSnapshot: DashboardSnapshot = {
      ...snapshot,
      tenantId: 'hacked-tenant',
    };

    const isValid = verifyDashboardSnapshot(tamperedSnapshot);
    expect(isValid).toBe(false);
  });

  it('should detect tampering with resolved sections', () => {
    const declaration = createTestDeclaration();
    const context = createTestContext();
    const resolved = resolveDashboard(
      declaration,
      context,
      createTestPermissions(),
      createTestEntitlements(),
      createTestFeatures()
    );

    const snapshot = generateDashboardSnapshot(declaration, resolved, context);

    const tamperedSnapshot: DashboardSnapshot = {
      ...snapshot,
      resolvedSections: [
        ...snapshot.resolvedSections,
        { sectionId: 'injected', label: 'Injected Section' },
      ],
    };

    const isValid = verifyDashboardSnapshot(tamperedSnapshot);
    expect(isValid).toBe(false);
  });

  it('should detect tampering with checksum', () => {
    const declaration = createTestDeclaration();
    const context = createTestContext();
    const resolved = resolveDashboard(
      declaration,
      context,
      createTestPermissions(),
      createTestEntitlements(),
      createTestFeatures()
    );

    const snapshot = generateDashboardSnapshot(declaration, resolved, context);

    const tamperedSnapshot: DashboardSnapshot = {
      ...snapshot,
      checksum: 'invalid_checksum_value',
    };

    const isValid = verifyDashboardSnapshot(tamperedSnapshot);
    expect(isValid).toBe(false);
  });
});

describe('verifySnapshotIntegrity (legacy)', () => {
  it('should verify with explicit evaluation time', () => {
    const declaration = createTestDeclaration();
    const context = createTestContext();
    const resolved = resolveDashboard(
      declaration,
      context,
      createTestPermissions(),
      createTestEntitlements(),
      createTestFeatures()
    );

    const snapshot = generateDashboardSnapshot(declaration, resolved, context);

    const isValid = verifySnapshotIntegrity(snapshot, context.evaluationTime);
    expect(isValid).toBe(true);
  });
});

describe('evaluateFromSnapshot', () => {
  it('should return resolved dashboard from valid snapshot', () => {
    const declaration = createTestDeclaration();
    const context = createTestContext();
    const resolved = resolveDashboard(
      declaration,
      context,
      createTestPermissions(),
      createTestEntitlements(),
      createTestFeatures()
    );

    const snapshot = generateDashboardSnapshot(declaration, resolved, context);

    const fromSnapshot = evaluateFromSnapshot(snapshot);

    expect(fromSnapshot.dashboardId).toBe(resolved.dashboardId);
    expect(fromSnapshot.visibleSections).toEqual(resolved.visibleSections);
    expect(fromSnapshot.hiddenSections).toEqual(resolved.hiddenSections);
  });

  it('should return empty sections for expired snapshot', () => {
    const declaration = createTestDeclaration();
    const context = createTestContext();
    const resolved = resolveDashboard(
      declaration,
      context,
      createTestPermissions(),
      createTestEntitlements(),
      createTestFeatures()
    );

    const snapshot = generateDashboardSnapshot(
      declaration,
      resolved,
      context,
      1000
    );

    const futureTime = new Date(context.evaluationTime.getTime() + 2000);
    const fromSnapshot = evaluateFromSnapshot(snapshot, futureTime);

    expect(fromSnapshot.visibleSections).toHaveLength(0);
  });

  it('snapshot evaluation matches live evaluation', () => {
    const declaration = createTestDeclaration();
    const context = createTestContext();
    const permissions = createTestPermissions();
    const entitlements = createTestEntitlements();
    const features = createTestFeatures();

    const liveResult = resolveDashboard(
      declaration,
      context,
      permissions,
      entitlements,
      features
    );

    const snapshot = generateDashboardSnapshot(declaration, liveResult, context);
    const snapshotResult = evaluateFromSnapshot(snapshot);

    expect(snapshotResult.dashboardId).toBe(liveResult.dashboardId);
    expect(snapshotResult.visibleSections.length).toBe(
      liveResult.visibleSections.length
    );
    expect(snapshotResult.hiddenSections).toEqual(liveResult.hiddenSections);
    expect(snapshotResult.reasons).toEqual(liveResult.reasons);
  });
});

describe('Offline Safety', () => {
  it('snapshots can be evaluated without network access', () => {
    const declaration = createTestDeclaration();
    const context = createTestContext();
    const resolved = resolveDashboard(
      declaration,
      context,
      createTestPermissions(),
      createTestEntitlements(),
      createTestFeatures()
    );

    const snapshot = generateDashboardSnapshot(declaration, resolved, context);

    const serialized = JSON.stringify(snapshot);
    const deserialized: DashboardSnapshot = JSON.parse(serialized);

    if (deserialized.expiresAt) {
      deserialized.expiresAt = new Date(deserialized.expiresAt);
    }

    const result = evaluateFromSnapshot(deserialized);

    expect(result.dashboardId).toBe('snapshot-test');
    expect(result.visibleSections.length).toBeGreaterThan(0);
  });
});
