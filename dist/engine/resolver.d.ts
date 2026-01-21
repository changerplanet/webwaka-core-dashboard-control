import type { DashboardDeclaration, DashboardContext, PermissionResult, EntitlementSnapshot, FeatureSnapshot, ResolvedDashboard } from '../models/index.js';
export declare class TenantIsolationError extends Error {
    constructor(message: string);
}
export declare class PartnerIsolationError extends Error {
    constructor(message: string);
}
export declare class SubjectAccessError extends Error {
    constructor(message: string);
}
export declare function resolveDashboard(declaration: DashboardDeclaration, context: DashboardContext, permissionResult: PermissionResult, entitlementSnapshot: EntitlementSnapshot, featureSnapshot: FeatureSnapshot): ResolvedDashboard;
//# sourceMappingURL=resolver.d.ts.map