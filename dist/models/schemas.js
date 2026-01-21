"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureSnapshotSchema = exports.EntitlementSnapshotSchema = exports.PermissionResultSchema = exports.DashboardSnapshotSchema = exports.ResolvedDashboardSchema = exports.HiddenReasonSchema = exports.DashboardContextSchema = exports.SubjectTypeSchema = exports.DashboardDeclarationSchema = exports.DashboardSectionSchema = void 0;
const zod_1 = require("zod");
exports.DashboardSectionSchema = zod_1.z.lazy(() => zod_1.z.object({
    sectionId: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
    icon: zod_1.z.string().optional(),
    requiredCapabilities: zod_1.z.array(zod_1.z.string()).optional(),
    requiredEntitlements: zod_1.z.array(zod_1.z.string()).optional(),
    requiredFeatures: zod_1.z.array(zod_1.z.string()).optional(),
    children: zod_1.z.array(exports.DashboardSectionSchema).optional(),
}));
exports.DashboardDeclarationSchema = zod_1.z.object({
    dashboardId: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
    allowedSubjects: zod_1.z.array(zod_1.z.string()),
    allowedTenants: zod_1.z.array(zod_1.z.string()).optional(),
    allowedPartners: zod_1.z.array(zod_1.z.string()).optional(),
    requiredCapabilities: zod_1.z.array(zod_1.z.string()).optional(),
    requiredEntitlements: zod_1.z.array(zod_1.z.string()).optional(),
    requiredFeatures: zod_1.z.array(zod_1.z.string()).optional(),
    sections: zod_1.z.array(exports.DashboardSectionSchema),
});
exports.SubjectTypeSchema = zod_1.z.enum([
    'super_admin',
    'partner_admin',
    'tenant_admin',
    'staff',
    'user',
]);
exports.DashboardContextSchema = zod_1.z.object({
    subjectId: zod_1.z.string().min(1),
    subjectType: exports.SubjectTypeSchema,
    tenantId: zod_1.z.string().min(1),
    partnerId: zod_1.z.string().optional(),
    roles: zod_1.z.array(zod_1.z.string()),
    evaluationTime: zod_1.z.date(),
});
exports.HiddenReasonSchema = zod_1.z.object({
    sectionId: zod_1.z.string(),
    reason: zod_1.z.enum([
        'missing_capability',
        'missing_entitlement',
        'missing_feature',
        'tenant_not_allowed',
        'partner_not_allowed',
        'subject_not_allowed',
    ]),
    details: zod_1.z.string(),
});
exports.ResolvedDashboardSchema = zod_1.z.object({
    dashboardId: zod_1.z.string(),
    visibleSections: zod_1.z.array(exports.DashboardSectionSchema),
    hiddenSections: zod_1.z.array(zod_1.z.string()),
    reasons: zod_1.z.array(exports.HiddenReasonSchema),
});
exports.DashboardSnapshotSchema = zod_1.z.object({
    snapshotId: zod_1.z.string().min(1),
    dashboardId: zod_1.z.string().min(1),
    subjectId: zod_1.z.string().min(1),
    tenantId: zod_1.z.string().min(1),
    resolvedSections: zod_1.z.array(exports.DashboardSectionSchema),
    hiddenSections: zod_1.z.array(zod_1.z.string()),
    reasons: zod_1.z.array(exports.HiddenReasonSchema),
    checksum: zod_1.z.string().min(1),
    evaluationTime: zod_1.z.date(),
    expiresAt: zod_1.z.date().optional(),
});
exports.PermissionResultSchema = zod_1.z.object({
    subjectId: zod_1.z.string(),
    capabilities: zod_1.z.array(zod_1.z.string()),
    deniedCapabilities: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.EntitlementSnapshotSchema = zod_1.z.object({
    tenantId: zod_1.z.string(),
    activeEntitlements: zod_1.z.array(zod_1.z.string()),
    expiredEntitlements: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.FeatureSnapshotSchema = zod_1.z.object({
    enabledFeatures: zod_1.z.array(zod_1.z.string()),
    disabledFeatures: zod_1.z.array(zod_1.z.string()).optional(),
});
//# sourceMappingURL=schemas.js.map