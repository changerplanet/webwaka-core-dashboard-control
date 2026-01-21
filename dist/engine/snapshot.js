"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDashboardSnapshot = generateDashboardSnapshot;
exports.verifyDashboardSnapshot = verifyDashboardSnapshot;
exports.verifySnapshotIntegrity = verifySnapshotIntegrity;
exports.evaluateFromSnapshot = evaluateFromSnapshot;
const crypto_1 = require("crypto");
function computeChecksum(data) {
    const json = JSON.stringify(data, Object.keys(data).sort());
    return (0, crypto_1.createHash)('sha256').update(json).digest('hex');
}
function generateDashboardSnapshot(declaration, resolvedDashboard, context, expiresInMs) {
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
    const snapshot = {
        snapshotId: (0, crypto_1.randomUUID)(),
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
function verifyDashboardSnapshot(snapshot) {
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
function verifySnapshotIntegrity(snapshot, evaluationTime) {
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
function evaluateFromSnapshot(snapshot, evaluationTime) {
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
//# sourceMappingURL=snapshot.js.map