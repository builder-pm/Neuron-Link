import { TimeIntelligenceType } from '../types';

/**
 * Configuration for time intelligence transformations.
 */
export interface TimeIntelligenceConfig {
  type: TimeIntelligenceType;
  baseMetricId: string;
  dateField: string; // e.g., "orders.created_at"
  comparisonPeriod?: number; // days for rolling average
}

/**
 * Builds SQL expressions for time intelligence calculations.
 * Generates window function queries for YoY, MoM, YTD, QTD, and rolling averages.
 *
 * @param config - Time intelligence configuration
 * @param baseFormula - Base metric formula to transform (e.g., "SUM(orders.amount)")
 * @returns SQL expression with time intelligence applied
 *
 * @example
 * // Year-over-Year comparison
 * buildTimeIntelligenceSql(
 *   { type: 'YoY', baseMetricId: 'revenue', dateField: 'orders.created_at' },
 *   'SUM(orders.amount)'
 * )
 * // Returns: "SUM(orders.amount) - LAG(SUM(orders.amount)) OVER (ORDER BY YEAR(orders.created_at))"
 */
export function buildTimeIntelligenceSql(
  config: TimeIntelligenceConfig,
  baseFormula: string
): string {
  switch (config.type) {
    case 'YoY':
      // Year-over-Year comparison: current year value minus prior year value
      return `${baseFormula} - LAG(${baseFormula}) OVER (ORDER BY YEAR(${config.dateField}))`;

    case 'MoM':
      // Month-over-Month comparison: current month value minus prior month value
      // Using YEAR*12 + MONTH to create a monotonic ordering for LAG
      return `${baseFormula} - LAG(${baseFormula}) OVER (ORDER BY YEAR(${config.dateField})*12 + MONTH(${config.dateField}))`;

    case 'YTD':
      // Year-to-Date cumulative: running sum within each year
      return `SUM(${baseFormula}) OVER (PARTITION BY YEAR(${config.dateField}) ORDER BY ${config.dateField} ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`;

    case 'QTD':
      // Quarter-to-Date cumulative: running sum within each quarter
      // Using YEAR*4 + QUARTER to partition by unique quarters
      return `SUM(${baseFormula}) OVER (PARTITION BY YEAR(${config.dateField})*4 + QUARTER(${config.dateField}) ORDER BY ${config.dateField} ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`;

    case 'rolling_avg_7d':
      // 7-day rolling average: average of current row and 6 preceding rows
      return `AVG(${baseFormula}) OVER (ORDER BY ${config.dateField} ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`;

    case 'rolling_avg_30d':
      // 30-day rolling average: average of current row and 29 preceding rows
      return `AVG(${baseFormula}) OVER (ORDER BY ${config.dateField} ROWS BETWEEN 29 PRECEDING AND CURRENT ROW)`;

    default:
      // No time intelligence transformation
      return baseFormula;
  }
}

/**
 * Checks if a metric requires time intelligence processing.
 *
 * @param metric - Metric object to check
 * @returns True if metric has time intelligence configuration
 */
export function requiresTimeIntelligence(metric: {
  formula: string;
  timeIntelligence?: any;
}): boolean {
  return !!metric.timeIntelligence;
}

/**
 * Validates that a date field exists in the available fields.
 *
 * @param dateField - Date field to validate (e.g., "orders.created_at")
 * @param availableFields - List of valid field names
 * @returns True if date field is valid
 */
export function validateDateField(
  dateField: string,
  availableFields: string[]
): boolean {
  return availableFields.some(
    (field) => field.toLowerCase() === dateField.toLowerCase()
  );
}

/**
 * Gets a human-readable description of a time intelligence type.
 *
 * @param type - Time intelligence type
 * @returns Description string
 */
export function getTimeIntelligenceDescription(
  type: TimeIntelligenceType
): string {
  switch (type) {
    case 'YoY':
      return 'Year-over-Year comparison (current year vs prior year)';
    case 'MoM':
      return 'Month-over-Month comparison (current month vs prior month)';
    case 'YTD':
      return 'Year-to-Date cumulative total';
    case 'QTD':
      return 'Quarter-to-Date cumulative total';
    case 'rolling_avg_7d':
      return '7-day rolling average';
    case 'rolling_avg_30d':
      return '30-day rolling average';
    default:
      return 'Unknown time intelligence type';
  }
}
