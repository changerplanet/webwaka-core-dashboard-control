/**
 * Phase 4E-3: Dashboard Declaration Validation
 * 
 * Public API for authoring-time dashboard declaration validation.
 */

export {
  AuthoringDashboardDeclarationSchema,
  AuthoringSectionDeclarationSchema,
  type AuthoringDashboardDeclaration,
  type AuthoringSectionDeclaration,
} from './authoring-schema.js';

export {
  InvalidDashboardDeclarationError,
  UnknownDeclarationFieldError,
  InvalidSectionDeclarationError,
  InvalidDeclarationVersionError,
  ForbiddenStructureError,
} from './validation-errors.js';

export {
  validateDashboardDeclaration,
  isValidDashboardDeclaration,
} from './validate-declaration.js';
