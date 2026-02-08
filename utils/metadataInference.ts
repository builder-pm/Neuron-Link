import { SemanticDataType } from '../types';

/**
 * Infers the semantic data type based on the field name.
 * Heuristics used for ~90% accuracy as per research.
 */
export const inferDataType = (fieldName: string): SemanticDataType => {
    const name = fieldName.toLowerCase();

    // Identifiers
    if (
        name.endsWith('_id') || 
        name === 'id' || 
        name.endsWith('_key') || 
        name === 'uuid' || 
        name.endsWith('_code') ||
        name === 'pk' ||
        name === 'fk'
    ) {
        return 'identifier';
    }

    // Dates
    if (
        name.includes('date') || 
        name.includes('time') || 
        name.includes('created') || 
        name.includes('updated') || 
        name.includes('timestamp') ||
        name.endsWith('_at') ||
        name.startsWith('dt_')
    ) {
        return 'date';
    }

    // Measures (Quantitative)
    if (
        name.includes('amount') || 
        name.includes('price') || 
        name.includes('total') || 
        name.includes('sum') || 
        name.includes('revenue') ||
        name.includes('quantity') ||
        name.includes('sales') ||
        name.includes('cost') ||
        name.startsWith('amt_') ||
        name.startsWith('val_')
    ) {
        return 'measure';
    }

    // Boolean
    if (
        name.startsWith('is_') || 
        name.startsWith('has_') || 
        name.startsWith('can_') ||
        name.startsWith('should_')
    ) {
        return 'boolean';
    }

    // Text / Description
    if (
        name.includes('description') || 
        name.includes('comment') || 
        name.includes('text') || 
        name.includes('note') ||
        name === 'name' ||
        name.endsWith('_name')
    ) {
        return 'text';
    }

    // Default to dimension for categorical or unknown
    return 'dimension';
};
