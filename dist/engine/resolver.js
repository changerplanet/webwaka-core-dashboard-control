"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectAccessError = exports.PartnerIsolationError = exports.TenantIsolationError = void 0;
exports.resolveDashboard = resolveDashboard;
class TenantIsolationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TenantIsolationError';
    }
}
exports.TenantIsolationError = TenantIsolationError;
class PartnerIsolationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PartnerIsolationError';
    }
}
exports.PartnerIsolationError = PartnerIsolationError;
class SubjectAccessError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SubjectAccessError';
    }
}
exports.SubjectAccessError = SubjectAccessError;
function checkCapabilities(required, available) {
    if (!required || required.length === 0) {
        return { allowed: true, missing: [] };
    }
    const missing = required.filter((cap) => !available.includes(cap));
    return { allowed: missing.length === 0, missing };
}
function checkEntitlements(required, active) {
    if (!required || required.length === 0) {
        return { allowed: true, missing: [] };
    }
    const missing = required.filter((ent) => !active.includes(ent));
    return { allowed: missing.length === 0, missing };
}
function checkFeatures(required, enabled) {
    if (!required || required.length === 0) {
        return { allowed: true, missing: [] };
    }
    const missing = required.filter((feat) => !enabled.includes(feat));
    return { allowed: missing.length === 0, missing };
}
function resolveSections(sections, permissions, entitlements, features, reasons, hiddenSections) {
    const visibleSections = [];
    for (const section of sections) {
        const capCheck = checkCapabilities(section.requiredCapabilities, permissions.capabilities);
        if (!capCheck.allowed) {
            hiddenSections.push(section.sectionId);
            reasons.push({
                sectionId: section.sectionId,
                reason: 'missing_capability',
                details: `Missing capabilities: ${capCheck.missing.join(', ')}`,
            });
            continue;
        }
        const entCheck = checkEntitlements(section.requiredEntitlements, entitlements.activeEntitlements);
        if (!entCheck.allowed) {
            hiddenSections.push(section.sectionId);
            reasons.push({
                sectionId: section.sectionId,
                reason: 'missing_entitlement',
                details: `Missing entitlements: ${entCheck.missing.join(', ')}`,
            });
            continue;
        }
        const featCheck = checkFeatures(section.requiredFeatures, features.enabledFeatures);
        if (!featCheck.allowed) {
            hiddenSections.push(section.sectionId);
            reasons.push({
                sectionId: section.sectionId,
                reason: 'missing_feature',
                details: `Missing features: ${featCheck.missing.join(', ')}`,
            });
            continue;
        }
        const resolvedSection = {
            sectionId: section.sectionId,
            label: section.label,
            icon: section.icon,
        };
        if (section.children && section.children.length > 0) {
            const resolvedChildren = resolveSections(section.children, permissions, entitlements, features, reasons, hiddenSections);
            if (resolvedChildren.length > 0) {
                resolvedSection.children = resolvedChildren;
            }
        }
        visibleSections.push(resolvedSection);
    }
    return visibleSections;
}
function resolveDashboard(declaration, context, permissionResult, entitlementSnapshot, featureSnapshot) {
    if (!declaration.allowedSubjects.includes(context.subjectType)) {
        throw new SubjectAccessError(`Subject type '${context.subjectType}' is not allowed for dashboard '${declaration.dashboardId}'`);
    }
    if (declaration.allowedTenants &&
        declaration.allowedTenants.length > 0 &&
        !declaration.allowedTenants.includes(context.tenantId)) {
        throw new TenantIsolationError(`Tenant '${context.tenantId}' is not allowed for dashboard '${declaration.dashboardId}'`);
    }
    if (declaration.allowedPartners &&
        declaration.allowedPartners.length > 0 &&
        context.partnerId &&
        !declaration.allowedPartners.includes(context.partnerId)) {
        throw new PartnerIsolationError(`Partner '${context.partnerId}' is not allowed for dashboard '${declaration.dashboardId}'`);
    }
    if (entitlementSnapshot.tenantId !== context.tenantId) {
        throw new TenantIsolationError(`Entitlement snapshot tenant '${entitlementSnapshot.tenantId}' does not match context tenant '${context.tenantId}'`);
    }
    const capCheck = checkCapabilities(declaration.requiredCapabilities, permissionResult.capabilities);
    if (!capCheck.allowed) {
        return {
            dashboardId: declaration.dashboardId,
            visibleSections: [],
            hiddenSections: declaration.sections.map((s) => s.sectionId),
            reasons: [
                {
                    sectionId: declaration.dashboardId,
                    reason: 'missing_capability',
                    details: `Dashboard requires capabilities: ${capCheck.missing.join(', ')}`,
                },
            ],
        };
    }
    const entCheck = checkEntitlements(declaration.requiredEntitlements, entitlementSnapshot.activeEntitlements);
    if (!entCheck.allowed) {
        return {
            dashboardId: declaration.dashboardId,
            visibleSections: [],
            hiddenSections: declaration.sections.map((s) => s.sectionId),
            reasons: [
                {
                    sectionId: declaration.dashboardId,
                    reason: 'missing_entitlement',
                    details: `Dashboard requires entitlements: ${entCheck.missing.join(', ')}`,
                },
            ],
        };
    }
    const featCheck = checkFeatures(declaration.requiredFeatures, featureSnapshot.enabledFeatures);
    if (!featCheck.allowed) {
        return {
            dashboardId: declaration.dashboardId,
            visibleSections: [],
            hiddenSections: declaration.sections.map((s) => s.sectionId),
            reasons: [
                {
                    sectionId: declaration.dashboardId,
                    reason: 'missing_feature',
                    details: `Dashboard requires features: ${featCheck.missing.join(', ')}`,
                },
            ],
        };
    }
    const reasons = [];
    const hiddenSections = [];
    const visibleSections = resolveSections(declaration.sections, permissionResult, entitlementSnapshot, featureSnapshot, reasons, hiddenSections);
    return {
        dashboardId: declaration.dashboardId,
        visibleSections,
        hiddenSections,
        reasons,
    };
}
//# sourceMappingURL=resolver.js.map