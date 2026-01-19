# Module Contract: WebWaka Core Dashboard Control

## Module Identity

- **Module ID:** `webwaka-core-dashboard-control`
- **Class:** `core`
- **Version:** `0.1.0`
- **Phase:** 4A (Dashboard Control Model)

## Purpose

Provides dashboard lifecycle management and privilege-driven UI control for the WebWaka platform. This module produces deterministic, explainable dashboard definitions that:

- Automatically show/hide menus based on permissions, entitlements, and feature flags
- Can be evaluated online or offline via snapshots
- Can be verified for integrity via SHA-256 checksums

## Capabilities Provided

| Capability | Description |
|------------|-------------|
| `dashboard:resolve` | Resolve dashboard declarations into visible/hidden sections |
| `dashboard:snapshot.generate` | Generate verifiable dashboard snapshots |
| `dashboard:snapshot.verify` | Verify snapshot integrity and detect tampering |

## Domain Models (Zod-Validated)

### DashboardDeclaration
Defines a dashboard structure with sections and access requirements.

### DashboardSection
Individual menu section with optional capability, entitlement, and feature requirements.

### DashboardContext
Runtime context including subject, tenant, partner, and evaluation time.

### ResolvedDashboard
Result of dashboard resolution with visible sections, hidden sections, and reasons.

### DashboardSnapshot
Immutable, verifiable snapshot of a resolved dashboard state.

## API Surface

### Core Functions

```typescript
resolveDashboard(
  declaration: DashboardDeclaration,
  context: DashboardContext,
  permissionResult: PermissionResult,
  entitlementSnapshot: EntitlementSnapshot,
  featureSnapshot: FeatureSnapshot
): ResolvedDashboard

generateDashboardSnapshot(
  declaration: DashboardDeclaration,
  resolvedDashboard: ResolvedDashboard,
  context: DashboardContext,
  expiresInMs?: number
): DashboardSnapshot

verifySnapshotIntegrity(
  snapshot: DashboardSnapshot,
  evaluationTime: Date
): boolean

evaluateFromSnapshot(
  snapshot: DashboardSnapshot,
  evaluationTime?: Date
): ResolvedDashboard
```

## Dependencies (Read-Only)

This module consumes outputs from existing cores without re-implementing them:

- `webwaka-core-identity` - Subject identity and authentication
- `webwaka-core-permissions` - Permission/capability evaluation
- `webwaka-core-entitlements` - Entitlement snapshots
- `webwaka-core-feature-flags` - Feature flag evaluation
- `webwaka-core-branding` - Tenant/partner branding context

## Invariants

1. **Precedence:** Permissions gate first → Entitlements → Feature Flags
2. **Determinism:** Same inputs → Same output (proven with repeated tests)
3. **Tenant Isolation:** Cross-tenant resolution throws `TenantIsolationError`
4. **Explainability:** Every hidden section includes a reason
5. **Snapshot Integrity:** SHA-256 checksum detects tampering
6. **Offline Safety:** Snapshots evaluate without network access

## Test Coverage

- **Coverage:** 84.73% (≥80% required)
- **Tests:** 33 passing
- All required test scenarios implemented

## Constitutional Compliance

This module is governed by the WebWaka Ecosystem Constitution v1.4 (Ratified).

## Change Policy

All changes to this contract require constitutional review and approval.

## Phase Status

**Phase 4A: COMPLETE**

⛔ Do NOT proceed to UI implementation
⛔ Do NOT implement Super Admin screens
⛔ Await explicit authorization for Phase 4B
