# WebWaka Core Dashboard Control

## Overview
Phase 4A implementation of the WebWaka Modular Rebuild - a headless TypeScript library that provides the Dashboard Control Model. This is the single authoritative logic layer that determines which dashboards exist, which menus/sections appear, why they appear, and for whom.

## Project Structure
```
src/
├── index.ts              # Main exports
├── models/
│   ├── index.ts          # Model exports
│   ├── schemas.ts        # Zod-validated domain models
│   └── schemas.test.ts   # Model tests
└── engine/
    ├── index.ts          # Engine exports
    ├── resolver.ts       # Dashboard resolution logic
    ├── resolver.test.ts  # Resolution tests
    ├── snapshot.ts       # Snapshot generation/verification
    └── snapshot.test.ts  # Snapshot tests
```

## Key Features
- **Zod-validated domain models**: DashboardDeclaration, DashboardSection, DashboardContext, ResolvedDashboard, DashboardSnapshot
- **Pure resolution engine**: Deterministic dashboard resolution based on permissions, entitlements, and feature flags
- **Snapshot system**: Generate, verify, and evaluate offline-safe dashboard snapshots
- **Explainable results**: Every hidden section includes a reason

## Capabilities
- `dashboard:resolve` - Resolve dashboard declarations
- `dashboard:snapshot.generate` - Generate verifiable snapshots
- `dashboard:snapshot.verify` - Verify snapshot integrity

## Running Tests
```bash
npm test              # Run tests
npm run test:coverage # Run with coverage report
npm run build         # Compile TypeScript
```

## Constitutional Dependencies (Read-Only)
- webwaka-core-identity
- webwaka-core-permissions
- webwaka-core-entitlements
- webwaka-core-feature-flags
- webwaka-core-branding

## Phase Status
**Phase 4A: COMPLETE** - Awaiting authorization for Phase 4B
