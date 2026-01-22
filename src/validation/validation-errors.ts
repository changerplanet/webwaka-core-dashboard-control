/**
 * Phase 4E-3: Dashboard Declaration Validation Errors
 * 
 * Explicit, typed errors for dashboard declaration validation failures.
 * These errors are thrown when declarations violate authoring-time rules.
 */

/**
 * Base error for dashboard declaration validation failures
 */
export class InvalidDashboardDeclarationError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'InvalidDashboardDeclarationError';
  }
}

/**
 * Error thrown when a declaration contains unknown fields
 * 
 * This enforces the closed schema requirement - only explicitly
 * allowed fields are permitted.
 */
export class UnknownDeclarationFieldError extends Error {
  constructor(
    message: string,
    public readonly fieldPath: string,
    public readonly fieldName: string
  ) {
    super(message);
    this.name = 'UnknownDeclarationFieldError';
  }
}

/**
 * Error thrown when a section declaration is invalid
 * 
 * This covers structural issues with individual sections,
 * such as missing required fields or invalid field types.
 */
export class InvalidSectionDeclarationError extends Error {
  constructor(
    message: string,
    public readonly sectionId?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'InvalidSectionDeclarationError';
  }
}

/**
 * Error thrown when the declaration version is invalid or missing
 * 
 * Version is mandatory for traceability and snapshot identity.
 */
export class InvalidDeclarationVersionError extends Error {
  constructor(message: string, public readonly providedVersion?: unknown) {
    super(message);
    this.name = 'InvalidDeclarationVersionError';
  }
}

/**
 * Error thrown when forbidden structures are detected
 * 
 * This includes:
 * - Functions / lambdas
 * - Dates
 * - Promises
 * - Non-plain objects
 * - Runtime values
 * - Embedded logic
 */
export class ForbiddenStructureError extends Error {
  constructor(
    message: string,
    public readonly structureType: string,
    public readonly path: string
  ) {
    super(message);
    this.name = 'ForbiddenStructureError';
  }
}
