import { RegisteredTable, RegisteredColumn } from '../types';

/**
 * Extracts schema information from a PostgREST/Supabase OpenAPI endpoint.
 */
export async function extractSchema(url: string, anonKey: string): Promise<RegisteredTable[]> {
  // Ensure the URL points to the REST endpoint
  // If URL is just the base Supabase URL, append /rest/v1/
  let restUrl = url;
  if (!url.includes('/rest/v1')) {
    restUrl = url.replace(/\/$/, '') + '/rest/v1/';
  }

  const response = await fetch(restUrl, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
  }

  const spec = await response.json();
  const definitions = spec.definitions || {};
  const tables: RegisteredTable[] = [];

  for (const [tableName, definition] of Object.entries<any>(definitions)) {
    // Skip internal PostgREST definitions if any
    if (tableName.startsWith('_')) continue;

    const properties = definition.properties || {};
    const columns: RegisteredColumn[] = [];

    for (const [colName, colDef] of Object.entries<any>(properties)) {
      const description = colDef.description || '';
      
      // Parse PK/FK from PostgREST description tags
      const isPrimary = description.includes('<pk/>');
      
      let foreignKey;
      // Handle both single and double quotes, and optional spaces
      const fkMatch = description.match(/<fk table=['"]([^'"]+)['"] column=['"]([^'"]+)['"]\s*\/>/i);
      
      if (fkMatch) {
        foreignKey = {
          table: fkMatch[1],
          column: fkMatch[2]
        };
      }

      columns.push({
        name: colName,
        type: colDef.format || colDef.type || 'text',
        isPrimary,
        foreignKey
      });
    }

    tables.push({
      name: tableName,
      columns,
      description: (definition.description || '').split('<')[0].trim() || undefined // Strip tags from description
    });
  }

  return tables;
}

/**
 * Generates a SHA-256 hash of the normalized DB URL.
 */
export async function hashDbUrl(url: string): Promise<string> {
  const normalized = url.replace(/\/$/, '').toLowerCase();
  const msgUint8 = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a hash of the schema structure for drift detection.
 */
export function hashSchema(tables: RegisteredTable[]): string {
  // Create a stable representation for hashing
  const schemaStr = JSON.stringify(tables.map(t => ({
    n: t.name,
    c: t.columns.map(c => ({ n: c.name, t: c.type, p: c.isPrimary, f: c.foreignKey }))
  })).sort((a, b) => a.n.localeCompare(b.n)));
  
  // Simple hash for drift detection
  let hash = 0;
  for (let i = 0; i < schemaStr.length; i++) {
    const char = schemaStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(16);
}
