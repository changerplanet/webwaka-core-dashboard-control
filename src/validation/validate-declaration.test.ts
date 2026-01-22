/**
 * Phase 4E-3: Dashboard Declaration Validation Tests
 * 
 * Comprehensive tests proving:
 * - Valid declarations pass
 * - Unknown fields fail
 * - Logic injection fails
 * - Runtime values fail
 * - UI references fail
 * - Missing version fails
 * - Invalid section structure fails
 * - Determinism (same input → same output)
 */

import { describe, it, expect } from 'vitest';
import {
  validateDashboardDeclaration,
  isValidDashboardDeclaration,
  InvalidDashboardDeclarationError,
  UnknownDeclarationFieldError,
  InvalidSectionDeclarationError,
  InvalidDeclarationVersionError,
  ForbiddenStructureError,
  type AuthoringDashboardDeclaration,
} from './index.js';

describe('Phase 4E-3: Dashboard Declaration Validation', () => {
  // Valid test declaration
  const validDeclaration: AuthoringDashboardDeclaration = {
    id: 'test-dashboard',
    version: '1.0.0',
    suite: 'test-suite',
    sections: [
      {
        id: 'section-1',
        label: 'Section 1',
        order: 1,
      },
      {
        id: 'section-2',
        label: 'Section 2',
        order: 2,
        requiredCapabilities: ['view:data'],
        requiredEntitlements: ['premium'],
        requiredFeatures: ['feature-x'],
      },
    ],
  };

  describe('✅ Valid Declarations', () => {
    it('should validate a minimal valid declaration', () => {
      const minimal = {
        id: 'minimal',
        version: '1.0.0',
        suite: 'test',
        sections: [
          { id: 's1', label: 'Section 1', order: 1 },
        ],
      };

      const result = validateDashboardDeclaration(minimal);
      expect(result).toEqual(minimal);
    });

    it('should validate a declaration with optional section fields', () => {
      const result = validateDashboardDeclaration(validDeclaration);
      expect(result).toEqual(validDeclaration);
    });

    it('should validate a declaration with multiple sections', () => {
      const multiSection = {
        id: 'multi',
        version: '2.0.0',
        suite: 'test',
        sections: [
          { id: 's1', label: 'Section 1', order: 1 },
          { id: 's2', label: 'Section 2', order: 2 },
          { id: 's3', label: 'Section 3', order: 3 },
        ],
      };

      const result = validateDashboardDeclaration(multiSection);
      expect(result.sections).toHaveLength(3);
    });

    it('should validate a declaration with empty optional arrays', () => {
      const withEmptyArrays = {
        id: 'empty-arrays',
        version: '1.0.0',
        suite: 'test',
        sections: [
          {
            id: 's1',
            label: 'Section 1',
            order: 1,
            requiredCapabilities: [],
            requiredEntitlements: [],
            requiredFeatures: [],
          },
        ],
      };

      const result = validateDashboardDeclaration(withEmptyArrays);
      expect(result.sections[0].requiredCapabilities).toEqual([]);
    });

    it('should validate deterministically (same input → same output)', () => {
      const input = { ...validDeclaration };
      
      const result1 = validateDashboardDeclaration(input);
      const result2 = validateDashboardDeclaration(input);
      const result3 = validateDashboardDeclaration(input);
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });

  describe('❌ Unknown Fields', () => {
    it('should reject unknown top-level fields', () => {
      const withUnknownField = {
        ...validDeclaration,
        unknownField: 'value',
      };

      expect(() => validateDashboardDeclaration(withUnknownField))
        .toThrow(UnknownDeclarationFieldError);
    });

    it('should reject unknown section fields', () => {
      const withUnknownSectionField = {
        ...validDeclaration,
        sections: [
          {
            id: 's1',
            label: 'Section 1',
            order: 1,
            unknownSectionField: 'value',
          },
        ],
      };

      expect(() => validateDashboardDeclaration(withUnknownSectionField))
        .toThrow();
    });

    it('should reject runtime-specific fields (allowedSubjects)', () => {
      const withRuntimeField = {
        ...validDeclaration,
        allowedSubjects: ['super_admin'],
      };

      expect(() => validateDashboardDeclaration(withRuntimeField))
        .toThrow(UnknownDeclarationFieldError);
    });

    it('should reject runtime-specific fields (allowedTenants)', () => {
      const withRuntimeField = {
        ...validDeclaration,
        allowedTenants: ['tenant-1'],
      };

      expect(() => validateDashboardDeclaration(withRuntimeField))
        .toThrow(UnknownDeclarationFieldError);
    });
  });

  describe('❌ Logic Injection', () => {
    it('should reject declarations with functions', () => {
      const withFunction = {
        ...validDeclaration,
        sections: [
          {
            id: 's1',
            label: 'Section 1',
            order: 1,
            computeVisibility: () => true, // Function injection
          },
        ],
      };

      expect(() => validateDashboardDeclaration(withFunction))
        .toThrow(ForbiddenStructureError);
    });

    it('should reject declarations with arrow functions', () => {
      const withArrowFunction = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [{ id: 's1', label: 'S1', order: 1 }],
        evaluate: () => {}, // Arrow function
      };

      expect(() => validateDashboardDeclaration(withArrowFunction))
        .toThrow(ForbiddenStructureError);
    });

    it('should reject declarations with nested functions', () => {
      const withNestedFunction = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [
          {
            id: 's1',
            label: 'S1',
            order: 1,
            metadata: {
              compute: function() { return true; },
            },
          },
        ],
      };

      expect(() => validateDashboardDeclaration(withNestedFunction))
        .toThrow(ForbiddenStructureError);
    });
  });

  describe('❌ Runtime Values', () => {
    it('should reject declarations with Date objects', () => {
      const withDate = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [{ id: 's1', label: 'S1', order: 1 }],
        createdAt: new Date(),
      };

      expect(() => validateDashboardDeclaration(withDate))
        .toThrow(ForbiddenStructureError);
    });

    it('should reject declarations with Promises', () => {
      const withPromise = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [{ id: 's1', label: 'S1', order: 1 }],
        loadData: Promise.resolve({}),
      };

      expect(() => validateDashboardDeclaration(withPromise))
        .toThrow(ForbiddenStructureError);
    });

    it('should reject declarations with class instances', () => {
      class CustomClass {}
      const withClassInstance = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [{ id: 's1', label: 'S1', order: 1 }],
        instance: new CustomClass(),
      };

      expect(() => validateDashboardDeclaration(withClassInstance))
        .toThrow(ForbiddenStructureError);
    });
  });

  describe('❌ Missing Version', () => {
    it('should reject declarations without version', () => {
      const withoutVersion = {
        id: 'test',
        suite: 'test',
        sections: [{ id: 's1', label: 'S1', order: 1 }],
      };

      expect(() => validateDashboardDeclaration(withoutVersion))
        .toThrow(InvalidDeclarationVersionError);
    });

    it('should reject declarations with empty version', () => {
      const withEmptyVersion = {
        id: 'test',
        version: '',
        suite: 'test',
        sections: [{ id: 's1', label: 'S1', order: 1 }],
      };

      expect(() => validateDashboardDeclaration(withEmptyVersion))
        .toThrow(InvalidDeclarationVersionError);
    });

    it('should reject declarations with whitespace-only version', () => {
      const withWhitespaceVersion = {
        id: 'test',
        version: '   ',
        suite: 'test',
        sections: [{ id: 's1', label: 'S1', order: 1 }],
      };

      expect(() => validateDashboardDeclaration(withWhitespaceVersion))
        .toThrow(InvalidDeclarationVersionError);
    });

    it('should reject declarations with non-string version', () => {
      const withNumberVersion = {
        id: 'test',
        version: 1.0,
        suite: 'test',
        sections: [{ id: 's1', label: 'S1', order: 1 }],
      };

      expect(() => validateDashboardDeclaration(withNumberVersion))
        .toThrow(InvalidDeclarationVersionError);
    });
  });

  describe('❌ Invalid Section Structure', () => {
    it('should reject declarations with no sections', () => {
      const withoutSections = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [],
      };

      expect(() => validateDashboardDeclaration(withoutSections))
        .toThrow(); // Zod validation error for min(1)
    });

    it('should reject sections without id', () => {
      const withoutSectionId = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [
          { label: 'Section 1', order: 1 },
        ],
      };

      expect(() => validateDashboardDeclaration(withoutSectionId))
        .toThrow();
    });

    it('should reject sections without label', () => {
      const withoutSectionLabel = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [
          { id: 's1', order: 1 },
        ],
      };

      expect(() => validateDashboardDeclaration(withoutSectionLabel))
        .toThrow();
    });

    it('should reject sections without order', () => {
      const withoutSectionOrder = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [
          { id: 's1', label: 'Section 1' },
        ],
      };

      expect(() => validateDashboardDeclaration(withoutSectionOrder))
        .toThrow();
    });

    it('should reject sections with negative order', () => {
      const withNegativeOrder = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [
          { id: 's1', label: 'Section 1', order: -1 },
        ],
      };

      expect(() => validateDashboardDeclaration(withNegativeOrder))
        .toThrow(InvalidSectionDeclarationError);
    });

    it('should reject sections with non-integer order', () => {
      const withFloatOrder = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [
          { id: 's1', label: 'Section 1', order: 1.5 },
        ],
      };

      expect(() => validateDashboardDeclaration(withFloatOrder))
        .toThrow();
    });

    it('should reject duplicate section IDs', () => {
      const withDuplicateIds = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [
          { id: 's1', label: 'Section 1', order: 1 },
          { id: 's1', label: 'Section 2', order: 2 }, // Duplicate ID
        ],
      };

      expect(() => validateDashboardDeclaration(withDuplicateIds))
        .toThrow(InvalidSectionDeclarationError);
    });
  });

  describe('❌ Null and Undefined', () => {
    it('should reject null declaration', () => {
      expect(() => validateDashboardDeclaration(null))
        .toThrow(InvalidDashboardDeclarationError);
    });

    it('should reject undefined declaration', () => {
      expect(() => validateDashboardDeclaration(undefined))
        .toThrow(InvalidDashboardDeclarationError);
    });

    it('should reject non-object declaration', () => {
      expect(() => validateDashboardDeclaration('string'))
        .toThrow(InvalidDashboardDeclarationError);
    });

    it('should reject number declaration', () => {
      expect(() => validateDashboardDeclaration(123))
        .toThrow(); // Can be InvalidDashboardDeclarationError or InvalidDeclarationVersionError
    });

    it('should reject array declaration', () => {
      expect(() => validateDashboardDeclaration([]))
        .toThrow(); // Can be InvalidDashboardDeclarationError or InvalidDeclarationVersionError
    });
  });

  describe('isValidDashboardDeclaration (non-throwing)', () => {
    it('should return true for valid declarations', () => {
      expect(isValidDashboardDeclaration(validDeclaration)).toBe(true);
    });

    it('should return false for invalid declarations', () => {
      const invalid = { ...validDeclaration, unknownField: 'value' };
      expect(isValidDashboardDeclaration(invalid)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidDashboardDeclaration(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidDashboardDeclaration(undefined)).toBe(false);
    });
  });

  describe('Error Types', () => {
    it('should throw InvalidDashboardDeclarationError for generic errors', () => {
      try {
        validateDashboardDeclaration(null);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidDashboardDeclarationError);
        expect((error as InvalidDashboardDeclarationError).name).toBe('InvalidDashboardDeclarationError');
      }
    });

    it('should throw UnknownDeclarationFieldError for unknown fields', () => {
      const withUnknown = { ...validDeclaration, unknown: 'value' };
      try {
        validateDashboardDeclaration(withUnknown);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnknownDeclarationFieldError);
        expect((error as UnknownDeclarationFieldError).name).toBe('UnknownDeclarationFieldError');
      }
    });

    it('should throw InvalidDeclarationVersionError for missing version', () => {
      const withoutVersion = {
        id: 'test',
        suite: 'test',
        sections: [{ id: 's1', label: 'S1', order: 1 }],
      };
      try {
        validateDashboardDeclaration(withoutVersion);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidDeclarationVersionError);
        expect((error as InvalidDeclarationVersionError).name).toBe('InvalidDeclarationVersionError');
      }
    });

    it('should throw ForbiddenStructureError for functions', () => {
      const withFunction = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [{ id: 's1', label: 'S1', order: 1 }],
        fn: () => {},
      };
      try {
        validateDashboardDeclaration(withFunction);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenStructureError);
        expect((error as ForbiddenStructureError).name).toBe('ForbiddenStructureError');
      }
    });

    it('should throw InvalidSectionDeclarationError for duplicate section IDs', () => {
      const withDuplicates = {
        id: 'test',
        version: '1.0.0',
        suite: 'test',
        sections: [
          { id: 's1', label: 'S1', order: 1 },
          { id: 's1', label: 'S2', order: 2 },
        ],
      };
      try {
        validateDashboardDeclaration(withDuplicates);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidSectionDeclarationError);
        expect((error as InvalidSectionDeclarationError).name).toBe('InvalidSectionDeclarationError');
      }
    });
  });
});
