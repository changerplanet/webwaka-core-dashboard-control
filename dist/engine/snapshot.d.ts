import type { DashboardDeclaration, DashboardContext, DashboardSnapshot, ResolvedDashboard } from '../models/index.js';
export declare function generateDashboardSnapshot(declaration: DashboardDeclaration, resolvedDashboard: ResolvedDashboard, context: DashboardContext, expiresInMs?: number): DashboardSnapshot;
export declare function verifyDashboardSnapshot(snapshot: DashboardSnapshot): boolean;
export declare function verifySnapshotIntegrity(snapshot: DashboardSnapshot, evaluationTime: Date): boolean;
export declare function evaluateFromSnapshot(snapshot: DashboardSnapshot, evaluationTime?: Date): ResolvedDashboard;
//# sourceMappingURL=snapshot.d.ts.map