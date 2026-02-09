/**
 * Extracts field names from a formula string using regex pattern matching.
 * Filters out SQL keywords and validates against available fields.
 *
 * @param formula - Formula string to analyze (e.g., "SUM(sales) - SUM(cost)")
 * @param availableFields - List of valid field names to match against
 * @returns Array of unique field names found in the formula
 */
export function extractRequiredFields(formula: string, availableFields: string[]): string[] {
  // Return empty if no available fields to match against
  if (!availableFields || availableFields.length === 0) {
    return [];
  }

  // SQL keywords to exclude from field matching
  const SQL_KEYWORDS = new Set([
    'SUM', 'COUNT', 'AVG', 'MIN', 'MAX', 'COUNT_DISTINCT',
    'IF', 'AND', 'OR', 'NOT', 'AS', 'FROM', 'WHERE',
    'GROUP', 'ORDER', 'BY', 'HAVING', 'DISTINCT',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'SELECT', 'INSERT', 'UPDATE', 'DELETE',
    'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON',
    'BETWEEN', 'IN', 'LIKE', 'IS', 'NULL',
    'TRUE', 'FALSE', 'YEAR', 'MONTH', 'DAY',
    'LAG', 'OVER', 'PARTITION', 'ROWS', 'PRECEDING',
    'FOLLOWING', 'CURRENT', 'ROW', 'YEAR_MONTH',
  ]);

  // Match field patterns: word characters, underscores, dots (for table.field)
  const fieldPattern = /\b([a-zA-Z_][a-zA-Z0-9_.]*)\b/g;
  const matches = formula.match(fieldPattern) || [];

  // Filter matches
  const foundFields = new Set<string>();

  for (const match of matches) {
    const upperMatch = match.toUpperCase();

    // Skip SQL keywords
    if (SQL_KEYWORDS.has(upperMatch)) {
      continue;
    }

    // Check if it matches an available field (exact match, case-insensitive)
    const matchingField = availableFields.find(
      field => field.toLowerCase() === match.toLowerCase()
    );

    if (matchingField) {
      foundFields.add(matchingField);
    }
  }

  return Array.from(foundFields);
}
