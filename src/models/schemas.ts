import { z } from 'zod';

export const DashboardSectionSchema: z.ZodType<DashboardSection> = z.lazy(() =>
  z.object({
    sectionId: z.string().min(1),
    label: z.string().min(1),
    icon: z.string().optional(),
    requiredCapabilities: z.array(z.string()).optional(),
    requiredEntitlements: z.array(z.string()).optional(),
    requiredFeatures: z.array(z.string()).optional(),
    children: z.array(DashboardSectionSchema).optional(),
  })
);

export type DashboardSection = {
  sectionId: string;
  label: string;
  icon?: string;
  requiredCapabilities?: string[];
  requiredEntitlements?: string[];
  requiredFeatures?: string[];
  children?: DashboardSection[];
};

export const DashboardDeclarationSchema = z.object({
  dashboardId: z.string().min(1),
  label: z.string().min(1),
  allowedSubjects: z.array(z.string()),
  allowedTenants: z.array(z.string()).optional(),
  allowedPartners: z.array(z.string()).optional(),
  requiredCapabilities: z.array(z.string()).optional(),
  requiredEntitlements: z.array(z.string()).optional(),
  requiredFeatures: z.array(z.string()).optional(),
  sections: z.array(DashboardSectionSchema),
});

export type DashboardDeclaration = z.infer<typeof DashboardDeclarationSchema>;

export const SubjectTypeSchema = z.enum([
  'super_admin',
  'partner_admin',
  'tenant_admin',
  'staff',
  'user',
]);

export type SubjectType = z.infer<typeof SubjectTypeSchema>;

export const DashboardContextSchema = z.object({
  subjectId: z.string().min(1),
  subjectType: SubjectTypeSchema,
  tenantId: z.string().min(1),
  partnerId: z.string().optional(),
  roles: z.array(z.string()),
  evaluationTime: z.date(),
});

export type DashboardContext = z.infer<typeof DashboardContextSchema>;

export const HiddenReasonSchema = z.object({
  sectionId: z.string(),
  reason: z.enum([
    'missing_capability',
    'missing_entitlement',
    'missing_feature',
    'tenant_not_allowed',
    'partner_not_allowed',
    'subject_not_allowed',
  ]),
  details: z.string(),
});

export type HiddenReason = z.infer<typeof HiddenReasonSchema>;

export const ResolvedDashboardSchema = z.object({
  dashboardId: z.string(),
  visibleSections: z.array(DashboardSectionSchema),
  hiddenSections: z.array(z.string()),
  reasons: z.array(HiddenReasonSchema),
});

export type ResolvedDashboard = z.infer<typeof ResolvedDashboardSchema>;

export const DashboardSnapshotSchema = z.object({
  snapshotId: z.string().min(1),
  dashboardId: z.string().min(1),
  subjectId: z.string().min(1),
  tenantId: z.string().min(1),
  resolvedSections: z.array(DashboardSectionSchema),
  hiddenSections: z.array(z.string()),
  reasons: z.array(HiddenReasonSchema),
  checksum: z.string().min(1),
  evaluationTime: z.date(),
  expiresAt: z.date().optional(),
});

export type DashboardSnapshot = z.infer<typeof DashboardSnapshotSchema>;

export const PermissionResultSchema = z.object({
  subjectId: z.string(),
  capabilities: z.array(z.string()),
  deniedCapabilities: z.array(z.string()).optional(),
});

export type PermissionResult = z.infer<typeof PermissionResultSchema>;

export const EntitlementSnapshotSchema = z.object({
  tenantId: z.string(),
  activeEntitlements: z.array(z.string()),
  expiredEntitlements: z.array(z.string()).optional(),
});

export type EntitlementSnapshot = z.infer<typeof EntitlementSnapshotSchema>;

export const FeatureSnapshotSchema = z.object({
  enabledFeatures: z.array(z.string()),
  disabledFeatures: z.array(z.string()).optional(),
});

export type FeatureSnapshot = z.infer<typeof FeatureSnapshotSchema>;
