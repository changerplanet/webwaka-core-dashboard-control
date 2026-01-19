import { createHash, randomUUID } from 'crypto';
import type {
  DashboardDeclaration,
  DashboardContext,
  DashboardSnapshot,
  ResolvedDashboard,
} from '../models/index.js';

function computeChecksum(data: object): string {
  const json = JSON.stringify(data, Object.keys(data).sort());
  return createHash('sha256').update(json).digest('hex');
}

export function generateDashboardSnapshot(
  declaration: DashboardDeclaration,
  resolvedDashboard: ResolvedDashboard,
  context: DashboardContext,
  expiresInMs?: number
): DashboardSnapshot {
  const snapshotData = {
    dashboardId: declaration.dashboardId,
    subjectId: context.subjectId,
    tenantId: context.tenantId,
    resolvedSections: resolvedDashboard.visibleSections,
    hiddenSections: resolvedDashboard.hiddenSections,
    reasons: resolvedDashboard.reasons,
    evaluationTime: context.evaluationTime.toISOString(),
  };

  const checksum = computeChecksum(snapshotData);

  const snapshot: DashboardSnapshot = {
    snapshotId: randomUUID(),
    dashboardId: declaration.dashboardId,
    subjectId: context.subjectId,
    tenantId: context.tenantId,
    resolvedSections: resolvedDashboard.visibleSections,
    hiddenSections: resolvedDashboard.hiddenSections,
    reasons: resolvedDashboard.reasons,
    checksum,
    evaluationTime: context.evaluationTime,
  };

  if (expiresInMs) {
    snapshot.expiresAt = new Date(context.evaluationTime.getTime() + expiresInMs);
  }

  return snapshot;
}

export function verifyDashboardSnapshot(snapshot: DashboardSnapshot): boolean {
  const snapshotData = {
    dashboardId: snapshot.dashboardId,
    subjectId: snapshot.subjectId,
    tenantId: snapshot.tenantId,
    resolvedSections: snapshot.resolvedSections,
    hiddenSections: snapshot.hiddenSections,
    reasons: snapshot.reasons,
    evaluationTime: snapshot.evaluationTime.toISOString(),
  };

  const expectedChecksum = computeChecksum(snapshotData);
  return expectedChecksum === snapshot.checksum;
}

export function verifySnapshotIntegrity(
  snapshot: DashboardSnapshot,
  evaluationTime: Date
): boolean {
  const snapshotData = {
    dashboardId: snapshot.dashboardId,
    subjectId: snapshot.subjectId,
    tenantId: snapshot.tenantId,
    resolvedSections: snapshot.resolvedSections,
    hiddenSections: snapshot.hiddenSections,
    reasons: snapshot.reasons,
    evaluationTime: evaluationTime.toISOString(),
  };

  const expectedChecksum = computeChecksum(snapshotData);
  return expectedChecksum === snapshot.checksum;
}

export function evaluateFromSnapshot(
  snapshot: DashboardSnapshot,
  evaluationTime?: Date
): ResolvedDashboard {
  const now = evaluationTime || new Date();

  if (snapshot.expiresAt && now > snapshot.expiresAt) {
    return {
      dashboardId: snapshot.dashboardId,
      visibleSections: [],
      hiddenSections: snapshot.hiddenSections,
      reasons: [
        {
          sectionId: snapshot.dashboardId,
          reason: 'missing_feature',
          details: `Snapshot expired at ${snapshot.expiresAt.toISOString()}`,
        },
      ],
    };
  }

  return {
    dashboardId: snapshot.dashboardId,
    visibleSections: snapshot.resolvedSections,
    hiddenSections: snapshot.hiddenSections,
    reasons: snapshot.reasons,
  };
}
