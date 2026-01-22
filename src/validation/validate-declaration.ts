/**
 * Phase 4E-3: Dashboard Declaration Validation Function
 * 
 * Canonical validation function for dashboard declarations.
 * This is the single entry point for validating authoring-time declarations.
 */

import { ZodError } from 'zod';
import {
  AuthoringDashboardDeclarationSchema,
  type AuthoringDashboardDeclaration,
  detectForbiddenStructures,
} from './authoring-schema.js';
import {
  InvalidDashboardDeclarationError,
  UnknownDeclarationFieldError,
  InvalidSectionDeclarationError,
  InvalidDeclarationVersionError,
  ForbiddenStructureError,
} from './validation-errors.js';

/**
 * Validate a dashboard declaration at authoring time
 * 
 * This function enforces strict validation rules:
 * - Only explicitly allowed fields are permitted
 * - No functions, dates, or runtime values
 * - No embedded logic or conditionals
 * - Version is mandatory
 * - All sections must be valid
 * 
 * @param declaration - The declaration to validate (unknown type for safety)
 * @returns A fully validated AuthoringDashboardDeclaration
 * @throws InvalidDashboardDeclarationError - If validation fails
 * @throws UnknownDeclarationFieldError - If unknown fields are present
 * @throws InvalidSectionDeclarationError - If a section is invalid
 * @throws InvalidDeclarationVersionError - If version is missing or invalid
 * @throws ForbiddenStructureError - If forbidden structures are detected
 * 
 * @example
 * ```typescript
 * const declaration = {
 *   id: 'superadmin-dashboard',
 *   version: '1.0.0',
 *   suite: 'superadmin',
 *   sections: [
 *     { id: 'overview', label: 'Overview', order: 1 }
 *   ]
 * };
 * 
 * const validated = validateDashboardDeclaration(declaration);
 * // validated is now guaranteed to be correct
 * ```
 */
export function validateDashboardDeclaration(
  declaration: unknown
): AuthoringDashboardDeclaration {
  // Step 1: Check for null/undefined
  if (declaration === null || declaration === undefined) {
    throw new InvalidDashboardDeclarationError(
      'Dashboard declaration cannot be null or undefined'
    );
  }

  // Step 2: Check for non-object types
  if (typeof declaration !== 'object') {
    throw new InvalidDashboardDeclarationError(
      `Dashboard declaration must be an object, got ${typeof declaration}`
    );
  }

  // Step 3: Detect forbidden structures (functions, dates, etc.)
  const forbiddenCheck = detectForbiddenStructures(declaration);
  if (forbiddenCheck) {
    const match = forbiddenCheck.match(/^Forbidden: (.+?) found at (.+)$/);
    if (match) {
      throw new ForbiddenStructureError(
        forbiddenCheck,
        match[1],
        match[2]
      );
    }
    throw new ForbiddenStructureError(
      forbiddenCheck,
      'unknown',
      'unknown'
    );
  }

  // Step 4: Check for version field explicitly (before Zod validation)
  const declObj = declaration as Record<string, unknown>;
  if (!declObj.version) {
    throw new InvalidDeclarationVersionError(
      'Dashboard declaration must have a version field',
      declObj.version
    );
  }

  if (typeof declObj.version !== 'string' || declObj.version.trim() === '') {
    throw new InvalidDeclarationVersionError(
      'Dashboard version must be a non-empty string',
      declObj.version
    );
  }

  // Step 5: Run Zod schema validation
  let validatedDeclaration: AuthoringDashboardDeclaration;
  try {
    validatedDeclaration = AuthoringDashboardDeclarationSchema.parse(declaration);
  } catch (error) {
    if (error instanceof ZodError) {
      // Parse Zod errors to provide better error messages
      const firstIssue = error.issues[0];
      
      // Check for unknown keys (strict mode violation)
      if (firstIssue.code === 'unrecognized_keys') {
        const unknownKeys = (firstIssue as any).keys as string[];
        throw new UnknownDeclarationFieldError(
          `Unknown field(s) in dashboard declaration: ${unknownKeys.join(', ')}`,
          firstIssue.path.join('.'),
          unknownKeys[0]
        );
      }

      // Check for section-level errors
      if (firstIssue.path.includes('sections')) {
        const sectionIndex = firstIssue.path.indexOf('sections') + 1;
        const sectionId = firstIssue.path[sectionIndex];
        throw new InvalidSectionDeclarationError(
          `Invalid section at index ${sectionId}: ${firstIssue.message}`,
          typeof sectionId === 'number' ? String(sectionId) : undefined,
          firstIssue
        );
      }

      // Check for version errors
      if (firstIssue.path.includes('version')) {
        throw new InvalidDeclarationVersionError(
          `Invalid version: ${firstIssue.message}`,
          declObj.version
        );
      }

      // Generic validation error
      throw new InvalidDashboardDeclarationError(
        `Dashboard declaration validation failed: ${firstIssue.message}`,
        error.issues
      );
    }

    // Re-throw non-Zod errors
    throw error;
  }

  // Step 6: Additional validation for sections
  const sectionIds = new Set<string>();
  for (let i = 0; i < validatedDeclaration.sections.length; i++) {
    const section = validatedDeclaration.sections[i];
    
    // Check for duplicate section IDs
    if (sectionIds.has(section.id)) {
      throw new InvalidSectionDeclarationError(
        `Duplicate section id: ${section.id}`,
        section.id
      );
    }
    sectionIds.add(section.id);

    // Check for negative order
    if (section.order < 0) {
      throw new InvalidSectionDeclarationError(
        `Section order must be non-negative, got ${section.order} for section ${section.id}`,
        section.id
      );
    }
  }

  // Step 7: Return validated declaration
  return validatedDeclaration;
}

/**
 * Check if a value is a valid dashboard declaration without throwing
 * 
 * This is a non-throwing variant of validateDashboardDeclaration
 * that returns a boolean instead of throwing errors.
 * 
 * @param declaration - The declaration to check
 * @returns true if valid, false otherwise
 */
export function isValidDashboardDeclaration(declaration: unknown): boolean {
  try {
    validateDashboardDeclaration(declaration);
    return true;
  } catch {
    return false;
  }
}
