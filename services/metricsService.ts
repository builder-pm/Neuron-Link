import { appSupabase as supabase } from './appSupabase';
import { Metric } from '../types';

/**
 * Saves a metric to the database (creates or updates)
 * 
 * @param metric The metric data to save
 * @param configId The configuration ID this metric belongs to
 * @param isGlobal Whether this is a global metric (stored in metrics_library)
 */
export async function saveMetric(
  metric: Partial<Metric>,
  configId: string,
  isGlobal: boolean = false
): Promise<Metric> {
  const table = isGlobal ? 'metrics_library' : 'model_metrics';

  const data: any = {
    name: metric.name,
    formula: metric.formula,
    description: metric.description || null,
    format: metric.format || 'number',
    required_fields: metric.requiredFields || [],
    aggregation_type: metric.aggregationType || null,
    category: metric.category || null,
    is_global: isGlobal,
  };

  if (table === 'model_metrics') {
    data.config_id = configId;
  }

  if (metric.id) {
    // Update existing
    const { data: updated, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', metric.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update metric:', error);
      throw new Error(`Failed to update metric: ${error.message}`);
    }
    return mapToMetric(updated);
  } else {
    // Create new
    const { data: created, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Failed to create metric:', error);
      throw new Error(`Failed to create metric: ${error.message}`);
    }
    return mapToMetric(created);
  }
}

/**
 * Loads all metrics (global + config-specific)
 * 
 * @param configId The configuration ID to load metrics for
 */
export async function loadMetrics(configId: string): Promise<Metric[]> {
  // Load global metrics from metrics_library
  const { data: globalMetrics, error: globalError } = await supabase
    .from('metrics_library')
    .select('*');

  if (globalError) {
    console.error('Failed to load global metrics:', globalError);
  }

  // Load custom metrics for this config from model_metrics
  const { data: customMetrics, error: customError } = await supabase
    .from('model_metrics')
    .select('*')
    .eq('config_id', configId);

  if (customError) {
    console.error('Failed to load custom metrics:', customError);
  }

  const all = [
    ...(globalMetrics || []).map(mapToMetric),
    ...(customMetrics || []).map(mapToMetric)
  ];

  return all;
}

/**
 * Deletes a metric from the database
 * 
 * @param metricId The ID of the metric to delete
 * @param isGlobal Whether it's a global metric
 */
export async function deleteMetric(
  metricId: string,
  isGlobal: boolean = false
): Promise<void> {
  const table = isGlobal ? 'metrics_library' : 'model_metrics';

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', metricId);

  if (error) {
    console.error('Failed to delete metric:', error);
    throw new Error(`Failed to delete metric: ${error.message}`);
  }
}

/**
 * Maps a database row to the Metric interface
 */
function mapToMetric(row: any): Metric {
  return {
    id: row.id,
    name: row.name,
    formula: row.formula,
    description: row.description,
    format: row.format,
    requiredFields: row.required_fields || [],
    aggregationType: row.aggregation_type,
    category: row.category,
    isGlobal: row.is_global,
    createdAt: row.created_at
  };
}
