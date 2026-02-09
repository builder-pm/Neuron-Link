import FormulaParser from 'fast-formula-parser';
import { extractRequiredFields } from './requiredFieldsExtractor';

export interface ParsedFormula {
  isValid: boolean;
  error?: string;
  formula: string;
  requiredFields: string[];
}

/**
 * Parses and validates a formula string using fast-formula-parser.
 * Extracts required field names and returns validation status.
 *
 * @param formula - Formula string to parse (e.g., "SUM(sales) - SUM(cost)")
 * @param availableFields - List of valid field names for extraction
 * @returns ParsedFormula with validation status, errors, and required fields
 */
export function parseFormula(formula: string, availableFields: string[]): ParsedFormula {
  // Handle empty formula
  if (!formula || formula.trim() === '') {
    return {
      isValid: false,
      error: 'Formula cannot be empty',
      formula: formula || '',
      requiredFields: [],
    };
  }

  try {
    // Initialize parser
    const parser = new FormulaParser();

    // Extract required fields from the formula first
    const requiredFields = extractRequiredFields(formula, availableFields);

    // For SQL-style formulas, we perform basic validation
    // Check for balanced parentheses
    let parenCount = 0;
    for (const char of formula) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (parenCount < 0) {
        return {
          isValid: false,
          error: 'Unbalanced parentheses: closing parenthesis without opening',
          formula,
          requiredFields: [],
        };
      }
    }
    if (parenCount !== 0) {
      return {
        isValid: false,
        error: 'Unbalanced parentheses: unclosed opening parenthesis',
        formula,
        requiredFields: [],
      };
    }

    // Check for basic SQL function syntax patterns
    const sqlFunctionPattern = /\b(SUM|COUNT|AVG|MIN|MAX|COUNT_DISTINCT)\s*\(/i;
    const hasValidSqlFunction = sqlFunctionPattern.test(formula);

    // Check for valid arithmetic/comparison operators
    const hasValidOperators = /[\+\-\*\/\(\)<>=]/.test(formula) || formula.trim().match(/^\w+$/);

    // If it looks like a SQL formula (has functions or operators), consider it valid
    if (hasValidSqlFunction || hasValidOperators || requiredFields.length > 0) {
      return {
        isValid: true,
        formula,
        requiredFields,
      };
    }

    // Try parsing with fast-formula-parser as fallback (for Excel-style formulas)
    const result = parser.parse(formula);

    // Check if parsing resulted in an error
    if (result.error) {
      return {
        isValid: false,
        error: result.error,
        formula,
        requiredFields: [],
      };
    }

    return {
      isValid: true,
      formula,
      requiredFields,
    };
  } catch (error: any) {
    // Catch any unexpected parsing errors
    return {
      isValid: false,
      error: error.message || 'Failed to parse formula',
      formula,
      requiredFields: [],
    };
  }
}
