import { z } from 'zod';
export declare const DashboardSectionSchema: z.ZodType<DashboardSection>;
export type DashboardSection = {
    sectionId: string;
    label: string;
    icon?: string;
    requiredCapabilities?: string[];
    requiredEntitlements?: string[];
    requiredFeatures?: string[];
    children?: DashboardSection[];
};
export declare const DashboardDeclarationSchema: z.ZodObject<{
    dashboardId: z.ZodString;
    label: z.ZodString;
    allowedSubjects: z.ZodArray<z.ZodString, "many">;
    allowedTenants: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    allowedPartners: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    requiredCapabilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    requiredEntitlements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    requiredFeatures: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sections: z.ZodArray<z.ZodType<DashboardSection, z.ZodTypeDef, DashboardSection>, "many">;
}, "strip", z.ZodTypeAny, {
    label: string;
    dashboardId: string;
    allowedSubjects: string[];
    sections: DashboardSection[];
    requiredCapabilities?: string[] | undefined;
    requiredEntitlements?: string[] | undefined;
    requiredFeatures?: string[] | undefined;
    allowedTenants?: string[] | undefined;
    allowedPartners?: string[] | undefined;
}, {
    label: string;
    dashboardId: string;
    allowedSubjects: string[];
    sections: DashboardSection[];
    requiredCapabilities?: string[] | undefined;
    requiredEntitlements?: string[] | undefined;
    requiredFeatures?: string[] | undefined;
    allowedTenants?: string[] | undefined;
    allowedPartners?: string[] | undefined;
}>;
export type DashboardDeclaration = z.infer<typeof DashboardDeclarationSchema>;
export declare const SubjectTypeSchema: z.ZodEnum<["super_admin", "partner_admin", "tenant_admin", "staff", "user"]>;
export type SubjectType = z.infer<typeof SubjectTypeSchema>;
export declare const DashboardContextSchema: z.ZodObject<{
    subjectId: z.ZodString;
    subjectType: z.ZodEnum<["super_admin", "partner_admin", "tenant_admin", "staff", "user"]>;
    tenantId: z.ZodString;
    partnerId: z.ZodOptional<z.ZodString>;
    roles: z.ZodArray<z.ZodString, "many">;
    evaluationTime: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    subjectId: string;
    subjectType: "super_admin" | "partner_admin" | "tenant_admin" | "staff" | "user";
    tenantId: string;
    roles: string[];
    evaluationTime: Date;
    partnerId?: string | undefined;
}, {
    subjectId: string;
    subjectType: "super_admin" | "partner_admin" | "tenant_admin" | "staff" | "user";
    tenantId: string;
    roles: string[];
    evaluationTime: Date;
    partnerId?: string | undefined;
}>;
export type DashboardContext = z.infer<typeof DashboardContextSchema>;
export declare const HiddenReasonSchema: z.ZodObject<{
    sectionId: z.ZodString;
    reason: z.ZodEnum<["missing_capability", "missing_entitlement", "missing_feature", "tenant_not_allowed", "partner_not_allowed", "subject_not_allowed"]>;
    details: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sectionId: string;
    reason: "missing_capability" | "missing_entitlement" | "missing_feature" | "tenant_not_allowed" | "partner_not_allowed" | "subject_not_allowed";
    details: string;
}, {
    sectionId: string;
    reason: "missing_capability" | "missing_entitlement" | "missing_feature" | "tenant_not_allowed" | "partner_not_allowed" | "subject_not_allowed";
    details: string;
}>;
export type HiddenReason = z.infer<typeof HiddenReasonSchema>;
export declare const ResolvedDashboardSchema: z.ZodObject<{
    dashboardId: z.ZodString;
    visibleSections: z.ZodArray<z.ZodType<DashboardSection, z.ZodTypeDef, DashboardSection>, "many">;
    hiddenSections: z.ZodArray<z.ZodString, "many">;
    reasons: z.ZodArray<z.ZodObject<{
        sectionId: z.ZodString;
        reason: z.ZodEnum<["missing_capability", "missing_entitlement", "missing_feature", "tenant_not_allowed", "partner_not_allowed", "subject_not_allowed"]>;
        details: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sectionId: string;
        reason: "missing_capability" | "missing_entitlement" | "missing_feature" | "tenant_not_allowed" | "partner_not_allowed" | "subject_not_allowed";
        details: string;
    }, {
        sectionId: string;
        reason: "missing_capability" | "missing_entitlement" | "missing_feature" | "tenant_not_allowed" | "partner_not_allowed" | "subject_not_allowed";
        details: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    dashboardId: string;
    visibleSections: DashboardSection[];
    hiddenSections: string[];
    reasons: {
        sectionId: string;
        reason: "missing_capability" | "missing_entitlement" | "missing_feature" | "tenant_not_allowed" | "partner_not_allowed" | "subject_not_allowed";
        details: string;
    }[];
}, {
    dashboardId: string;
    visibleSections: DashboardSection[];
    hiddenSections: string[];
    reasons: {
        sectionId: string;
        reason: "missing_capability" | "missing_entitlement" | "missing_feature" | "tenant_not_allowed" | "partner_not_allowed" | "subject_not_allowed";
        details: string;
    }[];
}>;
export type ResolvedDashboard = z.infer<typeof ResolvedDashboardSchema>;
export declare const DashboardSnapshotSchema: z.ZodObject<{
    snapshotId: z.ZodString;
    dashboardId: z.ZodString;
    subjectId: z.ZodString;
    tenantId: z.ZodString;
    resolvedSections: z.ZodArray<z.ZodType<DashboardSection, z.ZodTypeDef, DashboardSection>, "many">;
    hiddenSections: z.ZodArray<z.ZodString, "many">;
    reasons: z.ZodArray<z.ZodObject<{
        sectionId: z.ZodString;
        reason: z.ZodEnum<["missing_capability", "missing_entitlement", "missing_feature", "tenant_not_allowed", "partner_not_allowed", "subject_not_allowed"]>;
        details: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sectionId: string;
        reason: "missing_capability" | "missing_entitlement" | "missing_feature" | "tenant_not_allowed" | "partner_not_allowed" | "subject_not_allowed";
        details: string;
    }, {
        sectionId: string;
        reason: "missing_capability" | "missing_entitlement" | "missing_feature" | "tenant_not_allowed" | "partner_not_allowed" | "subject_not_allowed";
        details: string;
    }>, "many">;
    checksum: z.ZodString;
    evaluationTime: z.ZodDate;
    expiresAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    dashboardId: string;
    subjectId: string;
    tenantId: string;
    evaluationTime: Date;
    hiddenSections: string[];
    reasons: {
        sectionId: string;
        reason: "missing_capability" | "missing_entitlement" | "missing_feature" | "tenant_not_allowed" | "partner_not_allowed" | "subject_not_allowed";
        details: string;
    }[];
    snapshotId: string;
    resolvedSections: DashboardSection[];
    checksum: string;
    expiresAt?: Date | undefined;
}, {
    dashboardId: string;
    subjectId: string;
    tenantId: string;
    evaluationTime: Date;
    hiddenSections: string[];
    reasons: {
        sectionId: string;
        reason: "missing_capability" | "missing_entitlement" | "missing_feature" | "tenant_not_allowed" | "partner_not_allowed" | "subject_not_allowed";
        details: string;
    }[];
    snapshotId: string;
    resolvedSections: DashboardSection[];
    checksum: string;
    expiresAt?: Date | undefined;
}>;
export type DashboardSnapshot = z.infer<typeof DashboardSnapshotSchema>;
export declare const PermissionResultSchema: z.ZodObject<{
    subjectId: z.ZodString;
    capabilities: z.ZodArray<z.ZodString, "many">;
    deniedCapabilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    subjectId: string;
    capabilities: string[];
    deniedCapabilities?: string[] | undefined;
}, {
    subjectId: string;
    capabilities: string[];
    deniedCapabilities?: string[] | undefined;
}>;
export type PermissionResult = z.infer<typeof PermissionResultSchema>;
export declare const EntitlementSnapshotSchema: z.ZodObject<{
    tenantId: z.ZodString;
    activeEntitlements: z.ZodArray<z.ZodString, "many">;
    expiredEntitlements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    activeEntitlements: string[];
    expiredEntitlements?: string[] | undefined;
}, {
    tenantId: string;
    activeEntitlements: string[];
    expiredEntitlements?: string[] | undefined;
}>;
export type EntitlementSnapshot = z.infer<typeof EntitlementSnapshotSchema>;
export declare const FeatureSnapshotSchema: z.ZodObject<{
    enabledFeatures: z.ZodArray<z.ZodString, "many">;
    disabledFeatures: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    enabledFeatures: string[];
    disabledFeatures?: string[] | undefined;
}, {
    enabledFeatures: string[];
    disabledFeatures?: string[] | undefined;
}>;
export type FeatureSnapshot = z.infer<typeof FeatureSnapshotSchema>;
//# sourceMappingURL=schemas.d.ts.map