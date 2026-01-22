/**
 * Phase 4E-3: Dashboard Declaration Authoring Schema
 * 
 * This schema validates dashboard declarations at AUTHORING TIME,
 * not at runtime. It enforces strict structural correctness and
 * prevents invalid declarations from being created.
 * 
 * This is a GUARDRAIL layer that exists alongside the runtime
 * DashboardDeclarationSchema (Phase 4A). They serve different purposes:
 * 
 * - AuthoringDashboardDeclarationSchema (Phase 4E): Authoring-time validation
 * - DashboardDeclarationSchema (Phase 4A): Runtime resolution contract
 * 
 * Flow:
 * Authoring Declaration
 *   ↓ (Phase 4E validation)
 * Validated Authoring Declaration
 *   ↓ (compile / transform)
 * Runtime DashboardDeclaration (Phase 4A)
 *   ↓
 * resolveDashboard(...)
 */

import { z } from 'zod';

/**
 * Authoring-time section declaration
 * 
 * Describes a single section in a dashboard at authoring time.
 * This is stricter than runtime sections - it only allows
 * explicit structural fields, no logic, no runtime values.
 */
export const AuthoringSectionDeclarationSchema = z.object({
  id: z.string().min(1, 'Section id is required'),
  label: z.string().min(1, 'Section label is required'),
  order: z.number().int().nonnegative(),
  requiredCapabilities: z.array(z.string()).optional(),
  requiredEntitlements: z.array(z.string()).optional(),
  requiredFeatures: z.array(z.string()).optional(),
}).strict(); // .strict() rejects unknown keys

export type AuthoringSectionDeclaration = z.infer<typeof AuthoringSectionDeclarationSchema>;

/**
 * Authoring-time dashboard declaration
 * 
 * Describes a dashboard at authoring time.
 * This is the canonical structure for dashboard declarations
 * before they are compiled/transformed for runtime use.
 * 
 * Allowed fields ONLY:
 * - id: Dashboard identifier
 * - version: Explicit version (required for traceability)
 * - suite: Suite identifier (e.g., 'superadmin', 'partner', 'tenant')
 * - sections: Array of section declarations
 * 
 * Explicitly FORBIDDEN (validation will fail):
 * - Functions / lambdas
 * - Conditionals
 * - Dates
 * - Runtime values
 * - Callbacks
 * - Embedded logic
 * - JSX / React / UI references
 * - Permissions logic
 * - Feature flag evaluation
 * - Entitlement evaluation
 * - Arbitrary metadata blobs
 * - Unknown keys at any depth
 */
export const AuthoringDashboardDeclarationSchema = z.object({
  id: z.string().min(1, 'Dashboard id is required'),
  version: z.string().min(1, 'Dashboard version is required'),
  suite: z.string().min(1, 'Dashboard suite is required'),
  sections: z.array(AuthoringSectionDeclarationSchema).min(1, 'At least one section is required'),
}).strict(); // .strict() rejects unknown keys

export type AuthoringDashboardDeclaration = z.infer<typeof AuthoringDashboardDeclarationSchema>;

/**
 * Validate that a value is a plain object (not a function, Date, etc.)
 * 
 * This is used to detect forbidden structures like:
 * - Functions
 * - Dates
 * - Classes
 * - Promises
 * - etc.
 */
export function isPlainObject(value: unknown): boolean {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  
  // Check for Date, Function, Promise, etc.
  if (value instanceof Date) return false;
  if (value instanceof Promise) return false;
  if (typeof value === 'function') return false;
  
  // Check constructor
  const proto = Object.getPrototypeOf(value);
  if (proto === null) return true; // Object.create(null)
  
  return proto === Object.prototype;
}

/**
 * Deep validation to detect forbidden structures
 * 
 * Recursively checks for:
 * - Functions
 * - Dates
 * - Non-plain objects
 * - Runtime values
 */
export function detectForbiddenStructures(value: unknown, path: string = 'root'): string | null {
  // Check for functions
  if (typeof value === 'function') {
    return `Forbidden: Function found at ${path}`;
  }
  
  // Check for Dates
  if (value instanceof Date) {
    return `Forbidden: Date found at ${path}`;
  }
  
  // Check for Promises
  if (value instanceof Promise) {
    return `Forbidden: Promise found at ${path}`;
  }
  
  // Check for arrays
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const result = detectForbiddenStructures(value[i], `${path}[${i}]`);
      if (result) return result;
    }
    return null;
  }
  
  // Check for objects
  if (typeof value === 'object' && value !== null) {
    if (!isPlainObject(value)) {
      return `Forbidden: Non-plain object found at ${path}`;
    }
    
    for (const [key, val] of Object.entries(value)) {
      const result = detectForbiddenStructures(val, `${path}.${key}`);
      if (result) return result;
    }
  }
  
  return null;
}
